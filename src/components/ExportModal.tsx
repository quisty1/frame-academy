import { useEffect, useRef, useState } from 'react';
import { Download, CheckCircle2, AlertCircle, Monitor, LoaderCircle } from 'lucide-react';
import type { Project } from '../lib/project';
import { dimensions, totalFrames, FPS } from '../lib/project';
import { Modal } from './UI';
type Job = {
  id: string;
  status: 'queued' | 'bundling' | 'rendering' | 'done' | 'error';
  progress: number;
  url?: string;
  error?: string;
};
export function ExportModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [quality, setQuality] = useState('1080');
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef(new AbortController());
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('frame:last-render') || 'null');
      if (saved?.fingerprint === JSON.stringify(project)) {
        setBusy(true);
        void poll(saved.id);
      }
    } catch {
      /* A blocked session store does not prevent rendering. */
    }
    return () => {
      abort.current.abort();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  async function poll(id: string) {
    try {
      const r = await fetch(`/api/renders/${id}`, { signal: abort.current.signal });
      if (!r.ok) throw new Error('Не удалось получить состояние экспорта.');
      const next: Job = await r.json();
      setJob(next);
      if (next.status === 'done' || next.status === 'error') {
        setBusy(false);
        return;
      }
      timer.current = setTimeout(() => void poll(id), 900);
    } catch (e) {
      if (!abort.current.signal.aborted) {
        setError(e instanceof Error ? e.message : 'Ошибка соединения');
        setBusy(false);
      }
    }
  }
  async function render() {
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/renders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, scale: quality === '1080' ? 1 : 2 / 3 }),
      });
      const text = await r.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Сервер рендера недоступен. Запустите проект командой npm run dev.');
      }
      if (!r.ok) throw new Error(data.error || 'Не удалось запустить экспорт');
      setJob(data);
      try {
        sessionStorage.setItem(
          'frame:last-render',
          JSON.stringify({ id: data.id, fingerprint: JSON.stringify(project) }),
        );
      } catch {
        /* Rendering works without browser persistence. */
      }
      if (!abort.current.signal.aborted) void poll(data.id);
    } catch (e) {
      if (!abort.current.signal.aborted) {
        setError(e instanceof Error ? e.message : 'Ошибка экспорта');
        setBusy(false);
      }
    }
  }
  return (
    <Modal title="Экспорт видео" onClose={onClose}>
      <div className="export-summary">
        <span>
          <Monitor size={15} />{' '}
          {project.format === 'landscape' ? '16:9' : project.format === 'portrait' ? '9:16' : '1:1'}
        </span>
        <span>{totalFrames(project) / FPS} сек</span>
        <span>{project.scenes.length} сцен</span>
        <span>30 fps</span>
      </div>
      <label className="export-label">
        Качество
        <select disabled={busy} value={quality} onChange={(e) => setQuality(e.target.value)}>
          <option value="1080">
            Full HD · {dimensions[project.format].width} × {dimensions[project.format].height}
          </option>
          <option value="720">Быстрый экспорт · 720p</option>
        </select>
      </label>
      <div className="export-codec">
        <span>Формат файла</span>
        <b>MP4 / H.264</b>
      </div>
      {job && job.status !== 'error' ? (
        <div className="render-progress">
          <div>
            <span>
              {job.status === 'done'
                ? 'Видео готово'
                : job.status === 'bundling'
                  ? 'Подготавливаем композицию'
                  : job.status === 'queued'
                    ? 'В очереди'
                    : 'Создаём видео'}
            </span>
            <b>{Math.round(job.progress * 100)}%</b>
          </div>
          <progress value={job.progress} max="1" />
          {job.status === 'done' ? (
            <a className="primary-button download-button" href={job.url} download>
              <CheckCircle2 size={17} /> Скачать видео <Download size={17} />
            </a>
          ) : (
            <p>Можно закрыть окно — экспорт продолжится на сервере.</p>
          )}
        </div>
      ) : null}
      {error || job?.error ? (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error || job?.error}</span>
        </div>
      ) : null}
      {
        <button
          className="primary-button export-start"
          onClick={() => void render()}
          disabled={busy}
        >
          {busy ? <LoaderCircle className="spin" size={17} /> : <Download size={17} />}{' '}
          {busy
            ? 'Создаём видео…'
            : job?.status === 'done'
              ? 'Экспортировать заново'
              : 'Экспортировать видео'}{' '}
        </button>
      }
      <p className="export-footnote">Файл будет создан на этом компьютере.</p>
    </Modal>
  );
}
