export interface ScheduledTask2 {
  id: string
  name: string
  fn: () => void
  intervalMs: number
  nextRun: number
  runCount: number
  maxRuns: number
  active: boolean
}

export class JobScheduler2 {
  private tasks: Map<string, ScheduledTask2> = new Map()
  private running = false
  private intervalId: ReturnType<typeof setInterval> | null = null
  private checkIntervalMs = 100

  schedule(name: string, fn: () => void, intervalMs: number, maxRuns = Infinity): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    this.tasks.set(id, {
      id, name, fn, intervalMs, maxRuns,
      nextRun: Date.now() + intervalMs,
      runCount: 0,
      active: true,
    })
    return id
  }

  scheduleOnce(name: string, fn: () => void, delayMs: number): string {
    return this.schedule(name, fn, delayMs, 1)
  }

  cancel(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) return false
    task.active = false
    return this.tasks.delete(id)
  }

  cancelByName(name: string): number {
    let count = 0
    for (const [id, task] of this.tasks) {
      if (task.name === name) { this.cancel(id); count++ }
    }
    return count
  }

  pause(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) return false
    task.active = false
    return true
  }

  resume(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) return false
    task.active = true
    task.nextRun = Date.now()
    return true
  }

  tick(): number {
    const now = Date.now()
    let runCount = 0
    for (const [id, task] of this.tasks) {
      if (!task.active) continue
      if (now >= task.nextRun) {
        task.fn()
        task.runCount++
        runCount++
        if (task.runCount >= task.maxRuns) {
          this.tasks.delete(id)
        } else {
          task.nextRun = now + task.intervalMs
        }
      }
    }
    return runCount
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.intervalId = setInterval(() => this.tick(), this.checkIntervalMs)
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  isRunning(): boolean { return this.running }

  getTask(id: string): ScheduledTask2 | undefined {
    return this.tasks.get(id)
  }

  getTaskByName(name: string): ScheduledTask2 | undefined {
    for (const task of this.tasks.values()) {
      if (task.name === name) return task
    }
    return undefined
  }

  getAllTasks(): ScheduledTask2[] {
    return Array.from(this.tasks.values())
  }

  count(): number { return this.tasks.size }

  clear(): void {
    this.stop()
    this.tasks.clear()
  }

  setCheckInterval(ms: number): this {
    this.checkIntervalMs = ms
    return this
  }

  toArray(): string[] { return Array.from(this.tasks.keys()) }
  toString(): string { return JSON.stringify({ count: this.count(), running: this.running }) }
  toJSON(): Record<string, unknown> {
    return { count: this.count(), running: this.running, tasks: this.getAllTasks().map(t => t.name) }
  }
  clone(): JobScheduler2 {
    const s = new JobScheduler2()
    s.checkIntervalMs = this.checkIntervalMs
    return s
  }
  equals(other: unknown): boolean {
    if (!(other instanceof JobScheduler2)) return false
    return this.count() === other.count()
  }
}
