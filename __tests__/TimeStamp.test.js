import { Timestamp } from '../public/javascript/TimeStamp.js';

describe('Timestamp', () => {
  test('constructor initializes correctly', () => {
    const ts = new Timestamp('00:01:00', 'Test Topic', 0);
    expect(ts.timeList).toEqual(['00:01:00']);
    expect(ts.topic).toBe('Test Topic');
    expect(ts.level).toBe(0);
    expect(ts.id).toBeDefined();
  });

  test('addTime prevents duplicates', () => {
    const ts = new Timestamp('00:01:00', 'Test', 0);
    ts.addTime('00:02:00');
    expect(ts.timeList).toEqual(['00:01:00', '00:02:00']);
    ts.addTime('00:01:00'); // duplicate
    expect(ts.timeList).toEqual(['00:01:00', '00:02:00']);
  });

  test('removeTime works correctly', () => {
    const ts = new Timestamp('00:01:00', 'Test', 0);
    ts.addTime('00:02:00');
    ts.removeTime('00:01:00');
    expect(ts.timeList).toEqual(['00:02:00']);
  });

  test('addSubStamp and findSubTimeStamp', () => {
    const parent = new Timestamp('00:01:00', 'Parent', 0);
    const child = new Timestamp('00:02:00', 'Child', 1);
    parent.addSubStamp(child);
    const found = parent.findSubTimeStamp([parent.id, child.id]);
    expect(found).toBe(child);
  });
});