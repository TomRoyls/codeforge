import { describe, expect, it } from 'vitest'

import { CascadeFilter } from '../../../src/core/cascade-filter/cascade-filter.js'

// ─── Constructor ───

describe('CascadeFilter constructor', () => {
  it('creates instance with default options', () => {
    const filter = new CascadeFilter()
    expect(filter.size).toBe(0)
    expect(filter.isEmpty).toBe(true)
    expect(filter.capacity()).toBe(1000)
    expect(filter.layerCount()).toBe(3)
  })

  it('creates instance with custom options', () => {
    const filter = new CascadeFilter({ expectedItems: 500, falsePositiveRate: 0.05, layers: 4 })
    expect(filter.capacity()).toBe(500)
    expect(filter.layerCount()).toBe(4)
  })

  it('creates instance with partial options', () => {
    const filter = new CascadeFilter({ expectedItems: 200 })
    expect(filter.capacity()).toBe(200)
    expect(filter.layerCount()).toBe(3)
  })

  it('creates instance with single layer', () => {
    const filter = new CascadeFilter({ layers: 1 })
    expect(filter.layerCount()).toBe(1)
  })
})

// ─── add / has ───

describe('CascadeFilter add / has', () => {
  it('finds an added item', () => {
    const filter = new CascadeFilter()
    filter.add('hello')
    expect(filter.has('hello')).toBe(true)
  })

  it('does not find an item that was not added', () => {
    const filter = new CascadeFilter()
    filter.add('hello')
    expect(filter.has('world')).toBe(false)
  })

  it('tracks size after add', () => {
    const filter = new CascadeFilter()
    filter.add('a')
    filter.add('b')
    filter.add('c')
    expect(filter.size).toBe(3)
    expect(filter.isEmpty).toBe(false)
  })

  it('handles numeric items via generic', () => {
    const filter = new CascadeFilter<number>()
    filter.add(42)
    filter.add(100)
    expect(filter.has(42)).toBe(true)
    expect(filter.has(100)).toBe(true)
    expect(filter.has(99)).toBe(false)
  })

  it('handles object items via generic', () => {
    const filter = new CascadeFilter<{ id: number }>()
    const item = { id: 1 }
    filter.add(item)
    expect(filter.has(item)).toBe(true)
    expect(filter.has({ id: 2 })).toBe(false)
  })

  it('handles empty string', () => {
    const filter = new CascadeFilter()
    filter.add('')
    expect(filter.has('')).toBe(true)
  })

  it('handles duplicate adds without error', () => {
    const filter = new CascadeFilter()
    filter.add('dup')
    filter.add('dup')
    expect(filter.size).toBe(2)
    expect(filter.has('dup')).toBe(true)
  })

  it('handles many items up to capacity', () => {
    const filter = new CascadeFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
    for (let i = 0; i < 100; i++) {
      filter.add(`item-${i}`)
    }
    expect(filter.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(filter.has(`item-${i}`)).toBe(true)
    }
  })
})

// ─── remove ───

describe('CascadeFilter remove', () => {
  it('removes an added item', () => {
    const filter = new CascadeFilter()
    filter.add('hello')
    expect(filter.remove('hello')).toBe(true)
    expect(filter.has('hello')).toBe(false)
  })

  it('returns false when removing non-existent item', () => {
    const filter = new CascadeFilter()
    expect(filter.remove('nope')).toBe(false)
  })

  it('decrements size on removal', () => {
    const filter = new CascadeFilter()
    filter.add('a')
    filter.add('b')
    filter.remove('a')
    expect(filter.size).toBe(1)
  })

  it('handles remove on empty filter', () => {
    const filter = new CascadeFilter()
    expect(filter.remove('anything')).toBe(false)
    expect(filter.size).toBe(0)
  })

  it('handles remove after clear', () => {
    const filter = new CascadeFilter()
    filter.add('x')
    filter.clear()
    expect(filter.remove('x')).toBe(false)
  })

  it('can add back after removal', () => {
    const filter = new CascadeFilter()
    filter.add('test')
    filter.remove('test')
    expect(filter.has('test')).toBe(false)
    filter.add('test')
    expect(filter.has('test')).toBe(true)
  })
})

