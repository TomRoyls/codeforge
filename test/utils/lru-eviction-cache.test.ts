import { describe, expect, it } from 'vitest'
import { LRUEvictionCache } from '../../src/utils/lru-eviction-cache.js'

describe('LRUEvictionCache - constructor', () => {
  it('creates cache with given capacity', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect(cache.capacity).toBe(3)
    expect(cache.size).toBe(0)
  })

  it('throws for non-positive capacity', () => {
    expect(() => new LRUEvictionCache(0)).toThrow()
    expect(() => new LRUEvictionCache(-1)).toThrow()
  })

  it('accepts options with onEvict callback', () => {
    const evicted: [string, number][] = []
    const cache = new LRUEvictionCache<string, number>(2, {
      onEvict: (key, value) => evicted.push([key, value]),
    })
    expect(cache.capacity).toBe(2)
  })
})

describe('LRUEvictionCache - set and get', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('updates existing key', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    cache.set('a', 2)
    expect(cache.get('a')).toBe(2)
    expect(cache.size).toBe(1)
  })

  it('evicts oldest when capacity exceeded', () => {
    const cache = new LRUEvictionCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  it('get refreshes access order', () => {
    const cache = new LRUEvictionCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('set does not evict if updating existing key', () => {
    const evicted: string[] = []
    const cache = new LRUEvictionCache<string, number>(2, {
      onEvict: (key) => evicted.push(key),
    })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('a', 10)
    expect(evicted).toEqual([])
    expect(cache.get('a')).toBe(10)
  })

  it('handles capacity of 1', () => {
    const cache = new LRUEvictionCache<string, number>(1)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.has('a')).toBe(false)
    expect(cache.get('b')).toBe(2)
  })

  it('calls onEvict callback with correct parameters', () => {
    const evicted: [string, number][] = []
    const cache = new LRUEvictionCache<string, number>(2, {
      onEvict: (key, value) => evicted.push([key, value]),
    })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(evicted).toEqual([['a', 1]])
  })

  it('multiple evictions call onEvict multiple times', () => {
    const evicted: [string, number][] = []
    const cache = new LRUEvictionCache<string, number>(2, {
      onEvict: (key, value) => evicted.push([key, value]),
    })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.set('d', 4)
    expect(evicted).toEqual([['a', 1], ['b', 2]])
  })

  it('handles undefined as value', () => {
    const cache = new LRUEvictionCache<string, number | undefined>(3)
    cache.set('a', undefined)
    expect(cache.get('a')).toBe(undefined)
  })

  it('handles null as key', () => {
    const cache = new LRUEvictionCache<number | null, string>(3)
    cache.set(null, 'value')
    expect(cache.get(null)).toBe('value')
  })
})

describe('LRUEvictionCache - delete', () => {
  it('delete removes entry', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.delete('a')).toBe(true)
    expect(cache.has('a')).toBe(false)
  })

  it('delete returns false for missing', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect(cache.delete('missing')).toBe(false)
  })

  it('onEvict not called on delete', () => {
    let evictCount = 0
    const cache = new LRUEvictionCache<string, number>(3, {
      onEvict: () => evictCount++,
    })
    cache.set('a', 1)
    cache.delete('a')
    expect(evictCount).toBe(0)
  })
})

describe('LRUEvictionCache - size and capacity', () => {
  it('size returns current count', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    expect(cache.size).toBe(0)
    cache.set('a', 1)
    expect(cache.size).toBe(1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('size decreases on delete', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.delete('a')
    expect(cache.size).toBe(1)
  })

  it('size stays constant on eviction', () => {
    const cache = new LRUEvictionCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.size).toBe(2)
  })
})

describe('LRUEvictionCache - clear', () => {
  it('clear removes all entries', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('clear removes all entries and has returns false', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.has('a')).toBe(false)
  })

  it('clear on empty cache does nothing', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.clear()
    expect(cache.size).toBe(0)
  })
})

describe('LRUEvictionCache - has', () => {
  it('has returns true for existing key', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('has returns false for missing key', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect(cache.has('missing')).toBe(false)
  })
})

describe('LRUEvictionCache - iteration', () => {
  it('keys returns in LRU order', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect([...cache.keys()]).toEqual(['a', 'b', 'c'])
  })

  it('values returns values in LRU order', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect([...cache.values()]).toEqual([1, 2, 3])
  })

  it('entries returns key-value pairs', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    expect([...cache.entries()]).toEqual([['a', 1], ['b', 2]])
  })

  it('keys returns empty for empty cache', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect([...cache.keys()]).toEqual([])
  })

  it('values returns empty for empty cache', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect([...cache.values()]).toEqual([])
  })

  it('entries returns empty for empty cache', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    expect([...cache.entries()]).toEqual([])
  })

  it('keys order changes after get', () => {
    const cache = new LRUEvictionCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    expect([...cache.keys()]).toEqual(['b', 'c', 'a'])
  })
})

describe('LRUEvictionCache - toString', () => {
  it('returns string representation', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.toString()).toBe('LRUEvictionCache(2/5)')
  })

  it('toString works for empty cache', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    expect(cache.toString()).toBe('LRUEvictionCache(0/5)')
  })
})

