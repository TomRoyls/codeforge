import { describe, expect, it } from 'vitest'
import { AVLTreeMap } from '../../../src/utils/avl-tree-map.js'

describe('AVLTreeMap', () => {
  it('should create empty map with default comparator', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.size).toBe(0)
    expect(map.get(1)).toBe(undefined)
  })

  it('should create map with custom comparator', () => {
    const map = new AVLTreeMap<string, number>((a, b) => a.localeCompare(b))
    map.set('a', 1)
    map.set('b', 2)
    expect(map.size).toBe(2)
  })

  it('should create map from entries', () => {
    const map = new AVLTreeMap<number, string>(undefined, [[1, 'a'], [2, 'b'], [3, 'c']])
    expect(map.size).toBe(3)
    expect(map.get(1)).toBe('a')
    expect(map.get(2)).toBe('b')
    expect(map.get(3)).toBe('c')
  })

  it('should set and get values', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    expect(map.get(1)).toBe('a')
    map.set(2, 'b')
    expect(map.get(2)).toBe('b')
  })

  it('should update existing key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(1, 'b')
    expect(map.get(1)).toBe('b')
    expect(map.size).toBe(1)
  })

  it('should return undefined for non-existent key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    expect(map.get(2)).toBe(undefined)
  })

  it('should check if key exists', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    expect(map.has(1)).toBe(true)
    expect(map.has(2)).toBe(false)
  })

  it('should delete existing key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.delete(1)).toBe(true)
    expect(map.size).toBe(1)
    expect(map.get(1)).toBe(undefined)
  })

  it('should return false for deleting non-existent key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    expect(map.delete(2)).toBe(false)
    expect(map.size).toBe(1)
  })

  it('should delete from empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.delete(1)).toBe(false)
    expect(map.size).toBe(0)
  })

  it('should clear all entries', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.clear()
    expect(map.size).toBe(0)
    expect(map.get(1)).toBe(undefined)
  })

  it('should return keys in sorted order', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.keys()).toEqual([1, 2, 3])
  })

  it('should return values in key order', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.values()).toEqual(['a', 'b', 'c'])
  })

  it('should return entries in sorted order', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.entries()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('should iterate with forEach in order', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(2, 'b')
    map.set(1, 'a')
    map.set(3, 'c')
    const result: [number, string][] = []
    map.forEach((value, key) => {
      result.push([key, value])
    })
    expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
  })

  it('should handle single entry map', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    expect(map.size).toBe(1)
    expect(map.get(1)).toBe('a')
    expect(map.has(1)).toBe(true)
    expect(map.keys()).toEqual([1])
    expect(map.values()).toEqual(['a'])
    expect(map.entries()).toEqual([[1, 'a']])
  })

  it('should handle many entries', () => {
    const map = new AVLTreeMap<number, number>()
    const count = 100
    for (let i = 0; i < count; i++) {
      map.set(i, i * 2)
    }
    expect(map.size).toBe(count)
    for (let i = 0; i < count; i++) {
      expect(map.get(i)).toBe(i * 2)
    }
  })

  it('should handle sorted inserts', () => {
    const map = new AVLTreeMap<number, string>()
    for (let i = 0; i < 50; i++) {
      map.set(i, `value${i}`)
    }
    expect(map.size).toBe(50)
    for (let i = 0; i < 50; i++) {
      expect(map.get(i)).toBe(`value${i}`)
    }
  })

  it('should handle reverse sorted inserts', () => {
    const map = new AVLTreeMap<number, string>()
    for (let i = 49; i >= 0; i--) {
      map.set(i, `value${i}`)
    }
    expect(map.size).toBe(50)
    for (let i = 0; i < 50; i++) {
      expect(map.get(i)).toBe(`value${i}`)
    }
  })

  it('should return first entry', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.first()).toEqual([1, 'a'])
  })

  it('should return undefined for first on empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.first()).toBe(undefined)
  })

  it('should return last entry', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(3, 'c')
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.last()).toEqual([3, 'c'])
  })

  it('should return undefined for last on empty map', () => {
    const map = new AVLTreeMap<number, string>()
    expect(map.last()).toBe(undefined)
  })

  it('should return lower bound entry', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(3, 'c')
    map.set(5, 'e')
    expect(map.lowerBound(2)).toEqual([3, 'c'])
    expect(map.lowerBound(3)).toEqual([3, 'c'])
  })

  it('should return undefined for lower bound when no match', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.lowerBound(3)).toBe(undefined)
  })

  it('should return upper bound entry', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(3, 'c')
    map.set(5, 'e')
    expect(map.upperBound(2)).toEqual([3, 'c'])
    expect(map.upperBound(3)).toEqual([5, 'e'])
  })

  it('should return undefined for upper bound when no match', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.upperBound(3)).toBe(undefined)
  })

  it('should return range of entries', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    map.set(4, 'd')
    map.set(5, 'e')
    expect(map.range(2, 4)).toEqual([[2, 'b'], [3, 'c'], [4, 'd']])
  })

  it('should return empty array for range with no matches', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.range(3, 5)).toEqual([])
  })

  it('should return rank of key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    expect(map.rank(1)).toBe(0)
    expect(map.rank(2)).toBe(1)
    expect(map.rank(3)).toBe(2)
  })

  it('should return -1 for rank of non-existent key', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.rank(3)).toBe(-1)
  })

  it('should return entry at rank', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    map.set(3, 'c')
    expect(map.atRank(0)).toEqual([1, 'a'])
    expect(map.atRank(1)).toEqual([2, 'b'])
    expect(map.atRank(2)).toEqual([3, 'c'])
  })

  it('should return undefined for atRank with invalid index', () => {
    const map = new AVLTreeMap<number, string>()
    map.set(1, 'a')
    map.set(2, 'b')
    expect(map.atRank(-1)).toBe(undefined)
    expect(map.atRank(5)).toBe(undefined)
  })

  it('should handle deletions and rebalancing', () => {
    const map = new AVLTreeMap<number, string>()
    for (let i = 0; i < 20; i++) {
      map.set(i, `value${i}`)
    }
    for (let i = 0; i < 20; i += 2) {
      map.delete(i)
    }
    expect(map.size).toBe(10)
    for (let i = 1; i < 20; i += 2) {
      expect(map.get(i)).toBe(`value${i}`)
    }
  })

  it('should use custom comparator for strings', () => {
    const map = new AVLTreeMap<string, number>((a, b) => a.localeCompare(b))
    map.set('zebra', 1)
    map.set('apple', 2)
    map.set('banana', 3)
    expect(map.keys()).toEqual(['apple', 'banana', 'zebra'])
  })
})