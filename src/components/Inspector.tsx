import { useState } from 'react';
import { SlidersHorizontal, Type, Clock3, Check, Code2, NotebookPen } from 'lucide-react';
import { themes } from '../lib/project';
import type { Project, Scene } from '../lib/project';
export function Inspector({
  project,
  scene,
  onScene,
  onProject,
}: {
  project: Project;
  scene: Scene;
  onScene: (patch: Partial<Scene>) => void;
  onProject: (patch: Partial<Project>) => void;
}) {
  const [tab, setTab] = useState<'design' | 'notes'>('design');
  return (
    <aside className="inspector">
      <div className="inspector-tabs">
        <button className={tab === 'design' ? 'on' : ''} onClick={() => setTab('design')}>
          <SlidersHorizontal size={14} /> Оформление
        </button>
        <button className={tab === 'notes' ? 'on' : ''} onClick={() => setTab('notes')}>
          <NotebookPen size={14} /> Сценарий
        </button>
      </div>
      {tab === 'design' ? (
        <div className="inspector-scroll">
          <div className="inspector-title">
            <span>Содержание</span>
          </div>
          <section className="control-section">
            <h3>
              <Type size={15} /> Текст
            </h3>
            <label>
              Заголовок
              <textarea
                rows={3}
                maxLength={180}
                value={scene.title}
                onChange={(e) => onScene({ title: e.target.value || ' ' })}
              />
            </label>
            <label>
              Описание
              <textarea
                rows={3}
                maxLength={500}
                value={scene.subtitle}
                onChange={(e) => onScene({ subtitle: e.target.value })}
              />
            </label>
            <label>
              Название раздела
              <input
                value={scene.label}
                maxLength={80}
                onChange={(e) => onScene({ label: e.target.value })}
              />
            </label>
            <div className="font-choice">
              <span>Manrope</span>
              <span>Regular / Medium</span>
            </div>
          </section>
          {scene.kind === 'code' ? (
            <section className="control-section">
              <h3>
                <Code2 size={15} /> Пример кода
              </h3>
              <textarea
                className="code-input"
                rows={10}
                maxLength={5000}
                value={scene.code}
                onChange={(e) => onScene({ code: e.target.value })}
              />
            </section>
          ) : null}
          {scene.kind === 'steps' || scene.kind === 'concept' ? (
            <section className="control-section">
              <h3>Содержание объяснения</h3>
              {scene.points.map((point, i) => (
                <div className="point-editor" key={i}>
                  <label>
                    Пункт {i + 1}
                    <input
                      maxLength={80}
                      value={point.title}
                      onChange={(e) =>
                        onScene({
                          points: scene.points.map((v, j) =>
                            j === i ? { ...v, title: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Пояснение
                    <input
                      maxLength={160}
                      value={point.description}
                      onChange={(e) =>
                        onScene({
                          points: scene.points.map((v, j) =>
                            j === i ? { ...v, description: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </section>
          ) : null}
          <section className="control-section">
            <h3>Оформление видео</h3>
            <div className="theme-swatches">
              {Object.entries(themes).map(([key, v]) => (
                <button
                  key={key}
                  className={project.theme === key ? 'chosen' : ''}
                  style={{ background: v.paper, color: v.ink }}
                  title={v.name}
                  aria-label={`Палитра ${v.name}`}
                  aria-pressed={project.theme === key}
                  onClick={() => onProject({ theme: key as Project['theme'] })}
                >
                  {project.theme === key ? <Check size={15} /> : null}
                </button>
              ))}
            </div>
            <div className="theme-name">
              {themes[project.theme].name}
              <span>Применяется ко всем сценам</span>
            </div>
          </section>
          <section className="control-section">
            <h3>
              <Clock3 size={15} /> Анимация и время
            </h3>
            <label className="row-label">
              Длительность{' '}
              <div className="number-input">
                <input
                  aria-label="Длительность сцены"
                  type="number"
                  min={2}
                  max={30}
                  value={scene.duration}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (n >= 2 && n <= 30) onScene({ duration: Math.round(n) });
                  }}
                />
                <span>сек</span>
              </div>
            </label>
            <label>
              Появление
              <select
                aria-label="Анимация появления"
                value={scene.animation}
                onChange={(e) => onScene({ animation: e.target.value as Scene['animation'] })}
              >
                <option value="spring">Плавная пружина</option>
                <option value="fade">Растворение</option>
                <option value="slide">Сдвиг вверх</option>
                <option value="none">Без появления</option>
              </select>
            </label>
          </section>
          <section className="control-section">
            <h3>Формат видео</h3>
            <div className="format-options">
              {(['landscape', 'portrait', 'square'] as const).map((f, i) => (
                <button
                  key={f}
                  aria-pressed={project.format === f}
                  className={project.format === f ? 'chosen' : ''}
                  onClick={() => onProject({ format: f })}
                >
                  <i className={`format-icon ${f}`} />
                  <span>{['16:9', '9:16', '1:1'][i]}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="inspector-scroll">
          <div className="notes-heading">Заметки преподавателя</div>
          <p className="field-hint">
            Сценарий для выбранной сцены. Заметки сохраняются в проекте и не попадают в видео.
          </p>
          <textarea
            className="notes-input"
            rows={18}
            maxLength={10000}
            value={scene.notes}
            onChange={(e) => onScene({ notes: e.target.value })}
          />
          <p className="field-hint">
            {scene.notes.split(/\s+/).filter(Boolean).length} слов · ≈{' '}
            {Math.ceil(scene.notes.split(/\s+/).length / 2.2)} сек речи
          </p>
        </div>
      )}
    </aside>
  );
}
