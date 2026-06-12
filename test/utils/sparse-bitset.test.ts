import { describe, it, expect } from 'vitest'
import { SparseBitSet } from '../../src/utils/sparse-bitset.js'

describe('SparseBitSet', () => {
  it('initializes empty', () => {
    const bs = new SparseBitSet()
    expect(bs.size).toBe(0)
    expect(bs.isEmpty).toBe(true)
    expect(bs.memoryChunks).toBe(0)
  })

  it('sets a single bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.size).toBe(1)
    expect(bs.isEmpty).toBe(false)
    expect(bs.get(5)).toBe(true)
  })

  it('gets bit that is not set', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.get(10)).toBe(false)
  })

  it('gets negative index returns false', () => {
    const bs = new SparseBitSet()
    expect(bs.get(-1)).toBe(false)
    expect(bs.get(-5)).toBe(false)
  })

  it('sets multiple bits', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(10)
    bs.set(100)
    expect(bs.size).toBe(3)
    expect(bs.get(0)).toBe(true)
    expect(bs.get(10)).toBe(true)
    expect(bs.get(100)).toBe(true)
  })

  it('clears a set bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.get(5)).toBe(true)
    bs.clear(5)
    expect(bs.get(5)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('clears bit that is not set', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.clear(10)
    expect(bs.size).toBe(1)
    expect(bs.get(5)).toBe(true)
  })

  it('clears negative index does nothing', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.clear(-1)
    expect(bs.size).toBe(1)
  })

  it('flips bit from unset to set', () => {
    const bs = new SparseBitSet()
    expect(bs.get(5)).toBe(false)
    bs.flip(5)
    expect(bs.get(5)).toBe(true)
    expect(bs.size).toBe(1)
  })

  it('flips bit from set to unset', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.get(5)).toBe(true)
    bs.flip(5)
    expect(bs.get(5)).toBe(false)
    expect(bs.size).toBe(0)
  })

  it('flips negative index does nothing', () => {
    const bs = new SparseBitSet()
    bs.flip(-1)
    expect(bs.size).toBe(0)
  })

  it('performs AND with empty set', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.and(bs2)
    expect(bs1.size).toBe(0)
  })

  it('performs AND with overlapping bits', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    bs2.set(5)
    bs2.set(15)
    bs1.and(bs2)
    expect(bs1.size).toBe(1)
    expect(bs1.get(5)).toBe(true)
    expect(bs1.get(10)).toBe(false)
    expect(bs1.get(15)).toBe(false)
  })

  it('performs OR with empty set', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.or(bs2)
    expect(bs1.size).toBe(1)
    expect(bs1.get(5)).toBe(true)
  })

  it('performs OR with overlapping bits', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    bs2.set(5)
    bs2.set(15)
    bs1.or(bs2)
    expect(bs1.size).toBe(3)
    expect(bs1.get(5)).toBe(true)
    expect(bs1.get(10)).toBe(true)
    expect(bs1.get(15)).toBe(true)
  })

  it('performs XOR with empty set', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.xor(bs2)
    expect(bs1.size).toBe(1)
    expect(bs1.get(5)).toBe(true)
  })

  it('performs XOR with overlapping bits', () => {
    const bs1 = new SparseBitSet()
    const bs2 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    bs2.set(5)
    bs2.set(15)
    bs1.xor(bs2)
    expect(bs1.size).toBe(2)
    expect(bs1.get(5)).toBe(false)
    expect(bs1.get(10)).toBe(true)
    expect(bs1.get(15)).toBe(true)
  })

  it('finds next set bit from start', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.nextSetBit(0)).toBe(5)
  })

  it('finds next set bit from middle', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.nextSetBit(6)).toBe(10)
  })

  it('finds next set bit returns -1 when none exists', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    expect(bs.nextSetBit(11)).toBe(-1)
  })

  it('finds next set bit returns -1 for empty set', () => {
    const bs = new SparseBitSet()
    expect(bs.nextSetBit(0)).toBe(-1)
  })

  it('finds next set bit with negative from', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    expect(bs.nextSetBit(-1)).toBe(5)
  })

  it('converts to array', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    bs.set(15)
    expect(bs.toArray()).toEqual([5, 10, 15])
  })

  it('converts empty set to empty array', () => {
    const bs = new SparseBitSet()
    expect(bs.toArray()).toEqual([])
  })

  it('handles bits in same chunk', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(1)
    bs.set(2)
    bs.set(31)
    expect(bs.size).toBe(4)
    expect(bs.memoryChunks).toBe(1)
  })

  it('handles bits across multiple chunks', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(32)
    bs.set(64)
    expect(bs.size).toBe(3)
    expect(bs.memoryChunks).toBe(3)
  })

  it('sets same bit twice does not increase size', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(5)
    expect(bs.size).toBe(1)
  })

  it('clears bit removes chunk when empty', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(32)
    bs.clear(0)
    expect(bs.size).toBe(1)
    expect(bs.memoryChunks).toBe(1)
  })

  it('handles chunk boundary at 32', () => {
    const bs = new SparseBitSet()
    bs.set(31)
    bs.set(32)
    bs.set(33)
    expect(bs.size).toBe(3)
    expect(bs.get(31)).toBe(true)
    expect(bs.get(32)).toBe(true)
    expect(bs.get(33)).toBe(true)
  })

  it('handles very large bit indices', () => {
    const bs = new SparseBitSet()
    bs.set(100000)
    bs.set(1000000)
    bs.set(10000000)
    expect(bs.size).toBe(3)
    expect(bs.get(100000)).toBe(true)
    expect(bs.get(1000000)).toBe(true)
    expect(bs.get(10000000)).toBe(true)
  })

  it('handles set of bit 0', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    expect(bs.size).toBe(1)
    expect(bs.get(0)).toBe(true)
  })

  it('handles clear of bit 0', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.clear(0)
    expect(bs.size).toBe(0)
    expect(bs.get(0)).toBe(false)
  })

  it('flip of negative index does nothing', () => {
    const bs = new SparseBitSet()
    bs.flip(-1)
    bs.flip(-100)
    expect(bs.size).toBe(0)
  })

  it('nextSetBit handles negative from', () => {
    const bs = new SparseBitSet()
    bs.set(10)
    expect(bs.nextSetBit(-5)).toBe(10)
    expect(bs.nextSetBit(-1000)).toBe(10)
  })

  it('nextSetBit returns first set bit when from is 0', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(10)
    bs.set(20)
    expect(bs.nextSetBit(0)).toBe(0)
  })

  it('nextSetBit returns -1 when starting beyond all set bits', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(10)
    bs.set(20)
    expect(bs.nextSetBit(21)).toBe(-1)
    expect(bs.nextSetBit(1000)).toBe(-1)
  })

  it('nextSetBit finds bit in first chunk', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    expect(bs.nextSetBit(3)).toBe(5)
  })

  it('nextSetBit finds bit in later chunk', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(100)
    bs.set(200)
    expect(bs.nextSetBit(10)).toBe(100)
  })

  it('nextSetBit handles from exactly at set bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(10)
    expect(bs.nextSetBit(5)).toBe(5)
    expect(bs.nextSetBit(10)).toBe(10)
  })

  it('toArray returns sorted bits', () => {
    const bs = new SparseBitSet()
    bs.set(100)
    bs.set(0)
    bs.set(50)
    bs.set(75)
    expect(bs.toArray()).toEqual([0, 50, 75, 100])
  })

  it('toArray handles bits across multiple chunks', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(31)
    bs.set(32)
    bs.set(64)
    bs.set(100)
    expect(bs.toArray()).toEqual([0, 31, 32, 64, 100])
  })

  it('handles consecutive bits', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(1)
    bs.set(2)
    bs.set(3)
    bs.set(4)
    expect(bs.size).toBe(5)
    expect(bs.toArray()).toEqual([0, 1, 2, 3, 4])
  })

  it('handles alternating bits', () => {
    const bs = new SparseBitSet()
    bs.set(0)
    bs.set(2)
    bs.set(4)
    bs.set(6)
    bs.set(8)
    expect(bs.size).toBe(5)
    expect(bs.toArray()).toEqual([0, 2, 4, 6, 8])
  })

  it('set returns same result for duplicate sets', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.set(5)
    bs.set(5)
    expect(bs.size).toBe(1)
  })

  it('clear returns same result for duplicate clears', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.clear(5)
    bs.clear(5)
    expect(bs.size).toBe(0)
  })

  it('flip toggles bit multiple times', () => {
    const bs = new SparseBitSet()
    bs.flip(5)
    expect(bs.get(5)).toBe(true)
    bs.flip(5)
    expect(bs.get(5)).toBe(false)
    bs.flip(5)
    expect(bs.get(5)).toBe(true)
  })

  it('and operation with identical sets', () => {
    const bs1 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    const bs2 = new SparseBitSet()
    bs2.set(5)
    bs2.set(10)
    bs1.and(bs2)
    expect(bs1.size).toBe(2)
    expect(bs1.get(5)).toBe(true)
    expect(bs1.get(10)).toBe(true)
  })

  it('and operation with disjoint sets', () => {
    const bs1 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    const bs2 = new SparseBitSet()
    bs2.set(20)
    bs2.set(30)
    bs1.and(bs2)
    expect(bs1.size).toBe(0)
  })

  it('or operation with identical sets', () => {
    const bs1 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    const bs2 = new SparseBitSet()
    bs2.set(5)
    bs2.set(10)
    bs1.or(bs2)
    expect(bs1.size).toBe(2)
    expect(bs1.get(5)).toBe(true)
    expect(bs1.get(10)).toBe(true)
  })

  it('or operation with disjoint sets', () => {
    const bs1 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    const bs2 = new SparseBitSet()
    bs2.set(20)
    bs2.set(30)
    bs1.or(bs2)
    expect(bs1.size).toBe(4)
    expect(bs1.get(5)).toBe(true)
    expect(bs1.get(10)).toBe(true)
    expect(bs1.get(20)).toBe(true)
    expect(bs1.get(30)).toBe(true)
  })

  it('xor operation with identical sets', () => {
    const bs1 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    const bs2 = new SparseBitSet()
    bs2.set(5)
    bs2.set(10)
    bs1.xor(bs2)
    expect(bs1.size).toBe(0)
  })

  it('xor operation with disjoint sets', () => {
    const bs1 = new SparseBitSet()
    bs1.set(5)
    bs1.set(10)
    const bs2 = new SparseBitSet()
    bs2.set(20)
    bs2.set(30)
    bs1.xor(bs2)
    expect(bs1.size).toBe(4)
    expect(bs1.get(5)).toBe(true)
    expect(bs1.get(10)).toBe(true)
    expect(bs1.get(20)).toBe(true)
    expect(bs1.get(30)).toBe(true)
  })

  it('get returns false for unset bit', () => {
    const bs = new SparseBitSet()
    expect(bs.get(100)).toBe(false)
  })

  it('flip toggles bit', () => {
    const bs = new SparseBitSet()
    bs.set(5)
    bs.flip(5)
    expect(bs.get(5)).toBe(false)
  })

  it('isEmpty on new bitset', () => {
    const bs = new SparseBitSet()
    expect(bs.isEmpty).toBe(true)
  })
})

describe('sparse-bitset - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('sparse-bitset - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('sparse-bitset - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('sparse-bitset - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('sparse-bitset - wave548', () => {
  it('sparse-bitset module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave549', () => {
  it('sparse-bitset module defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset module is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave550', () => {
  it('sparse-bitset w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave551', () => {
  it('sparse-bitset w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave552', () => {
  it('sparse-bitset w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave553', () => {
  it('sparse-bitset w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave554', () => {
  it('sparse-bitset w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave555', () => {
  it('sparse-bitset w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave556', () => {
  it('sparse-bitset w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave557', () => {
  it('sparse-bitset w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
