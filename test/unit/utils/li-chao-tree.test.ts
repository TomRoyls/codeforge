import { describe, expect, it } from 'vitest'
import { LiChaoTree } from '../../../src/utils/li-chao-tree.js'

describe('LiChaoTree', () => {
  it('constructor throws RangeError when xLo >= xHi', () => {
    expect(() => new LiChaoTree(10, 10)).toThrow(RangeError)
    expect(() => new LiChaoTree(10, 5)).toThrow(RangeError)
  })

  it('constructor creates tree with valid range', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.xRange).toEqual([0, 10])
    expect(tree.isEmpty()).toBe(true)
    expect(tree.lineCount()).toBe(0)
  })

  it('insert and query single line y=2x+1 at x=0 returns 1', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    expect(tree.query(0)).toBe(1)
  })

  it('insert and query single line y=2x+1 at x=5 returns 11', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    expect(tree.query(5)).toBe(11)
  })

  it('two lines y=2x+1 and y=x+5, at x=0 returns max(1,5)=5', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    tree.insert(1, 5)
    expect(tree.query(0)).toBe(5)
  })

  it('two lines y=2x+1 and y=x+5, at x=10 returns max(21,15)=21', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    tree.insert(1, 5)
    expect(tree.query(10)).toBe(21)
  })

  it('multiple lines query returns maximum at each point', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    tree.insert(1, 5)
    tree.insert(0, 8)
    expect(tree.query(0)).toBe(8)
    expect(tree.query(3)).toBe(8)
    expect(tree.query(7)).toBe(15)
  })

  it('insertForMin and queryMin work correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(2, 1)
    tree.insertForMin(1, 5)
    expect(tree.queryMin(0)).toBe(1)
    expect(tree.queryMin(5)).toBe(10)
    expect(tree.queryMin(10)).toBe(15)
  })

  it('queryMin returns correct minimum with multiple lines', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(2, 1)
    tree.insertForMin(-1, 10)
    tree.insertForMin(0, 5)
    expect(tree.queryMin(0)).toBe(1)
    expect(tree.queryMin(5)).toBe(5)
    expect(tree.queryMin(10)).toBe(-0)
  })

  it('isEmpty returns true for empty tree', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.isEmpty()).toBe(true)
  })

  it('isEmpty returns false after insertions', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    expect(tree.isEmpty()).toBe(false)
  })

  it('lineCount returns 0 for empty tree', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.lineCount()).toBe(0)
  })

  it('lineCount returns correct count after insertions', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.insert(2, 3)
    tree.insert(3, 4)
    expect(tree.lineCount()).toBe(3)
  })

  it('clear resets tree to empty', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.insert(2, 3)
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.lineCount()).toBe(0)
  })

  it('clear allows new insertions after clear', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    tree.clear()
    tree.insert(3, 4)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.lineCount()).toBe(1)
    expect(tree.query(0)).toBe(4)
  })

  it('fromLines creates tree from array of line pairs', () => {
    const lines: Array<[number, number]> = [[2, 1], [1, 5]]
    const tree = LiChaoTree.fromLines(lines, 0, 10)
    expect(tree.lineCount()).toBe(2)
    expect(tree.query(0)).toBe(5)
    expect(tree.query(10)).toBe(21)
  })

  it('fromLines with empty array creates empty tree', () => {
    const tree = LiChaoTree.fromLines([], 0, 10)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.lineCount()).toBe(0)
  })

  it('query returns NaN for x below range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    expect(tree.query(-1)).toBeNaN()
  })

  it('query returns NaN for x above range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(1, 2)
    expect(tree.query(11)).toBeNaN()
  })

  it('queryMin returns NaN for x below range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(1, 2)
    expect(tree.queryMin(-1)).toBeNaN()
  })

  it('queryMin returns NaN for x above range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insertForMin(1, 2)
    expect(tree.queryMin(11)).toBeNaN()
  })

  it('query at boundary xLo returns correct value', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    expect(tree.query(0)).toBe(1)
  })

  it('query at boundary xHi returns correct value', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    expect(tree.query(10)).toBe(21)
  })

  it('single line works correctly across range', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(3, 5)
    expect(tree.query(0)).toBe(5)
    expect(tree.query(5)).toBe(20)
    expect(tree.query(10)).toBe(35)
  })

  it('many lines (100+) queries return correct maximum', () => {
    const tree = new LiChaoTree(0, 10)
    for (let i = 0; i < 100; i++) {
      tree.insert(i, i * 10)
    }
    const maxLine = tree.query(10)
    expect(maxLine).toBe(99 * 10 + 99 * 10)
  })

  it('fromLines with many lines creates correct tree', () => {
    const lines: Array<[number, number]> = []
    for (let i = 0; i < 50; i++) {
      lines.push([i, i])
    }
    const tree = LiChaoTree.fromLines(lines, 0, 10)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.query(10)).toBe(539)
  })

  it('inserting duplicate lines works correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    tree.insert(2, 1)
    expect(tree.query(5)).toBe(11)
  })

  it('negative slopes work correctly', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(-2, 10)
    tree.insert(1, 0)
    expect(tree.query(0)).toBe(10)
    expect(tree.query(10)).toBe(10)
  })

  it('xRange getter returns correct values', () => {
    const tree = new LiChaoTree(-5, 15)
    expect(tree.xRange).toEqual([-5, 15])
  })

  it('query on empty tree returns -Infinity', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.query(5)).toBe(-Infinity)
  })

  it('queryMin on empty tree returns Infinity', () => {
    const tree = new LiChaoTree(0, 10)
    expect(tree.queryMin(5)).toBe(Infinity)
  })

  it('insertForMin and regular insert can coexist', () => {
    const tree = new LiChaoTree(0, 10)
    tree.insert(2, 1)
    tree.insertForMin(1, 5)
    expect(tree.query(5)).toBe(11)
    expect(tree.queryMin(5)).toBe(-11)
  })
})