export function doesExist(element) {
    return element !== undefined && element !== null;
}

export function querySelectChildren(selector, target) {
    if (!doesExist(target)) {
        return null;
    }
    const normalized = selector.startsWith('.') || selector.startsWith('#') ? selector : '.' + selector;
    return target.querySelector(normalized);
}

export function querySelectParents(selector, target) {
    if (!doesExist(target)) {
        return null;
    }
    const className = selector.startsWith('.') ? selector.slice(1) : selector;
    let parent = target.parentNode;
    if (target.classList.contains(className))
        return target;
    while (doesExist(parent)) {
        if (parent.classList.contains(className)) {
            return parent;
        }
        parent = parent.parentNode;
    }
    return parent;
}

export function getTopParentEntry(entry) {
    if (doesExist(entry) === false) {
        return null;
    }

    if (entry.classList.contains('timestamp-holder'))
        return entry;

    let parentEntry = entry;
    while (doesExist(parentEntry.parentNode) && parentEntry.parentNode.classList.contains('timestamp-holder') === false) {
        parentEntry = parentEntry.parentNode;
    }
    return parentEntry;
}

export function getParentEntry(entry) {
    let currentElement = entry;
    while (currentElement.parentNode.classList.contains('timestamp-holder') === false) {
        if (currentElement !== entry && currentElement.classList.contains('time-entry-div')) {
            break;
        }
        currentElement = currentElement.parentNode;
    }

    if (currentElement === entry) {
        return null;
    }
    return currentElement;
}

export function getEntryPath(entryDiv) {
    let path = [];
    let currentNode = entryDiv;
    let sourceId = entryDiv.id;

    if (doesExist(entryDiv) === false) {
        return path;
    }

    while (doesExist(currentNode.parentNode) !== false && currentNode.id !== "timestamp-holder") {
        if (currentNode.classList.contains('time-entry-div') && currentNode.id !== '' && currentNode.id !== sourceId) {
            path.push(currentNode.id);
        }
        currentNode = currentNode.parentNode;
    }
    path = path.reverse();
    return path;
}

export function getSelfSubEntryDiv(entryDiv) {
    let subEntryDiv;
    let children = entryDiv.children;

    for (let i = 0; i < children.length; i++) {
        if (children[i].classList.contains('sub-stamp-entry-div')) {
            subEntryDiv = children[i];
        }
    }
    return subEntryDiv;
}

export function generateIndentions(count) {
    let spaces = "";
    for (let i = 0; i < count; i++) {
        spaces = spaces + "     ";
    }
    return spaces;
}

export function getUnits(time) {
    let hour = "00";
    let minute = "00";
    let second = "00";

    let timeArry = time.split(':');
    if (timeArry.length == 2) {
        minute = unitFormat(timeArry[0]);
        second = unitFormat(timeArry[1]);
        return [hour, minute, second];
    }

    if (timeArry.length == 3) {
        hour = unitFormat(timeArry[0].trim());
        minute = unitFormat(timeArry[1].trim());
        second = unitFormat(timeArry[2].trim());
        return [hour, minute, second];
    }

    return [hour, minute, second];
}

export function formatUnits(unitArry) {
    unitArry[0] = unitFormat(unitArry[0].trim());
    unitArry[1] = unitFormat(unitArry[1].trim());
    unitArry[2] = unitFormat(unitArry[2].trim());
    return unitArry;
}

export function unitFormat(time) {
    return time.length < 2 ? '0' + time : time;
}

export function formatTime(strTime) {
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

export function isValidSourceTargetToDrag(entry) {
    return entry.id !== "";
}

export function isValidDestinationTarget(entry) {
    if (entry.classList.contains('timestamp-holder')) {
        return true;
    }
    return entry.id !== "";
}

export function isValidSetTime(time) {
    const timeArry = time.split(':');
    if (timeArry.length !== 3) {
        return false;
    }

    let hour = parseInt(timeArry[0], 10);
    let minute = parseInt(timeArry[1], 10);
    let second = parseInt(timeArry[2], 10);

    if (Number.isNaN(hour) || Number.isNaN(minute) || Number.isNaN(second)) {
        return false;
    }
    return true;
}
