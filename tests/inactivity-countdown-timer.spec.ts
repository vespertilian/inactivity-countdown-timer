import {InactivityCountdownTimer, IInactivityConfig} from "../src/inactivity-countdown-timer";
import 'core-js/features/object/assign';

describe('Inactivity logout -', () => {
    function setup(params?: IInactivityConfig): {IL: InactivityCountdownTimer} {
        const IL = new InactivityCountdownTimer();
        IL.setup(params).start();
        return {IL}
    }

    function setupWithClock(params: IInactivityConfig): {IL: InactivityCountdownTimer} {
        jasmine.clock().install();
        jasmine.clock().mockDate();
        return setup(params);
    }

    function cleanupWithClock(IL: InactivityCountdownTimer): void {
        IL.cleanup();
        IL = null;
        jasmine.clock().uninstall();
    }

    describe('construction', () => {
        it('should log to the console when the idleTimeoutTime is smaller than the startCountdownTimerAt value', () => {
            const log = spyOn(window.console, 'log');
            const {IL} = setup({startCountDownTimerAt: 20000, idleTimeoutTime: 10000});
            IL.cleanup();
            expect(log).toHaveBeenCalledWith('startCountdown time must be smaller than idleTimeoutTime, setting to idleTimeoutTime')
        });

        it('should attach event handlers to document.click, document.mousemove, document.keypress, window.load when none are passed in', () => {
            const documentAttachEventSpy = spyOn(document, 'addEventListener').and.callThrough();
            const windowAttachEventSpy = spyOn(window, 'addEventListener').and.callThrough();
            const {IL} = setup();
            ['click', 'mousemove', 'keypress'].forEach((event) => {
                expect(documentAttachEventSpy).toHaveBeenCalledWith(event, IL as any, false);
            });
            expect(windowAttachEventSpy).toHaveBeenCalledWith('load', IL as any, false);
            IL.cleanup();
        });

        it('should attach custom event handlers to document and window when they are passed in', () => {
            const documentAttachEventSpy = spyOn(document, 'addEventListener').and.callThrough();
            const windowAttachEventSpy = spyOn(window, 'addEventListener').and.callThrough();
            const {IL} = setup({resetEvents: ['scroll','dblclick']});
            ['scroll', 'dblclick'].forEach((event) => {
                expect(documentAttachEventSpy).toHaveBeenCalledWith(event, IL as any, false);
            });
            expect(windowAttachEventSpy).toHaveBeenCalledWith('load', IL as any, false);
            IL.cleanup();
        });
    });

    describe('cleanup removing event listeners -', () => {
        it('should remove event listeners when .cleanup is called', () => {
            const documentRemoveEventSpy = spyOn(document, 'removeEventListener').and.callThrough();
            const windowRemoveEventSpy = spyOn(window, 'removeEventListener').and.callThrough();
            const {IL} = setup({resetEvents: ['click', 'mousemove']});
            IL.cleanup();
            ['click', 'mousemove'].forEach((event) => {
                expect(documentRemoveEventSpy).toHaveBeenCalledWith(event, IL as any, false);
            });
            expect(windowRemoveEventSpy).toHaveBeenCalledWith('load', IL as any, false);
        })
    });

    describe('timing out -', () => {
        it('should call the params.timeoutCallback if one was passed in', () => {
            const callback = jasmine.createSpy('callback');
            const {IL} = setupWithClock({idleTimeoutTime: 2000, timeoutCallback: callback});
            expect(callback).not.toHaveBeenCalled();
            jasmine.clock().tick(2001);
            expect(callback).toHaveBeenCalled();
            cleanupWithClock(IL)
        });

        it('should cleanup when the idleTimeout is finished', () => {
            const {IL} = setupWithClock({idleTimeoutTime: 2000});
            // we need to call through so the interval timer stops watching
            const cleanup = spyOn(IL, 'cleanup').and.callThrough();
            expect(cleanup).not.toHaveBeenCalled();
            jasmine.clock().tick(2001);
            expect(cleanup).toHaveBeenCalled();
            cleanupWithClock(IL);
        });

        it('should reset the timeout time if one of the event handlers get\s called', () => {
            ['click', 'mousemove', 'keypress'].forEach(() => {
                const {IL} = setupWithClock({idleTimeoutTime: 2000});
                // we need to call through so the interval timer stops watching
                const timeout = spyOn(IL, 'timeout' as any).and.callThrough();
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
            const callback = jasmine.createSpy('callback');
            const settings: IInactivityConfig = {
                idleTimeoutTime: 20000,
                startCountDownTimerAt: 10000,
                countDownCallback: callback
            };
            const {IL} = setupWithClock(settings);
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
            const countDownCallback = jasmine.createSpy('countDownCallback');
            const countDownCancelledCallback = jasmine.createSpy('countDownCancelledCallback');
            const settings: IInactivityConfig = {
                idleTimeoutTime: 20000,
                startCountDownTimerAt: 10000,
                countDownCallback: countDownCallback,
                countDownCancelledCallback: countDownCancelledCallback
            };
            const {IL} = setupWithClock(settings);
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
            const countDownCallback = jasmine.createSpy('countDownCallback');
            const settings: IInactivityConfig = {
                idleTimeoutTime: 1000 * 60 * 5, // 5 minutes
                startCountDownTimerAt: 1000 * 30, // 30 seconds
                countDownCallback: countDownCallback
            };
            const {IL} = setupWithClock(settings);
            const fourMins = 1000 * 60 * 4;
            const twentyNineSeconds = 1000 * 29;
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
            const callback = jasmine.createSpy('callback');
            const localStorageKey = 'idleTimeoutTimeKey';
            const settings = {
                idleTimeoutTime: 5000,
                timeoutCallback: callback,
                localStorageKey: localStorageKey
            };
            const {IL} = setupWithClock(settings);
            jasmine.clock().tick(4000);
            expect(callback).not.toHaveBeenCalled();
            // reset the time
            const currentMockTime = (new Date()).getTime().toString();
            localStorage.setItem(localStorageKey,currentMockTime);
            jasmine.clock().tick(4000);
            expect(callback).not.toHaveBeenCalled();
            jasmine.clock().tick(5000);
            expect(callback).toHaveBeenCalled();
            cleanupWithClock(IL)
        })
    })
});

// see this link for eventClasses https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent#Notes
function dispatchMouseEvent(eventName: string): void {
    // http://stackoverflow.com/questions/2490825/how-to-trigger-event-in-javascript
    const eventClass: string = 'MouseEvents';
    let docEvent: Event;
    if(document.createEvent){
        docEvent = document.createEvent(eventClass);
        docEvent.initEvent(eventName, true, true);
    }
    else {
        docEvent = eventName as any;
    }
    // @ts-ignore
    dispatchEvent(document, docEvent);
}

function dispatchEvent(element: any, event: Event): void {
    if(element['dispatchEvent']){
        element.dispatchEvent(event, true)
    } else if(element['fireEvent']){
        element.fireEvent('on' + event); // ie8 fix
    } else {
        throw new Error('No dispatch event method in browser')
    }
}
