import { describe, it, expect } from 'vitest'
import { LoserTree } from '../../src/core/losertree/index.js'
import type { Comparator } from '../../src/core/losertree/index.js'

describe('LoserTree', () => {
  describe('constructor', () => {
    it('creates a tree with k=1', () => {
      const lt = new LoserTree(1)
      expect(lt.size).toBe(1)
    })

    it('creates a tree with k=2', () => {
      const lt = new LoserTree(2)
      expect(lt.size).toBe(2)
    })

    it('creates a tree with k=4', () => {
      const lt = new LoserTree(4)
      expect(lt.size).toBe(4)
    })

    it('creates a tree with custom comparator', () => {
      const lt = new LoserTree<number>(2, (a, b) => b - a)
      expect(lt.size).toBe(2)
    })

    it('creates a tree with options object', () => {
      const lt = new LoserTree<number>(3, { comparator: (a, b) => a - b })
      expect(lt.size).toBe(3)
    })

    it('creates a tree with default comparator', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      expect(lt.next()).toBe(1)
      expect(lt.next()).toBe(2)
    })

    it('throws for k=0', () => {
      expect(() => new LoserTree(0)).toThrow('k must be at least 1')
    })

    it('throws for negative k', () => {
      expect(() => new LoserTree(-1)).toThrow('k must be at least 1')
    })

    it('uninitialized tree isEmpty is true', () => {
      const lt = new LoserTree(3)
      expect(lt.isEmpty).toBe(true)
    })

    it('uninitialized tree totalElements is 0', () => {
      const lt = new LoserTree(3)
      expect(lt.totalElements).toBe(0)
    })

    it('uninitialized tree exhaustedRuns equals k', () => {
      const lt = new LoserTree(3)
      expect(lt.exhaustedRuns).toBe(3)
    })

    it('uninitialized peek returns undefined', () => {
      const lt = new LoserTree(3)
      expect(lt.peek()).toBeUndefined()
    })
  })

  describe('initialize', () => {
    it('initializes with single run', () => {
      const lt = new LoserTree<number>(1)
      lt.initialize([[1, 2, 3]])
      expect(lt.isEmpty).toBe(false)
    })

    it('initializes with two runs', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      expect(lt.isEmpty).toBe(false)
    })

    it('throws when run count does not match k', () => {
      const lt = new LoserTree<number>(3)
      expect(() => lt.initialize([[1], [2]])).toThrow('Expected 3 runs, got 2')
    })

    it('handles empty runs', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[], []])
      expect(lt.isEmpty).toBe(true)
    })

    it('handles one empty and one non-empty run', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[], [1, 2, 3]])
      expect(lt.isEmpty).toBe(false)
      expect(lt.peek()).toBe(1)
    })

    it('handles single-element runs', () => {
      const lt = new LoserTree<number>(3)
      lt.initialize([[5], [3], [7]])
      expect(lt.peek()).toBe(3)
    })

    it('can be reinitialized', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 2], [3, 4]])
      expect(lt.next()).toBe(1)
      lt.initialize([[10, 20], [15, 25]])
      expect(lt.next()).toBe(10)
      expect(lt.next()).toBe(15)
    })

    it('preserves original input arrays', () => {
      const lt = new LoserTree<number>(2)
      const a = [1, 2]
      const b = [3, 4]
      lt.initialize([a, b])
      a.push(5)
      expect(lt.totalElements).toBe(4)
    })
  })

  describe('next', () => {
    it('extracts elements in order from single run', () => {
      const lt = new LoserTree<number>(1)
      lt.initialize([[1, 2, 3, 4, 5]])
      expect([lt.next(), lt.next(), lt.next(), lt.next(), lt.next()]).toEqual([1, 2, 3, 4, 5])
    })

    it('merges two sorted runs', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3, 5], [2, 4, 6]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges three sorted runs', () => {
      const lt = new LoserTree<number>(3)
      lt.initialize([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('merges four sorted runs', () => {
      const lt = new LoserTree<number>(4)
      lt.initialize([[1, 8], [3, 6], [2, 7], [4, 5]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('returns undefined when all runs exhausted', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2]])
      lt.next()
      lt.next()
      expect(lt.next()).toBeUndefined()
    })

    it('throws when not initialized', () => {
      const lt = new LoserTree<number>(2)
      expect(() => lt.next()).toThrow('not initialized')
    })

    it('handles runs of different lengths', () => {
      const lt = new LoserTree<number>(3)
      lt.initialize([[1, 10], [2, 4, 6, 8], [3]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([1, 2, 3, 4, 6, 8, 10])
    })

    it('handles equal elements across runs', () => {
      const lt = new LoserTree<number>(3)
      lt.initialize([[1, 1, 1], [1, 1], [1]])
      let count = 0
      while (!lt.isEmpty) {
        lt.next()
        count++
      }
      expect(count).toBe(6)
    })

    it('handles negative numbers', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[-5, -1, 3], [-3, 0, 4]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([-5, -3, -1, 0, 3, 4])
    })

    it('handles large number of runs', () => {
      const k = 16
      const lt = new LoserTree<number>(k)
      const runs: number[][] = []
      for (let i = 0; i < k; i++) {
        runs.push([i * 10, i * 10 + 5, i * 10 + 10])
      }
      lt.initialize(runs)
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toHaveLength(k * 3)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })
  })

  describe('peek', () => {
    it('returns the minimum element without removing', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      expect(lt.peek()).toBe(1)
      expect(lt.peek()).toBe(1)
    })

    it('returns undefined when empty', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2]])
      lt.next()
      lt.next()
      expect(lt.peek()).toBeUndefined()
    })

    it('updates after next', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      lt.next()
      expect(lt.peek()).toBe(2)
    })
  })

  describe('replaceMin', () => {
    it('replaces the current minimum with a new value', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 5], [3, 7]])
      const old = lt.replaceMin(2)
      expect(old).toBe(1)
      expect(lt.peek()).toBe(2)
    })

    it('throws when not initialized', () => {
      const lt = new LoserTree<number>(2)
      expect(() => lt.replaceMin(42)).toThrow('not initialized')
    })

    it('maintains sorted order after replacement', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 10], [5, 15]])
      lt.replaceMin(3)
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([3, 5, 10, 15])
    })
  })

  describe('properties', () => {
    it('size returns k', () => {
      const lt = new LoserTree(5)
      expect(lt.size).toBe(5)
    })

    it('totalElements returns remaining count', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 2, 3], [4, 5]])
      expect(lt.totalElements).toBe(5)
      lt.next()
      expect(lt.totalElements).toBe(4)
    })

    it('totalElements is 0 when all consumed', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2]])
      lt.next()
      lt.next()
      expect(lt.totalElements).toBe(0)
    })

    it('exhaustedRuns counts exhausted runs', () => {
      const lt = new LoserTree<number>(3)
      lt.initialize([[1], [2, 3], [4, 5, 6]])
      expect(lt.exhaustedRuns).toBe(0)
    })

    it('exhaustedRuns increases as runs deplete', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2, 3]])
      lt.next()
      expect(lt.exhaustedRuns).toBe(1)
    })

    it('exhaustedRuns is k when all empty', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2]])
      lt.next()
      lt.next()
      expect(lt.exhaustedRuns).toBe(2)
    })

    it('isEmpty tracks correctly', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2]])
      expect(lt.isEmpty).toBe(false)
      lt.next()
      lt.next()
      expect(lt.isEmpty).toBe(true)
    })
  })

  describe('static merge', () => {
    it('merges empty array of arrays', () => {
      expect(LoserTree.merge([])).toEqual([])
    })

    it('merges single array', () => {
      expect(LoserTree.merge([[1, 2, 3]])).toEqual([1, 2, 3])
    })

    it('merges two sorted arrays', () => {
      expect(LoserTree.merge([[1, 3, 5], [2, 4, 6]])).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges three sorted arrays', () => {
      expect(LoserTree.merge([[1, 4], [2, 5], [3, 6]])).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges with custom comparator (descending)', () => {
      const descComp: Comparator<number> = (a, b) => b - a
      const result = LoserTree.merge([[5, 3, 1], [6, 4, 2]], descComp)
      expect(result).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('merges arrays of different lengths', () => {
      expect(LoserTree.merge([[1], [2, 4], [3, 5, 6]])).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('merges arrays with empty arrays', () => {
      expect(LoserTree.merge([[], [1, 3], [2]])).toEqual([1, 2, 3])
    })

    it('merges all empty arrays', () => {
      expect(LoserTree.merge([[], [], []])).toEqual([])
    })

    it('does not mutate input arrays', () => {
      const a = [1, 3]
      const b = [2, 4]
      LoserTree.merge([a, b])
      expect(a).toEqual([1, 3])
      expect(b).toEqual([2, 4])
    })

    it('handles large merge', () => {
      const arrays: number[][] = []
      for (let i = 0; i < 8; i++) {
        arrays.push([i * 10, i * 10 + 5])
      }
      const result = LoserTree.merge(arrays)
      expect(result).toHaveLength(16)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })
  })

  describe('update', () => {
    it('updates the current element of a run', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 5], [3, 7]])
      lt.update(0, 0)
      expect(lt.peek()).toBe(0)
    })

    it('throws when not initialized', () => {
      const lt = new LoserTree<number>(2)
      expect(() => lt.update(0, 5)).toThrow('not initialized')
    })

    it('throws for out of range index', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2]])
      expect(() => lt.update(-1, 5)).toThrow('out of range')
      expect(() => lt.update(2, 5)).toThrow('out of range')
    })

    it('can increase a value', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 5], [3, 7]])
      lt.update(0, 10)
      expect(lt.peek()).toBe(3)
    })

    it('can decrease a value', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[5, 10], [3, 7]])
      lt.update(0, 1)
      expect(lt.peek()).toBe(1)
    })

    it('appends to exhausted run', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2, 3]])
      lt.next()
      expect(lt.exhaustedRuns).toBe(1)
      lt.update(0, 10)
      expect(lt.exhaustedRuns).toBe(0)
      expect(lt.peek()).toBe(2)
    })
  })

  describe('reset', () => {
    it('resets with new runs', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 2], [3, 4]])
      lt.next()
      lt.reset([[10, 20], [15, 25]])
      expect(lt.peek()).toBe(10)
      expect(lt.totalElements).toBe(4)
    })

    it('resets with empty runs', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 2], [3, 4]])
      lt.reset([[], []])
      expect(lt.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns all elements sorted without consuming', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      expect(lt.toArray()).toEqual([1, 2, 3, 4])
      expect(lt.totalElements).toBe(4)
      expect(lt.peek()).toBe(1)
    })

    it('returns empty array when not initialized', () => {
      const lt = new LoserTree<number>(2)
      expect(lt.toArray()).toEqual([])
    })

    it('returns empty array when all consumed', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1], [2]])
      lt.next()
      lt.next()
      expect(lt.toArray()).toEqual([])
    })

    it('can be called multiple times', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      expect(lt.toArray()).toEqual([1, 2, 3, 4])
      expect(lt.toArray()).toEqual([1, 2, 3, 4])
    })
  })

  describe('clone', () => {
    it('clones an initialized tree', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      const cl = lt.clone()
      expect(cl.toArray()).toEqual([1, 2, 3, 4])
    })

    it('clone is independent', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      const cl = lt.clone()
      cl.next()
      expect(lt.totalElements).toBe(4)
      expect(cl.totalElements).toBe(3)
    })

    it('clones uninitialized tree', () => {
      const lt = new LoserTree<number>(2)
      const cl = lt.clone()
      expect(cl.size).toBe(2)
      expect(cl.isEmpty).toBe(true)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      const result: number[] = []
      lt.forEach((v) => result.push(v))
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('provides correct index', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      const indices: number[] = []
      lt.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2, 3])
    })

    it('does not consume the tree', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      lt.forEach(() => {})
      expect(lt.totalElements).toBe(4)
    })

    it('handles empty tree', () => {
      const lt = new LoserTree<number>(2)
      let count = 0
      lt.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      expect([...lt]).toEqual([1, 2, 3, 4])
    })

    it('does not consume the tree', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      ;[...lt]
      expect(lt.totalElements).toBe(4)
    })

    it('works with for-of loop', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3], [2, 4]])
      const result: number[] = []
      for (const v of lt) {
        result.push(v)
      }
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('handles empty tree', () => {
      const lt = new LoserTree<number>(2)
      expect([...lt]).toEqual([])
    })
  })

  describe('custom comparator', () => {
    it('supports descending order', () => {
      const lt = new LoserTree<number>(2, (a, b) => b - a)
      lt.initialize([[5, 3, 1], [6, 4, 2]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([6, 5, 4, 3, 2, 1])
    })

    it('supports string comparison', () => {
      const lt = new LoserTree<string>(2)
      lt.initialize([['apple', 'orange'], ['banana', 'pear']])
      const result: string[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual(['apple', 'banana', 'orange', 'pear'])
    })

    it('supports object comparison by key', () => {
      interface Item { val: number }
      const lt = new LoserTree<Item>(2, (a, b) => a.val - b.val)
      lt.initialize([[{ val: 1 }, { val: 5 }], [{ val: 3 }, { val: 7 }]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v.val)
      }
      expect(result).toEqual([1, 3, 5, 7])
    })

    it('supports options object with comparator', () => {
      const lt = new LoserTree<number>(2, { comparator: (a, b) => b - a })
      lt.initialize([[5, 1], [6, 2]])
      expect(lt.next()).toBe(6)
    })
  })

  describe('edge cases', () => {
    it('handles k=1 with single element', () => {
      const lt = new LoserTree<number>(1)
      lt.initialize([[42]])
      expect(lt.next()).toBe(42)
      expect(lt.isEmpty).toBe(true)
    })

    it('handles k=1 with empty run', () => {
      const lt = new LoserTree<number>(1)
      lt.initialize([[]])
      expect(lt.isEmpty).toBe(true)
    })

    it('handles all elements being the same', () => {
      const lt = new LoserTree<number>(3)
      lt.initialize([[5, 5], [5, 5], [5]])
      let count = 0
      while (!lt.isEmpty) {
        const v = lt.next()
        expect(v).toBe(5)
        count++
      }
      expect(count).toBe(5)
    })

    it('handles one run much larger than others', () => {
      const lt = new LoserTree<number>(3)
      lt.initialize([[1], [2], [3, 4, 5, 6, 7, 8, 9, 10]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles floating point numbers', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1.1, 3.3], [2.2, 4.4]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([1.1, 2.2, 3.3, 4.4])
    })

    it('handles alternating empty runs', () => {
      const lt = new LoserTree<number>(3)
      lt.initialize([[1], [], [2]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([1, 2])
    })

    it('handles k=8 power of two', () => {
      const lt = new LoserTree<number>(8)
      const runs = [[1], [2], [3], [4], [5], [6], [7], [8]]
      lt.initialize(runs)
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('handles k=5 non-power-of-two', () => {
      const lt = new LoserTree<number>(5)
      lt.initialize([[10], [5], [15], [2], [8]])
      const result: number[] = []
      while (!lt.isEmpty) {
        const v = lt.next()
        if (v !== undefined) result.push(v)
      }
      expect(result).toEqual([2, 5, 8, 10, 15])
    })

    it('handles large values', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER], [0, 1]])
      const result = lt.toArray()
      expect(result[0]).toBe(0)
      expect(result[3]).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('stress tests', () => {
    it('merges 100 runs of varying sizes', () => {
      const k = 100
      const lt = new LoserTree<number>(k)
      const runs: number[][] = []
      for (let i = 0; i < k; i++) {
        const run: number[] = []
        for (let j = 0; j < 3; j++) {
          run.push(i + j * k)
        }
        runs.push(run)
      }
      lt.initialize(runs)
      const result = lt.toArray()
      expect(result).toHaveLength(k * 3)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThanOrEqual(result[i - 1]!)
      }
    })

    it('handles many duplicate values', () => {
      const lt = new LoserTree<number>(4)
      lt.initialize([[1, 1, 1, 1], [1, 1, 1], [1, 1], [1]])
      let count = 0
      while (!lt.isEmpty) {
        lt.next()
        count++
      }
      expect(count).toBe(10)
    })

    it('interleaved next and peek', () => {
      const lt = new LoserTree<number>(2)
      lt.initialize([[1, 3, 5, 7], [2, 4, 6, 8]])
      for (let i = 0; i < 8; i++) {
        expect(lt.peek()).toBe(i + 1)
        expect(lt.next()).toBe(i + 1)
      }
      expect(lt.isEmpty).toBe(true)
    })
  })

  describe('type exports', () => {
    it('exports Comparator type', () => {
      const comp: Comparator<number> = (a, b) => a - b
      expect(comp(1, 2)).toBe(-1)
    })
  })
})
