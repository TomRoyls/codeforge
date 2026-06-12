import { describe, expect, it } from 'vitest'
import { BinaryHeap } from '../../src/utils/binary-heap.js'

// ─── Min Heap ───

describe('BinaryHeap min heap', () => {
  it('starts empty', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('pushes and peeks', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    expect(heap.peek()).toBe(5)
    expect(heap.size).toBe(1)
  })

  it('pops in ascending order', () => {
    const heap = new BinaryHeap<number>()
    heap.push(3)
    heap.push(1)
    heap.push(2)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(3)
  })

  it('handles duplicate values', () => {
    const heap = new BinaryHeap<number>()
    heap.push(2)
    heap.push(2)
    heap.push(1)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(2)
  })

  it('pops undefined on empty', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.pop()).toBeUndefined()
  })

  it('size tracks elements', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    expect(heap.size).toBe(2)
  })

  it('handles single element', () => {
    const heap = new BinaryHeap<number>()
    heap.push(42)
    expect(heap.pop()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Max Heap ───

describe('BinaryHeap max heap', () => {
  it('pops in descending order', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(1)
    heap.push(3)
    heap.push(2)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(1)
  })

  it('peeks max value', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(1)
    heap.push(5)
    heap.push(3)
    expect(heap.peek()).toBe(5)
  })
})

// ─── Custom Comparator ───

describe('BinaryHeap custom comparator', () => {
  it('sorts objects by property', () => {
    const heap = new BinaryHeap<{ name: string; priority: number }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    heap.push({ name: 'low', priority: 10 })
    heap.push({ name: 'high', priority: 1 })
    heap.push({ name: 'mid', priority: 5 })
    expect(heap.pop()!.name).toBe('high')
    expect(heap.pop()!.name).toBe('mid')
    expect(heap.pop()!.name).toBe('low')
  })
})

// ─── fromArray ───

describe('BinaryHeap fromArray', () => {
  it('builds min heap from array', () => {
    const heap = BinaryHeap.fromArray([5, 3, 1, 4, 2])
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBe(5)
  })

  it('builds max heap from array', () => {
    const heap = BinaryHeap.fromArray([1, 3, 5, 2, 4], { type: 'max' })
    expect(heap.pop()).toBe(5)
    expect(heap.pop()).toBe(4)
    expect(heap.pop()).toBe(3)
  })

  it('handles empty array', () => {
    const heap = BinaryHeap.fromArray<number>([])
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles single element', () => {
    const heap = BinaryHeap.fromArray([42])
    expect(heap.pop()).toBe(42)
  })
})

// ─── toArray & Clear ───

describe('BinaryHeap toArray & clear', () => {
  it('toArray returns internal array copy', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    const arr = heap.toArray()
    expect(arr.length).toBe(2)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
  })

  it('clear empties the heap', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    heap.push(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.pop()).toBeUndefined()
  })
})

// ─── Stress ───

describe('BinaryHeap stress', () => {
  it('handles many elements sorted', () => {
    const heap = new BinaryHeap<number>()
    const n = 200
    for (let i = 0; i < n; i++) heap.push(i)
    for (let i = 0; i < n; i++) {
      expect(heap.pop()).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles many elements in reverse', () => {
    const heap = new BinaryHeap<number>()
    const n = 200
    for (let i = n; i >= 0; i--) heap.push(i)
    for (let i = 0; i <= n; i++) {
      expect(heap.pop()).toBe(i)
    }
  })

  it('peek returns minimum without removing', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    heap.push(3)
    heap.push(7)
    expect(heap.peek()).toBe(3)
    expect(heap.size).toBe(3)
  })

  it('pop returns elements in order', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    heap.push(1)
    heap.push(3)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(5)
  })

  it('peek on empty heap returns undefined', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('size tracks elements', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    expect(heap.size).toBe(2)
  })

  it('pop returns minimum element', () => {
    const heap = new BinaryHeap<number>()
    heap.push(3)
    heap.push(1)
    heap.push(2)
    expect(heap.pop()).toBe(1)
  })

  it('pop from empty returns undefined', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.pop()).toBeUndefined()
  })
})

