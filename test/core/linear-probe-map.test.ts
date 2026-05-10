import { describe, it, expect } from 'vitest'
import { LinearProbeMap } from '../../src/core/linear-probe-map/linear-probe-map.js'

describe('LinearProbeMap - Constructor', () => {
  it('creates with default options', () => {
    const map = new LinearProbeMap()
    expect(map.capacity()).toBe(16)
    expect(map.loadFactor()).toBe(0)
  })

  it('creates with custom capacity', () => {
    const map = new LinearProbeMap({ capacity: 32 })
    expect(map.capacity()).toBe(32)
  })

  it('creates with custom loadFactorThreshold', () => {
    const map = new LinearProbeMap({ loadFactorThreshold: 0.5 })
    expect(map.capacity()).toBe(16)
  })

  it('creates with both options', () => {
    const map = new LinearProbeMap({ capacity: 64, loadFactorThreshold: 0.9 })
    expect(map.capacity()).toBe(64)
  })

  it('creates with capacity 1', () => {
    const map = new LinearProbeMap({ capacity: 1 })
    expect(map.capacity()).toBe(1)
  })

  it('throws on capacity 0', () => {
    expect(() => new LinearProbeMap({ capacity: 0 })).toThrow(RangeError)
  })

  it('throws on negative capacity', () => {
    expect(() => new LinearProbeMap({ capacity: -5 })).toThrow(RangeError)
  })

  it('throws on loadFactorThreshold 0', () => {
    expect(() => new LinearProbeMap({ loadFactorThreshold: 0 })).toThrow(RangeError)
  })

  it('throws on loadFactorThreshold > 1', () => {
    expect(() => new LinearProbeMap({ loadFactorThreshold: 1.5 })).toThrow(RangeError)
  })

  it('throws on negative loadFactorThreshold', () => {
    expect(() => new LinearProbeMap({ loadFactorThreshold: -0.5 })).toThrow(RangeError)
  })

  it('new map is empty', () => {
    const map = new LinearProbeMap()
    expect(map.isEmpty).toBe(true)
    expect(map.size).toBe(0)
  })

  it('accepts empty options object', () => {
    const map = new LinearProbeMap({})
    expect(map.capacity()).toBe(16)
  })

  it('accepts no arguments', () => {
    const map = new LinearProbeMap()
    expect(map.capacity()).toBe(16)
  })
})

