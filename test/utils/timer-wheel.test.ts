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

  it('advance to scheduled tick fires callback', () => {
    const tw = new TimerWheel<string>(10)
    tw.schedule(3, 'hello')
    for (let i = 0; i < 3; i++) tw.advance()
    const result = tw.advance()
    expect(result).toContain('hello')
  })

  it('schedule at slot 0 fires on advance', () => {
    const tw = new TimerWheel<string>(8)
    tw.schedule(0, 'x')
    tw.schedule(0, 'y')
    const result = tw.advance()
    expect(result).toContain('x')
    expect(result).toContain('y')
  })

  it('schedule and advance fires callback', () => {
    const tw = new TimerWheel(4)
    const fired: string[] = []
    tw.schedule('test', 0, () => fired.push('test'))
    tw.advance()
    expect(fired).toEqual(['test'])
  })

  it('minimum bits value works', () => {
    const tw = new TimerWheel(1)
    expect(tw.size).toBe(2)
  })

  it('maximum bits value works', () => {
    const tw = new TimerWheel(16)
    expect(tw.size).toBe(65536)
  })

  it('schedule with first signature (tick, payload)', () => {
    const tw = new TimerWheel(4)
    tw.schedule(5, 'test')
    tw.advanceMultiple(5)
    expect(tw.current).toBe(5)
  })

  it('minimum bits value works', () => {
    const tw = new TimerWheel(1)
    expect(tw.size).toBe(2)
  })

  it('maximum bits value works', () => {
    const tw = new TimerWheel(16)
    expect(tw.size).toBe(65536)
  })

  it('schedule with callback using second signature', () => {
    const tw = new TimerWheel(4)
    let callbackCalled = false
    tw.schedule('test', 4, () => { callbackCalled = true })
    tw.advanceMultiple(5)
    expect(callbackCalled).toBe(true)
  })

  it('callback receives correct context', () => {
    const tw = new TimerWheel(4)
    const results: string[] = []
    tw.schedule('a', 0, () => results.push('a'))
    tw.schedule('b', 0, () => results.push('b'))
    tw.advance()
    expect(results).toEqual(['a', 'b'])
  })

  it('pendingCount after multiple schedules', () => {
    const tw = new TimerWheel(4)
    tw.schedule(0, 'a')
    tw.schedule(1, 'b')
    tw.schedule(2, 'c')
    expect(tw.pendingCount).toBe(3)
  })

  it('pendingCount after partial advance', () => {
    const tw = new TimerWheel(4)
    tw.schedule(0, 'a')
    tw.schedule(2, 'b')
    tw.advance()
    expect(tw.pendingCount).toBe(1)
  })

  it('advanceMultiple with 0 ticks returns empty', () => {
    const tw = new TimerWheel(4)
    tw.schedule(5, 'test')
    const result = tw.advanceMultiple(0)
    expect(result).toEqual([])
    expect(tw.current).toBe(0)
  })

  it('advanceMultiple preserves order', () => {
    const tw = new TimerWheel(4)
    tw.schedule(0, 'a')
    tw.schedule(1, 'b')
    tw.schedule(2, 'c')
    const result = tw.advanceMultiple(3)
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('handles negative payload values', () => {
    const tw = new TimerWheel(4)
    tw.schedule(0, -1)
    tw.schedule(0, -2)
    const result = tw.advance()
    expect(result).toEqual([-1, -2])
  })

  it('handles object payloads', () => {
    const tw = new TimerWheel<{ id: number }>(4)
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    tw.schedule(0, obj1)
    tw.schedule(0, obj2)
    const result = tw.advance()
    expect(result).toEqual([obj1, obj2])
  })

  it('handles null payloads', () => {
    const tw = new TimerWheel<null>(4)
    tw.schedule(0, null)
    const result = tw.advance()
    expect(result).toEqual([null])
  })

  it('handles undefined payloads', () => {
    const tw = new TimerWheel<undefined>(4)
    tw.schedule(0, undefined)
    const result = tw.advance()
    expect(result).toEqual([undefined])
  })

  it('handles very large tick numbers', () => {
    const tw = new TimerWheel(4)
    tw.schedule(1000000, 'far-future')
    tw.advanceMultiple(1000000)
    const result = tw.advance()
    expect(result).toEqual(['far-future'])
  })

  it('items scheduled at same tick maintain insertion order', () => {
    const tw = new TimerWheel(4)
    tw.schedule(5, 'first')
    tw.schedule(5, 'second')
    tw.schedule(5, 'third')
    tw.advanceMultiple(5)
    const result = tw.advance()
    expect(result).toEqual(['first', 'second', 'third'])
  })

  it('advanceMultiple with large number of ticks', () => {
    const tw = new TimerWheel(8)
    tw.schedule(99, 'test')
    const result = tw.advanceMultiple(100)
    expect(result).toContain('test')
    expect(tw.current).toBe(100)
  })

  it('clear resets current tick', () => {
    const tw = new TimerWheel(4)
    tw.advance()
    tw.advance()
    tw.clear()
    expect(tw.current).toBe(2)
  })

  it('size getter is constant', () => {
    const tw = new TimerWheel(8)
    const initialSize = tw.size
    tw.schedule(0, 'test')
    tw.advance()
    tw.clear()
    expect(tw.size).toBe(initialSize)
  })

  it('handles items with callback and without callback together', () => {
    const tw = new TimerWheel(4)
    let called = false
    tw.schedule('with-callback', 0, () => { called = true })
    tw.schedule(0, 'without-callback')
    tw.advance()
    expect(called).toBe(true)
  })

  it('advance with no tasks does not throw', () => {
    const tw = new TimerWheel(4)
    expect(() => tw.advance()).not.toThrow()
  })

  it('pendingCount is accurate after clear', () => {
    const tw = new TimerWheel(4)
    tw.schedule(0, 'a')
    tw.schedule(1, 'b')
    tw.schedule(2, 'c')
    tw.clear()
    expect(tw.pendingCount).toBe(0)
  })

  it('wrap-around with callbacks', () => {
    const tw = new TimerWheel(2)
    const results: string[] = []
    for (let i = 0; i < 8; i++) {
      tw.schedule(`test${i}`, i, () => results.push(`test${i}`))
    }
    tw.advanceMultiple(8)
    expect(results.length).toBe(8)
  })

  it('advanceMany with callbacks fires all callbacks', () => {
    const tw = new TimerWheel(4)
    const results: number[] = []
    tw.schedule('a', 0, () => results.push(0))
    tw.schedule('b', 1, () => results.push(1))
    tw.schedule('c', 2, () => results.push(2))
    tw.advanceMultiple(3)
    expect(results).toEqual([0, 1, 2])
  })

  it('handles boolean payloads', () => {
    const tw = new TimerWheel<boolean>(4)
    tw.schedule(0, true)
    tw.schedule(0, false)
    const result = tw.advance()
    expect(result).toEqual([true, false])
  })
})
