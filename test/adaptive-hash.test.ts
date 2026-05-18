import { AdaptiveHash } from '../src/core/adaptive-hash/adaptive-hash.js'
import type { AdaptiveHashOptions, Strategy, AdaptiveHashStatistics } from '../src/core/adaptive-hash/types.js'

// Helper: insert N unique items
function fillEntries(hash: AdaptiveHash<string, number>, count: number, offset = 0): void {
  for (let i = offset; i < offset + count; i++) {
    hash.set(`key-${i}`, i)
  }
}

// ============================================================
// 1. Constructor and default options
// ============================================================
describe('AdaptiveHash – Constructor', () => {
  it('creates an instance with default options', () => {
    const h = new AdaptiveHash<string, number>()
    expect(h.size).toBe(0)
    expect(h.isEmpty).toBe(true)
    expect(h.getCurrentStrategy()).toBe('array')
  })

  it('accepts custom options', () => {
    const h = new AdaptiveHash<string, number>({
      arrayToProbingThreshold: 4,
      probingToChainedThreshold: 16,
      loadFactor: 0.5,
    })
    // Should still start as array
    expect(h.getCurrentStrategy()).toBe('array')
  })

  it('accepts partial options and uses defaults for the rest', () => {
    const h = new AdaptiveHash<string, number>({ loadFactor: 0.9 })
    // Inserting 8 items should trigger array→probing with default threshold
    fillEntries(h, 8)
    expect(h.getCurrentStrategy()).toBe('probing')
  })
})

// ============================================================
// 2. Basic set / get / delete / has operations
// ============================================================
describe('AdaptiveHash – Basic operations (array strategy)', () => {
  let h: AdaptiveHash<string, number>

  beforeEach(() => {
    h = new AdaptiveHash<string, number>()
  })

  it('set and get a value', () => {
    h.set('a', 1)
    expect(h.get('a')).toBe(1)
  })

  it('returns undefined for missing key', () => {
    expect(h.get('missing')).toBeUndefined()
  })

  it('has() returns true for existing key', () => {
    h.set('x', 42)
    expect(h.has('x')).toBe(true)
  })

  it('has() returns false for missing key', () => {
    expect(h.has('nope')).toBe(false)
  })

  it('delete() removes a key and returns true', () => {
    h.set('del', 99)
    expect(h.delete('del')).toBe(true)
    expect(h.has('del')).toBe(false)
    expect(h.size).toBe(0)
  })

  it('delete() returns false for missing key', () => {
    expect(h.delete('nonexistent')).toBe(false)
  })

  it('size tracks the number of entries', () => {
    h.set('a', 1)
    h.set('b', 2)
    h.set('c', 3)
    expect(h.size).toBe(3)
  })

  it('isEmpty returns false when entries exist', () => {
    h.set('a', 1)
    expect(h.isEmpty).toBe(false)
  })
})

// ============================================================
// 3. Strategy auto-upgrade: array → probing → chained
// ============================================================
describe('AdaptiveHash – Strategy auto-upgrade', () => {
  it('switches from array to probing at default threshold (8)', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 7)
    expect(h.getCurrentStrategy()).toBe('array')
    h.set('key-7', 7) // 8th item
    expect(h.getCurrentStrategy()).toBe('probing')
    expect(h.size).toBe(8)
  })

  it('switches from probing to chained at default threshold (128)', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 128)
    expect(h.getCurrentStrategy()).toBe('chained')
    expect(h.size).toBe(128)
  })

  it('all data survives strategy switch array→probing', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 8)
    expect(h.getCurrentStrategy()).toBe('probing')
    for (let i = 0; i < 8; i++) {
      expect(h.get(`key-${i}`)).toBe(i)
    }
  })

  it('all data survives strategy switch probing→chained', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 128)
    expect(h.getCurrentStrategy()).toBe('chained')
    for (let i = 0; i < 128; i++) {
      expect(h.get(`key-${i}`)).toBe(i)
    }
  })

  it('full pipeline: array → probing → chained with data integrity', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    expect(h.getCurrentStrategy()).toBe('chained')
    for (let i = 0; i < 130; i++) {
      expect(h.has(`key-${i}`)).toBe(true)
      expect(h.get(`key-${i}`)).toBe(i)
    }
  })
})

