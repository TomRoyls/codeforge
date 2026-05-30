import { describe, it, expect } from 'vitest'
import { PieceTable } from '../../src/utils/piece-table.js'

describe('PieceTable', () => {
  it('creates empty piece table', () => {
    const pt = new PieceTable()
    expect(pt.length).toBe(0)
    expect(pt.pieceCount).toBe(0)
    expect(pt.getText()).toBe('')
  })

  it('creates piece table with original text', () => {
    const pt = new PieceTable('hello')
    expect(pt.length).toBe(5)
    expect(pt.pieceCount).toBe(1)
    expect(pt.getText()).toBe('hello')
  })

  it('inserts text at position in empty table', () => {
    const pt = new PieceTable()
    pt.insert(0, 'hello')
    expect(pt.getText()).toBe('hello')
    expect(pt.length).toBe(5)
  })

  it('inserts text at beginning', () => {
    const pt = new PieceTable('world')
    pt.insert(0, 'hello ')
    expect(pt.getText()).toBe('hello world')
    expect(pt.length).toBe(11)
  })

  it('inserts text in middle', () => {
    const pt = new PieceTable('he world')
    pt.insert(2, 'llo')
    expect(pt.getText()).toBe('hello world')
    expect(pt.length).toBe(11)
  })

  it('inserts text at end', () => {
    const pt = new PieceTable('hello')
    pt.insert(5, ' world')
    expect(pt.getText()).toBe('hello world')
    expect(pt.length).toBe(11)
  })

  it('multiple inserts work correctly', () => {
    const pt = new PieceTable()
    pt.insert(0, 'hello')
    pt.insert(5, ' ')
    pt.insert(6, 'world')
    expect(pt.getText()).toBe('hello world')
  })

  it('inserting empty text does nothing', () => {
    const pt = new PieceTable('hello')
    const lengthBefore = pt.length
    pt.insert(2, '')
    expect(pt.length).toBe(lengthBefore)
    expect(pt.getText()).toBe('hello')
  })

  it('deletes text from beginning', () => {
    const pt = new PieceTable('hello world')
    pt.delete(0, 6)
    expect(pt.getText()).toBe('world')
    expect(pt.length).toBe(5)
  })

  it('deletes text from middle', () => {
    const pt = new PieceTable('hello world')
    pt.delete(5, 1)
    expect(pt.getText()).toBe('helloworld')
    expect(pt.length).toBe(10)
  })

  it('deletes text from end', () => {
    const pt = new PieceTable('hello world')
    pt.delete(6, 5)
    expect(pt.getText()).toBe('hello ')
    expect(pt.length).toBe(6)
  })

  it('deletes all text', () => {
    const pt = new PieceTable('hello')
    pt.delete(0, 5)
    expect(pt.getText()).toBe('')
    expect(pt.length).toBe(0)
  })

  it('deleting zero length does nothing', () => {
    const pt = new PieceTable('hello')
    const lengthBefore = pt.length
    pt.delete(0, 0)
    expect(pt.length).toBe(lengthBefore)
    expect(pt.getText()).toBe('hello')
  })

  it('deleting with negative length does nothing', () => {
    const pt = new PieceTable('hello')
    const lengthBefore = pt.length
    pt.delete(0, -1)
    expect(pt.length).toBe(lengthBefore)
    expect(pt.getText()).toBe('hello')
  })

  it('multiple deletes work correctly', () => {
    const pt = new PieceTable('hello world')
    pt.delete(5, 1)
    pt.delete(5, 5)
    expect(pt.getText()).toBe('hello')
  })

  it('charAt returns correct character', () => {
    const pt = new PieceTable('hello')
    expect(pt.charAt(0)).toBe('h')
    expect(pt.charAt(4)).toBe('o')
  })

  it('charAt returns empty string for out of bounds', () => {
    const pt = new PieceTable('hello')
    expect(pt.charAt(-1)).toBe('')
    expect(pt.charAt(10)).toBe('')
  })

  it('charAt works after insert', () => {
    const pt = new PieceTable('hello')
    pt.insert(5, ' world')
    expect(pt.charAt(6)).toBe('w')
  })

  it('charAt works after delete', () => {
    const pt = new PieceTable('hello world')
    pt.delete(5, 6)
    expect(pt.charAt(4)).toBe('o')
  })

  it('substring returns correct substring', () => {
    const pt = new PieceTable('hello world')
    expect(pt.substring(0, 5)).toBe('hello')
    expect(pt.substring(6, 11)).toBe('world')
  })

  it('substring with single argument returns suffix', () => {
    const pt = new PieceTable('hello world')
    expect(pt.substring(6)).toBe('world')
  })

  it('substring with no arguments returns full text', () => {
    const pt = new PieceTable('hello')
    expect(pt.substring()).toBe('hello')
  })

  it('handles insert after delete', () => {
    const pt = new PieceTable('hello world')
    pt.delete(5, 6)
    pt.insert(5, ' universe')
    expect(pt.getText()).toBe('hello universe')
  })

  it('handles delete after insert', () => {
    const pt = new PieceTable('hello')
    pt.insert(5, ' world')
    pt.delete(5, 6)
    expect(pt.getText()).toBe('hello')
  })

  it('pieceCount increases with inserts', () => {
    const pt = new PieceTable()
    pt.insert(0, 'hello')
    expect(pt.pieceCount).toBe(1)
    pt.insert(2, 'x')
    expect(pt.pieceCount).toBeGreaterThan(1)
  })

  it('length is accurate after multiple operations', () => {
    const pt = new PieceTable('hello')
    expect(pt.length).toBe(5)
    pt.insert(5, ' world')
    expect(pt.length).toBe(11)
    pt.delete(5, 1)
    expect(pt.length).toBe(10)
  })

  it('getText returns consistent result', () => {
    const pt = new PieceTable('hello')
    pt.insert(5, ' world')
    const text1 = pt.getText()
    const text2 = pt.getText()
    expect(text1).toBe(text2)
  })

  it('handles complex insert and delete sequence', () => {
    const pt = new PieceTable('abc')
    pt.insert(1, 'x')
    pt.insert(2, 'y')
    pt.delete(2, 1)
    pt.insert(2, 'z')
    expect(pt.getText()).toBe('axzbc')
  })

  it('handles large text', () => {
    const largeText = 'a'.repeat(1000)
    const pt = new PieceTable(largeText)
    expect(pt.length).toBe(1000)
    pt.insert(500, 'x')
    expect(pt.charAt(500)).toBe('x')
    expect(pt.length).toBe(1001)
  })
})