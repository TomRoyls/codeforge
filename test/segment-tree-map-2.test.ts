import { describe, it, expect } from 'vitest'
import { SegmentTreeMap2 } from '../src/core/segment-tree-map-2/index'

describe('SegmentTreeMap2', () => {
  it('should create tree with correct size', async () => {
    const tree = new SegmentTreeMap2(10)
    expect(tree.size).toBe(10)
  })

  it('should report empty when size is 0', async () => {
    const tree = new SegmentTreeMap2(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('should report not empty when size is greater than 0', async () => {
    const tree = new SegmentTreeMap2(5)
    expect(tree.isEmpty()).toBe(false)
  })

  it('should initialize all values to 0', async () => {
    const tree = new SegmentTreeMap2(5)
    expect(tree.get(0)).toBe(0)
    expect(tree.get(2)).toBe(0)
    expect(tree.get(4)).toBe(0)
  })

  it('should set and get single value', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(2, 10)
    expect(tree.get(2)).toBe(10)
  })

  it('should set multiple values', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.set(3, 4)
    tree.set(4, 5)
    expect(tree.get(0)).toBe(1)
    expect(tree.get(1)).toBe(2)
    expect(tree.get(2)).toBe(3)
    expect(tree.get(3)).toBe(4)
    expect(tree.get(4)).toBe(5)
  })

  it('should overwrite existing value on set', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(2, 10)
    tree.set(2, 20)
    expect(tree.get(2)).toBe(20)
  })

  it('should query range correctly', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.set(3, 4)
    tree.set(4, 5)
    expect(tree.queryRange(0, 4)).toBe(15)
    expect(tree.queryRange(1, 3)).toBe(9)
    expect(tree.queryRange(2, 2)).toBe(3)
  })

  it('should update range correctly', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.set(3, 4)
    tree.set(4, 5)
    tree.updateRange(1, 3, 10)
    expect(tree.get(0)).toBe(1)
    expect(tree.get(1)).toBe(12)
    expect(tree.get(2)).toBe(13)
    expect(tree.get(3)).toBe(14)
    expect(tree.get(4)).toBe(5)
  })

  it('should query range after update', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.set(3, 4)
    tree.set(4, 5)
    tree.updateRange(1, 3, 10)
    expect(tree.queryRange(0, 4)).toBe(45)
    expect(tree.queryRange(1, 3)).toBe(39)
  })

  it('should handle single element tree', async () => {
    const tree = new SegmentTreeMap2(1)
    tree.set(0, 42)
    expect(tree.get(0)).toBe(42)
    expect(tree.queryRange(0, 0)).toBe(42)
    tree.updateRange(0, 0, 8)
    expect(tree.get(0)).toBe(50)
  })

  it('should handle boundary queries', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(4, 5)
    expect(tree.queryRange(0, 0)).toBe(1)
    expect(tree.queryRange(4, 4)).toBe(5)
    expect(tree.queryRange(0, 1)).toBe(1)
  })

  it('should handle out of bounds get gracefully', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(2, 10)
    expect(tree.get(-1)).toBe(0)
    expect(tree.get(10)).toBe(0)
  })

  it('should handle out of bounds set gracefully', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(-1, 10)
    tree.set(10, 20)
    expect(tree.queryRange(0, 4)).toBe(0)
  })

  it('should handle out of bounds query gracefully', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    expect(tree.queryRange(-1, 2)).toBe(0)
    expect(tree.queryRange(3, 10)).toBe(0)
    expect(tree.queryRange(3, 2)).toBe(0)
  })

  it('should handle out of bounds update gracefully', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.updateRange(-1, 2, 10)
    tree.updateRange(3, 10, 20)
    tree.updateRange(3, 2, 30)
    expect(tree.get(0)).toBe(1)
    expect(tree.get(1)).toBe(2)
    expect(tree.get(2)).toBe(3)
  })

  it('should convert to array correctly', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.set(3, 4)
    tree.set(4, 5)
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('should convert empty tree to array', async () => {
    const tree = new SegmentTreeMap2(0)
    expect(tree.toArray()).toEqual([])
  })

  it('should convert zero-initialized tree to array', async () => {
    const tree = new SegmentTreeMap2(3)
    expect(tree.toArray()).toEqual([0, 0, 0])
  })

  it('should handle multiple range updates', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.set(3, 4)
    tree.set(4, 5)
    tree.updateRange(0, 2, 10)
    tree.updateRange(2, 4, 5)
    expect(tree.get(0)).toBe(11)
    expect(tree.get(1)).toBe(12)
    expect(tree.get(2)).toBe(18)
    expect(tree.get(3)).toBe(9)
    expect(tree.get(4)).toBe(10)
  })

  it('should handle set after range update', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.updateRange(0, 2, 10)
    tree.set(1, 100)
    expect(tree.get(0)).toBe(11)
    expect(tree.get(1)).toBe(100)
    expect(tree.get(2)).toBe(13)
  })

  it('should handle large datasets', async () => {
    const tree = new SegmentTreeMap2(1000)
    for (let i = 0; i < 1000; i++) {
      tree.set(i, i)
    }
    expect(tree.queryRange(0, 999)).toBe(499500)
    expect(tree.queryRange(0, 9)).toBe(45)
    expect(tree.queryRange(990, 999)).toBe(9945)
    tree.updateRange(0, 999, 1)
    expect(tree.queryRange(0, 999)).toBe(500500)
    expect(tree.get(500)).toBe(501)
  })

  it('should handle negative delta in range update', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 10)
    tree.set(1, 20)
    tree.set(2, 30)
    tree.updateRange(0, 2, -5)
    expect(tree.get(0)).toBe(5)
    expect(tree.get(1)).toBe(15)
    expect(tree.get(2)).toBe(25)
  })

  it('should handle complex scenario with mixed operations', async () => {
    const tree = new SegmentTreeMap2(10)
    for (let i = 0; i < 10; i++) {
      tree.set(i, i)
    }
    tree.updateRange(2, 7, 5)
    tree.set(4, 100)
    tree.updateRange(0, 3, -2)
    expect(tree.get(0)).toBe(-2)
    expect(tree.get(1)).toBe(-1)
    expect(tree.get(2)).toBe(5)
    expect(tree.get(3)).toBe(6)
    expect(tree.get(4)).toBe(100)
    expect(tree.get(5)).toBe(10)
    expect(tree.get(6)).toBe(11)
    expect(tree.get(7)).toBe(12)
    expect(tree.get(8)).toBe(8)
    expect(tree.get(9)).toBe(9)
    expect(tree.queryRange(0, 9)).toBe(158)
  })

  it('should handle size property', async () => {
    const tree = new SegmentTreeMap2(42)
    expect(tree.size).toBe(42)
  })

  it('should return empty array for zero size', async () => {
    const tree = new SegmentTreeMap2(0)
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.toArray()).toEqual([])
  })

  it('should handle set and get at boundaries', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 10)
    tree.set(4, 20)
    expect(tree.get(0)).toBe(10)
    expect(tree.get(4)).toBe(20)
    expect(tree.get(2)).toBe(0)
  })

  it('should handle negative update range values', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 10)
    tree.set(1, 10)
    tree.set(2, 10)
    tree.updateRange(0, 2, -5)
    expect(tree.get(0)).toBe(5)
    expect(tree.get(1)).toBe(5)
    expect(tree.get(2)).toBe(5)
  })

  it('should handle queryRange on single element', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(2, 42)
    expect(tree.queryRange(2, 2)).toBe(42)
  })

  it('should handle get out of bounds returning 0', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(2, 10)
    expect(tree.get(-1)).toBe(0)
    expect(tree.get(5)).toBe(0)
  })

  it('should handle size property', async () => {
    const tree = new SegmentTreeMap2(5)
    expect(tree.size).toBe(5)
  })

  it('should handle updateRange', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    tree.updateRange(0, 2, 10)
    expect(tree.get(0)).toBe(11)
    expect(tree.get(1)).toBe(12)
    expect(tree.get(2)).toBe(13)
  })

  it('should handle toArray', async () => {
    const tree = new SegmentTreeMap2(3)
    tree.set(0, 1)
    tree.set(1, 2)
    tree.set(2, 3)
    const arr = tree.toArray()
    expect(arr).toEqual([1, 2, 3])
  })

  it('should handle isEmpty', async () => {
    const tree = new SegmentTreeMap2(3)
    tree.set(0, 1)
    expect(tree.isEmpty()).toBe(false)
  })

  it('should report correct size and isEmpty', async () => {
    const empty = new SegmentTreeMap2(0)
    expect(empty.isEmpty()).toBe(true)
    expect(empty.size).toBe(0)
    const tree = new SegmentTreeMap2(5)
    expect(tree.size).toBe(5)
    expect(tree.isEmpty()).toBe(false)
  })

  it('should handle toArray', async () => {
    const tree = new SegmentTreeMap2(3)
    tree.set(0, 10)
    tree.set(1, 20)
    tree.set(2, 30)
    const arr = tree.toArray()
    expect(arr).toEqual([10, 20, 30])
  })

  it('should handle queryRange', async () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 10)
    tree.set(1, 20)
    tree.set(2, 30)
    tree.set(3, 40)
    tree.set(4, 50)
    expect(tree.queryRange(0, 4)).toBe(150)
  })

  it('should handle isEmpty on non-empty tree', () => {
    const tree = new SegmentTreeMap2(5)
    tree.set(0, 10)
    expect(tree.isEmpty()).toBe(false)
  })
})
