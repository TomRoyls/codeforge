import type {
  TelemetryReport,
  MetricPoint,
  MetricSummary,
  PerformanceEntry,
} from './types.js'
import type { TelemetryCollector } from './telemetry-collector.js'
import type { MetricsRecorder } from './metrics-recorder.js'

export class TelemetryReporter {
  private performanceEntries: PerformanceEntry[] = []

  generateReport(
    collector: TelemetryCollector,
    recorder: MetricsRecorder,
  ): TelemetryReport {
    const events = collector.getEvents()
    const allMetrics = recorder.getAllMetrics()
    const sessionId = collector.getSessionId() ?? 'no-session'
    const sessionStart = collector.getSessionStartTime()
    const duration = sessionStart > 0 ? Date.now() - sessionStart : 0

    let metricCount = 0
    const metricsSummary: MetricSummary[] = []
    for (const [, points] of allMetrics) {
      metricCount += points.length
      if (points.length > 0) {
        const summary = recorder.getSummary(points[0]!.name)
        if (summary) metricsSummary.push(summary)
      }
    }

    return {
      sessionId,
      duration,
      eventCount: events.length,
      metricCount,
      topEvents: this.getTopEvents(events, 10),
      metricsSummary,
      generatedAt: Date.now(),
    }
  }

  getTopEvents(
    events: Array<{ name: string }>,
    count: number,
  ): Array<{ name: string; count: number }> {
    const counts = new Map<string, number>()
    for (const event of events) {
      counts.set(event.name, (counts.get(event.name) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, cnt]) => ({ name, count: cnt }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count)
  }

  summarizeMetrics(points: MetricPoint[]): MetricSummary[] {
    const grouped = new Map<string, MetricPoint[]>()
    for (const point of points) {
      const existing = grouped.get(point.name)
      if (existing) {
        existing.push(point)
      } else {
        grouped.set(point.name, [point])
      }
    }

    const summaries: MetricSummary[] = []
    for (const [name, pts] of grouped) {
      const values = pts.map((p) => p.value)
      const sorted = [...values].sort((a, b) => a - b)
      const count = sorted.length
      const sum = sorted.reduce((a, b) => a + b, 0)
      const min = sorted[0]!
      const max = sorted[count - 1]!
      const mean = sum / count

      summaries.push({
        name,
        count,
        sum,
        min,
        max,
        mean,
        p50: this.percentile(sorted, 50),
        p95: this.percentile(sorted, 95),
        p99: this.percentile(sorted, 99),
      })
    }
    return summaries
  }

  formatReport(report: TelemetryReport): string {
    const lines: string[] = []
    lines.push('=== Telemetry Report ===')
    lines.push(`Session ID: ${report.sessionId}`)
    lines.push(`Duration: ${report.duration}ms`)
    lines.push(`Events: ${report.eventCount}`)
    lines.push(`Metrics: ${report.metricCount}`)
    lines.push('')

    if (report.topEvents.length > 0) {
      lines.push('Top Events:')
      for (const event of report.topEvents) {
        lines.push(`  ${event.name}: ${event.count}`)
      }
      lines.push('')
    }

    if (report.metricsSummary.length > 0) {
      lines.push('Metrics Summary:')
      for (const summary of report.metricsSummary) {
        lines.push(
          `  ${summary.name}: count=${summary.count} mean=${summary.mean.toFixed(2)} min=${summary.min} max=${summary.max} p50=${summary.p50.toFixed(2)} p95=${summary.p95.toFixed(2)} p99=${summary.p99.toFixed(2)}`,
        )
      }
    }

    return lines.join('\n')
  }

  toJSON(report: TelemetryReport): string {
    return JSON.stringify(report, null, 2)
  }

  toCSV(metrics: MetricSummary[]): string {
    const header =
      'name,count,sum,min,max,mean,p50,p95,p99'
    const rows = metrics.map(
      (m) =>
        `${m.name},${m.count},${m.sum},${m.min},${m.max},${m.mean.toFixed(2)},${m.p50.toFixed(2)},${m.p95.toFixed(2)},${m.p99.toFixed(2)}`,
    )
    return [header, ...rows].join('\n')
  }

  getPerformanceEntries(): PerformanceEntry[] {
    return [...this.performanceEntries]
  }

  recordPerformance(
    name: string,
    startTime: number,
    endTime: number,
    metadata: Record<string, unknown> = {},
  ): void {
    this.performanceEntries.push({
      name,
      startTime,
      endTime,
      duration: endTime - startTime,
      metadata,
    })
  }

  clearPerformanceEntries(): void {
    this.performanceEntries = []
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 1) return sorted[0]!
    if (sorted.length === 0) return 0
    const index = (p / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    if (lower === upper) return sorted[lower]!
    const weight = index - lower
    return sorted[lower]! * (1 - weight) + sorted[upper]! * weight
  }
}
