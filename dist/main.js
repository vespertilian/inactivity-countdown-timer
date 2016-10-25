(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["InactivityLogout"] = factory();
	else
		root["InactivityLogout"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var inactivity_countdown_timer_1 = __webpack_require__(1);
	exports.InactivityCountdownTimer = inactivity_countdown_timer_1.InactivityCountdownTimer;
	var ie8EventListenerPolyfill_1 = __webpack_require__(2);
	exports.ie8EventListenerPolyfill = ie8EventListenerPolyfill_1.ie8EventListenerPolyfill;


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	var defaultInactivityConfig = {
	    idleTimeoutTime: 10000,
	    localStorageKey: 'inactivity_logout_local_storage',
	    resetEvents: ['click', 'mousemove', 'keypress']
	};
	// require('./ie8addEventListener');
	var InactivityCountdownTimer = (function () {
	    /**
	     * @param params
	     * - **idleTimeoutTime**: 10000 - ms / 10 seconds
	     * - **localStorageKey**: 'inactivity_logout_local_storage'
	     */
	    function InactivityCountdownTimer(params) {
	        if (params === void 0) { params = defaultInactivityConfig; }
	        this.params = params;
	        this.countingDown = false;
	        // config var defaults
	        // how long you can be idle for before we time you out
	        this.idleTimeoutTime = params.idleTimeoutTime || defaultInactivityConfig.idleTimeoutTime;
	        if ((typeof (params.startCountDownTimerAt)) === 'number') {
	            // if start count down timer is present make sure its a number and less than idleTimeoutTime
	            if (params.startCountDownTimerAt > this.idleTimeoutTime) {
	                console.log('startCountdown time must be smaller than idleTimeoutTime, setting to idleTimeoutTime');
	                this.startCountDownTimerAt = this.idleTimeoutTime;
	                this.timeoutTime = 1000; // start the countdown
	            }
	            else {
	                this.startCountDownTimerAt = params.startCountDownTimerAt;
	                this.timeoutTime = this.idleTimeoutTime - this.startCountDownTimerAt;
	            }
	        }
	        else {
	            // don't use count down timer
	            this.startCountDownTimerAt = 0;
	            this.timeoutTime = this.idleTimeoutTime;
	        }
	        this.timeoutCallback = params.timeoutCallback;
	        this.countDownCallback = params.countDownCallback;
	        this.countDownCancelledCallback = params.countDownCancelledCallback;
	        this.localStorageKey = params.localStorageKey || defaultInactivityConfig.localStorageKey;
	        this.resetEvents = params.resetEvents || defaultInactivityConfig.resetEvents;
	        this.signOutHREF = params.logoutHREF;
	        // setup local storage
	        this.localStorage = this.detectAndAssignLocalStorage();
	        // attach events that will rest the timers
	        // this ends up calling the this.handleEvent function
	        // see README.md for more on why we are passing 'this'
	        for (var i = 0; i < this.resetEvents.length; i++) {
	            document.addEventListener(this.resetEvents[i], this, false);
	        }
	        window.addEventListener('load', this, false); // start count down when window is loaded
	        // this fixes a bug in ie11 where the local storage does not sync
	        // https://connect.microsoft.com/IE/feedback/details/812563/ie-11-local-storage-synchronization-issues
	        window.addEventListener('storage', function () { }); // effectively a no-op
	        this.start();
	    }
	    /**
	     * Starts the timer
	     */
	    InactivityCountdownTimer.prototype.start = function () {
	        this.setLastResetTimeStamp((new Date()).getTime());
	        this.startPrivate(this.timeoutTime);
	    };
	    /**
	     * Clears the timer
	     */
	    InactivityCountdownTimer.prototype.stop = function () {
	        window.clearInterval(this.idleTimeoutID);
	    };
	    /**
	     * **You must call cleanup** before you delete the object.
	     * As the timer in the class is calling a method on itself
	     * it will not be garbage collected if you just delete it.
	     */
	    InactivityCountdownTimer.prototype.cleanup = function () {
	        for (var i = 0; i < this.resetEvents.length; i++) {
	            document.removeEventListener(this.resetEvents[i], this, false);
	        }
	        window.removeEventListener('load', this, false);
	        window.removeEventListener('storage', function () { });
	        this.stop();
	    };
	    // see readme about why we use handleEvent
	    InactivityCountdownTimer.prototype.handleEvent = function (eventName) {
	        // we don't need to do anything with the eventName
	        // as we want all events to fire the same actions
	        var currentTime = (new Date).getTime();
	        this.setLastResetTimeStamp(currentTime);
	    };
	    InactivityCountdownTimer.prototype.startPrivate = function (precision) {
	        var _this = this;
	        this.currentTimerPrecision = precision;
	        this.idleTimeoutID = window.setInterval(function () {
	            _this.checkIdleTime();
	        }, precision);
	    };
	    InactivityCountdownTimer.prototype.resetTimer = function (precision) {
	        this.stop();
	        this.startPrivate(precision);
	    };
	    InactivityCountdownTimer.prototype.timeout = function () {
	        this.cleanup();
	        if (this.timeoutCallback) {
	            this.timeoutCallback();
	        }
	        if (this.signOutHREF) {
	            this.redirect(this.signOutHREF);
	        }
	    };
	    InactivityCountdownTimer.prototype.checkIdleTime = function () {
	        var currentTimeStamp = (new Date()).getTime();
	        var lastResetTimeStamp = this.getLastResetTimeStamp();
	        var milliSecondDiff = currentTimeStamp - lastResetTimeStamp;
	        var timeRemaining = this.idleTimeoutTime - milliSecondDiff;
	        this.checkTimerPrecision(timeRemaining);
	        this.handleCountDown(timeRemaining);
	        if (milliSecondDiff >= this.idleTimeoutTime) {
	            this.timeout();
	        }
	    };
	    InactivityCountdownTimer.prototype.handleCountDown = function (timeRemaining) {
	        var inCountDownTimeFrame = (timeRemaining <= this.startCountDownTimerAt);
	        if (inCountDownTimeFrame && this.countDownCallback) {
	            this.countingDown = true;
	            this.countDownCallback(Math.abs(Math.ceil(timeRemaining / 1000)));
	        }
	        else if (!inCountDownTimeFrame && this.countingDown) {
	            if (this.countDownCancelledCallback) {
	                this.countDownCancelledCallback();
	            }
	            this.countingDown = false;
	        }
	    };
	    InactivityCountdownTimer.prototype.checkTimerPrecision = function (timeRemaining) {
	        // when we are counting down we want to
	        // increase the interval precision to seconds
	        if (timeRemaining <= this.startCountDownTimerAt) {
	            // don't change if it's already seconds
	            if (this.currentTimerPrecision !== 1000) {
	                this.resetTimer(1000);
	            }
	        }
	        else {
	            // the js timer can be out by milliseconds, we need to set the timer to:
	            // the time remaining - when we start the count down timer
	            // eg 15 sec timeout, 10 sec countdown, time remaining 14345 secs
	            // timeout should be 4345 secs
	            var nextTimeoutWhen = timeRemaining - this.startCountDownTimerAt;
	            this.resetTimer(nextTimeoutWhen);
	        }
	    };
	    InactivityCountdownTimer.prototype.getLastResetTimeStamp = function () {
	        var lastResetTimeStamp;
	        if (this.localStorage) {
	            var lastResetTimeStampString = void 0;
	            try {
	                lastResetTimeStampString = this.localStorage.getItem(this.localStorageKey);
	                lastResetTimeStamp = parseInt(lastResetTimeStampString, 10);
	            }
	            catch (error) {
	                console.log('Error getting last reset timestamp', error);
	            }
	        }
	        else {
	            lastResetTimeStamp = this.lastResetTimeStamp;
	        }
	        return lastResetTimeStamp;
	    };
	    InactivityCountdownTimer.prototype.setLastResetTimeStamp = function (timestamp) {
	        if (this.localStorage) {
	            try {
	                this.localStorage.setItem(this.localStorageKey, timestamp.toString());
	            }
	            catch (error) {
	                console.log('Error setting last reset timestamp', error);
	            }
	        }
	        else {
	            this.lastResetTimeStamp = timestamp;
	        }
	    };
	    InactivityCountdownTimer.prototype.detectAndAssignLocalStorage = function () {
	        var uid = (new Date()).getTime().toString() + 'detectAndAssignLocalStorage';
	        var storage = localStorage;
	        var result;
	        try {
	            storage.setItem(uid, uid);
	            result = storage.getItem(uid) === uid;
	            storage.removeItem(uid);
	            return result && storage;
	        }
	        catch (exception) {
	            console.log('LOCAL STORAGE IS NOT AVAILABLE FOR SYNCING TIMEOUT ACROSS TABS', exception);
	        }
	    };
	    // cannot mock location changes
	    // so little function allows us to verify redirect is called
	    InactivityCountdownTimer.prototype.redirect = function (url) {
	        if (url) {
	            window.location.href = url;
	        }
	    };
	    return InactivityCountdownTimer;
	}());
	exports.InactivityCountdownTimer = InactivityCountdownTimer;


/***/ },
/* 2 */
/***/ function(module, exports) {

	// This code from MDN (Mozilla Developer Network)
	// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
	// Public domain licenced
	// https://creativecommons.org/publicdomain/zero/1.0/
	"use strict";
	exports.ie8EventListenerPolyfill = (function () {
	    if (!Event.prototype.preventDefault) {
	        Event.prototype.preventDefault = function () {
	            this.returnValue = false;
	        };
	    }
	    if (!Event.prototype.stopPropagation) {
	        Event.prototype.stopPropagation = function () {
	            this.cancelBubble = true;
	        };
	    }
	    if (!Element.prototype.addEventListener) {
	        var eventListeners = [];
	        var addEventListener = function (type, listener /*, useCapture (will be ignored) */) {
	            var self = this;
	            var wrapper = function (e) {
	                e.target = e.srcElement;
	                e.currentTarget = self;
	                if (typeof listener.handleEvent != 'undefined') {
	                    listener.handleEvent(e);
	                }
	                else {
	                    listener.call(self, e);
	                }
	            };
	            if (type == "DOMContentLoaded") {
	                var wrapper2 = function (e) {
	                    if (document.readyState == "complete") {
	                        wrapper(e);
	                    }
	                };
	                document.attachEvent("onreadystatechange", wrapper2);
	                eventListeners.push({ object: this, type: type, listener: listener, wrapper: wrapper2 });
	                if (document.readyState == "complete") {
	                    var e = new Event();
	                    e.srcElement = window;
	                    wrapper2(e);
	                }
	            }
	            else {
	                this.attachEvent("on" + type, wrapper);
	                eventListeners.push({ object: this, type: type, listener: listener, wrapper: wrapper });
	            }
	        };
	        var removeEventListener = function (type, listener /*, useCapture (will be ignored) */) {
	            var counter = 0;
	            while (counter < eventListeners.length) {
	                var eventListener = eventListeners[counter];
	                if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {
	                    if (type == "DOMContentLoaded") {
	                        this.detachEvent("onreadystatechange", eventListener.wrapper);
	                    }
	                    else {
	                        this.detachEvent("on" + type, eventListener.wrapper);
	                    }
	                    eventListeners.splice(counter, 1);
	                    break;
	                }
	                ++counter;
	            }
	        };
	        Element.prototype.addEventListener = addEventListener;
	        Element.prototype.removeEventListener = removeEventListener;
	        if (HTMLDocument) {
	            HTMLDocument.prototype.addEventListener = addEventListener;
	            HTMLDocument.prototype.removeEventListener = removeEventListener;
	        }
	        if (Window) {
	            Window.prototype.addEventListener = addEventListener;
	            Window.prototype.removeEventListener = removeEventListener;
	        }
	    }
	})();


/***/ }
/******/ ])
});
;