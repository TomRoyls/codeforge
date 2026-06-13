export class TaskQueue {
  private tasks: Array<{ id: number; priority: number; fn: () => void }> = []
  private nextId = 1

  enqueue(fn: () => void, priority = 0): number {
    const id = this.nextId++
    this.tasks.push({ id, priority, fn })
    this.tasks.sort((a, b) => b.priority - a.priority)
    return id
  }

  dequeue(): (() => void) | undefined {
    const task = this.tasks.shift()
    return task?.fn
  }

  processAll(): void {
    while (this.tasks.length > 0) {
      const fn = this.dequeue()
      if (fn) fn()
    }
  }

  cancel(id: number): boolean {
    const idx = this.tasks.findIndex((t) => t.id === id)
    if (idx !== -1) { this.tasks.splice(idx, 1); return true }
    return false
  }

  get size(): number { return this.tasks.length }
  get isEmpty(): boolean { return this.tasks.length === 0 }

  clear(): void { this.tasks = []; this.nextId = 1 }

  toArray(): number[] { return this.tasks.map((t) => t.id) }
  toString(): string { return JSON.stringify({ tasks: this.tasks.length }) }
  toJSON(): Record<string, number> { return { tasks: this.tasks.length } }

  clone(): TaskQueue {
    const c = new TaskQueue()
    c.tasks = this.tasks.map((t) => ({ ...t }))
    c.nextId = this.nextId
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TaskQueue)) return false
    return this.size === other.size
  }
}
