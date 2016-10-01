export interface IInactivityConfigParams {
    idleTimeoutTime?: number;
    timeoutPrecision?: number;
    startCountDownTimerAt?: number;
    localStorageKey?: string;
    timeoutCallback?(): void;
    countDownCallback?(secondsLeft: number): void;
    countDownCancelledCallback?(): void;
    logoutHREF?: string;
}

interface IWindow extends Window {
    addEventListener(type: string, listener: any, useCapture?: boolean): void;
    removeEventListener(type: string, listener?: any, useCapture?: boolean): void;
}

declare var window: IWindow;

interface IDocument extends Document {
    addEventListener(type: string, listener: any, useCapture?: boolean): void;
    removeEventListener(type: string, listener?: any, useCapture?: boolean): void;
}

declare var document: IDocument;

const defaultInactivityConfigParams: IInactivityConfigParams = {
    idleTimeoutTime: 10000,
    timeoutPrecision: 1000,
    localStorageKey: 'inactivity_logout_local_storage'
};

// require('./ie8addEventListener');
export class InactivityLogout {
    private idleTimeoutTime: number;
    private timeoutPrecision: number;
    private startCountDownTimerAt: number;
    private localStorageKey: string;
    private lastResetTimeStamp: number = (new Date()).getTime();
    private localStorage: Storage;
    private signOutHREF: string;
    private countingDown: boolean = false;

    private timeoutCallback: () => void;
    private countDownCallback: (secondsLeft: number) => void;
    private countDownCancelledCallback: () => void;
    private idleTimeoutID: number;
    private currentTimerPrecision: number;
    /**
     * @param params
     * - **idleTimeoutTime**: 10000 - ms / 10 seconds
     * - **timeoutPrecision**: 1000 - ms / 1 second
     * - **localStorageKey**: 'inactivity_logout_local_storage'
     */
    constructor(private params: IInactivityConfigParams = defaultInactivityConfigParams) {
        // config var defaults
        // how long you can be idle for before we time you out
        this.idleTimeoutTime = params.idleTimeoutTime || defaultInactivityConfigParams.idleTimeoutTime;
        if((typeof(params.startCountDownTimerAt)) === 'number'){
            if(params.startCountDownTimerAt > this.idleTimeoutTime) {
                console.log('startCountdown time must be smaller than idleTimeoutTime, setting to idleTimeoutTime');
                this.startCountDownTimerAt = this.idleTimeoutTime
            } else {
                this.startCountDownTimerAt = params.startCountDownTimerAt
            }
        }

        this.timeoutCallback = params.timeoutCallback;
        this.countDownCallback = params.countDownCallback;
        this.countDownCancelledCallback = params.countDownCancelledCallback;
        this.localStorageKey = params.localStorageKey || defaultInactivityConfigParams.localStorageKey;
        this.signOutHREF = params.logoutHREF;
        this.timeoutPrecision = params.timeoutPrecision || defaultInactivityConfigParams.timeoutPrecision;

        // setup local storage
        this.localStorage = this.detectAndAssignLocalStorage();

        this.start(this.timeoutPrecision);

        // attach events that will rest the timers
        // this ends up calling the this.handleEvent function
        // see README.md for more on why we are passing 'this'
        document.addEventListener('click', this, false);
        document.addEventListener('mousemove', this, false);
        document.addEventListener('keypress', this, false);
        window.addEventListener('load', this, false); // effectively a no-op
        // https://connect.microsoft.com/IE/feedback/details/812563/ie-11-local-storage-synchronization-issues
        // this fixes a bug in ie11 where the local storage does not sync
        window.addEventListener('storage', function() {}); // effectively a no-op
    }

    /**
     * Starts the timer
     */
    public start(precision: number): void {
        this.currentTimerPrecision = precision;
        this.setLastResetTimeStamp((new Date()).getTime());
        this.idleTimeoutID = window.setInterval(() => {
            this.checkIdleTime();
        }, precision);
    }

