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
    const sh = new StringHasher('hello')
    expect(sh.length).toBe(5)
  })

  it('empty string hash', () => {
    const sh = new StringHasher('')
    expect(sh.hashFull()).toBe(0)
  })

  it('throws for invalid range', () => {
    const sh = new StringHasher('abc')
    expect(() => sh.hash(-1, 2)).toThrow(RangeError)
    expect(() => sh.hash(2, 1)).toThrow(RangeError)
  })

  it('static hashString works', () => {
    const h1 = StringHasher.hashString('hello')
    const sh = new StringHasher('hello')
    expect(h1).toBe(sh.hashFull())
  })

  it('custom base and mod', () => {
    const sh = new StringHasher('test', 137, 1_000_000_009)
    expect(sh.hashFull()).toBeTypeOf('number')
  })

  it('palindromic content consistent', () => {
    const sh = new StringHasher('abccba')
    expect(sh.hash(0, 3)).not.toBe(sh.hash(3, 6))
  })

  it('hash of same char repeated', () => {
    const sh = new StringHasher('aaaa')
    expect(sh.hash(0, 2)).toBeTypeOf('number')
    expect(sh.hash(2, 4)).toBeTypeOf('number')
  })

  it('equals with identical ranges', () => {
    const sh = new StringHasher('abcdef')
    expect(sh.equals(0, 3, 0, 3)).toBe(true)
  })
})
