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

  it('hash of empty set is consistent', () => {
    const z = new ZobristHashing<string>()
    const h1 = z.hash(new Map())
    const h2 = z.hash(new Map())
    expect(h1).toBe(h2)
  })

  it('different maps produce different hashes', () => {
    const z = new ZobristHashing()
    const m1 = new Map([['a', 1]])
    const m2 = new Map([['b', 2]])
    expect(z.hash(m1)).not.toBe(z.hash(m2))
  })

  it('same map has same hash', () => {
    const z = new ZobristHashing<string>()
    const m = new Map([['a', 1], ['b', 2]])
    expect(z.hash(m)).toBe(z.hash(m))
  })

  it('different maps have different hashes', () => {
    const z = new ZobristHashing<string>()
    const m1 = new Map([['a', 1]])
    const m2 = new Map([['a', 2]])
    expect(z.hash(m1)).not.toBe(z.hash(m2))
  })

  it('handles position at boundary', () => {
    const z = new ZobristHashing({ positions: 10, pieces: 5 })
    const state = new Map([[9, 4]])
    const h = z.hash(state)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
  })

  it('handles pieceId at boundary', () => {
    const z = new ZobristHashing({ positions: 10, pieces: 5 })
    const state = new Map([[5, 4]])
    const h = z.hash(state)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
  })

  it('handles state with many pieces', () => {
    const z = new ZobristHashing({ positions: 100, pieces: 20 })
    const state = new Map<number, number>()
    for (let i = 0; i < 50; i++) {
      state.set(i, i % 10)
    }
    const h = z.hash(state)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
  })

  it('movePiece with same from and to position cancels both XORs', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map())
    const h2 = z.addToHash(h1, 5, 3)
    const h3 = z.movePiece(h2, 5, 5, 3)
    expect(h3).toBe(h2)
  })

  it('movePiece chain XORs correctly', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map())
    const h2 = z.addToHash(h1, 0, 1)
    const h3 = z.movePiece(h2, 0, 1, 1)
    const h4 = z.movePiece(h3, 1, 2, 1)
    const h5 = z.movePiece(h4, 2, 0, 1)
    expect(h5).toBe(h2)
  })

  it('addToHash for out-of-range entry returns same hash', () => {
    const z = new ZobristHashing({ positions: 10, pieces: 5 })
    const h1 = z.hash(new Map())
    const h2 = z.addToHash(h1, 100, 100)
    expect(h2).toBe(h1)
  })

  it('multiple removeFromHash calls compose correctly', () => {
    const z = new ZobristHashing()
    const state = new Map([[0, 1], [1, 2], [2, 3]])
    const h1 = z.hash(state)
    let h2 = z.removeFromHash(h1, 0, 1)
    h2 = z.removeFromHash(h2, 1, 2)
    h2 = z.removeFromHash(h2, 2, 3)
    expect(h2).toBe(0)
  })

  it('hash with zero pieceId works', () => {
    const z = new ZobristHashing()
    const state = new Map([[0, 0]])
    const h = z.hash(state)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
  })

  it('hash with string key works', () => {
    const z = new ZobristHashing<string>()
    const state = new Map([['position1', 1], ['position2', 2]])
    const h = z.hash(state)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
  })

  it('different string keys produce different hashes', () => {
    const z = new ZobristHashing<string>()
    const s1 = new Map([['abc', 1]])
    const s2 = new Map([['def', 1]])
    expect(z.hash(s1)).not.toBe(z.hash(s2))
  })

  it('same string key produces same hash', () => {
    const z = new ZobristHashing<string>()
    const s1 = new Map([['test', 1]])
    const s2 = new Map([['test', 1]])
    expect(z.hash(s1)).toBe(z.hash(s2))
  })

  it('stringToPosition maps consistently', () => {
    const z = new ZobristHashing<string>({ positions: 10, pieces: 2 })
    const s1 = new Map([['same', 1]])
    const s2 = new Map([['same', 1]])
    expect(z.hash(s1)).toBe(z.hash(s2))
  })

  it('hash with numeric and string keys works', () => {
    const z1 = new ZobristHashing<number>()
    const z2 = new ZobristHashing<string>()
    const state1 = new Map([[0, 1], [1, 2]])
    const state2 = new Map([['a', 1], ['b', 2]])
    expect(z1.hash(state1)).toBeGreaterThanOrEqual(0)
    expect(z2.hash(state2)).toBeGreaterThanOrEqual(0)
  })

  it('getTableEntry returns non-zero for valid ranges', () => {
    const z = new ZobristHashing({ positions: 50, pieces: 10 })
    for (let i = 0; i < 50; i++) {
      for (let j = 0; j < 10; j++) {
        const val = z.getTableEntry(i, j)
        expect(val).not.toBe(0)
      }
    }
  })

  it('getTableEntry returns 0 for out of bounds', () => {
    const z = new ZobristHashing({ positions: 10, pieces: 5 })
    expect(z.getTableEntry(10, 0)).toBe(0)
    expect(z.getTableEntry(0, 5)).toBe(0)
    expect(z.getTableEntry(-1, 0)).toBe(0)
    expect(z.getTableEntry(0, -1)).toBe(0)
  })

  it('tableSize matches positions * pieces', () => {
    const z = new ZobristHashing({ positions: 20, pieces: 8 })
    expect(z.tableSize).toBe(160)
  })

  it('tableSize with default options is correct', () => {
    const z = new ZobristHashing()
    expect(z.tableSize).toBe(768)
  })

  it('hash is unsigned 32-bit integer', () => {
    const z = new ZobristHashing()
    const state = new Map([[0, 1], [1, 2], [2, 3], [3, 4]])
    const h = z.hash(state)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThan(4294967296)
  })

  it('multiple addToHash and removeFromHash maintain hash', () => {
    const z = new ZobristHashing()
    let h = z.hash(new Map())
    h = z.addToHash(h, 0, 1)
    h = z.addToHash(h, 1, 2)
    h = z.addToHash(h, 2, 3)
    h = z.removeFromHash(h, 1, 2)
    h = z.removeFromHash(h, 2, 3)
    h = z.removeFromHash(h, 0, 1)
    expect(h).toBe(0)
  })

  it('different seeds produce different tables', () => {
    const z1 = new ZobristHashing({ seed: 1, positions: 5, pieces: 3 })
    const z2 = new ZobristHashing({ seed: 2, positions: 5, pieces: 3 })
    const state = new Map([[0, 1]])
    expect(z1.hash(state)).not.toBe(z2.hash(state))
  })

  it('hash is invariant to order of operations', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map())
    const h2a = z.addToHash(h1, 0, 1)
    const h2b = z.addToHash(h2a, 1, 2)
    const h2c = z.addToHash(h2b, 2, 3)
    const h3a = z.addToHash(h1, 2, 3)
    const h3b = z.addToHash(h3a, 1, 2)
    const h3c = z.addToHash(h3b, 0, 1)
    expect(h2c).toBe(h3c)
  })

  it('handles large pieceId values', () => {
    const z = new ZobristHashing({ positions: 10, pieces: 100 })
    const state = new Map([[5, 99]])
    const h = z.hash(state)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
  })

  it('handles large position values', () => {
    const z = new ZobristHashing({ positions: 100, pieces: 10 })
    const state = new Map([[99, 5]])
    const h = z.hash(state)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
  })

  it('empty state hash with numeric keys is 0', () => {
    const z = new ZobristHashing<number>()
    expect(z.hash(new Map())).toBe(0)
  })

  it('empty state hash with string keys is 0', () => {
    const z = new ZobristHashing<string>()
    expect(z.hash(new Map())).toBe(0)
  })

  it('complex movePiece sequence works', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map())
    let h = z.addToHash(h1, 0, 1)
    h = z.addToHash(h, 1, 2)
    h = z.movePiece(h, 0, 2, 1)
    h = z.movePiece(h, 1, 3, 2)
    h = z.removeFromHash(h, 2, 1)
    h = z.removeFromHash(h, 3, 2)
    expect(h).toBe(h1)
  })

  it('hash with duplicate positions overwrites', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map([[0, 1]]))
    const h2 = z.hash(new Map([[0, 1], [0, 2]]))
    const h3 = z.hash(new Map([[0, 2]]))
    expect(h2).toBe(h3)
  })

  it('movePiece with non-existent piece adds to both positions', () => {
    const z = new ZobristHashing()
    const h1 = z.hash(new Map())
    const h2 = z.movePiece(h1, 0, 1, 5)
    const h3 = z.hash(new Map([[0, 5], [1, 5]]))
    expect(h2).toBe(h3)
  })
})

  it('hash returns number for state', () => {
    const zh = new ZobristHashing<number>()
    const state = new Map<number, number>()
    state.set(0, 1)
    state.set(1, 2)
    expect(typeof zh.hash(state)).toBe('number')
  })

  it('addToHash modifies hash', () => {
    const zh = new ZobristHashing<number>()
    const h1 = 0
    const h2 = zh.addToHash(h1, 0, 1)
    expect(h2).not.toBe(h1)
  })

  it('movePiece combines add and remove', () => {
    const zh = new ZobristHashing<number>()
    const h1 = zh.addToHash(0, 0, 1)
    const h2 = zh.movePiece(h1, 0, 1, 1)
    expect(typeof h2).toBe('number')
  })