// ============================================================
// 4. Custom threshold configuration
// ============================================================
describe('AdaptiveHash – Custom thresholds', () => {
  it('respects custom arrayToProbingThreshold', () => {
    const h = new AdaptiveHash<string, number>({ arrayToProbingThreshold: 3, probingToChainedThreshold: 100 })
    fillEntries(h, 2)
    expect(h.getCurrentStrategy()).toBe('array')
    h.set('key-2', 2)
    expect(h.getCurrentStrategy()).toBe('probing')
  })

  it('respects custom probingToChainedThreshold', () => {
    const h = new AdaptiveHash<string, number>({ arrayToProbingThreshold: 2, probingToChainedThreshold: 10 })
    fillEntries(h, 10)
    expect(h.getCurrentStrategy()).toBe('chained')
  })
})

// ============================================================
// 5. Overwriting existing keys
// ============================================================
describe('AdaptiveHash – Overwriting keys', () => {
  it('overwrites value for existing key (array)', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('k', 1)
    h.set('k', 2)
    expect(h.get('k')).toBe(2)
    expect(h.size).toBe(1)
  })

  it('overwrites value for existing key (probing)', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 8) // triggers probing
    h.set('key-0', 999)
    expect(h.get('key-0')).toBe(999)
    expect(h.size).toBe(8) // size unchanged
  })

  it('overwrites value for existing key (chained)', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 128) // triggers chained
    h.set('key-5', 777)
    expect(h.get('key-5')).toBe(777)
    expect(h.size).toBe(128)
  })

  it('overwrite does not increment insert count', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('x', 1)
    h.set('x', 2)
    const stats = h.getStatistics()
    expect(stats.inserts).toBe(1) // only first set counts as insert
  })
})

// ============================================================
// 6. keys() / values() / entries()
// ============================================================
describe('AdaptiveHash – keys / values / entries', () => {
  it('keys() returns all keys (array strategy)', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.set('b', 2)
    const keys = h.keys()
    expect(keys).toEqual(expect.arrayContaining(['a', 'b']))
    expect(keys.length).toBe(2)
  })

  it('values() returns all values (array strategy)', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 10)
    h.set('b', 20)
    const vals = h.values()
    expect(vals).toEqual(expect.arrayContaining([10, 20]))
  })

  it('entries() returns [key, value] pairs (array strategy)', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('x', 1)
    h.set('y', 2)
    const ent = h.entries()
    expect(ent).toEqual(expect.arrayContaining([['x', 1], ['y', 2]]))
    expect(ent.length).toBe(2)
  })

  it('keys() works after strategy upgrade to probing', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 10)
    expect(h.getCurrentStrategy()).toBe('probing')
    const keys = h.keys()
    expect(keys.length).toBe(10)
    for (let i = 0; i < 10; i++) {
      expect(keys).toContain(`key-${i}`)
    }
  })

  it('values() works after strategy upgrade to chained', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    expect(h.getCurrentStrategy()).toBe('chained')
    const vals = h.values()
    expect(vals.length).toBe(130)
    for (let i = 0; i < 130; i++) {
      expect(vals).toContain(i)
    }
  })

  it('entries() works across all strategies', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    const ent = h.entries()
    expect(ent.length).toBe(130)
    for (let i = 0; i < 130; i++) {
      const found = ent.find(([k]) => k === `key-${i}`)
      expect(found).toBeDefined()
      expect(found![1]).toBe(i)
    }
  })
})

