import { describe, it, expect } from 'vitest'
import { BinomialHeap } from '../../src/utils/binomial-heap.js'

describe('BinomialHeap', () => {
  it('creates empty heap', () => {
    const heap = new BinomialHeap<string>()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
    expect(heap.peek()).toBeUndefined()
  })

  it('inserts single element', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(10, 1)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.size).toBe(1)
  })

  it('inserts multiple elements in order', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(10, 1)
    heap.insert(20, 2)
    heap.insert(30, 3)
    expect(heap.size).toBe(3)
  })

  it('inserts multiple elements out of order', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(30, 3)
    heap.insert(10, 1)
    heap.insert(20, 2)
    expect(heap.size).toBe(3)
    const min = heap.peek()
    expect(min).toBeDefined()
    expect(min!.value).toBe(10)
    expect(min!.priority).toBe(1)
  })

  it('extracts minimum element', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(30, 3)
    heap.insert(10, 1)
    heap.insert(20, 2)
    const result = heap.extractMin()
    expect(result).toBeDefined()
    expect(result!.value).toBe(10)
    expect(result!.priority).toBe(1)
  })

  it('extracts elements in priority order', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(10, 1)
    heap.insert(20, 2)
    heap.insert(30, 3)
    heap.insert(50, 5)
    heap.insert(40, 4)

    const result1 = heap.extractMin()
    expect(result1).toBeDefined()
    expect(result1!.value).toBe(10)

    const result2 = heap.extractMin()
    expect(result2).toBeDefined()
    expect(result2!.value).toBe(20)

    const result3 = heap.extractMin()
    expect(result3).toBeDefined()
    expect(result3!.value).toBe(30)
  })

  it('handles duplicate priorities', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(10, 1)
    heap.insert(20, 1)
    heap.insert(30, 2)
    heap.insert(40, 1)

    const result1 = heap.extractMin()
    expect(result1).toBeDefined()
    expect([10, 20, 40]).toContain(result1!.value)
    expect(result1!.priority).toBe(1)

    const result2 = heap.extractMin()
    expect(result2).toBeDefined()
    expect([10, 20, 40].filter(v => v !== result1!.value)).toContain(result2!.value)
  })

  it('peeks at minimum without removing', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(30, 3)
    heap.insert(10, 1)
    heap.insert(20, 2)

    const peek1 = heap.peek()
    expect(peek1!.value).toBe(10)
    expect(peek1!.priority).toBe(1)
    expect(heap.size).toBe(3)

    const peek2 = heap.peek()
    expect(peek2!.value).toBe(10)
    expect(heap.size).toBe(3)
  })

  it('merges two non-empty heaps', () => {
    const heap1 = new BinomialHeap<number>()
    heap1.insert(10, 1)
    heap1.insert(30, 3)

    const heap2 = new BinomialHeap<number>()
    heap2.insert(20, 2)
    heap2.insert(40, 4)

    heap1.merge(heap2)
    expect(heap1.size).toBeGreaterThan(0)

    const result1 = heap1.extractMin()
    expect(result1).toBeDefined()
    expect(result1!.value).toBe(10)

    const result2 = heap1.extractMin()
    expect(result2).toBeDefined()
    expect(result2!.value).toBe(20)
  })

  it('merges with empty heap', () => {
    const heap1 = new BinomialHeap<number>()
    heap1.insert(10, 1)
    heap1.insert(20, 2)

    const heap2 = new BinomialHeap<number>()

    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.peek()!.value).toBe(10)
  })

  it('handles negative priorities', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(10, -5)
    heap.insert(20, -10)
    heap.insert(30, 0)

    const result = heap.extractMin()
    expect(result!.value).toBe(20)
    expect(result!.priority).toBe(-10)
  })

  it('handles same priority different values', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(10, 1)
    heap.insert(20, 1)
    heap.insert(30, 1)

    expect(heap.size).toBe(3)
    const extracted = heap.extractMin()!
    expect([10, 20, 30]).toContain(extracted.value)
    expect(extracted.priority).toBe(1)
  })

  it('extracts from empty heap', () => {
    const heap = new BinomialHeap<number>()
    const result = heap.extractMin()
    expect(result).toBeUndefined()
  })

  it('peeks empty heap', () => {
    const heap = new BinomialHeap<number>()
    const result = heap.peek()
    expect(result).toBeUndefined()
  })

  it('tracks size correctly through multiple operations', () => {
    const heap = new BinomialHeap<number>()
    expect(heap.size).toBe(0)

    heap.insert(10, 1)
    expect(heap.size).toBe(1)

    heap.insert(20, 2)
    expect(heap.size).toBe(2)

    heap.extractMin()

    heap.insert(30, 3)
    expect(heap.size).toBeGreaterThan(0)

    heap.extractMin()
    heap.extractMin()
  })

  it('handles string values', () => {
    const heap = new BinomialHeap<string>()
    heap.insert('apple', 2)
    heap.insert('banana', 1)
    heap.insert('cherry', 3)

    const result = heap.extractMin()
    expect(result!.value).toBe('banana')
    expect(result!.priority).toBe(1)
  })

  it('handles object values', () => {
    const heap = new BinomialHeap<{ id: number; name: string }>()
    heap.insert({ id: 1, name: 'first' }, 2)
    heap.insert({ id: 2, name: 'second' }, 1)
    heap.insert({ id: 3, name: 'third' }, 3)

    const result = heap.extractMin()
    expect(result!.value.id).toBe(2)
    expect(result!.value.name).toBe('second')
  })

  it('maintains heap property after many inserts', () => {
    const heap = new BinomialHeap<number>()
    const values = [100, 50, 75, 25, 125, 150, 10, 5, 200, 175]

    for (const value of values) {
      heap.insert(value, value)
    }

    const min1 = heap.extractMin()
    expect(min1).toBeDefined()
    expect(min1!.value).toBe(5)

    const min2 = heap.extractMin()
    expect(min2).toBeDefined()
    expect(min2!.value).toBe(10)

    const min3 = heap.extractMin()
    expect(min3).toBeDefined()
    expect(min3!.value).toBe(25)
  })

  it('isEmpty on empty heap', () => {
    const heap = new BinomialHeap<number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('insert increases size', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(5, 5)
    heap.insert(3, 3)
    expect(heap.size).toBe(2)
  })

  it('peek returns min without removing', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(5, 5)
    heap.insert(3, 3)
    const peeked = heap.peek()
    expect(peeked).not.toBeUndefined()
    expect(heap.size).toBe(2)
  })

  it('extractMin returns minimum priority item', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(5, 5)
    heap.insert(3, 3)
    heap.insert(7, 7)
    const result = heap.extractMin()
    expect(result!.value).toBe(3)
  })

  it('isEmpty on empty heap returns true', () => {
    const heap = new BinomialHeap<number, number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('insert then not empty', () => {
    const heap = new BinomialHeap<number, number>()
    heap.insert(5, 5)
    expect(heap.isEmpty()).toBe(false)
  })

  it('isEmpty on new heap is true', () => {
    const heap = new BinomialHeap<number, number>()
    expect(heap.isEmpty()).toBe(true)
  })
})

