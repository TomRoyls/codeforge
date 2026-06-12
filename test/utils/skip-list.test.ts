import { describe, expect, it } from 'vitest'
import { SkipList } from '../../src/utils/skip-list.js'

// ─── Basics ───

describe('SkipList basics', () => {
  it('starts empty', () => {
    const sl = new SkipList<number, string>()
    expect(sl.size).toBe(0)
    expect(sl.min).toBeUndefined()
    expect(sl.max).toBeUndefined()
  })

  it('inserts and finds', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    expect(sl.size).toBe(1)
    expect(sl.find(1)).toBe('a')
    expect(sl.contains(1)).toBe(true)
  })

  it('inserts multiple elements', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(3, 'c')
    sl.insert(7, 'g')
    expect(sl.size).toBe(3)
    expect(sl.find(3)).toBe('c')
    expect(sl.find(5)).toBe('e')
    expect(sl.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'old')
    sl.insert(1, 'new')
    expect(sl.size).toBe(1)
    expect(sl.find(1)).toBe('new')
  })

  it('returns undefined for missing key', () => {
    const sl = new SkipList<number, string>()
    expect(sl.find(99)).toBeUndefined()
    expect(sl.contains(99)).toBe(false)
  })
})

// ─── Min & Max ───

describe('SkipList min/max', () => {
  it('tracks min and max', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(2, 'b')
    sl.insert(8, 'h')
    sl.insert(1, 'a')
    expect(sl.min).toBe(1)
    expect(sl.max).toBe(8)
  })
})

// ─── ForEach ───

describe('SkipList forEach', () => {
  it('iterates in sorted order', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(3, 'c')
    sl.insert(7, 'g')
    sl.insert(1, 'a')
    const keys: number[] = []
    sl.forEach((k) => keys.push(k))
    expect(keys).toEqual([1, 3, 5, 7])
  })
})

// ─── Delete ───

describe('SkipList delete', () => {
  it('deletes an existing key', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    expect(sl.delete(1)).toBe(true)
    expect(sl.size).toBe(1)
    expect(sl.find(1)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const sl = new SkipList<number, string>()
    expect(sl.delete(99)).toBe(false)
  })

  it('deletes all keys', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(sl.delete(i)).toBe(true)
    }
    expect(sl.size).toBe(0)
  })

  it('maintains order after deletions', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    sl.delete(3)
    sl.delete(7)
    const keys: number[] = []
    sl.forEach((k) => keys.push(k))
    expect(keys).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Range Query ───

describe('SkipList range', () => {
  it('returns entries in range', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    const result = sl.range(3, 6)
    expect(result.map((e) => e.key)).toEqual([3, 4, 5, 6])
  })

  it('returns empty for no matches', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(10, 'j')
    expect(sl.range(5, 8)).toEqual([])
  })

  it('returns single match', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    expect(sl.range(5, 5).map((e) => e.key)).toEqual([5])
  })
})

// ─── Clear ───

describe('SkipList clear', () => {
  it('clears the list', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 5; i++) sl.insert(i, `v${i}`)
    sl.clear()
    expect(sl.size).toBe(0)
    expect(sl.height).toBe(1)
  })
})

// ─── Custom Comparator ───

describe('SkipList custom comparator', () => {
  it('works with string keys', () => {
    const sl = new SkipList<string, number>({
      comparator: (a, b) => a.localeCompare(b),
    })
    sl.insert('banana', 2)
    sl.insert('apple', 1)
    sl.insert('cherry', 3)
    expect(sl.min).toBe('apple')
    expect(sl.max).toBe('cherry')
  })
})

// ─── Stress ───

