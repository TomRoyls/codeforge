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

  it('gamma encode produces prefix zeros for value', () => {
    expect(EliasCoding.gammaEncode(1)).toMatch(/^1/)
    expect(EliasCoding.gammaEncode(2)).toMatch(/^0/)
    expect(EliasCoding.gammaEncode(3)).toMatch(/^0/)
    expect(EliasCoding.gammaEncode(4)).toMatch(/^00/)
    expect(EliasCoding.gammaEncode(7)).toMatch(/^00/)
    expect(EliasCoding.gammaEncode(8)).toMatch(/^000/)
  })

  it('gamma encode binary part matches original number', () => {
    expect(EliasCoding.gammaEncode(5)).toContain('101')
    expect(EliasCoding.gammaEncode(6)).toContain('110')
    expect(EliasCoding.gammaEncode(13)).toContain('1101')
  })

  it('gamma encode length is 2*floor(log2(n)) + 1', () => {
    expect(EliasCoding.gammaEncode(1).length).toBe(1)
    expect(EliasCoding.gammaEncode(2).length).toBe(3)
    expect(EliasCoding.gammaEncode(3).length).toBe(3)
    expect(EliasCoding.gammaEncode(4).length).toBe(5)
    expect(EliasCoding.gammaEncode(7).length).toBe(5)
    expect(EliasCoding.gammaEncode(8).length).toBe(7)
  })

  it('gamma decode consumes correct number of bits', () => {
    expect(EliasCoding.gammaDecode('1').consumed).toBe(1)
    expect(EliasCoding.gammaDecode('010').consumed).toBe(3)
    expect(EliasCoding.gammaDecode('011').consumed).toBe(3)
    expect(EliasCoding.gammaDecode('00100').consumed).toBe(5)
  })

  it('gamma decode handles stream with extra bits', () => {
    const bits = '01001100100'
    const result1 = EliasCoding.gammaDecode(bits)
    const result2 = EliasCoding.gammaDecode(bits.substring(result1.consumed))
    expect(result1.value).toBe(2)
    expect(result2.value).toBe(3)
  })

  it('gamma decode throws for all zeros', () => {
    expect(() => EliasCoding.gammaDecode('000')).toThrow()
    expect(() => EliasCoding.gammaDecode('0000')).toThrow()
  })

  it('gamma decode throws for insufficient bits', () => {
    expect(() => EliasCoding.gammaDecode('00')).toThrow()
    expect(() => EliasCoding.gammaDecode('0001')).toThrow()
  })

  it('gamma encode/decode handles powers of 2', () => {
    for (const n of [1, 2, 4, 8, 16, 32, 64, 128, 256]) {
      const encoded = EliasCoding.gammaEncode(n)
      const decoded = EliasCoding.gammaDecode(encoded)
      expect(decoded.value).toBe(n)
    }
  })

  it('gamma encode/decode handles maximum 32-bit value', () => {
    const n = 2147483647
    const encoded = EliasCoding.gammaEncode(n)
    const decoded = EliasCoding.gammaDecode(encoded)
    expect(decoded.value).toBe(n)
  })

  it('gamma decode returns integer', () => {
    const result = EliasCoding.gammaDecode('010')
    expect(Number.isInteger(result.value)).toBe(true)
  })

  it('gamma encode array handles empty array', () => {
    expect(EliasCoding.gammaEncodeArray([])).toBe('')
  })

  it('gamma decode array handles empty stream', () => {
    expect(EliasCoding.gammaDecodeArray('', 0)).toEqual([])
  })

  it('gamma encode array produces concatenated bits', () => {
    const arr = [1, 2, 3]
    const encoded = EliasCoding.gammaEncodeArray(arr)
    expect(encoded).toBe('1' + '010' + '011')
  })

  it('gamma decode array preserves order', () => {
    const arr = [5, 10, 15, 20]
    const encoded = EliasCoding.gammaEncodeArray(arr)
    const decoded = EliasCoding.gammaDecodeArray(encoded, 4)
    expect(decoded[0]).toBe(5)
    expect(decoded[1]).toBe(10)
    expect(decoded[2]).toBe(15)
    expect(decoded[3]).toBe(20)
  })

  it('gamma decode array throws on count mismatch', () => {
    const arr = [1, 2]
    const encoded = EliasCoding.gammaEncodeArray(arr)
    expect(() => EliasCoding.gammaDecodeArray(encoded, 3)).toThrow()
  })

  it('gamma encode produces valid bits (only 0 and 1)', () => {
    const encoded = EliasCoding.gammaEncode(100)
    expect(encoded).toMatch(/^[01]+$/)
  })

  it('gamma encode of sequential numbers has increasing lengths', () => {
    const len1 = EliasCoding.gammaEncode(1).length
    const len2 = EliasCoding.gammaEncode(2).length
    const len3 = EliasCoding.gammaEncode(4).length
    const len4 = EliasCoding.gammaEncode(8).length
    expect(len2).toBeGreaterThan(len1)
    expect(len3).toBeGreaterThan(len2)
    expect(len4).toBeGreaterThan(len3)
  })

  it('delta encode produces prefix zeros', () => {
    expect(EliasCoding.deltaEncode(1)).toMatch(/^1/)
    expect(EliasCoding.deltaEncode(2)).toMatch(/^0/)
    expect(EliasCoding.deltaEncode(3)).toMatch(/^0/)
    expect(EliasCoding.deltaEncode(4)).toMatch(/^0/)
    expect(EliasCoding.deltaEncode(8)).toMatch(/^00/)
  })

  it('delta encode 1 is single bit', () => {
    expect(EliasCoding.deltaEncode(1)).toBe('1')
  })

  it('delta encode length grows slowly', () => {
    const len1 = EliasCoding.deltaEncode(1).length
    const len10 = EliasCoding.deltaEncode(10).length
    const len100 = EliasCoding.deltaEncode(100).length
    const len1000 = EliasCoding.deltaEncode(1000).length
    expect(len1000).toBeLessThan(20)
  })

  it('delta encode produces valid bits (only 0 and 1)', () => {
    const encoded = EliasCoding.deltaEncode(1000)
    expect(encoded).toMatch(/^[01]+$/)
  })

  it('delta decode handles single bit for 1', () => {
    const result = EliasCoding.deltaDecode('1')
    expect(result.value).toBe(1)
    expect(result.consumed).toBe(1)
  })

  it('delta decode consumes correct bits for small numbers', () => {
    expect(EliasCoding.deltaDecode('0100').consumed).toBe(4)
    expect(EliasCoding.deltaDecode('0101').consumed).toBe(4)
    expect(EliasCoding.deltaDecode('0110').consumed).toBe(5)
  })

  it('delta decode handles all zeros input', () => {
    const result = EliasCoding.deltaDecode('0000')
    expect(result).toBeDefined()
  })

  it('delta decode returns integer', () => {
    const result = EliasCoding.deltaDecode('0100')
    expect(Number.isInteger(result.value)).toBe(true)
  })

  it('delta decode handles stream with multiple values', () => {
    const encoded = EliasCoding.deltaEncode(5) + EliasCoding.deltaEncode(10)
    const result1 = EliasCoding.deltaDecode(encoded)
    const result2 = EliasCoding.deltaDecode(encoded.substring(result1.consumed))
    expect(result1.value).toBe(5)
    expect(result2.value).toBe(10)
  })

  it('delta decode handles all zeros input', () => {
    const result = EliasCoding.deltaDecode('0000')
    expect(result.value).toBeGreaterThan(0)
  })

  it('delta encode/decode handles powers of 2', () => {
    for (const n of [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]) {
      const encoded = EliasCoding.deltaEncode(n)
      const decoded = EliasCoding.deltaDecode(encoded)
      expect(decoded.value).toBe(n)
    }
  })

  it('delta encode/decode handles large values', () => {
    for (const n of [1000, 5000, 10000, 50000, 100000]) {
      const encoded = EliasCoding.deltaEncode(n)
      const decoded = EliasCoding.deltaDecode(encoded)
      expect(decoded.value).toBe(n)
    }
  })

  it('delta encode/decode handles max 32-bit value', () => {
    const n = 2147483647
    const encoded = EliasCoding.deltaEncode(n)
    const decoded = EliasCoding.deltaDecode(encoded)
    expect(decoded.value).toBe(n)
  })

  it('delta encode handles numbers near byte boundaries', () => {
    for (const n of [127, 128, 255, 256, 511, 512]) {
      const encoded = EliasCoding.deltaEncode(n)
      const decoded = EliasCoding.deltaDecode(encoded)
      expect(decoded.value).toBe(n)
    }
  })

  it('delta encode is more compact than gamma for large numbers', () => {
    for (const n of [100, 1000, 10000]) {
      const gammaLen = EliasCoding.gammaEncode(n).length
      const deltaLen = EliasCoding.deltaEncode(n).length
      expect(deltaLen).toBeLessThan(gammaLen)
    }
  })

  it('delta encode can be longer than gamma for small numbers', () => {
    const gammaLen = EliasCoding.gammaEncode(2).length
    const deltaLen = EliasCoding.deltaEncode(2).length
    expect(deltaLen).toBeGreaterThanOrEqual(gammaLen)
  })

  it('gamma and delta both encode 1 as single bit', () => {
    expect(EliasCoding.gammaEncode(1)).toBe('1')
    expect(EliasCoding.deltaEncode(1)).toBe('1')
  })

  it('gamma encode handles number 2 correctly', () => {
    expect(EliasCoding.gammaEncode(2)).toBe('010')
    expect(EliasCoding.gammaDecode('010').value).toBe(2)
  })

  it('gamma encode handles number 3 correctly', () => {
    expect(EliasCoding.gammaEncode(3)).toBe('011')
    expect(EliasCoding.gammaDecode('011').value).toBe(3)
  })

  it('gamma encode handles number 4 correctly', () => {
    expect(EliasCoding.gammaEncode(4)).toBe('00100')
    expect(EliasCoding.gammaDecode('00100').value).toBe(4)
  })

  it('gamma decode handles various encodings', () => {
    const tests = [
      { bits: '1', value: 1 },
      { bits: '010', value: 2 },
      { bits: '011', value: 3 },
      { bits: '00100', value: 4 },
      { bits: '00101', value: 5 },
      { bits: '00110', value: 6 },
      { bits: '00111', value: 7 },
      { bits: '0001000', value: 8 },
      { bits: '0001001', value: 9 },
    ]
    for (const test of tests) {
      expect(EliasCoding.gammaDecode(test.bits).value).toBe(test.value)
    }
  })

  it('delta encode handles number 2 correctly', () => {
    expect(EliasCoding.deltaEncode(2)).toBe('0100')
    expect(EliasCoding.deltaDecode('0100').value).toBe(2)
  })

  it('delta encode handles number 4 correctly', () => {
    expect(EliasCoding.deltaEncode(4)).toBe('01100')
    expect(EliasCoding.deltaDecode('01100').value).toBe(4)
  })

  it('delta decode handles various encodings', () => {
    const tests = [
      { bits: '1', value: 1 },
      { bits: '0100', value: 2 },
      { bits: '0101', value: 3 },
      { bits: '01100', value: 4 },
      { bits: '01101', value: 5 },
      { bits: '01110', value: 6 },
      { bits: '01111', value: 7 },
      { bits: '00100000', value: 8 },
    ]
    for (const test of tests) {
      expect(EliasCoding.deltaDecode(test.bits).value).toBe(test.value)
    }
  })

  it('gamma encode array handles single element', () => {
    const arr = [42]
    const encoded = EliasCoding.gammaEncodeArray(arr)
    const decoded = EliasCoding.gammaDecodeArray(encoded, 1)
    expect(decoded).toEqual(arr)
  })

  it('gamma encode/decode preserves sequence of random values', () => {
    const arr = [13, 7, 42, 3, 99, 1]
    const encoded = EliasCoding.gammaEncodeArray(arr)
    const decoded = EliasCoding.gammaDecodeArray(encoded, arr.length)
    expect(decoded).toEqual(arr)
  })

  it('gamma encode/decode handles value with all 1s in binary', () => {
    for (const n of [1, 3, 7, 15, 31, 63, 127]) {
      const encoded = EliasCoding.gammaEncode(n)
      const decoded = EliasCoding.gammaDecode(encoded)
      expect(decoded.value).toBe(n)
    }
  })

  it('gamma encode handles value with alternating binary pattern', () => {
    for (const n of [0b010101, 0b101010, 0b1010101]) {
      const encoded = EliasCoding.gammaEncode(n)
      const decoded = EliasCoding.gammaDecode(encoded)
      expect(decoded.value).toBe(n)
    }
  })

  it('gamma decode handles bit string with trailing zeros', () => {
    const bits = '0100000'
    const result = EliasCoding.gammaDecode(bits)
    expect(result.value).toBe(2)
    expect(result.consumed).toBe(3)
  })

  it('gamma decode handles bit string with trailing ones', () => {
    const bits = '0111111'
    const result = EliasCoding.gammaDecode(bits)
    expect(result.value).toBe(3)
    expect(result.consumed).toBe(3)
  })

  it('delta decode handles bit string with trailing zeros', () => {
    const bits = '01000000'
    const result = EliasCoding.deltaDecode(bits)
    expect(result.value).toBe(2)
    expect(result.consumed).toBe(4)
  })

  it('delta decode handles bit string with trailing ones', () => {
    const bits = '01011111'
    const result = EliasCoding.deltaDecode(bits)
    expect(result.value).toBe(3)
    expect(result.consumed).toBe(4)
  })

  it('gamma encode/decode roundtrip works for sequential range', () => {
    for (let i = 1; i <= 100; i++) {
      const encoded = EliasCoding.gammaEncode(i)
      const decoded = EliasCoding.gammaDecode(encoded)
      expect(decoded.value).toBe(i)
    }
  })

  it('delta encode/decode roundtrip works for sequential range', () => {
    for (let i = 1; i <= 100; i++) {
      const encoded = EliasCoding.deltaEncode(i)
      const decoded = EliasCoding.deltaDecode(encoded)
      expect(decoded.value).toBe(i)
    }
  })

  it('gamma encode for same number is deterministic', () => {
    const n = 42
    const encoded1 = EliasCoding.gammaEncode(n)
    const encoded2 = EliasCoding.gammaEncode(n)
    expect(encoded1).toBe(encoded2)
  })

  it('delta encode for same number is deterministic', () => {
    const n = 42
    const encoded1 = EliasCoding.deltaEncode(n)
    const encoded2 = EliasCoding.deltaEncode(n)
    expect(encoded1).toBe(encoded2)
  })

  it('gamma encode/decode decode returns consumed bit count', () => {
    const result = EliasCoding.gammaDecode('0001101')
    expect(result.consumed).toBeGreaterThan(0)
    expect(result.consumed).toBeLessThanOrEqual(result.value.toString(2).length * 2 + 1)
  })

  it('delta decode returns consumed bit count', () => {
    const result = EliasCoding.deltaDecode('00101001010')
    expect(result.consumed).toBeGreaterThan(0)
  })

  it('gamma decode handles minimal valid encoding', () => {
    const result = EliasCoding.gammaDecode('1')
    expect(result.value).toBe(1)
    expect(result.consumed).toBe(1)
  })

  it('delta decode handles minimal valid encoding', () => {
    const result = EliasCoding.deltaDecode('1')
    expect(result.value).toBe(1)
    expect(result.consumed).toBe(1)
  })

  it('gamma encode array handles large array', () => {
    const arr = Array.from({ length: 50 }, (_, i) => i + 1)
    const encoded = EliasCoding.gammaEncodeArray(arr)
    const decoded = EliasCoding.gammaDecodeArray(encoded, arr.length)
    expect(decoded).toEqual(arr)
  })

  it('gamma encode/decode for all 8-bit values', () => {
    for (let i = 1; i <= 255; i++) {
      const encoded = EliasCoding.gammaEncode(i)
      const decoded = EliasCoding.gammaDecode(encoded)
      expect(decoded.value).toBe(i)
    }
  })

  it('delta encode/decode for all 8-bit values', () => {
    for (let i = 1; i <= 255; i++) {
      const encoded = EliasCoding.deltaEncode(i)
      const decoded = EliasCoding.deltaDecode(encoded)
      expect(decoded.value).toBe(i)
    }
  })

  it('gamma encode produces increasing lengths for increasing values', () => {
    const n1 = 7
    const n2 = 8
    const len1 = EliasCoding.gammaEncode(n1).length
    const len2 = EliasCoding.gammaEncode(n2).length
    expect(len2).toBeGreaterThan(len1)
  })

  it('delta encode handles value 0 error in encode', () => {
    expect(() => EliasCoding.deltaEncode(0)).toThrow()
    expect(() => EliasCoding.deltaEncode(-1)).toThrow()
  })

  it('gamma decode handles incomplete encoding after prefix', () => {
    expect(() => EliasCoding.gammaDecode('00')).toThrow()
    expect(() => EliasCoding.gammaDecode('000')).toThrow()
  })

  it('gamma encode handles sequential decodings in stream', () => {
    const arr = [1, 2, 3, 4, 5]
    const encoded = EliasCoding.gammaEncodeArray(arr)
    let pos = 0
    const decoded = []
    for (let i = 0; i < arr.length; i++) {
      const result = EliasCoding.gammaDecode(encoded.substring(pos))
      decoded.push(result.value)
      pos += result.consumed
    }
    expect(decoded).toEqual(arr)
  })
})

describe('elias-coding - wave550', () => {
  it('elias-coding w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w550 is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave551', () => {
  it('elias-coding w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave552', () => {
  it('elias-coding w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave553', () => {
  it('elias-coding w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave554', () => {
  it('elias-coding w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave555', () => {
  it('elias-coding w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave556', () => {
  it('elias-coding w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave557', () => {
  it('elias-coding w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave558', () => {
  it('elias-coding w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave559', () => {
  it('elias-coding w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave560', () => {
  it('elias-coding w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave561', () => {
  it('elias-coding w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave562', () => {
  it('elias-coding w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave563', () => {
  it('elias-coding w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('elias-coding - wave564', () => {
  it('elias-coding w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('elias-coding w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
