import { describe, expect, it, vi } from 'vitest'

import {
  StopWatch,
  measureTime,
  measureTimeAsync,
} from '../../../src/utils/stopwatch.js'

describe('StopWatch', () => {
  it('starts and stops measuring time', () => {
    const sw = new StopWatch()
    sw.start()
    expect(sw.elapsed).toBeGreaterThanOrEqual(0)
    const total = sw.stop()
    expect(total).toBeGreaterThanOrEqual(0)
  })

  it('returns 0 for stop when not running', () => {
    const sw = new StopWatch()
    expect(sw.stop()).toBe(0)
  })

  it('does not restart if already running', () => {
    const sw = new StopWatch()
    sw.start()
    const firstStart = sw.elapsed
    sw.start()
    expect(sw.elapsed).toBeGreaterThanOrEqual(firstStart - 1)
  })

  it('records laps', () => {
    const sw = new StopWatch()
    sw.start()
    const d1 = sw.lap('a')
    const d2 = sw.lap('b')
    expect(d1).toBeGreaterThanOrEqual(0)
    expect(d2).toBeGreaterThanOrEqual(0)
    expect(sw.lapCount).toBe(2)
    expect(sw.lapResults[0]!.label).toBe('a')
    expect(sw.lapResults[1]!.label).toBe('b')
  })

  it('returns 0 for lap when not running', () => {
    const sw = new StopWatch()
    expect(sw.lap('x')).toBe(0)
  })

  it('computes totalLapTime', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('a')
    sw.lap('b')
    const total = sw.totalLapTime
    expect(total).toBe(sw.lapResults[0]!.duration + sw.lapResults[1]!.duration)
  })

  it('computes averageLapTime', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('a')
    sw.lap('b')
    const avg = sw.averageLapTime
    expect(avg).toBe(sw.totalLapTime / 2)
  })

  it('returns 0 averageLapTime with no laps', () => {
    const sw = new StopWatch()
    expect(sw.averageLapTime).toBe(0)
  })

  it('finds longest lap', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('fast')
    let sum = 0
    for (let i = 0; i < 100000; i++) sum += i
    void sum
    sw.lap('slow')
    const longest = sw.longestLap
    expect(longest).not.toBeNull()
    expect(longest!.label).toBe('slow')
  })

  it('finds shortest lap', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('fast')
    let sum = 0
    for (let i = 0; i < 100000; i++) sum += i
    void sum
    sw.lap('slow')
    const shortest = sw.shortestLap
    expect(shortest).not.toBeNull()
    expect(shortest!.label).toBe('fast')
  })

  it('returns null for longestLap/shortestLap with no laps', () => {
    const sw = new StopWatch()
    expect(sw.longestLap).toBeNull()
    expect(sw.shortestLap).toBeNull()
  })

  it('resets all state', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('a')
    sw.reset()
    expect(sw.lapCount).toBe(0)
    expect(sw.elapsed).toBe(0)
  })

  it('restarts cleanly', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('a')
    sw.restart()
    expect(sw.lapCount).toBe(0)
    expect(sw.elapsed).toBeGreaterThanOrEqual(0)
  })

  it('formats results as string', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('init')
    sw.lap('process')
    const formatted = sw.formatResults()
    expect(formatted).toContain('init')
    expect(formatted).toContain('process')
    expect(formatted).toContain('ms')
  })

  it('elapsed is 0 when not running', () => {
    const sw = new StopWatch()
    expect(sw.elapsed).toBe(0)
  })
})

describe('measureTime', () => {
  it('measures synchronous function execution', () => {
    const { duration, result } = measureTime(() => 42)
    expect(result).toBe(42)
    expect(duration).toBeGreaterThanOrEqual(0)
  })

  it('measures function that throws', () => {
    expect(() => measureTime(() => {
      throw new Error('boom')
    })).toThrow('boom')
  })
})

describe('measureTimeAsync', () => {
  it('measures async function execution', async () => {
    const { duration, result } = await measureTimeAsync(async () => {
      await new Promise((r) => setTimeout(r, 5))
      return 'done'
    })
    expect(result).toBe('done')
    expect(duration).toBeGreaterThanOrEqual(5)
  })

  it('propagates async errors', async () => {
    await expect(measureTimeAsync(async () => {
      throw new Error('async boom')
    })).rejects.toThrow('async boom')
  })
})
