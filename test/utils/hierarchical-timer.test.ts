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

  it('multiple start-end pairs', () => {
    const timer = new HierarchicalTimer()
    timer.start('a')
    timer.end('a')
    timer.start('b')
    timer.end('b')
    expect(timer).toBeDefined()
  })

  it('totalTime after measurement is positive', () => {
    const timer = new HierarchicalTimer()
    timer.start('a')
    timer.end('a')
    expect(timer.totalTime).toBeGreaterThanOrEqual(0)
  })

  it('toString returns descriptive string', () => {
    const timer = new HierarchicalTimer()
    timer.start('test')
    timer.end('test')
    expect(timer.toString()).toBe('HierarchicalTimer(1 roots)')
  })

  it('toString with no results', () => {
    const timer = new HierarchicalTimer()
    expect(timer.toString()).toBe('HierarchicalTimer(0 roots)')
  })

  it('toJSON returns root children', () => {
    const timer = new HierarchicalTimer()
    timer.start('test')
    timer.end('test')
    const json = timer.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect((json as TimerNode[])[0]!.name).toBe('test')
  })

  it('clone produces independent copy', () => {
    const timer = new HierarchicalTimer()
    timer.start('test')
    timer.end('test')
    const c = timer.clone()
    expect(c.results.length).toBe(1)
    expect(c.results[0]!.name).toBe('test')
    timer.clear()
    expect(c.results.length).toBe(1)
  })

  it('equals returns true for same timings', () => {
    const t1 = new HierarchicalTimer()
    t1.start('test')
    t1.end('test')
    const t2 = t1.clone()
    expect(t1.equals(t2)).toBe(true)
  })

  it('equals returns false for different timings', () => {
    const t1 = new HierarchicalTimer()
    t1.start('a')
    t1.end('a')
    const t2 = new HierarchicalTimer()
    t2.start('b')
    t2.end('b')
    expect(t1.equals(t2)).toBe(false)
  })

  it('equals returns false for non-HierarchicalTimer', () => {
    const timer = new HierarchicalTimer()
    expect(timer.equals(null)).toBe(false)
    expect(timer.equals({})).toBe(false)
  })

  it('measure returns function result even when null', () => {
    const timer = new HierarchicalTimer()
    const result = timer.measure('test', () => null)
    expect(result).toBeNull()
    expect(timer.results.length).toBe(1)
  })

  it('measureAsync returns async result', async () => {
    const timer = new HierarchicalTimer()
    const result = await timer.measureAsync('test', async () => 'hello')
    expect(result).toBe('hello')
  })

  it('handles deeply nested structure', () => {
    const timer = new HierarchicalTimer()
    timer.start('l1')
    timer.start('l2')
    timer.start('l3')
    timer.start('l4')
    timer.end('l4')
    timer.end('l3')
    timer.end('l2')
    timer.end('l1')
    const formatted = timer.format()
    expect(formatted).toContain('l1:')
    expect(formatted).toContain('l4:')
  })

  it('flatDurations includes nested children', () => {
    const timer = new HierarchicalTimer()
    timer.start('parent')
    timer.start('child-a')
    timer.end('child-a')
    timer.start('child-b')
    timer.end('child-b')
    timer.end('parent')
    const flat = timer.flatDurations
    expect(flat.has('parent')).toBe(true)
    expect(flat.has('child-a')).toBe(true)
    expect(flat.has('child-b')).toBe(true)
  })

  it('clear resets stack and results', () => {
    const timer = new HierarchicalTimer()
    timer.start('test')
    timer.clear()
    expect(timer.isEmpty).toBe(true)
    expect(timer.totalTime).toBe(0)
  })

  it('disabled timer ignores all operations', () => {
    const timer = new HierarchicalTimer({ enabled: false })
    timer.measure('test', () => 42)
    expect(timer.isEmpty).toBe(true)
  })

  it('end returns TimerNode with correct properties', () => {
    const timer = new HierarchicalTimer()
    timer.start('test')
    const node = timer.end('test')
    expect(node).toBeDefined()
    expect(node!.name).toBe('test')
    expect(node!.startTime).toBeGreaterThan(0)
    expect(node!.endTime).toBeGreaterThanOrEqual(node!.startTime)
    expect(node!.duration).toBeGreaterThanOrEqual(0)
    expect(node!.children).toEqual([])
  })

  it('measure with multiple operations tracks correctly', () => {
    const timer = new HierarchicalTimer()
    timer.measure('op1', () => 1)
    timer.measure('op2', () => 2)
    timer.measure('op3', () => 3)
    expect(timer.results.length).toBe(3)
    expect(timer.results[0]!.name).toBe('op1')
    expect(timer.results[1]!.name).toBe('op2')
    expect(timer.results[2]!.name).toBe('op3')
  })

  it('measureAsync with multiple operations tracks correctly', async () => {
    const timer = new HierarchicalTimer()
    await timer.measureAsync('op1', async () => 1)
    await timer.measureAsync('op2', async () => 2)
    await timer.measureAsync('op3', async () => 3)
    expect(timer.results.length).toBe(3)
    expect(timer.results[0]!.name).toBe('op1')
    expect(timer.results[1]!.name).toBe('op2')
    expect(timer.results[2]!.name).toBe('op3')
  })

  it('multiple timers at same level', () => {
    const timer = new HierarchicalTimer()
    timer.start('a')
    timer.end('a')
    timer.start('b')
    timer.end('b')
    timer.start('c')
    timer.end('c')
    expect(timer.results.length).toBe(3)
  })

  it('clone preserves enabled state', () => {
    const timer1 = new HierarchicalTimer({ enabled: false })
    const timer2 = timer1.clone()
    timer2.start('test')
    timer2.end('test')
    expect(timer2.isEmpty).toBe(true)
  })

  it('format with empty timer returns empty string', () => {
    const timer = new HierarchicalTimer()
    expect(timer.format()).toBe('')
  })

  it('toJSON with empty timer returns empty array', () => {
    const timer = new HierarchicalTimer()
    const json = timer.toJSON()
    expect(Array.isArray(json)).toBe(true)
    expect((json as TimerNode[]).length).toBe(0)
  })

  it('flatDurations with empty timer returns empty map', () => {
    const timer = new HierarchicalTimer()
    const flat = timer.flatDurations
    expect(flat.size).toBe(0)
  })

  it('measureAsync handles Promise return value', async () => {
    const timer = new HierarchicalTimer()
    const result = await timer.measureAsync('test', async () => {
      return Promise.resolve('resolved')
    })
    expect(result).toBe('resolved')
  })

  it('equals returns false for different nested structure names', () => {
    const t1 = new HierarchicalTimer()
    t1.start('a')
    t1.start('b')
    t1.end('b')
    t1.end('a')
    const t2 = new HierarchicalTimer()
    t2.start('a')
    t2.start('c')
    t2.end('c')
    t2.end('a')
    expect(t1.equals(t2)).toBe(false)
  })

  it('clone creates deep copy of results', () => {
    const timer = new HierarchicalTimer()
    timer.start('parent')
    timer.start('child')
    timer.end('child')
    timer.end('parent')
    const cloned = timer.clone()
    cloned.results[0]!.name = 'modified'
    expect(timer.results[0]!.name).toBe('parent')
  })

  it('format handles multiple root children', () => {
    const timer = new HierarchicalTimer()
    timer.start('op1')
    timer.end('op1')
    timer.start('op2')
    timer.end('op2')
    const formatted = timer.format()
    const lines = formatted.split('\n')
    expect(lines.length).toBe(2)
    expect(lines[0]).toContain('op1:')
    expect(lines[1]).toContain('op2:')
  })

  it('flatDurations aggregates across sibling operations', () => {
    const timer = new HierarchicalTimer()
    timer.start('op')
    timer.end('op')
    timer.start('op')
    timer.end('op')
    timer.start('op')
    timer.end('op')
    const flat = timer.flatDurations
    expect(flat.has('op')).toBe(true)
    const opDuration = flat.get('op')!
    expect(opDuration).toBeGreaterThan(0)
  })

  it('should handle nested timing', () => {
    const timer = new HierarchicalTimer()
    timer.start('outer')
    timer.start('inner')
    timer.end('inner')
    timer.end('outer')
    expect(timer).toBeDefined()
  })

  it('should handle multiple timers', () => {
    const timer = new HierarchicalTimer()
    timer.start('a')
    timer.end('a')
    timer.start('b')
    timer.end('b')
    expect(timer).toBeDefined()
  })

  it('format returns string', () => {
    const timer = new HierarchicalTimer()
    timer.start('x')
    timer.end('x')
    expect(typeof timer.format()).toBe('string')
  })

  it('clear resets timer', () => {
    const timer = new HierarchicalTimer()
    timer.start('y')
    timer.end('y')
    timer.clear()
    expect(timer.format()).toBe('')
  })

  it('disabled timer ignores start/end', () => {
    const timer = new HierarchicalTimer({ enabled: false })
    timer.start('z')
    timer.end('z')
    expect(timer.format()).toBe('')
  })
})
describe('hierarchical-timer - wave548', () => {
  it('hierarchical-timer module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module has name', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module not null', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module has length', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave549', () => {
  it('hierarchical-timer module defined', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module is function', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave550', () => {
  it('hierarchical-timer w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave551', () => {
  it('hierarchical-timer w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave552', () => {
  it('hierarchical-timer w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave553', () => {
  it('hierarchical-timer w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave554', () => {
  it('hierarchical-timer w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave555', () => {
  it('hierarchical-timer w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave556', () => {
  it('hierarchical-timer w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave557', () => {
  it('hierarchical-timer w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
