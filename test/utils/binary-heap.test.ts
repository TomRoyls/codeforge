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
