import { describe, it, expect } from 'vitest'
import { HopscotchHashTable } from '../../src/utils/hopscotch-hash-table.js'

describe('HopscotchHashTable', () => {
  it('creates table with default options', () => {
    const table = new HopscotchHashTable<number, number>()
    expect(table.size).toBe(0)
    expect(table.capacity).toBe(16)
    expect(table.isEmpty()).toBe(true)
  })

  it('creates table with custom capacity', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 8 })
    expect(table.capacity).toBe(8)
    expect(table.size).toBe(0)
  })

  it('creates table with custom maxHop', () => {
    const table = new HopscotchHashTable<number, number>({ maxHop: 16 })
    expect(table.size).toBe(0)
  })

  it('sets and gets values', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    expect(table.get(1)).toBe(100)
    expect(table.size).toBe(1)
  })

  it('returns undefined for non-existent key', () => {
    const table = new HopscotchHashTable<number, number>()
    expect(table.get(999)).toBeUndefined()
  })

  it('updates existing key', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(1, 200)
    expect(table.get(1)).toBe(200)
    expect(table.size).toBe(1)
  })

  it('checks if key exists with has()', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    expect(table.has(1)).toBe(true)
    expect(table.has(2)).toBe(false)
  })

  it('deletes existing key', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    const deleted = table.delete(1)
    expect(deleted).toBe(true)
    expect(table.get(1)).toBeUndefined()
    expect(table.size).toBe(0)
  })

  it('returns false when deleting non-existent key', () => {
    const table = new HopscotchHashTable<number, number>()
    const deleted = table.delete(999)
    expect(deleted).toBe(false)
  })

  it('clears all entries', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    table.clear()
    expect(table.size).toBe(0)
    expect(table.isEmpty()).toBe(true)
    expect(table.get(1)).toBeUndefined()
  })

  it('returns all keys', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    table.set(3, 300)
    const keys = table.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain(1)
    expect(keys).toContain(2)
    expect(keys).toContain(3)
  })

  it('returns all values', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    table.set(3, 300)
    const values = table.values()
    expect(values.length).toBe(3)
    expect(values).toContain(100)
    expect(values).toContain(200)
    expect(values).toContain(300)
  })

  it('returns all entries as key-value pairs', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    const entries = table.entries()
    expect(entries.length).toBe(2)
    expect(entries).toContainEqual([1, 100])
    expect(entries).toContainEqual([2, 200])
  })

  it('iterates with forEach', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    const results: number[] = []
    table.forEach((value) => {
      results.push(value)
    })
    expect(results.length).toBe(2)
    expect(results).toContain(100)
    expect(results).toContain(200)
  })

  it('calculates load factor', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.set(2, 200)
    table.set(3, 300)
    table.set(4, 400)
    expect(table.loadFactor()).toBe(4 / 16)
  })

  it('handles string keys', () => {
    const table = new HopscotchHashTable<string, number>()
    table.set('a', 1)
    table.set('b', 2)
    expect(table.get('a')).toBe(1)
    expect(table.get('b')).toBe(2)
    expect(table.size).toBe(2)
  })

  it('handles multiple keys with same hash collision', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 4 })
    table.set(1, 100)
    table.set(5, 500)
    table.set(9, 900)
    expect(table.size).toBe(3)
    expect(table.get(1)).toBe(100)
    expect(table.get(5)).toBe(500)
    expect(table.get(9)).toBe(900)
  })

  it('creates table from entries', () => {
    const entries: Array<[string, number]> = [
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ]
    const table = HopscotchHashTable.fromEntries(entries)
    expect(table.size).toBe(3)
    expect(table.get('a')).toBe(1)
    expect(table.get('b')).toBe(2)
    expect(table.get('c')).toBe(3)
  })

  it('resizes when load factor exceeds threshold', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 4 })
    const initialCapacity = table.capacity
    for (let i = 0; i < 5; i++) {
      table.set(i, i * 10)
    }
    expect(table.capacity).toBeGreaterThan(initialCapacity)
    expect(table.size).toBe(5)
  })

  it('preserves values after resize', () => {
    const table = new HopscotchHashTable<number, number>({ capacity: 4 })
    table.set(1, 100)
    table.set(2, 200)
    table.set(3, 300)
    table.set(4, 400)
    expect(table.get(1)).toBe(100)
    expect(table.get(2)).toBe(200)
    expect(table.get(3)).toBe(300)
    expect(table.get(4)).toBe(400)
  })

  it('handles deletion and re-insertion', () => {
    const table = new HopscotchHashTable<number, number>()
    table.set(1, 100)
    table.delete(1)
    expect(table.get(1)).toBeUndefined()
    table.set(1, 200)
    expect(table.get(1)).toBe(200)
    expect(table.size).toBe(1)
  })

  it('handles complex values', () => {
    const table = new HopscotchHashTable<number, { x: number; y: number }>()
    table.set(1, { x: 10, y: 20 })
    const value = table.get(1)
    expect(value).toEqual({ x: 10, y: 20 })
  })
})