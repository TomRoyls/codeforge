import type { Task } from './types.js'
import { TaskQueue } from './task-queue.js'

export class TaskScheduler {
  private queue: TaskQueue = new TaskQueue()

  schedule(task: Task): void {
    this.queue.enqueue(task)
  }

  scheduleMany(tasks: Task[]): void {
    for (const task of tasks) {
      this.queue.enqueue(task)
    }
  }

  getReadyTasks(): Task[] {
    const all = this.queue.getAll()
    const completedIds = new Set<string>()
    const ready: Task[] = []
    for (let i = 0; i < all.length; i++) {
      const t = all[i]
      if (t.status === 'completed') {
        completedIds.add(t.id)
      }
    }
    for (let i = 0; i < all.length; i++) {
      const t = all[i]
      if (
        t.status === 'pending' &&
        t.dependencies.every((dep) => completedIds.has(dep))
      ) {
        ready.push(t)
      }
    }
    return ready
  }

  resolveOrder(): string[] {
    const all = this.queue.getAll()
    const taskMap = new Map<string, Task>()
    for (const t of all) {
      taskMap.set(t.id, t)
    }
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (id: string): void => {
      if (visited.has(id)) return
      if (visiting.has(id)) return
      visiting.add(id)
      const task = taskMap.get(id)
      if (task) {
        for (const dep of task.dependencies) {
          visit(dep)
        }
      }
      visiting.delete(id)
      visited.add(id)
      order.push(id)
    }

    for (const t of all) {
      visit(t.id)
    }
    return order
  }

  detectCycles(): string[][] {
    const all = this.queue.getAll()
    const taskMap = new Map<string, Task>()
    for (const t of all) {
      taskMap.set(t.id, t)
    }
    const cycles: string[][] = []
    const visited = new Set<string>()
    const stack: string[] = []

    const dfs = (id: string): void => {
      if (visited.has(id)) return
      visited.add(id)
      stack.push(id)
      const task = taskMap.get(id)
      if (task) {
        for (const dep of task.dependencies) {
          const cycleIdx = stack.indexOf(dep)
          if (cycleIdx !== -1) {
            cycles.push(stack.slice(cycleIdx))
          } else if (!visited.has(dep)) {
            dfs(dep)
          }
        }
      }
      stack.pop()
    }

    for (const t of all) {
      dfs(t.id)
    }
    return cycles
  }

  isBlocked(taskId: string): boolean {
    const task = this.queue.get(taskId)
    if (!task) return false
    if (task.status !== 'pending') return false
    return this.getBlockers(taskId).length > 0
  }

  getBlockers(taskId: string): string[] {
    const task = this.queue.get(taskId)
    if (!task) return []
    const all = this.queue.getAll()
    const completedIds = new Set<string>()
    for (let i = 0; i < all.length; i++) {
      if (all[i].status === 'completed') {
        completedIds.add(all[i].id)
      }
    }
    return task.dependencies.filter((dep) => !completedIds.has(dep))
  }

  getDependents(taskId: string): string[] {
    const all = this.queue.getAll()
    const dependents: string[] = []
    for (let i = 0; i < all.length; i++) {
      if (all[i].dependencies.includes(taskId)) {
        dependents.push(all[i].id)
      }
    }
    return dependents
  }

  getQueue(): TaskQueue {
    return this.queue
  }
}
