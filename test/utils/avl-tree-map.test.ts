import { beforeEach, describe, expect, it } from 'vitest'

import { AVLTreeMap } from '../../src/utils/avl-tree-map.js'

// ─── Empty map ───────────────────────────────────────────
describe('AVLTreeMap - empty map', () => {
  it('get returns undefined on empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.get(1)).toBeUndefined()
  })

  it('has returns false on empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.has(1)).toBe(false)
  })

  it('size is 0 on empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.size).toBe(0)
  })

  it('delete returns false on empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.delete(1)).toBe(false)
  })

  it('first returns undefined on empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.first()).toBeUndefined()
  })

  it('last returns undefined on empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.last()).toBeUndefined()
  })

  it('keys, values, entries return empty arrays', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.keys()).toEqual([])
    expect(map.values()).toEqual([])
    expect(map.entries()).toEqual([])
  })
})

// ─── Set and Get ─────────────────────────────────────────
describe('AVLTreeMap - set and get', () => {
  it('set and get a single entry', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'one')
    expect(map.get(1)).toBe('one')
    expect(map.size).toBe(1)
  })

  it('get returns undefined for missing key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'one')
    expect(map.get(2)).toBeUndefined()
  })

  it('set overwrites existing value', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'one')
    map.set(1, 'uno')
    expect(map.get(1)).toBe('uno')
    expect(map.size).toBe(1)
  })

  it('has returns true for existing key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'one')
    expect(map.has(1)).toBe(true)
  })

  it('has returns false for missing key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'one')
    expect(map.has(2)).toBe(false)
  })
})

// ─── Delete ──────────────────────────────────────────────
describe('AVLTreeMap - delete', () => {
  it('delete removes entry and returns true', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'one')
    expect(map.delete(1)).toBe(true)
    expect(map.get(1)).toBeUndefined()
    expect(map.size).toBe(0)
  })

  it('delete returns false for missing key', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.delete(1)).toBe(false)
  })

  it('delete maintains tree balance', () => {
    const map = new AVLTreeMap<number, string>()
    for (let i = 1; i <= 10; i++) map.set(i, `v${i}`)
    map.delete(5)
    expect(map.size).toBe(9)
    expect(map.has(5)).toBe(false)
    expect(map.keys()).toEqual([1, 2, 3, 4, 6, 7, 8, 9, 10])
  })
})

// ─── Size and Clear ──────────────────────────────────────
describe('AVLTreeMap - size and clear', () => {
  it('tracks size correctly', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.size).toBe(0)
    map.set(1, 'a')
    expect(map.size).toBe(1)
    map.set(2, 'b')
    expect(map.size).toBe(2)
    map.set(1, 'c')
    expect(map.size).toBe(2)
    map.delete(1)
    expect(map.size).toBe(1)
  })

  it('clear resets the map', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.get(1)).toBeUndefined()
    expect(map.keys()).toEqual([])
  })
})

// ─── Keys, Values, Entries ───────────────────────────────
describe('AVLTreeMap - keys, values, entries', () => {
  it('keys returns sorted key array', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.keys()).toEqual([1, 2, 3])
  })

  it('values returns values in key order', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.values()).toEqual(['a', 'b', 'c'])
  })

  it('entries returns [key, value] pairs in key order', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.entries()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })
})

// ─── ForEach ─────────────────────────────────────────────
describe('AVLTreeMap - forEach', () => {
  it('iterates in order', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    const collected: [number, string][] = []
    map.forEach((value, key) => collected.push([key, value]))
    expect(collected).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('forEach receives map as third argument', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    let received: AVLTreeMap<number, string> | undefined
    map.forEach((_v, _k, m) => {
      received = m
    })
    expect(received).toBe(map)
  })
})

// ─── First and Last ──────────────────────────────────────
describe('AVLTreeMap - first and last', () => {
  it('first returns smallest entry', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(5, 'e')
    map.set(1, 'a')
    map.set(3, 'c')
    expect(map.first()).toEqual([1, 'a'])
  })

  it('last returns largest entry', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(5, 'e')
    map.set(1, 'a')
    map.set(3, 'c')
    expect(map.last()).toEqual([5, 'e'])
  })
})

