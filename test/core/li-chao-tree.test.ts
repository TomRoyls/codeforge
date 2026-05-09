import { describe, it, expect } from 'vitest'
import { LiChaoTree } from '../../src/core/li-chao-tree/li-chao-tree.js'
import type { Line, LiChaoTreeOptions } from '../../src/core/li-chao-tree/types.js'

describe('LiChaoTree', () => {
  describe('constructor', () => {
    it('should create a tree with min type by default', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should create a tree with explicit min type', () => {
      const tree = new LiChaoTree({ xMin: -100, xMax: 100, type: 'min' })
      expect(tree.isEmpty()).toBe(true)
    })

    it('should create a tree with max type', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10, type: 'max' })
      expect(tree.isEmpty()).toBe(true)
    })

    it('should store x range correctly', () => {
      const tree = new LiChaoTree({ xMin: -5, xMax: 15 })
      const range = tree.getXRange()
      expect(range.xMin).toBe(-5)
      expect(range.xMax).toBe(15)
    })

    it('should allow xMin === xMax', () => {
      const tree = new LiChaoTree({ xMin: 5, xMax: 5 })
      expect(tree.getXRange()).toEqual({ xMin: 5, xMax: 5 })
    })

    it('should throw when xMin > xMax', () => {
      expect(() => new LiChaoTree({ xMin: 10, xMax: 0 })).toThrow(RangeError)
    })

    it('should throw when xMin > xMax with different values', () => {
      expect(() => new LiChaoTree({ xMin: 1, xMax: -1 })).toThrow(RangeError)
    })

    it('should handle negative range', () => {
      const tree = new LiChaoTree({ xMin: -1000, xMax: -1 })
      expect(tree.getXRange()).toEqual({ xMin: -1000, xMax: -1 })
    })

    it('should handle fractional range', () => {
      const tree = new LiChaoTree({ xMin: 0.5, xMax: 1.5 })
      expect(tree.getXRange()).toEqual({ xMin: 0.5, xMax: 1.5 })
    })

    it('should handle large range', () => {
      const tree = new LiChaoTree({ xMin: -1e9, xMax: 1e9 })
      expect(tree.getXRange()).toEqual({ xMin: -1e9, xMax: 1e9 })
    })
  })

  describe('addLine', () => {
    it('should add a single line and increase size', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should add multiple lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      tree.addLine(2, 1)
      tree.addLine(3, 2)
      expect(tree.size()).toBe(3)
    })

    it('should add a line with zero slope', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(0, 5)
      expect(tree.size()).toBe(1)
      expect(tree.query(5)).toBe(5)
    })

    it('should add a line with negative slope', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(-2, 10)
      expect(tree.size()).toBe(1)
      expect(tree.query(0)).toBe(10)
      expect(tree.query(5)).toBe(0)
    })

    it('should add a line with negative intercept', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, -5)
      expect(tree.query(0)).toBe(-5)
    })

    it('should add many lines sequentially', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 100 })
      for (let i = 0; i < 50; i++) {
        tree.addLine(i, 0)
      }
      expect(tree.size()).toBe(50)
    })
  })

  describe('query - single line', () => {
    it('should return y = x for line y = 1*x + 0', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(5)).toBe(5)
      expect(tree.query(10)).toBe(10)
    })

    it('should return y = 2x + 3 for line y = 2x + 3', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(2, 3)
      expect(tree.query(0)).toBe(3)
      expect(tree.query(1)).toBe(5)
      expect(tree.query(5)).toBe(13)
    })

    it('should return constant for horizontal line', () => {
      const tree = new LiChaoTree({ xMin: -10, xMax: 10 })
      tree.addLine(0, 7)
      expect(tree.query(-10)).toBe(7)
      expect(tree.query(0)).toBe(7)
      expect(tree.query(10)).toBe(7)
    })

    it('should handle negative slope line', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(-1, 10)
      expect(tree.query(0)).toBe(10)
      expect(tree.query(5)).toBe(5)
      expect(tree.query(10)).toBe(0)
    })

    it('should query at exact xMin boundary', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(3, 1)
      expect(tree.query(0)).toBe(1)
    })

    it('should query at exact xMax boundary', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(3, 1)
      expect(tree.query(10)).toBe(31)
    })

    it('should handle fractional x values', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(2, 1)
      expect(tree.query(2.5)).toBe(6)
    })

    it('should throw when querying empty tree', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      expect(() => tree.query(5)).toThrow()
    })
  })

  describe('query - two lines crossing', () => {
    it('should return minimum at crossing point for min tree', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      tree.addLine(-1, 10)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(10)).toBe(0)
      expect(tree.query(5)).toBe(5)
    })

    it('should return maximum at crossing point for max tree', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10, type: 'max' })
      tree.addLine(1, 0)
      tree.addLine(-1, 10)
      expect(tree.query(0)).toBe(10)
      expect(tree.query(10)).toBe(10)
      expect(tree.query(5)).toBe(5)
    })

    it('should handle two lines with same slope', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(2, 5)
      tree.addLine(2, 3)
      expect(tree.query(5)).toBe(13)
    })

    it('should handle two lines with same slope in max tree', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10, type: 'max' })
      tree.addLine(2, 5)
      tree.addLine(2, 3)
      expect(tree.query(5)).toBe(15)
    })

    it('should correctly pick lower line in min tree', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(0, 10)
      tree.addLine(0, 5)
      expect(tree.query(0)).toBe(5)
      expect(tree.query(10)).toBe(5)
    })

    it('should correctly pick higher line in max tree', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10, type: 'max' })
      tree.addLine(0, 10)
      tree.addLine(0, 5)
      expect(tree.query(0)).toBe(10)
      expect(tree.query(10)).toBe(10)
    })

    it('should handle crossing lines with negative slopes', () => {
      const tree = new LiChaoTree({ xMin: -10, xMax: 10 })
      tree.addLine(-2, 0)
      tree.addLine(2, 0)
      expect(tree.query(-10)).toBeCloseTo(-20)
      expect(tree.query(10)).toBeCloseTo(-20)
      expect(tree.query(0)).toBe(0)
    })
  })

  describe('query - horizontal lines', () => {
    it('should pick the lowest horizontal line in min tree', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(0, 5)
      tree.addLine(0, 3)
      tree.addLine(0, 7)
      expect(tree.query(5)).toBe(3)
    })

    it('should pick the highest horizontal line in max tree', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10, type: 'max' })
      tree.addLine(0, 5)
      tree.addLine(0, 3)
      tree.addLine(0, 7)
      expect(tree.query(5)).toBe(7)
    })

    it('should handle horizontal line vs sloped line', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(0, 5)
      tree.addLine(1, 0)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(10)).toBe(5)
    })
  })

  describe('query - negative slopes', () => {
    it('should handle multiple negative slope lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(-1, 10)
      tree.addLine(-2, 20)
      expect(tree.query(0)).toBe(10)
      expect(tree.query(5)).toBeCloseTo(5)
    })

    it('should handle negative slopes with positive slopes', () => {
      const tree = new LiChaoTree({ xMin: -10, xMax: 10 })
      tree.addLine(1, 0)
      tree.addLine(-1, 0)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(-10)).toBeCloseTo(-10)
      expect(tree.query(10)).toBeCloseTo(-10)
    })
  })

  describe('query - boundaries', () => {
    it('should query at xMin exactly', () => {
      const tree = new LiChaoTree({ xMin: -5, xMax: 5 })
      tree.addLine(1, 2)
      expect(tree.query(-5)).toBe(-3)
    })

    it('should query at xMax exactly', () => {
      const tree = new LiChaoTree({ xMin: -5, xMax: 5 })
      tree.addLine(1, 2)
      expect(tree.query(5)).toBe(7)
    })

    it('should throw for x < xMin', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      expect(() => tree.query(-1)).toThrow(RangeError)
    })

    it('should throw for x > xMax', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      expect(() => tree.query(11)).toThrow(RangeError)
    })

    it('should throw for x just below range', () => {
      const tree = new LiChaoTree({ xMin: 5, xMax: 10 })
      tree.addLine(1, 0)
      expect(() => tree.query(4.999)).toThrow(RangeError)
    })

    it('should throw for x just above range', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 5 })
      tree.addLine(1, 0)
      expect(() => tree.query(5.001)).toThrow(RangeError)
    })
  })

  describe('clear', () => {
    it('should clear all lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      tree.addLine(2, 1)
      expect(tree.size()).toBe(2)
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should allow adding lines after clear', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      tree.clear()
      tree.addLine(2, 0)
      expect(tree.size()).toBe(1)
      expect(tree.query(5)).toBe(10)
    })

    it('should throw on query after clear', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      tree.clear()
      expect(() => tree.query(5)).toThrow()
    })

    it('should preserve x range after clear', () => {
      const tree = new LiChaoTree({ xMin: -5, xMax: 15 })
      tree.addLine(1, 0)
      tree.clear()
      expect(tree.getXRange()).toEqual({ xMin: -5, xMax: 15 })
    })

    it('should handle double clear', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      tree.clear()
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('getXRange', () => {
    it('should return correct range', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 100 })
      expect(tree.getXRange()).toEqual({ xMin: 0, xMax: 100 })
    })

    it('should return negative range', () => {
      const tree = new LiChaoTree({ xMin: -50, xMax: -10 })
      expect(tree.getXRange()).toEqual({ xMin: -50, xMax: -10 })
    })

    it('should return same value for point range', () => {
      const tree = new LiChaoTree({ xMin: 42, xMax: 42 })
      expect(tree.getXRange()).toEqual({ xMin: 42, xMax: 42 })
    })
  })

  describe('size and isEmpty', () => {
    it('should be empty initially', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should not be empty after adding a line', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      expect(tree.isEmpty()).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('should track size correctly', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      expect(tree.size()).toBe(0)
      tree.addLine(1, 0)
      expect(tree.size()).toBe(1)
      tree.addLine(2, 0)
      expect(tree.size()).toBe(2)
      tree.addLine(3, 0)
      expect(tree.size()).toBe(3)
    })
  })

  describe('min type (default)', () => {
    it('should return minimum y for multiple crossing lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 20 })
      tree.addLine(1, 0)
      tree.addLine(0, 5)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(10)).toBe(5)
      expect(tree.query(20)).toBe(5)
    })

    it('should return minimum for V-shaped envelope', () => {
      const tree = new LiChaoTree({ xMin: -10, xMax: 10 })
      tree.addLine(-1, 0)
      tree.addLine(1, 0)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(-10)).toBeCloseTo(-10)
      expect(tree.query(10)).toBeCloseTo(-10)
    })

    it('should return minimum for many parallel lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      for (let i = 0; i < 10; i++) {
        tree.addLine(1, i)
      }
      expect(tree.query(5)).toBe(5)
    })

    it('should return minimum with steep and shallow slopes', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(100, 0)
      tree.addLine(1, 0)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(1)).toBe(1)
    })
  })

  describe('max type', () => {
    it('should return maximum y for crossing lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10, type: 'max' })
      tree.addLine(1, 0)
      tree.addLine(-1, 10)
      expect(tree.query(0)).toBe(10)
      expect(tree.query(5)).toBe(5)
      expect(tree.query(10)).toBe(10)
    })

    it('should return maximum for inverted V envelope', () => {
      const tree = new LiChaoTree({ xMin: -10, xMax: 10, type: 'max' })
      tree.addLine(-1, 0)
      tree.addLine(1, 0)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(-10)).toBeCloseTo(10)
      expect(tree.query(10)).toBeCloseTo(10)
    })

    it('should return maximum for many parallel lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10, type: 'max' })
      for (let i = 0; i < 10; i++) {
        tree.addLine(1, i)
      }
      expect(tree.query(5)).toBe(14)
    })

    it('should return maximum with steep and shallow slopes', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10, type: 'max' })
      tree.addLine(100, 0)
      tree.addLine(1, 0)
      expect(tree.query(1)).toBe(100)
      expect(tree.query(10)).toBe(1000)
    })
  })

  describe('stress test', () => {
    it('should handle 1000 lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 1000 })
      for (let i = 0; i < 1000; i++) {
        tree.addLine(i * 0.01, i)
      }
      expect(tree.size()).toBe(1000)
      const y = tree.query(500)
      expect(typeof y).toBe('number')
      expect(isFinite(y)).toBe(true)
    })

    it('should handle 1000 lines with max type', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 1000, type: 'max' })
      for (let i = 0; i < 1000; i++) {
        tree.addLine(i * 0.01, i)
      }
      expect(tree.size()).toBe(1000)
      const y = tree.query(500)
      expect(typeof y).toBe('number')
      expect(isFinite(y)).toBe(true)
    })

    it('should handle 1000 queries on 100 lines', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 100 })
      for (let i = 0; i < 100; i++) {
        tree.addLine(i - 50, i * 10)
      }
      let minVal = Infinity
      for (let x = 0; x <= 100; x++) {
        const y = tree.query(x)
        if (y < minVal) minVal = y
      }
      expect(isFinite(minVal)).toBe(true)
    })

    it('should produce correct results with brute force comparison', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 100 })
      const lines: Line[] = []
      for (let i = 0; i < 50; i++) {
        const m = i * 2 - 50
        const b = i * 3
        tree.addLine(m, b)
        lines.push({ m, b })
      }
      for (let x = 0; x <= 100; x += 5) {
        const treeVal = tree.query(x)
        let bruteMin = Infinity
        for (const line of lines) {
          const y = line.m * x + line.b
          if (y < bruteMin) bruteMin = y
        }
        expect(treeVal).toBeCloseTo(bruteMin)
      }
    })

    it('should produce correct max results with brute force comparison', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 100, type: 'max' })
      const lines: Line[] = []
      for (let i = 0; i < 50; i++) {
        const m = i * 2 - 50
        const b = i * 3
        tree.addLine(m, b)
        lines.push({ m, b })
      }
      for (let x = 0; x <= 100; x += 5) {
        const treeVal = tree.query(x)
        let bruteMax = -Infinity
        for (const line of lines) {
          const y = line.m * x + line.b
          if (y > bruteMax) bruteMax = y
        }
        expect(treeVal).toBeCloseTo(bruteMax)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle point range (xMin === xMax)', () => {
      const tree = new LiChaoTree({ xMin: 5, xMax: 5 })
      tree.addLine(2, 3)
      expect(tree.query(5)).toBe(13)
    })

    it('should handle point range with multiple lines', () => {
      const tree = new LiChaoTree({ xMin: 5, xMax: 5 })
      tree.addLine(2, 3)
      tree.addLine(1, 2)
      tree.addLine(3, 1)
      expect(tree.query(5)).toBe(7)
    })

    it('should handle very small range', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 1 })
      tree.addLine(1, 0)
      tree.addLine(0, 1)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(1)).toBe(1)
    })

    it('should handle very large x values', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 1e9 })
      tree.addLine(1, 0)
      expect(tree.query(1e9)).toBe(1e9)
    })

    it('should handle very large slopes', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1e6, 0)
      expect(tree.query(5)).toBe(5e6)
    })

    it('should handle very large intercepts', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(0, 1e12)
      expect(tree.query(5)).toBe(1e12)
    })

    it('should handle zero slope and zero intercept', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(0, 0)
      expect(tree.query(5)).toBe(0)
    })

    it('should handle adding same line twice', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 2)
      tree.addLine(1, 2)
      expect(tree.size()).toBe(2)
      expect(tree.query(5)).toBe(7)
    })

    it('should handle fractional query points', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(2, 1)
      expect(tree.query(0.5)).toBe(2)
      expect(tree.query(3.7)).toBeCloseTo(8.4)
    })

    it('should handle negative x range', () => {
      const tree = new LiChaoTree({ xMin: -10, xMax: 0 })
      tree.addLine(1, 5)
      expect(tree.query(-10)).toBe(-5)
      expect(tree.query(0)).toBe(5)
    })
  })

  describe('types exports', () => {
    it('should export Line type correctly', () => {
      const line: Line = { m: 2, b: 3 }
      expect(line.m).toBe(2)
      expect(line.b).toBe(3)
    })

    it('should export LiChaoTreeOptions type correctly', () => {
      const opts: LiChaoTreeOptions = { xMin: 0, xMax: 10, type: 'min' }
      expect(opts.type).toBe('min')
    })

    it('should support max type in options', () => {
      const opts: LiChaoTreeOptions = { xMin: 0, xMax: 10, type: 'max' }
      expect(opts.type).toBe('max')
    })
  })

  describe('multiple insertions - correctness', () => {
    it('should handle 3 lines forming envelope', () => {
      const tree = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree.addLine(1, 0)
      tree.addLine(0, 5)
      tree.addLine(-1, 15)
      expect(tree.query(0)).toBe(0)
      expect(tree.query(5)).toBeCloseTo(5)
      expect(tree.query(10)).toBe(5)
    })

    it('should handle lines added in different order', () => {
      const tree1 = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree1.addLine(1, 0)
      tree1.addLine(-1, 10)
      tree1.addLine(0, 3)

      const tree2 = new LiChaoTree({ xMin: 0, xMax: 10 })
      tree2.addLine(0, 3)
      tree2.addLine(-1, 10)
      tree2.addLine(1, 0)

      for (let x = 0; x <= 10; x++) {
        expect(tree1.query(x)).toBeCloseTo(tree2.query(x))
      }
    })

    it('should handle 5 lines brute force verified', () => {
      const lines: Line[] = [
        { m: 3, b: -5 },
        { m: -2, b: 10 },
        { m: 0.5, b: 2 },
        { m: -1, b: 8 },
        { m: 4, b: -10 },
      ]
      const tree = new LiChaoTree({ xMin: -10, xMax: 10 })
      for (const line of lines) {
        tree.addLine(line.m, line.b)
      }
      for (let x = -10; x <= 10; x++) {
        let expected = Infinity
        for (const line of lines) {
          const y = line.m * x + line.b
          if (y < expected) expected = y
        }
        expect(tree.query(x)).toBeCloseTo(expected)
      }
    })

    it('should handle 5 lines brute force verified for max', () => {
      const lines: Line[] = [
        { m: 3, b: -5 },
        { m: -2, b: 10 },
        { m: 0.5, b: 2 },
        { m: -1, b: 8 },
        { m: 4, b: -10 },
      ]
      const tree = new LiChaoTree({ xMin: -10, xMax: 10, type: 'max' })
      for (const line of lines) {
        tree.addLine(line.m, line.b)
      }
      for (let x = -10; x <= 10; x++) {
        let expected = -Infinity
        for (const line of lines) {
          const y = line.m * x + line.b
          if (y > expected) expected = y
        }
        expect(tree.query(x)).toBeCloseTo(expected)
      }
    })

    it('should handle 20 lines brute force verified', () => {
      const lines: Line[] = []
      const tree = new LiChaoTree({ xMin: -50, xMax: 50 })
      for (let i = 0; i < 20; i++) {
        const m = (i - 10) * 3
        const b = i * 7 - 70
        lines.push({ m, b })
        tree.addLine(m, b)
      }
      for (let x = -50; x <= 50; x += 2) {
        let expected = Infinity
        for (const line of lines) {
          const y = line.m * x + line.b
          if (y < expected) expected = y
        }
        expect(tree.query(x)).toBeCloseTo(expected)
      }
    })

    it('should handle negative range with many lines', () => {
      const tree = new LiChaoTree({ xMin: -100, xMax: -1 })
      const lines: Line[] = []
      for (let i = 0; i < 20; i++) {
        const m = i - 10
        const b = i * 5
        lines.push({ m, b })
        tree.addLine(m, b)
      }
      for (let x = -100; x <= -1; x += 5) {
        let expected = Infinity
        for (const line of lines) {
          const y = line.m * x + line.b
          if (y < expected) expected = y
        }
        expect(tree.query(x)).toBeCloseTo(expected)
      }
    })

    it('should handle 10 lines with random-ish slopes brute force', () => {
      const lines: Line[] = [
        { m: 7, b: -20 },
        { m: -3, b: 15 },
        { m: 0, b: 0 },
        { m: 11, b: -50 },
        { m: -7, b: 30 },
        { m: 2, b: -5 },
        { m: -5, b: 25 },
        { m: 4, b: -15 },
        { m: -1, b: 10 },
        { m: 6, b: -25 },
      ]
      const tree = new LiChaoTree({ xMin: -20, xMax: 20 })
      for (const line of lines) {
        tree.addLine(line.m, line.b)
      }
      for (let x = -20; x <= 20; x++) {
        let expected = Infinity
        for (const line of lines) {
          const y = line.m * x + line.b
          if (y < expected) expected = y
        }
        expect(tree.query(x)).toBeCloseTo(expected)
      }
    })

    it('should handle 10 lines with random-ish slopes brute force max', () => {
      const lines: Line[] = [
        { m: 7, b: -20 },
        { m: -3, b: 15 },
        { m: 0, b: 0 },
        { m: 11, b: -50 },
        { m: -7, b: 30 },
        { m: 2, b: -5 },
        { m: -5, b: 25 },
        { m: 4, b: -15 },
        { m: -1, b: 10 },
        { m: 6, b: -25 },
      ]
      const tree = new LiChaoTree({ xMin: -20, xMax: 20, type: 'max' })
      for (const line of lines) {
        tree.addLine(line.m, line.b)
      }
      for (let x = -20; x <= 20; x++) {
        let expected = -Infinity
        for (const line of lines) {
          const y = line.m * x + line.b
          if (y > expected) expected = y
        }
        expect(tree.query(x)).toBeCloseTo(expected)
      }
    })

    it('should handle insertion order independence with 10 lines', () => {
      const lines: Line[] = []
      for (let i = 0; i < 10; i++) {
        lines.push({ m: i - 5, b: i * 3 })
      }

      const tree1 = new LiChaoTree({ xMin: 0, xMax: 20 })
      for (const line of lines) {
        tree1.addLine(line.m, line.b)
      }

      const tree2 = new LiChaoTree({ xMin: 0, xMax: 20 })
      for (let i = lines.length - 1; i >= 0; i--) {
        tree2.addLine(lines[i]!.m, lines[i]!.b)
      }

      for (let x = 0; x <= 20; x++) {
        expect(tree1.query(x)).toBeCloseTo(tree2.query(x))
      }
    })

    it('should handle point range for max type', () => {
      const tree = new LiChaoTree({ xMin: 3, xMax: 3, type: 'max' })
      tree.addLine(1, 0)
      tree.addLine(2, -3)
      tree.addLine(0, 5)
      expect(tree.query(3)).toBe(5)
    })

    it('should handle adding 500 lines and query at boundaries', () => {
      const tree = new LiChaoTree({ xMin: -1000, xMax: 1000 })
      for (let i = 0; i < 500; i++) {
        tree.addLine((i - 250) * 0.1, i - 250)
      }
      const yMin = tree.query(-1000)
      const yMax = tree.query(1000)
      const yMid = tree.query(0)
      expect(isFinite(yMin)).toBe(true)
      expect(isFinite(yMax)).toBe(true)
      expect(isFinite(yMid)).toBe(true)
      expect(tree.size()).toBe(500)
    })
  })
})
