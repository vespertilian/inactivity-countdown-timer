export interface IRegisterCallBacks {
    timeoutCallback?(): void;
    countDownCallback?(secondsLeft: number): void;
    countDownCancelledCallback?(): void;
}

export interface IInactivityConfig extends IRegisterCallBacks {
    startCountDownTimerAt?: number;
    idleTimeoutTime?: number;
    localStorageKey?: string;
    resetEvents?: string[];
    windowResetEvents?: string[];
    throttleDuration?: number;
}

export interface ILogger {
    log(message?: any, ...optionalParams: any[]): void;
}

export interface IInactivityDependencies {
    logger?: ILogger;
    localStorage?: Storage | null;
    window?: Window;
    document?: Document;
}

const defaultInactivityConfig: IInactivityConfig = {
    idleTimeoutTime: 10000,
    localStorageKey: 'inactivity_logout_local_storage',
    resetEvents: ['click','mousemove','keypress'],
    windowResetEvents: ['load'],
    throttleDuration: 0
};

export enum InactivityCountdownTimerStatus {
    started = 'started',
    stopped = 'stopped'
}

export class InactivityCountdownTimer implements EventListenerObject {
    // InactivityConfig
    private idleTimeoutTime: number;
    private startCountDownTimerAt: number;
    private localStorageKey: string;
    private resetEvents: string[] = [];
    private windowResetEvents: string[] = [];

    // IRegisterCallbacks
    private timeoutCallback: () => void;
    private countDownCallback: (secondsLeft: number) => void;
    private countDownCancelledCallback: () => void;

    // Internal vars
    readonly localStorage: Storage | null;
    private internalTimeoutTime: number;
    private lastResetTimeStamp: number;
    private countingDown: boolean = false;
    private idleIntervalId: number;
    private currentTimerPrecision: number;
    private throttleDuration: number;
    private throttleTimeoutId: number;

    // status public
    status: InactivityCountdownTimerStatus = InactivityCountdownTimerStatus.stopped;
    get started(): boolean {
        return this.status === InactivityCountdownTimerStatus.started
    }
    get stopped(): boolean {
        return this.status === InactivityCountdownTimerStatus.stopped
    }

    // dom
    private logger: ILogger | null;
    private window: Window;
    private document: Document;

    constructor(
      private params?: IInactivityConfig,
      private deps?: IInactivityDependencies,
    ) {
        this.logger = deps && deps.logger || console;
        this.window = deps && deps.window || window;
        this.document = deps && deps.document || document;
        this.localStorage = this.detectAndAssignLocalStorage(deps && deps.localStorage);
        if (params) { this.setup(params) }
    }
    /**
     * @param params
     * - **idleTimeoutTime**: 10000 - ms / 10 seconds
     * - **localStorageKey**: 'inactivity_logout_local_storage'
     */
    setup(params?: IInactivityConfig): {start: () => void} {
        this.cleanup();
        Object.assign(this, defaultInactivityConfig, params);

        this.ensureReasonableTimings(params);
        this.attacheEventListeners();

        const start = () => this.start();
        return {start};
    }

    // see EVENT_LISTENERS_THIS_IE8.md about why we use handleEvent
    /**
     * The event listener object we implement
     */
    handleEvent(eventName: Event): void {
        // we don't need to do anything with the eventName
        // as we want all events to fire the same actions
        let currentTime = (new Date).getTime();
        this.setLastResetTimeStamp(currentTime);
        this.throttle();
    }

    /**
     * Starts the timer
     */
    start(): void {
        this.setLastResetTimeStamp((new Date()).getTime());
        this.startPrivate(this.internalTimeoutTime);
        this.status = InactivityCountdownTimerStatus.started;
    }

    /**
     * Clears the timer
     */
    stop(): void {
        this.window.clearInterval(this.idleIntervalId);
        this.status = InactivityCountdownTimerStatus.stopped;
    }

    /**
     * **You must call cleanup** before you delete the object.
     * As the timer in the class is calling a method on itself
     * it will not be garbage collected if you just delete it.
     */
    cleanup(): void {
        this.detachEventListeners();

        // added in detectAndAssignLocalStorage for ie11
        this.window.removeEventListener('storage', function() {});
        this.window.clearTimeout(this.throttleTimeoutId);
        this.stop();
    }

