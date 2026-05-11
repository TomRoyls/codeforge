import { describe, it, expect } from 'vitest'
import { HashMap2 } from '../../src/core/hash-map-2/index.js'

describe('HashMap2 — Constructor', () => {
  it('creates empty map with defaults', () => {
    const m = new HashMap2()
    expect(m.size).toBe(0)
    expect(m.isEmpty).toBe(true)
  })

  it('creates map with custom initialCapacity', () => {
    const m = new HashMap2({ initialCapacity: 32 })
    expect(m.capacity).toBe(32)
  })

  it('creates map with custom loadFactor', () => {
    const m = new HashMap2<number, number>({ loadFactor: 0.5 })
    expect(m.loadFactor).toBe(0)
  })

  it('creates map with custom hash function', () => {
    const m = new HashMap2<string, number>({ hash: (k) => k.length })
    m.set('hello', 1)
    expect(m.get('hello')).toBe(1)
  })

  it('defaults initialCapacity to 16', () => {
    const m = new HashMap2()
    expect(m.capacity).toBe(16)
  })

  it('defaults loadFactor to 0.75', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 12; i++) m.set(i, i)
    expect(m.capacity).toBeGreaterThan(16)
  })
})

describe('HashMap2 — set / put', () => {
  it('sets a key-value pair', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    expect(m.get('a')).toBe(1)
  })

  it('put is alias for set', () => {
    const m = new HashMap2<string, number>()
    m.put('b', 2)
    expect(m.get('b')).toBe(2)
  })

  it('set returns this for chaining', () => {
    const m = new HashMap2<string, number>()
    const result = m.set('a', 1)
    expect(result).toBe(m)
  })

  it('put returns this for chaining', () => {
    const m = new HashMap2<string, number>()
    const result = m.put('a', 1)
    expect(result).toBe(m)
  })

  it('overwrites existing key', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    m.set('a', 2)
    expect(m.get('a')).toBe(2)
    expect(m.size).toBe(1)
  })

  it('handles multiple keys', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2).set('c', 3)
    expect(m.size).toBe(3)
    expect(m.get('a')).toBe(1)
    expect(m.get('b')).toBe(2)
    expect(m.get('c')).toBe(3)
  })

  it('handles number keys', () => {
    const m = new HashMap2<number, string>()
    m.set(1, 'one').set(2, 'two')
    expect(m.get(1)).toBe('one')
    expect(m.get(2)).toBe('two')
  })

  it('handles null key', () => {
    const m = new HashMap2<null, number>()
    m.set(null, 42)
    expect(m.get(null)).toBe(42)
  })

  it('handles undefined key', () => {
    const m = new HashMap2<undefined, number>()
    m.set(undefined, 42)
    expect(m.get(undefined)).toBe(42)
  })

  it('handles object keys by reference', () => {
    const m = new HashMap2<object, number>()
    const obj = { id: 1 }
    m.set(obj, 100)
    expect(m.get(obj)).toBe(100)
  })

  it('handles NaN key', () => {
    const m = new HashMap2<number, string>()
    m.set(NaN, 'not-a-number')
    expect(m.get(NaN)).toBe('not-a-number')
  })
})

describe('HashMap2 — get', () => {
  it('returns undefined for missing key', () => {
    const m = new HashMap2<string, number>()
    expect(m.get('missing')).toBeUndefined()
  })

  it('returns value for existing key', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 42)
    expect(m.get('a')).toBe(42)
  })

  it('returns undefined after key is overwritten and deleted', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    m.delete('a')
    expect(m.get('a')).toBeUndefined()
  })
})

describe('HashMap2 — delete', () => {
  it('deletes existing key', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    expect(m.delete('a')).toBe(true)
    expect(m.get('a')).toBeUndefined()
    expect(m.size).toBe(0)
  })

  it('returns false for missing key', () => {
    const m = new HashMap2<string, number>()
    expect(m.delete('missing')).toBe(false)
  })

  it('does not affect other entries', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2).set('c', 3)
    m.delete('b')
    expect(m.get('a')).toBe(1)
    expect(m.get('c')).toBe(3)
    expect(m.size).toBe(2)
  })

  it('allows re-insertion after delete', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    m.delete('a')
    m.set('a', 2)
    expect(m.get('a')).toBe(2)
    expect(m.size).toBe(1)
  })

  it('handles delete on empty map', () => {
    const m = new HashMap2<string, number>()
    expect(m.delete('a')).toBe(false)
  })
})

