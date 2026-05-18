import { describe, it, expect } from 'vitest'
import { ScapegoatTree } from '../../src/utils/scapegoat-tree.js'

// ─── Constructor ─────────────────────────────────────────────────────────

describe('ScapegoatTree - constructor', () => {
  it('creates an empty tree with default alpha and comparator', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('accepts a custom alpha parameter', () => {
    const tree = new ScapegoatTree<number, string>(0.75)
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.size).toBe(2)
  })

  it('accepts a custom comparator', () => {
    const tree = new ScapegoatTree<number, string>(0.6, (a, b) => b - a)
    tree.insert(1, 'a')
    tree.insert(3, 'c')
    tree.insert(2, 'b')
    expect(tree.keys()).toEqual([3, 2, 1])
  })

  it('throws for alpha <= 0.5', () => {
    expect(() => new ScapegoatTree<number, string>(0.5)).toThrow(RangeError)
  })

  it('throws for alpha >= 1', () => {
    expect(() => new ScapegoatTree<number, string>(1)).toThrow(RangeError)
  })
})

// ─── Insert and Lookup ───────────────────────────────────────────────────

describe('ScapegoatTree - insert and get', () => {
  it('inserts a single element and retrieves it', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.get(10)).toBe('ten')
    expect(tree.size).toBe(1)
  })

  it('returns undefined for missing key', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.get(99)).toBeUndefined()
  })

  it('returns undefined on empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.get(1)).toBeUndefined()
  })

  it('updates value on duplicate key', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(10, 'TEN')
    expect(tree.size).toBe(1)
    expect(tree.get(10)).toBe('TEN')
  })
})

// ─── Has ─────────────────────────────────────────────────────────────────

describe('ScapegoatTree - has', () => {
  it('returns true for existing key', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.has(10)).toBe(true)
  })

  it('returns false for missing key', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.has(99)).toBe(false)
  })

  it('returns false on empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.has(1)).toBe(false)
  })
})

// ─── Delete ──────────────────────────────────────────────────────────────

describe('ScapegoatTree - delete', () => {
  it('deletes a leaf node', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    expect(tree.delete(5)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.has(5)).toBe(false)
  })

  it('deletes an internal node with two children', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    expect(tree.delete(10)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.has(10)).toBe(false)
  })

  it('deletes the root node (only element)', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.delete(10)).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('returns false for non-existent key', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('returns false on empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.delete(1)).toBe(false)
  })
})

// ─── Min / Max ───────────────────────────────────────────────────────────

describe('ScapegoatTree - min and max', () => {
  it('returns undefined for min on empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.min()).toBeUndefined()
  })

  it('returns undefined for max on empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.max()).toBeUndefined()
  })

  it('returns correct min and max', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    tree.insert(1, 'one')
    tree.insert(20, 'twenty')
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(20)
  })

  it('updates min and max after deletions', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    tree.delete(1)
    expect(tree.min()).toBe(2)
    tree.delete(3)
    expect(tree.max()).toBe(2)
  })
})

// ─── In-Order Traversal ─────────────────────────────────────────────────

describe('ScapegoatTree - inOrderTraversal', () => {
  it('returns empty array for empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.inOrderTraversal()).toEqual([])
  })

  it('returns entries in sorted order', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    tree.insert(1, 'one')
    tree.insert(7, 'seven')
    expect(tree.inOrderTraversal()).toEqual([
      { key: 1, value: 'one' },
      { key: 5, value: 'five' },
      { key: 7, value: 'seven' },
      { key: 10, value: 'ten' },
      { key: 15, value: 'fifteen' },
    ])
  })
})

// ─── Keys and Values ────────────────────────────────────────────────────

describe('ScapegoatTree - keys and values', () => {
  it('returns sorted keys array', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(3, 'c')
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.keys()).toEqual([1, 2, 3])
  })

  it('returns values in key order', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(3, 'c')
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.values()).toEqual(['a', 'b', 'c'])
  })
})

// ─── Size Tracking ──────────────────────────────────────────────────────

describe('ScapegoatTree - size tracking', () => {
  it('tracks size through inserts', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    expect(tree.size).toBe(3)
  })

  it('tracks size through deletes', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    tree.delete(2)
    expect(tree.size).toBe(2)
    tree.delete(1)
    tree.delete(3)
    expect(tree.size).toBe(0)
  })
})

// ─── Clear ──────────────────────────────────────────────────────────────

describe('ScapegoatTree - clear', () => {
  it('clears the tree', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.inOrderTraversal()).toEqual([])
  })

  it('tree is usable after clear', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'a')
    tree.clear()
    tree.insert(2, 'b')
    expect(tree.size).toBe(1)
    expect(tree.get(2)).toBe('b')
  })
})

// ─── Height ─────────────────────────────────────────────────────────────

describe('ScapegoatTree - height', () => {
  it('returns 0 for empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.height()).toBe(0)
  })

  it('returns 1 for single node', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.height()).toBe(1)
  })

  it('stays O(log n) after sequential inserts (1..100)', () => {
    const tree = new ScapegoatTree<number, number>()
    for (let i = 1; i <= 100; i++) {
      tree.insert(i, i)
    }
    expect(tree.height()).toBeLessThanOrEqual(20)
  })
})

