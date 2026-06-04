import { describe, it, expect } from 'vitest'
import { DeterministicRng } from '../../src/utils/deterministic-rng.js'

describe('DeterministicRng', () => {
  it('produces deterministic sequence', () => {
    const rng1 = new DeterministicRng(42)
    const rng2 = new DeterministicRng(42)
    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next())
    }
  })

  it('produces values between 0 and 1', () => {
    const rng = new DeterministicRng()
    for (let i = 0; i < 100; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('nextInt produces values in range', () => {
    const rng = new DeterministicRng(99)
    for (let i = 0; i < 100; i++) {
      const v = rng.nextInt(5, 10)
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThanOrEqual(10)
    }
  })

  it('nextBool produces both values', () => {
    const rng = new DeterministicRng(7)
    let trues = 0
    let falses = 0
    for (let i = 0; i < 100; i++) {
      if (rng.nextBool()) trues++
      else falses++
    }
    expect(trues).toBeGreaterThan(0)
    expect(falses).toBeGreaterThan(0)
  })

  it('shuffle returns same elements', () => {
    const rng = new DeterministicRng(1)
    const arr = [1, 2, 3, 4, 5]
    const shuffled = rng.shuffle(arr)
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('shuffle does not modify original', () => {
    const rng = new DeterministicRng(1)
    const arr = [1, 2, 3]
    rng.shuffle(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('pick returns element from array', () => {
    const rng = new DeterministicRng(10)
    const arr = ['a', 'b', 'c']
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(rng.pick(arr))
    }
  })

  it('nextGaussian produces finite numbers', () => {
    const rng = new DeterministicRng(3)
    for (let i = 0; i < 50; i++) {
      expect(Number.isFinite(rng.nextGaussian())).toBe(true)
    }
  })

  it('currentSeed returns number', () => {
    const rng = new DeterministicRng(42)
    expect(typeof rng.currentSeed).toBe('number')
  })

  it('reset restarts sequence', () => {
    const rng = new DeterministicRng(100)
    const first = rng.next()
    rng.next()
    rng.next()
    rng.reset(100)
    expect(rng.next()).toBe(first)
  })

  it('different seeds produce different sequences', () => {
    const rng1 = new DeterministicRng(1)
    const rng2 = new DeterministicRng(2)
    let allSame = true
    for (let i = 0; i < 10; i++) {
      if (rng1.next() !== rng2.next()) allSame = false
    }
    expect(allSame).toBe(false)
  })

  it('nextInt with same min max returns that value', () => {
    const rng = new DeterministicRng(5)
    for (let i = 0; i < 10; i++) {
      expect(rng.nextInt(7, 7)).toBe(7)
    }
  })

  it('shuffle of empty array returns empty', () => {
    const rng = new DeterministicRng(1)
    expect(rng.shuffle([])).toEqual([])
  })

  it('shuffle of single element returns that element', () => {
    const rng = new DeterministicRng(1)
    expect(rng.shuffle([42])).toEqual([42])
  })

  it('pick from single element always returns that element', () => {
    const rng = new DeterministicRng(1)
    for (let i = 0; i < 10; i++) {
      expect(rng.pick(['only'])).toBe('only')
    }
  })

  it('nextBool with probability 0 always false', () => {
    const rng = new DeterministicRng(42)
    for (let i = 0; i < 20; i++) {
      expect(rng.nextBool(0)).toBe(false)
    }
  })

  it('nextGaussian mean is near zero', () => {
    const rng = new DeterministicRng(42)
    let sum = 0
    for (let i = 0; i < 1000; i++) sum += rng.nextGaussian()
    expect(Math.abs(sum / 1000)).toBeLessThan(0.2)
  })

  it('nextInt returns integer', () => {
    const rng = new DeterministicRng(42)
    const val = rng.nextInt(1, 10)
    expect(Number.isInteger(val)).toBe(true)
    expect(val).toBeGreaterThanOrEqual(1)
    expect(val).toBeLessThanOrEqual(10)
  })

  it('produces same sequence with same seed', () => {
    const rng1 = new DeterministicRng(42)
    const rng2 = new DeterministicRng(42)
    expect(rng1.nextInt()).toBe(rng2.nextInt())
  })

  it('constructor accepts seed', () => {
    const rng = new DeterministicRng(42)
    expect(rng).toBeDefined()
  })

  it('next returns number between 0 and 1', () => {
    const rng = new DeterministicRng(42)
    const val = rng.next()
    expect(val).toBeGreaterThanOrEqual(0)
    expect(val).toBeLessThan(1)
  })

  it('nextInt respects bounds', () => {
    const rng = new DeterministicRng(42)
    const val = rng.nextInt(10, 20)
    expect(val).toBeGreaterThanOrEqual(10)
    expect(val).toBeLessThanOrEqual(20)
  })

  it('same seed produces same sequence', () => {
    const r1 = new DeterministicRng(42)
    const r2 = new DeterministicRng(42)
    expect(r1.nextInt(0, 100)).toBe(r2.nextInt(0, 100))
  })

  it('nextInt range is bounded', () => {
    const rng = new DeterministicRng(123)
    for (let i = 0; i < 50; i++) {
      const v = rng.nextInt(10, 20)
      expect(v).toBeGreaterThanOrEqual(10)
      expect(v).toBeLessThanOrEqual(20)
    }
  })
})