describe('HashMap2 — has', () => {
  it('returns true for existing key', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    expect(m.has('a')).toBe(true)
  })

  it('returns false for missing key', () => {
    const m = new HashMap2<string, number>()
    expect(m.has('a')).toBe(false)
  })

  it('returns false after delete', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    m.delete('a')
    expect(m.has('a')).toBe(false)
  })
})

describe('HashMap2 — size / isEmpty', () => {
  it('size is 0 on empty map', () => {
    const m = new HashMap2()
    expect(m.size).toBe(0)
  })

  it('isEmpty is true on empty map', () => {
    const m = new HashMap2()
    expect(m.isEmpty).toBe(true)
  })

  it('isEmpty is false after insert', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    expect(m.isEmpty).toBe(false)
  })

  it('size increments correctly', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 10; i++) m.set(i, i)
    expect(m.size).toBe(10)
  })

  it('size decrements after delete', () => {
    const m = new HashMap2<number, number>()
    m.set(1, 1).set(2, 2)
    m.delete(1)
    expect(m.size).toBe(1)
  })

  it('size does not change on overwrite', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    m.set('a', 2)
    expect(m.size).toBe(1)
  })
})

describe('HashMap2 — clear', () => {
  it('clears all entries', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    m.clear()
    expect(m.size).toBe(0)
    expect(m.isEmpty).toBe(true)
  })

  it('clear preserves capacity', () => {
    const m = new HashMap2<string, number>({ initialCapacity: 32 })
    m.set('a', 1)
    m.clear()
    expect(m.capacity).toBe(32)
  })

  it('map usable after clear', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    m.clear()
    m.set('b', 2)
    expect(m.get('b')).toBe(2)
    expect(m.size).toBe(1)
  })
})

describe('HashMap2 — toArray', () => {
  it('returns empty array for empty map', () => {
    const m = new HashMap2()
    expect(m.toArray()).toEqual([])
  })

  it('returns all entries', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const arr = m.toArray()
    expect(arr).toHaveLength(2)
    expect(arr).toContainEqual(['a', 1])
    expect(arr).toContainEqual(['b', 2])
  })
})

describe('HashMap2 — clone', () => {
  it('clones the map', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const c = m.clone()
    expect(c.size).toBe(2)
    expect(c.get('a')).toBe(1)
    expect(c.get('b')).toBe(2)
  })

  it('clone is independent', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    const c = m.clone()
    c.set('a', 99)
    expect(m.get('a')).toBe(1)
    expect(c.get('a')).toBe(99)
  })

  it('clone preserves capacity', () => {
    const m = new HashMap2<string, number>({ initialCapacity: 64 })
    const c = m.clone()
    expect(c.capacity).toBe(64)
  })
})

describe('HashMap2 — fromArray', () => {
  it('creates map from array', () => {
    const m = HashMap2.fromArray([['a', 1], ['b', 2]])
    expect(m.size).toBe(2)
    expect(m.get('a')).toBe(1)
    expect(m.get('b')).toBe(2)
  })

  it('creates empty map from empty array', () => {
    const m = HashMap2.fromArray([])
    expect(m.size).toBe(0)
    expect(m.isEmpty).toBe(true)
  })

  it('respects custom options', () => {
    const m = HashMap2.fromArray([['a', 1]], { initialCapacity: 64 })
    expect(m.capacity).toBe(64)
  })

  it('handles duplicate keys (last wins)', () => {
    const m = HashMap2.fromArray([['a', 1], ['a', 2]])
    expect(m.size).toBe(1)
    expect(m.get('a')).toBe(2)
  })
})

describe('HashMap2 — forEach', () => {
  it('iterates all entries', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const result: [string, number][] = []
    m.forEach((v, k) => result.push([k, v]))
    expect(result).toHaveLength(2)
    expect(result).toContainEqual(['a', 1])
    expect(result).toContainEqual(['b', 2])
  })

  it('does not call on empty map', () => {
    const m = new HashMap2()
    let called = false
    m.forEach(() => { called = true })
    expect(called).toBe(false)
  })
})

