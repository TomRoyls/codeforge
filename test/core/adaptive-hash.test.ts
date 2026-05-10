import { describe, it, expect, beforeEach } from 'vitest'
import { AdaptiveHash } from '../../src/core/adaptive-hash/adaptive-hash.js'
import { DEFAULT_ADAPTIVE_HASH_OPTIONS } from '../../src/core/adaptive-hash/types.js'

describe('AdaptiveHash', () => {
  let map: AdaptiveHash<string, number>

  beforeEach(() => {
    map = new AdaptiveHash()
  })

  describe('constructor', () => {
    it('creates an empty map with default options', () => {
      const m = new AdaptiveHash<string, number>()
      expect(m.size).toBe(0)
      expect(m.isEmpty).toBe(true)
      expect(m.getCurrentStrategy()).toBe('array')
    })

    it('accepts custom options', () => {
      const m = new AdaptiveHash<string, number>({
        arrayToProbingThreshold: 4,
        probingToChainedThreshold: 16,
      })
      expect(m.getCurrentStrategy()).toBe('array')
    })

    it('accepts partial options using defaults for rest', () => {
      const m = new AdaptiveHash<string, number>({ arrayToProbingThreshold: 2 })
      expect(m.getCurrentStrategy()).toBe('array')
    })
  })

  describe('DEFAULT_ADAPTIVE_HASH_OPTIONS', () => {
    it('has arrayToProbingThreshold of 8', () => {
      expect(DEFAULT_ADAPTIVE_HASH_OPTIONS.arrayToProbingThreshold).toBe(8)
    })

    it('has probingToChainedThreshold of 128', () => {
      expect(DEFAULT_ADAPTIVE_HASH_OPTIONS.probingToChainedThreshold).toBe(128)
    })

    it('has loadFactor of 0.75', () => {
      expect(DEFAULT_ADAPTIVE_HASH_OPTIONS.loadFactor).toBe(0.75)
    })
  })

  describe('set and get (array strategy)', () => {
    it('stores and retrieves a value', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing key', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('stores multiple keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
      expect(map.size).toBe(3)
    })

    it('handles various value types', () => {
      const m = new AdaptiveHash<string, unknown>()
      m.set('str', 'hello')
      m.set('num', 42)
      m.set('obj', { foo: 'bar' })
      m.set('arr', [1, 2, 3])
      m.set('null', null)
      m.set('bool', true)
      expect(m.get('str')).toBe('hello')
      expect(m.get('num')).toBe(42)
      expect(m.get('obj')).toEqual({ foo: 'bar' })
      expect(m.get('arr')).toEqual([1, 2, 3])
      expect(m.get('null')).toBeNull()
      expect(m.get('bool')).toBe(true)
    })

    it('increments size on new insert', () => {
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
    })

    it('does not increment size on overwrite', () => {
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      expect(map.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('removes an existing key', () => {
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
      expect(map.size).toBe(0)
    })

    it('returns false for missing key', () => {
      expect(map.delete('missing')).toBe(false)
    })

    it('does not affect other keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(1)
    })

    it('can delete and re-add', () => {
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
      expect(map.size).toBe(1)
    })
  })

  describe('size and isEmpty', () => {
    it('reports correct size', () => {
      expect(map.size).toBe(0)
      map.set('a', 1)
      expect(map.size).toBe(1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('isEmpty reflects state', () => {
      expect(map.isEmpty).toBe(true)
      map.set('a', 1)
      expect(map.isEmpty).toBe(false)
      map.delete('a')
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
      expect(map.get('a')).toBeUndefined()
    })

    it('resets strategy to array', () => {
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.getCurrentStrategy()).toBe('probing')
      map.clear()
      expect(map.getCurrentStrategy()).toBe('array')
    })

    it('allows reuse after clear', () => {
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.get('b')).toBe(2)
      expect(map.size).toBe(1)
    })
  })

  describe('keys', () => {
    it('returns all keys', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      const keys = map.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    it('returns empty array when empty', () => {
      expect(map.keys()).toEqual([])
    })
  })

  describe('values', () => {
    it('returns all values', () => {
      map.set('a', 1)
      map.set('b', 2)
      const vals = map.values()
      expect(vals).toHaveLength(2)
      expect(vals).toContain(1)
      expect(vals).toContain(2)
    })

    it('returns empty array when empty', () => {
      expect(map.values()).toEqual([])
    })
  })

  describe('entries', () => {
    it('returns all entries as [key, value] pairs', () => {
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries).toHaveLength(2)
      expect(entries).toContainEqual(['a', 1])
      expect(entries).toContainEqual(['b', 2])
    })

    it('returns empty array when empty', () => {
      expect(map.entries()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      map.set('a', 1)
      map.set('b', 2)
      const collected: [string, number][] = []
      map.forEach((v, k, m) => {
        collected.push([k, v])
        expect(m).toBe(map)
      })
      expect(collected).toHaveLength(2)
    })

    it('does nothing on empty map', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      map.set('a', 1)
      map.set('b', 2)
      const result: [string, number][] = []
      for (const entry of map) {
        result.push(entry)
      }
      expect(result).toHaveLength(2)
      expect(result).toContainEqual(['a', 1])
      expect(result).toContainEqual(['b', 2])
    })

    it('works with spread', () => {
      map.set('a', 1)
      map.set('b', 2)
      const arr = [...map]
      expect(arr).toHaveLength(2)
    })
  })

  describe('toArray', () => {
    it('returns entries as array', () => {
      map.set('a', 1)
      map.set('b', 2)
      const arr = map.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).toContainEqual(['a', 1])
      expect(arr).toContainEqual(['b', 2])
    })
  })

  describe('getCurrentStrategy', () => {
    it('starts as array', () => {
      expect(map.getCurrentStrategy()).toBe('array')
    })

    it('switches to probing at threshold', () => {
      for (let i = 0; i < 8; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.getCurrentStrategy()).toBe('probing')
    })

    it('switches to chained at threshold', () => {
      for (let i = 0; i < 128; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.getCurrentStrategy()).toBe('chained')
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const stats = map.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.strategySwitches).toBe(0)
      expect(stats.currentStrategy).toBe('array')
      expect(stats.probes).toBe(0)
    })

    it('tracks inserts', () => {
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getStatistics().inserts).toBe(2)
    })

    it('tracks deletes', () => {
      map.set('a', 1)
      map.delete('a')
      map.delete('missing')
      expect(map.getStatistics().deletes).toBe(2)
    })

    it('tracks lookups from get', () => {
      map.set('a', 1)
      map.get('a')
      map.get('missing')
      expect(map.getStatistics().lookups).toBe(2)
    })

    it('tracks lookups from has', () => {
      map.set('a', 1)
      map.has('a')
      map.has('missing')
      expect(map.getStatistics().lookups).toBe(2)
    })

    it('tracks strategy switches', () => {
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.getStatistics().strategySwitches).toBe(1)
    })

    it('returns a copy not a reference', () => {
      map.set('a', 1)
      const s1 = map.getStatistics()
      map.set('b', 2)
      const s2 = map.getStatistics()
      expect(s1.inserts).toBe(1)
      expect(s2.inserts).toBe(2)
    })

    it('tracks probes', () => {
      map.set('a', 1)
      map.get('a')
      expect(map.getStatistics().probes).toBeGreaterThan(0)
    })
  })

  describe('strategy transitions', () => {
    it('array to probing preserves data', () => {
      for (let i = 0; i < 8; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.getCurrentStrategy()).toBe('probing')
      for (let i = 0; i < 8; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
      expect(map.size).toBe(8)
    })

    it('probing to chained preserves data', () => {
      for (let i = 0; i < 128; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.getCurrentStrategy()).toBe('chained')
      for (let i = 0; i < 128; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
      expect(map.size).toBe(128)
    })

    it('custom thresholds work', () => {
      const m = new AdaptiveHash<string, number>({
        arrayToProbingThreshold: 3,
        probingToChainedThreshold: 10,
      })
      m.set('a', 1)
      m.set('b', 2)
      expect(m.getCurrentStrategy()).toBe('array')
      m.set('c', 3)
      expect(m.getCurrentStrategy()).toBe('probing')
      for (let i = 4; i <= 10; i++) {
        m.set(`key${i}`, i)
      }
      expect(m.getCurrentStrategy()).toBe('chained')
    })

    it('can add after strategy switch', () => {
      for (let i = 0; i < 8; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.getCurrentStrategy()).toBe('probing')
      map.set('extra', 999)
      expect(map.get('extra')).toBe(999)
      expect(map.size).toBe(9)
    })
  })

  describe('probing strategy operations', () => {
    beforeEach(() => {
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i)
      }
    })

    it('gets all values correctly', () => {
      for (let i = 0; i < 10; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })

    it('overwrites in probing', () => {
      map.set('key5', 999)
      expect(map.get('key5')).toBe(999)
      expect(map.size).toBe(10)
    })

    it('deletes in probing', () => {
      expect(map.delete('key3')).toBe(true)
      expect(map.get('key3')).toBeUndefined()
      expect(map.size).toBe(9)
    })

    it('has works in probing', () => {
      expect(map.has('key5')).toBe(true)
      expect(map.has('nonexistent')).toBe(false)
    })

    it('keys works in probing', () => {
      const keys = map.keys()
      expect(keys).toHaveLength(10)
    })

    it('values works in probing', () => {
      const vals = map.values()
      expect(vals).toHaveLength(10)
    })

    it('entries works in probing', () => {
      const entries = map.entries()
      expect(entries).toHaveLength(10)
    })

    it('forEach works in probing', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(10)
    })

    it('iterator works in probing', () => {
      const arr = [...map]
      expect(arr).toHaveLength(10)
    })

    it('handles tombstone reuse', () => {
      map.delete('key3')
      map.set('key3', 333)
      expect(map.get('key3')).toBe(333)
      expect(map.size).toBe(10)
    })

    it('returns false for deleting non-existent in probing', () => {
      expect(map.delete('nonexistent')).toBe(false)
    })
  })

  describe('chained strategy operations', () => {
    beforeEach(() => {
      for (let i = 0; i < 150; i++) {
        map.set(`key${i}`, i)
      }
    })

    it('gets all values correctly', () => {
      for (let i = 0; i < 150; i++) {
        expect(map.get(`key${i}`)).toBe(i)
      }
    })

    it('overwrites in chained', () => {
      map.set('key50', 999)
      expect(map.get('key50')).toBe(999)
      expect(map.size).toBe(150)
    })

    it('deletes in chained', () => {
      expect(map.delete('key10')).toBe(true)
      expect(map.get('key10')).toBeUndefined()
      expect(map.size).toBe(149)
    })

    it('deletes head of chain', () => {
      const key = map.keys()[0]!
      expect(map.delete(key)).toBe(true)
      expect(map.has(key)).toBe(false)
    })

    it('has works in chained', () => {
      expect(map.has('key50')).toBe(true)
      expect(map.has('nonexistent')).toBe(false)
    })

    it('keys works in chained', () => {
      expect(map.keys()).toHaveLength(150)
    })

    it('values works in chained', () => {
      expect(map.values()).toHaveLength(150)
    })

    it('entries works in chained', () => {
      expect(map.entries()).toHaveLength(150)
    })

    it('forEach works in chained', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(150)
    })

    it('iterator works in chained', () => {
      const arr = [...map]
      expect(arr).toHaveLength(150)
    })

    it('returns false for deleting non-existent in chained', () => {
      expect(map.delete('nonexistent')).toBe(false)
    })

    it('toArray works in chained', () => {
      expect(map.toArray()).toHaveLength(150)
    })
  })

  describe('numeric keys', () => {
    it('works with number keys', () => {
      const m = new AdaptiveHash<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
    })

    it('survives strategy switch with number keys', () => {
      const m = new AdaptiveHash<number, string>()
      for (let i = 0; i < 10; i++) {
        m.set(i, `val${i}`)
      }
      expect(m.getCurrentStrategy()).toBe('probing')
      for (let i = 0; i < 10; i++) {
        expect(m.get(i)).toBe(`val${i}`)
      }
    })
  })

  describe('object keys', () => {
    it('works with object references as keys', () => {
      const m = new AdaptiveHash<object, string>()
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      m.set(obj1, 'first')
      m.set(obj2, 'second')
      expect(m.get(obj1)).toBe('first')
      expect(m.get(obj2)).toBe('second')
    })

    it('same object reference retrieves correct value', () => {
      const m = new AdaptiveHash<object, string>()
      const obj = { id: 1 }
      m.set(obj, 'value')
      expect(m.get(obj)).toBe('value')
    })
  })

  describe('edge cases', () => {
    it('handles empty string key', () => {
      map.set('', 0)
      expect(map.get('')).toBe(0)
      expect(map.has('')).toBe(true)
    })

    it('handles undefined value', () => {
      const m = new AdaptiveHash<string, number | undefined>()
      m.set('a', undefined)
      expect(m.get('a')).toBeUndefined()
      expect(m.has('a')).toBe(true)
    })

    it('handles zero as value', () => {
      map.set('a', 0)
      expect(map.get('a')).toBe(0)
    })

    it('handles false as value', () => {
      const m = new AdaptiveHash<string, boolean>()
      m.set('a', false)
      expect(m.get('a')).toBe(false)
      expect(m.has('a')).toBe(true)
    })

    it('handles large number of operations', () => {
      const m = new AdaptiveHash<number, number>({
        arrayToProbingThreshold: 4,
        probingToChainedThreshold: 32,
      })
      for (let i = 0; i < 200; i++) {
        m.set(i, i * 10)
      }
      expect(m.size).toBe(200)
      expect(m.getCurrentStrategy()).toBe('chained')
      for (let i = 0; i < 200; i++) {
        expect(m.get(i)).toBe(i * 10)
      }
    })

    it('handles many deletes and re-inserts', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      map.delete('b')
      expect(map.size).toBe(0)
      map.set('a', 10)
      map.set('b', 20)
      expect(map.get('a')).toBe(10)
      expect(map.get('b')).toBe(20)
    })
  })

  describe('clear resets everything', () => {
    it('resets after probing operations', () => {
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
      expect(map.getCurrentStrategy()).toBe('array')
      expect(map.keys()).toEqual([])
      expect(map.values()).toEqual([])
      expect(map.entries()).toEqual([])
    })

    it('resets after chained operations', () => {
      for (let i = 0; i < 200; i++) {
        map.set(`k${i}`, i)
      }
      map.clear()
      expect(map.size).toBe(0)
      expect(map.getCurrentStrategy()).toBe('array')
    })
  })

  describe('getStatistics across strategies', () => {
    it('counts probes in array strategy', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.has('a')
      const stats = map.getStatistics()
      expect(stats.probes).toBeGreaterThan(0)
    })

    it('counts probes in probing strategy', () => {
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      const before = map.getStatistics().probes
      map.has('k5')
      const after = map.getStatistics().probes
      expect(after).toBeGreaterThan(before)
    })

    it('counts probes in chained strategy', () => {
      for (let i = 0; i < 150; i++) {
        map.set(`k${i}`, i)
      }
      const before = map.getStatistics().probes
      map.has('k50')
      const after = map.getStatistics().probes
      expect(after).toBeGreaterThan(before)
    })

    it('counts 2 strategy switches for full lifecycle', () => {
      for (let i = 0; i < 200; i++) {
        map.set(`k${i}`, i)
      }
      expect(map.getStatistics().strategySwitches).toBe(2)
    })
  })

  describe('multiple operations in sequence', () => {
    it('set-get-delete-set cycle', () => {
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
      expect(map.delete('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('many overwrites', () => {
      map.set('a', 1)
      map.set('a', 2)
      map.set('a', 3)
      map.set('a', 4)
      expect(map.get('a')).toBe(4)
      expect(map.size).toBe(1)
    })

    it('delete non-existent then add', () => {
      expect(map.delete('x')).toBe(false)
      map.set('x', 1)
      expect(map.get('x')).toBe(1)
    })
  })

  describe('iteration consistency', () => {
    it('forEach and entries give same count', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      let forEachCount = 0
      map.forEach(() => { forEachCount++ })
      expect(forEachCount).toBe(map.entries().length)
    })

    it('keys and values have same length', () => {
      map.set('a', 1)
      map.set('b', 2)
      expect(map.keys()).toHaveLength(map.values().length)
    })
  })

  describe('full strategy lifecycle', () => {
    it('array -> probing -> chained -> clear -> array', () => {
      expect(map.getCurrentStrategy()).toBe('array')
      for (let i = 0; i < 8; i++) {
        map.set(`k${i}`, i)
      }
      expect(map.getCurrentStrategy()).toBe('probing')
      for (let i = 8; i < 128; i++) {
        map.set(`k${i}`, i)
      }
      expect(map.getCurrentStrategy()).toBe('chained')
      for (let i = 0; i < 128; i++) {
        expect(map.get(`k${i}`)).toBe(i)
      }
      map.clear()
      expect(map.getCurrentStrategy()).toBe('array')
      expect(map.size).toBe(0)
    })
  })

  describe('getStatistics lookups counter', () => {
    it('increments on get', () => {
      map.set('a', 1)
      map.get('a')
      map.get('b')
      expect(map.getStatistics().lookups).toBe(2)
    })

    it('increments on has', () => {
      map.set('a', 1)
      map.has('a')
      map.has('b')
      expect(map.getStatistics().lookups).toBe(2)
    })

    it('increments on both get and has', () => {
      map.set('a', 1)
      map.get('a')
      map.has('a')
      expect(map.getStatistics().lookups).toBe(2)
    })
  })

  describe('getStatistics deletes counter', () => {
    it('increments on successful delete', () => {
      map.set('a', 1)
      map.delete('a')
      expect(map.getStatistics().deletes).toBe(1)
    })

    it('increments on failed delete', () => {
      map.delete('missing')
      expect(map.getStatistics().deletes).toBe(1)
    })
  })

  describe('probing with deletions', () => {
    it('correctly handles delete then lookup in probing', () => {
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      map.delete('k5')
      expect(map.get('k5')).toBeUndefined()
      expect(map.get('k6')).toBe(6)
    })

    it('handles reinsert after delete in probing', () => {
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      map.delete('k3')
      map.set('k3', 333)
      expect(map.get('k3')).toBe(333)
      expect(map.size).toBe(10)
    })
  })

  describe('chained with deletions', () => {
    it('correctly handles delete then lookup in chained', () => {
      for (let i = 0; i < 150; i++) {
        map.set(`k${i}`, i)
      }
      map.delete('k50')
      expect(map.get('k50')).toBeUndefined()
      expect(map.get('k51')).toBe(51)
    })

    it('handles reinsert after delete in chained', () => {
      for (let i = 0; i < 150; i++) {
        map.set(`k${i}`, i)
      }
      map.delete('k50')
      map.set('k50', 500)
      expect(map.get('k50')).toBe(500)
      expect(map.size).toBe(150)
    })
  })

  describe('keys/values/entries consistency across strategies', () => {
    it('array strategy entries match set data', () => {
      map.set('x', 10)
      map.set('y', 20)
      const entries = map.entries()
      expect(entries).toContainEqual(['x', 10])
      expect(entries).toContainEqual(['y', 20])
    })

    it('probing strategy entries match set data', () => {
      for (let i = 0; i < 10; i++) {
        map.set(`k${i}`, i)
      }
      const entries = map.entries()
      for (let i = 0; i < 10; i++) {
        expect(entries).toContainEqual([`k${i}`, i])
      }
    })

    it('chained strategy entries match set data', () => {
      for (let i = 0; i < 130; i++) {
        map.set(`k${i}`, i)
      }
      const entries = map.entries()
      for (let i = 0; i < 130; i++) {
        expect(entries).toContainEqual([`k${i}`, i])
      }
    })
  })

  describe('stress test', () => {
    it('handles 500 inserts, deletions, and lookups', () => {
      const m = new AdaptiveHash<number, number>({
        arrayToProbingThreshold: 5,
        probingToChainedThreshold: 20,
      })
      for (let i = 0; i < 500; i++) {
        m.set(i, i * 2)
      }
      expect(m.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(m.get(i)).toBe(i * 2)
      }
      for (let i = 0; i < 250; i++) {
        expect(m.delete(i)).toBe(true)
      }
      expect(m.size).toBe(250)
      for (let i = 250; i < 500; i++) {
        expect(m.get(i)).toBe(i * 2)
      }
      for (let i = 0; i < 250; i++) {
        expect(m.get(i)).toBeUndefined()
      }
    })
  })

  describe('custom loadFactor option', () => {
    it('accepts custom loadFactor', () => {
      const m = new AdaptiveHash<string, number>({ loadFactor: 0.5 })
      m.set('a', 1)
      expect(m.get('a')).toBe(1)
    })
  })

  describe('special key values', () => {
    it('handles key "0"', () => {
      const m = new AdaptiveHash<string, number>()
      m.set('0', 42)
      expect(m.get('0')).toBe(42)
    })

    it('handles key "null" string', () => {
      const m = new AdaptiveHash<string, number>()
      m.set('null', 42)
      expect(m.get('null')).toBe(42)
    })

    it('handles key "undefined" string', () => {
      const m = new AdaptiveHash<string, number>()
      m.set('undefined', 42)
      expect(m.get('undefined')).toBe(42)
    })

    it('distinguishes "1" and 1 as keys', () => {
      const m = new AdaptiveHash<string | number, string>()
      m.set('1', 'string-one')
      m.set(1, 'number-one')
      expect(m.get('1')).toBe('string-one')
      expect(m.get(1)).toBe('number-one')
    })
  })

  describe('getStatistics inserts counter', () => {
    it('only counts new inserts not overwrites', () => {
      map.set('a', 1)
      map.set('b', 2)
      map.set('a', 3)
      expect(map.getStatistics().inserts).toBe(2)
    })
  })
})
