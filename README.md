# inactivity-countdown-timer

### A plain JS (Typescript) module that will countdown and timeout when users are inactive/idle.

Can be used to transition away from sensitive on screen information and redirect to another page. 
Useful when a user forgets to close their browser or tab before walking away from their computer.

## Install 

`npm install inactivity-countdown-timer --save`

## Usage

```ts
// Optional config vars
const settings = {
    idleTimeoutTime?: number;
    startCountDownTimerAt?: number;
    resetEvents?: string[]; // document events
    throttleDuration?: number;
    localStorageKey?: string;
    windowResetEvents?: string[];
    timeoutCallback?(): void;
    countDownCallback?(secondsLeft: number): void;
    countDownCancelledCallback?(): void;
}

// Instantiate new logout object
const IL = new InactivityLogout(settings);

// make sure you cleanup the object when you are finished using it.
// will not be garbage collected unless you clean it up because of the timers
IL.cleanup()
```

[See the demo code for a detailed example](https://github.com/vespertilian/inactivity-countdown-timer/blob/master/src/demo.ts) 

run `npm start` to view the demo locally

## Features 

 - A count down callback - **alert users you are going to transition them**. 
 - Activity is **synced across tabs using local storage** (users won't be transitioned if they are active in any other tab).
 - **Dynamically adjusting timer**. Which will set itself to initially timeout when the count down starts, then change to timeout every second for the countdown. 
 - Will fall back to a 30 minute timeout if you pass an invalid number as the inactivityTimeoutTime (pass a valid number)
 - Configure what events reset your timer and count as an 'Activity' by passing in you're own reset event list.
 - Throttle the event listeners (so listeners like mouse move are not constantly firing) - will affect precise timing 
 - Written in typescript and bundled as a UMD module.
 - Tests with a saucelabs setup for cross browser testing.

### Events

By default the inactivity timeout is reset by these document events: 

- clicks
- mousemovement
- keypresses

and this window event 

- load


### Throttle

When you enable the throttle option by passing a throttle config value greater than zero, event listeners are disabled for the period specified after any event listener is fired from any configured event.  

If you have a 5 minute idle timeout time, and a 15 second throttle, you have an effective idle timeout range of 4 minutes and 45 seconds as you may miss the first 15 seconds of activity whenever the timer is reset.

To prevent poor config you cannot set a throttle time > 1/5 the internal timeout time. 
Internal timeout time is calculated as idleTimeoutTime - startCountdownTimer.

So a 5 minute timeout with a 30 second countdown timer you have a 4 minute and 30 second internal timeout time, meaning the greatest throttle you can have is 1/5 of 4 min 30 seconds 54 seconds ... 10 to 30 seconds is probably a good number anyway :) 

## Supports

 - IE9 with core-js (import 'core-js/features/object/assign' ;)
 - IE10+
 - Chrome
 - Firefox
 - Safari

## Development

The project is setup with both main.ts used for exporting the library and a demo.ts used to demo components and setup testing.

### Installing
`npm install` installs node modules and runs tests

### NPM Tasks

- `npm start` runs a development server
- `npm test` runs the tests via karma (from the main ts file) 
- `npm test-via-saucelabs` runs the tests via karma against Saucelabs config(from the main ts file) 
- `npm build` builds a version for distribution via npm
  
[Semantic Versioning]: http://semver.org/
[EventTarget.addEventListener()]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

## Publishing workflow

1. Run tests `npm test`
2. Run build and check that your module was built (needs to be exported via main.ts)
3. Install it into your project to test before publishing by running `npm install '/path-to-this/'`
4. Bump version in package.json following [Semantic Versioning] SemVer
5. Tag the release commit in git: `git tag -a v0.1.5 -m "Published v0.1.5"`
6. Push the tags up to github: `git push origin --tags`
7. Publish `npm publish`

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com

## Benefex

This module was originally published with support from Benefex. [Benefex](http://www.benefex.co.uk/) 
