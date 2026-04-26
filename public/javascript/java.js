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
import { updatePage, createTimeEntry, createExistingTimeEntry, createExistingEntries } from './ui.js';

var fileNameTitle = "timestamp";

const timer = new Timer();
const reader = new FileReader();
var draggedEntry = null;

const uiHandlers = {
    onSetTime: setTime,
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

    if (doesExist(titleButton)) {
        titleButton.addEventListener("click", addTitle);
    }

    if (doesExist(selectButton)) {
        selectButton.addEventListener("click", loadFile);
    }
}

initApp();

function addTitle(){
    let titleInput = document.getElementById("title");
    if(doesExist(titleInput)){
        let title = titleInput.value;

        if(title === "")
        {
            alert("Title cannot be blank.");
            return;
        }

        if(doesExist(title))
        {
            updatePage(title.toUpperCase(), uiHandlers);
            fileNameTitle = title;
        }
    }
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

/**
 * Writes timesamp to flat file
 * @param {*} timeStamp that should be written
 * @param {*} entry that contains the timestamps
 * @param {*} position number of indentations that should be used when writing the timestamp.
 * @returns text of the written version of the timestamp.
 */

/**
 * Returns the path to the entry div.
 * @param {*} entryDiv whos path is returned
 * @returns An array of div ids that goes to the specified div.
 */

/**
 * Updates the local file with the new entries found in the map.
 */

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
            createTimeEntry(getCurrentTime());
        }
        else if(event.ctrlKey && event.key === 's')
        {
            event.preventDefault();
            updateStampFile(fileNameTitle);
        }
    }
}

function createTimeStamp(event){
    createTimeEntry(getCurrentTime());
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

    if(isValidDestinationTarget(event.target.parentNode) === false)
    {
        alert("Please enter a topic into the timestamp you wish to drag to.");
        draggedEntry = null;
        event.target.classList.remove('dragover');
        return;
    }

    let selfSubDivHolder = getSelfSubEntryDiv(draggedEntry);

    // Enable the extraction button.
    enableExtractionButton(draggedEntry);

    if(doesExist(selfSubDivHolder) && event.target == selfSubDivHolder)
    {
        return;
    }

    if (event.target.classList.contains("sub-stamp-entry-div"))
    {
        let sourceParent = getTopParentEntry(draggedEntry);
        let destinationParent = getTopParentEntry(event.target);
        let sourcePath = getEntryPath(draggedEntry);
        let destinationPath = getEntryPath(event.target);
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
            event.target.appendChild(draggedEntry);
        }

        if (doesExist(sourceParent) == false || doesExist(destinationParent) == false)
        {
            alert("Please make sure that the destination timestamp has a topic before relocating.");
        }
    
    }
    draggedEntry = null;
    event.target.classList.remove('dragover');
}

function onSubEntryDragOver(event)
{
    event.preventDefault();
}

function onEntryDragStart(event)
{
    if (isValidSourceTargetToDrag(event.target) == false)
    {
        alert("Please enter a topic for the timestamp that you wish move.");
        return;
    }
    draggedEntry = event.target;
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
    let timeDiv = event.target;
    if(doesExist(timeDiv))
    {   
        let currentTime = getCurrentTime();
        let timeSpan = document.createElement('span');
        timeSpan.className = "entry-time-span";
        timeSpan.innerText = currentTime;
        timeDiv.parentNode.append(timeSpan);
        let parentEntry = getTopParentEntry(timeDiv);
        let path = getEntryPath(timeDiv.parentNode.parentNode);
        addTimeStampTime(parentEntry, path, currentTime);
    }
}

function onExtractClick(event)
{
    let extractBtn = event.target;
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

