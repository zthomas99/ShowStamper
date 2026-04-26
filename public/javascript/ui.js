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
    titleH2.style = 'margin-left: 10px';
    document.body.append(titleH2);

    const timerDiv = createTimerDiv();
    const timestampDiv = createTimeStampDiv(handlers);
    const timerButtonDiv = createTimeButtonDiv(handlers);
    const timeSetterDiv = createTimeSetterDiv(handlers.onSetTime);

    document.body.append(timerDiv);
    document.body.append(timerButtonDiv);
    document.body.append(timeSetterDiv);
    document.body.append(timestampDiv);

    createFooter();
    if (typeof handlers.onKeyPress === 'function') {
        document.addEventListener('keypress', handlers.onKeyPress);
    }
}

export function createTimeSetterDiv(onSetTime) {
    const div = document.createElement('div');
    div.className = 'time-setter-div';

    const txtSet = document.createElement('input');
    txtSet.id = 'txt-time-set';
    txtSet.type = 'text';
    txtSet.placeholder = 'Set time in format 01:02:03';
    txtSet.size = 25;

    const btnTimeSet = document.createElement('button');
    btnTimeSet.className = 'time-set-button';
    btnTimeSet.innerText = 'Set Time';
    btnTimeSet.addEventListener('click', onSetTime);

    div.append(txtSet, btnTimeSet);
    return div;
}

export function createTimerDiv() {
    const div = document.createElement('div');
    div.className = 'time-div';
    div.style = 'margin-left: 10px';

    const hourSpan = document.createElement('span');
    hourSpan.id = 'hour';
    hourSpan.innerText = '00';
    const colon1 = document.createElement('p');
    colon1.innerText = ':';
    const minuteSpan = document.createElement('span');
    minuteSpan.id = 'minute';
    minuteSpan.innerText = '00';
    const colon2 = document.createElement('p');
    colon2.innerText = ':';
    const secondSpan = document.createElement('span');
    secondSpan.id = 'second';
    secondSpan.innerText = '00';

    div.append(hourSpan, colon1, minuteSpan, colon2, secondSpan);
    return div;
}

export function createTimeStampDiv(handlers) {
    const div = document.createElement('div');
    div.id = 'timestamp-holder';
    div.className = 'timestamp-holder';
    div.append(document.createElement('br'), document.createElement('br'));

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

    const btnStart = document.createElement('button');
    btnStart.className = 'timer-btn';
    btnStart.id = 'btn-start';
    btnStart.innerText = 'Start Timer';
    btnStart.addEventListener('click', handlers.onStart);

    const btnStop = document.createElement('button');
    btnStop.className = 'timer-btn';
    btnStop.id = 'btn-stop';
    btnStop.innerText = 'Stop Timer';
    btnStop.addEventListener('click', handlers.onStop);

    const btnTimeEntry = document.createElement('button');
    btnTimeEntry.className = 'timer-entry-btn';
    btnTimeEntry.id = 'btn-entry';
    btnTimeEntry.innerText = 'Create Timestamp';
    btnTimeEntry.addEventListener('click', handlers.onCreateTimestamp);

    const btnSaveTimestamps = document.createElement('button');
    btnSaveTimestamps.className = 'timer-save-btn';
    btnSaveTimestamps.id = 'btn-save';
    btnSaveTimestamps.innerText = 'Save Timestamps';
    btnSaveTimestamps.addEventListener('click', handlers.onSave);

    div.append(btnStart, btnStop, btnTimeEntry, btnSaveTimestamps);
    return div;
}

export function createFooter() {
    const footer = document.createElement('footer');
    const donateLink = document.createElement('a');
    donateLink.className = 'footer-link footer-link-donate';
    donateLink.textContent = 'Donate';
    donateLink.href = './donate.html';
    donateLink.target = '_blank';

    const helpLink = document.createElement('a');
    helpLink.href = './instructions.html';
    helpLink.target = '_blank';
    helpLink.className = 'footer-link';
    helpLink.textContent = 'Help';

    footer.append(donateLink, helpLink);
    document.body.append(footer);
}

function createEntryBase(topic, timeList, timestamp, handlers) {
    const entryContainer = document.getElementById('timestamp-holder');
    if (!doesExist(entryContainer)) {
        return null;
    }

    const div = document.createElement('div');
    div.draggable = true;
    div.className = 'time-entry-div';
    if (timestamp && timestamp.id) {
        div.id = timestamp.id;
    }

    const horizontalDiv = document.createElement('div');
    horizontalDiv.className = 'time-entry-horiztonal-div';

    const timeDiv = document.createElement('div');
    timeDiv.className = 'time-list-div';
    timeDiv.addEventListener('dblclick', handlers.onAppendTime);

    timeList.forEach((time) => {
        const entrySpan = document.createElement('span');
        entrySpan.className = 'entry-time-span';
        entrySpan.innerText = time;
        timeDiv.append(entrySpan);
    });

    const navBtnDiv = document.createElement('div');
    navBtnDiv.className = 'navigation-btn-div';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'entry-delete-btn';
    deleteBtn.innerHTML = "<img src='./images/close.png' width='25' height='25' alt='closebtn' border='0' />";
    deleteBtn.addEventListener('click', handlers.onDelete);

    const extractBtn = document.createElement('button');
    extractBtn.className = 'extract-entry-btn';
    extractBtn.style = 'display: none';
    extractBtn.innerHTML = "<img class='extract-icon' src='./images/extract-icon.png' width='25' height='25' alt='extractbtn' border='0' />";
    extractBtn.addEventListener('click', handlers.onExtractClick);

    const topicDiv = document.createElement('div');
    topicDiv.className = 'topic-div';

    const entryTextBox = document.createElement('input');
    entryTextBox.mode = 'text';
    entryTextBox.className = 'entry-text';
    entryTextBox.size = 90;
    entryTextBox.placeholder = 'Timestamp Topic';
    if (topic) {
        entryTextBox.value = topic;
    }
    entryTextBox.addEventListener('blur', (event) => handlers.onBlur(event, timeList[0] || ''));

    const subEntryDiv = document.createElement('div');
    subEntryDiv.className = 'sub-stamp-entry-div';
    subEntryDiv.addEventListener('drop', handlers.onEntryDropped);
    subEntryDiv.addEventListener('dragenter', handlers.onSubEntryDragEnter);
    subEntryDiv.addEventListener('dragover', handlers.onSubEntryDragOver);
    subEntryDiv.addEventListener('dragleave', handlers.onSubEntryDragLeave);

    div.addEventListener('dragstart', handlers.onEntryDragStart);

    horizontalDiv.append(timeDiv);
    navBtnDiv.append(extractBtn, deleteBtn);
    horizontalDiv.append(navBtnDiv);
    topicDiv.append(entryTextBox);
    div.append(horizontalDiv, topicDiv, subEntryDiv);
    entryContainer.append(div);
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
