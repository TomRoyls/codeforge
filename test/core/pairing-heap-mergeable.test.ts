import { describe, it, expect, beforeEach } from 'vitest'
import { MergeablePairingHeap } from '../../src/core/pairing-heap-mergeable/pairing-heap-mergeable.js'
import type { MergeablePairingHeapNode, MergeablePairingHeapOptions } from '../../src/core/pairing-heap-mergeable/pairing-heap-mergeable.js'

describe('MergeablePairingHeap', () => {
  let heap: MergeablePairingHeap<number>

  beforeEach(() => {
    heap = new MergeablePairingHeap<number>()
  })

  describe('constructor', () => {
    it('should create an empty heap', () => {
      const h = new MergeablePairingHeap<number>()
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should accept options with comparator', () => {
      const h = new MergeablePairingHeap<number>({ comparator: (a, b) => b - a })
      h.insert(1)
      h.insert(5)
      expect(h.findMin()).toBe(5)
    })

    it('should accept empty options', () => {
      const h = new MergeablePairingHeap<number>({})
      expect(h.size()).toBe(0)
    })

    it('should accept undefined options', () => {
      const h = new MergeablePairingHeap<number>(undefined)
      expect(h.size()).toBe(0)
    })

    it('should use default comparator when none provided', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.findMin()).toBe(3)
    })

    it('should accept custom comparator for strings', () => {
      const h = new MergeablePairingHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
      h.insert('cherry')
      h.insert('apple')
      h.insert('banana')
      expect(h.findMin()).toBe('apple')
    })
  })

  describe('insert', () => {
    it('should add a single element', () => {
      heap.insert(5)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should add multiple elements', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.size()).toBe(3)
    })

    it('should maintain min on insert', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.findMin()).toBe(1)
    })

    it('should handle negative values', () => {
      heap.insert(-5)
      heap.insert(-10)
      heap.insert(3)
      expect(heap.findMin()).toBe(-10)
    })

    it('should handle zero', () => {
      heap.insert(0)
      expect(heap.findMin()).toBe(0)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size()).toBe(3)
      expect(heap.findMin()).toBe(5)
    })

    it('should handle floating point values', () => {
      heap.insert(3.14)
      heap.insert(2.71)
      expect(heap.findMin()).toBeCloseTo(2.71)
    })

    it('should update size correctly for many inserts', () => {
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(100)
    })

    it('should return a node handle', () => {
      const node = heap.insert(42)
      expect(node).toBeDefined()
      expect(node.value).toBe(42)
      expect(node.id).toBeGreaterThanOrEqual(0)
    })

    it('should set parent for inserted children', () => {
      heap.insert(1)
      const node2 = heap.insert(5)
      expect(node2.parent).not.toBeNull()
    })

    it('should handle inserting into empty heap', () => {
      heap.insert(10)
      expect(heap.findMin()).toBe(10)
      expect(heap.size()).toBe(1)
    })

    it('should handle inserting larger value as first child', () => {
      heap.insert(1)
      const node = heap.insert(10)
      expect(node.parent).not.toBeNull()
    })

    it('should handle inserting smaller value making new root', () => {
      heap.insert(10)
      const node = heap.insert(1)
      expect(node.parent).toBeNull()
      expect(heap.findMin()).toBe(1)
    })

    it('should assign unique ids to nodes', () => {
      const n1 = heap.insert(1)
      const n2 = heap.insert(2)
      const n3 = heap.insert(3)
      expect(n1.id).not.toBe(n2.id)
      expect(n2.id).not.toBe(n3.id)
      expect(n1.id).toBeLessThan(n2.id)
      expect(n2.id).toBeLessThan(n3.id)
    })
  })

  describe('findMin', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.findMin()).toBeUndefined()
    })

    it('should return min element without removing', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.findMin()).toBe(3)
      expect(heap.size()).toBe(3)
    })

    it('should update after insert', () => {
      heap.insert(10)
      expect(heap.findMin()).toBe(10)
      heap.insert(5)
      expect(heap.findMin()).toBe(5)
    })

    it('should update after deleteMin', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMin()
      expect(heap.findMin()).toBe(2)
    })

    it('should return same element on repeated calls', () => {
      heap.insert(5)
      expect(heap.findMin()).toBe(heap.findMin())
    })

    it('should handle single element', () => {
      heap.insert(42)
      expect(heap.findMin()).toBe(42)
    })
  })

  describe('deleteMin', () => {
    it('should return undefined on empty heap', () => {
      expect(heap.deleteMin()).toBeUndefined()
    })

    it('should extract single element', () => {
      heap.insert(10)
      expect(heap.deleteMin()).toBe(10)
      expect(heap.size()).toBe(0)
    })

    it('should extract min from two elements', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.deleteMin()).toBe(3)
      expect(heap.deleteMin()).toBe(5)
    })

    it('should extract in sorted order', () => {
      const values = [5, 3, 7, 1, 4, 6, 2, 8]
      for (const v of values) {
        heap.insert(v)
      }
      const extracted: number[] = []
      while (!heap.isEmpty()) {
        extracted.push(heap.deleteMin()!)
      }
      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('should handle all elements correctly', () => {
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMin()).toBe(2)
      expect(heap.deleteMin()).toBe(3)
      expect(heap.deleteMin()).toBeUndefined()
    })

    it('should update size after extraction', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMin()
      expect(heap.size()).toBe(2)
      heap.deleteMin()
      expect(heap.size()).toBe(1)
    })

    it('should handle extract after many inserts', () => {
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      for (let i = 1; i <= 50; i++) {
        expect(heap.deleteMin()).toBe(i)
      }
    })

    it('should handle alternating insert and extract', () => {
      heap.insert(5)
      heap.insert(3)
      expect(heap.deleteMin()).toBe(3)
      heap.insert(1)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMin()).toBe(5)
    })

    it('should handle duplicate values extraction', () => {
      heap.insert(1)
      heap.insert(1)
      heap.insert(1)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.deleteMin()).toBe(1)
    })

    it('should return undefined when heap becomes empty', () => {
      heap.insert(1)
      heap.deleteMin()
      expect(heap.deleteMin()).toBeUndefined()
    })

    it('should handle extract triggering two-pass pairing', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.deleteMin()).toBe(1)
      expect(heap.findMin()).toBe(2)
    })

    it('should handle extract with single child', () => {
      heap.insert(1)
      heap.insert(5)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.findMin()).toBe(5)
    })

    it('should handle extract with multiple children', () => {
      heap.insert(1)
      heap.insert(10)
      heap.insert(5)
      heap.insert(7)
      heap.insert(3)
      expect(heap.deleteMin()).toBe(1)
      expect(heap.findMin()).toBe(3)
    })
  })

  describe('merge', () => {
    it('should merge two non-empty heaps', () => {
      heap.insert(5)
      heap.insert(10)
      const other = new MergeablePairingHeap<number>()
      other.insert(3)
      other.insert(7)
      heap.merge(other)
      expect(heap.size()).toBe(4)
      expect(heap.findMin()).toBe(3)
    })

    it('should merge empty with non-empty', () => {
      const other = new MergeablePairingHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(1)
    })

    it('should merge non-empty with empty', () => {
      heap.insert(1)
      const other = new MergeablePairingHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(1)
    })

    it('should merge two empty heaps', () => {
      const other = new MergeablePairingHeap<number>()
      heap.merge(other)
      expect(heap.size()).toBe(0)
    })

    it('should clear source heap after merge', () => {
      heap.insert(1)
      const other = new MergeablePairingHeap<number>()
      other.insert(2)
      other.insert(3)
      heap.merge(other)
      expect(other.size()).toBe(0)
      expect(other.isEmpty()).toBe(true)
    })

    it('should return this heap for chaining', () => {
      heap.insert(1)
      const other = new MergeablePairingHeap<number>()
      other.insert(2)
      const result = heap.merge(other)
      expect(result).toBe(heap)
    })

    it('should update size after merge', () => {
      for (let i = 0; i < 5; i++) heap.insert(i)
      const other = new MergeablePairingHeap<number>()
      for (let i = 5; i < 10; i++) other.insert(i)
      heap.merge(other)
      expect(heap.size()).toBe(10)
    })

    it('should update min after merge', () => {
      heap.insert(10)
      const other = new MergeablePairingHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.findMin()).toBe(1)
    })

    it('should extract in sorted order after merge', () => {
      heap.insert(5)
      heap.insert(1)
      heap.insert(9)
      const other = new MergeablePairingHeap<number>()
      other.insert(3)
      other.insert(7)
      other.insert(2)
      heap.merge(other)
      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.deleteMin()!)
      }
      expect(result).toEqual([1, 2, 3, 5, 7, 9])
    })

    it('should handle merge with equal mins', () => {
      heap.insert(1)
      const other = new MergeablePairingHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.size()).toBe(2)
      expect(heap.findMin()).toBe(1)
    })

    it('should handle three-way merge', () => {
      heap.insert(5)
      const other1 = new MergeablePairingHeap<number>()
      other1.insert(3)
      const other2 = new MergeablePairingHeap<number>()
      other2.insert(1)
      heap.merge(other1)
      heap.merge(other2)
      expect(heap.findMin()).toBe(1)
      expect(heap.size()).toBe(3)
    })

    it('should handle merge when this is empty', () => {
      const other = new MergeablePairingHeap<number>()
      other.insert(1)
      other.insert(2)
      other.insert(3)
      heap.merge(other)
      expect(heap.size()).toBe(3)
      expect(heap.findMin()).toBe(1)
      expect(other.size()).toBe(0)
    })
  })

  describe('decreaseKey', () => {
    it('should decrease key of root node', () => {
      const node = heap.insert(5)
      heap.insert(3)
      heap.decreaseKey(node, 1)
      expect(heap.findMin()).toBe(1)
    })

    it('should not decrease key if new value is greater', () => {
      const node = heap.insert(3)
      heap.decreaseKey(node, 10)
      expect(node.value).toBe(3)
    })

    it('should decrease key of child node', () => {
      heap.insert(1)
      const node = heap.insert(10)
      heap.decreaseKey(node, 0)
      expect(heap.findMin()).toBe(0)
    })

    it('should update min after decrease', () => {
      heap.insert(10)
      const node = heap.insert(20)
      heap.decreaseKey(node, 5)
      expect(heap.findMin()).toBe(5)
    })

    it('should cut node from parent', () => {
      heap.insert(1)
      const node = heap.insert(5)
      heap.decreaseKey(node, 0)
      expect(node.parent).toBeNull()
    })

    it('should handle decreaseKey on root', () => {
      const node = heap.insert(5)
      heap.decreaseKey(node, 1)
      expect(heap.findMin()).toBe(1)
      expect(node.parent).toBeNull()
    })

    it('should handle multiple decreases', () => {
      const node1 = heap.insert(10)
      const node2 = heap.insert(20)
      heap.decreaseKey(node1, 5)
      heap.decreaseKey(node2, 3)
      expect(heap.deleteMin()).toBe(3)
      expect(heap.deleteMin()).toBe(5)
    })

    it('should handle decrease to same value', () => {
      const node = heap.insert(5)
      heap.decreaseKey(node, 5)
      expect(node.value).toBe(5)
    })

    it('should handle decreaseKey after merge', () => {
      const node = heap.insert(10)
      const other = new MergeablePairingHeap<number>()
      other.insert(20)
      heap.merge(other)
      heap.decreaseKey(node, 1)
      expect(heap.findMin()).toBe(1)
    })

    it('should not affect size', () => {
      const node = heap.insert(5)
      heap.insert(3)
      heap.decreaseKey(node, 1)
      expect(heap.size()).toBe(2)
    })

    it('should handle decreaseKey making new root', () => {
      heap.insert(100)
      const node = heap.insert(200)
      heap.decreaseKey(node, -1)
      expect(heap.findMin()).toBe(-1)
      expect(heap.deleteMin()).toBe(-1)
      expect(heap.deleteMin()).toBe(100)
    })

    it('should handle decreaseKey on deep child', () => {
      heap.insert(1)
      heap.insert(10)
      heap.insert(20)
      const node = heap.insert(30)
      heap.decreaseKey(node, 0)
      expect(heap.findMin()).toBe(0)
      expect(heap.size()).toBe(4)
    })
  })

  describe('delete', () => {
    it('should delete a non-root node', () => {
      heap.insert(1)
      const node = heap.insert(10)
      heap.insert(5)
      heap.delete(node)
      expect(heap.size()).toBe(2)
      expect(heap.toArray()).toEqual([1, 5])
    })

    it('should delete root node', () => {
      const node = heap.insert(1)
      heap.insert(5)
      heap.delete(node)
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(5)
    })

    it('should delete node and reattach its children', () => {
      heap.insert(1)
      const node = heap.insert(10)
      heap.insert(20)
      heap.insert(30)
      heap.delete(node)
      expect(heap.size()).toBe(3)
    })

    it('should handle delete on single element heap', () => {
      const node = heap.insert(1)
      heap.delete(node)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.size()).toBe(0)
    })

    it('should handle delete of multiple nodes', () => {
      const n1 = heap.insert(10)
      const n2 = heap.insert(20)
      const n3 = heap.insert(30)
      heap.delete(n2)
      expect(heap.size()).toBe(2)
      heap.delete(n1)
      expect(heap.size()).toBe(1)
      heap.delete(n3)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle delete after decreaseKey', () => {
      heap.insert(1)
      const node = heap.insert(10)
      heap.decreaseKey(node, 5)
      heap.delete(node)
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(1)
    })

    it('should handle delete after merge', () => {
      const node = heap.insert(10)
      const other = new MergeablePairingHeap<number>()
      other.insert(5)
      heap.merge(other)
      heap.delete(node)
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(5)
    })

    it('should maintain sorted order after deletions', () => {
      const nodes: MergeablePairingHeapNode<number>[] = []
      for (let i = 0; i < 10; i++) {
        nodes.push(heap.insert(i))
      }
      heap.delete(nodes[5]!)
      heap.delete(nodes[3]!)
      heap.delete(nodes[7]!)
      const result = heap.toArray()
      expect(result).toEqual([0, 1, 2, 4, 6, 8, 9])
    })
  })

  describe('size', () => {
    it('should return 0 on empty heap', () => {
      expect(heap.size()).toBe(0)
    })

    it('should return 1 after single insert', () => {
      heap.insert(1)
      expect(heap.size()).toBe(1)
    })

    it('should return correct size after multiple inserts', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.size()).toBe(3)
    })

    it('should decrease after deleteMin', () => {
      heap.insert(1)
      heap.insert(2)
      heap.deleteMin()
      expect(heap.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should track size correctly through mixed operations', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMin()
      heap.insert(4)
      heap.insert(5)
      heap.deleteMin()
      expect(heap.size()).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('should return true on new heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('should return true after all elements extracted', () => {
      heap.insert(1)
      heap.insert(2)
      heap.deleteMin()
      heap.deleteMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      heap.insert(1)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })

    it('should toggle correctly', () => {
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
      heap.deleteMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should empty non-empty heap', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should clear heap with one element', () => {
      heap.insert(1)
      heap.clear()
      expect(heap.size()).toBe(0)
    })

    it('should allow reuse after clear', () => {
      heap.insert(1)
      heap.clear()
      heap.insert(5)
      expect(heap.size()).toBe(1)
      expect(heap.findMin()).toBe(5)
    })

    it('should handle clear on already empty heap', () => {
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('should reset state completely', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      heap.clear()
      expect(heap.findMin()).toBeUndefined()
      expect(heap.deleteMin()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should return single element', () => {
      heap.insert(5)
      expect(heap.toArray()).toEqual([5])
    })

    it('should return sorted elements', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.toArray()).toEqual([1, 3, 5, 7])
    })

    it('should not modify original heap', () => {
      heap.insert(3)
      heap.insert(1)
      heap.toArray()
      expect(heap.size()).toBe(2)
      expect(heap.findMin()).toBe(1)
    })

    it('should return new array each call', () => {
      heap.insert(1)
      const a = heap.toArray()
      const b = heap.toArray()
      expect(a).not.toBe(b)
    })

    it('should return all elements after merge', () => {
      heap.insert(5)
      heap.insert(1)
      const other = new MergeablePairingHeap<number>()
      other.insert(3)
      heap.merge(other)
      expect(heap.toArray()).toEqual([1, 3, 5])
    })

    it('should handle duplicate values', () => {
      heap.insert(1)
      heap.insert(1)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 1, 2])
    })

    it('should return sorted after many inserts', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
  })

  describe('contains', () => {
    it('should return false for empty heap', () => {
      expect(heap.contains(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      heap.insert(5)
      expect(heap.contains(3)).toBe(false)
    })

    it('should find value among many', () => {
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(0)).toBe(true)
      expect(heap.contains(9)).toBe(true)
      expect(heap.contains(10)).toBe(false)
    })

    it('should handle duplicate values', () => {
      heap.insert(5)
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('should handle value after deleteMin', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMin()
      expect(heap.contains(1)).toBe(false)
      expect(heap.contains(2)).toBe(true)
    })

    it('should handle negative values', () => {
      heap.insert(-5)
      expect(heap.contains(-5)).toBe(true)
      expect(heap.contains(5)).toBe(false)
    })

    it('should handle string values with comparator', () => {
      const h = new MergeablePairingHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
      h.insert('hello')
      h.insert('world')
      expect(h.contains('hello')).toBe(true)
      expect(h.contains('world')).toBe(true)
      expect(h.contains('foo')).toBe(false)
    })
  })

  describe('clone', () => {
    it('should clone empty heap', () => {
      const cloned = heap.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should clone single element heap', () => {
      heap.insert(5)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(1)
      expect(cloned.findMin()).toBe(5)
    })

    it('should clone multi-element heap', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.findMin()).toBe(3)
    })

    it('should be independent from original', () => {
      heap.insert(5)
      heap.insert(3)
      const cloned = heap.clone()
      cloned.deleteMin()
      expect(heap.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('should preserve comparator', () => {
      const maxHeap = new MergeablePairingHeap<number>({ comparator: (a, b) => b - a })
      maxHeap.insert(1)
      maxHeap.insert(5)
      const cloned = maxHeap.clone()
      expect(cloned.findMin()).toBe(5)
      expect(cloned.deleteMin()).toBe(5)
    })

    it('should extract in same order as original', () => {
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      const cloned = heap.clone()
      for (let i = 1; i <= 10; i++) {
        expect(heap.deleteMin()).toBe(i)
        expect(cloned.deleteMin()).toBe(i)
      }
    })

    it('should handle clone after merge', () => {
      heap.insert(5)
      const other = new MergeablePairingHeap<number>()
      other.insert(3)
      heap.merge(other)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.findMin()).toBe(3)
    })

    it('should not share node references', () => {
      const node = heap.insert(5)
      const cloned = heap.clone()
      cloned.deleteMin()
      expect(node.value).toBe(5)
    })
  })

  describe('isValid', () => {
    it('should return true for empty heap', () => {
      expect(heap.isValid()).toBe(true)
    })

    it('should return true for single element heap', () => {
      heap.insert(5)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true for multi-element heap', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after deleteMin', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.deleteMin()
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after merge', () => {
      heap.insert(5)
      const other = new MergeablePairingHeap<number>()
      other.insert(3)
      heap.merge(other)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after decreaseKey', () => {
      heap.insert(1)
      const node = heap.insert(5)
      heap.decreaseKey(node, 0)
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after many operations', () => {
      for (let i = 0; i < 20; i++) {
        heap.insert(Math.floor(Math.random() * 100))
      }
      for (let i = 0; i < 10; i++) {
        heap.deleteMin()
      }
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after clear', () => {
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.isValid()).toBe(true)
    })

    it('should return true after delete', () => {
      const n1 = heap.insert(1)
      heap.insert(5)
      heap.insert(10)
      heap.delete(n1)
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('custom comparator', () => {
    it('should work as max heap with reverse comparator', () => {
      const maxHeap = new MergeablePairingHeap<number>({ comparator: (a, b) => b - a })
      maxHeap.insert(1)
      maxHeap.insert(5)
      maxHeap.insert(3)
      expect(maxHeap.findMin()).toBe(5)
      expect(maxHeap.deleteMin()).toBe(5)
      expect(maxHeap.deleteMin()).toBe(3)
      expect(maxHeap.deleteMin()).toBe(1)
    })

    it('should work with string comparator', () => {
      const strHeap = new MergeablePairingHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
      strHeap.insert('cherry')
      strHeap.insert('apple')
      strHeap.insert('banana')
      expect(strHeap.deleteMin()).toBe('apple')
      expect(strHeap.deleteMin()).toBe('banana')
      expect(strHeap.deleteMin()).toBe('cherry')
    })

    it('should work with object comparator', () => {
      interface Item {
        priority: number
        name: string
      }
      const objHeap = new MergeablePairingHeap<Item>({ comparator: (a, b) => a.priority - b.priority })
      objHeap.insert({ priority: 3, name: 'low' })
      objHeap.insert({ priority: 1, name: 'high' })
      objHeap.insert({ priority: 2, name: 'medium' })
      expect(objHeap.findMin()?.name).toBe('high')
      expect(objHeap.deleteMin()?.name).toBe('high')
    })

    it('should merge heaps with same comparator', () => {
      const maxHeap = new MergeablePairingHeap<number>({ comparator: (a, b) => b - a })
      maxHeap.insert(1)
      maxHeap.insert(3)
      const other = new MergeablePairingHeap<number>({ comparator: (a, b) => b - a })
      other.insert(2)
      other.insert(5)
      maxHeap.merge(other)
      expect(maxHeap.toArray()).toEqual([5, 3, 2, 1])
    })
  })

  describe('static from', () => {
    it('should create heap from array', () => {
      const h = MergeablePairingHeap.from([5, 3, 1, 4, 2])
      expect(h.size()).toBe(5)
      expect(h.findMin()).toBe(1)
    })

    it('should create heap from empty array', () => {
      const h = MergeablePairingHeap.from<number>([])
      expect(h.size()).toBe(0)
      expect(h.isEmpty()).toBe(true)
    })

    it('should create heap from single element', () => {
      const h = MergeablePairingHeap.from([42])
      expect(h.size()).toBe(1)
      expect(h.findMin()).toBe(42)
    })

    it('should accept custom comparator', () => {
      const h = MergeablePairingHeap.from([1, 5, 3], { comparator: (a, b) => b - a })
      expect(h.findMin()).toBe(5)
    })

    it('should extract in sorted order', () => {
      const h = MergeablePairingHeap.from([5, 3, 7, 1, 4, 6, 2, 8])
      const result: number[] = []
      while (!h.isEmpty()) {
        result.push(h.deleteMin()!)
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('should create heap from iterable', () => {
      function* gen() {
        yield 3
        yield 1
        yield 2
      }
      const h = MergeablePairingHeap.from(gen())
      expect(h.size()).toBe(3)
      expect(h.toArray()).toEqual([1, 2, 3])
    })

    it('should handle duplicates', () => {
      const h = MergeablePairingHeap.from([1, 1, 2, 2, 3])
      expect(h.size()).toBe(5)
      expect(h.toArray()).toEqual([1, 1, 2, 2, 3])
    })

    it('should handle string values', () => {
      const h = MergeablePairingHeap.from(['cherry', 'apple', 'banana'], {
        comparator: (a, b) => a.localeCompare(b),
      })
      expect(h.findMin()).toBe('apple')
    })

    it('should handle large arrays', () => {
      const items = Array.from({ length: 1000 }, (_, i) => 1000 - i)
      const h = MergeablePairingHeap.from(items)
      expect(h.size()).toBe(1000)
      expect(h.findMin()).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle string values', () => {
      const h = new MergeablePairingHeap<string>({ comparator: (a, b) => a.localeCompare(b) })
      h.insert('b')
      h.insert('a')
      h.insert('c')
      expect(h.deleteMin()).toBe('a')
      expect(h.deleteMin()).toBe('b')
      expect(h.deleteMin()).toBe('c')
    })

    it('should handle object values', () => {
      interface Item {
        id: number
      }
      const h = new MergeablePairingHeap<Item>({ comparator: (a, b) => a.id - b.id })
      h.insert({ id: 2 })
      h.insert({ id: 1 })
      expect(h.deleteMin()?.id).toBe(1)
    })

    it('should handle negative values extraction', () => {
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-5)
      expect(heap.deleteMin()).toBe(-5)
      expect(heap.deleteMin()).toBe(-3)
      expect(heap.deleteMin()).toBe(-1)
    })

    it('should handle very large values', () => {
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(Number.MIN_SAFE_INTEGER)
      expect(heap.findMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(heap.deleteMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(heap.deleteMin()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle repeated clear and insert', () => {
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 10; i++) {
          heap.insert(i)
        }
        expect(heap.size()).toBe(10)
        heap.clear()
        expect(heap.size()).toBe(0)
      }
    })

    it('should handle extract from heap with only one element', () => {
      heap.insert(42)
      expect(heap.deleteMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.findMin()).toBeUndefined()
    })

    it('should handle toArray on empty heap', () => {
      expect(heap.toArray()).toEqual([])
    })

    it('should handle clone on empty heap', () => {
      const cloned = heap.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.size()).toBe(0)
    })

    it('should handle isValid after all operations', () => {
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      heap.deleteMin()
      const other = new MergeablePairingHeap<number>()
      other.insert(2)
      other.insert(4)
      heap.merge(other)
      const cloned = heap.clone()
      expect(heap.isValid()).toBe(true)
      expect(cloned.isValid()).toBe(true)
    })

    it('should handle consecutive merges', () => {
      heap.insert(5)
      for (let i = 0; i < 5; i++) {
        const other = new MergeablePairingHeap<number>()
        other.insert(i * 2)
        heap.merge(other)
      }
      expect(heap.size()).toBe(6)
      expect(heap.isValid()).toBe(true)
    })

    it('should handle decreasing key to same value as root', () => {
      heap.insert(1)
      const node = heap.insert(5)
      heap.decreaseKey(node, 1)
      expect(heap.findMin()).toBe(1)
      expect(heap.size()).toBe(2)
    })

    it('should handle merge after deleteMin', () => {
      heap.insert(5)
      heap.insert(3)
      heap.deleteMin()
      const other = new MergeablePairingHeap<number>()
      other.insert(1)
      heap.merge(other)
      expect(heap.findMin()).toBe(1)
    })

    it('should handle insert after extracting all', () => {
      heap.insert(1)
      heap.insert(2)
      heap.deleteMin()
      heap.deleteMin()
      heap.insert(3)
      expect(heap.findMin()).toBe(3)
      expect(heap.size()).toBe(1)
    })

    it('should handle merge with custom comparator', () => {
      const maxHeap = new MergeablePairingHeap<number>({ comparator: (a, b) => b - a })
      maxHeap.insert(1)
      maxHeap.insert(5)
      const other = new MergeablePairingHeap<number>({ comparator: (a, b) => b - a })
      other.insert(3)
      other.insert(10)
      maxHeap.merge(other)
      expect(maxHeap.findMin()).toBe(10)
      expect(maxHeap.size()).toBe(4)
    })
  })

  describe('exports', () => {
    it('should export MergeablePairingHeap class', () => {
      expect(MergeablePairingHeap).toBeDefined()
    })

    it('should allow typed node reference', () => {
      const node: MergeablePairingHeapNode<number> = {
        value: 1,
        child: null,
        sibling: null,
        parent: null,
        id: 0,
      }
      expect(node.value).toBe(1)
    })

    it('should allow typed options', () => {
      const opts: MergeablePairingHeapOptions<number> = {
        comparator: (a, b) => a - b,
      }
      expect(opts).toBeDefined()
    })
  })

  describe('two-pass pairing', () => {
    it('should handle pairing with 2 children', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.deleteMin()
      expect(heap.findMin()).toBe(3)
      expect(heap.deleteMin()).toBe(3)
      expect(heap.deleteMin()).toBe(5)
    })

    it('should handle pairing with 3 children', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.insert(7)
      heap.deleteMin()
      expect(heap.findMin()).toBe(3)
    })

    it('should handle pairing with 4 children', () => {
      heap.insert(1)
      heap.insert(3)
      heap.insert(5)
      heap.insert(7)
      heap.insert(9)
      heap.deleteMin()
      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.deleteMin()!)
      }
      expect(result).toEqual([3, 5, 7, 9])
    })

    it('should handle pairing with 5 children', () => {
      heap.insert(1)
      heap.insert(10)
      heap.insert(8)
      heap.insert(6)
      heap.insert(4)
      heap.insert(2)
      heap.deleteMin()
      const result: number[] = []
      while (!heap.isEmpty()) {
        result.push(heap.deleteMin()!)
      }
      expect(result).toEqual([2, 4, 6, 8, 10])
    })

    it('should handle pairing with 1 child', () => {
      heap.insert(1)
      heap.insert(5)
      heap.deleteMin()
      expect(heap.findMin()).toBe(5)
    })

    it('should handle pairing with 0 children', () => {
      heap.insert(1)
      heap.deleteMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 elements', () => {
      for (let i = 1000; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(1000)
      for (let i = 1; i <= 1000; i++) {
        expect(heap.deleteMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle random insertions', () => {
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        heap.insert(v)
      }
      values.sort((a, b) => a - b)
      for (const v of values) {
        expect(heap.deleteMin()).toBe(v)
      }
    })

    it('should handle interleaved insert and extract', () => {
      const extracted: number[] = []
      for (let i = 0; i < 500; i++) {
        heap.insert(i * 2)
        heap.insert(i * 2 + 1)
        extracted.push(heap.deleteMin()!)
      }
      expect(extracted.length).toBe(500)
      for (let i = 1; i < extracted.length; i++) {
        expect(extracted[i]!).toBeGreaterThanOrEqual(extracted[i - 1]!)
      }
    })

    it('should handle merge with large heaps', () => {
      for (let i = 0; i < 500; i++) {
        heap.insert(i * 2)
      }
      const other = new MergeablePairingHeap<number>()
      for (let i = 0; i < 500; i++) {
        other.insert(i * 2 + 1)
      }
      heap.merge(other)
      expect(heap.size()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(heap.deleteMin()).toBe(i)
      }
    })

    it('should handle decreaseKey stress', () => {
      const nodes: MergeablePairingHeapNode<number>[] = []
      for (let i = 0; i < 100; i++) {
        nodes.push(heap.insert(i * 10))
      }
      for (let i = 0; i < 100; i++) {
        heap.decreaseKey(nodes[i]!, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(heap.deleteMin()).toBe(i)
      }
    })

    it('should maintain sorted order through many operations', () => {
      for (let i = 0; i < 200; i++) {
        heap.insert(Math.floor(Math.random() * 1000))
      }
      let prev = -Infinity
      while (!heap.isEmpty()) {
        const curr = heap.deleteMin()!
        expect(curr).toBeGreaterThanOrEqual(prev)
        prev = curr
      }
    })

    it('should handle mixed decreaseKey and deleteMin', () => {
      const nodes: MergeablePairingHeapNode<number>[] = []
      for (let i = 0; i < 50; i++) {
        nodes.push(heap.insert(100 - i))
      }
      for (let i = 0; i < 50; i++) {
        heap.decreaseKey(nodes[i]!, i)
      }
      for (let i = 0; i < 50; i++) {
        expect(heap.deleteMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('should handle delete stress', () => {
      const nodes: MergeablePairingHeapNode<number>[] = []
      for (let i = 0; i < 100; i++) {
        nodes.push(heap.insert(i))
      }
      for (let i = 0; i < 50; i++) {
        heap.delete(nodes[i * 2 + 1]!)
      }
      expect(heap.size()).toBe(50)
      expect(heap.isValid()).toBe(true)
      const result = heap.toArray()
      expect(result.length).toBe(50)
      let prev = -Infinity
      for (const v of result) {
        expect(v).toBeGreaterThanOrEqual(prev)
        prev = v
      }
    })
  })
})