describe('HashMap2 — Symbol.iterator', () => {
  it('is iterable', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const arr = [...m]
    expect(arr).toHaveLength(2)
    expect(arr).toContainEqual(['a', 1])
    expect(arr).toContainEqual(['b', 2])
  })

  it('works with for...of', () => {
    const m = new HashMap2<number, string>()
    m.set(1, 'one').set(2, 'two')
    const keys: number[] = []
    for (const [k] of m) keys.push(k)
    expect(keys).toHaveLength(2)
  })
})

describe('HashMap2 — keys / values / entries', () => {
  it('keys returns all keys', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const k = m.keys()
    expect(k).toHaveLength(2)
    expect(k).toContain('a')
    expect(k).toContain('b')
  })

  it('values returns all values', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const v = m.values()
    expect(v).toHaveLength(2)
    expect(v).toContain(1)
    expect(v).toContain(2)
  })

  it('entries returns [K, V] pairs', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    const e = m.entries()
    expect(e).toEqual([['a', 1]])
  })

  it('keys on empty map returns []', () => {
    const m = new HashMap2()
    expect(m.keys()).toEqual([])
  })

  it('values on empty map returns []', () => {
    const m = new HashMap2()
    expect(m.values()).toEqual([])
  })
})

describe('HashMap2 — capacity / loadFactor', () => {
  it('capacity returns current capacity', () => {
    const m = new HashMap2({ initialCapacity: 16 })
    expect(m.capacity).toBe(16)
  })

  it('loadFactor returns current load factor', () => {
    const m = new HashMap2<number, number>({ initialCapacity: 16 })
    expect(m.loadFactor).toBe(0)
    m.set(1, 1)
    expect(m.loadFactor).toBeCloseTo(1 / 16)
  })

  it('capacity grows after threshold', () => {
    const m = new HashMap2<number, number>({ initialCapacity: 4, loadFactor: 0.75 })
    m.set(1, 1).set(2, 2).set(3, 3)
    expect(m.capacity).toBeGreaterThan(4)
  })
})

describe('HashMap2 — containsValue', () => {
  it('returns true for existing value', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 42)
    expect(m.containsValue(42)).toBe(true)
  })

  it('returns false for missing value', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    expect(m.containsValue(99)).toBe(false)
  })

  it('returns false on empty map', () => {
    const m = new HashMap2()
    expect(m.containsValue(1)).toBe(false)
  })

  it('handles undefined value', () => {
    const m = new HashMap2<string, undefined>()
    m.set('a', undefined)
    expect(m.containsValue(undefined)).toBe(true)
  })
})

describe('HashMap2 — keySet / valueSet', () => {
  it('keySet returns unique keys', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const ks = m.keySet()
    expect(ks).toHaveLength(2)
    expect(ks).toContain('a')
    expect(ks).toContain('b')
  })

  it('valueSet returns unique values', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2).set('c', 1)
    const vs = m.valueSet()
    expect(vs).toHaveLength(2)
    expect(vs).toContain(1)
    expect(vs).toContain(2)
  })

  it('keySet on empty returns []', () => {
    const m = new HashMap2()
    expect(m.keySet()).toEqual([])
  })

  it('valueSet on empty returns []', () => {
    const m = new HashMap2()
    expect(m.valueSet()).toEqual([])
  })
})

describe('HashMap2 — merge', () => {
  it('merges another map', () => {
    const a = new HashMap2<string, number>()
    a.set('a', 1)
    const b = new HashMap2<string, number>()
    b.set('b', 2)
    a.merge(b)
    expect(a.size).toBe(2)
    expect(a.get('a')).toBe(1)
    expect(a.get('b')).toBe(2)
  })

  it('overwrites on key conflict (other wins)', () => {
    const a = new HashMap2<string, number>()
    a.set('x', 1)
    const b = new HashMap2<string, number>()
    b.set('x', 99)
    a.merge(b)
    expect(a.get('x')).toBe(99)
  })

  it('returns this', () => {
    const a = new HashMap2<string, number>()
    const b = new HashMap2<string, number>()
    expect(a.merge(b)).toBe(a)
  })

  it('merge with empty map is no-op', () => {
    const a = new HashMap2<string, number>()
    a.set('a', 1)
    a.merge(new HashMap2())
    expect(a.size).toBe(1)
  })
})

