import { BitwiseTrie, DEFAULT_BITWISE_TRIE_OPTIONS } from '../src/core/bitwise-trie/bitwise-trie.js'
import type { BitwiseTrieOptions } from '../src/core/bitwise-trie/bitwise-trie.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BitwiseTrie', () => {
  describe('constructor', () => {
    it('creates a trie with default bitDepth of 32', () => {
      const trie = new BitwiseTrie<string>()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates a trie with custom bitDepth', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates a trie with bitDepth of 1', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 1 })
      trie.insert(0, 'zero')
      trie.insert(1, 'one')
      expect(trie.size()).toBe(2)
      expect(trie.search(0)).toBe('zero')
      expect(trie.search(1)).toBe('one')
    })

    it('uses DEFAULT_BITWISE_TRIE_OPTIONS when no arguments given', () => {
      expect(DEFAULT_BITWISE_TRIE_OPTIONS.bitDepth).toBe(32)
      const trie = new BitwiseTrie<number>()
      // Verify it works with 32-bit keys
      trie.insert(0, 0)
      trie.insert(0xffffffff, -1)
      expect(trie.has(0)).toBe(true)
      expect(trie.has(0xffffffff)).toBe(true)
    })

    it('accepts empty options object', () => {
      const trie = new BitwiseTrie<number>({})
      expect(trie.size()).toBe(0)
    })

    it('handles bitDepth of 8', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insert(255, 'max')
      trie.insert(0, 'min')
      expect(trie.search(255)).toBe('max')
      expect(trie.search(0)).toBe('min')
    })
  })

  // ─── insert / search ─────────────────────────────────────────────────

  describe('insert and search', () => {
    it('inserts a key and retrieves its value', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      expect(trie.search(5)).toBe('five')
    })

    it('returns undefined for a non-existent key', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      expect(trie.search(3)).toBeUndefined()
    })

    it('returns undefined for search on empty trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.search(0)).toBeUndefined()
      expect(trie.search(5)).toBeUndefined()
    })

    it('overwrites value on duplicate insert without increasing size', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'first')
      expect(trie.size()).toBe(1)
      trie.insert(5, 'second')
      expect(trie.size()).toBe(1)
      expect(trie.search(5)).toBe('second')
    })

    it('handles key 0', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')
      expect(trie.search(0)).toBe('zero')
      expect(trie.has(0)).toBe(true)
    })

    it('handles max key for bitDepth', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(15, 'max')
      expect(trie.search(15)).toBe('max')
    })

    it('inserts multiple keys with different values', () => {
      const trie = new BitwiseTrie<number>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i, i * 10)
      }
      expect(trie.size()).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(trie.search(i)).toBe(i * 10)
      }
    })

    it('handles numeric value types', () => {
      const trie = new BitwiseTrie<number>({ bitDepth: 4 })
      trie.insert(1, 100)
      trie.insert(2, 200)
      expect(trie.search(1)).toBe(100)
      expect(trie.search(2)).toBe(200)
    })

    it('handles object value types', () => {
      const trie = new BitwiseTrie<{ name: string }>({ bitDepth: 4 })
      trie.insert(1, { name: 'alice' })
      expect(trie.search(1)).toEqual({ name: 'alice' })
    })

    it('handles null and undefined-like values', () => {
      const trie = new BitwiseTrie<string | null>({ bitDepth: 4 })
      trie.insert(0, null)
      expect(trie.search(0)).toBeNull()
    })

    it('works with 32-bit keys at default bitDepth', () => {
      const trie = new BitwiseTrie<string>()
      trie.insert(0, 'zero')
      trie.insert(1, 'one')
      trie.insert(4294967295, 'max32')
      expect(trie.search(0)).toBe('zero')
      expect(trie.search(1)).toBe('one')
      expect(trie.search(4294967295)).toBe('max32')
    })

    it('correctly distinguishes keys differing only in high bits', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      // 0b0001 = 1, 0b1001 = 9
      trie.insert(1, 'one')
      trie.insert(9, 'nine')
      expect(trie.search(1)).toBe('one')
      expect(trie.search(9)).toBe('nine')
    })

    it('correctly distinguishes keys differing only in low bits', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      // 0b1000 = 8, 0b1001 = 9
      trie.insert(8, 'eight')
      trie.insert(9, 'nine')
      expect(trie.search(8)).toBe('eight')
      expect(trie.search(9)).toBe('nine')
    })
  })

  // ─── has ─────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an inserted key', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      expect(trie.has(5)).toBe(true)
    })

    it('returns false for a non-existent key', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      expect(trie.has(3)).toBe(false)
    })

    it('returns false for key on empty trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.has(0)).toBe(false)
      expect(trie.has(5)).toBe(false)
    })

    it('returns false after a key is deleted', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      trie.delete(5)
      expect(trie.has(5)).toBe(false)
    })

    it('returns true for key 0 after insertion', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')
      expect(trie.has(0)).toBe(true)
    })

    it('returns true for max key after insertion', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(15, 'max')
      expect(trie.has(15)).toBe(true)
    })
  })

  // ─── delete ──────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes an existing key and returns true', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      expect(trie.delete(5)).toBe(true)
      expect(trie.search(5)).toBeUndefined()
    })

    it('returns false for a non-existent key', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.delete(5)).toBe(false)
    })

    it('returns false for delete on empty trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.delete(0)).toBe(false)
    })

    it('decrements size after successful deletion', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      expect(trie.size()).toBe(2)
      trie.delete(1)
      expect(trie.size()).toBe(1)
    })

    it('does not decrement size on failed deletion', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.delete(99)
      expect(trie.size()).toBe(1)
    })

    it('deletes key 0', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')
      expect(trie.delete(0)).toBe(true)
      expect(trie.has(0)).toBe(false)
    })

    it('deletes max key for bitDepth', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(15, 'max')
      expect(trie.delete(15)).toBe(true)
      expect(trie.has(15)).toBe(false)
    })

    it('can delete all keys leaving an empty trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      trie.delete(1)
      trie.delete(2)
      trie.delete(3)
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('cleans up internal nodes after deletion', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      const nodesBefore = trie.countNodes()
      trie.delete(5)
      const nodesAfter = trie.countNodes()
      expect(nodesAfter).toBeLessThan(nodesBefore)
      expect(nodesAfter).toBe(1) // only root remains
    })

    it('does not remove shared internal nodes when deleting', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      // 5 = 0b0101, 7 = 0b0111 — share the first two bits (01)
      trie.insert(5, 'five')
      trie.insert(7, 'seven')
      trie.delete(5)
      expect(trie.has(7)).toBe(true)
      expect(trie.search(7)).toBe('seven')
    })

    it('allows re-insertion after deletion', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'first')
      trie.delete(5)
      trie.insert(5, 'second')
      expect(trie.search(5)).toBe('second')
      expect(trie.size()).toBe(1)
    })

    it('double delete returns false on second call', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      expect(trie.delete(5)).toBe(true)
      expect(trie.delete(5)).toBe(false)
    })
  })

  // ─── size / isEmpty ──────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('returns 0 for new trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.size()).toBe(0)
    })

    it('isEmpty returns true for new trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insertion', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'one')
      expect(trie.isEmpty()).toBe(false)
    })

    it('size increments for each unique key', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      expect(trie.size()).toBe(3)
    })

    it('size does not increment on duplicate insert', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(1, 'b')
      expect(trie.size()).toBe(1)
    })

    it('isEmpty returns true after deleting all entries', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.delete(1)
      expect(trie.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      trie.clear()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('clears an already empty trie without error', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.clear()
      expect(trie.size()).toBe(0)
    })

    it('allows insertions after clear', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'before')
      trie.clear()
      trie.insert(1, 'after')
      expect(trie.search(1)).toBe('after')
      expect(trie.size()).toBe(1)
    })

    it('search returns undefined after clear', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      trie.clear()
      expect(trie.search(5)).toBeUndefined()
      expect(trie.has(5)).toBe(false)
    })
  })

  // ─── countNodes ──────────────────────────────────────────────────────

  describe('countNodes', () => {
    it('returns 1 for empty trie (root only)', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.countNodes()).toBe(1)
    })

    it('increases after insertions', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero') // 0b0000 — creates 4 nodes
      expect(trie.countNodes()).toBe(1 + 4)
    })

    it('shares nodes for keys with common prefixes', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')  // 0b0000
      const nodesAfterFirst = trie.countNodes()
      trie.insert(1, 'one')   // 0b0001 — shares first 3 bits
      const nodesAfterSecond = trie.countNodes()
      // Should add only 1 new node (the last bit diverges)
      expect(nodesAfterSecond).toBe(nodesAfterFirst + 1)
    })

    it('resets to 1 after clear', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.clear()
      expect(trie.countNodes()).toBe(1)
    })
  })

  // ─── insertPrefix / enumeratePrefix / longestPrefixMatch ─────────────

  describe('insertPrefix and enumeratePrefix', () => {
    it('inserts a prefix and enumerates entries under it', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insertPrefix(0b0000, 2, 'prefix-00')
      // Keys under 0b00xx are: 0b0000=0, 0b0001=1, 0b0010=2, 0b0011=3
      // But we only inserted a prefix, not the full keys
      // enumeratePrefix should find the prefix node itself
      const results = trie.enumeratePrefix(0b0000, 2)
      expect(results.length).toBe(1)
      expect(results[0]).toEqual({ key: 0, value: 'prefix-00' })
    })

    it('enumerates full keys inserted under a prefix', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')  // 0b0000
      trie.insert(1, 'b')  // 0b0001
      trie.insert(2, 'c')  // 0b0010
      trie.insert(3, 'd')  // 0b0011
      trie.insert(4, 'e')  // 0b0100 — outside prefix

      const results = trie.enumeratePrefix(0b0000, 2)
      // All keys starting with 0b00xx
      expect(results.length).toBe(4)
      const keys = results.map((r) => r.key).sort((a, b) => a - b)
      expect(keys).toEqual([0, 1, 2, 3])
    })

    it('returns empty array for non-matching prefix', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      const results = trie.enumeratePrefix(0b1000, 1)
      expect(results).toEqual([])
    })

    it('returns empty array on empty trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      const results = trie.enumeratePrefix(0, 1)
      expect(results).toEqual([])
    })

    it('enumerates with single-bit prefix', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')  // 0b0000
      trie.insert(8, 'eight') // 0b1000
      // 0b0000 prefix 1: matches all keys with top bit 0
      const results0 = trie.enumeratePrefix(0b0000, 1)
      expect(results0.length).toBe(1)
      expect(results0[0].key).toBe(0)

      // 0b1000 prefix 1: matches all keys with top bit 1
      const results1 = trie.enumeratePrefix(0b1000, 1)
      expect(results1.length).toBe(1)
      expect(results1[0].key).toBe(8)
    })

    it('enumerates with full-depth prefix', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      const results = trie.enumeratePrefix(5, 4)
      expect(results.length).toBe(1)
      expect(results[0]).toEqual({ key: 5, value: 'five' })
    })

    it('counts prefix insertion in size', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insertPrefix(0, 2, 'prefix')
      expect(trie.size()).toBe(1)
    })

    it('does not double-count prefix insertion for same node', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insertPrefix(0, 2, 'first')
      trie.insertPrefix(0, 2, 'second')
      expect(trie.size()).toBe(1)
      const results = trie.enumeratePrefix(0, 2)
      expect(results[0].value).toBe('second')
    })
  })

  describe('longestPrefixMatch', () => {
    it('finds exact match as longest prefix', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      const result = trie.longestPrefixMatch(5, 4)
      expect(result).toBe('five')
    })

    it('returns undefined when no match exists', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'five')
      const result = trie.longestPrefixMatch(3, 4)
      expect(result).toBeUndefined()
    })

    it('returns undefined on empty trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      const result = trie.longestPrefixMatch(5, 4)
      expect(result).toBeUndefined()
    })

    it('finds the longest matching prefix among multiple prefixes', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      // Insert prefixes at different lengths
      trie.insertPrefix(0b0000, 1, '1-bit-prefix')  // matches 0b0xxx
      trie.insertPrefix(0b0000, 2, '2-bit-prefix')  // matches 0b00xx
      trie.insert(0b0101, 'exact')                    // 5
      // Search for 0b0101 = 5 with prefixLength 4
      // Path: root -> 0 (1-bit prefix matches) -> 1 -> 0 -> 1 (exact match)
      const result = trie.longestPrefixMatch(0b0101, 4)
      expect(result).toBe('exact')
    })

    it('matches prefix when no exact key exists', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insertPrefix(0b1100, 2, 'prefix-11')  // matches 0b11xx
      // Look for key 12 = 0b1100 with prefix length 4
      const result = trie.longestPrefixMatch(0b1100, 4)
      expect(result).toBe('prefix-11')
    })
  })

  // ─── Edge cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single entry operations cycle', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(7, 'seven')
      expect(trie.has(7)).toBe(true)
      expect(trie.search(7)).toBe('seven')
      expect(trie.size()).toBe(1)
      expect(trie.isEmpty()).toBe(false)
      trie.delete(7)
      expect(trie.has(7)).toBe(false)
      expect(trie.search(7)).toBeUndefined()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('handles inserting adjacent keys (path sharing)', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      // 0b0111 = 7, 0b0110 = 6 — share first 3 bits
      trie.insert(6, 'six')
      trie.insert(7, 'seven')
      expect(trie.search(6)).toBe('six')
      expect(trie.search(7)).toBe('seven')
      expect(trie.size()).toBe(2)
    })

    it('handles inserting keys that are powers of 2', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'p0')   // 0b0001
      trie.insert(2, 'p1')   // 0b0010
      trie.insert(4, 'p2')   // 0b0100
      trie.insert(8, 'p3')   // 0b1000
      expect(trie.size()).toBe(4)
      expect(trie.search(1)).toBe('p0')
      expect(trie.search(2)).toBe('p1')
      expect(trie.search(4)).toBe('p2')
      expect(trie.search(8)).toBe('p3')
    })

    it('handles sequential insert and delete', () => {
      const trie = new BitwiseTrie<number>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i, i)
      }
      expect(trie.size()).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(trie.delete(i)).toBe(true)
      }
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('handles interleaved insert and delete', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.delete(1)
      trie.insert(3, 'c')
      trie.insert(1, 'a2')
      expect(trie.size()).toBe(3)
      expect(trie.search(1)).toBe('a2')
      expect(trie.search(2)).toBe('b')
      expect(trie.search(3)).toBe('c')
    })

    it('handles large number of entries', () => {
      const trie = new BitwiseTrie<number>({ bitDepth: 16 })
      const count = 1000
      for (let i = 0; i < count; i++) {
        trie.insert(i, i * 2)
      }
      expect(trie.size()).toBe(count)
      for (let i = 0; i < count; i++) {
        expect(trie.search(i)).toBe(i * 2)
      }
    })

    it('handles bitDepth of 2 with all possible keys', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 2 })
      trie.insert(0, '00')
      trie.insert(1, '01')
      trie.insert(2, '10')
      trie.insert(3, '11')
      expect(trie.size()).toBe(4)
      expect(trie.search(0)).toBe('00')
      expect(trie.search(1)).toBe('01')
      expect(trie.search(2)).toBe('10')
      expect(trie.search(3)).toBe('11')
    })

    it('search returns undefined for keys not yet in a partially filled trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')
      trie.insert(15, 'max')
      // Keys 1-14 are not inserted
      for (let i = 1; i < 15; i++) {
        expect(trie.search(i)).toBeUndefined()
      }
    })

    it('handles boolean values', () => {
      const trie = new BitwiseTrie<boolean>({ bitDepth: 4 })
      trie.insert(1, true)
      trie.insert(2, false)
      expect(trie.search(1)).toBe(true)
      expect(trie.search(2)).toBe(false)
    })

    it('handles array values', () => {
      const trie = new BitwiseTrie<number[]>({ bitDepth: 4 })
      trie.insert(1, [1, 2, 3])
      trie.insert(2, [4, 5, 6])
      expect(trie.search(1)).toEqual([1, 2, 3])
      expect(trie.search(2)).toEqual([4, 5, 6])
    })

    it('handles overwrite with different value types', () => {
      const trie = new BitwiseTrie<number>({ bitDepth: 4 })
      trie.insert(5, 100)
      expect(trie.search(5)).toBe(100)
      trie.insert(5, 999)
      expect(trie.search(5)).toBe(999)
    })
  })
})
