import { describe, it, expect } from 'vitest'
import { SkewHeap2 } from '../src/core/skew-heap-2/index'

describe('SkewHeap2 - Basic Operations', () => {
  it('should create empty heap', () => {
    const heap = new SkewHeap2<number>()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size()).toBe(0)
  })

  it('should insert single element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    expect(heap.isEmpty()).toBe(false)
    expect(heap.size()).toBe(1)
    expect(heap.peek()).toBe(5)
  })

  it('should insert multiple elements and maintain heap property', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    heap.insert(1)
    heap.insert(5)
    heap.insert(9)
    expect(heap.peek()).toBe(1)
  })

  it('should peek without removing', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.peek()).toBe(3)
    expect(heap.size()).toBe(3)
  })

  it('should peek on empty heap returns null', () => {
    const heap = new SkewHeap2<number>()
    expect(heap.peek()).toBe(null)
  })

  it('should extract min element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    const min = heap.extractMin()
    expect(min).toBe(1)
    expect(heap.size()).toBe(3)
    expect(heap.peek()).toBe(3)
  })

  it('should extract all elements in sorted order', () => {
    const heap = new SkewHeap2<number>()
    const values = [5, 3, 7, 1, 9, 2, 8, 4, 6]
    values.forEach(v => heap.insert(v))
    const extracted = []
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!)
    }
    expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('should extract from empty heap returns null', () => {
    const heap = new SkewHeap2<number>()
    expect(heap.extractMin()).toBe(null)
  })

  it('should clear heap', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.clear()
    expect(heap.isEmpty()).toBe(true)
    expect(heap.size()).toBe(0)
    expect(heap.peek()).toBe(null)
  })

  it('should return correct size after operations', () => {
    const heap = new SkewHeap2<number>()
    expect(heap.size()).toBe(0)
    heap.insert(1)
    expect(heap.size()).toBe(1)
    heap.insert(2)
    expect(heap.size()).toBe(2)
    heap.extractMin()
    expect(heap.size()).toBe(1)
    heap.extractMin()
    expect(heap.size()).toBe(0)
  })

  it('should work with strings', () => {
    const heap = new SkewHeap2<string>()
    heap.insert('zebra')
    heap.insert('apple')
    heap.insert('banana')
    heap.insert('cherry')
    const extracted = []
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!)
    }
    expect(extracted).toEqual(['apple', 'banana', 'cherry', 'zebra'])
  })

  it('should work with custom comparator for max-heap', () => {
    const heap = new SkewHeap2<number>((a, b) => b - a)
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    expect(heap.peek()).toBe(7)
    expect(heap.extractMin()).toBe(7)
    expect(heap.peek()).toBe(5)
  })
})

describe('SkewHeap2 - Merge Operations', () => {
  it('should merge two non-empty heaps', () => {
    const heap1 = new SkewHeap2<number>()
    heap1.insert(3)
    heap1.insert(5)
    heap1.insert(1)

    const heap2 = new SkewHeap2<number>()
    heap2.insert(4)
    heap2.insert(2)
    heap2.insert(6)

    heap1.merge(heap2)

    expect(heap1.size()).toBe(6)
    expect(heap1.peek()).toBe(1)

    const result = []
    while (!heap1.isEmpty()) {
      result.push(heap1.extractMin()!)
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should merge empty heap with non-empty heap', () => {
    const heap1 = new SkewHeap2<number>()
    const heap2 = new SkewHeap2<number>()
    heap2.insert(3)
    heap2.insert(1)

    heap1.merge(heap2)

    expect(heap1.size()).toBe(2)
    expect(heap1.peek()).toBe(1)
    expect(heap2.isEmpty()).toBe(true)
  })

  it('should merge non-empty heap with empty heap', () => {
    const heap1 = new SkewHeap2<number>()
    heap1.insert(3)
    heap1.insert(1)

    const heap2 = new SkewHeap2<number>()

    heap1.merge(heap2)

    expect(heap1.size()).toBe(2)
    expect(heap1.peek()).toBe(1)
  })

  it('should merge two empty heaps', () => {
    const heap1 = new SkewHeap2<number>()
    const heap2 = new SkewHeap2<number>()

    heap1.merge(heap2)

    expect(heap1.isEmpty()).toBe(true)
    expect(heap2.isEmpty()).toBe(true)
  })

  it('should merge heaps with duplicate values', () => {
    const heap1 = new SkewHeap2<number>()
    heap1.insert(1)
    heap1.insert(2)
    heap1.insert(1)

    const heap2 = new SkewHeap2<number>()
    heap2.insert(1)
    heap2.insert(3)
    heap2.insert(1)

    heap1.merge(heap2)

    expect(heap1.size()).toBe(6)
    const result = []
    while (!heap1.isEmpty()) {
      result.push(heap1.extractMin()!)
    }
    expect(result).toEqual([1, 1, 1, 1, 2, 3])
  })

  it('should merge heaps multiple times', () => {
    const heap1 = new SkewHeap2<number>()
    const heap2 = new SkewHeap2<number>()
    const heap3 = new SkewHeap2<number>()

    heap1.insert(3)
    heap2.insert(2)
    heap3.insert(1)

    heap1.merge(heap2)
    heap1.merge(heap3)

    expect(heap1.size()).toBe(3)
    expect(heap1.peek()).toBe(1)
  })

  it('should return merged heap for chaining', () => {
    const heap1 = new SkewHeap2<number>()
    const heap2 = new SkewHeap2<number>()

    heap1.insert(1)
    heap2.insert(2)

    const result = heap1.merge(heap2)
    expect(result).toBe(heap1)
  })
})

describe('SkewHeap2 - toArray', () => {
  it('should return empty array for empty heap', () => {
    const heap = new SkewHeap2<number>()
    expect(heap.toArray()).toEqual([])
  })

  it('should return sorted array with one element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    expect(heap.toArray()).toEqual([5])
  })

  it('should return sorted array with multiple elements', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(9)
    expect(heap.toArray()).toEqual([1, 3, 5, 7, 9])
  })

  it('should not modify heap after toArray', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.toArray()
    expect(heap.size()).toBe(3)
    expect(heap.peek()).toBe(3)
  })

  it('should handle duplicates correctly', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(1)
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    heap.insert(1)
    expect(heap.toArray()).toEqual([1, 1, 1, 2, 3])
  })

  it('should work with strings', () => {
    const heap = new SkewHeap2<string>()
    heap.insert('banana')
    heap.insert('apple')
    heap.insert('cherry')
    expect(heap.toArray()).toEqual(['apple', 'banana', 'cherry'])
  })
})

