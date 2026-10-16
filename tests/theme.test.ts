import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseThemePreference, resolveTheme } from '../src/lib/theme';
test('system is the default for new and invalid preferences', () => {
  for (const value of [null, '', 'purple', 'undefined'])
    assert.equal(parseThemePreference(value), 'system');
});
test('system preference follows either system appearance', () => {
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('system', true), 'dark');
});
test('explicit appearance overrides system appearance', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});
test('recognizes only explicit supported themes', () => {
  assert.equal(parseThemePreference('light'), 'light');
  assert.equal(parseThemePreference('dark'), 'dark');
  assert.equal(parseThemePreference('system'), 'system');
});
