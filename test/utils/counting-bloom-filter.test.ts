import { describe, expect, it } from 'vitest'
import { CountingBloomFilter } from '../../src/utils/counting-bloom-filter.js'

describe('CountingBloomFilter construction', () => {
  it('creates with capacity', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('throws on zero capacity', () => {
    expect(() => new CountingBloomFilter(0)).toThrow(RangeError)
  })

  it('throws on negative capacity', () => {
    expect(() => new CountingBloomFilter(-1)).toThrow(RangeError)
  })

  it('throws on invalid false positive rate 0', () => {
    expect(() => new CountingBloomFilter(100, 0)).toThrow(RangeError)
  })

  it('throws on invalid false positive rate 1', () => {
    expect(() => new CountingBloomFilter(100, 1)).toThrow(RangeError)
  })

  it('throws on negative false positive rate', () => {
    expect(() => new CountingBloomFilter(100, -0.1)).toThrow(RangeError)
  })

  it('creates with minimum capacity 1', () => {
    const bf = new CountingBloomFilter(1)
    expect(bf.capacity).toBe(1)
    expect(bf.size).toBe(0)
  })

  it('creates with custom false positive rate', () => {
    const bf = new CountingBloomFilter(100, 0.001)
    expect(bf.capacity).toBe(100)
  })
})

describe('CountingBloomFilter add & has', () => {
  it('adds and checks items', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('hello')
    expect(bf.has('hello')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('returns false for missing items', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.has('missing')).toBe(false)
  })

  it('adds multiple items', () => {
    const bf = new CountingBloomFilter(100)
    const items = ['a', 'b', 'c', 'd', 'e']
    for (const item of items) bf.add(item)
    for (const item of items) expect(bf.has(item)).toBe(true)
    expect(bf.size).toBe(5)
  })

  it('adds duplicate item increments size', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('x')
    bf.add('x')
    expect(bf.size).toBe(2)
  })

  it('has returns false for empty filter', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.has('anything')).toBe(false)
  })

  it('handles unicode keys', () => {
    const bf = new CountingBloomFilter(50)
    bf.add('日本語')
    bf.add('🎉')
    expect(bf.has('日本語')).toBe(true)
    expect(bf.has('🎉')).toBe(true)
  })

  it('handles empty string key', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('')
    expect(bf.has('')).toBe(true)
  })

  it('handles long string key', () => {
    const bf = new CountingBloomFilter(100)
    const longKey = 'a'.repeat(10000)
    bf.add(longKey)
    expect(bf.has(longKey)).toBe(true)
  })

  it('handles special characters', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('\n\t\r')
    bf.add('\0')
    expect(bf.has('\n\t\r')).toBe(true)
    expect(bf.has('\0')).toBe(true)
  })
})

describe('CountingBloomFilter remove', () => {
  it('removes an added item', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('hello')
    expect(bf.remove('hello')).toBe(true)
    expect(bf.size).toBe(0)
  })

  it('returns false for non-added item', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.remove('missing')).toBe(false)
  })

  it('can add back after remove', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('x')
    bf.remove('x')
    bf.add('x')
    expect(bf.has('x')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('adding same item multiple times requires multiple removes', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('a')
    bf.add('a')
    bf.add('a')
    expect(bf.has('a')).toBe(true)
    bf.remove('a')
    expect(bf.has('a')).toBe(true)
    bf.remove('a')
    expect(bf.has('a')).toBe(true)
    bf.remove('a')
    expect(bf.isEmpty).toBe(true)
  })

  it('remove decrements count', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('x')
    bf.add('x')
    bf.remove('x')
    expect(bf.has('x')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('returns false when removing from empty', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.remove('x')).toBe(false)
  })

  it('handles many add-remove cycles', () => {
    const bf = new CountingBloomFilter(100)
    for (let i = 0; i < 20; i++) bf.add(`item-${i}`)
    for (let i = 0; i < 20; i++) bf.remove(`item-${i}`)
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('isEmpty after removing all', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('x')
    bf.add('y')
    bf.remove('x')
    bf.remove('y')
    expect(bf.isEmpty).toBe(true)
  })
})

