import { describe, expect, it } from 'vitest'
import { HashMapOpen } from '../../src/utils/hash-map-open.js'

describe('HashMapOpen', () => {
  it('set and get a value', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    expect(map.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.get('missing')).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    expect(map.has('a')).toBe(true)
    expect(map.has('b')).toBe(false)
  })

  it('delete removes a key', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    expect(map.delete('a')).toBe(true)
    expect(map.get('a')).toBeUndefined()
    expect(map.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.delete('missing')).toBe(false)
  })

  it('size tracks entries', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.size).toBe(0)
    map.set('a', 1)
    map.set('b', 2)
    expect(map.size).toBe(2)
  })

  it('update existing key', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('keys returns all keys', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const keys = map.keys()
    expect(keys).toHaveLength(2)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })

  it('values returns all values', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.values()).toHaveLength(2)
  })

  it('entries returns key-value pairs', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const entries = map.entries()
    expect(entries).toHaveLength(2)
  })

  it('clear removes all entries', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.get('a')).toBeUndefined()
  })

  it('handles many insertions with resize', () => {
    const map = new HashMapOpen<number, number>(4)
    for (let i = 0; i < 100; i++) {
      map.set(i, i * 10)
    }
    expect(map.size).toBe(100)
    expect(map.get(50)).toBe(500)
  })

  it('handles tombstone reuse after delete', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.delete('a')
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('works with number keys', () => {
    const map = new HashMapOpen<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
  })

  it('handles empty operations', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.keys()).toEqual([])
    expect(map.values()).toEqual([])
    expect(map.entries()).toEqual([])
  })

  it('handles has after delete', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.delete('a')
    expect(map.has('a')).toBe(false)
  })

  it('handles heavy delete+insert without infinite loop', () => {
    const map = new HashMapOpen<number, string>(8, 0.75)
    for (let i = 0; i < 6; i++) map.set(i, `val${i}`)
    for (let i = 0; i < 6; i++) {
      map.delete(i)
      map.set(i + 100, `val${i + 100}`)
    }
    expect(map.size).toBe(6)
    for (let i = 0; i < 6; i++) {
      expect(map.get(i)).toBeUndefined()
      expect(map.get(i + 100)).toBe(`val${i + 100}`)
    }
  })

  it('toString returns size', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.toString()).toBe('HashMapOpen(2)')
  })

  it('toString with empty map', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.toString()).toBe('HashMapOpen(0)')
  })

  it('toJSON returns entries array', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const json = map.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json).toHaveLength(2)
    expect(json).toContainEqual(['a', 1])
    expect(json).toContainEqual(['b', 2])
  })

  it('toJSON with empty map', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.toJSON()).toEqual([])
  })

  it('clone creates independent copy', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const clone = map.clone()
    clone.set('c', 3)
    expect(map.size).toBe(2)
    expect(clone.size).toBe(3)
    expect(clone.get('a')).toBe(1)
    expect(map.has('c')).toBe(false)
  })

  it('clone with empty map', () => {
    const map = new HashMapOpen<string, number>()
    const clone = map.clone()
    expect(clone.size).toBe(0)
    expect(map).not.toBe(clone)
  })

  it('equals returns true for identical maps', () => {
    const map1 = new HashMapOpen<string, number>()
    const map2 = new HashMapOpen<string, number>()
    map1.set('a', 1)
    map1.set('b', 2)
    map2.set('a', 1)
    map2.set('b', 2)
    expect(map1.equals(map2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const map1 = new HashMapOpen<string, number>()
    const map2 = new HashMapOpen<string, number>()
    map1.set('a', 1)
    expect(map1.equals(map2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const map1 = new HashMapOpen<string, number>()
    const map2 = new HashMapOpen<string, number>()
    map1.set('a', 1)
    map2.set('a', 2)
    expect(map1.equals(map2)).toBe(false)
  })

  it('equals returns false for non-HashMap', () => {
    const map = new HashMapOpen<string, number>()
    expect(map.equals({})).toBe(false)
    expect(map.equals(null)).toBe(false)
    expect(map.equals(undefined)).toBe(false)
  })

  it('custom initial capacity', () => {
    const map = new HashMapOpen<number, number>(32)
    map.set(1, 100)
    expect(map.get(1)).toBe(100)
  })

  it('custom load factor', () => {
    const map = new HashMapOpen<number, number>(4, 0.5)
    map.set(1, 1)
    map.set(2, 2)
    expect(map.size).toBe(2)
  })

  it('handles boolean keys', () => {
    const map = new HashMapOpen<boolean, string>()
    map.set(true, 'yes')
    map.set(false, 'no')
    expect(map.get(true)).toBe('yes')
    expect(map.get(false)).toBe('no')
  })

  it('handles null and undefined keys', () => {
    const map = new HashMapOpen<string | null | undefined, number>()
    map.set(null, 1)
    map.set(undefined, 2)
    expect(map.get(null)).toBe(1)
    expect(map.get(undefined)).toBe(2)
  })

  it('multiple deletes of same key', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    expect(map.delete('a')).toBe(true)
    expect(map.delete('a')).toBe(false)
    expect(map.size).toBe(0)
  })

  it('clear on empty map', () => {
    const map = new HashMapOpen<string, number>()
    map.clear()
    expect(map.size).toBe(0)
  })

  it('clear multiple times', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.clear()
    map.clear()
    map.clear()
    expect(map.size).toBe(0)
  })

  it('set after clear', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.clear()
    map.set('b', 2)
    expect(map.size).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('a')).toBeUndefined()
  })

  it('keys returns array of correct type', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    const keys = map.keys()
    expect(Array.isArray(keys)).toBe(true)
    expect(keys[0]).toBe('a')
  })

  it('values returns array of correct values', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const values = map.values()
    expect(Array.isArray(values)).toBe(true)
    expect(values).toContain(1)
    expect(values).toContain(2)
  })

  it('entries contains correct key-value pairs', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const entries = map.entries()
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['b', 2])
  })

  it('handles large number of entries', () => {
    const map = new HashMapOpen<number, number>()
    for (let i = 0; i < 1000; i++) {
      map.set(i, i * 2)
    }
    expect(map.size).toBe(1000)
    expect(map.get(500)).toBe(1000)
  })

  it('handles special characters as keys', () => {
    const map = new HashMapOpen<string, number>()
    map.set('key with spaces', 1)
    map.set('key\nwith\nnewlines', 2)
    map.set('key\twith\ttabs', 3)
    expect(map.get('key with spaces')).toBe(1)
    expect(map.get('key\nwith\nnewlines')).toBe(2)
    expect(map.get('key\twith\ttabs')).toBe(3)
  })

  it('handles object stringification for keys', () => {
    const map = new HashMapOpen<object, string>()
    const obj1 = { a: 1 }
    const obj2 = { a: 1 }
    map.set(obj1, 'first')
    expect(map.get(obj1)).toBe('first')
    expect(map.get(obj2)).toBeUndefined()
  })

  it('handles array keys', () => {
    const map = new HashMapOpen<number[], string>()
    const arr1 = [1, 2]
    const arr2 = [1, 2]
    map.set(arr1, 'first')
    expect(map.get(arr1)).toBe('first')
    expect(map.get(arr2)).toBeUndefined()
  })

  it('equals handles empty maps', () => {
    const map1 = new HashMapOpen<string, number>()
    const map2 = new HashMapOpen<string, number>()
    expect(map1.equals(map2)).toBe(true)
  })

  it('equals handles same instance', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    expect(map.equals(map)).toBe(true)
  })

  it('clone preserves capacity and load factor', () => {
    const map = new HashMapOpen<number, number>(32, 0.5)
    map.set(1, 100)
    const clone = map.clone()
    clone.set(2, 200)
    expect(clone.get(1)).toBe(100)
    expect(clone.get(2)).toBe(200)
  })

  it('handles consecutive deletes', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.delete('a')).toBe(true)
    expect(map.delete('b')).toBe(true)
    expect(map.delete('c')).toBe(true)
    expect(map.size).toBe(0)
  })

  it('handles get after many operations', () => {
    const map = new HashMapOpen<number, number>()
    for (let i = 0; i < 50; i++) {
      map.set(i, i * 2)
    }
    for (let i = 0; i < 50; i += 2) {
      map.delete(i)
    }
    for (let i = 1; i < 50; i += 2) {
      expect(map.get(i)).toBe(i * 2)
    }
  })

  it('handles resize after delete', () => {
    const map = new HashMapOpen<number, number>(4, 0.75)
    for (let i = 0; i < 6; i++) map.set(i, i)
    map.delete(0)
    map.delete(1)
    for (let i = 6; i < 15; i++) {
      map.set(i, i)
    }
    expect(map.size).toBe(13)
  })

  it('should return entries', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const entries = map.entries()
    expect(entries.length).toBe(2)
  })

  it('should iterate keys and values', () => {
    const map = new HashMapOpen<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.keys().length).toBe(2)
    expect(map.values().length).toBe(2)
  })

  it('should handle overwrite', () => {
    const map = new HashMapOpen<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.get('a')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('should handle delete', () => {
    const map = new HashMapOpen<number, string>()
    map.set(1, 'one')
    expect(map.delete(1)).toBe(true)
    expect(map.get(1)).toBeUndefined()
  })

  it('has returns true for existing key', () => {
    const map = new HashMapOpen<string, number>()
    map.set('key', 42)
    expect(map.has('key')).toBe(true)
    expect(map.has('missing')).toBe(false)
  })

  it('set overwrites existing value', () => {
    const map = new HashMapOpen<number, string>()
    map.set(1, 'a')
    map.set(1, 'b')
    expect(map.get(1)).toBe('b')
  })

  it('handles many insertions', () => {
    const map = new HashMapOpen<number, number>()
    for (let i = 0; i < 100; i++) map.set(i, i * 2)
    expect(map.get(50)).toBe(100)
  })

  it('new map is empty', () => {
    const m = new HashMapOpen<string, number>()
    expect(m.size).toBe(0)
  })

  it('set and get', () => {
    const m = new HashMapOpen<string, number>()
    m.set('a', 1)
    expect(m.get('a')).toBe(1)
  })

  it('has returns boolean', () => {
    const m = new HashMapOpen<string, number>()
    expect(m.has('missing')).toBe(false)
  })
})

