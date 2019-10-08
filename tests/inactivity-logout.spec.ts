// import the ie8EventListenerPolyfill you need this if you want to use IE8
import {ie8EventListenerPolyfill} from '../src/ie8EventListenerPolyfill'
ie8EventListenerPolyfill;

// this is just for the tests you do not need this to use the InactivityCountdownTimer
require('./ie8forEachPolyfill'); // because we use forEach in this test

import {InactivityCountdownTimer, IInactivityConfig} from "../src/inactivity-countdown-timer";
describe('Inactivity logout -', () => {

    describe('construction', () => {
        it('should log to the console when the idleTimeoutTime is smaller than the startCountdownTimerAt value', () => {
            let log = spyOn(window.console, 'log');
            let IL = new InactivityCountdownTimer({startCountDownTimerAt: 20000, idleTimeoutTime: 10000});
            IL.cleanup();
            IL = null;
            expect(log).toHaveBeenCalledWith('startCountdown time must be smaller than idleTimeoutTime, setting to idleTimeoutTime')
        });

        it('should attach event handlers to document.click, document.mousemove, document.keypress, window.load when none are passed in', () => {
            let documentAttachEventSpy = spyOn(document, 'addEventListener').and.callThrough();
            let windowAttachEventSpy = spyOn(window, 'addEventListener').and.callThrough();
            let IL = new InactivityCountdownTimer();
            ['click', 'mousemove', 'keypress'].forEach((event) => {
                expect(documentAttachEventSpy).toHaveBeenCalledWith(event, IL as any, false);
            });
            expect(windowAttachEventSpy).toHaveBeenCalledWith('load', IL as any, false);
            IL.cleanup();
            IL = null;
        });

        it('should attach custom event handlers to document and window when they are passed in', () => {
            let documentAttachEventSpy = spyOn(document, 'addEventListener').and.callThrough();
            let windowAttachEventSpy = spyOn(window, 'addEventListener').and.callThrough();
            let IL = new InactivityCountdownTimer({resetEvents: ['scroll','dblclick']});
            ['scroll', 'dblclick'].forEach((event) => {
                expect(documentAttachEventSpy).toHaveBeenCalledWith(event, IL as any, false);
            });
            expect(windowAttachEventSpy).toHaveBeenCalledWith('load', IL as any, false);
            IL.cleanup();
            IL = null;
        });
    });

    // todo: test that cleanup removes the event listeners
    describe('cleanup removing event listeners -', () => {
        it('should remove event listeners when .cleanup is called', () => {
            let documentRemoveEventSpy = spyOn(document, 'removeEventListener').and.callThrough();
            let windowRemoveEventSpy = spyOn(window, 'removeEventListener').and.callThrough();
            let IL = new InactivityCountdownTimer({resetEvents: ['click', 'mousemove']});
            IL.cleanup();
            ['click', 'mousemove'].forEach((event) => {
                expect(documentRemoveEventSpy).toHaveBeenCalledWith(event, IL as any, false);
            });
            expect(windowRemoveEventSpy).toHaveBeenCalledWith('load', IL as any, false);
            IL = null;
        })
    });

    describe('timing out -', () => {
        it('should call the params.timeoutCallback if one was passed in', () => {
            let callback = jasmine.createSpy('callback');
            let IL = setupWithClock({idleTimeoutTime: 2000, timeoutCallback: callback});
            expect(callback).not.toHaveBeenCalled();
            jasmine.clock().tick(2001);
            expect(callback).toHaveBeenCalled();
            cleanupWithClock(IL)
        });

        it('should cleanup when the idleTimeout is finished', () => {
            let IL = setupWithClock({idleTimeoutTime: 2000});
            // we need to call through so the interval timer stops watching
            let cleanup = spyOn(IL, 'cleanup').and.callThrough();
            expect(cleanup).not.toHaveBeenCalled();
            jasmine.clock().tick(2001);
            expect(cleanup).toHaveBeenCalled();
            cleanupWithClock(IL);
        });

        it('should reset the timeout time if one of the event handlers get\s called', () => {
            ['click', 'mousemove', 'keypress'].forEach(() => {
                let IL = setupWithClock({idleTimeoutTime: 2000});
                // we need to call through so the interval timer stops watching
                let timeout = spyOn(IL, 'timeout' as any).and.callThrough();
                jasmine.clock().tick(1001); // 1001 total time
                expect(timeout).not.toHaveBeenCalled();
                dispatchMouseEvent('click'); // timer will reset and initialise at 2000
                jasmine.clock().tick(1000); // 2001 total time
                expect(timeout).not.toHaveBeenCalled();
                jasmine.clock().tick(4000); // 3001
                expect(timeout).toHaveBeenCalledTimes(1);
                cleanupWithClock(IL)
            });
        });
    });

    describe('counting down - ', () => {
        it('should call the params.countDownCallback when the time reaches the startCountdownTimerAt value', () => {
            let callback = jasmine.createSpy('callback');
            let settings: IInactivityConfig = {
                idleTimeoutTime: 20000,
                startCountDownTimerAt: 10000,
                countDownCallback: callback
            };
            let IL = setupWithClock(settings);
            jasmine.clock().tick(9000);
            expect(callback).not.toHaveBeenCalled();
            jasmine.clock().tick(1000);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(10);
            jasmine.clock().tick(1000);
            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith(9);
            jasmine.clock().tick(1000);
            expect(callback).toHaveBeenCalledWith(8);
            expect(callback).toHaveBeenCalledTimes(3);
            cleanupWithClock(IL)
        });

        it('should call the params.countDownCancelledCallback when the countdown is aborted', () => {
            let countDownCallback = jasmine.createSpy('countDownCallback');
            let countDownCancelledCallback = jasmine.createSpy('countDownCancelledCallback');
            let settings: IInactivityConfig = {
                idleTimeoutTime: 20000,
                startCountDownTimerAt: 10000,
                countDownCallback: countDownCallback,
                countDownCancelledCallback: countDownCancelledCallback
            };
            let IL = setupWithClock(settings);
            jasmine.clock().tick(9000);
            expect(countDownCallback).not.toHaveBeenCalled();
            jasmine.clock().tick(1000);
            expect(countDownCallback).toHaveBeenCalledWith(10);
            jasmine.clock().tick(1000);
            expect(countDownCallback).toHaveBeenCalledWith(9);
            dispatchMouseEvent('click'); // timer will reset and initialise at 20000
            jasmine.clock().tick(2000);
            expect(countDownCancelledCallback).toHaveBeenCalled();
            cleanupWithClock(IL)
        });

    });

    describe('timeoutPrecision', () => {
        it('should dynamically adjust the timeout precision', () => {
            let countDownCallback = jasmine.createSpy('countDownCallback');
            let settings: IInactivityConfig = {
                idleTimeoutTime: 1000 * 60 * 5, // 5 minutes
                startCountDownTimerAt: 1000 * 30, // 30 seconds
                countDownCallback: countDownCallback
            };
            let IL = setupWithClock(settings);
            let fourMins = 1000 * 60 * 4;
            let twentyNineSeconds = 1000 * 29;
            // should call countdown callback only once at 4:30
            // then every second
            jasmine.clock().tick(fourMins + twentyNineSeconds); // 4:29
            expect(countDownCallback).not.toHaveBeenCalled();
            jasmine.clock().tick(1000); // 4:30 seconds
            expect(countDownCallback).toHaveBeenCalledTimes(1);
            jasmine.clock().tick(1000); // 4:31 seconds
            expect(countDownCallback).toHaveBeenCalledTimes(2);
            jasmine.clock().tick(1000); // 4:32 seconds
            expect(countDownCallback).toHaveBeenCalledTimes(3);
            dispatchMouseEvent('click'); // timer will reset and initialise at 5 mins
            expect(countDownCallback).toHaveBeenCalledTimes(3);
            jasmine.clock().tick(fourMins + twentyNineSeconds); // 4:29
            expect(countDownCallback).toHaveBeenCalledTimes(3);
            jasmine.clock().tick(1000); // 4:30
            expect(countDownCallback).toHaveBeenCalledTimes(4);
            cleanupWithClock(IL);
        });
    });

    describe('localstorage - ', () => {
        it('should react to updates by other windows through local storage', () => {
            let callback = jasmine.createSpy('callback');
            let localStorageKey = 'idleTimeoutTimeKey';
            let settings = {
                idleTimeoutTime: 5000,
                timeoutCallback: callback,
                localStorageKey: localStorageKey
            };
            let IL = setupWithClock(settings);
            jasmine.clock().tick(4000);
            expect(callback).not.toHaveBeenCalled();
            // reset the time
            let currentMockTime = (new Date()).getTime().toString();
            localStorage.setItem(localStorageKey,currentMockTime);
            jasmine.clock().tick(4000);
            expect(callback).not.toHaveBeenCalled();
            jasmine.clock().tick(5000);
            expect(callback).toHaveBeenCalled();
            cleanupWithClock(IL)
        })
    })

});

function setupWithClock(params: IInactivityConfig): InactivityCountdownTimer {
    jasmine.clock().install();
    jasmine.clock().mockDate();
    return new InactivityCountdownTimer(params);
}

function cleanupWithClock(IL: InactivityCountdownTimer): void {
    IL.cleanup();
    IL = null;
    jasmine.clock().uninstall();
}
// see this link for eventClasses https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent#Notes
function dispatchMouseEvent(eventName: string): void {
    // http://stackoverflow.com/questions/2490825/how-to-trigger-event-in-javascript
    let eventClass: string = 'MouseEvents';
    let docEvent: any;
    if(document.createEvent){
        docEvent = document.createEvent(eventClass);
        docEvent.initEvent(eventName, true, true);
    } else {
        docEvent = eventName;
    }
    dispatchEvent(document, docEvent);
}

// IE8 fix for tests
function dispatchEvent(element: any, event: Event): void {
    if(element['dispatchEvent']){
        element.dispatchEvent(event, true)
    } else if(element['fireEvent']){
        element.fireEvent('on' + event); // ie8 fix
    } else {
        throw new Error('No dispatch event method in browser')
    }
}
