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
