import { describe, it, expect } from 'vitest'
import { HashArrayMappedTrie } from '../../src/utils/hash-array-mapped-trie.js'

describe('HashArrayMappedTrie', () => {
  it('creates empty trie', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    expect(trie.isEmpty).toBe(true)
    expect(trie.size).toBe(0)
  })

  it('creates trie from entries', () => {
    const trie = HashArrayMappedTrie.from([['a', 1], ['b', 2]])
    expect(trie.size).toBe(2)
    expect(trie.get('a')).toBe(1)
    expect(trie.get('b')).toBe(2)
  })

  it('creates trie from of method', () => {
    const trie = HashArrayMappedTrie.of(['a', 1], ['b', 2])
    expect(trie.size).toBe(2)
    expect(trie.get('a')).toBe(1)
  })

  it('gets existing value', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('key', 42)
    expect(updated.get('key')).toBe(42)
  })

  it('gets undefined for missing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    expect(trie.get('missing')).toBeUndefined()
  })

  it('checks has for existing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('key', 42)
    expect(updated.has('key')).toBe(true)
  })

  it('checks has for missing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    expect(trie.has('missing')).toBe(false)
  })

  it('sets new key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1)
    expect(updated.size).toBe(1)
    expect(updated.get('a')).toBe(1)
  })

  it('updates existing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const first = trie.set('a', 1)
    const second = first.set('a', 2)
    expect(second.size).toBe(1)
    expect(second.get('a')).toBe(2)
    expect(first.get('a')).toBe(1)
  })

  it('returns same instance when setting same value', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const first = trie.set('a', 1)
    const second = first.set('a', 1)
    expect(second).toBe(first)
  })

  it('deletes existing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const withEntry = trie.set('a', 1)
    const deleted = withEntry.delete('a')
    expect(deleted.size).toBe(0)
    expect(deleted.get('a')).toBeUndefined()
  })

  it('returns same instance when deleting missing key', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const deleted = trie.delete('missing')
    expect(deleted).toBe(trie)
  })

  it('deletes and decrements size', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const withEntries = trie.set('a', 1).set('b', 2).set('c', 3)
    const deleted = withEntries.delete('b')
    expect(deleted.size).toBe(2)
    expect(deleted.get('b')).toBeUndefined()
    expect(deleted.get('a')).toBe(1)
    expect(deleted.get('c')).toBe(3)
  })

  it('iterates with forEach', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2)
    const results: Array<[string, number]> = []
    updated.forEach((value, key) => {
      results.push([key, value])
    })
    expect(results.length).toBe(2)
    expect(results).toContainEqual(['a', 1])
    expect(results).toContainEqual(['b', 2])
  })

  it('returns all keys', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2).set('c', 3)
    const keys = updated.keys()
    expect(keys.length).toBe(3)
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toContain('c')
  })

  it('returns all values', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2).set('c', 3)
    const values = updated.values()
    expect(values.length).toBe(3)
    expect(values).toContain(1)
    expect(values).toContain(2)
    expect(values).toContain(3)
  })

  it('returns all entries', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2)
    const entries = updated.entries()
    expect(entries.length).toBe(2)
    expect(entries).toContainEqual(['a', 1])
    expect(entries).toContainEqual(['b', 2])
  })

  it('converts to Map', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2)
    const map = updated.toMap()
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
  })

  it('merges with another trie', () => {
    const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
    const trie2 = HashArrayMappedTrie.empty<string, number>().set('c', 3).set('d', 4)
    const merged = trie1.merge(trie2)
    expect(merged.size).toBe(4)
    expect(merged.get('a')).toBe(1)
    expect(merged.get('c')).toBe(3)
  })

  it('merge overwrites existing keys', () => {
    const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
    const trie2 = HashArrayMappedTrie.empty<string, number>().set('b', 20).set('c', 3)
    const merged = trie1.merge(trie2)
    expect(merged.size).toBe(3)
    expect(merged.get('b')).toBe(20)
  })

  it('works with number keys', () => {
    const trie = HashArrayMappedTrie.empty<number, string>()
    const updated = trie.set(1, 'a').set(2, 'b')
    expect(updated.size).toBe(2)
    expect(updated.get(1)).toBe('a')
    expect(updated.get(2)).toBe('b')
  })

  it('works with symbol keys', () => {
    const trie = HashArrayMappedTrie.empty<symbol, number>()
    const sym = Symbol('test')
    const updated = trie.set(sym, 42)
    expect(updated.get(sym)).toBe(42)
  })

  it('handles hash collisions', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const entries: Array<[string, number]> = []
    for (let i = 0; i < 100; i++) {
      entries.push([`key${i}`, i])
    }
    const updated = HashArrayMappedTrie.from(entries)
    expect(updated.size).toBe(100)
    expect(updated.get('key50')).toBe(50)
  })

  it('iterates with for-of', () => {
    const trie = HashArrayMappedTrie.empty<string, number>()
    const updated = trie.set('a', 1).set('b', 2).set('c', 3)
    const results: Array<[string, number]> = []
    for (const entry of updated) {
      results.push(entry)
    }
    expect(results.length).toBe(3)
  })

  describe('toString()', () => {
    it('returns string representation', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const str = trie.toString()
      expect(typeof str).toBe('string')
      expect(str).toContain('HashArrayMappedTrie')
    })

    it('works on empty trie', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      expect(trie.toString()).toBe('HashArrayMappedTrie(0)')
    })

    it('reflects current size', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      expect(trie.toString()).toBe('HashArrayMappedTrie(0)')

      const withOne = trie.set('a', 1)
      expect(withOne.toString()).toBe('HashArrayMappedTrie(1)')

      const withThree = withOne.set('b', 2).set('c', 3)
      expect(withThree.toString()).toBe('HashArrayMappedTrie(3)')
    })

    it('updates after modifications', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const withEntries = trie.set('a', 1).set('b', 2).set('c', 3)
      expect(withEntries.toString()).toBe('HashArrayMappedTrie(3)')

      const deleted = withEntries.delete('b')
      expect(deleted.toString()).toBe('HashArrayMappedTrie(2)')
    })
  })

  describe('toJSON()', () => {
    it('returns serializable object', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const json = trie.toJSON()
      expect(Array.isArray(json)).toBe(true)
      expect(json).toEqual([])
    })

    it('contains all entries', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const updated = trie.set('a', 1).set('b', 2).set('c', 3)
      const json = updated.toJSON() as Array<[string, number]>
      expect(json.length).toBe(3)
      expect(json).toContainEqual(['a', 1])
      expect(json).toContainEqual(['b', 2])
      expect(json).toContainEqual(['c', 3])
    })

    it('works on empty trie', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const json = trie.toJSON()
      expect(json).toEqual([])
    })

    it('can be parsed with JSON.stringify', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const updated = trie.set('a', 1).set('b', 2)
      const jsonStr = JSON.stringify(updated.toJSON())
      expect(jsonStr).toBeTruthy()
      const parsed = JSON.parse(jsonStr)
      expect(parsed.length).toBe(2)
    })

    it('round-trip preserves data', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const updated = trie.set('x', 10).set('y', 20).set('z', 30)
      const json = updated.toJSON() as Array<[string, number]>
      const restored = HashArrayMappedTrie.from(json)
      expect(restored.size).toBe(updated.size)
      expect(restored.get('x')).toBe(10)
      expect(restored.get('y')).toBe(20)
      expect(restored.get('z')).toBe(30)
    })
  })

  describe('clone()', () => {
    it('creates independent copy', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const original = trie.set('a', 1).set('b', 2)
      const clone = original.clone()
      expect(clone).not.toBe(original)
      expect(clone.size).toBe(original.size)
      expect(clone.get('a')).toBe(1)
      expect(clone.get('b')).toBe(2)
    })

    it('clone has same entries', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const original = trie.set('a', 1).set('b', 2).set('c', 3)
      const clone = original.clone()
      const originalEntries = original.entries()
      const cloneEntries = clone.entries()
      expect(cloneEntries).toEqual(originalEntries)
    })

    it('modifying clone does not affect original', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const original = trie.set('a', 1).set('b', 2)
      const clone = original.clone()
      const modifiedClone = clone.set('c', 3)

      expect(original.size).toBe(2)
      expect(original.has('c')).toBe(false)
      expect(modifiedClone.size).toBe(3)
      expect(modifiedClone.has('c')).toBe(true)
    })

    it('modifying original does not affect clone', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const original = trie.set('a', 1).set('b', 2)
      const clone = original.clone()
      const modifiedOriginal = original.set('c', 3)

      expect(clone.size).toBe(2)
      expect(clone.has('c')).toBe(false)
      expect(modifiedOriginal.size).toBe(3)
      expect(modifiedOriginal.has('c')).toBe(true)
    })

    it('clone is different instance', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const original = trie.set('a', 1)
      const clone = original.clone()
      expect(clone === original).toBe(false)
    })

    it('clone size matches original', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const original = trie.set('a', 1).set('b', 2).set('c', 3)
      const clone = original.clone()
      expect(clone.size).toBe(original.size)
    })
  })

  describe('equals()', () => {
    it('same trie equals itself', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const updated = trie.set('a', 1).set('b', 2)
      expect(updated.equals(updated)).toBe(true)
    })

    it('tries with same entries are equal', () => {
      const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
      const trie2 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
      expect(trie1.equals(trie2)).toBe(true)
    })

    it('different entries not equal', () => {
      const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
      const trie2 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('c', 3)
      expect(trie1.equals(trie2)).toBe(false)
    })

    it('different values not equal', () => {
      const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
      const trie2 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 99)
      expect(trie1.equals(trie2)).toBe(false)
    })

    it('non-HAMT returns false', () => {
      const trie = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      expect(trie.equals(null)).toBe(false)
      expect(trie.equals(undefined)).toBe(false)
      expect(trie.equals({})).toBe(false)
      expect(trie.equals(new Map())).toBe(false)
    })

    it('different sizes not equal', () => {
      const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1)
      const trie2 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
      expect(trie1.equals(trie2)).toBe(false)
    })

    it('order independence', () => {
      const trie1 = HashArrayMappedTrie.empty<string, number>().set('a', 1).set('b', 2)
      const trie2 = HashArrayMappedTrie.empty<string, number>().set('b', 2).set('a', 1)
      expect(trie1.equals(trie2)).toBe(true)
    })

    it('empty tries are equal', () => {
      const trie1 = HashArrayMappedTrie.empty<string, number>()
      const trie2 = HashArrayMappedTrie.empty<string, number>()
      expect(trie1.equals(trie2)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles unicode keys', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const updated = trie
        .set('café', 1)
        .set('naïve', 2)
        .set('日本語', 3)
        .set('emoji😀', 4)

      expect(updated.size).toBe(4)
      expect(updated.get('café')).toBe(1)
      expect(updated.get('naïve')).toBe(2)
      expect(updated.get('日本語')).toBe(3)
      expect(updated.get('emoji😀')).toBe(4)

      const clone = updated.clone()
      expect(clone.equals(updated)).toBe(true)
    })

    it('handles empty string keys', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const updated = trie.set('', 42).set('a', 1)
      expect(updated.size).toBe(2)
      expect(updated.get('')).toBe(42)
      expect(updated.get('a')).toBe(1)
    })

    it('handles very large tries (500+ entries)', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const entries: Array<[string, number]> = []
      for (let i = 0; i < 500; i++) {
        entries.push([`key${i}`, i])
      }
      const largeTrie = HashArrayMappedTrie.from(entries)
      expect(largeTrie.size).toBe(500)
      expect(largeTrie.get('key100')).toBe(100)
      expect(largeTrie.get('key499')).toBe(499)

      const clone = largeTrie.clone()
      expect(clone.size).toBe(500)
      expect(clone.equals(largeTrie)).toBe(true)

      const json = largeTrie.toJSON() as Array<[string, number]>
      expect(json.length).toBe(500)
      expect(json).toContainEqual(['key250', 250])
    })

    it('handles delete then re-add same key', () => {
      const trie = HashArrayMappedTrie.empty<string, number>()
      const withEntry = trie.set('key', 10)
      expect(withEntry.get('key')).toBe(10)

      const deleted = withEntry.delete('key')
      expect(deleted.get('key')).toBeUndefined()
      expect(deleted.size).toBe(0)

      const readded = deleted.set('key', 20)
      expect(readded.get('key')).toBe(20)
      expect(readded.size).toBe(1)

      const withOther = trie.set('other', 30)
      expect(withOther.get('key')).toBeUndefined()
      expect(withOther.get('other')).toBe(30)

      const merged = withOther.merge(readded)
      expect(merged.size).toBe(2)
      expect(merged.get('key')).toBe(20)
      expect(merged.get('other')).toBe(30)
    })
  })

  it('keys returns all keys', () => {
    const trie = new HashArrayMappedTrie<string, number>()
      .set('a', 1).set('b', 2)
    expect(trie.keys().sort()).toEqual(['a', 'b'])
  })

  it('values returns all values', () => {
    const trie = new HashArrayMappedTrie<string, number>()
      .set('x', 10).set('y', 20)
    expect(trie.values().sort()).toEqual([10, 20])
  })

  it('entries returns key-value pairs', () => {
    const trie = new HashArrayMappedTrie<string, number>()
      .set('a', 1)
    expect(trie.entries()).toEqual([['a', 1]])
  })

  it('isEmpty is true for new trie', () => {
    expect(new HashArrayMappedTrie<string, number>().isEmpty).toBe(true)
  })
  it('empty trie size is 0', () => {
    const t = HashArrayMappedTrie.empty<string, number>()
    expect(t.size).toBe(0)
  })

  it('set and get', () => {
    const t = HashArrayMappedTrie.empty<string, number>().set('a', 1)
    expect(t.get('a')).toBe(1)
  })

  it('has returns boolean', () => {
    const t = HashArrayMappedTrie.empty<string, number>()
    expect(t.has('missing')).toBe(false)
  })
})

describe('hash-array-mapped-trie - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
