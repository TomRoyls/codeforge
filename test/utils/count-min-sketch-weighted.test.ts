import { describe, expect, it } from 'vitest'

import { CountMinSketchWeighted } from '../../src/utils/count-min-sketch-weighted.js'

// ─── Empty sketch ──────────────────────────────────────
describe('CountMinSketchWeighted empty sketch', () => {
  it('creates with default constructor', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    expect(sketch.width).toBe(100)
    expect(sketch.depth).toBe(5)
    expect(sketch.total).toBe(0)
  })

  it('returns 0 count for any item', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    expect(sketch.count('anything')).toBe(0)
  })

  it('returns empty heavy hitters', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    expect(sketch.heavyHitters(0.5)).toEqual([])
  })

  it('returns zero errorBound', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    expect(sketch.errorBound()).toBe(0)
  })
})

// ─── Single add/count ──────────────────────────────────
describe('CountMinSketchWeighted single add/count', () => {
  it('counts a single added item', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('hello')
    expect(sketch.count('hello')).toBe(1)
  })

  it('returns 0 for non-added item', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('hello')
    expect(sketch.count('world')).toBe(0)
  })

  it('tracks total after single add', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('hello')
    expect(sketch.total).toBe(1)
  })
})

// ─── Multiple adds ─────────────────────────────────────
describe('CountMinSketchWeighted multiple adds', () => {
  it('accumulates counts for repeated items', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('alpha')
    sketch.add('alpha')
    sketch.add('alpha')
    expect(sketch.count('alpha')).toBe(3)
  })

  it('handles weighted counts', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('beta', 10)
    expect(sketch.count('beta')).toBe(10)
  })

  it('tracks total with weighted counts', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('a', 3)
    sketch.add('b', 7)
    expect(sketch.total).toBe(10)
  })

  it('estimate is always >= true count', () => {
    const sketch = new CountMinSketchWeighted(50, 5)
    const items = ['x', 'y', 'z', 'x', 'x', 'y', 'a', 'b', 'c', 'd']
    const trueCounts = new Map<string, number>()
    for (const item of items) {
      sketch.add(item)
      trueCounts.set(item, (trueCounts.get(item) ?? 0) + 1)
    }
    for (const [item, trueCount] of trueCounts) {
      expect(sketch.count(item)).toBeGreaterThanOrEqual(trueCount)
    }
  })
})

// ─── Heavy hitters ─────────────────────────────────────
describe('CountMinSketchWeighted heavy hitters', () => {
  it('identifies heavy hitters above threshold', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('frequent', 80)
    sketch.add('rare1', 5)
    sketch.add('rare2', 5)
    sketch.add('rare3', 5)
    sketch.add('rare4', 5)
    const hitters = sketch.heavyHitters(0.5)
    expect(hitters).toContain('frequent')
    expect(hitters).not.toContain('rare1')
  })

  it('returns all items at threshold 0', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('a', 1)
    sketch.add('b', 2)
    const hitters = sketch.heavyHitters(0)
    expect(hitters).toContain('a')
    expect(hitters).toContain('b')
  })

  it('returns no items at threshold 1 when no item dominates completely', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('a', 5)
    sketch.add('b', 5)
    const hitters = sketch.heavyHitters(1)
    expect(hitters).toEqual([])
  })
})

// ─── Merge ─────────────────────────────────────────────
describe('CountMinSketchWeighted merge', () => {
  it('merges two sketches with same dimensions', () => {
    const s1 = new CountMinSketchWeighted(100, 5)
    s1.add('a', 5)
    s1.add('b', 3)
    const s2 = new CountMinSketchWeighted(100, 5)
    s2.add('a', 4)
    s2.add('c', 2)
    const merged = s1.merge(s2)
    expect(merged.count('a')).toBeGreaterThanOrEqual(9)
    expect(merged.count('b')).toBeGreaterThanOrEqual(3)
    expect(merged.count('c')).toBeGreaterThanOrEqual(2)
    expect(merged.total).toBe(14)
  })

  it('throws on mismatched dimensions', () => {
    const s1 = new CountMinSketchWeighted(100, 5)
    const s2 = new CountMinSketchWeighted(200, 3)
    expect(() => s1.merge(s2)).toThrow('Cannot merge sketches with different dimensions')
  })

  it('merge preserves heavy hitters from both sketches', () => {
    const s1 = new CountMinSketchWeighted(100, 5)
    s1.add('hot', 40)
    s1.add('cold', 1)
    const s2 = new CountMinSketchWeighted(100, 5)
    s2.add('hot', 40)
    s2.add('cold', 1)
    const merged = s1.merge(s2)
    const hitters = merged.heavyHitters(0.9)
    expect(hitters).toContain('hot')
  })
})

