import {InactivityLogout} from '../src/inactivity-logout'
describe('Inactivity logout -', () => {

    describe('Setup -', () => {
        //it('should allow you to override default params with your own', () => {
        //    let params = {
        //        idleTimeoutTime: 5000,
        //        startCountDownTimerAt: 2000,
        //        localStorageKey: 'some_special_key',
        //        signoutHREF: 'logout.html'
        //    };
        //
        //    let IL = new InactivityLogout(params);
        //
        //    expect(IL.idleTimeoutTime).toEqual(5000);
        //    expect(IL.startCountDownTimerAt).toEqual(2000);
        //    expect(IL.localStorageKey).toEqual('some_special_key');
        //    expect(IL.timeoutC).toEqual('some_special_key');
        //});
        //
        //it('should use defaults if you do not pass in params', () => {
        //    let IL = new InactivityLogout();
        //    expect(IL.idleTimeoutTime).toEqual(10000);
        //    expect(IL.startCountDownTimerAt).toEqual(3000);
        //    expect(IL.localStorageKey).toEqual('inactivity_logout_local_storage');
        //});

        it('should throw an error if local storage is not present and log to the console', () => {
            spyOn(window.localStorage, 'setItem').and.throwError('Some error');
            let log = spyOn(window.console, 'log');
            let IL = new InactivityLogout();
            expect(log).toHaveBeenCalledWith('LOCAL STORAGE IS NOT AVALIABLE FOR SYNCING TIMEOUT ACROSS TABS')
        });

        it('should attach event handlers that reset the time to document.click, document.mousemove, document.keypress, window.load', () => {
            let documentAttachEventSpy = spyOn(document, 'addEventListener').and.callThrough();
            let windowAttachEventSpy = spyOn(window, 'addEventListener').and.callThrough();
            let IL = new InactivityLogout();
            ['click', 'mousemove', 'keypress'].forEach((event) => {
                expect(documentAttachEventSpy).toHaveBeenCalledWith(event, IL, false);
            });
            expect(windowAttachEventSpy).toHaveBeenCalledWith('load', IL, false);
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
                jasmine.clock().uninstall();
            });
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

