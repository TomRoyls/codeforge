export type BulkheadStatus2 = 'active' | 'rejected' | 'timeout' | 'completed' | 'failed'

export interface BulkheadTask2 {
  id: string
  pool: string
  status: BulkheadStatus2
  startedAt: number
  completedAt: number | null
  result: unknown
  error: string | null
}

export interface BulkheadPool2 {
  name: string
  maxConcurrent: number
  maxQueueSize: number
  active: number
  queued: number
  completed: number
  rejected: number
  failed: number
  timeout: number
}

export class Bulkhead2 {
  private pools: Map<string, BulkheadPool2> = new Map()
  private tasks: Map<string, BulkheadTask2> = new Map()
  private queue: Map<string, Array<{ task: BulkheadTask2; fn: () => unknown; resolve: (v: unknown) => void; reject: (e: Error) => void }>> = new Map()
  private idCounter = 0

  createPool(name: string, maxConcurrent: number, maxQueueSize: number, timeout = 30000): boolean {
    if (this.pools.has(name)) return false
    this.pools.set(name, { name, maxConcurrent, maxQueueSize, active: 0, queued: 0, completed: 0, rejected: 0, failed: 0, timeout })
    this.queue.set(name, [])
    return true
  }

  removePool(name: string): boolean {
    const pool = this.pools.get(name)
    if (!pool) return false
    if (pool.active > 0) return false
    this.pools.delete(name)
    this.queue.delete(name)
    return true
  }

  getPool(name: string): BulkheadPool2 | undefined { return this.pools.get(name) }

  setMaxConcurrent(name: string, max: number): boolean {
    const pool = this.pools.get(name)
    if (!pool) return false
    pool.maxConcurrent = max
    return true
  }

  setMaxQueueSize(name: string, max: number): boolean {
    const pool = this.pools.get(name)
    if (!pool) return false
    pool.maxQueueSize = max
    return true
  }

  submit<T>(poolName: string, fn: () => T): { accepted: boolean; taskId: string | null } {
    const pool = this.pools.get(poolName)
    if (!pool) return { accepted: false, taskId: null }

    const taskId = `task_${++this.idCounter}`
    const task: BulkheadTask2 = {
      id: taskId, pool: poolName, status: 'active',
      startedAt: Date.now(), completedAt: null, result: null, error: null,
    }

    if (pool.active < pool.maxConcurrent) {
      pool.active++
      this.tasks.set(taskId, task)
      this.execute(poolName, taskId, fn)
      return { accepted: true, taskId }
    }

    if (pool.queued < pool.maxQueueSize) {
      task.status = 'rejected'
      pool.queued++
      this.tasks.set(taskId, task)
      this.queue.get(poolName)!.push({ task, fn, resolve: () => {}, reject: () => {} })
      return { accepted: true, taskId }
    }

    pool.rejected++
    return { accepted: false, taskId: null }
  }

  private execute(poolName: string, taskId: string, fn: () => unknown): void {
    const pool = this.pools.get(poolName)!
    const task = this.tasks.get(taskId)!
    task.status = 'active'

    try {
      const result = fn()
      task.result = result
      task.status = 'completed'
      task.completedAt = Date.now()
      pool.completed++
    } catch (e) {
      task.error = String(e)
      task.status = 'failed'
      task.completedAt = Date.now()
      pool.failed++
    }

    pool.active--
    this.processQueue(poolName)
  }

  private processQueue(poolName: string): void {
    const pool = this.pools.get(poolName)
    if (!pool) return
    const queue = this.queue.get(poolName)
    if (!queue || queue.length === 0) return

    while (pool.active < pool.maxConcurrent && queue.length > 0) {
      const item = queue.shift()!
      pool.queued--
      const task = this.tasks.get(item.task.id)
      if (task) {
        task.status = 'active'
        pool.active++
        this.execute(poolName, item.task.id, item.fn)
      }
    }
  }

  getTask(id: string): BulkheadTask2 | undefined { return this.tasks.get(id) }
  getActiveTasks(poolName?: string): BulkheadTask2[] {
    return Array.from(this.tasks.values()).filter(t =>
      (t.status === 'active') && (!poolName || t.pool === poolName),
    )
  }
  getQueuedTasks(poolName?: string): BulkheadTask2[] {
    return Array.from(this.tasks.values()).filter(t =>
      t.status === 'rejected' && (!poolName || t.pool === poolName),
    )
  }

  getPoolStats(name: string): BulkheadPool2 | undefined { return this.pools.get(name) }

  getStats(): { pools: number; totalTasks: number; totalCompleted: number; totalRejected: number } {
    let totalCompleted = 0
    let totalRejected = 0
    this.pools.forEach(p => {
      totalCompleted += p.completed
      totalRejected += p.rejected
    })
    return { pools: this.pools.size, totalTasks: this.tasks.size, totalCompleted, totalRejected }
  }

  count(): number { return this.pools.size }

  toArray(): BulkheadPool2[] { return Array.from(this.pools.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): Bulkhead2 {
    const b = new Bulkhead2()
    this.pools.forEach((p, n) => b.pools.set(n, { ...p }))
    this.tasks.forEach((t, id) => b.tasks.set(id, { ...t }))
    b.idCounter = this.idCounter
    return b
  }
  equals(other: unknown): boolean {
    if (!(other instanceof Bulkhead2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.pools.clear()
    this.tasks.clear()
    this.queue.clear()
    this.idCounter = 0
  }
}
