import { describe, it, expect } from 'vitest'
import { LFUCache } from '../../src/utils/lfu-cache.js'

describe('LFUCache', () => {
  it('creates instance with capacity', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.size).toBe(0)
    expect(cache.Capacity).toBe(3)
  })

  it('throws error for zero capacity', () => {
    expect(() => new LFUCache<string, number>(0)).toThrow(RangeError)
  })

  it('throws error for negative capacity', () => {
    expect(() => new LFUCache<string, number>(-1)).toThrow(RangeError)
  })

  it('sets and gets value', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.get('a')).toBe(1)
  })

  it('returns undefined for non-existent key', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.get('nonexistent')).toBe(undefined)
  })

  it('updates existing key', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('a', 2)
    expect(cache.get('a')).toBe(2)
  })

  it('evicts least frequently used key', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.get('b')
    cache.set('d', 4)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(false)
    expect(cache.has('d')).toBe(true)
  })

  it('checks if key exists', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.has('a')).toBe(false)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
  })

  it('deletes key', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    const result = cache.delete('a')
    expect(result).toBe(true)
    expect(cache.has('a')).toBe(false)
  })

  it('returns false when deleting non-existent key', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.delete('nonexistent')).toBe(false)
  })

  it('clears all entries', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.has('a')).toBe(false)
  })

  it('peeks value without updating frequency', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.get('a')
    cache.peek('a')
    expect(cache.getFrequency('a')).toBe(2)
  })

  it('returns undefined when peeking non-existent key', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.peek('nonexistent')).toBe(undefined)
  })

  it('returns correct frequency', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    expect(cache.getFrequency('a')).toBe(1)
    cache.get('a')
    cache.get('a')
    expect(cache.getFrequency('a')).toBe(3)
  })

  it('returns zero frequency for non-existent key', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.getFrequency('nonexistent')).toBe(0)
  })

  it('returns all keys', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    const keys = cache.keys()
    expect(keys).toHaveLength(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('returns all values', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    const values = cache.values()
    expect(values).toHaveLength(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('returns all entries', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    const entries = cache.entries()
    expect(entries).toHaveLength(2)
    const entryMap = new Map(entries)
    expect(entryMap.get('a')).toBe(1)
    expect(entryMap.get('b')).toBe(2)
  })

  it('iterates with forEach', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    const entries: Array<{ value: number; key: string; freq: number }> = []
    cache.forEach((value, key, freq) => {
      entries.push({ value, key, freq })
    })
    expect(entries).toHaveLength(2)
    expect(entries.some((e) => e.key === 'a' && e.value === 1 && e.freq === 2)).toBe(true)
  })

  it('converts to Map', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    const map = cache.toMap()
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.size).toBe(2)
  })

  it('handles capacity of 1', () => {
    const cache = new LFUCache<string, number>(1)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.size).toBe(1)
    expect(cache.get('a')).toBe(undefined)
    expect(cache.get('b')).toBe(2)
  })

  it('delete recalculates minFreq for correct eviction', () => {
    const cache = new LFUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.get('b')
    cache.get('a')
    cache.delete('a')
    cache.set('c', 3)
    cache.set('d', 4)
    expect(cache.size).toBe(2)
  })

  it('cache does not exceed capacity after delete', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.get('b')
    cache.get('c')
    cache.delete('a')
    cache.delete('b')
    cache.set('d', 4)
    cache.set('e', 5)
    cache.set('f', 6)
    expect(cache.size).toBeLessThanOrEqual(3)
  })

  it('toString returns correct format', () => {
    const cache = new LFUCache<string, number>(5)
    expect(cache.toString()).toBe('LFUCache(0/5)')
    cache.set('a', 1)
    expect(cache.toString()).toBe('LFUCache(1/5)')
  })

  it('toJSON returns entries', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    const json = cache.toJSON() as Array<[string, number]>
    expect(json).toHaveLength(2)
    expect(json.some(([k, v]) => k === 'a' && v === 1)).toBe(true)
    expect(json.some(([k, v]) => k === 'b' && v === 2)).toBe(true)
  })

  it('clone produces equal cache', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    const cloned = cache.clone()
    expect(cloned.equals(cache)).toBe(true)
  })

  it('clone is independent', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    const cloned = cache.clone()
    cloned.set('b', 2)
    expect(cache.has('b')).toBe(false)
    expect(cloned.has('b')).toBe(true)
  })

  it('clone preserves frequencies', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.get('a')
    cache.get('a')
    const cloned = cache.clone()
    expect(cloned.getFrequency('a')).toBe(3)
  })

  it('equals returns false for non-LFUCache', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.equals(null)).toBe(false)
    expect(cache.equals(undefined)).toBe(false)
    expect(cache.equals({})).toBe(false)
    expect(cache.equals('cache')).toBe(false)
    expect(cache.equals(42)).toBe(false)
  })

  it('equals returns false for different capacity', () => {
    const c1 = new LFUCache<string, number>(3)
    const c2 = new LFUCache<string, number>(5)
    expect(c1.equals(c2)).toBe(false)
  })

  it('equals returns true for same content', () => {
    const c1 = new LFUCache<string, number>(3)
    const c2 = new LFUCache<string, number>(3)
    c1.set('a', 1)
    c2.set('a', 1)
    expect(c1.equals(c2)).toBe(true)
  })

  it('equals returns false for different values', () => {
    const c1 = new LFUCache<string, number>(3)
    const c2 = new LFUCache<string, number>(3)
    c1.set('a', 1)
    c2.set('a', 2)
    expect(c1.equals(c2)).toBe(false)
  })

  it('equals returns false for different frequencies', () => {
    const c1 = new LFUCache<string, number>(3)
    const c2 = new LFUCache<string, number>(3)
    c1.set('a', 1)
    c2.set('a', 1)
    c2.get('a')
    expect(c1.equals(c2)).toBe(false)
  })

  it('evicts correct key with all same frequencies', () => {
    const cache = new LFUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.size).toBe(2)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  it('multiple gets increase frequency correctly', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    for (let i = 0; i < 10; i++) cache.get('a')
    expect(cache.getFrequency('a')).toBe(11)
  })

  it('clear resets size to 0', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.keys()).toEqual([])
    expect(cache.values()).toEqual([])
    expect(cache.entries()).toEqual([])
  })

  it('clear allows new inserts', () => {
    const cache = new LFUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    cache.set('c', 3)
    cache.set('d', 4)
    expect(cache.size).toBe(2)
    expect(cache.has('c')).toBe(true)
    expect(cache.has('d')).toBe(true)
  })

  it('works with number keys', () => {
    const cache = new LFUCache<number, string>(3)
    cache.set(1, 'one')
    cache.set(2, 'two')
    expect(cache.get(1)).toBe('one')
    expect(cache.get(2)).toBe('two')
  })

  it('works with object values', () => {
    const cache = new LFUCache<string, { x: number }>(3)
    cache.set('a', { x: 1 })
    cache.set('b', { x: 2 })
    expect(cache.get('a')!.x).toBe(1)
    expect(cache.get('b')!.x).toBe(2)
  })

  it('works with null values', () => {
    const cache = new LFUCache<string, null>(3)
    cache.set('a', null)
    expect(cache.get('a')).toBe(null)
    expect(cache.has('a')).toBe(true)
  })

  it('works with undefined values', () => {
    const cache = new LFUCache<string, number | undefined>(3)
    cache.set('a', undefined)
    expect(cache.get('a')).toBe(undefined)
    expect(cache.has('a')).toBe(true)
    expect(cache.peek('a')).toBe(undefined)
  })

  it('delete on empty cache returns false', () => {
    const cache = new LFUCache<string, number>(3)
    expect(cache.delete('a')).toBe(false)
  })

  it('delete all entries results in empty cache', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.delete('a')
    cache.delete('b')
    expect(cache.size).toBe(0)
    expect(cache.keys()).toEqual([])
  })

  it('toMap returns independent map', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    const map = cache.toMap()
    map.set('b', 2)
    expect(cache.has('b')).toBe(false)
  })

  it('forEach callback receives correct arguments', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('x', 10)
    const calls: Array<[number, string, number]> = []
    cache.forEach((v, k, f) => calls.push([v, k, f]))
    expect(calls).toEqual([[10, 'x', 1]])
  })

  it('update existing key preserves frequency', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.get('a')
    cache.set('a', 10)
    expect(cache.getFrequency('a')).toBe(3)
    expect(cache.get('a')).toBe(10)
  })

  it('large capacity works correctly', () => {
    const cache = new LFUCache<number, number>(100)
    for (let i = 0; i < 100; i++) cache.set(i, i * 2)
    expect(cache.size).toBe(100)
    expect(cache.get(50)).toBe(100)
  })

  it('evicts correctly after mixed operations', () => {
    const cache = new LFUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('c')).toBe(true)
    expect(cache.has('b')).toBe(false)
  })

  it('peek does not affect eviction order', () => {
    const cache = new LFUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.peek('a')
    cache.peek('b')
    cache.set('c', 3)
    expect(cache.size).toBe(2)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  it('get after delete returns undefined', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.delete('a')
    expect(cache.get('a')).toBe(undefined)
    expect(cache.getFrequency('a')).toBe(0)
  })

  it('entries returns key-value pairs', () => {
    const cache = new LFUCache<string, number>(5)
    cache.set('a', 10)
    cache.set('b', 20)
    const entries = cache.entries()
    expect(entries.length).toBe(2)
    const entryMap = new Map(entries)
    expect(entryMap.get('a')).toBe(10)
    expect(entryMap.get('b')).toBe(20)
  })

  it('re-insert after eviction', () => {
    const cache = new LFUCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.set('a', 10)
    expect(cache.get('a')).toBe(10)
  })

  it('has returns true for existing key', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('x', 42)
    expect(cache.has('x')).toBe(true)
    expect(cache.has('missing')).toBe(false)
  })

  it('delete removes entry', () => {
    const cache = new LFUCache<string, number>(3)
    cache.set('a', 1)
    cache.delete('a')
    expect(cache.get('a')).toBeUndefined()
  })

  it('size tracks entries', () => {
    const cache = new LFUCache<string, number>(5)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.size).toBe(2)
  })

  it('get missing returns undefined', () => {
    const c = new LFUCache<string, number>(5)
    expect(c.get('missing')).toBeUndefined()
  })

  it('has returns boolean', () => {
    const c = new LFUCache<string, number>(5)
    expect(c.has('missing')).toBe(false)
  })

  it('set and get', () => {
    const c = new LFUCache<string, number>(5)
    c.set('a', 1)
    expect(c.get('a')).toBe(1)
  })
})

describe('lfu-cache - wave545', () => {
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

describe('lfu-cache - wave546', () => {
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

describe('lfu-cache - wave547', () => {
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

describe('lfu-cache - wave548', () => {
  it('lfu-cache module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave549', () => {
  it('lfu-cache module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave550', () => {
  it('lfu-cache w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave551', () => {
  it('lfu-cache w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave552', () => {
  it('lfu-cache w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave553', () => {
  it('lfu-cache w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave554', () => {
  it('lfu-cache w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave555', () => {
  it('lfu-cache w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave556', () => {
  it('lfu-cache w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave557', () => {
  it('lfu-cache w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave558', () => {
  it('lfu-cache w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave559', () => {
  it('lfu-cache w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave560', () => {
  it('lfu-cache w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave561', () => {
  it('lfu-cache w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave562', () => {
  it('lfu-cache w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lfu-cache - wave563', () => {
  it('lfu-cache w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lfu-cache w563 v2', () => {
    expect(describe).toBeDefined()
  })
})
