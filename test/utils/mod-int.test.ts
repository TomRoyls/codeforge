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

  it('div works with raw number', () => {
    const a = new ModInt(6, 7)
    expect(a.div(3).value).toBe(2)
  })

  it('value getter returns normalized value', () => {
    expect(new ModInt(14, 7).value).toBe(0)
    expect(new ModInt(8, 7).value).toBe(1)
  })

  it('modulus getter returns modulus', () => {
    expect(new ModInt(3, 13).modulus).toBe(13)
  })

  it('chained operations work', () => {
    const a = new ModInt(2, 7)
    const result = a.add(3).mul(2).sub(1)
    expect(result.value).toBe(2)
  })

  it('pow with large exponent uses Fermat', () => {
    const a = new ModInt(2, 1000000007)
    const result = a.pow(1000000006)
    expect(result.value).toBeGreaterThan(0)
  })

  it('negate of 0 is 0', () => {
    expect(new ModInt(0, 7).negate().value).toBe(0)
  })

  it('negate negate is identity', () => {
    const a = new ModInt(3, 7)
    expect(a.negate().negate().value).toBe(3)
  })

  it('factorial of 0 is 1', () => {
    expect(ModInt.factorial(0, 7).value).toBe(1)
  })

  it('factorial of 1 is 1', () => {
    expect(ModInt.factorial(1, 7).value).toBe(1)
  })

  it('nCr(5,0) is 1', () => {
    expect(ModInt.nCr(5, 0, 7).value).toBe(1)
  })

  it('nCr(5,5) is 1', () => {
    expect(ModInt.nCr(5, 5, 7).value).toBe(1)
  })

  it('nCr(10,5) computes correctly', () => {
    expect(ModInt.nCr(10, 5, 1000000007).value).toBe(252)
  })

  it('static modInverse computes correctly', () => {
    const inv = ModInt.modInverse(3, 7)
    expect((3 * inv) % 7).toBe(1)
  })

  it('static from is same as constructor', () => {
    const a = new ModInt(5, 7)
    const b = ModInt.from(5, 7)
    expect(a.equals(b)).toBe(true)
  })

  it('operations preserve modulus', () => {
    const a = new ModInt(3, 13)
    expect(a.add(5).modulus).toBe(13)
    expect(a.sub(1).modulus).toBe(13)
    expect(a.mul(2).modulus).toBe(13)
  })

  it('large value normalization', () => {
    expect(new ModInt(100, 7).value).toBe(2)
  })

  it('toNumber matches value', () => {
    const m = new ModInt(5, 7)
    expect(m.toNumber()).toBe(m.value)
  })

  it('equals returns false for different modulus', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(3, 11)
    expect(a.equals(b)).toBe(false)
  })

  it('double negation returns original', () => {
    const a = new ModInt(3, 7)
    expect(a.negate().negate().equals(a)).toBe(true)
  })

  it('inv of 1 is 1', () => {
    expect(new ModInt(1, 7).inv().value).toBe(1)
  })

  it('add 0 is identity', () => {
    const a = new ModInt(3, 7)
    expect(a.add(0).value).toBe(3)
  })

  it('mul by 1 is identity', () => {
    const a = new ModInt(3, 7)
    expect(a.mul(1).value).toBe(3)
  })

  it('mul by 0 is 0', () => {
    const a = new ModInt(3, 7)
    expect(a.mul(0).value).toBe(0)
  })
})
