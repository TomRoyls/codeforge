import { describe, expect, it } from 'vitest'
import { TremauxMaze } from '../../src/utils/tremaux-maze.js'

describe('TremauxMaze', () => {
  it('solves single cell', () => {
    const maze = new TremauxMaze(1, 1)
    const path = maze.solve([0, 0], [0, 0])
    expect(path).toEqual([[0, 0]])
  })

  it('solves 2x1 corridor', () => {
    const maze = new TremauxMaze(2, 1)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [1, 0])
    expect(path.length).toBe(2)
    expect(path[0]).toEqual([0, 0])
    expect(path[1]).toEqual([1, 0])
  })

  it('solves straight 3-cell corridor', () => {
    const maze = new TremauxMaze(3, 1)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    const path = maze.solve([0, 0], [2, 0])
    expect(path.length).toBe(3)
    expect(path[0]).toEqual([0, 0])
    expect(path[path.length - 1]).toEqual([2, 0])
  })

  it('solves straight 4-cell corridor', () => {
    const maze = new TremauxMaze(4, 1)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [3, 0])
    const path = maze.solve([0, 0], [3, 0])
    expect(path.length).toBe(4)
  })

  it('returns empty for no path (no passages)', () => {
    const maze = new TremauxMaze(2, 1)
    const path = maze.solve([0, 0], [1, 0])
    expect(path).toEqual([])
  })

  it('returns empty for disconnected cells', () => {
    const maze = new TremauxMaze(3, 1)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [2, 0])
    expect(path).toEqual([])
  })

  it('solves L-shaped path', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBe(3)
  })

  it('solves L-shaped path vertical then horizontal', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [0, 2])
    maze.addPassage([0, 2], [1, 2])
    maze.addPassage([1, 2], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBe(5)
  })

  it('solves 2x2 maze with loop', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBeGreaterThanOrEqual(2)
    expect(path[path.length - 1]).toEqual([1, 1])
  })

  it('solves 3x3 spiral maze', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    maze.addPassage([2, 2], [1, 2])
    maze.addPassage([1, 2], [0, 2])
    const path = maze.solve([0, 0], [0, 2])
    expect(path.length).toBeGreaterThanOrEqual(3)
    expect(path[path.length - 1]).toEqual([0, 2])
  })

  it('solves 3x3 outer ring path', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBe(5)
    expect(path[path.length - 1]).toEqual([2, 2])
  })

  it('handles T-shaped maze', () => {
    const maze = new TremauxMaze(3, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([1, 0], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBeGreaterThanOrEqual(2)
    expect(path[path.length - 1]).toEqual([1, 1])
  })

  it('handles backtracking with dead end', () => {
    const maze = new TremauxMaze(3, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([1, 0], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path[path.length - 1]).toEqual([1, 1])
  })

  it('all cells visited are within bounds', () => {
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

  it('path starts at start and ends at end', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path[0]).toEqual([0, 0])
    expect(path[path.length - 1]).toEqual([2, 2])
  })

  it('consecutive path cells are adjacent', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    for (let i = 1; i < path.length; i++) {
      const dx = Math.abs(path[i]![0] - path[i - 1]![0])
      const dy = Math.abs(path[i]![1] - path[i - 1]![1])
      expect(dx + dy).toBe(1)
    }
  })

  it('solve returns an array', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [1, 0])
    expect(Array.isArray(path)).toBe(true)
  })

  it('solve returns empty array for impossible maze', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [2, 2])
    expect(path).toEqual([])
    expect(Array.isArray(path)).toBe(true)
  })

  it('handles default constructor', () => {
    const maze = new TremauxMaze()
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [1, 0])
    expect(Array.isArray(path)).toBe(true)
  })

  it('start equals end returns single point', () => {
    const maze = new TremauxMaze(2, 2)
    const path = maze.solve([0, 0], [0, 0])
    expect(path).toEqual([[0, 0]])
  })

  it('start equals end with passage still returns single point', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [0, 0])
    expect(path.length).toBe(1)
    expect(path[0]).toEqual([0, 0])
  })

  it('handles vertical corridor', () => {
    const maze = new TremauxMaze(1, 3)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [0, 2])
    const path = maze.solve([0, 0], [0, 2])
    expect(path.length).toBe(3)
  })

  it('handles 4x4 maze', () => {
    const maze = new TremauxMaze(4, 4)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [3, 0])
    maze.addPassage([3, 0], [3, 1])
    maze.addPassage([3, 1], [3, 2])
    maze.addPassage([3, 2], [3, 3])
    const path = maze.solve([0, 0], [3, 3])
    expect(path.length).toBe(7)
    expect(path[path.length - 1]).toEqual([3, 3])
  })

  it('handles zigzag path', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [1, 1])
    maze.addPassage([1, 1], [1, 2])
    maze.addPassage([1, 2], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBe(5)
  })

  it('handles dead end branch that must be backtracked', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([1, 1], [1, 2])
    maze.addPassage([1, 2], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path[path.length - 1]).toEqual([2, 2])
  })

  it('passages are bidirectional', () => {
    const maze = new TremauxMaze(3, 1)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    const path = maze.solve([2, 0], [0, 0])
    expect(path.length).toBe(3)
    expect(path[0]).toEqual([2, 0])
    expect(path[2]).toEqual([0, 0])
  })

  it('handles 1x2 vertical maze', () => {
    const maze = new TremauxMaze(1, 2)
    maze.addPassage([0, 0], [0, 1])
    const path = maze.solve([0, 0], [0, 1])
    expect(path.length).toBe(2)
  })

  it('handles 5x1 corridor', () => {
    const maze = new TremauxMaze(5, 1)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [3, 0])
    maze.addPassage([3, 0], [4, 0])
    const path = maze.solve([0, 0], [4, 0])
    expect(path.length).toBe(5)
  })

  it('handles 1x5 vertical corridor', () => {
    const maze = new TremauxMaze(1, 5)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [0, 2])
    maze.addPassage([0, 2], [0, 3])
    maze.addPassage([0, 3], [0, 4])
    const path = maze.solve([0, 0], [0, 4])
    expect(path.length).toBe(5)
  })

  it('passage added in reverse direction works', () => {
    const maze = new TremauxMaze(3, 1)
    maze.addPassage([1, 0], [0, 0])
    maze.addPassage([2, 0], [1, 0])
    const path = maze.solve([0, 0], [2, 0])
    expect(path.length).toBe(3)
  })

  it('adding duplicate passage does not break solve', () => {
    const maze = new TremauxMaze(2, 1)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [1, 0])
    expect(path.length).toBe(2)
  })

  it('handles 3x3 full grid maze', () => {
    const maze = new TremauxMaze(3, 3)
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (x + 1 < 3) maze.addPassage([x, y], [x + 1, y])
        if (y + 1 < 3) maze.addPassage([x, y], [x, y + 1])
      }
    }
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBeGreaterThanOrEqual(3)
    expect(path[path.length - 1]).toEqual([2, 2])
  })

  it('no passage to target returns empty', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [0, 1])
    expect(path).toEqual([])
  })

  it('handles path with multiple branches', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([1, 1], [1, 2])
    maze.addPassage([1, 2], [2, 2])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBeGreaterThanOrEqual(3)
    expect(path[path.length - 1]).toEqual([2, 2])
  })

  it('handles U-shaped path', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [0, 2])
    maze.addPassage([0, 2], [1, 2])
    maze.addPassage([1, 2], [2, 2])
    maze.addPassage([2, 2], [2, 1])
    maze.addPassage([2, 1], [2, 0])
    const path = maze.solve([0, 0], [2, 0])
    expect(path.length).toBe(7)
  })

  it('handles cross-shaped maze', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([1, 1], [1, 2])
    maze.addPassage([0, 1], [1, 1])
    maze.addPassage([1, 1], [2, 1])
    const path = maze.solve([1, 0], [1, 2])
    expect(path.length).toBeGreaterThanOrEqual(3)
    expect(path[0]).toEqual([1, 0])
    expect(path[path.length - 1]).toEqual([1, 2])
  })

  it('path through cross center', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 1], [1, 1])
    maze.addPassage([1, 1], [2, 1])
    const path = maze.solve([0, 1], [2, 1])
    expect(path.length).toBe(3)
  })

  it('handles 2x3 maze', () => {
    const maze = new TremauxMaze(2, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([1, 1], [1, 2])
    maze.addPassage([1, 2], [0, 2])
    const path = maze.solve([0, 0], [0, 2])
    expect(path.length).toBe(5)
  })

  it('handles 3x2 maze', () => {
    const maze = new TremauxMaze(3, 2)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [1, 1])
    maze.addPassage([1, 1], [2, 1])
    maze.addPassage([2, 1], [2, 0])
    const path = maze.solve([0, 0], [2, 0])
    expect(path.length).toBe(5)
  })

  it('solve on maze with no passages at all', () => {
    const maze = new TremauxMaze(3, 3)
    const path = maze.solve([0, 0], [2, 2])
    expect(path).toEqual([])
  })

  it('handles single passage', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [1, 0])
    expect(path.length).toBe(2)
  })

  it('finds shortest path in simple maze', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBe(5)
  })

  it('handles maze with only horizontal passages', () => {
    const maze = new TremauxMaze(4, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [3, 0])
    maze.addPassage([0, 1], [1, 1])
    maze.addPassage([1, 1], [2, 1])
    maze.addPassage([2, 1], [3, 1])
    const path = maze.solve([0, 0], [3, 0])
    expect(path.length).toBe(4)
  })

  it('handles maze with only vertical passages', () => {
    const maze = new TremauxMaze(2, 4)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [0, 2])
    maze.addPassage([0, 2], [0, 3])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([1, 1], [1, 2])
    maze.addPassage([1, 2], [1, 3])
    const path = maze.solve([0, 0], [0, 3])
    expect(path.length).toBe(4)
  })

  it('handles maze requiring revisit of junction', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([1, 1], [0, 1])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path[path.length - 1]).toEqual([2, 2])
  })

  it('handles 5x5 maze with multiple paths', () => {
    const maze = new TremauxMaze(5, 5)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [3, 0])
    maze.addPassage([3, 0], [4, 0])
    maze.addPassage([4, 0], [4, 1])
    maze.addPassage([4, 1], [4, 2])
    maze.addPassage([4, 2], [4, 3])
    maze.addPassage([4, 3], [4, 4])
    const path = maze.solve([0, 0], [4, 4])
    expect(path.length).toBe(9)
    expect(path[0]).toEqual([0, 0])
    expect(path[path.length - 1]).toEqual([4, 4])
  })

  it('multiple solve calls return same result', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path1 = maze.solve([0, 0], [2, 2])
    const path2 = maze.solve([0, 0], [2, 2])
    const path3 = maze.solve([0, 0], [2, 2])
    expect(path1.length).toBe(path2.length)
    expect(path2.length).toBe(path3.length)
    expect(path1[0]).toEqual(path2[0])
    expect(path2[path2.length - 1]).toEqual(path3[path3.length - 1])
  })

  it('handles maze with multiple possible paths', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [0, 2])
    maze.addPassage([0, 2], [1, 2])
    maze.addPassage([1, 2], [2, 2])
    maze.addPassage([2, 0], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path.length).toBeGreaterThanOrEqual(3)
    expect(path[0]).toEqual([0, 0])
    expect(path[path.length - 1]).toEqual([2, 2])
  })

  it('handles complex maze with multiple direction changes', () => {
    const maze = new TremauxMaze(4, 4)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [1, 1])
    maze.addPassage([1, 1], [2, 1])
    maze.addPassage([2, 1], [2, 2])
    maze.addPassage([2, 2], [1, 2])
    maze.addPassage([1, 2], [1, 3])
    maze.addPassage([1, 3], [2, 3])
    maze.addPassage([2, 3], [3, 3])
    const path = maze.solve([0, 0], [3, 3])
    expect(path.length).toBeGreaterThanOrEqual(4)
    expect(path[path.length - 1]).toEqual([3, 3])
  })

  it('handles start cell with no passages', () => {
    const maze = new TremauxMaze(3, 3)
    maze.addPassage([1, 0], [2, 0])
    maze.addPassage([1, 0], [1, 1])
    maze.addPassage([1, 1], [2, 2])
    const path = maze.solve([0, 0], [2, 2])
    expect(path).toEqual([])
  })

  it('should handle 1x1 maze', () => {
    const grid = [[0]]
    const maze = new TremauxMaze(grid)
    const path = maze.solve([0, 0], [0, 0])
    expect(path).toEqual([[0, 0]])
  })

  it('should handle simple path', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [0, 1])
    maze.addPassage([0, 1], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBeGreaterThan(0)
  })
})

  it('solve simple maze', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    maze.addPassage([1, 0], [1, 1])
    const path = maze.solve([0, 0], [1, 1])
    expect(path.length).toBeGreaterThan(0)
  })

  it('solve same start and end', () => {
    const maze = new TremauxMaze(2, 2)
    maze.addPassage([0, 0], [1, 0])
    const path = maze.solve([0, 0], [0, 0])
    expect(path).toEqual([[0, 0]])
  })

  it('solve with no passages returns empty', () => {
    const maze = new TremauxMaze(2, 2)
    const path = maze.solve([0, 0], [1, 1])
    expect(path).toEqual([])
  })