describe('BinomialHeap toString', () => {
  it('returns string representation', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(1, 5)
    heap.insert(2, 3)
    const str = heap.toString()
    expect(typeof str).toBe('string')
    expect(str.length).toBeGreaterThan(0)
  })

  it('works on empty heap', () => {
    const heap = new BinomialHeap<number>()
    expect(typeof heap.toString()).toBe('string')
  })
})

describe('BinomialHeap toJSON', () => {
  it('returns array of entries', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(1, 5)
    heap.insert(2, 3)
    const json = heap.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(2)
  })

  it('returns empty array for empty heap', () => {
    const heap = new BinomialHeap<number>()
    expect(heap.toJSON()).toEqual([])
  })

  it('produces valid JSON', () => {
    const heap = new BinomialHeap<string>()
    heap.insert('a', 1)
    const str = JSON.stringify(heap.toJSON())
    expect(str).toContain('a')
  })
})

describe('BinomialHeap clone', () => {
  it('creates independent copy', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(1, 5)
    heap.insert(2, 3)
    const copy = heap.clone()
    copy.insert(3, 1)
    expect(heap.size).toBe(2)
    expect(copy.size).toBe(3)
  })

  it('preserves all elements', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(1, 3)
    heap.insert(2, 1)
    heap.insert(3, 2)
    const copy = heap.clone()
    expect(copy.size).toBe(3)
    const min = copy.extractMin()
    expect(min!.priority).toBe(1)
  })

  it('clone of empty heap is empty', () => {
    const heap = new BinomialHeap<number>()
    const copy = heap.clone()
    expect(copy.isEmpty()).toBe(true)
  })

  it('clone preserves all elements', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(1, 5)
    heap.insert(2, 3)
    heap.insert(3, 7)
    const copy = heap.clone()
    const originalItems = heap.toJSON().sort((a, b) => a.priority - b.priority)
    const copyItems = copy.toJSON().sort((a, b) => a.priority - b.priority)
    expect(copyItems).toEqual(originalItems)
    expect(copy.size).toBe(heap.size)
  })
})

describe('BinomialHeap equals', () => {
  it('same heap equals itself', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(1, 5)
    expect(heap.equals(heap)).toBe(true)
  })

  it('heaps with same elements are equal', () => {
    const a = new BinomialHeap<number>()
    a.insert(1, 5)
    a.insert(2, 3)
    const b = new BinomialHeap<number>()
    b.insert(2, 3)
    b.insert(1, 5)
    expect(a.equals(b)).toBe(true)
  })

  it('different sizes not equal', () => {
    const a = new BinomialHeap<number>()
    a.insert(1, 5)
    const b = new BinomialHeap<number>()
    b.insert(1, 5)
    b.insert(2, 3)
    expect(a.equals(b)).toBe(false)
  })

  it('non-BinomialHeap returns false', () => {
    const heap = new BinomialHeap<number>()
    heap.insert(1, 5)
    expect(heap.equals(null)).toBe(false)
    expect(heap.equals({})).toBe(false)
  })

  it('empty heaps are equal', () => {
    const a = new BinomialHeap<number>()
    const b = new BinomialHeap<number>()
    expect(a.equals(b)).toBe(true)
  })
})