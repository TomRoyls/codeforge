import { describe, expect, it } from 'vitest'
import { EliasCoding } from '../../src/utils/elias-coding.js'

describe('EliasCoding', () => {
  it('gamma encodes small numbers', () => {
    expect(EliasCoding.gammaEncode(1)).toBe('1')
    expect(EliasCoding.gammaEncode(2)).toBe('010')
    expect(EliasCoding.gammaEncode(3)).toBe('011')
    expect(EliasCoding.gammaEncode(4)).toBe('00100')
  })

  it('gamma decodes', () => {
    expect(EliasCoding.gammaDecode('1')).toEqual({ value: 1, consumed: 1 })
    expect(EliasCoding.gammaDecode('010')).toEqual({ value: 2, consumed: 3 })
  })

  it('gamma encode/decode array roundtrip', () => {
    const arr = [1, 2, 3, 4, 5]
    const encoded = EliasCoding.gammaEncodeArray(arr)
    const decoded = EliasCoding.gammaDecodeArray(encoded, 5)
    expect(decoded).toEqual(arr)
  })

  it('delta encodes small numbers', () => {
    expect(EliasCoding.deltaEncode(1)).toBe('1')
    expect(EliasCoding.deltaEncode(2)).toBe('0100')
    expect(EliasCoding.deltaEncode(4)).toBe('01100')
  })

  it('delta decode', () => {
    expect(EliasCoding.deltaDecode('1')).toEqual({ value: 1, consumed: 1 })
    expect(EliasCoding.deltaDecode('0100')).toEqual({ value: 2, consumed: 4 })
  })

  it('gamma throws for n < 1', () => {
    expect(() => EliasCoding.gammaEncode(0)).toThrow()
  })

  it('gamma encodes larger numbers', () => {
    const encoded = EliasCoding.gammaEncode(10)
    const decoded = EliasCoding.gammaDecode(encoded)
    expect(decoded.value).toBe(10)
  })

  it('delta encode/decode roundtrip', () => {
    for (const n of [1, 5, 15, 100, 1000]) {
      const encoded = EliasCoding.deltaEncode(n)
      const decoded = EliasCoding.deltaDecode(encoded)
      expect(decoded.value).toBe(n)
    }
  })

  it('gamma handles larger array', () => {
    const arr = [1, 3, 5, 7, 9, 11]
    const encoded = EliasCoding.gammaEncodeArray(arr)
    const decoded = EliasCoding.gammaDecodeArray(encoded, 6)
    expect(decoded).toEqual(arr)
  })

  it('delta encode produces shorter output than gamma for large n', () => {
    const gammaLen = EliasCoding.gammaEncode(100).length
    const deltaLen = EliasCoding.deltaEncode(100).length
    expect(deltaLen).toBeLessThanOrEqual(gammaLen)
  })

  it('gamma encode 1 is single 1', () => {
    expect(EliasCoding.gammaEncode(1)).toBe('1')
  })

  it('delta decode handles partial strings', () => {
    const encoded = EliasCoding.deltaEncode(5)
    const decoded = EliasCoding.deltaDecode(encoded)
    expect(decoded.value).toBe(5)
  })

  it('gamma roundtrip large values', () => {
    for (const n of [1, 10, 50, 100, 255]) {
      expect(EliasCoding.gammaDecode(EliasCoding.gammaEncode(n)).value).toBe(n)
    }
  })

  it('delta encode 1 is single bit', () => {
    const encoded = EliasCoding.deltaEncode(1)
    expect(encoded.length).toBeGreaterThanOrEqual(1)
    expect(EliasCoding.deltaDecode(encoded).value).toBe(1)
  })

  it('delta roundtrip multiple values', () => {
    for (const n of [2, 4, 8, 16]) {
      const encoded = EliasCoding.deltaEncode(n)
      expect(EliasCoding.deltaDecode(encoded).value).toBe(n)
    }
  })

  it('gamma roundtrip single value', () => {
    const encoded = EliasCoding.gammaEncode(7)
    expect(EliasCoding.gammaDecode(encoded).value).toBe(7)
  })

  it('delta roundtrip for 1', () => {
    const encoded = EliasCoding.deltaEncode(1)
    expect(EliasCoding.deltaDecode(encoded).value).toBe(1)
  })

  it('gamma roundtrip for 5', () => {
    const encoded = EliasCoding.gammaEncode(5)
    expect(EliasCoding.gammaDecode(encoded).value).toBe(5)
  })

  it('gamma roundtrip for 1', () => {
    const encoded = EliasCoding.gammaEncode(1)
    expect(EliasCoding.gammaDecode(encoded).value).toBe(1)
  })

  it('delta roundtrip for 5', () => {
    const encoded = EliasCoding.deltaEncode(5)
    expect(EliasCoding.deltaDecode(encoded).value).toBe(5)
  })

  it('gamma roundtrip for 3', () => {
    const encoded = EliasCoding.gammaEncode(3)
    expect(EliasCoding.gammaDecode(encoded).value).toBe(3)
  })

  it('delta roundtrip for 5', () => {
    const encoded = EliasCoding.deltaEncode(5)
    expect(EliasCoding.deltaDecode(encoded).value).toBe(5)
  })

  it('gamma roundtrip for 10', () => {
    const encoded = EliasCoding.gammaEncode(10)
    expect(EliasCoding.gammaDecode(encoded).value).toBe(10)
  })

  it('delta roundtrip for 5', () => {
    const encoded = EliasCoding.deltaEncode(5)
    expect(EliasCoding.deltaDecode(encoded).value).toBe(5)
  })

  it('gamma roundtrip for 10', () => {
    const encoded = EliasCoding.gammaEncode(10)
    expect(EliasCoding.gammaDecode(encoded).value).toBe(10)
  })
})