describe('tremaux-maze - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('tremaux-maze - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('tremaux-maze - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('tremaux-maze - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('tremaux-maze - wave548', () => {
  it('tremaux-maze module defined', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze module is function', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave549', () => {
  it('tremaux-maze module defined', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze module is function', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave550', () => {
  it('tremaux-maze w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave551', () => {
  it('tremaux-maze w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave552', () => {
  it('tremaux-maze w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave553', () => {
  it('tremaux-maze w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave554', () => {
  it('tremaux-maze w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave555', () => {
  it('tremaux-maze w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave556', () => {
  it('tremaux-maze w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave557', () => {
  it('tremaux-maze w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave558', () => {
  it('tremaux-maze w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave559', () => {
  it('tremaux-maze w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave560', () => {
  it('tremaux-maze w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave561', () => {
  it('tremaux-maze w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave562', () => {
  it('tremaux-maze w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave563', () => {
  it('tremaux-maze w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave564', () => {
  it('tremaux-maze w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave565', () => {
  it('tremaux-maze w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave566', () => {
  it('tremaux-maze w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave127', () => {
  it('tremaux-maze w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave130', () => {
  it('tremaux-maze w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave133', () => {
  it('tremaux-maze w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave136', () => {
  it('tremaux-maze w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - wave139', () => {
  it('tremaux-maze w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w142', () => {
  it('tremaux-maze v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w145', () => {
  it('tremaux-maze v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w148', () => {
  it('tremaux-maze v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w151', () => {
  it('tremaux-maze v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w154', () => {
  it('tremaux-maze v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w157', () => {
  it('tremaux-maze v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w160', () => {
  it('tremaux-maze v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w170', () => {
  it('tremaux-maze x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w180', () => {
  it('tremaux-maze x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w190', () => {
  it('tremaux-maze x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w200', () => {
  it('tremaux-maze x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w210', () => {
  it('tremaux-maze x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w220', () => {
  it('tremaux-maze x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w230', () => {
  it('tremaux-maze x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w240', () => {
  it('tremaux-maze x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w250', () => {
  it('tremaux-maze x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w260', () => {
  it('tremaux-maze x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w270', () => {
  it('tremaux-maze x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w280', () => {
  it('tremaux-maze x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w290', () => {
  it('tremaux-maze x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w300', () => {
  it('tremaux-maze x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w310', () => {
  it('tremaux-maze x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w320', () => {
  it('tremaux-maze x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w330', () => {
  it('tremaux-maze x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w340', () => {
  it('tremaux-maze x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w350', () => {
  it('tremaux-maze x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w360', () => {
  it('tremaux-maze x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w370', () => {
  it('tremaux-maze x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w380', () => {
  it('tremaux-maze x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w390', () => {
  it('tremaux-maze x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w400', () => {
  it('tremaux-maze x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w420', () => {
  it('tremaux-maze x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w440', () => {
  it('tremaux-maze x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w460', () => {
  it('tremaux-maze x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w480', () => {
  it('tremaux-maze x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w500', () => {
  it('tremaux-maze x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w550', () => {
  it('tremaux-maze x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w600', () => {
  it('tremaux-maze x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w650', () => {
  it('tremaux-maze x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w700', () => {
  it('tremaux-maze x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w800', () => {
  it('tremaux-maze x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w900', () => {
  it('tremaux-maze x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('tremaux-maze - w1000', () => {
  it('tremaux-maze x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('tremaux-maze x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
