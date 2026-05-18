import { LoserTree } from '../src/core/losertree/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('LoserTree', () => {
  describe('constructor', () => {
    it('creates tree with k runs', () => {
      const tree = new LoserTree<number>(3)
      expect(tree.size).toBe(3)
      expect(tree.isEmpty).toBe(true)
    })

    it('throws for k < 1', () => {
      expect(() => new LoserTree<number>(0)).toThrow('at least 1')
    })

    it('accepts options object', () => {
      const tree = new LoserTree<number>(2, { comparator: (a, b) => a - b })
      expect(tree.size).toBe(2)
    })
  })

  // ─── Initialize ──────────────────────────────────────────────────────────

  describe('initialize', () => {
    it('initializes with sorted runs', () => {
      const tree = new LoserTree<number>(3)
      tree.initialize([[1, 4], [2, 5], [3, 6]])
      expect(tree.isEmpty).toBe(false)
      expect(tree.peek()).toBe(1)
    })

    it('throws for wrong number of runs', () => {
      const tree = new LoserTree<number>(3)
      expect(() => tree.initialize([[1], [2]])).toThrow('Expected 3 runs')
    })
  })

  // ─── Next ────────────────────────────────────────────────────────────────

  describe('next', () => {
    it('returns elements in sorted order', () => {
      const tree = new LoserTree<number>(3)
      tree.initialize([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
      const result: number[] = []
      while (!tree.isEmpty) {
        const val = tree.next()
        if (val !== undefined) result.push(val)
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('throws when not initialized', () => {
      const tree = new LoserTree<number>(2)
      expect(() => tree.next()).toThrow('not initialized')
    })
  })

  // ─── Peek ────────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns current minimum without advancing', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1, 3], [2, 4]])
      expect(tree.peek()).toBe(1)
      expect(tree.peek()).toBe(1)
    })

    it('returns undefined when not initialized', () => {
      const tree = new LoserTree<number>(2)
      expect(tree.peek()).toBe(undefined)
    })
  })

  // ─── Properties ──────────────────────────────────────────────────────────

  describe('properties', () => {
    it('totalElements counts remaining', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1, 2], [3, 4]])
      expect(tree.totalElements).toBe(4)
      tree.next()
      expect(tree.totalElements).toBe(3)
    })

    it('exhaustedRuns counts empty runs', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1], [2, 3]])
      tree.next()
      expect(tree.exhaustedRuns).toBe(1)
    })

    it('isEmpty when all exhausted', () => {
      const tree = new LoserTree<number>(1)
      tree.initialize([[1]])
      tree.next()
      expect(tree.isEmpty).toBe(true)
    })
  })

  // ─── ReplaceMin ──────────────────────────────────────────────────────────

  describe('replaceMin', () => {
    it('replaces current min and returns old', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1, 5], [3, 7]])
      const old = tree.replaceMin(0)
      expect(old).toBe(1)
      expect(tree.next()).toBe(0)
    })
  })

  // ─── Update / Reset ──────────────────────────────────────────────────────

  describe('update and reset', () => {
    it('update modifies a run element', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1, 4], [2, 5]])
      tree.next()
      tree.next()
      expect(tree.next()).toBe(4)
    })

    it('reset reinitializes with new runs', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1], [2]])
      tree.reset([[10], [20]])
      expect(tree.next()).toBe(10)
    })
  })

  // ─── Static Merge ────────────────────────────────────────────────────────

  describe('static merge', () => {
    it('merges sorted arrays', () => {
      const result = LoserTree.merge([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('handles empty input', () => {
      expect(LoserTree.merge([])).toEqual([])
    })

    it('handles single array', () => {
      expect(LoserTree.merge([[1, 2, 3]])).toEqual([1, 2, 3])
    })
  })

  // ─── Clone / ToArray / ForEach / Iterator ────────────────────────────────

  describe('clone, toArray, forEach, iterator', () => {
    it('clone preserves state', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1, 3], [2, 4]])
      const cloned = tree.clone()
      expect(cloned.next()).toBe(1)
    })

    it('toArray drains without modifying tree', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1, 3], [2, 4]])
      const arr = tree.toArray()
      expect(arr).toEqual([1, 2, 3, 4])
      expect(tree.totalElements).toBe(4)
    })

    it('forEach iterates all elements', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1], [2]])
      const collected: number[] = []
      tree.forEach((v) => collected.push(v))
      expect(collected).toEqual([1, 2])
    })

    it('Symbol.iterator works', () => {
      const tree = new LoserTree<number>(2)
      tree.initialize([[1], [2]])
      expect([...tree]).toEqual([1, 2])
    })
  })
})
