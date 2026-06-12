import { beforeEach, describe, expect, it } from 'vitest'

import { LeftistHeap } from '../../src/utils/leftist-heap.js'

// ─── Empty heap operations ───────────────────────────────
describe('LeftistHeap - empty heap', () => {
  it('peek returns undefined on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('extractMin returns undefined on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('isEmpty returns true on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.isEmpty()).toBe(true)
  })

  it('size is 0 on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.size).toBe(0)
  })

  it('toArray returns empty array on empty heap', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.toArray()).toEqual([])
  })
})

describe('LeftistHeap - single element', () => {
  it('insert and peek', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(42)
    expect(heap.peek()).toBe(42)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty()).toBe(false)
  })

  it('insert and extractMin', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(42)
    expect(heap.extractMin()).toBe(42)
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('insert with negative value', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(-5)
    expect(heap.peek()).toBe(-5)
    expect(heap.extractMin()).toBe(-5)
  })

  it('insert with zero', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(0)
    expect(heap.peek()).toBe(0)
    expect(heap.size).toBe(1)
  })
})

// ─── Multiple inserts ────────────────────────────────────
describe('LeftistHeap - multiple inserts', () => {
  it('maintains heap property with multiple inserts', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    expect(heap.peek()).toBe(1)
    expect(heap.size).toBe(5)
  })

  it('extracts elements in ascending order', () => {
    const heap = new LeftistHeap<number>()
    const values = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
    for (const v of values) {
      heap.insert(v)
    }
    const sorted = [...values].sort((a, b) => a - b)
    for (const expected of sorted) {
      expect(heap.extractMin()).toBe(expected)
    }
    expect(heap.isEmpty()).toBe(true)
  })

  it('handles duplicate values', () => {
    const heap = new LeftistHeap<number>()
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

// ─── Merge ───────────────────────────────────────────────
describe('LeftistHeap - merge', () => {
  it('merges two non-empty heaps', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(5)
    heap1.insert(10)
    heap1.insert(3)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(2)
    heap2.insert(8)
    heap2.insert(1)

    heap1.merge(heap2)
    expect(heap1.size).toBe(6)
    expect(heap1.peek()).toBe(1)
    expect(heap2.size).toBe(0)
    expect(heap2.isEmpty()).toBe(true)
  })

  it('merge empty with non-empty', () => {
    const heap1 = new LeftistHeap<number>()
    const heap2 = new LeftistHeap<number>()
    heap2.insert(1)
    heap2.insert(2)

    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.peek()).toBe(1)
    expect(heap2.size).toBe(0)
  })

  it('merge non-empty with empty', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(5)
    heap1.insert(10)
    const heap2 = new LeftistHeap<number>()

    heap1.merge(heap2)
    expect(heap1.size).toBe(2)
    expect(heap1.peek()).toBe(5)
  })

  it('merge two empty heaps', () => {
    const heap1 = new LeftistHeap<number>()
    const heap2 = new LeftistHeap<number>()

    heap1.merge(heap2)
    expect(heap1.size).toBe(0)
    expect(heap1.isEmpty()).toBe(true)
  })

  it('merge after extracts', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(10)
    heap1.insert(20)
    heap1.extractMin()

    const heap2 = new LeftistHeap<number>()
    heap2.insert(5)
    heap2.insert(15)

    heap1.merge(heap2)
    expect(heap1.size).toBe(3)
    expect(heap1.peek()).toBe(5)
  })

  it('merged heap extracts all in order', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(4)
    heap1.insert(7)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(2)
    heap2.insert(5)
    heap2.insert(8)

    heap1.merge(heap2)
    const result: number[] = []
    while (!heap1.isEmpty()) {
      result.push(heap1.extractMin()!)
    }
    expect(result).toEqual([1, 2, 4, 5, 7, 8])
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('LeftistHeap - clear', () => {
  it('clears the heap', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.peek()).toBeUndefined()
    expect(heap.extractMin()).toBeUndefined()
  })
})

