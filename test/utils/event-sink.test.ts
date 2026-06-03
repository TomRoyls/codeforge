import { describe, it, expect, vi } from 'vitest'
import { EventSink } from '../../src/utils/event-sink.js'

type Events = {
  click: { x: number; y: number }
  change: { value: string }
  error: { message: string }
}

describe('EventSink', () => {
  it('constructor creates empty event sink', () => {
    const sink = new EventSink<Events>()
    expect(sink.eventNames.length).toBe(0)
  })

  it('on registers listener and returns unsubscribe function', () => {
    const sink = new EventSink<Events>()
    const unsubscribe = sink.on('click', data => {})
    expect(typeof unsubscribe).toBe('function')
  })

  it('emit calls registered listener', () => {
    const sink = new EventSink<Events>()
    const handler = vi.fn()
    sink.on('click', handler)
    sink.emit('click', { x: 10, y: 20 })
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ x: 10, y: 20 })
  })

  it('emit calls listener multiple times', () => {
    const sink = new EventSink<Events>()
    const handler = vi.fn()
    sink.on('click', handler)
    sink.emit('click', { x: 10, y: 20 })
    sink.emit('click', { x: 30, y: 40 })
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('off removes specific listener', () => {
    const sink = new EventSink<Events>()
    const handler = vi.fn()
    sink.on('click', handler)
    sink.off('click', handler)
    sink.emit('click', { x: 10, y: 20 })
    expect(handler).not.toHaveBeenCalled()
  })

  it('off does not affect other listeners', () => {
    const sink = new EventSink<Events>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    sink.on('click', handler1)
    sink.on('click', handler2)
    sink.off('click', handler1)
    sink.emit('click', { x: 10, y: 20 })
    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('on returns unsubscribe that works correctly', () => {
    const sink = new EventSink<Events>()
    const handler = vi.fn()
    const unsubscribe = sink.on('click', handler)
    unsubscribe()
    sink.emit('click', { x: 10, y: 20 })
    expect(handler).not.toHaveBeenCalled()
  })

  it('emit with no listeners does not throw', () => {
    const sink = new EventSink<Events>()
    expect(() => sink.emit('click', { x: 10, y: 20 })).not.toThrow()
  })

  it('listenerCount returns correct count', () => {
    const sink = new EventSink<Events>()
    expect(sink.listenerCount('click')).toBe(0)
    sink.on('click', () => {})
    expect(sink.listenerCount('click')).toBe(1)
    sink.on('click', () => {})
    expect(sink.listenerCount('click')).toBe(2)
  })

  it('listenerCount for non-existent event returns 0', () => {
    const sink = new EventSink<Events>()
    expect(sink.listenerCount('error')).toBe(0)
  })

  it('removeAllListeners removes all listeners for specific event', () => {
    const sink = new EventSink<Events>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    sink.on('click', handler1)
    sink.on('click', handler2)
    sink.removeAllListeners('click')
    sink.emit('click', { x: 10, y: 20 })
    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('removeAllListeners with no argument removes all listeners', () => {
    const sink = new EventSink<Events>()
    const clickHandler = vi.fn()
    const changeHandler = vi.fn()
    sink.on('click', clickHandler)
    sink.on('change', changeHandler)
    sink.removeAllListeners()
    sink.emit('click', { x: 10, y: 20 })
    sink.emit('change', { value: 'test' })
    expect(clickHandler).not.toHaveBeenCalled()
    expect(changeHandler).not.toHaveBeenCalled()
  })

  it('eventNames returns registered event types', () => {
    const sink = new EventSink<Events>()
    expect(sink.eventNames.length).toBe(0)
    sink.on('click', () => {})
    expect(sink.eventNames).toContain('click')
    sink.on('change', () => {})
    expect(sink.eventNames).toContain('change')
  })

  it('handles multiple listeners on same event', () => {
    const sink = new EventSink<Events>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const handler3 = vi.fn()
    sink.on('click', handler1)
    sink.on('click', handler2)
    sink.on('click', handler3)
    sink.emit('click', { x: 10, y: 20 })
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).toHaveBeenCalledTimes(1)
  })

  it('handles different event types independently', () => {
    const sink = new EventSink<Events>()
    const clickHandler = vi.fn()
    const changeHandler = vi.fn()
    sink.on('click', clickHandler)
    sink.on('change', changeHandler)
    sink.emit('click', { x: 10, y: 20 })
    expect(clickHandler).toHaveBeenCalledTimes(1)
    expect(changeHandler).not.toHaveBeenCalled()
    sink.emit('change', { value: 'test' })
    expect(changeHandler).toHaveBeenCalledTimes(1)
    expect(clickHandler).toHaveBeenCalledTimes(1)
  })

  it('removing non-existent listener does not throw', () => {
    const sink = new EventSink<Events>()
    const handler = () => {}
    expect(() => sink.off('click', handler)).not.toThrow()
  })

  it('emit with no listeners does not throw', () => {
    const sink = new EventSink<Events>()
    expect(() => sink.emit('click', { x: 0, y: 0 })).not.toThrow()
  })

  it('on registers listener that fires', () => {
    const sink = new EventSink<Events>()
    let received = false
    sink.on('click', () => { received = true })
    sink.emit('click', { x: 1, y: 2 })
    expect(received).toBe(true)
  })

  it('off stops events', () => {
    let count = 0
    const handler = () => { count++ }
    const sink = new EventSink<{ click: { x: number; y: number } }>()
    sink.on('click', handler)
    sink.emit('click', { x: 1, y: 2 })
    sink.off('click', handler)
    sink.emit('click', { x: 3, y: 4 })
    expect(count).toBe(1)
  })

  it('emit with no listeners does not throw', () => {
    const sink = new EventSink()
    expect(() => sink.emit('unknown', null)).not.toThrow()
  })

  it('on registers listener', () => {
    const sink = new EventSink()
    let received = false
    sink.on('test', () => { received = true })
    sink.emit('test', null)
    expect(received).toBe(true)
  })

  it('off stops receiving events', () => {
    const sink = new EventSink<Events>()
    let count = 0
    const handler = () => { count++ }
    sink.on('test', handler)
    sink.emit('test', null)
    sink.off('test', handler)
    sink.emit('test', null)
    expect(count).toBe(1)
  })
})