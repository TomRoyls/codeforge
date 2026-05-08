import type { Task, TaskStatus } from './types.js'

export class TaskQueue {
  private tasks: Map<string, Task> = new Map()
  private order: string[] = []

  enqueue(task: Task): void {
    this.tasks.set(task.id, task)
    this.order.push(task.id)
  }

  dequeue(): Task | null {
    if (this.order.length === 0) return null
    const id = this.order.shift()!
    const task = this.tasks.get(id)!
    return task
  }

  peek(): Task | null {
    if (this.order.length === 0) return null
    const id = this.order[0]!
    return this.tasks.get(id)!
  }

  remove(taskId: string): boolean {
    if (!this.tasks.has(taskId)) return false
    this.tasks.delete(taskId)
    const idx = this.order.indexOf(taskId)
    if (idx !== -1) {
      this.order.splice(idx, 1)
    }
    return true
  }

  get(taskId: string): Task | null {
    return this.tasks.get(taskId) ?? null
  }

  getAll(): Task[] {
    return this.order.map((id) => this.tasks.get(id)!)
  }

  getByStatus(status: TaskStatus): Task[] {
    return this.getAll().filter((t) => t.status === status)
  }

  size(): number {
    return this.order.length
  }

  clear(): void {
    this.tasks.clear()
    this.order = []
  }

  sortByPriority(): void {
    this.order.sort((a, b) => {
      const taskA = this.tasks.get(a)!
      const taskB = this.tasks.get(b)!
      return taskB.priority - taskA.priority
    })
  }
}