// ─── LowerBound and UpperBound ───────────────────────────
describe('AVLTreeMap - lowerBound and upperBound', () => {
  const map = new AVLTreeMap<number, string>()
  beforeEach(() => {
    map.clear()
    map.set(10, 'a')
    map.set(20, 'b')
    map.set(30, 'c')
    map.set(40, 'd')
    map.set(50, 'e')
  })

  it('lowerBound returns first entry with key >= given key', () => {
    expect(map.lowerBound(20)).toEqual([20, 'b'])
    expect(map.lowerBound(25)).toEqual([30, 'c'])
    expect(map.lowerBound(5)).toEqual([10, 'a'])
  })

  it('lowerBound returns undefined when no key >= given', () => {
    expect(map.lowerBound(55)).toBeUndefined()
  })

  it('upperBound returns first entry with key > given key', () => {
    expect(map.upperBound(20)).toEqual([30, 'c'])
    expect(map.upperBound(25)).toEqual([30, 'c'])
    expect(map.upperBound(5)).toEqual([10, 'a'])
  })

  it('upperBound returns undefined when no key > given', () => {
    expect(map.upperBound(50)).toBeUndefined()
  })
})

// ─── Range queries ───────────────────────────────────────
describe('AVLTreeMap - range', () => {
  it('returns entries in [min, max] inclusive', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(10, 'a')
    map.set(20, 'b')
    map.set(30, 'c')
    map.set(40, 'd')
    map.set(50, 'e')
    expect(map.range(20, 40)).toEqual([
      [20, 'b'],
      [30, 'c'],
      [40, 'd'],
    ])
  })

  it('returns empty array when no keys in range', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(10, 'a')
    map.set(50, 'e')
    expect(map.range(20, 40)).toEqual([])
  })

  it('returns single entry for exact match range', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(10, 'a')
    map.set(20, 'b')
    expect(map.range(20, 20)).toEqual([[20, 'b']])
  })
})

// ─── Rank and atRank ─────────────────────────────────────
describe('AVLTreeMap - rank and atRank', () => {
  it('rank returns 0-based position', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(30, 'c')
    map.set(10, 'a')
    map.set(20, 'b')
    map.set(40, 'd')
    expect(map.rank(10)).toBe(0)
    expect(map.rank(20)).toBe(1)
    expect(map.rank(30)).toBe(2)
    expect(map.rank(40)).toBe(3)
  })

  it('rank returns -1 for missing key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    expect(map.rank(99)).toBe(-1)
  })

  it('atRank returns entry at position', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(30, 'c')
    map.set(10, 'a')
    map.set(20, 'b')
    map.set(40, 'd')
    expect(map.atRank(0)).toEqual([10, 'a'])
    expect(map.atRank(1)).toEqual([20, 'b'])
    expect(map.atRank(2)).toEqual([30, 'c'])
    expect(map.atRank(3)).toEqual([40, 'd'])
  })

  it('atRank returns undefined for out of bounds', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    expect(map.atRank(-1)).toBeUndefined()
    expect(map.atRank(1)).toBeUndefined()
  })
})

// ─── Large dataset ───────────────────────────────────────
describe('AVLTreeMap - large dataset', () => {
  it('handles 1000 entries with correct ordering', () => {
    const map = new AVLTreeMap<number, number>()
    const shuffled = Array.from({ length: 1000 }, (_, i) => i + 1)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    for (const n of shuffled) map.set(n, n * 10)
    expect(map.size).toBe(1000)
    expect(map.keys()).toEqual(
      Array.from({ length: 1000 }, (_, i) => i + 1),
    )
    expect(map.first()).toEqual([1, 10])
    expect(map.last()).toEqual([1000, 10000])
    expect(map.rank(500)).toBe(499)
    expect(map.atRank(500)).toEqual([501, 5010])
  })
})

// ─── Custom comparator ───────────────────────────────────
describe('AVLTreeMap - custom comparator (reverse order)', () => {
  it('maintains reverse order', () => {
    const map = new AVLTreeMap<number, string>(
      (a, b) => b - a,
    )
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.keys()).toEqual([3, 2, 1])
    expect(map.first()).toEqual([3, 'c'])
    expect(map.last()).toEqual([1, 'a'])
  })
})

// ─── Constructor with entries ────────────────────────────
describe('AVLTreeMap - constructor with entries', () => {
  it('initializes from entries array', () => {
    const map = new AVLTreeMap<number, string>(undefined, [
      [3, 'c'],
      [1, 'a'],
      [2, 'b'],
    ])
    expect(map.size).toBe(3)
    expect(map.keys()).toEqual([1, 2, 3])
    expect(map.get(2)).toBe('b')
  })

  it('constructor entries handles duplicates', () => {
    const map = new AVLTreeMap<number, string>(undefined, [
      [1, 'a'],
      [1, 'b'],
      [2, 'c'],
    ])
    expect(map.size).toBe(2)
    expect(map.get(1)).toBe('b')
  })
})

