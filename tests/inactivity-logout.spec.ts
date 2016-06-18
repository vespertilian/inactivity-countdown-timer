import {InactivityLogout} from '../src/inactivity-logout'
describe('Inactivity logout -', () => {

    describe('Setup -', () => {

        it('should throw an error if local storage is not present and log to the console', () => {
            spyOn(window.localStorage, 'setItem').and.throwError('Some error');
            let log = spyOn(window.console, 'log');
            let IL = new InactivityLogout();
            IL.cleanup();
            IL = null;
            expect(log).toHaveBeenCalledWith('LOCAL STORAGE IS NOT AVALIABLE FOR SYNCING TIMEOUT ACROSS TABS')
        });

        it('should attach event handlers to document.click, document.mousemove, document.keypress, window.load', () => {
            let documentAttachEventSpy = spyOn(document, 'addEventListener').and.callThrough();
            let windowAttachEventSpy = spyOn(window, 'addEventListener').and.callThrough();
            let IL = new InactivityLogout();
            ['click', 'mousemove', 'keypress'].forEach((event) => {
                expect(documentAttachEventSpy).toHaveBeenCalledWith(event, IL, false);
            });
            expect(windowAttachEventSpy).toHaveBeenCalledWith('load', IL, false);
            IL.cleanup();
            IL = null;
        });
    });

    describe('timing out -', () => {
        it('should call timeout when the idleTimeout is finished', () => {
            jasmine.clock().install();
            let IL = new InactivityLogout({idleTimeoutTime: 2000});
            let timeout = spyOn(IL, 'timeout');
            expect(timeout).not.toHaveBeenCalled();
            jasmine.clock().tick(2001);
            expect(timeout).toHaveBeenCalled();
            IL.cleanup();
            IL = null;
            jasmine.clock().uninstall();
        });

        it('should reset the idleTimeout if one of the event handlers get\s called', () => {
            ['click', 'mousemove', 'keypress'].forEach((mouseEvent) => {
                jasmine.clock().install();
                let IL = new InactivityLogout({idleTimeoutTime: 2000});
                let timeout = spyOn(IL, 'timeout');
                jasmine.clock().tick(1001); // 1001 total time
                expect(timeout).not.toHaveBeenCalled();
                dispatchMouseEvent(mouseEvent); // timer will reset and initialise at 2000
                jasmine.clock().tick(1000); // 2001 total time
                expect(timeout).not.toHaveBeenCalled();
                jasmine.clock().tick(2000); // 4001
                expect(timeout).toHaveBeenCalledTimes(1);
                IL.cleanup();
                IL = null;
                jasmine.clock().uninstall();
            });
        });
    });

    describe('redirection - ', () => {
        it('should redirect when the timeout expires if a url was passed in', () => {
            jasmine.clock().install();
            let IL = new InactivityLogout({idleTimeoutTime: 2000, logoutHREF: 'logout.html'});
            let redirectFunction = spyOn(IL, 'redirect');
            expect(redirectFunction).not.toHaveBeenCalledWith('logout.html');
            jasmine.clock().tick(2001);
            expect(redirectFunction).toHaveBeenCalledWith('logout.html');
            IL.cleanup();
            IL = null;
            jasmine.clock().uninstall();
        });

        it('should not redirect when the timeout expires if a url was not passed in', () => {
            jasmine.clock().install();
            let IL = new InactivityLogout({idleTimeoutTime: 2000});
            let redirectFunction = spyOn(IL, 'redirect');
            jasmine.clock().tick(2001);
            expect(redirectFunction).not.toHaveBeenCalledWith('logout.html');
            IL.cleanup();
            IL = null;
            jasmine.clock().uninstall();
        });
    });

    describe('callback - ', () => {
        it('should execute a callback when the timeout expires a callback was passed in', () => {
            jasmine.clock().install();
            let callback = jasmine.createSpy('callback');
            let IL = new InactivityLogout({idleTimeoutTime: 2000, timeoutCallback: callback});
            expect(callback).not.toHaveBeenCalled();
            jasmine.clock().tick(2001);
            expect(callback).toHaveBeenCalled();
            IL.cleanup();
            IL = null;
            jasmine.clock().uninstall();
        });
    });

    // count down timer should be a smaller number than idleTimeout
    // test that if local storage has been change  by another tab the ending timeout does not fire

});


// see this link for eventClasses https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent#Notes
function dispatchMouseEvent(eventName){
    // http://stackoverflow.com/questions/2490825/how-to-trigger-event-in-javascript
    let eventClass = 'MouseEvents';
    let docEvent = document.createEvent(eventClass);
    docEvent.initEvent(eventName, true, true);
    dispatchEvent(document, docEvent);
}

// IE8 fix
function dispatchEvent(element, event: Event){
    if(element['dispatchEvent']){
        element.dispatchEvent(event, true)
    } else if(element['fireEvent']){
        element.fireEvent('on' + event.type); // ie8 fix
    } else {
        throw new Error('No dispatch event method in browser')
    }
}

