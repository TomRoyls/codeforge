import { describe, it, expect } from 'vitest'
import { MetricType } from '../../src/core/metrics-export/types.js'
import type { Metric, ExportConfig } from '../../src/core/metrics-export/types.js'
import { MetricsCollector } from '../../src/core/metrics-export/metrics-collector.js'
import { MetricsAggregator } from '../../src/core/metrics-export/metrics-aggregator.js'
import { MetricsExporter } from '../../src/core/metrics-export/metrics-exporter.js'

function makeMetric(overrides: Partial<Metric> = {}): Metric {
  return {
    name: 'test_metric',
    type: MetricType.COUNTER,
    value: 1,
    labels: {},
    timestamp: Date.now(),
    ...overrides,
  }
}

describe('MetricsCollector', () => {
  describe('counter', () => {
    it('should increment a counter', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      const metric = collector.getMetric('codeforge_files_analyzed_total')
      expect(metric).toBeDefined()
      expect(metric!.value).toBe(1)
      expect(metric!.type).toBe(MetricType.COUNTER)
    })

    it('should increment existing counter', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      collector.counter('codeforge_files_analyzed_total')
      collector.counter('codeforge_files_analyzed_total')
      const metric = collector.getMetric('codeforge_files_analyzed_total')
      expect(metric!.value).toBe(3)
    })

    it('should track counter with labels', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_violations_total', { severity: 'error' })
      collector.counter('codeforge_violations_total', { severity: 'warning' })
      collector.counter('codeforge_violations_total', { severity: 'error' })
      const errors = collector.getMetricsByLabel('severity', 'error')
      expect(errors).toHaveLength(1)
      expect(errors[0]!.value).toBe(2)
      const warnings = collector.getMetricsByLabel('severity', 'warning')
      expect(warnings).toHaveLength(1)
      expect(warnings[0]!.value).toBe(1)
    })
  })

  describe('gauge', () => {
    it('should set a gauge value', () => {
      const collector = new MetricsCollector()
      collector.gauge('codeforge_file_complexity', 12.5, { file: 'src/index.ts' })
      const metric = collector.getMetric('codeforge_file_complexity')
      expect(metric).toBeDefined()
      expect(metric!.value).toBe(12.5)
      expect(metric!.type).toBe(MetricType.GAUGE)
    })

    it('should overwrite gauge value', () => {
      const collector = new MetricsCollector()
      collector.gauge('codeforge_file_complexity', 10, { file: 'a.ts' })
      collector.gauge('codeforge_file_complexity', 20, { file: 'a.ts' })
      const metric = collector.getMetric('codeforge_file_complexity')
      expect(metric!.value).toBe(20)
    })

    it('should track different gauge labels separately', () => {
      const collector = new MetricsCollector()
      collector.gauge('codeforge_file_complexity', 5, { file: 'a.ts' })
      collector.gauge('codeforge_file_complexity', 15, { file: 'b.ts' })
      const all = collector.getMetricsByPrefix('codeforge_file_complexity')
      expect(all).toHaveLength(2)
    })
  })

  describe('histogram', () => {
    it('should record histogram observations', () => {
      const collector = new MetricsCollector()
      collector.histogram('codeforge_analysis_duration_seconds', 0.5)
      const metric = collector.getMetric('codeforge_analysis_duration_seconds')
      expect(metric).toBeDefined()
      expect(metric!.value).toBe(0.5)
      expect(metric!.type).toBe(MetricType.HISTOGRAM)
    })

    it('should accumulate histogram values', () => {
      const collector = new MetricsCollector()
      collector.histogram('codeforge_analysis_duration_seconds', 0.1)
      collector.histogram('codeforge_analysis_duration_seconds', 0.2)
      const metric = collector.getMetric('codeforge_analysis_duration_seconds')
      expect(metric!.value).toBeCloseTo(0.3, 10)
    })

    it('should track histogram with labels', () => {
      const collector = new MetricsCollector()
      collector.histogram('codeforge_analysis_duration_seconds', 0.5, { rule: 'complexity' })
      collector.histogram('codeforge_analysis_duration_seconds', 0.3, { rule: 'security' })
      const all = collector.getAllMetrics()
      expect(all).toHaveLength(2)
    })
  })

  describe('timer', () => {
    it('should return a stop function that records elapsed time', () => {
      const collector = new MetricsCollector()
      const stop = collector.timer('codeforge_analysis_duration_seconds')
      const elapsed = stop()
      expect(elapsed).toBeGreaterThanOrEqual(0)
      const metric = collector.getMetric('codeforge_analysis_duration_seconds')
      expect(metric).toBeDefined()
    })

    it('should record timer with labels', () => {
      const collector = new MetricsCollector()
      const stop = collector.timer('codeforge_analysis_duration_seconds', { phase: 'parse' })
      stop()
      const metrics = collector.getMetricsByLabel('phase', 'parse')
      expect(metrics).toHaveLength(1)
    })

    it('should produce non-zero duration for real delays', async () => {
      const collector = new MetricsCollector()
      const stop = collector.timer('codeforge_analysis_duration_seconds')
      await new Promise((r) => setTimeout(r, 50))
      const elapsed = stop()
      expect(elapsed).toBeGreaterThan(0.04)
    })
  })

  describe('getMetric', () => {
    it('should return undefined for non-existent metric', () => {
      const collector = new MetricsCollector()
      expect(collector.getMetric('nonexistent')).toBeUndefined()
    })

    it('should return metric by name', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      expect(collector.getMetric('codeforge_files_analyzed_total')).toBeDefined()
    })
  })

  describe('getAllMetrics', () => {
    it('should return empty array when no metrics', () => {
      const collector = new MetricsCollector()
      expect(collector.getAllMetrics()).toEqual([])
    })

    it('should return all collected metrics', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      collector.gauge('codeforge_file_complexity', 5, { file: 'a.ts' })
      expect(collector.getAllMetrics()).toHaveLength(2)
    })
  })

  describe('getMetricsByPrefix', () => {
    it('should filter metrics by prefix', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      collector.counter('codeforge_rules_executed_total')
      collector.gauge('codeforge_file_complexity', 5, { file: 'a.ts' })
      const result = collector.getMetricsByPrefix('codeforge_file_complexity')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('codeforge_file_complexity')
    })

    it('should return empty array for non-matching prefix', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      expect(collector.getMetricsByPrefix('other_')).toEqual([])
    })
  })

  describe('getMetricsByLabel', () => {
    it('should filter metrics by label key-value', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_violations_total', { severity: 'error' })
      collector.counter('codeforge_violations_total', { severity: 'warning' })
      const errors = collector.getMetricsByLabel('severity', 'error')
      expect(errors).toHaveLength(1)
    })

    it('should return empty array for non-matching label', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      expect(collector.getMetricsByLabel('severity', 'critical')).toEqual([])
    })
  })

  describe('snapshot', () => {
    it('should capture current state as snapshot', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      const snap = collector.snapshot()
      expect(snap.metrics).toHaveLength(1)
      expect(snap.timestamp).toBeGreaterThan(0)
      expect(snap.version).toBe('1.0.0')
      expect(snap.source).toBe('metrics-collector')
    })

    it('should use custom source', () => {
      const collector = new MetricsCollector()
      const snap = collector.snapshot('my-app')
      expect(snap.source).toBe('my-app')
    })
  })

  describe('reset', () => {
    it('should clear all metrics', () => {
      const collector = new MetricsCollector()
      collector.counter('codeforge_files_analyzed_total')
      collector.gauge('codeforge_file_complexity', 5, { file: 'a.ts' })
      expect(collector.getAllMetrics()).toHaveLength(2)
      collector.reset()
      expect(collector.getAllMetrics()).toEqual([])
    })
  })

  describe('built-in metrics', () => {
    it('should auto-register built-in metrics in registry', () => {
      const collector = new MetricsCollector()
      const registry = collector.getRegistry()
      expect(registry.has('codeforge_files_analyzed_total')).toBe(true)
      expect(registry.has('codeforge_violations_total')).toBe(true)
      expect(registry.has('codeforge_analysis_duration_seconds')).toBe(true)
      expect(registry.has('codeforge_file_complexity')).toBe(true)
      expect(registry.has('codeforge_rules_executed_total')).toBe(true)
      expect(registry.has('codeforge_cache_hits_total')).toBe(true)
      expect(registry.has('codeforge_cache_misses_total')).toBe(true)
    })
  })
})

