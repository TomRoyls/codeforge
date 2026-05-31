import { describe, expect, it } from 'vitest'
import { StringHash } from '../../src/utils/string-hash.js'

describe('StringHash', () => {
  it('computes hash for full string', () => {
    const sh = new StringHash('hello')
    const h = sh.hash(0, 4)
    expect(h > 0n).toBe(true)
  })

  it('same substring has same hash', () => {
    const sh = new StringHash('abcabc')
    expect(sh.hash(0, 2)).toBe(sh.hash(3, 5))
  })

  it('different substrings differ', () => {
    const sh = new StringHash('abcdef')
    expect(sh.hash(0, 2)).not.toBe(sh.hash(3, 5))
  })

  it('equals returns true for same substrings', () => {
    const sh = new StringHash('xyzxyz')
    expect(sh.equals(0, 2, 3, 5)).toBe(true)
  })

  it('equals returns false for different substrings', () => {
    const sh = new StringHash('abcdef')
    expect(sh.equals(0, 2, 3, 5)).toBe(false)
  })

  it('equals returns false for different lengths', () => {
    const sh = new StringHash('abcdef')
    expect(sh.equals(0, 2, 3, 4)).toBe(false)
  })

  it('handles single char', () => {
    const sh = new StringHash('a')
    expect(sh.hash(0, 0) > 0n).toBe(true)
  })

  it('handles empty-ish range', () => {
    const sh = new StringHash('abc')
    const h1 = sh.hash(1, 1)
    expect(h1 > 0n).toBe(true)
  })

  it('handles long string', () => {
    const s = 'a'.repeat(1000)
    const sh = new StringHash(s)
    expect(sh.equals(0, 99, 100, 199)).toBe(true)
  })

  it('hash is consistent', () => {
    const sh = new StringHash('test')
    expect(sh.hash(0, 3)).toBe(sh.hash(0, 3))
  })

  it('handles overlapping equal substrings', () => {
    const sh = new StringHash('ababab')
    expect(sh.equals(0, 1, 2, 3)).toBe(true)
    expect(sh.equals(0, 1, 4, 5)).toBe(true)
  })

  it('handles palindrome', () => {
    const sh = new StringHash('racecar')
    expect(sh.equals(0, 6, 0, 6)).toBe(true)
  })
})
