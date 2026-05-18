import { describe, it, expect } from 'vitest'
import { SpatialIndex2 } from '../../src/core/spatial-index-2/index.js'

// ─── Constructor and initial state ───

describe('SpatialIndex2 constructor', () => {
  it('should start empty', () => {
    const si = new SpatialIndex2()
    expect(si.size).toBe(0)
    expect(si.isEmpty()).toBe(true)
    expect(si.toArray()).toEqual([])
  })
})

// ─── insert ───

describe('SpatialIndex2 insert', () => {
  it('should insert a single point', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 20)
    expect(si.size).toBe(1)
    expect(si.isEmpty()).toBe(false)
  })

  it('should insert multiple points', () => {
    const si = new SpatialIndex2()
    si.insert('a', 0, 0)
    si.insert('b', 100, 100)
    si.insert('c', 200, 200)
    expect(si.size).toBe(3)
  })

  it('should update an existing point by id (re-insert)', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 20)
    si.insert('a', 30, 40)
    expect(si.size).toBe(1)
    expect(si.get('a')).toEqual({ x: 30, y: 40 })
  })

  it('should handle negative coordinates', () => {
    const si = new SpatialIndex2()
    si.insert('neg', -100, -200)
    expect(si.get('neg')).toEqual({ x: -100, y: -200 })
  })

  it('should handle zero coordinates', () => {
    const si = new SpatialIndex2()
    si.insert('origin', 0, 0)
    expect(si.get('origin')).toEqual({ x: 0, y: 0 })
  })
})

// ─── get ───

describe('SpatialIndex2 get', () => {
  it('should return the point for an existing id', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 20)
    expect(si.get('a')).toEqual({ x: 10, y: 20 })
  })

  it('should return undefined for a non-existent id', () => {
    const si = new SpatialIndex2()
    expect(si.get('missing')).toBeUndefined()
  })
})

// ─── has ───

describe('SpatialIndex2 has', () => {
  it('should return true for existing id', () => {
    const si = new SpatialIndex2()
    si.insert('a', 5, 5)
    expect(si.has('a')).toBe(true)
  })

  it('should return false for non-existent id', () => {
    const si = new SpatialIndex2()
    expect(si.has('missing')).toBe(false)
  })

  it('should return false after removal', () => {
    const si = new SpatialIndex2()
    si.insert('a', 5, 5)
    si.remove('a')
    expect(si.has('a')).toBe(false)
  })
})

// ─── remove ───

describe('SpatialIndex2 remove', () => {
  it('should remove an existing point and return true', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 20)
    expect(si.remove('a')).toBe(true)
    expect(si.size).toBe(0)
    expect(si.get('a')).toBeUndefined()
  })

  it('should return false for non-existent id', () => {
    const si = new SpatialIndex2()
    expect(si.remove('missing')).toBe(false)
  })

  it('should handle remove then re-insert', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 20)
    si.remove('a')
    si.insert('a', 30, 40)
    expect(si.size).toBe(1)
    expect(si.get('a')).toEqual({ x: 30, y: 40 })
  })

  it('should decrement size correctly', () => {
    const si = new SpatialIndex2()
    si.insert('a', 0, 0)
    si.insert('b', 50, 50)
    si.insert('c', 100, 100)
    si.remove('b')
    expect(si.size).toBe(2)
  })
})

// ─── queryRange ───

describe('SpatialIndex2 queryRange', () => {
  it('should return ids within rectangular range', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 10)
    si.insert('b', 50, 50)
    si.insert('c', 150, 150)
    const result = si.queryRange(0, 0, 100, 100)
    expect(result.sort()).toEqual(['a', 'b'])
  })

  it('should return empty array when no points in range', () => {
    const si = new SpatialIndex2()
    si.insert('a', 500, 500)
    expect(si.queryRange(0, 0, 100, 100)).toEqual([])
  })

  it('should return empty array on empty index', () => {
    const si = new SpatialIndex2()
    expect(si.queryRange(0, 0, 100, 100)).toEqual([])
  })

  it('should include points on the boundary', () => {
    const si = new SpatialIndex2()
    si.insert('edge', 100, 100)
    const result = si.queryRange(0, 0, 100, 100)
    expect(result).toContain('edge')
  })

  it('should handle single-point range matching exactly one point', () => {
    const si = new SpatialIndex2()
    si.insert('exact', 42, 42)
    const result = si.queryRange(42, 42, 42, 42)
    expect(result).toEqual(['exact'])
  })

  it('should handle points across multiple grid cells', () => {
    const si = new SpatialIndex2()
    si.insert('a', 0, 0)
    si.insert('b', 150, 150)
    si.insert('c', 300, 300)
    const result = si.queryRange(0, 0, 300, 300)
    expect(result.sort()).toEqual(['a', 'b', 'c'])
  })
})

