import { CountedSet } from '../src/core/counted-set/counted-set.js'
import type { CountedSetStatistics, CountedSetJSON } from '../src/core/counted-set/types.js'

// ─── Constructor (no args) ─────────────────────────────────────────────

describe('CountedSet', () => {
  describe('constructor (no args)', () => {
    it('creates an empty CountedSet', () => {
      const cs = new CountedSet<string>()
      expect(cs.isEmpty).toBe(true)
      expect(cs.totalCount).toBe(0)
      expect(cs.uniqueCount).toBe(0)
    })

    it('creates an empty CountedSet with default type unknown', () => {
      const cs = new CountedSet()
      expect(cs.isEmpty).toBe(true)
      expect(cs.totalCount).toBe(0)
    })
  })

  // ─── Constructor (entries) ──────────────────────────────────────────

  describe('constructor (entries iterable)', () => {
    it('creates a CountedSet from an array of entries', () => {
      const cs = new CountedSet<string>([['a', 3], ['b', 1]])
      expect(cs.totalCount).toBe(4)
      expect(cs.uniqueCount).toBe(2)
      expect(cs.count('a')).toBe(3)
      expect(cs.count('b')).toBe(1)
    })

    it('ignores entries with count 0', () => {
      const cs = new CountedSet<string>([['a', 0], ['b', 2]])
      expect(cs.uniqueCount).toBe(1)
      expect(cs.count('a')).toBe(0)
      expect(cs.count('b')).toBe(2)
    })

    it('ignores entries with negative count', () => {
      const cs = new CountedSet<number>([[1, -5], [2, 3]])
      expect(cs.uniqueCount).toBe(1)
      expect(cs.count(1)).toBe(0)
      expect(cs.count(2)).toBe(3)
    })

    it('handles empty iterable', () => {
      const cs = new CountedSet<string>([])
      expect(cs.isEmpty).toBe(true)
    })

    it('handles a single entry', () => {
      const cs = new CountedSet<number>([[42, 10]])
      expect(cs.totalCount).toBe(10)
      expect(cs.uniqueCount).toBe(1)
    })

    it('handles a Map as input', () => {
      const map = new Map<string, number>([['x', 5], ['y', 2]])
      const cs = new CountedSet<string>(map)
      expect(cs.count('x')).toBe(5)
      expect(cs.count('y')).toBe(2)
      expect(cs.totalCount).toBe(7)
    })

    it('last entry wins for duplicate keys but totalCount accumulates', () => {
      const cs = new CountedSet<string>([['a', 2], ['a', 5]])
      expect(cs.count('a')).toBe(5)
      expect(cs.totalCount).toBe(7)
    })
  })

  // ─── Constructor (options) ──────────────────────────────────────────

  describe('constructor (options object)', () => {
    it('creates a CountedSet with initialEntries option', () => {
      const cs = new CountedSet<string>({ initialEntries: [['hello', 2]] })
      expect(cs.count('hello')).toBe(2)
      expect(cs.totalCount).toBe(2)
    })

    it('handles empty options object', () => {
      const cs = new CountedSet<string>({})
      expect(cs.isEmpty).toBe(true)
    })

    it('ignores zero-count entries in options', () => {
      const cs = new CountedSet<number>({ initialEntries: [[1, 0], [2, 3]] })
      expect(cs.uniqueCount).toBe(1)
      expect(cs.count(2)).toBe(3)
    })
  })

  // ─── add ────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds a new element with default count 1', () => {
      const cs = new CountedSet<string>()
      cs.add('a')
      expect(cs.count('a')).toBe(1)
      expect(cs.totalCount).toBe(1)
    })

    it('adds to an existing element count', () => {
      const cs = new CountedSet<string>()
      cs.add('a', 3)
      cs.add('a', 2)
      expect(cs.count('a')).toBe(5)
      expect(cs.totalCount).toBe(5)
    })

    it('adds with custom count', () => {
      const cs = new CountedSet<number>()
      cs.add(10, 7)
      expect(cs.count(10)).toBe(7)
      expect(cs.totalCount).toBe(7)
    })

    it('does nothing when count is 0', () => {
      const cs = new CountedSet<string>()
      cs.add('a', 0)
      expect(cs.has('a')).toBe(false)
      expect(cs.totalCount).toBe(0)
    })

    it('does nothing when count is negative', () => {
      const cs = new CountedSet<string>()
      cs.add('a', -5)
      expect(cs.has('a')).toBe(false)
      expect(cs.totalCount).toBe(0)
    })

    it('tracks adds in statistics', () => {
      const cs = new CountedSet<string>()
      cs.add('a')
      cs.add('b', 3)
      expect(cs.getStatistics().adds).toBe(2)
    })
  })

  // ─── remove ─────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes one from an existing element by default', () => {
      const cs = new CountedSet<string>([['a', 5]])
      const removed = cs.remove('a')
      expect(removed).toBe(1)
      expect(cs.count('a')).toBe(4)
      expect(cs.totalCount).toBe(4)
    })

    it('removes a specified count from an element', () => {
      const cs = new CountedSet<string>([['a', 10]])
      const removed = cs.remove('a', 3)
      expect(removed).toBe(3)
      expect(cs.count('a')).toBe(7)
    })

    it('removes the entire element when count reaches 0', () => {
      const cs = new CountedSet<string>([['a', 2]])
      cs.remove('a', 2)
      expect(cs.has('a')).toBe(false)
      expect(cs.count('a')).toBe(0)
    })

    it('caps removal at current count', () => {
      const cs = new CountedSet<string>([['a', 3]])
      const removed = cs.remove('a', 100)
      expect(removed).toBe(3)
      expect(cs.has('a')).toBe(false)
      expect(cs.totalCount).toBe(0)
    })

    it('returns 0 for non-existent element', () => {
      const cs = new CountedSet<string>()
      const removed = cs.remove('z')
      expect(removed).toBe(0)
    })

    it('returns 0 when count is 0', () => {
      const cs = new CountedSet<string>([['a', 5]])
      const removed = cs.remove('a', 0)
      expect(removed).toBe(0)
      expect(cs.count('a')).toBe(5)
    })

    it('returns 0 when count is negative', () => {
      const cs = new CountedSet<string>([['a', 5]])
      const removed = cs.remove('a', -3)
      expect(removed).toBe(0)
      expect(cs.count('a')).toBe(5)
    })

    it('tracks removes in statistics', () => {
      const cs = new CountedSet<string>([['a', 10]])
      cs.remove('a', 3)
      expect(cs.getStatistics().removes).toBe(1)
    })
  })

  // ─── count ──────────────────────────────────────────────────────────

  describe('count', () => {
    it('returns 0 for non-existent element', () => {
      const cs = new CountedSet<string>()
      expect(cs.count('missing')).toBe(0)
    })

    it('returns the count of an existing element', () => {
      const cs = new CountedSet<number>([[42, 7]])
      expect(cs.count(42)).toBe(7)
    })

    it('returns 0 after element is fully removed', () => {
      const cs = new CountedSet<string>([['a', 3]])
      cs.remove('a', 3)
      expect(cs.count('a')).toBe(0)
    })
  })

  // ─── has ────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an existing element', () => {
      const cs = new CountedSet<string>([['a', 1]])
      expect(cs.has('a')).toBe(true)
    })

    it('returns false for a non-existent element', () => {
      const cs = new CountedSet<string>()
      expect(cs.has('a')).toBe(false)
    })

    it('returns false after element is removed', () => {
      const cs = new CountedSet<string>([['a', 1]])
      cs.remove('a')
      expect(cs.has('a')).toBe(false)
    })
  })

  // ─── setCount ───────────────────────────────────────────────────────

  describe('setCount', () => {
    it('sets the count for a new element', () => {
      const cs = new CountedSet<string>()
      cs.setCount('a', 5)
      expect(cs.count('a')).toBe(5)
      expect(cs.totalCount).toBe(5)
    })

    it('overwrites the count for an existing element', () => {
      const cs = new CountedSet<string>([['a', 10]])
      cs.setCount('a', 3)
      expect(cs.count('a')).toBe(3)
      expect(cs.totalCount).toBe(3)
    })

    it('removes the element when count is 0', () => {
      const cs = new CountedSet<string>([['a', 5]])
      cs.setCount('a', 0)
      expect(cs.has('a')).toBe(false)
      expect(cs.totalCount).toBe(0)
    })

    it('clamps negative count to 0 and removes element', () => {
      const cs = new CountedSet<string>([['a', 5]])
      cs.setCount('a', -10)
      expect(cs.has('a')).toBe(false)
      expect(cs.totalCount).toBe(0)
    })

    it('setCount 0 on non-existent element does nothing', () => {
      const cs = new CountedSet<string>()
      cs.setCount('z', 0)
      expect(cs.has('z')).toBe(false)
      expect(cs.totalCount).toBe(0)
    })

    it('setCount negative on non-existent element does nothing', () => {
      const cs = new CountedSet<string>()
      cs.setCount('z', -5)
      expect(cs.has('z')).toBe(false)
    })

    it('updates totalCount correctly when increasing', () => {
      const cs = new CountedSet<string>([['a', 2]])
      cs.setCount('a', 8)
      expect(cs.totalCount).toBe(8)
    })

    it('updates totalCount correctly when decreasing', () => {
      const cs = new CountedSet<string>([['a', 8]])
      cs.setCount('a', 2)
      expect(cs.totalCount).toBe(2)
    })
  })

  // ─── totalCount / uniqueCount / isEmpty ─────────────────────────────

  describe('totalCount, uniqueCount, isEmpty', () => {
    it('totalCount sums all counts', () => {
      const cs = new CountedSet<string>([['a', 3], ['b', 2], ['c', 1]])
      expect(cs.totalCount).toBe(6)
    })

    it('uniqueCount returns number of distinct elements', () => {
      const cs = new CountedSet<string>([['a', 3], ['b', 2]])
      expect(cs.uniqueCount).toBe(2)
    })

    it('isEmpty is true when no elements', () => {
      const cs = new CountedSet<string>()
      expect(cs.isEmpty).toBe(true)
    })

    it('isEmpty is false when elements exist', () => {
      const cs = new CountedSet<string>([['a', 1]])
      expect(cs.isEmpty).toBe(false)
    })

    it('isEmpty becomes true after all elements removed', () => {
      const cs = new CountedSet<string>([['a', 2]])
      cs.remove('a', 2)
      expect(cs.isEmpty).toBe(true)
    })
  })

  // ─── clear ──────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const cs = new CountedSet<string>([['a', 3], ['b', 2]])
      cs.clear()
      expect(cs.isEmpty).toBe(true)
      expect(cs.totalCount).toBe(0)
      expect(cs.uniqueCount).toBe(0)
    })

    it('resets statistics after clear', () => {
      const cs = new CountedSet<string>()
      cs.add('a', 5)
      cs.remove('a', 2)
      cs.clear()
      const stats = cs.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.totalCount).toBe(0)
    })
  })

  // ─── elements ───────────────────────────────────────────────────────

  describe('elements', () => {
    it('returns empty array for empty set', () => {
      const cs = new CountedSet<string>()
      expect(cs.elements()).toEqual([])
    })

    it('returns unique elements', () => {
      const cs = new CountedSet<string>([['a', 3], ['b', 1], ['c', 2]])
      const elems = cs.elements()
      expect(elems).toEqual(['a', 'b', 'c'])
    })

    it('returns a new array each call', () => {
      const cs = new CountedSet<string>([['a', 1]])
      const e1 = cs.elements()
      const e2 = cs.elements()
      expect(e1).toEqual(e2)
      expect(e1).not.toBe(e2)
    })
  })

  // ─── toArray ────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const cs = new CountedSet<string>()
      expect(cs.toArray()).toEqual([])
    })

    it('expands counts into repeated elements', () => {
      const cs = new CountedSet<string>([['a', 3], ['b', 1]])
      expect(cs.toArray()).toEqual(['a', 'a', 'a', 'b'])
    })

    it('returns a new array each call', () => {
      const cs = new CountedSet<string>([['a', 1]])
      const a1 = cs.toArray()
      const a2 = cs.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('handles single element with count 1', () => {
      const cs = new CountedSet<number>([[42, 1]])
      expect(cs.toArray()).toEqual([42])
    })
  })

  // ─── mostCommon ─────────────────────────────────────────────────────

  describe('mostCommon', () => {
    it('returns all entries sorted descending when no argument', () => {
      const cs = new CountedSet<string>([['a', 1], ['b', 5], ['c', 3]])
      expect(cs.mostCommon()).toEqual([['b', 5], ['c', 3], ['a', 1]])
    })

    it('returns top k entries', () => {
      const cs = new CountedSet<string>([['a', 1], ['b', 5], ['c', 3]])
      expect(cs.mostCommon(2)).toEqual([['b', 5], ['c', 3]])
    })

    it('returns empty array for empty set', () => {
      const cs = new CountedSet<string>()
      expect(cs.mostCommon()).toEqual([])
    })

    it('returns fewer entries when k exceeds unique count', () => {
      const cs = new CountedSet<string>([['a', 2]])
      expect(cs.mostCommon(10)).toEqual([['a', 2]])
    })

    it('returns empty array when k is 0', () => {
      const cs = new CountedSet<string>([['a', 5]])
      expect(cs.mostCommon(0)).toEqual([])
    })

    it('handles equal counts', () => {
      const cs = new CountedSet<string>([['a', 3], ['b', 3]])
      const result = cs.mostCommon(2)
      expect(result).toHaveLength(2)
      expect(result.every(([_, c]) => c === 3)).toBe(true)
    })
  })

  // ─── leastCommon ────────────────────────────────────────────────────

  describe('leastCommon', () => {
    it('returns all entries sorted ascending when no argument', () => {
      const cs = new CountedSet<string>([['a', 5], ['b', 1], ['c', 3]])
      expect(cs.leastCommon()).toEqual([['b', 1], ['c', 3], ['a', 5]])
    })

    it('returns bottom k entries', () => {
      const cs = new CountedSet<string>([['a', 5], ['b', 1], ['c', 3]])
      expect(cs.leastCommon(2)).toEqual([['b', 1], ['c', 3]])
    })

    it('returns empty array for empty set', () => {
      const cs = new CountedSet<string>()
      expect(cs.leastCommon()).toEqual([])
    })

    it('returns fewer entries when k exceeds unique count', () => {
      const cs = new CountedSet<string>([['a', 2]])
      expect(cs.leastCommon(10)).toEqual([['a', 2]])
    })

    it('returns empty array when k is 0', () => {
      const cs = new CountedSet<string>([['a', 5]])
      expect(cs.leastCommon(0)).toEqual([])
    })
  })

  // ─── forEach ────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements with correct args', () => {
      const cs = new CountedSet<string>([['a', 3], ['b', 1]])
      const result: Array<[string, number]> = []
      cs.forEach((element, count, set) => {
        result.push([element, count])
        expect(set).toBe(cs)
      })
      expect(result).toEqual([['a', 3], ['b', 1]])
    })

    it('does not call callback on empty set', () => {
      const cs = new CountedSet<string>()
      let callCount = 0
      cs.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })
  })

  // ─── Symbol.iterator ────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('is iterable and yields [element, count] pairs', () => {
      const cs = new CountedSet<string>([['x', 2], ['y', 4]])
      const result = [...cs]
      expect(result).toEqual([['x', 2], ['y', 4]])
    })

    it('yields nothing for empty set', () => {
      const cs = new CountedSet<string>()
      expect([...cs]).toEqual([])
    })

    it('works with for-of loop', () => {
      const cs = new CountedSet<number>([[1, 10], [2, 20]])
      let sum = 0
      for (const [_, count] of cs) {
        sum += count
      }
      expect(sum).toBe(30)
    })
  })

  // ─── merge ──────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges another CountedSet into this one', () => {
      const cs1 = new CountedSet<string>([['a', 2]])
      const cs2 = new CountedSet<string>([['a', 3], ['b', 1]])
      cs1.merge(cs2)
      expect(cs1.count('a')).toBe(5)
      expect(cs1.count('b')).toBe(1)
      expect(cs1.totalCount).toBe(6)
    })

    it('merge with empty set is a no-op', () => {
      const cs1 = new CountedSet<string>([['a', 3]])
      const cs2 = new CountedSet<string>()
      cs1.merge(cs2)
      expect(cs1.count('a')).toBe(3)
      expect(cs1.totalCount).toBe(3)
    })

    it('merge into empty set copies all', () => {
      const cs1 = new CountedSet<string>()
      const cs2 = new CountedSet<string>([['x', 5], ['y', 2]])
      cs1.merge(cs2)
      expect(cs1.count('x')).toBe(5)
      expect(cs1.count('y')).toBe(2)
      expect(cs1.totalCount).toBe(7)
    })

    it('merge accumulates statistics', () => {
      const cs1 = new CountedSet<string>()
      cs1.add('a', 2)
      const cs2 = new CountedSet<string>()
      cs2.add('b', 3)
      cs1.merge(cs2)
      const stats = cs1.getStatistics()
      expect(stats.adds).toBe(2)
    })
  })

  // ─── getStatistics ──────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns correct statistics for empty set', () => {
      const cs = new CountedSet<string>()
      const stats = cs.getStatistics()
      expect(stats).toEqual({
        adds: 0,
        removes: 0,
        totalCount: 0,
        maxCount: 0,
        uniqueElements: 0,
      })
    })

    it('returns correct statistics after operations', () => {
      const cs = new CountedSet<string>()
      cs.add('a', 5)
      cs.add('b', 3)
      cs.remove('a', 2)
      const stats = cs.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.removes).toBe(1)
      expect(stats.totalCount).toBe(6)
      expect(stats.maxCount).toBe(3)
      expect(stats.uniqueElements).toBe(2)
    })

    it('maxCount is 0 for empty set', () => {
      const cs = new CountedSet<string>()
      expect(cs.getStatistics().maxCount).toBe(0)
    })

    it('maxCount reflects highest single element count', () => {
      const cs = new CountedSet<number>([[1, 10], [2, 50], [3, 20]])
      expect(cs.getStatistics().maxCount).toBe(50)
    })
  })

  // ─── toJSON / fromJSON ──────────────────────────────────────────────

  describe('toJSON', () => {
    it('serializes to JSON with entries and statistics', () => {
      const cs = new CountedSet<string>()
      cs.add('a', 3)
      cs.add('b', 1)
      const json: CountedSetJSON<string> = cs.toJSON()
      expect(json.entries).toEqual([['a', 3], ['b', 1]])
      expect(json.statistics.totalCount).toBe(4)
      expect(json.statistics.uniqueElements).toBe(2)
      expect(json.statistics.adds).toBe(2)
    })

    it('serializes empty set', () => {
      const cs = new CountedSet<string>()
      const json = cs.toJSON()
      expect(json.entries).toEqual([])
      expect(json.statistics.totalCount).toBe(0)
    })
  })

  describe('static fromJSON', () => {
    it('reconstructs a CountedSet from JSON', () => {
      const original = new CountedSet<string>()
      original.add('a', 3)
      original.add('b', 1)
      const json = original.toJSON()
      const restored = CountedSet.fromJSON(json)
      expect(restored.count('a')).toBe(3)
      expect(restored.count('b')).toBe(1)
      expect(restored.totalCount).toBe(4)
    })

    it('reconstructs an empty set from empty JSON', () => {
      const cs = CountedSet.fromJSON<string>({ entries: [], statistics: { adds: 0, removes: 0, totalCount: 0, maxCount: 0, uniqueElements: 0 } })
      expect(cs.isEmpty).toBe(true)
    })

    it('ignores zero-count entries in JSON', () => {
      const cs = CountedSet.fromJSON<string>({
        entries: [['a', 0], ['b', 2]],
        statistics: { adds: 0, removes: 0, totalCount: 0, maxCount: 0, uniqueElements: 0 },
      })
      expect(cs.has('a')).toBe(false)
      expect(cs.count('b')).toBe(2)
    })

    it('round-trips correctly', () => {
      const cs = new CountedSet<number>()
      cs.add(1, 10)
      cs.add(2, 5)
      cs.remove(1, 3)
      const restored = CountedSet.fromJSON(cs.toJSON())
      expect(restored.count(1)).toBe(7)
      expect(restored.count(2)).toBe(5)
      expect(restored.totalCount).toBe(12)
      expect(restored.uniqueCount).toBe(2)
    })
  })

  // ─── Edge Cases ─────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles number keys', () => {
      const cs = new CountedSet<number>()
      cs.add(1, 2)
      cs.add(2, 3)
      expect(cs.count(1)).toBe(2)
      expect(cs.count(2)).toBe(3)
    })

    it('handles boolean keys', () => {
      const cs = new CountedSet<boolean>()
      cs.add(true, 5)
      cs.add(false, 3)
      expect(cs.count(true)).toBe(5)
      expect(cs.count(false)).toBe(3)
    })

    it('handles object keys (by reference)', () => {
      const obj = { id: 1 }
      const cs = new CountedSet<object>()
      cs.add(obj, 3)
      expect(cs.count(obj)).toBe(3)
      expect(cs.count({ id: 1 })).toBe(0)
    })

    it('handles null as element key', () => {
      const cs = new CountedSet<null>()
      cs.add(null, 2)
      expect(cs.count(null)).toBe(2)
      expect(cs.has(null)).toBe(true)
    })

    it('handles undefined as element key', () => {
      const cs = new CountedSet<undefined>()
      cs.add(undefined, 4)
      expect(cs.count(undefined)).toBe(4)
      expect(cs.has(undefined)).toBe(true)
    })

    it('handles string keys with special characters', () => {
      const cs = new CountedSet<string>()
      cs.add('', 1)
      cs.add('hello world', 2)
      cs.add('__proto__', 3)
      expect(cs.count('')).toBe(1)
      expect(cs.count('hello world')).toBe(2)
      expect(cs.count('__proto__')).toBe(3)
    })

    it('add then remove then add again', () => {
      const cs = new CountedSet<string>()
      cs.add('a', 5)
      cs.remove('a', 5)
      expect(cs.has('a')).toBe(false)
      cs.add('a', 2)
      expect(cs.count('a')).toBe(2)
      expect(cs.totalCount).toBe(2)
    })

    it('multiple adds accumulate correctly', () => {
      const cs = new CountedSet<string>()
      for (let i = 0; i < 100; i++) {
        cs.add('x', 1)
      }
      expect(cs.count('x')).toBe(100)
      expect(cs.totalCount).toBe(100)
    })

    it('mostCommon and leastCommon are consistent', () => {
      const cs = new CountedSet<string>([['a', 1], ['b', 2], ['c', 3]])
      const most = cs.mostCommon()
      const least = cs.leastCommon()
      expect(most[0]).toEqual(least[least.length - 1])
      expect(least[0]).toEqual(most[most.length - 1])
    })

    it('clear then add works', () => {
      const cs = new CountedSet<string>([['a', 100]])
      cs.clear()
      cs.add('b', 5)
      expect(cs.count('a')).toBe(0)
      expect(cs.count('b')).toBe(5)
      expect(cs.totalCount).toBe(5)
    })

    it('setCount then remove works correctly', () => {
      const cs = new CountedSet<string>()
      cs.setCount('a', 10)
      const removed = cs.remove('a', 4)
      expect(removed).toBe(4)
      expect(cs.count('a')).toBe(6)
    })

    it('merge does not modify the source set', () => {
      const cs1 = new CountedSet<string>()
      const cs2 = new CountedSet<string>([['a', 3]])
      cs1.merge(cs2)
      expect(cs2.count('a')).toBe(3)
      expect(cs2.totalCount).toBe(3)
    })

    it('large number of unique elements', () => {
      const cs = new CountedSet<number>()
      for (let i = 0; i < 1000; i++) {
        cs.add(i, 1)
      }
      expect(cs.uniqueCount).toBe(1000)
      expect(cs.totalCount).toBe(1000)
      expect(cs.count(500)).toBe(1)
    })

    it('toArray length equals totalCount', () => {
      const cs = new CountedSet<string>([['a', 5], ['b', 3], ['c', 2]])
      expect(cs.toArray().length).toBe(cs.totalCount)
    })

    it('forEach visits exactly uniqueCount elements', () => {
      const cs = new CountedSet<string>([['a', 5], ['b', 3]])
      let visited = 0
      cs.forEach(() => visited++)
      expect(visited).toBe(cs.uniqueCount)
    })

    it('iterator visits exactly uniqueCount entries', () => {
      const cs = new CountedSet<string>([['a', 5], ['b', 3], ['c', 1]])
      let count = 0
      for (const _ of cs) count++
      expect(count).toBe(cs.uniqueCount)
    })

    it('setCount to same value is idempotent', () => {
      const cs = new CountedSet<string>([['a', 5]])
      cs.setCount('a', 5)
      expect(cs.count('a')).toBe(5)
      expect(cs.totalCount).toBe(5)
    })
  })
})
