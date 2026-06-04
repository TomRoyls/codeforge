import { describe, it, expect } from 'vitest'
import { ModInt } from '../../src/utils/mod-int.js'

describe('ModInt', () => {
  it('creates with value and modulus', () => {
    const m = new ModInt(5, 7)
    expect(m.value).toBe(5)
    expect(m.modulus).toBe(7)
  })

  it('normalizes negative values', () => {
    const m = new ModInt(-3, 7)
    expect(m.value).toBe(4)
  })

  it('normalizes values >= mod', () => {
    const m = new ModInt(10, 7)
    expect(m.value).toBe(3)
  })

  it('adds two ModInts', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(5, 7)
    expect(a.add(b).value).toBe(1)
  })

  it('subtracts two ModInts', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(5, 7)
    expect(a.sub(b).value).toBe(5)
  })

  it('multiplies two ModInts', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(5, 7)
    expect(a.mul(b).value).toBe(1)
  })

  it('divides two ModInts', () => {
    const a = new ModInt(6, 7)
    const b = new ModInt(3, 7)
    expect(a.div(b).value).toBe(2)
  })

  it('computes power', () => {
    const a = new ModInt(2, 7)
    expect(a.pow(3).value).toBe(1)
    expect(a.pow(10).value).toBe(2)
  })

  it('computes inverse', () => {
    const a = new ModInt(3, 7)
    const inv = a.inv()
    expect(a.mul(inv).value).toBe(1)
  })

  it('negates', () => {
    const a = new ModInt(3, 7)
    expect(a.negate().value).toBe(4)
  })

  it('equals compares correctly', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(3, 7)
    const c = new ModInt(4, 7)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('toNumber returns value', () => {
    expect(new ModInt(5, 7).toNumber()).toBe(5)
  })

  it('static from creates ModInt', () => {
    const m = ModInt.from(10, 7)
    expect(m.value).toBe(3)
  })

  it('factorial computes correctly', () => {
    expect(ModInt.factorial(5, 7).value).toBe(1)
    expect(ModInt.factorial(3, 7).value).toBe(6)
  })

  it('nCr computes binomial coefficient', () => {
    expect(ModInt.nCr(5, 2, 7).value).toBe(3)
    expect(ModInt.nCr(10, 3, 1000000007).value).toBe(120)
  })

  it('nCr returns 0 for invalid range', () => {
    expect(ModInt.nCr(3, 5, 7).value).toBe(0)
    expect(ModInt.nCr(3, -1, 7).value).toBe(0)
  })

  it('pow(0) returns 1', () => {
    const a = new ModInt(5, 7)
    expect(a.pow(0).value).toBe(1)
  })

  it('handles zero value', () => {
    const a = new ModInt(0, 7)
    expect(a.add(new ModInt(3, 7)).value).toBe(3)
    expect(a.mul(new ModInt(5, 7)).value).toBe(0)
  })

  it('add works with raw number', () => {
    const a = new ModInt(3, 7)
    expect(a.add(5).value).toBe(1)
  })

  it('sub works with raw number', () => {
    const a = new ModInt(3, 7)
    expect(a.sub(5).value).toBe(5)
  })

  it('mul works with raw number', () => {
    const a = new ModInt(3, 7)
    expect(a.mul(4).value).toBe(5)
  })

  it('add works correctly', () => {
    const a = new ModInt(3, 7)
    expect(a.add(4).value).toBe(0)
  })

  it('subtract works correctly', () => {
    const a = new ModInt(5, 7)
    expect(a.sub(3).value).toBe(2)
  })

  it('multiply works correctly', () => {
    const a = new ModInt(3, 7)
    expect(a.mul(4).value).toBe(5)
  })
})
