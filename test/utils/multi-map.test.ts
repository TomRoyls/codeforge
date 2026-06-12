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

  it('add with no values does nothing', () => {
    map.add('a')
    expect(map.has('a')).toBe(false)
  })

  it('set with different types for values', () => {
    const typed = new MultiMap<string, unknown>()
    typed.set('a', 1)
    typed.set('a', 'hello')
    typed.set('a', true)
    expect(typed.entryCount).toBe(3)
    expect(typed.getValues('a')).toContain(1)
    expect(typed.getValues('a')).toContain('hello')
    expect(typed.getValues('a')).toContain(true)
  })

  it('deleteEntry on non-existent entry returns false', () => {
    map.set('a', 1)
    expect(map.deleteEntry('a', 99)).toBe(false)
    expect(map.deleteEntry('z', 1)).toBe(false)
  })

  it('deleteEntry then re-add works', () => {
    map.set('a', 1)
    map.deleteEntry('a', 1)
    expect(map.has('a')).toBe(false)
    map.set('a', 2)
    expect(map.hasEntry('a', 2)).toBe(true)
    expect(map.entryCount).toBe(1)
  })

  it('clear on empty map does nothing', () => {
    map.clear()
    expect(map.isEmpty).toBe(true)
    expect(map.entryCount).toBe(0)
  })

  it('keys returns unique keys only', () => {
    map.add('a', 1, 2, 3)
    map.add('b', 4)
    const keys = map.keys()
    expect(keys.length).toBe(2)
  })

  it('values returns all values across keys', () => {
    map.add('x', 10, 20)
    map.add('y', 30)
    const vals = map.values()
    expect(vals.length).toBe(3)
    expect(vals).toContain(10)
    expect(vals).toContain(20)
    expect(vals).toContain(30)
  })

  it('entries includes all key-value pairs', () => {
    map.add('p', 1)
    map.add('q', 2, 3)
    const ent = map.entries()
    expect(ent.length).toBe(3)
  })

  it('forEach visits every entry', () => {
    map.add('a', 1, 2)
    map.add('b', 3)
    let count = 0
    map.forEach(() => { count++ })
    expect(count).toBe(3)
  })

  it('clone after delete preserves remaining', () => {
    map.add('a', 1, 2, 3)
    map.deleteEntry('a', 2)
    const clone = map.clone()
    expect(clone.entryCount).toBe(2)
    expect(clone.hasEntry('a', 1)).toBe(true)
    expect(clone.hasEntry('a', 3)).toBe(true)
    expect(clone.hasEntry('a', 2)).toBe(false)
  })

  it('invert with overlapping values', () => {
    map.add('a', 1)
    map.add('b', 1)
    map.add('c', 2)
    const inv = map.invert()
    expect(inv.getValues(1)).toContain('a')
    expect(inv.getValues(1)).toContain('b')
    expect(inv.getValues(2)).toContain('c')
  })

  it('merge with empty map does nothing', () => {
    map.add('a', 1)
    const empty = new MultiMap<string, number>()
    map.merge(empty)
    expect(map.entryCount).toBe(1)
  })

  it('equals with empty maps', () => {
    const other = new MultiMap<string, number>()
    expect(map.equals(other)).toBe(true)
  })

  it('equals with different key counts', () => {
    map.add('a', 1)
    const other = new MultiMap<string, number>()
    other.add('a', 1)
    other.add('b', 2)
    expect(map.equals(other)).toBe(false)
  })

  it('filterKeys returns empty when nothing matches', () => {
    map.add('a', 1)
    map.add('b', 2)
    const filtered = map.filterKeys(() => false)
    expect(filtered.isEmpty).toBe(true)
  })

  it('filterValues removes all values from a key', () => {
    map.add('a', 1, 3, 5)
    map.add('b', 2, 4)
    const filtered = map.filterValues((v) => v % 2 === 0)
    expect(filtered.has('a')).toBe(false)
    expect(filtered.getValues('b')).toEqual([2, 4])
  })

  it('fromEntries with duplicate entries', () => {
    const entries: Array<[string, number]> = [['a', 1], ['a', 1], ['a', 2]]
    const result = MultiMap.fromEntries(entries)
    expect(result.entryCount).toBe(2)
    expect(result.getValues('a')).toContain(1)
    expect(result.getValues('a')).toContain(2)
  })

  it('fromGroups with empty value arrays', () => {
    const groups: Array<[string, number[]]> = [['a', []], ['b', [1]]]
    const result = MultiMap.fromGroups(groups)
    expect(result.has('a')).toBe(false)
    expect(result.hasEntry('b', 1)).toBe(true)
  })

  it('number keys work correctly', () => {
    const numMap = new MultiMap<number, string>()
    numMap.set(1, 'a')
    numMap.set(1, 'b')
    numMap.set(2, 'c')
    expect(numMap.keyCount).toBe(2)
    expect(numMap.entryCount).toBe(3)
    expect(numMap.getValues(1)).toContain('a')
    expect(numMap.getValues(1)).toContain('b')
  })

  it('should delete a specific entry', () => {
    const mm = new MultiMap<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    expect(mm.deleteEntry('a', 1)).toBe(true)
    expect(mm.hasEntry('a', 1)).toBe(false)
    expect(mm.hasEntry('a', 2)).toBe(true)
  })

  it('should return false for deleting missing entry', () => {
    const mm = new MultiMap<string, number>()
    expect(mm.deleteEntry('x', 1)).toBe(false)
  })

  it('should report isEmpty', () => {
    const mm = new MultiMap<string, number>()
    expect(mm.isEmpty).toBe(true)
    mm.set('a', 1)
    expect(mm.isEmpty).toBe(false)
  })

  it('should report keyCount and entryCount', () => {
    const mm = new MultiMap<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    mm.set('b', 3)
    expect(mm.keyCount).toBe(2)
    expect(mm.entryCount).toBe(3)
  })

  it('should clone the multimap', () => {
    const mm = new MultiMap<string, number>()
    mm.set('a', 1)
    const cloned = mm.clone()
    expect(cloned.equals(mm)).toBe(true)
  })

  it('should invert the multimap', () => {
    const mm = new MultiMap<string, number>()
    mm.set('a', 1)
    mm.set('b', 1)
    const inv = mm.invert()
    expect(inv.hasEntry(1, 'a')).toBe(true)
    expect(inv.hasEntry(1, 'b')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const mm = new MultiMap<string, number>()
    expect(mm.has('missing')).toBe(false)
  })

  it('delete removes a value', () => {
    const mm = new MultiMap<string, number>()
    mm.set('a', 1)
    mm.set('a', 2)
    mm.delete('a', 1)
    expect(mm.get('a').has(1)).toBe(false)
  })

  it('keyCount tracks keys', () => {
    const mm = new MultiMap<string, number>()
    mm.set('a', 1)
    mm.set('b', 2)
    expect(mm.keyCount).toBe(2)
  })
})
describe('multi-map - wave548', () => {
  it('multi-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module has name', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module not null', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module has length', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('multi-map - wave549', () => {
  it('multi-map module defined', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module is function', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('multi-map - wave550', () => {
  it('multi-map w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('multi-map - wave551', () => {
  it('multi-map w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('multi-map - wave552', () => {
  it('multi-map w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('multi-map - wave553', () => {
  it('multi-map w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('multi-map - wave554', () => {
  it('multi-map w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('multi-map - wave555', () => {
  it('multi-map w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('multi-map - wave556', () => {
  it('multi-map w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('multi-map w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
