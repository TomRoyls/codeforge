import { describe, it, expect } from 'vitest'
import { RadixHeap3 } from '../../src/core/radix-heap-3/index.js'

// ─── Constructor & Empty State ───

describe('RadixHeap3 - constructor & empty state', () => {
  it('creates an empty heap with default keyBits', () => {
    const heap = new RadixHeap3<string>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.keyBits).toBe(32)
  })

  it('creates a heap with custom keyBits', () => {
    const heap = new RadixHeap3<string>(16)
    expect(heap.keyBits).toBe(16)
  })

  it('peek returns undefined on empty heap', () => {
    const heap = new RadixHeap3<string>()
    expect(heap.peek()).toBeUndefined()
  })

  it('extractMin returns undefined on empty heap', () => {
    const heap = new RadixHeap3<string>()
    expect(heap.extractMin()).toBeUndefined()
  })
})

// ─── Insert & Peek ───

describe('RadixHeap3 - insert & peek', () => {
  it('inserts a single element', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(5, 'five')
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
  })

  it('peek returns the minimum element', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(5, 'five')
    heap.insert(2, 'two')
    heap.insert(8, 'eight')
    const min = heap.peek()!
    expect(min.key).toBe(2)
    expect(min.value).toBe('two')
  })

  it('maintains correct size after multiple inserts', () => {
    const heap = new RadixHeap3<string>()
    for (let i = 0; i < 10; i++) {
      heap.insert(i, `val-${i}`)
    }
    expect(heap.size).toBe(10)
  })

  it('handles same-key inserts', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(5, 'a')
    heap.insert(5, 'b')
    expect(heap.size).toBe(2)
    const min = heap.peek()!
    expect(min.key).toBe(5)
  })
})

// ─── ExtractMin ───

describe('RadixHeap3 - extractMin', () => {
  it('extracts the only element', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(7, 'seven')
    const result = heap.extractMin()!
    expect(result.key).toBe(7)
    expect(result.value).toBe('seven')
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('extracts elements in key order', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(5, 'five')
    heap.insert(3, 'three')
    heap.insert(8, 'eight')
    heap.insert(1, 'one')
    heap.insert(9, 'nine')
    const result: Array<{ key: number; value: string }> = []
    while (!heap.isEmpty()) {
      result.push(heap.extractMin()!)
    }
    expect(result.map(r => r.key)).toEqual([1, 3, 5, 8, 9])
    expect(result.map(r => r.value)).toEqual(['one', 'three', 'five', 'eight', 'nine'])
  })

  it('handles duplicate keys', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(3, 'a')
    heap.insert(3, 'b')
    heap.insert(1, 'c')
    heap.insert(3, 'd')
    const first = heap.extractMin()!
    expect(first.key).toBe(1)
    expect(first.value).toBe('c')
    expect(heap.size).toBe(3)
  })

  it('correctly redistributes buckets after extractMin', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(10, 'ten')
    heap.insert(5, 'five')
    heap.insert(20, 'twenty')
    heap.insert(15, 'fifteen')
    expect(heap.extractMin()!.key).toBe(5)
    expect(heap.extractMin()!.key).toBe(10)
    expect(heap.extractMin()!.key).toBe(15)
    expect(heap.extractMin()!.key).toBe(20)
  })
})

// ─── DecreaseKey ───

describe('RadixHeap3 - decreaseKey', () => {
  it('decreases a key successfully', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(10, 'item')
    heap.insert(5, 'other')
    expect(heap.decreaseKey(10, 2, 'item')).toBe(true)
    expect(heap.size).toBe(2)
    const min = heap.extractMin()!
    expect(min.key).toBe(2)
    expect(min.value).toBe('item')
  })

  it('returns false when new key is larger', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(5, 'item')
    expect(heap.decreaseKey(5, 10, 'item')).toBe(false)
    expect(heap.size).toBe(1)
  })

  it('returns false when item not found', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(5, 'item')
    expect(heap.decreaseKey(5, 1, 'nonexistent')).toBe(false)
  })
})

// ─── Clear ───

describe('RadixHeap3 - clear', () => {
  it('clears all elements', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(1, 'a')
    heap.insert(2, 'b')
    heap.insert(3, 'c')
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
  })

  it('allows inserts after clear', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(10, 'ten')
    heap.extractMin()
    heap.clear()
    heap.insert(5, 'five')
    expect(heap.size).toBe(1)
    expect(heap.peek()!.key).toBe(5)
  })
})

// ─── Monotone property ───

describe('RadixHeap3 - monotone insertion', () => {
  it('handles inserting keys after extraction (monotone property reset)', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(10, 'a')
    heap.insert(20, 'b')
    heap.extractMin()
    heap.insert(5, 'c')
    const min = heap.peek()!
    expect(min.key).toBe(5)
  })
})

// ─── Large sequential keys ───

describe('RadixHeap3 - large dataset', () => {
  it('handles 50 sequential elements', () => {
    const heap = new RadixHeap3<string>()
    for (let i = 50; i >= 1; i--) {
      heap.insert(i, `val-${i}`)
    }
    for (let i = 1; i <= 50; i++) {
      const result = heap.extractMin()!
      expect(result.key).toBe(i)
      expect(result.value).toBe(`val-${i}`)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── Number values ───

describe('RadixHeap3 - number values', () => {
  it('works with number values', () => {
    const heap = new RadixHeap3<number>()
    heap.insert(3, 300)
    heap.insert(1, 100)
    heap.insert(2, 200)
    expect(heap.extractMin()!.value).toBe(100)
    expect(heap.extractMin()!.value).toBe(200)
    expect(heap.extractMin()!.value).toBe(300)
  })
})

// ─── Key zero ───

describe('RadixHeap3 - edge case keys', () => {
  it('handles key zero', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(0, 'zero')
    heap.insert(5, 'five')
    expect(heap.peek()!.key).toBe(0)
    expect(heap.extractMin()!.value).toBe('zero')
  })

  it('handles large key values', () => {
    const heap = new RadixHeap3<string>()
    heap.insert(1000000, 'large')
    heap.insert(1, 'small')
    expect(heap.extractMin()!.key).toBe(1)
    expect(heap.extractMin()!.key).toBe(1000000)
  })
})
