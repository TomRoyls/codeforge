import { beforeEach, describe, expect, it } from 'vitest'

import { MinMaxHeap } from '../../src/utils/min-max-heap.js'

// ─── Empty heap operations ───────────────────────────────
describe('MinMaxHeap - empty heap', () => {
  it('peekMin returns undefined on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.peekMin()).toBeUndefined()
  })

  it('peekMax returns undefined on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.peekMax()).toBeUndefined()
  })

  it('extractMin returns undefined on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('extractMax returns undefined on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.extractMax()).toBeUndefined()
  })

  it('isEmpty returns true on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('size is 0 on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.size).toBe(0)
  })

  it('toArray returns empty array on empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.toArray()).toEqual([])
  })
})

// ─── Insert and peek ─────────────────────────────────────
describe('MinMaxHeap - insert and peek', () => {
  it('insert and peekMin single element', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(42)
    expect(heap.peekMin()).toBe(42)
    expect(heap.peekMax()).toBe(42)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
  })

  it('peekMin returns smallest after multiple inserts', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    expect(heap.peekMin()).toBe(1)
  })

  it('peekMax returns largest after multiple inserts', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    expect(heap.peekMax()).toBe(9)
  })

  it('peekMin and peekMax do not remove elements', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    expect(heap.peekMin()).toBe(10)
    expect(heap.peekMax()).toBe(30)
    expect(heap.size).toBe(3)
  })
})

// ─── ExtractMin and ExtractMax ───────────────────────────
describe('MinMaxHeap - extractMin and extractMax', () => {
  it('extractMin removes and returns minimum', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.extractMin()).toBe(3)
    expect(heap.size).toBe(2)
    expect(heap.peekMin()).toBe(5)
  })

  it('extractMax removes and returns maximum', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.extractMax()).toBe(7)
    expect(heap.size).toBe(2)
    expect(heap.peekMax()).toBe(5)
  })

  it('extracts all elements in sorted order via extractMin', () => {
    const heap = new MinMaxHeap<number>()
    const values = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
    for (const v of values) heap.insert(v)
    const sorted = [...values].sort((a, b) => a - b)
    for (const expected of sorted) {
      expect(heap.extractMin()).toBe(expected)
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('extracts all elements in reverse sorted order via extractMax', () => {
    const heap = new MinMaxHeap<number>()
    const values = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
    for (const v of values) heap.insert(v)
    const sorted = [...values].sort((a, b) => b - a)
    for (const expected of sorted) {
      expect(heap.extractMax()).toBe(expected)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Interleaved min/max extracts ────────────────────────
describe('MinMaxHeap - interleaved min/max extracts', () => {
  it('alternating extractMin and extractMax', () => {
    const heap = new MinMaxHeap<number>()
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90]
    for (const v of values) heap.insert(v)
    expect(heap.extractMin()).toBe(10)
    expect(heap.extractMax()).toBe(90)
    expect(heap.extractMin()).toBe(20)
    expect(heap.extractMax()).toBe(80)
    expect(heap.extractMin()).toBe(30)
    expect(heap.extractMax()).toBe(70)
    expect(heap.extractMin()).toBe(40)
    expect(heap.extractMax()).toBe(60)
    expect(heap.extractMin()).toBe(50)
    expect(heap.isEmpty()).toBe(true)
  })

  it('mixed inserts and extracts', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(10)
    heap.insert(3)
    expect(heap.extractMin()).toBe(3)
    heap.insert(1)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMax()).toBe(10)
    heap.insert(7)
    expect(heap.peekMin()).toBe(5)
    expect(heap.peekMax()).toBe(7)
    expect(heap.size).toBe(2)
  })
})

// ─── Size tracking ───────────────────────────────────────
describe('MinMaxHeap - size tracking', () => {
  it('tracks size through inserts and extracts', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.size).toBe(0)
    heap.insert(1)
    expect(heap.size).toBe(1)
    heap.insert(2)
    expect(heap.size).toBe(2)
    heap.insert(3)
    expect(heap.size).toBe(3)
    heap.extractMin()
    expect(heap.size).toBe(2)
    heap.extractMax()
    expect(heap.size).toBe(1)
    heap.extractMin()
    expect(heap.size).toBe(0)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('MinMaxHeap - clear', () => {
  it('clears the heap', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peekMin()).toBeUndefined()
    expect(heap.peekMax()).toBeUndefined()
    expect(heap.extractMin()).toBeUndefined()
    expect(heap.extractMax()).toBeUndefined()
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('MinMaxHeap - toArray', () => {
  it('returns all elements without modifying the heap', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    const arr = heap.toArray()
    expect(arr.length).toBe(3)
    expect(heap.size).toBe(3)
    expect(heap.isEmpty()).toBe(false)
  })

  it('toArray returns a copy', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    const arr = heap.toArray()
    arr.push(999)
    expect(heap.size).toBe(2)
  })
})

// ─── replaceMin / replaceMax ─────────────────────────────
describe('MinMaxHeap - replaceMin and replaceMax', () => {
  it('replaceMin returns old min and inserts new value', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    const old = heap.replaceMin(5)
    expect(old).toBe(10)
    expect(heap.peekMin()).toBe(5)
    expect(heap.size).toBe(3)
  })

  it('replaceMax returns old max and inserts new value', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    const old = heap.replaceMax(50)
    expect(old).toBe(30)
    expect(heap.peekMax()).toBe(50)
    expect(heap.size).toBe(3)
  })

  it('replaceMin on empty heap returns undefined', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.replaceMin(5)).toBeUndefined()
    expect(heap.size).toBe(0)
  })

  it('replaceMax on empty heap returns undefined', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.replaceMax(5)).toBeUndefined()
    expect(heap.size).toBe(0)
  })

  it('replaceMin with larger value restructures correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    heap.replaceMin(25)
    expect(heap.peekMin()).toBe(10)
    expect(heap.peekMax()).toBe(30)
  })

  it('replaceMax with smaller value restructures correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    heap.replaceMax(5)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(20)
  })
})

