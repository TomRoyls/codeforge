import { describe, it, expect } from 'vitest'
import { StringMatcher } from '../../src/utils/string-matcher.js'

describe('StringMatcher', () => {
  it('empty matcher returns empty results', () => {
    const matcher = new StringMatcher()
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toEqual([])
  })

  it('empty matcher containsAny returns false', () => {
    const matcher = new StringMatcher()
    matcher.build()
    expect(matcher.containsAny('hello world')).toBe(false)
  })

  it('single pattern found', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toHaveLength(1)
    expect(results[0]!.pattern).toBe('hello')
    expect(results[0]!.id).toBe('hello')
    expect(results[0]!.start).toBe(0)
    expect(results[0]!.end).toBe(4)
  })

  it('single pattern not found', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('foo')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toEqual([])
  })

  it('multiple patterns some found', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    matcher.addPattern('world')
    matcher.addPattern('foo')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toHaveLength(2)
    expect(results[0]!.pattern).toBe('hello')
    expect(results[1]!.pattern).toBe('world')
  })

  it('overlapping matches', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('he')
    matcher.addPattern('hell')
    matcher.addPattern('hello')
    matcher.build()
    const results = matcher.search('hello')
    expect(results).toHaveLength(3)
    expect(results[0]!.pattern).toBe('he')
    expect(results[1]!.pattern).toBe('hell')
    expect(results[2]!.pattern).toBe('hello')
  })

  it('pattern at start and end', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    matcher.addPattern('world')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toHaveLength(2)
    expect(results[0]!.start).toBe(0)
    expect(results[1]!.start).toBe(6)
  })

  it('containsAny returns true when pattern exists', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    matcher.build()
    expect(matcher.containsAny('hello world')).toBe(true)
  })

  it('containsAny returns false when no pattern exists', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('foo')
    matcher.build()
    expect(matcher.containsAny('hello world')).toBe(false)
  })

  it('case sensitive by default', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    matcher.build()
    const results = matcher.search('HELLO world')
    expect(results).toEqual([])
  })

  it('duplicate patterns handled', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    matcher.addPattern('hello')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toHaveLength(2)
  })

  it('build required before search throws error', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    expect(() => matcher.search('hello world')).toThrow('Must call build() before search()')
  })

  it('build required before containsAny throws error', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    expect(() => matcher.containsAny('hello world')).toThrow('Must call build() before containsAny()')
  })

  it('clear resets everything', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    matcher.build()
    matcher.clear()
    expect(matcher.patternCount).toBe(0)
    matcher.addPattern('world')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toHaveLength(1)
    expect(results[0]!.pattern).toBe('world')
  })

  it('many patterns search works', () => {
    const matcher = new StringMatcher()
    const patterns: string[] = []
    for (let i = 0; i < 50; i++) {
      patterns.push(`word${i}`)
    }
    for (let i = 0; i < patterns.length; i++) {
      matcher.addPattern(patterns[i]!)
    }
    matcher.build()
    const text = 'word5 and word10 and word25'
    const results = matcher.search(text)
    expect(results.length).toBeGreaterThanOrEqual(3)
    const specificPatterns = results.filter((r) => r.pattern === 'word5' || r.pattern === 'word10' || r.pattern === 'word25')
    expect(specificPatterns).toHaveLength(3)
  })

  it('pattern that is substring of another pattern', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('he')
    matcher.addPattern('hell')
    matcher.addPattern('hello')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toHaveLength(3)
    expect(results[0]!.pattern).toBe('he')
    expect(results[1]!.pattern).toBe('hell')
    expect(results[2]!.pattern).toBe('hello')
  })

  it('custom id preserved', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello', 'custom-id')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toHaveLength(1)
    expect(results[0]!.id).toBe('custom-id')
  })

  it('patternCount returns correct count', () => {
    const matcher = new StringMatcher()
    expect(matcher.patternCount).toBe(0)
    matcher.addPattern('hello')
    expect(matcher.patternCount).toBe(1)
    matcher.addPattern('world')
    expect(matcher.patternCount).toBe(2)
  })

  it('cannot add patterns after build', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('hello')
    matcher.build()
    expect(() => matcher.addPattern('world')).toThrow('Cannot add patterns after build()')
  })

  it('results sorted by start position', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('world')
    matcher.addPattern('hello')
    matcher.build()
    const results = matcher.search('hello world')
    expect(results).toHaveLength(2)
    expect(results[0]!.start).toBeLessThan(results[1]!.start)
  })

  it('multiple occurrences of same pattern', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('test')
    matcher.build()
    const results = matcher.search('test test test')
    expect(results).toHaveLength(3)
    expect(results[0]!.start).toBe(0)
    expect(results[1]!.start).toBe(5)
    expect(results[2]!.start).toBe(10)
  })

  it('no match returns empty', () => {
    const matcher = new StringMatcher()
    matcher.addPattern('xyz')
    matcher.build()
    const results = matcher.search('abcdef')
    expect(results).toEqual([])
  })
})