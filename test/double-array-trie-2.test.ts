import { DoubleArrayTrie2 } from '../src/core/double-array-trie-2/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('DoubleArrayTrie2', () => {
  describe('constructor', () => {
    it('creates an empty trie with size 0', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates a trie that returns empty toArray', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.toArray()).toEqual([])
    })

    it('creates a trie where has returns false for any word', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.has('')).toBe(false)
      expect(trie.has('a')).toBe(false)
      expect(trie.has('hello')).toBe(false)
    })
  })

  // ─── insert (empty string) ─────────────────────────────────────────────

  describe('insert empty string', () => {
    it('inserts empty string and returns true', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.insert('')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('returns false on duplicate empty string insert', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.insert('')).toBe(false)
      expect(trie.size).toBe(1)
    })

    it('empty string is found by has after insert', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.has('')).toBe(true)
    })

    it('empty string appears in toArray', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.toArray()).toContain('')
    })

    it('empty string appears in startsWith empty prefix', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.startsWith('')).toContain('')
    })
  })

  // ─── insert (single word) ──────────────────────────────────────────────

  describe('insert single word', () => {
    it('insert returns true for a new word', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.insert('hello')).toBe(true)
    })

    it('insert increments size', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      expect(trie.size).toBe(1)
      expect(trie.isEmpty()).toBe(false)
    })

    it('insert returns false for duplicate word', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      expect(trie.insert('hello')).toBe(false)
      expect(trie.size).toBe(1)
    })
  })

  // ─── insert (two unrelated words) ──────────────────────────────────────

  describe('insert two unrelated words', () => {
    it('inserting two words with different first chars', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      trie.insert('dog')
      expect(trie.size).toBe(2)
    })

    it('second unrelated word is retrievable', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      trie.insert('dog')
      expect(trie.has('dog')).toBe(true)
    })
  })

  // ─── insert (shared prefix branching) ──────────────────────────────────

  describe('insert shared prefix', () => {
    it('inserting card then car — car is retrievable', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('card')
      trie.insert('car')
      expect(trie.has('car')).toBe(true)
    })

    it('inserting car then card — card is retrievable', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      trie.insert('card')
      expect(trie.has('card')).toBe(true)
    })

    it('inserting cat after car', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      trie.insert('cat')
      expect(trie.size).toBe(2)
    })

    it('abc and abd — second is retrievable', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('abc')
      trie.insert('abd')
      expect(trie.has('abd')).toBe(true)
    })
  })

  // ─── has ───────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns false on empty trie', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.has('anything')).toBe(false)
    })

    it('returns false for word never inserted', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      expect(trie.has('world')).toBe(false)
    })

    it('returns false for empty string when not inserted', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.has('')).toBe(false)
    })

    it('returns true for word inserted alongside longer word with shared prefix', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      expect(trie.has('car')).toBe(true)
    })

    it('returns true for word after second word with shared prefix is added', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      trie.insert('card')
      expect(trie.has('card')).toBe(true)
    })

    it('returns false for prefix of existing word that was not separately inserted', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      expect(trie.has('hell')).toBe(false)
    })

    it('returns false for extension of a word not inserted', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hi')
      expect(trie.has('high')).toBe(false)
    })

    it('returns true for empty string after insert', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.has('')).toBe(true)
    })

    it('returns true for word inserted alongside empty string', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      expect(trie.has('a')).toBe(true)
      expect(trie.has('')).toBe(true)
    })
  })

  // ─── delete ────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('returns false on empty trie', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.delete('anything')).toBe(false)
    })

    it('returns false for word not in trie', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      expect(trie.delete('world')).toBe(false)
    })

    it('deletes empty string', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.delete('')).toBe(true)
      expect(trie.has('')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('returns false for duplicate delete of empty string', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.delete('')
      expect(trie.delete('')).toBe(false)
    })

    it('returns false for empty string not inserted', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.delete('')).toBe(false)
    })

    it('delete of single non-empty word returns true', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
    })

    it('delete returns false for prefix not in trie', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      expect(trie.delete('hell')).toBe(false)
    })

    it('deleting empty string does not affect other words', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      trie.delete('')
      expect(trie.has('a')).toBe(true)
      expect(trie.size).toBe(1)
    })
  })

  // ─── startsWith ────────────────────────────────────────────────────────

  describe('startsWith', () => {
    it('returns empty array for empty trie', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.startsWith('a')).toEqual([])
    })

    it('returns empty array for non-matching prefix', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      expect(trie.startsWith('z')).toEqual([])
    })

    it('returns words when prefix matches inserted words', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      trie.insert('card')
      expect(trie.startsWith('car')).toEqual(['car', 'card'])
    })

    it('returns all words for empty prefix', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      const result = trie.startsWith('')
      expect(result).toContain('')
      expect(result).toContain('a')
    })

    it('returns words matching prefix', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      expect(trie.startsWith('c')).toEqual(['car'])
    })
  })

  // ─── toArray ───────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty trie', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.toArray()).toEqual([])
    })

    it('includes empty string when inserted', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.toArray()).toContain('')
    })

    it('includes branched words', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('car')
      trie.insert('card')
      const arr = trie.toArray()
      expect(arr).toContain('card')
    })

    it('includes empty string alongside other word', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      const arr = trie.toArray()
      expect(arr).toContain('')
      expect(arr).toContain('a')
    })

    it('returns sorted results', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('b')
      trie.insert('a')
      const arr = trie.toArray()
      expect(arr).toEqual(['', 'a', 'b'])
    })
  })

  // ─── size / isEmpty ────────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for new trie', () => {
      expect(new DoubleArrayTrie2().size).toBe(0)
    })

    it('isEmpty returns true for new trie', () => {
      expect(new DoubleArrayTrie2().isEmpty()).toBe(true)
    })

    it('size increments on each insert', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.size).toBe(1)
      trie.insert('a')
      expect(trie.size).toBe(2)
    })

    it('isEmpty returns false after insert', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.isEmpty()).toBe(false)
    })

    it('size decrements on delete of empty string', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.delete('')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('size does not change on failed delete', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.delete('notexist')
      expect(trie.size).toBe(1)
    })

    it('duplicate insert does not increment size', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
    })

    it('duplicate empty string insert does not increment size', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('')
      expect(trie.size).toBe(1)
    })
  })

  // ─── clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears all entries', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('has returns false after clear', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.clear()
      expect(trie.has('')).toBe(false)
    })

    it('toArray returns empty after clear', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      trie.clear()
      expect(trie.toArray()).toEqual([])
    })

    it('clear on empty trie is safe', () => {
      const trie = new DoubleArrayTrie2()
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('re-insert after clear works', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.clear()
      expect(trie.insert('')).toBe(true)
      expect(trie.has('')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('startsWith returns empty after clear', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.clear()
      expect(trie.startsWith('')).toEqual([])
    })
  })

  // ─── Edge Cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('empty string alongside word insert and delete', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      trie.delete('')
      expect(trie.has('')).toBe(false)
      expect(trie.has('a')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('insert empty string then non-empty then toArray', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('b')
      trie.insert('a')
      const arr = trie.toArray()
      expect(arr).toContain('')
      expect(arr).toContain('a')
      expect(arr).toContain('b')
    })

    it('insert multiple words with shared first char', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('card')
      trie.insert('car')
      expect(trie.has('car')).toBe(true)
      expect(trie.size).toBe(2)
    })

    it('clear then insert different words', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('old')
      trie.clear()
      trie.insert('')
      expect(trie.has('')).toBe(true)
      expect(trie.has('old')).toBe(false)
      expect(trie.size).toBe(1)
    })

    it('multiple clears in a row', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.clear()
      trie.clear()
      trie.clear()
      expect(trie.size).toBe(0)
    })

    it('startsWith after insert and delete of empty string', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.delete('')
      expect(trie.startsWith('')).toEqual([])
    })

    it('size tracks correctly through mixed operations', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      expect(trie.size).toBe(1)
      trie.insert('')
      expect(trie.size).toBe(1)
      trie.delete('')
      expect(trie.size).toBe(0)
      trie.insert('')
      expect(trie.size).toBe(1)
    })

    it('insert many unrelated words', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('banana')
      trie.insert('cherry')
      trie.insert('date')
      expect(trie.size).toBe(3)
    })

    it('insert two words starting with different letters', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('apple')
      trie.insert('banana')
      expect(trie.size).toBe(2)
      expect(trie.has('banana')).toBe(true)
    })

    it('insert empty string multiple times', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.insert('')).toBe(true)
      expect(trie.insert('')).toBe(false)
      expect(trie.insert('')).toBe(false)
      expect(trie.size).toBe(1)
    })

    it('delete empty string then reinsert', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.delete('')
      expect(trie.insert('')).toBe(true)
      expect(trie.has('')).toBe(true)
    })

    it('toArray after delete of empty string', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      trie.delete('')
      expect(trie.toArray()).not.toContain('')
      expect(trie.toArray()).toContain('a')
    })

    it('insert word then word extending it', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('ab')
      trie.insert('abc')
      expect(trie.has('abc')).toBe(true)
      expect(trie.size).toBe(2)
    })

    it('insert longer word then shorter prefix', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('abc')
      trie.insert('ab')
      expect(trie.has('ab')).toBe(true)
      expect(trie.size).toBe(2)
    })

    it('has returns true for word inserted after longer word with shared prefix', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('card')
      trie.insert('car')
      expect(trie.has('car')).toBe(true)
    })

    it('insert same word after clear works', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.clear()
      expect(trie.insert('')).toBe(true)
      expect(trie.has('')).toBe(true)
    })

    it('delete empty string then insert non-empty', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.delete('')
      trie.insert('a')
      expect(trie.has('')).toBe(false)
      expect(trie.has('a')).toBe(true)
    })

    it('insert empty then non-empty then delete non-existent', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      expect(trie.delete('b')).toBe(false)
      expect(trie.size).toBe(2)
    })

    it('startsWith empty returns empty string and branched words', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('a')
      trie.insert('b')
      const all = trie.startsWith('')
      expect(all).toContain('')
      expect(all.length).toBeGreaterThan(0)
    })

    it('isEmpty toggles correctly', () => {
      const trie = new DoubleArrayTrie2()
      expect(trie.isEmpty()).toBe(true)
      trie.insert('')
      expect(trie.isEmpty()).toBe(false)
      trie.delete('')
      expect(trie.isEmpty()).toBe(true)
      trie.insert('')
      expect(trie.isEmpty()).toBe(false)
    })

    it('size tracks through multiple insert and delete of empty string', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      trie.insert('')
      trie.delete('')
      trie.insert('')
      trie.delete('')
      expect(trie.size).toBe(0)
    })

    it('insert empty after clear from non-empty state', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('a')
      trie.clear()
      trie.insert('')
      expect(trie.has('')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('toArray returns new array each call', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('')
      const a1 = trie.toArray()
      const a2 = trie.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('startsWith with prefix longer than any word returns empty', () => {
      const trie = new DoubleArrayTrie2()
      trie.insert('a')
      expect(trie.startsWith('abcdef')).toEqual([])
    })
  })
})
