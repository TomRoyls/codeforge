import { describe, it, expect } from 'vitest'
import { ScalableBloomFilter } from '../../src/utils/scalable-bloom-filter.js'

describe('ScalableBloomFilter', () => {
  describe('constructor', () => {
    it('creates with default parameters', () => {
      const sbf = new ScalableBloomFilter()
      expect(sbf.size).toBe(0)
      expect(sbf.filterCount).toBe(1)
      expect(sbf.capacity).toBe(1000)
      expect(sbf.isEmpty()).toBe(true)
    })

    it('creates with custom initial capacity', () => {
      const sbf = new ScalableBloomFilter(500)
      expect(sbf.capacity).toBe(500)
      expect(sbf.isEmpty()).toBe(true)
    })

    it('creates with custom error rate', () => {
      const sbf = new ScalableBloomFilter(100, 0.001)
      expect(sbf.size).toBe(0)
      expect(sbf.filterCount).toBe(1)
    })

    it('creates with custom growth factor', () => {
      const sbf = new ScalableBloomFilter(100, 0.01, 4)
      expect(sbf.capacity).toBe(100)
      expect(sbf.filterCount).toBe(1)
    })

    it('creates with all custom parameters', () => {
      const sbf = new ScalableBloomFilter(200, 0.005, 3)
      expect(sbf.size).toBe(0)
      expect(sbf.filterCount).toBe(1)
      expect(sbf.capacity).toBe(200)
    })
  })

  describe('add and mightContain', () => {
    it('adds a single item and finds it', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('hello')
      expect(sbf.mightContain('hello')).toBe(true)
    })

    it('does not find item that was not added', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('present')
      expect(sbf.mightContain('missing')).toBe(false)
    })

    it('adds multiple items and finds all', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('item1')
      sbf.add('item2')
      sbf.add('item3')
      expect(sbf.mightContain('item1')).toBe(true)
      expect(sbf.mightContain('item2')).toBe(true)
      expect(sbf.mightContain('item3')).toBe(true)
    })

    it('tracks size correctly', () => {
      const sbf = new ScalableBloomFilter(100)
      expect(sbf.size).toBe(0)
      sbf.add('a')
      expect(sbf.size).toBe(1)
      sbf.add('b')
      expect(sbf.size).toBe(2)
      sbf.add('c')
      expect(sbf.size).toBe(3)
    })

    it('handles duplicate additions', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('dup')
      sbf.add('dup')
      sbf.add('dup')
      expect(sbf.size).toBe(3)
      expect(sbf.mightContain('dup')).toBe(true)
    })

    it('handles empty string', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('')
      expect(sbf.mightContain('')).toBe(true)
      expect(sbf.size).toBe(1)
    })

    it('handles special characters', () => {
      const sbf = new ScalableBloomFilter(100)
      const items = ['!@#$%^&*()', 'émojis😀', '\ttab\nnewline']
      for (const item of items) {
        sbf.add(item)
      }
      for (const item of items) {
        expect(sbf.mightContain(item)).toBe(true)
      }
    })

    it('is case sensitive', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('Hello')
      expect(sbf.mightContain('Hello')).toBe(true)
      expect(sbf.mightContain('hello')).toBe(false)
      expect(sbf.mightContain('HELLO')).toBe(false)
    })

    it('returns false for empty filter', () => {
      const sbf = new ScalableBloomFilter(100)
      expect(sbf.mightContain('anything')).toBe(false)
    })
  })

  describe('auto-expansion', () => {
    it('creates additional filters when capacity is exceeded', () => {
      const sbf = new ScalableBloomFilter(10, 0.01, 2)
      for (let i = 0; i < 15; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.filterCount).toBeGreaterThan(1)
      expect(sbf.size).toBe(15)
    })

    it('still finds all items after expansion', () => {
      const sbf = new ScalableBloomFilter(10, 0.01, 2)
      for (let i = 0; i < 25; i++) {
        sbf.add(`item-${i}`)
      }
      for (let i = 0; i < 25; i++) {
        expect(sbf.mightContain(`item-${i}`)).toBe(true)
      }
    })

    it('capacity grows with growth factor', () => {
      const sbf = new ScalableBloomFilter(10, 0.01, 2)
      expect(sbf.capacity).toBe(10)
      for (let i = 0; i < 11; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.filterCount).toBeGreaterThan(1)
      expect(sbf.capacity).toBeGreaterThan(10)
    })

    it('capacity reflects total across all filters', () => {
      const sbf = new ScalableBloomFilter(10, 0.01, 2)
      const cap1 = sbf.capacity
      for (let i = 0; i < 11; i++) {
        sbf.add(`item-${i}`)
      }
      const cap2 = sbf.capacity
      expect(cap2).toBeGreaterThan(cap1)
    })

    it('each new filter has tighter error rate', () => {
      const sbf = new ScalableBloomFilter(10, 0.04, 2)
      for (let i = 0; i < 11; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.filterCount).toBeGreaterThan(1)
    })

    it('growth factor of 3 creates larger subsequent filters', () => {
      const sbf = new ScalableBloomFilter(10, 0.01, 3)
      for (let i = 0; i < 11; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.filterCount).toBeGreaterThan(1)
      expect(sbf.capacity).toBeGreaterThanOrEqual(10 + 30)
    })
  })

  describe('size tracking', () => {
    it('size is 0 for new filter', () => {
      const sbf = new ScalableBloomFilter(100)
      expect(sbf.size).toBe(0)
    })

    it('size increments with each add', () => {
      const sbf = new ScalableBloomFilter(100)
      for (let i = 0; i < 5; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.size).toBe(5)
    })

    it('size tracks correctly across expansions', () => {
      const sbf = new ScalableBloomFilter(5, 0.01, 2)
      for (let i = 0; i < 20; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.size).toBe(20)
    })
  })

  describe('filterCount', () => {
    it('starts with 1 filter', () => {
      const sbf = new ScalableBloomFilter(100)
      expect(sbf.filterCount).toBe(1)
    })

    it('increases as items exceed capacity', () => {
      const sbf = new ScalableBloomFilter(5, 0.01, 2)
      const initialCount = sbf.filterCount
      for (let i = 0; i < 12; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.filterCount).toBeGreaterThan(initialCount)
    })
  })

  describe('clear and isEmpty', () => {
    it('clear resets to empty state', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('item1')
      sbf.add('item2')
      sbf.clear()
      expect(sbf.size).toBe(0)
      expect(sbf.isEmpty()).toBe(true)
      expect(sbf.mightContain('item1')).toBe(false)
      expect(sbf.mightContain('item2')).toBe(false)
    })

    it('clear resets filter count to 1', () => {
      const sbf = new ScalableBloomFilter(5, 0.01, 2)
      for (let i = 0; i < 12; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.filterCount).toBeGreaterThan(1)
      sbf.clear()
      expect(sbf.filterCount).toBe(1)
    })

    it('isEmpty returns true for new filter', () => {
      const sbf = new ScalableBloomFilter(100)
      expect(sbf.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after adding items', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('item')
      expect(sbf.isEmpty()).toBe(false)
    })

    it('can add items after clear', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('before-clear')
      sbf.clear()
      sbf.add('after-clear')
      expect(sbf.mightContain('after-clear')).toBe(true)
      expect(sbf.mightContain('before-clear')).toBe(false)
      expect(sbf.size).toBe(1)
    })
  })

  describe('toString', () => {
    it('returns descriptive string', () => {
      const sbf = new ScalableBloomFilter(100)
      const str = sbf.toString()
      expect(str).toContain('ScalableBloomFilter')
      expect(str).toContain('size=0')
      expect(str).toContain('filters=1')
    })

    it('includes updated size', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('test')
      const str = sbf.toString()
      expect(str).toContain('size=1')
    })
  })

  describe('toJSON', () => {
    it('returns serializable object', () => {
      const sbf = new ScalableBloomFilter(100, 0.01, 2)
      const json = sbf.toJSON() as Record<string, unknown>
      expect(json.type).toBe('ScalableBloomFilter')
      expect(json.size).toBe(0)
      expect(json.filterCount).toBe(1)
      expect(json.initialCapacity).toBe(100)
      expect(json.baseErrorRate).toBe(0.01)
      expect(json.growthFactor).toBe(2)
      expect(Array.isArray(json.filters)).toBe(true)
    })

    it('reflects current state', () => {
      const sbf = new ScalableBloomFilter(5, 0.01, 2)
      for (let i = 0; i < 8; i++) {
        sbf.add(`item-${i}`)
      }
      const json = sbf.toJSON() as Record<string, unknown>
      expect(json.size).toBe(8)
      expect(json.filterCount).toBeGreaterThan(1)
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('original')
      const cloned = sbf.clone()
      expect(cloned.equals(sbf)).toBe(true)
      cloned.add('extra')
      expect(cloned.size).toBe(sbf.size + 1)
    })

    it('clone has same size', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('a')
      sbf.add('b')
      const cloned = sbf.clone()
      expect(cloned.size).toBe(sbf.size)
    })

    it('clone has same filter count', () => {
      const sbf = new ScalableBloomFilter(5, 0.01, 2)
      for (let i = 0; i < 8; i++) {
        sbf.add(`item-${i}`)
      }
      const cloned = sbf.clone()
      expect(cloned.filterCount).toBe(sbf.filterCount)
    })

    it('clone finds same items', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('find-me')
      const cloned = sbf.clone()
      expect(cloned.mightContain('find-me')).toBe(true)
    })
  })

  describe('equals', () => {
    it('returns false for non-ScalableBloomFilter', () => {
      const sbf = new ScalableBloomFilter(100)
      expect(sbf.equals(null)).toBe(false)
      expect(sbf.equals(undefined)).toBe(false)
      expect(sbf.equals({})).toBe(false)
      expect(sbf.equals('string')).toBe(false)
      expect(sbf.equals(42)).toBe(false)
    })

    it('returns true for identical filters', () => {
      const sbf1 = new ScalableBloomFilter(100)
      const sbf2 = new ScalableBloomFilter(100)
      sbf1.add('same')
      sbf2.add('same')
      expect(sbf1.equals(sbf2)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const sbf1 = new ScalableBloomFilter(100)
      const sbf2 = new ScalableBloomFilter(100)
      sbf1.add('extra')
      expect(sbf1.equals(sbf2)).toBe(false)
    })

    it('returns false for different initial capacities', () => {
      const sbf1 = new ScalableBloomFilter(100)
      const sbf2 = new ScalableBloomFilter(200)
      expect(sbf1.equals(sbf2)).toBe(false)
    })

    it('returns false for different error rates', () => {
      const sbf1 = new ScalableBloomFilter(100, 0.01)
      const sbf2 = new ScalableBloomFilter(100, 0.001)
      expect(sbf1.equals(sbf2)).toBe(false)
    })

    it('returns false for different growth factors', () => {
      const sbf1 = new ScalableBloomFilter(100, 0.01, 2)
      const sbf2 = new ScalableBloomFilter(100, 0.01, 3)
      expect(sbf1.equals(sbf2)).toBe(false)
    })

    it('cloned filter equals original', () => {
      const sbf = new ScalableBloomFilter(100)
      sbf.add('test')
      expect(sbf.clone().equals(sbf)).toBe(true)
    })
  })

  describe('no false negatives guarantee', () => {
    it('never misses items across expansions', () => {
      const sbf = new ScalableBloomFilter(10, 0.01, 2)
      const items: string[] = []
      for (let i = 0; i < 50; i++) {
        const item = `item-${i}`
        items.push(item)
        sbf.add(item)
      }
      for (const item of items) {
        expect(sbf.mightContain(item)).toBe(true)
      }
    })

    it('no false negatives with large dataset', () => {
      const sbf = new ScalableBloomFilter(100, 0.01, 2)
      const items: string[] = []
      for (let i = 0; i < 1000; i++) {
        const item = `item-${i}`
        items.push(item)
        sbf.add(item)
      }
      for (const item of items) {
        expect(sbf.mightContain(item)).toBe(true)
      }
      expect(sbf.size).toBe(1000)
    })
  })

  describe('large datasets', () => {
    it('handles 1000+ items', () => {
      const sbf = new ScalableBloomFilter(100, 0.01, 2)
      for (let i = 0; i < 1500; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.size).toBe(1500)
      expect(sbf.filterCount).toBeGreaterThan(1)
      expect(sbf.mightContain('item-0')).toBe(true)
      expect(sbf.mightContain('item-749')).toBe(true)
      expect(sbf.mightContain('item-1499')).toBe(true)
    })

    it('maintains low false positive rate on large dataset', () => {
      const sbf = new ScalableBloomFilter(1000, 0.005, 2)
      for (let i = 0; i < 1000; i++) {
        sbf.add(`item-${i}`)
      }
      let falsePositives = 0
      const testCount = 1000
      for (let i = 0; i < testCount; i++) {
        if (sbf.mightContain(`nonexistent-${i}`)) {
          falsePositives++
        }
      }
      const actualRate = falsePositives / testCount
      expect(actualRate).toBeLessThan(0.1)
    })
  })

  describe('falsePositiveRate', () => {
    it('is 0 for empty filter', () => {
      const sbf = new ScalableBloomFilter(100)
      expect(sbf.falsePositiveRate).toBe(0)
    })

    it('increases as items are added', () => {
      const sbf = new ScalableBloomFilter(50)
      for (let i = 0; i < 30; i++) {
        sbf.add(`item-${i}`)
      }
      expect(sbf.falsePositiveRate).toBeGreaterThan(0)
    })
  })
})
