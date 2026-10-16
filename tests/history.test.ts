import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restoreCursor } from '../src/lib/history';
import { defaultProject, sceneStart } from '../src/lib/project';
test('undo reorder keeps the selected scene and local frame in sync', () => {
  const reordered = {
    ...defaultProject,
    scenes: [defaultProject.scenes[1], defaultProject.scenes[0], ...defaultProject.scenes.slice(2)],
  };
  const cursor = restoreCursor(reordered, defaultProject, 'intro', 240);
  assert.equal(cursor.selected, 'intro');
  assert.equal(cursor.frame, 30);
});
test('undo scene insertion selects a surviving neighbor and clamps local time', () => {
  const before = {
    ...defaultProject,
    scenes: [...defaultProject.scenes, { ...defaultProject.scenes[4], id: 'added' }],
  };
  const cursor = restoreCursor(before, defaultProject, 'added', sceneStart(before, 5) + 45);
  assert.equal(cursor.selected, 'outro');
  assert.equal(cursor.frame, sceneStart(defaultProject, 4) + 45);
});
test('cosmetic undo preserves playback position even if a different scene is selected', () => {
  const cursor = restoreCursor(defaultProject, { ...defaultProject, theme: 'mint' }, 'intro', 500);
  assert.equal(cursor.frame, 500);
});
