export interface ScheduledTask {
  id: number
  name: string
  startTime: number
  endTime: number
  priority: number
}

export class IntervalScheduler2 {
  private tasks: ScheduledTask[] = []
  private nextId = 0

  addTask(name: string, startTime: number, endTime: number, priority = 0): number {
    const id = this.nextId++
    this.tasks.push({ id, name, startTime, endTime, priority })
    return id
  }

  removeTask(id: number): boolean {
    const idx = this.tasks.findIndex(t => t.id === id)
    if (idx === -1) return false
    this.tasks.splice(idx, 1)
    return true
  }

  greedySchedule(): ScheduledTask[] {
    const sorted = [...this.tasks].sort((a, b) => a.endTime - b.endTime)
    const result: ScheduledTask[] = []
    let lastEnd = -Infinity
    for (const task of sorted) {
      if (task.startTime >= lastEnd) {
        result.push(task)
        lastEnd = task.endTime
      }
    }
    return result
  }

  weightedSchedule(): ScheduledTask[] {
    const sorted = [...this.tasks].sort((a, b) => a.endTime - b.endTime)
    const n = sorted.length
    if (n === 0) return []
    const dp: number[] = new Array(n).fill(0)
    dp[0] = sorted[0].priority
    for (let i = 1; i < n; i++) {
      const incl = sorted[i].priority + this.latestNonConflict(sorted, i)
      dp[i] = Math.max(incl, dp[i - 1])
    }
    const result: ScheduledTask[] = []
    let i = n - 1
    while (i >= 0) {
      if (i === 0 || dp[i] !== dp[i - 1]) {
        result.unshift(sorted[i])
        i = this.findLatestNonConflict(sorted, i) - 1
      } else i--
    }
    return result
  }

  private latestNonConflict(tasks: ScheduledTask[], i: number): number {
    const idx = this.findLatestNonConflict(tasks, i)
    return idx < 0 ? 0 : dp_helper(tasks, idx)
    function dp_helper(t: ScheduledTask[], j: number): number { return t[j]?.priority ?? 0 }
  }

  private findLatestNonConflict(tasks: ScheduledTask[], i: number): number {
    for (let j = i - 1; j >= 0; j--) {
      if (tasks[j].endTime <= tasks[i].startTime) return j
    }
    return -1
  }

  maxConcurrent(): number {
    const events: [number, number][] = []
    for (const t of this.tasks) {
      events.push([t.startTime, 1])
      events.push([t.endTime, -1])
    }
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    let maxCount = 0, current = 0
    for (const [, delta] of events) {
      current += delta
      maxCount = Math.max(maxCount, current)
    }
    return maxCount
  }

  clear(): void { this.tasks = []; this.nextId = 0 }
  get size(): number { return this.tasks.length }
  toArray(): ScheduledTask[] { return [...this.tasks] }
  toString(): string { return JSON.stringify({ tasks: this.tasks }) }
  toJSON(): Record<string, unknown> { return { tasks: this.tasks } }
  clone(): IntervalScheduler2 {
    const c = new IntervalScheduler2()
    for (const t of this.tasks) c.addTask(t.name, t.startTime, t.endTime, t.priority)
    return c
  }
  equals(other: unknown): boolean { return other instanceof IntervalScheduler2 }
}
