import { describe, it, expect } from 'vitest'
import { RopePersistent } from '../../src/core/rope-persistent/rope-persistent.js'
import { DEFAULT_LEAF_SIZE } from '../../src/core/rope-persistent/types.js'
import type { PersistentRopeNode } from '../../src/core/rope-persistent/types.js'

describe('RopePersistent', () => {
  describe('constructor', () => {
    it('should create empty rope with no arguments', () => {
      const rope = new RopePersistent()
      expect(rope.toString()).toBe('')
      expect(rope.length()).toBe(0)
    })

    it('should create rope from initial text', () => {
      const rope = new RopePersistent('hello')
      expect(rope.toString()).toBe('hello')
      expect(rope.length()).toBe(5)
    })

    it('should create rope with custom leaf size', () => {
      const rope = new RopePersistent('hello world test', 4)
      expect(rope.toString()).toBe('hello world test')
    })

    it('should create rope with empty string', () => {
      const rope = new RopePersistent('')
      expect(rope.isEmpty()).toBe(true)
      expect(rope.length()).toBe(0)
    })

    it('should handle long text in constructor', () => {
      const text = 'abcdefghijklmnopqrstuvwxyz'
      const rope = new RopePersistent(text)
      expect(rope.toString()).toBe(text)
      expect(rope.length()).toBe(26)
    })

    it('should split long strings into balanced tree', () => {
      const rope = new RopePersistent('abcdefghijkl', 3)
      expect(rope.charAt(0)).toBe('a')
      expect(rope.charAt(11)).toBe('l')
      expect(rope.toString()).toBe('abcdefghijkl')
    })

    it('should create rope with single character', () => {
      const rope = new RopePersistent('x')
      expect(rope.toString()).toBe('x')
      expect(rope.length()).toBe(1)
    })

    it('should create rope with unicode text', () => {
      const rope = new RopePersistent('café résumé')
      expect(rope.toString()).toBe('café résumé')
      expect(rope.length()).toBe(11)
    })
  })

  describe('fromString', () => {
    it('should create rope from string', () => {
      const rope = RopePersistent.fromString('hello world')
      expect(rope.toString()).toBe('hello world')
    })

    it('should create rope from empty string', () => {
      const rope = RopePersistent.fromString('')
      expect(rope.isEmpty()).toBe(true)
    })

    it('should create rope with custom leaf size', () => {
      const rope = RopePersistent.fromString('abcdefgh', 2)
      expect(rope.toString()).toBe('abcdefgh')
    })

    it('should create independent ropes', () => {
      const a = RopePersistent.fromString('hello')
      const b = RopePersistent.fromString(' world')
      expect(a.concat(b).toString()).toBe('hello world')
      expect(a.toString()).toBe('hello')
    })
  })

  describe('concat', () => {
    it('should concatenate two ropes', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent(' world')
      const result = a.concat(b)
      expect(result.toString()).toBe('hello world')
    })

    it('should not modify original ropes', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent(' world')
      a.concat(b)
      expect(a.toString()).toBe('hello')
      expect(b.toString()).toBe(' world')
    })

    it('should handle concat with empty rope (left)', () => {
      const a = new RopePersistent()
      const b = new RopePersistent('world')
      const result = a.concat(b)
      expect(result.toString()).toBe('world')
    })

    it('should handle concat with empty rope (right)', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent()
      const result = a.concat(b)
      expect(result.toString()).toBe('hello')
    })

    it('should handle two empty ropes', () => {
      const a = new RopePersistent()
      const b = new RopePersistent()
      const result = a.concat(b)
      expect(result.toString()).toBe('')
      expect(result.length()).toBe(0)
    })

    it('should return independent result', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent(' world')
      const result = a.concat(b)
      const modified = result.insert(5, ' beautiful')
      expect(result.toString()).toBe('hello world')
      expect(modified.toString()).toBe('hello beautiful world')
    })

    it('should produce correct length', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent(' world')
      expect(a.concat(b).length()).toBe(11)
    })

    it('should handle multiple concat calls', () => {
      const a = new RopePersistent('a')
      const b = new RopePersistent('b')
      const c = new RopePersistent('c')
      expect(a.concat(b).concat(c).toString()).toBe('abc')
    })

    it('should handle concat with long strings', () => {
      const a = new RopePersistent('a'.repeat(50))
      const b = new RopePersistent('b'.repeat(50))
      const result = a.concat(b)
      expect(result.toString()).toBe('a'.repeat(50) + 'b'.repeat(50))
      expect(result.length()).toBe(100)
    })
  })

  describe('split', () => {
    it('should split at middle', () => {
      const rope = new RopePersistent('hello world')
      const [left, right] = rope.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe(' world')
    })

    it('should split at beginning', () => {
      const rope = new RopePersistent('hello')
      const [left, right] = rope.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('should split at end', () => {
      const rope = new RopePersistent('hello')
      const [left, right] = rope.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('should not modify original', () => {
      const rope = new RopePersistent('hello world')
      rope.split(5)
      expect(rope.toString()).toBe('hello world')
    })

    it('should produce correct lengths', () => {
      const rope = new RopePersistent('hello world')
      const [left, right] = rope.split(5)
      expect(left.length()).toBe(5)
      expect(right.length()).toBe(6)
    })

    it('should clamp negative index to 0', () => {
      const rope = new RopePersistent('hello')
      const [left, right] = rope.split(-1)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('should clamp index beyond length', () => {
      const rope = new RopePersistent('hello')
      const [left, right] = rope.split(100)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('should produce independent ropes', () => {
      const rope = new RopePersistent('hello world')
      const [left, right] = rope.split(5)
      const leftModified = left.concat(new RopePersistent('!'))
      const rightModified = right.concat(new RopePersistent('!'))
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe(' world')
      expect(leftModified.toString()).toBe('hello!')
      expect(rightModified.toString()).toBe(' world!')
    })

    it('should split at index 1', () => {
      const rope = new RopePersistent('hello')
      const [left, right] = rope.split(1)
      expect(left.toString()).toBe('h')
      expect(right.toString()).toBe('ello')
    })

    it('should split empty rope', () => {
      const rope = new RopePersistent()
      const [left, right] = rope.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('')
    })
  })

  describe('insert', () => {
    it('should insert at beginning', () => {
      const rope = new RopePersistent('world')
      const result = rope.insert(0, 'hello ')
      expect(result.toString()).toBe('hello world')
      expect(rope.toString()).toBe('world')
    })

    it('should insert in middle', () => {
      const rope = new RopePersistent('helloworld')
      const result = rope.insert(5, ' ')
      expect(result.toString()).toBe('hello world')
    })

    it('should insert at end', () => {
      const rope = new RopePersistent('hello')
      const result = rope.insert(5, ' world')
      expect(result.toString()).toBe('hello world')
    })

    it('should clamp negative index to 0', () => {
      const rope = new RopePersistent('world')
      const result = rope.insert(-1, 'hello ')
      expect(result.toString()).toBe('hello world')
    })

    it('should clamp index beyond length', () => {
      const rope = new RopePersistent('hello')
      const result = rope.insert(100, ' world')
      expect(result.toString()).toBe('hello world')
    })

    it('should return same rope for empty insert', () => {
      const rope = new RopePersistent('hello')
      const result = rope.insert(3, '')
      expect(result.toString()).toBe('hello')
    })

    it('should insert into empty rope', () => {
      const rope = new RopePersistent()
      const result = rope.insert(0, 'hello')
      expect(result.toString()).toBe('hello')
    })

    it('should handle multiple inserts', () => {
      const rope = new RopePersistent('hllo')
      const r1 = rope.insert(1, 'e')
      const r2 = r1.insert(5, ' world')
      expect(rope.toString()).toBe('hllo')
      expect(r1.toString()).toBe('hello')
      expect(r2.toString()).toBe('hello world')
    })

    it('should preserve original on each insert', () => {
      const original = new RopePersistent('abc')
      const r1 = original.insert(1, 'X')
      const r2 = original.insert(2, 'Y')
      expect(original.toString()).toBe('abc')
      expect(r1.toString()).toBe('aXbc')
      expect(r2.toString()).toBe('abYc')
    })
  })

  describe('delete', () => {
    it('should delete from beginning', () => {
      const rope = new RopePersistent('hello world')
      const result = rope.delete(0, 6)
      expect(result.toString()).toBe('world')
      expect(rope.toString()).toBe('hello world')
    })

    it('should delete from middle', () => {
      const rope = new RopePersistent('hello world')
      const result = rope.delete(5, 11)
      expect(result.toString()).toBe('hello')
    })

    it('should delete from end', () => {
      const rope = new RopePersistent('hello world')
      const result = rope.delete(5, 100)
      expect(result.toString()).toBe('hello')
    })

    it('should delete entire string', () => {
      const rope = new RopePersistent('hello')
      const result = rope.delete(0, 5)
      expect(result.toString()).toBe('')
      expect(result.isEmpty()).toBe(true)
    })

    it('should return same rope for start beyond length', () => {
      const rope = new RopePersistent('hello')
      const result = rope.delete(100, 105)
      expect(result.toString()).toBe('hello')
    })

    it('should return same rope for equal start and end', () => {
      const rope = new RopePersistent('hello')
      const result = rope.delete(0, 0)
      expect(result.toString()).toBe('hello')
    })

    it('should clamp negative start to 0', () => {
      const rope = new RopePersistent('hello')
      const result = rope.delete(-1, 3)
      expect(result.toString()).toBe('lo')
    })

    it('should handle delete with clamped range', () => {
      const rope = new RopePersistent('hello')
      const result = rope.delete(3, 100)
      expect(result.toString()).toBe('hel')
    })

    it('should preserve original', () => {
      const rope = new RopePersistent('hello world')
      const r1 = rope.delete(0, 6)
      const r2 = rope.delete(5, 11)
      expect(rope.toString()).toBe('hello world')
      expect(r1.toString()).toBe('world')
      expect(r2.toString()).toBe('hello')
    })

    it('should handle negative end', () => {
      const rope = new RopePersistent('hello')
      const result = rope.delete(0, -1)
      expect(result.toString()).toBe('hello')
    })
  })

  describe('substring', () => {
    it('should return substring with both args', () => {
      const rope = new RopePersistent('hello world')
      expect(rope.substring(0, 5)).toBe('hello')
    })

    it('should return empty for equal start and end', () => {
      const rope = new RopePersistent('hello')
      expect(rope.substring(2, 2)).toBe('')
    })

    it('should swap start and end when start > end', () => {
      const rope = new RopePersistent('hello')
      expect(rope.substring(3, 1)).toBe('el')
    })

    it('should clamp negative start', () => {
      const rope = new RopePersistent('hello')
      expect(rope.substring(-1, 3)).toBe('hel')
    })

    it('should clamp end beyond length', () => {
      const rope = new RopePersistent('hello')
      expect(rope.substring(2, 100)).toBe('llo')
    })

    it('should return empty for start beyond length', () => {
      const rope = new RopePersistent('hello')
      expect(rope.substring(100, 200)).toBe('')
    })

    it('should return empty for empty rope', () => {
      const rope = new RopePersistent()
      expect(rope.substring(0, 5)).toBe('')
    })

    it('should work with long balanced rope', () => {
      const rope = new RopePersistent('abcdefghijklmnopqrstuvwxyz', 4)
      expect(rope.substring(3, 10)).toBe('defghij')
    })
  })

  describe('charAt', () => {
    it('should return character at valid index', () => {
      const rope = new RopePersistent('hello')
      expect(rope.charAt(0)).toBe('h')
      expect(rope.charAt(4)).toBe('o')
    })

    it('should return character at index 0', () => {
      const rope = new RopePersistent('hello')
      expect(rope.charAt(0)).toBe('h')
    })

    it('should return character at last index', () => {
      const rope = new RopePersistent('hello')
      expect(rope.charAt(4)).toBe('o')
    })

    it('should return empty for negative index', () => {
      const rope = new RopePersistent('hello')
      expect(rope.charAt(-1)).toBe('')
    })

    it('should return empty for out of bounds index', () => {
      const rope = new RopePersistent('hello')
      expect(rope.charAt(5)).toBe('')
      expect(rope.charAt(100)).toBe('')
    })

    it('should return empty for empty rope', () => {
      const rope = new RopePersistent()
      expect(rope.charAt(0)).toBe('')
    })

    it('should work with long strings', () => {
      const rope = new RopePersistent('abcdefghijklmnopqrstuvwxyz')
      expect(rope.charAt(0)).toBe('a')
      expect(rope.charAt(25)).toBe('z')
      expect(rope.charAt(13)).toBe('n')
    })

    it('should work after persistent operations', () => {
      const rope = new RopePersistent('hello')
      const r2 = rope.concat(new RopePersistent(' world'))
      expect(r2.charAt(5)).toBe(' ')
    })
  })

  describe('indexOf', () => {
    it('should find string at beginning', () => {
      const rope = new RopePersistent('hello world')
      expect(rope.indexOf('hello')).toBe(0)
    })

    it('should find string in middle', () => {
      const rope = new RopePersistent('hello world')
      expect(rope.indexOf('world')).toBe(6)
    })

    it('should find string at end', () => {
      const rope = new RopePersistent('hello world')
      expect(rope.indexOf('orld')).toBe(7)
    })

    it('should return -1 when not found', () => {
      const rope = new RopePersistent('hello world')
      expect(rope.indexOf('xyz')).toBe(-1)
    })

    it('should find with fromIndex', () => {
      const rope = new RopePersistent('abcabc')
      expect(rope.indexOf('abc', 1)).toBe(3)
    })

    it('should return 0 for empty search string', () => {
      const rope = new RopePersistent('hello')
      expect(rope.indexOf('')).toBe(0)
    })

    it('should return fromIndex for empty search with fromIndex', () => {
      const rope = new RopePersistent('hello')
      expect(rope.indexOf('', 3)).toBe(3)
    })

    it('should find single character', () => {
      const rope = new RopePersistent('hello')
      expect(rope.indexOf('e')).toBe(1)
    })
  })

  describe('lastIndexOf', () => {
    it('should find last occurrence', () => {
      const rope = new RopePersistent('abcabc')
      expect(rope.lastIndexOf('abc')).toBe(3)
    })

    it('should return -1 when not found', () => {
      const rope = new RopePersistent('hello')
      expect(rope.lastIndexOf('xyz')).toBe(-1)
    })

    it('should find with fromIndex', () => {
      const rope = new RopePersistent('abcabc')
      expect(rope.lastIndexOf('abc', 4)).toBe(3)
    })

    it('should return -1 for empty rope', () => {
      const rope = new RopePersistent()
      expect(rope.lastIndexOf('a')).toBe(-1)
    })

    it('should find last occurrence of single char', () => {
      const rope = new RopePersistent('hello')
      expect(rope.lastIndexOf('l')).toBe(3)
    })

    it('should return length for empty search', () => {
      const rope = new RopePersistent('hello')
      expect(rope.lastIndexOf('')).toBe(5)
    })
  })

  describe('length', () => {
    it('should return 0 for empty rope', () => {
      const rope = new RopePersistent()
      expect(rope.length()).toBe(0)
    })

    it('should return correct length', () => {
      const rope = new RopePersistent('hello')
      expect(rope.length()).toBe(5)
    })

    it('should be correct after concat', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent(' world')
      expect(a.concat(b).length()).toBe(11)
    })

    it('should be correct after delete', () => {
      const rope = new RopePersistent('hello world')
      expect(rope.delete(0, 6).length()).toBe(5)
    })

    it('should be correct after insert', () => {
      const rope = new RopePersistent('hello')
      expect(rope.insert(5, ' world').length()).toBe(11)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new empty rope', () => {
      const rope = new RopePersistent()
      expect(rope.isEmpty()).toBe(true)
    })

    it('should return false for non-empty rope', () => {
      const rope = new RopePersistent('hello')
      expect(rope.isEmpty()).toBe(false)
    })

    it('should return true after deleting all content', () => {
      const rope = new RopePersistent('hello')
      expect(rope.delete(0, 5).isEmpty()).toBe(true)
    })

    it('should return false for single character', () => {
      const rope = new RopePersistent('x')
      expect(rope.isEmpty()).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return empty string for empty rope', () => {
      const rope = new RopePersistent()
      expect(rope.toString()).toBe('')
    })

    it('should return text content', () => {
      const rope = new RopePersistent('hello')
      expect(rope.toString()).toBe('hello')
    })

    it('should reconstruct after concat', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent(' ')
      const c = new RopePersistent('world')
      expect(a.concat(b).concat(c).toString()).toBe('hello world')
    })

    it('should match original input', () => {
      const text = 'The quick brown fox jumps over the lazy dog'
      const rope = new RopePersistent(text)
      expect(rope.toString()).toBe(text)
    })

    it('should handle long strings', () => {
      const text = 'a'.repeat(100)
      const rope = new RopePersistent(text)
      expect(rope.toString()).toBe(text)
    })
  })

  describe('equals', () => {
    it('should return true for equal ropes', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent('hello')
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different ropes', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent('world')
      expect(a.equals(b)).toBe(false)
    })

    it('should return true for two empty ropes', () => {
      const a = new RopePersistent()
      const b = new RopePersistent()
      expect(a.equals(b)).toBe(true)
    })

    it('should return true for same content different structure', () => {
      const a = new RopePersistent('hello world', 3)
      const b = new RopePersistent('hello world', 8)
      expect(a.equals(b)).toBe(true)
    })

    it('should be reflexive', () => {
      const rope = new RopePersistent('hello')
      expect(rope.equals(rope)).toBe(true)
    })

    it('should work after operations', () => {
      const a = new RopePersistent('hello').concat(new RopePersistent(' world'))
      const b = new RopePersistent('hello world')
      expect(a.equals(b)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should produce identical content', () => {
      const rope = new RopePersistent('hello world')
      const cloned = rope.clone()
      expect(cloned.toString()).toBe('hello world')
    })

    it('should be independent after insert', () => {
      const rope = new RopePersistent('hello')
      const cloned = rope.clone()
      const modified = cloned.insert(5, ' world')
      expect(rope.toString()).toBe('hello')
      expect(cloned.toString()).toBe('hello')
      expect(modified.toString()).toBe('hello world')
    })

    it('should clone empty rope', () => {
      const rope = new RopePersistent()
      const cloned = rope.clone()
      expect(cloned.toString()).toBe('')
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve leaf size', () => {
      const rope = new RopePersistent('hello', 2)
      const cloned = rope.clone()
      expect(cloned.toString()).toBe('hello')
    })

    it('should maintain correct length on clone', () => {
      const rope = new RopePersistent('hello')
      const cloned = rope.clone()
      expect(cloned.length()).toBe(5)
    })

    it('should preserve original through delete', () => {
      const rope = new RopePersistent('hello world')
      const cloned = rope.clone()
      cloned.delete(0, 6)
      expect(rope.toString()).toBe('hello world')
      expect(cloned.toString()).toBe('hello world')
    })
  })

  describe('depth', () => {
    it('should return 0 for empty rope', () => {
      const rope = new RopePersistent()
      expect(rope.depth()).toBe(0)
    })

    it('should return 0 for single leaf', () => {
      const rope = new RopePersistent('hello')
      expect(rope.depth()).toBe(0)
    })

    it('should return positive depth for multi-level tree', () => {
      const rope = new RopePersistent('abcdefghijklmnopqrstuvwxyz', 4)
      expect(rope.depth()).toBeGreaterThan(0)
    })

    it('should increase with smaller leaf size', () => {
      const text = 'abcdefghijklmnopqrstuvwxyz'
      const a = new RopePersistent(text, 8)
      const b = new RopePersistent(text, 2)
      expect(b.depth()).toBeGreaterThanOrEqual(a.depth())
    })
  })

  describe('balance', () => {
    it('should preserve content after balance', () => {
      const rope = new RopePersistent('hello world')
      const balanced = rope.balance()
      expect(balanced.toString()).toBe('hello world')
    })

    it('should preserve empty rope', () => {
      const rope = new RopePersistent()
      const balanced = rope.balance()
      expect(balanced.toString()).toBe('')
      expect(balanced.length()).toBe(0)
    })

    it('should return independent rope', () => {
      const rope = new RopePersistent('hello world')
      const balanced = rope.balance()
      const modified = balanced.insert(5, '!')
      expect(balanced.toString()).toBe('hello world')
      expect(modified.toString()).toBe('hello! world')
    })

    it('should preserve length', () => {
      const rope = new RopePersistent('abcdefghijklmnopqrstuvwxyz')
      const balanced = rope.balance()
      expect(balanced.length()).toBe(rope.length())
    })

    it('should preserve leaf size', () => {
      const rope = new RopePersistent('hello world', 4)
      const balanced = rope.balance()
      expect(balanced.toString()).toBe('hello world')
    })

    it('should handle single character', () => {
      const rope = new RopePersistent('x')
      const balanced = rope.balance()
      expect(balanced.toString()).toBe('x')
    })
  })

  describe('forEach', () => {
    it('should iterate over all characters', () => {
      const rope = new RopePersistent('hello')
      const chars: string[] = []
      rope.forEach((char) => chars.push(char))
      expect(chars).toEqual(['h', 'e', 'l', 'l', 'o'])
    })

    it('should provide correct indices', () => {
      const rope = new RopePersistent('abc')
      const indices: number[] = []
      rope.forEach((_char, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should not iterate over empty rope', () => {
      const rope = new RopePersistent()
      let count = 0
      rope.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate single character', () => {
      const rope = new RopePersistent('x')
      const chars: string[] = []
      rope.forEach((char) => chars.push(char))
      expect(chars).toEqual(['x'])
    })

    it('should iterate long rope', () => {
      const rope = new RopePersistent('abcdefghijklmnopqrstuvwxyz', 4)
      const chars: string[] = []
      rope.forEach((char) => chars.push(char))
      expect(chars.join('')).toBe('abcdefghijklmnopqrstuvwxyz')
    })
  })

  describe('map', () => {
    it('should map characters to new values', () => {
      const rope = new RopePersistent('hello')
      const result = rope.map((char) => char.toUpperCase())
      expect(result.toString()).toBe('HELLO')
    })

    it('should provide correct indices', () => {
      const rope = new RopePersistent('abc')
      const result = rope.map((_char, index) => String(index))
      expect(result.toString()).toBe('012')
    })

    it('should handle empty rope', () => {
      const rope = new RopePersistent()
      const result = rope.map((char) => char.toUpperCase())
      expect(result.toString()).toBe('')
    })

    it('should return independent rope', () => {
      const rope = new RopePersistent('hello')
      const mapped = rope.map((char) => char.toUpperCase())
      expect(rope.toString()).toBe('hello')
      expect(mapped.toString()).toBe('HELLO')
    })

    it('should handle map that returns multi-char strings', () => {
      const rope = new RopePersistent('ab')
      const result = rope.map((char) => char + char)
      expect(result.toString()).toBe('aabb')
    })
  })

  describe('reverse', () => {
    it('should reverse a string', () => {
      const rope = new RopePersistent('hello')
      const reversed = rope.reverse()
      expect(reversed.toString()).toBe('olleh')
    })

    it('should not modify original', () => {
      const rope = new RopePersistent('hello')
      rope.reverse()
      expect(rope.toString()).toBe('hello')
    })

    it('should reverse empty rope', () => {
      const rope = new RopePersistent()
      const reversed = rope.reverse()
      expect(reversed.toString()).toBe('')
    })

    it('should reverse single character', () => {
      const rope = new RopePersistent('x')
      const reversed = rope.reverse()
      expect(reversed.toString()).toBe('x')
    })

    it('should reverse palindrome', () => {
      const rope = new RopePersistent('racecar')
      const reversed = rope.reverse()
      expect(reversed.toString()).toBe('racecar')
    })

    it('should be double-reversible', () => {
      const rope = new RopePersistent('hello world')
      const doubleReversed = rope.reverse().reverse()
      expect(doubleReversed.toString()).toBe('hello world')
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over characters', () => {
      const rope = new RopePersistent('hello')
      const chars = [...rope]
      expect(chars).toEqual(['h', 'e', 'l', 'l', 'o'])
    })

    it('should iterate over empty rope', () => {
      const rope = new RopePersistent()
      const chars = [...rope]
      expect(chars).toEqual([])
    })

    it('should iterate over single character', () => {
      const rope = new RopePersistent('x')
      const chars = [...rope]
      expect(chars).toEqual(['x'])
    })

    it('should iterate over long string', () => {
      const text = 'abcdefghijklmnopqrstuvwxyz'
      const rope = new RopePersistent(text, 4)
      const chars = [...rope]
      expect(chars.join('')).toBe(text)
    })

    it('should work with for...of loop', () => {
      const rope = new RopePersistent('abc')
      const result: string[] = []
      for (const ch of rope) {
        result.push(ch)
      }
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('should work with spread operator', () => {
      const rope = new RopePersistent('test')
      expect([...rope].length).toBe(4)
    })

    it('should work with concat result', () => {
      const a = new RopePersistent('abc')
      const b = new RopePersistent('def')
      const combined = a.concat(b)
      expect([...combined].join('')).toBe('abcdef')
    })

    it('should work with split results', () => {
      const rope = new RopePersistent('hello world')
      const [left, right] = rope.split(5)
      expect([...left]).toEqual(['h', 'e', 'l', 'l', 'o'])
      expect([...right]).toEqual([' ', 'w', 'o', 'r', 'l', 'd'])
    })
  })

  describe('persistence (immutability)', () => {
    it('should preserve original after concat', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent(' world')
      a.concat(b)
      expect(a.toString()).toBe('hello')
      expect(b.toString()).toBe(' world')
    })

    it('should preserve original after split', () => {
      const rope = new RopePersistent('hello world')
      rope.split(5)
      expect(rope.toString()).toBe('hello world')
    })

    it('should preserve original after insert', () => {
      const rope = new RopePersistent('hello')
      rope.insert(5, ' world')
      expect(rope.toString()).toBe('hello')
    })

    it('should preserve original after delete', () => {
      const rope = new RopePersistent('hello world')
      rope.delete(0, 6)
      expect(rope.toString()).toBe('hello world')
    })

    it('should create new rope for each operation', () => {
      const r0 = new RopePersistent('abc')
      const r1 = r0.insert(3, 'd')
      const r2 = r1.delete(0, 1)
      const r3 = r2.concat(new RopePersistent('e'))
      expect(r0.toString()).toBe('abc')
      expect(r1.toString()).toBe('abcd')
      expect(r2.toString()).toBe('bcd')
      expect(r3.toString()).toBe('bcde')
    })

    it('should share structure across versions', () => {
      const base = new RopePersistent('hello world')
      const v1 = base.insert(5, ' beautiful')
      const v2 = base.delete(5, 11)
      expect(base.toString()).toBe('hello world')
      expect(v1.toString()).toBe('hello beautiful world')
      expect(v2.toString()).toBe('hello')
    })
  })

  describe('combined operations', () => {
    it('should handle insert followed by delete', () => {
      const rope = new RopePersistent('hello world')
      const r1 = rope.insert(5, ' beautiful')
      const r2 = r1.delete(0, 5)
      expect(r2.toString()).toBe(' beautiful world')
    })

    it('should handle split then concat roundtrip', () => {
      const original = new RopePersistent('hello world')
      const [left, right] = original.split(5)
      const rejoined = left.concat(right)
      expect(rejoined.toString()).toBe('hello world')
    })

    it('should handle concat split roundtrip', () => {
      const a = new RopePersistent('hello')
      const b = new RopePersistent(' world')
      const combined = a.concat(b)
      const [left, right] = combined.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe(' world')
    })

    it('should handle insert delete roundtrip', () => {
      const rope = new RopePersistent('hello')
      const inserted = rope.insert(2, 'XX')
      const deleted = inserted.delete(2, 4)
      expect(deleted.toString()).toBe('hello')
    })

    it('should handle long text with small leaf size', () => {
      const rope = new RopePersistent('abcdefghijklmnopqrstuvwxyz', 4)
      expect(rope.charAt(0)).toBe('a')
      expect(rope.charAt(25)).toBe('z')
      expect(rope.substring(5, 10)).toBe('fghij')
      const r2 = rope.insert(13, '-')
      expect(r2.toString()).toBe('abcdefghijklm-nopqrstuvwxyz')
    })

    it('should handle reverse then insert', () => {
      const rope = new RopePersistent('hello')
      const reversed = rope.reverse()
      const result = reversed.insert(5, ' world')
      expect(rope.toString()).toBe('hello')
      expect(reversed.toString()).toBe('olleh')
      expect(result.toString()).toBe('olleh world')
    })

    it('should handle map then reverse', () => {
      const rope = new RopePersistent('hello')
      const upper = rope.map((c) => c.toUpperCase())
      const reversed = upper.reverse()
      expect(reversed.toString()).toBe('OLLEH')
    })

    it('should handle balance then operations', () => {
      const rope = new RopePersistent('hello world')
      const balanced = rope.balance()
      const result = balanced.insert(5, ' beautiful')
      expect(result.toString()).toBe('hello beautiful world')
    })

    it('should handle multiple splits', () => {
      const rope = new RopePersistent('hello world foo bar')
      const [a, rest] = rope.split(5)
      const [b, rest2] = rest.split(6)
      const [c, d] = rest2.split(4)
      expect(a.toString()).toBe('hello')
      expect(b.toString()).toBe(' world')
      expect(c.toString()).toBe(' foo')
      expect(d.toString()).toBe(' bar')
    })

    it('should handle repeated operations', () => {
      let rope = new RopePersistent()
      for (let i = 0; i < 20; i++) {
        rope = rope.insert(rope.length(), String.fromCharCode(97 + i))
      }
      expect(rope.toString()).toBe('abcdefghijklmnopqrst')
      expect(rope.length()).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('should handle unicode characters', () => {
      const rope = new RopePersistent('café')
      expect(rope.toString()).toBe('café')
      expect(rope.charAt(3)).toBe('é')
      expect(rope.substring(0, 3)).toBe('caf')
      expect(rope.indexOf('fé')).toBe(2)
    })

    it('should handle very long string', () => {
      const text = 'ab'.repeat(500)
      const rope = new RopePersistent(text, 4)
      expect(rope.toString()).toBe(text)
      expect(rope.length()).toBe(1000)
    })

    it('should handle whitespace', () => {
      const rope = new RopePersistent('   hello   world   ')
      expect(rope.indexOf('hello')).toBe(3)
      expect(rope.substring(3, 8)).toBe('hello')
    })

    it('should handle newlines', () => {
      const rope = new RopePersistent('line1\nline2\nline3')
      expect(rope.indexOf('line2')).toBe(6)
      expect(rope.substring(0, 5)).toBe('line1')
    })

    it('should handle single character rope', () => {
      const rope = new RopePersistent('x')
      expect(rope.length()).toBe(1)
      expect(rope.charAt(0)).toBe('x')
      expect(rope.isEmpty()).toBe(false)
    })

    it('should handle special characters', () => {
      const rope = new RopePersistent('hello\nworld\t!')
      expect(rope.toString()).toBe('hello\nworld\t!')
    })

    it('should handle tab characters', () => {
      const rope = new RopePersistent('a\tb\tc')
      expect(rope.charAt(1)).toBe('\t')
      expect(rope.indexOf('\t')).toBe(1)
    })
  })

  describe('type exports', () => {
    it('should have correct DEFAULT_LEAF_SIZE', () => {
      expect(DEFAULT_LEAF_SIZE).toBe(8)
    })

    it('should support PersistentRopeNode as leaf', () => {
      const leaf: PersistentRopeNode = { kind: 'leaf', text: 'hello' }
      expect(leaf.kind).toBe('leaf')
      expect(leaf.text).toBe('hello')
    })

    it('should support PersistentRopeNode as internal', () => {
      const internal: PersistentRopeNode = {
        kind: 'internal',
        left: { kind: 'leaf', text: 'he' },
        right: { kind: 'leaf', text: 'llo' },
        length: 5,
      }
      expect(internal.kind).toBe('internal')
      expect(internal.length).toBe(5)
    })

    it('should support nested PersistentRopeNode', () => {
      const nested: PersistentRopeNode = {
        kind: 'internal',
        left: {
          kind: 'internal',
          left: { kind: 'leaf', text: 'h' },
          right: { kind: 'leaf', text: 'e' },
          length: 2,
        },
        right: { kind: 'leaf', text: 'llo' },
        length: 5,
      }
      expect(nested.kind).toBe('internal')
    })
  })
})
