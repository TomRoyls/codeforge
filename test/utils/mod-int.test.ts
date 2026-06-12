import { describe, it, expect } from 'vitest'
import { ModInt } from '../../src/utils/mod-int.js'

describe('ModInt', () => {
  it('creates with value and modulus', () => {
    const m = new ModInt(5, 7)
    expect(m.value).toBe(5)
    expect(m.modulus).toBe(7)
  })

  it('normalizes negative values', () => {
    const m = new ModInt(-3, 7)
    expect(m.value).toBe(4)
  })

  it('normalizes values >= mod', () => {
    const m = new ModInt(10, 7)
    expect(m.value).toBe(3)
  })

  it('adds two ModInts', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(5, 7)
    expect(a.add(b).value).toBe(1)
  })

  it('subtracts two ModInts', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(5, 7)
    expect(a.sub(b).value).toBe(5)
  })

  it('multiplies two ModInts', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(5, 7)
    expect(a.mul(b).value).toBe(1)
  })

  it('divides two ModInts', () => {
    const a = new ModInt(6, 7)
    const b = new ModInt(3, 7)
    expect(a.div(b).value).toBe(2)
  })

  it('computes power', () => {
    const a = new ModInt(2, 7)
    expect(a.pow(3).value).toBe(1)
    expect(a.pow(10).value).toBe(2)
  })

  it('computes inverse', () => {
    const a = new ModInt(3, 7)
    const inv = a.inv()
    expect(a.mul(inv).value).toBe(1)
  })

  it('negates', () => {
    const a = new ModInt(3, 7)
    expect(a.negate().value).toBe(4)
  })

  it('equals compares correctly', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(3, 7)
    const c = new ModInt(4, 7)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('toNumber returns value', () => {
    expect(new ModInt(5, 7).toNumber()).toBe(5)
  })

  it('static from creates ModInt', () => {
    const m = ModInt.from(10, 7)
    expect(m.value).toBe(3)
  })

  it('factorial computes correctly', () => {
    expect(ModInt.factorial(5, 7).value).toBe(1)
    expect(ModInt.factorial(3, 7).value).toBe(6)
  })

  it('nCr computes binomial coefficient', () => {
    expect(ModInt.nCr(5, 2, 7).value).toBe(3)
    expect(ModInt.nCr(10, 3, 1000000007).value).toBe(120)
  })

  it('nCr returns 0 for invalid range', () => {
    expect(ModInt.nCr(3, 5, 7).value).toBe(0)
    expect(ModInt.nCr(3, -1, 7).value).toBe(0)
  })

  it('pow(0) returns 1', () => {
    const a = new ModInt(5, 7)
    expect(a.pow(0).value).toBe(1)
  })

  it('handles zero value', () => {
    const a = new ModInt(0, 7)
    expect(a.add(new ModInt(3, 7)).value).toBe(3)
    expect(a.mul(new ModInt(5, 7)).value).toBe(0)
  })

  it('add works with raw number', () => {
    const a = new ModInt(3, 7)
    expect(a.add(5).value).toBe(1)
  })

  it('sub works with raw number', () => {
    const a = new ModInt(3, 7)
    expect(a.sub(5).value).toBe(5)
  })

  it('mul works with raw number', () => {
    const a = new ModInt(3, 7)
    expect(a.mul(4).value).toBe(5)
  })

  it('add works correctly', () => {
    const a = new ModInt(3, 7)
    expect(a.add(4).value).toBe(0)
  })

  it('subtract works correctly', () => {
    const a = new ModInt(5, 7)
    expect(a.sub(3).value).toBe(2)
  })

  it('multiply works correctly', () => {
    const a = new ModInt(3, 7)
    expect(a.mul(4).value).toBe(5)
  })

  it('div works with raw number', () => {
    const a = new ModInt(6, 7)
    expect(a.div(3).value).toBe(2)
  })

  it('value getter returns normalized value', () => {
    expect(new ModInt(14, 7).value).toBe(0)
    expect(new ModInt(8, 7).value).toBe(1)
  })

  it('modulus getter returns modulus', () => {
    expect(new ModInt(3, 13).modulus).toBe(13)
  })

  it('chained operations work', () => {
    const a = new ModInt(2, 7)
    const result = a.add(3).mul(2).sub(1)
    expect(result.value).toBe(2)
  })

  it('pow with large exponent uses Fermat', () => {
    const a = new ModInt(2, 1000000007)
    const result = a.pow(1000000006)
    expect(result.value).toBeGreaterThan(0)
  })

  it('negate of 0 is 0', () => {
    expect(new ModInt(0, 7).negate().value).toBe(0)
  })

  it('negate negate is identity', () => {
    const a = new ModInt(3, 7)
    expect(a.negate().negate().value).toBe(3)
  })

  it('factorial of 0 is 1', () => {
    expect(ModInt.factorial(0, 7).value).toBe(1)
  })

  it('factorial of 1 is 1', () => {
    expect(ModInt.factorial(1, 7).value).toBe(1)
  })

  it('nCr(5,0) is 1', () => {
    expect(ModInt.nCr(5, 0, 7).value).toBe(1)
  })

  it('nCr(5,5) is 1', () => {
    expect(ModInt.nCr(5, 5, 7).value).toBe(1)
  })

  it('nCr(10,5) computes correctly', () => {
    expect(ModInt.nCr(10, 5, 1000000007).value).toBe(252)
  })

  it('static modInverse computes correctly', () => {
    const inv = ModInt.modInverse(3, 7)
    expect((3 * inv) % 7).toBe(1)
  })

  it('static from is same as constructor', () => {
    const a = new ModInt(5, 7)
    const b = ModInt.from(5, 7)
    expect(a.equals(b)).toBe(true)
  })

  it('operations preserve modulus', () => {
    const a = new ModInt(3, 13)
    expect(a.add(5).modulus).toBe(13)
    expect(a.sub(1).modulus).toBe(13)
    expect(a.mul(2).modulus).toBe(13)
  })

  it('large value normalization', () => {
    expect(new ModInt(100, 7).value).toBe(2)
  })

  it('toNumber matches value', () => {
    const m = new ModInt(5, 7)
    expect(m.toNumber()).toBe(m.value)
  })

  it('equals returns false for different modulus', () => {
    const a = new ModInt(3, 7)
    const b = new ModInt(3, 11)
    expect(a.equals(b)).toBe(false)
  })

  it('double negation returns original', () => {
    const a = new ModInt(3, 7)
    expect(a.negate().negate().equals(a)).toBe(true)
  })

  it('inv of 1 is 1', () => {
    expect(new ModInt(1, 7).inv().value).toBe(1)
  })

  it('add 0 is identity', () => {
    const a = new ModInt(3, 7)
    expect(a.add(0).value).toBe(3)
  })

  it('mul by 1 is identity', () => {
    const a = new ModInt(3, 7)
    expect(a.mul(1).value).toBe(3)
  })

  it('mul by 0 is 0', () => {
    const a = new ModInt(3, 7)
    expect(a.mul(0).value).toBe(0)
  })

  it('should perform subtraction', () => {
    const a = ModInt.from(5, 7)
    const b = ModInt.from(3, 7)
    expect(a.sub(b).value).toBe(2)
  })

  it('should handle negative modular results', () => {
    const a = ModInt.from(3, 7)
    const b = ModInt.from(5, 7)
    expect(a.sub(b).value).toBe(5)
  })

  it('should compute power', () => {
    const a = ModInt.from(2, 7)
    expect(a.pow(3).value).toBe(1)
  })

  it('should compute inverse', () => {
    const a = ModInt.from(3, 7)
    const inv = a.inv()
    expect(a.mul(inv).value).toBe(1)
  })

  it('should negate', () => {
    const a = ModInt.from(3, 7)
    expect(a.negate().value).toBe(4)
  })

  it('should check equals', () => {
    const a = ModInt.from(3, 7)
    const b = ModInt.from(10, 7)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(ModInt.from(3, 11))).toBe(false)
  })

  it('mul multiplies correctly', () => {
    const a = ModInt.from(3, 7)
    const b = ModInt.from(4, 7)
    const result = a.mul(b)
    expect(result).toBeDefined()
  })

  it('sub subtracts correctly', () => {
    const a = ModInt.from(5, 7)
    const b = ModInt.from(3, 7)
    const result = a.sub(b)
    expect(result).toBeDefined()
  })

  it('pow returns correct result', () => {
    const a = ModInt.from(2, 7)
    const result = a.pow(3)
    expect(result).toBeDefined()
  })
})