    private ensureReasonableTimings(params?: IInactivityConfig) {
        if((params && typeof(params.startCountDownTimerAt)) === 'number') {
            // if start count down timer is present make sure its a number and less than idleTimeoutTime
            if(params.startCountDownTimerAt > this.idleTimeoutTime) {
                this.logger.log('startCountdown time must be smaller than idleTimeoutTime, setting to idleTimeoutTime');
                this.startCountDownTimerAt = this.idleTimeoutTime;
                this.internalTimeoutTime = 1000; // start the countdown
            } else {
                this.startCountDownTimerAt = params.startCountDownTimerAt;
                this.internalTimeoutTime = this.idleTimeoutTime - this.startCountDownTimerAt;
            }
        } else {
            // don't use count down timer
            this.startCountDownTimerAt = 0;
            this.internalTimeoutTime = this.idleTimeoutTime;
        }

        if ((params && typeof(params.throttleDuration)) === 'number') {
            const maxThrottleTime = Math.floor(this.internalTimeoutTime / 5);
            params.throttleDuration;
            if (params.throttleDuration > maxThrottleTime) {
                this.logger.log(`throttle time must be smaller than 1/5th timeout time: ${this.internalTimeoutTime} setting to ${maxThrottleTime}ms`)
                this.throttleDuration = maxThrottleTime;
            }
        }
    }

    private throttle() {
       if (this.throttleDuration > 0 ) {
           this.detachEventListeners();
           this.throttleTimeoutId = this.window.setTimeout(() => {
               this.attacheEventListeners();
           }, this.throttleDuration);
       }
    }

    private attacheEventListeners() {
        // attach events that will rest the timers
        // this ends up calling the this.handleEvent function
        // see README.md for more on why we are passing 'this'
        for(let i=0; i < this.resetEvents.length; i++) {
            this.document.addEventListener(this.resetEvents[i], this, false)
        }

        for(let i=0; i < this.windowResetEvents.length; i++) {
            this.window.addEventListener(this.windowResetEvents[i], this, false);
        }
    }

    private detachEventListeners() {
        for(let i=0; i < this.resetEvents.length; i++) {
            this.document.removeEventListener(this.resetEvents[i], this, false)
        }
        for(let i=0; i < this.windowResetEvents.length; i++) {
            this.window.removeEventListener(this.windowResetEvents[i], this, false);
        }
    }

    private startPrivate(precision: number) {
        this.currentTimerPrecision = precision;
        this.idleIntervalId = this.window.setInterval(() => {
            this.checkIdleTime();
        }, precision);
    }

    private resetTimer(precision: number){
        this.stop();
        this.startPrivate(precision);
    }

    private timeout(): void {
        this.cleanup();
        if(this.timeoutCallback){
            this.timeoutCallback();
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
        let inCountDownTimeFrame = (timeRemaining <= this.startCountDownTimerAt);
        if(inCountDownTimeFrame && this.countDownCallback){
            this.countingDown = true;
            this.countDownCallback(Math.abs(Math.ceil(timeRemaining/1000)));
        } else if (!inCountDownTimeFrame && this.countingDown) {
            if(this.countDownCancelledCallback) {
                this.countDownCancelledCallback();
            }
            this.countingDown = false;
        }
    }

    private checkTimerPrecision(timeRemaining: number) {
        // when we are counting down we want to
        // increase the interval precision to seconds
        if(timeRemaining <= this.startCountDownTimerAt){
            // don't change if it's already seconds
            if(this.currentTimerPrecision !== 1000) {
                this.resetTimer(1000)
            }
        }
        else {
            // the js timer can be out by milliseconds, we need to set the timer to:
            // the time remaining - when we start the count down timer
            // eg 15 sec timeout, 10 sec countdown, time remaining 14345 secs
            // timeout should be 4345 secs
            let nextTimeoutWhen = timeRemaining - this.startCountDownTimerAt;
            this.resetTimer(nextTimeoutWhen);
        }
    }

    private getLastResetTimeStamp(): number {
        if(this.localStorage){
            const lastResetTimeStampString = this.localStorage.getItem(this.localStorageKey);
            const lsLastResetTimeStamp = parseInt(lastResetTimeStampString, 10);
            if (lsLastResetTimeStamp) {
                return lsLastResetTimeStamp;
            }
        }
        return this.lastResetTimeStamp
    }

    private setLastResetTimeStamp(timestamp: number): void {
        if(this.localStorage){
            this.localStorage.setItem(this.localStorageKey, timestamp.toString());
        }
        this.lastResetTimeStamp = timestamp;
    }

    private detectAndAssignLocalStorage(_localStorage?: Storage | null): Storage {
        if (localStorageOrNull(_localStorage)) {
            return _localStorage;
        }

        // this fixes a bug in ie11 where the local storage does not sync
        // https://connect.microsoft.com/IE/feedback/details/812563/ie-11-local-storage-synchronization-issues
        this.window.addEventListener('storage', function() {}); // effectively a no-op

        let uid: string = (new Date()).getTime().toString() + 'detectAndAssignLocalStorage';
        let storage: Storage = localStorage;
        let result: boolean;
        try {
            storage.setItem(uid, uid);
            result = storage.getItem(uid) === uid;
            storage.removeItem(uid);
            return result && storage;
        } catch(exception) {
            this.logger.log('LOCAL STORAGE IS NOT AVAILABLE FOR SYNCING TIMEOUT ACROSS TABS', exception);
            return null;
        }
    }
}

function localStorageOrNull(value: Storage | null): boolean {
    if (value === null)  {
        return true;
    }
    return Boolean(value);
}
