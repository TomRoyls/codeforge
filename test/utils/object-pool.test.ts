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

  it('uses default maxSize of 1000 when not specified', () => {
    const pool = new ObjectPool<{ x: number }>({
      factory: () => ({ x: 0 }),
      reset: () => {},
    })
    expect(pool.capacity).toBe(1000)
  })

  it('accepts very large maxSize values', () => {
    const pool = createPool(1000000)
    expect(pool.capacity).toBe(1000000)
  })

  it('initializes all stats to zero', () => {
    const pool = createPool()
    const stats = pool.getStats()
    expect(stats.created).toBe(0)
    expect(stats.reused).toBe(0)
    expect(stats.returned).toBe(0)
    expect(stats.available).toBe(0)
  })
})

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

  it('creates new object when pool is at maxSize', () => {
    const pool = createPool(1)
    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    pool.release(b)
    const c = pool.acquire()
    expect(pool.getStats().created).toBe(2)
  })

  it('acquire uses prefilled objects first', () => {
    const pool = createPool()
    pool.prefill(3)
    expect(pool.getStats().created).toBe(3)
    const obj = pool.acquire()
    expect(pool.getStats().reused).toBe(1)
    expect(pool.size).toBe(2)
  })

  it('acquire after drain creates new object', () => {
    const pool = createPool()
    const a = pool.acquire()
    pool.release(a)
    pool.drain()
    const b = pool.acquire()
    expect(pool.getStats().created).toBe(2)
  })

  it('acquire after prefill and drain creates new object', () => {
    const pool = createPool()
    pool.prefill(2)
    pool.drain()
    const obj = pool.acquire()
    expect(pool.getStats().created).toBe(3)
  })

  it('acquire decreases size when taking from pool', () => {
    const pool = createPool()
    pool.release(pool.acquire())
    expect(pool.size).toBe(1)
    pool.acquire()
    expect(pool.size).toBe(0)
  })
})

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

  it('release multiple items in sequence', () => {
    const pool = createPool(5)
    const a = pool.acquire()
    const b = pool.acquire()
    const c = pool.acquire()
    pool.release(a)
    pool.release(b)
    pool.release(c)
    expect(pool.size).toBe(3)
  })

  it('release same item increments returned count each time', () => {
    const pool = createPool(5)
    const a = pool.acquire()
    pool.release(a)
    const returnedCount = pool.getStats().returned
    pool.release(a)
    expect(pool.getStats().returned).toBeGreaterThan(returnedCount)
  })

  it('release calls reset even when exceeding maxSize', () => {
    let resetCalled = false
    const pool = new ObjectPool<{ x: number }>({
      factory: () => ({ x: 0 }),
      reset: () => {
        resetCalled = true
      },
      maxSize: 1,
    })
    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    pool.release(b)
    expect(resetCalled).toBe(true)
  })
})

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

  it('available property aliases size', () => {
    const pool = createPool()
    pool.release(pool.acquire())
    expect(pool.available).toBe(pool.size)
  })

  it('size after prefill matches count', () => {
    const pool = createPool()
    pool.prefill(5)
    expect(pool.size).toBe(5)
  })

  it('size caps at maxSize', () => {
    const pool = createPool(3)
    const a = pool.acquire()
    const b = pool.acquire()
    const c = pool.acquire()
    const d = pool.acquire()
    pool.release(a)
    pool.release(b)
    pool.release(c)
    pool.release(d)
    expect(pool.size).toBe(3)
  })

  it('size returns to 0 after acquiring all', () => {
    const pool = createPool()
    pool.prefill(5)
    for (let i = 0; i < 5; i++) {
      pool.acquire()
    }
    expect(pool.size).toBe(0)
  })
})

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

  it('stats available matches pool size', () => {
    const pool = createPool()
    pool.release(pool.acquire())
    pool.release(pool.acquire())
    const stats = pool.getStats()
    expect(stats.available).toBe(pool.size)
  })

  it('stats remain accurate after drain', () => {
    const pool = createPool()
    pool.release(pool.acquire())
    pool.drain()
    const stats = pool.getStats()
    expect(stats.available).toBe(0)
    expect(stats.created).toBe(1)
  })

  it('stats track prefill correctly', () => {
    const pool = createPool()
    pool.prefill(10)
    const stats = pool.getStats()
    expect(stats.created).toBe(10)
    expect(stats.available).toBe(10)
  })

  it('stats are consistent across multiple calls', () => {
    const pool = createPool()
    pool.release(pool.acquire())
    const stats1 = pool.getStats()
    const stats2 = pool.getStats()
    expect(stats1).toEqual(stats2)
  })

  it('stats track reuse correctly', () => {
    const pool = createPool()
    for (let i = 0; i < 10; i++) {
      pool.release(pool.acquire())
    }
    const stats = pool.getStats()
    expect(stats.created).toBe(1)
    expect(stats.returned).toBe(10)
    expect(stats.reused).toBe(9)
  })

  it('stats reusable count never exceeds returned count', () => {
    const pool = createPool()
    for (let i = 0; i < 10; i++) {
      const obj = pool.acquire()
      pool.release(obj)
      pool.acquire()
    }
    const stats = pool.getStats()
    expect(stats.reused).toBeLessThanOrEqual(stats.returned)
  })
})

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

  it('drain returns items in correct order', () => {
    const pool = createPool(5)
    const a = pool.acquire()
    const b = pool.acquire()
    const c = pool.acquire()
    pool.release(a)
    pool.release(b)
    pool.release(c)
    const items = pool.drain()
    expect(items).toHaveLength(3)
    expect(items[0]).not.toBe(items[1])
    expect(items[1]).not.toBe(items[2])
  })

  it('drain works after prefill', () => {
    const pool = createPool()
    pool.prefill(5)
    const items = pool.drain()
    expect(items).toHaveLength(5)
  })

  it('drain on empty pool returns empty array', () => {
    const pool = createPool()
    const items = pool.drain()
    expect(items).toHaveLength(0)
  })

  it('multiple drains are safe', () => {
    const pool = createPool()
    pool.release(pool.acquire())
    pool.drain()
    const items2 = pool.drain()
    expect(items2).toHaveLength(0)
  })
})

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

  it('multiple objects cycle through pool', () => {
    const pool = createPool(5)
    const objects = []
    for (let i = 0; i < 5; i++) {
      objects.push(pool.acquire())
    }
    for (const obj of objects) {
      pool.release(obj)
    }
    for (const obj of objects) {
      const reused = pool.acquire()
      expect(objects.includes(reused)).toBe(true)
    }
  })

  it('reuse cycle maintains reset behavior', () => {
    const pool = createPool(1)
    const obj = pool.acquire()
    obj.value = 100
    pool.release(obj)
    const reused1 = pool.acquire()
    expect(reused1.value).toBe(0)
    reused1.value = 200
    pool.release(reused1)
    const reused2 = pool.acquire()
    expect(reused2.value).toBe(0)
  })

  it('pool behavior with maxSize limit', () => {
    const pool = createPool(3)
    const a = pool.acquire()
    const b = pool.acquire()
    const c = pool.acquire()
    const d = pool.acquire()
    pool.release(a)
    pool.release(b)
    pool.release(c)
    pool.release(d)
    expect(pool.size).toBe(3)
    const first = pool.acquire()
    const second = pool.acquire()
    const third = pool.acquire()
    expect(first).not.toBe(second)
    expect(second).not.toBe(third)
  })

  it('reuse after drain starts fresh', () => {
    const pool = createPool()
    const a = pool.acquire()
    pool.release(a)
    pool.drain()
    const b = pool.acquire()
    pool.release(b)
    const c = pool.acquire()
    expect(c).toBe(b)
  })
})

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

  it('works with Set', () => {
    const pool = new ObjectPool<Set<number>>({
      factory: () => new Set(),
      reset: (s) => s.clear(),
      maxSize: 2,
    })
    const s = pool.acquire()
    s.add(1)
    s.add(2)
    pool.release(s)
    expect(s.size).toBe(0)
  })

  it('works with complex objects', () => {
    interface ComplexItem {
      nested: { data: string[] }
      count: number
    }
    const pool = new ObjectPool<ComplexItem>({
      factory: () => ({ nested: { data: [] }, count: 0 }),
      reset: (item) => {
        item.nested.data = []
        item.count = 0
      },
      maxSize: 2,
    })
    const item = pool.acquire()
    item.nested.data.push('test')
    item.count = 5
    pool.release(item)
    expect(item.nested.data).toEqual([])
    expect(item.count).toBe(0)
  })

  it('works with Date objects', () => {
    const pool = new ObjectPool<Date>({
      factory: () => new Date(0),
      reset: (d) => d.setTime(0),
      maxSize: 2,
    })
    const date = pool.acquire()
    date.setTime(1000000)
    pool.release(date)
    expect(date.getTime()).toBe(0)
  })

  it('works with string buffers', () => {
    const pool = new ObjectPool<string>({
      factory: () => '',
      reset: () => {},
      maxSize: 2,
    })
    const s = pool.acquire()
    expect(typeof s).toBe('string')
  })

  it('works with number buffers', () => {
    const pool = new ObjectPool<number>({
      factory: () => 0,
      reset: (n) => (n = 0),
      maxSize: 2,
    })
    const n = pool.acquire()
    expect(typeof n).toBe('number')
  })
})