describe('LinearProbeMap - set/get', () => {
  it('sets and gets a value', () => {
    const map = new LinearProbeMap()
    map.set('name', 'Alice')
    expect(map.get('name')).toBe('Alice')
  })

  it('returns undefined for missing key', () => {
    const map = new LinearProbeMap()
    expect(map.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const map = new LinearProbeMap()
    map.set('key', 1)
    map.set('key', 2)
    expect(map.get('key')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('handles number keys', () => {
    const map = new LinearProbeMap()
    map.set(42, 'answer')
    expect(map.get(42)).toBe('answer')
  })

  it('handles boolean keys', () => {
    const map = new LinearProbeMap()
    map.set(true, 'yes')
    map.set(false, 'no')
    expect(map.get(true)).toBe('yes')
    expect(map.get(false)).toBe('no')
  })

  it('handles null key', () => {
    const map = new LinearProbeMap()
    map.set(null, 'null-value')
    expect(map.get(null)).toBe('null-value')
  })

  it('handles undefined key', () => {
    const map = new LinearProbeMap()
    map.set(undefined, 'undef-value')
    expect(map.get(undefined)).toBe('undef-value')
  })

  it('handles object value types', () => {
    const map = new LinearProbeMap<string, { x: number }>()
    map.set('point', { x: 42 })
    expect(map.get('point')!.x).toBe(42)
  })

  it('handles array value types', () => {
    const map = new LinearProbeMap<string, number[]>()
    map.set('nums', [1, 2, 3])
    expect(map.get('nums')).toEqual([1, 2, 3])
  })

  it('sets multiple keys', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
    expect(map.size).toBe(3)
  })

  it('handles undefined value', () => {
    const map = new LinearProbeMap<string, number | undefined>()
    map.set('key', undefined)
    expect(map.get('key')).toBeUndefined()
    expect(map.has('key')).toBe(true)
  })

  it('handles null value', () => {
    const map = new LinearProbeMap<string, number | null>()
    map.set('key', null)
    expect(map.get('key')).toBeNull()
    expect(map.has('key')).toBe(true)
  })

  it('get on empty map returns undefined', () => {
    const map = new LinearProbeMap()
    expect(map.get('anything')).toBeUndefined()
  })
})

describe('LinearProbeMap - has', () => {
  it('returns true for existing key', () => {
    const map = new LinearProbeMap()
    map.set('key', 'value')
    expect(map.has('key')).toBe(true)
  })

  it('returns false for missing key', () => {
    const map = new LinearProbeMap()
    expect(map.has('key')).toBe(false)
  })

  it('returns false after delete', () => {
    const map = new LinearProbeMap()
    map.set('key', 'value')
    map.delete('key')
    expect(map.has('key')).toBe(false)
  })

  it('returns true after overwrite', () => {
    const map = new LinearProbeMap()
    map.set('key', 1)
    map.set('key', 2)
    expect(map.has('key')).toBe(true)
  })

  it('returns false on empty map', () => {
    const map = new LinearProbeMap()
    expect(map.has('any')).toBe(false)
  })
})

describe('LinearProbeMap - delete', () => {
  it('deletes existing key', () => {
    const map = new LinearProbeMap()
    map.set('key', 'value')
    expect(map.delete('key')).toBe(true)
    expect(map.get('key')).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const map = new LinearProbeMap()
    expect(map.delete('missing')).toBe(false)
  })

  it('decrements size', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    expect(map.size).toBe(1)
  })

  it('allows re-insert after delete', () => {
    const map = new LinearProbeMap()
    map.set('key', 1)
    map.delete('key')
    map.set('key', 2)
    expect(map.get('key')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('delete on empty map returns false', () => {
    const map = new LinearProbeMap()
    expect(map.delete('key')).toBe(false)
  })

  it('delete same key twice returns false second time', () => {
    const map = new LinearProbeMap()
    map.set('key', 1)
    expect(map.delete('key')).toBe(true)
    expect(map.delete('key')).toBe(false)
  })

  it('handles multiple deletes', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.delete('a')
    map.delete('c')
    expect(map.size).toBe(1)
    expect(map.get('b')).toBe(2)
  })
})

describe('LinearProbeMap - size and isEmpty', () => {
  it('size is 0 for new map', () => {
    const map = new LinearProbeMap()
    expect(map.size).toBe(0)
  })

  it('isEmpty is true for new map', () => {
    const map = new LinearProbeMap()
    expect(map.isEmpty).toBe(true)
  })

  it('size increments on set', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    expect(map.size).toBe(1)
    map.set('b', 2)
    expect(map.size).toBe(2)
  })

  it('size does not change on overwrite', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.size).toBe(1)
  })

  it('isEmpty is false after insert', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    expect(map.isEmpty).toBe(false)
  })

  it('isEmpty is true after clearing all', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.delete('a')
    expect(map.isEmpty).toBe(true)
  })
})

describe('LinearProbeMap - clear', () => {
  it('clears all entries', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty).toBe(true)
  })

  it('clear on empty map does nothing', () => {
    const map = new LinearProbeMap()
    map.clear()
    expect(map.size).toBe(0)
  })

  it('allows insert after clear', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.clear()
    map.set('b', 2)
    expect(map.get('b')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('has returns false after clear', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.clear()
    expect(map.has('a')).toBe(false)
  })
})

describe('LinearProbeMap - keys', () => {
  it('returns empty array for empty map', () => {
    const map = new LinearProbeMap()
    expect(map.keys()).toEqual([])
  })

  it('returns all keys', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    const keys = map.keys()
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys.length).toBe(2)
  })

  it('does not include deleted keys', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    expect(map.keys()).toEqual(['b'])
  })

  it('returns correct keys after overwrite', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.keys()).toEqual(['a'])
  })
})

describe('LinearProbeMap - values', () => {
  it('returns empty array for empty map', () => {
    const map = new LinearProbeMap()
    expect(map.values()).toEqual([])
  })

  it('returns all values', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    const values = map.values()
    expect(values).toContain(1)
    expect(values).toContain(2)
  })

  it('does not include deleted values', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    expect(map.values()).toEqual([2])
  })

  it('returns updated value after overwrite', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.values()).toEqual([2])
  })
})

describe('LinearProbeMap - entries', () => {
  it('returns empty array for empty map', () => {
    const map = new LinearProbeMap()
    expect(map.entries()).toEqual([])
  })

  it('returns all entries', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    const entries = map.entries()
    expect(entries.length).toBe(2)
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['b', 2])
  })

  it('does not include deleted entries', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    expect(map.entries()).toEqual([['b', 2]])
  })
})

