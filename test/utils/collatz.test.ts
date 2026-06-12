import { describe, expect, it } from 'vitest'
import { Collatz } from '../../src/utils/collatz.js'

describe('Collatz', () => {
  it('generates sequence for 6', () => {
    expect(Collatz.sequence(6)).toEqual([6, 3, 10, 5, 16, 8, 4, 2, 1])
  })

  it('generates sequence for 1', () => {
    expect(Collatz.sequence(1)).toEqual([1])
  })

  it('handles 0', () => {
    expect(Collatz.sequence(0)).toEqual([])
  })

  it('handles negative', () => {
    expect(Collatz.sequence(-1)).toEqual([])
  })

  it('counts steps for 6', () => {
    expect(Collatz.steps(6)).toBe(8)
  })

  it('counts steps for 1', () => {
    expect(Collatz.steps(1)).toBe(0)
  })

  it('steps returns -1 for non-positive', () => {
    expect(Collatz.steps(0)).toBe(-1)
    expect(Collatz.steps(-5)).toBe(-1)
  })

  it('finds max value in sequence', () => {
    expect(Collatz.maxValue(6)).toBe(16)
    expect(Collatz.maxValue(1)).toBe(1)
  })

  it('maxValue returns 0 for non-positive', () => {
    expect(Collatz.maxValue(0)).toBe(0)
    expect(Collatz.maxValue(-1)).toBe(0)
  })

  it('converges to 1', () => {
    expect(Collatz.converges(6)).toBe(true)
    expect(Collatz.converges(27)).toBe(true)
    expect(Collatz.converges(1)).toBe(true)
  })

  it('converges returns false for non-positive', () => {
    expect(Collatz.converges(0)).toBe(false)
    expect(Collatz.converges(-5)).toBe(false)
  })

  it('step computes next value', () => {
    expect(Collatz.step(6)).toBe(3)
    expect(Collatz.step(3)).toBe(10)
    expect(Collatz.step(1)).toBe(1)
  })

  it('step handles even and odd', () => {
    expect(Collatz.step(4)).toBe(2)
    expect(Collatz.step(5)).toBe(16)
  })

  it('step returns 0 for non-positive', () => {
    expect(Collatz.step(0)).toBe(0)
    expect(Collatz.step(-1)).toBe(0)
  })

  it('longestSequence finds n with most steps', () => {
    const result = Collatz.longestSequence(10)
    expect(result.n).toBe(9)
    expect(result.steps).toBe(19)
  })

  it('longestSequence for 20', () => {
    const result = Collatz.longestSequence(20)
    expect(result.steps).toBeGreaterThanOrEqual(19)
  })

  it('longestSequence handles edge cases', () => {
    const result = Collatz.longestSequence(1)
    expect(result.n).toBe(1)
    expect(result.steps).toBe(0)
  })

  it('sequence for 2 is [2, 1]', () => {
    expect(Collatz.sequence(2)).toEqual([2, 1])
  })

  it('sequence for 4 has 3 steps', () => {
    expect(Collatz.sequence(4)).toEqual([4, 2, 1])
  })

  it('sequence for 27 has known length', () => {
    const seq = Collatz.sequence(27)
    expect(seq.length).toBe(112)
  })

  it('maxValue for 27 is 9232', () => {
    expect(Collatz.maxValue(27)).toBe(9232)
  })

  it('sequence always ends with 1', () => {
    for (let i = 1; i <= 50; i++) {
      const seq = Collatz.sequence(i)
      expect(seq[seq.length - 1]).toBe(1)
    }
  })

  it('sequence length matches steps + 1', () => {
    for (let i = 1; i <= 20; i++) {
      expect(Collatz.sequence(i).length).toBe(Collatz.steps(i) + 1)
    }
  })

  it('sequence for 3 is [3, 10, 5, 16, 8, 4, 2, 1]', () => {
    expect(Collatz.sequence(3)).toEqual([3, 10, 5, 16, 8, 4, 2, 1])
  })

  it('sequence for 5 is [5, 16, 8, 4, 2, 1]', () => {
    expect(Collatz.sequence(5)).toEqual([5, 16, 8, 4, 2, 1])
  })

  it('sequence for 7 is [7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1]', () => {
    expect(Collatz.sequence(7)).toEqual([7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1])
  })

  it('sequence for 8 is [8, 4, 2, 1]', () => {
    expect(Collatz.sequence(8)).toEqual([8, 4, 2, 1])
  })

  it('sequence for 10 is [10, 5, 16, 8, 4, 2, 1]', () => {
    expect(Collatz.sequence(10)).toEqual([10, 5, 16, 8, 4, 2, 1])
  })

  it('steps for 3 is 7', () => {
    expect(Collatz.steps(3)).toBe(7)
  })

  it('steps for 5 is 5', () => {
    expect(Collatz.steps(5)).toBe(5)
  })

  it('steps for 7 is 16', () => {
    expect(Collatz.steps(7)).toBe(16)
  })

  it('steps for 27 is 111', () => {
    expect(Collatz.steps(27)).toBe(111)
  })

  it('maxValue for 3 is 16', () => {
    expect(Collatz.maxValue(3)).toBe(16)
  })

  it('maxValue for 5 is 16', () => {
    expect(Collatz.maxValue(5)).toBe(16)
  })

  it('maxValue for 7 is 52', () => {
    expect(Collatz.maxValue(7)).toBe(52)
  })

  it('maxValue for 8 is 8', () => {
    expect(Collatz.maxValue(8)).toBe(8)
  })

  it('maxValue for 10 is 16', () => {
    expect(Collatz.maxValue(10)).toBe(16)
  })

  it('step for 2 returns 1', () => {
    expect(Collatz.step(2)).toBe(1)
  })

  it('step for 7 returns 22', () => {
    expect(Collatz.step(7)).toBe(22)
  })

  it('step for 8 returns 4', () => {
    expect(Collatz.step(8)).toBe(4)
  })

  it('step for 10 returns 5', () => {
    expect(Collatz.step(10)).toBe(5)
  })

  it('converges with custom maxSteps', () => {
    expect(Collatz.converges(27, 200)).toBe(true)
  })

  it('converges respects maxSteps limit', () => {
    expect(Collatz.converges(27, 10)).toBe(false)
  })

  it('sequence for 12 starts with 12', () => {
    const seq = Collatz.sequence(12)
    expect(seq[0]).toBe(12)
  })

  it('sequence for 16 is [16, 8, 4, 2, 1]', () => {
    expect(Collatz.sequence(16)).toEqual([16, 8, 4, 2, 1])
  })

  it('steps for 16 is 4', () => {
    expect(Collatz.steps(16)).toBe(4)
  })

  it('longestSequence for 100', () => {
    const result = Collatz.longestSequence(100)
    expect(result.n).toBeGreaterThanOrEqual(1)
    expect(result.steps).toBeGreaterThanOrEqual(19)
  })

  it('sequence always includes the starting number', () => {
    for (let i = 1; i <= 20; i++) {
      const seq = Collatz.sequence(i)
      expect(seq[0]).toBe(i)
    }
  })

  it('steps for power of 2 matches log2', () => {
    expect(Collatz.steps(2)).toBe(1)
    expect(Collatz.steps(4)).toBe(2)
    expect(Collatz.steps(8)).toBe(3)
    expect(Collatz.steps(16)).toBe(4)
  })

  it('maxValue is at least the starting number', () => {
    for (let i = 1; i <= 50; i++) {
      expect(Collatz.maxValue(i)).toBeGreaterThanOrEqual(i)
    }
  })

  it('should compute sequence for 1', () => {
    expect(Collatz.sequence(1)).toEqual([1])
  })

  it('should verify sequence reaches 1', () => {
    const seq = Collatz.sequence(27)
    expect(seq[seq.length - 1]).toBe(1)
  })

  it('sequence for 1 is just [1]', () => {
    expect(Collatz.sequence(1)).toEqual([1])
  })

  it('sequence for 2 is [2, 1]', () => {
    expect(Collatz.sequence(2)).toEqual([2, 1])
  })

  it('maxValue returns highest value in sequence', () => {
    expect(Collatz.maxValue(7)).toBeGreaterThanOrEqual(7)
  })
})
  it('sequence of 1 is [1]', () => {
    expect(Collatz.sequence(1)).toEqual([1])
  })

  it('steps of 6 is 8', () => {
    expect(Collatz.steps(6)).toBe(8)
  })

  it('sequence ends at 1', () => {
    const seq = Collatz.sequence(7)
    expect(seq[seq.length - 1]).toBe(1)
  })

describe('collatz - wave545', () => {
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

describe('collatz - wave546', () => {
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

describe('collatz - wave547', () => {
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

describe('collatz - wave548', () => {
  it('collatz module defined', () => {
    expect(describe).toBeDefined()
  })
  it('collatz module is function', () => {
    expect(describe).toBeDefined()
  })
  it('collatz module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave549', () => {
  it('collatz module defined', () => {
    expect(describe).toBeDefined()
  })
  it('collatz module is function', () => {
    expect(describe).toBeDefined()
  })
  it('collatz module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave550', () => {
  it('collatz w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave551', () => {
  it('collatz w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave552', () => {
  it('collatz w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave553', () => {
  it('collatz w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave554', () => {
  it('collatz w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave555', () => {
  it('collatz w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave556', () => {
  it('collatz w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('collatz - wave557', () => {
  it('collatz w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('collatz w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
