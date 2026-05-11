import { describe, it, expect } from 'vitest'
import { ThreadedTree } from '../../src/core/threaded-tree/index.js'

describe('ThreadedTree', () => {
  describe('constructor', () => {
    it('creates empty tree with default options', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with custom comparator', () => {
      const tree = new ThreadedTree<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      tree.insert('Hello')
      expect(tree.contains('hello')).toBe(true)
      expect(tree.contains('HELLO')).toBe(true)
    })

    it('creates tree with numeric comparator', () => {
      const tree = new ThreadedTree<number>({ comparator: (a, b) => a - b })
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
    })

    it('creates tree without options', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      expect(tree.size).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      expect(tree.size).toBe(1)
      expect(tree.contains(1)).toBe(true)
    })

    it('inserts multiple elements', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size).toBe(3)
      expect(tree.contains(5)).toBe(true)
      expect(tree.contains(3)).toBe(true)
      expect(tree.contains(7)).toBe(true)
    })

    it('inserts in sorted order', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('inserts in reverse sorted order', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 10; i >= 1; i--) {
        tree.insert(i)
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('inserts negative numbers', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(-1)
      expect(tree.toArray()).toEqual([-10, -5, -1])
    })

    it('inserts zero', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(0)
      expect(tree.contains(0)).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('inserts strings with default comparator', () => {
      const tree = new ThreadedTree<string>()
      tree.insert('banana')
      tree.insert('apple')
      tree.insert('cherry')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles random insertions', () => {
      const tree = new ThreadedTree<number>()
      const values = [42, 17, 89, 3, 55, 23, 71, 36, 64, 8]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.size).toBe(10)
      const arr = tree.toArray()
      for (const v of values) {
        expect(arr).toContain(v)
      }
    })

    it('maintains BST property after insertions', () => {
      const tree = new ThreadedTree<number>()
      const values = [50, 25, 75, 10, 30, 60, 90]
      for (const v of values) {
        tree.insert(v)
      }
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('inserts floating point numbers', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(3.14)
      tree.insert(2.71)
      tree.insert(1.41)
      expect(tree.toArray()).toEqual([1.41, 2.71, 3.14])
    })

    it('inserts large numbers', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(Number.MAX_SAFE_INTEGER)
      tree.insert(Number.MIN_SAFE_INTEGER)
      tree.insert(0)
      expect(tree.toArray()).toEqual([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
    })

    it('inserts into tree that had all elements deleted', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.remove(1)
      tree.insert(2)
      expect(tree.size).toBe(1)
      expect(tree.contains(2)).toBe(true)
    })
  })

  describe('contains', () => {
    it('returns false for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(42)
      expect(tree.contains(42)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(42)
      expect(tree.contains(99)).toBe(false)
    })

    it('finds elements in larger tree', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      expect(tree.contains(0)).toBe(true)
      expect(tree.contains(25)).toBe(true)
      expect(tree.contains(49)).toBe(true)
      expect(tree.contains(50)).toBe(false)
    })

    it('returns false after removal', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.remove(10)
      expect(tree.contains(10)).toBe(false)
      expect(tree.contains(20)).toBe(true)
    })

    it('works with string values', () => {
      const tree = new ThreadedTree<string>()
      tree.insert('hello')
      expect(tree.contains('hello')).toBe(true)
      expect(tree.contains('world')).toBe(false)
    })
  })

  describe('remove', () => {
    it('returns false for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.remove(1)).toBe(false)
    })

    it('returns false for non-existing element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      expect(tree.remove(10)).toBe(false)
    })

    it('removes the only element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(42)
      expect(tree.remove(42)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('removes a leaf node (left child)', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.remove(5)).toBe(true)
      expect(tree.contains(5)).toBe(false)
      expect(tree.size).toBe(2)
    })

    it('removes a leaf node (right child)', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.remove(15)).toBe(true)
      expect(tree.contains(15)).toBe(false)
      expect(tree.size).toBe(2)
    })

    it('removes a node with one child (left only)', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(3)
      expect(tree.remove(5)).toBe(true)
      expect(tree.contains(5)).toBe(false)
      expect(tree.contains(3)).toBe(true)
      expect(tree.toArray()).toEqual([3, 10])
    })

    it('removes a node with one child (right only)', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(15)
      tree.insert(20)
      expect(tree.remove(15)).toBe(true)
      expect(tree.contains(15)).toBe(false)
      expect(tree.contains(20)).toBe(true)
      expect(tree.toArray()).toEqual([10, 20])
    })

    it('removes a node with two children', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.remove(10)).toBe(true)
      expect(tree.contains(10)).toBe(false)
      expect(tree.size).toBe(2)
      const arr = tree.toArray()
      expect(arr).toContain(5)
      expect(arr).toContain(15)
    })

    it('removes root with two children and subtrees', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(3)
      tree.insert(7)
      tree.insert(12)
      tree.insert(20)
      expect(tree.remove(10)).toBe(true)
      expect(tree.contains(10)).toBe(false)
      expect(tree.size).toBe(6)
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('removes multiple elements', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      expect(tree.remove(5)).toBe(true)
      expect(tree.remove(3)).toBe(true)
      expect(tree.remove(7)).toBe(true)
      expect(tree.size).toBe(7)
      expect(tree.contains(5)).toBe(false)
      expect(tree.contains(3)).toBe(false)
      expect(tree.contains(7)).toBe(false)
    })

    it('removes all elements', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.remove(1)
      tree.remove(2)
      tree.remove(3)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('maintains sorted order after removals', () => {
      const tree = new ThreadedTree<number>()
      const values = [50, 25, 75, 10, 30, 60, 90]
      for (const v of values) {
        tree.insert(v)
      }
      tree.remove(25)
      tree.remove(75)
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('does not affect tree on failed remove', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.remove(99)).toBe(false)
      expect(tree.size).toBe(3)
    })

    it('removes and reinserts', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.remove(10)
      expect(tree.contains(10)).toBe(false)
      tree.insert(10)
      expect(tree.contains(10)).toBe(true)
    })

    it('removes the max element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.remove(15)
      expect(tree.max()).toBe(10)
    })

    it('removes the min element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.remove(5)
      expect(tree.min()).toBe(10)
    })

    it('removes root when it is only node', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      expect(tree.remove(5)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size).toBe(0)
    })
  })

  describe('min', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.min()).toBeUndefined()
    })

    it('returns the only element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(42)
      expect(tree.min()).toBe(42)
    })

    it('returns the smallest element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.min()).toBe(5)
    })

    it('returns min after many insertions', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 100; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.min()).toBe(0)
    })

    it('returns min after removal', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(1)
      tree.remove(1)
      expect(tree.min()).toBe(5)
    })

    it('returns min with negative numbers', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(-5)
      tree.insert(5)
      tree.insert(-10)
      expect(tree.min()).toBe(-10)
    })
  })

  describe('max', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.max()).toBeUndefined()
    })

    it('returns the only element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(42)
      expect(tree.max()).toBe(42)
    })

    it('returns the largest element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })

    it('returns max after many insertions', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i <= 100; i++) {
        tree.insert(i)
      }
      expect(tree.max()).toBe(100)
    })

    it('returns max after removal', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(15)
      tree.remove(20)
      expect(tree.max()).toBe(15)
    })

    it('returns max with negative numbers', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(-5)
      tree.insert(-1)
      tree.insert(-10)
      expect(tree.max()).toBe(-1)
    })
  })

  describe('predecessor', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('returns undefined for non-existing value', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      expect(tree.predecessor(10)).toBeUndefined()
    })

    it('returns undefined for the minimum element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.predecessor(1)).toBeUndefined()
    })

    it('returns the previous element using threads', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.predecessor(2)).toBe(1)
      expect(tree.predecessor(3)).toBe(2)
    })

    it('returns predecessor in a larger tree', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      for (let i = 1; i < 20; i++) {
        expect(tree.predecessor(i)).toBe(i - 1)
      }
    })

    it('returns predecessor after removals', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.remove(2)
      expect(tree.predecessor(3)).toBe(1)
      expect(tree.predecessor(4)).toBe(3)
    })
  })

  describe('successor', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.successor(1)).toBeUndefined()
    })

    it('returns undefined for non-existing value', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      expect(tree.successor(10)).toBeUndefined()
    })

    it('returns undefined for the maximum element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.successor(3)).toBeUndefined()
    })

    it('returns the next element using threads', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.successor(1)).toBe(2)
      expect(tree.successor(2)).toBe(3)
    })

    it('returns successor in a larger tree', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 19; i++) {
        expect(tree.successor(i)).toBe(i + 1)
      }
    })

    it('returns successor after removals', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.remove(3)
      expect(tree.successor(1)).toBe(2)
      expect(tree.successor(2)).toBe(4)
    })
  })

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.size).toBe(0)
    })

    it('returns 1 after single insert', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      expect(tree.size).toBe(1)
    })

    it('increases with each insert', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
        expect(tree.size).toBe(i + 1)
      }
    })

    it('decreases with each remove', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 5; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 5; i++) {
        tree.remove(i)
        expect(tree.size).toBe(4 - i)
      }
    })

    it('resets after clear', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('returns true after deleting all', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.remove(1)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false with remaining elements', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.remove(1)
      expect(tree.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty tree', () => {
      const tree = new ThreadedTree<number>()
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('clears tree with elements', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.contains(1)).toBe(false)
      expect(tree.contains(2)).toBe(false)
      expect(tree.contains(3)).toBe(false)
    })

    it('allows insertions after clear', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size).toBe(1)
      expect(tree.contains(2)).toBe(true)
      expect(tree.contains(1)).toBe(false)
    })

    it('clears tree multiple times', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.clear()
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      expect(tree.toArray()).toEqual([1])
    })

    it('returns elements in sorted order', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('returns sorted order for large tree', () => {
      const tree = new ThreadedTree<number>()
      const values = [50, 25, 75, 10, 30, 60, 90, 5, 15, 35]
      for (const v of values) {
        tree.insert(v)
      }
      const arr = tree.toArray()
      expect(arr.length).toBe(10)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('returns correct array after removals', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.remove(2)
      expect(tree.toArray()).toEqual([1, 3])
    })

    it('returns empty array after clear', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.clear()
      expect(tree.toArray()).toEqual([])
    })
  })

  describe('toArraySorted', () => {
    it('returns same as toArray for sorted tree', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.toArraySorted()).toEqual(tree.toArray())
    })

    it('returns sorted array using threaded traversal', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 10; i >= 1; i--) {
        tree.insert(i)
      }
      expect(tree.toArraySorted()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('returns empty array for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.toArraySorted()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('does nothing for empty tree', () => {
      const tree = new ThreadedTree<number>()
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([])
    })

    it('iterates single element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([1])
    })

    it('iterates in sorted order', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('iterates all elements', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(10)
    })

    it('provides correct values in callback', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const sum: number[] = []
      tree.forEach((item) => sum.push(item))
      expect(sum).toEqual([10, 20, 30])
    })

    it('iterates after removals', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.remove(2)
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([1, 3])
    })
  })

  describe('iteration (Symbol.iterator)', () => {
    it('returns empty iterator for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect([...tree]).toEqual([])
    })

    it('iterates single element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(42)
      expect([...tree]).toEqual([42])
    })

    it('iterates in sorted order', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect([...tree]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const items: number[] = []
      for (const item of tree) {
        items.push(item)
      }
      expect(items).toEqual([10, 20, 30])
    })

    it('works with spread operator', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const arr = [...tree]
      expect(arr).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(Array.from(tree)).toEqual([3, 5, 7])
    })

    it('can be iterated partially', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const iter = tree[Symbol.iterator]()
      expect(iter.next().value).toBe(1)
      expect(iter.next().value).toBe(2)
      expect(iter.next().value).toBe(3)
      expect(iter.next().done).toBe(true)
    })
  })

  describe('clone', () => {
    it('clones empty tree', () => {
      const tree = new ThreadedTree<number>()
      const cloned = tree.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones tree with elements', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('clone is independent from original', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      const cloned = tree.clone()
      cloned.insert(3)
      expect(tree.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('clone modifications do not affect original', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(20)
      const cloned = tree.clone()
      cloned.remove(10)
      expect(tree.contains(10)).toBe(true)
      expect(cloned.contains(10)).toBe(false)
    })

    it('original modifications do not affect clone', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      tree.insert(20)
      const cloned = tree.clone()
      tree.remove(10)
      expect(cloned.contains(10)).toBe(true)
      expect(tree.contains(10)).toBe(false)
    })

    it('preserves comparator', () => {
      const tree = new ThreadedTree<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      tree.insert('Hello')
      const cloned = tree.clone()
      expect(cloned.contains('hello')).toBe(true)
      expect(cloned.contains('HELLO')).toBe(true)
    })

    it('clone of clone is independent', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      const cloned = tree.clone()
      const cloned2 = cloned.clone()
      cloned.insert(3)
      expect(cloned2.size).toBe(2)
      expect(cloned.size).toBe(3)
    })
  })

  describe('fromArray', () => {
    it('creates tree from empty array', () => {
      const tree = ThreadedTree.fromArray([] as number[])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree from single element array', () => {
      const tree = ThreadedTree.fromArray([42])
      expect(tree.size).toBe(1)
      expect(tree.contains(42)).toBe(true)
    })

    it('creates tree from unsorted array', () => {
      const tree = ThreadedTree.fromArray([3, 1, 4, 1, 5, 9, 2, 6])
      expect(tree.size).toBe(7)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 9])
    })

    it('creates tree with custom comparator', () => {
      const tree = ThreadedTree.fromArray([3, 1, 2], (a, b) => b - a)
      expect(tree.toArray()).toEqual([3, 2, 1])
    })

    it('creates tree from sorted array', () => {
      const tree = ThreadedTree.fromArray([1, 2, 3, 4, 5])
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('first and last', () => {
    it('first returns undefined for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.first()).toBeUndefined()
    })

    it('last returns undefined for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.last()).toBeUndefined()
    })

    it('first returns the smallest element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.first()).toBe(3)
    })

    it('last returns the largest element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.last()).toBe(7)
    })

    it('first equals min', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 20; i++) tree.insert(i)
      expect(tree.first()).toBe(tree.min())
    })

    it('last equals max', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 20; i++) tree.insert(i)
      expect(tree.last()).toBe(tree.max())
    })
  })

  describe('lowerBound', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.lowerBound(5)).toBeUndefined()
    })

    it('returns the exact match', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.lowerBound(3)).toBe(3)
    })

    it('returns the next greater element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.lowerBound(2)).toBe(3)
    })

    it('returns undefined when all elements are smaller', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.lowerBound(6)).toBeUndefined()
    })

    it('returns minimum for very small value', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.lowerBound(0)).toBe(1)
    })

    it('works with larger tree', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 100; i += 2) {
        tree.insert(i)
      }
      expect(tree.lowerBound(49)).toBe(50)
      expect(tree.lowerBound(50)).toBe(50)
      expect(tree.lowerBound(51)).toBe(52)
    })
  })

  describe('upperBound', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.upperBound(5)).toBeUndefined()
    })

    it('returns the next greater element for exact match', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.upperBound(3)).toBe(5)
    })

    it('returns the next greater element', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.upperBound(2)).toBe(3)
    })

    it('returns undefined when all elements are smaller or equal', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.upperBound(5)).toBeUndefined()
    })

    it('returns first element for very small value', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      expect(tree.upperBound(0)).toBe(1)
    })

    it('works with larger tree', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 100; i += 2) {
        tree.insert(i)
      }
      expect(tree.upperBound(49)).toBe(50)
      expect(tree.upperBound(50)).toBe(52)
      expect(tree.upperBound(98)).toBeUndefined()
    })
  })

  describe('count', () => {
    it('returns 0 for empty tree', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.count(0, 10)).toBe(0)
    })

    it('counts all elements in range', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      expect(tree.count(0, 9)).toBe(10)
    })

    it('counts partial range', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      expect(tree.count(3, 7)).toBe(5)
    })

    it('counts single element range', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      expect(tree.count(5, 5)).toBe(1)
    })

    it('returns 0 for range with no elements', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      expect(tree.count(10, 20)).toBe(0)
    })

    it('counts range boundary elements', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.count(1, 10)).toBe(3)
      expect(tree.count(2, 4)).toBe(0)
      expect(tree.count(1, 5)).toBe(2)
    })

    it('returns 0 when lo > all elements', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 5; i++) {
        tree.insert(i)
      }
      expect(tree.count(10, 20)).toBe(0)
    })

    it('counts correctly after removals', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.remove(5)
      tree.remove(6)
      expect(tree.count(4, 7)).toBe(2)
    })
  })

  describe('inOrderTraversal', () => {
    it('does nothing for empty tree', () => {
      const tree = new ThreadedTree<number>()
      const items: number[] = []
      tree.inOrderTraversal((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('traverses in sorted order', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const items: number[] = []
      tree.inOrderTraversal((v) => items.push(v))
      expect(items).toEqual([1, 2, 3])
    })

    it('visits all elements', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      let count = 0
      tree.inOrderTraversal(() => count++)
      expect(count).toBe(10)
    })

    it('uses threaded links for O(1) amortized traversal', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      const items: number[] = []
      tree.inOrderTraversal((v) => items.push(v))
      expect(items.length).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(items[i]).toBe(i)
      }
    })
  })

  describe('reverseTraversal', () => {
    it('does nothing for empty tree', () => {
      const tree = new ThreadedTree<number>()
      const items: number[] = []
      tree.reverseTraversal((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('traverses in reverse sorted order', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const items: number[] = []
      tree.reverseTraversal((v) => items.push(v))
      expect(items).toEqual([3, 2, 1])
    })

    it('visits all elements in reverse', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      const items: number[] = []
      tree.reverseTraversal((v) => items.push(v))
      expect(items).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    })

    it('uses predecessor threads for reverse traversal', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      const items: number[] = []
      tree.reverseTraversal((v) => items.push(v))
      expect(items.length).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(items[i]).toBe(99 - i)
      }
    })

    it('reverse traversal after removals', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.remove(2)
      const items: number[] = []
      tree.reverseTraversal((v) => items.push(v))
      expect(items).toEqual([4, 3, 1])
    })
  })

  describe('duplicate handling', () => {
    it('ignores duplicate on insert', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.contains(5)).toBe(true)
    })

    it('ignores string duplicates', () => {
      const tree = new ThreadedTree<string>()
      tree.insert('hello')
      tree.insert('hello')
      expect(tree.size).toBe(1)
    })

    it('case-sensitive by default', () => {
      const tree = new ThreadedTree<string>()
      tree.insert('Hello')
      tree.insert('hello')
      expect(tree.size).toBe(2)
      expect(tree.contains('Hello')).toBe(true)
      expect(tree.contains('hello')).toBe(true)
    })

    it('duplicate does not affect toArray', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(1)
      tree.insert(3)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('duplicate does not affect forEach count', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(1)
      tree.insert(2)
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(2)
    })

    it('duplicate does not affect iteration', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(1)
      tree.insert(2)
      expect([...tree]).toEqual([1, 2])
    })

    it('duplicate at root', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(1)
      tree.insert(1)
      tree.insert(1)
      expect(tree.size).toBe(1)
      expect(tree.contains(1)).toBe(true)
    })

    it('duplicate after many insertions', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      tree.insert(25)
      expect(tree.size).toBe(50)
    })
  })

  describe('custom comparator', () => {
    it('works with reverse comparator', () => {
      const tree = new ThreadedTree<number>({
        comparator: (a, b) => b - a,
      })
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.toArray()).toEqual([3, 2, 1])
    })

    it('works with object comparator', () => {
      interface Item {
        id: number
        name: string
      }
      const tree = new ThreadedTree<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      tree.insert({ id: 3, name: 'c' })
      tree.insert({ id: 1, name: 'a' })
      tree.insert({ id: 2, name: 'b' })
      const arr = tree.toArray()
      expect(arr[0]!.name).toBe('a')
      expect(arr[1]!.name).toBe('b')
      expect(arr[2]!.name).toBe('c')
    })

    it('works with case-insensitive string comparator', () => {
      const tree = new ThreadedTree<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      tree.insert('Banana')
      tree.insert('apple')
      tree.insert('Cherry')
      expect(tree.toArray()).toEqual(['apple', 'Banana', 'Cherry'])
    })

    it('works with absolute value comparator', () => {
      const tree = new ThreadedTree<number>({
        comparator: (a, b) => Math.abs(a) - Math.abs(b),
      })
      tree.insert(-5)
      tree.insert(3)
      tree.insert(-1)
      expect(tree.toArray()).toEqual([-1, 3, -5])
    })

    it('clone preserves custom comparator behavior', () => {
      const tree = new ThreadedTree<number>({
        comparator: (a, b) => b - a,
      })
      tree.insert(1)
      tree.insert(2)
      const cloned = tree.clone()
      cloned.insert(3)
      expect(cloned.toArray()).toEqual([3, 2, 1])
    })

    it('predecessor and successor with custom comparator', () => {
      const tree = new ThreadedTree<number>({
        comparator: (a, b) => b - a,
      })
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.successor(3)).toBe(2)
      expect(tree.predecessor(1)).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles empty tree operations', () => {
      const tree = new ThreadedTree<number>()
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
      expect(tree.contains(1)).toBe(false)
      expect(tree.remove(1)).toBe(false)
      expect(tree.toArray()).toEqual([])
      expect(tree.first()).toBeUndefined()
      expect(tree.last()).toBeUndefined()
      expect(tree.lowerBound(1)).toBeUndefined()
      expect(tree.upperBound(1)).toBeUndefined()
      expect(tree.count(0, 10)).toBe(0)
    })

    it('handles single element tree', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(42)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.contains(42)).toBe(true)
      expect(tree.contains(99)).toBe(false)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
      expect(tree.first()).toBe(42)
      expect(tree.last()).toBe(42)
      expect(tree.predecessor(42)).toBeUndefined()
      expect(tree.successor(42)).toBeUndefined()
      expect(tree.toArray()).toEqual([42])
    })

    it('handles sorted input', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(100)
      const arr = tree.toArray()
      for (let i = 0; i < 100; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles reverse sorted input', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 99; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size).toBe(100)
      const arr = tree.toArray()
      for (let i = 0; i < 100; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles clear and reuse cycle', () => {
      const tree = new ThreadedTree<number>()
      for (let cycle = 0; cycle < 3; cycle++) {
        for (let i = 0; i < 10; i++) {
          tree.insert(i)
        }
        expect(tree.size).toBe(10)
        tree.clear()
        expect(tree.size).toBe(0)
      }
    })

    it('handles delete all elements one by one', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles delete elements in reverse order', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      for (let i = 9; i >= 0; i--) {
        expect(tree.remove(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles alternating input pattern', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i % 2 === 0 ? i : -i)
      }
      expect(tree.size).toBe(10)
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })
  })

  describe('type variants', () => {
    it('works with numbers', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(3.14)
      tree.insert(2.71)
      expect(tree.contains(3.14)).toBe(true)
    })

    it('works with strings', () => {
      const tree = new ThreadedTree<string>()
      tree.insert('abc')
      tree.insert('def')
      expect(tree.toArray()).toEqual(['abc', 'def'])
    })

    it('works with dates using comparator', () => {
      const tree = new ThreadedTree<Date>({
        comparator: (a, b) => a.getTime() - b.getTime(),
      })
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 6, 1)
      const d3 = new Date(2023, 3, 1)
      tree.insert(d1)
      tree.insert(d2)
      tree.insert(d3)
      expect(tree.min()).toBe(d1)
      expect(tree.max()).toBe(d2)
    })

    it('works with booleans', () => {
      const tree = new ThreadedTree<boolean>()
      tree.insert(false)
      tree.insert(true)
      expect(tree.toArray()).toEqual([false, true])
    })
  })

  describe('large datasets', () => {
    it('handles 1000 insertions', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 1000; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(1000)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(999)
    })

    it('handles 1000 insertions in reverse', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 999; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size).toBe(1000)
      expect(tree.toArray()[0]).toBe(0)
      expect(tree.toArray()[999]).toBe(999)
    })

    it('handles insert and delete many elements', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 200; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        tree.remove(i)
      }
      expect(tree.size).toBe(100)
      expect(tree.min()).toBe(100)
      expect(tree.max()).toBe(199)
    })

    it('threaded traversal visits all elements', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 500; i++) {
        tree.insert(i)
      }
      let count = 0
      tree.inOrderTraversal(() => count++)
      expect(count).toBe(500)
    })

    it('reverse threaded traversal visits all elements', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 500; i++) {
        tree.insert(i)
      }
      let count = 0
      tree.reverseTraversal(() => count++)
      expect(count).toBe(500)
    })
  })

  describe('combined operations', () => {
    it('interleaved insert and remove', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.remove(5)
      tree.insert(7)
      tree.insert(1)
      tree.remove(3)
      expect(tree.size).toBe(2)
      expect(tree.toArray()).toEqual([1, 7])
    })

    it('insert remove insert same value', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(10)
      expect(tree.contains(10)).toBe(true)
      tree.remove(10)
      expect(tree.contains(10)).toBe(false)
      tree.insert(10)
      expect(tree.contains(10)).toBe(true)
    })

    it('clone after partial removals', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.remove(3)
      tree.remove(7)
      const cloned = tree.clone()
      expect(cloned.size).toBe(8)
      expect(cloned.contains(3)).toBe(false)
      expect(cloned.contains(7)).toBe(false)
    })

    it('clear and rebuild', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.clear()
      for (let i = 10; i < 20; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(10)
      expect(tree.min()).toBe(10)
      expect(tree.max()).toBe(19)
    })

    it('all methods on same tree', () => {
      const tree = new ThreadedTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size).toBe(3)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.contains(5)).toBe(true)
      expect(tree.min()).toBe(3)
      expect(tree.max()).toBe(7)
      expect(tree.first()).toBe(3)
      expect(tree.last()).toBe(7)
      expect(tree.predecessor(5)).toBe(3)
      expect(tree.successor(5)).toBe(7)
      expect(tree.toArray()).toEqual([3, 5, 7])
      expect([...tree]).toEqual([3, 5, 7])
      expect(tree.lowerBound(4)).toBe(5)
      expect(tree.upperBound(4)).toBe(5)
      expect(tree.upperBound(5)).toBe(7)
      expect(tree.count(3, 7)).toBe(3)
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([3, 5, 7])
      const revItems: number[] = []
      tree.reverseTraversal((item) => revItems.push(item))
      expect(revItems).toEqual([7, 5, 3])
      const cloned = tree.clone()
      expect(cloned.size).toBe(3)
      tree.remove(5)
      expect(tree.size).toBe(2)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('stress test with many operations', () => {
      const tree = new ThreadedTree<number>()
      const inserted = new Set<number>()
      for (let i = 0; i < 200; i++) {
        const val = Math.floor(Math.random() * 100)
        if (!inserted.has(val)) {
          tree.insert(val)
          inserted.add(val)
        }
      }
      for (const val of inserted) {
        expect(tree.contains(val)).toBe(true)
      }
      expect(tree.size).toBe(inserted.size)
      const arr = tree.toArray()
      expect(arr.length).toBe(inserted.size)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('predecessor and successor chain covers full traversal', () => {
      const tree = new ThreadedTree<number>()
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      let current = tree.min()!
      const forward: number[] = [current]
      while (tree.successor(current) !== undefined) {
        current = tree.successor(current)!
        forward.push(current)
      }
      expect(forward.length).toBe(20)

      current = tree.max()!
      const backward: number[] = [current]
      while (tree.predecessor(current) !== undefined) {
        current = tree.predecessor(current)!
        backward.push(current)
      }
      expect(backward.length).toBe(20)
      expect(backward.reverse()).toEqual(forward)
    })
  })
})
