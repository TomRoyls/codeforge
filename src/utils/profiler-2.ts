export interface ProfileEntry {
  name: string
  duration: number
  calls: number
  children: ProfileEntry[]
}

export class Profiler2 {
  private entries = new Map<string, { duration: number; calls: number }>()
  private stack: { name: string; start: number }[] = []

  start(name: string): void {
    this.stack.push({ name, start: performance.now() })
  }

  end(): number {
    const frame = this.stack.pop()
    if (!frame) return 0
    const duration = performance.now() - frame.start
    const entry = this.entries.get(frame.name)
    if (entry) {
      entry.duration += duration
      entry.calls++
    } else {
      this.entries.set(frame.name, { duration, calls: 1 })
    }
    return duration
  }

  measure<T>(name: string, fn: () => T): T {
    this.start(name)
    const result = fn()
    this.end()
    return result
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name)
    const result = await fn()
    this.end()
    return result
  }

  getEntry(name: string): { duration: number; calls: number } | undefined {
    return this.entries.get(name)
  }

  getReport(): ProfileEntry[] {
    return [...this.entries.entries()].map(([name, { duration, calls }]) => ({
      name, duration, calls, children: [],
    }))
  }

  get entryCount(): number { return this.entries.size }

  reset(): void {
    this.entries.clear()
    this.stack = []
  }

  toArray(): string[] { return [...this.entries.keys()] }
  toString(): string { return JSON.stringify({ entries: this.entryCount }) }
  toJSON(): Record<string, number> { return { entries: this.entryCount } }
  clone(): Profiler2 { return new Profiler2() }
  equals(other: unknown): boolean { return other instanceof Profiler2 }
}
