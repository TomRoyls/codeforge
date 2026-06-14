export type ShedPolicy2 = 'oldest' | 'newest' | 'random' | 'lowest-priority'
export type LoadLevel2 = 'low' | 'medium' | 'high' | 'critical' | 'overload'

export interface ShedRequest2 {
  id: string
  priority: number
  queuedAt: number
  size: number
}

export class LoadShedder2 {
  private queue: ShedRequest2[] = []
  private maxQueueSize: number = 10000
  private maxConcurrent: number = 100
  private active: number = 0
  private shedCount: number = 0
  private totalAccepted: number = 0
  private policy: ShedPolicy2 = 'lowest-priority'
  private listeners: Array<(event: string, req: ShedRequest2 | null) => void> = []
  private loadLevels: Map<LoadLevel2, number> = new Map([
    ['low', 0.25], ['medium', 0.5], ['high', 0.75], ['critical', 0.9], ['overload', 1.0],
  ])
  private idCounter = 0
  private shedThreshold: number = 0.9

  setMaxQueueSize(n: number): this { this.maxQueueSize = n; return this }
  setMaxConcurrent(n: number): this { this.maxConcurrent = n; return this }
  setPolicy(p: ShedPolicy2): this { this.policy = p; return this }
  setShedThreshold(r: number): this { this.shedThreshold = r; return this }

  getLoadRatio(): number {
    return this.maxConcurrent === 0 ? 1 : this.active / this.maxConcurrent
  }

  getLoadLevel(): LoadLevel2 {
    const ratio = this.getLoadRatio()
    let level: LoadLevel2 = 'low'
    this.loadLevels.forEach((threshold, name) => {
      if (ratio >= threshold) level = name
    })
    return level
  }

  shouldShed(priority = 0): boolean {
    if (this.getLoadRatio() >= this.shedThreshold) return true
    if (this.queue.length >= this.maxQueueSize) return true
    return false
  }

  admit(priority = 0, size = 1): boolean {
    if (this.shouldShed(priority)) {
      this.shedCount++
      this.notify('shed', null)
      return false
    }
    const req: ShedRequest2 = {
      id: `req_${++this.idCounter}`,
      priority,
      queuedAt: Date.now(),
      size,
    }
    this.queue.push(req)
    this.totalAccepted++
    this.notify('admitted', req)
    return true
  }

  acquire(): ShedRequest2 | null {
    if (this.active >= this.maxConcurrent) return null
    if (this.queue.length === 0) return null
    const req = this.selectNext()
    if (!req) return null
    this.active++
    this.notify('acquired', req)
    return req
  }

  release(id: string): boolean {
    const idx = this.queue.findIndex(r => r.id === id)
    if (idx !== -1) {
      this.queue.splice(idx, 1)
      this.active = Math.max(0, this.active - 1)
      this.notify('released', null)
      return true
    }
    this.active = Math.max(0, this.active - 1)
    return false
  }

  private selectNext(): ShedRequest2 | null {
    if (this.queue.length === 0) return null
    let idx = 0
    switch (this.policy) {
      case 'oldest':
        idx = 0
        break
      case 'newest':
        idx = this.queue.length - 1
        break
      case 'random':
        idx = Math.floor(Math.random() * this.queue.length)
        break
      case 'lowest-priority':
        idx = this.queue.reduce((minIdx, req, i, arr) => req.priority < arr[minIdx].priority ? i : minIdx, 0)
        break
    }
    return this.queue.splice(idx, 1)[0] || null
  }

  shedOldest(n: number): number {
    let shed = 0
    while (shed < n && this.queue.length > 0) {
      this.queue.shift()
      shed++
      this.shedCount++
    }
    if (shed > 0) this.notify('bulk-shed', null)
    return shed
  }

  shedByPriority(maxPriority: number): number {
    const before = this.queue.length
    this.queue = this.queue.filter(r => r.priority > maxPriority)
    const shed = before - this.queue.length
    this.shedCount += shed
    return shed
  }

  getQueueLength(): number { return this.queue.length }
  getActiveCount(): number { return this.active }

  listen(fn: (event: string, req: ShedRequest2 | null) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, req: ShedRequest2 | null): void {
    this.listeners.forEach(fn => fn(event, req))
  }

  getStats(): { accepted: number; shed: number; active: number; queued: number; loadRatio: number; loadLevel: string } {
    return {
      accepted: this.totalAccepted,
      shed: this.shedCount,
      active: this.active,
      queued: this.queue.length,
      loadRatio: this.getLoadRatio(),
      loadLevel: this.getLoadLevel(),
    }
  }

  count(): number { return this.queue.length + this.active }

  toArray(): ShedRequest2[] { return [...this.queue] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): LoadShedder2 {
    const ls = new LoadShedder2()
    ls.queue = [...this.queue]
    ls.maxQueueSize = this.maxQueueSize
    ls.maxConcurrent = this.maxConcurrent
    ls.active = this.active
    ls.shedCount = this.shedCount
    ls.totalAccepted = this.totalAccepted
    ls.policy = this.policy
    ls.shedThreshold = this.shedThreshold
    return ls
  }
  equals(other: unknown): boolean {
    if (!(other instanceof LoadShedder2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.queue = []
    this.active = 0
    this.shedCount = 0
    this.totalAccepted = 0
    this.listeners = []
    this.idCounter = 0
  }
}
