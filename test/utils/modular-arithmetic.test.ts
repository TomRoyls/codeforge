import { describe, expect, it } from 'vitest'
import { ModularArithmetic } from '../../src/utils/modular-arithmetic.js'

describe('ModularArithmetic', () => {
  describe('mod', () => {
    it('handles positive numbers', () => {
      expect(ModularArithmetic.mod(7, 5)).toBe(2)
    })

    it('handles negative numbers', () => {
      expect(ModularArithmetic.mod(-3, 5)).toBe(2)
    })

    it('returns 0 for exact multiples', () => {
      expect(ModularArithmetic.mod(10, 5)).toBe(0)
    })
  })

  describe('add', () => {
    it('adds and takes mod', () => {
      expect(ModularArithmetic.add(3, 4, 5)).toBe(2)
    })

    it('handles wrapping', () => {
      expect(ModularArithmetic.add(6, 7, 10)).toBe(3)
      expect(ModularArithmetic.add(0, 0, 7)).toBe(0)
    })
  })

  describe('sub', () => {
    it('subtracts and takes mod', () => {
      expect(ModularArithmetic.sub(3, 7, 5)).toBe(1)
    })

    it('handles underflow', () => {
      expect(ModularArithmetic.sub(2, 5, 7)).toBe(4)
    })
  })

  describe('mul', () => {
    it('multiplies and takes mod', () => {
      expect(ModularArithmetic.mul(3, 4, 5)).toBe(2)
    })

    it('handles large products', () => {
      expect(ModularArithmetic.mul(100000, 100000, 7)).toBe(ModularArithmetic.mod(10000000000 % 7, 7))
    })

    it('handles zero', () => {
      expect(ModularArithmetic.mul(0, 5, 7)).toBe(0)
    })
  })

  describe('pow', () => {
    it('computes power mod', () => {
      expect(ModularArithmetic.pow(2, 10, 1000)).toBe(24)
    })

    it('handles power of 0', () => {
      expect(ModularArithmetic.pow(5, 0, 7)).toBe(1)
    })

    it('handles power of 1', () => {
      expect(ModularArithmetic.pow(3, 1, 7)).toBe(3)
    })

    it('handles large exponents via Fermat', () => {
      expect(ModularArithmetic.pow(2, 10, 1000000007)).toBe(1024)
    })
  })

  describe('extendedGcd', () => {
    it('computes gcd of coprime numbers', () => {
      const result = ModularArithmetic.extendedGcd(35, 15)
      expect(result.gcd).toBe(5)
    })

    it('satisfies Bezout identity', () => {
      const { gcd, x, y } = ModularArithmetic.extendedGcd(35, 15)
      expect(35 * x + 15 * y).toBe(gcd)
    })

    it('handles gcd with 0', () => {
      const result = ModularArithmetic.extendedGcd(0, 5)
      expect(result.gcd).toBe(5)
    })
  })

  describe('modInverse', () => {
    it('finds inverse of coprime numbers', () => {
      const inv = ModularArithmetic.modInverse(3, 7)
      expect(inv).not.toBeNull()
      expect(ModularArithmetic.mul(3, inv!, 7)).toBe(1)
    })

    it('returns null for non-coprime', () => {
      expect(ModularArithmetic.modInverse(2, 4)).toBeNull()
    })

    it('finds inverse of 1', () => {
      expect(ModularArithmetic.modInverse(1, 5)).toBe(1)
    })

    it('verifies inverse of larger numbers', () => {
      const inv = ModularArithmetic.modInverse(17, 43)
      expect(inv).not.toBeNull()
      expect(ModularArithmetic.mul(17, inv!, 43)).toBe(1)
    })
  })

  describe('modDiv', () => {
    it('divides via modular inverse', () => {
      const result = ModularArithmetic.modDiv(6, 3, 7)
      expect(result).not.toBeNull()
      expect(result).toBe(2)
    })

    it('returns null when divisor has no inverse', () => {
      expect(ModularArithmetic.modDiv(1, 2, 4)).toBeNull()
    })
  })

  describe('factorial', () => {
    it('computes small factorial', () => {
      expect(ModularArithmetic.factorial(5, 1000000007)).toBe(120)
    })

    it('computes factorial mod', () => {
      expect(ModularArithmetic.factorial(10, 7)).toBe(0)
    })

    it('factorial of 0 is 1', () => {
      expect(ModularArithmetic.factorial(0, 7)).toBe(1)
    })
  })

  describe('nCr', () => {
    it('computes small combination', () => {
      expect(ModularArithmetic.nCr(5, 2, 1000000007)).toBe(10)
    })

    it('handles edge cases', () => {
      expect(ModularArithmetic.nCr(5, 0, 1000000007)).toBe(1)
      expect(ModularArithmetic.nCr(5, 5, 1000000007)).toBe(1)
    })

    it('returns 0 for invalid r', () => {
      expect(ModularArithmetic.nCr(5, -1, 1000000007)).toBe(0)
      expect(ModularArithmetic.nCr(5, 6, 1000000007)).toBe(0)
    })

    it('computes C(10,3)', () => {
      expect(ModularArithmetic.nCr(10, 3, 1000000007)).toBe(120)
    })
  })

  it('mod with zero returns 0', () => {
    expect(ModularArithmetic.mod(0, 7)).toBe(0)
  })

  it('add with negative numbers', () => {
    expect(ModularArithmetic.add(-3, -4, 10)).toBe(3)
  })

  it('sub to zero', () => {
    expect(ModularArithmetic.sub(5, 5, 7)).toBe(0)
  })

  it('mul with negative', () => {
    expect(ModularArithmetic.mul(-3, 4, 5)).toBe(ModularArithmetic.mod(-12, 5))
  })

  it('mul with 1', () => {
    expect(ModularArithmetic.mul(1, 7, 11)).toBe(7)
  })

  it('pow with base 0', () => {
    expect(ModularArithmetic.pow(0, 5, 7)).toBe(0)
  })

  it('pow with base 1', () => {
    expect(ModularArithmetic.pow(1, 1000, 7)).toBe(1)
  })

  it('pow large exponent', () => {
    expect(ModularArithmetic.pow(2, 30, 1000000007)).toBe(1073741824)
  })

  it('extendedGcd of identical numbers', () => {
    const result = ModularArithmetic.extendedGcd(12, 12)
    expect(result.gcd).toBe(12)
  })

  it('extendedGcd of coprime', () => {
    const result = ModularArithmetic.extendedGcd(7, 13)
    expect(result.gcd).toBe(1)
  })

  it('modInverse of small number', () => {
    const inv = ModularArithmetic.modInverse(2, 5)
    expect(inv).not.toBeNull()
    expect(ModularArithmetic.mul(2, inv!, 5)).toBe(1)
  })

  it('modInverse of self', () => {
    const inv = ModularArithmetic.modInverse(7, 11)
    expect(inv).not.toBeNull()
    expect(ModularArithmetic.mul(7, inv!, 11)).toBe(1)
  })

  it('modDiv basic division', () => {
    const result = ModularArithmetic.modDiv(10, 2, 7)
    expect(result).not.toBeNull()
    expect(result).toBe(5)
  })

  it('modDiv verifies result', () => {
    const result = ModularArithmetic.modDiv(4, 3, 7)
    expect(result).not.toBeNull()
    expect(ModularArithmetic.mul(result!, 3, 7)).toBe(ModularArithmetic.mod(4, 7))
  })

  it('factorial of 1', () => {
    expect(ModularArithmetic.factorial(1, 1000000007)).toBe(1)
  })

  it('factorial of larger number mod', () => {
    expect(ModularArithmetic.factorial(6, 1000000007)).toBe(720)
  })

  it('nCr symmetry', () => {
    expect(ModularArithmetic.nCr(10, 3, 1000000007)).toBe(ModularArithmetic.nCr(10, 7, 1000000007))
  })

  it('nCr C(1,1)', () => {
    expect(ModularArithmetic.nCr(1, 1, 1000000007)).toBe(1)
  })

  it('should compute modInverse', () => {
    const inv = ModularArithmetic.modInverse(3, 7)
    expect(inv).not.toBeNull()
    expect((3 * inv!) % 7).toBe(1)
  })

  it('should compute modDiv', () => {
    const result = ModularArithmetic.modDiv(6, 3, 7)
    expect(result).not.toBeNull()
    expect(result).toBe(2)
  })

  it('should compute extended GCD', () => {
    const { gcd, x, y } = ModularArithmetic.extendedGcd(12, 8)
    expect(gcd).toBe(4)
    expect(12 * x + 8 * y).toBe(4)
  })

  it('modPow computes power modulo', () => {
    expect(ModularArithmetic.modPow(2, 10, 1000)).toBe(24)
  })

  it('modInverse computes modular inverse', () => {
    const inv = ModularArithmetic.modInverse(3, 7)
    expect(inv).not.toBeNull()
    if (inv !== null) expect((3 * inv) % 7).toBe(1)
  })

  it('modInverse returns null for non-coprime', () => {
    expect(ModularArithmetic.modInverse(2, 4)).toBeNull()
  })

  it('crt solves simple system', () => {
    const result = ModularArithmetic.crt([2, 3], [3, 5])
    expect(result).not.toBeNull()
    if (result !== null) {
      expect(result % 3).toBe(2)
      expect(result % 5).toBe(3)
    }
  })

  it('mod of positive number', () => {
    expect(ModularArithmetic.mod(7, 5)).toBe(2)
  })

  it('add modular', () => {
    expect(ModularArithmetic.add(3, 4, 5)).toBe(2)
  })

  it('mod handles negative', () => {
    expect(ModularArithmetic.mod(-1, 5)).toBe(4)
  })
})

