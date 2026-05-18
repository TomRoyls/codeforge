import { describe, it, expect } from 'vitest'
import { HashClock2 } from '../../src/core/hash-clock-2/index.js'

describe('HashClock2', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates instance with id', () => {
      const clock = new HashClock2('node-1')
      expect(clock.getId()).toBe('node-1')
    })

    it('starts with empty history', () => {
      const clock = new HashClock2('test')
      expect(clock.length).toBe(0)
      expect(clock.getHistory()).toEqual([])
    })

    it('current returns empty string for new clock', () => {
      const clock = new HashClock2('test')
      expect(clock.current()).toBe('')
    })

    it('handles empty string id', () => {
      const clock = new HashClock2('')
      clock.tick()
      expect(clock.length).toBe(1)
    })

    it('handles unicode id', () => {
      const clock = new HashClock2('节点-🎉')
      expect(clock.getId()).toBe('节点-🎉')
    })
  })

  // ─── Tick ───

  describe('tick', () => {
    it('returns a non-empty hash string', () => {
      const clock = new HashClock2('test')
      const hash = clock.tick()
      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
    })

    it('increments length on each tick', () => {
      const clock = new HashClock2('test')
      clock.tick()
      expect(clock.length).toBe(1)
      clock.tick()
      expect(clock.length).toBe(2)
      clock.tick()
      expect(clock.length).toBe(3)
    })

    it('produces different hashes on successive ticks', () => {
      const clock = new HashClock2('test')
      const hash1 = clock.tick()
      const hash2 = clock.tick()
      const hash3 = clock.tick()
      expect(hash1).not.toBe(hash2)
      expect(hash2).not.toBe(hash3)
      expect(hash1).not.toBe(hash3)
    })

    it('updates current after tick', () => {
      const clock = new HashClock2('test')
      const hash = clock.tick()
      expect(clock.current()).toBe(hash)
    })

    it('produces deterministic hashes for same sequence', () => {
      const clock1 = new HashClock2('node-a')
      const clock2 = new HashClock2('node-a')
      const h1 = clock1.tick()
      const h2 = clock2.tick()
      expect(h1).toBe(h2)
    })

    it('produces different hashes for different ids', () => {
      const clock1 = new HashClock2('node-a')
      const clock2 = new HashClock2('node-b')
      const h1 = clock1.tick()
      const h2 = clock2.tick()
      expect(h1).not.toBe(h2)
    })

    it('adds hash to history', () => {
      const clock = new HashClock2('test')
      const h1 = clock.tick()
      const h2 = clock.tick()
      expect(clock.getHistory()).toEqual([h1, h2])
    })
  })

  // ─── Current ───

  describe('current', () => {
    it('returns empty string before any tick', () => {
      const clock = new HashClock2('test')
      expect(clock.current()).toBe('')
    })

    it('returns last tick hash', () => {
      const clock = new HashClock2('test')
      clock.tick()
      clock.tick()
      const lastHash = clock.tick()
      expect(clock.current()).toBe(lastHash)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('adds a new hash to history', () => {
      const clock1 = new HashClock2('a')
      const clock2 = new HashClock2('b')
      const hash = clock2.tick()
      const result = clock1.merge(hash)
      expect(result).toBe(true)
      expect(clock1.length).toBe(1)
    })

    it('returns false for duplicate hash', () => {
      const clock = new HashClock2('test')
      const hash = clock.tick()
      const result = clock.merge(hash)
      expect(result).toBe(false)
      expect(clock.length).toBe(1)
    })

    it('increments length only for new hashes', () => {
      const clock = new HashClock2('test')
      const hash = clock.tick()
      expect(clock.length).toBe(1)
      clock.merge(hash)
      expect(clock.length).toBe(1)
      clock.merge('unknown-hash')
      expect(clock.length).toBe(2)
    })

    it('merge then tick continues sequence', () => {
      const clock = new HashClock2('test')
      clock.merge('external-hash')
      clock.tick()
      expect(clock.length).toBe(2)
    })

    it('handles merging multiple unique hashes', () => {
      const clock = new HashClock2('test')
      const results: boolean[] = []
      for (let i = 0; i < 5; i++) {
        results.push(clock.merge(`hash-${i}`))
      }
      for (const r of results) {
        expect(r).toBe(true)
      }
      expect(clock.length).toBe(5)
    })
  })

  // ─── HappenedBefore ───

  describe('happenedBefore', () => {
    it('returns false for unknown hash', () => {
      const clock = new HashClock2('test')
      expect(clock.happenedBefore('unknown')).toBe(false)
    })

    it('returns true for ticked hash', () => {
      const clock = new HashClock2('test')
      const hash = clock.tick()
      expect(clock.happenedBefore(hash)).toBe(true)
    })

    it('returns true for all historical hashes', () => {
      const clock = new HashClock2('test')
      const hashes = [clock.tick(), clock.tick(), clock.tick()]
      for (const h of hashes) {
        expect(clock.happenedBefore(h)).toBe(true)
      }
    })

    it('returns true for merged hash', () => {
      const clock = new HashClock2('test')
      clock.merge('merged-hash')
      expect(clock.happenedBefore('merged-hash')).toBe(true)
    })

    it('returns false after reset scenario with new clock', () => {
      const clock1 = new HashClock2('a')
      const hash = clock1.tick()
      const clock2 = new HashClock2('b')
      expect(clock2.happenedBefore(hash)).toBe(false)
    })
  })

  // ─── IsEqual ───

  describe('isEqual', () => {
    it('returns true for matching current hash', () => {
      const clock = new HashClock2('test')
      const hash = clock.tick()
      expect(clock.isEqual(hash)).toBe(true)
    })

    it('returns false for non-matching hash', () => {
      const clock = new HashClock2('test')
      clock.tick()
      expect(clock.isEqual('different')).toBe(false)
    })

    it('returns true for empty clock comparing empty string', () => {
      const clock = new HashClock2('test')
      expect(clock.isEqual('')).toBe(true)
    })

    it('returns false for previous hash', () => {
      const clock = new HashClock2('test')
      const first = clock.tick()
      clock.tick()
      expect(clock.isEqual(first)).toBe(false)
    })
  })

  // ─── GetHistory ───

  describe('getHistory', () => {
    it('returns a copy of history', () => {
      const clock = new HashClock2('test')
      clock.tick()
      const history = clock.getHistory()
      history.push('tampered')
      expect(clock.getHistory().length).toBe(1)
    })

    it('returns ordered history', () => {
      const clock = new HashClock2('test')
      const h1 = clock.tick()
      const h2 = clock.tick()
      const h3 = clock.tick()
      expect(clock.getHistory()).toEqual([h1, h2, h3])
    })
  })

  // ─── Length ───

  describe('length', () => {
    it('returns 0 for new clock', () => {
      const clock = new HashClock2('test')
      expect(clock.length).toBe(0)
    })

    it('increments with tick', () => {
      const clock = new HashClock2('test')
      clock.tick()
      expect(clock.length).toBe(1)
    })

    it('increments with merge of new hash', () => {
      const clock = new HashClock2('test')
      clock.merge('new-hash')
      expect(clock.length).toBe(1)
    })

    it('does not increment with merge of duplicate', () => {
      const clock = new HashClock2('test')
      const h = clock.tick()
      clock.merge(h)
      expect(clock.length).toBe(1)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('many ticks produce unique hashes', () => {
      const clock = new HashClock2('test')
      const hashes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        hashes.add(clock.tick())
      }
      expect(hashes.size).toBe(100)
    })

    it('hash format is hex string', () => {
      const clock = new HashClock2('test')
      const hash = clock.tick()
      expect(hash).toMatch(/^[0-9a-f]+$/)
    })

    it('two clocks with same id produce same sequence', () => {
      const c1 = new HashClock2('shared')
      const c2 = new HashClock2('shared')
      for (let i = 0; i < 10; i++) {
        expect(c1.tick()).toBe(c2.tick())
      }
    })

    it('merge after tick adds to end of history', () => {
      const clock = new HashClock2('test')
      const tick1 = clock.tick()
      clock.merge('merged')
      const tick2 = clock.tick()
      const history = clock.getHistory()
      expect(history).toEqual([tick1, 'merged', tick2])
    })

    it('empty string hash can be merged', () => {
      const clock = new HashClock2('test')
      const result = clock.merge('')
      expect(result).toBe(true)
      expect(clock.happenedBefore('')).toBe(true)
    })

    it('getId returns the original id', () => {
      const clock = new HashClock2('my-id')
      expect(clock.getId()).toBe('my-id')
    })
  })
})
