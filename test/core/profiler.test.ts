import { describe, it, expect } from 'vitest'
import { CPUProfiler } from '../../src/core/profiler/cpu-profiler.js'
import { MemoryProfiler } from '../../src/core/profiler/memory-profiler.js'
import { ProfilerReport } from '../../src/core/profiler/profiler-report.js'
import type { ProfileSession, MemorySnapshot } from '../../src/core/profiler/types.js'

describe('CPUProfiler', () => {
  const profiler = new CPUProfiler()

  describe('startSession', () => {
    it('should return a session id string', () => {
      const id = profiler.startSession('test-session')
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should create a session with the given name', () => {
      const id = profiler.startSession('my-session')
      const session = profiler.getSession(id)
      expect(session).not.toBeNull()
      expect(session!.name).toBe('my-session')
    })

    it('should set startTime on the session', () => {
      const before = Date.now()
      const id = profiler.startSession('timing-test')
      const after = Date.now()
      const session = profiler.getSession(id)
      expect(session!.startTime).toBeGreaterThanOrEqual(before)
      expect(session!.startTime).toBeLessThanOrEqual(after)
    })

    it('should initialize samples as empty array', () => {
      const id = profiler.startSession('empty-samples')
      const session = profiler.getSession(id)
      expect(session!.samples).toEqual([])
    })

    it('should initialize endTime and totalDuration as 0', () => {
      const id = profiler.startSession('init-test')
      const session = profiler.getSession(id)
      expect(session!.endTime).toBe(0)
      expect(session!.totalDuration).toBe(0)
    })

    it('should return unique ids for different sessions', () => {
      const id1 = profiler.startSession('a')
      const id2 = profiler.startSession('b')
      expect(id1).not.toBe(id2)
    })
  })

  describe('endSession', () => {
    it('should set endTime on the session', () => {
      const id = profiler.startSession('end-test')
      const before = Date.now()
      const session = profiler.endSession(id)
      const after = Date.now()
      expect(session.endTime).toBeGreaterThanOrEqual(before)
      expect(session.endTime).toBeLessThanOrEqual(after)
    })

    it('should calculate totalDuration', () => {
      const id = profiler.startSession('duration-test')
      const session = profiler.endSession(id)
      expect(session.totalDuration).toBe(session.endTime - session.startTime)
      expect(session.totalDuration).toBeGreaterThanOrEqual(0)
    })

    it('should throw if session not found', () => {
      expect(() => profiler.endSession('nonexistent')).toThrow('Session not found')
    })

    it('should clear current session after ending', () => {
      const id = profiler.startSession('clear-test')
      expect(profiler.isProfiling()).toBe(true)
      profiler.endSession(id)
      expect(profiler.getCurrentSession()).toBeNull()
    })

    it('should calculate peakMemory from samples', () => {
      const id = profiler.startSession('peak-test')
      profiler.sample('a', ['fn'], 10)
      profiler.getCurrentSession()!.samples[0]!.memoryUsage = 50
      profiler.sample('b', ['fn'], 20)
      profiler.getCurrentSession()!.samples[1]!.memoryUsage = 150
      const session = profiler.endSession(id)
      expect(session.peakMemory).toBe(150)
    })

    it('should handle session with no samples for peakMemory', () => {
      const id = profiler.startSession('no-samples')
      const session = profiler.endSession(id)
      expect(session.peakMemory).toBe(0)
    })
  })

  describe('sample', () => {
    it('should add a sample to the current session', () => {
      const id = profiler.startSession('sample-test')
      profiler.sample('my-label', ['stack'], 42)
      const session = profiler.getSession(id)
      expect(session!.samples).toHaveLength(1)
      expect(session!.samples[0]!.label).toBe('my-label')
    })

    it('should use provided duration', () => {
      const id = profiler.startSession('dur-test')
      profiler.sample('label', ['fn'], 100)
      const session = profiler.getSession(id)
      expect(session!.samples[0]!.duration).toBe(100)
    })

    it('should default duration to 0 when not provided', () => {
      const id = profiler.startSession('default-dur')
      profiler.sample('label', ['fn'])
      const session = profiler.getSession(id)
      expect(session!.samples[0]!.duration).toBe(0)
    })

    it('should store stack trace', () => {
      const id = profiler.startSession('stack-test')
      profiler.sample('label', ['fnA (file.ts:10)', 'fnB (file.ts:20)'], 5)
      const session = profiler.getSession(id)
      expect(session!.samples[0]!.stackTrace).toEqual(['fnA (file.ts:10)', 'fnB (file.ts:20)'])
    })

    it('should throw when no active session', () => {
      const p = new CPUProfiler()
      expect(() => p.sample('label', ['fn'])).toThrow('No active profiling session')
    })

    it('should set timestamp on each sample', () => {
      const id = profiler.startSession('ts-test')
      const before = Date.now()
      profiler.sample('label', ['fn'], 1)
      const after = Date.now()
      const session = profiler.getSession(id)
      expect(session!.samples[0]!.timestamp).toBeGreaterThanOrEqual(before)
      expect(session!.samples[0]!.timestamp).toBeLessThanOrEqual(after)
    })

    it('should accumulate multiple samples', () => {
      const id = profiler.startSession('multi-test')
      profiler.sample('a', ['fn'], 1)
      profiler.sample('b', ['fn'], 2)
      profiler.sample('c', ['fn'], 3)
      const session = profiler.getSession(id)
      expect(session!.samples).toHaveLength(3)
    })
  })

  describe('getSession', () => {
    it('should return null for nonexistent session', () => {
      expect(profiler.getSession('nonexistent')).toBeNull()
    })

    it('should return the session by id', () => {
      const id = profiler.startSession('get-test')
      const session = profiler.getSession(id)
      expect(session).not.toBeNull()
      expect(session!.id).toBe(id)
    })
  })

  describe('getAllSessions', () => {
    it('should return all sessions', () => {
      const p = new CPUProfiler()
      p.startSession('s1')
      p.startSession('s2')
      const all = p.getAllSessions()
      expect(all).toHaveLength(2)
    })

    it('should return empty array when no sessions', () => {
      const p = new CPUProfiler()
      expect(p.getAllSessions()).toEqual([])
    })
  })

  describe('getCurrentSession', () => {
    it('should return null when not profiling', () => {
      const p = new CPUProfiler()
      expect(p.getCurrentSession()).toBeNull()
    })

    it('should return current session when profiling', () => {
      const p = new CPUProfiler()
      const id = p.startSession('current')
      const session = p.getCurrentSession()
      expect(session).not.toBeNull()
      expect(session!.id).toBe(id)
    })
  })

  describe('isProfiling', () => {
    it('should return false initially', () => {
      const p = new CPUProfiler()
      expect(p.isProfiling()).toBe(false)
    })

    it('should return true after starting a session', () => {
      const p = new CPUProfiler()
      p.startSession('profiling')
      expect(p.isProfiling()).toBe(true)
    })

    it('should return false after ending a session', () => {
      const p = new CPUProfiler()
      const id = p.startSession('temp')
      p.endSession(id)
      expect(p.isProfiling()).toBe(false)
    })
  })
})

