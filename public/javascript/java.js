import { Timestamp } from './TimeStamp.js';
import { Timer } from './timer.js';
import {
    doesExist,
    querySelectChildren,
    querySelectParents,
    getTopParentEntry,
    getParentEntry,
    getEntryPath,
    getSelfSubEntryDiv,
    generateIndentions,
    formatTime,
    getUnits,
    formatUnits,
    isValidSourceTargetToDrag,
    isValidDestinationTarget,
    isValidSetTime
} from './domUtils.js';
import {
    stampMap,
    addTimestampToMap,
    removeTimestampToMap,
    removeSubTimeStampToMapById,
    updateTimestampTopic,
    addTimeStampTime,
    removeTimeStampTime,
    updateStampFile
} from './stampManager.js';
import { updatePage, createTimeEntry, createExistingTimeEntry, createExistingEntries, createTimeSpan } from './ui.js';
import { YouTubeTimeSource, WallClockTimer, extractVideoId } from './timeSource.js';

var fileNameTitle = "timestamp";

let timer = new Timer();
const reader = new FileReader();
var draggedEntry = null;
let txtSelect;

const uiHandlers = {
    onSetTime: setTime,
    onSetTimeValue: setTimeValue,
    onGetCurrentTime: getCurrentTime,
    onStart: startTimer,
    onStop: stopTimer,
    onCreateTimestamp: createTimeStamp,
    onSave: saveTimeStamps,
    onKeyPress: handleKeyPress,
    onSubEntryDragEnter: onSubEntryDragEnter,
    onSubEntryDragOver: onSubEntryDragOver,
    onSubEntryDragLeave: onSubEntryDragLeave,
    onEntryDropped: onEntryDropped,
    onEntryDragStart: onEntryDragStart,
    onAppendTime: appendTime,
    onDelete: deleteTimeEntry,
    onExtractClick: onExtractClick,
    onBlur: addToMap
};

reader.addEventListener("load", readTextFile);

export function initApp() {
    const titleButton = document.getElementById("title-submit");
    const selectButton = document.getElementById("btn-stamp-loader");
    txtSelect = document.getElementById('txt-path');

    if (doesExist(titleButton)) {
        titleButton.addEventListener("click", addTitle);
    }

    if (doesExist(selectButton)) {
        selectButton.addEventListener("click", loadFile);
    }

    // Show/hide YouTube URL input based on selected timing mode
    document.querySelectorAll('input[name="timing-mode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const ytRow = document.getElementById('youtube-url-row');
            if (ytRow) ytRow.style.display = radio.value === 'youtube' ? 'flex' : 'none';
        });
    });
}

initApp();

function addTitle(){
    let titleInput = document.getElementById("title");
    if(!doesExist(titleInput)) return;

    const title = titleInput.value;
    if (title === "") {
        alert("Title cannot be blank.");
        return;
    }

    const selectedMode = (document.querySelector('input[name="timing-mode"]:checked') || {}).value || 'manual';

    if (selectedMode === 'youtube') {
        const ytInput = document.getElementById('youtube-url');
        const videoId = extractVideoId(ytInput ? ytInput.value : '');
        if (!videoId) {
            alert('Please enter a valid YouTube URL or video ID.');
            return;
        }
        timer = new YouTubeTimeSource(videoId);
        updatePage(title.toUpperCase(), uiHandlers);
        fileNameTitle = title;

        // Create a collapsible player section below the banner
        const playerSection = _createYouTubePlayerSection();
        const banner = document.getElementById('top-banner');
        if (banner && banner.nextSibling) {
            document.body.insertBefore(playerSection, banner.nextSibling);
        } else {
            document.body.appendChild(playerSection);
        }
        timer.init('yt-player-frame').then(() => {
            console.log('YouTube player ready');
        });
    } else if (selectedMode === 'wallclock') {
        timer = new WallClockTimer();
        updatePage(title.toUpperCase(), uiHandlers);
        fileNameTitle = title;
    } else {
        timer = new Timer();
        updatePage(title.toUpperCase(), uiHandlers);
        fileNameTitle = title;
    }
}

