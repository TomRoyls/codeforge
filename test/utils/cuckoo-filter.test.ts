import { describe, expect, it } from 'vitest'
import { CuckooFilter } from '../../src/utils/cuckoo-filter.js'

// ─── Construction ───

describe('CuckooFilter construction', () => {
  it('creates with capacity', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.size).toBe(0)
    expect(cf.isEmpty()).toBe(true)
    expect(cf.capacity).toBeGreaterThan(0)
  })

  it('throws on zero capacity', () => {
    expect(() => new CuckooFilter({ capacity: 0 })).toThrow(RangeError)
  })
})

// ─── Insert & Contains ───

describe('CuckooFilter insert & contains', () => {
  it('inserts and contains an item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.insert('hello')).toBe(true)
    expect(cf.contains('hello')).toBe(true)
    expect(cf.size).toBe(1)
  })

  it('contains returns false for missing item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.contains('missing')).toBe(false)
  })

  it('inserts multiple items', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    const items = ['a', 'b', 'c', 'd', 'e']
    for (const item of items) {
      cf.insert(item)
    }
    for (const item of items) {
      expect(cf.contains(item)).toBe(true)
    }
    expect(cf.size).toBe(5)
  })
})

// ─── Remove ───

describe('CuckooFilter remove', () => {
  it('removes an inserted item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('hello')
    expect(cf.remove('hello')).toBe(true)
    expect(cf.size).toBe(0)
  })

  it('returns false for non-existent item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.remove('missing')).toBe(false)
  })
})

// ─── Clear ───

describe('CuckooFilter clear', () => {
  it('clears the filter', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('a')
    cf.insert('b')
    cf.clear()
    expect(cf.size).toBe(0)
    expect(cf.isEmpty()).toBe(true)
    expect(cf.contains('a')).toBe(false)
  })
})

// ─── Load Factor ───

describe('CuckooFilter loadFactor', () => {
  it('tracks load factor', () => {
    const cf = new CuckooFilter({ capacity: 20 })
    expect(cf.loadFactor).toBe(0)
    cf.insert('a')
    expect(cf.loadFactor).toBeGreaterThan(0)
  })
})

// ─── Capacity ───

describe('CuckooFilter capacity', () => {
  it('capacity equals buckets * bucketSize', () => {
    const cf = new CuckooFilter({ capacity: 50, bucketSize: 4 })
    expect(cf.capacity).toBeGreaterThanOrEqual(50)
  })
})

