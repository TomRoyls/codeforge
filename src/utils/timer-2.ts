export class Timer2 {
  private startTime: number | null = null
  private elapsedTime = 0
  private running = false

  start(): void {
    if (this.running) return
    this.startTime = Date.now()
    this.running = true
  }

  stop(): number {
    if (!this.running) return this.elapsedTime
    this.elapsedTime += Date.now() - (this.startTime ?? 0)
    this.running = false
    this.startTime = null
    return this.elapsedTime
  }

  reset(): void {
    this.elapsedTime = 0
    this.startTime = null
    this.running = false
  }

  get elapsed(): number {
    if (this.running && this.startTime !== null) {
      return this.elapsedTime + (Date.now() - this.startTime)
    }
    return this.elapsedTime
  }

  get isRunning(): boolean { return this.running }
  get isStopped(): boolean { return !this.running }

  get name(): string { return 'Timer2' }

  toArray(): number[] { return [this.elapsed] }
  toString(): string { return JSON.stringify({ elapsed: this.elapsed, running: this.running }) }
  toJSON(): Record<string, number> { return { elapsed: this.elapsed } }

  clone(): Timer2 {
    const c = new Timer2()
    c.elapsedTime = this.elapsedTime
    c.running = this.running
    c.startTime = this.startTime
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Timer2)) return false
    return this.elapsedTime === other.elapsedTime
  }
}
