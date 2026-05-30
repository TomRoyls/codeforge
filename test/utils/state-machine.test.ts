import { describe, it, expect, beforeEach } from 'vitest'
import { StateMachine, StateConfig } from '../../src/utils/state-machine.js'

type State = 'idle' | 'running' | 'paused' | 'stopped'
type Event = 'start' | 'pause' | 'resume' | 'stop'

describe('StateMachine', () => {
  it('initializes with initial state', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: []
    }
    const sm = new StateMachine(config)
    expect(sm.getState()).toBe('idle')
  })

  it('transitions to next state', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }]
    }
    const sm = new StateMachine(config)
    sm.send('start')
    expect(sm.getState()).toBe('running')
  })

  it('stays in same state for unknown event', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }]
    }
    const sm = new StateMachine(config)
    sm.send('pause')
    expect(sm.getState()).toBe('idle')
  })

  it('handles multiple transitions', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'start', to: 'running' },
        { from: 'running', event: 'pause', to: 'paused' }
      ]
    }
    const sm = new StateMachine(config)
    sm.send('start')
    sm.send('pause')
    expect(sm.getState()).toBe('paused')
  })

  it('transitions from multiple source states', () => {
    const config: StateConfig<State, Event> = {
      initial: 'running',
      transitions: [
        { from: ['running', 'paused'], event: 'stop', to: 'stopped' }
      ]
    }
    const sm1 = new StateMachine(config)
    sm1.send('stop')
    expect(sm1.getState()).toBe('stopped')
  })

  it('executes onEnter callback', () => {
    let entered = false
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }],
      onEnter: { running: () => { entered = true } }
    }
    const sm = new StateMachine(config)
    sm.send('start')
    expect(entered).toBe(true)
  })

  it('executes onExit callback', () => {
    let exited = false
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }],
      onExit: { idle: () => { exited = true } }
    }
    const sm = new StateMachine(config)
    sm.send('start')
    expect(exited).toBe(true)
  })

  it('transitions guard passes', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running', guard: () => true }]
    }
    const sm = new StateMachine(config)
    sm.send('start')
    expect(sm.getState()).toBe('running')
  })

  it('stays when guard fails', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running', guard: () => false }]
    }
    const sm = new StateMachine(config)
    sm.send('start')
    expect(sm.getState()).toBe('idle')
  })

  it('returns current state from send', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }]
    }
    const sm = new StateMachine(config)
    const result = sm.send('start')
    expect(result).toBe('running')
  })

  it('returns same state when transition fails', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: []
    }
    const sm = new StateMachine(config)
    const result = sm.send('start')
    expect(result).toBe('idle')
  })

  it('checks canSend for valid event', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }]
    }
    const sm = new StateMachine(config)
    expect(sm.canSend('start')).toBe(true)
  })

  it('checks canSend for invalid event', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }]
    }
    const sm = new StateMachine(config)
    expect(sm.canSend('pause')).toBe(false)
  })

  it('checks canSend with guard passes', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running', guard: () => true }]
    }
    const sm = new StateMachine(config)
    expect(sm.canSend('start')).toBe(true)
  })

  it('checks canSend with guard fails', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running', guard: () => false }]
    }
    const sm = new StateMachine(config)
    expect(sm.canSend('start')).toBe(false)
  })

  it('gets available events', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'start', to: 'running' },
        { from: 'idle', event: 'stop', to: 'stopped' }
      ]
    }
    const sm = new StateMachine(config)
    const events = sm.getAvailableEvents()
    expect(events).toHaveLength(2)
    expect(events).toContain('start')
    expect(events).toContain('stop')
  })

  it('gets available events after transition', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'start', to: 'running' },
        { from: 'running', event: 'pause', to: 'paused' }
      ]
    }
    const sm = new StateMachine(config)
    sm.send('start')
    const events = sm.getAvailableEvents()
    expect(events).toEqual(['pause'])
  })

  it('counts transitions', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'start', to: 'running' },
        { from: 'running', event: 'pause', to: 'paused' },
        { from: 'paused', event: 'resume', to: 'running' }
      ]
    }
    const sm = new StateMachine(config)
    expect(sm.transitionCount).toBe(0)
    sm.send('start')
    expect(sm.transitionCount).toBe(1)
    sm.send('pause')
    expect(sm.transitionCount).toBe(2)
    sm.send('resume')
    expect(sm.transitionCount).toBe(3)
  })

  it('logs transition history', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'start', to: 'running' },
        { from: 'running', event: 'pause', to: 'paused' }
      ]
    }
    const sm = new StateMachine(config)
    sm.send('start')
    sm.send('pause')
    const history = sm.getHistory()
    expect(history).toHaveLength(2)
    expect(history[0]!.from).toBe('idle')
    expect(history[0]!.to).toBe('running')
    expect(history[0]!.event).toBe('start')
    expect(history[1]!.from).toBe('running')
    expect(history[1]!.to).toBe('paused')
    expect(history[1]!.event).toBe('pause')
  })

  it('checks isState', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }]
    }
    const sm = new StateMachine(config)
    expect(sm.isState('idle')).toBe(true)
    expect(sm.isState('running')).toBe(false)
    sm.send('start')
    expect(sm.isState('running')).toBe(true)
    expect(sm.isState('idle')).toBe(false)
  })

  it('checks isFinalState with transitions', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }]
    }
    const sm = new StateMachine(config)
    expect(sm.isFinalState()).toBe(false)
  })

  it('checks isFinalState without available transitions', () => {
    const config: StateConfig<State, Event> = {
      initial: 'stopped',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }]
    }
    const sm = new StateMachine(config)
    expect(sm.isFinalState()).toBe(true)
  })

  it('resets to initial state', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'start', to: 'running' },
        { from: 'running', event: 'pause', to: 'paused' }
      ]
    }
    const sm = new StateMachine(config)
    sm.send('start')
    sm.send('pause')
    expect(sm.getState()).toBe('paused')
    expect(sm.transitionCount).toBe(2)
    sm.reset()
    expect(sm.getState()).toBe('idle')
    expect(sm.transitionCount).toBe(0)
    expect(sm.getHistory()).toHaveLength(0)
  })

  it('executes onExit during reset', () => {
    let exited = false
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [{ from: 'idle', event: 'start', to: 'running' }],
      onExit: { idle: () => { exited = true } }
    }
    const sm = new StateMachine(config)
    sm.reset()
    expect(exited).toBe(true)
  })

  it('handles complex state machine', () => {
    const config: StateConfig<State, Event> = {
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'start', to: 'running' },
        { from: 'running', event: 'pause', to: 'paused' },
        { from: 'paused', event: 'resume', to: 'running' },
        { from: ['running', 'paused'], event: 'stop', to: 'stopped' }
      ]
    }
    const sm = new StateMachine(config)
    sm.send('start')
    expect(sm.getState()).toBe('running')
    sm.send('pause')
    expect(sm.getState()).toBe('paused')
    sm.send('resume')
    expect(sm.getState()).toBe('running')
    sm.send('stop')
    expect(sm.getState()).toBe('stopped')
  })
})