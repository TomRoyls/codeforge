import { describe, it, expect } from 'vitest'
import { LinearProbeHashTable } from '../../src/core/linear-probe-hash/linear-probe-hash.js'

describe('LinearProbeHashTable - Constructor', () => {
  it('creates with default capacity 16', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.capacity()).toBe(16)
  })

  it('creates with custom capacity', () => {
    const ht = new LinearProbeHashTable(32)
    expect(ht.capacity()).toBe(32)
  })

  it('creates with capacity 1', () => {
    const ht = new LinearProbeHashTable(1)
    expect(ht.capacity()).toBe(1)
  })

  it('throws on capacity 0', () => {
    expect(() => new LinearProbeHashTable(0)).toThrow(RangeError)
  })

  it('throws on negative capacity', () => {
    expect(() => new LinearProbeHashTable(-5)).toThrow(RangeError)
  })

  it('new table is empty', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.isEmpty()).toBe(true)
    expect(ht.size()).toBe(0)
  })
})

describe('LinearProbeHashTable - set/get', () => {
  it('sets and gets a value', () => {
    const ht = new LinearProbeHashTable()
    ht.set('name', 'Alice')
    expect(ht.get('name')).toBe('Alice')
  })

  it('returns undefined for missing key', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.get('missing')).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const ht = new LinearProbeHashTable()
    ht.set('key', 1)
    ht.set('key', 2)
    expect(ht.get('key')).toBe(2)
    expect(ht.size()).toBe(1)
  })

  it('handles number keys', () => {
    const ht = new LinearProbeHashTable()
    ht.set(42, 'answer')
    expect(ht.get(42)).toBe('answer')
  })

  it('handles boolean keys', () => {
    const ht = new LinearProbeHashTable()
    ht.set(true, 'yes')
    ht.set(false, 'no')
    expect(ht.get(true)).toBe('yes')
    expect(ht.get(false)).toBe('no')
  })

  it('handles null key', () => {
    const ht = new LinearProbeHashTable()
    ht.set(null, 'null-val')
    expect(ht.get(null)).toBe('null-val')
  })

  it('handles undefined key', () => {
    const ht = new LinearProbeHashTable()
    ht.set(undefined, 'undef-val')
    expect(ht.get(undefined)).toBe('undef-val')
  })

  it('handles object keys by stringification', () => {
    const ht = new LinearProbeHashTable()
    const obj = { x: 1 }
    ht.set(obj, 'obj-val')
    expect(ht.get(obj)).toBe('obj-val')
  })

  it('handles array keys by stringification', () => {
    const ht = new LinearProbeHashTable()
    const arr = [1, 2, 3]
    ht.set(arr, 'arr-val')
    expect(ht.get(arr)).toBe('arr-val')
  })

  it('sets multiple keys', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(ht.size()).toBe(3)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
    expect(ht.get('c')).toBe(3)
  })

  it('sets value to undefined explicitly', () => {
    const ht = new LinearProbeHashTable()
    ht.set('key', undefined)
    expect(ht.has('key')).toBe(true)
    expect(ht.get('key')).toBeUndefined()
  })

  it('sets value to null explicitly', () => {
    const ht = new LinearProbeHashTable()
    ht.set('key', null)
    expect(ht.has('key')).toBe(true)
    expect(ht.get('key')).toBeNull()
  })
})

describe('LinearProbeHashTable - has', () => {
  it('returns true for existing key', () => {
    const ht = new LinearProbeHashTable()
    ht.set('x', 1)
    expect(ht.has('x')).toBe(true)
  })

  it('returns false for missing key', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.has('x')).toBe(false)
  })

  it('returns false after delete', () => {
    const ht = new LinearProbeHashTable()
    ht.set('x', 1)
    ht.delete('x')
    expect(ht.has('x')).toBe(false)
  })

  it('returns true for re-inserted key after delete', () => {
    const ht = new LinearProbeHashTable()
    ht.set('x', 1)
    ht.delete('x')
    ht.set('x', 2)
    expect(ht.has('x')).toBe(true)
  })
})

