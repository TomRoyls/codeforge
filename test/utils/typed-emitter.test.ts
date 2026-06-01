import { describe, it, expect } from 'vitest'
import { TypedEventEmitter } from '../../src/utils/typed-emitter.js'

interface TestEvents {
  message: string
  count: number
}

// ─── On and Emit ──────────────────────────────────────────
describe('TypedEventEmitter - on and emit', () => {
  it('receives emitted events', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let received = ''
    emitter.on('message', (msg) => { received = msg })
    emitter.emit('message', 'hello')
    expect(received).toBe('hello')
  })

  it('supports multiple listeners', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    emitter.on('count', () => { count++ })
    emitter.on('count', () => { count++ })
    emitter.emit('count', 1)
    expect(count).toBe(2)
  })
})

// ─── Once ─────────────────────────────────────────────────
describe('TypedEventEmitter - once', () => {
  it('fires only once', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    emitter.once('count', () => { count++ })
    emitter.emit('count', 1)
    emitter.emit('count', 2)
    expect(count).toBe(1)
  })
})

// ─── Off ──────────────────────────────────────────────────
describe('TypedEventEmitter - off', () => {
  it('removes listener', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    const handler = () => { count++ }
    emitter.on('count', handler)
    emitter.emit('count', 1)
    emitter.off('count', handler)
    emitter.emit('count', 2)
    expect(count).toBe(1)
  })

  it('on returns unsubscribe function', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    const unsub = emitter.on('count', () => { count++ })
    emitter.emit('count', 1)
    unsub()
    emitter.emit('count', 2)
    expect(count).toBe(1)
  })
})

// ─── Stats ────────────────────────────────────────────────
describe('TypedEventEmitter - stats', () => {
  it('tracks listener count', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.on('count', () => {})
    expect(emitter.listenerCount('message')).toBe(1)
    expect(emitter.listenerCount('count')).toBe(1)
  })

  it('returns stats', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.emit('message', 'test')
    const stats = emitter.getStats()
    expect(stats.totalListeners).toBe(1)
    expect(stats.totalEmitted).toBe(1)
  })
})

// ─── removeAllListeners ───────────────────────────────────
describe('TypedEventEmitter - removeAllListeners', () => {
  it('removes all listeners for specific event', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.on('message', () => {})
    emitter.removeAllListeners('message')
    expect(emitter.listenerCount('message')).toBe(0)
  })

  it('removes all listeners when no event specified', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.on('count', () => {})
    emitter.removeAllListeners()
    expect(emitter.getStats().totalListeners).toBe(0)
  })
})

// ─── Max listeners ────────────────────────────────────────
describe('TypedEventEmitter - max listeners', () => {
  it('throws when max listeners exceeded', () => {
    const emitter = new TypedEventEmitter<TestEvents>({ maxListeners: 2 })
    emitter.on('message', () => {})
    emitter.on('message', () => {})
    expect(() => emitter.on('message', () => {})).toThrow('Max listeners')
  })

  it('emits with correct argument types', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let receivedNum = 0
    emitter.on('count', (n) => { receivedNum = n })
    emitter.emit('count', 42)
    expect(receivedNum).toBe(42)
  })

  it('once returns unsubscribe function', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    const unsub = emitter.once('count', () => { count++ })
    unsub()
    emitter.emit('count', 1)
    expect(count).toBe(0)
  })

  it('off does nothing for unknown handler', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.off('message', () => {})
    expect(emitter.listenerCount('message')).toBe(0)
  })

  it('once with multiple events', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let received = ''
    emitter.once('message', (msg) => { received = msg })
    emitter.emit('message', 'first')
    emitter.emit('message', 'second')
    expect(received).toBe('first')
  })

  it('on with multiple handlers', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let sum = 0
    emitter.on('count', (n) => { sum += n })
    emitter.on('count', (n) => { sum += n * 10 })
    emitter.emit('count', 5)
    expect(sum).toBe(55)
  })

  it('emit with no listeners does not throw', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    expect(() => emitter.emit('message', 'test')).not.toThrow()
  })

  it('removeAllListeners clears handlers', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    emitter.on('message', () => { count++ })
    emitter.removeAllListeners('message')
    emitter.emit('message', 'test')
    expect(count).toBe(0)
  })

  it('emit with no listeners does not throw', () => {
    const emitter = new TypedEventEmitter<Events>()
    expect(() => emitter.emit('message', 'test')).not.toThrow()
  })
})
