import { describe, expect, it } from 'vitest'

import {
  deduplicateCycles,
  normalizeCycle,
} from '../../src/commands/dependencies-cycle-helpers.js'

// ─── normalizeCycle ───

describe('normalizeCycle', () => {
  it('rotates cycle to start with minimum element', () => {
    const result = normalizeCycle(['c', 'a', 'b', 'c'])
    expect(result[0]).toBe('a')
    expect(result.at(-1)).toBe('a')
  })

  it('handles already normalized cycle', () => {
    const result = normalizeCycle(['a', 'b', 'c', 'a'])
    expect(result[0]).toBe('a')
  })

  it('handles single-element cycle', () => {
    const result = normalizeCycle(['a', 'a'])
    expect(result).toEqual(['a', 'a'])
  })

  it('handles two-element cycle', () => {
    const result = normalizeCycle(['b', 'a', 'b'])
    expect(result[0]).toBe('a')
  })

  it('returns copy for empty-ish cycle', () => {
    const result = normalizeCycle(['a'])
    expect(result).toEqual(['a'])
  })
})

// ─── deduplicateCycles ───

describe('deduplicateCycles', () => {
  it('removes duplicate cycles', () => {
    const cycles = [
      { cycle: ['a', 'b', 'c', 'a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['b', 'c', 'a', 'b'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })

  it('keeps unique cycles', () => {
    const cycles = [
      { cycle: ['a', 'b', 'a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['c', 'd', 'c'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(2)
  })

  it('returns empty array for no cycles', () => {
    expect(deduplicateCycles([])).toEqual([])
  })
})
