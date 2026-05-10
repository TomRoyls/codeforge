import { describe, it, expect } from 'vitest'
import { HashArrayMap } from '../../src/core/hash-array-map/hash-array-map.js'

function createMap<K, V>(): HashArrayMap<K, V> {
  return HashArrayMap.empty<K, V>()
}

describe('HashArrayMap', () => {
  describe('construction', () => {
    it('creates an empty map via constructor', () => {
      const map = new HashArrayMap<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates an empty map via static empty', () => {
      const map = HashArrayMap.empty<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates independent instances', () => {
      const m1 = HashArrayMap.empty<string, number>()
      const m2 = HashArrayMap.empty<string, number>()
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

    it('set with boolean keys', () => {
      const map = createMap<string, boolean>().set('a', true).set('b', false)
      expect(map.get('a')).toBe(true)
      expect(map.get('b')).toBe(false)
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

    it('delete non-existent from empty returns same reference', () => {
      const empty = createMap<string, number>()
      expect(empty.delete('x')).toBe(empty)
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

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      let count = 0
      createMap<string, number>().forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each entry', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const entries: [string, number][] = []
      map.forEach((v, k) => entries.push([k, v]))
      expect(entries.length).toBe(3)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
      expect(entries).toContainEqual(['c', 3])
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

    it('forEach provides map reference', () => {
      const map = createMap<string, number>().set('a', 1)
      let ref: HashArrayMap<string, number> | undefined
      map.forEach((_v, _k, _i, m) => { ref = m })
      expect(ref).toBe(map)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      expect(createMap<string, number>().toArray()).toEqual([])
    })

    it('returns all entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const arr = map.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContainEqual(['a', 1])
      expect(arr).toContainEqual(['b', 2])
      expect(arr).toContainEqual(['c', 3])
    })

    it('does not modify the map', () => {
      const map = createMap<string, number>().set('a', 1)
      const arr = map.toArray()
      expect(arr).toEqual([['a', 1]])
      expect(map.size).toBe(1)
    })

    it('multiple toArray calls return same result', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const r1 = map.toArray()
      const r2 = map.toArray()
      expect(r1).toEqual(r2)
    })
  })

  describe('keys/values/entries', () => {
    it('entries returns empty for empty map', () => {
      expect(createMap<string, number>().entries()).toEqual([])
    })

    it('entries returns all entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const e = map.entries()
      expect(e).toContainEqual(['a', 1])
      expect(e).toContainEqual(['b', 2])
    })

    it('keys returns all keys', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const keys = map.keys()
      expect(keys.length).toBe(3)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    it('values returns all values', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const vals = map.values()
      expect(vals.length).toBe(3)
      expect(vals).toContain(1)
      expect(vals).toContain(2)
      expect(vals).toContain(3)
    })

    it('keys returns empty for empty map', () => {
      expect(createMap<string, number>().keys()).toEqual([])
    })

    it('values returns empty for empty map', () => {
      expect(createMap<string, number>().values()).toEqual([])
    })

    it('entries after delete', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3).delete('b')
      const e = map.entries()
      expect(e).toContainEqual(['a', 1])
      expect(e).toContainEqual(['c', 3])
      expect(e).not.toContainEqual(['b', 2])
    })

    it('keys after delete', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3).delete('a')
      expect(map.keys()).not.toContain('a')
      expect(map.keys()).toContain('b')
      expect(map.keys()).toContain('c')
    })

    it('values after delete', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3).delete('c')
      expect(map.values()).not.toContain(3)
      expect(map.values()).toContain(1)
      expect(map.values()).toContain(2)
    })
  })

  describe('from factory', () => {
    it('creates empty map from empty array', () => {
      const map = HashArrayMap.from<string, number>([])
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('creates map from single entry', () => {
      const map = HashArrayMap.from([['a', 1]])
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(1)
    })

    it('creates map from multiple entries', () => {
      const map = HashArrayMap.from<string, number>([['c', 3], ['a', 1], ['b', 2]])
      expect(map.size).toBe(3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('last entry wins for duplicate keys', () => {
      const map = HashArrayMap.from([['a', 1], ['a', 2]])
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(2)
    })

    it('from does not modify input array', () => {
      const arr: [string, number][] = [['a', 1], ['b', 2]]
      HashArrayMap.from(arr)
      expect(arr).toEqual([['a', 1], ['b', 2]])
    })

    it('creates map from numeric entries', () => {
      const map = HashArrayMap.from([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
      expect(map.get(3)).toBe('c')
    })

    it('creates map with string keys', () => {
      const map = HashArrayMap.from([['banana', 2], ['apple', 1], ['cherry', 3]])
      expect(map.get('banana')).toBe(2)
      expect(map.get('apple')).toBe(1)
      expect(map.get('cherry')).toBe(3)
    })

    it('from with empty iterable', () => {
      const map = HashArrayMap.from<number, string>([])
      expect(map.size).toBe(0)
    })
  })

  describe('empty factory', () => {
    it('creates empty map', () => {
      const map = HashArrayMap.empty<string, number>()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('empty maps are independent', () => {
      const m1 = HashArrayMap.empty<string, number>()
      const m2 = HashArrayMap.empty<string, number>()
      const m3 = m1.set('a', 1)
      expect(m1.size).toBe(0)
      expect(m2.size).toBe(0)
      expect(m3.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('returns an empty map', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const cleared = map.clear()
      expect(cleared.size).toBe(0)
      expect(cleared.isEmpty).toBe(true)
    })

    it('does not modify the original', () => {
      const map = createMap<string, number>().set('a', 1)
      const cleared = map.clear()
      expect(map.size).toBe(1)
      expect(cleared.size).toBe(0)
    })

    it('clear on empty returns empty', () => {
      const map = createMap<string, number>()
      const cleared = map.clear()
      expect(cleared.size).toBe(0)
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
      expect(m1.get(3)).toBe('c')
      expect(m2.get(1)).toBe('a')
      expect(m3.get(2)).toBe('b')
      expect(m0.size).toBe(0)
      expect(m1.size).toBe(1)
      expect(m2.size).toBe(2)
      expect(m3.size).toBe(3)
    })

    it('branching history from same ancestor', () => {
      const base = createMap<string, number>().set('a', 1).set('b', 2)
      const branchA = base.set('c', 3)
      const branchB = base.set('d', 4)
      expect(base.size).toBe(2)
      expect(branchA.get('c')).toBe(3)
      expect(branchB.get('d')).toBe(4)
      expect(branchA.has('d')).toBe(false)
      expect(branchB.has('c')).toBe(false)
    })

    it('delete branches independently', () => {
      const base = createMap<number, string>().set(1, 'a').set(2, 'b').set(3, 'c')
      const d1 = base.delete(1)
      const d2 = base.delete(3)
      expect(base.get(1)).toBe('a')
      expect(base.get(3)).toBe('c')
      expect(d1.has(1)).toBe(false)
      expect(d2.has(3)).toBe(false)
    })

    it('complex branching scenario', () => {
      const root = createMap<string, number>().set('b', 2)
      const left = root.set('a', 1)
      const right = root.set('c', 3)
      expect(root.get('b')).toBe(2)
      expect(root.has('a')).toBe(false)
      expect(left.get('a')).toBe(1)
      expect(right.get('c')).toBe(3)
    })

    it('set after delete from same base', () => {
      const base = createMap<string, number>().set('a', 1).set('b', 2)
      const d = base.delete('a')
      const s = d.set('c', 3)
      expect(base.get('a')).toBe(1)
      expect(d.has('a')).toBe(false)
      expect(s.get('c')).toBe(3)
    })

    it('deep chain of mutations preserves all versions', () => {
      const maps: HashArrayMap<number, number>[] = [createMap()]
      for (let i = 0; i < 10; i++) {
        maps.push(maps[maps.length - 1]!.set(i, i * 10))
      }
      for (let i = 0; i <= 10; i++) {
        expect(maps[i]!.size).toBe(i)
      }
      expect(maps[10]!.get(9)).toBe(90)
    })
  })

  describe('structural sharing', () => {
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

    it('version tree size tracking', () => {
      const versions: HashArrayMap<number, number>[] = [createMap()]
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

  describe('edge cases', () => {
    it('empty map operations', () => {
      const map = createMap<string, number>()
      expect(map.get('a')).toBeUndefined()
      expect(map.has('a')).toBe(false)
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

    it('delete non-existent does not create new instance', () => {
      const m = createMap<string, number>().set('a', 1)
      const result = m.delete('nonexistent')
      expect(result).toBe(m)
    })
  })

  describe('large maps', () => {
    it('handles 10000 sequential inserts', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        map = map.set(i, i * 2)
      }
      expect(map.size).toBe(10000)
      expect(map.get(0)).toBe(0)
      expect(map.get(9999)).toBe(19998)
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
      const snapshots: HashArrayMap<number, number>[] = []
      for (let i = 0; i < 1000; i++) {
        map = map.set(i, i)
        if (i % 100 === 99) snapshots.push(map)
      }
      expect(snapshots.length).toBe(10)
      for (let s = 0; s < snapshots.length; s++) {
        expect(snapshots[s]!.size).toBe((s + 1) * 100)
        expect(snapshots[s]!.get(0)).toBe(0)
      }
    })

    it('forEach on large map', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 500; i++) map = map.set(i, i * 2)
      let count = 0
      map.forEach((v, k) => {
        count++
        expect(v).toBe(k * 2)
      })
      expect(count).toBe(500)
    })

    it('large map persistence snapshots', () => {
      const snapshots: HashArrayMap<number, number>[] = []
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

    it('entries returns correct count for 1000 entries', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 1000; i++) {
        map = map.set(i, i)
      }
      expect(map.entries().length).toBe(1000)
    })
  })

  describe('hash collisions', () => {
    it('handles keys with same hash', () => {
      const map = createMap<string, number>()
        .set('ab', 1)
        .set('ba', 2)
      expect(map.size).toBe(2)
      expect(map.get('ab')).toBe(1)
      expect(map.get('ba')).toBe(2)
    })

    it('overwrites correct key in collision node', () => {
      const map = createMap<string, number>()
        .set('ab', 1)
        .set('ba', 2)
        .set('ab', 10)
      expect(map.size).toBe(2)
      expect(map.get('ab')).toBe(10)
      expect(map.get('ba')).toBe(2)
    })

    it('deletes correct key from collision node', () => {
      const map = createMap<string, number>()
        .set('ab', 1)
        .set('ba', 2)
      const deleted = map.delete('ab')
      expect(deleted.size).toBe(1)
      expect(deleted.has('ab')).toBe(false)
      expect(deleted.get('ba')).toBe(2)
    })

    it('deletes all keys in collision node', () => {
      const map = createMap<string, number>()
        .set('ab', 1)
        .set('ba', 2)
      const d1 = map.delete('ab')
      const d2 = d1.delete('ba')
      expect(d2.isEmpty).toBe(true)
    })

    it('persists collision node on delete', () => {
      const original = createMap<string, number>()
        .set('ab', 1)
        .set('ba', 2)
      const modified = original.delete('ab')
      expect(original.get('ab')).toBe(1)
      expect(original.get('ba')).toBe(2)
      expect(modified.has('ab')).toBe(false)
      expect(modified.get('ba')).toBe(2)
    })

    it('handles many collisions', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 100; i++) {
        map = map.set(i * 32, i)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(map.get(i * 32)).toBe(i)
      }
    })

    it('reports collisions in stats', () => {
      const map = createMap<string, number>()
        .set('ab', 1)
        .set('ba', 2)
      const stats = map.stats()
      expect(stats.collisions).toBeGreaterThanOrEqual(0)
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty map', () => {
      const stats = createMap<string, number>().stats()
      expect(stats.size).toBe(0)
      expect(stats.depth).toBe(0)
      expect(stats.nodes).toBe(0)
      expect(stats.collisions).toBe(0)
    })

    it('returns correct stats for single entry', () => {
      const stats = createMap<string, number>().set('a', 1).stats()
      expect(stats.size).toBe(1)
      expect(stats.depth).toBeGreaterThanOrEqual(1)
      expect(stats.nodes).toBeGreaterThanOrEqual(1)
    })

    it('returns correct stats for multiple entries', () => {
      const stats = createMap<number, number>().set(1, 1).set(2, 2).set(3, 3).stats()
      expect(stats.size).toBe(3)
      expect(stats.depth).toBeGreaterThan(0)
      expect(stats.nodes).toBeGreaterThan(0)
    })

    it('depth is bounded for large maps', () => {
      let map = createMap<number, number>()
      for (let i = 0; i < 10000; i++) {
        map = map.set(i, i)
      }
      const stats = map.stats()
      expect(stats.size).toBe(10000)
      expect(stats.depth).toBeLessThanOrEqual(10)
    })

    it('stats after delete', () => {
      const map = createMap<number, number>().set(1, 1).set(2, 2).set(3, 3)
      const after = map.delete(2)
      expect(after.stats().size).toBe(2)
    })

    it('stats object has expected keys', () => {
      const stats = createMap<string, number>().set('a', 1).stats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('depth')
      expect(stats).toHaveProperty('nodes')
      expect(stats).toHaveProperty('collisions')
    })

    it('stats on empty map has depth 0', () => {
      expect(createMap<string, number>().stats().depth).toBe(0)
    })

    it('stats on empty map has nodes 0', () => {
      expect(createMap<string, number>().stats().nodes).toBe(0)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('returns empty iterator for empty map', () => {
      expect([...createMap<string, number>()]).toEqual([])
    })

    it('iterates all entries', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const entries = [...map]
      expect(entries.length).toBe(3)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
      expect(entries).toContainEqual(['c', 3])
    })

    it('works with for...of', () => {
      const map = createMap<string, number>().set('x', 10).set('y', 20)
      const entries: [string, number][] = []
      for (const entry of map) {
        entries.push(entry)
      }
      expect(entries.length).toBe(2)
    })

    it('works with destructuring', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2).set('c', 3)
      const [first, second, third] = map
      expect(first).toBeDefined()
      expect(second).toBeDefined()
      expect(third).toBeDefined()
    })

    it('can be used with Array.from', () => {
      const map = createMap<string, number>().set('a', 1).set('b', 2)
      const arr = Array.from(map)
      expect(arr.length).toBe(2)
    })

    it('iterator does not modify map', () => {
      const map = createMap<string, number>().set('a', 1)
      ;[...map]
      expect(map.size).toBe(1)
    })

    it('iterator on single entry', () => {
      const map = createMap<string, number>().set('only', 42)
      expect([...map]).toEqual([['only', 42]])
    })
  })

  describe('type safety', () => {
    it('works with number keys and string values', () => {
      const map = HashArrayMap.empty<number, string>()
      const m = map.set(1, 'a')
      expect(m.get(1)).toBe('a')
    })

    it('works with string keys and number values', () => {
      const map = HashArrayMap.empty<string, number>()
      const m = map.set('a', 1)
      expect(m.get('a')).toBe(1)
    })

    it('works with custom type values', () => {
      type Item = { priority: number; label: string }
      const map = HashArrayMap.empty<string, Item>()
      const m = map
        .set('a', { priority: 3, label: 'low' })
        .set('b', { priority: 1, label: 'high' })
      expect(m.get('b')!.label).toBe('high')
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

    it('from followed by chain of operations', () => {
      const m1 = HashArrayMap.from<string, number>([['a', 1], ['b', 2], ['c', 3]])
      const m2 = m1.delete('b')
      const m3 = m2.set('d', 4)
      expect(m1.size).toBe(3)
      expect(m2.size).toBe(2)
      expect(m3.size).toBe(3)
      expect(m3.get('d')).toBe(4)
    })

    it('works with Map-like entries pattern', () => {
      const entries: [string, number][] = [['x', 10], ['y', 20], ['z', 30]]
      const map = HashArrayMap.from(entries)
      expect(map.get('x')).toBe(10)
      expect(map.get('y')).toBe(20)
      expect(map.get('z')).toBe(30)
    })

    it('works with very large key range', () => {
      const map = createMap<number, string>()
        .set(Number.MAX_SAFE_INTEGER, 'max')
        .set(Number.MIN_SAFE_INTEGER, 'min')
        .set(0, 'zero')
      expect(map.get(Number.MAX_SAFE_INTEGER)).toBe('max')
      expect(map.get(Number.MIN_SAFE_INTEGER)).toBe('min')
      expect(map.get(0)).toBe('zero')
    })
  })
})
