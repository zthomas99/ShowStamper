import { Timestamp } from './TimeStamp.js';

const titleContainer = document.getElementById("title-container");
const orContainer = document.getElementById("or-container");
const selectContainer = document.getElementById("select-container");
const titleButton = document.getElementById("title-submit");
const selectButton = document.getElementById("btn-stamp-loader");
const txtSelect = document.getElementById("txt-path");
const innerContentContainer = document.getElementById("inner-content-container");
const contentContainer = document.getElementById("content-container");

var fileNameTitle = "timestamp";

// The wake lock sentinel.
let wakeLock = null;

let hour = 0;
let minute = 0;
let second = 0;
let millisecond = 0;
let isPaused = false;
let watch;

let stampMap = new Map();

const reader= new FileReader();
var draggedEntry = null;

reader.addEventListener("load", readTextFile);

if(doesExist(titleButton)){
    titleButton.addEventListener("click", addTitle);
}

if(doesExist(selectButton)){
    selectButton.addEventListener("click", loadFile)
}

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
            updatePage(title.toUpperCase());
            fileNameTitle = title;
        }
    }
}

/**
 * Updates the page with the title and buttons to start the timer.
 * @param {*} title used to display at the top of the page.
 */
function updatePage(title){
    if(doesExist(titleContainer) ){
        titleContainer.remove();
    }

    if(doesExist(orContainer)){
        orContainer.remove();
    }

    if(doesExist(selectContainer)){
        selectContainer.remove();
    }

    if(doesExist(innerContentContainer))
    {
        innerContentContainer.remove();
    }

    if(doesExist(contentContainer))
    {
        contentContainer.remove();
    }

    const titleH2 = document.createElement("h2");
    titleH2.innerText = title;
    titleH2.style = "margin-left: 10px";
    document.body.append(titleH2);
    const timerDiv =  createTimerDiv();
    const timestampDiv = createTimeStampDiv();
    const timerButtonDiv = createTimeButtonDiv();
    const timeSetterDiv = createTimeSetterDiv();

    if(doesExist(timerDiv)){
        document.body.append(timerDiv);
    }

    if(doesExist(timerButtonDiv)){
        document.body.append(timerButtonDiv);
    }

    if(doesExist(timeSetterDiv)){
        document.body.append(timeSetterDiv);
    }

    if(doesExist(timestampDiv)){
        document.body.append(timestampDiv);
    }

    createFooter();
    document.addEventListener("keypress", handleKeyPress);
}

function createTimeSetterDiv(){
    const div = document.createElement("div");
    div.className = "time-setter-div";

    const txtSet = document.createElement("input");
    txtSet.id = "txt-time-set";
    txtSet.type = "text";
    txtSet.placeholder = "Set time in format 01:02:03";
    txtSet.size = 25;

    const btnTimeSet = document.createElement("button");
    btnTimeSet.className = "time-set-button";
    btnTimeSet.innerText = "Set Time";
    btnTimeSet.addEventListener("click", setTime);

    div.append(txtSet);
    div.append(btnTimeSet);

    return div;
}
/**
 * Creates the div container that holds the timer dispaly.
 * @returns the div used to show the timer.
 */
function createTimerDiv(){
    const div = document.createElement("div");
    div.className = "time-div";
    div.style = "margin-left: 10px";
    const hourSpan = document.createElement("span");
    hourSpan.id = "hour";
    hourSpan.innerText = "00"
    const colon1 = document.createElement("p");
    colon1.innerText = ":";
    
    const minuteSpan = document.createElement("span");
    minuteSpan.id = "minute";
    minuteSpan.innerText = "00";
    const colon2 = document.createElement("p");
    colon2.innerText = ":";

    const secondSpan = document.createElement("span");
    secondSpan.id = "second";
    secondSpan.innerText = "00";

    div.append(hourSpan);
    div.append(colon1);
    div.append(minuteSpan);
    div.append(colon2);
    div.append(secondSpan);
   return  div;
}

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
    updatePage(title);
    let entries = stampsArry.slice(1);
    createExistingEntries(entries);
}


/**
 * Creates the container that holds the time entries.
 * @returns div container to hold the timer entries.
 */
function createTimeStampDiv(){
    const div = document.createElement("div");
    div.id = "timestamp-holder";
    div.className = "timestamp-holder";
    const break1 = document.createElement('br');
    const break2 = document.createElement('br');
    div.append(break1);
    div.append(break2);

    div.addEventListener("dragenter", onSubEntryDragEnter);
    div.addEventListener("dragover", onSubEntryDragOver);
    div.addEventListener('dragleave', onSubEntryDragLeave);
    div.addEventListener('drop',onEntryDropped);
    return div;
}

