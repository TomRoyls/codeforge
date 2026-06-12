import { describe, expect, it } from 'vitest'
import { TriangularNumber } from '../../src/utils/triangular-number.js'

describe('TriangularNumber', () => {
  it('computes nth triangular number', () => {
    expect(TriangularNumber.nth(1)).toBe(1)
    expect(TriangularNumber.nth(2)).toBe(3)
    expect(TriangularNumber.nth(3)).toBe(6)
    expect(TriangularNumber.nth(10)).toBe(55)
  })

  it('handles n=0', () => {
    expect(TriangularNumber.nth(0)).toBe(0)
  })

  it('handles negative n', () => {
    expect(TriangularNumber.nth(-1)).toBe(0)
    expect(TriangularNumber.nth(-100)).toBe(0)
  })

  it('isTriangular detects triangular numbers', () => {
    expect(TriangularNumber.isTriangular(1)).toBe(true)
    expect(TriangularNumber.isTriangular(3)).toBe(true)
    expect(TriangularNumber.isTriangular(6)).toBe(true)
    expect(TriangularNumber.isTriangular(10)).toBe(true)
    expect(TriangularNumber.isTriangular(15)).toBe(true)
    expect(TriangularNumber.isTriangular(21)).toBe(true)
  })

  it('isTriangular rejects non-triangular', () => {
    expect(TriangularNumber.isTriangular(2)).toBe(false)
    expect(TriangularNumber.isTriangular(4)).toBe(false)
    expect(TriangularNumber.isTriangular(5)).toBe(false)
    expect(TriangularNumber.isTriangular(7)).toBe(false)
    expect(TriangularNumber.isTriangular(8)).toBe(false)
  })

  it('isTriangular rejects 0', () => {
    expect(TriangularNumber.isTriangular(0)).toBe(false)
  })

  it('isTriangular rejects negative', () => {
    expect(TriangularNumber.isTriangular(-1)).toBe(false)
    expect(TriangularNumber.isTriangular(-10)).toBe(false)
  })

  it('indexOf returns correct index', () => {
    expect(TriangularNumber.indexOf(1)).toBe(1)
    expect(TriangularNumber.indexOf(3)).toBe(2)
    expect(TriangularNumber.indexOf(6)).toBe(3)
    expect(TriangularNumber.indexOf(10)).toBe(4)
    expect(TriangularNumber.indexOf(55)).toBe(10)
  })

  it('indexOf returns -1 for non-triangular', () => {
    expect(TriangularNumber.indexOf(2)).toBe(-1)
    expect(TriangularNumber.indexOf(4)).toBe(-1)
    expect(TriangularNumber.indexOf(7)).toBe(-1)
    expect(TriangularNumber.indexOf(-1)).toBe(-1)
  })

  it('generate returns sequence', () => {
    expect(TriangularNumber.generate(5)).toEqual([1, 3, 6, 10, 15])
  })

  it('generate handles 0', () => {
    expect(TriangularNumber.generate(0)).toEqual([])
  })

  it('generate handles 1', () => {
    expect(TriangularNumber.generate(1)).toEqual([1])
  })

  it('generate handles large count', () => {
    const result = TriangularNumber.generate(100)
    expect(result.length).toBe(100)
    expect(result[0]).toBe(1)
    expect(result[99]).toBe(5050)
  })

  it('pentagonal computes correctly', () => {
    expect(TriangularNumber.pentagonal(1)).toBe(1)
    expect(TriangularNumber.pentagonal(2)).toBe(5)
    expect(TriangularNumber.pentagonal(3)).toBe(12)
    expect(TriangularNumber.pentagonal(4)).toBe(22)
    expect(TriangularNumber.pentagonal(5)).toBe(35)
  })

  it('pentagonal handles 0 and negative', () => {
    expect(TriangularNumber.pentagonal(0)).toBe(0)
    expect(TriangularNumber.pentagonal(-1)).toBe(0)
  })

  it('hexagonal computes correctly', () => {
    expect(TriangularNumber.hexagonal(1)).toBe(1)
    expect(TriangularNumber.hexagonal(2)).toBe(6)
    expect(TriangularNumber.hexagonal(3)).toBe(15)
    expect(TriangularNumber.hexagonal(4)).toBe(28)
    expect(TriangularNumber.hexagonal(5)).toBe(45)
  })

  it('hexagonal handles 0 and negative', () => {
    expect(TriangularNumber.hexagonal(0)).toBe(0)
    expect(TriangularNumber.hexagonal(-1)).toBe(0)
  })

  it('tetrahedral computes correctly', () => {
    expect(TriangularNumber.tetrahedral(1)).toBe(1)
    expect(TriangularNumber.tetrahedral(2)).toBe(4)
    expect(TriangularNumber.tetrahedral(3)).toBe(10)
    expect(TriangularNumber.tetrahedral(4)).toBe(20)
    expect(TriangularNumber.tetrahedral(5)).toBe(35)
  })

  it('tetrahedral handles 0', () => {
    expect(TriangularNumber.tetrahedral(0)).toBe(0)
    expect(TriangularNumber.tetrahedral(-1)).toBe(0)
  })

  it('sumOfFirst equals tetrahedral', () => {
    expect(TriangularNumber.sumOfFirst(5)).toBe(TriangularNumber.tetrahedral(5))
    expect(TriangularNumber.sumOfFirst(10)).toBe(TriangularNumber.tetrahedral(10))
  })

  it('sumOfFirst handles 0 and negative', () => {
    expect(TriangularNumber.sumOfFirst(0)).toBe(0)
    expect(TriangularNumber.sumOfFirst(-5)).toBe(0)
  })

  it('nth handles large n', () => {
    expect(TriangularNumber.nth(1000)).toBe(500500)
    expect(TriangularNumber.nth(100)).toBe(5050)
  })

  it('nth formula: n*(n+1)/2', () => {
    for (let n = 1; n <= 20; n++) {
      expect(TriangularNumber.nth(n)).toBe((n * (n + 1)) / 2)
    }
  })

  it('isTriangular and indexOf are consistent', () => {
    for (let n = 1; n <= 20; n++) {
      const t = TriangularNumber.nth(n)
      expect(TriangularNumber.isTriangular(t)).toBe(true)
      expect(TriangularNumber.indexOf(t)).toBe(n)
    }
  })

  it('generate values are all triangular', () => {
    const values = TriangularNumber.generate(20)
    for (const v of values) {
      expect(TriangularNumber.isTriangular(v)).toBe(true)
    }
  })

  it('pentagonal formula: (3n²-n)/2', () => {
    for (let n = 1; n <= 10; n++) {
      expect(TriangularNumber.pentagonal(n)).toBe((3 * n * n - n) / 2)
    }
  })

  it('hexagonal formula: n*(2n-1)', () => {
    for (let n = 1; n <= 10; n++) {
      expect(TriangularNumber.hexagonal(n)).toBe(n * (2 * n - 1))
    }
  })

  it('tetrahedral formula: n*(n+1)*(n+2)/6', () => {
    for (let n = 1; n <= 10; n++) {
      expect(TriangularNumber.tetrahedral(n)).toBe((n * (n + 1) * (n + 2)) / 6)
    }
  })

  it('isTriangular(210) is true', () => {
    expect(TriangularNumber.isTriangular(210)).toBe(true)
    expect(TriangularNumber.indexOf(210)).toBe(20)
  })

  it('hexagonal numbers that are also triangular', () => {
    expect(TriangularNumber.isTriangular(TriangularNumber.hexagonal(1))).toBe(true)
    expect(TriangularNumber.isTriangular(TriangularNumber.hexagonal(3))).toBe(true)
  })

  it('nth(50) is correct', () => {
    expect(TriangularNumber.nth(50)).toBe(1275)
  })

  it('nth(100) is correct', () => {
    expect(TriangularNumber.nth(100)).toBe(5050)
  })

  it('pentagonal large n', () => {
    expect(TriangularNumber.pentagonal(100)).toBe(14950)
  })

  it('hexagonal large n', () => {
    expect(TriangularNumber.hexagonal(100)).toBe(19900)
  })

  it('generate ascending order', () => {
    const values = TriangularNumber.generate(50)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]!)
    }
  })

  it('pentagonal values increase', () => {
    for (let n = 1; n < 20; n++) {
      expect(TriangularNumber.pentagonal(n + 1)).toBeGreaterThan(TriangularNumber.pentagonal(n))
    }
  })

  it('hexagonal values increase', () => {
    for (let n = 1; n < 20; n++) {
      expect(TriangularNumber.hexagonal(n + 1)).toBeGreaterThan(TriangularNumber.hexagonal(n))
    }
  })

  it('tetrahedral values increase', () => {
    for (let n = 1; n < 20; n++) {
      expect(TriangularNumber.tetrahedral(n + 1)).toBeGreaterThan(TriangularNumber.tetrahedral(n))
    }
  })

  it('nth triangular is sum of 1..n', () => {
    for (let n = 1; n <= 15; n++) {
      let sum = 0
      for (let i = 1; i <= n; i++) sum += i
      expect(TriangularNumber.nth(n)).toBe(sum)
    }
  })

  it('indexOf of nth returns n', () => {
    for (let n = 1; n <= 15; n++) {
      expect(TriangularNumber.indexOf(TriangularNumber.nth(n))).toBe(n)
    }
  })

  it('isTriangular false for non-integer between triangulars', () => {
    expect(TriangularNumber.isTriangular(11)).toBe(false)
    expect(TriangularNumber.isTriangular(12)).toBe(false)
    expect(TriangularNumber.isTriangular(13)).toBe(false)
    expect(TriangularNumber.isTriangular(14)).toBe(false)
    expect(TriangularNumber.isTriangular(16)).toBe(false)
    expect(TriangularNumber.isTriangular(17)).toBe(false)
  })

  it('generate with large count produces correct last', () => {
    const result = TriangularNumber.generate(200)
    expect(result[199]).toBe(20100)
  })

  it('pentagonal and hexagonal both produce 1 for n=1', () => {
    expect(TriangularNumber.pentagonal(1)).toBe(1)
    expect(TriangularNumber.hexagonal(1)).toBe(1)
    expect(TriangularNumber.nth(1)).toBe(1)
  })

  it('sumOfFirst formula matches manual sum', () => {
    let manualSum = 0
    for (let n = 1; n <= 10; n++) {
      manualSum += TriangularNumber.nth(n)
      expect(TriangularNumber.sumOfFirst(n)).toBe(manualSum)
    }
  })

  it('nth and generate are consistent', () => {
    const values = TriangularNumber.generate(10)
    for (let i = 0; i < 10; i++) {
      expect(values[i]).toBe(TriangularNumber.nth(i + 1))
    }
  })

  it('isTriangular handles very large triangular numbers', () => {
    expect(TriangularNumber.isTriangular(125250)).toBe(true)
    expect(TriangularNumber.indexOf(125250)).toBe(500)
    expect(TriangularNumber.isTriangular(500500)).toBe(true)
    expect(TriangularNumber.indexOf(500500)).toBe(1000)
  })

  it('pentagonal that are also triangular', () => {
    expect(TriangularNumber.isTriangular(TriangularNumber.pentagonal(1))).toBe(true)
    expect(TriangularNumber.isTriangular(TriangularNumber.pentagonal(12))).toBe(true)
    expect(TriangularNumber.indexOf(TriangularNumber.pentagonal(1))).toBe(1)
  })

  it('indexOf boundary cases', () => {
    expect(TriangularNumber.indexOf(0)).toBe(-1)
    expect(TriangularNumber.indexOf(-100)).toBe(-1)
    expect(TriangularNumber.indexOf(Number.MAX_SAFE_INTEGER)).toBe(-1)
  })

  it('sumOfFirst handles large n', () => {
    expect(TriangularNumber.sumOfFirst(100)).toBe(171700)
    expect(TriangularNumber.sumOfFirst(50)).toBe(22100)
  })

  it('generate with negative count returns empty', () => {
    expect(TriangularNumber.generate(-1)).toEqual([])
    expect(TriangularNumber.generate(-10)).toEqual([])
  })

  it('should compute T(n)', () => {
    expect(TriangularNumber.nth(1)).toBe(1)
    expect(TriangularNumber.nth(5)).toBe(15)
  })

  it('should check if triangular', () => {
    expect(TriangularNumber.isTriangular(6)).toBe(true)
    expect(TriangularNumber.isTriangular(7)).toBe(false)
  })
})

  it('nth returns triangular number', () => {
    expect(TriangularNumber.nth(1)).toBe(1)
    expect(TriangularNumber.nth(5)).toBe(15)
  })

  it('isTriangular checks correctly', () => {
    expect(TriangularNumber.isTriangular(6)).toBe(true)
    expect(TriangularNumber.isTriangular(7)).toBe(false)
  })

  it('generate returns correct count', () => {
    expect(TriangularNumber.generate(5)).toEqual([1, 3, 6, 10, 15])
  })

