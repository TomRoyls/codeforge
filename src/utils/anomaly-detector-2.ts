export type AnomalyType2 = 'spike' | 'dip' | 'level-shift' | 'noise' | 'outlier' | 'missing'
export type AnomalySeverity2 = 'low' | 'medium' | 'high' | 'critical'

export interface Anomaly2 {
  id: string
  metric: string
  type: AnomalyType2
  severity: AnomalySeverity2
  value: number
  expected: number
  zScore: number
  detectedAt: number
  context: Record<string, unknown>
  resolved: boolean
  resolvedAt: number | null
}

export interface MetricBaseline2 {
  metric: string
  mean: number
  stdDev: number
  min: number
  max: number
  sampleCount: number
  lastUpdated: number
}

export class AnomalyDetector2 {
  private baselines: Map<string, MetricBaseline2> = new Map()
  private anomalies: Map<string, Anomaly2> = new Map()
  private recentValues: Map<string, number[]> = new Map()
  private windowSize: number = 100
  private zThreshold: number = 3
  private absThreshold: number = 0
  private listeners: Array<(event: string, anomaly: Anomaly2) => void> = []
  private idCounter = 0

  setWindowSize(n: number): this { this.windowSize = n; return this }
  setZThreshold(z: number): this { this.zThreshold = z; return this }
  setAbsThreshold(n: number): this { this.absThreshold = n; return this }

  observe(metric: string, value: number): Anomaly2 | null {
    const oldBaseline = this.baselines.get(metric)

    const values = this.recentValues.get(metric) || []
    values.push(value)
    if (values.length > this.windowSize) values.shift()
    this.recentValues.set(metric, values)

    this.updateBaseline(metric, values)

    const baseline = this.baselines.get(metric)
    if (!baseline || baseline.sampleCount < 10) return null

    const zScore = baseline.stdDev > 0 ? Math.abs(value - baseline.mean) / baseline.stdDev : 0

    if (zScore >= this.zThreshold || (this.absThreshold > 0 && Math.abs(value - baseline.mean) >= this.absThreshold)) {
      const type = this.classifyAnomaly(value, oldBaseline || baseline)
      const severity = this.classifySeverity(zScore)
      const anomaly: Anomaly2 = {
        id: `anom_${++this.idCounter}`,
        metric, type, severity,
        value, expected: baseline.mean, zScore,
        detectedAt: Date.now(),
        context: {},
        resolved: false,
        resolvedAt: null,
      }
      this.anomalies.set(anomaly.id, anomaly)
      this.notify('detected', anomaly)
      return anomaly
    }
    return null
  }

  private updateBaseline(metric: string, values: number[]): void {
    const n = values.length
    if (n < 2) return
    const mean = values.reduce((s, v) => s + v, 0) / n
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n
    const stdDev = Math.sqrt(variance)
    this.baselines.set(metric, {
      metric, mean, stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      sampleCount: n,
      lastUpdated: Date.now(),
    })
  }

  private classifyAnomaly(value: number, baseline: MetricBaseline2): AnomalyType2 {
    if (value > baseline.max) return 'spike'
    if (value < baseline.min) return 'dip'
    if (Math.abs(value - baseline.mean) > 3 * baseline.stdDev) return 'outlier'
    return 'noise'
  }

  private classifySeverity(zScore: number): AnomalySeverity2 {
    if (zScore >= 5) return 'critical'
    if (zScore >= 4) return 'high'
    if (zScore >= 3.5) return 'medium'
    return 'low'
  }

  resolve(id: string): boolean {
    const anomaly = this.anomalies.get(id)
    if (!anomaly || anomaly.resolved) return false
    anomaly.resolved = true
    anomaly.resolvedAt = Date.now()
    this.notify('resolved', anomaly)
    return true
  }

  get(id: string): Anomaly2 | undefined { return this.anomalies.get(id) }
  getByMetric(metric: string): Anomaly2[] { return Array.from(this.anomalies.values()).filter(a => a.metric === metric) }
  getBySeverity(severity: AnomalySeverity2): Anomaly2[] { return Array.from(this.anomalies.values()).filter(a => a.severity === severity) }
  getUnresolved(): Anomaly2[] { return Array.from(this.anomalies.values()).filter(a => !a.resolved) }
  getResolved(): Anomaly2[] { return Array.from(this.anomalies.values()).filter(a => a.resolved) }

  getBaseline(metric: string): MetricBaseline2 | undefined { return this.baselines.get(metric) }

  addContext(id: string, key: string, value: unknown): boolean {
    const anomaly = this.anomalies.get(id)
    if (!anomaly) return false
    anomaly.context[key] = value
    return true
  }

  listen(fn: (event: string, anomaly: Anomaly2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, anomaly: Anomaly2): void {
    this.listeners.forEach(fn => fn(event, anomaly))
  }

  getStats(): { anomalies: number; unresolved: number; resolved: number; critical: number; high: number; metrics: number } {
    return {
      anomalies: this.anomalies.size,
      unresolved: this.getUnresolved().length,
      resolved: this.getResolved().length,
      critical: this.getBySeverity('critical').length,
      high: this.getBySeverity('high').length,
      metrics: this.baselines.size,
    }
  }

  count(): number { return this.anomalies.size }

  toArray(): Anomaly2[] { return Array.from(this.anomalies.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): AnomalyDetector2 {
    const ad = new AnomalyDetector2()
    ad.windowSize = this.windowSize
    ad.zThreshold = this.zThreshold
    ad.absThreshold = this.absThreshold
    ad.idCounter = this.idCounter
    return ad
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AnomalyDetector2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.baselines.clear()
    this.anomalies.clear()
    this.recentValues.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
