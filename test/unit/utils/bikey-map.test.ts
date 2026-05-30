import { describe, expect, it } from 'vitest'

import { BiKeyMap } from '../../../src/utils/bikey-map.js'

describe('BiKeyMap', () => {
  describe('set and get', () => {
    it('stores and retrieves values by compound key', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      expect(m.get('a', 'x')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const m = new BiKeyMap<string, string, number>()
      expect(m.get('a', 'x')).toBeUndefined()
    })

    it('overwrites existing value', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('a', 'x', 2)
      expect(m.get('a', 'x')).toBe(2)
      expect(m.size).toBe(1)
    })

    it('stores different values for different k2 with same k1', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('a', 'y', 2)
      expect(m.get('a', 'x')).toBe(1)
      expect(m.get('a', 'y')).toBe(2)
    })

    it('stores different values for different k1 with same k2', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('b', 'x', 2)
      expect(m.get('a', 'x')).toBe(1)
      expect(m.get('b', 'x')).toBe(2)
    })

    it('handles numeric keys', () => {
      const m = new BiKeyMap<number, number, string>()
      m.set(1, 2, 'val')
      expect(m.get(1, 2)).toBe('val')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      expect(m.has('a', 'x')).toBe(true)
    })

    it('returns false for missing key', () => {
      const m = new BiKeyMap<string, string, number>()
      expect(m.has('a', 'x')).toBe(false)
    })

    it('returns false after delete', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.delete('a', 'x')
      expect(m.has('a', 'x')).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const m = new BiKeyMap<string, string, number>()
      expect(m.size).toBe(0)
    })

    it('increments on new entries', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('b', 'y', 2)
      expect(m.size).toBe(2)
    })

    it('does not increment on overwrite', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('a', 'x', 2)
      expect(m.size).toBe(1)
    })

    it('decrements on delete', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.delete('a', 'x')
      expect(m.size).toBe(0)
    })
  })

  describe('delete', () => {
    it('returns true for existing entry', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      expect(m.delete('a', 'x')).toBe(true)
    })

    it('returns false for missing entry', () => {
      const m = new BiKeyMap<string, string, number>()
      expect(m.delete('a', 'x')).toBe(false)
    })

    it('removes the entry', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.delete('a', 'x')
      expect(m.get('a', 'x')).toBeUndefined()
    })
  })

  describe('getByK1', () => {
    it('returns all values for a given k1', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('a', 'y', 2)
      m.set('b', 'z', 3)
      const result = m.getByK1('a')
      expect(result).toHaveLength(2)
      expect(result).toContain(1)
      expect(result).toContain(2)
    })

    it('returns empty array for missing k1', () => {
      const m = new BiKeyMap<string, string, number>()
      expect(m.getByK1('a')).toEqual([])
    })
  })

  describe('getByK2', () => {
    it('returns all values for a given k2', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('b', 'x', 2)
      m.set('c', 'y', 3)
      const result = m.getByK2('x')
      expect(result).toHaveLength(2)
      expect(result).toContain(1)
      expect(result).toContain(2)
    })

    it('returns empty array for missing k2', () => {
      const m = new BiKeyMap<string, string, number>()
      expect(m.getByK2('x')).toEqual([])
    })
  })

  describe('hasK1 / hasK2', () => {
    it('hasK1 returns true when k1 exists', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      expect(m.hasK1('a')).toBe(true)
      expect(m.hasK1('b')).toBe(false)
    })

    it('hasK2 returns true when k2 exists', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      expect(m.hasK2('x')).toBe(true)
      expect(m.hasK2('y')).toBe(false)
    })

    it('hasK1 returns false after all entries with that k1 deleted', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.delete('a', 'x')
      expect(m.hasK1('a')).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('b', 'y', 2)
      m.clear()
      expect(m.size).toBe(0)
      expect(m.get('a', 'x')).toBeUndefined()
    })
  })

  describe('entries', () => {
    it('returns all entries as [k1, k2, value] tuples', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('b', 'y', 2)
      const e = m.entries()
      expect(e).toHaveLength(2)
    })
  })

  describe('values', () => {
    it('returns all values', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('b', 'y', 2)
      const v = m.values()
      expect(v).toHaveLength(2)
      expect(v).toContain(1)
      expect(v).toContain(2)
    })
  })

  describe('forEach', () => {
    it('iterates all entries', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('b', 'y', 2)
      const collected: Array<[string, string, number]> = []
      m.forEach((v, k1, k2) => collected.push([k1, k2, v]))
      expect(collected).toHaveLength(2)
    })
  })

  describe('iterator', () => {
    it('is iterable with for-of', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a', 'x', 1)
      m.set('b', 'y', 2)
      const collected: Array<[string, string, number]> = []
      for (const [k1, k2, v] of m) {
        collected.push([k1, k2, v])
      }
      expect(collected).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('get works for keys with null bytes', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('a\x00b', 'c', 1)
      expect(m.get('a\x00b', 'c')).toBe(1)
      expect(m.has('a\x00b', 'c')).toBe(true)
    })

    it('handles empty string keys', () => {
      const m = new BiKeyMap<string, string, number>()
      m.set('', 'x', 1)
      m.set('a', '', 2)
      expect(m.get('', 'x')).toBe(1)
      expect(m.get('a', '')).toBe(2)
    })

    it('handles object value types', () => {
      const m = new BiKeyMap<string, string, { name: string }>()
      m.set('a', 'x', { name: 'test' })
      expect(m.get('a', 'x')!.name).toBe('test')
    })

    it('handles large number of entries', () => {
      const m = new BiKeyMap<number, number, number>()
      for (let i = 0; i < 1000; i++) {
        m.set(i, i * 2, i * 3)
      }
      expect(m.size).toBe(1000)
      expect(m.get(500, 1000)).toBe(1500)
    })
  })
})
