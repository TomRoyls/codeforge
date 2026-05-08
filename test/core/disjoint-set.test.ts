import { describe, it, expect, beforeEach } from 'vitest'
import { DisjointSet } from '../../src/core/disjoint-set/disjoint-set.js'
import { DEFAULT_DISJOINT_SET_OPTIONS } from '../../src/core/disjoint-set/types.js'
import type { DisjointSetOptions, SetNode } from '../../src/core/disjoint-set/types.js'

describe('DisjointSet', () => {
  let ds: DisjointSet

  beforeEach(() => {
    ds = new DisjointSet()
  })

  describe('constructor', () => {
    it('should create an empty disjoint set with default options', () => {
      const d = new DisjointSet()
      expect(d.getCount()).toBe(0)
      expect(d.getComponentCount()).toBe(0)
    })

    it('should accept custom options', () => {
      const d = new DisjointSet({ trackSizes: false })
      d.makeSet('a')
      d.makeSet('b')
      d.union('a', 'b')
      expect(d.getSetSize('a')).toBe(0)
    })

    it('should use default trackSizes of true', () => {
      ds.makeSet('a')
      expect(ds.getSetSize('a')).toBe(1)
    })

    it('should accept partial options', () => {
      const d = new DisjointSet({})
      d.makeSet('x')
      expect(d.getSetSize('x')).toBe(1)
    })
  })

  describe('makeSet', () => {
    it('should create a new set with a single element', () => {
      ds.makeSet('a')
      expect(ds.has('a')).toBe(true)
      expect(ds.getCount()).toBe(1)
      expect(ds.getComponentCount()).toBe(1)
    })

    it('should not create duplicate sets', () => {
      ds.makeSet('a')
      ds.makeSet('a')
      expect(ds.getCount()).toBe(1)
    })

    it('should handle multiple different elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.getCount()).toBe(3)
      expect(ds.getComponentCount()).toBe(3)
    })

    it('should handle empty string', () => {
      ds.makeSet('')
      expect(ds.has('')).toBe(true)
    })

    it('should handle unicode strings', () => {
      ds.makeSet('日本語')
      ds.makeSet('🎉')
      expect(ds.has('日本語')).toBe(true)
      expect(ds.has('🎉')).toBe(true)
    })

    it('should handle numeric strings', () => {
      ds.makeSet('1')
      ds.makeSet('2')
      expect(ds.has('1')).toBe(true)
      expect(ds.has('2')).toBe(true)
    })

    it('should handle strings with special characters', () => {
      ds.makeSet('hello\nworld')
      ds.makeSet('path/to/file')
      expect(ds.has('hello\nworld')).toBe(true)
    })

    it('should return void', () => {
      const result = ds.makeSet('a')
      expect(result).toBeUndefined()
    })
  })

  describe('find', () => {
    it('should return the element itself as root for a single set', () => {
      ds.makeSet('a')
      expect(ds.find('a')).toBe('a')
    })

    it('should return the same root after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.find('a')).toBe(ds.find('b'))
    })

    it('should throw for non-existent element', () => {
      expect(() => ds.find('missing')).toThrow('Element "missing" not found')
    })

    it('should apply path compression', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      const root = ds.find('c')
      expect(root).toBe(ds.find('a'))
      expect(root).toBe(ds.find('b'))
    })

    it('should return correct root after multiple unions', () => {
      for (let i = 0; i < 10; i++) {
        ds.makeSet(`n${i}`)
      }
      ds.union('n0', 'n1')
      ds.union('n1', 'n2')
      ds.union('n2', 'n3')
      const root = ds.find('n3')
      expect(root).toBe(ds.find('n0'))
    })
  })

  describe('union', () => {
    it('should union two separate sets', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      const result = ds.union('a', 'b')
      expect(result).toBe(true)
      expect(ds.connected('a', 'b')).toBe(true)
    })

    it('should return false for already connected elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      const result = ds.union('a', 'b')
      expect(result).toBe(false)
    })

    it('should return false for non-existent elements', () => {
      ds.makeSet('a')
      expect(ds.union('a', 'missing')).toBe(false)
      expect(ds.union('missing', 'a')).toBe(false)
    })

    it('should return false when both elements do not exist', () => {
      expect(ds.union('x', 'y')).toBe(false)
    })

    it('should decrement component count on union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.getComponentCount()).toBe(3)
      ds.union('a', 'b')
      expect(ds.getComponentCount()).toBe(2)
      ds.union('b', 'c')
      expect(ds.getComponentCount()).toBe(1)
    })

    it('should not decrement component count for same-set union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getComponentCount()).toBe(1)
      ds.union('a', 'b')
      expect(ds.getComponentCount()).toBe(1)
    })

    it('should use union by rank', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('a', 'c')
      expect(ds.connected('a', 'c')).toBe(true)
      expect(ds.connected('b', 'c')).toBe(true)
    })

    it('should handle chained unions', () => {
      for (let i = 0; i < 100; i++) {
        ds.makeSet(`n${i}`)
      }
      for (let i = 1; i < 100; i++) {
        ds.union(`n0`, `n${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(ds.connected('n0', `n${i}`)).toBe(true)
      }
    })

    it('should union self without effect', () => {
      ds.makeSet('a')
      expect(ds.union('a', 'a')).toBe(false)
      expect(ds.getComponentCount()).toBe(1)
    })
  })

  describe('connected', () => {
    it('should return true for elements in the same set', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.connected('a', 'b')).toBe(true)
    })

    it('should return false for elements in different sets', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.connected('a', 'b')).toBe(false)
    })

    it('should return false for non-existent elements', () => {
      expect(ds.connected('x', 'y')).toBe(false)
    })

    it('should return false when one element does not exist', () => {
      ds.makeSet('a')
      expect(ds.connected('a', 'missing')).toBe(false)
      expect(ds.connected('missing', 'a')).toBe(false)
    })

    it('should return true for an element connected to itself', () => {
      ds.makeSet('a')
      expect(ds.connected('a', 'a')).toBe(true)
    })

    it('should be transitive after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      expect(ds.connected('a', 'c')).toBe(true)
    })
  })

  describe('getSets', () => {
    it('should return empty map for empty disjoint set', () => {
      expect(ds.getSets().size).toBe(0)
    })

    it('should return single set for single element', () => {
      ds.makeSet('a')
      const sets = ds.getSets()
      expect(sets.size).toBe(1)
      expect(sets.get('a')).toEqual(['a'])
    })

    it('should return separate sets for unconnected elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      const sets = ds.getSets()
      expect(sets.size).toBe(2)
    })

    it('should return merged set after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      const sets = ds.getSets()
      expect(sets.size).toBe(1)
    })

    it('should include all elements in their correct sets', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const sets = ds.getSets()
      const allMembers: string[] = []
      for (const members of sets.values()) {
        allMembers.push(...members)
      }
      expect(allMembers.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return Map instance', () => {
      ds.makeSet('a')
      expect(ds.getSets()).toBeInstanceOf(Map)
    })
  })

  describe('getSetSize', () => {
    it('should return 1 for a single element set', () => {
      ds.makeSet('a')
      expect(ds.getSetSize('a')).toBe(1)
    })

    it('should return correct size after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getSetSize('a')).toBe(2)
      expect(ds.getSetSize('b')).toBe(2)
    })

    it('should return 0 for non-existent element', () => {
      expect(ds.getSetSize('missing')).toBe(0)
    })

    it('should return 0 when trackSizes is disabled', () => {
      const d = new DisjointSet({ trackSizes: false })
      d.makeSet('a')
      expect(d.getSetSize('a')).toBe(0)
    })

    it('should track size correctly through multiple unions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      expect(ds.getSetSize('a')).toBe(2)
      ds.union('b', 'c')
      expect(ds.getSetSize('a')).toBe(3)
    })

    it('should return size from any member of the set', () => {
      ds.makeSet('x')
      ds.makeSet('y')
      ds.union('x', 'y')
      expect(ds.getSetSize('x')).toBe(2)
      expect(ds.getSetSize('y')).toBe(2)
    })
  })

  describe('getCount', () => {
    it('should return 0 for empty disjoint set', () => {
      expect(ds.getCount()).toBe(0)
    })

    it('should return correct count after makeSet calls', () => {
      ds.makeSet('a')
      expect(ds.getCount()).toBe(1)
      ds.makeSet('b')
      expect(ds.getCount()).toBe(2)
    })

    it('should not change after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getCount()).toBe(2)
    })

    it('should not change for duplicate makeSet', () => {
      ds.makeSet('a')
      ds.makeSet('a')
      expect(ds.getCount()).toBe(1)
    })
  })

  describe('has', () => {
    it('should return true for existing element', () => {
      ds.makeSet('a')
      expect(ds.has('a')).toBe(true)
    })

    it('should return false for non-existent element', () => {
      expect(ds.has('missing')).toBe(false)
    })

    it('should return false for empty disjoint set', () => {
      expect(ds.has('anything')).toBe(false)
    })

    it('should find elements after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.has('a')).toBe(true)
      expect(ds.has('b')).toBe(true)
    })
  })

  describe('getComponentCount', () => {
    it('should return 0 for empty set', () => {
      expect(ds.getComponentCount()).toBe(0)
    })

    it('should equal element count when no unions', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.getComponentCount()).toBe(3)
    })

    it('should decrease after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      expect(ds.getComponentCount()).toBe(2)
      ds.union('b', 'c')
      expect(ds.getComponentCount()).toBe(1)
    })

    it('should be 1 when all elements are connected', () => {
      for (let i = 0; i < 50; i++) {
        ds.makeSet(`n${i}`)
      }
      for (let i = 1; i < 50; i++) {
        ds.union('n0', `n${i}`)
      }
      expect(ds.getComponentCount()).toBe(1)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.clear()
      expect(ds.getCount()).toBe(0)
      expect(ds.getComponentCount()).toBe(0)
    })

    it('should allow adding after clear', () => {
      ds.makeSet('a')
      ds.clear()
      ds.makeSet('b')
      expect(ds.has('a')).toBe(false)
      expect(ds.has('b')).toBe(true)
    })

    it('should handle clearing empty set', () => {
      ds.clear()
      expect(ds.getCount()).toBe(0)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(ds.toArray()).toEqual([])
    })

    it('should return single array for single element', () => {
      ds.makeSet('a')
      const arr = ds.toArray()
      expect(arr.length).toBe(1)
      expect(arr[0]).toEqual(['a'])
    })

    it('should group connected elements', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      const arr = ds.toArray()
      expect(arr.length).toBe(1)
      expect(arr[0]!.sort()).toEqual(['a', 'b'])
    })

    it('should separate disconnected components', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const arr = ds.toArray()
      expect(arr.length).toBe(2)
    })

    it('should return array of arrays', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      const arr = ds.toArray()
      for (const sub of arr) {
        expect(Array.isArray(sub)).toBe(true)
      }
    })
  })

  describe('getStats', () => {
    it('should return zeros for empty set', () => {
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(0)
      expect(stats.componentCount).toBe(0)
      expect(stats.maxComponentSize).toBe(0)
      expect(stats.minComponentSize).toBe(0)
    })

    it('should return correct stats for single element', () => {
      ds.makeSet('a')
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(1)
      expect(stats.componentCount).toBe(1)
      expect(stats.maxComponentSize).toBe(1)
      expect(stats.minComponentSize).toBe(1)
    })

    it('should return correct stats after union', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(3)
      expect(stats.componentCount).toBe(2)
      expect(stats.maxComponentSize).toBe(2)
      expect(stats.minComponentSize).toBe(1)
    })

    it('should update stats correctly with all connected', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(3)
      expect(stats.componentCount).toBe(1)
      expect(stats.maxComponentSize).toBe(3)
      expect(stats.minComponentSize).toBe(3)
    })

    it('should handle multiple separate components', () => {
      for (let i = 0; i < 10; i++) {
        ds.makeSet(`n${i}`)
      }
      ds.union('n0', 'n1')
      ds.union('n2', 'n3')
      ds.union('n4', 'n5')
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(10)
      expect(stats.componentCount).toBe(7)
      expect(stats.maxComponentSize).toBe(2)
      expect(stats.minComponentSize).toBe(1)
    })
  })

  describe('path compression', () => {
    it('should flatten tree on find', () => {
      for (let i = 0; i < 20; i++) {
        ds.makeSet(`n${i}`)
      }
      for (let i = 1; i < 20; i++) {
        ds.union(`n${i - 1}`, `n${i}`)
      }
      ds.find('n19')
      const root = ds.find('n0')
      expect(ds.find('n19')).toBe(root)
      expect(ds.connected('n0', 'n19')).toBe(true)
    })

    it('should maintain correctness after path compression', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('c', 'd')
      ds.union('a', 'c')
      expect(ds.connected('b', 'd')).toBe(true)
      expect(ds.connected('a', 'd')).toBe(true)
    })
  })

  describe('union by rank', () => {
    it('should attach smaller tree under larger tree root', () => {
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('a', 'c')
      expect(ds.connected('a', 'b')).toBe(true)
      expect(ds.connected('a', 'c')).toBe(true)
      expect(ds.connected('b', 'c')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle whitespace-only strings', () => {
      ds.makeSet('   ')
      ds.makeSet('\t')
      expect(ds.has('   ')).toBe(true)
      expect(ds.has('\t')).toBe(true)
    })

    it('should handle case sensitivity', () => {
      ds.makeSet('Hello')
      ds.makeSet('hello')
      expect(ds.connected('Hello', 'hello')).toBe(false)
      ds.union('Hello', 'hello')
      expect(ds.connected('Hello', 'hello')).toBe(true)
    })

    it('should handle mixed unicode content', () => {
      ds.makeSet('hello世界')
      ds.makeSet('🎉')
      ds.union('hello世界', '🎉')
      expect(ds.connected('hello世界', '🎉')).toBe(true)
    })
  })

  describe('large sets', () => {
    it('should handle 1000 elements', () => {
      for (let i = 0; i < 1000; i++) {
        ds.makeSet(`n${i}`)
      }
      expect(ds.getCount()).toBe(1000)
      expect(ds.getComponentCount()).toBe(1000)
    })

    it('should handle union of 1000 elements into one component', () => {
      for (let i = 0; i < 1000; i++) {
        ds.makeSet(`n${i}`)
      }
      for (let i = 1; i < 1000; i++) {
        ds.union('n0', `n${i}`)
      }
      expect(ds.getComponentCount()).toBe(1)
      expect(ds.getSetSize('n0')).toBe(1000)
    })

    it('should handle rapid union and find', () => {
      for (let i = 0; i < 500; i++) {
        ds.makeSet(`n${i}`)
      }
      for (let i = 1; i < 500; i++) {
        ds.union(`n${i - 1}`, `n${i}`)
      }
      for (let i = 0; i < 500; i++) {
        expect(ds.connected('n0', `n${i}`)).toBe(true)
      }
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_DISJOINT_SET_OPTIONS', () => {
      expect(DEFAULT_DISJOINT_SET_OPTIONS.trackSizes).toBe(true)
    })

    it('should support DisjointSetOptions interface', () => {
      const opts: DisjointSetOptions = { trackSizes: false }
      expect(opts.trackSizes).toBe(false)
    })

    it('should support SetNode interface', () => {
      const node: SetNode = { value: 'a', rank: 0, parent: 'a', size: 1 }
      expect(node.value).toBe('a')
      expect(node.rank).toBe(0)
      expect(node.parent).toBe('a')
      expect(node.size).toBe(1)
    })
  })
})
