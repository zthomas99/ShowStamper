import { describe, test, expect, beforeEach } from 'vitest';
import { stampMap, addTimestampToMap, removeTimestampToMap } from '../public/javascript/stampManager.js';
import { Timestamp } from '../public/javascript/TimeStamp.js';

describe('stampManager', () => {
  beforeEach(() => {
    stampMap.clear();
  });

  test('adds timestamp to map', () => {
    const ts = new Timestamp('00:01:00', 'Test');
    addTimestampToMap('root', [], ts);
    expect(stampMap.has('root')).toBe(true);
    expect(stampMap.get('root')).toBe(ts);
  });

  test('removes timestamp from map', () => {
    const ts = new Timestamp('00:01:00', 'Test');
    addTimestampToMap('root', [], ts);
    removeTimestampToMap('root', []);
    expect(stampMap.has('root')).toBe(false);
  });
});