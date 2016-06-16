
I am trying to test an idleTimeout library that includes a function to reset a countdown when a DOM event fires. 

My issue is that the timeoutFunction's timeline, mocked by Jasmine, does not seem to be linear.

### My test
```js
  it('should reset the idleTimeout if one of the event handlers get\s called', () => {
            jasmine.clock().install();
            let callback = jasmine.createSpy('timerCallback');
            let IL = new InactivityLogout({idleTimeoutTime: 2000, timeoutCallback: callback});
            console.log('new InactivityLogout created');
            jasmine.clock().tick(1001); // 1001ms total time
            console.log('jasmine.clock().tick(1001)');
            expect(callback).not.toHaveBeenCalled();

            // initial timer 1 will be destoryed and new timer initialise 
            // with set idleTimeoutTime(2000)
            dispatchMouseEvent('click'); 

            jasmine.clock().tick(1000); // 2001 total time

            // new timer 2 is only 1000 into it's own timeline 
            // should not be called until 3001 because it was reset at 1001
            expect(callback).not.toHaveBeenCalled();  <- FAILS

            jasmine.clock().tick(2000); // 4001
            expect(callback).toHaveBeenCalled();
            jasmine.clock().uninstall();
  })
```

I expected that when calling jasmine.clock().tick(somenum) the current time in the scheduler would be updated, but that does not seem to happen. 

Both the first callback and the second callback created get initialized with a current time of 0. And I don't fully understand why?

### DelayedFunctionScheduler.js

```js
getJasmineRequireObj().DelayedFunctionScheduler = function() {
  function DelayedFunctionScheduler() {
    var self = this;
    var scheduledLookup = [];
    var scheduledFunctions = {};
    var currentTime = 0;
    var delayedFnCount = 0;
    console.log('delayedfunctionscheduler init current time set', currentTime)


    self.tick = function(millis, tickDate) {
      millis = millis || 0;
      var endTime = currentTime + millis;

      runScheduledFunctions(endTime, tickDate);
      currentTime = endTime;
      console.log('delayedfunctionscheduler init current time set', currentTime)
    };

    self.scheduleFunction = function(funcToCall, millis, params, recurring, timeoutKey, runAtMillis) {
      var f;
      if (typeof(funcToCall) === 'string') {
        /* jshint evil: true */
        f = function() { return eval(funcToCall); };
        /* jshint evil: false */
      } else {
        f = funcToCall;
      }

      millis = millis || 0;
      timeoutKey = timeoutKey || ++delayedFnCount;
      runAtMillis = runAtMillis || (currentTime + millis);
      
      console.log('schedule function timeoutkey', timeoutKey)
      console.log('schedule function currentTime', currentTime)
      console.log('schedule function run at millis', runAtMillis)

      var funcToSchedule = {
        runAtMillis: runAtMillis,
        funcToCall: f,
        recurring: recurring,
        params: params,
        timeoutKey: timeoutKey,
        millis: millis
      };

      if (runAtMillis in scheduledFunctions) {
        scheduledFunctions[runAtMillis].push(funcToSchedule);
      } else {
        scheduledFunctions[runAtMillis] = [funcToSchedule];
        scheduledLookup.push(runAtMillis);
        scheduledLookup.sort(function (a, b) {
          return a - b;
        });
      }

      return timeoutKey;
    };
```

### Console logging to illustrate timeline

*** is code run in the idleTimeout library 

```console
delayedfunctionscheduler init current time set 0
**** start timer timeout time 2000
schedule function timeoutkey 1
schedule function currentTime 0
schedule function run at millis 2000
**** start timer idleTimeoutID 1
**** clear timeout for id 1
**** start timer timeout time 2000
schedule function timeoutkey 2
schedule function currentTime 0
schedule function run at millis 2000
**** start timer idleTimeoutID 2
new InactivityLogout created
delayedfunctionscheduler self.tick current time set 1001
jasmine.clock().tick(1001)
timeout called
delayedfunctionscheduler self.tick current time set 2001
jasmine.clock().tick(2001)
delayedfunctionscheduler self.tick current time set 4001
jasmine.clock().tick(4001)
```

As you can see the 