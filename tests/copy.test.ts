import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultProject } from '../src/lib/project';
import { refineDemoCopy } from '../src/lib/copy';
test('updates only matching built-in copy and retains user content and timing', () => {
  const p = structuredClone(defaultProject);
  p.scenes[0].title = 'Мой собственный заголовок';
  p.scenes[1].title = 'Немного кода.\nМного возможностей.';
  const next = refineDemoCopy(p);
  assert.equal(next.scenes[0].title, p.scenes[0].title);
  assert.equal(next.scenes[1].title, 'Функция, которая\nвозвращает JSX');
  assert.deepEqual(
    next.scenes.map((s) => [s.id, s.duration, s.code, s.notes]),
    p.scenes.map((s) => [s.id, s.duration, s.code, s.notes]),
  );
  assert.equal(p.scenes[1].title, 'Немного кода.\nМного возможностей.');
});
