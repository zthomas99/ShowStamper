import { describe, test, expect, beforeEach } from 'vitest';
import { initApp } from '../public/javascript/java.js';

describe('java app wiring', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="content-container"></div>
      <div id="inner-content-container"></div>
      <div class="title-container" id="title-container">
        <input id="title" type="text" />
        <button id="title-submit">Submit</button>
      </div>
      <div class="or-container" id="or-container"></div>
      <div class="select-container" id="select-container">
        <input id="txt-path" type="text" />
        <button id="btn-stamp-loader">Select</button>
      </div>
    `;
  });

  test('initApp attaches title submit listener and renders the app page', () => {
    initApp();

    const titleInput = document.getElementById('title');
    const titleButton = document.getElementById('title-submit');

    titleInput.value = 'My Log';
    titleButton.click();

    expect(document.querySelector('h2')).toBeTruthy();
    expect(document.querySelector('h2').innerText).toBe('MY LOG');
    expect(document.getElementById('timer-button-div')).toBeTruthy();
    expect(document.getElementById('timestamp-holder')).toBeTruthy();
  });
});
