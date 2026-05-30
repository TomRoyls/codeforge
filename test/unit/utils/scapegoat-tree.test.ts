import { describe, expect, it } from 'vitest'
import { ScapegoatTree } from '../../../src/utils/scapegoat-tree.js'

describe('ScapegoatTree', () => {
  it('should create empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.min()).toBe(undefined)
    expect(tree.max()).toBe(undefined)
    expect(tree.height()).toBe(0)
  })

  it('should insert single element', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    expect(tree.size).toBe(1)
    expect(tree.isEmpty()).toBe(false)
    expect(tree.get(1)).toBe('one')
    expect(tree.has(1)).toBe(true)
  })

  it('should get inserted element', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(5, 'five')
    expect(tree.get(5)).toBe('five')
  })

  it('should return undefined for non-existent key', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.get(10)).toBe(undefined)
  })

  it('should check has correctly', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    expect(tree.has(1)).toBe(true)
    expect(tree.has(2)).toBe(false)
  })

  it('should update existing key value', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(1, 'updated')
    expect(tree.size).toBe(1)
    expect(tree.get(1)).toBe('updated')
  })

  it('should delete existing element', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    const deleted = tree.delete(1)
    expect(deleted).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.has(1)).toBe(false)
  })

  it('should return false when deleting non-existent key', () => {
    const tree = new ScapegoatTree<number, string>()
    const deleted = tree.delete(1)
    expect(deleted).toBe(false)
    expect(tree.size).toBe(0)
  })

  it('should get min element', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(1, 'one')
    tree.insert(3, 'three')
    expect(tree.min()).toBe(1)
  })

  it('should get max element', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(1, 'one')
    tree.insert(3, 'three')
    expect(tree.max()).toBe(5)
  })

  it('should return undefined for min and max on empty tree', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.min()).toBe(undefined)
    expect(tree.max()).toBe(undefined)
  })

  it('should track size correctly', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.size).toBe(0)
    tree.insert(1, 'one')
    expect(tree.size).toBe(1)
    tree.insert(2, 'two')
    expect(tree.size).toBe(2)
    tree.delete(1)
    expect(tree.size).toBe(1)
  })

  it('should return correct isEmpty', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.isEmpty()).toBe(true)
    tree.insert(1, 'one')
    expect(tree.isEmpty()).toBe(false)
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
  })

  it('should clear all elements', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.get(1)).toBe(undefined)
  })

  it('should return in-order traversal', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(3, 'three')
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    const result = tree.inOrderTraversal()
    expect(result).toEqual([
      { key: 1, value: 'one' },
      { key: 2, value: 'two' },
      { key: 3, value: 'three' }
    ])
  })

  it('should return keys in sorted order', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(2, 'two')
    tree.insert(8, 'eight')
    tree.insert(1, 'one')
    expect(tree.keys()).toEqual([1, 2, 5, 8])
  })

  it('should return values in sorted order by key', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(5, 'five')
    tree.insert(2, 'two')
    tree.insert(8, 'eight')
    tree.insert(1, 'one')
    expect(tree.values()).toEqual(['one', 'two', 'five', 'eight'])
  })

  it('should compute height correctly', () => {
    const tree = new ScapegoatTree<number, string>()
    expect(tree.height()).toBe(0)
    tree.insert(2, 'two')
    expect(tree.height()).toBe(1)
    tree.insert(1, 'one')
    tree.insert(3, 'three')
    expect(tree.height()).toBe(2)
  })

  it('should handle many insertions', () => {
    const tree = new ScapegoatTree<number, string>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, `value${i}`)
    }
    expect(tree.size).toBe(100)
    expect(tree.min()).toBe(0)
    expect(tree.max()).toBe(99)
  })

  it('should handle many deletions', () => {
    const tree = new ScapegoatTree<number, string>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, `value${i}`)
    }
    for (let i = 0; i < 100; i++) {
      expect(tree.delete(i)).toBe(true)
    }
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('should work with string keys', () => {
    const tree = new ScapegoatTree<string, number>(0.6, (a, b) => a.localeCompare(b))
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    tree.insert('cherry', 3)
    expect(tree.get('banana')).toBe(2)
    expect(tree.min()).toBe('apple')
    expect(tree.max()).toBe('cherry')
  })

  it('should work with custom comparator', () => {
    const tree = new ScapegoatTree<string, number>(0.7, (a, b) => b.localeCompare(a))
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    tree.insert('cherry', 3)
    expect(tree.min()).toBe('cherry')
    expect(tree.max()).toBe('apple')
  })

  it('should handle duplicate inserts correctly', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'first')
    tree.insert(1, 'second')
    expect(tree.size).toBe(1)
    expect(tree.get(1)).toBe('second')
  })

  it('should maintain in-order after many operations', () => {
    const tree = new ScapegoatTree<number, string>()
    const values = [50, 25, 75, 12, 37, 62, 87, 6, 18, 31]
    values.forEach(v => tree.insert(v, `value${v}`))
    const keys = tree.keys()
    expect(keys).toEqual([6, 12, 18, 25, 31, 37, 50, 62, 75, 87])
  })

  it('should find element after many insertions', () => {
    const tree = new ScapegoatTree<number, string>()
    for (let i = 0; i < 200; i++) {
      tree.insert(i, `value${i}`)
    }
    expect(tree.get(100)).toBe('value100')
    expect(tree.has(150)).toBe(true)
  })

  it('should delete element from middle of tree', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    expect(tree.delete(2)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.has(2)).toBe(false)
  })

  it('should delete min element', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    expect(tree.delete(1)).toBe(true)
    expect(tree.min()).toBe(2)
  })

  it('should delete max element', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    expect(tree.delete(3)).toBe(true)
    expect(tree.max()).toBe(2)
  })

  it('should handle interleaved insert and delete operations', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    tree.delete(2)
    tree.insert(4, 'four')
    tree.insert(5, 'five')
    tree.delete(1)
    expect(tree.size).toBe(3)
    expect(tree.has(2)).toBe(false)
    expect(tree.has(4)).toBe(true)
    expect(tree.has(5)).toBe(true)
  })

  it('should handle negative numbers', () => {
    const tree = new ScapegoatTree<number, string>()
    tree.insert(-5, 'minus-five')
    tree.insert(-3, 'minus-three')
    tree.insert(5, 'five')
    tree.insert(3, 'three')
    expect(tree.min()).toBe(-5)
    expect(tree.max()).toBe(5)
    expect(tree.get(-3)).toBe('minus-three')
  })

  it('should maintain logarithmic height after sorted inserts', () => {
    const tree = new ScapegoatTree<number, string>()
    for (let i = 0; i < 100; i++) {
      tree.insert(i, `value${i}`)
    }
    const height = tree.height()
    expect(height).toBeLessThan(20)
  })

  it('should reset to empty after clearing', () => {
    const tree = new ScapegoatTree<number, string>()
    for (let i = 0; i < 50; i++) {
      tree.insert(i, `value${i}`)
    }
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.height()).toBe(0)
  })

  it('should throw error for invalid alpha', () => {
    expect(() => new ScapegoatTree(0.5)).toThrow()
    expect(() => new ScapegoatTree(1)).toThrow()
    expect(() => new ScapegoatTree(0.3)).toThrow()
  })

  it('should handle random inserts and deletes', () => {
    const tree = new ScapegoatTree<number, string>()
    const values = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100))
    values.forEach(v => tree.insert(v, `value${v}`))
    const middleValues = values.slice(25, 40)
    middleValues.forEach(v => tree.delete(v))
    expect(tree.size).toBeGreaterThan(0)
  })
})