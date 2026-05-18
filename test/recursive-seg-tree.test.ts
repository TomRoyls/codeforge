import { describe, it, expect } from 'vitest'
import { RecursiveSegTree } from '../src/core/recursive-seg-tree/index.js'

// ─── Construction and Basic Properties ───

describe('RecursiveSegTree: construction and basic properties', () => {
  it('constructs with an array of numbers', () => {
    const tree = new RecursiveSegTree([1, 2, 3, 4, 5])
    expect(tree.size).toBe(5)
    expect(tree.isEmpty).toBe(false)
  })

  it('constructs an empty tree', () => {
    const tree = new RecursiveSegTree([])
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('constructs with custom merge and identity', () => {
    const tree = new RecursiveSegTree([3, 1, 4], {
      merge: (a, b) => Math.min(a, b),
      identity: Infinity,
    })
    expect(tree.sum()).toBe(1)
  })

  it('fromArray static factory works', () => {
    const tree = RecursiveSegTree.fromArray([10, 20, 30])
    expect(tree.size).toBe(3)
    expect(tree.toArray()).toEqual([10, 20, 30])
  })

  it('toArray returns a copy', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    const arr = tree.toArray()
    arr[0] = 99
    expect(tree.get(0)).toBe(1)
  })
})

// ─── Query Operations ───

describe('RecursiveSegTree: query operations', () => {
  it('query returns sum over a range', () => {
    const tree = new RecursiveSegTree([1, 2, 3, 4, 5])
    expect(tree.query(0, 5)).toBe(15)
    expect(tree.query(1, 4)).toBe(9)
    expect(tree.query(2, 3)).toBe(3)
  })

  it('query with single element range', () => {
    const tree = new RecursiveSegTree([10, 20, 30])
    expect(tree.query(1, 2)).toBe(20)
  })

  it('query throws on empty tree', () => {
    const tree = new RecursiveSegTree([])
    expect(() => tree.query(0, 1)).toThrow(RangeError)
  })

  it('query throws on invalid range', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    expect(() => tree.query(-1, 2)).toThrow(RangeError)
    expect(() => tree.query(0, 4)).toThrow(RangeError)
    expect(() => tree.query(2, 1)).toThrow(RangeError)
  })

  it('rangeSum delegates to query', () => {
    const tree = new RecursiveSegTree([1, 2, 3, 4])
    expect(tree.rangeSum(0, 4)).toBe(10)
    expect(tree.rangeSum(1, 3)).toBe(5)
  })

  it('sum returns total sum', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    expect(tree.sum()).toBe(6)
  })

  it('sum on empty tree returns identity', () => {
    const tree = new RecursiveSegTree([])
    expect(tree.sum()).toBe(0)
  })

  it('prefixSum returns sum of first n elements', () => {
    const tree = new RecursiveSegTree([1, 2, 3, 4, 5])
    expect(tree.prefixSum(0)).toBe(0)
    expect(tree.prefixSum(3)).toBe(6)
    expect(tree.prefixSum(5)).toBe(15)
  })

  it('prefixSum throws on invalid n', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    expect(() => tree.prefixSum(-1)).toThrow(RangeError)
    expect(() => tree.prefixSum(4)).toThrow(RangeError)
  })

  it('rangeMin returns minimum in range', () => {
    const tree = new RecursiveSegTree([5, 3, 1, 4, 2])
    expect(tree.rangeMin(0, 5)).toBe(1)
    expect(tree.rangeMin(0, 2)).toBe(3)
    expect(tree.rangeMin(3, 5)).toBe(2)
  })

  it('rangeMax returns maximum in range', () => {
    const tree = new RecursiveSegTree([1, 5, 3, 2, 4])
    expect(tree.rangeMax(0, 5)).toBe(5)
    expect(tree.rangeMax(2, 5)).toBe(4)
  })

  it('rangeMin throws on empty tree', () => {
    const tree = new RecursiveSegTree([])
    expect(() => tree.rangeMin(0, 1)).toThrow(RangeError)
  })

  it('rangeMax throws on invalid range', () => {
    const tree = new RecursiveSegTree([1, 2])
    expect(() => tree.rangeMax(-1, 1)).toThrow(RangeError)
  })
})

// ─── Update and Access Operations ───

