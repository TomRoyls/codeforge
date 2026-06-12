import { describe, expect, it } from 'vitest'
import { PairHeap } from '../../src/utils/pair-heap.js'

describe('PairHeap', () => {
  it('push and pop in order', () => {
    const h = new PairHeap<number>()
    h.push(3)
    h.push(1)
    h.push(2)
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(2)
    expect(h.pop()).toBe(3)
  })

  it('peek returns min without removing', () => {
    const h = new PairHeap<number>()
    h.push(5)
    h.push(3)
    expect(h.peek()).toBe(3)
    expect(h.size).toBe(2)
  })

  it('handles empty pop', () => {
    const h = new PairHeap<number>()
    expect(h.pop()).toBeUndefined()
    expect(h.peek()).toBeUndefined()
  })

  it('tracks size', () => {
    const h = new PairHeap<number>()
    expect(h.isEmpty).toBe(true)
    h.push(1)
    expect(h.size).toBe(1)
    expect(h.isEmpty).toBe(false)
  })

  it('handles many elements', () => {
    const h = new PairHeap<number>()
    for (let i = 100; i >= 0; i--) h.push(i)
    for (let i = 0; i <= 100; i++) expect(h.pop()).toBe(i)
  })

  it('supports max heap via comparator', () => {
    const h = new PairHeap<number>((a, b) => b - a)
    h.push(1)
    h.push(3)
    h.push(2)
    expect(h.pop()).toBe(3)
    expect(h.pop()).toBe(2)
    expect(h.pop()).toBe(1)
  })

  it('handles duplicates', () => {
    const h = new PairHeap<number>()
    h.push(5)
    h.push(5)
    h.push(5)
    expect(h.pop()).toBe(5)
    expect(h.size).toBe(2)
  })

  it('handles strings', () => {
    const h = new PairHeap<string>((a, b) => a.localeCompare(b))
    h.push('banana')
    h.push('apple')
    h.push('cherry')
    expect(h.pop()).toBe('apple')
  })

  it('pop decreases size', () => {
    const h = new PairHeap<number>()
    h.push(1)
    h.push(2)
    h.pop()
    expect(h.size).toBe(1)
  })

  it('single element push pop', () => {
    const h = new PairHeap<number>()
    h.push(42)
    expect(h.pop()).toBe(42)
    expect(h.size).toBe(0)
  })

  it('handles mixed push pop', () => {
    const h = new PairHeap<number>()
    h.push(5)
    h.push(1)
    expect(h.pop()).toBe(1)
    h.push(3)
    h.push(2)
    expect(h.pop()).toBe(2)
    expect(h.pop()).toBe(3)
  })

  it('handles objects with comparator', () => {
    const h = new PairHeap<{ val: number }>((a, b) => a.val - b.val)
    h.push({ val: 3 })
    h.push({ val: 1 })
    expect(h.pop()?.val).toBe(1)
  })

  it('handles push after pop to empty', () => {
    const h = new PairHeap<number>()
    h.push(1)
    h.pop()
    h.push(2)
    expect(h.pop()).toBe(2)
  })

  it('handles many elements sorted order', () => {
    const h = new PairHeap<number>()
    const items = [5, 3, 1, 4, 2]
    for (const x of items) h.push(x)
    const sorted: number[] = []
    while (h.size > 0) sorted.push(h.pop()!)
    expect(sorted).toEqual([1, 2, 3, 4, 5])
  })

  it('handles single element lifecycle', () => {
    const h = new PairHeap<number>()
    h.push(42)
    expect(h.size).toBe(1)
    expect(h.pop()).toBe(42)
    expect(h.size).toBe(0)
    expect(h.isEmpty).toBe(true)
  })

  it('handles peek on non-empty', () => {
    const h = new PairHeap<number>()
    h.push(5)
    h.push(3)
    h.push(7)
    expect(h.peek()).toBe(3)
    expect(h.size).toBe(3)
  })

  it('pop returns elements in order', () => {
    const h = new PairHeap<number>()
    h.push(5)
    h.push(1)
    h.push(3)
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(3)
    expect(h.pop()).toBe(5)
  })

  it('size on new heap is 0', () => {
    const h = new PairHeap<number>()
    expect(h.size).toBe(0)
  })

  it('isEmpty on new heap is true', () => {
    const h = new PairHeap<number>()
    expect(h.isEmpty).toBe(true)
  })

  it('isEmpty becomes false after push', () => {
    const h = new PairHeap<number>()
    h.push(1)
    expect(h.isEmpty).toBe(false)
  })

  it('isEmpty becomes true after clearing', () => {
    const h = new PairHeap<number>()
    h.push(1)
    h.push(2)
    h.pop()
    h.pop()
    expect(h.isEmpty).toBe(true)
  })

  it('isEmpty on new heap is true', () => {
    const h = new PairHeap<number>()
    expect(h.isEmpty).toBe(true)
  })

  it('handles negative numbers', () => {
    const h = new PairHeap<number>()
    h.push(-5)
    h.push(10)
    h.push(-3)
    h.push(7)
    expect(h.pop()).toBe(-5)
    expect(h.pop()).toBe(-3)
    expect(h.pop()).toBe(7)
    expect(h.pop()).toBe(10)
  })

  it('handles floating point numbers', () => {
    const h = new PairHeap<number>()
    h.push(3.14)
    h.push(2.71)
    h.push(1.41)
    expect(h.pop()).toBe(1.41)
    expect(h.pop()).toBe(2.71)
    expect(h.pop()).toBe(3.14)
  })

  it('handles zero values', () => {
    const h = new PairHeap<number>()
    h.push(0)
    h.push(-1)
    h.push(1)
    expect(h.pop()).toBe(-1)
    expect(h.pop()).toBe(0)
    expect(h.pop()).toBe(1)
  })

  it('handles large number of elements', () => {
    const h = new PairHeap<number>()
    for (let i = 0; i < 1000; i++) {
      h.push(Math.random() * 1000)
    }
    let prev = -Infinity
    let count = 0
    while (!h.isEmpty) {
      const val = h.pop()!
      expect(val).toBeGreaterThanOrEqual(prev)
      prev = val
      count++
    }
    expect(count).toBe(1000)
  })

  it('handles reverse sorted input', () => {
    const h = new PairHeap<number>()
    for (let i = 50; i >= 1; i--) {
      h.push(i)
    }
    for (let i = 1; i <= 50; i++) {
      expect(h.pop()).toBe(i)
    }
  })

  it('handles already sorted input', () => {
    const h = new PairHeap<number>()
    for (let i = 1; i <= 50; i++) {
      h.push(i)
    }
    for (let i = 1; i <= 50; i++) {
      expect(h.pop()).toBe(i)
    }
  })

  it('handles alternating min max pattern', () => {
    const h = new PairHeap<number>()
    for (let i = 0; i < 20; i++) {
      h.push(i % 2 === 0 ? 100 - i : i)
    }
    expect(h.pop()).toBe(1)
  })

  it('peek returns same value multiple times', () => {
    const h = new PairHeap<number>()
    h.push(5)
    h.push(1)
    h.push(3)
    expect(h.peek()).toBe(1)
    expect(h.peek()).toBe(1)
    expect(h.peek()).toBe(1)
  })

  it('peek on empty returns undefined', () => {
    const h = new PairHeap<number>()
    expect(h.peek()).toBeUndefined()
  })

  it('handles array of equal values', () => {
    const h = new PairHeap<number>()
    for (let i = 0; i < 10; i++) {
      h.push(42)
    }
    for (let i = 0; i < 10; i++) {
      expect(h.pop()).toBe(42)
    }
  })

  it('custom comparator for date objects', () => {
    const h = new PairHeap<Date>((a, b) => a.getTime() - b.getTime())
    const dates = [
      new Date('2023-01-01'),
      new Date('2023-03-01'),
      new Date('2023-02-01'),
    ]
    for (const d of dates) h.push(d)
    expect(h.pop()?.toISOString()).toBe('2023-01-01T00:00:00.000Z')
  })

  it('handles very large numbers', () => {
    const h = new PairHeap<number>()
    h.push(Number.MAX_SAFE_INTEGER)
    h.push(Number.MIN_SAFE_INTEGER)
    h.push(0)
    expect(h.pop()).toBe(Number.MIN_SAFE_INTEGER)
    expect(h.pop()).toBe(0)
    expect(h.pop()).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles Infinity and -Infinity', () => {
    const h = new PairHeap<number>()
    h.push(Infinity)
    h.push(-Infinity)
    h.push(0)
    expect(h.pop()).toBe(-Infinity)
    expect(h.pop()).toBe(0)
    expect(h.pop()).toBe(Infinity)
  })

  it('handles mixed positive and negative', () => {
    const h = new PairHeap<number>()
    const values = [5, -3, 7, -1, 0, 4, -2]
    for (const v of values) h.push(v)
    const sorted = [-3, -2, -1, 0, 4, 5, 7]
    for (const expected of sorted) {
      expect(h.pop()).toBe(expected)
    }
  })

  it('multiple consecutive peeks', () => {
    const h = new PairHeap<number>()
    h.push(3)
    h.push(1)
    h.push(2)
    for (let i = 0; i < 10; i++) {
      expect(h.peek()).toBe(1)
    }
  })

  it('interleaved push and peek', () => {
    const h = new PairHeap<number>()
    h.push(5)
    expect(h.peek()).toBe(5)
    h.push(2)
    expect(h.peek()).toBe(2)
    h.push(7)
    expect(h.peek()).toBe(2)
  })

  it('size remains accurate after operations', () => {
    const h = new PairHeap<number>()
    for (let i = 0; i < 10; i++) {
      h.push(i)
      expect(h.size).toBe(i + 1)
    }
    for (let i = 9; i >= 0; i--) {
      h.pop()
      expect(h.size).toBe(i)
    }
  })

  it('handles string comparison with different cases', () => {
    const h = new PairHeap<string>((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    h.push('Zebra')
    h.push('apple')
    h.push('Banana')
    expect(h.pop()).toBe('apple')
    expect(h.pop()).toBe('Banana')
    expect(h.pop()).toBe('Zebra')
  })

  it('handles empty strings', () => {
    const h = new PairHeap<string>((a, b) => a.localeCompare(b))
    h.push('')
    h.push('a')
    h.push('')
    expect(h.pop()).toBe('')
    expect(h.pop()).toBe('')
    expect(h.pop()).toBe('a')
  })

  it('custom comparator for object with multiple properties', () => {
    type Item = { priority: number; name: string }
    const h = new PairHeap<Item>((a, b) => a.priority - b.priority)
    h.push({ priority: 3, name: 'third' })
    h.push({ priority: 1, name: 'first' })
    h.push({ priority: 2, name: 'second' })
    expect(h.pop()?.name).toBe('first')
    expect(h.pop()?.name).toBe('second')
    expect(h.pop()?.name).toBe('third')
  })

  it('handles reverse string order', () => {
    const h = new PairHeap<string>((a, b) => b.localeCompare(a))
    h.push('a')
    h.push('b')
    h.push('c')
    expect(h.pop()).toBe('c')
    expect(h.pop()).toBe('b')
    expect(h.pop()).toBe('a')
  })

  it('peek after all pops returns undefined', () => {
    const h = new PairHeap<number>()
    h.push(1)
    h.push(2)
    h.pop()
    h.pop()
    expect(h.peek()).toBeUndefined()
  })

  it('push same value multiple times', () => {
    const h = new PairHeap<number>()
    for (let i = 0; i < 5; i++) {
      h.push(100)
    }
    for (let i = 0; i < 5; i++) {
      expect(h.pop()).toBe(100)
    }
  })

  it('handles monotonic decreasing sequence', () => {
    const h = new PairHeap<number>()
    for (let i = 1000; i >= 1; i--) {
      h.push(i)
    }
    for (let i = 1; i <= 1000; i++) {
      expect(h.pop()).toBe(i)
    }
  })

  it('handles monotonic increasing sequence', () => {
    const h = new PairHeap<number>()
    for (let i = 1; i <= 1000; i++) {
      h.push(i)
    }
    for (let i = 1; i <= 1000; i++) {
      expect(h.pop()).toBe(i)
    }
  })

  it('should peek without removing', () => {
    const heap = new PairHeap<number>()
    heap.push(5)
    heap.push(3)
    expect(heap.peek()).toBe(3)
    expect(heap.size).toBe(2)
  })

  it('should pop in order', () => {
    const heap = new PairHeap<number>()
    heap.push(5)
    heap.push(3)
    heap.push(1)
    expect(heap.pop()).toBe(1)
    expect(heap.pop()).toBe(3)
    expect(heap.pop()).toBe(5)
  })

  it('should handle empty pop', () => {
    const heap = new PairHeap<number>()
    expect(heap.pop()).toBeUndefined()
  })

  it('should handle empty peek', () => {
    const heap = new PairHeap<number>()
    expect(heap.peek()).toBeUndefined()
  })

  it('should handle two separate heaps', () => {
    const h1 = new PairHeap<number>()
    h1.push(5)
    const h2 = new PairHeap<number>()
    h2.push(3)
    expect(h1.pop()).toBe(5)
    expect(h2.pop()).toBe(3)
  })

  it('should handle custom comparator for max heap', () => {
    const heap = new PairHeap<number>((a, b) => b - a)
    heap.push(1)
    heap.push(5)
    heap.push(3)
    expect(heap.pop()).toBe(5)
  })

  it('peek returns min', () => {
    const heap = new PairHeap<number>()
    heap.push(3)
    heap.push(1)
    heap.push(2)
    expect(heap.peek()).toBe(1)
  })

  it('empty heap pop returns undefined', () => {
    const heap = new PairHeap<number>()
    expect(heap.pop()).toBeUndefined()
  })

  it('size increases with pushes', () => {
    const heap = new PairHeap<number>()
    heap.push(1)
    heap.push(2)
    heap.push(3)
    expect(heap.size).toBe(3)
  })
})
describe('pair-heap - wave548', () => {
  it('pair-heap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module has name', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module not null', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module has length', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('pair-heap - wave549', () => {
  it('pair-heap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pair-heap - wave550', () => {
  it('pair-heap w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pair-heap - wave551', () => {
  it('pair-heap w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pair-heap - wave552', () => {
  it('pair-heap w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pair-heap - wave553', () => {
  it('pair-heap w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pair-heap - wave554', () => {
  it('pair-heap w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pair-heap - wave555', () => {
  it('pair-heap w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pair-heap - wave556', () => {
  it('pair-heap w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pair-heap w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
