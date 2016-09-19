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
export declare class InactivityLogout {
    private params;
    private idleTimeoutTime;
    private timeoutPrecision;
    private startCountDownTimerAt;
    private localStorageKey;
    private lastResetTimeStamp;
    private localStorage;
    private signOutHREF;
    private countingDown;
    private timeoutCallback;
    private countDownCallback;
    private countDownCancelledCallback;
    private idleTimeoutID;
    private currentTimerPrecision;
    constructor(params?: IInactivityConfigParams);
    start(precision: number): void;
    stop(): void;
    cleanup(): void;
    private handleEvent();
    timeout(): void;
    checkIdleTime(): void;
    private handleCountDown(timeRemaining);
    private checkTimerPrecision(timeRemaining);
    private getLastResetTimeStamp();
    private setLastResetTimeStamp(timestamp);
    private detectAndAssignLocalStorage();
    private redirect(url);
}