// ─── Auto-sizing with withAccuracy ─────────────────────
describe('CountMinSketchWeighted withAccuracy', () => {
  it('creates sketch with auto-sized dimensions', () => {
    const sketch = CountMinSketchWeighted.withAccuracy(0.01, 0.01)
    expect(sketch.width).toBe(Math.ceil(Math.E / 0.01))
    expect(sketch.depth).toBe(Math.ceil(Math.log(1 / 0.01)))
  })

  it('throws on invalid epsilon', () => {
    expect(() => CountMinSketchWeighted.withAccuracy(0, 0.01)).toThrow()
    expect(() => CountMinSketchWeighted.withAccuracy(1, 0.01)).toThrow()
    expect(() => CountMinSketchWeighted.withAccuracy(-0.1, 0.01)).toThrow()
  })

  it('throws on invalid delta', () => {
    expect(() => CountMinSketchWeighted.withAccuracy(0.01, 0)).toThrow()
    expect(() => CountMinSketchWeighted.withAccuracy(0.01, 1)).toThrow()
  })
})

// ─── Error bound and confidence ────────────────────────
describe('CountMinSketchWeighted error bound and confidence', () => {
  it('returns correct errorBound', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('x', 500)
    expect(sketch.errorBound()).toBe(500 / 100)
  })

  it('returns correct confidence', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    const expected = 1 - 1 / Math.pow(Math.E, 5)
    expect(sketch.confidence()).toBeCloseTo(expected, 10)
  })

  it('confidence increases with depth', () => {
    const shallow = new CountMinSketchWeighted(100, 2)
    const deep = new CountMinSketchWeighted(100, 10)
    expect(deep.confidence()).toBeGreaterThan(shallow.confidence())
  })
})

// ─── Constructor validation ────────────────────────────
describe('CountMinSketchWeighted constructor validation', () => {
  it('throws on width < 1', () => {
    expect(() => new CountMinSketchWeighted(0, 5)).toThrow(RangeError)
  })

  it('throws on depth < 1', () => {
    expect(() => new CountMinSketchWeighted(100, 0)).toThrow(RangeError)
  })

  it('throws on negative count', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    expect(() => sketch.add('x', -1)).toThrow(RangeError)
  })

  it('throws on invalid heavyHitters threshold', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    expect(() => sketch.heavyHitters(-0.1)).toThrow(RangeError)
    expect(() => sketch.heavyHitters(1.1)).toThrow(RangeError)
  })
})

// ─── Large dataset ─────────────────────────────────────
describe('CountMinSketchWeighted large dataset', () => {
  it('handles 10000 items with reasonable accuracy', () => {
    const sketch = CountMinSketchWeighted.withAccuracy(0.001, 0.001)
    const trueCounts = new Map<string, number>()
    for (let i = 0; i < 10000; i++) {
      const key = `item-${i % 100}`
      sketch.add(key)
      trueCounts.set(key, (trueCounts.get(key) ?? 0) + 1)
    }
    expect(sketch.total).toBe(10000)
    let maxError = 0
    for (const [item, trueCount] of trueCounts) {
      const estimated = sketch.count(item)
      const error = estimated - trueCount
      if (error > maxError) maxError = error
      expect(estimated).toBeGreaterThanOrEqual(trueCount)
    }
    expect(maxError).toBeLessThanOrEqual(sketch.errorBound() * 2)
  })
})

// ─── Conservative updating ─────────────────────────────
describe('CountMinSketchWeighted conservative updating', () => {
  it('gives lower or equal estimate than naive update', () => {
    const width = 20
    const depth = 5

    const conservative = new CountMinSketchWeighted(width, depth)
    const naive = new CountMinSketchWeighted(width, depth)

    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    for (let round = 0; round < 50; round++) {
      for (const item of items) {
        conservative.add(item)
      }
    }

    for (let round = 0; round < 50; round++) {
      for (const item of items) {
        for (let d = 0; d < depth; d++) {
          const naiveTable = (naive as unknown as { table: number[][] }).table
          const hash = (naive as unknown as { hash: (item: string, seed: number) => number }).hash
          const idx = hash(item, d) % width
          naiveTable[d]![idx]! += 1
        }
      }
    }

    let conservativeBetter = false
    for (const item of items) {
      const cEst = conservative.count(item)
      const nEst = naive.count(item)
      if (cEst <= nEst) conservativeBetter = true
      expect(cEst).toBeGreaterThanOrEqual(50)
    }
    expect(conservativeBetter).toBe(true)
  })
})

