import {InactivityLogout} from '../src/index.ts'
describe('Inactivity logout', () => {

    afterEach(() => { jasmine.clock().uninstall()});

    it('should allow you to set the idleTimeout and localStorageKey', () => {
        let params = {idleTimeout: 5000, startCountDownTimer: 2000, localStorageKey: 'some_special_key'};
        let IL = new InactivityLogout(params);
        expect(IL.idleTimeout).toEqual(5000);
        expect(IL.localStorageKey).toEqual('some_special_key');
    });

    it('should use defaults if you do not pass in params', () => {
        let IL = new InactivityLogout();
        expect(IL.idleTimeout).toEqual(10000);
        expect(IL.startCountDownTimeout).toEqual(3000);
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
        // setup timer
        jasmine.clock().install();
        let timeoutCallback = jasmine.createSpy('callback');
        let IL = new InactivityLogout({idleTimeout: 2000},timeoutCallback);
        expect(timeoutCallback).not.toHaveBeenCalled();
        jasmine.clock().tick(2001);
        expect(timeoutCallback).toHaveBeenCalled();
    });

    // count down timer should be a smaller number than idleTimeout
    // test that if local storage has been change  by another tab the ending timeout does not fire

});


