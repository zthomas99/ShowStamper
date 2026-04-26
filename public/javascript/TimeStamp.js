export class Timestamp
{
    timeList  = [];
    topic = "";
    subStamps = [];
    level = 0;
    id = "";
    subMap = new Map();

    constructor(time, topic, level)
    {
        if(Array.isArray(time))
        {
            time.forEach((t) =>{
                this.timeList.push(t);
            })
        }
        else
        {
            this.timeList.push(time);
        }
        this.topic = topic;
        this.level = level !== undefined ? level : 1;
        this.id = this.create_UUID();
    }

     addSubStamp(timeStamp)
    {
        if(timeStamp instanceof Timestamp)
        {

            this.subStamps.push(timeStamp);
            this.subMap.set(timeStamp.id, this.subStamps.length - 1);
        }
    }

    removeSubStamp(timeStampId)
    {
        let removedStamp;
        if (this.subMap.has(timeStampId))
        {
            //make sure to store the removing stamp first.
            removedStamp = this.subStamps[this.subMap.get(timeStampId)];
            this.subStamps.splice(this.subMap.get(timeStampId), 1);
            this.subMap.delete(timeStampId);
        }
        return removedStamp;
    }

    addTime(time)
    {
        if(this.doesExist(time) && !this.timeList.includes(time))
        {
          this.timeList.push(time);
        }
    }

    removeTime(time)
    {
        if(this.doesExist(time))
        {
            if(this.timeList.includes(time))
            {
                const index = this.timeList.indexOf(time);

                if(index > -1)
                {
                    this.timeList.splice(index, 1);
                }
            }
        }
    }

    findSubTimeStamp(path)
    {
        let subTimeStamp;
        if (path.length === 0 || path.length === 1 && path[0] === this.id)
        {
            subTimeStamp = this;
            return subTimeStamp;
        }

        if (this.id === path[0])
        {
            let pathCopy = [...path];
            pathCopy.splice(0, 1);
            let currentId = pathCopy[0];
            if (this.subMap.has(currentId))
            {
                let currentStamp = this.subStamps[this.subMap.get(currentId)];
                if (this.doesExist(currentStamp))
                {
                   subTimeStamp = currentStamp.findSubTimeStamp(pathCopy);
                }
            }
        }
        return subTimeStamp;
    }

    setTopic(topic)
    {
        if(this.doesExist(topic))
        {
            this.topic = topic;
        }
    }

    doesExist(element)
    {
        if(element === undefined || element === null)
        {
            return false;
        }

        return true;
    }

    create_UUID(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    replaceTimeStamp(path, timeStamp)
    {
        if(path.length === 1)
        {
            let currentId = path[0];

            if (this.subMap.has(currentId))
            {
                this.subStamps[this.subMap.get(currentId)] = timeStamp;
            }
        }
        else if (path.length > 1)
        {     
            let currentId = path[0];
            path.splice(0, 1);

            if (this.subMap.has(currentId))
            {
                let subTimeStamp = this.subStamps[this.subMap.get(currentId)];
                if (this.doesExist(subTimeStamp))
                {
                    this.subStamps[this.subMap.get(currentId)].replaceTimeStamp(path, timeStamp);
                }
            }
        }
    }
}