/**
 * Creates the timer button div and adds the buttons to the page.
 * @returns div used for timer buttons.
 */
function createTimeButtonDiv(){
    const div = document.createElement("div");
    div.id = "timer-button-div";
    div.className = "timer-button-div";

    // create timer buttons
    const btnStart = document.createElement("button");
    btnStart.className = "timer-btn";
    btnStart.id = "btn-start";
    btnStart.innerText = "Start Timer";
    btnStart.addEventListener("click", startTimer);

    // create stop timer button
    const btnStop = document.createElement("button");
    btnStop.className = "timer-btn";
    btnStop.id = "btn-stop";
    btnStop.innerText = "Stop Timer";
    btnStop.addEventListener("click", stopTimer);

    // create time entry button
    const btnTimeEntry = document.createElement("button");
    btnTimeEntry.className = "timer-entry-btn";
    btnTimeEntry.id = "btn-entry";
    btnTimeEntry.innerText = "Create Timestamp";
    btnTimeEntry.addEventListener("click", createTimeStamp);

    // create save time stamps button
    const btnSaveTimestamps = document.createElement("button");
    btnSaveTimestamps.className = "timer-save-btn";
    btnSaveTimestamps.id = "btn-save";
    btnSaveTimestamps.innerText = "Save Timestamps";
    btnSaveTimestamps.addEventListener("click", saveTimeStamps);

    // add elements to div
    div.append(btnStart);
    div.append(btnStop);
    div.append(btnTimeEntry);
    div.append(btnSaveTimestamps);

    // return div
    return div;
}

function createFooter(){
    const footer = document.createElement('footer');
    const donateLink = document.createElement("a");
    donateLink.className = "footer-link footer-link-donate"
    donateLink.textContent = "Donate"
    donateLink.href = "./donate.html"
    donateLink.target = '_blank';
    const helpLink = document.createElement('a');
    helpLink.href = './instructions.html';
    helpLink.target ='_blank';
    helpLink.className = "footer-link";
    helpLink.textContent = "Help";
    footer.append(donateLink);
    footer.append(helpLink);
    document.body.append(footer);
}
function doesExist(element){
    if (element !== undefined && element !== null){
        return true;
    }
    return false;
}

/**
 * Starts the timer.
 */
function startTimer(){
 console.log("Starting timer....");
 if(doesExist(watch) == false || isPaused){
 watch = window.setInterval(timer,100);
 requestWakeLock();
 isPaused = false;
 }
}

/**
 * Stops the time for later resuming.
 */
function stopTimer(){
   if(doesExist(watch)){
    clearInterval(watch)
    isPaused = true;
    releaseWakeLock();
    console.log("Timer has stopped");
   }
}

// Function that attempts to request a wake lock.
const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
      console.log('Wake Lock is active');
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };

  // Function that attempts to release the wake lock.
const releaseWakeLock = async () => {
    if (!wakeLock) {
      return;
    }
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };
  
function setTime(){
    const txtTimeSetter = document.getElementById("txt-time-set");

    if(doesExist(txtTimeSetter)){
        let time = txtTimeSetter.value;

        if(time !== "" && isValidSetTime(time)){

            if(doesExist(watch) && isPaused === false){
                stopTimer();
            }

            let timeArry = getUnits(time);
            hour = parseInt(timeArry[0]);
            minute = parseInt(timeArry[1]);
            second = parseInt(timeArry[2]);

            document.getElementById("hour").innerText = unitFormat(timeArry[0]);
            document.getElementById("minute").innerText = unitFormat(timeArry[1]);
            document.getElementById("second").innerText = unitFormat(timeArry[2]);
        }
        else{
            alert("This is an incorrect time format to set.\n Please use the hour:minute:second (00:00:00) format.");
        }
        
    }
}

function isValidSetTime(time){
    const timeArry = time.split(':');
    if(timeArry.length !== 3){
        return false;
    }

    let hour =  parseInt(timeArry[0]);
    let minute = parseInt(timeArry[1]);
    let second = parseInt(timeArry[2]);

    if(hour === NaN || minute === NaN || second === NaN){
        return false;
    }
    return true;
}
/**
 * increments the timer on the page and internally.
 */
