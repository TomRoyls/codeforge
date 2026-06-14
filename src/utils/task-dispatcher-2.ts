export type TaskState2 = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface Task2 {
  id: string
  name: string
  state: TaskState2
  priority: number
  submittedAt: number
  startedAt: number | null
  completedAt: number | null
  result: unknown
  error: string | null
  retries: number
  maxRetries: number
  tags: string[]
  fn: () => unknown
}

export class TaskDispatcher2 {
  private tasks: Map<string, Task2> = new Map()
  private queue: string[] = []
  private completed: string[] = []
  private failed: string[] = []
  private idCounter = 0
  private maxConcurrent: number = 4
  private running: Set<string> = new Set()
  private listeners: Array<(event: string, task: Task2) => void> = []
  private maxQueueSize: number = 10000

  setMaxConcurrent(n: number): this { this.maxConcurrent = n; return this }
  setMaxQueueSize(n: number): this { this.maxQueueSize = n; return this }

  submit(name: string, fn: () => unknown, priority = 0, tags: string[] = []): string {
    const id = `task_${++this.idCounter}`
    const task: Task2 = {
      id, name, fn, priority, tags,
      state: 'queued',
      submittedAt: Date.now(),
      startedAt: null, completedAt: null,
      result: undefined, error: null,
      retries: 0, maxRetries: 3,
    }
    this.tasks.set(id, task)
    this.queue.push(id)
    this.sortQueue()
    this.notify('submitted', task)
    return id
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      const ta = this.tasks.get(a)!
      const tb = this.tasks.get(b)!
      if (ta.priority !== tb.priority) return tb.priority - ta.priority
      return ta.submittedAt - tb.submittedAt
    })
  }

  next(): string | null {
    if (this.running.size >= this.maxConcurrent) return null
    while (this.queue.length > 0) {
      const id = this.queue.shift()!
      const task = this.tasks.get(id)
      if (!task || task.state === 'cancelled') continue
      task.state = 'running'
      task.startedAt = Date.now()
      this.running.add(id)
      this.notify('started', task)
      return id
    }
    return null
  }

  execute(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task || task.state !== 'running') return false
    try {
      task.result = task.fn()
      task.state = 'completed'
      task.completedAt = Date.now()
      this.completed.push(id)
      this.notify('completed', task)
    } catch (e) {
      task.error = String(e)
      if (task.retries < task.maxRetries) {
        task.retries++
        task.state = 'queued'
        task.startedAt = null
        this.queue.push(id)
        this.sortQueue()
        this.notify('retried', task)
      } else {
        task.state = 'failed'
        task.completedAt = Date.now()
        this.failed.push(id)
        this.notify('failed', task)
      }
    }
    this.running.delete(id)
    return true
  }

  runOne(): boolean {
    const id = this.next()
    if (!id) return false
    return this.execute(id)
  }

  runAll(): number {
    let count = 0
    while (this.runOne()) count++
    return count
  }

  cancel(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task || task.state === 'completed' || task.state === 'failed') return false
    task.state = 'cancelled'
    this.queue = this.queue.filter(qid => qid !== id)
    this.running.delete(id)
    this.notify('cancelled', task)
    return true
  }

  get(id: string): Task2 | undefined { return this.tasks.get(id) }
  getResult(id: string): unknown { return this.tasks.get(id)?.result }
  getState(id: string): TaskState2 | undefined { return this.tasks.get(id)?.state }

  getByTag(tag: string): Task2[] {
    return Array.from(this.tasks.values()).filter(t => t.tags.includes(tag))
  }

  getByState(state: TaskState2): Task2[] {
    return Array.from(this.tasks.values()).filter(t => t.state === state)
  }

  getQueue(): Task2[] { return this.queue.map(id => this.tasks.get(id)!).filter(Boolean) }
  getCompleted(): Task2[] { return this.completed.map(id => this.tasks.get(id)!).filter(Boolean) }
  getFailed(): Task2[] { return this.failed.map(id => this.tasks.get(id)!).filter(Boolean) }

  requeue(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task || task.state !== 'failed') return false
    task.state = 'queued'
    task.retries = 0
    task.error = null
    this.failed = this.failed.filter(fid => fid !== id)
    this.queue.push(id)
    this.sortQueue()
    this.notify('requeued', task)
    return true
  }

  setPriority(id: string, priority: number): boolean {
    const task = this.tasks.get(id)
    if (!task) return false
    task.priority = priority
    this.sortQueue()
    return true
  }

  setMaxRetries(id: string, max: number): boolean {
    const task = this.tasks.get(id)
    if (!task) return false
    task.maxRetries = max
    return true
  }

  listen(fn: (event: string, task: Task2) => void): this {
    this.listeners.push(fn)
    return this
  }

  private notify(event: string, task: Task2): void {
    this.listeners.forEach(fn => fn(event, task))
  }

  getStats(): { total: number; queued: number; running: number; completed: number; failed: number; cancelled: number } {
    return {
      total: this.tasks.size,
      queued: this.queue.length,
      running: this.running.size,
      completed: this.completed.length,
      failed: this.failed.length,
      cancelled: this.getByState('cancelled').length,
    }
  }

  count(): number { return this.tasks.size }

  toArray(): Task2[] { return Array.from(this.tasks.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): TaskDispatcher2 {
    const td = new TaskDispatcher2()
    this.tasks.forEach((t, id) => td.tasks.set(id, { ...t, tags: [...t.tags] }))
    td.queue = [...this.queue]
    td.completed = [...this.completed]
    td.failed = [...this.failed]
    td.idCounter = this.idCounter
    td.maxConcurrent = this.maxConcurrent
    td.maxQueueSize = this.maxQueueSize
    return td
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TaskDispatcher2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.tasks.clear()
    this.queue = []
    this.completed = []
    this.failed = []
    this.running.clear()
    this.listeners = []
    this.idCounter = 0
  }
}