describe('LinearProbeHashTable - delete', () => {
  it('deletes existing key and returns true', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    expect(ht.delete('a')).toBe(true)
    expect(ht.get('a')).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.delete('missing')).toBe(false)
  })

  it('decrements size on delete', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.size()).toBe(2)
    ht.delete('a')
    expect(ht.size()).toBe(1)
  })

  it('delete does not affect other keys', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.delete('b')
    expect(ht.get('a')).toBe(1)
    expect(ht.get('c')).toBe(3)
  })

  it('double delete returns false', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    expect(ht.delete('a')).toBe(true)
    expect(ht.delete('a')).toBe(false)
  })

  it('can delete all entries', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    ht.delete('b')
    expect(ht.isEmpty()).toBe(true)
    expect(ht.size()).toBe(0)
  })
})

describe('LinearProbeHashTable - tombstone handling', () => {
  it('reinsert after delete works correctly', () => {
    const ht = new LinearProbeHashTable(4)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    ht.set('a', 3)
    expect(ht.get('a')).toBe(3)
    expect(ht.size()).toBe(2)
  })

  it('finds key after tombstone in probe sequence', () => {
    const ht = new LinearProbeHashTable(4)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.delete('b')
    expect(ht.get('c')).toBe(3)
  })

  it('tombstones do not inflate size', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.delete('b')
    ht.delete('c')
    expect(ht.size()).toBe(1)
  })

  it('can iterate correctly with tombstones present', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.delete('b')
    const keys = ht.keys()
    expect(keys).toHaveLength(2)
    expect(keys).toContain('a')
    expect(keys).toContain('c')
  })

  it('set reuses tombstone slot', () => {
    const ht = new LinearProbeHashTable(4)
    ht.set('a', 1)
    ht.delete('a')
    ht.set('d', 4)
    expect(ht.get('d')).toBe(4)
    expect(ht.size()).toBe(1)
  })

  it('delete then reinsert preserves correct value', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('x', 10)
    ht.delete('x')
    ht.set('x', 20)
    expect(ht.get('x')).toBe(20)
    expect(ht.size()).toBe(1)
  })
})

describe('LinearProbeHashTable - size/isEmpty/clear', () => {
  it('size returns 0 on empty table', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.size()).toBe(0)
  })

  it('size returns correct count', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.size()).toBe(2)
  })

  it('isEmpty returns true when empty', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.isEmpty()).toBe(true)
  })

  it('isEmpty returns false when not empty', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    expect(ht.isEmpty()).toBe(false)
  })

  it('clear empties the table', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.clear()
    expect(ht.isEmpty()).toBe(true)
    expect(ht.size()).toBe(0)
  })

  it('clear preserves capacity', () => {
    const ht = new LinearProbeHashTable(32)
    ht.set('a', 1)
    ht.clear()
    expect(ht.capacity()).toBe(32)
  })

  it('table works after clear', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.clear()
    ht.set('b', 2)
    expect(ht.get('b')).toBe(2)
    expect(ht.size()).toBe(1)
  })
})

describe('LinearProbeHashTable - capacity/loadFactor', () => {
  it('capacity returns initial capacity', () => {
    const ht = new LinearProbeHashTable(64)
    expect(ht.capacity()).toBe(64)
  })

  it('loadFactor is 0 on empty table', () => {
    const ht = new LinearProbeHashTable(16)
    expect(ht.loadFactor()).toBe(0)
  })

  it('loadFactor increases with inserts', () => {
    const ht = new LinearProbeHashTable(10)
    ht.set('a', 1)
    expect(ht.loadFactor()).toBeCloseTo(0.1)
    ht.set('b', 2)
    expect(ht.loadFactor()).toBeCloseTo(0.2)
  })

  it('loadFactor decreases with deletes', () => {
    const ht = new LinearProbeHashTable(10)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    expect(ht.loadFactor()).toBeCloseTo(0.1)
  })
})

describe('LinearProbeHashTable - keys/values/entries', () => {
  it('keys returns all keys', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    const keys = ht.keys()
    expect(keys).toHaveLength(3)
    expect(keys.sort()).toEqual(['a', 'b', 'c'])
  })

  it('values returns all values', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    const vals = ht.values()
    expect(vals).toHaveLength(2)
    expect(vals.sort()).toEqual([1, 2])
  })

  it('entries returns all key-value pairs', () => {
    const ht = new LinearProbeHashTable()
    ht.set('x', 10)
    ht.set('y', 20)
    const ents = ht.entries()
    expect(ents).toHaveLength(2)
    const map = new Map(ents)
    expect(map.get('x')).toBe(10)
    expect(map.get('y')).toBe(20)
  })

  it('keys returns empty array on empty table', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.keys()).toEqual([])
  })

  it('values returns empty array on empty table', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.values()).toEqual([])
  })

  it('entries returns empty array on empty table', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.entries()).toEqual([])
  })

  it('keys excludes deleted entries', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    expect(ht.keys()).toEqual(['b'])
  })

  it('values excludes deleted entries', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    expect(ht.values()).toEqual([2])
  })
})