/** Build the collapsible YouTube player section injected below the banner */
function _createYouTubePlayerSection() {
    const section = document.createElement('div');
    section.id = 'yt-player-section';
    section.style.cssText = [
        'width:100%',
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'background:#111',
        'border-bottom:2px solid #3b82f6'
    ].join(';');

    const toggleBar = document.createElement('button');
    toggleBar.style.cssText = [
        'width:100%',
        'background:rgba(255,255,255,0.05)',
        'border:none',
        'color:rgba(255,255,255,0.6)',
        'font-size:0.8rem',
        'padding:4px',
        'cursor:pointer',
        'text-align:center'
    ].join(';');
    toggleBar.textContent = '▲ Hide stream';

    const playerWrapper = document.createElement('div');
    playerWrapper.style.cssText = [
        'width:100%',
        'max-width:640px',
        'aspect-ratio:16/9',
        'margin:0 auto'
    ].join(';');

    // The IFrame API replaces this div with the player iframe
    const playerFrame = document.createElement('div');
    playerFrame.id = 'yt-player-frame';
    playerFrame.style.cssText = 'width:100%;height:100%;';
    playerWrapper.appendChild(playerFrame);

    let visible = true;
    toggleBar.addEventListener('click', () => {
        visible = !visible;
        playerWrapper.style.display = visible ? 'block' : 'none';
        toggleBar.textContent = visible ? '▲ Hide stream' : '▼ Show stream';
    });

    section.append(playerWrapper, toggleBar);
    return section;
}

/**
 * Updates the page with the title and buttons to start the timer.
 * @param {*} title used to display at the top of the page.
 */
function loadFile(){
    let input = document.createElement("input");
    input.type = 'file';
    input.onchange = _ =>{
        if(doesExist(txtSelect)){
            txtSelect.value = input.files[0].name;
        }
        reader.readAsText(input.files[0]);
    }
    input.click();
}

function createPageWithStamps(stampsArry){
    let title = stampsArry[0];
    fileNameTitle = title;
    updatePage(title, uiHandlers);
    let entries = stampsArry.slice(1);
    createExistingEntries(entries, uiHandlers);
}

/**
 * Starts the timer.
 */
function startTimer(){
    console.log("Starting timer....");
    timer.start();
}

/**
 * Stops the time for later resuming.
 */
function stopTimer(){
    timer.stop();
    console.log("Timer has stopped");
}

function setTime(){
    const txtTimeSetter = document.getElementById("txt-time-set");

    if (doesExist(txtTimeSetter)) {
        let time = txtTimeSetter.value;

        if (time !== "" && timer.setTime(time)) {
            return;
        }
        alert("This is an incorrect time format to set.\n Please use the hour:minute:second (00:00:00) format.");
    }
}

function setTimeValue(time) {
    if (time && timer.setTime(time)) {
        return true;
    }
    return false;
}

function getCurrentTime()
{
    return timer.getCurrentTime();
}

function moveEntry(sourceEntry, destinationEntry)
{
    if(doesExist(sourceEntry) === false)
    {
        return;
    }

    if(doesExist(destinationEntry) === false)
    {
        return;
    }

    let sourceEntrySubHolder = querySelectParents("sub-stamp-entry-div", sourceEntry);
    let destinationEntrySubHolder = querySelectChildren("sub-stamp-entry-div", destinationEntry);

    if(doesExist(sourceEntrySubHolder) && doesExist(destinationEntrySubHolder))
    {
        sourceEntrySubHolder.removeChild(sourceEntry);
        destinationEntrySubHolder.appendChild(sourceEntry);
    }
}

/**
 * Moves entry to timestamp-subholder;
 * @param {*} sourceEntry 
 */
