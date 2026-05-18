import { describe, it, expect } from 'vitest'
import { EventBusV2 } from '../src/core/event-bus-v2/event-bus-v2.js'
import { EventStore } from '../src/core/event-bus-v2/event-store.js'
import { DEFAULT_EVENT_BUS_CONFIG } from '../src/core/event-bus-v2/types.js'
import type { Event, Subscription, EventBusConfig } from '../src/core/event-bus-v2/types.js'

// ─── EventStore ────────────────────────────────────────────────────
describe('EventStore', () => {
  it('add and getAll', () => {
    const store = new EventStore()
    const evt: Event = { type: 'test', data: 'hello', timestamp: 1, canceled: false }
    store.add(evt)
    expect(store.getAll()).toHaveLength(1)
    expect(store.size()).toBe(1)
  })

  it('getByType filters events', () => {
    const store = new EventStore()
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    store.add({ type: 'b', data: 2, timestamp: 2, canceled: false })
    store.add({ type: 'a', data: 3, timestamp: 3, canceled: false })
    expect(store.getByType('a')).toHaveLength(2)
  })

  it('getByCorrelationId filters events', () => {
    const store = new EventStore()
    store.add({ type: 'x', data: 1, timestamp: 1, correlationId: 'c1', canceled: false })
    store.add({ type: 'x', data: 2, timestamp: 2, correlationId: 'c2', canceled: false })
    store.add({ type: 'x', data: 3, timestamp: 3, correlationId: 'c1', canceled: false })
    expect(store.getByCorrelationId('c1')).toHaveLength(2)
  })

  it('clear removes all events', () => {
    const store = new EventStore()
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    store.clear()
    expect(store.size()).toBe(0)
  })

  it('prune removes oldest events', () => {
    const store = new EventStore()
    for (let i = 0; i < 10; i++) {
      store.add({ type: 'a', data: i, timestamp: i, canceled: false })
    }
    const removed = store.prune(5)
    expect(removed).toBe(5)
    expect(store.size()).toBe(5)
    expect(store.getAll()[0]!.data).toBe(5)
  })

  it('prune with 0 removes all', () => {
    const store = new EventStore()
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    expect(store.prune(0)).toBe(1)
    expect(store.size()).toBe(0)
  })

  it('prune returns 0 when under max', () => {
    const store = new EventStore()
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    expect(store.prune(10)).toBe(0)
  })

  it('getAll returns a copy', () => {
    const store = new EventStore()
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    const all = store.getAll()
    all.push({ type: 'b', data: 2, timestamp: 2, canceled: false })
    expect(store.size()).toBe(1)
  })
})

// ─── DEFAULT_EVENT_BUS_CONFIG ──────────────────────────────────────
describe('DEFAULT_EVENT_BUS_CONFIG', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_EVENT_BUS_CONFIG).toEqual({
      maxListeners: 100,
      maxHistorySize: 1000,
      wildcardDelimiter: '.',
      enableHistory: true,
      errorHandling: 'log',
    })
  })
})

// ─── EventBusV2 constructor ────────────────────────────────────────
describe('EventBusV2 constructor', () => {
  it('uses defaults', () => {
    const bus = new EventBusV2()
    expect(bus.getConfig()).toMatchObject({
      maxListeners: 100,
      enableHistory: true,
    })
  })

  it('accepts partial config', () => {
    const bus = new EventBusV2({ enableHistory: false, maxHistorySize: 50 })
    const cfg = bus.getConfig()
    expect(cfg.enableHistory).toBe(false)
    expect(cfg.maxHistorySize).toBe(50)
    expect(cfg.maxListeners).toBe(100)
  })
})

// ─── on / off ──────────────────────────────────────────────────────
describe('on / off', () => {
  it('on returns subscription id', () => {
    const bus = new EventBusV2()
    const id = bus.on('test', () => {})
    expect(typeof id).toBe('string')
    expect(id).toMatch(/^sub_\d+_\d+$/)
  })

  it('off removes subscription', () => {
    const bus = new EventBusV2()
    const id = bus.on('test', () => {})
    expect(bus.off(id)).toBe(true)
    expect(bus.getSubscriptions()).toHaveLength(0)
  })

  it('off returns false for unknown id', () => {
    const bus = new EventBusV2()
    expect(bus.off('unknown')).toBe(false)
  })

  it('offByType removes all of type', () => {
    const bus = new EventBusV2()
    bus.on('a', () => {})
    bus.on('a', () => {})
    bus.on('b', () => {})
    expect(bus.offByType('a')).toBe(2)
    expect(bus.getSubscriptions()).toHaveLength(1)
  })
})

// ─── once ──────────────────────────────────────────────────────────
describe('once', () => {
  it('fires listener once then removes', () => {
    const bus = new EventBusV2()
    let count = 0
    bus.once('ping', () => { count++ })
    bus.emit('ping', null)
    bus.emit('ping', null)
    expect(count).toBe(1)
    expect(bus.getSubscriptions()).toHaveLength(0)
  })
})

