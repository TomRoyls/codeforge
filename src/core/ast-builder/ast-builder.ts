import type { BuilderNode, BuilderOptions } from './types.js'
import { DEFAULT_BUILDER_OPTIONS } from './types.js'

export type { BuilderNode, BuilderOptions } from './types.js'

export class ASTBuilder {
  private options: BuilderOptions
  private nodes: Map<string, BuilderNode> = new Map()
  private idCounter = 0
  private rangeCounter = 0

  constructor(options?: Partial<BuilderOptions>) {
    this.options = {
      idPrefix: options?.idPrefix ?? DEFAULT_BUILDER_OPTIONS.idPrefix,
      trackParents: options?.trackParents ?? DEFAULT_BUILDER_OPTIONS.trackParents,
      autoRange: options?.autoRange ?? DEFAULT_BUILDER_OPTIONS.autoRange,
    }
  }

  private generateId(): string {
    this.idCounter += 1
    return `${this.options.idPrefix}-${this.idCounter}`
  }

  private updateParents(node: BuilderNode): void {
    if (!this.options.trackParents) return
    if (!node.children) return
    for (const child of node.children) {
      child.parent = node
      this.updateParents(child)
    }
  }

  createNode(type: string, value?: string): BuilderNode {
    const node: BuilderNode = {
      id: this.generateId(),
      type,
      value,
      properties: {},
    }
    if (this.options.autoRange) {
      node.range = { start: this.rangeCounter, end: this.rangeCounter }
      this.rangeCounter += 1
    }
    this.nodes.set(node.id, node)
    return node
  }

  setProperty(nodeId: string, key: string, value: string): BuilderNode {
    const node = this.nodes.get(nodeId)
    if (node === undefined) {
      throw new Error(`Node with id "${nodeId}" not found`)
    }
    if (node.properties === undefined) {
      node.properties = {}
    }
    node.properties[key] = value
    return node
  }

  addChild(parentId: string, child: BuilderNode): BuilderNode {
    const parent = this.nodes.get(parentId)
    if (parent === undefined) {
      throw new Error(`Node with id "${parentId}" not found`)
    }
    if (parent.children === undefined) {
      parent.children = []
    }
    parent.children.push(child)
    this.nodes.set(child.id, child)
    if (this.options.trackParents) {
      child.parent = parent
    }
    this.updateParents(child)
    return child
  }

  removeChild(parentId: string, childId: string): boolean {
    const parent = this.nodes.get(parentId)
    if (parent === undefined) return false
    if (parent.children === undefined) return false
    const index = parent.children.findIndex((c) => c.id === childId)
    if (index === -1) return false
    parent.children.splice(index, 1)
    if (parent.children.length === 0) {
      parent.children = undefined
    }
    this.nodes.delete(childId)
    return true
  }

  setRange(nodeId: string, start: number, end: number): BuilderNode {
    const node = this.nodes.get(nodeId)
    if (node === undefined) {
      throw new Error(`Node with id "${nodeId}" not found`)
    }
    node.range = { start, end }
    return node
  }

  build(rootId: string): BuilderNode | undefined {
    const root = this.nodes.get(rootId)
    if (root === undefined) return undefined
    return this.deepClone(root)
  }

  private deepClone(node: BuilderNode): BuilderNode {
    const cloned: BuilderNode = {
      id: node.id,
      type: node.type,
      value: node.value,
      properties: node.properties ? { ...node.properties } : undefined,
      range: node.range ? { ...node.range } : undefined,
      parent: undefined,
    }
    if (node.children) {
      cloned.children = node.children.map((child) => {
        const clonedChild = this.deepClone(child)
        if (this.options.trackParents) {
          clonedChild.parent = cloned
        }
        return clonedChild
      })
    }
    return cloned
  }

  getNode(id: string): BuilderNode | undefined {
    return this.nodes.get(id)
  }

  findNode(rootId: string, predicate: (node: BuilderNode) => boolean): BuilderNode | undefined {
    const root = this.nodes.get(rootId)
    if (root === undefined) return undefined
    return this.searchNode(root, predicate)
  }

  private searchNode(node: BuilderNode, predicate: (node: BuilderNode) => boolean): BuilderNode | undefined {
    if (predicate(node)) return node
    if (node.children) {
      for (const child of node.children) {
        const found = this.searchNode(child, predicate)
        if (found !== undefined) return found
      }
    }
    return undefined
  }

  getChildren(nodeId: string): BuilderNode[] {
    const node = this.nodes.get(nodeId)
    if (node === undefined) return []
    return node.children ? [...node.children] : []
  }

  getDepth(nodeId: string): number {
    const node = this.nodes.get(nodeId)
    if (node === undefined) return -1
    return this.computeDepth(node)
  }

  private computeDepth(node: BuilderNode): number {
    if (!node.children || node.children.length === 0) return 0
    let maxChildDepth = 0
    for (const child of node.children) {
      const childDepth = this.computeDepth(child)
      if (childDepth > maxChildDepth) {
        maxChildDepth = childDepth
      }
    }
    return maxChildDepth + 1
  }

  getPath(nodeId: string): string[] {
    const node = this.nodes.get(nodeId)
    if (node === undefined) return []
    const path: string[] = []
    let current: BuilderNode | undefined = node
    while (current !== undefined) {
      path.unshift(current.type)
      current = current.parent
    }
    return path
  }

  getStatistics(rootId: string): {
    totalNodes: number
    nodeTypes: Record<string, number>
    maxDepth: number
    leafCount: number
  } {
    const root = this.nodes.get(rootId)
    if (root === undefined) {
      return { totalNodes: 0, nodeTypes: {}, maxDepth: 0, leafCount: 0 }
    }
    const nodeTypes: Record<string, number> = {}
    let leafCount = 0
    let totalCount = 0
    const collectStats = (node: BuilderNode, depth: number): number => {
      totalCount += 1
      nodeTypes[node.type] = (nodeTypes[node.type] ?? 0) + 1
      if (!node.children || node.children.length === 0) {
        leafCount += 1
        return depth
      }
      let maxD = depth
      for (const child of node.children) {
        const childDepth = collectStats(child, depth + 1)
        if (childDepth > maxD) maxD = childDepth
      }
      return maxD
    }
    const maxDepth = collectStats(root, 0)
    return { totalNodes: totalCount, nodeTypes, maxDepth, leafCount }
  }

  clone(nodeId: string): BuilderNode | undefined {
    const node = this.nodes.get(nodeId)
    if (node === undefined) return undefined
    const cloned = this.deepClone(node)
    return cloned
  }

  clear(): void {
    this.nodes.clear()
    this.idCounter = 0
    this.rangeCounter = 0
  }
}
