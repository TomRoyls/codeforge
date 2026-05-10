import { describe, it, expect } from 'vitest'
import { PersistentMap } from '../../src/core/persistent-map/persistent-map.js'

function createMap<K, V>(): PersistentMap<K, V> {
  return new PersistentMap<K, V>()
}

function createReverseMap<K, V>(): PersistentMap<K, V> {
  return new PersistentMap<K, V>({ comparator: (a: K, b: K) => (a < b ? 1 : a > b ? -1 : 0) })
}

describe('PersistentMap', () => {
  describe('construction', () => {
    it('creates an empty map with default comparator', () => {
      const map = new PersistentMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates a map with custom comparator', () => {
      const map = new PersistentMap<number, string>({
        comparator: (a, b) => b - a,
      })
      const m2 = map.set(1, 'a').set(2, 'b').set(3, 'c')
      expect(m2.first()).toEqual([3, 'c'])
    })

    it('handles no options argument', () => {
      const map = new PersistentMap<number, number>(undefined)
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates independent instances', () => {
      const m1 = new PersistentMap<number, number>()
      const m2 = new PersistentMap<number, number>()
      expect(m1.size).toBe(0)
      expect(m2.size).toBe(0)
    })
  })

  describe('set', () => {
    it('sets a single entry', () => {
      const map = createMap<string, number>().set('a', 1)
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(1)
    })

    it('returns a new map, leaving original unchanged', () => {
      const original = createMap<string, number>()
      const modified = original.set('a', 1)
      expect(original.size).toBe(0)
      expect(original.isEmpty).toBe(true)
      expect(modified.size).toBe(1)
      expect(modified.get('a')).toBe(1)
    })

    it('sets multiple entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('overwrites existing key', () => {
      const map = createMap<string, number>().set('a', 1).set('a', 2)
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(2)
    })

    it('overwrite preserves size', () => {
      const m1 = createMap<string, number>().set('a', 1).set('b', 2)
      const m2 = m1.set('a', 10)
      expect(m1.get('a')).toBe(1)
      expect(m2.get('a')).toBe(10)
      expect(m2.size).toBe(2)
    })

    it('set with numeric keys', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('c')
    })

    it('set with negative keys', () => {
      const map = createMap<number, string>().set(-1, 'neg').set(0, 'zero').set(1, 'pos')
      expect(map.get(-1)).toBe('neg')
      expect(map.get(0)).toBe('zero')
      expect(map.get(1)).toBe('pos')
    })

    it('set with object values', () => {
      const map = createMap<string, { x: number }>()
        .set('a', { x: 1 })
        .set('b', { x: 2 })
      expect(map.get('a')!.x).toBe(1)
      expect(map.get('b')!.x).toBe(2)
    })

    it('set with undefined value', () => {
      const map = createMap<string, number | undefined>().set('a', undefined)
      expect(map.has('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
    })

    it('set with null value', () => {
      const map = createMap<string, number | null>().set('a', null)
      expect(map.has('a')).toBe(true)
      expect(map.get('a')).toBeNull()
    })

    it('chain set preserves all previous versions', () => {
      const m0 = createMap<string, number>()
      const m1 = m0.set('a', 1)
      const m2 = m1.set('b', 2)
      const m3 = m2.set('c', 3)
      expect(m0.size).toBe(0)
      expect(m1.size).toBe(1)
      expect(m1.get('a')).toBe(1)
      expect(m2.size).toBe(2)
      expect(m2.get('b')).toBe(2)
      expect(m3.size).toBe(3)
      expect(m3.get('c')).toBe(3)
    })
  })

  describe('delete', () => {
    it('returns same map when deleting from empty map', () => {
      const map = createMap<string, number>()
      const result = map.delete('a')
      expect(result.size).toBe(0)
    })

    it('deletes a single entry', () => {
      const map = createMap<string, number>().set('a', 1)
      const result = map.delete('a')
      expect(result.size).toBe(0)
      expect(result.isEmpty).toBe(true)
    })

    it('returns a new map, leaving original unchanged', () => {
      const original = createMap<string, number>().set('a', 1).set('b', 2)
      const modified = original.delete('a')
      expect(original.size).toBe(2)
      expect(original.get('a')).toBe(1)
      expect(modified.size).toBe(1)
      expect(modified.has('a')).toBe(false)
    })

    it('deletes from middle of map', () => {
      const map = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      const result = map.delete(2)
      expect(result.size).toBe(2)
      expect(result.get(1)).toBe('a')
      expect(result.has(2)).toBe(false)
      expect(result.get(3)).toBe('c')
    })

    it('deletes non-existent key returns same map', () => {
      const map = createMap<string, number>().set('a', 1)
      const result = map.delete('z')
      expect(result).toBe(map)
    })

    it('deletes and re-adds', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = m1.delete('a')
      const m3 = m2.set('a', 2)
      expect(m3.size).toBe(1)
      expect(m3.get('a')).toBe(2)
    })

    it('sequential deletes', () => {
      const m = createMap<number, number>().set(1, 10).set(2, 20).set(3, 30)
      const m2 = m.delete(2)
      const m3 = m2.delete(1)
      const m4 = m3.delete(3)
      expect(m4.isEmpty).toBe(true)
    })

    it('delete last remaining entry', () => {
      const m = createMap<string, number>().set('only', 42)
      const result = m.delete('only')
      expect(result.isEmpty).toBe(true)
      expect(result.size).toBe(0)
    })
  })

  describe('get', () => {
    it('returns undefined for missing key', () => {
      const map = createMap<string, number>()
      expect(map.get('a')).toBeUndefined()
    })

    it('returns value for existing key', () => {
      const map = createMap<string, number>().set('a', 42)
      expect(map.get('a')).toBe(42)
    })

    it('returns undefined after delete', () => {
      const map = createMap<string, number>().set('a', 1).delete('a')
      expect(map.get('a')).toBeUndefined()
    })

    it('returns overwritten value', () => {
      const map = createMap<string, number>().set('a', 1).set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('get on original after modification', () => {
      const original = createMap<string, number>().set('a', 1)
      const modified = original.set('a', 2)
      expect(original.get('a')).toBe(1)
      expect(modified.get('a')).toBe(2)
    })

    it('get with numeric keys', () => {
      const map = createMap<number, string>().set(42, 'answer')
      expect(map.get(42)).toBe('answer')
      expect(map.get(0)).toBeUndefined()
    })
  })

  describe('has', () => {
    it('returns false for empty map', () => {
      expect(createMap<string, number>().has('a')).toBe(false)
    })

    it('returns true for existing key', () => {
      const map = createMap<string, number>().set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false after delete', () => {
      const map = createMap<string, number>().set('a', 1).delete('a')
      expect(map.has('a')).toBe(false)
    })

    it('returns true after overwrite', () => {
      const map = createMap<string, number>().set('a', 1).set('a', 2)
      expect(map.has('a')).toBe(true)
    })

    it('does not modify the map', () => {
      const map = createMap<string, number>().set('a', 1)
      expect(map.has('a')).toBe(true)
      expect(map.size).toBe(1)
    })
  })

  describe('first/last', () => {
    it('first returns undefined on empty map', () => {
      expect(createMap<string, number>().first()).toBeUndefined()
    })

    it('last returns undefined on empty map', () => {
      expect(createMap<string, number>().last()).toBeUndefined()
    })

    it('first returns min entry', () => {
      const map = createMap<number, string>().set(5, 'e').set(1, 'a').set(3, 'c')
      expect(map.first()).toEqual([1, 'a'])
    })

    it('last returns max entry', () => {
      const map = createMap<number, string>().set(5, 'e').set(1, 'a').set(3, 'c')
      expect(map.last()).toEqual([5, 'e'])
    })

    it('first and last on single entry', () => {
      const map = createMap<string, number>().set('only', 42)
      expect(map.first()).toEqual(['only', 42])
      expect(map.last()).toEqual(['only', 42])
    })

    it('first with string keys', () => {
      const map = createMap<string, number>().set('cherry', 3).set('apple', 1).set('banana', 2)
      expect(map.first()).toEqual(['apple', 1])
    })

    it('last with string keys', () => {
      const map = createMap<string, number>().set('cherry', 3).set('apple', 1).set('banana', 2)
      expect(map.last()).toEqual(['cherry', 3])
    })

    it('first after delete of min', () => {
      const map = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      const result = map.delete(1)
      expect(result.first()).toEqual([2, 'b'])
    })

    it('last after delete of max', () => {
      const map = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      const result = map.delete(3)
      expect(result.last()).toEqual([2, 'b'])
    })

    it('first/last with reverse comparator', () => {
      const map = createReverseMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      expect(map.first()).toEqual([3, 'c'])
      expect(map.last()).toEqual([1, 'a'])
    })

    it('first/last unchanged on original after set', () => {
      const m1 = createMap<number, string>().set(2, 'b')
      const m2 = m1.set(1, 'a').set(3, 'c')
      expect(m1.first()).toEqual([2, 'b'])
      expect(m1.last()).toEqual([2, 'b'])
      expect(m2.first()).toEqual([1, 'a'])
      expect(m2.last()).toEqual([3, 'c'])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      let count = 0
      createMap<string, number>().forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each entry in order', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      const entries: [number, string][] = []
      map.forEach((v, k) => entries.push([k, v]))
      expect(entries).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('provides correct index', () => {
      const map = createMap<number, string>().set(10, 'a').set(20, 'b').set(30, 'c')
      const indices: number[] = []
      map.forEach((_v, _k, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('forEach does not modify map', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      map.forEach(() => {})
      expect(map.size).toBe(2)
    })

    it('forEach on single entry', () => {
      const map = createMap<string, number>().set('only', 42)
      const entries: [string, number][] = []
      map.forEach((v, k) => entries.push([k, v]))
      expect(entries).toEqual([['only', 42]])
    })
  })

  describe('entries/keys/values', () => {
    it('entries returns empty for empty map', () => {
      expect(createMap<string, number>().entries()).toEqual([])
    })

    it('entries returns all entries in order', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      expect(map.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('keys returns all keys in order', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('values returns all values in order', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      expect(map.values()).toEqual(['a', 'b', 'c'])
    })

    it('keys returns empty for empty map', () => {
      expect(createMap<string, number>().keys()).toEqual([])
    })

    it('values returns empty for empty map', () => {
      expect(createMap<string, number>().values()).toEqual([])
    })

    it('entries after delete', () => {
      const map = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c').delete(2)
      expect(map.entries()).toEqual([[1, 'a'], [3, 'c']])
    })

    it('keys after delete', () => {
      const map = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c').delete(1)
      expect(map.keys()).toEqual([2, 3])
    })

    it('values after delete', () => {
      const map = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c').delete(3)
      expect(map.values()).toEqual(['a', 'b'])
    })
  })

  describe('size/isEmpty', () => {
    it('size is 0 for empty map', () => {
      expect(createMap<string, number>().size).toBe(0)
    })

    it('size increases with set', () => {
      const m = createMap<string, number>().set('a', 1)
      expect(m.size).toBe(1)
    })

    it('size does not increase on overwrite', () => {
      const m = createMap<string, number>().set('a', 1).set('a', 2)
      expect(m.size).toBe(1)
    })

    it('size decreases with delete', () => {
      const m = createMap<string, number>().set('a', 1).set('b', 2).delete('a')
      expect(m.size).toBe(1)
    })

    it('isEmpty is true for empty map', () => {
      expect(createMap<string, number>().isEmpty).toBe(true)
    })

    it('isEmpty is false after set', () => {
      expect(createMap<string, number>().set('a', 1).isEmpty).toBe(false)
    })

    it('isEmpty is true after deleting all', () => {
      const m = createMap<string, number>().set('a', 1).delete('a')
      expect(m.isEmpty).toBe(true)
    })

    it('size is a getter', () => {
      expect(typeof createMap<string, number>().size).toBe('number')
    })

    it('isEmpty is a getter', () => {
      expect(typeof createMap<string, number>().isEmpty).toBe('boolean')
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      expect(createMap<string, number>().toArray()).toEqual([])
    })

    it('returns entries in order', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('does not modify the map', () => {
      const map = createMap<string, number>().set('a', 1)
      const arr = map.toArray()
      expect(arr).toEqual([['a', 1]])
      expect(map.size).toBe(1)
    })

    it('multiple toArray calls return same result', () => {
      const map = createMap<number, string>().set(2, 'b').set(1, 'a')
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b']])
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b']])
    })
  })

  describe('from factory', () => {
    it('creates empty map from empty array', () => {
      const map = PersistentMap.from<string, number>([])
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates map from single entry', () => {
      const map = PersistentMap.from([['a', 1]])
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(1)
    })

    it('creates map from multiple entries', () => {
      const map = PersistentMap.from([['c', 3], ['a', 1], ['b', 2]])
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('creates map with custom comparator', () => {
      const map = PersistentMap.from<number, string>(
        [[1, 'a'], [2, 'b'], [3, 'c']],
        { comparator: (a, b) => b - a },
      )
      expect(map.first()).toEqual([3, 'c'])
    })

    it('last entry wins for duplicate keys', () => {
      const map = PersistentMap.from([['a', 1], ['a', 2]])
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(2)
    })

    it('from does not modify input array', () => {
      const arr: [string, number][] = [['a', 1], ['b', 2]]
      PersistentMap.from(arr)
      expect(arr).toEqual([['a', 1], ['b', 2]])
    })

    it('creates map from numeric entries', () => {
      const map = PersistentMap.from([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(map.keys()).toEqual([1, 2, 3])
    })

    it('creates map with string keys', () => {
      const map = PersistentMap.from([['banana', 2], ['apple', 1], ['cherry', 3]])
      expect(map.first()).toEqual(['apple', 1])
      expect(map.last()).toEqual(['cherry', 3])
    })
  })

  describe('persistence verification', () => {
    it('original map unchanged after set', () => {
      const original = createMap<string, number>().set('a', 1).set('b', 2)
      const modified = original.set('c', 3)
      expect(original.size).toBe(2)
      expect(original.has('c')).toBe(false)
      expect(modified.size).toBe(3)
      expect(modified.get('c')).toBe(3)
    })

    it('original map unchanged after delete', () => {
      const original = createMap<string, number>().set('a', 1).set('b', 2)
      const modified = original.delete('a')
      expect(original.size).toBe(2)
      expect(original.get('a')).toBe(1)
      expect(modified.size).toBe(1)
      expect(modified.has('a')).toBe(false)
    })

    it('original map unchanged after overwrite', () => {
      const original = createMap<string, number>().set('a', 1)
      const modified = original.set('a', 2)
      expect(original.get('a')).toBe(1)
      expect(modified.get('a')).toBe(2)
    })

    it('all intermediate versions remain accessible', () => {
      const m0 = createMap<number, string>()
      const m1 = m0.set(3, 'c')
      const m2 = m1.set(1, 'a')
      const m3 = m2.set(2, 'b')
      expect(m0.entries()).toEqual([])
      expect(m1.entries()).toEqual([[3, 'c']])
      expect(m2.entries()).toEqual([[1, 'a'], [3, 'c']])
      expect(m3.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('branching history from same ancestor', () => {
      const base = createMap<string, number>().set('a', 1).set('b', 2)
      const branchA = base.set('c', 3)
      const branchB = base.set('d', 4)
      expect(base.entries()).toEqual([['a', 1], ['b', 2]])
      expect(branchA.entries()).toEqual([['a', 1], ['b', 2], ['c', 3]])
      expect(branchB.entries()).toEqual([['a', 1], ['b', 2], ['d', 4]])
    })

    it('delete branches independently', () => {
      const base = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      const d1 = base.delete(1)
      const d2 = base.delete(3)
      expect(base.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(d1.entries()).toEqual([[2, 'b'], [3, 'c']])
      expect(d2.entries()).toEqual([[1, 'a'], [2, 'b']])
    })

    it('complex branching scenario', () => {
      const root = createMap<string, number>().set('b', 2)
      const left = root.set('a', 1)
      const right = root.set('c', 3)
      expect(root.entries()).toEqual([['b', 2]])
      expect(left.entries()).toEqual([['a', 1], ['b', 2]])
      expect(right.entries()).toEqual([['b', 2], ['c', 3]])
    })

    it('set after delete from same base', () => {
      const base = createMap<string, number>().set('a', 1).set('b', 2)
      const d = base.delete('a')
      const s = d.set('c', 3)
      expect(base.entries()).toEqual([['a', 1], ['b', 2]])
      expect(d.entries()).toEqual([['b', 2]])
      expect(s.entries()).toEqual([['b', 2], ['c', 3]])
    })

    it('deep chain of mutations preserves all versions', () => {
      const maps: PersistentMap<number, number>[] = [createMap()]
      for (let i = 0; i < 10; i++) {
        maps.push(maps[maps.length - 1]!.set(i, i * 10))
      }
      for (let i = 0; i <= 10; i++) {
        expect(maps[i]!.size).toBe(i)
      }
      expect(maps[10]!.entries()).toEqual([
        [0, 0], [1, 10], [2, 20], [3, 30], [4, 40], [5, 50],
        [6, 60], [7, 70], [8, 80], [9, 90],
      ])
    })
  })

  describe('branching history', () => {
    it('multiple versions from same base', () => {
      const base = createMap<string, number>().set('x', 1)
      const v1 = base.set('a', 10)
      const v2 = base.set('b', 20)
      const v3 = base.set('c', 30)
      expect(base.size).toBe(1)
      expect(v1.get('a')).toBe(10)
      expect(v2.get('b')).toBe(20)
      expect(v3.get('c')).toBe(30)
      expect(v1.has('b')).toBe(false)
      expect(v2.has('c')).toBe(false)
    })

    it('diamond shape branching', () => {
      const root = createMap<string, number>().set('a', 1).set('b', 2)
      const left = root.set('c', 3)
      const right = root.set('d', 4)
      const merged = left.set('d', 4)
      expect(root.entries()).toEqual([['a', 1], ['b', 2]])
      expect(left.entries()).toEqual([['a', 1], ['b', 2], ['c', 3]])
      expect(right.entries()).toEqual([['a', 1], ['b', 2], ['d', 4]])
      expect(merged.entries()).toEqual([['a', 1], ['b', 2], ['c', 3], ['d', 4]])
    })

    it('branching deletes', () => {
      const base = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c').set(4, 'd')
      const d1 = base.delete(1).delete(2)
      const d2 = base.delete(3).delete(4)
      expect(d1.entries()).toEqual([[3, 'c'], [4, 'd']])
      expect(d2.entries()).toEqual([[1, 'a'], [2, 'b']])
      expect(base.size).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('empty map operations', () => {
      const map = createMap<string, number>()
      expect(map.get('a')).toBeUndefined()
      expect(map.has('a')).toBe(false)
      expect(map.first()).toBeUndefined()
      expect(map.last()).toBeUndefined()
      expect(map.entries()).toEqual([])
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.toArray()).toEqual([])
    })

    it('single entry map', () => {
      const map = createMap<string, number>().set('only', 42)
      expect(map.size).toBe(1)
      expect(map.get('only')).toBe(42)
      expect(map.has('only')).toBe(true)
      expect(map.first()).toEqual(['only', 42])
      expect(map.last()).toEqual(['only', 42])
    })

    it('duplicate key overwrite preserves immutability', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = m1.set('a', 2)
      const m3 = m2.set('a', 3)
      expect(m1.get('a')).toBe(1)
      expect(m2.get('a')).toBe(2)
      expect(m3.get('a')).toBe(3)
      expect(m1.size).toBe(1)
      expect(m2.size).toBe(1)
      expect(m3.size).toBe(1)
    })

    it('works with empty string key', () => {
      const map = createMap<string, number>().set('', 0)
      expect(map.get('')).toBe(0)
      expect(map.has('')).toBe(true)
    })

    it('works with zero key', () => {
      const map = createMap<number, string>().set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('works with boolean values', () => {
      const map = createMap<string, boolean>().set('a', true).set('b', false)
      expect(map.get('a')).toBe(true)
      expect(map.get('b')).toBe(false)
    })

    it('works with array values', () => {
      const map = createMap<string, number[]>().set('a', [1, 2, 3])
      expect(map.get('a')).toEqual([1, 2, 3])
    })

    it('set delete set cycle', () => {
      const m1 = createMap<string, number>().set('a', 1)
      const m2 = m1.delete('a')
      const m3 = m2.set('a', 2)
      expect(m1.get('a')).toBe(1)
      expect(m2.has('a')).toBe(false)
      expect(m3.get('a')).toBe(2)
    })

    it('many overwrites on same key', () => {
      let map = createMap<string, number>()
      for (let i = 0; i < 100; i++) {
        map = map.set('key', i)
      }
      expect(map.size).toBe(1)
      expect(map.get('key')).toBe(99)
    })
  })

  describe('large maps', () => {
    it('handles 10000 sequential inserts', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        map = map.set(i, i * 2)
      }
      expect(map.size).toBe(10000)
      expect(map.first()).toEqual([0, 0])
      expect(map.last()).toEqual([9999, 19998])
      expect(map.get(5000)).toBe(10000)
    })

    it('handles 10000 reverse sequential inserts', () => {
      let map = createMap<number, number>()
      for (let i = 9999; i >= 0; i--) {
        map = map.set(i, i * 3)
      }
      expect(map.size).toBe(10000)
      expect(map.get(0)).toBe(0)
      expect(map.get(9999)).toBe(29997)
    })

    it('handles 10000 random inserts', () => {
      let map = createMap<number, number>()
      const keys = new Set<number>()
      for (let i = 0; i < 10000; i++) {
        const k = Math.floor(Math.random() * 50000)
        keys.add(k)
        map = map.set(k, k)
      }
      expect(map.size).toBe(keys.size)
      for (const k of keys) {
        expect(map.get(k)).toBe(k)
      }
    })

    it('entries returns sorted order for 1000 entries', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map = map.set(999 - i, i)
      }
      const keys = map.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('handles 10000 inserts and 5000 deletes', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        map = map.set(i, i)
      }
      expect(map.size).toBe(10000)
      for (let i = 0; i < 5000; i++) {
        map = map.delete(i)
      }
      expect(map.size).toBe(5000)
      expect(map.has(0)).toBe(false)
      expect(map.has(4999)).toBe(false)
      expect(map.has(5000)).toBe(true)
      expect(map.has(9999)).toBe(true)
    })

    it('persistence with large maps', () => {
      let map = createMap<number, number>()
      const snapshots: PersistentMap<number, number>[] = []
      for (let i = 0; i < 1000; i++) {
        map = map.set(i, i)
        if (i % 100 === 99) snapshots.push(map)
      }
      expect(snapshots.length).toBe(10)
      for (let s = 0; s < snapshots.length; s++) {
        expect(snapshots[s]!.size).toBe((s + 1) * 100)
        expect(snapshots[s]!.first()).toEqual([0, 0])
      }
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty map', () => {
      const stats = createMap<string, number>().stats()
      expect(stats.size).toBe(0)
      expect(stats.height).toBe(0)
    })

    it('returns correct stats for single entry', () => {
      const stats = createMap<string, number>().set('a', 1).stats()
      expect(stats.size).toBe(1)
      expect(stats.height).toBe(1)
    })

    it('returns correct stats for multiple entries', () => {
      const stats = createMap<number, number>().set(1, 1).set(2, 2).set(3, 3).stats()
      expect(stats.size).toBe(3)
      expect(stats.height).toBeGreaterThan(0)
    })

    it('height is balanced (O(log n)) for large maps', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        map = map.set(i, i)
      }
      const stats = map.stats()
      expect(stats.size).toBe(10000)
      expect(stats.height).toBeLessThanOrEqual(Math.ceil(Math.log2(10000)) * 2)
    })

    it('stats after delete', () => {
      const map = createMap<number, number>().set(1, 1).set(2, 2).set(3, 3)
      const after = map.delete(2)
      expect(after.stats().size).toBe(2)
    })

    it('stats object has expected keys', () => {
      const stats = createMap<string, number>().set('a', 1).stats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('height')
    })
  })

  describe('structural sharing verification', () => {
    it('set shares unmodified subtrees', () => {
      let base = createMap<number, number>()
      for (let i = 0; i < 100; i++) {
        base = base.set(i, i)
      }
      const modified = base.set(50, 999)
      expect(base.get(50)).toBe(50)
      expect(modified.get(50)).toBe(999)
      expect(base.size).toBe(100)
      expect(modified.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        if (i !== 50) {
          expect(modified.get(i)).toBe(i)
        }
      }
    })

    it('delete shares unmodified subtrees', () => {
      let base = createMap<number, number>()
      for (let i = 0; i < 100; i++) {
        base = base.set(i, i)
      }
      const modified = base.delete(50)
      expect(base.get(50)).toBe(50)
      expect(modified.has(50)).toBe(false)
      expect(base.size).toBe(100)
      expect(modified.size).toBe(99)
    })

    it('version tree size', () => {
      const versions: PersistentMap<number, number>[] = [createMap()]
      let current = versions[0]!
      for (let i = 0; i < 50; i++) {
        current = current.set(i, i)
        versions.push(current)
      }
      for (let i = 0; i <= 50; i++) {
        expect(versions[i]!.size).toBe(i)
      }
      expect(versions[0]!.isEmpty).toBe(true)
      expect(versions[50]!.size).toBe(50)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('returns empty iterator for empty map', () => {
      expect([...createMap<string, number>()]).toEqual([])
    })

    it('iterates entries in order', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      expect([...map]).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('works with for...of', () => {
      const map = createMap<number, string>().set(5, 'e').set(1, 'a').set(3, 'c')
      const entries: [number, string][] = []
      for (const entry of map) {
        entries.push(entry)
      }
      expect(entries).toEqual([[1, 'a'], [3, 'c'], [5, 'e']])
    })

    it('works with destructuring', () => {
      const map = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      const [first, second, third] = map
      expect(first).toEqual([1, 'a'])
      expect(second).toEqual([2, 'b'])
      expect(third).toEqual([3, 'c'])
    })

    it('can be used with Array.from', () => {
      const map = createMap<number, string>().set(3, 'c').set(1, 'a').set(2, 'b')
      expect(Array.from(map)).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('iterator does not modify map', () => {
      const map = createMap<string, number>().set('a', 1)
      ;[...map]
      expect(map.size).toBe(1)
    })
  })

  describe('type safety', () => {
    it('works with number keys and string values', () => {
      const map = new PersistentMap<number, string>()
      const m = map.set(1, 'a')
      expect(m.get(1)).toBe('a')
    })

    it('works with string keys and number values', () => {
      const map = new PersistentMap<string, number>()
      const m = map.set('a', 1)
      expect(m.get('a')).toBe(1)
    })

    it('works with custom type values', () => {
      type Item = { priority: number; label: string }
      const map = new PersistentMap<string, Item>()
      const m = map
        .set('a', { priority: 3, label: 'low' })
        .set('b', { priority: 1, label: 'high' })
      expect(m.get('b')!.label).toBe('high')
    })

    it('works with custom comparator on objects', () => {
      type Point = { x: number; y: number }
      const map = new PersistentMap<Point, string>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      const m = map.set({ x: 3, y: 1 }, 'a').set({ x: 1, y: 2 }, 'b')
      expect(m.first()?.[1]).toBe('b')
    })
  })

  describe('additional edge cases', () => {
    it('handles alternating insert delete', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 100; i++) {
        map = map.set(i, i)
        if (i > 0 && i % 2 === 0) {
          map = map.delete(i - 1)
        }
      }
      expect(map.size).toBeGreaterThan(0)
    })

    it('handles string comparison correctly', () => {
      const map = createMap<string, number>()
        .set('alpha', 1)
        .set('bravo', 2)
        .set('charlie', 3)
        .set('delta', 4)
      expect(map.keys()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
      expect(map.first()).toEqual(['alpha', 1])
      expect(map.last()).toEqual(['delta', 4])
    })

    it('handles large key range', () => {
      const map = createMap<number, string>()
        .set(Number.MAX_SAFE_INTEGER, 'max')
        .set(Number.MIN_SAFE_INTEGER, 'min')
        .set(0, 'zero')
      expect(map.first()).toEqual([Number.MIN_SAFE_INTEGER, 'min'])
      expect(map.last()).toEqual([Number.MAX_SAFE_INTEGER, 'max'])
    })

    it('from followed by chain of operations', () => {
      const m1 = PersistentMap.from([['a', 1], ['b', 2], ['c', 3]])
      const m2 = m1.delete('b')
      const m3 = m2.set('d', 4)
      expect(m1.entries()).toEqual([['a', 1], ['b', 2], ['c', 3]])
      expect(m2.entries()).toEqual([['a', 1], ['c', 3]])
      expect(m3.entries()).toEqual([['a', 1], ['c', 3], ['d', 4]])
    })

    it('forEach on large map', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 500; i++) map = map.set(i, i * 2)
      let count = 0
      let lastKey = -1
      map.forEach((v, k) => {
        count++
        expect(k).toBeGreaterThan(lastKey)
        expect(v).toBe(k * 2)
        lastKey = k
      })
      expect(count).toBe(500)
    })

    it('iterator on single entry', () => {
      const map = createMap<string, number>().set('only', 42)
      expect([...map]).toEqual([['only', 42]])
    })

    it('large map persistence snapshots', () => {
      const snapshots: PersistentMap<number, number>[] = []
      let map = createMap<number, number>()
      for (let i = 0; i < 200; i++) {
        map = map.set(i, i)
        if (i % 20 === 19) snapshots.push(map)
      }
      expect(snapshots.length).toBe(10)
      for (let s = 0; s < snapshots.length; s++) {
        expect(snapshots[s]!.size).toBe((s + 1) * 20)
      }
    })

    it('delete non-existent does not create new instance', () => {
      const m = createMap<string, number>().set('a', 1)
      const result = m.delete('nonexistent')
      expect(result).toBe(m)
    })

    it('entries after overwrite maintain order', () => {
      const map = createMap<number, string>()
        .set(2, 'b')
        .set(1, 'a')
        .set(3, 'c')
        .set(2, 'B')
      expect(map.entries()).toEqual([[1, 'a'], [2, 'B'], [3, 'c']])
    })

    it('values reflect overwrites', () => {
      const map = createMap<string, number>()
        .set('a', 1)
        .set('b', 2)
        .set('a', 10)
      expect(map.values()).toEqual([10, 2])
    })

    it('works with Map-like entries pattern', () => {
      const entries: [string, number][] = [['x', 10], ['y', 20], ['z', 30]]
      const map = PersistentMap.from(entries)
      const result = map.entries()
      expect(result).toEqual([['x', 10], ['y', 20], ['z', 30]])
    })

    it('from with empty iterable', () => {
      const map = PersistentMap.from<number, string>([])
      expect(map.size).toBe(0)
    })

    it('stats on empty map has height 0', () => {
      expect(createMap<string, number>().stats().height).toBe(0)
    })

    it('balancing works with sequential inserts', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 1000; i++) map = map.set(i, i)
      const stats = map.stats()
      expect(stats.height).toBeLessThanOrEqual(20)
    })

    it('balancing works with reverse sequential inserts', () => {
      let map = createMap<number, number>()
      for (let i = 999; i >= 0; i--) map = map.set(i, i)
      const stats = map.stats()
      expect(stats.height).toBeLessThanOrEqual(20)
    })
  })
})
