import { describe, test, expect, beforeEach, vi } from 'vitest';
import { updatePage, createTimeSetterDiv, createTimerDiv, createTimeStampDiv, createTimeButtonDiv, createFooter, createTimeEntry } from '../public/javascript/ui.js';

describe('ui', () => {
  const mockHandlers = {
    onSetTime: vi.fn(),
    onStart: vi.fn(),
    onStop: vi.fn(),
    onCreateTimestamp: vi.fn(),
    onSave: vi.fn(),
    onKeyPress: vi.fn(),
    onSubEntryDragEnter: vi.fn(),
    onSubEntryDragOver: vi.fn(),
    onSubEntryDragLeave: vi.fn(),
    onEntryDropped: vi.fn(),
    onEntryDragStart: vi.fn(),
    onAppendTime: vi.fn(),
    onDelete: vi.fn(),
    onExtractClick: vi.fn(),
    onBlur: vi.fn()
  };

  beforeEach(() => {
    document.body.innerHTML = '<div id="timestamp-holder"></div>';
  });

  test('updatePage creates page structure', () => {
    updatePage('Test Title', mockHandlers);
    expect(document.querySelector('h2')?.innerText).toBe('Test Title');
    expect(document.getElementById('timer-button-div')).toBeTruthy();
    expect(document.getElementById('timestamp-holder')).toBeTruthy();
  });

  test('createTimeSetterDiv creates time setter input', () => {
    const div = createTimeSetterDiv(mockHandlers.onSetTime);
    expect(div.querySelector('#txt-time-set')).toBeTruthy();
    expect(div.querySelector('button')).toBeTruthy();
  });

  test('createTimerDiv creates timer display', () => {
    const div = createTimerDiv();
    expect(div.querySelector('#hour')).toBeTruthy();
    expect(div.querySelector('#minute')).toBeTruthy();
    expect(div.querySelector('#second')).toBeTruthy();
  });

  test('createTimeButtonDiv creates buttons', () => {
    const div = createTimeButtonDiv(mockHandlers);
    expect(div.querySelector('#btn-start')).toBeTruthy();
    expect(div.querySelector('#btn-stop')).toBeTruthy();
    expect(div.querySelector('#btn-entry')).toBeTruthy();
    expect(div.querySelector('#btn-save')).toBeTruthy();
  });

  test('createFooter creates footer links', () => {
    createFooter();
    const footer = document.querySelector('footer');
    expect(footer).toBeTruthy();
    expect(footer.querySelector('.footer-link')).toBeTruthy();
  });

  test('createTimeEntry creates entry div', () => {
    const div = createTimeEntry('00:01:00', mockHandlers);
    expect(div).toBeTruthy();
    expect(div.className).toBe('time-entry-div');
    expect(div.querySelector('.entry-time-span')).toBeTruthy();
  });
});