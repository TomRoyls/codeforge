import { describe, it, expect } from 'vitest'
import { Pagoda2 } from '../../src/core/pagoda-2/index.js'

// ─── Constructor & Empty State ───

describe('Pagoda2 - constructor & empty state', () => {
  it('creates an empty pagoda with default comparator', () => {
    const p = new Pagoda2<number>()
    expect(p.size).toBe(0)
    expect(p.isEmpty()).toBe(true)
  })

  it('creates a pagoda with custom comparator', () => {
    const p = new Pagoda2<number>((a, b) => b - a)
    p.insert(1)
    p.insert(3)
    p.insert(2)
    expect(p.peek()).toBe(3)
  })

  it('peek returns null on empty pagoda', () => {
    const p = new Pagoda2<number>()
    expect(p.peek()).toBeNull()
  })

  it('extractMin returns null on empty pagoda', () => {
    const p = new Pagoda2<number>()
    expect(p.extractMin()).toBeNull()
  })
})

// ─── Insert & Peek ───

describe('Pagoda2 - insert & peek', () => {
  it('inserts a single element', () => {
    const p = new Pagoda2<number>()
    p.insert(42)
    expect(p.size).toBe(1)
    expect(p.isEmpty()).toBe(false)
    expect(p.peek()).toBe(42)
  })

  it('peek returns the smallest element after multiple inserts', () => {
    const p = new Pagoda2<number>()
    p.insert(5)
    p.insert(2)
    p.insert(8)
    p.insert(1)
    expect(p.peek()).toBe(1)
  })

  it('maintains correct size after many inserts', () => {
    const p = new Pagoda2<number>()
    for (let i = 0; i < 20; i++) {
      p.insert(i)
    }
    expect(p.size).toBe(20)
  })
})

// ─── ExtractMin ───