describe('MetricsAggregator', () => {
  const aggregator = new MetricsAggregator()

  describe('aggregate', () => {
    it('should compute stats for named metric', () => {
      const metrics = [
        makeMetric({ name: 'test', value: 2 }),
        makeMetric({ name: 'test', value: 4 }),
        makeMetric({ name: 'test', value: 6 }),
      ]
      const result = aggregator.aggregate(metrics, 'test')
      expect(result.min).toBe(2)
      expect(result.max).toBe(6)
      expect(result.avg).toBe(4)
      expect(result.sum).toBe(12)
      expect(result.count).toBe(3)
    })

    it('should return zeroed result for missing metric', () => {
      const result = aggregator.aggregate([makeMetric({ name: 'other' })], 'test')
      expect(result.count).toBe(0)
      expect(result.sum).toBe(0)
    })

    it('should handle single metric', () => {
      const metrics = [makeMetric({ name: 'test', value: 42 })]
      const result = aggregator.aggregate(metrics, 'test')
      expect(result.min).toBe(42)
      expect(result.max).toBe(42)
      expect(result.avg).toBe(42)
      expect(result.count).toBe(1)
    })

    it('should compute percentiles', () => {
      const metrics = Array.from({ length: 100 }, (_, i) =>
        makeMetric({ name: 'test', value: i + 1 }),
      )
      const result = aggregator.aggregate(metrics, 'test')
      expect(result.percentiles[50]).toBeCloseTo(50.5, 0)
      expect(result.percentiles[95]).toBeCloseTo(95.05, 0)
      expect(result.percentiles[99]).toBeCloseTo(99.01, 0)
    })
  })

  describe('aggregateByLabel', () => {
    it('should group and aggregate by label', () => {
      const metrics = [
        makeMetric({ name: 'test', value: 10, labels: { env: 'prod' } }),
        makeMetric({ name: 'test', value: 20, labels: { env: 'prod' } }),
        makeMetric({ name: 'test', value: 30, labels: { env: 'dev' } }),
      ]
      const result = aggregator.aggregateByLabel(metrics, 'env')
      expect(result.get('prod')).toBeDefined()
      expect(result.get('prod')!.avg).toBe(15)
      expect(result.get('dev')!.avg).toBe(30)
    })

    it('should skip metrics without label', () => {
      const metrics = [
        makeMetric({ name: 'test', value: 10, labels: {} }),
        makeMetric({ name: 'test', value: 20, labels: { env: 'prod' } }),
      ]
      const result = aggregator.aggregateByLabel(metrics, 'env')
      expect(result.size).toBe(1)
    })
  })

  describe('computePercentile', () => {
    it('should compute p50 (median) for odd count', () => {
      const values = [1, 2, 3, 4, 5]
      expect(aggregator.computePercentile(values, 50)).toBe(3)
    })

    it('should compute p95', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1)
      const p95 = aggregator.computePercentile(values, 95)
      expect(p95).toBeGreaterThanOrEqual(95)
      expect(p95).toBeLessThanOrEqual(96)
    })

    it('should compute p99', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1)
      const p99 = aggregator.computePercentile(values, 99)
      expect(p99).toBeGreaterThanOrEqual(99)
      expect(p99).toBeLessThanOrEqual(100)
    })

    it('should return 0 for empty array', () => {
      expect(aggregator.computePercentile([], 50)).toBe(0)
    })

    it('should return single value for single-element array', () => {
      expect(aggregator.computePercentile([42], 50)).toBe(42)
    })
  })

  describe('computeRate', () => {
    it('should compute rate of change over time range', () => {
      const now = Date.now()
      const metrics = [
        makeMetric({ value: 10, timestamp: now - 10000 }),
        makeMetric({ value: 30, timestamp: now }),
      ]
      const rate = aggregator.computeRate(metrics, { from: now - 20000, to: now + 1000 })
      expect(rate).toBeCloseTo(2, 0)
    })

    it('should return 0 for insufficient metrics', () => {
      const now = Date.now()
      const rate = aggregator.computeRate(
        [makeMetric({ value: 10, timestamp: now })],
        { from: now - 10000, to: now },
      )
      expect(rate).toBe(0)
    })

    it('should return 0 for zero duration', () => {
      const now = Date.now()
      const metrics = [
        makeMetric({ value: 10, timestamp: now }),
        makeMetric({ value: 20, timestamp: now }),
      ]
      const rate = aggregator.computeRate(metrics, { from: now - 1000, to: now + 1000 })
      expect(rate).toBe(0)
    })
  })

  describe('computeMovingAverage', () => {
    it('should compute simple moving average', () => {
      const values = [1, 2, 3, 4, 5]
      const result = aggregator.computeMovingAverage(values, 3)
      expect(result).toHaveLength(5)
      expect(result[0]!).toBe(1)
      expect(result[2]!).toBeCloseTo(2, 10)
      expect(result[4]!).toBeCloseTo(4, 10)
    })

    it('should return empty for empty input', () => {
      expect(aggregator.computeMovingAverage([], 3)).toEqual([])
    })

    it('should handle window larger than data', () => {
      const result = aggregator.computeMovingAverage([1, 2], 5)
      expect(result).toHaveLength(2)
      expect(result[0]!).toBe(1)
      expect(result[1]!).toBeCloseTo(1.5, 10)
    })
  })

  describe('trend', () => {
    it('should detect increasing trend', () => {
      const metrics = Array.from({ length: 10 }, (_, i) =>
        makeMetric({ value: i * 10, timestamp: i * 1000 }),
      )
      expect(aggregator.trend(metrics)).toBe('increasing')
    })

    it('should detect decreasing trend', () => {
      const metrics = Array.from({ length: 10 }, (_, i) =>
        makeMetric({ value: 100 - i * 10, timestamp: i * 1000 }),
      )
      expect(aggregator.trend(metrics)).toBe('decreasing')
    })

    it('should detect stable trend', () => {
      const metrics = Array.from({ length: 10 }, (_, i) =>
        makeMetric({ value: 5, timestamp: i * 1000 }),
      )
      expect(aggregator.trend(metrics)).toBe('stable')
    })

    it('should return stable for single metric', () => {
      expect(aggregator.trend([makeMetric({ value: 5 })])).toBe('stable')
    })
  })

  describe('correlation', () => {
    it('should compute positive correlation', () => {
      const m1 = Array.from({ length: 10 }, (_, i) =>
        makeMetric({ value: i, timestamp: i * 1000 }),
      )
      const m2 = Array.from({ length: 10 }, (_, i) =>
        makeMetric({ value: i * 2, timestamp: i * 1000 }),
      )
      const corr = aggregator.correlation(m1, m2)
      expect(corr).toBeCloseTo(1, 5)
    })

    it('should compute negative correlation', () => {
      const m1 = Array.from({ length: 10 }, (_, i) =>
        makeMetric({ value: i, timestamp: i * 1000 }),
      )
      const m2 = Array.from({ length: 10 }, (_, i) =>
        makeMetric({ value: 10 - i, timestamp: i * 1000 }),
      )
      const corr = aggregator.correlation(m1, m2)
      expect(corr).toBeCloseTo(-1, 5)
    })

    it('should return 0 for empty metrics', () => {
      expect(aggregator.correlation([], [makeMetric()])).toBe(0)
      expect(aggregator.correlation([makeMetric()], [])).toBe(0)
    })
  })
})