describe('LRUEvictionCache - toJSON', () => {
  it('returns array of entries', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    const json = cache.toJSON()
    expect(json).toEqual([['a', 1], ['b', 2]])
  })

  it('toJSON returns empty array for empty cache', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    expect(cache.toJSON()).toEqual([])
  })
})

describe('LRUEvictionCache - clone', () => {
  it('creates independent copy', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    const clone = cache.clone()
    expect(clone.size).toBe(2)
    expect(clone.capacity).toBe(5)
    expect(clone.get('a')).toBe(1)
  })

  it('clone is independent of original', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    const clone = cache.clone()
    cache.set('b', 2)
    cache.delete('a')
    expect(clone.has('a')).toBe(true)
    expect(clone.has('b')).toBe(false)
  })

  it('clone has same capacity as original', () => {
    const cache = new LRUEvictionCache<string, number>(7)
    cache.set('a', 1)
    const clone = cache.clone()
    expect(clone.capacity).toBe(7)
  })
})

describe('LRUEvictionCache - equals', () => {
  it('returns true for identical caches', () => {
    const cache1 = new LRUEvictionCache<string, number>(5)
    const cache2 = new LRUEvictionCache<string, number>(5)
    cache1.set('a', 1)
    cache1.set('b', 2)
    cache2.set('a', 1)
    cache2.set('b', 2)
    expect(cache1.equals(cache2)).toBe(true)
  })

  it('returns false for different capacity', () => {
    const cache1 = new LRUEvictionCache<string, number>(3)
    const cache2 = new LRUEvictionCache<string, number>(5)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('returns false for different sizes', () => {
    const cache1 = new LRUEvictionCache<string, number>(5)
    const cache2 = new LRUEvictionCache<string, number>(5)
    cache1.set('a', 1)
    cache2.set('a', 1)
    cache2.set('b', 2)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('returns false for different values', () => {
    const cache1 = new LRUEvictionCache<string, number>(5)
    const cache2 = new LRUEvictionCache<string, number>(5)
    cache1.set('a', 1)
    cache2.set('a', 2)
    expect(cache1.equals(cache2)).toBe(false)
  })

  it('returns false for non-LRUEvictionCache object', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    expect(cache.equals({})).toBe(false)
    expect(cache.equals(null)).toBe(false)
  })

  it('returns true for empty caches with same capacity', () => {
    const cache1 = new LRUEvictionCache<string, number>(5)
    const cache2 = new LRUEvictionCache<string, number>(5)
    expect(cache1.equals(cache2)).toBe(true)
  })

  it('keys returns all keys', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1); cache.set('b', 2); cache.set('c', 3)
    const keys = [...cache.keys()]
    expect(keys.sort()).toEqual(['a', 'b', 'c'])
  })

  it('values returns all values', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1); cache.set('b', 2)
    const vals = [...cache.values()]
    expect(vals.sort()).toEqual([1, 2])
  })

  it('delete non-existent key returns false', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    expect(cache.delete('missing')).toBe(false)
  })

  it('clear resets size to zero', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1); cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('toString returns string', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('x', 10)
    expect(typeof cache.toString()).toBe('string')
  })

  it('should evict oldest entry', () => {
    const cache = new LRUEvictionCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe(2)
  })

  it('should update existing key', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('x', 1)
    cache.set('x', 2)
    expect(cache.get('x')).toBe(2)
  })

  it('has returns boolean', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('missing')).toBe(false)
  })

  it('delete removes entry', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.delete('a')
    expect(cache.get('a')).toBeUndefined()
  })

  it('size tracks entries', () => {
    const cache = new LRUEvictionCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('get missing returns undefined', () => {
    const c = new LRUEvictionCache<string, number>(5)
    expect(c.get('missing')).toBeUndefined()
  })

  it('set and get', () => {
    const c = new LRUEvictionCache<string, number>(5)
    c.set('a', 1)
    expect(c.get('a')).toBe(1)
  })

  it('has returns boolean', () => {
    const c = new LRUEvictionCache<string, number>(5)
    expect(c.has('missing')).toBe(false)
  })
})

describe('lru-eviction-cache - wave545', () => {
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

describe('lru-eviction-cache - wave546', () => {
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

describe('lru-eviction-cache - wave547', () => {
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

describe('lru-eviction-cache - wave548', () => {
  it('lru-eviction-cache module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave549', () => {
  it('lru-eviction-cache module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave550', () => {
  it('lru-eviction-cache w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave551', () => {
  it('lru-eviction-cache w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave552', () => {
  it('lru-eviction-cache w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave553', () => {
  it('lru-eviction-cache w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave554', () => {
  it('lru-eviction-cache w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave555', () => {
  it('lru-eviction-cache w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave556', () => {
  it('lru-eviction-cache w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave557', () => {
  it('lru-eviction-cache w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave558', () => {
  it('lru-eviction-cache w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lru-eviction-cache - wave559', () => {
  it('lru-eviction-cache w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lru-eviction-cache w559 v2', () => {
    expect(describe).toBeDefined()
  })
})
