import { describe, test, expect } from 'vitest';
import { Timestamp } from '../public/javascript/TimeStamp.js';

describe('Timestamp', () => {
  test('creates a timestamp with time and topic', () => {
    const ts = new Timestamp('00:01:00', 'Test Topic');
    expect(ts.timeList).toEqual(['00:01:00']);
    expect(ts.topic).toBe('Test Topic');
    expect(ts.level).toBe(1);
    expect(ts.id).toBeDefined();
    expect(ts.subStamps).toEqual([]);
  });

  test('adds a sub timestamp', () => {
    const parent = new Timestamp('00:01:00', 'Parent');
    const child = new Timestamp('00:02:00', 'Child', 2);
    parent.addSubStamp(child);
    expect(parent.subStamps).toContain(child);
  });

  test('removes a sub timestamp', () => {
    const parent = new Timestamp('00:01:00', 'Parent');
    const child = new Timestamp('00:02:00', 'Child', 2);
    parent.addSubStamp(child);
    parent.removeSubStamp(child.id);
    expect(parent.subStamps).not.toContain(child);
  });

  test('finds sub timestamp by id', () => {
    const parent = new Timestamp('00:01:00', 'Parent');
    const child = new Timestamp('00:02:00', 'Child', 2);
    parent.addSubStamp(child);
    const found = parent.findSubTimeStamp([parent.id, child.id]);
    expect(found).toBe(child);
  });

  test('adds time to timestamp', () => {
    const ts = new Timestamp('00:01:00', 'Test');
    ts.addTime('00:02:00');
    expect(ts.timeList).toContain('00:02:00');
  });

  test('removes time from timestamp', () => {
    const ts = new Timestamp('00:01:00', 'Test');
    ts.addTime('00:02:00');
    ts.removeTime('00:02:00');
    expect(ts.timeList).not.toContain('00:02:00');
  });
});
