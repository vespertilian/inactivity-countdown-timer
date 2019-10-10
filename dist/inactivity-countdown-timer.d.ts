export interface IRegisterCallBacks {
    timeoutCallback?(): void;
    countDownCallback?(secondsLeft: number): void;
    countDownCancelledCallback?(): void;
}
export interface IInactivityConfig extends IRegisterCallBacks {
    idleTimeoutTime?: number;
    startCountDownTimerAt?: number;
    resetEvents?: string[];
    localStorageKey?: string;
}
export declare enum InactivityCountdownTimerStatus {
    started = "started",
    stopped = "stopped"
}
export declare class InactivityCountdownTimer implements EventListenerObject {
    private idleTimeoutTime;
    private startCountDownTimerAt;
    private localStorageKey;
    private resetEvents;
    private timeoutCallback;
    private countDownCallback;
    private countDownCancelledCallback;
    private localStorage;
    private timeoutTime;
    private lastResetTimeStamp;
    private countingDown;
    private idleTimeoutID;
    private currentTimerPrecision;
    status: InactivityCountdownTimerStatus;
    readonly started: boolean;
    readonly stopped: boolean;
    constructor(params?: IInactivityConfig);
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