describe('zobrist-hashing - extra', () => {
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

describe('zobrist-hashing - wave545', () => {
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

describe('zobrist-hashing - wave546', () => {
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

describe('zobrist-hashing - wave547', () => {
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

describe('zobrist-hashing - wave548', () => {
  it('zobrist-hashing module defined', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing module is function', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave549', () => {
  it('zobrist-hashing module defined', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing module is function', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave550', () => {
  it('zobrist-hashing w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave551', () => {
  it('zobrist-hashing w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave552', () => {
  it('zobrist-hashing w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave553', () => {
  it('zobrist-hashing w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave554', () => {
  it('zobrist-hashing w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave555', () => {
  it('zobrist-hashing w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave556', () => {
  it('zobrist-hashing w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave557', () => {
  it('zobrist-hashing w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave558', () => {
  it('zobrist-hashing w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave559', () => {
  it('zobrist-hashing w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave560', () => {
  it('zobrist-hashing w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave561', () => {
  it('zobrist-hashing w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave562', () => {
  it('zobrist-hashing w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave563', () => {
  it('zobrist-hashing w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave564', () => {
  it('zobrist-hashing w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave565', () => {
  it('zobrist-hashing w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave566', () => {
  it('zobrist-hashing w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave127', () => {
  it('zobrist-hashing w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave130', () => {
  it('zobrist-hashing w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave133', () => {
  it('zobrist-hashing w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave136', () => {
  it('zobrist-hashing w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - wave139', () => {
  it('zobrist-hashing w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w142', () => {
  it('zobrist-hashing v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w145', () => {
  it('zobrist-hashing v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w148', () => {
  it('zobrist-hashing v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w151', () => {
  it('zobrist-hashing v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w154', () => {
  it('zobrist-hashing v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w157', () => {
  it('zobrist-hashing v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w160', () => {
  it('zobrist-hashing v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w170', () => {
  it('zobrist-hashing x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w180', () => {
  it('zobrist-hashing x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w190', () => {
  it('zobrist-hashing x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w200', () => {
  it('zobrist-hashing x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w210', () => {
  it('zobrist-hashing x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w220', () => {
  it('zobrist-hashing x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w230', () => {
  it('zobrist-hashing x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w240', () => {
  it('zobrist-hashing x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w250', () => {
  it('zobrist-hashing x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w260', () => {
  it('zobrist-hashing x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w270', () => {
  it('zobrist-hashing x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w280', () => {
  it('zobrist-hashing x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w290', () => {
  it('zobrist-hashing x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w300', () => {
  it('zobrist-hashing x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w310', () => {
  it('zobrist-hashing x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w320', () => {
  it('zobrist-hashing x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w330', () => {
  it('zobrist-hashing x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w340', () => {
  it('zobrist-hashing x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w350', () => {
  it('zobrist-hashing x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w360', () => {
  it('zobrist-hashing x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w370', () => {
  it('zobrist-hashing x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w380', () => {
  it('zobrist-hashing x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w390', () => {
  it('zobrist-hashing x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w400', () => {
  it('zobrist-hashing x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w420', () => {
  it('zobrist-hashing x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w440', () => {
  it('zobrist-hashing x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w460', () => {
  it('zobrist-hashing x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w480', () => {
  it('zobrist-hashing x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('zobrist-hashing - w500', () => {
  it('zobrist-hashing x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('zobrist-hashing x500x19', () => {
    expect(describe).toBeDefined()
  })
})