describe('LinearProbeMap - forEach', () => {
  it('iterates over all entries', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    const result: Array<[string, number]> = []
    map.forEach((key, value) => result.push([key, value]))
    expect(result.length).toBe(2)
    expect(result).toContainEqual(['a', 1])
    expect(result).toContainEqual(['b', 2])
  })

  it('does not iterate on empty map', () => {
    const map = new LinearProbeMap()
    let count = 0
    map.forEach(() => count++)
    expect(count).toBe(0)
  })

  it('skips deleted entries', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    const result: Array<[string, number]> = []
    map.forEach((key, value) => result.push([key, value]))
    expect(result).toEqual([['b', 2]])
  })

  it('receives correct key-value pairs', () => {
    const map = new LinearProbeMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    const keys: number[] = []
    const vals: string[] = []
    map.forEach((k, v) => {
      keys.push(k)
      vals.push(v)
    })
    expect(keys.sort()).toEqual([1, 2])
    expect(vals.sort()).toEqual(['one', 'two'])
  })
})

describe('LinearProbeMap - Symbol.iterator', () => {
  it('is iterable', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    const result = [...map]
    expect(result.length).toBe(2)
    expect(result).toContainEqual(['a', 1])
    expect(result).toContainEqual(['b', 2])
  })

  it('returns empty for empty map', () => {
    const map = new LinearProbeMap()
    expect([...map]).toEqual([])
  })

  it('works with for-of loop', () => {
    const map = new LinearProbeMap()
    map.set('x', 10)
    map.set('y', 20)
    const result: Array<[string, number]> = []
    for (const entry of map) {
      result.push(entry)
    }
    expect(result.length).toBe(2)
  })

  it('skips deleted entries', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    const result = [...map]
    expect(result).toEqual([['b', 2]])
  })
})

describe('LinearProbeMap - loadFactor and capacity', () => {
  it('loadFactor returns 0 for empty map', () => {
    const map = new LinearProbeMap()
    expect(map.loadFactor()).toBe(0)
  })

  it('loadFactor increases with inserts', () => {
    const map = new LinearProbeMap({ capacity: 4 })
    map.set('a', 1)
    expect(map.loadFactor()).toBe(0.25)
    map.set('b', 2)
    expect(map.loadFactor()).toBe(0.5)
  })

  it('capacity returns initial capacity', () => {
    const map = new LinearProbeMap({ capacity: 32 })
    expect(map.capacity()).toBe(32)
  })

  it('loadFactor decreases after delete', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    expect(map.loadFactor()).toBe(0.25)
  })
})

describe('LinearProbeMap - rehash', () => {
  it('rehash to same capacity', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.rehash()
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.size).toBe(2)
  })

  it('rehash to larger capacity', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.set('b', 2)
    map.rehash(16)
    expect(map.capacity()).toBe(16)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
  })

  it('rehash to smaller capacity that fits', () => {
    const map = new LinearProbeMap({ capacity: 32, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.set('b', 2)
    map.rehash(4)
    expect(map.capacity()).toBe(4)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
  })

  it('rehash throws on capacity too small', () => {
    const map = new LinearProbeMap({ capacity: 16, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.set('d', 4)
    map.set('e', 5)
    expect(() => map.rehash(3)).toThrow(RangeError)
  })

  it('rehash throws on capacity 0', () => {
    const map = new LinearProbeMap()
    expect(() => map.rehash(0)).toThrow(RangeError)
  })

  it('rehash throws on negative capacity', () => {
    const map = new LinearProbeMap()
    expect(() => map.rehash(-1)).toThrow(RangeError)
  })

  it('rehash cleans up tombstones', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.delete('b')
    map.rehash(4)
    map.set('d', 4)
    expect(map.size).toBe(3)
    expect(map.get('a')).toBe(1)
    expect(map.get('c')).toBe(3)
    expect(map.get('d')).toBe(4)
  })
})

describe('LinearProbeMap - resize', () => {
  it('resize to larger capacity', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.resize(16)
    expect(map.capacity()).toBe(16)
    expect(map.get('a')).toBe(1)
  })

  it('resize throws on capacity too small', () => {
    const map = new LinearProbeMap({ loadFactorThreshold: 1.0 })
    for (let i = 0; i < 5; i++) map.set(`k${i}`, i)
    expect(() => map.resize(3)).toThrow(RangeError)
  })

  it('resize throws on capacity 0', () => {
    const map = new LinearProbeMap()
    expect(() => map.resize(0)).toThrow(RangeError)
  })

  it('resize preserves all entries', () => {
    const map = new LinearProbeMap({ capacity: 8, loadFactorThreshold: 1.0 })
    for (let i = 0; i < 5; i++) map.set(`k${i}`, i)
    map.resize(32)
    for (let i = 0; i < 5; i++) {
      expect(map.get(`k${i}`)).toBe(i)
    }
    expect(map.size).toBe(5)
  })
})

