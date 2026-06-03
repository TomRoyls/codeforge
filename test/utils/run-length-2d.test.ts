import { describe, expect, it } from 'vitest'
import { RunLength2D } from '../../src/utils/run-length-2d.js'

describe('RunLength2D', () => {
  it('encodes simple grid', () => {
    const grid = [[1, 1, 2], [3, 3, 3]]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 1, count: 2 }, { value: 2, count: 1 }],
      [{ value: 3, count: 3 }],
    ])
  })

  it('encodes empty grid', () => {
    expect(RunLength2D.encode([])).toEqual([])
  })

  it('encodes grid with empty rows', () => {
    expect(RunLength2D.encode([[]])).toEqual([[]])
  })

  it('encodes single value row', () => {
    expect(RunLength2D.encode([[5, 5, 5]])).toEqual([[{ value: 5, count: 3 }]])
  })

  it('encodes all different values', () => {
    expect(RunLength2D.encode([[1, 2, 3]])).toEqual([
      [{ value: 1, count: 1 }, { value: 2, count: 1 }, { value: 3, count: 1 }],
    ])
  })

  it('encodes string grid', () => {
    const grid = [['a', 'a', 'b']]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: 'a', count: 2 }, { value: 'b', count: 1 }]])
  })

  it('decode recovers original grid', () => {
    const grid = [[1, 1, 2], [3, 3, 3]]
    const encoded = RunLength2D.encode(grid)
    expect(RunLength2D.decode(encoded)).toEqual(grid)
  })

  it('roundtrip preserves data', () => {
    const grid = [[1, 2, 2, 3], [4, 4, 4, 4], [5, 6, 6, 6]]
    expect(RunLength2D.decode(RunLength2D.encode(grid))).toEqual(grid)
  })

  it('compressRatio returns 1 for no compression', () => {
    expect(RunLength2D.compressRatio([[1, 2, 3]])).toBeCloseTo(1)
  })

  it('compressRatio returns low for repetitive data', () => {
    expect(RunLength2D.compressRatio([[1, 1, 1, 1]])).toBeCloseTo(0.25)
  })

  it('compressRatio handles empty grid', () => {
    expect(RunLength2D.compressRatio([])).toBe(0)
  })

  it('fill creates uniform grid', () => {
    const grid = RunLength2D.fill(2, 3, 0)
    expect(grid).toEqual([[0, 0, 0], [0, 0, 0]])
  })

  it('fill and encode roundtrip', () => {
    const grid = RunLength2D.fill(3, 4, 'x')
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([
      [{ value: 'x', count: 4 }],
      [{ value: 'x', count: 4 }],
      [{ value: 'x', count: 4 }],
    ])
  })

  it('handles mixed types in grid', () => {
    const grid = [[1, 'a', 'a']]
    const encoded = RunLength2D.encode(grid)
    expect(encoded).toEqual([[{ value: 1, count: 1 }, { value: 'a', count: 2 }]])
  })

  it('large grid roundtrip', () => {
    const grid = Array.from({ length: 10 }, (_, r) =>
      Array.from({ length: 20 }, (_, c) => ((r + c) % 3).toString())
    )
    expect(RunLength2D.decode(RunLength2D.encode(grid))).toEqual(grid)
  })

  it('uniform grid encodes efficiently', () => {
    const grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 'x'))
    const encoded = RunLength2D.encode(grid)
    expect(encoded.length).toBeLessThan(10)
  })

  it('empty grid returns empty encoding', () => {
    const encoded = RunLength2D.encode([])
    expect(encoded).toEqual([])
  })

  it('1x1 grid returns single run', () => {
    const encoded = RunLength2D.encode([['a']])
    expect(encoded.length).toBe(1)
  })

  it('2x2 uniform grid encodes correctly', () => {
    const encoded = RunLength2D.encode([['a', 'a'], ['a', 'a']])
    expect(encoded.length).toBe(2)
    expect(encoded[0]).toEqual([{ value: 'a', count: 2 }])
  })

  it('encode single row single element', () => {
    const encoded = RunLength2D.encode([['x']])
    expect(encoded.length).toBe(1)
    expect(encoded[0]).toEqual([{ value: 'x', count: 1 }])
  })

  it('encode empty array returns empty', () => {
    expect(RunLength2D.encode([])).toEqual([])
  })

  it('encode single row', () => {
    expect(RunLength2D.encode([[1, 1, 2]])).toBeDefined()
  })

  it('encode empty grid returns empty', () => {
    expect(RunLength2D.encode([])).toEqual([])
  })
})