function timer(){

    if((millisecond += 100) == 1000){
        millisecond = 0;
        second++;
    }

    if(second == 60){
        second = 0;
        minute++;
    }
    if(minute == 60){
        minute = 0;
        hour++;
    }

    document.getElementById("hour").innerText = timeData(hour);
    document.getElementById("minute").innerText = timeData(minute);
    document.getElementById("second").innerText = timeData(second);
}

/**
 * Provides the time unit in chrono format
 * @param {*} time unit give to convert in chrono format
 * @returns chrono format for the time unit (hours, minutes, seconds)
 */
function timeData(time){
    return time >= 10 ? time : '0' + time;
}

function unitFormat(time){
    return time.length < 2 ? '0'+ time : time;
}

function getCurrentTime()
{
    let currentTime = "";
    let time = [timeData(hour), ":", timeData(minute), ":", timeData(second)];
    currentTime = time.join("");
    return currentTime;
}

function createTimeEntry(time)
{
    let entryContainer = document.getElementById("timestamp-holder");
    if (doesExist(entryContainer))
    {
        const div = document.createElement("div");
        div.draggable = true;
        div.className = "time-entry-div";

        const horizontalDiv = document.createElement("div");
        horizontalDiv.className = "time-entry-horiztonal-div";

        const timeDiv = document.createElement('div');
        timeDiv.className = 'time-list-div';
        timeDiv.addEventListener('dblclick', appendTime);

        const navBtnDiv = document.createElement('div'); 
        navBtnDiv.className = "navigation-btn-div";  
        const deleteBtn = document.createElement('button');
        deleteBtn.className = "entry-delete-btn";
        deleteBtn.innerHTML = "<img src='./images/close.png' width='25' height='25' alt='closebtn' border='0' />";
        deleteBtn.addEventListener("click",deleteTimeEntry);

        const extractBtn = document.createElement('button');
        extractBtn.className = "extract-entry-btn";
        extractBtn.style = "display:none";
        extractBtn.innerHTML = "<img class='extract-icon' src='./images/extract-icon.png' width='25' height='25'alt='closebtn' border='0' />";
        extractBtn.addEventListener("click", onExtractClick);

        const topicDiv = document.createElement('div');
        topicDiv.className = "topic-div";

        //create timestamp 
        const entrySpan = document.createElement("span");
        entrySpan.className = "entry-time-span";
        entrySpan.innerText = time;
        timeDiv.append(entrySpan);

        //create text box to enter topic
        const entryTextBox = document.createElement("input");
        entryTextBox.mode = "text";
        entryTextBox.className = "entry-text";
        entryTextBox.size = 90;
        entryTextBox.placeholder = "Timestamp Topic";
        entryTextBox.addEventListener("blur", (event) => { addToMap(event, time); })

        const subEntryDiv = document.createElement('div');
        subEntryDiv.className = 'sub-stamp-entry-div';
        subEntryDiv.addEventListener('drop', onEntryDropped);
        subEntryDiv.addEventListener("dragenter", onSubEntryDragEnter);
        subEntryDiv.addEventListener("dragover", onSubEntryDragOver);
        subEntryDiv.addEventListener('dragleave', onSubEntryDragLeave);

        div.addEventListener('dragstart', onEntryDragStart);

        horizontalDiv.append(timeDiv);
        navBtnDiv.append(extractBtn);
        navBtnDiv.append(deleteBtn);
        horizontalDiv.append(navBtnDiv);
        topicDiv.append(entryTextBox);
        div.append(horizontalDiv);
        div.append(topicDiv)
        div.append(subEntryDiv);
        entryContainer.append(div);
    }
}