// ─── clear ───

describe('CascadeFilter clear', () => {
  it('clears all items', () => {
    const filter = new CascadeFilter()
    filter.add('a')
    filter.add('b')
    filter.add('c')
    filter.clear()
    expect(filter.size).toBe(0)
    expect(filter.isEmpty).toBe(true)
  })

  it('items are not found after clear', () => {
    const filter = new CascadeFilter()
    filter.add('test')
    filter.clear()
    expect(filter.has('test')).toBe(false)
  })

  it('can add items after clear', () => {
    const filter = new CascadeFilter()
    filter.add('before')
    filter.clear()
    filter.add('after')
    expect(filter.size).toBe(1)
    expect(filter.has('after')).toBe(true)
  })

  it('clear on empty filter is safe', () => {
    const filter = new CascadeFilter()
    filter.clear()
    expect(filter.size).toBe(0)
  })
})

// ─── estimatedFillRatio ───

describe('CascadeFilter estimatedFillRatio', () => {
  it('returns 0 for empty filter', () => {
    const filter = new CascadeFilter()
    expect(filter.estimatedFillRatio()).toBe(0)
  })

  it('returns positive ratio after adding items', () => {
    const filter = new CascadeFilter({ expectedItems: 50, falsePositiveRate: 0.01 })
    for (let i = 0; i < 10; i++) {
      filter.add(`item-${i}`)
    }
    expect(filter.estimatedFillRatio()).toBeGreaterThan(0)
  })

  it('ratio increases with more items', () => {
    const filter = new CascadeFilter({ expectedItems: 50, falsePositiveRate: 0.01 })
    filter.add('a')
    const ratio1 = filter.estimatedFillRatio()
    for (let i = 0; i < 20; i++) {
      filter.add(`item-${i}`)
    }
    const ratio2 = filter.estimatedFillRatio()
    expect(ratio2).toBeGreaterThan(ratio1)
  })
})

// ─── expectedFalsePositiveRate ───

describe('CascadeFilter expectedFalsePositiveRate', () => {
  it('returns 0 for empty filter', () => {
    const filter = new CascadeFilter()
    expect(filter.expectedFalsePositiveRate()).toBe(0)
  })

  it('returns positive rate with items', () => {
    const filter = new CascadeFilter({ expectedItems: 50, falsePositiveRate: 0.01 })
    for (let i = 0; i < 20; i++) {
      filter.add(`item-${i}`)
    }
    expect(filter.expectedFalsePositiveRate()).toBeGreaterThan(0)
  })
})

// ─── getStatistics ───

describe('CascadeFilter getStatistics', () => {
  it('returns initial statistics', () => {
    const filter = new CascadeFilter()
    const stats = filter.getStatistics()
    expect(stats.adds).toBe(0)
    expect(stats.lookups).toBe(0)
    expect(stats.removals).toBe(0)
    expect(stats.totalChecks).toBe(0)
  })

  it('tracks add count', () => {
    const filter = new CascadeFilter()
    filter.add('a')
    filter.add('b')
    expect(filter.getStatistics().adds).toBe(2)
  })

  it('tracks lookup count', () => {
    const filter = new CascadeFilter()
    filter.add('a')
    filter.has('a')
    filter.has('b')
    expect(filter.getStatistics().lookups).toBe(2)
  })

  it('tracks removal count', () => {
    const filter = new CascadeFilter()
    filter.add('a')
    filter.remove('a')
    filter.remove('b')
    expect(filter.getStatistics().removals).toBe(2)
  })

  it('resets statistics after clear', () => {
    const filter = new CascadeFilter()
    filter.add('a')
    filter.has('a')
    filter.clear()
    const stats = filter.getStatistics()
    expect(stats.adds).toBe(0)
    expect(stats.lookups).toBe(0)
    expect(stats.removals).toBe(0)
  })
})

