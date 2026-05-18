import { describe, expect, it, vi } from 'vitest'

import { TypedEventEmitter } from '../src/utils/typed-emitter.js'

// ─── on/emit ──────────────────────────────────────────
describe('TypedEventEmitter on/emit', () => {
  it('emits events to subscribers', () => {
    const emitter = new TypedEventEmitter<{ click: { x: number; y: number } }>()
    const handler = vi.fn()
    emitter.on('click', handler)
    emitter.emit('click', { x: 10, y: 20 })

    expect(handler).toHaveBeenCalledWith({ x: 10, y: 20 })
  })

  it('supports multiple subscribers', () => {
    const emitter = new TypedEventEmitter<{ data: string }>()
    const h1 = vi.fn()
    const h2 = vi.fn()
    emitter.on('data', h1)
    emitter.on('data', h2)
    emitter.emit('data', 'hello')

    expect(h1).toHaveBeenCalledWith('hello')
    expect(h2).toHaveBeenCalledWith('hello')
  })

  it('does not emit to different event subscribers', () => {
    const emitter = new TypedEventEmitter<{ a: string; b: string }>()
    const hA = vi.fn()
    emitter.on('a', hA)
    emitter.emit('b', 'test')
    expect(hA).not.toHaveBeenCalled()
  })
})

// ─── off ──────────────────────────────────────────────
describe('TypedEventEmitter off', () => {
  it('removes subscriber', () => {
    const emitter = new TypedEventEmitter<{ msg: string }>()
    const handler = vi.fn()
    emitter.on('msg', handler)
    emitter.off('msg', handler)
    emitter.emit('msg', 'test')
    expect(handler).not.toHaveBeenCalled()
  })

  it('unsubscribe function works', () => {
    const emitter = new TypedEventEmitter<{ msg: string }>()
    const handler = vi.fn()
    const unsub = emitter.on('msg', handler)
    unsub()
    emitter.emit('msg', 'test')
    expect(handler).not.toHaveBeenCalled()
  })
})

// ─── once ─────────────────────────────────────────────
describe('TypedEventEmitter once', () => {
  it('fires only once', () => {
    const emitter = new TypedEventEmitter<{ msg: string }>()
    const handler = vi.fn()
    emitter.once('msg', handler)
    emitter.emit('msg', 'first')
    emitter.emit('msg', 'second')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('first')
  })
})

// ─── listenerCount ────────────────────────────────────
describe('TypedEventEmitter listenerCount', () => {
  it('tracks listener count per event', () => {
    const emitter = new TypedEventEmitter<{ a: void; b: void }>()
    emitter.on('a', () => {})
    emitter.on('a', () => {})
    emitter.on('b', () => {})
    expect(emitter.listenerCount('a')).toBe(2)
    expect(emitter.listenerCount('b')).toBe(1)
  })
})

// ─── removeAllListeners ──────────────────────────────
describe('TypedEventEmitter removeAllListeners', () => {
  it('removes all listeners for specific event', () => {
    const emitter = new TypedEventEmitter<{ a: void; b: void }>()
    emitter.on('a', () => {})
    emitter.on('b', () => {})
    emitter.removeAllListeners('a')
    expect(emitter.listenerCount('a')).toBe(0)
    expect(emitter.listenerCount('b')).toBe(1)
  })

  it('removes all listeners when no event specified', () => {
    const emitter = new TypedEventEmitter<{ a: void; b: void }>()
    emitter.on('a', () => {})
    emitter.on('b', () => {})
    emitter.removeAllListeners()
    expect(emitter.listenerCount('a')).toBe(0)
    expect(emitter.listenerCount('b')).toBe(0)
  })
})

// ─── maxListeners ─────────────────────────────────────
describe('TypedEventEmitter maxListeners', () => {
  it('throws when max listeners exceeded', () => {
    const emitter = new TypedEventEmitter<{ e: void }>({ maxListeners: 2 })
    emitter.on('e', () => {})
    emitter.on('e', () => {})
    expect(() => emitter.on('e', () => {})).toThrow('Max listeners')
  })
})

// ─── getStats ─────────────────────────────────────────
describe('TypedEventEmitter getStats', () => {
  it('tracks stats', () => {
    const emitter = new TypedEventEmitter<{ e: void }>()
    emitter.on('e', () => {})
    emitter.emit('e', undefined)
    emitter.emit('e', undefined)
    const stats = emitter.getStats()
    expect(stats.totalEmitted).toBe(2)
    expect(stats.totalListeners).toBe(1)
    expect(stats.events).toBe(1)
  })
})
