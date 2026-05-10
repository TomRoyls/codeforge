import { describe, it, expect } from 'vitest'
import { StripeLockedMap } from '../../src/core/stripe-locked-map/stripe-locked-map.js'
import { DEFAULT_STRIPE_LOCKED_MAP_OPTIONS } from '../../src/core/stripe-locked-map/stripe-locked-map.js'
import type { StripeLockedMapOptions, StripeLockedMapStatistics } from '../../src/core/stripe-locked-map/stripe-locked-map.js'

describe('StripeLockedMap', () => {
  describe('constructor', () => {
    it('creates map with default options', () => {
      const map = new StripeLockedMap()
      expect(map.stripeCount()).toBe(16)
    })

    it('creates map with custom stripe count', () => {
      const map = new StripeLockedMap({ stripeCount: 4 })
      expect(map.stripeCount()).toBe(4)
    })

    it('creates map with custom hash function', () => {
      const map = new StripeLockedMap({
        hashFunction: () => 0,
      })
      expect(map.stripeCount()).toBe(16)
    })

    it('creates map with both options', () => {
      const map = new StripeLockedMap({
        stripeCount: 8,
        hashFunction: () => 5,
      })
      expect(map.stripeCount()).toBe(8)
    })

    it('creates map with empty options', () => {
      const map = new StripeLockedMap({})
      expect(map.stripeCount()).toBe(16)
    })

    it('defaults stripe count when undefined', () => {
      const opts: StripeLockedMapOptions = { stripeCount: undefined }
      const map = new StripeLockedMap(opts)
      expect(map.stripeCount()).toBe(16)
    })

    it('uses stripe count 1', () => {
      const map = new StripeLockedMap({ stripeCount: 1 })
      expect(map.stripeCount()).toBe(1)
    })

    it('uses stripe count 32', () => {
      const map = new StripeLockedMap({ stripeCount: 32 })
      expect(map.stripeCount()).toBe(32)
    })
  })

  describe('set and get', () => {
    it('sets and gets a value', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      expect(map.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const map = new StripeLockedMap()
      expect(map.get('missing')).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('set returns this for chaining', () => {
      const map = new StripeLockedMap()
      const result = map.set('a', 1)
      expect(result).toBe(map)
    })

    it('chains multiple sets', () => {
      const map = new StripeLockedMap()
      map.set('a', 1).set('b', 2).set('c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('handles string values', () => {
      const map = new StripeLockedMap<string>()
      map.set('key', 'value')
      expect(map.get('key')).toBe('value')
    })

    it('handles object values', () => {
      const map = new StripeLockedMap<object>()
      const obj = { foo: 'bar' }
      map.set('key', obj)
      expect(map.get('key')).toBe(obj)
    })

    it('handles null values', () => {
      const map = new StripeLockedMap<null>()
      map.set('key', null)
      expect(map.get('key')).toBeNull()
    })

    it('handles undefined values', () => {
      const map = new StripeLockedMap<undefined>()
      map.set('key', undefined)
      expect(map.get('key')).toBeUndefined()
    })

    it('handles array values', () => {
      const map = new StripeLockedMap<number[]>()
      map.set('arr', [1, 2, 3])
      expect(map.get('arr')).toEqual([1, 2, 3])
    })

    it('handles boolean values', () => {
      const map = new StripeLockedMap<boolean>()
      map.set('t', true)
      map.set('f', false)
      expect(map.get('t')).toBe(true)
      expect(map.get('f')).toBe(false)
    })

    it('handles numeric keys', () => {
      const map = new StripeLockedMap()
      map.set('123', 'val')
      expect(map.get('123')).toBe('val')
    })

    it('handles empty string key', () => {
      const map = new StripeLockedMap()
      map.set('', 'empty')
      expect(map.get('')).toBe('empty')
    })

    it('handles special character keys', () => {
      const map = new StripeLockedMap()
      map.set('key-with-special!@#$%', 'val')
      expect(map.get('key-with-special!@#$%')).toBe('val')
    })

    it('handles unicode keys', () => {
      const map = new StripeLockedMap()
      map.set('日本語', 'japanese')
      expect(map.get('日本語')).toBe('japanese')
    })

    it('handles long keys', () => {
      const map = new StripeLockedMap()
      const longKey = 'a'.repeat(1000)
      map.set(longKey, 'long')
      expect(map.get(longKey)).toBe('long')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      expect(map.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const map = new StripeLockedMap()
      expect(map.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.delete('a')
      expect(map.has('a')).toBe(false)
    })

    it('returns true for key with undefined value', () => {
      const map = new StripeLockedMap<undefined>()
      map.set('a', undefined)
      expect(map.has('a')).toBe(true)
    })

    it('returns true for key with null value', () => {
      const map = new StripeLockedMap<null>()
      map.set('a', null)
      expect(map.has('a')).toBe(true)
    })

    it('returns true after overwrite', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      expect(map.delete('a')).toBe(true)
      expect(map.get('a')).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const map = new StripeLockedMap()
      expect(map.delete('missing')).toBe(false)
    })

    it('can delete and re-add', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.delete('a')
      map.set('a', 2)
      expect(map.get('a')).toBe(2)
    })

    it('only deletes specified key', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.has('a')).toBe(false)
      expect(map.has('b')).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new StripeLockedMap()
      expect(map.size).toBe(0)
    })

    it('returns 1 after one set', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      expect(map.size).toBe(1)
    })

    it('returns correct size after multiple sets', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      expect(map.size).toBe(3)
    })

    it('does not increase on overwrite', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('a', 2)
      expect(map.size).toBe(1)
    })

    it('decreases after delete', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.size).toBe(0)
    })

    it('handles many entries', () => {
      const map = new StripeLockedMap()
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(100)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new map', () => {
      const map = new StripeLockedMap()
      expect(map.isEmpty()).toBe(true)
    })

    it('returns false after set', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      expect(map.isEmpty()).toBe(false)
    })

    it('returns true after delete of only entry', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.delete('a')
      expect(map.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.clear()
      expect(map.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.set('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.get('a')).toBeUndefined()
      expect(map.get('b')).toBeUndefined()
      expect(map.get('c')).toBeUndefined()
    })

    it('clears empty map without error', () => {
      const map = new StripeLockedMap()
      expect(() => map.clear()).not.toThrow()
    })

    it('allows adding after clear', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.clear()
      map.set('b', 2)
      expect(map.size).toBe(1)
      expect(map.get('b')).toBe(2)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty map', () => {
      const map = new StripeLockedMap()
      expect(map.keys()).toEqual([])
    })

    it('returns keys', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      const keys = map.keys()
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys.length).toBe(2)
    })

    it('does not return deleted keys', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty map', () => {
      const map = new StripeLockedMap()
      expect(map.values()).toEqual([])
    })

    it('returns values', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      const vals = map.values()
      expect(vals).toContain(1)
      expect(vals).toContain(2)
      expect(vals.length).toBe(2)
    })

    it('does not return deleted values', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      expect(map.values()).toEqual([2])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty map', () => {
      const map = new StripeLockedMap()
      expect(map.entries()).toEqual([])
    })

    it('returns entries as [key, value] pairs', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      const entries = map.entries()
      expect(entries.length).toBe(2)
      const aEntry = entries.find((e) => e[0] === 'a')
      const bEntry = entries.find((e) => e[0] === 'b')
      expect(aEntry).toEqual(['a', 1])
      expect(bEntry).toEqual(['b', 2])
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty map', () => {
      const map = new StripeLockedMap()
      const calls: Array<[number, string]> = []
      map.forEach((v, k) => { calls.push([v, k]) })
      expect(calls).toEqual([])
    })

    it('calls callback for each entry', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      const calls: Array<[number, string]> = []
      map.forEach((v, k) => { calls.push([v, k]) })
      expect(calls.length).toBe(2)
      expect(calls).toContainEqual([1, 'a'])
      expect(calls).toContainEqual([2, 'b'])
    })

    it('passes the map as third argument', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      let received: StripeLockedMap<number> | undefined
      map.forEach((_v, _k, m) => { received = m })
      expect(received).toBe(map)
    })

    it('iterates over all entries including after mutations', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      map.delete('a')
      const calls: Array<[number, string]> = []
      map.forEach((v, k) => { calls.push([v, k]) })
      expect(calls).toEqual([[2, 'b']])
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty map', () => {
      const map = new StripeLockedMap()
      const result = [...map]
      expect(result).toEqual([])
    })

    it('iterates over entries', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      const result = [...map]
      expect(result.length).toBe(2)
    })

    it('works with for-of', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      const entries: Array<[string, number]> = []
      for (const entry of map) {
        entries.push(entry)
      }
      expect(entries.length).toBe(2)
    })
  })

  describe('withLock', () => {
    it('executes callback with stripe map', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      const result = map.withLock('a', (m) => m.get('a'))
      expect(result).toBe(1)
    })

    it('allows modification within callback', () => {
      const map = new StripeLockedMap()
      map.withLock('a', (m) => { m.set('a', 42) })
      expect(map.get('a')).toBe(42)
    })

    it('returns callback result', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      const result = map.withLock('a', () => 'hello')
      expect(result).toBe('hello')
    })

    it('can access other keys in same stripe', () => {
      const map = new StripeLockedMap({ hashFunction: () => 0, stripeCount: 4 })
      map.set('a', 1)
      map.set('b', 2)
      const result = map.withLock('a', (m) => m.get('b'))
      expect(result).toBe(2)
    })

    it('handles callback that throws', () => {
      const map = new StripeLockedMap()
      expect(() => map.withLock('a', () => {
        throw new Error('test')
      })).toThrow('test')
    })

    it('releases lock after callback that throws', () => {
      const map = new StripeLockedMap()
      try {
        map.withLock('a', () => { throw new Error('test') })
      } catch {
        void 0
      }
      expect(() => map.get('a')).not.toThrow()
    })
  })

  describe('getStripe', () => {
    it('returns a number between 0 and stripeCount-1', () => {
      const map = new StripeLockedMap({ stripeCount: 4 })
      for (let i = 0; i < 100; i++) {
        const stripe = map.getStripe(`key${i}`)
        expect(stripe).toBeGreaterThanOrEqual(0)
        expect(stripe).toBeLessThan(4)
      }
    })

    it('returns consistent stripe for same key', () => {
      const map = new StripeLockedMap()
      const stripe1 = map.getStripe('a')
      const stripe2 = map.getStripe('a')
      expect(stripe1).toBe(stripe2)
    })

    it('uses custom hash function', () => {
      const map = new StripeLockedMap({
        stripeCount: 4,
        hashFunction: () => 7,
      })
      expect(map.getStripe('any')).toBe(7 % 4)
    })

    it('different keys may map to different stripes', () => {
      const map = new StripeLockedMap({ stripeCount: 16 })
      const stripes = new Set<number>()
      for (let i = 0; i < 100; i++) {
        stripes.add(map.getStripe(`key${i}`))
      }
      expect(stripes.size).toBeGreaterThan(1)
    })
  })

  describe('stripeCount', () => {
    it('returns default stripe count', () => {
      const map = new StripeLockedMap()
      expect(map.stripeCount()).toBe(16)
    })

    it('returns custom stripe count', () => {
      const map = new StripeLockedMap({ stripeCount: 8 })
      expect(map.stripeCount()).toBe(8)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const map = new StripeLockedMap()
      const stats = map.getStatistics()
      expect(stats.sets).toBe(0)
      expect(stats.gets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.lockAcquisitions).toBe(0)
      expect(stats.lockContentions).toBe(0)
      expect(stats.stripeUsage.length).toBe(16)
      expect(stats.stripeUsage.every((u) => u === 0)).toBe(true)
    })

    it('tracks sets', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.getStatistics().sets).toBe(2)
    })

    it('tracks gets', () => {
      const map = new StripeLockedMap()
      map.get('a')
      map.get('b')
      expect(map.getStatistics().gets).toBe(2)
    })

    it('tracks deletes', () => {
      const map = new StripeLockedMap()
      map.delete('a')
      map.delete('b')
      expect(map.getStatistics().deletes).toBe(2)
    })

    it('tracks lock acquisitions on set', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      expect(map.getStatistics().lockAcquisitions).toBeGreaterThanOrEqual(1)
    })

    it('tracks lock acquisitions on get', () => {
      const map = new StripeLockedMap()
      map.get('a')
      expect(map.getStatistics().lockAcquisitions).toBeGreaterThanOrEqual(1)
    })

    it('tracks lock acquisitions on delete', () => {
      const map = new StripeLockedMap()
      map.delete('a')
      expect(map.getStatistics().lockAcquisitions).toBeGreaterThanOrEqual(1)
    })

    it('tracks lock acquisitions on has', () => {
      const map = new StripeLockedMap()
      map.has('a')
      expect(map.getStatistics().lockAcquisitions).toBeGreaterThanOrEqual(1)
    })

    it('tracks stripe usage', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      const stats = map.getStatistics()
      const totalUsage = stats.stripeUsage.reduce((s, u) => s + u, 0)
      expect(totalUsage).toBeGreaterThanOrEqual(1)
    })

    it('stripeUsage length matches stripeCount', () => {
      const map = new StripeLockedMap({ stripeCount: 4 })
      expect(map.getStatistics().stripeUsage.length).toBe(4)
    })

    it('returns a copy of stripeUsage', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      const stats1 = map.getStatistics()
      const stats2 = map.getStatistics()
      expect(stats1.stripeUsage).not.toBe(stats2.stripeUsage)
    })

    it('cumulative statistics across operations', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.get('a')
      map.delete('a')
      const stats = map.getStatistics()
      expect(stats.sets).toBe(1)
      expect(stats.gets).toBe(1)
      expect(stats.deletes).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const map = new StripeLockedMap()
      expect(map.toArray()).toEqual([])
    })

    it('returns entries as array', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      const arr = map.toArray()
      expect(arr.length).toBe(2)
      const aEntry = arr.find((e) => e[0] === 'a')
      const bEntry = arr.find((e) => e[0] === 'b')
      expect(aEntry).toEqual(['a', 1])
      expect(bEntry).toEqual(['b', 2])
    })

    it('returns same as entries', () => {
      const map = new StripeLockedMap()
      map.set('a', 1)
      map.set('b', 2)
      expect(map.toArray()).toEqual(map.entries())
    })
  })

  describe('striped distribution', () => {
    it('distributes keys across stripes', () => {
      const map = new StripeLockedMap({ stripeCount: 4 })
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i)
      }
      const stats = map.getStatistics()
      const usedStripes = stats.stripeUsage.filter((u) => u > 0).length
      expect(usedStripes).toBeGreaterThan(1)
    })

    it('all entries go to same stripe with constant hash', () => {
      const map = new StripeLockedMap({
        stripeCount: 4,
        hashFunction: () => 0,
      })
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i)
      }
      const stats = map.getStatistics()
      expect(stats.stripeUsage[0]).toBeGreaterThan(0)
      expect(stats.stripeUsage[1]).toBe(0)
      expect(stats.stripeUsage[2]).toBe(0)
      expect(stats.stripeUsage[3]).toBe(0)
    })
  })

  describe('contention tracking', () => {
    it('withLock tracks lock acquisition', () => {
      const map = new StripeLockedMap()
      map.withLock('a', () => {})
      expect(map.getStatistics().lockAcquisitions).toBeGreaterThanOrEqual(1)
    })

    it('size iterates all stripes acquiring locks', () => {
      const map = new StripeLockedMap({ stripeCount: 4 })
      map.set('a', 1)
      const sizeBefore = map.getStatistics().lockAcquisitions
      void map.size
      const sizeAfter = map.getStatistics().lockAcquisitions
      expect(sizeAfter - sizeBefore).toBe(4)
    })

    it('clear acquires all stripe locks', () => {
      const map = new StripeLockedMap({ stripeCount: 4 })
      map.set('a', 1)
      const before = map.getStatistics().lockAcquisitions
      map.clear()
      const after = map.getStatistics().lockAcquisitions
      expect(after - before).toBe(4)
    })

    it('forEach acquires locks per stripe', () => {
      const map = new StripeLockedMap({ stripeCount: 4 })
      map.set('a', 1)
      const before = map.getStatistics().lockAcquisitions
      map.forEach(() => {})
      const after = map.getStatistics().lockAcquisitions
      expect(after - before).toBe(4)
    })
  })

  describe('DEFAULT_STRIPE_LOCKED_MAP_OPTIONS', () => {
    it('has default stripeCount of 16', () => {
      expect(DEFAULT_STRIPE_LOCKED_MAP_OPTIONS.stripeCount).toBe(16)
    })
  })

  describe('type imports', () => {
    it('StripeLockedMapOptions type is usable', () => {
      const opts: StripeLockedMapOptions = { stripeCount: 4 }
      const map = new StripeLockedMap(opts)
      expect(map.stripeCount()).toBe(4)
    })

    it('StripeLockedMapStatistics type is usable', () => {
      const map = new StripeLockedMap()
      const stats: StripeLockedMapStatistics = map.getStatistics()
      expect(typeof stats.sets).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('handles single stripe', () => {
      const map = new StripeLockedMap({ stripeCount: 1 })
      map.set('a', 1)
      map.set('b', 2)
      expect(map.size).toBe(2)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
    })

    it('handles many stripes', () => {
      const map = new StripeLockedMap({ stripeCount: 256 })
      for (let i = 0; i < 100; i++) {
        map.set(`key${i}`, i)
      }
      expect(map.size).toBe(100)
    })

    it('get, has, delete on empty map do not throw', () => {
      const map = new StripeLockedMap()
      expect(() => map.get('x')).not.toThrow()
      expect(() => map.has('x')).not.toThrow()
      expect(() => map.delete('x')).not.toThrow()
    })

    it('set with same key multiple times', () => {
      const map = new StripeLockedMap()
      for (let i = 0; i < 10; i++) {
        map.set('a', i)
      }
      expect(map.size).toBe(1)
      expect(map.get('a')).toBe(9)
    })

    it('delete non-existent key returns false', () => {
      const map = new StripeLockedMap()
      expect(map.delete('nope')).toBe(false)
    })

    it('handles 0 as hash function result', () => {
      const map = new StripeLockedMap({
        stripeCount: 4,
        hashFunction: () => 0,
      })
      map.set('a', 1)
      expect(map.getStripe('a')).toBe(0)
      expect(map.get('a')).toBe(1)
    })

    it('handles hash function returning large numbers', () => {
      const map = new StripeLockedMap({
        stripeCount: 4,
        hashFunction: () => 1000000,
      })
      map.set('a', 1)
      expect(map.getStripe('a')).toBe(1000000 % 4)
      expect(map.get('a')).toBe(1)
    })
  })
})