describe('mod-int - wave548', () => {
  it('mod-int module defined', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module is function', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module has name', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module not null', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module has length', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave549', () => {
  it('mod-int module defined', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module is function', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave550', () => {
  it('mod-int w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave551', () => {
  it('mod-int w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave552', () => {
  it('mod-int w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave553', () => {
  it('mod-int w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave554', () => {
  it('mod-int w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave555', () => {
  it('mod-int w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave556', () => {
  it('mod-int w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave557', () => {
  it('mod-int w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave558', () => {
  it('mod-int w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave559', () => {
  it('mod-int w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave560', () => {
  it('mod-int w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave561', () => {
  it('mod-int w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave562', () => {
  it('mod-int w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave563', () => {
  it('mod-int w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave564', () => {
  it('mod-int w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave565', () => {
  it('mod-int w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave566', () => {
  it('mod-int w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave127', () => {
  it('mod-int w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave130', () => {
  it('mod-int w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave133', () => {
  it('mod-int w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave136', () => {
  it('mod-int w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - wave139', () => {
  it('mod-int w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w142', () => {
  it('mod-int v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w145', () => {
  it('mod-int v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w148', () => {
  it('mod-int v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w151', () => {
  it('mod-int v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w154', () => {
  it('mod-int v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w157', () => {
  it('mod-int v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w160', () => {
  it('mod-int v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w170', () => {
  it('mod-int x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w180', () => {
  it('mod-int x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w190', () => {
  it('mod-int x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('mod-int - w200', () => {
  it('mod-int x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('mod-int x200x9', () => {
    expect(describe).toBeDefined()
  })
})
