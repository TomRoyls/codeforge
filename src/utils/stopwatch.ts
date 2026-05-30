export interface LapResult {
  duration: number
  label: string
}

export class StopWatch {
  private laps: LapResult[] = []
  private startTime = 0
  private lastLapTime = 0
  private running = false

  get elapsed(): number {
    if (!this.running) return 0
    return performance.now() - this.startTime
  }

  get lapCount(): number {
    return this.laps.length
  }

  get lapResults(): readonly LapResult[] {
    return this.laps
  }

  lap(label: string): number {
    if (!this.running) return 0
    const now = performance.now()
    const duration = now - this.lastLapTime
    this.laps.push({ duration, label })
    this.lastLapTime = now
    return duration
  }

  reset(): void {
    this.laps = []
    this.running = false
    this.startTime = 0
    this.lastLapTime = 0
  }

  restart(): void {
    this.reset()
    this.start()
  }

  start(): void {
    if (this.running) return
    this.startTime = performance.now()
    this.lastLapTime = this.startTime
    this.running = true
  }

  stop(): number {
    if (!this.running) return 0
    const total = performance.now() - this.startTime
    this.running = false
    return total
  }

  get totalLapTime(): number {
    let total = 0
    for (const lap of this.laps) {
      total += lap.duration
    }
    return total
  }

  get averageLapTime(): number {
    if (this.laps.length === 0) return 0
    return this.totalLapTime / this.laps.length
  }

  get longestLap(): LapResult | null {
    if (this.laps.length === 0) return null
    let longest = this.laps[0]!
    for (let i = 1; i < this.laps.length; i++) {
      const lap = this.laps[i]!
      if (lap.duration > longest.duration) {
        longest = lap
      }
    }
    return longest
  }

  get shortestLap(): LapResult | null {
    if (this.laps.length === 0) return null
    let shortest = this.laps[0]!
    for (let i = 1; i < this.laps.length; i++) {
      const lap = this.laps[i]!
      if (lap.duration < shortest.duration) {
        shortest = lap
      }
    }
    return shortest
  }

  formatResults(): string {
    const lines: string[] = []
    for (const lap of this.laps) {
      lines.push(`  ${lap.label}: ${lap.duration.toFixed(2)}ms`)
    }
    return lines.join('\n')
  }
}

export function measureTime<T>(fn: () => T): { duration: number; result: T } {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start
  return { duration, result }
}

export async function measureTimeAsync<T>(fn: () => Promise<T>): Promise<{ duration: number; result: T }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { duration, result }
}
