import { describe, it, expect } from 'vitest'
import { DancingLinks } from '../../../src/utils/dancing-links.js'

describe('DancingLinks', () => {
  describe('exact cover', () => {
    it('solves simple exact cover', () => {
      const dlx = new DancingLinks(3)
      dlx.addRow(0, [0, 1])
      dlx.addRow(1, [1, 2])
      dlx.addRow(2, [0, 2])
      const solutions = dlx.solve()
      expect(solutions.length).toBe(0)
    })

    it('solves complete exact cover', () => {
      const dlx = new DancingLinks(3)
      dlx.addRow(0, [0])
      dlx.addRow(1, [1])
      dlx.addRow(2, [2])
      dlx.addRow(3, [0, 1, 2])
      const solutions = dlx.solve()
      expect(solutions.length).toBeGreaterThan(0)
    })

    it('finds single solution', () => {
      const dlx = new DancingLinks(3)
      dlx.addRow(0, [0, 1])
      dlx.addRow(1, [2])
      const solutions = dlx.solve()
      expect(solutions.length).toBe(1)
      expect(solutions[0]).toEqual([0, 1])
    })

    it('handles no solution', () => {
      const dlx = new DancingLinks(3)
      dlx.addRow(0, [0])
      const solutions = dlx.solve()
      expect(solutions.length).toBe(0)
    })

    it('handles empty matrix', () => {
      const dlx = new DancingLinks(0)
      const solutions = dlx.solve()
      expect(solutions.length).toBe(1)
    })
  })

  describe('N-Queens style', () => {
    it('solves 4x4 exact cover', () => {
      const dlx = new DancingLinks(4)
      dlx.addRow(0, [0, 1])
      dlx.addRow(1, [2, 3])
      const solutions = dlx.solve()
      expect(solutions.length).toBe(1)
    })

    it('handles multiple solutions', () => {
      const dlx = new DancingLinks(4, 100)
      dlx.addRow(0, [0])
      dlx.addRow(1, [1])
      dlx.addRow(2, [2])
      dlx.addRow(3, [3])
      dlx.addRow(4, [0, 2])
      dlx.addRow(5, [1, 3])
      const solutions = dlx.solve()
      expect(solutions.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('maxSolutions', () => {
    it('respects max solutions limit', () => {
      const dlx = new DancingLinks(2, 1)
      dlx.addRow(0, [0])
      dlx.addRow(1, [1])
      dlx.addRow(2, [0])
      dlx.addRow(3, [1])
      const solutions = dlx.solve()
      expect(solutions.length).toBeLessThanOrEqual(1)
    })
  })

  describe('solutionCount', () => {
    it('tracks solution count', () => {
      const dlx = new DancingLinks(2)
      dlx.addRow(0, [0])
      dlx.addRow(1, [1])
      dlx.solve()
      expect(dlx.solutionCount).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles empty row', () => {
      const dlx = new DancingLinks(3)
      dlx.addRow(0, [])
      expect(dlx.solve().length).toBe(0)
    })

    it('handles out-of-range columns', () => {
      const dlx = new DancingLinks(3)
      dlx.addRow(0, [10])
      expect(dlx.solve().length).toBe(0)
    })
  })
})