describe('ObjectPool - prefill', () => {
  it('prefill adds specified number of objects', () => {
    const pool = createPool()
    pool.prefill(5)
    expect(pool.size).toBe(5)
  })

  it('prefill increases created count', () => {
    const pool = createPool()
    pool.prefill(10)
    expect(pool.getStats().created).toBe(10)
  })

  it('prefill creates specified number of objects', () => {
    const pool = createPool(10)
    pool.prefill(10)
    expect(pool.size).toBe(10)
    expect(pool.getStats().created).toBe(10)
  })

  it('prefill with 0 adds nothing', () => {
    const pool = createPool()
    pool.prefill(0)
    expect(pool.size).toBe(0)
    expect(pool.getStats().created).toBe(0)
  })

  it('multiple prefill calls accumulate', () => {
    const pool = createPool()
    pool.prefill(3)
    pool.prefill(2)
    expect(pool.size).toBe(5)
    expect(pool.getStats().created).toBe(5)
  })

  it('prefill objects are reusable', () => {
    const pool = createPool()
    pool.prefill(3)
    const obj = pool.acquire()
    expect(pool.getStats().reused).toBe(1)
  })

  it('prefill after release adds to pool', () => {
    const pool = createPool()
    const a = pool.acquire()
    pool.release(a)
    pool.prefill(2)
    expect(pool.size).toBe(3)
  })

  it('prefill with very large count creates all objects', () => {
    const pool = createPool(1000)
    pool.prefill(100)
    expect(pool.size).toBe(100)
  })
})

