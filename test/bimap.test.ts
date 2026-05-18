import { describe, it, expect } from 'vitest'
import { Bimap, DEFAULT_BIMAP_OPTIONS } from '../src/core/bimap/bimap.js'

describe('Bimap', () => {
  describe('constructor', () => {
    it('should create an empty bimap with no arguments', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.size).toBe(0)
      expect(bimap.isEmpty).toBe(true)
    })

    it('should create a bimap with initial entries', () => {
      const bimap = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(bimap.size).toBe(3)
      expect(bimap.get('a')).toBe(1)
      expect(bimap.get('b')).toBe(2)
      expect(bimap.get('c')).toBe(3)
    })

    it('should create a bimap with allowOverwrite option set to false', () => {
      const bimap = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bimap.set('a', 1)
      expect(() => bimap.set('b', 1)).toThrow(
        'Value 1 is already mapped to key a',
      )
    })

    it('should use default options when none provided', () => {
      expect(DEFAULT_BIMAP_OPTIONS.allowOverwrite).toBe(true)
    })

    it('should create a bimap with entries and options', () => {
      const bimap = new Bimap<string, number>(
        [['a', 1]],
        { allowOverwrite: false },
      )
      expect(bimap.get('a')).toBe(1)
      expect(bimap.size).toBe(1)
    })
  })

  describe('set / get', () => {
    it('should set and get a value by key', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      expect(bimap.get('a')).toBe(1)
    })

    it('should return undefined for a missing key', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.get('missing')).toBeUndefined()
    })

    it('should overwrite an existing key with a new value', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('a', 2)
      expect(bimap.get('a')).toBe(2)
      expect(bimap.getKey(1)).toBeUndefined()
      expect(bimap.getKey(2)).toBe('a')
      expect(bimap.size).toBe(1)
    })

    it('should be a no-op when setting same key and value', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('a', 1)
      expect(bimap.size).toBe(1)
      expect(bimap.getStatistics().sets).toBe(1)
      expect(bimap.getStatistics().overwrites).toBe(0)
    })

    it('should allow overwriting a value from a different key by default', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('b', 1)
      expect(bimap.get('a')).toBeUndefined()
      expect(bimap.get('b')).toBe(1)
      expect(bimap.getKey(1)).toBe('b')
      expect(bimap.size).toBe(1)
    })

    it('should throw when overwriting a value with allowOverwrite=false', () => {
      const bimap = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bimap.set('a', 1)
      expect(() => bimap.set('b', 1)).toThrow()
    })

    it('should throw with correct message including value and existing key', () => {
      const bimap = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bimap.set('existing', 42)
      expect(() => bimap.set('new', 42)).toThrow(
        'Value 42 is already mapped to key existing',
      )
    })

    it('should not throw when setting same key with different value even with allowOverwrite=false', () => {
      const bimap = new Bimap<string, number>(undefined, { allowOverwrite: false })
      bimap.set('a', 1)
      expect(() => bimap.set('a', 2)).not.toThrow()
      expect(bimap.get('a')).toBe(2)
    })
  })

  describe('getKey (reverse lookup)', () => {
    it('should get the key for a given value', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      expect(bimap.getKey(1)).toBe('a')
    })

    it('should return undefined for a missing value', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.getKey(999)).toBeUndefined()
    })

    it('should track reverse lookups in statistics', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.getKey(1)
      bimap.getKey(2)
      expect(bimap.getStatistics().reverseLookups).toBe(2)
    })
  })

  describe('delete', () => {
    it('should delete an entry by key and return true', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      expect(bimap.delete('a')).toBe(true)
      expect(bimap.get('a')).toBeUndefined()
      expect(bimap.getKey(1)).toBeUndefined()
      expect(bimap.size).toBe(0)
    })

    it('should return false when deleting a non-existent key', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.delete('missing')).toBe(false)
    })

    it('should track deletions in statistics', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.delete('a')
      expect(bimap.getStatistics().deletes).toBe(1)
    })

    it('should not increment deletes stat on failed delete', () => {
      const bimap = new Bimap<string, number>()
      bimap.delete('missing')
      expect(bimap.getStatistics().deletes).toBe(0)
    })
  })

  describe('deleteValue', () => {
    it('should delete an entry by value and return true', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      expect(bimap.deleteValue(1)).toBe(true)
      expect(bimap.get('a')).toBeUndefined()
      expect(bimap.getKey(1)).toBeUndefined()
      expect(bimap.size).toBe(0)
    })

    it('should return false when deleting a non-existent value', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.deleteValue(999)).toBe(false)
    })

    it('should track deletions in statistics', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.deleteValue(1)
      expect(bimap.getStatistics().deletes).toBe(1)
    })
  })

  describe('has / hasValue', () => {
    it('should return true when key exists', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      expect(bimap.has('a')).toBe(true)
    })

    it('should return false when key does not exist', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.has('a')).toBe(false)
    })

    it('should return true when value exists', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      expect(bimap.hasValue(1)).toBe(true)
    })

    it('should return false when value does not exist', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.hasValue(1)).toBe(false)
    })

    it('should reflect state after deletion', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.delete('a')
      expect(bimap.has('a')).toBe(false)
      expect(bimap.hasValue(1)).toBe(false)
    })
  })

  describe('size / isEmpty', () => {
    it('should report correct size', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.size).toBe(0)
      bimap.set('a', 1)
      expect(bimap.size).toBe(1)
      bimap.set('b', 2)
      expect(bimap.size).toBe(2)
    })

    it('should report isEmpty correctly', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.isEmpty).toBe(true)
      bimap.set('a', 1)
      expect(bimap.isEmpty).toBe(false)
    })

    it('should become empty again after all entries deleted', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.delete('a')
      expect(bimap.isEmpty).toBe(true)
      expect(bimap.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('b', 2)
      bimap.clear()
      expect(bimap.size).toBe(0)
      expect(bimap.isEmpty).toBe(true)
      expect(bimap.get('a')).toBeUndefined()
      expect(bimap.getKey(1)).toBeUndefined()
    })

    it('should reset statistics after clear', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.get('a')
      bimap.delete('a')
      bimap.clear()
      const stats = bimap.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.reverseLookups).toBe(0)
      expect(stats.overwrites).toBe(0)
    })

    it('should allow re-adding entries after clear', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.clear()
      bimap.set('b', 2)
      expect(bimap.size).toBe(1)
      expect(bimap.get('b')).toBe(2)
    })
  })

  describe('keys / values / entries', () => {
    it('should return all keys', () => {
      const bimap = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const keys = bimap.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    it('should return all values', () => {
      const bimap = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const values = bimap.values()
      expect(values).toHaveLength(3)
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })

    it('should return all entries as [key, value] pairs', () => {
      const bimap = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const entries = bimap.entries()
      expect(entries).toHaveLength(2)
      expect(entries.find(([k]) => k === 'a')).toEqual(['a', 1])
      expect(entries.find(([k]) => k === 'b')).toEqual(['b', 2])
    })

    it('should return empty arrays for empty bimap', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.keys()).toEqual([])
      expect(bimap.values()).toEqual([])
      expect(bimap.entries()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries with (key, value, bimap) callback', () => {
      const bimap = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const collected: Array<[string, number]> = []
      bimap.forEach((key, value, bm) => {
        expect(bm).toBe(bimap)
        collected.push([key, value])
      })
      expect(collected).toHaveLength(3)
      expect(collected).toContainEqual(['a', 1])
      expect(collected).toContainEqual(['b', 2])
      expect(collected).toContainEqual(['c', 3])
    })

    it('should not call callback for empty bimap', () => {
      const bimap = new Bimap<string, number>()
      let called = false
      bimap.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable with for-of', () => {
      const bimap = new Bimap<string, number>([
        ['x', 10],
        ['y', 20],
      ])
      const collected: Array<[string, number]> = []
      for (const entry of bimap) {
        collected.push(entry)
      }
      expect(collected).toHaveLength(2)
      expect(collected).toContainEqual(['x', 10])
      expect(collected).toContainEqual(['y', 20])
    })

    it('should work with spread operator', () => {
      const bimap = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const arr = [...bimap]
      expect(arr).toHaveLength(2)
    })
  })

  describe('update', () => {
    it('should update an existing key and return true', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      expect(bimap.update('a', 2)).toBe(true)
      expect(bimap.get('a')).toBe(2)
    })

    it('should return false for a non-existent key', () => {
      const bimap = new Bimap<string, number>()
      expect(bimap.update('missing', 1)).toBe(false)
      expect(bimap.size).toBe(0)
    })

    it('should handle bidirectional consistency after update', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.update('a', 2)
      expect(bimap.getKey(1)).toBeUndefined()
      expect(bimap.getKey(2)).toBe('a')
    })
  })

  describe('reverse', () => {
    it('should return a new Bimap with swapped key/value', () => {
      const bimap = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const reversed = bimap.reverse()
      expect(reversed.get(1)).toBe('a')
      expect(reversed.get(2)).toBe('b')
      expect(reversed.getKey('a')).toBe(1)
      expect(reversed.getKey('b')).toBe(2)
    })

    it('should not modify the original bimap', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      const reversed = bimap.reverse()
      expect(bimap.get('a')).toBe(1)
      expect(reversed.get(1)).toBe('a')
    })

    it('should return an empty bimap when reversing an empty one', () => {
      const bimap = new Bimap<string, number>()
      const reversed = bimap.reverse()
      expect(reversed.size).toBe(0)
      expect(reversed.isEmpty).toBe(true)
    })
  })

  describe('getStatistics', () => {
    it('should track sets', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('b', 2)
      expect(bimap.getStatistics().sets).toBe(2)
    })

    it('should track gets', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.get('a')
      bimap.get('b')
      expect(bimap.getStatistics().gets).toBe(2)
    })

    it('should track deletes', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.delete('a')
      bimap.deleteValue('nonexistent')
      expect(bimap.getStatistics().deletes).toBe(1)
    })

    it('should track overwrites', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('a', 2) // overwrite: key 'a' value changed 1→2
      bimap.set('b', 2) // overwrite: value 2 already mapped to 'a', now 'b'
      expect(bimap.getStatistics().overwrites).toBe(2)
    })

    it('should return a copy of statistics', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      const stats1 = bimap.getStatistics()
      const stats2 = bimap.getStatistics()
      expect(stats1).toEqual(stats2)
      expect(stats1).not.toBe(stats2) // different object references
    })
  })

  describe('toJSON / fromJSON', () => {
    it('should serialize to JSON with entries and statistics', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('b', 2)
      bimap.get('a')
      const json = bimap.toJSON()
      expect(json.entries).toHaveLength(2)
      expect(json.statistics.sets).toBe(2)
      expect(json.statistics.gets).toBe(1)
    })

    it('should round-trip through JSON serialize/deserialize', () => {
      const original = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      original.get('a')
      original.delete('b')
      const json = original.toJSON()
      const restored = Bimap.fromJSON(json)
      expect(restored.size).toBe(2)
      expect(restored.get('a')).toBe(1)
      expect(restored.get('c')).toBe(3)
      expect(restored.has('b')).toBe(false)
    })

    it('should create a Bimap from JSON with options', () => {
      const json = {
        entries: [['a', 1]] as [string, number][],
        statistics: { sets: 0, gets: 0, deletes: 0, reverseLookups: 0, overwrites: 0 },
      }
      const bimap = Bimap.fromJSON<string, number>(json, { allowOverwrite: false })
      expect(bimap.get('a')).toBe(1)
    })

    it('should handle empty bimap JSON', () => {
      const bimap = new Bimap<string, number>()
      const json = bimap.toJSON()
      expect(json.entries).toEqual([])
      const restored = Bimap.fromJSON(json)
      expect(restored.size).toBe(0)
    })

    it('should preserve entry order in toJSON', () => {
      const bimap = new Bimap<string, number>([
        ['first', 1],
        ['second', 2],
        ['third', 3],
      ])
      const json = bimap.toJSON()
      expect(json.entries[0]).toEqual(['first', 1])
      expect(json.entries[1]).toEqual(['second', 2])
      expect(json.entries[2]).toEqual(['third', 3])
    })
  })

  describe('edge cases and complex scenarios', () => {
    it('should handle set-delete-set cycle for same key', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.delete('a')
      bimap.set('a', 2)
      expect(bimap.get('a')).toBe(2)
      expect(bimap.getKey(2)).toBe('a')
      expect(bimap.getKey(1)).toBeUndefined()
    })

    it('should handle re-adding a deleted value to a different key', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.delete('a')
      bimap.set('b', 1)
      expect(bimap.get('b')).toBe(1)
      expect(bimap.getKey(1)).toBe('b')
      expect(bimap.size).toBe(1)
    })

    it('should handle large datasets', () => {
      const bimap = new Bimap<number, number>()
      const count = 10000
      for (let i = 0; i < count; i++) {
        bimap.set(i, i * 2)
      }
      expect(bimap.size).toBe(count)
      expect(bimap.get(5000)).toBe(10000)
      expect(bimap.getKey(10000)).toBe(5000)
    })

    it('should maintain bidirectional consistency after many operations', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('b', 2)
      bimap.set('c', 3)
      bimap.delete('b')
      bimap.set('d', 4)
      bimap.update('a', 10)

      // Verify all forward and reverse mappings
      expect(bimap.get('a')).toBe(10)
      expect(bimap.getKey(10)).toBe('a')
      expect(bimap.get('c')).toBe(3)
      expect(bimap.getKey(3)).toBe('c')
      expect(bimap.get('d')).toBe(4)
      expect(bimap.getKey(4)).toBe('d')
      // 'b' is deleted, value 2 is gone
      expect(bimap.has('b')).toBe(false)
      expect(bimap.hasValue(2)).toBe(false)
      // Original value for 'a' is gone
      expect(bimap.hasValue(1)).toBe(false)
    })

    it('should handle number keys correctly', () => {
      const bimap = new Bimap<number, string>()
      bimap.set(1, 'one')
      bimap.set(2, 'two')
      expect(bimap.get(1)).toBe('one')
      expect(bimap.getKey('two')).toBe(2)
    })

    it('should handle entries after mixed add/delete operations', () => {
      const bimap = new Bimap<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      bimap.delete('b')
      bimap.set('d', 4)
      const entries = bimap.entries()
      expect(entries).toHaveLength(3)
      expect(entries.find(([k]) => k === 'a')).toEqual(['a', 1])
      expect(entries.find(([k]) => k === 'c')).toEqual(['c', 3])
      expect(entries.find(([k]) => k === 'd')).toEqual(['d', 4])
      expect(entries.find(([k]) => k === 'b')).toBeUndefined()
    })

    it('should not leak entries in reverse map after overwrite', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('a', 2)
      // Old value 1 should be completely gone
      expect(bimap.hasValue(1)).toBe(false)
      expect(bimap.getKey(1)).toBeUndefined()
    })

    it('should not leak entries in forward map after value overwrite', () => {
      const bimap = new Bimap<string, number>()
      bimap.set('a', 1)
      bimap.set('b', 1) // 'a' gets evicted because value 1 is taken
      expect(bimap.has('a')).toBe(false)
      expect(bimap.get('a')).toBeUndefined()
    })
  })
})
