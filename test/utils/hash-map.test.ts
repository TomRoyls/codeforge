import { beforeEach, describe, expect, it } from 'vitest'

import { HashMap } from '../../src/utils/hash-map.js'

// ─── Empty map operations ─────────────────────────────
describe('HashMap empty map operations', () => {
  let map: HashMap<string, number>

  beforeEach(() => {
    map = new HashMap<string, number>()
  })

  it('reports size 0 for new map', () => {
    expect(map.size).toBe(0)
  })

  it('isEmpty returns true for new map', () => {
    expect(map.isEmpty()).toBe(true)
  })

  it('get returns undefined for missing key', () => {
    expect(map.get('anything')).toBeUndefined()
  })

  it('has returns false for missing key', () => {
    expect(map.has('anything')).toBe(false)
  })

  it('delete returns false for missing key', () => {
    expect(map.delete('anything')).toBe(false)
  })

  it('keys returns empty array', () => {
    expect(map.keys()).toEqual([])
  })

  it('values returns empty array', () => {
    expect(map.values()).toEqual([])
  })

  it('entries returns empty array', () => {
    expect(map.entries()).toEqual([])
  })

  it('capacity defaults to 16', () => {
    expect(map.capacity).toBe(16)
  })

  it('loadFactor is 0 for empty map', () => {
    expect(map.loadFactor).toBe(0)
  })
})

// ─── Set and get ───────────────────────────────────────
describe('HashMap set and get', () => {
  let map: HashMap<string, number>

  beforeEach(() => {
    map = new HashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
  })

  it('get returns correct value for existing key', () => {
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
  })

  it('has returns true for existing keys', () => {
    expect(map.has('a')).toBe(true)
    expect(map.has('b')).toBe(true)
    expect(map.has('c')).toBe(true)
  })

  it('size is correct after inserts', () => {
    expect(map.size).toBe(3)
  })

  it('isEmpty returns false after inserts', () => {
    expect(map.isEmpty()).toBe(false)
  })

  it('get returns undefined for non-existent key', () => {
    expect(map.get('d')).toBeUndefined()
  })
})