function createExistingTimeEntry(topic, timeList, timestamp)
{
    let entryContainer = document.getElementById("timestamp-holder");
    if (doesExist(entryContainer))
    {
        const div = document.createElement("div");
        div.draggable = true;
        div.className = "time-entry-div";
        div.id = timestamp.id;

        const horizontalDiv = document.createElement("div");
        horizontalDiv.className = "time-entry-horiztonal-div";

        const timeDiv = document.createElement('div');
        timeDiv.className = 'time-list-div';
        timeDiv.addEventListener('dblclick', appendTime);

        timeList.forEach((time) =>{
        //create timestamp 
        const entrySpan = document.createElement("span");
        entrySpan.className = "entry-time-span";
        entrySpan.innerText = time;
        timeDiv.append(entrySpan);
        });
        
        const navBtnDiv = document.createElement('div');
        navBtnDiv.className = "navigation-btn-div";
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = "entry-delete-btn";
        deleteBtn.innerHTML = "<img src='./images/close.png' width='25' height='25'alt='closebtn' border='0' />";
        deleteBtn.addEventListener("click",deleteTimeEntry);

        const extractBtn = document.createElement('button');
        extractBtn.className = "extract-entry-btn";
        extractBtn.style = "display: none";
        extractBtn.innerHTML = "<img class='extract-icon' src='./images/extract-icon.png' width='25' height='25'alt='closebtn' border='0' />";
        extractBtn.addEventListener("click", onExtractClick);
        
        const topicDiv = document.createElement('div');
        topicDiv.className = "topic-div";

        //create text box to enter topic
        const entryTextBox = document.createElement("input");
        entryTextBox.mode = "text";
        entryTextBox.value = topic
        entryTextBox.className = "entry-text";
        entryTextBox.size = 90;
        entryTextBox.placeholder = "Timestamp Topic";
        entryTextBox.addEventListener("blur", (event) => { addToMap(event, time); })

        const subEntryDiv = document.createElement('div');
        subEntryDiv.className = 'sub-stamp-entry-div';
        subEntryDiv.addEventListener('drop', onEntryDropped);
        subEntryDiv.addEventListener("dragenter", onSubEntryDragEnter);
        subEntryDiv.addEventListener("dragover", onSubEntryDragOver);
        subEntryDiv.addEventListener('dragleave', onSubEntryDragLeave);

        div.addEventListener('dragstart', onEntryDragStart);

        horizontalDiv.append(timeDiv);
        navBtnDiv.append(extractBtn);
        navBtnDiv.append(deleteBtn);
        horizontalDiv.append(navBtnDiv);
        topicDiv.append(entryTextBox);
        div.append(horizontalDiv);
        div.append(topicDiv)
        div.append(subEntryDiv);
        entryContainer.append(div);
        return div;
    }
    return null;
}


function createExistingEntries(entries){
    entries.forEach((entry) =>{
        if(entry !== ""){

            let entryArry = entry.split(" - ");
            let timeListFormated = [];
            let topic = "";
            if(entryArry.length == 2){
                topic = entryArry[1].trim();
                let timeList = entryArry[0].split(',');         
                timeList.forEach((time) =>{
                    let unitArry = getUnits(time);
                    unitArry = formatUnits(unitArry);
                    let formatTime = unitArry.join(':');
                    timeListFormated.push(formatTime);
                });
                let timestamp = new Timestamp(timeListFormated, topic,0);          
                let parentDiv = createExistingTimeEntry(topic, timeListFormated, timestamp);
                if(doesExist(parentDiv)){
                    stampMap.set(parentDiv, timestamp);
                }
            }
        }
    })
}

function getUnits(time){
    let hour = "00";
    let minute = "00";
    let second = "00";

    let timeArry = time.split(':');
    if(timeArry.length == 2){
        minute = unitFormat(timeArry[0]);
        second = unitFormat(timeArry[1]);
        return [hour, minute, second];
    }

    if(timeArry.length == 3){
        hour = unitFormat(timeArry[0].trim())
        minute = unitFormat(timeArry[1].trim());
        second = unitFormat(timeArry[2].trim());
        return [hour, minute, second];
    }

    return [hour, minute, second];
}

function formatUnits(unitArry)
{
    unitArry[0] = unitFormat(unitArry[0].trim());
    unitArry[1] = unitFormat(unitArry[1].trim());
    unitArry[2] = unitFormat(unitArry[2].trim());
    return unitArry;
}

function formatTime(strTime){
    let timeArry = strTime.split(':');
    if(doesExist(timeArry)){
        if(timeArry.length == 3){
            let timeHour = timeArry[0];
            let timeMin = timeArry[1];
            let timeSec = timeArry[2];

            if(timeSec !== "00" && (timeMin === "00" && timeHour === "00")){
                let time = "0:" + timeSec;
                return time;
            }

            if(timeHour !== "00"){
                let intHour = parseInt(timeHour);
                if(intHour !== NaN){
                    let time = intHour + ":" + timeMin + ":" + timeSec;
                    return time;
                }
            }

            if(timeHour === "00" && timeMin !== "00"){
                let intMin = parseInt(timeMin);
                if(intMin !== NaN){
                    let time = intMin + ":" + timeSec;
                    return time;
                }
            }
            return timeHour + ":" + timeMin + ":" + timeSec;
        }
    }
}
/**
 * Returns the top most parent entry of the specified entry
 * @param {entry} entry timestamp div entry 
 * @returns top parent div entry.
 */