describe('HashMap2 — filter', () => {
  it('filters entries by predicate', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 10; i++) m.set(i, i)
    const even = m.filter((v) => v % 2 === 0)
    expect(even.size).toBe(5)
    for (let i = 0; i < 10; i += 2) {
      expect(even.has(i)).toBe(true)
    }
    for (let i = 1; i < 10; i += 2) {
      expect(even.has(i)).toBe(false)
    }
  })

  it('returns new map (not same instance)', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    const f = m.filter(() => true)
    expect(f).not.toBe(m)
  })

  it('returns empty if nothing matches', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    const f = m.filter(() => false)
    expect(f.size).toBe(0)
  })

  it('predicate receives key and value', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    let receivedKey = ''
    let receivedValue = 0
    m.filter((v, k) => { receivedKey = k; receivedValue = v; return true })
    expect(receivedKey).toBe('a')
    expect(receivedValue).toBe(1)
  })
})

describe('HashMap2 — mapValues', () => {
  it('transforms values', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const doubled = m.mapValues((v) => v * 2)
    expect(doubled.get('a')).toBe(2)
    expect(doubled.get('b')).toBe(4)
  })

  it('preserves keys', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    const mapped = m.mapValues((v) => String(v))
    expect(mapped.get('a')).toBe('1')
    expect(mapped.get('b')).toBe('2')
  })

  it('returns new map', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    const mapped = m.mapValues((v) => v)
    expect(mapped).not.toBe(m)
  })

  it('transform receives key', () => {
    const m = new HashMap2<string, number>()
    m.set('x', 5)
    const mapped = m.mapValues((v, k) => v + k.length)
    expect(mapped.get('x')).toBe(6)
  })
})

describe('HashMap2 — equals', () => {
  it('equal maps', () => {
    const a = new HashMap2<string, number>()
    a.set('a', 1).set('b', 2)
    const b = new HashMap2<string, number>()
    b.set('a', 1).set('b', 2)
    expect(a.equals(b)).toBe(true)
  })

  it('not equal maps (different size)', () => {
    const a = new HashMap2<string, number>()
    a.set('a', 1)
    const b = new HashMap2<string, number>()
    b.set('a', 1).set('b', 2)
    expect(a.equals(b)).toBe(false)
  })

  it('not equal maps (different value)', () => {
    const a = new HashMap2<string, number>()
    a.set('a', 1)
    const b = new HashMap2<string, number>()
    b.set('a', 2)
    expect(a.equals(b)).toBe(false)
  })

  it('not equal maps (different key)', () => {
    const a = new HashMap2<string, number>()
    a.set('a', 1)
    const b = new HashMap2<string, number>()
    b.set('b', 1)
    expect(a.equals(b)).toBe(false)
  })

  it('empty maps are equal', () => {
    expect(new HashMap2().equals(new HashMap2())).toBe(true)
  })
})

describe('HashMap2 — resize', () => {
  it('resize to larger capacity', () => {
    const m = new HashMap2<number, number>({ initialCapacity: 4 })
    m.set(1, 1).set(2, 2)
    m.resize(64)
    expect(m.capacity).toBe(64)
    expect(m.get(1)).toBe(1)
    expect(m.get(2)).toBe(2)
  })

  it('resize preserves all entries', () => {
    const m = new HashMap2<number, number>({ initialCapacity: 4 })
    for (let i = 0; i < 3; i++) m.set(i, i * 10)
    m.resize(128)
    for (let i = 0; i < 3; i++) {
      expect(m.get(i)).toBe(i * 10)
    }
    expect(m.size).toBe(3)
  })

  it('resize adjusts if too small for current entries', () => {
    const m = new HashMap2<number, number>({ initialCapacity: 16 })
    for (let i = 0; i < 10; i++) m.set(i, i)
    m.resize(1)
    expect(m.capacity).toBeGreaterThanOrEqual(20)
  })
})

describe('HashMap2 — rehash', () => {
  it('rehash preserves entries', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2).set('c', 3)
    m.rehash()
    expect(m.size).toBe(3)
    expect(m.get('a')).toBe(1)
    expect(m.get('b')).toBe(2)
    expect(m.get('c')).toBe(3)
  })

  it('rehash on empty map is safe', () => {
    const m = new HashMap2()
    m.rehash()
    expect(m.size).toBe(0)
  })
})

