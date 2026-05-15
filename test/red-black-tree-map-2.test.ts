import { describe, it, expect } from 'vitest'
import { RedBlackTreeMap2 } from '../src/core/red-black-tree-map-2/index'

describe('RedBlackTreeMap2', () => {
  it('should initialize empty', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    expect(map.size).toBe(0)
    expect(map.isEmpty()).toBe(true)
  })

  it('should insert and get values', async () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(10, 'ten')
    map.set(20, 'twenty')
    map.set(5, 'five')
    expect(map.get(10)).toBe('ten')
    expect(map.get(20)).toBe('twenty')
    expect(map.get(5)).toBe('five')
    expect(map.size).toBe(3)
  })

  it('should update existing keys', async () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(10, 'ten')
    map.set(10, 'TEN')
    expect(map.size).toBe(1)
    expect(map.get(10)).toBe('TEN')
  })

  it('should check key existence', async () => {
    const map = new RedBlackTreeMap2<string, number>()
    map.set('a', 1)
    expect(map.has('a')).toBe(true)
    expect(map.has('b')).toBe(false)
  })

  it('should delete keys', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    map.set(10, 10)
    map.set(20, 20)
    map.set(5, 5)
    expect(map.delete(15)).toBe(false)
    expect(map.delete(20)).toBe(true)
    expect(map.size).toBe(2)
    expect(map.has(20)).toBe(false)
  })

  it('should return undefined for non-existent keys', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    expect(map.get(100)).toBeUndefined()
  })

  it('should clear all entries', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    map.set(1, 1)
    map.set(2, 2)
    map.clear()
    expect(map.isEmpty()).toBe(true)
    expect(map.size).toBe(0)
  })

  it('should find min and max keys', async () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(10, 'x')
    map.set(5, 'y')
    map.set(20, 'z')
    expect(map.min()).toBe(5)
    expect(map.max()).toBe(20)
  })

  it('should return undefined for min/max on empty map', async () => {
    const map = new RedBlackTreeMap2<number, string>()
    expect(map.min()).toBeUndefined()
    expect(map.max()).toBeUndefined()
  })

  it('should traverse in-order with forEach', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    const arr = [30, 10, 20, 50, 40]
    arr.forEach(n => map.set(n, n * 2))
    const collected: number[] = []
    map.forEach((k) => collected.push(k))
    expect(collected).toEqual([10, 20, 30, 40, 50])
  })

  it('should return keys in order', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    map.set(30, 1)
    map.set(10, 2)
    map.set(20, 3)
    expect(map.keys()).toEqual([10, 20, 30])
  })

  it('should return values in order', async () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(30, 'c')
    map.set(10, 'a')
    map.set(20, 'b')
    expect(map.values()).toEqual(['a', 'b', 'c'])
  })

  it('should return array of entries sorted by key', async () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(30, 'c')
    map.set(10, 'a')
    map.set(20, 'b')
    const entries = map.toArray()
    expect(entries.length).toBe(3)
    expect(entries[0]![0]).toBe(10)
    expect(entries[0]![1]).toBe('a')
    expect(entries[1]![0]).toBe(20)
    expect(entries[1]![1]).toBe('b')
    expect(entries[2]![0]).toBe(30)
    expect(entries[2]![1]).toBe('c')
  })

  it('should handle edge case: single node deletion', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    map.set(1, 1)
    map.delete(1)
    expect(map.isEmpty()).toBe(true)
  })

  it('should handle edge case: root deletion with red child', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    map.set(10, 10)
    map.set(5, 5)
    map.delete(10)
    expect(map.min()).toBe(5)
    expect(map.max()).toBe(5)
  })

  it('should handle large datasets', async () => {
    const map = new RedBlackTreeMap2<number, number>()
    const size = 1000
    const arr: number[] = []
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * size))
    }
    arr.forEach(n => map.set(n, n * 10))
    expect(map.size).toBeGreaterThan(0)
    const keys = map.keys()
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i]!).toBeGreaterThanOrEqual(keys[i - 1]!)
    }
  })

  it('should handle sequential operations', async () => {
    const map = new RedBlackTreeMap2<number, string>()
    for (let i = 0; i < 50; i++) {
      map.set(i, `val${i}`)
    }
    for (let i = 0; i < 50; i += 2) {
      expect(map.delete(i)).toBe(true)
    }
    expect(map.size).toBe(25)
    expect(map.get(1)).toBe('val1')
    expect(map.has(2)).toBe(false)
  })

  it('should use custom comparator', async () => {
    const map = new RedBlackTreeMap2<string, number>((a, b) => b.localeCompare(a))
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    expect(map.keys()).toEqual(['c', 'b', 'a'])
  })

  it('should clear all entries', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.get(1)).toBeUndefined()
  })

  it('should return correct values', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.values()).toEqual(['a', 'b', 'c'])
  })

  it('should update value for existing key', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(1, 'old')
    map.set(1, 'new')
    expect(map.get(1)).toBe('new')
    expect(map.size).toBe(1)
  })

  it('should handle delete of non-existent key', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(1, 'a')
    expect(map.delete(99)).toBe(false)
    expect(map.size).toBe(1)
  })

  it('should handle negative keys', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(-5, 'neg5')
    map.set(0, 'zero')
    map.set(5, 'pos5')
    expect(map.keys()).toEqual([-5, 0, 5])
    expect(map.min()).toBe(-5)
    expect(map.max()).toBe(5)
  })

  it('should handle sequential deletes', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.set(4, 'd')
    map.delete(2)
    expect(map.keys()).toEqual([1, 3, 4])
    map.delete(1)
    expect(map.keys()).toEqual([3, 4])
    map.delete(4)
    expect(map.keys()).toEqual([3])
  })

  it('should handle reverse insertion order', () => {
    const map = new RedBlackTreeMap2<number, string>()
    for (let i = 10; i >= 1; i--) {
      map.set(i, `v${i}`)
    }
    expect(map.keys()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(map.min()).toBe(1)
    expect(map.max()).toBe(10)
  })

  it('should handle toArray after deletes', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.set(4, 'd')
    map.delete(2)
    const entries = map.toArray()
    expect(entries).toEqual([[1, 'a'], [3, 'c'], [4, 'd']])
  })

  it('should handle update existing key', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(1, 'a')
    map.set(1, 'b')
    expect(map.get(1)).toBe('b')
    expect(map.size).toBe(1)
  })

  it('should handle forEach iteration', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    const result: [number, string][] = []
    map.forEach((k, v) => result.push([k, v]))
    expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('should handle values in order', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.values()).toEqual(['a', 'b', 'c'])
  })

  it('should handle has for missing key', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(1, 'a')
    expect(map.has(1)).toBe(true)
    expect(map.has(2)).toBe(false)
  })

  it('should handle delete of non-existent key', () => {
    const map = new RedBlackTreeMap2<number, string>()
    expect(map.delete(99)).toBe(false)
    expect(map.size).toBe(0)
  })

  it('should iterate with forEach in order', () => {
    const map = new RedBlackTreeMap2<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    const result: string[] = []
    map.forEach((key, value) => result.push(value))
    expect(result).toEqual(['a', 'b', 'c'])
  })
})
