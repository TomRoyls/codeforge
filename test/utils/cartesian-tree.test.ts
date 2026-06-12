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

  it('fromArray with two elements', () => {
    const tree = CartesianTree.fromArray([2, 1])
    expect(tree.size).toBe(2)
  })

  it('fromArray with three elements', () => {
    const tree = CartesianTree.fromArray([3, 1, 2])
    expect(tree.size).toBe(3)
  })

  it('fromArray with empty array has size 0', () => {
    const tree = CartesianTree.fromArray([])
    expect(tree.size).toBe(0)
  })

  it('insert into empty tree', () => {
    const tree = new CartesianTree<number>()
    tree.insert(10, 0)
    expect(tree.size).toBe(1)
    expect(tree.isEmpty).toBe(false)
    expect([...tree.inorder()]).toEqual([10])
  })

  it('insert multiple elements with increasing priority', () => {
    const tree = new CartesianTree<number>()
    tree.insert(1, 0)
    tree.insert(2, 1)
    tree.insert(3, 2)
    tree.insert(4, 3)
    expect(tree.size).toBe(4)
  })

  it('insert multiple elements with decreasing priority', () => {
    const tree = new CartesianTree<number>()
    tree.insert(4, 3)
    tree.insert(3, 2)
    tree.insert(2, 1)
    tree.insert(1, 0)
    expect(tree.size).toBe(4)
  })

  it('insert elements with same priority', () => {
    const tree = new CartesianTree<number>()
    tree.insert(1, 0)
    tree.insert(2, 0)
    tree.insert(3, 0)
    expect(tree.size).toBe(3)
  })

  it('insert with mixed priorities', () => {
    const tree = new CartesianTree<number>()
    tree.insert(1, 2)
    tree.insert(2, 0)
    tree.insert(3, 3)
    tree.insert(4, 1)
    expect(tree.size).toBe(4)
  })

  it('fromArray with custom priority function using index', () => {
    const tree = CartesianTree.fromArray([10, 20, 30], (_, i) => -i)
    expect(tree.size).toBe(3)
  })

  it('fromArray with negative priorities', () => {
    const tree = CartesianTree.fromArray([1, 2, 3], () => -5)
    expect(tree.size).toBe(3)
  })

  it('fromArray with string values', () => {
    const tree = CartesianTree.fromArray(['a', 'b', 'c'])
    expect(tree.size).toBe(3)
    expect([...tree.inorder()]).toEqual(['a', 'b', 'c'])
  })

  it('fromArray with object values', () => {
    const tree = CartesianTree.fromArray([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(tree.size).toBe(3)
  })

  it('insert with string values', () => {
    const tree = new CartesianTree<string>()
    tree.insert('first', 0)
    tree.insert('second', 1)
    expect(tree.size).toBe(2)
  })

  it('insert with object values', () => {
    const tree = new CartesianTree<{ name: string }>()
    tree.insert({ name: 'Alice' }, 0)
    tree.insert({ name: 'Bob' }, 1)
    expect(tree.size).toBe(2)
  })

  it('preorder traversal with multiple elements', () => {
    const tree = CartesianTree.fromArray([1, 2, 3, 4, 5])
    const result = [...tree.preorder()]
    expect(result.length).toBe(5)
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result).toContain(3)
    expect(result).toContain(4)
    expect(result).toContain(5)
  })

  it('preorder traversal with empty tree', () => {
    const tree = new CartesianTree<number>()
    expect([...tree.preorder()]).toEqual([])
  })

  it('inorder traversal with empty tree', () => {
    const tree = new CartesianTree<number>()
    expect([...tree.inorder()]).toEqual([])
  })

  it('min returns first element in inorder', () => {
    const tree = CartesianTree.fromArray([5, 1, 3, 2, 4])
    expect([...tree.inorder()]).toContain(tree.min)
  })

  it('max returns last element in inorder', () => {
    const tree = CartesianTree.fromArray([5, 1, 3, 2, 4])
    expect([...tree.inorder()]).toContain(tree.max)
  })

  it('size increases with each insert', () => {
    const tree = new CartesianTree<number>()
    expect(tree.size).toBe(0)
    tree.insert(1, 0)
    expect(tree.size).toBe(1)
    tree.insert(2, 1)
    expect(tree.size).toBe(2)
    tree.insert(3, 2)
    expect(tree.size).toBe(3)
  })

  it('isEmpty is true for empty tree', () => {
    const tree = new CartesianTree<number>()
    expect(tree.isEmpty).toBe(true)
  })

  it('isEmpty is false for non-empty tree', () => {
    const tree = new CartesianTree<number>()
    tree.insert(1, 0)
    expect(tree.isEmpty).toBe(false)
  })

  it('clear on empty tree', () => {
    const tree = new CartesianTree<number>()
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty).toBe(true)
  })

  it('fromArray preserves all elements', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const tree = CartesianTree.fromArray(input)
    const inorder = [...tree.inorder()]
    expect(inorder.length).toBe(input.length)
    input.forEach((val) => expect(inorder).toContain(val))
  })

  it('insert preserves all elements', () => {
    const tree = new CartesianTree<number>()
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    values.forEach((v, i) => tree.insert(v, i))
    const inorder = [...tree.inorder()]
    expect(inorder.length).toBe(values.length)
    values.forEach((val) => expect(inorder).toContain(val))
  })

  it('fromArray with large array', () => {
    const input = Array.from({ length: 100 }, (_, i) => i)
    const tree = CartesianTree.fromArray(input)
    expect(tree.size).toBe(100)
  })

  it('insert with large number of elements', () => {
    const tree = new CartesianTree<number>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, i)
    }
    expect(tree.size).toBe(100)
  })

  it('min and max on single element tree', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.min).toBe(42)
    expect(tree.max).toBe(42)
  })

  it('traversals match element count', () => {
    const tree = CartesianTree.fromArray([1, 2, 3, 4, 5])
    expect([...tree.inorder()].length).toBe(5)
    expect([...tree.preorder()].length).toBe(5)
  })

  it('should handle single element', () => {
    const tree = CartesianTree.fromArray([42])
    expect(tree.root).toBeDefined()
  })

  it('should handle sorted input', () => {
    const tree = CartesianTree.fromArray([1, 2, 3, 4])
    expect(tree.root).toBeDefined()
    const preorder = [...tree.preorder()]
    expect(preorder.length).toBe(4)
  })

  it('should handle reverse sorted input', () => {
    const tree = CartesianTree.fromArray([4, 3, 2, 1])
    expect(tree.root).toBeDefined()
  })

  it('should handle duplicate values', () => {
    const tree = CartesianTree.fromArray([3, 1, 3, 2])
    expect(tree.root).toBeDefined()
  })

  it('should iterate inorder', () => {
    const tree = CartesianTree.fromArray([3, 1, 2])
    const inorder = [...tree.inorder()]
    expect(inorder.length).toBe(3)
  })

  it('should iterate postorder', () => {
    const tree = CartesianTree.fromArray([3, 1, 2])
    const preorder = [...tree.preorder()]
    const inorder = [...tree.inorder()]
    expect(preorder.length).toBe(3)
    expect(inorder.length).toBe(3)
  })
})