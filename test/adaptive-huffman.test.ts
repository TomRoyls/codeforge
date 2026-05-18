import { AdaptiveHuffman } from '../src/core/adaptive-huffman/adaptive-huffman.js'
import type { AdaptiveHuffmanNode, AdaptiveHuffmanStats } from '../src/core/adaptive-huffman/adaptive-huffman.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('AdaptiveHuffman', () => {
  describe('constructor', () => {
    it('creates an instance with a single root node', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.getNodeCount()).toBe(1)
    })

    it('starts with zero unique symbols', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.stats().uniqueSymbols).toBe(0)
    })

    it('starts with rootWeight of 0', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.stats().rootWeight).toBe(0)
    })

    it('starts with treeHeight of 1', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.stats().treeHeight).toBe(1)
    })

    it('starts with zero totalBitsEncoded', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.stats().totalBitsEncoded).toBe(0)
    })

    it('starts with zero totalSymbolsDecoded', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.stats().totalSymbolsDecoded).toBe(0)
    })

    it('returns a root node from getTree()', () => {
      const ah = new AdaptiveHuffman()
      const root = ah.getTree()
      expect(root).toBeDefined()
      expect(root.weight).toBe(0)
      expect(root.parent).toBeNull()
    })
  })

  // ─── update ──────────────────────────────────────────────────────────

  describe('update', () => {
    it('adds a new symbol to the tree', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      expect(ah.contains('a')).toBe(true)
    })

    it('increases node count when adding first symbol', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      // old NYT splits into: internal node + new NYT + leaf = +2 nodes
      expect(ah.getNodeCount()).toBe(3)
    })

    it('increases uniqueSymbols count', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      expect(ah.stats().uniqueSymbols).toBe(1)
    })

    it('sets symbol weight to 1 after first update', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      expect(ah.getSymbolWeight('a')).toBe(1)
    })

    it('increments weight on repeated update of same symbol', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('a')
      ah.update('a')
      expect(ah.getSymbolWeight('a')).toBe(3)
    })

    it('handles multiple different symbols', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('b')
      ah.update('c')
      expect(ah.contains('a')).toBe(true)
      expect(ah.contains('b')).toBe(true)
      expect(ah.contains('c')).toBe(true)
      expect(ah.stats().uniqueSymbols).toBe(3)
    })

    it('updates root weight to reflect total symbol updates', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('b')
      ah.update('a')
      expect(ah.stats().rootWeight).toBe(3)
    })

    it('does not add duplicate symbol entries for repeated updates', () => {
      const ah = new AdaptiveHuffman()
      ah.update('x')
      ah.update('x')
      ah.update('x')
      expect(ah.stats().uniqueSymbols).toBe(1)
    })

    it('handles single-character symbols', () => {
      const ah = new AdaptiveHuffman()
      ah.update('A')
      expect(ah.contains('A')).toBe(true)
      expect(ah.getSymbolWeight('A')).toBe(1)
    })

    it('handles numeric characters as symbols', () => {
      const ah = new AdaptiveHuffman()
      ah.update('5')
      expect(ah.contains('5')).toBe(true)
    })

    it('handles special characters as symbols', () => {
      const ah = new AdaptiveHuffman()
      ah.update('\n')
      ah.update('\t')
      ah.update('\0')
      expect(ah.contains('\n')).toBe(true)
      expect(ah.contains('\t')).toBe(true)
      expect(ah.contains('\0')).toBe(true)
    })

    it('handles space character', () => {
      const ah = new AdaptiveHuffman()
      ah.update(' ')
      expect(ah.contains(' ')).toBe(true)
      expect(ah.getSymbolWeight(' ')).toBe(1)
    })
  })

  // ─── contains ────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns false for unknown symbol', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.contains('z')).toBe(false)
    })

    it('returns true after update', () => {
      const ah = new AdaptiveHuffman()
      ah.update('q')
      expect(ah.contains('q')).toBe(true)
    })

    it('returns false for different symbol after adding one', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      expect(ah.contains('b')).toBe(false)
    })
  })

  // ─── getSymbolWeight ──────────────────────────────────────────────────

  describe('getSymbolWeight', () => {
    it('returns undefined for unknown symbol', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.getSymbolWeight('x')).toBeUndefined()
    })

    it('returns 1 for symbol updated once', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      expect(ah.getSymbolWeight('a')).toBe(1)
    })

    it('returns correct weight after multiple updates', () => {
      const ah = new AdaptiveHuffman()
      for (let i = 0; i < 10; i++) {
        ah.update('a')
      }
      expect(ah.getSymbolWeight('a')).toBe(10)
    })

    it('tracks weights independently per symbol', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('a')
      ah.update('a')
      ah.update('b')
      expect(ah.getSymbolWeight('a')).toBe(3)
      expect(ah.getSymbolWeight('b')).toBe(1)
    })
  })

  // ─── getNodeCount ─────────────────────────────────────────────────────

  describe('getNodeCount', () => {
    it('returns 1 for a fresh tree', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.getNodeCount()).toBe(1)
    })

    it('increases by 2 for each new symbol', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      expect(ah.getNodeCount()).toBe(3)
      ah.update('b')
      expect(ah.getNodeCount()).toBe(5)
      ah.update('c')
      expect(ah.getNodeCount()).toBe(7)
    })

    it('does not increase for repeated symbol updates', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      const countAfterFirst = ah.getNodeCount()
      ah.update('a')
      expect(ah.getNodeCount()).toBe(countAfterFirst)
    })
  })

  // ─── getTree ──────────────────────────────────────────────────────────

  describe('getTree', () => {
    it('returns the root node', () => {
      const ah = new AdaptiveHuffman()
      const root = ah.getTree()
      expect(root).toBeDefined()
      expect(root.parent).toBeNull()
    })

    it('root has no parent', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.getTree().parent).toBeNull()
    })

    it('root is internal node after adding symbol', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      const root = ah.getTree()
      expect(root.left).not.toBeNull()
      expect(root.right).not.toBeNull()
    })

    it('tree structure is valid after multiple updates', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('b')
      ah.update('c')
      const root = ah.getTree()
      // Root should have accumulated weight
      expect(root.weight).toBeGreaterThan(0)
    })
  })

  // ─── encode ──────────────────────────────────────────────────────────

  describe('encode', () => {
    it('encodes a single new character to 8 bits (NYT code is empty + 8 raw bits)', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('A')
      // First char: NYT is root so code is empty, plus 8 raw bits for 'A'
      expect(bits.length).toBe(8)
    })

    it('encodes empty string to empty array', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('')
      expect(bits).toEqual([])
    })

    it('produces only 0s and 1s', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('hello')
      for (const bit of bits) {
        expect(bit === 0 || bit === 1).toBe(true)
      }
    })

    it('encodes first occurrence with 8-bit raw representation', () => {
      const ah = new AdaptiveHuffman()
      // 'A' = char code 65 = 01000001
      const bits = ah.encode('A')
      expect(bits).toEqual([0, 1, 0, 0, 0, 0, 0, 1])
    })

    it('encodes second occurrence of same symbol shorter than first', () => {
      const ah = new AdaptiveHuffman()
      const firstBits = ah.encode('a')
      ah.reset()
      // Encode 'a' twice on same instance
      const ah2 = new AdaptiveHuffman()
      ah2.encode('a')
      const secondBits = ah2.encode('a')
      // Second encoding should have a tree code < 8 bits (since tree already knows 'a')
      expect(secondBits.length).toBeLessThan(8)
    })

    it('tracks totalBitsEncoded', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('ab')
      expect(ah.stats().totalBitsEncoded).toBe(bits.length)
    })

    it('accumulates totalBitsEncoded across multiple encode calls', () => {
      const ah = new AdaptiveHuffman()
      const bits1 = ah.encode('a')
      const bits2 = ah.encode('b')
      expect(ah.stats().totalBitsEncoded).toBe(bits1.length + bits2.length)
    })

    it('encodes multiple characters', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('abc')
      expect(bits.length).toBeGreaterThan(0)
    })

    it('encodes special characters correctly', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('\n')
      // '\n' = char code 10 = 00001010
      expect(bits).toEqual([0, 0, 0, 0, 1, 0, 1, 0])
    })

    it('encodes null character', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('\0')
      // '\0' = char code 0 = 00000000
      expect(bits).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    })
  })

  // ─── decode ──────────────────────────────────────────────────────────

  describe('decode', () => {
    it('decodes empty bits to empty string', () => {
      const ah = new AdaptiveHuffman()
      expect(ah.decode([])).toBe('')
    })

    it('round-trips a single character', () => {
      const encoder = new AdaptiveHuffman()
      const bits = encoder.encode('X')
      const decoder = new AdaptiveHuffman()
      expect(decoder.decode(bits)).toBe('X')
    })

    it('round-trips a multi-character string', () => {
      const encoder = new AdaptiveHuffman()
      const bits = encoder.encode('hello')
      const decoder = new AdaptiveHuffman()
      expect(decoder.decode(bits)).toBe('hello')
    })

    it('round-trips with repeated characters', () => {
      const encoder = new AdaptiveHuffman()
      const bits = encoder.encode('aaa')
      const decoder = new AdaptiveHuffman()
      expect(decoder.decode(bits)).toBe('aaa')
    })

    it('round-trips with all ASCII printable characters', () => {
      let data = ''
      for (let i = 32; i < 127; i++) {
        data += String.fromCharCode(i)
      }
      const encoder = new AdaptiveHuffman()
      const bits = encoder.encode(data)
      const decoder = new AdaptiveHuffman()
      expect(decoder.decode(bits)).toBe(data)
    })

    it('round-trips special characters', () => {
      const data = '\n\t\r \0'
      const encoder = new AdaptiveHuffman()
      const bits = encoder.encode(data)
      const decoder = new AdaptiveHuffman()
      expect(decoder.decode(bits)).toBe(data)
    })

    it('tracks totalSymbolsDecoded', () => {
      const encoder = new AdaptiveHuffman()
      const bits = encoder.encode('abc')
      const decoder = new AdaptiveHuffman()
      decoder.decode(bits)
      expect(decoder.stats().totalSymbolsDecoded).toBe(3)
    })

    it('handles truncated bit stream gracefully', () => {
      const encoder = new AdaptiveHuffman()
      const bits = encoder.encode('ab')
      // Truncate to only first 8 bits (just 'a')
      const truncated = bits.slice(0, 8)
      const decoder = new AdaptiveHuffman()
      const result = decoder.decode(truncated)
      // Should decode at least the first character
      expect(result.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── encode + decode round-trip (comprehensive) ──────────────────────

  describe('encode/decode round-trip', () => {
    it('round-trips a single symbol', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('z')
      expect(dec.decode(bits)).toBe('z')
    })

    it('round-trips repeated single symbol', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('zzzzz')
      expect(dec.decode(bits)).toBe('zzzzz')
    })

    it('round-trips alternating symbols', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('ababab')
      expect(dec.decode(bits)).toBe('ababab')
    })

    it('round-trips a sentence', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('the quick brown fox')
      expect(dec.decode(bits)).toBe('the quick brown fox')
    })

    it('round-trips numeric string', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('1234567890')
      expect(dec.decode(bits)).toBe('1234567890')
    })

    it('round-trips string with spaces', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('a b c d e')
      expect(dec.decode(bits)).toBe('a b c d e')
    })

    it('compression improves for repeated patterns', () => {
      const enc1 = new AdaptiveHuffman()
      const firstCharBits = enc1.encode('a').length

      // After encoding 'a' 10 more times, codes should be shorter
      for (let i = 0; i < 10; i++) {
        enc1.encode('a')
      }
      const laterBits = enc1.encode('a').length

      expect(laterBits).toBeLessThan(firstCharBits)
    })
  })

  // ─── reset ──────────────────────────────────────────────────────────

  describe('reset', () => {
    it('resets to initial node count', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('b')
      ah.reset()
      expect(ah.getNodeCount()).toBe(1)
    })

    it('clears all symbols', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('b')
      ah.reset()
      expect(ah.contains('a')).toBe(false)
      expect(ah.contains('b')).toBe(false)
      expect(ah.stats().uniqueSymbols).toBe(0)
    })

    it('resets root weight to 0', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('a')
      ah.reset()
      expect(ah.stats().rootWeight).toBe(0)
    })

    it('resets totalBitsEncoded to 0', () => {
      const ah = new AdaptiveHuffman()
      ah.encode('hello')
      ah.reset()
      expect(ah.stats().totalBitsEncoded).toBe(0)
    })

    it('resets totalSymbolsDecoded to 0', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('test')
      ah.decode(bits)
      ah.reset()
      expect(ah.stats().totalSymbolsDecoded).toBe(0)
    })

    it('resets treeHeight to 1', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('b')
      ah.reset()
      expect(ah.stats().treeHeight).toBe(1)
    })

    it('allows reuse after reset', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.reset()
      ah.update('b')
      expect(ah.contains('b')).toBe(true)
      expect(ah.contains('a')).toBe(false)
    })

    it('encode/decode works correctly after reset', () => {
      const ah = new AdaptiveHuffman()
      ah.encode('first round')
      ah.reset()
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('second')
      expect(ah.decode(bits)).toBe('second')
    })
  })

  // ─── stats ──────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns all required stat fields', () => {
      const ah = new AdaptiveHuffman()
      const s = ah.stats()
      expect(s).toHaveProperty('nodeCount')
      expect(s).toHaveProperty('uniqueSymbols')
      expect(s).toHaveProperty('totalBitsEncoded')
      expect(s).toHaveProperty('totalSymbolsDecoded')
      expect(s).toHaveProperty('rootWeight')
      expect(s).toHaveProperty('treeHeight')
    })

    it('reflects correct nodeCount after updates', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('b')
      ah.update('c')
      expect(ah.stats().nodeCount).toBe(7)
    })

    it('reflects correct uniqueSymbols after updates', () => {
      const ah = new AdaptiveHuffman()
      ah.update('x')
      ah.update('y')
      expect(ah.stats().uniqueSymbols).toBe(2)
    })

    it('reflects totalBitsEncoded after encoding', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('abc')
      expect(ah.stats().totalBitsEncoded).toBe(bits.length)
    })

    it('treeHeight increases as symbols are added', () => {
      const ah = new AdaptiveHuffman()
      const initial = ah.stats().treeHeight
      ah.update('a')
      expect(ah.stats().treeHeight).toBeGreaterThan(initial)
    })

    it('rootWeight equals total number of updates', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      ah.update('b')
      ah.update('a')
      ah.update('c')
      expect(ah.stats().rootWeight).toBe(4)
    })
  })

  // ─── Edge cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles encoding a very long string', () => {
      const ah = new AdaptiveHuffman()
      const longStr = 'abcdefghij'.repeat(100)
      const bits = ah.encode(longStr)
      expect(bits.length).toBeGreaterThan(0)
      const decoder = new AdaptiveHuffman()
      expect(decoder.decode(bits)).toBe(longStr)
    })

    it('handles encoding the same symbol many times', () => {
      const ah = new AdaptiveHuffman()
      const bits = ah.encode('x'.repeat(50))
      expect(bits.length).toBeGreaterThan(0)
      const decoder = new AdaptiveHuffman()
      expect(decoder.decode(bits)).toBe('x'.repeat(50))
    })

    it('handles two-character string round-trip', () => {
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('ab')
      const dec = new AdaptiveHuffman()
      expect(dec.decode(bits)).toBe('ab')
    })

    it('handles unicode characters within single char range', () => {
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('~')
      const dec = new AdaptiveHuffman()
      expect(dec.decode(bits)).toBe('~')
    })

    it('handles symbol with char code 255', () => {
      const enc = new AdaptiveHuffman()
      const ch = String.fromCharCode(255)
      const bits = enc.encode(ch)
      const dec = new AdaptiveHuffman()
      expect(dec.decode(bits)).toBe(ch)
    })

    it('handles symbol with char code 128', () => {
      const enc = new AdaptiveHuffman()
      const ch = String.fromCharCode(128)
      const bits = enc.encode(ch)
      const dec = new AdaptiveHuffman()
      expect(dec.decode(bits)).toBe(ch)
    })

    it('encode on empty string does not change tree', () => {
      const ah = new AdaptiveHuffman()
      ah.encode('')
      expect(ah.getNodeCount()).toBe(1)
      expect(ah.stats().uniqueSymbols).toBe(0)
    })

    it('decode on empty array does not change tree', () => {
      const ah = new AdaptiveHuffman()
      ah.decode([])
      expect(ah.stats().totalSymbolsDecoded).toBe(0)
    })

    it('many unique symbols creates a valid tree', () => {
      const ah = new AdaptiveHuffman()
      for (let i = 0; i < 50; i++) {
        ah.update(String.fromCharCode(32 + i))
      }
      expect(ah.stats().uniqueSymbols).toBe(50)
      expect(ah.stats().nodeCount).toBe(101) // 1 root + 50*2 children
      expect(ah.stats().rootWeight).toBe(50)
    })

    it('repeated encode-decode cycles maintain consistency', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()

      for (let cycle = 0; cycle < 5; cycle++) {
        const msg = String.fromCharCode(65 + cycle) // A, B, C, D, E
        const bits = enc.encode(msg)
        const result = dec.decode(bits)
        expect(result).toBe(msg)
      }
    })

    it('separate encoder/decoder instances stay in sync for long string', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const message = 'mississippi river'
      const bits = enc.encode(message)
      expect(dec.decode(bits)).toBe(message)
    })

    it('getSymbolWeight returns undefined after reset for previously added symbol', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      expect(ah.getSymbolWeight('a')).toBe(1)
      ah.reset()
      expect(ah.getSymbolWeight('a')).toBeUndefined()
    })

    it('tree node has correct structure after updates', () => {
      const ah = new AdaptiveHuffman()
      ah.update('a')
      const root = ah.getTree()
      // Root should be internal node with two children
      expect(root.symbol == null).toBe(true)
      expect(root.left).not.toBeNull()
      expect(root.right).not.toBeNull()
    })

    it('handles binary round-trip (0s and 1s as characters)', () => {
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('01')
      const dec = new AdaptiveHuffman()
      expect(dec.decode(bits)).toBe('01')
    })
  })
})