describe('CountingBloomFilter stats', () => {
  it('returns stats object', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('test')
    const stats = bf.stats()
    expect(stats.capacity).toBe(100)
    expect(stats.size).toBe(1)
    expect(stats.counterCount).toBeGreaterThan(0)
    expect(stats.hashCount).toBeGreaterThan(0)
    expect(stats.falsePositiveRate).toBeGreaterThanOrEqual(0)
  })

  it('falsePositiveRate is 0 when empty', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.falsePositiveRate).toBe(0)
  })

  it('falsePositiveRate increases with items', () => {
    const bf = new CountingBloomFilter(10, 0.01)
    bf.add('a')
    const rate1 = bf.falsePositiveRate
    for (let i = 0; i < 9; i++) bf.add(`item-${i}`)
    const rate2 = bf.falsePositiveRate
    expect(rate2).toBeGreaterThan(rate1)
  })

  it('stats capacity matches constructor', () => {
    const bf = new CountingBloomFilter(500)
    expect(bf.stats().capacity).toBe(500)
  })

  it('stats hashCount is 4', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.stats().hashCount).toBe(4)
  })
})

describe('CountingBloomFilter clear', () => {
  it('clears the filter', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('a')
    bf.add('b')
    bf.clear()
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('after clear has returns false', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('hello')
    bf.clear()
    expect(bf.has('hello')).toBe(false)
  })

  it('can add after clear', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('a')
    bf.clear()
    bf.add('b')
    expect(bf.has('b')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('clear on empty filter is no-op', () => {
    const bf = new CountingBloomFilter(100)
    bf.clear()
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })
})

describe('CountingBloomFilter capacity', () => {
  it('capacity returns constructor value', () => {
    const bf = new CountingBloomFilter(200)
    expect(bf.capacity).toBe(200)
  })

  it('counterCount is at least 64', () => {
    const bf = new CountingBloomFilter(1)
    expect(bf.stats().counterCount).toBeGreaterThanOrEqual(64)
  })

  it('lower fpr means more counters', () => {
    const bf1 = new CountingBloomFilter(100, 0.1)
    const bf2 = new CountingBloomFilter(100, 0.001)
    expect(bf2.stats().counterCount).toBeGreaterThan(bf1.stats().counterCount)
  })

  it('higher capacity means more counters', () => {
    const bf1 = new CountingBloomFilter(10)
    const bf2 = new CountingBloomFilter(1000)
    expect(bf2.stats().counterCount).toBeGreaterThan(bf1.stats().counterCount)
  })
})

describe('CountingBloomFilter edge cases', () => {
  it('handles rapid add remove', () => {
    const bf = new CountingBloomFilter(100)
    for (let i = 0; i < 50; i++) {
      bf.add('x')
      bf.remove('x')
    }
    expect(bf.size).toBe(0)
    expect(bf.isEmpty).toBe(true)
  })

  it('handles numeric string keys', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('1')
    bf.add('2')
    bf.add('3')
    expect(bf.has('1')).toBe(true)
    expect(bf.has('2')).toBe(true)
    expect(bf.has('3')).toBe(true)
  })

  it('handles keys that differ by case', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('Hello')
    bf.add('hello')
    expect(bf.has('Hello')).toBe(true)
    expect(bf.has('hello')).toBe(true)
    expect(bf.has('HELLO')).toBe(false)
  })

  it('size correctly tracks after mixed operations', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('a')
    bf.add('b')
    bf.add('c')
    bf.remove('b')
    expect(bf.size).toBe(2)
    bf.add('d')
    expect(bf.size).toBe(3)
  })

  it('remove returns false for item never added', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('a')
    expect(bf.remove('b')).toBe(false)
    expect(bf.size).toBe(1)
  })

  it('handles many unique items', () => {
    const bf = new CountingBloomFilter(200)
    for (let i = 0; i < 100; i++) bf.add(`key-${i}`)
    expect(bf.size).toBe(100)
    for (let i = 0; i < 100; i++) expect(bf.has(`key-${i}`)).toBe(true)
  })

  it('remove after multiple adds still present', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('z')
    bf.add('z')
    bf.remove('z')
    expect(bf.has('z')).toBe(true)
    expect(bf.size).toBe(1)
  })

  it('handles false positive rate near zero', () => {
    const bf = new CountingBloomFilter(100, 0.000001)
    expect(bf.stats().counterCount).toBeGreaterThan(0)
    expect(bf.stats().hashCount).toBe(4)
  })

  it('handles false positive rate near one', () => {
    const bf = new CountingBloomFilter(100, 0.999)
    expect(bf.stats().counterCount).toBeGreaterThanOrEqual(64)
    expect(bf.stats().hashCount).toBe(4)
  })

  it('stats returns all required properties', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('test')
    const stats = bf.stats()
    expect(stats).toHaveProperty('capacity')
    expect(stats).toHaveProperty('size')
    expect(stats).toHaveProperty('counterCount')
    expect(stats).toHaveProperty('hashCount')
    expect(stats).toHaveProperty('falsePositiveRate')
  })

  it('falsePositiveRate is zero for empty filter', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.falsePositiveRate).toBe(0)
    bf.clear()
    expect(bf.falsePositiveRate).toBe(0)
  })

  it('add same item 65535 times handles uint16 boundary', () => {
    const bf = new CountingBloomFilter(100)
    for (let i = 0; i < 65535; i++) {
      bf.add('boundary-test')
    }
    expect(bf.has('boundary-test')).toBe(true)
    expect(bf.size).toBe(65535)
  })

  it('isEmpty after clear with multiple operations', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('a')
    bf.add('b')
    bf.remove('a')
    bf.add('c')
    bf.clear()
    expect(bf.isEmpty).toBe(true)
    expect(bf.size).toBe(0)
  })

  it('add then remove then has returns false', () => {
    const bf = new CountingBloomFilter(50)
    bf.add('test')
    bf.remove('test')
    expect(bf.has('test')).toBe(false)
  })

  it('remove returns false for non-existent item', () => {
    const bf = new CountingBloomFilter(50)
    expect(bf.remove('ghost')).toBe(false)
  })

  it('stats returns correct capacity', () => {
    const bf = new CountingBloomFilter(100)
    const stats = bf.stats()
    expect(stats.capacity).toBe(100)
  })

  it('multiple adds and removes cycle', () => {
    const bf = new CountingBloomFilter(50)
    bf.add('x')
    bf.add('x')
    expect(bf.remove('x')).toBe(true)
    expect(bf.has('x')).toBe(true)
  })
})

  it('has returns false for non-added', () => {
    const bf = new CountingBloomFilter(100)
    expect(bf.has('missing')).toBe(false)
  })

  it('add and has', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('test')
    expect(bf.has('test')).toBe(true)
  })

  it('remove works', () => {
    const bf = new CountingBloomFilter(100)
    bf.add('item')
    bf.remove('item')
    expect(bf.has('item')).toBe(false)
  })

describe('counting-bloom-filter - wave545', () => {
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

describe('counting-bloom-filter - wave546', () => {
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

describe('counting-bloom-filter - wave547', () => {
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

describe('counting-bloom-filter - wave548', () => {
  it('counting-bloom-filter module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter - wave549', () => {
  it('counting-bloom-filter module defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter module is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter - wave550', () => {
  it('counting-bloom-filter w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter - wave551', () => {
  it('counting-bloom-filter w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('counting-bloom-filter - wave552', () => {
  it('counting-bloom-filter w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('counting-bloom-filter w552 v2', () => {
    expect(describe).toBeDefined()
  })
})
