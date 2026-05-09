import { describe, it, expect } from 'vitest'
import { IntervalHeap } from '../../src/core/interval-heap/interval-heap.js'

describe('IntervalHeap', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('creates heap with initial values', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 8, 1, 9] })
      expect(h.size()).toBe(5)
      expect(h.isEmpty()).toBe(false)
      expect(h.getMin()).toBe(1)
      expect(h.getMax()).toBe(9)
    })

    it('creates heap with single initial value', () => {
      const h = new IntervalHeap<number>({ initialValues: [42] })
      expect(h.size()).toBe(1)
      expect(h.getMin()).toBe(42)
      expect(h.getMax()).toBe(42)
    })

    it('creates heap with two initial values', () => {
      const h = new IntervalHeap<number>({ initialValues: [7, 3] })
      expect(h.size()).toBe(2)
      expect(h.getMin()).toBe(3)
      expect(h.getMax()).toBe(7)
    })

    it('accepts a custom comparator', () => {
      const h = new IntervalHeap<string>({
        comparator: (a, b) => b.localeCompare(a),
        initialValues: ['alpha', 'beta', 'gamma'],
      })
      expect(h.getMin()).toBe('gamma')
      expect(h.getMax()).toBe('alpha')
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const h = new IntervalHeap<number>()
      h.insert(10)
      expect(h.size()).toBe(1)
      expect(h.getMin()).toBe(10)
      expect(h.getMax()).toBe(10)
    })

    it('inserts two elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(10)
      expect(h.size()).toBe(2)
      expect(h.getMin()).toBe(5)
      expect(h.getMax()).toBe(10)
    })

    it('inserts two elements in reverse order', () => {
      const h = new IntervalHeap<number>()
      h.insert(10)
      h.insert(5)
      expect(h.size()).toBe(2)
      expect(h.getMin()).toBe(5)
      expect(h.getMax()).toBe(10)
    })

    it('inserts three elements', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(10)
      h.insert(3)
      expect(h.size()).toBe(3)
      expect(h.getMin()).toBe(3)
      expect(h.getMax()).toBe(10)
    })

    it('inserts many elements maintaining min/max', () => {
      const h = new IntervalHeap<number>()
      const values = [50, 30, 70, 10, 90, 20, 80, 40, 60]
      for (const v of values) h.insert(v)
      expect(h.getMin()).toBe(10)
      expect(h.getMax()).toBe(90)
      expect(h.size()).toBe(9)
    })

    it('handles duplicate values', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      h.insert(5)
      h.insert(5)
      expect(h.size()).toBe(3)
      expect(h.getMin()).toBe(5)
      expect(h.getMax()).toBe(5)
    })
  })

  describe('getMin / getMax', () => {
    it('returns undefined for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.getMin()).toBeUndefined()
      expect(h.getMax()).toBeUndefined()
    })

    it('returns same value for single element', () => {
      const h = new IntervalHeap<number>({ initialValues: [7] })
      expect(h.getMin()).toBe(7)
      expect(h.getMax()).toBe(7)
    })

    it('returns correct min and max for multiple elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 1, 4, 1, 5, 9, 2, 6] })
      expect(h.getMin()).toBe(1)
      expect(h.getMax()).toBe(9)
    })
  })

  describe('peekMin / peekMax', () => {
    it('aliases getMin and getMax', () => {
      const h = new IntervalHeap<number>({ initialValues: [2, 8, 4] })
      expect(h.peekMin()).toBe(h.getMin())
      expect(h.peekMax()).toBe(h.getMax())
    })

    it('returns undefined on empty', () => {
      const h = new IntervalHeap<number>()
      expect(h.peekMin()).toBeUndefined()
      expect(h.peekMax()).toBeUndefined()
    })
  })

  describe('extractMin', () => {
    it('returns undefined for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.extractMin()).toBeUndefined()
    })

    it('extracts from single element', () => {
      const h = new IntervalHeap<number>({ initialValues: [42] })
      expect(h.extractMin()).toBe(42)
      expect(h.isEmpty()).toBe(true)
    })

    it('extracts min from two elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 7] })
      expect(h.extractMin()).toBe(3)
      expect(h.size()).toBe(1)
      expect(h.getMin()).toBe(7)
    })

    it('extracts all elements in sorted order', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 8, 1, 9, 2, 7] })
      const sorted: number[] = []
      while (!h.isEmpty()) {
        sorted.push(h.extractMin()!)
      }
      expect(sorted).toEqual([1, 2, 3, 5, 7, 8, 9])
    })

    it('handles duplicates in extractMin', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 3, 1, 1, 2, 2] })
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result).toEqual([1, 1, 2, 2, 3, 3])
    })

    it('maintains max after extractMin', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 9, 1] })
      h.extractMin()
      expect(h.getMax()).toBe(9)
      h.extractMin()
      expect(h.getMax()).toBe(9)
    })
  })

  describe('extractMax', () => {
    it('returns undefined for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.extractMax()).toBeUndefined()
    })

    it('extracts from single element', () => {
      const h = new IntervalHeap<number>({ initialValues: [42] })
      expect(h.extractMax()).toBe(42)
      expect(h.isEmpty()).toBe(true)
    })

    it('extracts max from two elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 7] })
      expect(h.extractMax()).toBe(7)
      expect(h.size()).toBe(1)
      expect(h.getMax()).toBe(3)
    })

    it('extracts all elements in descending order', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 8, 1, 9, 2, 7] })
      const descending: number[] = []
      while (!h.isEmpty()) {
        descending.push(h.extractMax()!)
      }
      expect(descending).toEqual([9, 8, 7, 5, 3, 2, 1])
    })

    it('handles duplicates in extractMax', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 3, 1, 1, 2, 2] })
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMax()!)
      expect(result).toEqual([3, 3, 2, 2, 1, 1])
    })

    it('maintains min after extractMax', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 9, 1] })
      h.extractMax()
      expect(h.getMin()).toBe(1)
      h.extractMax()
      expect(h.getMin()).toBe(1)
    })
  })

  describe('mixed min/max extraction', () => {
    it('alternating extractMin and extractMax', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3, 4, 5, 6, 7, 8] })
      expect(h.extractMin()).toBe(1)
      expect(h.extractMax()).toBe(8)
      expect(h.extractMin()).toBe(2)
      expect(h.extractMax()).toBe(7)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMax()).toBe(6)
      expect(h.extractMin()).toBe(4)
      expect(h.extractMax()).toBe(5)
      expect(h.isEmpty()).toBe(true)
    })

    it('extract min then max then min', () => {
      const h = new IntervalHeap<number>({ initialValues: [10, 20, 30] })
      expect(h.extractMin()).toBe(10)
      expect(h.extractMax()).toBe(30)
      expect(h.extractMin()).toBe(20)
      expect(h.isEmpty()).toBe(true)
    })

    it('extract max then min', () => {
      const h = new IntervalHeap<number>({ initialValues: [10, 20, 30] })
      expect(h.extractMax()).toBe(30)
      expect(h.extractMin()).toBe(10)
      expect(h.size()).toBe(1)
    })

    it('extract min from all same values', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 5, 5, 5, 5] })
      for (let i = 0; i < 5; i++) {
        expect(h.extractMin()).toBe(5)
      }
      expect(h.isEmpty()).toBe(true)
    })
  })

  describe('size / isEmpty / clear', () => {
    it('size tracks correctly', () => {
      const h = new IntervalHeap<number>()
      expect(h.size()).toBe(0)
      h.insert(1)
      expect(h.size()).toBe(1)
      h.insert(2)
      expect(h.size()).toBe(2)
      h.insert(3)
      expect(h.size()).toBe(3)
    })

    it('isEmpty works correctly', () => {
      const h = new IntervalHeap<number>()
      expect(h.isEmpty()).toBe(true)
      h.insert(1)
      expect(h.isEmpty()).toBe(false)
      h.extractMin()
      expect(h.isEmpty()).toBe(true)
    })

    it('clear empties the heap', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3, 4, 5] })
      expect(h.size()).toBe(5)
      h.clear()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
      expect(h.getMin()).toBeUndefined()
      expect(h.getMax()).toBeUndefined()
    })

    it('can insert after clear', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3] })
      h.clear()
      h.insert(10)
      expect(h.size()).toBe(1)
      expect(h.getMin()).toBe(10)
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.contains(1)).toBe(false)
    })

    it('finds existing element', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 1, 4, 1, 5] })
      expect(h.contains(3)).toBe(true)
      expect(h.contains(1)).toBe(true)
      expect(h.contains(4)).toBe(true)
      expect(h.contains(5)).toBe(true)
    })

    it('returns false for missing element', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 1, 4, 5] })
      expect(h.contains(2)).toBe(false)
      expect(h.contains(99)).toBe(false)
    })

    it('works with custom comparator', () => {
      const h = new IntervalHeap<{ id: number }>({
        comparator: (a, b) => a.id - b.id,
        initialValues: [{ id: 1 }, { id: 2 }, { id: 3 }],
      })
      expect(h.contains({ id: 2 })).toBe(true)
      expect(h.contains({ id: 5 })).toBe(false)
    })
  })

  describe('remove', () => {
    it('returns false for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.remove(1)).toBe(false)
    })

    it('returns false for missing element', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3] })
      expect(h.remove(5)).toBe(false)
    })

    it('removes single element from heap', () => {
      const h = new IntervalHeap<number>({ initialValues: [42] })
      expect(h.remove(42)).toBe(true)
      expect(h.isEmpty()).toBe(true)
    })

    it('removes from left of a node', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 8] })
      expect(h.remove(3)).toBe(true)
      expect(h.size()).toBe(2)
      expect(h.contains(3)).toBe(false)
    })

    it('removes from right of a node', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 8] })
      expect(h.remove(8)).toBe(true)
      expect(h.size()).toBe(2)
      expect(h.contains(8)).toBe(false)
    })

    it('maintains heap properties after removal', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 8, 1, 9, 2, 7] })
      h.remove(3)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.extractMin()!)
      const copy = [...sorted]
      copy.sort((a, b) => a - b)
      expect(sorted).toEqual(copy)
    })

    it('removes all elements one by one', () => {
      const values = [5, 3, 8, 1, 9]
      const h = new IntervalHeap<number>({ initialValues: [...values] })
      for (const v of values) {
        expect(h.remove(v)).toBe(true)
      }
      expect(h.isEmpty()).toBe(true)
    })

    it('removes and re-inserts', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 8, 1] })
      h.remove(3)
      h.insert(6)
      expect(h.contains(6)).toBe(true)
      expect(h.contains(3)).toBe(false)
      expect(h.getMin()).toBe(1)
      expect(h.getMax()).toBe(8)
    })
  })

  describe('update', () => {
    it('returns false for missing element', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3] })
      expect(h.update(5, 10)).toBe(false)
    })

    it('updates a value maintaining heap', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3, 4, 5] })
      expect(h.update(3, 10)).toBe(true)
      expect(h.getMax()).toBe(10)
      expect(h.contains(3)).toBe(false)
      expect(h.contains(10)).toBe(true)
    })

    it('updates to smaller value', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3, 4, 5] })
      expect(h.update(4, 0)).toBe(true)
      expect(h.getMin()).toBe(0)
    })

    it('updates to same value', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3] })
      expect(h.update(2, 2)).toBe(true)
      expect(h.size()).toBe(3)
    })

    it('updates and extracts correctly', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3, 4, 5] })
      h.update(3, 6)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result).toEqual([1, 2, 4, 5, 6])
    })
  })

  describe('merge', () => {
    it('merges two empty heaps', () => {
      const h1 = new IntervalHeap<number>()
      const h2 = new IntervalHeap<number>()
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(0)
    })

    it('merges empty with non-empty', () => {
      const h1 = new IntervalHeap<number>()
      const h2 = new IntervalHeap<number>({ initialValues: [1, 2, 3] })
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(3)
      expect(merged.getMin()).toBe(1)
      expect(merged.getMax()).toBe(3)
    })

    it('merges non-empty heaps', () => {
      const h1 = new IntervalHeap<number>({ initialValues: [1, 3, 5] })
      const h2 = new IntervalHeap<number>({ initialValues: [2, 4, 6] })
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(6)
      expect(merged.getMin()).toBe(1)
      expect(merged.getMax()).toBe(6)
    })

    it('does not modify original heaps', () => {
      const h1 = new IntervalHeap<number>({ initialValues: [1, 3] })
      const h2 = new IntervalHeap<number>({ initialValues: [2, 4] })
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(4)
      expect(h1.size()).toBe(2)
      expect(h2.size()).toBe(2)
    })

    it('preserves comparator', () => {
      const h1 = new IntervalHeap<number>({
        comparator: (a, b) => b - a,
        initialValues: [1, 2],
      })
      const h2 = new IntervalHeap<number>({ initialValues: [3] })
      const merged = h1.merge(h2)
      expect(merged.getMin()).toBe(3)
      expect(merged.getMax()).toBe(1)
    })
  })

  describe('clone', () => {
    it('clones empty heap', () => {
      const h = new IntervalHeap<number>()
      const c = h.clone()
      expect(c.size()).toBe(0)
    })

    it('clones with same values', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 1, 4, 1, 5] })
      const c = h.clone()
      expect(c.size()).toBe(5)
      expect(c.getMin()).toBe(h.getMin())
      expect(c.getMax()).toBe(h.getMax())
    })

    it('clone is independent', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 1, 4] })
      const c = h.clone()
      c.insert(10)
      expect(c.size()).toBe(4)
      expect(h.size()).toBe(3)
    })
  })

  describe('toArray', () => {
    it('returns empty for empty heap', () => {
      const h = new IntervalHeap<number>()
      expect(h.toArray()).toEqual([])
    })

    it('returns all elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 1, 4, 1, 5] })
      const arr = h.toArray()
      expect(arr.length).toBe(5)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 1, 3, 4, 5])
    })

    it('reflects mutations', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3] })
      h.insert(4)
      expect(h.toArray().length).toBe(4)
      h.extractMin()
      expect(h.toArray().length).toBe(3)
    })
  })

  describe('forEach', () => {
    it('iterates empty heap', () => {
      const h = new IntervalHeap<number>()
      const collected: number[] = []
      h.forEach((v) => collected.push(v))
      expect(collected).toEqual([])
    })

    it('iterates all elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 1, 2] })
      const collected: number[] = []
      h.forEach((v) => collected.push(v))
      expect(collected.length).toBe(3)
      expect(collected.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates empty heap', () => {
      const h = new IntervalHeap<number>()
      expect([...h]).toEqual([])
    })

    it('iterates all elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [3, 1, 2] })
      const arr = [...h]
      expect(arr.length).toBe(3)
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const h = new IntervalHeap<number>({ initialValues: [5, 3, 1] })
      let sum = 0
      for (const v of h) {
        sum += v
      }
      expect(sum).toBe(9)
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      const h = new IntervalHeap<number>({ initialValues: [-3, -1, -5, 0, 2] })
      expect(h.getMin()).toBe(-5)
      expect(h.getMax()).toBe(2)
    })

    it('handles large numbers', () => {
      const h = new IntervalHeap<number>({ initialValues: [Number.MAX_SAFE_INTEGER, 0, -Number.MAX_SAFE_INTEGER] })
      expect(h.getMin()).toBe(-Number.MAX_SAFE_INTEGER)
      expect(h.getMax()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('handles alternating insert extract', () => {
      const h = new IntervalHeap<number>()
      h.insert(5)
      expect(h.extractMin()).toBe(5)
      h.insert(3)
      h.insert(7)
      expect(h.extractMax()).toBe(7)
      expect(h.extractMin()).toBe(3)
      expect(h.isEmpty()).toBe(true)
    })

    it('handles insert after full extraction', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3] })
      while (!h.isEmpty()) h.extractMin()
      h.insert(10)
      expect(h.size()).toBe(1)
      expect(h.getMin()).toBe(10)
    })

    it('correctness with 4 elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [4, 2, 3, 1] })
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('correctness with 6 elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [6, 5, 4, 3, 2, 1] })
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMax()!)
      expect(result).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('correctness with 7 elements', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3, 4, 5, 6, 7] })
      const mins: number[] = []
      const maxs: number[] = []
      mins.push(h.extractMin()!)
      maxs.push(h.extractMax()!)
      mins.push(h.extractMin()!)
      maxs.push(h.extractMax()!)
      expect(mins).toEqual([1, 2])
      expect(maxs).toEqual([7, 6])
    })
  })

  describe('custom comparator', () => {
    it('descending order comparator', () => {
      const h = new IntervalHeap<number>({
        comparator: (a, b) => b - a,
        initialValues: [1, 5, 3, 2, 4],
      })
      expect(h.getMin()).toBe(5)
      expect(h.getMax()).toBe(1)
      expect(h.extractMin()).toBe(5)
      expect(h.extractMax()).toBe(1)
    })

    it('object comparator by property', () => {
      type Item = { priority: number; name: string }
      const h = new IntervalHeap<Item>({
        comparator: (a, b) => a.priority - b.priority,
        initialValues: [
          { priority: 3, name: 'c' },
          { priority: 1, name: 'a' },
          { priority: 2, name: 'b' },
        ],
      })
      const min = h.extractMin()
      expect(min!.priority).toBe(1)
      expect(min!.name).toBe('a')
      const max = h.extractMax()
      expect(max!.priority).toBe(3)
      expect(max!.name).toBe('c')
    })

    it('string length comparator', () => {
      const h = new IntervalHeap<string>({
        comparator: (a, b) => a.length - b.length,
        initialValues: ['aa', 'b', 'ccc', 'dddd'],
      })
      expect(h.getMin()).toBe('b')
      expect(h.getMax()).toBe('dddd')
    })
  })

  describe('stress test', () => {
    it('handles 200+ items extractMin sorted', () => {
      const values: number[] = []
      for (let i = 0; i < 250; i++) {
        values.push(Math.floor(Math.random() * 10000))
      }
      const h = new IntervalHeap<number>({ initialValues: values })
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result.length).toBe(250)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1])
      }
    })

    it('handles 200+ items extractMax sorted', () => {
      const values: number[] = []
      for (let i = 0; i < 250; i++) {
        values.push(Math.floor(Math.random() * 10000))
      }
      const h = new IntervalHeap<number>({ initialValues: values })
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMax()!)
      expect(result.length).toBe(250)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeLessThanOrEqual(result[i - 1])
      }
    })

    it('handles 200+ items mixed extract', () => {
      const values: number[] = []
      for (let i = 0; i < 250; i++) {
        values.push(Math.floor(Math.random() * 10000))
      }
      const h = new IntervalHeap<number>({ initialValues: values })
      const mins: number[] = []
      const maxs: number[] = []
      let turn = true
      while (!h.isEmpty()) {
        if (turn) {
          mins.push(h.extractMin()!)
        } else {
          maxs.push(h.extractMax()!)
        }
        turn = !turn
      }
      expect(mins.length + maxs.length).toBe(250)
      for (let i = 1; i < mins.length; i++) {
        expect(mins[i]).toBeGreaterThanOrEqual(mins[i - 1])
      }
      for (let i = 1; i < maxs.length; i++) {
        expect(maxs[i]).toBeLessThanOrEqual(maxs[i - 1])
      }
    })

    it('handles 500 sequential items', () => {
      const h = new IntervalHeap<number>()
      for (let i = 0; i < 500; i++) h.insert(i)
      expect(h.getMin()).toBe(0)
      expect(h.getMax()).toBe(499)
      expect(h.size()).toBe(500)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result).toEqual(Array.from({ length: 500 }, (_, i) => i))
    })

    it('handles 300 reverse sequential items', () => {
      const h = new IntervalHeap<number>()
      for (let i = 299; i >= 0; i--) h.insert(i)
      expect(h.getMin()).toBe(0)
      expect(h.getMax()).toBe(299)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result).toEqual(Array.from({ length: 300 }, (_, i) => i))
    })
  })

  describe('remove stress', () => {
    it('removes specific values from large heap', () => {
      const values = Array.from({ length: 100 }, (_, i) => i)
      const h = new IntervalHeap<number>({ initialValues: values })
      for (let i = 0; i < 100; i += 2) {
        expect(h.remove(i)).toBe(true)
      }
      expect(h.size()).toBe(50)
      const remaining = h.toArray().sort((a, b) => a - b)
      for (const v of remaining) {
        expect(v % 2).toBe(1)
      }
    })

    it('remove followed by extract maintains order', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })
      h.remove(5)
      h.remove(3)
      h.remove(8)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result).toEqual([1, 2, 4, 6, 7, 9, 10])
    })
  })

  describe('update stress', () => {
    it('updates multiple values correctly', () => {
      const h = new IntervalHeap<number>({ initialValues: [1, 2, 3, 4, 5] })
      h.update(1, 10)
      h.update(5, 0)
      expect(h.getMin()).toBe(0)
      expect(h.getMax()).toBe(10)
      const result: number[] = []
      while (!h.isEmpty()) result.push(h.extractMin()!)
      expect(result.sort((a, b) => a - b)).toEqual([0, 2, 3, 4, 10])
    })
  })

  describe('re-export', () => {
    it('IntervalHeapOptions is re-exported', () => {
      const opts: import('../../src/core/interval-heap/interval-heap.js').IntervalHeapOptions<number> = {
        initialValues: [1, 2],
        comparator: (a, b) => a - b,
      }
      const h = new IntervalHeap(opts)
      expect(h.size()).toBe(2)
    })
  })
})
