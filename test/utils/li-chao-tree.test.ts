import { describe, it, expect } from 'vitest'
import { LiChaoTree } from '../../src/utils/li-chao-tree.js'

describe('LiChaoTree', () => {
  it('constructs tree with valid range', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.xRange).toEqual([0, 10])
    expect(tree.isEmpty()).toBe(true)
  })

  it('throws error when xLo >= xHi', () => {
    expect(() => new LiChaoTree(10, 10)).toThrow(RangeError)
    expect(() => new LiChaoTree(15, 5)).toThrow(RangeError)
  })

  it('inserts single line and queries correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 3)
    expect(tree.query(0)).toBe(3)
    expect(tree.query(5)).toBe(13)
    expect(tree.query(10)).toBe(23)
  })

  it('returns NaN for queries outside range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 1)
    expect(tree.query(-1)).toBeNaN()
    expect(tree.query(11)).toBeNaN()
    expect(tree.query(100)).toBeNaN()
  })

  it('queries maximum of multiple lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 3)
    tree.insert(-1, 10)
    expect(tree.query(0)).toBe(10)
    expect(tree.query(7)).toBe(17)
  })

  it('insertForMin and queryMin work correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(1, 5)
    tree.insertForMin(-2, 20)
    expect(tree.queryMin(0)).toBe(5)
    expect(tree.queryMin(8)).toBe(4)
  })

  it('queryMin returns NaN for out of range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(1, 1)
    expect(tree.queryMin(-5)).toBeNaN()
  })

  it('isEmpty returns correct state', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.isEmpty()).toBe(true)
    tree.insert(1, 1)
    expect(tree.isEmpty()).toBe(false)
  })

  it('lineCount returns correct count', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.lineCount()).toBe(0)
    tree.insert(1, 2)
    tree.insert(3, 4)
    expect(tree.lineCount()).toBe(2)
  })

  it('clear removes all lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.insert(3, 4)
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.lineCount()).toBe(0)
  })

  it('xRange returns correct range', () => {
    const tree = new LiChaoTree(-100, 100)
    expect(tree.xRange).toEqual([-100, 100])
  })

  it('fromLines creates tree with multiple lines', () => {
    const tree = LiChaoTree.fromLines([[1, 2], [3, 4], [-1, 10]], 0, 10)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.query(0)).toBe(10)
    expect(tree.lineCount()).toBeGreaterThanOrEqual(1)
  })

  it('handles parallel lines correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 0)
    tree.insert(1, 5)
    tree.insert(1, 10)
    expect(tree.query(5)).toBe(15)
  })

  it('handles vertical scenario with intercept lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0, 5)
    tree.insert(0, 10)
    expect(tree.query(3)).toBe(10)
  })

  it('handles negative x range', () => {
    const tree = new LiChaoTree(-10, 10)
    tree.insert(1, 0)
    expect(tree.query(0)).toBe(0)
    expect(tree.query(-5)).toBe(-5)
    expect(tree.query(5)).toBe(5)
  })

  it('multiple lines with different slopes', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 0)
    tree.insert(-1, 15)
    tree.insert(0, 5)
    expect(tree.query(5)).toBe(10)
  })

  it('constant lines compete correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0, 3)
    tree.insert(0, 7)
    expect(tree.query(5)).toBe(7)
  })

  it('handles single point query', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 0)
    expect(tree.query(5)).toBe(5)
  })

  it('query at boundary', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(0, 5)
    expect(tree.query(0)).toBe(5)
    expect(tree.query(10)).toBe(5)
  })
})