// ============================================================
// 7. forEach and iterator
// ============================================================
describe('AdaptiveHash – forEach and Symbol.iterator', () => {
  it('forEach iterates all entries', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.set('b', 2)
    h.set('c', 3)
    const collected: [string, number][] = []
    h.forEach((v, k) => collected.push([k, v]))
    expect(collected.length).toBe(3)
    expect(collected).toEqual(expect.arrayContaining([['a', 1], ['b', 2], ['c', 3]]))
  })

  it('forEach passes the map reference as third arg', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('x', 1)
    let ref: AdaptiveHash<string, number> | undefined
    h.forEach((_v, _k, map) => { ref = map })
    expect(ref).toBe(h)
  })

  it('Symbol.iterator yields all entries', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 10)
    h.set('b', 20)
    const result: [string, number][] = []
    for (const entry of h) {
      result.push(entry)
    }
    expect(result.length).toBe(2)
    expect(result).toEqual(expect.arrayContaining([['a', 10], ['b', 20]]))
  })

  it('toArray() returns same as entries()', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('k1', 100)
    h.set('k2', 200)
    expect(h.toArray()).toEqual(h.entries())
  })

  it('forEach works on chained strategy', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    let count = 0
    h.forEach(() => { count++ })
    expect(count).toBe(130)
  })
})

// ============================================================
// 8. clear() resets to array strategy
// ============================================================
describe('AdaptiveHash – clear()', () => {
  it('clears all entries and resets strategy', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    expect(h.getCurrentStrategy()).toBe('chained')
    h.clear()
    expect(h.size).toBe(0)
    expect(h.isEmpty).toBe(true)
    expect(h.getCurrentStrategy()).toBe('array')
  })

  it('allows reuse after clear', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    h.clear()
    h.set('new', 42)
    expect(h.get('new')).toBe(42)
    expect(h.size).toBe(1)
  })

  it('keys/values/entries return empty after clear', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.clear()
    expect(h.keys()).toEqual([])
    expect(h.values()).toEqual([])
    expect(h.entries()).toEqual([])
  })
})

// ============================================================
// 9. Statistics tracking
// ============================================================
describe('AdaptiveHash – Statistics', () => {
  it('tracks inserts', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.set('b', 2)
    expect(h.getStatistics().inserts).toBe(2)
  })

  it('tracks deletes', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.delete('a')
    h.delete('missing')
    // delete increments for both attempts
    expect(h.getStatistics().deletes).toBe(2)
  })

  it('tracks lookups via get()', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.get('a')
    h.get('missing')
    expect(h.getStatistics().lookups).toBe(2)
  })

  it('tracks lookups via has()', () => {
    const h = new AdaptiveHash<string, number>()
    h.has('a')
    h.has('b')
    expect(h.getStatistics().lookups).toBe(2)
  })

  it('tracks strategy switches (array → probing → chained)', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 128)
    expect(h.getStatistics().strategySwitches).toBe(2) // array→probing, probing→chained
  })

  it('tracks probes', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.get('a') // 1 probe in array
    expect(h.getStatistics().probes).toBeGreaterThanOrEqual(1)
  })

  it('currentStrategy in statistics reflects actual strategy', () => {
    const h = new AdaptiveHash<string, number>()
    expect(h.getStatistics().currentStrategy).toBe('array')
    fillEntries(h, 10)
    expect(h.getStatistics().currentStrategy).toBe('probing')
    fillEntries(h, 130)
    expect(h.getStatistics().currentStrategy).toBe('chained')
  })

  it('getStatistics returns a copy, not a reference', () => {
    const h = new AdaptiveHash<string, number>()
    const s1 = h.getStatistics()
    h.set('x', 1)
    const s2 = h.getStatistics()
    expect(s1.inserts).toBe(0)
    expect(s2.inserts).toBe(1)
  })
})