// ─── emit ──────────────────────────────────────────────────────────
describe('emit', () => {
  it('delivers event to listener', () => {
    const bus = new EventBusV2()
    let received: Event | undefined
    bus.on('msg', (e) => { received = e })
    bus.emit('msg', { text: 'hello' })
    expect(received).toBeDefined()
    expect(received!.data).toEqual({ text: 'hello' })
    expect(received!.type).toBe('msg')
    expect(received!.canceled).toBe(false)
  })

  it('sets timestamp', () => {
    const bus = new EventBusV2()
    let received: Event | undefined
    bus.on('t', (e) => { received = e })
    bus.emit('t', 1)
    expect(typeof received!.timestamp).toBe('number')
    expect(received!.timestamp).toBeGreaterThan(0)
  })

  it('sets source and correlationId', () => {
    const bus = new EventBusV2()
    let received: Event | undefined
    bus.on('e', (e) => { received = e })
    bus.emit('e', 1, { source: 'test', correlationId: 'c1' })
    expect(received!.source).toBe('test')
    expect(received!.correlationId).toBe('c1')
  })

  it('delivers to multiple listeners in priority order', () => {
    const bus = new EventBusV2()
    const order: number[] = []
    bus.on('e', () => { order.push(1) }, { priority: 1 })
    bus.on('e', () => { order.push(3) }, { priority: 3 })
    bus.on('e', () => { order.push(2) }, { priority: 2 })
    bus.emit('e', null)
    expect(order).toEqual([3, 2, 1])
  })

  it('stores in history when enabled', () => {
    const bus = new EventBusV2({ enableHistory: true })
    bus.emit('a', 1)
    bus.emit('b', 2)
    expect(bus.getHistory()).toHaveLength(2)
    expect(bus.getHistory('a')).toHaveLength(1)
  })

  it('does not store history when disabled', () => {
    const bus = new EventBusV2({ enableHistory: false })
    bus.emit('a', 1)
    expect(bus.getHistory()).toHaveLength(0)
  })

  it('cancels event stops dispatch', () => {
    const bus = new EventBusV2()
    let secondCalled = false
    bus.on('e', (e) => { e.canceled = true }, { priority: 10 })
    bus.on('e', () => { secondCalled = true }, { priority: 1 })
    bus.emit('e', null)
    expect(secondCalled).toBe(false)
  })

  it('handles errors with log strategy', () => {
    const bus = new EventBusV2({ errorHandling: 'log' })
    bus.on('e', () => { throw new Error('boom') })
    bus.emit('e', null)
    expect(bus.getStats().errors).toBe(1)
  })

  it('handles errors with ignore strategy', () => {
    const bus = new EventBusV2({ errorHandling: 'ignore' })
    bus.on('e', () => { throw new Error('boom') })
    bus.emit('e', null)
    expect(bus.getStats().errors).toBe(1)
  })

  it('throws on error with throw strategy', () => {
    const bus = new EventBusV2({ errorHandling: 'throw' })
    bus.on('e', () => { throw new Error('boom') })
    expect(() => bus.emit('e', null)).toThrow('boom')
  })
})

// ─── emitAsync ─────────────────────────────────────────────────────
describe('emitAsync', () => {
  it('delivers event asynchronously', async () => {
    const bus = new EventBusV2()
    let received = false
    bus.on('e', async () => { received = true })
    await bus.emitAsync('e', null)
    expect(received).toBe(true)
  })

  it('awaits all listeners', async () => {
    const bus = new EventBusV2()
    const order: number[] = []
    bus.on('e', async () => { order.push(1) })
    bus.on('e', async () => { order.push(2) })
    await bus.emitAsync('e', null)
    expect(order).toHaveLength(2)
  })
})

// ─── wildcard matching ─────────────────────────────────────────────
describe('wildcard matching', () => {
  it('matches exact type', () => {
    const bus = new EventBusV2()
    let called = false
    bus.on('user.created', () => { called = true })
    bus.emit('user.created', null)
    expect(called).toBe(true)
  })

  it('does not match wrong type', () => {
    const bus = new EventBusV2()
    let called = false
    bus.on('user.created', () => { called = true })
    bus.emit('user.deleted', null)
    expect(called).toBe(false)
  })

  it('matches * wildcard for all events', () => {
    const bus = new EventBusV2()
    let count = 0
    bus.on('*', () => { count++ })
    bus.emit('anything', null)
    bus.emit('other', null)
    expect(count).toBe(2)
  })

  it('matches partial wildcard user.*', () => {
    const bus = new EventBusV2()
    let count = 0
    bus.on('user.*', () => { count++ })
    bus.emit('user.created', null)
    bus.emit('user.deleted', null)
    bus.emit('order.created', null)
    expect(count).toBe(2)
  })

  it('matchPattern rejects different segment counts', () => {
    const bus = new EventBusV2()
    expect(bus.matchPattern('a.*', 'a.b.c')).toBe(false)
  })

  it('matchPattern rejects non-matching segments', () => {
    const bus = new EventBusV2()
    expect(bus.matchPattern('a.b', 'a.c')).toBe(false)
  })
})