// ─── Sequential Inserts ─────────────────────────────────────────────────

describe('ScapegoatTree - sequential inserts (1..100)', () => {
  it('maintains BST property after worst-case sequential insert', () => {
    const tree = new ScapegoatTree<number, number>()
    for (let i = 1; i <= 100; i++) {
      tree.insert(i, i * 10)
    }
    expect(tree.size).toBe(100)
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(100)
    const keys = tree.keys()
    for (let i = 0; i < 100; i++) {
      expect(keys[i]).toBe(i + 1)
    }
    for (let i = 1; i <= 100; i++) {
      expect(tree.get(i)).toBe(i * 10)
    }
  })
})

// ─── Random Inserts ─────────────────────────────────────────────────────

describe('ScapegoatTree - random inserts', () => {
  it('handles random order inserts and maintains sorted order', () => {
    const tree = new ScapegoatTree<number, string>()
    const values = [15, 7, 23, 4, 11, 19, 27, 2, 6, 9]
    for (const v of values) tree.insert(v, String(v))
    expect(tree.size).toBe(10)
    expect(tree.keys()).toEqual([2, 4, 6, 7, 9, 11, 15, 19, 23, 27])
  })
})

// ─── Delete Many Then Insert ────────────────────────────────────────────

describe('ScapegoatTree - delete many then insert (rebuild triggered)', () => {
  it('triggers rebuild after many deletions', () => {
    const tree = new ScapegoatTree<number, string>()
    for (let i = 1; i <= 20; i++) {
      tree.insert(i, String(i))
    }
    for (let i = 1; i <= 15; i++) {
      tree.delete(i)
    }
    expect(tree.size).toBe(5)
    for (let i = 16; i <= 20; i++) {
      expect(tree.has(i)).toBe(true)
    }
    tree.insert(100, 'hundred')
    expect(tree.has(100)).toBe(true)
    expect(tree.size).toBe(6)
  })
})

// ─── Custom Comparator (Reverse Order) ──────────────────────────────────

describe('ScapegoatTree - custom comparator (reverse order)', () => {
  it('stores and retrieves elements in reverse order', () => {
    const tree = new ScapegoatTree<number, string>(0.6, (a, b) => b - a)
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    expect(tree.keys()).toEqual([3, 2, 1])
    expect(tree.min()).toBe(3)
    expect(tree.max()).toBe(1)
  })

  it('deletes correctly with reverse comparator', () => {
    const tree = new ScapegoatTree<number, string>(0.6, (a, b) => b - a)
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    expect(tree.delete(2)).toBe(true)
    expect(tree.keys()).toEqual([3, 1])
  })
})

// ─── Alpha Balance ──────────────────────────────────────────────────────

describe('ScapegoatTree - alpha balance', () => {
  it('maintains balance with tight alpha', () => {
    const tree = new ScapegoatTree<number, number>(0.55)
    for (let i = 0; i < 200; i++) {
      tree.insert(i, i)
    }
    expect(tree.height()).toBeLessThanOrEqual(25)
  })

  it('maintains balance with loose alpha', () => {
    const tree = new ScapegoatTree<number, number>(0.9)
    for (let i = 0; i < 200; i++) {
      tree.insert(i, i)
    }
    expect(tree.height()).toBeLessThanOrEqual(30)
  })
})

// ─── String Keys ────────────────────────────────────────────────────────

describe('ScapegoatTree - string keys', () => {
  it('works with string keys and locale comparator', () => {
    const tree = new ScapegoatTree<string, number>(0.6, (a, b) =>
      a.localeCompare(b),
    )
    tree.insert('cherry', 3)
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    tree.insert('date', 4)
    expect(tree.keys()).toEqual(['apple', 'banana', 'cherry', 'date'])
    expect(tree.get('banana')).toBe(2)
    expect(tree.min()).toBe('apple')
    expect(tree.max()).toBe('date')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────────

describe('ScapegoatTree - edge cases', () => {
  it('handles negative numbers', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(-3, 'a')
    tree.insert(-1, 'b')
    tree.insert(-5, 'c')
    tree.insert(0, 'd')
    expect(tree.keys()).toEqual([-5, -3, -1, 0])
  })

  it('handles insert-delete-repeat cycles', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.size).toBe(1)
    tree.delete(10)
    expect(tree.size).toBe(0)
    tree.insert(10, 'ten')
    expect(tree.size).toBe(1)
    tree.delete(10)
    expect(tree.size).toBe(0)
  })

  it('handles deleting all elements to reach empty', () => {
    const tree = new ScapegoatTree<number, string>()
    for (let i = 1; i <= 5; i++) tree.insert(i, String(i))
    for (let i = 1; i <= 5; i++) tree.delete(i)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('handles large dataset (1000 elements)', () => {
    const tree = new ScapegoatTree<number, number>()
    for (let i = 0; i < 1000; i++) {
      tree.insert(i, i * 2)
    }
    expect(tree.size).toBe(1000)
    expect(tree.min()).toBe(0)
    expect(tree.max()).toBe(999)
    const keys = tree.keys()
    expect(keys[0]).toBe(0)
    expect(keys[999]).toBe(999)
  })
})