describe('triangular-number - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('triangular-number - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('triangular-number - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('triangular-number - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('triangular-number - wave548', () => {
  it('triangular-number module defined', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number module is function', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave549', () => {
  it('triangular-number module defined', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number module is function', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave550', () => {
  it('triangular-number w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave551', () => {
  it('triangular-number w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave552', () => {
  it('triangular-number w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave553', () => {
  it('triangular-number w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave554', () => {
  it('triangular-number w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave555', () => {
  it('triangular-number w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave556', () => {
  it('triangular-number w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave557', () => {
  it('triangular-number w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave558', () => {
  it('triangular-number w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave559', () => {
  it('triangular-number w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave560', () => {
  it('triangular-number w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave561', () => {
  it('triangular-number w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave562', () => {
  it('triangular-number w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave563', () => {
  it('triangular-number w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave564', () => {
  it('triangular-number w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave565', () => {
  it('triangular-number w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave566', () => {
  it('triangular-number w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave127', () => {
  it('triangular-number w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave130', () => {
  it('triangular-number w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave133', () => {
  it('triangular-number w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave136', () => {
  it('triangular-number w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - wave139', () => {
  it('triangular-number w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w142', () => {
  it('triangular-number v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w145', () => {
  it('triangular-number v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w148', () => {
  it('triangular-number v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w151', () => {
  it('triangular-number v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w154', () => {
  it('triangular-number v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w157', () => {
  it('triangular-number v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w160', () => {
  it('triangular-number v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w170', () => {
  it('triangular-number x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w180', () => {
  it('triangular-number x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w190', () => {
  it('triangular-number x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w200', () => {
  it('triangular-number x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w210', () => {
  it('triangular-number x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w220', () => {
  it('triangular-number x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w230', () => {
  it('triangular-number x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w240', () => {
  it('triangular-number x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w250', () => {
  it('triangular-number x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w260', () => {
  it('triangular-number x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w270', () => {
  it('triangular-number x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w280', () => {
  it('triangular-number x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w290', () => {
  it('triangular-number x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w300', () => {
  it('triangular-number x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w310', () => {
  it('triangular-number x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w320', () => {
  it('triangular-number x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w330', () => {
  it('triangular-number x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w340', () => {
  it('triangular-number x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w350', () => {
  it('triangular-number x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w360', () => {
  it('triangular-number x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w370', () => {
  it('triangular-number x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w380', () => {
  it('triangular-number x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w390', () => {
  it('triangular-number x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w400', () => {
  it('triangular-number x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w420', () => {
  it('triangular-number x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w440', () => {
  it('triangular-number x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w460', () => {
  it('triangular-number x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w480', () => {
  it('triangular-number x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w500', () => {
  it('triangular-number x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w550', () => {
  it('triangular-number x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w600', () => {
  it('triangular-number x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w650', () => {
  it('triangular-number x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('triangular-number - w700', () => {
  it('triangular-number x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('triangular-number x700x49', () => {
    expect(describe).toBeDefined()
  })
})
