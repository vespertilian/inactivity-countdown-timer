class InactivityLogout {
    public idleTimeout: number;
    public startCountDownTimeout: number;
    public localStorageKey: string;
    public idleSecondsTimer: number = null;
    public lastResetTimeStamp: number = (new Date()).getTime();
    public localStorage: WindowLocalStorage | boolean;

    private idleTimeoutID: string;
    private startCountdownTimeoutID: string;

    constructor(params: IConfigParams = {}, private timeoutCallback?){
        // config var defaults

        // how long you can be idle for before we time you out
        this.idleTimeout = params.idleTimeout || 10000;
        // when we start a countdown timer
        this.startCountDownTimeout = params.startCountdownTimeout || 3000;
        this.localStorageKey = params.localStorageKey || 'inactivity_logout_local_storage';

        // setup local storage
        this.localStorage = this.detectAndAssignLocalStorage();

        // attach events that will rest the timers
        this.attachEvent(document, 'click', this.resetTimers);
        this.attachEvent(document, 'mousemove', this.resetTimers);
        this.attachEvent(document, 'keypress', this.resetTimers);
        this.attachEvent(window, 'load', this.resetTimers);
    }


    resetTimers(): void {
        this.setLastResetTimeStamp(new Date().getTime())
    }

    resetTimeouts(): void {

    }

    timeout(): void {
        this.timeoutCallback();
        document.location.href = "logout.html";
    }

    getLastResetTimeStamp(): number {
        let lastResetTimeStamp: number = 0;
        if(this.localStorage){
            lastResetTimeStamp = parseInt(this.localStorage[this.localStorageKey], 10);
            if(isNaN(lastResetTimeStamp) || lastResetTimeStamp < 0) {
                lastResetTimeStamp = (new Date()).getTime()
            }
        } else {
            lastResetTimeStamp = this.lastResetTimeStamp;
        }
        return lastResetTimeStamp;
    }

    setLastResetTimeStamp(timestamp: number): void {
        if(this.localStorage){
            this.localStorage[this.localStorageKey] = timestamp.toString();
        } else {
            this.lastResetTimeStamp = timestamp;
        }
    }

    attachEvent(element: Window | Document, eventName: string, eventHandler): void {
        if(element.addEventListener) {
            element.addEventListener(eventName, eventHandler, false)
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + eventName, eventHandler)
        }
        // else do nothing.
    }

    detectAndAssignLocalStorage(): WindowLocalStorage | boolean {
        let uid: string = (new Date).getTime().toString();
        let storage: WindowLocalStorage;
        let result: string;
        try {
            localStorage.setItem(uid,uid);
            result = localStorage.getItem(uid) == uid;
            localStorage.removeItem(uid);
            return result && storage;
        } catch(exception) {
            console.log('LOCAL STORAGE IS NOT AVALIABLE FOR SYNCING TIMEOUT ACROSS TABS')
        }
    }
}

export {InactivityLogout}

interface IConfigParams {
    idleTimeout?: number;
    startCountdownTimeout?: number;
    localStorageKey?: string;
}

interface Window {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    // This is a proprietary Microsoft Internet Explorer alternative
    // to the standard EventTarget.addEventListener() method.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/attachEvent
    attachEvent(eventNameWithOn, callback): void;
}

interface Document {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    // This is a proprietary Microsoft Internet Explorer alternative
    // to the standard EventTarget.addEventListener() method.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/attachEvent
    attachEvent(eventNameWithOn, callback): void;
}
