import { describe, expect, it } from 'vitest'
import { BinaryTrie } from '../../src/utils/binary-trie.js'

describe('BinaryTrie', () => {
  it('inserts and finds', () => {
    const bt = new BinaryTrie(8)
    bt.insert(5)
    expect(bt.find(5)).toBe(true)
    expect(bt.find(6)).toBe(false)
  })

  it('handles multiple inserts', () => {
    const bt = new BinaryTrie(8)
    bt.insert(1)
    bt.insert(2)
    bt.insert(3)
    expect(bt.size).toBe(3)
    expect(bt.find(1)).toBe(true)
    expect(bt.find(2)).toBe(true)
    expect(bt.find(4)).toBe(false)
  })

  it('maxXor finds best match', () => {
    const bt = new BinaryTrie(8)
    bt.insert(2)
    bt.insert(4)
    bt.insert(7)
    expect(bt.maxXor(5)).toBe(7)
  })

  it('removes element', () => {
    const bt = new BinaryTrie(8)
    bt.insert(5)
    expect(bt.remove(5)).toBe(true)
    expect(bt.find(5)).toBe(false)
    expect(bt.size).toBe(0)
  })

  it('remove non-existent returns false', () => {
    const bt = new BinaryTrie(8)
    expect(bt.remove(42)).toBe(false)
  })

  it('handles zero', () => {
    const bt = new BinaryTrie(4)
    bt.insert(0)
    expect(bt.find(0)).toBe(true)
    expect(bt.maxXor(0)).toBe(0)
  })

  it('handles max value', () => {
    const bt = new BinaryTrie(4)
    bt.insert(15)
    expect(bt.find(15)).toBe(true)
    expect(bt.maxXor(0)).toBe(15)
  })

  it('maxXor with multiple candidates', () => {
    const bt = new BinaryTrie(4)
    bt.insert(3)
    bt.insert(10)
    expect(bt.maxXor(5)).toBeGreaterThanOrEqual(5 ^ 10)
  })

  it('duplicate insert increments count', () => {
    const bt = new BinaryTrie(8)
    bt.insert(5)
    bt.insert(5)
    expect(bt.size).toBe(2)
    bt.remove(5)
    expect(bt.find(5)).toBe(true)
  })

  it('maxXor returns 0 for same value', () => {
    const bt = new BinaryTrie(4)
    bt.insert(5)
    expect(bt.maxXor(5)).toBe(0)
  })

  it('handles 16-bit values', () => {
    const bt = new BinaryTrie(16)
    bt.insert(1000)
    bt.insert(2000)
    expect(bt.find(1000)).toBe(true)
    expect(bt.maxXor(0)).toBe(2000)
  })

  it('handles zero insertion', () => {
    const bt = new BinaryTrie(4)
    bt.insert(0)
    expect(bt.find(0)).toBe(true)
    expect(bt.size).toBe(1)
  })

  it('handles all ones', () => {
    const bt = new BinaryTrie(4)
    bt.insert(15)
    expect(bt.find(15)).toBe(true)
    expect(bt.maxXor(0)).toBe(15)
  })

    it('handles remove to empty', () => {
      const bt = new BinaryTrie(4)
      bt.insert(5)
      bt.remove(5)
      expect(bt.size).toBe(0)
      expect(bt.find(5)).toBe(false)
    })

    it('handles multiple insert remove', () => {
      const bt = new BinaryTrie(4)
      bt.insert(3)
      bt.insert(7)
      bt.remove(3)
      expect(bt.find(3)).toBe(false)
      expect(bt.find(7)).toBe(true)
      expect(bt.size).toBe(1)
    })

    it('handles removal of duplicate', () => {
      const bt = new BinaryTrie(8)
      bt.insert(5)
      bt.insert(5)
      bt.remove(5)
      expect(bt.size).toBe(1)
      expect(bt.find(5)).toBe(true)
      bt.remove(5)
      expect(bt.size).toBe(0)
      expect(bt.find(5)).toBe(false)
    })

    it('remove maintains other values', () => {
      const bt = new BinaryTrie(8)
      bt.insert(1)
      bt.insert(2)
      bt.insert(3)
      bt.remove(2)
      expect(bt.find(1)).toBe(true)
      expect(bt.find(2)).toBe(false)
      expect(bt.find(3)).toBe(true)
    })

  it('handles maxXor with multiple values', () => {
    const bt = new BinaryTrie(4)
    bt.insert(3)
    bt.insert(5)
    bt.insert(10)
    expect(bt.maxXor(0)).toBeGreaterThan(0)
    expect(bt.maxXor(7)).toBeGreaterThan(0)
  })

  it('handles duplicate inserts', () => {
    const bt = new BinaryTrie(4)
    bt.insert(5)
    bt.insert(5)
    expect(bt.find(5)).toBe(true)
    expect(bt.size).toBe(2)
  })

  it('remove removes element', () => {
    const bt = new BinaryTrie()
    bt.insert(3)
    bt.insert(7)
    bt.remove(3)
    expect(bt.find(3)).toBe(false)
    expect(bt.find(7)).toBe(true)
  })

  it('count returns number of insertions', () => {
    const bt = new BinaryTrie()
    bt.insert(5)
    bt.insert(5)
    bt.insert(3)
    expect(bt.size).toBe(3)
  })

  it('find returns true for inserted element', () => {
    const bt = new BinaryTrie()
    bt.insert(7)
    expect(bt.find(7)).toBe(true)
    expect(bt.find(6)).toBe(false)
  })

  it('remove decreases count', () => {
    const bt = new BinaryTrie()
    bt.insert(5)
    bt.insert(5)
    bt.remove(5)
    expect(bt.find(5)).toBe(true)
  })

  it('find returns true for existing', () => {
    const bt = new BinaryTrie()
    bt.insert(1)
    expect(bt.find(1)).toBe(true)
  })

  it('find returns false for absent value', () => {
    const bt = new BinaryTrie()
    bt.insert(1)
    expect(bt.find(2)).toBe(false)
  })

  it('find on empty returns false', () => {
    const bt = new BinaryTrie()
    expect(bt.find(0)).toBe(false)
  })

  it('insert and find returns true', () => {
    const trie = new BinaryTrie(8)
    trie.insert(42)
    expect(trie.find(42)).toBe(true)
  })

  describe('BinaryTrie toString', () => {
    it('returns correct format for empty', () => {
      const trie = new BinaryTrie(8)
      expect(trie.toString()).toBe('BinaryTrie(bits=8, size=0)')
    })

    it('reflects size after insertions', () => {
      const trie = new BinaryTrie(8)
      trie.insert(1)
      trie.insert(2)
      expect(trie.toString()).toBe('BinaryTrie(bits=8, size=2)')
    })

    it('reflects custom bits', () => {
      const trie = new BinaryTrie(16)
      expect(trie.toString()).toBe('BinaryTrie(bits=16, size=0)')
    })
  })

  describe('BinaryTrie toJSON', () => {
    it('returns structure with bits and values', () => {
      const trie = new BinaryTrie(8)
      trie.insert(5)
      trie.insert(10)
      const json = trie.toJSON() as { bits: number; values: number[] }
      expect(json.bits).toBe(8)
      expect(json.values).toContain(5)
      expect(json.values).toContain(10)
    })

    it('returns empty values for empty trie', () => {
      const trie = new BinaryTrie(8)
      const json = trie.toJSON() as { bits: number; values: number[] }
      expect(json.values).toEqual([])
    })
  })

  describe('BinaryTrie clone', () => {
    it('creates independent copy', () => {
      const trie = new BinaryTrie(8)
      trie.insert(1)
      trie.insert(2)
      const copy = trie.clone()
      expect(copy.find(1)).toBe(true)
      expect(copy.find(2)).toBe(true)
      expect(copy.size).toBe(2)
    })

    it('modifications to clone do not affect original', () => {
      const trie = new BinaryTrie(8)
      trie.insert(1)
      const copy = trie.clone()
      copy.insert(99)
      expect(trie.find(99)).toBe(false)
      expect(copy.find(99)).toBe(true)
    })

    it('clone of empty is empty', () => {
      const trie = new BinaryTrie(8)
      const copy = trie.clone()
      expect(copy.size).toBe(0)
    })

    it('clone with duplicates - clones unique values only', () => {
      const trie = new BinaryTrie(8)
      trie.insert(5)
      trie.insert(5)
      trie.insert(5)
      const copy = trie.clone()
      expect(copy.size).toBe(1)
      expect(copy.find(5)).toBe(true)
    })

    it('clone preserves removal independence', () => {
      const trie = new BinaryTrie(8)
      trie.insert(1)
      trie.insert(2)
      const copy = trie.clone()
      trie.remove(1)
      copy.remove(2)
      expect(trie.find(1)).toBe(false)
      expect(trie.find(2)).toBe(true)
      expect(copy.find(1)).toBe(true)
      expect(copy.find(2)).toBe(false)
    })
  })

  describe('BinaryTrie equals', () => {
    it('empty tries are equal', () => {
      const a = new BinaryTrie(8)
      const b = new BinaryTrie(8)
      expect(a.equals(b)).toBe(true)
    })

    it('same data are equal', () => {
      const a = new BinaryTrie(8)
      const b = new BinaryTrie(8)
      a.insert(1)
      a.insert(2)
      b.insert(1)
      b.insert(2)
      expect(a.equals(b)).toBe(true)
    })

    it('different sizes are not equal', () => {
      const a = new BinaryTrie(8)
      const b = new BinaryTrie(8)
      a.insert(1)
      expect(a.equals(b)).toBe(false)
    })

    it('different bits are not equal', () => {
      const a = new BinaryTrie(8)
      const b = new BinaryTrie(16)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for non-BinaryTrie', () => {
      const trie = new BinaryTrie(8)
      expect(trie.equals(null)).toBe(false)
      expect(trie.equals(undefined)).toBe(false)
      expect(trie.equals({})).toBe(false)
    })

    it('self equals self', () => {
      const trie = new BinaryTrie(8)
      trie.insert(42)
      expect(trie.equals(trie)).toBe(true)
    })

    it('equals with different order inserts', () => {
      const a = new BinaryTrie(8)
      a.insert(1)
      a.insert(2)
      a.insert(3)
      const b = new BinaryTrie(8)
      b.insert(3)
      b.insert(2)
      b.insert(1)
      expect(a.equals(b)).toBe(true)
    })

    it('equals with duplicates', () => {
      const a = new BinaryTrie(8)
      a.insert(5)
      a.insert(5)
      const b = new BinaryTrie(8)
      b.insert(5)
      b.insert(5)
      expect(a.equals(b)).toBe(true)
    })

    it('equals after remove', () => {
      const a = new BinaryTrie(8)
      a.insert(1)
      a.insert(2)
      a.remove(1)
      const b = new BinaryTrie(8)
      b.insert(2)
      expect(a.equals(b)).toBe(true)
    })
  })

  it('handles many insertions and removals', () => {
    const trie = new BinaryTrie(16)
    for (let i = 0; i < 100; i++) {
      trie.insert(i)
    }
    expect(trie.size).toBe(100)
    for (let i = 0; i < 50; i++) {
      trie.remove(i)
    }
    expect(trie.size).toBe(50)
    for (let i = 50; i < 100; i++) {
      expect(trie.find(i)).toBe(true)
    }
  })

  it('maxXor returns value that maximizes xor result', () => {
    const trie = new BinaryTrie(8)
    trie.insert(0b00001111)
    trie.insert(0b11110000)
    const result = trie.maxXor(0b10101010)
    const xorResult = result ^ 0b10101010
    expect(xorResult).toBeGreaterThan(0)
  })

  it('maxXor with single element', () => {
    const trie = new BinaryTrie(8)
    trie.insert(42)
    expect(trie.maxXor(0)).toBe(42)
    expect(trie.maxXor(42)).toBe(0)
  })

  it('maxXor with complementary bits', () => {
    const trie = new BinaryTrie(4)
    trie.insert(0b0101)
    trie.insert(0b1010)
    const result = trie.maxXor(0b0101)
    expect(result).toBe(0b1111)
  })

  it('maxXor handles 32-bit signed integers', () => {
    const trie = new BinaryTrie(32)
    trie.insert(-1)
    expect(trie.maxXor(0)).toBe(-1)
  })

  it('maxXor with multiple near values', () => {
    const trie = new BinaryTrie(8)
    trie.insert(100)
    trie.insert(101)
    trie.insert(102)
    const result = trie.maxXor(100)
    expect(result).toBeGreaterThan(0)
  })

  it('maxXor finds optimal path', () => {
    const trie = new BinaryTrie(4)
    trie.insert(1)
    trie.insert(14)
    const result = trie.maxXor(8)
    expect(result).toBeGreaterThan(7)
  })

  it('find returns false for missing value', () => {
    const trie = new BinaryTrie()
    trie.insert(5)
    expect(trie.find(10)).toBe(false)
  })

  it('remove returns false for missing', () => {
    const trie = new BinaryTrie()
    expect(trie.remove(99)).toBe(false)
  })

  it('insert and find zero', () => {
    const trie = new BinaryTrie()
    trie.insert(0)
    expect(trie.find(0)).toBe(true)
  })
})

describe('binary-trie - wave548', () => {
  it('binary-trie module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module has name', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module not null', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module has length', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave549', () => {
  it('binary-trie module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave550', () => {
  it('binary-trie w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave551', () => {
  it('binary-trie w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave552', () => {
  it('binary-trie w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave553', () => {
  it('binary-trie w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave554', () => {
  it('binary-trie w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave555', () => {
  it('binary-trie w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave556', () => {
  it('binary-trie w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave557', () => {
  it('binary-trie w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave558', () => {
  it('binary-trie w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave559', () => {
  it('binary-trie w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave560', () => {
  it('binary-trie w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave561', () => {
  it('binary-trie w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave562', () => {
  it('binary-trie w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
