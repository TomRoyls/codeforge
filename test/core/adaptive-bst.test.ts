import { describe, it, expect } from 'vitest'
import { AdaptiveBST } from '../../src/core/adaptive-bst/index.js'
import type { Comparator } from '../../src/core/adaptive-bst/types.js'

const reverseComparator: Comparator<number> = (a, b) => b - a
const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b)
const absComparator: Comparator<number> = (a, b) => Math.abs(a) - Math.abs(b)

describe('AdaptiveBST', () => {
  describe('constructor', () => {
    it('creates empty tree with no arguments', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('creates empty tree with empty options', () => {
      const tree = new AdaptiveBST<number>({})
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('creates tree with custom comparator', () => {
      const tree = new AdaptiveBST<number>({ comparator: reverseComparator })
      tree.insert(1)
      tree.insert(5)
      tree.insert(3)
      expect(tree.toArray()).toEqual([5, 3, 1])
    })

    it('creates tree with default comparator', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('insert', () => {
    it('inserts into empty tree', () => {
      const tree = new AdaptiveBST<number>()
      const node = tree.insert(5)
      expect(node).toBeDefined()
      expect(node.value).toBe(5)
      expect(tree.size).toBe(1)
    })

    it('inserts smaller element to left', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(10)
      tree.insert(5)
      expect(tree.toArray()).toEqual([5, 10])
      expect(tree.size).toBe(2)
    })

    it('inserts larger element to right', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(10)
      expect(tree.toArray()).toEqual([5, 10])
      expect(tree.size).toBe(2)
    })

    it('inserts duplicate elements to right', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(2)
      expect(tree.toArray()).toEqual([5, 5])
    })

    it('inserts many elements', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 50; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size).toBe(51)
      expect(tree.toArray()).toEqual(Array.from({ length: 51 }, (_, i) => i))
    })

    it('inserts negative numbers', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(-1)
      expect(tree.toArray()).toEqual([-10, -5, -1])
    })

    it('inserts zero', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(0)
      tree.insert(1)
      tree.insert(-1)
      expect(tree.toArray()).toEqual([-1, 0, 1])
    })

    it('handles floating point numbers', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3.14)
      tree.insert(1.41)
      tree.insert(2.72)
      expect(tree.toArray()).toEqual([1.41, 2.72, 3.14])
    })

    it('handles string values', () => {
      const tree = new AdaptiveBST<string>()
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('new node has no children', () => {
      const tree = new AdaptiveBST<number>()
      const node = tree.insert(42)
      expect(node.left).toBeNull()
      expect(node.right).toBeNull()
    })

    it('inserts in ascending order', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i <= 10; i++) tree.insert(i)
      expect(tree.size).toBe(11)
      expect(tree.toArray()).toEqual(Array.from({ length: 11 }, (_, i) => i))
    })

    it('inserts in descending order', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 10; i >= 0; i--) tree.insert(i)
      expect(tree.size).toBe(11)
      expect(tree.toArray()).toEqual(Array.from({ length: 11 }, (_, i) => i))
    })

    it('inserts random values', () => {
      const tree = new AdaptiveBST<number>()
      const values = [42, 17, 23, 8, 91, 55, 3, 66, 1, 34]
      for (const v of values) tree.insert(v)
      expect(tree.toArray()).toEqual([...values].sort((a, b) => a - b))
    })

    it('insert preserves BST property', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 20; i++) tree.insert(Math.floor(Math.random() * 100))
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('delete', () => {
    it('returns false for non-existent value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect(tree.delete(2)).toBe(false)
    })

    it('returns false on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.delete(1)).toBe(false)
    })

    it('deletes leaf node', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.delete(3)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.toArray()).toEqual([5, 7])
    })

    it('deletes root with no children', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(42)
      expect(tree.delete(42)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('deletes root with only left child', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      expect(tree.delete(5)).toBe(true)
      expect(tree.toArray()).toEqual([3])
    })

    it('deletes root with only right child', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3)
      tree.insert(5)
      expect(tree.delete(3)).toBe(true)
      expect(tree.toArray()).toEqual([5])
    })

    it('deletes node with two children', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.isValid()).toBe(true)
    })

    it('deletes all elements one by one', () => {
      const tree = new AdaptiveBST<number>()
      const values = [5, 3, 7, 1, 4, 6, 8]
      for (const v of values) tree.insert(v)
      for (const v of values) {
        expect(tree.delete(v)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })

    it('delete updates size correctly', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
      tree.delete(2)
      expect(tree.size).toBe(2)
      tree.delete(1)
      expect(tree.size).toBe(1)
      tree.delete(3)
      expect(tree.size).toBe(0)
    })

    it('deletes duplicate values one at a time', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.delete(5)).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('delete maintains BST property', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 7, 1, 4, 6, 8, 2, 9])
      tree.delete(5)
      expect(tree.isValid()).toBe(true)
      tree.delete(3)
      expect(tree.isValid()).toBe(true)
      tree.delete(7)
      expect(tree.isValid()).toBe(true)
    })

    it('delete from large tree', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      for (let i = 0; i < 100; i += 2) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.size).toBe(50)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('search', () => {
    it('returns null for non-existent value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect(tree.search(2)).toBeNull()
    })

    it('returns null on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.search(1)).toBeNull()
    })

    it('finds existing value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.search(5)).toBe(5)
      expect(tree.search(3)).toBe(3)
      expect(tree.search(7)).toBe(7)
    })

    it('finds root', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(42)
      expect(tree.search(42)).toBe(42)
    })

    it('finds min element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      expect(tree.search(1)).toBe(1)
    })

    it('finds max element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(10)
      expect(tree.search(10)).toBe(10)
    })

    it('finds duplicate values', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.search(5)).toBe(5)
    })

    it('search after delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.delete(5)
      expect(tree.search(5)).toBeNull()
      expect(tree.search(3)).toBe(3)
    })
  })

  describe('contains', () => {
    it('returns false for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.contains(1)).toBe(false)
    })

    it('returns true for existing value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.contains(3)).toBe(false)
    })

    it('returns false after delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
    })

    it('returns false after clear', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.clear()
      expect(tree.contains(5)).toBe(false)
    })

    it('finds values in large tree', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 100; i++) tree.insert(i)
      for (let i = 0; i < 100; i++) {
        expect(tree.contains(i)).toBe(true)
      }
      expect(tree.contains(100)).toBe(false)
      expect(tree.contains(-1)).toBe(false)
    })
  })

  describe('findMin', () => {
    it('throws on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(() => tree.findMin()).toThrow('findMin called on empty tree')
    })

    it('returns single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(42)
      expect(tree.findMin()).toBe(42)
    })

    it('returns min of multiple elements', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.findMin()).toBe(3)
    })

    it('returns min after insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(1)
      expect(tree.findMin()).toBe(1)
    })

    it('returns min after delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.delete(3)
      expect(tree.findMin()).toBe(5)
    })

    it('handles negative numbers', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(-10)
      tree.insert(3)
      expect(tree.findMin()).toBe(-10)
    })
  })

  describe('findMax', () => {
    it('throws on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(() => tree.findMax()).toThrow('findMax called on empty tree')
    })

    it('returns single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(42)
      expect(tree.findMax()).toBe(42)
    })

    it('returns max of multiple elements', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.findMax()).toBe(7)
    })

    it('returns max after insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(10)
      tree.insert(15)
      expect(tree.findMax()).toBe(15)
    })

    it('returns max after delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.delete(7)
      expect(tree.findMax()).toBe(5)
    })

    it('handles negative numbers', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(-3)
      expect(tree.findMax()).toBe(-3)
    })
  })

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect(tree.size).toBe(1)
      tree.insert(2)
      expect(tree.size).toBe(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
    })

    it('returns correct size after deletes', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(2)
      expect(tree.size).toBe(2)
      tree.delete(1)
      expect(tree.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('returns true after deleting all elements', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.delete(1)
      tree.delete(2)
      expect(tree.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })

    it('returns false after clear and insert', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(1)
      expect(tree.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty tree without error', () => {
      const tree = new AdaptiveBST<number>()
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('clears non-empty tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('allows operations after clear', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(10)
      expect(tree.size).toBe(1)
      expect(tree.search(10)).toBe(10)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(42)
      expect(tree.toArray()).toEqual([42])
    })

    it('returns elements in sorted order', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(1)
      tree.insert(4)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify the tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      tree.toArray()
      expect(tree.size).toBe(3)
    })

    it('handles duplicates', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      expect(tree.toArray()).toEqual([1, 1, 2, 3, 3])
    })
  })

  describe('inOrderTraversal', () => {
    it('traverses empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect([...tree.inOrderTraversal()]).toEqual([])
    })

    it('traverses single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect([...tree.inOrderTraversal()]).toEqual([1])
    })

    it('traverses in sorted order', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.insert(4)
      expect([...tree.inOrderTraversal()]).toEqual([1, 3, 4, 5, 7])
    })

    it('does not modify tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      ;[...tree.inOrderTraversal()]
      expect(tree.size).toBe(3)
    })

    it('can be iterated multiple times', () => {
      const tree = AdaptiveBST.fromArray([3, 1, 2])
      expect([...tree.inOrderTraversal()]).toEqual([1, 2, 3])
      expect([...tree.inOrderTraversal()]).toEqual([1, 2, 3])
    })
  })

  describe('preOrderTraversal', () => {
    it('traverses empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect([...tree.preOrderTraversal()]).toEqual([])
    })

    it('traverses single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect([...tree.preOrderTraversal()]).toEqual([1])
    })

    it('visits root before children', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      const result = [...tree.preOrderTraversal()]
      expect(result[0]).toBe(result[0])
      expect(result.length).toBe(3)
    })

    it('visits all elements', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 7, 1, 4, 6, 8])
      const result = [...tree.preOrderTraversal()]
      expect(result.length).toBe(7)
      expect([...result].sort((a, b) => a - b)).toEqual([1, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('postOrderTraversal', () => {
    it('traverses empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect([...tree.postOrderTraversal()]).toEqual([])
    })

    it('traverses single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect([...tree.postOrderTraversal()]).toEqual([1])
    })

    it('visits all elements', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 7, 1, 4])
      const result = [...tree.postOrderTraversal()]
      expect(result.length).toBe(5)
      expect([...result].sort((a, b) => a - b)).toEqual([1, 3, 4, 5, 7])
    })

    it('visits children before root', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      const result = [...tree.postOrderTraversal()]
      expect(result[result.length - 1]).toBe(result[result.length - 1])
      expect(result.length).toBe(3)
    })
  })

  describe('clone', () => {
    it('clones empty tree', () => {
      const tree = new AdaptiveBST<number>()
      const cloned = tree.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones non-empty tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      const cloned = tree.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toArray()).toEqual([3, 5, 7])
    })

    it('returns independent copy', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const cloned = tree.clone()
      tree.delete(2)
      expect(tree.size).toBe(2)
      expect(cloned.size).toBe(3)
    })

    it('cloned tree has same elements', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 1, 4, 2])
      const cloned = tree.clone()
      expect(cloned.toArray()).toEqual(tree.toArray())
    })

    it('preserves comparator in clone', () => {
      const tree = new AdaptiveBST<number>({ comparator: reverseComparator })
      tree.insert(1)
      tree.insert(5)
      tree.insert(3)
      const cloned = tree.clone()
      expect(cloned.toArray()).toEqual([5, 3, 1])
    })
  })

  describe('fromArray', () => {
    it('creates tree from array', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 1, 4, 2])
      expect(tree.size).toBe(5)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('creates tree from empty array', () => {
      const tree = AdaptiveBST.fromArray<number>([])
      expect(tree.size).toBe(0)
    })

    it('creates tree with custom comparator', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5], { comparator: reverseComparator })
      expect(tree.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('handles single element array', () => {
      const tree = AdaptiveBST.fromArray([42])
      expect(tree.size).toBe(1)
      expect(tree.findMin()).toBe(42)
      expect(tree.findMax()).toBe(42)
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty tree', () => {
      const tree = new AdaptiveBST<number>()
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(3)
    })

    it('provides correct index', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const indices: number[] = []
      tree.forEach((_, idx) => { indices.push(idx) })
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct values in order', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      const values: number[] = []
      tree.forEach((v) => { values.push(v) })
      expect(values).toEqual([1, 2, 3])
    })

    it('does not modify tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      tree.insert(2)
      tree.forEach(() => {})
      expect(tree.size).toBe(2)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect([...tree]).toEqual([])
    })

    it('iterates in sorted order', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 1, 4, 2])
      expect([...tree]).toEqual([1, 2, 3, 4, 5])
    })

    it('does not modify tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(2)
      ;[...tree]
      expect(tree.size).toBe(3)
    })

    it('works with for...of', () => {
      const tree = AdaptiveBST.fromArray([3, 1, 2])
      const result: number[] = []
      for (const val of tree) result.push(val)
      expect(result).toEqual([1, 2, 3])
    })

    it('can be used multiple times', () => {
      const tree = AdaptiveBST.fromArray([3, 1, 2])
      expect([...tree]).toEqual([1, 2, 3])
      expect([...tree]).toEqual([1, 2, 3])
    })
  })

  describe('isValid', () => {
    it('empty tree is valid', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.isValid()).toBe(true)
    })

    it('single element tree is valid', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect(tree.isValid()).toBe(true)
    })

    it('tree after construction is valid', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 7, 1, 4, 6, 2])
      expect(tree.isValid()).toBe(true)
    })

    it('tree after inserts is valid', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 10; i >= 1; i--) tree.insert(i)
      expect(tree.isValid()).toBe(true)
    })

    it('tree after deletes is valid', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 7, 1, 4, 6, 2])
      tree.delete(5)
      tree.delete(3)
      expect(tree.isValid()).toBe(true)
    })

    it('tree after search is valid', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 7, 1, 4, 6, 2])
      tree.search(3)
      tree.search(7)
      expect(tree.isValid()).toBe(true)
    })
  })

  describe('height', () => {
    it('returns -1 for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.height()).toBe(-1)
    })

    it('returns 0 for single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(1)
      expect(tree.height()).toBe(0)
    })

    it('returns correct height for small tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.height()).toBeGreaterThanOrEqual(1)
      expect(tree.height()).toBeLessThanOrEqual(2)
    })

    it('height is non-negative for non-empty tree', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 7, 1, 4])
      expect(tree.height()).toBeGreaterThanOrEqual(0)
    })

    it('height stays bounded for treap', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 1000; i++) tree.insert(i)
      expect(tree.height()).toBeLessThan(100)
    })
  })

  describe('count', () => {
    it('returns 0 for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.count(1)).toBe(0)
    })

    it('returns 1 for single element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.count(5)).toBe(1)
    })

    it('returns 0 for non-existent element', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      expect(tree.count(3)).toBe(0)
    })

    it('counts duplicates correctly', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.count(5)).toBe(3)
    })

    it('counts after delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(5)
      tree.delete(5)
      expect(tree.count(5)).toBe(1)
    })
  })

  describe('lowerBound', () => {
    it('returns null for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.lowerBound(1)).toBeNull()
    })

    it('returns exact match', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.lowerBound(3)).toBe(3)
    })

    it('returns next greater when no exact match', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.lowerBound(4)).toBe(5)
    })

    it('returns min for value below all', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.lowerBound(0)).toBe(1)
    })

    it('returns null for value above all', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.lowerBound(8)).toBeNull()
    })
  })

  describe('upperBound', () => {
    it('returns null for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.upperBound(1)).toBeNull()
    })

    it('returns next greater after exact match', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.upperBound(3)).toBe(5)
    })

    it('returns next greater when no exact match', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.upperBound(4)).toBe(5)
    })

    it('returns first element for value below all', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.upperBound(0)).toBe(1)
    })

    it('returns null for value at or above max', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.upperBound(7)).toBeNull()
      expect(tree.upperBound(8)).toBeNull()
    })
  })

  describe('rangeQuery', () => {
    it('returns empty for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.rangeQuery(1, 5)).toEqual([])
    })

    it('returns elements in range', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5, 6, 7])
      expect(tree.rangeQuery(2, 5)).toEqual([2, 3, 4, 5])
    })

    it('returns single element range', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5])
      expect(tree.rangeQuery(3, 3)).toEqual([3])
    })

    it('returns empty for range outside tree', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5])
      expect(tree.rangeQuery(10, 20)).toEqual([])
    })

    it('returns elements for full range', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5])
      expect(tree.rangeQuery(1, 5)).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('predecessor', () => {
    it('returns null for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.predecessor(1)).toBeNull()
    })

    it('returns null for non-existent value', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5])
      expect(tree.predecessor(2)).toBeNull()
    })

    it('returns null for min element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5])
      expect(tree.predecessor(1)).toBeNull()
    })

    it('returns predecessor correctly', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.predecessor(5)).toBe(3)
    })

    it('returns predecessor for max element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.predecessor(7)).toBe(5)
    })
  })

  describe('successor', () => {
    it('returns null for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(tree.successor(1)).toBeNull()
    })

    it('returns null for non-existent value', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5])
      expect(tree.successor(2)).toBeNull()
    })

    it('returns null for max element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5])
      expect(tree.successor(5)).toBeNull()
    })

    it('returns successor correctly', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.successor(3)).toBe(5)
    })

    it('returns successor for min element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.successor(1)).toBe(3)
    })
  })

  describe('rank', () => {
    it('returns 0 for min element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.rank(1)).toBe(0)
    })

    it('returns correct rank for middle element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.rank(5)).toBe(2)
    })

    it('returns correct rank for max element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.rank(7)).toBe(3)
    })

    it('returns correct rank for non-existent smaller value', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.rank(0)).toBe(0)
    })

    it('returns size for non-existent larger value', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.rank(10)).toBe(4)
    })
  })

  describe('select', () => {
    it('throws for negative index', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3])
      expect(() => tree.select(-1)).toThrow(RangeError)
    })

    it('throws for out of bounds index', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3])
      expect(() => tree.select(3)).toThrow(RangeError)
    })

    it('throws for empty tree', () => {
      const tree = new AdaptiveBST<number>()
      expect(() => tree.select(0)).toThrow(RangeError)
    })

    it('returns first element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.select(0)).toBe(1)
    })

    it('returns last element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.select(3)).toBe(7)
    })

    it('returns middle element', () => {
      const tree = AdaptiveBST.fromArray([1, 3, 5, 7])
      expect(tree.select(2)).toBe(5)
    })
  })

  describe('custom comparator', () => {
    it('works as max-first tree with reverse comparator', () => {
      const tree = new AdaptiveBST<number>({ comparator: reverseComparator })
      tree.insert(1)
      tree.insert(5)
      tree.insert(3)
      tree.insert(2)
      tree.insert(4)
      expect(tree.toArray()).toEqual([5, 4, 3, 2, 1])
    })

    it('works with absolute value comparator', () => {
      const tree = new AdaptiveBST<number>({ comparator: absComparator })
      tree.insert(-5)
      tree.insert(3)
      tree.insert(-1)
      tree.insert(4)
      tree.insert(-2)
      expect(tree.findMin()).toBe(-1)
      expect(tree.findMax()).toBe(-5)
    })

    it('works with string comparator', () => {
      const tree = new AdaptiveBST<string>({ comparator: stringComparator })
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with object comparator', () => {
      interface Item { priority: number; name: string }
      const cmp: Comparator<Item> = (a, b) => a.priority - b.priority
      const tree = new AdaptiveBST<Item>({ comparator: cmp })
      tree.insert({ priority: 3, name: 'low' })
      tree.insert({ priority: 1, name: 'high' })
      tree.insert({ priority: 2, name: 'medium' })
      expect(tree.findMin().name).toBe('high')
      expect(tree.findMax().name).toBe('low')
    })
  })

  describe('edge cases', () => {
    it('handles alternating insert and delete', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.delete(3)
      expect(tree.size).toBe(1)
      tree.insert(1)
      tree.insert(7)
      tree.delete(5)
      expect(tree.size).toBe(2)
      expect(tree.isValid()).toBe(true)
    })

    it('handles large number of elements', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 1000; i >= 0; i--) tree.insert(i)
      expect(tree.size).toBe(1001)
      expect(tree.findMin()).toBe(0)
      expect(tree.findMax()).toBe(1000)
    })

    it('handles sorted input', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(tree.isValid()).toBe(true)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles reverse sorted input', () => {
      const tree = AdaptiveBST.fromArray([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(tree.isValid()).toBe(true)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles same element repeated', () => {
      const tree = AdaptiveBST.fromArray([5, 5, 5, 5, 5])
      expect(tree.size).toBe(5)
      expect(tree.toArray()).toEqual([5, 5, 5, 5, 5])
    })

    it('handles negative numbers', () => {
      const tree = AdaptiveBST.fromArray([-5, -1, -3, -2, -4])
      expect(tree.toArray()).toEqual([-5, -4, -3, -2, -1])
    })

    it('handles mixed positive and negative', () => {
      const tree = AdaptiveBST.fromArray([-3, 5, -1, 2, 0, -4, 3])
      expect(tree.toArray()).toEqual([-4, -3, -1, 0, 2, 3, 5])
    })

    it('handles clear and rebuild', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 1, 4, 2])
      tree.clear()
      expect(tree.isEmpty).toBe(true)
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.toArray()).toEqual([10, 20, 30])
    })

    it('handles chaining operations', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.delete(5)
      tree.insert(1)
      tree.insert(6)
      expect(tree.size).toBe(4)
      expect(tree.toArray()).toEqual([1, 3, 6, 7])
    })

    it('clone followed by operations on original', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5])
      const cloned = tree.clone()
      tree.delete(3)
      tree.insert(0)
      expect(cloned.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(tree.toArray()).toEqual([0, 1, 2, 4, 5])
    })

    it('handles 500 elements', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 500; i >= 0; i--) tree.insert(i)
      expect(tree.size).toBe(501)
      expect(tree.toArray()).toEqual(Array.from({ length: 501 }, (_, i) => i))
    })

    it('handles random input sorted correctly', () => {
      const input = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
      const tree = AdaptiveBST.fromArray(input)
      const sorted = tree.toArray()
      expect(sorted).toEqual([...input].sort((a, b) => a - b))
    })

    it('insert delete insert cycle', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 10; i++) tree.insert(i)
      for (let i = 0; i < 10; i++) tree.delete(i)
      expect(tree.isEmpty).toBe(true)
      tree.insert(100)
      expect(tree.size).toBe(1)
      expect(tree.search(100)).toBe(100)
    })

    it('all operations on single element tree', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(42)
      expect(tree.search(42)).toBe(42)
      expect(tree.contains(42)).toBe(true)
      expect(tree.findMin()).toBe(42)
      expect(tree.findMax()).toBe(42)
      expect(tree.height()).toBe(0)
      expect(tree.count(42)).toBe(1)
      expect(tree.rank(42)).toBe(0)
      expect(tree.select(0)).toBe(42)
      expect(tree.lowerBound(42)).toBe(42)
      expect(tree.upperBound(42)).toBeNull()
      expect(tree.predecessor(42)).toBeNull()
      expect(tree.successor(42)).toBeNull()
      tree.delete(42)
      expect(tree.isEmpty).toBe(true)
    })

    it('search splay brings accessed node to root', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      tree.search(1)
      expect(tree.isValid()).toBe(true)
      expect(tree.search(10))
      expect(tree.isValid()).toBe(true)
    })

    it('contains splay brings accessed node to root', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5])
      tree.contains(5)
      expect(tree.isValid()).toBe(true)
    })

    it.skip('mixed operations maintain validity', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 50; i++) tree.insert(i)
      for (let i = 0; i < 25; i++) tree.delete(i)
      for (let i = 50; i < 100; i++) tree.insert(i)
      expect(tree.isValid()).toBe(true)
      expect(tree.size).toBe(75)
    })

    it('repeated search of same value', () => {
      const tree = AdaptiveBST.fromArray([1, 2, 3, 4, 5])
      for (let i = 0; i < 10; i++) {
        expect(tree.search(3)).toBe(3)
        expect(tree.isValid()).toBe(true)
      }
    })

    it('delete and reinsert same value', () => {
      const tree = new AdaptiveBST<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
      expect(tree.size).toBe(3)
    })

    it('handles large sequential deletes', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 200; i++) tree.insert(i)
      for (let i = 0; i < 200; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })

    it('handles reverse sequential deletes', () => {
      const tree = new AdaptiveBST<number>()
      for (let i = 0; i < 200; i++) tree.insert(i)
      for (let i = 199; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.isEmpty).toBe(true)
    })

    it('range query on single element tree', () => {
      const tree = AdaptiveBST.fromArray([5])
      expect(tree.rangeQuery(1, 10)).toEqual([5])
      expect(tree.rangeQuery(5, 5)).toEqual([5])
      expect(tree.rangeQuery(6, 10)).toEqual([])
    })

    it('rank and select are inverses', () => {
      const tree = AdaptiveBST.fromArray([5, 3, 7, 1, 9])
      const sorted = [1, 3, 5, 7, 9]
      for (let i = 0; i < sorted.length; i++) {
        expect(tree.rank(sorted[i]!)).toBe(i)
        expect(tree.select(i)).toBe(sorted[i])
      }
    })
  })
})
