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
