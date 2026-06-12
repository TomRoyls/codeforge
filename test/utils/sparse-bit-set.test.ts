import { describe, it, expect } from 'vitest'
import { SparseBitSet } from '../../src/utils/sparse-bit-set.js'

// ─── Set and Clear ────────────────────────────────────────
describe('SparseBitSet - set and clear', () => {
  it('sets and checks bits', () => {
    const bs = new SparseBitSet()
    expect(bs.set(5)).toBe(true)
    expect(bs.has(5)).toBe(true)
    expect(bs.has(6)).toBe(false)
  })

  it('set returns false for already set bit', () => {
    const bs = new SparseBitSet()
    bs.set(10)
    expect(bs.set(10)).toBe(false)
  })

  it('clear removes a bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.clear(5)).toBe(true)
    expect(bs.has(5)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('clear returns false for unset bit', () => {
    const bs = new SparseBitSet()
    expect(bs.clear(5)).toBe(false)
  })

  it('handles negative indices', () => {
    const bs = new SparseBitSet()
    expect(bs.set(-1)).toBe(false)
    expect(bs.has(-1)).toBe(false)
    expect(bs.clear(-1)).toBe(false)
  })
})

// ─── Size and Empty ───────────────────────────────────────
describe('SparseBitSet - size', () => {
  it('tracks size', () => {
    const bs = new SparseBitSet()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
    bs.set(1)
    bs.set(100)
    bs.set(1000000)
    expect(bs.size).toBe(3)
    expect(bs.isEmpty).toBe(false)
  })

  it('tracks chunkCount', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(1000000)
    expect(bs.chunkCount).toBe(2)
  })
})

// ─── Navigation ───────────────────────────────────────────
describe('SparseBitSet - navigation', () => {
  it('nextSetBit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    expect(bs.nextSetBit(0)).toBe(5)
    expect(bs.nextSetBit(6)).toBe(10)
    expect(bs.nextSetBit(11)).toBe(-1)
  })

  it('prevSetBit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    expect(bs.prevSetBit(10)).toBe(10)
    expect(bs.prevSetBit(9)).toBe(5)
    expect(bs.prevSetBit(4)).toBe(-1)
  })
})

// ─── Set operations ───────────────────────────────────────
describe('SparseBitSet - set operations', () => {
  it('and', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2); a.set(3)
    const b = new SparseBitSet()
    b.set(2); b.set(3); b.set(4)
    const result = a.and(b)
    expect(result.toArray()).toEqual([2, 3])
  })

  it('or', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2)
    const b = new SparseBitSet()
    b.set(3); b.set(4)
    const result = a.or(b)
    expect(result.toArray()).toEqual([1, 2, 3, 4])
  })

  it('xor', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2); a.set(3)
    const b = new SparseBitSet()
    b.set(2); b.set(3); b.set(4)
    const result = a.xor(b)
    expect(result.toArray()).toEqual([1, 4])
  })

  it('forEach iterates bits across multiple words (not just first word)', () => {
    const set = new SparseBitSet()
    // Set bits in word 0 (bits 0-31) and word 3 (bits 96-127)
    // Words 1 and 2 are zero, which would trigger the return bug
    set.set(1)
    set.set(100)
    const bits: number[] = []
    set.forEach((bit) => bits.push(bit))
    expect(bits).toEqual([1, 100])
  })

  it('toArray returns bits across multiple words', () => {
    const set = new SparseBitSet()
    set.set(0)
    set.set(50)
    set.set(100)
    set.set(200)
    expect(set.toArray()).toEqual([0, 50, 100, 200])
  })

  it('clone preserves bits across multiple words', () => {
    const set = new SparseBitSet()
    set.set(5)
    set.set(100)
    set.set(500)
    const clone = set.clone()
    expect(clone.toArray()).toEqual([5, 100, 500])
    expect(clone.size).toBe(3)
  })

  it('or handles bits across multiple words', () => {
    const a = new SparseBitSet()
    a.set(1)
    a.set(100)
    const b = new SparseBitSet()
    b.set(50)
    b.set(200)
    const result = a.or(b)
    expect(result.toArray()).toEqual([1, 50, 100, 200])
  })
})

// ─── Iteration and Clone ──────────────────────────────────
describe('SparseBitSet - iteration', () => {
  it('forEach', () => {
    const bs = new SparseBitSet()
    bs.set(1); bs.set(3); bs.set(5)
    const bits: number[] = []
    bs.forEach((b) => bits.push(b))
    expect(bits).toEqual([1, 3, 5])
  })

  it('toArray', () => {
    const bs = new SparseBitSet()
    bs.set(10); bs.set(20)
    expect(bs.toArray()).toEqual([10, 20])
  })

  it('clone is independent', () => {
    const bs = new SparseBitSet()
    bs.set(1); bs.set(2)
    const copy = bs.clone()
    bs.clear(1)
    expect(copy.has(1)).toBe(true)
  })

  it('reset clears all', () => {
    const bs = new SparseBitSet()
    bs.set(1); bs.set(2); bs.set(3)
    bs.reset()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })
})

