import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventStore } from '../../src/core/event-bus-v2/event-store.js'
import { EventBusV2 } from '../../src/core/event-bus-v2/event-bus-v2.js'
import type { Event, EventBusConfig } from '../../src/core/event-bus-v2/types.js'
import { DEFAULT_EVENT_BUS_CONFIG } from '../../src/core/event-bus-v2/types.js'

describe('EventStore', () => {
  let store: EventStore

  beforeEach(() => {
    store = new EventStore()
  })

  it('should add and retrieve events', () => {
    const event: Event = { type: 'test', data: 'hello', timestamp: 1, canceled: false }
    store.add(event)
    expect(store.size()).toBe(1)
    expect(store.getAll()).toHaveLength(1)
  })

  it('should return empty array for no events', () => {
    expect(store.getAll()).toEqual([])
    expect(store.size()).toBe(0)
  })

  it('should get events by type', () => {
    store.add({ type: 'foo', data: 1, timestamp: 1, canceled: false })
    store.add({ type: 'bar', data: 2, timestamp: 2, canceled: false })
    store.add({ type: 'foo', data: 3, timestamp: 3, canceled: false })
    expect(store.getByType('foo')).toHaveLength(2)
    expect(store.getByType('bar')).toHaveLength(1)
    expect(store.getByType('baz')).toHaveLength(0)
  })

  it('should get events by correlationId', () => {
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false, correlationId: 'c1' })
    store.add({ type: 'b', data: 2, timestamp: 2, canceled: false, correlationId: 'c1' })
    store.add({ type: 'c', data: 3, timestamp: 3, canceled: false, correlationId: 'c2' })
    expect(store.getByCorrelationId('c1')).toHaveLength(2)
    expect(store.getByCorrelationId('c2')).toHaveLength(1)
    expect(store.getByCorrelationId('c3')).toHaveLength(0)
  })

  it('should clear all events', () => {
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    store.add({ type: 'b', data: 2, timestamp: 2, canceled: false })
    store.clear()
    expect(store.size()).toBe(0)
    expect(store.getAll()).toEqual([])
  })

  it('should prune events to maxSize keeping most recent', () => {
    for (let i = 0; i < 10; i++) {
      store.add({ type: `event-${i}`, data: i, timestamp: i, canceled: false })
    }
    const removed = store.prune(5)
    expect(removed).toBe(5)
    expect(store.size()).toBe(5)
    const all = store.getAll()
    expect(all[0]!.data).toBe(5)
    expect(all[4]!.data).toBe(9)
  })

  it('should return 0 removed when size <= maxSize', () => {
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    expect(store.prune(10)).toBe(0)
    expect(store.size()).toBe(1)
  })

  it('should prune to 0', () => {
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    store.add({ type: 'b', data: 2, timestamp: 2, canceled: false })
    expect(store.prune(0)).toBe(2)
    expect(store.size()).toBe(0)
  })

  it('should return a copy from getAll', () => {
    store.add({ type: 'a', data: 1, timestamp: 1, canceled: false })
    const all = store.getAll()
    all.push({ type: 'b', data: 2, timestamp: 2, canceled: false })
    expect(store.size()).toBe(1)
  })
})

describe('EventBusV2 - constructor', () => {
  it('should create with default config', () => {
    const bus = new EventBusV2()
    const config = bus.getConfig()
    expect(config.maxListeners).toBe(DEFAULT_EVENT_BUS_CONFIG.maxListeners)
    expect(config.maxHistorySize).toBe(DEFAULT_EVENT_BUS_CONFIG.maxHistorySize)
    expect(config.wildcardDelimiter).toBe('.')
    expect(config.enableHistory).toBe(true)
    expect(config.errorHandling).toBe('log')
  })

  it('should merge partial config', () => {
    const bus = new EventBusV2({ maxListeners: 50, errorHandling: 'ignore' })
    const config = bus.getConfig()
    expect(config.maxListeners).toBe(50)
    expect(config.errorHandling).toBe('ignore')
    expect(config.maxHistorySize).toBe(DEFAULT_EVENT_BUS_CONFIG.maxHistorySize)
  })

  it('should return a copy of config', () => {
    const bus = new EventBusV2()
    const config = bus.getConfig()
    config.maxListeners = 999
    expect(bus.getConfig().maxListeners).toBe(DEFAULT_EVENT_BUS_CONFIG.maxListeners)
  })
})

