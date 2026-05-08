import { describe, it, expect, beforeEach } from 'vitest'
import { TelemetryCollector } from '../../src/core/telemetry/telemetry-collector.js'
import { MetricsRecorder } from '../../src/core/telemetry/metrics-recorder.js'
import { TelemetryReporter } from '../../src/core/telemetry/telemetry-reporter.js'
import { DEFAULT_TELEMETRY_CONFIG } from '../../src/core/telemetry/types.js'
import type { MetricPoint } from '../../src/core/telemetry/types.js'

describe('DEFAULT_TELEMETRY_CONFIG', () => {
  it('should have enabled true by default', () => {
    expect(DEFAULT_TELEMETRY_CONFIG.enabled).toBe(true)
  })

  it('should have flushIntervalMs 5000', () => {
    expect(DEFAULT_TELEMETRY_CONFIG.flushIntervalMs).toBe(5000)
  })

  it('should have maxQueueSize 1000', () => {
    expect(DEFAULT_TELEMETRY_CONFIG.maxQueueSize).toBe(1000)
  })

  it('should have anonymize false', () => {
    expect(DEFAULT_TELEMETRY_CONFIG.anonymize).toBe(false)
  })

  it('should have no endpoint by default', () => {
    expect(DEFAULT_TELEMETRY_CONFIG.endpoint).toBeUndefined()
  })
})

