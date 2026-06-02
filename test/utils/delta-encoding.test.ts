import { describe, expect, it } from 'vitest'
import { DeltaEncoding } from '../../src/utils/delta-encoding.js'

describe('DeltaEncoding', () => {
  it('encodes and decodes ascending sequence', () => {
    const encoded = DeltaEncoding.encode([1, 3, 6, 10, 15])
    expect(encoded.first).toBe(1)
    expect(encoded.deltas).toEqual([2, 3, 4, 5])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([1, 3, 6, 10, 15])
  })

  it('handles empty array', () => {
    const encoded = DeltaEncoding.encode([])
    expect(encoded.first).toBe(0)
    expect(encoded.deltas).toEqual([])
    expect(DeltaEncoding.decode(0, [])).toEqual([])
  })

  it('handles single element', () => {
    const encoded = DeltaEncoding.encode([42])
    expect(encoded.first).toBe(42)
    expect(encoded.deltas).toEqual([])
    expect(DeltaEncoding.decode(42, [])).toEqual([42])
  })

  it('handles constant values', () => {
    const encoded = DeltaEncoding.encode([5, 5, 5, 5])
    expect(encoded.deltas).toEqual([0, 0, 0])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([5, 5, 5, 5])
  })

  it('handles descending sequence', () => {
    const encoded = DeltaEncoding.encode([10, 7, 4, 1])
    expect(encoded.deltas).toEqual([-3, -3, -3])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([10, 7, 4, 1])
  })

  it('handles negative numbers', () => {
    const encoded = DeltaEncoding.encode([-5, -3, 0, 4])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual([-5, -3, 0, 4])
  })

  it('zigzag encode/decode', () => {
    const encoded = DeltaEncoding.encodeZigzag([0, -1, 2, -3, 4])
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual([0, -1, 2, -3, 4])
  })

  it('compressSize returns reasonable size', () => {
    const encoded = DeltaEncoding.encode([1, 2, 3, 4, 5])
    expect(DeltaEncoding.compressSize(encoded.first, encoded.deltas)).toBeGreaterThan(0)
  })

  it('roundtrip with large numbers', () => {
    const arr = [1000000, 1000005, 1000015, 1000030]
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('zigzag roundtrip negative deltas', () => {
    const arr = [100, 90, 80, 70]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('roundtrip alternating positive negative', () => {
    const arr = [0, 5, -3, 8, -1]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles single element', () => {
    const arr = [42]
    const encoded = DeltaEncoding.encode(arr)
    expect(encoded.deltas.length).toBe(0)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('roundtrip empty array', () => {
    const arr: number[] = []
    const encoded = DeltaEncoding.encode(arr)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles all same values', () => {
    const arr = [5, 5, 5, 5]
    const encoded = DeltaEncoding.encode(arr)
    expect(encoded.deltas).toEqual([0, 0, 0])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles descending sequence', () => {
    const arr = [10, 7, 4, 1]
    const encoded = DeltaEncoding.encodeZigzag(arr)
    expect(DeltaEncoding.decodeZigzag(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles single element', () => {
    const arr = [42]
    const encoded = DeltaEncoding.encode(arr)
    expect(encoded.first).toBe(42)
    expect(encoded.deltas).toEqual([])
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(arr)
  })

  it('handles empty array', () => {
    const encoded = DeltaEncoding.encode([])
    expect(encoded.deltas).toEqual([])
  })

  it('roundtrip with single element', () => {
    const encoded = DeltaEncoding.encode([42])
    const decoded = DeltaEncoding.decode(encoded.first, encoded.deltas)
    expect(decoded).toEqual([42])
  })

  it('encode empty array returns zero first', () => {
    const encoded = DeltaEncoding.encode([])
    expect(encoded.first).toBe(0)
    expect(encoded.deltas).toEqual([])
  })

  it('encode and decode roundtrip', () => {
    const data = [10, 15, 12, 20]
    const encoded = DeltaEncoding.encode(data)
    expect(DeltaEncoding.decode(encoded.first, encoded.deltas)).toEqual(data)
  })
})