describe('LinearProbeMap - toArray', () => {
  it('returns empty array for empty map', () => {
    const map = new LinearProbeMap()
    expect(map.toArray()).toEqual([])
  })

  it('returns all entries as array', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    const arr = map.toArray()
    expect(arr.length).toBe(2)
    expect(arr).toContainEqual(['a', 1])
    expect(arr).toContainEqual(['b', 2])
  })

  it('matches entries output', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.toArray()).toEqual(map.entries())
  })
})

describe('LinearProbeMap - getStatistics', () => {
  it('returns initial statistics', () => {
    const map = new LinearProbeMap()
    const stats = map.getStatistics()
    expect(stats.inserts).toBe(0)
    expect(stats.deletes).toBe(0)
    expect(stats.lookups).toBe(0)
    expect(stats.probes).toBe(0)
    expect(stats.rehashes).toBe(0)
    expect(stats.maxProbeLength).toBe(0)
    expect(stats.collisions).toBe(0)
  })

  it('tracks inserts', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.getStatistics().inserts).toBe(2)
  })

  it('does not increment inserts on overwrite', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.getStatistics().inserts).toBe(1)
  })

  it('tracks deletes', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.delete('a')
    expect(map.getStatistics().deletes).toBe(1)
  })

  it('does not increment deletes on failed delete', () => {
    const map = new LinearProbeMap()
    map.delete('missing')
    expect(map.getStatistics().deletes).toBe(0)
  })

  it('tracks lookups from get', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.get('a')
    map.get('missing')
    expect(map.getStatistics().lookups).toBe(2)
  })

  it('tracks lookups from has', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.has('a')
    map.has('missing')
    expect(map.getStatistics().lookups).toBe(2)
  })

  it('tracks lookups from delete', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.delete('a')
    expect(map.getStatistics().lookups).toBe(1)
  })

  it('tracks probes', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    expect(map.getStatistics().probes).toBeGreaterThan(0)
  })

  it('tracks rehashes from auto-resize', () => {
    const map = new LinearProbeMap({ capacity: 2, loadFactorThreshold: 0.75 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.getStatistics().rehashes).toBeGreaterThan(0)
  })

  it('tracks rehashes from manual rehash', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.rehash(32)
    expect(map.getStatistics().rehashes).toBe(1)
  })

  it('tracks maxProbeLength', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    expect(map.getStatistics().maxProbeLength).toBeGreaterThanOrEqual(1)
  })

  it('returns a copy of statistics', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    const stats1 = map.getStatistics()
    map.set('b', 2)
    const stats2 = map.getStatistics()
    expect(stats1.inserts).toBe(1)
    expect(stats2.inserts).toBe(2)
  })

  it('tracks collisions', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.set('e', 2)
    expect(map.getStatistics().collisions).toBeGreaterThan(0)
  })

  it('statistics object has all fields', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    const stats = map.getStatistics()
    expect(stats).toHaveProperty('inserts')
    expect(stats).toHaveProperty('deletes')
    expect(stats).toHaveProperty('lookups')
    expect(stats).toHaveProperty('probes')
    expect(stats).toHaveProperty('rehashes')
    expect(stats).toHaveProperty('maxProbeLength')
    expect(stats).toHaveProperty('collisions')
  })
})

describe('LinearProbeMap - auto-resize', () => {
  it('auto-resizes when load factor threshold exceeded', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 0.75 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.capacity()).toBeGreaterThan(4)
  })

  it('preserves data after auto-resize', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 0.75 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
  })

  it('maintains correct size after auto-resize', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 0.75 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.size).toBe(3)
  })

  it('handles many inserts beyond initial capacity', () => {
    const map = new LinearProbeMap({ capacity: 2, loadFactorThreshold: 0.75 })
    for (let i = 0; i < 100; i++) {
      map.set(`key${i}`, i)
    }
    expect(map.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(map.get(`key${i}`)).toBe(i)
    }
  })
})

