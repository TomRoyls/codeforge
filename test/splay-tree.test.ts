import { beforeEach, describe, expect, it } from 'vitest'
import { SplayTree } from '../src/utils/splay-tree.js'

// ─── constructor ───

describe('SplayTree - constructor', () => {
  it('should create an empty tree with default comparator', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('should accept a custom comparator', () => {
    const tree = new SplayTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('banana', 2)
    tree.insert('apple', 1)
    expect(tree.inOrder()).toEqual([
      { key: 'apple', value: 1 },
      { key: 'banana', value: 2 },
    ])
  })
})

// ─── insert ───

describe('SplayTree - insert', () => {
  it('should add elements and increment size', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.size).toBe(1)
    tree.insert(5, 'five')
    expect(tree.size).toBe(2)
    tree.insert(15, 'fifteen')
    expect(tree.size).toBe(3)
  })

  it('should splay the inserted node to root', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    tree.insert(1, 'one')
    expect(tree.getRoot()?.key).toBe(1)
  })
})

// ─── find ───

describe('SplayTree - find', () => {
  it('should return value for existing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    expect(tree.find(10)).toBe('ten')
    expect(tree.find(5)).toBe('five')
  })

  it('should return undefined for missing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.find(99)).toBeUndefined()
  })

  it('should return undefined on empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.find(1)).toBeUndefined()
  })
})

// ─── contains ───

describe('SplayTree - contains', () => {
  it('should return true for existing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.contains(10)).toBe(true)
  })

  it('should return false for missing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.contains(99)).toBe(false)
  })
})

// ─── delete ───

describe('SplayTree - delete', () => {
  it('should remove a key and return true', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    expect(tree.delete(10)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.find(10)).toBeUndefined()
  })

  it('should return false for missing key', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('should return false on empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.delete(1)).toBe(false)
  })
})

// ─── min/max ───

describe('SplayTree - min/max', () => {
  it('should return correct min value', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    tree.insert(1, 'one')
    expect(tree.min).toBe(1)
  })

  it('should return correct max value', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    expect(tree.max).toBe(15)
  })

  it('should return undefined for min on empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.min).toBeUndefined()
  })

  it('should return undefined for max on empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.max).toBeUndefined()
  })
})

// ─── inOrder ───

describe('SplayTree - inOrder', () => {
  it('should return elements in sorted order', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    tree.insert(1, 'one')
    tree.insert(7, 'seven')
    expect(tree.inOrder()).toEqual([
      { key: 1, value: 'one' },
      { key: 5, value: 'five' },
      { key: 7, value: 'seven' },
      { key: 10, value: 'ten' },
      { key: 15, value: 'fifteen' },
    ])
  })

  it('should return empty array for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.inOrder()).toEqual([])
  })
})

// ─── clear ───

describe('SplayTree - clear', () => {
  it('should empty the tree', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.find(10)).toBeUndefined()
  })
})

// ─── isEmpty ───

describe('SplayTree - isEmpty', () => {
  it('should return true for new tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.isEmpty()).toBe(true)
  })

  it('should return false after insert', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    expect(tree.isEmpty()).toBe(false)
  })

  it('should return true after clearing all elements', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── splay effect ───

describe('SplayTree - splay effect', () => {
  it('should bring accessed key to root after find', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    tree.insert(1, 'one')
    tree.insert(7, 'seven')
    tree.find(1)
    expect(tree.getRoot()?.key).toBe(1)
  })

  it('should bring last accessed node to root when key not found', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(5, 'five')
    tree.insert(15, 'fifteen')
    tree.find(12)
    expect(tree.getRoot()?.key).toBe(10)
  })
})

// ─── sequential access pattern ───

describe('SplayTree - sequential access pattern', () => {
  it('should insert 1..100 and find them all sequentially', () => {
    const tree = new SplayTree<number, number>()
    for (let i = 1; i <= 100; i++) {
      tree.insert(i, i * 10)
    }
    for (let i = 1; i <= 100; i++) {
      expect(tree.find(i)).toBe(i * 10)
    }
  })
})

// ─── duplicate key ───

describe('SplayTree - duplicate key', () => {
  it('should update value and keep size unchanged', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(10, 'ten')
    tree.insert(10, 'TEN')
    expect(tree.size).toBe(1)
    expect(tree.find(10)).toBe('TEN')
  })
})

// ─── custom comparator ───

describe('SplayTree - custom comparator', () => {
  let tree: SplayTree<string, number>

  beforeEach(() => {
    tree = new SplayTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('cherry', 3)
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    tree.insert('date', 4)
  })

  it('should find with string keys', () => {
    expect(tree.find('banana')).toBe(2)
    expect(tree.find('missing')).toBeUndefined()
  })

  it('should return correct min and max with strings', () => {
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('date')
  })

  it('should return inOrder in alphabetical order', () => {
    expect(tree.inOrder()).toEqual([
      { key: 'apple', value: 1 },
      { key: 'banana', value: 2 },
      { key: 'cherry', value: 3 },
      { key: 'date', value: 4 },
    ])
  })

  it('should delete string keys', () => {
    expect(tree.delete('banana')).toBe(true)
    expect(tree.size).toBe(3)
    expect(tree.contains('banana')).toBe(false)
  })
})

// ─── height ───

describe('SplayTree - height', () => {
  it('should return 0 for empty tree', () => {
    const tree = new SplayTree<number, string>()
    expect(tree.height).toBe(0)
  })

  it('should return 1 for single node', () => {
    const tree = new SplayTree<number, string>()
    tree.insert(1, 'one')
    expect(tree.height).toBe(1)
  })
})
