import { describe, expect, it } from 'vitest'
import { StringHasher } from '../../src/utils/string-hasher.js'

describe('StringHasher', () => {
  it('computes hash for full string', () => {
    const sh = new StringHasher('hello')
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('same substrings produce same hash', () => {
    const sh = new StringHasher('abcabc')
    expect(sh.hash(0, 3)).toBe(sh.hash(3, 6))
  })

  it('different substrings likely produce different hash', () => {
    const sh = new StringHasher('abcdef')
    expect(sh.hash(0, 3)).not.toBe(sh.hash(3, 6))
  })

  it('equals detects equal substrings', () => {
    const sh = new StringHasher('xyabcxyabc')
    expect(sh.equals(2, 5, 7, 10)).toBe(true)
  })

  it('equals detects unequal substrings', () => {
    const sh = new StringHasher('abcdef')
    expect(sh.equals(0, 3, 3, 6)).toBe(false)
  })

  it('equals returns false for different lengths', () => {
    const sh = new StringHasher('abcdef')
    expect(sh.equals(0, 2, 3, 6)).toBe(false)
  })

  it('hash for single char', () => {
    const sh = new StringHasher('a')
    expect(sh.hash(0, 1)).toBeTypeOf('number')
  })

  it('length returns string length', () => {
    expect(new StringHasher('hello').length).toBe(5)
    expect(new StringHasher('').length).toBe(0)
    expect(new StringHasher('x').length).toBe(1)
  })

  it('empty string hash', () => {
    const sh = new StringHasher('')
    expect(sh.hashFull()).toBe(0)
  })

  it('throws for invalid range negative', () => {
    const sh = new StringHasher('abc')
    expect(() => sh.hash(-1, 2)).toThrow(RangeError)
  })

  it('throws for invalid range reversed', () => {
    const sh = new StringHasher('abc')
    expect(() => sh.hash(2, 1)).toThrow(RangeError)
  })

  it('throws for range exceeding length', () => {
    const sh = new StringHasher('abc')
    expect(() => sh.hash(0, 10)).toThrow(RangeError)
  })

  it('throws for equal l and r', () => {
    const sh = new StringHasher('abc')
    expect(() => sh.hash(1, 1)).toThrow(RangeError)
  })

  it('static hashString works', () => {
    const h1 = StringHasher.hashString('hello')
    const sh = new StringHasher('hello')
    expect(h1).toBe(sh.hashFull())
  })

  it('static hashString for empty string', () => {
    expect(StringHasher.hashString('')).toBe(0)
  })

  it('custom base and mod', () => {
    const sh = new StringHasher('test', 137, 1_000_000_009)
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('palindromic content not symmetric', () => {
    const sh = new StringHasher('abccba')
    expect(sh.hash(0, 3)).not.toBe(sh.hash(3, 6))
  })

  it('hash of same char repeated is consistent', () => {
    const sh = new StringHasher('aaaa')
    expect(sh.hash(0, 2)).toBeTypeOf('number')
    expect(sh.hash(2, 4)).toBeTypeOf('number')
  })

  it('equals with identical ranges', () => {
    const sh = new StringHasher('abcdef')
    expect(sh.equals(0, 3, 0, 3)).toBe(true)
  })

  it('hash is deterministic', () => {
    const sh = new StringHasher('hello')
    expect(sh.hash(0, 4)).toBe(sh.hash(0, 4))
  })

  it('hash for different positions differs', () => {
    const sh = new StringHasher('abcdef')
    expect(sh.hash(0, 2)).not.toBe(sh.hash(3, 5))
  })

  it('full hash equals hash of entire range', () => {
    const sh = new StringHasher('test')
    expect(sh.hashFull()).toBe(sh.hash(0, 4))
  })

  it('hash with default base and mod', () => {
    const sh = new StringHasher('abc')
    const h = sh.hash(0, 3)
    expect(typeof h).toBe('number')
    expect(Number.isFinite(h)).toBe(true)
  })

  it('hash is non-negative', () => {
    const sh = new StringHasher('xyz')
    const h = sh.hash(0, 3)
    expect(h).toBeGreaterThanOrEqual(0)
  })

  it('equals for repeated pattern', () => {
    const sh = new StringHasher('abababab')
    expect(sh.equals(0, 2, 2, 4)).toBe(true)
    expect(sh.equals(2, 4, 4, 6)).toBe(true)
    expect(sh.equals(0, 4, 4, 8)).toBe(true)
  })

  it('hash of single char at different positions', () => {
    const sh = new StringHasher('aaa')
    expect(sh.hash(0, 1)).toBe(sh.hash(1, 2))
    expect(sh.hash(1, 2)).toBe(sh.hash(2, 3))
  })

  it('different strings produce different full hashes', () => {
    const h1 = StringHasher.hashString('hello')
    const h2 = StringHasher.hashString('world')
    expect(h1).not.toBe(h2)
  })

  it('custom base changes hash', () => {
    const h1 = StringHasher.hashString('test', 31)
    const h2 = StringHasher.hashString('test', 137)
    expect(h1).not.toBe(h2)
  })

  it('custom mod changes hash', () => {
    const h1 = StringHasher.hashString('abcdefghijk', 31, 1_000_000_007)
    const h2 = StringHasher.hashString('abcdefghijk', 31, 998_244_353)
    expect(h1).not.toBe(h2)
  })

  it('handles long string', () => {
    const s = 'a'.repeat(1000)
    const sh = new StringHasher(s)
    expect(sh.hashFull()).toBeTypeOf('number')
    expect(sh.length).toBe(1000)
  })

  it('handles special characters', () => {
    const sh = new StringHasher('!@#$%^&*()')
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('handles unicode', () => {
    const sh = new StringHasher('héllo wörld')
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('handles digits', () => {
    const sh = new StringHasher('12345')
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('handles mixed content', () => {
    const sh = new StringHasher('a1b2c3!@#')
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('substring hash varies by position', () => {
    const sh = new StringHasher('abcdefgh')
    const hashes = [sh.hash(0, 2), sh.hash(2, 4), sh.hash(4, 6), sh.hash(6, 8)]
    const unique = new Set(hashes)
    expect(unique.size).toBe(4)
  })

  it('equals false for overlapping but different ranges', () => {
    const sh = new StringHasher('abcde')
    expect(sh.equals(0, 3, 1, 4)).toBe(false)
  })

  it('multiple same substrings', () => {
    const sh = new StringHasher('xyzxyzxyz')
    expect(sh.equals(0, 3, 3, 6)).toBe(true)
    expect(sh.equals(3, 6, 6, 9)).toBe(true)
    expect(sh.equals(0, 3, 6, 9)).toBe(true)
  })

  it('hash of prefix vs suffix differs', () => {
    const sh = new StringHasher('abcdef')
    expect(sh.hash(0, 3)).not.toBe(sh.hash(3, 6))
  })

  it('single character string length', () => {
    const sh = new StringHasher('x')
    expect(sh.length).toBe(1)
    expect(sh.hashFull()).toBe(sh.hash(0, 1))
  })

  it('two character string', () => {
    const sh = new StringHasher('ab')
    expect(sh.hash(0, 1)).not.toBe(sh.hash(1, 2))
  })

  it('hash is stable across instances', () => {
    const h1 = new StringHasher('stable').hashFull()
    const h2 = new StringHasher('stable').hashFull()
    expect(h1).toBe(h2)
  })

  it('space character hash', () => {
    const sh = new StringHasher(' ')
    expect(sh.hashFull()).toBeTypeOf('number')
    expect(sh.hashFull()).toBeGreaterThan(0)
  })

  it('tab and newline hash', () => {
    const sh = new StringHasher('\t\n')
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('large base value', () => {
    const sh = new StringHasher('test', 10007, 1_000_000_007)
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('small mod value', () => {
    const sh = new StringHasher('abc', 31, 1009)
    expect(sh.hashFull()).toBeTypeOf('number')
    expect(sh.hashFull()).toBeLessThan(1009)
  })
})
