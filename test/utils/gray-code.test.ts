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
})
