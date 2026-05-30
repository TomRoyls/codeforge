import { describe, expect, it } from 'vitest'
import { HashComputer } from '../../../src/core/hash-util/hash-computer.js'

describe('HashComputer', () => {
  const computer = new HashComputer()

  it('computes simple hash for empty string', () => {
    const result = computer.computeSimple('')
    expect(result).toBe('0')
  })

  it('computes simple hash for known input', () => {
    const result = computer.computeSimple('hello')
    expect(result).toBe('214')
  })

  it('computes djb2 hash for empty string', () => {
    const result = computer.computeDjb2('')
    expect(result).toBe('1505')
  })

  it('computes djb2 hash for known input', () => {
    const result = computer.computeDjb2('hello')
    expect(result).toBe('f923099')
  })

  it('computes fnv1a hash for empty string', () => {
    const result = computer.computeFnv1a('')
    expect(result).toBe('811c9dc5')
  })

  it('computes fnv1a hash for known input', () => {
    const result = computer.computeFnv1a('hello')
    expect(result).toBe('4f9f2cab')
  })

  it('computes murmur hash for empty string', () => {
    const result = computer.computeMurmur('')
    expect(result).toBe('0')
  })

  it('computes murmur hash for known input', () => {
    const result = computer.computeMurmur('hello')
    expect(result).toBe('7b258471')
  })

  it('computes murmur hash with custom seed', () => {
    const result1 = computer.computeMurmur('test')
    const result2 = computer.computeMurmur('test', 42)
    expect(result1).not.toBe(result2)
  })

  it('computes cyrb53 hash for empty string', () => {
    const result = computer.computeCyrb53('')
    expect(result).toBe('bdcb81aee8d83')
  })

  it('computes cyrb53 hash for known input', () => {
    const result = computer.computeCyrb53('hello')
    expect(result).toBe('106f3a63cd7226')
  })

  it('computes cyrb53 hash with custom seed', () => {
    const result1 = computer.computeCyrb53('test')
    const result2 = computer.computeCyrb53('test', 42)
    expect(result1).not.toBe(result2)
  })

  it('computes hash using default algorithm', () => {
    const result = computer.compute('hello')
    expect(result).toBe('f923099')
  })

  it('computes hash using simple algorithm', () => {
    const result = computer.compute('hello', 'simple')
    expect(result).toBe('214')
  })

  it('computes hash using djb2 algorithm', () => {
    const result = computer.compute('hello', 'djb2')
    expect(result).toBe('f923099')
  })

  it('computes hash using fnv1a algorithm', () => {
    const result = computer.compute('hello', 'fnv1a')
    expect(result).toBe('4f9f2cab')
  })

  it('computes hash using murmur algorithm', () => {
    const result = computer.compute('hello', 'murmur')
    expect(result).toBe('7b258471')
  })

  it('computes hash using cyrb53 algorithm', () => {
    const result = computer.compute('hello', 'cyrb53')
    expect(result).toBe('106f3a63cd7226')
  })

  it('uses djb2 as fallback for unknown algorithm', () => {
    const result = computer.compute('hello', 'unknown' as any)
    expect(result).toBe('f923099')
  })

  it('computes simple hash for unicode string', () => {
    const result = computer.computeSimple('hello 🌍')
    expect(result).toBe('1b97d')
  })

  it('computes djb2 hash for unicode string', () => {
    const result = computer.computeDjb2('hello 🌍')
    expect(result).toBe('d9155ce2')
  })

  it('computes fnv1a hash for unicode string', () => {
    const result = computer.computeFnv1a('hello 🌍')
    expect(result).toBe('1b8c90ee')
  })

  it('computes murmur hash for unicode string', () => {
    const result = computer.computeMurmur('hello 🌍')
    expect(result).toBe('3dd051c7')
  })

  it('computes cyrb53 hash for unicode string', () => {
    const result = computer.computeCyrb53('hello 🌍')
    expect(result).toBe('1512e68ef05d1a')
  })

  it('computes simple hash for long string', () => {
    const longString = 'a'.repeat(1000)
    const result = computer.computeSimple(longString)
    expect(result).toBe('17ae8')
  })

  it('computes djb2 hash for long string', () => {
    const longString = 'a'.repeat(1000)
    const result = computer.computeDjb2(longString)
    expect(result).toBe('d13cc66d')
  })

  it('computes fnv1a hash for long string', () => {
    const longString = 'a'.repeat(1000)
    const result = computer.computeFnv1a(longString)
    expect(result).toBe('1dd9658d')
  })

  it('computes murmur hash for long string', () => {
    const longString = 'a'.repeat(1000)
    const result = computer.computeMurmur(longString)
    expect(result).toBe('652d0e71')
  })

  it('computes cyrb53 hash for long string', () => {
    const longString = 'a'.repeat(1000)
    const result = computer.computeCyrb53(longString)
    expect(result).toBe('1c0002518a359e')
  })

  it('computes file hash using djb2', () => {
    const result = computer.computeFileHash('test content')
    expect(result).toBe('159395a0')
  })

  it('computes object hash for simple object', () => {
    const obj = { name: 'test', value: 42 }
    const result = computer.computeObjectHash(obj)
    expect(result).toBe('c47dd03d')
  })

  it('computes object hash for nested object', () => {
    const obj = { a: 1, b: { c: 2 } }
    const result = computer.computeObjectHash(obj)
    expect(result).toBe('84294454')
  })

  it('computes object hash for object with array', () => {
    const obj = { items: [1, 2, 3] }
    const result = computer.computeObjectHash(obj)
    expect(result).toBe('2c9999c7')
  })
})