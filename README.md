# @footgun/fsm
data-oriented hierarchical finite state machines


All javascript state machine implementations I've encountered fail at least one of these criteria:

* has hierarchical machine support
* **provides a tick() function to use in sim/game loops**
* has tests
* is simple/minimalistic

So here we are. A complete hierarchical FSM in ~250 lines of code


## Testing

All tests are in a folder unsurprisingly named `test/`.  Invoke any of them like this:

```bash
deno run test/<testname>.js
```

These tests will print nothing and return an exit code of 0 on success, or they'll bitch to `stdout` when they fail.


## Usage

```javascript
import * as hFSM from '@footgun/fsm'


const machineDefinition = {
    id: 'test machine',
    initial: 'a',
    states: {
        a: {
            initial: 'b',
            on: {
                JUMP: 'd.e',
            },
            entry: function (context) { },
            exit: function (context) { },
            tick: function (context) { },
            states: {
                b: {
                    on: {
                        RUN: 'a.d.e'
                    },
                    states: {
                        c: { }
                    }
                },
                d: { }, // contains sub-state e
            }
        },
        f: { ... }
    }
}

const m = hFSM.create(machineDefinition)  // creates a new machine

const context = { } // pass in whatever data you want the state actions to have access to

hFSM.init(m, context)  // enters the initial machine state

const eventName = 'RUN'
hFSM.raiseEvent(eventName, m, context)


// in the game loop:
hFSM.tick(m, context)

```


### ANY state
sometimes you want to specify "regardless of current state, an event should always transtions to this new state".
You can do this with the `ANY` state at the top of the machine definition:

```javascript
const machineDefinition = {
    id: 'test machine',
    initial: 'a',
    states: {
        ANY: {
            on: {
                'SLEEP': 'resting'
            }
        },
        a: { ... },
        b: { ... },
        resting: { ... }
    }
}
```

When a `SLEEP` event is received, this machine will transition from the `a` OR `b` state to the `resting` state.