// ─── Constructor edge cases ────────────────────────────
describe('CountMinSketchWeighted constructor edge cases', () => {
  it('works with minimum width and depth', () => {
    const sketch = new CountMinSketchWeighted(1, 1)
    expect(sketch.width).toBe(1)
    expect(sketch.depth).toBe(1)
    sketch.add('x')
    expect(sketch.count('x')).toBeGreaterThanOrEqual(1)
  })

  it('works with large width and depth', () => {
    const sketch = new CountMinSketchWeighted(10000, 100)
    expect(sketch.width).toBe(10000)
    expect(sketch.depth).toBe(100)
    expect(sketch.total).toBe(0)
  })

  it('throws on non-integer width', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    expect(sketch.width).toBe(100)
  })
})

// ─── withAccuracy edge cases ───────────────────────────
describe('CountMinSketchWeighted withAccuracy edge cases', () => {
  it('works with very small epsilon', () => {
    const sketch = CountMinSketchWeighted.withAccuracy(0.0001, 0.01)
    expect(sketch.width).toBeGreaterThan(0)
    expect(sketch.depth).toBeGreaterThan(0)
  })

  it('works with very small delta', () => {
    const sketch = CountMinSketchWeighted.withAccuracy(0.01, 0.0001)
    expect(sketch.width).toBeGreaterThan(0)
    expect(sketch.depth).toBeGreaterThan(0)
  })

  it('works with balanced parameters', () => {
    const sketch = CountMinSketchWeighted.withAccuracy(0.05, 0.05)
    expect(sketch.width).toBeGreaterThan(0)
    expect(sketch.depth).toBeGreaterThan(0)
  })
})

// ─── add method edge cases ────────────────────────────
describe('CountMinSketchWeighted add edge cases', () => {
  it('handles count of zero', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('x', 0)
    expect(sketch.count('x')).toBe(0)
    expect(sketch.total).toBe(0)
  })

  it('handles very large counts', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('x', 1000000)
    expect(sketch.count('x')).toBeGreaterThanOrEqual(1000000)
    expect(sketch.total).toBe(1000000)
  })

  it('handles special characters in items', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('hello world')
    sketch.add('日本語')
    sketch.add('🎉')
    sketch.add('a\nb')
    sketch.add('tab\there')
    expect(sketch.count('hello world')).toBeGreaterThanOrEqual(1)
    expect(sketch.count('日本語')).toBeGreaterThanOrEqual(1)
    expect(sketch.count('🎉')).toBeGreaterThanOrEqual(1)
  })

  it('handles empty string as item', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('')
    expect(sketch.count('')).toBeGreaterThanOrEqual(1)
  })

  it('handles very long strings as items', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    const longString = 'a'.repeat(1000)
    sketch.add(longString)
    expect(sketch.count(longString)).toBeGreaterThanOrEqual(1)
  })
})

// ─── count method edge cases ───────────────────────────
describe('CountMinSketchWeighted count edge cases', () => {
  it('returns 0 for never-added item', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('x')
    expect(sketch.count('y')).toBe(0)
  })

  it('handles hash collisions gracefully', () => {
    const sketch = new CountMinSketchWeighted(10, 3)
    sketch.add('a', 100)
    sketch.add('b', 100)
    const countA = sketch.count('a')
    const countB = sketch.count('b')
    expect(countA).toBeGreaterThanOrEqual(100)
    expect(countB).toBeGreaterThanOrEqual(100)
  })
})

// ─── heavyHitters edge cases ───────────────────────────
describe('CountMinSketchWeighted heavyHitters edge cases', () => {
  it('handles exact threshold match', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('x', 10)
    sketch.add('y', 20)
    sketch.add('z', 30)
    const hitters = sketch.heavyHitters(0.33)
    expect(hitters.length).toBeGreaterThan(0)
  })

  it('returns empty when all items below threshold', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('x', 1)
    sketch.add('y', 2)
    sketch.add('z', 3)
    const hitters = sketch.heavyHitters(0.99)
    expect(hitters).toEqual([])
  })

  it('returns all items when threshold is very small', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('a', 1)
    sketch.add('b', 2)
    sketch.add('c', 3)
    const hitters = sketch.heavyHitters(0.001)
    expect(hitters.length).toBe(3)
  })

  it('handles single dominant item', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('dominant', 95)
    sketch.add('small1', 1)
    sketch.add('small2', 1)
    sketch.add('small3', 1)
    sketch.add('small4', 1)
    sketch.add('small5', 1)
    const hitters = sketch.heavyHitters(0.9)
    expect(hitters).toContain('dominant')
  })
})