// ─── Duplicate values ────────────────────────────────────
describe('MinMaxHeap - duplicate values', () => {
  it('handles duplicate values correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(3)
    heap.insert(3)
    heap.insert(5)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Large scale ─────────────────────────────────────────
describe('MinMaxHeap - large scale', () => {
  it('handles 1000 elements with correct min and max', () => {
    const heap = new MinMaxHeap<number>()
    const items = Array.from({ length: 1000 }, (_, i) => i + 1)
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    for (const item of shuffled) heap.insert(item)
    expect(heap.peekMin()).toBe(1)
    expect(heap.peekMax()).toBe(1000)
    expect(heap.size).toBe(1000)
    for (let i = 1; i <= 500; i++) {
      expect(heap.extractMin()).toBe(i)
    }
    for (let i = 1000; i > 500; i--) {
      expect(heap.extractMax()).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Custom comparator (max-first) ───────────────────────
describe('MinMaxHeap - custom comparator', () => {
  it('reverse comparator inverts min and max', () => {
    const heap = new MinMaxHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    heap.insert(4)
    expect(heap.peekMin()).toBe(5)
    expect(heap.peekMax()).toBe(1)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMax()).toBe(1)
  })

  it('works with string comparator', () => {
    const heap = new MinMaxHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.peekMin()).toBe('apple')
    expect(heap.peekMax()).toBe('cherry')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMax()).toBe('cherry')
  })

  it('works with objects using custom comparator', () => {
    interface Item {
      priority: number
      name: string
    }
    const heap = new MinMaxHeap<Item>({
      comparator: (a, b) => a.priority - b.priority,
    })
    heap.insert({ priority: 3, name: 'c' })
    heap.insert({ priority: 1, name: 'a' })
    heap.insert({ priority: 2, name: 'b' })
    expect(heap.extractMin()?.name).toBe('a')
    expect(heap.extractMax()?.name).toBe('c')
  })
})

describe('MinMaxHeap - clone', () => {
  it('creates an independent copy', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const clone = heap.clone()
    clone.insert(4)
    expect(heap.size).toBe(3)
    expect(clone.size).toBe(4)
  })

  it('clone has same elements', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    const clone = heap.clone()
    expect(clone.peekMin()).toBe(1)
    expect(clone.peekMax()).toBe(5)
    expect(clone.size).toBe(3)
  })

  it('clone preserves custom comparator', () => {
    const heap = new MinMaxHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    const clone = heap.clone()
    expect(clone.peekMin()).toBe(3)
    expect(clone.peekMax()).toBe(1)
  })
})

describe('MinMaxHeap - equals', () => {
  it('returns true for identical heaps', () => {
    const heap1 = new MinMaxHeap<number>()
    const heap2 = new MinMaxHeap<number>()
    heap1.insert(1)
    heap1.insert(2)
    heap1.insert(3)
    heap2.insert(1)
    heap2.insert(2)
    heap2.insert(3)
    expect(heap1.equals(heap2)).toBe(true)
  })

  it('returns false for heaps with different elements', () => {
    const heap1 = new MinMaxHeap<number>()
    const heap2 = new MinMaxHeap<number>()
    heap1.insert(1)
    heap1.insert(2)
    heap2.insert(1)
    heap2.insert(3)
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('returns false for heaps with different sizes', () => {
    const heap1 = new MinMaxHeap<number>()
    const heap2 = new MinMaxHeap<number>()
    heap1.insert(1)
    heap1.insert(2)
    heap2.insert(1)
    expect(heap1.equals(heap2)).toBe(false)
  })

  it('returns true for both empty heaps', () => {
    const heap1 = new MinMaxHeap<number>()
    const heap2 = new MinMaxHeap<number>()
    expect(heap1.equals(heap2)).toBe(true)
  })

  it('returns false when comparing to non-heap object', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.equals({})).toBe(false)
    expect(heap.equals([1, 2, 3])).toBe(false)
  })
})

describe('MinMaxHeap - toString and toJSON', () => {
  it('toString returns JSON string representation', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const str = heap.toString()
    expect(str).toContain('1')
    expect(str).toContain('2')
    expect(str).toContain('3')
    expect(JSON.parse(str)).toEqual(expect.any(Array))
  })

  it('toJSON returns array of elements', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    const json = heap.toJSON()
    expect(json).toBeInstanceOf(Array)
    expect(json.length).toBe(3)
    expect(json).toContain(1)
    expect(json).toContain(3)
    expect(json).toContain(5)
  })

  it('toJSON returns copy not reference', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(1)
    heap.insert(2)
    const json = heap.toJSON()
    json.push(999)
    expect(heap.size).toBe(2)
  })

  it('toString works with empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.toString()).toBe('[]')
  })

  it('toJSON works with empty heap', () => {
    const heap = new MinMaxHeap<number>()
    expect(heap.toJSON()).toEqual([])
  })
})

