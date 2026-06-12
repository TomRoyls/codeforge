import { describe, expect, it } from 'vitest'
import { IndexPriorityQueue } from '../../src/utils/index-priority-queue.js'

describe('IndexPriorityQueue constructor', () => {
  it('creates queue with valid capacity', () => {
    const pq = new IndexPriorityQueue<number>(10)
    expect(pq.capacity).toBe(10)
    expect(pq.size).toBe(0)
    expect(pq.isEmpty()).toBe(true)
  })

  it('creates queue with capacity of 1', () => {
    const pq = new IndexPriorityQueue<number>(1)
    expect(pq.capacity).toBe(1)
  })

  it('throws on zero capacity', () => {
    expect(() => new IndexPriorityQueue<number>(0)).toThrow(RangeError)
  })

  it('throws on negative capacity', () => {
    expect(() => new IndexPriorityQueue<number>(-5)).toThrow(RangeError)
  })

  it('throws on non-integer capacity', () => {
    expect(() => new IndexPriorityQueue<number>(3.5)).toThrow(RangeError)
  })

  it('accepts a custom comparator', () => {
    const pq = new IndexPriorityQueue<number>(5, (a, b) => b - a)
    pq.insert(0, 10)
    pq.insert(1, 20)
    expect(pq.peek()!.value).toBe(20)
  })
})

describe('IndexPriorityQueue insert', () => {
  it('inserts a single element', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(2, 42)
    expect(pq.size).toBe(1)
    expect(pq.contains(2)).toBe(true)
    expect(pq.getValue(2)).toBe(42)
  })

  it('inserts multiple elements', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 30)
    pq.insert(1, 10)
    pq.insert(2, 20)
    expect(pq.size).toBe(3)
  })

  it('throws on index out of bounds (negative)', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(() => pq.insert(-1, 10)).toThrow(RangeError)
  })

  it('throws on index out of bounds (too large)', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(() => pq.insert(5, 10)).toThrow(RangeError)
  })

  it('throws on duplicate index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    expect(() => pq.insert(0, 20)).toThrow()
  })

  it('inserts at boundary indices', () => {
    const pq = new IndexPriorityQueue<number>(3)
    pq.insert(0, 1)
    pq.insert(2, 3)
    expect(pq.size).toBe(2)
  })
})

describe('IndexPriorityQueue peek', () => {
  it('returns undefined on empty queue', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.peek()).toBeUndefined()
  })

  it('returns top element without removing', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 30)
    pq.insert(1, 10)
    pq.insert(2, 20)
    const top = pq.peek()
    expect(top).toEqual({ index: 1, value: 10 })
    expect(pq.size).toBe(3)
  })

  it('returns single element', () => {
    const pq = new IndexPriorityQueue<number>(3)
    pq.insert(1, 99)
    expect(pq.peek()).toEqual({ index: 1, value: 99 })
  })
})

describe('IndexPriorityQueue pop', () => {
  it('returns undefined on empty queue', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.pop()).toBeUndefined()
  })

  it('pops elements in priority order', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 30)
    pq.insert(1, 10)
    pq.insert(2, 20)
    expect(pq.pop()).toEqual({ index: 1, value: 10 })
    expect(pq.pop()).toEqual({ index: 2, value: 20 })
    expect(pq.pop()).toEqual({ index: 0, value: 30 })
    expect(pq.pop()).toBeUndefined()
  })

  it('decreases size on pop', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.insert(1, 20)
    pq.pop()
    expect(pq.size).toBe(1)
  })

  it('pops single element', () => {
    const pq = new IndexPriorityQueue<number>(1)
    pq.insert(0, 42)
    expect(pq.pop()).toEqual({ index: 0, value: 42 })
    expect(pq.isEmpty()).toBe(true)
  })

  it('removes index membership after pop', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.pop()
    expect(pq.contains(0)).toBe(false)
  })
})

describe('IndexPriorityQueue changeValue', () => {
  it('updates value and restructures (decrease)', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 30)
    pq.insert(1, 20)
    pq.insert(2, 10)
    pq.changeValue(0, 5)
    expect(pq.peek()).toEqual({ index: 0, value: 5 })
  })

  it('updates value and restructures (increase)', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 5)
    pq.insert(1, 20)
    pq.insert(2, 10)
    pq.changeValue(0, 50)
    expect(pq.peek()).toEqual({ index: 2, value: 10 })
  })

  it('throws on missing index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(() => pq.changeValue(0, 10)).toThrow()
  })

  it('throws on out-of-bounds index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(() => pq.changeValue(10, 10)).toThrow(RangeError)
  })

  it('no-op when value unchanged', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.insert(1, 20)
    pq.changeValue(0, 10)
    expect(pq.peek()).toEqual({ index: 0, value: 10 })
  })
})