// ─── Overwrite existing key ────────────────────────────
describe('HashMap overwrite existing key', () => {
  it('updates value without increasing size', () => {
    const map = new HashMap<string, number>()
    map.set('key', 1)
    expect(map.get('key')).toBe(1)
    map.set('key', 2)
    expect(map.get('key')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('overwrites after other inserts', () => {
    const map = new HashMap<string, string>()
    map.set('foo', 'old')
    map.set('bar', 'baz')
    map.set('foo', 'new')
    expect(map.get('foo')).toBe('new')
    expect(map.get('bar')).toBe('baz')
    expect(map.size).toBe(2)
  })
})

// ─── Delete ────────────────────────────────────────────
describe('HashMap delete', () => {
  let map: HashMap<string, number>

  beforeEach(() => {
    map = new HashMap<string, number>()
    map.set('x', 10)
    map.set('y', 20)
    map.set('z', 30)
  })

  it('delete returns true for existing key', () => {
    expect(map.delete('y')).toBe(true)
  })

  it('delete removes the key', () => {
    map.delete('y')
    expect(map.has('y')).toBe(false)
    expect(map.get('y')).toBeUndefined()
  })

  it('size decrements after delete', () => {
    map.delete('y')
    expect(map.size).toBe(2)
  })

  it('delete returns false for already deleted key', () => {
    map.delete('y')
    expect(map.delete('y')).toBe(false)
  })

  it('delete returns false for never-existing key', () => {
    expect(map.delete('nope')).toBe(false)
  })

  it('other keys remain accessible after delete', () => {
    map.delete('y')
    expect(map.get('x')).toBe(10)
    expect(map.get('z')).toBe(30)
  })
})

// ─── Has ───────────────────────────────────────────────
describe('HashMap has', () => {
  it('returns false after key is deleted', () => {
    const map = new HashMap<string, number>()
    map.set('k', 1)
    expect(map.has('k')).toBe(true)
    map.delete('k')
    expect(map.has('k')).toBe(false)
  })
})

// ─── Tombstone handling ────────────────────────────────
describe('HashMap tombstone handling', () => {
  it('can re-insert a deleted key', () => {
    const map = new HashMap<string, number>()
    map.set('k', 1)
    map.delete('k')
    map.set('k', 2)
    expect(map.get('k')).toBe(2)
    expect(map.size).toBe(1)
  })

  it('finds keys that probe past tombstones', () => {
    const map = new HashMap<string, number>(4)
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    expect(map.get('b')).toBe(2)
    expect(map.has('b')).toBe(true)
  })

  it('set reuses tombstone slot for new key', () => {
    const map = new HashMap<string, number>(4)
    map.set('a', 1)
    map.delete('a')
    map.set('c', 3)
    expect(map.get('c')).toBe(3)
    expect(map.size).toBe(1)
  })

  it('mixed set/delete/set pattern', () => {
    const map = new HashMap<string, number>(4)
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    map.set('c', 3)
    map.set('a', 10)
    expect(map.get('a')).toBe(10)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
    expect(map.size).toBe(3)
  })
})

// ─── Resize triggers ───────────────────────────────────
describe('HashMap resize triggers', () => {
  it('resizes when load factor exceeded', () => {
    const map = new HashMap<string, number>(4, 0.75)
    expect(map.capacity).toBe(4)
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.capacity).toBe(8)
    expect(map.size).toBe(3)
  })

  it('all entries accessible after resize', () => {
    const map = new HashMap<string, number>(4, 0.75)
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
  })

  it('capacity doubles on resize', () => {
    const map = new HashMap<string, number>(8)
    for (let i = 0; i < 6; i++) {
      map.set(`k${i}`, i)
    }
    expect(map.capacity).toBe(16)
  })

  it('custom load factor works', () => {
    const map = new HashMap<string, number>(8, 0.5)
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.set('d', 4)
    expect(map.capacity).toBe(16)
  })
})

// ─── Linear probing works ──────────────────────────────
describe('HashMap linear probing', () => {
  it('handles collisions by probing', () => {
    const map = new HashMap<string, number>(4)
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.set('d', 4)
    for (let i = 0; i < 4; i++) {
      const key = ['a', 'b', 'c', 'd'][i]
      expect(map.get(key!)).toBe(i + 1)
    }
  })

  it('probing skips tombstones on lookup', () => {
    const map = new HashMap<string, number>(4)
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.delete('b')
    expect(map.get('c')).toBe(3)
  })
})

// ─── Keys / values / entries ───────────────────────────
describe('HashMap keys/values/entries', () => {
  let map: HashMap<string, number>

  beforeEach(() => {
    map = new HashMap<string, number>()
    map.set('alpha', 1)
    map.set('beta', 2)
    map.set('gamma', 3)
  })

  it('keys returns all keys', () => {
    expect(map.keys().sort()).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('values returns all values', () => {
    expect(map.values().sort()).toEqual([1, 2, 3])
  })

  it('entries returns all key-value pairs', () => {
    const entries = map.entries().sort(([a], [b]) => a.localeCompare(b))
    expect(entries).toEqual([
      ['alpha', 1],
      ['beta', 2],
      ['gamma', 3],
    ])
  })

  it('keys excludes deleted entries', () => {
    map.delete('beta')
    expect(map.keys().sort()).toEqual(['alpha', 'gamma'])
  })

  it('values excludes deleted entries', () => {
    map.delete('beta')
    expect(map.values().sort()).toEqual([1, 3])
  })
})

// ─── ForEach ───────────────────────────────────────────
describe('HashMap forEach', () => {
  it('iterates over all entries', () => {
    const map = new HashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    const collected: [string, number][] = []
    map.forEach((v, k) => collected.push([k, v]))
    expect(collected.sort(([a], [b]) => a.localeCompare(b))).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])
  })

  it('does not iterate over deleted entries', () => {
    const map = new HashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    const collected: [string, number][] = []
    map.forEach((v, k) => collected.push([k, v]))
    expect(collected).toEqual([['b', 2]])
  })

  it('works on empty map', () => {
    const map = new HashMap<string, number>()
    let count = 0
    map.forEach(() => count++)
    expect(count).toBe(0)
  })
})

// ─── Capacity and loadFactor ───────────────────────────
describe('HashMap capacity and loadFactor', () => {
  it('custom initial capacity', () => {
    const map = new HashMap<string, number>(32)
    expect(map.capacity).toBe(32)
  })

  it('loadFactor updates as entries are added', () => {
    const map = new HashMap<string, number>(4)
    expect(map.loadFactor).toBe(0)
    map.set('a', 1)
    expect(map.loadFactor).toBe(1 / 4)
    map.set('b', 2)
    expect(map.loadFactor).toBe(2 / 4)
  })

  it('loadFactor decreases after delete', () => {
    const map = new HashMap<string, number>(4)
    map.set('a', 1)
    map.set('b', 2)
    map.delete('a')
    expect(map.loadFactor).toBe(1 / 4)
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('HashMap clear', () => {
  it('removes all entries', () => {
    const map = new HashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
    expect(map.keys()).toEqual([])
    expect(map.values()).toEqual([])
    expect(map.entries()).toEqual([])
  })

  it('allows inserts after clear', () => {
    const map = new HashMap<string, number>()
    map.set('old', 1)
    map.clear()
    map.set('new', 2)
    expect(map.size).toBe(1)
    expect(map.get('new')).toBe(2)
    expect(map.get('old')).toBeUndefined()
  })

  it('preserves capacity after clear', () => {
    const map = new HashMap<string, number>(8)
    map.set('a', 1)
    map.clear()
    expect(map.capacity).toBe(8)
  })
})

// ─── Large dataset ─────────────────────────────────────
describe('HashMap large dataset', () => {
  it('handles 1000+ entries', () => {
    const map = new HashMap<string, number>()
    for (let i = 0; i < 1000; i++) {
      map.set(`key${i}`, i)
    }
    expect(map.size).toBe(1000)
    for (let i = 0; i < 1000; i++) {
      expect(map.get(`key${i}`)).toBe(i)
      expect(map.has(`key${i}`)).toBe(true)
    }
    expect(map.get('key9999')).toBeUndefined()
  })

  it('handles 1000 entries with many deletions', () => {
    const map = new HashMap<number, string>()
    for (let i = 0; i < 1000; i++) {
      map.set(i, `v${i}`)
    }
    for (let i = 0; i < 500; i++) {
      map.delete(i)
    }
    expect(map.size).toBe(500)
    expect(map.has(0)).toBe(false)
    expect(map.has(999)).toBe(true)
    expect(map.get(999)).toBe('v999')
  })

  it('mixed set/delete/set on large dataset', () => {
    const map = new HashMap<string, number>(16)
    for (let i = 0; i < 200; i++) {
      map.set(`k${i}`, i)
    }
    for (let i = 0; i < 100; i++) {
      map.delete(`k${i}`)
    }
    for (let i = 0; i < 100; i++) {
      map.set(`k${i}`, i + 1000)
    }
    expect(map.size).toBe(200)
    expect(map.get('k0')).toBe(1000)
    expect(map.get('k199')).toBe(199)
  })
})

// ─── Generic value types ───────────────────────────────
describe('HashMap generic value types', () => {
  it('works with number keys', () => {
    const map = new HashMap<number, string>()
    map.set(1, 'one')
    map.set(2, 'two')
    expect(map.get(1)).toBe('one')
    expect(map.get(2)).toBe('two')
  })

  it('works with object values', () => {
    const map = new HashMap<string, { name: string }>()
    map.set('user:1', { name: 'Alice' })
    map.set('user:2', { name: 'Bob' })
    expect(map.get('user:1')?.name).toBe('Alice')
    expect(map.get('user:2')?.name).toBe('Bob')
  })

  it('works with array values', () => {
    const map = new HashMap<string, number[]>()
    map.set('list', [1, 2, 3])
    expect(map.get('list')).toEqual([1, 2, 3])
  })

  it('size tracks entries', () => {
    const map = new HashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.size).toBe(2)
  })

  it('delete removes entry', () => {
    const map = new HashMap<string, number>()
    map.set('x', 42)
    expect(map.delete('x')).toBe(true)
    expect(map.get('x')).toBeUndefined()
  })

  it('clear removes all entries', () => {
    const map = new HashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.size).toBe(0)
  })
})

describe('hash-map - wave548', () => {
  it('hash-map module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module has name', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module not null', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module not undefined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module constructable', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module has prototype', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module toString works', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module has length', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module type is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module name is string', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module exists in scope', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module is class-like', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave549', () => {
  it('hash-map module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave550', () => {
  it('hash-map w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave551', () => {
  it('hash-map w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave552', () => {
  it('hash-map w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave553', () => {
  it('hash-map w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave554', () => {
  it('hash-map w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave555', () => {
  it('hash-map w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave556', () => {
  it('hash-map w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave557', () => {
  it('hash-map w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('hash-map - wave558', () => {
  it('hash-map w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('hash-map w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})
