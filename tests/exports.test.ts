import { test } from 'node:test';
import assert from 'node:assert/strict';
import { srtTime, subtitles, teachingScript } from '../src/lib/exports';
import { defaultProject } from '../src/lib/project';
test('SRT uses exact scene boundaries and standard millisecond syntax', () => {
  const text = subtitles(defaultProject);
  assert.match(text, /00:00:00,000 --> 00:00:07,000/);
  assert.match(text, /00:00:30,000 --> 00:00:36,000/);
  assert.equal(text.split(' --> ').length - 1, 5);
  assert.equal(srtTime(3661.25), '01:01:01,250');
});
test('teaching script preserves notes and code for the instructor', () => {
  const text = teachingScript(defaultProject);
  assert.match(text, /React\. От идеи до компонента/);
  assert.ok(text.includes(defaultProject.scenes[0].notes));
  assert.ok(text.includes(defaultProject.scenes[2].code));
  assert.equal((text.match(/^## /gm) || []).length, 5);
});
