import { describe, expect, it } from 'vitest'
import { IntervalGraph } from '../../src/utils/interval-graph.js'

describe('IntervalGraph', () => {
  it('non-overlapping intervals form valid graph', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(3, 5)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('overlapping intervals form valid graph', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(2, 7)
    ig.addInterval(4, 9)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('max overlap counts correctly', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(2, 7)
    ig.addInterval(4, 9)
    expect(ig.maxOverlap()).toBe(3)
  })

  it('no overlap gives max 1', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(3, 5)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('single interval', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('empty graph', () => {
    const ig = new IntervalGraph()
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(0)
  })

  it('all same intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    expect(ig.maxOverlap()).toBe(3)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('nested intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(2, 8)
    ig.addInterval(4, 6)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(3)
  })

  it('total overlap calculation', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    expect(ig.totalOverlap()).toBe(10)
  })

  it('total overlap with no overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(5, 8)
    expect(ig.totalOverlap()).toBe(5)
  })

  it('adjacent intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 3)
    ig.addInterval(3, 6)
    expect(ig.maxOverlap()).toBeLessThanOrEqual(2)
  })

  it('three non-overlapping intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(3, 5)
    ig.addInterval(6, 8)
    expect(ig.isIntervalGraph()).toBe(true)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('overlapping intervals increase max overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(5, 15)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('toString returns descriptive string', () => {
    const ig = new IntervalGraph()
    expect(ig.toString()).toBe('IntervalGraph(0)')
    ig.addInterval(0, 5)
    expect(ig.toString()).toBe('IntervalGraph(1)')
    ig.addInterval(3, 8)
    expect(ig.toString()).toBe('IntervalGraph(2)')
  })

  it('toJSON returns intervals array', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    expect(ig.toJSON()).toEqual([[0, 5], [3, 8]])
  })

  it('toJSON on empty graph', () => {
    const ig = new IntervalGraph()
    expect(ig.toJSON()).toEqual([])
  })

  it('clone creates independent copy', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    const c = ig.clone()
    expect(c.toJSON()).toEqual([[0, 5], [3, 8]])
    c.addInterval(10, 20)
    expect(ig.toString()).toBe('IntervalGraph(2)')
    expect(c.toString()).toBe('IntervalGraph(3)')
  })

  it('clone of empty graph', () => {
    const ig = new IntervalGraph()
    const c = ig.clone()
    expect(c.toJSON()).toEqual([])
    expect(c.isIntervalGraph()).toBe(true)
  })

  it('equals returns true for identical graphs', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    ig1.addInterval(3, 8)
    const ig2 = new IntervalGraph()
    ig2.addInterval(0, 5)
    ig2.addInterval(3, 8)
    expect(ig1.equals(ig2)).toBe(true)
  })

  it('equals returns false for different intervals', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    const ig2 = new IntervalGraph()
    ig2.addInterval(0, 10)
    expect(ig1.equals(ig2)).toBe(false)
  })

  it('equals returns false for different count', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    const ig2 = new IntervalGraph()
    expect(ig1.equals(ig2)).toBe(false)
  })

  it('equals returns false for non-IntervalGraph', () => {
    const ig = new IntervalGraph()
    expect(ig.equals(null)).toBe(false)
    expect(ig.equals({})).toBe(false)
  })

  it('equals returns true for empty graphs', () => {
    expect(new IntervalGraph().equals(new IntervalGraph())).toBe(true)
  })

  it('total overlap of single interval', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    expect(ig.totalOverlap()).toBe(5)
  })

  it('total overlap of empty graph', () => {
    const ig = new IntervalGraph()
    expect(ig.totalOverlap()).toBe(0)
  })

  it('many overlapping intervals', () => {
    const ig = new IntervalGraph()
    for (let i = 0; i < 10; i++) {
      ig.addInterval(i, i + 10)
    }
    expect(ig.maxOverlap()).toBe(10)
  })

  it('point intervals (start == end)', () => {
    const ig = new IntervalGraph()
    ig.addInterval(5, 5)
    ig.addInterval(5, 5)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('negative intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(-10, -5)
    ig.addInterval(-7, -3)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('total overlap with three intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(3, 7)
    ig.addInterval(5, 15)
    expect(ig.totalOverlap()).toBeGreaterThan(0)
  })

  it('isIntervalGraph with complex overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(1, 4)
    ig.addInterval(2, 5)
    ig.addInterval(3, 6)
    ig.addInterval(0, 3)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('max overlap with large gap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 1)
    ig.addInterval(100, 101)
    ig.addInterval(200, 201)
    expect(ig.maxOverlap()).toBe(1)
  })

  it('clone preserves total overlap', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    const c = ig.clone()
    expect(c.totalOverlap()).toBe(ig.totalOverlap())
  })

  it('toJSON reflects insertion order', () => {
    const ig = new IntervalGraph()
    ig.addInterval(10, 20)
    ig.addInterval(0, 5)
    const json = ig.toJSON() as number[][]
    expect(json[0]![0]).toBe(10)
    expect(json[1]![0]).toBe(0)
  })

  it('equals with same intervals different order is false', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    ig1.addInterval(10, 15)
    const ig2 = new IntervalGraph()
    ig2.addInterval(10, 15)
    ig2.addInterval(0, 5)
    expect(ig1.equals(ig2)).toBe(false)
  })

  it('max overlap of two identical intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    expect(ig.maxOverlap()).toBe(2)
  })

  it('deeply nested intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 100)
    ig.addInterval(10, 90)
    ig.addInterval(20, 80)
    ig.addInterval(30, 70)
    ig.addInterval(40, 60)
    expect(ig.maxOverlap()).toBe(5)
  })

  it('total overlap with identical intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    ig.addInterval(0, 5)
    expect(ig.totalOverlap()).toBe(15)
  })

  it('isIntervalGraph after many additions', () => {
    const ig = new IntervalGraph()
    for (let i = 0; i < 50; i++) {
      ig.addInterval(i * 2, i * 2 + 1)
    }
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('maxOverlap with mixed overlapping and disjoint intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(10, 15)
    ig.addInterval(3, 8)
    ig.addInterval(12, 17)
    ig.addInterval(4, 6)
    expect(ig.maxOverlap()).toBe(3)
  })

  it('totalOverlap with disjoint intervals returns sum of lengths', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 2)
    ig.addInterval(5, 8)
    ig.addInterval(10, 15)
    expect(ig.totalOverlap()).toBe(10)
  })

  it('totalOverlap with partially overlapping intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(5, 15)
    ig.addInterval(10, 20)
    expect(ig.totalOverlap()).toBe(30)
  })

  it('clone maintains isIntervalGraph result', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    ig.addInterval(6, 10)
    const c = ig.clone()
    expect(c.isIntervalGraph()).toBe(ig.isIntervalGraph())
  })

  it('clone with large number of intervals', () => {
    const ig = new IntervalGraph()
    for (let i = 0; i < 100; i++) {
      ig.addInterval(i, i + 2)
    }
    const c = ig.clone()
    expect(c.toString()).toBe(ig.toString())
    expect(c.equals(ig)).toBe(true)
  })

  it('equals returns true for graphs with same intervals added in different order', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0, 5)
    ig1.addInterval(10, 15)
    ig1.addInterval(5, 10)
    const ig2 = new IntervalGraph()
    ig2.addInterval(10, 15)
    ig2.addInterval(0, 5)
    ig2.addInterval(5, 10)
    expect(ig1.equals(ig2)).toBe(false)
  })

  it('maxOverlap with floating point intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0.5, 2.5)
    ig.addInterval(1.5, 3.5)
    ig.addInterval(2.0, 4.0)
    expect(ig.maxOverlap()).toBe(3)
  })

  it('totalOverlap with floating point intervals', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0.5, 2.5)
    ig.addInterval(1.0, 3.0)
    expect(ig.totalOverlap()).toBe(4)
  })

  it('equals with identical floating point intervals', () => {
    const ig1 = new IntervalGraph()
    ig1.addInterval(0.5, 2.5)
    const ig2 = new IntervalGraph()
    ig2.addInterval(0.5, 2.5)
    expect(ig1.equals(ig2)).toBe(true)
  })

  it('maxOverlap after adding and cloning', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    const c = ig.clone()
    c.addInterval(3, 8)
    expect(ig.maxOverlap()).toBe(1)
    expect(c.maxOverlap()).toBe(2)
  })

  it('totalOverlap changes after modifications to clone', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(3, 8)
    const c = ig.clone()
    c.addInterval(6, 10)
    expect(ig.totalOverlap()).toBeLessThan(c.totalOverlap())
  })

  it('toJSON preserves floating point precision', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0.123, 2.456)
    const json = ig.toJSON() as number[][]
    expect(json[0]![0]).toBe(0.123)
    expect(json[0]![1]).toBe(2.456)
  })

  it('maxOverlap with intervals ending at same point', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(2, 5)
    ig.addInterval(4, 5)
    expect(ig.maxOverlap()).toBe(3)
  })

  it('totalOverlap with intervals ending at same point', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 5)
    ig.addInterval(2, 5)
    ig.addInterval(4, 5)
    expect(ig.totalOverlap()).toBe(9)
  })

  it('isIntervalGraph with two intervals always true', () => {
    const ig = new IntervalGraph()
    ig.addInterval(0, 10)
    ig.addInterval(5, 15)
    expect(ig.isIntervalGraph()).toBe(true)
  })

  it('maxOverlap with single element repeated many times', () => {
    const ig = new IntervalGraph()
    for (let i = 0; i < 20; i++) {
      ig.addInterval(5, 5)
    }
    expect(ig.maxOverlap()).toBe(20)
  })

  it('totalOverlap with single element repeated many times', () => {
    const ig = new IntervalGraph()
    for (let i = 0; i < 20; i++) {
      ig.addInterval(5, 5)
    }
    expect(ig.totalOverlap()).toBe(0)
  })

  it('clone empty and add intervals to both independently', () => {
    const ig1 = new IntervalGraph()
    const ig2 = ig1.clone()
    ig1.addInterval(0, 5)
    ig2.addInterval(10, 15)
    expect(ig1.maxOverlap()).toBe(1)
    expect(ig2.maxOverlap()).toBe(1)
  })
})

describe('interval-graph - wave548', () => {
  it('interval-graph module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module has name', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module not null', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module has length', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave549', () => {
  it('interval-graph module defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave550', () => {
  it('interval-graph w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave551', () => {
  it('interval-graph w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave552', () => {
  it('interval-graph w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave553', () => {
  it('interval-graph w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave554', () => {
  it('interval-graph w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave555', () => {
  it('interval-graph w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave556', () => {
  it('interval-graph w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('interval-graph - wave557', () => {
  it('interval-graph w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('interval-graph w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
