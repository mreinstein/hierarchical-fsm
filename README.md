# hierarchical-fsm
data-oriented hierarchical finite state machines


All javascript state machine implementations I've encountered fail at least one of these criteria:

* has hierarchical machine support
* is data-oriented
* is simple/minimalistic
* has tests

So here we are. A complete hierarchical FSM in ~250 lines of code


## Testing

All tests are in a folder unsurprisingly named `test/`.  Invoke any of them like this:

```bash
deno run test/<testname>.js
```

These tests will print nothing and return an exit code of 0 on success, or they'll bitch to `stdout` when they fail.


## Usage

```javascript
import * as hFSM from 'https://cdn.jsdelivr.net/gh/mreinstein/hierarchical/src/index.js'


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
                        RUN: 'a.b.d.e'
                    },
                    states: {
                        c: { }
                    }
                },
                d: { }, // contains sub-state e
            }
        },
        f: { ... },  // contains sub-state g
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

