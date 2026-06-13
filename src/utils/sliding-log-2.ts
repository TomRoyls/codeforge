export interface SlidingLogEntry {
  timestamp: number
}

export class SlidingLog2 {
  private log: SlidingLogEntry[] = []
  private windowMs: number
  private maxRequests: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  tryRequest(): boolean {
    const now = Date.now()
    const cutoff = now - this.windowMs
    this.log = this.log.filter(entry => entry.timestamp >= cutoff)
    if (this.log.length >= this.maxRequests) return false
    this.log.push({ timestamp: now })
    return true
  }

  currentCount(): number {
    const now = Date.now()
    const cutoff = now - this.windowMs
    return this.log.filter(e => e.timestamp >= cutoff).length
  }

  timeUntilNextSlot(): number {
    if (this.currentCount() < this.maxRequests) return 0
    const now = Date.now()
    const cutoff = now - this.windowMs
    const validEntries = this.log.filter(e => e.timestamp >= cutoff)
    if (validEntries.length === 0) return 0
    const oldest = Math.min(...validEntries.map(e => e.timestamp))
    return Math.max(0, oldest + this.windowMs - now)
  }

  getLog(): SlidingLogEntry[] {
    const now = Date.now()
    const cutoff = now - this.windowMs
    return this.log.filter(e => e.timestamp >= cutoff)
  }

  clear(): void {
    this.log = []
  }

  getMaxRequests(): number { return this.maxRequests }
  getWindowMs(): number { return this.windowMs }

  setMaxRequests(n: number): this { this.maxRequests = n; return this }
  setWindowMs(ms: number): this { this.windowMs = ms; return this }

  utilizationRatio(): number {
    return this.currentCount() / this.maxRequests
  }

  toArray(): number[] { return this.getLog().map(e => e.timestamp) }
  toString(): string { return JSON.stringify({ count: this.currentCount(), max: this.maxRequests }) }
  toJSON(): Record<string, number> { return { count: this.currentCount(), max: this.maxRequests, window: this.windowMs } }
  clone(): SlidingLog2 {
    const sl = new SlidingLog2(this.maxRequests, this.windowMs)
    sl.log = [...this.log]
    return sl
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SlidingLog2)) return false
    return this.maxRequests === other.maxRequests && this.windowMs === other.windowMs
  }
}
