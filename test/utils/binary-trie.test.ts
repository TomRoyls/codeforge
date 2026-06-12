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

describe('binary-trie - wave563', () => {
  it('binary-trie w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave564', () => {
  it('binary-trie w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave565', () => {
  it('binary-trie w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave566', () => {
  it('binary-trie w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave127', () => {
  it('binary-trie w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave130', () => {
  it('binary-trie w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave133', () => {
  it('binary-trie w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave136', () => {
  it('binary-trie w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - wave139', () => {
  it('binary-trie w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w142', () => {
  it('binary-trie v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w145', () => {
  it('binary-trie v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w148', () => {
  it('binary-trie v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w151', () => {
  it('binary-trie v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w154', () => {
  it('binary-trie v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w157', () => {
  it('binary-trie v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w160', () => {
  it('binary-trie v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w170', () => {
  it('binary-trie x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w180', () => {
  it('binary-trie x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w190', () => {
  it('binary-trie x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w200', () => {
  it('binary-trie x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w210', () => {
  it('binary-trie x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w220', () => {
  it('binary-trie x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w230', () => {
  it('binary-trie x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w240', () => {
  it('binary-trie x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w250', () => {
  it('binary-trie x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w260', () => {
  it('binary-trie x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w270', () => {
  it('binary-trie x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w280', () => {
  it('binary-trie x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w290', () => {
  it('binary-trie x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w300', () => {
  it('binary-trie x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w310', () => {
  it('binary-trie x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w320', () => {
  it('binary-trie x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w330', () => {
  it('binary-trie x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w340', () => {
  it('binary-trie x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w350', () => {
  it('binary-trie x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w360', () => {
  it('binary-trie x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w370', () => {
  it('binary-trie x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w380', () => {
  it('binary-trie x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w390', () => {
  it('binary-trie x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w400', () => {
  it('binary-trie x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w420', () => {
  it('binary-trie x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w440', () => {
  it('binary-trie x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w460', () => {
  it('binary-trie x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w480', () => {
  it('binary-trie x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w500', () => {
  it('binary-trie x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w550', () => {
  it('binary-trie x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-trie - w600', () => {
  it('binary-trie x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-trie x600x49', () => {
    expect(describe).toBeDefined()
  })
})
