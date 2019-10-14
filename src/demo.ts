// This demo is written in typescript
// The module is bundled as a UMD module so you can use it in vanilla JS not just Typescript
import { IInactivityConfig, InactivityCountdownTimer } from './main';

console.log('In development mode loading demo code');
document.addEventListener("DOMContentLoaded", function() {

    let updateElement = document.getElementById('timeRemaining');

    function timeoutCallback(){
        updateElement.innerHTML = ('You have been timed out')
    }

    function countDownCallback(timeRemaining: number): void {
        updateElement.innerHTML = (timeRemaining + ' seconds')
    }

    function countDownCancelledCallback(): void {
        updateElement.innerHTML = 'CountDown cancelled'
    }

    let settings: IInactivityConfig = {
        idleTimeoutTime: 15000, // 15 secs
        startCountDownTimerAt: 10000, // 10 secs
        timeoutCallback: timeoutCallback,
        countDownCallback: countDownCallback,
        countDownCancelledCallback: countDownCancelledCallback
    };

    new InactivityCountdownTimer(settings).start();
});

