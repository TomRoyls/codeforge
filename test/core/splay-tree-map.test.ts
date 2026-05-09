import { describe, it, expect } from 'vitest'
import { SplayTreeMap } from '../../src/core/splay-tree-map/splay-tree-map.js'

describe('SplayTreeMap', () => {
  describe('constructor', () => {
    it('should create empty map', () => {
      const m = new SplayTreeMap<number, string>()
      expect(m.size).toBe(0)
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const m = new SplayTreeMap<number, string>((a, b) => b - a)
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.keys()).toEqual([3, 2, 1])
    })
  })

  describe('set and get', () => {
    it('should set and get values', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      m.set(3, 'three')
      expect(m.get(1)).toBe('one')
      expect(m.get(2)).toBe('two')
      expect(m.get(3)).toBe('three')
    })

    it('should return undefined for missing key', () => {
      const m = new SplayTreeMap<number, string>()
      expect(m.get(1)).toBeUndefined()
    })

    it('should update existing key', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'old')
      m.set(1, 'new')
      expect(m.get(1)).toBe('new')
      expect(m.size).toBe(1)
    })

    it('should handle string keys with comparator', () => {
      const m = new SplayTreeMap<string, number>((a, b) => a.localeCompare(b))
      m.set('a', 1)
      m.set('b', 2)
      m.set('c', 3)
      expect(m.get('a')).toBe(1)
      expect(m.get('c')).toBe(3)
      expect(m.has('b')).toBe(true)
    })

    it('should handle many insertions', () => {
      const m = new SplayTreeMap<number, number>()
      for (let i = 0; i < 100; i++) {
        m.set(i, i * 10)
      }
      expect(m.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(m.get(i)).toBe(i * 10)
      }
    })

    it('should handle reverse order insertion', () => {
      const m = new SplayTreeMap<number, string>()
      for (let i = 100; i >= 0; i--) {
        m.set(i, `v${i}`)
      }
      expect(m.size).toBe(101)
      expect(m.get(0)).toBe('v0')
      expect(m.get(100)).toBe('v100')
    })

    it('should handle negative keys', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(-3, 'neg3')
      m.set(0, 'zero')
      m.set(5, 'pos5')
      expect(m.get(-3)).toBe('neg3')
      expect(m.get(0)).toBe('zero')
      expect(m.get(5)).toBe('pos5')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'one')
      expect(m.has(1)).toBe(true)
    })

    it('should return false for missing key', () => {
      const m = new SplayTreeMap<number, string>()
      expect(m.has(1)).toBe(false)
    })

    it('should return false after delete', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'one')
      m.delete(1)
      expect(m.has(1)).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'one')
      m.set(2, 'two')
      expect(m.delete(1)).toBe(true)
      expect(m.size).toBe(1)
      expect(m.has(1)).toBe(false)
    })

    it('should return false for missing key', () => {
      const m = new SplayTreeMap<number, string>()
      expect(m.delete(1)).toBe(false)
    })

    it('should handle deleting all entries', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      m.delete(2)
      m.delete(1)
      m.delete(3)
      expect(m.isEmpty()).toBe(true)
    })

    it('should maintain order after deletions', () => {
      const m = new SplayTreeMap<number, string>()
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
  })

  describe('min and max', () => {
    it('should return min entry', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      m.set(7, 'seven')
      expect(m.min()).toEqual([3, 'three'])
    })

    it('should return max entry', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(5, 'five')
      m.set(3, 'three')
      m.set(7, 'seven')
      expect(m.max()).toEqual([7, 'seven'])
    })

    it('should return undefined for empty map', () => {
      const m = new SplayTreeMap<number, string>()
      expect(m.min()).toBeUndefined()
      expect(m.max()).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.clear()
      expect(m.isEmpty()).toBe(true)
      expect(m.size).toBe(0)
    })
  })

  describe('forEach', () => {
    it('should iterate all entries', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      const result: [number, string][] = []
      m.forEach((v, k) => result.push([k, v]))
      expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should not iterate empty map', () => {
      const m = new SplayTreeMap<number, string>()
      let count = 0
      m.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('keys, values, entries', () => {
    it('should return sorted keys', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should return values in key order', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.values()).toEqual(['a', 'b', 'c'])
    })

    it('should return entries in key order', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      expect(m.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })

    it('should return empty arrays for empty map', () => {
      const m = new SplayTreeMap<number, string>()
      expect(m.keys()).toEqual([])
      expect(m.values()).toEqual([])
      expect(m.entries()).toEqual([])
    })
  })

  describe('iterator', () => {
    it('should iterate in order', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(3, 'c')
      m.set(1, 'a')
      m.set(2, 'b')
      const result = [...m]
      expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      const c = m.clone()
      expect(c.size).toBe(2)
      expect(c.get(1)).toBe('a')
      c.set(3, 'c')
      expect(m.size).toBe(2)
      expect(c.size).toBe(3)
    })
  })

  describe('lowerBound', () => {
    it('should find exact key', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.lowerBound(3)).toEqual([3, 'c'])
    })

    it('should find next greater key', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.lowerBound(2)).toEqual([3, 'c'])
    })

    it('should return undefined if all keys are smaller', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.lowerBound(5)).toBeUndefined()
    })

    it('should return undefined for empty map', () => {
      const m = new SplayTreeMap<number, string>()
      expect(m.lowerBound(1)).toBeUndefined()
    })
  })

  describe('upperBound', () => {
    it('should find next greater key', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      m.set(5, 'e')
      expect(m.upperBound(3)).toEqual([5, 'e'])
    })

    it('should find next key even if exact match exists', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(5, 'e')
      expect(m.upperBound(1)).toEqual([5, 'e'])
    })

    it('should return undefined if no greater key', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(3, 'c')
      expect(m.upperBound(5)).toBeUndefined()
    })
  })

  describe('range', () => {
    it('should return entries in range', () => {
      const m = new SplayTreeMap<number, string>()
      for (let i = 0; i < 10; i++) m.set(i, `v${i}`)
      const r = m.range(3, 7)
      expect(r.length).toBeGreaterThanOrEqual(4)
      expect(r[0]).toEqual([3, 'v3'])
      expect(r.every(([k]) => k >= 3 && k <= 7)).toBe(true)
    })

    it('should return empty for no matches', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(10, 'b')
      expect(m.range(3, 5)).toEqual([])
    })

    it('should handle full range', () => {
      const m = new SplayTreeMap<number, string>()
      m.set(1, 'a')
      m.set(2, 'b')
      m.set(3, 'c')
      expect(m.range(1, 4)).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    })
  })

  describe('fromEntries', () => {
    it('should create map from entries', () => {
      const m = SplayTreeMap.fromEntries([[3, 'c'], [1, 'a'], [2, 'b']])
      expect(m.size).toBe(3)
      expect(m.get(1)).toBe('a')
      expect(m.keys()).toEqual([1, 2, 3])
    })

    it('should handle empty entries', () => {
      const m = SplayTreeMap.fromEntries<number, string>([])
      expect(m.isEmpty()).toBe(true)
    })

    it('should accept custom comparator', () => {
      const m = SplayTreeMap.fromEntries([[1, 'a'], [2, 'b']], (a, b) => b - a)
      expect(m.keys()).toEqual([2, 1])
    })
  })

  describe('stress tests', () => {
    it('should handle sequential insertions and deletions', () => {
      const m = new SplayTreeMap<number, number>()
      for (let i = 0; i < 200; i++) m.set(i, i)
      for (let i = 0; i < 200; i += 2) m.delete(i)
      expect(m.size).toBe(100)
      for (let i = 1; i < 200; i += 2) {
        expect(m.get(i)).toBe(i)
      }
    })

    it('should handle random operations', () => {
      const m = new SplayTreeMap<number, number>()
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
    })
  })
})
