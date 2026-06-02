import { describe, expect, it } from 'vitest'
import { RunLengthEncoding } from '../../src/utils/run-length-encoding.js'

describe('RunLengthEncoding', () => {
  it('encodes empty array', () => {
    expect(RunLengthEncoding.encode([])).toEqual([])
  })

  it('encodes single element', () => {
    expect(RunLengthEncoding.encode([5])).toEqual([{ value: 5, count: 1 }])
  })

  it('encodes repeated elements', () => {
    expect(RunLengthEncoding.encode([1, 1, 1])).toEqual([{ value: 1, count: 3 }])
  })

  it('encodes mixed elements', () => {
    expect(RunLengthEncoding.encode([1, 1, 2, 3, 3, 3])).toEqual([
      { value: 1, count: 2 },
      { value: 2, count: 1 },
      { value: 3, count: 3 },
    ])
  })

  it('encodes alternating elements', () => {
    expect(RunLengthEncoding.encode([1, 2, 1, 2])).toEqual([
      { value: 1, count: 1 },
      { value: 2, count: 1 },
      { value: 1, count: 1 },
      { value: 2, count: 1 },
    ])
  })

  it('decodes back to original', () => {
    const data = [1, 1, 2, 3, 3, 3]
    const encoded = RunLengthEncoding.encode(data)
    expect(RunLengthEncoding.decode(encoded)).toEqual(data)
  })

  it('roundtrip for strings', () => {
    const data = ['a', 'a', 'b', 'c', 'c', 'c']
    expect(RunLengthEncoding.decode(RunLengthEncoding.encode(data))).toEqual(data)
  })

  it('encodeString works', () => {
    const result = RunLengthEncoding.encodeString('aaabbc')
    expect(result).toEqual([
      { value: 'a', count: 3 },
      { value: 'b', count: 2 },
      { value: 'c', count: 1 },
    ])
  })

  it('decodeString works', () => {
    expect(RunLengthEncoding.decodeString([
      { value: 'a', count: 3 },
      { value: 'b', count: 2 },
    ])).toBe('aaabb')
  })

  it('compressionRatio for highly compressible', () => {
    const data = Array(100).fill(1)
    expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(0.01)
  })

  it('compressionRatio for incompressible', () => {
    const data = [1, 2, 3, 4, 5]
    expect(RunLengthEncoding.compressionRatio(data)).toBeCloseTo(1)
  })

  it('compressionRatio for empty', () => {
    expect(RunLengthEncoding.compressionRatio([])).toBe(1)
  })

  it('handles strings with repeated chars', () => {
    const encoded = RunLengthEncoding.encodeString('AAAAABBBCC')
    expect(encoded.length).toBe(3)
    expect(RunLengthEncoding.decodeString(encoded)).toBe('AAAAABBBCC')
  })

  it('handles boolean runs', () => {
    const data = [true, true, false, true]
    const encoded = RunLengthEncoding.encode(data)
    expect(encoded).toEqual([
      { value: true, count: 2 },
      { value: false, count: 1 },
      { value: true, count: 1 },
    ])
  })

  it('decode empty runs', () => {
    expect(RunLengthEncoding.decode([])).toEqual([])
  })

  it('single element roundtrip', () => {
    const encoded = RunLengthEncoding.encode([42])
    expect(RunLengthEncoding.decode(encoded)).toEqual([42])
  })

  it('encodes all same elements efficiently', () => {
    const encoded = RunLengthEncoding.encode([5, 5, 5, 5, 5])
    expect(encoded.length).toBe(1)
  })

  it('decode roundtrip', () => {
    const original = [1, 2, 2, 3, 3, 3]
    const encoded = RunLengthEncoding.encode(original)
    expect(RunLengthEncoding.decode(encoded)).toEqual(original)
  })

  it('encode handles empty array', () => {
    expect(RunLengthEncoding.encode([])).toEqual([])
  })

  it('encode single element', () => {
    expect(RunLengthEncoding.encode([5])).toEqual([{ value: 5, count: 1 }])
  })
})
