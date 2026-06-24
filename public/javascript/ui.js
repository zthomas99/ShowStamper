import { Timestamp } from './TimeStamp.js';
import { doesExist, getUnits, formatUnits } from './domUtils.js';
import { stampMap } from './stampManager.js';

export function updatePage(title, handlers) {
    const titleContainer = document.getElementById('title-container');
    const orContainer = document.getElementById('or-container');
    const selectContainer = document.getElementById('select-container');
    const innerContentContainer = document.getElementById('inner-content-container');
    const contentContainer = document.getElementById('content-container');

    if (doesExist(titleContainer)) titleContainer.remove();
    if (doesExist(orContainer)) orContainer.remove();
    if (doesExist(selectContainer)) selectContainer.remove();
    if (doesExist(innerContentContainer)) innerContentContainer.remove();
    if (doesExist(contentContainer)) contentContainer.remove();

    const titleH2 = document.createElement('h2');
    titleH2.innerText = title;
    titleH2.className = 'page-title';
    titleH2.setAttribute('tabindex', '-1');
    titleH2.style.cssText = 'width:100%;text-align:center;margin:0 0 16px 0;';

    const timerDiv = createTimerDiv();
    const topBanner = createTopBanner(timerDiv, handlers);

    const timestampDiv = createTimeStampDiv(handlers);

    // Scrollable full-width list container filling the remaining viewport
    const newContentContainer = document.createElement('div');
    newContentContainer.className = 'content-container';
    newContentContainer.style.cssText = [
        'width:100%',
        'max-width:900px',
        'margin:0 auto',
        'padding:0 16px 32px 16px',
        'box-sizing:border-box'
    ].join(';');
    newContentContainer.append(timestampDiv);

    document.body.append(topBanner, titleH2, newContentContainer);

    createFooter();
    if (typeof handlers.onKeyPress === 'function') {
        document.addEventListener('keypress', handlers.onKeyPress);
    }
}