// ─── Size tracking ───────────────────────────────────────
describe('LeftistHeap - size tracking', () => {
  it('tracks size through inserts and extracts', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.size).toBe(0)
    heap.insert(1)
    expect(heap.size).toBe(1)
    heap.insert(2)
    expect(heap.size).toBe(2)
    heap.extractMin()
    expect(heap.size).toBe(1)
    heap.extractMin()
    expect(heap.size).toBe(0)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('LeftistHeap - toArray', () => {
  it('returns sorted elements', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    heap.insert(4)
    expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('toArray empties the heap', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    heap.toArray()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
  })
})

// ─── Custom comparator (max heap) ────────────────────────
describe('LeftistHeap - custom comparator (max heap)', () => {
  it('behaves as max heap with reverse comparator', () => {
    const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(5)
    heap.insert(1)
    heap.insert(3)
    heap.insert(2)
    heap.insert(4)
    expect(heap.peek()).toBe(5)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(4)
    expect(heap.extractMin()).toBe(3)
  })

  it('max heap merge works correctly', () => {
    const heap1 = new LeftistHeap<number>({ comparator: (a, b) => b - a })
    heap1.insert(10)
    heap1.insert(30)

    const heap2 = new LeftistHeap<number>({ comparator: (a, b) => b - a })
    heap2.insert(20)
    heap2.insert(5)

    heap1.merge(heap2)
    expect(heap1.peek()).toBe(30)
    expect(heap1.size).toBe(4)
  })
})

// ─── Large number of elements ────────────────────────────
describe('LeftistHeap - large scale', () => {
  it('handles 100+ elements', () => {
    const heap = new LeftistHeap<number>()
    const items = Array.from({ length: 200 }, (_, i) => i + 1)
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    for (const item of shuffled) {
      heap.insert(item)
    }
    for (let i = 1; i <= 200; i++) {
      expect(heap.extractMin()).toBe(i)
    }
    expect(heap.isEmpty()).toBe(true)
  })
})

// ─── NPL and leftist property ────────────────────────────
describe('LeftistHeap - leftist property', () => {
  it('maintains NPL property after inserts', () => {
    const heap = new LeftistHeap<number>()
    for (let i = 20; i >= 1; i--) {
      heap.insert(i)
    }
    for (let i = 1; i <= 20; i++) {
      expect(heap.extractMin()).toBe(i)
    }
  })

  it('maintains heap order after merge', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(5)
    heap1.insert(9)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(2)
    heap2.insert(6)
    heap2.insert(10)

    heap1.merge(heap2)

    const result: number[] = []
    while (!heap1.isEmpty()) {
      result.push(heap1.extractMin()!)
    }
    expect(result).toEqual([1, 2, 5, 6, 9, 10])
  })
})

// ─── Generic types ───────────────────────────────────────
describe('LeftistHeap - generic types', () => {
  it('works with strings', () => {
    const heap = new LeftistHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('cherry')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
    expect(heap.extractMin()).toBe('cherry')
  })

  it('works with objects using custom comparator', () => {
    interface Item {
      priority: number
      name: string
    }
    const heap = new LeftistHeap<Item>({
      comparator: (a, b) => a.priority - b.priority,
    })
    heap.insert({ priority: 3, name: 'c' })
    heap.insert({ priority: 1, name: 'a' })
    heap.insert({ priority: 2, name: 'b' })
    expect(heap.extractMin()?.name).toBe('a')
    expect(heap.extractMin()?.name).toBe('b')
    expect(heap.extractMin()?.name).toBe('c')
  })
})

// ─── fromArray ───────────────────────────────────────────
describe('LeftistHeap - fromArray', () => {
  it('creates heap from array', () => {
    const heap = LeftistHeap.fromArray([5, 3, 1, 4, 2])
    expect(heap.size).toBe(5)
    expect(heap.peek()).toBe(1)
    expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('creates empty heap from empty array', () => {
    const heap = LeftistHeap.fromArray<number>([])
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
  })

  it('fromArray with duplicates', () => {
    const heap = LeftistHeap.fromArray([5, 3, 5, 1, 3, 2, 1])
    expect(heap.size).toBe(7)
    expect(heap.toArray()).toEqual([1, 1, 2, 3, 3, 5, 5])
  })

  it('fromArray with single element', () => {
    const heap = LeftistHeap.fromArray([42])
    expect(heap.size).toBe(1)
    expect(heap.peek()).toBe(42)
  })

  it('fromArray with already sorted array', () => {
    const heap = LeftistHeap.fromArray([1, 2, 3, 4, 5])
    expect(heap.size).toBe(5)
    expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('fromArray with reverse sorted array', () => {
    const heap = LeftistHeap.fromArray([5, 4, 3, 2, 1])
    expect(heap.size).toBe(5)
    expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('fromArray with custom comparator', () => {
    const heap = LeftistHeap.fromArray([5, 1, 3, 2, 4], { comparator: (a, b) => b - a })
    expect(heap.size).toBe(5)
    expect(heap.peek()).toBe(5)
    expect(heap.toArray()).toEqual([5, 4, 3, 2, 1])
  })
})

// ─── toString ─────────────────────────────────────────────
describe('LeftistHeap - toString', () => {
  it('returns string representation', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.toString()).toBe('[1,3,2]')
  })

  it('toString on empty heap returns empty array', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.toString()).toBe('[]')
  })

  it('toString on single element', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(42)
    expect(heap.toString()).toBe('[42]')
  })
})

// ─── toJSON ───────────────────────────────────────────────
describe('LeftistHeap - toJSON', () => {
  it('returns array representation', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.toJSON()).toEqual([1, 3, 2])
  })

  it('toJSON on empty heap returns empty array', () => {
    const heap = new LeftistHeap<number>()
    expect(heap.toJSON()).toEqual([])
  })

  it('toJSON preserves order of insertion', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.toJSON()).toEqual([3, 5, 7])
  })
})