describe('Pagoda2 - extractMin', () => {
  it('extracts the only element', () => {
    const p = new Pagoda2<number>()
    p.insert(7)
    expect(p.extractMin()).toBe(7)
    expect(p.size).toBe(0)
    expect(p.isEmpty()).toBe(true)
  })

  it('extracts elements in sorted order', () => {
    const p = new Pagoda2<number>()
    const values = [5, 3, 8, 1, 9, 2, 7, 4, 6]
    for (const v of values) {
      p.insert(v)
    }
    const result: number[] = []
    while (!p.isEmpty()) {
      result.push(p.extractMin()!)
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('handles duplicate values', () => {
    const p = new Pagoda2<number>()
    p.insert(3)
    p.insert(3)
    p.insert(1)
    p.insert(3)
    expect(p.extractMin()).toBe(1)
    expect(p.extractMin()).toBe(3)
    expect(p.extractMin()).toBe(3)
    expect(p.extractMin()).toBe(3)
    expect(p.extractMin()).toBeNull()
  })

  it('interleaved insert and extractMin', () => {
    const p = new Pagoda2<number>()
    p.insert(5)
    p.insert(2)
    expect(p.extractMin()).toBe(2)
    p.insert(1)
    p.insert(8)
    expect(p.extractMin()).toBe(1)
    expect(p.extractMin()).toBe(5)
    expect(p.extractMin()).toBe(8)
  })
})

// ─── Merge ───

describe('Pagoda2 - merge', () => {
  it('merges two non-empty pagodas', () => {
    const p1 = new Pagoda2<number>()
    p1.insert(3)
    p1.insert(1)
    const p2 = new Pagoda2<number>()
    p2.insert(4)
    p2.insert(2)
    p1.merge(p2)
    expect(p1.size).toBe(4)
    expect(p2.size).toBe(0)
    expect(p1.peek()).toBe(1)
    expect(p1.extractMin()).toBe(1)
    expect(p1.extractMin()).toBe(2)
    expect(p1.extractMin()).toBe(3)
    expect(p1.extractMin()).toBe(4)
  })

  it('merging an empty pagoda is a no-op', () => {
    const p1 = new Pagoda2<number>()
    p1.insert(5)
    const p2 = new Pagoda2<number>()
    p1.merge(p2)
    expect(p1.size).toBe(1)
    expect(p1.peek()).toBe(5)
  })

  it('merging into an empty pagoda takes all elements', () => {
    const p1 = new Pagoda2<number>()
    const p2 = new Pagoda2<number>()
    p2.insert(10)
    p2.insert(20)
    p1.merge(p2)
    expect(p1.size).toBe(2)
    expect(p1.peek()).toBe(10)
    expect(p2.isEmpty()).toBe(true)
  })
})

// ─── Contains ───

describe('Pagoda2 - contains', () => {
  it('returns true for existing values', () => {
    const p = new Pagoda2<number>()
    p.insert(5)
    p.insert(3)
    p.insert(7)
    expect(p.contains(5)).toBe(true)
    expect(p.contains(3)).toBe(true)
    expect(p.contains(7)).toBe(true)
  })

  it('returns false for non-existing values', () => {
    const p = new Pagoda2<number>()
    p.insert(5)
    expect(p.contains(99)).toBe(false)
  })

  it('returns false on empty pagoda', () => {
    const p = new Pagoda2<number>()
    expect(p.contains(1)).toBe(false)
  })
})

// ─── Delete ───

describe('Pagoda2 - delete', () => {
  it('deletes an existing value', () => {
    const p = new Pagoda2<number>()
    p.insert(3)
    p.insert(1)
    p.insert(2)
    expect(p.delete(2)).toBe(true)
    expect(p.size).toBe(2)
    expect(p.toArray()).toEqual([1, 3])
  })

  it('returns false for non-existing value', () => {
    const p = new Pagoda2<number>()
    p.insert(1)
    expect(p.delete(99)).toBe(false)
    expect(p.size).toBe(1)
  })

  it('delete the minimum element', () => {
    const p = new Pagoda2<number>()
    p.insert(5)
    p.insert(3)
    p.insert(7)
    expect(p.delete(3)).toBe(true)
    expect(p.peek()).toBe(5)
  })
})

// ─── DecreaseKey ───

describe('Pagoda2 - decreaseKey', () => {
  it('decreases a key successfully', () => {
    const p = new Pagoda2<number>()
    p.insert(5)
    p.insert(10)
    p.insert(8)
    expect(p.decreaseKey(10, 2)).toBe(true)
    expect(p.peek()).toBe(2)
  })

  it('returns false when old value not found', () => {
    const p = new Pagoda2<number>()
    p.insert(5)
    expect(p.decreaseKey(99, 1)).toBe(false)
  })

  it('returns false when new value is not smaller', () => {
    const p = new Pagoda2<number>()
    p.insert(5)
    expect(p.decreaseKey(5, 10)).toBe(false)
  })
})

// ─── Clear ───

describe('Pagoda2 - clear', () => {
  it('clears all elements', () => {
    const p = new Pagoda2<number>()
    p.insert(1)
    p.insert(2)
    p.insert(3)
    p.clear()
    expect(p.size).toBe(0)
    expect(p.isEmpty()).toBe(true)
    expect(p.peek()).toBeNull()
  })
})

// ─── ToArray ───

describe('Pagoda2 - toArray', () => {
  it('returns sorted array', () => {
    const p = new Pagoda2<number>()
    p.insert(3)
    p.insert(1)
    p.insert(2)
    expect(p.toArray()).toEqual([1, 2, 3])
  })

  it('does not modify the original pagoda', () => {
    const p = new Pagoda2<number>()
    p.insert(3)
    p.insert(1)
    p.toArray()
    expect(p.size).toBe(2)
    expect(p.peek()).toBe(1)
  })

  it('returns empty array for empty pagoda', () => {
    const p = new Pagoda2<number>()
    expect(p.toArray()).toEqual([])
  })
})

// ─── String values ───

describe('Pagoda2 - string values', () => {
  it('works with string values', () => {
    const p = new Pagoda2<string>()
    p.insert('cherry')
    p.insert('apple')
    p.insert('banana')
    expect(p.peek()).toBe('apple')
    expect(p.extractMin()).toBe('apple')
    expect(p.extractMin()).toBe('banana')
    expect(p.extractMin()).toBe('cherry')
  })
})
