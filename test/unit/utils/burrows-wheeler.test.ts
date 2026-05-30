import { describe, it, expect } from 'vitest'
import { BurrowsWheelerTransform } from '../../../src/utils/burrows-wheeler.js'

describe('BurrowsWheelerTransform', () => {
  describe('transform', () => {
    it('transforms empty string', () => {
      const result = BurrowsWheelerTransform.transform('')
      expect(result.data).toBe('')
      expect(result.index).toBe(0)
    })

    it('transforms single character', () => {
      const result = BurrowsWheelerTransform.transform('a')
      expect(result.data).toBe('a')
      expect(result.index).toBe(0)
    })

    it('transforms banana', () => {
      const result = BurrowsWheelerTransform.transform('banana')
      expect(result.data.length).toBe(6)
      expect(result.data).toBe('nnbaaa')
    })

    it('transforms repeating string', () => {
      const result = BurrowsWheelerTransform.transform('aaaa')
      expect(result.data).toBe('aaaa')
    })
  })

  describe('inverseTransform', () => {
    it('round-trips empty string', () => {
      const result = BurrowsWheelerTransform.inverseTransform('', 0)
      expect(result).toBe('')
    })

    it('round-trips single character', () => {
      const { data, index } = BurrowsWheelerTransform.transform('x')
      const result = BurrowsWheelerTransform.inverseTransform(data, index)
      expect(result).toBe('x')
    })

    it('round-trips banana', () => {
      const original = 'banana'
      const { data, index } = BurrowsWheelerTransform.transform(original)
      const result = BurrowsWheelerTransform.inverseTransform(data, index)
      expect(result).toBe(original)
    })

    it('round-trips hello world', () => {
      const original = 'hello world'
      const { data, index } = BurrowsWheelerTransform.transform(original)
      const result = BurrowsWheelerTransform.inverseTransform(data, index)
      expect(result).toBe(original)
    })

    it('round-trips repeated characters', () => {
      const original = 'aaabbbccc'
      const { data, index } = BurrowsWheelerTransform.transform(original)
      const result = BurrowsWheelerTransform.inverseTransform(data, index)
      expect(result).toBe(original)
    })

    it('round-trips long string', () => {
      const original = 'abracadabra'
      const { data, index } = BurrowsWheelerTransform.transform(original)
      const result = BurrowsWheelerTransform.inverseTransform(data, index)
      expect(result).toBe(original)
    })
  })
})
