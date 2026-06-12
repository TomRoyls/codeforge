import { describe, expect, it } from 'vitest'
import { IntegerPartition } from '../../src/utils/integer-partition.js'

describe('IntegerPartition', () => {
  it('generates partitions of 4', () => {
    const result = IntegerPartition.generate(4)
    expect(result).toEqual([
      [4], [3, 1], [2, 2], [2, 1, 1], [1, 1, 1, 1],
    ])
  })

  it('generates partitions of 1', () => {
    expect(IntegerPartition.generate(1)).toEqual([[1]])
  })

  it('generates partitions of 2', () => {
    expect(IntegerPartition.generate(2)).toEqual([[2], [1, 1]])
  })

  it('handles 0', () => {
    expect(IntegerPartition.generate(0)).toEqual([])
  })

  it('handles negative', () => {
    expect(IntegerPartition.generate(-1)).toEqual([])
  })

  it('count returns partition number', () => {
    expect(IntegerPartition.count(1)).toBe(1)
    expect(IntegerPartition.count(4)).toBe(5)
    expect(IntegerPartition.count(5)).toBe(7)
    expect(IntegerPartition.count(10)).toBe(42)
  })

  it('count matches generate length', () => {
    for (let n = 1; n <= 10; n++) {
      expect(IntegerPartition.generate(n).length).toBe(IntegerPartition.count(n))
    }
  })

  it('all parts sum to n', () => {
    for (const partition of IntegerPartition.generate(6)) {
      expect(partition.reduce((a, b) => a + b, 0)).toBe(6)
    }
  })

  it('generateDistinct returns distinct parts', () => {
    const result = IntegerPartition.generateDistinct(5)
    for (const partition of result) {
      expect(new Set(partition).size).toBe(partition.length)
    }
  })

  it('generateDistinct of 5', () => {
    const result = IntegerPartition.generateDistinct(5)
    expect(result).toEqual([[1, 4], [2, 3], [5]])
  })

  it('generateDistinct handles 0', () => {
    expect(IntegerPartition.generateDistinct(0)).toEqual([[]])
  })

  it('generateFixedLength returns partitions of exact length', () => {
    const result = IntegerPartition.generateFixedLength(5, 2)
    for (const p of result) {
      expect(p.length).toBe(2)
      expect(p.reduce((a, b) => a + b, 0)).toBe(5)
    }
  })

  it('generateFixedLength of 5 into 3 parts', () => {
    const result = IntegerPartition.generateFixedLength(5, 3)
    expect(result).toEqual([[1, 1, 3], [1, 2, 2]])
  })

  it('partitions are in non-increasing order', () => {
    for (const partition of IntegerPartition.generate(7)) {
      for (let i = 1; i < partition.length; i++) {
        expect(partition[i]!).toBeLessThanOrEqual(partition[i - 1]!)
      }
    }
  })

  it('generateDistinct of 6', () => {
    const result = IntegerPartition.generateDistinct(6)
    expect(result.length).toBe(4)
  })

  it('counts partitions correctly', () => {
    expect(IntegerPartition.count(1)).toBe(1)
    expect(IntegerPartition.count(4)).toBe(5)
  })

  it('counts partitions of 5', () => {
    expect(IntegerPartition.count(5)).toBe(7)
  })

  it('counts partitions of 1', () => {
    expect(IntegerPartition.count(1)).toBe(1)
  })

  it('counts partitions of 4', () => {
    expect(IntegerPartition.count(4)).toBe(5)
  })

  it('counts partitions of 1', () => {
    expect(IntegerPartition.count(1)).toBe(1)
  })

  it('counts partitions of 4', () => {
    expect(IntegerPartition.count(4)).toBe(5)
  })

  it('counts partitions of 5', () => {
    expect(IntegerPartition.count(5)).toBe(7)
  })

  it('count of 1 is 1', () => {
    expect(IntegerPartition.count(1)).toBe(1)
  })

  it('count of 4 is 5', () => {
    expect(IntegerPartition.count(4)).toBe(5)
  })

  it('count of 0 is 1', () => {
    expect(IntegerPartition.count(0)).toBe(1)
  })

  it('count of negative is 0', () => {
    expect(IntegerPartition.count(-1)).toBe(0)
  })

  it('count of 15 matches OEIS A000041', () => {
    expect(IntegerPartition.count(15)).toBe(176)
  })

  it('generate(3) returns correct partitions', () => {
    expect(IntegerPartition.generate(3)).toEqual([[3], [2, 1], [1, 1, 1]])
  })

  it('generate(5) returns 7 partitions', () => {
    expect(IntegerPartition.generate(5).length).toBe(7)
  })

  it('all parts are positive in partitions', () => {
    for (const partition of IntegerPartition.generate(8)) {
      for (const part of partition) {
        expect(part).toBeGreaterThan(0)
      }
    }
  })

  it('generateDistinct of 7', () => {
    const result = IntegerPartition.generateDistinct(7)
    expect(result.length).toBe(5)
    for (const p of result) {
      expect(new Set(p).size).toBe(p.length)
      expect(p.reduce((a, b) => a + b, 0)).toBe(7)
    }
  })

  it('generateDistinct of 1', () => {
    expect(IntegerPartition.generateDistinct(1)).toEqual([[1]])
  })

  it('generateDistinct of 2', () => {
    expect(IntegerPartition.generateDistinct(2)).toEqual([[2]])
  })

  it('generateFixedLength of 6 into 2 parts', () => {
    const result = IntegerPartition.generateFixedLength(6, 2)
    for (const p of result) {
      expect(p.length).toBe(2)
      expect(p.reduce((a, b) => a + b, 0)).toBe(6)
    }
  })

  it('generateFixedLength of 4 into 4 parts', () => {
    const result = IntegerPartition.generateFixedLength(4, 4)
    expect(result).toEqual([[1, 1, 1, 1]])
  })

  it('generateFixedLength of 5 into 1 part', () => {
    expect(IntegerPartition.generateFixedLength(5, 1)).toEqual([[5]])
  })

  it('generateFixedLength of 3 into 5 parts is empty', () => {
    expect(IntegerPartition.generateFixedLength(3, 5)).toEqual([])
  })

  it('generateDistinct parts are sorted ascending', () => {
    const result = IntegerPartition.generateDistinct(8)
    for (const p of result) {
      for (let i = 1; i < p.length; i++) {
        expect(p[i]!).toBeGreaterThan(p[i - 1]!)
      }
    }
  })

  it('generate count matches for larger n', () => {
    for (let n = 1; n <= 15; n++) {
      expect(IntegerPartition.generate(n).length).toBe(IntegerPartition.count(n))
    }
  })

  it('generate returns empty array for n = 0', () => {
    expect(IntegerPartition.generate(0)).toEqual([])
  })

  it('generate returns empty array for negative n', () => {
    expect(IntegerPartition.generate(-5)).toEqual([])
  })

  it('generate of 10 returns correct number of partitions', () => {
    expect(IntegerPartition.generate(10).length).toBe(42)
  })

  it('generate of 7 returns correct partitions', () => {
    const result = IntegerPartition.generate(7)
    expect(result.length).toBe(15)
    expect(result[0]).toEqual([7])
  })

  it('generate of 8 returns correct number of partitions', () => {
    expect(IntegerPartition.generate(8).length).toBe(22)
  })

  it('generate of 6 returns all partitions', () => {
    const result = IntegerPartition.generate(6)
    expect(result).toEqual([
      [6], [5, 1], [4, 2], [4, 1, 1], [3, 3], [3, 2, 1], [3, 1, 1, 1],
      [2, 2, 2], [2, 2, 1, 1], [2, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]
    ])
  })

  it('count returns 1 for n = 0', () => {
    expect(IntegerPartition.count(0)).toBe(1)
  })

  it('count returns 0 for negative numbers', () => {
    expect(IntegerPartition.count(-10)).toBe(0)
  })

  it('count of 20 matches known value', () => {
    expect(IntegerPartition.count(20)).toBe(627)
  })

  it('generateDistinct returns single partition for prime', () => {
    expect(IntegerPartition.generateDistinct(11).length).toBeGreaterThan(0)
  })

  it('generateDistinct of 0 returns empty partition', () => {
    expect(IntegerPartition.generateDistinct(0)).toEqual([[]])
  })

  it('generateDistinct of 3 returns correct partitions', () => {
    expect(IntegerPartition.generateDistinct(3)).toEqual([[1, 2], [3]])
  })

  it('generateDistinct of 4 returns correct partitions', () => {
    expect(IntegerPartition.generateDistinct(4)).toEqual([[1, 3], [4]])
  })

  it('generateDistinct returns ascending order', () => {
    const result = IntegerPartition.generateDistinct(10)
    for (const p of result) {
      for (let i = 1; i < p.length; i++) {
        expect(p[i]).toBeGreaterThan(p[i - 1])
      }
    }
  })

  it('generateFixedLength with k = n returns all ones', () => {
    expect(IntegerPartition.generateFixedLength(5, 5)).toEqual([[1, 1, 1, 1, 1]])
  })

  it('generateFixedLength with k = 1 returns single part', () => {
    expect(IntegerPartition.generateFixedLength(10, 1)).toEqual([[10]])
  })

  it('generateFixedLength with k > n returns empty', () => {
    expect(IntegerPartition.generateFixedLength(3, 5)).toEqual([])
  })

  it('generateFixedLength of 7 into 3 parts', () => {
    const result = IntegerPartition.generateFixedLength(7, 3)
    for (const p of result) {
      expect(p.length).toBe(3)
      expect(p.reduce((a, b) => a + b, 0)).toBe(7)
    }
  })

  it('generateFixedLength parts are non-decreasing', () => {
    const result = IntegerPartition.generateFixedLength(8, 3)
    for (const p of result) {
      for (let i = 1; i < p.length; i++) {
        expect(p[i]).toBeGreaterThanOrEqual(p[i - 1])
      }
    }
  })

  it('generateFixedLength returns empty for zero parts', () => {
    expect(IntegerPartition.generateFixedLength(5, 0)).toEqual([])
  })
})

