import * as TreeOps         from './tree-ops.js'
import { default as Cycle } from 'https://cdn.skypack.dev/pin/cycle@v1.0.3-X99glrELi1owpzS7yHye/mode=imports,min/optimized/cycle.js'


export function create (definition) {
	return {
		// pointers to state in the machine definition
		state: undefined,      // current machine state
		lastState: undefined,

		// read-only hierarchical finite state machine definition
		definition,

		frameCount: 0, // how many fixed update frames have passed in the current state
	}
}


export function init (machine, context={}) {
	const newState = getInitialState(machine.definition)

	if (newState !== machine.state)
		machine.state = setInitialState(machine.definition, context)
}


function getInitialState (state) {
	while (state) {
		if (!state.initial)
			return state

		state = state.states[state.initial]
	}
}


function setInitialState (state, context) {
	while (state) {
		if (state.entry)
			state.entry(context)

		if (!state.initial)
			return state

		state = state.states[state.initial]
	}
}


export function raiseEvent (eventName, machine, context={}) {
	let newState

	let invocationList = [ ] // store refs to functions to execute in order

	let state = machine.state

	while (state) {
		const target = state.on?.[eventName]

		if (!target) {
			// event not found in current state, bubble up to check the parent
			state = TreeOps.getParentState(state)
		} else {
			// current state handles this event, transition to the target state
			let endPath = target.split('.') // converts 'a.d.e' -> [ 'a', 'd', 'e' ]

			// determine if endPath is an absolute path in the machine,
			// or if it's relative to the current state.
			const absoluteState = TreeOps.getStateFromRelativePath(state, endPath)

			if (absoluteState)
				endPath = TreeOps.getStatePath(machine.definition, absoluteState)

			const startPath = TreeOps.getStatePath(machine.definition, machine.state)

			invocationList = TreeOps.buildInvocationList(machine.definition, startPath, endPath)

			newState = TreeOps.getStateFromPath(machine.definition, endPath)
			break
		}
	}

	if (!newState)
		return

	// execute the entry/exit functions in order
	for (const i of invocationList)
		i(context)

	while (newState) {
		if (!newState.initial)
			break

		newState = newState.states[newState.initial]

		if (newState?.entry)
			newState.entry(context)
	}

	if (machine.state === newState)
		return

    machine.lastState = machine.state
    machine.state = newState
    machine.frameCount = 0
}


export function tick (machine, context) {
	machine.frameCount++
	machine.state?.tick?.(context)
}


// convert the in-memory object to a JSON compatible representation (JSON can't store circular refs)
export function serialize (input) {
    return Cycle.decycle(input)
}


// take the JSON and restore the in-memory version with cycles included
export function deserialize (input) {
    return Cycle.retrocycle(input)
}
