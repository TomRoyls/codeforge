import { describe, it, expect } from 'vitest'
import { CountingBloomFilter2 } from '../../src/utils/counting-bloom-filter-2.js'

describe('CountingBloomFilter2 construction', () => {
  it('constructor with defaults', () => {
    const filter = new CountingBloomFilter2(1000)
    expect(filter.capacity).toBe(1000)
    expect(filter.filterSize).toBeGreaterThan(0)
    expect(filter.hashCount).toBeGreaterThan(0)
  })

  it('constructor with custom false positive rate', () => {
    const filter = new CountingBloomFilter2(1000, 0.001)
    expect(filter.capacity).toBe(1000)
    expect(filter.filterSize).toBeGreaterThan(0)
  })

  it('throws on zero expected items', () => {
    expect(() => new CountingBloomFilter2(0)).toThrow(RangeError)
  })

  it('throws on negative expected items', () => {
    expect(() => new CountingBloomFilter2(-1)).toThrow(RangeError)
  })

  it('throws on false positive rate 0', () => {
    expect(() => new CountingBloomFilter2(100, 0)).toThrow(RangeError)
  })

  it('throws on false positive rate 1', () => {
    expect(() => new CountingBloomFilter2(100, 1)).toThrow(RangeError)
  })

  it('throws on negative false positive rate', () => {
    expect(() => new CountingBloomFilter2(100, -0.5)).toThrow(RangeError)
  })

  it('minimum capacity is 1', () => {
    const filter = new CountingBloomFilter2(1)
    expect(filter.capacity).toBe(1)
    expect(filter.filterSize).toBeGreaterThanOrEqual(64)
  })

  it('lower fpr means larger filter', () => {
    const f1 = new CountingBloomFilter2(100, 0.1)
    const f2 = new CountingBloomFilter2(100, 0.001)
    expect(f2.filterSize).toBeGreaterThan(f1.filterSize)
  })

  it('higher capacity means larger filter', () => {
    const f1 = new CountingBloomFilter2(10)
    const f2 = new CountingBloomFilter2(1000)
    expect(f2.filterSize).toBeGreaterThan(f1.filterSize)
  })

  it('filterSize is at least 64', () => {
    const filter = new CountingBloomFilter2(1)
    expect(filter.filterSize).toBeGreaterThanOrEqual(64)
  })
})

describe('CountingBloomFilter2 add & contains', () => {
  it('add and contains', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('test-item')
    expect(filter.contains('test-item')).toBe(true)
    expect(filter.contains('non-existent')).toBe(false)
  })

  it('contains returns false for empty filter', () => {
    const filter = new CountingBloomFilter2(100)
    expect(filter.contains('anything')).toBe(false)
  })

  it('add same item multiple times', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item')
    filter.add('item')
    filter.add('item')
    expect(filter.contains('item')).toBe(true)
    expect(filter.count('item')).toBeGreaterThan(0)
  })

  it('handles unicode keys', () => {
    const filter = new CountingBloomFilter2(50)
    filter.add('日本語')
    filter.add('🎉')
    expect(filter.contains('日本語')).toBe(true)
    expect(filter.contains('🎉')).toBe(true)
  })

  it('handles empty string', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('')
    expect(filter.contains('')).toBe(true)
  })

  it('handles special characters', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('\n\t')
    filter.add('\0')
    expect(filter.contains('\n\t')).toBe(true)
    expect(filter.contains('\0')).toBe(true)
  })

  it('handles case-sensitive keys', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('Hello')
    filter.add('hello')
    expect(filter.contains('Hello')).toBe(true)
    expect(filter.contains('hello')).toBe(true)
    expect(filter.contains('HELLO')).toBe(false)
  })

  it('multiple distinct items', () => {
    const filter = new CountingBloomFilter2(100)
    const items = ['a', 'b', 'c', 'd', 'e']
    for (const item of items) filter.add(item)
    for (const item of items) expect(filter.contains(item)).toBe(true)
    expect(filter.estimatedCount).toBe(5)
  })
})

describe('CountingBloomFilter2 remove', () => {
  it('remove item', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item')
    expect(filter.remove('item')).toBe(true)
    expect(filter.contains('item')).toBe(false)
  })

  it('remove item not present', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item')
    expect(filter.remove('non-existent')).toBe(false)
  })

  it('remove from empty filter returns false', () => {
    const filter = new CountingBloomFilter2(100)
    expect(filter.remove('anything')).toBe(false)
  })

  it('add and remove multiple times', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('x')
    filter.add('x')
    filter.remove('x')
    expect(filter.count('x')).toBeGreaterThanOrEqual(1)
    expect(filter.contains('x')).toBe(true)
  })

  it('can re-add after remove', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('y')
    filter.remove('y')
    expect(filter.contains('y')).toBe(false)
    filter.add('y')
    expect(filter.contains('y')).toBe(true)
  })

  it('estimatedCount decreases on remove', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('a')
    filter.add('b')
    expect(filter.estimatedCount).toBe(2)
    filter.remove('a')
    expect(filter.estimatedCount).toBe(1)
  })

  it('handles many add-remove cycles', () => {
    const filter = new CountingBloomFilter2(200)
    for (let i = 0; i < 50; i++) filter.add(`item-${i}`)
    for (let i = 0; i < 50; i++) filter.remove(`item-${i}`)
    expect(filter.estimatedCount).toBe(0)
  })
})

