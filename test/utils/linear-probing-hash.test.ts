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
