import { describe, expect, it } from 'vitest'
import { EventStore } from '../../../src/core/event-bus-v2/event-store.js'
import type { Event } from '../../../src/core/event-bus-v2/types.js'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    type: 'test',
    data: null,
    timestamp: Date.now(),
    canceled: false,
    ...overrides,
  }
}

// ─── add() & getByType() ───

describe('EventStore add & getByType', () => {
  it('stores and retrieves events by type', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'user.created' }))
    store.add(makeEvent({ type: 'user.created' }))
    store.add(makeEvent({ type: 'user.deleted' }))

    const created = store.getByType('user.created')
    expect(created).toHaveLength(2)
    expect(created[0].type).toBe('user.created')
    expect(created[1].type).toBe('user.created')
  })

  it('returns empty array for unknown type', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'a' }))
    expect(store.getByType('b')).toEqual([])
  })

  it('preserves event data', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'order', data: { id: 42, total: 99.99 } }))
    const events = store.getByType('order')
    expect(events[0].data).toEqual({ id: 42, total: 99.99 })
  })

  it('preserves optional fields', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'log', source: 'auth-service', correlationId: 'corr-1' }))
    const events = store.getByType('log')
    expect(events[0].source).toBe('auth-service')
    expect(events[0].correlationId).toBe('corr-1')
  })
})

// ─── getAll() ───

describe('EventStore getAll', () => {
  it('returns all events', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'a' }))
    store.add(makeEvent({ type: 'b' }))
    store.add(makeEvent({ type: 'c' }))
    expect(store.getAll()).toHaveLength(3)
  })

  it('returns a copy, not a reference', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'a' }))
    const all = store.getAll()
    all.push(makeEvent({ type: 'injected' }))
    expect(store.getAll()).toHaveLength(1)
  })

  it('returns empty array for empty store', () => {
    const store = new EventStore()
    expect(store.getAll()).toEqual([])
  })
})

// ─── getByCorrelationId() ───

describe('EventStore getByCorrelationId', () => {
  it('finds events by correlation ID', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'a', correlationId: 'flow-1' }))
    store.add(makeEvent({ type: 'b', correlationId: 'flow-1' }))
    store.add(makeEvent({ type: 'c', correlationId: 'flow-2' }))

    const flow1 = store.getByCorrelationId('flow-1')
    expect(flow1).toHaveLength(2)
  })

  it('returns empty array for unknown correlation ID', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'a', correlationId: 'flow-1' }))
    expect(store.getByCorrelationId('flow-999')).toEqual([])
  })

  it('finds events where correlationId is undefined', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'a' }))
    store.add(makeEvent({ type: 'b', correlationId: 'corr-1' }))
    const results = store.getByCorrelationId(undefined as unknown as string)
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe('a')
  })
})

// ─── clear() ───

describe('EventStore clear', () => {
  it('removes all events', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'a' }))
    store.add(makeEvent({ type: 'b' }))
    store.clear()
    expect(store.getAll()).toEqual([])
    expect(store.size()).toBe(0)
  })

  it('allows adding events after clear', () => {
    const store = new EventStore()
    store.add(makeEvent({ type: 'a' }))
    store.clear()
    store.add(makeEvent({ type: 'b' }))
    expect(store.size()).toBe(1)
    expect(store.getByType('b')).toHaveLength(1)
  })
})

// ─── size() ───

describe('EventStore size', () => {
  it('starts at zero', () => {
    const store = new EventStore()
    expect(store.size()).toBe(0)
  })

  it('increments with each add', () => {
    const store = new EventStore()
    store.add(makeEvent())
    store.add(makeEvent())
    store.add(makeEvent())
    expect(store.size()).toBe(3)
  })

  it('decrements after clear', () => {
    const store = new EventStore()
    store.add(makeEvent())
    store.add(makeEvent())
    store.clear()
    expect(store.size()).toBe(0)
  })
})

// ─── prune() ───

describe('EventStore prune', () => {
  it('removes oldest events keeping maxSize entries', () => {
    const store = new EventStore()
    for (let i = 0; i < 10; i++) {
      store.add(makeEvent({ type: `event-${i}`, timestamp: i }))
    }
    store.prune(5)
    expect(store.size()).toBe(5)
    // Should keep the newest 5 (indices 5-9)
    const all = store.getAll()
    expect(all[0].type).toBe('event-5')
    expect(all[4].type).toBe('event-9')
  })

  it('returns the number of removed events', () => {
    const store = new EventStore()
    for (let i = 0; i < 8; i++) {
      store.add(makeEvent())
    }
    expect(store.prune(3)).toBe(5)
  })

  it('returns 0 when size is at or below maxSize', () => {
    const store = new EventStore()
    store.add(makeEvent())
    store.add(makeEvent())
    expect(store.prune(5)).toBe(0)
    expect(store.size()).toBe(2)
  })

  it('removes all events when maxSize is 0', () => {
    const store = new EventStore()
    store.add(makeEvent())
    store.add(makeEvent())
    store.add(makeEvent())
    expect(store.prune(0)).toBe(3)
    expect(store.size()).toBe(0)
    expect(store.getAll()).toEqual([])
  })

  it('returns 0 for empty store', () => {
    const store = new EventStore()
    expect(store.prune(5)).toBe(0)
  })
})
