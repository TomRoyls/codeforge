import { describe, it, expect } from 'vitest'
import { IntervalHeap } from '../src/core/interval-heap/index.js'

describe('IntervalHeap constructor', () => {
  it('should create empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty).toBe(true)
  })

  it('should accept custom comparator', () => {
    const heap = new IntervalHeap<number>({ comparator: (a, b) => b - a })
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.getMin()).toBe(3)
    expect(heap.getMax()).toBe(1)
  })

  it('should use default comparator for numbers', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.getMin()).toBe(1)
    expect(heap.getMax()).toBe(3)
  })

  it('should work with strings using default comparator', () => {
    const heap = new IntervalHeap<string>()
    heap.insert('zebra')
    heap.insert('apple')
    heap.insert('banana')
    expect(heap.getMin()).toBe('apple')
    expect(heap.getMax()).toBe('zebra')
  })

  it.skip('should initialize with initialValues', () => {
    const heap = new IntervalHeap<number>({ initialValues: [5, 3, 7] })
    expect(heap.size).toBe(3)
    expect(heap.getMin()).toBe(3)
    expect(heap.getMax()).toBe(7)
  })

  it.skip('should initialize with empty initialValues', () => {
    const heap = new IntervalHeap<number>({ initialValues: [] })
    expect(heap.size).toBe(0)
    expect(heap.isEmpty).toBe(true)
  })
})

describe('IntervalHeap insert', () => {
  it('should insert single element', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    expect(heap.size).toBe(1)
    expect(heap.isEmpty).toBe(false)
  })

  it('should insert multiple elements', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.size).toBe(3)
  })

  it('should maintain min on insert', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    expect(heap.getMin()).toBe(5)
    heap.insert(3)
    expect(heap.getMin()).toBe(3)
    heap.insert(7)
    expect(heap.getMin()).toBe(3)
    heap.insert(1)
    expect(heap.getMin()).toBe(1)
  })

  it('should maintain max on insert', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    expect(heap.getMax()).toBe(5)
    heap.insert(3)
    expect(heap.getMax()).toBe(5)
    heap.insert(7)
    expect(heap.getMax()).toBe(7)
    heap.insert(10)
    expect(heap.getMax()).toBe(10)
  })

  it('should handle negative values', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(-5)
    heap.insert(-10)
    heap.insert(3)
    expect(heap.getMin()).toBe(-10)
    expect(heap.getMax()).toBe(3)
  })

  it('should handle zero', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(0)
    expect(heap.getMin()).toBe(0)
    expect(heap.getMax()).toBe(0)
  })

  it('should handle duplicate values', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(5)
    expect(heap.size).toBe(3)
    expect(heap.getMin()).toBe(5)
    expect(heap.getMax()).toBe(5)
  })

  it('should handle floating point values', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(3.14)
    heap.insert(2.71)
    heap.insert(1.41)
    expect(heap.getMin()).toBeCloseTo(1.41)
    expect(heap.getMax()).toBeCloseTo(3.14)
  })
})

describe('IntervalHeap getMin', () => {
  it('should throw on empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(() => heap.getMin()).toThrow('getMin called on empty heap')
  })

  it('should return min without removing', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.getMin()).toBe(3)
    expect(heap.size).toBe(3)
    expect(heap.getMin()).toBe(3)
  })

  it('should update after insert', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(10)
    expect(heap.getMin()).toBe(10)
    heap.insert(5)
    expect(heap.getMin()).toBe(5)
  })

  it('should update after deleteMin', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.getMin()).toBe(1)
    heap.deleteMin()
    expect(heap.getMin()).toBe(2)
  })
})