describe('TelemetryCollector', () => {
  let collector: TelemetryCollector

  beforeEach(() => {
    collector = new TelemetryCollector()
  })

  describe('startSession', () => {
    it('should return a session ID string', () => {
      const id = collector.startSession()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should start with sess_ prefix', () => {
      const id = collector.startSession()
      expect(id.startsWith('sess_')).toBe(true)
    })

    it('should set session as active', () => {
      collector.startSession()
      expect(collector.isSessionActive()).toBe(true)
    })

    it('should generate unique session IDs', () => {
      const id1 = collector.startSession()
      const id2 = collector.startSession()
      expect(id1).not.toBe(id2)
    })

    it('should clear events when starting a new session', () => {
      collector.startSession()
      collector.trackEvent('test')
      collector.startSession()
      expect(collector.getEvents()).toHaveLength(0)
    })
  })

  describe('endSession', () => {
    it('should deactivate session', () => {
      collector.startSession()
      collector.endSession()
      expect(collector.isSessionActive()).toBe(false)
    })

    it('should clear session ID', () => {
      collector.startSession()
      collector.endSession()
      expect(collector.getSessionId()).toBeNull()
    })

    it('should be safe to call without active session', () => {
      expect(() => collector.endSession()).not.toThrow()
    })
  })

  describe('trackEvent', () => {
    it('should track an event with name', () => {
      collector.startSession()
      collector.trackEvent('page_view')
      const events = collector.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0]!.name).toBe('page_view')
    })

    it('should track event with properties', () => {
      collector.startSession()
      collector.trackEvent('click', { button: 'submit', x: 100 })
      const events = collector.getEvents()
      expect(events[0]!.properties).toEqual({ button: 'submit', x: 100 })
    })

    it('should include timestamp', () => {
      collector.startSession()
      const before = Date.now()
      collector.trackEvent('test')
      const after = Date.now()
      const ts = collector.getEvents()[0]!.timestamp
      expect(ts).toBeGreaterThanOrEqual(before)
      expect(ts).toBeLessThanOrEqual(after)
    })

    it('should include session ID', () => {
      const sessionId = collector.startSession()
      collector.trackEvent('test')
      expect(collector.getEvents()[0]!.sessionId).toBe(sessionId)
    })

    it('should not track when no session is active', () => {
      collector.trackEvent('test')
      expect(collector.getEvents()).toHaveLength(0)
    })

    it('should not track when disabled', () => {
      const disabled = new TelemetryCollector({ enabled: false })
      disabled.startSession()
      disabled.trackEvent('test')
      expect(disabled.getEvents()).toHaveLength(0)
    })

    it('should respect maxQueueSize', () => {
      const limited = new TelemetryCollector({ maxQueueSize: 3 })
      limited.startSession()
      limited.trackEvent('e1')
      limited.trackEvent('e2')
      limited.trackEvent('e3')
      limited.trackEvent('e4')
      expect(limited.getEvents()).toHaveLength(3)
    })

    it('should default properties to empty object', () => {
      collector.startSession()
      collector.trackEvent('test')
      expect(collector.getEvents()[0]!.properties).toEqual({})
    })
  })

  describe('trackException', () => {
    it('should track exception with error message', () => {
      collector.startSession()
      collector.trackException(new Error('boom'))
      const events = collector.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0]!.name).toBe('exception')
      expect(events[0]!.properties.errorMessage).toBe('boom')
    })

    it('should track error name', () => {
      collector.startSession()
      collector.trackException(new TypeError('type error'))
      expect(collector.getEvents()[0]!.properties.errorName).toBe('TypeError')
    })

    it('should include context', () => {
      collector.startSession()
      collector.trackException(new Error('err'), { userId: 42 })
      expect(collector.getEvents()[0]!.properties.userId).toBe(42)
    })

    it('should not track when no session active', () => {
      collector.trackException(new Error('err'))
      expect(collector.getEvents()).toHaveLength(0)
    })
  })

  describe('getEvents', () => {
    it('should return a copy of events', () => {
      collector.startSession()
      collector.trackEvent('a')
      const events1 = collector.getEvents()
      const events2 = collector.getEvents()
      expect(events1).toEqual(events2)
      expect(events1).not.toBe(events2)
    })
  })

  describe('getEventsByName', () => {
    it('should filter events by name', () => {
      collector.startSession()
      collector.trackEvent('click')
      collector.trackEvent('scroll')
      collector.trackEvent('click')
      const clicks = collector.getEventsByName('click')
      expect(clicks).toHaveLength(2)
    })

    it('should return empty array for no matches', () => {
      collector.startSession()
      collector.trackEvent('click')
      expect(collector.getEventsByName('hover')).toHaveLength(0)
    })
  })

  describe('flush', () => {
    it('should return all events and clear queue', () => {
      collector.startSession()
      collector.trackEvent('a')
      collector.trackEvent('b')
      const flushed = collector.flush()
      expect(flushed).toHaveLength(2)
      expect(collector.getEvents()).toHaveLength(0)
    })

    it('should return empty array when no events', () => {
      collector.startSession()
      expect(collector.flush()).toEqual([])
    })
  })

  describe('clear', () => {
    it('should remove all events', () => {
      collector.startSession()
      collector.trackEvent('a')
      collector.trackEvent('b')
      collector.clear()
      expect(collector.getEvents()).toHaveLength(0)
    })
  })

  describe('anonymize', () => {
    it('should redact string properties when anonymize is true', () => {
      const anon = new TelemetryCollector({ anonymize: true })
      anon.startSession()
      anon.trackEvent('test', { name: 'John', age: 30 })
      const props = anon.getEvents()[0]!.properties
      expect(props.name).toBe('[redacted]')
      expect(props.age).toBe(30)
    })
  })

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const config = collector.getConfig()
      expect(config).toEqual(DEFAULT_TELEMETRY_CONFIG)
    })
  })

  describe('getSessionId', () => {
    it('should return null when no session active', () => {
      expect(collector.getSessionId()).toBeNull()
    })

    it('should return session ID after startSession', () => {
      const id = collector.startSession()
      expect(collector.getSessionId()).toBe(id)
    })
  })
})

