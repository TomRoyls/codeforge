import { describe, expect, it } from 'vitest'

import { VanEmdeBoasTree, DEFAULT_UNIVERSE_SIZE } from '../src/core/van-emde-boas-2/index.js'

// ─── Construction ────────────────────────────────────────
describe('VanEmdeBoasTree construction', () => {
  it('creates tree with default universe size', () => {
    const tree = new VanEmdeBoasTree()
    expect(tree.size()).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('creates tree with custom universe size', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    expect(tree.size()).toBe(0)
  })

  it('throws for universe size < 2', () => {
    expect(() => new VanEmdeBoasTree({ universeSize: 1 })).toThrow(RangeError)
  })

  it('throws for non-power-of-2 universe size', () => {
    expect(() => new VanEmdeBoasTree({ universeSize: 3 })).toThrow(RangeError)
  })

  it('isPowerOfTwo works correctly', () => {
    expect(VanEmdeBoasTree.isPowerOfTwo(1)).toBe(true)
    expect(VanEmdeBoasTree.isPowerOfTwo(2)).toBe(true)
    expect(VanEmdeBoasTree.isPowerOfTwo(256)).toBe(true)
    expect(VanEmdeBoasTree.isPowerOfTwo(3)).toBe(false)
    expect(VanEmdeBoasTree.isPowerOfTwo(0)).toBe(false)
    expect(VanEmdeBoasTree.isPowerOfTwo(-4)).toBe(false)
  })
})

// ─── Insert and Has ──────────────────────────────────────
describe('VanEmdeBoasTree insert/has', () => {
  it('inserts and finds a value', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(5)
    expect(tree.has(5)).toBe(true)
    expect(tree.has(0)).toBe(false)
    expect(tree.has(10)).toBe(false)
  })

  it('inserts multiple values', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(0)
    tree.insert(5)
    tree.insert(15)
    expect(tree.has(0)).toBe(true)
    expect(tree.has(5)).toBe(true)
    expect(tree.has(15)).toBe(true)
    expect(tree.size()).toBe(3)
  })

  it('ignores duplicate insert', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(5)
    tree.insert(5)
    expect(tree.size()).toBe(1)
  })

  it('throws for out-of-range insert', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    expect(() => tree.insert(-1)).toThrow(RangeError)
    expect(() => tree.insert(16)).toThrow(RangeError)
  })

  it('has returns false for out-of-range', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    expect(tree.has(-1)).toBe(false)
    expect(tree.has(16)).toBe(false)
  })
})

// ─── Min/Max ─────────────────────────────────────────────
describe('VanEmdeBoasTree min/max', () => {
  it('returns undefined min/max on empty tree', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    expect(tree.min()).toBeUndefined()
    expect(tree.max()).toBeUndefined()
  })

  it('tracks min and max correctly', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(10)
    tree.insert(3)
    tree.insert(7)
    expect(tree.min()).toBe(3)
    expect(tree.max()).toBe(10)
  })
})

// ─── Successor/Predecessor ───────────────────────────────
describe('VanEmdeBoasTree successor/predecessor', () => {
  it('returns successor', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(3)
    tree.insert(7)
    tree.insert(10)
    expect(tree.successor(3)).toBe(7)
    expect(tree.successor(7)).toBe(10)
  })

  it('returns undefined for no successor', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(5)
    expect(tree.successor(5)).toBeUndefined()
  })

  it('returns predecessor', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(3)
    tree.insert(7)
    tree.insert(10)
    expect(tree.predecessor(10)).toBe(7)
    expect(tree.predecessor(7)).toBe(3)
  })

  it('returns undefined for out-of-range', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    expect(tree.successor(-1)).toBeUndefined()
    expect(tree.predecessor(-1)).toBeUndefined()
  })
})

// ─── Delete ──────────────────────────────────────────────
describe('VanEmdeBoasTree delete', () => {
  it('deletes a value', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(5)
    expect(tree.delete(5)).toBe(true)
    expect(tree.has(5)).toBe(false)
    expect(tree.size()).toBe(0)
  })

  it('returns false for non-existent value', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    expect(tree.delete(5)).toBe(false)
  })

  it('deletes and reinserts correctly', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(3)
    tree.insert(7)
    tree.delete(3)
    expect(tree.has(3)).toBe(false)
    expect(tree.has(7)).toBe(true)
    expect(tree.size()).toBe(1)
  })
})

// ─── Iteration ───────────────────────────────────────────
describe('VanEmdeBoasTree iteration', () => {
  it('toArray returns sorted values', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(7)
    tree.insert(3)
    tree.insert(10)
    expect(tree.toArray()).toEqual([3, 7, 10])
  })

  it('forEach iterates in order', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(5)
    tree.insert(2)
    const result: number[] = []
    tree.forEach((v) => result.push(v))
    expect(result).toEqual([2, 5])
  })

  it('clear resets the tree', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(5)
    tree.clear()
    expect(tree.size()).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })
})

// ─── Extract ─────────────────────────────────────────────
describe('VanEmdeBoasTree extract', () => {
  it('extractMin returns and removes minimum', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(10)
    tree.insert(3)
    tree.insert(7)
    expect(tree.extractMin()).toBe(3)
    expect(tree.size()).toBe(2)
  })

  it('extractMax returns and removes maximum', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    tree.insert(10)
    tree.insert(3)
    expect(tree.extractMax()).toBe(10)
    expect(tree.size()).toBe(1)
  })

  it('extractMin on empty returns undefined', () => {
    const tree = new VanEmdeBoasTree({ universeSize: 16 })
    expect(tree.extractMin()).toBeUndefined()
    expect(tree.extractMax()).toBeUndefined()
  })
})