describe('LinearProbeMap - collision handling', () => {
  it('handles delete in middle of probe chain', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.delete('b')
    expect(map.get('a')).toBe(1)
    expect(map.get('c')).toBe(3)
  })

  it('re-inserts into tombstone slot', () => {
    const map = new LinearProbeMap({ capacity: 4, loadFactorThreshold: 1.0 })
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    map.set('c', 3)
    expect(map.get('c')).toBe(3)
    expect(map.size).toBe(2)
  })

  it('handles delete and reinsert of same key', () => {
    const map = new LinearProbeMap()
    map.set('key', 'v1')
    map.delete('key')
    map.set('key', 'v2')
    expect(map.get('key')).toBe('v2')
  })
})

describe('LinearProbeMap - stress tests', () => {
  it('handles bulk insert and lookup', () => {
    const map = new LinearProbeMap()
    const count = 500
    for (let i = 0; i < count; i++) {
      map.set(`key-${i}`, i)
    }
    expect(map.size).toBe(count)
    for (let i = 0; i < count; i++) {
      expect(map.get(`key-${i}`)).toBe(i)
    }
  })

  it('handles bulk delete', () => {
    const map = new LinearProbeMap()
    const count = 100
    for (let i = 0; i < count; i++) {
      map.set(`key-${i}`, i)
    }
    for (let i = 0; i < count; i += 2) {
      map.delete(`key-${i}`)
    }
    expect(map.size).toBe(50)
    for (let i = 0; i < count; i++) {
      if (i % 2 === 0) {
        expect(map.get(`key-${i}`)).toBeUndefined()
      } else {
        expect(map.get(`key-${i}`)).toBe(i)
      }
    }
  })

  it('handles insert-delete cycles', () => {
    const map = new LinearProbeMap()
    for (let cycle = 0; cycle < 10; cycle++) {
      for (let i = 0; i < 20; i++) {
        map.set(`key-${i}`, cycle * 20 + i)
      }
      for (let i = 0; i < 20; i++) {
        map.delete(`key-${i}`)
      }
      expect(map.size).toBe(0)
    }
  })

  it('handles string keys of various lengths', () => {
    const map = new LinearProbeMap()
    const keys = ['a', 'ab', 'abc', 'abcd', 'abcdefghijklmnopqrstuvwxyz']
    keys.forEach((k, i) => map.set(k, i))
    keys.forEach((k, i) => expect(map.get(k)).toBe(i))
  })

  it('handles mixed type keys', () => {
    const map = new LinearProbeMap<number | string | boolean, number>()
    map.set(1, 10)
    map.set('1', 20)
    map.set(true, 30)
    expect(map.get(1)).toBe(10)
    expect(map.get('1')).toBe(20)
    expect(map.get(true)).toBe(30)
    expect(map.size).toBe(3)
  })

  it('forEach and entries consistency', () => {
    const map = new LinearProbeMap()
    for (let i = 0; i < 50; i++) {
      map.set(`k${i}`, i)
    }
    const fromEntries = map.entries()
    const fromForEach: Array<[string, number]> = []
    map.forEach((k, v) => fromForEach.push([k, v]))
    expect(fromEntries.sort()).toEqual(fromForEach.sort())
  })

  it('keys, values, and entries consistency', () => {
    const map = new LinearProbeMap()
    map.set('x', 1)
    map.set('y', 2)
    map.set('z', 3)
    const keys = map.keys()
    const values = map.values()
    const entries = map.entries()
    expect(keys.length).toBe(values.length)
    expect(keys.length).toBe(entries.length)
    expect(keys.length).toBe(3)
  })

  it('clear resets statistics tracking', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.get('a')
    map.delete('b')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty).toBe(true)
  })

  it('statistics accumulate correctly across operations', () => {
    const map = new LinearProbeMap({ capacity: 8 })
    map.set('a', 1)
    map.set('b', 2)
    map.get('a')
    map.has('b')
    map.delete('a')
    const stats = map.getStatistics()
    expect(stats.inserts).toBe(2)
    expect(stats.deletes).toBe(1)
    expect(stats.lookups).toBe(3)
  })

  it('iterator and toArray consistency', () => {
    const map = new LinearProbeMap()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    const fromIter = [...map]
    const fromToArray = map.toArray()
    expect(fromIter.sort()).toEqual(fromToArray.sort())
  })
})