function moveEntryToTop(sourceEntry)
{
    if(doesExist(sourceEntry) === false)
    {
        return;
    }

    let timeStampHolder = querySelectChildren("timestamp-holder", document);
    let sourceEntrySubHolder = querySelectParents("sub-stamp-entry-div", sourceEntry);

    if(doesExist(timeStampHolder) && doesExist(sourceEntrySubHolder))
    {
        sourceEntrySubHolder.removeChild(sourceEntry);
        timeStampHolder.appendChild(sourceEntry);
    }
}

/**
 * Enables the extraction button for source entry.
 * @param {*} sourceEntry that contains the extraction button.
 */
function enableExtractionButton(sourceEntry)
{
    if(doesExist(sourceEntry) === false)
    {
        return;
    }

    let extractionButton = querySelectChildren("extract-entry-btn", sourceEntry);
    if(doesExist(extractionButton))
    {
        extractionButton.style = "display: inline-block";
        let image = querySelectChildren("extract-icon", extractionButton);
        if(doesExist(image))
        {
            image.style = "display:inline-block";
        }
    }
}

function retrieveTimeStamps(timeDiv)
{
    let timeArry = [];
    timeDiv.children.forEach((timeSpan) =>{
        if(timeSpan.classList.contains("entry-time-span"))
        {
            timeArry.push(timeSpan.innerText);
        }
    });
    return timeArry;
}

// Event Handlers

/**
 * Handles adding new entries to the local map.
 * Triggered from blur event of the entry text box.
 * @param {*} event that calls the handler function
 * @param {*} time assoicated with the event.
 */
function addToMap(event, time)
{
    let txtEntry = event.target;
    let entryDiv = txtEntry.parentNode.parentNode;
    let txtValue = txtEntry.value.trim();

    if (doesExist(txtEntry) && txtValue !== '' && doesExist(entryDiv))
    {
        if (entryDiv.classList.contains("time-entry-div") && entryDiv.id === '')
        {
            let path = getEntryPath(entryDiv);
            let timeStamp = null;
            if(path.length == 0)
            {
                timeStamp = new Timestamp(time, txtValue, 1);
            }
            else
            {
                timeStamp = new Timestamp(time, txtValue, path.length + 1);
            }
            // wait until after the path has been created to add the div id.
            // adding the id to the div before then will create a path list with an id that is 
            // not listed in the subTimeStamps.
            entryDiv.id = timeStamp.id;
            addTimestampToMap(getTopParentEntry(entryDiv), path, timeStamp);
            //updateStampFile();
        }
        else if (entryDiv.id !== '' && entryDiv.classList.contains("time-entry-div"))
        {
            // div id exist so this is an on blur for a timestamp that was already added.
            // we need to update the topic of the existing timestamp instead of adding.
            let path  = getEntryPath(entryDiv);
            updateTimestampTopic(getTopParentEntry(entryDiv), path, txtValue);
            //updateStampFile();
        }
    }
}

/**
 * Handles when key press is made on the page.
 * @param {*} event from key press.
 */
function handleKeyPress(event){
    if(doesExist(event)){
        if(event.key === '*'){
            createTimeEntry(getCurrentTime(), uiHandlers);
        }
        else if(event.ctrlKey && event.key === 's')
        {
            event.preventDefault();
            updateStampFile(fileNameTitle);
        }
    }
}

function createTimeStamp(event){
    createTimeEntry(getCurrentTime(), uiHandlers);
}

function saveTimeStamps(event){
    updateStampFile(fileNameTitle);
}

function readTextFile(){
    try {
        const content = reader.result;
        if (typeof content !== 'string') {
            throw new Error('Invalid file content');
        }
        let contentArry = content.split('\n');
        createPageWithStamps(contentArry);
    } catch (error) {
        console.error('Error reading file:', error);
        alert('Failed to load the file. Please check the format.');
    }
}

