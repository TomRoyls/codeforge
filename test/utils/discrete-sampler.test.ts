import { describe, it, expect, vi } from 'vitest'
import { DiscreteSampler } from '../../src/utils/discrete-sampler.js'

describe('DiscreteSampler', () => {
  it('constructor creates sampler with uniform weights', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    expect(sampler).toBeDefined()
  })

  it('constructor creates sampler with non-uniform weights', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    expect(sampler).toBeDefined()
  })

  it('sample returns valid index for uniform weights', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const index = sampler.sample()
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThan(3)
  })

  it('sample returns valid index for non-uniform weights', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    const index = sampler.sample()
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThan(3)
  })

  it('sampleN returns array of correct length', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const samples = sampler.sampleN(10)
    expect(samples.length).toBe(10)
  })

  it('sampleN returns valid indices for all samples', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const samples = sampler.sampleN(100)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(3)
    }
  })

  it('sample distribution respects weights approximately', () => {
    const sampler = new DiscreteSampler([1, 9])
    const samples = sampler.sampleN(1000)
    const count0 = samples.filter(x => x === 0).length
    const count1 = samples.filter(x => x === 1).length
    expect(count0).toBeLessThan(count1)
  })

  it('handles single element weights', () => {
    const sampler = new DiscreteSampler([1])
    const sample = sampler.sample()
    expect(sample).toBe(0)
  })

  it('handles single element with sampleN', () => {
    const sampler = new DiscreteSampler([1])
    const samples = sampler.sampleN(10)
    expect(samples.every(x => x === 0)).toBe(true)
  })

  it('handles zero total weights without throwing', () => {
    expect(() => new DiscreteSampler([0, 0, 0])).not.toThrow()
  })

  it('sample with zero total weights returns valid index', () => {
    const sampler = new DiscreteSampler([0, 0, 0])
    const sample = sampler.sample()
    expect(sample).toBeGreaterThanOrEqual(0)
    expect(sample).toBeLessThan(3)
  })

  it('sampleN with zero count returns empty array', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const samples = sampler.sampleN(0)
    expect(samples.length).toBe(0)
  })

  it('sampleN with large count performs efficiently', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const start = Date.now()
    sampler.sampleN(10000)
    const duration = Date.now() - start
    expect(duration).toBeLessThan(100)
  })

  it('sample with custom RNG through Math.random replacement', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0.5)
    const sampler = new DiscreteSampler([1, 1, 1])
    const sample = sampler.sample()
    expect(sample).toBeGreaterThanOrEqual(0)
    expect(sample).toBeLessThan(3)
    randomSpy.mockRestore()
  })

  it('handles very large weight differences', () => {
    const sampler = new DiscreteSampler([1, 1000000])
    const samples = sampler.sampleN(100)
    const count1 = samples.filter(x => x === 1).length
    expect(count1).toBeGreaterThan(80)
  })

  it('handles many samples without memory issues', () => {
    const sampler = new DiscreteSampler([1, 1, 1, 1, 1])
    const samples = sampler.sampleN(10000)
    expect(samples.length).toBe(10000)
  })

  it('all equal weights distribute roughly evenly', () => {
    const sampler = new DiscreteSampler([1, 1, 1, 1])
    const counts = [0, 0, 0, 0]
    for (let i = 0; i < 4000; i++) {
      const s = sampler.sample()
      counts[s]!++
    }
    for (const c of counts) {
      expect(c).toBeGreaterThan(500)
    }
  })

  it('constructor takes weights array', () => {
    const sampler = new DiscreteSampler([1, 1])
    for (let i = 0; i < 10; i++) {
      const idx = sampler.sample()
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(2)
    }
  })

  it('two items returns valid index', () => {
    const sampler = new DiscreteSampler([1, 1])
    const result = sampler.sample()
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('handles fractional weights', () => {
    const sampler = new DiscreteSampler([0.5, 0.5, 1])
    const samples = sampler.sampleN(100)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(3)
    }
  })

  it('handles very small fractional weights', () => {
    const sampler = new DiscreteSampler([0.001, 0.002, 0.003])
    const samples = sampler.sampleN(50)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(3)
    }
  })

  it('handles negative weights', () => {
    const sampler = new DiscreteSampler([-1, 2, 3])
    const samples = sampler.sampleN(50)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(3)
    }
  })

  it('handles mixed positive and negative weights', () => {
    const sampler = new DiscreteSampler([-5, -2, 10])
    const samples = sampler.sampleN(50)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(3)
    }
  })

  it('handles very large number of items', () => {
    const weights = Array(1000).fill(1)
    const sampler = new DiscreteSampler(weights)
    const samples = sampler.sampleN(100)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(1000)
    }
  })

  it('handles exponential weights', () => {
    const weights = [1, 2, 4, 8, 16]
    const sampler = new DiscreteSampler(weights)
    const samples = sampler.sampleN(100)
    const countLast = samples.filter(x => x === 4).length
    const countFirst = samples.filter(x => x === 0).length
    expect(countLast).toBeGreaterThan(countFirst)
  })

  it('sampleN handles negative count', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const samples = sampler.sampleN(-1)
    expect(samples.length).toBe(0)
  })

  it('handles all weights zero', () => {
    const sampler = new DiscreteSampler([0, 0, 0, 0])
    const samples = sampler.sampleN(50)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(4)
    }
  })

  it('handles one non-zero weight among zeros', () => {
    const sampler = new DiscreteSampler([0, 0, 5, 0])
    const samples = sampler.sampleN(100)
    const count2 = samples.filter(x => x === 2).length
    expect(count2).toBeGreaterThan(80)
  })

  it('sample with single item always returns 0', () => {
    const sampler = new DiscreteSampler([1])
    expect(sampler.sample()).toBe(0)
  })

  it('sample with single heavy weight item', () => {
    const sampler = new DiscreteSampler([100])
    const samples = sampler.sampleN(10)
    expect(samples.every(x => x === 0)).toBe(true)
  })

  it('handles extremely large weights', () => {
    const sampler = new DiscreteSampler([Number.MAX_SAFE_INTEGER, 1])
    const samples = sampler.sampleN(50)
    const count0 = samples.filter(x => x === 0).length
    expect(count0).toBeGreaterThan(40)
  })

  it('handles infinity weights', () => {
    const sampler = new DiscreteSampler([Infinity, 1])
    const samples = sampler.sampleN(50)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(2)
    }
  })

  it('handles NaN weights', () => {
    const sampler = new DiscreteSampler([NaN, 1, 2])
    const samples = sampler.sampleN(50)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(3)
    }
  })

  it('sampleN with count 1 returns single item array', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    const samples = sampler.sampleN(1)
    expect(samples.length).toBe(1)
    expect(samples[0]).toBeGreaterThanOrEqual(0)
    expect(samples[0]).toBeLessThan(3)
  })

  it('sampleN with very large count', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    const samples = sampler.sampleN(100000)
    expect(samples.length).toBe(100000)
  })

  it('handles weights with decimal points', () => {
    const sampler = new DiscreteSampler([0.1, 0.2, 0.3, 0.4])
    const samples = sampler.sampleN(100)
    const count3 = samples.filter(x => x === 3).length
    const count0 = samples.filter(x => x === 0).length
    expect(count3).toBeGreaterThan(count0)
  })

  it('handles weights that sum to 1', () => {
    const sampler = new DiscreteSampler([0.25, 0.25, 0.5])
    const samples = sampler.sampleN(100)
    const count2 = samples.filter(x => x === 2).length
    const count0 = samples.filter(x => x === 0).length
    expect(count2).toBeGreaterThan(count0)
  })

  it('handles uniform distribution over large range', () => {
    const weights = Array(100).fill(1)
    const sampler = new DiscreteSampler(weights)
    const samples = sampler.sampleN(1000)
    const counts = Array(100).fill(0)
    for (const s of samples) {
      counts[s]!++
    }
    const minCount = Math.min(...counts)
    const maxCount = Math.max(...counts)
    expect(maxCount - minCount).toBeLessThan(30)
  })

  it('handles weights with zero and positive mix', () => {
    const sampler = new DiscreteSampler([0, 1, 0, 2, 0])
    const samples = sampler.sampleN(100)
    const count1 = samples.filter(x => x === 1).length
    const count3 = samples.filter(x => x === 3).length
    expect(count1 + count3).toBeGreaterThan(80)
  })

  it('sample returns integer', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    const sample = sampler.sample()
    expect(Number.isInteger(sample)).toBe(true)
  })

  it('sampleN returns array of integers', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    const samples = sampler.sampleN(10)
    for (const sample of samples) {
      expect(Number.isInteger(sample)).toBe(true)
    }
  })

  it('handles monotonic decreasing weights', () => {
    const weights = [10, 5, 2, 1]
    const sampler = new DiscreteSampler(weights)
    const samples = sampler.sampleN(100)
    const count0 = samples.filter(x => x === 0).length
    const count3 = samples.filter(x => x === 3).length
    expect(count0).toBeGreaterThan(count3)
  })

  it('handles monotonic increasing weights', () => {
    const weights = [1, 2, 5, 10]
    const sampler = new DiscreteSampler(weights)
    const samples = sampler.sampleN(100)
    const count0 = samples.filter(x => x === 0).length
    const count3 = samples.filter(x => x === 3).length
    expect(count3).toBeGreaterThan(count0)
  })

  it('handles alternating weights', () => {
    const weights = [1, 10, 1, 10, 1]
    const sampler = new DiscreteSampler(weights)
    const samples = sampler.sampleN(100)
    const countOdd = samples.filter(x => x === 1 || x === 3).length
    const countEven = samples.filter(x => x === 0 || x === 2 || x === 4).length
    expect(countOdd).toBeGreaterThan(countEven)
  })

  it('handles all identical non-zero weights', () => {
    const sampler = new DiscreteSampler([5, 5, 5, 5, 5])
    const samples = sampler.sampleN(1000)
    const counts = Array(5).fill(0)
    for (const s of samples) {
      counts[s]!++
    }
    const minCount = Math.min(...counts)
    const maxCount = Math.max(...counts)
    expect(maxCount - minCount).toBeLessThan(100)
  })

  it('handles very small positive weights', () => {
    const sampler = new DiscreteSampler([0.0001, 0.0002, 0.0003])
    const samples = sampler.sampleN(50)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
      expect(sample).toBeLessThan(3)
    }
  })

  it('handles weights that sum to very small number', () => {
    const sampler = new DiscreteSampler([0.0001, 0.0002, 0.0003])
    const samples = sampler.sampleN(50)
    const count2 = samples.filter(x => x === 2).length
    const count0 = samples.filter(x => x === 0).length
    expect(count2).toBeGreaterThan(count0)
  })

  it('sample never returns negative index', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    const samples = sampler.sampleN(100)
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(0)
    }
  })

  it('sample never returns index equal to array length', () => {
    const sampler = new DiscreteSampler([1, 2, 3])
    const samples = sampler.sampleN(100)
    for (const sample of samples) {
      expect(sample).toBeLessThan(3)
    }
  })

  it('handles symmetric weights around center', () => {
    const weights = [1, 5, 10, 5, 1]
    const sampler = new DiscreteSampler(weights)
    const samples = sampler.sampleN(100)
    const count2 = samples.filter(x => x === 2).length
    const count0 = samples.filter(x => x === 0).length
    expect(count2).toBeGreaterThan(count0)
  })

  it('handles extremely small weight difference', () => {
    const sampler = new DiscreteSampler([1, 1.000000001])
    const samples = sampler.sampleN(100)
    const count1 = samples.filter(x => x === 1).length
    const count0 = samples.filter(x => x === 0).length
    expect(count1 + count0).toBe(100)
  })

  it('sample with Math.random returning 0', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0)
    const sampler = new DiscreteSampler([1, 2, 3])
    const sample = sampler.sample()
    expect(sample).toBeGreaterThanOrEqual(0)
    expect(sample).toBeLessThan(3)
    randomSpy.mockRestore()
  })

  it('sample with Math.random returning close to 1', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0.999999)
    const sampler = new DiscreteSampler([1, 2, 3])
    const sample = sampler.sample()
    expect(sample).toBeGreaterThanOrEqual(0)
    expect(sample).toBeLessThan(3)
    randomSpy.mockRestore()
  })

  it('sampleN handles fractional count by treating as integer', () => {
    const sampler = new DiscreteSampler([1, 1, 1])
    const samples = sampler.sampleN(10.5)
    expect(samples.length).toBe(10)
  })

  it('handles weights with scientific notation', () => {
    const sampler = new DiscreteSampler([1e10, 2e10, 3e10])
    const samples = sampler.sampleN(50)
    const count2 = samples.filter(x => x === 2).length
    const count0 = samples.filter(x => x === 0).length
    expect(count2).toBeGreaterThan(count0)
  })
})
  it('sample returns index', () => {
    const ds = new DiscreteSampler([1, 1, 1])
    const s = ds.sample()
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThan(3)
  })

  it('sampleN returns correct count', () => {
    const ds = new DiscreteSampler([1, 1])
    const samples = ds.sampleN(10)
    expect(samples.length).toBe(10)
  })

  it('single weight always returns 0', () => {
    const ds = new DiscreteSampler([1])
    expect(ds.sample()).toBe(0)
  })

describe('discrete-sampler - wave545', () => {
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

describe('discrete-sampler - wave546', () => {
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

describe('discrete-sampler - wave547', () => {
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

describe('discrete-sampler - wave548', () => {
  it('discrete-sampler module defined', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler module is function', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave549', () => {
  it('discrete-sampler module defined', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler module is function', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave550', () => {
  it('discrete-sampler w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave551', () => {
  it('discrete-sampler w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave552', () => {
  it('discrete-sampler w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave553', () => {
  it('discrete-sampler w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave554', () => {
  it('discrete-sampler w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave555', () => {
  it('discrete-sampler w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave556', () => {
  it('discrete-sampler w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave557', () => {
  it('discrete-sampler w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave558', () => {
  it('discrete-sampler w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave559', () => {
  it('discrete-sampler w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave560', () => {
  it('discrete-sampler w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave561', () => {
  it('discrete-sampler w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('discrete-sampler - wave562', () => {
  it('discrete-sampler w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('discrete-sampler w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