describe('MemoryProfiler', () => {
  const memProfiler = new MemoryProfiler()

  describe('snapshot', () => {
    it('should return a MemorySnapshot', () => {
      const snap = memProfiler.snapshot('test')
      expect(snap).toBeDefined()
      expect(snap.label).toBe('test')
    })

    it('should set timestamp', () => {
      const before = Date.now()
      const snap = memProfiler.snapshot('ts')
      const after = Date.now()
      expect(snap.timestamp).toBeGreaterThanOrEqual(before)
      expect(snap.timestamp).toBeLessThanOrEqual(after)
    })

    it('should use empty string label when not provided', () => {
      const snap = memProfiler.snapshot()
      expect(snap.label).toBe('')
    })

    it('should store snapshot internally', () => {
      const p = new MemoryProfiler()
      p.snapshot('a')
      p.snapshot('b')
      expect(p.getSnapshots()).toHaveLength(2)
    })

    it('should add to tracking snapshots when tracking', () => {
      const p = new MemoryProfiler()
      p.startTracking()
      p.snapshot('tracked')
      const tracked = p.stopTracking()
      expect(tracked).toHaveLength(1)
      expect(tracked[0]!.label).toBe('tracked')
    })
  })

  describe('startTracking / stopTracking', () => {
    it('should return empty array if no snapshots during tracking', () => {
      const p = new MemoryProfiler()
      p.startTracking()
      const result = p.stopTracking()
      expect(result).toEqual([])
    })

    it('should collect snapshots during tracking period', () => {
      const p = new MemoryProfiler()
      p.startTracking()
      p.snapshot('a')
      p.snapshot('b')
      p.snapshot('c')
      const result = p.stopTracking()
      expect(result).toHaveLength(3)
    })

    it('should stop tracking after stopTracking call', () => {
      const p = new MemoryProfiler()
      p.startTracking()
      p.snapshot('tracked')
      p.stopTracking()
      p.snapshot('untracked')
      const secondTrack = p.stopTracking()
      expect(secondTrack).toEqual([])
    })

    it('should not affect global snapshot list', () => {
      const p = new MemoryProfiler()
      p.startTracking()
      p.snapshot('a')
      p.stopTracking()
      p.snapshot('b')
      expect(p.getSnapshots()).toHaveLength(2)
    })
  })

  describe('getSnapshots', () => {
    it('should return a copy of the snapshots array', () => {
      const p = new MemoryProfiler()
      p.snapshot('a')
      const snaps = p.getSnapshots()
      snaps.push({} as MemorySnapshot)
      expect(p.getSnapshots()).toHaveLength(1)
    })
  })

  describe('getPeakMemory', () => {
    it('should return 0 when no snapshots', () => {
      const p = new MemoryProfiler()
      expect(p.getPeakMemory()).toBe(0)
    })

    it('should return max heapUsed', () => {
      const p = new MemoryProfiler()
      const s1 = p.snapshot('a')
      s1.heapUsed = 100
      const s2 = p.snapshot('b')
      s2.heapUsed = 500
      const s3 = p.snapshot('c')
      s3.heapUsed = 300
      expect(p.getPeakMemory()).toBe(500)
    })
  })

  describe('getAverageMemory', () => {
    it('should return 0 when no snapshots', () => {
      const p = new MemoryProfiler()
      expect(p.getAverageMemory()).toBe(0)
    })

    it('should calculate average heapUsed', () => {
      const p = new MemoryProfiler()
      const s1 = p.snapshot('a')
      s1.heapUsed = 100
      const s2 = p.snapshot('b')
      s2.heapUsed = 300
      expect(p.getAverageMemory()).toBe(200)
    })
  })

  describe('detectLeaks', () => {
    it('should return empty array for empty snapshots', () => {
      const p = new MemoryProfiler()
      expect(p.detectLeaks([])).toEqual([])
    })

    it('should return empty array for single snapshot', () => {
      const p = new MemoryProfiler()
      expect(p.detectLeaks([{ timestamp: 1, heapUsed: 100, heapTotal: 200, rss: 300, external: 10, label: 'a' }])).toEqual([])
    })

    it('should detect growth between snapshots', () => {
      const p = new MemoryProfiler()
      const snaps: MemorySnapshot[] = [
        { timestamp: 1, heapUsed: 100, heapTotal: 200, rss: 300, external: 10, label: 'a' },
        { timestamp: 2, heapUsed: 200, heapTotal: 300, rss: 400, external: 20, label: 'b' },
      ]
      const leaks = p.detectLeaks(snaps)
      expect(leaks).toHaveLength(1)
      expect(leaks[0]!.growth).toBe(100)
      expect(leaks[0]!.from).toBe(1)
      expect(leaks[0]!.to).toBe(2)
      expect(leaks[0]!.label).toBe('b')
    })

    it('should not report growth when memory decreases', () => {
      const p = new MemoryProfiler()
      const snaps: MemorySnapshot[] = [
        { timestamp: 1, heapUsed: 200, heapTotal: 300, rss: 400, external: 20, label: 'a' },
        { timestamp: 2, heapUsed: 100, heapTotal: 200, rss: 300, external: 10, label: 'b' },
      ]
      const leaks = p.detectLeaks(snaps)
      expect(leaks).toHaveLength(0)
    })

    it('should detect multiple leaks', () => {
      const p = new MemoryProfiler()
      const snaps: MemorySnapshot[] = [
        { timestamp: 1, heapUsed: 100, heapTotal: 200, rss: 300, external: 10, label: 'a' },
        { timestamp: 2, heapUsed: 200, heapTotal: 300, rss: 400, external: 20, label: 'b' },
        { timestamp: 3, heapUsed: 150, heapTotal: 300, rss: 400, external: 20, label: 'c' },
        { timestamp: 4, heapUsed: 300, heapTotal: 400, rss: 500, external: 30, label: 'd' },
      ]
      const leaks = p.detectLeaks(snaps)
      expect(leaks).toHaveLength(2)
      expect(leaks[0]!.growth).toBe(100)
      expect(leaks[1]!.growth).toBe(150)
    })

    it('should use previous label when current is empty', () => {
      const p = new MemoryProfiler()
      const snaps: MemorySnapshot[] = [
        { timestamp: 1, heapUsed: 100, heapTotal: 200, rss: 300, external: 10, label: 'prev' },
        { timestamp: 2, heapUsed: 200, heapTotal: 300, rss: 400, external: 20, label: '' },
      ]
      const leaks = p.detectLeaks(snaps)
      expect(leaks[0]!.label).toBe('prev')
    })
  })

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(memProfiler.formatBytes(0)).toBe('0 B')
    })

    it('should format bytes', () => {
      expect(memProfiler.formatBytes(512)).toBe('512.00 B')
    })

    it('should format kilobytes', () => {
      expect(memProfiler.formatBytes(1024)).toBe('1.00 KB')
    })

    it('should format megabytes', () => {
      expect(memProfiler.formatBytes(1024 * 1024)).toBe('1.00 MB')
    })

    it('should format gigabytes', () => {
      expect(memProfiler.formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB')
    })

    it('should format terabytes', () => {
      expect(memProfiler.formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB')
    })

    it('should handle fractional values', () => {
      const result = memProfiler.formatBytes(1536)
      expect(result).toBe('1.50 KB')
    })
  })
})