describe('MetricsRecorder', () => {
  let recorder: MetricsRecorder

  beforeEach(() => {
    recorder = new MetricsRecorder()
  })

  describe('increment', () => {
    it('should increment a counter by 1 by default', () => {
      recorder.increment('requests')
      expect(recorder.getCounter('requests')).toBe(1)
    })

    it('should increment by a custom value', () => {
      recorder.increment('bytes', 1024)
      expect(recorder.getCounter('bytes')).toBe(1024)
    })

    it('should accumulate increments', () => {
      recorder.increment('hits')
      recorder.increment('hits')
      recorder.increment('hits')
      expect(recorder.getCounter('hits')).toBe(3)
    })

    it('should record metric points', () => {
      recorder.increment('req')
      expect(recorder.getPointCount('req')).toBe(1)
    })

    it('should accept tags', () => {
      recorder.increment('req', 1, { method: 'GET' })
      const metrics = recorder.getAllMetrics()
      const points = metrics.get('req')
      expect(points![0]!.tags).toEqual({ method: 'GET' })
    })
  })

  describe('decrement', () => {
    it('should decrement a counter by 1', () => {
      recorder.increment('active', 5)
      recorder.decrement('active')
      expect(recorder.getCounter('active')).toBe(4)
    })

    it('should decrement by custom value', () => {
      recorder.increment('items', 10)
      recorder.decrement('items', 3)
      expect(recorder.getCounter('items')).toBe(7)
    })

    it('should allow negative counters', () => {
      recorder.decrement('neg')
      expect(recorder.getCounter('neg')).toBe(-1)
    })
  })

  describe('gauge', () => {
    it('should set a gauge value', () => {
      recorder.gauge('temperature', 72.5)
      expect(recorder.getGauge('temperature')).toBe(72.5)
    })

    it('should overwrite previous gauge', () => {
      recorder.gauge('cpu', 50)
      recorder.gauge('cpu', 80)
      expect(recorder.getGauge('cpu')).toBe(80)
    })

    it('should return undefined for unknown gauge', () => {
      expect(recorder.getGauge('unknown')).toBeUndefined()
    })
  })

  describe('timing', () => {
    it('should record a timing metric', () => {
      recorder.timing('request_duration', 150)
      expect(recorder.getPointCount('request_duration')).toBe(1)
      const metrics = recorder.getAllMetrics()
      const points = metrics.get('request_duration')
      expect(points![0]!.type).toBe('timer')
      expect(points![0]!.value).toBe(150)
    })

    it('should accumulate multiple timings', () => {
      recorder.timing('req', 100)
      recorder.timing('req', 200)
      recorder.timing('req', 300)
      expect(recorder.getPointCount('req')).toBe(3)
    })
  })

  describe('histogram', () => {
    it('should record a histogram metric', () => {
      recorder.histogram('response_size', 1024)
      const metrics = recorder.getAllMetrics()
      const points = metrics.get('response_size')
      expect(points![0]!.type).toBe('histogram')
      expect(points![0]!.value).toBe(1024)
    })
  })

  describe('getSummary', () => {
    it('should return null for unknown metric', () => {
      expect(recorder.getSummary('unknown')).toBeNull()
    })

    it('should compute summary for a metric', () => {
      recorder.timing('latency', 100)
      recorder.timing('latency', 200)
      recorder.timing('latency', 300)
      const summary = recorder.getSummary('latency')!
      expect(summary.name).toBe('latency')
      expect(summary.count).toBe(3)
      expect(summary.sum).toBe(600)
      expect(summary.min).toBe(100)
      expect(summary.max).toBe(300)
      expect(summary.mean).toBe(200)
    })

    it('should compute percentiles', () => {
      for (let i = 1; i <= 100; i++) {
        recorder.timing('p', i)
      }
      const summary = recorder.getSummary('p')!
      expect(summary.p50).toBeCloseTo(50.5, 0)
      expect(summary.p95).toBeCloseTo(95.05, 0)
      expect(summary.p99).toBeCloseTo(99.01, 0)
    })

    it('should handle single value', () => {
      recorder.timing('single', 42)
      const summary = recorder.getSummary('single')!
      expect(summary.count).toBe(1)
      expect(summary.min).toBe(42)
      expect(summary.max).toBe(42)
      expect(summary.mean).toBe(42)
      expect(summary.p50).toBe(42)
      expect(summary.p95).toBe(42)
      expect(summary.p99).toBe(42)
    })
  })

  describe('getAllMetrics', () => {
    it('should return all metrics as a Map', () => {
      recorder.increment('a')
      recorder.gauge('b', 10)
      const all = recorder.getAllMetrics()
      expect(all.size).toBe(2)
      expect(all.has('a')).toBe(true)
      expect(all.has('b')).toBe(true)
    })

    it('should return a copy', () => {
      recorder.increment('x')
      const m1 = recorder.getAllMetrics()
      const m2 = recorder.getAllMetrics()
      expect(m1).not.toBe(m2)
    })
  })

  describe('startTimer', () => {
    it('should return a stop function', () => {
      const stop = recorder.startTimer('op')
      expect(typeof stop).toBe('function')
    })

    it('should record timing when stop is called', () => {
      const stop = recorder.startTimer('op')
      stop()
      expect(recorder.getPointCount('op')).toBe(1)
      const metrics = recorder.getAllMetrics()
      const points = metrics.get('op')
      expect(points![0]!.type).toBe('timer')
      expect(points![0]!.value).toBeGreaterThanOrEqual(0)
    })

    it('should accept tags', () => {
      const stop = recorder.startTimer('op', { env: 'test' })
      stop()
      const metrics = recorder.getAllMetrics()
      const points = metrics.get('op')
      expect(points![0]!.tags).toEqual({ env: 'test' })
    })
  })

  describe('reset', () => {
    it('should clear all metrics', () => {
      recorder.increment('a')
      recorder.gauge('b', 10)
      recorder.timing('c', 50)
      recorder.reset()
      expect(recorder.getAllMetrics().size).toBe(0)
      expect(recorder.getCounter('a')).toBe(0)
      expect(recorder.getGauge('b')).toBeUndefined()
    })
  })
})