describe('EventBusV2 - on/off', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should subscribe and return subscription id', () => {
    const id = bus.on('test', () => {})
    expect(id).toMatch(/^sub_\d+_\d+$/)
  })

  it('should unsubscribe by id', () => {
    const id = bus.on('test', () => {})
    expect(bus.off(id)).toBe(true)
    expect(bus.off(id)).toBe(false)
  })

  it('should return false for non-existent subscription', () => {
    expect(bus.off('nonexistent')).toBe(false)
  })

  it('should unsubscribe all by type', () => {
    bus.on('test', () => {})
    bus.on('test', () => {})
    bus.on('other', () => {})
    expect(bus.offByType('test')).toBe(2)
    expect(bus.offByType('test')).toBe(0)
    expect(bus.getSubscriptions()).toHaveLength(1)
  })

  it('should return 0 for offByType with no matches', () => {
    expect(bus.offByType('nonexistent')).toBe(0)
  })
})

describe('EventBusV2 - emit', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should call listener on emit', () => {
    const listener = vi.fn()
    bus.on('test', listener)
    bus.emit('test', { value: 42 })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'test', data: { value: 42 } }),
    )
  })

  it('should emit event with correct structure', () => {
    let received: Event | undefined
    bus.on('test', (e) => {
      received = e as Event
    })
    bus.emit('test', 'hello')
    expect(received!.type).toBe('test')
    expect(received!.data).toBe('hello')
    expect(typeof received!.timestamp).toBe('number')
    expect(received!.canceled).toBe(false)
  })

  it('should emit with source and correlationId', () => {
    let received: Event | undefined
    bus.on('test', (e) => {
      received = e as Event
    })
    bus.emit('test', 'data', { source: 'module-a', correlationId: 'corr-1' })
    expect(received!.source).toBe('module-a')
    expect(received!.correlationId).toBe('corr-1')
  })

  it('should not call listeners for different event types', () => {
    const listenerA = vi.fn()
    const listenerB = vi.fn()
    bus.on('a', listenerA)
    bus.on('b', listenerB)
    bus.emit('a', 1)
    expect(listenerA).toHaveBeenCalledTimes(1)
    expect(listenerB).toHaveBeenCalledTimes(0)
  })

  it('should call multiple listeners for same event', () => {
    const l1 = vi.fn()
    const l2 = vi.fn()
    bus.on('test', l1)
    bus.on('test', l2)
    bus.emit('test', 1)
    expect(l1).toHaveBeenCalledTimes(1)
    expect(l2).toHaveBeenCalledTimes(1)
  })

  it('should call listeners in priority order (higher first)', () => {
    const order: number[] = []
    bus.on('test', () => { order.push(1) }, { priority: 1 })
    bus.on('test', () => { order.push(5) }, { priority: 5 })
    bus.on('test', () => { order.push(3) }, { priority: 3 })
    bus.emit('test', 1)
    expect(order).toEqual([5, 3, 1])
  })

  it('should call listeners with same priority in subscription order', () => {
    const order: string[] = []
    bus.on('test', () => { order.push('a') })
    bus.on('test', () => { order.push('b') })
    bus.emit('test', 1)
    expect(order).toEqual(['a', 'b'])
  })
})

