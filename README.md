# inactivity-countdown-timer

###A plain JS (Typescript) module that will countdown and timeout when users are inactive/idle. 

Can be used to transition away from sensitive on screen information and redirect to another page. 
Useful when a user forgets to close their browser or tab before walking away from their computer.

## Install 

`npm install inactivity-countdown-timer --save`

## Usage

```js
// Optional config vars
let settings = {
    idleTimeoutTime?: number;
    startCountDownTimerAt?: number;
    resetEvents?: string[];
    timeoutCallback?(): void;
    countDownCallback?(secondsLeft: number): void;
    countDownCancelledCallback?(): void;
    localStorageKey?: string;
    logoutHREF?: string;
}

// Instantiate new logout object
let IL = new InactivityLogout(settings);

// make sure you cleanup the object when you are finished using it.
// will not be garbage collected unless you clean it up because of the timers
IL.cleanup()
```
**Make sure you cleanup the object before deleting**

[See the demo code for a more detailed example](https://github.com/Benefex/inactivity-countdown-timer/blob/master/src/demo.ts) 

###Features 

 - A count down callback - **alert users you are going to transition them**. 
 - Activity is **synced across tabs using local storage** (users won't be transitioned if they are active in any other tab)
 - **Dynamically adjusting timer**. Which will set itself to initially timeout when the count down starts, then change to timeout every second for the countdown. 
 - Configure what 'Activity' is by passing in you're own reset event list
 - Written in typescript and bundled as a UMD module.
 - Tests with a saucelabs setup for cross browser testing

By default the inactivity timeout is reset by these events: 

- clicks
- mousemovement
- keypresses

## Supports

 - IE8+ (you need to include the ie8EventListenerPolyfill)
 - Chrome
 - Firefox
 - Safari

## Development

The project is setup with both main.ts used for exporting the library and a demo.ts used to demo components and setup testing.

### Installing
`npm install` installs node modules and runs tests

### NPM Tasks
`npm start` runs a development server
`npm test` runs the tests via karma (from the main ts file) 
`npm test-via-saucelabs` runs the tests via karma against Saucelabs config(from the main ts file) 
`npm build` builds a version for distribution via npm
`npm prepublish` used when publishing to npm

### Publishing workflow
1. Run tests `npm test`
2. Run build and check that your module was built (needs to be exported via main.ts)
3. Install it into your project to test before publishing by running `npm install '/path-to-this/'`
4. Bump version in package.json following [Semantic Versioning] SemVer
5. Tag the release commit in git: `git tag -a v0.1.5 -m "Published v0.1.5"`
6. Push the tags up to github: `git push origin --tags`
7. Publish `npm publish`
  
[Semantic Versioning]: http://semver.org/
[EventTarget.addEventListener()]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener



## IE8 Notes

Make sure you are importing the **included ie8EventListenerPolyfill** when supporting ie8.

### How we deal with the context of `this` when attaching an event listener

It's not easy to set the context of this when you need to support IE8 because you cannot use .bind. So we have to use the handleEvent work around:

```ts
export class InactivityLogout {
        constructor(){
            // we pass in the value this not a function 
            // this.handleEvent is called (i.e the handleEvent function on the class)
            this.attachEvent(document, 'click', this);
        }
        
        handleEvent(eventName: string): void {
            console.log('**** clear timeout for event', eventName);
            window.clearTimeout(this.idleTimeoutID);
            this.startTimers();
        }
}
```

### Excerpt from MDN dealing with handling the attached EventListeners 


##### The value of **this** within the handler 

It is often desirable to reference the element on which the event handler was fired, such as when using a generic handler for a set of similar elements.

When attaching a handler function to an element using addEventListener(), the value of this inside the handler is a reference to the element. It is the same as the value of the currentTarget property of the event argument that is passed to the handler.

A solution is using a special function called handleEvent to catch any events:

```js 
var Something = function(element) {
  this.name = 'Something Good';
  this.handleEvent = function(event) {
    console.log(this.name); // 'Something Good', as this is the Something object
    switch(event.type) {
      case 'click':
        // some code here...
        break;
      case 'dblclick':
        // some code here...
        break;
    }
  };

  // Note that the listeners in this case are this, not this.handleEvent
  element.addEventListener('click', this, false);
  element.addEventListener('dblclick', this, false);

  // You can properly remove the listeners
  element.removeEventListener('click', this, false);
  element.removeEventListener('dblclick', this, false);
}
```

Read the full document ont [EventTarget.addEventListener()] on MDN

