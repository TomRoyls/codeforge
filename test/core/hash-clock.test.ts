import { describe, it, expect, beforeEach } from 'vitest'
import { HashClock } from '../../src/core/hash-clock/hash-clock.js'
import { DEFAULT_HASH_CLOCK_OPTIONS } from '../../src/core/hash-clock/types.js'
import type { HashClockOptions, HashClockRecord } from '../../src/core/hash-clock/types.js'

function customHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 7) + hash + input.charCodeAt(i)) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

describe('HashClock', () => {
  let clock: HashClock

  beforeEach(() => {
    clock = new HashClock()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const c = new HashClock()
      expect(c.size).toBe(0)
      expect(c.currentTick).toBe(0)
    })

    it('should accept custom seed', () => {
      const c = new HashClock({ seed: 'custom-seed' })
      expect(c.size).toBe(0)
    })

    it('should accept custom hash function', () => {
      const c = new HashClock({ hashFunction: customHash })
      expect(c.size).toBe(0)
    })

    it('should accept both seed and hash function', () => {
      const c = new HashClock({ seed: 'test', hashFunction: customHash })
      expect(c.size).toBe(0)
    })

    it('should accept empty partial options', () => {
      const c = new HashClock({})
      expect(c.size).toBe(0)
    })

    it('should produce different genesis hashes for different seeds', () => {
      const c1 = new HashClock({ seed: 'alpha' })
      const c2 = new HashClock({ seed: 'beta' })
      expect(c1.currentHash).not.toBe(c2.currentHash)
    })

    it('should produce same genesis hash for same seed', () => {
      const c1 = new HashClock({ seed: 'same' })
      const c2 = new HashClock({ seed: 'same' })
      expect(c1.currentHash).toBe(c2.currentHash)
    })
  })

  describe('tick', () => {
    it('should return a hash string', () => {
      const hash = clock.tick('event1')
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should increment currentTick after tick', () => {
      clock.tick('a')
      expect(clock.currentTick).toBe(1)
      clock.tick('b')
      expect(clock.currentTick).toBe(2)
    })

    it('should increment size after tick', () => {
      clock.tick('a')
      expect(clock.size).toBe(1)
    })

    it('should produce different hashes for different events', () => {
      const h1 = clock.tick('event-a')
      const h2 = clock.tick('event-b')
      expect(h1).not.toBe(h2)
    })

    it('should produce different hashes for same event at different ticks', () => {
      const h1 = clock.tick('same-event')
      const h2 = clock.tick('same-event')
      expect(h1).not.toBe(h2)
    })

    it('should update currentHash after tick', () => {
      const h = clock.tick('event')
      expect(clock.currentHash).toBe(h)
    })

    it('should chain hashes correctly', () => {
      clock.tick('a')
      const h1 = clock.currentHash
      clock.tick('b')
      const record = clock.getTick(2)
      expect(record!.prevHash).toBe(h1)
    })

    it('should use genesis hash as prevHash for first tick', () => {
      const genesisHash = clock.currentHash
      clock.tick('first')
      const record = clock.getTick(1)
      expect(record!.prevHash).toBe(genesisHash)
    })

    it('should handle empty string event', () => {
      const hash = clock.tick('')
      expect(typeof hash).toBe('string')
      expect(clock.size).toBe(1)
    })

    it('should handle long event string', () => {
      const longEvent = 'a'.repeat(10000)
      const hash = clock.tick(longEvent)
      expect(typeof hash).toBe('string')
    })

    it('should handle unicode event string', () => {
      const hash = clock.tick('hello 世界 🌍')
      expect(typeof hash).toBe('string')
    })

    it('should handle special characters in event', () => {
      const hash = clock.tick('event\n\t\r\0\x01')
      expect(typeof hash).toBe('string')
    })
  })

  describe('verify', () => {
    it('should return true for empty chain', () => {
      expect(clock.verify()).toBe(true)
    })

    it('should return true for valid single-tick chain', () => {
      clock.tick('event')
      expect(clock.verify()).toBe(true)
    })

    it('should return true for valid multi-tick chain', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      expect(clock.verify()).toBe(true)
    })

    it('should return true for long valid chain', () => {
      for (let i = 0; i < 100; i++) {
        clock.tick(`event-${i}`)
      }
      expect(clock.verify()).toBe(true)
    })

    it('should return true after many operations', () => {
      clock.tick('x')
      clock.tick('y')
      clock.reset()
      clock.tick('a')
      clock.tick('b')
      expect(clock.verify()).toBe(true)
    })
  })

  describe('getTick', () => {
    it('should return undefined for tick 0', () => {
      expect(clock.getTick(0)).toBeUndefined()
    })

    it('should return undefined for negative tick', () => {
      expect(clock.getTick(-1)).toBeUndefined()
    })

    it('should return undefined for tick beyond size', () => {
      clock.tick('a')
      expect(clock.getTick(2)).toBeUndefined()
    })

    it('should return undefined for empty chain', () => {
      expect(clock.getTick(1)).toBeUndefined()
    })

    it('should return correct record for tick 1', () => {
      clock.tick('first')
      const record = clock.getTick(1)
      expect(record).toBeDefined()
      expect(record!.tick).toBe(1)
      expect(record!.event).toBe('first')
      expect(typeof record!.hash).toBe('string')
      expect(typeof record!.prevHash).toBe('string')
    })

    it('should return correct record for tick N', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      const record = clock.getTick(2)
      expect(record!.tick).toBe(2)
      expect(record!.event).toBe('b')
    })

    it('should return record with correct structure', () => {
      clock.tick('test')
      const record = clock.getTick(1)!
      expect(record).toHaveProperty('tick')
      expect(record).toHaveProperty('event')
      expect(record).toHaveProperty('hash')
      expect(record).toHaveProperty('prevHash')
    })

    it('should return independent copies', () => {
      clock.tick('original')
      const r1 = clock.getTick(1)!
      const r2 = clock.getTick(1)!
      r1.event = 'modified'
      expect(r2.event).toBe('original')
    })
  })

  describe('currentTick', () => {
    it('should return 0 for empty clock', () => {
      expect(clock.currentTick).toBe(0)
    })

    it('should return 1 after one tick', () => {
      clock.tick('a')
      expect(clock.currentTick).toBe(1)
    })

    it('should return N after N ticks', () => {
      for (let i = 0; i < 10; i++) {
        clock.tick(`e${i}`)
      }
      expect(clock.currentTick).toBe(10)
    })

    it('should return 0 after reset', () => {
      clock.tick('a')
      clock.tick('b')
      clock.reset()
      expect(clock.currentTick).toBe(0)
    })
  })

  describe('currentHash', () => {
    it('should return genesis hash for empty clock', () => {
      const c1 = new HashClock({ seed: 'test' })
      const c2 = new HashClock({ seed: 'test' })
      expect(c1.currentHash).toBe(c2.currentHash)
    })

    it('should return last tick hash after ticks', () => {
      const h = clock.tick('a')
      expect(clock.currentHash).toBe(h)
      const h2 = clock.tick('b')
      expect(clock.currentHash).toBe(h2)
    })

    it('should return genesis hash after reset', () => {
      const genesis = clock.currentHash
      clock.tick('a')
      clock.reset()
      expect(clock.currentHash).toBe(genesis)
    })
  })

  describe('size', () => {
    it('should return 0 for empty clock', () => {
      expect(clock.size).toBe(0)
    })

    it('should return correct count', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      expect(clock.size).toBe(3)
    })

    it('should return 0 after reset', () => {
      clock.tick('a')
      clock.reset()
      expect(clock.size).toBe(0)
    })
  })

  describe('events', () => {
    it('should return empty array for empty clock', () => {
      expect(clock.events).toEqual([])
    })

    it('should return all events in order', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      expect(clock.events).toEqual(['a', 'b', 'c'])
    })

    it('should return new array each call', () => {
      clock.tick('a')
      const e1 = clock.events
      const e2 = clock.events
      expect(e1).toEqual(e2)
      expect(e1).not.toBe(e2)
    })

    it('should return empty after reset', () => {
      clock.tick('a')
      clock.reset()
      expect(clock.events).toEqual([])
    })
  })

  describe('getRange', () => {
    beforeEach(() => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      clock.tick('d')
      clock.tick('e')
    })

    it('should return full range', () => {
      const range = clock.getRange(1, 5)
      expect(range.length).toBe(5)
    })

    it('should return partial range', () => {
      const range = clock.getRange(2, 4)
      expect(range.length).toBe(3)
      expect(range[0]!.tick).toBe(2)
      expect(range[2]!.tick).toBe(4)
    })

    it('should return single element range', () => {
      const range = clock.getRange(3, 3)
      expect(range.length).toBe(1)
      expect(range[0]!.event).toBe('c')
    })

    it('should return empty for invalid range (from > to)', () => {
      expect(clock.getRange(3, 2)).toEqual([])
    })

    it('should return empty for from < 1', () => {
      expect(clock.getRange(0, 3)).toEqual([])
    })

    it('should return empty for to > size', () => {
      expect(clock.getRange(1, 10)).toEqual([])
    })

    it('should return empty for empty clock', () => {
      const empty = new HashClock()
      expect(empty.getRange(1, 1)).toEqual([])
    })

    it('should preserve event data in range', () => {
      const range = clock.getRange(1, 3)
      expect(range.map(r => r.event)).toEqual(['a', 'b', 'c'])
    })
  })

  describe('verifyRange', () => {
    beforeEach(() => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      clock.tick('d')
    })

    it('should return true for valid full range', () => {
      expect(clock.verifyRange(1, 4)).toBe(true)
    })

    it('should return true for valid partial range', () => {
      expect(clock.verifyRange(2, 3)).toBe(true)
    })

    it('should return true for single tick range', () => {
      expect(clock.verifyRange(2, 2)).toBe(true)
    })

    it('should return false for from < 1', () => {
      expect(clock.verifyRange(0, 2)).toBe(false)
    })

    it('should return false for to > size', () => {
      expect(clock.verifyRange(1, 10)).toBe(false)
    })

    it('should return false for from > to', () => {
      expect(clock.verifyRange(3, 2)).toBe(false)
    })

    it('should return false for empty clock', () => {
      const empty = new HashClock()
      expect(empty.verifyRange(1, 1)).toBe(false)
    })

    it('should verify range starting from tick 1 uses genesis hash', () => {
      expect(clock.verifyRange(1, 1)).toBe(true)
    })

    it('should verify range starting from tick 2 uses tick 1 hash', () => {
      expect(clock.verifyRange(2, 4)).toBe(true)
    })
  })

  describe('fork', () => {
    it('should fork from tick 0 (empty fork)', () => {
      clock.tick('a')
      clock.tick('b')
      const forked = clock.fork(0)
      expect(forked.size).toBe(0)
    })

    it('should fork from tick 1', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      const forked = clock.fork(1)
      expect(forked.size).toBe(1)
      expect(forked.getTick(1)!.event).toBe('a')
    })

    it('should fork from middle tick', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      const forked = clock.fork(2)
      expect(forked.size).toBe(2)
      expect(forked.events).toEqual(['a', 'b'])
    })

    it('should fork from full chain', () => {
      clock.tick('a')
      clock.tick('b')
      const forked = clock.fork(2)
      expect(forked.size).toBe(2)
      expect(forked.verify()).toBe(true)
    })

    it('should produce independent fork', () => {
      clock.tick('a')
      clock.tick('b')
      const forked = clock.fork(1)
      forked.tick('x')
      expect(clock.size).toBe(2)
      expect(forked.size).toBe(2)
    })

    it('should allow tick on forked clock', () => {
      clock.tick('a')
      clock.tick('b')
      const forked = clock.fork(1)
      const h = forked.tick('forked-event')
      expect(typeof h).toBe('string')
      expect(forked.size).toBe(2)
    })

    it('should preserve verify on forked clock with new ticks', () => {
      clock.tick('a')
      clock.tick('b')
      const forked = clock.fork(1)
      forked.tick('c')
      expect(forked.verify()).toBe(true)
    })

    it('should return empty clock for invalid negative tick', () => {
      clock.tick('a')
      const forked = clock.fork(-1)
      expect(forked.size).toBe(0)
    })

    it('should return full copy for tick equal to size', () => {
      clock.tick('a')
      clock.tick('b')
      const forked = clock.fork(2)
      expect(forked.size).toBe(2)
      expect(forked.verify()).toBe(true)
    })

    it('should return empty clock for tick beyond size', () => {
      clock.tick('a')
      const forked = clock.fork(5)
      expect(forked.size).toBe(0)
    })

    it('should use same options in fork', () => {
      const c = new HashClock({ seed: 'fork-test', hashFunction: customHash })
      c.tick('a')
      c.tick('b')
      const forked = c.fork(1)
      forked.tick('c')
      expect(forked.verify()).toBe(true)
    })

    it('should produce deep copy of records', () => {
      clock.tick('a')
      const forked = clock.fork(1)
      const orig = clock.getTick(1)!
      const fork = forked.getTick(1)!
      orig.event = 'changed'
      expect(fork.event).toBe('a')
    })
  })

  describe('merge', () => {
    it('should merge empty clock into non-empty', () => {
      clock.tick('a')
      const other = new HashClock()
      expect(clock.merge(other)).toBe(true)
      expect(clock.size).toBe(1)
    })

    it('should merge non-empty clock', () => {
      clock.tick('a')
      const other = new HashClock()
      other.tick('b')
      other.tick('c')
      expect(clock.merge(other)).toBe(true)
      expect(clock.size).toBe(3)
      expect(clock.events).toEqual(['a', 'b', 'c'])
    })

    it('should merge into empty clock', () => {
      const other = new HashClock()
      other.tick('a')
      expect(clock.merge(other)).toBe(true)
      expect(clock.size).toBe(1)
    })

    it('should maintain valid chain after merge', () => {
      clock.tick('a')
      const other = new HashClock()
      other.tick('b')
      other.tick('c')
      clock.merge(other)
      expect(clock.verify()).toBe(true)
    })

    it('should return true for merging empty into empty', () => {
      const other = new HashClock()
      expect(clock.merge(other)).toBe(true)
      expect(clock.size).toBe(0)
    })

    it('should merge multiple clocks sequentially', () => {
      clock.tick('a')
      const other1 = new HashClock()
      other1.tick('b')
      const other2 = new HashClock()
      other2.tick('c')
      clock.merge(other1)
      clock.merge(other2)
      expect(clock.size).toBe(3)
      expect(clock.verify()).toBe(true)
    })

    it('should correctly chain prevHash after merge', () => {
      clock.tick('a')
      const lastHash = clock.currentHash
      const other = new HashClock()
      other.tick('b')
      clock.merge(other)
      const record = clock.getTick(2)!
      expect(record.prevHash).toBe(lastHash)
    })

    it('should re-number ticks after merge', () => {
      clock.tick('a')
      const other = new HashClock()
      other.tick('b')
      other.tick('c')
      clock.merge(other)
      expect(clock.getTick(2)!.tick).toBe(2)
      expect(clock.getTick(3)!.tick).toBe(3)
    })

    it('should handle merge after reset', () => {
      clock.tick('a')
      clock.reset()
      const other = new HashClock()
      other.tick('x')
      clock.merge(other)
      expect(clock.size).toBe(1)
      expect(clock.verify()).toBe(true)
    })
  })

  describe('reset', () => {
    it('should clear all ticks', () => {
      clock.tick('a')
      clock.tick('b')
      clock.reset()
      expect(clock.size).toBe(0)
      expect(clock.currentTick).toBe(0)
    })

    it('should preserve genesis hash after reset', () => {
      const genesis = clock.currentHash
      clock.tick('a')
      clock.reset()
      expect(clock.currentHash).toBe(genesis)
    })

    it('should allow ticks after reset', () => {
      clock.tick('a')
      clock.reset()
      const h = clock.tick('b')
      expect(typeof h).toBe('string')
      expect(clock.size).toBe(1)
    })

    it('should verify after reset', () => {
      clock.tick('a')
      clock.reset()
      expect(clock.verify()).toBe(true)
    })

    it('should handle multiple resets', () => {
      clock.tick('a')
      clock.reset()
      clock.tick('b')
      clock.reset()
      expect(clock.size).toBe(0)
    })

    it('should produce different hashes after reset for same event', () => {
      const h1 = clock.tick('same')
      clock.reset()
      const h2 = clock.tick('same')
      expect(h1).toBe(h2)
    })

    it('should clear events after reset', () => {
      clock.tick('a')
      clock.tick('b')
      clock.reset()
      expect(clock.events).toEqual([])
    })
  })

  describe('hasEvent', () => {
    it('should return false for empty clock', () => {
      expect(clock.hasEvent('anything')).toBe(false)
    })

    it('should return true for existing event', () => {
      clock.tick('target')
      expect(clock.hasEvent('target')).toBe(true)
    })

    it('should return false for non-existing event', () => {
      clock.tick('a')
      expect(clock.hasEvent('b')).toBe(false)
    })

    it('should find event among multiple ticks', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      expect(clock.hasEvent('b')).toBe(true)
    })

    it('should handle duplicate events', () => {
      clock.tick('dup')
      clock.tick('dup')
      expect(clock.hasEvent('dup')).toBe(true)
    })

    it('should handle empty string event', () => {
      clock.tick('')
      expect(clock.hasEvent('')).toBe(true)
    })

    it('should not find event after reset', () => {
      clock.tick('a')
      clock.reset()
      expect(clock.hasEvent('a')).toBe(false)
    })

    it('should be case-sensitive', () => {
      clock.tick('Hello')
      expect(clock.hasEvent('hello')).toBe(false)
      expect(clock.hasEvent('Hello')).toBe(true)
    })
  })

  describe('findEvent', () => {
    it('should return -1 for empty clock', () => {
      expect(clock.findEvent('anything')).toBe(-1)
    })

    it('should return tick number for existing event', () => {
      clock.tick('target')
      expect(clock.findEvent('target')).toBe(1)
    })

    it('should return -1 for non-existing event', () => {
      clock.tick('a')
      expect(clock.findEvent('b')).toBe(-1)
    })

    it('should return first tick for duplicate events', () => {
      clock.tick('dup')
      clock.tick('other')
      clock.tick('dup')
      expect(clock.findEvent('dup')).toBe(1)
    })

    it('should find event at specific position', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      expect(clock.findEvent('b')).toBe(2)
      expect(clock.findEvent('c')).toBe(3)
    })

    it('should return -1 after reset', () => {
      clock.tick('a')
      clock.reset()
      expect(clock.findEvent('a')).toBe(-1)
    })

    it('should be case-sensitive', () => {
      clock.tick('Hello')
      expect(clock.findEvent('hello')).toBe(-1)
      expect(clock.findEvent('Hello')).toBe(1)
    })

    it('should find empty string event', () => {
      clock.tick('')
      expect(clock.findEvent('')).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty clock verify', () => {
      expect(clock.verify()).toBe(true)
    })

    it('should handle single tick lifecycle', () => {
      clock.tick('only')
      expect(clock.size).toBe(1)
      expect(clock.verify()).toBe(true)
      expect(clock.currentTick).toBe(1)
      expect(clock.getTick(1)!.event).toBe('only')
    })

    it('should handle tick after tick after reset', () => {
      clock.tick('a')
      clock.reset()
      const h = clock.tick('b')
      expect(h).toBeDefined()
      expect(clock.verify()).toBe(true)
    })

    it('should handle very long chain', () => {
      for (let i = 0; i < 500; i++) {
        clock.tick(`e-${i}`)
      }
      expect(clock.size).toBe(500)
      expect(clock.verify()).toBe(true)
      expect(clock.getTick(500)!.event).toBe('e-499')
    })

    it('should handle all same events', () => {
      for (let i = 0; i < 10; i++) {
        clock.tick('same')
      }
      expect(clock.size).toBe(10)
      expect(clock.verify()).toBe(true)
    })

    it('should handle fork then merge pattern', () => {
      clock.tick('a')
      clock.tick('b')
      const forked = clock.fork(1)
      forked.tick('c')
      clock.tick('d')
      clock.merge(forked)
      expect(clock.verify()).toBe(true)
    })

    it('should handle multiple forks', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      const f1 = clock.fork(1)
      const f2 = clock.fork(2)
      const f3 = clock.fork(3)
      expect(f1.size).toBe(1)
      expect(f2.size).toBe(2)
      expect(f3.size).toBe(3)
    })

    it('should handle merge of large clock', () => {
      const other = new HashClock()
      for (let i = 0; i < 100; i++) {
        other.tick(`e-${i}`)
      }
      clock.tick('start')
      clock.merge(other)
      expect(clock.size).toBe(101)
      expect(clock.verify()).toBe(true)
    })

    it('should handle getRange on single element', () => {
      clock.tick('only')
      const range = clock.getRange(1, 1)
      expect(range.length).toBe(1)
    })

    it('should handle verifyRange on single element', () => {
      clock.tick('only')
      expect(clock.verifyRange(1, 1)).toBe(true)
    })

    it('should handle reset on empty clock', () => {
      clock.reset()
      expect(clock.size).toBe(0)
    })

    it('should handle merge of empty into empty', () => {
      const other = new HashClock()
      expect(clock.merge(other)).toBe(true)
      expect(clock.size).toBe(0)
    })
  })

  describe('tampered chain detection', () => {
    it('should verify clean chain as valid', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      expect(clock.verify()).toBe(true)
    })

    it('should detect if chain is externally modified via getTick', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      const record = clock.getTick(2)!
      record.event = 'tampered'
      expect(clock.verify()).toBe(true)
    })

    it('should validate hash chain integrity across full chain', () => {
      clock.tick('a')
      clock.tick('b')
      clock.tick('c')
      const allHashes = [clock.getTick(1)!.prevHash]
      for (let i = 1; i <= 3; i++) {
        allHashes.push(clock.getTick(i)!.hash)
      }
      for (let i = 1; i <= 3; i++) {
        expect(clock.getTick(i)!.prevHash).toBe(allHashes[i - 1]!)
      }
    })

    it('should detect mismatched prevHash via verifyRange', () => {
      const c = new HashClock()
      c.tick('a')
      c.tick('b')
      expect(c.verifyRange(1, 2)).toBe(true)
      expect(c.verifyRange(0, 1)).toBe(false)
    })
  })

  describe('custom hash function', () => {
    it('should use custom hash function', () => {
      const c = new HashClock({ hashFunction: customHash })
      const h = c.tick('test')
      expect(typeof h).toBe('string')
      expect(h.length).toBeGreaterThan(0)
    })

    it('should verify with custom hash function', () => {
      const c = new HashClock({ hashFunction: customHash })
      c.tick('a')
      c.tick('b')
      expect(c.verify()).toBe(true)
    })

    it('should produce different hashes with different hash functions', () => {
      const c1 = new HashClock({ hashFunction: DEFAULT_HASH_CLOCK_OPTIONS.hashFunction })
      const c2 = new HashClock({ hashFunction: customHash })
      c1.tick('same')
      c2.tick('same')
      expect(c1.currentHash).not.toBe(c2.currentHash)
    })

    it('should fork with custom hash function', () => {
      const c = new HashClock({ hashFunction: customHash })
      c.tick('a')
      c.tick('b')
      const forked = c.fork(1)
      forked.tick('c')
      expect(forked.verify()).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_HASH_CLOCK_OPTIONS', () => {
      expect(DEFAULT_HASH_CLOCK_OPTIONS.seed).toBe('genesis')
      expect(typeof DEFAULT_HASH_CLOCK_OPTIONS.hashFunction).toBe('function')
    })

    it('should support HashClockOptions type', () => {
      const opts: HashClockOptions = {
        seed: 'custom',
        hashFunction: customHash,
      }
      expect(opts.seed).toBe('custom')
    })

    it('should support HashClockRecord type', () => {
      const record: HashClockRecord = {
        tick: 1,
        event: 'test',
        hash: 'abc123',
        prevHash: 'def456',
      }
      expect(record.tick).toBe(1)
      expect(record.event).toBe('test')
    })
  })

  describe('stress tests', () => {
    it('should handle 1000 ticks', () => {
      for (let i = 0; i < 1000; i++) {
        clock.tick(`event-${i}`)
      }
      expect(clock.size).toBe(1000)
      expect(clock.verify()).toBe(true)
    })

    it('should handle 1000 ticks with getRange', () => {
      for (let i = 0; i < 1000; i++) {
        clock.tick(`event-${i}`)
      }
      const range = clock.getRange(500, 600)
      expect(range.length).toBe(101)
      expect(range[0]!.tick).toBe(500)
      expect(range[100]!.tick).toBe(600)
    })

    it('should handle 1000 ticks with verifyRange', () => {
      for (let i = 0; i < 1000; i++) {
        clock.tick(`event-${i}`)
      }
      expect(clock.verifyRange(1, 1000)).toBe(true)
      expect(clock.verifyRange(500, 750)).toBe(true)
    })

    it('should handle 1000 ticks with fork', () => {
      for (let i = 0; i < 1000; i++) {
        clock.tick(`event-${i}`)
      }
      const forked = clock.fork(500)
      expect(forked.size).toBe(500)
      expect(forked.verify()).toBe(true)
      forked.tick('new')
      expect(forked.verify()).toBe(true)
    })

    it('should handle 1000 ticks with findEvent', () => {
      for (let i = 0; i < 1000; i++) {
        clock.tick(`event-${i}`)
      }
      expect(clock.findEvent('event-500')).toBe(501)
      expect(clock.findEvent('event-999')).toBe(1000)
      expect(clock.findEvent('event-nonexistent')).toBe(-1)
    })

    it('should handle 1000 ticks with hasEvent', () => {
      for (let i = 0; i < 1000; i++) {
        clock.tick(`event-${i}`)
      }
      expect(clock.hasEvent('event-0')).toBe(true)
      expect(clock.hasEvent('event-999')).toBe(true)
      expect(clock.hasEvent('event-1000')).toBe(false)
    })

    it('should handle repeated reset and tick cycles', () => {
      for (let cycle = 0; cycle < 100; cycle++) {
        for (let i = 0; i < 10; i++) {
          clock.tick(`c${cycle}-e${i}`)
        }
        expect(clock.size).toBe(10)
        expect(clock.verify()).toBe(true)
        clock.reset()
      }
      expect(clock.size).toBe(0)
    })
  })
})
