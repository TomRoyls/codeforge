import { describe, expect, it } from 'vitest'
import { AhoCorasickMulti } from '../../src/utils/aho-corasick-multi.js'

describe('AhoCorasickMulti', () => {
  it('finds single pattern', () => {
    const ac = new AhoCorasickMulti(['abc'])
    const result = ac.search('abcabc')
    expect(result.get(0)).toEqual([2, 5])
  })

  it('finds multiple patterns', () => {
    const ac = new AhoCorasickMulti(['he', 'she', 'his', 'hers'])
    const result = ac.search('ahishers')
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
  })

  it('handles no matches', () => {
    const ac = new AhoCorasickMulti(['xyz'])
    const result = ac.search('abcdef')
    expect(result.size).toBe(0)
  })

  it('handles empty patterns', () => {
    const ac = new AhoCorasickMulti(['a', 'b'])
    const result = ac.search('')
    expect(result.size).toBe(0)
  })

  it('handles overlapping patterns', () => {
    const ac = new AhoCorasickMulti(['ab', 'bc'])
    const result = ac.search('abc')
    expect(result.get(0)).toEqual([1])
    expect(result.get(1)).toEqual([2])
  })

  it('handles single char patterns', () => {
    const ac = new AhoCorasickMulti(['a', 'b'])
    const result = ac.search('abab')
    expect(result.get(0)).toEqual([0, 2])
    expect(result.get(1)).toEqual([1, 3])
  })

  it('handles prefix pattern', () => {
    const ac = new AhoCorasickMulti(['a', 'ab', 'abc'])
    const result = ac.search('abc')
    expect(result.get(0)).toEqual([0])
    expect(result.get(1)).toEqual([1])
    expect(result.get(2)).toEqual([2])
  })

  it('handles duplicate in text', () => {
    const ac = new AhoCorasickMulti(['aa'])
    const result = ac.search('aaaa')
    expect(result.get(0)!.length).toBe(3)
  })

  it('handles longer text', () => {
    const ac = new AhoCorasickMulti(['cat', 'dog'])
    const result = ac.search('catdogcat')
    expect(result.get(0)).toEqual([2, 8])
    expect(result.get(1)).toEqual([5])
  })

  it('handles pattern at end', () => {
    const ac = new AhoCorasickMulti(['end'])
    const result = ac.search('theend')
    expect(result.get(0)).toEqual([5])
  })

  it('handles multiple same-pattern matches', () => {
    const ac = new AhoCorasickMulti(['a'])
    const result = ac.search('aaa')
    expect(result.get(0)).toEqual([0, 1, 2])
  })

  it('handles longer pattern than text', () => {
    const ac = new AhoCorasickMulti(['abcdef'])
    const result = ac.search('abc')
    expect(result.size).toBe(0)
  })

  it('handles empty patterns array', () => {
    const ac = new AhoCorasickMulti([])
    const result = ac.search('abc')
    expect(result.size).toBe(0)
  })

  it('handles single char pattern in empty text', () => {
    const ac = new AhoCorasickMulti(['a'])
    const result = ac.search('')
    expect(result.size).toBe(0)
  })

  it('handles overlapping patterns', () => {
    const ac = new AhoCorasickMulti(['ab', 'bc'])
    const result = ac.search('abc')
    expect(result.get(0)).toEqual([1])
    expect(result.get(1)).toEqual([2])
  })

  it('handles pattern appearing multiple times', () => {
    const ac = new AhoCorasickMulti(['aa'])
    const result = ac.search('aaaa')
    expect(result.get(0)).toEqual([1, 2, 3])
  })

  it('handles single character patterns', () => {
    const ac = new AhoCorasickMulti(['a', 'b'])
    const result = ac.search('ab')
    expect(result.get(0)).toEqual([0])
    expect(result.get(1)).toEqual([1])
  })

  it('no match returns empty or undefined', () => {
    const ac = new AhoCorasickMulti(['xyz'])
    const result = ac.search('abc')
    expect(result.get(0)?.length ?? 0).toBe(0)
  })

  it('empty patterns returns empty', () => {
    const ac = new AhoCorasickMulti([])
    const result = ac.search('abc')
    expect(result.size).toBe(0)
  })

  it('single pattern found in text', () => {
    const ac = new AhoCorasickMulti(['abc'])
    const result = ac.search('xabcyabcz')
    expect(result.get(0)!.length).toBeGreaterThanOrEqual(2)
  })

  it('no match returns empty map', () => {
    const ac = new AhoCorasickMulti(['xyz'])
    const result = ac.search('abcdef')
    expect(result.size).toBe(0)
  })
})
