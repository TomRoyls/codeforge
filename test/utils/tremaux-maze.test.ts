import { describe, expect, it } from 'vitest'
import { TremauxMaze } from '../../src/utils/tremaux-maze.js'

describe('TremauxMaze', () => {
  it('solves straight corridor', () => {
    const maze = new TremauxMaze(3, 1)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    const path = maze.solve([0, 0], [2, 0])
    expect(path.length).toBe(3)
    expect(path[0]).toEqual([0, 0])
    expect(path[path.length - 1]).toEqual([2, 0])
  })

  it('solves single cell', () => {
    const maze = new TremauxMaze(1, 1)
    const path = maze.solve([0, 0], [0, 0])
    expect(path).toEqual([[0, 0]])
  })

  it('solves 2x2 maze', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([0, 0], [0, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBeGreaterThanOrEqual(2)
    expect(path[path.length - 1]).toEqual([1, 1])
  })

  it('returns empty for no path', () => {
    const maze = new TremauxMaze(2, 1)
    const path = maze.solve([0, 0], [1, 0])
    expect(path).toEqual([])
  })

  it('handles dead end', () => {
    const maze = new TremauxMaze(3, 1)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    const path = maze.solve([0, 0], [2, 0])
    expect(path.length).toBe(3)
  })

  it('handles L-shaped path', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBe(3)
  })

  it('handles 3x3 maze', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBe(5)
    expect(path[path.length - 1]).toEqual([2, 2])
  })

  it('handles maze with loop', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBeGreaterThanOrEqual(2)
  })

  it('handles backtracking', () => {
    const maze = new TremauxMaze(3, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([1, 0], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path[path.length - 1]).toEqual([1, 1])
  })

  it('all cells visited are valid', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    for (const [x, y] of path) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(3)
      expect(y).toBeLessThan(3)
    }
  })

  it('handles spiral-like maze', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    maze.addPassage([2, 2], [1, 2])
    maze.addPassage([1, 2], [0, 2])
    const path = maze.solve([0, 0], [0, 2])
    expect(path.length).toBeGreaterThanOrEqual(3)
  })

  it('handles T-shaped maze', () => {
    const maze = new TremauxMaze(3, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([1, 0], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBeGreaterThanOrEqual(2)
  })

  it('handles 1x1 maze', () => {
    const maze = new TremauxMaze(1, 1)
    const path = maze.solve([0, 0], [0, 0])
    expect(path.length).toBeGreaterThanOrEqual(1)
  })

  it('handles 2x1 corridor', () => {
    const maze = new TremauxMaze(2, 1)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [1, 0])
    expect(path.length).toBe(2)
  })

  it('handles L-shaped maze', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [0, 2])
    maze.addPassage([0, 2], [1, 2])
    maze.addPassage([1, 2], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBe(5)
  })

  it('handles straight corridor', () => {
    const maze = new TremauxMaze(4, 1)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [3, 0])
    const path = maze.solve([0, 0], [3, 0])
    expect(path.length).toBe(4)
  })

  it('start equals end returns single point', () => {
    const maze = new TremauxMaze()
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [0, 0])
    expect(path.length).toBeGreaterThanOrEqual(1)
  })

  it('adjacent cells have a path', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [1, 0])
    expect(path.length).toBeGreaterThanOrEqual(2)
  })

  it('solve returns an array', () => {
    const maze = new TremauxMaze()
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [1, 0])
    expect(Array.isArray(path)).toBe(true)
  })

  it('start equals end returns single point', () => {
    const maze = new TremauxMaze()
    const path = maze.solve([0, 0], [0, 0])
    expect(path.length).toBeGreaterThanOrEqual(1)
  })

  it('solve returns array', () => {
    const maze = new TremauxMaze()
    const path = maze.solve([0, 0], [0, 0])
    expect(Array.isArray(path)).toBe(true)
  })

  it('solve adjacent cells returns path', () => {
    const maze = new TremauxMaze()
    const path = maze.solve([0, 0], [1, 0])
    expect(Array.isArray(path)).toBe(true)
  })

  it('solve same start and end returns path', () => {
    const maze = new TremauxMaze()
    const path = maze.solve([0, 0], [0, 0])
    expect(Array.isArray(path)).toBe(true)
  })
})