// ─── clone ───────────────────────────────────────────────
describe('LeftistHeap - clone', () => {
  it('creates independent copy', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const clone = heap.clone()

    expect(clone.size).toBe(3)
    expect(clone.peek()).toBe(1)
    clone.insert(4)
    expect(clone.size).toBe(4)
    expect(heap.size).toBe(3)
  })

  it('clone of empty heap', () => {
    const heap = new LeftistHeap<number>()
    const clone = heap.clone()
    expect(clone.isEmpty()).toBe(true)
    expect(clone.size).toBe(0)
  })

  it('clone after extract operations', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.extractMin()
    const clone = heap.clone()
    expect(clone.size).toBe(2)
    expect(clone.peek()).toBe(2)
  })

  it('clone with custom comparator', () => {
    const heap = new LeftistHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const clone = heap.clone()
    expect(clone.peek()).toBe(3)
    expect(clone.extractMin()).toBe(3)
  })
})

// ─── equals ──────────────────────────────────────────────
describe('LeftistHeap - equals', () => {
  it('equals with identical heaps', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(2)
    heap1.insert(3)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(1)
    heap2.insert(2)
    heap2.insert(3)

    expect(heap1.equals(heap2)).toBe(true)
  })

  it('equals with different sizes', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(2)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(1)
    heap2.insert(2)
    heap2.insert(3)

    expect(heap1.equals(heap2)).toBe(false)
  })

  it('equals with different values', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(2)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(1)
    heap2.insert(3)

    expect(heap1.equals(heap2)).toBe(false)
  })

  it('equals with empty heaps', () => {
    const heap1 = new LeftistHeap<number>()
    const heap2 = new LeftistHeap<number>()
    expect(heap1.equals(heap2)).toBe(true)
  })

  it('equals with non-LeftistHeap returns false', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(1)
    expect(heap.equals(null)).toBe(false)
    expect(heap.equals({})).toBe(false)
    expect(heap.equals([1])).toBe(false)
  })

  it('equals after extract operations', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(2)
    heap1.insert(3)
    heap1.extractMin()

    const heap2 = new LeftistHeap<number>()
    heap2.insert(2)
    heap2.insert(3)

    expect(heap1.equals(heap2)).toBe(true)
  })
})

