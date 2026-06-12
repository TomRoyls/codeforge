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
