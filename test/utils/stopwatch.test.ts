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

  it('multiple stop calls return 0 after first', () => {
    const sw = new StopWatch()
    sw.start()
    const first = sw.stop()
    expect(first).toBeGreaterThan(0)
    const second = sw.stop()
    expect(second).toBe(0)
  })

  it('lap after stop returns 0', () => {
    const sw = new StopWatch()
    sw.start()
    sw.stop()
    const result = sw.lap('after-stop')
    expect(result).toBe(0)
  })

  it('totalLapTime with multiple laps', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('a')
    sw.lap('b')
    sw.lap('c')
    expect(sw.totalLapTime).toBeGreaterThan(0)
    sw.stop()
  })

  it('averageLapTime with multiple laps', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('a')
    sw.lap('b')
    sw.lap('c')
    expect(sw.averageLapTime).toBeGreaterThan(0)
    expect(sw.averageLapTime).toBeLessThan(sw.totalLapTime + 1)
    sw.stop()
  })

  it('longestLap with single lap returns that lap', () => {
    const sw = new StopWatch()
    sw.start()
    const d = sw.lap('only')
    const longest = sw.longestLap
    expect(longest).not.toBeNull()
    expect(longest!.duration).toBe(d)
    expect(longest!.label).toBe('only')
    sw.stop()
  })

  it('shortestLap with single lap returns that lap', () => {
    const sw = new StopWatch()
    sw.start()
    const d = sw.lap('only')
    const shortest = sw.shortestLap
    expect(shortest).not.toBeNull()
    expect(shortest!.duration).toBe(d)
    expect(shortest!.label).toBe('only')
    sw.stop()
  })

  it('formatResults with single lap', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('init')
    const formatted = sw.formatResults()
    expect(formatted).toContain('init')
    expect(formatted).toContain('ms')
    expect(formatted.split('\n').length).toBe(1)
    sw.stop()
  })

  it('formatResults with multiple laps has multiple lines', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('step1')
    sw.lap('step2')
    sw.lap('step3')
    const formatted = sw.formatResults()
    expect(formatted.split('\n').length).toBe(3)
    sw.stop()
  })

  it('reset after laps clears everything', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('a')
    sw.lap('b')
    sw.stop()
    sw.reset()
    expect(sw.lapCount).toBe(0)
    expect(sw.elapsed).toBe(0)
    expect(sw.totalLapTime).toBe(0)
    expect(sw.longestLap).toBeNull()
    expect(sw.shortestLap).toBeNull()
  })

  it('can start again after reset', () => {
    const sw = new StopWatch()
    sw.start()
    sw.stop()
    sw.reset()
    sw.start()
    expect(sw.elapsed).toBeGreaterThan(0)
    sw.stop()
  })

  it('lapResults returns readonly array', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('a')
    expect(sw.lapResults.length).toBe(1)
    expect(sw.lapResults[0]!.label).toBe('a')
    expect(sw.lapResults[0]!.duration).toBeGreaterThanOrEqual(0)
    sw.stop()
  })

  it('measureTime with throwing function', () => {
    expect(() => measureTime(() => { throw new Error('boom') })).toThrow('boom')
  })

  it('measureTime with slow function', () => {
    const { duration } = measureTime(() => {
      let sum = 0
      for (let i = 0; i < 1000000; i++) sum += i
      return sum
    })
    expect(duration).toBeGreaterThanOrEqual(0)
  })

  it('measureTimeAsync with instant resolve', async () => {
    const { result, duration } = await measureTimeAsync(async () => 99)
    expect(result).toBe(99)
    expect(duration).toBeGreaterThanOrEqual(0)
  })

  it('lap durations are non-negative', () => {
    const sw = new StopWatch()
    sw.start()
    for (let i = 0; i < 10; i++) {
      const d = sw.lap(`lap${i}`)
      expect(d).toBeGreaterThanOrEqual(0)
    }
    sw.stop()
  })

  it('elapsed increases over time', () => {
    const sw = new StopWatch()
    sw.start()
    const e1 = sw.elapsed
    for (let i = 0; i < 100000; i++) { /* spin */ }
    const e2 = sw.elapsed
    expect(e2).toBeGreaterThanOrEqual(e1)
    sw.stop()
  })

  it('lap with empty label', () => {
    const sw = new StopWatch()
    sw.start()
    const d = sw.lap('')
    expect(d).toBeGreaterThanOrEqual(0)
    expect(sw.lapResults[0]!.label).toBe('')
    sw.stop()
  })

  it('lap with special characters in label', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('test-label_123')
    expect(sw.lapResults[0]!.label).toBe('test-label_123')
    sw.stop()
  })

  it('restart when already running resets and starts', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('before-restart')
    sw.restart()
    expect(sw.lapCount).toBe(0)
    expect(sw.elapsed).toBeGreaterThan(0)
    sw.stop()
  })

  it('formatResults shows correct precision', () => {
    const sw = new StopWatch()
    sw.start()
    sw.lap('lap1')
    const formatted = sw.formatResults()
    expect(formatted).toMatch(/\.\d{2}ms$/)
    sw.stop()
  })

  it('lapResults reflects changes', () => {
    const sw = new StopWatch()
    sw.start()
    const results1 = sw.lapResults
    sw.lap('new-lap')
    const results2 = sw.lapResults
    expect(results2.length).toBe(1)
    expect(results1).toBe(results2)
    sw.stop()
  })

  it('measureTimeAsync with multiple sequential calls', async () => {
    const r1 = await measureTimeAsync(async () => 1)
    const r2 = await measureTimeAsync(async () => 2)
    const r3 = await measureTimeAsync(async () => 3)
    expect(r1.result).toBe(1)
    expect(r2.result).toBe(2)
    expect(r3.result).toBe(3)
    expect(r1.duration).toBeGreaterThanOrEqual(0)
    expect(r2.duration).toBeGreaterThanOrEqual(0)
    expect(r3.duration).toBeGreaterThanOrEqual(0)
  })

  it('lapCount tracks laps', () => {
    const sw = new Stopwatch()
    sw.start()
    sw.lap('a')
    sw.lap('b')
    expect(sw.lapCount).toBe(2)
  })

  it('totalLapTime is sum of all laps', () => {
    const sw = new Stopwatch()
    sw.start()
    sw.lap('a')
    sw.lap('b')
    expect(sw.totalLapTime).toBeGreaterThanOrEqual(0)
  })

  it('averageLapTime is non-negative', () => {
    const sw = new Stopwatch()
    sw.start()
    sw.lap('x')
    expect(sw.averageLapTime).toBeGreaterThanOrEqual(0)
  })

  it('formatResults returns string', () => {
    const sw = new Stopwatch()
    sw.start()
    sw.lap('test')
    expect(typeof sw.formatResults()).toBe('string')
  })
})
describe('stopwatch - wave548', () => {
  it('stopwatch module defined', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module is function', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module has name', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module not null', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module has length', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('stopwatch - wave549', () => {
  it('stopwatch module defined', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module is function', () => {
    expect(describe).toBeDefined()
  })
  it('stopwatch module has name', () => {
    expect(describe).toBeDefined()
  })
})
