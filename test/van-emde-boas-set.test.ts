import { describe, expect, it } from 'vitest'

import { VanEmdeBoasSet } from '../src/core/van-emde-boas-set/index.js'

// ─── Construction ────────────────────────────────────────
describe('VanEmdeBoasSet construction', () => {
  it('creates set with default universe size', () => {
    const set = new VanEmdeBoasSet()
    expect(set.size()).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('creates set with custom universe size', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    expect(set.size()).toBe(0)
  })
})

// ─── Insert and Has ──────────────────────────────────────
describe('VanEmdeBoasSet insert/has', () => {
  it('inserts and finds a value', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(42)
    expect(set.has(42)).toBe(true)
  })

  it('handles multiple inserts', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(0)
    set.insert(100)
    set.insert(200)
    expect(set.has(0)).toBe(true)
    expect(set.has(100)).toBe(true)
    expect(set.has(200)).toBe(true)
    expect(set.size()).toBe(3)
  })

  it('ignores duplicate inserts', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(42)
    set.insert(42)
    expect(set.size()).toBe(1)
  })

  it('throws for out-of-bounds insert', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    expect(() => set.insert(-1)).toThrow()
    expect(() => set.insert(256)).toThrow()
  })

  it('has returns false for out-of-bounds', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    expect(set.has(-1)).toBe(false)
    expect(set.has(256)).toBe(false)
  })

  it('has returns false for value not in set', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(10)
    expect(set.has(20)).toBe(false)
  })
})

// ─── Min/Max ─────────────────────────────────────────────
describe('VanEmdeBoasSet min/max', () => {
  it('returns null for empty set', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    expect(set.min()).toBeNull()
    expect(set.max()).toBeNull()
  })

  it('returns min and max', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(50)
    set.insert(10)
    set.insert(90)
    expect(set.min()).toBe(10)
    expect(set.max()).toBe(90)
  })
})

// ─── Delete ──────────────────────────────────────────────
describe('VanEmdeBoasSet delete', () => {
  it('deletes a value', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(42)
    set.delete(42)
    expect(set.has(42)).toBe(false)
    expect(set.size()).toBe(0)
  })

  it('deletes one of multiple values', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(10)
    set.insert(20)
    set.insert(30)
    set.delete(20)
    expect(set.has(20)).toBe(false)
    expect(set.has(10)).toBe(true)
    expect(set.has(30)).toBe(true)
    expect(set.size()).toBe(2)
  })

  it('deleting non-existent does not throw and maintains size', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(5)
    set.delete(10)
    expect(set.size()).toBe(1)
  })

  it('throws for out-of-bounds delete', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    expect(() => set.delete(-1)).toThrow()
  })
})

// ─── Successor/Predecessor ───────────────────────────────
describe('VanEmdeBoasSet successor/predecessor', () => {
  it('returns successor', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(10)
    set.insert(20)
    set.insert(30)
    expect(set.successor(10)).toBe(20)
    expect(set.successor(20)).toBe(30)
  })

  it('returns null for no successor', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(100)
    expect(set.successor(100)).toBeNull()
  })

  it('returns predecessor', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(10)
    set.insert(20)
    set.insert(30)
    expect(set.predecessor(30)).toBe(20)
    expect(set.predecessor(20)).toBe(10)
  })

  it('returns null for no predecessor', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(0)
    expect(set.predecessor(0)).toBeNull()
  })
})

// ─── Iteration ───────────────────────────────────────────
describe('VanEmdeBoasSet iteration', () => {
  it('toArray returns sorted values', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(30)
    set.insert(10)
    set.insert(20)
    expect(set.toArray()).toEqual([10, 20, 30])
  })

  it('forEach iterates all values', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(5)
    set.insert(15)
    const result: number[] = []
    set.forEach((v) => result.push(v))
    expect(result).toEqual([5, 15])
  })

  it('clear resets the set', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    set.insert(5)
    set.clear()
    expect(set.size()).toBe(0)
    expect(set.isEmpty()).toBe(true)
  })

  it('toArray on empty returns empty array', () => {
    const set = new VanEmdeBoasSet({ universeSize: 256 })
    expect(set.toArray()).toEqual([])
  })
})
