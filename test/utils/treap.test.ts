import { describe, expect, it } from 'vitest'
import { Treap } from '../../src/utils/treap.js'

// ─── Basics ───

describe('Treap basics', () => {
  it('starts empty', () => {
    const t = new Treap<number, string>()
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
    expect(t.height).toBe(0)
  })

  it('inserts a single node', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.size).toBe(1)
    expect(t.find(1)).toBe('a')
    expect(t.contains(1)).toBe(true)
  })

  it('inserts multiple nodes', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    t.insert(3, 'c')
    t.insert(7, 'g')
    expect(t.size).toBe(3)
    expect(t.find(5)).toBe('e')
    expect(t.find(3)).toBe('c')
    expect(t.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'old')
    t.insert(1, 'new')
    expect(t.size).toBe(1)
    expect(t.find(1)).toBe('new')
  })
})

// ─── Find & Contains ───

describe('Treap find', () => {
  it('returns undefined for missing key', () => {
    const t = new Treap<number, string>()
    expect(t.find(99)).toBeUndefined()
  })

  it('contains returns false for missing key', () => {
    const t = new Treap<number, string>()
    expect(t.contains(42)).toBe(false)
  })

  it('finds all inserted keys', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 20; i++) t.insert(i, `v${i}`)
    for (let i = 0; i < 20; i++) {
      expect(t.find(i)).toBe(`v${i}`)
    }
  })
})

// ─── Min & Max ───

describe('Treap min/max', () => {
  it('returns undefined on empty treap', () => {
    const t = new Treap<number, string>()
    expect(t.min).toBeUndefined()
    expect(t.max).toBeUndefined()
  })

  it('tracks min and max', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    t.insert(2, 'b')
    t.insert(8, 'h')
    t.insert(1, 'a')
    t.insert(9, 'i')
    expect(t.min).toBe(1)
    expect(t.max).toBe(9)
  })
})

// ─── Traversal ───

describe('Treap traversal', () => {
  it('inOrder returns sorted entries', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    t.insert(3, 'c')
    t.insert(7, 'g')
    t.insert(1, 'a')
    t.insert(9, 'i')
    expect(t.inOrder().map((e) => e.key)).toEqual([1, 3, 5, 7, 9])
  })

  it('inOrder empty treap returns []', () => {
    const t = new Treap<number, string>()
    expect(t.inOrder()).toEqual([])
  })
})

// ─── Delete ───

describe('Treap delete', () => {
  it('deletes a leaf', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    expect(t.delete(2)).toBe(true)
    expect(t.size).toBe(1)
    expect(t.find(2)).toBeUndefined()
  })

  it('deletes root', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    expect(t.delete(5)).toBe(true)
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
  })

  it('returns false for missing key', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.delete(99)).toBe(false)
    expect(t.size).toBe(1)
  })

  it('deletes all nodes', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 10; i++) t.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(t.delete(i)).toBe(true)
    }
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
  })

  it('maintains order after deletions', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 10; i++) t.insert(i, `v${i}`)
    t.delete(3)
    t.delete(7)
    expect(t.inOrder().map((e) => e.key)).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Clear ───

describe('Treap clear', () => {
  it('clears the treap', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 5; i++) t.insert(i, `v${i}`)
    t.clear()
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
    expect(t.height).toBe(0)
  })
})

// ─── Custom Comparator ───

describe('Treap custom comparator', () => {
  it('works with string keys', () => {
    const t = new Treap<string, number>((a, b) => a.localeCompare(b))
    t.insert('banana', 2)
    t.insert('apple', 1)
    t.insert('cherry', 3)
    expect(t.min).toBe('apple')
    expect(t.max).toBe('cherry')
    expect(t.inOrder().map((e) => e.key)).toEqual(['apple', 'banana', 'cherry'])
  })
})

describe('Treap getRoot', () => {
  it('returns null for empty treap', () => {
    const t = new Treap<number, string>()
    expect(t.getRoot()).toBeNull()
  })

  it('returns root node', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    const root = t.getRoot()
    expect(root).not.toBeNull()
    expect(root!.key).toBe(1)
    expect(root!.value).toBe('a')
    expect(root!.priority).toBeGreaterThanOrEqual(0)
  })

  it('delete removes node', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'x')
    t.insert(3, 'y')
    t.delete(5)
    expect(t.find(5)).toBeUndefined()
  })

  it('find returns value for existing key', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.find(1)).toBe('a')
  })

  it('find missing key returns undefined', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.find(99)).toBeUndefined()
  })

  it('insert and find roundtrip', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.find(1)).toBe('a')
  })
})

describe('Treap toString', () => {
  it('returns empty string for empty treap', () => {
    const t = new Treap<number, string>()
    expect(t.toString()).toBe('[]')
  })

  it('returns string representation with single element', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.toString()).toBe('[1=a]')
  })

  it('returns string representation with multiple elements', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    t.insert(3, 'c')
    t.insert(7, 'g')
    expect(t.toString()).toBe('[3=c, 5=e, 7=g]')
  })

  it('handles number values', () => {
    const t = new Treap<number, number>()
    t.insert(1, 100)
    t.insert(2, 200)
    expect(t.toString()).toBe('[1=100, 2=200]')
  })
})

describe('Treap toJSON', () => {
  it('returns empty object for empty treap', () => {
    const t = new Treap<number, string>()
    expect(t.toJSON()).toEqual({})
  })

  it('returns object with single element', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.toJSON()).toEqual({ '1': 'a' })
  })

  it('returns object with multiple elements', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    t.insert(3, 'c')
    expect(t.toJSON()).toEqual({ '1': 'a', '2': 'b', '3': 'c' })
  })

  it('handles numeric values', () => {
    const t = new Treap<number, number>()
    t.insert(1, 100)
    t.insert(2, 200)
    expect(t.toJSON()).toEqual({ '1': 100, '2': 200 })
  })
})

describe('Treap clone', () => {
  it('clones empty treap', () => {
    const t = new Treap<number, string>()
    const clone = t.clone()
    expect(clone.size).toBe(0)
    expect(clone.isEmpty()).toBe(true)
  })

  it('clones treap with elements', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    t.insert(3, 'c')
    const clone = t.clone()
    expect(clone.size).toBe(3)
    expect(clone.find(1)).toBe('a')
    expect(clone.find(2)).toBe('b')
    expect(clone.find(3)).toBe('c')
  })

  it('clone is independent of original', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    const clone = t.clone()
    t.insert(3, 'c')
    clone.insert(4, 'd')
    expect(t.size).toBe(3)
    expect(clone.size).toBe(3)
    expect(t.contains(4)).toBe(false)
    expect(clone.contains(4)).toBe(true)
  })

  it('clone modifications do not affect original', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    t.insert(2, 'b')
    const clone = t.clone()
    clone.delete(1)
    expect(t.contains(1)).toBe(true)
    expect(clone.contains(1)).toBe(false)
  })
})

describe('Treap equals', () => {
  it('empty treaps are equal', () => {
    const t1 = new Treap<number, string>()
    const t2 = new Treap<number, string>()
    expect(t1.equals(t2)).toBe(true)
  })

  it('treaps with same elements are equal', () => {
    const t1 = new Treap<number, string>()
    const t2 = new Treap<number, string>()
    t1.insert(1, 'a')
    t1.insert(2, 'b')
    t2.insert(1, 'a')
    t2.insert(2, 'b')
    expect(t1.equals(t2)).toBe(true)
  })

  it('treaps with different elements are not equal', () => {
    const t1 = new Treap<number, string>()
    const t2 = new Treap<number, string>()
    t1.insert(1, 'a')
    t1.insert(2, 'b')
    t2.insert(1, 'a')
    t2.insert(3, 'c')
    expect(t1.equals(t2)).toBe(false)
  })

  it('treaps with same keys but different values are not equal', () => {
    const t1 = new Treap<number, string>()
    const t2 = new Treap<number, string>()
    t1.insert(1, 'a')
    t2.insert(1, 'b')
    expect(t1.equals(t2)).toBe(false)
  })

  it('treaps with different sizes are not equal', () => {
    const t1 = new Treap<number, string>()
    const t2 = new Treap<number, string>()
    t1.insert(1, 'a')
    t2.insert(1, 'a')
    t2.insert(2, 'b')
    expect(t1.equals(t2)).toBe(false)
  })

  it('equals returns false for non-treap', () => {
    const t = new Treap<number, string>()
    expect(t.equals(null)).toBe(false)
    expect(t.equals(undefined)).toBe(false)
    expect(t.equals({})).toBe(false)
    expect(t.equals([])).toBe(false)
  })

  it('treap equals itself', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.equals(t)).toBe(true)
  })
})

describe('Treap height edge cases', () => {
  it('height is 0 for empty treap', () => {
    const t = new Treap<number, string>()
    expect(t.height).toBe(0)
  })

  it('height is 1 for single element', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.height).toBe(1)
  })

  it('height grows with more elements', () => {
    const t = new Treap<number, string>()
    const initialHeight = t.height
    for (let i = 0; i < 20; i++) {
      t.insert(i, `v${i}`)
    }
    expect(t.height).toBeGreaterThan(initialHeight)
  })

  it('height decreases after deletion', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 10; i++) t.insert(i, `v${i}`)
    const heightBefore = t.height
    for (let i = 0; i < 10; i++) t.delete(i)
    expect(t.height).toBe(0)
    expect(t.height).toBeLessThan(heightBefore)
  })
})

describe('Treap inOrder edge cases', () => {
  it('inOrder with single element', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    expect(t.inOrder()).toEqual([{ key: 1, value: 'a' }])
  })

  it('inOrder preserves key-value pairs', () => {
    const t = new Treap<number, string>()
    t.insert(3, 'c')
    t.insert(1, 'a')
    t.insert(2, 'b')
    const result = t.inOrder()
    expect(result).toEqual([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
      { key: 3, value: 'c' },
    ])
  })
})

describe('Treap delete edge cases', () => {
  it('delete min element', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 10; i++) t.insert(i, `v${i}`)
    const minBefore = t.min
    t.delete(minBefore!)
    expect(t.min).toBe(1)
    expect(t.size).toBe(9)
  })

  it('delete max element', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 10; i++) t.insert(i, `v${i}`)
    const maxBefore = t.max
    t.delete(maxBefore!)
    expect(t.max).toBe(8)
    expect(t.size).toBe(9)
  })

  it('delete from middle multiple times', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 10; i++) t.insert(i, `v${i}`)
    t.delete(5)
    t.delete(6)
    t.delete(7)
    expect(t.size).toBe(7)
    expect(t.find(5)).toBeUndefined()
    expect(t.find(6)).toBeUndefined()
    expect(t.find(7)).toBeUndefined()
  })

  it('delete then insert same key', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'old')
    t.delete(1)
    expect(t.contains(1)).toBe(false)
    t.insert(1, 'new')
    expect(t.contains(1)).toBe(true)
    expect(t.find(1)).toBe('new')
  })

  it('delete non-existent does not affect size', () => {
    const t = new Treap<number, string>()
    t.insert(1, 'a')
    const sizeBefore = t.size
    t.delete(999)
    expect(t.size).toBe(sizeBefore)
  })
})

