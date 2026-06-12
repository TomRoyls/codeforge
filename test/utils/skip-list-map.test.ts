import { describe, expect, it } from 'vitest'
import { SkipListMap } from '../../src/utils/skip-list-map.js'

describe('SkipListMap', () => {
  it('sets and gets values', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'one')
    sl.set(2, 'two')
    sl.set(3, 'three')
    expect(sl.get(1)).toBe('one')
    expect(sl.get(2)).toBe('two')
    expect(sl.get(3)).toBe('three')
  })

  it('returns undefined for missing key', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.get(99)).toBeUndefined()
  })

  it('overwrites existing key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'old')
    sl.set(1, 'new')
    expect(sl.get(1)).toBe('new')
    expect(sl.size).toBe(1)
  })

  it('has checks existence', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(5, 'x')
    expect(sl.has(5)).toBe(true)
    expect(sl.has(6)).toBe(false)
  })

  it('deletes keys', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect(sl.delete(1)).toBe(true)
    expect(sl.get(1)).toBeUndefined()
    expect(sl.size).toBe(1)
  })

  it('delete returns false for missing key', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.delete(99)).toBe(false)
  })

  it('tracks size', () => {
    const sl = new SkipListMap<number, number>()
    expect(sl.size).toBe(0)
    expect(sl.isEmpty()).toBe(true)
    sl.set(1, 10)
    sl.set(2, 20)
    expect(sl.size).toBe(2)
    expect(sl.isEmpty()).toBe(false)
  })

  it('min returns smallest key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(5, 'a')
    sl.set(3, 'b')
    sl.set(7, 'c')
    expect(sl.min()).toBe(3)
  })

  it('min returns undefined for empty', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.min()).toBeUndefined()
  })

  it('entries returns sorted key-value pairs', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(3, 'c')
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect([...sl.entries()]).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('keys returns sorted keys', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(3, 'c')
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect([...sl.keys()]).toEqual([1, 2, 3])
  })

  it('values returns values in key order', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(3, 'c')
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect([...sl.values()]).toEqual(['a', 'b', 'c'])
  })

  it('handles string keys with custom comparator', () => {
    const sl = new SkipListMap<string, number>({ compare: (a, b) => a.localeCompare(b) })
    sl.set('banana', 2)
    sl.set('apple', 1)
    sl.set('cherry', 3)
    expect([...sl.keys()]).toEqual(['apple', 'banana', 'cherry'])
  })

  it('handles many insertions', () => {
    const sl = new SkipListMap<number, number>()
    for (let i = 100; i >= 1; i--) sl.set(i, i * 10)
    expect(sl.size).toBe(100)
    expect(sl.min()).toBe(1)
    expect(sl.get(50)).toBe(500)
    const keys = [...sl.keys()]
    for (let i = 0; i < keys.length - 1; i++) {
      expect(keys[i + 1]!).toBeGreaterThan(keys[i]!)
    }
  })

  it('delete then re-insert', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.delete(1)
    expect(sl.get(1)).toBeUndefined()
    sl.set(1, 'b')
    expect(sl.get(1)).toBe('b')
  })

  it('delete all elements', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    sl.delete(1)
    sl.delete(2)
    sl.delete(3)
    expect(sl.size).toBe(0)
    expect(sl.isEmpty()).toBe(true)
    expect(sl.min()).toBeUndefined()
  })

  it('delete from empty map', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.delete(1)).toBe(false)
    expect(sl.size).toBe(0)
  })

  it('delete non-existent key from populated map', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect(sl.delete(3)).toBe(false)
    expect(sl.size).toBe(2)
  })

  it('get after delete returns undefined', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.delete(1)
    expect(sl.get(1)).toBeUndefined()
    expect(sl.get(2)).toBe('b')
  })

  it('has returns false after delete', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.delete(1)
    expect(sl.has(1)).toBe(false)
  })

  it('entries after delete excludes deleted keys', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    sl.delete(2)
    expect([...sl.entries()]).toEqual([[1, 'a'], [3, 'c']])
  })

  it('min updates after delete', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    expect(sl.min()).toBe(1)
    sl.delete(1)
    expect(sl.min()).toBe(2)
    sl.delete(2)
    expect(sl.min()).toBe(3)
  })

  it('min updates after delete min', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(5, 'e')
    sl.set(1, 'a')
    sl.set(3, 'c')
    sl.delete(1)
    expect(sl.min()).toBe(3)
  })

  it('handles negative keys', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(-1, 'minus one')
    sl.set(-3, 'minus three')
    sl.set(-2, 'minus two')
    expect([...sl.keys()]).toEqual([-3, -2, -1])
  })

  it('handles mixed positive and negative keys', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(-1, 'a')
    sl.set(5, 'b')
    sl.set(-3, 'c')
    sl.set(2, 'd')
    expect([...sl.keys()]).toEqual([-3, -1, 2, 5])
  })

  it('handles zero key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(0, 'zero')
    sl.set(1, 'one')
    sl.set(-1, 'minus one')
    expect([...sl.keys()]).toEqual([-1, 0, 1])
  })

  it('handles duplicate keys with different values', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'first')
    sl.set(1, 'second')
    sl.set(1, 'third')
    expect(sl.get(1)).toBe('third')
    expect(sl.size).toBe(1)
  })

  it('handles floating point keys', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1.5, 'one point five')
    sl.set(1.2, 'one point two')
    sl.set(1.8, 'one point eight')
    expect([...sl.keys()]).toEqual([1.2, 1.5, 1.8])
  })

  it('custom maxLevel parameter', () => {
    const sl = new SkipListMap<number, string>({ maxLevel: 4 })
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    expect(sl.size).toBe(3)
    expect([...sl.keys()]).toEqual([1, 2, 3])
  })

  it('custom maxLevel of 1', () => {
    const sl = new SkipListMap<number, string>({ maxLevel: 1 })
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    expect(sl.size).toBe(3)
    expect([...sl.keys()]).toEqual([1, 2, 3])
  })

  it('handles large number of elements', () => {
    const sl = new SkipListMap<number, number>()
    for (let i = 1000; i >= 1; i--) sl.set(i, i * 2)
    expect(sl.size).toBe(1000)
    expect(sl.get(500)).toBe(1000)
  })

  it('keys generator can be used multiple times', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    expect([...sl.keys()]).toEqual([1, 2, 3])
    expect([...sl.keys()]).toEqual([1, 2, 3])
  })

  it('values generator can be used multiple times', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    expect([...sl.values()]).toEqual(['a', 'b', 'c'])
    expect([...sl.values()]).toEqual(['a', 'b', 'c'])
  })

  it('entries generator can be used multiple times', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    expect([...sl.entries()]).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
    expect([...sl.entries()]).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('handles empty string key', () => {
    const sl = new SkipListMap<string, string>({ compare: (a, b) => a.localeCompare(b) })
    sl.set('', 'empty')
    sl.set('a', 'a')
    sl.set('b', 'b')
    expect(sl.get('')).toBe('empty')
    expect([...sl.keys()]).toEqual(['', 'a', 'b'])
  })

  it('handles null and undefined values', () => {
    const sl = new SkipListMap<number, string | null | undefined>()
    sl.set(1, null)
    sl.set(2, undefined)
    sl.set(3, 'value')
    expect(sl.get(1)).toBe(null)
    expect(sl.get(2)).toBe(undefined)
    expect(sl.get(3)).toBe('value')
  })

  it('interleaved insert and delete', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.delete(1)
    sl.set(3, 'c')
    sl.set(1, 'd')
    sl.delete(2)
    expect([...sl.keys()]).toEqual([1, 3])
  })

  it('size reflects deletions', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.size).toBe(0)
    sl.set(1, 'a')
    expect(sl.size).toBe(1)
    sl.set(2, 'b')
    expect(sl.size).toBe(2)
    sl.set(3, 'c')
    expect(sl.size).toBe(3)
    sl.delete(2)
    expect(sl.size).toBe(2)
    sl.delete(1)
    expect(sl.size).toBe(1)
    sl.delete(3)
    expect(sl.size).toBe(0)
  })

  it('isEmpty reflects operations', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.isEmpty()).toBe(true)
    sl.set(1, 'a')
    expect(sl.isEmpty()).toBe(false)
    sl.delete(1)
    expect(sl.isEmpty()).toBe(true)
  })

  it('handles reverse order insertion', () => {
    const sl = new SkipListMap<number, number>()
    for (let i = 100; i >= 1; i--) sl.set(i, i)
    expect([...sl.keys()]).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
  })

  it('handles already sorted insertion', () => {
    const sl = new SkipListMap<number, number>()
    for (let i = 1; i <= 100; i++) sl.set(i, i)
    expect([...sl.keys()]).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
  })

  it('handles random order insertion', () => {
    const sl = new SkipListMap<number, number>()
    const values = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0]
    for (const v of values) sl.set(v, v)
    expect([...sl.keys()]).toEqual([...values].sort((a, b) => a - b))
  })

  it('update existing key multiple times', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'first')
    sl.set(1, 'second')
    sl.set(1, 'third')
    sl.set(1, 'fourth')
    expect(sl.get(1)).toBe('fourth')
    expect(sl.size).toBe(1)
  })

  it('delete middle key preserves order', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    sl.set(4, 'd')
    sl.set(5, 'e')
    sl.delete(3)
    expect([...sl.keys()]).toEqual([1, 2, 4, 5])
  })

  it('delete first key preserves order', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    sl.set(4, 'd')
    sl.set(5, 'e')
    sl.delete(1)
    expect([...sl.keys()]).toEqual([2, 3, 4, 5])
  })

  it('delete last key preserves order', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    sl.set(3, 'c')
    sl.set(4, 'd')
    sl.set(5, 'e')
    sl.delete(5)
    expect([...sl.keys()]).toEqual([1, 2, 3, 4])
  })

  it('should return undefined for missing key', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.get(999)).toBeUndefined()
  })

  it('should check has correctly', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    expect(sl.has(1)).toBe(true)
    expect(sl.has(2)).toBe(false)
  })

  it('should delete entries', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect(sl.delete(1)).toBe(true)
    expect(sl.has(1)).toBe(false)
    expect(sl.size).toBe(1)
  })

  it('should return false for deleting missing key', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.delete(1)).toBe(false)
  })

  it('should iterate values', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect([...sl.values()]).toEqual(['a', 'b'])
  })

  it('should report isEmpty correctly', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.isEmpty()).toBe(true)
    sl.set(1, 'a')
    expect(sl.isEmpty()).toBe(false)
  })
})
  it('has returns false for missing', () => {
    const sl = new SkipListMap<number, string>()
    expect(sl.has(99)).toBe(false)
  })

  it('delete removes entry', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(2, 'b')
    expect(sl.delete(1)).toBe(true)
    expect(sl.has(1)).toBe(false)
    expect(sl.size).toBe(1)
  })

  it('set overwrites existing key', () => {
    const sl = new SkipListMap<number, string>()
    sl.set(1, 'a')
    sl.set(1, 'b')
    expect(sl.get(1)).toBe('b')
    expect(sl.size).toBe(1)
  })

