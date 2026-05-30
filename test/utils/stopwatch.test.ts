import { describe, it, expect, vi } from 'vitest'
import { StopWatch, measureTime, measureTimeAsync } from '../../src/utils/stopwatch.js'

describe('StopWatch', () => {
  it('elapsed returns 0 when not started', () => {
    const sw = new StopWatch()
    expect(sw.elapsed).toBe(0)
  })

  it('elapsed returns 0 after stop', () => {
    const sw = new StopWatch()
    sw.start()
    sw.stop()
    expect(sw.elapsed).toBe(0)
  })

  it('elapsed returns positive value when running', () => {
    const sw = new StopWatch()
    sw.start()
    const elapsed = sw.elapsed
    expect(elapsed).toBeGreaterThan(0)
    sw.stop()
  })

  it('lapCount starts at 0', () => {
    const sw = new StopWatch()
    expect(sw.lapCount).toBe(0)
  })

  it('lapCount increments after lap', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('lap1')
    expect(sw.lapCount).toBe(1)
    sw.lap('lap2')
    expect(sw.lapCount).toBe(2)
    sw.stop()
  })

  it('lapResults starts empty', () => {
    const sw = new StopWatch()
    expect(sw.lapResults).toEqual([])
  })

  it('lapResults records laps', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('first')
    sw.lap('second')
    expect(sw.lapResults.length).toBe(2)
    expect(sw.lapResults[0]!.label).toBe('first')
    expect(sw.lapResults[1]!.label).toBe('second')
    sw.stop()
  })

  it('lap returns 0 when not running', () => {
    const sw = new StopWatch()
    const result = sw.lap('test')
    expect(result).toBe(0)
    expect(sw.lapCount).toBe(0)
  })

  it('lap records time when running', () => {
    const sw = new StopWatch()
    sw.start()
    const duration = sw.lap('test')
    expect(duration).toBeGreaterThanOrEqual(0)
    expect(sw.lapCount).toBe(1)
    sw.stop()
  })

  it('start starts the timer', () => {
    const sw = new StopWatch()
    sw.start()
    expect(sw.elapsed).toBeGreaterThan(0)
    sw.stop()
  })

  it('start does nothing when already running', () => {
    const sw = new StopWatch()
    sw.start()
    const elapsed1 = sw.elapsed
    sw.start()
    const elapsed2 = sw.elapsed
    expect(elapsed2).toBeGreaterThanOrEqual(elapsed1)
    sw.stop()
  })

  it('stop returns total elapsed time', () => {
    const sw = new StopWatch()
    sw.start()
    const total = sw.stop()
    expect(total).toBeGreaterThan(0)
    expect(sw.elapsed).toBe(0)
  })

  it('stop returns 0 when not running', () => {
    const sw = new StopWatch()
    const total = sw.stop()
    expect(total).toBe(0)
  })

  it('reset clears all state', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('lap1')
    sw.lap('lap2')
    sw.reset()
    expect(sw.lapCount).toBe(0)
    expect(sw.lapResults).toEqual([])
    expect(sw.elapsed).toBe(0)
  })

  it('restart clears state and starts timer', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('lap1')
    sw.restart()
    expect(sw.lapCount).toBe(0)
    expect(sw.elapsed).toBeGreaterThan(0)
    sw.stop()
  })

  it('totalLapTime returns 0 with no laps', () => {
    const sw = new StopWatch()
    expect(sw.totalLapTime).toBe(0)
  })

  it('totalLapTime sums all lap durations', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('lap1')
    sw.lap('lap2')
    const total = sw.totalLapTime
    expect(total).toBeGreaterThan(0)
    sw.stop()
  })

  it('averageLapTime returns 0 with no laps', () => {
    const sw = new StopWatch()
    expect(sw.averageLapTime).toBe(0)
  })

  it('averageLapTime calculates average', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('lap1')
    sw.lap('lap2')
    const avg = sw.averageLapTime
    expect(avg).toBeGreaterThan(0)
    sw.stop()
  })

  it('longestLap returns null with no laps', () => {
    const sw = new StopWatch()
    expect(sw.longestLap).toBe(null)
  })

  it('longestLap finds longest lap', () => {
    const sw = new StopWatch()
    sw.start()
    const d1 = sw.lap('first')
    const d2 = sw.lap('second')
    const d3 = sw.lap('third')
    const longest = sw.longestLap
    expect(longest).not.toBeNull()
    expect([d1, d2, d3]).toContain(longest!.duration)
    sw.stop()
  })

  it('shortestLap returns null with no laps', () => {
    const sw = new StopWatch()
    expect(sw.shortestLap).toBe(null)
  })

  it('shortestLap finds shortest lap', () => {
    const sw = new StopWatch()
    sw.start()
    const d1 = sw.lap('first')
    const d2 = sw.lap('second')
    const d3 = sw.lap('third')
    const shortest = sw.shortestLap
    expect(shortest).not.toBeNull()
    expect([d1, d2, d3]).toContain(shortest!.duration)
    sw.stop()
  })

  it('formatResults returns empty string with no laps', () => {
    const sw = new StopWatch()
    const formatted = sw.formatResults()
    expect(formatted).toBe('')
  })

  it('formatResults formats laps correctly', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('lap1')
    sw.lap('lap2')
    const formatted = sw.formatResults()
    expect(formatted).toContain('lap1')
    expect(formatted).toContain('lap2')
    expect(formatted).toContain('ms')
    sw.stop()
  })

  it('measureTime returns result and duration', () => {
    const { result, duration } = measureTime(() => {
      return 42
    })
    expect(result).toBe(42)
    expect(duration).toBeGreaterThanOrEqual(0)
  })

  it('measureTime measures synchronous function', () => {
    let counter = 0
    const { result, duration } = measureTime(() => {
      counter++
      return counter
    })
    expect(result).toBe(1)
    expect(counter).toBe(1)
    expect(duration).toBeGreaterThanOrEqual(0)
  })

  it('measureTimeAsync returns result and duration', async () => {
    const { result, duration } = await measureTimeAsync(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      return 42
    })
    expect(result).toBe(42)
    expect(duration).toBeGreaterThanOrEqual(5)
  })

  it('measureTimeAsync measures async function', async () => {
    let counter = 0
    const { result, duration } = await measureTimeAsync(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1))
      counter++
      return counter
    })
    expect(result).toBe(1)
    expect(counter).toBe(1)
    expect(duration).toBeGreaterThanOrEqual(1)
  })
})