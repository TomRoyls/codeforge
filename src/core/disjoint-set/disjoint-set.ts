import type { DisjointSetOptions, SetNode } from './types.js'
import { DEFAULT_DISJOINT_SET_OPTIONS } from './types.js'

export class DisjointSet {
  private nodes: Map<string, SetNode> = new Map()
  private trackSizes: boolean
  private componentCount: number = 0

  constructor(options?: Partial<DisjointSetOptions>) {
    const opts: DisjointSetOptions = { ...DEFAULT_DISJOINT_SET_OPTIONS, ...options }
    this.trackSizes = opts.trackSizes
  }

  makeSet(value: string): void {
    if (this.nodes.has(value)) return
    this.nodes.set(value, { value, rank: 0, parent: value, size: 1 })
    this.componentCount++
  }

  find(value: string): string {
    const node = this.nodes.get(value)
    if (!node) throw new Error(`Element "${value}" not found`)
    if (node.parent !== value) {
      node.parent = this.find(node.parent)
    }
    return node.parent
  }

  union(a: string, b: string): boolean {
    if (!this.nodes.has(a) || !this.nodes.has(b)) return false
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return false
    const nodeA = this.nodes.get(rootA)!
    const nodeB = this.nodes.get(rootB)!
    if (nodeA.rank < nodeB.rank) {
      nodeA.parent = rootB
      if (this.trackSizes) nodeB.size += nodeA.size
    } else if (nodeA.rank > nodeB.rank) {
      nodeB.parent = rootA
      if (this.trackSizes) nodeA.size += nodeB.size
    } else {
      nodeB.parent = rootA
      nodeA.rank++
      if (this.trackSizes) nodeA.size += nodeB.size
    }
    this.componentCount--
    return true
  }

  connected(a: string, b: string): boolean {
    if (!this.nodes.has(a) || !this.nodes.has(b)) return false
    return this.find(a) === this.find(b)
  }

  getSets(): Map<string, string[]> {
    const sets = new Map<string, string[]>()
    for (const value of this.nodes.keys()) {
      const root = this.find(value)
      if (!sets.has(root)) {
        sets.set(root, [])
      }
      sets.get(root)!.push(value)
    }
    return sets
  }

  getSetSize(value: string): number {
    if (!this.nodes.has(value)) return 0
    const root = this.find(value)
    if (!this.trackSizes) return 0
    return this.nodes.get(root)!.size
  }

  getCount(): number {
    return this.nodes.size
  }

  has(value: string): boolean {
    return this.nodes.has(value)
  }

  getComponentCount(): number {
    return this.componentCount
  }

  clear(): void {
    this.nodes.clear()
    this.componentCount = 0
  }

  toArray(): string[][] {
    const sets = this.getSets()
    return [...sets.values()]
  }

  getStats(): { elementCount: number, componentCount: number, maxComponentSize: number, minComponentSize: number } {
    const sets = this.getSets()
    let maxComponentSize = 0
    let minComponentSize = this.nodes.size > 0 ? Infinity : 0
    for (const members of sets.values()) {
      if (members.length > maxComponentSize) maxComponentSize = members.length
      if (members.length < minComponentSize) minComponentSize = members.length
    }
    if (minComponentSize === Infinity) minComponentSize = 0
    return {
      elementCount: this.nodes.size,
      componentCount: this.componentCount,
      maxComponentSize,
      minComponentSize,
    }
  }
}

export { DEFAULT_DISJOINT_SET_OPTIONS } from './types.js'
export type { DisjointSetOptions, SetNode } from './types.js'