describe('RecursiveSegTree: update and access operations', () => {
  it('update changes a value and updates queries', () => {
    const tree = new RecursiveSegTree([1, 2, 3, 4, 5])
    tree.update(2, 10)
    expect(tree.get(2)).toBe(10)
    expect(tree.query(0, 5)).toBe(22)
  })

  it('update throws on out of bounds index', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    expect(() => tree.update(-1, 5)).toThrow(RangeError)
    expect(() => tree.update(3, 5)).toThrow(RangeError)
  })

  it('get returns the value at an index', () => {
    const tree = new RecursiveSegTree([10, 20, 30])
    expect(tree.get(0)).toBe(10)
    expect(tree.get(1)).toBe(20)
    expect(tree.get(2)).toBe(30)
  })

  it('get throws on out of bounds', () => {
    const tree = new RecursiveSegTree([1])
    expect(() => tree.get(-1)).toThrow(RangeError)
    expect(() => tree.get(1)).toThrow(RangeError)
  })

  it('set delegates to update', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    tree.set(1, 99)
    expect(tree.get(1)).toBe(99)
  })
})

// ─── Utility Methods ───

describe('RecursiveSegTree: utility methods', () => {
  it('first returns the first element', () => {
    const tree = new RecursiveSegTree([10, 20, 30])
    expect(tree.first()).toBe(10)
  })

  it('first throws on empty tree', () => {
    const tree = new RecursiveSegTree([])
    expect(() => tree.first()).toThrow(RangeError)
  })

  it('last returns the last element', () => {
    const tree = new RecursiveSegTree([10, 20, 30])
    expect(tree.last()).toBe(30)
  })

  it('last throws on empty tree', () => {
    const tree = new RecursiveSegTree([])
    expect(() => tree.last()).toThrow(RangeError)
  })

  it('indexOf finds existing element', () => {
    const tree = new RecursiveSegTree([5, 3, 8, 1])
    expect(tree.indexOf(8)).toBe(2)
    expect(tree.indexOf(5)).toBe(0)
  })

  it('indexOf returns -1 for missing element', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    expect(tree.indexOf(99)).toBe(-1)
  })

  it('min returns minimum value', () => {
    const tree = new RecursiveSegTree([5, 3, 8, 1, 4])
    expect(tree.min()).toBe(1)
  })

  it('max returns maximum value', () => {
    const tree = new RecursiveSegTree([5, 3, 8, 1, 4])
    expect(tree.max()).toBe(8)
  })

  it('min throws on empty tree', () => {
    expect(() => new RecursiveSegTree([]).min()).toThrow(RangeError)
  })

  it('max throws on empty tree', () => {
    expect(() => new RecursiveSegTree([]).max()).toThrow(RangeError)
  })
})

// ─── Mutation and Iteration ───

describe('RecursiveSegTree: mutation and iteration', () => {
  it('push adds an element and updates queries', () => {
    const tree = new RecursiveSegTree([1, 2])
    tree.push(3)
    expect(tree.size).toBe(3)
    expect(tree.last()).toBe(3)
    expect(tree.sum()).toBe(6)
  })

  it('pop removes and returns the last element', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    expect(tree.pop()).toBe(3)
    expect(tree.size).toBe(2)
    expect(tree.sum()).toBe(3)
  })

  it('pop returns undefined on empty tree', () => {
    const tree = new RecursiveSegTree([])
    expect(tree.pop()).toBeUndefined()
  })

  it('clear empties the tree', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('build replaces the internal data', () => {
    const tree = new RecursiveSegTree([1, 2])
    tree.build([10, 20, 30])
    expect(tree.size).toBe(3)
    expect(tree.sum()).toBe(60)
  })

  it('clone creates an independent copy', () => {
    const tree = new RecursiveSegTree([1, 2, 3])
    const copy = tree.clone()
    tree.update(0, 99)
    expect(copy.get(0)).toBe(1)
    expect(tree.get(0)).toBe(99)
  })

  it('forEach iterates all elements in order', () => {
    const tree = new RecursiveSegTree([10, 20, 30])
    const collected: number[] = []
    tree.forEach((v, i) => collected.push(v + i))
    expect(collected).toEqual([10, 21, 32])
  })

  it('is iterable with for-of', () => {
    const tree = new RecursiveSegTree([5, 6, 7])
    const collected: number[] = []
    for (const v of tree) collected.push(v)
    expect(collected).toEqual([5, 6, 7])
  })
})
