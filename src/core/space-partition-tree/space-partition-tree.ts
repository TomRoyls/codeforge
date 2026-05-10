import type { SpacePartitionTreeOptions, SpatialItem, SpaceNode } from './types.js'
import { DEFAULT_MAX_DEPTH, DEFAULT_MAX_ITEMS } from './types.js'

export class SpacePartitionTree<T = unknown> {
  private root: SpaceNode<T>
  private maxDepth: number
  private maxItems: number
  private _size = 0

  constructor(
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    maxDepth?: number,
    maxItems?: number,
  ) {
    this.maxDepth = maxDepth ?? DEFAULT_MAX_DEPTH
    this.maxItems = maxItems ?? DEFAULT_MAX_ITEMS
    this.root = this.createNode(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY, 0)
  }

  private createNode(minX: number, minY: number, maxX: number, maxY: number, depth: number): SpaceNode<T> {
    return { minX, minY, maxX, maxY, items: [], children: null, depth }
  }

  private containsPoint(node: SpaceNode<T>, x: number, y: number): boolean {
    return x >= node.minX && x < node.maxX && y >= node.minY && y < node.maxY
  }

  private intersects(node: SpaceNode<T>, minX: number, minY: number, maxX: number, maxY: number): boolean {
    return !(minX >= node.maxX || maxX <= node.minX || minY >= node.maxY || maxY <= node.minY)
  }

  private subdivide(node: SpaceNode<T>): void {
    const midX = (node.minX + node.maxX) / 2
    const midY = (node.minY + node.maxY) / 2
    const nextDepth = node.depth + 1

    node.children = [
      this.createNode(midX, node.minY, node.maxX, midY, nextDepth),
      this.createNode(node.minX, node.minY, midX, midY, nextDepth),
      this.createNode(midX, midY, node.maxX, node.maxY, nextDepth),
      this.createNode(node.minX, midY, midX, node.maxY, nextDepth),
    ]

    const items = node.items
    node.items = []
    for (const item of items) {
      for (const child of node.children!) {
        if (this.containsPoint(child, item.x, item.y)) {
          child.items.push(item)
          break
        }
      }
    }
  }

  insert(x: number, y: number, data: T): boolean {
    return this.insertInto(this.root, x, y, data)
  }

  private insertInto(node: SpaceNode<T>, x: number, y: number, data: T): boolean {
    if (!this.containsPoint(node, x, y)) return false

    if (node.children === null) {
      if (node.items.length < this.maxItems || node.depth >= this.maxDepth) {
        node.items.push({ x, y, data })
        this._size++
        return true
      }
      this.subdivide(node)
    }

    for (const child of node.children!) {
      if (this.insertInto(child, x, y, data)) return true
    }
    return false
  }

  remove(x: number, y: number, data?: T): boolean {
    return this.removeFrom(this.root, x, y, data)
  }

  private removeFrom(node: SpaceNode<T>, x: number, y: number, data?: T): boolean {
    if (!this.containsPoint(node, x, y)) return false

    if (node.children === null) {
      for (let i = node.items.length - 1; i >= 0; i--) {
        const item = node.items[i]!
        if (item.x === x && item.y === y) {
          if (data === undefined || item.data === data) {
            node.items.splice(i, 1)
            this._size--
            return true
          }
        }
      }
      return false
    }

    for (const child of node.children) {
      if (this.removeFrom(child, x, y, data)) return true
    }
    return false
  }

  query(bounds: { minX: number; minY: number; maxX: number; maxY: number }): SpatialItem<T>[] {
    const result: SpatialItem<T>[] = []
    this.queryInto(this.root, bounds.minX, bounds.minY, bounds.maxX, bounds.maxY, result)
    return result
  }

  private queryInto(
    node: SpaceNode<T>,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    result: SpatialItem<T>[],
  ): void {
    if (!this.intersects(node, minX, minY, maxX, maxY)) return

    if (node.children === null) {
      for (const item of node.items) {
        if (item.x >= minX && item.x < maxX && item.y >= minY && item.y < maxY) {
          result.push(item)
        }
      }
      return
    }

    for (const child of node.children) {
      this.queryInto(child, minX, minY, maxX, maxY, result)
    }
  }

  queryRadius(cx: number, cy: number, r: number): SpatialItem<T>[] {
    const candidates = this.query({
      minX: cx - r - 1e-9,
      minY: cy - r - 1e-9,
      maxX: cx + r + 1e-9,
      maxY: cy + r + 1e-9,
    })
    const r2 = r * r
    return candidates.filter((item) => {
      const dx = item.x - cx
      const dy = item.y - cy
      return dx * dx + dy * dy <= r2
    })
  }

  contains(x: number, y: number, data?: T): boolean {
    return this.containsIn(this.root, x, y, data)
  }

  private containsIn(node: SpaceNode<T>, x: number, y: number, data?: T): boolean {
    if (!this.containsPoint(node, x, y)) return false

    if (node.children === null) {
      for (const item of node.items) {
        if (item.x === x && item.y === y) {
          if (data === undefined || item.data === data) return true
        }
      }
      return false
    }

    for (const child of node.children) {
      if (this.containsIn(child, x, y, data)) return true
    }
    return false
  }

  get size(): number {
    return this._size
  }

  get depth(): number {
    return this.getDepth(this.root)
  }

  private getDepth(node: SpaceNode<T>): number {
    if (node.children === null) {
      return node.items.length > 0 ? node.depth + 1 : 0
    }
    let maxChildDepth = 0
    for (const child of node.children) {
      const d = this.getDepth(child)
      if (d > maxChildDepth) maxChildDepth = d
    }
    return maxChildDepth
  }

  clear(): void {
    this.root.items = []
    this.root.children = null
    this._size = 0
  }

  toArray(): SpatialItem<T>[] {
    const result: SpatialItem<T>[] = []
    this.collectAll(this.root, result)
    return result
  }

  private collectAll(node: SpaceNode<T>, result: SpatialItem<T>[]): void {
    if (node.children === null) {
      for (const item of node.items) result.push(item)
      return
    }
    for (const child of node.children) {
      this.collectAll(child, result)
    }
  }

  nearest(x: number, y: number, k: number = 1): Array<SpatialItem<T> & { distance: number }> {
    const all = this.toArray()
    const withDist = all.map((item) => {
      const dx = item.x - x
      const dy = item.y - y
      return { ...item, distance: Math.sqrt(dx * dx + dy * dy) }
    })
    withDist.sort((a, b) => a.distance - b.distance)
    return withDist.slice(0, k)
  }

  getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    return {
      minX: this.root.minX,
      minY: this.root.minY,
      maxX: this.root.maxX,
      maxY: this.root.maxY,
    }
  }

  toNode(): SpaceNode<T> {
    return this.cloneNode(this.root)
  }

  private cloneNode(node: SpaceNode<T>): SpaceNode<T> {
    const clone: SpaceNode<T> = {
      minX: node.minX,
      minY: node.minY,
      maxX: node.maxX,
      maxY: node.maxY,
      items: node.items.map((item) => ({ ...item })),
      children: null,
      depth: node.depth,
    }
    if (node.children !== null) {
      clone.children = node.children.map((child) => this.cloneNode(child))
    }
    return clone
  }
}

export { DEFAULT_MAX_DEPTH, DEFAULT_MAX_ITEMS } from './types.js'
export type { SpacePartitionTreeOptions, SpatialItem, SpaceNode } from './types.js'
