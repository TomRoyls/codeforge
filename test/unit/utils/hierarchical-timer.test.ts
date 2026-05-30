import { describe, it, expect } from 'vitest'
import { HierarchicalTimer } from '../../../src/utils/hierarchical-timer.js'

describe('HierarchicalTimer', () => {
  describe('start/end', () => {
    it('records a timed operation', () => {
      const timer = new HierarchicalTimer()
      timer.start('op')
      const node = timer.end('op')
      expect(node).toBeDefined()
      expect(node!.name).toBe('op')
      expect(node!.duration).toBeGreaterThanOrEqual(0)
      expect(node!.children).toEqual([])
    })

    it('returns undefined for mismatched end', () => {
      const timer = new HierarchicalTimer()
      timer.start('a')
      expect(timer.end('b')).toBeUndefined()
    })

    it('returns undefined when stack empty', () => {
      const timer = new HierarchicalTimer()
      expect(timer.end('op')).toBeUndefined()
    })
  })

  describe('measure', () => {
    it('measures synchronous function', () => {
      const timer = new HierarchicalTimer()
      const result = timer.measure('op', () => 42)
      expect(result).toBe(42)
      expect(timer.results.length).toBe(1)
    })

    it('measures even when function throws', () => {
      const timer = new HierarchicalTimer()
      expect(() => timer.measure('op', () => { throw new Error('boom') })).toThrow('boom')
      expect(timer.results.length).toBe(1)
    })
  })

  describe('measureAsync', () => {
    it('measures async function', async () => {
      const timer = new HierarchicalTimer()
      const result = await timer.measureAsync('op', async () => 'hello')
      expect(result).toBe('hello')
      expect(timer.results.length).toBe(1)
    })

    it('measures even when async throws', async () => {
      const timer = new HierarchicalTimer()
      await expect(timer.measureAsync('op', async () => { throw new Error('boom') })).rejects.toThrow('boom')
      expect(timer.results.length).toBe(1)
    })
  })

  describe('nesting', () => {
    it('records nested operations', () => {
      const timer = new HierarchicalTimer()
      timer.start('parent')
      timer.start('child1')
      timer.end('child1')
      timer.start('child2')
      timer.end('child2')
      const parent = timer.end('parent')

      expect(parent).toBeDefined()
      expect(parent!.children.length).toBe(2)
      expect(parent!.children[0]!.name).toBe('child1')
      expect(parent!.children[1]!.name).toBe('child2')
    })

    it('measures total time correctly', () => {
      const timer = new HierarchicalTimer()
      timer.start('a')
      timer.end('a')
      timer.start('b')
      timer.end('b')
      expect(timer.results.length).toBe(2)
      expect(timer.totalTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('flatDurations', () => {
    it('aggregates durations by name', () => {
      const timer = new HierarchicalTimer()
      timer.measure('a', () => {})
      timer.measure('a', () => {})
      timer.measure('b', () => {})
      const flat = timer.flatDurations
      expect(flat.has('a')).toBe(true)
      expect(flat.has('b')).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('returns true when no results', () => {
      const timer = new HierarchicalTimer()
      expect(timer.isEmpty).toBe(true)
    })

    it('returns false when has results', () => {
      const timer = new HierarchicalTimer()
      timer.measure('op', () => {})
      expect(timer.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all results', () => {
      const timer = new HierarchicalTimer()
      timer.measure('op', () => {})
      timer.clear()
      expect(timer.isEmpty).toBe(true)
      expect(timer.results.length).toBe(0)
    })
  })

  describe('format', () => {
    it('formats results as string', () => {
      const timer = new HierarchicalTimer()
      timer.start('outer')
      timer.measure('inner', () => {})
      timer.end('outer')
      const formatted = timer.format()
      expect(formatted).toContain('outer')
      expect(formatted).toContain('inner')
    })
  })

  describe('disabled', () => {
    it('does nothing when disabled', () => {
      const timer = new HierarchicalTimer({ enabled: false })
      timer.start('op')
      timer.end('op')
      expect(timer.isEmpty).toBe(true)
    })
  })
})
