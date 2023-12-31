// find the state that is a parent of child
export function getParentState (machine, child) {
	const states = machine.states || { }

	for (const stateName in states) {
		const s = states[stateName]

		if (Object.values(s.states || {}).includes(child))
			return s

		const p = getParentState(s, child)

		if (p)
			return p
	}
}


// find the name of a given state within it's parent state
export function getStateName (machine, state) {
	const parent = getParentState(machine, state) || machine
	if (!parent)
		return

	const states = parent.states || { }
	const idx = Object.values(states).indexOf(state)
	return Object.keys(states)[idx]
}


// get the absolute path of a state.
// e.g., getStatePath(machine, machine.states.a.states.d.states.e) === [ 'a', 'd', 'e' ]
export function getStatePath (machine, state) {
	const path = [ ]

	while (state) {
		path.unshift(getStateName(machine, state))
		state = getParentState(machine, state)
	}

	return path
}


export function getStateFromPath (machine, path) {
	path = path.slice(0) // copy it to avoid modifying
	let state = machine
	while (path.length) {
		state = state.states[path.shift()]
	}

	return state
}


// @param Array startPath starting location in the tree, e.g., [ 'a', 'b', 'c' ]
// @param Array endPath starting location in the tree, e.g., [ 'a', 'd' ]
export function buildInvocationList (machine, startPath, endPath) {
	const invocationList = [ ]

	// find the root node that is a parent of both the start and end paths
	let root = getCommonRoot(startPath, endPath)

	const walkDownPath = endPath.slice(root.length)

	const rootStr = root.join('.')

	let state

	// copy the array so we don't modify it
	const start = startPath.slice(0)

	// walk up until we reach the root node
	while (rootStr !== start.join('.')) {

		state = getStateFromPath(machine, start)

		if (state.exit)
			invocationList.push(state.exit)

		start.pop()
	}

	state = getStateFromPath(machine, root)
	
	while (walkDownPath.length) {
		const next = walkDownPath.shift()
		state = state.states[next]
		if (state?.entry)
			invocationList.push(state.entry) 
	}

	return invocationList
}


// find the root node that is a parent of both the start and end paths
export function getCommonRoot (startPath, endPath) {
	const len = Math.min(startPath.length, endPath.length)

	for (let i=len-1; i >= 0; i--)
		if (startPath.slice(0, i+1).join('.') === endPath.slice(0, i+1).join('.'))
			return startPath.slice(0, i+1)

	return [ ]
}


export function getStateFromRelativePath (state, path) {
	path = [ ...path ]
	while (path.length) {
		const part = path.shift()
		state = state?.states?.[part]
	}

	return state
}
