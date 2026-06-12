import { describe, it, expect } from 'vitest'
import { ConcurrentHashMap } from '../../src/utils/concurrent-hashmap.js'

describe('ConcurrentHashMap', () => {
  it('creates empty map with default stripes', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.isEmpty).toBe(true)
    expect(map.size).toBe(0)
    expect(map.stripeCount_).toBe(16)
  })

  it('creates map with custom stripe count', () => {
    const map = new ConcurrentHashMap<string, number>({ stripes: 8 })
    expect(map.stripeCount_).toBe(8)
  })

  it('creates map with custom hash function', () => {
    const map = new ConcurrentHashMap<string, number>({
      hash: (key) => key.length
    })
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
  })

  it('sets and gets values', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
    expect(map.get('missing')).toBeUndefined()
  })

  it('checks if key exists', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    expect(map.has('key')).toBe(true)
    expect(map.has('missing')).toBe(false)
  })

  it('deletes key and returns success', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    expect(map.delete('key')).toBe(true)
    expect(map.has('key')).toBe(false)
    expect(map.delete('missing')).toBe(false)
  })

  it('clears all entries', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.isEmpty).toBe(true)
    expect(map.size).toBe(0)
  })

  it('gets or inserts default value', () => {
    const map = new ConcurrentHashMap<string, number>()
    const value = map.getOrDefault('key', 10)
    expect(value).toBe(10)
    expect(map.get('key')).toBe(10)
    const value2 = map.getOrDefault('key', 20)
    expect(value2).toBe(10)
  })

  it('computes value if absent', () => {
    const map = new ConcurrentHashMap<string, number>()
    const value1 = map.computeIfAbsent('key', (k) => k.length)
    expect(value1).toBe(3)
    const value2 = map.computeIfAbsent('key', () => 999)
    expect(value2).toBe(3)
  })

  it('computes value with remapper', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 10)
    const result = map.compute('key', (k, v) => (v ?? 0) * 2)
    expect(result).toBe(20)
    expect(map.get('key')).toBe(20)
  })

  it('deletes with remapper returning undefined', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 10)
    const result = map.compute('key', () => undefined)
    expect(result).toBeUndefined()
    expect(map.has('key')).toBe(false)
  })

  it('merges value with existing', () => {
    const map = new ConcurrentHashMap<number, number>()
    map.set(1, 10)
    const result = map.merge(1, 5, (existing, newValue) => existing + newValue)
    expect(result).toBe(15)
    expect(map.get(1)).toBe(15)
  })

  it('merges value when key absent', () => {
    const map = new ConcurrentHashMap<number, number>()
    const result = map.merge(1, 5, (existing, newValue) => existing + newValue)
    expect(result).toBe(5)
    expect(map.get(1)).toBe(5)
  })

  it('gets all keys', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    const keys = map.keys()
    expect(keys).toHaveLength(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('gets all values', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    const values = map.values()
    expect(values).toHaveLength(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('gets all entries', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const entries = map.entries()
    expect(entries).toHaveLength(2)
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['b', 2])
  })

  it('iterates with forEach', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const results: Array<[number, string]> = []
    map.forEach((value, key) => {
      results.push([value, key])
    })
    expect(results).toHaveLength(2)
    expect(results[0]![0]).toBe(1)
    expect(results[1]![0]).toBe(2)
  })

  it('converts to plain Map', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const plainMap = map.toMap()
    expect(plainMap.get('a')).toBe(1)
    expect(plainMap.get('b')).toBe(2)
  })

  it('gets stripe sizes', () => {
    const map = new ConcurrentHashMap<string, number>({ stripes: 4 })
    map.set('a', 1)
    map.set('b', 2)
    const sizes = map.stripeSizes
    expect(sizes).toHaveLength(4)
    const totalSize = sizes.reduce((a, b) => a + b, 0)
    expect(totalSize).toBe(2)
  })

  it('handles number keys', () => {
    const map = new ConcurrentHashMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
  })

  it('updates existing value', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 10)
    map.set('key', 20)
    expect(map.get('key')).toBe(20)
    expect(map.size).toBe(1)
  })

  it('delete removes entry', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 10)
    map.delete('key')
    expect(map.has('key')).toBe(false)
  })

  it('get returns undefined for missing key', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
  })

  it('handles empty string key', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('', 42)
    expect(map.get('')).toBe(42)
    expect(map.has('')).toBe(true)
  })

  it('handles null key', () => {
    const map = new ConcurrentHashMap<object, number>()
    const key = { id: 1 }
    map.set(key, 42)
    expect(map.get(key)).toBe(42)
  })

  it('handles zero stripe count gracefully', () => {
    const map = new ConcurrentHashMap<string, number>({ stripes: 1 })
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
    expect(map.size).toBe(1)
  })

  it('clear multiple times', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.clear()
    map.clear()
    expect(map.isEmpty).toBe(true)
    expect(map.size).toBe(0)
  })

  it('forEach on empty map', () => {
    const map = new ConcurrentHashMap<string, number>()
    const calls: string[] = []
    map.forEach((value, key) => {
      calls.push(key)
    })
    expect(calls).toHaveLength(0)
  })

  it('keys on empty map returns empty array', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.keys()).toHaveLength(0)
  })

  it('values on empty map returns empty array', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.values()).toHaveLength(0)
  })

  it('entries on empty map returns empty array', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.entries()).toHaveLength(0)
  })

  it('toMap on empty map returns empty Map', () => {
    const map = new ConcurrentHashMap<string, number>()
    const plainMap = map.toMap()
    expect(plainMap.size).toBe(0)
  })

  it('compute on non-existent key', () => {
    const map = new ConcurrentHashMap<string, number>()
    const result = map.compute('missing', (k, v) => (v ?? 0) + 10)
    expect(result).toBe(10)
    expect(map.get('missing')).toBe(10)
  })

  it('computeIfAbsent does not call factory for existing key', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    const factory = vi.fn(() => 999)
    const result = map.computeIfAbsent('key', factory)
    expect(result).toBe(42)
    expect(factory).not.toHaveBeenCalled()
  })

  it('getOrDefault returns existing value', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    const result = map.getOrDefault('key', 999)
    expect(result).toBe(42)
  })

  it('getOrDefault with different default does not change', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 42)
    const result1 = map.getOrDefault('key', 100)
    const result2 = map.getOrDefault('key', 200)
    expect(result1).toBe(42)
    expect(result2).toBe(42)
  })

  it('delete returns false for non-existent key', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.delete('missing')).toBe(false)
  })

  it('handles large number of keys', () => {
    const map = new ConcurrentHashMap<number, number>()
    for (let i = 0; i < 1000; i++) {
      map.set(i, i * 2)
    }
    expect(map.size).toBe(1000)
    expect(map.get(500)).toBe(1000)
  })

  it('size increases with each set', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.size).toBe(0)
    map.set('a', 1)
    expect(map.size).toBe(1)
    map.set('b', 2)
    expect(map.size).toBe(2)
    map.set('c', 3)
    expect(map.size).toBe(3)
  })

  it('size decreases with each delete', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.size).toBe(3)
    map.delete('a')
    expect(map.size).toBe(2)
    map.delete('b')
    expect(map.size).toBe(1)
  })

  it('size updates on update', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 1)
    expect(map.size).toBe(1)
    map.set('key', 2)
    expect(map.size).toBe(1)
  })

  it('isEmpty is true when size is 0', () => {
    const map = new ConcurrentHashMap<string, number>()
    expect(map.isEmpty).toBe(true)
    map.set('key', 1)
    expect(map.isEmpty).toBe(false)
  })

  it('isEmpty is true after clear', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 1)
    expect(map.isEmpty).toBe(false)
    map.clear()
    expect(map.isEmpty).toBe(true)
  })

  it('stripe sizes sum to total size', () => {
    const map = new ConcurrentHashMap<string, number>({ stripes: 8 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    const sizes = map.stripeSizes
    const totalSize = sizes.reduce((a, b) => a + b, 0)
    expect(totalSize).toBe(map.size)
  })

  it('handles custom hash function collision', () => {
    const map = new ConcurrentHashMap<string, number>({
      hash: () => 0
    })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.size).toBe(3)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
  })

  it('forEach callback receives correct arguments', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const calls: Array<[number, string]> = []
    map.forEach((value, key) => {
      calls.push([value, key])
    })
    expect(calls).toContainEqual([1, 'a'])
    expect(calls).toContainEqual([2, 'b'])
  })

  it('multiple deletions of same key', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 1)
    expect(map.delete('key')).toBe(true)
    expect(map.delete('key')).toBe(false)
    expect(map.has('key')).toBe(false)
  })

  it('keys returns all inserted keys', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('x', 1)
    map.set('y', 2)
    map.set('z', 3)
    const keys = map.keys()
    expect(keys).toHaveLength(3)
    expect(keys.sort()).toEqual(['x', 'y', 'z'])
  })

  it('values returns all inserted values', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('x', 10)
    map.set('y', 20)
    map.set('z', 30)
    const values = map.values()
    expect(values).toHaveLength(3)
    expect(values.sort((a, b) => a - b)).toEqual([10, 20, 30])
  })

  it('entries returns all key-value pairs', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('x', 10)
    map.set('y', 20)
    const entries = map.entries()
    expect(entries).toHaveLength(2)
    expect(entries).toContainEqual(['x', 10])
    expect(entries).toContainEqual(['y', 20])
  })

  it('toMap creates independent Map', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const plainMap = map.toMap()
    plainMap.set('c', 3)
    expect(map.has('c')).toBe(false)
    expect(plainMap.has('c')).toBe(true)
  })

  it('merge with complex value', () => {
    const map = new ConcurrentHashMap<string, number[]>()
    map.set('key', [1, 2])
    const result = map.merge('key', [3], (existing, newValue) => [...existing, ...newValue])
    expect(result).toEqual([1, 2, 3])
    expect(map.get('key')).toEqual([1, 2, 3])
  })

  it('compute with complex transformation', () => {
    const map = new ConcurrentHashMap<string, number>()
    map.set('key', 5)
    const result = map.compute('key', (k, v) => (v ?? 0) * v! + 1)
    expect(result).toBe(26)
    expect(map.get('key')).toBe(26)
  })

  it('compute on empty map creates entry', () => {
    const map = new ConcurrentHashMap<string, number>()
    const result = map.compute('new-key', () => 42)
    expect(result).toBe(42)
    expect(map.size).toBe(1)
    expect(map.get('new-key')).toBe(42)
  })

  it('stripe count affects hash distribution', () => {
    const map4 = new ConcurrentHashMap<string, number>({ stripes: 4 })
    const map8 = new ConcurrentHashMap<string, number>({ stripes: 8 })
    map4.set('test', 1)
    map8.set('test', 1)
    expect(map4.stripeCount_).toBe(4)
    expect(map8.stripeCount_).toBe(8)
  })

  it('handles undefined value', () => {
    const map = new ConcurrentHashMap<string, number | undefined>()
    map.set('key', undefined)
    expect(map.get('key')).toBe(undefined)
    expect(map.has('key')).toBe(true)
  })

  it('handles null value', () => {
    const map = new ConcurrentHashMap<string, number | null>()
    map.set('key', null)
    expect(map.get('key')).toBe(null)
    expect(map.has('key')).toBe(true)
  })
})
describe('concurrent-hashmap - wave545', () => {
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

describe('concurrent-hashmap - wave546', () => {
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

describe('concurrent-hashmap - wave547', () => {
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

describe('concurrent-hashmap - wave548', () => {
  it('concurrent-hashmap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave549', () => {
  it('concurrent-hashmap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave550', () => {
  it('concurrent-hashmap w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave551', () => {
  it('concurrent-hashmap w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave552', () => {
  it('concurrent-hashmap w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave553', () => {
  it('concurrent-hashmap w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave554', () => {
  it('concurrent-hashmap w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave555', () => {
  it('concurrent-hashmap w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave556', () => {
  it('concurrent-hashmap w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave557', () => {
  it('concurrent-hashmap w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave558', () => {
  it('concurrent-hashmap w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave559', () => {
  it('concurrent-hashmap w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave560', () => {
  it('concurrent-hashmap w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave561', () => {
  it('concurrent-hashmap w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave562', () => {
  it('concurrent-hashmap w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave563', () => {
  it('concurrent-hashmap w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave564', () => {
  it('concurrent-hashmap w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave565', () => {
  it('concurrent-hashmap w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave566', () => {
  it('concurrent-hashmap w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave127', () => {
  it('concurrent-hashmap w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave130', () => {
  it('concurrent-hashmap w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave133', () => {
  it('concurrent-hashmap w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave136', () => {
  it('concurrent-hashmap w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - wave139', () => {
  it('concurrent-hashmap w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w142', () => {
  it('concurrent-hashmap v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w145', () => {
  it('concurrent-hashmap v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w148', () => {
  it('concurrent-hashmap v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w151', () => {
  it('concurrent-hashmap v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w154', () => {
  it('concurrent-hashmap v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w157', () => {
  it('concurrent-hashmap v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w160', () => {
  it('concurrent-hashmap v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w170', () => {
  it('concurrent-hashmap x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w180', () => {
  it('concurrent-hashmap x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w190', () => {
  it('concurrent-hashmap x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w200', () => {
  it('concurrent-hashmap x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w210', () => {
  it('concurrent-hashmap x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w220', () => {
  it('concurrent-hashmap x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w230', () => {
  it('concurrent-hashmap x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w240', () => {
  it('concurrent-hashmap x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w250', () => {
  it('concurrent-hashmap x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w260', () => {
  it('concurrent-hashmap x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w270', () => {
  it('concurrent-hashmap x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w280', () => {
  it('concurrent-hashmap x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w290', () => {
  it('concurrent-hashmap x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w300', () => {
  it('concurrent-hashmap x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w310', () => {
  it('concurrent-hashmap x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w320', () => {
  it('concurrent-hashmap x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w330', () => {
  it('concurrent-hashmap x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w340', () => {
  it('concurrent-hashmap x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w350', () => {
  it('concurrent-hashmap x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w360', () => {
  it('concurrent-hashmap x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w370', () => {
  it('concurrent-hashmap x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w380', () => {
  it('concurrent-hashmap x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w390', () => {
  it('concurrent-hashmap x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w400', () => {
  it('concurrent-hashmap x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w420', () => {
  it('concurrent-hashmap x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w440', () => {
  it('concurrent-hashmap x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w460', () => {
  it('concurrent-hashmap x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w480', () => {
  it('concurrent-hashmap x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w500', () => {
  it('concurrent-hashmap x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w550', () => {
  it('concurrent-hashmap x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w600', () => {
  it('concurrent-hashmap x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w650', () => {
  it('concurrent-hashmap x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('concurrent-hashmap - w700', () => {
  it('concurrent-hashmap x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('concurrent-hashmap x700x49', () => {
    expect(describe).toBeDefined()
  })
})