describe('HashMap2 — auto-resize', () => {
  it('auto-resizes when load factor exceeded', () => {
    const m = new HashMap2<number, number>({ initialCapacity: 4, loadFactor: 0.75 })
    expect(m.capacity).toBe(4)
    m.set(1, 1).set(2, 2).set(3, 3)
    expect(m.capacity).toBeGreaterThan(4)
    expect(m.size).toBe(3)
  })

  it('all entries preserved after resize', () => {
    const m = new HashMap2<number, number>({ initialCapacity: 4, loadFactor: 0.5 })
    for (let i = 0; i < 20; i++) m.set(i, i * 2)
    for (let i = 0; i < 20; i++) {
      expect(m.get(i)).toBe(i * 2)
    }
  })

  it('handles many insertions', () => {
    const m = new HashMap2<number, number>({ initialCapacity: 8 })
    for (let i = 0; i < 1000; i++) m.set(i, i)
    expect(m.size).toBe(1000)
    for (let i = 0; i < 1000; i++) {
      expect(m.has(i)).toBe(true)
    }
  })
})

describe('HashMap2 — collision handling', () => {
  it('handles hash collisions via linear probing', () => {
    const m = new HashMap2<string, number>({
      initialCapacity: 4,
      hash: () => 0,
    })
    m.set('a', 1).set('b', 2).set('c', 3)
    expect(m.size).toBe(3)
    expect(m.get('a')).toBe(1)
    expect(m.get('b')).toBe(2)
    expect(m.get('c')).toBe(3)
  })

  it('handles delete in probe chain', () => {
    const m = new HashMap2<string, number>({
      initialCapacity: 16,
      hash: () => 5,
    })
    m.set('a', 1).set('b', 2).set('c', 3)
    m.delete('b')
    expect(m.get('a')).toBe(1)
    expect(m.get('c')).toBe(3)
    expect(m.has('b')).toBe(false)
  })

  it('re-insert after delete in probe chain', () => {
    const m = new HashMap2<string, number>({
      initialCapacity: 16,
      hash: () => 5,
    })
    m.set('a', 1).set('b', 2)
    m.delete('a')
    m.set('a', 10)
    expect(m.get('a')).toBe(10)
    expect(m.get('b')).toBe(2)
  })
})

describe('HashMap2 — edge cases', () => {
  it('handles boolean keys', () => {
    const m = new HashMap2<boolean, string>()
    m.set(true, 'yes').set(false, 'no')
    expect(m.get(true)).toBe('yes')
    expect(m.get(false)).toBe('no')
  })

  it('handles zero key', () => {
    const m = new HashMap2<number, string>()
    m.set(0, 'zero')
    expect(m.get(0)).toBe('zero')
  })

  it('handles empty string key', () => {
    const m = new HashMap2<string, number>()
    m.set('', 42)
    expect(m.get('')).toBe(42)
  })

  it('handles negative number keys', () => {
    const m = new HashMap2<number, string>()
    m.set(-1, 'neg')
    expect(m.get(-1)).toBe('neg')
  })

  it('handles large number of deletes and inserts', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 100; i++) m.set(i, i)
    for (let i = 0; i < 100; i++) m.delete(i)
    expect(m.size).toBe(0)
    expect(m.isEmpty).toBe(true)
    m.set(1, 1)
    expect(m.get(1)).toBe(1)
  })

  it('handles mixed types of keys', () => {
    const m1 = new HashMap2<string, number>()
    m1.set('1', 1)
    const m2 = new HashMap2<number, number>()
    m2.set(1, 1)
    expect(m1.get('1')).toBe(1)
    expect(m2.get(1)).toBe(1)
  })

  it('set/delete/set cycle preserves correctness', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    m.delete('a')
    m.set('a', 2)
    m.delete('a')
    m.set('a', 3)
    expect(m.get('a')).toBe(3)
    expect(m.size).toBe(1)
  })

  it('clone after many operations', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 50; i++) m.set(i, i * 2)
    for (let i = 0; i < 25; i++) m.delete(i)
    const c = m.clone()
    expect(c.size).toBe(m.size)
    for (let i = 25; i < 50; i++) {
      expect(c.get(i)).toBe(i * 2)
    }
  })
})

