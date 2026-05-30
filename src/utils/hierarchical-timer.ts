export interface TimerNode {
  name: string
  startTime: number
  endTime: number
  duration: number
  children: TimerNode[]
}

export class HierarchicalTimer {
  private stack: Array<{ name: string; startTime: number; children: TimerNode[] }>
  private rootChildren: TimerNode[]
  private enabled: boolean

  constructor(options?: { enabled?: boolean }) {
    this.stack = []
    this.rootChildren = []
    this.enabled = options?.enabled ?? true
  }

  start(name: string): void {
    if (!this.enabled) return
    this.stack.push({
      name,
      startTime: performance.now(),
      children: [],
    })
  }

  end(name: string): TimerNode | undefined {
    if (!this.enabled || this.stack.length === 0) return undefined
    const current = this.stack[this.stack.length - 1]!
    if (current.name !== name) return undefined

    this.stack.pop()
    const endTime = performance.now()
    const node: TimerNode = {
      name: current.name,
      startTime: current.startTime,
      endTime,
      duration: endTime - current.startTime,
      children: current.children,
    }

    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1]!.children.push(node)
    } else {
      this.rootChildren.push(node)
    }
    return node
  }

  measure<T>(name: string, fn: () => T): T {
    this.start(name)
    try {
      return fn()
    } finally {
      this.end(name)
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name)
    try {
      return await fn()
    } finally {
      this.end(name)
    }
  }

  get results(): readonly TimerNode[] {
    return this.rootChildren
  }

  get flatDurations(): Map<string, number> {
    const map = new Map<string, number>()
    this.flatten(this.rootChildren, map)
    return map
  }

  get totalTime(): number {
    let total = 0
    for (const node of this.rootChildren) {
      total += node.duration
    }
    return total
  }

  get isEmpty(): boolean {
    return this.rootChildren.length === 0
  }

  clear(): void {
    this.stack.length = 0
    this.rootChildren.length = 0
  }

  format(): string {
    const lines: string[] = []
    for (const node of this.rootChildren) {
      this.formatNode(node, 0, lines)
    }
    return lines.join('\n')
  }

  private formatNode(node: TimerNode, depth: number, lines: string[]): void {
    const indent = '  '.repeat(depth)
    lines.push(`${indent}${node.name}: ${node.duration.toFixed(2)}ms`)
    for (const child of node.children) {
      this.formatNode(child, depth + 1, lines)
    }
  }

  private flatten(nodes: readonly TimerNode[], map: Map<string, number>): void {
    for (const node of nodes) {
      const existing = map.get(node.name) ?? 0
      map.set(node.name, existing + node.duration)
      this.flatten(node.children, map)
    }
  }
}
