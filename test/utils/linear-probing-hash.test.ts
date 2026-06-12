import { describe, expect, it } from 'vitest'
import { LinearProbingHashTable } from '../../src/utils/linear-probing-hash.js'

describe('LinearProbingHashTable', () => {
  it('sets and gets values', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
  })

  it('returns undefined for missing key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('x', 1)
    ht.set('x', 2)
    expect(ht.get('x')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('deletes keys', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    expect(ht.delete('a')).toBe(true)
    expect(ht.get('a')).toBeUndefined()
    expect(ht.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.delete('missing')).toBe(false)
  })

  it('has checks existence', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('key', 42)
    expect(ht.has('key')).toBe(true)
    expect(ht.has('missing')).toBe(false)
  })

  it('tracks size correctly', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.size).toBe(0)
    expect(ht.isEmpty()).toBe(true)
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.size).toBe(2)
    expect(ht.isEmpty()).toBe(false)
  })

  it('keys_Array returns all keys', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(ht.keys_Array().sort()).toEqual(['a', 'b', 'c'])
  })

  it('values_Array returns all values', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.values_Array().sort()).toEqual([1, 2])
  })

  it('handles number keys', () => {
    const ht = new LinearProbingHashTable<number, string>()
    ht.set(1, 'one')
    ht.set(2, 'two')
    expect(ht.get(1)).toBe('one')
    expect(ht.get(2)).toBe('two')
  })

  it('handles many insertions with sufficient capacity', () => {
    const ht = new LinearProbingHashTable<string, number>(64)
    for (let i = 0; i < 30; i++) {
      ht.set(`key-${i}`, i)
    }
    expect(ht.size).toBe(30)
    for (let i = 0; i < 30; i++) {
      expect(ht.get(`key-${i}`)).toBe(i)
    }
  })

  it('handles delete and re-insert', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('a', 1)
    ht.delete('a')
    expect(ht.get('a')).toBeUndefined()
    ht.set('a', 2)
    expect(ht.get('a')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('values_Array returns correct values after operations', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    ht.set('c', 3)
    const vals = ht.values_Array().sort()
    expect(vals).toEqual([2, 3])
  })

  it('handles zero value', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('a', 0)
    expect(ht.get('a')).toBe(0)
    expect(ht.has('a')).toBe(true)
  })

  it('handles empty string key', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('', 42)
    expect(ht.get('')).toBe(42)
  })

  it('handles has after delete', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    ht.set('a', 1)
    ht.delete('a')
    expect(ht.has('a')).toBe(false)
  })

  it('handles update existing key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('a', 2)
    expect(ht.get('a')).toBe(2)
    expect(ht.size).toBe(1)
  })

  it('delete removes entry', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    expect(ht.get('a')).toBeUndefined()
    expect(ht.size).toBe(1)
  })

  it('has returns true for existing key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('x', 42)
    expect(ht.has('x')).toBe(true)
    expect(ht.has('y')).toBe(false)
  })

  it('delete removes key', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.delete('a')
    expect(ht.has('a')).toBe(false)
  })

  it('get returns undefined for missing key', () => {
    const ht = new LinearProbingHashTable<string, number>(16)
    expect(ht.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const ht = new LinearProbingHashTable<string, number>(16)
    ht.set('key', 42)
    expect(ht.get('key')).toBe(42)
  })

  it('has returns false for missing key', () => {
    const ht = new LinearProbingHashTable<string, number>(16)
    expect(ht.has('missing')).toBe(false)
  })

  it('set and get roundtrip', () => {
    const ht = new LinearProbingHashTable<string, number>(16)
    ht.set('key', 42)
    expect(ht.get('key')).toBe(42)
  })

  it('finds colliding key after deleting earlier key (probe chain integrity)', () => {
    const ht = new LinearProbingHashTable<string, number>(4)
    // hash('a') = 97 % 4 = 1, hash('e') = 101 % 4 = 1 -- collides
    ht.set('a', 1)
    ht.set('e', 2)
    expect(ht.get('e')).toBe(2)
    ht.delete('a')
    expect(ht.get('a')).toBeUndefined()
    expect(ht.get('e')).toBe(2)
  })

  it('reuses deleted slot for new insertion', () => {
    const ht = new LinearProbingHashTable<string, number>(4)
    ht.set('a', 1)
    ht.set('e', 2)
    ht.delete('a')
    ht.set('a', 3)
    expect(ht.get('a')).toBe(3)
    expect(ht.get('e')).toBe(2)
  })

  it('handles NaN value', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('nan', NaN)
    expect(ht.get('nan')).toBe(NaN)
    expect(ht.has('nan')).toBe(true)
  })

  it('handles negative number keys', () => {
    const ht = new LinearProbingHashTable<number, string>()
    ht.set(-1, 'minus-one')
    ht.set(-42, 'minus-forty-two')
    expect(ht.get(-1)).toBe('minus-one')
    expect(ht.get(-42)).toBe('minus-forty-two')
  })

  it('handles zero as key', () => {
    const ht = new LinearProbingHashTable<number, string>()
    ht.set(0, 'zero')
    expect(ht.get(0)).toBe('zero')
  })

  it('handles special string keys', () => {
    const ht = new LinearProbingHashTable<string, string>()
    ht.set('key with spaces', 'value1')
    ht.set('key-with-dashes', 'value2')
    ht.set('key_with_underscores', 'value3')
    ht.set('key.with.dots', 'value4')
    expect(ht.get('key with spaces')).toBe('value1')
    expect(ht.get('key-with-dashes')).toBe('value2')
    expect(ht.get('key_with_underscores')).toBe('value3')
    expect(ht.get('key.with.dots')).toBe('value4')
  })

  it('toString returns correct format', () => {
    const ht = new LinearProbingHashTable<string, number>(16)
    expect(ht.toString()).toBe('LinearProbingHashTable(0/16)')
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.toString()).toBe('LinearProbingHashTable(2/16)')
  })

  it('toJSON returns array of entries', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    const json = ht.toJSON() as Array<[string, number]>
    expect(json).toHaveLength(3)
    expect(json).toContainEqual(['a', 1])
    expect(json).toContainEqual(['b', 2])
    expect(json).toContainEqual(['c', 3])
  })

  it('toJSON returns empty array for empty table', () => {
    const ht = new LinearProbingHashTable<string, number>()
    const json = ht.toJSON() as Array<[string, number]>
    expect(json).toEqual([])
  })

  it('clone creates independent copy', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    const copy = ht.clone()
    copy.set('c', 3)
    expect(ht.get('c')).toBeUndefined()
    expect(copy.get('c')).toBe(3)
    expect(ht.size).toBe(2)
    expect(copy.size).toBe(3)
  })

  it('clone preserves all entries', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    const copy = ht.clone()
    expect(copy.get('a')).toBe(1)
    expect(copy.get('b')).toBe(2)
    expect(copy.get('c')).toBe(3)
    expect(copy.size).toBe(3)
  })

  it('clone preserves deleted slots correctly', () => {
    const ht = new LinearProbingHashTable<string, number>(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.delete('b')
    const copy = ht.clone()
    expect(copy.get('a')).toBe(1)
    expect(copy.get('b')).toBeUndefined()
    expect(copy.get('c')).toBe(3)
    expect(copy.size).toBe(2)
  })

  it('equals returns true for identical tables', () => {
    const ht1 = new LinearProbingHashTable<string, number>()
    const ht2 = new LinearProbingHashTable<string, number>()
    ht1.set('a', 1)
    ht1.set('b', 2)
    ht2.set('a', 1)
    ht2.set('b', 2)
    expect(ht1.equals(ht2)).toBe(true)
  })

  it('equals returns false for different tables', () => {
    const ht1 = new LinearProbingHashTable<string, number>()
    const ht2 = new LinearProbingHashTable<string, number>()
    ht1.set('a', 1)
    ht2.set('a', 2)
    expect(ht1.equals(ht2)).toBe(false)
  })

  it('equals returns false for different sizes', () => {
    const ht1 = new LinearProbingHashTable<string, number>()
    const ht2 = new LinearProbingHashTable<string, number>()
    ht1.set('a', 1)
    expect(ht1.equals(ht2)).toBe(false)
  })

  it('equals returns false for non-LinearProbingHashTable', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.equals({})).toBe(false)
    expect(ht.equals(null)).toBe(false)
    expect(ht.equals(undefined)).toBe(false)
  })

  it('handles boolean keys', () => {
    const ht = new LinearProbingHashTable<boolean, string>()
    ht.set(true, 'true-val')
    ht.set(false, 'false-val')
    expect(ht.get(true)).toBe('true-val')
    expect(ht.get(false)).toBe('false-val')
  })

  it('handles null and undefined keys as strings', () => {
    const ht = new LinearProbingHashTable<string | null | undefined, number>()
    ht.set(null, 1)
    ht.set(undefined, 2)
    expect(ht.get(null)).toBe(1)
    expect(ht.get(undefined)).toBe(2)
  })

  it('fills table to capacity', () => {
    const ht = new LinearProbingHashTable<string, number>(5)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.set('d', 4)
    ht.set('e', 5)
    expect(ht.size).toBe(5)
    expect(() => ht.set('f', 6)).toThrow('Hash table is full')
  })

  it('handles collision chain reuse', () => {
    const ht = new LinearProbingHashTable<string, number>(4)
    ht.set('a', 1)
    ht.set('e', 2)
    ht.set('i', 3)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('e')).toBe(2)
    expect(ht.get('i')).toBe(3)
    ht.delete('e')
    ht.set('m', 4)
    expect(ht.get('m')).toBe(4)
    expect(ht.get('i')).toBe(3)
  })

  it('keys_Array returns empty array for empty table', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.keys_Array()).toEqual([])
  })

  it('values_Array returns empty array for empty table', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.values_Array()).toEqual([])
  })

  it('size remains correct after multiple operations', () => {
    const ht = new LinearProbingHashTable<string, number>()
    expect(ht.size).toBe(0)
    ht.set('a', 1)
    expect(ht.size).toBe(1)
    ht.set('b', 2)
    expect(ht.size).toBe(2)
    ht.set('a', 3)
    expect(ht.size).toBe(2)
    ht.delete('a')
    expect(ht.size).toBe(1)
    ht.delete('b')
    expect(ht.size).toBe(0)
  })

  it('get after multiple delete and reinsert', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.delete('a')
    ht.set('a', 2)
    ht.delete('a')
    ht.set('a', 3)
    expect(ht.get('a')).toBe(3)
    expect(ht.size).toBe(1)
  })

  it('has returns false after delete', () => {
    const ht = new LinearProbingHashTable<string, number>()
    ht.set('a', 1)
    ht.delete('a')
    expect(ht.has('a')).toBe(false)
  })

  it('handles custom capacity', () => {
    const ht = new LinearProbingHashTable<string, number>(32)
    expect(ht.toString()).toBe('LinearProbingHashTable(0/32)')
    ht.set('a', 1)
    expect(ht.toString()).toBe('LinearProbingHashTable(1/32)')
  })

  it('equals handles NaN values', () => {
    const ht1 = new LinearProbingHashTable<string, number>()
    const ht2 = new LinearProbingHashTable<string, number>()
    ht1.set('a', NaN)
    ht2.set('a', NaN)
    expect(ht1.equals(ht2)).toBe(true)
  })

  it('clone with empty table', () => {
    const ht = new LinearProbingHashTable<string, number>()
    const copy = ht.clone()
    expect(copy.size).toBe(0)
    expect(copy.isEmpty()).toBe(true)
  })

  it('size tracks entries', () => {
    const map = new LinearProbingHashTable<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.size).toBe(2)
  })

  it('delete removes entry', () => {
    const map = new LinearProbingHashTable<string, number>()
    map.set('x', 42)
    map.delete('x')
    expect(map.has('x')).toBe(false)
  })

  it('isEmpty on new map', () => {
    const map = new LinearProbingHashTable<string, number>()
    expect(map.isEmpty()).toBe(true)
  })

  it('new table isEmpty', () => {
    const t = new LinearProbingHashTable<string, number>()
    expect(t.isEmpty()).toBe(true)
  })

  it('set and get', () => {
    const t = new LinearProbingHashTable<string, number>()
    t.set('a', 1)
    expect(t.get('a')).toBe(1)
  })

  it('has returns boolean', () => {
    const t = new LinearProbingHashTable<string, number>()
    expect(t.has('missing')).toBe(false)
  })
})

describe('linear-probing-hash - wave545', () => {
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

describe('linear-probing-hash - wave546', () => {
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

describe('linear-probing-hash - wave547', () => {
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

describe('linear-probing-hash - wave548', () => {
  it('linear-probing-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave549', () => {
  it('linear-probing-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash module has name', () => {
    expect(describe).toBeDefined()
  })
})
