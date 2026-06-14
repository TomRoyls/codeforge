export type ReplayStatus2 = 'pending' | 'running' | 'completed' | 'paused' | 'failed' | 'cancelled'

export interface ReplayTarget2 {
  stream: string
  handler: (event: Record<string, unknown>) => void
  filters: Array<(event: Record<string, unknown>) => boolean>
  transforms: Array<(event: Record<string, unknown>) => Record<string, unknown>>
}

export interface ReplayResult2 {
  id: string
  status: ReplayStatus2
  totalEvents: number
  processedEvents: number
  failedEvents: number
  skippedEvents: number
  startedAt: number
  completedAt: number | null
  fromVersion: number
  toVersion: number
  speed: number
  errors: string[]
}

export class EventReplayer2 {
  private replays: Map<string, ReplayResult2> = new Map()
  private targets: Map<string, ReplayTarget2> = new Map()
  private idCounter = 0
  private defaultBatchSize: number = 100
  private defaultSpeed: number = 1

  addTarget(id: string, stream: string, handler: (event: Record<string, unknown>) => void): this {
    this.targets.set(id, { stream, handler, filters: [], transforms: [] })
    return this
  }

  removeTarget(id: string): boolean { return this.targets.delete(id) }

  addFilter(targetId: string, filter: (event: Record<string, unknown>) => boolean): boolean {
    const target = this.targets.get(targetId)
    if (!target) return false
    target.filters.push(filter)
    return true
  }

  addTransform(targetId: string, transform: (event: Record<string, unknown>) => Record<string, unknown>): boolean {
    const target = this.targets.get(targetId)
    if (!target) return false
    target.transforms.push(transform)
    return true
  }

  start(stream: string, events: Array<Record<string, unknown>>, targetIds: string[], fromVersion = 0, speed = 1): string {
    const id = `replay_${++this.idCounter}`
    const result: ReplayResult2 = {
      id, status: 'running',
      totalEvents: events.length,
      processedEvents: 0,
      failedEvents: 0,
      skippedEvents: 0,
      startedAt: Date.now(),
      completedAt: null,
      fromVersion, toVersion: fromVersion + events.length,
      speed,
      errors: [],
    }

    const targets = targetIds.map(tid => this.targets.get(tid)).filter(Boolean) as ReplayTarget2[]

    for (const event of events) {
      const version = Number(event.version ?? result.processedEvents + fromVersion)
      if (version < fromVersion) { result.skippedEvents++; continue }

      let processed = event
      try {
        for (const target of targets) {
          if (target.stream !== stream) continue
          let shouldProcess = target.filters.every(f => f(processed))
          if (!shouldProcess) { result.skippedEvents++; continue }
          for (const transform of target.transforms) {
            processed = transform(processed)
          }
          target.handler(processed)
        }
        result.processedEvents++
      } catch (e) {
        result.failedEvents++
        result.errors.push(String(e))
      }
    }

    result.status = result.failedEvents > 0 && result.processedEvents === 0 ? 'failed' : 'completed'
    result.completedAt = Date.now()
    this.replays.set(id, result)
    return id
  }

  get(id: string): ReplayResult2 | undefined { return this.replays.get(id) }
  getStatus(id: string): ReplayStatus2 | undefined { return this.replays.get(id)?.status }

  cancel(id: string): boolean {
    const replay = this.replays.get(id)
    if (!replay || replay.status !== 'running') return false
    replay.status = 'cancelled'
    replay.completedAt = Date.now()
    return true
  }

  getCompleted(): ReplayResult2[] {
    return Array.from(this.replays.values()).filter(r => r.status === 'completed')
  }

  getFailed(): ReplayResult2[] {
    return Array.from(this.replays.values()).filter(r => r.status === 'failed')
  }

  getRecent(limit = 10): ReplayResult2[] {
    return [...this.replays.values()].reverse().slice(0, limit)
  }

  setDefaultBatchSize(size: number): this { this.defaultBatchSize = size; return this }
  setDefaultSpeed(speed: number): this { this.defaultSpeed = speed; return this }

  getStats(): { total: number; completed: number; failed: number; running: number; totalEventsProcessed: number } {
    let totalEventsProcessed = 0
    this.replays.forEach(r => { totalEventsProcessed += r.processedEvents })
    return {
      total: this.replays.size,
      completed: this.getCompleted().length,
      failed: this.getFailed().length,
      running: Array.from(this.replays.values()).filter(r => r.status === 'running').length,
      totalEventsProcessed,
    }
  }

  count(): number { return this.replays.size }

  toArray(): ReplayResult2[] { return Array.from(this.replays.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): EventReplayer2 {
    const er = new EventReplayer2()
    this.replays.forEach((r, id) => er.replays.set(id, { ...r, errors: [...r.errors] }))
    this.targets.forEach((t, id) => er.targets.set(id, { ...t, filters: [...t.filters], transforms: [...t.transforms] }))
    er.idCounter = this.idCounter
    return er
  }
  equals(other: unknown): boolean {
    if (!(other instanceof EventReplayer2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.replays.clear()
    this.targets.clear()
    this.idCounter = 0
  }
}
