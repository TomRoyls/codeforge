export interface PipelineStage2<T = unknown> {
  name: string
  process: (input: T) => T | Promise<T>
}

export class PipelineStageManager2<T = unknown> {
  private stages: PipelineStage2<T>[] = []
  private stageMap: Map<string, PipelineStage2<T>> = new Map()

  add(stage: PipelineStage2<T>): this {
    this.stages.push(stage)
    this.stageMap.set(stage.name, stage)
    return this
  }

  addBefore(name: string, stage: PipelineStage2<T>): boolean {
    const idx = this.stages.findIndex(s => s.name === name)
    if (idx === -1) return false
    this.stages.splice(idx, 0, stage)
    this.stageMap.set(stage.name, stage)
    return true
  }

  addAfter(name: string, stage: PipelineStage2<T>): boolean {
    const idx = this.stages.findIndex(s => s.name === name)
    if (idx === -1) return false
    this.stages.splice(idx + 1, 0, stage)
    this.stageMap.set(stage.name, stage)
    return true
  }

  remove(name: string): boolean {
    const idx = this.stages.findIndex(s => s.name === name)
    if (idx === -1) return false
    this.stages.splice(idx, 1)
    this.stageMap.delete(name)
    return true
  }

  get(name: string): PipelineStage2<T> | undefined {
    return this.stageMap.get(name)
  }

  has(name: string): boolean {
    return this.stageMap.has(name)
  }

  names(): string[] {
    return this.stages.map(s => s.name)
  }

  async run(input: T): Promise<T> {
    let result = input
    for (const stage of this.stages) {
      result = await stage.process(result)
    }
    return result
  }

  runSync(input: T): T {
    let result = input
    for (const stage of this.stages) {
      const output = stage.process(result)
      if (output instanceof Promise) throw new Error(`Stage ${stage.name} is async`)
      result = output
    }
    return result
  }

  count(): number {
    return this.stages.length
  }

  clear(): void {
    this.stages = []
    this.stageMap.clear()
  }

  reorder(names: string[]): boolean {
    const newOrder: PipelineStage2<T>[] = []
    for (const name of names) {
      const stage = this.stageMap.get(name)
      if (!stage) return false
      newOrder.push(stage)
    }
    this.stages = newOrder
    return true
  }

  swap(name1: string, name2: string): boolean {
    const idx1 = this.stages.findIndex(s => s.name === name1)
    const idx2 = this.stages.findIndex(s => s.name === name2)
    if (idx1 === -1 || idx2 === -1) return false
    ;[this.stages[idx1], this.stages[idx2]] = [this.stages[idx2], this.stages[idx1]]
    return true
  }

  toArray(): string[] { return this.names() }
  toString(): string { return JSON.stringify({ stages: this.names() }) }
  toJSON(): string[] { return this.names() }
  clone(): PipelineStageManager2<T> {
    const p = new PipelineStageManager2<T>()
    this.stages.forEach(s => p.add({ ...s }))
    return p
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PipelineStageManager2)) return false
    return this.count() === other.count()
  }
}