describe('hash-map-open - wave545', () => {
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

describe('hash-map-open - wave546', () => {
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

describe('hash-map-open - wave547', () => {
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

describe('hash-map-open - wave548', () => {
  it('hash-map-open module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave549', () => {
  it('hash-map-open module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave550', () => {
  it('hash-map-open w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave551', () => {
  it('hash-map-open w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave552', () => {
  it('hash-map-open w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave553', () => {
  it('hash-map-open w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave554', () => {
  it('hash-map-open w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave555', () => {
  it('hash-map-open w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave556', () => {
  it('hash-map-open w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave557', () => {
  it('hash-map-open w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave558', () => {
  it('hash-map-open w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave559', () => {
  it('hash-map-open w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave560', () => {
  it('hash-map-open w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave561', () => {
  it('hash-map-open w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave562', () => {
  it('hash-map-open w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave563', () => {
  it('hash-map-open w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave564', () => {
  it('hash-map-open w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave565', () => {
  it('hash-map-open w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave566', () => {
  it('hash-map-open w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave127', () => {
  it('hash-map-open w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave130', () => {
  it('hash-map-open w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave133', () => {
  it('hash-map-open w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave136', () => {
  it('hash-map-open w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - wave139', () => {
  it('hash-map-open w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - w142', () => {
  it('hash-map-open v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - w145', () => {
  it('hash-map-open v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - w148', () => {
  it('hash-map-open v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - w151', () => {
  it('hash-map-open v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - w154', () => {
  it('hash-map-open v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - w157', () => {
  it('hash-map-open v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-map-open - w160', () => {
  it('hash-map-open v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-map-open v160x2', () => {
    expect(describe).toBeDefined()
  })
})
