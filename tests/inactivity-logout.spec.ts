import {InactivityLogout} from '../src/index.ts'
describe('Inactivity logout -', () => {

    it('should allow you to set the idleTimeout and localStorageKey', () => {
        let params = {idleTimeoutTime: 5000, startCountDownTimerAt: 2000, localStorageKey: 'some_special_key'};
        let IL = new InactivityLogout(params);
        expect(IL.idleTimeoutTime).toEqual(5000);
        expect(IL.localStorageKey).toEqual('some_special_key');
    });

    it('should use defaults if you do not pass in params', () => {
        let IL = new InactivityLogout();
        expect(IL.idleTimeoutTime).toEqual(10000);
        expect(IL.startCountDownTimerAt).toEqual(3000);
        expect(IL.localStorageKey).toEqual('inactivity_logout_local_storage');
    });

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
        ['click', 'mousemove', 'keypress'].forEach((item) => {
            expect(documentAttachEventSpy).toHaveBeenCalledWith(item, jasmine.any(Function), false);
        });
        expect(windowAttachEventSpy).toHaveBeenCalledWith('load', jasmine.any(Function), false);
    });

    it('should timeout when the idleTimeout is finished', () => {
        jasmine.clock().install();

        let callback = jasmine.createSpy('timerCallback');
        let IL = new InactivityLogout({idleTimeoutTime: 2000, timeoutCallback: callback});
        expect(callback).not.toHaveBeenCalled();
        jasmine.clock().tick(2001);
        expect(callback).toHaveBeenCalled();

        jasmine.clock().uninstall();
    });

    fit('should reset the idleTimeout if one of the event handlers get\s called', () => {
        //['click', 'mousemove', 'keypress'].forEach((mouseEvent) => {
            jasmine.clock().install();
            let tcallback = jasmine.createSpy('timerCallback');
            let IL = new InactivityLogout({idleTimeoutTime: 2000, timeoutCallback: tcallback});
            console.log('new InactivityLogout created');
            jasmine.clock().tick(1001); // 1001 total time
            console.log('jasmine.clock().tick(1001)');
            expect(tcallback).not.toHaveBeenCalled();
            dispatchMouseEvent('click'); // timer will reset and initialise at 2000
            jasmine.clock().tick(1000); // 2001 total time
            console.log('jasmine.clock().tick(2001)');
            expect(tcallback).not.toHaveBeenCalled(); // fails see reason below
            jasmine.clock().tick(2000); // 4001
            console.log('jasmine.clock().tick(4001)');
            expect(tcallback).toHaveBeenCalled();
            jasmine.clock().uninstall();
        //});
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
        element.dispatchEvent(event)
    } else if(element['fireEvent']){
        element.fireEvent('on' + event.type); // ie8 fix
    } else {
        throw new Error('No dispatch event method in browser')
    }
}

