import { describe, it, expect } from 'vitest'
import { TimerWheel } from '../../src/utils/timer-wheel.js'

describe('TimerWheel', () => {
  it('schedules and fires at correct tick', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(0, 'now')
    const result = tw.advance()
    expect(result).toEqual(['now'])
  })

  it('fires multiple items at same tick', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(0, 'a')
    tw.schedule(0, 'b')
    const result = tw.advance()
    expect(result).toEqual(['a', 'b'])
  })

  it('does not fire future items', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(5, 'future')
    const result = tw.advance()
    expect(result).toEqual([])
  })

  it('fires items after advancing', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(2, 'target')
    tw.advance()
    tw.advance()
    const result = tw.advance()
    expect(result).toEqual(['target'])
  })

  it('advanceMultiple fires all within range', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(0, 'a')
    tw.schedule(1, 'b')
    tw.schedule(2, 'c')
    const result = tw.advanceMultiple(3)
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('tracks current tick', () => {
    const tw = new TimerWheel<string>(4)
    expect(tw.current).toBe(0)
    tw.advance()
    expect(tw.current).toBe(1)
    tw.advanceMultiple(5)
    expect(tw.current).toBe(6)
  })

  it('tracks pending count', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(5, 'a')
    tw.schedule(9, 'b')
    expect(tw.pendingCount).toBe(2)
    tw.advanceMultiple(10)
    expect(tw.pendingCount).toBe(0)
  })

  it('reports correct size', () => {
    const tw = new TimerWheel<string>(8)
    expect(tw.size).toBe(256)
  })

  it('clear removes all pending', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(5, 'a')
    tw.schedule(10, 'b')
    tw.clear()
    expect(tw.pendingCount).toBe(0)
  })

  it('handles wrap-around', () => {
    const tw = new TimerWheel<string>(2)
    for (let i = 0; i < 10; i++) {
      tw.schedule(i, `item-${i}`)
    }
    const result = tw.advanceMultiple(10)
    expect(result.length).toBe(10)
  })

  it('throws for invalid bits', () => {
    expect(() => new TimerWheel(0)).toThrow()
    expect(() => new TimerWheel(17)).toThrow()
  })

  it('handles empty advance', () => {
    const tw = new TimerWheel<string>(4)
    const result = tw.advance()
    expect(result).toEqual([])
  })

  it('handles schedule at future tick within range', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(3, 'delayed')
    const results = tw.advanceMultiple(4)
    expect(results).toContain('delayed')
  })

  it('preserves items not yet ready during advance', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(0, 'now')
    tw.schedule(5, 'later')
    const r1 = tw.advance()
    expect(r1).toEqual(['now'])
    expect(tw.pendingCount).toBe(1)
    tw.advanceMultiple(4)
    const r2 = tw.advance()
    expect(r2).toEqual(['later'])
  })

  it('handles reschedule after clear', () => {
    const tw = new TimerWheel<string>(4)
    tw.schedule(0, 'a')
    tw.clear()
    tw.schedule(1, 'b')
    const results = tw.advanceMultiple(2)
    expect(results).toEqual(['b'])
  })

  it('handles many items at same tick', () => {
    const tw = new TimerWheel<string>(4)
    for (let i = 0; i < 50; i++) {
      tw.schedule(0, `item-${i}`)
    }
    const result = tw.advance()
    expect(result.length).toBe(50)
  })

  it('advance with no timers returns empty', () => {
    const tw = new TimerWheel(8)
    const result = tw.advance()
    expect(result).toEqual([])
  })

  it('advance returns scheduled payload at correct tick', () => {
    const tw = new TimerWheel<string>(8)
    tw.schedule(0, 'hello')
    const result = tw.advance()
    expect(result).toContain('hello')
  })
})
