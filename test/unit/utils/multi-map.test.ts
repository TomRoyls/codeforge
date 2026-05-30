import { describe, expect, it } from 'vitest'
import { MultiMap } from '../../../src/utils/multi-map.js'

describe('MultiMap', () => {
  it('creates empty map', () => {
    const map = new MultiMap<string, number>()
    expect(map.isEmpty).toBe(true)
    expect(map.keyCount).toBe(0)
    expect(map.entryCount).toBe(0)
  })

  it('set adds single value', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    expect(map.has('a')).toBe(true)
    expect(map.get('a').size).toBe(1)
    expect(map.entryCount).toBe(1)
  })

  it('set does not duplicate values', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 1)
    expect(map.entryCount).toBe(1)
  })

  it('set adds multiple values to same key', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    expect(map.entryCount).toBe(2)
  })

  it('set adds values to different keys', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.keyCount).toBe(2)
    expect(map.entryCount).toBe(2)
  })

  it('add adds multiple values', () => {
    const map = new MultiMap<string, number>()
    map.add('a', 1, 2, 3)
    expect(map.entryCount).toBe(3)
  })

  it('add does not duplicate values', () => {
    const map = new MultiMap<string, number>()
    map.add('a', 1, 1, 2)
    expect(map.entryCount).toBe(2)
  })

  it('get returns ReadonlySet for existing key', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    const result = map.get('a')
    expect(result.size).toBe(2)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(true)
  })

  it('get returns empty set for non-existent key', () => {
    const map = new MultiMap<string, number>()
    const result = map.get('a')
    expect(result.size).toBe(0)
  })

  it('getValues returns array', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    const result = map.getValues('a')
    expect(result).toHaveLength(2)
    expect(result).toContain(1)
    expect(result).toContain(2)
  })

  it('getValues returns empty array for non-existent key', () => {
    const map = new MultiMap<string, number>()
    const result = map.getValues('a')
    expect(result).toEqual([])
  })

  it('has returns true for existing key', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    expect(map.has('a')).toBe(true)
  })

  it('has returns false for non-existent key', () => {
    const map = new MultiMap<string, number>()
    expect(map.has('a')).toBe(false)
  })

  it('hasEntry returns true for existing entry', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    expect(map.hasEntry('a', 1)).toBe(true)
  })

  it('hasEntry returns false for non-existent entry', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    expect(map.hasEntry('a', 2)).toBe(false)
  })

  it('hasEntry returns false for non-existent key', () => {
    const map = new MultiMap<string, number>()
    expect(map.hasEntry('a', 1)).toBe(false)
  })

  it('delete removes existing key', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    const result = map.delete('a')
    expect(result).toBe(true)
    expect(map.has('a')).toBe(false)
    expect(map.entryCount).toBe(0)
  })

  it('delete returns false for non-existent key', () => {
    const map = new MultiMap<string, number>()
    const result = map.delete('a')
    expect(result).toBe(false)
  })

  it('deleteEntry removes existing entry', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    const result = map.deleteEntry('a', 1)
    expect(result).toBe(true)
    expect(map.hasEntry('a', 1)).toBe(false)
    expect(map.hasEntry('a', 2)).toBe(true)
    expect(map.entryCount).toBe(1)
  })

  it('deleteEntry cleans up empty key', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.deleteEntry('a', 1)
    expect(map.has('a')).toBe(false)
  })

  it('deleteEntry returns false for non-existent entry', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    const result = map.deleteEntry('a', 2)
    expect(result).toBe(false)
  })

  it('deleteEntry returns false for non-existent key', () => {
    const map = new MultiMap<string, number>()
    const result = map.deleteEntry('a', 1)
    expect(result).toBe(false)
  })

  it('clear removes all entries', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.clear()
    expect(map.isEmpty).toBe(true)
    expect(map.keyCount).toBe(0)
    expect(map.entryCount).toBe(0)
  })

  it('keyCount returns number of keys', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    expect(map.keyCount).toBe(2)
  })

  it('entryCount returns total entries', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    map.set('b', 3)
    expect(map.entryCount).toBe(3)
  })

  it('isEmpty returns true for empty map', () => {
    const map = new MultiMap<string, number>()
    expect(map.isEmpty).toBe(true)
  })

  it('isEmpty returns false for non-empty map', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    expect(map.isEmpty).toBe(false)
  })

  it('keys returns array of keys', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const result = map.keys()
    expect(result).toHaveLength(2)
    expect(result).toContain('a')
    expect(result).toContain('b')
  })

  it('values returns flat array of all values', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    map.set('b', 3)
    const result = map.values()
    expect(result).toHaveLength(3)
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result).toContain(3)
  })

  it('entries returns array of key-value pairs', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    map.set('b', 3)
    const result = map.entries()
    expect(result).toHaveLength(3)
    expect(result).toContainEqual(['a', 1])
    expect(result).toContainEqual(['a', 2])
    expect(result).toContainEqual(['b', 3])
  })

  it('forEach iterates over all entries', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    map.set('b', 3)
    const entries: Array<[number, string]> = []
    map.forEach((value, key) => {
      entries.push([value, key])
    })
    expect(entries).toHaveLength(3)
    expect(entries).toContainEqual([1, 'a'])
    expect(entries).toContainEqual([2, 'a'])
    expect(entries).toContainEqual([3, 'b'])
  })

  it('keyIterator returns iterator', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const iterator = map.keyIterator()
    expect(iterator.next().value).toBe('a')
    expect(iterator.next().value).toBe('b')
  })

  it('Symbol.iterator yields key-set pairs', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const entries = Array.from(map)
    expect(entries).toHaveLength(2)
    expect(entries[0][0]).toBe('a')
    expect(entries[1][0]).toBe('b')
  })

  it('clone creates independent copy', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const clone = map.clone()
    clone.set('c', 3)
    expect(map.keyCount).toBe(2)
    expect(clone.keyCount).toBe(3)
  })

  it('clone preserves all data', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    const clone = map.clone()
    expect(clone.keyCount).toBe(1)
    expect(clone.entryCount).toBe(2)
    expect(clone.hasEntry('a', 1)).toBe(true)
    expect(clone.hasEntry('a', 2)).toBe(true)
  })

  it('invert creates reverse mapping', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    map.set('b', 1)
    const inverted = map.invert()
    expect(inverted.get(1).size).toBe(2)
    expect(inverted.get(2).size).toBe(1)
    expect(inverted.hasEntry(1, 'a')).toBe(true)
    expect(inverted.hasEntry(2, 'a')).toBe(true)
    expect(inverted.hasEntry(1, 'b')).toBe(true)
  })

  it('merge adds entries from other map', () => {
    const map1 = new MultiMap<string, number>()
    map1.set('a', 1)
    const map2 = new MultiMap<string, number>()
    map2.set('a', 2)
    map2.set('b', 3)
    map1.merge(map2)
    expect(map1.entryCount).toBe(3)
    expect(map1.hasEntry('a', 1)).toBe(true)
    expect(map1.hasEntry('a', 2)).toBe(true)
    expect(map1.hasEntry('b', 3)).toBe(true)
  })

  it('merge does not duplicate values', () => {
    const map1 = new MultiMap<string, number>()
    map1.set('a', 1)
    const map2 = new MultiMap<string, number>()
    map2.set('a', 1)
    map1.merge(map2)
    expect(map1.entryCount).toBe(1)
  })

  it('equals returns true for identical maps', () => {
    const map1 = new MultiMap<string, number>()
    map1.set('a', 1)
    map1.set('a', 2)
    const map2 = new MultiMap<string, number>()
    map2.set('a', 1)
    map2.set('a', 2)
    expect(map1.equals(map2)).toBe(true)
  })

  it('equals returns false for different entry counts', () => {
    const map1 = new MultiMap<string, number>()
    map1.set('a', 1)
    const map2 = new MultiMap<string, number>()
    map2.set('a', 1)
    map2.set('a', 2)
    expect(map1.equals(map2)).toBe(false)
  })

  it('equals returns false for different key counts', () => {
    const map1 = new MultiMap<string, number>()
    map1.set('a', 1)
    const map2 = new MultiMap<string, number>()
    map2.set('a', 1)
    map2.set('b', 2)
    expect(map1.equals(map2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const map1 = new MultiMap<string, number>()
    map1.set('a', 1)
    const map2 = new MultiMap<string, number>()
    map2.set('a', 2)
    expect(map1.equals(map2)).toBe(false)
  })

  it('filterKeys creates new map with filtered keys', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    map.set('c', 3)
    const filtered = map.filterKeys(key => key === 'a' || key === 'b')
    expect(filtered.keyCount).toBe(2)
    expect(filtered.has('a')).toBe(true)
    expect(filtered.has('b')).toBe(true)
    expect(filtered.has('c')).toBe(false)
  })

  it('filterKeys preserves original map', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    const filtered = map.filterKeys(() => false)
    expect(map.keyCount).toBe(1)
    expect(filtered.keyCount).toBe(0)
  })

  it('filterValues creates new map with filtered values', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('a', 2)
    map.set('b', 3)
    const filtered = map.filterValues(value => value > 1)
    expect(filtered.entryCount).toBe(2)
    expect(filtered.hasEntry('a', 2)).toBe(true)
    expect(filtered.hasEntry('b', 3)).toBe(true)
    expect(filtered.hasEntry('a', 1)).toBe(false)
  })

  it('filterValues removes keys with no matching values', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    map.set('b', 2)
    const filtered = map.filterValues(value => value > 1)
    expect(filtered.has('a')).toBe(false)
    expect(filtered.has('b')).toBe(true)
  })

  it('filterValues preserves original map', () => {
    const map = new MultiMap<string, number>()
    map.set('a', 1)
    const filtered = map.filterValues(() => false)
    expect(map.entryCount).toBe(1)
    expect(filtered.entryCount).toBe(0)
  })

  it('static fromEntries creates map from entries', () => {
    const map = MultiMap.fromEntries([['a', 1], ['a', 2], ['b', 3]])
    expect(map.entryCount).toBe(3)
    expect(map.hasEntry('a', 1)).toBe(true)
    expect(map.hasEntry('a', 2)).toBe(true)
    expect(map.hasEntry('b', 3)).toBe(true)
  })

  it('static fromEntries handles empty array', () => {
    const map = MultiMap.fromEntries([])
    expect(map.isEmpty).toBe(true)
  })

  it('static fromGroups creates map from groups', () => {
    const map = MultiMap.fromGroups([['a', [1, 2]], ['b', [3]]])
    expect(map.entryCount).toBe(3)
    expect(map.hasEntry('a', 1)).toBe(true)
    expect(map.hasEntry('a', 2)).toBe(true)
    expect(map.hasEntry('b', 3)).toBe(true)
  })

  it('static fromGroups handles empty groups', () => {
    const map = MultiMap.fromGroups([['a', []], ['b', []]])
    expect(map.isEmpty).toBe(true)
  })

  it('static fromGroups handles empty array', () => {
    const map = MultiMap.fromGroups([])
    expect(map.isEmpty).toBe(true)
  })
})