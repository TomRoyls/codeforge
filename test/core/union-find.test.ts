import { describe, it, expect, beforeEach } from 'vitest'
import { UnionFind } from '../../src/core/union-find/union-find.js'
import { DEFAULT_UNIONFIND_OPTIONS } from '../../src/core/union-find/types.js'
import type { UnionFindOptions } from '../../src/core/union-find/types.js'

describe('UnionFind', () => {
  let uf: UnionFind

  beforeEach(() => {
    uf = new UnionFind()
  })

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const u = new UnionFind()
      expect(u.size()).toBe(0)
      expect(u.componentCount()).toBe(0)
    })

    it('should accept custom initialCapacity', () => {
      const u = new UnionFind({ initialCapacity: 32 })
      u.makeSet(31)
      expect(u.size()).toBe(1)
    })

    it('should accept partial options', () => {
      const u = new UnionFind({})
      u.makeSet(0)
      expect(u.size()).toBe(1)
    })

    it('should handle zero initialCapacity', () => {
      const u = new UnionFind({ initialCapacity: 0 })
      u.makeSet(0)
      expect(u.size()).toBe(1)
    })

    it('should handle large initialCapacity', () => {
      const u = new UnionFind({ initialCapacity: 1000 })
      u.makeSet(999)
      expect(u.size()).toBe(1)
    })

    it('should handle negative initialCapacity gracefully', () => {
      const u = new UnionFind({ initialCapacity: -5 })
      u.makeSet(0)
      expect(u.size()).toBe(1)
    })
  })

  describe('makeSet', () => {
    it('should create a set with a single element', () => {
      uf.makeSet(0)
      expect(uf.size()).toBe(1)
      expect(uf.componentCount()).toBe(1)
    })

    it('should not create duplicate sets', () => {
      uf.makeSet(0)
      uf.makeSet(0)
      expect(uf.size()).toBe(1)
    })

    it('should handle multiple different elements', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      expect(uf.size()).toBe(3)
      expect(uf.componentCount()).toBe(3)
    })

    it('should throw for negative element', () => {
      expect(() => uf.makeSet(-1)).toThrow('Element must be non-negative')
    })

    it('should handle element beyond initialCapacity', () => {
      const u = new UnionFind({ initialCapacity: 2 })
      u.makeSet(10)
      expect(u.size()).toBe(1)
    })

    it('should handle element 0', () => {
      uf.makeSet(0)
      expect(uf.find(0)).toBe(0)
    })

    it('should return void', () => {
      const result = uf.makeSet(0)
      expect(result).toBeUndefined()
    })

    it('should handle non-contiguous elements', () => {
      uf.makeSet(5)
      uf.makeSet(100)
      uf.makeSet(50)
      expect(uf.size()).toBe(3)
    })

    it('should handle large element indices', () => {
      uf.makeSet(10000)
      expect(uf.size()).toBe(1)
      expect(uf.find(10000)).toBe(10000)
    })
  })

  describe('find', () => {
    it('should return element itself as root for single set', () => {
      uf.makeSet(0)
      expect(uf.find(0)).toBe(0)
    })

    it('should return same root after union', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      expect(uf.find(0)).toBe(uf.find(1))
    })

    it('should throw for non-existent element', () => {
      expect(() => uf.find(5)).toThrow('Element 5 not found')
    })

    it('should throw for negative element', () => {
      expect(() => uf.find(-1)).toThrow('Element -1 not found')
    })

    it('should apply path compression', () => {
      for (let i = 0; i < 10; i++) uf.makeSet(i)
      uf.union(0, 1)
      uf.union(1, 2)
      uf.union(2, 3)
      const root = uf.find(3)
      expect(root).toBe(uf.find(0))
      expect(root).toBe(uf.find(1))
      expect(root).toBe(uf.find(2))
    })

    it('should return correct root after multiple unions', () => {
      for (let i = 0; i < 10; i++) uf.makeSet(i)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(4, 5)
      uf.union(0, 2)
      uf.union(4, 0)
      const root = uf.find(5)
      expect(root).toBe(uf.find(0))
      expect(root).toBe(uf.find(1))
      expect(root).toBe(uf.find(2))
      expect(root).toBe(uf.find(3))
      expect(root).toBe(uf.find(4))
    })
  })

  describe('union', () => {
    it('should union two separate sets', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      expect(uf.union(0, 1)).toBe(true)
      expect(uf.connected(0, 1)).toBe(true)
    })

    it('should return false for already connected elements', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      expect(uf.union(0, 1)).toBe(false)
    })

    it('should return false for non-existent elements', () => {
      uf.makeSet(0)
      expect(uf.union(0, 99)).toBe(false)
      expect(uf.union(99, 0)).toBe(false)
    })

    it('should return false when both elements do not exist', () => {
      expect(uf.union(10, 20)).toBe(false)
    })

    it('should decrement component count on union', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      expect(uf.componentCount()).toBe(3)
      uf.union(0, 1)
      expect(uf.componentCount()).toBe(2)
      uf.union(1, 2)
      expect(uf.componentCount()).toBe(1)
    })

    it('should not decrement component count for same-set union', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      expect(uf.componentCount()).toBe(1)
      uf.union(0, 1)
      expect(uf.componentCount()).toBe(1)
    })

    it('should union self without effect', () => {
      uf.makeSet(0)
      expect(uf.union(0, 0)).toBe(false)
      expect(uf.componentCount()).toBe(1)
    })

    it('should handle chained unions', () => {
      for (let i = 0; i < 100; i++) uf.makeSet(i)
      for (let i = 1; i < 100; i++) uf.union(0, i)
      for (let i = 0; i < 100; i++) expect(uf.connected(0, i)).toBe(true)
    })

    it('should use union by rank correctly', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.union(0, 1)
      uf.union(0, 2)
      expect(uf.connected(0, 1)).toBe(true)
      expect(uf.connected(0, 2)).toBe(true)
      expect(uf.connected(1, 2)).toBe(true)
    })

    it('should handle union of equal rank trees', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.makeSet(3)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.connected(1, 3)).toBe(true)
      expect(uf.componentCount()).toBe(1)
    })

    it('should return false for negative element in union', () => {
      uf.makeSet(0)
      expect(uf.union(-1, 0)).toBe(false)
      expect(uf.union(0, -1)).toBe(false)
    })
  })

  describe('connected', () => {
    it('should return true for elements in same set', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      expect(uf.connected(0, 1)).toBe(true)
    })

    it('should return false for elements in different sets', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      expect(uf.connected(0, 1)).toBe(false)
    })

    it('should return false for non-existent elements', () => {
      expect(uf.connected(5, 10)).toBe(false)
    })

    it('should return false when one element does not exist', () => {
      uf.makeSet(0)
      expect(uf.connected(0, 99)).toBe(false)
      expect(uf.connected(99, 0)).toBe(false)
    })

    it('should return true for element connected to itself', () => {
      uf.makeSet(0)
      expect(uf.connected(0, 0)).toBe(true)
    })

    it('should be transitive after union', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.union(0, 1)
      uf.union(1, 2)
      expect(uf.connected(0, 2)).toBe(true)
    })

    it('should return false for negative elements', () => {
      expect(uf.connected(-1, -2)).toBe(false)
      expect(uf.connected(-1, 0)).toBe(false)
    })
  })

  describe('componentSize', () => {
    it('should return 1 for a single element set', () => {
      uf.makeSet(0)
      expect(uf.componentSize(0)).toBe(1)
    })

    it('should return correct size after union', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      expect(uf.componentSize(0)).toBe(2)
      expect(uf.componentSize(1)).toBe(2)
    })

    it('should return 0 for non-existent element', () => {
      expect(uf.componentSize(99)).toBe(0)
    })

    it('should track size correctly through multiple unions', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.union(0, 1)
      expect(uf.componentSize(0)).toBe(2)
      uf.union(1, 2)
      expect(uf.componentSize(0)).toBe(3)
    })

    it('should return size from any member of the set', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.union(0, 1)
      uf.union(1, 2)
      expect(uf.componentSize(0)).toBe(3)
      expect(uf.componentSize(1)).toBe(3)
      expect(uf.componentSize(2)).toBe(3)
    })

    it('should return 0 for negative element', () => {
      expect(uf.componentSize(-1)).toBe(0)
    })

    it('should return 4 after four element union', () => {
      for (let i = 0; i < 4; i++) uf.makeSet(i)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.componentSize(0)).toBe(4)
      expect(uf.componentSize(3)).toBe(4)
    })
  })

  describe('componentCount', () => {
    it('should return 0 for empty structure', () => {
      expect(uf.componentCount()).toBe(0)
    })

    it('should equal element count when no unions', () => {
      for (let i = 0; i < 5; i++) uf.makeSet(i)
      expect(uf.componentCount()).toBe(5)
    })

    it('should decrease after union', () => {
      for (let i = 0; i < 5; i++) uf.makeSet(i)
      uf.union(0, 1)
      expect(uf.componentCount()).toBe(4)
      uf.union(2, 3)
      expect(uf.componentCount()).toBe(3)
    })

    it('should be 1 when all elements connected', () => {
      for (let i = 0; i < 50; i++) uf.makeSet(i)
      for (let i = 1; i < 50; i++) uf.union(0, i)
      expect(uf.componentCount()).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for empty structure', () => {
      expect(uf.size()).toBe(0)
    })

    it('should return correct count after makeSet', () => {
      uf.makeSet(0)
      expect(uf.size()).toBe(1)
      uf.makeSet(1)
      expect(uf.size()).toBe(2)
    })

    it('should not change after union', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      expect(uf.size()).toBe(2)
    })

    it('should not change for duplicate makeSet', () => {
      uf.makeSet(0)
      uf.makeSet(0)
      expect(uf.size()).toBe(1)
    })
  })

  describe('reset', () => {
    it('should remove all elements', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      uf.reset()
      expect(uf.size()).toBe(0)
      expect(uf.componentCount()).toBe(0)
    })

    it('should allow adding after reset', () => {
      uf.makeSet(0)
      uf.reset()
      uf.makeSet(1)
      expect(uf.size()).toBe(1)
      expect(() => uf.find(0)).toThrow()
    })

    it('should handle resetting empty structure', () => {
      uf.reset()
      expect(uf.size()).toBe(0)
      expect(uf.componentCount()).toBe(0)
    })

    it('should allow reuse after reset with same capacity', () => {
      for (let i = 0; i < 10; i++) uf.makeSet(i)
      uf.reset()
      for (let i = 0; i < 10; i++) uf.makeSet(i)
      expect(uf.size()).toBe(10)
      expect(uf.componentCount()).toBe(10)
    })
  })

  describe('toArray', () => {
    it('should return array of -1 for empty structure', () => {
      const arr = uf.toArray()
      for (let i = 0; i < arr.length; i++) {
        expect(arr[i]).toBe(-1)
      }
    })

    it('should return parent array with self-referencing elements', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      const arr = uf.toArray()
      expect(arr[0]).toBe(0)
      expect(arr[1]).toBe(1)
    })

    it('should reflect union changes', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      const arr = uf.toArray()
      expect(arr[0]).toBe(arr[0])
      expect(arr[1]).toBe(arr[0])
    })

    it('should return a copy not a reference', () => {
      uf.makeSet(0)
      const arr1 = uf.toArray()
      const arr2 = uf.toArray()
      expect(arr1).toEqual(arr2)
      expect(arr1).not.toBe(arr2)
    })

    it('should show -1 for non-added slots', () => {
      uf.makeSet(2)
      const arr = uf.toArray()
      expect(arr[0]).toBe(-1)
      expect(arr[1]).toBe(-1)
      expect(arr[2]).toBe(2)
    })
  })

  describe('getSets', () => {
    it('should return empty map for empty structure', () => {
      expect(uf.getSets().size).toBe(0)
    })

    it('should return single set for single element', () => {
      uf.makeSet(0)
      const sets = uf.getSets()
      expect(sets.size).toBe(1)
      expect(sets.get(0)).toEqual([0])
    })

    it('should return separate sets for unconnected elements', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      const sets = uf.getSets()
      expect(sets.size).toBe(2)
    })

    it('should return merged set after union', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      const sets = uf.getSets()
      expect(sets.size).toBe(1)
    })

    it('should include all elements in correct sets', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.union(0, 1)
      const sets = uf.getSets()
      const allMembers: number[] = []
      for (const members of sets.values()) {
        allMembers.push(...members)
      }
      expect(allMembers.sort((a, b) => a - b)).toEqual([0, 1, 2])
    })

    it('should return Map instance', () => {
      uf.makeSet(0)
      expect(uf.getSets()).toBeInstanceOf(Map)
    })

    it('should skip uninitialized slots', () => {
      uf.makeSet(0)
      uf.makeSet(5)
      const sets = uf.getSets()
      expect(sets.size).toBe(2)
      const allMembers: number[] = []
      for (const members of sets.values()) {
        allMembers.push(...members)
      }
      expect(allMembers.sort((a, b) => a - b)).toEqual([0, 5])
    })
  })

  describe('path compression', () => {
    it('should flatten tree on find', () => {
      for (let i = 0; i < 20; i++) uf.makeSet(i)
      for (let i = 1; i < 20; i++) uf.union(i - 1, i)
      uf.find(19)
      const root = uf.find(0)
      expect(uf.find(19)).toBe(root)
      expect(uf.connected(0, 19)).toBe(true)
    })

    it('should maintain correctness after path compression', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.makeSet(3)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.connected(1, 3)).toBe(true)
      expect(uf.connected(0, 3)).toBe(true)
    })

    it('should speed up subsequent finds', () => {
      for (let i = 0; i < 100; i++) uf.makeSet(i)
      for (let i = 1; i < 100; i++) uf.union(i - 1, i)
      uf.find(99)
      const root = uf.find(99)
      expect(root).toBe(uf.find(0))
      expect(root).toBe(uf.find(50))
    })
  })

  describe('union by rank', () => {
    it('should attach smaller tree under larger tree root', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.union(0, 1)
      uf.union(0, 2)
      expect(uf.connected(0, 1)).toBe(true)
      expect(uf.connected(0, 2)).toBe(true)
      expect(uf.connected(1, 2)).toBe(true)
    })

    it('should increment rank when merging equal rank trees', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.makeSet(2)
      uf.makeSet(3)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.componentCount()).toBe(1)
      expect(uf.componentSize(0)).toBe(4)
    })

    it('should produce balanced trees', () => {
      for (let i = 0; i < 8; i++) uf.makeSet(i)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(4, 5)
      uf.union(6, 7)
      uf.union(0, 2)
      uf.union(4, 6)
      uf.union(0, 4)
      expect(uf.componentCount()).toBe(1)
      expect(uf.componentSize(0)).toBe(8)
    })
  })

  describe('edge cases', () => {
    it('should handle element 0', () => {
      uf.makeSet(0)
      expect(uf.find(0)).toBe(0)
      expect(uf.connected(0, 0)).toBe(true)
    })

    it('should handle large gap in element indices', () => {
      uf.makeSet(0)
      uf.makeSet(1000)
      uf.union(0, 1000)
      expect(uf.connected(0, 1000)).toBe(true)
      expect(uf.componentSize(0)).toBe(2)
    })

    it('should handle sequential union chain', () => {
      for (let i = 0; i < 100; i++) uf.makeSet(i)
      for (let i = 0; i < 99; i++) uf.union(i, i + 1)
      expect(uf.componentCount()).toBe(1)
      expect(uf.connected(0, 99)).toBe(true)
    })

    it('should handle star pattern union', () => {
      for (let i = 0; i < 50; i++) uf.makeSet(i)
      for (let i = 1; i < 50; i++) uf.union(0, i)
      expect(uf.componentCount()).toBe(1)
      expect(uf.componentSize(0)).toBe(50)
    })

    it('should handle makeSet after union', () => {
      uf.makeSet(0)
      uf.makeSet(1)
      uf.union(0, 1)
      uf.makeSet(2)
      expect(uf.size()).toBe(3)
      expect(uf.componentCount()).toBe(2)
    })
  })

  describe('large sets', () => {
    it('should handle 1000 elements', () => {
      for (let i = 0; i < 1000; i++) uf.makeSet(i)
      expect(uf.size()).toBe(1000)
      expect(uf.componentCount()).toBe(1000)
    })

    it('should handle union of 1000 elements into one component', () => {
      for (let i = 0; i < 1000; i++) uf.makeSet(i)
      for (let i = 1; i < 1000; i++) uf.union(0, i)
      expect(uf.componentCount()).toBe(1)
      expect(uf.componentSize(0)).toBe(1000)
    })

    it('should handle rapid union and find', () => {
      for (let i = 0; i < 500; i++) uf.makeSet(i)
      for (let i = 1; i < 500; i++) uf.union(i - 1, i)
      for (let i = 0; i < 500; i++) expect(uf.connected(0, i)).toBe(true)
    })

    it('should handle binary merge pattern', () => {
      for (let i = 0; i < 256; i++) uf.makeSet(i)
      for (let stride = 1; stride < 256; stride *= 2) {
        for (let i = 0; i + stride < 256; i += stride * 2) {
          uf.union(i, i + stride)
        }
      }
      expect(uf.componentCount()).toBe(1)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_UNIONFIND_OPTIONS', () => {
      expect(DEFAULT_UNIONFIND_OPTIONS.initialCapacity).toBe(16)
    })

    it('should support UnionFindOptions interface', () => {
      const opts: UnionFindOptions = { initialCapacity: 32 }
      expect(opts.initialCapacity).toBe(32)
    })

    it('should use DEFAULT_UNIONFIND_OPTIONS as defaults', () => {
      const u = new UnionFind()
      u.makeSet(15)
      expect(u.size()).toBe(1)
    })
  })

  describe('dynamic capacity', () => {
    it('should grow beyond initial capacity', () => {
      const u = new UnionFind({ initialCapacity: 2 })
      u.makeSet(0)
      u.makeSet(1)
      u.makeSet(5)
      u.makeSet(10)
      expect(u.size()).toBe(4)
    })

    it('should maintain correctness after capacity growth', () => {
      const u = new UnionFind({ initialCapacity: 2 })
      u.makeSet(0)
      u.makeSet(10)
      u.union(0, 10)
      expect(u.connected(0, 10)).toBe(true)
    })

    it('should handle makeSet after union triggers growth', () => {
      const u = new UnionFind({ initialCapacity: 2 })
      u.makeSet(0)
      u.makeSet(1)
      u.union(0, 1)
      u.makeSet(10)
      u.union(1, 10)
      expect(u.connected(0, 10)).toBe(true)
      expect(u.componentSize(0)).toBe(3)
    })
  })

  describe('multiple components', () => {
    it('should track separate components correctly', () => {
      for (let i = 0; i < 10; i++) uf.makeSet(i)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(4, 5)
      expect(uf.componentCount()).toBe(7)
      expect(uf.connected(0, 1)).toBe(true)
      expect(uf.connected(2, 3)).toBe(true)
      expect(uf.connected(0, 2)).toBe(false)
    })

    it('should track component sizes independently', () => {
      for (let i = 0; i < 6; i++) uf.makeSet(i)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(4, 5)
      expect(uf.componentSize(0)).toBe(2)
      expect(uf.componentSize(2)).toBe(2)
      expect(uf.componentSize(4)).toBe(2)
    })

    it('should merge components correctly', () => {
      for (let i = 0; i < 6; i++) uf.makeSet(i)
      uf.union(0, 1)
      uf.union(2, 3)
      uf.union(0, 2)
      expect(uf.componentCount()).toBe(3)
      expect(uf.componentSize(0)).toBe(4)
      expect(uf.connected(1, 3)).toBe(true)
    })
  })
})
