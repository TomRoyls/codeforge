import { describe, it, expect, beforeEach } from 'vitest'
import { SpatialHash } from '../../src/core/spatial-hash/spatial-hash.js'
import { DEFAULT_SPATIAL_HASH_OPTIONS } from '../../src/core/spatial-hash/types.js'
import type {
  SpatialHashOptions,
  SpatialHashEntry,
  SpatialHashStatistics,
  SpatialHashBounds,
  SpatialHashJSON,
} from '../../src/core/spatial-hash/types.js'

describe('SpatialHash', () => {
  let hash: SpatialHash

  beforeEach(() => {
    hash = new SpatialHash()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const h = new SpatialHash()
      expect(h.isEmpty).toBe(true)
      expect(h.size).toBe(0)
    })

    it('should accept options object with cellSize', () => {
      const h = new SpatialHash({ cellSize: 128 })
      expect(h.cellSize).toBe(128)
    })

    it('should use default cellSize when no options', () => {
      const h = new SpatialHash()
      expect(h.cellSize).toBe(DEFAULT_SPATIAL_HASH_OPTIONS.cellSize)
    })

    it('should throw on zero cellSize', () => {
      expect(() => new SpatialHash({ cellSize: 0 })).toThrow('cellSize must be positive')
    })

    it('should throw on negative cellSize', () => {
      expect(() => new SpatialHash({ cellSize: -10 })).toThrow('cellSize must be positive')
    })

    it('should accept empty options object', () => {
      const h = new SpatialHash({})
      expect(h.cellSize).toBe(DEFAULT_SPATIAL_HASH_OPTIONS.cellSize)
    })

    it('should accept cellSize of 1', () => {
      const h = new SpatialHash({ cellSize: 1 })
      expect(h.cellSize).toBe(1)
    })

    it('should accept fractional cellSize', () => {
      const h = new SpatialHash({ cellSize: 0.5 })
      expect(h.cellSize).toBe(0.5)
    })
  })

  describe('insert', () => {
    it('should insert a single entry', () => {
      hash.insert('a', 10, 20)
      expect(hash.size).toBe(1)
      expect(hash.isEmpty).toBe(false)
    })

    it('should insert entry with data', () => {
      hash.insert('a', 10, 20, { name: 'test' })
      const entry = hash.get('a')
      expect(entry).toBeDefined()
      expect(entry!.data).toEqual({ name: 'test' })
    })

    it('should insert multiple entries', () => {
      hash.insert('a', 0, 0)
      hash.insert('b', 10, 10)
      hash.insert('c', 20, 20)
      expect(hash.size).toBe(3)
    })

    it('should replace existing entry on duplicate id', () => {
      hash.insert('a', 10, 20)
      hash.insert('a', 30, 40)
      expect(hash.size).toBe(1)
      const entry = hash.get('a')
      expect(entry!.x).toBe(30)
      expect(entry!.y).toBe(40)
    })

    it('should track insert statistics', () => {
      hash.insert('a', 0, 0)
      hash.insert('b', 10, 10)
      const stats = hash.getStatistics()
      expect(stats.inserts).toBe(2)
    })

    it('should count as insert on duplicate id replacement', () => {
      hash.insert('a', 10, 20)
      hash.insert('a', 30, 40)
      const stats = hash.getStatistics()
      expect(stats.inserts).toBe(2)
      expect(stats.removes).toBe(1)
    })

    it('should handle numeric ids', () => {
      hash.insert(1, 10, 20)
      hash.insert(2, 30, 40)
      expect(hash.size).toBe(2)
      expect(hash.has(1)).toBe(true)
      expect(hash.has(2)).toBe(true)
    })

    it('should handle negative coordinates', () => {
      hash.insert('a', -50, -100)
      expect(hash.get('a')).toEqual({ x: -50, y: -100, data: undefined })
    })

    it('should handle zero coordinates', () => {
      hash.insert('a', 0, 0)
      expect(hash.get('a')).toEqual({ x: 0, y: 0, data: undefined })
    })

    it('should handle large coordinates', () => {
      hash.insert('a', 1e9, 1e9)
      expect(hash.get('a')).toEqual({ x: 1e9, y: 1e9, data: undefined })
    })

    it('should handle undefined data', () => {
      hash.insert('a', 10, 20)
      const entry = hash.get('a')
      expect(entry!.data).toBeUndefined()
    })

    it('should handle null data', () => {
      hash.insert('a', 10, 20, null)
      const entry = hash.get('a')
      expect(entry!.data).toBeNull()
    })

    it('should place entries in correct cells', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      h.insert('b', 15, 15)
      expect(h.queryPoint(5, 5)).toHaveLength(1)
      expect(h.queryPoint(15, 15)).toHaveLength(1)
    })

    it('should place entries in same cell for nearby coords', () => {
      const h = new SpatialHash({ cellSize: 100 })
      h.insert('a', 10, 10)
      h.insert('b', 20, 20)
      expect(h.queryPoint(10, 10)).toHaveLength(2)
    })
  })

  describe('remove', () => {
    it('should remove an existing entry', () => {
      hash.insert('a', 10, 20)
      const result = hash.remove('a')
      expect(result).toBe(true)
      expect(hash.size).toBe(0)
    })

    it('should return false for non-existing entry', () => {
      const result = hash.remove('nonexistent')
      expect(result).toBe(false)
    })

    it('should return false on empty hash', () => {
      const result = hash.remove('anything')
      expect(result).toBe(false)
    })

    it('should track remove statistics', () => {
      hash.insert('a', 10, 20)
      hash.remove('a')
      const stats = hash.getStatistics()
      expect(stats.removes).toBe(1)
    })

    it('should not track remove stats on failed removal', () => {
      hash.remove('nonexistent')
      const stats = hash.getStatistics()
      expect(stats.removes).toBe(0)
    })

    it('should handle remove of re-inserted entry', () => {
      hash.insert('a', 10, 20)
      hash.remove('a')
      hash.insert('a', 30, 40)
      expect(hash.remove('a')).toBe(true)
      expect(hash.size).toBe(0)
    })

    it('should remove entry with numeric id', () => {
      hash.insert(42, 10, 20)
      expect(hash.remove(42)).toBe(true)
      expect(hash.has(42)).toBe(false)
    })

    it('should allow re-insertion after removal', () => {
      hash.insert('a', 10, 20)
      hash.remove('a')
      hash.insert('a', 30, 40)
      expect(hash.get('a')).toEqual({ x: 30, y: 40, data: undefined })
    })

    it('should clean up empty cells', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      h.remove('a')
      expect(h.getStatistics().cellCount).toBe(0)
    })

    it('should maintain correct size after multiple removes', () => {
      hash.insert('a', 0, 0)
      hash.insert('b', 10, 10)
      hash.insert('c', 20, 20)
      hash.remove('a')
      hash.remove('b')
      expect(hash.size).toBe(1)
    })
  })

  describe('update', () => {
    it('should update position of existing entry', () => {
      hash.insert('a', 10, 20)
      const result = hash.update('a', 30, 40)
      expect(result).toBe(true)
      expect(hash.get('a')).toEqual({ x: 30, y: 40, data: undefined })
    })

    it('should return false for non-existing entry', () => {
      const result = hash.update('nonexistent', 10, 20)
      expect(result).toBe(false)
    })

    it('should track update statistics', () => {
      hash.insert('a', 10, 20)
      hash.update('a', 30, 40)
      const stats = hash.getStatistics()
      expect(stats.updates).toBe(1)
    })

    it('should move entry to different cell', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      expect(h.queryPoint(5, 5)).toHaveLength(1)
      h.update('a', 95, 95)
      expect(h.queryPoint(5, 5)).toHaveLength(0)
      expect(h.queryPoint(95, 95)).toHaveLength(1)
    })

    it('should keep entry in same cell for small move', () => {
      const h = new SpatialHash({ cellSize: 100 })
      h.insert('a', 10, 10)
      h.update('a', 15, 15)
      expect(h.queryPoint(10, 10)).toHaveLength(1)
    })

    it('should preserve data on update', () => {
      hash.insert('a', 10, 20, { value: 42 })
      hash.update('a', 30, 40)
      const entry = hash.get('a')
      expect(entry!.data).toEqual({ value: 42 })
    })

    it('should handle multiple updates', () => {
      hash.insert('a', 0, 0)
      hash.update('a', 10, 10)
      hash.update('a', 20, 20)
      hash.update('a', 30, 30)
      expect(hash.get('a')).toEqual({ x: 30, y: 30, data: undefined })
      expect(hash.getStatistics().updates).toBe(3)
    })

    it('should clean up old cell when moving', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      h.update('a', 95, 95)
      h.remove('a')
      expect(h.getStatistics().cellCount).toBe(0)
    })

    it('should return false when updating nonexistent', () => {
      expect(hash.update('ghost', 10, 20)).toBe(false)
      expect(hash.getStatistics().updates).toBe(0)
    })
  })

  describe('get', () => {
    it('should return entry for existing id', () => {
      hash.insert('a', 10, 20, { label: 'test' })
      const result = hash.get('a')
      expect(result).toEqual({ x: 10, y: 20, data: { label: 'test' } })
    })

    it('should return undefined for non-existing id', () => {
      expect(hash.get('nonexistent')).toBeUndefined()
    })

    it('should return undefined after removal', () => {
      hash.insert('a', 10, 20)
      hash.remove('a')
      expect(hash.get('a')).toBeUndefined()
    })

    it('should return updated position', () => {
      hash.insert('a', 10, 20)
      hash.update('a', 30, 40)
      const result = hash.get('a')
      expect(result!.x).toBe(30)
      expect(result!.y).toBe(40)
    })

    it('should return latest data after re-insert', () => {
      hash.insert('a', 10, 20, 'old')
      hash.insert('a', 30, 40, 'new')
      const result = hash.get('a')
      expect(result!.data).toBe('new')
    })
  })

  describe('query', () => {
    it('should return empty array for empty hash', () => {
      const result = hash.query(0, 0, 100, 100)
      expect(result).toEqual([])
    })

    it('should return entries within rectangular area', () => {
      hash.insert('a', 10, 10)
      hash.insert('b', 50, 50)
      hash.insert('c', 200, 200)
      const result = hash.query(0, 0, 100, 100)
      const ids = result.map((e) => e.id)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
      expect(ids).not.toContain('c')
    })

    it('should track query statistics', () => {
      hash.query(0, 0, 100, 100)
      hash.query(0, 0, 50, 50)
      expect(hash.getStatistics().queries).toBe(2)
    })

    it('should return entry at exact boundary', () => {
      hash.insert('a', 50, 50)
      const result = hash.query(50, 50, 10, 10)
      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe('a')
    })

    it('should not return entry outside boundary', () => {
      hash.insert('a', 200, 200)
      const result = hash.query(0, 0, 100, 100)
      expect(result).toHaveLength(0)
    })

    it('should handle negative coordinate queries', () => {
      hash.insert('a', -50, -50)
      const result = hash.query(-100, -100, 200, 200)
      expect(result).toHaveLength(1)
    })

    it('should return multiple entries in same cell', () => {
      hash.insert('a', 10, 10)
      hash.insert('b', 15, 15)
      const result = hash.query(0, 0, 100, 100)
      expect(result).toHaveLength(2)
    })

    it('should return entries across multiple cells', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      h.insert('b', 15, 15)
      h.insert('c', 25, 25)
      const result = h.query(0, 0, 30, 30)
      expect(result).toHaveLength(3)
    })

    it('should handle zero-width query', () => {
      hash.insert('a', 10, 10)
      const result = hash.query(0, 0, 0, 0)
      expect(result).toHaveLength(0)
    })

    it('should handle zero-height query', () => {
      hash.insert('a', 10, 10)
      const result = hash.query(10, 10, 10, 0)
      expect(result).toHaveLength(0)
    })

    it('should include entry at query origin', () => {
      hash.insert('a', 5, 5)
      const result = hash.query(5, 5, 10, 10)
      expect(result).toHaveLength(1)
    })

    it('should exclude entry at x + width boundary', () => {
      hash.insert('a', 100, 5)
      const result = hash.query(0, 0, 100, 100)
      expect(result).toHaveLength(0)
    })

    it('should exclude entry at y + height boundary', () => {
      hash.insert('a', 5, 100)
      const result = hash.query(0, 0, 100, 100)
      expect(result).toHaveLength(0)
    })
  })

  describe('queryPoint', () => {
    it('should return entries in the cell containing the point', () => {
      hash.insert('a', 10, 10)
      hash.insert('b', 15, 15)
      const result = hash.queryPoint(10, 10)
      expect(result.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty array for empty cell', () => {
      const result = hash.queryPoint(999, 999)
      expect(result).toEqual([])
    })

    it('should track query statistics', () => {
      hash.queryPoint(10, 10)
      expect(hash.getStatistics().queries).toBe(1)
    })

    it('should return all entries in same cell', () => {
      const h = new SpatialHash({ cellSize: 100 })
      h.insert('a', 10, 10)
      h.insert('b', 20, 20)
      h.insert('c', 30, 30)
      const result = h.queryPoint(5, 5)
      expect(result).toHaveLength(3)
    })

    it('should not return entries from different cells', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      h.insert('b', 95, 95)
      const result = h.queryPoint(5, 5)
      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe('a')
    })

    it('should return copies not references', () => {
      hash.insert('a', 10, 10)
      const r1 = hash.queryPoint(10, 10)
      const r2 = hash.queryPoint(10, 10)
      expect(r1).not.toBe(r2)
    })
  })

  describe('queryRadius', () => {
    it('should return entries within radius', () => {
      hash.insert('a', 50, 50)
      hash.insert('b', 55, 55)
      hash.insert('c', 200, 200)
      const result = hash.queryRadius(50, 50, 20)
      const ids = result.map((e) => e.id)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
      expect(ids).not.toContain('c')
    })

    it('should return empty array for no matches', () => {
      hash.insert('a', 1000, 1000)
      const result = hash.queryRadius(0, 0, 10)
      expect(result).toEqual([])
    })

    it('should track query statistics', () => {
      hash.queryRadius(0, 0, 10)
      expect(hash.getStatistics().queries).toBe(1)
    })

    it('should return entry at exact radius distance', () => {
      hash.insert('a', 60, 0)
      const result = hash.queryRadius(0, 0, 60)
      const ids = result.map((e) => e.id)
      expect(ids).toContain('a')
    })

    it('should not return entry beyond radius', () => {
      hash.insert('a', 61, 0)
      const result = hash.queryRadius(0, 0, 60)
      expect(result).toHaveLength(0)
    })

    it('should handle zero radius', () => {
      hash.insert('a', 5, 5)
      const result = hash.queryRadius(5, 5, 0)
      expect(result).toHaveLength(1)
    })

    it('should handle negative coordinates with radius', () => {
      hash.insert('a', -5, -5)
      const result = hash.queryRadius(0, 0, 10)
      expect(result).toHaveLength(1)
    })

    it('should find entries across multiple cells', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 0, 0)
      h.insert('b', 8, 8)
      h.insert('c', 15, 15)
      const result = h.queryRadius(0, 0, 25)
      expect(result).toHaveLength(3)
    })
  })

  describe('has', () => {
    it('should return true for existing entry', () => {
      hash.insert('a', 10, 20)
      expect(hash.has('a')).toBe(true)
    })

    it('should return false for non-existing entry', () => {
      expect(hash.has('nonexistent')).toBe(false)
    })

    it('should return false after removal', () => {
      hash.insert('a', 10, 20)
      hash.remove('a')
      expect(hash.has('a')).toBe(false)
    })

    it('should work with numeric ids', () => {
      hash.insert(42, 10, 20)
      expect(hash.has(42)).toBe(true)
      expect(hash.has(43)).toBe(false)
    })

    it('should return true after update', () => {
      hash.insert('a', 10, 20)
      hash.update('a', 30, 40)
      expect(hash.has('a')).toBe(true)
    })
  })

  describe('size', () => {
    it('should be 0 on empty hash', () => {
      expect(hash.size).toBe(0)
    })

    it('should increment with each insert', () => {
      hash.insert('a', 0, 0)
      expect(hash.size).toBe(1)
      hash.insert('b', 10, 10)
      expect(hash.size).toBe(2)
    })

    it('should not change on duplicate insert', () => {
      hash.insert('a', 10, 20)
      hash.insert('a', 30, 40)
      expect(hash.size).toBe(1)
    })

    it('should decrement with each remove', () => {
      hash.insert('a', 0, 0)
      hash.insert('b', 10, 10)
      hash.remove('a')
      expect(hash.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true on new hash', () => {
      expect(hash.isEmpty).toBe(true)
    })

    it('should be false after insert', () => {
      hash.insert('a', 0, 0)
      expect(hash.isEmpty).toBe(false)
    })

    it('should be true after removing all entries', () => {
      hash.insert('a', 0, 0)
      hash.remove('a')
      expect(hash.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      hash.insert('a', 0, 0)
      hash.clear()
      expect(hash.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should reset size to 0', () => {
      hash.insert('a', 0, 0)
      hash.insert('b', 10, 10)
      hash.clear()
      expect(hash.size).toBe(0)
    })

    it('should set isEmpty to true', () => {
      hash.insert('a', 0, 0)
      hash.clear()
      expect(hash.isEmpty).toBe(true)
    })

    it('should reset statistics', () => {
      hash.insert('a', 0, 0)
      hash.remove('a')
      hash.query(0, 0, 10, 10)
      hash.clear()
      const stats = hash.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.updates).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.cellCount).toBe(0)
      expect(stats.maxEntriesPerCell).toBe(0)
    })

    it('should allow adding after clear', () => {
      hash.insert('before', 0, 0)
      hash.clear()
      hash.insert('after', 10, 10)
      expect(hash.size).toBe(1)
      expect(hash.has('after')).toBe(true)
    })

    it('should not preserve old entries after clear', () => {
      hash.insert('old', 0, 0)
      hash.clear()
      expect(hash.has('old')).toBe(false)
    })
  })

  describe('cellSize', () => {
    it('should return configured cell size', () => {
      const h = new SpatialHash({ cellSize: 128 })
      expect(h.cellSize).toBe(128)
    })

    it('should return default cell size', () => {
      expect(hash.cellSize).toBe(DEFAULT_SPATIAL_HASH_OPTIONS.cellSize)
    })
  })

  describe('bounds', () => {
    it('should return zero bounds on empty hash', () => {
      expect(hash.bounds).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 })
    })

    it('should return correct bounds for single entry', () => {
      hash.insert('a', 10, 20)
      expect(hash.bounds).toEqual({ minX: 10, minY: 20, maxX: 10, maxY: 20 })
    })

    it('should return correct bounds for multiple entries', () => {
      hash.insert('a', 10, 20)
      hash.insert('b', 50, 5)
      hash.insert('c', 5, 60)
      const b = hash.bounds
      expect(b.minX).toBe(5)
      expect(b.minY).toBe(5)
      expect(b.maxX).toBe(50)
      expect(b.maxY).toBe(60)
    })

    it('should update bounds after remove', () => {
      hash.insert('a', 0, 0)
      hash.insert('b', 100, 100)
      hash.remove('b')
      expect(hash.bounds).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 })
    })

    it('should handle negative coordinates', () => {
      hash.insert('a', -50, -100)
      hash.insert('b', 50, 100)
      const b = hash.bounds
      expect(b.minX).toBe(-50)
      expect(b.minY).toBe(-100)
      expect(b.maxX).toBe(50)
      expect(b.maxY).toBe(100)
    })

    it('should update bounds after update', () => {
      hash.insert('a', 10, 10)
      hash.insert('b', 100, 100)
      hash.update('b', 200, 200)
      const b = hash.bounds
      expect(b.maxX).toBe(200)
      expect(b.maxY).toBe(200)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty hash', () => {
      expect(hash.toArray()).toEqual([])
    })

    it('should return all entries', () => {
      hash.insert('a', 10, 20)
      hash.insert('b', 30, 40)
      const arr = hash.toArray()
      expect(arr).toHaveLength(2)
      const ids = arr.map((e) => e.id)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
    })

    it('should include data in entries', () => {
      hash.insert('a', 10, 20, { label: 'test' })
      const arr = hash.toArray()
      expect(arr[0]!.data).toEqual({ label: 'test' })
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      hash.insert('a', 10, 20)
      hash.insert('b', 30, 40)
      const collected: SpatialHashEntry[] = []
      hash.forEach((entry) => collected.push(entry))
      expect(collected).toHaveLength(2)
    })

    it('should not iterate on empty hash', () => {
      let count = 0
      hash.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('should pass correct entries', () => {
      hash.insert('a', 10, 20, 'data-a')
      hash.forEach((entry) => {
        expect(entry.id).toBe('a')
        expect(entry.x).toBe(10)
        expect(entry.y).toBe(20)
        expect(entry.data).toBe('data-a')
      })
    })
  })

  describe('getStatistics', () => {
    it('should return all-zero stats on new hash', () => {
      const stats = hash.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.updates).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.cellCount).toBe(0)
      expect(stats.maxEntriesPerCell).toBe(0)
    })

    it('should track inserts', () => {
      hash.insert('a', 0, 0)
      hash.insert('b', 10, 10)
      expect(hash.getStatistics().inserts).toBe(2)
    })

    it('should track removes', () => {
      hash.insert('a', 0, 0)
      hash.remove('a')
      expect(hash.getStatistics().removes).toBe(1)
    })

    it('should track updates', () => {
      hash.insert('a', 0, 0)
      hash.update('a', 10, 10)
      expect(hash.getStatistics().updates).toBe(1)
    })

    it('should track queries from query', () => {
      hash.query(0, 0, 10, 10)
      expect(hash.getStatistics().queries).toBe(1)
    })

    it('should track queries from queryPoint', () => {
      hash.queryPoint(0, 0)
      expect(hash.getStatistics().queries).toBe(1)
    })

    it('should track queries from queryRadius', () => {
      hash.queryRadius(0, 0, 10)
      expect(hash.getStatistics().queries).toBe(1)
    })

    it('should track cellCount', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      h.insert('b', 15, 15)
      expect(h.getStatistics().cellCount).toBe(2)
    })

    it('should track maxEntriesPerCell', () => {
      const h = new SpatialHash({ cellSize: 100 })
      h.insert('a', 10, 10)
      h.insert('b', 20, 20)
      h.insert('c', 30, 30)
      expect(h.getStatistics().maxEntriesPerCell).toBe(3)
    })

    it('should return a copy of statistics', () => {
      hash.insert('a', 0, 0)
      const stats1 = hash.getStatistics()
      hash.insert('b', 10, 10)
      const stats2 = hash.getStatistics()
      expect(stats1.inserts).toBe(1)
      expect(stats2.inserts).toBe(2)
    })

    it('should update cellCount after remove', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      expect(h.getStatistics().cellCount).toBe(1)
      h.remove('a')
      expect(h.getStatistics().cellCount).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should produce correct structure', () => {
      hash.insert('a', 10, 20)
      const json = hash.toJSON()
      expect(json).toHaveProperty('cellSize')
      expect(json).toHaveProperty('entries')
      expect(json).toHaveProperty('statistics')
    })

    it('should include all entries', () => {
      hash.insert('a', 10, 20)
      hash.insert('b', 30, 40)
      const json = hash.toJSON()
      expect(json.entries).toHaveLength(2)
    })

    it('should include entry data', () => {
      hash.insert('a', 10, 20, { label: 'test' })
      const json = hash.toJSON()
      expect(json.entries[0]!.data).toEqual({ label: 'test' })
    })

    it('should include cellSize', () => {
      const h = new SpatialHash({ cellSize: 128 })
      const json = h.toJSON()
      expect(json.cellSize).toBe(128)
    })

    it('should include statistics', () => {
      hash.insert('a', 10, 20)
      const json = hash.toJSON()
      expect(json.statistics.inserts).toBe(1)
    })

    it('should produce empty entries for empty hash', () => {
      const json = hash.toJSON()
      expect(json.entries).toEqual([])
    })
  })

  describe('fromJSON', () => {
    it('should restore a serialized hash', () => {
      const original = new SpatialHash({ cellSize: 64 })
      original.insert('a', 10, 20)
      original.insert('b', 30, 40)
      const json = original.toJSON()
      const restored = SpatialHash.fromJSON(json)
      expect(restored.size).toBe(2)
      expect(restored.has('a')).toBe(true)
      expect(restored.has('b')).toBe(true)
    })

    it('should preserve cell size', () => {
      const original = new SpatialHash({ cellSize: 128 })
      original.insert('a', 10, 20)
      const json = original.toJSON()
      const restored = SpatialHash.fromJSON(json)
      expect(restored.cellSize).toBe(128)
    })

    it('should preserve entry data', () => {
      const original = new SpatialHash()
      original.insert('a', 10, 20, { value: 42 })
      const json = original.toJSON()
      const restored = SpatialHash.fromJSON(json)
      expect(restored.get('a')!.data).toEqual({ value: 42 })
    })

    it('should allow operations after restoration', () => {
      const original = new SpatialHash()
      original.insert('a', 10, 20)
      const restored = SpatialHash.fromJSON(original.toJSON())
      restored.insert('b', 30, 40)
      expect(restored.size).toBe(2)
      restored.remove('a')
      expect(restored.has('b')).toBe(true)
    })

    it('should support query after restoration', () => {
      const original = new SpatialHash()
      original.insert('a', 50, 50)
      const restored = SpatialHash.fromJSON(original.toJSON())
      const result = restored.query(0, 0, 100, 100)
      expect(result).toHaveLength(1)
    })

    it('should round-trip correctly', () => {
      const original = new SpatialHash({ cellSize: 32 })
      original.insert('a', 10, 20, 'data-a')
      original.insert('b', 30, 40, 'data-b')
      const json = original.toJSON()
      const restored = SpatialHash.fromJSON(json)
      const json2 = restored.toJSON()
      expect(json.cellSize).toBe(json2.cellSize)
      expect(json.entries).toHaveLength(json2.entries.length)
    })

    it('should handle empty hash JSON', () => {
      const original = new SpatialHash()
      const json = original.toJSON()
      const restored = SpatialHash.fromJSON(json)
      expect(restored.size).toBe(0)
      expect(restored.isEmpty).toBe(true)
    })

    it('should handle numeric ids in JSON', () => {
      const original = new SpatialHash()
      original.insert(1, 10, 20)
      original.insert(2, 30, 40)
      const json = original.toJSON()
      const restored = SpatialHash.fromJSON(json)
      expect(restored.has(1)).toBe(true)
      expect(restored.has(2)).toBe(true)
    })
  })

  describe('DEFAULT_SPATIAL_HASH_OPTIONS', () => {
    it('should have cellSize of 64', () => {
      expect(DEFAULT_SPATIAL_HASH_OPTIONS.cellSize).toBe(64)
    })
  })

  describe('exports', () => {
    it('should export SpatialHash class', () => {
      expect(SpatialHash).toBeDefined()
      expect(typeof SpatialHash).toBe('function')
    })

    it('should export DEFAULT_SPATIAL_HASH_OPTIONS', () => {
      expect(DEFAULT_SPATIAL_HASH_OPTIONS).toBeDefined()
    })

    it('should allow type-only imports for SpatialHashOptions', () => {
      const opts: SpatialHashOptions = { cellSize: 128 }
      const h = new SpatialHash(opts)
      expect(h.cellSize).toBe(128)
    })

    it('should allow type import for SpatialHashEntry', () => {
      const entry: SpatialHashEntry = { id: 'a', x: 10, y: 20 }
      expect(entry.id).toBe('a')
    })

    it('should allow type import for SpatialHashStatistics', () => {
      const h = new SpatialHash()
      const stats: SpatialHashStatistics = h.getStatistics()
      expect(stats.inserts).toBe(0)
    })

    it('should allow type import for SpatialHashBounds', () => {
      const h = new SpatialHash()
      const b: SpatialHashBounds = h.bounds
      expect(b.minX).toBe(0)
    })

    it('should allow type import for SpatialHashJSON', () => {
      const h = new SpatialHash()
      const json: SpatialHashJSON = h.toJSON()
      expect(json.cellSize).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle many entries in same cell', () => {
      const h = new SpatialHash({ cellSize: 100 })
      for (let i = 0; i < 100; i++) {
        h.insert(`e-${i}`, i, i)
      }
      expect(h.size).toBe(100)
      const result = h.queryPoint(50, 50)
      expect(result.length).toBe(100)
    })

    it('should handle entries across many cells', () => {
      const h = new SpatialHash({ cellSize: 10 })
      for (let i = 0; i < 50; i++) {
        h.insert(`e-${i}`, i * 100, i * 100)
      }
      expect(h.size).toBe(50)
      expect(h.getStatistics().cellCount).toBe(50)
    })

    it('should handle insert-remove-insert cycle', () => {
      hash.insert('a', 10, 20)
      hash.remove('a')
      hash.insert('a', 30, 40)
      expect(hash.get('a')).toEqual({ x: 30, y: 40, data: undefined })
      expect(hash.size).toBe(1)
    })

    it('should handle rapid insert and clear cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        hash.insert(`e-${cycle}`, cycle * 10, cycle * 10)
        hash.clear()
      }
      expect(hash.size).toBe(0)
    })

    it('should handle very small cell size', () => {
      const h = new SpatialHash({ cellSize: 0.001 })
      h.insert('a', 0.0005, 0.0005)
      expect(h.size).toBe(1)
      expect(h.queryPoint(0.0005, 0.0005)).toHaveLength(1)
    })

    it('should handle very large cell size', () => {
      const h = new SpatialHash({ cellSize: 1e9 })
      h.insert('a', 100, 100)
      h.insert('b', 1e8, 1e8)
      expect(h.queryPoint(50, 50)).toHaveLength(2)
    })

    it('should handle mixed string and numeric ids', () => {
      hash.insert('str-id', 10, 20)
      hash.insert(42, 30, 40)
      expect(hash.has('str-id')).toBe(true)
      expect(hash.has(42)).toBe(true)
      expect(hash.size).toBe(2)
    })

    it('should handle query that spans many cells', () => {
      const h = new SpatialHash({ cellSize: 10 })
      h.insert('a', 5, 5)
      h.insert('b', 500, 500)
      const result = h.query(0, 0, 600, 600)
      expect(result).toHaveLength(2)
    })

    it('should handle update to same position', () => {
      hash.insert('a', 10, 20)
      hash.update('a', 10, 20)
      expect(hash.get('a')).toEqual({ x: 10, y: 20, data: undefined })
      expect(hash.getStatistics().updates).toBe(1)
    })

    it('should handle radius query with exact distance match', () => {
      hash.insert('a', 3, 4)
      const result = hash.queryRadius(0, 0, 5)
      expect(result).toHaveLength(1)
      const beyond = hash.queryRadius(0, 0, 4.9)
      expect(beyond).toHaveLength(0)
    })
  })
})