describe('MetricsExporter', () => {
  describe('prometheus format', () => {
    it('should export metrics in Prometheus text format', () => {
      const exporter = new MetricsExporter({ format: 'prometheus', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [
        makeMetric({ name: 'http_requests', type: MetricType.COUNTER, value: 100, labels: { method: 'GET' } }),
      ]
      const result = exporter.exportPrometheus(metrics)
      expect(result).toContain('# HELP http_requests Counter')
      expect(result).toContain('# TYPE http_requests counter')
      expect(result).toContain('http_requests{method="GET"} 100')
    })

    it('should include timestamps when configured', () => {
      const ts = 1234567890
      const exporter = new MetricsExporter({ format: 'prometheus', includeTimestamps: true, prefix: '', labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'test', value: 1, timestamp: ts })]
      const result = exporter.exportPrometheus(metrics)
      expect(result).toContain(String(ts))
    })

    it('should export metrics without labels', () => {
      const exporter = new MetricsExporter({ format: 'prometheus', includeTimestamps: false, prefix: '', labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'uptime', value: 42, labels: {} })]
      const result = exporter.exportPrometheus(metrics)
      expect(result).toContain('uptime 42')
    })

    it('should return empty string for empty metrics', () => {
      const exporter = new MetricsExporter({ format: 'prometheus' })
      expect(exporter.exportPrometheus([])).toBe('')
    })
  })

  describe('openmetrics format', () => {
    it('should export metrics in OpenMetrics format', () => {
      const exporter = new MetricsExporter({ format: 'openmetrics', includeTimestamps: false, prefix: '', labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'test', type: MetricType.COUNTER, value: 5 })]
      const result = exporter.exportOpenMetrics(metrics)
      expect(result).toContain('# TYPE test counter')
      expect(result).toContain('test 5')
      expect(result).toContain('test_created')
      expect(result).toContain('# EOF')
    })

    it('should add histogram-specific fields', () => {
      const exporter = new MetricsExporter({ format: 'openmetrics', includeTimestamps: false, prefix: '', labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [
        makeMetric({ name: 'duration', type: MetricType.HISTOGRAM, value: 0.1 }),
        makeMetric({ name: 'duration', type: MetricType.HISTOGRAM, value: 0.2, labels: { path: '/api' } }),
      ]
      const result = exporter.exportOpenMetrics(metrics)
      expect(result).toContain('duration_sum')
      expect(result).toContain('duration_count')
    })

    it('should return empty string for empty metrics', () => {
      const exporter = new MetricsExporter({ format: 'openmetrics' })
      expect(exporter.exportOpenMetrics([])).toBe('')
    })
  })

  describe('statsd format', () => {
    it('should export metrics in StatsD format', () => {
      const exporter = new MetricsExporter({ format: 'statsd', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [
        makeMetric({ name: 'requests', type: MetricType.COUNTER, value: 100 }),
        makeMetric({ name: 'memory', type: MetricType.GAUGE, value: 512 }),
      ]
      const result = exporter.exportStatsD(metrics)
      expect(result).toContain('requests:100|c')
      expect(result).toContain('memory:512|g')
    })

    it('should use ms type for histogram', () => {
      const exporter = new MetricsExporter({ format: 'statsd', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'duration', type: MetricType.HISTOGRAM, value: 50 })]
      const result = exporter.exportStatsD(metrics)
      expect(result).toContain('duration:50|ms')
    })

    it('should use h type for summary', () => {
      const exporter = new MetricsExporter({ format: 'statsd', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'latency', type: MetricType.SUMMARY, value: 99 })]
      const result = exporter.exportStatsD(metrics)
      expect(result).toContain('latency:99|h')
    })
  })

  describe('json format', () => {
    it('should export metrics as pretty JSON', () => {
      const exporter = new MetricsExporter({ format: 'json', prefix: '', includeTimestamps: true, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'test', value: 42 })]
      const result = exporter.exportJSON(metrics)
      const parsed = JSON.parse(result)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].value).toBe(42)
      expect(parsed[0].timestamp).toBeDefined()
    })

    it('should omit timestamp when configured', () => {
      const exporter = new MetricsExporter({ format: 'json', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'test', value: 1 })]
      const result = exporter.exportJSON(metrics)
      const parsed = JSON.parse(result)
      expect(parsed[0].timestamp).toBeUndefined()
    })
  })

  describe('csv format', () => {
    it('should export metrics as CSV', () => {
      const exporter = new MetricsExporter({ format: 'csv', prefix: '', includeTimestamps: true, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'test', value: 42, labels: { env: 'prod' } })]
      const result = exporter.exportCSV(metrics)
      const lines = result.split('\n')
      expect(lines[0]).toBe('name,type,value,labels,timestamp')
      expect(lines[1]).toContain('test')
      expect(lines[1]).toContain('42')
    })

    it('should include all metrics as rows', () => {
      const exporter = new MetricsExporter({ format: 'csv', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [
        makeMetric({ name: 'a', value: 1 }),
        makeMetric({ name: 'b', value: 2 }),
      ]
      const result = exporter.exportCSV(metrics)
      const lines = result.split('\n')
      expect(lines).toHaveLength(3)
    })
  })

  describe('export (dispatch)', () => {
    it('should dispatch to correct format', () => {
      const exporter = new MetricsExporter({ format: 'statsd', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'test', value: 1 })]
      const result = exporter.export(metrics)
      expect(result).toContain('test:1|c')
    })
  })

  describe('exportAggregated', () => {
    it('should export aggregated metrics in JSON format', () => {
      const exporter = new MetricsExporter({ format: 'json', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const agg = new Map([
        ['test', { name: 'test', min: 1, max: 10, avg: 5, sum: 15, count: 3, percentiles: { 50: 5, 95: 9, 99: 10 } }],
      ])
      const result = exporter.exportAggregated(agg)
      const parsed = JSON.parse(result)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].avg).toBe(5)
    })

    it('should export aggregated metrics in Prometheus format', () => {
      const exporter = new MetricsExporter({ format: 'prometheus', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const agg = new Map([
        ['test', { name: 'test', min: 1, max: 10, avg: 5, sum: 15, count: 3, percentiles: { 50: 5 } }],
      ])
      const result = exporter.exportAggregated(agg)
      expect(result).toContain('test_min 1')
      expect(result).toContain('test_max 10')
      expect(result).toContain('test_avg 5')
    })

    it('should export aggregated metrics in CSV format', () => {
      const exporter = new MetricsExporter({ format: 'csv', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const agg = new Map([
        ['test', { name: 'test', min: 1, max: 10, avg: 5, sum: 15, count: 3, percentiles: { 50: 5, 95: 9, 99: 10 } }],
      ])
      const result = exporter.exportAggregated(agg)
      expect(result).toContain('name,min,max')
      expect(result).toContain('test,1,10')
    })

    it('should export aggregated metrics in StatsD format', () => {
      const exporter = new MetricsExporter({ format: 'statsd', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const agg = new Map([
        ['test', { name: 'test', min: 1, max: 10, avg: 5, sum: 15, count: 3, percentiles: {} }],
      ])
      const result = exporter.exportAggregated(agg)
      expect(result).toContain('test_min:1|g')
      expect(result).toContain('test_count:3|c')
    })
  })

  describe('addPrefix', () => {
    it('should prepend prefix with underscore', () => {
      const exporter = new MetricsExporter({ format: 'prometheus', prefix: 'myapp', includeTimestamps: true, labelSeparator: ',', metricSeparator: '\n' })
      expect(exporter.addPrefix('requests')).toBe('myapp_requests')
    })

    it('should not double underscore if prefix ends with one', () => {
      const exporter = new MetricsExporter({ format: 'prometheus', prefix: 'myapp_', includeTimestamps: true, labelSeparator: ',', metricSeparator: '\n' })
      expect(exporter.addPrefix('requests')).toBe('myapp_requests')
    })

    it('should return name unchanged when no prefix', () => {
      const exporter = new MetricsExporter({ format: 'prometheus', prefix: '', includeTimestamps: true, labelSeparator: ',', metricSeparator: '\n' })
      expect(exporter.addPrefix('requests')).toBe('requests')
    })

    it('should apply prefix in exported output', () => {
      const exporter = new MetricsExporter({ format: 'prometheus', prefix: 'myapp', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
      const metrics = [makeMetric({ name: 'requests', value: 5, labels: {} })]
      const result = exporter.exportPrometheus(metrics)
      expect(result).toContain('myapp_requests')
    })
  })

  describe('getConfig', () => {
    it('should return copy of config', () => {
      const config: Partial<ExportConfig> = { format: 'json', prefix: 'test', includeTimestamps: true, labelSeparator: ',', metricSeparator: '\n' }
      const exporter = new MetricsExporter(config)
      const returned = exporter.getConfig()
      expect(returned.format).toBe('json')
      expect(returned.prefix).toBe('test')
    })
  })
})

describe('Edge cases', () => {
  it('should handle empty metrics in all export formats', () => {
    const configs: Partial<ExportConfig>[] = [
      { format: 'prometheus', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' },
      { format: 'openmetrics', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' },
      { format: 'statsd', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' },
      { format: 'csv', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' },
    ]
    for (const config of configs) {
      const exporter = new MetricsExporter(config)
      const result = exporter.export([])
      if (config.format === 'csv') {
        expect(result).toBe('name,type,value,labels,timestamp')
      } else if (config.format === 'json') {
        expect(JSON.parse(result)).toEqual([])
      } else {
        expect(result).toBe('')
      }
    }
  })

  it('should handle very large values', () => {
    const exporter = new MetricsExporter({ format: 'prometheus', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
    const metrics = [makeMetric({ name: 'huge', value: Number.MAX_SAFE_INTEGER })]
    const result = exporter.exportPrometheus(metrics)
    expect(result).toContain(String(Number.MAX_SAFE_INTEGER))
  })

  it('should handle special characters in metric names', () => {
    const exporter = new MetricsExporter({ format: 'prometheus', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
    const metrics = [makeMetric({ name: 'my_metric_name', value: 1 })]
    const result = exporter.exportPrometheus(metrics)
    expect(result).toContain('my_metric_name')
  })

  it('should handle multiple labels in Prometheus format', () => {
    const exporter = new MetricsExporter({ format: 'prometheus', prefix: '', includeTimestamps: false, labelSeparator: ',', metricSeparator: '\n' })
    const metrics = [makeMetric({ name: 'requests', value: 1, labels: { method: 'GET', path: '/api' } })]
    const result = exporter.exportPrometheus(metrics)
    expect(result).toContain('method="GET"')
    expect(result).toContain('path="/api"')
  })

  it('should handle correlation with constant values', () => {
    const aggregator = new MetricsAggregator()
    const m1 = Array.from({ length: 5 }, () => makeMetric({ value: 5 }))
    const m2 = Array.from({ length: 5 }, () => makeMetric({ value: 10 }))
    const corr = aggregator.correlation(m1, m2)
    expect(corr).toBe(0)
  })

  it('should handle aggregator with no matching metrics', () => {
    const aggregator = new MetricsAggregator()
    const result = aggregator.aggregate([makeMetric({ name: 'other' })], 'nonexistent')
    expect(result.count).toBe(0)
    expect(result.min).toBe(0)
    expect(result.max).toBe(0)
  })

  it('should handle JSON empty array', () => {
    const exporter = new MetricsExporter({ format: 'json', prefix: '', includeTimestamps: true, labelSeparator: ',', metricSeparator: '\n' })
    const result = exporter.exportJSON([])
    expect(JSON.parse(result)).toEqual([])
  })
})