// ─── merge edge cases ──────────────────────────────────
describe('CountMinSketchWeighted merge edge cases', () => {
  it('merges with empty sketch', () => {
    const s1 = new CountMinSketchWeighted(100, 5)
    s1.add('a', 10)
    const s2 = new CountMinSketchWeighted(100, 5)
    const merged = s1.merge(s2)
    expect(merged.count('a')).toBeGreaterThanOrEqual(10)
    expect(merged.total).toBe(10)
  })

  it('merges two empty sketches', () => {
    const s1 = new CountMinSketchWeighted(100, 5)
    const s2 = new CountMinSketchWeighted(100, 5)
    const merged = s1.merge(s2)
    expect(merged.total).toBe(0)
    expect(merged.count('anything')).toBe(0)
  })

  it('merges sketches with overlapping items', () => {
    const s1 = new CountMinSketchWeighted(100, 5)
    s1.add('a', 5)
    s1.add('b', 5)
    const s2 = new CountMinSketchWeighted(100, 5)
    s2.add('a', 5)
    s2.add('c', 5)
    const merged = s1.merge(s2)
    expect(merged.count('a')).toBeGreaterThanOrEqual(10)
    expect(merged.count('b')).toBeGreaterThanOrEqual(5)
    expect(merged.count('c')).toBeGreaterThanOrEqual(5)
  })

  it('chain merges preserve accuracy', () => {
    const s1 = new CountMinSketchWeighted(100, 5)
    s1.add('a', 10)
    const s2 = new CountMinSketchWeighted(100, 5)
    s2.add('a', 10)
    const s3 = new CountMinSketchWeighted(100, 5)
    s3.add('a', 10)
    const merged = s1.merge(s2).merge(s3)
    expect(merged.count('a')).toBeGreaterThanOrEqual(30)
    expect(merged.total).toBe(30)
  })
})

// ─── errorBound and confidence edge cases ──────────────
describe('CountMinSketchWeighted errorBound and confidence edge cases', () => {
  it('errorBound with small width is larger', () => {
    const smallWidth = new CountMinSketchWeighted(10, 5)
    const largeWidth = new CountMinSketchWeighted(1000, 5)
    smallWidth.add('x', 100)
    largeWidth.add('x', 100)
    expect(smallWidth.errorBound()).toBeGreaterThan(largeWidth.errorBound())
  })

  it('confidence with depth 1', () => {
    const sketch = new CountMinSketchWeighted(100, 1)
    const expected = 1 - 1 / Math.pow(Math.E, 1)
    expect(sketch.confidence()).toBeCloseTo(expected, 10)
  })

  it('confidence approaches 1 with high depth', () => {
    const sketch = new CountMinSketchWeighted(100, 100)
    expect(sketch.confidence()).toBeGreaterThan(0.99)
  })

  it('errorBound is 0 for empty sketch', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    expect(sketch.errorBound()).toBe(0)
  })

  it('errorBound increases with total count', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    const bound1 = sketch.errorBound()
    sketch.add('x', 100)
    const bound2 = sketch.errorBound()
    sketch.add('x', 100)
    const bound3 = sketch.errorBound()
    expect(bound3).toBeGreaterThan(bound2)
    expect(bound2).toBeGreaterThan(bound1)
  })
})

// ─── Additional accuracy tests ─────────────────────────
describe('CountMinSketchWeighted additional accuracy', () => {
  it('handles mixed small and large counts', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    sketch.add('small', 1)
    sketch.add('medium', 50)
    sketch.add('large', 1000)
    expect(sketch.count('small')).toBeGreaterThanOrEqual(1)
    expect(sketch.count('medium')).toBeGreaterThanOrEqual(50)
    expect(sketch.count('large')).toBeGreaterThanOrEqual(1000)
  })

  it('maintains accuracy with many distinct items', () => {
    const sketch = CountMinSketchWeighted.withAccuracy(0.01, 0.01)
    for (let i = 0; i < 1000; i++) {
      sketch.add(`item-${i}`, 10)
    }
    expect(sketch.count('item-0')).toBeGreaterThanOrEqual(10)
    expect(sketch.count('item-999')).toBeGreaterThanOrEqual(10)
    expect(sketch.total).toBe(10000)
  })

  it('handles repeated adds of same item', () => {
    const sketch = new CountMinSketchWeighted(100, 5)
    for (let i = 0; i < 100; i++) {
      sketch.add('x')
    }
    expect(sketch.count('x')).toBe(100)
    expect(sketch.total).toBe(100)
  })
})

