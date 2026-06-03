import { describe, it, expect, vi } from 'vitest'
import { HierarchicalTimer } from '../../src/utils/hierarchical-timer.js'
import type { TimerNode } from '../../src/utils/hierarchical-timer.js'

describe('HierarchicalTimer', () => {
  it('creates timer with default options', () => {
    const timer = new HierarchicalTimer()
    expect(timer.isEmpty).toBe(true)
    expect(timer.totalTime).toBe(0)
  })

  it('creates timer with enabled false', () => {
    const timer = new HierarchicalTimer({ enabled: false })
    timer.start('test')
    timer.end('test')
    expect(timer.isEmpty).toBe(true)
    expect(timer.totalTime).toBe(0)
  })

  it('measures simple timing with start and end', () => {
    const timer = new HierarchicalTimer()
    timer.start('operation')
    timer.end('operation')
    expect(timer.isEmpty).toBe(false)
    expect(timer.results.length).toBe(1)
    expect(timer.results[0]!.name).toBe('operation')
    expect(timer.results[0]!.duration).toBeGreaterThan(0)
  })

  it('measures nested timers', () => {
    const timer = new HierarchicalTimer()
    timer.start('parent')
    timer.start('child')
    timer.end('child')
    timer.end('parent')
    expect(timer.results.length).toBe(1)
    expect(timer.results[0]!.name).toBe('parent')
    expect(timer.results[0]!.children.length).toBe(1)
    expect(timer.results[0]!.children[0]!.name).toBe('child')
  })

  it('measures synchronous function with measure()', () => {
    const timer = new HierarchicalTimer()
    const fn = vi.fn(() => 42)
    const result = timer.measure('test', fn)
    expect(result).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(timer.results.length).toBe(1)
    expect(timer.results[0]!.name).toBe('test')
  })

  it('measures asynchronous function with measureAsync()', async () => {
    const timer = new HierarchicalTimer()
    const fn = vi.fn(async () => 42)
    const result = await timer.measureAsync('test', fn)
    expect(result).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(timer.results.length).toBe(1)
    expect(timer.results[0]!.name).toBe('test')
  })

  it('handles exceptions in measure()', () => {
    const timer = new HierarchicalTimer()
    const error = new Error('test error')
    const fn = vi.fn(() => {
      throw error
    })
    expect(() => timer.measure('test', fn)).toThrow(error)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(timer.results.length).toBe(1)
  })

  it('handles exceptions in measureAsync()', async () => {
    const timer = new HierarchicalTimer()
    const error = new Error('test error')
    const fn = vi.fn(async () => {
      throw error
    })
    await expect(timer.measureAsync('test', fn)).rejects.toThrow(error)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(timer.results.length).toBe(1)
  })

  it('returns flat durations as Map', () => {
    const timer = new HierarchicalTimer()
    timer.start('op1')
    timer.start('nested')
    timer.end('nested')
    timer.end('op1')
    timer.start('op2')
    timer.end('op2')
    const flat = timer.flatDurations
    expect(flat.get('op1')).toBeGreaterThan(0)
    expect(flat.get('nested')).toBeGreaterThan(0)
    expect(flat.get('op2')).toBeGreaterThan(0)
  })

  it('calculates total time', () => {
    const timer = new HierarchicalTimer()
    timer.start('op1')
    timer.end('op1')
    timer.start('op2')
    timer.end('op2')
    expect(timer.totalTime).toBeGreaterThan(0)
    const node1Duration = timer.results[0]!.duration
    const node2Duration = timer.results[1]!.duration
    expect(timer.totalTime).toBeCloseTo(node1Duration + node2Duration, 2)
  })

  it('clears all results', () => {
    const timer = new HierarchicalTimer()
    timer.start('test')
    timer.end('test')
    expect(timer.isEmpty).toBe(false)
    timer.clear()
    expect(timer.isEmpty).toBe(true)
    expect(timer.results.length).toBe(0)
  })

  it('formats results as string', () => {
    const timer = new HierarchicalTimer()
    timer.start('parent')
    timer.start('child')
    timer.end('child')
    timer.end('parent')
    const formatted = timer.format()
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('parent:')
    expect(formatted).toContain('child:')
    expect(formatted).toContain('ms')
  })

  it('returns undefined for mismatched end name', () => {
    const timer = new HierarchicalTimer()
    timer.start('actual')
    const result = timer.end('wrong')
    expect(result).toBeUndefined()
  })

  it('returns undefined when end called with empty stack', () => {
    const timer = new HierarchicalTimer()
    const result = timer.end('test')
    expect(result).toBeUndefined()
  })

  it('returns undefined when end called on disabled timer', () => {
    const timer = new HierarchicalTimer({ enabled: false })
    timer.start('test')
    const result = timer.end('test')
    expect(result).toBeUndefined()
  })

  it('returns results as readonly array', () => {
    const timer = new HierarchicalTimer()
    timer.start('test')
    timer.end('test')
    const results = timer.results
    expect(Array.isArray(results)).toBe(true)
    expect(results[0]!.name).toBe('test')
  })

  it('handles multiple nested levels', () => {
    const timer = new HierarchicalTimer()
    timer.start('level1')
    timer.start('level2')
    timer.start('level3')
    timer.end('level3')
    timer.end('level2')
    timer.end('level1')
    expect(timer.results.length).toBe(1)
    expect(timer.results[0]!.children.length).toBe(1)
    expect(timer.results[0]!.children[0]!.children.length).toBe(1)
  })

  it('aggregates same-named timers in flatDurations', () => {
    const timer = new HierarchicalTimer()
    timer.start('op')
    timer.end('op')
    timer.start('op')
    timer.end('op')
    const flat = timer.flatDurations
    const opDuration = flat.get('op')
    expect(opDuration).toBeGreaterThan(0)
    expect(opDuration!).toBeGreaterThan(timer.results[0]!.duration)
  })

  it('totalTime after single operation', () => {
    const timer = new HierarchicalTimer()
    timer.start('op')
    timer.end('op')
    expect(timer.totalTime).toBeGreaterThanOrEqual(0)
  })

  it('format returns string', () => {
    const timer = new HierarchicalTimer()
    timer.start('op')
    timer.end('op')
    expect(typeof timer.format()).toBe('string')
  })

  it('timer has start method', () => {
    const timer = new HierarchicalTimer()
    expect(typeof timer.start).toBe('function')
  })

  it('start and end work', () => {
    const timer = new HierarchicalTimer()
    timer.start('test')
    timer.end('test')
    expect(timer).toBeDefined()
  })
})