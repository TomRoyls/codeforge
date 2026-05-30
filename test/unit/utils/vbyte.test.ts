import { describe, it, expect } from 'vitest'
import { VByte } from '../../../src/utils/vbyte.js'

describe('VByte', () => {
  describe('encode / decode', () => {
    it('encodes 0', () => {
      const encoded = VByte.encode(0)
      expect(encoded).toEqual(new Uint8Array([0]))
    })

    it('encodes small values (1 byte)', () => {
      expect(VByte.encode(1)).toEqual(new Uint8Array([1]))
      expect(VByte.encode(127)).toEqual(new Uint8Array([127]))
    })

    it('encodes 128 (2 bytes)', () => {
      expect(VByte.encode(128)).toEqual(new Uint8Array([0x80, 0x01]))
    })

    it('encodes 300 (2 bytes)', () => {
      expect(VByte.encode(300)).toEqual(new Uint8Array([0xAC, 0x02]))
    })

    it('encodes 16383 (2 bytes)', () => {
      expect(VByte.encode(16383)).toEqual(new Uint8Array([0xFF, 0x7F]))
    })

    it('encodes 16384 (3 bytes)', () => {
      expect(VByte.encode(16384)).toEqual(new Uint8Array([0x80, 0x80, 0x01]))
    })

    it('roundtrips single values', () => {
      const values = [0, 1, 127, 128, 255, 256, 16383, 16384, 100000, 268435455]
      for (const v of values) {
        const encoded = VByte.encode(v)
        const decoded = VByte.decode(encoded)
        expect(decoded.value).toBe(v)
        expect(decoded.bytesRead).toBe(encoded.length)
      }
    })

    it('rejects negative values', () => {
      expect(() => VByte.encode(-1)).toThrow(RangeError)
    })
  })

  describe('encodeMany / decodeMany', () => {
    it('roundtrips empty array', () => {
      const encoded = VByte.encodeMany([])
      expect(encoded.length).toBe(0)
      const decoded = VByte.decodeMany(encoded)
      expect(decoded.values).toEqual([])
    })

    it('roundtrips multiple values', () => {
      const values = [0, 1, 127, 128, 300, 10000]
      const encoded = VByte.encodeMany(values)
      const decoded = VByte.decodeMany(encoded)
      expect(decoded.values).toEqual(values)
    })

    it('decodeMany with count limit', () => {
      const values = [10, 20, 30, 40, 50]
      const encoded = VByte.encodeMany(values)
      const decoded = VByte.decodeMany(encoded, 3)
      expect(decoded.values).toEqual([10, 20, 30])
    })
  })

  describe('encodedSize', () => {
    it('returns correct sizes', () => {
      expect(VByte.encodedSize(0)).toBe(1)
      expect(VByte.encodedSize(127)).toBe(1)
      expect(VByte.encodedSize(128)).toBe(2)
      expect(VByte.encodedSize(16383)).toBe(2)
      expect(VByte.encodedSize(16384)).toBe(3)
      expect(VByte.encodedSize(2097151)).toBe(3)
      expect(VByte.encodedSize(2097152)).toBe(4)
    })

    it('rejects negative', () => {
      expect(() => VByte.encodedSize(-1)).toThrow(RangeError)
    })

    it('matches actual encode length', () => {
      const values = [0, 1, 100, 1000, 100000, 10000000]
      for (const v of values) {
        expect(VByte.encode(v).length).toBe(VByte.encodedSize(v))
      }
    })
  })

  describe('delta encoding', () => {
    it('encodes and decodes delta', () => {
      const values = [10, 15, 20, 100, 105]
      const encoded = VByte.encodeDelta(values)
      const decoded = VByte.decodeDelta(encoded)
      expect(decoded.values).toEqual(values)
    })

    it('handles empty array', () => {
      const encoded = VByte.encodeDelta([])
      expect(encoded.length).toBe(0)
      const decoded = VByte.decodeDelta(encoded)
      expect(decoded.values).toEqual([])
    })

    it('handles single element', () => {
      const encoded = VByte.encodeDelta([42])
      const decoded = VByte.decodeDelta(encoded)
      expect(decoded.values).toEqual([42])
    })

    it('handles identical values', () => {
      const values = [5, 5, 5, 5]
      const encoded = VByte.encodeDelta(values)
      const decoded = VByte.decodeDelta(encoded)
      expect(decoded.values).toEqual(values)
    })

    it('rejects decreasing values', () => {
      expect(() => VByte.encodeDelta([10, 5])).toThrow(RangeError)
    })

    it('roundtrips large monotonic sequence', () => {
      const values = Array.from({ length: 100 }, (_, i) => i * 100 + 50)
      const encoded = VByte.encodeDelta(values)
      const decoded = VByte.decodeDelta(encoded)
      expect(decoded.values).toEqual(values)
    })
  })

  describe('decode with offset', () => {
    it('decodes starting from offset', () => {
      const encoded = VByte.encodeMany([42, 99, 7])
      const result = VByte.decode(encoded, VByte.encode(42).length)
      expect(result.value).toBe(99)
    })
  })
})
