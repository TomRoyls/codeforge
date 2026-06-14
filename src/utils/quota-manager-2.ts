export interface QuotaBucket2 {
  key: string
  limit: number
  remaining: number
  resetAt: number
  used: number
}

export interface QuotaViolation2 {
  key: string
  requested: number
  available: number
  timestamp: number
}

export class QuotaManager2 {
  private buckets: Map<string, QuotaBucket2> = new Map()
  private violations: QuotaViolation2[] = []
  private windowMs: number
  private onViolation: ((v: QuotaViolation2) => void) | null = null

  constructor(windowMs = 3600000) {
    this.windowMs = windowMs
  }

  define(key: string, limit: number): this {
    this.buckets.set(key, {
      key, limit, remaining: limit, used: 0,
      resetAt: Date.now() + this.windowMs,
    })
    return this
  }

  check(key: string, amount: number): boolean {
    const bucket = this.getOrReset(key)
    if (!bucket) return false
    this.maybeReset(bucket)
    return bucket.remaining >= amount
  }

  consume(key: string, amount: number): boolean {
    const bucket = this.getOrReset(key)
    if (!bucket) return false
    this.maybeReset(bucket)
    if (bucket.remaining < amount) {
      const violation: QuotaViolation2 = {
        key, requested: amount, available: bucket.remaining,
        timestamp: Date.now(),
      }
      this.violations.push(violation)
      if (this.onViolation) this.onViolation(violation)
      return false
    }
    bucket.remaining -= amount
    bucket.used += amount
    return true
  }

  release(key: string, amount: number): boolean {
    const bucket = this.buckets.get(key)
    if (!bucket) return false
    bucket.remaining = Math.min(bucket.limit, bucket.remaining + amount)
    bucket.used = Math.max(0, bucket.used - amount)
    return true
  }

  refill(key: string): boolean {
    const bucket = this.buckets.get(key)
    if (!bucket) return false
    bucket.remaining = bucket.limit
    bucket.used = 0
    bucket.resetAt = Date.now() + this.windowMs
    return true
  }

  getBucket(key: string): QuotaBucket2 | undefined { return this.buckets.get(key) }

  getRemaining(key: string): number {
    const bucket = this.buckets.get(key)
    return bucket ? bucket.remaining : 0
  }

  getLimit(key: string): number {
    const bucket = this.buckets.get(key)
    return bucket ? bucket.limit : 0
  }

  getUsagePercent(key: string): number {
    const bucket = this.buckets.get(key)
    if (!bucket || bucket.limit === 0) return 0
    return (bucket.used / bucket.limit) * 100
  }

  getUtilization(key: string): number {
    const bucket = this.buckets.get(key)
    if (!bucket || bucket.limit === 0) return 0
    return bucket.remaining / bucket.limit
  }

  setViolationHandler(handler: (v: QuotaViolation2) => void): this {
    this.onViolation = handler
    return this
  }

  getViolations(): QuotaViolation2[] { return [...this.violations] }
  getViolationCount(): number { return this.violations.length }
  clearViolations(): void { this.violations = [] }

  remove(key: string): boolean { return this.buckets.delete(key) }

  getKeys(): string[] { return Array.from(this.buckets.keys()) }

  count(): number { return this.buckets.size }

  private getOrReset(key: string): QuotaBucket2 | undefined {
    let bucket = this.buckets.get(key)
    if (!bucket) return undefined
    return bucket
  }

  private maybeReset(bucket: QuotaBucket2): void {
    if (Date.now() >= bucket.resetAt) {
      bucket.remaining = bucket.limit
      bucket.used = 0
      bucket.resetAt = Date.now() + this.windowMs
    }
  }

  toArray(): QuotaBucket2[] { return Array.from(this.buckets.values()) }
  toString(): string { return JSON.stringify({ buckets: this.count(), violations: this.getViolationCount() }) }
  toJSON(): Record<string, unknown> { return { buckets: this.count(), violations: this.getViolationCount() } }
  clone(): QuotaManager2 {
    const qm = new QuotaManager2(this.windowMs)
    this.buckets.forEach((b, k) => qm.buckets.set(k, { ...b }))
    qm.violations = [...this.violations]
    qm.onViolation = this.onViolation
    return qm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof QuotaManager2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.buckets.clear()
    this.violations = []
  }
}