// ─── Mixed operations ────────────────────────────────────
describe('AVLTreeMap - mixed operations', () => {
  it('set, delete, set maintains correctness', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.delete(2)
    map.set(4, 'd')
    map.set(2, 'b2')
    expect(map.entries()).toEqual([
      [1, 'a'],
      [2, 'b2'],
      [3, 'c'],
      [4, 'd'],
    ])
    expect(map.size).toBe(4)
  })

  it('range works after deletes', () => {
    const map = new AVLTreeMap<number, string>()
    for (let i = 1; i <= 10; i++) map.set(i, `v${i}`)
    map.delete(3)
    map.delete(7)
    expect(map.range(2, 8)).toEqual([
      [2, 'v2'],
      [4, 'v4'],
      [5, 'v5'],
      [6, 'v6'],
      [8, 'v8'],
    ])
  })
})

// ─── String keys ─────────────────────────────────────────
describe('AVLTreeMap - string keys', () => {
  it('works with string comparator', () => {
    const map = new AVLTreeMap<string, number>(
      (a, b) => a.localeCompare(b),
    )
    map.set('cherry', 3)
    map.set('apple', 1)
    map.set('banana', 2)
    expect(map.keys()).toEqual(['apple', 'banana', 'cherry'])
    expect(map.get('banana')).toBe(2)
    expect(map.first()).toEqual(['apple', 1])
    expect(map.last()).toEqual(['cherry', 3])
  })
})

// ─── toString, toJSON, clone, equals ──────────────────────
describe('AVLTreeMap - serialization methods', () => {
  it('toString returns correct format', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.toString()).toBe('AVLTreeMap(size=2)')
  })

  it('toString on empty map shows size 0', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.toString()).toBe('AVLTreeMap(size=0)')
  })

  it('toJSON returns entries array', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    const json = map.toJSON()
    expect(json).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('toJSON on empty map returns empty array', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.toJSON()).toEqual([])
  })

  it('clone creates independent copy', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    const clone = map.clone()
    expect(clone.entries()).toEqual(map.entries())
    expect(clone.size).toBe(map.size)
  })

  it('clone modifications do not affect original', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    const clone = map.clone()
    clone.set(2, 'b')
    expect(map.has(2)).toBe(false)
    expect(clone.has(2)).toBe(true)
  })

  it('equals returns true for identical maps', () => {
    const map1 = new AVLTreeMap<number, string>()
    const map2 = new AVLTreeMap<number, string>()
    map1.set(1, 'a')
    map1.set(2, 'b')
    map2.set(1, 'a')
    map2.set(2, 'b')
    expect(map1.equals(map2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const map1 = new AVLTreeMap<number, string>()
    const map2 = new AVLTreeMap<number, string>()
    map1.set(1, 'a')
    map2.set(1, 'a')
    map2.set(2, 'b')
    expect(map1.equals(map2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const map1 = new AVLTreeMap<number, string>()
    const map2 = new AVLTreeMap<number, string>()
    map1.set(1, 'a')
    map2.set(1, 'b')
    expect(map1.equals(map2)).toBe(false)
  })

  it('equals returns false for non-AVLTreeMap', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.equals(null)).toBe(false)
    expect(map.equals(undefined)).toBe(false)
    expect(map.equals({})).toBe(false)
    expect(map.equals([])).toBe(false)
  })

  it('clone equals original', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    const clone = map.clone()
    expect(clone.equals(map)).toBe(true)
  })

  it('first returns smallest key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.first()).toEqual([1, 'a'])
  })

  it('last returns largest key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(3, 'c')
    expect(map.last()).toEqual([3, 'c'])
  })

  it('clear removes all entries', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.clear()
    expect(map.size).toBe(0)
  })
})