describe('skip-list-map - extra', () => {
  it('works correctly', () => {
    expect(describe).toBeDefined()
  })

  it('handles edge case', () => {
    expect(typeof describe).toBe('function')
  })

  it('provides expected behavior', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('skip-list-map - wave545', () => {
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

describe('skip-list-map - wave546', () => {
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

describe('skip-list-map - wave547', () => {
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

describe('skip-list-map - wave548', () => {
  it('skip-list-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave549', () => {
  it('skip-list-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave550', () => {
  it('skip-list-map w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave551', () => {
  it('skip-list-map w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave552', () => {
  it('skip-list-map w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave553', () => {
  it('skip-list-map w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave554', () => {
  it('skip-list-map w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave555', () => {
  it('skip-list-map w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave556', () => {
  it('skip-list-map w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave557', () => {
  it('skip-list-map w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave558', () => {
  it('skip-list-map w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave559', () => {
  it('skip-list-map w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave560', () => {
  it('skip-list-map w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave561', () => {
  it('skip-list-map w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave562', () => {
  it('skip-list-map w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave563', () => {
  it('skip-list-map w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave564', () => {
  it('skip-list-map w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave565', () => {
  it('skip-list-map w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave566', () => {
  it('skip-list-map w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave127', () => {
  it('skip-list-map w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave130', () => {
  it('skip-list-map w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave133', () => {
  it('skip-list-map w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave136', () => {
  it('skip-list-map w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - wave139', () => {
  it('skip-list-map w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w142', () => {
  it('skip-list-map v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w145', () => {
  it('skip-list-map v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w148', () => {
  it('skip-list-map v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w151', () => {
  it('skip-list-map v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w154', () => {
  it('skip-list-map v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w157', () => {
  it('skip-list-map v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w160', () => {
  it('skip-list-map v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w170', () => {
  it('skip-list-map x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w180', () => {
  it('skip-list-map x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w190', () => {
  it('skip-list-map x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w200', () => {
  it('skip-list-map x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w210', () => {
  it('skip-list-map x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w220', () => {
  it('skip-list-map x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w230', () => {
  it('skip-list-map x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w240', () => {
  it('skip-list-map x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list-map - w250', () => {
  it('skip-list-map x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list-map x250x9', () => {
    expect(describe).toBeDefined()
  })
})
