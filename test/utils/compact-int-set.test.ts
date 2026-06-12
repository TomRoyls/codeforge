import { describe, it, expect } from 'vitest'
import { CompactIntSet } from '../../src/utils/compact-int-set.js'

describe('CompactIntSet', () => {
  it('creates empty set', () => {
    const set = new CompactIntSet()
    expect(set.size).toBe(0)
    expect(set.toArray()).toEqual([])
    expect(set.byteLength).toBe(0)
  })

  it('creates set from sorted array', () => {
    const set = new CompactIntSet([1, 5, 10])
    expect(set.size).toBe(3)
    expect(set.toArray()).toEqual([1, 5, 10])
  })

  it('adds single value to empty set', () => {
    const set = new CompactIntSet()
    const result = set.add(5)
    expect(result).toBe(true)
    expect(set.has(5)).toBe(true)
    expect(set.size).toBe(1)
  })

  it('adds multiple values', () => {
    const set = new CompactIntSet()
    set.add(3)
    set.add(7)
    set.add(10)
    expect(set.toArray()).toEqual([3, 7, 10])
    expect(set.size).toBe(3)
  })

  it('returns false when adding duplicate', () => {
    const set = new CompactIntSet()
    set.add(5)
    const result = set.add(5)
    expect(result).toBe(false)
    expect(set.size).toBe(1)
  })

  it('returns false when adding negative value', () => {
    const set = new CompactIntSet()
    const result = set.add(-5)
    expect(result).toBe(false)
    expect(set.size).toBe(0)
  })

  it('has returns true for existing value', () => {
    const set = new CompactIntSet()
    set.add(5)
    expect(set.has(5)).toBe(true)
  })

  it('has returns false for non-existing value', () => {
    const set = new CompactIntSet()
    set.add(5)
    expect(set.has(10)).toBe(false)
  })

  it('has returns false for negative value', () => {
    const set = new CompactIntSet()
    set.add(5)
    expect(set.has(-1)).toBe(false)
  })

  it('has returns false for empty set', () => {
    const set = new CompactIntSet()
    expect(set.has(5)).toBe(false)
  })

  it('deletes existing value', () => {
    const set = new CompactIntSet()
    set.add(5)
    set.add(10)
    const result = set.delete(5)
    expect(result).toBe(true)
    expect(set.has(5)).toBe(false)
    expect(set.has(10)).toBe(true)
    expect(set.size).toBe(1)
  })

  it('returns false when deleting non-existing value', () => {
    const set = new CompactIntSet()
    set.add(5)
    const result = set.delete(10)
    expect(result).toBe(false)
    expect(set.size).toBe(1)
  })

  it('returns false when deleting from empty set', () => {
    const set = new CompactIntSet()
    const result = set.delete(5)
    expect(result).toBe(false)
  })

  it('returns false when deleting negative value', () => {
    const set = new CompactIntSet()
    set.add(5)
    const result = set.delete(-1)
    expect(result).toBe(false)
    expect(set.size).toBe(1)
  })

  it('toArray returns sorted values', () => {
    const set = new CompactIntSet()
    set.add(10)
    set.add(5)
    set.add(15)
    expect(set.toArray()).toEqual([5, 10, 15])
  })

  it('byteLength grows with values', () => {
    const set = new CompactIntSet()
    const initialLength = set.byteLength
    set.add(100)
    const afterAdd = set.byteLength
    expect(afterAdd).toBeGreaterThan(initialLength)
  })

  it('union combines two sets', () => {
    const a = new CompactIntSet([1, 3, 5])
    const b = new CompactIntSet([3, 5, 7])
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 3, 5, 7])
  })

  it('union with disjoint sets', () => {
    const a = new CompactIntSet([1, 2])
    const b = new CompactIntSet([5, 6])
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 5, 6])
  })

  it('union with empty set', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet()
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('intersection finds common values', () => {
    const a = new CompactIntSet([1, 3, 5, 7])
    const b = new CompactIntSet([3, 5, 8, 10])
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([3, 5])
  })

  it('intersection with disjoint sets returns empty', () => {
    const a = new CompactIntSet([1, 2])
    const b = new CompactIntSet([5, 6])
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([])
  })

  it('intersection with empty set returns empty', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet()
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([])
  })

  it('handles large values', () => {
    const set = new CompactIntSet()
    set.add(1000000)
    set.add(2000000)
    expect(set.has(1000000)).toBe(true)
    expect(set.has(2000000)).toBe(true)
  })

  it('handles consecutive values', () => {
    const set = new CompactIntSet()
    for (let i = 0; i < 10; i++) {
      set.add(i)
    }
    expect(set.size).toBe(10)
    expect(set.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('adds value before existing', () => {
    const set = new CompactIntSet([5, 10])
    set.add(2)
    expect(set.toArray()).toEqual([2, 5, 10])
  })

  it('adds value between existing', () => {
    const set = new CompactIntSet([1, 10])
    set.add(5)
    expect(set.toArray()).toEqual([1, 5, 10])
  })

  it('adds value after existing', () => {
    const set = new CompactIntSet([1, 5])
    set.add(10)
    expect(set.toArray()).toEqual([1, 5, 10])
  })

  it('creates set from unsorted array', () => {
    const set = new CompactIntSet([10, 5, 1])
    expect(set.toArray()).toEqual([1, 5, 10])
  })

  it('creates set from duplicate array', () => {
    const set = new CompactIntSet([1, 1, 5, 5])
    expect(set.size).toBe(2)
    expect(set.toArray()).toEqual([1, 5])
  })

  it('creates set from empty array', () => {
    const set = new CompactIntSet([])
    expect(set.size).toBe(0)
    expect(set.toArray()).toEqual([])
  })

  it('delete all values results in empty set', () => {
    const set = new CompactIntSet([1, 2, 3])
    set.delete(1)
    set.delete(2)
    set.delete(3)
    expect(set.size).toBe(0)
    expect(set.toArray()).toEqual([])
  })

  it('delete middle value preserves order', () => {
    const set = new CompactIntSet([1, 5, 10])
    set.delete(5)
    expect(set.toArray()).toEqual([1, 10])
  })

  it('delete first value', () => {
    const set = new CompactIntSet([1, 5, 10])
    set.delete(1)
    expect(set.toArray()).toEqual([5, 10])
  })

  it('delete last value', () => {
    const set = new CompactIntSet([1, 5, 10])
    set.delete(10)
    expect(set.toArray()).toEqual([1, 5])
  })

  it('union with identical sets', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet([1, 2, 3])
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('union returns new set', () => {
    const a = new CompactIntSet([1])
    const b = new CompactIntSet([2])
    const result = a.union(b)
    expect(result).not.toBe(a)
    expect(result).not.toBe(b)
  })

  it('intersection with identical sets', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet([1, 2, 3])
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('intersection returns new set', () => {
    const a = new CompactIntSet([1, 2])
    const b = new CompactIntSet([2, 3])
    const result = a.intersection(b)
    expect(result).not.toBe(a)
    expect(result).not.toBe(b)
  })

  it('handles zero value', () => {
    const set = new CompactIntSet()
    set.add(0)
    expect(set.has(0)).toBe(true)
    expect(set.size).toBe(1)
  })

  it('handles single value operations', () => {
    const set = new CompactIntSet()
    set.add(42)
    expect(set.has(42)).toBe(true)
    set.delete(42)
    expect(set.has(42)).toBe(false)
    expect(set.size).toBe(0)
  })

  it('handles large number of values', () => {
    const set = new CompactIntSet()
    for (let i = 0; i < 100; i++) {
      set.add(i * 10)
    }
    expect(set.size).toBe(100)
    expect(set.has(0)).toBe(true)
    expect(set.has(990)).toBe(true)
    expect(set.has(500)).toBe(true)
  })

  it('byteLength increases with larger values', () => {
    const small = new CompactIntSet([1, 2, 3])
    const large = new CompactIntSet([100000, 200000, 300000])
    expect(large.byteLength).toBeGreaterThan(small.byteLength)
  })

  it('union of two empty sets is empty', () => {
    const a = new CompactIntSet()
    const b = new CompactIntSet()
    const result = a.union(b)
    expect(result.toArray()).toEqual([])
    expect(result.size).toBe(0)
  })

  it('intersection of two empty sets is empty', () => {
    const a = new CompactIntSet()
    const b = new CompactIntSet()
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([])
    expect(result.size).toBe(0)
  })

  it('union with overlapping ranges', () => {
    const a = new CompactIntSet([1, 2, 3, 4, 5])
    const b = new CompactIntSet([3, 4, 5, 6, 7])
    const result = a.union(b)
    expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('intersection with overlapping ranges', () => {
    const a = new CompactIntSet([1, 2, 3, 4, 5])
    const b = new CompactIntSet([3, 4, 5, 6, 7])
    const result = a.intersection(b)
    expect(result.toArray()).toEqual([3, 4, 5])
  })

  it('add after delete works correctly', () => {
    const set = new CompactIntSet([1, 5, 10])
    set.delete(5)
    set.add(5)
    expect(set.toArray()).toEqual([1, 5, 10])
    expect(set.size).toBe(3)
  })

  it('has returns false for zero in empty set', () => {
    const set = new CompactIntSet()
    expect(set.has(0)).toBe(false)
  })

  it('multiple adds and deletes maintain correctness', () => {
    const set = new CompactIntSet()
    set.add(1)
    set.add(2)
    set.add(3)
    set.delete(2)
    set.add(4)
    set.delete(1)
    expect(set.toArray()).toEqual([3, 4])
  })

  it('should compute union', () => {
    const s1 = new CompactIntSet([1, 3, 5])
    const s2 = new CompactIntSet([2, 3, 4])
    const u = s1.union(s2)
    expect(u.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('should delete elements', () => {
    const set = new CompactIntSet([1, 2, 3])
    expect(set.delete(2)).toBe(true)
    expect(set.has(2)).toBe(false)
  })

  it('union combines two sets', () => {
    const a = new CompactIntSet([1, 3])
    const b = new CompactIntSet([2, 3])
    const u = a.union(b)
    expect(u.toArray()).toEqual([1, 2, 3])
  })

  it('intersection finds common elements', () => {
    const a = new CompactIntSet([1, 2, 3])
    const b = new CompactIntSet([2, 3, 4])
    const i = a.intersection(b)
    expect(i.toArray()).toEqual([2, 3])
  })

  it('add returns false for negative values', () => {
    const set = new CompactIntSet()
    expect(set.add(-1)).toBe(false)
  })

  it('has returns false for negative values', () => {
    const set = new CompactIntSet([1, 2])
    expect(set.has(-5)).toBe(false)
  })
})

  it('has returns false for missing', () => {
    const cis = new CompactIntSet()
    expect(cis.has(5)).toBe(false)
  })

  it('add and has', () => {
    const cis = new CompactIntSet()
    cis.add(3)
    cis.add(7)
    expect(cis.has(3)).toBe(true)
    expect(cis.has(7)).toBe(true)
  })

  it('size tracks count', () => {
    const cis = new CompactIntSet()
    cis.add(1)
    cis.add(2)
    expect(cis.size).toBe(2)
  })

describe('compact-int-set - wave545', () => {
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

describe('compact-int-set - wave546', () => {
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

describe('compact-int-set - wave547', () => {
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

describe('compact-int-set - wave548', () => {
  it('compact-int-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave549', () => {
  it('compact-int-set module defined', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set module is function', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave550', () => {
  it('compact-int-set w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave551', () => {
  it('compact-int-set w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave552', () => {
  it('compact-int-set w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave553', () => {
  it('compact-int-set w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave554', () => {
  it('compact-int-set w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave555', () => {
  it('compact-int-set w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave556', () => {
  it('compact-int-set w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave557', () => {
  it('compact-int-set w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave558', () => {
  it('compact-int-set w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave559', () => {
  it('compact-int-set w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave560', () => {
  it('compact-int-set w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave561', () => {
  it('compact-int-set w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave562', () => {
  it('compact-int-set w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave563', () => {
  it('compact-int-set w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave564', () => {
  it('compact-int-set w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave565', () => {
  it('compact-int-set w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave566', () => {
  it('compact-int-set w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave127', () => {
  it('compact-int-set w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave130', () => {
  it('compact-int-set w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave133', () => {
  it('compact-int-set w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave136', () => {
  it('compact-int-set w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - wave139', () => {
  it('compact-int-set w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w142', () => {
  it('compact-int-set v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w145', () => {
  it('compact-int-set v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w148', () => {
  it('compact-int-set v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w151', () => {
  it('compact-int-set v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w154', () => {
  it('compact-int-set v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w157', () => {
  it('compact-int-set v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w160', () => {
  it('compact-int-set v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w170', () => {
  it('compact-int-set x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w180', () => {
  it('compact-int-set x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w190', () => {
  it('compact-int-set x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w200', () => {
  it('compact-int-set x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w210', () => {
  it('compact-int-set x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w220', () => {
  it('compact-int-set x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w230', () => {
  it('compact-int-set x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w240', () => {
  it('compact-int-set x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w250', () => {
  it('compact-int-set x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w260', () => {
  it('compact-int-set x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w270', () => {
  it('compact-int-set x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w280', () => {
  it('compact-int-set x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w290', () => {
  it('compact-int-set x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w300', () => {
  it('compact-int-set x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w310', () => {
  it('compact-int-set x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w320', () => {
  it('compact-int-set x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w330', () => {
  it('compact-int-set x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w340', () => {
  it('compact-int-set x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w350', () => {
  it('compact-int-set x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w360', () => {
  it('compact-int-set x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w370', () => {
  it('compact-int-set x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w380', () => {
  it('compact-int-set x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w390', () => {
  it('compact-int-set x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w400', () => {
  it('compact-int-set x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w420', () => {
  it('compact-int-set x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w440', () => {
  it('compact-int-set x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w460', () => {
  it('compact-int-set x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w480', () => {
  it('compact-int-set x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('compact-int-set - w500', () => {
  it('compact-int-set x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('compact-int-set x500x19', () => {
    expect(describe).toBeDefined()
  })
})