function onEntryDropped(event)
{
    event.preventDefault();
    if(doesExist(draggedEntry) === false)
    {
        return;
    }

    // Resolve the destination: the drop can land on the sub-stamp-entry-div,
    // directly on a time-entry-div, or anywhere inside one. Walk up to find
    // the nearest time-entry-div or sub-stamp-entry-div.
    let dropTarget = event.target;
    while (doesExist(dropTarget) &&
           !dropTarget.classList.contains('sub-stamp-entry-div') &&
           !dropTarget.classList.contains('timestamp-holder')) {
        if (dropTarget.classList.contains('time-entry-div')) {
            // Dropped onto the card itself — use its sub-entry div as target
            const sub = getSelfSubEntryDiv(dropTarget);
            if (doesExist(sub)) { dropTarget = sub; }
            break;
        }
        dropTarget = dropTarget.parentNode;
    }

    if (!doesExist(dropTarget) || dropTarget.classList.contains('timestamp-holder')) {
        draggedEntry = null;
        return;
    }

    if(isValidDestinationTarget(dropTarget.parentNode) === false)
    {
        alert("Please enter a topic into the timestamp you wish to drag to.");
        draggedEntry = null;
        event.target.classList.remove('dragover');
        return;
    }

    let selfSubDivHolder = getSelfSubEntryDiv(draggedEntry);

    // Enable the extraction button.
    enableExtractionButton(draggedEntry);

    if(doesExist(selfSubDivHolder) && dropTarget == selfSubDivHolder)
    {
        return;
    }

    if (dropTarget.classList.contains("sub-stamp-entry-div"))
    {
        let sourceParent = getTopParentEntry(draggedEntry);
        let destinationParent = getTopParentEntry(dropTarget);
        let sourcePath = getEntryPath(draggedEntry);
        let destinationPath = getEntryPath(dropTarget);
        if (doesExist(sourceParent) && doesExist(destinationParent) && doesExist(sourcePath) && doesExist(destinationPath))
        {
            if (stampMap.has(sourceParent) && stampMap.has(destinationParent))
            {
                let timestamp = stampMap.get(draggedEntry);
                if (doesExist(timestamp))
                {
                    removeTimestampToMap(sourceParent, sourcePath);
                    addTimestampToMap(destinationParent, destinationPath, timestamp);
                }
                else
                {
                    let removedStamp = removeSubTimeStampToMapById(sourceParent, sourcePath, draggedEntry.id);
                    if (doesExist(removedStamp))
                    {
                        addTimestampToMap(draggedEntry, destinationPath, removedStamp);
                    }
                }
            }
            draggedEntry.parentNode.removeChild(draggedEntry);
            dropTarget.appendChild(draggedEntry);
        }

        if (doesExist(sourceParent) == false || doesExist(destinationParent) == false)
        {
            alert("Please make sure that the destination timestamp has a topic before relocating.");
        }
    
    }
    draggedEntry = null;
    dropTarget.classList.remove('dragover');
}

function onSubEntryDragOver(event)
{
    event.preventDefault();
}

function onEntryDragStart(event)
{
    // Use currentTarget (the time-entry-div with the listener) rather than
    // target (whichever child element the cursor happened to grab), so the
    // id check and draggedEntry assignment always reference the card element.
    if (isValidSourceTargetToDrag(event.currentTarget) == false)
    {
        alert("Please enter a topic for the timestamp that you wish move.");
        return;
    }
    draggedEntry = event.currentTarget;
}

function onSubEntryDragEnter(event)
{
    let selfSubDivHolder = getSelfSubEntryDiv(draggedEntry);

    if(doesExist(selfSubDivHolder) == false  ||  event.target === selfSubDivHolder )
    {
        return;
    }

    if(event.target.classList.contains("sub-stamp-entry-div") || event.target.classList.contains("timestamp-holder"))
    {
        event.target.classList.add("dragover");
    }
}

