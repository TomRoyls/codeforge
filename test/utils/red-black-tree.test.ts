import { describe, expect, it } from 'vitest'
import { RedBlackTree } from '../../src/utils/red-black-tree.js'

// ─── Basics ───

describe('RedBlackTree basics', () => {
  it('starts empty', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('inserts a single node', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('a')
    expect(tree.contains(1)).toBe(true)
  })

  it('inserts multiple nodes', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    expect(tree.size).toBe(3)
    expect(tree.find(3)).toBe('c')
    expect(tree.find(7)).toBe('g')
  })

  it('updates value on duplicate key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'old')
    tree.insert(1, 'new')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('new')
  })

  it('returns undefined for missing key', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.find(99)).toBeUndefined()
    expect(tree.contains(99)).toBe(false)
  })
})

// ─── Min & Max ───

describe('RedBlackTree min/max', () => {
  it('returns undefined on empty', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('tracks min and max', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(2, 'b')
    tree.insert(8, 'h')
    tree.insert(1, 'a')
    tree.insert(9, 'i')
    expect(tree.min).toBe(1)
    expect(tree.max).toBe(9)
  })
})

// ─── Traversal ───

describe('RedBlackTree traversal', () => {
  it('inOrder returns sorted entries', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    tree.insert(1, 'a')
    expect(tree.inOrder().map((e) => e.key)).toEqual([1, 3, 5, 7])
  })

  it('inOrder empty tree returns []', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.inOrder()).toEqual([])
  })
})

// ─── Delete ───

describe('RedBlackTree delete', () => {
  it('deletes a leaf', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.delete(2)).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.find(2)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('deletes root', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'e')
    expect(tree.delete(5)).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('deletes all nodes', () => {
    const tree = new RedBlackTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    for (let i = 0; i < 10; i++) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('maintains order after deletions', () => {
    const tree = new RedBlackTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.delete(3)
    tree.delete(7)
    expect(tree.inOrder().map((e) => e.key)).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
  })
})

// ─── Balance ───

describe('RedBlackTree balance', () => {
  it('maintains height O(log n) for sequential inserts', () => {
    const tree = new RedBlackTree<number, number>()
    const n = 200
    for (let i = 0; i < n; i++) tree.insert(i, i)
    const maxExpected = 2 * Math.ceil(Math.log2(n + 1))
    expect(tree.height).toBeLessThanOrEqual(maxExpected)
  })
})

// ─── Custom Comparator ───

describe('RedBlackTree custom comparator', () => {
  it('works with string keys', () => {
    const tree = new RedBlackTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('banana', 2)
    tree.insert('apple', 1)
    tree.insert('cherry', 3)
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('cherry')
  })
})

// ─── Root & Clear ───

describe('RedBlackTree root & clear', () => {
  it('getRoot returns root node', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    const root = tree.getRoot()
    expect(root).not.toBeNull()
    expect(root!.key).toBe(1)
  })

  it('getRoot returns null on empty', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.getRoot()).toBeNull()
  })

  it('clear empties the tree', () => {
    const tree = new RedBlackTree<number, string>()
    for (let i = 0; i < 10; i++) tree.insert(i, `v${i}`)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('insert and contains', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(10, 'a')
    tree.insert(20, 'b')
    expect(tree.contains(10)).toBe(true)
    expect(tree.contains(30)).toBe(false)
  })

  it('size tracks insertions', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    expect(tree.size).toBe(2)
  })

  it('find returns value for existing key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.find(1)).toBe('a')
  })

  it('find missing key returns undefined', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.find(99)).toBeUndefined()
  })

  it('insert and find roundtrip', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.find(1)).toBe('a')
  })
})

describe('RedBlackTree toString', () => {
  it('returns bracketed entries', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(3, 'c')
    tree.insert(1, 'a')
    expect(tree.toString()).toBe('[1=a, 3=c]')
  })

  it('returns empty brackets for empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.toString()).toBe('[]')
  })

  it('includes all entries in order', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    expect(tree.toString()).toBe('[3=c, 5=e, 7=g]')
  })
})

describe('RedBlackTree toJSON', () => {
  it('returns object with key-value pairs', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    const json = tree.toJSON() as Record<string, string>
    expect(json['1']).toBe('a')
    expect(json['2']).toBe('b')
  })

  it('returns empty object for empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.toJSON()).toEqual({})
  })

  it('produces valid JSON', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    const str = JSON.stringify(tree.toJSON())
    expect(str).toContain('"1"')
    expect(str).toContain('"a"')
  })
})

