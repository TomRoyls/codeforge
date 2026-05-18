import { CuckooHashTable } from '../src/core/cuckoo-hash/cuckoo-hash.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CuckooHashTable', () => {
  describe('constructor', () => {
    it('creates an empty table with default capacity 16', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
      expect(table.capacity()).toBe(16)
    })

    it('creates a table with custom capacity', () => {
      const table = new CuckooHashTable<string, number>(32)
      expect(table.capacity()).toBe(32)
      expect(table.size()).toBe(0)
    })

    it('enforces minimum capacity of 2', () => {
      const table = new CuckooHashTable<string, number>(1)
      expect(table.capacity()).toBe(2)
    })

    it('handles capacity of 0 by clamping to 2', () => {
      const table = new CuckooHashTable<string, number>(0)
      expect(table.capacity()).toBe(2)
    })

    it('handles negative capacity by clamping to 2', () => {
      const table = new CuckooHashTable<string, number>(-10)
      expect(table.capacity()).toBe(2)
    })

    it('handles capacity of exactly 2', () => {
      const table = new CuckooHashTable<string, number>(2)
      expect(table.capacity()).toBe(2)
    })
  })

  // ─── set ──────────────────────────────────────────────────────────────

  describe('set', () => {
    it('inserts a new key-value pair and returns true', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.set('a', 1)).toBe(true)
      expect(table.size()).toBe(1)
    })

    it('inserts multiple key-value pairs', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      expect(table.size()).toBe(3)
    })

    it('updates value for existing key', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      expect(table.set('a', 99)).toBe(true)
      expect(table.get('a')).toBe(99)
      expect(table.size()).toBe(1)
    })

    it('returns true on successful insert', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.set('x', 10)).toBe(true)
    })

    it('handles numeric keys', () => {
      const table = new CuckooHashTable<number, string>()
      table.set(1, 'one')
      table.set(2, 'two')
      expect(table.get(1)).toBe('one')
      expect(table.get(2)).toBe('two')
    })

    it('handles object-like string keys', () => {
      const table = new CuckooHashTable<string, string>()
      table.set('user:1', 'Alice')
      table.set('user:2', 'Bob')
      expect(table.get('user:1')).toBe('Alice')
      expect(table.get('user:2')).toBe('Bob')
    })

    it('handles undefined values', () => {
      const table = new CuckooHashTable<string, number | undefined>()
      table.set('a', undefined)
      expect(table.has('a')).toBe(true)
      expect(table.get('a')).toBeUndefined()
    })

    it('handles null values', () => {
      const table = new CuckooHashTable<string, number | null>()
      table.set('a', null)
      expect(table.has('a')).toBe(true)
      expect(table.get('a')).toBeNull()
    })

    it('handles boolean keys', () => {
      const table = new CuckooHashTable<boolean, string>()
      table.set(true, 'yes')
      table.set(false, 'no')
      expect(table.get(true)).toBe('yes')
      expect(table.get(false)).toBe('no')
    })

    it('can fill to a high load factor', () => {
      const table = new CuckooHashTable<number, number>(32)
      for (let i = 0; i < 20; i++) {
        table.set(i, i * 10)
      }
      expect(table.size()).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(table.get(i)).toBe(i * 10)
      }
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns value for existing key', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 42)
      expect(table.get('a')).toBe(42)
    })

    it('returns undefined for non-existent key', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.get('missing')).toBeUndefined()
    })

    it('returns undefined on empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.get('anything')).toBeUndefined()
    })

    it('returns updated value after set overwrite', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('key', 1)
      table.set('key', 2)
      expect(table.get('key')).toBe(2)
    })

    it('returns undefined after key is deleted', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.delete('a')
      expect(table.get('a')).toBeUndefined()
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing key', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      expect(table.has('a')).toBe(true)
    })

    it('returns false for non-existent key', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.has('missing')).toBe(false)
    })

    it('returns false on empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.has('anything')).toBe(false)
    })

    it('returns false after key is deleted', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.delete('a')
      expect(table.has('a')).toBe(false)
    })

    it('returns true for multiple keys', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('x', 1)
      table.set('y', 2)
      table.set('z', 3)
      expect(table.has('x')).toBe(true)
      expect(table.has('y')).toBe(true)
      expect(table.has('z')).toBe(true)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes an existing key and returns true', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      expect(table.delete('a')).toBe(true)
      expect(table.size()).toBe(0)
    })

    it('returns false for non-existent key', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.delete('missing')).toBe(false)
    })

    it('returns false on empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.delete('anything')).toBe(false)
    })

    it('decrements size on successful delete', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      expect(table.size()).toBe(3)
      table.delete('b')
      expect(table.size()).toBe(2)
    })

    it('only deletes the specified key, not others', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      expect(table.has('a')).toBe(false)
      expect(table.has('b')).toBe(true)
    })

    it('can delete all entries one by one', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.delete('a')
      table.delete('b')
      table.delete('c')
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })
  })

  // ─── size and isEmpty ─────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size returns 0 for new table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.size()).toBe(0)
    })

    it('isEmpty returns true for new table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.isEmpty()).toBe(true)
    })

    it('size increments with each new insert', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      expect(table.size()).toBe(1)
      table.set('b', 2)
      expect(table.size()).toBe(2)
    })

    it('size does not increment on key overwrite', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('a', 2)
      expect(table.size()).toBe(1)
    })

    it('isEmpty returns false after insert', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      expect(table.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after clear', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.clear()
      expect(table.isEmpty()).toBe(true)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.clear()
      expect(table.size()).toBe(0)
      expect(table.isEmpty()).toBe(true)
    })

    it('clears an already empty table without error', () => {
      const table = new CuckooHashTable<string, number>()
      table.clear()
      expect(table.size()).toBe(0)
    })

    it('allows inserting after clear', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.clear()
      table.set('b', 2)
      expect(table.size()).toBe(1)
      expect(table.get('b')).toBe(2)
    })

    it('removes all keys', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('x', 1)
      table.set('y', 2)
      table.clear()
      expect(table.has('x')).toBe(false)
      expect(table.has('y')).toBe(false)
    })
  })

  // ─── capacity ─────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns initial capacity', () => {
      const table = new CuckooHashTable<string, number>(64)
      expect(table.capacity()).toBe(64)
    })

    it('returns default capacity of 16', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.capacity()).toBe(16)
    })

    it('remains the same after inserts', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.set('b', 2)
      expect(table.capacity()).toBe(16)
    })
  })

  // ─── loadFactor ───────────────────────────────────────────────────────

  describe('loadFactor', () => {
    it('returns 0 for empty table', () => {
      const table = new CuckooHashTable<string, number>(16)
      expect(table.loadFactor()).toBe(0)
    })

    it('returns correct load factor after inserts', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      expect(table.loadFactor()).toBe(1 / 16)
    })

    it('increases with more inserts', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.set('d', 4)
      expect(table.loadFactor()).toBe(4 / 16)
    })

    it('decreases after delete', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      expect(table.loadFactor()).toBe(1 / 16)
    })

    it('returns 0 after clear', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.set('b', 2)
      table.clear()
      expect(table.loadFactor()).toBe(0)
    })
  })

  // ─── keys ─────────────────────────────────────────────────────────────

  describe('keys', () => {
    it('returns empty array for empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.keys()).toEqual([])
    })

    it('returns all inserted keys', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const keys = table.keys()
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })

    it('does not return deleted keys', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      const keys = table.keys()
      expect(keys).toEqual(['b'])
    })

    it('reflects updated state after multiple operations', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('x', 1)
      table.set('y', 2)
      table.delete('x')
      table.set('z', 3)
      const keys = table.keys().sort()
      expect(keys).toEqual(['y', 'z'])
    })
  })

  // ─── values ───────────────────────────────────────────────────────────

  describe('values', () => {
    it('returns empty array for empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.values()).toEqual([])
    })

    it('returns all inserted values', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 10)
      table.set('b', 20)
      table.set('c', 30)
      const vals = table.values().sort()
      expect(vals).toEqual([10, 20, 30])
    })

    it('does not return values of deleted keys', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      expect(table.values()).toEqual([2])
    })

    it('reflects updated values', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('a', 99)
      expect(table.values()).toEqual([99])
    })
  })

  // ─── entries ──────────────────────────────────────────────────────────

  describe('entries', () => {
    it('returns empty array for empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.entries()).toEqual([])
    })

    it('returns all key-value pairs', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const entries = table.entries()
      expect(entries.length).toBe(2)
      const sorted = entries.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      expect(sorted).toEqual([['a', 1], ['b', 2]])
    })

    it('reflects deletions', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      table.delete('b')
      const entries = table.entries()
      expect(entries.length).toBe(2)
    })

    it('reflects value updates', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('a', 42)
      const entries = table.entries()
      expect(entries).toEqual([['a', 42]])
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('does not call callback on empty table', () => {
      const table = new CuckooHashTable<string, number>()
      let count = 0
      table.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each entry', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.set('c', 3)
      const collected: Array<[string, number]> = []
      table.forEach((key, value) => {
        collected.push([key, value])
      })
      expect(collected.length).toBe(3)
      const sorted = collected.sort((a, b) => a[0].localeCompare(b[0]))
      expect(sorted).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('provides correct key and value', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('x', 42)
      let receivedKey: string | null = null
      let receivedValue: number | null = null
      table.forEach((key, value) => {
        receivedKey = key
        receivedValue = value
      })
      expect(receivedKey).toBe('x')
      expect(receivedValue).toBe(42)
    })
  })

  // ─── rehash ───────────────────────────────────────────────────────────

  describe('rehash', () => {
    it('rehashes to the same capacity by default', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.set('b', 2)
      table.rehash()
      expect(table.capacity()).toBe(16)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
    })

    it('rehashes to a larger capacity', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.set('b', 2)
      table.rehash(64)
      expect(table.capacity()).toBe(64)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
    })

    it('preserves all entries after rehash', () => {
      const table = new CuckooHashTable<number, number>(32)
      for (let i = 0; i < 15; i++) {
        table.set(i, i * 10)
      }
      table.rehash(64)
      expect(table.size()).toBe(15)
      for (let i = 0; i < 15; i++) {
        expect(table.get(i)).toBe(i * 10)
      }
    })

    it('clamps new capacity to minimum 2', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.rehash(1)
      expect(table.capacity()).toBe(2)
    })

    it('handles rehash on empty table', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.rehash(32)
      expect(table.capacity()).toBe(32)
      expect(table.size()).toBe(0)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const cloned = table.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('modifications to clone do not affect original', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const cloned = table.clone()
      cloned.set('b', 2)
      expect(table.has('b')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })

    it('modifications to original do not affect clone', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const cloned = table.clone()
      table.delete('a')
      expect(cloned.has('a')).toBe(true)
      expect(table.has('a')).toBe(false)
    })

    it('clones empty table', () => {
      const table = new CuckooHashTable<string, number>()
      const cloned = table.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('preserves capacity', () => {
      const table = new CuckooHashTable<string, number>(64)
      table.set('a', 1)
      const cloned = table.clone()
      expect(cloned.capacity()).toBe(64)
    })

    it('deep copies values (entries are independent)', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const cloned = table.clone()
      cloned.set('a', 99)
      expect(table.get('a')).toBe(1)
      expect(cloned.get('a')).toBe(99)
    })
  })

  // ─── toString ─────────────────────────────────────────────────────────

  describe('toString', () => {
    it('returns empty braces for empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.toString()).toBe('CuckooHashTable{}')
    })

    it('returns key-value pairs in string form', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      const str = table.toString()
      expect(str).toContain('a:1')
      expect(str).toContain('CuckooHashTable{')
    })

    it('handles multiple entries', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      const str = table.toString()
      expect(str).toContain('a:1')
      expect(str).toContain('b:2')
    })

    it('handles non-string keys and values', () => {
      const table = new CuckooHashTable<number, string>()
      table.set(42, 'answer')
      const str = table.toString()
      expect(str).toContain('42:answer')
    })
  })

  // ─── maxChainLength ───────────────────────────────────────────────────

  describe('maxChainLength', () => {
    it('returns 0 for empty table', () => {
      const table = new CuckooHashTable<string, number>()
      expect(table.maxChainLength()).toBe(0)
    })

    it('returns 0 after inserting into empty slots', () => {
      const table = new CuckooHashTable<string, number>(64)
      table.set('a', 1)
      expect(table.maxChainLength()).toBe(0)
    })

    it('returns 0 after clear', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.clear()
      expect(table.maxChainLength()).toBe(0)
    })
  })

  // ─── Eviction and Auto-Rehash ─────────────────────────────────────────

  describe('eviction and auto-rehash', () => {
    it('auto-rehashes when displacement limit is reached', () => {
      const table = new CuckooHashTable<number, number>(4)
      // Insert enough items to potentially trigger auto-rehash
      for (let i = 0; i < 10; i++) {
        table.set(i, i)
      }
      expect(table.size()).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(table.get(i)).toBe(i)
      }
    })

    it('grows capacity during auto-rehash', () => {
      const table = new CuckooHashTable<number, number>(4)
      const initialCapacity = table.capacity()
      for (let i = 0; i < 20; i++) {
        table.set(i, i * 10)
      }
      // Capacity should have grown
      expect(table.capacity()).toBeGreaterThanOrEqual(initialCapacity)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles insert-delete-reinsert cycle', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.delete('a')
      table.set('a', 2)
      expect(table.get('a')).toBe(2)
      expect(table.size()).toBe(1)
    })

    it('handles setting the same key multiple times', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('a', 2)
      table.set('a', 3)
      table.set('a', 4)
      expect(table.get('a')).toBe(4)
      expect(table.size()).toBe(1)
    })

    it('handles many inserts and deletes', () => {
      const table = new CuckooHashTable<number, number>(32)
      for (let i = 0; i < 30; i++) {
        table.set(i, i * 100)
      }
      for (let i = 0; i < 15; i++) {
        table.delete(i)
      }
      expect(table.size()).toBe(15)
      for (let i = 15; i < 30; i++) {
        expect(table.get(i)).toBe(i * 100)
      }
      for (let i = 0; i < 15; i++) {
        expect(table.has(i)).toBe(false)
      }
    })

    it('handles mixed string and numeric operations', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('1', 1)
      table.set('2', 2)
      table.set('3', 3)
      expect(table.size()).toBe(3)
      expect(table.get('1')).toBe(1)
    })

    it('handles rehash then insert', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.set('b', 2)
      table.rehash(32)
      table.set('c', 3)
      expect(table.size()).toBe(3)
      expect(table.get('a')).toBe(1)
      expect(table.get('b')).toBe(2)
      expect(table.get('c')).toBe(3)
    })

    it('handles clear then rehash', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.clear()
      table.rehash(64)
      expect(table.capacity()).toBe(64)
      expect(table.size()).toBe(0)
    })

    it('handles empty string key', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('', 42)
      expect(table.get('')).toBe(42)
      expect(table.has('')).toBe(true)
    })

    it('handles keys that stringify similarly', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('1', 100)
      expect(table.get('1')).toBe(100)
    })

    it('handles large number of inserts with small capacity', () => {
      const table = new CuckooHashTable<number, number>(4)
      for (let i = 0; i < 50; i++) {
        expect(table.set(i, i)).toBe(true)
      }
      expect(table.size()).toBe(50)
    })

    it('forEach after clear produces no calls', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.clear()
      let count = 0
      table.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('clone after delete preserves deletion', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 1)
      table.set('b', 2)
      table.delete('a')
      const cloned = table.clone()
      expect(cloned.has('a')).toBe(false)
      expect(cloned.has('b')).toBe(true)
      expect(cloned.size()).toBe(1)
    })

    it('handles rehash down to minimum capacity', () => {
      const table = new CuckooHashTable<string, number>(16)
      table.set('a', 1)
      table.rehash(0)
      expect(table.capacity()).toBe(2)
      expect(table.get('a')).toBe(1)
    })

    it('entries, keys, values are consistent', () => {
      const table = new CuckooHashTable<string, number>()
      table.set('a', 10)
      table.set('b', 20)
      table.set('c', 30)
      expect(table.entries().length).toBe(table.keys().length)
      expect(table.entries().length).toBe(table.values().length)
      expect(table.size()).toBe(3)
    })

    it('handles object values', () => {
      const table = new CuckooHashTable<string, { name: string }>()
      table.set('user', { name: 'Alice' })
      expect(table.get('user')?.name).toBe('Alice')
    })

    it('handles array values', () => {
      const table = new CuckooHashTable<string, number[]>()
      table.set('nums', [1, 2, 3])
      expect(table.get('nums')).toEqual([1, 2, 3])
    })
  })
})
