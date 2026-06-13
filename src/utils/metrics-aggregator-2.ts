export interface MetricEntry {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

export class MetricsAggregator2 {
  private counters: Map<string, number> = new Map()
  private gauges: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()
  private timers: Map<string, { start: number; name: string }> = new Map()
  private history: MetricEntry[] = []
  private maxHistory: number

  constructor(maxHistory = 10000) {
    this.maxHistory = maxHistory
  }

  incrementCounter(name: string, by = 1): this {
    this.counters.set(name, (this.counters.get(name) ?? 0) + by)
    this.recordHistory(name, this.counters.get(name)!)
    return this
  }

  setGauge(name: string, value: number): this {
    this.gauges.set(name, value)
    this.recordHistory(name, value)
    return this
  }

  observeHistogram(name: string, value: number): this {
    if (!this.histograms.has(name)) this.histograms.set(name, [])
    this.histograms.get(name)!.push(value)
    this.recordHistory(name, value)
    return this
  }

  startTimer(name: string): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    this.timers.set(id, { start: Date.now(), name })
    return id
  }

  endTimer(id: string): number | undefined {
    const timer = this.timers.get(id)
    if (!timer) return undefined
    const elapsed = Date.now() - timer.start
    this.observeHistogram(timer.name, elapsed)
    this.timers.delete(id)
    return elapsed
  }

  getCounter(name: string): number { return this.counters.get(name) ?? 0 }
  getGauge(name: string): number | undefined { return this.gauges.get(name) }
  getHistogram(name: string): number[] { return this.histograms.get(name) ?? [] }

  histogramPercentile(name: string, percentile: number): number | undefined {
    const values = this.getHistogram(name)
    if (values.length === 0) return undefined
    const sorted = [...values].sort((a, b) => a - b)
    const idx = Math.ceil(percentile * sorted.length / 100) - 1
    return sorted[Math.max(0, idx)]
  }

  histogramStats(name: string): { count: number; min: number; max: number; avg: number; p50?: number; p95?: number; p99?: number } {
    const values = this.getHistogram(name)
    if (values.length === 0) return { count: 0, min: 0, max: 0, avg: 0 }
    const sum = values.reduce((a, b) => a + b, 0)
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
      p50: this.histogramPercentile(name, 50),
      p95: this.histogramPercentile(name, 95),
      p99: this.histogramPercentile(name, 99),
    }
  }

  counterNames(): string[] { return Array.from(this.counters.keys()) }
  gaugeNames(): string[] { return Array.from(this.gauges.keys()) }
  histogramNames(): string[] { return Array.from(this.histograms.keys()) }

  getHistory(name?: string): MetricEntry[] {
    if (name) return this.history.filter(e => e.name === name)
    return [...this.history]
  }

  clearHistory(): void { this.history = [] }
  clearAll(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
    this.timers.clear()
    this.history = []
  }

  snapshot(): { counters: Record<string, number>; gauges: Record<string, number>; histograms: Record<string, { count: number; avg: number }> } {
    const counters: Record<string, number> = {}
    this.counters.forEach((v, k) => { counters[k] = v })
    const gauges: Record<string, number> = {}
    this.gauges.forEach((v, k) => { gauges[k] = v })
    const histograms: Record<string, { count: number; avg: number }> = {}
    this.histograms.forEach((values, name) => {
      histograms[name] = { count: values.length, avg: values.reduce((a, b) => a + b, 0) / values.length }
    })
    return { counters, gauges, histograms }
  }

  private recordHistory(name: string, value: number): void {
    this.history.push({ name, value, timestamp: Date.now() })
    if (this.history.length > this.maxHistory) this.history.shift()
  }

  toArray(): string[] { return [...this.counterNames(), ...this.gaugeNames(), ...this.histogramNames()] }
  toString(): string { return JSON.stringify(this.snapshot()) }
  toJSON(): Record<string, unknown> { return this.snapshot() }
  clone(): MetricsAggregator2 {
    const m = new MetricsAggregator2(this.maxHistory)
    this.counters.forEach((v, k) => m.incrementCounter(k, v))
    this.gauges.forEach((v, k) => m.setGauge(k, v))
    return m
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MetricsAggregator2)) return false
    return this.counterNames().length === other.counterNames().length
  }
}