function getTopParentEntry(entry)
{
    if(doesExist(entry) === false)
    {
        return null;
    }

    if(entry.classList.contains('timestamp-holder'))
        return entry;

    let parentEntry = entry;
    while(doesExist(parentEntry.parentNode) && parentEntry.parentNode.classList.contains('timestamp-holder') === false)
    {
        parentEntry = parentEntry.parentNode;
    }
    return parentEntry;
}

/**
 * Returns direct parent entry of the entry provided. Returns null if direct parent is not found.
 * @param {*} entry to parent entry .
 */
function getParentEntry(entry)
{
    let currentElement = entry;
    while(currentElement.parentNode.classList.contains('timestamp-holder') === false)
    {
        if(currentElement !== entry && currentElement.classList.contains('time-entry-div'))
        {
            break;
        }
        currentElement = currentElement.parentNode;
    }

    if(currentElement === entry)
    {
        return null;
    }
    return currentElement;
}

/**
 *  Moves one entry to another entry's subEntry holder.
 * @param {*} sourceEntry entry that should be moved
 * @param {*} destinationEntry destination entry that the source entry should be moved to.
 */
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
function createWrittenEntryFromTimeStamp(timeStamp, entry, position)
{
    if (timeStamp instanceof Timestamp)
    {
        let timeList = timeStamp.timeList;
        let parentFormattedTime = [];
        timeList.forEach((time) =>
        {
            parentFormattedTime.push(formatTime(time));
        });
        let indent = generateIndentions(position);
        entry = entry + indent + parentFormattedTime.join(', ') + ' - ' + timeStamp.topic + "\n";

        if(timeStamp.subStamps.length != 0)
        {
           timeStamp.subStamps.forEach( (subStamp) =>{
            
              let newPostion = position + 1 ;
              entry = createWrittenEntryFromTimeStamp(subStamp, entry, newPostion);
           });
        }
    }
    return entry;
}

/**
 * Writes a space indentation based on count
 * @param {*} count number of spaced indentations
 * @returns indentation spaces.
 */
function generateIndentions(count)
{
    let spaces = "";

    for(let i = 0; i < count; i++)
    {
        spaces = spaces + "     ";
    }
    return spaces;
}

/**
 * Returns the path to the entry div.
 * @param {*} entryDiv whos path is returned
 * @returns An array of div ids that goes to the specified div.
 */
function getEntryPath(entryDiv)
{  
    let path = [];
    let currentNode = entryDiv;
    let sourceId = entryDiv.id;

    if(doesExist(entryDiv) === false)
    {
        return path;
    }
    
    while(doesExist(currentNode.parentNode) !== false && currentNode.id !== "timestamp-holder")
    {
        if(currentNode.classList.contains('time-entry-div') && currentNode.id !== '' && currentNode.id !== sourceId)
        {
            path.push(currentNode.id);
        }
        currentNode = currentNode.parentNode;
    }
    path = path.reverse();
    return path;
}

/**
 * Returns the specified div's sub entry holder
 * @param {*} entryDiv 
 * @returns the sub div holder for the specified entry div.
 */
function getSelfSubEntryDiv(entryDiv)
{
    let subEntryDiv;
    let children = entryDiv.children;

    for(let i = 0; i < children.length; i++ )
    {
        if(children[i].classList.contains('sub-stamp-entry-div'))
        {
            subEntryDiv = children[i];
        }
    }
    return subEntryDiv;
}

/**
 * Updates the local file with the new entries found in the map.
 */
function updateStampFile()
{
    let fileName = fileNameTitle.replaceAll(' ', '_') + ".txt";
    var content = "";
    content = content + fileNameTitle + "\n\n" + "!!!! HIT THAT LIKE BUTTON !!!!" + "\n\n";
    stampMap.forEach((value, key) =>
    {
        let entry = createWrittenEntryFromTimeStamp(value, "", 0);
        if (entry !== "")
        {
            content = content + entry;
        }
    });
    let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
}

/**
 *  Adds time stamp to specified path.
 * @param {*} parent top most div that is stored in the stamp map that is the top div of the path given.
 * @param {*} path the path (list of ids) that goes to the substamp that should be added to.
 * @param {*} timestamp that should be added.
 */
