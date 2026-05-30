import { describe, it, expect } from 'vitest'
import { BurstTrie2 } from '../src/core/burst-trie-2/index.js'

describe('BurstTrie2', () => {
  describe('constructor', () => {
    it('creates empty trie', () => {
      const bt = new BurstTrie2()
      expect(bt.isEmpty()).toBe(true)
      expect(bt.size()).toBe(0)
    })

    it('accepts custom bucket limit', () => {
      const bt = new BurstTrie2(4)
      expect(bt.isEmpty()).toBe(true)
    })
  })

  describe('insert and contains', () => {
    it('inserts and finds a word', () => {
      const bt = new BurstTrie2()
      bt.insert('hello')
      expect(bt.contains('hello')).toBe(true)
    })

    it('does not find uninserted word', () => {
      const bt = new BurstTrie2()
      expect(bt.contains('hello')).toBe(false)
    })

    it('handles multiple words', () => {
      const bt = new BurstTrie2()
      bt.insert('cat')
      bt.insert('car')
      bt.insert('card')
      expect(bt.contains('cat')).toBe(true)
      expect(bt.contains('car')).toBe(true)
      expect(bt.contains('card')).toBe(true)
      expect(bt.contains('care')).toBe(false)
    })

    it('tracks size correctly', () => {
      const bt = new BurstTrie2()
      bt.insert('a')
      bt.insert('b')
      bt.insert('c')
      expect(bt.size()).toBe(3)
    })

    it('handles duplicate insert', () => {
      const bt = new BurstTrie2()
      bt.insert('hello')
      bt.insert('hello')
      expect(bt.size()).toBe(2)
      expect(bt.contains('hello')).toBe(true)
    })

    it('handles empty string', () => {
      const bt = new BurstTrie2()
      bt.insert('')
      expect(bt.contains('')).toBe(true)
    })
  })

  describe('burst behavior', () => {
    it('bursts when bucket exceeds limit', () => {
      const bt = new BurstTrie2(4)
      const words = ['cat', 'car', 'card', 'care', 'cart', 'cars']
      for (const w of words) bt.insert(w)
      expect(bt.size()).toBe(6)
      for (const w of words) expect(bt.contains(w)).toBe(true)
      expect(bt.getNodeCount()).toBeGreaterThan(1)
    })
  })

  describe('remove', () => {
    it('removes a word', () => {
      const bt = new BurstTrie2()
      bt.insert('hello')
      expect(bt.remove('hello')).toBe(true)
      expect(bt.contains('hello')).toBe(false)
      expect(bt.size()).toBe(0)
    })

    it('returns false for missing word', () => {
      expect(new BurstTrie2().remove('hello')).toBe(false)
    })

    it('removes specific word from shared prefix', () => {
      const bt = new BurstTrie2()
      bt.insert('cat')
      bt.insert('car')
      bt.remove('cat')
      expect(bt.contains('cat')).toBe(false)
      expect(bt.contains('car')).toBe(true)
    })
  })

  describe('getAll', () => {
    it('returns all words sorted', () => {
      const bt = new BurstTrie2()
      bt.insert('banana')
      bt.insert('apple')
      bt.insert('cherry')
      expect(bt.getAll()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('returns empty for empty trie', () => {
      expect(new BurstTrie2().getAll()).toEqual([])
    })
  })

  describe('startsWith', () => {
    it('finds words with prefix', () => {
      const bt = new BurstTrie2()
      bt.insert('cat')
      bt.insert('car')
      bt.insert('card')
      bt.insert('dog')
      expect(bt.startsWith('ca').sort()).toEqual(['car', 'card', 'cat'])
    })

    it('returns empty for no matches', () => {
      const bt = new BurstTrie2()
      bt.insert('cat')
      expect(bt.startsWith('dog')).toEqual([])
    })

    it('returns empty for missing prefix path', () => {
      expect(new BurstTrie2().startsWith('a')).toEqual([])
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const bt = new BurstTrie2()
      bt.insert('hello')
      bt.insert('world')
      bt.clear()
      expect(bt.isEmpty()).toBe(true)
      expect(bt.size()).toBe(0)
      expect(bt.getAll()).toEqual([])
    })
  })

  describe('getNodeCount', () => {
    it('counts nodes in trie', () => {
      const bt = new BurstTrie2()
      expect(bt.getNodeCount()).toBe(1)
      bt.insert('a')
      bt.insert('b')
      expect(bt.getNodeCount()).toBe(3)
    })
  })

  describe('stress test', () => {
    it('handles many words with bursting', () => {
      const bt = new BurstTrie2(8)
      const words = Array.from({ length: 200 }, (_, i) => `word-${i.toString().padStart(3, '0')}`)
      for (const w of words) bt.insert(w)
      expect(bt.size()).toBe(200)
      for (const w of words) expect(bt.contains(w)).toBe(true)
      expect(bt.startsWith('word-01').length).toBeGreaterThan(0)
    })
  })
})
