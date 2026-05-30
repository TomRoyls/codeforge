import { describe, expect, it } from 'vitest'
import { Treap } from '../../../src/utils/treap.js'

describe('Treap', () => {
  it('should insert and retrieve a single value', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    expect(treap.find(1)).toBe('one')
  })

  it('should insert and retrieve multiple values', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    treap.insert(2, 'two')
    treap.insert(3, 'three')
    expect(treap.find(1)).toBe('one')
    expect(treap.find(2)).toBe('two')
    expect(treap.find(3)).toBe('three')
  })

  it('should return undefined for non-existent key', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    expect(treap.find(999)).toBeUndefined()
  })

  it('should contain inserted keys', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    treap.insert(2, 'two')
    expect(treap.contains(1)).toBe(true)
    expect(treap.contains(2)).toBe(true)
    expect(treap.contains(3)).toBe(false)
  })

  it('should delete existing keys', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    treap.insert(2, 'two')
    expect(treap.delete(1)).toBe(true)
    expect(treap.contains(1)).toBe(false)
    expect(treap.contains(2)).toBe(true)
  })

  it('should return false when deleting non-existent keys', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    expect(treap.delete(999)).toBe(false)
  })

  it('should return correct min value', () => {
    const treap = new Treap<number, string>()
    treap.insert(5, 'five')
    treap.insert(2, 'two')
    treap.insert(8, 'eight')
    expect(treap.min).toBe(2)
  })

  it('should return undefined min for empty treap', () => {
    const treap = new Treap<number, string>()
    expect(treap.min).toBeUndefined()
  })

  it('should return correct max value', () => {
    const treap = new Treap<number, string>()
    treap.insert(5, 'five')
    treap.insert(2, 'two')
    treap.insert(8, 'eight')
    expect(treap.max).toBe(8)
  })

  it('should return undefined max for empty treap', () => {
    const treap = new Treap<number, string>()
    expect(treap.max).toBeUndefined()
  })

  it('should track size correctly', () => {
    const treap = new Treap<number, string>()
    expect(treap.size).toBe(0)
    treap.insert(1, 'one')
    expect(treap.size).toBe(1)
    treap.insert(2, 'two')
    expect(treap.size).toBe(2)
    treap.insert(3, 'three')
    expect(treap.size).toBe(3)
  })

  it('should update size after deletion', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    treap.insert(2, 'two')
    treap.insert(3, 'three')
    treap.delete(2)
    expect(treap.size).toBe(2)
  })

  it('should be empty initially', () => {
    const treap = new Treap<number, string>()
    expect(treap.isEmpty()).toBe(true)
  })

  it('should not be empty after insertions', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    expect(treap.isEmpty()).toBe(false)
  })

  it('should be empty after clear', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    treap.insert(2, 'two')
    treap.clear()
    expect(treap.isEmpty()).toBe(true)
    expect(treap.size).toBe(0)
    expect(treap.min).toBeUndefined()
    expect(treap.max).toBeUndefined()
  })

  it('should overwrite duplicate keys', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    treap.insert(1, 'ONE')
    expect(treap.find(1)).toBe('ONE')
    expect(treap.size).toBe(1)
  })

  it('should work with custom comparator', () => {
    const treap = new Treap<string, number>((a, b) => a.localeCompare(b))
    treap.insert('apple', 1)
    treap.insert('banana', 2)
    treap.insert('cherry', 3)
    expect(treap.find('banana')).toBe(2)
    expect(treap.min).toBe('apple')
    expect(treap.max).toBe('cherry')
  })

  it('should maintain BST property after insertions', () => {
    const treap = new Treap<number, string>()
    treap.insert(5, 'five')
    treap.insert(3, 'three')
    treap.insert(7, 'seven')
    treap.insert(1, 'one')
    treap.insert(9, 'nine')
    const ordered = treap.inOrder()
    expect(ordered.map(e => e.key)).toEqual([1, 3, 5, 7, 9])
  })

  it('should maintain BST property after deletions', () => {
    const treap = new Treap<number, string>()
    treap.insert(5, 'five')
    treap.insert(3, 'three')
    treap.insert(7, 'seven')
    treap.insert(1, 'one')
    treap.insert(9, 'nine')
    treap.delete(5)
    treap.delete(1)
    const ordered = treap.inOrder()
    expect(ordered.map(e => e.key)).toEqual([3, 7, 9])
  })

  it('should handle reverse order insertions', () => {
    const treap = new Treap<number, string>()
    for (let i = 10; i >= 1; i--) {
      treap.insert(i, `value-${i}`)
    }
    expect(treap.size).toBe(10)
    expect(treap.min).toBe(1)
    expect(treap.max).toBe(10)
  })

  it('should handle many operations without losing structure', () => {
    const treap = new Treap<number, string>()
    for (let i = 0; i < 100; i++) {
      treap.insert(i, `value-${i}`)
    }
    expect(treap.size).toBe(100)
    expect(treap.min).toBe(0)
    expect(treap.max).toBe(99)
    for (let i = 0; i < 50; i++) {
      treap.delete(i)
    }
    expect(treap.size).toBe(50)
    expect(treap.min).toBe(50)
    expect(treap.max).toBe(99)
  })

  it('should return empty array for inOrder on empty treap', () => {
    const treap = new Treap<number, string>()
    expect(treap.inOrder()).toEqual([])
  })

  it('should handle string keys', () => {
    const treap = new Treap<string, number>((a, b) => a.localeCompare(b))
    treap.insert('a', 1)
    treap.insert('b', 2)
    treap.insert('c', 3)
    expect(treap.find('b')).toBe(2)
    expect(treap.contains('d')).toBe(false)
  })

  it('should handle delete of min key', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    treap.insert(2, 'two')
    treap.insert(3, 'three')
    treap.delete(1)
    expect(treap.min).toBe(2)
    expect(treap.size).toBe(2)
  })

  it('should handle delete of max key', () => {
    const treap = new Treap<number, string>()
    treap.insert(1, 'one')
    treap.insert(2, 'two')
    treap.insert(3, 'three')
    treap.delete(3)
    expect(treap.max).toBe(2)
    expect(treap.size).toBe(2)
  })

  it('should maintain height within reasonable bounds', () => {
    const treap = new Treap<number, string>()
    for (let i = 0; i < 100; i++) {
      treap.insert(i, `value-${i}`)
    }
    expect(treap.height).toBeLessThan(50)
  })
})