// ─── queryNearest ───

describe('SpatialIndex2 queryNearest', () => {
  it('should return k nearest neighbors sorted by distance', () => {
    const si = new SpatialIndex2()
    si.insert('a', 0, 0)
    si.insert('b', 10, 0)
    si.insert('c', 100, 0)
    const result = si.queryNearest(5, 0, 2)
    expect(result.sort()).toEqual(['a', 'b'])
  })

  it('should return all points when k exceeds total count', () => {
    const si = new SpatialIndex2()
    si.insert('a', 0, 0)
    si.insert('b', 10, 10)
    const result = si.queryNearest(0, 0, 10)
    expect(result.sort()).toEqual(['a', 'b'])
  })

  it('should return empty array for k <= 0', () => {
    const si = new SpatialIndex2()
    si.insert('a', 0, 0)
    expect(si.queryNearest(0, 0, 0)).toEqual([])
    expect(si.queryNearest(0, 0, -1)).toEqual([])
  })

  it('should return empty array on empty index', () => {
    const si = new SpatialIndex2()
    expect(si.queryNearest(0, 0, 5)).toEqual([])
  })

  it('should handle tie-breaking by including all equidistant', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 0)
    si.insert('b', -10, 0)
    const result = si.queryNearest(0, 0, 2)
    expect(result.sort()).toEqual(['a', 'b'])
  })
})

// ─── queryRadius ───

describe('SpatialIndex2 queryRadius', () => {
  it('should return ids within radius', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 0)
    si.insert('b', 50, 0)
    si.insert('c', 200, 0)
    const result = si.queryRadius(0, 0, 60)
    expect(result.sort()).toEqual(['a', 'b'])
  })

  it('should return empty array when no points within radius', () => {
    const si = new SpatialIndex2()
    si.insert('a', 500, 500)
    expect(si.queryRadius(0, 0, 10)).toEqual([])
  })

  it('should include points exactly at radius boundary', () => {
    const si = new SpatialIndex2()
    si.insert('edge', 30, 40)
    const result = si.queryRadius(0, 0, 50)
    expect(result).toContain('edge')
  })

  it('should return empty array on empty index', () => {
    const si = new SpatialIndex2()
    expect(si.queryRadius(0, 0, 100)).toEqual([])
  })

  it('should handle radius 0 matching a single point at center', () => {
    const si = new SpatialIndex2()
    si.insert('origin', 0, 0)
    si.insert('far', 10, 10)
    expect(si.queryRadius(0, 0, 0)).toEqual(['origin'])
  })
})

// ─── clear ───

describe('SpatialIndex2 clear', () => {
  it('should remove all points', () => {
    const si = new SpatialIndex2()
    si.insert('a', 0, 0)
    si.insert('b', 50, 50)
    si.insert('c', 100, 100)
    si.clear()
    expect(si.size).toBe(0)
    expect(si.isEmpty()).toBe(true)
    expect(si.toArray()).toEqual([])
    expect(si.get('a')).toBeUndefined()
  })

  it('should allow insertions after clear', () => {
    const si = new SpatialIndex2()
    si.insert('a', 0, 0)
    si.clear()
    si.insert('b', 10, 10)
    expect(si.size).toBe(1)
    expect(si.get('b')).toEqual({ x: 10, y: 10 })
  })
})

// ─── toArray ───

describe('SpatialIndex2 toArray', () => {
  it('should return all points as array', () => {
    const si = new SpatialIndex2()
    si.insert('a', 10, 20)
    si.insert('b', 30, 40)
    const arr = si.toArray()
    expect(arr.length).toBe(2)
    const ids = arr.map(p => p.id).sort()
    expect(ids).toEqual(['a', 'b'])
  })

  it('should return empty array for empty index', () => {
    const si = new SpatialIndex2()
    expect(si.toArray()).toEqual([])
  })
})
