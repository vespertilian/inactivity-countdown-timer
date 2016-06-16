class InactivityLogout {

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
        this.attachEvent(document, 'click', this.resetTimers());
        //this.attachEvent(document, 'mousemove', this.resetTimers(this, 'mousemove'));
        //this.attachEvent(document, 'keypress', this.resetTimers(this, 'keypress'));
        //this.attachEvent(window, 'load', this.resetTimers(this, 'load'));
    }

    startTimers(): void {
        console.log('**** start timer timeout time', this.idleTimeoutTime);
        this.idleTimeoutID = this.window.setTimeout(()=> { this.timeout() }, this.idleTimeoutTime);
        console.log('**** start timer idleTimeoutID', this.idleTimeoutID);
    }

    resetTimers(): void {
        // we need to pass in the class context as by default:
        // The value of this when called via a click event is a reference to the global (window) object
        // (or undefined in the case of strict mode)
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
        console.log('**** clear timeout for id', this.idleTimeoutID);
        window.clearTimeout(this.idleTimeoutID);
        this.startTimers();
    }

    timeout(): void {
        console.log('**** timeout callback called');
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

export {InactivityLogout}

interface IConfigParams {
    idleTimeoutTime?: number;
    startCountdownTimerAt?: number;
    localStorageKey?: string;
    timeoutCallback?: Function;
    window?: Window;
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
