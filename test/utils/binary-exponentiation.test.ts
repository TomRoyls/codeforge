import { describe, expect, it } from 'vitest'
import { BinaryExponentiation } from '../../src/utils/binary-exponentiation.js'

describe('BinaryExponentiation', () => {
  it('computes power mod correctly', () => {
    expect(BinaryExponentiation.power(2n, 10n, 1000n)).toBe(24n)
  })

  it('computes power mod for large exponent', () => {
    expect(BinaryExponentiation.power(2n, 100n, 1000000007n)).toBe(976371285n)
  })

  it('handles exp = 0', () => {
    expect(BinaryExponentiation.power(5n, 0n, 7n)).toBe(1n)
  })

  it('handles base = 0', () => {
    expect(BinaryExponentiation.power(0n, 5n, 7n)).toBe(0n)
  })

  it('handles mod = 1', () => {
    expect(BinaryExponentiation.power(5n, 5n, 1n)).toBe(0n)
  })

  it('powerNumber works', () => {
    expect(BinaryExponentiation.powerNumber(2, 10, 1000)).toBe(24)
  })

  it('powerNoMod computes exact power', () => {
    expect(BinaryExponentiation.powerNoMod(2n, 10n)).toBe(1024n)
    expect(BinaryExponentiation.powerNoMod(3n, 0n)).toBe(1n)
  })

  it('matrixPower computes identity for exp=0', () => {
    const mat = [[1n, 1n], [1n, 0n]]
    const result = BinaryExponentiation.matrixPower(mat, 0n, 1000000007n)
    expect(result[0]![0]).toBe(1n)
    expect(result[0]![1]).toBe(0n)
    expect(result[1]![0]).toBe(0n)
    expect(result[1]![1]).toBe(1n)
  })

  it('matrixPower returns same for exp=1', () => {
    const mat = [[1n, 1n], [1n, 0n]]
    const result = BinaryExponentiation.matrixPower(mat, 1n, 1000000007n)
    expect(result[0]![0]).toBe(1n)
    expect(result[0]![1]).toBe(1n)
  })

  it('fibonacci computes fib(10)', () => {
    expect(BinaryExponentiation.fibonacci(10)).toBe(55n)
  })

  it('fibonacci computes fib(0) and fib(1)', () => {
    expect(BinaryExponentiation.fibonacci(0)).toBe(0n)
    expect(BinaryExponentiation.fibonacci(1)).toBe(1n)
  })

  it('fibonacci computes fib(20)', () => {
    expect(BinaryExponentiation.fibonacci(20)).toBe(6765n)
  })

  it('handles negative base', () => {
    expect(BinaryExponentiation.power(-2n, 3n, 7n)).toBe(6n)
  })

  it('power of zero is one', () => {
    expect(BinaryExponentiation.power(5n, 0n, 100n)).toBe(1n)
  })

  it('power with modulus 1 is always 0', () => {
    expect(BinaryExponentiation.power(123n, 456n, 1n)).toBe(0n)
  })

  it('power with large exponent', () => {
    expect(BinaryExponentiation.power(2n, 10n, 1000n)).toBe(24n)
  })

  it('power of 1 is base mod m', () => {
    expect(BinaryExponentiation.power(7n, 1n, 100n)).toBe(7n)
  })
})
