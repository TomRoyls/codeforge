import { describe, expect, it, vi } from 'vitest'

import { TypedEventEmitter } from '../../../src/utils/typed-emitter.js'

interface TestEvents {
  data: number
  error: string
  ready: undefined
}

describe('TypedEventEmitter', () => {
  it('subscribes and receives events', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const handler = vi.fn()
    emitter.on('data', handler)
    emitter.emit('data', 42)
    expect(handler).toHaveBeenCalledWith(42)
  })

  it('supports multiple listeners on same event', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const h1 = vi.fn()
    const h2 = vi.fn()
    emitter.on('data', h1)
    emitter.on('data', h2)
    emitter.emit('data', 1)
    expect(h1).toHaveBeenCalledWith(1)
    expect(h2).toHaveBeenCalledWith(1)
  })

  it('unsubscribe function removes listener', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const handler = vi.fn()
    const unsub = emitter.on('data', handler)
    unsub()
    emitter.emit('data', 42)
    expect(handler).not.toHaveBeenCalled()
  })

  it('off removes a specific listener', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const handler = vi.fn()
    emitter.on('data', handler)
    emitter.off('data', handler)
    emitter.emit('data', 42)
    expect(handler).not.toHaveBeenCalled()
  })

  it('once fires only once', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const handler = vi.fn()
    emitter.once('data', handler)
    emitter.emit('data', 1)
    emitter.emit('data', 2)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(1)
  })

  it('once unsubscribe prevents firing', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const handler = vi.fn()
    const unsub = emitter.once('data', handler)
    unsub()
    emitter.emit('data', 1)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not call listeners for other events', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const dataHandler = vi.fn()
    const errorHandler = vi.fn()
    emitter.on('data', dataHandler)
    emitter.on('error', errorHandler)
    emitter.emit('data', 1)
    expect(dataHandler).toHaveBeenCalled()
    expect(errorHandler).not.toHaveBeenCalled()
  })

  it('emit with undefined data', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const handler = vi.fn()
    emitter.on('ready', handler)
    emitter.emit('ready', undefined)
    expect(handler).toHaveBeenCalledWith(undefined)
  })

  it('listenerCount returns correct count', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    expect(emitter.listenerCount('data')).toBe(0)
    emitter.on('data', vi.fn())
    expect(emitter.listenerCount('data')).toBe(1)
    emitter.on('data', vi.fn())
    expect(emitter.listenerCount('data')).toBe(2)
  })

  it('removeAllListeners removes listeners for specific event', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('data', vi.fn())
    emitter.on('error', vi.fn())
    emitter.removeAllListeners('data')
    expect(emitter.listenerCount('data')).toBe(0)
    expect(emitter.listenerCount('error')).toBe(1)
  })

  it('removeAllListeners without args removes all', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('data', vi.fn())
    emitter.on('error', vi.fn())
    emitter.removeAllListeners()
    expect(emitter.listenerCount('data')).toBe(0)
    expect(emitter.listenerCount('error')).toBe(0)
  })

  it('throws when max listeners exceeded', () => {
    const emitter = new TypedEventEmitter<TestEvents>({ maxListeners: 2 })
    emitter.on('data', vi.fn())
    emitter.on('data', vi.fn())
    expect(() => emitter.on('data', vi.fn())).toThrow('Max listeners')
  })

  it('getStats returns correct values', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('data', vi.fn())
    emitter.on('data', vi.fn())
    emitter.on('error', vi.fn())
    emitter.emit('data', 1)
    emitter.emit('data', 2)
    const stats = emitter.getStats()
    expect(stats.events).toBe(2)
    expect(stats.totalListeners).toBe(3)
    expect(stats.totalEmitted).toBe(2)
  })

  it('off on non-existent event does nothing', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    expect(() => emitter.off('data', vi.fn())).not.toThrow()
  })

  it('emit with no listeners does nothing', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    expect(() => emitter.emit('data', 1)).not.toThrow()
  })
})
