import { describe, it, expect } from 'vitest'
import { ZobristHashing } from '../../../src/utils/zobrist-hashing.js'

describe('ZobristHashing', () => {
  describe('construction', () => {
    it('creates with defaults', () => {
      const zh = new ZobristHashing()
      expect(zh.tableSize).toBe(64 * 12)
    })

    it('creates with custom params', () => {
      const zh = new ZobristHashing({ positions: 9, pieces: 2 })
      expect(zh.tableSize).toBe(18)
    })

    it('produces deterministic results with same seed', () => {
      const zh1 = new ZobristHashing({ seed: 42 })
      const zh2 = new ZobristHashing({ seed: 42 })
      const state = new Map<string, number>([['a', 0], ['b', 1]])
      expect(zh1.hash(state)).toBe(zh2.hash(state))
    })
  })

  describe('hash', () => {
    it('hashes empty state', () => {
      const zh = new ZobristHashing()
      expect(zh.hash(new Map())).toBe(0)
    })

    it('produces different hashes for different states', () => {
      const zh = new ZobristHashing()
      const s1 = new Map<number, number>([[0, 1]])
      const s2 = new Map<number, number>([[0, 2]])
      expect(zh.hash(s1)).not.toBe(zh.hash(s2))
    })

    it('produces same hash for same state', () => {
      const zh = new ZobristHashing()
      const state = new Map<number, number>([[3, 5], [7, 2]])
      expect(zh.hash(state)).toBe(zh.hash(state))
    })

    it('handles string keys', () => {
      const zh = new ZobristHashing()
      const state = new Map<string, number>([['e4', 1], ['d5', 2]])
      const h = zh.hash(state)
      expect(typeof h).toBe('number')
      expect(h).toBeGreaterThan(0)
    })

    it('produces unsigned 32-bit hash', () => {
      const zh = new ZobristHashing()
      const state = new Map<number, number>([[0, 0]])
      const h = zh.hash(state)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
    })
  })

  describe('incremental updates', () => {
    it('add/remove are XOR-inverses', () => {
      const zh = new ZobristHashing()
      let h = 0
      h = zh.addToHash(h, 5, 3)
      expect(h).not.toBe(0)
      h = zh.removeFromHash(h, 5, 3)
      expect(h).toBe(0)
    })

    it('addToHash matches direct hash', () => {
      const zh = new ZobristHashing()
      const state = new Map<number, number>([[10, 5]])
      const directHash = zh.hash(state)
      const incrementalHash = zh.addToHash(0, 10, 5)
      expect(incrementalHash).toBe(directHash)
    })

    it('movePiece updates hash correctly', () => {
      const zh = new ZobristHashing()
      let h = 0
      h = zh.addToHash(h, 0, 1)
      const moved = zh.movePiece(h, 0, 5, 1)
      expect(moved).not.toBe(h)
      expect(zh.removeFromHash(moved, 5, 1)).toBe(0)
    })

    it('complex sequence of moves', () => {
      const zh = new ZobristHashing()
      let h1 = 0
      h1 = zh.addToHash(h1, 0, 1)
      h1 = zh.addToHash(h1, 1, 2)
      h1 = zh.addToHash(h1, 2, 3)

      let h2 = 0
      h2 = zh.addToHash(h2, 2, 3)
      h2 = zh.addToHash(h2, 1, 2)
      h2 = zh.addToHash(h2, 0, 1)

      expect(h1).toBe(h2)
    })
  })

  describe('getTableEntry', () => {
    it('returns entry from table', () => {
      const zh = new ZobristHashing()
      const entry = zh.getTableEntry(0, 0)
      expect(typeof entry).toBe('number')
    })

    it('returns 0 for out of range', () => {
      const zh = new ZobristHashing({ positions: 4, pieces: 2 })
      expect(zh.getTableEntry(100, 100)).toBe(0)
    })
  })

  describe('collision resistance', () => {
    it('produces unique hashes for many single-piece states', () => {
      const zh = new ZobristHashing()
      const hashes = new Set<number>()
      for (let pos = 0; pos < 64; pos++) {
        const state = new Map<number, number>([[pos, 0]])
        hashes.add(zh.hash(state))
      }
      expect(hashes.size).toBe(64)
    })
  })
})