describe('EventBusV2 - once', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should call listener only once', () => {
    const listener = vi.fn()
    bus.once('test', listener)
    bus.emit('test', 1)
    bus.emit('test', 2)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should remove subscription after once', () => {
    bus.once('test', () => {})
    expect(bus.getSubscriptions()).toHaveLength(1)
    bus.emit('test', 1)
    expect(bus.getSubscriptions()).toHaveLength(0)
  })
})

describe('EventBusV2 - wildcard patterns', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should match file.* pattern', () => {
    const listener = vi.fn()
    bus.on('file.*', listener)
    bus.emit('file.changed', 'data')
    bus.emit('file.saved', 'data')
    bus.emit('file.deleted', 'data')
    expect(listener).toHaveBeenCalledTimes(3)
  })

  it('should not match file.* with different prefix', () => {
    const listener = vi.fn()
    bus.on('file.*', listener)
    bus.emit('dir.changed', 'data')
    expect(listener).toHaveBeenCalledTimes(0)
  })

  it('should match *.* pattern for all two-part events', () => {
    const listener = vi.fn()
    bus.on('*.*', listener)
    bus.emit('file.changed', 'data')
    bus.emit('dir.created', 'data')
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('should match * global wildcard for all events', () => {
    const listener = vi.fn()
    bus.on('*', listener)
    bus.emit('anything', 1)
    bus.emit('something.else', 2)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('should not match wildcard with different segment count', () => {
    const listener = vi.fn()
    bus.on('file.*', listener)
    bus.emit('file', 'data')
    bus.emit('file.dir.changed', 'data')
    expect(listener).toHaveBeenCalledTimes(0)
  })

  it('should match exact type without wildcard', () => {
    const listener = vi.fn()
    bus.on('file.changed', listener)
    bus.emit('file.changed', 'data')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should support wildcard in middle position', () => {
    const listener = vi.fn()
    bus.on('app.*.ready', listener)
    bus.emit('app.server.ready', 'data')
    bus.emit('app.client.ready', 'data')
    bus.emit('app.server.error', 'data')
    expect(listener).toHaveBeenCalledTimes(2)
  })
})

describe('EventBusV2 - matchPattern', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should match exact string', () => {
    expect(bus.matchPattern('foo', 'foo')).toBe(true)
    expect(bus.matchPattern('foo', 'bar')).toBe(false)
  })

  it('should match * wildcard', () => {
    expect(bus.matchPattern('*', 'anything')).toBe(true)
    expect(bus.matchPattern('*', 'a.b.c')).toBe(true)
  })

  it('should match file.* pattern', () => {
    expect(bus.matchPattern('file.*', 'file.changed')).toBe(true)
    expect(bus.matchPattern('file.*', 'file.saved')).toBe(true)
    expect(bus.matchPattern('file.*', 'dir.changed')).toBe(false)
  })

  it('should match multi-segment wildcard', () => {
    expect(bus.matchPattern('app.*.ready', 'app.server.ready')).toBe(true)
    expect(bus.matchPattern('app.*.ready', 'app.server.error')).toBe(false)
  })

  it('should not match when segment counts differ', () => {
    expect(bus.matchPattern('a.*', 'a')).toBe(false)
    expect(bus.matchPattern('a.*', 'a.b.c')).toBe(false)
  })

  it('should match *.events pattern', () => {
    expect(bus.matchPattern('*.events', 'user.events')).toBe(true)
    expect(bus.matchPattern('*.events', 'system.events')).toBe(true)
    expect(bus.matchPattern('*.events', 'user.actions')).toBe(false)
  })
})

