import { describe, it, expect } from 'vitest'
import { ZobristHashing } from '../../src/utils/zobrist-hashing.js'

describe('ZobristHashing', () => {
  it('creates with default options', () => {
    const z = new ZobristHashing()
    expect(z.tableSize).toBe(64 * 12)
  })

  it('creates with custom options', () => {
    const z = new ZobristHashing({ positions: 8, pieces: 4 })
    expect(z.tableSize).toBe(32)
  })

  it('produces deterministic hashes with same seed', () => {
    const z1 = new ZobristHashing({ seed: 42 })
    const z2 = new ZobristHashing({ seed: 42 })
    const state = new Map([['a', 1], ['b', 2]])
    expect(z1.hash(state)).toBe(z2.hash(state))
  })

  it('produces different hashes with different seeds', () => {
    const z1 = new ZobristHashing({ seed: 1 })
    const z2 = new ZobristHashing({ seed: 2 })
    const state = new Map([['a', 1]])
    expect(z1.hash(state)).not.toBe(z2.hash(state))
  })

  it('returns 0 for empty state', () => {
    const z = new ZobristHashing()
    expect(z.hash(new Map())).toBe(0)
  })

  it('hashes numeric keys', () => {
    const z = new ZobristHashing()
    const state = new Map<number, number>([[0, 1], [1, 2]])
    const h = z.hash(state)
    expect(typeof h).toBe('number')
    expect(h).toBeGreaterThanOrEqual(0)
  })

  it('addToHash modifies the hash', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map())
    const h2 = z.addToHash(h1, 0, 1)
    expect(h2).not.toBe(h1)
  })

  it('addToHash and removeFromHash are inverse operations', () => {
    const z = new ZobristHashing()
    const h = z.hash(new Map())
    const h2 = z.addToHash(h, 5, 3)
    const h3 = z.removeFromHash(h2, 5, 3)
    expect(h3).toBe(h)
  })

  it('movePiece updates hash correctly', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map())
    const h2 = z.addToHash(h1, 0, 1)
    const h3 = z.movePiece(h2, 0, 5, 1)
    const h4 = z.removeFromHash(h3, 5, 1)
    expect(h4).toBe(h1)
  })

  it('getTableEntry returns 0 for missing entries', () => {
    const z = new ZobristHashing({ positions: 4, pieces: 2 })
    expect(z.getTableEntry(100, 100)).toBe(0)
  })

  it('getTableEntry returns value for valid entries', () => {
    const z = new ZobristHashing({ positions: 4, pieces: 2 })
    expect(z.getTableEntry(0, 0)).not.toBe(0)
  })

  it('produces 32-bit unsigned hashes', () => {
    const z = new ZobristHashing()
    const state = new Map([['x', 11], ['y', 5], ['z', 0]])
    const h = z.hash(state)
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
    expect(h).toBeGreaterThanOrEqual(0)
  })

  it('hash is XOR-commutative', () => {
    const z = new ZobristHashing()
    const state1 = new Map([['a', 1], ['b', 2]])
    const state2 = new Map([['b', 2], ['a', 1]])
    expect(z.hash(state1)).toBe(z.hash(state2))
  })

  it('different states produce different hashes', () => {
    const z = new ZobristHashing()
    const state1 = new Map([['a', 1]])
    const state2 = new Map([['a', 2]])
    expect(z.hash(state1)).not.toBe(z.hash(state2))
  })

  it('multiple addToHash calls compose correctly', () => {
    const z = new ZobristHashing()
    let h = z.hash(new Map())
    h = z.addToHash(h, 0, 1)
    h = z.addToHash(h, 1, 2)
    const directHash = z.hash(new Map([[0, 1], [1, 2]]))
    expect(h).toBe(directHash)
  })

  it('empty state hash is consistent', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map())
    const h2 = z.hash(new Map())
    expect(h1).toBe(h2)
  })

  it('hash is deterministic', () => {
    const z = new ZobristHashing()
    const state = new Map([['x', 42]])
    expect(z.hash(state)).toBe(z.hash(state))
  })

  it('different states give different hashes', () => {
    const z = new ZobristHashing()
    const s1 = new Map([['a', 1]])
    const s2 = new Map([['a', 2]])
    expect(z.hash(s1)).not.toBe(z.hash(s2))
  })

  it('same set produces same hash', () => {
    const z = new ZobristHashing(42)
    const s1 = new Map([['a', 1], ['b', 2]])
    const s2 = new Map([['a', 1], ['b', 2]])
    expect(z.hash(s1)).toBe(z.hash(s2))
  })

  it('different sets have different hashes', () => {
    const z = new ZobristHashing<string>(42)
    const s1 = new Map([['a', 1]])
    const s2 = new Map([['b', 1]])
    expect(z.hash(s1)).not.toBe(z.hash(s2))
  })
})