// ============================================================
// 10. Edge cases
// ============================================================
describe('AdaptiveHash – Edge cases', () => {
  it('get/has/delete on empty hash returns correctly', () => {
    const h = new AdaptiveHash<string, number>()
    expect(h.get('x')).toBeUndefined()
    expect(h.has('x')).toBe(false)
    expect(h.delete('x')).toBe(false)
  })

  it('can delete and re-insert a key', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.delete('a')
    expect(h.get('a')).toBeUndefined()
    h.set('a', 2)
    expect(h.get('a')).toBe(2)
    expect(h.size).toBe(1)
  })

  it('handles undefined value correctly', () => {
    const h = new AdaptiveHash<string, number | undefined>()
    h.set('u', undefined)
    expect(h.has('u')).toBe(true)
    expect(h.get('u')).toBeUndefined()
    expect(h.size).toBe(1)
  })

  it('handles numeric keys', () => {
    const h = new AdaptiveHash<number, string>()
    h.set(1, 'one')
    h.set(2, 'two')
    expect(h.get(1)).toBe('one')
    expect(h.get(2)).toBe('two')
  })

  it('handles empty string key', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('', 0)
    expect(h.get('')).toBe(0)
    expect(h.has('')).toBe(true)
  })
})

// ============================================================
// 11. Probing-specific: load factor, resizing
// ============================================================
describe('AdaptiveHash – Probing strategy', () => {
  it('get/set/delete work correctly in probing mode', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 10)
    expect(h.getCurrentStrategy()).toBe('probing')
    // get
    for (let i = 0; i < 10; i++) {
      expect(h.get(`key-${i}`)).toBe(i)
    }
    // delete
    expect(h.delete('key-5')).toBe(true)
    expect(h.get('key-5')).toBeUndefined()
    expect(h.size).toBe(9)
    // has
    expect(h.has('key-5')).toBe(false)
    expect(h.has('key-0')).toBe(true)
  })

  it('can insert after deletion in probing mode', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 10)
    h.delete('key-3')
    h.set('key-3', 999)
    expect(h.get('key-3')).toBe(999)
    expect(h.size).toBe(10)
  })

  it('probing resizes when load factor is exceeded', () => {
    const h = new AdaptiveHash<string, number>({ arrayToProbingThreshold: 4, loadFactor: 0.75 })
    fillEntries(h, 20) // well beyond initial capacity
    expect(h.getCurrentStrategy()).toBe('probing')
    for (let i = 0; i < 20; i++) {
      expect(h.get(`key-${i}`)).toBe(i)
    }
  })

  it('probing handles collision via linear probing', () => {
    const h = new AdaptiveHash<string, number>({ arrayToProbingThreshold: 2 })
    fillEntries(h, 20)
    // All entries should still be accessible
    for (let i = 0; i < 20; i++) {
      expect(h.has(`key-${i}`)).toBe(true)
    }
  })
})

// ============================================================
// 12. Chained-specific: collision handling
// ============================================================
describe('AdaptiveHash – Chained strategy', () => {
  it('get/set/delete work in chained mode', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    expect(h.getCurrentStrategy()).toBe('chained')
    for (let i = 0; i < 130; i++) {
      expect(h.get(`key-${i}`)).toBe(i)
    }
  })

  it('delete works in chained mode', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    expect(h.delete('key-50')).toBe(true)
    expect(h.get('key-50')).toBeUndefined()
    expect(h.size).toBe(129)
    // Other keys still intact
    expect(h.get('key-49')).toBe(49)
    expect(h.get('key-51')).toBe(51)
  })

  it('handles collisions in chained mode (many keys)', () => {
    const h = new AdaptiveHash<string, number>()
    // Insert 200 entries to stress chaining
    for (let i = 0; i < 200; i++) {
      h.set(`k${i}`, i)
    }
    expect(h.getCurrentStrategy()).toBe('chained')
    for (let i = 0; i < 200; i++) {
      expect(h.get(`k${i}`)).toBe(i)
    }
  })

  it('can delete head of chain in chained mode', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 130)
    // Delete first inserted key
    expect(h.delete('key-0')).toBe(true)
    expect(h.has('key-0')).toBe(false)
    // Verify other entries
    for (let i = 1; i < 130; i++) {
      expect(h.has(`key-${i}`)).toBe(true)
    }
  })
})

