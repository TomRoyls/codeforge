import { describe, expect, it } from 'vitest'
import { Collatz } from '../../src/utils/collatz.js'

describe('Collatz', () => {
  it('generates sequence for 6', () => {
    expect(Collatz.sequence(6)).toEqual([6, 3, 10, 5, 16, 8, 4, 2, 1])
  })

  it('generates sequence for 1', () => {
    expect(Collatz.sequence(1)).toEqual([1])
  })

  it('handles 0', () => {
    expect(Collatz.sequence(0)).toEqual([])
  })

  it('handles negative', () => {
    expect(Collatz.sequence(-1)).toEqual([])
  })

  it('counts steps for 6', () => {
    expect(Collatz.steps(6)).toBe(8)
  })

  it('counts steps for 1', () => {
    expect(Collatz.steps(1)).toBe(0)
  })

  it('steps returns -1 for non-positive', () => {
    expect(Collatz.steps(0)).toBe(-1)
  })

  it('finds max value in sequence', () => {
    expect(Collatz.maxValue(6)).toBe(16)
    expect(Collatz.maxValue(1)).toBe(1)
  })

  it('converges to 1', () => {
    expect(Collatz.converges(6)).toBe(true)
    expect(Collatz.converges(27)).toBe(true)
    expect(Collatz.converges(1)).toBe(true)
  })

  it('converges returns false for non-positive', () => {
    expect(Collatz.converges(0)).toBe(false)
    expect(Collatz.converges(-5)).toBe(false)
  })

  it('step computes next value', () => {
    expect(Collatz.step(6)).toBe(3)
    expect(Collatz.step(3)).toBe(10)
    expect(Collatz.step(1)).toBe(1)
  })

  it('step handles even and odd', () => {
    expect(Collatz.step(4)).toBe(2)
    expect(Collatz.step(5)).toBe(16)
  })

  it('longestSequence finds n with most steps', () => {
    const result = Collatz.longestSequence(10)
    expect(result.n).toBe(9)
    expect(result.steps).toBe(19)
  })

  it('sequence always ends with 1', () => {
    for (let i = 1; i <= 50; i++) {
      const seq = Collatz.sequence(i)
      expect(seq[seq.length - 1]).toBe(1)
    }
  })

  it('sequence length matches steps + 1', () => {
    for (let i = 1; i <= 20; i++) {
      expect(Collatz.sequence(i).length).toBe(Collatz.steps(i) + 1)
    }
  })

  it('maxValue for 27 is 9232', () => {
    expect(Collatz.maxValue(27)).toBe(9232)
  })

  it('longestSequence for 20', () => {
    const result = Collatz.longestSequence(20)
    expect(result.steps).toBeGreaterThanOrEqual(19)
  })

  it('sequence for 1 is just [1]', () => {
    expect(Collatz.sequence(1)).toEqual([1])
  })

  it('sequence for 2 is [2, 1]', () => {
    expect(Collatz.sequence(2)).toEqual([2, 1])
  })

  it('sequence for 1 is [1]', () => {
    expect(Collatz.sequence(1)).toEqual([1])
  })

  it('sequence for 2 is [2, 1]', () => {
    expect(Collatz.sequence(2)).toEqual([2, 1])
  })

  it('sequence for 4 has 3 steps', () => {
    expect(Collatz.sequence(4)).toEqual([4, 2, 1])
  })
})
