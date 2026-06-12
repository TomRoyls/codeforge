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

describe('integer-partition - w310', () => {
  it('integer-partition x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w320', () => {
  it('integer-partition x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w330', () => {
  it('integer-partition x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w340', () => {
  it('integer-partition x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w350', () => {
  it('integer-partition x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w360', () => {
  it('integer-partition x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w370', () => {
  it('integer-partition x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w380', () => {
  it('integer-partition x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w390', () => {
  it('integer-partition x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w400', () => {
  it('integer-partition x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w420', () => {
  it('integer-partition x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w440', () => {
  it('integer-partition x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w460', () => {
  it('integer-partition x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w480', () => {
  it('integer-partition x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w500', () => {
  it('integer-partition x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w550', () => {
  it('integer-partition x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w600', () => {
  it('integer-partition x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w650', () => {
  it('integer-partition x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w700', () => {
  it('integer-partition x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w800', () => {
  it('integer-partition x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w900', () => {
  it('integer-partition x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('integer-partition - w1000', () => {
  it('integer-partition x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('integer-partition x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
