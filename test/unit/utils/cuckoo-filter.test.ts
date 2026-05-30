import { describe, expect, it } from 'vitest'
import { CuckooFilter } from '../../../src/utils/cuckoo-filter.js'

describe('CuckooFilter', () => {
  it('creates filter with capacity', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    expect(filter).toBeInstanceOf(CuckooFilter)
  })

  it('throws error for capacity less than 1', () => {
    expect(() => new CuckooFilter({ capacity: 0 })).toThrow(RangeError)
    expect(() => new CuckooFilter({ capacity: -1 })).toThrow(RangeError)
  })

  it('inserts single item successfully', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    expect(filter.insert('hello')).toBe(true)
  })

  it('contains inserted item', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('hello')
    expect(filter.contains('hello')).toBe(true)
  })

  it('does not contain non-existent item', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    expect(filter.contains('nonexistent')).toBe(false)
  })

  it('removes existing item', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('hello')
    expect(filter.remove('hello')).toBe(true)
    expect(filter.contains('hello')).toBe(false)
  })

  it('does not remove non-existent item', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    expect(filter.remove('nonexistent')).toBe(false)
  })

  it('returns correct size after insert', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    expect(filter.size).toBe(0)
    filter.insert('item1')
    expect(filter.size).toBe(1)
    filter.insert('item2')
    expect(filter.size).toBe(2)
  })

  it('returns correct capacity', () => {
    const filter = new CuckooFilter({ capacity: 100, bucketSize: 4 })
    expect(filter.capacity).toBe(100)
  })

  it('returns correct load factor', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    expect(filter.loadFactor).toBe(0)
    filter.insert('item1')
    filter.insert('item2')
    filter.insert('item3')
    expect(filter.loadFactor).toBeCloseTo(0.03, 2)
  })

  it('isEmpty returns true for empty filter', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    expect(filter.isEmpty()).toBe(true)
  })

  it('isEmpty returns false after insert', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('item')
    expect(filter.isEmpty()).toBe(false)
  })

  it('clear empties the filter', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('item1')
    filter.insert('item2')
    filter.insert('item3')
    filter.clear()
    expect(filter.size).toBe(0)
    expect(filter.isEmpty()).toBe(true)
  })

  it('handles multiple inserts successfully', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    for (let i = 0; i < 50; i++) {
      expect(filter.insert(`item${i}`)).toBe(true)
    }
  })

  it('contains multiple inserted items', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    const items = ['a', 'b', 'c', 'd', 'e']
    items.forEach(item => filter.insert(item))
    items.forEach(item => {
      expect(filter.contains(item)).toBe(true)
    })
  })

  it('removes multiple items', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    const items = ['a', 'b', 'c', 'd', 'e']
    items.forEach(item => filter.insert(item))
    filter.remove('b')
    filter.remove('d')
    expect(filter.contains('a')).toBe(true)
    expect(filter.contains('b')).toBe(false)
    expect(filter.contains('c')).toBe(true)
    expect(filter.contains('d')).toBe(false)
    expect(filter.contains('e')).toBe(true)
  })

  it('updates size after removal', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('a')
    filter.insert('b')
    filter.insert('c')
    expect(filter.size).toBe(3)
    filter.remove('b')
    expect(filter.size).toBe(2)
  })

  it('handles items approaching capacity', () => {
    const filter = new CuckooFilter({ capacity: 50 })
    for (let i = 0; i < 40; i++) {
      filter.insert(`item${i}`)
    }
    expect(filter.size).toBe(40)
    expect(filter.loadFactor).toBeGreaterThan(0.7)
  })

  it('re-inserts removed item', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('hello')
    filter.remove('hello')
    expect(filter.insert('hello')).toBe(true)
    expect(filter.contains('hello')).toBe(true)
  })

  it('clears multiple times safely', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('item')
    filter.clear()
    filter.clear()
    expect(filter.size).toBe(0)
  })

  it('has correct capacity with small bucket size', () => {
    const filter = new CuckooFilter({ capacity: 20, bucketSize: 2 })
    expect(filter.capacity).toBe(20)
  })

  it('has correct capacity with large bucket size', () => {
    const filter = new CuckooFilter({ capacity: 100, bucketSize: 8 })
    expect(filter.capacity).toBeGreaterThanOrEqual(100)
  })

  it('handles empty string', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    expect(filter.insert('')).toBe(true)
    expect(filter.contains('')).toBe(true)
  })

  it('handles long strings', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    const longString = 'a'.repeat(1000)
    expect(filter.insert(longString)).toBe(true)
    expect(filter.contains(longString)).toBe(true)
  })

  it('handles special characters', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    expect(filter.insert(specialChars)).toBe(true)
    expect(filter.contains(specialChars)).toBe(true)
  })

  it('handles unicode characters', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    const unicode = '你好世界🌍'
    expect(filter.insert(unicode)).toBe(true)
    expect(filter.contains(unicode)).toBe(true)
  })

  it('has low false positive rate', () => {
    const filter = new CuckooFilter({ capacity: 1000 })
    const insertedItems = new Set()
    for (let i = 0; i < 500; i++) {
      const item = `item${i}`
      filter.insert(item)
      insertedItems.add(item)
    }
    let falsePositives = 0
    for (let i = 500; i < 600; i++) {
      if (filter.contains(`item${i}`)) {
        falsePositives++
      }
    }
    expect(falsePositives).toBeLessThan(10)
  })

  it('has low false negative rate', () => {
    const filter = new CuckooFilter({ capacity: 1000 })
    const items = []
    for (let i = 0; i < 500; i++) {
      const item = `item${i}`
      const inserted = filter.insert(item)
      if (inserted) {
        items.push(item)
      }
    }
    let falseNegatives = 0
    items.forEach(item => {
      if (!filter.contains(item)) {
        falseNegatives++
      }
    })
    expect(falseNegatives).toBeLessThan(5)
  })

  it('removes item and does not contain it', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('test')
    expect(filter.contains('test')).toBe(true)
    filter.remove('test')
    expect(filter.contains('test')).toBe(false)
  })

  it('handles removal of non-existent item without error', () => {
    const filter = new CuckooFilter({ capacity: 100 })
    filter.insert('item1')
    expect(filter.remove('nonexistent')).toBe(false)
    expect(filter.contains('item1')).toBe(true)
  })
})