const NS_PER_MS = 1_000_000

export class Timer {
  private endTime: null | number = null
  private startTime: number

  constructor() {
    this.startTime = performance.now()
  }

  static measure<T>(fn: () => T): { result: T; elapsed: number } {
    const timer = new Timer()
    const result = fn()
    return { elapsed: timer.stop(), result }
  }

  static async measureAsync<T>(fn: () => Promise<T>): Promise<{ elapsed: number; result: T }> {
    const timer = new Timer()
    const result = await fn()
    return { elapsed: timer.stop(), result }
  }

  stop(): number {
    if (this.endTime === null) {
      this.endTime = performance.now()
    }
    return this.endTime - this.startTime
  }

  elapsed(): number {
    const end = this.endTime ?? performance.now()
    return end - this.startTime
  }

  elapsedSeconds(): number {
    return this.elapsed() / 1000
  }

  elapsedNanoseconds(): number {
    return this.elapsed() * NS_PER_MS
  }

  reset(): void {
    this.startTime = performance.now()
    this.endTime = null
  }

  isRunning(): boolean {
    return this.endTime === null
  }
}
