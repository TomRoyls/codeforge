import { describe, it, expect } from 'vitest'
import { ScapegoatTreeMap } from '../../src/core/scapegoat-tree-map/scapegoat-tree-map.js'

function assertBalanced<K, V>(m: ScapegoatTreeMap<K, V>): void {
  const height = m.getHeight()
  const sz = m.size
  if (sz === 0) {
    expect(height).toBe(0)
    return
  }
  expect(height).toBeGreaterThan(0)
  expect(height).toBeLessThanOrEqual(Math.ceil(3 * Math.log2(sz + 1)))
}

describe('ScapegoatTreeMap', () => {
  describe('constructor', () => {
    it('should create empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.size).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const m = new ScapegoatTreeMap<number, string>({
        compare: (a, b) => b - a,
      })
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.keys()).toEqual([3, 2, 1])
    })

    it('should accept string comparator', () => {
      const m = new ScapegoatTreeMap<string, number>({
        compare: (a, b) => a.localeCompare(b),
      })
      m.set('banana', 2)
      m.set('apple', 1)
      m.set('cherry', 3)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should accept custom alpha', () => {
      const m = new ScapegoatTreeMap<number, string>({ alpha: 0.5 })
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.stats().alpha).toBe(0.5)
    })

    it('should accept both compare and alpha', () => {
      const m = new ScapegoatTreeMap<number, string>({
        compare: (a, b) => b - a,
        alpha: 0.75,
      })
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.stats().alpha).toBe(0.75)
      expect(m.keys()).toEqual([2, 1])
    })

    it('should clamp alpha below 0.5 to 0.5', () => {
      const m = new ScapegoatTreeMap<number, string>({ alpha: 0.1 })
      expect(m.stats().alpha).toBe(0.5)
    })

    it('should clamp alpha above 1.0 to 1.0', () => {
      const m = new ScapegoatTreeMap<number, string>({ alpha: 2.0 })
      expect(m.stats().alpha).toBe(1.0)
    })

    it('should default alpha to ~0.667', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.stats().alpha).toBe(0.667)
    })
  })

  describe('set and get', () => {
    it('should set and get values', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
      expect(m.get(3)).toBe('three')
    })

    it('should return undefined for missing key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.get(1)).toBeUndefined()
    })

    it('should update existing key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'old')
      m.set(1, 'new')
      expect(m.get(1)).toBe('new')
      expect(m.size).toBe(1)
    })

    it('should handle string keys with default comparator', () => {
      const m = new ScapegoatTreeMap<string, number>()
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      expect(m.get('a')).toBe(1)
      expect(m.get('c')).toBe(3)
      expect(m.has('b')).toBe(true)
    })

    it('should handle many insertions', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 100; i++) {
        m.set(i, i * 10)
      }
      expect(m.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(m.get(i)).toBe(i * 10)
      }
    })

    it('should handle reverse order insertion', () => {
      const m = new ScapegoatTreeMap<number, string>()
      for (let i = 100; i >= 0; i--) {
        m.set(i, `v${i}`)
      }
      expect(m.size).toBe(101)
      expect(m.get(0)).toBe('v0')
      expect(m.get(100)).toBe('v100')
    })

    it('should handle negative keys', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(-3, 'neg3')
      m.set(0, 'zero')
      m.set(5, 'pos5')
      expect(m.get(-3)).toBe('neg3')
      expect(m.get(0)).toBe('zero')
      expect(m.get(5)).toBe('pos5')
    })

    it('should handle inserting the same key multiple times', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(1, 'b')
      m.set(1, 'c')
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe('c')
    })

    it('should handle single element', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(42, 'answer')
      expect(m.size).toBe(1)
      expect(m.get(42)).toBe('answer')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'one')
      expect(m.has(1)).toBe(true)
    })

    it('should return false for missing key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.has(1)).toBe(false)
    })

    it('should return false after delete', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'one')
      m.delete(1)
      expect(m.has(1)).toBe(false)
    })

    it('should return false on empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.has(999)).toBe(false)
    })

    it('should find keys in large tree', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 50; i++) m.set(i, i)
      expect(m.has(0)).toBe(true)
      expect(m.has(49)).toBe(true)
      expect(m.has(25)).toBe(true)
      expect(m.has(50)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.delete(1)).toBe(true)
      expect(m.size).toBe(1)
      expect(m.has(1)).toBe(false)
    })

    it('should return false for missing key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.delete(1)).toBe(false)
    })

    it('should handle deleting all entries', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(2)
      m.delete(1)
      m.delete(3)
      expect(m.isEmpty()).toBe(true)
    })

    it('should maintain order after deletions', () => {
      const m = new ScapegoatTreeMap<number, string>()
      for (let i = 0; i < 20; i++) m.set(i, `v${i}`)
      m.delete(5)
      m.delete(10)
      m.delete(15)
      expect(m.size).toBe(17)
      const k = m.keys()
      for (let i = 1; i < k.length; i++) {
        expect(k[i]! > k[i - 1]!).toBe(true)
      }
    })

    it('should handle deleting root', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(2, 'root')
      m.set(1, 'left')
      m.set(3, 'right')
      m.delete(2)
      expect(m.size).toBe(2)
      expect(m.has(1)).toBe(true)
      expect(m.has(3)).toBe(true)
      expect(m.has(2)).toBe(false)
    })

    it('should handle deleting leaf', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(2, 'root')
      m.set(1, 'leaf')
      m.delete(1)
      expect(m.size).toBe(1)
      expect(m.get(2)).toBe('root')
    })

    it('should handle deleting only element', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'only')
      m.delete(1)
      expect(m.isEmpty()).toBe(true)
      expect(m.size).toBe(0)
    })

    it('should maintain balance after many deletions', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 100; i++) m.set(i, i)
      for (let i = 0; i < 50; i++) m.delete(i)
      assertBalanced(m)
      expect(m.size).toBe(50)
    })

    it('should handle delete from empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.delete(1)).toBe(false)
      expect(m.size).toBe(0)
    })

    it('should handle delete with two-child node', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      m.set(7, 'seven')
      m.set(6, 'six')
      m.set(8, 'eight')
      m.delete(5)
      expect(m.size).toBe(4)
      expect(m.has(3)).toBe(true)
      expect(m.has(6)).toBe(true)
      expect(m.has(7)).toBe(true)
      expect(m.has(8)).toBe(true)
    })
  })

  describe('min and max', () => {
    it('should return min entry', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      m.set(7, 'seven')
      expect(m.min()).toEqual([3, 'three'])
    })

    it('should return max entry', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      m.set(7, 'seven')
      expect(m.max()).toEqual([7, 'seven'])
    })

    it('should return undefined for empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.min()).toBeUndefined()
      expect(m.max()).toBeUndefined()
    })

    it('should update min after deletion', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(1)
      expect(m.min()).toEqual([2, 'b'])
    })

    it('should update max after deletion', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(3)
      expect(m.max()).toEqual([2, 'b'])
    })

    it('should return single element as both min and max', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(42, 'answer')
      expect(m.min()).toEqual([42, 'answer'])
      expect(m.max()).toEqual([42, 'answer'])
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.clear()
      expect(m.isEmpty()).toBe(true)
      expect(m.size).toBe(0)
    })

    it('should allow reuse after clear', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.clear()
      m.set(2, 'b')
      expect(m.size).toBe(1)
      expect(m.get(2)).toBe('b')
    })

    it('should clear empty map without error', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.clear()
      expect(m.isEmpty()).toBe(true)
    })

    it('should reset maxSize after clear', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.clear()
      expect(m.stats().maxSize).toBe(0)
    })
  })

  describe('forEach', () => {
    it('should iterate all entries in order', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      const result: [number, string][] = []
      m.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('should not iterate empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      let count = 0
      m.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should iterate single element', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      const result: [number, string][] = []
      m.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([[1, 'a']])
    })
  })

  describe('keys, values, entries', () => {
    it('should return sorted keys', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should return values in key order', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.values()).toEqual(['a', 'b', 'c'])
    })

    it('should return entries in key order', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.entries()).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('should return empty arrays for empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.keys()).toEqual([])
      expect(m.values()).toEqual([])
      expect(m.entries()).toEqual([])
    })
  })

  describe('iterator', () => {
    it('should iterate in order', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      const result = [...m]
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('should iterate empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      const result = [...m]
      expect(result).toEqual([])
    })

    it('should work with for of', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      const keys: number[] = []
      for (const [k] of m) {
        keys.push(k)
      }
      expect(keys).toEqual([1, 2])
    })

    it('should work with destructuring', () => {
      const m = new ScapegoatTreeMap<string, number>()
      m.set('x', 1)
      m.set('y', 2)
      const keys: string[] = []
      const vals: number[] = []
      for (const [k, v] of m) {
        keys.push(k)
        vals.push(v)
      }
      expect(keys).toEqual(['x', 'y'])
      expect(vals).toEqual([1, 2])
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      const c = m.clone()
      expect(c.size).toBe(2)
      expect(c.get(1)).toBe('a')
      c.set(3, 'c')
      expect(m.size).toBe(2)
      expect(c.size).toBe(3)
    })

    it('should clone empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      const c = m.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('should preserve comparator', () => {
      const m = new ScapegoatTreeMap<number, string>({
        compare: (a, b) => b - a,
      })
      m.set(1, 'a')
      m.set(2, 'b')
      const c = m.clone()
      c.set(3, 'c')
      expect(c.keys()).toEqual([3, 2, 1])
    })

    it('should not affect original when modifying clone', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      const c = m.clone()
      c.delete(2)
      c.set(4, 'd')
      expect(m.size).toBe(3)
      expect(m.has(2)).toBe(true)
      expect(m.has(4)).toBe(false)
      expect(c.size).toBe(3)
      expect(c.has(2)).toBe(false)
      expect(c.has(4)).toBe(true)
    })

    it('should not affect clone when modifying original', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      const c = m.clone()
      m.delete(1)
      expect(c.has(1)).toBe(true)
      expect(c.size).toBe(2)
    })
  })

  describe('lowerBound', () => {
    it('should find exact key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.lowerBound(3)).toEqual([3, 'c'])
    })

    it('should find next greater key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.lowerBound(2)).toEqual([3, 'c'])
    })

    it('should return undefined if all keys are smaller', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.lowerBound(5)).toBeUndefined()
    })

    it('should return undefined for empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.lowerBound(1)).toBeUndefined()
    })

    it('should return smallest key when searching below min', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(1)).toEqual([5, 'e'])
    })

    it('should find exact min key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(5)).toEqual([5, 'e'])
    })
  })

  describe('upperBound', () => {
    it('should find next greater key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.upperBound(3)).toEqual([5, 'e'])
    })

    it('should find next key even if exact match exists', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      expect(m.upperBound(1)).toEqual([5, 'e'])
    })

    it('should return undefined if no greater key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.upperBound(5)).toBeUndefined()
    })

    it('should return undefined for empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.upperBound(1)).toBeUndefined()
    })

    it('should find strictly greater than max', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      expect(m.upperBound(5)).toBeUndefined()
    })
  })

  describe('lowerBound and upperBound together', () => {
    it('should correctly bound around a gap', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(3)).toEqual([5, 'e'])
      expect(m.upperBound(3)).toEqual([5, 'e'])
    })

    it('should handle boundary correctly', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.lowerBound(5)).toEqual([5, 'e'])
      expect(m.upperBound(5)).toEqual([10, 'j'])
    })
  })

  describe('range', () => {
    it('should return entries in range', () => {
      const m = new ScapegoatTreeMap<number, string>()
      for (let i = 0; i < 10; i++) m.set(i, `v${i}`)
      const r = m.range(3, 7)
      expect(r).toEqual([
        [3, 'v3'],
        [4, 'v4'],
        [5, 'v5'],
        [6, 'v6'],
        [7, 'v7'],
      ])
    })

    it('should return empty for no matches', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(10, 'b')
      expect(m.range(3, 5)).toEqual([])
    })

    it('should handle full range', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.range(1, 3)).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('should return empty for inverted range', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.range(5, 1)).toEqual([])
    })

    it('should handle single element range', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.range(2, 2)).toEqual([[2, 'b']])
    })

    it('should handle range on empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.range(1, 5)).toEqual([])
    })

    it('should handle range at boundaries', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.range(0, 11)).toEqual([
        [1, 'a'],
        [5, 'e'],
        [10, 'j'],
      ])
    })

    it('should handle range that partially overlaps', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      m.set(10, 'j')
      expect(m.range(3, 7)).toEqual([[5, 'e']])
    })

    it('should handle range outside tree keys', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(5, 'e')
      m.set(10, 'j')
      m.set(15, 'o')
      expect(m.range(0, 4)).toEqual([])
      expect(m.range(16, 20)).toEqual([])
    })

    it('should handle range covering all keys', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(5, 'e')
      m.set(10, 'j')
      m.set(15, 'o')
      expect(m.range(0, 20)).toEqual([
        [5, 'e'],
        [10, 'j'],
        [15, 'o'],
      ])
    })
  })

  describe('getHeight', () => {
    it('should return 0 for empty tree', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.getHeight()).toBe(0)
    })

    it('should return 1 for single node', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      expect(m.getHeight()).toBe(1)
    })

    it('should increase height with insertions', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.getHeight()).toBeGreaterThanOrEqual(1)
      m.set(3, 'c')
      expect(m.getHeight()).toBeGreaterThanOrEqual(2)
    })

    it('should maintain O(log n) height', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 1000; i++) m.set(i, i)
      const h = m.getHeight()
      expect(h).toBeLessThanOrEqual(Math.ceil(3 * Math.log2(1001)))
    })

    it('should update height after deletions', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(3)
      expect(m.getHeight()).toBeGreaterThanOrEqual(1)
      m.delete(2)
      expect(m.getHeight()).toBe(1)
    })
  })

  describe('stats', () => {
    it('should return stats for empty map', () => {
      const m = new ScapegoatTreeMap<number, string>()
      const s = m.stats()
      expect(s.size).toBe(0)
      expect(s.height).toBe(0)
      expect(s.alpha).toBe(0.667)
      expect(s.maxSize).toBe(0)
      expect(s.rebalanceCount).toBe(0)
      expect(s.rebuildCount).toBe(0)
    })

    it('should return stats after insertions', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      const s = m.stats()
      expect(s.size).toBe(3)
      expect(s.height).toBeGreaterThan(0)
      expect(s.maxSize).toBe(3)
    })

    it('should track rebalanceCount', () => {
      const m = new ScapegoatTreeMap<number, number>({ alpha: 0.5 })
      for (let i = 0; i < 100; i++) m.set(i, i)
      const s = m.stats()
      expect(s.rebalanceCount).toBeGreaterThan(0)
    })

    it('should track rebuildCount after deletions', () => {
      const m = new ScapegoatTreeMap<number, number>({ alpha: 0.7 })
      for (let i = 0; i < 100; i++) m.set(i, i)
      const sBefore = m.stats()
      for (let i = 0; i < 70; i++) m.delete(i)
      const sAfter = m.stats()
      if (sAfter.size < sAfter.alpha * sBefore.maxSize) {
        expect(sAfter.rebuildCount).toBeGreaterThan(0)
      }
    })

    it('should track maxSize correctly', () => {
      const m = new ScapegoatTreeMap<number, string>()
      for (let i = 0; i < 50; i++) m.set(i, `v${i}`)
      expect(m.stats().maxSize).toBe(50)
    })

    it('should reset maxSize after full rebuild from delete', () => {
      const m = new ScapegoatTreeMap<number, number>({ alpha: 0.6 })
      for (let i = 0; i < 100; i++) m.set(i, i)
      expect(m.stats().maxSize).toBe(100)
      for (let i = 0; i < 42; i++) m.delete(i)
      expect(m.stats().rebuildCount).toBeGreaterThan(0)
      expect(m.stats().maxSize).toBeLessThan(100)
    })
  })

  describe('from factory', () => {
    it('should create map from entries', () => {
      const m = ScapegoatTreeMap.from([
        [3, 'c'],
        [1, 'a'],
        [2, 'b'],
      ])
      expect(m.size).toBe(3)
      expect(m.get(1)).toBe('a')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should handle empty entries', () => {
      const m = ScapegoatTreeMap.from<number, string>([])
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const m = ScapegoatTreeMap.from(
        [
          [1, 'a'],
          [2, 'b'],
        ],
        { compare: (a, b) => b - a },
      )
      expect(m.keys()).toEqual([2, 1])
    })

    it('should accept custom alpha', () => {
      const m = ScapegoatTreeMap.from(
        [
          [1, 'a'],
          [2, 'b'],
        ],
        { alpha: 0.5 },
      )
      expect(m.stats().alpha).toBe(0.5)
    })

    it('should handle duplicate keys in entries', () => {
      const m = ScapegoatTreeMap.from([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
      ])
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe('c')
    })

    it('should handle large number of entries', () => {
      const entries: [number, string][] = []
      for (let i = 0; i < 200; i++) entries.push([i, `v${i}`])
      const m = ScapegoatTreeMap.from(entries)
      expect(m.size).toBe(200)
      assertBalanced(m)
    })

    it('should handle reverse sorted entries', () => {
      const entries: [number, string][] = []
      for (let i = 200; i >= 0; i--) entries.push([i, `v${i}`])
      const m = ScapegoatTreeMap.from(entries)
      expect(m.size).toBe(201)
      assertBalanced(m)
      expect(m.keys()[0]).toBe(0)
      expect(m.keys()[200]).toBe(200)
    })

    it('should accept both compare and alpha in options', () => {
      const m = ScapegoatTreeMap.from(
        [
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ],
        { compare: (a, b) => b - a, alpha: 0.75 },
      )
      expect(m.stats().alpha).toBe(0.75)
      expect(m.keys()).toEqual([3, 2, 1])
    })
  })

  describe('scapegoat rebalancing', () => {
    it('should maintain sorted order after rebalancing', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'three')
      m.set(2, 'two')
      m.set(1, 'one')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should handle ascending insertions', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should handle mixed insertion order', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'three')
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should balance complex descending scenario', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 10; i >= 1; i--) m.set(i, i)
      assertBalanced(m)
      expect(m.size).toBe(10)
    })

    it('should balance complex ascending scenario', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 1; i <= 10; i++) m.set(i, i)
      assertBalanced(m)
      expect(m.size).toBe(10)
    })

    it('should rebalance after deletion', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'c')
      m.set(2, 'b')
      m.set(4, 'd')
      m.set(1, 'a')
      m.delete(4)
      assertBalanced(m)
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should handle zig-zag insertion pattern', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 50; i++) {
        m.set(i, i)
        m.set(99 - i, 99 - i)
      }
      assertBalanced(m)
      expect(m.size).toBe(100)
    })
  })

  describe('stress tests', () => {
    it('should handle sequential insertions and deletions', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 200; i++) m.set(i, i)
      for (let i = 0; i < 200; i += 2) m.delete(i)
      expect(m.size).toBe(100)
      for (let i = 1; i < 200; i += 2) {
        expect(m.get(i)).toBe(i)
      }
      assertBalanced(m)
    })

    it('should handle random operations', () => {
      const m = new ScapegoatTreeMap<number, number>()
      const reference = new Map<number, number>()
      for (let i = 0; i < 300; i++) {
        const key = Math.floor(Math.random() * 100)
        const op = Math.random()
        if (op < 0.6) {
          m.set(key, key * 2)
          reference.set(key, key * 2)
        } else {
          m.delete(key)
          reference.delete(key)
        }
      }
      expect(m.size).toBe(reference.size)
      for (const [k, v] of reference) {
        expect(m.get(k)).toBe(v)
      }
      assertBalanced(m)
    })

    it('should handle 500+ insertions maintaining balance', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 500; i++) {
        m.set(i, i * 3)
      }
      expect(m.size).toBe(500)
      assertBalanced(m)
      const h = m.getHeight()
      expect(h).toBeLessThanOrEqual(Math.ceil(3 * Math.log2(501)))
      for (let i = 0; i < 500; i++) {
        expect(m.get(i)).toBe(i * 3)
      }
    })

    it('should handle alternating insertions and deletions', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 100; i++) {
        m.set(i, i)
        if (i % 3 === 0 && i > 0) {
          m.delete(i - 1)
        }
      }
      assertBalanced(m)
    })

    it('should handle large scale insert then delete all', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 300; i++) m.set(i, i)
      for (let i = 0; i < 300; i++) m.delete(i)
      expect(m.isEmpty()).toBe(true)
      expect(m.getHeight()).toBe(0)
    })

    it('should handle reverse deletion', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 200; i++) m.set(i, i)
      for (let i = 199; i >= 0; i--) m.delete(i)
      expect(m.isEmpty()).toBe(true)
    })

    it('should handle interleaved operations with verification', () => {
      const m = new ScapegoatTreeMap<number, string>()
      for (let i = 0; i < 50; i++) m.set(i, `v${i}`)
      for (let i = 0; i < 50; i += 2) m.delete(i)
      expect(m.size).toBe(25)
      assertBalanced(m)
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) {
          expect(m.has(i)).toBe(false)
        } else {
          expect(m.has(i)).toBe(true)
          expect(m.get(i)).toBe(`v${i}`)
        }
      }
      m.set(0, 'new0')
      m.set(2, 'new2')
      expect(m.size).toBe(27)
      assertBalanced(m)
    })

    it('should handle alternating min max deletion', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 100; i++) m.set(i, i)
      for (let i = 0; i < 50; i++) {
        m.delete(i)
        m.delete(99 - i)
      }
      expect(m.isEmpty()).toBe(true)
    })

    it('should handle mid-point deletion pattern', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 100; i++) m.set(i, i)
      for (let i = 25; i < 75; i++) m.delete(i)
      assertBalanced(m)
      expect(m.size).toBe(50)
    })
  })

  describe('size property', () => {
    it('should track size correctly through operations', () => {
      const m = new ScapegoatTreeMap<number, string>()
      expect(m.size).toBe(0)
      m.set(1, 'a')
      expect(m.size).toBe(1)
      m.set(2, 'b')
      expect(m.size).toBe(2)
      m.set(1, 'updated')
      expect(m.size).toBe(2)
      m.delete(1)
      expect(m.size).toBe(1)
      m.delete(999)
      expect(m.size).toBe(1)
      m.clear()
      expect(m.size).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined values', () => {
      const m = new ScapegoatTreeMap<number, string | undefined>()
      m.set(1, undefined)
      expect(m.get(1)).toBeUndefined()
      expect(m.has(1)).toBe(true)
    })

    it('should handle null values', () => {
      const m = new ScapegoatTreeMap<number, string | null>()
      m.set(1, null)
      expect(m.get(1)).toBeNull()
      expect(m.has(1)).toBe(true)
    })

    it('should handle zero as key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(0, 'zero')
      expect(m.get(0)).toBe('zero')
      expect(m.has(0)).toBe(true)
    })

    it('should handle empty string as key', () => {
      const m = new ScapegoatTreeMap<string, number>()
      m.set('', 0)
      expect(m.get('')).toBe(0)
      expect(m.has('')).toBe(true)
    })

    it('should handle boolean-like keys', () => {
      const m = new ScapegoatTreeMap<number, boolean>()
      m.set(0, false)
      m.set(1, true)
      expect(m.get(0)).toBe(false)
      expect(m.get(1)).toBe(true)
    })

    it('should handle object values', () => {
      const m = new ScapegoatTreeMap<number, { name: string }>()
      m.set(1, { name: 'test' })
      expect(m.get(1)?.name).toBe('test')
    })

    it('should handle array values', () => {
      const m = new ScapegoatTreeMap<number, number[]>()
      m.set(1, [1, 2, 3])
      expect(m.get(1)).toEqual([1, 2, 3])
    })

    it('should handle many duplicate updates', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 100; i++) m.set(1, i)
      expect(m.size).toBe(1)
      expect(m.get(1)).toBe(99)
    })
  })

  describe('ordering verification', () => {
    it('should maintain in-order traversal after mixed ops', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 30; i++) m.set(i, i)
      for (let i = 10; i < 20; i++) m.delete(i)
      for (let i = 10; i < 20; i++) m.set(i, i * 10)
      const keys = m.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('should maintain BST property after all operations', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 100; i++) {
        m.set(Math.floor(Math.random() * 200), i)
      }
      const keys = m.keys()
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! >= keys[i - 1]!).toBe(true)
      }
    })
  })

  describe('default comparator', () => {
    it('should work with number keys by default', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should work with string keys by default', () => {
      const m = new ScapegoatTreeMap<string, number>()
      m.set('cherry', 3)
      m.set('apple', 1)
      m.set('banana', 2)
      expect(m.keys()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('mixed operations', () => {
    it('should handle set-delete-set cycle', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.delete(1)
      m.set(1, 'b')
      expect(m.get(1)).toBe('b')
      expect(m.size).toBe(1)
    })

    it('should handle large number of operations', () => {
      const m = new ScapegoatTreeMap<number, number>()
      const ref = new Map<number, number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 100; i++) {
          const key = (round * 100 + i) % 50
          m.set(key, round * 100 + i)
          ref.set(key, round * 100 + i)
        }
      }
      expect(m.size).toBe(ref.size)
      for (const [k, v] of ref) {
        expect(m.get(k)).toBe(v)
      }
      assertBalanced(m)
    })
  })

  describe('forEach callback signature', () => {
    it('should pass value first then key', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      const results: string[] = []
      m.forEach((value, key) => {
        results.push(`${key}:${value}`)
      })
      expect(results).toEqual(['1:one', '2:two'])
    })
  })

  describe('entries format', () => {
    it('should return [K, V] tuples', () => {
      const m = new ScapegoatTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      const e = m.entries()
      expect(e[0]).toEqual([1, 'a'])
      expect(e[1]).toEqual([2, 'b'])
    })
  })

  describe('large maps', () => {
    it('should handle 10000 sequential insertions', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 10000; i++) m.set(i, i * 2)
      expect(m.size).toBe(10000)
      assertBalanced(m)
      for (let i = 0; i < 10000; i++) {
        expect(m.get(i)).toBe(i * 2)
      }
    })

    it('should handle 10000 reverse insertions', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 9999; i >= 0; i--) m.set(i, i * 2)
      expect(m.size).toBe(10000)
      assertBalanced(m)
      expect(m.get(0)).toBe(0)
      expect(m.get(9999)).toBe(19998)
    })

    it('should handle 10000 insertions then 5000 deletions', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 10000; i++) m.set(i, i)
      for (let i = 0; i < 5000; i++) m.delete(i)
      expect(m.size).toBe(5000)
      assertBalanced(m)
      expect(m.get(5000)).toBe(5000)
      expect(m.get(9999)).toBe(9999)
      expect(m.has(0)).toBe(false)
    })
  })

  describe('balance verification', () => {
    it('should maintain balance with alpha 0.5', () => {
      const m = new ScapegoatTreeMap<number, number>({ alpha: 0.5 })
      for (let i = 0; i < 200; i++) m.set(i, i)
      assertBalanced(m)
      expect(m.size).toBe(200)
    })

    it('should maintain balance with alpha 0.75', () => {
      const m = new ScapegoatTreeMap<number, number>({ alpha: 0.75 })
      for (let i = 0; i < 200; i++) m.set(i, i)
      assertBalanced(m)
      expect(m.size).toBe(200)
    })

    it('should trigger global rebuild when size drops below alpha * maxSize', () => {
      const m = new ScapegoatTreeMap<number, number>({ alpha: 0.6 })
      for (let i = 0; i < 100; i++) m.set(i, i)
      expect(m.stats().maxSize).toBe(100)
      for (let i = 0; i < 50; i++) m.delete(i)
      expect(m.stats().rebuildCount).toBeGreaterThan(0)
    })

    it('should produce O(log n) height for sequential inserts', () => {
      const m = new ScapegoatTreeMap<number, number>()
      for (let i = 0; i < 200; i++) m.set(i, i)
      const h = m.getHeight()
      expect(h).toBeLessThan(200)
      expect(h).toBeLessThanOrEqual(Math.ceil(3 * Math.log2(201)))
    })

    it('should produce O(log n) height for random inserts', () => {
      const m = new ScapegoatTreeMap<number, number>()
      const keys = Array.from({ length: 500 }, (_, i) => i)
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = keys[i]!
        keys[i] = keys[j]!
        keys[j] = temp
      }
      for (const k of keys) m.set(k, k)
      const h = m.getHeight()
      expect(h).toBeLessThanOrEqual(Math.ceil(3 * Math.log2(501)))
    })

    it('should handle 1000 random operations with reference', () => {
      const m = new ScapegoatTreeMap<number, number>()
      const ref = new Map<number, number>()
      for (let i = 0; i < 1000; i++) {
        const key = Math.floor(Math.random() * 200)
        const op = Math.random()
        if (op < 0.5) {
          m.set(key, i)
          ref.set(key, i)
        } else {
          m.delete(key)
          ref.delete(key)
        }
      }
      expect(m.size).toBe(ref.size)
      for (const [k, v] of ref) {
        expect(m.get(k)).toBe(v)
      }
      assertBalanced(m)
    })
  })
})