export function createTopBanner(timerDiv, handlers) {
    const banner = document.createElement('div');
    banner.id = 'top-banner';
    banner.className = 'top-banner';
    banner.setAttribute('aria-hidden', 'true');
    banner.style.cssText = [
        'width:100vw',
        'height:15vh',
        'background:linear-gradient(135deg,#3a3a3a 0%,#2a2a2a 48%,#383838 100%)',
        'display:flex',
        'flex-direction:row',
        'align-items:center',
        'justify-content:space-between',
        'padding:0 32px',
        'box-sizing:border-box',
        'margin-bottom:24px',
        'border-bottom:3px solid #3b82f6'
    ].join(';');

    // Left: Create Timestamp button
    const createBtn = document.createElement('button');
    createBtn.id = 'btn-entry';
    createBtn.className = 'timer-entry-btn';
    createBtn.type = 'button';
    createBtn.innerText = '+ Stamp';
    createBtn.setAttribute('aria-label', 'Create timestamp');
    createBtn.style.cssText = [
        'background:rgba(11,95,255,0.8)',
        'color:#ffffff',
        'border:2px solid #7eb3ff',
        'border-radius:8px',
        'padding:10px 20px',
        'font-size:0.95rem',
        'font-weight:700',
        'cursor:pointer',
        'white-space:nowrap',
        'flex-shrink:0'
    ].join(';');
    createBtn.addEventListener('click', handlers.onCreateTimestamp);
    banner.appendChild(createBtn);

    // Center: timer + toggle
    const centerSection = document.createElement('div');
    centerSection.style.cssText = [
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'justify-content:center',
        'gap:6px',
        'flex:1'
    ].join(';');

    if (timerDiv) {
        timerDiv.querySelectorAll('span, p').forEach(el => {
            el.style.fontSize = '2.5rem';
            el.style.fontWeight = '800';
            el.style.lineHeight = '1';
            el.style.margin = '0';
        });
        centerSection.appendChild(timerDiv);
    }
    banner.appendChild(centerSection);

    // Inline edit input — shown in place of timer display when stopped
    const timeEditInput = document.createElement('input');
    timeEditInput.type = 'text';
    timeEditInput.placeholder = 'hh:mm:ss';
    timeEditInput.setAttribute('aria-label', 'Edit current time');
    timeEditInput.style.cssText = [
        'display:none',
        'background:transparent',
        'border:none',
        'border-bottom:2px solid #ffffff',
        'color:#ffffff',
        'font-size:2.5rem',
        'font-weight:800',
        'text-align:center',
        'width:220px',
        'outline:none',
        'letter-spacing:0.08em',
        'font-family:inherit'
    ].join(';');
    centerSection.appendChild(timeEditInput);

    function showEditInput() {
        const currentTime = (handlers && typeof handlers.onGetCurrentTime === 'function')
            ? handlers.onGetCurrentTime()
            : '00:00:00';
        timeEditInput.value = currentTime;
        if (timerDiv) timerDiv.style.display = 'none';
        timeEditInput.style.display = 'block';
        timeEditInput.focus();
        timeEditInput.select();
    }

    function confirmEdit() {
        const val = timeEditInput.value.trim();
        if (val && handlers && typeof handlers.onSetTimeValue === 'function') {
            const ok = handlers.onSetTimeValue(val);
            if (!ok) {
                timeEditInput.style.borderBottom = '2px solid #ff6b6b';
                timeEditInput.title = 'Invalid format — use hh:mm:ss';
                return false;
            }
        }
        timeEditInput.style.display = 'none';
        timeEditInput.style.borderBottom = '2px solid #ffffff';
        if (timerDiv) timerDiv.style.display = 'flex';
        return true;
    }

    timeEditInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmEdit();
        if (e.key === 'Escape') {
            timeEditInput.style.display = 'none';
            timeEditInput.style.borderBottom = '2px solid #ffffff';
            if (timerDiv) timerDiv.style.display = 'flex';
        }
    });

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'btn-start-stop';
    toggleBtn.className = 'start-stop-btn';
    toggleBtn.type = 'button';
    toggleBtn.innerText = 'Start';
    toggleBtn.dataset.state = 'start';
    toggleBtn.setAttribute('aria-label', 'Start or stop timer');
    toggleBtn.style.cssText = [
        'width:80px',
        'height:80px',
        'border-radius:50%',
        'border:3px solid #ffffff',
        'background-color:rgba(255,255,255,0.15)',
        'color:#ffffff',
        'font-size:1rem',
        'font-weight:700',
        'cursor:pointer',
        'padding:0',
        'margin-bottom:8px'
    ].join(';');

    toggleBtn.addEventListener('click', () => {
        if (toggleBtn.dataset.state === 'start') {
            // If edit input is visible, confirm time change before starting
            if (timeEditInput.style.display !== 'none') {
                const ok = confirmEdit();
                if (!ok) return;
            }
            if (handlers && typeof handlers.onStart === 'function') handlers.onStart();
            toggleBtn.innerText = 'Stop';
            toggleBtn.dataset.state = 'stop';
        } else {
            if (handlers && typeof handlers.onStop === 'function') handlers.onStop();
            toggleBtn.innerText = 'Start';
            toggleBtn.dataset.state = 'start';
            showEditInput();
        }
    });

    centerSection.appendChild(toggleBtn);

    // Right: Save button
    const saveBtn = document.createElement('button');
    saveBtn.id = 'btn-save';
    saveBtn.className = 'timer-save-btn';
    saveBtn.type = 'button';
    saveBtn.innerText = 'Save';
    saveBtn.setAttribute('aria-label', 'Save timestamps');
    saveBtn.style.cssText = [
        'background:rgba(255,255,255,0.15)',
        'color:#ffffff',
        'border:2px solid #ffffff',
        'border-radius:8px',
        'padding:10px 20px',
        'font-size:0.95rem',
        'font-weight:700',
        'cursor:pointer',
        'white-space:nowrap',
        'flex-shrink:0'
    ].join(';');
    saveBtn.addEventListener('click', handlers.onSave);
    banner.appendChild(saveBtn);

    return banner;
}