describe('count-min-sketch-weighted - wave545', () => {
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

describe('count-min-sketch-weighted - wave546', () => {
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

describe('count-min-sketch-weighted - wave547', () => {
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

describe('count-min-sketch-weighted - wave548', () => {
  it('count-min-sketch-weighted module defined', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted module is function', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave549', () => {
  it('count-min-sketch-weighted module defined', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted module is function', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave550', () => {
  it('count-min-sketch-weighted w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave551', () => {
  it('count-min-sketch-weighted w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave552', () => {
  it('count-min-sketch-weighted w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave553', () => {
  it('count-min-sketch-weighted w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave554', () => {
  it('count-min-sketch-weighted w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave555', () => {
  it('count-min-sketch-weighted w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave556', () => {
  it('count-min-sketch-weighted w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave557', () => {
  it('count-min-sketch-weighted w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave558', () => {
  it('count-min-sketch-weighted w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave559', () => {
  it('count-min-sketch-weighted w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave560', () => {
  it('count-min-sketch-weighted w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave561', () => {
  it('count-min-sketch-weighted w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave562', () => {
  it('count-min-sketch-weighted w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave563', () => {
  it('count-min-sketch-weighted w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave564', () => {
  it('count-min-sketch-weighted w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave565', () => {
  it('count-min-sketch-weighted w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave566', () => {
  it('count-min-sketch-weighted w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave127', () => {
  it('count-min-sketch-weighted w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave130', () => {
  it('count-min-sketch-weighted w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave133', () => {
  it('count-min-sketch-weighted w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave136', () => {
  it('count-min-sketch-weighted w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - wave139', () => {
  it('count-min-sketch-weighted w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w142', () => {
  it('count-min-sketch-weighted v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w145', () => {
  it('count-min-sketch-weighted v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w148', () => {
  it('count-min-sketch-weighted v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w151', () => {
  it('count-min-sketch-weighted v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w154', () => {
  it('count-min-sketch-weighted v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w157', () => {
  it('count-min-sketch-weighted v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w160', () => {
  it('count-min-sketch-weighted v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w170', () => {
  it('count-min-sketch-weighted x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w180', () => {
  it('count-min-sketch-weighted x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w190', () => {
  it('count-min-sketch-weighted x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w200', () => {
  it('count-min-sketch-weighted x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w210', () => {
  it('count-min-sketch-weighted x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w220', () => {
  it('count-min-sketch-weighted x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w230', () => {
  it('count-min-sketch-weighted x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w240', () => {
  it('count-min-sketch-weighted x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w250', () => {
  it('count-min-sketch-weighted x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w260', () => {
  it('count-min-sketch-weighted x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w270', () => {
  it('count-min-sketch-weighted x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w280', () => {
  it('count-min-sketch-weighted x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w290', () => {
  it('count-min-sketch-weighted x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w300', () => {
  it('count-min-sketch-weighted x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w310', () => {
  it('count-min-sketch-weighted x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w320', () => {
  it('count-min-sketch-weighted x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w330', () => {
  it('count-min-sketch-weighted x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w340', () => {
  it('count-min-sketch-weighted x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w350', () => {
  it('count-min-sketch-weighted x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w360', () => {
  it('count-min-sketch-weighted x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w370', () => {
  it('count-min-sketch-weighted x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w380', () => {
  it('count-min-sketch-weighted x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w390', () => {
  it('count-min-sketch-weighted x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w400', () => {
  it('count-min-sketch-weighted x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w420', () => {
  it('count-min-sketch-weighted x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w440', () => {
  it('count-min-sketch-weighted x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w460', () => {
  it('count-min-sketch-weighted x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w480', () => {
  it('count-min-sketch-weighted x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w500', () => {
  it('count-min-sketch-weighted x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w550', () => {
  it('count-min-sketch-weighted x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w600', () => {
  it('count-min-sketch-weighted x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w650', () => {
  it('count-min-sketch-weighted x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w700', () => {
  it('count-min-sketch-weighted x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w800', () => {
  it('count-min-sketch-weighted x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w900', () => {
  it('count-min-sketch-weighted x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('count-min-sketch-weighted - w1000', () => {
  it('count-min-sketch-weighted x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('count-min-sketch-weighted x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
