/**
 * YouTubeTimeSource
 * Drives the banner timer from a YouTube IFrame player.
 * Matches the Timer interface: start(), stop(), getCurrentTime(), setTime().
 *
 * For live streams, getCurrentTime() returns a value relative to the DVR window
 * (can be negative at the live edge). The user sets an offsetSeconds via setTime()
 * so the displayed time reflects actual broadcast position.
 * Formula: displayedSeconds = max(0, playerSeconds + offsetSeconds)
 */
export class YouTubeTimeSource {
    constructor(videoId) {
        this.videoId = videoId;
        this.player = null;
        this.offsetSeconds = 0;
        this.pollInterval = null;
        this.ready = false;
        this.wakeLock = null;
        this.frozenSeconds = null;  // display position saved on Stop
        this.pendingResync = false; // recalculate offset on next poll tick
    }

    /**
     * Load the IFrame API and embed the player inside the element with containerId.
     * Returns a Promise that resolves when the player is ready.
     */
    init(containerId) {
        return new Promise((resolve) => {
            const createPlayer = () => {
                this.player = new window.YT.Player(containerId, {
                    videoId: this.videoId,
                    width: '100%',
                    height: '100%',
                    playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 },
                    events: {
                        onReady: () => {
                            this.ready = true;
                            resolve();
                        }
                    }
                });
            };

            if (window.YT && window.YT.Player) {
                createPlayer();
                return;
            }

            // Only set the global callback if it isn't already claimed
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (prev) prev();
                createPlayer();
            };

            if (!document.getElementById('yt-api-script')) {
                const script = document.createElement('script');
                script.id = 'yt-api-script';
                script.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(script);
            }
        });
    }

    start() {
        // On resume, recalculate offset on the first poll so the display
        // continues from the frozen position regardless of where the player
        // lands (live streams often jump to the live edge on unpause).
        if (this.frozenSeconds !== null) {
            this.pendingResync = true;
            // Immediately restore the frozen time so there is no flash of
            // the wrong value during the gap before the first poll tick.
            _writeDomTime(this.frozenSeconds);
        }
        if (this.player && this.ready) this.player.playVideo();
        this._startPolling();
        this._requestWakeLock();
    }

    stop() {
        // Save what the display currently shows before pausing.
        this.frozenSeconds = this._totalSeconds();
        if (this.player && this.ready) this.player.pauseVideo();
        this._stopPolling();
        this._releaseWakeLock();
    }

    /** Set the broadcast-start offset so the displayed time matches the actual
     * position in the show, even when getCurrentTime() is negative at the live edge.
     * Also updates frozenSeconds so a subsequent Start resumes from this value.
     */
    setTime(time) {
        const parts = time.split(':');
        if (parts.length !== 3) return false;
        const [h, m, s] = parts.map(p => parseInt(p, 10));
        if ([h, m, s].some(Number.isNaN)) return false;
        const targetSeconds = h * 3600 + m * 60 + s;
        const playerNow = Math.round(this._rawPlayerSeconds());
        // Offset is relative to the player's current position
        this.offsetSeconds = targetSeconds - playerNow;
        // Keep frozenSeconds in sync so Start resumes from this edited value
        this.frozenSeconds = targetSeconds;
        this._updateDisplay();
        return true;
    }

    getCurrentTime() {
        return this._formatSeconds(this._totalSeconds());
    }

    _rawPlayerSeconds() {
        if (!this.player || !this.ready) return 0;
        const t = this.player.getCurrentTime();
        return typeof t === 'number' ? t : 0;
    }

    _totalSeconds() {
        return Math.max(0, Math.round(this._rawPlayerSeconds()) + this.offsetSeconds);
    }

    _startPolling() {
        if (this.pollInterval) return;
        this.pollInterval = setInterval(() => this._updateDisplay(), 1000);
    }

    _stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    _updateDisplay() {
        if (this.pendingResync) {
            // Recalculate offset so display continues from frozenSeconds.
            // This runs on the first tick after Start, by which point the
            // player has settled on its new position (live edge or paused pos).
            const playerNow = Math.round(this._rawPlayerSeconds());
            this.offsetSeconds = this.frozenSeconds - playerNow;
            this.pendingResync = false;
            this.frozenSeconds = null;
        }
        const total = this._totalSeconds();
        _writeDomTime(total);
    }

    _formatSeconds(total) {
        return _formatSeconds(total);
    }

    async _requestWakeLock() {
        if (!navigator?.wakeLock?.request) return;
        try { this.wakeLock = await navigator.wakeLock.request('screen'); } catch {}
    }

    async _releaseWakeLock() {
        if (!this.wakeLock) return;
        try { await this.wakeLock.release(); this.wakeLock = null; } catch {}
    }
}

