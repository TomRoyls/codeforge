import { describe, it, expect, beforeEach } from 'vitest'
import { MultiMap } from '../../src/utils/multi-map.js'

describe('MultiMap', () => {
  let map: MultiMap<string, number>

  beforeEach(() => {
    map = new MultiMap<string, number>()
  })

  it('creates empty instance', () => {
    const emptyMap = new MultiMap<string, number>()
    expect(emptyMap.keyCount).toBe(0)
    expect(emptyMap.entryCount).toBe(0)
    expect(emptyMap.isEmpty).toBe(true)
  })

  it('adds single value with set', () => {
    map.set('a', 1)
    expect(map.has('a')).toBe(true)
    expect(map.entryCount).toBe(1)
  })

  it('adds multiple values with add', () => {
    map.add('a', 1, 2, 3)
    const values = map.getValues('a')
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('returns empty set for missing key', () => {
    const result = map.get('missing')
    expect(result.size).toBe(0)
  })

  it('returns empty array for missing key with getValues', () => {
    const result = map.getValues('missing')
    expect(result.length).toBe(0)
  })

  it('checks if entry exists', () => {
    map.set('a', 1)
    expect(map.hasEntry('a', 1)).toBe(true)
    expect(map.hasEntry('a', 2)).toBe(false)
    expect(map.hasEntry('b', 1)).toBe(false)
  })

  it('deletes all values for key', () => {
    map.add('a', 1, 2, 3)
    const deleted = map.delete('a')
    expect(deleted).toBe(true)
    expect(map.has('a')).toBe(false)
    expect(map.entryCount).toBe(0)
  })

  it('returns false when deleting non-existent key', () => {
    const deleted = map.delete('missing')
    expect(deleted).toBe(false)
  })

  it('deletes single entry', () => {
    map.add('a', 1, 2, 3)
    const deleted = map.deleteEntry('a', 2)
    expect(deleted).toBe(true)
    expect(map.hasEntry('a', 2)).toBe(false)
    expect(map.entryCount).toBe(2)
  })

  it('removes key when last entry deleted', () => {
    map.set('a', 1)
    map.deleteEntry('a', 1)
    expect(map.has('a')).toBe(false)
  })

  it('clears all entries', () => {
    map.add('a', 1, 2)
    map.add('b', 3, 4)
    map.clear()
    expect(map.isEmpty).toBe(true)
    expect(map.entryCount).toBe(0)
  })

  it('returns all keys', () => {
    map.add('a', 1)
    map.add('b', 2)
    map.add('c', 3)
    const keys = map.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('returns all values flattened', () => {
    map.add('a', 1, 2)
    map.add('b', 3, 4)
    const values = map.values()
    expect(values.length).toBe(4)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
    expect(values).toContain(4)
  })

  it('returns all entries as key-value pairs', () => {
    map.add('a', 1, 2)
    map.add('b', 3)
    const entries = map.entries()
    expect(entries.length).toBe(3)
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['a', 2])
    expect(entries).toContainEqual(['b', 3])
  })

  it('iterates with forEach', () => {
    map.add('a', 1, 2)
    map.add('b', 3)
    const visited: Array<[string, number]> = []
    map.forEach((value, key) => {
      visited.push([key, value])
    })
    expect(visited.length).toBe(3)
    expect(visited).toContainEqual(['a', 1])
    expect(visited).toContainEqual(['a', 2])
    expect(visited).toContainEqual(['b', 3])
  })

  it('clones map with all entries', () => {
    map.add('a', 1, 2)
    map.add('b', 3)
    const clone = map.clone()
    expect(clone.keyCount).toBe(2)
    expect(clone.entryCount).toBe(3)
    expect(clone.hasEntry('a', 1)).toBe(true)
    expect(clone.hasEntry('b', 3)).toBe(true)
  })

  it('clone is independent from original', () => {
    map.set('a', 1)
    const clone = map.clone()
    clone.set('a', 2)
    expect(map.hasEntry('a', 2)).toBe(false)
    expect(clone.hasEntry('a', 2)).toBe(true)
  })

  it('inverts key-value pairs', () => {
    map.add('a', 1, 2)
    map.add('b', 2, 3)
    const inverted = map.invert()
    expect(inverted.getValues(1)).toContain('a')
    expect(inverted.getValues(2)).toContain('a')
    expect(inverted.getValues(2)).toContain('b')
    expect(inverted.getValues(3)).toContain('b')
  })

  it('merges another MultiMap', () => {
    map.add('a', 1)
    map.add('b', 2)
    const other = new MultiMap<string, number>()
    other.add('a', 3)
    other.add('c', 4)
    map.merge(other)
    expect(map.getValues('a')).toContain(1)
    expect(map.getValues('a')).toContain(3)
    expect(map.getValues('b')).toContain(2)
    expect(map.getValues('c')).toContain(4)
  })

  it('checks equality with same content', () => {
    map.add('a', 1, 2)
    map.add('b', 3)
    const other = new MultiMap<string, number>()
    other.add('a', 1, 2)
    other.add('b', 3)
    expect(map.equals(other)).toBe(true)
  })

  it('checks inequality with different content', () => {
    map.add('a', 1, 2)
    const other = new MultiMap<string, number>()
    other.add('a', 1)
    expect(map.equals(other)).toBe(false)
  })

  it('filters keys by predicate', () => {
    map.add('a', 1)
    map.add('b', 2)
    map.add('aa', 3)
    const filtered = map.filterKeys((key) => key.startsWith('a'))
    expect(filtered.keyCount).toBe(2)
    expect(filtered.has('a')).toBe(true)
    expect(filtered.has('aa')).toBe(true)
    expect(filtered.has('b')).toBe(false)
  })

  it('filters values by predicate', () => {
    map.add('a', 1, 2, 3)
    map.add('b', 4, 5)
    const filtered = map.filterValues((value) => value % 2 === 0)
    expect(filtered.getValues('a')).toEqual([2])
    expect(filtered.getValues('b')).toEqual([4])
  })

  it('creates from entries array', () => {
    const entries: Array<[string, number]> = [['a', 1], ['a', 2], ['b', 3]]
    const newMap = MultiMap.fromEntries(entries)
    expect(newMap.entryCount).toBe(3)
    expect(newMap.hasEntry('a', 1)).toBe(true)
    expect(newMap.hasEntry('b', 3)).toBe(true)
  })

  it('creates from groups array', () => {
    const groups: Array<[string, number[]]> = [['a', [1, 2]], ['b', [3, 4, 5]]]
    const newMap = MultiMap.fromGroups(groups)
    expect(newMap.entryCount).toBe(5)
    expect(newMap.getValues('a').length).toBe(2)
    expect(newMap.getValues('b').length).toBe(3)
  })

  it('does not duplicate values on set', () => {
    map.set('a', 1)
    map.set('a', 1)
    expect(map.entryCount).toBe(1)
  })

  it('iterates over keys with keyIterator', () => {
    map.add('a', 1)
    map.add('b', 2)
    const iterator = map.keyIterator()
    const keys = Array.from(iterator)
    expect(keys.length).toBe(2)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })

  it('uses Symbol.iterator for key-Set pairs', () => {
    map.add('a', 1, 2)
    const entries = Array.from(map)
    expect(entries.length).toBe(1)
    const [key, valueSet] = entries[0]!
    expect(key).toBe('a')
    expect(valueSet.size).toBe(2)
  })
})