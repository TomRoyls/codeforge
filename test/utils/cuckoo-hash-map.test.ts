import { describe, it, expect } from 'vitest'
import { CuckooHashMap } from '../../src/utils/cuckoo-hash-map.js'

describe('CuckooHashMap', () => {
  it('should create empty map with default options', () => {
    const map = new CuckooHashMap<string, number>()
    expect(map.size).toBe(0)
    expect(map.isEmpty).toBe(true)
  })

  it('should create map with custom capacity', () => {
    const map = new CuckooHashMap<string, number>({ capacity: 32 })
    expect(map.size).toBe(0)
  })

  it('should set and get values', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    expect(map.get('key1')).toBe(100)
  })

  it('should return undefined for non-existent keys', () => {
    const map = new CuckooHashMap<string, number>()
    expect(map.get('nonexistent')).toBe(undefined)
  })

  it('should check if key exists', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    expect(map.has('key1')).toBe(true)
    expect(map.has('nonexistent')).toBe(false)
  })

  it('should delete existing keys', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    const deleted = map.delete('key1')
    expect(deleted).toBe(true)
    expect(map.get('key1')).toBe(undefined)
    expect(map.size).toBe(0)
  })

  it('should return false when deleting non-existent keys', () => {
    const map = new CuckooHashMap<string, number>()
    const deleted = map.delete('nonexistent')
    expect(deleted).toBe(false)
  })

  it('should update size correctly', () => {
    const map = new CuckooHashMap<string, number>()
    expect(map.size).toBe(0)
    map.set('key1', 100)
    expect(map.size).toBe(1)
    map.set('key2', 200)
    expect(map.size).toBe(2)
    map.delete('key1')
    expect(map.size).toBe(1)
  })

  it('should clear all entries', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    map.set('key2', 200)
    map.set('key3', 300)
    map.clear()
    expect(map.size).toBe(0)
    expect(map.isEmpty).toBe(true)
    expect(map.get('key1')).toBe(undefined)
  })

  it('should return all keys', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    map.set('key2', 200)
    map.set('key3', 300)
    const keys = map.keys()
    expect(keys).toHaveLength(3)
    expect(keys).toContain('key1')
    expect(keys).toContain('key2')
    expect(keys).toContain('key3')
  })

  it('should return all values', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    map.set('key2', 200)
    map.set('key3', 300)
    const values = map.values()
    expect(values).toHaveLength(3)
    expect(values).toContain(100)
    expect(values).toContain(200)
    expect(values).toContain(300)
  })

  it('should return all entries', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    map.set('key2', 200)
    map.set('key3', 300)
    const entries = map.entries()
    expect(entries).toHaveLength(3)
    const entryMap = new Map(entries)
    expect(entryMap.get('key1')).toBe(100)
    expect(entryMap.get('key2')).toBe(200)
    expect(entryMap.get('key3')).toBe(300)
  })

  it('should iterate with forEach', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    map.set('key2', 200)
    map.set('key3', 300)
    const collected: Array<[number, string]> = []
    map.forEach((value, key) => {
      collected.push([value, key])
    })
    expect(collected).toHaveLength(3)
    expect(collected.some(([v, k]) => v === 100 && k === 'key1')).toBe(true)
    expect(collected.some(([v, k]) => v === 200 && k === 'key2')).toBe(true)
    expect(collected.some(([v, k]) => v === 300 && k === 'key3')).toBe(true)
  })

  it('should update existing key', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    map.set('key1', 200)
    expect(map.get('key1')).toBe(200)
    expect(map.size).toBe(1)
  })

  it('should handle many elements and trigger resize', () => {
    const map = new CuckooHashMap<string, number>({ capacity: 8 })
    for (let i = 0; i < 20; i++) {
      map.set(`key${i}`, i * 10)
    }
    expect(map.size).toBe(20)
    for (let i = 0; i < 20; i++) {
      expect(map.get(`key${i}`)).toBe(i * 10)
    }
  })

  it('should calculate load factor', () => {
    const map = new CuckooHashMap<string, number>({ capacity: 10 })
    map.set('key1', 100)
    map.set('key2', 200)
    map.set('key3', 300)
    expect(map.loadFactor).toBe(3 / 20)
  })

  it('should handle collision with different keys', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('key1', 100)
    map.set('key2', 200)
    map.set('key3', 300)
    map.set('key4', 400)
    expect(map.size).toBeGreaterThanOrEqual(3)
    expect(map.get('key1')).toBe(100)
    expect(map.get('key2')).toBe(200)
    expect(map.get('key3')).toBe(300)
    expect(map.get('key4')).toBe(400)
  })

  it('has returns true for existing key', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('x', 10)
    expect(map.has('x')).toBe(true)
    expect(map.has('y')).toBe(false)
  })

  it('delete removes key', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('x', 10)
    map.delete('x')
    expect(map.has('x')).toBe(false)
  })

  it('size reflects element count', () => {
    const map = new CuckooHashMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.size).toBe(2)
  })

  it('get returns value for existing key', () => {
    const map = new CuckooHashMap<string, number>(16)
    map.set('x', 42)
    expect(map.get('x')).toBe(42)
  })

  it('has returns false for missing key', () => {
    const map = new CuckooHashMap<string, number>(16)
    expect(map.has('missing')).toBe(false)
  })

  it('set and get returns value', () => {
    const map = new CuckooHashMap<string, number>(16)
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
  })

  it('get returns undefined for missing key', () => {
    const map = new CuckooHashMap<string, number>(16)
    expect(map.get('missing')).toBeUndefined()
  })
})