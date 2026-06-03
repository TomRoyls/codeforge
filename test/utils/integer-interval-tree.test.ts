import { describe, it, expect } from 'vitest'
import { IntegerIntervalTree } from '../../src/utils/integer-interval-tree.js'

describe('IntegerIntervalTree', () => {
  it('inserts valid intervals', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    expect(tree.size).toBe(1)
  })

  it('ignores invalid intervals where lo > hi', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(5, 1, 'a')
    expect(tree.size).toBe(0)
  })

  it('allows equal lo and hi', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(3, 3, 'a')
    expect(tree.size).toBe(1)
  })

  it('queries point and returns matching intervals', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(10, 15, 'b')
    const result = tree.queryPoint(3)
    expect(result.length).toBe(1)
    expect(result[0]!.value).toBe('a')
  })

  it('returns empty array for point not in any interval', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    const result = tree.queryPoint(10)
    expect(result).toEqual([])
  })

  it('returns all intervals containing point', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 10, 'a')
    tree.insert(3, 5, 'b')
    tree.insert(5, 8, 'c')
    const result = tree.queryPoint(5)
    expect(result.length).toBe(3)
  })

  it('queries range and returns overlapping intervals', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(8, 12, 'b')
    tree.insert(6, 9, 'c')
    const result = tree.queryRange(4, 10)
    expect(result.length).toBe(3)
  })

  it('returns empty array for range with no overlaps', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(10, 15, 'b')
    const result = tree.queryRange(6, 9)
    expect(result).toEqual([])
  })

  it('contains returns true when point in any interval', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    expect(tree.contains(3)).toBe(true)
    expect(tree.contains(10)).toBe(false)
  })

  it('coversRange returns true when range fully covered', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(6, 10, 'b')
    expect(tree.coversRange(1, 10)).toBe(true)
  })

  it('coversRange returns false when gaps exist', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(10, 15, 'b')
    expect(tree.coversRange(1, 15)).toBe(false)
  })

  it('remove returns number of removed entries', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(1, 5, 'b')
    const removed = tree.remove(1, 5)
    expect(removed).toBe(2)
    expect(tree.size).toBe(0)
  })

  it('union merges two trees', () => {
    const tree1 = new IntegerIntervalTree<string>()
    tree1.insert(1, 5, 'a')
    const tree2 = new IntegerIntervalTree<string>()
    tree2.insert(6, 10, 'b')
    const merged = tree1.union(tree2)
    expect(merged.size).toBe(2)
  })

  it('size returns number of entries', () => {
    const tree = new IntegerIntervalTree<string>()
    expect(tree.size).toBe(0)
    tree.insert(1, 5, 'a')
    tree.insert(6, 10, 'b')
    expect(tree.size).toBe(2)
  })

  it('toArray returns all entries sorted by lo', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(6, 10, 'b')
    tree.insert(1, 5, 'a')
    tree.insert(11, 15, 'c')
    const arr = tree.toArray()
    expect(arr[0]!.lo).toBe(1)
    expect(arr[1]!.lo).toBe(6)
    expect(arr[2]!.lo).toBe(11)
  })

  it('toArray returns copies not references', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    const arr = tree.toArray()
    arr[0]!.value = 'b'
    const queried = tree.queryPoint(3)
    expect(queried[0]!.value).toBe('a')
  })

  it('queryRange finds overlapping intervals', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(10, 15, 'b')
    tree.insert(20, 25, 'c')
    const result = tree.queryRange(4, 12)
    expect(result.length).toBe(2)
  })

  it('remove decreases size', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(1, 5, 'a')
    tree.insert(6, 10, 'b')
    expect(tree.size).toBe(2)
    expect(tree.remove(1, 5)).toBe(1)
    expect(tree.size).toBe(1)
    expect(tree.queryPoint(3)).toHaveLength(0)
  })

  it('remove returns 0 for non-existent', () => {
    const tree = new IntegerIntervalTree<string>()
    expect(tree.remove(1, 5)).toBe(0)
  })

  it('queryPoint returns inserted value', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(0, 10, 'hello')
    const result = tree.queryPoint(5)
    expect(result.length).toBe(1)
    expect(result[0]!.value).toBe('hello')
  })

  it('query outside all intervals returns empty', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(0, 5, 'hello')
    expect(tree.queryPoint(10)).toEqual([])
  })

  it('queryPoint inside interval returns entry', () => {
    const tree = new IntegerIntervalTree<string>()
    tree.insert(0, 10, 'data')
    const result = tree.queryPoint(5)
    expect(result.length).toBe(1)
    expect(result[0]!.value).toBe('data')
  })
})