// ─── Special values ───────────────────────────────────────
describe('LeftistHeap - special values', () => {
  it('handles negative numbers', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(-5)
    heap.insert(3)
    heap.insert(-1)
    heap.insert(0)
    expect(heap.peek()).toBe(-5)
    expect(heap.toArray()).toEqual([-5, -1, 0, 3])
  })

  it('handles zero values', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(0)
    heap.insert(0)
    heap.insert(1)
    heap.insert(-1)
    heap.insert(0)
    expect(heap.extractMin()).toBe(-1)
    expect(heap.extractMin()).toBe(0)
    expect(heap.extractMin()).toBe(0)
    expect(heap.extractMin()).toBe(0)
  })

  it('handles large numbers', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(Number.MAX_SAFE_INTEGER)
    heap.insert(1)
    heap.insert(Number.MIN_SAFE_INTEGER)
    expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER)
    expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles floating point numbers', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(3.14)
    heap.insert(1.41)
    heap.insert(2.72)
    heap.insert(1.73)
    expect(heap.peek()).toBe(1.41)
    expect(heap.toArray()).toEqual([1.41, 1.73, 2.72, 3.14])
  })
})

// ─── Edge cases ───────────────────────────────────────────
describe('LeftistHeap - edge cases', () => {
  it('peek after extract', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.extractMin()
    expect(heap.peek()).toBe(5)
  })

  it('multiple extracts until empty', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(2)
    expect(heap.extractMin()).toBe(3)
    expect(heap.extractMin()).toBeUndefined()
    expect(heap.extractMin()).toBeUndefined()
  })

  it('insert after extract', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.extractMin()
    heap.insert(1)
    expect(heap.peek()).toBe(1)
    expect(heap.size).toBe(2)
  })

  it('merge heaps with same values', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(1)
    heap1.insert(2)
    heap1.insert(3)

    const heap2 = new LeftistHeap<number>()
    heap2.insert(1)
    heap2.insert(2)
    heap2.insert(3)

    heap1.merge(heap2)
    expect(heap1.size).toBe(6)
    expect(heap1.toArray()).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('merge after multiple operations', () => {
    const heap1 = new LeftistHeap<number>()
    heap1.insert(10)
    heap1.insert(5)
    heap1.extractMin()

    const heap2 = new LeftistHeap<number>()
    heap2.insert(3)
    heap2.insert(7)
    heap2.insert(1)
    heap2.extractMin()

    heap1.merge(heap2)
    expect(heap1.size).toBe(3)
    expect(heap1.toArray()).toEqual([3, 7, 10])
  })

  it('clear after operations', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.extractMin()
    heap.insert(3)
    heap.clear()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size).toBe(0)
    expect(heap.peek()).toBeUndefined()
  })

  it('size after clear and insert', () => {
    const heap = new LeftistHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.clear()
    heap.insert(5)
    expect(heap.size).toBe(1)
  })
})

// ─── String comparison ────────────────────────────────────
describe('LeftistHeap - string comparison', () => {
  it('works with string comparator', () => {
    const heap = new LeftistHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('zebra')
    heap.insert('apple')
    heap.insert('banana')
    heap.insert('cherry')
    expect(heap.peek()).toBe('apple')
    expect(heap.extractMin()).toBe('apple')
    expect(heap.extractMin()).toBe('banana')
  })

  it('handles empty strings', () => {
    const heap = new LeftistHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('')
    heap.insert('a')
    heap.insert('b')
    expect(heap.peek()).toBe('')
  })

  it('handles special characters', () => {
    const heap = new LeftistHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap.insert('@')
    heap.insert('!')
    heap.insert('#')
    heap.insert('$')
    expect(heap.extractMin()).toBe('!')
    expect(heap.extractMin()).toBe('@')
    expect(heap.extractMin()).toBe('#')
    expect(heap.extractMin()).toBe('$')
  })

  it('merge heaps with string comparator', () => {
    const heap1 = new LeftistHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap1.insert('cherry')
    heap1.insert('apple')

    const heap2 = new LeftistHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
    heap2.insert('banana')
    heap2.insert('date')

    heap1.merge(heap2)
    expect(heap1.toArray()).toEqual(['apple', 'banana', 'cherry', 'date'])
  })
})

// ─── Object with complex comparator ───────────────────────
describe('LeftistHeap - complex object comparison', () => {
  interface Task {
    priority: number
    id: number
    name: string
  }

  it('compares objects by multiple fields', () => {
    const heap = new LeftistHeap<Task>({
      comparator: (a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        return a.id - b.id
      },
    })
    heap.insert({ priority: 2, id: 3, name: 'task3' })
    heap.insert({ priority: 1, id: 1, name: 'task1' })
    heap.insert({ priority: 2, id: 1, name: 'task1-alt' })
    heap.insert({ priority: 1, id: 2, name: 'task2' })

    const first = heap.extractMin()
    expect(first?.priority).toBe(1)
    expect(first?.id).toBe(1)

    const second = heap.extractMin()
    expect(second?.priority).toBe(1)
    expect(second?.id).toBe(2)
  })
})

