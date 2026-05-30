import { describe, expect, it } from 'vitest'
import { MinHash } from '../../../src/utils/min-hash.js'

describe('MinHash', () => {
  it('should create with default numHashes', () => {
    const mh = new MinHash()
    expect(mh.numHashes).toBe(128)
  })

  it('should create with custom numHashes', () => {
    const mh = new MinHash(64)
    expect(mh.numHashes).toBe(64)
  })

  it('should create with custom seed', () => {
    const mh1 = new MinHash(10, 123)
    const mh2 = new MinHash(10, 456)
    mh1.add('test')
    mh2.add('test')
    expect(mh1.signature).not.toEqual(mh2.signature)
  })

  it('should throw RangeError for numHashes less than 1', () => {
    expect(() => new MinHash(0)).toThrow(RangeError)
  })

  it('should throw RangeError for numHashes of 0', () => {
    expect(() => new MinHash(0)).toThrow('numHashes must be >= 1')
  })

  it('should throw RangeError for negative numHashes', () => {
    expect(() => new MinHash(-5)).toThrow(RangeError)
  })

  it('should have signature filled with Infinity initially', () => {
    const mh = new MinHash(10)
    expect(mh.signature).toEqual(new Array(10).fill(Infinity))
  })

  it('should add element to min hash', () => {
    const mh = new MinHash(10)
    mh.add('element1')
    const sig = mh.signature
    expect(sig.some(v => v !== Infinity)).toBe(true)
  })

  it('should update signature when adding elements', () => {
    const mh = new MinHash(10)
    const sig1 = [...mh.signature]
    mh.add('element1')
    const sig2 = mh.signature
    expect(sig1).not.toEqual(sig2)
  })

  it('should add batch of elements', () => {
    const mh = new MinHash(10)
    mh.addBatch(['a', 'b', 'c'])
    const sig = mh.signature
    expect(sig.some(v => v !== Infinity)).toBe(true)
  })

  it('should return size 0 initially', () => {
    const mh = new MinHash()
    expect(mh.size).toBe(0)
  })

  it('should return non-zero size after adding elements', () => {
    const mh = new MinHash()
    mh.add('element1')
    expect(mh.size).toBeGreaterThan(0)
  })

  it('should return similarity 1 for identical sets', () => {
    const mh1 = new MinHash(100, 42)
    const mh2 = new MinHash(100, 42)
    const elements = ['a', 'b', 'c', 'd', 'e']
    mh1.addBatch(elements)
    mh2.addBatch(elements)
    expect(mh1.similarity(mh2)).toBe(1)
  })

  it('should return similarity 0 for empty sets', () => {
    const mh1 = new MinHash(100, 42)
    const mh2 = new MinHash(100, 42)
    expect(mh1.similarity(mh2)).toBe(1)
  })

  it('should return similarity close to 0 for disjoint sets', () => {
    const mh1 = new MinHash(100, 42)
    const mh2 = new MinHash(100, 42)
    mh1.addBatch(['a', 'b', 'c', 'd', 'e'])
    mh2.addBatch(['f', 'g', 'h', 'i', 'j'])
    expect(mh1.similarity(mh2)).toBeLessThan(0.1)
  })

  it('should return similarity between 0 and 1 for partial overlap', () => {
    const mh1 = new MinHash(100, 42)
    const mh2 = new MinHash(100, 42)
    mh1.addBatch(['a', 'b', 'c', 'd', 'e'])
    mh2.addBatch(['c', 'd', 'e', 'f', 'g'])
    const sim = mh1.similarity(mh2)
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(1)
  })

  it('should throw error when comparing different numHashes', () => {
    const mh1 = new MinHash(10, 42)
    const mh2 = new MinHash(20, 42)
    expect(() => mh1.similarity(mh2)).toThrow()
  })

  it('should throw error with message about different numHashes', () => {
    const mh1 = new MinHash(10, 42)
    const mh2 = new MinHash(20, 42)
    expect(() => mh1.similarity(mh2)).toThrow('Cannot compare MinHash with different numHashes')
  })

  it('should clone min hash', () => {
    const mh1 = new MinHash(10, 42)
    mh1.add('element1')
    const mh2 = mh1.clone()
    expect(mh2.signature).toEqual(mh1.signature)
    expect(mh2.numHashes).toBe(mh1.numHashes)
  })

  it('should not affect original when modifying clone', () => {
    const mh1 = new MinHash(10, 42)
    mh1.add('element1')
    const mh2 = mh1.clone()
    mh2.add('element2')
    expect(mh1.signature).not.toEqual(mh2.signature)
  })

  it('should merge two min hashes', () => {
    const mh1 = new MinHash(10, 42)
    const mh2 = new MinHash(10, 42)
    mh1.add('element1')
    mh2.add('element2')
    mh1.merge(mh2)
    const mh3 = new MinHash(10, 42)
    mh3.addBatch(['element1', 'element2'])
    expect(mh1.signature).toEqual(mh3.signature)
  })

  it('should throw error when merging different numHashes', () => {
    const mh1 = new MinHash(10, 42)
    const mh2 = new MinHash(20, 42)
    expect(() => mh1.merge(mh2)).toThrow()
  })

  it('should return jaccard estimate', () => {
    const mh = new MinHash(100, 42)
    mh.addBatch(['a', 'b', 'c', 'd', 'e'])
    const estimate = mh.jaccardEstimate()
    expect(estimate).toBeGreaterThanOrEqual(0)
    expect(estimate).toBeLessThanOrEqual(1)
  })

  it('should return 0 jaccard estimate for empty min hash', () => {
    const mh = new MinHash(100, 42)
    expect(mh.jaccardEstimate()).toBe(0)
  })

  it('should produce consistent signatures with same seed', () => {
    const mh1 = new MinHash(10, 42)
    const mh2 = new MinHash(10, 42)
    mh1.add('element1')
    mh2.add('element1')
    expect(mh1.signature).toEqual(mh2.signature)
  })

  it('should produce different signatures with different seeds', () => {
    const mh1 = new MinHash(10, 42)
    const mh2 = new MinHash(10, 99)
    mh1.add('element1')
    mh2.add('element1')
    expect(mh1.signature).not.toEqual(mh2.signature)
  })

  it('should handle empty strings', () => {
    const mh = new MinHash(10)
    mh.add('')
    expect(mh.signature.some(v => v !== Infinity)).toBe(true)
  })

  it('should handle special characters', () => {
    const mh = new MinHash(10)
    mh.add('test!@#$%^&*()')
    expect(mh.signature.some(v => v !== Infinity)).toBe(true)
  })

  it('should handle unicode characters', () => {
    const mh = new MinHash(10)
    mh.add('测试🎉')
    expect(mh.signature.some(v => v !== Infinity)).toBe(true)
  })

  it('should handle long strings', () => {
    const mh = new MinHash(10)
    const longString = 'a'.repeat(10000)
    mh.add(longString)
    expect(mh.signature.some(v => v !== Infinity)).toBe(true)
  })

  it('should handle duplicate additions', () => {
    const mh = new MinHash(10, 42)
    mh.add('element1')
    const sig1 = [...mh.signature]
    mh.add('element1')
    const sig2 = mh.signature
    expect(sig1).toEqual(sig2)
  })

  it('should estimate Jaccard using static method', () => {
    const setA = new Set(['a', 'b', 'c'])
    const setB = new Set(['c', 'd', 'e'])
    const estimate = MinHash.estimateJaccard(setA, setB, 100, 42)
    expect(estimate).toBeGreaterThan(0)
    expect(estimate).toBeLessThan(1)
  })

  it('should return 1 for identical sets using static method', () => {
    const setA = new Set(['a', 'b', 'c'])
    const setB = new Set(['a', 'b', 'c'])
    const estimate = MinHash.estimateJaccard(setA, setB, 100, 42)
    expect(estimate).toBe(1)
  })

  it('should handle empty sets using static method', () => {
    const setA = new Set([])
    const setB = new Set([])
    const estimate = MinHash.estimateJaccard(setA, setB, 100, 42)
    expect(estimate).toBe(1)
  })

  it('should handle one empty set using static method', () => {
    const setA = new Set(['a', 'b', 'c'])
    const setB = new Set([])
    const estimate = MinHash.estimateJaccard(setA, setB, 100, 42)
    expect(estimate).toBe(0)
  })

  it('should handle very large numHashes', () => {
    const mh = new MinHash(1000)
    expect(mh.numHashes).toBe(1000)
    expect(mh.signature.length).toBe(1000)
  })

  it('should produce valid signature values', () => {
    const mh = new MinHash(100)
    mh.addBatch(['a', 'b', 'c'])
    mh.signature.forEach(v => {
      if (v !== Infinity) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(4294967295)
      }
    })
  })
})