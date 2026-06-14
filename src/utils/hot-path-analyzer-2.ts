export interface HotPath2 {
  id: string
  function: string
  file: string
  line: number
  selfTime: number
  totalTime: number
  calls: number
  percentage: number
  children: string[]
  parent: string | null
}

export class HotPathAnalyzer2 {
  private paths: Map<string, HotPath2> = new Map()
  private totalTime = 0
  private threshold: number
  private idCounter = 0

  constructor(threshold = 1) {
    this.threshold = threshold
  }

  record(func: string, file: string, line: number, selfTime: number, totalTime: number, parent: string | null = null): string {
    const id = `hp_${++this.idCounter}`
    const hp: HotPath2 = {
      id, function: func, file, line,
      selfTime, totalTime,
      calls: 1,
      percentage: 0,
      children: [],
      parent,
    }
    this.paths.set(id, hp)
    if (parent && this.paths.has(parent)) {
      this.paths.get(parent)!.children.push(id)
    }
    this.totalTime += selfTime
    this.updatePercentages()
    return id
  }

  incrementCall(id: string, selfTime = 0, totalTime = 0): boolean {
    const hp = this.paths.get(id)
    if (!hp) return false
    hp.calls++
    hp.selfTime += selfTime
    hp.totalTime += totalTime
    this.totalTime += selfTime
    this.updatePercentages()
    return true
  }

  private updatePercentages(): void {
    this.paths.forEach(hp => {
      hp.percentage = this.totalTime > 0 ? (hp.selfTime / this.totalTime) * 100 : 0
    })
  }

  getHotPaths(): HotPath2[] {
    return Array.from(this.paths.values())
      .filter(hp => hp.percentage >= this.threshold)
      .sort((a, b) => b.selfTime - a.selfTime)
  }

  getHottest(n = 10): HotPath2[] {
    return Array.from(this.paths.values())
      .sort((a, b) => b.selfTime - a.selfTime)
      .slice(0, n)
  }

  getCallChain(id: string): HotPath2[] {
    const chain: HotPath2[] = []
    let current = this.paths.get(id)
    while (current) {
      chain.push(current)
      current = current.parent ? this.paths.get(current.parent) : undefined
    }
    return chain.reverse()
  }

  getCallees(id: string): HotPath2[] {
    const hp = this.paths.get(id)
    if (!hp) return []
    return hp.children.map(c => this.paths.get(c)).filter(Boolean) as HotPath2[]
  }

  getLeafNodes(): HotPath2[] {
    return Array.from(this.paths.values()).filter(hp => hp.children.length === 0)
  }

  getRootNodes(): HotPath2[] {
    return Array.from(this.paths.values()).filter(hp => hp.parent === null)
  }

  getByFile(file: string): HotPath2[] {
    return Array.from(this.paths.values()).filter(hp => hp.file === file)
  }

  getByFunction(func: string): HotPath2[] {
    return Array.from(this.paths.values()).filter(hp => hp.function === func)
  }

  getSummary(): {
    totalPaths: number
    hotPaths: number
    totalTime: number
    avgSelfTime: number
    maxDepth: number
  } {
    const paths = Array.from(this.paths.values())
    const avgSelf = paths.length > 0 ? this.totalTime / paths.length : 0
    return {
      totalPaths: paths.length,
      hotPaths: this.getHotPaths().length,
      totalTime: this.totalTime,
      avgSelfTime: avgSelf,
      maxDepth: this.getMaxDepth(),
    }
  }

  private getMaxDepth(): number {
    let maxDepth = 0
    this.getRootNodes().forEach(root => {
      maxDepth = Math.max(maxDepth, this.getDepth(root.id))
    })
    return maxDepth
  }

  private getDepth(id: string): number {
    const hp = this.paths.get(id)
    if (!hp || hp.children.length === 0) return 1
    let maxChildDepth = 0
    hp.children.forEach(c => {
      maxChildDepth = Math.max(maxChildDepth, this.getDepth(c))
    })
    return maxChildDepth + 1
  }

  setThreshold(threshold: number): this { this.threshold = threshold; return this }
  getThreshold(): number { return this.threshold }

  remove(id: string): boolean { return this.paths.delete(id) }
  count(): number { return this.paths.size }

  toArray(): HotPath2[] { return Array.from(this.paths.values()) }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): HotPathAnalyzer2 {
    const hpa = new HotPathAnalyzer2(this.threshold)
    this.paths.forEach((hp, id) => hpa.paths.set(id, { ...hp, children: [...hp.children] }))
    hpa.totalTime = this.totalTime
    hpa.idCounter = this.idCounter
    return hpa
  }
  equals(other: unknown): boolean {
    if (!(other instanceof HotPathAnalyzer2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.paths.clear()
    this.totalTime = 0
    this.idCounter = 0
  }
}
