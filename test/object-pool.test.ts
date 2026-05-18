import { beforeEach, describe, expect, it } from 'vitest'

import { ObjectPool, type ObjectPoolOptions } from '../src/utils/object-pool.js'

// ─── constructor ───────────────────────────────────────
describe('ObjectPool constructor', () => {
  it('creates pool with options', () => {
    const pool = new ObjectPool<{ value: number }>({
      factory: () => ({ value: 0 }),
      reset: (obj) => { obj.value = 0 },
      maxSize: 5,
    })
    expect(pool.size).toBe(0)
  })

  it('throws on maxSize < 1', () => {
    expect(() => new ObjectPool({
      factory: () => ({}),
      reset: () => {},
      maxSize: 0,
    })).toThrow(RangeError)
  })
})

// ─── acquire/release ──────────────────────────────────
describe('ObjectPool acquire/release', () => {
  let pool: ObjectPool<{ value: number }>

  beforeEach(() => {
    let counter = 0
    pool = new ObjectPool({
      factory: () => ({ value: ++counter }),
      reset: (obj) => { obj.value = 0 },
      maxSize: 3,
    })
  })

  it('creates new objects when pool is empty', () => {
    const obj = pool.acquire()
    expect(obj.value).toBe(1)
  })

  it('reuses released objects', () => {
    const obj = pool.acquire()
    pool.release(obj)
    const reused = pool.acquire()
    expect(reused).toBe(obj)
    expect(reused.value).toBe(0)
  })

  it('does not exceed maxSize on release', () => {
    const objs = [pool.acquire(), pool.acquire(), pool.acquire(), pool.acquire()]
    for (const o of objs) pool.release(o)
    expect(pool.size).toBe(3)
  })
})

// ─── getStats ─────────────────────────────────────────
describe('ObjectPool getStats', () => {
  it('tracks created and reused', () => {
    const pool = new ObjectPool<{ v: number }>({
      factory: () => ({ v: 0 }),
      reset: (o) => { o.v = 0 },
      maxSize: 5,
    })

    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    const c = pool.acquire()

    const stats = pool.getStats()
    expect(stats.created).toBe(2)
    expect(stats.reused).toBe(1)
    expect(stats.returned).toBe(1)
  })
})

// ─── drain ────────────────────────────────────────────
describe('ObjectPool drain', () => {
  it('empties the pool', () => {
    const pool = new ObjectPool<{ x: number }>({
      factory: () => ({ x: 1 }),
      reset: () => {},
      maxSize: 10,
    })
    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    pool.release(b)

    const items = pool.drain()
    expect(items.length).toBe(2)
    expect(pool.size).toBe(0)
  })
})
