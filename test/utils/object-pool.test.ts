import { describe, expect, it } from 'vitest'

import { ObjectPool } from '../../src/utils/object-pool.js'

interface PoolItem {
  value: number
  active: boolean
}

function createPool(maxSize: number = 5): ObjectPool<PoolItem> {
  return new ObjectPool<PoolItem>({
    factory: () => ({ value: 0, active: true }),
    reset: (obj) => {
      obj.value = 0
      obj.active = false
    },
    maxSize,
  })
}

// ─── Constructor validation ─────────────────────────────
describe('ObjectPool - constructor', () => {
  it('creates pool with valid maxSize', () => {
    const pool = createPool(3)
    expect(pool.size).toBe(0)
  })

  it('throws RangeError when maxSize is 0', () => {
    expect(
      () =>
        new ObjectPool<{ x: number }>({
          factory: () => ({ x: 0 }),
          reset: () => {},
          maxSize: 0,
        }),
    ).toThrow(RangeError)
  })

  it('throws RangeError when maxSize is negative', () => {
    expect(
      () =>
        new ObjectPool<{ x: number }>({
          factory: () => ({ x: 0 }),
          reset: () => {},
          maxSize: -1,
        }),
    ).toThrow(RangeError)
  })

  it('RangeError message includes the invalid value', () => {
    expect(
      () =>
        new ObjectPool<{ x: number }>({
          factory: () => ({ x: 0 }),
          reset: () => {},
          maxSize: -5,
        }),
    ).toThrow('maxSize must be >= 1, got -5')
  })

  it('accepts maxSize of 1', () => {
    const pool = createPool(1)
    expect(pool.size).toBe(0)
  })
})

// ─── Acquire ────────────────────────────────────────────
describe('ObjectPool - acquire', () => {
  it('creates a new object when pool is empty', () => {
    const pool = createPool()
    const obj = pool.acquire()
    expect(obj).toEqual({ value: 0, active: true })
  })

  it('increments created count on factory creation', () => {
    const pool = createPool()
    pool.acquire()
    pool.acquire()
    expect(pool.getStats().created).toBe(2)
  })

  it('reuses released objects', () => {
    const pool = createPool()
    const obj = pool.acquire()
    obj.value = 42
    pool.release(obj)
    const reused = pool.acquire()
    expect(reused).toBe(obj)
    expect(reused.active).toBe(false)
    expect(reused.value).toBe(0)
  })

  it('increments reused count when reusing', () => {
    const pool = createPool()
    const obj = pool.acquire()
    pool.release(obj)
    pool.acquire()
    expect(pool.getStats().reused).toBe(1)
  })

  it('acquire returns different objects when pool is empty', () => {
    const pool = createPool()
    const a = pool.acquire()
    const b = pool.acquire()
    expect(a).not.toBe(b)
  })
})

// ─── Release ────────────────────────────────────────────
describe('ObjectPool - release', () => {
  it('returns object to pool after release', () => {
    const pool = createPool()
    const obj = pool.acquire()
    pool.release(obj)
    expect(pool.size).toBe(1)
  })

  it('calls reset function on release', () => {
    const pool = createPool()
    const obj = pool.acquire()
    obj.value = 99
    obj.active = true
    pool.release(obj)
    expect(obj.value).toBe(0)
    expect(obj.active).toBe(false)
  })

  it('increments returned count', () => {
    const pool = createPool()
    const obj = pool.acquire()
    pool.release(obj)
    expect(pool.getStats().returned).toBe(1)
  })

  it('does not exceed maxSize on release', () => {
    const pool = createPool(2)
    const a = pool.acquire()
    const b = pool.acquire()
    const c = pool.acquire()
    pool.release(a)
    pool.release(b)
    pool.release(c)
    expect(pool.size).toBe(2)
  })

  it('releasing when pool is at maxSize silently discards', () => {
    const pool = createPool(1)
    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    pool.release(b)
    expect(pool.size).toBe(1)
  })
})

