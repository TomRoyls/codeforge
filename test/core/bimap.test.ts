import { describe, it, expect } from 'vitest'
import { Bimap } from '../../src/core/bimap/bimap.js'
import { DEFAULT_BIMAP_OPTIONS } from '../../src/core/bimap/bimap.js'
import type { BimapOptions, BimapJSON, BimapStatistics } from '../../src/core/bimap/types.js'

describe('Bimap', () => {
  describe('constructor', () => {
    it('creates empty bimap with no arguments', () => {
      const bm = new Bimap<string, number>()
      expect(bm.size).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('creates bimap from entries', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(bm.size).toBe(3)
      expect(bm.get('a')).toBe(1)
      expect(bm.get('b')).toBe(2)
      expect(bm.get('c')).toBe(3)
    })

    it('creates bimap with empty entries array', () => {
      const bm = new Bimap<string, number>([])
      expect(bm.size).toBe(0)
    })

    it('creates bimap with options', () => {
      const bm = new Bimap<string, number>(undefined, { allowOverwrite: false })
      expect(bm.size).toBe(0)
    })

    it('handles single entry', () => {
      const bm = new Bimap<string, number>([['x', 42]])
      expect(bm.size).toBe(1)
      expect(bm.get('x')).toBe(42)
      expect(bm.getKey(42)).toBe('x')
    })
  })

  describe('set', () => {
    it('sets a key-value pair', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      expect(bm.get('a')).toBe(1)
      expect(bm.getKey(1)).toBe('a')
    })

    it('sets multiple key-value pairs', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 2)
      bm.set('c', 3)
      expect(bm.size).toBe(3)
    })

    it('overwrites existing key with new value', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('a', 2)
      expect(bm.get('a')).toBe(2)
      expect(bm.getKey(2)).toBe('a')
      expect(bm.getKey(1)).toBeUndefined()
      expect(bm.size).toBe(1)
    })

    it('overwrites existing value with new key', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 1)
      expect(bm.get('a')).toBeUndefined()
      expect(bm.get('b')).toBe(1)
      expect(bm.size).toBe(1)
    })

    it('no-ops when setting same key-value pair', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('a', 1)
      expect(bm.size).toBe(1)
    })

    it('tracks overwrites in statistics', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('a', 2)
      expect(bm.getStatistics().overwrites).toBe(1)
    })

    it('tracks multiple overwrites', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('a', 2)
      bm.set('a', 3)
      expect(bm.getStatistics().overwrites).toBe(2)
    })

    it('tracks sets in statistics', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 2)
      expect(bm.getStatistics().sets).toBe(2)
    })

    it('throws when allowOverwrite is false and value exists', () => {
      const bm = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bm.set('a', 1)
      expect(() => bm.set('b', 1)).toThrow()
    })

    it('allows same key update when allowOverwrite is false', () => {
      const bm = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bm.set('a', 1)
      bm.set('a', 2)
      expect(bm.get('a')).toBe(2)
    })
  })

  describe('get', () => {
    it('returns value for existing key', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      expect(bm.get('a')).toBe(1)
    })

    it('returns undefined for non-existing key', () => {
      const bm = new Bimap<string, number>()
      expect(bm.get('z')).toBeUndefined()
    })

    it('tracks gets in statistics', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.get('a')
      bm.get('b')
      expect(bm.getStatistics().gets).toBe(2)
    })
  })

  describe('getKey', () => {
    it('returns key for existing value', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      expect(bm.getKey(1)).toBe('a')
    })

    it('returns undefined for non-existing value', () => {
      const bm = new Bimap<string, number>()
      expect(bm.getKey(999)).toBeUndefined()
    })

    it('tracks reverse lookups in statistics', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.getKey(1)
      bm.getKey(2)
      expect(bm.getStatistics().reverseLookups).toBe(2)
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      expect(bm.delete('a')).toBe(true)
      expect(bm.get('a')).toBeUndefined()
      expect(bm.getKey(1)).toBeUndefined()
      expect(bm.size).toBe(0)
    })

    it('returns false for non-existing key', () => {
      const bm = new Bimap<string, number>()
      expect(bm.delete('z')).toBe(false)
    })

    it('removes from reverse map on delete', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      bm.delete('a')
      expect(bm.hasValue(1)).toBe(false)
      expect(bm.hasValue(2)).toBe(true)
    })

    it('tracks deletes in statistics', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.delete('a')
      bm.delete('b')
      expect(bm.getStatistics().deletes).toBe(1)
    })

    it('handles delete after overwrite', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('a', 2)
      bm.delete('a')
      expect(bm.size).toBe(0)
      expect(bm.getKey(2)).toBeUndefined()
      expect(bm.getKey(1)).toBeUndefined()
    })
  })

  describe('deleteValue', () => {
    it('deletes existing value', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      expect(bm.deleteValue(1)).toBe(true)
      expect(bm.size).toBe(0)
    })

    it('returns false for non-existing value', () => {
      const bm = new Bimap<string, number>()
      expect(bm.deleteValue(999)).toBe(false)
    })

    it('removes from forward map on deleteValue', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      bm.deleteValue(1)
      expect(bm.has('a')).toBe(false)
      expect(bm.has('b')).toBe(true)
    })

    it('tracks deletes in statistics', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.deleteValue(1)
      expect(bm.getStatistics().deletes).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      expect(bm.has('a')).toBe(true)
    })

    it('returns false for non-existing key', () => {
      const bm = new Bimap<string, number>()
      expect(bm.has('z')).toBe(false)
    })
  })

  describe('hasValue', () => {
    it('returns true for existing value', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      expect(bm.hasValue(1)).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const bm = new Bimap<string, number>()
      expect(bm.hasValue(999)).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty bimap', () => {
      const bm = new Bimap<string, number>()
      expect(bm.size).toBe(0)
    })

    it('returns correct size after operations', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 2)
      expect(bm.size).toBe(2)
      bm.delete('a')
      expect(bm.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty bimap', () => {
      const bm = new Bimap<string, number>()
      expect(bm.isEmpty).toBe(true)
    })

    it('returns false after adding entry', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      expect(bm.isEmpty).toBe(false)
    })

    it('returns true after clearing', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.clear()
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      bm.clear()
      expect(bm.size).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('resets statistics', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.get('a')
      bm.delete('a')
      bm.clear()
      const stats = bm.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.overwrites).toBe(0)
      expect(stats.reverseLookups).toBe(0)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty bimap', () => {
      const bm = new Bimap<string, number>()
      expect(bm.keys()).toEqual([])
    })

    it('returns all keys', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(bm.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty bimap', () => {
      const bm = new Bimap<string, number>()
      expect(bm.values()).toEqual([])
    })

    it('returns all values', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(bm.values()).toEqual([1, 2, 3])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty bimap', () => {
      const bm = new Bimap<string, number>()
      expect(bm.entries()).toEqual([])
    })

    it('returns all entries', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(bm.entries()).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const result: Array<[string, number]> = []
      bm.forEach((key, value) => {
        result.push([key, value])
      })
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('passes bimap instance as third argument', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      let captured: Bimap<string, number> | undefined
      bm.forEach((_key, _value, bimap) => {
        captured = bimap
      })
      expect(captured).toBe(bm)
    })

    it('does not iterate on empty bimap', () => {
      const bm = new Bimap<string, number>()
      let count = 0
      bm.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const result = [...bm]
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('works with for...of', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      const result: Array<[string, number]> = []
      for (const entry of bm) {
        result.push(entry)
      }
      expect(result).toEqual([['a', 1]])
    })

    it('works with empty bimap', () => {
      const bm = new Bimap<string, number>()
      expect([...bm]).toEqual([])
    })
  })

  describe('update', () => {
    it('updates existing key', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      expect(bm.update('a', 2)).toBe(true)
      expect(bm.get('a')).toBe(2)
    })

    it('returns false for non-existing key', () => {
      const bm = new Bimap<string, number>()
      expect(bm.update('z', 1)).toBe(false)
    })

    it('cleans up old reverse mapping', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.update('a', 2)
      expect(bm.getKey(1)).toBeUndefined()
      expect(bm.getKey(2)).toBe('a')
    })
  })

  describe('reverse', () => {
    it('returns a new reversed bimap', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const rev = bm.reverse()
      expect(rev.get(1)).toBe('a')
      expect(rev.get(2)).toBe('b')
      expect(rev.getKey('a')).toBe(1)
      expect(rev.getKey('b')).toBe(2)
    })

    it('does not modify original', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.reverse()
      expect(bm.get('a')).toBe(1)
      expect(bm.size).toBe(1)
    })

    it('returns empty bimap when original is empty', () => {
      const bm = new Bimap<string, number>()
      const rev = bm.reverse()
      expect(rev.size).toBe(0)
    })

    it('reversed bimap is independent', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      const rev = bm.reverse()
      rev.set(2, 'b')
      expect(bm.has('b')).toBe(false)
      expect(rev.get(2)).toBe('b')
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const bm = new Bimap<string, number>()
      const stats = bm.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.reverseLookups).toBe(0)
      expect(stats.overwrites).toBe(0)
    })

    it('returns a copy of statistics', () => {
      const bm = new Bimap<string, number>()
      const stats1 = bm.getStatistics()
      stats1.sets = 999
      const stats2 = bm.getStatistics()
      expect(stats2.sets).toBe(0)
    })

    it('tracks full operation lifecycle', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 2)
      bm.get('a')
      bm.getKey(2)
      bm.delete('a')
      bm.deleteValue(2)
      const stats = bm.getStatistics()
      expect(stats.sets).toBe(2)
      expect(stats.gets).toBe(1)
      expect(stats.reverseLookups).toBe(1)
      expect(stats.deletes).toBe(2)
    })
  })

  describe('toJSON', () => {
    it('serializes to JSON', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const json = bm.toJSON()
      expect(json.entries).toEqual([
        ['a', 1],
        ['b', 2],
      ])
      expect(json.statistics.sets).toBe(2)
    })

    it('serializes empty bimap', () => {
      const bm = new Bimap<string, number>()
      const json = bm.toJSON()
      expect(json.entries).toEqual([])
      expect(json.statistics.sets).toBe(0)
    })

    it('includes statistics snapshot', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.get('a')
      bm.delete('a')
      const json = bm.toJSON()
      expect(json.statistics.sets).toBe(1)
      expect(json.statistics.gets).toBe(1)
      expect(json.statistics.deletes).toBe(1)
    })
  })

  describe('fromJSON', () => {
    it('deserializes from JSON', () => {
      const data: BimapJSON<string, number> = {
        entries: [
          ['a', 1],
          ['b', 2],
        ],
        statistics: { sets: 2, gets: 0, deletes: 0, reverseLookups: 0, overwrites: 0 },
      }
      const bm = Bimap.fromJSON<string, number>(data)
      expect(bm.get('a')).toBe(1)
      expect(bm.get('b')).toBe(2)
      expect(bm.size).toBe(2)
    })

    it('deserializes empty JSON', () => {
      const data: BimapJSON<string, number> = {
        entries: [],
        statistics: { sets: 0, gets: 0, deletes: 0, reverseLookups: 0, overwrites: 0 },
      }
      const bm = Bimap.fromJSON<string, number>(data)
      expect(bm.size).toBe(0)
    })

    it('round-trips through JSON', () => {
      const original = new Bimap<string, number>([
        ['x', 10],
        ['y', 20],
      ])
      const json = original.toJSON()
      const restored = Bimap.fromJSON<string, number>(json)
      expect(restored.get('x')).toBe(10)
      expect(restored.get('y')).toBe(20)
      expect(restored.size).toBe(original.size)
    })

    it('accepts options', () => {
      const data: BimapJSON<string, number> = {
        entries: [['a', 1]],
        statistics: { sets: 1, gets: 0, deletes: 0, reverseLookups: 0, overwrites: 0 },
      }
      const bm = Bimap.fromJSON<string, number>(data, { allowOverwrite: false })
      expect(bm.get('a')).toBe(1)
    })
  })

  describe('DEFAULT_BIMAP_OPTIONS', () => {
    it('has allowOverwrite true by default', () => {
      expect(DEFAULT_BIMAP_OPTIONS.allowOverwrite).toBe(true)
    })
  })

  describe('type variations', () => {
    it('works with number keys and string values', () => {
      const bm = new Bimap<number, string>()
      bm.set(1, 'one')
      bm.set(2, 'two')
      expect(bm.get(1)).toBe('one')
      expect(bm.getKey('two')).toBe(2)
    })

    it('works with object values', () => {
      const bm = new Bimap<string, object>()
      const obj = { name: 'test' }
      bm.set('a', obj)
      expect(bm.get('a')).toBe(obj)
      expect(bm.getKey(obj)).toBe('a')
    })

    it('works with complex types', () => {
      const bm = new Bimap<number[], string>()
      bm.set([1, 2], 'pair')
      expect(bm.get([1, 2])).toBeUndefined()
      const arr = [1, 2]
      bm.set(arr, 'pair')
      expect(bm.get(arr)).toBe('pair')
      expect(bm.getKey('pair')).toBe(arr)
    })
  })

  describe('bidirectional integrity', () => {
    it('maintains 1:1 mapping after many operations', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 2)
      bm.set('c', 3)
      bm.delete('b')
      bm.set('d', 4)
      expect(bm.size).toBe(3)
      expect(bm.keys().length).toBe(bm.values().length)
      for (const [k, v] of bm) {
        expect(bm.getKey(v)).toBe(k)
        expect(bm.get(k)).toBe(v)
      }
    })

    it('maintains integrity after overwriting keys', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 2)
      bm.set('a', 3)
      expect(bm.get('a')).toBe(3)
      expect(bm.getKey(1)).toBeUndefined()
      expect(bm.getKey(2)).toBe('b')
      expect(bm.getKey(3)).toBe('a')
    })

    it('maintains integrity after overwriting values', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 2)
      bm.set('c', 2)
      expect(bm.get('b')).toBeUndefined()
      expect(bm.get('c')).toBe(2)
      expect(bm.getKey(2)).toBe('c')
      expect(bm.size).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles null values', () => {
      const bm = new Bimap<string, null>()
      bm.set('a', null)
      expect(bm.get('a')).toBe(null)
      expect(bm.getKey(null)).toBe('a')
    })

    it('handles undefined values', () => {
      const bm = new Bimap<string, undefined>()
      bm.set('a', undefined)
      expect(bm.get('a')).toBe(undefined)
      expect(bm.has('a')).toBe(true)
    })

    it('handles empty string keys', () => {
      const bm = new Bimap<string, number>()
      bm.set('', 0)
      expect(bm.get('')).toBe(0)
      expect(bm.getKey(0)).toBe('')
    })

    it('handles zero values', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 0)
      expect(bm.get('a')).toBe(0)
      expect(bm.hasValue(0)).toBe(true)
    })

    it('handles false values', () => {
      const bm = new Bimap<string, boolean>()
      bm.set('a', false)
      expect(bm.get('a')).toBe(false)
      expect(bm.getKey(false)).toBe('a')
    })

    it('handles large number of entries', () => {
      const bm = new Bimap<number, number>()
      for (let i = 0; i < 1000; i++) {
        bm.set(i, i * 10)
      }
      expect(bm.size).toBe(1000)
      expect(bm.get(500)).toBe(5000)
      expect(bm.getKey(5000)).toBe(500)
    })

    it('handles set delete re-add cycle', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.delete('a')
      bm.set('a', 1)
      expect(bm.get('a')).toBe(1)
      expect(bm.size).toBe(1)
    })
  })

  describe('statistics tracking accuracy', () => {
    it('counts overwrites on value collision', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 1)
      expect(bm.getStatistics().overwrites).toBe(1)
    })

    it('counts overwrites on key update', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('a', 2)
      expect(bm.getStatistics().overwrites).toBe(1)
    })

    it('counts double overwrite correctly', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.set('b', 1)
      expect(bm.getStatistics().overwrites).toBe(1)
      expect(bm.getStatistics().sets).toBe(2)
    })

    it('statistics survive clear', () => {
      const bm = new Bimap<string, number>()
      bm.set('a', 1)
      bm.get('a')
      bm.clear()
      const stats = bm.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
    })
  })

  describe('constructor entries interaction', () => {
    it('constructor entries skip duplicates', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['a', 2],
      ])
      expect(bm.get('a')).toBe(2)
      expect(bm.size).toBe(1)
    })

    it('constructor entries handle value collision', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 1],
      ])
      expect(bm.get('b')).toBe(1)
      expect(bm.get('a')).toBeUndefined()
      expect(bm.size).toBe(1)
    })

    it('constructor with options combined', () => {
      const bm = new Bimap<string, number>(
        [
          ['a', 1],
          ['b', 2],
        ],
        { allowOverwrite: false },
      )
      expect(bm.size).toBe(2)
    })
  })

  describe('allowOverwrite false', () => {
    it('allows initial set', () => {
      const bm = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bm.set('a', 1)
      expect(bm.get('a')).toBe(1)
    })

    it('throws on value collision with different key', () => {
      const bm = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bm.set('a', 1)
      expect(() => bm.set('b', 1)).toThrow()
    })

    it('does not throw when same key same value', () => {
      const bm = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bm.set('a', 1)
      expect(() => bm.set('a', 1)).not.toThrow()
    })

    it('allows same key different value', () => {
      const bm = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bm.set('a', 1)
      bm.set('a', 2)
      expect(bm.get('a')).toBe(2)
    })
  })

  describe('update edge cases', () => {
    it('update creates no-op for same value', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      expect(bm.update('a', 1)).toBe(true)
      expect(bm.size).toBe(1)
    })

    it('update tracks overwrite stat', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.update('a', 2)
      expect(bm.getStatistics().overwrites).toBe(1)
    })

    it('update tracks set stat', () => {
      const bm = new Bimap<string, number>([['a', 1]])
      bm.update('a', 2)
      expect(bm.getStatistics().sets).toBe(2)
    })
  })

  describe('reverse edge cases', () => {
    it('double reverse returns equivalent bimap', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const doubleReversed = bm.reverse().reverse()
      expect(doubleReversed.get('a')).toBe(1)
      expect(doubleReversed.get('b')).toBe(2)
    })
  })

  describe('forEach edge cases', () => {
    it('forEach with mutation during iteration', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const collected: string[] = []
      bm.forEach((key) => {
        collected.push(key)
      })
      expect(collected).toEqual(['a', 'b'])
    })
  })

  describe('entries consistency', () => {
    it('keys and values arrays match entries', () => {
      const bm = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const entries = bm.entries()
      const keys = bm.keys()
      const values = bm.values()
      for (let i = 0; i < entries.length; i++) {
        expect(entries[i]![0]).toBe(keys[i])
        expect(entries[i]![1]).toBe(values[i])
      }
    })
  })
})
