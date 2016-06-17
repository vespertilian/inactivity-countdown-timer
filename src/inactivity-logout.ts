interface IConfigParams {
    idleTimeoutTime?: number;
    startCountdownTimerAt?: number;
    localStorageKey?: string;
    timeoutCallback?: Function;
    window?: Window;
}

export class InactivityLogout {

    public idleTimeoutTime: number;
    public startCountDownTimerAt: number;
    public localStorageKey: string;
    public idleSecondsTimer: number = null;
    public lastResetTimeStamp: number = (new Date()).getTime();
    public localStorage: WindowLocalStorage | boolean;

    private timeoutCallback: Function;
    private idleTimeoutID: number;
    private startCountdownTimeoutID: string;
    private window: Window;

    constructor(params: IConfigParams = {}){
        // config var defaults
        // how long you can be idle for before we time you out
        this.idleTimeoutTime = params.idleTimeoutTime || 10000;
        // when we start a countdown timer
        this.startCountDownTimerAt = params.startCountdownTimerAt || 3000;
        // custom local storage key
        this.localStorageKey = params.localStorageKey || 'inactivity_logout_local_storage';
        // timeout callback
        this.timeoutCallback = params.timeoutCallback;

        this.window = params.window || window;

        // setup local storage
        this.localStorage = this.detectAndAssignLocalStorage();

        this.startTimers();

        // attach events that will rest the timers
        // this ends up calling the this.handleEvent function
        this.attachEvent(document, 'click', this);
        this.attachEvent(document, 'mousemove', this);
        this.attachEvent(document, 'keypress', this);
        this.attachEvent(<IWindow>window, 'load', this);
    }

    startTimers(): void {
        this.idleTimeoutID = this.window.setTimeout(()=> { this.timeout() }, this.idleTimeoutTime);
    }

    handleEvent(eventName: string): void {
        console.log('**** clear timeout for event', eventName);
        window.clearTimeout(this.idleTimeoutID);
        this.startTimers();
    }

    timeout(): void {
        if(this.timeoutCallback){
            this.timeoutCallback();
        }
        //document.location.href = "logout.html";
    }

    //getLastResetTimeStamp(): number {
    //    let lastResetTimeStamp: number = 0;
    //    if(this.localStorage){
    //        lastResetTimeStamp = parseInt(this.localStorage[this.localStorageKey], 10);
    //        if(isNaN(lastResetTimeStamp) || lastResetTimeStamp < 0) {
    //            lastResetTimeStamp = (new Date()).getTime()
    //        }
    //    } else {
    //        lastResetTimeStamp = this.lastResetTimeStamp;
    //    }
    //    return lastResetTimeStamp;
    //}

    //setLastResetTimeStamp(timestamp: number): void {
    //    if(this.localStorage){
    //        this.localStorage[this.localStorageKey] = timestamp.toString();
    //    } else {
    //        this.lastResetTimeStamp = timestamp;
    //    }
    //}

    private attachEvent(element: IWindow | Document, eventName: string, eventHandler): void {
        if(element.addEventListener) {
            element.addEventListener(eventName, eventHandler, false)
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + eventName, eventHandler)
        }
        // else do nothing.
    }

    private detectAndAssignLocalStorage(): WindowLocalStorage | boolean {
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


interface IWindow extends Window {
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
