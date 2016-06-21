/******/ (function(modules) { // webpackBootstrap
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
	// Fix logging for ie8 when dev tools are not open
	(function () {
	    if (typeof console == "undefined") {
	        this.console = { log: function () { } };
	    }
	})();
	var inactivity_logout_1 = __webpack_require__(1);
	exports.InactivityLogout = inactivity_logout_1.InactivityLogout;
	if (false) {
	    console.log('In development mode loading demo code');
	    document.addEventListener("DOMContentLoaded", function (event) {
	        function timeoutCallback() {
	            console.log('timeout callback fired');
	        }
	        var updateElement = document.getElementById('timeRemaining');
	        function countDownCallback(timeRemaining) {
	            updateElement.innerHTML = (timeRemaining + ' seconds');
	        }
	        function countDownCancelledCallback() {
	            updateElement.innerHTML = 'CountDown cancelled';
	        }
	        var settings = {
	            idleTimeoutTime: 15000,
	            startCountDownTimerAt: 10000,
	            timeoutCallback: timeoutCallback,
	            countDownCallback: countDownCallback,
	            countDownCancelledCallback: countDownCancelledCallback
	        };
	        new inactivity_logout_1.InactivityLogout(settings);
	    });
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	__webpack_require__(2);
	var InactivityLogout = (function () {
	    function InactivityLogout(params) {
	        if (params === void 0) { params = {}; }
	        this.lastResetTimeStamp = (new Date()).getTime();
	        this.localStorage = null;
	        this.countingDown = false;
	        // config var defaults
	        // how long you can be idle for before we time you out
	        this.idleTimeoutTime = params.idleTimeoutTime || 10000;
	        if ((typeof (params.startCountDownTimerAt)) === 'number') {
	            if (params.startCountDownTimerAt > this.idleTimeoutTime) {
	                console.log('startCountdown time must be smaller than idleTimeoutTime, setting to idleTimeoutTime');
	                this.startCountDownTimerAt = this.idleTimeoutTime;
	            }
	            else {
	                this.startCountDownTimerAt = params.startCountDownTimerAt;
	            }
	        }
	        this.timeoutCallback = params.timeoutCallback || false;
	        this.countDownCallback = params.countDownCallback || false;
	        this.countDownCancelledCallback = params.countDownCancelledCallback || false;
	        this.localStorageKey = params.localStorageKey || 'inactivity_logout_local_storage';
	        this.signOutHREF = params.logoutHREF || false;
	        this.timeoutPrecision = params.timeoutPrecision || 1000;
	        // setup local storage
	        this.localStorage = this.detectAndAssignLocalStorage();
	        this.start(this.timeoutPrecision);
	        // attach events that will rest the timers
	        // this ends up calling the this.handleEvent function
	        // see README.md for more on why we are passing this
	        document.addEventListener('click', this, false);
	        document.addEventListener('mousemove', this, false);
	        document.addEventListener('keypress', this, false);
	        window.addEventListener('load', this, false); // effectively a no-op
	        //https://connect.microsoft.com/IE/feedback/details/812563/ie-11-local-storage-synchronization-issues
	        // this fixes a bug in ie11 where the local storage does not sync
	        window.addEventListener('storage', function (e) { }); // effectively a no-op
	    }
	    InactivityLogout.prototype.start = function (precision) {
	        var _this = this;
	        this.currentTimerPrecision = precision;
	        this.setLastResetTimeStamp((new Date()).getTime());
	        this.idleTimeoutID = window.setInterval(function () {
	            _this.checkIdleTime();
	        }, precision);
	    };
	    InactivityLogout.prototype.stop = function () {
	        window.clearInterval(this.idleTimeoutID);
	    };
	    InactivityLogout.prototype.cleanup = function () {
	        document.removeEventListener('click', this, false);
	        document.removeEventListener('mousemove', this, false);
	        document.removeEventListener('keypress', this, false);
	        window.removeEventListener('load', this, false); // effectively a no-op
	        //https://connect.microsoft.com/IE/feedback/details/812563/ie-11-local-storage-synchronization-issues
	        // this fixes a bug in ie11 where the local storage does not sync
	        window.removeEventListener('storage', function (e) { }); // effectively a no-op
	        this.stop();
	    };
	    // see readme about why we use handleEvent
	    InactivityLogout.prototype.handleEvent = function (eventName) {
	        var currentTime = (new Date).getTime();
	        this.setLastResetTimeStamp(currentTime);
	    };
	    InactivityLogout.prototype.timeout = function () {
	        this.cleanup();
	        if (this.timeoutCallback) {
	            this.timeoutCallback();
	        }
	        if (this.signOutHREF) {
	            this.redirect(this.signOutHREF);
	        }
	    };
	    InactivityLogout.prototype.checkIdleTime = function () {
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
	    InactivityLogout.prototype.handleCountDown = function (timeRemaining) {
	        if (this.countDownCallback && (timeRemaining <= this.startCountDownTimerAt)) {
	            this.countingDown = true;
	            this.countDownCallback(Math.abs(Math.ceil(timeRemaining / 1000)));
	        }
	        else if (this.countingDown) {
	            // if we are already counting down
	            // alert we no longer are
	            this.countDownCancelledCallback();
	            this.countingDown = false;
	        }
	    };
	    InactivityLogout.prototype.checkTimerPrecision = function (timeRemaining) {
	        // when we are counting down we want to
	        // increase the interval precision to seconds
	        var increasePrecisionTime = this.startCountDownTimerAt + this.timeoutPrecision;
	        if (timeRemaining < increasePrecisionTime) {
	            if (this.currentTimerPrecision !== 1000) {
	                this.stop();
	                this.start(1000);
	            }
	        }
	        else {
	            if (this.currentTimerPrecision !== this.timeoutPrecision) {
	                this.stop();
	                this.start(this.timeoutPrecision);
	            }
	        }
	    };
	    InactivityLogout.prototype.getLastResetTimeStamp = function () {
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
	    InactivityLogout.prototype.setLastResetTimeStamp = function (timestamp) {
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
	    InactivityLogout.prototype.detectAndAssignLocalStorage = function () {
	        var uid = (new Date).getTime().toString() + 'detectAndAssignLocalStorage';
	        var storage = localStorage;
	        var result;
	        try {
	            storage.setItem(uid, uid);
	            result = storage.getItem(uid) === uid;
	            storage.removeItem(uid);
	            return result && storage;
	        }
	        catch (exception) {
	            console.log('LOCAL STORAGE IS NOT AVALIABLE FOR SYNCING TIMEOUT ACROSS TABS', exception);
	        }
	    };
	    // cannot mock location changes
	    // so little function allows us to verify redirect is called
	    InactivityLogout.prototype.redirect = function (url) {
	        if (url) {
	            window.location.href = url;
	        }
	    };
	    return InactivityLogout;
	}());
	exports.InactivityLogout = InactivityLogout;


/***/ },
/* 2 */
/***/ function(module, exports) {

	(function() {
	    console.log('polyfilling ie8 add event listener');
	    if (!Event.prototype.preventDefault) {
	        Event.prototype.preventDefault=function() {
	            this.returnValue=false;
	        };
	    }
	    if (!Event.prototype.stopPropagation) {
	        Event.prototype.stopPropagation=function() {
	            this.cancelBubble=true;
	        };
	    }
	    if (!Element.prototype.addEventListener) {
	        var eventListeners=[];

	        var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
	            var self=this;
	            var wrapper=function(e) {
	                e.target=e.srcElement;
	                e.currentTarget=self;
	                if (typeof listener.handleEvent != 'undefined') {
	                    listener.handleEvent(e);
	                } else {
	                    listener.call(self,e);
	                }
	            };
	            if (type=="DOMContentLoaded") {
	                var wrapper2=function(e) {
	                    if (document.readyState=="complete") {
	                        wrapper(e);
	                    }
	                };
	                document.attachEvent("onreadystatechange",wrapper2);
	                eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});

	                if (document.readyState=="complete") {
	                    var e=new Event();
	                    e.srcElement=window;
	                    wrapper2(e);
	                }
	            } else {
	                this.attachEvent("on"+type,wrapper);
	                eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
	            }
	        };
	        var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
	            var counter=0;
	            while (counter<eventListeners.length) {
	                var eventListener=eventListeners[counter];
	                if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
	                    if (type=="DOMContentLoaded") {
	                        this.detachEvent("onreadystatechange",eventListener.wrapper);
	                    } else {
	                        this.detachEvent("on"+type,eventListener.wrapper);
	                    }
	                    eventListeners.splice(counter, 1);
	                    break;
	                }
	                ++counter;
	            }
	        };
	        Element.prototype.addEventListener=addEventListener;
	        Element.prototype.removeEventListener=removeEventListener;
	        if (HTMLDocument) {
	            HTMLDocument.prototype.addEventListener=addEventListener;
	            HTMLDocument.prototype.removeEventListener=removeEventListener;
	        }
	        if (Window) {
	            Window.prototype.addEventListener=addEventListener;
	            Window.prototype.removeEventListener=removeEventListener;
	        }
	    }
	})();

/***/ }
/******/ ]);