describe('EventBusV2 - middleware', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should call middleware before listeners', () => {
    const order: string[] = []
    bus.use((_event, next) => {
      order.push('middleware')
      next()
    })
    bus.on('test', () => { order.push('listener') })
    bus.emit('test', 1)
    expect(order).toEqual(['middleware', 'listener'])
  })

  it('should call multiple middlewares in order', () => {
    const order: string[] = []
    bus.use((_event, next) => { order.push('mw1'); next() })
    bus.use((_event, next) => { order.push('mw2'); next() })
    bus.on('test', () => { order.push('listener') })
    bus.emit('test', 1)
    expect(order).toEqual(['mw1', 'mw2', 'listener'])
  })

  it('should allow middleware to modify event', () => {
    bus.use((event, next) => {
      event.canceled = true
      next()
    })
    const listener = vi.fn()
    bus.on('test', listener)
    bus.emit('test', 1)
    expect(listener).toHaveBeenCalledTimes(0)
  })

  it('should stop propagation if middleware does not call next', () => {
    const order: string[] = []
    bus.use(() => { order.push('mw1') })
    bus.on('test', () => { order.push('listener') })
    bus.emit('test', 1)
    expect(order).toEqual(['mw1'])
  })
})

describe('EventBusV2 - history', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should store events in history', () => {
    bus.emit('test', 1)
    bus.emit('test', 2)
    expect(bus.getHistory()).toHaveLength(2)
  })

  it('should get history by type', () => {
    bus.emit('a', 1)
    bus.emit('b', 2)
    bus.emit('a', 3)
    expect(bus.getHistory('a')).toHaveLength(2)
    expect(bus.getHistory('b')).toHaveLength(1)
  })

  it('should not store history when disabled', () => {
    const disabled = new EventBusV2({ enableHistory: false })
    disabled.emit('test', 1)
    expect(disabled.getHistory()).toHaveLength(0)
  })

  it('should prune history to maxHistorySize', () => {
    const small = new EventBusV2({ maxHistorySize: 3 })
    small.emit('test', 1)
    small.emit('test', 2)
    small.emit('test', 3)
    small.emit('test', 4)
    small.emit('test', 5)
    expect(small.getHistory()).toHaveLength(3)
    const history = small.getHistory()
    expect(history[0]!.data).toBe(3)
    expect(history[2]!.data).toBe(5)
  })
})

describe('EventBusV2 - subscriptions', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should return all subscriptions', () => {
    bus.on('a', () => {})
    bus.on('b', () => {})
    expect(bus.getSubscriptions()).toHaveLength(2)
  })

  it('should return subscriptions by type', () => {
    bus.on('a', () => {})
    bus.on('a', () => {})
    bus.on('b', () => {})
    expect(bus.getSubscriptions('a')).toHaveLength(2)
    expect(bus.getSubscriptions('b')).toHaveLength(1)
  })

  it('should return empty array for no subscriptions', () => {
    expect(bus.getSubscriptions()).toEqual([])
    expect(bus.getSubscriptions('test')).toEqual([])
  })
})

describe('EventBusV2 - stats', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should track total events', () => {
    bus.emit('test', 1)
    bus.emit('test', 2)
    bus.emit('other', 3)
    const stats = bus.getStats()
    expect(stats.totalEvents).toBe(3)
  })

  it('should track events by type', () => {
    bus.emit('a', 1)
    bus.emit('a', 2)
    bus.emit('b', 3)
    const stats = bus.getStats()
    expect(stats.eventsByType['a']).toBe(2)
    expect(stats.eventsByType['b']).toBe(1)
  })

  it('should track total listeners', () => {
    bus.on('test', () => {})
    bus.on('test', () => {})
    expect(bus.getStats().totalListeners).toBe(2)
  })

  it('should track errors with log mode', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    bus.on('test', () => { throw new Error('boom') })
    bus.emit('test', 1)
    expect(bus.getStats().errors).toBe(1)
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('should ignore errors with ignore mode', () => {
    const ignoreBus = new EventBusV2({ errorHandling: 'ignore' })
    ignoreBus.on('test', () => { throw new Error('boom') })
    expect(() => ignoreBus.emit('test', 1)).not.toThrow()
    expect(ignoreBus.getStats().errors).toBe(1)
  })

  it('should throw errors with throw mode', () => {
    const throwBus = new EventBusV2({ errorHandling: 'throw' })
    throwBus.on('test', () => { throw new Error('boom') })
    expect(() => throwBus.emit('test', 1)).toThrow('boom')
  })

  it('should reset stats on clear', () => {
    bus.emit('test', 1)
    bus.on('test', () => {})
    bus.clear()
    const stats = bus.getStats()
    expect(stats.totalEvents).toBe(0)
    expect(stats.totalListeners).toBe(0)
    expect(stats.errors).toBe(0)
    expect(stats.eventsByType).toEqual({})
  })
})