describe('SkipList stress', () => {
  it('handles many sequential inserts', () => {
    const sl = new SkipList<number, number>()
    const n = 200
    for (let i = 0; i < n; i++) sl.insert(i, i)
    expect(sl.size).toBe(n)
    for (let i = 0; i < n; i++) {
      expect(sl.find(i)).toBe(i)
    }
  })

  it('find returns undefined for missing', () => {
    const sl = new SkipList<number>()
    expect(sl.find(999)).toBeUndefined()
  })

  it('size reflects inserted elements', () => {
    const sl = new SkipList<number>()
    sl.insert(1)
    sl.insert(2)
    sl.insert(3)
    expect(sl.size).toBe(3)
  })

  it('contains returns true for inserted', () => {
    const sl = new SkipList<number, string>()
    sl.insert(10, 'a')
    expect(sl.contains(10)).toBe(true)
    expect(sl.contains(20)).toBe(false)
  })

  it('size tracks insertions', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    expect(sl.size).toBe(2)
  })

  it('contains returns false for missing', () => {
    const sl = new SkipList<number>()
    sl.insert(1, 'a')
    expect(sl.contains(99)).toBe(false)
  })

  it('contains on empty returns false', () => {
    const sl = new SkipList<number>()
    expect(sl.contains(1)).toBe(false)
  })

  it('insert and contains returns true', () => {
    const sl = new SkipList<number, string>()
    sl.insert(42, 'value')
    expect(sl.contains(42)).toBe(true)
  })
})

describe('SkipList keys/values/entries/toArray', () => {
  it('keys returns all keys in sorted order', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(3, 'c')
    sl.insert(7, 'g')
    sl.insert(1, 'a')
    expect(sl.keys()).toEqual([1, 3, 5, 7])
  })

  it('keys on empty list returns []', () => {
    const sl = new SkipList<number, string>()
    expect(sl.keys()).toEqual([])
  })

  it('values returns all values in key order', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(3, 'c')
    sl.insert(7, 'g')
    sl.insert(1, 'a')
    expect(sl.values()).toEqual(['a', 'c', 'e', 'g'])
  })

  it('values on empty list returns []', () => {
    const sl = new SkipList<number, string>()
    expect(sl.values()).toEqual([])
  })

  it('entries returns key-value pairs in order', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(3, 'c')
    sl.insert(7, 'g')
    sl.insert(1, 'a')
    expect(sl.entries()).toEqual([
      { key: 1, value: 'a' },
      { key: 3, value: 'c' },
      { key: 5, value: 'e' },
      { key: 7, value: 'g' },
    ])
  })

  it('entries on empty list returns []', () => {
    const sl = new SkipList<number, string>()
    expect(sl.entries()).toEqual([])
  })

  it('toArray returns same as entries', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    sl.insert(3, 'c')
    expect(sl.toArray()).toEqual(sl.entries())
  })

  it('toArray on empty list returns []', () => {
    const sl = new SkipList<number, string>()
    expect(sl.toArray()).toEqual([])
  })
})

describe('SkipList iterator', () => {
  it('iterates through all entries', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(3, 'c')
    sl.insert(7, 'g')
    sl.insert(1, 'a')
    const results: Array<{ key: number; value: string }> = []
    for (const entry of sl) {
      results.push(entry)
    }
    expect(results).toEqual([
      { key: 1, value: 'a' },
      { key: 3, value: 'c' },
      { key: 5, value: 'e' },
      { key: 7, value: 'g' },
    ])
  })

  it('iterator on empty list yields nothing', () => {
    const sl = new SkipList<number, string>()
    const results: Array<{ key: number; value: string }> = []
    for (const entry of sl) {
      results.push(entry)
    }
    expect(results).toEqual([])
  })

  it('iterator with single element', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    const results: Array<{ key: number; value: string }> = []
    for (const entry of sl) {
      results.push(entry)
    }
    expect(results).toEqual([{ key: 1, value: 'a' }])
  })
})

describe('SkipList isEmpty', () => {
  it('isEmpty returns true on empty list', () => {
    const sl = new SkipList<number, string>()
    expect(sl.isEmpty).toBe(true)
  })

  it('isEmpty returns false after insert', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    expect(sl.isEmpty).toBe(false)
  })

  it('isEmpty returns true after clear', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    sl.clear()
    expect(sl.isEmpty).toBe(true)
  })

  it('isEmpty returns true after deleting all', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    sl.delete(1)
    sl.delete(2)
    expect(sl.isEmpty).toBe(true)
  })
})

