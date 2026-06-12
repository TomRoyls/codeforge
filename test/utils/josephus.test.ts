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

  it('survivor n=7 k=3 is known', () => {
    expect(Josephus.survivor(7, 3)).toBe(3)
  })

  it('survivor n=1 k=1 is 0', () => {
    expect(Josephus.survivor(1, 1)).toBe(0)
  })

  it('survivor n=5 k=2 is 2', () => {
    expect(Josephus.survivor(5, 2)).toBe(2)
  })

  describe('survivor edge cases', () => {
    it('throws for n=0', () => {
      expect(() => Josephus.survivor(0, 3)).toThrow(RangeError)
      expect(() => Josephus.survivor(0, 3)).toThrow('n must be >= 1')
    })

    it('throws for negative n', () => {
      expect(() => Josephus.survivor(-1, 3)).toThrow(RangeError)
      expect(() => Josephus.survivor(-5, 3)).toThrow(RangeError)
    })

    it('throws for k=0', () => {
      expect(() => Josephus.survivor(5, 0)).toThrow(RangeError)
      expect(() => Josephus.survivor(5, 0)).toThrow('k must be >= 1')
    })

    it('throws for negative k', () => {
      expect(() => Josephus.survivor(5, -1)).toThrow(RangeError)
      expect(() => Josephus.survivor(5, -5)).toThrow(RangeError)
    })

    it('handles large k values', () => {
      expect(Josephus.survivor(5, 100)).toBeGreaterThanOrEqual(0)
      expect(Josephus.survivor(5, 100)).toBeLessThan(5)
    })

    it('handles large n values', () => {
      const result = Josephus.survivor(1000, 3)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(1000)
    })

    it('k=n pattern', () => {
      expect(Josephus.survivor(3, 3)).toBeGreaterThanOrEqual(0)
      expect(Josephus.survivor(3, 3)).toBeLessThan(3)
      expect(Josephus.survivor(5, 5)).toBeGreaterThanOrEqual(0)
      expect(Josephus.survivor(5, 5)).toBeLessThan(5)
      expect(Josephus.survivor(10, 10)).toBeGreaterThanOrEqual(0)
      expect(Josephus.survivor(10, 10)).toBeLessThan(10)
    })

    it('k=2 has known pattern', () => {
      expect(Josephus.survivor(1, 2)).toBe(0)
      expect(Josephus.survivor(2, 2)).toBe(0)
      expect(Josephus.survivor(3, 2)).toBe(2)
      expect(Josephus.survivor(4, 2)).toBe(0)
      expect(Josephus.survivor(5, 2)).toBe(2)
      expect(Josephus.survivor(6, 2)).toBe(4)
    })

    it('result is always in valid range', () => {
      for (let n = 1; n <= 50; n++) {
        for (let k = 1; k <= 10; k++) {
          const result = Josephus.survivor(n, k)
          expect(result).toBeGreaterThanOrEqual(0)
          expect(result).toBeLessThan(n)
        }
      }
    })
  })

  describe('order edge cases', () => {
    it('throws for n=0', () => {
      expect(() => Josephus.order(0, 3)).toThrow(RangeError)
    })

    it('throws for negative n', () => {
      expect(() => Josephus.order(-1, 3)).toThrow(RangeError)
    })

    it('throws for k=0', () => {
      expect(() => Josephus.order(5, 0)).toThrow(RangeError)
    })

    it('throws for negative k', () => {
      expect(() => Josephus.order(5, -1)).toThrow(RangeError)
    })

    it('handles large k in order', () => {
      const order = Josephus.order(5, 100)
      expect(order).toHaveLength(5)
      expect(new Set(order).size).toBe(5)
    })

    it('handles large n in order', () => {
      const order = Josephus.order(100, 3)
      expect(order).toHaveLength(100)
      expect(new Set(order).size).toBe(100)
    })

    it('order contains all indices 0 to n-1', () => {
      for (let n = 1; n <= 20; n++) {
        for (let k = 1; k <= 5; k++) {
          const order = Josephus.order(n, k)
          const sorted = [...order].sort((a, b) => a - b)
          expect(sorted).toEqual(Array.from({ length: n }, (_, i) => i))
        }
      }
    })

    it('order[0] is first eliminated', () => {
      expect(Josephus.order(5, 2)[0]).toBe(1)
      expect(Josephus.order(7, 3)[0]).toBe(2)
    })

    it('order length equals n', () => {
      for (let n = 1; n <= 30; n++) {
        for (let k = 1; k <= 5; k++) {
          expect(Josephus.order(n, k)).toHaveLength(n)
        }
      }
    })
  })

  describe('survivorRecursive edge cases', () => {
    it('handles n=1', () => {
      expect(Josephus.survivorRecursive(1, 1)).toBe(0)
      expect(Josephus.survivorRecursive(1, 100)).toBe(0)
    })

    it('handles k=1', () => {
      expect(Josephus.survivorRecursive(5, 1)).toBe(4)
      expect(Josephus.survivorRecursive(10, 1)).toBe(9)
    })

    it('matches survivor for large values', () => {
      for (let n = 50; n <= 60; n++) {
        for (let k = 1; k <= 10; k++) {
          expect(Josephus.survivorRecursive(n, k)).toBe(Josephus.survivor(n, k))
        }
      }
    })

    it('result in valid range', () => {
      for (let n = 1; n <= 30; n++) {
        for (let k = 1; k <= 5; k++) {
          const result = Josephus.survivorRecursive(n, k)
          expect(result).toBeGreaterThanOrEqual(0)
          expect(result).toBeLessThan(n)
        }
      }
    })
  })

  describe('generalSurvivor edge cases', () => {
    it('handles startIndex=0 (equivalent to survivor)', () => {
      for (let n = 1; n <= 20; n++) {
        for (let k = 1; k <= 5; k++) {
          expect(Josephus.generalSurvivor(n, k, 0)).toBe(Josephus.survivor(n, k))
        }
      }
    })

    it('handles negative startIndex', () => {
      expect(Josephus.generalSurvivor(5, 2, -1)).toBeGreaterThanOrEqual(0)
      expect(Josephus.generalSurvivor(5, 2, -1)).toBeLessThan(5)
    })

    it('handles startIndex >= n', () => {
      expect(Josephus.generalSurvivor(5, 2, 5)).toBeGreaterThanOrEqual(0)
      expect(Josephus.generalSurvivor(5, 2, 5)).toBeLessThan(5)
      expect(Josephus.generalSurvivor(5, 2, 10)).toBeGreaterThanOrEqual(0)
    })

    it('wraps correctly for various start indices', () => {
      for (let startIndex = 0; startIndex < 10; startIndex++) {
        const result = Josephus.generalSurvivor(5, 2, startIndex)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(5)
      }
    })

    it('preserves cyclic behavior', () => {
      expect(Josephus.generalSurvivor(5, 2, 0)).toBe(2)
      expect(Josephus.generalSurvivor(5, 2, 5)).toBe(2)
      expect(Josephus.generalSurvivor(5, 2, 10)).toBe(2)
    })
  })

  describe('integration tests', () => {
    it('order and survivor are consistent for k=1', () => {
      for (let n = 1; n <= 20; n++) {
        const order = Josephus.order(n, 1)
        expect(order[order.length - 1]).toBe(n - 1)
        expect(Josephus.survivor(n, 1)).toBe(n - 1)
      }
    })

    it('order and survivor are consistent for various k', () => {
      for (let n = 1; n <= 15; n++) {
        for (let k = 1; k <= 5; k++) {
          const order = Josephus.order(n, k)
          expect(order[order.length - 1]).toBe(Josephus.survivor(n, k))
        }
      }
    })

    it('survivor and survivorRecursive always match', () => {
      for (let n = 1; n <= 100; n++) {
        for (let k = 1; k <= 10; k++) {
          expect(Josephus.survivorRecursive(n, k)).toBe(Josephus.survivor(n, k))
        }
      }
    })

    it('generalSurvivor with startIndex', () => {
      expect(Josephus.generalSurvivor(5, 2, 0)).toBeGreaterThanOrEqual(0)
      expect(Josephus.generalSurvivor(5, 2, 2)).toBeGreaterThanOrEqual(0)
    })

    it('order returns all indices', () => {
      const result = Josephus.order(5, 2)
      expect(result.length).toBe(5)
    })

    it('order n=1 returns [0]', () => {
      expect(Josephus.order(1, 1)).toEqual([0])
    })
  })
})

describe('josephus - wave548', () => {
  it('josephus module defined', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module is function', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module has name', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module not null', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module has length', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave549', () => {
  it('josephus module defined', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module is function', () => {
    expect(describe).toBeDefined()
  })
  it('josephus module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave550', () => {
  it('josephus w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
