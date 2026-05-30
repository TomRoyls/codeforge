import { describe, it, expect } from 'vitest'
import { increment, append } from '../src/utils/map-helpers.js'

describe('map-helpers', () => {
  describe('increment', () => {
    it('initializes missing key to 1', () => {
      const map = new Map<string, number>()
      increment(map, 'a')
      expect(map.get('a')).toBe(1)
    })

    it('increments existing key by default delta', () => {
      const map = new Map<string, number>([['a', 5]])
      increment(map, 'a')
      expect(map.get('a')).toBe(6)
    })

    it('increments by custom delta', () => {
      const map = new Map<string, number>([['a', 2]])
      increment(map, 'a', 10)
      expect(map.get('a')).toBe(12)
    })

    it('handles negative delta', () => {
      const map = new Map<string, number>([['a', 5]])
      increment(map, 'a', -3)
      expect(map.get('a')).toBe(2)
    })

    it('works with number keys', () => {
      const map = new Map<number, number>()
      increment(map, 42)
      increment(map, 42)
      expect(map.get(42)).toBe(2)
    })

    it('handles zero delta', () => {
      const map = new Map<string, number>([['a', 5]])
      increment(map, 'a', 0)
      expect(map.get('a')).toBe(5)
    })
  })

  describe('append', () => {
    it('creates new array for missing key', () => {
      const map = new Map<string, number[]>()
      append(map, 'a', 1)
      expect(map.get('a')).toEqual([1])
    })

    it('appends to existing array', () => {
      const map = new Map<string, number[]>([['a', [1, 2]]])
      append(map, 'a', 3)
      expect(map.get('a')).toEqual([1, 2, 3])
    })

    it('handles multiple keys independently', () => {
      const map = new Map<string, number[]>()
      append(map, 'a', 1)
      append(map, 'b', 2)
      append(map, 'a', 3)
      expect(map.get('a')).toEqual([1, 3])
      expect(map.get('b')).toEqual([2])
    })

    it('works with object values', () => {
      const map = new Map<string, { x: number }[]>()
      append(map, 'a', { x: 1 })
      append(map, 'a', { x: 2 })
      expect(map.get('a')).toEqual([{ x: 1 }, { x: 2 }])
    })
  })
})