function addTimestampToMap(parent, path, timestamp)
{
    if(stampMap.has(parent))
    {
        let topTimestamp = stampMap.get(parent);
        if(path.length === 0 )
        {
            topTimestamp.addSubStamp(timestamp);
        }
        else
        {
            let subStampToAddTo = topTimestamp.findSubTimeStamp(path);
            if(doesExist(subStampToAddTo))
            {
                subStampToAddTo.addSubStamp(timestamp);     
            }
        }
    }
    else
    {
        if (path.length === 0)
        {
            stampMap.set(parent, timestamp);
        }
    }
}

/**
 * Removes the top most parent and timestamp
 * @param {*} parent that should be removed
 * @param {*} path that verifies that the timestamp is topmost.
 */
function removeTimestampToMap(parent, path)
{
    if (stampMap.has(parent))
    {
        if (path.length === 0)
        {
            stampMap.delete(parent);
        }
    }
}

/**
 * Removes sub timestamp by the id.
 * @param {*} parent top most parent div that holds the substamp that should be removed.
 * @param {*} path to the substamp that holds the substamp that should be removed
 * @param {*} timeStampId that should be removed.
 * @returns the removed timestamp.
 */
function removeSubTimeStampToMapById(parent, path, timeStampId)
{
    if (stampMap.has(parent))
    {
        let topTimestamp = stampMap.get(parent);
        let subStampToRemoveFrom = topTimestamp.findSubTimeStamp(path);
        if (doesExist(subStampToRemoveFrom))
        {
          return subStampToRemoveFrom.removeSubStamp(timeStampId);
        }
    }
    return null;
}

function updateTimestampTopic(parent, path, topic)
{
    if(stampMap.has(parent))
    {
        let topTimestamp = stampMap.get(parent);
        if(path.length === 0)
        {
            topTimestamp.setTopic(topic);
        }
        else
        {
            let subStampToChange = topTimestamp.findSubTimeStamp(path);
            if(doesExist(subStampToChange))
            {
                subStampToChange.setTopic(topic);
                topTimestamp.replaceTimeStamp(path, subStampToChange);
                stampMap.set(parent, topTimestamp);
            }
        }
    }
}

function addTimeStampTime(parent, path, time)
{
    if(stampMap.has(parent))
    {
        let topTimestamp = stampMap.get(parent);
        if(path.length === 0)
        {
            topTimestamp.addTime(time);
        }
        else
        {
            let subStampToAddTime = topTimestamp.findSubTimeStamp(path);
            if(doesExist(subStampToAddTime))
            {
                subStampToAddTime.addTime(time);
                topTimestamp.replaceTimeStamp(path, subStampToAddTime);
                stampMap.set(parent,topTimestamp);
            }
        }
    }
}

function removeTimeStampTime(parent, path, time)
{
    if(stampMap.has(parent))
    {
        let topTimestamp = stampMap.get(parent);
        if(path.length === 0)
        {
            topTimestamp.removeTime(time);
        }
        else
        {
            let subStampToRemoveTime = topTimestamp.findSubTimeStamp(path);
            if(doesExist(subStampToRemoveTime))
            {
                subStampToRemoveTime.removeTime(time);
                topTimestamp.replaceTimeStamp(path, subStampToRemoveTime);
                stampMap.set(parent,topTimestamp);
            }
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

function querySelectChildren(className, target)
{
    let targetChild = target.querySelector("[class|="+ className + "]");
    return targetChild;
    /*if (target.hasChildNodes())
    {
        let array = Array.prototype.slice.call(target.childNodes).flat();
        target.childNodes.forEach((child) =>
        {
            if (doesExist(child.classList) && child.classList.contains(className))
            {
                return child;
            }
            if (doesExist(targetChild) === false && child.hasChildNodes())
            {
                targetChild = querySelectChildren(className, child);
            }
        });
    }
    return targetChild;*/
}

function querySelectParents(className, target)
{
    let parent = target.parentNode;
    if(target.classList.contains(className))
        return target;
    while(doesExist(parent))
    {
        if(parent.classList.contains(className))
        {
            return parent;
        }
        parent = parent.parentNode;
    }
    return parent;
}

function isValidSourceTargetToDrag(entry)
{
    return entry.id !== "";
}

function isValidDestinationTarget(entry)
{
    if (entry.classList.contains('timestamp-holder'))
    {
        return true;
    }
    return entry.id !== "";
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
            updateStampFile();
        }
    }
}

function createTimeStamp(event){
    createTimeEntry(getCurrentTime());
}

function saveTimeStamps(event){
    updateStampFile();
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

