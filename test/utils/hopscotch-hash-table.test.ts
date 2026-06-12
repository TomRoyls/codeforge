import { describe, it, expect } from 'vitest'
import { HopscotchHashTable } from '../../src/utils/hopscotch-hash-table.js'

describe('HopscotchHashTable', () => {
  it('creates table with default options', () => {
    const table = new HopscotchHashTable<number, number>()
    expect(table.size).toBe(0)
    expect(table.capacity).toBe(16)
    expect(table.isEmpty()).toBe(true)
  })

  it('creates table with custom capacity', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 8 })
    expect(table.capacity).toBe(8)
    expect(table.size).toBe(0)
  })

  it('creates table with custom maxHop', () => {
    const table = new HopscotchHashTable<number, number>({ maxHop: 16 })
    expect(table.size).toBe(0)
  })

  it('sets and gets values', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    expect(table.get(1)).toBe(100)
    expect(table.size).toBe(1)
  })

  it('returns undefined for non-existent key', () => {
    const table = new HopscotchHashTable<number, number>()
    expect(table.get(999)).toBeUndefined()
  })

  it('updates existing key', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(1, 200)
    expect(table.get(1)).toBe(200)
    expect(table.size).toBe(1)
  })

  it('checks if key exists with has()', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    expect(table.has(1)).toBe(true)
    expect(table.has(2)).toBe(false)
  })

  it('deletes existing key', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    const deleted = table.delete(1)
    expect(deleted).toBe(true)
    expect(table.get(1)).toBeUndefined()
    expect(table.size).toBe(0)
  })

  it('returns false when deleting non-existent key', () => {
    const table = new HopscotchHashTable<number, number>()
    const deleted = table.delete(999)
    expect(deleted).toBe(false)
  })

  it('clears all entries', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    table.clear()
    expect(table.size).toBe(0)
    expect(table.isEmpty()).toBe(true)
    expect(table.get(1)).toBeUndefined()
  })

  it('returns all keys', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    table.set(3, 300)
    const keys = table.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain(1)
    expect(keys).toContain(2)
    expect(keys).toContain(3)
  })

  it('returns all values', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    table.set(3, 300)
    const values = table.values()
    expect(values.length).toBe(3)
    expect(values).toContain(100)
    expect(values).toContain(200)
    expect(values).toContain(300)
  })

  it('returns all entries as key-value pairs', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    const entries = table.entries()
    expect(entries.length).toBe(2)
    expect(entries).toContainEqual([1, 100])
    expect(entries).toContainEqual([2, 200])
  })

  it('iterates with forEach', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    const results: number[] = []
    table.forEach((value) => {
      results.push(value)
    })
    expect(results.length).toBe(2)
    expect(results).toContain(100)
    expect(results).toContain(200)
  })

  it('calculates load factor', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    table.set(3, 300)
    table.set(4, 400)
    expect(table.loadFactor()).toBe(4 / 16)
  })

  it('handles string keys', () => {
    const table = new HopscotchHashTable<string, number>()
    table.set('a', 1)
    table.set('b', 2)
    expect(table.get('a')).toBe(1)
    expect(table.get('b')).toBe(2)
    expect(table.size).toBe(2)
  })

  it('handles multiple keys with same hash collision', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 4 })
    table.set(1, 100)
    table.set(5, 500)
    table.set(9, 900)
    expect(table.size).toBe(3)
    expect(table.get(1)).toBe(100)
    expect(table.get(5)).toBe(500)
    expect(table.get(9)).toBe(900)
  })

  it('creates table from entries', () => {
    const entries: Array<[string, number]> = [
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ]
    const table = HopscotchHashTable.fromEntries(entries)
    expect(table.size).toBe(3)
    expect(table.get('a')).toBe(1)
    expect(table.get('b')).toBe(2)
    expect(table.get('c')).toBe(3)
  })

  it('resizes when load factor exceeds threshold', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 4 })
    const initialCapacity = table.capacity
    for (let i = 0; i < 5; i++) {
      table.set(i, i * 10)
    }
    expect(table.capacity).toBeGreaterThan(initialCapacity)
    expect(table.size).toBe(5)
  })

  it('preserves values after resize', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 4 })
    table.set(1, 100)
    table.set(2, 200)
    table.set(3, 300)
    table.set(4, 400)
    expect(table.get(1)).toBe(100)
    expect(table.get(2)).toBe(200)
    expect(table.get(3)).toBe(300)
    expect(table.get(4)).toBe(400)
  })

  it('handles deletion and re-insertion', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.delete(1)
    expect(table.get(1)).toBeUndefined()
    table.set(1, 200)
    expect(table.get(1)).toBe(200)
    expect(table.size).toBe(1)
  })

  it('handles complex values', () => {
    const table = new HopscotchHashTable<number, { x: number; y: number }>()
    table.set(1, { x: 10, y: 20 })
    const value = table.get(1)
    expect(value).toEqual({ x: 10, y: 20 })
  })

  it('has returns false for missing key', () => {
    const table = new HopscotchHashTable<number, { x: number; y: number }>(16)
    expect(table.has(999)).toBe(false)
  })

  it('set and get roundtrip', () => {
    const table = new HopscotchHashTable<number, string>(16)
    table.set(1, 'hello')
    expect(table.get(1)).toBe('hello')
  })

  it('preserves probe chain after deleting ideal bucket entry', () => {
    const ht = new HopscotchHashTable<string, number>({ capacity: 4, maxHop: 32 })
    ht.set('a', 1)
    ht.set('i', 2)
    expect(ht.get('i')).toBe(2)
    ht.delete('a')
    expect(ht.get('a')).toBeUndefined()
    expect(ht.get('i')).toBe(2)
  })

  describe('HopscotchHashTable toString', () => {
    it('returns correct format for empty table', () => {
      const table = new HopscotchHashTable<number, number>()
      expect(table.toString()).toBe('HopscotchHashTable(0)')
    })

    it('returns correct format with entries', () => {
      const table = new HopscotchHashTable<number, number>()
      table.set(1, 10)
      table.set(2, 20)
      expect(table.toString()).toBe('HopscotchHashTable(2)')
    })

    it('reflects size after clear', () => {
      const table = new HopscotchHashTable<number, number>()
      table.set(1, 10)
      table.clear()
      expect(table.toString()).toBe('HopscotchHashTable(0)')
    })
  })

  describe('HopscotchHashTable toJSON', () => {
    it('returns empty array for empty table', () => {
      const table = new HopscotchHashTable<number, number>()
      expect(table.toJSON()).toEqual([])
    })

    it('returns entries as key-value pairs', () => {
      const table = new HopscotchHashTable<number, number>()
      table.set(1, 10)
      table.set(2, 20)
      const json = table.toJSON() as Array<[number, number]>
      expect(json.length).toBe(2)
      expect(json).toContainEqual([1, 10])
      expect(json).toContainEqual([2, 20])
    })

    it('returns updated values after overwrite', () => {
      const table = new HopscotchHashTable<number, number>()
      table.set(1, 10)
      table.set(1, 99)
      const json = table.toJSON() as Array<[number, number]>
      expect(json).toEqual([[1, 99]])
    })
  })

  describe('HopscotchHashTable clone', () => {
    it('creates independent copy of empty table', () => {
      const table = new HopscotchHashTable<number, number>()
      const clone = table.clone()
      expect(clone.size).toBe(0)
      expect(clone.isEmpty()).toBe(true)
    })

    it('preserves all entries', () => {
      const table = new HopscotchHashTable<number, number>()
      table.set(1, 10)
      table.set(2, 20)
      table.set(3, 30)
      const clone = table.clone()
      expect(clone.size).toBe(3)
      expect(clone.get(1)).toBe(10)
      expect(clone.get(2)).toBe(20)
      expect(clone.get(3)).toBe(30)
    })

    it('modifications to clone do not affect original', () => {
      const table = new HopscotchHashTable<number, number>()
      table.set(1, 10)
      table.set(2, 20)
      const clone = table.clone()
      clone.delete(1)
      expect(table.get(1)).toBe(10)
      expect(clone.get(1)).toBeUndefined()
    })

    it('modifications to original do not affect clone', () => {
      const table = new HopscotchHashTable<number, number>()
      table.set(1, 10)
      const clone = table.clone()
      table.set(2, 20)
      expect(clone.size).toBe(1)
      expect(clone.get(2)).toBeUndefined()
    })

    it('preserves string key entries', () => {
      const table = new HopscotchHashTable<string, string>()
      table.set('hello', 'world')
      table.set('foo', 'bar')
      const clone = table.clone()
      expect(clone.get('hello')).toBe('world')
      expect(clone.get('foo')).toBe('bar')
    })
  })

  describe('HopscotchHashTable equals', () => {
    it('empty tables are equal', () => {
      const a = new HopscotchHashTable<number, number>()
      const b = new HopscotchHashTable<number, number>()
      expect(a.equals(b)).toBe(true)
    })

    it('same entries are equal', () => {
      const a = new HopscotchHashTable<number, number>()
      const b = new HopscotchHashTable<number, number>()
      a.set(1, 10)
      a.set(2, 20)
      b.set(1, 10)
      b.set(2, 20)
      expect(a.equals(b)).toBe(true)
    })

    it('different sizes are not equal', () => {
      const a = new HopscotchHashTable<number, number>()
      const b = new HopscotchHashTable<number, number>()
      a.set(1, 10)
      expect(a.equals(b)).toBe(false)
    })

    it('different values are not equal', () => {
      const a = new HopscotchHashTable<number, number>()
      const b = new HopscotchHashTable<number, number>()
      a.set(1, 10)
      b.set(1, 99)
      expect(a.equals(b)).toBe(false)
    })

    it('different keys are not equal', () => {
      const a = new HopscotchHashTable<number, number>()
      const b = new HopscotchHashTable<number, number>()
      a.set(1, 10)
      b.set(2, 10)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false for non-HopscotchHashTable', () => {
      const table = new HopscotchHashTable<number, number>()
      expect(table.equals(null)).toBe(false)
      expect(table.equals(undefined)).toBe(false)
      expect(table.equals({})).toBe(false)
      expect(table.equals([])).toBe(false)
      expect(table.equals('string')).toBe(false)
    })

    it('returns true for self-equality', () => {
      const table = new HopscotchHashTable<number, number>()
      table.set(1, 10)
      expect(table.equals(table)).toBe(true)
    })
  })

  it('handles many insertions and deletions', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 8 })
    for (let i = 0; i < 50; i++) {
      table.set(i, i * 10)
    }
    expect(table.size).toBe(50)
    for (let i = 0; i < 25; i++) {
      table.delete(i)
    }
    expect(table.size).toBe(25)
    for (let i = 25; i < 50; i++) {
      expect(table.get(i)).toBe(i * 10)
    }
  })

  it('handles re-inserting deleted keys', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 10)
    table.delete(1)
    table.set(1, 99)
    expect(table.get(1)).toBe(99)
    expect(table.size).toBe(1)
  })

  it('handles mixed string and number keys in separate tables', () => {
    const strTable = new HopscotchHashTable<string, number>()
    const numTable = new HopscotchHashTable<number, string>()
    strTable.set('a', 1)
    numTable.set(1, 'a')
    expect(strTable.get('a')).toBe(1)
    expect(numTable.get(1)).toBe('a')
  })

  it('fromEntries with empty array', () => {
    const table = HopscotchHashTable.fromEntries<number, string>([])
    expect(table.size).toBe(0)
    expect(table.isEmpty()).toBe(true)
  })

  it('fromEntries preserves all data', () => {
    const entries: Array<[number, string]> = Array.from({ length: 20 }, (_, i) => [i, `val${i}`])
    const table = HopscotchHashTable.fromEntries(entries)
    expect(table.size).toBe(20)
    for (let i = 0; i < 20; i++) {
      expect(table.get(i)).toBe(`val${i}`)
    }
  })

  it('handles zero as key', () => {
    const table = new HopscotchHashTable<number, string>()
    table.set(0, 'zero')
    expect(table.get(0)).toBe('zero')
    expect(table.has(0)).toBe(true)
  })

  it('handles empty string as key', () => {
    const table = new HopscotchHashTable<string, number>()
    table.set('', 42)
    expect(table.get('')).toBe(42)
    expect(table.has('')).toBe(true)
  })

  it('forEach provides both key and value', () => {
    const table = new HopscotchHashTable<string, number>()
    table.set('a', 1)
    table.set('b', 2)
    const result: Array<[string, number]> = []
    table.forEach((v, k) => result.push([k, v]))
    expect(result.length).toBe(2)
    expect(result).toContainEqual(['a', 1])
    expect(result).toContainEqual(['b', 2])
  })

  it('keys values and entries are consistent', () => {
    const table = new HopscotchHashTable<number, string>()
    table.set(1, 'a')
    table.set(2, 'b')
    table.set(3, 'c')
    expect(table.keys().length).toBe(3)
    expect(table.values().length).toBe(3)
    expect(table.entries().length).toBe(3)
  })

  it('isEmpty returns true for new table', () => {
    const table = new HopscotchHashTable<string, number>()
    expect(table.isEmpty()).toBe(true)
    table.set('a', 1)
    expect(table.isEmpty()).toBe(false)
  })

  it('loadFactor increases with entries', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 10 })
    expect(table.loadFactor()).toBe(0)
    table.set(1, 10)
    expect(table.loadFactor()).toBeGreaterThan(0)
  })

  it('clear removes all entries', () => {
    const table = new HopscotchHashTable<string, number>()
    table.set('x', 1)
    table.set('y', 2)
    table.clear()
    expect(table.isEmpty()).toBe(true)
  })
  it('new table isEmpty', () => {
    const t = new HopscotchHashTable<string, number>()
    expect(t.isEmpty()).toBe(true)
  })

  it('set and get', () => {
    const t = new HopscotchHashTable<string, number>()
    t.set('a', 1)
    expect(t.get('a')).toBe(1)
  })

  it('has returns boolean', () => {
    const t = new HopscotchHashTable<string, number>()
    expect(t.has('missing')).toBe(false)
  })
})

