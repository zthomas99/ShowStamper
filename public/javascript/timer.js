export class Timer {
    constructor() {
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
        this.millisecond = 0;
        this.isPaused = false;
        this.watch = null;
        this.wakeLock = null;
    }

    start() {
        if (!this.watch || this.isPaused) {
            this.watch = window.setInterval(() => this.tick(), 100);
            this.requestWakeLock();
            this.isPaused = false;
        }
    }

    stop() {
        if (this.watch) {
            clearInterval(this.watch);
            this.isPaused = true;
            this.releaseWakeLock();
        }
    }

    async requestWakeLock() {
        if (!navigator?.wakeLock?.request) {
            return;
        }
        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            this.wakeLock.addEventListener('release', () => {
                console.log('Wake Lock was released');
            });
            console.log('Wake Lock is active');
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }

    async releaseWakeLock() {
        if (!this.wakeLock) {
            return;
        }
        try {
            await this.wakeLock.release();
            this.wakeLock = null;
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }

    setTime(time) {
        if (!this.isValidSetTime(time)) {
            return false;
        }

        if (this.watch && !this.isPaused) {
            this.stop();
        }

        let timeArry = time.split(':');
        this.hour = parseInt(timeArry[0], 10);
        this.minute = parseInt(timeArry[1], 10);
        this.second = parseInt(timeArry[2], 10);

        document.getElementById('hour').innerText = this.unitFormat(timeArry[0]);
        document.getElementById('minute').innerText = this.unitFormat(timeArry[1]);
        document.getElementById('second').innerText = this.unitFormat(timeArry[2]);
        return true;
    }

    isValidSetTime(time) {
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

    tick() {
        if ((this.millisecond += 100) === 1000) {
            this.millisecond = 0;
            this.second++;
        }

        if (this.second === 60) {
            this.second = 0;
            this.minute++;
        }
        if (this.minute === 60) {
            this.minute = 0;
            this.hour++;
        }

        document.getElementById('hour').innerText = this.timeData(this.hour);
        document.getElementById('minute').innerText = this.timeData(this.minute);
        document.getElementById('second').innerText = this.timeData(this.second);
    }

    timeData(time) {
        return time >= 10 ? time : '0' + time;
    }

    unitFormat(time) {
        return time.length < 2 ? '0' + time : time;
    }

    getCurrentTime() {
        return [this.timeData(this.hour), ':', this.timeData(this.minute), ':', this.timeData(this.second)].join('');
    }
}
