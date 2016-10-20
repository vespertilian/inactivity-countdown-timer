export interface IInactivityConfigParams {
    idleTimeoutTime?: number;
    startCountDownTimerAt?: number;
    resetEvents?: string[];
    timeoutCallback?(): void;
    countDownCallback?(secondsLeft: number): void;
    countDownCancelledCallback?(): void;
    localStorageKey?: string;
    logoutHREF?: string;
}
export declare class InactivityLogout {
    private params;
    private timeoutTime;
    private localStorageKey;
    private lastResetTimeStamp;
    private localStorage;
    private signOutHREF;
    private countingDown;
    private idleTimeoutTime;
    private startCountDownTimerAt;
    private resetEvents;
    private timeoutCallback;
    private countDownCallback;
    private countDownCancelledCallback;
    private idleTimeoutID;
    private currentTimerPrecision;
    /**
     * @param params
     * - **idleTimeoutTime**: 10000 - ms / 10 seconds
     * - **localStorageKey**: 'inactivity_logout_local_storage'
     */
    constructor(params?: IInactivityConfigParams);
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
    private handleEvent(eventName);
    private startPrivate(precision);
    private resetTimer(precision);
    private timeout();
    private checkIdleTime();
    private handleCountDown(timeRemaining);
    private checkTimerPrecision(timeRemaining);
    private getLastResetTimeStamp();
    private setLastResetTimeStamp(timestamp);
    private detectAndAssignLocalStorage();
    private redirect(url);
}
