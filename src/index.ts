import {InactivityLogout} from './inactivity-logout'

declare var ON_DEV: boolean;
if(ON_DEV){
    console.log('In development mode loading demo code');
    function demoCallback(){
        console.log('Demo callback')
    }
    debugger
    new InactivityLogout({timeoutCallback: demoCallback})
}

export {InactivityLogout}
