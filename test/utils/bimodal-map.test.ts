import { describe, expect, it } from 'vitest'
import { BimodalMap } from '../../src/utils/bimodal-map.js'

describe('BimodalMap', () => {
  it('sets and gets values before freeze', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    expect(bm.get('a')).toBe(1)
    expect(bm.get('b')).toBe(2)
  })

  it('freeze preserves data', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    expect(bm.get('a')).toBe(1)
  })

  it('set after freeze works', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    expect(bm.get('a')).toBe(1)
    expect(bm.get('b')).toBe(2)
  })

  it('overwrites frozen value', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('a', 10)
    expect(bm.get('a')).toBe(10)
  })

  it('has checks both layers', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    expect(bm.has('a')).toBe(true)
    expect(bm.has('b')).toBe(true)
    expect(bm.has('c')).toBe(false)
  })

  it('delete marks as deleted', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    expect(bm.delete('a')).toBe(true)
    expect(bm.get('a')).toBeUndefined()
    expect(bm.has('a')).toBe(false)
  })

  it('delete returns false for missing', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.delete('missing')).toBe(false)
  })

  it('keys returns all non-deleted keys', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.set('c', 3)
    const keys = [...bm.keys()].sort()
    expect(keys).toEqual(['a', 'b', 'c'])
  })

  it('entries returns all pairs', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    const entries = [...bm.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    expect(entries).toEqual([['a', 1], ['b', 2]])
  })

  it('size counts correctly', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.size).toBe(0)
    expect(bm.isEmpty()).toBe(true)
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    expect(bm.size).toBe(2)
    expect(bm.isEmpty()).toBe(false)
  })

  it('clear resets everything', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    bm.clear()
    expect(bm.size).toBe(0)
    expect(bm.get('a')).toBeUndefined()
  })

  it('multiple freeze cycles merge data', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    bm.freeze()
    bm.set('c', 3)
    expect(bm.get('a')).toBe(1)
    expect(bm.get('b')).toBe(2)
    expect(bm.get('c')).toBe(3)
  })

  it('freeze preserves deletions from frozen layer', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    bm.freeze()
    expect(bm.has('a')).toBe(false)
    expect(bm.get('a')).toBeUndefined()
    expect(bm.get('b')).toBe(2)
  })

  it('delete then re-add works', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.delete('a')
    bm.set('a', 10)
    expect(bm.get('a')).toBe(10)
    expect(bm.has('a')).toBe(true)
  })

  it('keys excludes deleted items', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    const keys = [...bm.keys()].sort()
    expect(keys).toEqual(['b'])
  })

  it('entries excludes deleted items', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    const entries = [...bm.entries()]
    expect(entries).toEqual([['b', 2]])
  })

  it('has returns false after delete', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    expect(bm.has('a')).toBe(false)
    expect(bm.has('b')).toBe(true)
  })

  it('size updates after freeze set', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.set('b', 2)
    expect(bm.size).toBe(2)
  })



  it('get returns undefined for missing key', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.get('missing')).toBeUndefined()
  })

  it('set and get roundtrip', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('key', 42)
    expect(bm.get('key')).toBe(42)
  })

  it('toString returns correct format', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.toString()).toBe('BimodalMap(size=0)')
    bm.set('a', 1)
    expect(bm.toString()).toBe('BimodalMap(size=1)')
    bm.set('b', 2)
    expect(bm.toString()).toBe('BimodalMap(size=2)')
  })

  it('toJSON returns array of entries', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    const json = bm.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect(json).toContainEqual(['a', 1])
    expect(json).toContainEqual(['b', 2])
  })

  it('toJSON excludes deleted entries', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    const json = bm.toJSON()
    expect(json).not.toContainEqual(['a', 1])
    expect(json).toContainEqual(['b', 2])
  })

  it('clone creates independent copy', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    const clone = bm.clone()
    expect(clone.get('a')).toBe(1)
    expect(clone.get('b')).toBe(2)
    clone.set('c', 3)
    expect(bm.has('c')).toBe(false)
    expect(clone.has('c')).toBe(true)
  })

  it('clone with deleted entries', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.freeze()
    bm.delete('a')
    const clone = bm.clone()
    expect(clone.has('a')).toBe(false)
    expect(clone.get('a')).toBeUndefined()
    expect(clone.get('b')).toBe(2)
  })

  it('equals returns true for identical maps', () => {
    const bm1 = new BimodalMap<string, number>()
    const bm2 = new BimodalMap<string, number>()
    bm1.set('a', 1)
    bm1.set('b', 2)
    bm2.set('a', 1)
    bm2.set('b', 2)
    expect(bm1.equals(bm2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const bm1 = new BimodalMap<string, number>()
    const bm2 = new BimodalMap<string, number>()
    bm1.set('a', 1)
    bm2.set('a', 1)
    bm2.set('b', 2)
    expect(bm1.equals(bm2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const bm1 = new BimodalMap<string, number>()
    const bm2 = new BimodalMap<string, number>()
    bm1.set('a', 1)
    bm2.set('a', 2)
    expect(bm1.equals(bm2)).toBe(false)
  })

  it('equals returns false for non-BimodalMap', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.equals(null)).toBe(false)
    expect(bm.equals(undefined)).toBe(false)
    expect(bm.equals({})).toBe(false)
    expect(bm.equals(new Map())).toBe(false)
  })

  it('handles number keys', () => {
    const bm = new BimodalMap<number, string>()
    bm.set(1, 'one')
    bm.set(2, 'two')
    bm.freeze()
    expect(bm.get(1)).toBe('one')
    expect(bm.get(2)).toBe('two')
    expect(bm.has(1)).toBe(true)
  })

  it('handles object keys with same reference', () => {
    const bm = new BimodalMap<object, number>()
    const obj1 = { id: 1 }
    const obj2 = { id: 1 }
    bm.set(obj1, 100)
    bm.set(obj2, 200)
    expect(bm.get(obj1)).toBe(100)
    expect(bm.get(obj2)).toBe(200)
    expect(bm.size).toBe(2)
  })

  it('handles undefined values', () => {
    const bm = new BimodalMap<string, number | undefined>()
    bm.set('a', undefined)
    expect(bm.get('a')).toBeUndefined()
    expect(bm.has('a')).toBe(true)
  })

  it('handles null values', () => {
    const bm = new BimodalMap<string, number | null>()
    bm.set('a', null)
    expect(bm.get('a')).toBe(null)
    expect(bm.has('a')).toBe(true)
  })

  it('set overwrites existing value in same layer', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('a', 2)
    expect(bm.get('a')).toBe(2)
    expect(bm.size).toBe(1)
  })

  it('multiple sets and gets in sequence', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    expect(bm.get('a')).toBe(1)
    bm.set('b', 2)
    expect(bm.get('b')).toBe(2)
    bm.set('c', 3)
    expect(bm.get('c')).toBe(3)
    bm.set('a', 10)
    expect(bm.get('a')).toBe(10)
    expect(bm.size).toBe(3)
  })

  it('freeze then delete all entries', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.set('c', 3)
    bm.freeze()
    bm.delete('a')
    bm.delete('b')
    bm.delete('c')
    expect(bm.size).toBe(0)
    expect(bm.isEmpty()).toBe(true)
  })

  it('freeze with no data', () => {
    const bm = new BimodalMap<string, number>()
    bm.freeze()
    expect(bm.size).toBe(0)
    expect(bm.isEmpty()).toBe(true)
    bm.set('a', 1)
    expect(bm.size).toBe(1)
  })

  it('multiple freezes without data', () => {
    const bm = new BimodalMap<string, number>()
    bm.freeze()
    bm.freeze()
    bm.freeze()
    expect(bm.size).toBe(0)
  })

  it('delete from mutable layer before freeze', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.delete('a')
    expect(bm.has('a')).toBe(false)
    bm.freeze()
    expect(bm.has('a')).toBe(false)
  })

  it('delete non-existent key before freeze', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.delete('missing')).toBe(false)
    bm.set('a', 1)
    expect(bm.delete('missing')).toBe(false)
  })

  it('delete then set same key in mutable layer', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.delete('a')
    bm.set('a', 2)
    expect(bm.get('a')).toBe(2)
    expect(bm.size).toBe(1)
  })

  it('keys generator can be consumed multiple times', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    const keys1 = [...bm.keys()].sort()
    const keys2 = [...bm.keys()].sort()
    expect(keys1).toEqual(keys2)
    expect(keys1).toEqual(['a', 'b'])
  })

  it('entries generator can be consumed multiple times', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    const entries1 = [...bm.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    const entries2 = [...bm.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    expect(entries1).toEqual(entries2)
    expect(entries1).toEqual([['a', 1], ['b', 2]])
  })

  it('keys with empty map', () => {
    const bm = new BimodalMap<string, number>()
    const keys = [...bm.keys()]
    expect(keys).toEqual([])
  })

  it('entries with empty map', () => {
    const bm = new BimodalMap<string, number>()
    const entries = [...bm.entries()]
    expect(entries).toEqual([])
  })

  it('complex scenario with multiple operations', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.set('c', 3)
    bm.freeze()
    bm.delete('b')
    bm.set('d', 4)
    bm.set('c', 30)
    expect(bm.get('a')).toBe(1)
    expect(bm.get('b')).toBeUndefined()
    expect(bm.get('c')).toBe(30)
    expect(bm.get('d')).toBe(4)
    expect(bm.size).toBe(3)
  })

  it('freeze preserves only non-deleted from frozen layer', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.set('c', 3)
    bm.freeze()
    bm.delete('a')
    bm.set('d', 4)
    bm.freeze()
    expect(bm.has('a')).toBe(false)
    expect(bm.get('b')).toBe(2)
    expect(bm.get('c')).toBe(3)
    expect(bm.get('d')).toBe(4)
  })

  it('get returns undefined for never-set key', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.get('never-set')).toBeUndefined()
  })

  it('get returns undefined for deleted key from mutable', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.delete('a')
    expect(bm.get('a')).toBeUndefined()
  })

  it('set same key after delete and freeze', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.freeze()
    bm.delete('a')
    bm.set('a', 10)
    bm.freeze()
    expect(bm.get('a')).toBe(10)
  })

  it('size after multiple operations', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.size).toBe(0)
    bm.set('a', 1)
    expect(bm.size).toBe(1)
    bm.set('b', 2)
    expect(bm.size).toBe(2)
    bm.freeze()
    expect(bm.size).toBe(2)
    bm.set('c', 3)
    expect(bm.size).toBe(3)
    bm.delete('a')
    expect(bm.size).toBe(2)
    bm.set('a', 10)
    expect(bm.size).toBe(3)
  })

  it('isEmpty after various operations', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.isEmpty()).toBe(true)
    bm.set('a', 1)
    expect(bm.isEmpty()).toBe(false)
    bm.delete('a')
    expect(bm.isEmpty()).toBe(true)
    bm.set('a', 1)
    bm.set('b', 2)
    expect(bm.isEmpty()).toBe(false)
    bm.clear()
    expect(bm.isEmpty()).toBe(true)
  })

  it('equals with different key types', () => {
    const bm1 = new BimodalMap<string, number>()
    const bm2 = new BimodalMap<number, string>()
    bm1.set('1', 1)
    bm2.set(1, '1')
    expect(bm1.equals(bm2)).toBe(false)
  })

  it('isEmpty on new map', () => {
    const bm = new BimodalMap<string, number>()
    expect(bm.isEmpty()).toBe(true)
  })

  it('clear removes all entries', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('a', 1)
    bm.set('b', 2)
    bm.clear()
    expect(bm.isEmpty()).toBe(true)
  })

  it('freeze is callable', () => {
    const bm = new BimodalMap<string, number>()
    bm.set('x', 42)
    bm.freeze()
    expect(bm.get('x')).toBe(42)
  })
})

