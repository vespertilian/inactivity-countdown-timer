interface IConfigParams {
    idleTimeoutTime?: number;
    timeoutPrecision?: number;
    startCountDownTimerAt?: number;
    localStorageKey?: string;
    timeoutCallback?: Function;
    countDownCallback?: Function;
    logoutHREF?: string;
}

export class InactivityLogout {
    private idleTimeoutTime: number;
    private timeoutPrecision: number;
    private startCountDownTimerAt: number;
    private localStorageKey: string;
    private lastResetTimeStamp: number = (new Date()).getTime();
    private localStorage: WindowLocalStorage | boolean;
    private signOutHREF: string;

    private timeoutCallback: Function;
    private countDownCallback: Function | boolean;
    private idleTimeoutID: number;
    private countDownTimerID: number;
    private currentTimerPrecision: number;

    constructor(params: IConfigParams = {}){
        // config var defaults
        // how long you can be idle for before we time you out
        this.idleTimeoutTime = params.idleTimeoutTime || 10000;
        if((typeof(params.startCountDownTimerAt)) === 'number'){
            if(params.startCountDownTimerAt > this.idleTimeoutTime) {
                console.log('startCountdown time must be smaller than idleTimeoutTime, setting to idleTimeoutTime');
                this.startCountDownTimerAt = this.idleTimeoutTime
            } else {
                this.startCountDownTimerAt = params.startCountDownTimerAt
            }
        }
        this.countDownCallback = params.countDownCallback || false;
        // custom local storage key
        this.localStorageKey = params.localStorageKey || 'inactivity_logout_local_storage';
        // timeout callback
        this.timeoutCallback = params.timeoutCallback;
        this.signOutHREF = params.logoutHREF || false;
        this.timeoutPrecision = params.timeoutPrecision || 1000;

        // setup local storage
        this.localStorage = this.detectAndAssignLocalStorage();

        this.start(this.timeoutPrecision);

        // attach events that will rest the timers
        // this ends up calling the this.handleEvent function
        // see README.md for more on why we are passing this
        this.addEventListner(document, 'click', this);
        this.addEventListner(document, 'mousemove', this);
        this.addEventListner(document, 'keypress', this);
        this.addEventListner(<IWindow>window, 'load', this);
    }

    public start(precision: number): void {
        this.currentTimerPrecision = precision;
        this.setLastResetTimeStamp((new Date()).getTime());
        this.idleTimeoutID = window.setInterval(()=> {
            this.checkIdleTime()
        }, precision);
    }

    public startCountDown(){
        this.countDownTimerID = window.setInterval(() => {
            this.checkIdleTime();
        }, 1000)
    }

    public stop(): void {
        window.clearInterval(this.idleTimeoutID);
    }

    public cleanup(): void {
        this.removeEventListner(document, 'click', this);
        this.removeEventListner(document, 'mousemove', this);
        this.removeEventListner(document, 'keypress', this);
        this.removeEventListner(<IWindow>window, 'load', this);
        this.stop();
    }

    // see readme about why we use handleEvent
    private handleEvent(eventName: string): void {
        let currentTime = (new Date).getTime();
        this.setLastResetTimeStamp(currentTime);
    }

    public timeout(): void {
        this.cleanup();
        if(this.timeoutCallback){
            this.timeoutCallback();
        }
        if(this.signOutHREF){
            this.redirect(this.signOutHREF);
        }
    }

    checkIdleTime(){
        let currentTimeStamp = (new Date()).getTime();
        let lastResetTimeStamp = this.getLastResetTimeStamp();
        let milliSecondDiff = currentTimeStamp - lastResetTimeStamp;
        let timeRemaining = this.idleTimeoutTime - milliSecondDiff;
        this.checkTimerPrecision(timeRemaining);
        if(this.countDownCallback && (timeRemaining <= this.startCountDownTimerAt)){
            this.countDownCallback(Math.abs(Math.ceil(timeRemaining/1000)));
        }
        if(milliSecondDiff >= this.idleTimeoutTime) {
            this.timeout();
        }
    }

    private checkTimerPrecision(timeRemaining: number) {
        // when we are counting down we need to increase
        // the interval precision to seconds
        let increasePrecisionTime = this.startCountDownTimerAt + this.timeoutPrecision;
        if(timeRemaining < increasePrecisionTime){
            if(this.currentTimerPrecision !== 1000) {
                this.stop();
                this.start(1000);
            }
        } else {
            if(this.currentTimerPrecision !== this.timeoutPrecision){
               this.stop();
               this.start(this.timeoutPrecision)
            }
        }
    }

    private getLastResetTimeStamp(): number {
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

    private setLastResetTimeStamp(timestamp: number): void {
        if(this.localStorage){
            this.localStorage[this.localStorageKey] = timestamp.toString();
        } else {
            this.lastResetTimeStamp = timestamp;
        }
    }

    private addEventListner(element: IWindow | Document, eventName: string, eventHandler): void {
        if(element.addEventListener) {
            element.addEventListener(eventName, eventHandler, false)
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + eventName, eventHandler)
        }
        // else do nothing.
    }

    private removeEventListner(element: IWindow | Document, eventName: string, eventHandler): void {
        if(element.removeEventListener) {
            element.removeEventListener(eventName, eventHandler)
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + eventName, eventHandler)
        }
        // else do nothing.
    }

    private detectAndAssignLocalStorage(): WindowLocalStorage | boolean {
        let uid: string = (new Date).getTime().toString();
        // todo this is broken never assigning to storage
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

    // cannot mock location changes
    // so little function allows us to verify redirect is called
    private redirect(url) {
        if(url){
            window.location.href = url;
        }
    }
}

interface IWindow extends Window {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    // This is a proprietary Microsoft Internet Explorer alternative
    // to the standard EventTarget.addEventListener() method.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/attachEvent
    attachEvent(eventNameWithOn, callback): void;
}

interface Document {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    // This is a proprietary Microsoft Internet Explorer alternative
    // to the standard EventTarget.addEventListener() method.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/attachEvent
    attachEvent(eventNameWithOn, callback): void;
}
