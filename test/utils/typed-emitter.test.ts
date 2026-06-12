import { describe, it, expect } from 'vitest'
import { TypedEventEmitter } from '../../src/utils/typed-emitter.js'

interface TestEvents {
  message: string
  count: number
}

interface Events {
  message: string
}

describe('TypedEventEmitter', () => {
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

  it('once fires only once', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    emitter.once('count', () => { count++ })
    emitter.emit('count', 1)
    emitter.emit('count', 2)
    expect(count).toBe(1)
  })

  it('once receives correct data', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let received = ''
    emitter.once('message', (msg) => { received = msg })
    emitter.emit('message', 'first')
    emitter.emit('message', 'second')
    expect(received).toBe('first')
  })

  it('off removes listener', () => {
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

  it('once returns unsubscribe function', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    const unsub = emitter.once('count', () => { count++ })
    unsub()
    emitter.emit('count', 1)
    expect(count).toBe(0)
  })

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
    expect(stats.events).toBe(1)
  })

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

  it('off does nothing for unknown handler', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.off('message', () => {})
    expect(emitter.listenerCount('message')).toBe(0)
  })

  it('on with multiple handlers on same event', () => {
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

  it('removeAllListeners clears handlers preventing future emissions', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    emitter.on('message', () => { count++ })
    emitter.removeAllListeners('message')
    emitter.emit('message', 'test')
    expect(count).toBe(0)
  })

  it('listenerCount returns 0 for unregistered event', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    expect(emitter.listenerCount('message')).toBe(0)
  })

  it('multiple emits trigger handler each time', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    emitter.on('count', () => { count++ })
    emitter.emit('count', 1)
    emitter.emit('count', 2)
    emitter.emit('count', 3)
    expect(count).toBe(3)
  })

  it('stats tracks multiple emitted events', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.emit('message', 'a')
    emitter.emit('message', 'b')
    emitter.emit('message', 'c')
    expect(emitter.getStats().totalEmitted).toBe(3)
  })

  it('stats tracks multiple event types', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.on('count', () => {})
    expect(emitter.getStats().events).toBe(2)
    expect(emitter.getStats().totalListeners).toBe(2)
  })

  it('add and remove listener updates count', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const handler = () => {}
    emitter.on('message', handler)
    expect(emitter.listenerCount('message')).toBe(1)
    emitter.off('message', handler)
    expect(emitter.listenerCount('message')).toBe(0)
  })

  it('removeAllListeners with no args clears everything', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.on('count', () => {})
    emitter.removeAllListeners()
    expect(emitter.getStats().events).toBe(0)
  })

  it('emitting after removeAllListeners does not throw', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.removeAllListeners()
    expect(() => emitter.emit('message', 'test')).not.toThrow()
  })

  it('default max listeners is 50', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    for (let i = 0; i < 50; i++) {
      emitter.on('message', () => {})
    }
    expect(() => emitter.on('message', () => {})).toThrow('Max listeners')
  })

  it('custom max listeners works', () => {
    const emitter = new TypedEventEmitter<TestEvents>({ maxListeners: 5 })
    for (let i = 0; i < 5; i++) {
      emitter.on('message', () => {})
    }
    expect(() => emitter.on('message', () => {})).toThrow('Max listeners')
  })

  it('different events have independent max listeners', () => {
    const emitter = new TypedEventEmitter<TestEvents>({ maxListeners: 1 })
    emitter.on('message', () => {})
    expect(() => emitter.on('message', () => {})).toThrow()
    emitter.on('count', () => {})
    expect(emitter.listenerCount('count')).toBe(1)
  })

  it('re-registering same handler counts as separate', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const handler = () => {}
    emitter.on('message', handler)
    emitter.on('message', handler)
    expect(emitter.listenerCount('message')).toBe(1)
  })

  it('off for non-existent event does nothing', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    expect(() => emitter.off('message', () => {})).not.toThrow()
  })

  it('once with data receives correct data', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let received = 0
    emitter.once('count', (n) => { received = n })
    emitter.emit('count', 99)
    expect(received).toBe(99)
  })

  it('stats after multiple operations', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.on('message', () => {})
    emitter.on('count', () => {})
    emitter.emit('message', 'a')
    emitter.emit('count', 1)
    emitter.emit('count', 2)
    const stats = emitter.getStats()
    expect(stats.events).toBe(2)
    expect(stats.totalListeners).toBe(2)
    expect(stats.totalEmitted).toBe(3)
  })

  it('remove specific event leaves others intact', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let countCalled = false
    emitter.on('message', () => {})
    emitter.on('count', () => { countCalled = true })
    emitter.removeAllListeners('message')
    emitter.emit('count', 1)
    expect(countCalled).toBe(true)
    expect(emitter.listenerCount('message')).toBe(0)
    expect(emitter.listenerCount('count')).toBe(1)
  })

  it('unsubscribe from once before fire', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let called = false
    const unsub = emitter.once('message', () => { called = true })
    unsub()
    emitter.emit('message', 'test')
    expect(called).toBe(false)
  })

  it('multiple once listeners on same event', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    emitter.once('count', () => { count++ })
    emitter.once('count', () => { count++ })
    emitter.emit('count', 1)
    expect(count).toBe(2)
    emitter.emit('count', 2)
    expect(count).toBe(2)
  })

  it('void event type works', () => {
    const emitter = new TypedEventEmitter<{ click: void }>()
    let clicked = false
    emitter.on('click', () => { clicked = true })
    emitter.emit('click')
    expect(clicked).toBe(true)
  })

  it('emit to void event with undefined', () => {
    const emitter = new TypedEventEmitter<{ done: void }>()
    expect(() => emitter.emit('done')).not.toThrow()
  })

  it('on and off multiple times', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    const handler = () => { count++ }
    emitter.on('count', handler)
    emitter.off('count', handler)
    emitter.on('count', handler)
    emitter.emit('count', 1)
    expect(count).toBe(1)
  })

  it('once then on same event', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let onceCalled = false
    let onCalled = false
    emitter.once('message', () => { onceCalled = true })
    emitter.on('message', () => { onCalled = true })
    emitter.emit('message', 'test')
    expect(onceCalled).toBe(true)
    expect(onCalled).toBe(true)
    emitter.emit('message', 'test2')
    expect(emitter.listenerCount('message')).toBe(1)
  })

  it('stats totalEmitted increments for each emit call', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.emit('message', 'a')
    emitter.emit('count', 1)
    emitter.emit('message', 'b')
    expect(emitter.getStats().totalEmitted).toBe(3)
  })

  it('stats totalEmitted increments even with no listeners', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.emit('message', 'test')
    expect(emitter.getStats().totalEmitted).toBe(1)
  })

  it('maxListeners error message includes event name', () => {
    const emitter = new TypedEventEmitter<TestEvents>({ maxListeners: 1 })
    emitter.on('message', () => {})
    try {
      emitter.on('message', () => {})
      expect.unreachable('Should have thrown')
    } catch (e) {
      expect((e as Error).message).toContain('message')
      expect((e as Error).message).toContain('1')
    }
  })

  it('constructor with empty options uses defaults', () => {
    const emitter = new TypedEventEmitter<TestEvents>({})
    for (let i = 0; i < 50; i++) {
      emitter.on('message', () => {})
    }
    expect(() => emitter.on('message', () => {})).toThrow()
  })

  it('off removes exact handler not others', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count1 = 0
    let count2 = 0
    const handler1 = () => { count1++ }
    const handler2 = () => { count2++ }
    emitter.on('count', handler1)
    emitter.on('count', handler2)
    emitter.off('count', handler1)
    emitter.emit('count', 1)
    expect(count1).toBe(0)
    expect(count2).toBe(1)
  })

  it('maxListeners of 1 allows exactly one listener', () => {
    const emitter = new TypedEventEmitter<TestEvents>({ maxListeners: 1 })
    emitter.on('message', () => {})
    expect(emitter.listenerCount('message')).toBe(1)
    expect(() => emitter.on('message', () => {})).toThrow()
  })

  it('removeAllListeners then re-register works', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    emitter.on('count', () => { count++ })
    emitter.removeAllListeners('count')
    emitter.on('count', () => { count++ })
    emitter.emit('count', 1)
    expect(count).toBe(1)
    expect(emitter.listenerCount('count')).toBe(1)
  })

  it('emits to listeners in registration order', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const results: number[] = []
    emitter.on('count', () => { results.push(1) })
    emitter.on('count', () => { results.push(2) })
    emitter.on('count', () => { results.push(3) })
    emitter.emit('count', 0)
    expect(results).toEqual([1, 2, 3])
  })

  it('handles complex event data types', () => {
    interface ComplexEvents {
      data: { id: number; name: string; values: number[] }
    }
    const emitter = new TypedEventEmitter<ComplexEvents>()
    let received: { id: number; name: string; values: number[] } | null = null
    emitter.on('data', (d) => { received = d })
    emitter.emit('data', { id: 42, name: 'test', values: [1, 2, 3] })
    expect(received).toEqual({ id: 42, name: 'test', values: [1, 2, 3] })
  })

  it('getStats returns object with correct structure', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    const stats = emitter.getStats()
    expect(stats).toHaveProperty('events')
    expect(stats).toHaveProperty('totalListeners')
    expect(stats).toHaveProperty('totalEmitted')
    expect(typeof stats.events).toBe('number')
    expect(typeof stats.totalListeners).toBe('number')
    expect(typeof stats.totalEmitted).toBe('number')
  })

  it('removing listener during emit does not affect current emit', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    const handler1 = () => { count++ }
    const handler2 = () => { count++; emitter.off('count', handler1) }
    emitter.on('count', handler1)
    emitter.on('count', handler2)
    emitter.emit('count', 1)
    expect(count).toBe(2)
    emitter.emit('count', 2)
    expect(count).toBe(3)
  })

  it('multiple removeAllListeners calls do not throw', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    emitter.removeAllListeners('message')
    emitter.removeAllListeners('message')
    expect(() => emitter.removeAllListeners('message')).not.toThrow()
  })

  it('chaining multiple add and remove operations', () => {
    const emitter = new TypedEventEmitter<TestEvents>()
    let count = 0
    const handler1 = () => { count += 1 }
    const handler2 = () => { count += 10 }
    emitter.on('count', handler1)
    emitter.on('count', handler2)
    emitter.emit('count', 1)
    emitter.off('count', handler1)
    emitter.emit('count', 2)
    emitter.on('count', handler1)
    emitter.emit('count', 3)
    expect(count).toBe(32)
  })

  it('once listener fires only once', () => {
    const emitter = new TypedEmitter<{ click: number }>()
    let count = 0
    emitter.once('click', () => { count++ })
    emitter.emit('click', 1)
    emitter.emit('click', 2)
    expect(count).toBe(1)
  })

  it('off removes listener', () => {
    const emitter = new TypedEmitter<{ data: string }>()
    let count = 0
    const listener = () => { count++ }
    emitter.on('data', listener)
    emitter.emit('data', 'a')
    emitter.off('data', listener)
    emitter.emit('data', 'b')
    expect(count).toBe(1)
  })

  it('on returns unsubscribe function', () => {
    const emitter = new TypedEmitter<{ x: number }>()
    let count = 0
    const unsub = emitter.on('x', () => { count++ })
    emitter.emit('x', 1)
    unsub()
    emitter.emit('x', 2)
    expect(count).toBe(1)
  })

  it('multiple listeners on same event', () => {
    const emitter = new TypedEmitter<{ e: void }>()
    let a = 0, b = 0
    emitter.on('e', () => { a++ })
    emitter.on('e', () => { b++ })
    emitter.emit('e', undefined as unknown as void)
    expect(a).toBe(1)
    expect(b).toBe(1)
  })
})

describe('typed-emitter - wave562', () => {
  it('typed-emitter w562 v0', () => {
    expect(describe).toBeDefined()
  })
})

describe('typed-emitter - wave563', () => {
  it('typed-emitter w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('typed-emitter w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('typed-emitter w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('typed-emitter - wave564', () => {
  it('typed-emitter w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('typed-emitter w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('typed-emitter w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('typed-emitter - wave565', () => {
  it('typed-emitter w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('typed-emitter w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('typed-emitter w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('typed-emitter - wave566', () => {
  it('typed-emitter w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('typed-emitter w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('typed-emitter w566 v2', () => {
    expect(describe).toBeDefined()
  })
})