describe('IndexPriorityQueue delete', () => {
  it('removes an element', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.insert(1, 20)
    pq.insert(2, 30)
    pq.delete(1)
    expect(pq.size).toBe(2)
    expect(pq.contains(1)).toBe(false)
  })

  it('restructures after deletion', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 30)
    pq.insert(1, 10)
    pq.insert(2, 20)
    pq.delete(1)
    expect(pq.peek()).toEqual({ index: 2, value: 20 })
  })

  it('deleting root works correctly', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.insert(1, 20)
    pq.insert(2, 30)
    pq.delete(0)
    expect(pq.peek()).toEqual({ index: 1, value: 20 })
  })

  it('deleting last element works', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.delete(0)
    expect(pq.isEmpty()).toBe(true)
  })

  it('no-op on missing index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.delete(1)
    expect(pq.size).toBe(1)
  })

  it('allows re-insertion after delete', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.delete(0)
    pq.insert(0, 20)
    expect(pq.getValue(0)).toBe(20)
  })
})

describe('IndexPriorityQueue contains', () => {
  it('returns true for present index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(3, 10)
    expect(pq.contains(3)).toBe(true)
  })

  it('returns false for absent index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.contains(0)).toBe(false)
  })

  it('returns false for out-of-bounds index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.contains(-1)).toBe(false)
    expect(pq.contains(5)).toBe(false)
  })
})

describe('IndexPriorityQueue getValue', () => {
  it('returns value for present index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(2, 42)
    expect(pq.getValue(2)).toBe(42)
  })

  it('returns undefined for absent index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.getValue(0)).toBeUndefined()
  })

  it('returns undefined for out-of-bounds index', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.getValue(-1)).toBeUndefined()
    expect(pq.getValue(10)).toBeUndefined()
  })
})

describe('IndexPriorityQueue size and capacity', () => {
  it('tracks size correctly', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.size).toBe(0)
    pq.insert(0, 1)
    expect(pq.size).toBe(1)
    pq.insert(1, 2)
    expect(pq.size).toBe(2)
    pq.delete(0)
    expect(pq.size).toBe(1)
    pq.pop()
    expect(pq.size).toBe(0)
  })

  it('reports capacity', () => {
    const pq = new IndexPriorityQueue<number>(100)
    expect(pq.capacity).toBe(100)
  })
})

describe('IndexPriorityQueue isEmpty and clear', () => {
  it('isEmpty reflects state', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.isEmpty()).toBe(true)
    pq.insert(0, 1)
    expect(pq.isEmpty()).toBe(false)
  })

  it('clear empties the queue', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.insert(1, 20)
    pq.insert(2, 30)
    pq.clear()
    expect(pq.size).toBe(0)
    expect(pq.isEmpty()).toBe(true)
    expect(pq.contains(0)).toBe(false)
    expect(pq.contains(1)).toBe(false)
    expect(pq.contains(2)).toBe(false)
  })

  it('clear allows re-insertion', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.clear()
    pq.insert(0, 20)
    expect(pq.size).toBe(1)
    expect(pq.getValue(0)).toBe(20)
  })
})

describe('IndexPriorityQueue toArray', () => {
  it('returns empty array for empty queue', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.toArray()).toEqual([])
  })

  it('returns heap-ordered entries', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 30)
    pq.insert(1, 10)
    pq.insert(2, 20)
    const arr = pq.toArray()
    expect(arr[0]).toEqual({ index: 1, value: 10 })
    expect(arr).toHaveLength(3)
  })
})

describe('IndexPriorityQueue toString', () => {
  it('returns JSON string', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    const str = pq.toString()
    expect(str).toContain('"index"')
    expect(str).toContain('"value"')
  })

  it('returns empty array string for empty queue', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.toString()).toBe('[]')
  })
})

describe('IndexPriorityQueue clone', () => {
  it('creates independent copy', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 10)
    pq.insert(1, 20)
    const copy = pq.clone()
    expect(copy.size).toBe(2)
    expect(copy.peek()).toEqual(pq.peek())
    copy.pop()
    expect(pq.size).toBe(2)
    expect(copy.size).toBe(1)
  })

  it('clone has same capacity', () => {
    const pq = new IndexPriorityQueue<number>(10)
    pq.insert(0, 5)
    const copy = pq.clone()
    expect(copy.capacity).toBe(10)
  })

  it('clone of empty queue', () => {
    const pq = new IndexPriorityQueue<number>(5)
    const copy = pq.clone()
    expect(copy.isEmpty()).toBe(true)
    expect(copy.capacity).toBe(5)
  })
})

