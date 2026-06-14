export type AlertLevel2 = 'info' | 'warning' | 'error' | 'critical'
export type AlertStatus2 = 'active' | 'acknowledged' | 'suppressed' | 'resolved'

export interface Alert2 {
  id: string
  level: AlertLevel2
  source: string
  message: string
  status: AlertStatus2
  firedAt: number
  acknowledgedAt: number | null
  acknowledgedBy: string | null
  resolvedAt: number | null
  count: number
  metadata: Record<string, unknown>
}

export class AlertManager2 {
  private alerts: Map<string, Alert2> = new Map()
  private idCounter = 0
  private suppressionRules: Map<string, string[]> = new Map()
  private handlers: ((alert: Alert2) => void)[] = []
  private maxAlerts: number

  constructor(maxAlerts = 10000) {
    this.maxAlerts = maxAlerts
  }

  fire(level: AlertLevel2, source: string, message: string, metadata: Record<string, unknown> = {}): Alert2 {
    const dedupKey = `${level}:${source}:${message}`
    const existing = Array.from(this.alerts.values()).find(a =>
      a.source === source && a.message === message && a.status === 'active',
    )

    if (existing) {
      existing.count++
      existing.firedAt = Date.now()
      return existing
    }

    if (this.isSuppressed(source, message)) {
      const suppressed: Alert2 = {
        id: `alert_${++this.idCounter}`,
        level, source, message,
        status: 'suppressed',
        firedAt: Date.now(),
        acknowledgedAt: null, acknowledgedBy: null, resolvedAt: null,
        count: 1, metadata,
      }
      this.alerts.set(suppressed.id, suppressed)
      return suppressed
    }

    const alert: Alert2 = {
      id: `alert_${++this.idCounter}`,
      level, source, message,
      status: 'active',
      firedAt: Date.now(),
      acknowledgedAt: null, acknowledgedBy: null, resolvedAt: null,
      count: 1, metadata,
    }
    this.alerts.set(alert.id, alert)
    this.enforceMax()
    this.handlers.forEach(h => h(alert))
    return alert
  }

  acknowledge(id: string, user: string): boolean {
    const alert = this.alerts.get(id)
    if (!alert || alert.status !== 'active') return false
    alert.status = 'acknowledged'
    alert.acknowledgedAt = Date.now()
    alert.acknowledgedBy = user
    return true
  }

  resolve(id: string): boolean {
    const alert = this.alerts.get(id)
    if (!alert) return false
    alert.status = 'resolved'
    alert.resolvedAt = Date.now()
    return true
  }

  get(id: string): Alert2 | undefined { return this.alerts.get(id) }

  getActive(): Alert2[] { return this.getByStatus('active') }
  getAcknowledged(): Alert2[] { return this.getByStatus('acknowledged') }
  getResolved(): Alert2[] { return this.getByStatus('resolved') }
  getSuppressed(): Alert2[] { return this.getByStatus('suppressed') }

  getByStatus(status: AlertStatus2): Alert2[] {
    return Array.from(this.alerts.values()).filter(a => a.status === status)
  }

  getByLevel(level: AlertLevel2): Alert2[] {
    return Array.from(this.alerts.values()).filter(a => a.level === level)
  }

  getBySource(source: string): Alert2[] {
    return Array.from(this.alerts.values()).filter(a => a.source === source)
  }

  getCritical(): Alert2[] {
    return this.getActive().filter(a => a.level === 'critical')
  }

  addSuppressionRule(source: string, patterns: string[]): this {
    this.suppressionRules.set(source, [...patterns])
    return this
  }

  removeSuppressionRule(source: string): boolean {
    return this.suppressionRules.delete(source)
  }

  onAlert(handler: (alert: Alert2) => void): this {
    this.handlers.push(handler)
    return this
  }

  getStats(): Record<AlertLevel2, number> {
    const stats: Record<AlertLevel2, number> = { info: 0, warning: 0, error: 0, critical: 0 }
    this.alerts.forEach(a => { stats[a.level]++ })
    return stats
  }

  getActiveCount(): number { return this.getActive().length }
  count(): number { return this.alerts.size }

  remove(id: string): boolean { return this.alerts.delete(id) }

  toArray(): Alert2[] { return Array.from(this.alerts.values()) }
  toString(): string { return JSON.stringify({ alerts: this.count(), active: this.getActiveCount() }) }
  toJSON(): Record<string, unknown> { return { alerts: this.count(), active: this.getActiveCount(), stats: this.getStats() } }
  clone(): AlertManager2 {
    const am = new AlertManager2(this.maxAlerts)
    this.alerts.forEach((a, id) => am.alerts.set(id, { ...a, metadata: { ...a.metadata } }))
    am.idCounter = this.idCounter
    this.suppressionRules.forEach((v, k) => am.suppressionRules.set(k, [...v]))
    return am
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AlertManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.alerts.clear()
    this.idCounter = 0
    this.suppressionRules.clear()
    this.handlers = []
  }

  private isSuppressed(source: string, message: string): boolean {
    const patterns = this.suppressionRules.get(source)
    if (!patterns) return false
    return patterns.some(p => message.includes(p))
  }

  private enforceMax(): void {
    if (this.alerts.size > this.maxAlerts) {
      const oldest = Array.from(this.alerts.values())
        .filter(a => a.status === 'resolved')
        .sort((a, b) => a.firedAt - b.firedAt)
      if (oldest.length > 0) this.alerts.delete(oldest[0].id)
    }
  }
}
