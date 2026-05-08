import { describe, it, expect } from 'vitest'
import { TimeSeries } from '../../src/core/metrics-dashboard/time-series.js'
import { MetricsDashboard } from '../../src/core/metrics-dashboard/metrics-dashboard.js'
import type { MetricDataPoint, MetricSeries, HealthCheck } from '../../src/core/metrics-dashboard/types.js'

function makePoint(overrides: Partial<MetricDataPoint> = {}): MetricDataPoint {
  return {
    timestamp: Date.now(),
    value: 1,
    tags: {},
    ...overrides,
  }
}

describe('TimeSeries', () => {
  let ts: TimeSeries

  beforeEach(() => {
    ts = new TimeSeries()
  })

  describe('addPoint', () => {
    it('should add a point to a new series', () => {
      ts.addPoint('cpu', makePoint({ value: 50 }))
      const series = ts.getSeries('cpu')
      expect(series).toBeDefined()
      expect(series!.points.length).toBe(1)
      expect(series!.points[0]!.value).toBe(50)
    })

    it('should add multiple points to the same series', () => {
      ts.addPoint('cpu', makePoint({ value: 10 }))
      ts.addPoint('cpu', makePoint({ value: 20 }))
      expect(ts.getSeries('cpu')!.points.length).toBe(2)
    })

    it('should maintain sorted order by timestamp', () => {
      ts.addPoint('cpu', makePoint({ timestamp: 300, value: 30 }))
      ts.addPoint('cpu', makePoint({ timestamp: 100, value: 10 }))
      ts.addPoint('cpu', makePoint({ timestamp: 200, value: 20 }))
      const points = ts.getSeries('cpu')!.points
      expect(points[0]!.value).toBe(10)
      expect(points[1]!.value).toBe(20)
      expect(points[2]!.value).toBe(30)
    })

    it('should create series with empty unit', () => {
      ts.addPoint('mem', makePoint())
      expect(ts.getSeries('mem')!.unit).toBe('')
    })

    it('should store tags on points', () => {
      ts.addPoint('cpu', makePoint({ tags: { host: 'server1' } }))
      expect(ts.getSeries('cpu')!.points[0]!.tags.host).toBe('server1')
    })
  })

  describe('getSeries', () => {
    it('should return undefined for non-existent series', () => {
      expect(ts.getSeries('missing')).toBeUndefined()
    })

    it('should return series when it exists', () => {
      ts.addPoint('cpu', makePoint())
      expect(ts.getSeries('cpu')).toBeDefined()
      expect(ts.getSeries('cpu')!.name).toBe('cpu')
    })
  })

  describe('getAllSeries', () => {
    it('should return empty array when no series exist', () => {
      expect(ts.getAllSeries()).toEqual([])
    })

    it('should return all series', () => {
      ts.addPoint('cpu', makePoint())
      ts.addPoint('mem', makePoint())
      ts.addPoint('disk', makePoint())
      expect(ts.getAllSeries().length).toBe(3)
    })

    it('should return MetricSeries objects', () => {
      ts.addPoint('cpu', makePoint())
      const all = ts.getAllSeries()
      expect(all[0]!.name).toBe('cpu')
      expect(Array.isArray(all[0]!.points)).toBe(true)
    })
  })

  describe('bucketize', () => {
    it('should return empty for non-existent series', () => {
      expect(ts.bucketize('missing', 1000)).toEqual([])
    })

    it('should return empty for series with no points', () => {
      ts.addPoint('cpu', makePoint({ value: 1 }))
      ts.removeSeries('cpu')
      expect(ts.bucketize('cpu', 1000)).toEqual([])
    })

    it('should create buckets based on bucket size', () => {
      ts.addPoint('cpu', makePoint({ timestamp: 1000, value: 10 }))
      ts.addPoint('cpu', makePoint({ timestamp: 1500, value: 20 }))
      ts.addPoint('cpu', makePoint({ timestamp: 2500, value: 30 }))
      const buckets = ts.bucketize('cpu', 1000)
      expect(buckets.length).toBe(2)
    })

    it('should compute bucket aggregates correctly', () => {
      ts.addPoint('cpu', makePoint({ timestamp: 1000, value: 10 }))
      ts.addPoint('cpu', makePoint({ timestamp: 1200, value: 30 }))
      const buckets = ts.bucketize('cpu', 1000)
      expect(buckets.length).toBe(1)
      expect(buckets[0]!.count).toBe(2)
      expect(buckets[0]!.sum).toBe(40)
      expect(buckets[0]!.avg).toBe(20)
      expect(buckets[0]!.min).toBe(10)
      expect(buckets[0]!.max).toBe(30)
      expect(buckets[0]!.start).toBe(1000)
      expect(buckets[0]!.end).toBe(2000)
    })

    it('should separate points into different buckets', () => {
      ts.addPoint('cpu', makePoint({ timestamp: 1000, value: 10 }))
      ts.addPoint('cpu', makePoint({ timestamp: 3000, value: 50 }))
      const buckets = ts.bucketize('cpu', 2000)
      expect(buckets.length).toBe(2)
      expect(buckets[0]!.avg).toBe(10)
      expect(buckets[1]!.avg).toBe(50)
    })
  })

  describe('prune', () => {
    it('should remove points older than threshold', () => {
      const now = Date.now()
      ts.addPoint('cpu', makePoint({ timestamp: now - 2000, value: 10 }))
      ts.addPoint('cpu', makePoint({ timestamp: now - 500, value: 20 }))
      ts.prune(1000)
      const series = ts.getSeries('cpu')!
      expect(series.points.length).toBe(1)
      expect(series.points[0]!.value).toBe(20)
    })

    it('should not remove recent points', () => {
      const now = Date.now()
      ts.addPoint('cpu', makePoint({ timestamp: now - 100, value: 10 }))
      ts.prune(1000)
      expect(ts.getSeries('cpu')!.points.length).toBe(1)
    })

    it('should handle pruning all points', () => {
      const now = Date.now()
      ts.addPoint('cpu', makePoint({ timestamp: now - 5000, value: 10 }))
      ts.prune(1000)
      expect(ts.getSeries('cpu')!.points.length).toBe(0)
    })

    it('should handle pruning when no points exist', () => {
      ts.prune(1000)
      expect(ts.getAllSeries().length).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return undefined for non-existent series', () => {
      expect(ts.getStats('missing')).toBeUndefined()
    })

    it('should return undefined for empty series', () => {
      const series = ts.getSeries('cpu')
      expect(series).toBeUndefined()
      expect(ts.getStats('cpu')).toBeUndefined()
    })

    it('should compute count', () => {
      ts.addPoint('cpu', makePoint({ value: 10 }))
      ts.addPoint('cpu', makePoint({ value: 20 }))
      ts.addPoint('cpu', makePoint({ value: 30 }))
      expect(ts.getStats('cpu')!.count).toBe(3)
    })

    it('should compute sum', () => {
      ts.addPoint('cpu', makePoint({ value: 10 }))
      ts.addPoint('cpu', makePoint({ value: 20 }))
      ts.addPoint('cpu', makePoint({ value: 30 }))
      expect(ts.getStats('cpu')!.sum).toBe(60)
    })

    it('should compute avg', () => {
      ts.addPoint('cpu', makePoint({ value: 10 }))
      ts.addPoint('cpu', makePoint({ value: 20 }))
      expect(ts.getStats('cpu')!.avg).toBe(15)
    })

    it('should compute min and max', () => {
      ts.addPoint('cpu', makePoint({ value: 5 }))
      ts.addPoint('cpu', makePoint({ value: 15 }))
      ts.addPoint('cpu', makePoint({ value: 10 }))
      const stats = ts.getStats('cpu')!
      expect(stats.min).toBe(5)
      expect(stats.max).toBe(15)
    })

    it('should compute p50', () => {
      ts.addPoint('cpu', makePoint({ value: 10 }))
      ts.addPoint('cpu', makePoint({ value: 20 }))
      ts.addPoint('cpu', makePoint({ value: 30 }))
      expect(ts.getStats('cpu')!.p50).toBe(20)
    })

    it('should compute p95', () => {
      for (let i = 1; i <= 100; i++) {
        ts.addPoint('cpu', makePoint({ value: i }))
      }
      const stats = ts.getStats('cpu')!
      expect(stats.p95).toBeCloseTo(95.05, 0)
    })

    it('should compute p99', () => {
      for (let i = 1; i <= 100; i++) {
        ts.addPoint('cpu', makePoint({ value: i }))
      }
      const stats = ts.getStats('cpu')!
      expect(stats.p99).toBeCloseTo(99.01, 0)
    })

    it('should handle single point', () => {
      ts.addPoint('cpu', makePoint({ value: 42 }))
      const stats = ts.getStats('cpu')!
      expect(stats.count).toBe(1)
      expect(stats.sum).toBe(42)
      expect(stats.avg).toBe(42)
      expect(stats.min).toBe(42)
      expect(stats.max).toBe(42)
      expect(stats.p50).toBe(42)
      expect(stats.p95).toBe(42)
      expect(stats.p99).toBe(42)
    })
  })

  describe('getSparkline', () => {
    it('should return empty string for non-existent series', () => {
      expect(ts.getSparkline('missing')).toBe('')
    })

    it('should return sparkline characters', () => {
      ts.addPoint('v', makePoint({ value: 0 }))
      ts.addPoint('v', makePoint({ value: 50 }))
      ts.addPoint('v', makePoint({ value: 100 }))
      const sparkline = ts.getSparkline('v')
      expect(sparkline.length).toBe(3)
      expect(sparkline).toContain('\u2581')
      expect(sparkline).toContain('\u2588')
    })

    it('should use default width of 20', () => {
      for (let i = 0; i < 50; i++) {
        ts.addPoint('v', makePoint({ value: i }))
      }
      const sparkline = ts.getSparkline('v')
      expect(sparkline.length).toBe(20)
    })

    it('should respect custom width', () => {
      for (let i = 0; i < 50; i++) {
        ts.addPoint('v', makePoint({ value: i }))
      }
      const sparkline = ts.getSparkline('v', 10)
      expect(sparkline.length).toBe(10)
    })

    it('should handle all same values', () => {
      ts.addPoint('v', makePoint({ value: 5 }))
      ts.addPoint('v', makePoint({ value: 5 }))
      ts.addPoint('v', makePoint({ value: 5 }))
      const sparkline = ts.getSparkline('v')
      expect(sparkline).toBe('\u2585\u2585\u2585')
    })

    it('should return short sparkline when fewer points than width', () => {
      ts.addPoint('v', makePoint({ value: 0 }))
      ts.addPoint('v', makePoint({ value: 100 }))
      const sparkline = ts.getSparkline('v', 20)
      expect(sparkline.length).toBe(2)
    })

    it('should map low values to first character', () => {
      ts.addPoint('v', makePoint({ value: 0 }))
      ts.addPoint('v', makePoint({ value: 100 }))
      const sparkline = ts.getSparkline('v')
      expect(sparkline[0]).toBe('\u2581')
    })

    it('should map high values to last character', () => {
      ts.addPoint('v', makePoint({ value: 0 }))
      ts.addPoint('v', makePoint({ value: 100 }))
      const sparkline = ts.getSparkline('v')
      expect(sparkline[sparkline.length - 1]).toBe('\u2588')
    })
  })

  describe('removeSeries', () => {
    it('should remove an existing series', () => {
      ts.addPoint('cpu', makePoint())
      expect(ts.removeSeries('cpu')).toBe(true)
      expect(ts.getSeries('cpu')).toBeUndefined()
    })

    it('should return false for non-existent series', () => {
      expect(ts.removeSeries('missing')).toBe(false)
    })

    it('should not affect other series', () => {
      ts.addPoint('cpu', makePoint())
      ts.addPoint('mem', makePoint())
      ts.removeSeries('cpu')
      expect(ts.getSeries('cpu')).toBeUndefined()
      expect(ts.getSeries('mem')).toBeDefined()
    })
  })
})