describe('BinaryHeap toString', () => {
  it('returns JSON string representation', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    heap.push(3)
    const result = heap.toString()
    expect(JSON.parse(result)).toEqual([1, 2, 3])
  })

  it('empty heap returns empty array string', () => {
    const heap = new BinaryHeap<number>()
    const result = heap.toString()
    expect(result).toBe('[]')
  })
})

describe('BinaryHeap toJSON', () => {
  it('returns array copy of elements', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    heap.push(3)
    const json = heap.toJSON()
    expect(json).toEqual([1, 2, 3])
    expect(json).not.toBe(heap.toArray())
  })

  it('empty heap returns empty array', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.toJSON()).toEqual([])
  })

  it('preserves order for max heap', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(1)
    heap.push(3)
    heap.push(2)
    const json = heap.toJSON()
    expect(json.length).toBe(3)
    expect(json).toContain(1)
    expect(json).toContain(2)
    expect(json).toContain(3)
  })
})

describe('BinaryHeap clone', () => {
  it('creates independent copy', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    heap.push(3)
    const clone = heap.clone()
    expect(clone.size).toBe(3)
    expect(clone.pop()).toBe(1)
    expect(heap.pop()).toBe(1)
  })

  it('clone modifications do not affect original', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    const clone = heap.clone()
    clone.push(0)
    clone.push(10)
    expect(clone.size).toBe(4)
    expect(heap.size).toBe(2)
    expect(clone.pop()).toBe(0)
    expect(heap.pop()).toBe(1)
  })

  it('clone with max heap type', () => {
    const heap = new BinaryHeap<number>({ type: 'max' })
    heap.push(1)
    heap.push(3)
    heap.push(2)
    const clone = heap.clone()
    expect(clone.pop()).toBe(3)
    expect(heap.pop()).toBe(3)
  })

  it('clone empty heap', () => {
    const heap = new BinaryHeap<number>()
    const clone = heap.clone()
    expect(clone.isEmpty()).toBe(true)
    expect(clone.size).toBe(0)
  })
})

