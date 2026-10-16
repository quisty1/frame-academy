import { useRef, useState } from 'react';
import {
  Plus,
  Minus,
  Scissors,
  Magnet,
  Type,
  Layers,
  ChevronDown,
  MousePointer2,
  ArrowRight,
} from 'lucide-react';
import type { Project } from '../lib/project';
import { FPS, totalFrames, timecode } from '../lib/project';
import { IconButton } from './UI';
export function Timeline({
  project,
  frame,
  selected,
  onSeek,
  onSelect,
  onReorder,
  onSplit,
}: {
  project: Project;
  frame: number;
  selected: string;
  onSeek: (n: number) => void;
  onSelect: (id: string) => void;
  onReorder: (from: string, to: string) => void;
  onSplit: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState<string | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const total = totalFrames(project);
  const seconds = total / FPS;
  return (
    <section className="timeline" aria-label="Таймлайн урока">
      <div className="timeline-toolbar">
        <div>
          <MousePointer2 size={15} />
          <span className="timeline-title">Таймлайн</span>
          <span className="tiny-pill">{project.scenes.length} сцен</span>
        </div>
        <div>
          <IconButton label="Разделить сцену в позиции курсора" onClick={onSplit}>
            <Scissors size={16} />
          </IconButton>
          <span className="tool-divider" />
          <span title="Сцены автоматически привязаны друг к другу">
            <Magnet size={15} />
          </span>
          <span className="tool-divider" />
          <IconButton
            label="Уменьшить таймлайн"
            onClick={() => setZoom((v) => Math.max(1, v - 0.25))}
            disabled={zoom === 1}
          >
            <Minus size={14} />
          </IconButton>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <IconButton
            label="Увеличить таймлайн"
            onClick={() => setZoom((v) => Math.min(3, v + 0.25))}
            disabled={zoom === 3}
          >
            <Plus size={14} />
          </IconButton>
        </div>
      </div>
      <div className="timeline-body">
        <div className="track-labels">
          <div className="ruler-label">
            30 fps <ChevronDown size={11} />
          </div>
          <div>
            <Layers size={14} />
            <span>Сцены</span>
          </div>
          <div>
            <Type size={14} />
            <span>Заголовки</span>
          </div>
          <div>
            <ArrowRight size={14} />
            <span>Переходы</span>
          </div>
        </div>
        <div className="tracks-scroll">
          <div className="tracks" style={{ width: `${zoom * 100}%` }} ref={track}>
            <div
              className="ruler"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onSeek(
                  Math.min(total - 1, Math.round(((e.clientX - rect.left) / rect.width) * total)),
                );
              }}
            >
              {Array.from({ length: Math.floor(seconds / 5) + 1 }, (_, i) => (
                <span key={i} style={{ left: `${((i * 5) / seconds) * 100}%` }}>
                  {timecode(i * 5 * FPS)}
                </span>
              ))}
            </div>
            <div className="track-row scenes-track">
              {project.scenes.map((s, i) => (
                <button
                  key={s.id}
                  draggable
                  onDragStart={() => setDrag(s.id)}
                  onDragEnd={() => setDrag(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (drag) onReorder(drag, s.id);
                    setDrag(null);
                  }}
                  className={`clip ${s.id === selected ? 'selected' : ''} clip-${s.kind}`}
                  style={{
                    width: `${((s.duration * FPS) / total) * 100}%`,
                    opacity: drag === s.id ? 0.45 : 1,
                  }}
                  onClick={() => onSelect(s.id)}
                >
                  <span className="clip-copy">
                    <b>
                      {String(i + 1).padStart(2, '0')} ·{' '}
                      {s.kind === 'intro'
                        ? 'Вступление'
                        : s.kind === 'code'
                          ? 'Код'
                          : s.kind === 'concept'
                            ? 'Структура'
                            : s.kind === 'steps'
                              ? 'Практика'
                              : 'Финал'}
                    </b>
                    <small>{s.duration} сек</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="track-row text-track">
              {project.scenes.map((s) => (
                <button
                  key={s.id}
                  style={{ width: `${((s.duration * FPS) / total) * 100}%` }}
                  onClick={() => onSelect(s.id)}
                >
                  <Type size={11} />
                  <span>{s.title.replace('\n', ' ')}</span>
                </button>
              ))}
            </div>
            <div className="track-row transition-track">
              {project.scenes.map((s, i) => (
                <div key={s.id} style={{ width: `${((s.duration * FPS) / total) * 100}%` }}>
                  <span style={{ marginLeft: i === 0 ? '5px' : '-14px' }}>
                    ⤨<i>Плавно</i>
                  </span>
                </div>
              ))}
            </div>
            <div className="playhead" style={{ left: `${Math.min(100, (frame / total) * 100)}%` }}>
              <span>{timecode(frame)}</span>
              <i />
            </div>
            <input
              className="timeline-scrubber"
              type="range"
              aria-label="Позиция воспроизведения"
              min="0"
              max={total - 1}
              value={frame}
              onChange={(e) => onSeek(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="timeline-footer">
        <span>
          <i /> Все изменения сохраняются автоматически
        </span>
        <span>
          Перетаскивайте сцены, чтобы изменить порядок <span className="key">Space</span>{' '}
          воспроизведение
        </span>
      </div>
    </section>
  );
}