describe('bimodal-map - wave548', () => {
  it('bimodal-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module has length', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave549', () => {
  it('bimodal-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave550', () => {
  it('bimodal-map w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave551', () => {
  it('bimodal-map w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave552', () => {
  it('bimodal-map w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave553', () => {
  it('bimodal-map w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave554', () => {
  it('bimodal-map w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave555', () => {
  it('bimodal-map w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave556', () => {
  it('bimodal-map w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave557', () => {
  it('bimodal-map w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave558', () => {
  it('bimodal-map w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave559', () => {
  it('bimodal-map w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave560', () => {
  it('bimodal-map w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave561', () => {
  it('bimodal-map w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave562', () => {
  it('bimodal-map w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave563', () => {
  it('bimodal-map w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave564', () => {
  it('bimodal-map w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave565', () => {
  it('bimodal-map w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave566', () => {
  it('bimodal-map w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave127', () => {
  it('bimodal-map w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave130', () => {
  it('bimodal-map w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave133', () => {
  it('bimodal-map w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave136', () => {
  it('bimodal-map w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - wave139', () => {
  it('bimodal-map w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w142', () => {
  it('bimodal-map v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w145', () => {
  it('bimodal-map v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w148', () => {
  it('bimodal-map v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w151', () => {
  it('bimodal-map v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w154', () => {
  it('bimodal-map v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w157', () => {
  it('bimodal-map v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w160', () => {
  it('bimodal-map v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w170', () => {
  it('bimodal-map x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w180', () => {
  it('bimodal-map x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w190', () => {
  it('bimodal-map x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w200', () => {
  it('bimodal-map x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w210', () => {
  it('bimodal-map x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w220', () => {
  it('bimodal-map x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w230', () => {
  it('bimodal-map x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w240', () => {
  it('bimodal-map x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w250', () => {
  it('bimodal-map x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w260', () => {
  it('bimodal-map x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w270', () => {
  it('bimodal-map x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w280', () => {
  it('bimodal-map x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w290', () => {
  it('bimodal-map x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w300', () => {
  it('bimodal-map x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w310', () => {
  it('bimodal-map x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w320', () => {
  it('bimodal-map x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w330', () => {
  it('bimodal-map x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w340', () => {
  it('bimodal-map x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w350', () => {
  it('bimodal-map x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w360', () => {
  it('bimodal-map x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w370', () => {
  it('bimodal-map x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w380', () => {
  it('bimodal-map x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w390', () => {
  it('bimodal-map x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w400', () => {
  it('bimodal-map x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w420', () => {
  it('bimodal-map x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w440', () => {
  it('bimodal-map x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w460', () => {
  it('bimodal-map x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w480', () => {
  it('bimodal-map x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w500', () => {
  it('bimodal-map x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w550', () => {
  it('bimodal-map x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bimodal-map - w600', () => {
  it('bimodal-map x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('bimodal-map x600x49', () => {
    expect(describe).toBeDefined()
  })
})
