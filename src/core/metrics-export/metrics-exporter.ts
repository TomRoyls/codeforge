import type { Metric, AggregatedMetric, ExportConfig } from './types.js'
import { MetricType } from './types.js'
import { groupBy } from '../../utils/array-helpers.js'

const DEFAULT_CONFIG: ExportConfig = {
  format: 'prometheus',
  includeTimestamps: true,
  prefix: '',
  labelSeparator: ',',
  metricSeparator: '\n',
}

export class MetricsExporter {
  private config: ExportConfig

  constructor(config?: Partial<ExportConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  export(metrics: Metric[]): string {
    switch (this.config.format) {
      case 'prometheus':
        return this.exportPrometheus(metrics)
      case 'openmetrics':
        return this.exportOpenMetrics(metrics)
      case 'statsd':
        return this.exportStatsD(metrics)
      case 'json':
        return this.exportJSON(metrics)
      case 'csv':
        return this.exportCSV(metrics)
    }
  }

  exportPrometheus(metrics: Metric[]): string {
    if (metrics.length === 0) return ''

    const lines: string[] = []
    const grouped = this.groupByName(metrics)

    for (const [name, group] of grouped) {
      const sample = group[0]!
      const fullName = this.addPrefix(name)

      lines.push(`# HELP ${fullName} ${this.getTypeName(sample.type)}`)
      lines.push(`# TYPE ${fullName} ${sample.type}`)

      for (const metric of group) {
        const labelStr = this.formatPrometheusLabels(metric.labels)
        const ts = this.config.includeTimestamps ? ` ${metric.timestamp}` : ''
        if (labelStr) {
          lines.push(`${fullName}{${labelStr}} ${metric.value}${ts}`)
        } else {
          lines.push(`${fullName} ${metric.value}${ts}`)
        }
      }
    }

    return lines.join(this.config.metricSeparator)
  }

  exportOpenMetrics(metrics: Metric[]): string {
    if (metrics.length === 0) return ''

    const lines: string[] = []
    const grouped = this.groupByName(metrics)

    for (const [name, group] of grouped) {
      const sample = group[0]!
      const fullName = this.addPrefix(name)

      lines.push(`# HELP ${fullName} ${this.getTypeName(sample.type)}`)
      lines.push(`# TYPE ${fullName} ${sample.type}`)

      for (const metric of group) {
        const labelStr = this.formatPrometheusLabels(metric.labels)
        const ts = this.config.includeTimestamps ? ` ${metric.timestamp}` : ''
        if (labelStr) {
          lines.push(`${fullName}{${labelStr}} ${metric.value}${ts}`)
        } else {
          lines.push(`${fullName} ${metric.value}${ts}`)
        }
      }

      if (sample.type === MetricType.HISTOGRAM) {
        const sum = group.reduce((a, m) => a + m.value, 0)
        const count = group.length
        lines.push(`${fullName}_sum ${sum}`)
        lines.push(`${fullName}_count ${count}`)
        lines.push(`# EOF`)
      }

      if (sample.type === MetricType.COUNTER) {
        lines.push(`${fullName}_created ${group[0]!.timestamp}`)
      }
    }

    lines.push('# EOF')
    return lines.join(this.config.metricSeparator)
  }

  exportStatsD(metrics: Metric[]): string {
    const lines: string[] = []

    for (const metric of metrics) {
      const fullName = this.addPrefix(metric.name)
      const typeChar = this.getStatsDType(metric.type)
      lines.push(`${fullName}:${metric.value}|${typeChar}`)
    }

    return lines.join(this.config.metricSeparator)
  }

  exportJSON(metrics: Metric[]): string {
    const data = metrics.map((m) => ({
      name: this.addPrefix(m.name),
      type: m.type,
      value: m.value,
      labels: m.labels,
      timestamp: this.config.includeTimestamps ? m.timestamp : undefined,
      unit: m.unit,
    }))

    return JSON.stringify(data, null, 2)
  }

  exportCSV(metrics: Metric[]): string {
    const rows: string[] = ['name,type,value,labels,timestamp']

    for (const metric of metrics) {
      const name = this.addPrefix(metric.name)
      const labels = JSON.stringify(metric.labels)
      const ts = this.config.includeTimestamps ? String(metric.timestamp) : ''
      rows.push(`${name},${metric.type},${metric.value},${labels},${ts}`)
    }

    return rows.join('\n')
  }

  exportAggregated(aggregated: Map<string, AggregatedMetric>): string {
    const entries = [...aggregated]

    switch (this.config.format) {
      case 'json':
        return JSON.stringify(
          entries.map(([name, agg]) => ({
            ...agg,
            name: this.addPrefix(name),
          })),
          null,
          2,
        )

      case 'csv': {
        const rows = ['name,min,max,avg,sum,count,p50,p95,p99']
        for (const [name, agg] of aggregated) {
          rows.push(
            `${this.addPrefix(name)},${agg.min},${agg.max},${agg.avg},${agg.sum},${agg.count},${agg.percentiles[50] ?? ''},${agg.percentiles[95] ?? ''},${agg.percentiles[99] ?? ''}`,
          )
        }
        return rows.join('\n')
      }

      case 'prometheus':
      case 'openmetrics': {
        const lines: string[] = []
        for (const [name, agg] of aggregated) {
          const fullName = this.addPrefix(name)
          lines.push(`# HELP ${fullName} Aggregated metric`)
          lines.push(`# TYPE ${fullName} gauge`)
          lines.push(`${fullName}_min ${agg.min}`)
          lines.push(`${fullName}_max ${agg.max}`)
          lines.push(`${fullName}_avg ${agg.avg}`)
          lines.push(`${fullName}_sum ${agg.sum}`)
          lines.push(`${fullName}_count ${agg.count}`)
        }
        return lines.join(this.config.metricSeparator)
      }

      case 'statsd': {
        const lines: string[] = []
        for (const [name, agg] of aggregated) {
          const fullName = this.addPrefix(name)
          lines.push(`${fullName}_min:${agg.min}|g`)
          lines.push(`${fullName}_max:${agg.max}|g`)
          lines.push(`${fullName}_avg:${agg.avg}|g`)
          lines.push(`${fullName}_sum:${agg.sum}|g`)
          lines.push(`${fullName}_count:${agg.count}|c`)
        }
        return lines.join(this.config.metricSeparator)
      }
    }
  }

  addPrefix(name: string): string {
    if (!this.config.prefix) return name
    const sep = this.config.prefix.endsWith('_') ? '' : '_'
    return `${this.config.prefix}${sep}${name}`
  }

  getConfig(): ExportConfig {
    return { ...this.config }
  }

  private groupByName(metrics: Metric[]): Map<string, Metric[]> {
    return groupBy(metrics, (m) => m.name)
  }

  private formatPrometheusLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels)
    if (entries.length === 0) return ''
    return entries.map(([k, v]) => `${k}="${v}"`).join(this.config.labelSeparator)
  }

  private getTypeName(type: MetricType): string {
    switch (type) {
      case MetricType.COUNTER:
        return 'Counter'
      case MetricType.GAUGE:
        return 'Gauge'
      case MetricType.HISTOGRAM:
        return 'Histogram'
      case MetricType.SUMMARY:
        return 'Summary'
    }
  }

  private getStatsDType(type: MetricType): string {
    switch (type) {
      case MetricType.COUNTER:
        return 'c'
      case MetricType.GAUGE:
        return 'g'
      case MetricType.HISTOGRAM:
        return 'ms'
      case MetricType.SUMMARY:
        return 'h'
    }
  }
}