describe('TelemetryReporter', () => {
  let reporter: TelemetryReporter
  let collector: TelemetryCollector
  let recorder: MetricsRecorder

  beforeEach(() => {
    reporter = new TelemetryReporter()
    collector = new TelemetryCollector()
    recorder = new MetricsRecorder()
  })

  describe('generateReport', () => {
    it('should generate report with session info', () => {
      collector.startSession()
      const report = reporter.generateReport(collector, recorder)
      expect(report.sessionId).toBeTruthy()
      expect(typeof report.duration).toBe('number')
    })

    it('should count events', () => {
      collector.startSession()
      collector.trackEvent('a')
      collector.trackEvent('b')
      collector.trackEvent('c')
      const report = reporter.generateReport(collector, recorder)
      expect(report.eventCount).toBe(3)
    })

    it('should count metrics', () => {
      collector.startSession()
      recorder.increment('x', 5)
      recorder.timing('y', 100)
      const report = reporter.generateReport(collector, recorder)
      expect(report.metricCount).toBe(2)
    })

    it('should include top events', () => {
      collector.startSession()
      collector.trackEvent('click')
      collector.trackEvent('click')
      collector.trackEvent('scroll')
      const report = reporter.generateReport(collector, recorder)
      expect(report.topEvents).toHaveLength(2)
    })

    it('should include generatedAt timestamp', () => {
      collector.startSession()
      const before = Date.now()
      const report = reporter.generateReport(collector, recorder)
      const after = Date.now()
      expect(report.generatedAt).toBeGreaterThanOrEqual(before)
      expect(report.generatedAt).toBeLessThanOrEqual(after)
    })

    it('should use no-session when no active session', () => {
      const report = reporter.generateReport(collector, recorder)
      expect(report.sessionId).toBe('no-session')
    })

    it('should include metrics summary', () => {
      collector.startSession()
      recorder.timing('latency', 100)
      recorder.timing('latency', 200)
      const report = reporter.generateReport(collector, recorder)
      expect(report.metricsSummary.length).toBeGreaterThan(0)
    })
  })

  describe('getTopEvents', () => {
    it('should return events sorted by count descending', () => {
      const events = [
        { name: 'a' },
        { name: 'b' },
        { name: 'a' },
        { name: 'a' },
        { name: 'b' },
      ]
      const top = reporter.getTopEvents(events, 10)
      expect(top[0]!.name).toBe('a')
      expect(top[0]!.count).toBe(3)
      expect(top[1]!.name).toBe('b')
      expect(top[1]!.count).toBe(2)
    })

    it('should respect count limit', () => {
      const events = [
        { name: 'a' },
        { name: 'b' },
        { name: 'c' },
      ]
      const top = reporter.getTopEvents(events, 2)
      expect(top).toHaveLength(2)
    })

    it('should return empty for no events', () => {
      expect(reporter.getTopEvents([], 5)).toEqual([])
    })
  })

  describe('summarizeMetrics', () => {
    it('should group by name and compute summaries', () => {
      const points: MetricPoint[] = [
        {
          name: 'latency',
          value: 100,
          timestamp: Date.now(),
          tags: {},
          type: 'timer',
        },
        {
          name: 'latency',
          value: 200,
          timestamp: Date.now(),
          tags: {},
          type: 'timer',
        },
        {
          name: 'cpu',
          value: 50,
          timestamp: Date.now(),
          tags: {},
          type: 'gauge',
        },
      ]
      const summaries = reporter.summarizeMetrics(points)
      expect(summaries).toHaveLength(2)
      const latencySummary = summaries.find((s) => s.name === 'latency')!
      expect(latencySummary.count).toBe(2)
      expect(latencySummary.mean).toBe(150)
    })

    it('should return empty array for no points', () => {
      expect(reporter.summarizeMetrics([])).toEqual([])
    })
  })

  describe('formatReport', () => {
    it('should format report as readable string', () => {
      collector.startSession()
      collector.trackEvent('click')
      recorder.increment('hits')
      const report = reporter.generateReport(collector, recorder)
      const formatted = reporter.formatReport(report)
      expect(formatted).toContain('Telemetry Report')
      expect(formatted).toContain('Session ID:')
      expect(formatted).toContain('Events:')
    })

    it('should include top events section', () => {
      collector.startSession()
      collector.trackEvent('click')
      const report = reporter.generateReport(collector, recorder)
      const formatted = reporter.formatReport(report)
      expect(formatted).toContain('Top Events')
    })

    it('should include metrics summary section', () => {
      collector.startSession()
      recorder.timing('latency', 100)
      const report = reporter.generateReport(collector, recorder)
      const formatted = reporter.formatReport(report)
      expect(formatted).toContain('Metrics Summary')
    })
  })

  describe('toJSON', () => {
    it('should serialize report as JSON', () => {
      collector.startSession()
      const report = reporter.generateReport(collector, recorder)
      const json = reporter.toJSON(report)
      const parsed = JSON.parse(json)
      expect(parsed.sessionId).toBe(report.sessionId)
      expect(parsed.eventCount).toBe(report.eventCount)
    })

    it('should produce valid JSON', () => {
      collector.startSession()
      collector.trackEvent('test')
      const report = reporter.generateReport(collector, recorder)
      expect(() => JSON.parse(reporter.toJSON(report))).not.toThrow()
    })
  })

  describe('toCSV', () => {
    it('should format metrics as CSV with header', () => {
      const summaries = [
        {
          name: 'latency',
          count: 10,
          sum: 1000,
          min: 50,
          max: 200,
          mean: 100,
          p50: 95,
          p95: 190,
          p99: 198,
        },
      ]
      const csv = reporter.toCSV(summaries)
      const lines = csv.split('\n')
      expect(lines[0]).toBe('name,count,sum,min,max,mean,p50,p95,p99')
      expect(lines[1]).toContain('latency')
    })

    it('should handle empty metrics', () => {
      const csv = reporter.toCSV([])
      expect(csv).toBe('name,count,sum,min,max,mean,p50,p95,p99')
    })
  })

  describe('performance entries', () => {
    it('should record performance entries', () => {
      reporter.recordPerformance('parse', 1000, 1050, { files: 5 })
      const entries = reporter.getPerformanceEntries()
      expect(entries).toHaveLength(1)
      expect(entries[0]!.name).toBe('parse')
      expect(entries[0]!.duration).toBe(50)
      expect(entries[0]!.metadata).toEqual({ files: 5 })
    })

    it('should return copy of entries', () => {
      reporter.recordPerformance('op', 0, 10)
      const e1 = reporter.getPerformanceEntries()
      const e2 = reporter.getPerformanceEntries()
      expect(e1).not.toBe(e2)
    })

    it('should clear performance entries', () => {
      reporter.recordPerformance('op', 0, 10)
      reporter.clearPerformanceEntries()
      expect(reporter.getPerformanceEntries()).toHaveLength(0)
    })

    it('should default metadata to empty object', () => {
      reporter.recordPerformance('op', 0, 10)
      expect(reporter.getPerformanceEntries()[0]!.metadata).toEqual({})
    })
  })
})

