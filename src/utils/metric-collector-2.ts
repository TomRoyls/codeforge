export type MetricType2 = 'counter' | 'gauge' | 'histogram' | 'timer'
export type MetricUnit2 = 'none' | 'bytes' | 'milliseconds' | 'seconds' | 'count' | 'percent' | 'ratio'

export interface Metric2 {
  name: string
  type: MetricType2
  value: number
  unit: MetricUnit2
  labels: Record<string, string>
  timestamp: number
  description: string
}

export class MetricCollector2 {
  private metrics: Map<string, Metric2> = new Map()
  private history: Map<string, number[]> = new Map()
  private maxHistory: number = 100
  private tagIndex: Map<string, Set<string>> = new Map()

  register(name: string, type: MetricType2, unit: MetricUnit2 = 'none', description = ''): this {
    this.metrics.set(name, { name, type, value: 0, unit, labels: {}, timestamp: Date.now(), description })
    return this
  }

  increment(name: string, by = 1): boolean {
    const m = this.metrics.get(name)
    if (!m || m.type !== 'counter') return false
    m.value += by
    m.timestamp = Date.now()
    this.recordHistory(name, m.value)
    return true
  }

  set(name: string, value: number): boolean {
    const m = this.metrics.get(name)
    if (!m || m.type !== 'gauge') return false
    m.value = value
    m.timestamp = Date.now()
    this.recordHistory(name, value)
    return true
  }

  observe(name: string, value: number): boolean {
    const m = this.metrics.get(name)
    if (!m || (m.type !== 'histogram' && m.type !== 'timer')) return false
    m.value = value
    m.timestamp = Date.now()
    this.recordHistory(name, value)
    return true
  }

  private recordHistory(name: string, value: number): void {
    if (!this.history.has(name)) this.history.set(name, [])
    const h = this.history.get(name)!
    h.push(value)
    if (h.length > this.maxHistory) h.shift()
  }

  get(name: string): Metric2 | undefined { return this.metrics.get(name) }

  getValue(name: string): number | undefined { return this.metrics.get(name)?.value }

  getHistory(name: string): number[] {
    return [...(this.history.get(name) ?? [])]
  }

  setLabels(name: string, labels: Record<string, string>): boolean {
    const m = this.metrics.get(name)
    if (!m) return false
    m.labels = { ...labels }
    Object.entries(labels).forEach(([key, val]) => {
      const tagKey = `${key}=${val}`
      if (!this.tagIndex.has(tagKey)) this.tagIndex.set(tagKey, new Set())
      this.tagIndex.get(tagKey)!.add(name)
    })
    return true
  }

  getByTag(tag: string, value: string): Metric2[] {
    const names = this.tagIndex.get(`${tag}=${value}`)
    if (!names) return []
    return Array.from(names).map(n => this.metrics.get(n)!).filter(Boolean)
  }

  getByType(type: MetricType2): Metric2[] {
    return Array.from(this.metrics.values()).filter(m => m.type === type)
  }

  getCounters(): Metric2[] { return this.getByType('counter') }
  getGauges(): Metric2[] { return this.getByType('gauge') }
  getHistograms(): Metric2[] { return this.getByType('histogram') }
  getTimers(): Metric2[] { return this.getByType('timer') }

  getAverage(name: string): number {
    const h = this.history.get(name)
    if (!h || h.length === 0) return 0
    return h.reduce((a, b) => a + b, 0) / h.length
  }

  getMin(name: string): number {
    const h = this.history.get(name)
    if (!h || h.length === 0) return 0
    return Math.min(...h)
  }

  getMax(name: string): number {
    const h = this.history.get(name)
    if (!h || h.length === 0) return 0
    return Math.max(...h)
  }

  getPercentile(name: string, percentile: number): number {
    const h = this.history.get(name)
    if (!h || h.length === 0) return 0
    const sorted = [...h].sort((a, b) => a - b)
    const idx = Math.ceil(sorted.length * percentile / 100) - 1
    return sorted[Math.max(0, idx)]
  }

  getRate(name: string): number {
    const h = this.history.get(name)
    if (!h || h.length < 2) return 0
    return h[h.length - 1] - h[h.length - 2]
  }

  setMaxHistory(max: number): this { this.maxHistory = max; return this }
  getMaxHistory(): number { return this.maxHistory }

  reset(name: string): boolean {
    const m = this.metrics.get(name)
    if (!m) return false
    m.value = 0
    this.history.set(name, [])
    return true
  }

  remove(name: string): boolean {
    this.history.delete(name)
    return this.metrics.delete(name)
  }

  getSummary(): { total: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {}
    this.metrics.forEach(m => { byType[m.type] = (byType[m.type] ?? 0) + 1 })
    return { total: this.metrics.size, byType }
  }

  count(): number { return this.metrics.size }

  toArray(): Metric2[] { return Array.from(this.metrics.values()) }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): MetricCollector2 {
    const mc = new MetricCollector2()
    this.metrics.forEach((m, name) => mc.metrics.set(name, { ...m, labels: { ...m.labels } }))
    this.history.forEach((h, name) => mc.history.set(name, [...h]))
    mc.maxHistory = this.maxHistory
    return mc
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MetricCollector2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.metrics.clear()
    this.history.clear()
    this.tagIndex.clear()
  }
}
