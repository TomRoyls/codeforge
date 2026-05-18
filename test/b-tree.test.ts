import { beforeEach, describe, expect, it } from 'vitest'
import { BTree } from '../src/utils/b-tree.js'

// ─── constructor ─────────────────────────────────────────
describe('constructor', () => {
  it('creates empty tree with default minimum degree t=2', () => {
    const tree = new BTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.height).toBe(0)
  })

  it('creates tree with custom order (minimum degree)', () => {
    const tree = new BTree<number, string>(4)
    for (let i = 0; i < 30; i++) tree.insert(i, `v${i}`)
    expect(tree.size).toBe(30)
  })
})

// ─── insert ──────────────────────────────────────────────
describe('insert', () => {
  let tree: BTree<number, string>

  beforeEach(() => {
    tree = new BTree<number, string>()
  })

  it('adds elements and increments size', () => {
    tree.insert(10, 'a')
    expect(tree.size).toBe(1)
    tree.insert(20, 'b')
    expect(tree.size).toBe(2)
    tree.insert(5, 'c')
    expect(tree.size).toBe(3)
  })
})

// ─── find ────────────────────────────────────────────────
describe('find', () => {
  let tree: BTree<number, string>

  beforeEach(() => {
    tree = new BTree<number, string>()
    tree.insert(10, 'a')
    tree.insert(20, 'b')
    tree.insert(5, 'c')
  })

  it('returns value for existing key', () => {
    expect(tree.find(10)).toBe('a')
    expect(tree.find(20)).toBe('b')
    expect(tree.find(5)).toBe('c')
  })

  it('returns undefined for missing key', () => {
    expect(tree.find(99)).toBeUndefined()
    expect(tree.find(1)).toBeUndefined()
  })
})

// ─── contains ────────────────────────────────────────────
describe('contains', () => {
  let tree: BTree<number, string>

  beforeEach(() => {
    tree = new BTree<number, string>()
    tree.insert(10, 'a')
    tree.insert(20, 'b')
  })

  it('returns true for existing keys', () => {
    expect(tree.contains(10)).toBe(true)
    expect(tree.contains(20)).toBe(true)
  })

  it('returns false for missing keys', () => {
    expect(tree.contains(99)).toBe(false)
    expect(tree.contains(1)).toBe(false)
  })
})

// ─── delete ──────────────────────────────────────────────
describe('delete', () => {
  let tree: BTree<number, string>

  beforeEach(() => {
    tree = new BTree<number, string>()
    tree.insert(10, 'a')
    tree.insert(20, 'b')
    tree.insert(5, 'c')
  })

  it('removes key and returns true', () => {
    expect(tree.delete(10)).toBe(true)
    expect(tree.find(10)).toBeUndefined()
    expect(tree.size).toBe(2)
  })

  it('returns false for missing key', () => {
    expect(tree.delete(99)).toBe(false)
    expect(tree.size).toBe(3)
  })
})

// ─── min / max ───────────────────────────────────────────
describe('min / max', () => {
  it('returns undefined on empty tree', () => {
    const tree = new BTree<number, string>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('returns correct min and max', () => {
    const tree = new BTree<number, string>()
    tree.insert(10, 'a')
    tree.insert(5, 'b')
    tree.insert(20, 'c')
    tree.insert(3, 'd')
    tree.insert(15, 'e')
    expect(tree.min).toBe(3)
    expect(tree.max).toBe(20)
  })
})

// ─── forEach ─────────────────────────────────────────────
describe('forEach', () => {
  it('visits all entries in sorted order', () => {
    const tree = new BTree<number, string>()
    tree.insert(10, 'a')
    tree.insert(5, 'b')
    tree.insert(20, 'c')
    tree.insert(15, 'd')
    tree.insert(3, 'e')
    const keys: number[] = []
    const vals: string[] = []
    tree.forEach((k, v) => {
      keys.push(k)
      vals.push(v)
    })
    expect(keys).toEqual([3, 5, 10, 15, 20])
    expect(vals).toEqual(['e', 'b', 'a', 'd', 'c'])
  })

  it('does nothing on empty tree', () => {
    const tree = new BTree<number, string>()
    let count = 0
    tree.forEach(() => count++)
    expect(count).toBe(0)
  })
})

// ─── clear ───────────────────────────────────────────────
describe('clear', () => {
  it('empties the tree', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    tree.insert(2, 'b')
    tree.insert(3, 'c')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.find(1)).toBeUndefined()
  })
})

