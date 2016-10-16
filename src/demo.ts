// Fix logging for ie8 when dev tools are not open
(function(){
    if (typeof console == "undefined") {
        this.console = { log: function () { } };
    }
})();

import {InactivityLogout} from './inactivity-logout'
import {IInactivityConfigParams} from '../src/inactivity-logout'

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

        let settings: IInactivityConfigParams = {
            idleTimeoutTime: 15000,
            startCountDownTimerAt: 10000,
            timeoutCallback: timeoutCallback,
            countDownCallback: countDownCallback,
            countDownCancelledCallback: countDownCancelledCallback
        };
        new InactivityLogout(settings)
    });
}

export {InactivityLogout}
