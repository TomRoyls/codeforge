import type { Task, TaskResult, RunnerStats, SchedulerConfig } from './types.js'
import { DEFAULT_SCHEDULER_CONFIG } from './types.js'
import { TaskQueue } from './task-queue.js'
import { TaskScheduler } from './task-scheduler.js'

type CompleteCallback = (result: TaskResult) => void
type ErrorCallback = (result: TaskResult) => void

export class TaskRunner {
  private config: SchedulerConfig
  private scheduler: TaskScheduler
  private queue: TaskQueue
  private results: TaskResult[] = []
  private completeCallbacks: CompleteCallback[] = []
  private errorCallbacks: ErrorCallback[] = []
  private taskCounter: number = 0
  private cancelledTasks: Set<string> = new Set()
  private maxConcurrentObserved: number = 0

  constructor(config?: Partial<SchedulerConfig>) {
    this.config = { ...DEFAULT_SCHEDULER_CONFIG, ...config }
    this.scheduler = new TaskScheduler()
    this.queue = this.scheduler.getQueue()
  }

  addTask(
    name: string,
    handler: () => unknown,
    options?: Partial<Task>
  ): string {
    const id = options?.id ?? `task-${++this.taskCounter}`
    const task: Task = {
      id,
      name,
      handler,
      dependencies: options?.dependencies ?? [],
      priority: options?.priority ?? 0,
      timeout: options?.timeout ?? this.config.defaultTimeout,
      retries: options?.retries ?? this.config.defaultRetries,
      retryDelay: options?.retryDelay ?? this.config.defaultRetryDelay,
      status: 'pending',
      createdAt: Date.now(),
    }
    this.scheduler.schedule(task)
    return id
  }

  addDependency(taskId: string, dependsOn: string): void {
    const task = this.queue.get(taskId)
    if (task && !task.dependencies.includes(dependsOn)) {
      task.dependencies.push(dependsOn)
    }
  }

  async run(): Promise<TaskResult[]> {
    this.results = []
    this.maxConcurrentObserved = 0

    const cycles = this.scheduler.detectCycles()
    if (cycles.length > 0) {
      throw new Error(`Circular dependencies detected: ${cycles.map((c) => c.join(' -> ')).join('; ')}`)
    }

    const totalTasks = this.queue.size()
    if (totalTasks === 0) return []

    let running = 0
    const resolved = { done: false }

    const checkDone = (): boolean => {
      if (resolved.done) return true
      if (this.results.length >= totalTasks) {
        resolved.done = true
        return true
      }
      return false
    }

    return new Promise<TaskResult[]>((resolve) => {
      const trySchedule = (): void => {
        if (checkDone()) {
          resolve(this.results)
          return
        }
        while (true) {
          let ready = this.scheduler.getReadyTasks()
          const available = this.config.maxConcurrent - running

          if (ready.length === 0 && running === 0) {
            const allPending = this.queue.getAll().filter(t => t.status === 'pending')
            for (const ct of allPending) {
              ct.status = 'skipped'
              this.results.push(this.buildResult(ct, 0, 0))
            }
            resolve(this.results)
            return
          }

          if (available <= 0 || ready.length === 0) break

          const task = ready[0]!

          if (this.cancelledTasks.has(task.id)) {
            task.status = 'skipped'
            this.results.push(this.buildResult(task, 0, 0))
            if (this.results.length >= totalTasks) {
              resolve(this.results)
              return
            }
            continue
          }

          running++
          this.maxConcurrentObserved = Math.max(
            this.maxConcurrentObserved,
            running
          )
          const currentTask = task
          this.executeTask(currentTask)
            .then((result) => {
              this.results.push(result)
              if (result.status === 'completed') {
                for (const cb of this.completeCallbacks) cb(result)
              } else if (
                result.status === 'failed' ||
                result.status === 'timeout'
              ) {
                for (const cb of this.errorCallbacks) cb(result)
                if (this.config.failFast) {
                  this.cancelRemaining(currentTask.id)
                } else {
                  this.skipBlockedDependents(currentTask.id)
                }
              }
            })
            .finally(() => {
              running--
              if (this.results.length >= totalTasks) {
                if (!resolved.done) {
                  resolved.done = true
                  resolve(this.results)
                }
              } else {
                trySchedule()
              }
            })
        }
      }

      trySchedule()
    })
  }