describe('ProfilerReport', () => {
  const reporter = new ProfilerReport()

  function makeSession(samples: { label: string; stack: string[]; duration: number; mem: number }[]): ProfileSession {
    const now = Date.now()
    return {
      id: 'test-session',
      name: 'test',
      startTime: now - 1000,
      endTime: now,
      samples: samples.map((s, i) => ({
        timestamp: now - 1000 + i * 10,
        stackTrace: s.stack,
        duration: s.duration,
        memoryUsage: s.mem,
        label: s.label,
      })),
      totalDuration: 1000,
      peakMemory: Math.max(...samples.map((s) => s.mem), 0),
    }
  }

  describe('generateReport', () => {
    it('should generate a complete report', () => {
      const session = makeSession([
        { label: 'a', stack: ['fnA (file.ts:10)'], duration: 50, mem: 100 },
      ])
      const report = reporter.generateReport(session, [])
      expect(report.session).toBe(session)
      expect(report.hotspots).toBeDefined()
      expect(report.summary).toBeDefined()
      expect(report.recommendations).toBeDefined()
      expect(report.memorySnapshots).toEqual([])
    })

    it('should include memory snapshots in report', () => {
      const session = makeSession([])
      const snaps: MemorySnapshot[] = [
        { timestamp: 1, heapUsed: 100, heapTotal: 200, rss: 300, external: 10, label: 'a' },
      ]
      const report = reporter.generateReport(session, snaps)
      expect(report.memorySnapshots).toEqual(snaps)
    })
  })

  describe('findHotspots', () => {
    it('should return empty for session with no samples', () => {
      const session = makeSession([])
      const hotspots = reporter.findHotspots(session)
      expect(hotspots).toEqual([])
    })

    it('should identify hotspots from samples', () => {
      const session = makeSession([
        { label: 'a', stack: ['fnA (file.ts:10)'], duration: 100, mem: 0 },
        { label: 'b', stack: ['fnA (file.ts:10)'], duration: 200, mem: 0 },
      ])
      const hotspots = reporter.findHotspots(session)
      expect(hotspots).toHaveLength(1)
      expect(hotspots[0]!.function).toBe('fnA')
      expect(hotspots[0]!.selfTime).toBe(300)
      expect(hotspots[0]!.callCount).toBe(2)
    })

    it('should sort hotspots by selfTime descending', () => {
      const session = makeSession([
        { label: 'a', stack: ['fnA (a.ts:1)'], duration: 50, mem: 0 },
        { label: 'b', stack: ['fnB (b.ts:2)'], duration: 200, mem: 0 },
      ])
      const hotspots = reporter.findHotspots(session)
      expect(hotspots[0]!.function).toBe('fnB')
      expect(hotspots[1]!.function).toBe('fnA')
    })

    it('should calculate percentage correctly', () => {
      const session = makeSession([
        { label: 'a', stack: ['fnA (a.ts:1)'], duration: 75, mem: 0 },
        { label: 'b', stack: ['fnB (b.ts:2)'], duration: 25, mem: 0 },
      ])
      const hotspots = reporter.findHotspots(session)
      expect(hotspots[0]!.percentage).toBe(75)
      expect(hotspots[1]!.percentage).toBe(25)
    })

    it('should respect threshold parameter', () => {
      const session = makeSession([
        { label: 'a', stack: ['fnA (a.ts:1)'], duration: 90, mem: 0 },
        { label: 'b', stack: ['fnB (b.ts:2)'], duration: 10, mem: 0 },
      ])
      const hotspots = reporter.findHotspots(session, 50)
      expect(hotspots).toHaveLength(1)
      expect(hotspots[0]!.function).toBe('fnA')
    })

    it('should handle multi-frame stack traces', () => {
      const session = makeSession([
        { label: 'a', stack: ['fnA (a.ts:1)', 'fnB (b.ts:2)'], duration: 100, mem: 0 },
      ])
      const hotspots = reporter.findHotspots(session)
      expect(hotspots).toHaveLength(2)
      const fnA = hotspots.find((h) => h.function === 'fnA')
      const fnB = hotspots.find((h) => h.function === 'fnB')
      expect(fnA!.selfTime).toBe(100)
      expect(fnA!.totalTime).toBe(100)
      expect(fnB!.selfTime).toBe(0)
      expect(fnB!.totalTime).toBe(100)
    })

    it('should handle samples with empty stack traces', () => {
      const session = makeSession([
        { label: 'a', stack: [], duration: 50, mem: 0 },
      ])
      const hotspots = reporter.findHotspots(session)
      expect(hotspots).toEqual([])
    })

    it('should parse file and line from frame', () => {
      const session = makeSession([
        { label: 'a', stack: ['myFunc (src/app.ts:42)'], duration: 10, mem: 0 },
      ])
      const hotspots = reporter.findHotspots(session)
      expect(hotspots[0]!.file).toBe('src/app.ts')
      expect(hotspots[0]!.line).toBe(42)
    })
  })

  describe('calculateSummary', () => {
    it('should handle session with no samples', () => {
      const session = makeSession([])
      const summary = reporter.calculateSummary(session)
      expect(summary.totalSamples).toBe(0)
      expect(summary.avgSampleDuration).toBe(0)
      expect(summary.maxSampleDuration).toBe(0)
      expect(summary.minSampleDuration).toBe(0)
      expect(summary.peakMemory).toBe(0)
      expect(summary.avgMemory).toBe(0)
    })

    it('should calculate correct averages', () => {
      const session = makeSession([
        { label: 'a', stack: ['fn'], duration: 100, mem: 200 },
        { label: 'b', stack: ['fn'], duration: 200, mem: 400 },
        { label: 'c', stack: ['fn'], duration: 300, mem: 600 },
      ])
      const summary = reporter.calculateSummary(session)
      expect(summary.totalSamples).toBe(3)
      expect(summary.avgSampleDuration).toBe(200)
      expect(summary.maxSampleDuration).toBe(300)
      expect(summary.minSampleDuration).toBe(100)
      expect(summary.peakMemory).toBe(600)
      expect(summary.avgMemory).toBe(400)
    })

    it('should use session totalDuration for totalTime', () => {
      const session = makeSession([{ label: 'a', stack: ['fn'], duration: 10, mem: 0 }])
      const summary = reporter.calculateSummary(session)
      expect(summary.totalTime).toBe(1000)
    })
  })

  describe('generateRecommendations', () => {
    it('should recommend no issues when none found', () => {
      const summary = {
        totalTime: 100,
        avgSampleDuration: 10,
        maxSampleDuration: 50,
        minSampleDuration: 5,
        totalSamples: 10,
        peakMemory: 1024,
        avgMemory: 512,
      }
      const recs = reporter.generateRecommendations([], summary)
      expect(recs).toHaveLength(1)
      expect(recs[0]).toContain('No significant performance issues')
    })

    it('should warn about dominant function', () => {
      const hotspots = [
        { function: 'heavyFn', file: 'a.ts', line: 1, selfTime: 100, totalTime: 100, callCount: 5, percentage: 60 },
      ]
      const summary = {
        totalTime: 100,
        avgSampleDuration: 10,
        maxSampleDuration: 50,
        minSampleDuration: 5,
        totalSamples: 10,
        peakMemory: 1024,
        avgMemory: 512,
      }
      const recs = reporter.generateRecommendations(hotspots, summary)
      expect(recs).toContain(
        'Function "heavyFn" consumes 60% of execution time. Consider optimizing or caching.',
      )
    })

    it('should warn about high call count', () => {
      const hotspots = [
        { function: 'repeatedFn', file: 'a.ts', line: 1, selfTime: 10, totalTime: 10, callCount: 200, percentage: 10 },
      ]
      const summary = {
        totalTime: 100,
        avgSampleDuration: 10,
        maxSampleDuration: 50,
        minSampleDuration: 5,
        totalSamples: 10,
        peakMemory: 1024,
        avgMemory: 512,
      }
      const recs = reporter.generateRecommendations(hotspots, summary)
      expect(recs.some((r) => r.includes('200 times'))).toBe(true)
    })

    it('should warn about high peak memory', () => {
      const summary = {
        totalTime: 100,
        avgSampleDuration: 10,
        maxSampleDuration: 50,
        minSampleDuration: 5,
        totalSamples: 10,
        peakMemory: 200 * 1024 * 1024,
        avgMemory: 512,
      }
      const recs = reporter.generateRecommendations([], summary)
      expect(recs.some((r) => r.includes('100MB'))).toBe(true)
    })

    it('should warn about long samples', () => {
      const summary = {
        totalTime: 5000,
        avgSampleDuration: 1000,
        maxSampleDuration: 5000,
        minSampleDuration: 5,
        totalSamples: 10,
        peakMemory: 1024,
        avgMemory: 512,
      }
      const recs = reporter.generateRecommendations([], summary)
      expect(recs.some((r) => r.includes('1 second'))).toBe(true)
    })

    it('should warn about high sample count', () => {
      const summary = {
        totalTime: 100,
        avgSampleDuration: 10,
        maxSampleDuration: 50,
        minSampleDuration: 5,
        totalSamples: 20000,
        peakMemory: 1024,
        avgMemory: 512,
      }
      const recs = reporter.generateRecommendations([], summary)
      expect(recs.some((r) => r.includes('profiling granularity'))).toBe(true)
    })
  })

  describe('formatReport', () => {
    it('should produce a formatted string', () => {
      const session = makeSession([
        { label: 'a', stack: ['fnA (a.ts:1)'], duration: 100, mem: 50 },
      ])
      const report = reporter.generateReport(session, [])
      const formatted = reporter.formatReport(report)
      expect(formatted).toContain('Profile Report')
      expect(formatted).toContain('test-session')
      expect(formatted).toContain('Hotspots')
      expect(formatted).toContain('Summary')
    })

    it('should include recommendations in formatted output', () => {
      const session = makeSession([])
      const report = reporter.generateReport(session, [])
      const formatted = reporter.formatReport(report)
      expect(formatted).toContain('Recommendations')
    })

    it('should format session name and id', () => {
      const session = makeSession([])
      const report = reporter.generateReport(session, [])
      const formatted = reporter.formatReport(report)
      expect(formatted).toContain('test')
      expect(formatted).toContain('test-session')
    })
  })

  describe('toJSON', () => {
    it('should return valid JSON string', () => {
      const session = makeSession([])
      const report = reporter.generateReport(session, [])
      const json = reporter.toJSON(report)
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('should preserve all report fields', () => {
      const session = makeSession([
        { label: 'a', stack: ['fnA (a.ts:1)'], duration: 50, mem: 100 },
      ])
      const report = reporter.generateReport(session, [])
      const json = reporter.toJSON(report)
      const parsed = JSON.parse(json)
      expect(parsed.session).toBeDefined()
      expect(parsed.hotspots).toBeDefined()
      expect(parsed.summary).toBeDefined()
      expect(parsed.recommendations).toBeDefined()
      expect(parsed.memorySnapshots).toBeDefined()
    })
  })

  describe('getTopFunctions', () => {
    it('should return top N functions', () => {
      const hotspots = [
        { function: 'a', file: 'a.ts', line: 1, selfTime: 300, totalTime: 300, callCount: 1, percentage: 60 },
        { function: 'b', file: 'b.ts', line: 2, selfTime: 200, totalTime: 200, callCount: 1, percentage: 40 },
        { function: 'c', file: 'c.ts', line: 3, selfTime: 100, totalTime: 100, callCount: 1, percentage: 20 },
      ]
      const top = reporter.getTopFunctions(hotspots, 2)
      expect(top).toHaveLength(2)
      expect(top[0]!.function).toBe('a')
      expect(top[1]!.function).toBe('b')
    })

    it('should return all if count exceeds length', () => {
      const hotspots = [
        { function: 'a', file: 'a.ts', line: 1, selfTime: 100, totalTime: 100, callCount: 1, percentage: 50 },
      ]
      const top = reporter.getTopFunctions(hotspots, 10)
      expect(top).toHaveLength(1)
    })

    it('should return empty for empty input', () => {
      expect(reporter.getTopFunctions([], 5)).toEqual([])
    })

    it('should not mutate original array', () => {
      const hotspots = [
        { function: 'c', file: 'c.ts', line: 3, selfTime: 100, totalTime: 100, callCount: 1, percentage: 20 },
        { function: 'a', file: 'a.ts', line: 1, selfTime: 300, totalTime: 300, callCount: 1, percentage: 60 },
      ]
      reporter.getTopFunctions(hotspots, 1)
      expect(hotspots[0]!.function).toBe('c')
    })
  })
})

describe('Integration', () => {
  it('should profile a full workflow end to end', () => {
    const cpu = new CPUProfiler()
    const mem = new MemoryProfiler()
    const report = new ProfilerReport()

    mem.startTracking()
    const sessionId = cpu.startSession('integration-test')

    cpu.sample('parse', ['parseFile (parser.ts:10)', 'readFile (io.ts:5)'], 50)
    const s0 = mem.snapshot('before-parse')
    s0.heapUsed = 512 * 1024

    cpu.sample('analyze', ['analyze (analyzer.ts:20)'], 200)
    const s1 = mem.snapshot('after-parse')
    s1.heapUsed = 1024 * 1024

    cpu.sample('report', ['generateReport (report.ts:30)'], 30)
    const s2 = mem.snapshot('after-analyze')
    s2.heapUsed = 5 * 1024 * 1024

    const s3 = mem.snapshot('after-report')
    s3.heapUsed = 6 * 1024 * 1024

    const session = cpu.endSession(sessionId)
    const trackedSnaps = mem.stopTracking()

    expect(session.samples).toHaveLength(3)
    expect(trackedSnaps).toHaveLength(4)

    const leaks = mem.detectLeaks(trackedSnaps)
    expect(leaks).toHaveLength(3)

    const profileReport = report.generateReport(session, trackedSnaps)
    expect(profileReport.hotspots.length).toBeGreaterThan(0)
    expect(profileReport.summary.totalSamples).toBe(3)
    expect(profileReport.summary.peakMemory).toBe(0)
    expect(trackedSnaps[3]!.heapUsed).toBe(6 * 1024 * 1024)

    const formatted = report.formatReport(profileReport)
    expect(formatted).toContain('integration-test')
    expect(formatted).toContain('Hotspots')

    const json = report.toJSON(profileReport)
    const parsed = JSON.parse(json)
    expect(parsed.session.name).toBe('integration-test')
  })

  it('should handle empty profiling session', () => {
    const cpu = new CPUProfiler()
    const report = new ProfilerReport()

    const id = cpu.startSession('empty')
    const session = cpu.endSession(id)
    const profileReport = report.generateReport(session, [])

    expect(profileReport.hotspots).toEqual([])
    expect(profileReport.summary.totalSamples).toBe(0)
    expect(profileReport.recommendations).toContain('No significant performance issues detected.')
  })
})
