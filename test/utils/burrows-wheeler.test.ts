import { describe, it, expect } from 'vitest'
import { BurrowsWheelerTransform } from '../../src/utils/burrows-wheeler.js'

describe('BurrowsWheelerTransform', () => {
  it('should transform empty string', () => {
    const result = BurrowsWheelerTransform.transform('')
    expect(result.data).toBe('')
    expect(result.index).toBe(0)
  })

  it('should transform single character', () => {
    const result = BurrowsWheelerTransform.transform('a')
    expect(result.data).toBe('a')
    expect(result.index).toBe(0)
  })

  it('should transform simple string', () => {
    const result = BurrowsWheelerTransform.transform('banana')
    expect(result.data).toBe('nnbaaa')
  })

  it('should inverse transform empty string', () => {
    const result = BurrowsWheelerTransform.inverseTransform('', 0)
    expect(result).toBe('')
  })

  it('should inverse transform single character', () => {
    const result = BurrowsWheelerTransform.inverseTransform('a', 0)
    expect(result).toBe('a')
  })

  it('should inverse transform to original', () => {
    const original = 'banana'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle repeated characters', () => {
    const original = 'aaaaa'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle unique characters', () => {
    const original = 'abcde'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with spaces', () => {
    const original = 'hello world'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle palindrome', () => {
    const original = 'racecar'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle reverse sorted string', () => {
    const original = 'fedcba'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle sorted string', () => {
    const original = 'abcdef'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle two characters', () => {
    const original = 'ab'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle alternating characters', () => {
    const original = 'ababab'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with special characters', () => {
    const original = 'test!@#'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle longer string', () => {
    const original = 'mississippi'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should produce consistent results for same input', () => {
    const original = 'consistency'
    const result1 = BurrowsWheelerTransform.transform(original)
    const result2 = BurrowsWheelerTransform.transform(original)
    expect(result1.data).toBe(result2.data)
    expect(result1.index).toBe(result2.index)
  })

  it('should handle string with newlines', () => {
    const original = 'line1\nline2'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with numbers', () => {
    const original = 'abc123'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with mixed case', () => {
    const original = 'AbCdEf'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('transform of single char', () => {
    const transformed = BurrowsWheelerTransform.transform('a')
    expect(transformed.data).toBe('a')
  })
})