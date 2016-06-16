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
/***/ function(module, exports) {

	"use strict";
	function greet(name) {
	    return 'Hello ' + name;
	}
	(function inactivityLogout() {
	    var IDLE_TIMEOUT = 10; //seconds
	    var _idleSecondsCounter = 0;
	    document.onclick = function () {
	        _idleSecondsCounter = 0;
	    };
	    document.onmousemove = function () {
	        _idleSecondsCounter = 0;
	    };
	    document.onkeypress = function () {
	        _idleSecondsCounter = 0;
	    };
	    window.setInterval(CheckIdleTime, 1000);
	    function CheckIdleTime() {
	        _idleSecondsCounter++;
	        var oPanel = document.getElementById("SecondsUntilExpire");
	        if (oPanel)
	            oPanel.innerHTML = (IDLE_TIMEOUT - _idleSecondsCounter) + "";
	        if (_idleSecondsCounter >= IDLE_TIMEOUT) {
	            alert("Time expired!");
	            document.location.href = "logout.html";
	        }
	    }
	})();
	module.exports = greet;


/***/ }
/******/ ]);