// ─── isEmpty ─────────────────────────────────────────────
describe('isEmpty', () => {
  it('reflects correct states', () => {
    const tree = new BTree<number, string>()
    expect(tree.isEmpty()).toBe(true)
    tree.insert(1, 'a')
    expect(tree.isEmpty()).toBe(false)
    tree.delete(1)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── sorted order ────────────────────────────────────────
describe('sorted order', () => {
  it('forEach gives ascending order for 100 random inserts', () => {
    const tree = new BTree<number, number>()
    const nums = Array.from({ length: 100 }, (_, i) => i)
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
    for (const n of nums) tree.insert(n, n * 10)
    const keys: number[] = []
    tree.forEach((k) => keys.push(k))
    expect(keys).toEqual(Array.from({ length: 100 }, (_, i) => i))
  })
})

// ─── duplicate key ───────────────────────────────────────
describe('duplicate key', () => {
  it('updates value without changing size', () => {
    const tree = new BTree<number, string>()
    tree.insert(1, 'a')
    expect(tree.size).toBe(1)
    tree.insert(1, 'b')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('b')
  })
})

// ─── splits ──────────────────────────────────────────────
describe('splits', () => {
  it('insert 1..20 and verify all findable', () => {
    const tree = new BTree<number, number>()
    for (let i = 1; i <= 20; i++) tree.insert(i, i * 100)
    expect(tree.size).toBe(20)
    for (let i = 1; i <= 20; i++) {
      expect(tree.find(i)).toBe(i * 100)
    }
  })

  it('insert 20..1 (reverse) and verify all findable', () => {
    const tree = new BTree<number, number>()
    for (let i = 20; i >= 1; i--) tree.insert(i, i * 100)
    expect(tree.size).toBe(20)
    for (let i = 1; i <= 20; i++) {
      expect(tree.find(i)).toBe(i * 100)
    }
  })
})

// ─── balance ─────────────────────────────────────────────
describe('balance', () => {
  it('height stays bounded after many inserts', () => {
    const tree = new BTree<number, number>(3)
    for (let i = 0; i < 1000; i++) tree.insert(i, i)
    const maxExpectedHeight = Math.ceil(Math.log(1000) / Math.log(5)) + 1
    expect(tree.height).toBeLessThanOrEqual(maxExpectedHeight)
  })
})

// ─── delete underflow ────────────────────────────────────
describe('delete underflow', () => {
  it('deletes triggering merges and borrows, remaining correct', () => {
    const tree = new BTree<number, number>()
    for (let i = 1; i <= 20; i++) tree.insert(i, i)
    const toDelete = [1, 5, 10, 15, 20, 3, 7, 12, 18]
    for (const k of toDelete) {
      expect(tree.delete(k)).toBe(true)
    }
    expect(tree.size).toBe(20 - toDelete.length)
    for (const k of toDelete) {
      expect(tree.find(k)).toBeUndefined()
    }
    const remaining: number[] = []
    tree.forEach((k) => remaining.push(k))
    const expected = Array.from({ length: 20 }, (_, i) => i + 1).filter(
      (n) => !toDelete.includes(n),
    )
    expect(remaining).toEqual(expected)
  })

  it('delete all elements one by one leaves empty tree', () => {
    const tree = new BTree<number, number>()
    for (let i = 1; i <= 15; i++) tree.insert(i, i)
    for (let i = 1; i <= 15; i++) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('delete in reverse order', () => {
    const tree = new BTree<number, number>()
    for (let i = 1; i <= 15; i++) tree.insert(i, i)
    for (let i = 15; i >= 1; i--) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})