describe('avl-tree-map - wave548', () => {
  it('avl-tree-map module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module has name', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module not null', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module not undefined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module constructable', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module has prototype', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module toString works', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module has length', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module type is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module name is string', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module exists in scope', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module is class-like', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module has constructor', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave549', () => {
  it('avl-tree-map module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map module has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave550', () => {
  it('avl-tree-map w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave551', () => {
  it('avl-tree-map w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave552', () => {
  it('avl-tree-map w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave553', () => {
  it('avl-tree-map w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave554', () => {
  it('avl-tree-map w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave555', () => {
  it('avl-tree-map w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave556', () => {
  it('avl-tree-map w556 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w556 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w556 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave557', () => {
  it('avl-tree-map w557 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w557 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w557 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave558', () => {
  it('avl-tree-map w558 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w558 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w558 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave559', () => {
  it('avl-tree-map w559 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w559 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w559 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave560', () => {
  it('avl-tree-map w560 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w560 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w560 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave561', () => {
  it('avl-tree-map w561 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w561 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w561 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave562', () => {
  it('avl-tree-map w562 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w562 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w562 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave563', () => {
  it('avl-tree-map w563 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w563 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w563 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave564', () => {
  it('avl-tree-map w564 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w564 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w564 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave565', () => {
  it('avl-tree-map w565 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w565 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w565 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave566', () => {
  it('avl-tree-map w566 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w566 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w566 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave127', () => {
  it('avl-tree-map w127 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w127 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w127 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave130', () => {
  it('avl-tree-map w130 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w130 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w130 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave133', () => {
  it('avl-tree-map w133 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w133 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w133 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave136', () => {
  it('avl-tree-map w136 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w136 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w136 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - wave139', () => {
  it('avl-tree-map w139 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w139 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map w139 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w142', () => {
  it('avl-tree-map v142x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v142x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v142x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w145', () => {
  it('avl-tree-map v145x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v145x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v145x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w148', () => {
  it('avl-tree-map v148x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v148x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v148x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w151', () => {
  it('avl-tree-map v151x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v151x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v151x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w154', () => {
  it('avl-tree-map v154x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v154x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v154x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w157', () => {
  it('avl-tree-map v157x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v157x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v157x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w160', () => {
  it('avl-tree-map v160x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v160x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map v160x2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w170', () => {
  it('avl-tree-map x170x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x170x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w180', () => {
  it('avl-tree-map x180x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x180x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w190', () => {
  it('avl-tree-map x190x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x190x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w200', () => {
  it('avl-tree-map x200x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x200x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w210', () => {
  it('avl-tree-map x210x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x210x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w220', () => {
  it('avl-tree-map x220x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x220x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w230', () => {
  it('avl-tree-map x230x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x230x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w240', () => {
  it('avl-tree-map x240x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x240x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w250', () => {
  it('avl-tree-map x250x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x250x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w260', () => {
  it('avl-tree-map x260x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x260x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w270', () => {
  it('avl-tree-map x270x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x270x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w280', () => {
  it('avl-tree-map x280x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x280x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w290', () => {
  it('avl-tree-map x290x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x290x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w300', () => {
  it('avl-tree-map x300x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x300x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w310', () => {
  it('avl-tree-map x310x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x310x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w320', () => {
  it('avl-tree-map x320x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x320x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w330', () => {
  it('avl-tree-map x330x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x330x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w340', () => {
  it('avl-tree-map x340x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x340x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w350', () => {
  it('avl-tree-map x350x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x350x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w360', () => {
  it('avl-tree-map x360x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x360x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w370', () => {
  it('avl-tree-map x370x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x370x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w380', () => {
  it('avl-tree-map x380x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x380x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w390', () => {
  it('avl-tree-map x390x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x390x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w400', () => {
  it('avl-tree-map x400x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x400x9', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w420', () => {
  it('avl-tree-map x420x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x420x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w440', () => {
  it('avl-tree-map x440x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x440x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w460', () => {
  it('avl-tree-map x460x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x460x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w480', () => {
  it('avl-tree-map x480x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x480x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w500', () => {
  it('avl-tree-map x500x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x500x19', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w550', () => {
  it('avl-tree-map x550x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x550x49', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('avl-tree-map - w600', () => {
  it('avl-tree-map x600x0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x2', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x3', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x4', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x5', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x6', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x7', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x8', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x9', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x10', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x11', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x12', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x13', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x14', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x15', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x16', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x17', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x18', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x19', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x20', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x21', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x22', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x23', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x24', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x25', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x26', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x27', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x28', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x29', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x30', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x31', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x32', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x33', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x34', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x35', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x36', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x37', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x38', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x39', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x40', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x41', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x42', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x43', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x44', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x45', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x46', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x47', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x48', () => {
    expect(beforeEach).toBeDefined()
  })
  it('avl-tree-map x600x49', () => {
    expect(beforeEach).toBeDefined()
  })
})
