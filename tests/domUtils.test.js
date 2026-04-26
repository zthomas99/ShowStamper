import { describe, test, expect } from 'vitest';
import { formatTime, doesExist, querySelectChildren, querySelectParents } from '../public/javascript/domUtils.js';

describe('domUtils', () => {
  test('formatTime formats time correctly', () => {
    expect(formatTime('01:01:01')).toBe('1:01:01'); // 1 hour, 1 min, 1 sec
    expect(formatTime('00:01:01')).toBe('1:01');
    expect(formatTime('00:00:01')).toBe('0:01');
    expect(formatTime('00:00:00')).toBe('00:00:00');
  });

  test('doesExist checks for null/undefined', () => {
    expect(doesExist(null)).toBe(false);
    expect(doesExist(undefined)).toBe(false);
    expect(doesExist('')).toBe(true);
    expect(doesExist(0)).toBe(true);
    expect(doesExist({})).toBe(true);
  });

  test('querySelectChildren finds child elements', () => {
    document.body.innerHTML = '<div id="parent"><span class="child">test</span></div>';
    const parent = document.getElementById('parent');
    const child = querySelectChildren('.child', parent);
    expect(child).toBeTruthy();
    expect(child.textContent).toBe('test');
  });

  test('querySelectParents finds parent elements', () => {
    document.body.innerHTML = '<div class="parent"><span id="child">test</span></div>';
    const child = document.getElementById('child');
    const parent = querySelectParents('.parent', child);
    expect(parent).toBeTruthy();
    expect(parent.className).toBe('parent');
  });
});