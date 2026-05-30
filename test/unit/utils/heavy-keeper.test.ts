import { describe, expect, it } from 'vitest'
import { HeavyKeeper } from '../../../src/utils/heavy-keeper.js'

describe('HeavyKeeper', () => {
  describe('constructor', () => {
    it('should create instance with default options', () => {
      const hk = new HeavyKeeper()
      expect(hk.total).toBe(0)
      expect(hk.size).toBe(1024)
      expect(hk.isEmpty()).toBe(true)
    })

    it('should create instance with custom options', () => {
      const hk = new HeavyKeeper({ depth: 2, width: 128, decay: 0.8 })
      expect(hk.size).toBe(256)
      expect(hk.isEmpty()).toBe(true)
    })

    it('should throw on invalid depth', () => {
      expect(() => new HeavyKeeper({ depth: 0 })).toThrow(RangeError)
      expect(() => new HeavyKeeper({ depth: -1 })).toThrow(RangeError)
    })

    it('should throw on invalid width', () => {
      expect(() => new HeavyKeeper({ width: 0 })).toThrow(RangeError)
      expect(() => new HeavyKeeper({ width: -1 })).toThrow(RangeError)
    })

    it('should throw on invalid decay', () => {
      expect(() => new HeavyKeeper({ decay: 0 })).toThrow(RangeError)
      expect(() => new HeavyKeeper({ decay: 1 })).toThrow(RangeError)
      expect(() => new HeavyKeeper({ decay: -0.1 })).toThrow(RangeError)
      expect(() => new HeavyKeeper({ decay: 1.1 })).toThrow(RangeError)
    })

    it('should accept valid decay values', () => {
      expect(() => new HeavyKeeper({ decay: 0.1 })).not.toThrow()
      expect(() => new HeavyKeeper({ decay: 0.5 })).not.toThrow()
      expect(() => new HeavyKeeper({ decay: 0.9 })).not.toThrow()
      expect(() => new HeavyKeeper({ decay: 0.99 })).not.toThrow()
    })
  })

  describe('update', () => {
    it('should update single item', () => {
      const hk = new HeavyKeeper()
      hk.update('a')
      expect(hk.total).toBe(1)
      expect(hk.estimate('a')).toBeGreaterThan(0)
    })

    it('should update same item multiple times', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 10)
      expect(hk.total).toBe(10)
      expect(hk.estimate('a')).toBe(10)
    })

    it('should update multiple items', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.update('b', 3)
      hk.update('c', 2)
      expect(hk.total).toBe(10)
    })

    it('should ignore non-positive counts', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 0)
      hk.update('b', -1)
      expect(hk.total).toBe(0)
    })

    it('should handle empty strings', () => {
      const hk = new HeavyKeeper()
      hk.update('', 5)
      expect(hk.total).toBe(5)
    })

    it('should handle large counts', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 1000000)
      expect(hk.total).toBe(1000000)
      expect(hk.estimate('a')).toBe(1000000)
    })
  })

  describe('estimate', () => {
    it('should return 0 for items not in keeper', () => {
      const hk = new HeavyKeeper()
      expect(hk.estimate('a')).toBe(0)
    })

    it('should return positive count for known items', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      expect(hk.estimate('a')).toBe(5)
    })

    it('should handle multiple items', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.update('b', 3)
      hk.update('c', 2)
      expect(hk.estimate('a')).toBe(5)
      expect(hk.estimate('b')).toBe(3)
      expect(hk.estimate('c')).toBe(2)
    })

    it('should handle decay for frequent items', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 100)
      hk.update('b', 10)
      expect(hk.estimate('a')).toBeGreaterThan(50)
    })
  })

  describe('heavyHitters', () => {
    it('should return empty array for empty keeper', () => {
      const hk = new HeavyKeeper()
      expect(hk.heavyHitters(0.5)).toEqual([])
    })

    it('should return all items with threshold 0', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.update('b', 3)
      hk.update('c', 2)
      const result = hk.heavyHitters(0)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return no items with threshold 1', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.update('b', 3)
      hk.update('c', 2)
      expect(hk.heavyHitters(1)).toEqual([])
    })

    it('should throw on invalid threshold', () => {
      const hk = new HeavyKeeper()
      expect(() => hk.heavyHitters(-0.1)).toThrow(RangeError)
      expect(() => hk.heavyHitters(1.1)).toThrow(RangeError)
    })

    it('should return items with >50% frequency at threshold 0.5', () => {
      const hk = new HeavyKeeper({ depth: 4, width: 256 })
      for (let i = 0; i < 1000; i++) {
        hk.update('heavy')
      }
      hk.update('light1', 10)
      hk.update('light2', 10)
      hk.update('light3', 10)
      const result = hk.heavyHitters(0.5)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].key).toBe('heavy')
      expect(result[0].count).toBeGreaterThan(800)
    })

    it('should be sorted by count descending', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 10)
      hk.update('b', 5)
      hk.update('c', 3)
      const result = hk.heavyHitters(0)
      expect(result[0].count).toBeGreaterThanOrEqual(result[1].count)
      expect(result[1].count).toBeGreaterThanOrEqual(result[2].count)
    })
  })

  describe('top', () => {
    it('should return empty array for empty keeper', () => {
      const hk = new HeavyKeeper()
      expect(hk.top(5)).toEqual([])
    })

    it('should return top-k items', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 10)
      hk.update('b', 5)
      hk.update('c', 3)
      hk.update('d', 2)
      hk.update('e', 1)
      const result = hk.top(3)
      expect(result.length).toBe(3)
      expect(result[0].key).toBe('a')
      expect(result[0].count).toBe(10)
    })

    it('should handle k larger than number of items', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 10)
      hk.update('b', 5)
      const result = hk.top(10)
      expect(result.length).toBeLessThanOrEqual(2)
    })

    it('should return empty array for k=0', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 10)
      expect(hk.top(0)).toEqual([])
    })

    it('should be sorted by count descending', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 10)
      hk.update('b', 5)
      hk.update('c', 3)
      const result = hk.top(3)
      expect(result[0].count).toBeGreaterThanOrEqual(result[1].count)
      expect(result[1].count).toBeGreaterThanOrEqual(result[2].count)
    })
  })

  describe('total', () => {
    it('should return 0 for empty keeper', () => {
      const hk = new HeavyKeeper()
      expect(hk.total).toBe(0)
    })

    it('should return sum of all updates', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.update('b', 3)
      hk.update('c', 2)
      expect(hk.total).toBe(10)
    })

    it('should ignore non-positive updates', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.update('b', 0)
      hk.update('c', -1)
      expect(hk.total).toBe(5)
    })
  })

  describe('size', () => {
    it('should return depth * width', () => {
      const hk = new HeavyKeeper({ depth: 4, width: 256 })
      expect(hk.size).toBe(1024)
    })

    it('should return default size', () => {
      const hk = new HeavyKeeper()
      expect(hk.size).toBe(1024)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty keeper', () => {
      const hk = new HeavyKeeper()
      expect(hk.isEmpty()).toBe(true)
    })

    it('should return false after update', () => {
      const hk = new HeavyKeeper()
      hk.update('a')
      expect(hk.isEmpty()).toBe(false)
    })

    it('should return true after reset', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.reset()
      expect(hk.isEmpty()).toBe(true)
    })
  })

  describe('reset', () => {
    it('should clear all data', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.update('b', 3)
      hk.update('c', 2)
      hk.reset()
      expect(hk.total).toBe(0)
      expect(hk.isEmpty()).toBe(true)
      expect(hk.estimate('a')).toBe(0)
      expect(hk.heavyHitters(0)).toEqual([])
    })

    it('should allow fresh updates after reset', () => {
      const hk = new HeavyKeeper()
      hk.update('a', 5)
      hk.reset()
      hk.update('b', 10)
      expect(hk.total).toBe(10)
      expect(hk.estimate('b')).toBe(10)
    })
  })

  describe('fromItems', () => {
    it('should create keeper from array of items', () => {
      const items = ['a', 'a', 'a', 'b', 'b', 'c']
      const hk = HeavyKeeper.fromItems(items)
      expect(hk.total).toBe(6)
      expect(hk.estimate('a')).toBe(3)
    })

    it('should accept options', () => {
      const items = ['a', 'b', 'c']
      const hk = HeavyKeeper.fromItems(items, { depth: 2, width: 128 })
      expect(hk.size).toBe(256)
    })

    it('should handle empty array', () => {
      const hk = HeavyKeeper.fromItems([])
      expect(hk.total).toBe(0)
      expect(hk.isEmpty()).toBe(true)
    })

    it('should handle single item', () => {
      const hk = HeavyKeeper.fromItems(['a'])
      expect(hk.total).toBe(1)
      expect(hk.estimate('a')).toBe(1)
    })

    it('should handle many items', () => {
      const items = []
      for (let i = 0; i < 1000; i++) {
        items.push('heavy')
      }
      items.push('light1', 'light2', 'light3')
      const hk = HeavyKeeper.fromItems(items)
      expect(hk.total).toBe(1003)
      expect(hk.estimate('heavy')).toBeGreaterThan(500)
    })
  })

  describe('integration tests', () => {
    it('should handle seeded test with heavy hitter dominance', () => {
      const hk = new HeavyKeeper({ depth: 4, width: 256 })
      for (let i = 0; i < 1000; i++) {
        hk.update('heavy')
      }
      hk.update('light1', 10)
      hk.update('light2', 10)
      hk.update('light3', 10)
      expect(hk.total).toBe(1030)
      expect(hk.estimate('heavy')).toBeGreaterThan(800)
      const hitters = hk.heavyHitters(0.5)
      expect(hitters.length).toBeGreaterThan(0)
      expect(hitters[0].key).toBe('heavy')
    })

    it('should track multiple heavy hitters', () => {
      const hk = new HeavyKeeper()
      for (let i = 0; i < 500; i++) {
        hk.update('a')
        hk.update('b')
      }
      for (let i = 0; i < 100; i++) {
        hk.update('c')
      }
      const hitters = hk.heavyHitters(0.3)
      expect(hitters.length).toBeGreaterThanOrEqual(2)
      expect(hitters.some((h) => h.key === 'a')).toBe(true)
      expect(hitters.some((h) => h.key === 'b')).toBe(true)
    })

    it('should handle long keys', () => {
      const hk = new HeavyKeeper()
      const longKey = 'a'.repeat(1000)
      hk.update(longKey, 100)
      expect(hk.estimate(longKey)).toBeGreaterThan(0)
    })

    it('should handle unicode keys', () => {
      const hk = new HeavyKeeper()
      hk.update('hello', 10)
      hk.update('世界', 5)
      hk.update('🎉', 3)
      expect(hk.estimate('hello')).toBe(10)
      expect(hk.estimate('世界')).toBe(5)
      expect(hk.estimate('🎉')).toBe(3)
    })
  })
})