  async runSingle(taskId: string): Promise<TaskResult> {
    const task = this.queue.get(taskId)
    if (!task) {
      return {
        taskId,
        status: 'failed',
        error: `Task ${taskId} not found`,
        duration: 0,
        retries: 0,
      }
    }
    return this.executeTask(task)
  }

  cancel(taskId: string): boolean {
    const task = this.queue.get(taskId)
    if (!task) return false
    if (task.status === 'running') return false
    this.cancelledTasks.add(taskId)
    return true
  }

  getResults(): TaskResult[] {
    return [...this.results]
  }

  getStats(): RunnerStats {
    const completed = this.results.filter((r) => r.status === 'completed')
    const failed = this.results.filter(
      (r) => r.status === 'failed' || r.status === 'timeout'
    )
    const skipped = this.results.filter((r) => r.status === 'skipped')
    const totalDuration = completed.reduce((sum, r) => sum + r.duration, 0)
    const avgTaskDuration =
      completed.length > 0 ? totalDuration / completed.length : 0

    return {
      totalTasks: this.results.length,
      completed: completed.length,
      failed: failed.length,
      skipped: skipped.length,
      totalDuration,
      avgTaskDuration,
      maxConcurrent: this.maxConcurrentObserved,
    }
  }

  getConfig(): SchedulerConfig {
    return { ...this.config }
  }

  reset(): void {
    this.results = []
    this.cancelledTasks.clear()
    this.maxConcurrentObserved = 0
    this.taskCounter = 0
    this.scheduler = new TaskScheduler()
    this.queue = this.scheduler.getQueue()
  }

  onComplete(callback: CompleteCallback): void {
    this.completeCallbacks.push(callback)
  }

  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback)
  }

  private async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now()
    task.status = 'running'
    task.startedAt = startTime

    let lastError: string | undefined
    let attempts = 0
    const maxAttempts = task.retries + 1

    for (let i = 0; i < maxAttempts; i++) {
      attempts++
      try {
        const result = await this.executeWithTimeout(task)
        task.status = 'completed'
        task.result = result
        task.completedAt = Date.now()
        const duration = Date.now() - startTime
        return {
          taskId: task.id,
          status: 'completed',
          result,
          duration,
          retries: attempts - 1,
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        if (i < task.retries) {
          await new Promise<void>((r) => setTimeout(r, task.retryDelay))
        }
      }
    }

    const isTimeout = lastError === 'Task timeout'
    task.status = isTimeout ? 'timeout' : 'failed'
    task.error = lastError
    task.completedAt = Date.now()
    const duration = Date.now() - startTime
    return {
      taskId: task.id,
      status: task.status,
      error: lastError,
      duration,
      retries: attempts - 1,
    }
  }

  private async executeWithTimeout(task: Task): Promise<unknown> {
    if (task.timeout <= 0) {
      return task.handler()
    }
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Task timeout')), task.timeout)
      Promise.resolve(task.handler())
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((err) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  private buildResult(
    task: Task,
    duration: number,
    retries: number
  ): TaskResult {
    return {
      taskId: task.id,
      status: task.status,
      result: task.result,
      error: task.error,
      duration,
      retries,
    }
  }

  private cancelRemaining(_failedId: string): void {
    const all = this.queue.getAll()
    for (const task of all) {
      if (task.status === 'pending' && !this.cancelledTasks.has(task.id)) {
        this.cancelledTasks.add(task.id)
      }
    }
  }

  private skipBlockedDependents(_taskId: string): void {
    const all = this.queue.getAll()
    const failedIds = new Set(
      all.filter((t) => t.status === 'failed' || t.status === 'timeout').map((t) => t.id)
    )
    for (const task of all) {
      if (task.status !== 'pending') continue
      if (task.dependencies.some((dep) => failedIds.has(dep))) {
        task.status = 'skipped'
        this.results.push(this.buildResult(task, 0, 0))
      }
    }
  }
}
