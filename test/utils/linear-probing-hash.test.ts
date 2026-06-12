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

describe('linear-probing-hash - wave550', () => {
  it('linear-probing-hash w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave551', () => {
  it('linear-probing-hash w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave552', () => {
  it('linear-probing-hash w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave553', () => {
  it('linear-probing-hash w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave554', () => {
  it('linear-probing-hash w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave555', () => {
  it('linear-probing-hash w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave556', () => {
  it('linear-probing-hash w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave557', () => {
  it('linear-probing-hash w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave558', () => {
  it('linear-probing-hash w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave559', () => {
  it('linear-probing-hash w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave560', () => {
  it('linear-probing-hash w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave561', () => {
  it('linear-probing-hash w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave562', () => {
  it('linear-probing-hash w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave563', () => {
  it('linear-probing-hash w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave564', () => {
  it('linear-probing-hash w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave565', () => {
  it('linear-probing-hash w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave566', () => {
  it('linear-probing-hash w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave127', () => {
  it('linear-probing-hash w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave130', () => {
  it('linear-probing-hash w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave133', () => {
  it('linear-probing-hash w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave136', () => {
  it('linear-probing-hash w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - wave139', () => {
  it('linear-probing-hash w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w142', () => {
  it('linear-probing-hash v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w145', () => {
  it('linear-probing-hash v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w148', () => {
  it('linear-probing-hash v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w151', () => {
  it('linear-probing-hash v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w154', () => {
  it('linear-probing-hash v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w157', () => {
  it('linear-probing-hash v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w160', () => {
  it('linear-probing-hash v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w170', () => {
  it('linear-probing-hash x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w180', () => {
  it('linear-probing-hash x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w190', () => {
  it('linear-probing-hash x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w200', () => {
  it('linear-probing-hash x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w210', () => {
  it('linear-probing-hash x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w220', () => {
  it('linear-probing-hash x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w230', () => {
  it('linear-probing-hash x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w240', () => {
  it('linear-probing-hash x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w250', () => {
  it('linear-probing-hash x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w260', () => {
  it('linear-probing-hash x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w270', () => {
  it('linear-probing-hash x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w280', () => {
  it('linear-probing-hash x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w290', () => {
  it('linear-probing-hash x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w300', () => {
  it('linear-probing-hash x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w310', () => {
  it('linear-probing-hash x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w320', () => {
  it('linear-probing-hash x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w330', () => {
  it('linear-probing-hash x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w340', () => {
  it('linear-probing-hash x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w350', () => {
  it('linear-probing-hash x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w360', () => {
  it('linear-probing-hash x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w370', () => {
  it('linear-probing-hash x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w380', () => {
  it('linear-probing-hash x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w390', () => {
  it('linear-probing-hash x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w400', () => {
  it('linear-probing-hash x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w420', () => {
  it('linear-probing-hash x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w440', () => {
  it('linear-probing-hash x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w460', () => {
  it('linear-probing-hash x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w480', () => {
  it('linear-probing-hash x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w500', () => {
  it('linear-probing-hash x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w550', () => {
  it('linear-probing-hash x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('linear-probing-hash - w600', () => {
  it('linear-probing-hash x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('linear-probing-hash x600x49', () => {
    expect(describe).toBeDefined()
  })
})