describe('LinearProbeHashTable - forEach', () => {
  it('iterates over all entries', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    const collected: Array<[string, number]> = []
    ht.forEach((k, v) => collected.push([k, v]))
    expect(collected).toHaveLength(3)
    const map = new Map(collected)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBe(3)
  })

  it('does not iterate deleted entries', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    const collected: string[] = []
    ht.forEach((k) => collected.push(k))
    expect(collected).toEqual(['b'])
  })

  it('does not call callback on empty table', () => {
    const ht = new LinearProbeHashTable()
    let called = false
    ht.forEach(() => { called = true })
    expect(called).toBe(false)
  })
})

describe('LinearProbeHashTable - rehash', () => {
  it('rehash to larger capacity', () => {
    const ht = new LinearProbeHashTable(4)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.rehash(16)
    expect(ht.capacity()).toBe(16)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
  })

  it('rehash to same capacity preserves data', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.rehash()
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
  })

  it('rehash throws on capacity too small', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(() => ht.rehash(2)).toThrow(RangeError)
  })

  it('rehash throws on capacity less than 1', () => {
    const ht = new LinearProbeHashTable()
    expect(() => ht.rehash(0)).toThrow(RangeError)
  })

  it('rehash cleans up tombstones', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.delete('b')
    ht.rehash(16)
    expect(ht.size()).toBe(2)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('c')).toBe(3)
    expect(ht.get('b')).toBeUndefined()
  })
})

describe('LinearProbeHashTable - clone', () => {
  it('clones all entries', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    const cl = ht.clone()
    expect(cl.get('a')).toBe(1)
    expect(cl.get('b')).toBe(2)
    expect(cl.size()).toBe(2)
  })

  it('clone is independent from original', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    const cl = ht.clone()
    cl.set('a', 99)
    expect(ht.get('a')).toBe(1)
    expect(cl.get('a')).toBe(99)
  })

  it('clone preserves capacity', () => {
    const ht = new LinearProbeHashTable(32)
    const cl = ht.clone()
    expect(cl.capacity()).toBe(32)
  })

  it('clone of empty table works', () => {
    const ht = new LinearProbeHashTable()
    const cl = ht.clone()
    expect(cl.isEmpty()).toBe(true)
    expect(cl.size()).toBe(0)
  })

  it('clone delete does not affect original', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    const cl = ht.clone()
    cl.delete('a')
    expect(ht.has('a')).toBe(true)
    expect(cl.has('a')).toBe(false)
  })
})

describe('LinearProbeHashTable - toString', () => {
  it('empty table returns empty braces', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.toString()).toBe('{}')
  })

  it('single entry', () => {
    const ht = new LinearProbeHashTable()
    ht.set('name', 'Alice')
    expect(ht.toString()).toBe('{name => Alice}')
  })

  it('multiple entries', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    const str = ht.toString()
    expect(str).toContain('a => 1')
    expect(str).toContain('b => 2')
  })

  it('excludes deleted entries', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    const str = ht.toString()
    expect(str).not.toContain('a => 1')
    expect(str).toContain('b => 2')
  })
})

describe('LinearProbeHashTable - containsValue', () => {
  it('finds existing value', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.containsValue(1)).toBe(true)
    expect(ht.containsValue(2)).toBe(true)
  })

  it('returns false for missing value', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    expect(ht.containsValue(99)).toBe(false)
  })

  it('returns false on empty table', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.containsValue(1)).toBe(false)
  })

  it('uses custom comparator', () => {
    const ht = new LinearProbeHashTable<string, { name: string }>()
    ht.set('a', { name: 'Alice' })
    ht.set('b', { name: 'Bob' })
    const found = ht.containsValue(
      { name: 'Alice' },
      (a, b) => a.name === b.name
    )
    expect(found).toBe(true)
  })

  it('custom comparator returns false correctly', () => {
    const ht = new LinearProbeHashTable<string, number[]>()
    ht.set('a', [1, 2])
    const found = ht.containsValue(
      [3, 4],
      (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
    )
    expect(found).toBe(false)
  })

  it('does not find deleted values', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.delete('a')
    expect(ht.containsValue(1)).toBe(false)
  })
})