    /**
     * Clears the timer
     */
    public stop(): void {
        window.clearInterval(this.idleTimeoutID);
    }

    /**
     * **You must call cleanup** before you delete the object.
     * As the timer in the class is calling a method on itself
     * it will not be garbage collected if you just delete it.
     */
    public cleanup(): void {
        document.removeEventListener('click', this, false);
        document.removeEventListener('mousemove', this, false);
        document.removeEventListener('keypress', this, false);
        window.removeEventListener('load', this, false); // effectively a no-op

        //https://connect.microsoft.com/IE/feedback/details/812563/ie-11-local-storage-synchronization-issues
        // this fixes a bug in ie11 where the local storage does not sync
        window.removeEventListener('storage', function() {}); // effectively a no-op
        this.stop();
    }

    // see readme about why we use handleEvent
    private handleEvent(eventName: string): void {
        // we don't need to do anything with the eventName
        // as we want all events to fire the same actions
        let currentTime = (new Date).getTime();
        this.setLastResetTimeStamp(currentTime);
    }

    private timeout(): void {
        this.cleanup();
        if(this.timeoutCallback){
            this.timeoutCallback();
        }
        if(this.signOutHREF){
            this.redirect(this.signOutHREF);
        }
    }

    private checkIdleTime(){
        let currentTimeStamp = (new Date()).getTime();
        let lastResetTimeStamp = this.getLastResetTimeStamp();
        let milliSecondDiff = currentTimeStamp - lastResetTimeStamp;
        let timeRemaining = this.idleTimeoutTime - milliSecondDiff;
        this.checkTimerPrecision(timeRemaining);
        this.handleCountDown(timeRemaining);
        if(milliSecondDiff >= this.idleTimeoutTime) {
            this.timeout();
        }
    }

    private handleCountDown(timeRemaining: number) {
        let inCountDownTimeFrame = timeRemaining <= this.startCountDownTimerAt;
        if(inCountDownTimeFrame && this.countDownCallback){
            this.countingDown = true;
            this.countDownCallback(Math.abs(Math.ceil(timeRemaining/1000)));
        } else if (!inCountDownTimeFrame && this.countingDown) {
            this.countDownCancelledCallback();
            this.countingDown = false;
        }
    }


    private checkTimerPrecision(timeRemaining: number) {
        // when we are counting down we want to
        // increase the interval precision to seconds
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
        let lastResetTimeStamp: number;
        if(this.localStorage){
            let lastResetTimeStampString: string;
            try {
                lastResetTimeStampString = this.localStorage.getItem(this.localStorageKey);
                lastResetTimeStamp = parseInt(lastResetTimeStampString, 10)
            } catch(error) {
                console.log('Error getting last reset timestamp', error)
            }
        } else {
            lastResetTimeStamp = this.lastResetTimeStamp;
        }
        return lastResetTimeStamp;
    }

    private setLastResetTimeStamp(timestamp: number): void {
        if(this.localStorage){
            try{
                this.localStorage.setItem(this.localStorageKey, timestamp.toString());
            } catch (error){
                console.log('Error setting last reset timestamp', error)
            }
        } else {
            this.lastResetTimeStamp = timestamp;
        }
    }

    private detectAndAssignLocalStorage(): Storage {
        let uid: string = (new Date()).getTime().toString() + 'detectAndAssignLocalStorage';
        let storage: Storage = localStorage;
        let result: boolean;
        try {
            storage.setItem(uid, uid);
            result = storage.getItem(uid) === uid;
            storage.removeItem(uid);
            return result && storage;
        } catch(exception) {
            console.log('LOCAL STORAGE IS NOT AVAILABLE FOR SYNCING TIMEOUT ACROSS TABS', exception)
        }
    }

    // cannot mock location changes
    // so little function allows us to verify redirect is called
    private redirect (url: string): void {
        if (url) {
            window.location.href = url;
        }
    }
}