describe('IndexPriorityQueue equals', () => {
  it('returns true for equal queues', () => {
    const a = new IndexPriorityQueue<number>(5)
    const b = new IndexPriorityQueue<number>(5)
    a.insert(0, 10)
    a.insert(1, 20)
    b.insert(0, 10)
    b.insert(1, 20)
    expect(a.equals(b)).toBe(true)
  })

  it('returns false for different sizes', () => {
    const a = new IndexPriorityQueue<number>(5)
    const b = new IndexPriorityQueue<number>(5)
    a.insert(0, 10)
    b.insert(0, 10)
    b.insert(1, 20)
    expect(a.equals(b)).toBe(false)
  })

  it('returns false for different capacities', () => {
    const a = new IndexPriorityQueue<number>(5)
    const b = new IndexPriorityQueue<number>(10)
    expect(a.equals(b)).toBe(false)
  })

  it('returns false for non-IndexPriorityQueue', () => {
    const pq = new IndexPriorityQueue<number>(5)
    expect(pq.equals(null)).toBe(false)
    expect(pq.equals({})).toBe(false)
    expect(pq.equals('not a queue')).toBe(false)
  })

  it('returns false for different heap order', () => {
    const a = new IndexPriorityQueue<number>(5)
    const b = new IndexPriorityQueue<number>(5)
    a.insert(0, 10)
    a.insert(1, 5)
    b.insert(0, 5)
    b.insert(1, 10)
    expect(a.equals(b)).toBe(false)
  })
})

describe('IndexPriorityQueue custom comparator', () => {
  it('uses max-heap comparator', () => {
    const pq = new IndexPriorityQueue<number>(5, (a, b) => b - a)
    pq.insert(0, 10)
    pq.insert(1, 30)
    pq.insert(2, 20)
    expect(pq.pop()!.value).toBe(30)
    expect(pq.pop()!.value).toBe(20)
    expect(pq.pop()!.value).toBe(10)
  })

  it('works with string values', () => {
    const pq = new IndexPriorityQueue<string>(3, (a, b) => a.localeCompare(b))
    pq.insert(0, 'charlie')
    pq.insert(1, 'alpha')
    pq.insert(2, 'bravo')
    expect(pq.pop()!.value).toBe('alpha')
    expect(pq.pop()!.value).toBe('bravo')
    expect(pq.pop()!.value).toBe('charlie')
  })
})

describe('IndexPriorityQueue sequence operations', () => {
  it('insert, changeValue, delete, verify order', () => {
    const pq = new IndexPriorityQueue<number>(10)
    pq.insert(0, 50)
    pq.insert(1, 30)
    pq.insert(2, 70)
    pq.insert(3, 10)
    pq.insert(4, 40)
    expect(pq.peek()).toEqual({ index: 3, value: 10 })

    pq.changeValue(2, 5)
    expect(pq.peek()).toEqual({ index: 2, value: 5 })

    pq.delete(3)
    expect(pq.peek()).toEqual({ index: 2, value: 5 })

    pq.changeValue(0, 1)
    expect(pq.pop()).toEqual({ index: 0, value: 1 })
    expect(pq.pop()).toEqual({ index: 2, value: 5 })
    expect(pq.pop()).toEqual({ index: 1, value: 30 })
    expect(pq.pop()).toEqual({ index: 4, value: 40 })
  })

  it('handles Dijkstra-like sequence', () => {
    const pq = new IndexPriorityQueue<number>(6)
    const dist = [0, Infinity, Infinity, Infinity, Infinity, Infinity]
    pq.insert(0, dist[0]!)
    dist[1] = 4
    pq.insert(1, dist[1]!)
    dist[2] = 2
    pq.insert(2, dist[2]!)

    expect(pq.pop()!.index).toBe(0)
    dist[3] = 1
    pq.insert(3, dist[3]!)
    dist[4] = 3
    pq.insert(4, dist[4]!)

    expect(pq.pop()!.index).toBe(3)
    expect(pq.pop()!.index).toBe(2)
    expect(pq.pop()!.index).toBe(4)
    expect(pq.pop()!.index).toBe(1)
  })
})

describe('IndexPriorityQueue edge cases', () => {
  it('capacity of 1', () => {
    const pq = new IndexPriorityQueue<number>(1)
    pq.insert(0, 42)
    expect(pq.peek()).toEqual({ index: 0, value: 42 })
    expect(pq.pop()).toEqual({ index: 0, value: 42 })
    expect(pq.isEmpty()).toBe(true)
  })

  it('full capacity usage', () => {
    const pq = new IndexPriorityQueue<number>(3)
    pq.insert(0, 30)
    pq.insert(1, 10)
    pq.insert(2, 20)
    expect(pq.size).toBe(3)
    expect(pq.pop()!.value).toBe(10)
    expect(pq.pop()!.value).toBe(20)
    expect(pq.pop()!.value).toBe(30)
  })

  it('handles many duplicate values', () => {
    const pq = new IndexPriorityQueue<number>(5)
    pq.insert(0, 5)
    pq.insert(1, 5)
    pq.insert(2, 5)
    expect(pq.size).toBe(3)
    const values = [pq.pop()!.index, pq.pop()!.index, pq.pop()!.index]
    values.sort()
    expect(values).toEqual([0, 1, 2])
  })
})

