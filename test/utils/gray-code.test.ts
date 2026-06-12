import { describe, expect, it } from 'vitest'
import { GrayCode } from '../../src/utils/gray-code.js'

describe('GrayCode', () => {
  it('generates gray codes for n=1', () => {
    expect(GrayCode.generate(1)).toEqual(['0', '1'])
  })

  it('generates gray codes for n=2', () => {
    expect(GrayCode.generate(2)).toEqual(['00', '01', '11', '10'])
  })

  it('generates gray codes for n=3', () => {
    expect(GrayCode.generate(3)).toEqual([
      '000', '001', '011', '010', '110', '111', '101', '100',
    ])
  })

  it('handles n=0', () => {
    expect(GrayCode.generate(0)).toEqual([''])
  })

  it('generates correct count', () => {
    expect(GrayCode.generate(4).length).toBe(16)
    expect(GrayCode.generate(5).length).toBe(32)
  })

  it('adjacent codes differ by exactly one bit', () => {
    const codes = GrayCode.generate(4)
    for (let i = 1; i < codes.length; i++) {
      expect(GrayCode.isGrayCodePair(parseInt(codes[i - 1]!, 2), parseInt(codes[i]!, 2))).toBe(true)
    }
  })

  it('first and last differ by one bit', () => {
    const codes = GrayCode.generate(4)
    expect(GrayCode.isGrayCodePair(parseInt(codes[0]!, 2), parseInt(codes[codes.length - 1]!, 2))).toBe(true)
  })

  it('binaryToGray converts correctly', () => {
    expect(GrayCode.binaryToGray(0)).toBe(0)
    expect(GrayCode.binaryToGray(1)).toBe(1)
    expect(GrayCode.binaryToGray(2)).toBe(3)
    expect(GrayCode.binaryToGray(3)).toBe(2)
    expect(GrayCode.binaryToGray(7)).toBe(4)
  })

  it('grayToBinary inverts binaryToGray', () => {
    for (let i = 0; i < 32; i++) {
      expect(GrayCode.grayToBinary(GrayCode.binaryToGray(i))).toBe(i)
    }
  })

  it('isGrayCodePair detects single-bit difference', () => {
    expect(GrayCode.isGrayCodePair(0, 1)).toBe(true)
    expect(GrayCode.isGrayCodePair(0, 2)).toBe(true)
    expect(GrayCode.isGrayCodePair(0, 3)).toBe(false)
    expect(GrayCode.isGrayCodePair(5, 7)).toBe(true)
  })

  it('isGrayCodePair rejects same number', () => {
    expect(GrayCode.isGrayCodePair(5, 5)).toBe(false)
  })

  it('generateNumbers returns gray codes as numbers', () => {
    expect(GrayCode.generateNumbers(3)).toEqual([0, 1, 3, 2, 6, 7, 5, 4])
  })

  it('count returns 2^n', () => {
    expect(GrayCode.count(4)).toBe(16)
    expect(GrayCode.count(0)).toBe(1)
  })

  it('all codes are unique', () => {
    const codes = GrayCode.generate(5)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('roundtrip binaryToGray and grayToBinary for range', () => {
    for (let i = 0; i < 256; i++) {
      const gray = GrayCode.binaryToGray(i)
      const back = GrayCode.grayToBinary(gray)
      expect(back).toBe(i)
    }
  })

  it('generateNumbers matches generate parsed', () => {
    const strings = GrayCode.generate(4)
    const numbers = GrayCode.generateNumbers(4)
    expect(numbers).toEqual(strings.map(s => parseInt(s, 2)))
  })

  it('generate 0 bits returns empty', () => {
    const result = GrayCode.generate(0)
    expect(result.length).toBe(1)
  })

  it('generate 1 bit returns two codes', () => {
    const result = GrayCode.generate(1)
    expect(result).toEqual(['0', '1'])
  })

  it('generate 2 bits returns four codes', () => {
    const result = GrayCode.generate(2)
    expect(result.length).toBe(4)
    expect(result).toEqual(['00', '01', '11', '10'])
  })

  it('generate 3 bits produces 8 codes', () => {
    const result = GrayCode.generate(3)
    expect(result.length).toBe(8)
  })

  it('generate 0 bits produces 1 code', () => {
    const result = GrayCode.generate(0)
    expect(result.length).toBe(1)
  })

  it('generate 1 bit produces 2 codes', () => {
    const result = GrayCode.generate(1)
    expect(result.length).toBe(2)
  })

  it('generate 2 bits produces 4 codes', () => {
    const result = GrayCode.generate(2)
    expect(result.length).toBe(4)
  })

  it('generate 1 bit produces 2 codes', () => {
    const result = GrayCode.generate(1)
    expect(result.length).toBe(2)
  })

  it('binaryToGray handles large numbers', () => {
    expect(GrayCode.binaryToGray(255)).toBe(128)
    expect(GrayCode.binaryToGray(256)).toBe(384)
    expect(GrayCode.binaryToGray(1023)).toBe(512)
  })

  it('grayToBinary handles large numbers', () => {
    expect(GrayCode.grayToBinary(128)).toBe(255)
    expect(GrayCode.grayToBinary(384)).toBe(256)
    expect(GrayCode.grayToBinary(512)).toBe(1023)
  })

  it('isGrayCodePair returns false for multi-bit difference', () => {
    expect(GrayCode.isGrayCodePair(0, 3)).toBe(false)
    expect(GrayCode.isGrayCodePair(5, 2)).toBe(false)
    expect(GrayCode.isGrayCodePair(15, 0)).toBe(false)
  })

  it('isGrayCodePair detects power of two differences', () => {
    expect(GrayCode.isGrayCodePair(0, 1)).toBe(true)
    expect(GrayCode.isGrayCodePair(0, 2)).toBe(true)
    expect(GrayCode.isGrayCodePair(0, 4)).toBe(true)
    expect(GrayCode.isGrayCodePair(0, 8)).toBe(true)
    expect(GrayCode.isGrayCodePair(0, 16)).toBe(true)
  })

  it('isGrayCodePair returns false for zero difference', () => {
    expect(GrayCode.isGrayCodePair(0, 0)).toBe(false)
    expect(GrayCode.isGrayCodePair(42, 42)).toBe(false)
  })

  it('isGrayCodePair returns false for same number reversed', () => {
    expect(GrayCode.isGrayCodePair(5, 5)).toBe(false)
    expect(GrayCode.isGrayCodePair(100, 100)).toBe(false)
  })

  it('generate returns strings of correct length', () => {
    for (let n = 1; n <= 8; n++) {
      const codes = GrayCode.generate(n)
      for (const code of codes) {
        expect(code.length).toBe(n)
      }
    }
  })

  it('generate produces only 0 and 1 characters', () => {
    const codes = GrayCode.generate(5)
    for (const code of codes) {
      expect(code).toMatch(/^[01]+$/)
    }
  })

  it('generateNumbers returns correct count', () => {
    expect(GrayCode.generateNumbers(1).length).toBe(2)
    expect(GrayCode.generateNumbers(2).length).toBe(4)
    expect(GrayCode.generateNumbers(3).length).toBe(8)
    expect(GrayCode.generateNumbers(4).length).toBe(16)
  })

  it('generateNumbers produces unique values', () => {
    const numbers = GrayCode.generateNumbers(4)
    const unique = new Set(numbers)
    expect(unique.size).toBe(numbers.length)
  })

  it('generateNumbers produces values in range', () => {
    const numbers = GrayCode.generateNumbers(4)
    for (const num of numbers) {
      expect(num).toBeGreaterThanOrEqual(0)
      expect(num).toBeLessThan(16)
    }
  })

  it('count returns 1 for n=0', () => {
    expect(GrayCode.count(0)).toBe(1)
  })

  it('count returns 2 for n=1', () => {
    expect(GrayCode.count(1)).toBe(2)
  })

  it('count returns 4 for n=2', () => {
    expect(GrayCode.count(2)).toBe(4)
  })

  it('count returns 8 for n=3', () => {
    expect(GrayCode.count(3)).toBe(8)
  })

  it('count returns 32 for n=5', () => {
    expect(GrayCode.count(5)).toBe(32)
  })

  it('binaryToGray is involutive with grayToBinary', () => {
    for (let i = 0; i < 128; i++) {
      const gray = GrayCode.binaryToGray(i)
      const back = GrayCode.grayToBinary(gray)
      expect(back).toBe(i)
    }
  })

  it('grayToBinary is involutive with binaryToGray', () => {
    for (let i = 0; i < 128; i++) {
      const binary = GrayCode.grayToBinary(i)
      const back = GrayCode.binaryToGray(binary)
      expect(back).toBe(i)
    }
  })

  it('generate starts with all zeros', () => {
    expect(GrayCode.generate(1)[0]).toBe('0')
    expect(GrayCode.generate(2)[0]).toBe('00')
    expect(GrayCode.generate(3)[0]).toBe('000')
    expect(GrayCode.generate(4)[0]).toBe('0000')
  })

  it('generate starts with 0 for generateNumbers', () => {
    expect(GrayCode.generateNumbers(1)[0]).toBe(0)
    expect(GrayCode.generateNumbers(2)[0]).toBe(0)
    expect(GrayCode.generateNumbers(3)[0]).toBe(0)
  })

  it('adjacent gray codes in sequence differ by one bit', () => {
    for (let n = 2; n <= 6; n++) {
      const codes = GrayCode.generate(n)
      for (let i = 1; i < codes.length; i++) {
        const a = parseInt(codes[i - 1]!, 2)
        const b = parseInt(codes[i]!, 2)
        expect(GrayCode.isGrayCodePair(a, b)).toBe(true)
      }
    }
  })

  it('generate produces correct sequence for n=4', () => {
    const expected = ['0000', '0001', '0011', '0010', '0110', '0111', '0101', '0100', '1100', '1101', '1111', '1110', '1010', '1011', '1001', '1000']
    expect(GrayCode.generate(4)).toEqual(expected)
  })

  it('generateNumbers produces correct sequence for n=4', () => {
    const expected = [0, 1, 3, 2, 6, 7, 5, 4, 12, 13, 15, 14, 10, 11, 9, 8]
    expect(GrayCode.generateNumbers(4)).toEqual(expected)
  })

  it('generate handles n=6', () => {
    const result = GrayCode.generate(6)
    expect(result.length).toBe(64)
    expect(result[0]).toBe('000000')
    expect(result[result.length - 1]).toBe('100000')
  })

  it('generateNumbers handles n=6', () => {
    const result = GrayCode.generateNumbers(6)
    expect(result.length).toBe(64)
    expect(result[0]).toBe(0)
  })

  it('binaryToGray handles consecutive numbers', () => {
    expect(GrayCode.binaryToGray(0)).toBe(0)
    expect(GrayCode.binaryToGray(1)).toBe(1)
    expect(GrayCode.binaryToGray(2)).toBe(3)
    expect(GrayCode.binaryToGray(3)).toBe(2)
    expect(GrayCode.binaryToGray(4)).toBe(6)
    expect(GrayCode.binaryToGray(5)).toBe(7)
  })

  it('grayToBinary handles consecutive gray codes', () => {
    expect(GrayCode.grayToBinary(0)).toBe(0)
    expect(GrayCode.grayToBinary(1)).toBe(1)
    expect(GrayCode.grayToBinary(3)).toBe(2)
    expect(GrayCode.grayToBinary(2)).toBe(3)
    expect(GrayCode.grayToBinary(6)).toBe(4)
  })

  it('generateNumbers returns correct count', () => {
    expect(GrayCode.generateNumbers(3).length).toBe(8)
  })

  it('count returns 2^n', () => {
    expect(GrayCode.count(4)).toBe(16)
  })

  it('isGrayCodePair for adjacent codes', () => {
    expect(GrayCode.isGrayCodePair(0, 1)).toBe(true)
    expect(GrayCode.isGrayCodePair(0, 2)).toBe(false)
  })

  it('binaryToGray and grayToBinary are inverses', () => {
    for (let i = 0; i < 32; i++) {
      expect(GrayCode.grayToBinary(GrayCode.binaryToGray(i))).toBe(i)
    }
  })

  it('generate n=1', () => {
    expect(GrayCode.generate(1)).toEqual(['0', '1'])
  })

  it('generate n=2', () => {
    expect(GrayCode.generate(2).length).toBe(4)
  })

  it('generateNumbers n=2', () => {
    expect(GrayCode.generateNumbers(2).length).toBe(4)
  })
})
