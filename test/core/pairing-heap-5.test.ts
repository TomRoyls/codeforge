import { describe, expect, it } from 'vitest'
import { PairingHeap5, PairingHeapNode5 } from '../../src/core/pairing-heap-5/index.js'

// ─── Constructor ───

describe('PairingHeap5 constructor', () => {
  it('creates an empty heap with default comparator', () => {
    const heap = new PairingHeap5<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
  })

  it('creates a heap with a custom comparator (max-heap)', () => {
    const heap = new PairingHeap5<number>((a, b) => b - a)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    expect(heap.peek()).toBe(3)
  })
})

// ─── Insert ───

describe('PairingHeap5 insert', () => {
  it('inserts a single element', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(5)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.peek()).toBe(5)
  })

  it('inserts multiple elements and maintains min', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    expect(heap.size).toBe(4)
    expect(heap.peek()).toBe(1)
  })

  it('handles duplicate values', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(3)
    heap.insert(3)
    heap.insert(3)
    expect(heap.size).toBe(3)
    expect(heap.peek()).toBe(3)
  })

  it('handles negative values', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(-5)
    heap.insert(3)
    heap.insert(-10)
    expect(heap.peek()).toBe(-10)
  })
})

// ─── ExtractMin ───

describe('PairingHeap5 extractMin', () => {
  it('extracts elements in sorted order', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(4)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBeUndefined()
  })

  it('returns undefined on empty heap', () => {
    const heap = new PairingHeap5<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('updates size after extraction', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(1)
    heap.insert(2)
    heap.extractMin()
    expect(heap.size).toBe(1)
    heap.extractMin()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles single element extraction', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(42)
    expect(heap.extractMin()).toBe(42)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
  })
})

// ─── Peek ───

describe('PairingHeap5 peek', () => {
  it('returns min without removing', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.peek()).toBe(1)
    expect(heap.peek()).toBe(1)
    expect(heap.size).toBe(3)
  })

  it('returns undefined on empty heap', () => {
    const heap = new PairingHeap5<number>()
    expect(heap.peek()).toBeUndefined()
  })
})

// ─── Merge ───

describe('PairingHeap5 merge', () => {
  it('merges two heaps', () => {
    const heap1 = new PairingHeap5<number>()
    heap1.insert(1)
    heap1.insert(4)
    const heap2 = new PairingHeap5<number>()
    heap2.insert(2)
    heap2.insert(3)
    heap1.merge(heap2)
    expect(heap1.size).toBe(4)
    expect(heap2.size).toBe(0)
    expect(heap2.isEmpty()).toBe(true)
    expect(heap1.extractMin()).toBe(1)
    expect(heap1.extractMin()).toBe(2)
    expect(heap1.extractMin()).toBe(3)
    expect(heap1.extractMin()).toBe(4)
  })

  it('merges into empty heap', () => {
    const heap1 = new PairingHeap5<number>()
    const heap2 = new PairingHeap5<number>()
    heap2.insert(5)
    heap2.insert(3)
    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.extractMin()).toBe(3)
    expect(heap1.extractMin()).toBe(5)
  })

  it('merges empty heap into non-empty', () => {
    const heap1 = new PairingHeap5<number>()
    heap1.insert(1)
    const heap2 = new PairingHeap5<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(1)
    expect(heap1.peek()).toBe(1)
  })

  it('no-op when merging with itself', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(1)
    heap.insert(2)
    heap.merge(heap)
    expect(heap.size).toBe(2)
  })
})

// ─── DecreaseKey ───

describe('PairingHeap5 decreaseKey', () => {
  it('decreases key of the root node (no-op on structure)', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(5)
    heap.insert(10)
    heap.insert(3)
    const node = new PairingHeapNode5(3)
    heap.decreaseKey(node, 1)
    expect(heap.size).toBe(3)
  })

  it('handles decreaseKey on orphan node gracefully', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(1)
    heap.insert(5)
    const orphan = new PairingHeapNode5(10)
    heap.decreaseKey(orphan, 2)
    expect(heap.size).toBe(2)
    expect(heap.peek()).toBe(1)
  })
})

// ─── Clear ───

describe('PairingHeap5 clear', () => {
  it('clears the heap', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
  })
})

// ─── ToArray ───

describe('PairingHeap5 toArray', () => {
  it('returns sorted array', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(2)
    expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('returns empty array for empty heap', () => {
    const heap = new PairingHeap5<number>()
    expect(heap.toArray()).toEqual([])
  })

  it('preserves heap state after toArray', () => {
    const heap = new PairingHeap5<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    heap.toArray()
    expect(heap.size).toBe(3)
    expect(heap.peek()).toBe(1)
  })
})

// ─── FromArray ───

describe('PairingHeap5 fromArray', () => {
  it('creates heap from array', () => {
    const heap = PairingHeap5.fromArray([5, 3, 1, 4, 2])
    expect(heap.size).toBe(5)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBe(4)
    expect(heap.extractMin()).toBe(5)
  })

  it('creates heap from empty array', () => {
    const heap = PairingHeap5.fromArray([])
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('creates heap with custom comparator', () => {
    const heap = PairingHeap5.fromArray([1, 2, 3], (a, b) => b - a)
    expect(heap.peek()).toBe(3)
  })
})

// ─── PairingHeapNode5 ───

describe('PairingHeapNode5', () => {
  it('creates node with value', () => {
    const node = new PairingHeapNode5(42)
    expect(node.value).toBe(42)
    expect(node.children).toEqual([])
    expect(node.parent).toBeUndefined()
  })
})

// ─── String values ───

describe('PairingHeap5 with strings', () => {
  it('works with string values', () => {
    const heap = new PairingHeap5<string>()
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
  })
})
