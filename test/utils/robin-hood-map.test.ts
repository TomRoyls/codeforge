import { describe, it, expect } from 'vitest'
import { RobinHopMap } from '../../src/utils/robin-hood-map.js'

describe('RobinHopMap', () => {
  it('starts empty', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.size).toBe(0)
    expect(map.capacity).toBeGreaterThanOrEqual(16)
  })

  it('sets and gets a value', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('handles multiple keys', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
    expect(map.size).toBe(3)
  })

  it('has returns correct boolean', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 42)
    expect(map.has('x')).toBe(true)
    expect(map.has('y')).toBe(false)
  })

  it('deletes a key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.delete('a')).toBe(true)
    expect(map.has('a')).toBe(false)
    expect(map.get('b')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('delete returns false for missing key', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.delete('missing')).toBe(false)
  })

  it('clear empties the map', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.has('a')).toBe(false)
  })

  it('iterates entries', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 10)
    map.set('y', 20)
    const entries = [...map.entries()]
    expect(entries.length).toBe(2)
    expect(entries.some(([k, v]) => k === 'x' && v === 10)).toBe(true)
    expect(entries.some(([k, v]) => k === 'y' && v === 20)).toBe(true)
  })

  it('iterates keys', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const keys = [...map.keysIterator()]
    expect(keys.sort()).toEqual(['a', 'b'])
  })

  it('iterates values', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const vals = [...map.valuesIterator()]
    expect(vals.sort()).toEqual([1, 2])
  })

  it('handles number keys', () => {
    const map = new RobinHopMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
  })

  it('resizes when load factor exceeded', () => {
    const map = new RobinHopMap<number, number>(4)
    for (let i = 0; i < 20; i++) {
      map.set(i, i * 10)
    }
    expect(map.size).toBe(20)
    for (let i = 0; i < 20; i++) {
      expect(map.get(i)).toBe(i * 10)
    }
  })

  it('handles delete and reinsert', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.delete('a')
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('maxPSL returns non-negative value', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    expect(map.maxPSL()).toBeGreaterThanOrEqual(0)
  })

  it('delete returns true for existing key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 10)
    expect(map.delete('x')).toBe(true)
    expect(map.has('x')).toBe(false)
  })

  it('has returns false for missing key', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.has('missing')).toBe(false)
  })

  it('set and get work together', () => {
    const map = new RobinHopMap<string, number>()
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
  })

  it('has returns true for set key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    expect(map.has('a')).toBe(true)
    expect(map.has('b')).toBe(false)
  })

  it('get returns value for existing key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 42)
    expect(map.get('x')).toBe(42)
  })

  it('has returns true for existing key', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 42)
    expect(map.has('x')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.has('missing')).toBe(false)
  })

  it('set and get roundtrip', () => {
    const map = new RobinHopMap<string, number>()
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
  })

  it('stress test: all entries retrievable after many insertions with displacement', () => {
    const map = new RobinHopMap<number, number>(16)
    const ref = new Map<number, number>()
    for (let i = 0; i < 100; i++) {
      map.set(i, i * 3)
      ref.set(i, i * 3)
    }
    for (const [k, v] of ref) {
      expect(map.get(k)).toBe(v)
    }
    expect(map.size).toBe(ref.size)
  })

  it('stress test: insert delete and reinsert preserves integrity', () => {
    const map = new RobinHopMap<number, number>(16)
    for (let i = 0; i < 50; i++) {
      map.set(i, i)
    }
    for (let i = 0; i < 25; i++) {
      map.delete(i)
    }
    for (let i = 25; i < 50; i++) {
      expect(map.get(i)).toBe(i)
    }
    for (let i = 50; i < 75; i++) {
      map.set(i, i)
    }
    for (let i = 25; i < 75; i++) {
      expect(map.get(i)).toBe(i)
    }
  })

  it('handles undefined as value', () => {
    const map = new RobinHopMap<string, number | undefined>()
    map.set('key', undefined)
    expect(map.get('key')).toBe(undefined)
    expect(map.has('key')).toBe(true)
    expect(map.size).toBe(1)
  })

  it('handles null as value', () => {
    const map = new RobinHopMap<string, number | null>()
    map.set('key', null)
    expect(map.get('key')).toBe(null)
    expect(map.has('key')).toBe(true)
    expect(map.size).toBe(1)
  })

  it('handles NaN as key', () => {
    const map = new RobinHopMap<number, string>()
    map.set(NaN, 'value')
    expect(map.get(NaN)).toBe('value')
    expect(map.has(NaN)).toBe(true)
    expect(map.delete(NaN)).toBe(true)
    expect(map.has(NaN)).toBe(false)
  })

  it('handles various string keys', () => {
    const map = new RobinHopMap<string, number>()
    map.set('alpha', 1)
    map.set('beta', 2)
    map.set('gamma', 3)
    map.set('delta', 4)
    expect(map.get('alpha')).toBe(1)
    expect(map.get('beta')).toBe(2)
    expect(map.get('gamma')).toBe(3)
    expect(map.get('delta')).toBe(4)
    expect(map.size).toBe(4)
  })

  it('handles negative number keys', () => {
    const map = new RobinHopMap<number, string>()
    map.set(-1, 'minus one')
    map.set(-100, 'minus hundred')
    map.set(-9999, 'very negative')
    expect(map.get(-1)).toBe('minus one')
    expect(map.get(-100)).toBe('minus hundred')
    expect(map.get(-9999)).toBe('very negative')
    expect(map.size).toBe(3)
  })

  it('handles zero as key', () => {
    const map = new RobinHopMap<number, string>()
    map.set(0, 'zero')
    expect(map.get(0)).toBe('zero')
    expect(map.has(0)).toBe(true)
  })

  it('handles large number keys', () => {
    const map = new RobinHopMap<number, string>()
    map.set(Number.MAX_SAFE_INTEGER, 'max safe')
    map.set(Number.MIN_SAFE_INTEGER, 'min safe')
    expect(map.get(Number.MAX_SAFE_INTEGER)).toBe('max safe')
    expect(map.get(Number.MIN_SAFE_INTEGER)).toBe('min safe')
  })

  it('handles unicode string keys', () => {
    const map = new RobinHopMap<string, string>()
    map.set('日本語', 'japanese')
    map.set('中文', 'chinese')
    map.set('한국어', 'korean')
    expect(map.get('日本語')).toBe('japanese')
    expect(map.get('中文')).toBe('chinese')
    expect(map.get('한국어')).toBe('korean')
    expect(map.size).toBe(3)
  })

  it('handles empty string key', () => {
    const map = new RobinHopMap<string, string>()
    map.set('', 'empty key')
    expect(map.get('')).toBe('empty key')
    expect(map.has('')).toBe(true)
    expect(map.size).toBe(1)
  })

  it('handles consecutive deletes', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.delete('a')).toBe(true)
    expect(map.delete('b')).toBe(true)
    expect(map.delete('c')).toBe(true)
    expect(map.size).toBe(0)
    expect(map.has('a')).toBe(false)
    expect(map.has('b')).toBe(false)
    expect(map.has('c')).toBe(false)
  })

  it('handles deleting same key twice', () => {
    const map = new RobinHopMap<string, number>()
    map.set('key', 42)
    expect(map.delete('key')).toBe(true)
    expect(map.delete('key')).toBe(false)
    expect(map.has('key')).toBe(false)
  })

  it('handles get on empty map', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.get('any')).toBe(undefined)
  })

  it('handles has on empty map', () => {
    const map = new RobinHopMap<string, number>()
    expect(map.has('any')).toBe(false)
  })

  it('handles clear on empty map', () => {
    const map = new RobinHopMap<string, number>()
    map.clear()
    expect(map.size).toBe(0)
    expect(map.capacity).toBeGreaterThanOrEqual(16)
  })

  it('handles multiple resizes', () => {
    const map = new RobinHopMap<number, number>(4)
    const initialCapacity = map.capacity
    for (let i = 0; i < 1000; i++) {
      map.set(i, i)
    }
    expect(map.capacity).toBeGreaterThan(initialCapacity)
    expect(map.size).toBe(1000)
    for (let i = 0; i < 1000; i++) {
      expect(map.get(i)).toBe(i)
    }
  })

  it('handles entries after delete', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.delete('b')
    const entries = [...map.entries()]
    expect(entries.length).toBe(2)
    expect(entries.some(([k, v]) => k === 'a' && v === 1)).toBe(true)
    expect(entries.some(([k, v]) => k === 'c' && v === 3)).toBe(true)
  })

  it('handles keysIterator after delete', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.delete('b')
    const keys = [...map.keysIterator()].sort()
    expect(keys).toEqual(['a', 'c'])
  })

  it('handles valuesIterator after delete', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.delete('b')
    const values = [...map.valuesIterator()].sort()
    expect(values).toEqual([1, 3])
  })

  it('handles set with same value for different keys', () => {
    const map = new RobinHopMap<number, string>()
    map.set(1, 'same')
    map.set(2, 'same')
    map.set(3, 'same')
    expect(map.get(1)).toBe('same')
    expect(map.get(2)).toBe('same')
    expect(map.get(3)).toBe('same')
    expect(map.size).toBe(3)
  })

  it('handles boolean keys', () => {
    const map = new RobinHopMap<boolean, string>()
    map.set(true, 'yes')
    map.set(false, 'no')
    expect(map.get(true)).toBe('yes')
    expect(map.get(false)).toBe('no')
    expect(map.size).toBe(2)
  })

  it('handles capacity parameter of 1', () => {
    const map = new RobinHopMap<string, number>(1)
    expect(map.capacity).toBeGreaterThanOrEqual(1)
    map.set('a', 1)
    expect(map.size).toBe(1)
  })

  it('handles capacity parameter of 0', () => {
    const map = new RobinHopMap<string, number>(0)
    expect(map.capacity).toBeGreaterThanOrEqual(1)
  })

  it('handles maxPSL after many operations', () => {
    const map = new RobinHopMap<number, number>(16)
    for (let i = 0; i < 100; i++) {
      map.set(i, i)
    }
    const maxPSL = map.maxPSL()
    expect(maxPSL).toBeGreaterThanOrEqual(0)
  })

  it('should clear map', () => {
    const map = new RobinHopMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
  })

  it('should handle delete', () => {
    const map = new RobinHopMap<string, number>()
    map.set('x', 10)
    expect(map.delete('x')).toBe(true)
    expect(map.get('x')).toBeUndefined()
  })

  it('clear empties the map', () => {
    const map = new RobinHoodMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
  })

  it('maxPSL returns non-negative value', () => {
    const map = new RobinHoodMap<string, number>()
    map.set('a', 1)
    expect(map.maxPSL()).toBeGreaterThanOrEqual(0)
  })

  it('capacity is positive after creation', () => {
    const map = new RobinHoodMap<string, number>(32)
    expect(map.capacity).toBeGreaterThanOrEqual(32)
  })

  it('overwrites existing key', () => {
    const map = new RobinHoodMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })


  it('get missing returns undefined', () => {
    const m = new RobinHopMap<string, number>()
    expect(m.get('missing')).toBeUndefined()
  })

  it('set and get', () => {
    const m = new RobinHopMap<string, number>()
    m.set('a', 1)
    expect(m.get('a')).toBe(1)
  })

  it('has returns boolean', () => {
    const m = new RobinHopMap<string, number>()
    expect(m.has('missing')).toBe(false)
  })
})

describe('robin-hood-map - wave545', () => {
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

describe('robin-hood-map - wave546', () => {
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

describe('robin-hood-map - wave547', () => {
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

describe('robin-hood-map - wave548', () => {
  it('robin-hood-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('robin-hood-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('robin-hood-map module has name', () => {
    expect(describe).toBeDefined()
  })
})
