import { BTreeMap, DEFAULT_BTREEMAP_ORDER } from '../src/core/b-tree-map/b-tree-map.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BTreeMap', () => {
  describe('constructor', () => {
    it('creates an empty map with default order', () => {
      const map = new BTreeMap<number, string>()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('creates a map with custom order', () => {
      const map = new BTreeMap<number, string>(5)
      map.set(1, 'a')
      expect(map.size()).toBe(1)
    })

    it('creates a map with minimum order 2', () => {
      const map = new BTreeMap<number, string>(2)
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.size()).toBe(2)
      expect(map.get(1)).toBe('a')
      expect(map.get(2)).toBe('b')
    })

    it('throws Error for order less than 2', () => {
      expect(() => new BTreeMap<number, string>(1)).toThrow('B-Tree order must be at least 2')
      expect(() => new BTreeMap<number, string>(0)).toThrow('B-Tree order must be at least 2')
      expect(() => new BTreeMap<number, string>(-1)).toThrow('B-Tree order must be at least 2')
    })

    it('creates a map with custom comparator', () => {
      const map = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      map.set('banana', 2)
      map.set('apple', 1)
      map.set('cherry', 3)
      expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('creates a map with high order', () => {
      const map = new BTreeMap<number, number>(100)
      for (let i = 0; i < 200; i++) {
        map.set(i, i)
      }
      expect(map.size()).toBe(200)
    })

    it('exports DEFAULT_BTREEMAP_ORDER as 3', () => {
      expect(DEFAULT_BTREEMAP_ORDER).toBe(3)
    })

    it('creates a map with order and comparator combined', () => {
      const reverseMap = new BTreeMap<number, string>(4, (a, b) => b - a)
      reverseMap.set(1, 'one')
      reverseMap.set(2, 'two')
      reverseMap.set(3, 'three')
      expect(reverseMap.keys()).toEqual([3, 2, 1])
    })
  })

  // ─── Set ───────────────────────────────────────────────────────────────

  describe('set', () => {
    it('sets a single key-value pair', () => {
      const map = new BTreeMap<number, string>()
      map.set(10, 'ten')
      expect(map.size()).toBe(1)
      expect(map.get(10)).toBe('ten')
    })

    it('sets multiple keys maintaining sorted order', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'five')
      map.set(3, 'three')
      map.set(7, 'seven')
      map.set(1, 'one')
      map.set(9, 'nine')
      expect(map.keys()).toEqual([1, 3, 5, 7, 9])
    })

    it('updates value when setting duplicate key', () => {
      const map = new BTreeMap<number, string>()
      map.set(10, 'ten')
      map.set(10, 'TEN')
      expect(map.size()).toBe(1)
      expect(map.get(10)).toBe('TEN')
    })

    it('does not increase size on duplicate key update', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      map.set(1, 'c')
      expect(map.size()).toBe(1)
    })

    it('sets keys in ascending order', () => {
      const map = new BTreeMap<number, number>()
      for (let i = 1; i <= 20; i++) {
        map.set(i, i * 10)
      }
      const entries = map.entries()
      expect(entries.length).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(entries[i]![0]).toBe(i + 1)
        expect(entries[i]![1]).toBe((i + 1) * 10)
      }
    })

    it('sets keys in descending order', () => {
      const map = new BTreeMap<number, number>()
      for (let i = 20; i >= 1; i--) {
        map.set(i, i * 10)
      }
      const entries = map.entries()
      expect(entries.length).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(entries[i]![0]).toBe(i + 1)
      }
    })

    it('handles many elements with order 3', () => {
      const map = new BTreeMap<number, number>(3)
      for (let i = 0; i < 100; i++) {
        map.set(i, i)
      }
      expect(map.size()).toBe(100)
      const keys = map.keys()
      for (let i = 0; i < 100; i++) {
        expect(keys[i]).toBe(i)
      }
    })

    it('handles many elements with order 5', () => {
      const map = new BTreeMap<number, number>(5)
      for (let i = 0; i < 50; i++) {
        map.set(i, i * 2)
      }
      expect(map.size()).toBe(50)
    })

    it('handles null values', () => {
      const map = new BTreeMap<number, null>()
      map.set(1, null)
      map.set(2, null)
      expect(map.get(1)).toBe(null)
      expect(map.size()).toBe(2)
    })

    it('handles object values', () => {
      const map = new BTreeMap<number, { name: string }>()
      map.set(1, { name: 'a' })
      map.set(2, { name: 'b' })
      expect(map.get(1)!.name).toBe('a')
      expect(map.get(2)!.name).toBe('b')
    })

    it('handles string keys with custom comparator', () => {
      const map = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      map.set('delta', 4)
      map.set('alpha', 1)
      map.set('charlie', 3)
      map.set('bravo', 2)
      expect(map.keys()).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
    })
  })

  // ─── Get ───────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns value for existing key', () => {
      const map = new BTreeMap<number, string>()
      map.set(42, 'answer')
      expect(map.get(42)).toBe('answer')
    })

    it('returns undefined for non-existing key', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      expect(map.get(99)).toBeUndefined()
    })

    it('returns undefined on empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.get(1)).toBeUndefined()
    })

    it('finds keys after many inserts', () => {
      const map = new BTreeMap<number, number>()
      for (let i = 0; i < 100; i++) {
        map.set(i, i * 100)
      }
      expect(map.get(0)).toBe(0)
      expect(map.get(50)).toBe(5000)
      expect(map.get(99)).toBe(9900)
      expect(map.get(100)).toBeUndefined()
    })

    it('returns updated value after set overwrite', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'old')
      map.set(5, 'new')
      expect(map.get(5)).toBe('new')
    })
  })

  // ─── Has ───────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.has(1)).toBe(true)
    })

    it('returns false for non-existing key', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.has(2)).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.has(1)).toBe(false)
    })

    it('returns true after value update', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'five')
      map.set(5, 'FIVE')
      expect(map.has(5)).toBe(true)
    })

    it('returns false after delete', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.delete(1)
      expect(map.has(1)).toBe(false)
    })
  })

  // ─── Delete ────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a key from a leaf node', () => {
      const map = new BTreeMap<number, string>()
      map.set(10, 'ten')
      expect(map.delete(10)).toBe(true)
      expect(map.size()).toBe(0)
      expect(map.has(10)).toBe(false)
    })

    it('returns false when deleting from empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.delete(1)).toBe(false)
    })

    it('returns false when deleting non-existing key', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.delete(99)).toBe(false)
      expect(map.size()).toBe(1)
    })

    it('deletes multiple keys and maintains order', () => {
      const map = new BTreeMap<number, string>(3)
      map.set(1, 'one')
      map.set(2, 'two')
      map.set(3, 'three')
      map.set(4, 'four')
      map.set(5, 'five')
      map.delete(3)
      expect(map.size()).toBe(4)
      expect(map.keys()).toEqual([1, 2, 4, 5])
    })

    it('deletes all keys leaving empty map', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      expect(map.delete(2)).toBe(true)
      expect(map.delete(1)).toBe(true)
      expect(map.delete(3)).toBe(true)
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('deletes from internal node', () => {
      const map = new BTreeMap<number, string>(3)
      for (let i = 1; i <= 10; i++) {
        map.set(i, `v${i}`)
      }
      expect(map.delete(5)).toBe(true)
      expect(map.has(5)).toBe(false)
      expect(map.size()).toBe(9)
      const entries = map.entries()
      expect(entries.length).toBe(9)
    })

    it('deletes keys from map with order 2 (minimal)', () => {
      const map = new BTreeMap<number, string>(2)
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.set(4, 'd')
      expect(map.delete(2)).toBe(true)
      expect(map.size()).toBe(3)
      expect(map.keys()).toEqual([1, 3, 4])
    })

    it('maintains correctness after many deletions', () => {
      const map = new BTreeMap<number, number>(4)
      for (let i = 0; i < 30; i++) {
        map.set(i, i)
      }
      for (let i = 0; i < 30; i += 2) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size()).toBe(15)
      expect(map.keys()).toEqual(
        Array.from({ length: 15 }, (_, i) => i * 2 + 1)
      )
    })

    it('delete then re-set works correctly', () => {
      const map = new BTreeMap<number, string>()
      map.set(10, 'ten')
      map.delete(10)
      expect(map.has(10)).toBe(false)
      map.set(10, 'new-ten')
      expect(map.get(10)).toBe('new-ten')
      expect(map.size()).toBe(1)
    })

    it('handles deleting min key', () => {
      const map = new BTreeMap<number, string>(3)
      for (let i = 1; i <= 10; i++) map.set(i, `v${i}`)
      map.delete(1)
      expect(map.min()).toEqual([2, 'v2'])
    })

    it('handles deleting max key', () => {
      const map = new BTreeMap<number, string>(3)
      for (let i = 1; i <= 10; i++) map.set(i, `v${i}`)
      map.delete(10)
      expect(map.max()).toEqual([9, 'v9'])
    })
  })

  // ─── Size / IsEmpty ───────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size returns 0 for empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.size()).toBe(0)
    })

    it('isEmpty returns true for empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after set', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.isEmpty()).toBe(false)
    })

    it('size tracks sets and deletes', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.size()).toBe(2)
      map.delete(1)
      expect(map.size()).toBe(1)
      map.delete(2)
      expect(map.size()).toBe(0)
    })

    it('size does not increase on duplicate set', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(1, 'b')
      expect(map.size()).toBe(1)
    })
  })

  // ─── Clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears the map', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      map.clear()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
      expect(map.get(1)).toBeUndefined()
    })

    it('clear on already empty map is a no-op', () => {
      const map = new BTreeMap<number, string>()
      map.clear()
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('map is usable after clear', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.clear()
      map.set(2, 'b')
      expect(map.size()).toBe(1)
      expect(map.get(2)).toBe('b')
    })
  })

  // ─── Min / Max ─────────────────────────────────────────────────────────

  describe('min and max', () => {
    it('min returns undefined on empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.min()).toBeUndefined()
    })

    it('max returns undefined on empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.max()).toBeUndefined()
    })

    it('min returns the minimum key-value pair', () => {
      const map = new BTreeMap<number, number>()
      map.set(5, 50)
      map.set(3, 30)
      map.set(7, 70)
      expect(map.min()).toEqual([3, 30])
    })

    it('max returns the maximum key-value pair', () => {
      const map = new BTreeMap<number, number>()
      map.set(5, 50)
      map.set(3, 30)
      map.set(7, 70)
      expect(map.max()).toEqual([7, 70])
    })

    it('min and max on single element map', () => {
      const map = new BTreeMap<number, string>()
      map.set(42, 'only')
      expect(map.min()).toEqual([42, 'only'])
      expect(map.max()).toEqual([42, 'only'])
    })

    it('min and max update after insert and delete', () => {
      const map = new BTreeMap<number, number>()
      map.set(10, 100)
      map.set(20, 200)
      map.set(30, 300)
      expect(map.min()).toEqual([10, 100])
      expect(map.max()).toEqual([30, 300])
      map.delete(10)
      expect(map.min()).toEqual([20, 200])
      map.delete(30)
      expect(map.max()).toEqual([20, 200])
    })

    it('min and max with negative keys', () => {
      const map = new BTreeMap<number, number>()
      map.set(-10, -100)
      map.set(0, 0)
      map.set(10, 100)
      expect(map.min()).toEqual([-10, -100])
      expect(map.max()).toEqual([10, 100])
    })
  })

  // ─── Keys / Values / Entries ───────────────────────────────────────────

  describe('keys, values, entries', () => {
    it('keys returns empty array for empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.keys()).toEqual([])
    })

    it('values returns empty array for empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.values()).toEqual([])
    })

    it('entries returns empty array for empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.entries()).toEqual([])
    })

    it('keys returns keys in sorted order', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      map.set(1, 'one')
      map.set(9, 'nine')
      expect(map.keys()).toEqual([1, 2, 5, 8, 9])
    })

    it('values returns values in key sorted order', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      map.set(1, 'one')
      map.set(9, 'nine')
      expect(map.values()).toEqual(['one', 'two', 'five', 'eight', 'nine'])
    })

    it('entries returns key-value pairs in sorted order', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'five')
      map.set(2, 'two')
      map.set(8, 'eight')
      map.set(1, 'one')
      map.set(9, 'nine')
      expect(map.entries()).toEqual([
        [1, 'one'],
        [2, 'two'],
        [5, 'five'],
        [8, 'eight'],
        [9, 'nine'],
      ])
    })

    it('entries returns correct results after deletions', () => {
      const map = new BTreeMap<number, number>()
      for (let i = 0; i < 10; i++) {
        map.set(i, i * 10)
      }
      map.delete(3)
      map.delete(7)
      expect(map.keys()).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
    })

    it('entries returns correct pairs after complex operations', () => {
      const map = new BTreeMap<number, string>(3)
      const pairs: Array<[number, string]> = [
        [10, 'j'],
        [5, 'e'],
        [15, 'o'],
        [3, 'c'],
        [7, 'g'],
        [12, 'l'],
        [20, 't'],
      ]
      for (const [k, v] of pairs) {
        map.set(k, v)
      }
      expect(map.entries()).toEqual([
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
        [10, 'j'],
        [12, 'l'],
        [15, 'o'],
        [20, 't'],
      ])
    })
  })

  // ─── ForEach ───────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('does not call callback on empty map', () => {
      const map = new BTreeMap<number, string>()
      const calls: Array<[string, number]> = []
      map.forEach((v, k) => calls.push([v, k]))
      expect(calls).toEqual([])
    })

    it('iterates all entries in order', () => {
      const map = new BTreeMap<number, string>()
      map.set(3, 'three')
      map.set(1, 'one')
      map.set(2, 'two')
      const calls: Array<[string, number]> = []
      map.forEach((v, k) => calls.push([v, k]))
      expect(calls).toEqual([
        ['one', 1],
        ['two', 2],
        ['three', 3],
      ])
    })

    it('callback receives value as first arg and key as second', () => {
      const map = new BTreeMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      let receivedValue = ''
      let receivedKey = 0
      map.forEach((v, k) => {
        receivedValue = v
        receivedKey = k
      })
      expect(receivedValue).toBe('twenty')
      expect(receivedKey).toBe(20)
    })

    it('iterates many elements', () => {
      const map = new BTreeMap<number, number>(4)
      for (let i = 0; i < 50; i++) map.set(i, i * 2)
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(50)
    })
  })

  // ─── Range Search ──────────────────────────────────────────────────────

  describe('rangeSearch', () => {
    it('returns empty array for empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.rangeSearch(1, 10)).toEqual([])
    })

    it('returns empty array when low > high', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'five')
      expect(map.rangeSearch(10, 1)).toEqual([])
    })

    it('returns single matching entry when low equals high', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'five')
      map.set(10, 'ten')
      expect(map.rangeSearch(5, 5)).toEqual([[5, 'five']])
    })

    it('returns all entries in range', () => {
      const map = new BTreeMap<number, string>()
      for (let i = 1; i <= 10; i++) {
        map.set(i, `v${i}`)
      }
      const result = map.rangeSearch(3, 7)
      expect(result.map(([k]) => k)).toEqual([3, 4, 5, 6, 7])
      expect(result.map(([, v]) => v)).toEqual(['v3', 'v4', 'v5', 'v6', 'v7'])
    })

    it('returns empty when no keys in range', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.rangeSearch(10, 20)).toEqual([])
    })

    it('range with boundary keys inclusive', () => {
      const map = new BTreeMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      map.set(30, 'thirty')
      expect(map.rangeSearch(10, 30)).toEqual([
        [10, 'ten'],
        [20, 'twenty'],
        [30, 'thirty'],
      ])
    })

    it('range on large map', () => {
      const map = new BTreeMap<number, number>(4)
      for (let i = 0; i < 100; i++) {
        map.set(i, i)
      }
      const result = map.rangeSearch(40, 60)
      expect(result.length).toBe(21)
      expect(result[0]![0]).toBe(40)
      expect(result[20]![0]).toBe(60)
    })

    it('range query with negative bounds', () => {
      const map = new BTreeMap<number, string>()
      map.set(-10, 'a')
      map.set(-5, 'b')
      map.set(0, 'c')
      map.set(5, 'd')
      map.set(10, 'e')
      const result = map.rangeSearch(-5, 5)
      expect(result.map(([k]) => k)).toEqual([-5, 0, 5])
    })
  })

  // ─── Clone ─────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('clones an empty map', () => {
      const map = new BTreeMap<number, string>()
      const cloned = map.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones a map with entries', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.set(3, 'c')
      const cloned = map.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.get(1)).toBe('a')
      expect(cloned.get(2)).toBe('b')
      expect(cloned.get(3)).toBe('c')
    })

    it('clone is independent from original', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      const cloned = map.clone()
      cloned.set(2, 'b')
      expect(map.size()).toBe(1)
      expect(cloned.size()).toBe(2)
      expect(map.has(2)).toBe(false)
      expect(cloned.has(2)).toBe(true)
    })

    it('clone preserves custom comparator', () => {
      const map = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      map.set('b', 2)
      map.set('a', 1)
      const cloned = map.clone()
      expect(cloned.keys()).toEqual(['a', 'b'])
      cloned.set('c', 3)
      expect(cloned.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── ToArray ───────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const map = new BTreeMap<number, string>()
      expect(map.toArray()).toEqual([])
    })

    it('returns all entries as array', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArray()).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
    })
  })

  // ─── FromEntries (static) ──────────────────────────────────────────────

  describe('fromEntries', () => {
    it('creates map from empty entries', () => {
      const map = BTreeMap.fromEntries<number, string>([])
      expect(map.size()).toBe(0)
    })

    it('creates map from entries', () => {
      const map = BTreeMap.fromEntries([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(map.size()).toBe(3)
      expect(map.keys()).toEqual([1, 2, 3])
      expect(map.get(1)).toBe('a')
    })

    it('creates map from entries with custom order', () => {
      const map = BTreeMap.fromEntries<number, number>(
        Array.from({ length: 20 }, (_, i) => [i, i * 10]),
        5
      )
      expect(map.size()).toBe(20)
      expect(map.get(10)).toBe(100)
    })

    it('creates map from entries with custom comparator', () => {
      const map = BTreeMap.fromEntries<string, number>(
        [['banana', 2], ['apple', 1], ['cherry', 3]],
        3,
        (a, b) => a.localeCompare(b)
      )
      expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles duplicate keys in entries by keeping last', () => {
      const map = BTreeMap.fromEntries([
        [1, 'first'],
        [1, 'second'],
      ])
      expect(map.size()).toBe(1)
      expect(map.get(1)).toBe('second')
    })
  })

  // ─── Update ────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates existing value', () => {
      const map = new BTreeMap<number, number>()
      map.set(5, 10)
      map.update(5, (v) => v! + 5)
      expect(map.get(5)).toBe(15)
    })

    it('inserts new value when key does not exist', () => {
      const map = new BTreeMap<number, number>()
      map.update(5, (v) => (v ?? 0) + 5)
      expect(map.get(5)).toBe(5)
      expect(map.size()).toBe(1)
    })

    it('receives undefined for non-existing key', () => {
      const map = new BTreeMap<number, string>()
      let received: string | undefined = 'NOT_CALLED'
      map.update(1, (v) => {
        received = v
        return 'new'
      })
      expect(received).toBeUndefined()
      expect(map.get(1)).toBe('new')
    })

    it('can be used for counting pattern', () => {
      const map = new BTreeMap<string, number>(3, (a, b) => a.localeCompare(b))
      const words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
      for (const word of words) {
        map.update(word, (v) => (v ?? 0) + 1)
      }
      expect(map.get('apple')).toBe(3)
      expect(map.get('banana')).toBe(2)
      expect(map.get('cherry')).toBe(1)
    })
  })

  // ─── Iterator ──────────────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty map', () => {
      const map = new BTreeMap<number, string>()
      const result = [...map]
      expect(result).toEqual([])
    })

    it('iterates entries in sorted order', () => {
      const map = new BTreeMap<number, string>()
      map.set(3, 'c')
      map.set(1, 'a')
      map.set(2, 'b')
      const result = [...map]
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('works with for...of', () => {
      const map = new BTreeMap<number, string>()
      map.set(10, 'ten')
      map.set(20, 'twenty')
      const keys: number[] = []
      for (const [k] of map) {
        keys.push(k)
      }
      expect(keys).toEqual([10, 20])
    })
  })

  // ─── Edge Cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single element insert and delete cycle', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'one')
      expect(map.delete(1)).toBe(true)
      expect(map.isEmpty()).toBe(true)
      map.set(1, 'one-again')
      expect(map.size()).toBe(1)
      expect(map.get(1)).toBe('one-again')
    })

    it('handles order 2 with many operations', () => {
      const map = new BTreeMap<number, number>(2)
      for (let i = 0; i < 20; i++) {
        map.set(i, i * 10)
      }
      expect(map.size()).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
      for (let i = 0; i < 10; i++) {
        expect(map.delete(i * 2)).toBe(true)
      }
      expect(map.size()).toBe(10)
      expect(map.keys()).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19])
    })

    it('handles large number of elements', () => {
      const map = new BTreeMap<number, number>(5)
      for (let i = 0; i < 500; i++) {
        map.set(i, i)
      }
      expect(map.size()).toBe(500)
      expect(map.get(0)).toBe(0)
      expect(map.get(499)).toBe(499)
      expect(map.get(500)).toBeUndefined()
    })

    it('handles reverse insertion pattern', () => {
      const map = new BTreeMap<number, string>(3)
      for (let i = 50; i >= 1; i--) {
        map.set(i, `v${i}`)
      }
      const keys = map.keys()
      expect(keys.length).toBe(50)
      expect(keys[0]).toBe(1)
      expect(keys[49]).toBe(50)
    })

    it('handles alternating insert pattern', () => {
      const map = new BTreeMap<number, number>(4)
      const keys = [50]
      for (let i = 1; i <= 25; i++) {
        keys.push(i)
        keys.push(100 - i)
      }
      const uniqueKeys = [...new Set(keys)]
      for (const k of uniqueKeys) {
        map.set(k, k)
      }
      const sortedKeys = [...uniqueKeys].sort((a, b) => a - b)
      expect(map.keys()).toEqual(sortedKeys)
    })

    it('handles duplicate keys correctly with different values', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'first')
      map.set(5, 'second')
      map.set(5, 'third')
      expect(map.get(5)).toBe('third')
      expect(map.size()).toBe(1)
    })

    it('delete then set same key preserves correctness', () => {
      const map = new BTreeMap<number, string>()
      map.set(10, 'original')
      map.delete(10)
      map.set(10, 'replacement')
      expect(map.get(10)).toBe('replacement')
      expect(map.size()).toBe(1)
    })

    it('clear then bulk set works', () => {
      const map = new BTreeMap<number, number>()
      for (let i = 0; i < 50; i++) map.set(i, i)
      map.clear()
      expect(map.size()).toBe(0)
      for (let i = 100; i < 150; i++) map.set(i, i)
      expect(map.size()).toBe(50)
      expect(map.get(100)).toBe(100)
      expect(map.get(49)).toBeUndefined()
    })

    it('handles negative keys', () => {
      const map = new BTreeMap<number, string>()
      map.set(-5, 'neg-five')
      map.set(0, 'zero')
      map.set(5, 'five')
      expect(map.keys()).toEqual([-5, 0, 5])
      expect(map.get(-5)).toBe('neg-five')
    })

    it('handles zero key', () => {
      const map = new BTreeMap<number, string>()
      map.set(0, 'zero')
      expect(map.get(0)).toBe('zero')
      expect(map.has(0)).toBe(true)
      expect(map.delete(0)).toBe(true)
      expect(map.has(0)).toBe(false)
    })

    it('mixed set and delete pattern', () => {
      const map = new BTreeMap<number, number>(3)
      for (let i = 1; i <= 20; i++) {
        map.set(i, i)
      }
      for (let i = 2; i <= 20; i += 2) {
        map.delete(i)
      }
      expect(map.size()).toBe(10)
      for (let i = 1; i <= 20; i += 2) {
        expect(map.has(i)).toBe(true)
      }
      for (let i = 2; i <= 20; i += 2) {
        expect(map.has(i)).toBe(false)
      }
    })

    it('survives stress test: set, get, delete all', () => {
      const map = new BTreeMap<number, number>(4)
      const count = 200
      for (let i = 0; i < count; i++) {
        map.set(i, i * 10)
      }
      expect(map.size()).toBe(count)
      for (let i = 0; i < count; i++) {
        expect(map.get(i)).toBe(i * 10)
      }
      for (let i = 0; i < count; i++) {
        expect(map.delete(i)).toBe(true)
      }
      expect(map.size()).toBe(0)
      expect(map.isEmpty()).toBe(true)
    })

    it('handles boolean values', () => {
      const map = new BTreeMap<number, boolean>()
      map.set(1, true)
      map.set(2, false)
      expect(map.get(1)).toBe(true)
      expect(map.get(2)).toBe(false)
    })

    it('handles undefined values', () => {
      const map = new BTreeMap<number, string | undefined>()
      map.set(1, undefined)
      map.set(2, 'defined')
      expect(map.get(1)).toBeUndefined()
      expect(map.get(2)).toBe('defined')
      // Both should exist even though one has undefined value
      expect(map.has(1)).toBe(true)
      expect(map.has(2)).toBe(true)
      expect(map.size()).toBe(2)
    })

    it('min/max after all deletes returns undefined', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      map.delete(1)
      map.delete(2)
      expect(map.min()).toBeUndefined()
      expect(map.max()).toBeUndefined()
    })

    it('rangeSearch returns single entry at exact boundaries', () => {
      const map = new BTreeMap<number, string>()
      map.set(5, 'five')
      expect(map.rangeSearch(5, 5)).toEqual([[5, 'five']])
      expect(map.rangeSearch(4, 4)).toEqual([])
    })

    it('fromEntries + clone round-trip preserves data', () => {
      const original = BTreeMap.fromEntries([
        [10, 'j'],
        [5, 'e'],
        [15, 'o'],
      ])
      const cloned = original.clone()
      expect(cloned.entries()).toEqual(original.entries())
      cloned.delete(10)
      expect(original.has(10)).toBe(true)
      expect(cloned.has(10)).toBe(false)
    })

    it('toArray equals entries', () => {
      const map = new BTreeMap<number, string>()
      map.set(1, 'a')
      map.set(2, 'b')
      expect(map.toArray()).toEqual(map.entries())
    })
  })
})
