import { describe, expect, it } from 'vitest'
import { BTree } from '../../../src/utils/b-tree.js'

describe('BTree', () => {
  it('should create an empty tree', () => {
    const tree = new BTree()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.height).toBe(0)
  })

  it('should insert and find a single key-value pair', () => {
    const tree = new BTree()
    tree.insert(1, 'one')
    expect(tree.find(1)).toBe('one')
    expect(tree.contains(1)).toBe(true)
    expect(tree.size).toBe(1)
  })

  it('should return undefined for non-existent key', () => {
    const tree = new BTree()
    tree.insert(1, 'one')
    expect(tree.find(2)).toBe(undefined)
    expect(tree.contains(2)).toBe(false)
  })

  it('should update value for existing key', () => {
    const tree = new BTree()
    tree.insert(1, 'one')
    tree.insert(1, 'updated')
    expect(tree.find(1)).toBe('updated')
    expect(tree.size).toBe(1)
  })

  it('should handle multiple sequential inserts', () => {
    const tree = new BTree(2)
    for (let i = 1; i <= 10; i++) {
      tree.insert(i, `value-${i}`)
    }
    expect(tree.size).toBe(10)
    for (let i = 1; i <= 10; i++) {
      expect(tree.find(i)).toBe(`value-${i}`)
    }
  })

  it('should handle random inserts', () => {
    const tree = new BTree(2)
    const keys = [5, 2, 8, 1, 7, 3, 9, 4, 6, 10]
    keys.forEach(key => tree.insert(key, `value-${key}`))
    expect(tree.size).toBe(10)
    keys.forEach(key => {
      expect(tree.find(key)).toBe(`value-${key}`)
    })
  })

  it('should return minimum key', () => {
    const tree = new BTree()
    expect(tree.min).toBe(undefined)
    tree.insert(5, 'five')
    expect(tree.min).toBe(5)
    tree.insert(1, 'one')
    expect(tree.min).toBe(1)
    tree.insert(10, 'ten')
    expect(tree.min).toBe(1)
  })

  it('should return maximum key', () => {
    const tree = new BTree()
    expect(tree.max).toBe(undefined)
    tree.insert(5, 'five')
    expect(tree.max).toBe(5)
    tree.insert(1, 'one')
    expect(tree.max).toBe(5)
    tree.insert(10, 'ten')
    expect(tree.max).toBe(10)
  })

  it('should delete a key from leaf node', () => {
    const tree = new BTree(2)
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    expect(tree.delete(2)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.find(2)).toBe(undefined)
  })

  it('should delete from inner node and replace with predecessor', () => {
    const tree = new BTree(2)
    for (let i = 1; i <= 10; i++) {
      tree.insert(i, `value-${i}`)
    }
    tree.delete(5)
    expect(tree.size).toBe(9)
    expect(tree.find(5)).toBe(undefined)
  })

  it('should return false when deleting non-existent key', () => {
    const tree = new BTree()
    tree.insert(1, 'one')
    expect(tree.delete(2)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('should delete from empty tree', () => {
    const tree = new BTree()
    expect(tree.delete(1)).toBe(false)
  })

  it('should handle tree height growth with many inserts', () => {
    const tree = new BTree(2)
    for (let i = 1; i <= 50; i++) {
      tree.insert(i, `value-${i}`)
    }
    expect(tree.size).toBe(50)
    expect(tree.height).toBeGreaterThan(0)
  })

  it('should clear the tree', () => {
    const tree = new BTree()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.find(1)).toBe(undefined)
  })

  it('should iterate over all key-value pairs', () => {
    const tree = new BTree()
    tree.insert(3, 'three')
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    const collected: Array<{ key: number; value: string }> = []
    tree.forEach((key, value) => {
      collected.push({ key, value })
    })
    expect(collected).toHaveLength(3)
    expect(collected[0].key).toBe(1)
    expect(collected[1].key).toBe(2)
    expect(collected[2].key).toBe(3)
  })

  it('should work with string keys', () => {
    const tree = new BTree(2, (a: string, b: string) => a.localeCompare(b))
    tree.insert('apple', 'red')
    tree.insert('banana', 'yellow')
    tree.insert('cherry', 'red')
    expect(tree.find('banana')).toBe('yellow')
    expect(tree.contains('apple')).toBe(true)
    expect(tree.size).toBe(3)
  })

  it('should work with custom comparator', () => {
    const tree = new BTree(2, (a, b) => a.localeCompare(b))
    tree.insert('zebra', 'striped')
    tree.insert('apple', 'red')
    tree.insert('monkey', 'brown')
    expect(tree.min).toBe('apple')
    expect(tree.max).toBe('zebra')
  })

  it('should handle large number of inserts', () => {
    const tree = new BTree(2)
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i, `value-${i}`)
    }
    expect(tree.size).toBe(1000)
    expect(tree.min).toBe(1)
    expect(tree.max).toBe(1000)
  })

  it('should maintain consistency after multiple delete operations', () => {
    const tree = new BTree(2)
    for (let i = 1; i <= 20; i++) {
      tree.insert(i, `value-${i}`)
    }
    for (let i = 1; i <= 10; i++) {
      tree.delete(i)
    }
    expect(tree.size).toBe(10)
    expect(tree.min).toBe(11)
    expect(tree.max).toBe(20)
  })

  it('should handle duplicate inserts correctly', () => {
    const tree = new BTree()
    tree.insert(1, 'first')
    tree.insert(1, 'second')
    tree.insert(1, 'third')
    expect(tree.find(1)).toBe('third')
    expect(tree.size).toBe(1)
  })

  it('should update value and preserve size on duplicate insert', () => {
    const tree = new BTree()
    tree.insert(1, 'original')
    expect(tree.size).toBe(1)
    tree.insert(1, 'updated')
    expect(tree.size).toBe(1)
    expect(tree.find(1)).toBe('updated')
  })

  it('should return correct size after various operations', () => {
    const tree = new BTree()
    expect(tree.size).toBe(0)
    tree.insert(1, 'one')
    expect(tree.size).toBe(1)
    tree.insert(2, 'two')
    expect(tree.size).toBe(2)
    tree.delete(1)
    expect(tree.size).toBe(1)
    tree.clear()
    expect(tree.size).toBe(0)
  })

  it('should handle deletion from tree with different order', () => {
    const tree = new BTree(3)
    for (let i = 1; i <= 15; i++) {
      tree.insert(i, `value-${i}`)
    }
    tree.delete(8)
    tree.delete(3)
    tree.delete(12)
    expect(tree.size).toBe(12)
    expect(tree.contains(8)).toBe(false)
    expect(tree.contains(3)).toBe(false)
    expect(tree.contains(12)).toBe(false)
  })

  it('should delete root when it becomes empty', () => {
    const tree = new BTree(2)
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    tree.insert(4, 'four')
    tree.insert(5, 'five')
    expect(tree.height).toBeGreaterThan(0)
    for (let i = 5; i >= 1; i--) {
      tree.delete(i)
    }
    expect(tree.size).toBe(0)
    expect(tree.height).toBe(0)
  })

  it('should forEach in correct order after random inserts', () => {
    const tree = new BTree()
    const keys = [10, 5, 15, 3, 7, 12, 18, 1, 4, 6]
    keys.forEach(key => tree.insert(key, `value-${key}`))
    const collected: number[] = []
    tree.forEach((key) => {
      collected.push(key)
    })
    expect(collected).toEqual([1, 3, 4, 5, 6, 7, 10, 12, 15, 18])
  })
})