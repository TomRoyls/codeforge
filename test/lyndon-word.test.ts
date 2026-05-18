import { lyndonFactorize, isLyndonWord, LyndonFactorization } from '../src/core/lyndon-word/index.js'

// ─── lyndonFactorize ────────────────────────────────────────────────────

describe('LyndonWord', () => {
  describe('lyndonFactorize', () => {
    it('factorizes empty string', () => {
      expect(lyndonFactorize('')).toEqual([])
    })

    it('factorizes single character', () => {
      expect(lyndonFactorize('a')).toEqual(['a'])
    })

    it('factorizes sorted string', () => {
      expect(lyndonFactorize('abc')).toEqual(['abc'])
    })

    it('factorizes repeated characters', () => {
      const factors = lyndonFactorize('aaa')
      expect(factors.every((f) => f === 'a')).toBe(true)
    })

    it('factorizes into Lyndon words', () => {
      const factors = lyndonFactorize('dcba')
      expect(factors.length).toBeGreaterThan(0)
      for (const f of factors) {
        expect(isLyndonWord(f)).toBe(true)
      }
    })

    it('factors are non-increasing', () => {
      const s = 'bacb'
      const factors = lyndonFactorize(s)
      expect(factors.join('')).toBe(s)
      for (let i = 0; i < factors.length - 1; i++) {
        expect(factors[i]! >= factors[i + 1]!).toBe(true)
      }
    })
  })

  // ─── isLyndonWord ────────────────────────────────────────────────────────

  describe('isLyndonWord', () => {
    it('single char is Lyndon word', () => {
      expect(isLyndonWord('a')).toBe(true)
      expect(isLyndonWord('z')).toBe(true)
    })

    it('empty string is Lyndon word', () => {
      expect(isLyndonWord('')).toBe(true)
    })

    it('sorted string is Lyndon word', () => {
      expect(isLyndonWord('abc')).toBe(true)
      expect(isLyndonWord('abcd')).toBe(true)
    })

    it('repeated char is not a Lyndon word', () => {
      expect(isLyndonWord('aa')).toBe(false)
    })

    it('descending string is not Lyndon word', () => {
      expect(isLyndonWord('cba')).toBe(false)
    })

    it('rotated string equal is not Lyndon', () => {
      expect(isLyndonWord('aba')).toBe(false)
    })
  })

  // ─── LyndonFactorization Class ───────────────────────────────────────────

  describe('LyndonFactorization class', () => {
    it('factorize method works', () => {
      const lf = new LyndonFactorization()
      const factors = lf.factorize('dcba')
      expect(factors.length).toBeGreaterThan(0)
    })

    it('isLyndon method delegates', () => {
      const lf = new LyndonFactorization()
      expect(lf.isLyndon('abc')).toBe(true)
      expect(lf.isLyndon('cba')).toBe(false)
    })

    it('countLyndonFactors returns count', () => {
      const lf = new LyndonFactorization()
      expect(lf.countLyndonFactors('a')).toBe(1)
    })

    it('getFactors returns last factorization', () => {
      const lf = new LyndonFactorization()
      lf.factorize('abc')
      const f = lf.getFactors()
      expect(f).toEqual(['abc'])
    })

    it('minRotation finds lexicographically smallest rotation', () => {
      const lf = new LyndonFactorization()
      expect(lf.minRotation('')).toBe('')
      expect(lf.minRotation('a')).toBe('a')
      expect(lf.minRotation('bba')).toBe('abb')
      expect(lf.minRotation('cabcab')).toBe('abcabc')
    })
  })
})
