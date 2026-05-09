import { describe, it, expect, beforeEach } from 'vitest'
import { DisjointSetUnion } from '../../src/core/disjoint-set-union/disjoint-set-union.js'
import { DEFAULT_DSU_OPTIONS } from '../../src/core/disjoint-set-union/types.js'
import type { DisjointSetUnionOptions } from '../../src/core/disjoint-set-union/types.js'

describe('DisjointSetUnion', () => {
  let dsu: DisjointSetUnion

  beforeEach(() => {
    dsu = new DisjointSetUnion(10)
  })

  describe('constructor', () => {
    it('should create instance with n elements', () => {
      const d = new DisjointSetUnion(10)
      expect(d.getSize()).toBe(10)
      expect(d.getComponentCount()).toBe(10)
    })

    it('should create instance with n=1', () => {
      const d = new DisjointSetUnion(1)
      expect(d.getSize()).toBe(1)
    })

    it('should create instance with n=0', () => {
      const d = new DisjointSetUnion(0)
      expect(d.getSize()).toBe(0)
      expect(d.getComponentCount()).toBe(0)
    })

    it('should throw for negative n', () => {
      expect(() => new DisjointSetUnion(-1)).toThrow('Size must be non-negative')
    })

    it('should create with large n', () => {
      const d = new DisjointSetUnion(10000)
      expect(d.getSize()).toBe(10000)
      expect(d.getComponentCount()).toBe(10000)
    })

    it('should initialize each element as its own parent', () => {
      const d = new DisjointSetUnion(5)
      for (let i = 0; i < 5; i++) {
        expect(d.find(i)).toBe(i)
      }
    })

    it('should initialize each set with size 1', () => {
      const d = new DisjointSetUnion(5)
      for (let i = 0; i < 5; i++) {
        expect(d.getSize(i)).toBe(1)
      }
    })
  })

  describe('find', () => {
    it('should return element itself for singleton', () => {
      expect(dsu.find(0)).toBe(0)
      expect(dsu.find(5)).toBe(5)
      expect(dsu.find(9)).toBe(9)
    })

    it('should throw for element out of bounds (negative)', () => {
      expect(() => dsu.find(-1)).toThrow('out of bounds')
    })

    it('should throw for element equal to n', () => {
      expect(() => dsu.find(10)).toThrow('out of bounds')
    })

    it('should throw for element greater than n', () => {
      expect(() => dsu.find(100)).toThrow('out of bounds')
    })

    it('should return same root after union', () => {
      dsu.union(0, 1)
      expect(dsu.find(0)).toBe(dsu.find(1))
    })

    it('should apply path compression', () => {
      const d = new DisjointSetUnion(10)
      for (let i = 1; i < 10; i++) d.union(i - 1, i)
      const root = d.find(9)
      expect(root).toBe(d.find(0))
      expect(root).toBe(d.find(5))
    })

    it('should return consistent results', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const r0 = dsu.find(0)
      const r1 = dsu.find(1)
      expect(r0).toBe(r1)
      expect(dsu.find(2)).not.toBe(r0)
    })
  })

  describe('union', () => {
    it('should union two separate elements', () => {
      expect(dsu.union(0, 1)).toBe(true)
    })

    it('should return true when merging different sets', () => {
      expect(dsu.union(3, 7)).toBe(true)
    })

    it('should return false for same-set elements', () => {
      dsu.union(0, 1)
      expect(dsu.union(0, 1)).toBe(false)
      expect(dsu.union(1, 0)).toBe(false)
    })

    it('should return false for same element', () => {
      expect(dsu.union(0, 0)).toBe(false)
    })

    it('should decrement component count', () => {
      expect(dsu.getComponentCount()).toBe(10)
      dsu.union(0, 1)
      expect(dsu.getComponentCount()).toBe(9)
      dsu.union(2, 3)
      expect(dsu.getComponentCount()).toBe(8)
    })

    it('should not decrement for already connected', () => {
      dsu.union(0, 1)
      const count = dsu.getComponentCount()
      dsu.union(0, 1)
      expect(dsu.getComponentCount()).toBe(count)
    })

    it('should return false for out of bounds x', () => {
      expect(dsu.union(-1, 0)).toBe(false)
      expect(dsu.union(10, 0)).toBe(false)
    })

    it('should return false for out of bounds y', () => {
      expect(dsu.union(0, -1)).toBe(false)
      expect(dsu.union(0, 10)).toBe(false)
    })

    it('should union by rank correctly (equal ranks)', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(0, 2)
      expect(dsu.connected(0, 3)).toBe(true)
      expect(dsu.getComponentCount()).toBe(7)
    })

    it('should handle chain of unions', () => {
      for (let i = 1; i < 10; i++) dsu.union(i - 1, i)
      expect(dsu.getComponentCount()).toBe(1)
      expect(dsu.connected(0, 9)).toBe(true)
    })

    it('should handle star pattern unions', () => {
      for (let i = 1; i < 10; i++) dsu.union(0, i)
      expect(dsu.getComponentCount()).toBe(1)
      expect(dsu.getSize(0)).toBe(10)
    })

    it('should handle binary merge pattern', () => {
      const d = new DisjointSetUnion(16)
      for (let stride = 1; stride < 16; stride *= 2) {
        for (let i = 0; i + stride < 16; i += stride * 2) {
          d.union(i, i + stride)
        }
      }
      expect(d.getComponentCount()).toBe(1)
    })

    it('should handle transitive union', () => {
      dsu.union(0, 1)
      dsu.union(1, 2)
      dsu.union(2, 3)
      expect(dsu.connected(0, 3)).toBe(true)
    })

    it('should union 0-sized DSU elements without error', () => {
      const d = new DisjointSetUnion(0)
      expect(d.union(0, 1)).toBe(false)
    })
  })

  describe('connected', () => {
    it('should return true for same element', () => {
      expect(dsu.connected(0, 0)).toBe(true)
      expect(dsu.connected(5, 5)).toBe(true)
    })

    it('should return false for unconnected elements', () => {
      expect(dsu.connected(0, 1)).toBe(false)
    })

    it('should return true after union', () => {
      dsu.union(0, 1)
      expect(dsu.connected(0, 1)).toBe(true)
    })

    it('should return false for out of bounds', () => {
      expect(dsu.connected(-1, 0)).toBe(false)
      expect(dsu.connected(0, 10)).toBe(false)
      expect(dsu.connected(-1, -1)).toBe(false)
    })

    it('should be symmetric', () => {
      dsu.union(3, 7)
      expect(dsu.connected(3, 7)).toBe(dsu.connected(7, 3))
    })

    it('should be transitive', () => {
      dsu.union(0, 1)
      dsu.union(1, 2)
      expect(dsu.connected(0, 2)).toBe(true)
    })

    it('should handle zero-element DSU', () => {
      const d = new DisjointSetUnion(0)
      expect(d.connected(0, 1)).toBe(false)
    })
  })

  describe('getSize(x)', () => {
    it('should return 1 for singleton', () => {
      expect(dsu.getSize(0)).toBe(1)
    })

    it('should return 2 after merging two elements', () => {
      dsu.union(0, 1)
      expect(dsu.getSize(0)).toBe(2)
      expect(dsu.getSize(1)).toBe(2)
    })

    it('should return correct size for larger set', () => {
      dsu.union(0, 1)
      dsu.union(0, 2)
      dsu.union(0, 3)
      expect(dsu.getSize(0)).toBe(4)
      expect(dsu.getSize(3)).toBe(4)
    })

    it('should return 0 for out of bounds', () => {
      expect(dsu.getSize(-1)).toBe(0)
      expect(dsu.getSize(10)).toBe(0)
    })

    it('should return same size from any member', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(0, 2)
      for (let i = 0; i < 4; i++) {
        expect(dsu.getSize(i)).toBe(4)
      }
    })

    it('should track sizes independently for separate sets', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(4, 5)
      expect(dsu.getSize(0)).toBe(2)
      expect(dsu.getSize(2)).toBe(2)
      expect(dsu.getSize(4)).toBe(2)
    })

    it('should handle full union', () => {
      for (let i = 1; i < 10; i++) dsu.union(0, i)
      expect(dsu.getSize(5)).toBe(10)
    })
  })

  describe('getSets', () => {
    it('should return all singletons initially', () => {
      const sets = dsu.getSets()
      expect(sets.length).toBe(10)
    })

    it('should return empty array for n=0', () => {
      const d = new DisjointSetUnion(0)
      expect(d.getSets()).toEqual([])
    })

    it('should return merged sets after union', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const sets = dsu.getSets()
      expect(sets.length).toBe(8)
    })

    it('should include all elements', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const allElements: number[] = []
      for (const set of dsu.getSets()) {
        allElements.push(...set)
      }
      expect(allElements.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should return single set when all connected', () => {
      for (let i = 1; i < 10; i++) dsu.union(0, i)
      const sets = dsu.getSets()
      expect(sets.length).toBe(1)
      expect(sets[0]!.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should return array type', () => {
      expect(Array.isArray(dsu.getSets())).toBe(true)
    })

    it('should group elements by root correctly', () => {
      dsu.union(0, 2)
      dsu.union(1, 3)
      const sets = dsu.getSets()
      const found = sets.find(s => s.includes(0) && s.includes(2))
      expect(found).toBeDefined()
      const found2 = sets.find(s => s.includes(1) && s.includes(3))
      expect(found2).toBeDefined()
    })
  })

  describe('getComponentCount', () => {
    it('should return n initially', () => {
      expect(dsu.getComponentCount()).toBe(10)
    })

    it('should return 0 for n=0', () => {
      const d = new DisjointSetUnion(0)
      expect(d.getComponentCount()).toBe(0)
    })

    it('should return 1 for n=1', () => {
      const d = new DisjointSetUnion(1)
      expect(d.getComponentCount()).toBe(1)
    })

    it('should decrease with each union', () => {
      dsu.union(0, 1)
      expect(dsu.getComponentCount()).toBe(9)
      dsu.union(2, 3)
      expect(dsu.getComponentCount()).toBe(8)
      dsu.union(4, 5)
      expect(dsu.getComponentCount()).toBe(7)
    })

    it('should reach 1 when all merged', () => {
      for (let i = 1; i < 10; i++) dsu.union(0, i)
      expect(dsu.getComponentCount()).toBe(1)
    })
  })

  describe('snapshot and rollback', () => {
    it('should return a numeric snapshot ID', () => {
      const id = dsu.snapshot()
      expect(typeof id).toBe('number')
    })

    it('should return incrementing IDs', () => {
      const id0 = dsu.snapshot()
      const id1 = dsu.snapshot()
      const id2 = dsu.snapshot()
      expect(id0).toBe(0)
      expect(id1).toBe(1)
      expect(id2).toBe(2)
    })

    it('should restore state after rollback', () => {
      dsu.union(0, 1)
      const id = dsu.snapshot()
      dsu.union(2, 3)
      dsu.union(0, 2)
      expect(dsu.getComponentCount()).toBe(7)
      dsu.rollback(id)
      expect(dsu.getComponentCount()).toBe(9)
      expect(dsu.connected(0, 2)).toBe(false)
    })

    it('should throw for invalid snapshot ID', () => {
      expect(() => dsu.rollback(999)).toThrow('Snapshot 999 not found')
    })

    it('should preserve sizes after rollback', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const id = dsu.snapshot()
      dsu.union(0, 2)
      expect(dsu.getSize(0)).toBe(4)
      dsu.rollback(id)
      expect(dsu.getSize(0)).toBe(2)
      expect(dsu.getSize(2)).toBe(2)
    })

    it('should allow multiple snapshots', () => {
      const id0 = dsu.snapshot()
      dsu.union(0, 1)
      const id1 = dsu.snapshot()
      dsu.union(2, 3)
      const id2 = dsu.snapshot()
      dsu.union(0, 2)

      dsu.rollback(id2)
      expect(dsu.connected(0, 2)).toBe(false)
      expect(dsu.connected(0, 1)).toBe(true)

      dsu.rollback(id1)
      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(2, 3)).toBe(false)

      dsu.rollback(id0)
      expect(dsu.getComponentCount()).toBe(10)
      expect(dsu.connected(0, 1)).toBe(false)
    })

    it('should rollback to earlier state after intermediate changes', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(4, 5)
      dsu.rollback(id)
      expect(dsu.getComponentCount()).toBe(10)
      expect(dsu.connected(0, 1)).toBe(false)
    })

    it('should not affect snapshot after rollback', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      dsu.rollback(id)
      dsu.union(0, 1)
      expect(dsu.connected(0, 1)).toBe(true)
      dsu.rollback(id)
      expect(dsu.connected(0, 1)).toBe(false)
    })

    it('should allow taking snapshot after rollback', () => {
      const id0 = dsu.snapshot()
      dsu.union(0, 1)
      dsu.rollback(id0)
      const id1 = dsu.snapshot()
      dsu.union(2, 3)
      dsu.rollback(id1)
      expect(dsu.getComponentCount()).toBe(10)
    })

    it('should handle rollback on empty DSU', () => {
      const d = new DisjointSetUnion(5)
      const id = d.snapshot()
      d.union(0, 1)
      d.rollback(id)
      expect(d.getComponentCount()).toBe(5)
    })

    it('should rollback rank correctly', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const id = dsu.snapshot()
      dsu.union(0, 2)
      dsu.union(4, 5)
      dsu.rollback(id)
      dsu.union(0, 2)
      expect(dsu.connected(0, 3)).toBe(true)
      expect(dsu.getComponentCount()).toBe(7)
    })
  })

  describe('isSame', () => {
    it('should return true for same element', () => {
      expect(dsu.isSame(0, 0)).toBe(true)
    })

    it('should return false for different elements', () => {
      expect(dsu.isSame(0, 1)).toBe(false)
    })

    it('should return true after union', () => {
      dsu.union(0, 1)
      expect(dsu.isSame(0, 1)).toBe(true)
    })

    it('should be symmetric', () => {
      dsu.union(3, 7)
      expect(dsu.isSame(3, 7)).toBe(dsu.isSame(7, 3))
    })

    it('should return false for out of bounds', () => {
      expect(dsu.isSame(-1, 0)).toBe(false)
      expect(dsu.isSame(0, 100)).toBe(false)
    })
  })

  describe('getRepresentative', () => {
    it('should return element itself for singleton', () => {
      expect(dsu.getRepresentative(0)).toBe(0)
      expect(dsu.getRepresentative(5)).toBe(5)
    })

    it('should return same root for connected elements', () => {
      dsu.union(0, 1)
      expect(dsu.getRepresentative(0)).toBe(dsu.getRepresentative(1))
    })

    it('should throw for out of bounds', () => {
      expect(() => dsu.getRepresentative(-1)).toThrow('out of bounds')
      expect(() => dsu.getRepresentative(10)).toThrow('out of bounds')
    })

    it('should be consistent with find', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      expect(dsu.getRepresentative(0)).toBe(dsu.find(0))
      expect(dsu.getRepresentative(2)).toBe(dsu.find(2))
    })
  })

  describe('getElements', () => {
    it('should return single element for singleton', () => {
      expect(dsu.getElements(0)).toEqual([0])
    })

    it('should return all elements in same set', () => {
      dsu.union(0, 1)
      dsu.union(0, 2)
      const elements = dsu.getElements(0).sort((a, b) => a - b)
      expect(elements).toEqual([0, 1, 2])
    })

    it('should return empty array for out of bounds', () => {
      expect(dsu.getElements(-1)).toEqual([])
      expect(dsu.getElements(10)).toEqual([])
    })

    it('should return same elements from any member', () => {
      dsu.union(0, 1)
      dsu.union(1, 2)
      const from0 = dsu.getElements(0).sort((a, b) => a - b)
      const from1 = dsu.getElements(1).sort((a, b) => a - b)
      const from2 = dsu.getElements(2).sort((a, b) => a - b)
      expect(from0).toEqual(from1)
      expect(from1).toEqual(from2)
    })

    it('should return all elements for fully connected DSU', () => {
      for (let i = 1; i < 10; i++) dsu.union(0, i)
      const elements = dsu.getElements(5).sort((a, b) => a - b)
      expect(elements).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('should return only elements in same set when multiple sets exist', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const elements = dsu.getElements(0).sort((a, b) => a - b)
      expect(elements).toEqual([0, 1])
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      dsu.union(0, 1)
      const copy = dsu.clone()
      expect(copy.getSize()).toBe(dsu.getSize())
      expect(copy.getComponentCount()).toBe(dsu.getComponentCount())
    })

    it('should not affect original when modified', () => {
      dsu.union(0, 1)
      const copy = dsu.clone()
      copy.union(2, 3)
      expect(dsu.connected(2, 3)).toBe(false)
      expect(copy.connected(2, 3)).toBe(true)
    })

    it('should preserve union state', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(0, 2)
      const copy = dsu.clone()
      expect(copy.connected(0, 3)).toBe(true)
      expect(copy.getComponentCount()).toBe(7)
    })

    it('should preserve sizes', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const copy = dsu.clone()
      expect(copy.getSize(0)).toBe(2)
      expect(copy.getSize(2)).toBe(2)
    })

    it('should clone snapshots', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      const copy = dsu.clone()
      copy.rollback(id)
      expect(copy.connected(0, 1)).toBe(false)
    })

    it('should not share snapshot state with original', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      const copy = dsu.clone()
      const id2 = copy.snapshot()
      expect(id2).toBe(1)
      copy.rollback(id)
      expect(copy.connected(0, 1)).toBe(false)
    })

    it('should handle cloning n=0 DSU', () => {
      const d = new DisjointSetUnion(0)
      const copy = d.clone()
      expect(copy.getSize()).toBe(0)
    })

    it('should handle cloning n=1 DSU', () => {
      const d = new DisjointSetUnion(1)
      const copy = d.clone()
      expect(copy.getSize()).toBe(1)
      expect(copy.find(0)).toBe(0)
    })
  })

  describe('getSize (total)', () => {
    it('should return n', () => {
      expect(dsu.getSize()).toBe(10)
    })

    it('should return 0 for empty DSU', () => {
      const d = new DisjointSetUnion(0)
      expect(d.getSize()).toBe(0)
    })

    it('should return 1 for single-element DSU', () => {
      const d = new DisjointSetUnion(1)
      expect(d.getSize()).toBe(1)
    })

    it('should not change after unions', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      expect(dsu.getSize()).toBe(10)
    })
  })

  describe('toArray', () => {
    it('should return representative array', () => {
      const arr = dsu.toArray()
      expect(arr.length).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('should return empty array for n=0', () => {
      const d = new DisjointSetUnion(0)
      expect(d.toArray()).toEqual([])
    })

    it('should reflect unions', () => {
      dsu.union(0, 1)
      const arr = dsu.toArray()
      expect(arr[0]).toBe(arr[1])
    })

    it('should return compressed representatives', () => {
      dsu.union(0, 1)
      dsu.union(1, 2)
      const arr = dsu.toArray()
      expect(arr[0]).toBe(arr[1])
      expect(arr[1]).toBe(arr[2])
    })

    it('should return a new array each call', () => {
      const arr1 = dsu.toArray()
      const arr2 = dsu.toArray()
      expect(arr1).toEqual(arr2)
      expect(arr1).not.toBe(arr2)
    })

    it('should handle fully connected DSU', () => {
      for (let i = 1; i < 10; i++) dsu.union(0, i)
      const arr = dsu.toArray()
      const root = arr[0]!
      for (let i = 0; i < 10; i++) {
        expect(arr[i]).toBe(root)
      }
    })
  })

  describe('path compression', () => {
    it('should flatten deep trees', () => {
      const d = new DisjointSetUnion(20)
      for (let i = 1; i < 20; i++) d.union(i - 1, i)
      d.find(19)
      const root = d.find(0)
      expect(d.find(19)).toBe(root)
      expect(d.connected(0, 19)).toBe(true)
    })

    it('should maintain correctness after compression', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(0, 2)
      dsu.union(4, 5)
      dsu.union(0, 4)
      expect(dsu.connected(1, 5)).toBe(true)
      expect(dsu.connected(0, 5)).toBe(true)
    })

    it('should handle repeated finds efficiently', () => {
      const d = new DisjointSetUnion(100)
      for (let i = 1; i < 100; i++) d.union(i - 1, i)
      d.find(99)
      const root = d.find(99)
      expect(root).toBe(d.find(0))
      expect(root).toBe(d.find(50))
    })
  })

  describe('union by rank', () => {
    it('should attach smaller tree under larger', () => {
      dsu.union(0, 1)
      dsu.union(0, 2)
      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(0, 2)).toBe(true)
    })

    it('should handle equal rank merges', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(0, 2)
      expect(dsu.getComponentCount()).toBe(7)
      expect(dsu.getSize(0)).toBe(4)
    })

    it('should produce balanced trees', () => {
      const d = new DisjointSetUnion(8)
      d.union(0, 1)
      d.union(2, 3)
      d.union(4, 5)
      d.union(6, 7)
      d.union(0, 2)
      d.union(4, 6)
      d.union(0, 4)
      expect(d.getComponentCount()).toBe(1)
      expect(d.getSize(0)).toBe(8)
    })
  })

  describe('edge cases', () => {
    it('should handle n=1 operations', () => {
      const d = new DisjointSetUnion(1)
      expect(d.find(0)).toBe(0)
      expect(d.connected(0, 0)).toBe(true)
      expect(d.union(0, 0)).toBe(false)
      expect(d.getSize(0)).toBe(1)
      expect(d.getComponentCount()).toBe(1)
      expect(d.getSets()).toEqual([[0]])
      expect(d.getElements(0)).toEqual([0])
    })

    it('should handle n=0 operations', () => {
      const d = new DisjointSetUnion(0)
      expect(d.getComponentCount()).toBe(0)
      expect(d.getSets()).toEqual([])
      expect(d.toArray()).toEqual([])
    })

    it('should handle large n', () => {
      const d = new DisjointSetUnion(1000)
      for (let i = 1; i < 1000; i++) d.union(0, i)
      expect(d.getComponentCount()).toBe(1)
      expect(d.getSize(0)).toBe(1000)
    })

    it('should handle alternating union pattern', () => {
      for (let i = 0; i < 9; i++) dsu.union(i, i + 1)
      expect(dsu.getComponentCount()).toBe(1)
    })

    it('should handle non-adjacent unions', () => {
      dsu.union(0, 5)
      dsu.union(3, 8)
      expect(dsu.connected(0, 5)).toBe(true)
      expect(dsu.connected(3, 8)).toBe(true)
      expect(dsu.connected(0, 3)).toBe(false)
    })

    it('should handle repeated union of same pair', () => {
      dsu.union(0, 1)
      for (let i = 0; i < 10; i++) {
        expect(dsu.union(0, 1)).toBe(false)
      }
      expect(dsu.getComponentCount()).toBe(9)
    })
  })

  describe('rollback advanced', () => {
    it('should support rollback after full merge', () => {
      const id = dsu.snapshot()
      for (let i = 1; i < 10; i++) dsu.union(0, i)
      expect(dsu.getComponentCount()).toBe(1)
      dsu.rollback(id)
      expect(dsu.getComponentCount()).toBe(10)
      expect(dsu.connected(0, 1)).toBe(false)
    })

    it('should support multiple rollbacks to same snapshot', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      dsu.rollback(id)
      expect(dsu.connected(0, 1)).toBe(false)
      dsu.union(2, 3)
      dsu.rollback(id)
      expect(dsu.connected(2, 3)).toBe(false)
    })

    it('should allow new operations after rollback', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      dsu.rollback(id)
      dsu.union(2, 3)
      expect(dsu.connected(2, 3)).toBe(true)
      expect(dsu.connected(0, 1)).toBe(false)
    })

    it('should handle snapshot with many snapshots stored', () => {
      const ids: number[] = []
      for (let i = 0; i < 20; i++) {
        ids.push(dsu.snapshot())
        dsu.union(i % 10, (i + 1) % 10)
      }
      dsu.rollback(ids[0]!)
      expect(dsu.getComponentCount()).toBe(10)
    })
  })

  describe('clone advanced', () => {
    it('should produce correct toArray after clone', () => {
      dsu.union(0, 1)
      const copy = dsu.clone()
      expect(copy.toArray()).toEqual(dsu.toArray())
    })

    it('should diverge after clone modifications', () => {
      dsu.union(0, 1)
      const copy = dsu.clone()
      copy.union(2, 3)
      copy.union(0, 2)
      expect(dsu.connected(0, 3)).toBe(false)
      expect(copy.connected(0, 3)).toBe(true)
    })

    it('should handle clone of fully merged DSU', () => {
      for (let i = 1; i < 10; i++) dsu.union(0, i)
      const copy = dsu.clone()
      expect(copy.getComponentCount()).toBe(1)
      expect(copy.connected(0, 9)).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_DSU_OPTIONS', () => {
      expect(DEFAULT_DSU_OPTIONS.initialCapacity).toBe(16)
    })

    it('should support DisjointSetUnionOptions interface', () => {
      const opts: DisjointSetUnionOptions = { initialCapacity: 32 }
      expect(opts.initialCapacity).toBe(32)
    })
  })

  describe('integration', () => {
    it('should handle sequence: union, snapshot, union, rollback', () => {
      dsu.union(0, 1)
      const id = dsu.snapshot()
      dsu.union(2, 3)
      dsu.union(4, 5)
      dsu.rollback(id)
      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(2, 3)).toBe(false)
      expect(dsu.connected(4, 5)).toBe(false)
    })

    it('should handle clone with snapshots and rollback', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      dsu.union(2, 3)
      const copy = dsu.clone()
      copy.rollback(id)
      expect(copy.connected(0, 1)).toBe(false)
      expect(dsu.connected(0, 1)).toBe(true)
    })

    it('should handle complex workflow', () => {
      const d = new DisjointSetUnion(20)
      for (let i = 0; i < 20; i++) {
        expect(d.find(i)).toBe(i)
      }
      for (let i = 0; i < 10; i++) d.union(i, i + 10)
      expect(d.getComponentCount()).toBe(10)
      const id = d.snapshot()
      for (let i = 0; i < 9; i++) d.union(i, i + 1)
      expect(d.getComponentCount()).toBe(1)
      d.rollback(id)
      expect(d.getComponentCount()).toBe(10)
      const copy = d.clone()
      for (let i = 0; i < 9; i++) copy.union(i, i + 1)
      expect(copy.getComponentCount()).toBe(1)
      expect(d.getComponentCount()).toBe(10)
    })

    it('should handle rapid snapshot/rollback cycles', () => {
      const ids: number[] = []
      for (let i = 0; i < 5; i++) {
        ids.push(dsu.snapshot())
        dsu.union(i, i + 1)
      }
      for (let i = ids.length - 1; i >= 0; i--) {
        dsu.rollback(ids[i]!)
      }
      expect(dsu.getComponentCount()).toBe(10)
    })
  })

  describe('additional edge cases', () => {
    it('should handle getElements on unmerged elements', () => {
      expect(dsu.getElements(5)).toEqual([5])
      expect(dsu.getElements(0)).toEqual([0])
    })

    it('should handle toArray on single element DSU', () => {
      const d = new DisjointSetUnion(1)
      expect(d.toArray()).toEqual([0])
    })

    it('should handle getSets on single element DSU', () => {
      const d = new DisjointSetUnion(1)
      expect(d.getSets()).toEqual([[0]])
    })

    it('should handle getElements on single element DSU', () => {
      const d = new DisjointSetUnion(1)
      expect(d.getElements(0)).toEqual([0])
    })

    it('should handle union after clone', () => {
      dsu.union(0, 1)
      const c = dsu.clone()
      c.union(2, 3)
      expect(c.connected(2, 3)).toBe(true)
      expect(dsu.connected(2, 3)).toBe(false)
    })

    it('should handle snapshot after rollback', () => {
      const id1 = dsu.snapshot()
      dsu.union(0, 1)
      dsu.rollback(id1)
      const id2 = dsu.snapshot()
      dsu.union(2, 3)
      dsu.rollback(id2)
      expect(dsu.connected(2, 3)).toBe(false)
      expect(dsu.connected(0, 1)).toBe(false)
    })

    it('should handle multiple clones', () => {
      dsu.union(0, 1)
      const c1 = dsu.clone()
      const c2 = dsu.clone()
      c1.union(2, 3)
      c2.union(4, 5)
      expect(dsu.connected(2, 3)).toBe(false)
      expect(dsu.connected(4, 5)).toBe(false)
      expect(c1.connected(4, 5)).toBe(false)
      expect(c2.connected(2, 3)).toBe(false)
    })

    it('should handle union on clone then original', () => {
      const c = dsu.clone()
      c.union(0, 1)
      dsu.union(2, 3)
      expect(c.connected(0, 1)).toBe(true)
      expect(c.connected(2, 3)).toBe(false)
      expect(dsu.connected(0, 1)).toBe(false)
      expect(dsu.connected(2, 3)).toBe(true)
    })

    it('should handle getSize() on large DSU', () => {
      const d = new DisjointSetUnion(500)
      expect(d.getSize()).toBe(500)
    })

    it('should handle getSize(x) on large merged set', () => {
      const d = new DisjointSetUnion(100)
      for (let i = 1; i < 100; i++) d.union(0, i)
      expect(d.getSize(50)).toBe(100)
    })

    it('should handle toArray reflecting all merges', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.union(4, 5)
      const arr = dsu.toArray()
      expect(arr[0]).toBe(arr[1])
      expect(arr[2]).toBe(arr[3])
      expect(arr[4]).toBe(arr[5])
      expect(arr[0]).not.toBe(arr[2])
    })

    it('should handle getSets with some merged some not', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const sets = dsu.getSets()
      expect(sets.length).toBe(8)
      const merged = sets.find(s => s.length === 2 && s.includes(0))
      expect(merged).toBeDefined()
    })

    it('should handle clone after snapshot and modification', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      const c = dsu.clone()
      c.rollback(id)
      expect(c.connected(0, 1)).toBe(false)
      expect(dsu.connected(0, 1)).toBe(true)
    })

    it('should handle isSame on disconnected elements', () => {
      expect(dsu.isSame(0, 9)).toBe(false)
      expect(dsu.isSame(4, 5)).toBe(false)
    })

    it('should handle getRepresentative consistency', () => {
      for (let i = 0; i < 10; i++) {
        expect(dsu.getRepresentative(i)).toBe(i)
      }
    })

    it('should handle snapshot with no prior operations', () => {
      const id = dsu.snapshot()
      dsu.union(0, 1)
      dsu.union(2, 3)
      dsu.rollback(id)
      expect(dsu.getComponentCount()).toBe(10)
    })

    it('should handle rollback after partial merge', () => {
      dsu.union(0, 1)
      dsu.union(2, 3)
      const id = dsu.snapshot()
      dsu.union(0, 2)
      expect(dsu.connected(1, 3)).toBe(true)
      dsu.rollback(id)
      expect(dsu.connected(1, 3)).toBe(false)
      expect(dsu.connected(0, 1)).toBe(true)
      expect(dsu.connected(2, 3)).toBe(true)
    })

    it('should handle getElements after rollback', () => {
      dsu.union(0, 1)
      const id = dsu.snapshot()
      dsu.union(0, 2)
      dsu.rollback(id)
      expect(dsu.getElements(0).sort((a, b) => a - b)).toEqual([0, 1])
    })

    it('should handle toArray after rollback', () => {
      dsu.union(0, 1)
      const id = dsu.snapshot()
      dsu.union(2, 3)
      dsu.rollback(id)
      const arr = dsu.toArray()
      expect(arr[0]).toBe(arr[1])
      expect(arr[2]).toBe(2)
      expect(arr[3]).toBe(3)
    })
  })
})