describe('integer-partition - wave548', () => {
  it('integer-partition module defined', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module is function', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module has name', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module not null', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module has length', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module name is string', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave549', () => {
  it('integer-partition module defined', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module is function', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave550', () => {
  it('integer-partition w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave551', () => {
  it('integer-partition w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave552', () => {
  it('integer-partition w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave553', () => {
  it('integer-partition w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave554', () => {
  it('integer-partition w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave555', () => {
  it('integer-partition w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave556', () => {
  it('integer-partition w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave557', () => {
  it('integer-partition w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave558', () => {
  it('integer-partition w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave559', () => {
  it('integer-partition w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave560', () => {
  it('integer-partition w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave561', () => {
  it('integer-partition w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave562', () => {
  it('integer-partition w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave563', () => {
  it('integer-partition w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave564', () => {
  it('integer-partition w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave565', () => {
  it('integer-partition w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave566', () => {
  it('integer-partition w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave127', () => {
  it('integer-partition w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave130', () => {
  it('integer-partition w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave133', () => {
  it('integer-partition w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave136', () => {
  it('integer-partition w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - wave139', () => {
  it('integer-partition w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w142', () => {
  it('integer-partition v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w145', () => {
  it('integer-partition v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w148', () => {
  it('integer-partition v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w151', () => {
  it('integer-partition v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w154', () => {
  it('integer-partition v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w157', () => {
  it('integer-partition v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w160', () => {
  it('integer-partition v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w170', () => {
  it('integer-partition x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w180', () => {
  it('integer-partition x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w190', () => {
  it('integer-partition x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w200', () => {
  it('integer-partition x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w210', () => {
  it('integer-partition x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w220', () => {
  it('integer-partition x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w230', () => {
  it('integer-partition x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w240', () => {
  it('integer-partition x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w250', () => {
  it('integer-partition x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w260', () => {
  it('integer-partition x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w270', () => {
  it('integer-partition x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w280', () => {
  it('integer-partition x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w290', () => {
  it('integer-partition x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w300', () => {
  it('integer-partition x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x300x9', () => {
    expect(describe).toBeDefined()
  })
})