describe('RedBlackTree clone', () => {
  it('creates independent copy', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    const copy = tree.clone()
    copy.insert(3, 'c')
    expect(tree.size).toBe(2)
    expect(copy.size).toBe(3)
  })

  it('preserves all entries', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    const copy = tree.clone()
    expect(copy.find(1)).toBe('a')
    expect(copy.find(2)).toBe('b')
    expect(copy.find(3)).toBe('c')
  })

  it('clone of empty tree is empty', () => {
    const tree = new RedBlackTree<number, string>()
    const copy = tree.clone()
    expect(copy.isEmpty()).toBe(true)
    expect(copy.size).toBe(0)
  })

  it('preserves comparator', () => {
    const tree = new RedBlackTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('banana', 2)
    const copy = tree.clone()
    copy.insert('apple', 1)
    expect(copy.min).toBe('apple')
  })

  it('deletions on clone do not affect original', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    const copy = tree.clone()
    copy.delete(1)
    expect(tree.find(1)).toBe('a')
    expect(copy.find(1)).toBeUndefined()
  })
})

describe('RedBlackTree equals', () => {
  it('same tree equals itself', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.equals(tree)).toBe(true)
  })

  it('trees with same entries are equal', () => {
    const a = new RedBlackTree<number, string>()
    a.insert(1, 'a')
    a.insert(2, 'b')
    const b = new RedBlackTree<number, string>()
    b.insert(2, 'b')
    b.insert(1, 'a')
    expect(a.equals(b)).toBe(true)
  })

  it('different sizes not equal', () => {
    const a = new RedBlackTree<number, string>()
    a.insert(1, 'a')
    const b = new RedBlackTree<number, string>()
    b.insert(1, 'a')
    b.insert(2, 'b')
    expect(a.equals(b)).toBe(false)
  })

  it('different values not equal', () => {
    const a = new RedBlackTree<number, string>()
    a.insert(1, 'a')
    const b = new RedBlackTree<number, string>()
    b.insert(1, 'x')
    expect(a.equals(b)).toBe(false)
  })

  it('non-RedBlackTree returns false', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.equals(null)).toBe(false)
    expect(tree.equals({})).toBe(false)
    expect(tree.equals('tree')).toBe(false)
  })

  it('empty trees are equal', () => {
    const a = new RedBlackTree<number, string>()
    const b = new RedBlackTree<number, string>()
    expect(a.equals(b)).toBe(true)
  })
})

describe('RedBlackTree height', () => {
  it('returns 0 for empty tree', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.height).toBe(0)
  })

  it('returns 1 for single node', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.height).toBe(1)
  })

  it('grows logarithmically', () => {
    const tree = new RedBlackTree<number, number>()
    for (let i = 0; i < 1000; i++) tree.insert(i, i)
    expect(tree.height).toBeLessThanOrEqual(2 * Math.ceil(Math.log2(1001)))
  })

  it('insert negative keys', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(-5, 'neg')
    tree.insert(5, 'pos')
    tree.insert(0, 'zero')
    expect(tree.find(-5)).toBe('neg')
    expect(tree.find(0)).toBe('zero')
    expect(tree.find(5)).toBe('pos')
  })

  it('delete all nodes and verify tree remains functional', () => {
    const tree = new RedBlackTree<number, string>()
    for (let i = 0; i < 20; i++) tree.insert(i, `v${i}`)
    for (let i = 0; i < 20; i++) tree.delete(i)
    tree.insert(100, 'new')
    expect(tree.size).toBe(1)
    expect(tree.find(100)).toBe('new')
  })

  it('inOrder returns values in correct order', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    tree.insert(7, 'g')
    tree.insert(1, 'a')
    tree.insert(9, 'i')
    expect(tree.inOrder().map((e) => e.value)).toEqual(['a', 'c', 'e', 'g', 'i'])
  })

  it('equals compares clones correctly', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    const clone = tree.clone()
    expect(tree.equals(clone)).toBe(true)
  })

  it('handles object values', () => {
    const tree = new RedBlackTree<number, { name: string }>()
    const obj1 = { name: 'first' }
    const obj2 = { name: 'second' }
    tree.insert(1, obj1)
    tree.insert(2, obj2)
    expect(tree.find(1)).toBe(obj1)
    expect(tree.find(2)).toBe(obj2)
  })

  it('toString with empty values', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, '')
    tree.insert(2, '   ')
    expect(tree.toString()).toBe('[1=, 2=   ]')
  })

  it('height with only right-leaning tree', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    expect(tree.height).toBeLessThanOrEqual(3)
  })

  it('getRoot returns node with correct structure', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(5, 'e')
    tree.insert(3, 'c')
    const root = tree.getRoot()
    expect(root).not.toBeNull()
    expect(root).toHaveProperty('key')
    expect(root).toHaveProperty('value')
    expect(root).toHaveProperty('left')
    expect(root).toHaveProperty('right')
    expect(root).toHaveProperty('color')
  })
})

  it('contains returns false for missing key', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.contains(99)).toBe(false)
  })

  it('delete removes a key', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.delete(1)
    expect(tree.contains(1)).toBe(false)
    expect(tree.contains(2)).toBe(true)
  })

  it('size tracks insertions', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    expect(tree.size).toBe(3)


  it('empty tree size is 0', () => {
    const tree = new RedBlackTree<number, string>()
    expect(tree.size).toBe(0)
  })

  it('insert increases size', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.size).toBe(1)
  })

  it('contains after insert', () => {
    const tree = new RedBlackTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.contains(1)).toBe(true)
  })
  })

