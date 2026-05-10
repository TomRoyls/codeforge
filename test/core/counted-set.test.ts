import { describe, it, expect, beforeEach } from 'vitest'
import { CountedSet } from '../../src/core/counted-set/counted-set.js'
import { DEFAULT_COUNTED_SET_OPTIONS } from '../../src/core/counted-set/types.js'
import type { CountedSetOptions, CountedSetJSON, CountedSetStatistics } from '../../src/core/counted-set/types.js'

describe('CountedSet', () => {
  let cs: CountedSet<string>

  beforeEach(() => {
    cs = new CountedSet()
  })

  describe('constructor', () => {
    it('should create empty set with no args', () => {
      const s = new CountedSet()
      expect(s.isEmpty).toBe(true)
      expect(s.totalCount).toBe(0)
      expect(s.uniqueCount).toBe(0)
    })

    it('should accept iterable of entries', () => {
      const s = new CountedSet<string>([['a', 3], ['b', 5]])
      expect(s.count('a')).toBe(3)
      expect(s.count('b')).toBe(5)
    })

    it('should accept options object with initialEntries', () => {
      const s = new CountedSet<string>({ initialEntries: [['x', 2], ['y', 7]] })
      expect(s.count('x')).toBe(2)
      expect(s.count('y')).toBe(7)
    })

    it('should skip zero-count entries', () => {
      const s = new CountedSet<string>([['a', 0], ['b', 3]])
      expect(s.has('a')).toBe(false)
      expect(s.count('b')).toBe(3)
    })

    it('should skip negative-count entries', () => {
      const s = new CountedSet<number>([[1, -5], [2, 4]])
      expect(s.has(1)).toBe(false)
      expect(s.count(2)).toBe(4)
    })

    it('should compute correct totalCount from initial entries', () => {
      const s = new CountedSet<string>([['a', 2], ['b', 3], ['c', 5]])
      expect(s.totalCount).toBe(10)
    })

    it('should compute correct uniqueCount from initial entries', () => {
      const s = new CountedSet<string>([['a', 2], ['b', 3]])
      expect(s.uniqueCount).toBe(2)
    })

    it('should accept empty iterable', () => {
      const s = new CountedSet<string>([])
      expect(s.isEmpty).toBe(true)
    })

    it('should accept empty options', () => {
      const s = new CountedSet<string>({})
      expect(s.isEmpty).toBe(true)
    })

    it('should accept partial options with defaults', () => {
      const s = new CountedSet({})
      expect(s.isEmpty).toBe(true)
    })
  })

  describe('add', () => {
    it('should add element with default count of 1', () => {
      cs.add('hello')
      expect(cs.count('hello')).toBe(1)
    })

    it('should add element with custom count', () => {
      cs.add('hello', 5)
      expect(cs.count('hello')).toBe(5)
    })

    it('should increment count on repeated adds', () => {
      cs.add('x')
      cs.add('x')
      cs.add('x')
      expect(cs.count('x')).toBe(3)
    })

    it('should increment with custom counts', () => {
      cs.add('x', 3)
      cs.add('x', 2)
      expect(cs.count('x')).toBe(5)
    })

    it('should handle multiple distinct elements', () => {
      cs.add('a')
      cs.add('b')
      cs.add('c')
      expect(cs.uniqueCount).toBe(3)
    })

    it('should update totalCount', () => {
      cs.add('a', 3)
      cs.add('b', 2)
      expect(cs.totalCount).toBe(5)
    })

    it('should do nothing with count of 0', () => {
      cs.add('x', 0)
      expect(cs.has('x')).toBe(false)
    })

    it('should do nothing with negative count', () => {
      cs.add('x', -1)
      expect(cs.has('x')).toBe(false)
    })

    it('should track add statistics', () => {
      cs.add('a')
      cs.add('b')
      cs.add('c')
      expect(cs.getStatistics().adds).toBe(3)
    })

    it('should set isEmpty to false after add', () => {
      cs.add('x')
      expect(cs.isEmpty).toBe(false)
    })

    it('should work with number elements', () => {
      const s = new CountedSet<number>()
      s.add(42)
      expect(s.count(42)).toBe(1)
    })

    it('should work with object elements', () => {
      const s = new CountedSet<{ id: number }>()
      const obj = { id: 1 }
      s.add(obj)
      expect(s.count(obj)).toBe(1)
    })
  })

  describe('remove', () => {
    it('should remove element with default count of 1', () => {
      cs.add('x', 3)
      const removed = cs.remove('x')
      expect(removed).toBe(1)
      expect(cs.count('x')).toBe(2)
    })

    it('should remove element with custom count', () => {
      cs.add('x', 5)
      const removed = cs.remove('x', 3)
      expect(removed).toBe(3)
      expect(cs.count('x')).toBe(2)
    })

    it('should remove all instances when count exceeds total', () => {
      cs.add('x', 3)
      const removed = cs.remove('x', 10)
      expect(removed).toBe(3)
      expect(cs.has('x')).toBe(false)
    })

    it('should return 0 for non-existing element', () => {
      const removed = cs.remove('nonexistent')
      expect(removed).toBe(0)
    })

    it('should return 0 with count of 0', () => {
      cs.add('x', 3)
      const removed = cs.remove('x', 0)
      expect(removed).toBe(0)
      expect(cs.count('x')).toBe(3)
    })

    it('should return 0 with negative count', () => {
      cs.add('x', 3)
      const removed = cs.remove('x', -1)
      expect(removed).toBe(0)
      expect(cs.count('x')).toBe(3)
    })

    it('should update totalCount after remove', () => {
      cs.add('x', 5)
      cs.remove('x', 3)
      expect(cs.totalCount).toBe(2)
    })

    it('should track remove statistics', () => {
      cs.add('x', 3)
      cs.remove('x')
      expect(cs.getStatistics().removes).toBe(1)
    })

    it('should not track remove stats for non-existing element', () => {
      cs.remove('nonexistent')
      expect(cs.getStatistics().removes).toBe(0)
    })

    it('should remove element entirely when count reaches 0', () => {
      cs.add('x', 2)
      cs.remove('x', 2)
      expect(cs.has('x')).toBe(false)
      expect(cs.uniqueCount).toBe(0)
    })

    it('should set isEmpty when all elements removed', () => {
      cs.add('x')
      cs.remove('x')
      expect(cs.isEmpty).toBe(true)
    })
  })

  describe('count', () => {
    it('should return 0 for non-existing element', () => {
      expect(cs.count('missing')).toBe(0)
    })

    it('should return correct count after adds', () => {
      cs.add('x', 5)
      expect(cs.count('x')).toBe(5)
    })

    it('should return correct count after adds and removes', () => {
      cs.add('x', 10)
      cs.remove('x', 3)
      expect(cs.count('x')).toBe(7)
    })

    it('should return 0 after full removal', () => {
      cs.add('x', 5)
      cs.remove('x', 5)
      expect(cs.count('x')).toBe(0)
    })
  })

  describe('has', () => {
    it('should return false for non-existing element', () => {
      expect(cs.has('missing')).toBe(false)
    })

    it('should return true for existing element', () => {
      cs.add('x')
      expect(cs.has('x')).toBe(true)
    })

    it('should return false after full removal', () => {
      cs.add('x')
      cs.remove('x')
      expect(cs.has('x')).toBe(false)
    })

    it('should return true for element with remaining count', () => {
      cs.add('x', 5)
      cs.remove('x', 3)
      expect(cs.has('x')).toBe(true)
    })
  })

  describe('setCount', () => {
    it('should set count for new element', () => {
      cs.setCount('x', 5)
      expect(cs.count('x')).toBe(5)
    })

    it('should update count for existing element', () => {
      cs.add('x', 3)
      cs.setCount('x', 10)
      expect(cs.count('x')).toBe(10)
    })

    it('should remove element when count set to 0', () => {
      cs.add('x', 5)
      cs.setCount('x', 0)
      expect(cs.has('x')).toBe(false)
    })

    it('should remove element when count set to negative', () => {
      cs.add('x', 5)
      cs.setCount('x', -3)
      expect(cs.has('x')).toBe(false)
    })

    it('should update totalCount correctly', () => {
      cs.add('x', 3)
      cs.setCount('x', 7)
      expect(cs.totalCount).toBe(7)
    })

    it('should update totalCount when reducing count', () => {
      cs.add('x', 10)
      cs.setCount('x', 3)
      expect(cs.totalCount).toBe(3)
    })

    it('should update totalCount when removing element', () => {
      cs.add('x', 5)
      cs.setCount('x', 0)
      expect(cs.totalCount).toBe(0)
    })
  })

  describe('totalCount', () => {
    it('should be 0 for empty set', () => {
      expect(cs.totalCount).toBe(0)
    })

    it('should reflect sum of all counts', () => {
      cs.add('a', 3)
      cs.add('b', 7)
      cs.add('c', 2)
      expect(cs.totalCount).toBe(12)
    })

    it('should decrease after remove', () => {
      cs.add('x', 10)
      cs.remove('x', 4)
      expect(cs.totalCount).toBe(6)
    })

    it('should reset after clear', () => {
      cs.add('x', 5)
      cs.clear()
      expect(cs.totalCount).toBe(0)
    })
  })

  describe('uniqueCount', () => {
    it('should be 0 for empty set', () => {
      expect(cs.uniqueCount).toBe(0)
    })

    it('should count unique elements', () => {
      cs.add('a')
      cs.add('b')
      cs.add('c')
      expect(cs.uniqueCount).toBe(3)
    })

    it('should not change for duplicate adds', () => {
      cs.add('x')
      cs.add('x')
      cs.add('x')
      expect(cs.uniqueCount).toBe(1)
    })

    it('should decrease when element fully removed', () => {
      cs.add('a')
      cs.add('b')
      cs.remove('a')
      expect(cs.uniqueCount).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new set', () => {
      expect(cs.isEmpty).toBe(true)
    })

    it('should be false after add', () => {
      cs.add('x')
      expect(cs.isEmpty).toBe(false)
    })

    it('should be true after clear', () => {
      cs.add('x')
      cs.clear()
      expect(cs.isEmpty).toBe(true)
    })

    it('should be true after removing all elements', () => {
      cs.add('x')
      cs.remove('x')
      expect(cs.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all elements', () => {
      cs.add('a', 3)
      cs.add('b', 5)
      cs.clear()
      expect(cs.isEmpty).toBe(true)
      expect(cs.totalCount).toBe(0)
      expect(cs.uniqueCount).toBe(0)
    })

    it('should reset statistics', () => {
      cs.add('a')
      cs.remove('a')
      cs.clear()
      const stats = cs.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
    })

    it('should allow adding after clear', () => {
      cs.add('old')
      cs.clear()
      cs.add('new')
      expect(cs.count('new')).toBe(1)
      expect(cs.has('old')).toBe(false)
    })
  })

  describe('elements', () => {
    it('should return empty array for empty set', () => {
      expect(cs.elements()).toEqual([])
    })

    it('should return unique elements', () => {
      cs.add('a', 3)
      cs.add('b', 5)
      const els = cs.elements()
      expect(els).toContain('a')
      expect(els).toContain('b')
      expect(els.length).toBe(2)
    })

    it('should not include removed elements', () => {
      cs.add('a')
      cs.add('b')
      cs.remove('a')
      expect(cs.elements()).toEqual(['b'])
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(cs.toArray()).toEqual([])
    })

    it('should return elements repeated by count', () => {
      cs.add('x', 3)
      cs.add('y', 2)
      const arr = cs.toArray()
      const xCount = arr.filter(e => e === 'x').length
      const yCount = arr.filter(e => e === 'y').length
      expect(xCount).toBe(3)
      expect(yCount).toBe(2)
    })

    it('should return single element for count of 1', () => {
      cs.add('a')
      expect(cs.toArray()).toEqual(['a'])
    })

    it('should handle count of 1 for each element', () => {
      cs.add('a')
      cs.add('b')
      cs.add('c')
      const arr = cs.toArray()
      expect(arr.length).toBe(3)
      expect(arr).toContain('a')
      expect(arr).toContain('b')
      expect(arr).toContain('c')
    })
  })

  describe('mostCommon', () => {
    it('should return empty array for empty set', () => {
      expect(cs.mostCommon()).toEqual([])
    })

    it('should return all entries sorted by count descending', () => {
      cs.add('a', 1)
      cs.add('b', 5)
      cs.add('c', 3)
      const result = cs.mostCommon()
      expect(result[0]![0]).toBe('b')
      expect(result[0]![1]).toBe(5)
      expect(result[1]![0]).toBe('c')
      expect(result[1]![1]).toBe(3)
      expect(result[2]![0]).toBe('a')
      expect(result[2]![1]).toBe(1)
    })

    it('should return top k entries', () => {
      cs.add('a', 1)
      cs.add('b', 5)
      cs.add('c', 3)
      const result = cs.mostCommon(2)
      expect(result.length).toBe(2)
      expect(result[0]![0]).toBe('b')
      expect(result[1]![0]).toBe('c')
    })

    it('should return all entries if k exceeds size', () => {
      cs.add('a', 1)
      cs.add('b', 2)
      const result = cs.mostCommon(10)
      expect(result.length).toBe(2)
    })

    it('should return top 1', () => {
      cs.add('x', 10)
      cs.add('y', 3)
      const result = cs.mostCommon(1)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual(['x', 10])
    })
  })

  describe('leastCommon', () => {
    it('should return empty array for empty set', () => {
      expect(cs.leastCommon()).toEqual([])
    })

    it('should return all entries sorted by count ascending', () => {
      cs.add('a', 5)
      cs.add('b', 1)
      cs.add('c', 3)
      const result = cs.leastCommon()
      expect(result[0]![0]).toBe('b')
      expect(result[0]![1]).toBe(1)
      expect(result[1]![0]).toBe('c')
      expect(result[1]![1]).toBe(3)
      expect(result[2]![0]).toBe('a')
      expect(result[2]![1]).toBe(5)
    })

    it('should return bottom k entries', () => {
      cs.add('a', 5)
      cs.add('b', 1)
      cs.add('c', 3)
      const result = cs.leastCommon(2)
      expect(result.length).toBe(2)
      expect(result[0]![0]).toBe('b')
      expect(result[1]![0]).toBe('c')
    })

    it('should return all entries if k exceeds size', () => {
      cs.add('a', 1)
      cs.add('b', 2)
      const result = cs.leastCommon(10)
      expect(result.length).toBe(2)
    })

    it('should return bottom 1', () => {
      cs.add('x', 10)
      cs.add('y', 3)
      const result = cs.leastCommon(1)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual(['y', 3])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty set', () => {
      let calls = 0
      cs.forEach(() => { calls++ })
      expect(calls).toBe(0)
    })

    it('should iterate over all elements', () => {
      cs.add('a', 2)
      cs.add('b', 3)
      const results: Array<[string, number]> = []
      cs.forEach((el, count) => { results.push([el, count]) })
      expect(results.length).toBe(2)
    })

    it('should pass element and count', () => {
      cs.add('x', 5)
      cs.forEach((el, count) => {
        expect(el).toBe('x')
        expect(count).toBe(5)
      })
    })

    it('should pass the set as third argument', () => {
      cs.add('x')
      cs.forEach((el, count, set) => {
        expect(set).toBe(cs)
      })
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should yield nothing for empty set', () => {
      expect([...cs]).toEqual([])
    })

    it('should yield [element, count] pairs', () => {
      cs.add('a', 3)
      cs.add('b', 7)
      const entries = [...cs]
      expect(entries.length).toBe(2)
      for (const [el, count] of entries) {
        expect(typeof el).toBe('string')
        expect(typeof count).toBe('number')
      }
    })

    it('should be usable with for-of', () => {
      cs.add('x', 2)
      cs.add('y', 4)
      const results: Array<[string, number]> = []
      for (const entry of cs) {
        results.push(entry)
      }
      expect(results.length).toBe(2)
    })

    it('should work with destructuring', () => {
      cs.add('a', 1)
      cs.add('b', 2)
      const map = new Map(cs)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('merge', () => {
    it('should merge another counted set', () => {
      cs.add('a', 3)
      const other = new CountedSet<string>()
      other.add('b', 5)
      cs.merge(other)
      expect(cs.count('a')).toBe(3)
      expect(cs.count('b')).toBe(5)
    })

    it('should sum counts for overlapping elements', () => {
      cs.add('x', 3)
      const other = new CountedSet<string>()
      other.add('x', 7)
      cs.merge(other)
      expect(cs.count('x')).toBe(10)
    })

    it('should update totalCount', () => {
      cs.add('a', 3)
      const other = new CountedSet<string>()
      other.add('b', 5)
      cs.merge(other)
      expect(cs.totalCount).toBe(8)
    })

    it('should merge with empty set', () => {
      cs.add('a', 3)
      const other = new CountedSet<string>()
      cs.merge(other)
      expect(cs.count('a')).toBe(3)
      expect(cs.totalCount).toBe(3)
    })

    it('should merge into empty set', () => {
      const other = new CountedSet<string>()
      other.add('a', 5)
      cs.merge(other)
      expect(cs.count('a')).toBe(5)
    })

    it('should merge statistics', () => {
      cs.add('a')
      const other = new CountedSet<string>()
      other.add('b')
      other.add('c')
      cs.merge(other)
      const stats = cs.getStatistics()
      expect(stats.adds).toBe(3)
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats for empty set', () => {
      const stats = cs.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.totalCount).toBe(0)
      expect(stats.maxCount).toBe(0)
      expect(stats.uniqueElements).toBe(0)
    })

    it('should track adds', () => {
      cs.add('a')
      cs.add('b')
      cs.add('c')
      expect(cs.getStatistics().adds).toBe(3)
    })

    it('should track removes', () => {
      cs.add('a', 5)
      cs.remove('a', 2)
      expect(cs.getStatistics().removes).toBe(1)
    })

    it('should track totalCount', () => {
      cs.add('a', 3)
      cs.add('b', 7)
      expect(cs.getStatistics().totalCount).toBe(10)
    })

    it('should track maxCount', () => {
      cs.add('a', 3)
      cs.add('b', 10)
      cs.add('c', 5)
      expect(cs.getStatistics().maxCount).toBe(10)
    })

    it('should track uniqueElements', () => {
      cs.add('a')
      cs.add('b')
      cs.add('c')
      expect(cs.getStatistics().uniqueElements).toBe(3)
    })

    it('should return a snapshot', () => {
      cs.add('a')
      const stats1 = cs.getStatistics()
      cs.add('b')
      const stats2 = cs.getStatistics()
      expect(stats1.adds).toBe(1)
      expect(stats2.adds).toBe(2)
    })

    it('should reset after clear', () => {
      cs.add('a', 5)
      cs.remove('a', 2)
      cs.clear()
      const stats = cs.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      cs.add('a', 3)
      cs.add('b', 5)
      const json = cs.toJSON()
      expect(json).toHaveProperty('entries')
      expect(json).toHaveProperty('statistics')
      expect(Array.isArray(json.entries)).toBe(true)
    })

    it('should include all entries', () => {
      cs.add('a', 3)
      cs.add('b', 5)
      const json = cs.toJSON()
      expect(json.entries.length).toBe(2)
    })

    it('should include statistics', () => {
      cs.add('a', 3)
      const json = cs.toJSON()
      expect(json.statistics.adds).toBe(1)
      expect(json.statistics.totalCount).toBe(3)
      expect(json.statistics.uniqueElements).toBe(1)
    })

    it('should serialize empty set', () => {
      const json = cs.toJSON()
      expect(json.entries).toEqual([])
      expect(json.statistics.totalCount).toBe(0)
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized set', () => {
      cs.add('a', 3)
      cs.add('b', 5)
      const json = cs.toJSON()
      const restored = CountedSet.fromJSON(json)
      expect(restored.count('a')).toBe(3)
      expect(restored.count('b')).toBe(5)
    })

    it('should restore totalCount', () => {
      cs.add('a', 3)
      cs.add('b', 7)
      const restored = CountedSet.fromJSON(cs.toJSON())
      expect(restored.totalCount).toBe(10)
    })

    it('should restore uniqueCount', () => {
      cs.add('a', 3)
      cs.add('b', 7)
      const restored = CountedSet.fromJSON(cs.toJSON())
      expect(restored.uniqueCount).toBe(2)
    })

    it('should skip zero-count entries', () => {
      const json: CountedSetJSON<string> = {
        entries: [['a', 3], ['b', 0]],
        statistics: { adds: 1, removes: 0, totalCount: 3, maxCount: 3, uniqueElements: 1 },
      }
      const restored = CountedSet.fromJSON(json)
      expect(restored.has('a')).toBe(true)
      expect(restored.has('b')).toBe(false)
    })

    it('should allow operations after restore', () => {
      cs.add('a', 3)
      const restored = CountedSet.fromJSON(cs.toJSON())
      restored.add('a', 2)
      expect(restored.count('a')).toBe(5)
    })

    it('should round-trip correctly', () => {
      cs.add('x', 3)
      cs.add('y', 7)
      cs.add('z', 1)
      const json = cs.toJSON()
      const restored = CountedSet.fromJSON(json)
      const json2 = restored.toJSON()
      expect(json.entries).toEqual(json2.entries)
    })

    it('should restore empty set', () => {
      const json = cs.toJSON()
      const restored = CountedSet.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
    })
  })

  describe('generic type support', () => {
    it('should work with string elements', () => {
      const s = new CountedSet<string>()
      s.add('hello')
      expect(s.count('hello')).toBe(1)
    })

    it('should work with number elements', () => {
      const s = new CountedSet<number>()
      s.add(1, 3)
      s.add(2, 5)
      expect(s.count(1)).toBe(3)
      expect(s.count(2)).toBe(5)
    })

    it('should work with object elements', () => {
      const s = new CountedSet<{ id: number }>()
      const obj = { id: 1 }
      s.add(obj, 4)
      expect(s.count(obj)).toBe(4)
    })

    it('should distinguish different objects by reference', () => {
      const s = new CountedSet<{ id: number }>()
      const a = { id: 1 }
      const b = { id: 1 }
      s.add(a)
      expect(s.has(a)).toBe(true)
      expect(s.has(b)).toBe(false)
    })

    it('should work with boolean elements', () => {
      const s = new CountedSet<boolean>()
      s.add(true, 3)
      s.add(false, 7)
      expect(s.count(true)).toBe(3)
      expect(s.count(false)).toBe(7)
    })
  })

  describe('edge cases', () => {
    it('should handle add-remove-add cycle', () => {
      cs.add('x', 5)
      cs.remove('x', 5)
      cs.add('x', 3)
      expect(cs.count('x')).toBe(3)
    })

    it('should handle setCount on new element', () => {
      cs.setCount('new', 10)
      expect(cs.count('new')).toBe(10)
      expect(cs.totalCount).toBe(10)
    })

    it('should handle large counts', () => {
      cs.add('x', 1000000)
      expect(cs.count('x')).toBe(1000000)
      expect(cs.totalCount).toBe(1000000)
    })

    it('should handle many unique elements', () => {
      for (let i = 0; i < 500; i++) {
        cs.add(`item-${i}`, i + 1)
      }
      expect(cs.uniqueCount).toBe(500)
      expect(cs.totalCount).toBe(500 * 501 / 2)
    })

    it('should handle rapid add-clear cycles', () => {
      for (let cycle = 0; cycle < 10; cycle++) {
        cs.add(`cycle-${cycle}`)
        cs.clear()
      }
      expect(cs.isEmpty).toBe(true)
    })

    it('should handle empty string element', () => {
      cs.add('', 3)
      expect(cs.count('')).toBe(3)
      expect(cs.has('')).toBe(true)
    })

    it('should handle remove on empty set', () => {
      expect(cs.remove('x')).toBe(0)
      expect(cs.totalCount).toBe(0)
    })

    it('should handle merging sets with overlapping keys', () => {
      cs.add('a', 2)
      cs.add('b', 3)
      const other = new CountedSet<string>()
      other.add('a', 5)
      other.add('c', 7)
      cs.merge(other)
      expect(cs.count('a')).toBe(7)
      expect(cs.count('b')).toBe(3)
      expect(cs.count('c')).toBe(7)
      expect(cs.uniqueCount).toBe(3)
    })

    it('should handle mostCommon with single element', () => {
      cs.add('only', 42)
      expect(cs.mostCommon()).toEqual([['only', 42]])
    })

    it('should handle leastCommon with single element', () => {
      cs.add('only', 42)
      expect(cs.leastCommon()).toEqual([['only', 42]])
    })
  })

  describe('DEFAULT_COUNTED_SET_OPTIONS', () => {
    it('should have initialEntries as empty array', () => {
      expect(Array.from(DEFAULT_COUNTED_SET_OPTIONS.initialEntries)).toEqual([])
    })
  })

  describe('exports', () => {
    it('should export CountedSet class', () => {
      expect(CountedSet).toBeDefined()
      expect(typeof CountedSet).toBe('function')
    })

    it('should export DEFAULT_COUNTED_SET_OPTIONS', () => {
      expect(DEFAULT_COUNTED_SET_OPTIONS).toBeDefined()
    })

    it('should allow type-only import for CountedSetOptions', () => {
      const opts: CountedSetOptions = { initialEntries: [['a', 1]] }
      const s = new CountedSet<string>(opts)
      expect(s.count('a')).toBe(1)
    })

    it('should allow type-only import for CountedSetJSON', () => {
      cs.add('a', 3)
      const json: CountedSetJSON<string> = cs.toJSON()
      expect(json.entries.length).toBe(1)
    })

    it('should allow type-only import for CountedSetStatistics', () => {
      const stats: CountedSetStatistics = cs.getStatistics()
      expect(stats.adds).toBe(0)
    })

    it('should support static fromJSON with type parameter', () => {
      const s = CountedSet.fromJSON<number>({ entries: [[1, 3], [2, 5]], statistics: { adds: 2, removes: 0, totalCount: 8, maxCount: 5, uniqueElements: 2 } })
      expect(s.count(1)).toBe(3)
      expect(s.count(2)).toBe(5)
    })
  })
})