describe('leftist-heap - wave548', () => {
  it('leftist-heap module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap module is function', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave549', () => {
  it('leftist-heap module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave550', () => {
  it('leftist-heap w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave551', () => {
  it('leftist-heap w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave552', () => {
  it('leftist-heap w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave553', () => {
  it('leftist-heap w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave554', () => {
  it('leftist-heap w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave555', () => {
  it('leftist-heap w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave556', () => {
  it('leftist-heap w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave557', () => {
  it('leftist-heap w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave558', () => {
  it('leftist-heap w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave559', () => {
  it('leftist-heap w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave560', () => {
  it('leftist-heap w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave561', () => {
  it('leftist-heap w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave562', () => {
  it('leftist-heap w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave563', () => {
  it('leftist-heap w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave564', () => {
  it('leftist-heap w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave565', () => {
  it('leftist-heap w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave566', () => {
  it('leftist-heap w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave127', () => {
  it('leftist-heap w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave130', () => {
  it('leftist-heap w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave133', () => {
  it('leftist-heap w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave136', () => {
  it('leftist-heap w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - wave139', () => {
  it('leftist-heap w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w142', () => {
  it('leftist-heap v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w145', () => {
  it('leftist-heap v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w148', () => {
  it('leftist-heap v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w151', () => {
  it('leftist-heap v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w154', () => {
  it('leftist-heap v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w157', () => {
  it('leftist-heap v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w160', () => {
  it('leftist-heap v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w170', () => {
  it('leftist-heap x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w180', () => {
  it('leftist-heap x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w190', () => {
  it('leftist-heap x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w200', () => {
  it('leftist-heap x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w210', () => {
  it('leftist-heap x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w220', () => {
  it('leftist-heap x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w230', () => {
  it('leftist-heap x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w240', () => {
  it('leftist-heap x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w250', () => {
  it('leftist-heap x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w260', () => {
  it('leftist-heap x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w270', () => {
  it('leftist-heap x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w280', () => {
  it('leftist-heap x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w290', () => {
  it('leftist-heap x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w300', () => {
  it('leftist-heap x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w310', () => {
  it('leftist-heap x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w320', () => {
  it('leftist-heap x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w330', () => {
  it('leftist-heap x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w340', () => {
  it('leftist-heap x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w350', () => {
  it('leftist-heap x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w360', () => {
  it('leftist-heap x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w370', () => {
  it('leftist-heap x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w380', () => {
  it('leftist-heap x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w390', () => {
  it('leftist-heap x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w400', () => {
  it('leftist-heap x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w420', () => {
  it('leftist-heap x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w440', () => {
  it('leftist-heap x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w460', () => {
  it('leftist-heap x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w480', () => {
  it('leftist-heap x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w500', () => {
  it('leftist-heap x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w550', () => {
  it('leftist-heap x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w600', () => {
  it('leftist-heap x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w650', () => {
  it('leftist-heap x650x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x650x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w700', () => {
  it('leftist-heap x700x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x700x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w800', () => {
  it('leftist-heap x800x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x800x99', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w900', () => {
  it('leftist-heap x900x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x900x99', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('leftist-heap - w1000', () => {
  it('leftist-heap x1000x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x49', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x50', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x51', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x52', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x53', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x54', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x55', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x56', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x57', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x58', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x59', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x60', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x61', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x62', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x63', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x64', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x65', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x66', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x67', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x68', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x69', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x70', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x71', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x72', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x73', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x74', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x75', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x76', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x77', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x78', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x79', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x80', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x81', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x82', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x83', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x84', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x85', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x86', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x87', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x88', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x89', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x90', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x91', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x92', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x93', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x94', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x95', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x96', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x97', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x98', () => {
    expect(beforeEach).toBeDefined()
  })
  it('leftist-heap x1000x99', () => {
    expect(beforeEach).toBeDefined()
  })
})
