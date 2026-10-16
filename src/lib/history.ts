import { FPS, sceneStart, totalFrames } from './project';
import type { Project } from './project';
/** Preserve the selected scene's local time across structural history changes. */
export function restoreCursor(before: Project, after: Project, selected: string, frame: number) {
  const oldIndex = Math.max(
    0,
    before.scenes.findIndex((s) => s.id === selected),
  );
  const found = after.scenes.findIndex((s) => s.id === selected);
  const index = found >= 0 ? found : Math.min(oldIndex, after.scenes.length - 1);
  const structural =
    JSON.stringify(before.scenes.map((s) => [s.id, s.duration])) !==
    JSON.stringify(after.scenes.map((s) => [s.id, s.duration]));
  const local = Math.max(
    0,
    Math.min(after.scenes[index].duration * FPS - 1, frame - sceneStart(before, oldIndex)),
  );
  return {
    selected: after.scenes[index].id,
    frame: structural ? sceneStart(after, index) + local : Math.min(frame, totalFrames(after) - 1),
  };
}