describe('EventBusV2 - hasListeners / listenerCount', () => {
  let bus: EventBusV2

  beforeEach(() => {
    bus = new EventBusV2()
  })

  it('should return true when listeners exist', () => {
    bus.on('test', () => {})
    expect(bus.hasListeners('test')).toBe(true)
  })

  it('should return false when no listeners exist', () => {
    expect(bus.hasListeners('test')).toBe(false)
  })

  it('should return false after all listeners removed', () => {
    const id = bus.on('test', () => {})
    bus.off(id)
    expect(bus.hasListeners('test')).toBe(false)
  })

  it('should count listeners correctly', () => {
    bus.on('test', () => {})
    bus.on('test', () => {})
    bus.on('other', () => {})
    expect(bus.listenerCount('test')).toBe(2)
    expect(bus.listenerCount('other')).toBe(1)
    expect(bus.listenerCount('nonexistent')).toBe(0)
  })

  it('should count wildcard subscriptions as listeners', () => {
    bus.on('file.*', () => {})
    expect(bus.hasListeners('file.changed')).toBe(true)
    expect(bus.listenerCount('file.changed')).toBe(1)
  })
})

describe('EventBusV2 - clear', () => {
  it('should remove all subscriptions, history, and middlewares', () => {
    const bus = new EventBusV2()
    bus.on('test', () => {})
    bus.use((_e, next) => next())
    bus.emit('test', 1)
    bus.clear()
    expect(bus.getSubscriptions()).toHaveLength(0)
    expect(bus.getHistory()).toHaveLength(0)
    expect(bus.getStats().totalEvents).toBe(0)
  })
})