describe('IntervalHeap getMax', () => {
  it('should throw on empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(() => heap.getMax()).toThrow('getMax called on empty heap')
  })

  it('should return max without removing', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.getMax()).toBe(7)
    expect(heap.size).toBe(3)
    expect(heap.getMax()).toBe(7)
  })

  it('should update after insert', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    expect(heap.getMax()).toBe(5)
    heap.insert(10)
    expect(heap.getMax()).toBe(10)
  })

  it('should update after deleteMax', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.getMax()).toBe(3)
    heap.deleteMax()
    expect(heap.getMax()).toBe(2)
  })
})

describe('IntervalHeap deleteMin', () => {
  it('should throw on empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(() => heap.deleteMin()).toThrow('deleteMin called on empty heap')
  })

  it('should delete single element', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(10)
    const result = heap.deleteMin()
    expect(result).toBe(10)
    expect(heap.size).toBe(0)
    expect(heap.isEmpty).toBe(true)
  })

  it('should delete min from two elements', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    expect(heap.deleteMin()).toBe(3)
    expect(heap.deleteMin()).toBe(5)
    expect(heap.isEmpty).toBe(true)
  })

  it('should delete in sorted order', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(4)
    expect(heap.deleteMin()).toBe(1)
    expect(heap.deleteMin()).toBe(3)
    expect(heap.deleteMin()).toBe(4)
    expect(heap.deleteMin()).toBe(5)
    expect(heap.deleteMin()).toBe(7)
  })

  it('should maintain max after deleteMin', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(10)
    heap.insert(3)
    heap.deleteMin()
    expect(heap.getMax()).toBe(10)
  })

  it('should update size after deletion', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.deleteMin()
    expect(heap.size).toBe(2)
    heap.deleteMin()
    expect(heap.size).toBe(1)
  })

  it('should handle delete after many inserts', () => {
    const heap = new IntervalHeap<number>()
    for (let i = 50; i >= 1; i--) {
      heap.insert(i)
    }
    for (let i = 1; i <= 50; i++) {
      expect(heap.deleteMin()).toBe(i)
    }
    expect(heap.isEmpty).toBe(true)
  })

  it('should handle duplicate values deletion', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(1)
    heap.insert(1)
    expect(heap.deleteMin()).toBe(1)
    expect(heap.deleteMin()).toBe(1)
    expect(heap.deleteMin()).toBe(1)
  })
})

describe('IntervalHeap deleteMax', () => {
  it('should throw on empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(() => heap.deleteMax()).toThrow('deleteMax called on empty heap')
  })

  it('should delete single element', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(10)
    const result = heap.deleteMax()
    expect(result).toBe(10)
    expect(heap.size).toBe(0)
    expect(heap.isEmpty).toBe(true)
  })

  it('should delete max from two elements', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    expect(heap.deleteMax()).toBe(5)
    expect(heap.deleteMax()).toBe(3)
    expect(heap.isEmpty).toBe(true)
  })

  it('should delete in reverse sorted order', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    heap.insert(4)
    expect(heap.deleteMax()).toBe(7)
    expect(heap.deleteMax()).toBe(5)
    expect(heap.deleteMax()).toBe(4)
    expect(heap.deleteMax()).toBe(3)
    expect(heap.deleteMax()).toBe(1)
  })

  it('should maintain min after deleteMax', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(10)
    heap.insert(3)
    heap.deleteMax()
    expect(heap.getMin()).toBe(3)
  })

  it('should update size after deletion', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.deleteMax()
    expect(heap.size).toBe(2)
    heap.deleteMax()
    expect(heap.size).toBe(1)
  })

  it('should handle delete after many inserts', () => {
    const heap = new IntervalHeap<number>()
    for (let i = 1; i <= 50; i++) {
      heap.insert(i)
    }
    for (let i = 50; i >= 1; i--) {
      expect(heap.deleteMax()).toBe(i)
    }
    expect(heap.isEmpty).toBe(true)
  })

  it('should handle duplicate values deletion', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(5)
    heap.insert(5)
    expect(heap.deleteMax()).toBe(5)
    expect(heap.deleteMax()).toBe(5)
    expect(heap.deleteMax()).toBe(5)
  })
})

