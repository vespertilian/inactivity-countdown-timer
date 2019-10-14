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
export declare enum InactivityCountdownTimerStatus {
    started = "started",
    stopped = "stopped"
}
export declare class InactivityCountdownTimer implements EventListenerObject {
    private params?;
    private deps?;
    private idleTimeoutTime;
    private startCountDownTimerAt;
    private localStorageKey;
    private resetEvents;
    private windowResetEvents;
    private timeoutCallback;
    private countDownCallback;
    private countDownCancelledCallback;
    readonly localStorage: Storage | null;
    private internalTimeoutTime;
    private lastResetTimeStamp;
    private countingDown;
    private idleIntervalId;
    private currentTimerPrecision;
    private throttleDuration;
    private throttleTimeoutId;
    status: InactivityCountdownTimerStatus;
    readonly started: boolean;
    readonly stopped: boolean;
    private logger;
    private window;
    private document;
    constructor(params?: IInactivityConfig, deps?: IInactivityDependencies);
    /**
     * @param params
     * - **idleTimeoutTime**: 10000 - ms / 10 seconds
     * - **localStorageKey**: 'inactivity_logout_local_storage'
     */
    setup(params?: IInactivityConfig): {
        start: () => void;
    };
    /**
     * The event listener object we implement
     */
    handleEvent(eventName: Event): void;
    /**
     * Starts the timer
     */
    start(): void;
    /**
     * Clears the timer
     */
    stop(): void;
    /**
     * **You must call cleanup** before you delete the object.
     * As the timer in the class is calling a method on itself
     * it will not be garbage collected if you just delete it.
     */
    cleanup(): void;
    private ensureReasonableTimings;
    private throttle;
    private attacheEventListeners;
    private detachEventListeners;
    private startPrivate;
    private resetTimer;
    private timeout;
    private checkIdleTime;
    private handleCountDown;
    private checkTimerPrecision;
    private getLastResetTimeStamp;
    private setLastResetTimeStamp;
    private detectAndAssignLocalStorage;
}
