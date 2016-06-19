import {InactivityLogout} from './inactivity-logout'

declare var ON_DEV: boolean;
if(ON_DEV){
    console.log('In development mode loading demo code');
    document.addEventListener("DOMContentLoaded", function(event) {
        function timeoutCallback(){
            console.log('timeout callback fired')
        }
        let updateElement = document.getElementById('timeRemaining');
        function countDownCallback(timeRemaining){
            updateElement.innerHTML = (timeRemaining)
        }
        let settings = {
            idleTimeoutTime: 15000,
            startCountDownTimerAt: 10000,
            timeoutCallback: timeoutCallback,
            countDownCallback: countDownCallback
        };
        new InactivityLogout(settings)
    });
}

export {InactivityLogout}