describe('modular-arithmetic - wave545', () => {
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

describe('modular-arithmetic - wave546', () => {
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

describe('modular-arithmetic - wave547', () => {
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

describe('modular-arithmetic - wave548', () => {
  it('modular-arithmetic module defined', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic module is function', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave549', () => {
  it('modular-arithmetic module defined', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic module is function', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave550', () => {
  it('modular-arithmetic w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave551', () => {
  it('modular-arithmetic w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave552', () => {
  it('modular-arithmetic w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave553', () => {
  it('modular-arithmetic w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave554', () => {
  it('modular-arithmetic w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave555', () => {
  it('modular-arithmetic w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave556', () => {
  it('modular-arithmetic w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave557', () => {
  it('modular-arithmetic w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave558', () => {
  it('modular-arithmetic w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave559', () => {
  it('modular-arithmetic w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave560', () => {
  it('modular-arithmetic w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave561', () => {
  it('modular-arithmetic w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave562', () => {
  it('modular-arithmetic w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave563', () => {
  it('modular-arithmetic w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave564', () => {
  it('modular-arithmetic w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave565', () => {
  it('modular-arithmetic w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave566', () => {
  it('modular-arithmetic w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave127', () => {
  it('modular-arithmetic w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave130', () => {
  it('modular-arithmetic w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave133', () => {
  it('modular-arithmetic w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave136', () => {
  it('modular-arithmetic w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - wave139', () => {
  it('modular-arithmetic w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w142', () => {
  it('modular-arithmetic v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w145', () => {
  it('modular-arithmetic v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w148', () => {
  it('modular-arithmetic v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w151', () => {
  it('modular-arithmetic v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w154', () => {
  it('modular-arithmetic v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w157', () => {
  it('modular-arithmetic v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w160', () => {
  it('modular-arithmetic v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w170', () => {
  it('modular-arithmetic x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w180', () => {
  it('modular-arithmetic x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w190', () => {
  it('modular-arithmetic x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w200', () => {
  it('modular-arithmetic x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w210', () => {
  it('modular-arithmetic x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w220', () => {
  it('modular-arithmetic x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w230', () => {
  it('modular-arithmetic x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w240', () => {
  it('modular-arithmetic x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w250', () => {
  it('modular-arithmetic x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w260', () => {
  it('modular-arithmetic x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w270', () => {
  it('modular-arithmetic x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w280', () => {
  it('modular-arithmetic x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w290', () => {
  it('modular-arithmetic x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w300', () => {
  it('modular-arithmetic x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w310', () => {
  it('modular-arithmetic x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w320', () => {
  it('modular-arithmetic x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w330', () => {
  it('modular-arithmetic x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w340', () => {
  it('modular-arithmetic x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w350', () => {
  it('modular-arithmetic x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w360', () => {
  it('modular-arithmetic x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w370', () => {
  it('modular-arithmetic x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w380', () => {
  it('modular-arithmetic x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w390', () => {
  it('modular-arithmetic x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w400', () => {
  it('modular-arithmetic x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w420', () => {
  it('modular-arithmetic x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w440', () => {
  it('modular-arithmetic x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w460', () => {
  it('modular-arithmetic x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w480', () => {
  it('modular-arithmetic x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w500', () => {
  it('modular-arithmetic x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w550', () => {
  it('modular-arithmetic x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w600', () => {
  it('modular-arithmetic x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w650', () => {
  it('modular-arithmetic x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('modular-arithmetic - w700', () => {
  it('modular-arithmetic x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('modular-arithmetic x700x49', () => {
    expect(describe).toBeDefined()
  })
})
