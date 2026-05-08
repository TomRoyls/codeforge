import { describe, it, expect } from 'vitest'
import { MetricAggregator } from '../../src/core/metric-collector/metric-aggregator.js'
import { MetricCollector } from '../../src/core/metric-collector/metric-collector.js'
import { DEFAULT_METRIC_COLLECTOR_CONFIG } from '../../src/core/metric-collector/types.js'
import type { MetricSample, MetricQuery } from '../../src/core/metric-collector/types.js'

function createSample(overrides: Partial<MetricSample> = {}): MetricSample {
  return {
    name: 'test.metric',
    type: 'counter',
    value: 1,
    timestamp: Date.now(),
    tags: {},
    ...overrides,
  }
}

describe('MetricAggregator', () => {
  describe('addSample', () => {
    it('should add a sample and increase sample count', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample())
      expect(agg.getSampleCount()).toBe(1)
    })

    it('should add multiple samples', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample())
      agg.addSample(createSample())
      agg.addSample(createSample())
      expect(agg.getSampleCount()).toBe(3)
    })

    it('should handle samples with different names', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ name: 'metric.a' }))
      agg.addSample(createSample({ name: 'metric.b' }))
      expect(agg.getSampleCount()).toBe(2)
      expect(agg.getSummary('metric.a')).not.toBeNull()
      expect(agg.getSummary('metric.b')).not.toBeNull()
    })

    it('should handle samples with different tags separately', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ name: 'metric', tags: { env: 'prod' } }))
      agg.addSample(createSample({ name: 'metric', tags: { env: 'dev' } }))
      expect(agg.getSampleCount()).toBe(2)
    })
  })

  describe('getSummary', () => {
    it('should return null for unknown metric', () => {
      const agg = new MetricAggregator()
      expect(agg.getSummary('unknown')).toBeNull()
    })

    it('should return summary with correct name and type', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ name: 'requests', type: 'counter' }))
      const summary = agg.getSummary('requests')
      expect(summary).not.toBeNull()
      expect(summary!.name).toBe('requests')
      expect(summary!.type).toBe('counter')
    })

    it('should compute count correctly', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ value: 1 }))
      agg.addSample(createSample({ value: 2 }))
      agg.addSample(createSample({ value: 3 }))
      const summary = agg.getSummary('test.metric')!
      expect(summary.count).toBe(3)
    })

    it('should compute sum correctly', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ value: 10 }))
      agg.addSample(createSample({ value: 20 }))
      agg.addSample(createSample({ value: 30 }))
      const summary = agg.getSummary('test.metric')!
      expect(summary.sum).toBe(60)
    })

    it('should compute min correctly', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ value: 5 }))
      agg.addSample(createSample({ value: 1 }))
      agg.addSample(createSample({ value: 9 }))
      const summary = agg.getSummary('test.metric')!
      expect(summary.min).toBe(1)
    })

    it('should compute max correctly', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ value: 5 }))
      agg.addSample(createSample({ value: 1 }))
      agg.addSample(createSample({ value: 9 }))
      const summary = agg.getSummary('test.metric')!
      expect(summary.max).toBe(9)
    })

    it('should compute avg correctly', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ value: 10 }))
      agg.addSample(createSample({ value: 20 }))
      agg.addSample(createSample({ value: 30 }))
      const summary = agg.getSummary('test.metric')!
      expect(summary.avg).toBeCloseTo(20, 5)
    })

    it('should compute lastValue correctly', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ value: 10 }))
      agg.addSample(createSample({ value: 42 }))
      const summary = agg.getSummary('test.metric')!
      expect(summary.lastValue).toBe(42)
    })

    it('should compute percentiles when enabled', () => {
      const agg = new MetricAggregator(true)
      for (let i = 1; i <= 100; i++) {
        agg.addSample(createSample({ value: i }))
      }
      const summary = agg.getSummary('test.metric')!
      expect(summary.p50).toBeCloseTo(50.5, 0)
      expect(summary.p95).toBeCloseTo(95.05, 0)
      expect(summary.p99).toBeCloseTo(99.01, 0)
    })

    it('should return zero percentiles when disabled', () => {
      const agg = new MetricAggregator(false)
      agg.addSample(createSample({ value: 10 }))
      agg.addSample(createSample({ value: 20 }))
      const summary = agg.getSummary('test.metric')!
      expect(summary.p50).toBe(0)
      expect(summary.p95).toBe(0)
      expect(summary.p99).toBe(0)
    })

    it('should include tags in summary', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ tags: { env: 'prod', region: 'us' } }))
      const summary = agg.getSummary('test.metric')!
      expect(summary.tags).toEqual({ env: 'prod', region: 'us' })
    })
  })

  describe('getAllSummaries', () => {
    it('should return empty array when no samples', () => {
      const agg = new MetricAggregator()
      expect(agg.getAllSummaries()).toEqual([])
    })

    it('should return all unique metric summaries', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ name: 'metric.a', value: 1 }))
      agg.addSample(createSample({ name: 'metric.b', value: 2 }))
      agg.addSample(createSample({ name: 'metric.a', value: 3 }))
      const summaries = agg.getAllSummaries()
      expect(summaries).toHaveLength(2)
      const names = summaries.map((s) => s.name).sort()
      expect(names).toEqual(['metric.a', 'metric.b'])
    })
  })

  describe('query', () => {
    const now = Date.now()
    let agg: MetricAggregator

    function setupQueryData(): void {
      agg = new MetricAggregator()
      agg.addSample(createSample({ name: 'requests', type: 'counter', value: 1, timestamp: now - 2000, tags: { env: 'prod' } }))
      agg.addSample(createSample({ name: 'requests', type: 'counter', value: 2, timestamp: now - 1000, tags: { env: 'dev' } }))
      agg.addSample(createSample({ name: 'latency', type: 'timer', value: 100, timestamp: now, tags: { env: 'prod' } }))
      agg.addSample(createSample({ name: 'memory', type: 'gauge', value: 512, timestamp: now + 1000, tags: { env: 'prod' } }))
    }

    it('should return all samples with empty query', () => {
      setupQueryData()
      const results = agg.query({})
      expect(results).toHaveLength(4)
    })

    it('should filter by name', () => {
      setupQueryData()
      const results = agg.query({ name: 'requests' })
      expect(results).toHaveLength(2)
      expect(results.every((s) => s.name === 'requests')).toBe(true)
    })

    it('should filter by type', () => {
      setupQueryData()
      const results = agg.query({ type: 'counter' })
      expect(results).toHaveLength(2)
      expect(results.every((s) => s.type === 'counter')).toBe(true)
    })

    it('should filter by startTime', () => {
      setupQueryData()
      const results = agg.query({ startTime: now - 500 })
      expect(results).toHaveLength(2)
    })

    it('should filter by endTime', () => {
      setupQueryData()
      const results = agg.query({ endTime: now - 500 })
      expect(results).toHaveLength(2)
    })

    it('should filter by tags', () => {
      setupQueryData()
      const results = agg.query({ tags: { env: 'prod' } })
      expect(results).toHaveLength(3)
    })

    it('should apply limit', () => {
      setupQueryData()
      const results = agg.query({ limit: 2 })
      expect(results).toHaveLength(2)
    })

    it('should combine multiple filters', () => {
      setupQueryData()
      const results = agg.query({ name: 'requests', tags: { env: 'prod' } })
      expect(results).toHaveLength(1)
    })

    it('should return empty array when no matches', () => {
      setupQueryData()
      const results = agg.query({ name: 'nonexistent' })
      expect(results).toEqual([])
    })
  })

  describe('calculatePercentile', () => {
    it('should return 0 for empty array', () => {
      const agg = new MetricAggregator()
      expect(agg.calculatePercentile([], 50)).toBe(0)
    })

    it('should return the single value for one-element array', () => {
      const agg = new MetricAggregator()
      expect(agg.calculatePercentile([42], 50)).toBe(42)
    })

    it('should calculate median for even number of elements', () => {
      const agg = new MetricAggregator()
      expect(agg.calculatePercentile([1, 2, 3, 4], 50)).toBeCloseTo(2.5, 5)
    })

    it('should calculate p95', () => {
      const agg = new MetricAggregator()
      const values = Array.from({ length: 100 }, (_, i) => i + 1)
      const p95 = agg.calculatePercentile(values, 95)
      expect(p95).toBeCloseTo(95.05, 0)
    })

    it('should calculate p99', () => {
      const agg = new MetricAggregator()
      const values = Array.from({ length: 100 }, (_, i) => i + 1)
      const p99 = agg.calculatePercentile(values, 99)
      expect(p99).toBeCloseTo(99.01, 0)
    })

    it('should handle 0th percentile', () => {
      const agg = new MetricAggregator()
      expect(agg.calculatePercentile([10, 20, 30], 0)).toBe(10)
    })

    it('should handle 100th percentile', () => {
      const agg = new MetricAggregator()
      expect(agg.calculatePercentile([10, 20, 30], 100)).toBe(30)
    })
  })

  describe('reset', () => {
    it('should clear all samples and summaries', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample())
      agg.addSample(createSample())
      expect(agg.getSampleCount()).toBe(2)
      agg.reset()
      expect(agg.getSampleCount()).toBe(0)
      expect(agg.getAllSummaries()).toEqual([])
    })

    it('should allow adding samples after reset', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample({ name: 'before' }))
      agg.reset()
      agg.addSample(createSample({ name: 'after', value: 99 }))
      expect(agg.getSampleCount()).toBe(1)
      const summary = agg.getSummary('after')!
      expect(summary.name).toBe('after')
      expect(summary.lastValue).toBe(99)
    })
  })

  describe('getSampleCount', () => {
    it('should return 0 initially', () => {
      const agg = new MetricAggregator()
      expect(agg.getSampleCount()).toBe(0)
    })

    it('should track count across adds', () => {
      const agg = new MetricAggregator()
      agg.addSample(createSample())
      expect(agg.getSampleCount()).toBe(1)
      agg.addSample(createSample())
      expect(agg.getSampleCount()).toBe(2)
    })
  })
})

