import { describe, it, expect } from 'vitest'
import { PieceTable } from '../../../src/utils/piece-table.js'

describe('PieceTable', () => {
  describe('construction', () => {
    it('creates empty table', () => {
      const pt = new PieceTable()
      expect(pt.getText()).toBe('')
      expect(pt.length).toBe(0)
      expect(pt.pieceCount).toBe(0)
    })

    it('creates from initial text', () => {
      const pt = new PieceTable('hello')
      expect(pt.getText()).toBe('hello')
      expect(pt.length).toBe(5)
      expect(pt.pieceCount).toBe(1)
    })
  })

  describe('insert', () => {
    it('appends at end', () => {
      const pt = new PieceTable('hello')
      pt.insert(5, ' world')
      expect(pt.getText()).toBe('hello world')
    })

    it('prepends at beginning', () => {
      const pt = new PieceTable('world')
      pt.insert(0, 'hello ')
      expect(pt.getText()).toBe('hello world')
    })

    it('inserts in middle', () => {
      const pt = new PieceTable('helo')
      pt.insert(2, 'l')
      expect(pt.getText()).toBe('hello')
    })

    it('handles multiple inserts', () => {
      const pt = new PieceTable()
      pt.insert(0, 'b')
      pt.insert(0, 'a')
      pt.insert(2, 'c')
      expect(pt.getText()).toBe('abc')
    })

    it('handles empty insert', () => {
      const pt = new PieceTable('test')
      pt.insert(2, '')
      expect(pt.getText()).toBe('test')
    })

    it('insert into empty table', () => {
      const pt = new PieceTable()
      pt.insert(0, 'hello')
      expect(pt.getText()).toBe('hello')
    })
  })

  describe('delete', () => {
    it('deletes from beginning', () => {
      const pt = new PieceTable('hello')
      pt.delete(0, 2)
      expect(pt.getText()).toBe('llo')
    })

    it('deletes from end', () => {
      const pt = new PieceTable('hello')
      pt.delete(3, 2)
      expect(pt.getText()).toBe('hel')
    })

    it('deletes from middle', () => {
      const pt = new PieceTable('hello')
      pt.delete(1, 3)
      expect(pt.getText()).toBe('ho')
    })

    it('deletes everything', () => {
      const pt = new PieceTable('hello')
      pt.delete(0, 5)
      expect(pt.getText()).toBe('')
      expect(pt.length).toBe(0)
    })

    it('deletes with zero length does nothing', () => {
      const pt = new PieceTable('hello')
      pt.delete(2, 0)
      expect(pt.getText()).toBe('hello')
    })
  })

  describe('charAt', () => {
    it('returns character at index', () => {
      const pt = new PieceTable('hello')
      expect(pt.charAt(0)).toBe('h')
      expect(pt.charAt(4)).toBe('o')
    })

    it('returns empty string for out of bounds', () => {
      const pt = new PieceTable('hi')
      expect(pt.charAt(5)).toBe('')
    })

    it('works across pieces', () => {
      const pt = new PieceTable('ab')
      pt.insert(1, 'X')
      expect(pt.charAt(0)).toBe('a')
      expect(pt.charAt(1)).toBe('X')
      expect(pt.charAt(2)).toBe('b')
    })
  })

  describe('substring', () => {
    it('extracts substring', () => {
      const pt = new PieceTable('hello world')
      expect(pt.substring(0, 5)).toBe('hello')
    })

    it('extracts to end', () => {
      const pt = new PieceTable('hello')
      expect(pt.substring(2)).toBe('llo')
    })
  })

  describe('complex editing', () => {
    it('simulates text editor session', () => {
      const pt = new PieceTable('The quick fox')
      pt.insert(10, 'brown ')
      expect(pt.getText()).toBe('The quick brown fox')
      pt.delete(16, 3)
      expect(pt.getText()).toBe('The quick brown ')
      pt.insert(16, 'dog')
      expect(pt.getText()).toBe('The quick brown dog')
    })

    it('handles rapid insert/delete cycle', () => {
      const pt = new PieceTable('abc')
      pt.insert(3, 'd')
      pt.insert(4, 'e')
      pt.delete(0, 1)
      pt.insert(0, 'A')
      expect(pt.getText()).toBe('Abcde')
    })

    it('piece count grows with edits', () => {
      const pt = new PieceTable('abc')
      expect(pt.pieceCount).toBe(1)
      pt.insert(1, 'X')
      expect(pt.pieceCount).toBe(3)
      pt.delete(1, 1)
      expect(pt.pieceCount).toBe(2)
    })
  })

  describe('length tracking', () => {
    it('tracks length correctly', () => {
      const pt = new PieceTable('hello')
      expect(pt.length).toBe(5)
      pt.insert(5, ' world')
      expect(pt.length).toBe(11)
      pt.delete(5, 6)
      expect(pt.length).toBe(5)
    })
  })
})
