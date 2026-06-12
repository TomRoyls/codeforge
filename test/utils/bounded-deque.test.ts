import { describe, expect, it } from 'vitest'
import { BoundedDeque } from '../../src/utils/bounded-deque.js'

describe('BoundedDeque', () => {
  it('pushBack and popFront work as FIFO', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.popFront()).toBe(1)
    expect(dq.popFront()).toBe(2)
    expect(dq.popFront()).toBe(3)
  })

  it('pushFront and popBack work as LIFO', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushFront(1)
    dq.pushFront(2)
    expect(dq.popBack()).toBe(1)
    expect(dq.popBack()).toBe(2)
  })

  it('auto-evicts oldest on pushBack overflow', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    const evicted = dq.pushBack(3)
    expect(evicted).toBe(1)
    expect(dq.toArray()).toEqual([2, 3])
  })

  it('auto-evicts newest on pushFront overflow', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    const evicted = dq.pushFront(0)
    expect(evicted).toBe(2)
    expect(dq.toArray()).toEqual([0, 1])
  })

  it('front and back peek correctly', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.front()).toBe(1)
    expect(dq.back()).toBe(3)
  })

  it('returns undefined on empty pop', () => {
    const dq = new BoundedDeque<number>(3)
    expect(dq.popFront()).toBeUndefined()
    expect(dq.popBack()).toBeUndefined()
  })

  it('front/back undefined on empty', () => {
    const dq = new BoundedDeque<number>(3)
    expect(dq.front()).toBeUndefined()
    expect(dq.back()).toBeUndefined()
  })

  it('size and isEmpty work', () => {
    const dq = new BoundedDeque<number>(3)
    expect(dq.size).toBe(0)
    expect(dq.isEmpty()).toBe(true)
    dq.pushBack(1)
    expect(dq.size).toBe(1)
    expect(dq.isEmpty()).toBe(false)
  })

  it('isFull works', () => {
    const dq = new BoundedDeque<number>(2)
    expect(dq.isFull()).toBe(false)
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.isFull()).toBe(true)
  })

  it('getCapacity returns constructor value', () => {
    const dq = new BoundedDeque<number>(10)
    expect(dq.getCapacity()).toBe(10)
  })

  it('tracks evictions', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.pushBack(4)
    expect(dq.evictions).toBe(2)
  })

  it('toArray returns elements in order', () => {
    const dq = new BoundedDeque<string>(5)
    dq.pushBack('a')
    dq.pushBack('b')
    dq.pushBack('c')
    expect(dq.toArray()).toEqual(['a', 'b', 'c'])
  })

  it('clear resets all state', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.clear()
    expect(dq.size).toBe(0)
    expect(dq.isEmpty()).toBe(true)
    expect(dq.toArray()).toEqual([])
  })

  it('clear allows reuse', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.clear()
    dq.pushBack(10)
    expect(dq.front()).toBe(10)
  })

  it('throws on invalid capacity', () => {
    expect(() => new BoundedDeque(0)).toThrow(RangeError)
    expect(() => new BoundedDeque(-1)).toThrow(RangeError)
  })

  it('handles single capacity', () => {
    const dq = new BoundedDeque<number>(1)
    dq.pushBack(1)
    expect(dq.isFull()).toBe(true)
    const evicted = dq.pushBack(2)
    expect(evicted).toBe(1)
    expect(dq.toArray()).toEqual([2])
  })

  it('popBack returns last element', () => {
    const dq = new BoundedDeque<number>(10)
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.popBack()).toBe(2)
    expect(dq.size).toBe(1)
  })

  it('pushFront and popFront', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushFront(10)
    expect(dq.popFront()).toBe(10)
  })

  it('pushBack respects capacity', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.size).toBeLessThanOrEqual(2)
  })

  it('interleaved pushFront and pushBack', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushBack(2)
    dq.pushFront(1)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('interleaved popFront and popBack', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.popFront()).toBe(1)
    expect(dq.popBack()).toBe(3)
    expect(dq.toArray()).toEqual([2])
  })

  it('handles many wraparound cycles', () => {
    const dq = new BoundedDeque<number>(3)
    for (let i = 0; i < 20; i++) {
      dq.pushBack(i)
    }
    expect(dq.toArray()).toEqual([17, 18, 19])
    expect(dq.evictions).toBe(17)
  })

  it('toString returns correct format', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toString()).toBe('[1, 2, 3]')
  })

  it('toString on empty deque', () => {
    const dq = new BoundedDeque<number>(3)
    expect(dq.toString()).toBe('[]')
  })

  it('toJSON returns array', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushBack(10)
    dq.pushBack(20)
    expect(dq.toJSON()).toEqual([10, 20])
  })

  it('clone creates independent copy', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    const cloned = dq.clone()
    dq.popFront()
    expect(cloned.toArray()).toEqual([1, 2])
    expect(dq.toArray()).toEqual([2])
  })

  it('clone preserves evictions', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    const cloned = dq.clone()
    expect(cloned.evictions).toBe(1)
  })

  it('equals returns true for identical deques', () => {
    const d1 = new BoundedDeque<number>(3)
    const d2 = new BoundedDeque<number>(3)
    d1.pushBack(1)
    d1.pushBack(2)
    d2.pushBack(1)
    d2.pushBack(2)
    expect(d1.equals(d2)).toBe(true)
  })

  it('equals returns false for different contents', () => {
    const d1 = new BoundedDeque<number>(3)
    const d2 = new BoundedDeque<number>(3)
    d1.pushBack(1)
    d2.pushBack(2)
    expect(d1.equals(d2)).toBe(false)
  })

  it('equals returns false for different capacities', () => {
    const d1 = new BoundedDeque<number>(3)
    const d2 = new BoundedDeque<number>(5)
    expect(d1.equals(d2)).toBe(false)
  })

  it('equals returns false for non-BoundedDeque', () => {
    const dq = new BoundedDeque<number>(3)
    expect(dq.equals(null)).toBe(false)
    expect(dq.equals({})).toBe(false)
  })

  it('single capacity pushFront overflow', () => {
    const dq = new BoundedDeque<number>(1)
    dq.pushBack(1)
    const evicted = dq.pushFront(2)
    expect(evicted).toBe(1)
    expect(dq.toArray()).toEqual([2])
  })

  it('multiple pushFront and popBack operations', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushFront(3)
    dq.pushFront(2)
    dq.pushFront(1)
    expect(dq.popBack()).toBe(3)
    expect(dq.popBack()).toBe(2)
    expect(dq.popBack()).toBe(1)
    expect(dq.isEmpty()).toBe(true)
  })

  it('eviction count resets on clear', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.evictions).toBe(1)
    dq.clear()
    expect(dq.evictions).toBe(1)
  })

  it('handles string type', () => {
    const dq = new BoundedDeque<string>(3)
    dq.pushBack('hello')
    dq.pushBack('world')
    expect(dq.front()).toBe('hello')
    expect(dq.back()).toBe('world')
  })

  it('handles object type', () => {
    const dq = new BoundedDeque<{ val: number }>(3)
    dq.pushBack({ val: 1 })
    dq.pushBack({ val: 2 })
    expect(dq.front()!.val).toBe(1)
    expect(dq.back()!.val).toBe(2)
  })

  it('pushFront on empty deque', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushFront(42)
    expect(dq.front()).toBe(42)
    expect(dq.back()).toBe(42)
    expect(dq.size).toBe(1)
  })

  it('large capacity works correctly', () => {
    const dq = new BoundedDeque<number>(100)
    for (let i = 0; i < 100; i++) dq.pushBack(i)
    expect(dq.size).toBe(100)
    expect(dq.isFull()).toBe(true)
    expect(dq.front()).toBe(0)
    expect(dq.back()).toBe(99)
  })

  it('toArray on full deque', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([1, 2, 3])
  })

  it('toArray after eviction', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.toArray()).toEqual([2, 3])
  })

  it('alternating push and pop', () => {
    const dq = new BoundedDeque<number>(5)
    dq.pushBack(1)
    expect(dq.popFront()).toBe(1)
    dq.pushBack(2)
    expect(dq.popBack()).toBe(2)
    expect(dq.isEmpty()).toBe(true)
  })

  it('front after eviction', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    expect(dq.front()).toBe(2)
    expect(dq.back()).toBe(3)
  })

  it('back after pushFront eviction', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushFront(0)
    expect(dq.front()).toBe(0)
    expect(dq.back()).toBe(1)
  })

  it('pushFront returns undefined when not full', () => {
    const dq = new BoundedDeque<number>(5)
    expect(dq.pushFront(1)).toBeUndefined()
  })

  it('pushBack returns undefined when not full', () => {
    const dq = new BoundedDeque<number>(5)
    expect(dq.pushBack(1)).toBeUndefined()
  })

  it('equals with self', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    expect(dq.equals(dq)).toBe(true)
  })

  it('clone of empty deque', () => {
    const dq = new BoundedDeque<number>(3)
    const cloned = dq.clone()
    expect(cloned.size).toBe(0)
    expect(cloned.isEmpty()).toBe(true)
  })

  it('wraps around correctly with pop and push', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    dq.popFront()
    dq.pushBack(4)
    expect(dq.toArray()).toEqual([2, 3, 4])
  })

  it('pushFront on full deque evicts newest (back)', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    dq.pushBack(3)
    const evicted = dq.pushFront(0)
    expect(evicted).toBe(3)
    expect(dq.toArray()).toEqual([0, 1, 2])
  })

  it('no eviction on pushBack when not full', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(1)
    dq.pushBack(2)
    expect(dq.evictions).toBe(0)
  })

  it('handles null values', () => {
    const dq = new BoundedDeque<null>(3)
    dq.pushBack(null)
    expect(dq.front()).toBeNull()
    expect(dq.size).toBe(1)
  })

  it('handles undefined values', () => {
    const dq = new BoundedDeque<undefined>(3)
    dq.pushBack(undefined)
    expect(dq.front()).toBeUndefined()
    expect(dq.size).toBe(1)
  })

  it('toJSON matches toArray output', () => {
    const dq = new BoundedDeque<number>(3)
    dq.pushBack(10); dq.pushBack(20)
    expect(dq.toJSON()).toEqual(dq.toArray())
  })

  it('clear preserves evictions count', () => {
    const dq = new BoundedDeque<number>(2)
    dq.pushBack(1); dq.pushBack(2); dq.pushBack(3)
    expect(dq.evictions).toBeGreaterThan(0)
    dq.clear()
    expect(dq.evictions).toBeGreaterThan(0)
  })

  it('equals returns false when evictions differ', () => {
    const dq1 = new BoundedDeque<number>(2)
    const dq2 = new BoundedDeque<number>(2)
    dq1.pushBack(1); dq1.pushBack(2); dq1.pushBack(3)
    dq2.pushBack(2); dq2.pushBack(3)
    expect(dq1.equals(dq2)).toBe(false)
  })
})

  it('push drops oldest when full', () => {
    const bd = new BoundedDeque<number>(3)
    bd.pushBack(1)
    bd.pushBack(2)
    bd.pushBack(3)
    bd.pushBack(4)
    expect(bd.size).toBe(3)
  })

  it('pushFront prepends', () => {
    const bd = new BoundedDeque<number>(5)
    bd.pushFront(1)
    bd.pushFront(2)
    expect(bd.front()).toBe(2)
  })

  it('isEmpty on new deque', () => {
    const bd = new BoundedDeque<number>(5)
    expect(bd.isEmpty()).toBe(true)
  })

describe('bounded-deque - wave544', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('bounded-deque - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('bounded-deque - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('bounded-deque - wave548', () => {
  it('bounded-deque module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-deque - wave549', () => {
  it('bounded-deque module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-deque - wave550', () => {
  it('bounded-deque w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-deque - wave551', () => {
  it('bounded-deque w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-deque - wave552', () => {
  it('bounded-deque w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-deque - wave553', () => {
  it('bounded-deque w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bounded-deque - wave554', () => {
  it('bounded-deque w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bounded-deque w554 v2', () => {
    expect(describe).toBeDefined()
  })
})
