export interface CallFrame2 {
  function: string
  file: string
  line: number
  self: number
  total: number
}

export class CallGraphBuilder2 {
  private frames: Map<string, CallFrame2> = new Map()
  private edges: Map<string, Set<string>> = new Map()
  private reverseEdges: Map<string, Set<string>> = new Map()
  private rootId: string | null = null
  private idCounter = 0
  private totalCalls = 0

  setRoot(id: string): boolean {
    if (!this.frames.has(id)) return false
    this.rootId = id
    return true
  }

  getRoot(): string | null { return this.rootId }

  addFrame(func: string, file: string, line: number, self = 0, total = 0): string {
    const id = `frame_${++this.idCounter}`
    this.frames.set(id, { function: func, file, line, self, total })
    this.edges.set(id, new Set())
    this.reverseEdges.set(id, new Set())
    if (this.rootId === null) this.rootId = id
    return id
  }

  addCall(from: string, to: string, count = 1): boolean {
    if (!this.frames.has(from) || !this.frames.has(to)) return false
    this.edges.get(from)!.add(to)
    this.reverseEdges.get(to)!.add(from)
    this.totalCalls += count
    return true
  }

  getFrame(id: string): CallFrame2 | undefined { return this.frames.get(id) }

  getByFunction(func: string): CallFrame2[] {
    return Array.from(this.frames.values()).filter(f => f.function === func)
  }

  getByFile(file: string): CallFrame2[] {
    return Array.from(this.frames.values()).filter(f => f.file === file)
  }

  getCallees(id: string): CallFrame2[] {
    const edges = this.edges.get(id)
    if (!edges) return []
    return Array.from(edges).map(e => this.frames.get(e)).filter(Boolean) as CallFrame2[]
  }

  getCallers(id: string): CallFrame2[] {
    const edges = this.reverseEdges.get(id)
    if (!edges) return []
    return Array.from(edges).map(e => this.frames.get(e)).filter(Boolean) as CallFrame2[]
  }

  getFanOut(id: string): number { return this.edges.get(id)?.size ?? 0 }
  getFanIn(id: string): number { return this.reverseEdges.get(id)?.size ?? 0 }

  getHotFrames(threshold = 0): CallFrame2[] {
    return Array.from(this.frames.values())
      .filter(f => f.self > threshold)
      .sort((a, b) => b.self - a.self)
  }

  getLeafFrames(): string[] {
    return Array.from(this.frames.keys()).filter(id => this.edges.get(id)?.size === 0)
  }

  getIsolatedFrames(): string[] {
    return Array.from(this.frames.keys()).filter(id => {
      const fanIn = this.reverseEdges.get(id)?.size ?? 0
      const fanOut = this.edges.get(id)?.size ?? 0
      return fanIn === 0 && fanOut === 0
    })
  }

  getDepth(id: string, visited = new Set<string>()): number {
    if (visited.has(id)) return 0
    visited.add(id)
    const callees = this.edges.get(id)
    if (!callees || callees.size === 0) return 1
    let maxDepth = 0
    callees.forEach(c => {
      maxDepth = Math.max(maxDepth, this.getDepth(c, visited))
    })
    return maxDepth + 1
  }

  getPath(from: string, to: string): string[] | null {
    if (from === to) return [from]
    const queue: string[][] = [[from]]
    const visited = new Set<string>([from])

    while (queue.length > 0) {
      const path = queue.shift()!
      const current = path[path.length - 1]
      const edges = this.edges.get(current)
      if (!edges) continue
      for (const next of edges) {
        if (next === to) return [...path, next]
        if (!visited.has(next)) {
          visited.add(next)
          queue.push([...path, next])
        }
      }
    }
    return null
  }

  getTotalCalls(): number { return this.totalCalls }
  count(): number { return this.frames.size }

  getStats(): { frames: number; edges: number; maxDepth: number; isolated: number } {
    let edgeCount = 0
    this.edges.forEach(e => { edgeCount += e.size })
    const root = this.rootId ? this.getDepth(this.rootId) : 0
    return {
      frames: this.frames.size,
      edges: edgeCount,
      maxDepth: root,
      isolated: this.getIsolatedFrames().length,
    }
  }

  toArray(): CallFrame2[] { return Array.from(this.frames.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): CallGraphBuilder2 {
    const cg = new CallGraphBuilder2()
    this.frames.forEach((f, id) => cg.frames.set(id, { ...f }))
    this.edges.forEach((s, id) => cg.edges.set(id, new Set(s)))
    this.reverseEdges.forEach((s, id) => cg.reverseEdges.set(id, new Set(s)))
    cg.rootId = this.rootId
    cg.idCounter = this.idCounter
    cg.totalCalls = this.totalCalls
    return cg
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CallGraphBuilder2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.frames.clear()
    this.edges.clear()
    this.reverseEdges.clear()
    this.rootId = null
    this.idCounter = 0
    this.totalCalls = 0
  }
}