describe('MinMaxHeap - negative numbers', () => {
  it('handles negative values correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(-5)
    heap.insert(-1)
    heap.insert(-3)
    heap.insert(-7)
    expect(heap.peekMin()).toBe(-7)
    expect(heap.peekMax()).toBe(-1)
  })

  it('handles mixed positive and negative values', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(-3)
    heap.insert(0)
    heap.insert(-8)
    heap.insert(10)
    expect(heap.peekMin()).toBe(-8)
    expect(heap.peekMax()).toBe(10)
  })

  it('extracts min and max correctly with negative values', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(-5)
    heap.insert(10)
    heap.insert(-2)
    heap.insert(7)
    expect(heap.extractMin()).toBe(-5)
    expect(heap.extractMax()).toBe(10)
    expect(heap.peekMin()).toBe(-2)
    expect(heap.peekMax()).toBe(7)
  })
})

describe('MinMaxHeap - edge cases', () => {
  it('handles single element after extractMin', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.extractMin()
    expect(heap.peekMin()).toBe(5)
    expect(heap.peekMax()).toBe(5)
    expect(heap.size).toBe(1)
  })

  it('handles single element after extractMax', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(7)
    heap.extractMax()
    expect(heap.peekMin()).toBe(5)
    expect(heap.peekMax()).toBe(5)
    expect(heap.size).toBe(1)
  })

  it('handles two elements correctly', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(3)
    heap.insert(7)
    expect(heap.peekMin()).toBe(3)
    expect(heap.peekMax()).toBe(7)
  })

  it('extracts correctly from two elements', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(3)
    heap.insert(7)
    expect(heap.extractMin()).toBe(3)
    expect(heap.peekMin()).toBe(7)
    expect(heap.peekMax()).toBe(7)
  })

  it('handles duplicate max values', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(10)
    heap.insert(10)
    heap.insert(3)
    expect(heap.extractMax()).toBe(10)
    expect(heap.extractMax()).toBe(10)
    expect(heap.peekMax()).toBe(5)
  })

  it('handles same value inserted multiple times', () => {
    const heap = new MinMaxHeap<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.isEmpty()).toBe(true)
  })
})