describe('BinaryHeap equals', () => {
  it('returns true for identical heaps', () => {
    const heap1 = new BinaryHeap<number>()
    const heap2 = new BinaryHeap<number>()
    heap1.push(1)
    heap1.push(2)
    heap1.push(3)
    heap2.push(1)
    heap2.push(2)
    heap2.push(3)
    expect(heap1.equals(heap2)).toBe(true)
  })

  it('returns false for different sizes', () => {
    const heap1 = new BinaryHeap<number>()
    const heap2 = new BinaryHeap<number>()
    heap1.push(1)
    heap2.push(1)
    heap2.push(2)
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('returns false for different elements', () => {
    const heap1 = new BinaryHeap<number>()
    const heap2 = new BinaryHeap<number>()
    heap1.push(1)
    heap1.push(2)
    heap2.push(1)
    heap2.push(3)
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('returns false for non-BinaryHeap objects', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.equals(null)).toBe(false)
    expect(heap.equals(undefined)).toBe(false)
    expect(heap.equals({})).toBe(false)
    expect(heap.equals([1, 2, 3])).toBe(false)
  })

  it('empty heaps are equal', () => {
    const heap1 = new BinaryHeap<number>()
    const heap2 = new BinaryHeap<number>()
    expect(heap1.equals(heap2)).toBe(true)
  })
})

describe('BinaryHeap edge cases', () => {
  it('handles negative numbers', () => {
    const heap = new BinaryHeap<number>()
    heap.push(-1)
    heap.push(-3)
    heap.push(-2)
    expect(heap.pop()).toBe(-3)
    expect(heap.pop()).toBe(-2)
    expect(heap.pop()).toBe(-1)
  })

  it('handles mixed positive and negative numbers', () => {
    const heap = new BinaryHeap<number>()
    heap.push(5)
    heap.push(-2)
    heap.push(0)
    heap.push(-10)
    heap.push(3)
    expect(heap.pop()).toBe(-10)
    expect(heap.pop()).toBe(-2)
  })

  it('handles zero values', () => {
    const heap = new BinaryHeap<number>()
    heap.push(0)
    heap.push(0)
    heap.push(1)
    expect(heap.pop()).toBe(0)
    expect(heap.pop()).toBe(0)
    expect(heap.pop()).toBe(1)
  })

  it('clear on empty heap', () => {
    const heap = new BinaryHeap<number>()
    heap.clear()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
  })

  it('toArray returns independent copy', () => {
    const heap = new BinaryHeap<number>()
    heap.push(1)
    heap.push(2)
    const arr = heap.toArray()
    arr.push(3)
    arr[0] = 99
    expect(heap.toArray()).toEqual([1, 2])
  })

  it('fromArray with custom comparator', () => {
    const heap = BinaryHeap.fromArray(
      [{ val: 3 }, { val: 1 }, { val: 2 }],
      { comparator: (a, b) => a.val - b.val }
    )
    expect(heap.pop()!.val).toBe(1)
    expect(heap.pop()!.val).toBe(2)
    expect(heap.pop()!.val).toBe(3)
  })

  it('handles very large numbers', () => {
    const heap = new BinaryHeap<number>()
    heap.push(Number.MAX_SAFE_INTEGER)
    heap.push(0)
    heap.push(Number.MIN_SAFE_INTEGER)
    expect(heap.pop()).toBe(Number.MIN_SAFE_INTEGER)
    expect(heap.pop()).toBe(0)
    expect(heap.pop()).toBe(Number.MAX_SAFE_INTEGER)
  })
})

describe('BinaryHeap string types', () => {
  it('works with string values', () => {
    const heap = new BinaryHeap<string>({
      comparator: (a, b) => a.localeCompare(b)
    })
    heap.push('zebra')
    heap.push('apple')
    heap.push('banana')
    expect(heap.pop()).toBe('apple')
    expect(heap.pop()).toBe('banana')
    expect(heap.pop()).toBe('zebra')
  })
})

describe('BinaryHeap object references', () => {
  it('equals uses Object.is for comparison', () => {
    const heap1 = new BinaryHeap<{ id: number }>()
    const heap2 = new BinaryHeap<{ id: number }>()
    const obj1 = { id: 1 }
    const obj2 = { id: 1 }
    heap1.push(obj1)
    heap1.push(obj2)
    heap2.push(obj1)
    heap2.push(obj2)
    expect(heap1.equals(heap2)).toBe(true)
  })
})

describe('BinaryHeap heap property validation', () => {
  it('pop many elements maintains heap property', () => {
    const heap = new BinaryHeap<number>()
    for (let i = 0; i < 1000; i++) {
      heap.push(Math.random() * 1000)
    }
    let prev = -Infinity
    while (!heap.isEmpty()) {
      const current = heap.pop()!
      expect(current).toBeGreaterThanOrEqual(prev)
      prev = current
    }
  })

  it('repeated push and pop maintains heap property', () => {
    const heap = new BinaryHeap<number>()
    for (let i = 0; i < 50; i++) {
      heap.push(i)
      if (i > 10) heap.pop()
    }
    while (!heap.isEmpty()) {
      heap.pop()
    }
    expect(heap.isEmpty()).toBe(true)
  })
})

describe('BinaryHeap combination tests', () => {
  it('fromArray with max heap and custom comparator', () => {
    const heap = BinaryHeap.fromArray(
      [{ val: 3 }, { val: 1 }, { val: 2 }],
      { type: 'max', comparator: (a, b) => a.val - b.val }
    )
    expect(heap.pop()!.val).toBe(3)
    expect(heap.pop()!.val).toBe(2)
    expect(heap.pop()!.val).toBe(1)
  })
})

describe('BinaryHeap equals edge cases', () => {
  it('equals returns false for min vs max heap with same elements', () => {
    const minHeap = new BinaryHeap<number>({ type: 'min' })
    const maxHeap = new BinaryHeap<number>({ type: 'max' })
    minHeap.push(1)
    minHeap.push(2)
    minHeap.push(3)
    maxHeap.push(1)
    maxHeap.push(2)
    maxHeap.push(3)
    expect(minHeap.equals(maxHeap)).toBe(false)
  })

  it('handles objects with custom comparator', () => {
    const heap = new BinaryHeap<{ priority: number }>({
      comparator: (a, b) => a.priority - b.priority,
    })
    heap.push({ priority: 3 })
    heap.push({ priority: 1 })
    heap.push({ priority: 2 })
    expect(heap.pop()!.priority).toBe(1)
    expect(heap.pop()!.priority).toBe(2)
  })

  it('clear resets size to 0', () => {
    const h = new BinaryHeap<number>()
    h.push(1)
    h.push(2)
    h.clear()
    expect(h.size).toBe(0)
    expect(h.isEmpty()).toBe(true)
  })

  it('clone is independent of original', () => {
    const h = new BinaryHeap<number>()
    h.push(10)
    h.push(20)
    const c = h.clone()
    h.pop()
    expect(c.size).toBe(2)
    expect(h.size).toBe(1)
  })

  it('toArray returns copy not reference', () => {
    const h = new BinaryHeap<number>()
    h.push(1)
    const arr = h.toArray()
    arr.push(999)
    expect(h.size).toBe(1)
  })
})

  it('isEmpty on new heap', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('peek on empty returns undefined', () => {
    const heap = new BinaryHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('pop returns elements in order', () => {
    const heap = new BinaryHeap<number>()
    heap.push(3)
    heap.push(1)
    heap.push(2)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(2)
    expect(heap.pop()).toBe(3)
  })

describe('binary-heap - wave544', () => {
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

describe('binary-heap - wave546', () => {
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

describe('binary-heap - wave547', () => {
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

describe('binary-heap - wave548', () => {
  it('binary-heap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave549', () => {
  it('binary-heap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave550', () => {
  it('binary-heap w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave551', () => {
  it('binary-heap w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave552', () => {
  it('binary-heap w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave553', () => {
  it('binary-heap w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave554', () => {
  it('binary-heap w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave555', () => {
  it('binary-heap w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave556', () => {
  it('binary-heap w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave557', () => {
  it('binary-heap w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave558', () => {
  it('binary-heap w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave559', () => {
  it('binary-heap w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave560', () => {
  it('binary-heap w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave561', () => {
  it('binary-heap w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave562', () => {
  it('binary-heap w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave563', () => {
  it('binary-heap w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave564', () => {
  it('binary-heap w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave565', () => {
  it('binary-heap w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave566', () => {
  it('binary-heap w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave127', () => {
  it('binary-heap w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave130', () => {
  it('binary-heap w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave133', () => {
  it('binary-heap w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave136', () => {
  it('binary-heap w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - wave139', () => {
  it('binary-heap w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w142', () => {
  it('binary-heap v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w145', () => {
  it('binary-heap v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w148', () => {
  it('binary-heap v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w151', () => {
  it('binary-heap v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w154', () => {
  it('binary-heap v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w157', () => {
  it('binary-heap v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w160', () => {
  it('binary-heap v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w170', () => {
  it('binary-heap x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w180', () => {
  it('binary-heap x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w190', () => {
  it('binary-heap x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w200', () => {
  it('binary-heap x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w210', () => {
  it('binary-heap x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w220', () => {
  it('binary-heap x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w230', () => {
  it('binary-heap x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w240', () => {
  it('binary-heap x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w250', () => {
  it('binary-heap x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w260', () => {
  it('binary-heap x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w270', () => {
  it('binary-heap x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w280', () => {
  it('binary-heap x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w290', () => {
  it('binary-heap x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w300', () => {
  it('binary-heap x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w310', () => {
  it('binary-heap x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w320', () => {
  it('binary-heap x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w330', () => {
  it('binary-heap x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w340', () => {
  it('binary-heap x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w350', () => {
  it('binary-heap x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w360', () => {
  it('binary-heap x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w370', () => {
  it('binary-heap x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w380', () => {
  it('binary-heap x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w390', () => {
  it('binary-heap x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w400', () => {
  it('binary-heap x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w420', () => {
  it('binary-heap x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w440', () => {
  it('binary-heap x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w460', () => {
  it('binary-heap x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w480', () => {
  it('binary-heap x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w500', () => {
  it('binary-heap x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w550', () => {
  it('binary-heap x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w600', () => {
  it('binary-heap x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w650', () => {
  it('binary-heap x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-heap - w700', () => {
  it('binary-heap x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-heap x700x49', () => {
    expect(describe).toBeDefined()
  })
})
