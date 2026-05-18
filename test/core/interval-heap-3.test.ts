import { describe, it, expect } from 'vitest'
import { IntervalHeap3 } from '../../src/core/interval-heap-3/index.js'

// ─── Constructor & Empty State ───

describe('IntervalHeap3 - constructor & empty state', () => {
  it('creates an empty interval heap', () => {
    const h = new IntervalHeap3<number>()
    expect(h.size).toBe(0)
    expect(h.isEmpty()).toBe(true)
  })

  it('creates a heap with custom comparator', () => {
    const h = new IntervalHeap3<number>((a, b) => b - a)
    h.insert(1)
    h.insert(3)
    h.insert(2)
    expect(h.getMin()).toBe(3)
    expect(h.getMax()).toBe(1)
  })

  it('getMin returns undefined on empty heap', () => {
    const h = new IntervalHeap3<number>()
    expect(h.getMin()).toBeUndefined()
  })

  it('getMax returns undefined on empty heap', () => {
    const h = new IntervalHeap3<number>()
    expect(h.getMax()).toBeUndefined()
  })

  it('extractMin returns undefined on empty heap', () => {
    const h = new IntervalHeap3<number>()
    expect(h.extractMin()).toBeUndefined()
  })

  it('extractMax returns undefined on empty heap', () => {
    const h = new IntervalHeap3<number>()
    expect(h.extractMax()).toBeUndefined()
  })
})

// ─── Insert & GetMin/GetMax ───

describe('IntervalHeap3 - insert & getMin/getMax', () => {
  it('inserts a single element: min and max are the same', () => {
    const h = new IntervalHeap3<number>()
    h.insert(42)
    expect(h.size).toBe(1)
    expect(h.getMin()).toBe(42)
    expect(h.getMax()).toBe(42)
  })

  it('with two elements: getMin and getMax return correct values', () => {
    const h = new IntervalHeap3<number>()
    h.insert(5)
    h.insert(10)
    expect(h.getMin()).toBe(5)
    expect(h.getMax()).toBe(10)
  })

  it('with many elements: tracks min and max correctly', () => {
    const h = new IntervalHeap3<number>()
    h.insert(5)
    h.insert(2)
    h.insert(8)
    h.insert(1)
    h.insert(9)
    expect(h.getMin()).toBe(1)
    expect(h.getMax()).toBe(9)
  })

  it('maintains correct size', () => {
    const h = new IntervalHeap3<number>()
    for (let i = 0; i < 15; i++) {
      h.insert(i)
    }
    expect(h.size).toBe(15)
  })
})

// ─── ExtractMin ───

describe('IntervalHeap3 - extractMin', () => {
  it('extracts the only element', () => {
    const h = new IntervalHeap3<number>()
    h.insert(7)
    expect(h.extractMin()).toBe(7)
    expect(h.size).toBe(0)
    expect(h.isEmpty()).toBe(true)
  })

  it('extracts min from two elements', () => {
    const h = new IntervalHeap3<number>()
    h.insert(10)
    h.insert(5)
    expect(h.extractMin()).toBe(5)
    expect(h.size).toBe(1)
    expect(h.getMin()).toBe(10)
  })

  it('extracts elements in ascending order', () => {
    const h = new IntervalHeap3<number>()
    const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
    for (const v of values) {
      h.insert(v)
    }
    const result: number[] = []
    while (!h.isEmpty()) {
      result.push(h.extractMin()!)
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('handles duplicate values', () => {
    const h = new IntervalHeap3<number>()
    h.insert(3)
    h.insert(3)
    h.insert(1)
    expect(h.extractMin()).toBe(1)
    expect(h.extractMin()).toBe(3)
    expect(h.extractMin()).toBe(3)
  })
})

// ─── ExtractMax ───

describe('IntervalHeap3 - extractMax', () => {
  it('extracts the only element', () => {
    const h = new IntervalHeap3<number>()
    h.insert(7)
    expect(h.extractMax()).toBe(7)
    expect(h.size).toBe(0)
  })

  it('extracts max from two elements', () => {
    const h = new IntervalHeap3<number>()
    h.insert(5)
    h.insert(10)
    expect(h.extractMax()).toBe(10)
    expect(h.size).toBe(1)
  })

  it('extracts elements in descending order', () => {
    const h = new IntervalHeap3<number>()
    const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
    for (const v of values) {
      h.insert(v)
    }
    const result: number[] = []
    while (!h.isEmpty()) {
      result.push(h.extractMax()!)
    }
    expect(result).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
  })

  it('interleaved extractMin and extractMax', () => {
    const h = new IntervalHeap3<number>()
    h.insert(5)
    h.insert(2)
    h.insert(8)
    h.insert(1)
    h.insert(9)
    expect(h.extractMin()).toBe(1)
    expect(h.extractMax()).toBe(9)
    expect(h.extractMin()).toBe(2)
    expect(h.extractMax()).toBe(8)
    expect(h.extractMin()).toBe(5)
  })
})

// ─── Clear ───

describe('IntervalHeap3 - clear', () => {
  it('clears all elements', () => {
    const h = new IntervalHeap3<number>()
    h.insert(1)
    h.insert(2)
    h.insert(3)
    h.clear()
    expect(h.size).toBe(0)
    expect(h.isEmpty()).toBe(true)
    expect(h.getMin()).toBeUndefined()
    expect(h.getMax()).toBeUndefined()
  })
})

// ─── ToArray ───

describe('IntervalHeap3 - toArray', () => {
  it('returns internal array representation', () => {
    const h = new IntervalHeap3<number>()
    h.insert(3)
    h.insert(1)
    h.insert(2)
    const arr = h.toArray()
    expect(arr.length).toBe(3)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
    expect(arr).toContain(3)
  })

  it('returns empty array for empty heap', () => {
    const h = new IntervalHeap3<number>()
    expect(h.toArray()).toEqual([])
  })
})

// ─── String values ───

describe('IntervalHeap3 - string values', () => {
  it('works with string values', () => {
    const h = new IntervalHeap3<string>()
    h.insert('cherry')
    h.insert('apple')
    h.insert('banana')
    expect(h.getMin()).toBe('apple')
    expect(h.getMax()).toBe('cherry')
    expect(h.extractMin()).toBe('apple')
    expect(h.extractMax()).toBe('cherry')
    expect(h.extractMin()).toBe('banana')
  })
})

// ─── Object values with custom comparator ───

describe('IntervalHeap3 - object values', () => {
  it('works with objects using custom comparator', () => {
    interface Item { priority: number; label: string }
    const h = new IntervalHeap3<Item>((a, b) => a.priority - b.priority)
    h.insert({ priority: 3, label: 'low' })
    h.insert({ priority: 1, label: 'high' })
    h.insert({ priority: 2, label: 'medium' })
    expect(h.getMin()!.label).toBe('high')
    expect(h.getMax()!.label).toBe('low')
  })
})