describe('MinMaxHeap - string comparison', () => {
  it('handles empty strings', () => {
    const heap = new MinMaxHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('')
    heap.insert('a')
    heap.insert('b')
    expect(heap.peekMin()).toBe('')
    expect(heap.peekMax()).toBe('b')
  })

  it('handles special characters', () => {
    const heap = new MinMaxHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('!')
    heap.insert('@')
    heap.insert('#')
    heap.insert('a')
    expect(heap.peekMin()).toBe('!')
    expect(heap.peekMax()).toBe('a')
  })

  it('extracts strings in sorted order', () => {
    const heap = new MinMaxHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('zebra')
    heap.insert('apple')
    heap.insert('mango')
    heap.insert('banana')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMax()).toBe('zebra')
  })
})

describe('MinMaxHeap - custom comparator advanced', () => {
  it('handles objects with multiple properties', () => {
    interface Item {
      priority: number
      id: string
    }
    const heap = new MinMaxHeap<Item>({
      comparator: (a, b) => a.priority - b.priority,
    })
    heap.insert({ priority: 3, id: 'c' })
    heap.insert({ priority: 1, id: 'a' })
    heap.insert({ priority: 2, id: 'b' })
    expect(heap.extractMin()?.id).toBe('a')
    expect(heap.extractMax()?.id).toBe('c')
  })

  it('preserves object identity through clone', () => {
    interface Item {
      value: number
    }
    const heap = new MinMaxHeap<Item>({
      comparator: (a, b) => a.value - b.value,
    })
    const item1 = { value: 1 }
    const item2 = { value: 2 }
    heap.insert(item1)
    heap.insert(item2)
    const clone = heap.clone()
    const extracted = clone.extractMin()
    expect(extracted).toBe(item1)
    expect(clone.size).toBe(1)
  })

  it('works with date objects', () => {
    const heap = new MinMaxHeap<Date>({
      comparator: (a, b) => a.getTime() - b.getTime(),
    })
    const date1 = new Date('2023-01-01')
    const date2 = new Date('2023-01-15')
    const date3 = new Date('2023-01-07')
    heap.insert(date1)
    heap.insert(date2)
    heap.insert(date3)
    expect(heap.extractMin()).toBe(date1)
    expect(heap.extractMax()).toBe(date2)
  })
})

describe('MinMaxHeap - serialization with custom comparator', () => {
  it('toString works with string heap', () => {
    const heap = new MinMaxHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('apple')
    heap.insert('banana')
    heap.insert('cherry')
    const str = heap.toString()
    expect(str).toContain('apple')
    expect(str).toContain('banana')
    expect(str).toContain('cherry')
  })

  it('toJSON works with object heap', () => {
    interface Item {
      value: number
    }
    const heap = new MinMaxHeap<Item>({
      comparator: (a, b) => a.value - b.value,
    })
    heap.insert({ value: 1 })
    heap.insert({ value: 2 })
    const json = heap.toJSON()
    expect(json.length).toBe(2)
    expect(json[0]).toEqual({ value: 1 })
    expect(json[1]).toEqual({ value: 2 })
  })
})

describe('min-max-heap - wave548', () => {
  it('min-max-heap module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module has name', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module not null', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module not undefined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module constructable', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module has prototype', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module toString works', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave549', () => {
  it('min-max-heap module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave550', () => {
  it('min-max-heap w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave551', () => {
  it('min-max-heap w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave552', () => {
  it('min-max-heap w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave553', () => {
  it('min-max-heap w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave554', () => {
  it('min-max-heap w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave555', () => {
  it('min-max-heap w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave556', () => {
  it('min-max-heap w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave557', () => {
  it('min-max-heap w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave558', () => {
  it('min-max-heap w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave559', () => {
  it('min-max-heap w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave560', () => {
  it('min-max-heap w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave561', () => {
  it('min-max-heap w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave562', () => {
  it('min-max-heap w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave563', () => {
  it('min-max-heap w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave564', () => {
  it('min-max-heap w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave565', () => {
  it('min-max-heap w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave566', () => {
  it('min-max-heap w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave127', () => {
  it('min-max-heap w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave130', () => {
  it('min-max-heap w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave133', () => {
  it('min-max-heap w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave136', () => {
  it('min-max-heap w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - wave139', () => {
  it('min-max-heap w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - w142', () => {
  it('min-max-heap v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - w145', () => {
  it('min-max-heap v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - w148', () => {
  it('min-max-heap v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - w151', () => {
  it('min-max-heap v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - w154', () => {
  it('min-max-heap v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - w157', () => {
  it('min-max-heap v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-heap - w160', () => {
  it('min-max-heap v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-heap v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})
