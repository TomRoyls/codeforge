import { describe, it, expect } from 'vitest'
import { LFUCache4 } from '../src/core/lfu-cache-4/index.js'

describe('LFUCache4', () => {
  describe('basic operations', () => {
    it('sets and gets a value', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const cache = new LFUCache4(3)
      expect(cache.get('missing')).toBeUndefined()
    })

    it('overwrites existing value with set', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    })

    it('has returns true for existing key', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
    })

    it('has returns false for missing key', () => {
      const cache = new LFUCache4(3)
      expect(cache.has('a')).toBe(false)
    })

    it('delete returns true and removes key', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('a')).toBeUndefined()
    })

    it('delete returns false for missing key', () => {
      const cache = new LFUCache4(3)
      expect(cache.delete('a')).toBe(false)
    })

    it('clear removes all entries', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBeUndefined()
    })

    it('tracks size correctly', () => {
      const cache = new LFUCache4(3)
      expect(cache.size).toBe(0)
      cache.set('a', 1)
      expect(cache.size).toBe(1)
      cache.set('b', 2)
      expect(cache.size).toBe(2)
      cache.delete('a')
      expect(cache.size).toBe(1)
    })
  })

  describe('capacity enforcement', () => {
    it('evicts when capacity exceeded', () => {
      const cache = new LFUCache4(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(2)
      expect(cache.has('a')).toBe(false)
    })

    it('handles zero capacity', () => {
      const cache = new LFUCache4(0)
      cache.set('a', 1)
      expect(cache.size).toBe(0)
      expect(cache.get('a')).toBeUndefined()
    })
  })

  describe('LFU eviction', () => {
    it('evicts least frequently used item', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('a')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('d')).toBe(true)
    })

    it('breaks ties by LRU', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('b')
      cache.get('a')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('frequency tracking', () => {
    it('increments frequency on get', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    it('increments frequency on set for existing key', () => {
      const cache = new LFUCache4(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('a', 10)
      cache.set('c', 3)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })
  })
})
