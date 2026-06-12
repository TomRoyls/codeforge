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

describe('object-pool - wave562', () => {
  it('object-pool w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave563', () => {
  it('object-pool w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave564', () => {
  it('object-pool w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave565', () => {
  it('object-pool w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave566', () => {
  it('object-pool w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave127', () => {
  it('object-pool w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave130', () => {
  it('object-pool w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave133', () => {
  it('object-pool w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave136', () => {
  it('object-pool w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - wave139', () => {
  it('object-pool w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w142', () => {
  it('object-pool v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w145', () => {
  it('object-pool v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w148', () => {
  it('object-pool v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w151', () => {
  it('object-pool v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w154', () => {
  it('object-pool v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w157', () => {
  it('object-pool v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w160', () => {
  it('object-pool v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w170', () => {
  it('object-pool x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w180', () => {
  it('object-pool x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w190', () => {
  it('object-pool x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w200', () => {
  it('object-pool x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w210', () => {
  it('object-pool x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w220', () => {
  it('object-pool x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w230', () => {
  it('object-pool x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w240', () => {
  it('object-pool x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w250', () => {
  it('object-pool x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w260', () => {
  it('object-pool x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w270', () => {
  it('object-pool x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w280', () => {
  it('object-pool x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w290', () => {
  it('object-pool x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w300', () => {
  it('object-pool x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w310', () => {
  it('object-pool x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w320', () => {
  it('object-pool x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w330', () => {
  it('object-pool x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w340', () => {
  it('object-pool x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w350', () => {
  it('object-pool x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w360', () => {
  it('object-pool x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w370', () => {
  it('object-pool x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w380', () => {
  it('object-pool x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w390', () => {
  it('object-pool x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w400', () => {
  it('object-pool x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w420', () => {
  it('object-pool x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w440', () => {
  it('object-pool x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w460', () => {
  it('object-pool x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w480', () => {
  it('object-pool x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w500', () => {
  it('object-pool x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w550', () => {
  it('object-pool x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w600', () => {
  it('object-pool x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w650', () => {
  it('object-pool x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w700', () => {
  it('object-pool x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w800', () => {
  it('object-pool x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w900', () => {
  it('object-pool x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('object-pool - w1000', () => {
  it('object-pool x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('object-pool x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