describe('MetricsDashboard', () => {
  let dashboard: MetricsDashboard

  beforeEach(() => {
    dashboard = new MetricsDashboard()
  })

  describe('constructor', () => {
    it('should create dashboard with default config', () => {
      const config = dashboard.getConfig()
      expect(config.retentionPeriod).toBe(3600000)
      expect(config.bucketSize).toBe(60000)
      expect(config.maxSeries).toBe(100)
    })

    it('should accept custom config', () => {
      const custom = new MetricsDashboard({
        retentionPeriod: 7200000,
        bucketSize: 30000,
        maxSeries: 50,
      })
      const config = custom.getConfig()
      expect(config.retentionPeriod).toBe(7200000)
      expect(config.bucketSize).toBe(30000)
      expect(config.maxSeries).toBe(50)
    })

    it('should allow partial config overrides', () => {
      const custom = new MetricsDashboard({ bucketSize: 5000 })
      const config = custom.getConfig()
      expect(config.bucketSize).toBe(5000)
      expect(config.retentionPeriod).toBe(3600000)
      expect(config.maxSeries).toBe(100)
    })
  })

  describe('record', () => {
    it('should record a metric value', () => {
      dashboard.record('cpu', 50)
      const series = dashboard.getSeries('cpu')
      expect(series).toBeDefined()
      expect(series!.points.length).toBe(1)
      expect(series!.points[0]!.value).toBe(50)
    })

    it('should record with tags', () => {
      dashboard.record('cpu', 50, { host: 'server1' })
      const series = dashboard.getSeries('cpu')
      expect(series!.points[0]!.tags.host).toBe('server1')
    })

    it('should record multiple values for same metric', () => {
      dashboard.record('cpu', 10)
      dashboard.record('cpu', 20)
      dashboard.record('cpu', 30)
      expect(dashboard.getSeries('cpu')!.points.length).toBe(3)
    })

    it('should default tags to empty object', () => {
      dashboard.record('cpu', 50)
      expect(dashboard.getSeries('cpu')!.points[0]!.tags).toEqual({})
    })

    it('should set timestamp on points', () => {
      const before = Date.now()
      dashboard.record('cpu', 50)
      const after = Date.now()
      const ts = dashboard.getSeries('cpu')!.points[0]!.timestamp
      expect(ts).toBeGreaterThanOrEqual(before)
      expect(ts).toBeLessThanOrEqual(after)
    })
  })

  describe('getSeries', () => {
    it('should return undefined for unrecorded metric', () => {
      expect(dashboard.getSeries('missing')).toBeUndefined()
    })

    it('should return series for recorded metric', () => {
      dashboard.record('cpu', 50)
      const series = dashboard.getSeries('cpu')
      expect(series!.name).toBe('cpu')
    })
  })

  describe('getStats', () => {
    it('should return undefined for unrecorded metric', () => {
      expect(dashboard.getStats('missing')).toBeUndefined()
    })

    it('should return stats for recorded metric', () => {
      dashboard.record('cpu', 10)
      dashboard.record('cpu', 20)
      dashboard.record('cpu', 30)
      const stats = dashboard.getStats('cpu')!
      expect(stats.count).toBe(3)
      expect(stats.sum).toBe(60)
      expect(stats.avg).toBe(20)
    })
  })

  describe('getSparkline', () => {
    it('should return empty string for unrecorded metric', () => {
      expect(dashboard.getSparkline('missing')).toBe('')
    })

    it('should return sparkline for recorded metric', () => {
      dashboard.record('cpu', 10)
      dashboard.record('cpu', 50)
      dashboard.record('cpu', 90)
      const sparkline = dashboard.getSparkline('cpu')
      expect(sparkline.length).toBe(3)
      expect(sparkline).toContain('\u2581')
      expect(sparkline).toContain('\u2588')
    })
  })

  describe('getBuckets', () => {
    it('should use default bucket size', () => {
      const now = Date.now()
      dashboard.record('cpu', 10)
      const buckets = dashboard.getBuckets('cpu')
      expect(buckets.length).toBe(1)
    })

    it('should use custom bucket size', () => {
      const now = Date.now()
      dashboard.record('cpu', 10)
      dashboard.record('cpu', 20)
      const buckets = dashboard.getBuckets('cpu', 1000)
      expect(buckets.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty for unrecorded metric', () => {
      expect(dashboard.getBuckets('missing')).toEqual([])
    })
  })

  describe('registerHealthCheck', () => {
    it('should register a health check', () => {
      const check: HealthCheck = {
        name: 'cpu_high',
        check: (series: MetricSeries) => {
          const avg = series.points.reduce((s, p) => s + p.value, 0) / series.points.length
          return avg < 80
        },
        status: 'unhealthy',
      }
      dashboard.registerHealthCheck(check)
      dashboard.record('cpu_high', 50)
      const health = dashboard.getHealth()
      expect(health.get('cpu_high')).toBe('healthy')
    })

    it('should register multiple health checks', () => {
      dashboard.registerHealthCheck({
        name: 'check1',
        check: () => true,
        status: 'unhealthy',
      })
      dashboard.registerHealthCheck({
        name: 'check2',
        check: () => false,
        status: 'degraded',
      })
      dashboard.record('check1', 1)
      dashboard.record('check2', 1)
      const health = dashboard.getHealth()
      expect(health.get('check1')).toBe('healthy')
      expect(health.get('check2')).toBe('degraded')
    })
  })

  describe('getHealth', () => {
    it('should return empty map with no checks', () => {
      const health = dashboard.getHealth()
      expect(health.size).toBe(0)
    })

    it('should return unknown for check with no data', () => {
      dashboard.registerHealthCheck({
        name: 'cpu_high',
        check: () => true,
        status: 'unhealthy',
      })
      const health = dashboard.getHealth()
      expect(health.get('cpu_high')).toBe('unknown')
    })

    it('should return healthy when check passes', () => {
      dashboard.registerHealthCheck({
        name: 'cpu_high',
        check: (s: MetricSeries) => s.points[0]!.value < 80,
        status: 'unhealthy',
      })
      dashboard.record('cpu_high', 50)
      expect(dashboard.getHealth().get('cpu_high')).toBe('healthy')
    })

    it('should return configured status when check fails', () => {
      dashboard.registerHealthCheck({
        name: 'cpu_high',
        check: (s: MetricSeries) => s.points[0]!.value < 80,
        status: 'degraded',
      })
      dashboard.record('cpu_high', 90)
      expect(dashboard.getHealth().get('cpu_high')).toBe('degraded')
    })

    it('should return unhealthy when configured', () => {
      dashboard.registerHealthCheck({
        name: 'disk_full',
        check: (s: MetricSeries) => s.points[0]!.value < 90,
        status: 'unhealthy',
      })
      dashboard.record('disk_full', 95)
      expect(dashboard.getHealth().get('disk_full')).toBe('unhealthy')
    })
  })

  describe('getOverallHealth', () => {
    it('should return unknown with no checks', () => {
      expect(dashboard.getOverallHealth()).toBe('unknown')
    })

    it('should return healthy when all checks pass', () => {
      dashboard.registerHealthCheck({
        name: 'cpu',
        check: () => true,
        status: 'unhealthy',
      })
      dashboard.record('cpu', 1)
      expect(dashboard.getOverallHealth()).toBe('healthy')
    })

    it('should return degraded when any check is degraded', () => {
      dashboard.registerHealthCheck({
        name: 'cpu',
        check: () => true,
        status: 'unhealthy',
      })
      dashboard.registerHealthCheck({
        name: 'mem',
        check: () => false,
        status: 'degraded',
      })
      dashboard.record('cpu', 1)
      dashboard.record('mem', 1)
      expect(dashboard.getOverallHealth()).toBe('degraded')
    })

    it('should return unhealthy when any check is unhealthy', () => {
      dashboard.registerHealthCheck({
        name: 'cpu',
        check: () => true,
        status: 'degraded',
      })
      dashboard.registerHealthCheck({
        name: 'disk',
        check: () => false,
        status: 'unhealthy',
      })
      dashboard.record('cpu', 1)
      dashboard.record('disk', 1)
      expect(dashboard.getOverallHealth()).toBe('unhealthy')
    })

    it('should return worst status overall', () => {
      dashboard.registerHealthCheck({
        name: 'a',
        check: () => false,
        status: 'degraded',
      })
      dashboard.registerHealthCheck({
        name: 'b',
        check: () => false,
        status: 'unhealthy',
      })
      dashboard.registerHealthCheck({
        name: 'c',
        check: () => true,
        status: 'unhealthy',
      })
      dashboard.record('a', 1)
      dashboard.record('b', 1)
      dashboard.record('c', 1)
      expect(dashboard.getOverallHealth()).toBe('unhealthy')
    })
  })

  describe('getAllMetrics', () => {
    it('should return empty array with no metrics', () => {
      expect(dashboard.getAllMetrics()).toEqual([])
    })

    it('should return all metric names', () => {
      dashboard.record('cpu', 50)
      dashboard.record('mem', 80)
      dashboard.record('disk', 40)
      const metrics = dashboard.getAllMetrics()
      expect(metrics).toContain('cpu')
      expect(metrics).toContain('mem')
      expect(metrics).toContain('disk')
      expect(metrics.length).toBe(3)
    })
  })

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const config1 = dashboard.getConfig()
      const config2 = dashboard.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })

    it('should return correct default values', () => {
      const config = dashboard.getConfig()
      expect(config.retentionPeriod).toBe(3600000)
      expect(config.bucketSize).toBe(60000)
      expect(config.maxSeries).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('should handle negative values in stats', () => {
      dashboard.record('delta', -10)
      dashboard.record('delta', 5)
      dashboard.record('delta', 15)
      const stats = dashboard.getStats('delta')!
      expect(stats.min).toBe(-10)
      expect(stats.max).toBe(15)
      expect(stats.sum).toBe(10)
    })

    it('should handle zero values in stats', () => {
      dashboard.record('zeros', 0)
      dashboard.record('zeros', 0)
      dashboard.record('zeros', 0)
      const stats = dashboard.getStats('zeros')!
      expect(stats.count).toBe(3)
      expect(stats.avg).toBe(0)
      expect(stats.min).toBe(0)
      expect(stats.max).toBe(0)
    })

    it('should handle sparkline with all same zero values', () => {
      dashboard.record('flat', 42)
      dashboard.record('flat', 42)
      dashboard.record('flat', 42)
      const sparkline = dashboard.getSparkline('flat')
      expect(sparkline.length).toBe(3)
      expect(sparkline).toBe('\u2585\u2585\u2585')
    })

    it('should handle bucketize with single point', () => {
      dashboard.record('cpu', 75)
      const buckets = dashboard.getBuckets('cpu')
      expect(buckets.length).toBe(1)
      expect(buckets[0]!.count).toBe(1)
      expect(buckets[0]!.avg).toBe(75)
    })

    it('should handle getOverallHealth with only unknown checks', () => {
      dashboard.registerHealthCheck({
        name: 'unchecked',
        check: () => true,
        status: 'unhealthy',
      })
      expect(dashboard.getOverallHealth()).toBe('unknown')
    })

    it('should handle recording multiple different metrics', () => {
      dashboard.record('cpu', 10)
      dashboard.record('mem', 20)
      dashboard.record('disk', 30)
      dashboard.record('network', 40)
      expect(dashboard.getAllMetrics().length).toBe(4)
    })

    it('should handle health check with average-based logic', () => {
      dashboard.registerHealthCheck({
        name: 'response_time',
        check: (s: MetricSeries) => {
          const avg = s.points.reduce((sum, p) => sum + p.value, 0) / s.points.length
          return avg < 200
        },
        status: 'degraded',
      })
      dashboard.record('response_time', 100)
      dashboard.record('response_time', 150)
      dashboard.record('response_time', 120)
      expect(dashboard.getHealth().get('response_time')).toBe('healthy')
    })

    it('should handle health check failing with average-based logic', () => {
      dashboard.registerHealthCheck({
        name: 'response_time',
        check: (s: MetricSeries) => {
          const avg = s.points.reduce((sum, p) => sum + p.value, 0) / s.points.length
          return avg < 100
        },
        status: 'degraded',
      })
      dashboard.record('response_time', 200)
      dashboard.record('response_time', 300)
      expect(dashboard.getHealth().get('response_time')).toBe('degraded')
    })
  })
})