describe('IntervalHeap replaceMin', () => {
  it('should throw on empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(() => heap.replaceMin(1)).toThrow('replaceMin called on empty heap')
  })

  it('should replace min value', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const old = heap.replaceMin(1)
    expect(old).toBe(3)
    expect(heap.getMin()).toBe(1)
  })

  it('should replace with larger value', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const old = heap.replaceMin(10)
    expect(old).toBe(3)
    expect(heap.getMin()).toBe(5)
  })

  it('should replace with same value', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    const old = heap.replaceMin(3)
    expect(old).toBe(3)
    expect(heap.getMin()).toBe(3)
  })

  it('should maintain heap size', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.size).toBe(3)
    heap.replaceMin(0)
    expect(heap.size).toBe(3)
  })

  it('should maintain max after replace', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(10)
    heap.replaceMin(1)
    expect(heap.getMax()).toBe(10)
  })
})

describe('IntervalHeap replaceMax', () => {
  it('should throw on empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(() => heap.replaceMax(1)).toThrow('replaceMax called on empty heap')
  })

  it('should replace max value', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const old = heap.replaceMax(10)
    expect(old).toBe(7)
    expect(heap.getMax()).toBe(10)
  })

  it('should replace with smaller value', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const old = heap.replaceMax(1)
    expect(old).toBe(7)
    expect(heap.getMax()).toBe(5)
  })

  it('should replace with same value', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    const old = heap.replaceMax(7)
    expect(old).toBe(7)
    expect(heap.getMax()).toBe(7)
  })

  it('should maintain heap size', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.size).toBe(3)
    heap.replaceMax(10)
    expect(heap.size).toBe(3)
  })

  it('should maintain min after replace', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(5)
    heap.insert(10)
    heap.replaceMax(15)
    expect(heap.getMin()).toBe(1)
  })
})

describe('IntervalHeap size getter', () => {
  it('should return 0 on empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(heap.size).toBe(0)
  })

  it('should return 1 after single insert', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    expect(heap.size).toBe(1)
  })

  it('should return correct size after multiple inserts', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    expect(heap.size).toBe(3)
  })

  it('should decrease after deleteMin', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.deleteMin()
    expect(heap.size).toBe(2)
  })

  it('should decrease after deleteMax', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.deleteMax()
    expect(heap.size).toBe(2)
  })

  it('should return 0 after clear', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.clear()
    expect(heap.size).toBe(0)
  })
})

describe('IntervalHeap isEmpty getter', () => {
  it('should return true on new heap', () => {
    const heap = new IntervalHeap<number>()
    expect(heap.isEmpty).toBe(true)
  })

  it('should return false after insert', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    expect(heap.isEmpty).toBe(false)
  })

  it('should return true after all elements extracted', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.deleteMin()
    heap.deleteMin()
    expect(heap.isEmpty).toBe(true)
  })

  it('should return true after clear', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.clear()
    expect(heap.isEmpty).toBe(true)
  })
})

describe('IntervalHeap clear', () => {
  it('should empty non-empty heap', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty).toBe(true)
  })

  it('should clear heap with one element', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty).toBe(true)
  })

  it('should allow reuse after clear', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.clear()
    heap.insert(5)
    expect(heap.size).toBe(1)
    expect(heap.getMin()).toBe(5)
    expect(heap.getMax()).toBe(5)
  })

  it('should handle clear on already empty heap', () => {
    const heap = new IntervalHeap<number>()
    heap.clear()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty).toBe(true)
  })
})

