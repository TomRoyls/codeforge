export interface CounterEntry2 {
  name: string
  value: number
  tags: Record<string, string>
  updatedAt: number
  samples: number
}

export interface GaugeEntry2 {
  name: string
  value: number
  min: number
  max: number
  sum: number
  count: number
  tags: Record<string, string>
  updatedAt: number
}

export interface HistogramEntry2 {
  name: string
  buckets: Map<string, number>
  count: number
  sum: number
  min: number
  max: number
  tags: Record<string, string>
  updatedAt: number
}

export class TelemetryAggregator2 {
  private counters: Map<string, CounterEntry2> = new Map()
  private gauges: Map<string, GaugeEntry2> = new Map()
  private histograms: Map<string, HistogramEntry2> = new Map()
  private defaultBuckets: number[] = [0, 1, 5, 10, 25, 50, 100, 250, 500, 1000]
  private listeners: Array<(event: string, name: string) => void> = []

  setBuckets(buckets: number[]): this { this.defaultBuckets = buckets; return this }

  private key(name: string, tags: Record<string, string> = {}): string {
    const tagStr = Object.keys(tags).sort().map(k => `${k}=${tags[k]}`).join(',')
    return `${name}|${tagStr}`
  }

  incCounter(name: string, value = 1, tags: Record<string, string> = {}): void {
    const k = this.key(name, tags)
    const existing = this.counters.get(k)
    if (existing) {
      existing.value += value
      existing.samples++
      existing.updatedAt = Date.now()
    } else {
      this.counters.set(k, { name, value, tags, updatedAt: Date.now(), samples: 1 })
    }
    this.notify('counter', name)
  }

  setGauge(name: string, value: number, tags: Record<string, string> = {}): void {
    const k = this.key(name, tags)
    const existing = this.gauges.get(k)
    if (existing) {
      existing.value = value
      existing.min = Math.min(existing.min, value)
      existing.max = Math.max(existing.max, value)
      existing.sum += value
      existing.count++
      existing.updatedAt = Date.now()
    } else {
      this.gauges.set(k, { name, value, min: value, max: value, sum: value, count: 1, tags, updatedAt: Date.now() })
    }
    this.notify('gauge', name)
  }

  observeHistogram(name: string, value: number, tags: Record<string, string> = {}): void {
    const k = this.key(name, tags)
    let entry = this.histograms.get(k)
    if (!entry) {
      entry = {
        name, tags, buckets: new Map(), count: 0, sum: 0,
        min: Infinity, max: -Infinity,
        updatedAt: Date.now(),
      }
      for (const b of this.defaultBuckets) entry.buckets.set(`le_${b}`, 0)
      entry.buckets.set('le_Inf', 0)
      this.histograms.set(k, entry)
    }
    entry.count++
    entry.sum += value
    entry.min = Math.min(entry.min, value)
    entry.max = Math.max(entry.max, value)
    entry.updatedAt = Date.now()
    for (const b of this.defaultBuckets) {
      if (value <= b) entry.buckets.set(`le_${b}`, (entry.buckets.get(`le_${b}`) || 0) + 1)
    }
    entry.buckets.set('le_Inf', entry.count)
    this.notify('histogram', name)
  }

  getCounter(name: string, tags: Record<string, string> = {}): CounterEntry2 | undefined {
    return this.counters.get(this.key(name, tags))
  }

  getGauge(name: string, tags: Record<string, string> = {}): GaugeEntry2 | undefined {
    return this.gauges.get(this.key(name, tags))
  }

  getHistogram(name: string, tags: Record<string, string> = {}): HistogramEntry2 | undefined {
    return this.histograms.get(this.key(name, tags))
  }

  getCounters(): CounterEntry2[] { return Array.from(this.counters.values()) }
  getGauges(): GaugeEntry2[] { return Array.from(this.gauges.values()) }
  getHistograms(): HistogramEntry2[] { return Array.from(this.histograms.values()) }

  getHistogramQuantile(name: string, quantile: number, tags: Record<string, string> = {}): number {
    const hist = this.histograms.get(this.key(name, tags))
    if (!hist || hist.count === 0) return 0
    const target = quantile * hist.count
    for (const b of this.defaultBuckets) {
      if ((hist.buckets.get(`le_${b}`) || 0) >= target) return b
    }
    return hist.max
  }

  getGaugeAvg(name: string, tags: Record<string, string> = {}): number {
    const g = this.gauges.get(this.key(name, tags))
    if (!g || g.count === 0) return 0
    return g.sum / g.count
  }

  resetCounter(name: string, tags: Record<string, string> = {}): boolean {
    const k = this.key(name, tags)
    const existing = this.counters.get(k)
    if (!existing) return false
    existing.value = 0
    existing.samples = 0
    return true
  }

  listen(fn: (event: string, name: string) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, name: string): void {
    this.listeners.forEach(fn => fn(event, name))
  }

  getStats(): { counters: number; gauges: number; histograms: number } {
    return {
      counters: this.counters.size,
      gauges: this.gauges.size,
      histograms: this.histograms.size,
    }
  }

  count(): number { return this.counters.size + this.gauges.size + this.histograms.size }

  toArray(): Array<CounterEntry2 | GaugeEntry2 | HistogramEntry2> {
    return [...this.getCounters(), ...this.getGauges(), ...this.getHistograms()]
  }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): TelemetryAggregator2 {
    const ta = new TelemetryAggregator2()
    this.counters.forEach((c, k) => ta.counters.set(k, { ...c, tags: { ...c.tags } }))
    this.gauges.forEach((g, k) => ta.gauges.set(k, { ...g, tags: { ...g.tags } }))
    this.histograms.forEach((h, k) => ta.histograms.set(k, { ...h, tags: { ...h.tags }, buckets: new Map(h.buckets) }))
    return ta
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TelemetryAggregator2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
    this.listeners = []
  }
}
