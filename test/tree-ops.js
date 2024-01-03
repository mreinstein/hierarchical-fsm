import * as TreeOps from '../src/tree-ops.js'
import assert       from './_assert.js'
import * as hFSM    from '../src/index.js'


{
	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				initial: 'b',
				states: {
					b: {
						initial: 'c',
						states: {
							c: {
							}
						}
					},
					d: {
						initial: 'e',
						states: {
							e: {
							}
						}
					}
				}
			}
		}
	}

	let parent = TreeOps.getParentState(machineDef, machineDef.states.a.states.b.states.c)
	assert.equal(parent, machineDef.states.a.states.b)

	parent = TreeOps.getParentState(machineDef, machineDef.states.a.states.d)
	assert.equal(parent, machineDef.states.a)

	parent = TreeOps.getParentState(machineDef, machineDef.states.a)
	assert.equal(parent, undefined)
}


{
	const invocationList = [ ] // tracks when machine states are entered/invoked

	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				initial: 'b',
				states: {
					b: {
						initial: 'c',
						states: {
							c: {
							}
						}
					},
					d: {
						initial: 'e',
						states: {
							e: {
							}
						}
					}
				}
			}
		}
	}

	assert.equal(TreeOps.getStateName(machineDef, machineDef.states.a.states.b.states.c), 'c')
	assert.equal(TreeOps.getStateName(machineDef, machineDef.states.a.states.b), 'b')
	assert.equal(TreeOps.getStateName(machineDef, machineDef.states.a), 'a')
	assert.equal(TreeOps.getStateName(machineDef, machineDef.states.a.states.d), 'd')
}


{
	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				initial: 'b',
				states: {
					b: {
						initial: 'c',
						states: {
							c: {
							}
						}
					},
					d: {
						initial: 'e',
						states: {
							e: {
							}
						}
					}
				}
			}
		}
	}

	assert.deepEqual(TreeOps.getStatePath(machineDef, machineDef.states.a.states.b.states.c), [ 'a', 'b', 'c' ])
	assert.deepEqual(TreeOps.getStatePath(machineDef, machineDef.states.a.states.b), [ 'a', 'b' ])
	assert.deepEqual(TreeOps.getStatePath(machineDef, machineDef.states.a), [ 'a' ])
	assert.deepEqual(TreeOps.getStatePath(machineDef, machineDef.states.a.states.d), [ 'a', 'd' ])
}


{
	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				initial: 'b',
				states: {
					b: {
						initial: 'c',
						states: {
							c: {
							}
						}
					},
					d: {
						initial: 'e',
						states: {
							e: {
							}
						}
					}
				}
			}
		}
	}

	assert.deepEqual(TreeOps.getCommonRoot([ 'a', 'd' ], [ 'a', 'b', 'c'])      , [ 'a' ])

	assert.deepEqual(TreeOps.getCommonRoot([ 'a', 'b', 'f' ], [ 'a', 'b', 'c']) , [ 'a', 'b' ])

	assert.deepEqual(TreeOps.getCommonRoot([ 'a', 'b' ], [ 'a', 'b', 'c'])      , [ 'a', 'b' ])

	assert.deepEqual(TreeOps.getCommonRoot([ 'a' ], [ 'a', 'b', 'c'])           , [ 'a' ])
}


{
	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				initial: 'b',
				states: {
					b: {
						initial: 'c',
						states: {
							c: {
							}
						}
					},
					d: {
						initial: 'e',
						states: {
							e: {
							}
						}
					}
				}
			}
		}
	}

	assert.equal(TreeOps.getStateFromPath(machineDef, [ 'a', 'b', 'c' ]), machineDef.states.a.states.b.states.c)
	assert.equal(TreeOps.getStateFromPath(machineDef, [ 'p' ]), undefined)
}


{
	const invocationList = [ ] // tracks when machine states are entered/invoked

	const machineDef = {
		id: 'test machine',
		initial: 'a',
		states: {
			a: {
				initial: 'b',
				on: { },
				entry: function (context) { },
				exit: function (context) { },
				states: {
					b: {
						initial: 'c',
						
						entry: function (context) { },
						exit: function (context) { },
						states: {
							c: {
								on: {
									FLEH: 'a.d.e'
								},
								entry: function (context) { },
								exit: function (context) { },
							}
						}
					},
					d: {
						initial: 'e',
						entry: function (context) { },
						exit: function (context) { },
						states: {
							e: {
								on: {
									MEH: 'a'
								},
								entry: function (context) { },
								exit: function (context) { },
							}
						}
					}
				}
			}
		}
	}

    //                                                   startPath          endPath
	let result = TreeOps.buildInvocationList(machineDef, [ 'a', 'b', 'c' ], [ 'a', 'd' ])
	assert.deepEqual(result, [
		machineDef.states.a.states.b.states.c.exit,
		machineDef.states.a.states.b.exit,
		machineDef.states.a.states.d.entry
	])
	
	result = TreeOps.buildInvocationList(machineDef, [ 'a', 'b', 'c' ], [ 'a', 'd', 'e' ])
	assert.deepEqual(result, [
		machineDef.states.a.states.b.states.c.exit,
		machineDef.states.a.states.b.exit,
		machineDef.states.a.states.d.entry,
		machineDef.states.a.states.d.states.e.entry
	])
}


// basic entry, exit actions
{
	const machineDef = {
		id: 'test machine',
		initial: 'idle',
		states: {
			idle: {
				on: {
					MOVE: 'move'
				},
				entry: function (context) { },
				exit: function (context) { },
			},
			move: {
				entry: function (context) { },
				exit: function (context) { },
			}
		}
	}

	const result = TreeOps.buildInvocationList(machineDef, [ 'idle' ], [ 'move' ])

	assert.deepEqual(result, [
		machineDef.states.idle.exit,
		machineDef.states.move.entry
	])
}