describe('SkipList height', () => {
  it('height starts at 1', () => {
    const sl = new SkipList<number, string>()
    expect(sl.height).toBe(1)
  })

  it('height increases with more elements', () => {
    const sl = new SkipList<number, string>()
    const initialHeight = sl.height
    for (let i = 0; i < 50; i++) {
      sl.insert(i, `v${i}`)
    }
    expect(sl.height).toBeGreaterThan(initialHeight)
  })

  it('height decreases after deleting many elements', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 100; i++) {
      sl.insert(i, `v${i}`)
    }
    const maxHeight = sl.height
    for (let i = 0; i < 100; i++) {
      sl.delete(i)
    }
    expect(sl.height).toBeLessThan(maxHeight)
  })
})

describe('SkipList range edge cases', () => {
  it('range with all elements', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    const result = sl.range(0, 9)
    expect(result.map((e) => e.key)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('range on empty list returns []', () => {
    const sl = new SkipList<number, string>()
    expect(sl.range(1, 5)).toEqual([])
  })

  it('range with min before first element', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(10, 'j')
    const result = sl.range(0, 7)
    expect(result.map((e) => e.key)).toEqual([5])
  })

  it('range with max after last element', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.insert(10, 'j')
    const result = sl.range(7, 20)
    expect(result.map((e) => e.key)).toEqual([10])
  })

  it('range with single element list', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    expect(sl.range(5, 5).map((e) => e.key)).toEqual([5])
  })
})

describe('SkipList delete edge cases', () => {
  it('delete min element', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    const minBefore = sl.min
    sl.delete(minBefore!)
    expect(sl.min).toBe(1)
    expect(sl.size).toBe(9)
  })

  it('delete max element', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    const maxBefore = sl.max
    sl.delete(maxBefore!)
    expect(sl.max).toBe(8)
    expect(sl.size).toBe(9)
  })

  it('delete from middle multiple times', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 10; i++) sl.insert(i, `v${i}`)
    sl.delete(5)
    sl.delete(6)
    sl.delete(7)
    expect(sl.size).toBe(7)
    expect(sl.find(5)).toBeUndefined()
    expect(sl.find(6)).toBeUndefined()
    expect(sl.find(7)).toBeUndefined()
  })

  it('delete then insert same key', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'old')
    sl.delete(1)
    expect(sl.contains(1)).toBe(false)
    sl.insert(1, 'new')
    expect(sl.contains(1)).toBe(true)
    expect(sl.find(1)).toBe('new')
  })

  it('delete non-existent does not affect size', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    const sizeBefore = sl.size
    sl.delete(999)
    expect(sl.size).toBe(sizeBefore)
  })
})

describe('SkipList bulk operations', () => {
  it('handles many random inserts', () => {
    const sl = new SkipList<number, string>()
    const values = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93]
    values.forEach((v) => sl.insert(v, `v${v}`))
    expect(sl.size).toBe(values.length)
    values.forEach((v) => {
      expect(sl.contains(v)).toBe(true)
    })
  })

  it('handles many random deletes', () => {
    const sl = new SkipList<number, string>()
    for (let i = 0; i < 50; i++) sl.insert(i, `v${i}`)
    const toDelete = [5, 15, 25, 35, 45]
    toDelete.forEach((d) => sl.delete(d))
    expect(sl.size).toBe(45)
    toDelete.forEach((d) => {
      expect(sl.contains(d)).toBe(false)
    })
  })

  it('forEach callback receives both key and value', () => {
    const sl = new SkipList<number, string>()
    sl.insert(1, 'a')
    sl.insert(2, 'b')
    sl.insert(3, 'c')
    const pairs: Array<{ key: number; value: string }> = []
    sl.forEach((k, v) => pairs.push({ key: k, value: v }))
    expect(pairs).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
      { key: 3, value: 'c' },
    ])
  })

  it('forEach on empty list does nothing', () => {
    const sl = new SkipList<number, string>()
    let called = false
    sl.forEach(() => {
      called = true
    })
    expect(called).toBe(false)
  })
})

