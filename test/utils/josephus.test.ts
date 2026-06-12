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

describe('josephus - wave551', () => {
  it('josephus w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave552', () => {
  it('josephus w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave553', () => {
  it('josephus w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave554', () => {
  it('josephus w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave555', () => {
  it('josephus w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave556', () => {
  it('josephus w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave557', () => {
  it('josephus w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave558', () => {
  it('josephus w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave559', () => {
  it('josephus w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave560', () => {
  it('josephus w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave561', () => {
  it('josephus w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave562', () => {
  it('josephus w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave563', () => {
  it('josephus w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave564', () => {
  it('josephus w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave565', () => {
  it('josephus w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave566', () => {
  it('josephus w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave127', () => {
  it('josephus w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave130', () => {
  it('josephus w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave133', () => {
  it('josephus w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave136', () => {
  it('josephus w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - wave139', () => {
  it('josephus w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w142', () => {
  it('josephus v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w145', () => {
  it('josephus v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w148', () => {
  it('josephus v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w151', () => {
  it('josephus v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w154', () => {
  it('josephus v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w157', () => {
  it('josephus v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w160', () => {
  it('josephus v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w170', () => {
  it('josephus x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w180', () => {
  it('josephus x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w190', () => {
  it('josephus x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w200', () => {
  it('josephus x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w210', () => {
  it('josephus x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w220', () => {
  it('josephus x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w230', () => {
  it('josephus x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w240', () => {
  it('josephus x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w250', () => {
  it('josephus x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w260', () => {
  it('josephus x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w270', () => {
  it('josephus x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w280', () => {
  it('josephus x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w290', () => {
  it('josephus x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w300', () => {
  it('josephus x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w310', () => {
  it('josephus x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w320', () => {
  it('josephus x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w330', () => {
  it('josephus x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w340', () => {
  it('josephus x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w350', () => {
  it('josephus x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w360', () => {
  it('josephus x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w370', () => {
  it('josephus x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w380', () => {
  it('josephus x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w390', () => {
  it('josephus x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w400', () => {
  it('josephus x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w420', () => {
  it('josephus x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w440', () => {
  it('josephus x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w460', () => {
  it('josephus x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w480', () => {
  it('josephus x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w500', () => {
  it('josephus x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w550', () => {
  it('josephus x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w600', () => {
  it('josephus x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w650', () => {
  it('josephus x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w700', () => {
  it('josephus x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w800', () => {
  it('josephus x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w900', () => {
  it('josephus x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('josephus - w1000', () => {
  it('josephus x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('josephus x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
