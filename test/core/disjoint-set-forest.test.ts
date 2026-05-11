import { describe, it, expect, beforeEach } from 'vitest'
import { DisjointSetForest } from '../../src/core/disjoint-set-forest/disjoint-set-forest.js'

describe('DisjointSetForest', () => {
  let dsf: DisjointSetForest<string>

  beforeEach(() => {
    dsf = new DisjointSetForest<string>()
  })

  describe('constructor', () => {
    it('should create an empty DisjointSetForest', () => {
      const ds = new DisjointSetForest<number>()
      expect(ds.count).toBe(0)
      expect(ds.itemCount).toBe(0)
    })

    it('should create a generic instance for strings', () => {
      const ds = new DisjointSetForest<string>()
      ds.makeSet('a')
      expect(ds.has('a')).toBe(true)
    })

    it('should create a generic instance for numbers', () => {
      const ds = new DisjointSetForest<number>()
      ds.makeSet(1)
      expect(ds.has(1)).toBe(true)
    })

    it('should create a generic instance for objects by reference', () => {
      const ds = new DisjointSetForest<object>()
      const obj = { id: 1 }
      ds.makeSet(obj)
      expect(ds.has(obj)).toBe(true)
    })
  })

  describe('makeSet', () => {
    it('should create a singleton set', () => {
      dsf.makeSet('a')
      expect(dsf.count).toBe(1)
      expect(dsf.itemCount).toBe(1)
    })

    it('should not create duplicate sets', () => {
      dsf.makeSet('a')
      dsf.makeSet('a')
      expect(dsf.itemCount).toBe(1)
      expect(dsf.count).toBe(1)
    })

    it('should create multiple distinct sets', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      expect(dsf.itemCount).toBe(3)
      expect(dsf.count).toBe(3)
    })

    it('should return void', () => {
      const result = dsf.makeSet('a')
      expect(result).toBeUndefined()
    })

    it('should handle numeric items', () => {
      const ds = new DisjointSetForest<number>()
      ds.makeSet(1)
      ds.makeSet(2)
      ds.makeSet(3)
      expect(ds.itemCount).toBe(3)
    })

    it('should allow makeSet after union operations', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      dsf.makeSet('c')
      expect(dsf.itemCount).toBe(3)
      expect(dsf.count).toBe(2)
    })

    it('should handle empty string as item', () => {
      dsf.makeSet('')
      expect(dsf.has('')).toBe(true)
      expect(dsf.find('')).toBe('')
    })

    it('should handle zero as item', () => {
      const ds = new DisjointSetForest<number>()
      ds.makeSet(0)
      expect(ds.has(0)).toBe(true)
      expect(ds.find(0)).toBe(0)
    })
  })

  describe('find', () => {
    it('should return the item itself for a singleton set', () => {
      dsf.makeSet('a')
      expect(dsf.find('a')).toBe('a')
    })

    it('should throw for non-existent item', () => {
      expect(() => dsf.find('z')).toThrow('Item not found')
    })

    it('should return same root after union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.find('a')).toBe(dsf.find('b'))
    })

    it('should apply path compression', () => {
      for (let i = 0; i < 10; i++) dsf.makeSet(String(i))
      dsf.union('0', '1')
      dsf.union('1', '2')
      dsf.union('2', '3')
      dsf.union('3', '4')
      const root = dsf.find('4')
      expect(root).toBe(dsf.find('0'))
      expect(root).toBe(dsf.find('1'))
      expect(root).toBe(dsf.find('2'))
      expect(root).toBe(dsf.find('3'))
    })

    it('should return correct root after multiple unions', () => {
      for (let i = 0; i < 10; i++) dsf.makeSet(String(i))
      dsf.union('0', '1')
      dsf.union('2', '3')
      dsf.union('4', '5')
      dsf.union('0', '2')
      dsf.union('4', '0')
      const root = dsf.find('5')
      expect(root).toBe(dsf.find('0'))
      expect(root).toBe(dsf.find('1'))
      expect(root).toBe(dsf.find('2'))
      expect(root).toBe(dsf.find('3'))
      expect(root).toBe(dsf.find('4'))
    })

    it('should be idempotent', () => {
      dsf.makeSet('a')
      expect(dsf.find('a')).toBe(dsf.find('a'))
    })
  })

  describe('union', () => {
    it('should union two separate sets', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      expect(dsf.union('a', 'b')).toBe(true)
      expect(dsf.connected('a', 'b')).toBe(true)
    })

    it('should return false for already connected elements', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.union('a', 'b')).toBe(false)
    })

    it('should throw for non-existent item a', () => {
      dsf.makeSet('a')
      expect(() => dsf.union('a', 'z')).toThrow('Item not found')
    })

    it('should throw for non-existent item b', () => {
      dsf.makeSet('b')
      expect(() => dsf.union('z', 'b')).toThrow('Item not found')
    })

    it('should throw when both items do not exist', () => {
      expect(() => dsf.union('x', 'y')).toThrow('Item not found')
    })

    it('should return false for union of item with itself', () => {
      dsf.makeSet('a')
      expect(dsf.union('a', 'a')).toBe(false)
    })

    it('should decrement set count on union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      expect(dsf.count).toBe(3)
      dsf.union('a', 'b')
      expect(dsf.count).toBe(2)
      dsf.union('b', 'c')
      expect(dsf.count).toBe(1)
    })

    it('should not decrement count for same-set union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.count).toBe(1)
      dsf.union('a', 'b')
      expect(dsf.count).toBe(1)
    })

    it('should handle chained unions', () => {
      for (let i = 0; i < 100; i++) dsf.makeSet(String(i))
      for (let i = 1; i < 100; i++) dsf.union('0', String(i))
      for (let i = 0; i < 100; i++) expect(dsf.connected('0', String(i))).toBe(true)
    })

    it('should use union by rank correctly', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      dsf.union('a', 'c')
      expect(dsf.connected('a', 'b')).toBe(true)
      expect(dsf.connected('a', 'c')).toBe(true)
      expect(dsf.connected('b', 'c')).toBe(true)
    })

    it('should handle union of equal rank trees', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.union('a', 'b')
      dsf.union('c', 'd')
      dsf.union('a', 'c')
      expect(dsf.connected('b', 'd')).toBe(true)
      expect(dsf.count).toBe(1)
    })

    it('should be commutative in terms of connectivity', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.connected('a', 'b')).toBe(true)
      expect(dsf.connected('b', 'a')).toBe(true)
    })

    it('should handle repeated unions gracefully', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.union('a', 'b')).toBe(false)
      expect(dsf.union('b', 'a')).toBe(false)
    })
  })

  describe('connected', () => {
    it('should return true for elements in same set', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.connected('a', 'b')).toBe(true)
    })

    it('should return false for elements in different sets', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      expect(dsf.connected('a', 'b')).toBe(false)
    })

    it('should return false for non-existent items', () => {
      expect(dsf.connected('x', 'y')).toBe(false)
    })

    it('should return false when one item does not exist', () => {
      dsf.makeSet('a')
      expect(dsf.connected('a', 'z')).toBe(false)
      expect(dsf.connected('z', 'a')).toBe(false)
    })

    it('should return true for item connected to itself', () => {
      dsf.makeSet('a')
      expect(dsf.connected('a', 'a')).toBe(true)
    })

    it('should be transitive', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      dsf.union('b', 'c')
      expect(dsf.connected('a', 'c')).toBe(true)
    })

    it('should be symmetric', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.connected('a', 'b')).toBe(dsf.connected('b', 'a'))
    })
  })

  describe('size', () => {
    it('should return 1 for a singleton set', () => {
      dsf.makeSet('a')
      expect(dsf.size('a')).toBe(1)
    })

    it('should return correct size after union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.size('a')).toBe(2)
      expect(dsf.size('b')).toBe(2)
    })

    it('should return 0 for non-existent item', () => {
      expect(dsf.size('z')).toBe(0)
    })

    it('should track size through multiple unions', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      expect(dsf.size('a')).toBe(2)
      dsf.union('b', 'c')
      expect(dsf.size('a')).toBe(3)
    })

    it('should return same size from any member', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      dsf.union('b', 'c')
      expect(dsf.size('a')).toBe(3)
      expect(dsf.size('b')).toBe(3)
      expect(dsf.size('c')).toBe(3)
    })

    it('should return 4 after four element union', () => {
      for (let i = 0; i < 4; i++) dsf.makeSet(String(i))
      dsf.union('0', '1')
      dsf.union('2', '3')
      dsf.union('0', '2')
      expect(dsf.size('0')).toBe(4)
      expect(dsf.size('3')).toBe(4)
    })
  })

  describe('count', () => {
    it('should return 0 for empty forest', () => {
      expect(dsf.count).toBe(0)
    })

    it('should equal itemCount when no unions', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      expect(dsf.count).toBe(3)
    })

    it('should decrease after union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      expect(dsf.count).toBe(2)
      dsf.union('b', 'c')
      expect(dsf.count).toBe(1)
    })

    it('should be 1 when all elements connected', () => {
      for (let i = 0; i < 50; i++) dsf.makeSet(String(i))
      for (let i = 1; i < 50; i++) dsf.union('0', String(i))
      expect(dsf.count).toBe(1)
    })
  })

  describe('itemCount', () => {
    it('should return 0 for empty forest', () => {
      expect(dsf.itemCount).toBe(0)
    })

    it('should return correct count after makeSet', () => {
      dsf.makeSet('a')
      expect(dsf.itemCount).toBe(1)
      dsf.makeSet('b')
      expect(dsf.itemCount).toBe(2)
    })

    it('should not change after union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.itemCount).toBe(2)
    })

    it('should not change for duplicate makeSet', () => {
      dsf.makeSet('a')
      dsf.makeSet('a')
      expect(dsf.itemCount).toBe(1)
    })
  })

  describe('sets', () => {
    it('should return empty array for empty forest', () => {
      expect(dsf.sets()).toEqual([])
    })

    it('should return single set for single element', () => {
      dsf.makeSet('a')
      const s = dsf.sets()
      expect(s.length).toBe(1)
      expect(s[0]).toEqual(['a'])
    })

    it('should return separate sets for unconnected elements', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      const s = dsf.sets()
      expect(s.length).toBe(2)
    })

    it('should return merged set after union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      const s = dsf.sets()
      expect(s.length).toBe(1)
      expect(s[0]!.length).toBe(2)
    })

    it('should include all items in correct sets', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      const s = dsf.sets()
      const allItems = s.flat().sort()
      expect(allItems).toEqual(['a', 'b', 'c'])
    })

    it('should return correct number of sets', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.union('a', 'b')
      dsf.union('c', 'd')
      expect(dsf.sets().length).toBe(2)
    })

    it('should handle large number of sets', () => {
      for (let i = 0; i < 100; i++) dsf.makeSet(String(i))
      expect(dsf.sets().length).toBe(100)
    })
  })

  describe('components', () => {
    it('should return empty map for empty forest', () => {
      expect(dsf.components().size).toBe(0)
    })

    it('should return Map instance', () => {
      dsf.makeSet('a')
      expect(dsf.components()).toBeInstanceOf(Map)
    })

    it('should return single component for single element', () => {
      dsf.makeSet('a')
      const c = dsf.components()
      expect(c.size).toBe(1)
      expect(c.get(dsf.find('a'))).toEqual(['a'])
    })

    it('should return merged component after union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      const c = dsf.components()
      expect(c.size).toBe(1)
      const root = dsf.find('a')
      expect(c.get(root)!.length).toBe(2)
    })

    it('should return separate components for unconnected elements', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      const c = dsf.components()
      expect(c.size).toBe(3)
    })

    it('should include all items across components', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.union('a', 'b')
      dsf.union('c', 'd')
      const c = dsf.components()
      let total = 0
      for (const members of c.values()) total += members.length
      expect(total).toBe(4)
    })

    it('should map representative to members', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      const c = dsf.components()
      const root = dsf.find('a')
      expect(c.has(root)).toBe(true)
      expect(c.get(root)!.length).toBe(2)
    })
  })

  describe('has', () => {
    it('should return false for non-existent item', () => {
      expect(dsf.has('a')).toBe(false)
    })

    it('should return true for existing item', () => {
      dsf.makeSet('a')
      expect(dsf.has('a')).toBe(true)
    })

    it('should return true after union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.has('a')).toBe(true)
      expect(dsf.has('b')).toBe(true)
    })

    it('should return false after clear', () => {
      dsf.makeSet('a')
      dsf.clear()
      expect(dsf.has('a')).toBe(false)
    })

    it('should handle type-specific lookups', () => {
      const ds = new DisjointSetForest<number>()
      ds.makeSet(1)
      expect(ds.has(1)).toBe(true)
      expect(ds.has(2)).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      dsf.clear()
      expect(dsf.count).toBe(0)
      expect(dsf.itemCount).toBe(0)
    })

    it('should allow adding after clear', () => {
      dsf.makeSet('a')
      dsf.clear()
      dsf.makeSet('b')
      expect(dsf.itemCount).toBe(1)
      expect(dsf.has('b')).toBe(true)
      expect(dsf.has('a')).toBe(false)
    })

    it('should handle clearing empty forest', () => {
      dsf.clear()
      expect(dsf.count).toBe(0)
      expect(dsf.itemCount).toBe(0)
    })

    it('should allow reuse after clear', () => {
      for (let i = 0; i < 10; i++) dsf.makeSet(String(i))
      dsf.clear()
      for (let i = 0; i < 10; i++) dsf.makeSet(String(i))
      expect(dsf.itemCount).toBe(10)
      expect(dsf.count).toBe(10)
    })

    it('should reset sets()', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.clear()
      expect(dsf.sets()).toEqual([])
    })

    it('should reset toArray()', () => {
      dsf.makeSet('a')
      dsf.clear()
      expect(dsf.toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      const cloned = dsf.clone()
      expect(cloned.count).toBe(dsf.count)
      expect(cloned.itemCount).toBe(dsf.itemCount)
      expect(cloned.has('a')).toBe(true)
      expect(cloned.has('b')).toBe(true)
    })

    it('should not affect original when modified', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      const cloned = dsf.clone()
      cloned.makeSet('c')
      expect(dsf.has('c')).toBe(false)
      expect(cloned.has('c')).toBe(true)
    })

    it('should preserve connectivity', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      const cloned = dsf.clone()
      expect(cloned.connected('a', 'b')).toBe(true)
    })

    it('should preserve sizes', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      dsf.union('a', 'c')
      const cloned = dsf.clone()
      expect(cloned.size('a')).toBe(3)
    })

    it('should preserve counts', () => {
      for (let i = 0; i < 10; i++) dsf.makeSet(String(i))
      for (let i = 1; i < 5; i++) dsf.union('0', String(i))
      const cloned = dsf.clone()
      expect(cloned.count).toBe(dsf.count)
      expect(cloned.itemCount).toBe(dsf.itemCount)
    })

    it('should handle empty forest', () => {
      const cloned = dsf.clone()
      expect(cloned.count).toBe(0)
      expect(cloned.itemCount).toBe(0)
    })

    it('should return a DisjointSetForest instance', () => {
      dsf.makeSet('a')
      const cloned = dsf.clone()
      expect(cloned).toBeInstanceOf(DisjointSetForest)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty forest', () => {
      expect(dsf.toArray()).toEqual([])
    })

    it('should return all items', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      const arr = dsf.toArray().sort()
      expect(arr).toEqual(['a', 'b', 'c'])
    })

    it('should not change after union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      const arr = dsf.toArray().sort()
      expect(arr).toEqual(['a', 'b'])
    })

    it('should return a new array each time', () => {
      dsf.makeSet('a')
      const arr1 = dsf.toArray()
      const arr2 = dsf.toArray()
      expect(arr1).not.toBe(arr2)
    })
  })

  describe('path compression', () => {
    it('should flatten tree on repeated finds', () => {
      for (let i = 0; i < 20; i++) dsf.makeSet(String(i))
      for (let i = 1; i < 20; i++) dsf.union(String(i - 1), String(i))
      const root = dsf.find('19')
      expect(dsf.find('0')).toBe(root)
      expect(dsf.connected('0', '19')).toBe(true)
    })

    it('should maintain correctness after path compression', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.union('a', 'b')
      dsf.union('c', 'd')
      dsf.union('a', 'c')
      expect(dsf.connected('b', 'd')).toBe(true)
      expect(dsf.connected('a', 'd')).toBe(true)
    })

    it('should speed up subsequent finds', () => {
      for (let i = 0; i < 100; i++) dsf.makeSet(String(i))
      for (let i = 1; i < 100; i++) dsf.union(String(i - 1), String(i))
      dsf.find('99')
      const root = dsf.find('99')
      expect(root).toBe(dsf.find('0'))
      expect(root).toBe(dsf.find('50'))
    })

    it('should work with path halving approach', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 10; i++) ds.makeSet(i)
      ds.union(0, 1)
      ds.union(1, 2)
      ds.union(2, 3)
      ds.union(3, 4)
      ds.find(4)
      expect(ds.find(4)).toBe(ds.find(0))
      expect(ds.find(3)).toBe(ds.find(0))
      expect(ds.find(2)).toBe(ds.find(0))
      expect(ds.find(1)).toBe(ds.find(0))
    })
  })

  describe('union by rank', () => {
    it('should attach smaller tree under larger tree root', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      dsf.union('a', 'c')
      expect(dsf.connected('a', 'b')).toBe(true)
      expect(dsf.connected('a', 'c')).toBe(true)
      expect(dsf.connected('b', 'c')).toBe(true)
    })

    it('should produce balanced trees', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 8; i++) ds.makeSet(i)
      ds.union(0, 1)
      ds.union(2, 3)
      ds.union(4, 5)
      ds.union(6, 7)
      ds.union(0, 2)
      ds.union(4, 6)
      ds.union(0, 4)
      expect(ds.count).toBe(1)
      expect(ds.size(0)).toBe(8)
    })

    it('should increment rank when merging equal rank trees', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.union('a', 'b')
      dsf.union('c', 'd')
      dsf.union('a', 'c')
      expect(dsf.count).toBe(1)
      expect(dsf.size('a')).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('should handle single element', () => {
      dsf.makeSet('a')
      expect(dsf.find('a')).toBe('a')
      expect(dsf.connected('a', 'a')).toBe(true)
      expect(dsf.size('a')).toBe(1)
      expect(dsf.count).toBe(1)
    })

    it('should handle union self', () => {
      dsf.makeSet('a')
      expect(dsf.union('a', 'a')).toBe(false)
      expect(dsf.count).toBe(1)
    })

    it('should handle repeated union of same pair', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      expect(dsf.union('a', 'b')).toBe(false)
      expect(dsf.union('b', 'a')).toBe(false)
      expect(dsf.count).toBe(1)
    })

    it('should handle large n items', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 10000; i++) ds.makeSet(i)
      expect(ds.itemCount).toBe(10000)
      expect(ds.count).toBe(10000)
      for (let i = 1; i < 10000; i++) ds.union(0, i)
      expect(ds.count).toBe(1)
      expect(ds.size(0)).toBe(10000)
    })

    it('should handle alternating union pattern', () => {
      for (let i = 0; i < 10; i++) dsf.makeSet(String(i))
      dsf.union('0', '1')
      dsf.union('2', '3')
      dsf.union('4', '5')
      dsf.union('6', '7')
      dsf.union('8', '9')
      expect(dsf.count).toBe(5)
    })

    it('should handle star pattern union', () => {
      for (let i = 0; i < 50; i++) dsf.makeSet(String(i))
      for (let i = 1; i < 50; i++) dsf.union('0', String(i))
      expect(dsf.count).toBe(1)
      expect(dsf.size('0')).toBe(50)
    })

    it('should handle sequential union chain', () => {
      for (let i = 0; i < 100; i++) dsf.makeSet(String(i))
      for (let i = 0; i < 99; i++) dsf.union(String(i), String(i + 1))
      expect(dsf.count).toBe(1)
      expect(dsf.connected('0', '99')).toBe(true)
    })

    it('should handle binary merge pattern', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 256; i++) ds.makeSet(i)
      for (let stride = 1; stride < 256; stride *= 2) {
        for (let i = 0; i + stride < 256; i += stride * 2) {
          ds.union(i, i + stride)
        }
      }
      expect(ds.count).toBe(1)
    })

    it('should handle object identity as key', () => {
      const ds = new DisjointSetForest<object>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const obj3 = { id: 1 }
      ds.makeSet(obj1)
      ds.makeSet(obj2)
      expect(ds.has(obj1)).toBe(true)
      expect(ds.has(obj2)).toBe(true)
      expect(ds.has(obj3)).toBe(false)
      ds.union(obj1, obj2)
      expect(ds.connected(obj1, obj2)).toBe(true)
    })
  })

  describe('multiple components', () => {
    it('should track separate components correctly', () => {
      for (let i = 0; i < 10; i++) dsf.makeSet(String(i))
      dsf.union('0', '1')
      dsf.union('2', '3')
      dsf.union('4', '5')
      expect(dsf.count).toBe(7)
      expect(dsf.connected('0', '1')).toBe(true)
      expect(dsf.connected('2', '3')).toBe(true)
      expect(dsf.connected('0', '2')).toBe(false)
    })

    it('should track sizes independently', () => {
      for (let i = 0; i < 6; i++) dsf.makeSet(String(i))
      dsf.union('0', '1')
      dsf.union('2', '3')
      dsf.union('4', '5')
      expect(dsf.size('0')).toBe(2)
      expect(dsf.size('2')).toBe(2)
      expect(dsf.size('4')).toBe(2)
    })

    it('should merge components correctly', () => {
      for (let i = 0; i < 6; i++) dsf.makeSet(String(i))
      dsf.union('0', '1')
      dsf.union('2', '3')
      dsf.union('0', '2')
      expect(dsf.count).toBe(3)
      expect(dsf.size('0')).toBe(4)
      expect(dsf.connected('1', '3')).toBe(true)
    })
  })

  describe('clone independence', () => {
    it('should not share state with original after union on clone', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      const cloned = dsf.clone()
      cloned.union('a', 'b')
      expect(cloned.connected('a', 'b')).toBe(true)
      expect(dsf.connected('a', 'b')).toBe(false)
    })

    it('should not share state with original after clear on clone', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      const cloned = dsf.clone()
      cloned.clear()
      expect(dsf.has('a')).toBe(true)
      expect(cloned.has('a')).toBe(false)
    })

    it('should not share state with original after makeSet on clone', () => {
      dsf.makeSet('a')
      const cloned = dsf.clone()
      cloned.makeSet('b')
      expect(dsf.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
      expect(dsf.itemCount).toBe(1)
      expect(cloned.itemCount).toBe(2)
    })
  })

  describe('type exports', () => {
    it('should be generic over type parameter', () => {
      const dsNum = new DisjointSetForest<number>()
      dsNum.makeSet(1)
      dsNum.makeSet(2)
      dsNum.union(1, 2)
      expect(dsNum.connected(1, 2)).toBe(true)
    })

    it('should work with string type', () => {
      const dsStr = new DisjointSetForest<string>()
      dsStr.makeSet('hello')
      dsStr.makeSet('world')
      dsStr.union('hello', 'world')
      expect(dsStr.connected('hello', 'world')).toBe(true)
    })
  })

  describe('rapid operations', () => {
    it('should handle rapid makeSet and find', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 1000; i++) ds.makeSet(i)
      for (let i = 0; i < 1000; i++) expect(ds.find(i)).toBe(i)
    })

    it('should handle rapid union and find', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 500; i++) ds.makeSet(i)
      for (let i = 1; i < 500; i++) ds.union(i - 1, i)
      for (let i = 0; i < 500; i++) expect(ds.connected(0, i)).toBe(true)
    })

    it('should handle interleaved makeSet and union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.union('c', 'd')
      dsf.makeSet('e')
      dsf.union('a', 'c')
      expect(dsf.count).toBe(2)
      expect(dsf.connected('a', 'd')).toBe(true)
      expect(dsf.connected('a', 'e')).toBe(false)
    })
  })

  describe('toArray after operations', () => {
    it('should include all items after unions', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      expect(dsf.toArray().sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return items in insertion order', () => {
      dsf.makeSet('c')
      dsf.makeSet('a')
      dsf.makeSet('b')
      expect(dsf.toArray()).toEqual(['c', 'a', 'b'])
    })
  })

  describe('sets after operations', () => {
    it('should return correct sets after mixed operations', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.union('a', 'b')
      dsf.union('c', 'd')
      const s = dsf.sets()
      expect(s.length).toBe(2)
      const sizes = s.map(set => set.length).sort()
      expect(sizes).toEqual([2, 2])
    })

    it('should reflect all elements in sets', () => {
      for (let i = 0; i < 20; i++) dsf.makeSet(String(i))
      for (let i = 0; i < 19; i++) dsf.union(String(i), String(i + 1))
      const s = dsf.sets()
      expect(s.length).toBe(1)
      expect(s[0]!.length).toBe(20)
    })
  })

  describe('components after operations', () => {
    it('should return correct components after clear and rebuild', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      dsf.clear()
      dsf.makeSet('x')
      dsf.makeSet('y')
      const c = dsf.components()
      expect(c.size).toBe(2)
    })

    it('should return correct components after merge', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      dsf.union('a', 'c')
      const c = dsf.components()
      expect(c.size).toBe(1)
    })
  })

  describe('stress tests', () => {
    it('should handle 5000 elements unioned into one set', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 5000; i++) ds.makeSet(i)
      for (let i = 1; i < 5000; i += 2) ds.union(i - 1, i)
      for (let i = 3; i < 5000; i += 4) ds.union(i - 2, i)
      ds.union(0, 2)
      ds.union(0, 4)
      expect(ds.count).toBeLessThan(ds.itemCount)
      expect(ds.size(0)).toBeGreaterThan(0)
    })

    it('should handle pair-wise unions for 2000 items', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 2000; i++) ds.makeSet(i)
      for (let i = 0; i < 2000; i += 2) ds.union(i, i + 1)
      expect(ds.count).toBe(1000)
      expect(ds.size(0)).toBe(2)
      expect(ds.size(1)).toBe(2)
    })

    it('should handle many singleton sets', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 500; i++) ds.makeSet(i)
      expect(ds.count).toBe(500)
      expect(ds.sets().length).toBe(500)
      for (let i = 0; i < 500; i++) expect(ds.size(i)).toBe(1)
    })
  })

  describe('additional edge cases', () => {
    it('should handle false as item', () => {
      const ds = new DisjointSetForest<boolean>()
      ds.makeSet(false)
      ds.makeSet(true)
      expect(ds.has(false)).toBe(true)
      expect(ds.has(true)).toBe(true)
      ds.union(false, true)
      expect(ds.connected(false, true)).toBe(true)
    })

    it('should handle null-like sentinel values with number', () => {
      const ds = new DisjointSetForest<number>()
      ds.makeSet(-1)
      ds.makeSet(-2)
      expect(ds.has(-1)).toBe(true)
      expect(ds.has(-2)).toBe(true)
      ds.union(-1, -2)
      expect(ds.connected(-1, -2)).toBe(true)
    })

    it('should handle very long string keys', () => {
      const longKey = 'x'.repeat(1000)
      dsf.makeSet(longKey)
      expect(dsf.has(longKey)).toBe(true)
      expect(dsf.find(longKey)).toBe(longKey)
    })

    it('should handle special characters in string keys', () => {
      dsf.makeSet('a\x00b')
      dsf.makeSet('c\nd')
      dsf.makeSet('e\tf')
      expect(dsf.has('a\x00b')).toBe(true)
      expect(dsf.has('c\nd')).toBe(true)
      expect(dsf.has('e\tf')).toBe(true)
      dsf.union('a\x00b', 'c\nd')
      expect(dsf.connected('a\x00b', 'c\nd')).toBe(true)
    })

    it('should return correct set count after complex operations', () => {
      for (let i = 0; i < 20; i++) dsf.makeSet(String(i))
      for (let i = 0; i < 10; i++) dsf.union(String(i * 2), String(i * 2 + 1))
      expect(dsf.count).toBe(10)
    })

    it('should handle find after many path compressions', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 200; i++) ds.makeSet(i)
      for (let i = 1; i < 200; i++) ds.union(0, i)
      for (let i = 0; i < 200; i++) ds.find(i)
      const root = ds.find(0)
      for (let i = 0; i < 200; i++) expect(ds.find(i)).toBe(root)
    })

    it('should handle union after partial unions', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.union('a', 'b')
      expect(dsf.count).toBe(3)
      dsf.union('c', 'd')
      expect(dsf.count).toBe(2)
      dsf.union('b', 'c')
      expect(dsf.count).toBe(1)
      expect(dsf.connected('a', 'd')).toBe(true)
    })

    it('should handle double clone', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      const c1 = dsf.clone()
      const c2 = c1.clone()
      expect(c2.has('a')).toBe(true)
      expect(c2.has('b')).toBe(true)
      expect(c2.connected('a', 'b')).toBe(true)
      c2.makeSet('c')
      expect(c1.has('c')).toBe(false)
      expect(dsf.has('c')).toBe(false)
    })

    it('should handle clone of empty forest', () => {
      const c = dsf.clone()
      c.makeSet('a')
      expect(dsf.has('a')).toBe(false)
      expect(c.has('a')).toBe(true)
    })

    it('should handle sets with single element after other unions', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.union('a', 'b')
      const s = dsf.sets()
      expect(s.length).toBe(2)
      const loneSet = s.find(set => set.length === 1)
      expect(loneSet).toEqual(['c'])
    })

    it('should handle size consistency across operations', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      dsf.makeSet('d')
      dsf.makeSet('e')
      dsf.union('a', 'b')
      dsf.union('c', 'd')
      dsf.union('a', 'c')
      expect(dsf.size('a')).toBe(4)
      expect(dsf.size('e')).toBe(1)
      dsf.union('a', 'e')
      expect(dsf.size('a')).toBe(5)
      expect(dsf.count).toBe(1)
    })

    it('should maintain item order in toArray across operations', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      const before = dsf.toArray()
      dsf.union('a', 'c')
      const after = dsf.toArray()
      expect(before).toEqual(after)
    })

    it('should handle components with all singletons', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      const c = dsf.components()
      expect(c.size).toBe(3)
      for (const members of c.values()) {
        expect(members.length).toBe(1)
      }
    })

    it('should verify path compression reduces tree height', () => {
      const ds = new DisjointSetForest<number>()
      for (let i = 0; i < 50; i++) ds.makeSet(i)
      for (let i = 1; i < 50; i++) ds.union(i - 1, i)
      ds.find(49)
      ds.find(48)
      ds.find(47)
      expect(ds.find(49)).toBe(ds.find(0))
      expect(ds.find(25)).toBe(ds.find(0))
      expect(ds.connected(0, 49)).toBe(true)
      expect(ds.size(0)).toBe(50)
    })

    it('should handle alternating find and union', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.makeSet('c')
      expect(dsf.find('a')).toBe('a')
      dsf.union('a', 'b')
      expect(dsf.find('b')).toBe(dsf.find('a'))
      dsf.union('b', 'c')
      expect(dsf.find('c')).toBe(dsf.find('a'))
    })

    it('should handle clear after clone preserves original', () => {
      dsf.makeSet('a')
      dsf.makeSet('b')
      dsf.union('a', 'b')
      const cloned = dsf.clone()
      cloned.clear()
      expect(dsf.has('a')).toBe(true)
      expect(dsf.connected('a', 'b')).toBe(true)
      expect(dsf.count).toBe(1)
      expect(cloned.count).toBe(0)
      expect(cloned.itemCount).toBe(0)
    })
  })
})
