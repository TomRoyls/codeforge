import { describe, expect, it } from 'vitest'

import { truncateSignature } from '../../src/commands/exports-helpers.js'

// ─── truncateSignature ───

describe('truncateSignature', () => {
  it('returns short signatures unchanged', () => {
    expect(truncateSignature('(a: number) => void')).toBe('(a: number) => void')
  })

  it('truncates long signatures with ellipsis', () => {
    const long = 'a'.repeat(100)
    const result = truncateSignature(long, 80)
    expect(result.length).toBe(80)
    expect(result.endsWith('...')).toBe(true)
  })

  it('preserves content up to maxLength - 3', () => {
    const long = 'x'.repeat(100)
    const result = truncateSignature(long, 50)
    expect(result.slice(0, -3)).toBe('x'.repeat(47))
  })

  it('handles maxLength of exactly 3', () => {
    expect(truncateSignature('hello', 3)).toBe('...')
  })

  it('handles maxLength of 0 or less', () => {
    expect(truncateSignature('hello', 0)).toBe('...')
    expect(truncateSignature('hello', 1)).toBe('...')
    expect(truncateSignature('hello', 2)).toBe('...')
  })

  it('uses default maxLength of 80', () => {
    const sig = 'a'.repeat(90)
    const result = truncateSignature(sig)
    expect(result.length).toBe(80)
  })
})
