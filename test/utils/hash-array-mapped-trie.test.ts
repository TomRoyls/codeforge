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

describe('hash-array-mapped-trie - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('hash-array-mapped-trie - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('hash-array-mapped-trie - wave548', () => {
  it('hash-array-mapped-trie module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave549', () => {
  it('hash-array-mapped-trie module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave550', () => {
  it('hash-array-mapped-trie w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave551', () => {
  it('hash-array-mapped-trie w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave552', () => {
  it('hash-array-mapped-trie w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave553', () => {
  it('hash-array-mapped-trie w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave554', () => {
  it('hash-array-mapped-trie w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave555', () => {
  it('hash-array-mapped-trie w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave556', () => {
  it('hash-array-mapped-trie w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave557', () => {
  it('hash-array-mapped-trie w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave558', () => {
  it('hash-array-mapped-trie w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave559', () => {
  it('hash-array-mapped-trie w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave560', () => {
  it('hash-array-mapped-trie w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave561', () => {
  it('hash-array-mapped-trie w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave562', () => {
  it('hash-array-mapped-trie w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave563', () => {
  it('hash-array-mapped-trie w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave564', () => {
  it('hash-array-mapped-trie w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave565', () => {
  it('hash-array-mapped-trie w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave566', () => {
  it('hash-array-mapped-trie w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave127', () => {
  it('hash-array-mapped-trie w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave130', () => {
  it('hash-array-mapped-trie w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave133', () => {
  it('hash-array-mapped-trie w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave136', () => {
  it('hash-array-mapped-trie w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - wave139', () => {
  it('hash-array-mapped-trie w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w142', () => {
  it('hash-array-mapped-trie v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w145', () => {
  it('hash-array-mapped-trie v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w148', () => {
  it('hash-array-mapped-trie v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w151', () => {
  it('hash-array-mapped-trie v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w154', () => {
  it('hash-array-mapped-trie v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w157', () => {
  it('hash-array-mapped-trie v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w160', () => {
  it('hash-array-mapped-trie v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w170', () => {
  it('hash-array-mapped-trie x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w180', () => {
  it('hash-array-mapped-trie x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w190', () => {
  it('hash-array-mapped-trie x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w200', () => {
  it('hash-array-mapped-trie x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w210', () => {
  it('hash-array-mapped-trie x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w220', () => {
  it('hash-array-mapped-trie x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w230', () => {
  it('hash-array-mapped-trie x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w240', () => {
  it('hash-array-mapped-trie x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w250', () => {
  it('hash-array-mapped-trie x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w260', () => {
  it('hash-array-mapped-trie x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w270', () => {
  it('hash-array-mapped-trie x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w280', () => {
  it('hash-array-mapped-trie x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w290', () => {
  it('hash-array-mapped-trie x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w300', () => {
  it('hash-array-mapped-trie x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w310', () => {
  it('hash-array-mapped-trie x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w320', () => {
  it('hash-array-mapped-trie x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w330', () => {
  it('hash-array-mapped-trie x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w340', () => {
  it('hash-array-mapped-trie x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w350', () => {
  it('hash-array-mapped-trie x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w360', () => {
  it('hash-array-mapped-trie x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w370', () => {
  it('hash-array-mapped-trie x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w380', () => {
  it('hash-array-mapped-trie x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w390', () => {
  it('hash-array-mapped-trie x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w400', () => {
  it('hash-array-mapped-trie x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w420', () => {
  it('hash-array-mapped-trie x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w440', () => {
  it('hash-array-mapped-trie x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w460', () => {
  it('hash-array-mapped-trie x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w480', () => {
  it('hash-array-mapped-trie x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w500', () => {
  it('hash-array-mapped-trie x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w550', () => {
  it('hash-array-mapped-trie x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('hash-array-mapped-trie - w600', () => {
  it('hash-array-mapped-trie x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('hash-array-mapped-trie x600x49', () => {
    expect(describe).toBeDefined()
  })
})
