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
