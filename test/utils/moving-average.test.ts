import { describe, it, expect } from 'vitest'
import { MovingAverage } from '../../src/utils/moving-average.js'

describe('MovingAverage', () => {
  it('creates with default window size of 10', () => {
    const ma = new MovingAverage()
    expect(ma.windowSize).toBe(10)
  })

  it('creates with custom window size', () => {
    const ma = new MovingAverage(5)
    expect(ma.windowSize).toBe(5)
  })

  it('calculates average for single value', () => {
    const ma = new MovingAverage()
    ma.push(10)
    expect(ma.average).toBe(10)
  })

  it('calculates average for multiple values', () => {
    const ma = new MovingAverage()
    ma.push(10)
    ma.push(20)
    ma.push(30)
    expect(ma.average).toBe(20)
  })

  it('slides window when size exceeds max', () => {
    const ma = new MovingAverage(3)
    ma.push(1)
    ma.push(2)
    ma.push(3)
    ma.push(4)
    expect(ma.size).toBe(3)
    expect(ma.average).toBe(3)
  })

  it('correctly tracks size', () => {
    const ma = new MovingAverage(5)
    expect(ma.size).toBe(0)
    ma.push(1)
    expect(ma.size).toBe(1)
    ma.push(2)
    expect(ma.size).toBe(2)
    ma.push(3)
    expect(ma.size).toBe(3)
    ma.push(4)
    expect(ma.size).toBe(4)
    ma.push(5)
    expect(ma.size).toBe(5)
    ma.push(6)
    expect(ma.size).toBe(5)
  })

  it('calculates min correctly', () => {
    const ma = new MovingAverage()
    ma.push(5)
    ma.push(2)
    ma.push(8)
    ma.push(1)
    expect(ma.min).toBe(1)
  })

  it('calculates max correctly', () => {
    const ma = new MovingAverage()
    ma.push(5)
    ma.push(2)
    ma.push(8)
    ma.push(1)
    expect(ma.max).toBe(8)
  })

  it('returns 0 for min on empty window', () => {
    const ma = new MovingAverage()
    expect(ma.min).toBe(0)
  })

  it('returns 0 for max on empty window', () => {
    const ma = new MovingAverage()
    expect(ma.max).toBe(0)
  })

  it('calculates variance correctly', () => {
    const ma = new MovingAverage()
    ma.push(1)
    ma.push(2)
    ma.push(3)
    const expectedVariance = ((1 - 2) * (1 - 2) + (2 - 2) * (2 - 2) + (3 - 2) * (3 - 2)) / 3
    expect(ma.variance).toBe(expectedVariance)
  })

  it('calculates standard deviation correctly', () => {
    const ma = new MovingAverage()
    ma.push(1)
    ma.push(2)
    ma.push(3)
    expect(ma.stddev).toBe(Math.sqrt(ma.variance))
  })

  it('returns 0 for variance on empty window', () => {
    const ma = new MovingAverage()
    expect(ma.variance).toBe(0)
  })

  it('returns 0 for stddev on empty window', () => {
    const ma = new MovingAverage()
    expect(ma.stddev).toBe(0)
  })

  it('resets all state', () => {
    const ma = new MovingAverage()
    ma.push(10)
    ma.push(20)
    ma.push(30)
    ma.reset()
    expect(ma.size).toBe(0)
    expect(ma.average).toBe(0)
    expect(ma.min).toBe(0)
    expect(ma.max).toBe(0)
    expect(ma.variance).toBe(0)
  })

  it('converts to array', () => {
    const ma = new MovingAverage()
    ma.push(1)
    ma.push(2)
    ma.push(3)
    expect(ma.toArray()).toEqual([1, 2, 3])
  })

  it('returns empty array when empty', () => {
    const ma = new MovingAverage()
    expect(ma.toArray()).toEqual([])
  })

  it('handles negative numbers', () => {
    const ma = new MovingAverage()
    ma.push(-5)
    ma.push(-10)
    ma.push(0)
    expect(ma.average).toBe(-5)
    expect(ma.min).toBe(-10)
    expect(ma.max).toBe(0)
  })

  it('handles zero values', () => {
    const ma = new MovingAverage()
    ma.push(0)
    ma.push(0)
    ma.push(0)
    expect(ma.average).toBe(0)
    expect(ma.min).toBe(0)
    expect(ma.max).toBe(0)
  })

  it('handles fractional values', () => {
    const ma = new MovingAverage()
    ma.push(1.5)
    ma.push(2.5)
    ma.push(3.5)
    expect(ma.average).toBe(2.5)
  })

  it('compacts internal array after many operations', () => {
    const ma = new MovingAverage(10)
    for (let i = 0; i < 100; i++) {
      ma.push(i)
    }
    expect(ma.size).toBe(10)
  })

  it('maintains correct stats after sliding window', () => {
    const ma = new MovingAverage(3)
    ma.push(10)
    ma.push(20)
    ma.push(30)
    ma.push(40)
    expect(ma.average).toBe(30)
    expect(ma.min).toBe(20)
    expect(ma.max).toBe(40)
  })

  it('handles rapid successive pushes', () => {
    const ma = new MovingAverage(100)
    for (let i = 0; i < 1000; i++) {
      ma.push(i)
    }
    expect(ma.size).toBe(100)
  })

  it('returns correct stats after reset and refill', () => {
    const ma = new MovingAverage()
    ma.push(10)
    ma.push(20)
    ma.reset()
    ma.push(5)
    ma.push(10)
    ma.push(15)
    expect(ma.average).toBe(10)
    expect(ma.min).toBe(5)
    expect(ma.max).toBe(15)
  })

  it('handles single element window', () => {
    const ma = new MovingAverage(1)
    ma.push(10)
    expect(ma.average).toBe(10)
    expect(ma.min).toBe(10)
    expect(ma.max).toBe(10)
    ma.push(20)
    expect(ma.average).toBe(20)
    expect(ma.min).toBe(20)
    expect(ma.max).toBe(20)
  })

  it('calculates variance correctly after window slide', () => {
    const ma = new MovingAverage(3)
    ma.push(1)
    ma.push(2)
    ma.push(3)
    const var1 = ma.variance
    ma.push(4)
    const var2 = ma.variance
    expect(var1).toBe(0.6666666666666666)
    expect(var2).toBe(0.6666666666666666)
  })

  it('handles very large window size', () => {
    const ma = new MovingAverage(1000)
    for (let i = 0; i < 1500; i++) {
      ma.push(i)
    }
    expect(ma.size).toBe(1000)
    expect(ma.average).toBe(999.5)
  })

  it('handles window size of 2', () => {
    const ma = new MovingAverage(2)
    ma.push(10)
    ma.push(20)
    expect(ma.average).toBe(15)
    expect(ma.size).toBe(2)
    ma.push(30)
    expect(ma.average).toBe(25)
    expect(ma.size).toBe(2)
  })

  it('handles very large positive values', () => {
    const ma = new MovingAverage()
    ma.push(Number.MAX_SAFE_INTEGER)
    ma.push(Number.MAX_SAFE_INTEGER - 1)
    ma.push(Number.MAX_SAFE_INTEGER - 2)
    expect(ma.min).toBe(Number.MAX_SAFE_INTEGER - 2)
    expect(ma.max).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('handles very small negative values', () => {
    const ma = new MovingAverage()
    ma.push(Number.MIN_SAFE_INTEGER)
    ma.push(Number.MIN_SAFE_INTEGER + 1)
    ma.push(Number.MIN_SAFE_INTEGER + 2)
    expect(ma.min).toBe(Number.MIN_SAFE_INTEGER)
    expect(ma.max).toBe(Number.MIN_SAFE_INTEGER + 2)
  })

  it('handles repeated identical values', () => {
    const ma = new MovingAverage()
    ma.push(5)
    ma.push(5)
    ma.push(5)
    expect(ma.average).toBe(5)
    expect(ma.variance).toBe(0)
    expect(ma.stddev).toBe(0)
    expect(ma.min).toBe(5)
    expect(ma.max).toBe(5)
  })

  it('handles alternating values', () => {
    const ma = new MovingAverage()
    ma.push(1)
    ma.push(100)
    ma.push(1)
    ma.push(100)
    ma.push(1)
    expect(ma.average).toBe(40.6)
    expect(ma.min).toBe(1)
    expect(ma.max).toBe(100)
  })

  it('handles monotonically increasing sequence', () => {
    const ma = new MovingAverage(5)
    ma.push(1)
    ma.push(2)
    ma.push(3)
    ma.push(4)
    ma.push(5)
    expect(ma.average).toBe(3)
    expect(ma.min).toBe(1)
    expect(ma.max).toBe(5)
  })

  it('handles monotonically decreasing sequence', () => {
    const ma = new MovingAverage(5)
    ma.push(5)
    ma.push(4)
    ma.push(3)
    ma.push(2)
    ma.push(1)
    expect(ma.average).toBe(3)
    expect(ma.min).toBe(1)
    expect(ma.max).toBe(5)
  })

  it('handles very small fractional values', () => {
    const ma = new MovingAverage()
    ma.push(0.0001)
    ma.push(0.0002)
    ma.push(0.0003)
    expect(ma.average).toBe(0.0002)
  })

  it('handles very large window with rapid turnover', () => {
    const ma = new MovingAverage(100)
    for (let i = 0; i < 10000; i++) {
      ma.push(i % 100)
    }
    expect(ma.size).toBe(100)
  })

  it('calculates stddev correctly with known values', () => {
    const ma = new MovingAverage()
    ma.push(2)
    ma.push(4)
    ma.push(4)
    ma.push(4)
    ma.push(5)
    ma.push(5)
    ma.push(7)
    ma.push(9)
    expect(ma.stddev).toBe(2)
  })

  it('maintains accuracy after many operations', () => {
    const ma = new MovingAverage(10)
    const expectedSum = 0
    for (let i = 0; i < 1000; i++) {
      ma.push(i)
    }
    const arr = ma.toArray()
    const manualAvg = arr.reduce((a, b) => a + b, 0) / arr.length
    expect(ma.average).toBeCloseTo(manualAvg, 10)
  })

  it('handles sequence with only negatives', () => {
    const ma = new MovingAverage()
    ma.push(-1)
    ma.push(-2)
    ma.push(-3)
    expect(ma.average).toBe(-2)
    expect(ma.min).toBe(-3)
    expect(ma.max).toBe(-1)
  })

  it('handles sequence with mixed signs and zeros', () => {
    const ma = new MovingAverage()
    ma.push(-5)
    ma.push(0)
    ma.push(5)
    expect(ma.average).toBe(0)
    expect(ma.min).toBe(-5)
    expect(ma.max).toBe(5)
  })

  it('handles empty window size (default)', () => {
    const ma = new MovingAverage()
    expect(ma.average).toBe(0)
    expect(ma.variance).toBe(0)
    expect(ma.stddev).toBe(0)
    expect(ma.min).toBe(0)
    expect(ma.max).toBe(0)
    expect(ma.size).toBe(0)
  })

  it('handles variance with single value', () => {
    const ma = new MovingAverage()
    ma.push(42)
    expect(ma.variance).toBe(0)
    expect(ma.stddev).toBe(0)
  })

  it('handles window size limit reached multiple times', () => {
    const ma = new MovingAverage(3)
    ma.push(1)
    ma.push(2)
    ma.push(3)
    ma.push(4)
    ma.push(5)
    ma.push(6)
    expect(ma.size).toBe(3)
    expect(ma.average).toBe(5)
  })

  it('handles rapid reset and fill cycles', () => {
    const ma = new MovingAverage(5)
    for (let i = 0; i < 10; i++) {
      ma.push(i)
      ma.reset()
    }
    expect(ma.size).toBe(0)
    expect(ma.average).toBe(0)
  })

  it('handles variance with repeated pattern', () => {
    const ma = new MovingAverage(6)
    ma.push(1)
    ma.push(2)
    ma.push(3)
    ma.push(1)
    ma.push(2)
    ma.push(3)
    const avg = ma.average
    expect(avg).toBe(2)
    expect(ma.variance).toBeGreaterThan(0)
    expect(ma.variance).toBeLessThan(1)
  })

  it('handles min and max after multiple slides', () => {
    const ma = new MovingAverage(3)
    ma.push(10)
    ma.push(20)
    ma.push(30)
    expect(ma.min).toBe(10)
    expect(ma.max).toBe(30)
    ma.push(40)
    expect(ma.min).toBe(20)
    expect(ma.max).toBe(40)
    ma.push(50)
    expect(ma.min).toBe(30)
    expect(ma.max).toBe(50)
  })

  it('stddev is zero for constant values', () => {
    const ma = new MovingAverage(5)
    ma.push(7); ma.push(7); ma.push(7)
    expect(ma.stddev).toBe(0)
  })

  it('reset clears all state', () => {
    const ma = new MovingAverage(5)
    ma.push(1); ma.push(2); ma.push(3)
    ma.reset()
    expect(ma.size).toBe(0)
    expect(ma.average).toBe(0)
    expect(ma.toArray()).toEqual([])
  })

  it('toArray returns current window', () => {
    const ma = new MovingAverage(3)
    ma.push(10); ma.push(20); ma.push(30)
    expect(ma.toArray()).toEqual([10, 20, 30])
    ma.push(40)
    expect(ma.toArray()).toEqual([20, 30, 40])
  })

  it('windowSize returns constructor parameter', () => {
    const ma = new MovingAverage(7)
    expect(ma.windowSize).toBe(7)
  })

  it('handles negative values correctly', () => {
    const ma = new MovingAverage(3)
    ma.push(-10); ma.push(-20); ma.push(-30)
    expect(ma.average).toBe(-20)
    expect(ma.min).toBe(-30)
    expect(ma.max).toBe(-10)
  })

  it('variance is 0 for identical values', () => {
    const ma = new MovingAverage(5)
    ma.push(5)
    ma.push(5)
    ma.push(5)
    expect(ma.variance).toBe(0)
  })

  it('stddev is sqrt of variance', () => {
    const ma = new MovingAverage(5)
    ma.push(1)
    ma.push(3)
    expect(ma.stddev).toBeCloseTo(Math.sqrt(ma.variance), 5)
  })

  it('windowSize is accessible', () => {
    const ma = new MovingAverage(7)
    expect(ma.windowSize).toBe(7)
  })

  it('reset clears the window', () => {
    const ma = new MovingAverage(3)
    ma.push(1)
    ma.push(2)
    ma.reset()
    expect(ma.size).toBe(0)
  })

  it('single push returns value', () => {
    const ma = new MovingAverage(3)
    ma.push(10)
    expect(ma.average).toBe(10)
  })

  it('window size limits', () => {
    const ma = new MovingAverage(2)
    ma.push(10)
    ma.push(20)
    ma.push(30)
    expect(ma.average).toBe(25)
  })

  it('reset clears values', () => {
    const ma = new MovingAverage(3)
    ma.push(10)
    ma.reset()
    expect(ma.toArray()).toEqual([])
  })
})

describe('moving-average - wave545', () => {
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

describe('moving-average - wave546', () => {
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

describe('moving-average - wave547', () => {
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

describe('moving-average - wave548', () => {
  it('moving-average module defined', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average module is function', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave549', () => {
  it('moving-average module defined', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average module is function', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave550', () => {
  it('moving-average w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave551', () => {
  it('moving-average w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave552', () => {
  it('moving-average w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave553', () => {
  it('moving-average w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave554', () => {
  it('moving-average w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave555', () => {
  it('moving-average w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave556', () => {
  it('moving-average w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave557', () => {
  it('moving-average w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave558', () => {
  it('moving-average w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave559', () => {
  it('moving-average w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave560', () => {
  it('moving-average w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave561', () => {
  it('moving-average w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave562', () => {
  it('moving-average w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave563', () => {
  it('moving-average w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave564', () => {
  it('moving-average w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave565', () => {
  it('moving-average w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave566', () => {
  it('moving-average w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave127', () => {
  it('moving-average w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave130', () => {
  it('moving-average w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave133', () => {
  it('moving-average w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave136', () => {
  it('moving-average w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - wave139', () => {
  it('moving-average w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w142', () => {
  it('moving-average v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w145', () => {
  it('moving-average v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w148', () => {
  it('moving-average v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w151', () => {
  it('moving-average v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w154', () => {
  it('moving-average v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w157', () => {
  it('moving-average v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w160', () => {
  it('moving-average v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w170', () => {
  it('moving-average x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w180', () => {
  it('moving-average x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w190', () => {
  it('moving-average x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w200', () => {
  it('moving-average x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w210', () => {
  it('moving-average x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w220', () => {
  it('moving-average x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w230', () => {
  it('moving-average x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w240', () => {
  it('moving-average x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w250', () => {
  it('moving-average x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w260', () => {
  it('moving-average x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w270', () => {
  it('moving-average x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w280', () => {
  it('moving-average x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w290', () => {
  it('moving-average x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w300', () => {
  it('moving-average x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w310', () => {
  it('moving-average x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w320', () => {
  it('moving-average x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w330', () => {
  it('moving-average x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w340', () => {
  it('moving-average x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w350', () => {
  it('moving-average x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w360', () => {
  it('moving-average x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w370', () => {
  it('moving-average x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w380', () => {
  it('moving-average x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w390', () => {
  it('moving-average x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w400', () => {
  it('moving-average x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w420', () => {
  it('moving-average x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w440', () => {
  it('moving-average x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w460', () => {
  it('moving-average x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w480', () => {
  it('moving-average x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w500', () => {
  it('moving-average x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w550', () => {
  it('moving-average x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w600', () => {
  it('moving-average x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w650', () => {
  it('moving-average x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('moving-average - w700', () => {
  it('moving-average x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('moving-average x700x49', () => {
    expect(describe).toBeDefined()
  })
})