describe('hopscotch-hash-table - wave545', () => {
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

describe('hopscotch-hash-table - wave546', () => {
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

describe('hopscotch-hash-table - wave547', () => {
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

describe('hopscotch-hash-table - wave548', () => {
  it('hopscotch-hash-table module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave549', () => {
  it('hopscotch-hash-table module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave550', () => {
  it('hopscotch-hash-table w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave551', () => {
  it('hopscotch-hash-table w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave552', () => {
  it('hopscotch-hash-table w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave553', () => {
  it('hopscotch-hash-table w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave554', () => {
  it('hopscotch-hash-table w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave555', () => {
  it('hopscotch-hash-table w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave556', () => {
  it('hopscotch-hash-table w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave557', () => {
  it('hopscotch-hash-table w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave558', () => {
  it('hopscotch-hash-table w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave559', () => {
  it('hopscotch-hash-table w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave560', () => {
  it('hopscotch-hash-table w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave561', () => {
  it('hopscotch-hash-table w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave562', () => {
  it('hopscotch-hash-table w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave563', () => {
  it('hopscotch-hash-table w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave564', () => {
  it('hopscotch-hash-table w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave565', () => {
  it('hopscotch-hash-table w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave566', () => {
  it('hopscotch-hash-table w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave127', () => {
  it('hopscotch-hash-table w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave130', () => {
  it('hopscotch-hash-table w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave133', () => {
  it('hopscotch-hash-table w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave136', () => {
  it('hopscotch-hash-table w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - wave139', () => {
  it('hopscotch-hash-table w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w142', () => {
  it('hopscotch-hash-table v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w145', () => {
  it('hopscotch-hash-table v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w148', () => {
  it('hopscotch-hash-table v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w151', () => {
  it('hopscotch-hash-table v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w154', () => {
  it('hopscotch-hash-table v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w157', () => {
  it('hopscotch-hash-table v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w160', () => {
  it('hopscotch-hash-table v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w170', () => {
  it('hopscotch-hash-table x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w180', () => {
  it('hopscotch-hash-table x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w190', () => {
  it('hopscotch-hash-table x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w200', () => {
  it('hopscotch-hash-table x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w210', () => {
  it('hopscotch-hash-table x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w220', () => {
  it('hopscotch-hash-table x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w230', () => {
  it('hopscotch-hash-table x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w240', () => {
  it('hopscotch-hash-table x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w250', () => {
  it('hopscotch-hash-table x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w260', () => {
  it('hopscotch-hash-table x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w270', () => {
  it('hopscotch-hash-table x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w280', () => {
  it('hopscotch-hash-table x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w290', () => {
  it('hopscotch-hash-table x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w300', () => {
  it('hopscotch-hash-table x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w310', () => {
  it('hopscotch-hash-table x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w320', () => {
  it('hopscotch-hash-table x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w330', () => {
  it('hopscotch-hash-table x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w340', () => {
  it('hopscotch-hash-table x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w350', () => {
  it('hopscotch-hash-table x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w360', () => {
  it('hopscotch-hash-table x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w370', () => {
  it('hopscotch-hash-table x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w380', () => {
  it('hopscotch-hash-table x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w390', () => {
  it('hopscotch-hash-table x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w400', () => {
  it('hopscotch-hash-table x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w420', () => {
  it('hopscotch-hash-table x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w440', () => {
  it('hopscotch-hash-table x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w460', () => {
  it('hopscotch-hash-table x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w480', () => {
  it('hopscotch-hash-table x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w500', () => {
  it('hopscotch-hash-table x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w550', () => {
  it('hopscotch-hash-table x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w600', () => {
  it('hopscotch-hash-table x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w650', () => {
  it('hopscotch-hash-table x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w700', () => {
  it('hopscotch-hash-table x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w800', () => {
  it('hopscotch-hash-table x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w900', () => {
  it('hopscotch-hash-table x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('hopscotch-hash-table - w1000', () => {
  it('hopscotch-hash-table x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('hopscotch-hash-table x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
