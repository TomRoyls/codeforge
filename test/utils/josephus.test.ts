import { describe, expect, it } from 'vitest'
import { Josephus } from '../../src/utils/josephus.js'

describe('Josephus', () => {
  describe('survivor', () => {
    it('handles classic case n=7 k=3', () => {
      expect(Josephus.survivor(7, 3)).toBe(3)
    })

    it('handles n=1', () => {
      expect(Josephus.survivor(1, 5)).toBe(0)
    })

    it('handles k=1 (last person)', () => {
      expect(Josephus.survivor(5, 1)).toBe(4)
    })

    it('handles k=2', () => {
      expect(Josephus.survivor(5, 2)).toBe(2)
    })

    it('handles k >= n', () => {
      expect(Josephus.survivor(3, 5)).toBe(0)
    })

    it('handles n=2', () => {
      expect(Josephus.survivor(2, 2)).toBe(0)
      expect(Josephus.survivor(2, 1)).toBe(1)
    })

    it('throws for n < 1', () => {
      expect(() => Josephus.survivor(0, 3)).toThrow(RangeError)
    })

    it('throws for k < 1', () => {
      expect(() => Josephus.survivor(5, 0)).toThrow(RangeError)
    })
  })

  describe('order', () => {
    it('returns elimination order for n=5 k=2', () => {
      const order = Josephus.order(5, 2)
      expect(order).toHaveLength(5)
      expect(new Set(order).size).toBe(5)
      expect(order[order.length - 1]).toBe(Josephus.survivor(5, 2))
    })

    it('last eliminated is the survivor', () => {
      for (let n = 1; n <= 10; n++) {
        const order = Josephus.order(n, 3)
        expect(order[order.length - 1]).toBe(Josephus.survivor(n, 3))
      }
    })

    it('handles n=1', () => {
      expect(Josephus.order(1, 3)).toEqual([0])
    })

    it('handles k=1', () => {
      expect(Josephus.order(3, 1)).toEqual([0, 1, 2])
    })

    it('all indices appear exactly once', () => {
      const order = Josephus.order(7, 4)
      const sorted = [...order].sort((a, b) => a - b)
      expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6])
    })
  })

  describe('survivorRecursive', () => {
    it('matches iterative survivor', () => {
      for (let n = 1; n <= 20; n++) {
        for (let k = 1; k <= 5; k++) {
          expect(Josephus.survivorRecursive(n, k)).toBe(Josephus.survivor(n, k))
        }
      }
    })
  })

  describe('generalSurvivor', () => {
    it('shifts survivor by start index', () => {
      expect(Josephus.generalSurvivor(7, 3, 0)).toBe(3)
      expect(Josephus.generalSurvivor(7, 3, 1)).toBe(4)
    })

    it('wraps around', () => {
      const s = Josephus.generalSurvivor(5, 2, 3)
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThan(5)
    })
  })

  describe('edge cases', () => {
    it('n=1 always returns 0', () => {
      expect(Josephus.survivor(1, 1)).toBe(0)
      expect(Josephus.survivor(1, 100)).toBe(0)
    })

    it('k=1 returns last index', () => {
      expect(Josephus.survivor(5, 1)).toBe(4)
    })

    it('order with n=1 returns [0]', () => {
      expect(Josephus.order(1, 1)).toEqual([0])
    })
  })

  it('survivor with n=5 k=2 is 2', () => {
    expect(Josephus.survivor(5, 2)).toBe(2)
  })

  it('survivor with n=1 k=any is 0', () => {
    expect(Josephus.survivor(1, 5)).toBe(0)
  })
})
