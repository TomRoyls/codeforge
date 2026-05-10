import { describe, it, expect, beforeEach } from 'vitest'
import { AdaptiveHuffman } from '../../src/core/adaptive-huffman/adaptive-huffman.js'
import type { AdaptiveHuffmanNode, AdaptiveHuffmanStats } from '../../src/core/adaptive-huffman/types.js'

describe('AdaptiveHuffman', () => {
  let tree: AdaptiveHuffman

  beforeEach(() => {
    tree = new AdaptiveHuffman()
  })

  describe('construction', () => {
    it('should create a tree with 1 node (NYT)', () => {
      expect(tree.getNodeCount()).toBe(1)
    })

    it('should have root weight 0 initially', () => {
      expect(tree.getTree().weight).toBe(0)
    })

    it('should have root with null symbol', () => {
      expect(tree.getTree().symbol).toBeNull()
    })

    it('should have root with no children', () => {
      const root = tree.getTree()
      expect(root.left).toBeNull()
      expect(root.right).toBeNull()
    })

    it('should have 0 unique symbols', () => {
      expect(tree.stats().uniqueSymbols).toBe(0)
    })

    it('should have tree height 1', () => {
      expect(tree.stats().treeHeight).toBe(1)
    })

    it('should have rootWeight 0', () => {
      expect(tree.stats().rootWeight).toBe(0)
    })

    it('should not contain any symbol', () => {
      expect(tree.contains('a')).toBe(false)
      expect(tree.contains('z')).toBe(false)
    })

    it('should return undefined for getSymbolWeight of unknown symbol', () => {
      expect(tree.getSymbolWeight('a')).toBeUndefined()
    })
  })

  describe('encode single chars', () => {
    it('should encode a single character', () => {
      const bits = tree.encode('a')
      expect(bits.length).toBeGreaterThan(0)
    })

    it('should produce 8 bits for first character (NYT code + symbol bits)', () => {
      const bits = tree.encode('a')
      expect(bits.length).toBe(SYMBOL_BITS)
    })

    it('should encode first character as pure symbol bits (no NYT code since root is NYT)', () => {
      const bits = tree.encode('A')
      const code = 'A'.charCodeAt(0)
      for (let i = SYMBOL_BITS - 1; i >= 0; i--) {
        expect(bits[SYMBOL_BITS - 1 - i]).toBe((code >> i) & 1)
      }
    })

    it('should encode "b" correctly', () => {
      const bits = tree.encode('b')
      expect(bits.length).toBe(SYMBOL_BITS)
    })
  })

  describe('decode single chars', () => {
    it('should decode a single character', () => {
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('a')
      const result = tree.decode(bits)
      expect(result).toBe('a')
    })

    it('should decode "Z" correctly', () => {
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('Z')
      expect(tree.decode(bits)).toBe('Z')
    })

    it('should decode digit character', () => {
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('5')
      expect(tree.decode(bits)).toBe('5')
    })
  })

  describe('encode/decode strings', () => {
    it('should roundtrip "ab"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('ab')
      expect(dec.decode([...bits])).toBe('ab')
    })

    it('should roundtrip "abc"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('abc')
      expect(dec.decode([...bits])).toBe('abc')
    })

    it('should roundtrip "hello"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('hello')
      expect(dec.decode([...bits])).toBe('hello')
    })

    it('should roundtrip "aab"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('aab')
      expect(dec.decode([...bits])).toBe('aab')
    })

    it('should roundtrip "aaa"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('aaa')
      expect(dec.decode([...bits])).toBe('aaa')
    })

    it('should roundtrip "abcdefg"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('abcdefg')
      expect(dec.decode([...bits])).toBe('abcdefg')
    })

    it('should roundtrip "the quick brown fox"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('the quick brown fox')
      expect(dec.decode([...bits])).toBe('the quick brown fox')
    })

    it('should roundtrip a 50-char string', () => {
      const str = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should roundtrip a 100+ char string', () => {
      const str = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should roundtrip a string with all unique characters', () => {
      const str = 'abcdefghij'
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })
  })

  describe('encode/decode repeated chars', () => {
    it('should roundtrip "aaaa"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('aaaa')
      expect(dec.decode([...bits])).toBe('aaaa')
    })

    it('should roundtrip "aabb"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('aabb')
      expect(dec.decode([...bits])).toBe('aabb')
    })

    it('should roundtrip "aaabbbccc"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('aaabbbccc')
      expect(dec.decode([...bits])).toBe('aaabbbccc')
    })

    it('should produce shorter codes for repeated characters', () => {
      const enc1 = new AdaptiveHuffman()
      const bitsFirst = enc1.encode('a').length
      const enc2 = new AdaptiveHuffman()
      enc2.encode('a')
      enc2.encode('a')
      const bitsThird = enc2.encode('a').length
      expect(bitsThird).toBeLessThanOrEqual(bitsFirst)
    })
  })

  describe('update', () => {
    it('should add a new symbol to the tree', () => {
      tree.update('a')
      expect(tree.contains('a')).toBe(true)
    })

    it('should increase node count after update', () => {
      tree.update('a')
      expect(tree.getNodeCount()).toBe(3)
    })

    it('should set weight of new symbol to 1', () => {
      tree.update('a')
      expect(tree.getSymbolWeight('a')).toBe(1)
    })

    it('should increment weight on repeated update', () => {
      tree.update('a')
      tree.update('a')
      expect(tree.getSymbolWeight('a')).toBe(2)
    })

    it('should handle multiple different symbols', () => {
      tree.update('a')
      tree.update('b')
      tree.update('c')
      expect(tree.contains('a')).toBe(true)
      expect(tree.contains('b')).toBe(true)
      expect(tree.contains('c')).toBe(true)
    })

    it('should increase node count by 2 per new symbol', () => {
      tree.update('a')
      expect(tree.getNodeCount()).toBe(3)
      tree.update('b')
      expect(tree.getNodeCount()).toBe(5)
      tree.update('c')
      expect(tree.getNodeCount()).toBe(7)
    })

    it('should not increase node count for existing symbol', () => {
      tree.update('a')
      const count = tree.getNodeCount()
      tree.update('a')
      expect(tree.getNodeCount()).toBe(count)
    })

    it('should update root weight', () => {
      tree.update('a')
      expect(tree.getTree().weight).toBe(1)
      tree.update('a')
      expect(tree.getTree().weight).toBe(2)
    })
  })

  describe('getNodeCount', () => {
    it('should return 1 for fresh tree', () => {
      expect(tree.getNodeCount()).toBe(1)
    })

    it('should return 3 after one symbol', () => {
      tree.update('a')
      expect(tree.getNodeCount()).toBe(3)
    })

    it('should return 5 after two symbols', () => {
      tree.update('a')
      tree.update('b')
      expect(tree.getNodeCount()).toBe(5)
    })

    it('should remain same when updating existing symbol', () => {
      tree.update('a')
      tree.update('a')
      tree.update('a')
      expect(tree.getNodeCount()).toBe(3)
    })
  })

  describe('getSymbolWeight', () => {
    it('should return undefined for unknown symbol', () => {
      expect(tree.getSymbolWeight('x')).toBeUndefined()
    })

    it('should return 1 after first update', () => {
      tree.update('a')
      expect(tree.getSymbolWeight('a')).toBe(1)
    })

    it('should return correct weight after multiple updates', () => {
      tree.update('a')
      tree.update('a')
      tree.update('a')
      tree.update('a')
      tree.update('a')
      expect(tree.getSymbolWeight('a')).toBe(5)
    })

    it('should track weights independently for different symbols', () => {
      tree.update('a')
      tree.update('a')
      tree.update('b')
      expect(tree.getSymbolWeight('a')).toBe(2)
      expect(tree.getSymbolWeight('b')).toBe(1)
    })
  })

  describe('contains', () => {
    it('should return false for unseen symbol', () => {
      expect(tree.contains('a')).toBe(false)
    })

    it('should return true after update', () => {
      tree.update('a')
      expect(tree.contains('a')).toBe(true)
    })

    it('should return true after encode', () => {
      tree.encode('x')
      expect(tree.contains('x')).toBe(true)
    })

    it('should return false for symbol not in tree', () => {
      tree.update('a')
      expect(tree.contains('b')).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset node count to 1', () => {
      tree.update('a')
      tree.update('b')
      tree.reset()
      expect(tree.getNodeCount()).toBe(1)
    })

    it('should clear all symbols', () => {
      tree.update('a')
      tree.update('b')
      tree.reset()
      expect(tree.contains('a')).toBe(false)
      expect(tree.contains('b')).toBe(false)
    })

    it('should reset stats', () => {
      tree.encode('hello')
      tree.reset()
      const s = tree.stats()
      expect(s.uniqueSymbols).toBe(0)
      expect(s.totalBitsEncoded).toBe(0)
      expect(s.totalSymbolsDecoded).toBe(0)
    })

    it('should allow reuse after reset', () => {
      tree.update('a')
      tree.reset()
      tree.update('b')
      expect(tree.contains('b')).toBe(true)
      expect(tree.contains('a')).toBe(false)
    })

    it('should reset root weight to 0', () => {
      tree.update('a')
      tree.update('a')
      tree.reset()
      expect(tree.getTree().weight).toBe(0)
    })

    it('should allow encode/decode after reset', () => {
      tree.encode('test')
      tree.reset()
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('new')
      const dec = new AdaptiveHuffman()
      expect(dec.decode([...bits])).toBe('new')
    })
  })

  describe('getTree', () => {
    it('should return the root node', () => {
      const root = tree.getTree()
      expect(root).toBeDefined()
      expect(root.weight).toBe(0)
    })

    it('should return updated tree after updates', () => {
      tree.update('a')
      const root = tree.getTree()
      expect(root.weight).toBe(1)
      expect(root.left).not.toBeNull()
      expect(root.right).not.toBeNull()
    })

    it('should have leaf with symbol after first update', () => {
      tree.update('a')
      const root = tree.getTree()
      const hasSymbolA = root.left?.symbol === 'a' || root.right?.symbol === 'a'
      expect(hasSymbolA).toBe(true)
    })

    it('should have NYT node after first update', () => {
      tree.update('a')
      const root = tree.getTree()
      const hasNyt = (root.left?.symbol === null && root.left?.left === null) || (root.right?.symbol === null && root.right?.left === null)
      expect(hasNyt).toBe(true)
    })
  })

  describe('stats', () => {
    it('should return correct initial stats', () => {
      const s = tree.stats()
      expect(s.nodeCount).toBe(1)
      expect(s.uniqueSymbols).toBe(0)
      expect(s.totalBitsEncoded).toBe(0)
      expect(s.totalSymbolsDecoded).toBe(0)
      expect(s.rootWeight).toBe(0)
      expect(s.treeHeight).toBe(1)
    })

    it('should update uniqueSymbols after update', () => {
      tree.update('a')
      tree.update('b')
      expect(tree.stats().uniqueSymbols).toBe(2)
    })

    it('should track totalBitsEncoded after encode', () => {
      const bits = tree.encode('abc')
      const s = tree.stats()
      expect(s.totalBitsEncoded).toBe(bits.length)
    })

    it('should track rootWeight', () => {
      tree.update('a')
      tree.update('b')
      tree.update('a')
      expect(tree.stats().rootWeight).toBe(3)
    })

    it('should track treeHeight', () => {
      tree.update('a')
      const h = tree.stats().treeHeight
      expect(h).toBeGreaterThan(1)
    })

    it('should reset stats after reset()', () => {
      tree.encode('test')
      tree.reset()
      const s = tree.stats()
      expect(s.nodeCount).toBe(1)
      expect(s.uniqueSymbols).toBe(0)
      expect(s.totalBitsEncoded).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string encode', () => {
      const bits = tree.encode('')
      expect(bits).toEqual([])
    })

    it('should handle empty bits decode', () => {
      const result = tree.decode([])
      expect(result).toBe('')
    })

    it('should handle single character roundtrip', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('x')
      expect(dec.decode([...bits])).toBe('x')
    })

    it('should handle all same character', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const str = 'zzzzzzzzzz'
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should handle all unique characters', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const str = 'abcdefghij'
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should handle special character " "', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(' ')
      expect(dec.decode([...bits])).toBe(' ')
    })

    it('should handle special character "\\n"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('\n')
      expect(dec.decode([...bits])).toBe('\n')
    })

    it('should handle special character "\\t"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('\t')
      expect(dec.decode([...bits])).toBe('\t')
    })

    it('should handle special character "!"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('!')
      expect(dec.decode([...bits])).toBe('!')
    })

    it('should handle special character "@"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('@')
      expect(dec.decode([...bits])).toBe('@')
    })

    it('should handle digits "0123456789"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('0123456789')
      expect(dec.decode([...bits])).toBe('0123456789')
    })

    it('should handle uppercase "ABCDEF"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('ABCDEF')
      expect(dec.decode([...bits])).toBe('ABCDEF')
    })

    it('should handle mixed case "aAbBcC"', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('aAbBcC')
      expect(dec.decode([...bits])).toBe('aAbBcC')
    })

    it('should handle string with spaces', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('hello world')
      expect(dec.decode([...bits])).toBe('hello world')
    })

    it('should handle repeated single char 20 times', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const str = 'a'.repeat(20)
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should handle alternating characters', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('ababababab')
      expect(dec.decode([...bits])).toBe('ababababab')
    })

    it('should handle punctuation', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('.,;:!?')
      expect(dec.decode([...bits])).toBe('.,;:!?')
    })

    it('should handle string with repeated pattern', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const str = 'abcabcabcabc'
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should handle char code 0', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('\0')
      expect(dec.decode([...bits])).toBe('\0')
    })

    it('should handle char code 127 (DEL)', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('\x7F')
      expect(dec.decode([...bits])).toBe('\x7F')
    })

    it('should handle char code 255', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode('\xFF')
      expect(dec.decode([...bits])).toBe('\xFF')
    })

    it('should handle 200 char roundtrip', () => {
      const str = 'This is a longer test string that has many characters in it. It includes various letters, spaces, and some punctuation marks! Can we decode it correctly? Yes we can! '.substring(0, 120)
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })
  })

  describe('encode-decode roundtrip (100+ chars)', () => {
    it('should roundtrip a paragraph', () => {
      const str = 'Adaptive Huffman coding is an entropy encoding technique used in lossless data compression. It builds a Huffman tree dynamically as it processes the input data.'
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should roundtrip repeated word', () => {
      const str = 'huffman '.repeat(15).trim()
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should roundtrip all printable ASCII', () => {
      let str = ''
      for (let i = 32; i < 127; i++) {
        str += String.fromCharCode(i)
      }
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should roundtrip long repeated single char', () => {
      const str = 'X'.repeat(150)
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should roundtrip mixed content 150+ chars', () => {
      const str = 'The FGK (Faller-Gallager-Knuth) algorithm maintains the sibling property during updates. When a symbol is processed, the tree is restructured to maintain the property. This ensures optimal encoding!'
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should roundtrip sentence with many spaces', () => {
      const str = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })
  })

  describe('encode produces valid bits', () => {
    it('should produce only 0s and 1s', () => {
      const bits = tree.encode('test')
      for (const bit of bits) {
        expect(bit === 0 || bit === 1).toBe(true)
      }
    })

    it('should produce non-empty output for non-empty input', () => {
      const bits = tree.encode('x')
      expect(bits.length).toBeGreaterThan(0)
    })

    it('should produce more bits for first occurrence than subsequent', () => {
      const enc = new AdaptiveHuffman()
      const bits1 = enc.encode('a')
      const bits2 = enc.encode('a')
      expect(bits2.length).toBeLessThan(bits1.length)
    })

    it('should produce progressively shorter codes for frequent chars', () => {
      const enc = new AdaptiveHuffman()
      enc.encode('a')
      const b2 = enc.encode('a').length
      const b3 = enc.encode('a').length
      const b4 = enc.encode('a').length
      expect(b3).toBeLessThanOrEqual(b2)
      expect(b4).toBeLessThanOrEqual(b3)
    })
  })

  describe('multiple independent instances', () => {
    it('should work with separate encoder and decoder', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      enc.encode('a')
      const bits = enc.encode('a')
      dec.decode(new Array(SYMBOL_BITS).fill(0).map((_, i) => (('a'.charCodeAt(0) >> (SYMBOL_BITS - 1 - i)) & 1)))
      const result = dec.decode([...bits])
      expect(result).toBe('a')
    })

    it('should not share state between instances', () => {
      const t1 = new AdaptiveHuffman()
      const t2 = new AdaptiveHuffman()
      t1.update('a')
      expect(t1.contains('a')).toBe(true)
      expect(t2.contains('a')).toBe(false)
    })
  })

  describe('tree structure after updates', () => {
    it('should have proper parent references', () => {
      tree.update('a')
      const root = tree.getTree()
      expect(root.left!.parent).toBe(root)
      expect(root.right!.parent).toBe(root)
    })

    it('should maintain valid tree after multiple updates', () => {
      tree.update('a')
      tree.update('b')
      tree.update('c')
      tree.update('d')
      const validateParentRefs = (node: AdaptiveHuffmanNode | null, parent: AdaptiveHuffmanNode | null): boolean => {
        if (node === null) return true
        if (node.parent !== parent) return false
        return validateParentRefs(node.left, node) && validateParentRefs(node.right, node)
      }
      expect(validateParentRefs(tree.getTree(), null)).toBe(true)
    })

    it('should maintain consistent weights', () => {
      tree.update('a')
      tree.update('a')
      tree.update('b')
      const root = tree.getTree()
      expect(root.weight).toBe(root.left!.weight + root.right!.weight)
    })

    it('should have symbol node after first update', () => {
      tree.update('x')
      const root = tree.getTree()
      const hasX = root.left?.symbol === 'x' || root.right?.symbol === 'x'
      expect(hasX).toBe(true)
      const xNode = root.left?.symbol === 'x' ? root.left : root.right
      expect(xNode!.weight).toBe(1)
    })
  })

  describe('decode with partial bits', () => {
    it('should handle decode with trailing bits gracefully', () => {
      const enc = new AdaptiveHuffman()
      const bits = enc.encode('a')
      bits.push(0, 1, 0)
      const dec = new AdaptiveHuffman()
      const result = dec.decode(bits)
      expect(result.startsWith('a')).toBe(true)
    })
  })

  describe('encode bit length properties', () => {
    it('should encode first character as exactly 8 bits', () => {
      expect(tree.encode('a').length).toBe(8)
    })

    it('should encode first char of any code as 8 bits', () => {
      expect(tree.encode('Z').length).toBe(8)
      const t2 = new AdaptiveHuffman()
      expect(t2.encode('0').length).toBe(8)
    })

    it('should encode "aa" in fewer than 16 bits', () => {
      const bits = tree.encode('aa')
      expect(bits.length).toBeLessThan(16)
    })

    it('should encode "aaa" in fewer than 24 bits', () => {
      const bits = tree.encode('aaa')
      expect(bits.length).toBeLessThan(24)
    })

    it('should produce decreasing bit count for repeated same char', () => {
      const enc = new AdaptiveHuffman()
      const b1 = enc.encode('a').length
      const b2 = enc.encode('a').length
      const b3 = enc.encode('a').length
      expect(b2).toBeLessThanOrEqual(b1)
      expect(b3).toBeLessThanOrEqual(b2)
    })

    it('should use more bits for new symbols vs known symbols', () => {
      const enc = new AdaptiveHuffman()
      enc.encode('a')
      enc.encode('a')
      const knownBits = enc.encode('a').length
      const t2 = new AdaptiveHuffman()
      const newBits = t2.encode('z').length
      expect(newBits).toBeGreaterThan(knownBits)
    })
  })

  describe('multiple encode/decode sequences', () => {
    it('should handle sequential encode calls', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const b1 = enc.encode('x')
      const r1 = dec.decode([...b1])
      expect(r1).toBe('x')
      const b2 = enc.encode('y')
      const r2 = dec.decode([...b2])
      expect(r2).toBe('y')
      const b3 = enc.encode('z')
      const r3 = dec.decode([...b3])
      expect(r3).toBe('z')
    })

    it('should handle encode/decode of full sentences separately', () => {
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const s1 = 'hello'
      const b1 = enc.encode(s1)
      expect(dec.decode([...b1])).toBe(s1)
      const s2 = 'world'
      const b2 = enc.encode(s2)
      expect(dec.decode([...b2])).toBe(s2)
    })

    it('should encode then batch decode', () => {
      const enc = new AdaptiveHuffman()
      const allBits = enc.encode('abc')
      const dec = new AdaptiveHuffman()
      expect(dec.decode([...allBits])).toBe('abc')
    })
  })

  describe('tree invariants', () => {
    it('should maintain positive weights on all nodes after updates', () => {
      tree.update('a')
      tree.update('b')
      tree.update('c')
      const checkPositive = (node: AdaptiveHuffmanNode | null): boolean => {
        if (node === null) return true
        if (node !== tree.getTree() && node.weight < 0) return false
        return checkPositive(node.left) && checkPositive(node.right)
      }
      expect(checkPositive(tree.getTree())).toBe(true)
    })

    it('should maintain leaf nodes have no children', () => {
      tree.update('a')
      tree.update('b')
      const checkLeaves = (node: AdaptiveHuffmanNode | null): boolean => {
        if (node === null) return true
        const isLeaf = node.left === null && node.right === null
        const isInternal = node.left !== null && node.right !== null
        if (!isLeaf && !isInternal) return false
        return checkLeaves(node.left) && checkLeaves(node.right)
      }
      expect(checkLeaves(tree.getTree())).toBe(true)
    })

    it('should maintain root has no parent', () => {
      tree.update('a')
      tree.update('b')
      tree.update('a')
      expect(tree.getTree().parent).toBeNull()
    })

    it('should maintain consistent node count with symbols', () => {
      tree.update('a')
      tree.update('b')
      tree.update('c')
      expect(tree.getNodeCount()).toBe(2 * 3 + 1)
    })

    it('should have leaf nodes with non-null symbols for known symbols', () => {
      tree.update('a')
      tree.update('b')
      let foundA = false
      let foundB = false
      const findSymbols = (node: AdaptiveHuffmanNode | null): void => {
        if (node === null) return
        if (node.symbol === 'a') foundA = true
        if (node.symbol === 'b') foundB = true
        findSymbols(node.left)
        findSymbols(node.right)
      }
      findSymbols(tree.getTree())
      expect(foundA).toBe(true)
      expect(foundB).toBe(true)
    })
  })

  describe('reset behavior detailed', () => {
    it('should allow building a completely new tree after reset', () => {
      tree.update('a')
      tree.update('b')
      tree.encode('hello')
      tree.reset()
      expect(tree.getNodeCount()).toBe(1)
      expect(tree.getSymbolWeight('a')).toBeUndefined()
      expect(tree.getSymbolWeight('h')).toBeUndefined()
      tree.update('x')
      expect(tree.contains('x')).toBe(true)
      expect(tree.getSymbolWeight('x')).toBe(1)
    })

    it('should reset treeHeight to 1', () => {
      tree.update('a')
      tree.update('b')
      tree.update('c')
      expect(tree.stats().treeHeight).toBeGreaterThan(1)
      tree.reset()
      expect(tree.stats().treeHeight).toBe(1)
    })
  })

  describe('encode/decode consistency', () => {
    it('should produce same result for same input on fresh trees', () => {
      const enc1 = new AdaptiveHuffman()
      const bits1 = enc1.encode('test')
      const enc2 = new AdaptiveHuffman()
      const bits2 = enc2.encode('test')
      expect(bits1).toEqual(bits2)
    })

    it('should handle roundtrip with many unique chars', () => {
      const str = 'abcdefghijklmnopqrstuvwxyz'
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })

    it('should handle roundtrip with numeric string', () => {
      const str = '3.14159265358979323846'
      const enc = new AdaptiveHuffman()
      const dec = new AdaptiveHuffman()
      const bits = enc.encode(str)
      expect(dec.decode([...bits])).toBe(str)
    })
  })
})

const SYMBOL_BITS = 8
