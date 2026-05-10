import { describe, it, expect, beforeEach } from 'vitest'
import { PieceTable } from '../../src/core/piece-table/piece-table.js'
import type { Piece, PieceTableOptions } from '../../src/core/piece-table/types.js'

describe('PieceTable', () => {
  let pt: PieceTable

  beforeEach(() => {
    pt = new PieceTable()
  })

  describe('constructor', () => {
    it('should create empty table with no arguments', () => {
      const t = new PieceTable()
      expect(t.length).toBe(0)
      expect(t.getText()).toBe('')
    })

    it('should create table with undefined initial text', () => {
      const t = new PieceTable(undefined)
      expect(t.length).toBe(0)
      expect(t.getText()).toBe('')
    })

    it('should create table with empty string initial text', () => {
      const t = new PieceTable('')
      expect(t.length).toBe(0)
      expect(t.getText()).toBe('')
    })

    it('should create table with initial text', () => {
      const t = new PieceTable('hello')
      expect(t.length).toBe(5)
      expect(t.getText()).toBe('hello')
    })

    it('should create table with single character initial text', () => {
      const t = new PieceTable('x')
      expect(t.length).toBe(1)
      expect(t.getText()).toBe('x')
    })

    it('should create table with multi-line initial text', () => {
      const t = new PieceTable('line1\nline2\nline3')
      expect(t.length).toBe(17)
      expect(t.getText()).toBe('line1\nline2\nline3')
    })

    it('should create table with unicode initial text', () => {
      const t = new PieceTable('こんにちは世界')
      expect(t.getText()).toBe('こんにちは世界')
    })

    it('should have pieceCount of 0 for empty table', () => {
      const t = new PieceTable()
      expect(t.pieceCount()).toBe(0)
    })

    it('should have pieceCount of 1 for non-empty initial text', () => {
      const t = new PieceTable('abc')
      expect(t.pieceCount()).toBe(1)
    })

    it('should have pieceCount of 0 for empty string initial text', () => {
      const t = new PieceTable('')
      expect(t.pieceCount()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert text into empty table', () => {
      pt.insert(0, 'hello')
      expect(pt.getText()).toBe('hello')
      expect(pt.length).toBe(5)
    })

    it('should insert text at beginning', () => {
      pt.insert(0, 'world')
      pt.insert(0, 'hello ')
      expect(pt.getText()).toBe('hello world')
    })

    it('should insert text at end', () => {
      pt.insert(0, 'hello')
      pt.insert(5, ' world')
      expect(pt.getText()).toBe('hello world')
    })

    it('should insert text in middle', () => {
      pt.insert(0, 'helo')
      pt.insert(2, 'l')
      expect(pt.getText()).toBe('hello')
    })

    it('should insert single character', () => {
      pt.insert(0, 'a')
      expect(pt.getText()).toBe('a')
      expect(pt.length).toBe(1)
    })

    it('should insert empty string without effect', () => {
      pt.insert(0, 'hello')
      pt.insert(3, '')
      expect(pt.getText()).toBe('hello')
      expect(pt.length).toBe(5)
    })

    it('should insert at position 0 of empty table', () => {
      pt.insert(0, 'text')
      expect(pt.getText()).toBe('text')
    })

    it('should insert at position equal to length', () => {
      pt.insert(0, 'abc')
      pt.insert(3, 'def')
      expect(pt.getText()).toBe('abcdef')
    })

    it('should throw on negative position', () => {
      expect(() => pt.insert(-1, 'x')).toThrow(RangeError)
    })

    it('should throw on position greater than length', () => {
      pt.insert(0, 'abc')
      expect(() => pt.insert(5, 'x')).toThrow(RangeError)
    })

    it('should handle multiple sequential inserts at end', () => {
      pt.insert(0, 'a')
      pt.insert(1, 'b')
      pt.insert(2, 'c')
      pt.insert(3, 'd')
      expect(pt.getText()).toBe('abcd')
    })

    it('should handle multiple sequential inserts at beginning', () => {
      pt.insert(0, 'd')
      pt.insert(0, 'c')
      pt.insert(0, 'b')
      pt.insert(0, 'a')
      expect(pt.getText()).toBe('abcd')
    })

    it('should handle insert at exact piece boundary', () => {
      pt.insert(0, 'ab')
      pt.insert(1, '-')
      expect(pt.getText()).toBe('a-b')
    })

    it('should insert into table with initial text at beginning', () => {
      const t = new PieceTable('world')
      t.insert(0, 'hello ')
      expect(t.getText()).toBe('hello world')
    })

    it('should insert into table with initial text at end', () => {
      const t = new PieceTable('hello')
      t.insert(5, ' world')
      expect(t.getText()).toBe('hello world')
    })

    it('should insert into table with initial text in middle', () => {
      const t = new PieceTable('helo')
      t.insert(2, 'l')
      expect(t.getText()).toBe('hello')
    })

    it('should handle insert with unicode text', () => {
      pt.insert(0, 'hello')
      pt.insert(5, ' 🌍')
      expect(pt.getText()).toBe('hello 🌍')
    })

    it('should increase piece count on insert', () => {
      pt.insert(0, 'abc')
      expect(pt.pieceCount()).toBe(1)
      pt.insert(1, 'x')
      expect(pt.pieceCount()).toBe(3)
    })

    it('should handle insert that splits a piece', () => {
      pt.insert(0, 'abcdef')
      pt.insert(3, 'XY')
      expect(pt.getText()).toBe('abcXYdef')
    })
  })

  describe('delete', () => {
    it('should delete from beginning', () => {
      pt.insert(0, 'hello world')
      pt.delete(0, 6)
      expect(pt.getText()).toBe('world')
    })

    it('should delete from end', () => {
      pt.insert(0, 'hello world')
      pt.delete(5, 11)
      expect(pt.getText()).toBe('hello')
    })

    it('should delete from middle', () => {
      pt.insert(0, 'hello world')
      pt.delete(5, 6)
      expect(pt.getText()).toBe('helloworld')
    })

    it('should delete single character', () => {
      pt.insert(0, 'abc')
      pt.delete(1, 2)
      expect(pt.getText()).toBe('ac')
    })

    it('should delete entire text', () => {
      pt.insert(0, 'hello')
      pt.delete(0, 5)
      expect(pt.getText()).toBe('')
      expect(pt.length).toBe(0)
    })

    it('should handle no-op delete with equal start and end', () => {
      pt.insert(0, 'hello')
      pt.delete(2, 2)
      expect(pt.getText()).toBe('hello')
    })

    it('should throw on negative start', () => {
      pt.insert(0, 'abc')
      expect(() => pt.delete(-1, 2)).toThrow(RangeError)
    })

    it('should throw on negative end', () => {
      pt.insert(0, 'abc')
      expect(() => pt.delete(0, -1)).toThrow(RangeError)
    })

    it('should throw when start greater than end', () => {
      pt.insert(0, 'abc')
      expect(() => pt.delete(2, 1)).toThrow(RangeError)
    })

    it('should throw when start exceeds length', () => {
      pt.insert(0, 'abc')
      expect(() => pt.delete(5, 6)).toThrow(RangeError)
    })

    it('should throw when end exceeds length', () => {
      pt.insert(0, 'abc')
      expect(() => pt.delete(0, 10)).toThrow(RangeError)
    })

    it('should delete from table with initial text', () => {
      const t = new PieceTable('hello world')
      t.delete(0, 6)
      expect(t.getText()).toBe('world')
    })

    it('should handle delete that spans multiple pieces', () => {
      pt.insert(0, 'abc')
      pt.insert(1, 'XY')
      pt.delete(0, 5)
      expect(pt.getText()).toBe('')
    })

    it('should handle delete within a single piece', () => {
      pt.insert(0, 'abcdef')
      pt.delete(2, 4)
      expect(pt.getText()).toBe('abef')
    })

    it('should handle delete from piece boundary', () => {
      pt.insert(0, 'abc')
      pt.insert(3, 'def')
      pt.delete(2, 4)
      expect(pt.getText()).toBe('abef')
    })

    it('should handle delete leaving empty table', () => {
      pt.insert(0, 'x')
      pt.delete(0, 1)
      expect(pt.length).toBe(0)
      expect(pt.getText()).toBe('')
    })

    it('should handle multiple sequential deletes', () => {
      pt.insert(0, 'abcdef')
      pt.delete(0, 2)
      expect(pt.getText()).toBe('cdef')
      pt.delete(2, 4)
      expect(pt.getText()).toBe('cd')
    })

    it('should handle delete of first character', () => {
      pt.insert(0, 'abcdef')
      pt.delete(0, 1)
      expect(pt.getText()).toBe('bcdef')
    })

    it('should handle delete of last character', () => {
      pt.insert(0, 'abcdef')
      pt.delete(5, 6)
      expect(pt.getText()).toBe('abcde')
    })

    it('should handle delete at end of range', () => {
      pt.insert(0, 'abc')
      pt.delete(3, 3)
      expect(pt.getText()).toBe('abc')
    })
  })

  describe('getText', () => {
    it('should return empty string for empty table', () => {
      expect(pt.getText()).toBe('')
    })

    it('should return initial text', () => {
      const t = new PieceTable('initial')
      expect(t.getText()).toBe('initial')
    })

    it('should return text after insert', () => {
      pt.insert(0, 'hello')
      expect(pt.getText()).toBe('hello')
    })

    it('should return text after delete', () => {
      pt.insert(0, 'hello world')
      pt.delete(5, 11)
      expect(pt.getText()).toBe('hello')
    })

    it('should return text after insert and delete', () => {
      pt.insert(0, 'hello')
      pt.insert(5, ' world')
      pt.delete(0, 6)
      expect(pt.getText()).toBe('world')
    })

    it('should handle unicode text', () => {
      pt.insert(0, '🎉🎊🎈')
      expect(pt.getText()).toBe('🎉🎊🎈')
    })
  })

  describe('length', () => {
    it('should return 0 for empty table', () => {
      expect(pt.length).toBe(0)
    })

    it('should return initial text length', () => {
      const t = new PieceTable('hello')
      expect(t.length).toBe(5)
    })

    it('should increase after insert', () => {
      pt.insert(0, 'abc')
      expect(pt.length).toBe(3)
    })

    it('should decrease after delete', () => {
      pt.insert(0, 'abcde')
      pt.delete(0, 2)
      expect(pt.length).toBe(3)
    })

    it('should track length through multiple operations', () => {
      pt.insert(0, 'abc')
      expect(pt.length).toBe(3)
      pt.insert(1, 'x')
      expect(pt.length).toBe(4)
      pt.delete(0, 2)
      expect(pt.length).toBe(2)
    })
  })

  describe('charAt', () => {
    it('should return character at index', () => {
      pt.insert(0, 'hello')
      expect(pt.charAt(0)).toBe('h')
      expect(pt.charAt(1)).toBe('e')
      expect(pt.charAt(4)).toBe('o')
    })

    it('should work with initial text', () => {
      const t = new PieceTable('abcde')
      expect(t.charAt(0)).toBe('a')
      expect(t.charAt(2)).toBe('c')
      expect(t.charAt(4)).toBe('e')
    })

    it('should work after insert', () => {
      pt.insert(0, 'hllo')
      pt.insert(1, 'e')
      expect(pt.charAt(1)).toBe('e')
    })

    it('should work after delete', () => {
      pt.insert(0, 'abcdef')
      pt.delete(2, 4)
      expect(pt.charAt(0)).toBe('a')
      expect(pt.charAt(1)).toBe('b')
      expect(pt.charAt(2)).toBe('e')
      expect(pt.charAt(3)).toBe('f')
    })

    it('should throw on negative index', () => {
      pt.insert(0, 'abc')
      expect(() => pt.charAt(-1)).toThrow(RangeError)
    })

    it('should throw on index equal to length', () => {
      pt.insert(0, 'abc')
      expect(() => pt.charAt(3)).toThrow(RangeError)
    })

    it('should throw on index greater than length', () => {
      pt.insert(0, 'abc')
      expect(() => pt.charAt(10)).toThrow(RangeError)
    })

    it('should throw on empty table', () => {
      expect(() => pt.charAt(0)).toThrow(RangeError)
    })

    it('should handle unicode characters', () => {
      pt.insert(0, 'aéc')
      expect(pt.charAt(0)).toBe('a')
      expect(pt.charAt(1)).toBe('é')
      expect(pt.charAt(2)).toBe('c')
    })
  })

  describe('substring', () => {
    it('should return full text when no end given', () => {
      pt.insert(0, 'hello')
      expect(pt.substring(0)).toBe('hello')
    })

    it('should return partial text', () => {
      pt.insert(0, 'hello world')
      expect(pt.substring(0, 5)).toBe('hello')
    })

    it('should return middle substring', () => {
      pt.insert(0, 'hello world')
      expect(pt.substring(6, 11)).toBe('world')
    })

    it('should return single character substring', () => {
      pt.insert(0, 'abc')
      expect(pt.substring(1, 2)).toBe('b')
    })

    it('should return empty string for equal start and end', () => {
      pt.insert(0, 'abc')
      expect(pt.substring(1, 1)).toBe('')
    })

    it('should work with initial text', () => {
      const t = new PieceTable('abcdef')
      expect(t.substring(2, 5)).toBe('cde')
    })

    it('should work after insert', () => {
      pt.insert(0, 'hllo')
      pt.insert(1, 'e')
      expect(pt.substring(1, 3)).toBe('el')
    })

    it('should work after delete', () => {
      pt.insert(0, 'abcdef')
      pt.delete(2, 4)
      expect(pt.substring(0, 4)).toBe('abef')
    })

    it('should throw on negative start', () => {
      pt.insert(0, 'abc')
      expect(() => pt.substring(-1)).toThrow(RangeError)
    })

    it('should throw on start greater than length', () => {
      pt.insert(0, 'abc')
      expect(() => pt.substring(5)).toThrow(RangeError)
    })

    it('should throw on end less than start', () => {
      pt.insert(0, 'abc')
      expect(() => pt.substring(2, 1)).toThrow(RangeError)
    })

    it('should throw on end greater than length', () => {
      pt.insert(0, 'abc')
      expect(() => pt.substring(0, 10)).toThrow(RangeError)
    })

    it('should return substring spanning multiple pieces', () => {
      pt.insert(0, 'abc')
      pt.insert(3, 'def')
      expect(pt.substring(1, 5)).toBe('bcde')
    })

    it('should handle substring from position 0', () => {
      pt.insert(0, 'hello')
      expect(pt.substring(0, 2)).toBe('he')
    })

    it('should handle substring to end', () => {
      pt.insert(0, 'hello')
      expect(pt.substring(3)).toBe('lo')
    })

    it('should handle substring with unicode', () => {
      pt.insert(0, 'aébcd')
      expect(pt.substring(1, 3)).toBe('éb')
    })
  })

  describe('pieceCount', () => {
    it('should return 0 for empty table', () => {
      expect(pt.pieceCount()).toBe(0)
    })

    it('should return 1 for table with initial text', () => {
      const t = new PieceTable('abc')
      expect(t.pieceCount()).toBe(1)
    })

    it('should increase after insert at end', () => {
      pt.insert(0, 'abc')
      pt.insert(3, 'def')
      expect(pt.pieceCount()).toBe(2)
    })

    it('should increase after insert at beginning', () => {
      pt.insert(0, 'abc')
      pt.insert(0, 'def')
      expect(pt.pieceCount()).toBe(2)
    })

    it('should increase by 2 when splitting piece', () => {
      pt.insert(0, 'abcdef')
      const before = pt.pieceCount()
      pt.insert(3, 'XY')
      expect(pt.pieceCount()).toBe(before + 2)
    })

    it('should decrease after delete that removes a piece', () => {
      pt.insert(0, 'abc')
      pt.insert(3, 'def')
      pt.delete(3, 6)
      expect(pt.pieceCount()).toBe(1)
    })

    it('should handle multiple inserts tracking', () => {
      pt.insert(0, 'a')
      expect(pt.pieceCount()).toBe(1)
      pt.insert(1, 'b')
      expect(pt.pieceCount()).toBe(2)
      pt.insert(2, 'c')
      expect(pt.pieceCount()).toBe(3)
    })
  })

  describe('compact', () => {
    it('should not change single piece table', () => {
      pt.insert(0, 'abc')
      const before = pt.pieceCount()
      pt.compact()
      expect(pt.pieceCount()).toBe(before)
      expect(pt.getText()).toBe('abc')
    })

    it('should not change empty table', () => {
      pt.compact()
      expect(pt.pieceCount()).toBe(0)
      expect(pt.getText()).toBe('')
    })

    it('should merge adjacent pieces from add buffer', () => {
      pt.insert(0, 'a')
      pt.insert(1, 'b')
      pt.insert(2, 'c')
      expect(pt.pieceCount()).toBe(3)
      pt.compact()
      expect(pt.pieceCount()).toBe(1)
      expect(pt.getText()).toBe('abc')
    })

    it('should not merge pieces from different buffers', () => {
      const t = new PieceTable('original')
      t.insert(0, 'new ')
      pt.compact()
      expect(t.pieceCount()).toBe(2)
      expect(t.getText()).toBe('new original')
    })

    it('should merge pieces that become adjacent after inserts', () => {
      pt.insert(0, 'a')
      pt.insert(1, 'b')
      pt.insert(2, 'c')
      pt.compact()
      expect(pt.getText()).toBe('abc')
      expect(pt.pieceCount()).toBe(1)
    })

    it('should preserve text content after compact', () => {
      pt.insert(0, 'hello')
      pt.insert(5, ' ')
      pt.insert(6, 'world')
      const text = pt.getText()
      pt.compact()
      expect(pt.getText()).toBe(text)
    })

    it('should handle compact on table with non-adjacent pieces', () => {
      const t = new PieceTable('middle')
      t.insert(0, 'start ')
      t.insert(12, ' end')
      t.compact()
      expect(t.getText()).toBe('start middle end')
    })

    it('should handle compact when no merging needed', () => {
      const t = new PieceTable('abc')
      t.insert(0, 'XY')
      const before = t.pieceCount()
      t.compact()
      expect(t.pieceCount()).toBe(before)
    })

    it('should handle compact with interleaved inserts', () => {
      pt.insert(0, 'ace')
      pt.insert(1, 'b')
      pt.insert(3, 'd')
      expect(pt.getText()).toBe('abcde')
      pt.compact()
      expect(pt.getText()).toBe('abcde')
    })
  })

  describe('large text', () => {
    it('should handle 10000 character initial text', () => {
      const big = 'a'.repeat(10000)
      const t = new PieceTable(big)
      expect(t.length).toBe(10000)
      expect(t.getText()).toBe(big)
    })

    it('should handle 10000 character insert', () => {
      const big = 'x'.repeat(10000)
      pt.insert(0, big)
      expect(pt.length).toBe(10000)
      expect(pt.getText()).toBe(big)
    })

    it('should handle 10000 sequential single-char inserts', () => {
      for (let i = 0; i < 1000; i++) {
        pt.insert(i, 'a')
      }
      expect(pt.length).toBe(1000)
      expect(pt.getText()).toBe('a'.repeat(1000))
    })

    it('should handle delete on large text', () => {
      const big = 'abcdefghij'.repeat(1000)
      const t = new PieceTable(big)
      t.delete(0, 5000)
      expect(t.length).toBe(5000)
    })

    it('should handle charAt on large text', () => {
      const big = 'abcdefghij'.repeat(1000)
      const t = new PieceTable(big)
      expect(t.charAt(0)).toBe('a')
      expect(t.charAt(9)).toBe('j')
      expect(t.charAt(10)).toBe('a')
    })

    it('should handle substring on large text', () => {
      const big = 'abcdefghij'.repeat(1000)
      const t = new PieceTable(big)
      expect(t.substring(0, 10)).toBe('abcdefghij')
      expect(t.substring(9990, 10000)).toBe('abcdefghij')
    })

    it('should handle insert in middle of large text', () => {
      const big = 'a'.repeat(5000)
      const t = new PieceTable(big)
      t.insert(2500, 'HELLO')
      expect(t.length).toBe(5005)
      expect(t.substring(2500, 2505)).toBe('HELLO')
    })
  })

  describe('sequential inserts', () => {
    it('should handle appending characters one by one', () => {
      for (let i = 0; i < 26; i++) {
        pt.insert(i, String.fromCharCode(97 + i))
      }
      expect(pt.getText()).toBe('abcdefghijklmnopqrstuvwxyz')
    })

    it('should handle prepending characters', () => {
      for (let i = 0; i < 5; i++) {
        pt.insert(0, String(i))
      }
      expect(pt.getText()).toBe('43210')
    })

    it('should handle inserting at alternating positions', () => {
      pt.insert(0, 'b')
      pt.insert(0, 'a')
      pt.insert(2, 'd')
      pt.insert(2, 'c')
      expect(pt.getText()).toBe('abcd')
    })

    it('should handle building string by inserting between characters', () => {
      pt.insert(0, 'ac')
      pt.insert(1, 'b')
      expect(pt.getText()).toBe('abc')
    })
  })

  describe('sequential deletes', () => {
    it('should handle deleting from beginning one at a time', () => {
      pt.insert(0, 'abcde')
      pt.delete(0, 1)
      expect(pt.getText()).toBe('bcde')
      pt.delete(0, 1)
      expect(pt.getText()).toBe('cde')
      pt.delete(0, 1)
      expect(pt.getText()).toBe('de')
    })

    it('should handle deleting from end one at a time', () => {
      pt.insert(0, 'abcde')
      pt.delete(4, 5)
      expect(pt.getText()).toBe('abcd')
      pt.delete(3, 4)
      expect(pt.getText()).toBe('abc')
    })

    it('should handle deleting from middle sequentially', () => {
      pt.insert(0, 'abcde')
      pt.delete(2, 3)
      expect(pt.getText()).toBe('abde')
      pt.delete(2, 3)
      expect(pt.getText()).toBe('abe')
    })

    it('should handle deleting everything in chunks', () => {
      pt.insert(0, 'abcdefghij')
      pt.delete(0, 5)
      expect(pt.getText()).toBe('fghij')
      pt.delete(0, 5)
      expect(pt.getText()).toBe('')
    })
  })

  describe('insert-delete interleave', () => {
    it('should handle insert then delete', () => {
      pt.insert(0, 'hello')
      pt.delete(0, 5)
      expect(pt.getText()).toBe('')
      pt.insert(0, 'world')
      expect(pt.getText()).toBe('world')
    })

    it('should handle alternating insert and delete', () => {
      pt.insert(0, 'a')
      expect(pt.getText()).toBe('a')
      pt.insert(1, 'b')
      expect(pt.getText()).toBe('ab')
      pt.delete(0, 1)
      expect(pt.getText()).toBe('b')
      pt.insert(0, 'a')
      expect(pt.getText()).toBe('ab')
      pt.insert(2, 'c')
      expect(pt.getText()).toBe('abc')
      pt.delete(1, 2)
      expect(pt.getText()).toBe('ac')
    })

    it('should handle replace pattern (delete then insert)', () => {
      pt.insert(0, 'hello world')
      pt.delete(0, 5)
      pt.insert(0, 'goodbye')
      expect(pt.getText()).toBe('goodbye world')
    })

    it('should handle insert-delete-insert cycle', () => {
      pt.insert(0, 'start')
      pt.delete(0, 5)
      pt.insert(0, 'end')
      expect(pt.getText()).toBe('end')
      expect(pt.length).toBe(3)
    })

    it('should handle complex interleaving', () => {
      pt.insert(0, 'The quick brown fox')
      pt.delete(4, 10)
      expect(pt.getText()).toBe('The brown fox')
      pt.insert(9, ' lazy')
      expect(pt.getText()).toBe('The brown lazy fox')
      pt.delete(4, 9)
      expect(pt.getText()).toBe('The  lazy fox')
    })
  })

  describe('edge cases', () => {
    it('should handle position 0 on empty table', () => {
      pt.insert(0, 'x')
      expect(pt.getText()).toBe('x')
    })

    it('should handle position equal to length', () => {
      pt.insert(0, 'abc')
      pt.insert(3, 'd')
      expect(pt.getText()).toBe('abcd')
    })

    it('should handle empty string insert', () => {
      pt.insert(0, 'abc')
      pt.insert(1, '')
      expect(pt.getText()).toBe('abc')
      expect(pt.length).toBe(3)
    })

    it('should handle delete of full range', () => {
      pt.insert(0, 'hello')
      pt.delete(0, 5)
      expect(pt.getText()).toBe('')
      expect(pt.length).toBe(0)
    })

    it('should handle delete of single character at start', () => {
      pt.insert(0, 'abc')
      pt.delete(0, 1)
      expect(pt.getText()).toBe('bc')
    })

    it('should handle delete of single character at end', () => {
      pt.insert(0, 'abc')
      pt.delete(2, 3)
      expect(pt.getText()).toBe('ab')
    })

    it('should handle delete of single character in middle', () => {
      pt.insert(0, 'abc')
      pt.delete(1, 2)
      expect(pt.getText()).toBe('ac')
    })

    it('should handle operations on empty table', () => {
      expect(pt.getText()).toBe('')
      expect(pt.length).toBe(0)
      expect(pt.pieceCount()).toBe(0)
    })

    it('should handle insert after full delete', () => {
      pt.insert(0, 'abc')
      pt.delete(0, 3)
      pt.insert(0, 'def')
      expect(pt.getText()).toBe('def')
    })

    it('should handle inserting newline characters', () => {
      pt.insert(0, 'line1\nline2')
      expect(pt.getText()).toBe('line1\nline2')
    })

    it('should handle inserting tab characters', () => {
      pt.insert(0, 'a\tb\tc')
      expect(pt.getText()).toBe('a\tb\tc')
    })

    it('should handle empty string initial text operations', () => {
      const t = new PieceTable('')
      t.insert(0, 'hello')
      expect(t.getText()).toBe('hello')
    })

    it('should handle consecutive inserts at same position', () => {
      pt.insert(0, 'a')
      pt.insert(1, 'b')
      pt.insert(1, 'c')
      expect(pt.getText()).toBe('acb')
    })

    it('should handle delete that exactly matches a piece', () => {
      pt.insert(0, 'abc')
      pt.insert(3, 'def')
      pt.delete(3, 6)
      expect(pt.getText()).toBe('abc')
    })
  })

  describe('types export', () => {
    it('should export Piece interface', () => {
      const piece: Piece = { buffer: 'original', offset: 0, length: 5 }
      expect(piece.buffer).toBe('original')
      expect(piece.offset).toBe(0)
      expect(piece.length).toBe(5)
    })

    it('should export Piece with add buffer', () => {
      const piece: Piece = { buffer: 'add', offset: 0, length: 3 }
      expect(piece.buffer).toBe('add')
    })

    it('should export PieceTableOptions interface', () => {
      const options: PieceTableOptions = { initialText: 'hello' }
      expect(options.initialText).toBe('hello')
    })

    it('should export PieceTableOptions with undefined initialText', () => {
      const options: PieceTableOptions = {}
      expect(options.initialText).toBeUndefined()
    })
  })

  describe('integration', () => {
    it('should simulate text editor session', () => {
      const editor = new PieceTable('')
      editor.insert(0, 'Hello World')
      expect(editor.getText()).toBe('Hello World')
      editor.delete(5, 11)
      expect(editor.getText()).toBe('Hello')
      editor.insert(5, ' CodeForge')
      expect(editor.getText()).toBe('Hello CodeForge')
      editor.delete(0, 6)
      expect(editor.getText()).toBe('CodeForge')
      editor.insert(0, 'Welcome to ')
      expect(editor.getText()).toBe('Welcome to CodeForge')
    })

    it('should handle rapid editing session', () => {
      pt.insert(0, 'abcdef')
      pt.insert(3, '---')
      expect(pt.getText()).toBe('abc---def')
      pt.delete(3, 6)
      expect(pt.getText()).toBe('abcdef')
      pt.insert(6, 'ghij')
      expect(pt.getText()).toBe('abcdefghij')
      pt.delete(0, 10)
      expect(pt.getText()).toBe('')
      pt.insert(0, 'done')
      expect(pt.getText()).toBe('done')
    })

    it('should maintain consistency through many operations', () => {
      pt.insert(0, 'start')
      for (let i = 0; i < 50; i++) {
        pt.insert(pt.length, ` ${i}`)
      }
      const text = pt.getText()
      expect(text.startsWith('start')).toBe(true)
      expect(text).toContain(' 49')
      expect(pt.length).toBe(text.length)
    })

    it('should handle compact after many operations', () => {
      for (let i = 0; i < 100; i++) {
        pt.insert(pt.length, 'a')
      }
      const beforeCount = pt.pieceCount()
      pt.compact()
      expect(pt.pieceCount()).toBeLessThanOrEqual(beforeCount)
      expect(pt.getText()).toBe('a'.repeat(100))
    })

    it('should handle charAt across piece boundaries', () => {
      pt.insert(0, 'ab')
      pt.insert(2, 'cd')
      pt.insert(4, 'ef')
      expect(pt.charAt(0)).toBe('a')
      expect(pt.charAt(1)).toBe('b')
      expect(pt.charAt(2)).toBe('c')
      expect(pt.charAt(3)).toBe('d')
      expect(pt.charAt(4)).toBe('e')
      expect(pt.charAt(5)).toBe('f')
    })

    it('should handle substring across piece boundaries', () => {
      pt.insert(0, 'ab')
      pt.insert(2, 'cd')
      pt.insert(4, 'ef')
      expect(pt.substring(1, 5)).toBe('bcde')
    })

    it('should handle large number of inserts and compacts', () => {
      for (let i = 0; i < 50; i++) {
        pt.insert(pt.length, `word${i} `)
        if (i % 10 === 9) {
          pt.compact()
        }
      }
      expect(pt.getText()).toContain('word0 ')
      expect(pt.getText()).toContain('word49 ')
    })

    it('should track pieceCount correctly through operations', () => {
      expect(pt.pieceCount()).toBe(0)
      pt.insert(0, 'a')
      expect(pt.pieceCount()).toBe(1)
      pt.insert(1, 'b')
      expect(pt.pieceCount()).toBe(2)
      pt.insert(2, 'c')
      expect(pt.pieceCount()).toBe(3)
      pt.compact()
      expect(pt.pieceCount()).toBe(1)
      expect(pt.getText()).toBe('abc')
    })
  })
})
