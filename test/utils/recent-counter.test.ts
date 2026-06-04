import { describe, it, expect } from 'vitest'
import { RecentCounter } from '../../src/utils/recent-counter.js'

describe('RecentCounter', () => {
  it('throws on non-positive windowMs', () => {
    expect(() => new RecentCounter(0)).toThrow(RangeError)
    expect(() => new RecentCounter(-100)).toThrow(RangeError)
  })

  it('returns 1 for first ping', () => {
    const rc = new RecentCounter(1000)
    expect(rc.ping(1000)).toBe(1)
  })

  it('counts pings within window', () => {
    const rc = new RecentCounter(3000)
    expect(rc.ping(1000)).toBe(1)
    expect(rc.ping(2000)).toBe(2)
    expect(rc.ping(3000)).toBe(3)
  })

  it('expires old pings outside window', () => {
    const rc = new RecentCounter(3000)
    rc.ping(1000)
    rc.ping(2000)
    rc.ping(3000)
    expect(rc.ping(5000)).toBe(3)
  })

  it('count() uses binary search without consuming', () => {
    const rc = new RecentCounter(5000)
    rc.ping(1000)
    rc.ping(2000)
    rc.ping(3000)
    rc.ping(4000)
    expect(rc.count(6000)).toBe(4)
    expect(rc.count(7000)).toBe(3)
    expect(rc.count(8000)).toBe(2)
    expect(rc.count(9000)).toBe(1)
    expect(rc.count(10000)).toBe(0)
  })

  it('reset clears all state', () => {
    const rc = new RecentCounter(1000)
    rc.ping(100)
    rc.ping(200)
    rc.reset()
    expect(rc.totalPings).toBe(0)
    expect(rc.count(200)).toBe(0)
  })

  it('windowSize getter works', () => {
    const rc = new RecentCounter(5000)
    expect(rc.windowSize).toBe(5000)
  })

  it('totalPings tracks all pings including expired', () => {
    const rc = new RecentCounter(1000)
    rc.ping(100)
    rc.ping(200)
    rc.ping(1200)
    expect(rc.totalPings).toBe(3)
  })

  it('compact removes expired entries', () => {
    const rc = new RecentCounter(1000)
    rc.ping(100)
    rc.ping(200)
    rc.ping(300)
    rc.ping(1500)
    const removed = rc.compact()
    expect(removed).toBe(3)
    expect(rc.totalPings).toBe(1)
  })

  it('compact returns 0 when nothing to remove', () => {
    const rc = new RecentCounter(1000)
    rc.ping(100)
    expect(rc.compact()).toBe(0)
  })

  it('handles identical timestamps', () => {
    const rc = new RecentCounter(1000)
    rc.ping(500)
    rc.ping(500)
    rc.ping(500)
    expect(rc.ping(500)).toBe(4)
    expect(rc.ping(2000)).toBe(1)
  })

  it('works with real Date.now()', () => {
    const rc = new RecentCounter(10000)
    const c1 = rc.ping()
    expect(c1).toBe(1)
    const c2 = rc.ping()
    expect(c2).toBe(2)
  })

  it('handles large number of pings efficiently', () => {
    const rc = new RecentCounter(1000)
    for (let t = 0; t < 10000; t += 10) {
      rc.ping(t)
    }
    expect(rc.ping(10000)).toBe(101)
    expect(rc.totalPings).toBe(1001)
  })

  it('count after compact still works', () => {
    const rc = new RecentCounter(1000)
    rc.ping(100)
    rc.ping(200)
    rc.ping(300)
    rc.ping(1500)
    rc.compact()
    expect(rc.count(1500)).toBe(1)
    expect(rc.count(2500)).toBe(1)
  })

  it('single ping at boundary of window', () => {
    const rc = new RecentCounter(1000)
    rc.ping(1000)
    expect(rc.count(2000)).toBe(1)
    expect(rc.count(2001)).toBe(0)
  })

  it('handles out-of-order timestamps gracefully', () => {
    const rc = new RecentCounter(1000)
    rc.ping(500)
    rc.ping(300)
    rc.ping(400)
    expect(rc.ping(600)).toBe(4)
  })

  it('ping returns count at that timestamp', () => {
    const rc = new RecentCounter(500)
    expect(rc.ping(100)).toBe(1)
    expect(rc.ping(200)).toBe(2)
    expect(rc.ping(800)).toBe(1)
    expect(rc.ping(1500)).toBe(1)
  })

  it('count with no prior pings returns 0', () => {
    const rc = new RecentCounter(1000)
    expect(rc.count(5000)).toBe(0)
  })

  it('multiple resets work correctly', () => {
    const rc = new RecentCounter(1000)
    rc.ping(100)
    rc.reset()
    rc.ping(200)
    rc.ping(300)
    expect(rc.totalPings).toBe(2)
    rc.reset()
    expect(rc.totalPings).toBe(0)
  })

  it('single ping counted', () => {
    const rc = new RecentCounter(3000)
    rc.ping(1000)
    expect(rc.totalPings).toBe(1)
  })

  it('count returns recent pings', () => {
    const rc = new RecentCounter(3000)
    rc.ping(1000)
    rc.ping(2000)
    expect(rc.count(2000)).toBe(2)
  })

  it('count outside window is 0', () => {
    const rc = new RecentCounter(1000)
    rc.ping(100)
    expect(rc.count(2000)).toBe(0)
  })

  it('ping and count in same window', () => {
    const rc = new RecentCounter(1000)
    rc.ping(100)
    rc.ping(200)
    expect(rc.count(300)).toBe(2)
  })

  it('count with no pings returns 0', () => {
    const rc = new RecentCounter()
    expect(rc.count(100)).toBe(0)
  })
})
