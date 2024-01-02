import assert    from './_assert.js'
import * as hFSM from '../src/index.js'


// test initializing a state machine
{
	const invocationList = [ ] // tracks when machine states are entered/invoked

	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				initial: 'b',
				on: { },
				entry: function (context) { invocationList.push('a') },
				states: {
					b: {
						initial: 'c',
						entry: function (context) { invocationList.push('b') },
						states: {
							c: {
								entry: function (context) { invocationList.push('c') }
							}
						}
					},
					d: {
						entry: function (context) { invocationList.push('d') },
					}
				}
			}
		}
	}

	const m = hFSM.create(machineDef)
	hFSM.init(m)

	assert.deepEqual(invocationList, [ 'a', 'b', 'c' ])
	assert.equal(m.state, machineDef.states.a.states.b.states.c)
	assert.equal(m.lastState, undefined)
}


// test entry/exit functions from raiseEvent
{
	const invocationList = [ ] // tracks when machine states are entered/invoked

	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				initial: 'b',
				on: { },
				entry: function (context) { invocationList.push('a:entry') },
				exit: function (context) { invocationList.push('a:exit') },
				states: {
					b: {
						initial: 'c',
						
						entry: function (context) { invocationList.push('b:entry') },
						exit: function (context) { invocationList.push('b:exit') },
						states: {
							c: {
								on: {
									FLEH: 'a.d.e'
								},
								entry: function (context) { invocationList.push('c:entry') },
								exit: function (context) { invocationList.push('c:exit') },
							}
						}
					},
					d: {
						initial: 'e',
						entry: function (context) { invocationList.push('d:entry') },
						exit: function (context) { invocationList.push('d:exit') },
						states: {
							e: {
								on: {
									MEH: 'a'
								},
								entry: function (context) { invocationList.push('e:entry') },
								exit: function (context) { invocationList.push('e:exit') },
							}
						}
					}
				}
			}
		}
	}

	const m = hFSM.create(machineDef)
	hFSM.init(m)

	assert.equal(m.state, machineDef.states.a.states.b.states.c)

	invocationList.length = 0

	hFSM.raiseEvent('FLEH', m)

	assert.deepEqual(invocationList, [ 'c:exit', 'b:exit', 'd:entry', 'e:entry' ])
	assert.equal(m.state, machineDef.states.a.states.d.states.e)
	assert.equal(m.lastState, machineDef.states.a.states.b.states.c)

	
	invocationList.length = 0
	hFSM.raiseEvent('MEH', m)

	assert.deepEqual(invocationList, [ 'e:exit', 'd:exit', 'b:entry', 'c:entry' ])
	assert.equal(m.state, machineDef.states.a.states.b.states.c)
	assert.equal(m.lastState, machineDef.states.a.states.d.states.e)
}


// test relative event targets and context availability
{
	const invocationList = [ ]

	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				on: {
					RUN: 'b'
				},
				entry: function (context) { invocationList.push('a:entry') },
				exit: function (context) { invocationList.push('a:exit') },
				tick: function (context) { },
				states: {
					b: {
						on: {
							FLY: 'a.d',
						}
						entry: function (context) { invocationList.push(`b:entry:count${context.count}`) },
						exit: function (context) { invocationList.push('b:exit') },
					}, // contains sub-state c
					d: { }, // contains sub-state e
				}
			}
		}
	}

	const m = hFSM.create(machineDef)

	hFSM.init(m)

	assert.deepEqual(invocationList, [ 'a:entry' ])
	assert.equal(m.state, machineDef.states.a)

	invocationList.length = 0
	
	const context = { count: 346 } // pass in whatever data you want the event handlers to have access to
	hFSM.raiseEvent('RUN', m, context)

	assert.deepEqual(invocationList, [ 'b:entry:count346' ])
	assert.equal(m.state, machineDef.states.a.states.b)


	invocationList.length = 0
	hFSM.raiseEvent('FLY', m, context)

	assert.deepEqual(invocationList, [ 'b:exit' ])
	assert.equal(m.state, machineDef.states.a.states.d)
	assert.equal(m.lastState, machineDef.states.a.states.b)
}
