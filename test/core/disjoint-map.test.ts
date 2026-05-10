import { describe, it, expect, beforeEach } from 'vitest'
import { DisjointMap } from '../../src/core/disjoint-map/disjoint-map.js'
import { DEFAULT_DISJOINT_MAP_OPTIONS } from '../../src/core/disjoint-map/types.js'
import type { DisjointMapOptions, DisjointMapStats } from '../../src/core/disjoint-map/types.js'

function createSumMap(): DisjointMap<string, number> {
  return new DisjointMap({ merge: (a, b) => a + b })
}

function createStringConcatMap(): DisjointMap<string, string> {
  return new DisjointMap({ merge: (a, b) => a + b })
}

function createMaxMap(): DisjointMap<number, number> {
  return new DisjointMap({ merge: (a, b) => Math.max(a, b) })
}

function createSetMap<K>(): DisjointMap<K, number[]> {
  return new DisjointMap<K, number[]>({ merge: (a, b) => [...a, ...b] })
}

describe('DisjointMap', () => {
  describe('construction', () => {
    it('should create instance with merge function', () => {
      const dm = createSumMap()
      expect(dm.size).toBe(0)
    })

    it('should create instance with string concat merge', () => {
      const dm = createStringConcatMap()
      expect(dm.size).toBe(0)
    })

    it('should create instance with max merge', () => {
      const dm = createMaxMap()
      expect(dm.size).toBe(0)
    })

    it('should accept DisjointMapOptions interface', () => {
      const opts: DisjointMapOptions<number> = { merge: (a, b) => a + b }
      const dm = new DisjointMap<string, number>(opts)
      expect(dm.size).toBe(0)
    })

    it('should export DEFAULT_DISJOINT_MAP_OPTIONS', () => {
      expect(DEFAULT_DISJOINT_MAP_OPTIONS.merge).toBeTypeOf('function')
    })

    it('should create with custom merge function', () => {
      const dm = new DisjointMap<string, number>({ merge: (a, b) => a * b })
      dm.makeSet('a', 3)
      dm.makeSet('b', 5)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(15)
    })
  })

  describe('makeSet', () => {
    let dm: DisjointMap<string, number>

    beforeEach(() => {
      dm = createSumMap()
    })

    it('should add a single element', () => {
      dm.makeSet('a', 1)
      expect(dm.size).toBe(1)
    })

    it('should add multiple elements', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      expect(dm.size).toBe(3)
    })

    it('should not duplicate existing key', () => {
      dm.makeSet('a', 1)
      dm.makeSet('a', 99)
      expect(dm.size).toBe(1)
      expect(dm.getValue('a')).toBe(1)
    })

    it('should set value correctly', () => {
      dm.makeSet('x', 42)
      expect(dm.getValue('x')).toBe(42)
    })

    it('should increment component count for each new set', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      expect(dm.stats().componentCount).toBe(3)
    })

    it('should not increment component count for duplicate key', () => {
      dm.makeSet('a', 1)
      dm.makeSet('a', 2)
      expect(dm.stats().componentCount).toBe(1)
    })

    it('should support number keys', () => {
      const ndm = createMaxMap()
      ndm.makeSet(1, 10)
      ndm.makeSet(2, 20)
      expect(ndm.size).toBe(2)
    })

    it('should support object values', () => {
      const sdm = createSetMap<string>()
      sdm.makeSet('a', [1])
      sdm.makeSet('b', [2])
      expect(sdm.getValue('a')).toEqual([1])
    })
  })

  describe('find', () => {
    let dm: DisjointMap<string, number>

    beforeEach(() => {
      dm = createSumMap()
    })

    it('should return key itself for singleton', () => {
      dm.makeSet('a', 1)
      expect(dm.find('a')).toBe('a')
    })

    it('should throw for missing key', () => {
      expect(() => dm.find('missing')).toThrow('Element not found')
    })

    it('should return same root after union', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.find('a')).toBe(dm.find('b'))
    })

    it('should return different roots for unconnected sets', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      expect(dm.find('a')).toBe(dm.find('b'))
      expect(dm.find('c')).not.toBe(dm.find('a'))
    })

    it('should apply path compression', () => {
      for (let i = 0; i < 10; i++) dm.makeSet(`n${i}`, i)
      for (let i = 1; i < 10; i++) dm.union(`n${i - 1}`, `n${i}`)
      const root = dm.find('n9')
      expect(root).toBe(dm.find('n0'))
      expect(root).toBe(dm.find('n5'))
    })

    it('should return consistent roots on repeated calls', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      const r1 = dm.find('a')
      const r2 = dm.find('a')
      expect(r1).toBe(r2)
    })
  })

  describe('getValue', () => {
    let dm: DisjointMap<string, number>

    beforeEach(() => {
      dm = createSumMap()
    })

    it('should return initial value for singleton', () => {
      dm.makeSet('a', 10)
      expect(dm.getValue('a')).toBe(10)
    })

    it('should throw for missing key', () => {
      expect(() => dm.getValue('missing')).toThrow('Element not found')
    })

    it('should return merged value after union', () => {
      dm.makeSet('a', 3)
      dm.makeSet('b', 7)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(10)
      expect(dm.getValue('b')).toBe(10)
    })

    it('should return same merged value for all members', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      dm.union('b', 'c')
      const val = dm.getValue('a')
      expect(dm.getValue('b')).toBe(val)
      expect(dm.getValue('c')).toBe(val)
    })

    it('should accumulate merges correctly', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(3)
      dm.union('c', 'd')
      expect(dm.getValue('c')).toBe(7)
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe(10)
    })

    it('should work with string concat merge', () => {
      const sdm = createStringConcatMap()
      sdm.makeSet('a', 'hello')
      sdm.makeSet('b', ' ')
      sdm.makeSet('c', 'world')
      sdm.union('a', 'b')
      sdm.union('a', 'c')
      expect(sdm.getValue('a')).toBe('hello world')
    })

    it('should work with max merge', () => {
      const mdm = createMaxMap()
      mdm.makeSet(1, 10)
      mdm.makeSet(2, 30)
      mdm.makeSet(3, 20)
      mdm.union(1, 2)
      expect(mdm.getValue(1)).toBe(30)
      mdm.union(1, 3)
      expect(mdm.getValue(1)).toBe(30)
    })

    it('should work with array union merge', () => {
      const sdm = createSetMap<string>()
      sdm.makeSet('a', [1, 2])
      sdm.makeSet('b', [3, 4])
      sdm.union('a', 'b')
      expect(sdm.getValue('a')).toEqual([1, 2, 3, 4])
    })
  })

  describe('union', () => {
    let dm: DisjointMap<string, number>

    beforeEach(() => {
      dm = createSumMap()
    })

    it('should return true for merging different sets', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      expect(dm.union('a', 'b')).toBe(true)
    })

    it('should return false for same set elements', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.union('a', 'b')).toBe(false)
      expect(dm.union('b', 'a')).toBe(false)
    })

    it('should return false for self-union', () => {
      dm.makeSet('a', 1)
      expect(dm.union('a', 'a')).toBe(false)
    })

    it('should return false for missing keys', () => {
      dm.makeSet('a', 1)
      expect(dm.union('a', 'missing')).toBe(false)
      expect(dm.union('missing', 'a')).toBe(false)
    })

    it('should return false when both keys missing', () => {
      expect(dm.union('x', 'y')).toBe(false)
    })

    it('should decrement component count', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      expect(dm.stats().componentCount).toBe(3)
      dm.union('a', 'b')
      expect(dm.stats().componentCount).toBe(2)
      dm.union('a', 'c')
      expect(dm.stats().componentCount).toBe(1)
    })

    it('should not decrement for already connected', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      const count = dm.stats().componentCount
      dm.union('a', 'b')
      expect(dm.stats().componentCount).toBe(count)
    })

    it('should handle chain of unions', () => {
      for (let i = 0; i < 10; i++) dm.makeSet(`n${i}`, i)
      for (let i = 1; i < 10; i++) dm.union(`n${i - 1}`, `n${i}`)
      expect(dm.stats().componentCount).toBe(1)
      expect(dm.connected('n0', 'n9')).toBe(true)
    })

    it('should handle star pattern unions', () => {
      for (let i = 0; i < 10; i++) dm.makeSet(`n${i}`, i)
      for (let i = 1; i < 10; i++) dm.union('n0', `n${i}`)
      expect(dm.stats().componentCount).toBe(1)
      expect(dm.setSize('n0')).toBe(10)
    })

    it('should be symmetric in terms of connectivity', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.connected('a', 'b')).toBe(true)
      expect(dm.connected('b', 'a')).toBe(true)
    })

    it('should handle transitive unions', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      dm.union('b', 'c')
      expect(dm.connected('a', 'c')).toBe(true)
    })

    it('should merge values correctly with union by rank', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'b')
      dm.union('c', 'd')
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe(10)
      expect(dm.getValue('b')).toBe(10)
      expect(dm.getValue('c')).toBe(10)
      expect(dm.getValue('d')).toBe(10)
    })
  })

  describe('connected', () => {
    let dm: DisjointMap<string, number>

    beforeEach(() => {
      dm = createSumMap()
    })

    it('should return true for same element', () => {
      dm.makeSet('a', 1)
      expect(dm.connected('a', 'a')).toBe(true)
    })

    it('should return false for unconnected elements', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      expect(dm.connected('a', 'b')).toBe(false)
    })

    it('should return true after union', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.connected('a', 'b')).toBe(true)
    })

    it('should return false for missing keys', () => {
      dm.makeSet('a', 1)
      expect(dm.connected('a', 'missing')).toBe(false)
      expect(dm.connected('missing', 'a')).toBe(false)
      expect(dm.connected('x', 'y')).toBe(false)
    })

    it('should be symmetric', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.connected('a', 'b')).toBe(dm.connected('b', 'a'))
    })

    it('should be transitive', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      dm.union('b', 'c')
      expect(dm.connected('a', 'c')).toBe(true)
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      const dm = createSumMap()
      expect(dm.size).toBe(0)
    })

    it('should return count of elements', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      expect(dm.size).toBe(3)
    })

    it('should not change after unions', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.size).toBe(2)
    })
  })

  describe('setSize', () => {
    let dm: DisjointMap<string, number>

    beforeEach(() => {
      dm = createSumMap()
    })

    it('should return 1 for singleton', () => {
      dm.makeSet('a', 1)
      expect(dm.setSize('a')).toBe(1)
    })

    it('should return 0 for missing key', () => {
      expect(dm.setSize('missing')).toBe(0)
    })

    it('should return merged size after union', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.setSize('a')).toBe(2)
      expect(dm.setSize('b')).toBe(2)
    })

    it('should return correct size for larger group', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'b')
      dm.union('a', 'c')
      dm.union('a', 'd')
      expect(dm.setSize('a')).toBe(4)
      expect(dm.setSize('d')).toBe(4)
    })

    it('should return same size from any member', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      dm.union('b', 'c')
      expect(dm.setSize('a')).toBe(dm.setSize('b'))
      expect(dm.setSize('b')).toBe(dm.setSize('c'))
    })

    it('should track sizes independently for separate sets', () => {
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'b')
      dm.union('c', 'd')
      expect(dm.setSize('a')).toBe(2)
      expect(dm.setSize('c')).toBe(2)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      const dm = createSumMap()
      expect(dm.keys()).toEqual([])
    })

    it('should return all keys', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      expect(dm.keys().sort()).toEqual(['a', 'b', 'c'])
    })

    it('should return keys unchanged after union', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.keys().sort()).toEqual(['a', 'b'])
    })

    it('should return number keys for number-keyed map', () => {
      const dm = createMaxMap()
      dm.makeSet(1, 10)
      dm.makeSet(2, 20)
      dm.makeSet(3, 30)
      expect(dm.keys().sort()).toEqual([1, 2, 3])
    })
  })

  describe('groups', () => {
    it('should return empty map for empty DisjointMap', () => {
      const dm = createSumMap()
      expect(dm.groups().size).toBe(0)
    })

    it('should return singletons initially', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      const groups = dm.groups()
      expect(groups.size).toBe(2)
    })

    it('should merge groups after union', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      const groups = dm.groups()
      expect(groups.size).toBe(2)
    })

    it('should return single group when all connected', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      dm.union('b', 'c')
      const groups = dm.groups()
      expect(groups.size).toBe(1)
    })

    it('should include all elements in groups', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      let total = 0
      for (const members of dm.groups().values()) {
        total += members.length
      }
      expect(total).toBe(3)
    })

    it('should group elements correctly', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'c')
      dm.union('b', 'd')
      const groups = dm.groups()
      expect(groups.size).toBe(2)
      for (const members of groups.values()) {
        expect(members.length).toBe(2)
      }
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty map', () => {
      const dm = createSumMap()
      expect(dm.toArray()).toEqual([])
    })

    it('should return singletons with values', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      const arr = dm.toArray()
      expect(arr.length).toBe(2)
    })

    it('should return merged values after union', () => {
      const dm = createSumMap()
      dm.makeSet('a', 3)
      dm.makeSet('b', 7)
      dm.union('a', 'b')
      const arr = dm.toArray()
      for (const entry of arr) {
        expect(entry.value).toBe(10)
      }
    })

    it('should include all elements', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      const arr = dm.toArray()
      expect(arr.length).toBe(3)
      const keys = arr.map(e => e.key).sort()
      expect(keys).toEqual(['a', 'b', 'c'])
    })

    it('should return correct structure', () => {
      const dm = createSumMap()
      dm.makeSet('a', 5)
      const arr = dm.toArray()
      expect(arr[0]).toEqual({ key: 'a', value: 5 })
    })
  })

  describe('from factory', () => {
    it('should create map from entries', () => {
      const dm = DisjointMap.from([['a', 1], ['b', 2], ['c', 3]], { merge: (a, b) => a + b })
      expect(dm.size).toBe(3)
    })

    it('should create empty map from empty entries', () => {
      const dm = DisjointMap.from<string, number>([], { merge: (a, b) => a + b })
      expect(dm.size).toBe(0)
    })

    it('should preserve values from entries', () => {
      const dm = DisjointMap.from([['a', 10], ['b', 20]], { merge: (a, b) => a + b })
      expect(dm.getValue('a')).toBe(10)
      expect(dm.getValue('b')).toBe(20)
    })

    it('should allow unions after creation', () => {
      const dm = DisjointMap.from([['a', 1], ['b', 2], ['c', 3]], { merge: (a, b) => a + b })
      dm.union('a', 'b')
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe(6)
    })

    it('should work with number keys', () => {
      const dm = DisjointMap.from([[1, 10], [2, 20]], { merge: (a, b) => a + b })
      expect(dm.size).toBe(2)
      expect(dm.getValue(1)).toBe(10)
    })

    it('should skip duplicate keys', () => {
      const dm = DisjointMap.from([['a', 1], ['a', 2]], { merge: (a, b) => a + b })
      expect(dm.size).toBe(1)
      expect(dm.getValue('a')).toBe(1)
    })
  })

  describe('merge function behavior', () => {
    it('should use sum merge correctly', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(3)
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe(6)
    })

    it('should use string concat merge correctly', () => {
      const dm = createStringConcatMap()
      dm.makeSet('a', 'x')
      dm.makeSet('b', 'y')
      dm.makeSet('c', 'z')
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe('xy')
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe('xyz')
    })

    it('should use max merge correctly', () => {
      const dm = createMaxMap()
      dm.makeSet(1, 5)
      dm.makeSet(2, 15)
      dm.makeSet(3, 10)
      dm.union(1, 2)
      expect(dm.getValue(1)).toBe(15)
      dm.union(1, 3)
      expect(dm.getValue(1)).toBe(15)
    })

    it('should use array union merge correctly', () => {
      const dm = createSetMap<string>()
      dm.makeSet('a', [1])
      dm.makeSet('b', [2])
      dm.makeSet('c', [3])
      dm.union('a', 'b')
      expect(dm.getValue('a')).toEqual([1, 2])
      dm.union('a', 'c')
      expect(dm.getValue('a')).toEqual([1, 2, 3])
    })

    it('should use object merge correctly', () => {
      const dm = new DisjointMap<string, Record<string, number>>({
        merge: (a, b) => ({ ...a, ...b }),
      })
      dm.makeSet('a', { x: 1 })
      dm.makeSet('b', { y: 2 })
      dm.union('a', 'b')
      expect(dm.getValue('a')).toEqual({ x: 1, y: 2 })
    })

    it('should call merge exactly once per union', () => {
      let mergeCalls = 0
      const dm = new DisjointMap<string, number>({
        merge: (a, b) => { mergeCalls++; return a + b },
      })
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      expect(mergeCalls).toBe(1)
      dm.union('a', 'c')
      expect(mergeCalls).toBe(2)
    })

    it('should not call merge for self-union', () => {
      let mergeCalls = 0
      const dm = new DisjointMap<string, number>({
        merge: (a, b) => { mergeCalls++; return a + b },
      })
      dm.makeSet('a', 1)
      dm.union('a', 'a')
      expect(mergeCalls).toBe(0)
    })

    it('should not call merge for already connected', () => {
      let mergeCalls = 0
      const dm = new DisjointMap<string, number>({
        merge: (a, b) => { mergeCalls++; return a + b },
      })
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(mergeCalls).toBe(1)
      dm.union('a', 'b')
      dm.union('b', 'a')
      expect(mergeCalls).toBe(1)
    })

    it('should use multiplication merge', () => {
      const dm = new DisjointMap<string, number>({ merge: (a, b) => a * b })
      dm.makeSet('a', 2)
      dm.makeSet('b', 3)
      dm.makeSet('c', 4)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(6)
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe(24)
    })
  })

  describe('edge cases', () => {
    it('should handle single element map', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      expect(dm.size).toBe(1)
      expect(dm.find('a')).toBe('a')
      expect(dm.getValue('a')).toBe(1)
      expect(dm.connected('a', 'a')).toBe(true)
      expect(dm.setSize('a')).toBe(1)
    })

    it('should handle self-union', () => {
      const dm = createSumMap()
      dm.makeSet('a', 5)
      expect(dm.union('a', 'a')).toBe(false)
      expect(dm.getValue('a')).toBe(5)
    })

    it('should handle already connected union', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      expect(dm.union('a', 'b')).toBe(false)
      expect(dm.union('b', 'a')).toBe(false)
      expect(dm.getValue('a')).toBe(3)
    })

    it('should handle many unions forming one group', () => {
      const dm = createSumMap()
      for (let i = 0; i < 100; i++) dm.makeSet(`n${i}`, 1)
      for (let i = 1; i < 100; i++) dm.union('n0', `n${i}`)
      expect(dm.stats().componentCount).toBe(1)
      expect(dm.setSize('n0')).toBe(100)
      expect(dm.getValue('n0')).toBe(100)
    })

    it('should handle binary merge pattern', () => {
      const dm = createSumMap()
      for (let i = 0; i < 16; i++) dm.makeSet(`n${i}`, 1)
      for (let stride = 1; stride < 16; stride *= 2) {
        for (let i = 0; i + stride < 16; i += stride * 2) {
          dm.union(`n${i}`, `n${i + stride}`)
        }
      }
      expect(dm.stats().componentCount).toBe(1)
      expect(dm.getValue('n0')).toBe(16)
    })

    it('should handle alternating union pattern', () => {
      const dm = createSumMap()
      for (let i = 0; i < 10; i++) dm.makeSet(`n${i}`, i)
      for (let i = 0; i < 9; i++) dm.union(`n${i}`, `n${i + 1}`)
      expect(dm.stats().componentCount).toBe(1)
    })

    it('should handle non-adjacent unions', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'c')
      dm.union('b', 'd')
      expect(dm.connected('a', 'c')).toBe(true)
      expect(dm.connected('b', 'd')).toBe(true)
      expect(dm.connected('a', 'b')).toBe(false)
    })

    it('should handle repeated union of same pair', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      for (let i = 0; i < 10; i++) {
        expect(dm.union('a', 'b')).toBe(false)
      }
      expect(dm.getValue('a')).toBe(3)
    })

    it('should handle empty map operations', () => {
      const dm = createSumMap()
      expect(dm.size).toBe(0)
      expect(dm.keys()).toEqual([])
      expect(dm.toArray()).toEqual([])
      expect(dm.groups().size).toBe(0)
      expect(dm.connected('a', 'b')).toBe(false)
    })
  })

  describe('large maps', () => {
    it('should handle 10000 elements with star pattern', () => {
      const dm = createSumMap()
      for (let i = 0; i < 10000; i++) dm.makeSet(`n${i}`, 1)
      for (let i = 1; i < 10000; i++) dm.union('n0', `n${i}`)
      expect(dm.stats().componentCount).toBe(1)
      expect(dm.setSize('n0')).toBe(10000)
      expect(dm.getValue('n0')).toBe(10000)
    })

    it('should handle 10000 elements with chain pattern', () => {
      const dm = createSumMap()
      for (let i = 0; i < 10000; i++) dm.makeSet(`n${i}`, 1)
      for (let i = 1; i < 10000; i++) dm.union(`n${i - 1}`, `n${i}`)
      expect(dm.stats().componentCount).toBe(1)
      expect(dm.connected('n0', 'n9999')).toBe(true)
    })

    it('should handle 10000 elements with binary merge', () => {
      const dm = createSumMap()
      const n = 8192
      for (let i = 0; i < n; i++) dm.makeSet(`n${i}`, 1)
      for (let stride = 1; stride < n; stride *= 2) {
        for (let i = 0; i + stride < n; i += stride * 2) {
          dm.union(`n${i}`, `n${i + stride}`)
        }
      }
      expect(dm.stats().componentCount).toBe(1)
      expect(dm.getValue('n0')).toBe(n)
    })

    it('should handle 10000 elements remaining separate', () => {
      const dm = createSumMap()
      for (let i = 0; i < 10000; i++) dm.makeSet(`n${i}`, i)
      expect(dm.stats().componentCount).toBe(10000)
      expect(dm.size).toBe(10000)
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty map', () => {
      const dm = createSumMap()
      const s = dm.stats()
      expect(s.elementCount).toBe(0)
      expect(s.componentCount).toBe(0)
      expect(s.maxComponentSize).toBe(0)
      expect(s.minComponentSize).toBe(0)
    })

    it('should return correct stats for singletons', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      const s = dm.stats()
      expect(s.elementCount).toBe(3)
      expect(s.componentCount).toBe(3)
      expect(s.maxComponentSize).toBe(1)
      expect(s.minComponentSize).toBe(1)
    })

    it('should return correct stats after unions', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'b')
      dm.union('a', 'c')
      const s = dm.stats()
      expect(s.elementCount).toBe(4)
      expect(s.componentCount).toBe(2)
      expect(s.maxComponentSize).toBe(3)
      expect(s.minComponentSize).toBe(1)
    })

    it('should return correct stats when all connected', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.union('a', 'b')
      dm.union('a', 'c')
      const s = dm.stats()
      expect(s.elementCount).toBe(3)
      expect(s.componentCount).toBe(1)
      expect(s.maxComponentSize).toBe(3)
      expect(s.minComponentSize).toBe(3)
    })

    it('should return DisjointMapStats type', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      const s: DisjointMapStats = dm.stats()
      expect(s.elementCount).toBe(1)
    })

    it('should track stats for varied group sizes', () => {
      const dm = createSumMap()
      for (let i = 0; i < 10; i++) dm.makeSet(`n${i}`, i)
      dm.union('n0', 'n1')
      dm.union('n2', 'n3')
      dm.union('n4', 'n5')
      dm.union('n6', 'n7')
      dm.union('n8', 'n9')
      const s = dm.stats()
      expect(s.elementCount).toBe(10)
      expect(s.componentCount).toBe(5)
      expect(s.maxComponentSize).toBe(2)
      expect(s.minComponentSize).toBe(2)
    })
  })

  describe('path compression verification', () => {
    it('should flatten deep trees', () => {
      const dm = createSumMap()
      for (let i = 0; i < 20; i++) dm.makeSet(`n${i}`, i)
      for (let i = 1; i < 20; i++) dm.union(`n${i - 1}`, `n${i}`)
      dm.find('n19')
      const root = dm.find('n0')
      expect(dm.find('n19')).toBe(root)
      expect(dm.connected('n0', 'n19')).toBe(true)
    })

    it('should maintain correctness after compression', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.makeSet('e', 5)
      dm.union('a', 'b')
      dm.union('c', 'd')
      dm.union('a', 'c')
      dm.union('a', 'e')
      expect(dm.connected('b', 'e')).toBe(true)
      expect(dm.getValue('a')).toBe(15)
    })

    it('should handle repeated finds efficiently', () => {
      const dm = createSumMap()
      for (let i = 0; i < 100; i++) dm.makeSet(`n${i}`, i)
      for (let i = 1; i < 100; i++) dm.union(`n${i - 1}`, `n${i}`)
      dm.find('n99')
      const root = dm.find('n99')
      expect(root).toBe(dm.find('n0'))
      expect(root).toBe(dm.find('n50'))
    })

    it('should preserve values after path compression', () => {
      const dm = createSumMap()
      for (let i = 0; i < 10; i++) dm.makeSet(`n${i}`, 1)
      for (let i = 1; i < 10; i++) dm.union(`n${i - 1}`, `n${i}`)
      dm.find('n9')
      expect(dm.getValue('n5')).toBe(10)
      expect(dm.getValue('n0')).toBe(10)
      expect(dm.getValue('n9')).toBe(10)
    })
  })

  describe('integration', () => {
    it('should handle complex workflow with mixed operations', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'b')
      expect(dm.connected('a', 'b')).toBe(true)
      expect(dm.connected('c', 'd')).toBe(false)
      dm.union('c', 'd')
      expect(dm.connected('c', 'd')).toBe(true)
      dm.union('a', 'c')
      expect(dm.connected('a', 'd')).toBe(true)
      expect(dm.getValue('a')).toBe(10)
      expect(dm.stats().componentCount).toBe(1)
    })

    it('should handle from factory with subsequent unions', () => {
      const dm = DisjointMap.from([['a', 10], ['b', 20], ['c', 30], ['d', 40]], { merge: (a, b) => a + b })
      dm.union('a', 'c')
      dm.union('b', 'd')
      expect(dm.getValue('a')).toBe(40)
      expect(dm.getValue('b')).toBe(60)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(100)
    })

    it('should handle makeSet after unions', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.union('a', 'b')
      dm.makeSet('c', 3)
      expect(dm.size).toBe(3)
      expect(dm.stats().componentCount).toBe(2)
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe(6)
    })

    it('should handle groups with correct key grouping', () => {
      const dm = createSumMap()
      dm.makeSet('x', 1)
      dm.makeSet('y', 2)
      dm.makeSet('z', 3)
      dm.union('x', 'z')
      const groups = dm.groups()
      const xGroup = Array.from(groups.entries()).find(([_, v]) => v.includes('x'))!
      expect(xGroup[1]).toContain('z')
      expect(xGroup[1]).toContain('x')
    })

    it('should handle toArray with partial unions', () => {
      const dm = createSumMap()
      dm.makeSet('a', 1)
      dm.makeSet('b', 2)
      dm.makeSet('c', 3)
      dm.makeSet('d', 4)
      dm.union('a', 'b')
      const arr = dm.toArray()
      const aEntry = arr.find(e => e.key === 'a')!
      const bEntry = arr.find(e => e.key === 'b')!
      expect(aEntry.value).toBe(3)
      expect(bEntry.value).toBe(3)
      const cEntry = arr.find(e => e.key === 'c')!
      expect(cEntry.value).toBe(3)
    })

    it('should handle balanced tree construction', () => {
      const dm = createSumMap()
      for (let i = 0; i < 8; i++) dm.makeSet(`n${i}`, 1)
      dm.union('n0', 'n1')
      dm.union('n2', 'n3')
      dm.union('n4', 'n5')
      dm.union('n6', 'n7')
      dm.union('n0', 'n2')
      dm.union('n4', 'n6')
      dm.union('n0', 'n4')
      expect(dm.stats().componentCount).toBe(1)
      expect(dm.getValue('n0')).toBe(8)
    })

    it('should handle large values in merge', () => {
      const dm = new DisjointMap<string, number>({ merge: (a, b) => a + b })
      dm.makeSet('a', 1000000)
      dm.makeSet('b', 2000000)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(3000000)
    })

    it('should handle zero values in merge', () => {
      const dm = createSumMap()
      dm.makeSet('a', 0)
      dm.makeSet('b', 0)
      dm.makeSet('c', 5)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(0)
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe(5)
    })

    it('should handle negative values in merge', () => {
      const dm = createSumMap()
      dm.makeSet('a', -5)
      dm.makeSet('b', 3)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(-2)
    })

    it('should handle min merge function', () => {
      const dm = new DisjointMap<string, number>({ merge: (a, b) => Math.min(a, b) })
      dm.makeSet('a', 10)
      dm.makeSet('b', 5)
      dm.makeSet('c', 8)
      dm.union('a', 'b')
      expect(dm.getValue('a')).toBe(5)
      dm.union('a', 'c')
      expect(dm.getValue('a')).toBe(5)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_DISJOINT_MAP_OPTIONS', () => {
      expect(DEFAULT_DISJOINT_MAP_OPTIONS).toBeDefined()
      expect(DEFAULT_DISJOINT_MAP_OPTIONS.merge).toBeTypeOf('function')
    })

    it('should support DisjointMapOptions type', () => {
      const opts: DisjointMapOptions<number> = { merge: (a, b) => a + b }
      expect(opts.merge(1, 2)).toBe(3)
    })

    it('should support DisjointMapStats type', () => {
      const s: DisjointMapStats = {
        elementCount: 0,
        componentCount: 0,
        maxComponentSize: 0,
        minComponentSize: 0,
      }
      expect(s.elementCount).toBe(0)
    })
  })
})
