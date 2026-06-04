import { describe, it, expect } from 'vitest'
import { GapBuffer } from '../../src/utils/gap-buffer.js'

describe('GapBuffer', () => {
  it('creates empty buffer with default capacity', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.length).toBe(0)
    expect(buffer.capacity).toBe(32)
    expect(buffer.toArray()).toEqual([])
  })

  it('creates empty buffer with custom capacity', () => {
    const buffer = new GapBuffer<string>(64)
    expect(buffer.capacity).toBe(64)
    expect(buffer.length).toBe(0)
  })

  it('inserts items at cursor', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    expect(buffer.toArray()).toEqual([1, 2, 3])
    expect(buffer.length).toBe(3)
  })

  it('inserts items at specific index', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(3)
    buffer.insertAt(1, 2)
    expect(buffer.toArray()).toEqual([1, 2, 3])
    expect(buffer.length).toBe(3)
  })

  it('inserts at beginning', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(2)
    buffer.insert(3)
    buffer.insertAt(0, 1)
    expect(buffer.toArray()).toEqual([1, 2, 3])
  })

  it('inserts at end', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insertAt(2, 3)
    expect(buffer.toArray()).toEqual([1, 2, 3])
  })

  it('deletes item at cursor', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    const deleted = buffer.delete()
    expect(deleted).toBe(3)
    expect(buffer.toArray()).toEqual([1, 2])
    expect(buffer.length).toBe(2)
  })

  it('deletes undefined when cursor at start', () => {
    const buffer = new GapBuffer<number>()
    const deleted = buffer.delete()
    expect(deleted).toBeUndefined()
  })

  it('deletes item at specific index', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    const deleted = buffer.deleteAt(1)
    expect(deleted).toBe(2)
    expect(buffer.toArray()).toEqual([1, 3])
    expect(buffer.length).toBe(2)
  })

  it('gets item at index', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    expect(buffer.get(0)).toBe(1)
    expect(buffer.get(1)).toBe(2)
    expect(buffer.get(2)).toBe(3)
  })

  it('gets undefined for out of bounds', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    expect(buffer.get(-1)).toBeUndefined()
    expect(buffer.get(1)).toBeUndefined()
    expect(buffer.get(100)).toBeUndefined()
  })

  it('sets item at index', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    const success = buffer.set(1, 20)
    expect(success).toBe(true)
    expect(buffer.get(1)).toBe(20)
  })

  it('returns false when setting out of bounds', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    expect(buffer.set(-1, 0)).toBe(false)
    expect(buffer.set(1, 0)).toBe(false)
  })

  it('tracks cursor position', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.cursor()).toBe(0)
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.cursor()).toBe(2)
  })

  it('moves cursor to position', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.moveCursor(1)
    expect(buffer.cursor()).toBe(1)
  })

  it('clamps cursor move within bounds', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.moveCursor(-1)
    expect(buffer.cursor()).toBe(0)
    buffer.moveCursor(10)
    expect(buffer.cursor()).toBe(2)
  })

  it('reports gap size', () => {
    const buffer = new GapBuffer<number>(8)
    expect(buffer.gapSize).toBe(8)
    buffer.insert(1)
    expect(buffer.gapSize).toBe(7)
  })

  it('grows buffer when gap exhausted', () => {
    const buffer = new GapBuffer<number>(4)
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.insert(4)
    expect(buffer.capacity).toBe(4)
    buffer.insert(5)
    expect(buffer.capacity).toBe(8)
    expect(buffer.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles complex insertion and deletion pattern', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.deleteAt(1)
    buffer.insertAt(1, 20)
    buffer.insert(4)
    expect(buffer.toArray()).toEqual([1, 20, 4, 3])
  })

  it('length reflects total elements', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    expect(buffer.length).toBe(3)
  })

  it('delete reduces length', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.delete()
    expect(buffer.length).toBe(1)
  })

  it('toArray returns content', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.toArray()).toEqual([1, 2])
  })

  it('empty buffer toArray returns empty', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.toArray()).toEqual([])
  })

  it('insert then toArray returns elements', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.toArray()).toEqual([1, 2])
  })
})