import { describe, it, expect } from 'vitest'
import { BiMap3 } from '../src/core/bimap-3/index'

describe('BiMap3', () => {
  it('should create empty bimap', async () => {
    const bimap = new BiMap3<string, number>()
    expect(bimap.size).toBe(0)
    expect(bimap.isEmpty()).toBe(true)
  })

  it('should set and get values', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    expect(bimap.get('a')).toBe(1)
    expect(bimap.size).toBe(1)
  })

  it('should get key by value', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    expect(bimap.getKey(1)).toBe('a')
  })

  it('should return undefined for missing key', async () => {
    const bimap = new BiMap3<string, number>()
    expect(bimap.get('missing')).toBeUndefined()
  })

  it('should return undefined for missing value', async () => {
    const bimap = new BiMap3<string, number>()
    expect(bimap.getKey(999)).toBeUndefined()
  })

  it('should check if key exists', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    expect(bimap.has('a')).toBe(true)
    expect(bimap.has('b')).toBe(false)
  })

  it('should check if value exists', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    expect(bimap.hasValue(1)).toBe(true)
    expect(bimap.hasValue(2)).toBe(false)
  })

  it('should delete by key', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    const deleted = bimap.delete('a')
    expect(deleted).toBe(true)
    expect(bimap.get('a')).toBeUndefined()
    expect(bimap.getKey(1)).toBeUndefined()
    expect(bimap.size).toBe(0)
  })

  it('should delete by value', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    const deleted = bimap.deleteValue(1)
    expect(deleted).toBe(true)
    expect(bimap.get('a')).toBeUndefined()
    expect(bimap.getKey(1)).toBeUndefined()
    expect(bimap.size).toBe(0)
  })

  it('should return false when deleting non-existent key', async () => {
    const bimap = new BiMap3<string, number>()
    expect(bimap.delete('missing')).toBe(false)
  })

  it('should return false when deleting non-existent value', async () => {
    const bimap = new BiMap3<string, number>()
    expect(bimap.deleteValue(999)).toBe(false)
  })

  it('should clear all entries', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 2)
    bimap.set('c', 3)
    bimap.clear()
    expect(bimap.size).toBe(0)
    expect(bimap.isEmpty()).toBe(true)
  })

  it('should return all keys', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 2)
    bimap.set('c', 3)
    const keys = bimap.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('should return all values', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 2)
    bimap.set('c', 3)
    const values = bimap.values()
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('should return all entries', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 2)
    const entries = bimap.entries()
    expect(entries.length).toBe(2)
    expect(entries[0]![0]).toBe('a')
    expect(entries[0]![1]).toBe(1)
    expect(entries[1]![0]).toBe('b')
    expect(entries[1]![1]).toBe(2)
  })

  it('should iterate with forEach', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 2)
    const results: [string, number][] = []
    bimap.forEach((key, value) => {
      results.push([key, value])
    })
    expect(results.length).toBe(2)
    expect(results).toContainEqual(['a', 1])
    expect(results).toContainEqual(['b', 2])
  })

  it('should overwrite existing key', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('a', 2)
    expect(bimap.get('a')).toBe(2)
    expect(bimap.getKey(1)).toBeUndefined()
    expect(bimap.getKey(2)).toBe('a')
    expect(bimap.size).toBe(1)
  })

  it('should remove old key when value already exists', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 1)
    expect(bimap.get('a')).toBeUndefined()
    expect(bimap.get('b')).toBe(1)
    expect(bimap.getKey(1)).toBe('b')
    expect(bimap.size).toBe(1)
  })

  it('should maintain bidirectional consistency', async () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 2)
    bimap.set('c', 3)

    expect(bimap.get('a')).toBe(1)
    expect(bimap.getKey(1)).toBe('a')
    expect(bimap.get('b')).toBe(2)
    expect(bimap.getKey(2)).toBe('b')
    expect(bimap.get('c')).toBe(3)
    expect(bimap.getKey(3)).toBe('c')
  })

  it('should handle edge case: null and undefined values', async () => {
    const bimap = new BiMap3<string, number | null | undefined>()
    bimap.set('a', null)
    bimap.set('b', undefined)
    expect(bimap.get('a')).toBe(null)
    expect(bimap.get('b')).toBe(undefined)
    expect(bimap.getKey(null)).toBe('a')
    expect(bimap.getKey(undefined)).toBe('b')
  })

  it('should handle large datasets', async () => {
    const bimap = new BiMap3<number, number>()
    const count = 10000
    for (let i = 0; i < count; i++) {
      bimap.set(i, i * 2)
    }
    expect(bimap.size).toBe(count)
    expect(bimap.get(5000)).toBe(10000)
    expect(bimap.getKey(10000)).toBe(5000)
  })

  it('should handle delete non-existent key', () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    expect(bimap.delete('b')).toBe(false)
    expect(bimap.size).toBe(1)
  })

  it('should handle clear then re-add', () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 2)
    bimap.clear()
    expect(bimap.size).toBe(0)
    bimap.set('c', 3)
    expect(bimap.get('c')).toBe(3)
    expect(bimap.getKey(3)).toBe('c')
  })

  it('should handle update overwriting inverse', () => {
    const bimap = new BiMap3<string, number>()
    bimap.set('a', 1)
    bimap.set('b', 1)
    expect(bimap.get('a')).toBeUndefined()
    expect(bimap.get('b')).toBe(1)
    expect(bimap.getKey(1)).toBe('b')
  })
})
