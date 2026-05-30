import { describe, it, expect } from 'vitest'
import { BitTrie } from '../../../src/utils/bit-trie.js'

describe('BitTrie', () => {
  describe('insert and lookup', () => {
    it('inserts and looks up exact key', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b1010, 4, 'A')
      expect(trie.lookup(0b1010, 4)).toBe('A')
    })

    it('returns undefined for missing key', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b1010, 4, 'A')
      expect(trie.lookup(0b0101, 4)).toBeUndefined()
    })

    it('handles single bit keys', () => {
      const trie = new BitTrie<string>()
      trie.insert(0, 1, 'zero')
      trie.insert(1, 1, 'one')
      expect(trie.lookup(0, 1)).toBe('zero')
      expect(trie.lookup(1, 1)).toBe('one')
    })

    it('handles different bit lengths', () => {
      const trie = new BitTrie<number>()
      trie.insert(0b1100, 4, 12)
      trie.insert(0b11001100, 8, 204)
      expect(trie.lookup(0b1100, 4)).toBe(12)
      expect(trie.lookup(0b11001100, 8)).toBe(204)
    })

    it('overwrites existing value', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b1010, 4, 'old')
      trie.insert(0b1010, 4, 'new')
      expect(trie.lookup(0b1010, 4)).toBe('new')
      expect(trie.size).toBe(1)
    })
  })

  describe('longestPrefix', () => {
    it('finds exact match', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b11000000, 8, '/24')
      const result = trie.longestPrefix(0b11000000, 8)
      expect(result).toBeDefined()
      expect(result!.value).toBe('/24')
      expect(result!.prefixBits).toBe(8)
    })

    it('finds shorter prefix', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b11110000, 2, '/2')
      trie.insert(0b11110000, 4, '/4')
      trie.insert(0b11110000, 8, '/8')
      const result = trie.longestPrefix(0b11110000, 8)
      expect(result).toBeDefined()
      expect(result!.value).toBe('/8')
      expect(result!.prefixBits).toBe(8)
    })

    it('finds root prefix when no deeper match', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b11, 2, '/2')
      const result = trie.longestPrefix(0b1110, 4)
      expect(result).toBeDefined()
      expect(result!.value).toBe('/2')
      expect(result!.prefixBits).toBe(2)
    })

    it('returns undefined when no prefix matches', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b1000, 4, 'A')
      expect(trie.longestPrefix(0b0100, 4)).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('removes existing key', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b1010, 4, 'A')
      expect(trie.remove(0b1010, 4)).toBe(true)
      expect(trie.lookup(0b1010, 4)).toBeUndefined()
      expect(trie.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const trie = new BitTrie<string>()
      expect(trie.remove(0b1010, 4)).toBe(false)
    })

    it('prunes empty branches', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b00, 2, 'A')
      trie.insert(0b01, 2, 'B')
      trie.remove(0b00, 2)
      trie.remove(0b01, 2)
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('does not prune branch with siblings', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b100, 3, 'A')
      trie.insert(0b101, 3, 'B')
      trie.remove(0b100, 3)
      expect(trie.lookup(0b101, 3)).toBe('B')
    })
  })

  describe('has', () => {
    it('returns true for existing', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b1010, 4, 'A')
      expect(trie.has(0b1010, 4)).toBe(true)
    })

    it('returns false for missing', () => {
      const trie = new BitTrie<string>()
      expect(trie.has(0b1010, 4)).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b1010, 4, 'A')
      trie.insert(0b0101, 4, 'B')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
      expect(trie.lookup(0b1010, 4)).toBeUndefined()
    })
  })

  describe('iteration', () => {
    it('iterates entries', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b00, 2, 'A')
      trie.insert(0b01, 2, 'B')
      trie.insert(0b10, 2, 'C')
      const entries = trie.toArray()
      expect(entries).toHaveLength(3)
    })

    it('iterates values', () => {
      const trie = new BitTrie<number>()
      trie.insert(0b00, 2, 1)
      trie.insert(0b11, 2, 2)
      const vals = Array.from(trie.values())
      expect(vals).toHaveLength(2)
      expect(vals).toContain(1)
      expect(vals).toContain(2)
    })

    it('iterates keys', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b10, 2, 'A')
      const keys = Array.from(trie.keys())
      expect(keys).toHaveLength(1)
      expect(keys[0]!.key).toBe(0b10)
      expect(keys[0]!.bits).toBe(2)
    })

    it('forEach iterates all', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b00, 2, 'A')
      trie.insert(0b11, 2, 'B')
      const result: string[] = []
      trie.forEach((v) => result.push(v))
      expect(result).toHaveLength(2)
    })
  })

  describe('toMap', () => {
    it('converts to map', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b1010, 4, 'A')
      const map = trie.toMap()
      expect(map.size).toBe(1)
      expect(map.get('10/4')).toBe('A')
    })
  })

  describe('IP routing simulation', () => {
    it('finds longest prefix match for IP routes', () => {
      const trie = new BitTrie<string>()
      trie.insert(0b11, 2, 'default')
      trie.insert(0b11001, 5, 'subnet-a')
      trie.insert(0b11001100, 8, 'host-b')
      const result = trie.longestPrefix(0b11001100, 8)
      expect(result).toBeDefined()
      expect(result!.value).toBe('host-b')
    })
  })

  describe('size tracking', () => {
    it('tracks size correctly', () => {
      const trie = new BitTrie<string>()
      expect(trie.size).toBe(0)
      trie.insert(0b01, 2, 'A')
      expect(trie.size).toBe(1)
      trie.insert(0b10, 2, 'B')
      expect(trie.size).toBe(2)
      trie.remove(0b01, 2)
      expect(trie.size).toBe(1)
    })
  })

  describe('large trie', () => {
    it('handles many entries', () => {
      const trie = new BitTrie<number>()
      for (let i = 0; i < 256; i++) {
        trie.insert(i, 8, i)
      }
      expect(trie.size).toBe(256)
      for (let i = 0; i < 256; i++) {
        expect(trie.lookup(i, 8)).toBe(i)
      }
    })
  })
})