describe('IntervalHeap toArray', () => {
  it('should return empty array for empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(heap.toArray()).toEqual([])
  })

  it('should return sorted array', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    const arr = heap.toArray()
    expect(arr).toEqual([1, 3, 5, 7])
  })

  it('should contain all inserted values', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(10)
    heap.insert(20)
    heap.insert(30)
    const arr = heap.toArray()
    expect(arr).toContain(10)
    expect(arr).toContain(20)
    expect(arr).toContain(30)
  })

  it('should not modify heap', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.toArray()
    expect(heap.size).toBe(3)
    expect(heap.getMin()).toBe(3)
  })

  it('should handle duplicate values', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(5)
    heap.insert(3)
    const arr = heap.toArray()
    expect(arr).toEqual([3, 3, 5, 5])
  })
})

describe('IntervalHeap contains', () => {
  it('should return false on empty heap', () => {
    const heap = new IntervalHeap<number>()
    expect(heap.contains(1)).toBe(false)
  })

  it('should return true for existing value', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.contains(5)).toBe(true)
    expect(heap.contains(3)).toBe(true)
    expect(heap.contains(7)).toBe(true)
  })

  it('should return false for non-existing value', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    expect(heap.contains(1)).toBe(false)
    expect(heap.contains(10)).toBe(false)
  })

  it('should find values after multiple inserts', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(3)
    heap.insert(1)
    heap.insert(4)
    expect(heap.contains(3)).toBe(true)
    expect(heap.contains(1)).toBe(true)
    expect(heap.contains(4)).toBe(true)
    expect(heap.contains(2)).toBe(false)
  })

  it('should handle duplicate values', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(5)
    expect(heap.contains(5)).toBe(true)
  })

  it('should find value after deleteMin', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    heap.deleteMin()
    expect(heap.contains(2)).toBe(true)
    expect(heap.contains(1)).toBe(false)
  })

  it('should return false after clear', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.clear()
    expect(heap.contains(5)).toBe(false)
  })
})

describe('IntervalHeap merge', () => {
  it('should merge two non-empty heaps', () => {
    const heap1 = new IntervalHeap<number>()
    const heap2 = new IntervalHeap<number>()
    heap1.insert(5)
    heap1.insert(10)
    heap2.insert(3)
    heap2.insert(7)
    heap1.merge(heap2)
    expect(heap1.size).toBe(4)
    expect(heap1.getMin()).toBe(3)
    expect(heap1.getMax()).toBe(10)
    expect(heap2.isEmpty).toBe(true)
  })

  it('should merge empty with non-empty', () => {
    const heap1 = new IntervalHeap<number>()
    const heap2 = new IntervalHeap<number>()
    heap2.insert(1)
    heap1.merge(heap2)
    expect(heap1.size).toBe(1)
    expect(heap1.getMin()).toBe(1)
    expect(heap2.isEmpty).toBe(true)
  })

  it('should merge non-empty with empty', () => {
    const heap1 = new IntervalHeap<number>()
    const heap2 = new IntervalHeap<number>()
    heap1.insert(1)
    heap1.merge(heap2)
    expect(heap1.size).toBe(1)
  })

  it('should merge two empty heaps', () => {
    const heap1 = new IntervalHeap<number>()
    const heap2 = new IntervalHeap<number>()
    heap1.merge(heap2)
    expect(heap1.size).toBe(0)
    expect(heap1.isEmpty).toBe(true)
  })

  it('should not merge with itself', () => {
    const heap1 = new IntervalHeap<number>()
    heap1.insert(1)
    heap1.insert(2)
    heap1.merge(heap1)
    expect(heap1.size).toBe(2)
  })

  it('should extract in order after merge', () => {
    const heap1 = new IntervalHeap<number>()
    const heap2 = new IntervalHeap<number>()
    heap1.insert(5)
    heap1.insert(1)
    heap2.insert(3)
    heap2.insert(2)
    heap2.insert(4)
    heap1.merge(heap2)
    expect(heap1.deleteMin()).toBe(1)
    expect(heap1.deleteMin()).toBe(2)
    expect(heap1.deleteMin()).toBe(3)
    expect(heap1.deleteMin()).toBe(4)
    expect(heap1.deleteMin()).toBe(5)
  })

  it('should clear other heap after merge', () => {
    const heap1 = new IntervalHeap<number>()
    const heap2 = new IntervalHeap<number>()
    heap1.insert(1)
    heap2.insert(2)
    heap1.merge(heap2)
    expect(heap2.size).toBe(0)
    expect(heap2.isEmpty).toBe(true)
  })
})

