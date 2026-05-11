import { describe, it, expect } from 'vitest'
import { ZipTree } from '../../src/core/zip-tree/index.js'

describe('ZipTree', () => {
  describe('constructor', () => {
    it('creates empty tree with default options', () => {
      const tree = new ZipTree<number>()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates tree with custom comparator', () => {
      const tree = new ZipTree<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      tree.insert('Hello')
      expect(tree.has('hello')).toBe(true)
      expect(tree.has('HELLO')).toBe(true)
    })

    it('creates tree with numeric comparator', () => {
      const tree = new ZipTree<number>({ comparator: (a, b) => a - b })
      tree.insert(5)
      expect(tree.has(5)).toBe(true)
    })

    it('creates tree without options', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      expect(tree.size()).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      expect(tree.size()).toBe(1)
      expect(tree.has(1)).toBe(true)
    })

    it('inserts multiple elements', () => {
      const tree = new ZipTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size()).toBe(3)
      expect(tree.has(5)).toBe(true)
      expect(tree.has(3)).toBe(true)
      expect(tree.has(7)).toBe(true)
    })

    it('inserts in sorted order', () => {
      const tree = new ZipTree<number>()
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('inserts in reverse sorted order', () => {
      const tree = new ZipTree<number>()
      for (let i = 10; i >= 1; i--) {
        tree.insert(i)
      }
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('inserts negative numbers', () => {
      const tree = new ZipTree<number>()
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(-1)
      expect(tree.toArray()).toEqual([-10, -5, -1])
    })

    it('inserts zero', () => {
      const tree = new ZipTree<number>()
      tree.insert(0)
      expect(tree.has(0)).toBe(true)
      expect(tree.size()).toBe(1)
    })

    it('inserts strings with default comparator', () => {
      const tree = new ZipTree<string>()
      tree.insert('banana')
      tree.insert('apple')
      tree.insert('cherry')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles many insertions', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(100)
    })

    it('handles random insertions', () => {
      const tree = new ZipTree<number>()
      const values = [42, 17, 89, 3, 55, 23, 71, 36, 64, 8]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.size()).toBe(10)
      const arr = tree.toArray()
      for (const v of values) {
        expect(arr).toContain(v)
      }
    })

    it('maintains BST property after insertions', () => {
      const tree = new ZipTree<number>()
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
      const tree = new ZipTree<number>()
      tree.insert(3.14)
      tree.insert(2.71)
      tree.insert(1.41)
      expect(tree.toArray()).toEqual([1.41, 2.71, 3.14])
    })

    it('inserts large numbers', () => {
      const tree = new ZipTree<number>()
      tree.insert(Number.MAX_SAFE_INTEGER)
      tree.insert(Number.MIN_SAFE_INTEGER)
      tree.insert(0)
      expect(tree.toArray()).toEqual([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
    })

    it('inserts into tree that had all elements deleted', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.delete(1)
      tree.insert(2)
      expect(tree.size()).toBe(1)
      expect(tree.has(2)).toBe(true)
    })
  })

  describe('has', () => {
    it('returns false for empty tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.has(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect(tree.has(42)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect(tree.has(99)).toBe(false)
    })

    it('finds elements in larger tree', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      expect(tree.has(0)).toBe(true)
      expect(tree.has(25)).toBe(true)
      expect(tree.has(49)).toBe(true)
      expect(tree.has(50)).toBe(false)
    })

    it('returns false after deletion', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.delete(10)
      expect(tree.has(10)).toBe(false)
      expect(tree.has(20)).toBe(true)
    })

    it('works with string values', () => {
      const tree = new ZipTree<string>()
      tree.insert('hello')
      expect(tree.has('hello')).toBe(true)
      expect(tree.has('world')).toBe(false)
    })
  })

  describe('delete', () => {
    it('returns false for empty tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.delete(1)).toBe(false)
    })

    it('returns false for non-existing element', () => {
      const tree = new ZipTree<number>()
      tree.insert(5)
      expect(tree.delete(10)).toBe(false)
    })

    it('deletes the only element', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect(tree.delete(42)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('deletes a leaf node', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size()).toBe(2)
    })

    it('deletes a node with one child (left)', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(3)
      expect(tree.delete(5)).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.has(3)).toBe(true)
      expect(tree.toArray()).toEqual([3, 10])
    })

    it('deletes a node with one child (right)', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(15)
      tree.insert(20)
      expect(tree.delete(15)).toBe(true)
      expect(tree.has(15)).toBe(false)
      expect(tree.has(20)).toBe(true)
      expect(tree.toArray()).toEqual([10, 20])
    })

    it('deletes a node with two children', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.delete(10)).toBe(true)
      expect(tree.has(10)).toBe(false)
      expect(tree.size()).toBe(2)
      const arr = tree.toArray()
      expect(arr).toContain(5)
      expect(arr).toContain(15)
    })

    it('deletes root with two children', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(3)
      tree.insert(7)
      tree.insert(12)
      tree.insert(20)
      expect(tree.delete(10)).toBe(true)
      expect(tree.has(10)).toBe(false)
      expect(tree.size()).toBe(6)
    })

    it('deletes multiple elements', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      expect(tree.delete(5)).toBe(true)
      expect(tree.delete(3)).toBe(true)
      expect(tree.delete(7)).toBe(true)
      expect(tree.size()).toBe(7)
      expect(tree.has(5)).toBe(false)
      expect(tree.has(3)).toBe(false)
      expect(tree.has(7)).toBe(false)
    })

    it('deletes all elements', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(1)
      tree.delete(2)
      tree.delete(3)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('maintains sorted order after deletions', () => {
      const tree = new ZipTree<number>()
      const values = [50, 25, 75, 10, 30, 60, 90]
      for (const v of values) {
        tree.insert(v)
      }
      tree.delete(25)
      tree.delete(75)
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('does not affect tree on failed delete', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.delete(99)).toBe(false)
      expect(tree.size()).toBe(3)
    })

    it('deletes and reinserts', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.delete(10)
      expect(tree.has(10)).toBe(false)
      tree.insert(10)
      expect(tree.has(10)).toBe(true)
    })

    it('deletes the max element', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.delete(15)
      expect(tree.max()).toBe(10)
    })

    it('deletes the min element', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.delete(5)
      expect(tree.min()).toBe(10)
    })

    it('deletes root when it is only node', () => {
      const tree = new ZipTree<number>()
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })
  })

  describe('search', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.search(1)).toBeUndefined()
    })

    it('returns the element if found', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect(tree.search(42)).toBe(42)
    })

    it('returns undefined if not found', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect(tree.search(99)).toBeUndefined()
    })

    it('returns correct element from larger tree', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      expect(tree.search(10)).toBe(10)
      expect(tree.search(19)).toBe(19)
      expect(tree.search(20)).toBeUndefined()
    })

    it('returns undefined after deletion', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.delete(10)
      expect(tree.search(10)).toBeUndefined()
    })

    it('works with string values', () => {
      const tree = new ZipTree<string>()
      tree.insert('foo')
      expect(tree.search('foo')).toBe('foo')
      expect(tree.search('bar')).toBeUndefined()
    })
  })

  describe('min', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.min()).toBeUndefined()
    })

    it('returns the only element', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect(tree.min()).toBe(42)
    })

    it('returns the smallest element', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.min()).toBe(5)
    })

    it('returns min after many insertions', () => {
      const tree = new ZipTree<number>()
      for (let i = 100; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.min()).toBe(0)
    })

    it('returns min after deletion', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(1)
      tree.delete(1)
      expect(tree.min()).toBe(5)
    })

    it('returns min with negative numbers', () => {
      const tree = new ZipTree<number>()
      tree.insert(-5)
      tree.insert(5)
      tree.insert(-10)
      expect(tree.min()).toBe(-10)
    })
  })

  describe('max', () => {
    it('returns undefined for empty tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.max()).toBeUndefined()
    })

    it('returns the only element', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect(tree.max()).toBe(42)
    })

    it('returns the largest element', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.max()).toBe(15)
    })

    it('returns max after many insertions', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i <= 100; i++) {
        tree.insert(i)
      }
      expect(tree.max()).toBe(100)
    })

    it('returns max after deletion', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(15)
      tree.delete(20)
      expect(tree.max()).toBe(15)
    })

    it('returns max with negative numbers', () => {
      const tree = new ZipTree<number>()
      tree.insert(-5)
      tree.insert(-1)
      tree.insert(-10)
      expect(tree.max()).toBe(-1)
    })
  })

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.size()).toBe(0)
    })

    it('returns 1 after single insert', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      expect(tree.size()).toBe(1)
    })

    it('increases with each insert', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
        expect(tree.size()).toBe(i + 1)
      }
    })

    it('decreases with each delete', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 5; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 5; i++) {
        tree.delete(i)
        expect(tree.size()).toBe(4 - i)
      }
    })

    it('resets after clear', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('returns true after deleting all', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false with remaining elements', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.delete(1)
      expect(tree.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty tree', () => {
      const tree = new ZipTree<number>()
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('clears tree with elements', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.has(1)).toBe(false)
      expect(tree.has(2)).toBe(false)
      expect(tree.has(3)).toBe(false)
    })

    it('allows insertions after clear', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size()).toBe(1)
      expect(tree.has(2)).toBe(true)
      expect(tree.has(1)).toBe(false)
    })

    it('clears tree multiple times', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.clear()
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      expect(tree.toArray()).toEqual([1])
    })

    it('returns elements in sorted order', () => {
      const tree = new ZipTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('returns sorted order for large tree', () => {
      const tree = new ZipTree<number>()
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

    it('returns correct array after deletions', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      expect(tree.toArray()).toEqual([1, 3])
    })

    it('returns empty array after clear', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.clear()
      expect(tree.toArray()).toEqual([])
    })

    it('returns string array in order', () => {
      const tree = new ZipTree<string>()
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('forEach', () => {
    it('does nothing for empty tree', () => {
      const tree = new ZipTree<number>()
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([])
    })

    it('iterates single element', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([1])
    })

    it('iterates in sorted order', () => {
      const tree = new ZipTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([1, 2, 3])
    })

    it('iterates all elements', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(10)
    })

    it('provides correct values in callback', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const sum: number[] = []
      tree.forEach((item) => sum.push(item))
      expect(sum).toEqual([10, 20, 30])
    })

    it('iterates after deletions', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([1, 3])
    })
  })

  describe('iteration (Symbol.iterator)', () => {
    it('returns empty iterator for empty tree', () => {
      const tree = new ZipTree<number>()
      expect([...tree]).toEqual([])
    })

    it('iterates single element', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect([...tree]).toEqual([42])
    })

    it('iterates in sorted order', () => {
      const tree = new ZipTree<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect([...tree]).toEqual([1, 2, 3])
    })

    it('works with for...of', () => {
      const tree = new ZipTree<number>()
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
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const arr = [...tree]
      expect(arr).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const tree = new ZipTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(Array.from(tree)).toEqual([3, 5, 7])
    })

    it('can be iterated partially with generator', () => {
      const tree = new ZipTree<number>()
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

  describe('height', () => {
    it('returns 0 for empty tree', () => {
      const tree = new ZipTree<number>()
      expect(tree.height()).toBe(0)
    })

    it('returns 1 for single node', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      expect(tree.height()).toBe(1)
    })

    it('returns correct height for two nodes', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      expect(tree.height()).toBeGreaterThanOrEqual(1)
      expect(tree.height()).toBeLessThanOrEqual(2)
    })

    it('returns correct height for balanced tree', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      expect(tree.height()).toBeGreaterThanOrEqual(1)
      expect(tree.height()).toBeLessThanOrEqual(3)
    })

    it('height decreases after deletion', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(3)
      const h1 = tree.height()
      tree.delete(3)
      const h2 = tree.height()
      expect(h2).toBeLessThanOrEqual(h1)
    })

    it('height is 0 after clear', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.clear()
      expect(tree.height()).toBe(0)
    })

    it('height grows with more elements', () => {
      const tree = new ZipTree<number>()
      tree.insert(50)
      const h1 = tree.height()
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      const h2 = tree.height()
      expect(h2).toBeGreaterThanOrEqual(h1)
    })

    it('height is bounded by n for n elements', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      expect(tree.height()).toBeLessThanOrEqual(20)
    })
  })

  describe('clone', () => {
    it('clones empty tree', () => {
      const tree = new ZipTree<number>()
      const cloned = tree.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones tree with elements', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('clone is independent from original', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      const cloned = tree.clone()
      cloned.insert(3)
      expect(tree.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('clone modifications do not affect original', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(20)
      const cloned = tree.clone()
      cloned.delete(10)
      expect(tree.has(10)).toBe(true)
      expect(cloned.has(10)).toBe(false)
    })

    it('original modifications do not affect clone', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      tree.insert(20)
      const cloned = tree.clone()
      tree.delete(10)
      expect(cloned.has(10)).toBe(true)
      expect(tree.has(10)).toBe(false)
    })

    it('preserves comparator', () => {
      const tree = new ZipTree<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      tree.insert('Hello')
      const cloned = tree.clone()
      expect(cloned.has('hello')).toBe(true)
      expect(cloned.has('HELLO')).toBe(true)
    })

    it('clone of clone is independent', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      const cloned = tree.clone()
      const cloned2 = cloned.clone()
      cloned.insert(3)
      expect(cloned2.size()).toBe(2)
      expect(cloned.size()).toBe(3)
    })

    it('clone preserves height', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      const cloned = tree.clone()
      expect(cloned.height()).toBe(tree.height())
    })
  })

  describe('edge cases', () => {
    it('handles empty tree operations', () => {
      const tree = new ZipTree<number>()
      expect(tree.min()).toBeUndefined()
      expect(tree.max()).toBeUndefined()
      expect(tree.search(1)).toBeUndefined()
      expect(tree.has(1)).toBe(false)
      expect(tree.delete(1)).toBe(false)
      expect(tree.toArray()).toEqual([])
      expect(tree.height()).toBe(0)
    })

    it('handles single element tree', () => {
      const tree = new ZipTree<number>()
      tree.insert(42)
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.has(42)).toBe(true)
      expect(tree.has(99)).toBe(false)
      expect(tree.min()).toBe(42)
      expect(tree.max()).toBe(42)
      expect(tree.search(42)).toBe(42)
      expect(tree.search(99)).toBeUndefined()
      expect(tree.height()).toBe(1)
      expect(tree.toArray()).toEqual([42])
    })

    it('handles sorted input with balanced height', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(100)
      expect(tree.height()).toBeLessThanOrEqual(100)
      const arr = tree.toArray()
      for (let i = 0; i < 100; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles reverse sorted input', () => {
      const tree = new ZipTree<number>()
      for (let i = 99; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(100)
      const arr = tree.toArray()
      for (let i = 0; i < 100; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles alternating input pattern', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i % 2 === 0 ? i : -i)
      }
      expect(tree.size()).toBe(10)
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('handles clear and reuse cycle', () => {
      const tree = new ZipTree<number>()
      for (let cycle = 0; cycle < 3; cycle++) {
        for (let i = 0; i < 10; i++) {
          tree.insert(i)
        }
        expect(tree.size()).toBe(10)
        tree.clear()
        expect(tree.size()).toBe(0)
      }
    })

    it('handles delete all elements one by one', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles delete elements in reverse order', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      for (let i = 9; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('duplicate handling', () => {
    it('replaces duplicate on insert', () => {
      const tree = new ZipTree<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.size()).toBe(1)
      expect(tree.has(5)).toBe(true)
    })

    it('replaces string duplicates', () => {
      const tree = new ZipTree<string>()
      tree.insert('hello')
      tree.insert('hello')
      expect(tree.size()).toBe(1)
    })

    it('case-sensitive by default', () => {
      const tree = new ZipTree<string>()
      tree.insert('Hello')
      tree.insert('hello')
      expect(tree.size()).toBe(2)
      expect(tree.has('Hello')).toBe(true)
      expect(tree.has('hello')).toBe(true)
    })

    it('duplicate does not affect toArray', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(1)
      tree.insert(3)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })

    it('duplicate does not affect forEach count', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(1)
      tree.insert(2)
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(2)
    })

    it('duplicate does not affect iteration', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(1)
      tree.insert(2)
      expect([...tree]).toEqual([1, 2])
    })

    it('duplicate at root', () => {
      const tree = new ZipTree<number>()
      tree.insert(1)
      tree.insert(1)
      tree.insert(1)
      expect(tree.size()).toBe(1)
      expect(tree.has(1)).toBe(true)
    })

    it('duplicate after many insertions', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      tree.insert(25)
      expect(tree.size()).toBe(50)
    })
  })

  describe('custom comparator', () => {
    it('works with reverse comparator', () => {
      const tree = new ZipTree<number>({
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
      const tree = new ZipTree<Item>({
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
      const tree = new ZipTree<string>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      tree.insert('Banana')
      tree.insert('apple')
      tree.insert('Cherry')
      expect(tree.toArray()).toEqual(['apple', 'Banana', 'Cherry'])
    })

    it('works with absolute value comparator', () => {
      const tree = new ZipTree<number>({
        comparator: (a, b) => Math.abs(a) - Math.abs(b),
      })
      tree.insert(-5)
      tree.insert(3)
      tree.insert(-1)
      expect(tree.toArray()).toEqual([-1, 3, -5])
    })

    it('clone preserves custom comparator behavior', () => {
      const tree = new ZipTree<number>({
        comparator: (a, b) => b - a,
      })
      tree.insert(1)
      tree.insert(2)
      const cloned = tree.clone()
      cloned.insert(3)
      expect(cloned.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('large datasets', () => {
    it('handles 1000 insertions', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 1000; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(1000)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(999)
    })

    it('handles 1000 insertions in reverse', () => {
      const tree = new ZipTree<number>()
      for (let i = 999; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(1000)
      expect(tree.toArray()[0]).toBe(0)
      expect(tree.toArray()[999]).toBe(999)
    })

    it('handles random insertions of 500 elements', () => {
      const tree = new ZipTree<number>()
      const values = new Set<number>()
      for (let i = 0; i < 500; i++) {
        const v = Math.floor(Math.random() * 1000)
        values.add(v)
        tree.insert(v)
      }
      expect(tree.size()).toBe(values.size)
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('handles insert and delete many elements', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 200; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(100)
      expect(tree.min()).toBe(100)
      expect(tree.max()).toBe(199)
    })

    it('height stays reasonable with random data', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 500; i++) {
        tree.insert(Math.floor(Math.random() * 10000))
      }
      expect(tree.height()).toBeLessThan(500)
    })
  })

  describe('combined operations', () => {
    it('interleaved insert and delete', () => {
      const tree = new ZipTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.delete(5)
      tree.insert(7)
      tree.insert(1)
      tree.delete(3)
      expect(tree.size()).toBe(2)
      expect(tree.toArray()).toEqual([1, 7])
    })

    it('insert delete insert same value', () => {
      const tree = new ZipTree<number>()
      tree.insert(10)
      expect(tree.has(10)).toBe(true)
      tree.delete(10)
      expect(tree.has(10)).toBe(false)
      tree.insert(10)
      expect(tree.has(10)).toBe(true)
    })

    it('clone after partial deletions', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.delete(3)
      tree.delete(7)
      const cloned = tree.clone()
      expect(cloned.size()).toBe(8)
      expect(cloned.has(3)).toBe(false)
      expect(cloned.has(7)).toBe(false)
    })

    it('clear and rebuild', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i)
      }
      tree.clear()
      for (let i = 10; i < 20; i++) {
        tree.insert(i)
      }
      expect(tree.size()).toBe(10)
      expect(tree.min()).toBe(10)
      expect(tree.max()).toBe(19)
    })

    it('all methods on same tree', () => {
      const tree = new ZipTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size()).toBe(3)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.has(5)).toBe(true)
      expect(tree.search(5)).toBe(5)
      expect(tree.min()).toBe(3)
      expect(tree.max()).toBe(7)
      expect(tree.height()).toBeGreaterThanOrEqual(1)
      expect(tree.toArray()).toEqual([3, 5, 7])
      const items: number[] = []
      tree.forEach((item) => items.push(item))
      expect(items).toEqual([3, 5, 7])
      expect([...tree]).toEqual([3, 5, 7])
      const cloned = tree.clone()
      expect(cloned.size()).toBe(3)
      tree.delete(5)
      expect(tree.size()).toBe(2)
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('stress test with many operations', () => {
      const tree = new ZipTree<number>()
      const inserted = new Set<number>()
      for (let i = 0; i < 200; i++) {
        const val = Math.floor(Math.random() * 100)
        if (!inserted.has(val)) {
          tree.insert(val)
          inserted.add(val)
        }
      }
      for (const val of inserted) {
        expect(tree.has(val)).toBe(true)
      }
      expect(tree.size()).toBe(inserted.size)
      const arr = tree.toArray()
      expect(arr.length).toBe(inserted.size)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })

    it('zip operations maintain tree validity', () => {
      const tree = new ZipTree<number>()
      for (let i = 0; i < 30; i++) {
        tree.insert(i)
      }
      for (let i = 10; i < 20; i++) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(20)
      const arr = tree.toArray()
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]! > arr[i - 1]!).toBe(true)
      }
    })
  })

  describe('type variants', () => {
    it('works with numbers', () => {
      const tree = new ZipTree<number>()
      tree.insert(3.14)
      tree.insert(2.71)
      expect(tree.has(3.14)).toBe(true)
    })

    it('works with strings', () => {
      const tree = new ZipTree<string>()
      tree.insert('abc')
      tree.insert('def')
      expect(tree.toArray()).toEqual(['abc', 'def'])
    })

    it('works with dates using comparator', () => {
      const tree = new ZipTree<Date>({
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
      const tree = new ZipTree<boolean>()
      tree.insert(false)
      tree.insert(true)
      expect(tree.toArray()).toEqual([false, true])
    })
  })
})
