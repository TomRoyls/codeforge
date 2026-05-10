import { describe, it, expect, beforeEach } from 'vitest'
import { NeighborMap, DEFAULT_NEIGHBOR_MAP_OPTIONS } from '../../src/core/neighbor-map/neighbor-map.js'
import type { NeighborMapOptions, NeighborMapStatistics } from '../../src/core/neighbor-map/neighbor-map.js'

describe('NeighborMap', () => {
  let map: NeighborMap<string, number>

  beforeEach(() => {
    map = new NeighborMap<string, number>()
  })

  describe('constructor', () => {
    it('creates empty map with default options', () => {
      const m = new NeighborMap<string, number>()
      expect(m.size).toBe(0)
      expect(m.isEmpty).toBe(true)
    })

    it('accepts custom gridSize option', () => {
      const m = new NeighborMap<string, number>({ gridSize: 5 })
      expect(m.size).toBe(0)
    })

    it('accepts empty options object', () => {
      const m = new NeighborMap<string, number>({})
      expect(m.size).toBe(0)
    })

    it('uses default gridSize of 10', () => {
      expect(DEFAULT_NEIGHBOR_MAP_OPTIONS.gridSize).toBe(10)
    })
  })

  describe('insert', () => {
    it('inserts a single entry', () => {
      expect(map.insert(0, 0, 'a', 1)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.isEmpty).toBe(false)
    })

    it('returns false for duplicate key', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.insert(5, 5, 'a', 2)).toBe(false)
      expect(map.size).toBe(1)
    })

    it('allows different keys at same coordinates', () => {
      expect(map.insert(0, 0, 'a', 1)).toBe(true)
      expect(map.insert(0, 0, 'b', 2)).toBe(true)
      expect(map.size).toBe(2)
    })

    it('inserts entries at negative coordinates', () => {
      expect(map.insert(-10, -20, 'a', 1)).toBe(true)
      expect(map.get('a')).toBe(1)
    })

    it('inserts entries at large coordinates', () => {
      expect(map.insert(100000, 200000, 'a', 1)).toBe(true)
      expect(map.get('a')).toBe(1)
    })

    it('inserts entries with same value as different keys', () => {
      expect(map.insert(0, 0, 'a', 42)).toBe(true)
      expect(map.insert(5, 5, 'b', 42)).toBe(true)
      expect(map.size).toBe(2)
    })

    it('tracks insert statistics', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(1, 1, 'b', 2)
      expect(map.getStatistics().inserts).toBe(2)
    })

    it('does not increment insert stat on duplicate key', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(0, 0, 'a', 2)
      expect(map.getStatistics().inserts).toBe(1)
    })

    it('works with number keys', () => {
      const m = new NeighborMap<number, string>()
      expect(m.insert(0, 0, 1, 'one')).toBe(true)
      expect(m.get(1)).toBe('one')
    })

    it('works with object values', () => {
      const m = new NeighborMap<string, { name: string }>()
      expect(m.insert(0, 0, 'a', { name: 'test' })).toBe(true)
      expect(m.get('a')!.name).toBe('test')
    })

    it('inserts many entries across grid cells', () => {
      for (let i = 0; i < 100; i++) {
        expect(map.insert(i * 15, i * 15, `k${i}`, i)).toBe(true)
      }
      expect(map.size).toBe(100)
    })
  })

  describe('remove', () => {
    it('removes an existing entry', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.remove('a')).toBe(true)
      expect(map.size).toBe(0)
    })

    it('returns false for non-existent key', () => {
      expect(map.remove('nonexistent')).toBe(false)
    })

    it('removes from correct grid cell', () => {
      map.insert(5, 5, 'a', 1)
      map.insert(25, 25, 'b', 2)
      map.remove('a')
      expect(map.get('a')).toBeUndefined()
      expect(map.get('b')).toBe(2)
    })

    it('cleans up empty grid cells', () => {
      map.insert(0, 0, 'a', 1)
      map.remove('a')
      expect(map.getAt(0, 0)).toEqual([])
    })

    it('does not clean up grid cell with remaining entries', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(0, 0, 'b', 2)
      map.remove('a')
      expect(map.getAt(0, 0)).toEqual([{ key: 'b', value: 2 }])
    })

    it('tracks remove statistics', () => {
      map.insert(0, 0, 'a', 1)
      map.remove('a')
      expect(map.getStatistics().removes).toBe(1)
    })

    it('does not increment remove stat on failed remove', () => {
      map.remove('nonexistent')
      expect(map.getStatistics().removes).toBe(0)
    })

    it('allows re-insertion after removal', () => {
      map.insert(0, 0, 'a', 1)
      map.remove('a')
      expect(map.insert(0, 0, 'a', 2)).toBe(true)
      expect(map.get('a')).toBe(2)
    })

    it('removes from a populated map without affecting others', () => {
      for (let i = 0; i < 10; i++) {
        map.insert(i * 5, i * 5, `k${i}`, i)
      }
      map.remove('k5')
      expect(map.size).toBe(9)
      expect(map.get('k5')).toBeUndefined()
      expect(map.get('k4')).toBe(4)
      expect(map.get('k6')).toBe(6)
    })
  })

  describe('get', () => {
    it('returns value for existing key', () => {
      map.insert(0, 0, 'a', 42)
      expect(map.get('a')).toBe(42)
    })

    it('returns undefined for non-existent key', () => {
      expect(map.get('nonexistent')).toBeUndefined()
    })

    it('returns correct value after multiple inserts', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      map.insert(10, 10, 'c', 3)
      expect(map.get('a')).toBe(1)
      expect(map.get('b')).toBe(2)
      expect(map.get('c')).toBe(3)
    })

    it('returns undefined after removal', () => {
      map.insert(0, 0, 'a', 1)
      map.remove('a')
      expect(map.get('a')).toBeUndefined()
    })
  })

  describe('getAt', () => {
    it('returns entries at exact coordinates', () => {
      map.insert(5, 5, 'a', 1)
      map.insert(5, 5, 'b', 2)
      const result = map.getAt(5, 5)
      expect(result).toHaveLength(2)
    })

    it('returns entries in same grid cell', () => {
      map.insert(1, 1, 'a', 1)
      map.insert(9, 9, 'b', 2)
      const result = map.getAt(5, 5)
      expect(result).toHaveLength(2)
    })

    it('returns empty array for empty cell', () => {
      expect(map.getAt(100, 100)).toEqual([])
    })

    it('does not return entries from other cells', () => {
      map.insert(1, 1, 'a', 1)
      map.insert(11, 11, 'b', 2)
      expect(map.getAt(1, 1)).toHaveLength(1)
    })

    it('works with custom gridSize', () => {
      const m = new NeighborMap<string, number>({ gridSize: 5 })
      m.insert(1, 1, 'a', 1)
      m.insert(4, 4, 'b', 2)
      expect(m.getAt(3, 3)).toHaveLength(2)
    })
  })

  describe('nearest', () => {
    it('returns single nearest neighbor', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(10, 10, 'b', 2)
      const result = map.nearest(1, 1, 1)
      expect(result).toHaveLength(1)
      expect(result[0]!.key).toBe('a')
    })

    it('returns k nearest neighbors', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(3, 3, 'b', 2)
      map.insert(10, 10, 'c', 3)
      const result = map.nearest(1, 1, 2)
      expect(result).toHaveLength(2)
      expect(result[0]!.key).toBe('a')
      expect(result[1]!.key).toBe('b')
    })

    it('returns empty for empty map', () => {
      expect(map.nearest(0, 0, 5)).toEqual([])
    })

    it('returns empty for k=0', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.nearest(0, 0, 0)).toEqual([])
    })

    it('returns empty for negative k', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.nearest(0, 0, -1)).toEqual([])
    })

    it('returns all entries if k exceeds size', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      const result = map.nearest(0, 0, 100)
      expect(result).toHaveLength(2)
    })

    it('returns results sorted by distance', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 0, 'b', 2)
      map.insert(10, 0, 'c', 3)
      const result = map.nearest(7, 0, 3)
      expect(result[0]!.key).toBe('b')
      expect(result[1]!.key).toBe('c')
      expect(result[2]!.key).toBe('a')
      expect(result[0]!.distance).toBeLessThan(result[1]!.distance)
      expect(result[1]!.distance).toBeLessThan(result[2]!.distance)
    })

    it('calculates correct Euclidean distance', () => {
      map.insert(3, 4, 'a', 1)
      const result = map.nearest(0, 0, 1)
      expect(result[0]!.distance).toBeCloseTo(5, 10)
    })

    it('includes coordinates in result', () => {
      map.insert(3, 4, 'a', 1)
      const result = map.nearest(0, 0, 1)
      expect(result[0]!.x).toBe(3)
      expect(result[0]!.y).toBe(4)
    })

    it('uses default k=1', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      const result = map.nearest(1, 1)
      expect(result).toHaveLength(1)
      expect(result[0]!.key).toBe('a')
    })

    it('tracks nearest query statistics', () => {
      map.insert(0, 0, 'a', 1)
      map.nearest(0, 0, 1)
      expect(map.getStatistics().nearestQueries).toBe(1)
    })

    it('finds nearest across grid cells', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(11, 11, 'b', 2)
      const result = map.nearest(12, 12, 1)
      expect(result[0]!.key).toBe('b')
    })

    it('handles query at exact entry location', () => {
      map.insert(5, 5, 'a', 1)
      const result = map.nearest(5, 5, 1)
      expect(result[0]!.distance).toBe(0)
      expect(result[0]!.key).toBe('a')
    })
  })

  describe('inRadius', () => {
    it('returns entries within radius', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 0, 'b', 2)
      map.insert(20, 0, 'c', 3)
      const result = map.inRadius(0, 0, 10)
      expect(result).toHaveLength(2)
    })

    it('returns empty for radius 0 with no exact match', () => {
      map.insert(5, 5, 'a', 1)
      expect(map.inRadius(0, 0, 0)).toEqual([])
    })

    it('returns entry at exact position with radius 0', () => {
      map.insert(0, 0, 'a', 1)
      const result = map.inRadius(0, 0, 0)
      expect(result).toHaveLength(1)
    })

    it('returns empty for negative radius', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.inRadius(0, 0, -1)).toEqual([])
    })

    it('returns empty for empty map', () => {
      expect(map.inRadius(0, 0, 100)).toEqual([])
    })

    it('returns results sorted by distance', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(3, 0, 'b', 2)
      map.insert(6, 0, 'c', 3)
      const result = map.inRadius(0, 0, 10)
      expect(result[0]!.key).toBe('a')
      expect(result[1]!.key).toBe('b')
      expect(result[2]!.key).toBe('c')
    })

    it('calculates correct distances', () => {
      map.insert(3, 4, 'a', 1)
      const result = map.inRadius(0, 0, 10)
      expect(result[0]!.distance).toBeCloseTo(5, 10)
    })

    it('includes all fields in result', () => {
      map.insert(3, 4, 'a', 1)
      const result = map.inRadius(0, 0, 10)
      expect(result[0]).toEqual({ key: 'a', value: 1, x: 3, y: 4, distance: 5 })
    })

    it('handles radius spanning multiple grid cells', () => {
      for (let i = 0; i < 10; i++) {
        map.insert(i * 5, 0, `k${i}`, i)
      }
      const result = map.inRadius(0, 0, 25)
      expect(result.length).toBeGreaterThan(1)
    })

    it('tracks radius query statistics', () => {
      map.insert(0, 0, 'a', 1)
      map.inRadius(0, 0, 10)
      expect(map.getStatistics().radiusQueries).toBe(1)
    })

    it('boundary inclusive - entry exactly at radius distance', () => {
      map.insert(10, 0, 'a', 1)
      const result = map.inRadius(0, 0, 10)
      expect(result).toHaveLength(1)
    })
  })

  describe('updatePosition', () => {
    it('updates position of existing entry', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.updatePosition('a', 10, 10)).toBe(true)
      expect(map.getAt(0, 0)).toEqual([])
      const atNew = map.getAt(10, 10)
      expect(atNew).toHaveLength(1)
      expect(atNew[0]!.key).toBe('a')
    })

    it('returns false for non-existent key', () => {
      expect(map.updatePosition('nonexistent', 10, 10)).toBe(false)
    })

    it('preserves value after position update', () => {
      map.insert(0, 0, 'a', 42)
      map.updatePosition('a', 10, 10)
      expect(map.get('a')).toBe(42)
    })

    it('updates within same grid cell', () => {
      map.insert(1, 1, 'a', 1)
      map.updatePosition('a', 9, 9)
      expect(map.getAt(5, 5)).toHaveLength(1)
    })

    it('updates across different grid cells', () => {
      map.insert(1, 1, 'a', 1)
      map.updatePosition('a', 15, 15)
      expect(map.getAt(1, 1)).toHaveLength(0)
      expect(map.getAt(15, 15)).toHaveLength(1)
    })

    it('nearest finds entry at new position', () => {
      map.insert(0, 0, 'a', 1)
      map.updatePosition('a', 20, 20)
      const result = map.nearest(20, 20, 1)
      expect(result[0]!.key).toBe('a')
      expect(result[0]!.distance).toBe(0)
    })

    it('inRadius finds entry at new position', () => {
      map.insert(0, 0, 'a', 1)
      map.updatePosition('a', 20, 20)
      const result = map.inRadius(20, 20, 1)
      expect(result).toHaveLength(1)
    })
  })

  describe('bounds', () => {
    it('returns null for empty map', () => {
      expect(map.bounds()).toBeNull()
    })

    it('returns bounds for single entry', () => {
      map.insert(5, 10, 'a', 1)
      expect(map.bounds()).toEqual({ minX: 5, minY: 10, maxX: 5, maxY: 10 })
    })

    it('returns correct bounds for multiple entries', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(10, 5, 'b', 2)
      map.insert(3, 15, 'c', 3)
      expect(map.bounds()).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 15 })
    })

    it('handles negative coordinates', () => {
      map.insert(-10, -20, 'a', 1)
      map.insert(5, 5, 'b', 2)
      expect(map.bounds()).toEqual({ minX: -10, minY: -20, maxX: 5, maxY: 5 })
    })

    it('updates after removal', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(10, 10, 'b', 2)
      map.remove('b')
      expect(map.bounds()).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 })
    })

    it('updates after position update', () => {
      map.insert(0, 0, 'a', 1)
      map.updatePosition('a', 20, 20)
      expect(map.bounds()).toEqual({ minX: 20, minY: 20, maxX: 20, maxY: 20 })
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const stats = map.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.nearestQueries).toBe(0)
      expect(stats.radiusQueries).toBe(0)
      expect(stats.avgQuerySize).toBe(0)
    })

    it('tracks inserts', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(1, 1, 'b', 2)
      expect(map.getStatistics().inserts).toBe(2)
    })

    it('tracks removes', () => {
      map.insert(0, 0, 'a', 1)
      map.remove('a')
      expect(map.getStatistics().removes).toBe(1)
    })

    it('tracks nearest queries', () => {
      map.insert(0, 0, 'a', 1)
      map.nearest(0, 0, 1)
      map.nearest(0, 0, 2)
      expect(map.getStatistics().nearestQueries).toBe(2)
    })

    it('tracks radius queries', () => {
      map.insert(0, 0, 'a', 1)
      map.inRadius(0, 0, 10)
      expect(map.getStatistics().radiusQueries).toBe(1)
    })

    it('calculates avgQuerySize', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      map.nearest(0, 0, 1)
      map.inRadius(0, 0, 100)
      const stats = map.getStatistics()
      expect(stats.avgQuerySize).toBeCloseTo(1.5, 10)
    })

    it('returns avgQuerySize 0 when no queries made', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.getStatistics().avgQuerySize).toBe(0)
    })
  })

  describe('size and isEmpty', () => {
    it('returns 0 for empty map', () => {
      expect(map.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(1, 1, 'b', 2)
      expect(map.size).toBe(2)
    })

    it('returns correct size after removal', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(1, 1, 'b', 2)
      map.remove('a')
      expect(map.size).toBe(1)
    })

    it('isEmpty returns true for empty map', () => {
      expect(map.isEmpty).toBe(true)
    })

    it('isEmpty returns false after insert', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.isEmpty).toBe(false)
    })

    it('isEmpty returns true after all removed', () => {
      map.insert(0, 0, 'a', 1)
      map.remove('a')
      expect(map.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(1, 1, 'b', 2)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.isEmpty).toBe(true)
    })

    it('clears empty map without error', () => {
      map.clear()
      expect(map.size).toBe(0)
    })

    it('allows insertions after clear', () => {
      map.insert(0, 0, 'a', 1)
      map.clear()
      expect(map.insert(0, 0, 'a', 2)).toBe(true)
      expect(map.get('a')).toBe(2)
    })

    it('does not reset statistics', () => {
      map.insert(0, 0, 'a', 1)
      map.clear()
      expect(map.getStatistics().inserts).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      expect(map.toArray()).toEqual([])
    })

    it('returns all entries', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      const arr = map.toArray()
      expect(arr).toHaveLength(2)
    })

    it('includes all fields', () => {
      map.insert(3, 4, 'a', 1)
      const arr = map.toArray()
      expect(arr[0]).toEqual({ key: 'a', value: 1, x: 3, y: 4 })
    })

    it('reflects removals', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(1, 1, 'b', 2)
      map.remove('a')
      expect(map.toArray()).toHaveLength(1)
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      const collected: Array<{ value: number; key: string; x: number; y: number }> = []
      map.forEach((value, key, x, y) => collected.push({ value, key, x, y }))
      expect(collected).toHaveLength(2)
    })

    it('provides correct arguments to callback', () => {
      map.insert(3, 4, 'a', 1)
      map.forEach((value, key, x, y) => {
        expect(value).toBe(1)
        expect(key).toBe('a')
        expect(x).toBe(3)
        expect(y).toBe(4)
      })
    })

    it('does not iterate empty map', () => {
      let count = 0
      map.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      map.insert(0, 0, 'a', 1)
      const result = [...map]
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ key: 'a', value: 1, x: 0, y: 0 })
    })

    it('works with for-of loop', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      const keys: string[] = []
      for (const entry of map) {
        keys.push(entry.key)
      }
      expect(keys).toHaveLength(2)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('returns empty iterator for empty map', () => {
      const result = [...map]
      expect(result).toEqual([])
    })

    it('iterates correct number of entries after removal', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      map.remove('a')
      const result = [...map]
      expect(result).toHaveLength(1)
    })
  })

  describe('grid-based spatial index', () => {
    it('distributes entries across cells with custom gridSize', () => {
      const m = new NeighborMap<string, number>({ gridSize: 10 })
      m.insert(1, 1, 'a', 1)
      m.insert(11, 11, 'b', 2)
      m.insert(21, 21, 'c', 3)
      expect(m.getAt(1, 1)).toHaveLength(1)
      expect(m.getAt(11, 11)).toHaveLength(1)
      expect(m.getAt(21, 21)).toHaveLength(1)
    })

    it('groups nearby entries in same cell', () => {
      const m = new NeighborMap<string, number>({ gridSize: 10 })
      m.insert(1, 1, 'a', 1)
      m.insert(9, 9, 'b', 2)
      expect(m.getAt(5, 5)).toHaveLength(2)
    })

    it('handles entries at cell boundaries', () => {
      const m = new NeighborMap<string, number>({ gridSize: 10 })
      m.insert(10, 10, 'a', 1)
      m.insert(9, 9, 'b', 2)
      expect(m.getAt(9, 9)).toHaveLength(1)
      expect(m.getAt(10, 10)).toHaveLength(1)
    })

    it('handles negative coordinates with grid cells', () => {
      const m = new NeighborMap<string, number>({ gridSize: 10 })
      m.insert(-5, -5, 'a', 1)
      m.insert(-15, -15, 'b', 2)
      expect(m.getAt(-5, -5)).toHaveLength(1)
      expect(m.getAt(-15, -15)).toHaveLength(1)
    })

    it('handles small gridSize', () => {
      const m = new NeighborMap<string, number>({ gridSize: 1 })
      m.insert(0.5, 0.5, 'a', 1)
      m.insert(1.5, 1.5, 'b', 2)
      expect(m.getAt(0.5, 0.5)).toHaveLength(1)
      expect(m.getAt(1.5, 1.5)).toHaveLength(1)
    })

    it('handles large gridSize', () => {
      const m = new NeighborMap<string, number>({ gridSize: 1000 })
      m.insert(1, 1, 'a', 1)
      m.insert(500, 500, 'b', 2)
      expect(m.getAt(500, 500)).toHaveLength(2)
    })
  })

  describe('complex scenarios', () => {
    it('handles many inserts and removes', () => {
      for (let i = 0; i < 50; i++) {
        map.insert(i, i, `k${i}`, i)
      }
      for (let i = 0; i < 25; i++) {
        map.remove(`k${i}`)
      }
      expect(map.size).toBe(25)
    })

    it('nearest works after many updates', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(100, 100, 'b', 2)
      map.updatePosition('a', 50, 50)
      const result = map.nearest(51, 51, 1)
      expect(result[0]!.key).toBe('a')
    })

    it('inRadius works with mixed operations', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(5, 5, 'b', 2)
      map.remove('a')
      map.insert(2, 2, 'c', 3)
      const result = map.inRadius(0, 0, 10)
      expect(result.length).toBe(2)
      const keys = result.map((r) => r.key)
      expect(keys).toContain('c')
      expect(keys).toContain('b')
    })

    it('statistics accumulate correctly', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(1, 1, 'b', 2)
      map.remove('a')
      map.nearest(0, 0, 1)
      map.inRadius(0, 0, 10)
      const stats = map.getStatistics()
      expect(stats.inserts).toBe(2)
      expect(stats.removes).toBe(1)
      expect(stats.nearestQueries).toBe(1)
      expect(stats.radiusQueries).toBe(1)
    })

    it('handles fractional coordinates', () => {
      map.insert(0.1, 0.2, 'a', 1)
      map.insert(0.3, 0.4, 'b', 2)
      const result = map.nearest(0, 0, 2)
      expect(result).toHaveLength(2)
    })

    it('handles zero coordinates', () => {
      map.insert(0, 0, 'a', 1)
      expect(map.get('a')).toBe(1)
      expect(map.nearest(0, 0, 1)[0]!.distance).toBe(0)
    })

    it('handles very close coordinates', () => {
      map.insert(0, 0, 'a', 1)
      map.insert(0.0001, 0.0001, 'b', 2)
      const result = map.nearest(0, 0, 2)
      expect(result).toHaveLength(2)
      expect(result[0]!.key).toBe('a')
      expect(result[1]!.key).toBe('b')
    })

    it('iterates after clear and re-insert', () => {
      map.insert(0, 0, 'a', 1)
      map.clear()
      map.insert(1, 1, 'b', 2)
      const arr = [...map]
      expect(arr).toHaveLength(1)
      expect(arr[0]!.key).toBe('b')
    })

    it('bounds after clear returns null', () => {
      map.insert(0, 0, 'a', 1)
      map.clear()
      expect(map.bounds()).toBeNull()
    })
  })

  describe('type exports', () => {
    it('exports NeighborMapOptions type', () => {
      const opts: NeighborMapOptions = { gridSize: 5 }
      expect(opts.gridSize).toBe(5)
    })

    it('exports NeighborMapStatistics type', () => {
      const stats: NeighborMapStatistics = {
        inserts: 0,
        removes: 0,
        nearestQueries: 0,
        radiusQueries: 0,
        avgQuerySize: 0,
      }
      expect(stats.inserts).toBe(0)
    })

    it('exports DEFAULT_NEIGHBOR_MAP_OPTIONS', () => {
      expect(DEFAULT_NEIGHBOR_MAP_OPTIONS.gridSize).toBe(10)
    })
  })
})
