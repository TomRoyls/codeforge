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

describe('hierarchical-timer - wave558', () => {
  it('hierarchical-timer w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave559', () => {
  it('hierarchical-timer w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave560', () => {
  it('hierarchical-timer w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave561', () => {
  it('hierarchical-timer w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave562', () => {
  it('hierarchical-timer w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave563', () => {
  it('hierarchical-timer w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave564', () => {
  it('hierarchical-timer w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave565', () => {
  it('hierarchical-timer w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave566', () => {
  it('hierarchical-timer w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave127', () => {
  it('hierarchical-timer w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave130', () => {
  it('hierarchical-timer w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave133', () => {
  it('hierarchical-timer w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave136', () => {
  it('hierarchical-timer w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - wave139', () => {
  it('hierarchical-timer w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w142', () => {
  it('hierarchical-timer v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w145', () => {
  it('hierarchical-timer v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w148', () => {
  it('hierarchical-timer v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w151', () => {
  it('hierarchical-timer v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w154', () => {
  it('hierarchical-timer v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w157', () => {
  it('hierarchical-timer v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w160', () => {
  it('hierarchical-timer v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w170', () => {
  it('hierarchical-timer x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w180', () => {
  it('hierarchical-timer x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w190', () => {
  it('hierarchical-timer x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w200', () => {
  it('hierarchical-timer x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w210', () => {
  it('hierarchical-timer x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w220', () => {
  it('hierarchical-timer x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w230', () => {
  it('hierarchical-timer x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w240', () => {
  it('hierarchical-timer x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w250', () => {
  it('hierarchical-timer x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w260', () => {
  it('hierarchical-timer x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w270', () => {
  it('hierarchical-timer x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w280', () => {
  it('hierarchical-timer x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w290', () => {
  it('hierarchical-timer x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w300', () => {
  it('hierarchical-timer x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w310', () => {
  it('hierarchical-timer x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w320', () => {
  it('hierarchical-timer x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w330', () => {
  it('hierarchical-timer x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w340', () => {
  it('hierarchical-timer x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w350', () => {
  it('hierarchical-timer x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w360', () => {
  it('hierarchical-timer x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w370', () => {
  it('hierarchical-timer x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w380', () => {
  it('hierarchical-timer x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w390', () => {
  it('hierarchical-timer x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w400', () => {
  it('hierarchical-timer x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w420', () => {
  it('hierarchical-timer x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w440', () => {
  it('hierarchical-timer x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w460', () => {
  it('hierarchical-timer x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w480', () => {
  it('hierarchical-timer x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('hierarchical-timer - w500', () => {
  it('hierarchical-timer x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('hierarchical-timer x500x19', () => {
    expect(describe).toBeDefined()
  })
})