// ─── middleware ────────────────────────────────────────────────────
describe('middleware', () => {
  it('use adds middleware', () => {
    const bus = new EventBusV2()
    let called = false
    bus.use((_event, next) => { called = true; next() })
    bus.on('e', () => {})
    bus.emit('e', null)
    expect(called).toBe(true)
  })

  it('middleware runs before listeners', () => {
    const bus = new EventBusV2()
    const order: string[] = []
    bus.use((_event, next) => { order.push('mw'); next() })
    bus.on('e', () => { order.push('listener') })
    bus.emit('e', null)
    expect(order).toEqual(['mw', 'listener'])
  })

  it('middleware can modify event', () => {
    const bus = new EventBusV2()
    let received: Event | undefined
    bus.use((event, next) => { (event as Event<string>).data = 'modified'; next() })
    bus.on('e', (e) => { received = e })
    bus.emit('e', 'original')
    expect(received!.data).toBe('modified')
  })

  it('multiple middleware chain', () => {
    const bus = new EventBusV2()
    const order: string[] = []
    bus.use((_e, next) => { order.push('1'); next() })
    bus.use((_e, next) => { order.push('2'); next() })
    bus.on('e', () => { order.push('handler') })
    bus.emit('e', null)
    expect(order).toEqual(['1', '2', 'handler'])
  })
})

// ─── getSubscriptions ──────────────────────────────────────────────
describe('getSubscriptions', () => {
  it('returns all subscriptions', () => {
    const bus = new EventBusV2()
    bus.on('a', () => {})
    bus.on('b', () => {})
    expect(bus.getSubscriptions()).toHaveLength(2)
  })

  it('filters by type', () => {
    const bus = new EventBusV2()
    bus.on('a', () => {})
    bus.on('a', () => {})
    bus.on('b', () => {})
    expect(bus.getSubscriptions('a')).toHaveLength(2)
  })
})

// ─── getStats ──────────────────────────────────────────────────────
describe('getStats', () => {
  it('tracks total events', () => {
    const bus = new EventBusV2()
    bus.on('e', () => {})
    bus.emit('e', null)
    bus.emit('e', null)
    expect(bus.getStats().totalEvents).toBe(2)
  })

  it('tracks events by type', () => {
    const bus = new EventBusV2()
    bus.emit('a', null)
    bus.emit('b', null)
    bus.emit('a', null)
    expect(bus.getStats().eventsByType).toEqual({ a: 2, b: 1 })
  })

  it('tracks total listeners', () => {
    const bus = new EventBusV2()
    bus.on('a', () => {})
    bus.on('b', () => {})
    expect(bus.getStats().totalListeners).toBe(2)
  })

  it('tracks errors', () => {
    const bus = new EventBusV2({ errorHandling: 'log' })
    bus.on('e', () => { throw new Error('x') })
    bus.emit('e', null)
    expect(bus.getStats().errors).toBe(1)
  })
})

// ─── hasListeners / listenerCount ──────────────────────────────────
describe('hasListeners / listenerCount', () => {
  it('hasListeners returns true when listeners exist', () => {
    const bus = new EventBusV2()
    bus.on('e', () => {})
    expect(bus.hasListeners('e')).toBe(true)
  })

  it('hasListeners returns false when no listeners', () => {
    const bus = new EventBusV2()
    expect(bus.hasListeners('e')).toBe(false)
  })

  it('listenerCount returns correct count', () => {
    const bus = new EventBusV2()
    bus.on('e', () => {})
    bus.on('e', () => {})
    bus.on('f', () => {})
    expect(bus.listenerCount('e')).toBe(2)
    expect(bus.listenerCount('f')).toBe(1)
  })

  it('listenerCount with wildcard', () => {
    const bus = new EventBusV2()
    bus.on('user.*', () => {})
    expect(bus.listenerCount('user.created')).toBe(1)
  })
})

// ─── clear ─────────────────────────────────────────────────────────
describe('clear', () => {
  it('resets everything', () => {
    const bus = new EventBusV2()
    bus.on('e', () => {})
    bus.use((_e, next) => next())
    bus.emit('e', null)
    bus.clear()
    expect(bus.getSubscriptions()).toHaveLength(0)
    expect(bus.getHistory()).toHaveLength(0)
    expect(bus.getStats().totalEvents).toBe(0)
  })
})

// ─── history pruning ───────────────────────────────────────────────
describe('history pruning', () => {
  it('prunes when exceeding maxHistorySize', () => {
    const bus = new EventBusV2({ maxHistorySize: 3, enableHistory: true })
    bus.emit('a', 1)
    bus.emit('b', 2)
    bus.emit('c', 3)
    bus.emit('d', 4)
    const history = bus.getHistory()
    expect(history.length).toBeLessThanOrEqual(3)
  })
})