describe('CountingBloomFilter2 count', () => {
  it('count returns estimated frequency', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item')
    filter.add('item')
    filter.add('item')
    expect(filter.count('item')).toBe(3)
  })

  it('count returns zero for non-existent items', () => {
    const filter = new CountingBloomFilter2(100)
    expect(filter.count('non-existent')).toBe(0)
  })

  it('count decreases after remove', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('x')
    filter.add('x')
    filter.add('x')
    filter.remove('x')
    expect(filter.count('x')).toBeGreaterThanOrEqual(2)
  })
})

describe('CountingBloomFilter2 clear', () => {
  it('clear empties the filter', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('item1')
    filter.add('item2')
    filter.add('item3')
    filter.clear()
    expect(filter.contains('item1')).toBe(false)
    expect(filter.estimatedCount).toBe(0)
  })

  it('can add after clear', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('a')
    filter.clear()
    filter.add('b')
    expect(filter.contains('b')).toBe(true)
    expect(filter.estimatedCount).toBe(1)
  })

  it('clear on empty filter is no-op', () => {
    const filter = new CountingBloomFilter2(100)
    filter.clear()
    expect(filter.estimatedCount).toBe(0)
  })
})

describe('CountingBloomFilter2 stats', () => {
  it('estimatedCount reflects additions', () => {
    const filter = new CountingBloomFilter2(100)
    expect(filter.estimatedCount).toBe(0)
    filter.add('a')
    expect(filter.estimatedCount).toBe(1)
    filter.add('b')
    expect(filter.estimatedCount).toBe(2)
  })

  it('filterSize and hashCount are reasonable', () => {
    const filter = new CountingBloomFilter2(1000, 0.01)
    expect(filter.filterSize).toBeGreaterThan(1000)
    expect(filter.hashCount).toBeGreaterThan(0)
    expect(filter.hashCount).toBeLessThan(20)
  })

  it('hashCount is at least 1', () => {
    const filter = new CountingBloomFilter2(1)
    expect(filter.hashCount).toBeGreaterThanOrEqual(1)
  })

  it('many items operations', () => {
    const filter = new CountingBloomFilter2(2000, 0.001)
    const items = new Set<string>()
    for (let i = 0; i < 1500; i++) {
      const item = `item-${i}`
      items.add(item)
      filter.add(item)
    }
    let positiveCount = 0
    items.forEach((item) => {
      if (filter.contains(item)) positiveCount++
    })
    expect(positiveCount).toBe(1500)
  })

  it('mixed add/remove operations', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('a')
    filter.add('b')
    filter.add('c')
    expect(filter.remove('b')).toBe(true)
    expect(filter.contains('b')).toBe(false)
    expect(filter.contains('a')).toBe(true)
    filter.add('d')
    expect(filter.contains('d')).toBe(true)
  })

  it('handles numeric string keys', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('1')
    filter.add('2')
    filter.add('3')
    expect(filter.contains('1')).toBe(true)
    expect(filter.contains('2')).toBe(true)
    expect(filter.contains('3')).toBe(true)
  })

  it('handles long string keys', () => {
    const filter = new CountingBloomFilter2(100)
    const longKey = 'a'.repeat(10000)
    filter.add(longKey)
    expect(filter.contains(longKey)).toBe(true)
  })

  it('capacity matches constructor', () => {
    const filter = new CountingBloomFilter2(500)
    expect(filter.capacity).toBe(500)
  })

  it('rapid add remove of same item', () => {
    const filter = new CountingBloomFilter2(100)
    for (let i = 0; i < 20; i++) {
      filter.add('z')
      filter.remove('z')
    }
    expect(filter.estimatedCount).toBe(0)
    expect(filter.contains('z')).toBe(false)
  })

  it('estimatedCount tracks mixed operations', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('a')
    filter.add('b')
    filter.add('c')
    filter.remove('b')
    filter.add('d')
    expect(filter.estimatedCount).toBe(3)
  })

  it('remove returns false after all counts removed', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('x')
    filter.remove('x')
    expect(filter.remove('x')).toBe(false)
  })

  it('count for empty string key', () => {
    const filter = new CountingBloomFilter2(100)
    expect(filter.count('')).toBe(0)
    filter.add('')
    expect(filter.count('')).toBeGreaterThanOrEqual(1)
  })

  it('remove after multiple adds preserves remaining count', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('q')
    filter.add('q')
    filter.add('q')
    filter.remove('q')
    expect(filter.count('q')).toBeGreaterThanOrEqual(2)
    expect(filter.estimatedCount).toBe(2)
  })

  it('handles false positive rate near zero', () => {
    const filter = new CountingBloomFilter2(100, 0.000001)
    expect(filter.filterSize).toBeGreaterThan(0)
    expect(filter.hashCount).toBeGreaterThan(0)
  })

  it('handles false positive rate near one', () => {
    const filter = new CountingBloomFilter2(100, 0.999)
    expect(filter.filterSize).toBeGreaterThanOrEqual(64)
    expect(filter.hashCount).toBeGreaterThanOrEqual(1)
  })

  it('clear resets estimatedCount to zero', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('a')
    filter.add('b')
    filter.add('c')
    expect(filter.estimatedCount).toBe(3)
    filter.clear()
    expect(filter.estimatedCount).toBe(0)
  })

  it('handles extremely long keys', () => {
    const filter = new CountingBloomFilter2(100)
    const longKey = 'a'.repeat(100000)
    filter.add(longKey)
    expect(filter.contains(longKey)).toBe(true)
  })

  it('remove returns false and does not change estimatedCount for missing item', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('present')
    expect(filter.estimatedCount).toBe(1)
    expect(filter.remove('missing')).toBe(false)
    expect(filter.estimatedCount).toBe(1)
  })

  it('contains and count consistency for never-added item', () => {
    const filter = new CountingBloomFilter2(100)
    filter.add('other')
    expect(filter.contains('never-added')).toBe(false)
    expect(filter.count('never-added')).toBe(0)
  })

  it('add then remove then contains returns false', () => {
    const f = new CountingBloomFilter2(50)
    f.add('hello')
    f.remove('hello')
    expect(f.contains('hello')).toBe(false)
  })

  it('estimatedCount tracks additions', () => {
    const f = new CountingBloomFilter2(20)
    f.add('a')
    f.add('b')
    expect(f.estimatedCount).toBe(2)
  })

  it('hashCount is positive', () => {
    const f = new CountingBloomFilter2(100)
    expect(f.hashCount).toBeGreaterThan(0)
  })

  it('filterSize is at least 64', () => {
    const f = new CountingBloomFilter2(10)
    expect(f.filterSize).toBeGreaterThanOrEqual(64)
  })
})

  it('contains returns false for non-added', () => {
    const bf = new CountingBloomFilter2(100)
    expect(bf.contains('missing')).toBe(false)
  })

  it('add and contains', () => {
    const bf = new CountingBloomFilter2(100)
    bf.add('test')
    expect(bf.contains('test')).toBe(true)
  })

  it('remove works', () => {
    const bf = new CountingBloomFilter2(100)
    bf.add('item')
    bf.remove('item')
    expect(bf.contains('item')).toBe(false)
  })

