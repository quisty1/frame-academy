import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '@remotion/player';
import type { PlayerRef } from '@remotion/player';
import {
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Download,
  Expand,
  Film,
  HelpCircle,
  Import,
  LayoutTemplate,
  LoaderCircle,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Redo2,
  SkipBack,
  SkipForward,
  Undo2,
  X,
} from 'lucide-react';
import { useProject } from './lib/useProject';
import { restoreCursor } from './lib/history';
import { downloadText, subtitles, teachingScript } from './lib/exports';
import { lessonTemplates } from './lib/templates';
import {
  dimensions,
  downloadJson,
  FPS,
  makeScene,
  projectSchema,
  sceneAtFrame,
  sceneStart,
  timecode,
  totalFrames,
  uid,
} from './lib/project';
import type { Project, Scene } from './lib/project';
import { Lesson } from './remotion/Lesson';
import { Inspector } from './components/Inspector';
import { SceneThumb, Storyboard } from './components/Storyboard';
import { Timeline } from './components/Timeline';
import { ExportModal } from './components/ExportModal';
import { IconButton, Modal } from './components/UI';
import { ThemeSelect } from './components/ThemeSelect';

type Dialog = 'export' | 'add' | 'templates' | 'learn' | 'help' | 'project' | null;
const kinds: { kind: Scene['kind']; name: string; description: string }[] = [
  { kind: 'intro', name: 'Вступление', description: 'Тема и план урока' },
  { kind: 'concept', name: 'Визуальная идея', description: 'Схема и связи компонентов' },
  { kind: 'code', name: 'Пример кода', description: 'Исходный код и пояснение' },
  { kind: 'steps', name: 'Шаг за шагом', description: 'Последовательность действий' },
  { kind: 'outro', name: 'Завершение', description: 'Итоги и задание' },
];
export default function App() {
  const {
    project,
    update,
    undo: undoState,
    redo: redoState,
    canUndo,
    canRedo,
    saveState,
  } = useProject();
  const [selected, setSelected] = useState(project.scenes[0].id);
  const [frame, setFrame] = useState(45);
  const [playing, setPlaying] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, setToast] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [scale, setScale] = useState('fit');
  const [guide, setGuide] = useState(false);
  const player = useRef<PlayerRef>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const duration = totalFrames(project);
  const scene = project.scenes.find((s) => s.id === selected) ?? project.scenes[0];
  const selectedIndex = project.scenes.findIndex((s) => s.id === scene.id);
  const dim = dimensions[project.format];
  const inputProps = useMemo(() => ({ project }), [project]);
  const notify = useCallback((text: string) => setToast(text), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!project.scenes.some((s) => s.id === selected)) setSelected(project.scenes[0].id);
  }, [project.scenes, selected]);
  const seek = useCallback((n: number) => {
    player.current?.seekTo(n);
    setFrame(n);
  }, []);
  const restoreHistory = useCallback(
    (next: Project | undefined) => {
      if (!next) return;
      const cursor = restoreCursor(project, next, selected, player.current?.getCurrentFrame() ?? 0);
      setSelected(cursor.selected);
      seek(cursor.frame);
    },
    [project, selected, seek],
  );
  const undo = useCallback(() => restoreHistory(undoState()), [restoreHistory, undoState]);
  const redo = useCallback(() => restoreHistory(redoState()), [restoreHistory, redoState]);
  const select = useCallback(
    (id: string) => {
      const i = project.scenes.findIndex((s) => s.id === id);
      if (i < 0) return;
      setSelected(id);
      seek(
        Math.min(
          duration - 1,
          sceneStart(project, i) + Math.min(45, project.scenes[i].duration * FPS - 1),
        ),
      );
    },
    [project, duration, seek],
  );
  const patchScene = (patch: Partial<Scene>) =>
    update((p) => ({
      ...p,
      scenes: p.scenes.map((s) => (s.id === scene.id ? { ...s, ...patch } : s)),
    }));
  const remove = useCallback(() => {
    if (project.scenes.length <= 1) return;
    const i = project.scenes.findIndex((s) => s.id === selected);
    const next = project.scenes.filter((s) => s.id !== selected);
    update({ ...project, scenes: next });
    const index = Math.max(0, i - 1);
    setSelected(next[index].id);
    seek(sceneStart({ ...project, scenes: next }, index) + 30);
  }, [project, selected, update, seek]);
  const duplicate = () => {
    if (project.scenes.length >= 20) return;
    const next = { ...scene, id: uid() };
    const scenes = [...project.scenes];
    scenes.splice(selectedIndex + 1, 0, next);
    update({ ...project, scenes });
    setSelected(next.id);
    seek(sceneStart({ ...project, scenes }, selectedIndex + 1) + 30);
    notify('Сцена продублирована');
  };
  const move = (direction: number) => {
    const scenes = [...project.scenes];
    const target = selectedIndex + direction;
    if (target < 0 || target >= scenes.length) return;
    [scenes[selectedIndex], scenes[target]] = [scenes[target], scenes[selectedIndex]];
    update({ ...project, scenes });
    seek(sceneStart({ ...project, scenes }, target) + 30);
  };
  const reorder = (from: string, to: string) => {
    if (from === to) return;
    const scenes = [...project.scenes];
    const a = scenes.findIndex((s) => s.id === from);
    const b = scenes.findIndex((s) => s.id === to);
    const [item] = scenes.splice(a, 1);
    scenes.splice(b, 0, item);
    update({ ...project, scenes });
    const selectedPosition = scenes.findIndex((s) => s.id === selected);
    seek(sceneStart({ ...project, scenes }, selectedPosition) + 30);
  };
  const split = () => {
    const i = sceneAtFrame(project, frame);
    const s = project.scenes[i];
    const seconds = Math.round((frame - sceneStart(project, i)) / FPS);
    if (project.scenes.length >= 20 || seconds < 2 || s.duration - seconds < 2) {
      notify('Для разделения оставьте хотя бы 2 секунды с каждой стороны');
      return;
    }
    const scenes = [...project.scenes];
    scenes.splice(
      i,
      1,
      { ...s, duration: seconds },
      { ...s, id: uid(), duration: s.duration - seconds },
    );
    update({ ...project, scenes });
    notify('Сцена разделена');
  };
  const add = (kind: Scene['kind']) => {
    if (project.scenes.length >= 20) {
      notify('В проекте может быть не больше 20 сцен');
      return;
    }
    const s = makeScene(kind);
    const scenes = [...project.scenes];
    scenes.splice(selectedIndex + 1, 0, s);
    update({ ...project, scenes });
    setSelected(s.id);
    setDialog(null);
    seek(sceneStart({ ...project, scenes }, selectedIndex + 1) + 30);
  };
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const frameUpdate = () => setFrame(p.getCurrentFrame());
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener('frameupdate', frameUpdate);
    p.addEventListener('play', onPlay);
    p.addEventListener('pause', onPause);
    p.addEventListener('ended', onPause);
    p.seekTo(45);
    return () => {
      p.removeEventListener('frameupdate', frameUpdate);
      p.removeEventListener('play', onPlay);
      p.removeEventListener('pause', onPause);
      p.removeEventListener('ended', onPause);
    };
  }, []);
  useEffect(() => {
    if (frame >= duration) seek(duration - 1);
  }, [duration, frame, seek]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable ||
        dialog
      )
        return;
      if (e.code === 'Space') {
        e.preventDefault();
        player.current?.toggle();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        seek(
          Math.min(duration - 1, (player.current?.getCurrentFrame() ?? 0) + (e.shiftKey ? 30 : 1)),
        );
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seek(Math.max(0, (player.current?.getCurrentFrame() ?? 0) - (e.shiftKey ? 30 : 1)));
      }
      if (e.key === 'Escape') setPreviewMode(false);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [dialog, duration, seek, undo, redo]);
  async function importProject(file?: File) {
    if (!file) return;
    try {
      if (file.size > 500000) throw new Error('Файл слишком большой. Максимум — 500 КБ.');
      const data = projectSchema.parse(JSON.parse(await file.text()));
      update(data);
      setSelected(data.scenes[0].id);
      seek(30);
      setDialog(null);
      notify('Проект импортирован');
    } catch (e) {
      notify(
        e instanceof Error && e.message.includes('большой')
          ? e.message
          : 'Не удалось открыть проект. Выберите JSON, сохранённый в Frame Academy.',
      );
    }
    if (importRef.current) importRef.current.value = '';
  }
  const applyTemplate = (theme: Project['theme']) => {
    const next = structuredClone(lessonTemplates[theme].project);
    update(next);
    setSelected(next.scenes[0].id);
    seek(45);
    setDialog(null);
    notify('Шаблон применён. Предыдущий проект можно вернуть через отмену.');
  };
  return (
    <div className={`studio ${previewMode ? 'presentation-mode' : ''}`}>
      <header className="global-header">
        <button
          className="brand"
          onClick={() => setDialog('project')}
          aria-label="Frame Academy — проекты"
        >
          <strong>Frame</strong>
        </button>
        <nav className="top-nav" aria-label="Основная навигация">
          <button className="active" onClick={() => setDialog(null)}>
            Редактор
          </button>
          <button onClick={() => setDialog('templates')}>Шаблоны</button>
          <button onClick={() => setDialog('learn')}>Руководство</button>
        </nav>
        <div className="global-right">
          <ThemeSelect />
          <IconButton label="Помощь и сочетания клавиш" onClick={() => setDialog('help')}>
            <HelpCircle size={17} />
          </IconButton>
        </div>
      </header>
      <div className="project-bar">
        <div className="project-title">
          <div>
            <button className="project-name" onClick={() => setDialog('project')}>
              {project.name}
              <ChevronDown size={13} />
            </button>
            <span className="save-status">
              {saveState === 'saved' ? (
                <Check size={11} />
              ) : saveState === 'saving' ? (
                <LoaderCircle size={11} />
              ) : null}
              {saveState === 'saved'
                ? 'Сохранено'
                : saveState === 'saving'
                  ? 'Сохраняем…'
                  : 'Не удалось сохранить в браузере'}
            </span>
          </div>
        </div>
        <div className="project-actions">
          <div className="history-actions">
            <IconButton label="Отменить (⌘Z)" disabled={!canUndo} onClick={undo}>
              <Undo2 size={17} />
            </IconButton>
            <IconButton label="Повторить (⌘⇧Z)" disabled={!canRedo} onClick={redo}>
              <Redo2 size={17} />
            </IconButton>
          </div>
          <span className="bar-divider" />
          <button
            className="secondary-button preview-button"
            onClick={() => setPreviewMode((v) => !v)}
          >
            <Play size={14} /> Предпросмотр
          </button>
          <button className="primary-button" onClick={() => setDialog('export')}>
            Экспорт
          </button>
        </div>
      </div>
      <main className="studio-body">
        <Storyboard
          project={project}
          selected={scene.id}
          onSelect={select}
          onAdd={() => setDialog('add')}
          onDuplicate={duplicate}
          onDelete={remove}
          onMove={move}
        />
        <section className="workspace">
          <div className="canvas-toolbar">
            <div className="breadcrumb">
              Сцена {String(selectedIndex + 1).padStart(2, '0')} <span>/</span>
              <b>{kinds.find((k) => k.kind === scene.kind)?.name}</b>
            </div>
            <div className="canvas-toolbar-right">
              <span className="quality-tag">
                {dim.width} × {dim.height}
              </span>
              <span className="fps-tag">30 fps</span>
              <IconButton
                label="Направляющие композиции"
                onClick={() => setGuide((v) => !v)}
                active={guide}
              >
                <Expand size={15} />
              </IconButton>
              <IconButton label="Параметры проекта" onClick={() => setDialog('project')}>
                <MoreHorizontal size={18} />
              </IconButton>
            </div>
          </div>
          <div className="canvas-area">
            <div
              className={`video-wrap ${guide ? 'show-guides' : ''} ${project.format}`}
              style={{ transform: scale === '75' ? 'scale(.75)' : undefined }}
            >
              <Player
                ref={player}
                component={Lesson}
                inputProps={inputProps}
                durationInFrames={duration}
                compositionWidth={dim.width}
                compositionHeight={dim.height}
                fps={FPS}
                style={{ width: '100%' }}
                controls={false}
                clickToPlay={false}
                doubleClickToFullscreen
                showVolumeControls={false}
                initialFrame={45}
                acknowledgeRemotionLicense
              />
              <div className="guide-lines" />
              <span className="canvas-resolution">
                {project.format === 'landscape'
                  ? '16:9'
                  : project.format === 'portrait'
                    ? '9:16'
                    : '1:1'}
              </span>
            </div>
          </div>
          <div className="playback-bar">
            <div className="playback-left">Предпросмотр</div>
            <div className="transport">
              <IconButton
                label="Предыдущая сцена"
                onClick={() =>
                  select(project.scenes[Math.max(0, sceneAtFrame(project, frame) - 1)].id)
                }
              >
                <SkipBack size={15} />
              </IconButton>
              <button
                className="play-button"
                aria-label={playing ? 'Пауза' : 'Воспроизвести'}
                onClick={() => player.current?.toggle()}
              >
                {playing ? (
                  <Pause size={15} fill="currentColor" />
                ) : (
                  <Play size={15} fill="currentColor" />
                )}
              </button>
              <IconButton
                label="Следующая сцена"
                onClick={() =>
                  select(
                    project.scenes[
                      Math.min(project.scenes.length - 1, sceneAtFrame(project, frame) + 1)
                    ].id,
                  )
                }
              >
                <SkipForward size={15} />
              </IconButton>
              <span className="timecode">
                {timecode(frame)}
                <i>/ {timecode(duration)}</i>
              </span>
            </div>
            <div className="playback-right">
              <select
                aria-label="Масштаб предпросмотра"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              >
                <option value="fit">Вписать</option>
                <option value="75">75%</option>
              </select>
              <IconButton label="Режим презентации" onClick={() => setPreviewMode((v) => !v)}>
                <Expand size={15} />
              </IconButton>
            </div>
          </div>
          <Timeline
            project={project}
            frame={frame}
            selected={scene.id}
            onSeek={seek}
            onSelect={select}
            onReorder={reorder}
            onSplit={split}
          />
        </section>
        <Inspector
          project={project}
          scene={scene}
          onScene={patchScene}
          onProject={(patch) => update((p) => ({ ...p, ...patch }))}
        />
      </main>
      {previewMode ? (
        <button
          className="exit-presentation secondary-button"
          onClick={() => setPreviewMode(false)}
        >
          <X size={16} /> Вернуться в редактор <span className="key">Esc</span>
        </button>
      ) : null}
      <input
        hidden
        ref={importRef}
        type="file"
        accept=".json,application/json"
        onChange={(e) => void importProject(e.target.files?.[0])}
      />
      {dialog === 'export' ? (
        <ExportModal project={project} onClose={() => setDialog(null)} />
      ) : null}
      {dialog === 'add' ? (
        <Modal title="Добавить сцену" wide onClose={() => setDialog(null)}>
          <p className="modal-description">
            Выберите тип сцены. Содержание можно изменить в редакторе.
          </p>
          <div className="scene-picker">
            {kinds.map((k) => (
              <button
                key={k.kind}
                onClick={() => add(k.kind)}
                disabled={project.scenes.length >= 20}
              >
                <SceneThumb scene={makeScene(k.kind)} theme={project.theme} />
                <strong>{k.name}</strong>
                <span>{k.description}</span>
                <Plus size={17} />
              </button>
            ))}
          </div>
        </Modal>
      ) : null}
      {dialog === 'templates' ? (
        <Modal title="Шаблоны уроков" wide onClose={() => setDialog(null)}>
          <p className="modal-description">
            Готовый урок, который можно сделать своим. Применение заменит текущие сцены; действие
            можно отменить.
          </p>
          <div className="template-grid">
            {Object.entries(lessonTemplates).map(([key, t]) => (
              <button key={key} onClick={() => applyTemplate(key as Project['theme'])}>
                <SceneThumb scene={t.project.scenes[0]} theme={key as Project['theme']} />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.description}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="template-note">Форматы видео: 16:9, 9:16 и 1:1.</div>
        </Modal>
      ) : null}
      {dialog === 'project' ? (
        <Modal title="Настройки проекта" onClose={() => setDialog(null)}>
          <label className="export-label">
            Название проекта
            <input
              value={project.name}
              maxLength={120}
              onChange={(e) => update((p) => ({ ...p, name: e.target.value || 'Мой урок' }))}
            />
          </label>
          <div className="project-detail">
            <span>{project.scenes.length} сцен</span>
            <span>{totalFrames(project) / FPS} секунд</span>
            <span>React + Remotion</span>
          </div>
          <button
            className="project-menu-item"
            onClick={() => {
              downloadJson(project);
              notify('Проект сохранён в JSON');
            }}
          >
            <Download size={19} />
            <div>
              <strong>Скачать исходник урока</strong>
              <span>JSON с текстами, кодом, сценами и сценарием</span>
            </div>
          </button>
          <button
            className="project-menu-item"
            onClick={() => downloadText(teachingScript(project), 'lesson-script.md')}
          >
            <BookOpen size={19} />
            <div>
              <strong>Скачать сценарий преподавателя</strong>
              <span>Тайминги, заметки и примеры кода в Markdown</span>
            </div>
          </button>
          <button
            className="project-menu-item"
            onClick={() => downloadText(subtitles(project), 'lesson-subtitles.srt')}
          >
            <Film size={19} />
            <div>
              <strong>Скачать субтитры</strong>
              <span>SRT с описаниями и точными таймингами сцен</span>
            </div>
          </button>
          <button className="project-menu-item" onClick={() => importRef.current?.click()}>
            <Import size={19} />
            <div>
              <strong>Открыть проект</strong>
              <span>Продолжите работу из файла JSON</span>
            </div>
          </button>
          <button className="project-menu-item" onClick={() => setDialog('templates')}>
            <LayoutTemplate size={19} />
            <div>
              <strong>Начать с шаблона</strong>
              <span>Четыре урока по React и Remotion</span>
            </div>
          </button>
          <p className="export-footnote">Ваш проект автоматически сохраняется в этом браузере.</p>
        </Modal>
      ) : null}
      {dialog === 'learn' ? (
        <Modal title="Подготовка видеоурока" wide onClose={() => setDialog(null)}>
          <div className="academy-content">
            <div className="academy-lessons">
              {[
                {
                  title: 'Одна сцена — одна мысль',
                  body: 'Разбивайте тему на короткие смысловые части. Начните с понятной проблемы, затем покажите решение и предложите практику.',
                },
                {
                  title: 'Код, который можно прочитать',
                  body: 'Оставьте в кадре только важные строки. Объясните входные данные, действие и результат. Не заставляйте ученика разбирать всё сразу.',
                },
                {
                  title: 'Анимация с задачей',
                  body: 'Показывайте связи и последовательность. Движение должно помогать объяснению: деталь появляется именно тогда, когда вы о ней говорите.',
                },
              ].map((l, i) => (
                <article key={l.title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{l.title}</h3>
                    <p>{l.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setDialog(null);
              select(project.scenes[0].id);
            }}
          >
            Вернуться к уроку
          </button>
        </Modal>
      ) : null}
      {dialog === 'help' ? (
        <Modal title="Помощь" onClose={() => setDialog(null)}>
          <div className="help-content">
            <p>
              Выберите сцену слева, измените текст справа и нажмите воспроизведение. Всё, что вы
              видите в кадре, попадёт в итоговый MP4.
            </p>
            <div className="shortcut">
              <span>Воспроизведение / пауза</span>
              <kbd>Space</kbd>
            </div>
            <div className="shortcut">
              <span>Шаг на один кадр</span>
              <kbd>← / →</kbd>
            </div>
            <div className="shortcut">
              <span>Шаг на секунду</span>
              <kbd>Shift + ← / →</kbd>
            </div>
            <div className="shortcut">
              <span>Отменить / повторить</span>
              <kbd>⌘ Z / ⌘ ⇧ Z</kbd>
            </div>
            <div className="shortcut">
              <span>Выйти из презентации</span>
              <kbd>Esc</kbd>
            </div>
            <p>
              Перетаскивайте клипы на таймлайне, чтобы менять порядок. Сценарий преподавателя
              доступен во вкладке справа.
            </p>
            <div className="help-tech">
              <Code2 size={20} />
              <div>
                <strong>Создано на React и Remotion</strong>
                <span>
                  Один компонент для предпросмотра и экспорта. Настоящее видео, созданное кодом.
                </span>
              </div>
            </div>
          </div>
        </Modal>
      ) : null}
      {toast ? (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
          <button aria-label="Закрыть уведомление" onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
