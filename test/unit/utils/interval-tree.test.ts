import { describe, expect, it } from 'vitest'
import { IntervalTree } from '../../../src/utils/interval-tree.js'

describe('IntervalTree', () => {
  it('insert single interval and query', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    const results = tree.query(5)
    expect(results).toHaveLength(1)
    expect(results[0].value).toBe(100)
  })

  it('insert updates size', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    expect(tree.size).toBe(1)
    tree.insert({ start: 11, end: 20 }, 200)
    expect(tree.size).toBe(2)
  })

  it('query returns intervals containing point', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 5, end: 15 }, 200)
    tree.insert({ start: 20, end: 30 }, 300)
    const results = tree.query(7)
    expect(results).toHaveLength(2)
    expect(results.map(r => r.value)).toContain(100)
    expect(results.map(r => r.value)).toContain(200)
  })

  it('query returns empty array for point not in any interval', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 20, end: 30 }, 200)
    const results = tree.query(15)
    expect(results).toHaveLength(0)
  })

  it('queryRange returns intervals overlapping range', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 5, end: 15 }, 200)
    tree.insert({ start: 20, end: 30 }, 300)
    const results = tree.queryRange(3, 12)
    expect(results).toHaveLength(2)
  })

  it('queryRange returns intervals fully contained in range', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 8 }, 100)
    const results = tree.queryRange(1, 20)
    expect(results).toHaveLength(1)
  })

  it('queryRange returns intervals partially overlapping', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 15, end: 25 }, 200)
    const results = tree.queryRange(8, 18)
    expect(results).toHaveLength(2)
  })

  it('queryRange returns empty for non-overlapping range', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 20, end: 30 }, 200)
    const results = tree.queryRange(12, 18)
    expect(results).toHaveLength(0)
  })

  it('queryRange includes intervals touching boundaries', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 10, end: 20 }, 200)
    const results = tree.queryRange(11, 15)
    expect(results).toHaveLength(1)
  })

  it('delete existing interval returns true', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    const result = tree.delete({ start: 1, end: 10 })
    expect(result).toBe(true)
  })

  it('delete reduces size', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 11, end: 20 }, 200)
    tree.delete({ start: 1, end: 10 })
    expect(tree.size).toBe(1)
  })

  it('delete non-existing interval returns false', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    const result = tree.delete({ start: 11, end: 20 })
    expect(result).toBe(false)
  })

  it('delete interval removes it from queries', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 5, end: 15 }, 200)
    tree.delete({ start: 1, end: 10 })
    const results = tree.query(5)
    expect(results).toHaveLength(1)
    expect(results[0].value).toBe(200)
  })

  it('isEmpty returns true for empty tree', () => {
    const tree = new IntervalTree<number>()
    expect(tree.isEmpty()).toBe(true)
  })

  it('isEmpty returns false for non-empty tree', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    expect(tree.isEmpty()).toBe(false)
  })

  it('isEmpty returns true after deleting all intervals', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.delete({ start: 1, end: 10 })
    expect(tree.isEmpty()).toBe(true)
  })

  it('clear removes all intervals', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 11, end: 20 }, 200)
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('clear on empty tree does nothing', () => {
    const tree = new IntervalTree<number>()
    tree.clear()
    expect(tree.size).toBe(0)
  })

  it('size returns correct count', () => {
    const tree = new IntervalTree<number>()
    expect(tree.size).toBe(0)
    tree.insert({ start: 1, end: 10 }, 100)
    expect(tree.size).toBe(1)
    tree.insert({ start: 11, end: 20 }, 200)
    expect(tree.size).toBe(2)
  })

  it('insert invalid interval (start > end) throws RangeError', () => {
    const tree = new IntervalTree<number>()
    expect(() => tree.insert({ start: 10, end: 5 }, 100)).toThrow(RangeError)
  })

  it('insert invalid interval (start > end) throws correct message', () => {
    const tree = new IntervalTree<number>()
    expect(() => tree.insert({ start: 10, end: 5 }, 100)).toThrow('start must be <= end')
  })

  it('handles zero-length interval', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 5 }, 100)
    const results = tree.query(5)
    expect(results).toHaveLength(1)
  })

  it('handles negative intervals', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: -10, end: -5 }, 100)
    const results = tree.query(-7)
    expect(results).toHaveLength(1)
  })

  it('handles intervals crossing zero', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: -5, end: 5 }, 100)
    const results = tree.query(0)
    expect(results).toHaveLength(1)
  })

  it('query point at interval start boundary', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 10 }, 100)
    const results = tree.query(5)
    expect(results).toHaveLength(1)
  })

  it('query point at interval end boundary', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 10 }, 100)
    const results = tree.query(10)
    expect(results).toHaveLength(1)
  })

  it('query point just before interval start', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 10 }, 100)
    const results = tree.query(4.9)
    expect(results).toHaveLength(0)
  })

  it('query point just after interval end', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 10 }, 100)
    const results = tree.query(10.1)
    expect(results).toHaveLength(0)
  })

  it('forEach iterates all intervals', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 11, end: 20 }, 200)
    tree.insert({ start: 21, end: 30 }, 300)
    const results: number[] = []
    tree.forEach((interval, value) => {
      results.push(value)
    })
    expect(results).toHaveLength(3)
    expect(results).toContain(100)
    expect(results).toContain(200)
    expect(results).toContain(300)
  })

  it('handles many intervals', () => {
    const tree = new IntervalTree<number>()
    const count = 100
    for (let i = 0; i < count; i++) {
      tree.insert({ start: i * 10, end: i * 10 + 5 }, i)
    }
    expect(tree.size).toBe(count)
  })

  it('query with many overlapping intervals returns correct count', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 5, end: 15 }, 200)
    tree.insert({ start: 10, end: 20 }, 300)
    tree.insert({ start: 7, end: 12 }, 400)
    const results = tree.query(8)
    expect(results).toHaveLength(3)
  })

  it('delete leaf node', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 11, end: 20 }, 200)
    tree.delete({ start: 11, end: 20 })
    expect(tree.size).toBe(1)
    const results = tree.query(15)
    expect(results).toHaveLength(0)
  })

  it('delete root node', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 10 }, 100)
    tree.insert({ start: 1, end: 5 }, 200)
    tree.insert({ start: 11, end: 15 }, 300)
    tree.delete({ start: 5, end: 10 })
    expect(tree.size).toBe(2)
  })

  it('handles overlapping intervals with same start', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 10 }, 100)
    tree.insert({ start: 5, end: 15 }, 200)
    tree.insert({ start: 5, end: 20 }, 300)
    const results = tree.query(7)
    expect(results).toHaveLength(3)
  })

  it('handles non-overlapping intervals', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 5 }, 100)
    tree.insert({ start: 10, end: 15 }, 200)
    tree.insert({ start: 20, end: 25 }, 300)
    const results = tree.query(3)
    expect(results).toHaveLength(1)
    expect(results[0].value).toBe(100)
  })

  it('queryRange with exact interval match', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 5, end: 10 }, 100)
    const results = tree.queryRange(5, 10)
    expect(results).toHaveLength(1)
  })

  it('insert multiple intervals with same value', () => {
    const tree = new IntervalTree<number>()
    tree.insert({ start: 1, end: 10 }, 100)
    tree.insert({ start: 11, end: 20 }, 100)
    tree.insert({ start: 21, end: 30 }, 100)
    expect(tree.size).toBe(3)
  })
})