describe('Integration', () => {
  it('should track session lifecycle', () => {
    const collector = new TelemetryCollector()
    const recorder = new MetricsRecorder()
    const reporter = new TelemetryReporter()

    const sessionId = collector.startSession()
    expect(sessionId).toBeTruthy()

    collector.trackEvent('session_start')
    collector.trackEvent('action_performed', { action: 'analyze' })
    recorder.increment('files_analyzed', 42)
    recorder.timing('analysis_duration', 1500)

    collector.trackException(new Error('test error'))

    const report = reporter.generateReport(collector, recorder)
    expect(report.eventCount).toBe(3)
    expect(report.metricCount).toBe(2)
    expect(report.topEvents.length).toBeGreaterThan(0)

    collector.endSession()
    expect(collector.isSessionActive()).toBe(false)
  })

  it('should produce valid JSON report', () => {
    const collector = new TelemetryCollector()
    const recorder = new MetricsRecorder()
    const reporter = new TelemetryReporter()

    collector.startSession()
    collector.trackEvent('test')
    recorder.increment('counter')

    const report = reporter.generateReport(collector, recorder)
    const json = reporter.toJSON(report)
    const parsed = JSON.parse(json)
    expect(parsed.eventCount).toBe(1)
  })

  it('should handle flush and report flow', () => {
    const collector = new TelemetryCollector()
    collector.startSession()
    collector.trackEvent('e1')
    collector.trackEvent('e2')

    const flushed = collector.flush()
    expect(flushed).toHaveLength(2)
    expect(collector.getEvents()).toHaveLength(0)

    const report = new TelemetryReporter().generateReport(
      collector,
      new MetricsRecorder(),
    )
    expect(report.eventCount).toBe(0)
  })

  it('should summarize mixed metric types', () => {
    const recorder = new MetricsRecorder()
    recorder.increment('requests')
    recorder.increment('requests')
    recorder.gauge('memory', 1024)
    recorder.timing('latency', 50)
    recorder.timing('latency', 100)
    recorder.histogram('size', 256)

    const allMetrics = recorder.getAllMetrics()
    expect(allMetrics.size).toBe(4)

    const latencySummary = recorder.getSummary('latency')
    expect(latencySummary!.count).toBe(2)
    expect(latencySummary!.mean).toBe(75)

    const reqSummary = recorder.getSummary('requests')
    expect(reqSummary!.count).toBe(2)
  })
})
