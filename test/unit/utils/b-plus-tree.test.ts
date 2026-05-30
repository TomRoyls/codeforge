import { describe, expect, it } from 'vitest'
import { BPlusTree } from '../../../src/utils/b-plus-tree.js'

describe('BPlusTree', () => {
  it('should create an empty tree', () => {
    const tree = new BPlusTree()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.height).toBe(0)
  })

  it('should insert and get a single key-value pair', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'one')
    expect(tree.get(1)).toBe('one')
    expect(tree.has(1)).toBe(true)
    expect(tree.size).toBe(1)
  })

  it('should return undefined for non-existent key', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'one')
    expect(tree.get(2)).toBe(undefined)
    expect(tree.has(2)).toBe(false)
  })

  it('should update value for existing key', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'one')
    tree.insert(1, 'updated')
    expect(tree.get(1)).toBe('updated')
    expect(tree.size).toBe(1)
  })

  it('should handle multiple sequential inserts', () => {
    const tree = new BPlusTree(4)
    for (let i = 1; i <= 10; i++) {
      tree.insert(i, `value-${i}`)
    }
    expect(tree.size).toBe(10)
    for (let i = 1; i <= 10; i++) {
      expect(tree.get(i)).toBe(`value-${i}`)
    }
  })

  it('should handle random inserts', () => {
    const tree = new BPlusTree(4)
    const keys = [5, 2, 8, 1, 7, 3, 9, 4, 6, 10]
    keys.forEach(key => tree.insert(key, `value-${key}`))
    expect(tree.size).toBe(10)
    keys.forEach(key => {
      expect(tree.get(key)).toBe(`value-${key}`)
    })
  })

  it('should return minimum key', () => {
    const tree = new BPlusTree()
    expect(tree.min()).toBe(undefined)
    tree.insert(5, 'five')
    expect(tree.min()).toBe(5)
    tree.insert(1, 'one')
    expect(tree.min()).toBe(1)
    tree.insert(10, 'ten')
    expect(tree.min()).toBe(1)
  })

  it('should return maximum key', () => {
    const tree = new BPlusTree()
    expect(tree.max()).toBe(undefined)
    tree.insert(5, 'five')
    expect(tree.max()).toBe(5)
    tree.insert(1, 'one')
    expect(tree.max()).toBe(5)
    tree.insert(10, 'ten')
    expect(tree.max()).toBe(10)
  })

  it('should return empty array for range query on empty tree', () => {
    const tree = new BPlusTree()
    const result = tree.range(1, 10)
    expect(result).toEqual([])
  })

  it('should return empty array when min > max', () => {
    const tree = new BPlusTree()
    tree.insert(5, 'five')
    const result = tree.range(10, 1)
    expect(result).toEqual([])
  })

  it('should query range of keys', () => {
    const tree = new BPlusTree(4)
    for (let i = 1; i <= 10; i++) {
      tree.insert(i, `value-${i}`)
    }
    const result = tree.range(3, 7)
    expect(result).toHaveLength(5)
    expect(result[0].key).toBe(3)
    expect(result[4].key).toBe(7)
  })

  it('should query range with inclusive boundaries', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'one')
    tree.insert(5, 'five')
    tree.insert(10, 'ten')
    const result = tree.range(1, 10)
    expect(result).toHaveLength(3)
  })

  it('should return empty range when no keys match', () => {
    const tree = new BPlusTree()
    tree.insert(100, 'hundred')
    tree.insert(200, 'two-hundred')
    const result = tree.range(1, 10)
    expect(result).toEqual([])
  })

  it('should delete a key from leaf node', () => {
    const tree = new BPlusTree(4)
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    expect(tree.delete(2)).toBe(true)
    expect(tree.size).toBe(2)
    expect(tree.get(2)).toBe(undefined)
  })

  it('should return false when deleting non-existent key', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'one')
    expect(tree.delete(2)).toBe(false)
    expect(tree.size).toBe(1)
  })

  it('should delete from empty tree', () => {
    const tree = new BPlusTree()
    expect(tree.delete(1)).toBe(false)
  })

  it('should handle tree height growth with many inserts', () => {
    const tree = new BPlusTree(4)
    for (let i = 1; i <= 50; i++) {
      tree.insert(i, `value-${i}`)
    }
    expect(tree.size).toBe(50)
    expect(tree.height).toBeGreaterThan(0)
  })

  it('should clear the tree', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.clear()
    expect(tree.isEmpty()).toBe(true)
    expect(tree.size).toBe(0)
    expect(tree.get(1)).toBe(undefined)
  })

  it('should return all keys in sorted order', () => {
    const tree = new BPlusTree(4)
    const keys = [5, 2, 8, 1, 7, 3]
    keys.forEach(key => tree.insert(key, `value-${key}`))
    const result = tree.keys()
    expect(result).toEqual([1, 2, 3, 5, 7, 8])
  })

  it('should return all values', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    tree.insert(3, 'three')
    const result = tree.values()
    expect(result).toHaveLength(3)
    expect(result).toContain('one')
    expect(result).toContain('two')
    expect(result).toContain('three')
  })

  it('should return all entries', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'one')
    tree.insert(2, 'two')
    const result = tree.entries()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ key: 1, value: 'one' })
    expect(result[1]).toEqual({ key: 2, value: 'two' })
  })

  it('should work with string keys', () => {
    const tree = new BPlusTree(4, (a: string, b: string) => a.localeCompare(b))
    tree.insert('apple', 'red')
    tree.insert('banana', 'yellow')
    tree.insert('cherry', 'red')
    expect(tree.get('banana')).toBe('yellow')
    expect(tree.has('apple')).toBe(true)
    expect(tree.size).toBe(3)
  })

  it('should work with custom comparator', () => {
    const tree = new BPlusTree(4, (a, b) => a.localeCompare(b))
    tree.insert('zebra', 'striped')
    tree.insert('apple', 'red')
    tree.insert('monkey', 'brown')
    expect(tree.min()).toBe('apple')
    expect(tree.max()).toBe('zebra')
  })

  it('should handle large number of inserts', () => {
    const tree = new BPlusTree(32)
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i, `value-${i}`)
    }
    expect(tree.size).toBe(1000)
    expect(tree.min()).toBe(1)
    expect(tree.max()).toBe(1000)
  })

  it('should maintain consistency after multiple delete operations', () => {
    const tree = new BPlusTree(4)
    for (let i = 1; i <= 20; i++) {
      tree.insert(i, `value-${i}`)
    }
    for (let i = 1; i <= 10; i++) {
      tree.delete(i)
    }
    expect(tree.size).toBe(10)
    expect(tree.min()).toBe(11)
    expect(tree.max()).toBe(20)
  })

  it('should handle duplicate inserts correctly', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'first')
    tree.insert(1, 'second')
    tree.insert(1, 'third')
    expect(tree.get(1)).toBe('third')
    expect(tree.size).toBe(1)
  })

  it('should update value and preserve size on duplicate insert', () => {
    const tree = new BPlusTree()
    tree.insert(1, 'original')
    expect(tree.size).toBe(1)
    tree.insert(1, 'updated')
    expect(tree.size).toBe(1)
    expect(tree.get(1)).toBe('updated')
  })

  it('should return correct size after various operations', () => {
    const tree = new BPlusTree()
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
})