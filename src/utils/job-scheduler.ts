export class JobScheduler {
  private jobs = new Map<number, { id: number; interval: number; lastRun: number; fn: () => void }>()
  private nextId = 1
  private currentTime = 0

  schedule(fn: () => void, interval: number): number {
    const id = this.nextId++
    this.jobs.set(id, { id, interval, lastRun: this.currentTime, fn })
    return id
  }

  cancel(id: number): boolean { return this.jobs.delete(id) }

  tick(time: number): void {
    this.currentTime = time
    for (const job of this.jobs.values()) {
      while (time - job.lastRun >= job.interval) {
        job.fn()
        job.lastRun += job.interval
      }
    }
  }

  get size(): number { return this.jobs.size }
  get isEmpty(): boolean { return this.jobs.size === 0 }

  clear(): void { this.jobs.clear(); this.nextId = 1; this.currentTime = 0 }

  toArray(): number[] { return Array.from(this.jobs.keys()) }
  toString(): string { return JSON.stringify({ jobs: this.jobs.size, time: this.currentTime }) }
  toJSON(): Record<string, number> { return { jobs: this.jobs.size, time: this.currentTime } }

  clone(): JobScheduler {
    const c = new JobScheduler()
    c.nextId = this.nextId
    c.currentTime = this.currentTime
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof JobScheduler)) return false
    return this.size === other.size
  }
}