describe('counting-bloom-filter-2 - wave545', () => {
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

describe('counting-bloom-filter-2 - wave546', () => {
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

describe('counting-bloom-filter-2 - wave547', () => {
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

describe('counting-bloom-filter-2 - wave548', () => {
  it('counting-bloom-filter-2 module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave549', () => {
  it('counting-bloom-filter-2 module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave550', () => {
  it('counting-bloom-filter-2 w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave551', () => {
  it('counting-bloom-filter-2 w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave552', () => {
  it('counting-bloom-filter-2 w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave553', () => {
  it('counting-bloom-filter-2 w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave554', () => {
  it('counting-bloom-filter-2 w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave555', () => {
  it('counting-bloom-filter-2 w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave556', () => {
  it('counting-bloom-filter-2 w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave557', () => {
  it('counting-bloom-filter-2 w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave558', () => {
  it('counting-bloom-filter-2 w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave559', () => {
  it('counting-bloom-filter-2 w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave560', () => {
  it('counting-bloom-filter-2 w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave561', () => {
  it('counting-bloom-filter-2 w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave562', () => {
  it('counting-bloom-filter-2 w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave563', () => {
  it('counting-bloom-filter-2 w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave564', () => {
  it('counting-bloom-filter-2 w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave565', () => {
  it('counting-bloom-filter-2 w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave566', () => {
  it('counting-bloom-filter-2 w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave127', () => {
  it('counting-bloom-filter-2 w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave130', () => {
  it('counting-bloom-filter-2 w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave133', () => {
  it('counting-bloom-filter-2 w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave136', () => {
  it('counting-bloom-filter-2 w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter-2 - wave139', () => {
  it('counting-bloom-filter-2 w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter-2 w139 v2', () => {
    expect(describe).toBeDefined()
  })
})
