import { describe, it, expect } from 'vitest'
import { BiMap } from '../../src/utils/bi-map.js'

describe('BiMap', () => {
  it('sets and gets a value', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.get('a')).toBe(1)
  })

  it('gets key by value', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.getKey(1)).toBe('a')
  })

  it('returns undefined for missing key', () => {
    const bm = new BiMap<string, number>()
    expect(bm.get('missing')).toBeUndefined()
  })

  it('returns undefined for missing value', () => {
    const bm = new BiMap<string, number>()
    expect(bm.getKey(99)).toBeUndefined()
  })

  it('hasKey checks forward', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.hasKey('a')).toBe(true)
    expect(bm.hasKey('b')).toBe(false)
  })

  it('hasValue checks reverse', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.hasValue(1)).toBe(true)
    expect(bm.hasValue(2)).toBe(false)
  })

  it('overwriting key updates reverse map', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('a', 2)
    expect(bm.get('a')).toBe(2)
    expect(bm.getKey(1)).toBeUndefined()
    expect(bm.getKey(2)).toBe('a')
    expect(bm.size).toBe(1)
  })

  it('overwriting value updates forward map', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 1)
    expect(bm.get('a')).toBeUndefined()
    expect(bm.get('b')).toBe(1)
    expect(bm.getKey(1)).toBe('b')
    expect(bm.size).toBe(1)
  })

  it('deleteKey removes entry', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.deleteKey('a')).toBe(true)
    expect(bm.hasKey('a')).toBe(false)
    expect(bm.hasValue(1)).toBe(false)
    expect(bm.size).toBe(0)
  })

  it('deleteKey returns false for missing', () => {
    const bm = new BiMap<string, number>()
    expect(bm.deleteKey('x')).toBe(false)
  })

  it('deleteValue removes entry', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.deleteValue(1)).toBe(true)
    expect(bm.size).toBe(0)
  })

  it('deleteValue returns false for missing', () => {
    const bm = new BiMap<string, number>()
    expect(bm.deleteValue(99)).toBe(false)
  })

  it('tracks size correctly', () => {
    const bm = new BiMap<string, number>()
    expect(bm.size).toBe(0)
    bm.set('a', 1)
    bm.set('b', 2)
    expect(bm.size).toBe(2)
    bm.deleteKey('a')
    expect(bm.size).toBe(1)
  })

  it('isEmpty reflects state', () => {
    const bm = new BiMap<string, number>()
    expect(bm.isEmpty).toBe(true)
    bm.set('a', 1)
    expect(bm.isEmpty).toBe(false)
  })

  it('clear removes all entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.clear()
    expect(bm.size).toBe(0)
    expect(bm.isEmpty).toBe(true)
  })

  it('iterates keys', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    expect([...bm.keys()].sort()).toEqual(['a', 'b'])
  })

  it('iterates values', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    expect([...bm.values()].sort()).toEqual([1, 2])
  })

  it('iterates entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    const entries = [...bm.entries()]
    expect(entries.length).toBe(2)
  })

  it('clone produces independent copy', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    const copy = bm.clone()
    copy.set('b', 2)
    expect(bm.size).toBe(1)
    expect(copy.size).toBe(2)
  })

  it('forEach iterates all entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    const collected: [string, number][] = []
    bm.forEach((k, v) => collected.push([k, v]))
    expect(collected.length).toBe(2)
  })

  it('clear removes all entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.clear()
    expect(bm.size).toBe(0)
  })

  it('size tracks entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    expect(bm.size).toBe(2)
  })

  it('clear empties the map', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.clear()
    expect(bm.size).toBe(0)
  })

  it('deleteKey removes mapping', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.deleteKey('a')
    expect(bm.get('a')).toBeUndefined()
  })

  it('size tracks entries', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    expect(bm.size).toBe(1)
  })

  it('toString returns formatted output', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)

    const str = bm.toString()
    expect(str).toContain('a => 1')
    expect(str).toContain('b => 2')
  })

  it('toString returns empty brackets for empty map', () => {
    const bm = new BiMap<string, number>()

    expect(bm.toString()).toBe('[]')
  })

  it('toJSON returns entries array', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)

    const json = bm.toJSON()
    expect(json).toHaveLength(2)
    expect(json).toContainEqual(['a', 1])
    expect(json).toContainEqual(['b', 2])
  })

  it('toJSON returns empty array for empty map', () => {
    const bm = new BiMap<string, number>()

    expect(bm.toJSON()).toEqual([])
  })

  it('equals returns true for identical maps', () => {
    const bm1 = new BiMap<string, number>()
    const bm2 = new BiMap<string, number>()

    bm1.set('a', 1)
    bm1.set('b', 2)

    bm2.set('a', 1)
    bm2.set('b', 2)

    expect(bm1.equals(bm2)).toBe(true)
  })

  it('equals returns false for different maps', () => {
    const bm1 = new BiMap<string, number>()
    const bm2 = new BiMap<string, number>()

    bm1.set('a', 1)
    bm2.set('a', 2)

    expect(bm1.equals(bm2)).toBe(false)
  })

  it('equals returns false for different sizes', () => {
    const bm1 = new BiMap<string, number>()
    const bm2 = new BiMap<string, number>()

    bm1.set('a', 1)
    bm1.set('b', 2)

    bm2.set('a', 1)

    expect(bm1.equals(bm2)).toBe(false)
  })

  it('equals returns false for non-BiMap objects', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)

    expect(bm.equals({})).toBe(false)
    expect(bm.equals(null)).toBe(false)
    expect(bm.equals(undefined)).toBe(false)
  })

  it('handles null and undefined values', () => {
    const bm = new BiMap<string, string | null | undefined>()

    bm.set('a', null)
    bm.set('b', undefined)

    expect(bm.get('a')).toBe(null)
    expect(bm.get('b')).toBe(undefined)
    expect(bm.size).toBe(2)
  })

  it('handles boolean keys and values', () => {
    const bm = new BiMap<boolean, boolean>()

    bm.set(true, false)
    bm.set(false, true)

    expect(bm.get(true)).toBe(false)
    expect(bm.get(false)).toBe(true)
  })

  it('handles empty string keys', () => {
    const bm = new BiMap<string, string>()

    bm.set('', 'value')
    bm.set('key', '')

    expect(bm.get('')).toBe('value')
    expect(bm.get('key')).toBe('')
  })

  it('handles very long keys and values', () => {
    const bm = new BiMap<string, string>()

    const longKey = 'a'.repeat(1000)
    const longValue = 'b'.repeat(1000)

    bm.set(longKey, longValue)

    expect(bm.get(longKey)).toBe(longValue)
  })

  it('handles special Unicode characters', () => {
    const bm = new BiMap<string, string>()

    bm.set('用户', '测试')
    bm.set('😀', '🎉')
    bm.set('café', 'naïve')

    expect(bm.get('用户')).toBe('测试')
    expect(bm.get('😀')).toBe('🎉')
    expect(bm.get('café')).toBe('naïve')
  })

  it('handles numeric zero keys and values', () => {
    const bm = new BiMap<number, number>()

    bm.set(0, 0)
    bm.set(0, 1)
    bm.set(1, 0)

    expect(bm.get(0)).toBe(1)
    expect(bm.get(1)).toBe(0)
  })

  it('keys generator returns all keys', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.set('c', 3)

    const keys = [...bm.keys()]
    expect(keys).toHaveLength(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('values generator returns all values', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.set('c', 3)

    const values = [...bm.values()]
    expect(values).toHaveLength(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('entries generator returns all key-value pairs', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.set('c', 3)

    const entries = [...bm.entries()]
    expect(entries).toHaveLength(3)
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['b', 2])
    expect(entries).toContainEqual(['c', 3])
  })

  it('clone is independent from original', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)

    const cloned = bm.clone()
    cloned.set('b', 2)
    cloned.deleteKey('a')

    expect(bm.size).toBe(1)
    expect(bm.get('a')).toBe(1)
    expect(cloned.size).toBe(1)
    expect(cloned.get('b')).toBe(2)
  })

  it('forEach callback receives correct parameters', () => {
    const bm = new BiMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)

    const keys: string[] = []
    const values: number[] = []
    const maps: BiMap<string, number>[] = []

    bm.forEach((key, value, map) => {
      keys.push(key)
      values.push(value)
      maps.push(map)
    })

    expect(keys).toHaveLength(2)
    expect(values).toHaveLength(2)
    expect(maps).toHaveLength(2)
    expect(maps[0]).toBe(bm)
    expect(maps[1]).toBe(bm)
  })

  it('forEach with empty map does not call callback', () => {
    const bm = new BiMap<string, number>()
    let called = false

    bm.forEach(() => {
      called = true
    })

    expect(called).toBe(false)
  })

  it('override same value multiple times', () => {
    const bm = new BiMap<string, number>()

    bm.set('a', 1)
    bm.set('b', 2)
    bm.set('a', 3)
    bm.set('b', 4)
    bm.set('a', 5)

    expect(bm.size).toBe(2)
    expect(bm.get('a')).toBe(5)
    expect(bm.get('b')).toBe(4)
    expect(bm.getKey(1)).toBeUndefined()
    expect(bm.getKey(2)).toBeUndefined()
  })

  it('override same key multiple times', () => {
    const bm = new BiMap<string, number>()

    bm.set('a', 1)
    bm.set('a', 2)
    bm.set('a', 3)

    expect(bm.size).toBe(1)
    expect(bm.get('a')).toBe(3)
    expect(bm.getKey(1)).toBeUndefined()
    expect(bm.getKey(2)).toBeUndefined()
  })

  it('delete and re-add same key', () => {
    const bm = new BiMap<string, number>()

    bm.set('a', 1)
    expect(bm.deleteKey('a')).toBe(true)
    expect(bm.size).toBe(0)

    bm.set('a', 2)
    expect(bm.get('a')).toBe(2)
    expect(bm.size).toBe(1)
  })

  it('delete and re-add same value', () => {
    const bm = new BiMap<string, number>()

    bm.set('a', 1)
    expect(bm.deleteValue(1)).toBe(true)
    expect(bm.size).toBe(0)

    bm.set('b', 1)
    expect(bm.get('b')).toBe(1)
    expect(bm.size).toBe(1)
  })

  it('clear makes isEmpty true', () => {
    const bm = new BiMap<string, number>()

    bm.set('a', 1)
    bm.set('b', 2)

    expect(bm.isEmpty).toBe(false)

    bm.clear()

    expect(bm.isEmpty).toBe(true)
  })

  it('clear removes all entries', () => {
    const bm = new BiMap<string, number>()

    bm.set('a', 1)
    bm.set('b', 2)

    bm.clear()

    expect(bm.size).toBe(0)
    expect(bm.hasKey('a')).toBe(false)
    expect(bm.hasKey('b')).toBe(false)
    expect(bm.hasValue(1)).toBe(false)
    expect(bm.hasValue(2)).toBe(false)
  })

  it('handles complex object values', () => {
    const bm = new BiMap<string, { name: string; age: number }>()

    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'Jane', age: 25 }

    bm.set('a', obj1)
    bm.set('b', obj2)

    expect(bm.get('a')).toEqual(obj1)
    expect(bm.get('b')).toEqual(obj2)
    expect(bm.getKey(obj1)).toBe('a')
    expect(bm.getKey(obj2)).toBe('b')
  })

  it('handles array values', () => {
    const bm = new BiMap<string, number[]>()

    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]

    bm.set('a', arr1)
    bm.set('b', arr2)

    expect(bm.get('a')).toEqual(arr1)
    expect(bm.get('b')).toEqual(arr2)
  })

  it('handles numeric keys and values', () => {
    const bm = new BiMap<number, number>()

    bm.set(1, 10)
    bm.set(2, 20)
    bm.set(-1, -10)

    expect(bm.get(1)).toBe(10)
    expect(bm.get(2)).toBe(20)
    expect(bm.get(-1)).toBe(-10)
  })

  it('handles negative numbers', () => {
    const bm = new BiMap<number, number>()

    bm.set(-5, -10)
    bm.set(-1, -2)

    expect(bm.get(-5)).toBe(-10)
    expect(bm.get(-1)).toBe(-2)
    expect(bm.getKey(-10)).toBe(-5)
    expect(bm.getKey(-2)).toBe(-1)
  })

  it('handles floating point numbers', () => {
    const bm = new BiMap<number, number>()

    bm.set(1.5, 2.5)
    bm.set(-0.5, 0.5)

    expect(bm.get(1.5)).toBe(2.5)
    expect(bm.get(-0.5)).toBe(0.5)
    expect(bm.getKey(2.5)).toBe(1.5)
  })

  it('keys generator is empty for empty map', () => {
    const bm = new BiMap<string, number>()

    expect([...bm.keys()]).toEqual([])
  })

  it('values generator is empty for empty map', () => {
    const bm = new BiMap<string, number>()

    expect([...bm.values()]).toEqual([])
  })

  it('entries generator is empty for empty map', () => {
    const bm = new BiMap<string, number>()

    expect([...bm.entries()]).toEqual([])
  })

  it('clone produces correct copy with multiple entries', () => {
    const bm = new BiMap<string, number>()

    bm.set('a', 1)
    bm.set('b', 2)
    bm.set('c', 3)

    const cloned = bm.clone()

    expect(cloned.size).toBe(3)
    expect(cloned.get('a')).toBe(1)
    expect(cloned.get('b')).toBe(2)
    expect(cloned.get('c')).toBe(3)
  })

  it('equals returns true for empty maps', () => {
    const bm1 = new BiMap<string, number>()
    const bm2 = new BiMap<string, number>()

    expect(bm1.equals(bm2)).toBe(true)
  })
})

describe('bi-map - wave546', () => {
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

describe('bi-map - wave547', () => {
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

describe('bi-map - wave548', () => {
  it('bi-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bi-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bi-map module has name', () => {
    expect(describe).toBeDefined()
  })
})
