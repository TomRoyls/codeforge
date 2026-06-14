export interface DataSeed2 {
  id: string
  model: string
  data: Record<string, unknown>
  dependencies: string[]
}

export class SeedRunner2 {
  private seeds: Map<string, DataSeed2> = new Map()
  private executed: Set<string> = new Set()
  private failed: string[] = []
  private order: string[] = []

  add(seed: DataSeed2): this {
    this.seeds.set(seed.id, seed)
    return this
  }

  async run(id: string, handler: (seed: DataSeed2) => void | Promise<void>): Promise<boolean> {
    const seed = this.seeds.get(id)
    if (!seed) return false
    if (this.executed.has(id)) return true

    for (const dep of seed.dependencies) {
      if (!this.executed.has(dep)) {
        await this.run(dep, handler)
      }
    }

    try {
      await handler(seed)
      this.executed.add(id)
      this.order.push(id)
      return true
    } catch {
      this.failed.push(id)
      return false
    }
  }

  async runAll(handler: (seed: DataSeed2) => void | Promise<void>): Promise<{ success: string[]; failed: string[] }> {
    const sorted = this.topologicalSort()
    const success: string[] = []
    const failed: string[] = []

    for (const id of sorted) {
      if (await this.run(id, handler)) {
        success.push(id)
      } else {
        failed.push(id)
      }
    }
    return { success, failed }
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>()
    const result: string[] = []

    const visit = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)
      const seed = this.seeds.get(id)
      if (seed) {
        seed.dependencies.forEach(dep => visit(dep))
        result.push(id)
      }
    }

    this.seeds.forEach((_, id) => visit(id))
    return result
  }

  getSeed(id: string): DataSeed2 | undefined { return this.seeds.get(id) }
  getExecuted(): string[] { return [...this.executed] }
  getFailed(): string[] { return [...this.failed] }
  getOrder(): string[] { return [...this.order] }
  getPending(): string[] {
    return Array.from(this.seeds.keys()).filter(id => !this.executed.has(id))
  }

  getByModel(model: string): DataSeed2[] {
    return Array.from(this.seeds.values()).filter(s => s.model === model)
  }

  isExecuted(id: string): boolean { return this.executed.has(id) }

  count(): number { return this.seeds.size }
  getExecutedCount(): number { return this.executed.size }
  getPendingCount(): number { return this.getPending().length }

  reset(): void {
    this.executed.clear()
    this.failed = []
    this.order = []
  }

  toArray(): string[] { return Array.from(this.seeds.keys()) }
  toString(): string { return JSON.stringify({ total: this.count(), executed: this.getExecutedCount() }) }
  toJSON(): Record<string, unknown> { return { total: this.count(), executed: this.getExecutedCount(), pending: this.getPendingCount() } }
  clone(): SeedRunner2 {
    const sr = new SeedRunner2()
    this.seeds.forEach((s, id) => sr.seeds.set(id, { ...s, data: { ...s.data }, dependencies: [...s.dependencies] }))
    sr.executed = new Set(this.executed)
    sr.failed = [...this.failed]
    sr.order = [...this.order]
    return sr
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SeedRunner2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.seeds.clear()
    this.executed.clear()
    this.failed = []
    this.order = []
  }
}
