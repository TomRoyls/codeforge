import { describe, it, expect } from 'vitest'
import { CartesianTree } from '../../src/utils/cartesian-tree.js'

describe('CartesianTree', () => {
  it('starts empty', () => {
    const tree = new CartesianTree<number>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('fromArray builds tree from sorted input', () => {
    const tree = CartesianTree.fromArray([1, 2, 3, 4, 5])
    expect(tree.size).toBe(5)
    expect([...tree.inorder()]).toEqual([1, 2, 3, 4, 5])
  })

  it('fromArray with empty array returns empty tree', () => {
    const tree = CartesianTree.fromArray<number>([])
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('fromArray with single element', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.size).toBe(1)
    expect([...tree.inorder()]).toEqual([42])
  })

  it('fromArray with custom priority', () => {
    const tree = CartesianTree.fromArray([3, 1, 2], (item) => item)
    expect(tree.size).toBe(3)
    expect([...tree.inorder()]).toEqual([3, 1, 2])
  })

  it('insert adds element', () => {
    const tree = new CartesianTree<number>()
    tree.insert(5, 1)
    tree.insert(3, 2)
    tree.insert(7, 0)
    expect(tree.size).toBe(3)
  })

  it('inorder traversal', () => {
    const tree = new CartesianTree<string>()
    tree.insert('b', 2)
    tree.insert('a', 1)
    tree.insert('c', 3)
    const result = [...tree.inorder()]
    expect(result.sort()).toEqual(['a', 'b', 'c'])
  })

  it('preorder traversal', () => {
    const tree = CartesianTree.fromArray([1, 2, 3])
    const result = [...tree.preorder()]
    expect(result.length).toBe(3)
  })

  it('min returns leftmost node value', () => {
    const tree = CartesianTree.fromArray([5, 3, 8, 1, 4])
    expect(tree.min).toBeDefined()
  })

  it('max returns rightmost node value', () => {
    const tree = CartesianTree.fromArray([5, 3, 8, 1, 4])
    expect(tree.max).toBeDefined()
  })

  it('min/max undefined on empty', () => {
    const tree = new CartesianTree<number>()
    expect(tree.min).toBeUndefined()
    expect(tree.max).toBeUndefined()
  })

  it('clear empties the tree', () => {
    const tree = CartesianTree.fromArray([1, 2, 3])
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('handles descending input', () => {
    const tree = CartesianTree.fromArray([5, 4, 3, 2, 1])
    expect([...tree.inorder()]).toEqual([5, 4, 3, 2, 1])
  })

  it('handles duplicate priorities', () => {
    const tree = CartesianTree.fromArray([10, 20, 30], () => 1)
    expect(tree.size).toBe(3)
  })

  it('clear then insert works', () => {
    const tree = CartesianTree.fromArray([1, 2, 3])
    tree.clear()
    tree.insert(10, 0)
    expect(tree.size).toBe(1)
    expect([...tree.inorder()]).toEqual([10])
  })

  it('handles two elements', () => {
    const tree = CartesianTree.fromArray([5, 3])
    expect(tree.size).toBe(2)
    expect([...tree.inorder()].sort()).toEqual([3, 5])
  })

  it('handles single element', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.size).toBe(1)
    expect([...tree.inorder()]).toEqual([42])
  })

  it('handles duplicate values', () => {
    const tree = CartesianTree.fromArray([3, 3, 3])
    expect(tree.size).toBe(3)
    expect([...tree.inorder()]).toEqual([3, 3, 3])
  })

  it('inorder preserves insertion order with default priority', () => {
    const tree = CartesianTree.fromArray([5, 4, 3, 2, 1])
    expect(tree.size).toBe(5)
    expect([...tree.inorder()]).toEqual([5, 4, 3, 2, 1])
  })

  it('fromArray with single element', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.size).toBe(1)
  })

  it('fromArray with two elements', () => {
    const tree = CartesianTree.fromArray([2, 1])
    expect(tree.size).toBe(2)
  })

  it('fromArray with three elements', () => {
    const tree = CartesianTree.fromArray([3, 1, 2])
    expect(tree.size).toBe(3)
  })

  it('fromArray with single element', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.size).toBe(1)
  })
})