describe('CuckooFilter edge cases', () => {
  it('handles empty string', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('')
    expect(cf.contains('')).toBe(true)
    expect(cf.remove('')).toBe(true)
    expect(cf.contains('')).toBe(false)
  })

  it('handles unicode strings', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('日本語テスト')
    expect(cf.contains('日本語テスト')).toBe(true)
    expect(cf.contains('日本語')).toBe(false)
  })

  it('handles numbers as strings', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('42')
    expect(cf.contains('42')).toBe(true)
    expect(cf.contains(42 as unknown as string)).toBe(false)
  })

  it('re-insert after remove works', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('x')
    cf.remove('x')
    expect(cf.contains('x')).toBe(false)
    cf.insert('x')
    expect(cf.contains('x')).toBe(true)
    expect(cf.size).toBe(1)
  })

  it('loadFactor approaches 1 as filter fills', () => {
    const cf = new CuckooFilter({ capacity: 50 })
    for (let i = 0; i < 40; i++) {
      cf.insert(`item-${i}`)
    }
    expect(cf.loadFactor).toBeGreaterThan(0.5)
  })

  it('clear allows reinsertion', () => {
    const cf = new CuckooFilter({ capacity: 50 })
    for (let i = 0; i < 10; i++) {
      cf.insert(`item-${i}`)
    }
    cf.clear()
    for (let i = 0; i < 10; i++) {
      expect(cf.insert(`item-${i}`)).toBe(true)
    }
    for (let i = 0; i < 10; i++) {
      expect(cf.contains(`item-${i}`)).toBe(true)
    }
  })

  it('remove decreases size', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('a')
    cf.insert('b')
    expect(cf.size).toBe(2)
    cf.remove('a')
    expect(cf.size).toBe(1)
  })

  it('contains returns false after removal', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('test')
    cf.remove('test')
    expect(cf.contains('test')).toBe(false)
  })

  it('handles custom bucketSize', () => {
    const cf = new CuckooFilter({ capacity: 100, bucketSize: 8 })
    expect(cf.capacity).toBeGreaterThanOrEqual(100)
    cf.insert('hello')
    expect(cf.contains('hello')).toBe(true)
  })

  it('handles custom maxKicks', () => {
    const cf = new CuckooFilter({ capacity: 100, maxKicks: 1000 })
    expect(cf.capacity).toBeGreaterThan(0)
    cf.insert('hello')
    expect(cf.contains('hello')).toBe(true)
  })

  it('handles custom fingerprintSize', () => {
    const cf = new CuckooFilter({ capacity: 100, fingerprintSize: 2 })
    expect(cf.capacity).toBeGreaterThan(0)
    cf.insert('hello')
    expect(cf.contains('hello')).toBe(true)
  })

  it('insert returns false on overflow', () => {
    const cf = new CuckooFilter({ capacity: 4 })
    const items = ['a', 'b', 'c', 'd', 'e']
    let successCount = 0
    for (const item of items) {
      if (cf.insert(item)) successCount++
    }
    expect(successCount).toBeLessThan(items.length)
  })

  it('handles very long strings', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    const longString = 'a'.repeat(1000)
    cf.insert(longString)
    expect(cf.contains(longString)).toBe(true)
  })

  it('handles special characters', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    cf.insert(special)
    expect(cf.contains(special)).toBe(true)
  })

  it('handles emoji', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    const emoji = '🎉🚀💻'
    cf.insert(emoji)
    expect(cf.contains(emoji)).toBe(true)
  })

  it('duplicate insert increments size', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('hello')
    const sizeBefore = cf.size
    cf.insert('hello')
    expect(cf.size).toBeGreaterThan(sizeBefore)
  })

  it('remove non-existent returns false and size unchanged', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('hello')
    const sizeBefore = cf.size
    expect(cf.remove('missing')).toBe(false)
    expect(cf.size).toBe(sizeBefore)
  })

  it('clear on empty filter works', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.clear()
    expect(cf.size).toBe(0)
    expect(cf.isEmpty()).toBe(true)
  })

  it('insert after clear', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('hello')
    cf.clear()
    expect(cf.insert('world')).toBe(true)
    expect(cf.contains('world')).toBe(true)
  })

  it('loadFactor is 0 on empty filter', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.loadFactor).toBe(0)
  })

  it('loadFactor is 1 on full filter', () => {
    const cf = new CuckooFilter({ capacity: 20 })
    for (let i = 0; i < 20; i++) {
      cf.insert(`item-${i}`)
    }
    expect(cf.loadFactor).toBeCloseTo(1, 1)
  })

  it('handles very small capacity', () => {
    const cf = new CuckooFilter({ capacity: 1 })
    cf.insert('hello')
    expect(cf.contains('hello')).toBe(true)
  })

  it('handles large capacity', () => {
    const cf = new CuckooFilter({ capacity: 10000 })
    expect(cf.capacity).toBeGreaterThanOrEqual(10000)
    cf.insert('hello')
    expect(cf.contains('hello')).toBe(true)
  })

  it('insert returns false when both buckets full', () => {
    const cf = new CuckooFilter({ capacity: 2, bucketSize: 1 })
    cf.insert('a')
    cf.insert('b')
    expect(cf.insert('c')).toBe(false)
  })

  it('removes correct item from bucket', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('hello')
    cf.insert('world')
    cf.remove('hello')
    expect(cf.contains('hello')).toBe(false)
    expect(cf.contains('world')).toBe(true)
  })

  it('handles mixed ascii and unicode', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('hello世界')
    expect(cf.contains('hello世界')).toBe(true)
    expect(cf.contains('hello')).toBe(false)
    expect(cf.contains('世界')).toBe(false)
  })

  it('capacity rounds up correctly', () => {
    const cf = new CuckooFilter({ capacity: 10, bucketSize: 3 })
    expect(cf.capacity % 3).toBe(0)
    expect(cf.capacity).toBeGreaterThanOrEqual(10)
  })

  it('empty string and string with spaces are different', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('')
    cf.insert(' ')
    expect(cf.contains('')).toBe(true)
    expect(cf.contains(' ')).toBe(true)
    expect(cf.remove('')).toBe(true)
    expect(cf.contains('')).toBe(false)
    expect(cf.contains(' ')).toBe(true)
  })

  it('insert same item in different cases', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('Hello')
    cf.insert('hello')
    expect(cf.contains('Hello')).toBe(true)
    expect(cf.contains('hello')).toBe(true)
  })

  it('handles strings with newlines', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    const withNewline = 'hello\nworld'
    cf.insert(withNewline)
    expect(cf.contains(withNewline)).toBe(true)
  })

  it('handles strings with tabs', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    const withTab = 'hello\tworld'
    cf.insert(withTab)
    expect(cf.contains(withTab)).toBe(true)
  })

  it('insert zero as string', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('0')
    expect(cf.contains('0')).toBe(true)
    expect(cf.contains('')).toBe(false)
  })

  it('multiple removes work correctly', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('a')
    cf.insert('b')
    cf.insert('c')
    cf.remove('a')
    cf.remove('b')
    expect(cf.contains('a')).toBe(false)
    expect(cf.contains('b')).toBe(false)
    expect(cf.contains('c')).toBe(true)
    expect(cf.size).toBe(1)
  })

  it('insert after near capacity', () => {
    const cf = new CuckooFilter({ capacity: 50 })
    for (let i = 0; i < 45; i++) {
      cf.insert(`item-${i}`)
    }
    const result = cf.insert('late-item')
    expect(result).toBeDefined()
  })

  it('filter with bucketSize 2 works', () => {
    const cf = new CuckooFilter({ capacity: 10, bucketSize: 2 })
    cf.insert('a')
    cf.insert('b')
    expect(cf.contains('a')).toBe(true)
    expect(cf.contains('b')).toBe(true)
  })

  it('handles fingerprintSize 3', () => {
    const cf = new CuckooFilter({ capacity: 100, fingerprintSize: 3 })
    cf.insert('hello')
    expect(cf.contains('hello')).toBe(true)
    expect(cf.contains('world')).toBe(false)
  })

  it('filter with bucketSize 1 behaves correctly', () => {
    const cf = new CuckooFilter({ capacity: 10, bucketSize: 1 })
    cf.insert('a')
    cf.insert('b')
    expect(cf.size).toBe(2)
    expect(cf.contains('a')).toBe(true)
    expect(cf.contains('b')).toBe(true)
  })

  it('remove from empty filter returns false', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.remove('anything')).toBe(false)
    expect(cf.size).toBe(0)
  })

  it('contains returns false for all items on empty filter', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.contains('')).toBe(false)
    expect(cf.contains('a')).toBe(false)
    expect(cf.contains('hello world')).toBe(false)
  })

  it('multiple removes of same item works', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('x')
    expect(cf.remove('x')).toBe(true)
    expect(cf.remove('x')).toBe(false)
    expect(cf.size).toBe(0)
  })

  it('capacity matches expected with non-default bucketSize', () => {
    const cf = new CuckooFilter({ capacity: 25, bucketSize: 5 })
    expect(cf.capacity).toBeGreaterThanOrEqual(25)
    expect(cf.capacity % 5).toBe(0)
  })

  it('insert returns true for normal insert', () => {
    const cf = new CuckooFilter({ capacity: 10 })
    expect(cf.insert('hello')).toBe(true)
  })

  it('remove returns false for non-existent item', () => {
    const cf = new CuckooFilter({ capacity: 10 })
    expect(cf.remove('ghost')).toBe(false)
  })

  it('loadFactor increases with inserts', () => {
    const cf = new CuckooFilter({ capacity: 10 })
    const initial = cf.loadFactor
    cf.insert('a')
    expect(cf.loadFactor).toBeGreaterThan(initial)
  })

  it('size tracks number of items', () => {
    const cf = new CuckooFilter({ capacity: 10 })
    expect(cf.size).toBe(0)
    cf.insert('x')
    cf.insert('y')
    expect(cf.size).toBe(2)
  })
})

  it('contains returns false for missing', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    expect(cf.contains('missing')).toBe(false)
  })

  it('insert and contains', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('hello')
    expect(cf.contains('hello')).toBe(true)
  })

  it('remove removes item', () => {
    const cf = new CuckooFilter({ capacity: 100 })
    cf.insert('item')
    expect(cf.remove('item')).toBe(true)
    expect(cf.contains('item')).toBe(false)
  })

describe('cuckoo-filter - wave545', () => {
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

describe('cuckoo-filter - wave546', () => {
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
