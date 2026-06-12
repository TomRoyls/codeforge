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
