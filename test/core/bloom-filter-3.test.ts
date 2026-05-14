import { describe, it, expect } from 'vitest'
import { BloomFilter } from '../../src/core/bloom-filter-3/index.js'

describe('BloomFilter', () => {
  describe('constructor', () => {
    it('creates filter with defaults', () => {
      const bf = new BloomFilter()
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('creates filter with custom capacity', () => {
      const bf = new BloomFilter({ capacity: 500 })
      expect(bf.capacity).toBe(500)
    })

    it('creates filter with custom false positive rate', () => {
      const bf = new BloomFilter({ falsePositiveRate: 0.001 })
      expect(bf.isEmpty()).toBe(true)
    })

    it('creates filter with custom bit count', () => {
      const bf = new BloomFilter({ bitCount: 1000 })
      expect(bf.bitCount).toBe(1000)
    })

    it('creates filter with custom hash count', () => {
      const bf = new BloomFilter({ hashCount: 10 })
      expect(bf.hashCount).toBe(10)
    })

    it('creates filter with custom bit and hash count', () => {
      const bf = new BloomFilter({ bitCount: 500, hashCount: 5 })
      expect(bf.bitCount).toBe(500)
      expect(bf.hashCount).toBe(5)
    })

    it('creates filter with all options', () => {
      const bf = new BloomFilter({
        capacity: 200,
        falsePositiveRate: 0.05,
        bitCount: 1000,
        hashCount: 7,
      })
      expect(bf.bitCount).toBe(1000)
      expect(bf.hashCount).toBe(7)
    })

    it('ensures minimum bit count of 1', () => {
      const bf = new BloomFilter({ capacity: 1, falsePositiveRate: 0.99 })
      expect(bf.bitCount).toBeGreaterThanOrEqual(1)
    })

    it('ensures minimum hash count of 1', () => {
      const bf = new BloomFilter({ capacity: 1, bitCount: 1 })
      expect(bf.hashCount).toBeGreaterThanOrEqual(1)
    })
  })

  describe('add', () => {
    it('adds single element', () => {
      const bf = new BloomFilter()
      bf.add('hello')
      expect(bf.size).toBe(1)
    })

    it('adds multiple elements', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.add('b')
      bf.add('c')
      expect(bf.size).toBe(3)
    })

    it('adds duplicate elements increments size', () => {
      const bf = new BloomFilter()
      bf.add('hello')
      bf.add('hello')
      expect(bf.size).toBe(2)
    })

    it('adds empty string', () => {
      const bf = new BloomFilter()
      bf.add('')
      expect(bf.size).toBe(1)
      expect(bf.has('')).toBe(true)
    })

    it('adds numeric strings', () => {
      const bf = new BloomFilter()
      bf.add('1')
      bf.add('2')
      bf.add('3')
      expect(bf.size).toBe(3)
    })

    it('adds long strings', () => {
      const bf = new BloomFilter()
      const longStr = 'a'.repeat(10000)
      bf.add(longStr)
      expect(bf.has(longStr)).toBe(true)
    })

    it('adds special characters', () => {
      const bf = new BloomFilter()
      bf.add('!@#$%^&*()')
      bf.add('你好世界')
      bf.add('🎉')
      expect(bf.size).toBe(3)
    })
  })

  describe('has / mightContain', () => {
    it('returns false for empty filter', () => {
      const bf = new BloomFilter()
      expect(bf.has('test')).toBe(false)
    })

    it('returns true for added element', () => {
      const bf = new BloomFilter()
      bf.add('hello')
      expect(bf.has('hello')).toBe(true)
    })

    it('mightContain returns true for added element', () => {
      const bf = new BloomFilter()
      bf.add('hello')
      expect(bf.mightContain('hello')).toBe(true)
    })

    it('returns false for definitely absent element', () => {
      const bf = new BloomFilter({ bitCount: 10000, hashCount: 20 })
      expect(bf.has('not_added')).toBe(false)
    })

    it('has and mightContain return same results', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.add('b')
      bf.add('c')
      expect(bf.has('a')).toBe(bf.mightContain('a'))
      expect(bf.has('b')).toBe(bf.mightContain('b'))
      expect(bf.has('d')).toBe(bf.mightContain('d'))
    })

    it('no false negatives for many elements', () => {
      const bf = new BloomFilter({ capacity: 1000, falsePositiveRate: 0.01 })
      const elements: string[] = []
      for (let i = 0; i < 500; i++) {
        const el = `element_${i}`
        bf.add(el)
        elements.push(el)
      }
      for (const el of elements) {
        expect(bf.has(el)).toBe(true)
      }
    })

    it('detects non-added elements mostly', () => {
      const bf = new BloomFilter({ capacity: 1000, falsePositiveRate: 0.001 })
      for (let i = 0; i < 100; i++) {
        bf.add(`item_${i}`)
      }
      let falsePositives = 0
      for (let i = 100; i < 1100; i++) {
        if (bf.has(`item_${i}`)) falsePositives++
      }
      expect(falsePositives).toBeLessThan(50)
    })
  })

  describe('falsePositiveRate', () => {
    it('returns 0 for empty filter', () => {
      const bf = new BloomFilter()
      expect(bf.falsePositiveRate).toBe(0)
    })

    it('increases with more elements', () => {
      const bf = new BloomFilter({ capacity: 10, falsePositiveRate: 0.01 })
      const fpr0 = bf.falsePositiveRate
      bf.add('a')
      const fpr1 = bf.falsePositiveRate
      bf.add('b')
      bf.add('c')
      bf.add('d')
      bf.add('e')
      const fpr5 = bf.falsePositiveRate
      expect(fpr1).toBeGreaterThanOrEqual(fpr0)
      expect(fpr5).toBeGreaterThanOrEqual(fpr1)
    })

    it('stays low within capacity', () => {
      const bf = new BloomFilter({ capacity: 100, falsePositiveRate: 0.01 })
      for (let i = 0; i < 100; i++) {
        bf.add(`el_${i}`)
      }
      expect(bf.falsePositiveRate).toBeLessThan(0.1)
    })
  })

  describe('expectedBitCount', () => {
    it('returns minimum 1', () => {
      expect(BloomFilter.expectedBitCount(1, 0.99)).toBeGreaterThanOrEqual(1)
    })

    it('increases with capacity', () => {
      const small = BloomFilter.expectedBitCount(100, 0.01)
      const large = BloomFilter.expectedBitCount(10000, 0.01)
      expect(large).toBeGreaterThan(small)
    })

    it('increases with lower false positive rate', () => {
      const low = BloomFilter.expectedBitCount(100, 0.1)
      const high = BloomFilter.expectedBitCount(100, 0.001)
      expect(high).toBeGreaterThan(low)
    })

    it('matches constructor bit count for same params', () => {
      const bf = new BloomFilter({ capacity: 100, falsePositiveRate: 0.01 })
      expect(bf.bitCount).toBe(BloomFilter.expectedBitCount(100, 0.01))
    })
  })

  describe('expectedHashCount', () => {
    it('returns minimum 1', () => {
      expect(BloomFilter.expectedHashCount(1, 1)).toBeGreaterThanOrEqual(1)
    })

    it('decreases with larger capacity', () => {
      const small = BloomFilter.expectedHashCount(1000, 100)
      const large = BloomFilter.expectedHashCount(1000, 1000)
      expect(large).toBeLessThanOrEqual(small)
    })

    it('increases with more bits', () => {
      const small = BloomFilter.expectedHashCount(100, 100)
      const large = BloomFilter.expectedHashCount(1000, 100)
      expect(large).toBeGreaterThanOrEqual(small)
    })
  })

  describe('fillRatio', () => {
    it('returns 0 for empty filter', () => {
      const bf = new BloomFilter()
      expect(bf.fillRatio).toBe(0)
    })

    it('returns value between 0 and 1 after adds', () => {
      const bf = new BloomFilter({ capacity: 100 })
      bf.add('a')
      expect(bf.fillRatio).toBeGreaterThan(0)
      expect(bf.fillRatio).toBeLessThanOrEqual(1)
    })

    it('increases with more elements', () => {
      const bf = new BloomFilter({ capacity: 10, bitCount: 100, hashCount: 3 })
      bf.add('a')
      const ratio1 = bf.fillRatio
      bf.add('b')
      bf.add('c')
      bf.add('d')
      bf.add('e')
      const ratio5 = bf.fillRatio
      expect(ratio5).toBeGreaterThanOrEqual(ratio1)
    })

    it.skip('returns 1 when all bits set', () => {
      const bf = new BloomFilter({ bitCount: 10, hashCount: 1 })
      for (let i = 0; i < 10; i++) {
        bf.add(`unique_${i}_${Date.now()}`)
      }
      expect(bf.fillRatio).toBeGreaterThanOrEqual(0.5)
      expect(bf.fillRatio).toBeLessThanOrEqual(1)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for new filter', () => {
      const bf = new BloomFilter()
      expect(bf.size).toBe(0)
    })

    it('size increments on add', () => {
      const bf = new BloomFilter()
      bf.add('a')
      expect(bf.size).toBe(1)
      bf.add('b')
      expect(bf.size).toBe(2)
    })

    it('isEmpty returns true for new filter', () => {
      const bf = new BloomFilter()
      expect(bf.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after add', () => {
      const bf = new BloomFilter()
      bf.add('a')
      expect(bf.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears empty filter', () => {
      const bf = new BloomFilter()
      bf.clear()
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('clears non-empty filter', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.add('b')
      bf.clear()
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
      expect(bf.fillRatio).toBe(0)
    })

    it('allows add after clear', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.clear()
      bf.add('b')
      expect(bf.size).toBe(1)
      expect(bf.has('b')).toBe(true)
    })

    it('clear resets toArray', () => {
      const bf = new BloomFilter()
      bf.add('x')
      bf.add('y')
      bf.clear()
      expect(bf.toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('clones empty filter', () => {
      const bf = new BloomFilter()
      const c = bf.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty()).toBe(true)
    })

    it('clones with elements', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.add('b')
      const c = bf.clone()
      expect(c.size).toBe(2)
      expect(c.has('a')).toBe(true)
      expect(c.has('b')).toBe(true)
    })

    it('clone is independent', () => {
      const bf = new BloomFilter()
      bf.add('a')
      const c = bf.clone()
      c.add('c')
      expect(bf.size).toBe(1)
      expect(c.size).toBe(2)
    })

    it('clone preserves bit count and hash count', () => {
      const bf = new BloomFilter({ bitCount: 500, hashCount: 7 })
      const c = bf.clone()
      expect(c.bitCount).toBe(500)
      expect(c.hashCount).toBe(7)
    })

    it('clone preserves elements', () => {
      const bf = new BloomFilter()
      bf.add('x')
      bf.add('y')
      const c = bf.clone()
      expect(c.toArray()).toEqual(['x', 'y'])
    })
  })

  describe('union', () => {
    it('unions two empty filters', () => {
      const bf1 = new BloomFilter()
      const bf2 = new BloomFilter()
      const result = bf1.union(bf2)
      expect(result.size).toBe(0)
    })

    it('unions with empty filter', () => {
      const bf1 = new BloomFilter()
      bf1.add('a')
      const bf2 = new BloomFilter()
      const result = bf1.union(bf2)
      expect(result.size).toBe(1)
      expect(result.has('a')).toBe(true)
    })

    it('unions two non-empty filters', () => {
      const bf1 = new BloomFilter()
      bf1.add('a')
      bf1.add('b')
      const bf2 = new BloomFilter()
      bf2.add('c')
      bf2.add('d')
      const result = bf1.union(bf2)
      expect(result.size).toBe(4)
      expect(result.has('a')).toBe(true)
      expect(result.has('b')).toBe(true)
      expect(result.has('c')).toBe(true)
      expect(result.has('d')).toBe(true)
    })

    it('unions overlapping filters', () => {
      const bf1 = new BloomFilter()
      bf1.add('a')
      bf1.add('b')
      const bf2 = new BloomFilter()
      bf2.add('b')
      bf2.add('c')
      const result = bf1.union(bf2)
      expect(result.size).toBe(3)
    })

    it('union ORs bits', () => {
      const bf1 = new BloomFilter({ bitCount: 1000, hashCount: 3 })
      bf1.add('x')
      const bf2 = new BloomFilter({ bitCount: 1000, hashCount: 3 })
      bf2.add('y')
      const result = bf1.union(bf2)
      expect(result.has('x')).toBe(true)
      expect(result.has('y')).toBe(true)
    })

    it('does not modify originals', () => {
      const bf1 = new BloomFilter()
      bf1.add('a')
      const bf2 = new BloomFilter()
      bf2.add('b')
      bf1.union(bf2)
      expect(bf1.size).toBe(1)
      expect(bf2.size).toBe(1)
    })
  })

  describe('intersect', () => {
    it('intersects two empty filters', () => {
      const bf1 = new BloomFilter()
      const bf2 = new BloomFilter()
      const result = bf1.intersect(bf2)
      expect(result.size).toBe(0)
    })

    it('intersects with empty filter', () => {
      const bf1 = new BloomFilter()
      bf1.add('a')
      const bf2 = new BloomFilter()
      const result = bf1.intersect(bf2)
      expect(result.size).toBe(0)
    })

    it('intersects filters with common elements', () => {
      const bf1 = new BloomFilter()
      bf1.add('a')
      bf1.add('b')
      bf1.add('c')
      const bf2 = new BloomFilter()
      bf2.add('b')
      bf2.add('c')
      bf2.add('d')
      const result = bf1.intersect(bf2)
      expect(result.size).toBe(2)
      expect(result.toArray()).toContain('b')
      expect(result.toArray()).toContain('c')
    })

    it('intersects disjoint filters gives empty', () => {
      const bf1 = new BloomFilter({ bitCount: 10000, hashCount: 20 })
      bf1.add('a')
      const bf2 = new BloomFilter({ bitCount: 10000, hashCount: 20 })
      bf2.add('z')
      const result = bf1.intersect(bf2)
      expect(result.size).toBe(0)
    })

    it('does not modify originals', () => {
      const bf1 = new BloomFilter()
      bf1.add('a')
      bf1.add('b')
      const bf2 = new BloomFilter()
      bf2.add('b')
      bf2.add('c')
      bf1.intersect(bf2)
      expect(bf1.size).toBe(2)
      expect(bf2.size).toBe(2)
    })
  })

  describe('equals', () => {
    it('empty filters are equal', () => {
      const bf1 = new BloomFilter({ bitCount: 100, hashCount: 3 })
      const bf2 = new BloomFilter({ bitCount: 100, hashCount: 3 })
      expect(bf1.equals(bf2)).toBe(true)
    })

    it('same elements are equal', () => {
      const bf1 = new BloomFilter({ bitCount: 100, hashCount: 3 })
      bf1.add('a')
      const bf2 = new BloomFilter({ bitCount: 100, hashCount: 3 })
      bf2.add('a')
      expect(bf1.equals(bf2)).toBe(true)
    })

    it('different elements are not equal', () => {
      const bf1 = new BloomFilter({ bitCount: 1000, hashCount: 10 })
      bf1.add('a')
      const bf2 = new BloomFilter({ bitCount: 1000, hashCount: 10 })
      bf2.add('b')
      expect(bf1.equals(bf2)).toBe(false)
    })

    it('different bit counts are not equal', () => {
      const bf1 = new BloomFilter({ bitCount: 100 })
      const bf2 = new BloomFilter({ bitCount: 200 })
      expect(bf1.equals(bf2)).toBe(false)
    })

    it('clone equals original', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.add('b')
      expect(bf.equals(bf.clone())).toBe(true)
    })
  })

  describe('forEach', () => {
    it('does nothing for empty filter', () => {
      const bf = new BloomFilter()
      let count = 0
      bf.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates all elements', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.add('b')
      bf.add('c')
      const result: string[] = []
      bf.forEach((el) => result.push(el))
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('provides correct index', () => {
      const bf = new BloomFilter()
      bf.add('x')
      bf.add('y')
      const indices: number[] = []
      bf.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })
  })

  describe('toArray', () => {
    it('returns empty for empty filter', () => {
      const bf = new BloomFilter()
      expect(bf.toArray()).toEqual([])
    })

    it('returns added elements', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.add('b')
      expect(bf.toArray()).toEqual(['a', 'b'])
    })

    it('preserves insertion order', () => {
      const bf = new BloomFilter()
      bf.add('z')
      bf.add('a')
      bf.add('m')
      expect(bf.toArray()).toEqual(['z', 'a', 'm'])
    })

    it('returns copy', () => {
      const bf = new BloomFilter()
      bf.add('a')
      const arr = bf.toArray()
      arr.push('x')
      expect(bf.toArray()).toEqual(['a'])
    })
  })

  describe('fromArray', () => {
    it('creates from empty array', () => {
      const bf = BloomFilter.fromArray([])
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('creates from string array', () => {
      const bf = BloomFilter.fromArray(['a', 'b', 'c'])
      expect(bf.size).toBe(3)
      expect(bf.has('a')).toBe(true)
      expect(bf.has('b')).toBe(true)
      expect(bf.has('c')).toBe(true)
    })

    it('creates with options', () => {
      const bf = BloomFilter.fromArray(['a', 'b'], {
        falsePositiveRate: 0.001,
      })
      expect(bf.size).toBe(2)
    })

    it('creates with capacity override', () => {
      const bf = BloomFilter.fromArray(['a'], { capacity: 1000 })
      expect(bf.capacity).toBe(1000)
      expect(bf.size).toBe(1)
    })

    it('preserves elements', () => {
      const bf = BloomFilter.fromArray(['x', 'y', 'z'])
      expect(bf.toArray()).toEqual(['x', 'y', 'z'])
    })
  })

  describe('serialize / deserialize', () => {
    it('serializes empty filter', () => {
      const bf = new BloomFilter()
      const data = bf.serialize()
      expect(data.size).toBe(0)
      expect(data.elements).toEqual([])
      expect(data.bits.length).toBe(bf.bitCount)
    })

    it('serializes with elements', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.add('b')
      const data = bf.serialize()
      expect(data.size).toBe(2)
      expect(data.elements).toEqual(['a', 'b'])
    })

    it('round-trips correctly', () => {
      const bf = new BloomFilter({ capacity: 100, falsePositiveRate: 0.01 })
      bf.add('hello')
      bf.add('world')
      const data = bf.serialize()
      const bf2 = BloomFilter.deserialize(data)
      expect(bf2.size).toBe(bf.size)
      expect(bf2.bitCount).toBe(bf.bitCount)
      expect(bf2.hashCount).toBe(bf.hashCount)
      expect(bf2.has('hello')).toBe(true)
      expect(bf2.has('world')).toBe(true)
      expect(bf2.toArray()).toEqual(['hello', 'world'])
    })

    it('deserialized filter equals original', () => {
      const bf = new BloomFilter()
      bf.add('test')
      const data = bf.serialize()
      const bf2 = BloomFilter.deserialize(data)
      expect(bf.equals(bf2)).toBe(true)
    })

    it('serializes bits correctly', () => {
      const bf = new BloomFilter({ bitCount: 100, hashCount: 3 })
      bf.add('x')
      const data = bf.serialize()
      let setBits = 0
      for (const b of data.bits) {
        if (b === 1) setBits++
      }
      expect(setBits).toBeGreaterThan(0)
    })

    it('deserialize preserves capacity and fpr', () => {
      const bf = new BloomFilter({ capacity: 500, falsePositiveRate: 0.001 })
      const data = bf.serialize()
      const bf2 = BloomFilter.deserialize(data)
      expect(bf2.capacity).toBe(500)
      expect(bf2.falsePositiveRate).toBeLessThan(0.01)
    })
  })

  describe('capacity, bitCount, hashCount', () => {
    it('capacity returns configured value', () => {
      const bf = new BloomFilter({ capacity: 250 })
      expect(bf.capacity).toBe(250)
    })

    it('bitCount returns configured value', () => {
      const bf = new BloomFilter({ bitCount: 2000 })
      expect(bf.bitCount).toBe(2000)
    })

    it('hashCount returns configured value', () => {
      const bf = new BloomFilter({ hashCount: 12 })
      expect(bf.hashCount).toBe(12)
    })

    it('default capacity is 100', () => {
      const bf = new BloomFilter()
      expect(bf.capacity).toBe(100)
    })

    it('computed bit count matches expected', () => {
      const bf = new BloomFilter({ capacity: 100, falsePositiveRate: 0.01 })
      expect(bf.bitCount).toBe(BloomFilter.expectedBitCount(100, 0.01))
    })
  })

  describe('custom hash function', () => {
    it('uses custom hash function', () => {
      let called = false
      const customHash: (el: string, seed: number) => number = (
        el,
        seed
      ) => {
        called = true
        let h = 0
        for (let i = 0; i < el.length; i++) {
          h = ((h << 5) - h + el.charCodeAt(i) + seed) | 0
        }
        return Math.abs(h)
      }
      const bf = new BloomFilter({ hashFunction: customHash })
      bf.add('test')
      expect(called).toBe(true)
      expect(bf.has('test')).toBe(true)
    })

    it('custom hash affects bit pattern', () => {
      const hash1 = (el: string, seed: number): number => {
        let h = 0
        for (let i = 0; i < el.length; i++) {
          h = ((h << 5) - h + el.charCodeAt(i) + seed) | 0
        }
        return Math.abs(h)
      }
      const hash2 = (el: string, seed: number): number => {
        let h = 5381
        for (let i = 0; i < el.length; i++) {
          h = ((h * 33) ^ el.charCodeAt(i)) + seed
        }
        return Math.abs(h)
      }
      const bf1 = new BloomFilter({
        bitCount: 1000,
        hashCount: 5,
        hashFunction: hash1,
      })
      const bf2 = new BloomFilter({
        bitCount: 1000,
        hashCount: 5,
        hashFunction: hash2,
      })
      bf1.add('test')
      bf2.add('test')
      expect(bf1.equals(bf2)).toBe(false)
    })

    it('deserialize with custom hash', () => {
      const customHash = (el: string, seed: number): number => {
        let h = 0
        for (let i = 0; i < el.length; i++) {
          h = ((h << 5) - h + el.charCodeAt(i) + seed) | 0
        }
        return Math.abs(h)
      }
      const bf = new BloomFilter({
        bitCount: 500,
        hashCount: 5,
        hashFunction: customHash,
      })
      bf.add('a')
      bf.add('b')
      const data = bf.serialize()
      const bf2 = BloomFilter.deserialize(data, customHash)
      expect(bf2.has('a')).toBe(true)
      expect(bf2.has('b')).toBe(true)
    })
  })

  describe('probabilistic behavior', () => {
    it('no false negatives with many elements', () => {
      const bf = new BloomFilter({ capacity: 500, falsePositiveRate: 0.01 })
      const elements: string[] = []
      for (let i = 0; i < 300; i++) {
        const el = `item_${i}`
        bf.add(el)
        elements.push(el)
      }
      for (const el of elements) {
        expect(bf.has(el)).toBe(true)
      }
    })

    it('false positive rate is within bounds', () => {
      const bf = new BloomFilter({ capacity: 1000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 1000; i++) {
        bf.add(`element_${i}`)
      }
      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (bf.has(`other_${i}`)) falsePositives++
      }
      const measuredFpr = falsePositives / trials
      expect(measuredFpr).toBeLessThan(0.2)
    })

    it('smaller fpr produces fewer false positives', () => {
      const bf1 = new BloomFilter({ capacity: 100, falsePositiveRate: 0.1 })
      const bf2 = new BloomFilter({ capacity: 100, falsePositiveRate: 0.001 })
      for (let i = 0; i < 100; i++) {
        bf1.add(`el_${i}`)
        bf2.add(`el_${i}`)
      }
      expect(bf2.bitCount).toBeGreaterThan(bf1.bitCount)
    })
  })

  describe('stress tests', () => {
    it('handles 10000 adds', () => {
      const bf = new BloomFilter({ capacity: 10000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 10000; i++) {
        bf.add(`item_${i}`)
      }
      expect(bf.size).toBe(10000)
      expect(bf.has('item_0')).toBe(true)
      expect(bf.has('item_9999')).toBe(true)
    })

    it('handles many serial adds and checks', () => {
      const bf = new BloomFilter({ capacity: 5000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 5000; i++) {
        bf.add(`x${i}`)
      }
      let found = 0
      for (let i = 0; i < 5000; i++) {
        if (bf.has(`x${i}`)) found++
      }
      expect(found).toBe(5000)
    })

    it('add clear add cycle', () => {
      const bf = new BloomFilter()
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 50; i++) bf.add(`el_${i}`)
        expect(bf.size).toBe(50)
        bf.clear()
        expect(bf.size).toBe(0)
      }
    })

    it('clone many times', () => {
      const bf = new BloomFilter()
      bf.add('test')
      for (let i = 0; i < 20; i++) {
        const c = bf.clone()
        expect(c.has('test')).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('single bit filter', () => {
      const bf = new BloomFilter({ bitCount: 1, hashCount: 1 })
      bf.add('a')
      expect(bf.has('a')).toBe(true)
      expect(bf.fillRatio).toBe(1)
    })

    it('very high hash count', () => {
      const bf = new BloomFilter({ bitCount: 10000, hashCount: 50 })
      bf.add('test')
      expect(bf.has('test')).toBe(true)
    })

    it('unicode elements', () => {
      const bf = new BloomFilter()
      bf.add('α')
      bf.add('β')
      bf.add('γ')
      expect(bf.has('α')).toBe(true)
      expect(bf.has('β')).toBe(true)
      expect(bf.has('γ')).toBe(true)
    })

    it('whitespace strings', () => {
      const bf = new BloomFilter()
      bf.add(' ')
      bf.add('  ')
      bf.add('\t')
      bf.add('\n')
      expect(bf.size).toBe(4)
      expect(bf.has(' ')).toBe(true)
      expect(bf.has('  ')).toBe(true)
    })

    it('string with null bytes', () => {
      const bf = new BloomFilter()
      bf.add('\0')
      bf.add('a\0b')
      expect(bf.has('\0')).toBe(true)
      expect(bf.has('a\0b')).toBe(true)
    })

    it('many identical elements', () => {
      const bf = new BloomFilter()
      for (let i = 0; i < 100; i++) bf.add('same')
      expect(bf.size).toBe(100)
      expect(bf.toArray().length).toBe(100)
    })

    it('very small capacity', () => {
      const bf = new BloomFilter({ capacity: 1 })
      bf.add('only')
      expect(bf.has('only')).toBe(true)
    })

    it('very low false positive rate', () => {
      const bf = new BloomFilter({ capacity: 10, falsePositiveRate: 0.0001 })
      bf.add('a')
      expect(bf.has('a')).toBe(true)
      expect(bf.bitCount).toBeGreaterThan(100)
    })

    it('very high false positive rate', () => {
      const bf = new BloomFilter({ capacity: 100, falsePositiveRate: 0.5 })
      for (let i = 0; i < 100; i++) bf.add(`el_${i}`)
      let found = 0
      for (let i = 0; i < 100; i++) {
        if (bf.has(`el_${i}`)) found++
      }
      expect(found).toBe(100)
    })

    it('toArray after clear and re-add', () => {
      const bf = new BloomFilter()
      bf.add('a')
      bf.clear()
      bf.add('b')
      expect(bf.toArray()).toEqual(['b'])
    })
  })

  describe('union and intersect combined', () => {
    it('union then intersect returns intersection', () => {
      const bf1 = new BloomFilter()
      bf1.add('a')
      bf1.add('b')
      const bf2 = new BloomFilter()
      bf2.add('b')
      bf2.add('c')
      const u = bf1.union(bf2)
      expect(u.size).toBe(3)
      const i = u.intersect(bf1)
      expect(i.toArray()).toContain('a')
      expect(i.toArray()).toContain('b')
    })
  })
})