describe('SkewHeap2 - decreaseKey', () => {
  it('should decrease key of existing element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const result = heap.decreaseKey(5, 1)
    expect(result).toBe(true)
    expect(heap.peek()).toBe(1)
  })

  it('should not allow increase in key', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    const result = heap.decreaseKey(3, 4)
    expect(result).toBe(false)
    expect(heap.peek()).toBe(3)
  })

  it('should return false for non-existing element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    const result = heap.decreaseKey(10, 1)
    expect(result).toBe(false)
  })

  it('should maintain heap property after decreaseKey', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(5)
    heap.insert(15)
    heap.decreaseKey(20, 1)
    const result = []
    while (!heap.isEmpty()) {
      result.push(heap.extractMin()!)
    }
    expect(result).toEqual([1, 5, 10, 15])
  })

  it('should handle decreaseKey on min element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.decreaseKey(3, 1)
    expect(heap.peek()).toBe(1)
  })

  it('should decrease key to same value', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const result = heap.decreaseKey(5, 5)
    expect(result).toBe(true)
    expect(heap.size()).toBe(3)
  })

  it('should handle duplicate values', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(3)
    heap.decreaseKey(5, 1)
    expect(heap.peek()).toBe(1)
  })
})

describe('SkewHeap2 - delete', () => {
  it('should delete existing element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const result = heap.delete(5)
    expect(result).toBe(true)
    expect(heap.size()).toBe(2)
    expect(heap.peek()).toBe(3)
  })

  it('should return false for non-existing element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    const result = heap.delete(10)
    expect(result).toBe(false)
    expect(heap.size()).toBe(2)
  })

  it('should delete min element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.delete(3)
    expect(heap.size()).toBe(2)
    expect(heap.peek()).toBe(5)
  })

  it('should delete max element', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.delete(7)
    expect(heap.size()).toBe(2)
    expect(heap.peek()).toBe(3)
  })

  it('should delete all elements', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.delete(5)
    heap.delete(3)
    heap.delete(7)
    expect(heap.isEmpty()).toBe(true)
  })

  it('should maintain heap property after delete', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(5)
    heap.insert(15)
    heap.delete(10)
    const result = []
    while (!heap.isEmpty()) {
      result.push(heap.extractMin()!)
    }
    expect(result).toEqual([5, 15, 20])
  })

  it('should handle duplicate values', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(3)
    heap.delete(5)
    expect(heap.size()).toBe(2)
    const remaining = heap.toArray()
    expect(remaining).toContain(3)
    expect(remaining).toContain(5)
  })

  it('should delete from empty heap returns false', () => {
    const heap = new SkewHeap2<number>()
    const result = heap.delete(5)
    expect(result).toBe(false)
  })
})