describe('LinearProbeHashTable - probeCount', () => {
  it('returns 1 for direct hit in empty table', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    expect(ht.probeCount('a')).toBeGreaterThanOrEqual(1)
  })

  it('probe count for missing key', () => {
    const ht = new LinearProbeHashTable()
    expect(ht.probeCount('missing')).toBeGreaterThanOrEqual(1)
  })

  it('probe count increases with collisions', () => {
    const ht = new LinearProbeHashTable(4)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    const totalProbes = ht.probeCount('a') + ht.probeCount('b') + ht.probeCount('c')
    expect(totalProbes).toBeGreaterThanOrEqual(3)
  })

  it('probe count is positive', () => {
    const ht = new LinearProbeHashTable()
    ht.set('x', 1)
    expect(ht.probeCount('x')).toBeGreaterThan(0)
  })

  it('probe count after delete', () => {
    const ht = new LinearProbeHashTable(4)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.delete('a')
    expect(ht.probeCount('b')).toBeGreaterThanOrEqual(1)
  })
})

describe('LinearProbeHashTable - auto-resize', () => {
  it('auto-resizes when load factor exceeds 0.7', () => {
    const ht = new LinearProbeHashTable(4)
    ht.set('a', 1)
    ht.set('b', 2)
    expect(ht.capacity()).toBe(4)
    ht.set('c', 3)
    expect(ht.capacity()).toBeGreaterThan(4)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
    expect(ht.get('c')).toBe(3)
  })

  it('all data preserved after resize', () => {
    const ht = new LinearProbeHashTable(4)
    const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    keys.forEach((k, i) => ht.set(k, i))
    keys.forEach((k, i) => expect(ht.get(k)).toBe(i))
  })
})

describe('LinearProbeHashTable - 1000+ inserts', () => {
  it('handles 1000 inserts', () => {
    const ht = new LinearProbeHashTable(64)
    for (let i = 0; i < 1000; i++) {
      ht.set(`key${i}`, i)
    }
    expect(ht.size()).toBe(1000)
    for (let i = 0; i < 1000; i++) {
      expect(ht.get(`key${i}`)).toBe(i)
    }
  })

  it('handles 1000 inserts with deletions', () => {
    const ht = new LinearProbeHashTable(64)
    for (let i = 0; i < 1000; i++) {
      ht.set(`key${i}`, i)
    }
    for (let i = 0; i < 500; i++) {
      ht.delete(`key${i}`)
    }
    expect(ht.size()).toBe(500)
    for (let i = 0; i < 500; i++) {
      expect(ht.has(`key${i}`)).toBe(false)
    }
    for (let i = 500; i < 1000; i++) {
      expect(ht.get(`key${i}`)).toBe(i)
    }
  })

  it('delete then reinsert 500 keys', () => {
    const ht = new LinearProbeHashTable(64)
    for (let i = 0; i < 500; i++) {
      ht.set(`k${i}`, i)
    }
    for (let i = 0; i < 250; i++) {
      ht.delete(`k${i}`)
    }
    for (let i = 0; i < 250; i++) {
      ht.set(`k${i}`, i * 10)
    }
    expect(ht.size()).toBe(500)
    for (let i = 0; i < 250; i++) {
      expect(ht.get(`k${i}`)).toBe(i * 10)
    }
    for (let i = 250; i < 500; i++) {
      expect(ht.get(`k${i}`)).toBe(i)
    }
  })
})