describe('MetricCollector', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const collector = new MetricCollector()
      const config = collector.getConfig()
      expect(config.maxSamples).toBe(DEFAULT_METRIC_COLLECTOR_CONFIG.maxSamples)
      expect(config.defaultTags).toEqual({})
      expect(config.percentileEnabled).toBe(true)
      collector.destroy()
    })

    it('should merge partial config', () => {
      const collector = new MetricCollector({ maxSamples: 500, defaultTags: { service: 'test' } })
      const config = collector.getConfig()
      expect(config.maxSamples).toBe(500)
      expect(config.defaultTags).toEqual({ service: 'test' })
      expect(config.flushInterval).toBe(DEFAULT_METRIC_COLLECTOR_CONFIG.flushInterval)
      collector.destroy()
    })

    it('should return a copy of config', () => {
      const collector = new MetricCollector({ defaultTags: { a: '1' } })
      const config1 = collector.getConfig()
      config1.defaultTags['b'] = '2'
      const config2 = collector.getConfig()
      expect(config2.defaultTags).toEqual({ a: '1' })
      collector.destroy()
    })
  })

  describe('counter', () => {
    it('should increment counter by default value of 1', () => {
      const collector = new MetricCollector()
      collector.counter('requests')
      const metric = collector.getMetric('requests')!
      expect(metric).not.toBeNull()
      expect(metric.count).toBe(1)
      expect(metric.lastValue).toBe(1)
      collector.destroy()
    })

    it('should increment counter by custom value', () => {
      const collector = new MetricCollector()
      collector.counter('requests', 5)
      const metric = collector.getMetric('requests')!
      expect(metric.lastValue).toBe(5)
      expect(metric.sum).toBe(5)
      collector.destroy()
    })

    it('should accumulate multiple counter calls', () => {
      const collector = new MetricCollector()
      collector.counter('requests', 1)
      collector.counter('requests', 2)
      collector.counter('requests', 3)
      const metric = collector.getMetric('requests')!
      expect(metric.count).toBe(3)
      expect(metric.sum).toBe(6)
      collector.destroy()
    })

    it('should merge default tags', () => {
      const collector = new MetricCollector({ defaultTags: { env: 'prod' } })
      collector.counter('requests')
      const metric = collector.getMetric('requests')!
      expect(metric.tags).toEqual({ env: 'prod' })
      collector.destroy()
    })

    it('should merge custom tags with default tags', () => {
      const collector = new MetricCollector({ defaultTags: { env: 'prod' } })
      collector.counter('requests', 1, { region: 'us' })
      const metric = collector.getMetric('requests')!
      expect(metric.tags).toEqual({ env: 'prod', region: 'us' })
      collector.destroy()
    })

    it('should allow custom tags to override default tags', () => {
      const collector = new MetricCollector({ defaultTags: { env: 'prod' } })
      collector.counter('requests', 1, { env: 'dev' })
      const metric = collector.getMetric('requests')!
      expect(metric.tags.env).toBe('dev')
      collector.destroy()
    })
  })

  describe('gauge', () => {
    it('should record a gauge value', () => {
      const collector = new MetricCollector()
      collector.gauge('memory', 512)
      const metric = collector.getMetric('memory')!
      expect(metric.type).toBe('gauge')
      expect(metric.lastValue).toBe(512)
      collector.destroy()
    })

    it('should track gauge over time', () => {
      const collector = new MetricCollector()
      collector.gauge('memory', 100)
      collector.gauge('memory', 200)
      collector.gauge('memory', 150)
      const metric = collector.getMetric('memory')!
      expect(metric.count).toBe(3)
      expect(metric.lastValue).toBe(150)
      expect(metric.max).toBe(200)
      expect(metric.min).toBe(100)
      collector.destroy()
    })
  })

  describe('histogram', () => {
    it('should record histogram values', () => {
      const collector = new MetricCollector()
      collector.histogram('response_size', 1024)
      const metric = collector.getMetric('response_size')!
      expect(metric.type).toBe('histogram')
      expect(metric.lastValue).toBe(1024)
      collector.destroy()
    })

    it('should compute percentiles for histogram', () => {
      const collector = new MetricCollector()
      for (let i = 1; i <= 100; i++) {
        collector.histogram('response_size', i)
      }
      const metric = collector.getMetric('response_size')!
      expect(metric.p50).toBeCloseTo(50.5, 0)
      expect(metric.p95).toBeCloseTo(95.05, 0)
      expect(metric.count).toBe(100)
      collector.destroy()
    })
  })

  describe('timer', () => {
    it('should measure synchronous execution time', () => {
      const collector = new MetricCollector()
      const result = collector.timer('operation', () => {
        let sum = 0
        for (let i = 0; i < 1000; i++) sum += i
        return sum
      })
      expect(result).toBe(499500)
      const metric = collector.getMetric('operation')!
      expect(metric.type).toBe('timer')
      expect(metric.count).toBe(1)
      expect(metric.lastValue).toBeGreaterThanOrEqual(0)
      collector.destroy()
    })

    it('should record time even when function throws', () => {
      const collector = new MetricCollector()
      expect(() => {
        collector.timer('failing_op', () => {
          throw new Error('test error')
        })
      }).toThrow('test error')
      const metric = collector.getMetric('failing_op')!
      expect(metric.count).toBe(1)
      expect(metric.type).toBe('timer')
      collector.destroy()
    })

    it('should accept tags for timer', () => {
      const collector = new MetricCollector()
      collector.timer('op', () => 42, { handler: 'fast' })
      const metric = collector.getMetric('op')!
      expect(metric.tags).toEqual({ handler: 'fast' })
      collector.destroy()
    })
  })

  describe('timeAsync', () => {
    it('should measure async execution time', async () => {
      const collector = new MetricCollector()
      const result = await collector.timeAsync('async_op', async () => {
        await new Promise((r) => setTimeout(r, 5))
        return 'done'
      })
      expect(result).toBe('done')
      const metric = collector.getMetric('async_op')!
      expect(metric.type).toBe('timer')
      expect(metric.count).toBe(1)
      expect(metric.lastValue).toBeGreaterThanOrEqual(5)
      collector.destroy()
    })

    it('should record time even when async function rejects', async () => {
      const collector = new MetricCollector()
      await expect(
        collector.timeAsync('failing_async', async () => {
          throw new Error('async error')
        }),
      ).rejects.toThrow('async error')
      const metric = collector.getMetric('failing_async')!
      expect(metric.count).toBe(1)
      collector.destroy()
    })

    it('should accept tags for async timer', async () => {
      const collector = new MetricCollector()
      await collector.timeAsync('async_op', async () => 1, { async: 'true' })
      const metric = collector.getMetric('async_op')!
      expect(metric.tags).toEqual({ async: 'true' })
      collector.destroy()
    })
  })

  describe('getMetric', () => {
    it('should return null for unknown metric', () => {
      const collector = new MetricCollector()
      expect(collector.getMetric('unknown')).toBeNull()
      collector.destroy()
    })

    it('should return summary for known metric', () => {
      const collector = new MetricCollector()
      collector.counter('known')
      const metric = collector.getMetric('known')
      expect(metric).not.toBeNull()
      expect(metric!.name).toBe('known')
      collector.destroy()
    })
  })

  describe('getAllMetrics', () => {
    it('should return empty array when no metrics', () => {
      const collector = new MetricCollector()
      expect(collector.getAllMetrics()).toEqual([])
      collector.destroy()
    })

    it('should return all metrics', () => {
      const collector = new MetricCollector()
      collector.counter('a')
      collector.gauge('b', 10)
      collector.histogram('c', 5)
      const metrics = collector.getAllMetrics()
      expect(metrics).toHaveLength(3)
      const names = metrics.map((m) => m.name).sort()
      expect(names).toEqual(['a', 'b', 'c'])
      collector.destroy()
    })
  })

  describe('report', () => {
    it('should generate a report with no metrics', () => {
      const collector = new MetricCollector()
      const report = collector.report()
      expect(report.summaries).toEqual([])
      expect(report.totalSamples).toBe(0)
      expect(report.timeRange).toBeNull()
      expect(report.generatedAt).toBeGreaterThan(0)
      collector.destroy()
    })

    it('should generate a report with metrics', () => {
      const collector = new MetricCollector()
      collector.counter('requests', 10)
      collector.gauge('memory', 512)
      const report = collector.report()
      expect(report.summaries).toHaveLength(2)
      expect(report.totalSamples).toBe(2)
      expect(report.timeRange).not.toBeNull()
      expect(report.generatedAt).toBeGreaterThan(0)
      collector.destroy()
    })

    it('should compute timeRange from samples', () => {
      const collector = new MetricCollector()
      collector.counter('a')
      collector.counter('b')
      const report = collector.report()
      expect(report.timeRange).not.toBeNull()
      expect(report.timeRange!.start).toBeLessThanOrEqual(report.timeRange!.end)
      collector.destroy()
    })
  })

  describe('query', () => {
    it('should pass query to aggregator', () => {
      const collector = new MetricCollector()
      collector.counter('requests')
      collector.gauge('memory', 100)
      const results = collector.query({ type: 'counter' })
      expect(results).toHaveLength(1)
      expect(results[0]!.type).toBe('counter')
      collector.destroy()
    })

    it('should support all query filters', () => {
      const collector = new MetricCollector()
      collector.counter('a', 1, { env: 'prod' })
      collector.counter('b', 2, { env: 'dev' })
      const query: MetricQuery = {
        name: 'a',
        type: 'counter',
        tags: { env: 'prod' },
      }
      const results = collector.query(query)
      expect(results).toHaveLength(1)
      expect(results[0]!.name).toBe('a')
      collector.destroy()
    })
  })

  describe('reset', () => {
    it('should clear all metrics', () => {
      const collector = new MetricCollector()
      collector.counter('a')
      collector.gauge('b', 10)
      collector.reset()
      expect(collector.getMetric('a')).toBeNull()
      expect(collector.getMetric('b')).toBeNull()
      expect(collector.getAllMetrics()).toEqual([])
      collector.destroy()
    })

    it('should allow recording after reset', () => {
      const collector = new MetricCollector()
      collector.counter('before')
      collector.reset()
      collector.counter('after')
      expect(collector.getMetric('before')).toBeNull()
      expect(collector.getMetric('after')).not.toBeNull()
      collector.destroy()
    })
  })

  describe('onFlush and flush', () => {
    it('should register and call flush callback', () => {
      const collector = new MetricCollector()
      let flushedSamples: MetricSample[] = []
      collector.onFlush((samples) => {
        flushedSamples = samples
      })
      collector.counter('a', 1)
      collector.counter('b', 2)
      const result = collector.flush()
      expect(result).toHaveLength(2)
      expect(flushedSamples).toHaveLength(2)
      collector.destroy()
    })

    it('should support multiple flush callbacks', () => {
      const collector = new MetricCollector()
      let count1 = 0
      let count2 = 0
      collector.onFlush(() => { count1++ })
      collector.onFlush(() => { count2++ })
      collector.counter('x')
      collector.flush()
      expect(count1).toBe(1)
      expect(count2).toBe(1)
      collector.destroy()
    })

    it('should return empty array when no samples', () => {
      const collector = new MetricCollector()
      const result = collector.flush()
      expect(result).toEqual([])
      collector.destroy()
    })
  })

  describe('maxSamples enforcement', () => {
    it('should reset aggregator when maxSamples is exceeded', () => {
      const collector = new MetricCollector({ maxSamples: 3 })
      collector.counter('a', 1)
      collector.counter('a', 2)
      collector.counter('a', 3)
      expect(collector.getMetric('a')!.count).toBe(3)
      collector.counter('a', 4)
      expect(collector.getMetric('a')).toBeNull()
      collector.destroy()
    })
  })

  describe('percentile disabled', () => {
    it('should return zero percentiles when percentileEnabled is false', () => {
      const collector = new MetricCollector({ percentileEnabled: false })
      collector.histogram('latency', 100)
      collector.histogram('latency', 200)
      const metric = collector.getMetric('latency')!
      expect(metric.p50).toBe(0)
      expect(metric.p95).toBe(0)
      expect(metric.p99).toBe(0)
      collector.destroy()
    })
  })

  describe('flushInterval', () => {
    it('should not start flush timer when flushInterval is 0', () => {
      const collector = new MetricCollector({ flushInterval: 0 })
      collector.counter('a')
      const config = collector.getConfig()
      expect(config.flushInterval).toBe(0)
      collector.destroy()
    })
  })

  describe('destroy', () => {
    it('should clear flush timer', () => {
      const collector = new MetricCollector({ flushInterval: 100 })
      collector.destroy()
      expect(() => collector.destroy()).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle negative values', () => {
      const collector = new MetricCollector()
      collector.gauge('temperature', -10)
      const metric = collector.getMetric('temperature')!
      expect(metric.lastValue).toBe(-10)
      expect(metric.min).toBe(-10)
      collector.destroy()
    })

    it('should handle zero values', () => {
      const collector = new MetricCollector()
      collector.counter('zero', 0)
      const metric = collector.getMetric('zero')!
      expect(metric.sum).toBe(0)
      expect(metric.avg).toBe(0)
      collector.destroy()
    })

    it('should handle very large values', () => {
      const collector = new MetricCollector()
      collector.counter('big', Number.MAX_SAFE_INTEGER)
      const metric = collector.getMetric('big')!
      expect(metric.lastValue).toBe(Number.MAX_SAFE_INTEGER)
      collector.destroy()
    })

    it('should handle floating point values', () => {
      const collector = new MetricCollector()
      collector.gauge('cpu', 0.123456)
      const metric = collector.getMetric('cpu')!
      expect(metric.lastValue).toBeCloseTo(0.123456, 6)
      collector.destroy()
    })

    it('should handle metric names with special characters', () => {
      const collector = new MetricCollector()
      collector.counter('http.requests.total', 1)
      const metric = collector.getMetric('http.requests.total')!
      expect(metric.name).toBe('http.requests.total')
      collector.destroy()
    })

    it('should handle empty tags object', () => {
      const collector = new MetricCollector()
      collector.counter('notags', 1, {})
      const metric = collector.getMetric('notags')!
      expect(metric.tags).toEqual({})
      collector.destroy()
    })

    it('should handle multiple tags', () => {
      const collector = new MetricCollector()
      collector.counter('multi', 1, { a: '1', b: '2', c: '3' })
      const metric = collector.getMetric('multi')!
      expect(metric.tags).toEqual({ a: '1', b: '2', c: '3' })
      collector.destroy()
    })

    it('should handle timer with fast function', () => {
      const collector = new MetricCollector()
      collector.timer('fast', () => 'instant')
      const metric = collector.getMetric('fast')!
      expect(metric.count).toBe(1)
      expect(metric.lastValue).toBeGreaterThanOrEqual(0)
      collector.destroy()
    })

    it('should handle concurrent counter increments', () => {
      const collector = new MetricCollector()
      for (let i = 0; i < 100; i++) {
        collector.counter('concurrent', 1)
      }
      const metric = collector.getMetric('concurrent')!
      expect(metric.count).toBe(100)
      expect(metric.sum).toBe(100)
      collector.destroy()
    })
  })

  describe('integration', () => {
    it('should collect and report a full workflow', () => {
      const collector = new MetricCollector({ defaultTags: { app: 'codeforge' } })
      collector.counter('files_analyzed', 10)
      collector.counter('files_analyzed', 5)
      collector.gauge('memory_mb', 256)
      collector.histogram('parse_time_ms', 12)
      collector.histogram('parse_time_ms', 15)
      collector.histogram('parse_time_ms', 20)
      collector.timer('total_time', () => {
        let x = 0
        for (let i = 0; i < 100; i++) x += i
        return x
      })

      const report = collector.report()
      expect(report.summaries).toHaveLength(4)
      expect(report.totalSamples).toBe(7)

      const filesMetric = collector.getMetric('files_analyzed')!
      expect(filesMetric.sum).toBe(15)
      expect(filesMetric.count).toBe(2)

      const memoryMetric = collector.getMetric('memory_mb')!
      expect(memoryMetric.lastValue).toBe(256)

      const parseMetric = collector.getMetric('parse_time_ms')!
      expect(parseMetric.min).toBe(12)
      expect(parseMetric.max).toBe(20)

      const totalMetric = collector.getMetric('total_time')!
      expect(totalMetric.type).toBe('timer')
      expect(totalMetric.count).toBe(1)

      collector.destroy()
    })

    it('should support query after collection', () => {
      const collector = new MetricCollector()
      collector.counter('a', 1, { env: 'prod' })
      collector.counter('b', 2, { env: 'dev' })
      collector.counter('a', 3, { env: 'prod' })

      const prodResults = collector.query({ tags: { env: 'prod' } })
      expect(prodResults).toHaveLength(2)

      const aResults = collector.query({ name: 'a' })
      expect(aResults).toHaveLength(2)

      collector.destroy()
    })

    it('should reset and collect fresh data', () => {
      const collector = new MetricCollector()
      collector.counter('old_metric', 100)
      collector.reset()
      expect(collector.getMetric('old_metric')).toBeNull()

      collector.counter('new_metric', 1)
      const metric = collector.getMetric('new_metric')!
      expect(metric.count).toBe(1)
      expect(metric.sum).toBe(1)
      collector.destroy()
    })
  })
})

describe('DEFAULT_METRIC_COLLECTOR_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_METRIC_COLLECTOR_CONFIG.maxSamples).toBe(10000)
    expect(DEFAULT_METRIC_COLLECTOR_CONFIG.defaultTags).toEqual({})
    expect(DEFAULT_METRIC_COLLECTOR_CONFIG.flushInterval).toBe(0)
    expect(DEFAULT_METRIC_COLLECTOR_CONFIG.percentileEnabled).toBe(true)
  })
})
