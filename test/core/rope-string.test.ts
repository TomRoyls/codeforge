import { describe, it, expect, beforeEach } from 'vitest'
import { RopeString } from '../../src/core/rope-string/rope-string.js'
import { DEFAULT_ROPE_OPTIONS } from '../../src/core/rope-string/types.js'
import type { RopeOptions, RopeNode, RopeStats } from '../../src/core/rope-string/types.js'

describe('RopeString', () => {
  describe('constructor', () => {
    it('should create empty rope with no arguments', () => {
      const rope = new RopeString()
      expect(rope.toString()).toBe('')
      expect(rope.length()).toBe(0)
    })

    it('should create rope from initial text', () => {
      const rope = new RopeString('hello')
      expect(rope.toString()).toBe('hello')
      expect(rope.length()).toBe(5)
    })

    it('should create rope with custom options', () => {
      const rope = new RopeString('hello world test', { leafMaxSize: 4 })
      expect(rope.toString()).toBe('hello world test')
    })

    it('should create rope with empty string', () => {
      const rope = new RopeString('')
      expect(rope.isEmpty()).toBe(true)
      expect(rope.length()).toBe(0)
    })

    it('should handle long text in constructor', () => {
      const text = 'abcdefghijklmnopqrstuvwxyz'
      const rope = new RopeString(text)
      expect(rope.toString()).toBe(text)
      expect(rope.length()).toBe(26)
    })

    it('should create rope with partial options', () => {
      const rope = new RopeString('test', { leafMaxSize: 2 })
      expect(rope.toString()).toBe('test')
    })

    it('should split long strings into balanced tree', () => {
      const rope = new RopeString('abcdefghijkl', { leafMaxSize: 3 })
      expect(rope.charAt(0)).toBe('a')
      expect(rope.charAt(11)).toBe('l')
      expect(rope.toString()).toBe('abcdefghijkl')
    })
  })

  describe('append', () => {
    let rope: RopeString

    beforeEach(() => {
      rope = new RopeString()
    })

    it('should append text to empty rope', () => {
      rope.append('hello')
      expect(rope.toString()).toBe('hello')
    })

    it('should append text to existing rope', () => {
      const r = new RopeString('hello')
      r.append(' world')
      expect(r.toString()).toBe('hello world')
    })

    it('should append empty string without change', () => {
      const r = new RopeString('hello')
      r.append('')
      expect(r.toString()).toBe('hello')
    })

    it('should handle multiple appends', () => {
      rope.append('a')
      rope.append('b')
      rope.append('c')
      expect(rope.toString()).toBe('abc')
    })

    it('should handle appending long text', () => {
      const r = new RopeString('hello')
      r.append(' world this is a longer string')
      expect(r.toString()).toBe('hello world this is a longer string')
    })

    it('should maintain correct length after append', () => {
      const r = new RopeString('hi')
      r.append(' there')
      expect(r.length()).toBe(8)
    })

    it('should append single character', () => {
      rope.append('x')
      expect(rope.toString()).toBe('x')
      expect(rope.length()).toBe(1)
    })

    it('should append special characters', () => {
      rope.append('hello\nworld\t!')
      expect(rope.toString()).toBe('hello\nworld\t!')
    })
  })

  describe('prepend', () => {
    it('should prepend text to empty rope', () => {
      const rope = new RopeString()
      rope.prepend('hello')
      expect(rope.toString()).toBe('hello')
    })

    it('should prepend text to existing rope', () => {
      const rope = new RopeString('world')
      rope.prepend('hello ')
      expect(rope.toString()).toBe('hello world')
    })

    it('should prepend empty string without change', () => {
      const rope = new RopeString('hello')
      rope.prepend('')
      expect(rope.toString()).toBe('hello')
    })

    it('should handle multiple prepends', () => {
      const rope = new RopeString('c')
      rope.prepend('b')
      rope.prepend('a')
      expect(rope.toString()).toBe('abc')
    })

    it('should prepend single character', () => {
      const rope = new RopeString('bc')
      rope.prepend('a')
      expect(rope.toString()).toBe('abc')
    })

    it('should handle prepend and append combined', () => {
      const rope = new RopeString('middle')
      rope.prepend('start ')
      rope.append(' end')
      expect(rope.toString()).toBe('start middle end')
    })

    it('should maintain correct length after prepend', () => {
      const rope = new RopeString('world')
      rope.prepend('hello ')
      expect(rope.length()).toBe(11)
    })

    it('should prepend long text', () => {
      const rope = new RopeString('world')
      rope.prepend('hello wonderful ')
      expect(rope.toString()).toBe('hello wonderful world')
    })
  })

  describe('insert', () => {
    it('should insert at beginning', () => {
      const rope = new RopeString('world')
      rope.insert(0, 'hello ')
      expect(rope.toString()).toBe('hello world')
    })

    it('should insert in middle', () => {
      const rope = new RopeString('helloworld')
      rope.insert(5, ' ')
      expect(rope.toString()).toBe('hello world')
    })

    it('should insert at end', () => {
      const rope = new RopeString('hello')
      rope.insert(5, ' world')
      expect(rope.toString()).toBe('hello world')
    })

    it('should insert at negative index (clamps to 0)', () => {
      const rope = new RopeString('world')
      rope.insert(-1, 'hello ')
      expect(rope.toString()).toBe('hello world')
    })

    it('should insert beyond end (clamps to length)', () => {
      const rope = new RopeString('hello')
      rope.insert(100, ' world')
      expect(rope.toString()).toBe('hello world')
    })

    it('should insert empty string without change', () => {
      const rope = new RopeString('hello')
      rope.insert(3, '')
      expect(rope.toString()).toBe('hello')
    })

    it('should insert into empty rope', () => {
      const rope = new RopeString()
      rope.insert(0, 'hello')
      expect(rope.toString()).toBe('hello')
    })

    it('should handle multiple inserts', () => {
      const rope = new RopeString('hllo')
      rope.insert(1, 'e')
      rope.insert(5, ' world')
      expect(rope.toString()).toBe('hello world')
    })
  })

  describe('delete', () => {
    it('should delete from beginning', () => {
      const rope = new RopeString('hello world')
      const deleted = rope.delete(0, 6)
      expect(deleted).toBe('hello ')
      expect(rope.toString()).toBe('world')
    })

    it('should delete from middle', () => {
      const rope = new RopeString('hello world')
      const deleted = rope.delete(5, 6)
      expect(deleted).toBe(' world')
      expect(rope.toString()).toBe('hello')
    })

    it('should delete from end', () => {
      const rope = new RopeString('hello world')
      const deleted = rope.delete(5, 100)
      expect(deleted).toBe(' world')
      expect(rope.toString()).toBe('hello')
    })

    it('should delete entire string', () => {
      const rope = new RopeString('hello')
      rope.delete(0, 5)
      expect(rope.toString()).toBe('')
      expect(rope.isEmpty()).toBe(true)
    })

    it('should return empty for out of range start', () => {
      const rope = new RopeString('hello')
      const deleted = rope.delete(100, 5)
      expect(deleted).toBe('')
      expect(rope.toString()).toBe('hello')
    })

    it('should return empty for zero length', () => {
      const rope = new RopeString('hello')
      const deleted = rope.delete(0, 0)
      expect(deleted).toBe('')
    })

    it('should return empty for negative length', () => {
      const rope = new RopeString('hello')
      const deleted = rope.delete(0, -1)
      expect(deleted).toBe('')
    })

    it('should handle negative start (clamps to 0)', () => {
      const rope = new RopeString('hello')
      const deleted = rope.delete(-1, 3)
      expect(deleted).toBe('hel')
      expect(rope.toString()).toBe('lo')
    })

    it('should return correct deleted text', () => {
      const rope = new RopeString('hello world')
      const deleted = rope.delete(2, 7)
      expect(deleted).toBe('llo wor')
      expect(rope.toString()).toBe('held')
    })

    it('should handle delete with clamped range', () => {
      const rope = new RopeString('hello')
      const deleted = rope.delete(3, 100)
      expect(deleted).toBe('lo')
      expect(rope.toString()).toBe('hel')
    })
  })

  describe('charAt', () => {
    it('should return character at valid index', () => {
      const rope = new RopeString('hello')
      expect(rope.charAt(0)).toBe('h')
      expect(rope.charAt(4)).toBe('o')
    })

    it('should return character at index 0', () => {
      const rope = new RopeString('hello')
      expect(rope.charAt(0)).toBe('h')
    })

    it('should return character at last index', () => {
      const rope = new RopeString('hello')
      expect(rope.charAt(4)).toBe('o')
    })

    it('should return empty for negative index', () => {
      const rope = new RopeString('hello')
      expect(rope.charAt(-1)).toBe('')
    })

    it('should return empty for out of bounds index', () => {
      const rope = new RopeString('hello')
      expect(rope.charAt(5)).toBe('')
      expect(rope.charAt(100)).toBe('')
    })

    it('should return empty for empty rope', () => {
      const rope = new RopeString()
      expect(rope.charAt(0)).toBe('')
    })

    it('should work with long strings', () => {
      const rope = new RopeString('abcdefghijklmnopqrstuvwxyz')
      expect(rope.charAt(0)).toBe('a')
      expect(rope.charAt(25)).toBe('z')
      expect(rope.charAt(13)).toBe('n')
    })

    it('should work after modifications', () => {
      const rope = new RopeString('hello')
      rope.append(' world')
      expect(rope.charAt(5)).toBe(' ')
    })
  })

  describe('substring', () => {
    it('should return substring with both args', () => {
      const rope = new RopeString('hello world')
      expect(rope.substring(0, 5)).toBe('hello')
    })

    it('should return from start to end when end omitted', () => {
      const rope = new RopeString('hello world')
      expect(rope.substring(6)).toBe('world')
    })

    it('should return full string with no args', () => {
      const rope = new RopeString('hello')
      expect(rope.substring(0)).toBe('hello')
    })

    it('should return empty for equal start and end', () => {
      const rope = new RopeString('hello')
      expect(rope.substring(2, 2)).toBe('')
    })

    it('should swap start and end when start > end', () => {
      const rope = new RopeString('hello')
      expect(rope.substring(3, 1)).toBe('el')
    })

    it('should clamp negative start', () => {
      const rope = new RopeString('hello')
      expect(rope.substring(-1, 3)).toBe('hel')
    })

    it('should clamp end beyond length', () => {
      const rope = new RopeString('hello')
      expect(rope.substring(2, 100)).toBe('llo')
    })

    it('should return empty for start beyond length', () => {
      const rope = new RopeString('hello')
      expect(rope.substring(100)).toBe('')
    })

    it('should work with long balanced rope', () => {
      const rope = new RopeString('abcdefghijklmnopqrstuvwxyz', { leafMaxSize: 4 })
      expect(rope.substring(3, 10)).toBe('defghij')
    })

    it('should return empty for empty rope', () => {
      const rope = new RopeString()
      expect(rope.substring(0, 5)).toBe('')
    })
  })

  describe('indexOf', () => {
    it('should find string at beginning', () => {
      const rope = new RopeString('hello world')
      expect(rope.indexOf('hello')).toBe(0)
    })

    it('should find string in middle', () => {
      const rope = new RopeString('hello world')
      expect(rope.indexOf('world')).toBe(6)
    })

    it('should find string at end', () => {
      const rope = new RopeString('hello world')
      expect(rope.indexOf('orld')).toBe(7)
    })

    it('should return -1 when not found', () => {
      const rope = new RopeString('hello world')
      expect(rope.indexOf('xyz')).toBe(-1)
    })

    it('should find with fromIndex', () => {
      const rope = new RopeString('abcabc')
      expect(rope.indexOf('abc', 1)).toBe(3)
    })

    it('should return 0 for empty search string', () => {
      const rope = new RopeString('hello')
      expect(rope.indexOf('')).toBe(0)
    })

    it('should return fromIndex for empty search with fromIndex', () => {
      const rope = new RopeString('hello')
      expect(rope.indexOf('', 3)).toBe(3)
    })

    it('should find single character', () => {
      const rope = new RopeString('hello')
      expect(rope.indexOf('e')).toBe(1)
    })
  })

  describe('toString', () => {
    it('should return empty string for empty rope', () => {
      const rope = new RopeString()
      expect(rope.toString()).toBe('')
    })

    it('should return text content', () => {
      const rope = new RopeString('hello')
      expect(rope.toString()).toBe('hello')
    })

    it('should reconstruct after modifications', () => {
      const rope = new RopeString('hello')
      rope.append(' ')
      rope.append('world')
      expect(rope.toString()).toBe('hello world')
    })

    it('should match original input', () => {
      const text = 'The quick brown fox jumps over the lazy dog'
      const rope = new RopeString(text)
      expect(rope.toString()).toBe(text)
    })

    it('should handle long strings', () => {
      const text = 'a'.repeat(100)
      const rope = new RopeString(text)
      expect(rope.toString()).toBe(text)
    })
  })

  describe('length', () => {
    it('should return 0 for empty rope', () => {
      const rope = new RopeString()
      expect(rope.length()).toBe(0)
    })

    it('should return correct length', () => {
      const rope = new RopeString('hello')
      expect(rope.length()).toBe(5)
    })

    it('should update after append', () => {
      const rope = new RopeString('hello')
      rope.append(' world')
      expect(rope.length()).toBe(11)
    })

    it('should update after delete', () => {
      const rope = new RopeString('hello world')
      rope.delete(0, 6)
      expect(rope.length()).toBe(5)
    })

    it('should update after clear', () => {
      const rope = new RopeString('hello')
      rope.clear()
      expect(rope.length()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new empty rope', () => {
      const rope = new RopeString()
      expect(rope.isEmpty()).toBe(true)
    })

    it('should return false after append', () => {
      const rope = new RopeString()
      rope.append('hello')
      expect(rope.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      const rope = new RopeString('hello')
      rope.clear()
      expect(rope.isEmpty()).toBe(true)
    })

    it('should return true after deleting all content', () => {
      const rope = new RopeString('hello')
      rope.delete(0, 5)
      expect(rope.isEmpty()).toBe(true)
    })
  })

  describe('split', () => {
    it('should split at middle', () => {
      const rope = new RopeString('hello world')
      const [left, right] = rope.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe(' world')
    })

    it('should split at beginning', () => {
      const rope = new RopeString('hello')
      const [left, right] = rope.split(0)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('should split at end', () => {
      const rope = new RopeString('hello')
      const [left, right] = rope.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('should not modify original', () => {
      const rope = new RopeString('hello world')
      rope.split(5)
      expect(rope.toString()).toBe('hello world')
    })

    it('should produce correct lengths', () => {
      const rope = new RopeString('hello world')
      const [left, right] = rope.split(5)
      expect(left.length()).toBe(5)
      expect(right.length()).toBe(6)
    })

    it('should handle split at negative index (clamps to 0)', () => {
      const rope = new RopeString('hello')
      const [left, right] = rope.split(-1)
      expect(left.toString()).toBe('')
      expect(right.toString()).toBe('hello')
    })

    it('should handle split beyond length (clamps to length)', () => {
      const rope = new RopeString('hello')
      const [left, right] = rope.split(100)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe('')
    })

    it('should produce independent ropes', () => {
      const rope = new RopeString('hello world')
      const [left, right] = rope.split(5)
      left.append('!')
      right.prepend('oh ')
      expect(left.toString()).toBe('hello!')
      expect(right.toString()).toBe('oh  world')
    })

    it('should handle split at index 1', () => {
      const rope = new RopeString('hello')
      const [left, right] = rope.split(1)
      expect(left.toString()).toBe('h')
      expect(right.toString()).toBe('ello')
    })
  })

  describe('clone', () => {
    it('should produce identical content', () => {
      const rope = new RopeString('hello world')
      const cloned = rope.clone()
      expect(cloned.toString()).toBe('hello world')
    })

    it('should be independent from original after append', () => {
      const rope = new RopeString('hello')
      const cloned = rope.clone()
      rope.append(' world')
      expect(cloned.toString()).toBe('hello')
    })

    it('should be independent from original after delete', () => {
      const rope = new RopeString('hello world')
      const cloned = rope.clone()
      rope.delete(0, 6)
      expect(cloned.toString()).toBe('hello world')
    })

    it('should be independent from original after insert', () => {
      const rope = new RopeString('hello world')
      const cloned = rope.clone()
      rope.insert(5, ' beautiful')
      expect(cloned.toString()).toBe('hello world')
    })

    it('should clone empty rope', () => {
      const rope = new RopeString()
      const cloned = rope.clone()
      expect(cloned.toString()).toBe('')
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should preserve options', () => {
      const rope = new RopeString('hello', { leafMaxSize: 2 })
      const cloned = rope.clone()
      cloned.append(' world')
      expect(cloned.toString()).toBe('hello world')
    })

    it('should maintain correct length on clone', () => {
      const rope = new RopeString('hello')
      const cloned = rope.clone()
      expect(cloned.length()).toBe(5)
    })

    it('should deep clone internal structure', () => {
      const rope = new RopeString('hello world this is a test', { leafMaxSize: 4 })
      const cloned = rope.clone()
      cloned.delete(0, 5)
      expect(rope.toString()).toBe('hello world this is a test')
      expect(cloned.toString()).toBe(' world this is a test')
    })
  })

  describe('clear', () => {
    it('should clear non-empty rope', () => {
      const rope = new RopeString('hello world')
      rope.clear()
      expect(rope.toString()).toBe('')
      expect(rope.length()).toBe(0)
      expect(rope.isEmpty()).toBe(true)
    })

    it('should clear already empty rope', () => {
      const rope = new RopeString()
      rope.clear()
      expect(rope.isEmpty()).toBe(true)
    })

    it('should allow operations after clear', () => {
      const rope = new RopeString('hello')
      rope.clear()
      rope.append('world')
      expect(rope.toString()).toBe('world')
    })

    it('should return void', () => {
      const rope = new RopeString('hello')
      expect(rope.clear()).toBeUndefined()
    })
  })

  describe('concat', () => {
    it('should concatenate two ropes', () => {
      const a = new RopeString('hello')
      const b = new RopeString(' world')
      const result = a.concat(b)
      expect(result.toString()).toBe('hello world')
    })

    it('should not modify original ropes', () => {
      const a = new RopeString('hello')
      const b = new RopeString(' world')
      a.concat(b)
      expect(a.toString()).toBe('hello')
      expect(b.toString()).toBe(' world')
    })

    it('should handle concat with empty rope', () => {
      const a = new RopeString('hello')
      const b = new RopeString()
      const result = a.concat(b)
      expect(result.toString()).toBe('hello')
    })

    it('should handle concat empty with non-empty', () => {
      const a = new RopeString()
      const b = new RopeString('world')
      const result = a.concat(b)
      expect(result.toString()).toBe('world')
    })

    it('should handle two empty ropes', () => {
      const a = new RopeString()
      const b = new RopeString()
      const result = a.concat(b)
      expect(result.toString()).toBe('')
      expect(result.length()).toBe(0)
    })

    it('should return independent result', () => {
      const a = new RopeString('hello')
      const b = new RopeString(' world')
      const result = a.concat(b)
      a.append('!')
      b.append('!')
      expect(result.toString()).toBe('hello world')
    })

    it('should produce correct length', () => {
      const a = new RopeString('hello')
      const b = new RopeString(' world')
      const result = a.concat(b)
      expect(result.length()).toBe(11)
    })

    it('should handle multiple concat calls', () => {
      const a = new RopeString('a')
      const b = new RopeString('b')
      const c = new RopeString('c')
      const result = a.concat(b).concat(c)
      expect(result.toString()).toBe('abc')
    })

    it('should handle concat with long strings', () => {
      const a = new RopeString('a'.repeat(50))
      const b = new RopeString('b'.repeat(50))
      const result = a.concat(b)
      expect(result.toString()).toBe('a'.repeat(50) + 'b'.repeat(50))
      expect(result.length()).toBe(100)
    })

    it('should handle concat then modify result', () => {
      const a = new RopeString('hello')
      const b = new RopeString(' world')
      const result = a.concat(b)
      result.insert(5, ' beautiful')
      expect(a.toString()).toBe('hello')
      expect(b.toString()).toBe(' world')
      expect(result.toString()).toBe('hello beautiful world')
    })
  })

  describe('isBalanced', () => {
    it('should be balanced for empty rope', () => {
      const rope = new RopeString()
      expect(rope.isBalanced()).toBe(true)
    })

    it('should be balanced for single leaf', () => {
      const rope = new RopeString('hello')
      expect(rope.isBalanced()).toBe(true)
    })

    it('should be balanced for constructed rope', () => {
      const rope = new RopeString('hello world this is a test')
      expect(rope.isBalanced()).toBe(true)
    })

    it('should be balanced after rebalance', () => {
      const rope = new RopeString()
      for (let i = 0; i < 50; i++) {
        rope.append(String(i))
      }
      rope.rebalance()
      expect(rope.isBalanced()).toBe(true)
    })

    it('should be balanced for small leaf size', () => {
      const rope = new RopeString('abcdefghijklmnopqrstuvwxyz', { leafMaxSize: 4 })
      expect(rope.isBalanced()).toBe(true)
    })
  })

  describe('rebalance', () => {
    it('should preserve content after rebalance', () => {
      const rope = new RopeString('hello world')
      rope.rebalance()
      expect(rope.toString()).toBe('hello world')
    })

    it('should preserve empty rope', () => {
      const rope = new RopeString()
      rope.rebalance()
      expect(rope.toString()).toBe('')
      expect(rope.length()).toBe(0)
    })

    it('should produce balanced tree from degenerate rope', () => {
      const rope = new RopeString()
      for (let i = 0; i < 30; i++) {
        rope.append('x')
      }
      rope.rebalance()
      expect(rope.isBalanced()).toBe(true)
      expect(rope.toString()).toBe('x'.repeat(30))
    })

    it('should preserve length after rebalance', () => {
      const rope = new RopeString('abcdefghijklmnopqrstuvwxyz')
      const len = rope.length()
      rope.rebalance()
      expect(rope.length()).toBe(len)
    })

    it('should allow operations after rebalance', () => {
      const rope = new RopeString('hello world')
      rope.rebalance()
      rope.insert(5, ' beautiful')
      expect(rope.toString()).toBe('hello beautiful world')
    })

    it('should handle rebalance on single char', () => {
      const rope = new RopeString('x')
      rope.rebalance()
      expect(rope.toString()).toBe('x')
    })

    it('should handle rebalance after many appends', () => {
      const rope = new RopeString()
      for (let i = 0; i < 100; i++) {
        rope.append(`${i}`)
      }
      rope.rebalance()
      let expected = ''
      for (let i = 0; i < 100; i++) {
        expected += `${i}`
      }
      expect(rope.toString()).toBe(expected)
    })

    it('should handle rebalance after many prepends', () => {
      const rope = new RopeString()
      for (let i = 9; i >= 0; i--) {
        rope.prepend(`${i}`)
      }
      rope.rebalance()
      expect(rope.toString()).toBe('0123456789')
    })

    it('should return void', () => {
      const rope = new RopeString('hello')
      expect(rope.rebalance()).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return stats for empty rope', () => {
      const rope = new RopeString()
      const stats = rope.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.height).toBe(0)
      expect(stats.isBalanced).toBe(true)
      expect(stats.leafCount).toBe(0)
    })

    it('should return stats for single leaf', () => {
      const rope = new RopeString('hello')
      const stats = rope.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.height).toBe(0)
      expect(stats.isBalanced).toBe(true)
      expect(stats.leafCount).toBe(1)
    })

    it('should return stats for multi-node rope', () => {
      const rope = new RopeString('abcdefghijklmnopqrstuvwxyz', { leafMaxSize: 4 })
      const stats = rope.getStats()
      expect(stats.nodeCount).toBeGreaterThan(0)
      expect(stats.leafCount).toBeGreaterThan(1)
      expect(stats.height).toBeGreaterThan(0)
    })

    it('should return RopeStats type', () => {
      const rope = new RopeString('hello')
      const stats: RopeStats = rope.getStats()
      expect(typeof stats.nodeCount).toBe('number')
      expect(typeof stats.height).toBe('number')
      expect(typeof stats.isBalanced).toBe('boolean')
      expect(typeof stats.leafCount).toBe('number')
    })

    it('should show balanced after rebalance', () => {
      const rope = new RopeString()
      for (let i = 0; i < 30; i++) {
        rope.append('x')
      }
      rope.rebalance()
      const stats = rope.getStats()
      expect(stats.isBalanced).toBe(true)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over characters', () => {
      const rope = new RopeString('hello')
      const chars = [...rope]
      expect(chars).toEqual(['h', 'e', 'l', 'l', 'o'])
    })

    it('should iterate over empty rope', () => {
      const rope = new RopeString()
      const chars = [...rope]
      expect(chars).toEqual([])
    })

    it('should iterate over single character', () => {
      const rope = new RopeString('x')
      const chars = [...rope]
      expect(chars).toEqual(['x'])
    })

    it('should iterate over long string', () => {
      const text = 'abcdefghijklmnopqrstuvwxyz'
      const rope = new RopeString(text, { leafMaxSize: 4 })
      const chars = [...rope]
      expect(chars.join('')).toBe(text)
    })

    it('should work with for...of loop', () => {
      const rope = new RopeString('abc')
      const result: string[] = []
      for (const ch of rope) {
        result.push(ch)
      }
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('should work after modifications', () => {
      const rope = new RopeString('hllo')
      rope.insert(1, 'e')
      const chars = [...rope]
      expect(chars).toEqual(['h', 'e', 'l', 'l', 'o'])
    })

    it('should work with spread operator', () => {
      const rope = new RopeString('test')
      expect([...rope].length).toBe(4)
    })

    it('should work after rebalance', () => {
      const rope = new RopeString()
      for (let i = 0; i < 5; i++) {
        rope.append('x')
      }
      rope.rebalance()
      expect([...rope].length).toBe(5)
    })

    it('should work with split results', () => {
      const rope = new RopeString('hello world')
      const [left, right] = rope.split(5)
      expect([...left]).toEqual(['h', 'e', 'l', 'l', 'o'])
      expect([...right]).toEqual([' ', 'w', 'o', 'r', 'l', 'd'])
    })
  })

  describe('type exports', () => {
    it('should have correct DEFAULT_ROPE_OPTIONS', () => {
      expect(DEFAULT_ROPE_OPTIONS.leafMaxSize).toBe(8)
    })

    it('should support RopeOptions interface', () => {
      const opts: RopeOptions = { leafMaxSize: 16 }
      expect(opts.leafMaxSize).toBe(16)
    })

    it('should support RopeNode as string leaf', () => {
      const leaf: RopeNode = 'hello'
      expect(typeof leaf).toBe('string')
    })

    it('should support RopeNode as internal node', () => {
      const internal: RopeNode = { left: 'he', right: 'llo', length: 5 }
      expect(typeof internal).toBe('object')
    })

    it('should support nested RopeNode', () => {
      const nested: RopeNode = {
        left: { left: 'h', right: 'e', length: 2 },
        right: 'llo',
        length: 5,
      }
      expect(typeof nested).toBe('object')
    })

    it('should support RopeStats interface', () => {
      const stats: RopeStats = {
        nodeCount: 5,
        height: 3,
        isBalanced: true,
        leafCount: 4,
      }
      expect(stats.nodeCount).toBe(5)
      expect(stats.isBalanced).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle unicode characters', () => {
      const rope = new RopeString('café')
      expect(rope.toString()).toBe('café')
      expect(rope.charAt(3)).toBe('é')
      expect(rope.substring(0, 3)).toBe('caf')
      expect(rope.indexOf('fé')).toBe(2)
    })

    it('should handle very long string', () => {
      const text = 'ab'.repeat(500)
      const rope = new RopeString(text, { leafMaxSize: 4 })
      expect(rope.toString()).toBe(text)
      expect(rope.length()).toBe(1000)
    })

    it('should handle whitespace', () => {
      const rope = new RopeString('   hello   world   ')
      expect(rope.indexOf('hello')).toBe(3)
      expect(rope.substring(3, 8)).toBe('hello')
    })

    it('should handle newlines', () => {
      const rope = new RopeString('line1\nline2\nline3')
      expect(rope.indexOf('line2')).toBe(6)
      expect(rope.substring(0, 5)).toBe('line1')
    })

    it('should handle single character rope', () => {
      const rope = new RopeString('x')
      expect(rope.length()).toBe(1)
      expect(rope.charAt(0)).toBe('x')
      expect(rope.isEmpty()).toBe(false)
    })

    it('should handle repeated operations', () => {
      const rope = new RopeString()
      for (let i = 0; i < 20; i++) {
        rope.append(String.fromCharCode(97 + i))
      }
      expect(rope.toString()).toBe('abcdefghijklmnopqrst')
      expect(rope.length()).toBe(20)
    })
  })

  describe('combined operations', () => {
    it('should handle insert followed by delete', () => {
      const rope = new RopeString('hello world')
      rope.insert(5, ' beautiful')
      rope.delete(0, 5)
      expect(rope.toString()).toBe(' beautiful world')
    })

    it('should handle multiple mixed operations', () => {
      const rope = new RopeString()
      rope.append('hello')
      rope.append(' ')
      rope.append('world')
      rope.insert(11, '!')
      expect(rope.toString()).toBe('hello world!')
    })

    it('should handle split then modify halves', () => {
      const rope = new RopeString('hello world')
      const [left, right] = rope.split(6)
      left.append('!')
      right.prepend('oh ')
      expect(left.toString()).toBe('hello !')
      expect(right.toString()).toBe('oh world')
    })

    it('should handle clone then modify original', () => {
      const rope = new RopeString('hello')
      const cloned = rope.clone()
      rope.append(' world')
      rope.delete(0, 6)
      expect(cloned.toString()).toBe('hello')
      expect(rope.toString()).toBe('world')
    })

    it('should handle long text with small leaf size', () => {
      const rope = new RopeString('abcdefghijklmnopqrstuvwxyz', { leafMaxSize: 4 })
      expect(rope.charAt(0)).toBe('a')
      expect(rope.charAt(25)).toBe('z')
      expect(rope.substring(5, 10)).toBe('fghij')
      rope.insert(13, '-')
      expect(rope.toString()).toBe('abcdefghijklm-nopqrstuvwxyz')
    })

    it('should handle append delete append cycle', () => {
      const rope = new RopeString('hello')
      rope.append(' world')
      rope.delete(5, 6)
      rope.append('!')
      expect(rope.toString()).toBe('hello!')
    })

    it('should handle concat split roundtrip', () => {
      const a = new RopeString('hello')
      const b = new RopeString(' world')
      const combined = a.concat(b)
      const [left, right] = combined.split(5)
      expect(left.toString()).toBe('hello')
      expect(right.toString()).toBe(' world')
    })

    it('should handle rebalance between operations', () => {
      const rope = new RopeString()
      for (let i = 0; i < 20; i++) {
        rope.append('a')
      }
      rope.rebalance()
      rope.insert(10, 'b')
      expect(rope.toString()).toBe('a'.repeat(10) + 'b' + 'a'.repeat(10))
    })

    it('should handle split concat roundtrip', () => {
      const original = new RopeString('hello world')
      const [left, right] = original.split(5)
      const rejoined = left.concat(right)
      expect(rejoined.toString()).toBe('hello world')
    })

    it('should handle iterator after concat', () => {
      const a = new RopeString('abc')
      const b = new RopeString('def')
      const combined = a.concat(b)
      expect([...combined].join('')).toBe('abcdef')
    })

    it('should handle performance with repeated operations', () => {
      const rope = new RopeString()
      for (let i = 0; i < 50; i++) {
        rope.append('x')
      }
      expect(rope.length()).toBe(50)
      rope.rebalance()
      for (let i = 0; i < 50; i++) {
        rope.delete(0, 1)
      }
      expect(rope.isEmpty()).toBe(true)
    })
  })
})
