import { describe, expect, it } from 'vitest'
import { CountedBloomFilter } from '../../src/utils/counted-bloom-filter.js'

describe('CountedBloomFilter', () => {
  it('adds and checks items', () => {
    const bf = new CountedBloomFilter()
    bf.add('hello')
    expect(bf.contains('hello')).toBe(true)
  })

  it('returns false for missing items', () => {
    const bf = new CountedBloomFilter()
    bf.add('hello')
    expect(bf.contains('world')).toBe(false)
  })

  it('removes items', () => {
    const bf = new CountedBloomFilter()
    bf.add('hello')
    expect(bf.remove('hello')).toBe(true)
    expect(bf.contains('hello')).toBe(false)
  })

  it('remove returns false for missing item', () => {
    const bf = new CountedBloomFilter()
    expect(bf.remove('missing')).toBe(false)
  })

  it('handles multiple adds', () => {
    const bf = new CountedBloomFilter()
    bf.add('a')
    bf.add('b')
    bf.add('c')
    expect(bf.contains('a')).toBe(true)
    expect(bf.contains('b')).toBe(true)
    expect(bf.contains('c')).toBe(true)
  })

  it('count returns min counter', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.add('x')
    bf.add('x')
    expect(bf.count('x')).toBeGreaterThanOrEqual(3)
  })

  it('count returns 0 for missing', () => {
    const bf = new CountedBloomFilter()
    expect(bf.count('missing')).toBe(0)
  })

  it('add and remove and re-add', () => {
    const bf = new CountedBloomFilter()
    bf.add('test')
    bf.remove('test')
    expect(bf.contains('test')).toBe(false)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('handles many items', () => {
    const bf = new CountedBloomFilter(1000, 0.05)
    for (let i = 0; i < 100; i++) bf.add(`item${i}`)
    let found = 0
    for (let i = 0; i < 100; i++) {
      if (bf.contains(`item${i}`)) found++
    }
    expect(found).toBe(100)
  })

  it('empty filter contains nothing', () => {
    const bf = new CountedBloomFilter()
    expect(bf.contains('anything')).toBe(false)
  })

  it('handles repeated remove gracefully', () => {
    const bf = new CountedBloomFilter()
    bf.add('test')
    expect(bf.remove('test')).toBe(true)
    expect(bf.remove('test')).toBe(false)
  })

  it('handles add remove add cycle', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.remove('x')
    bf.add('x')
    bf.add('x')
    expect(bf.count('x')).toBeGreaterThanOrEqual(2)
  })

  it('works with numeric strings', () => {
    const bf = new CountedBloomFilter()
    bf.add('1')
    bf.add('2')
    bf.add('3')
    expect(bf.contains('1')).toBe(true)
    expect(bf.contains('4')).toBe(false)
  })

  it('count returns zero for absent item', () => {
    const bf = new CountedBloomFilter()
    expect(bf.count('absent')).toBe(0)
  })

  it('handles empty string key', () => {
    const bf = new CountedBloomFilter()
    bf.add('')
    expect(bf.contains('')).toBe(true)
    expect(bf.count('')).toBeGreaterThanOrEqual(1)
  })

  it('remove then contains returns false', () => {
    const bf = new CountedBloomFilter()
    bf.add('x')
    bf.remove('x')
    expect(bf.contains('x')).toBe(false)
  })

  it('add same item multiple times increases count', () => {
    const bf = new CountedBloomFilter()
    bf.add('z')
    bf.add('z')
    bf.add('z')
    expect(bf.count('z')).toBeGreaterThanOrEqual(3)
  })

  it('empty filter has zero count', () => {
    const bf = new CountedBloomFilter(100)
    expect(bf.count('missing')).toBe(0)
  })

  it('add and count returns positive', () => {
    const bf = new CountedBloomFilter(100)
    bf.add('hello')
    expect(bf.count('hello')).toBeGreaterThan(0)
  })

  it('count for non-added item is 0', () => {
    const bf = new CountedBloomFilter(100)
    expect(bf.count('missing')).toBe(0)
  })
})
