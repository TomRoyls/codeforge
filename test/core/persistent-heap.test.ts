import { describe, it, expect } from 'vitest'
import { PersistentHeap } from '../../src/core/persistent-heap/persistent-heap.js'

function createMinHeap<T>(): PersistentHeap<T> {
  return new PersistentHeap<T>()
}

function createMaxHeap(): PersistentHeap<number> {
  return new PersistentHeap<number>({
    comparator: (a, b) => b - a,
  })
}

describe('PersistentHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap with default comparator', () => {
      const heap = new PersistentHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates a heap with custom comparator (max heap)', () => {
      const heap = createMaxHeap()
      const h2 = heap.insert(1).insert(5).insert(3)
      expect(h2.peek()).toBe(5)
    })

    it('creates a heap with custom comparator for strings', () => {
      const heap = new PersistentHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      const h2 = heap.insert('cherry').insert('apple').insert('banana')
      expect(h2.peek()).toBe('apple')
    })

    it('handles no options argument', () => {
      const heap = new PersistentHeap<number>(undefined)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates independent instances', () => {
      const h1 = new PersistentHeap<number>()
      const h2 = new PersistentHeap<number>()
      expect(h1.size).toBe(0)
      expect(h2.size).toBe(0)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = createMinHeap<number>().insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('returns a new heap, leaving original unchanged', () => {
      const original = createMinHeap<number>()
      const modified = original.insert(5)
      expect(original.size).toBe(0)
      expect(original.isEmpty).toBe(true)
      expect(modified.size).toBe(1)
      expect(modified.peek()).toBe(5)
    })

    it('inserts multiple elements in order', () => {
      const heap = createMinHeap<number>().insert(1).insert(2).insert(3)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('inserts multiple elements in reverse order', () => {
      const heap = createMinHeap<number>().insert(3).insert(2).insert(1)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('inserts duplicate values', () => {
      const heap = createMinHeap<number>().insert(5).insert(5).insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('inserts negative numbers', () => {
      const heap = createMinHeap<number>().insert(-3).insert(-1).insert(-5)
      expect(heap.peek()).toBe(-5)
    })

    it('inserts zero', () => {
      const heap = createMinHeap<number>().insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('inserts floating point numbers', () => {
      const heap = createMinHeap<number>().insert(3.14).insert(2.71).insert(1.41)
      expect(heap.peek()).toBeCloseTo(1.41)
    })

    it('inserts into max heap', () => {
      const heap = createMaxHeap().insert(1).insert(5).insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('inserts many equal elements', () => {
      let heap = createMinHeap<number>()
      for (let i = 0; i < 50; i++) {
        heap = heap.insert(42)
      }
      expect(heap.size).toBe(50)
      expect(heap.peek()).toBe(42)
    })

    it('chain insert preserves all previous versions', () => {
      const h0 = createMinHeap<number>()
      const h1 = h0.insert(3)
      const h2 = h1.insert(1)
      const h3 = h2.insert(2)
      expect(h0.size).toBe(0)
      expect(h1.size).toBe(1)
      expect(h1.peek()).toBe(3)
      expect(h2.size).toBe(2)
      expect(h2.peek()).toBe(1)
      expect(h3.size).toBe(3)
      expect(h3.peek()).toBe(1)
    })

    it('maintains valid leftist property after many inserts', () => {
      let heap = createMinHeap<number>()
      for (let i = 20; i >= 1; i--) {
        heap = heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('insert persistence', () => {
    it('original heap remains unchanged after insert', () => {
      const original = createMinHeap<number>().insert(1).insert(2).insert(3)
      const modified = original.insert(0)
      expect(original.size).toBe(3)
      expect(original.peek()).toBe(1)
      expect(modified.size).toBe(4)
      expect(modified.peek()).toBe(0)
    })

    it('multiple inserts from same base produce independent heaps', () => {
      const base = createMinHeap<number>().insert(5)
      const h1 = base.insert(1)
      const h2 = base.insert(10)
      expect(base.size).toBe(1)
      expect(base.peek()).toBe(5)
      expect(h1.size).toBe(2)
      expect(h1.peek()).toBe(1)
      expect(h2.size).toBe(2)
      expect(h2.peek()).toBe(5)
    })

    it('branching inserts maintain full persistence', () => {
      const root = createMinHeap<number>().insert(5)
      const left = root.insert(3).insert(1)
      const right = root.insert(7).insert(9)
      expect(root.size).toBe(1)
      expect(root.peek()).toBe(5)
      expect(left.size).toBe(3)
      expect(left.peek()).toBe(1)
      expect(right.size).toBe(3)
      expect(right.peek()).toBe(5)
    })

    it('deep chain of inserts preserves all intermediate heaps', () => {
      const heaps: PersistentHeap<number>[] = [createMinHeap<number>()]
      for (let i = 0; i < 10; i++) {
        heaps.push(heaps[heaps.length - 1]!.insert(i))
      }
      for (let i = 0; i <= 10; i++) {
        expect(heaps[i]!.size).toBe(i)
      }
      expect(heaps[10]!.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('deleteMin', () => {
    it('returns undefined on empty heap', () => {
      const heap = createMinHeap<number>()
      expect(heap.deleteMin()).toBeUndefined()
    })

    it('deletes the only element', () => {
      const heap = createMinHeap<number>().insert(5)
      const result = heap.deleteMin()!
      expect(result.value).toBe(5)
      expect(result.heap.size).toBe(0)
      expect(result.heap.isEmpty).toBe(true)
    })

    it('deletes elements in sorted order', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      const r1 = heap.deleteMin()!
      expect(r1.value).toBe(1)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(2)
      const r3 = r2.heap.deleteMin()!
      expect(r3.value).toBe(3)
      expect(r3.heap.isEmpty).toBe(true)
    })

    it('deletes from max heap in reverse sorted order', () => {
      const heap = createMaxHeap().insert(1).insert(5).insert(3)
      const r1 = heap.deleteMin()!
      expect(r1.value).toBe(5)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(3)
      const r3 = r2.heap.deleteMin()!
      expect(r3.value).toBe(1)
    })

    it('handles duplicate values during deletion', () => {
      const heap = createMinHeap<number>().insert(2).insert(2).insert(1)
      const r1 = heap.deleteMin()!
      expect(r1.value).toBe(1)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(2)
      const r3 = r2.heap.deleteMin()!
      expect(r3.value).toBe(2)
    })

    it('handles negative numbers', () => {
      const heap = createMinHeap<number>().insert(-5).insert(-1).insert(-3)
      const r1 = heap.deleteMin()!
      expect(r1.value).toBe(-5)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(-3)
      const r3 = r2.heap.deleteMin()!
      expect(r3.value).toBe(-1)
    })

    it('returns undefined repeatedly on empty heap', () => {
      const heap = createMinHeap<number>()
      expect(heap.deleteMin()).toBeUndefined()
      expect(heap.deleteMin()).toBeUndefined()
    })
  })

  describe('deleteMin persistence', () => {
    it('original heap unchanged after deleteMin', () => {
      const original = createMinHeap<number>().insert(1).insert(2).insert(3)
      const result = original.deleteMin()!
      expect(original.size).toBe(3)
      expect(original.peek()).toBe(1)
      expect(result.heap.size).toBe(2)
      expect(result.heap.peek()).toBe(2)
    })

    it('multiple deleteMins from same base produce independent heaps', () => {
      const base = createMinHeap<number>().insert(1).insert(2).insert(3)
      const r1 = base.deleteMin()!
      const r2 = r1.heap.deleteMin()!
      expect(base.size).toBe(3)
      expect(r1.heap.size).toBe(2)
      expect(r2.heap.size).toBe(1)
    })

    it('deleteMin on cloned heap does not affect original', () => {
      const original = createMinHeap<number>().insert(1).insert(2).insert(3)
      const cloned = original.clone()
      const result = cloned.deleteMin()!
      expect(original.size).toBe(3)
      expect(cloned.size).toBe(3)
      expect(result.heap.size).toBe(2)
    })

    it('interleaved insert and deleteMin preserve all versions', () => {
      const h0 = createMinHeap<number>().insert(5).insert(3)
      const d1 = h0.deleteMin()!
      expect(d1.value).toBe(3)
      const h1 = d1.heap.insert(1)
      const d2 = h1.deleteMin()!
      expect(d2.value).toBe(1)
      const d3 = d2.heap.deleteMin()!
      expect(d3.value).toBe(5)
      expect(h0.size).toBe(2)
      expect(h0.peek()).toBe(3)
      expect(h1.size).toBe(2)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty heap', () => {
      const heap = createMinHeap<number>()
      expect(heap.peek()).toBeUndefined()
    })

    it('returns the minimum element', () => {
      const heap = createMinHeap<number>().insert(5).insert(3).insert(7)
      expect(heap.peek()).toBe(3)
    })

    it('does not modify the heap', () => {
      const heap = createMinHeap<number>().insert(5)
      expect(heap.peek()).toBe(5)
      expect(heap.peek()).toBe(5)
      expect(heap.size).toBe(1)
    })

    it('returns maximum element in max heap', () => {
      const heap = createMaxHeap().insert(3).insert(7).insert(1)
      expect(heap.peek()).toBe(7)
    })

    it('peek after deleteMin shows next min', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      const result = heap.deleteMin()!
      expect(result.heap.peek()).toBe(2)
    })

    it('peek on immutable snapshots returns consistent values', () => {
      const h = createMinHeap<number>().insert(3).insert(1).insert(2)
      expect(h.peek()).toBe(1)
      expect(h.peek()).toBe(1)
      expect(h.peek()).toBe(1)
    })
  })

  describe('merge', () => {
    it('merges two empty heaps', () => {
      const h1 = createMinHeap<number>()
      const h2 = createMinHeap<number>()
      const merged = h1.merge(h2)
      expect(merged.size).toBe(0)
      expect(merged.isEmpty).toBe(true)
    })

    it('merges empty heap with non-empty heap', () => {
      const h1 = createMinHeap<number>()
      const h2 = createMinHeap<number>().insert(1).insert(2)
      const merged = h1.merge(h2)
      expect(merged.size).toBe(2)
      expect(merged.peek()).toBe(1)
    })

    it('merges non-empty heap with empty heap', () => {
      const h1 = createMinHeap<number>().insert(1).insert(2)
      const h2 = createMinHeap<number>()
      const merged = h1.merge(h2)
      expect(merged.size).toBe(2)
      expect(merged.peek()).toBe(1)
    })

    it('merges two non-empty heaps', () => {
      const h1 = createMinHeap<number>().insert(1).insert(3).insert(5)
      const h2 = createMinHeap<number>().insert(2).insert(4).insert(6)
      const merged = h1.merge(h2)
      expect(merged.size).toBe(6)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('does not modify original heaps', () => {
      const h1 = createMinHeap<number>().insert(1).insert(3)
      const h2 = createMinHeap<number>().insert(2).insert(4)
      const merged = h1.merge(h2)
      expect(merged.size).toBe(4)
      expect(h1.size).toBe(2)
      expect(h2.size).toBe(2)
      expect(h1.peek()).toBe(1)
      expect(h2.peek()).toBe(2)
    })

    it('merged heap has valid leftist property', () => {
      let h1 = createMinHeap<number>()
      for (let i = 1; i <= 10; i++) h1 = h1.insert(i * 2)
      let h2 = createMinHeap<number>()
      for (let i = 0; i < 10; i++) h2 = h2.insert(i * 2 + 1)
      const merged = h1.merge(h2)
      expect(merged.isValid()).toBe(true)
    })

    it('merges heaps with overlapping values', () => {
      const h1 = createMinHeap<number>().insert(1).insert(3).insert(5)
      const h2 = createMinHeap<number>().insert(1).insert(3).insert(5)
      const merged = h1.merge(h2)
      expect(merged.toArray()).toEqual([1, 1, 3, 3, 5, 5])
    })

    it('merges max heaps correctly', () => {
      const h1 = createMaxHeap().insert(1).insert(3)
      const h2 = createMaxHeap().insert(2).insert(4)
      const merged = h1.merge(h2)
      expect(merged.size).toBe(4)
      expect(merged.peek()).toBe(4)
    })

    it('merged heap elements delete in order', () => {
      const h1 = createMinHeap<number>().insert(10).insert(30).insert(50)
      const h2 = createMinHeap<number>().insert(20).insert(40).insert(60)
      const merged = h1.merge(h2)
      let current = merged
      for (let i = 10; i <= 60; i += 10) {
        const r = current.deleteMin()!
        expect(r.value).toBe(i)
        current = r.heap
      }
    })

    it('merging single-element heaps', () => {
      const h1 = createMinHeap<number>().insert(2)
      const h2 = createMinHeap<number>().insert(1)
      const merged = h1.merge(h2)
      const r1 = merged.deleteMin()!
      expect(r1.value).toBe(1)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(2)
    })

    it('merging heap with itself produces double', () => {
      const h1 = createMinHeap<number>().insert(1).insert(2).insert(3)
      const merged = h1.merge(h1)
      expect(merged.size).toBe(6)
      expect(merged.toArray()).toEqual([1, 1, 2, 2, 3, 3])
      expect(h1.size).toBe(3)
    })

    it('merge chain of three heaps', () => {
      const h1 = createMinHeap<number>().insert(1).insert(4)
      const h2 = createMinHeap<number>().insert(2).insert(5)
      const h3 = createMinHeap<number>().insert(3).insert(6)
      const merged = h1.merge(h2).merge(h3)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
      expect(h1.size).toBe(2)
    })

    it('merge preserves both source heaps', () => {
      const h1 = createMinHeap<number>().insert(1).insert(4).insert(5)
      const h2 = createMinHeap<number>().insert(2).insert(3).insert(6)
      const merged = h1.merge(h2)
      expect(h1.toArray()).toEqual([1, 4, 5])
      expect(h2.toArray()).toEqual([2, 3, 6])
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const heap = createMinHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const h1 = createMinHeap<number>().insert(1)
      expect(h1.size).toBe(1)
      const h2 = h1.insert(2)
      expect(h2.size).toBe(2)
      const h3 = h2.insert(3)
      expect(h3.size).toBe(3)
    })

    it('returns correct size after deleteMins', () => {
      const heap = createMinHeap<number>().insert(1).insert(2).insert(3)
      const r1 = heap.deleteMin()!
      expect(r1.heap.size).toBe(2)
      const r2 = r1.heap.deleteMin()!
      expect(r2.heap.size).toBe(1)
      const r3 = r2.heap.deleteMin()!
      expect(r3.heap.size).toBe(0)
    })

    it('size is a getter', () => {
      const heap = createMinHeap<number>().insert(1)
      expect(typeof heap.size).toBe('number')
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const heap = createMinHeap<number>()
      expect(heap.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = createMinHeap<number>().insert(1)
      expect(heap.isEmpty).toBe(false)
    })

    it('returns true after deleting all elements', () => {
      const heap = createMinHeap<number>().insert(1)
      const result = heap.deleteMin()!
      expect(result.heap.isEmpty).toBe(true)
    })

    it('isEmpty is a getter', () => {
      const heap = createMinHeap<number>()
      expect(typeof heap.isEmpty).toBe('boolean')
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = createMinHeap<number>()
      expect(heap.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const heap = createMinHeap<number>().insert(5)
      expect(heap.toArray()).toEqual([5])
    })

    it('returns sorted array', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })

    it('returns sorted array for max heap', () => {
      const heap = createMaxHeap().insert(1).insert(3).insert(2)
      expect(heap.toArray()).toEqual([3, 2, 1])
    })

    it('does not modify the heap', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      const arr = heap.toArray()
      expect(arr).toEqual([1, 2, 3])
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('handles duplicates', () => {
      const heap = createMinHeap<number>().insert(2).insert(1).insert(2).insert(1)
      expect(heap.toArray()).toEqual([1, 1, 2, 2])
    })

    it('handles negative numbers', () => {
      const heap = createMinHeap<number>().insert(-3).insert(0).insert(-1).insert(2)
      expect(heap.toArray()).toEqual([-3, -1, 0, 2])
    })

    it('multiple toArray calls return same result', () => {
      const heap = createMinHeap<number>().insert(5).insert(3).insert(1)
      expect(heap.toArray()).toEqual([1, 3, 5])
      expect(heap.toArray()).toEqual([1, 3, 5])
    })

    it('toArray after partial deleteMin', () => {
      const heap = createMinHeap<number>().insert(5).insert(3).insert(1)
      const r = heap.deleteMin()!
      expect(r.heap.toArray()).toEqual([3, 5])
    })

    it('toArray after merge', () => {
      const h1 = createMinHeap<number>().insert(1).insert(5)
      const h2 = createMinHeap<number>().insert(2).insert(4).insert(3)
      const merged = h1.merge(h2)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty heap', () => {
      const heap = createMinHeap<number>()
      let count = 0
      heap.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each element in order', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const heap = createMinHeap<number>().insert(10).insert(20).insert(30)
      const indices: number[] = []
      heap.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('forEach does not modify heap', () => {
      const heap = createMinHeap<number>().insert(1).insert(2)
      heap.forEach(() => {})
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(1)
    })

    it('forEach on single element', () => {
      const heap = createMinHeap<number>().insert(42)
      const values: number[] = []
      heap.forEach((v) => values.push(v))
      expect(values).toEqual([42])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('returns empty iterator for empty heap', () => {
      const heap = createMinHeap<number>()
      const result = [...heap]
      expect(result).toEqual([])
    })

    it('iterates elements in sorted order', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      expect([...heap]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const heap = createMinHeap<number>().insert(5).insert(1).insert(3)
      const values: number[] = []
      for (const v of heap) {
        values.push(v)
      }
      expect(values).toEqual([1, 3, 5])
    })

    it('iterator does not modify heap', () => {
      const heap = createMinHeap<number>().insert(1).insert(2)
      const arr = [...heap]
      expect(arr).toEqual([1, 2])
      expect(heap.size).toBe(2)
    })

    it('iterator works with spread in function call', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      expect(Math.max(...heap)).toBe(3)
      expect(Math.min(...heap)).toBe(1)
    })

    it('works with destructuring', () => {
      const heap = createMinHeap<number>().insert(1).insert(2).insert(3)
      const [first, second, third] = heap
      expect(first).toBe(1)
      expect(second).toBe(2)
      expect(third).toBe(3)
    })

    it('can be used with Array.from', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      const arr = Array.from(heap)
      expect(arr).toEqual([1, 2, 3])
    })
  })

  describe('from', () => {
    it('creates heap from empty array', () => {
      const heap = PersistentHeap.from<number>([])
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('creates heap from single element array', () => {
      const heap = PersistentHeap.from([5])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('creates heap from multiple elements', () => {
      const heap = PersistentHeap.from([3, 1, 2])
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })

    it('creates heap from already sorted array', () => {
      const heap = PersistentHeap.from([1, 2, 3, 4, 5])
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('creates heap from reverse sorted array', () => {
      const heap = PersistentHeap.from([5, 4, 3, 2, 1])
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('creates heap with custom comparator', () => {
      const heap = PersistentHeap.from([1, 3, 2], {
        comparator: (a, b) => b - a,
      })
      expect(heap.peek()).toBe(3)
    })

    it('creates heap from strings', () => {
      const heap = PersistentHeap.from(['cherry', 'apple', 'banana'])
      expect(heap.peek()).toBe('apple')
    })

    it('creates heap with duplicates', () => {
      const heap = PersistentHeap.from([2, 1, 2, 1])
      expect(heap.toArray()).toEqual([1, 1, 2, 2])
    })

    it('creates heap with negative numbers', () => {
      const heap = PersistentHeap.from([-3, 0, -1, 2])
      expect(heap.toArray()).toEqual([-3, -1, 0, 2])
    })

    it('from does not modify input array', () => {
      const arr = [3, 1, 2]
      PersistentHeap.from(arr)
      expect(arr).toEqual([3, 1, 2])
    })
  })

  describe('clone', () => {
    it('clones an empty heap', () => {
      const heap = createMinHeap<number>()
      const cloned = heap.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones a non-empty heap', () => {
      const heap = createMinHeap<number>().insert(3).insert(1).insert(2)
      const cloned = heap.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('clone is independent of original', () => {
      const original = createMinHeap<number>().insert(1).insert(2).insert(3)
      const cloned = original.clone()
      const result = cloned.deleteMin()!
      expect(original.size).toBe(3)
      expect(result.heap.size).toBe(2)
    })

    it('clone preserves comparator', () => {
      const heap = createMaxHeap().insert(1).insert(5).insert(3)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(5)
      const r1 = cloned.deleteMin()!
      expect(r1.value).toBe(5)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(3)
      const r3 = r2.heap.deleteMin()!
      expect(r3.value).toBe(1)
    })

    it('clone toArray matches original toArray', () => {
      let heap = createMinHeap<number>()
      for (let i = 0; i < 15; i++) {
        heap = heap.insert(Math.floor(Math.random() * 100))
      }
      const cloned = heap.clone()
      expect(cloned.toArray()).toEqual(heap.toArray())
    })

    it('double clone', () => {
      let heap = createMinHeap<number>()
      for (let i = 0; i < 5; i++) heap = heap.insert(i)
      const cloned = heap.clone().clone()
      expect(cloned.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('clone of empty heap is usable', () => {
      const heap = createMinHeap<number>()
      const cloned = heap.clone()
      const modified = cloned.insert(1)
      expect(modified.peek()).toBe(1)
      expect(heap.isEmpty).toBe(true)
    })
  })

  describe('isValid', () => {
    it('empty heap is valid', () => {
      const heap = createMinHeap<number>()
      expect(heap.isValid()).toBe(true)
    })

    it('single element heap is valid', () => {
      const heap = createMinHeap<number>().insert(1)
      expect(heap.isValid()).toBe(true)
    })

    it('heap remains valid after inserts', () => {
      let heap = createMinHeap<number>()
      for (let i = 0; i < 20; i++) {
        heap = heap.insert(Math.floor(Math.random() * 100))
        expect(heap.isValid()).toBe(true)
      }
    })

    it('heap remains valid after deleteMins', () => {
      let heap = createMinHeap<number>()
      for (let i = 0; i < 20; i++) heap = heap.insert(i)
      let current = heap
      for (let i = 0; i < 20; i++) {
        const result = current.deleteMin()!
        current = result.heap
        expect(current.isValid()).toBe(true)
      }
    })

    it('heap remains valid after merge', () => {
      let h1 = createMinHeap<number>()
      let h2 = createMinHeap<number>()
      for (let i = 0; i < 10; i++) {
        h1 = h1.insert(i)
        h2 = h2.insert(i + 10)
      }
      const merged = h1.merge(h2)
      expect(merged.isValid()).toBe(true)
    })

    it('heap with all equal elements is valid', () => {
      let heap = createMinHeap<number>()
      for (let i = 0; i < 10; i++) heap = heap.insert(42)
      expect(heap.isValid()).toBe(true)
    })

    it('cloned heap is valid', () => {
      let heap = createMinHeap<number>()
      for (let i = 10; i >= 1; i--) heap = heap.insert(i)
      const cloned = heap.clone()
      expect(cloned.isValid()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('works with strings', () => {
      const heap = createMinHeap<string>()
        .insert('delta')
        .insert('alpha')
        .insert('charlie')
        .insert('bravo')
      expect(heap.toArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
    })

    it('works with objects using custom comparator', () => {
      type Point = { x: number; y: number }
      const heap = new PersistentHeap<Point>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      const h = heap
        .insert({ x: 3, y: 1 })
        .insert({ x: 1, y: 2 })
        .insert({ x: 1, y: 1 })
      const r1 = h.deleteMin()!
      expect(r1.value.x).toBe(1)
      expect(r1.value.y).toBe(1)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value.x).toBe(1)
      expect(r2.value.y).toBe(2)
    })

    it('handles insertion of already sorted sequence', () => {
      let heap = createMinHeap<number>()
      for (let i = 1; i <= 50; i++) heap = heap.insert(i)
      expect(heap.isValid()).toBe(true)
      expect(heap.peek()).toBe(1)
      expect(heap.toArray()).toEqual(
        Array.from({ length: 50 }, (_, i) => i + 1),
      )
    })

    it('handles insertion of reverse sorted sequence', () => {
      let heap = createMinHeap<number>()
      for (let i = 50; i >= 1; i--) heap = heap.insert(i)
      expect(heap.isValid()).toBe(true)
      expect(heap.toArray()).toEqual(
        Array.from({ length: 50 }, (_, i) => i + 1),
      )
    })

    it('handles single element edge case', () => {
      const heap = createMinHeap<number>().insert(42)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
      const result = heap.deleteMin()!
      expect(result.value).toBe(42)
      expect(result.heap.isEmpty).toBe(true)
      expect(result.heap.peek()).toBeUndefined()
      expect(result.heap.deleteMin()).toBeUndefined()
    })

    it('handles two elements', () => {
      const heap = createMinHeap<number>().insert(2).insert(1)
      const r1 = heap.deleteMin()!
      expect(r1.value).toBe(1)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(2)
    })

    it('large values', () => {
      const heap = createMinHeap<number>()
        .insert(Number.MAX_SAFE_INTEGER)
        .insert(Number.MIN_SAFE_INTEGER)
        .insert(0)
      const r1 = heap.deleteMin()!
      expect(r1.value).toBe(Number.MIN_SAFE_INTEGER)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(0)
      const r3 = r2.heap.deleteMin()!
      expect(r3.value).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('NaN handling with custom comparator', () => {
      const heap = new PersistentHeap<number>({
        comparator: (a, b) => {
          if (Number.isNaN(a) && Number.isNaN(b)) return 0
          if (Number.isNaN(a)) return 1
          if (Number.isNaN(b)) return -1
          return a - b
        },
      })
      const h = heap.insert(3).insert(NaN).insert(1)
      const r1 = h.deleteMin()!
      expect(r1.value).toBe(1)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(3)
      const r3 = r2.heap.deleteMin()!
      expect(r3.value).toBeNaN()
    })
  })

  describe('persistence verification across operations', () => {
    it('all intermediate heaps remain accessible', () => {
      const h0 = createMinHeap<number>()
      const h1 = h0.insert(5)
      const h2 = h1.insert(3)
      const h3 = h2.insert(7)
      const h4 = h3.insert(1)
      expect(h0.toArray()).toEqual([])
      expect(h1.toArray()).toEqual([5])
      expect(h2.toArray()).toEqual([3, 5])
      expect(h3.toArray()).toEqual([3, 5, 7])
      expect(h4.toArray()).toEqual([1, 3, 5, 7])
    })

    it('branching history from same ancestor', () => {
      const base = createMinHeap<number>().insert(5).insert(3)
      const branchA = base.insert(1)
      const branchB = base.insert(10)
      expect(base.toArray()).toEqual([3, 5])
      expect(branchA.toArray()).toEqual([1, 3, 5])
      expect(branchB.toArray()).toEqual([3, 5, 10])
    })

    it('deleteMin branches independently', () => {
      const base = createMinHeap<number>().insert(1).insert(2).insert(3)
      const d1 = base.deleteMin()!
      const d2 = d1.heap.deleteMin()!
      expect(base.toArray()).toEqual([1, 2, 3])
      expect(d1.heap.toArray()).toEqual([2, 3])
      expect(d2.heap.toArray()).toEqual([3])
    })

    it('merge branches independently', () => {
      const h1 = createMinHeap<number>().insert(1).insert(5)
      const h2 = createMinHeap<number>().insert(2).insert(4)
      const h3 = createMinHeap<number>().insert(3).insert(6)
      const m1 = h1.merge(h2)
      const m2 = h1.merge(h3)
      expect(h1.toArray()).toEqual([1, 5])
      expect(m1.toArray()).toEqual([1, 2, 4, 5])
      expect(m2.toArray()).toEqual([1, 3, 5, 6])
    })

    it('complex branching scenario', () => {
      const root = createMinHeap<number>().insert(5)
      const left = root.insert(3).insert(1)
      const right = root.insert(7).insert(9)
      const merged = left.merge(right)
      expect(root.toArray()).toEqual([5])
      expect(left.toArray()).toEqual([1, 3, 5])
      expect(right.toArray()).toEqual([5, 7, 9])
      expect(merged.toArray()).toEqual([1, 3, 5, 5, 7, 9])
    })

    it('insert after deleteMin from same base', () => {
      const base = createMinHeap<number>().insert(3).insert(1).insert(2)
      const d = base.deleteMin()!
      const inserted = d.heap.insert(0)
      expect(base.toArray()).toEqual([1, 2, 3])
      expect(d.heap.toArray()).toEqual([2, 3])
      expect(inserted.toArray()).toEqual([0, 2, 3])
    })
  })

  describe('stress tests', () => {
    it('handles 1000 sequential inserts and deletes', () => {
      let heap = createMinHeap<number>()
      for (let i = 1000; i >= 1; i--) {
        heap = heap.insert(i)
      }
      expect(heap.size).toBe(1000)
      expect(heap.isValid()).toBe(true)
      let current = heap
      for (let i = 1; i <= 1000; i++) {
        const r = current.deleteMin()!
        expect(r.value).toBe(i)
        current = r.heap
      }
      expect(current.isEmpty).toBe(true)
    })

    it('handles 1000 random inserts and sorted extraction', () => {
      let heap = createMinHeap<number>()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        heap = heap.insert(v)
      }
      values.sort((a, b) => a - b)
      let current = heap
      for (let i = 0; i < 1000; i++) {
        const r = current.deleteMin()!
        expect(r.value).toBe(values[i])
        current = r.heap
      }
    })

    it('handles 1000 elements in merge', () => {
      let h1 = createMinHeap<number>()
      let h2 = createMinHeap<number>()
      for (let i = 0; i < 500; i++) {
        h1 = h1.insert(i * 2)
        h2 = h2.insert(i * 2 + 1)
      }
      const merged = h1.merge(h2)
      expect(merged.size).toBe(1000)
      expect(merged.isValid()).toBe(true)
      let current = merged
      for (let i = 0; i < 1000; i++) {
        const r = current.deleteMin()!
        expect(r.value).toBe(i)
        current = r.heap
      }
    })

    it('handles interleaved operations on 500 elements', () => {
      let heap = createMinHeap<number>()
      const inserted: number[] = []
      for (let i = 0; i < 500; i++) {
        const v = Math.floor(Math.random() * 5000)
        heap = heap.insert(v)
        inserted.push(v)
      }
      inserted.sort((a, b) => a - b)
      let current = heap
      for (let i = 0; i < 500; i++) {
        const r = current.deleteMin()!
        expect(r.value).toBe(inserted[i])
        current = r.heap
      }
    })

    it('handles cloning 500 element heap', () => {
      let heap = createMinHeap<number>()
      for (let i = 0; i < 500; i++) heap = heap.insert(i)
      const cloned = heap.clone()
      expect(cloned.size).toBe(500)
      expect(cloned.isValid()).toBe(true)
      expect(cloned.toArray()).toEqual(heap.toArray())
    })

    it('handles toArray on 500 elements', () => {
      let heap = createMinHeap<number>()
      for (let i = 499; i >= 0; i--) heap = heap.insert(i)
      const arr = heap.toArray()
      expect(arr.length).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles repeated merge operations', () => {
      let heap = createMinHeap<number>()
      for (let batch = 0; batch < 10; batch++) {
        let other = createMinHeap<number>()
        for (let i = 0; i < 100; i++) {
          other = other.insert(batch * 100 + i)
        }
        heap = heap.merge(other)
      }
      expect(heap.size).toBe(1000)
      expect(heap.isValid()).toBe(true)
      let current = heap
      for (let i = 0; i < 1000; i++) {
        const r = current.deleteMin()!
        expect(r.value).toBe(i)
        current = r.heap
      }
    })

    it('handles 1000 elements from static from', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => 999 - i)
      const heap = PersistentHeap.from(arr)
      expect(heap.size).toBe(1000)
      expect(heap.isValid()).toBe(true)
      let current = heap
      for (let i = 0; i < 1000; i++) {
        const r = current.deleteMin()!
        expect(r.value).toBe(i)
        current = r.heap
      }
    })
  })

  describe('type safety', () => {
    it('works with number type', () => {
      const heap = new PersistentHeap<number>()
      const h = heap.insert(1)
      const val = h.deleteMin()
      expect(typeof val?.value).toBe('number')
    })

    it('works with string type', () => {
      const heap = new PersistentHeap<string>()
      const h = heap.insert('test')
      const val = h.deleteMin()
      expect(typeof val?.value).toBe('string')
    })

    it('works with custom type', () => {
      type PriorityItem = { priority: number; label: string }
      const heap = new PersistentHeap<PriorityItem>({
        comparator: (a, b) => a.priority - b.priority,
      })
      const h = heap
        .insert({ priority: 3, label: 'low' })
        .insert({ priority: 1, label: 'high' })
        .insert({ priority: 2, label: 'medium' })
      const r1 = h.deleteMin()!
      expect(r1.value.label).toBe('high')
      expect(r1.value.priority).toBe(1)
    })
  })

  describe('complex merge scenarios', () => {
    it('merge preserves ordering for alternating insert heaps', () => {
      let h1 = createMinHeap<number>()
      let h2 = createMinHeap<number>()
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) h1 = h1.insert(i)
        else h2 = h2.insert(i)
      }
      const merged = h1.merge(h2)
      let current = merged
      for (let i = 0; i < 50; i++) {
        const r = current.deleteMin()!
        expect(r.value).toBe(i)
        current = r.heap
      }
    })

    it('multiple merges maintain validity', () => {
      let heap = createMinHeap<number>()
      for (let round = 0; round < 5; round++) {
        let other = createMinHeap<number>()
        for (let i = 0; i < 20; i++) {
          other = other.insert(round * 20 + i)
        }
        heap = heap.merge(other)
        expect(heap.isValid()).toBe(true)
      }
      expect(heap.size).toBe(100)
    })

    it('merge and deleteMin interleaved', () => {
      const h1 = createMinHeap<number>().insert(1).insert(5)
      const h2 = createMinHeap<number>().insert(2).insert(4)
      const merged = h1.merge(h2)
      const r1 = merged.deleteMin()!
      expect(r1.value).toBe(1)
      const r2 = r1.heap.deleteMin()!
      expect(r2.value).toBe(2)
      const h3 = createMinHeap<number>().insert(0).insert(3)
      const merged2 = r2.heap.merge(h3)
      let current = merged2
      const r3 = current.deleteMin()!
      expect(r3.value).toBe(0)
      current = r3.heap
      const r4 = current.deleteMin()!
      expect(r4.value).toBe(3)
      current = r4.heap
      const r5 = current.deleteMin()!
      expect(r5.value).toBe(4)
      current = r5.heap
      const r6 = current.deleteMin()!
      expect(r6.value).toBe(5)
    })
  })

  describe('iterator edge cases', () => {
    it('works with Array.from on empty heap', () => {
      const heap = createMinHeap<number>()
      expect(Array.from(heap)).toEqual([])
    })

    it('works with filter-like patterns', () => {
      const heap = PersistentHeap.from([1, 2, 3, 4, 5])
      const evens = [...heap].filter((x) => x % 2 === 0)
      expect(evens).toEqual([2, 4])
    })

    it('works with reduce', () => {
      const heap = PersistentHeap.from([1, 2, 3, 4, 5])
      const sum = [...heap].reduce((a, b) => a + b, 0)
      expect(sum).toBe(15)
    })

    it('works with map', () => {
      const heap = PersistentHeap.from([1, 2, 3])
      const doubled = [...heap].map((x) => x * 2)
      expect(doubled).toEqual([2, 4, 6])
    })
  })

  describe('from edge cases', () => {
    it('from with single element', () => {
      const heap = PersistentHeap.from([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })

    it('from with duplicates', () => {
      const heap = PersistentHeap.from([3, 1, 3, 1, 2])
      expect(heap.toArray()).toEqual([1, 1, 2, 3, 3])
    })

    it('from produces valid heap', () => {
      const heap = PersistentHeap.from([5, 3, 1, 4, 2])
      expect(heap.isValid()).toBe(true)
    })

    it('from with custom type', () => {
      type Item = { priority: number }
      const heap = PersistentHeap.from<Item>(
        [{ priority: 3 }, { priority: 1 }, { priority: 2 }],
        { comparator: (a, b) => a.priority - b.priority },
      )
      expect(heap.peek()!.priority).toBe(1)
    })
  })

  describe('merge persistence', () => {
    it('merge does not affect source heaps after further operations', () => {
      const h1 = createMinHeap<number>().insert(1).insert(3)
      const h2 = createMinHeap<number>().insert(2).insert(4)
      const merged = h1.merge(h2)
      const result = merged.deleteMin()!
      expect(h1.toArray()).toEqual([1, 3])
      expect(h2.toArray()).toEqual([2, 4])
      expect(result.value).toBe(1)
    })
  })

  describe('clone persistence', () => {
    it('modifying clone does not affect original', () => {
      const original = createMinHeap<number>().insert(1).insert(2)
      const cloned = original.clone()
      const modified = cloned.insert(0)
      expect(original.size).toBe(2)
      expect(original.peek()).toBe(1)
      expect(cloned.size).toBe(2)
      expect(modified.size).toBe(3)
      expect(modified.peek()).toBe(0)
    })

    it('modifying original does not affect clone', () => {
      const original = createMinHeap<number>().insert(1).insert(2)
      const cloned = original.clone()
      const modified = original.insert(0)
      expect(cloned.size).toBe(2)
      expect(cloned.peek()).toBe(1)
      expect(modified.size).toBe(3)
      expect(modified.peek()).toBe(0)
    })
  })

  describe('additional edge cases', () => {
    it('insert delete insert pattern', () => {
      const h0 = createMinHeap<number>().insert(5).insert(3).insert(7)
      const d1 = h0.deleteMin()!
      expect(d1.value).toBe(3)
      const h1 = d1.heap.insert(1)
      expect(h1.peek()).toBe(1)
      expect(h1.toArray()).toEqual([1, 5, 7])
      expect(h0.peek()).toBe(3)
    })

    it('merge then deleteMin preserves originals', () => {
      const h1 = createMinHeap<number>().insert(10).insert(30)
      const h2 = createMinHeap<number>().insert(20).insert(40)
      const merged = h1.merge(h2)
      const d1 = merged.deleteMin()!
      expect(d1.value).toBe(10)
      expect(h1.toArray()).toEqual([10, 30])
      expect(h2.toArray()).toEqual([20, 40])
      expect(d1.heap.toArray()).toEqual([20, 30, 40])
    })

    it('from followed by chain of operations', () => {
      const heap = PersistentHeap.from([5, 3, 1, 4, 2])
      const d1 = heap.deleteMin()!
      expect(d1.value).toBe(1)
      const afterInsert = d1.heap.insert(0)
      expect(afterInsert.peek()).toBe(0)
      expect(afterInsert.toArray()).toEqual([0, 2, 3, 4, 5])
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('forEach on empty heap does nothing', () => {
      const heap = createMinHeap<number>()
      let called = false
      heap.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('iterator on single element heap', () => {
      const heap = createMinHeap<number>().insert(42)
      const result = [...heap]
      expect(result).toEqual([42])
      expect(result.length).toBe(1)
    })

    it('merge empty+empty yields empty usable heap', () => {
      const h1 = createMinHeap<number>()
      const h2 = createMinHeap<number>()
      const merged = h1.merge(h2)
      expect(merged.isEmpty).toBe(true)
      const afterInsert = merged.insert(5)
      expect(afterInsert.peek()).toBe(5)
      expect(afterInsert.size).toBe(1)
    })

    it('large heap persistence across many snapshots', () => {
      const snapshots: PersistentHeap<number>[] = []
      let heap = createMinHeap<number>()
      let count = 0
      for (let i = 100; i >= 1; i--) {
        heap = heap.insert(i)
        count++
        if (count % 10 === 0) {
          snapshots.push(heap)
        }
      }
      expect(snapshots.length).toBe(10)
      for (let s = 0; s < snapshots.length; s++) {
        const expectedSize = (s + 1) * 10
        expect(snapshots[s]!.size).toBe(expectedSize)
        expect(snapshots[s]!.peek()).toBe(101 - expectedSize)
        expect(snapshots[s]!.isValid()).toBe(true)
      }
    })
  })
})
