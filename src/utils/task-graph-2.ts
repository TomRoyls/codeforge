export class TaskGraph2 {
  private tasks = new Map<string, Set<string>>()
  private dependencies = new Map<string, Set<string>>()

  addTask(name: string): void {
    if (!this.tasks.has(name)) {
      this.tasks.set(name, new Set())
      this.dependencies.set(name, new Set())
    }
  }

  addDependency(from: string, to: string): void {
    this.addTask(from)
    this.addTask(to)
    this.tasks.get(from)!.add(to)
    this.dependencies.get(to)!.add(from)
  }

  topologicalSort(): string[] | null {
    const inDegree = new Map<string, number>()
    for (const [task] of this.tasks) inDegree.set(task, 0)
    for (const [task, deps] of this.dependencies) {
      inDegree.set(task, deps.size)
    }
    const queue: string[] = []
    for (const [task, deg] of inDegree) {
      if (deg === 0) queue.push(task)
    }
    const result: string[] = []
    while (queue.length > 0) {
      const task = queue.shift()!
      result.push(task)
      for (const neighbor of this.tasks.get(task) ?? []) {
        const newDeg = (inDegree.get(neighbor) ?? 0) - 1
        inDegree.set(neighbor, newDeg)
        if (newDeg === 0) queue.push(neighbor)
      }
    }
    return result.length === this.tasks.size ? result : null
  }

  hasCycle(): boolean {
    return this.topologicalSort() === null
  }

  getDirectDependents(task: string): string[] {
    return [...(this.tasks.get(task) ?? [])]
  }

  getDependencies(task: string): string[] {
    return [...(this.dependencies.get(task) ?? [])]
  }

  criticalPath(): string[] {
    const sorted = this.topologicalSort()
    if (!sorted) return []
    const dist = new Map<string, number>()
    for (const t of sorted) dist.set(t, 0)
    for (const t of sorted) {
      for (const dep of this.tasks.get(t) ?? []) {
        dist.set(dep, Math.max(dist.get(dep) ?? 0, (dist.get(t) ?? 0) + 1))
      }
    }
    let maxDist = 0, maxTask = sorted[0] ?? ''
    for (const [t, d] of dist) {
      if (d > maxDist) { maxDist = d; maxTask = t }
    }
    const path: string[] = [maxTask]
    let current = maxTask
    while (true) {
      const deps = this.dependencies.get(current)
      if (!deps || deps.size === 0) break
      let bestDep = '', bestDist = -1
      for (const dep of deps) {
        const d = dist.get(dep) ?? 0
        if (d > bestDist) { bestDist = d; bestDep = dep }
      }
      if (!bestDep) break
      path.unshift(bestDep)
      current = bestDep
    }
    return path
  }

  get size(): number { return this.tasks.size }
  clear(): void { this.tasks.clear(); this.dependencies.clear() }
  toArray(): string[] { return [...this.tasks.keys()] }
  toString(): string { return JSON.stringify({ tasks: [...this.tasks.keys()] }) }
  toJSON(): Record<string, unknown> { return { size: this.tasks.size } }
  clone(): TaskGraph2 {
    const c = new TaskGraph2()
    for (const [from, tos] of this.tasks) {
      for (const to of tos) c.addDependency(from, to)
    }
    return c
  }
  equals(other: unknown): boolean { return other instanceof TaskGraph2 }
}