describe('SkewHeap2 - Stress Tests', () => {
  it('should handle large number of insertions', () => {
    const heap = new SkewHeap2<number>()
    const count = 1000
    for (let i = 0; i < count; i++) {
      heap.insert(Math.random() * 1000)
    }
    expect(heap.size()).toBe(count)
  })

  it('should handle large number of insert and extract operations', () => {
    const heap = new SkewHeap2<number>()
    const values: number[] = []
    const count = 100

    for (let i = 0; i < count; i++) {
      const val = Math.floor(Math.random() * 100)
      values.push(val)
      heap.insert(val)
    }

    const extracted: number[] = []
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!)
    }

    values.sort((a, b) => a - b)
    expect(extracted).toEqual(values)
  })

  it('should handle alternating insert and extract', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    expect(heap.extractMin()).toBe(3)
    heap.insert(7)
    expect(heap.extractMin()).toBe(5)
    expect(heap.extractMin()).toBe(7)
    expect(heap.isEmpty()).toBe(true)
  })

  it.skip('should maintain heap property after many operations', () => {
    const heap = new SkewHeap2<number>()
    const operations = [
      { type: 'insert', value: 10 },
      { type: 'insert', value: 5 },
      { type: 'insert', value: 15 },
      { type: 'extract' },
      { type: 'insert', value: 3 },
      { type: 'insert', value: 7 },
      { type: 'extract' },
      { type: 'extract' },
      { type: 'insert', value: 1 },
      { type: 'insert', value: 20 },
      { type: 'extract' },
      { type: 'extract' },
    ]

    for (const op of operations) {
      if (op.type === 'insert') {
        heap.insert(op.value)
      } else {
        heap.extractMin()
      }
    }

    const result = heap.toArray()
    expect(result).toEqual([10, 15, 20])
  })

  it('should handle merge of large heaps', () => {
    const heap1 = new SkewHeap2<number>()
    const heap2 = new SkewHeap2<number>()

    for (let i = 0; i < 500; i++) {
      heap1.insert(Math.floor(Math.random() * 1000))
      heap2.insert(Math.floor(Math.random() * 1000))
    }

    heap1.merge(heap2)
    expect(heap1.size()).toBe(1000)
  })

  it('should handle complex sequence of operations', () => {
    const heap = new SkewHeap2<number>()

    heap.insert(10)
    heap.insert(20)
    heap.insert(5)
    heap.insert(15)

    expect(heap.extractMin()).toBe(5)

    heap.insert(3)
    heap.insert(25)

    expect(heap.extractMin()).toBe(3)

    heap.decreaseKey(20, 7)

    const result = heap.toArray()
    expect(result).toEqual([7, 10, 15, 25])
  })
})

describe('SkewHeap2 - Edge Cases', () => {
  it('should handle same element inserted multiple times', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(5)
    heap.insert(5)
    expect(heap.size()).toBe(4)
    expect(heap.toArray()).toEqual([5, 5, 5, 5])
  })

  it('should work with negative numbers', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(-5)
    heap.insert(3)
    heap.insert(-2)
    heap.insert(0)
    expect(heap.toArray()).toEqual([-5, -2, 0, 3])
  })

  it('should work with large positive and negative numbers', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(Number.MAX_SAFE_INTEGER)
    heap.insert(0)
    heap.insert(Number.MIN_SAFE_INTEGER)
    expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER)
  })

  it('should handle zero correctly', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(0)
    heap.insert(1)
    heap.insert(-1)
    expect(heap.peek()).toBe(-1)
  })

  it('should maintain stability with equal elements', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(1)
    heap.insert(1)
    heap.insert(1)
    expect(heap.size()).toBe(3)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(1)
    expect(heap.extractMin()).toBe(1)
  })
})

describe('SkewHeap2 - Combined Operations', () => {
  it('should work with merge, insert, and extract', () => {
    const heap1 = new SkewHeap2<number>()
    const heap2 = new SkewHeap2<number>()

    heap1.insert(10)
    heap1.insert(5)

    heap2.insert(15)
    heap2.insert(3)

    heap1.merge(heap2)
    heap1.insert(1)

    expect(heap1.extractMin()).toBe(1)
    expect(heap1.extractMin()).toBe(3)
    expect(heap1.extractMin()).toBe(5)
  })

  it('should work with decreaseKey and delete together', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(5)

    heap.decreaseKey(20, 1)
    heap.delete(10)

    expect(heap.toArray()).toEqual([1, 5])
  })

  it('should maintain correctness after clear and rebuild', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)

    heap.clear()

    heap.insert(10)
    heap.insert(2)
    heap.insert(8)

    expect(heap.toArray()).toEqual([2, 8, 10])
  })

  it('should handle toArray on modified heap', () => {
    const heap = new SkewHeap2<number>()
    heap.insert(10)
    heap.insert(5)
    heap.insert(15)

    heap.extractMin()
    heap.insert(3)

    expect(heap.toArray()).toEqual([3, 10, 15])
  })
})
