export type CapacityState2 = 'green' | 'yellow' | 'red'
export type ScaleAction2 = 'scale-up' | 'scale-down' | 'hold' | 'emergency'

export interface CapacityThreshold2 {
  metric: string
  warnAt: number
  criticalAt: number
  maxValue: number
}

export interface CapacitySnapshot2 {
  timestamp: number
  state: CapacityState2
  utilization: number
  metrics: Record<string, number>
  recommendation: ScaleAction2
}

export class CapacityPlanner2 {
  private thresholds: Map<string, CapacityThreshold2> = new Map()
  private snapshots: CapacitySnapshot2[] = []
  private listeners: Array<(event: string, snapshot: CapacitySnapshot2) => void> = []
  private maxSnapshots: number = 10000
  private currentMetrics: Map<string, number> = new Map()
  private capacity: number = 100
  private scaleStep: number = 10
  private minCapacity: number = 10
  private maxCapacity: number = 1000
  private cooldownMs: number = 60000
  private lastScaleAt: number = 0

  setCapacity(n: number): this { this.capacity = n; return this }
  setScaleStep(n: number): this { this.scaleStep = n; return this }
  setMinCapacity(n: number): this { this.minCapacity = n; return this }
  setMaxCapacity(n: number): this { this.maxCapacity = n; return this }
  setCooldown(ms: number): this { this.cooldownMs = ms; return this }

  setThreshold(metric: string, warnAt: number, criticalAt: number, maxValue: number): this {
    this.thresholds.set(metric, { metric, warnAt, criticalAt, maxValue })
    return this
  }

  recordMetric(metric: string, value: number): void {
    this.currentMetrics.set(metric, value)
  }

  evaluate(): CapacitySnapshot2 {
    let overallUtil = 0
    let thresholdCount = 0
    let state: CapacityState2 = 'green'
    const metrics: Record<string, number> = {}

    this.thresholds.forEach((threshold, name) => {
      const value = this.currentMetrics.get(name) ?? 0
      metrics[name] = value
      const util = threshold.maxValue > 0 ? value / threshold.maxValue : 0
      overallUtil += util
      thresholdCount++

      if (util >= threshold.criticalAt) state = 'red'
      else if (util >= threshold.warnAt && state !== 'red') state = 'yellow'
    })

    if (thresholdCount > 0) overallUtil /= thresholdCount

    const recommendation = this.computeRecommendation(state, overallUtil)
    const snapshot: CapacitySnapshot2 = {
      timestamp: Date.now(),
      state, utilization: overallUtil,
      metrics, recommendation,
    }

    this.snapshots.push(snapshot)
    if (this.snapshots.length > this.maxSnapshots) this.snapshots.shift()
    this.notify('evaluated', snapshot)
    if (state === 'red') this.notify('critical', snapshot)
    return snapshot
  }

  private computeRecommendation(state: CapacityState2, utilization: number): ScaleAction2 {
    const now = Date.now()
    const inCooldown = now - this.lastScaleAt < this.cooldownMs
    if (inCooldown) return 'hold'

    if (state === 'red') return 'emergency'
    if (state === 'yellow' && utilization > 0.8) return 'scale-up'
    if (state === 'green' && utilization < 0.3) return 'scale-down'
    return 'hold'
  }

  executeScale(action: ScaleAction2): number {
    const now = Date.now()
    if (now - this.lastScaleAt < this.cooldownMs && action !== 'emergency') return this.capacity

    switch (action) {
      case 'scale-up':
      case 'emergency':
        this.capacity = Math.min(this.maxCapacity, this.capacity + this.scaleStep)
        break
      case 'scale-down':
        this.capacity = Math.max(this.minCapacity, this.capacity - this.scaleStep)
        break
      case 'hold':
        break
    }
    this.lastScaleAt = now
    this.notify('scaled', {
      timestamp: now,
      state: 'green' as CapacityState2,
      utilization: 0,
      metrics: {},
      recommendation: action,
    })
    return this.capacity
  }

  getCapacity(): number { return this.capacity }
  getUtilization(): number {
    let total = 0
    let count = 0
    this.thresholds.forEach((t, name) => {
      const value = this.currentMetrics.get(name) ?? 0
      total += t.maxValue > 0 ? value / t.maxValue : 0
      count++
    })
    return count > 0 ? total / count : 0
  }

  getSnapshotHistory(): CapacitySnapshot2[] { return [...this.snapshots] }
  getLatestSnapshot(): CapacitySnapshot2 | null { return this.snapshots[this.snapshots.length - 1] || null }
  getThresholds(): CapacityThreshold2[] { return Array.from(this.thresholds.values()) }

  listen(fn: (event: string, snapshot: CapacitySnapshot2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, snapshot: CapacitySnapshot2): void {
    this.listeners.forEach(fn => fn(event, snapshot))
  }

  getStats(): { capacity: number; utilization: number; thresholds: number; snapshots: number; state: string } {
    return {
      capacity: this.capacity,
      utilization: this.getUtilization(),
      thresholds: this.thresholds.size,
      snapshots: this.snapshots.length,
      state: this.getLatestSnapshot()?.state ?? 'green',
    }
  }

  count(): number { return this.snapshots.length }

  toArray(): CapacitySnapshot2[] { return [...this.snapshots] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): CapacityPlanner2 {
    const cp = new CapacityPlanner2()
    cp.capacity = this.capacity
    cp.scaleStep = this.scaleStep
    cp.minCapacity = this.minCapacity
    cp.maxCapacity = this.maxCapacity
    cp.cooldownMs = this.cooldownMs
    return cp
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CapacityPlanner2)) return false
    return this.capacity === other.capacity
  }
  clear(): void {
    this.thresholds.clear()
    this.snapshots = []
    this.currentMetrics.clear()
    this.listeners = []
    this.capacity = 100
    this.lastScaleAt = 0
  }
}
