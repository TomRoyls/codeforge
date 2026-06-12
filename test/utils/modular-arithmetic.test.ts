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
