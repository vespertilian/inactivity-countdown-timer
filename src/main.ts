(function(){
    if (typeof console == "undefined") {
        this.console = { log: function () { } };
    }
})();

export {InactivityLogout} from './inactivity-logout'
export {IInactivityConfigParams} from './inactivity-logout'