function onSubEntryDragLeave(event)
{
    if (event.target.classList.contains('sub-stamp-entry-div') || event.target.classList.contains("timestamp-holder"))
    {
        event.target.classList.remove('dragover');
    }
}

function appendTime(event)
{
    // Walk up to .time-list-div so this works whether the dblclick landed on
    // the container background or on one of the inner badge spans.
    let timeListDiv = querySelectParents("time-list-div", event.target);
    if(doesExist(timeListDiv))
    {   
        let currentTime = getCurrentTime();
        timeListDiv.append(createTimeSpan(currentTime));
        let timeEntryDiv = querySelectParents("time-entry-div", timeListDiv);
        let parentEntry = getTopParentEntry(timeEntryDiv);
        let path = getEntryPath(timeEntryDiv);
        addTimeStampTime(parentEntry, path, currentTime);
    }
}

function onExtractClick(event)
{
    // Use currentTarget (the button element the listener is on) rather than
    // target (which may be the <img> child). Setting display:none on the img
    // would leave the transparent 25×25 button shell still visible.
    let extractBtn = event.currentTarget;
    if (doesExist(extractBtn))
    {
        let sourceEntry = querySelectParents("time-entry-div", event.target);

        if(doesExist(sourceEntry) === false)
        {
            return;
        }

        let topParentEntry = getTopParentEntry(sourceEntry);
        let sourcePath = getEntryPath(sourceEntry); // path will always exist.
        let parentEntry = getParentEntry(sourceEntry); // direct parent that owns the sub-entry that was clicked.
        
        if (doesExist(parentEntry) === false)
        {
            return;
        }

        let destinationEntry = getParentEntry(parentEntry); // one entry above the parent entry owner.

        if (doesExist(topParentEntry) === false)
        {
            return;
        }

        //move entry and timestamp to the direct parent entry
        let removedTimeStamp = removeSubTimeStampToMapById(topParentEntry, sourcePath, sourceEntry.id);
        if (doesExist(removedTimeStamp))
        {
            if(doesExist(destinationEntry))
            {
                // One entry above exists moving to above entry's subholder
                destinationPath = getEntryPath(destinationEntry);
                addTimestampToMap(topParentEntry, destinationPath, removedTimeStamp);
                moveEntry(sourceEntry, destinationEntry);
            }
            else
            {
                // entry above does not exist moving to top
                let emptyPath = [];
                addTimestampToMap(sourceEntry, emptyPath, removedTimeStamp);
                moveEntryToTop(sourceEntry);
                extractBtn.style = "display: none";
            }           
        }
    }       
}

function deleteTimeEntry(event)
{
   let closeBtn = event.target;

    const response = confirm("Are you sure you wish to delete the timestamp entry?");

    if(response)
    {
        if(doesExist(closeBtn))
        {
            let timeEntry = querySelectParents("time-entry-div", event.target);
            let parentyEntry = getTopParentEntry(timeEntry);
            let entryPath = getEntryPath(timeEntry);
            let timeStamp;

            if (doesExist(parentyEntry))
            {
                timeStamp = stampMap.get(parentyEntry);
            }

            // if timestamp does not exit just remove the div entry for the time entry without 
            // removing stamp map entyry.

            if (doesExist(timeEntry.parentNode) && doesExist(timeEntry))
            {
                timeEntry.parentNode.removeChild(timeEntry);
            }

            if(doesExist(timeStamp) === false || doesExist(timeEntry) === false || doesExist(parentyEntry) === false  || doesExist(entryPath) === false )
            {  
                return;
            }
            if (entryPath.length === 0) {
                removeTimestampToMap(parentyEntry, entryPath);
            } else {
                let pathToParent = entryPath.slice(0, -1);
                removeSubTimeStampToMapById(parentyEntry, pathToParent, timeEntry.id);
            }
        }
    }
}