describe('LinearProbeHashTable - edge cases', () => {
  it('empty string key', () => {
    const ht = new LinearProbeHashTable()
    ht.set('', 'empty')
    expect(ht.get('')).toBe('empty')
  })

  it('string "0" vs number 0 key', () => {
    const ht = new LinearProbeHashTable()
    ht.set('0', 'str-zero')
    ht.set(0, 'num-zero')
    expect(ht.get('0')).toBe('str-zero')
    expect(ht.get(0)).toBe('num-zero')
  })

  it('string "false" vs boolean false key', () => {
    const ht = new LinearProbeHashTable()
    ht.set('false', 'str-false')
    ht.set(false, 'bool-false')
    expect(ht.get('false')).toBe('str-false')
    expect(ht.get(false)).toBe('bool-false')
  })

  it('single capacity table', () => {
    const ht = new LinearProbeHashTable(1)
    ht.set('a', 1)
    expect(ht.get('a')).toBe(1)
    ht.set('a', 2)
    expect(ht.get('a')).toBe(2)
  })

  it('single capacity table delete and reinsert', () => {
    const ht = new LinearProbeHashTable(1)
    ht.set('a', 1)
    ht.delete('a')
    expect(ht.isEmpty()).toBe(true)
    ht.set('b', 2)
    expect(ht.get('b')).toBe(2)
  })

  it('set and delete same key repeatedly', () => {
    const ht = new LinearProbeHashTable()
    for (let i = 0; i < 10; i++) {
      ht.set('x', i)
      expect(ht.get('x')).toBe(i)
      ht.delete('x')
      expect(ht.has('x')).toBe(false)
    }
  })

  it('keys/values/entries consistency', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(ht.keys().length).toBe(ht.values().length)
    expect(ht.keys().length).toBe(ht.entries().length)
    expect(ht.keys().length).toBe(ht.size())
  })

  it('load factor after operations', () => {
    const ht = new LinearProbeHashTable(10)
    for (let i = 0; i < 7; i++) {
      ht.set(`k${i}`, i)
    }
    expect(ht.loadFactor()).toBe(0.7)
  })

  it('large number of keys collected correctly', () => {
    const ht = new LinearProbeHashTable(16)
    const added: string[] = []
    for (let i = 0; i < 100; i++) {
      ht.set(`key-${i}`, i)
      added.push(`key-${i}`)
    }
    const keys = ht.keys()
    expect(keys.length).toBe(100)
    for (const k of added) {
      expect(keys).toContain(k)
    }
  })

  it('handles symbol-like string keys', () => {
    const ht = new LinearProbeHashTable()
    ht.set('@@iterator', 1)
    ht.set('@@toStringTag', 2)
    expect(ht.get('@@iterator')).toBe(1)
    expect(ht.get('@@toStringTag')).toBe(2)
  })

  it('handles very long string keys', () => {
    const ht = new LinearProbeHashTable()
    const longKey = 'x'.repeat(10000)
    ht.set(longKey, 'val')
    expect(ht.get(longKey)).toBe('val')
  })

  it('clone after multiple deletes', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    ht.delete('a')
    ht.delete('c')
    const cl = ht.clone()
    expect(cl.size()).toBe(1)
    expect(cl.get('b')).toBe(2)
  })

  it('rehash with exact capacity for elements', () => {
    const ht = new LinearProbeHashTable(4)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.rehash(2)
    expect(ht.capacity()).toBe(2)
    expect(ht.get('a')).toBe(1)
    expect(ht.get('b')).toBe(2)
  })

  it('forEach mutation safety', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 1)
    ht.set('b', 2)
    const results: number[] = []
    ht.forEach((_k, v) => results.push(v))
    expect(results.sort()).toEqual([1, 2])
  })

  it('clear then fill again', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.clear()
    ht.set('c', 3)
    expect(ht.size()).toBe(1)
    expect(ht.get('c')).toBe(3)
    expect(ht.get('a')).toBeUndefined()
  })

  it('containsValue with zero value', () => {
    const ht = new LinearProbeHashTable()
    ht.set('a', 0)
    expect(ht.containsValue(0)).toBe(true)
    expect(ht.containsValue(false)).toBe(false)
  })

  it('entries match manual iteration', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('x', 10)
    ht.set('y', 20)
    const fromEntries = ht.entries()
    const fromManual: Array<[string, number]> = []
    ht.forEach((k, v) => fromManual.push([k, v]))
    expect(fromEntries.length).toBe(fromManual.length)
  })

  it('size tracks correctly through mixed ops', () => {
    const ht = new LinearProbeHashTable(8)
    ht.set('a', 1)
    ht.set('b', 2)
    ht.set('c', 3)
    expect(ht.size()).toBe(3)
    ht.delete('b')
    expect(ht.size()).toBe(2)
    ht.set('d', 4)
    expect(ht.size()).toBe(3)
    ht.set('a', 10)
    expect(ht.size()).toBe(3)
    ht.delete('a')
    ht.delete('c')
    ht.delete('d')
    expect(ht.size()).toBe(0)
  })
})
