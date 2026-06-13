export class MetricsCollector2 {
  private counters = new Map<string, number>()
  private gauges = new Map<string, number>()
  private histograms = new Map<string, number[]>()
  private timers = new Map<string, { start: number; end: number | null }>()

  incrementCounter(name: string, amount = 1): void {
    this.counters.set(name, (this.counters.get(name) ?? 0) + amount)
  }

  getCounter(name: string): number {
    return this.counters.get(name) ?? 0
  }

  setGauge(name: string, value: number): void {
    this.gauges.set(name, value)
  }

  getGauge(name: string): number {
    return this.gauges.get(name) ?? 0
  }

  recordHistogram(name: string, value: number): void {
    if (!this.histograms.has(name)) this.histograms.set(name, [])
    this.histograms.get(name)!.push(value)
  }

  getHistogramStats(name: string): { count: number; min: number; max: number; mean: number; median: number } {
    const values = this.histograms.get(name) ?? []
    if (values.length === 0) return { count: 0, min: 0, max: 0, mean: 0, median: 0 }
    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((s, v) => s + v, 0)
    const mid = Math.floor(sorted.length / 2)
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / values.length,
      median: sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid],
    }
  }

  startTimer(name: string): void {
    this.timers.set(name, { start: Date.now(), end: null })
  }

  stopTimer(name: string): number | null {
    const timer = this.timers.get(name)
    if (!timer || timer.end !== null) return null
    timer.end = Date.now()
    return timer.end - timer.start
  }

  getTimerDuration(name: string): number {
    const timer = this.timers.get(name)
    if (!timer) return 0
    const end = timer.end ?? Date.now()
    return end - timer.start
  }

  get counterCount(): number { return this.counters.size }
  get gaugeCount(): number { return this.gauges.size }
  get histogramCount(): number { return this.histograms.size }

  reset(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
    this.timers.clear()
  }

  toArray(): string[] { return [...this.counters.keys(), ...this.gauges.keys()] }
  toString(): string { return JSON.stringify({ counters: this.counterCount, gauges: this.gaugeCount }) }
  toJSON(): Record<string, number> { return { counters: this.counterCount, gauges: this.gaugeCount, histograms: this.histogramCount } }
  clone(): MetricsCollector2 { return new MetricsCollector2() }
  equals(other: unknown): boolean { return other instanceof MetricsCollector2 }
}