// ─── optimize ───

describe('CascadeFilter optimize', () => {
  it('returns optimization data for empty filter', () => {
    const filter = new CascadeFilter()
    const result = filter.optimize()
    expect(result.currentFillRatio).toBe(0)
    expect(result.currentFalsePositiveRate).toBe(0)
    expect(result.recommendedExpectedItems).toBe(1000)
    expect(result.recommendedLayers).toBe(3)
  })

  it('returns higher recommended items after filling', () => {
    const filter = new CascadeFilter({ expectedItems: 50, falsePositiveRate: 0.01 })
    for (let i = 0; i < 50; i++) {
      filter.add(`item-${i}`)
    }
    const result = filter.optimize()
    expect(result.recommendedExpectedItems).toBeGreaterThanOrEqual(50)
  })

  it('space efficiency is a number', () => {
    const filter = new CascadeFilter()
    const result = filter.optimize()
    expect(typeof result.estimatedSpaceEfficiency).toBe('number')
    expect(result.estimatedSpaceEfficiency).toBeGreaterThan(0)
  })
})

// ─── toJSON / fromJSON ───

describe('CascadeFilter serialization', () => {
  it('serializes to JSON', () => {
    const filter = new CascadeFilter()
    filter.add('test')
    const json = filter.toJSON()
    expect(json.expectedItems).toBe(1000)
    expect(json.falsePositiveRate).toBe(0.01)
    expect(json.layerCount).toBe(3)
    expect(json.itemCount).toBe(1)
    expect(json.layers).toHaveLength(3)
    expect(json.statistics.adds).toBe(1)
  })

  it('round-trips through JSON', () => {
    const original = new CascadeFilter({ expectedItems: 100, falsePositiveRate: 0.05 })
    original.add('hello')
    original.add('world')
    original.has('hello')
    original.remove('hello')

    const json = original.toJSON()
    const restored = CascadeFilter.fromJSON<string>(json)

    expect(restored.size).toBe(1)
    expect(restored.has('world')).toBe(true)
    expect(restored.has('hello')).toBe(false)
    expect(restored.capacity()).toBe(100)
    expect(restored.layerCount()).toBe(3)
  })

  it('preserves statistics through round-trip', () => {
    const filter = new CascadeFilter()
    filter.add('a')
    filter.add('b')
    filter.has('a')

    const json = filter.toJSON()
    const restored = CascadeFilter.fromJSON<string>(json)
    const stats = restored.getStatistics()
    expect(stats.adds).toBe(2)
    expect(stats.lookups).toBe(1)
  })

  it('handles empty filter serialization', () => {
    const filter = new CascadeFilter()
    const json = filter.toJSON()
    expect(json.itemCount).toBe(0)
    const restored = CascadeFilter.fromJSON<string>(json)
    expect(restored.size).toBe(0)
    expect(restored.isEmpty).toBe(true)
  })
})

// ─── capacity / layerCount ───

describe('CascadeFilter accessors', () => {
  it('capacity returns expected items', () => {
    const filter = new CascadeFilter({ expectedItems: 500 })
    expect(filter.capacity()).toBe(500)
  })

  it('layerCount returns configured layers', () => {
    const filter = new CascadeFilter({ layers: 5 })
    expect(filter.layerCount()).toBe(5)
  })

  it('size getter returns count', () => {
    const filter = new CascadeFilter()
    expect(filter.size).toBe(0)
    filter.add('x')
    expect(filter.size).toBe(1)
  })

  it('isEmpty returns correct boolean', () => {
    const filter = new CascadeFilter()
    expect(filter.isEmpty).toBe(true)
    filter.add('x')
    expect(filter.isEmpty).toBe(false)
  })
})
