import { describe, it, expect, beforeEach } from 'vitest'
import { RingBufferMap } from '../../src/core/ring-buffer-map/ring-buffer-map.js'
import { DEFAULT_RING_BUFFER_MAP_OPTIONS } from '../../src/core/ring-buffer-map/types.js'
import type { RingBufferMapOptions, RingBufferMapJSON, RingBufferMapStatistics } from '../../src/core/ring-buffer-map/types.js'

describe('RingBufferMap', () => {
  let rbm: RingBufferMap<string, number>

  beforeEach(() => {
    rbm = new RingBufferMap(5)
  })

  describe('constructor', () => {
    it('should create with number capacity', () => {
      const r = new RingBufferMap(10)
      expect(r.capacity).toBe(10)
      expect(r.size).toBe(0)
      expect(r.isEmpty).toBe(true)
    })

    it('should create with options object', () => {
      const r = new RingBufferMap<string, number>({ capacity: 20 })
      expect(r.capacity).toBe(20)
    })

    it('should throw on zero capacity', () => {
      expect(() => new RingBufferMap(0)).toThrow('Capacity must be a positive integer')
    })

    it('should throw on negative capacity', () => {
      expect(() => new RingBufferMap(-5)).toThrow('Capacity must be a positive integer')
    })

    it('should throw on non-integer capacity', () => {
      expect(() => new RingBufferMap(3.5)).toThrow('Capacity must be a positive integer')
    })

    it('should throw on NaN capacity', () => {
      expect(() => new RingBufferMap(NaN)).toThrow('Capacity must be a positive integer')
    })

    it('should throw on Infinity capacity', () => {
      expect(() => new RingBufferMap(Infinity)).toThrow('Capacity must be a positive integer')
    })

    it('should create with default options when no args', () => {
      const r = new RingBufferMap({ capacity: DEFAULT_RING_BUFFER_MAP_OPTIONS.capacity })
      expect(r.capacity).toBe(DEFAULT_RING_BUFFER_MAP_OPTIONS.capacity)
    })

    it('should create with capacity of 1', () => {
      const r = new RingBufferMap(1)
      expect(r.capacity).toBe(1)
    })

    it('should start with isFull false', () => {
      expect(rbm.isFull).toBe(false)
    })
  })

  describe('set', () => {
    it('should add a new entry', () => {
      rbm.set('a', 1)
      expect(rbm.size).toBe(1)
      expect(rbm.get('a')).toBe(1)
    })

    it('should return undefined for new entry', () => {
      expect(rbm.set('a', 1)).toBeUndefined()
    })

    it('should add multiple entries', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      expect(rbm.size).toBe(3)
    })

    it('should overwrite existing key and return old value', () => {
      rbm.set('a', 1)
      const old = rbm.set('a', 10)
      expect(old).toBe(1)
      expect(rbm.get('a')).toBe(10)
      expect(rbm.size).toBe(1)
    })

    it('should not change size on overwrite', () => {
      rbm.set('a', 1)
      rbm.set('a', 2)
      expect(rbm.size).toBe(1)
    })

    it('should evict oldest when at capacity', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      const evicted = rbm.set('f', 6)
      expect(evicted).toBe(1)
      expect(rbm.has('a')).toBe(false)
      expect(rbm.get('f')).toBe(6)
    })

    it('should maintain size at capacity after eviction', () => {
      for (let i = 0; i < 10; i++) {
        rbm.set(`k${i}`, i)
      }
      expect(rbm.size).toBe(5)
    })

    it('should handle multiple evictions in order', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      rbm.set('f', 6)
      rbm.set('g', 7)
      expect(rbm.keys()).toEqual(['c', 'd', 'e', 'f', 'g'])
    })

    it('should support undefined as value', () => {
      const r = new RingBufferMap<string, number | undefined>(3)
      r.set('a', undefined)
      expect(r.get('a')).toBeUndefined()
      expect(r.has('a')).toBe(true)
      expect(r.size).toBe(1)
    })

    it('should support null as value', () => {
      const r = new RingBufferMap<string, null>(3)
      r.set('a', null)
      expect(r.get('a')).toBe(null)
      expect(r.has('a')).toBe(true)
    })

    it('should support object values', () => {
      const r = new RingBufferMap<string, { x: number }>(3)
      r.set('a', { x: 1 })
      expect(r.get('a')).toEqual({ x: 1 })
    })

    it('should support number keys', () => {
      const r = new RingBufferMap<number, string>(3)
      r.set(1, 'one')
      r.set(2, 'two')
      expect(r.get(1)).toBe('one')
      expect(r.get(2)).toBe('two')
    })
  })

  describe('get', () => {
    it('should return value for existing key', () => {
      rbm.set('a', 42)
      expect(rbm.get('a')).toBe(42)
    })

    it('should return undefined for missing key', () => {
      expect(rbm.get('missing')).toBeUndefined()
    })

    it('should return undefined after deletion', () => {
      rbm.set('a', 1)
      rbm.delete('a')
      expect(rbm.get('a')).toBeUndefined()
    })

    it('should return updated value after overwrite', () => {
      rbm.set('a', 1)
      rbm.set('a', 99)
      expect(rbm.get('a')).toBe(99)
    })

    it('should track get statistics', () => {
      rbm.set('a', 1)
      rbm.get('a')
      rbm.get('a')
      rbm.get('missing')
      const stats = rbm.getStatistics()
      expect(stats.gets).toBe(3)
    })
  })

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      rbm.set('a', 1)
      expect(rbm.delete('a')).toBe(true)
      expect(rbm.has('a')).toBe(false)
    })

    it('should return false for missing key', () => {
      expect(rbm.delete('missing')).toBe(false)
    })

    it('should decrement size', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.delete('a')
      expect(rbm.size).toBe(1)
    })

    it('should handle delete and re-add', () => {
      rbm.set('a', 1)
      rbm.delete('a')
      rbm.set('a', 2)
      expect(rbm.get('a')).toBe(2)
      expect(rbm.size).toBe(1)
    })

    it('should handle deleting middle entry', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.delete('b')
      expect(rbm.keys()).toEqual(['a', 'c'])
    })

    it('should handle deleting first entry', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.delete('a')
      expect(rbm.keys()).toEqual(['b', 'c'])
    })

    it('should handle deleting last entry', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.delete('c')
      expect(rbm.keys()).toEqual(['a', 'b'])
    })

    it('should handle deleting all entries', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.delete('a')
      rbm.delete('b')
      expect(rbm.isEmpty).toBe(true)
      expect(rbm.size).toBe(0)
    })

    it('should track delete statistics', () => {
      rbm.set('a', 1)
      rbm.delete('a')
      rbm.delete('missing')
      const stats = rbm.getStatistics()
      expect(stats.deletes).toBe(2)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      rbm.set('a', 1)
      expect(rbm.has('a')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(rbm.has('missing')).toBe(false)
    })

    it('should return false after delete', () => {
      rbm.set('a', 1)
      rbm.delete('a')
      expect(rbm.has('a')).toBe(false)
    })

    it('should return false after eviction', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      rbm.set('f', 6)
      expect(rbm.has('a')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 when empty', () => {
      expect(rbm.size).toBe(0)
    })

    it('should increase on set', () => {
      rbm.set('a', 1)
      expect(rbm.size).toBe(1)
    })

    it('should not increase on overwrite', () => {
      rbm.set('a', 1)
      rbm.set('a', 2)
      expect(rbm.size).toBe(1)
    })

    it('should decrease on delete', () => {
      rbm.set('a', 1)
      rbm.delete('a')
      expect(rbm.size).toBe(0)
    })

    it('should equal capacity when full', () => {
      for (let i = 0; i < 5; i++) rbm.set(`k${i}`, i)
      expect(rbm.size).toBe(5)
    })

    it('should stay at capacity after eviction', () => {
      for (let i = 0; i < 7; i++) rbm.set(`k${i}`, i)
      expect(rbm.size).toBe(5)
    })
  })

  describe('isEmpty', () => {
    it('should be true when empty', () => {
      expect(rbm.isEmpty).toBe(true)
    })

    it('should be false after add', () => {
      rbm.set('a', 1)
      expect(rbm.isEmpty).toBe(false)
    })

    it('should be true after clearing all', () => {
      rbm.set('a', 1)
      rbm.delete('a')
      expect(rbm.isEmpty).toBe(true)
    })
  })

  describe('capacity', () => {
    it('should return the configured capacity', () => {
      expect(rbm.capacity).toBe(5)
    })

    it('should remain constant', () => {
      for (let i = 0; i < 10; i++) rbm.set(`k${i}`, i)
      expect(rbm.capacity).toBe(5)
    })
  })

  describe('isFull', () => {
    it('should be false when not full', () => {
      expect(rbm.isFull).toBe(false)
    })

    it('should be true when at capacity', () => {
      for (let i = 0; i < 5; i++) rbm.set(`k${i}`, i)
      expect(rbm.isFull).toBe(true)
    })

    it('should remain true after eviction', () => {
      for (let i = 0; i < 6; i++) rbm.set(`k${i}`, i)
      expect(rbm.isFull).toBe(true)
    })

    it('should be false after delete', () => {
      for (let i = 0; i < 5; i++) rbm.set(`k${i}`, i)
      rbm.delete('k0')
      expect(rbm.isFull).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.clear()
      expect(rbm.size).toBe(0)
      expect(rbm.isEmpty).toBe(true)
    })

    it('should make has return false for all keys', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.clear()
      expect(rbm.has('a')).toBe(false)
      expect(rbm.has('b')).toBe(false)
    })

    it('should reset statistics', () => {
      rbm.set('a', 1)
      rbm.get('a')
      rbm.clear()
      const stats = rbm.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.maxSize).toBe(0)
    })

    it('should allow reuse after clear', () => {
      rbm.set('a', 1)
      rbm.clear()
      rbm.set('b', 2)
      expect(rbm.get('b')).toBe(2)
      expect(rbm.size).toBe(1)
    })

    it('should be safe to call on empty map', () => {
      rbm.clear()
      expect(rbm.isEmpty).toBe(true)
    })
  })

  describe('peekOldest', () => {
    it('should return undefined when empty', () => {
      expect(rbm.peekOldest()).toBeUndefined()
    })

    it('should return the oldest entry', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      expect(rbm.peekOldest()).toEqual(['a', 1])
    })

    it('should return oldest after eviction', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      rbm.set('f', 6)
      expect(rbm.peekOldest()).toEqual(['b', 2])
    })

    it('should not modify the map', () => {
      rbm.set('a', 1)
      rbm.peekOldest()
      expect(rbm.size).toBe(1)
      expect(rbm.has('a')).toBe(true)
    })

    it('should update after delete', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.delete('a')
      expect(rbm.peekOldest()).toEqual(['b', 2])
    })
  })

  describe('peekNewest', () => {
    it('should return undefined when empty', () => {
      expect(rbm.peekNewest()).toBeUndefined()
    })

    it('should return the newest entry', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      expect(rbm.peekNewest()).toEqual(['c', 3])
    })

    it('should update after new set', () => {
      rbm.set('a', 1)
      expect(rbm.peekNewest()).toEqual(['a', 1])
      rbm.set('b', 2)
      expect(rbm.peekNewest()).toEqual(['b', 2])
    })

    it('should not modify the map', () => {
      rbm.set('a', 1)
      rbm.peekNewest()
      expect(rbm.size).toBe(1)
    })

    it('should update after eviction', () => {
      for (let i = 0; i < 10; i++) rbm.set(`k${i}`, i)
      expect(rbm.peekNewest()).toEqual(['k9', 9])
    })
  })

  describe('keys', () => {
    it('should return empty array when empty', () => {
      expect(rbm.keys()).toEqual([])
    })

    it('should return keys in insertion order', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      expect(rbm.keys()).toEqual(['a', 'b', 'c'])
    })

    it('should maintain order after eviction', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      rbm.set('f', 6)
      expect(rbm.keys()).toEqual(['b', 'c', 'd', 'e', 'f'])
    })

    it('should skip deleted entries', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.delete('b')
      expect(rbm.keys()).toEqual(['a', 'c'])
    })
  })

  describe('values', () => {
    it('should return empty array when empty', () => {
      expect(rbm.values()).toEqual([])
    })

    it('should return values in insertion order', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      expect(rbm.values()).toEqual([1, 2, 3])
    })

    it('should reflect updated values after overwrite', () => {
      rbm.set('a', 1)
      rbm.set('a', 99)
      rbm.set('b', 2)
      expect(rbm.values()).toEqual([99, 2])
    })
  })

  describe('entries', () => {
    it('should return empty array when empty', () => {
      expect(rbm.entries()).toEqual([])
    })

    it('should return entries in insertion order', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      expect(rbm.entries()).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should reflect eviction correctly', () => {
      for (let i = 0; i < 7; i++) rbm.set(`k${i}`, i)
      const e = rbm.entries()
      expect(e.length).toBe(5)
      expect(e[0]).toEqual(['k2', 2])
      expect(e[4]).toEqual(['k6', 6])
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty map', () => {
      let count = 0
      rbm.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate in insertion order', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      const result: Array<[string, number]> = []
      rbm.forEach((v, k) => { result.push([k, v]) })
      expect(result).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should pass the map as third argument', () => {
      rbm.set('a', 1)
      let received: RingBufferMap<string, number> | undefined
      rbm.forEach((_v, _k, m) => { received = m })
      expect(received).toBe(rbm)
    })

    it('should skip deleted entries', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.delete('b')
      const result: number[] = []
      rbm.forEach((v) => { result.push(v) })
      expect(result).toEqual([1, 3])
    })
  })

  describe('Symbol.iterator', () => {
    it('should return empty iterator for empty map', () => {
      expect([...rbm]).toEqual([])
    })

    it('should iterate in insertion order', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      expect([...rbm]).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should work with for-of', () => {
      rbm.set('x', 10)
      rbm.set('y', 20)
      const result: Array<[string, number]> = []
      for (const entry of rbm) {
        result.push(entry)
      }
      expect(result).toEqual([['x', 10], ['y', 20]])
    })

    it('should work with spread in destructuring', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      const [first, second] = rbm
      expect(first).toEqual(['a', 1])
      expect(second).toEqual(['b', 2])
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = rbm.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.evictions).toBe(0)
      expect(stats.overwrites).toBe(0)
      expect(stats.maxSize).toBe(0)
    })

    it('should track sets', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      expect(rbm.getStatistics().sets).toBe(2)
    })

    it('should track gets', () => {
      rbm.set('a', 1)
      rbm.get('a')
      rbm.get('a')
      expect(rbm.getStatistics().gets).toBe(2)
    })

    it('should track deletes', () => {
      rbm.set('a', 1)
      rbm.delete('a')
      rbm.delete('missing')
      expect(rbm.getStatistics().deletes).toBe(2)
    })

    it('should track evictions', () => {
      for (let i = 0; i < 10; i++) rbm.set(`k${i}`, i)
      expect(rbm.getStatistics().evictions).toBe(5)
    })

    it('should track overwrites', () => {
      rbm.set('a', 1)
      rbm.set('a', 2)
      rbm.set('a', 3)
      expect(rbm.getStatistics().overwrites).toBe(2)
    })

    it('should track maxSize', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      expect(rbm.getStatistics().maxSize).toBe(3)
    })

    it('should not decrease maxSize on delete', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.delete('a')
      expect(rbm.getStatistics().maxSize).toBe(2)
    })

    it('should return a copy', () => {
      rbm.set('a', 1)
      const s1 = rbm.getStatistics()
      rbm.set('b', 2)
      expect(s1.sets).toBe(1)
      expect(rbm.getStatistics().sets).toBe(2)
    })
  })

  describe('toJSON', () => {
    it('should serialize empty map', () => {
      const json = rbm.toJSON()
      expect(json.entries).toEqual([])
      expect(json.capacity).toBe(5)
      expect(json.statistics).toBeDefined()
    })

    it('should serialize entries', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      const json = rbm.toJSON()
      expect(json.entries).toEqual([['a', 1], ['b', 2]])
    })

    it('should include capacity', () => {
      const json = rbm.toJSON()
      expect(json.capacity).toBe(5)
    })

    it('should include statistics', () => {
      rbm.set('a', 1)
      const json = rbm.toJSON()
      expect(json.statistics.sets).toBe(1)
    })
  })

  describe('fromJSON', () => {
    it('should restore empty map', () => {
      const json: RingBufferMapJSON<string, number> = {
        entries: [],
        capacity: 5,
        statistics: { sets: 0, gets: 0, deletes: 0, evictions: 0, overwrites: 0, maxSize: 0 },
      }
      const r = RingBufferMap.fromJSON(json)
      expect(r.size).toBe(0)
      expect(r.capacity).toBe(5)
    })

    it('should restore entries', () => {
      const json: RingBufferMapJSON<string, number> = {
        entries: [['a', 1], ['b', 2]],
        capacity: 5,
        statistics: { sets: 2, gets: 0, deletes: 0, evictions: 0, overwrites: 0, maxSize: 2 },
      }
      const r = RingBufferMap.fromJSON(json)
      expect(r.get('a')).toBe(1)
      expect(r.get('b')).toBe(2)
      expect(r.size).toBe(2)
    })

    it('should restore capacity', () => {
      const json: RingBufferMapJSON<string, number> = {
        entries: [],
        capacity: 100,
        statistics: { sets: 0, gets: 0, deletes: 0, evictions: 0, overwrites: 0, maxSize: 0 },
      }
      const r = RingBufferMap.fromJSON(json)
      expect(r.capacity).toBe(100)
    })

    it('should restore statistics', () => {
      const json: RingBufferMapJSON<string, number> = {
        entries: [['a', 1]],
        capacity: 5,
        statistics: { sets: 5, gets: 3, deletes: 1, evictions: 2, overwrites: 1, maxSize: 4 },
      }
      const r = RingBufferMap.fromJSON(json)
      const stats = r.getStatistics()
      expect(stats.sets).toBe(5)
      expect(stats.gets).toBe(3)
      expect(stats.deletes).toBe(1)
      expect(stats.evictions).toBe(2)
      expect(stats.overwrites).toBe(1)
      expect(stats.maxSize).toBe(4)
    })

    it('should round-trip via JSON', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      const json = rbm.toJSON()
      const restored = RingBufferMap.fromJSON(json)
      expect(restored.entries()).toEqual(rbm.entries())
      expect(restored.capacity).toBe(rbm.capacity)
    })
  })

  describe('eviction behavior', () => {
    it('should evict in FIFO order', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      expect(rbm.set('f', 6)).toBe(1)
      expect(rbm.set('g', 7)).toBe(2)
    })

    it('should handle capacity of 1', () => {
      const r = new RingBufferMap<string, number>(1)
      expect(r.set('a', 1)).toBeUndefined()
      expect(r.set('b', 2)).toBe(1)
      expect(r.has('a')).toBe(false)
      expect(r.get('b')).toBe(2)
      expect(r.size).toBe(1)
    })

    it('should handle wrap-around correctly', () => {
      for (let i = 0; i < 12; i++) rbm.set(`k${i}`, i)
      expect(rbm.size).toBe(5)
      expect(rbm.keys()).toEqual(['k7', 'k8', 'k9', 'k10', 'k11'])
    })

    it('should evict overwritten entry when it is oldest', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      rbm.set('a', 10)
      expect(rbm.size).toBe(5)
      expect(rbm.get('a')).toBe(10)
      rbm.set('f', 6)
      expect(rbm.has('a')).toBe(false)
      expect(rbm.has('b')).toBe(true)
    })
  })

  describe('delete with compaction', () => {
    it('should maintain insertion order after middle delete', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      rbm.delete('c')
      expect(rbm.keys()).toEqual(['a', 'b', 'd', 'e'])
    })

    it('should allow adding after delete when full', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      rbm.delete('c')
      rbm.set('f', 6)
      expect(rbm.size).toBe(5)
      expect(rbm.isFull).toBe(true)
      expect(rbm.keys()).toEqual(['a', 'b', 'd', 'e', 'f'])
    })

    it('should handle delete from full then eviction', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.set('d', 4)
      rbm.set('e', 5)
      rbm.delete('b')
      rbm.set('f', 6)
      rbm.set('g', 7)
      expect(rbm.keys()).toEqual(['c', 'd', 'e', 'f', 'g'])
    })

    it('should handle multiple interleaved delete and set', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('c', 3)
      rbm.delete('b')
      rbm.set('d', 4)
      rbm.delete('a')
      rbm.set('e', 5)
      expect(rbm.keys()).toEqual(['c', 'd', 'e'])
      expect(rbm.size).toBe(3)
    })
  })

  describe('DEFAULT_RING_BUFFER_MAP_OPTIONS', () => {
    it('should have capacity of 1024', () => {
      expect(DEFAULT_RING_BUFFER_MAP_OPTIONS.capacity).toBe(1024)
    })
  })

  describe('edge cases', () => {
    it('should handle boolean keys', () => {
      const r = new RingBufferMap<boolean, string>(5)
      r.set(true, 'yes')
      r.set(false, 'no')
      expect(r.get(true)).toBe('yes')
      expect(r.get(false)).toBe('no')
    })

    it('should handle same value for different keys', () => {
      rbm.set('a', 42)
      rbm.set('b', 42)
      expect(rbm.get('a')).toBe(42)
      expect(rbm.get('b')).toBe(42)
    })

    it('should handle set-delete-set cycle', () => {
      rbm.set('a', 1)
      rbm.delete('a')
      rbm.set('a', 2)
      expect(rbm.get('a')).toBe(2)
      expect(rbm.size).toBe(1)
    })

    it('should handle large capacity', () => {
      const r = new RingBufferMap<number, number>(10000)
      for (let i = 0; i < 10000; i++) r.set(i, i * 2)
      expect(r.size).toBe(10000)
      expect(r.get(5000)).toBe(10000)
      r.set(10000, 20000)
      expect(r.has(0)).toBe(false)
      expect(r.get(10000)).toBe(20000)
    })

    it('should handle clearing and refilling multiple times', () => {
      for (let round = 0; round < 5; round++) {
        rbm.set('a', round)
        rbm.set('b', round)
        expect(rbm.size).toBe(2)
        rbm.clear()
        expect(rbm.size).toBe(0)
      }
    })

    it('should maintain correct statistics across operations', () => {
      rbm.set('a', 1)
      rbm.set('b', 2)
      rbm.set('a', 3)
      rbm.get('a')
      rbm.get('b')
      rbm.get('c')
      rbm.delete('a')
      rbm.delete('a')
      const stats = rbm.getStatistics()
      expect(stats.sets).toBe(3)
      expect(stats.gets).toBe(3)
      expect(stats.deletes).toBe(2)
    })
  })
})
