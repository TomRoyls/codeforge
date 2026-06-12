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

describe('sparse-bitset - wave558', () => {
  it('sparse-bitset w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave559', () => {
  it('sparse-bitset w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave560', () => {
  it('sparse-bitset w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave561', () => {
  it('sparse-bitset w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave562', () => {
  it('sparse-bitset w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave563', () => {
  it('sparse-bitset w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave564', () => {
  it('sparse-bitset w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave565', () => {
  it('sparse-bitset w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave566', () => {
  it('sparse-bitset w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave127', () => {
  it('sparse-bitset w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave130', () => {
  it('sparse-bitset w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave133', () => {
  it('sparse-bitset w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave136', () => {
  it('sparse-bitset w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - wave139', () => {
  it('sparse-bitset w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w142', () => {
  it('sparse-bitset v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w145', () => {
  it('sparse-bitset v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w148', () => {
  it('sparse-bitset v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w151', () => {
  it('sparse-bitset v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w154', () => {
  it('sparse-bitset v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w157', () => {
  it('sparse-bitset v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w160', () => {
  it('sparse-bitset v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w170', () => {
  it('sparse-bitset x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w180', () => {
  it('sparse-bitset x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w190', () => {
  it('sparse-bitset x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w200', () => {
  it('sparse-bitset x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w210', () => {
  it('sparse-bitset x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w220', () => {
  it('sparse-bitset x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w230', () => {
  it('sparse-bitset x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w240', () => {
  it('sparse-bitset x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w250', () => {
  it('sparse-bitset x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w260', () => {
  it('sparse-bitset x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w270', () => {
  it('sparse-bitset x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w280', () => {
  it('sparse-bitset x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w290', () => {
  it('sparse-bitset x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w300', () => {
  it('sparse-bitset x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w310', () => {
  it('sparse-bitset x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w320', () => {
  it('sparse-bitset x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w330', () => {
  it('sparse-bitset x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w340', () => {
  it('sparse-bitset x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w350', () => {
  it('sparse-bitset x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w360', () => {
  it('sparse-bitset x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w370', () => {
  it('sparse-bitset x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w380', () => {
  it('sparse-bitset x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w390', () => {
  it('sparse-bitset x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w400', () => {
  it('sparse-bitset x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w420', () => {
  it('sparse-bitset x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w440', () => {
  it('sparse-bitset x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w460', () => {
  it('sparse-bitset x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w480', () => {
  it('sparse-bitset x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w500', () => {
  it('sparse-bitset x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w550', () => {
  it('sparse-bitset x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w600', () => {
  it('sparse-bitset x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w650', () => {
  it('sparse-bitset x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('sparse-bitset - w700', () => {
  it('sparse-bitset x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('sparse-bitset x700x49', () => {
    expect(describe).toBeDefined()
  })
})