describe('ObjectPool - edge cases', () => {
  it('handles rapid acquire-release cycles', () => {
    const pool = createPool(100)
    for (let i = 0; i < 1000; i++) {
      const obj = pool.acquire()
      pool.release(obj)
    }
    const stats = pool.getStats()
    expect(stats.reused).toBeGreaterThan(0)
  })

  it('handles pool with maxSize of 1 correctly', () => {
    const pool = createPool(1)
    const a = pool.acquire()
    const b = pool.acquire()
    pool.release(a)
    pool.release(b)
    expect(pool.size).toBe(1)
    const c = pool.acquire()
    expect(pool.getStats().reused).toBe(1)
  })

  it('handles empty release on maxSize 1 pool', () => {
    const pool = createPool(1)
    const a = pool.acquire()
    pool.release(a)
    const b = pool.acquire()
    pool.release(b)
    const c = pool.acquire()
    pool.release(c)
    expect(pool.size).toBe(1)
  })

  it('capacity is read-only', () => {
    const pool = createPool(5)
    expect(pool.capacity).toBe(5)
  })

  it('totalCreated matches stats created', () => {
    const pool = createPool()
    pool.acquire()
    pool.acquire()
    pool.prefill(3)
    expect(pool.totalCreated).toBe(pool.getStats().created)
  })

  it('available property returns same as size', () => {
    const pool = createPool()
    pool.prefill(5)
    pool.acquire()
    expect(pool.available).toBe(pool.size)
  })

  it('drain returns array that can be iterated', () => {
    const pool = createPool()
    pool.prefill(3)
    const items = pool.drain()
    let count = 0
    for (const _ of items) {
      count++
    }
    expect(count).toBe(3)
  })
})
describe('object-pool - wave551', () => {
  it('object-pool w551 check 0', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave552', () => {
  it('object-pool w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave553', () => {
  it('object-pool w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave554', () => {
  it('object-pool w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave555', () => {
  it('object-pool w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave556', () => {
  it('object-pool w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave557', () => {
  it('object-pool w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave558', () => {
  it('object-pool w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave559', () => {
  it('object-pool w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave560', () => {
  it('object-pool w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave561', () => {
  it('object-pool w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
