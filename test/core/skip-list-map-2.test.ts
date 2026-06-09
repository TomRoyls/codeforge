import { describe, it, expect } from 'vitest'
import { SkipListMap2 as SkipListMap } from '../../src/core/skip-list-map-2/index.js'

function createFilled(entries: [number, string][]): SkipListMap<number, string> {
  const map = new SkipListMap<number, string>()
  for (const [k, v] of entries) {
    map.set(k, v)
  }
  return map
}

describe('SkipListMap', () => {
  describe('constructor', () => {
    it('creates empty map', () => {
      const map = new SkipListMap()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('accepts custom maxLevel', () => {
      const map = new SkipListMap<number, string>({ maxLevel: 16 })
      expect(map.size).toBe(0)
    })

    it('accepts custom probability', () => {
      const map = new SkipListMap<number, string>({ probability: 0.25 })
      expect(map.size).toBe(0)
    })

    it('accepts custom comparator', () => {
      const reverseComp = (a: number, b: number): number => b - a
      const map = new SkipListMap<number, string>({ comparator: reverseComp })
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.toArray()).toEqual([[3, 'c'], [2, 'b'], [1, 'a']])
    })
  })

  describe('set and get', () => {
    it('sets and gets a single entry', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      expect(map.get(1)).toBe('one')
    })

    it('returns undefined for missing key', () => {
      const map = new SkipListMap<number, string>()
      expect(map.get(99)).toBeUndefined()
    })

    it('updates existing key', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.get(1)).toBe('uno')
      expect(map.size).toBe(1)
    })

    it('maintains sorted order', () => {
      const map = createFilled([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('handles many insertions', () => {
      const map = new SkipListMap<number, number>()
      const count = 100
      for (let i = count; i >= 1; i--) {
        map.set(i, i * 10)
      }
      expect(map.size).toBe(count)
      for (let i = 1; i <= count; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
    })

    it('handles duplicate keys correctly', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      map.set(1, 'c')
      expect(map.size).toBe(1)
      expect(map.get(1)).toBe('c')
    })

    it('handles string keys', () => {
      const map = new SkipListMap<string, number>()
      map.set('banana', 2)
      map.set('apple', 1)
      map.set('cherry', 3)
      expect(map.get('apple')).toBe(1)
      expect(map.get('banana')).toBe(2)
      expect(map.get('cherry')).toBe(3)
    })

    it('handles zero as key', () => {
      const map = new SkipListMap<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
    })

    it('handles negative keys', () => {
      const map = createFilled([[-1, 'neg'], [0, 'zero'], [1, 'pos']])
      expect(map.toArray()).toEqual([[-1, 'neg'], [0, 'zero'], [1, 'pos']])
    })

    it('handles float keys', () => {
      const map = createFilled([[1.5, 'a'], [2.5, 'b'], [0.5, 'c']])
      expect(map.toArray()).toEqual([[0.5, 'c'], [1.5, 'a'], [2.5, 'b']])
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new SkipListMap<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('returns false after deletion', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })

    it('returns true for updated key', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'one')
      map.set(1, 'uno')
      expect(map.has(1)).toBe(true)
    })

    it('returns false on empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.has(42)).toBe(false)
    })
  })

  describe('delete', () => {
    it('deletes an existing key', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(map.delete(2)).toBe(true)
      expect(map.get(2)).toBeUndefined()
      expect(map.size).toBe(2)
    })

    it('returns false for missing key', () => {
      const map = new SkipListMap<number, string>()
      expect(map.delete(99)).toBe(false)
    })

    it('deletes first element', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      map.delete(1)
      expect(map.toArray()).toEqual([[2, 'b'], [3, 'c']])
    })

    it('deletes last element', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      map.delete(3)
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b']])
    })

    it('deletes only element', () => {
      const map = createFilled([[1, 'a']])
      map.delete(1)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('deletes all elements sequentially', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      map.delete(1)
      map.delete(2)
      map.delete(3)
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('deletes all elements in reverse', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      map.delete(3)
      map.delete(2)
      map.delete(1)
      expect(map.size).toBe(0)
    })

    it('maintains order after deletions', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd'], [5, 'e']])
      map.delete(2)
      map.delete(4)
      expect(map.toArray()).toEqual([[1, 'a'], [3, 'c'], [5, 'e']])
    })

    it('handles delete on empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.delete(1)).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('clear on empty map is no-op', () => {
      const map = new SkipListMap<number, string>()
      map.clear()
      expect(map.size).toBe(0)
    })

    it('allows set after clear', () => {
      const map = createFilled([[1, 'a']])
      map.clear()
      map.set(2, 'b')
      expect(map.size).toBe(1)
      expect(map.get(2)).toBe('b')
    })
  })

  describe('size and isEmpty', () => {
    it('size reflects number of entries', () => {
      const map = new SkipListMap<number, string>()
      expect(map.size).toBe(0)
      map.set(1, 'a')
      expect(map.size).toBe(1)
      map.set(2, 'b')
      expect(map.size).toBe(2)
    })

    it('isEmpty is true when empty', () => {
      const map = new SkipListMap<number, string>()
      expect(map.isEmpty()).toBe(true)
    })

    it('isEmpty is false when not empty', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'a')
      expect(map.isEmpty()).toBe(false)
    })

    it('isEmpty after delete all', () => {
      const map = createFilled([[1, 'a']])
      map.delete(1)
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('min and max', () => {
    it('min returns smallest key', () => {
      const map = createFilled([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(map.min()).toBe(1)
    })

    it('max returns largest key', () => {
      const map = createFilled([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(map.max()).toBe(3)
    })

    it('min returns undefined on empty', () => {
      const map = new SkipListMap<number, string>()
      expect(map.min()).toBeUndefined()
    })

    it('max returns undefined on empty', () => {
      const map = new SkipListMap<number, string>()
      expect(map.max()).toBeUndefined()
    })

    it('min equals max with single entry', () => {
      const map = createFilled([[5, 'five']])
      expect(map.min()).toBe(5)
      expect(map.max()).toBe(5)
    })

    it('minEntry returns [key, value]', () => {
      const map = createFilled([[3, 'c'], [1, 'a']])
      expect(map.minEntry()).toEqual([1, 'a'])
    })

    it('maxEntry returns [key, value]', () => {
      const map = createFilled([[3, 'c'], [1, 'a']])
      expect(map.maxEntry()).toEqual([3, 'c'])
    })

    it('minEntry undefined on empty', () => {
      const map = new SkipListMap<number, string>()
      expect(map.minEntry()).toBeUndefined()
    })

    it('maxEntry undefined on empty', () => {
      const map = new SkipListMap<number, string>()
      expect(map.maxEntry()).toBeUndefined()
    })
  })

  describe('floor and ceiling', () => {
    const map = createFilled([[1, 'a'], [3, 'c'], [5, 'e'], [7, 'g']])

    it('floor returns exact match', () => {
      expect(map.floor(3)).toBe(3)
    })

    it('floor returns lower key when no exact match', () => {
      expect(map.floor(4)).toBe(3)
    })

    it('floor returns undefined when all keys are greater', () => {
      expect(map.floor(0)).toBeUndefined()
    })

    it('floor returns max when key exceeds all', () => {
      expect(map.floor(10)).toBe(7)
    })

    it('ceiling returns exact match', () => {
      expect(map.ceiling(5)).toBe(5)
    })

    it('ceiling returns higher key when no exact match', () => {
      expect(map.ceiling(4)).toBe(5)
    })

    it('ceiling returns undefined when all keys are less', () => {
      expect(map.ceiling(10)).toBeUndefined()
    })

    it('ceiling returns min when key below all', () => {
      expect(map.ceiling(0)).toBe(1)
    })

    it('floorEntry returns entry', () => {
      expect(map.floorEntry(4)).toEqual([3, 'c'])
    })

    it('ceilingEntry returns entry', () => {
      expect(map.ceilingEntry(4)).toEqual([5, 'e'])
    })

    it('floor on empty map', () => {
      const empty = new SkipListMap<number, string>()
      expect(empty.floor(1)).toBeUndefined()
    })

    it('ceiling on empty map', () => {
      const empty = new SkipListMap<number, string>()
      expect(empty.ceiling(1)).toBeUndefined()
    })
  })

  describe('lower and higher', () => {
    const map = createFilled([[1, 'a'], [3, 'c'], [5, 'e'], [7, 'g']])

    it('lower returns strictly less key', () => {
      expect(map.lower(5)).toBe(3)
    })

    it('lower with exact match returns predecessor', () => {
      expect(map.lower(3)).toBe(1)
    })

    it('lower returns undefined for key <= min', () => {
      expect(map.lower(1)).toBeUndefined()
    })

    it('lower for key below min', () => {
      expect(map.lower(0)).toBeUndefined()
    })

    it('higher returns strictly greater key', () => {
      expect(map.higher(3)).toBe(5)
    })

    it('higher with exact match returns successor', () => {
      expect(map.higher(5)).toBe(7)
    })

    it('higher returns undefined for key >= max', () => {
      expect(map.higher(7)).toBeUndefined()
    })

    it('higher for key above max', () => {
      expect(map.higher(10)).toBeUndefined()
    })

    it('lowerEntry returns entry', () => {
      expect(map.lowerEntry(5)).toEqual([3, 'c'])
    })

    it('higherEntry returns entry', () => {
      expect(map.higherEntry(3)).toEqual([5, 'e'])
    })

    it('lower on empty map', () => {
      const empty = new SkipListMap<number, string>()
      expect(empty.lower(1)).toBeUndefined()
    })

    it('higher on empty map', () => {
      const empty = new SkipListMap<number, string>()
      expect(empty.higher(1)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('returns entries in range', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd'], [5, 'e']])
      expect([...map.range(2, 4)]).toEqual([[2, 'b'], [3, 'c'], [4, 'd']])
    })

    it('returns single entry range', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect([...map.range(2, 2)]).toEqual([[2, 'b']])
    })

    it('returns empty for no matching range', () => {
      const map = createFilled([[1, 'a'], [5, 'e']])
      expect([...map.range(2, 4)]).toEqual([])
    })

    it('range includes endpoints', () => {
      const map = createFilled([[1, 'a'], [3, 'c'], [5, 'e']])
      expect([...map.range(1, 5)]).toEqual([[1, 'a'], [3, 'c'], [5, 'e']])
    })

    it('range on empty map', () => {
      const map = new SkipListMap<number, string>()
      expect([...map.range(1, 5)]).toEqual([])
    })

    it('rangeEntries yields same as range', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect([...map.rangeEntries(1, 3)]).toEqual([...map.range(1, 3)])
    })
  })

  describe('indexOf', () => {
    it('returns 0 for first element', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(map.indexOf(1)).toBe(0)
    })

    it('returns correct index for middle element', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(map.indexOf(2)).toBe(1)
    })

    it('returns last index', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(map.indexOf(3)).toBe(2)
    })

    it('returns -1 for missing key', () => {
      const map = createFilled([[1, 'a'], [2, 'b']])
      expect(map.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.indexOf(1)).toBe(-1)
    })

    it('updates index after deletion', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      map.delete(1)
      expect(map.indexOf(2)).toBe(0)
      expect(map.indexOf(3)).toBe(1)
    })
  })

  describe('at', () => {
    it('returns entry at index 0', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(map.at(0)).toEqual([1, 'a'])
    })

    it('returns entry at middle index', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(map.at(1)).toEqual([2, 'b'])
    })

    it('returns entry at last index', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(map.at(2)).toEqual([3, 'c'])
    })

    it('returns undefined for negative index', () => {
      const map = createFilled([[1, 'a']])
      expect(map.at(-1)).toBeUndefined()
    })

    it('returns undefined for out of bounds', () => {
      const map = createFilled([[1, 'a']])
      expect(map.at(5)).toBeUndefined()
    })

    it('returns undefined on empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.at(0)).toBeUndefined()
    })
  })

  describe('keys, values, entries', () => {
    it('keys returns all keys in order', () => {
      const map = createFilled([[3, 'c'], [1, 'a'], [2, 'b']])
      expect([...map.keys()]).toEqual([1, 2, 3])
    })

    it('values returns all values in key order', () => {
      const map = createFilled([[3, 'c'], [1, 'a'], [2, 'b']])
      expect([...map.values()]).toEqual(['a', 'b', 'c'])
    })

    it('entries returns all entries in order', () => {
      const map = createFilled([[3, 'c'], [1, 'a'], [2, 'b']])
      expect([...map.entries()]).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('keys on empty map', () => {
      const map = new SkipListMap<number, string>()
      expect([...map.keys()]).toEqual([])
    })

    it('values on empty map', () => {
      const map = new SkipListMap<number, string>()
      expect([...map.values()]).toEqual([])
    })

    it('entries on empty map', () => {
      const map = new SkipListMap<number, string>()
      expect([...map.entries()]).toEqual([])
    })
  })

  describe('toArray', () => {
    it('returns array of entries', () => {
      const map = createFilled([[2, 'b'], [1, 'a']])
      expect(map.toArray()).toEqual([[1, 'a'], [2, 'b']])
    })

    it('returns empty array for empty map', () => {
      const map = new SkipListMap<number, string>()
      expect(map.toArray()).toEqual([])
    })

    it('returns copy (not same reference)', () => {
      const map = createFilled([[1, 'a']])
      const arr = map.toArray()
      arr.push([99, 'z'])
      expect(map.size).toBe(1)
    })
  })

  describe('forEach', () => {
    it('iterates all entries in order', () => {
      const map = createFilled([[3, 'c'], [1, 'a'], [2, 'b']])
      const collected: [number, string][] = []
      map.forEach((v, k) => collected.push([k, v]))
      expect(collected).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('receives map as third argument', () => {
      const map = createFilled([[1, 'a']])
      let received: SkipListMap<number, string> | undefined
      map.forEach((_v, _k, m) => { received = m })
      expect(received).toBe(map)
    })

    it('does not iterate on empty map', () => {
      const map = new SkipListMap<number, string>()
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const map = createFilled([[2, 'b'], [1, 'a']])
      const result = [...map]
      expect(result).toEqual([[1, 'a'], [2, 'b']])
    })

    it('works in for-of loop', () => {
      const map = createFilled([[1, 'a'], [2, 'b']])
      const keys: number[] = []
      for (const [k] of map) {
        keys.push(k)
      }
      expect(keys).toEqual([1, 2])
    })

    it('empty map yields nothing', () => {
      const map = new SkipListMap<number, string>()
      expect([...map]).toEqual([])
    })
  })

  describe('stress tests', () => {
    it('handles large number of insertions', () => {
      const map = new SkipListMap<number, number>()
      const n = 500
      for (let i = 0; i < n; i++) {
        map.set(i, i)
      }
      expect(map.size).toBe(n)
      for (let i = 0; i < n; i++) {
        expect(map.get(i)).toBe(i)
      }
    })

    it('handles random insertions and lookups', () => {
      const map = new SkipListMap<number, number>()
      const keys = new Set<number>()
      for (let i = 0; i < 200; i++) {
        const k = Math.floor(Math.random() * 1000)
        keys.add(k)
        map.set(k, k * 2)
      }
      expect(map.size).toBe(keys.size)
      for (const k of keys) {
        expect(map.get(k)).toBe(k * 2)
      }
    })

    it('handles interleaved insert and delete', () => {
      const map = new SkipListMap<number, string>()
      for (let i = 0; i < 100; i++) {
        map.set(i, `v${i}`)
      }
      for (let i = 0; i < 50; i++) {
        map.delete(i)
      }
      expect(map.size).toBe(50)
      expect(map.get(0)).toBeUndefined()
      expect(map.get(50)).toBe('v50')
    })

    it('insertions maintain sorted order', () => {
      const map = new SkipListMap<number, number>()
      const shuffled = Array.from({ length: 100 }, (_, i) => i)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = shuffled[i]
        shuffled[i] = shuffled[j]
        shuffled[j] = tmp
      }
      for (const k of shuffled) {
        map.set(k, k)
      }
      const keys = [...map.keys()]
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1])
      }
    })

    it('indexOf consistent with at for many entries', () => {
      const map = new SkipListMap<number, number>()
      for (let i = 0; i < 50; i++) {
        map.set(i * 2, i)
      }
      for (let i = 0; i < 50; i++) {
        const key = i * 2
        const idx = map.indexOf(key)
        expect(idx).toBe(i)
        expect(map.at(idx)).toEqual([key, i])
      }
    })
  })

  describe('custom comparator', () => {
    it('works with reverse comparator', () => {
      const map = new SkipListMap<number, string>({
        comparator: (a, b) => b - a,
      })
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.min()).toBe(3)
      expect(map.max()).toBe(1)
      expect([...map.keys()]).toEqual([3, 2, 1])
    })

    it('works with case-insensitive string comparator', () => {
      const map = new SkipListMap<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      })
      map.set('Banana', 2)
      map.set('apple', 1)
      map.set('Cherry', 3)
      expect([...map.keys()]).toEqual(['apple', 'Banana', 'Cherry'])
    })

    it('works with object keys via custom comparator', () => {
      interface Obj { id: number }
      const map = new SkipListMap<Obj, string>({
        comparator: (a, b) => a.id - b.id,
      })
      map.set({ id: 3 }, 'c')
      map.set({ id: 1 }, 'a')
      map.set({ id: 2 }, 'b')
      const keys = [...map.keys()]
      expect(keys[0].id).toBe(1)
      expect(keys[1].id).toBe(2)
      expect(keys[2].id).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('set/delete/set same key', () => {
      const map = new SkipListMap<number, string>()
      map.set(1, 'a')
      map.delete(1)
      map.set(1, 'b')
      expect(map.get(1)).toBe('b')
      expect(map.size).toBe(1)
    })

    it('operations on single element map', () => {
      const map = createFilled([[42, 'answer']])
      expect(map.min()).toBe(42)
      expect(map.max()).toBe(42)
      expect(map.floor(42)).toBe(42)
      expect(map.ceiling(42)).toBe(42)
      expect(map.lower(42)).toBeUndefined()
      expect(map.higher(42)).toBeUndefined()
      expect(map.indexOf(42)).toBe(0)
      expect(map.at(0)).toEqual([42, 'answer'])
    })

    it('floor/ceiling/lower/higher on single element', () => {
      const map = createFilled([[5, 'five']])
      expect(map.floor(5)).toBe(5)
      expect(map.floor(6)).toBe(5)
      expect(map.floor(4)).toBeUndefined()
      expect(map.ceiling(5)).toBe(5)
      expect(map.ceiling(4)).toBe(5)
      expect(map.ceiling(6)).toBeUndefined()
      expect(map.lower(5)).toBeUndefined()
      expect(map.lower(6)).toBe(5)
      expect(map.higher(5)).toBeUndefined()
      expect(map.higher(4)).toBe(5)
    })

    it('range with same lo and hi that exists', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect([...map.range(2, 2)]).toEqual([[2, 'b']])
    })

    it('range with same lo and hi that does not exist', () => {
      const map = createFilled([[1, 'a'], [3, 'c']])
      expect([...map.range(2, 2)]).toEqual([])
    })

    it('range where lo > hi returns empty', () => {
      const map = createFilled([[1, 'a'], [2, 'b'], [3, 'c']])
      expect([...map.range(3, 1)]).toEqual([])
    })

    it('two element map operations', () => {
      const map = createFilled([[1, 'a'], [3, 'c']])
      expect(map.floor(2)).toBe(1)
      expect(map.ceiling(2)).toBe(3)
      expect(map.lower(2)).toBe(1)
      expect(map.higher(2)).toBe(3)
      expect(map.indexOf(1)).toBe(0)
      expect(map.indexOf(3)).toBe(1)
    })
  })

  describe('generics', () => {
    it('works with string values', () => {
      const map = new SkipListMap<string, number>()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.get('a')).toBe(1)
    })

    it('works with object values', () => {
      const map = new SkipListMap<number, { name: string }>()
      map.set(1, { name: 'one' })
      map.set(2, { name: 'two' })
      expect(map.get(1)?.name).toBe('one')
    })

    it('works with null values', () => {
      const map = new SkipListMap<number, string | null>()
      map.set(1, null)
      expect(map.get(1)).toBeNull()
    })

    it('works with undefined values', () => {
      const map = new SkipListMap<number, string | undefined>()
      map.set(1, undefined)
      expect(map.get(1)).toBeUndefined()
      expect(map.has(1)).toBe(true)
    })
  })

  describe('consistency after mutations', () => {
    it('maintains invariants after many operations', () => {
      const map = new SkipListMap<number, string>()
      const reference = new Map<number, string>()

      for (let i = 0; i < 200; i++) {
        const k = Math.floor(Math.random() * 50)
        const v = `v${k}`
        map.set(k, v)
        reference.set(k, v)
      }

      expect(map.size).toBe(reference.size)

      for (let i = 0; i < 30; i++) {
        const k = Math.floor(Math.random() * 50)
        map.delete(k)
        reference.delete(k)
      }

      expect(map.size).toBe(reference.size)

      for (const k of reference.keys()) {
        expect(map.has(k)).toBe(true)
        expect(map.get(k)).toBe(reference.get(k))
      }

      const sortedKeys = [...reference.keys()].sort((a, b) => a - b)
      expect([...map.keys()]).toEqual(sortedKeys)
    })

    it('at and indexOf are inverse operations', () => {
      const map = new SkipListMap<number, string>()
      const keys = [10, 20, 30, 40, 50]
      for (const k of keys) map.set(k, `v${k}`)

      for (let i = 0; i < map.size; i++) {
        const entry = map.at(i)
        expect(entry).toBeDefined()
        const idx = map.indexOf(entry![0])
        expect(idx).toBe(i)
      }
    })

    it('range results match filter on toArray', () => {
      const map = new SkipListMap<number, string>()
      for (let i = 0; i < 20; i++) map.set(i, `v${i}`)

      const lo = 5
      const hi = 15
      const rangeResult = [...map.range(lo, hi)]
      const filtered = map.toArray().filter(([k]) => k >= lo && k <= hi)
      expect(rangeResult).toEqual(filtered)
    })
  })
})
