import { describe, it, expect, beforeEach } from 'vitest'
import { PairingForest2 } from '../../src/core/pairing-forest-2/pairing-forest-2.js'
import type { PairingForestNode } from '../../src/core/pairing-forest-2/pairing-forest-2.js'

describe('PairingForest2', () => {
  let forest: PairingForest2<number>

  beforeEach(() => {
    forest = new PairingForest2<number>()
  })

  describe('constructor', () => {
    it('should create an empty forest', () => {
      const f = new PairingForest2<number>()
      expect(f.size).toBe(0)
      expect(f.isEmpty()).toBe(true)
    })

    it('should accept options with comparator', () => {
      const f = new PairingForest2<number>({
        comparator: (a, b) => b - a,
      })
      f.insert(1)
      f.insert(5)
      expect(f.peek()).toBe(5)
    })

    it('should accept empty options', () => {
      const f = new PairingForest2<number>({})
      expect(f.size).toBe(0)
    })

    it('should accept undefined options', () => {
      const f = new PairingForest2<number>(undefined)
      expect(f.size).toBe(0)
    })

    it('should use default comparator when none provided', () => {
      forest.insert(5)
      forest.insert(3)
      forest.insert(7)
      expect(forest.peek()).toBe(3)
    })

    it('should accept custom comparator for strings', () => {
      const f = new PairingForest2<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      f.insert('cherry')
      f.insert('apple')
      f.insert('banana')
      expect(f.peek()).toBe('apple')
    })
  })

  describe('insert', () => {
    it('should add a single element', () => {
      forest.insert(5)
      expect(forest.size).toBe(1)
      expect(forest.isEmpty()).toBe(false)
    })

    it('should add multiple elements', () => {
      forest.insert(3)
      forest.insert(1)
      forest.insert(4)
      expect(forest.size).toBe(3)
    })

    it('should maintain min on insert', () => {
      forest.insert(5)
      forest.insert(3)
      forest.insert(7)
      forest.insert(1)
      expect(forest.peek()).toBe(1)
    })

    it('should handle negative values', () => {
      forest.insert(-5)
      forest.insert(-10)
      forest.insert(3)
      expect(forest.peek()).toBe(-10)
    })

    it('should handle zero', () => {
      forest.insert(0)
      expect(forest.peek()).toBe(0)
    })

    it('should handle duplicate values', () => {
      forest.insert(5)
      forest.insert(5)
      forest.insert(5)
      expect(forest.size).toBe(3)
      expect(forest.peek()).toBe(5)
    })

    it('should handle floating point values', () => {
      forest.insert(3.14)
      forest.insert(2.71)
      forest.insert(1.41)
      expect(forest.peek()).toBe(1.41)
    })
  })

  describe('extractMin', () => {
    it('should return undefined for empty forest', () => {
      expect(forest.extractMin()).toBe(undefined)
    })

    it('should extract single element', () => {
      forest.insert(5)
      const value = forest.extractMin()
      expect(value).toBe(5)
      expect(forest.size).toBe(0)
      expect(forest.isEmpty()).toBe(true)
    })

    it('should extract elements in order', () => {
      forest.insert(3)
      forest.insert(1)
      forest.insert(4)
      forest.insert(2)
      const extracted: number[] = []
      while (!forest.isEmpty()) {
        const val = forest.extractMin()
        if (val !== undefined) {
          extracted.push(val)
        }
      }
      expect(extracted).toEqual([1, 2, 3, 4])
    })

    it('should maintain heap property after extract', () => {
      forest.insert(5)
      forest.insert(3)
      forest.insert(7)
      forest.insert(1)
      forest.extractMin()
      expect(forest.peek()).toBe(3)
    })

    it('should handle multiple extracts', () => {
      forest.insert(10)
      forest.insert(5)
      forest.insert(15)
      forest.insert(3)
      expect(forest.extractMin()).toBe(3)
      expect(forest.extractMin()).toBe(5)
      expect(forest.extractMin()).toBe(10)
      expect(forest.extractMin()).toBe(15)
    })

    it('should update size correctly', () => {
      forest.insert(1)
      forest.insert(2)
      forest.insert(3)
      forest.extractMin()
      expect(forest.size).toBe(2)
      forest.extractMin()
      expect(forest.size).toBe(1)
    })
  })

  describe('peek', () => {
    it('should return undefined for empty forest', () => {
      expect(forest.peek()).toBe(undefined)
    })

    it('should return minimum without extracting', () => {
      forest.insert(5)
      forest.insert(3)
      forest.insert(7)
      expect(forest.peek()).toBe(3)
      expect(forest.size).toBe(3)
    })

    it('should return minimum after insert', () => {
      forest.insert(5)
      expect(forest.peek()).toBe(5)
      forest.insert(3)
      expect(forest.peek()).toBe(3)
    })

    it('should return minimum after extract', () => {
      forest.insert(5)
      forest.insert(3)
      forest.insert(7)
      forest.extractMin()
      expect(forest.peek()).toBe(5)
    })
  })

  describe('decreaseKey', () => {
    it('should not increase key value', () => {
      forest.insert(5)
      const nodes = (forest as any).trees
      if (nodes.length > 0) {
        const node: PairingForestNode<number> = nodes[0]!
        forest.decreaseKey(node, 10)
        expect(node.value).toBe(5)
      }
    })

    it('should decrease key value', () => {
      forest.insert(5)
      const nodes = (forest as any).trees
      if (nodes.length > 0) {
        const node: PairingForestNode<number> = nodes[0]!
        forest.decreaseKey(node, 3)
        expect(node.value).toBe(3)
      }
    })

    it('should update peek after decrease', () => {
      forest.insert(10)
      forest.insert(5)
      const nodes = (forest as any).trees
      let foundNode: PairingForestNode<number> | null = null
      for (const node of nodes) {
        if (node.value === 10) {
          foundNode = node
          break
        }
      }
      if (foundNode !== null) {
        forest.decreaseKey(foundNode, 1)
        expect(forest.peek()).toBe(1)
      }
    })

    it('should handle same value', () => {
      forest.insert(5)
      const nodes = (forest as any).trees
      if (nodes.length > 0) {
        const node: PairingForestNode<number> = nodes[0]!
        forest.decreaseKey(node, 5)
        expect(node.value).toBe(5)
      }
    })
  })

  describe('merge', () => {
    it('should merge two empty forests', () => {
      const other = new PairingForest2<number>()
      forest.merge(other)
      expect(forest.size).toBe(0)
      expect(other.size).toBe(0)
    })

    it('should merge empty forest with non-empty', () => {
      const other = new PairingForest2<number>()
      other.insert(1)
      other.insert(2)
      forest.merge(other)
      expect(forest.size).toBe(2)
      expect(other.size).toBe(0)
      expect(forest.peek()).toBe(1)
    })

    it('should merge non-empty forest with empty', () => {
      forest.insert(1)
      forest.insert(2)
      const other = new PairingForest2<number>()
      forest.merge(other)
      expect(forest.size).toBe(2)
      expect(forest.peek()).toBe(1)
    })

    it('should merge two non-empty forests', () => {
      forest.insert(3)
      forest.insert(5)
      const other = new PairingForest2<number>()
      other.insert(1)
      other.insert(4)
      forest.merge(other)
      expect(forest.size).toBe(4)
      expect(forest.peek()).toBe(1)
      expect(other.size).toBe(0)
    })

    it('should maintain order after merge', () => {
      forest.insert(10)
      forest.insert(20)
      const other = new PairingForest2<number>()
      other.insert(5)
      other.insert(15)
      forest.merge(other)
      expect(forest.peek()).toBe(5)
      const extracted: number[] = []
      while (!forest.isEmpty()) {
        const val = forest.extractMin()
        if (val !== undefined) {
          extracted.push(val)
        }
      }
      expect(extracted).toEqual([5, 10, 15, 20])
    })

    it('should clear other forest after merge', () => {
      forest.insert(1)
      const other = new PairingForest2<number>()
      other.insert(2)
      forest.merge(other)
      expect(other.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty forest', () => {
      expect(forest.size).toBe(0)
    })

    it('should return number of elements', () => {
      forest.insert(1)
      forest.insert(2)
      forest.insert(3)
      expect(forest.size).toBe(3)
    })

    it('should update after insert', () => {
      expect(forest.size).toBe(0)
      forest.insert(1)
      expect(forest.size).toBe(1)
      forest.insert(2)
      expect(forest.size).toBe(2)
    })

    it('should update after extract', () => {
      forest.insert(1)
      forest.insert(2)
      forest.insert(3)
      expect(forest.size).toBe(3)
      forest.extractMin()
      expect(forest.size).toBe(2)
      forest.extractMin()
      expect(forest.size).toBe(1)
    })

    it('should update after merge', () => {
      forest.insert(1)
      forest.insert(2)
      const other = new PairingForest2<number>()
      other.insert(3)
      other.insert(4)
      expect(forest.size).toBe(2)
      expect(other.size).toBe(2)
      forest.merge(other)
      expect(forest.size).toBe(4)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty forest', () => {
      expect(forest.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      forest.insert(1)
      expect(forest.isEmpty()).toBe(false)
    })

    it('should return true after extracting all', () => {
      forest.insert(1)
      forest.insert(2)
      forest.extractMin()
      forest.extractMin()
      expect(forest.isEmpty()).toBe(true)
    })

    it('should return false when elements remain', () => {
      forest.insert(1)
      forest.insert(2)
      forest.insert(3)
      forest.extractMin()
      expect(forest.isEmpty()).toBe(false)
    })
  })

  describe('order verification', () => {
    it('should maintain min-heap order for random insertions', () => {
      const values = [5, 2, 8, 1, 9, 3, 7, 4, 6]
      for (const v of values) {
        forest.insert(v)
      }
      const sorted = [...values].sort((a, b) => a - b)
      const extracted: number[] = []
      while (!forest.isEmpty()) {
        const val = forest.extractMin()
        if (val !== undefined) {
          extracted.push(val)
        }
      }
      expect(extracted).toEqual(sorted)
    })

    it('should maintain order with intermixed operations', () => {
      forest.insert(5)
      forest.insert(3)
      expect(forest.extractMin()).toBe(3)
      forest.insert(7)
      expect(forest.peek()).toBe(5)
      expect(forest.extractMin()).toBe(5)
      expect(forest.peek()).toBe(7)
    })

    it('should handle large dataset', () => {
      const count = 100
      const values: number[] = []
      for (let i = 0; i < count; i++) {
        values.push(i)
      }
      const shuffled = [...values].sort(() => Math.random() - 0.5)
      for (const v of shuffled) {
        forest.insert(v)
      }
      const extracted: number[] = []
      while (!forest.isEmpty()) {
        const val = forest.extractMin()
        if (val !== undefined) {
          extracted.push(val)
        }
      }
      expect(extracted).toEqual(values)
    })

    it('should maintain order with duplicate values', () => {
      const values = [5, 2, 5, 1, 3, 5, 4, 2]
      for (const v of values) {
        forest.insert(v)
      }
      const sorted = [...values].sort((a, b) => a - b)
      const extracted: number[] = []
      while (!forest.isEmpty()) {
        const val = forest.extractMin()
        if (val !== undefined) {
          extracted.push(val)
        }
      }
      expect(extracted).toEqual(sorted)
    })
  })
})
