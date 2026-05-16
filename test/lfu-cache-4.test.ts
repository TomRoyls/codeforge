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

  describe('edge cases', () => {
    it('handles capacity of 1', () => {
      const cache = new LFUCache4(1)
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
      cache.set('b', 2)
      expect(cache.has('a')).toBe(false)
      expect(cache.get('b')).toBe(2)
    })

    it('re-insert after delete uses new frequency', () => {
      const cache = new LFUCache4(2)
      cache.set('a', 1)
      cache.get('a')
      cache.get('a')
      cache.delete('a')
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('a', 10)
      expect(cache.get('a')).toBe(10)
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
    })

    it('multiple evictions in sequence', () => {
      const cache = new LFUCache4(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(2)
      cache.set('d', 4)
      expect(cache.size).toBe(2)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('set overwrites value without eviction', () => {
      const cache = new LFUCache4(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('a', 100)
      expect(cache.size).toBe(2)
      expect(cache.get('a')).toBe(100)
      expect(cache.get('b')).toBe(2)
    })

    it('clear then reuse works correctly', () => {
      const cache = new LFUCache4(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size).toBe(0)
      cache.set('x', 10)
      cache.set('y', 20)
      expect(cache.size).toBe(2)
      expect(cache.get('x')).toBe(10)
    })

    it('delete only key leaves cache empty', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.delete('a')
      expect(cache.size).toBe(0)
      expect(cache.get('a')).toBeUndefined()
    })

    it('evicts correct item after mixed gets', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a')
      cache.get('b')
      cache.get('b')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('additional coverage', () => {
    it('multiple sets on same key keep size constant', () => {
      const cache = new LFUCache4(5)
      cache.set('a', 1)
      cache.set('a', 2)
      cache.set('a', 3)
      cache.set('a', 4)
      expect(cache.size).toBe(1)
      expect(cache.get('a')).toBe(4)
    })

    it('has returns false after clear', () => {
      const cache = new LFUCache4(5)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(false)
    })

    it('large capacity stress test', () => {
      const cache = new LFUCache4(1000)
      for (let i = 0; i < 500; i++) {
        cache.set(`key-${i}`, i)
      }
      expect(cache.size).toBe(500)
      for (let i = 0; i < 500; i++) {
        expect(cache.get(`key-${i}`)).toBe(i)
      }
    })

    it('evicts after many gets on single item', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      for (let i = 0; i < 100; i++) cache.get('a')
      for (let i = 0; i < 100; i++) cache.get('b')
      cache.set('d', 4)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
    })

    it('delete then re-add works', () => {
      const cache = new LFUCache4(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.delete('a')
      cache.set('a', 10)
      expect(cache.size).toBe(2)
      expect(cache.get('a')).toBe(10)
    })

    it('should handle get on missing key', () => {
      const cache = new LFUCache4(5)
      expect(cache.get('missing')).toBeUndefined()
    })

    it('should handle updating existing key value', () => {
      const cache = new LFUCache4(5)
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
      expect(cache.size).toBe(1)
    })

    it('should handle delete on missing key', () => {
      const cache = new LFUCache4(5)
      cache.set('a', 1)
      expect(cache.delete('missing')).toBe(false)
      expect(cache.size).toBe(1)
    })

    it('should handle has on missing key', () => {
      const cache = new LFUCache4(5)
      expect(cache.has('missing')).toBe(false)
    })

    it('should handle get on present key after multiple sets', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.get('a')).toBe(1)
      expect(cache.get('c')).toBe(3)
    })
  })

  describe('additional', () => {
    it('should handle has check', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })
  })

  describe('additional2', () => {
    it('should handle delete', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
      expect(cache.size).toBe(1)
    })

    it('should handle clear', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.size).toBe(0)
    })

    it('should handle get on non-existent key', () => {
      const cache = new LFUCache4(3)
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should handle overwrite', () => {
      const cache = new LFUCache4(3)
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
    expect(cache.size).toBe(1)
  })

  it('should handle delete', () => {
    const cache = new LFUCache4<string, number>(10)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.delete('a')).toBe(true)
    expect(cache.get('a')).toBeUndefined()
    expect(cache.size).toBe(1)
  })

  it('should handle clear', () => {
    const cache = new LFUCache4<string, number>(10)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('should handle has', () => {
    const cache = new LFUCache4<string, number>(10)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.has('a')).toBe(true)
    expect(cache.has('z')).toBe(false)
  })

  it('should handle delete', () => {
    const cache = new LFUCache4<string, number>(10)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.delete('a')
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
  })

  it('should handle eviction', () => {
    const cache = new LFUCache4<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('c', 3)
    expect(cache.has('a')).toBe(true)
  })

  it('should handle delete', () => {
    const cache = new LFUCache4<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.delete('a')
    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
  })

  it('should handle get non-existent key', () => {
    const cache = new LFUCache4<string, number>(3)
    cache.set('a', 1)
    expect(cache.get('z')).toBeUndefined()
  })
  it('should handle delete', () => {
    const cache = new LFUCache4<string, number>(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.delete('a')
    expect(cache.has('a')).toBe(false)
    expect(cache.size).toBe(1)
  })
})
})
