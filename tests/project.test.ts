import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultProject,
  projectSchema,
  totalFrames,
  sceneStart,
  sceneAtFrame,
  FPS,
} from '../src/lib/project';
test('demo project validates and its scenes cover every frame exactly', () => {
  assert.equal(projectSchema.safeParse(defaultProject).success, true);
  assert.equal(totalFrames(defaultProject), 36 * FPS);
  for (let i = 0; i < defaultProject.scenes.length; i++) {
    const start = sceneStart(defaultProject, i);
    assert.equal(sceneAtFrame(defaultProject, start), i);
    assert.equal(
      sceneAtFrame(defaultProject, start + defaultProject.scenes[i].duration * FPS - 1),
      i,
    );
  }
});
test('reject unsafe and excessive rendering input', () => {
  assert.equal(projectSchema.safeParse({ ...defaultProject, scenes: [] }).success, false);
  assert.equal(
    projectSchema.safeParse({
      ...defaultProject,
      scenes: [{ ...defaultProject.scenes[0], duration: 1000 }],
    }).success,
    false,
  );
  assert.equal(
    projectSchema.safeParse({
      ...defaultProject,
      scenes: [defaultProject.scenes[0], defaultProject.scenes[0]],
    }).success,
    false,
  );
});
test('reordered scenes keep contiguous timing', () => {
  const p = { ...defaultProject, scenes: [...defaultProject.scenes].reverse() };
  assert.equal(totalFrames(p), totalFrames(defaultProject));
  assert.equal(sceneStart(p, 1), p.scenes[0].duration * FPS);
  assert.equal(sceneAtFrame(p, totalFrames(p) - 1), 4);
});
