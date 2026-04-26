import { describe, test, expect, beforeEach } from 'vitest';
import { Timer } from '../public/javascript/timer.js';

describe('Timer', () => {
  let timer;

  beforeEach(() => {
    timer = new Timer();
    document.body.innerHTML = '<div id="hour"></div><div id="minute"></div><div id="second"></div>';
  });

  test('starts and stops timer', () => {
    timer.start();
    expect(timer.isPaused).toBe(false);
    timer.stop();
    expect(timer.isPaused).toBe(true);
  });

  test('gets current time', () => {
    const time = timer.getCurrentTime();
    expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  test('sets time correctly', () => {
    const success = timer.setTime('01:02:03');
    expect(success).toBe(true);
    expect(timer.hour).toBe(1);
    expect(timer.minute).toBe(2);
    expect(timer.second).toBe(3);
  });

  test('rejects invalid time format', () => {
    const success = timer.setTime('invalid');
    expect(success).toBe(false);
  });
});