describe('HashMap2 — stress test', () => {
  it('handles 10000 insertions', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 10000; i++) m.set(i, i)
    expect(m.size).toBe(10000)
    for (let i = 0; i < 10000; i++) {
      expect(m.get(i)).toBe(i)
    }
  })

  it('handles 10000 insertions then deletions', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 10000; i++) m.set(i, i)
    for (let i = 0; i < 10000; i++) m.delete(i)
    expect(m.size).toBe(0)
  })

  it('handles 10000 mixed operations', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 5000; i++) m.set(i, i)
    for (let i = 0; i < 2500; i++) m.delete(i)
    for (let i = 5000; i < 7500; i++) m.set(i, i)
    expect(m.size).toBe(5000)
  })
})

describe('HashMap2 — type safety', () => {
  it('works with complex value types', () => {
    const m = new HashMap2<string, { name: string; age: number }>()
    m.set('a', { name: 'Alice', age: 30 })
    expect(m.get('a')!.name).toBe('Alice')
    expect(m.get('a')!.age).toBe(30)
  })

  it('works with array values', () => {
    const m = new HashMap2<string, number[]>()
    m.set('a', [1, 2, 3])
    expect(m.get('a')).toEqual([1, 2, 3])
  })

  it('mapValues changes value type', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1)
    const mapped = m.mapValues((v) => ({ doubled: v * 2 }))
    expect(mapped.get('a')!.doubled).toBe(2)
  })
})

describe('HashMap2 — more edge cases', () => {
  it('get on empty map returns undefined', () => {
    const m = new HashMap2<string, number>()
    expect(m.get('anything')).toBeUndefined()
  })

  it('has on empty map returns false', () => {
    const m = new HashMap2<string, number>()
    expect(m.has('anything')).toBe(false)
  })

  it('delete then set same key multiple times', () => {
    const m = new HashMap2<string, number>()
    for (let i = 0; i < 5; i++) {
      m.set('x', i)
      expect(m.get('x')).toBe(i)
      m.delete('x')
      expect(m.get('x')).toBeUndefined()
    }
    expect(m.size).toBe(0)
  })

  it('toArray after clear is empty', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    m.clear()
    expect(m.toArray()).toEqual([])
  })

  it('equals after clone is true', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2).set('c', 3)
    expect(m.equals(m.clone())).toBe(true)
  })

  it('filter on empty map returns empty', () => {
    const m = new HashMap2<string, number>()
    expect(m.filter(() => true).size).toBe(0)
  })

  it('mapValues on empty map returns empty', () => {
    const m = new HashMap2<string, number>()
    expect(m.mapValues((v) => v).size).toBe(0)
  })

  it('keys after delete are correct', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2).set('c', 3)
    m.delete('b')
    const k = m.keys()
    expect(k).toHaveLength(2)
    expect(k).toContain('a')
    expect(k).toContain('c')
    expect(k).not.toContain('b')
  })

  it('values after delete are correct', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    m.delete('a')
    expect(m.values()).toEqual([2])
  })

  it('fromArray with many entries', () => {
    const entries: [number, string][] = []
    for (let i = 0; i < 100; i++) entries.push([i, `val-${i}`])
    const m = HashMap2.fromArray(entries)
    expect(m.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(m.get(i)).toBe(`val-${i}`)
    }
  })

  it('merge preserves original entries', () => {
    const a = new HashMap2<string, number>()
    a.set('a', 1)
    const b = new HashMap2<string, number>()
    b.set('b', 2).set('c', 3)
    a.merge(b)
    expect(a.size).toBe(3)
    expect(a.get('a')).toBe(1)
  })

  it('chained set operations', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2).set('c', 3)
    m.delete('b')
    expect(m.size).toBe(2)
    expect(m.get('a')).toBe(1)
    expect(m.get('c')).toBe(3)
  })

  it('entries method matches toArray', () => {
    const m = new HashMap2<string, number>()
    m.set('a', 1).set('b', 2)
    expect(m.entries()).toEqual(m.toArray())
  })

  it('iterator and toArray produce same count', () => {
    const m = new HashMap2<number, number>()
    for (let i = 0; i < 50; i++) m.set(i, i)
    expect([...m]).toHaveLength(m.toArray().length)
  })
})
