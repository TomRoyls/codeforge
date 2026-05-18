import { beforeEach, describe, expect, it } from 'vitest'

import { Treap, TreapNode } from '../src/utils/treap.js'

function checkHeapProperty<K, V>(node: TreapNode<K, V> | null): boolean {
  if (node === null) return true
  if (node.left !== null && node.left.priority > node.priority) return false
  if (node.right !== null && node.right.priority > node.priority) return false
  return checkHeapProperty(node.left) && checkHeapProperty(node.right)
}

// ─── constructor ────────────────────────────────────────
describe('constructor', () => {
  it('creates a treap with default comparator (numbers)', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'a')
    expect(treap.size).toBe(1)
    expect(treap.find(1)).toBe('a')
  })

  it('creates a treap with custom comparator', () => {
    const treap = new Treap<string, number>((a, b) => a.localeCompare(b))
    treap.insert('banana', 2)
    treap.insert('apple', 1)
    expect(treap.inOrder().map((e) => e.key)).toEqual(['apple', 'banana'])
  })
})

// ─── insert ─────────────────────────────────────────────
describe('insert', () => {
  let treap: Treap<number, string>

  beforeEach(() => {
    treap = new Treap<number, string>()
  })

  it('adds nodes and increments size', () => {
    treap.insert(10, 'ten')
    treap.insert(5, 'five')
    treap.insert(15, 'fifteen')
    expect(treap.size).toBe(3)
  })

  it('assigns a priority to each node', () => {
    treap.insert(1, 'a')
    treap.insert(2, 'b')
    const root = treap.getRoot()
    expect(root).not.toBeNull()
    expect(root!.priority).toBeGreaterThanOrEqual(0)
    expect(root!.priority).toBeLessThanOrEqual(1)
  })
})

// ─── find ───────────────────────────────────────────────
describe('find', () => {
  let treap: Treap<number, string>

  beforeEach(() => {
    treap = new Treap<number, string>()
    treap.insert(10, 'ten')
    treap.insert(5, 'five')
    treap.insert(15, 'fifteen')
  })

  it('returns value for existing key', () => {
    expect(treap.find(10)).toBe('ten')
    expect(treap.find(5)).toBe('five')
    expect(treap.find(15)).toBe('fifteen')
  })

  it('returns undefined for missing key', () => {
    expect(treap.find(99)).toBeUndefined()
  })
})

// ─── contains ───────────────────────────────────────────
describe('contains', () => {
  let treap: Treap<number, string>

  beforeEach(() => {
    treap = new Treap<number, string>()
    treap.insert(10, 'ten')
  })

  it('returns true for existing key', () => {
    expect(treap.contains(10)).toBe(true)
  })

  it('returns false for missing key', () => {
    expect(treap.contains(99)).toBe(false)
  })
})

// ─── delete ─────────────────────────────────────────────
describe('delete', () => {
  let treap: Treap<number, string>

  beforeEach(() => {
    treap = new Treap<number, string>()
    treap.insert(10, 'ten')
    treap.insert(5, 'five')
    treap.insert(15, 'fifteen')
  })

  it('removes a node and returns true', () => {
    expect(treap.delete(10)).toBe(true)
    expect(treap.size).toBe(2)
    expect(treap.find(10)).toBeUndefined()
  })

  it('returns false for missing key', () => {
    expect(treap.delete(99)).toBe(false)
    expect(treap.size).toBe(3)
  })

  it('maintains heap property after deletion', () => {
    treap.delete(10)
    expect(checkHeapProperty(treap.getRoot())).toBe(true)
  })
})

// ─── min / max ──────────────────────────────────────────
describe('min / max', () => {
  let treap: Treap<number, string>

  beforeEach(() => {
    treap = new Treap<number, string>()
    treap.insert(10, 'ten')
    treap.insert(5, 'five')
    treap.insert(20, 'twenty')
    treap.insert(1, 'one')
    treap.insert(15, 'fifteen')
  })

  it('returns correct min', () => {
    expect(treap.min).toBe(1)
  })

  it('returns correct max', () => {
    expect(treap.max).toBe(20)
  })

  it('returns undefined on empty treap', () => {
    const empty = new Treap<number, string>()
    expect(empty.min).toBeUndefined()
    expect(empty.max).toBeUndefined()
  })
})

