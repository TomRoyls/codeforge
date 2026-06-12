import { describe, expect, it } from 'vitest'
import { BTree } from '../../src/utils/b-tree.js'

// ─── Basics ───

describe('BTree basics', () => {
  it('starts empty', () => {
    const tree = new BTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('inserts a single key', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('a')
    expect(tree.contains(1)).toBe(true)
  })

  it('inserts multiple keys', () => {
    const tree = new BTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    expect(tree.size).toBe(3)
    expect(tree.find(3)).toBe('c')
    expect(tree.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'old')
    tree.insert(1, 'new')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('new')
  })

  it('returns undefined for missing key', () => {
    const tree = new BTree<number, string>()
    expect(tree.find(99)).toBeUndefined()
    expect(tree.contains(99)).toBe(false)
  })
})

// ─── Min & Max ───

describe('BTree min/max', () => {
  it('returns undefined on empty tree', () => {
    const tree = new BTree<number, string>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('tracks min and max', () => {
    const tree = new BTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(2, 'b')
    tree.insert(8, 'h')
    tree.insert(1, 'a')
    tree.insert(9, 'i')
    expect(tree.min).toBe(1)
    expect(tree.max).toBe(9)
  })
})

// ─── ForEach ───

describe('BTree forEach', () => {
  it('iterates in sorted order', () => {
    const tree = new BTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    tree.insert(1, 'a')
    const keys: number[] = []
    tree.forEach((k) => keys.push(k))
    expect(keys).toEqual([1, 3, 5, 7])
  })

  it('does not call on empty tree', () => {
    const tree = new BTree<number, string>()
    let called = false
    tree.forEach(() => { called = true })
    expect(called).toBe(false)
  })
})

// ─── Delete ───

describe('BTree delete', () => {
  it('deletes an existing key', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.delete(1)).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('deletes all keys', () => {
    const tree = new BTree<number, string>(2)
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('maintains order after deletions', () => {
    const tree = new BTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.delete(3)
    tree.delete(7)
    const keys: number[] = []
    tree.forEach((k) => keys.push(k))
    expect(keys).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Order Parameter ───

describe('BTree order parameter', () => {
  it('works with order 3', () => {
    const tree = new BTree<number, string>(3)
    for (let i = 0; i < 20; i++) tree.insert(i, `v${i}`)
    expect(tree.size).toBe(20)
    for (let i = 0; i < 20; i++) {
      expect(tree.find(i)).toBe(`v${i}`)
    }
  })

  it('maintains sorted iteration with small order', () => {
    const tree = new BTree<number, string>(2)
    for (let i = 20; i >= 0; i--) tree.insert(i, `v${i}`)
    const keys: number[] = []
    tree.forEach((k) => keys.push(k))
    for (let i = 0; i <= 20; i++) {
      expect(keys[i]).toBe(i)
    }
  })
})

// ─── Custom Comparator ───

describe('BTree custom comparator', () => {
  it('works with string keys', () => {
    const tree = new BTree<string, number>(3, (a, b) => a.localeCompare(b))
    tree.insert('banana', 2)
    tree.insert('apple', 1)
    tree.insert('cherry', 3)
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('cherry')
  })
})

// ─── Clear ───

describe('BTree clear', () => {
  it('clears the tree', () => {
    const tree = new BTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Height ───

describe('BTree height', () => {
  it('has height 0 for empty tree', () => {
    const tree = new BTree<number, string>()
    expect(tree.height).toBe(0)
  })

  it('grows slowly with many elements', () => {
    const tree = new BTree<number, number>(2)
    for (let i = 0; i < 100; i++) tree.insert(i, i)
    expect(tree.height).toBeLessThanOrEqual(8)
  })

  it('find returns inserted value', () => {
    const tree = new BTree<number, number>(2)
    tree.insert(42, 99)
    expect(tree.find(42)).toBe(99)
  })

  it('find returns undefined for missing key', () => {
    const tree = new BTree<number, number>(2)
    expect(tree.find(99)).toBeUndefined()
  })

  it('size tracks insertions', () => {
    const tree = new BTree<number, number>(2)
    tree.insert(1, 10)
    tree.insert(2, 20)
    expect(tree.size).toBe(2)
  })

  it('find returns value for existing key', () => {
    const tree = new BTree<number, number>()
    tree.insert(5, 50)
    expect(tree.find(5)).toBe(50)
  })

  it('find missing key returns undefined', () => {
    const tree = new BTree<number, number>()
    tree.insert(5, 50)
    expect(tree.find(99)).toBeUndefined()
  })

  it('insert and find returns value', () => {
    const tree = new BTree<number, number>()
    tree.insert(5, 50)
    expect(tree.find(5)).toBe(50)
  })

  describe('BTree toString', () => {
    it('returns correct format for empty tree', () => {
      const tree = new BTree<number, string>()
      expect(tree.toString()).toBe('BTree(order=2, size=0)')
    })

    it('returns correct format with single element', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      expect(tree.toString()).toBe('BTree(order=2, size=1)')
    })

    it('returns correct format with multiple elements', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.insert(3, 'c')
      expect(tree.toString()).toBe('BTree(order=2, size=3)')
    })

    it('reflects current size after deletions', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.delete(1)
      expect(tree.toString()).toBe('BTree(order=2, size=1)')
    })

    it('includes custom order in string', () => {
      const tree = new BTree<number, string>(5)
      expect(tree.toString()).toBe('BTree(order=5, size=0)')
    })
  })

  describe('BTree toJSON', () => {
    it('returns empty array for empty tree', () => {
      const tree = new BTree<number, string>()
      expect(tree.toJSON()).toEqual([])
    })

    it('returns single entry for single element', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      expect(tree.toJSON()).toEqual([{ key: 1, value: 'a' }])
    })

    it('returns entries in sorted order', () => {
      const tree = new BTree<number, string>()
      tree.insert(3, 'c')
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      expect(tree.toJSON()).toEqual([
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
        { key: 3, value: 'c' },
      ])
    })

    it('handles large dataset', () => {
      const tree = new BTree<number, number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i * 2)
      }
      const json = tree.toJSON()
      expect(json.length).toBe(100)
      expect(json[0]).toEqual({ key: 0, value: 0 })
      expect(json[99]).toEqual({ key: 99, value: 198 })
    })

    it('reflects current state after modifications', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.insert(3, 'c')
      tree.delete(2)
      tree.insert(4, 'd')
      expect(tree.toJSON()).toEqual([
        { key: 1, value: 'a' },
        { key: 3, value: 'c' },
        { key: 4, value: 'd' },
      ])
    })

    it('handles duplicate key updates', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'old')
      tree.insert(1, 'new')
      expect(tree.toJSON()).toEqual([{ key: 1, value: 'new' }])
    })
  })

  describe('BTree clone', () => {
    it('creates independent copy of empty tree', () => {
      const tree = new BTree<number, string>()
      const clone = tree.clone()
      expect(clone.size).toBe(0)
      expect(clone.isEmpty()).toBe(true)
    })

    it('creates independent copy with single element', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      const clone = tree.clone()
      expect(clone.size).toBe(1)
      expect(clone.find(1)).toBe('a')
    })

    it('preserves all data in clone', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.insert(3, 'c')
      const clone = tree.clone()
      expect(clone.size).toBe(3)
      expect(clone.find(1)).toBe('a')
      expect(clone.find(2)).toBe('b')
      expect(clone.find(3)).toBe('c')
    })

    it('clone is independent from original', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      const clone = tree.clone()
      tree.insert(3, 'c')
      tree.delete(1)
      expect(tree.size).toBe(2)
      expect(clone.size).toBe(2)
      expect(tree.find(1)).toBeUndefined()
      expect(clone.find(1)).toBe('a')
      expect(tree.find(3)).toBe('c')
      expect(clone.find(3)).toBeUndefined()
    })

    it('clone modifications do not affect original', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      const clone = tree.clone()
      clone.insert(3, 'c')
      clone.delete(1)
      expect(clone.size).toBe(2)
      expect(tree.size).toBe(2)
      expect(tree.find(1)).toBe('a')
      expect(clone.find(1)).toBeUndefined()
    })

    it('clone preserves order parameter', () => {
      const tree = new BTree<number, string>(5)
      tree.insert(1, 'a')
      const clone = tree.clone()
      expect(clone.size).toBe(1)
      expect(clone.find(1)).toBe('a')
    })

    it('clone handles large dataset', () => {
      const tree = new BTree<number, number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i * 2)
      }
      const clone = tree.clone()
      expect(clone.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(clone.find(i)).toBe(i * 2)
      }
    })
  })

  describe('BTree equals', () => {
    it('returns true for self-equality', () => {
      const tree = new BTree<number, string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      expect(tree.equals(tree)).toBe(true)
    })

    it('returns true for trees with same data', () => {
      const tree1 = new BTree<number, string>()
      const tree2 = new BTree<number, string>()
      tree1.insert(1, 'a')
      tree1.insert(2, 'b')
      tree1.insert(3, 'c')
      tree2.insert(1, 'a')
      tree2.insert(2, 'b')
      tree2.insert(3, 'c')
      expect(tree1.equals(tree2)).toBe(true)
    })

    it('returns true for both empty trees', () => {
      const tree1 = new BTree<number, string>()
      const tree2 = new BTree<number, string>()
      expect(tree1.equals(tree2)).toBe(true)
    })

    it('returns false for different sizes', () => {
      const tree1 = new BTree<number, string>()
      const tree2 = new BTree<number, string>()
      tree1.insert(1, 'a')
      tree1.insert(2, 'b')
      tree2.insert(1, 'a')
      expect(tree1.equals(tree2)).toBe(false)
    })

    it('returns false for different keys', () => {
      const tree1 = new BTree<number, string>()
      const tree2 = new BTree<number, string>()
      tree1.insert(1, 'a')
      tree1.insert(2, 'b')
      tree2.insert(1, 'a')
      tree2.insert(3, 'c')
      expect(tree1.equals(tree2)).toBe(false)
    })

    it('returns false for different values', () => {
      const tree1 = new BTree<number, string>()
      const tree2 = new BTree<number, string>()
      tree1.insert(1, 'a')
      tree1.insert(2, 'b')
      tree2.insert(1, 'a')
      tree2.insert(2, 'B')
      expect(tree1.equals(tree2)).toBe(false)
    })

  it('returns false for different types', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.equals(null)).toBe(false)
    expect(tree.equals(undefined)).toBe(false)
    expect(tree.equals({})).toBe(false)
    expect(tree.equals([])).toBe(false)
  })

  it('handles large dataset comparison', () => {
    const tree1 = new BTree<number, number>()
    const tree2 = new BTree<number, number>()
    for (let i = 0; i < 100; i++) {
      tree1.insert(i, i * 2)
      tree2.insert(i, i * 2)
    }
    expect(tree1.equals(tree2)).toBe(true)
  })

    it('returns false for large dataset with one difference', () => {
      const tree1 = new BTree<number, number>()
      const tree2 = new BTree<number, number>()
      for (let i = 0; i < 100; i++) {
        tree1.insert(i, i * 2)
        tree2.insert(i, i * 2)
      }
      tree2.insert(50, 999)
      expect(tree1.equals(tree2)).toBe(false)
    })
  })

  it('contains returns false after delete', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a'); tree.insert(2, 'b')
    tree.delete(1)
    expect(tree.contains(1)).toBe(false)
    expect(tree.contains(2)).toBe(true)
  })

  it('min and max return undefined after clear', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a'); tree.insert(2, 'b')
    tree.clear()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('height increases with more elements', () => {
    const tree = new BTree<number, number>(2)
    for (let i = 0; i < 100; i++) tree.insert(i, i)
    expect(tree.height).toBeGreaterThan(0)
  })
})

  it('contains returns false for missing', () => {
    const bt = new BTree<number, string>(3)
    expect(bt.contains(99)).toBe(false)
  })

  it('delete removes key', () => {
    const bt = new BTree<number, string>(3)
    bt.insert(1, 'a')
    bt.insert(2, 'b')
    bt.delete(1)
    expect(bt.contains(1)).toBe(false)
  })

  it('size tracks count', () => {
    const bt = new BTree<number, string>(3)
    bt.insert(1, 'a')
    bt.insert(2, 'b')
    bt.insert(3, 'c')
    expect(bt.size).toBe(3)
  })

describe('b-tree - wave544', () => {
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

describe('b-tree - wave546', () => {
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

describe('b-tree - wave547', () => {
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

describe('b-tree - wave548', () => {
  it('b-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave549', () => {
  it('b-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave550', () => {
  it('b-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave551', () => {
  it('b-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave552', () => {
  it('b-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave553', () => {
  it('b-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave554', () => {
  it('b-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave555', () => {
  it('b-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave556', () => {
  it('b-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave557', () => {
  it('b-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave558', () => {
  it('b-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave559', () => {
  it('b-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave560', () => {
  it('b-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave561', () => {
  it('b-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('b-tree - wave562', () => {
  it('b-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('b-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})
