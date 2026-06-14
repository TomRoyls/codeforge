export type AdmissionDecision2 = 'accept' | 'reject' | 'queue' | 'shed'

export interface AdmissionRequest2 {
  id: string
  resource: string
  priority: number
  size: number
  metadata: Record<string, unknown>
  timestamp: number
}

export class AdmissionController2 {
  private currentLoad = 0
  private maxCapacity: number
  private queueThreshold: number
  private queue: AdmissionRequest2[] = []
  private shedCount = 0
  private acceptCount = 0
  private rejectCount = 0
  private queueCount = 0
  private priorityThreshold: number
  private perResourceLimits: Map<string, number> = new Map()
  private perResourceCurrent: Map<string, number> = new Map()

  constructor(maxCapacity = 1000, queueThreshold = 500, priorityThreshold = 0) {
    this.maxCapacity = maxCapacity
    this.queueThreshold = queueThreshold
    this.priorityThreshold = priorityThreshold
  }

  admit(request: AdmissionRequest2): AdmissionDecision2 {
    if (request.priority < this.priorityThreshold) {
      this.shedCount++
      return 'shed'
    }

    const resourceLoad = this.perResourceCurrent.get(request.resource) ?? 0
    const resourceLimit = this.perResourceLimits.get(request.resource) ?? Infinity
    if (resourceLoad + request.size > resourceLimit) {
      this.rejectCount++
      return 'reject'
    }

    if (this.currentLoad + request.size > this.maxCapacity) {
      if (this.queue.length >= this.queueThreshold) {
        this.shedCount++
        return 'shed'
      }
      this.queue.push(request)
      this.queueCount++
      return 'queue'
    }

    this.currentLoad += request.size
    this.perResourceCurrent.set(request.resource, resourceLoad + request.size)
    this.acceptCount++
    return 'accept'
  }

  release(size: number, resource?: string): void {
    this.currentLoad = Math.max(0, this.currentLoad - size)
    if (resource) {
      const current = this.perResourceCurrent.get(resource) ?? 0
      this.perResourceCurrent.set(resource, Math.max(0, current - size))
    }
    this.processQueue()
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.currentLoad < this.maxCapacity) {
      const req = this.queue[0]
      if (this.currentLoad + req.size > this.maxCapacity) break
      this.queue.shift()
      this.currentLoad += req.size
      const resourceLoad = this.perResourceCurrent.get(req.resource) ?? 0
      this.perResourceCurrent.set(req.resource, resourceLoad + req.size)
      this.acceptCount++
    }
  }

  setResourceLimit(resource: string, limit: number): this {
    this.perResourceLimits.set(resource, limit)
    return this
  }

  getResourceUsage(resource: string): number {
    return this.perResourceCurrent.get(resource) ?? 0
  }

  getCurrentLoad(): number { return this.currentLoad }
  getMaxCapacity(): number { return this.maxCapacity }
  getUtilization(): number {
    return this.maxCapacity > 0 ? this.currentLoad / this.maxCapacity : 0
  }
  getQueueSize(): number { return this.queue.length }
  getQueueThreshold(): number { return this.queueThreshold }

  getStats(): { accepted: number; rejected: number; queued: number; shed: number } {
    return {
      accepted: this.acceptCount,
      rejected: this.rejectCount,
      queued: this.queueCount,
      shed: this.shedCount,
    }
  }

  setMaxCapacity(capacity: number): this { this.maxCapacity = capacity; return this }
  setPriorityThreshold(threshold: number): this { this.priorityThreshold = threshold; return this }

  count(): number { return this.queue.length }

  toArray(): AdmissionRequest2[] { return [...this.queue] }
  toString(): string { return JSON.stringify({ load: this.currentLoad, capacity: this.maxCapacity, queue: this.queue.length }) }
  toJSON(): Record<string, unknown> { return { load: this.currentLoad, capacity: this.maxCapacity, utilization: this.getUtilization(), stats: this.getStats() } }
  clone(): AdmissionController2 {
    const ac = new AdmissionController2(this.maxCapacity, this.queueThreshold, this.priorityThreshold)
    ac.currentLoad = this.currentLoad
    ac.queue = [...this.queue]
    ac.shedCount = this.shedCount
    ac.acceptCount = this.acceptCount
    ac.rejectCount = this.rejectCount
    ac.queueCount = this.queueCount
    this.perResourceLimits.forEach((v, k) => ac.perResourceLimits.set(k, v))
    this.perResourceCurrent.forEach((v, k) => ac.perResourceCurrent.set(k, v))
    return ac
  }
  equals(other: unknown): boolean {
    if (!(other instanceof AdmissionController2)) return false
    return this.maxCapacity === other.maxCapacity
  }
  clear(): void {
    this.currentLoad = 0
    this.queue = []
    this.shedCount = 0
    this.acceptCount = 0
    this.rejectCount = 0
    this.queueCount = 0
    this.perResourceCurrent.clear()
  }
}
