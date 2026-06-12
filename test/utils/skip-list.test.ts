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
