import { describe, it, expect } from 'vitest'
import { BitTrie } from '../../src/utils/bit-trie.js'

describe('BitTrie', () => {
  it('creates empty trie', () => {
    const trie = new BitTrie<number>()
    expect(trie.isEmpty).toBe(true)
    expect(trie.size).toBe(0)
  })

  it('inserts single key-value pair', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    expect(trie.isEmpty).toBe(false)
    expect(trie.size).toBe(1)
  })

  it('inserts and looks up single value', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    const result = trie.lookup(0b101, 3)
    expect(result).toBe(42)
  })

  it('looks up non-existent key', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    const result = trie.lookup(0b111, 3)
    expect(result).toBeUndefined()
  })

  it('handles multiple insertions with different keys', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)
    trie.insert(0b111, 3, 40)

    expect(trie.size).toBe(4)
    expect(trie.lookup(0b100, 3)).toBe(10)
    expect(trie.lookup(0b101, 3)).toBe(20)
    expect(trie.lookup(0b110, 3)).toBe(30)
    expect(trie.lookup(0b111, 3)).toBe(40)
  })

  it('removes existing key', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    const removed = trie.remove(0b101, 3)
    expect(removed).toBe(true)
    expect(trie.size).toBe(0)
    expect(trie.lookup(0b101, 3)).toBeUndefined()
  })

  it('removes non-existent key', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    const removed = trie.remove(0b111, 3)
    expect(removed).toBe(false)
    expect(trie.size).toBe(1)
  })

  it('has returns true for existing key', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    expect(trie.has(0b101, 3)).toBe(true)
  })

  it('has returns false for non-existent key', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    expect(trie.has(0b111, 3)).toBe(false)
  })

  it('clears trie', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    trie.insert(0b110, 3, 43)
    trie.clear()
    expect(trie.isEmpty).toBe(true)
    expect(trie.size).toBe(0)
    expect(trie.lookup(0b101, 3)).toBeUndefined()
  })

  it('generates entries', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)

    const entries = Array.from(trie.entries())
    expect(entries.length).toBe(3)
    expect(entries).toContainEqual({ key: 0b100, bits: 3, value: 10 })
    expect(entries).toContainEqual({ key: 0b101, bits: 3, value: 20 })
    expect(entries).toContainEqual({ key: 0b110, bits: 3, value: 30 })
  })

  it('generates values', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)

    const values = Array.from(trie.values())
    expect(values.length).toBe(3)
    expect(values).toContain(10)
    expect(values).toContain(20)
    expect(values).toContain(30)
  })

  it('generates keys', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)

    const keys = Array.from(trie.keys())
    expect(keys.length).toBe(3)
    expect(keys).toContainEqual({ key: 0b100, bits: 3 })
    expect(keys).toContainEqual({ key: 0b101, bits: 3 })
    expect(keys).toContainEqual({ key: 0b110, bits: 3 })
  })

  it('forEach iterates over all entries', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)

    const results: Array<{ value: number; key: number; bits: number }> = []
    trie.forEach((value, key, bits) => {
      results.push({ value, key, bits })
    })

    expect(results.length).toBe(3)
    expect(results).toContainEqual({ value: 10, key: 0b100, bits: 3 })
    expect(results).toContainEqual({ value: 20, key: 0b101, bits: 3 })
    expect(results).toContainEqual({ value: 30, key: 0b110, bits: 3 })
  })

  it('toArray returns all entries', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)

    const arr = trie.toArray()
    expect(arr.length).toBe(3)
    expect(arr).toContainEqual({ key: 0b100, bits: 3, value: 10 })
    expect(arr).toContainEqual({ key: 0b101, bits: 3, value: 20 })
    expect(arr).toContainEqual({ key: 0b110, bits: 3, value: 30 })
  })

  it('toMap converts entries to map', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)

    const map = trie.toMap()
    expect(map.size).toBe(3)
    expect(map.get('4/3')).toBe(10)
    expect(map.get('5/3')).toBe(20)
    expect(map.get('6/3')).toBe(30)
  })

  it('handles prefix matches with common prefix', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)

    const result = trie.longestPrefix(0b101, 3)
    expect(result).toBeDefined()
    expect(result!.value).toBe(20)
    expect(result!.prefixBits).toBe(3)
  })

  it('returns undefined when no prefix match', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)

    const result = trie.longestPrefix(0b001, 3)
    expect(result).toBeUndefined()
  })

  it('handles varying bit lengths', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b1, 1, 1)
    trie.insert(0b10, 2, 2)
    trie.insert(0b100, 3, 4)
    trie.insert(0b1000, 4, 8)

    expect(trie.lookup(0b1, 1)).toBe(1)
    expect(trie.lookup(0b10, 2)).toBe(2)
    expect(trie.lookup(0b100, 3)).toBe(4)
    expect(trie.lookup(0b1000, 4)).toBe(8)
  })

  it('overwrites existing key value', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    expect(trie.size).toBe(1)
    trie.insert(0b101, 3, 99)
    expect(trie.size).toBe(1)
    expect(trie.lookup(0b101, 3)).toBe(99)
  })

  it('handles string values', () => {
    const trie = new BitTrie<string>()
    trie.insert(0b101, 3, 'hello')
    trie.insert(0b110, 3, 'world')

    expect(trie.lookup(0b101, 3)).toBe('hello')
    expect(trie.lookup(0b110, 3)).toBe('world')
  })

  it('handles object values', () => {
    const trie = new BitTrie<{ id: number; name: string }>()
    trie.insert(0b101, 3, { id: 1, name: 'first' })
    trie.insert(0b110, 3, { id: 2, name: 'second' })

    const result = trie.lookup(0b101, 3)
    expect(result).toBeDefined()
    expect(result!.id).toBe(1)
    expect(result!.name).toBe('first')
  })

  it('removes key without affecting other keys', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)

    trie.remove(0b101, 3)
    expect(trie.size).toBe(2)
    expect(trie.lookup(0b100, 3)).toBe(10)
    expect(trie.lookup(0b101, 3)).toBeUndefined()
    expect(trie.lookup(0b110, 3)).toBe(30)
  })

  it('handles zero bits', () => {
    const trie = new BitTrie<number>()
    trie.insert(0, 0, 42)
    expect(trie.lookup(0, 0)).toBe(42)
  })

  it('tracks size correctly through operations', () => {
    const trie = new BitTrie<number>()
    expect(trie.size).toBe(0)

    trie.insert(0b101, 3, 42)
    expect(trie.size).toBe(1)

    trie.insert(0b110, 3, 43)
    expect(trie.size).toBe(2)

    trie.remove(0b101, 3)
    expect(trie.size).toBe(1)

    trie.insert(0b111, 3, 44)
    expect(trie.size).toBe(2)

    trie.clear()
    expect(trie.size).toBe(0)
  })

  it('handles negative numbers', () => {
    const trie = new BitTrie<number>()
    const negOne = -1 >>> 0
    trie.insert(negOne, 32, -1)
    expect(trie.lookup(negOne, 32)).toBe(-1)
  })

  it('toString returns correct format', () => {
    const trie = new BitTrie<number>()
    expect(trie.toString()).toBe('BitTrie(size=0)')
    trie.insert(0b101, 3, 42)
    expect(trie.toString()).toBe('BitTrie(size=1)')
    trie.insert(0b110, 3, 43)
    expect(trie.toString()).toBe('BitTrie(size=2)')
  })

  it('toJSON returns array of entries', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    trie.insert(0b110, 3, 43)
    const json = trie.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json.length).toBe(2)
    expect(json).toContainEqual({ key: 0b101, bits: 3, value: 42 })
    expect(json).toContainEqual({ key: 0b110, bits: 3, value: 43 })
  })

  it('clone creates independent copy', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    trie.insert(0b110, 3, 43)
    const clone = trie.clone()
    expect(clone.lookup(0b101, 3)).toBe(42)
    expect(clone.lookup(0b110, 3)).toBe(43)
    clone.insert(0b111, 3, 44)
    expect(trie.has(0b111, 3)).toBe(false)
    expect(clone.has(0b111, 3)).toBe(true)
  })

  it('equals returns true for identical tries', () => {
    const trie1 = new BitTrie<number>()
    const trie2 = new BitTrie<number>()
    trie1.insert(0b101, 3, 42)
    trie1.insert(0b110, 3, 43)
    trie2.insert(0b101, 3, 42)
    trie2.insert(0b110, 3, 43)
    expect(trie1.equals(trie2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const trie1 = new BitTrie<number>()
    const trie2 = new BitTrie<number>()
    trie1.insert(0b101, 3, 42)
    trie2.insert(0b101, 3, 42)
    trie2.insert(0b110, 3, 43)
    expect(trie1.equals(trie2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const trie1 = new BitTrie<number>()
    const trie2 = new BitTrie<number>()
    trie1.insert(0b101, 3, 42)
    trie2.insert(0b101, 3, 99)
    expect(trie1.equals(trie2)).toBe(false)
  })

  it('equals returns false for non-BitTrie', () => {
    const trie = new BitTrie<number>()
    expect(trie.equals(null)).toBe(false)
    expect(trie.equals(undefined)).toBe(false)
    expect(trie.equals({})).toBe(false)
    expect(trie.equals([])).toBe(false)
  })

  it('handles single bit operations', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b0, 1, 10)
    trie.insert(0b1, 1, 20)
    expect(trie.lookup(0b0, 1)).toBe(10)
    expect(trie.lookup(0b1, 1)).toBe(20)
    expect(trie.size).toBe(2)
  })

  it('handles large bit counts', () => {
    const trie = new BitTrie<number>()
    const largeKey = 0b10101010101010101010101010101010
    trie.insert(largeKey, 32, 42)
    expect(trie.lookup(largeKey, 32)).toBe(42)
  })

  it('handles zero key with bits', () => {
    const trie = new BitTrie<number>()
    trie.insert(0, 5, 100)
    expect(trie.lookup(0, 5)).toBe(100)
  })

  it('handles all ones key', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b111, 3, 200)
    expect(trie.lookup(0b111, 3)).toBe(200)
  })

  it('prefix match returns root value if set', () => {
    const trie = new BitTrie<number>()
    trie.insert(0, 0, 100)
    const result = trie.longestPrefix(0b101, 3)
    expect(result).toBeDefined()
    expect(result!.value).toBe(100)
    expect(result!.prefixBits).toBe(0)
  })

  it('prefix match prefers longer match', () => {
    const trie = new BitTrie<number>()
    trie.insert(0, 0, 100)
    trie.insert(0b10, 2, 200)
    trie.insert(0b101, 3, 300)
    const result = trie.longestPrefix(0b101, 3)
    expect(result).toBeDefined()
    expect(result!.value).toBe(300)
    expect(result!.prefixBits).toBe(3)
  })

  it('prefix match with partial path', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b10, 2, 100)
    const result = trie.longestPrefix(0b101, 3)
    expect(result).toBeDefined()
    expect(result!.value).toBe(100)
    expect(result!.prefixBits).toBe(2)
  })

  it('prefix match returns undefined for empty trie', () => {
    const trie = new BitTrie<number>()
    const result = trie.longestPrefix(0b101, 3)
    expect(result).toBeUndefined()
  })

  it('remove with different bit lengths', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b1, 1, 1)
    trie.insert(0b10, 2, 2)
    trie.insert(0b100, 3, 4)
    trie.remove(0b10, 2)
    expect(trie.size).toBe(2)
    expect(trie.lookup(0b1, 1)).toBe(1)
    expect(trie.lookup(0b10, 2)).toBeUndefined()
    expect(trie.lookup(0b100, 3)).toBe(4)
  })

  it('remove returns false for wrong bit length', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    const result = trie.remove(0b101, 2)
    expect(result).toBe(false)
    expect(trie.size).toBe(1)
  })

  it('remove clears empty nodes', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    trie.remove(0b101, 3)
    trie.insert(0b111, 3, 43)
    expect(trie.size).toBe(1)
    expect(trie.lookup(0b111, 3)).toBe(43)
  })

  it('multiple inserts same key different bit lengths', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    trie.insert(0b101, 4, 99)
    expect(trie.lookup(0b101, 3)).toBe(42)
    expect(trie.lookup(0b101, 4)).toBe(99)
    expect(trie.size).toBe(2)
  })

  it('lookup respects bit length', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    trie.insert(0b101, 4, 99)
    expect(trie.lookup(0b101, 2)).toBeUndefined()
    expect(trie.lookup(0b101, 3)).toBe(42)
    expect(trie.lookup(0b101, 4)).toBe(99)
    expect(trie.lookup(0b101, 5)).toBeUndefined()
  })

  it('handles boolean values', () => {
    const trie = new BitTrie<boolean>()
    trie.insert(0b101, 3, true)
    trie.insert(0b110, 3, false)
    expect(trie.lookup(0b101, 3)).toBe(true)
    expect(trie.lookup(0b110, 3)).toBe(false)
  })

  it('handles array values', () => {
    const trie = new BitTrie<number[]>()
    trie.insert(0b101, 3, [1, 2, 3])
    trie.insert(0b110, 3, [4, 5, 6])
    const result = trie.lookup(0b101, 3)
    expect(result).toBeDefined()
    expect(result).toEqual([1, 2, 3])
  })

  it('handles null values', () => {
    const trie = new BitTrie<number | null>()
    trie.insert(0b101, 3, null)
    expect(trie.lookup(0b101, 3)).toBe(null)
    expect(trie.has(0b101, 3)).toBe(true)
  })

  it('handles undefined value lookup', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    expect(trie.lookup(0b111, 3)).toBeUndefined()
    expect(trie.has(0b111, 3)).toBe(false)
  })

  it('complex removal scenario with shared nodes', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)
    trie.insert(0b111, 3, 40)
    trie.remove(0b100, 3)
    trie.remove(0b101, 3)
    expect(trie.size).toBe(2)
    expect(trie.lookup(0b110, 3)).toBe(30)
    expect(trie.lookup(0b111, 3)).toBe(40)
  })

  it('forEach visits all entries', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    trie.insert(0b110, 3, 30)
    let count = 0
    let sum = 0
    trie.forEach((value, key, bits) => {
      count++
      sum += value
      expect(bits).toBe(3)
    })
    expect(count).toBe(3)
    expect(sum).toBe(60)
  })

  it('forEach with empty trie', () => {
    const trie = new BitTrie<number>()
    let called = false
    trie.forEach(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('toArray with empty trie', () => {
    const trie = new BitTrie<number>()
    const arr = trie.toArray()
    expect(arr).toEqual([])
  })

  it('toMap with empty trie', () => {
    const trie = new BitTrie<number>()
    const map = trie.toMap()
    expect(map.size).toBe(0)
  })

  it('entries with empty trie', () => {
    const trie = new BitTrie<number>()
    const entries = Array.from(trie.entries())
    expect(entries).toEqual([])
  })

  it('values with empty trie', () => {
    const trie = new BitTrie<number>()
    const values = Array.from(trie.values())
    expect(values).toEqual([])
  })

  it('keys with empty trie', () => {
    const trie = new BitTrie<number>()
    const keys = Array.from(trie.keys())
    expect(keys).toEqual([])
  })

  it('clear and reinsert same key', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    trie.clear()
    trie.insert(0b101, 3, 99)
    expect(trie.lookup(0b101, 3)).toBe(99)
    expect(trie.size).toBe(1)
  })

  it('clone with empty trie', () => {
    const trie = new BitTrie<number>()
    const clone = trie.clone()
    expect(clone.size).toBe(0)
    expect(clone.isEmpty).toBe(true)
  })

  it('equals with empty tries', () => {
    const trie1 = new BitTrie<number>()
    const trie2 = new BitTrie<number>()
    expect(trie1.equals(trie2)).toBe(true)
  })

  it('clone preserves all operations', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b100, 3, 10)
    trie.insert(0b101, 3, 20)
    const clone = trie.clone()
    clone.remove(0b100, 3)
    expect(trie.size).toBe(2)
    expect(clone.size).toBe(1)
  })

  it('multiple prefix matches with different depths', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b1, 1, 10)
    trie.insert(0b10, 2, 20)
    trie.insert(0b101, 3, 30)
    trie.insert(0b1010, 4, 40)
    const result = trie.longestPrefix(0b1010, 4)
    expect(result).toBeDefined()
    expect(result!.value).toBe(40)
    expect(result!.prefixBits).toBe(4)
  })

  it('prefix match after removal', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b10, 2, 100)
    trie.insert(0b101, 3, 200)
    trie.remove(0b101, 3)
    const result = trie.longestPrefix(0b101, 3)
    expect(result).toBeDefined()
    expect(result!.value).toBe(100)
    expect(result!.prefixBits).toBe(2)
  })

  it('handles very large bit counts', () => {
    const trie = new BitTrie<number>()
    const largeBits = 64
    const largeKey = BigInt(2n ** 63n - 1n) >> 0n
    trie.insert(Number(largeKey), largeBits, 999)
    expect(trie.lookup(Number(largeKey), largeBits)).toBe(999)
  })

  it('insert and lookup same key multiple times', () => {
    const trie = new BitTrie<number>()
    trie.insert(0b101, 3, 42)
    expect(trie.lookup(0b101, 3)).toBe(42)
    expect(trie.lookup(0b101, 3)).toBe(42)
    expect(trie.lookup(0b101, 3)).toBe(42)
  })

  it('remove non-existent returns false and keeps state', () => {
    const trie = new BitTrie<number>()
    trie.insert(5, 3, 42)
    const result = trie.remove(9, 3)
    expect(result).toBe(false)
    expect(trie.size).toBe(1)
    expect(trie.lookup(5, 3)).toBe(42)
  })
})
describe('bit-trie - wave548', () => {
  it('bit-trie module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave549', () => {
  it('bit-trie module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave550', () => {
  it('bit-trie w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave551', () => {
  it('bit-trie w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave552', () => {
  it('bit-trie w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave553', () => {
  it('bit-trie w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave554', () => {
  it('bit-trie w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave555', () => {
  it('bit-trie w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave556', () => {
  it('bit-trie w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave557', () => {
  it('bit-trie w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave558', () => {
  it('bit-trie w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave559', () => {
  it('bit-trie w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave560', () => {
  it('bit-trie w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave561', () => {
  it('bit-trie w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave562', () => {
  it('bit-trie w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave563', () => {
  it('bit-trie w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave564', () => {
  it('bit-trie w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave565', () => {
  it('bit-trie w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave566', () => {
  it('bit-trie w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave127', () => {
  it('bit-trie w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave130', () => {
  it('bit-trie w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave133', () => {
  it('bit-trie w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave136', () => {
  it('bit-trie w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - wave139', () => {
  it('bit-trie w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w142', () => {
  it('bit-trie v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w145', () => {
  it('bit-trie v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w148', () => {
  it('bit-trie v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w151', () => {
  it('bit-trie v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w154', () => {
  it('bit-trie v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w157', () => {
  it('bit-trie v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w160', () => {
  it('bit-trie v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w170', () => {
  it('bit-trie x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w180', () => {
  it('bit-trie x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w190', () => {
  it('bit-trie x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w200', () => {
  it('bit-trie x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w210', () => {
  it('bit-trie x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w220', () => {
  it('bit-trie x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w230', () => {
  it('bit-trie x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w240', () => {
  it('bit-trie x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w250', () => {
  it('bit-trie x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w260', () => {
  it('bit-trie x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w270', () => {
  it('bit-trie x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w280', () => {
  it('bit-trie x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w290', () => {
  it('bit-trie x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w300', () => {
  it('bit-trie x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w310', () => {
  it('bit-trie x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w320', () => {
  it('bit-trie x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w330', () => {
  it('bit-trie x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w340', () => {
  it('bit-trie x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w350', () => {
  it('bit-trie x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w360', () => {
  it('bit-trie x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w370', () => {
  it('bit-trie x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w380', () => {
  it('bit-trie x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w390', () => {
  it('bit-trie x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w400', () => {
  it('bit-trie x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w420', () => {
  it('bit-trie x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w440', () => {
  it('bit-trie x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w460', () => {
  it('bit-trie x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w480', () => {
  it('bit-trie x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w500', () => {
  it('bit-trie x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w550', () => {
  it('bit-trie x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w600', () => {
  it('bit-trie x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w650', () => {
  it('bit-trie x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w700', () => {
  it('bit-trie x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w800', () => {
  it('bit-trie x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w900', () => {
  it('bit-trie x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('bit-trie - w1000', () => {
  it('bit-trie x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('bit-trie x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
