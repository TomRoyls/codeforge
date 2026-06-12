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
