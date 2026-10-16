import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonTemplates } from '../src/lib/templates';
import { projectSchema, totalFrames } from '../src/lib/project';
test('all four complete lessons satisfy the rendering contract', () => {
  for (const { project } of Object.values(lessonTemplates)) {
    assert.ok(projectSchema.safeParse(project).success, project.name);
    assert.equal(totalFrames(project), 1080);
    assert.ok(project.scenes.find((s) => s.kind === 'code')?.code.includes('function'));
    for (const scene of project.scenes.filter((s) => s.kind === 'steps' || s.kind === 'concept'))
      assert.equal(scene.points.length, 3);
  }
});