// ─── Size ───────────────────────────────────────────────
describe('ObjectPool - size', () => {
  it('size is 0 initially', () => {
    const pool = createPool()
    expect(pool.size).toBe(0)
  })

  it('size increases on release', () => {
    const pool = createPool()
    const obj = pool.acquire()
    pool.release(obj)
    expect(pool.size).toBe(1)
  })

  it('size decreases on acquire from pool', () => {
    const pool = createPool()
    const obj = pool.acquire()
    pool.release(obj)
    expect(pool.size).toBe(1)
    pool.acquire()
    expect(pool.size).toBe(0)
  })

  it('size stays 0 when acquiring from empty pool', () => {
    const pool = createPool()
    pool.acquire()
    expect(pool.size).toBe(0)
  })
})

// ─── GetStats ───────────────────────────────────────────
describe('ObjectPool - getStats', () => {
  it('returns initial stats', () => {
    const pool = createPool()
    expect(pool.getStats()).toEqual({
      available: 0,
      created: 0,
      reused: 0,
      returned: 0,
    })
  })

  it('tracks full lifecycle in stats', () => {
    const pool = createPool(3)
    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    pool.release(b)
    const c = pool.acquire()
    const stats = pool.getStats()
    expect(stats.created).toBe(2)
    expect(stats.reused).toBe(1)
    expect(stats.returned).toBe(2)
    expect(stats.available).toBe(1)
    void c
  })
})

// ─── Drain ──────────────────────────────────────────────
describe('ObjectPool - drain', () => {
  it('returns all pooled objects', () => {
    const pool = createPool(5)
    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    pool.release(b)
    const items = pool.drain()
    expect(items).toHaveLength(2)
  })

  it('empties the pool after drain', () => {
    const pool = createPool(5)
    pool.release(pool.acquire())
    pool.release(pool.acquire())
    pool.drain()
    expect(pool.size).toBe(0)
  })

  it('returns empty array when pool is empty', () => {
    const pool = createPool()
    expect(pool.drain()).toEqual([])
  })

  it('drain does not affect stats counters', () => {
    const pool = createPool()
    pool.release(pool.acquire())
    pool.drain()
    const stats = pool.getStats()
    expect(stats.created).toBe(1)
    expect(stats.returned).toBe(1)
  })
})

// ─── Reuse cycle ────────────────────────────────────────
describe('ObjectPool - reuse cycle', () => {
  it('object can be acquired, released, and re-acquired multiple times', () => {
    const pool = createPool(1)
    const obj = pool.acquire()
    expect(pool.getStats().created).toBe(1)
    pool.release(obj)
    const same = pool.acquire()
    expect(same).toBe(obj)
    pool.release(same)
    const again = pool.acquire()
    expect(again).toBe(obj)
    expect(pool.getStats().reused).toBe(2)
    expect(pool.getStats().created).toBe(1)
  })

  it('pool reuses most recently released object (LIFO)', () => {
    const pool = createPool(5)
    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    pool.release(b)
    const first = pool.acquire()
    expect(first).toBe(b)
    const second = pool.acquire()
    expect(second).toBe(a)
  })
})

// ─── Generic types ──────────────────────────────────────
describe('ObjectPool - generic types', () => {
  it('works with arrays', () => {
    const pool = new ObjectPool<number[]>({
      factory: () => [],
      reset: (arr) => {
        arr.length = 0
      },
      maxSize: 3,
    })
    const arr = pool.acquire()
    arr.push(1, 2, 3)
    pool.release(arr)
    expect(arr).toEqual([])
    const reused = pool.acquire()
    expect(reused).toBe(arr)
  })

  it('works with Map', () => {
    const pool = new ObjectPool<Map<string, number>>({
      factory: () => new Map(),
      reset: (m) => m.clear(),
      maxSize: 2,
    })
    const m = pool.acquire()
    m.set('key', 1)
    pool.release(m)
    expect(m.size).toBe(0)
  })
})
