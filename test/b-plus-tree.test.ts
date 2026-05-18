import { BPlusTree } from '../src/core/b-plus-tree/b-plus-tree.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BPlusTree', () => {
  describe('constructor', () => {
    it('creates an empty tree with default order 3', () => {
      const tree = new BPlusTree<string>()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a tree with custom order', () => {
      const tree = new BPlusTree<string>({ order: 5 })
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a tree with minimum order 2', () => {
      const tree = new BPlusTree<string>({ order: 2 })
      expect(tree.size()).toBe(0)
    })

    it('throws Error for order less than 2', () => {
      expect(() => new BPlusTree<string>({ order: 1 })).toThrow('B+ Tree order must be at least 2')
      expect(() => new BPlusTree<string>({ order: 0 })).toThrow('B+ Tree order must be at least 2')
      expect(() => new BPlusTree<string>({ order: -1 })).toThrow('B+ Tree order must be at least 2')
    })

    it('creates a tree with high order', () => {
      const tree = new BPlusTree<number>({ order: 100 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('ignores unknown options and uses defaults', () => {
      const tree = new BPlusTree<string>({ order: 4 })
      expect(tree.size()).toBe(0)
    })
  })

  // ─── Insert ───────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a single key-value pair', () => {
      const tree = new BPlusTree<string>()
      tree.insert(10, 'ten')
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toEqual(['ten'])
    })

    it('inserts multiple keys maintaining sorted order', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'five')
      tree.insert(3, 'three')
      tree.insert(7, 'seven')
      tree.insert(1, 'one')
      tree.insert(9, 'nine')
      const result = tree.toArray()
      expect(result.map(e => e.key)).toEqual([1, 3, 5, 7, 9])
    })

    it('appends value when inserting duplicate key (B+Tree behaviour)', () => {
      const tree = new BPlusTree<string>()
      tree.insert(10, 'ten')
      tree.insert(10, 'TEN')
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toEqual(['ten', 'TEN'])
    })

    it('does not increase size on duplicate key insert', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(1, 'b')
      tree.insert(1, 'c')
      expect(tree.size()).toBe(1)
      expect(tree.search(1)).toEqual(['a', 'b', 'c'])
    })

    it('inserts keys in ascending order', () => {
      const tree = new BPlusTree<number>()
      for (let i = 1; i <= 20; i++) {
        tree.insert(i, i * 10)
      }
      const result = tree.toArray()
      expect(result.length).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(result[i]!.key).toBe(i + 1)
        expect(result[i]!.values).toEqual([(i + 1) * 10])
      }
    })

    it('inserts keys in descending order', () => {
      const tree = new BPlusTree<number>()
      for (let i = 20; i >= 1; i--) {
        tree.insert(i, i * 10)
      }
      const result = tree.toArray()
      expect(result.length).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(result[i]!.key).toBe(i + 1)
      }
    })

    it('inserts many elements with order 3', () => {
      const tree = new BPlusTree<number>({ order: 3 })
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      expect(tree.size()).toBe(100)
      const result = tree.toArray()
      expect(result.length).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(result[i]!.key).toBe(i)
      }
    })

    it('inserts many elements with order 5', () => {
      const tree = new BPlusTree<number>({ order: 5 })
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 2)
      }
      expect(tree.size()).toBe(50)
    })

    it('handles string values', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'hello')
      tree.insert(2, 'world')
      expect(tree.search(1)).toEqual(['hello'])
      expect(tree.search(2)).toEqual(['world'])
    })

    it('handles object values', () => {
      const tree = new BPlusTree<{ name: string }>()
      tree.insert(1, { name: 'a' })
      tree.insert(2, { name: 'b' })
      expect(tree.search(1)).toEqual([{ name: 'a' }])
      expect(tree.search(2)).toEqual([{ name: 'b' }])
    })

    it('handles null values', () => {
      const tree = new BPlusTree<null>()
      tree.insert(1, null)
      tree.insert(2, null)
      expect(tree.search(1)).toEqual([null])
      expect(tree.size()).toBe(2)
    })

    it('handles boolean values', () => {
      const tree = new BPlusTree<boolean>()
      tree.insert(1, true)
      tree.insert(2, false)
      expect(tree.search(1)).toEqual([true])
      expect(tree.search(2)).toEqual([false])
    })
  })

  // ─── Search / Has ─────────────────────────────────────────────────────

  describe('search', () => {
    it('returns values array for existing key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(42, 'answer')
      expect(tree.search(42)).toEqual(['answer'])
    })

    it('returns all values for key with duplicates', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'a')
      tree.insert(5, 'b')
      tree.insert(5, 'c')
      expect(tree.search(5)).toEqual(['a', 'b', 'c'])
    })

    it('returns empty array for non-existing key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      expect(tree.search(99)).toEqual([])
    })

    it('returns empty array on empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.search(1)).toEqual([])
    })

    it('finds keys after many inserts', () => {
      const tree = new BPlusTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i * 100)
      }
      expect(tree.search(0)).toEqual([0])
      expect(tree.search(50)).toEqual([5000])
      expect(tree.search(99)).toEqual([9900])
      expect(tree.search(100)).toEqual([])
    })

    it('returns a copy of values (not a reference)', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'original')
      const values = tree.search(1)
      values.push('mutated')
      expect(tree.search(1)).toEqual(['original'])
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'one')
      expect(tree.has(1)).toBe(true)
    })

    it('returns false for non-existing key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'one')
      expect(tree.has(2)).toBe(false)
    })

    it('returns false on empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.has(1)).toBe(false)
    })

    it('returns true after duplicate inserts', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'five')
      tree.insert(5, 'FIVE')
      expect(tree.has(5)).toBe(true)
    })
  })

  // ─── Delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a key and all its values', () => {
      const tree = new BPlusTree<string>()
      tree.insert(10, 'ten')
      expect(tree.delete(10)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.has(10)).toBe(false)
    })

    it('returns false when deleting from empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.delete(1)).toBe(false)
    })

    it('returns false when deleting non-existing key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'one')
      expect(tree.delete(99)).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('deletes specific value from key with multiple values', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'a')
      tree.insert(5, 'b')
      tree.insert(5, 'c')
      expect(tree.delete(5, 'b')).toBe(true)
      expect(tree.search(5)).toEqual(['a', 'c'])
      expect(tree.size()).toBe(1)
    })

    it('deletes key entirely when last value is removed by specific delete', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'only')
      expect(tree.delete(5, 'only')).toBe(true)
      expect(tree.has(5)).toBe(false)
      expect(tree.size()).toBe(0)
    })

    it('returns false when specific value not found for key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'a')
      expect(tree.delete(5, 'not-here')).toBe(false)
      expect(tree.search(5)).toEqual(['a'])
    })

    it('deletes multiple keys and maintains order', () => {
      const tree = new BPlusTree<string>({ order: 3 })
      tree.insert(1, 'one')
      tree.insert(2, 'two')
      tree.insert(3, 'three')
      tree.insert(4, 'four')
      tree.insert(5, 'five')
      tree.delete(3)
      expect(tree.size()).toBe(4)
      expect(tree.toArray().map(e => e.key)).toEqual([1, 2, 4, 5])
    })

    it('deletes all keys leaving empty tree', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.insert(3, 'c')
      expect(tree.delete(2)).toBe(true)
      expect(tree.delete(1)).toBe(true)
      expect(tree.delete(3)).toBe(true)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('deletes keys from tree with order 2 (minimal)', () => {
      const tree = new BPlusTree<string>({ order: 2 })
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.insert(3, 'c')
      tree.insert(4, 'd')
      expect(tree.delete(2)).toBe(true)
      expect(tree.size()).toBe(3)
      expect(tree.toArray().map(e => e.key)).toEqual([1, 3, 4])
    })

    it('maintains tree correctness after many deletions', () => {
      const tree = new BPlusTree<number>({ order: 4 })
      for (let i = 0; i < 30; i++) {
        tree.insert(i, i)
      }
      for (let i = 0; i < 30; i += 2) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.size()).toBe(15)
      expect(tree.toArray().map(e => e.key)).toEqual(
        Array.from({ length: 15 }, (_, i) => i * 2 + 1)
      )
    })

    it('delete then re-insert works correctly', () => {
      const tree = new BPlusTree<string>()
      tree.insert(10, 'ten')
      tree.delete(10)
      expect(tree.has(10)).toBe(false)
      tree.insert(10, 'new-ten')
      expect(tree.search(10)).toEqual(['new-ten'])
      expect(tree.size()).toBe(1)
    })
  })

  // ─── Size / IsEmpty ──────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size returns 0 for empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.size()).toBe(0)
    })

    it('isEmpty returns true for empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insert', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'one')
      expect(tree.isEmpty()).toBe(false)
    })

    it('size tracks inserts and deletes', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      expect(tree.size()).toBe(2)
      tree.delete(1)
      expect(tree.size()).toBe(1)
      tree.delete(2)
      expect(tree.size()).toBe(0)
    })

    it('size does not increase on duplicate insert', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(1, 'b')
      expect(tree.size()).toBe(1)
    })
  })

  // ─── Clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears the tree', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      tree.insert(3, 'c')
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.search(1)).toEqual([])
    })

    it('clear on already empty tree is a no-op', () => {
      const tree = new BPlusTree<string>()
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('tree is usable after clear', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.clear()
      tree.insert(2, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.search(2)).toEqual(['b'])
    })
  })

  // ─── Min / Max ────────────────────────────────────────────────────────

  describe('min and max', () => {
    it('min returns undefined on empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.min()).toBeUndefined()
    })

    it('max returns undefined on empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.max()).toBeUndefined()
    })

    it('min returns the minimum key and values', () => {
      const tree = new BPlusTree<number>()
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      expect(tree.min()).toEqual({ key: 3, values: [30] })
    })

    it('max returns the maximum key and values', () => {
      const tree = new BPlusTree<number>()
      tree.insert(5, 50)
      tree.insert(3, 30)
      tree.insert(7, 70)
      expect(tree.max()).toEqual({ key: 7, values: [70] })
    })

    it('min and max on single element tree', () => {
      const tree = new BPlusTree<string>()
      tree.insert(42, 'only')
      expect(tree.min()).toEqual({ key: 42, values: ['only'] })
      expect(tree.max()).toEqual({ key: 42, values: ['only'] })
    })

    it('min and max update after insert and delete', () => {
      const tree = new BPlusTree<number>()
      tree.insert(10, 100)
      tree.insert(20, 200)
      tree.insert(30, 300)
      expect(tree.min()).toEqual({ key: 10, values: [100] })
      expect(tree.max()).toEqual({ key: 30, values: [300] })
      tree.delete(10)
      expect(tree.min()).toEqual({ key: 20, values: [200] })
      tree.delete(30)
      expect(tree.max()).toEqual({ key: 20, values: [200] })
    })

    it('min and max return all values for key with duplicates', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(1, 'b')
      tree.insert(5, 'c')
      expect(tree.min()).toEqual({ key: 1, values: ['a', 'b'] })
      expect(tree.max()).toEqual({ key: 5, values: ['c'] })
    })
  })

  // ─── Range ────────────────────────────────────────────────────────────

  describe('range', () => {
    it('returns empty array for empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.range(1, 10)).toEqual([])
    })

    it('returns empty array when min > max', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'five')
      expect(tree.range(10, 1)).toEqual([])
    })

    it('returns single matching entry', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'five')
      tree.insert(10, 'ten')
      const result = tree.range(5, 5)
      expect(result).toEqual([{ key: 5, values: ['five'] }])
    })

    it('returns all entries in range', () => {
      const tree = new BPlusTree<string>()
      for (let i = 1; i <= 10; i++) {
        tree.insert(i, `v${i}`)
      }
      const result = tree.range(3, 7)
      expect(result.map(e => e.key)).toEqual([3, 4, 5, 6, 7])
      expect(result.map(e => e.values)).toEqual([
        ['v3'], ['v4'], ['v5'], ['v6'], ['v7'],
      ])
    })

    it('returns empty when no keys in range', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      expect(tree.range(10, 20)).toEqual([])
    })

    it('range with boundary keys', () => {
      const tree = new BPlusTree<string>()
      tree.insert(10, 'ten')
      tree.insert(20, 'twenty')
      tree.insert(30, 'thirty')
      expect(tree.range(10, 30)).toEqual([
        { key: 10, values: ['ten'] },
        { key: 20, values: ['twenty'] },
        { key: 30, values: ['thirty'] },
      ])
    })

    it('range on large tree', () => {
      const tree = new BPlusTree<number>({ order: 4 })
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i)
      }
      const result = tree.range(40, 60)
      expect(result.length).toBe(21)
      expect(result[0]!.key).toBe(40)
      expect(result[20]!.key).toBe(60)
    })

    it('range returns copies of values arrays', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'a')
      tree.insert(5, 'b')
      const result = tree.range(5, 5)
      result[0]!.values.push('mutated')
      expect(tree.search(5)).toEqual(['a', 'b'])
    })
  })

  // ─── forEach / toArray ───────────────────────────────────────────────

  describe('forEach', () => {
    it('does not call callback on empty tree', () => {
      const tree = new BPlusTree<string>()
      const fn = vi.fn()
      tree.forEach(fn)
      expect(fn).not.toHaveBeenCalled()
    })

    it('calls callback for each key in order', () => {
      const tree = new BPlusTree<string>()
      tree.insert(3, 'c')
      tree.insert(1, 'a')
      tree.insert(2, 'b')
      const keys: number[] = []
      tree.forEach((key) => { keys.push(key) })
      expect(keys).toEqual([1, 2, 3])
    })

    it('provides values array for each key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(1, 'b')
      const entries: Array<{ key: number, values: string[] }> = []
      tree.forEach((key, values) => { entries.push({ key, values }) })
      expect(entries).toEqual([{ key: 1, values: ['a', 'b'] }])
    })

    it('traverses all keys in large tree', () => {
      const tree = new BPlusTree<number>({ order: 3 })
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i)
      }
      const keys: number[] = []
      tree.forEach((key) => { keys.push(key) })
      expect(keys.length).toBe(50)
      for (let i = 0; i < 50; i++) {
        expect(keys[i]).toBe(i)
      }
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new BPlusTree<string>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns single entry for single element', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'one')
      expect(tree.toArray()).toEqual([{ key: 1, values: ['one'] }])
    })

    it('returns keys in sorted order', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'five')
      tree.insert(2, 'two')
      tree.insert(8, 'eight')
      tree.insert(1, 'one')
      tree.insert(9, 'nine')
      const result = tree.toArray()
      expect(result.map(e => e.key)).toEqual([1, 2, 5, 8, 9])
      expect(result.map(e => e.values)).toEqual([
        ['one'], ['two'], ['five'], ['eight'], ['nine'],
      ])
    })

    it('returns correct results after deletions', () => {
      const tree = new BPlusTree<number>()
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i * 10)
      }
      tree.delete(3)
      tree.delete(7)
      expect(tree.toArray().map(e => e.key)).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single element insert and delete cycle', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'one')
      expect(tree.delete(1)).toBe(true)
      expect(tree.isEmpty()).toBe(true)
      tree.insert(1, 'one-again')
      expect(tree.size()).toBe(1)
      expect(tree.search(1)).toEqual(['one-again'])
    })

    it('handles order 2 with many operations', () => {
      const tree = new BPlusTree<number>({ order: 2 })
      for (let i = 0; i < 20; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.size()).toBe(20)
      for (let i = 0; i < 20; i++) {
        expect(tree.search(i)).toEqual([i * 10])
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.delete(i * 2)).toBe(true)
      }
      expect(tree.size()).toBe(10)
      expect(tree.toArray().map(e => e.key)).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19])
    })

    it('handles large number of elements', () => {
      const tree = new BPlusTree<number>({ order: 5 })
      for (let i = 0; i < 500; i++) {
        tree.insert(i, i)
      }
      expect(tree.size()).toBe(500)
      expect(tree.search(0)).toEqual([0])
      expect(tree.search(499)).toEqual([499])
      expect(tree.search(500)).toEqual([])
    })

    it('handles reverse insertion pattern', () => {
      const tree = new BPlusTree<string>({ order: 3 })
      for (let i = 50; i >= 1; i--) {
        tree.insert(i, `v${i}`)
      }
      const result = tree.toArray()
      expect(result.length).toBe(50)
      expect(result[0]!.key).toBe(1)
      expect(result[49]!.key).toBe(50)
    })

    it('handles alternating insert pattern', () => {
      const tree = new BPlusTree<number>({ order: 4 })
      const keys = [50]
      for (let i = 1; i <= 25; i++) {
        keys.push(i)
        keys.push(100 - i)
      }
      const uniqueKeys = [...new Set(keys)]
      for (const k of uniqueKeys) {
        tree.insert(k, k)
      }
      const result = tree.toArray()
      const sortedKeys = [...uniqueKeys].sort((a, b) => a - b)
      expect(result.map(e => e.key)).toEqual(sortedKeys)
    })

    it('handles duplicate keys correctly with multiple values', () => {
      const tree = new BPlusTree<string>()
      tree.insert(5, 'first')
      tree.insert(5, 'second')
      tree.insert(5, 'third')
      expect(tree.search(5)).toEqual(['first', 'second', 'third'])
      expect(tree.size()).toBe(1)
    })

    it('delete then insert same key preserves correctness', () => {
      const tree = new BPlusTree<string>()
      tree.insert(10, 'original')
      tree.delete(10)
      tree.insert(10, 'replacement')
      expect(tree.search(10)).toEqual(['replacement'])
      expect(tree.size()).toBe(1)
    })

    it('clear then bulk insert works', () => {
      const tree = new BPlusTree<number>()
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      tree.clear()
      expect(tree.size()).toBe(0)
      for (let i = 100; i < 150; i++) tree.insert(i, i)
      expect(tree.size()).toBe(50)
      expect(tree.search(100)).toEqual([100])
      expect(tree.search(49)).toEqual([])
    })

    it('handles negative keys', () => {
      const tree = new BPlusTree<string>()
      tree.insert(-5, 'neg-five')
      tree.insert(0, 'zero')
      tree.insert(5, 'five')
      expect(tree.toArray().map(e => e.key)).toEqual([-5, 0, 5])
      expect(tree.search(-5)).toEqual(['neg-five'])
    })

    it('handles zero key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(0, 'zero')
      expect(tree.search(0)).toEqual(['zero'])
      expect(tree.has(0)).toBe(true)
      expect(tree.delete(0)).toBe(true)
      expect(tree.has(0)).toBe(false)
    })

    it('min/max with negative keys', () => {
      const tree = new BPlusTree<number>()
      tree.insert(-10, -100)
      tree.insert(0, 0)
      tree.insert(10, 100)
      expect(tree.min()).toEqual({ key: -10, values: [-100] })
      expect(tree.max()).toEqual({ key: 10, values: [100] })
    })

    it('range query with negative bounds', () => {
      const tree = new BPlusTree<string>()
      tree.insert(-10, 'a')
      tree.insert(-5, 'b')
      tree.insert(0, 'c')
      tree.insert(5, 'd')
      tree.insert(10, 'e')
      expect(tree.range(-5, 5).map(e => e.key)).toEqual([-5, 0, 5])
    })

    it('mixed insert and delete pattern', () => {
      const tree = new BPlusTree<number>({ order: 3 })
      for (let i = 1; i <= 20; i++) {
        tree.insert(i, i)
      }
      for (let i = 2; i <= 20; i += 2) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(10)
      for (let i = 1; i <= 20; i += 2) {
        expect(tree.has(i)).toBe(true)
      }
      for (let i = 2; i <= 20; i += 2) {
        expect(tree.has(i)).toBe(false)
      }
    })

    it('survives stress test: insert, search, delete all', () => {
      const tree = new BPlusTree<number>({ order: 4 })
      const count = 200
      for (let i = 0; i < count; i++) {
        tree.insert(i, i * 10)
      }
      expect(tree.size()).toBe(count)
      for (let i = 0; i < count; i++) {
        expect(tree.search(i)).toEqual([i * 10])
      }
      for (let i = 0; i < count; i++) {
        expect(tree.delete(i)).toBe(true)
      }
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('toArray returns correct entries after complex operations', () => {
      const tree = new BPlusTree<string>({ order: 3 })
      const pairs: Array<[number, string]> = [
        [10, 'j'],
        [5, 'e'],
        [15, 'o'],
        [3, 'c'],
        [7, 'g'],
        [12, 'l'],
        [20, 't'],
      ]
      for (const [k, v] of pairs) {
        tree.insert(k, v)
      }
      const result = tree.toArray()
      expect(result).toEqual([
        { key: 3, values: ['c'] },
        { key: 5, values: ['e'] },
        { key: 7, values: ['g'] },
        { key: 10, values: ['j'] },
        { key: 12, values: ['l'] },
        { key: 15, values: ['o'] },
        { key: 20, values: ['t'] },
      ])
    })

    it('specific value delete does not remove key if other values remain', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'x')
      tree.insert(1, 'y')
      tree.insert(1, 'z')
      expect(tree.delete(1, 'y')).toBe(true)
      expect(tree.has(1)).toBe(true)
      expect(tree.search(1)).toEqual(['x', 'z'])
      expect(tree.size()).toBe(1)
    })

    it('specific value delete removes key when last value removed', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'x')
      tree.insert(2, 'y')
      expect(tree.delete(1, 'x')).toBe(true)
      expect(tree.has(1)).toBe(false)
      expect(tree.size()).toBe(1)
      expect(tree.toArray().map(e => e.key)).toEqual([2])
    })

    it('handles deleting non-existent specific value for existing key', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      expect(tree.delete(1, 'b')).toBe(false)
      expect(tree.search(1)).toEqual(['a'])
      expect(tree.size()).toBe(1)
    })

    it('handles order 3 with sequential insert and random delete', () => {
      const tree = new BPlusTree<string>({ order: 3 })
      for (let i = 0; i < 30; i++) {
        tree.insert(i, `v${i}`)
      }
      for (let i = 0; i < 30; i += 3) {
        tree.delete(i)
      }
      expect(tree.size()).toBe(20)
      const remaining = tree.toArray().map(e => e.key)
      for (let i = 0; i < 30; i++) {
        if (i % 3 === 0) {
          expect(remaining.includes(i)).toBe(false)
        } else {
          expect(remaining.includes(i)).toBe(true)
        }
      }
    })

    it('handles reinserting deleted keys', () => {
      const tree = new BPlusTree<number>({ order: 3 })
      for (let i = 0; i < 10; i++) tree.insert(i, i)
      for (let i = 0; i < 10; i++) tree.delete(i)
      expect(tree.isEmpty()).toBe(true)
      for (let i = 0; i < 10; i++) tree.insert(i, i * 2)
      expect(tree.size()).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(tree.search(i)).toEqual([i * 2])
      }
    })

    it('handles range on tree with duplicate values', () => {
      const tree = new BPlusTree<string>()
      tree.insert(1, 'a')
      tree.insert(1, 'b')
      tree.insert(2, 'c')
      tree.insert(3, 'd')
      tree.insert(3, 'e')
      const result = tree.range(1, 3)
      expect(result).toEqual([
        { key: 1, values: ['a', 'b'] },
        { key: 2, values: ['c'] },
        { key: 3, values: ['d', 'e'] },
      ])
    })

    it('handles forEach after mixed operations', () => {
      const tree = new BPlusTree<number>({ order: 3 })
      for (let i = 0; i < 20; i++) tree.insert(i, i)
      for (let i = 5; i < 15; i++) tree.delete(i)
      const keys: number[] = []
      tree.forEach((key) => keys.push(key))
      expect(keys).toEqual([0, 1, 2, 3, 4, 15, 16, 17, 18, 19])
    })

    it('range after deletions returns correct subset', () => {
      const tree = new BPlusTree<number>({ order: 4 })
      for (let i = 0; i < 50; i++) tree.insert(i, i)
      for (let i = 10; i < 20; i++) tree.delete(i)
      const result = tree.range(8, 22)
      expect(result.map(e => e.key)).toEqual([8, 9, 20, 21, 22])
    })

    it('min and max after all deletes but one', () => {
      const tree = new BPlusTree<string>()
      for (let i = 1; i <= 10; i++) tree.insert(i, `v${i}`)
      for (let i = 1; i <= 10; i++) {
        if (i !== 5) tree.delete(i)
      }
      expect(tree.min()).toEqual({ key: 5, values: ['v5'] })
      expect(tree.max()).toEqual({ key: 5, values: ['v5'] })
    })
  })
})