// ============================================================
// 13. String key hashing
// ============================================================
describe('AdaptiveHash – String key hashing', () => {
  it('differentiates similar string keys', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('abc', 1)
    h.set('abd', 2)
    h.set('ab', 3)
    expect(h.get('abc')).toBe(1)
    expect(h.get('abd')).toBe(2)
    expect(h.get('ab')).toBe(3)
  })

  it('handles long string keys', () => {
    const h = new AdaptiveHash<string, number>()
    const longKey = 'a'.repeat(1000)
    h.set(longKey, 42)
    expect(h.get(longKey)).toBe(42)
  })

  it('handles special characters in keys', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('key-with-dash', 1)
    h.set('key.with.dot', 2)
    h.set('key/with/slash', 3)
    h.set('key with space', 4)
    h.set('🔥', 5)
    expect(h.get('key-with-dash')).toBe(1)
    expect(h.get('key.with.dot')).toBe(2)
    expect(h.get('key/with/slash')).toBe(3)
    expect(h.get('key with space')).toBe(4)
    expect(h.get('🔥')).toBe(5)
  })

  it('case-sensitive keys', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('Key', 1)
    h.set('key', 2)
    h.set('KEY', 3)
    expect(h.size).toBe(3)
    expect(h.get('Key')).toBe(1)
    expect(h.get('key')).toBe(2)
    expect(h.get('KEY')).toBe(3)
  })
})

// ============================================================
// Additional coverage
// ============================================================
describe('AdaptiveHash – Additional coverage', () => {
  it('set/get/delete work correctly after multiple strategy transitions', () => {
    const h = new AdaptiveHash<string, number>()
    // Array phase
    h.set('a', 1)
    expect(h.getCurrentStrategy()).toBe('array')
    expect(h.get('a')).toBe(1)

    // Force into probing
    fillEntries(h, 8)
    expect(h.getCurrentStrategy()).toBe('probing')
    expect(h.get('a')).toBe(1)

    // Delete and reinsert
    h.delete('a')
    expect(h.get('a')).toBeUndefined()
    h.set('a', 100)
    expect(h.get('a')).toBe(100)

    // Force into chained
    fillEntries(h, 130, 100)
    expect(h.getCurrentStrategy()).toBe('chained')
    expect(h.get('a')).toBe(100)
  })

  it('clear preserves cumulative statistics but resets strategy', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.get('a')
    h.delete('a')
    h.clear()
    const stats = h.getStatistics()
    expect(stats.currentStrategy).toBe('array')
    expect(stats.inserts).toBe(1)
    expect(stats.deletes).toBe(1)
    expect(stats.lookups).toBe(1)
  })

  it('supports batch insert and retrieval in chained mode', () => {
    const h = new AdaptiveHash<number, string>()
    for (let i = 0; i < 300; i++) {
      h.set(i, `val-${i}`)
    }
    expect(h.getCurrentStrategy()).toBe('chained')
    expect(h.size).toBe(300)
    for (let i = 0; i < 300; i++) {
      expect(h.get(i)).toBe(`val-${i}`)
    }
  })

  it('deleting non-existent key does not affect size', () => {
    const h = new AdaptiveHash<string, number>()
    h.set('a', 1)
    h.delete('b')
    expect(h.size).toBe(1)
  })

  it('iterator and toArray are consistent in probing mode', () => {
    const h = new AdaptiveHash<string, number>()
    fillEntries(h, 20)
    const fromIterator = Array.from(h)
    const fromToArray = h.toArray()
    expect(fromIterator.length).toBe(fromToArray.length)
    for (const [k, v] of fromToArray) {
      const match = fromIterator.find(([ik]) => ik === k)
      expect(match).toBeDefined()
      expect(match![1]).toBe(v)
    }
  })
})
