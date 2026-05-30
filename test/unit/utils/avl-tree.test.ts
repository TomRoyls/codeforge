import { describe, expect, it } from 'vitest'
import { AVLTree } from '../../../src/utils/avl-tree.js'

describe('AVLTree', () => {
  it('should create empty tree', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.size).toBe(0)
    expect(tree.height).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('should insert single node', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.size).toBe(1)
    expect(tree.height).toBe(1)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.find(5)).toBe('five')
  })

  it('should insert multiple nodes', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    expect(tree.size).toBe(3)
    expect(tree.find(5)).toBe('five')
    expect(tree.find(3)).toBe('three')
    expect(tree.find(7)).toBe('seven')
  })

  it('should update value for duplicate key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(5, 'new five')
    expect(tree.size).toBe(1)
    expect(tree.find(5)).toBe('new five')
  })

  it('should find existing key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.find(5)).toBe('five')
  })

  it('should return undefined for non-existent key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.find(10)).toBeUndefined()
  })

  it('should contain existing key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.contains(5)).toBe(true)
  })

  it('should not contain non-existent key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.contains(10)).toBe(false)
  })

  it('should return min key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    tree.insert(1, 'one')
    expect(tree.min).toBe(1)
  })

  it('should return undefined for min on empty tree', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.min).toBeUndefined()
  })

  it('should return max key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    tree.insert(9, 'nine')
    expect(tree.max).toBe(9)
  })

  it('should return undefined for max on empty tree', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.max).toBeUndefined()
  })

  it('should delete leaf node', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    const deleted = tree.delete(3)
    expect(deleted).toBe(true)
    expect(tree.size).toBe(1)
    expect(tree.contains(3)).toBe(false)
  })

  it('should delete node with one child', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(1, 'one')
    const deleted = tree.delete(3)
    expect(deleted).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.contains(3)).toBe(false)
    expect(tree.contains(1)).toBe(true)
  })

  it('should delete node with two children', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    tree.insert(1, 'one')
    tree.insert(4, 'four')
    const deleted = tree.delete(3)
    expect(deleted).toBe(true)
    expect(tree.size).toBe(4)
    expect(tree.contains(3)).toBe(false)
  })

  it('should return false when deleting non-existent key', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    const deleted = tree.delete(10)
    expect(deleted).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('should return inOrder traversal', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    tree.insert(1, 'one')
    tree.insert(4, 'four')
    const result = tree.inOrder()
    expect(result).toEqual([
      { key: 1, value: 'one' },
      { key: 3, value: 'three' },
      { key: 4, value: 'four' },
      { key: 5, value: 'five' },
      { key: 7, value: 'seven' },
    ])
  })

  it('should return preOrder traversal', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    const result = tree.preOrder()
    expect(result.length).toBe(3)
    expect(result[0].key).toBe(5)
  })

  it('should clear all nodes', () => {
    const tree = new AVLTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    tree.insert(7, 'seven')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.height).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('should maintain balance on sorted insert', () => {
    const tree = new AVLTree<number, string>()
    for (let i = 1; i <= 10; i++) {
      tree.insert(i, `value${i}`)
    }
    expect(tree.size).toBe(10)
    expect(tree.height).toBeLessThan(10)
  })

  it('should maintain balance on reverse sorted insert', () => {
    const tree = new AVLTree<number, string>()
    for (let i = 10; i >= 1; i--) {
      tree.insert(i, `value${i}`)
    }
    expect(tree.size).toBe(10)
    expect(tree.height).toBeLessThan(10)
  })

  it('should handle random insert and delete', () => {
    const tree = new AVLTree<number, string>()
    const values = [5, 3, 7, 2, 4, 6, 8]
    for (const v of values) {
      tree.insert(v, `value${v}`)
    }
    expect(tree.size).toBe(7)
    tree.delete(3)
    tree.delete(7)
    expect(tree.size).toBe(5)
    expect(tree.contains(3)).toBe(false)
    expect(tree.contains(7)).toBe(false)
  })

  it('should work with custom comparator', () => {
    const tree = new AVLTree<string, number>((a, b) => a.localeCompare(b))
    tree.insert('banana', 1)
    tree.insert('apple', 2)
    tree.insert('cherry', 3)
    const result = tree.inOrder()
    expect(result[0].key).toBe('apple')
    expect(result[1].key).toBe('banana')
    expect(result[2].key).toBe('cherry')
  })

  it('should handle large number of nodes', () => {
    const tree = new AVLTree<number, string>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, `value${i}`)
    }
    expect(tree.size).toBe(100)
    expect(tree.height).toBeLessThan(100)
    expect(tree.find(50)).toBe('value50')
  })

  it('should handle empty tree operations', () => {
    const tree = new AVLTree<number, string>()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.height).toBe(0)
    expect(tree.inOrder()).toEqual([])
    expect(tree.preOrder()).toEqual([])
    expect(tree.delete(1)).toBe(false)
    expect(tree.find(1)).toBeUndefined()
    expect(tree.contains(1)).toBe(false)
  })
})