/**
 * WallClockTimer
 * Tracks elapsed time using Date.now() — accurate even when the tab is backgrounded
 * or the browser throttles setInterval.
 * Matches the Timer interface: start(), stop(), getCurrentTime(), setTime().
 */
export class WallClockTimer {
    constructor() {
        this.offsetSeconds = 0;
        this.startWallMs = null;
        this.running = false;
        this.pollInterval = null;
        this.wakeLock = null;
    }

    start() {
        if (!this.running) {
            this.startWallMs = Date.now();
            this.running = true;
            this._startPolling();
            this._requestWakeLock();
        }
    }

    stop() {
        if (this.running) {
            // Preserve elapsed time into offset so resume continues from here
            this.offsetSeconds = this._totalSeconds();
            this.startWallMs = null;
            this.running = false;
            this._stopPolling();
            this._releaseWakeLock();
        }
    }

    setTime(time) {
        const parts = time.split(':');
        if (parts.length !== 3) return false;
        const [h, m, s] = parts.map(p => parseInt(p, 10));
        if ([h, m, s].some(Number.isNaN)) return false;
        this.offsetSeconds = h * 3600 + m * 60 + s;
        // If running, reset the wall-clock start so elapsed is counted from now
        if (this.running) this.startWallMs = Date.now();
        this._updateDisplay();
        return true;
    }

    getCurrentTime() {
        return _formatSeconds(this._totalSeconds());
    }

    _totalSeconds() {
        const elapsed = this.running && this.startWallMs
            ? Math.floor((Date.now() - this.startWallMs) / 1000)
            : 0;
        return this.offsetSeconds + elapsed;
    }

    _startPolling() {
        if (this.pollInterval) return;
        this.pollInterval = setInterval(() => _writeDomTime(this._totalSeconds()), 500);
    }

    _stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    async _requestWakeLock() {
        if (!navigator?.wakeLock?.request) return;
        try { this.wakeLock = await navigator.wakeLock.request('screen'); } catch {}
    }

    async _releaseWakeLock() {
        if (!this.wakeLock) return;
        try { await this.wakeLock.release(); this.wakeLock = null; } catch {}
    }
}

/**
 * Extract a YouTube video ID from a full URL, short URL, or bare 11-char ID.
 * Returns null if nothing recognizable is found.
 */
export function extractVideoId(input) {
    if (!input) return null;
    const url = input.trim();
    try {
        const u = new URL(url);
        // youtu.be/VIDEO_ID
        if (u.hostname === 'youtu.be') {
            const id = u.pathname.slice(1).split('?')[0];
            return id || null;
        }
        // youtube.com/watch?v=VIDEO_ID
        const v = u.searchParams.get('v');
        if (v) return v;
        // youtube.com/live/VIDEO_ID
        const liveMatch = u.pathname.match(/\/live\/([a-zA-Z0-9_-]{11})/);
        if (liveMatch) return liveMatch[1];
        // youtube.com/embed/VIDEO_ID
        const embedMatch = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch) return embedMatch[1];
    } catch {
        // Not a parseable URL — fall through
    }
    // Treat as a raw 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
}

// ─── Shared DOM helpers ───────────────────────────────────────────────────────

function _writeDomTime(totalSeconds) {
    const pad = n => String(n).padStart(2, '0');
    const h = document.getElementById('hour');
    const m = document.getElementById('minute');
    const s = document.getElementById('second');
    if (h) h.innerText = pad(Math.floor(totalSeconds / 3600));
    if (m) m.innerText = pad(Math.floor((totalSeconds % 3600) / 60));
    if (s) s.innerText = pad(totalSeconds % 60);
}

function _formatSeconds(totalSeconds) {
    const pad = n => String(n).padStart(2, '0');
    return [
        pad(Math.floor(totalSeconds / 3600)),
        pad(Math.floor((totalSeconds % 3600) / 60)),
        pad(totalSeconds % 60)
    ].join(':');
}
