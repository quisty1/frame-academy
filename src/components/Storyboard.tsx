import { memo } from 'react';
import { Plus, GripVertical, Copy, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import type { Project, Scene } from '../lib/project';
import { SceneArt } from '../remotion/Lesson';
import { IconButton } from './UI';
export const SceneThumb = memo(function SceneThumb({
  scene,
  theme,
}: {
  scene: Scene;
  theme: Project['theme'];
}) {
  return (
    <div className="scene-thumb" aria-hidden="true">
      <div className="thumb-inner">
        <SceneArt scene={scene} theme={theme} />
      </div>
    </div>
  );
});
export function Storyboard({
  project,
  selected,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
}: {
  project: Project;
  selected: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (direction: number) => void;
}) {
  return (
    <aside className="storyboard">
      <div className="panel-heading">
        <span>
          Сцены <b>{project.scenes.length}</b>
        </span>
        <IconButton label="Добавить сцену" onClick={onAdd}>
          <Plus size={17} />
        </IconButton>
      </div>
      <div className="storyboard-scroll">
        {project.scenes.map((s, i) => (
          <button
            key={s.id}
            className={`story-scene ${s.id === selected ? 'selected' : ''}`}
            aria-pressed={s.id === selected}
            onClick={() => onSelect(s.id)}
          >
            <span className="scene-index">{String(i + 1).padStart(2, '0')}</span>
            <div className="scene-card">
              <SceneThumb scene={s} theme={project.theme} />
              <div className="scene-caption">
                <span>
                  {
                    ['Вступление', 'Идея', 'Код', 'Практика', 'Финал'][
                      ['intro', 'concept', 'code', 'steps', 'outro'].indexOf(s.kind)
                    ]
                  }
                </span>
                <span>{s.duration}:00</span>
              </div>
            </div>
            <GripVertical className="grip" size={15} />
          </button>
        ))}
        <button className="add-scene" onClick={onAdd} disabled={project.scenes.length >= 20}>
          <Plus size={17} /> Добавить сцену
        </button>
      </div>
      <div className="scene-actions">
        <IconButton
          label="Сцену выше"
          onClick={() => onMove(-1)}
          disabled={project.scenes[0]?.id === selected}
        >
          <ArrowUp size={16} />
        </IconButton>
        <IconButton
          label="Сцену ниже"
          onClick={() => onMove(1)}
          disabled={project.scenes.at(-1)?.id === selected}
        >
          <ArrowDown size={16} />
        </IconButton>
        <span />
        <IconButton
          label="Дублировать сцену"
          onClick={onDuplicate}
          disabled={project.scenes.length >= 20}
        >
          <Copy size={16} />
        </IconButton>
        <IconButton label="Удалить сцену" onClick={onDelete} disabled={project.scenes.length <= 1}>
          <Trash2 size={16} />
        </IconButton>
      </div>
    </aside>
  );
}
