import type { PoolTask, PoolTaskStatus } from './types.js'

export class TaskQueue {
  private tasks: PoolTask<unknown>[] = []

  enqueue(task: PoolTask<unknown>): void {
    this.tasks.push(task)
  }

  enqueueAll(tasks: PoolTask<unknown>[]): void {
    for (const task of tasks) {
      this.tasks.push(task)
    }
  }

  dequeue(): PoolTask<unknown> | undefined {
    const pendingTasks = this.tasks.filter((t) => t.status === 'pending')
    if (pendingTasks.length === 0) return undefined
    pendingTasks.sort((a, b) => b.priority - a.priority)
    const task = pendingTasks[0]!
    task.status = 'running'
    return task
  }

  peek(): PoolTask<unknown> | undefined {
    const pendingTasks = this.tasks.filter((t) => t.status === 'pending')
    if (pendingTasks.length === 0) return undefined
    pendingTasks.sort((a, b) => b.priority - a.priority)
    return pendingTasks[0]
  }

  updateStatus(id: string, status: PoolTaskStatus): void {
    const task = this.tasks.find((t) => t.id === id)
    if (task) {
      task.status = status
    }
  }

  get(id: string): PoolTask<unknown> | undefined {
    return this.tasks.find((t) => t.id === id)
  }

  remove(id: string): boolean {
    const idx = this.tasks.findIndex((t) => t.id === id)
    if (idx === -1) return false
    this.tasks.splice(idx, 1)
    return true
  }

  pending(): PoolTask<unknown>[] {
    return this.tasks
      .filter((t) => t.status === 'pending')
      .sort((a, b) => b.priority - a.priority)
  }

  all(): PoolTask<unknown>[] {
    return [...this.tasks]
  }

  get size(): number {
    return this.tasks.length
  }

  clear(): void {
    this.tasks = []
  }
}