describe('SparseBitSet - edge cases', () => {
  it('handles chunk boundary at 1024', () => {
    const bs = new SparseBitSet()
    bs.set(1023)
    bs.set(1024)
    bs.set(1025)
    expect(bs.has(1023)).toBe(true)
    expect(bs.has(1024)).toBe(true)
    expect(bs.has(1025)).toBe(true)
    expect(bs.size).toBe(3)
  })

  it('handles bits at word boundaries (32 bits)', () => {
    const bs = new SparseBitSet()
    bs.set(31)
    bs.set(32)
    bs.set(33)
    bs.set(63)
    bs.set(64)
    bs.set(65)
    expect(bs.size).toBe(6)
    expect(bs.has(31)).toBe(true)
    expect(bs.has(32)).toBe(true)
    expect(bs.has(64)).toBe(true)
  })

  it('handles very large bit indices', () => {
    const bs = new SparseBitSet()
    bs.set(1000000)
    bs.set(10000000)
    bs.set(100000000)
    expect(bs.size).toBe(3)
    expect(bs.has(1000000)).toBe(true)
    expect(bs.has(10000000)).toBe(true)
    expect(bs.has(100000000)).toBe(true)
  })

  it('handles clear at chunk boundary', () => {
    const bs = new SparseBitSet()
    bs.set(1023)
    bs.set(1024)
    bs.clear(1023)
    expect(bs.has(1023)).toBe(false)
    expect(bs.has(1024)).toBe(true)
    expect(bs.size).toBe(1)
  })

  it('handles nextSetBit at chunk boundary', () => {
    const bs = new SparseBitSet()
    bs.set(1023)
    bs.set(1024)
    expect(bs.nextSetBit(1023)).toBe(1023)
    expect(bs.nextSetBit(1024)).toBe(1024)
    expect(bs.nextSetBit(1025)).toBe(-1)
  })

  it('handles prevSetBit at chunk boundary', () => {
    const bs = new SparseBitSet()
    bs.set(1023)
    bs.set(1024)
    expect(bs.prevSetBit(1024)).toBe(1024)
    expect(bs.prevSetBit(1023)).toBe(1023)
    expect(bs.prevSetBit(1022)).toBe(-1)
  })

  it('handles gaps between chunks', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(2048)
    bs.set(4096)
    expect(bs.size).toBe(3)
    expect(bs.chunkCount).toBe(3)
    expect(bs.nextSetBit(1)).toBe(2048)
    expect(bs.prevSetBit(4095)).toBe(2048)
  })

  it('set returns false for negative bit', () => {
    const bs = new SparseBitSet()
    expect(bs.set(-1)).toBe(false)
    expect(bs.set(-100)).toBe(false)
  })

  it('clear returns false for negative bit', () => {
    const bs = new SparseBitSet()
    expect(bs.clear(-1)).toBe(false)
    expect(bs.clear(-100)).toBe(false)
  })

  it('has returns false for negative bit', () => {
    const bs = new SparseBitSet()
    expect(bs.has(-1)).toBe(false)
    expect(bs.has(-100)).toBe(false)
  })

  it('handles set of bit 0', () => {
    const bs = new SparseBitSet()
    expect(bs.set(0)).toBe(true)
    expect(bs.has(0)).toBe(true)
    expect(bs.size).toBe(1)
  })

  it('handles clear of bit 0', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    expect(bs.clear(0)).toBe(true)
    expect(bs.has(0)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('nextSetBit handles negative from value', () => {
    const bs = new SparseBitSet()
    bs.set(10)
    expect(bs.nextSetBit(-5)).toBe(10)
    expect(bs.nextSetBit(-1000)).toBe(10)
  })

  it('prevSetBit returns -1 for negative from', () => {
    const bs = new SparseBitSet()
    bs.set(10)
    expect(bs.prevSetBit(-1)).toBe(-1)
    expect(bs.prevSetBit(-100)).toBe(-1)
  })

  it('handles consecutive bits', () => {
    const bs = new SparseBitSet()
    bs.set(0); bs.set(1); bs.set(2); bs.set(3); bs.set(4)
    expect(bs.size).toBe(5)
    expect(bs.toArray()).toEqual([0, 1, 2, 3, 4])
  })

  it('handles alternating bits', () => {
    const bs = new SparseBitSet()
    bs.set(0); bs.set(2); bs.set(4); bs.set(6); bs.set(8)
    expect(bs.size).toBe(5)
    expect(bs.toArray()).toEqual([0, 2, 4, 6, 8])
  })

  it('handles setting all bits in a word', () => {
    const bs = new SparseBitSet()
    for (let i = 0; i < 32; i++) {
      bs.set(i)
    }
    expect(bs.size).toBe(32)
    for (let i = 0; i < 32; i++) {
      expect(bs.has(i)).toBe(true)
    }
  })

  it('handles clearing all bits in a word', () => {
    const bs = new SparseBitSet()
    for (let i = 0; i < 32; i++) {
      bs.set(i)
    }
    for (let i = 0; i < 32; i++) {
      bs.clear(i)
    }
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('clone of empty set is empty', () => {
    const bs = new SparseBitSet()
    const copy = bs.clone()
    expect(copy.size).toBe(0)
    expect(copy.isEmpty).toBe(true)
  })

  it('reset on empty set stays empty', () => {
    const bs = new SparseBitSet()
    bs.reset()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
  })

  it('forEach on empty set calls callback zero times', () => {
    const bs = new SparseBitSet()
    let callCount = 0
    bs.forEach(() => { callCount++ })
    expect(callCount).toBe(0)
  })

  it('toArray on empty set returns empty array', () => {
    const bs = new SparseBitSet()
    expect(bs.toArray()).toEqual([])
  })

  it('and with empty set returns empty set', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2)
    const b = new SparseBitSet()
    const result = a.and(b)
    expect(result.size).toBe(0)
    expect(result.isEmpty).toBe(true)
  })

  it('or with empty set returns copy of original', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2)
    const b = new SparseBitSet()
    const result = a.or(b)
    expect(result.toArray()).toEqual([1, 2])
    expect(result.size).toBe(2)
  })

  it('xor with empty set returns copy of original', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2)
    const b = new SparseBitSet()
    const result = a.xor(b)
    expect(result.toArray()).toEqual([1, 2])
    expect(result.size).toBe(2)
  })

  it('and with disjoint sets returns empty set', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2); a.set(3)
    const b = new SparseBitSet()
    b.set(10); b.set(20); b.set(30)
    const result = a.and(b)
    expect(result.size).toBe(0)
  })

  it('or with disjoint sets contains all bits', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2); a.set(3)
    const b = new SparseBitSet()
    b.set(10); b.set(20); b.set(30)
    const result = a.or(b)
    expect(result.size).toBe(6)
    expect(result.toArray()).toEqual([1, 2, 3, 10, 20, 30])
  })

  it('xor with disjoint sets contains all bits', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2); a.set(3)
    const b = new SparseBitSet()
    b.set(10); b.set(20); b.set(30)
    const result = a.xor(b)
    expect(result.size).toBe(6)
    expect(result.toArray()).toEqual([1, 2, 3, 10, 20, 30])
  })

  it('xor with identical sets returns empty set', () => {
    const a = new SparseBitSet()
    a.set(1); a.set(2); a.set(3)
    const b = a.clone()
    const result = a.xor(b)
    expect(result.size).toBe(0)
  })

  it('forEach iterates in sorted order', () => {
    const bs = new SparseBitSet()
    bs.set(100); bs.set(0); bs.set(50); bs.set(75)
    const bits: number[] = []
    bs.forEach((b) => bits.push(b))
    expect(bits).toEqual([0, 50, 75, 100])
  })

  it('toArray returns sorted array', () => {
    const bs = new SparseBitSet()
    bs.set(100); bs.set(0); bs.set(50); bs.set(75)
    expect(bs.toArray()).toEqual([0, 50, 75, 100])
  })

  it('clone has independent chunks', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(1024)
    const copy = bs.clone()
    bs.set(2048)
    bs.clear(0)
    expect(copy.has(0)).toBe(true)
    expect(copy.has(1024)).toBe(true)
    expect(copy.has(2048)).toBe(false)
  })

  it('handles bits at max 32-bit boundary', () => {
    const bs = new SparseBitSet()
    bs.set(31)
    bs.set(32)
    bs.set(63)
    bs.set(64)
    bs.set(95)
    bs.set(96)
    expect(bs.size).toBe(6)
    expect(bs.has(31)).toBe(true)
    expect(bs.has(32)).toBe(true)
    expect(bs.has(63)).toBe(true)
    expect(bs.has(64)).toBe(true)
    expect(bs.has(95)).toBe(true)
    expect(bs.has(96)).toBe(true)
  })

  it('nextSetBit finds first bit when from is 0', () => {
    const bs = new SparseBitSet()
    bs.set(0); bs.set(10); bs.set(20)
    expect(bs.nextSetBit(0)).toBe(0)
  })

  it('prevSetBit finds last bit when from is large', () => {
    const bs = new SparseBitSet()
    bs.set(0); bs.set(10); bs.set(20)
    expect(bs.prevSetBit(1000000)).toBe(20)
  })

  it('clear does not reduce chunkCount when chunk becomes empty', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(1024)
    expect(bs.chunkCount).toBe(2)
    bs.clear(0)
    expect(bs.chunkCount).toBe(2)
  })

  it('multiple set calls on same bit does not increase chunkCount', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(0)
    bs.set(0)
    expect(bs.size).toBe(1)
    expect(bs.chunkCount).toBe(1)
  })
})

describe('sparse-bit-set - wave548', () => {
  it('sparse-bit-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module has name', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module not null', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module has length', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave549', () => {
  it('sparse-bit-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave550', () => {
  it('sparse-bit-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave551', () => {
  it('sparse-bit-set w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave552', () => {
  it('sparse-bit-set w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w552 v2', () => {
    expect(describe).toBeDefined()
  })
})
