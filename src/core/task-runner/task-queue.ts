import type { Task, TaskStatus } from './types.js'

export class TaskQueue {
  private tasks: Map<string, Task> = new Map()
  private order: string[] = []
  private head: number = 0
  private _count: number = 0

  enqueue(task: Task): void {
    this.tasks.set(task.id, task)
    this.order.push(task.id)
    this._count++
  }

  dequeue(): Task | null {
    if (this._count === 0) return null
    while (this.head < this.order.length) {
      const id = this.order[this.head]!
      this.head++
      const task = this.tasks.get(id)
      if (task) {
        this._count--
        this.maybeCompact()
        return task
      }
    }
    return null
  }

  peek(): Task | null {
    if (this._count === 0) return null
    for (let i = this.head; i < this.order.length; i++) {
      const task = this.tasks.get(this.order[i]!)
      if (task) return task
    }
    return null
  }

  remove(taskId: string): boolean {
    if (!this.tasks.has(taskId)) return false
    this.tasks.delete(taskId)
    const idx = this.order.indexOf(taskId, this.head)
    if (idx !== -1) {
      this.order[idx] = ''
    }
    this._count--
    return true
  }

  get(taskId: string): Task | null {
    return this.tasks.get(taskId) ?? null
  }

  getAll(): Task[] {
    const result: Task[] = []
    for (let i = this.head; i < this.order.length; i++) {
      const task = this.tasks.get(this.order[i]!)
      if (task) result.push(task)
    }
    return result
  }

  getByStatus(status: TaskStatus): Task[] {
    return this.getAll().filter((t) => t.status === status)
  }

  size(): number {
    return this._count
  }

  clear(): void {
    this.tasks.clear()
    this.order = []
    this.head = 0
    this._count = 0
  }

  sortByPriority(): void {
    this.compact()
    this.order.sort((a, b) => {
      const taskA = this.tasks.get(a)!
      const taskB = this.tasks.get(b)!
      return taskB.priority - taskA.priority
    })
  }

  private maybeCompact(): void {
    if (this.head > 256 && this.head > this.order.length / 2) {
      this.compact()
    }
  }

  private compact(): void {
    if (this.head === 0) return
    this.order = this.order.slice(this.head).filter((id) => this.tasks.has(id))
    this.head = 0
  }
}