describe('IntervalHeap Symbol.iterator', () => {
  it('should iterate over empty heap', () => {
    const heap = new IntervalHeap<number>()
    const values = [...heap]
    expect(values).toEqual([])
  })

  it('should iterate over all elements', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const values = [...heap]
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('should work with for-of loop', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(1)
    heap.insert(2)
    heap.insert(3)
    const values: number[] = []
    for (const value of heap) {
      values.push(value)
    }
    expect(values.length).toBe(3)
  })

  it('should return sorted values', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.insert(7)
    heap.insert(1)
    const values = [...heap]
    expect(values).toEqual([1, 3, 5, 7])
  })
})

describe('IntervalHeap edge cases', () => {
  it('should handle string values', () => {
    const heap = new IntervalHeap<string>()
    heap.insert('banana')
    heap.insert('apple')
    heap.insert('cherry')
    expect(heap.deleteMin()).toBe('apple')
    expect(heap.deleteMin()).toBe('banana')
    expect(heap.deleteMin()).toBe('cherry')
  })

  it('should handle object values with comparator', () => {
    interface Item {
      id: number
    }
    const heap = new IntervalHeap<Item>({
      comparator: (a, b) => a.id - b.id,
    })
    heap.insert({ id: 3 })
    heap.insert({ id: 1 })
    heap.insert({ id: 2 })
    expect(heap.deleteMin()!.id).toBe(1)
    expect(heap.deleteMin()!.id).toBe(2)
    expect(heap.deleteMin()!.id).toBe(3)
  })

  it('should handle negative values extraction', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(-3)
    heap.insert(-1)
    heap.insert(-5)
    expect(heap.deleteMin()).toBe(-5)
    expect(heap.deleteMin()).toBe(-3)
    expect(heap.deleteMin()).toBe(-1)
  })

  it('should handle large range of values', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(-100)
    heap.insert(0)
    heap.insert(100)
    expect(heap.deleteMin()).toBe(-100)
    expect(heap.deleteMin()).toBe(0)
    expect(heap.deleteMin()).toBe(100)
  })

  it('should handle interleaved operations', () => {
    const heap = new IntervalHeap<number>()
    heap.insert(5)
    heap.insert(3)
    heap.deleteMin()
    heap.insert(1)
    heap.insert(7)
    expect(heap.deleteMin()).toBe(1)
    expect(heap.deleteMin()).toBe(5)
    expect(heap.deleteMin()).toBe(7)
  })
})

describe('IntervalHeap stress tests', () => {
  it('should handle 100 elements', () => {
    const heap = new IntervalHeap<number>()
    for (let i = 100; i >= 1; i--) {
      heap.insert(i)
    }
    expect(heap.size).toBe(100)
    for (let i = 1; i <= 100; i++) {
      expect(heap.deleteMin()).toBe(i)
    }
    expect(heap.isEmpty).toBe(true)
  })

  it('should handle 100 random elements', () => {
    const heap = new IntervalHeap<number>()
    const values: number[] = []
    for (let i = 0; i < 100; i++) {
      const v = Math.floor(Math.random() * 10000)
      values.push(v)
      heap.insert(v)
    }
    values.sort((a, b) => a - b)
    for (let i = 0; i < 100; i++) {
      expect(heap.deleteMin()).toBe(values[i])
    }
  })

  it.skip('should handle bulk insert via initialValues', () => {
    const values: number[] = []
    for (let i = 0; i < 100; i++) {
      values.push(i)
    }
    const heap = new IntervalHeap<number>({ initialValues: values })
    expect(heap.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(heap.deleteMin()).toBe(i)
    }
  })
})
