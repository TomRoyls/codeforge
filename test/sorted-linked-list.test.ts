import { describe, expect, it } from 'vitest'

import { SortedLinkedList } from '../src/core/sorted-linked-list/index.js'

// ─── Construction ──────────────────────────────────────
describe('SortedLinkedList construction', () => {
  it('creates an empty list', () => {
    const list = new SortedLinkedList<number>()
    expect(list.size).toBe(0)
    expect(list.isEmpty).toBe(true)
  })

  it('creates with custom comparator', () => {
    const list = new SortedLinkedList<number>({
      comparator: (a, b) => b - a,
    })
    list.insert(1)
    list.insert(2)
    list.insert(3)
    expect(list.toArray()).toEqual([3, 2, 1])
  })
})

// ─── Insert ────────────────────────────────────────────
describe('SortedLinkedList insert', () => {
  it('inserts elements in sorted order', () => {
    const list = new SortedLinkedList<number>()
    list.insert(3)
    list.insert(1)
    list.insert(2)
    expect(list.toArray()).toEqual([1, 2, 3])
  })

  it('handles duplicate values', () => {
    const list = new SortedLinkedList<number>()
    list.insert(2)
    list.insert(2)
    list.insert(1)
    expect(list.toArray()).toEqual([1, 2, 2])
    expect(list.size).toBe(3)
  })

  it('inserts at head when smallest', () => {
    const list = new SortedLinkedList<number>()
    list.insert(5)
    list.insert(3)
    list.insert(1)
    expect(list.min()).toBe(1)
  })
})

// ─── Delete ────────────────────────────────────────────
describe('SortedLinkedList delete', () => {
  it('deletes existing element', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    list.insert(2)
    list.insert(3)
    expect(list.delete(2)).toBe(true)
    expect(list.toArray()).toEqual([1, 3])
    expect(list.size).toBe(2)
  })

  it('deletes head element', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    list.insert(2)
    expect(list.delete(1)).toBe(true)
    expect(list.toArray()).toEqual([2])
  })

  it('returns false for missing element', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    expect(list.delete(99)).toBe(false)
  })

  it('returns false on empty list', () => {
    const list = new SortedLinkedList<number>()
    expect(list.delete(1)).toBe(false)
  })
})

// ─── Has ───────────────────────────────────────────────
describe('SortedLinkedList has', () => {
  it('returns true for existing element', () => {
    const list = new SortedLinkedList<number>()
    list.insert(5)
    expect(list.has(5)).toBe(true)
    expect(list.has(6)).toBe(false)
  })

  it('returns false on empty list', () => {
    const list = new SortedLinkedList<number>()
    expect(list.has(1)).toBe(false)
  })
})

// ─── Get ───────────────────────────────────────────────
describe('SortedLinkedList get', () => {
  it('returns element at index', () => {
    const list = new SortedLinkedList<number>()
    list.insert(3)
    list.insert(1)
    list.insert(2)
    expect(list.get(0)).toBe(1)
    expect(list.get(1)).toBe(2)
    expect(list.get(2)).toBe(3)
  })

  it('returns undefined for out-of-bounds', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    expect(list.get(-1)).toBeUndefined()
    expect(list.get(5)).toBeUndefined()
  })
})

// ─── Min & Max ─────────────────────────────────────────
describe('SortedLinkedList min and max', () => {
  it('returns min and max', () => {
    const list = new SortedLinkedList<number>()
    list.insert(3)
    list.insert(1)
    list.insert(5)
    expect(list.min()).toBe(1)
    expect(list.max()).toBe(5)
  })

  it('returns undefined on empty list', () => {
    const list = new SortedLinkedList<number>()
    expect(list.min()).toBeUndefined()
    expect(list.max()).toBeUndefined()
  })
})

// ─── IndexOf ───────────────────────────────────────────
describe('SortedLinkedList indexOf', () => {
  it('returns index of element', () => {
    const list = new SortedLinkedList<number>()
    list.insert(10)
    list.insert(20)
    list.insert(30)
    expect(list.indexOf(20)).toBe(1)
  })

  it('returns -1 for missing element', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    expect(list.indexOf(99)).toBe(-1)
  })
})

// ─── Range ─────────────────────────────────────────────
describe('SortedLinkedList range', () => {
  it('returns elements in range', () => {
    const list = new SortedLinkedList<number>()
    for (let i = 1; i <= 5; i++) list.insert(i)
    expect(list.range(2, 4)).toEqual([2, 3, 4])
  })

  it('returns all elements when no bounds', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    list.insert(2)
    expect(list.range()).toEqual([1, 2])
  })

  it('returns empty for non-overlapping range', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    list.insert(2)
    expect(list.range(10, 20)).toEqual([])
  })
})

// ─── Iteration & ForEach ───────────────────────────────
describe('SortedLinkedList iteration', () => {
  it('forEach iterates in order', () => {
    const list = new SortedLinkedList<number>()
    list.insert(3)
    list.insert(1)
    list.insert(2)
    const result: number[] = []
    list.forEach((v) => result.push(v))
    expect(result).toEqual([1, 2, 3])
  })

  it('is iterable with for-of', () => {
    const list = new SortedLinkedList<number>()
    list.insert(2)
    list.insert(1)
    expect([...list]).toEqual([1, 2])
  })

  it('iterator() returns an iterator', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    list.insert(2)
    const iter = list.iterator()
    expect(iter.next()).toEqual({ value: 1, done: false })
    expect(iter.next()).toEqual({ value: 2, done: false })
    expect(iter.next()).toEqual({ value: undefined, done: true })
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SortedLinkedList clear', () => {
  it('clears the list', () => {
    const list = new SortedLinkedList<number>()
    list.insert(1)
    list.insert(2)
    list.clear()
    expect(list.size).toBe(0)
    expect(list.isEmpty).toBe(true)
    expect(list.toArray()).toEqual([])
  })
})

// ─── String values ─────────────────────────────────────
describe('SortedLinkedList with strings', () => {
  it('sorts strings correctly', () => {
    const list = new SortedLinkedList<string>()
    list.insert('cherry')
    list.insert('apple')
    list.insert('banana')
    expect(list.toArray()).toEqual(['apple', 'banana', 'cherry'])
  })
})
