import {InactivityLogout} from './inactivity-logout'
import {IConfigParams} from '../src/inactivity-logout'

declare var ON_DEV: boolean;
if(ON_DEV){
    console.log('In development mode loading demo code');
    document.addEventListener("DOMContentLoaded", function(event) {
        function timeoutCallback(){
            console.log('timeout callback fired')
        }

        let updateElement = document.getElementById('timeRemaining');

        function countDownCallback(timeRemaining){
            updateElement.innerHTML = (timeRemaining + ' seconds')
        }

        function countDownCancelledCallback(){
            updateElement.innerHTML = 'CountDown cancelled'
        }

        let settings: IConfigParams = {
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
