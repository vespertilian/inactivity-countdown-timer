

```js
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

### From MDN dealing with handling the attached EventListners 

Read more about [EventTarget.addEventListener()] on MDN

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

[EventTarget.addEventListener()]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener