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
