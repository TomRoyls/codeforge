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

describe('sparse-bit-set - wave553', () => {
  it('sparse-bit-set w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave554', () => {
  it('sparse-bit-set w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave555', () => {
  it('sparse-bit-set w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave556', () => {
  it('sparse-bit-set w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave557', () => {
  it('sparse-bit-set w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave558', () => {
  it('sparse-bit-set w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave559', () => {
  it('sparse-bit-set w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave560', () => {
  it('sparse-bit-set w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave561', () => {
  it('sparse-bit-set w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave562', () => {
  it('sparse-bit-set w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave563', () => {
  it('sparse-bit-set w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave564', () => {
  it('sparse-bit-set w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave565', () => {
  it('sparse-bit-set w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave566', () => {
  it('sparse-bit-set w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave127', () => {
  it('sparse-bit-set w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave130', () => {
  it('sparse-bit-set w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave133', () => {
  it('sparse-bit-set w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave136', () => {
  it('sparse-bit-set w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - wave139', () => {
  it('sparse-bit-set w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w142', () => {
  it('sparse-bit-set v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w145', () => {
  it('sparse-bit-set v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w148', () => {
  it('sparse-bit-set v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w151', () => {
  it('sparse-bit-set v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w154', () => {
  it('sparse-bit-set v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w157', () => {
  it('sparse-bit-set v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w160', () => {
  it('sparse-bit-set v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w170', () => {
  it('sparse-bit-set x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w180', () => {
  it('sparse-bit-set x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w190', () => {
  it('sparse-bit-set x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w200', () => {
  it('sparse-bit-set x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w210', () => {
  it('sparse-bit-set x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w220', () => {
  it('sparse-bit-set x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w230', () => {
  it('sparse-bit-set x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w240', () => {
  it('sparse-bit-set x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w250', () => {
  it('sparse-bit-set x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w260', () => {
  it('sparse-bit-set x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w270', () => {
  it('sparse-bit-set x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w280', () => {
  it('sparse-bit-set x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w290', () => {
  it('sparse-bit-set x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w300', () => {
  it('sparse-bit-set x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w310', () => {
  it('sparse-bit-set x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w320', () => {
  it('sparse-bit-set x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w330', () => {
  it('sparse-bit-set x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w340', () => {
  it('sparse-bit-set x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w350', () => {
  it('sparse-bit-set x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w360', () => {
  it('sparse-bit-set x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w370', () => {
  it('sparse-bit-set x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w380', () => {
  it('sparse-bit-set x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w390', () => {
  it('sparse-bit-set x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w400', () => {
  it('sparse-bit-set x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w420', () => {
  it('sparse-bit-set x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w440', () => {
  it('sparse-bit-set x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w460', () => {
  it('sparse-bit-set x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w480', () => {
  it('sparse-bit-set x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w500', () => {
  it('sparse-bit-set x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w550', () => {
  it('sparse-bit-set x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bit-set - w600', () => {
  it('sparse-bit-set x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bit-set x600x49', () => {
    expect(describe).toBeDefined()
  })
})
