import { describe, expect, it } from 'vitest'

import { SpatialGrid } from '../src/core/spatial-grid/index.js'

// ─── Construction ──────────────────────────────────────
describe('SpatialGrid construction', () => {
  it('creates grid with specified options', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    expect(grid.size()).toBe(0)
    expect(grid.isEmpty()).toBe(true)
    expect(grid.cells()).toBe(100)
    expect(grid.cellSize()).toBe(10)
  })
})

// ─── Insert & Remove ───────────────────────────────────
describe('SpatialGrid insert and remove', () => {
  it('inserts items', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 5, 5)
    grid.insert('b', 50, 50)
    expect(grid.size()).toBe(2)
    expect(grid.has('a')).toBe(true)
    expect(grid.has('b')).toBe(true)
  })

  it('removes items', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 5, 5)
    expect(grid.remove('a')).toBe(true)
    expect(grid.has('a')).toBe(false)
    expect(grid.size()).toBe(0)
  })

  it('remove returns false for missing item', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    expect(grid.remove('nonexistent')).toBe(false)
  })

  it('re-inserts item at new position', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 5, 5)
    grid.insert('a', 50, 50)
    expect(grid.size()).toBe(1)
    const pos = grid.get('a')
    expect(pos).toEqual({ x: 50, y: 50 })
  })
})

// ─── Update ────────────────────────────────────────────
describe('SpatialGrid update', () => {
  it('updates item position', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 5, 5)
    expect(grid.update('a', 80, 80)).toBe(true)
    expect(grid.get('a')).toEqual({ x: 80, y: 80 })
  })

  it('returns false for missing item', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    expect(grid.update('x', 5, 5)).toBe(false)
  })
})

// ─── Query ─────────────────────────────────────────────
describe('SpatialGrid query', () => {
  let grid: SpatialGrid<string>

  beforeEach(() => {
    grid = new SpatialGrid<string>({ width: 100, height: 100, cellSize: 50 })
    grid.insert('a', 5, 5)
    grid.insert('b', 55, 5)
    grid.insert('c', 5, 55)
    grid.insert('d', 55, 55)
  })

  it('query returns items in rectangular area', () => {
    const result = grid.query(0, 0, 50, 50)
    expect(result).toContain('a')
    expect(result).not.toContain('b')
  })

  it('query returns empty for area with no items', () => {
    expect(grid.query(90, 90, 10, 10)).toEqual([])
  })

  it('queryRadius returns items within radius', () => {
    const result = grid.queryRadius(5, 5, 10)
    expect(result).toContain('a')
    expect(result).not.toContain('d')
  })

  it('queryCell returns items in specific cell', () => {
    const cell = grid.getCell(5, 5)
    const items = grid.queryCell(cell[0], cell[1])
    expect(items).toContain('a')
  })
})

// ─── Get & Has ─────────────────────────────────────────
describe('SpatialGrid get and has', () => {
  it('get returns position', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 15, 25)
    expect(grid.get('a')).toEqual({ x: 15, y: 25 })
  })

  it('get returns undefined for missing', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    expect(grid.get('x')).toBeUndefined()
  })
})

// ─── Clear ─────────────────────────────────────────────
describe('SpatialGrid clear', () => {
  it('clears all items', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 5, 5)
    grid.insert('b', 50, 50)
    grid.clear()
    expect(grid.size()).toBe(0)
    expect(grid.isEmpty()).toBe(true)
  })
})

// ─── ToArray ───────────────────────────────────────────
describe('SpatialGrid toArray', () => {
  it('returns all items with positions', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 5, 5)
    grid.insert('b', 50, 50)
    const arr = grid.toArray()
    expect(arr).toHaveLength(2)
    expect(arr.map((e) => e.item).sort()).toEqual(['a', 'b'])
  })
})

// ─── ForEach ───────────────────────────────────────────
describe('SpatialGrid forEach', () => {
  it('iterates all items', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 5, 5)
    grid.insert('b', 10, 10)
    const result: string[] = []
    grid.forEach((item) => result.push(item))
    expect(result.sort()).toEqual(['a', 'b'])
  })
})

// ─── Clone ─────────────────────────────────────────────
describe('SpatialGrid clone', () => {
  it('clones the grid', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    grid.insert('a', 5, 5)
    const cloned = grid.clone()
    expect(cloned.size()).toBe(1)
    grid.clear()
    expect(cloned.size()).toBe(1)
  })
})

// ─── GetCell ───────────────────────────────────────────
describe('SpatialGrid getCell', () => {
  it('returns correct cell coordinates', () => {
    const grid = new SpatialGrid<string>({
      width: 100,
      height: 100,
      cellSize: 10,
    })
    const [cx, cy] = grid.getCell(25, 35)
    expect(cx).toBe(2)
    expect(cy).toBe(3)
  })
})
