import { describe, it, expect } from 'vitest'
import { VByte } from '../../src/utils/vbyte.js'

describe('VByte', () => {
  it('encodes zero', () => {
    const encoded = VByte.encode(0)
    expect(encoded.length).toBe(1)
    expect(encoded[0]).toBe(0)
  })

  it('encodes small values in single byte', () => {
    const encoded = VByte.encode(127)
    expect(encoded.length).toBe(1)
    expect(encoded[0]).toBe(127)
  })

  it('encodes values requiring multiple bytes', () => {
    const encoded = VByte.encode(128)
    expect(encoded.length).toBe(2)
    expect(encoded[0]! & 0x80).not.toBe(0)
    expect(encoded[1]! & 0x80).toBe(0)
  })

  it('encodes large values', () => {
    const encoded = VByte.encode(300)
    expect(encoded.length).toBe(2)
    const decoded = VByte.decode(encoded)
    expect(decoded.value).toBe(300)
  })

  it('decodes encoded value correctly', () => {
    for (const v of [0, 1, 127, 128, 255, 256, 16383, 16384, 100000]) {
      expect(VByte.decode(VByte.encode(v)).value).toBe(v)
    }
  })

  it('decode returns correct bytesRead', () => {
    expect(VByte.decode(VByte.encode(0)).bytesRead).toBe(1)
    expect(VByte.decode(VByte.encode(127)).bytesRead).toBe(1)
    expect(VByte.decode(VByte.encode(128)).bytesRead).toBe(2)
  })

  it('decode respects offset parameter', () => {
    const buf = new Uint8Array([0xFF, ...VByte.encode(42)])
    const result = VByte.decode(buf, 1)
    expect(result.value).toBe(42)
    expect(result.bytesRead).toBe(1)
  })

  it('encodeMany encodes multiple values', () => {
    const encoded = VByte.encodeMany([1, 2, 3])
    const { values } = VByte.decodeMany(encoded)
    expect(values).toEqual([1, 2, 3])
  })

  it('decodeMany respects count limit', () => {
    const encoded = VByte.encodeMany([10, 20, 30, 40])
    const { values } = VByte.decodeMany(encoded, 2)
    expect(values).toEqual([10, 20])
  })

  it('encodedSize returns correct sizes', () => {
    expect(VByte.encodedSize(0)).toBe(1)
    expect(VByte.encodedSize(127)).toBe(1)
    expect(VByte.encodedSize(128)).toBe(2)
    expect(VByte.encodedSize(16383)).toBe(2)
    expect(VByte.encodedSize(16384)).toBe(3)
  })

  it('encodeDelta encodes delta values', () => {
    const encoded = VByte.encodeDelta([10, 20, 25, 30])
    const { values } = VByte.decodeDelta(encoded)
    expect(values).toEqual([10, 20, 25, 30])
  })

  it('encodeDelta handles single value', () => {
    const encoded = VByte.encodeDelta([42])
    const { values } = VByte.decodeDelta(encoded)
    expect(values).toEqual([42])
  })

  it('encodeDelta handles empty array', () => {
    const encoded = VByte.encodeDelta([])
    expect(encoded.length).toBe(0)
  })

  it('encode throws on negative values', () => {
    expect(() => VByte.encode(-1)).toThrow(RangeError)
  })

  it('encodeDelta throws on decreasing values', () => {
    expect(() => VByte.encodeDelta([5, 3])).toThrow(RangeError)
  })

  it('roundtrips many values correctly', () => {
    const values = [0, 1, 100, 1000, 10000, 100000]
    const encoded = VByte.encodeMany(values)
    const { values: decoded } = VByte.decodeMany(encoded)
    expect(decoded).toEqual(values)
  })

  it('encode and decode zero', () => {
    const encoded = VByte.encodeMany([0])
    const { values: decoded } = VByte.decodeMany(encoded)
    expect(decoded).toEqual([0])
  })

  it('encode and decode single large number', () => {
    const encoded = VByte.encodeMany([300])
    const { values: decoded } = VByte.decodeMany(encoded)
    expect(decoded).toEqual([300])
  })

  it('encode and decode 0', () => {
    const encoded = VByte.encodeMany([0])
    const { values: decoded } = VByte.decodeMany(encoded)
    expect(decoded).toEqual([0])
  })

  it('roundtrip for multiple values', () => {
    const encoded = VByte.encodeMany([1, 128, 300])
    const { values: decoded } = VByte.decodeMany(encoded)
    expect(decoded).toEqual([1, 128, 300])
  })
})