describe('EventBusV2 - emitAsync', () => {
  it('should handle async listeners', async () => {
    const bus = new EventBusV2()
    let resolved = false
    bus.on('test', async () => {
      await new Promise((r) => setTimeout(r, 10))
      resolved = true
    })
    await bus.emitAsync('test', 1)
    expect(resolved).toBe(true)
  })

  it('should handle sync listeners via emitAsync', async () => {
    const bus = new EventBusV2()
    const listener = vi.fn()
    bus.on('test', listener)
    await bus.emitAsync('test', 1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should store history for async emits', async () => {
    const bus = new EventBusV2()
    await bus.emitAsync('test', 1)
    expect(bus.getHistory()).toHaveLength(1)
  })
})

describe('EventBusV2 - edge cases', () => {
  it('should handle emit with no listeners', () => {
    const bus = new EventBusV2()
    expect(() => bus.emit('nonexistent', 1)).not.toThrow()
  })

  it('should handle off after once has fired', () => {
    const bus = new EventBusV2()
    const id = bus.once('test', () => {})
    bus.emit('test', 1)
    expect(bus.off(id)).toBe(false)
  })

  it('should not fire unsubscribed listeners', () => {
    const bus = new EventBusV2()
    const listener = vi.fn()
    const id = bus.on('test', listener)
    bus.off(id)
    bus.emit('test', 1)
    expect(listener).toHaveBeenCalledTimes(0)
  })

  it('should generate unique ids', () => {
    const bus = new EventBusV2()
    const id1 = bus.on('test', () => {})
    const id2 = bus.on('test', () => {})
    expect(id1).not.toBe(id2)
  })

  it('should support wildcard delimiter config', () => {
    const bus = new EventBusV2({ wildcardDelimiter: ':' })
    const listener = vi.fn()
    bus.on('file:*', listener)
    bus.emit('file:changed', 'data')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should handle priority zero as default', () => {
    const bus = new EventBusV2()
    const id = bus.on('test', () => {})
    const subs = bus.getSubscriptions()
    expect(subs[0]!.priority).toBe(0)
  })

  it('should handle events with undefined data', () => {
    const bus = new EventBusV2()
    let received: Event | undefined
    bus.on('test', (e) => { received = e as Event })
    bus.emit('test', undefined)
    expect(received!.data).toBeUndefined()
  })

  it('should handle events with null data', () => {
    const bus = new EventBusV2()
    let received: Event | undefined
    bus.on('test', (e) => { received = e as Event })
    bus.emit('test', null)
    expect(received!.data).toBeNull()
  })

  it('should not call inactive listeners from wildcard match', () => {
    const bus = new EventBusV2()
    const listener = vi.fn()
    const id = bus.on('file.*', listener)
    bus.off(id)
    bus.emit('file.changed', 'data')
    expect(listener).toHaveBeenCalledTimes(0)
  })
})

describe('EventBusV2 - priority ordering with once', () => {
  it('should respect priority with once subscriptions', () => {
    const bus = new EventBusV2()
    const order: string[] = []
    bus.on('test', () => { order.push('low') }, { priority: 1 })
    bus.once('test', () => { order.push('once-high') })
    const onceSub = bus.getSubscriptions()
    const onceIdx = onceSub.findIndex((s) => s.once)
    if (onceIdx >= 0) {
      onceSub[onceIdx]!.priority = 10
    }
    bus.emit('test', 1)
    expect(order[0]).toBe('once-high')
  })
})

describe('EventBusV2 - middleware with cancellation', () => {
  it('should cancel event propagation', () => {
    const bus = new EventBusV2()
    const order: string[] = []
    bus.use((event, next) => {
      order.push('mw1')
      event.canceled = true
      next()
    })
    bus.on('test', () => { order.push('listener1') })
    bus.on('test', () => { order.push('listener2') })
    bus.emit('test', 1)
    expect(order).toEqual(['mw1'])
  })
})

describe('EventBusV2 - multiple offByType calls', () => {
  it('should handle removing types that dont exist', () => {
    const bus = new EventBusV2()
    bus.on('a', () => {})
    expect(bus.offByType('b')).toBe(0)
    expect(bus.getSubscriptions()).toHaveLength(1)
  })
})

describe('EventBusV2 - complex wildcard scenarios', () => {
  it('should handle three-part patterns', () => {
    const bus = new EventBusV2()
    const listener = vi.fn()
    bus.on('app.module.*', listener)
    bus.emit('app.module.init', 1)
    bus.emit('app.module.destroy', 2)
    bus.emit('app.other.init', 3)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('should handle *.*.* matching all three-part events', () => {
    const bus = new EventBusV2()
    const listener = vi.fn()
    bus.on('*.*.*', listener)
    bus.emit('a.b.c', 1)
    bus.emit('x.y.z', 2)
    bus.emit('a.b', 3)
    expect(listener).toHaveBeenCalledTimes(2)
  })
})

describe('EventBusV2 - default config values', () => {
  it('should have correct defaults', () => {
    expect(DEFAULT_EVENT_BUS_CONFIG.maxListeners).toBe(100)
    expect(DEFAULT_EVENT_BUS_CONFIG.maxHistorySize).toBe(1000)
    expect(DEFAULT_EVENT_BUS_CONFIG.wildcardDelimiter).toBe('.')
    expect(DEFAULT_EVENT_BUS_CONFIG.enableHistory).toBe(true)
    expect(DEFAULT_EVENT_BUS_CONFIG.errorHandling).toBe('log')
  })
})