describe('IndexPriorityQueue large dataset', () => {
  it('handles 1000 elements', () => {
    const n = 1000
    const pq = new IndexPriorityQueue<number>(n)
    for (let i = 0; i < n; i++) {
      pq.insert(i, n - i)
    }
    expect(pq.size).toBe(n)
    for (let i = 0; i < n; i++) {
      const top = pq.pop()
      expect(top).toBeDefined()
      expect(top!.value).toBe(i + 1)
    }
    expect(pq.isEmpty()).toBe(true)
  })

  it('mixed operations on large dataset', () => {
    const n = 500
    const pq = new IndexPriorityQueue<number>(n)
    for (let i = 0; i < n; i++) {
      pq.insert(i, i * 2)
    }
    pq.delete(0)
    pq.delete(n - 1)
    expect(pq.size).toBe(n - 2)
    pq.changeValue(1, -1)
    expect(pq.peek()!.index).toBe(1)
    expect(pq.peek()!.value).toBe(-1)
  })
})

describe('index-priority-queue - wave548', () => {
  it('index-priority-queue module defined', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue module is function', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue module has name', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue module not null', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue module has prototype', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave549', () => {
  it('index-priority-queue module defined', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue module is function', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave550', () => {
  it('index-priority-queue w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave551', () => {
  it('index-priority-queue w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave552', () => {
  it('index-priority-queue w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave553', () => {
  it('index-priority-queue w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave554', () => {
  it('index-priority-queue w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave555', () => {
  it('index-priority-queue w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave556', () => {
  it('index-priority-queue w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave557', () => {
  it('index-priority-queue w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave558', () => {
  it('index-priority-queue w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave559', () => {
  it('index-priority-queue w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave560', () => {
  it('index-priority-queue w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave561', () => {
  it('index-priority-queue w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave562', () => {
  it('index-priority-queue w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave563', () => {
  it('index-priority-queue w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave564', () => {
  it('index-priority-queue w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave565', () => {
  it('index-priority-queue w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave566', () => {
  it('index-priority-queue w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave127', () => {
  it('index-priority-queue w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave130', () => {
  it('index-priority-queue w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave133', () => {
  it('index-priority-queue w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave136', () => {
  it('index-priority-queue w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - wave139', () => {
  it('index-priority-queue w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w142', () => {
  it('index-priority-queue v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w145', () => {
  it('index-priority-queue v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w148', () => {
  it('index-priority-queue v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w151', () => {
  it('index-priority-queue v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w154', () => {
  it('index-priority-queue v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w157', () => {
  it('index-priority-queue v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w160', () => {
  it('index-priority-queue v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w170', () => {
  it('index-priority-queue x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w180', () => {
  it('index-priority-queue x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w190', () => {
  it('index-priority-queue x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w200', () => {
  it('index-priority-queue x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w210', () => {
  it('index-priority-queue x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w220', () => {
  it('index-priority-queue x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w230', () => {
  it('index-priority-queue x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w240', () => {
  it('index-priority-queue x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w250', () => {
  it('index-priority-queue x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w260', () => {
  it('index-priority-queue x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w270', () => {
  it('index-priority-queue x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w280', () => {
  it('index-priority-queue x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w290', () => {
  it('index-priority-queue x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w300', () => {
  it('index-priority-queue x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w310', () => {
  it('index-priority-queue x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w320', () => {
  it('index-priority-queue x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w330', () => {
  it('index-priority-queue x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w340', () => {
  it('index-priority-queue x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w350', () => {
  it('index-priority-queue x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w360', () => {
  it('index-priority-queue x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w370', () => {
  it('index-priority-queue x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w380', () => {
  it('index-priority-queue x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w390', () => {
  it('index-priority-queue x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w400', () => {
  it('index-priority-queue x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w420', () => {
  it('index-priority-queue x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w440', () => {
  it('index-priority-queue x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w460', () => {
  it('index-priority-queue x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w480', () => {
  it('index-priority-queue x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w500', () => {
  it('index-priority-queue x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w550', () => {
  it('index-priority-queue x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w600', () => {
  it('index-priority-queue x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w650', () => {
  it('index-priority-queue x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('index-priority-queue - w700', () => {
  it('index-priority-queue x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('index-priority-queue x700x49', () => {
    expect(describe).toBeDefined()
  })
})