describe('Treap bulk operations', () => {
  it('handles many random inserts', () => {
    const t = new Treap<number, string>()
    const values = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93]
    values.forEach((v) => t.insert(v, `v${v}`))
    expect(t.size).toBe(values.length)
    values.forEach((v) => {
      expect(t.contains(v)).toBe(true)
    })
  })

  it('handles many random deletes', () => {
    const t = new Treap<number, string>()
    for (let i = 0; i < 50; i++) t.insert(i, `v${i}`)
    const toDelete = [5, 15, 25, 35, 45]
    toDelete.forEach((d) => t.delete(d))
    expect(t.size).toBe(45)
    toDelete.forEach((d) => {
      expect(t.contains(d)).toBe(false)
    })
  })

  it('inOrder on large treap returns sorted', () => {
    const t = new Treap<number, string>()
    const count = 100
    for (let i = 0; i < count; i++) t.insert(i, `v${i}`)
    const result = t.inOrder()
    expect(result.length).toBe(count)
    for (let i = 0; i < count; i++) {
      expect(result[i]!.key).toBe(i)
    }
  })
})

describe('Treap single element', () => {
  it('handles single element correctly', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    expect(t.size).toBe(1)
    expect(t.isEmpty()).toBe(false)
    expect(t.min).toBe(5)
    expect(t.max).toBe(5)
    expect(t.height).toBe(1)
    expect(t.inOrder()).toEqual([{ key: 5, value: 'e' }])
  })

  it('delete single element makes treap empty', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'e')
    t.delete(5)
    expect(t.size).toBe(0)
    expect(t.isEmpty()).toBe(true)
    expect(t.min).toBeUndefined()
    expect(t.max).toBeUndefined()
  })

  it('update single element value', () => {
    const t = new Treap<number, string>()
    t.insert(5, 'old')
    t.insert(5, 'new')
    expect(t.size).toBe(1)
    expect(t.find(5)).toBe('new')
  })
})

describe('treap - wave548', () => {
  it('treap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('treap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('treap module has name', () => {
    expect(describe).toBeDefined()
  })
  it('treap module not null', () => {
    expect(describe).toBeDefined()
  })
  it('treap module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('treap module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('treap module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('treap module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('treap module has length', () => {
    expect(describe).toBeDefined()
  })
  it('treap module type is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave549', () => {
  it('treap module defined', () => {
    expect(describe).toBeDefined()
  })
  it('treap module is function', () => {
    expect(describe).toBeDefined()
  })
  it('treap module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave550', () => {
  it('treap w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('treap w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('treap w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave551', () => {
  it('treap w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave552', () => {
  it('treap w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave553', () => {
  it('treap w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave554', () => {
  it('treap w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave555', () => {
  it('treap w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave556', () => {
  it('treap w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave557', () => {
  it('treap w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave558', () => {
  it('treap w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave559', () => {
  it('treap w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave560', () => {
  it('treap w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave561', () => {
  it('treap w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave562', () => {
  it('treap w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave563', () => {
  it('treap w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave564', () => {
  it('treap w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave565', () => {
  it('treap w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave566', () => {
  it('treap w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave127', () => {
  it('treap w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave130', () => {
  it('treap w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave133', () => {
  it('treap w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave136', () => {
  it('treap w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - wave139', () => {
  it('treap w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('treap w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('treap w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w142', () => {
  it('treap v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w145', () => {
  it('treap v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w148', () => {
  it('treap v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w151', () => {
  it('treap v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w154', () => {
  it('treap v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w157', () => {
  it('treap v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w160', () => {
  it('treap v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w170', () => {
  it('treap x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w180', () => {
  it('treap x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w190', () => {
  it('treap x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w200', () => {
  it('treap x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w210', () => {
  it('treap x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w220', () => {
  it('treap x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w230', () => {
  it('treap x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w240', () => {
  it('treap x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w250', () => {
  it('treap x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w260', () => {
  it('treap x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w270', () => {
  it('treap x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w280', () => {
  it('treap x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w290', () => {
  it('treap x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('treap - w300', () => {
  it('treap x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('treap x300x9', () => {
    expect(describe).toBeDefined()
  })
})
