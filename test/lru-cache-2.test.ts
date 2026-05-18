import { LRU2Cache } from '../src/core/lru-cache-2/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('LRU2Cache', () => {
  describe('constructor', () => {
    it('creates cache with default max size', () => {
      const cache = new LRU2Cache<string, number>()
      expect(cache.maxSize).toBe(100)
      expect(cache.isEmpty()).toBe(true)
    })

    it('creates cache with custom max size', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 3 })
      expect(cache.maxSize).toBe(3)
    })

    it('throws for maxSize < 1', () => {
      expect(() => new LRU2Cache({ maxSize: 0 })).toThrow(RangeError)
    })
  })

  // ─── Set / Get ───────────────────────────────────────────────────────────

  describe('set and get', () => {
    it('sets and gets values', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const cache = new LRU2Cache<string, number>()
      expect(cache.get('missing')).toBe(undefined)
    })

    it('updates existing key', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('a', 2)
      expect(cache.get('a')).toBe(2)
      expect(cache.size()).toBe(1)
    })
  })

  // ─── Eviction ────────────────────────────────────────────────────────────

  describe('eviction', () => {
    it('evicts when exceeding max size', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size()).toBe(2)
    })

    it('evicts least recently used item', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a')
      cache.set('c', 3)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })
  })

  // ─── Has / Delete / Peek ─────────────────────────────────────────────────

  describe('has, delete, peek', () => {
    it('has checks membership', () => {
      const cache = new LRU2Cache<string, number>()
      cache.set('a', 1)
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    it('delete removes entry', () => {
      const cache = new LRU2Cache<string, number>()
      cache.set('a', 1)
      expect(cache.delete('a')).toBe(true)
      expect(cache.has('a')).toBe(false)
      expect(cache.delete('a')).toBe(false)
    })

    it('peek returns value without updating access', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.peek('a')).toBe(1)
      cache.set('c', 3)
      expect(cache.has('a')).toBe(false)
    })
  })

  // ─── Resize ──────────────────────────────────────────────────────────────

  describe('resize', () => {
    it('resize changes max size', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.resize(2)
      expect(cache.maxSize).toBe(2)
      expect(cache.size()).toBeLessThanOrEqual(2)
    })

    it('throws for newSize < 1', () => {
      const cache = new LRU2Cache<string, number>()
      expect(() => cache.resize(0)).toThrow(RangeError)
    })
  })

  // ─── Iteration Methods ───────────────────────────────────────────────────

  describe('keys, values, entries, forEach', () => {
    it('keys returns all keys', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.keys()).toContain('a')
      expect(cache.keys()).toContain('b')
    })

    it('values returns all values', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      expect(cache.values()).toContain(1)
      expect(cache.values()).toContain(2)
    })

    it('entries returns key-value pairs', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      const entries = cache.entries()
      expect(entries).toContainEqual(['a', 1])
    })

    it('forEach iterates entries', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.set('b', 2)
      const collected: Array<[string, number]> = []
      cache.forEach((v, k) => collected.push([k, v]))
      expect(collected.length).toBe(2)
    })
  })

  // ─── Access History / Clone ──────────────────────────────────────────────

  describe('accessHistory and clone', () => {
    it('accessHistory returns timestamps', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      cache.get('a')
      const history = cache.accessHistory('a')
      expect(history.length).toBe(2)
    })

    it('accessHistory returns empty for missing key', () => {
      const cache = new LRU2Cache<string, number>()
      expect(cache.accessHistory('missing')).toEqual([])
    })

    it('clone creates independent copy', () => {
      const cache = new LRU2Cache<string, number>({ maxSize: 5 })
      cache.set('a', 1)
      const cloned = cache.clone()
      expect(cloned.get('a')).toBe(1)
      cache.delete('a')
      expect(cloned.get('a')).toBe(1)
    })
  })

  // ─── Clear ───────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clear removes all entries', () => {
      const cache = new LRU2Cache<string, number>()
      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()
      expect(cache.isEmpty()).toBe(true)
      expect(cache.size()).toBe(0)
    })
  })
})
