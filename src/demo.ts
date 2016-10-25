// Fix logging for ie8 when dev tools are not open
(function(){
    if (typeof console == "undefined") {
        this.console = { log: function () { } };
    }
})();

import {InactivityCountdownTimer} from './inactivity-countdown-timer'
import {IInactivityConfig} from './inactivity-countdown-timer'

// import the ie8EventListenerPolyfill for use wiht IE8
import {ie8EventListenerPolyfill} from './ie8EventListenerPolyfill'
ie8EventListenerPolyfill;

// This demo is written in typescript
// The module is bundled as a UMD module so you can use it in vanilla JS not just Typescript
declare var ON_DEV: boolean;
if(ON_DEV){
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
        new InactivityCountdownTimer(settings)
    });
}

