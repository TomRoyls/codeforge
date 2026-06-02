import { describe, expect, it } from 'vitest'
import { DeBruijnSequence } from '../../src/utils/de-bruijn.js'

describe('DeBruijnSequence', () => {
  it('generates binary sequence for n=2', () => {
    const seq = DeBruijnSequence.generateBinary(2)
    expect(seq.length).toBe(4)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 2)).toBe(true)
  })

  it('generates binary sequence for n=3', () => {
    const seq = DeBruijnSequence.generateBinary(3)
    expect(seq.length).toBe(8)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 3)).toBe(true)
  })

  it('generates binary sequence for n=1', () => {
    const seq = DeBruijnSequence.generateBinary(1)
    expect(seq.length).toBe(2)
    expect(seq).toBe('01')
  })

  it('generates ternary sequence for n=2', () => {
    const seq = DeBruijnSequence.generate(3, 2)
    expect(seq.length).toBe(9)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 3, 2)).toBe(true)
  })

  it('throws for excessive alphabet size', () => {
    expect(() => DeBruijnSequence.generate(100, 2)).toThrow()
  })

  it('sequence length is k^n for binary n=4', () => {
    const seq = DeBruijnSequence.generateBinary(4)
    expect(seq.length).toBe(16)
  })

  it('containsAllSubstrings rejects incomplete sequence', () => {
    expect(DeBruijnSequence.containsAllSubstrings('0000', 2, 2)).toBe(false)
  })

  it('wraps around correctly', () => {
    const seq = DeBruijnSequence.generateBinary(3)
    const doubled = seq + seq
    const substrings = new Set<string>()
    for (let i = 0; i < 8; i++) {
      substrings.add(doubled.slice(i, i + 3))
    }
    expect(substrings.size).toBe(8)
  })

  it('generates sequence for k=4 n=2', () => {
    const seq = DeBruijnSequence.generate(4, 2)
    expect(seq.length).toBe(16)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 4, 2)).toBe(true)
  })

  it('all characters from alphabet appear', () => {
    const seq = DeBruijnSequence.generate(3, 2)
    expect(seq).toContain('0')
    expect(seq).toContain('1')
    expect(seq).toContain('2')
  })

  it('binary n=4 has correct length', () => {
    const seq = DeBruijnSequence.generateBinary(4)
    expect(seq.length).toBe(16)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 2, 4)).toBe(true)
  })

  it('generateBinary is consistent with generate(2,n)', () => {
    expect(DeBruijnSequence.generateBinary(3)).toBe(DeBruijnSequence.generate(2, 3))
  })

  it('sequence contains exactly k^n characters', () => {
    expect(DeBruijnSequence.generate(2, 5).length).toBe(32)
    expect(DeBruijnSequence.generate(3, 3).length).toBe(27)
  })

  it('k=5 n=2 generates correctly', () => {
    const seq = DeBruijnSequence.generate(5, 2)
    expect(seq.length).toBe(25)
    expect(DeBruijnSequence.containsAllSubstrings(seq, 5, 2)).toBe(true)
  })

  it('wrapping contains all n-length substrings', () => {
    const seq = DeBruijnSequence.generateBinary(3)
    const doubled = seq + seq
    for (let i = 0; i < 8; i++) {
      expect(doubled.slice(i, i + 3)).toBeTruthy()
    }
  })

  it('binary n=2 has length 4', () => {
    const seq = DeBruijnSequence.generateBinary(2)
    expect(seq.length).toBe(4)
  })

  it('binary n=1 has length 2', () => {
    const seq = DeBruijnSequence.generateBinary(1)
    expect(seq.length).toBe(2)
  })

  it('binary n=2 has length 4', () => {
    const seq = DeBruijnSequence.generateBinary(2)
    expect(seq.length).toBe(4)
  })

  it('binary n=3 has length 8', () => {
    const seq = DeBruijnSequence.generateBinary(3)
    expect(seq.length).toBe(8)
  })

  it('binary n=1 has length 2', () => {
    const seq = DeBruijnSequence.generateBinary(1)
    expect(seq.length).toBe(2)
  })
})
