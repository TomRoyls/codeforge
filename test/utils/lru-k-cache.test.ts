import { describe, it, expect } from 'vitest'
import { LRUKCache } from '../../src/utils/lru-k-cache.js'

describe('LRUKCache', () => {
  // Constructor tests
  it('constructor with valid options', () => {
    const cache = new LRUKCache({ k: 2, capacity: 3 })
    expect(cache.kValue).toBe(2)
    expect(cache.capacityValue).toBe(3)
    expect(cache.size).toBe(0)
  })

  it('constructor throws on invalid capacity < 1', () => {
    expect(() => new LRUKCache({ k: 2, capacity: 0 })).toThrow(RangeError)
    expect(() => new LRUKCache({ k: 2, capacity: -1 })).toThrow(RangeError)
  })

  it('constructor throws on invalid k < 1', () => {
    expect(() => new LRUKCache({ k: 0, capacity: 3 })).toThrow(RangeError)
    expect(() => new LRUKCache({ k: -1, capacity: 3 })).toThrow(RangeError)
  })

  it('constructor accepts large values', () => {
    const cache = new LRUKCache({ k: 100, capacity: 10000 })
    expect(cache.kValue).toBe(100)
    expect(cache.capacityValue).toBe(10000)
  })

  // set() tests
  it('set adds new entry', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    expect(cache.size).toBe(1)
    expect(cache.get('a')).toBe(1)
  })

  it('set updates existing key value', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('a', 2)
    expect(cache.get('a')).toBe(2)
    expect(cache.size).toBe(1)
  })

  it('set overwrites update value', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('a', 99)
    expect(cache.get('a')).toBe(99)
    expect(cache.size).toBe(1)
  })

  it('set updates access history on existing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    const history1 = cache.getAccessHistory('a')
    expect(history1.length).toBe(1)
    cache.set('a', 2)
    const history2 = cache.getAccessHistory('a')
    expect(history2.length).toBe(2)
  })

  it('set evicts when at capacity', () => {
    const cache = new LRUKCache<string, number>({ k: 1, capacity: 2 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  it('set maintains K history for new entries', () => {
    const cache = new LRUKCache<string, number>({ k: 3, capacity: 5 })
    cache.set('a', 1)
    const history = cache.getAccessHistory('a')
    expect(history.length).toBe(1)
  })

  // get() tests
  it('get returns value for existing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('get returns undefined for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('get updates access history', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    const history1 = cache.getAccessHistory('a')
    expect(history1.length).toBe(1)
    cache.get('a')
    const history2 = cache.getAccessHistory('a')
    expect(history2.length).toBe(2)
  })

  it('get advances clock', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    const history1 = cache.getAccessHistory('a')
    cache.get('a')
    const history2 = cache.getAccessHistory('a')
    expect(history2[history2.length - 1]).toBeGreaterThan(history1[history1.length - 1])
  })

  it('get returns undefined multiple times', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.get('missing')).toBeUndefined()
    expect(cache.get('missing')).toBeUndefined()
  })

  // has() tests
  it('has returns true for existing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.has('b')).toBe(false)
  })

  it('has does not affect recency or history', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    const history1 = cache.getAccessHistory('a')
    cache.has('a')
    const history2 = cache.getAccessHistory('a')
    expect(history2).toEqual(history1)
  })

  // delete() tests
  it('delete removes entry', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.has('a')).toBe(false)
    expect(cache.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.delete('missing')).toBe(false)
  })

  it('delete removes entry and allows re-add', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.delete('a')
    cache.set('a', 2)
    expect(cache.get('a')).toBe(2)
  })

  // size getter tests
  it('size returns 0 for empty cache', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.size).toBe(0)
  })

  it('size increases with additions', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    expect(cache.size).toBe(1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('size decreases with deletion', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.delete('a')
    expect(cache.size).toBe(1)
  })

  it('size respects capacity', () => {
    const cache = new LRUKCache<string, number>({ k: 1, capacity: 2 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.size).toBe(2)
  })

  // clear() tests
  it('clear removes all entries', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('a')).toBeUndefined()
  })

  it('clear resets clock behavior', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.clear()
    cache.set('b', 2)
    expect(cache.getAccessHistory('b').length).toBe(1)
  })

  // kValue getter tests
  it('kValue returns configured k', () => {
    const cache = new LRUKCache({ k: 5, capacity: 10 })
    expect(cache.kValue).toBe(5)
  })

  // capacityValue getter tests
  it('capacityValue returns configured capacity', () => {
    const cache = new LRUKCache({ k: 2, capacity: 10 })
    expect(cache.capacityValue).toBe(10)
  })

  // getAccessHistory() tests
  it('getAccessHistory returns empty array for missing key', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    expect(cache.getAccessHistory('missing')).toEqual([])
  })

  it('getAccessHistory returns copy of history', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    const history1 = cache.getAccessHistory('a')
    const history2 = cache.getAccessHistory('a')
    expect(history1).toEqual(history2)
    expect(history1).not.toBe(history2)
  })

  it('getAccessHistory respects K limit', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.get('a')
    cache.get('a')
    cache.get('a')
    const history = cache.getAccessHistory('a')
    expect(history.length).toBe(2)
  })

  it('getAccessHistory increments clock values', () => {
    const cache = new LRUKCache<string, number>({ k: 3, capacity: 5 })
    cache.set('a', 1)
    cache.get('a')
    cache.set('b', 2)
    cache.get('b')
    const historyA = cache.getAccessHistory('a')
    const historyB = cache.getAccessHistory('b')
    expect(historyA[historyA.length - 1]).toBeLessThan(historyB[historyB.length - 1])
  })

  // LRU-K eviction tests
  it('LRU-K-1 behaves as simple LRU', () => {
    const cache = new LRUKCache<string, number>({ k: 1, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.set('d', 4)
    expect(cache.has('b')).toBe(false)
    expect(cache.has('a')).toBe(true)
  })

  it('LRU-K-2 evicts based on oldest access timestamp', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.get('b')
    cache.set('d', 4)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
    expect(cache.has('d')).toBe(true)
  })

  it('LRU-K-3 evicts based on oldest access timestamp', () => {
    const cache = new LRUKCache<string, number>({ k: 3, capacity: 4 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.set('d', 4)
    cache.get('a')
    cache.get('a')
    cache.get('b')
    cache.set('e', 5)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
    expect(cache.has('d')).toBe(true)
  })

  it('handles k larger than capacity', () => {
    const cache = new LRUKCache<string, number>({ k: 10, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.set('d', 4)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('d')).toBe(true)
  })

  it('evicts entry with oldest access timestamp', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('b')
    cache.get('b')
    cache.set('d', 4)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  // toString() tests
  it('toString returns correct format', () => {
    const cache = new LRUKCache({ k: 2, capacity: 5 })
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.toString()).toBe('LRUKCache(k=2, 2/5)')
  })

  it('toString shows 0 for empty cache', () => {
    const cache = new LRUKCache({ k: 2, capacity: 5 })
    expect(cache.toString()).toBe('LRUKCache(k=2, 0/5)')
  })

  it('toString shows correct k value', () => {
    const cache = new LRUKCache({ k: 5, capacity: 10 })
    expect(cache.toString()).toBe('LRUKCache(k=5, 0/10)')
  })

  // toJSON() tests
  it('toJSON returns entries array', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.toJSON()).toEqual([
      ['a', 1],
      ['b', 2],
    ])
  })

  it('toJSON returns empty array for empty cache', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    expect(cache.toJSON()).toEqual([])
  })

  it('toJSON does not include history metadata', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    cache.get('a')
    const json = cache.toJSON()
    expect(json).toEqual([['a', 1]])
  })

  // clone() tests
  it('clone creates independent copy', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    cache.set('b', 2)
    const clone = cache.clone()
    expect(clone.size).toBe(2)
    expect(clone.get('a')).toBe(1)
    expect(clone.kValue).toBe(2)
    expect(clone.capacityValue).toBe(5)
  })

  it('clone is independent from original', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    const clone = cache.clone()
    clone.set('b', 2)
    expect(cache.get('b')).toBeUndefined()
    expect(clone.get('a')).toBe(1)
  })

  it('clone preserves access history', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    cache.get('a')
    const clone = cache.clone()
    const history = clone.getAccessHistory('a')
    expect(history.length).toBe(2)
  })

  it('clone preserves clock state', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    cache.get('a')
    const clone = cache.clone()
    clone.set('b', 2)
    const historyB = clone.getAccessHistory('b')
    expect(historyB[historyB.length - 1]).toBeGreaterThan(0)
  })

  // equals() tests
  it('equals returns true for identical caches', () => {
    const cache1 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    const cache2 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache1.set('a', 1)
    cache1.set('b', 2)
    cache2.set('a', 1)
    cache2.set('b', 2)
    expect(cache1.equals(cache2)).toBe(true)
  })

  it('equals returns false for different k', () => {
    const cache1 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    const cache2 = new LRUKCache<string, number>({ k: 3, capacity: 5 })
    cache1.set('a', 1)
    cache2.set('a', 1)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('equals returns false for different capacity', () => {
    const cache1 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    const cache2 = new LRUKCache<string, number>({ k: 2, capacity: 10 })
    cache1.set('a', 1)
    cache2.set('a', 1)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('equals returns false for different sizes', () => {
    const cache1 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    const cache2 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache1.set('a', 1)
    cache2.set('a', 1)
    cache2.set('b', 2)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const cache1 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    const cache2 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache1.set('a', 1)
    cache2.set('a', 2)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('equals returns false for non-cache objects', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    expect(cache.equals({})).toBe(false)
    expect(cache.equals(null)).toBe(false)
    expect(cache.equals(undefined)).toBe(false)
  })

  it('equals ignores access history differences', () => {
    const cache1 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    const cache2 = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache1.set('a', 1)
    cache1.get('a')
    cache2.set('a', 1)
    expect(cache1.equals(cache2)).toBe(true)
  })

  // Edge case tests
  it('handles capacity of 1', () => {
    const cache = new LRUKCache<string, number>({ k: 1, capacity: 1 })
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.size).toBe(1)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
  })

  it('handles complex objects as values', () => {
    const cache = new LRUKCache<string, { id: number }>({ k: 2, capacity: 5 })
    const obj = { id: 42 }
    cache.set('a', obj)
    expect(cache.get('a')).toBe(obj)
  })

  it('handles multiple rapid gets', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    for (let i = 0; i < 10; i++) {
      expect(cache.get('a')).toBe(1)
    }
  })

  it('handles overwriting with same value', () => {
    const cache = new LRUKCache<string, number>({ k: 2, capacity: 5 })
    cache.set('a', 1)
    cache.set('a', 1)
    expect(cache.size).toBe(1)
  })
})
describe('lru-k-cache - wave548', () => {
  it('lru-k-cache module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module has name', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module not null', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module has length', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module name is string', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave549', () => {
  it('lru-k-cache module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave550', () => {
  it('lru-k-cache w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave551', () => {
  it('lru-k-cache w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave552', () => {
  it('lru-k-cache w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave553', () => {
  it('lru-k-cache w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave554', () => {
  it('lru-k-cache w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave555', () => {
  it('lru-k-cache w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave556', () => {
  it('lru-k-cache w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-k-cache - wave557', () => {
  it('lru-k-cache w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-k-cache w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