export function createTimeSetterDiv(onSetTime) {
    const div = document.createElement('div');
    div.className = 'time-setter-div';

    const txtSet = document.createElement('input');
    txtSet.id = 'txt-time-set';
    txtSet.type = 'text';
    txtSet.placeholder = 'Set time in format 01:02:03';
    txtSet.size = 25;
    txtSet.setAttribute('aria-label', 'Set time');

    const btnTimeSet = document.createElement('button');
    btnTimeSet.className = 'time-set-button';
    btnTimeSet.innerText = 'Set Time';
    btnTimeSet.addEventListener('click', onSetTime);
    btnTimeSet.setAttribute('aria-label', 'Set time');

    div.append(txtSet, btnTimeSet);
    return div;
}

export function createTimerDiv() {
    const div = document.createElement('div');
    div.className = 'time-div';
    div.setAttribute('role', 'timer');
    div.setAttribute('aria-label', 'Playback timer');

    const hourSpan = document.createElement('span');
    hourSpan.id = 'hour';
    hourSpan.innerText = '00';
    hourSpan.setAttribute('aria-label', 'hours');
    const colon1 = document.createElement('p');
    colon1.innerText = ':';
    const minuteSpan = document.createElement('span');
    minuteSpan.id = 'minute';
    minuteSpan.innerText = '00';
    minuteSpan.setAttribute('aria-label', 'minutes');
    const colon2 = document.createElement('p');
    colon2.innerText = ':';
    const secondSpan = document.createElement('span');
    secondSpan.id = 'second';
    secondSpan.innerText = '00';
    secondSpan.setAttribute('aria-label', 'seconds');

    div.append(hourSpan, colon1, minuteSpan, colon2, secondSpan);
    return div;
}

export function createTimeStampDiv(handlers) {
    const div = document.createElement('div');
    div.id = 'timestamp-holder';
    div.className = 'timestamp-holder';
    div.setAttribute('role', 'list');
    div.setAttribute('aria-label', 'Timestamps');
    div.style.cssText = [
        'width:100%',
        'overflow-y:auto',
        'max-height:calc(100vh - 15vh - 120px)',
        'padding-top:8px',
        'box-sizing:border-box'
    ].join(';');

    div.addEventListener('dragenter', handlers.onSubEntryDragEnter);
    div.addEventListener('dragover', handlers.onSubEntryDragOver);
    div.addEventListener('dragleave', handlers.onSubEntryDragLeave);
    div.addEventListener('drop', handlers.onEntryDropped);
    return div;
}

export function createTimeButtonDiv(handlers) {
    const div = document.createElement('div');
    div.id = 'timer-button-div';
    div.className = 'timer-button-div';
    const btnTimeEntry = document.createElement('button');
    btnTimeEntry.className = 'timer-entry-btn';
    btnTimeEntry.id = 'btn-entry';
    btnTimeEntry.innerText = 'Create Timestamp';
    btnTimeEntry.addEventListener('click', handlers.onCreateTimestamp);
    btnTimeEntry.setAttribute('aria-label', 'Create timestamp');

    const btnSaveTimestamps = document.createElement('button');
    btnSaveTimestamps.className = 'timer-save-btn';
    btnSaveTimestamps.id = 'btn-save';
    btnSaveTimestamps.innerText = 'Save Timestamps';
    btnSaveTimestamps.addEventListener('click', handlers.onSave);
    btnSaveTimestamps.setAttribute('aria-label', 'Save timestamps');

    // Only include create/save actions in the bottom action bar.
    div.append(btnTimeEntry, btnSaveTimestamps);
    return div;
}

export function createFooter() {
    const footer = document.createElement('footer');
    footer.style.cssText = [
        'display:flex',
        'justify-content:center',
        'gap:32px',
        'padding:20px',
        'border-top:1px solid rgba(59,130,246,0.2)',
        'margin-top:16px',
        'width:100%',
        'box-sizing:border-box'
    ].join(';');

    const linkStyle = 'color:#7eb3ff;text-decoration:none;font-size:0.9rem;';

    const donateLink = document.createElement('a');
    donateLink.textContent = 'Donate';
    donateLink.href = './donate.html';
    donateLink.target = '_blank';
    donateLink.style.cssText = linkStyle;

    const helpLink = document.createElement('a');
    donateLink.setAttribute('rel', 'noopener noreferrer');
    helpLink.href = './instructions.html';
    helpLink.target = '_blank';
    helpLink.textContent = 'Help';
    helpLink.style.cssText = linkStyle;
    helpLink.setAttribute('rel', 'noopener noreferrer');

    footer.append(donateLink, helpLink);
    document.body.append(footer);
}

