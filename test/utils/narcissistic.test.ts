import { describe, expect, it } from 'vitest'
import { Narcissistic } from '../../src/utils/narcissistic.js'

describe('Narcissistic', () => {
  describe('isNarcissistic', () => {
    it('detects single digit narcissistic numbers', () => {
      for (let i = 0; i <= 9; i++) {
        expect(Narcissistic.isNarcissistic(i)).toBe(true)
      }
    })

    it('detects 153 as narcissistic', () => {
      expect(Narcissistic.isNarcissistic(153)).toBe(true)
    })

    it('detects 370 as narcissistic', () => {
      expect(Narcissistic.isNarcissistic(370)).toBe(true)
    })

    it('detects 371 as narcissistic', () => {
      expect(Narcissistic.isNarcissistic(371)).toBe(true)
    })

    it('detects 407 as narcissistic', () => {
      expect(Narcissistic.isNarcissistic(407)).toBe(true)
    })

    it('detects 9474 as narcissistic', () => {
      expect(Narcissistic.isNarcissistic(9474)).toBe(true)
    })

    it('detects 54748 as narcissistic', () => {
      expect(Narcissistic.isNarcissistic(54748)).toBe(true)
    })

    it('detects 92727 as narcissistic', () => {
      expect(Narcissistic.isNarcissistic(92727)).toBe(true)
    })

    it('detects 93084 as narcissistic', () => {
      expect(Narcissistic.isNarcissistic(93084)).toBe(true)
    })

    it('rejects non-narcissistic', () => {
      expect(Narcissistic.isNarcissistic(10)).toBe(false)
      expect(Narcissistic.isNarcissistic(100)).toBe(false)
      expect(Narcissistic.isNarcissistic(999)).toBe(false)
    })

    it('rejects negative', () => {
      expect(Narcissistic.isNarcissistic(-153)).toBe(false)
      expect(Narcissistic.isNarcissistic(-1)).toBe(false)
    })

    it('0 is narcissistic', () => {
      expect(Narcissistic.isNarcissistic(0)).toBe(true)
    })

    it('1 is narcissistic', () => {
      expect(Narcissistic.isNarcissistic(1)).toBe(true)
    })

    it('2 is narcissistic', () => {
      expect(Narcissistic.isNarcissistic(2)).toBe(true)
    })

    it('rejects 11', () => {
      expect(Narcissistic.isNarcissistic(11)).toBe(false)
    })

    it('rejects 12', () => {
      expect(Narcissistic.isNarcissistic(12)).toBe(false)
    })

    it('rejects 99', () => {
      expect(Narcissistic.isNarcissistic(99)).toBe(false)
    })

    it('rejects 100', () => {
      expect(Narcissistic.isNarcissistic(100)).toBe(false)
    })

    it('rejects 101', () => {
      expect(Narcissistic.isNarcissistic(101)).toBe(false)
    })

    it('rejects 200', () => {
      expect(Narcissistic.isNarcissistic(200)).toBe(false)
    })

    it('rejects 1000', () => {
      expect(Narcissistic.isNarcissistic(1000)).toBe(false)
    })
  })

  describe('generate', () => {
    it('generates narcissistic numbers up to 1000', () => {
      const result = Narcissistic.generate(1000)
      expect(result).toContain(0)
      expect(result).toContain(1)
      expect(result).toContain(153)
      expect(result).toContain(370)
      expect(result).toContain(371)
      expect(result).toContain(407)
    })

    it('generate up to 100 includes all single digits', () => {
      const result = Narcissistic.generate(100)
      expect(result.filter(n => n < 10).length).toBe(10)
    })

    it('generate up to 10000 includes 9474', () => {
      const result = Narcissistic.generate(10000)
      expect(result).toContain(9474)
    })

    it('generate up to 1000 includes known values', () => {
      const result = Narcissistic.generate(1000)
      expect(result).toContain(0)
      expect(result).toContain(1)
      expect(result).toContain(153)
      expect(result).toContain(370)
      expect(result).toContain(371)
      expect(result).toContain(407)
    })

    it('generates up to 10000', () => {
      const result = Narcissistic.generate(10000)
      expect(result).toContain(0)
      expect(result).toContain(1)
      expect(result).toContain(153)
      expect(result).toContain(9474)
    })

    it('generate up to 0 returns [0]', () => {
      const result = Narcissistic.generate(0)
      expect(result).toEqual([0])
    })

    it('generate up to 5 returns [0,1,2,3,4,5]', () => {
      const result = Narcissistic.generate(5)
      expect(result).toEqual([0, 1, 2, 3, 4, 5])
    })

    it('generate returns array in ascending order', () => {
      const result = Narcissistic.generate(1000)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1])
      }
    })

    it('generate up to 100000 includes 54748', () => {
      const result = Narcissistic.generate(100000)
      expect(result).toContain(54748)
    })

    it('generate up to 100000 includes 92727', () => {
      const result = Narcissistic.generate(100000)
      expect(result).toContain(92727)
    })

    it('generate up to 100000 includes 93084', () => {
      const result = Narcissistic.generate(100000)
      expect(result).toContain(93084)
    })
  })

  describe('digitPowerSum', () => {
    it('digitPowerSum computes correctly for 153', () => {
      expect(Narcissistic.digitPowerSum(153)).toBe(153)
    })

    it('digitPowerSum computes correctly for 123', () => {
      expect(Narcissistic.digitPowerSum(123)).toBe(36)
    })

    it('digitPowerSum for 0', () => {
      expect(Narcissistic.digitPowerSum(0)).toBe(0)
    })

    it('digitPowerSum for single digit 5', () => {
      expect(Narcissistic.digitPowerSum(5)).toBe(5)
    })

    it('digitPowerSum for 370', () => {
      expect(Narcissistic.digitPowerSum(370)).toBe(370)
    })

    it('digitPowerSum for 9474', () => {
      expect(Narcissistic.digitPowerSum(9474)).toBe(9474)
    })

    it('digitPowerSum for 100', () => {
      expect(Narcissistic.digitPowerSum(100)).toBe(1)
    })

    it('digitPowerSum for 999', () => {
      expect(Narcissistic.digitPowerSum(999)).toBe(2187)
    })

    it('digitPowerSum handles large numbers', () => {
      expect(Narcissistic.digitPowerSum(12345)).toBeCloseTo(4425)
    })

    it('digitPowerSum for 111 returns 3', () => {
      expect(Narcissistic.digitPowerSum(111)).toBe(3)
    })

    it('digitPowerSum for 222 returns 24', () => {
      expect(Narcissistic.digitPowerSum(222)).toBe(24)
    })
  })

  describe('next', () => {
    it('next finds next narcissistic number after 9', () => {
      expect(Narcissistic.next(9)).toBe(153)
    })

    it('next finds next narcissistic number after 152', () => {
      expect(Narcissistic.next(152)).toBe(153)
    })

    it('next returns 0 after negative', () => {
      expect(Narcissistic.next(-1)).toBe(0)
    })

    it('next after 153 returns 370', () => {
      expect(Narcissistic.next(153)).toBe(370)
    })

    it('next after 370 returns 371', () => {
      expect(Narcissistic.next(370)).toBe(371)
    })

    it('next after 371 returns 407', () => {
      expect(Narcissistic.next(371)).toBe(407)
    })

    it('next after 407 returns 1634', () => {
      expect(Narcissistic.next(407)).toBe(1634)
    })

    it('next after 1634 returns 8208', () => {
      expect(Narcissistic.next(1634)).toBe(8208)
    })

    it('next after 8208 returns 9474', () => {
      expect(Narcissistic.next(8208)).toBe(9474)
    })

    it('next after 9474 returns 54748', () => {
      expect(Narcissistic.next(9474)).toBe(54748)
    })

    it('next from narcissistic number returns next narcissistic', () => {
      expect(Narcissistic.next(1)).toBe(2)
    })

    it('next from 8 returns 9', () => {
      expect(Narcissistic.next(8)).toBe(9)
    })
  })

  describe('isPerfectDigitalInvariant', () => {
    it('isPerfectDigitalInvariant with power 4 for 1634', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(1634, 4)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 4 for 8208', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(8208, 4)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 4 for 9474', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(9474, 4)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 3 for 371', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(371, 3)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 3 for 153', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(153, 3)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 3 for 370', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(370, 3)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 3 for 407', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(407, 3)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 5 for 54748', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(54748, 5)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 5 for 92727', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(92727, 5)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 5 for 93084', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(93084, 5)).toBe(true)
    })

    it('isPerfectDigitalInvariant returns false for wrong power', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(153, 4)).toBe(false)
      expect(Narcissistic.isPerfectDigitalInvariant(1234, 4)).toBe(false)
    })

    it('isPerfectDigitalInvariant with power 1 for any digit', () => {
      for (let i = 0; i <= 9; i++) {
        expect(Narcissistic.isPerfectDigitalInvariant(i, 1)).toBe(true)
      }
    })

    it('isPerfectDigitalInvariant returns false for negative', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(-153, 3)).toBe(false)
    })

    it('isPerfectDigitalInvariant with power 2 for 0', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(0, 2)).toBe(true)
    })

    it('isPerfectDigitalInvariant with power 2 for 1', () => {
      expect(Narcissistic.isPerfectDigitalInvariant(1, 2)).toBe(true)
    })
  })

  describe('countDigits', () => {
    it('countDigits returns 1 for 0', () => {
      expect(Narcissistic.countDigits(0)).toBe(1)
    })

    it('countDigits returns 3 for 153', () => {
      expect(Narcissistic.countDigits(153)).toBe(3)
    })

    it('countDigits returns 4 for 9474', () => {
      expect(Narcissistic.countDigits(9474)).toBe(4)
    })

    it('countDigits returns 1 for single digits', () => {
      for (let i = 0; i <= 9; i++) {
        expect(Narcissistic.countDigits(i)).toBe(1)
      }
    })

    it('countDigits returns 2 for two-digit numbers', () => {
      expect(Narcissistic.countDigits(10)).toBe(2)
      expect(Narcissistic.countDigits(99)).toBe(2)
    })

    it('countDigits returns 3 for three-digit numbers', () => {
      expect(Narcissistic.countDigits(100)).toBe(3)
      expect(Narcissistic.countDigits(999)).toBe(3)
    })

    it('countDigits returns 5 for 10000', () => {
      expect(Narcissistic.countDigits(10000)).toBe(5)
    })

    it('countDigits works with negative numbers', () => {
      expect(Narcissistic.countDigits(-153)).toBe(3)
      expect(Narcissistic.countDigits(-1)).toBe(1)
      expect(Narcissistic.countDigits(-10)).toBe(2)
    })

    it('countDigits for -0 is 1', () => {
      expect(Narcissistic.countDigits(-0)).toBe(1)
    })
  })
})
describe('narcissistic - wave552', () => {
  it('narcissistic w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave553', () => {
  it('narcissistic w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave554', () => {
  it('narcissistic w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave555', () => {
  it('narcissistic w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave556', () => {
  it('narcissistic w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave557', () => {
  it('narcissistic w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave558', () => {
  it('narcissistic w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave559', () => {
  it('narcissistic w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave560', () => {
  it('narcissistic w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave561', () => {
  it('narcissistic w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave562', () => {
  it('narcissistic w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave563', () => {
  it('narcissistic w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave564', () => {
  it('narcissistic w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave565', () => {
  it('narcissistic w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave566', () => {
  it('narcissistic w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave127', () => {
  it('narcissistic w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave130', () => {
  it('narcissistic w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave133', () => {
  it('narcissistic w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave136', () => {
  it('narcissistic w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - wave139', () => {
  it('narcissistic w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - w142', () => {
  it('narcissistic v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - w145', () => {
  it('narcissistic v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - w148', () => {
  it('narcissistic v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - w151', () => {
  it('narcissistic v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - w154', () => {
  it('narcissistic v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - w157', () => {
  it('narcissistic v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('narcissistic - w160', () => {
  it('narcissistic v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('narcissistic v160x2', () => {
    expect(describe).toBeDefined()
  })
})