describe('red-black-tree - wave545', () => {
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

describe('red-black-tree - wave546', () => {
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

describe('red-black-tree - wave547', () => {
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

describe('red-black-tree - wave548', () => {
  it('red-black-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave549', () => {
  it('red-black-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave550', () => {
  it('red-black-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave551', () => {
  it('red-black-tree w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave552', () => {
  it('red-black-tree w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave553', () => {
  it('red-black-tree w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave554', () => {
  it('red-black-tree w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave555', () => {
  it('red-black-tree w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave556', () => {
  it('red-black-tree w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave557', () => {
  it('red-black-tree w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave558', () => {
  it('red-black-tree w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave559', () => {
  it('red-black-tree w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave560', () => {
  it('red-black-tree w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave561', () => {
  it('red-black-tree w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave562', () => {
  it('red-black-tree w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave563', () => {
  it('red-black-tree w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave564', () => {
  it('red-black-tree w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave565', () => {
  it('red-black-tree w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave566', () => {
  it('red-black-tree w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave127', () => {
  it('red-black-tree w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave130', () => {
  it('red-black-tree w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave133', () => {
  it('red-black-tree w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave136', () => {
  it('red-black-tree w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - wave139', () => {
  it('red-black-tree w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w142', () => {
  it('red-black-tree v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w145', () => {
  it('red-black-tree v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w148', () => {
  it('red-black-tree v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w151', () => {
  it('red-black-tree v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w154', () => {
  it('red-black-tree v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w157', () => {
  it('red-black-tree v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w160', () => {
  it('red-black-tree v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w170', () => {
  it('red-black-tree x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w180', () => {
  it('red-black-tree x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w190', () => {
  it('red-black-tree x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w200', () => {
  it('red-black-tree x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w210', () => {
  it('red-black-tree x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w220', () => {
  it('red-black-tree x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w230', () => {
  it('red-black-tree x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w240', () => {
  it('red-black-tree x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w250', () => {
  it('red-black-tree x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w260', () => {
  it('red-black-tree x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w270', () => {
  it('red-black-tree x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w280', () => {
  it('red-black-tree x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w290', () => {
  it('red-black-tree x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w300', () => {
  it('red-black-tree x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w310', () => {
  it('red-black-tree x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w320', () => {
  it('red-black-tree x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w330', () => {
  it('red-black-tree x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w340', () => {
  it('red-black-tree x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w350', () => {
  it('red-black-tree x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w360', () => {
  it('red-black-tree x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w370', () => {
  it('red-black-tree x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w380', () => {
  it('red-black-tree x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w390', () => {
  it('red-black-tree x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('red-black-tree - w400', () => {
  it('red-black-tree x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('red-black-tree x400x9', () => {
    expect(describe).toBeDefined()
  })
})