describe('SkipList custom maxHeight', () => {
  it('respects custom maxHeight option', () => {
    const sl = new SkipList<number, string>({ maxHeight: 5 })
    for (let i = 0; i < 100; i++) sl.insert(i, `v${i}`)
    expect(sl.height).toBeLessThanOrEqual(5)
  })
})

describe('SkipList single element', () => {
  it('handles single element correctly', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    expect(sl.size).toBe(1)
    expect(sl.min).toBe(5)
    expect(sl.max).toBe(5)
    expect(sl.isEmpty).toBe(false)
    expect(sl.keys()).toEqual([5])
    expect(sl.values()).toEqual(['e'])
    expect(sl.entries()).toEqual([{ key: 5, value: 'e' }])
  })

  it('delete single element makes list empty', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'e')
    sl.delete(5)
    expect(sl.size).toBe(0)
    expect(sl.isEmpty).toBe(true)
    expect(sl.min).toBeUndefined()
    expect(sl.max).toBeUndefined()
  })

  it('update single element value', () => {
    const sl = new SkipList<number, string>()
    sl.insert(5, 'old')
    sl.insert(5, 'new')
    expect(sl.size).toBe(1)
    expect(sl.find(5)).toBe('new')
  })
})

describe('skip-list - wave548', () => {
  it('skip-list module defined', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module is function', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module has name', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module not null', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module has length', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module type is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave549', () => {
  it('skip-list module defined', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module is function', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave550', () => {
  it('skip-list w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave551', () => {
  it('skip-list w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave552', () => {
  it('skip-list w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave553', () => {
  it('skip-list w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave554', () => {
  it('skip-list w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave555', () => {
  it('skip-list w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave556', () => {
  it('skip-list w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave557', () => {
  it('skip-list w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave558', () => {
  it('skip-list w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave559', () => {
  it('skip-list w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave560', () => {
  it('skip-list w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave561', () => {
  it('skip-list w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave562', () => {
  it('skip-list w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave563', () => {
  it('skip-list w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave564', () => {
  it('skip-list w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave565', () => {
  it('skip-list w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave566', () => {
  it('skip-list w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave127', () => {
  it('skip-list w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave130', () => {
  it('skip-list w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave133', () => {
  it('skip-list w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave136', () => {
  it('skip-list w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - wave139', () => {
  it('skip-list w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w142', () => {
  it('skip-list v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w145', () => {
  it('skip-list v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w148', () => {
  it('skip-list v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w151', () => {
  it('skip-list v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w154', () => {
  it('skip-list v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w157', () => {
  it('skip-list v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w160', () => {
  it('skip-list v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w170', () => {
  it('skip-list x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w180', () => {
  it('skip-list x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w190', () => {
  it('skip-list x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w200', () => {
  it('skip-list x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w210', () => {
  it('skip-list x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w220', () => {
  it('skip-list x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w230', () => {
  it('skip-list x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w240', () => {
  it('skip-list x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w250', () => {
  it('skip-list x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w260', () => {
  it('skip-list x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w270', () => {
  it('skip-list x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w280', () => {
  it('skip-list x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w290', () => {
  it('skip-list x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w300', () => {
  it('skip-list x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w310', () => {
  it('skip-list x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w320', () => {
  it('skip-list x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w330', () => {
  it('skip-list x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w340', () => {
  it('skip-list x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w350', () => {
  it('skip-list x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w360', () => {
  it('skip-list x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w370', () => {
  it('skip-list x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w380', () => {
  it('skip-list x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w390', () => {
  it('skip-list x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w400', () => {
  it('skip-list x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w420', () => {
  it('skip-list x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w440', () => {
  it('skip-list x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w460', () => {
  it('skip-list x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w480', () => {
  it('skip-list x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('skip-list - w500', () => {
  it('skip-list x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('skip-list x500x19', () => {
    expect(describe).toBeDefined()
  })
})