/**
 * Convert a hh:mm:ss string to total seconds for comparison.
 */
function _timeToSeconds(t) {
    const parts = (t || '').split(':').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return 0;
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

/**
 * Insert a new card into the container sorted by timestamp, newest at top.
 * Scans for the first existing card whose time is strictly less than newTime,
 * and inserts before it. Falls back to append (oldest entry goes to the bottom).
 */
function _insertSorted(container, newCard, newTimeStr) {
    const newSeconds = _timeToSeconds(newTimeStr);
    const existing = container.querySelectorAll(':scope > .time-entry-div');
    for (const card of existing) {
        const spanTime = card.querySelector('.entry-time-span');
        const cardSeconds = _timeToSeconds(spanTime ? spanTime.innerText : '');
        if (cardSeconds < newSeconds) {
            container.insertBefore(newCard, card);
            return;
        }
    }
    // No earlier card found — this is the oldest, append at the bottom
    container.appendChild(newCard);
}

/**
 * Creates a styled time-badge span for use inside the time-list-div grid.
 * Exported so java.js can create matching badges when appending extra times.
 */
export function createTimeSpan(timeText) {
    const span = document.createElement('span');
    span.className = 'entry-time-span';
    span.innerText = timeText;
    span.style.cssText = [
        'display:inline-flex',
        'align-items:center',
        'justify-content:center',
        'background:rgba(11,95,255,0.25)',
        'color:#7eb3ff',
        'font-family:monospace',
        'font-size:0.82rem',
        'font-weight:700',
        'letter-spacing:0.05em',
        'padding:4px 12px',
        'border-radius:20px',
        'white-space:nowrap',
        'cursor:default',
        'user-select:none'
    ].join(';');
    return span;
}

function createEntryBase(topic, timeList, timestamp, handlers) {
    const entryContainer = document.getElementById('timestamp-holder');
    if (!doesExist(entryContainer)) {
        return null;
    }

    // Card wrapper
    const div = document.createElement('div');
    div.draggable = true;
    div.className = 'time-entry-div';
    div.setAttribute('role', 'listitem');
    div.style.cssText = [
        'display:flex',
        'flex-direction:column',
        'gap:0',
        'border-radius:10px',
        'background:rgba(255,255,255,0.06)',
        'border:2px solid #3b82f6',
        'margin-bottom:10px',
        'transition:box-shadow .15s, background .15s'
    ].join(';');
    if (timestamp && timestamp.id) {
        div.id = timestamp.id;
    }

    // Main row: time badge | topic input | delete btn
    const rowDiv = document.createElement('div');
    rowDiv.style.cssText = [
        'display:flex',
        'align-items:center',
        'gap:12px',
        'padding:10px 14px'
    ].join(';');

    // Time badge (pill)
    const timeDiv = document.createElement('div');
    timeDiv.className = 'time-list-div';
    timeDiv.addEventListener('dblclick', handlers.onAppendTime);
    // Grid container: max 2 badge columns per row, expands vertically for more
    timeDiv.style.cssText = [
        'display:grid',
        'grid-template-columns:repeat(2,max-content)',
        'gap:6px 10px',
        'width:fit-content',
        'flex-shrink:0',
        'cursor:default'
    ].join(';');
    timeList.forEach((time) => {
        timeDiv.append(createTimeSpan(time));
    });

    // Topic input
    const entryTextBox = document.createElement('input');
    entryTextBox.type = 'text';
    entryTextBox.className = 'entry-text';
    entryTextBox.placeholder = 'Add a topic…';
    entryTextBox.style.cssText = [
        'flex:1',
        'min-width:0',
        'width:auto',
        'background:transparent',
        'border:none',
        'border-bottom:1px solid rgba(255,255,255,0.15)',
        'color:inherit',
        'font-size:0.95rem',
        'font-family:inherit',
        'padding:4px 4px 4px 2px',
        'outline:none'
    ].join(';');
    if (topic) entryTextBox.value = topic;
    entryTextBox.setAttribute('aria-label', 'Timestamp topic');
    entryTextBox.addEventListener('blur', (event) => handlers.onBlur(event, timeList[0] || ''));

    // Delete button (circular ×)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'entry-delete-btn';
    deleteBtn.setAttribute('aria-label', `Delete timestamp${topic ? ': ' + topic : ''}`);
    deleteBtn.textContent = '×';
    deleteBtn.style.cssText = [
        'flex-shrink:0',
        'width:28px',
        'height:28px',
        'border-radius:50%',
        'border:1px solid rgba(255,255,255,0.2)',
        'background:transparent',
        'color:rgba(255,255,255,0.45)',
        'font-size:1.2rem',
        'line-height:1',
        'cursor:pointer',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'padding:0',
        'transition:background .15s, color .15s'
    ].join(';');
    deleteBtn.addEventListener('pointerenter', () => {
        deleteBtn.style.background = 'rgba(220,50,50,0.25)';
        deleteBtn.style.color = '#ff7070';
    });
    deleteBtn.addEventListener('pointerleave', () => {
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.color = 'rgba(255,255,255,0.45)';
    });
    deleteBtn.addEventListener('click', handlers.onDelete);

    // Extract button (hidden until needed)
    const extractBtn = document.createElement('button');
    extractBtn.className = 'extract-entry-btn';
    extractBtn.hidden = true;
    const extractImg = document.createElement('img');
    extractImg.className = 'extract-icon';
    extractImg.src = './images/extract-icon.png';
    extractImg.width = 20;
    extractImg.height = 20;
    extractImg.alt = 'Extract timestamp';
    extractBtn.appendChild(extractImg);
    extractBtn.addEventListener('click', handlers.onExtractClick);

    rowDiv.append(timeDiv, entryTextBox, extractBtn, deleteBtn);

    // Sub-entry drop zone (below the main row)
    const subEntryDiv = document.createElement('div');
    subEntryDiv.className = 'sub-stamp-entry-div';
    subEntryDiv.addEventListener('drop', handlers.onEntryDropped);
    subEntryDiv.addEventListener('dragenter', handlers.onSubEntryDragEnter);
    subEntryDiv.addEventListener('dragover', handlers.onSubEntryDragOver);
    subEntryDiv.addEventListener('dragleave', handlers.onSubEntryDragLeave);

    div.addEventListener('dragstart', handlers.onEntryDragStart);
    div.append(rowDiv, subEntryDiv);
    _insertSorted(entryContainer, div, timeList[0] || '00:00:00');

    // Auto-focus topic input for quick entry
    entryTextBox.focus();
    return div;
}

export function createTimeEntry(time, handlers) {
    return createEntryBase('', [time], null, handlers);
}

export function createExistingTimeEntry(topic, timeList, timestamp, handlers) {
    return createEntryBase(topic, timeList, timestamp, handlers);
}

export function createExistingEntries(entries, handlers) {
    entries.forEach((entry) => {
        if (entry === '') {
            return;
        }
        const entryArry = entry.split(' - ');
        if (entryArry.length !== 2) {
            return;
        }
        const topic = entryArry[1].trim();
        const timeListFormated = [];
        const timeList = entryArry[0].split(',');
        timeList.forEach((time) => {
            let unitArry = getUnits(time);
            unitArry = formatUnits(unitArry);
            timeListFormated.push(unitArry.join(':'));
        });
        const timestamp = new Timestamp(timeListFormated, topic, 0);
        const parentDiv = createExistingTimeEntry(topic, timeListFormated, timestamp, handlers);
        if (doesExist(parentDiv)) {
            stampMap.set(parentDiv, timestamp);
        }
    });
}
