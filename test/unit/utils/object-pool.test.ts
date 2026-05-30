import { describe, it, expect, vi } from 'vitest'
import { ObjectPool } from '../../../src/utils/object-pool.js'

describe('ObjectPool', () => {
  it('should throw when maxSize < 1', () => {
    const factory = vi.fn(() => ({}))
    const reset = vi.fn()
    expect(() => new ObjectPool({ factory, reset, maxSize: 0 })).toThrow(RangeError)
  })

  it('should throw when maxSize is negative', () => {
    const factory = vi.fn(() => ({}))
    const reset = vi.fn()
    expect(() => new ObjectPool({ factory, reset, maxSize: -5 })).toThrow(RangeError)
  })

  it('should create new objects via factory when pool empty', () => {
    const factory = vi.fn(() => ({ id: 1 }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 2 })
    const obj = pool.acquire()
    expect(factory).toHaveBeenCalledTimes(1)
    expect(obj).toEqual({ id: 1 })
  })

  it('should reuse released objects from pool', () => {
    const factory = vi.fn(() => ({ id: Math.random() }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 2 })
    const obj1 = pool.acquire()
    pool.release(obj1)
    const obj2 = pool.acquire()
    expect(factory).toHaveBeenCalledTimes(1)
    expect(obj2).toBe(obj1)
  })

  it('should reset objects via resetFn on release', () => {
    const factory = vi.fn(() => ({ count: 0 }))
    const reset = vi.fn((obj) => { obj.count = 0 })
    const pool = new ObjectPool({ factory, reset, maxSize: 2 })
    const obj = pool.acquire()
    obj.count = 5
    pool.release(obj)
    expect(reset).toHaveBeenCalledWith(obj)
    expect(obj.count).toBe(0)
  })

  it('should add objects to pool on release when under maxSize', () => {
    const factory = vi.fn(() => ({ id: 1 }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 2 })
    const obj = pool.acquire()
    pool.release(obj)
    expect(pool.size).toBe(1)
  })

  it('should discard objects when pool is at maxSize', () => {
    const factory = vi.fn(() => ({ id: Math.random() }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 2 })
    const obj1 = pool.acquire()
    const obj2 = pool.acquire()
    pool.release(obj1)
    pool.release(obj2)
    pool.release({ id: 999 })
    expect(pool.size).toBe(2)
  })

  it('should track created count correctly', () => {
    const factory = vi.fn(() => ({ id: 1 }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 3 })
    pool.acquire()
    pool.acquire()
    pool.acquire()
    const stats = pool.getStats()
    expect(stats.created).toBe(3)
  })

  it('should track reused count correctly', () => {
    const factory = vi.fn(() => ({ id: 1 }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 3 })
    const obj1 = pool.acquire()
    pool.release(obj1)
    pool.acquire()
    const stats = pool.getStats()
    expect(stats.reused).toBe(1)
  })

  it('should track returned count correctly', () => {
    const factory = vi.fn(() => ({ id: 1 }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 3 })
    const obj1 = pool.acquire()
    const obj2 = pool.acquire()
    pool.release(obj1)
    pool.release(obj2)
    const stats = pool.getStats()
    expect(stats.returned).toBe(2)
  })

  it('should track available count correctly', () => {
    const factory = vi.fn(() => ({ id: 1 }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 3 })
    const obj1 = pool.acquire()
    const obj2 = pool.acquire()
    pool.release(obj1)
    pool.release(obj2)
    const stats = pool.getStats()
    expect(stats.available).toBe(2)
  })

  it('should return current pool depth from size getter', () => {
    const factory = vi.fn(() => ({ id: Math.random() }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 3 })
    expect(pool.size).toBe(0)
    const obj1 = pool.acquire()
    const obj2 = pool.acquire()
    pool.release(obj1)
    expect(pool.size).toBe(1)
    pool.release(obj2)
    expect(pool.size).toBe(2)
  })

  it('should drain pool and return all objects', () => {
    const factory = vi.fn(() => ({ id: Math.random() }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 3 })
    const obj1 = pool.acquire()
    const obj2 = pool.acquire()
    pool.release(obj1)
    pool.release(obj2)
    const drained = pool.drain()
    expect(drained).toHaveLength(2)
    expect(drained).toContain(obj1)
    expect(drained).toContain(obj2)
    expect(pool.size).toBe(0)
  })

  it('should drain empty pool and return empty array', () => {
    const factory = vi.fn(() => ({ id: 1 }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 3 })
    const drained = pool.drain()
    expect(drained).toEqual([])
    expect(pool.size).toBe(0)
  })

  it('should handle multiple acquire/release cycles correctly', () => {
    const factory = vi.fn(() => ({ count: 0 }))
    const reset = vi.fn((obj) => { obj.count = 0 })
    const pool = new ObjectPool({ factory, reset, maxSize: 5 })

    const obj1 = pool.acquire()
    const obj2 = pool.acquire()
    const obj3 = pool.acquire()
    expect(factory).toHaveBeenCalledTimes(3)

    pool.release(obj1)
    pool.release(obj2)
    expect(reset).toHaveBeenCalledTimes(2)
    expect(pool.size).toBe(2)

    const obj4 = pool.acquire()
    const obj5 = pool.acquire()
    expect(factory).toHaveBeenCalledTimes(3)
    expect(obj4).toBe(obj2)
    expect(obj5).toBe(obj1)
    expect(pool.size).toBe(0)

    pool.release(obj3)
    pool.release(obj4)
    pool.release(obj5)
    expect(reset).toHaveBeenCalledTimes(5)
    expect(pool.size).toBe(3)
  })

  it('should call reset function exactly once per release', () => {
    const factory = vi.fn(() => ({ value: 0 }))
    const reset = vi.fn((obj) => { obj.value = 0 })
    const pool = new ObjectPool({ factory, reset, maxSize: 3 })
    const obj = pool.acquire()
    pool.release(obj)
    pool.release(obj)
    expect(reset).toHaveBeenCalledTimes(2)
  })

  it('should create new object after draining and releasing', () => {
    const factory = vi.fn(() => ({ id: Math.random() }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 2 })
    const obj1 = pool.acquire()
    pool.release(obj1)
    pool.drain()
    const obj2 = pool.acquire()
    expect(factory).toHaveBeenCalledTimes(2)
    expect(obj2).not.toBe(obj1)
  })

  it('should get all stats correctly after mixed operations', () => {
    const factory = vi.fn(() => ({ id: 1 }))
    const reset = vi.fn()
    const pool = new ObjectPool({ factory, reset, maxSize: 5 })

    const obj1 = pool.acquire()
    const obj2 = pool.acquire()
    const obj3 = pool.acquire()

    pool.release(obj1)
    pool.release(obj2)

    const obj4 = pool.acquire()
    const obj5 = pool.acquire()

    const stats = pool.getStats()
    expect(stats.created).toBe(3)
    expect(stats.reused).toBe(2)
    expect(stats.returned).toBe(2)
    expect(stats.available).toBe(0)
  })
})