// ─── inOrder ────────────────────────────────────────────
describe('inOrder', () => {
  it('returns sorted order (BST property maintained)', () => {
    const treap = new Treap<number, string>()
    const keys = [50, 30, 70, 20, 40, 60, 80]
    for (const k of keys) treap.insert(k, String(k))

    const result = treap.inOrder()
    expect(result.map((e) => e.key)).toEqual([20, 30, 40, 50, 60, 70, 80])
    expect(result.map((e) => e.value)).toEqual([
      '20', '30', '40', '50', '60', '70', '80',
    ])
  })
})

// ─── clear ──────────────────────────────────────────────
describe('clear', () => {
  it('empties the treap', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'a')
    treap.insert(2, 'b')
    treap.clear()
    expect(treap.size).toBe(0)
    expect(treap.isEmpty()).toBe(true)
    expect(treap.find(1)).toBeUndefined()
  })
})

// ─── isEmpty ────────────────────────────────────────────
describe('isEmpty', () => {
  it('returns true on new treap', () => {
    const treap = new Treap<number, string>()
    expect(treap.isEmpty()).toBe(true)
  })

  it('returns false after insert', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'a')
    expect(treap.isEmpty()).toBe(false)
  })

  it('returns true after clearing all nodes', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'a')
    treap.delete(1)
    expect(treap.isEmpty()).toBe(true)
  })
})

// ─── heap property ──────────────────────────────────────
describe('heap property', () => {
  it('every node has priority >= children priorities', () => {
    const treap = new Treap<number, string>()
    for (let i = 0; i < 100; i++) treap.insert(i, String(i))
    expect(checkHeapProperty(treap.getRoot())).toBe(true)
  })

  it('maintains heap property after deletions', () => {
    const treap = new Treap<number, string>()
    for (let i = 0; i < 50; i++) treap.insert(i, String(i))
    for (let i = 0; i < 25; i++) treap.delete(i)
    expect(checkHeapProperty(treap.getRoot())).toBe(true)
  })
})

// ─── BST property ───────────────────────────────────────
describe('BST property', () => {
  it('inOrder is sorted after many inserts', () => {
    const treap = new Treap<number, string>()
    const shuffled = Array.from({ length: 100 }, (_, i) => i)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
    }
    for (const k of shuffled) treap.insert(k, String(k))

    const result = treap.inOrder()
    const keys = result.map((e) => e.key)
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]).toBeGreaterThan(keys[i - 1]!)
    }
  })
})

// ─── height ─────────────────────────────────────────────
describe('height', () => {
  it('insert 1000 sequential keys — height is O(log n)', () => {
    const treap = new Treap<number, string>()
    for (let i = 0; i < 1000; i++) treap.insert(i, String(i))
    expect(treap.height).toBeLessThan(100)
  })

  it('insert 1000 random keys — height is O(log n)', () => {
    const treap = new Treap<number, string>()
    const seen = new Set<number>()
    while (seen.size < 1000) {
      const k = Math.floor(Math.random() * 100000)
      if (!seen.has(k)) {
        seen.add(k)
        treap.insert(k, String(k))
      }
    }
    expect(treap.height).toBeLessThan(100)
  })
})

// ─── duplicate key ──────────────────────────────────────
describe('duplicate key', () => {
  it('updates value without changing size', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'a')
    treap.insert(1, 'b')
    expect(treap.size).toBe(1)
    expect(treap.find(1)).toBe('b')
  })
})

// ─── custom comparator ──────────────────────────────────
describe('custom comparator', () => {
  it('works with string keys', () => {
    const treap = new Treap<string, number>((a, b) => a.localeCompare(b))
    treap.insert('cherry', 3)
    treap.insert('apple', 1)
    treap.insert('banana', 2)
    treap.insert('date', 4)

    expect(treap.inOrder().map((e) => e.key)).toEqual([
      'apple', 'banana', 'cherry', 'date',
    ])
    expect(treap.min).toBe('apple')
    expect(treap.max).toBe('date')
    expect(treap.find('banana')).toBe(2)
    expect(treap.delete('cherry')).toBe(true)
    expect(treap.size).toBe(3)
    expect(treap.contains('cherry')).toBe(false)
  })
})
