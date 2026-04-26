import { doesExist } from './domUtils.js';
import { Timestamp } from './TimeStamp.js';

export const stampMap = new Map();

export function createWrittenEntryFromTimeStamp(timeStamp, entry, position) {
    if (timeStamp instanceof Timestamp) {
        let timeList = timeStamp.timeList;
        let parentFormattedTime = [];
        timeList.forEach((time) => {
            parentFormattedTime.push(formatTime(time));
        });
        let indent = generateIndentions(position);
        entry = entry + indent + parentFormattedTime.join(', ') + ' - ' + timeStamp.topic + "\n";

        if (timeStamp.subStamps.length != 0) {
            timeStamp.subStamps.forEach((subStamp) => {
                let newPostion = position + 1;
                entry = createWrittenEntryFromTimeStamp(subStamp, entry, newPostion);
            });
        }
    }
    return entry;
}

export function updateStampFile(fileNameTitle) {
    let fileName = fileNameTitle.replaceAll(' ', '_') + ".txt";
    let content = fileNameTitle + "\n\n" + "!!!! HIT THAT LIKE BUTTON !!!!" + "\n\n";
    stampMap.forEach((value) => {
        let entry = createWrittenEntryFromTimeStamp(value, "", 0);
        if (entry !== "") {
            content = content + entry;
        }
    });
    let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
}

export function addTimestampToMap(parent, path, timestamp) {
    if (stampMap.has(parent)) {
        let topTimestamp = stampMap.get(parent);
        if (path.length === 0) {
            topTimestamp.addSubStamp(timestamp);
        } else {
            let subStampToAddTo = topTimestamp.findSubTimeStamp(path);
            if (doesExist(subStampToAddTo)) {
                subStampToAddTo.addSubStamp(timestamp);
            }
        }
    } else {
        if (path.length === 0) {
            stampMap.set(parent, timestamp);
        }
    }
}

export function removeTimestampToMap(parent, path) {
    if (stampMap.has(parent)) {
        if (path.length === 0) {
            stampMap.delete(parent);
        }
    }
}

export function removeSubTimeStampToMapById(parent, path, timeStampId) {
    if (stampMap.has(parent)) {
        let topTimestamp = stampMap.get(parent);
        let subStampToRemoveFrom = topTimestamp.findSubTimeStamp(path);
        if (doesExist(subStampToRemoveFrom)) {
            return subStampToRemoveFrom.removeSubStamp(timeStampId);
        }
    }
    return null;
}

export function updateTimestampTopic(parent, path, topic) {
    if (stampMap.has(parent)) {
        let topTimestamp = stampMap.get(parent);
        if (path.length === 0) {
            topTimestamp.setTopic(topic);
        } else {
            let subStampToChange = topTimestamp.findSubTimeStamp(path);
            if (doesExist(subStampToChange)) {
                subStampToChange.setTopic(topic);
                topTimestamp.replaceTimeStamp(path, subStampToChange);
                stampMap.set(parent, topTimestamp);
            }
        }
    }
}

export function addTimeStampTime(parent, path, time) {
    if (stampMap.has(parent)) {
        let topTimestamp = stampMap.get(parent);
        if (path.length === 0) {
            topTimestamp.addTime(time);
        } else {
            let subStampToAddTime = topTimestamp.findSubTimeStamp(path);
            if (doesExist(subStampToAddTime)) {
                subStampToAddTime.addTime(time);
                topTimestamp.replaceTimeStamp(path, subStampToAddTime);
                stampMap.set(parent, topTimestamp);
            }
        }
    }
}

export function removeTimeStampTime(parent, path, time) {
    if (stampMap.has(parent)) {
        let topTimestamp = stampMap.get(parent);
        if (path.length === 0) {
            topTimestamp.removeTime(time);
        } else {
            let subStampToRemoveTime = topTimestamp.findSubTimeStamp(path);
            if (doesExist(subStampToRemoveTime)) {
                subStampToRemoveTime.removeTime(time);
                topTimestamp.replaceTimeStamp(path, subStampToRemoveTime);
                stampMap.set(parent, topTimestamp);
            }
        }
    }
}

function generateIndentions(count) {
    let spaces = "";
    for (let i = 0; i < count; i++) {
        spaces = spaces + "     ";
    }
    return spaces;
}

function formatTime(strTime) {
    let timeArry = strTime.split(':');
    if (doesExist(timeArry)) {
        if (timeArry.length == 3) {
            let timeHour = timeArry[0];
            let timeMin = timeArry[1];
            let timeSec = timeArry[2];

            if (timeSec !== "00" && (timeMin === "00" && timeHour === "00")) {
                return "0:" + timeSec;
            }

            if (timeHour !== "00") {
                let intHour = parseInt(timeHour, 10);
                if (!Number.isNaN(intHour)) {
                    return intHour + ":" + timeMin + ":" + timeSec;
                }
            }

            if (timeHour === "00" && timeMin !== "00") {
                let intMin = parseInt(timeMin, 10);
                if (!Number.isNaN(intMin)) {
                    return intMin + ":" + timeSec;
                }
            }
            return timeHour + ":" + timeMin + ":" + timeSec;
        }
    }
}
