import { describe, it, expect } from 'vitest'
import { SpatialHash2 } from '../../src/core/spatial-hash-2/index.js'

describe('SpatialHash2', () => {
  // ─── Constructor ───
  it('creates a spatial hash with positive cellSize', () => {
    const sh = new SpatialHash2(10)
    expect(sh.size).toBe(0)
  })

  it('throws on zero cellSize', () => {
    expect(() => new SpatialHash2(0)).toThrow('cellSize must be positive')
  })

  it('throws on negative cellSize', () => {
    expect(() => new SpatialHash2(-5)).toThrow('cellSize must be positive')
  })

  // ─── insert ───
  it('inserts entries and tracks size', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 5, 5)
    sh.insert('b', 15, 15)
    expect(sh.size).toBe(2)
    expect(sh.has('a')).toBe(true)
    expect(sh.has('b')).toBe(true)
  })

  it('inserts with value', () => {
    const sh = new SpatialHash2<string>(10)
    sh.insert('a', 5, 5, 'hello')
    expect(sh.has('a')).toBe(true)
  })

  it('replaces entry on duplicate id insert', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 5, 5)
    sh.insert('a', 25, 25)
    expect(sh.size).toBe(1)
    const results = sh.query(25, 25, 1)
    expect(results.length).toBe(1)
    expect(results[0]!.x).toBe(25)
  })

  // ─── remove ───
  it('removes an entry', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 5, 5)
    expect(sh.remove('a')).toBe(true)
    expect(sh.has('a')).toBe(false)
    expect(sh.size).toBe(0)
  })

  it('returns false removing non-existent id', () => {
    const sh = new SpatialHash2(10)
    expect(sh.remove('ghost')).toBe(false)
  })

  it('cleans up empty cells on remove', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 5, 5)
    sh.remove('a')
    expect(sh.query(5, 5, 1).length).toBe(0)
  })

  // ─── update ───
  it('updates position of existing entry', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 5, 5)
    expect(sh.update('a', 50, 50)).toBe(true)
    const nearOrigin = sh.query(5, 5, 5)
    const atNew = sh.query(50, 50, 5)
    expect(nearOrigin.length).toBe(0)
    expect(atNew.length).toBe(1)
    expect(atNew[0]!.x).toBe(50)
  })

  it('returns false updating non-existent entry', () => {
    const sh = new SpatialHash2(10)
    expect(sh.update('ghost', 10, 10)).toBe(false)
  })

  it('handles update to same cell', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 2, 3)
    expect(sh.update('a', 4, 5)).toBe(true)
    expect(sh.size).toBe(1)
    const results = sh.query(4, 5, 3)
    expect(results.length).toBe(1)
    expect(results[0]!.x).toBe(4)
  })

  // ─── query ───
  it('finds entries within radius', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 0, 0)
    sh.insert('b', 5, 0)
    sh.insert('c', 50, 50)
    const results = sh.query(0, 0, 6)
    expect(results.length).toBe(2)
    const ids = results.map((r) => r.id).sort()
    expect(ids).toEqual(['a', 'b'])
  })

  it('returns empty for no matches', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 100, 100)
    expect(sh.query(0, 0, 5).length).toBe(0)
  })

  it('respects exact radius boundary', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 0, 0)
    sh.insert('b', 10, 0)
    const results5 = sh.query(0, 0, 5)
    expect(results5.length).toBe(1)
    const results10 = sh.query(0, 0, 10)
    expect(results10.length).toBe(2)
  })

  // ─── queryCell ───
  it('queries specific cell', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 2, 3)
    sh.insert('b', 5, 7)
    const cell = sh.queryCell(0, 0)
    expect(cell.length).toBe(2)
  })

  it('returns empty for empty cell', () => {
    const sh = new SpatialHash2(10)
    expect(sh.queryCell(5, 5).length).toBe(0)
  })

  // ─── has ───
  it('checks entry existence', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 5, 5)
    expect(sh.has('a')).toBe(true)
    expect(sh.has('b')).toBe(false)
  })

  // ─── size ───
  it('tracks size correctly', () => {
    const sh = new SpatialHash2(10)
    expect(sh.size).toBe(0)
    sh.insert('a', 0, 0)
    expect(sh.size).toBe(1)
    sh.insert('b', 1, 1)
    expect(sh.size).toBe(2)
    sh.remove('a')
    expect(sh.size).toBe(1)
  })

  // ─── clear ───
  it('clears all entries', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', 5, 5)
    sh.insert('b', 15, 15)
    sh.clear()
    expect(sh.size).toBe(0)
    expect(sh.has('a')).toBe(false)
    expect(sh.query(5, 5, 10).length).toBe(0)
  })

  // ─── Edge cases ───
  it('handles negative coordinates', () => {
    const sh = new SpatialHash2(10)
    sh.insert('a', -5, -5)
    sh.insert('b', -15, -15)
    expect(sh.has('a')).toBe(true)
    expect(sh.query(-5, -5, 1).length).toBe(1)
  })

  it('handles fractional cellSize', () => {
    const sh = new SpatialHash2(0.5)
    sh.insert('a', 0.1, 0.1)
    sh.insert('b', 0.6, 0.1)
    expect(sh.size).toBe(2)
  })

  it('stores and retrieves value', () => {
    const sh = new SpatialHash2<number>(10)
    sh.insert('a', 5, 5, 42)
    const results = sh.query(5, 5, 1)
    expect(results[0]!.value).toBe(42)
  })
})
