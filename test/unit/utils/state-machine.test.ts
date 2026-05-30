import { describe, expect, it, vi } from 'vitest'

import { StateMachine } from '../../../src/utils/state-machine.js'

describe('StateMachine', () => {
  it('starts at initial state', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [],
    })
    expect(sm.getState()).toBe('idle')
  })

  it('transitions on valid event', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
    })
    sm.send('START')
    expect(sm.getState()).toBe('running')
  })

  it('ignores invalid event', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
    })
    sm.send('UNKNOWN')
    expect(sm.getState()).toBe('idle')
  })

  it('chains transitions', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
        { from: 'running', event: 'PAUSE', to: 'paused' },
        { from: 'paused', event: 'RESUME', to: 'running' },
        { from: 'running', event: 'STOP', to: 'idle' },
      ],
    })
    expect(sm.getState()).toBe('idle')
    sm.send('START')
    expect(sm.getState()).toBe('running')
    sm.send('PAUSE')
    expect(sm.getState()).toBe('paused')
    sm.send('RESUME')
    expect(sm.getState()).toBe('running')
    sm.send('STOP')
    expect(sm.getState()).toBe('idle')
  })

  it('supports multiple from states', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
        { from: 'running', event: 'PAUSE', to: 'paused' },
        { from: ['running', 'paused'], event: 'STOP', to: 'idle' },
      ],
    })
    sm.send('START')
    sm.send('STOP')
    expect(sm.getState()).toBe('idle')
    sm.send('START')
    sm.send('PAUSE')
    sm.send('STOP')
    expect(sm.getState()).toBe('idle')
  })

  it('calls onEnter callback', () => {
    const onEnter = vi.fn()
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
      onEnter: { running: onEnter },
    })
    sm.send('START')
    expect(onEnter).toHaveBeenCalledWith('running')
  })

  it('calls onExit callback', () => {
    const onExit = vi.fn()
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
      onExit: { idle: onExit },
    })
    sm.send('START')
    expect(onExit).toHaveBeenCalledWith('idle')
  })

  it('canSend returns true for valid event', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
    })
    expect(sm.canSend('START')).toBe(true)
    expect(sm.canSend('STOP')).toBe(false)
  })

  it('guard blocks transition', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running', guard: () => false },
      ],
    })
    sm.send('START')
    expect(sm.getState()).toBe('idle')
  })

  it('guard allows transition', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running', guard: () => true },
      ],
    })
    sm.send('START')
    expect(sm.getState()).toBe('running')
  })

  it('getAvailableEvents returns valid events', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
        { from: 'idle', event: 'CONFIG', to: 'configured' },
        { from: 'running', event: 'STOP', to: 'idle' },
      ],
    })
    const events = sm.getAvailableEvents()
    expect(events).toContain('START')
    expect(events).toContain('CONFIG')
    expect(events).not.toContain('STOP')
  })

  it('tracks transition history', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
        { from: 'running', event: 'STOP', to: 'idle' },
      ],
    })
    sm.send('START')
    sm.send('STOP')
    const history = sm.getHistory()
    expect(history).toHaveLength(2)
    expect(history[0]!.from).toBe('idle')
    expect(history[0]!.to).toBe('running')
    expect(history[1]!.from).toBe('running')
    expect(history[1]!.to).toBe('idle')
  })

  it('transitionCount tracks count', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
    })
    expect(sm.transitionCount).toBe(0)
    sm.send('START')
    expect(sm.transitionCount).toBe(1)
  })

  it('isState checks current state', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
    })
    expect(sm.isState('idle')).toBe(true)
    expect(sm.isState('running')).toBe(false)
    sm.send('START')
    expect(sm.isState('running')).toBe(true)
  })

  it('isFinalState returns true when no events available', () => {
    const sm = new StateMachine({
      initial: 'done',
      transitions: [
        { from: 'idle', event: 'FINISH', to: 'done' },
      ],
    })
    expect(sm.isFinalState()).toBe(true)
  })

  it('isFinalState returns false when events available', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
    })
    expect(sm.isFinalState()).toBe(false)
  })

  it('reset returns to initial state', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
    })
    sm.send('START')
    sm.reset()
    expect(sm.getState()).toBe('idle')
    expect(sm.transitionCount).toBe(0)
    expect(sm.getHistory()).toHaveLength(0)
  })

  it('getHistory returns a copy', () => {
    const sm = new StateMachine({
      initial: 'idle',
      transitions: [
        { from: 'idle', event: 'START', to: 'running' },
      ],
    })
    sm.send('START')
    const h1 = sm.getHistory()
    const h2 = sm.getHistory()
    expect(h1).not.toBe(h2)
  })
})
