export class GCRA2 {
  private tat = 0
  private intervalMs: number
  private delayMs: number

  constructor(requestsPerPeriod: number, periodMs: number) {
    this.intervalMs = periodMs / requestsPerPeriod
    this.delayMs = periodMs
  }

  tryRequest(now = Date.now()): boolean {
    const arrival = Math.max(now, this.tat)
    const newTAT = arrival + this.intervalMs
    const allowedAt = newTAT - this.delayMs
    if (now < allowedAt) return false
    this.tat = newTAT
    return true
  }

  timeUntilNextRequest(now = Date.now()): number {
    const arrival = Math.max(now, this.tat)
    const newTAT = arrival + this.intervalMs
    const allowedAt = newTAT - this.delayMs
    return Math.max(0, allowedAt - now)
  }

  getTAT(): number { return this.tat }
  getInterval(): number { return this.intervalMs }
  getDelay(): number { return this.delayMs }

  reset(): void {
    this.tat = 0
  }

  burstSize(): number {
    return Math.ceil(this.delayMs / this.intervalMs)
  }

  toArray(): number[] { return [this.tat, this.intervalMs, this.delayMs] }
  toString(): string { return JSON.stringify({ tat: this.tat, interval: this.intervalMs, delay: this.delayMs }) }
  toJSON(): Record<string, number> { return { tat: this.tat, interval: this.intervalMs, delay: this.delayMs } }
  clone(): GCRA2 {
    const g = new GCRA2(this.delayMs / this.intervalMs, this.delayMs)
    g.tat = this.tat
    return g
  }
  equals(other: unknown): boolean {
    if (!(other instanceof GCRA2)) return false
    return this.intervalMs === other.intervalMs && this.delayMs === other.delayMs
  }
}
