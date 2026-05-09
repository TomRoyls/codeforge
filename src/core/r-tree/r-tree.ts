import type { Rectangle, RTreeOptions } from './types.js'
import { DEFAULT_RTREE_OPTIONS } from './types.js'

interface Entry<T> {
  rect: Rectangle
  value: T
}

interface BBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

interface RTreeNode<T> {
  bbox: BBox
  children: RTreeNode<T>[]
  entries: Entry<T>[]
  isLeaf: boolean
}

export class RTree<T> {
  private root: RTreeNode<T> | null = null
  private _size: number = 0
  private maxEntries: number
  private minEntries: number

  constructor(options?: Partial<RTreeOptions>) {
    const opts: RTreeOptions = { ...DEFAULT_RTREE_OPTIONS, ...options }
    if (opts.maxEntries < 2) {
      throw new Error('maxEntries must be at least 2')
    }
    if (opts.minEntries < 1) {
      throw new Error('minEntries must be at least 1')
    }
    if (opts.minEntries > opts.maxEntries) {
      throw new Error('minEntries must not exceed maxEntries')
    }
    this.maxEntries = opts.maxEntries
    this.minEntries = opts.minEntries
  }

  private createLeafNode(): RTreeNode<T> {
    return { bbox: this.emptyBBox(), children: [], entries: [], isLeaf: true }
  }

  private createInternalNode(): RTreeNode<T> {
    return { bbox: this.emptyBBox(), children: [], entries: [], isLeaf: false }
  }

  private emptyBBox(): BBox {
    return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  }

  private rectToBBox(rect: Rectangle): BBox {
    return {
      minX: rect.x,
      minY: rect.y,
      maxX: rect.x + rect.width,
      maxY: rect.y + rect.height,
    }
  }

  private bboxArea(bbox: BBox): number {
    return (bbox.maxX - bbox.minX) * (bbox.maxY - bbox.minY)
  }

  private bboxUnion(a: BBox, b: BBox): BBox {
    return {
      minX: Math.min(a.minX, b.minX),
      minY: Math.min(a.minY, b.minY),
      maxX: Math.max(a.maxX, b.maxX),
      maxY: Math.max(a.maxY, b.maxY),
    }
  }

  private bboxContainsPoint(bbox: BBox, point: { x: number; y: number }): boolean {
    return point.x >= bbox.minX && point.x <= bbox.maxX && point.y >= bbox.minY && point.y <= bbox.maxY
  }

  private bboxIntersects(a: BBox, b: BBox): boolean {
    return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
  }

  private enlargementArea(existing: BBox, addition: BBox): number {
    const union = this.bboxUnion(existing, addition)
    return this.bboxArea(union) - this.bboxArea(existing)
  }

  private updateBBox(node: RTreeNode<T>): void {
    const bbox = this.emptyBBox()
    if (node.isLeaf) {
      for (let i = 0; i < node.entries.length; i++) {
        const entryBBox = this.rectToBBox(node.entries[i]!.rect)
        bbox.minX = Math.min(bbox.minX, entryBBox.minX)
        bbox.minY = Math.min(bbox.minY, entryBBox.minY)
        bbox.maxX = Math.max(bbox.maxX, entryBBox.maxX)
        bbox.maxY = Math.max(bbox.maxY, entryBBox.maxY)
      }
    } else {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]!
        bbox.minX = Math.min(bbox.minX, child.bbox.minX)
        bbox.minY = Math.min(bbox.minY, child.bbox.minY)
        bbox.maxX = Math.max(bbox.maxX, child.bbox.maxX)
        bbox.maxY = Math.max(bbox.maxY, child.bbox.maxY)
      }
    }
    node.bbox = bbox
  }

  insert(rect: Rectangle, value: T): void {
    if (rect.width < 0 || rect.height < 0) {
      throw new Error('Rectangle dimensions must be non-negative')
    }
    const entry: Entry<T> = { rect, value }
    if (this.root === null) {
      this.root = this.createLeafNode()
      this.root.entries.push(entry)
      this.root.bbox = this.rectToBBox(rect)
      this._size = 1
      return
    }
    const insertPath = this.chooseLeaf(entry)
    insertPath.node.entries.push(entry)
    this.updateBBox(insertPath.node)
    let current: RTreeNode<T> | null = insertPath.node
    while (current !== null) {
      this.updateBBox(current)
      current = insertPath.parent.get(current) ?? null
    }
    if (insertPath.node.entries.length > this.maxEntries) {
      this.overflowStrategy(insertPath.node, insertPath.parent)
    }
    this._size++
  }

  private chooseLeaf(entry: Entry<T>): { node: RTreeNode<T>; parent: Map<RTreeNode<T>, RTreeNode<T>> } {
    const parentMap = new Map<RTreeNode<T>, RTreeNode<T>>()
    let node = this.root!
    const entryBBox = this.rectToBBox(entry.rect)
    while (!node.isLeaf) {
      let bestChild = node.children[0]!
      let bestEnlargement = this.enlargementArea(bestChild.bbox, entryBBox)
      let bestArea = this.bboxArea(bestChild.bbox)
      for (let i = 1; i < node.children.length; i++) {
        const child = node.children[i]!
        const enlargement = this.enlargementArea(child.bbox, entryBBox)
        const area = this.bboxArea(child.bbox)
        if (enlargement < bestEnlargement || (enlargement === bestEnlargement && area < bestArea)) {
          bestChild = child
          bestEnlargement = enlargement
          bestArea = area
        }
      }
      parentMap.set(bestChild, node)
      node = bestChild
    }
    return { node, parent: parentMap }
  }

  private overflowStrategy(node: RTreeNode<T>, parentMap: Map<RTreeNode<T>, RTreeNode<T>>): void {
    const parent = parentMap.get(node)
    const split = this.splitNode(node)
    if (parent === undefined) {
      const newRoot = this.createInternalNode()
      newRoot.children.push(split.left, split.right)
      newRoot.bbox = this.bboxUnion(split.left.bbox, split.right.bbox)
      this.root = newRoot
    } else {
      const idx = parent.children.indexOf(node)
      parent.children.splice(idx, 1, split.left, split.right)
      this.updateBBox(parent)
      if (parent.children.length > this.maxEntries) {
        const grandparent = new Map<RTreeNode<T>, RTreeNode<T>>()
        for (const [k, v] of parentMap) {
          grandparent.set(k, v)
        }
        grandparent.delete(node)
        this.overflowStrategy(parent, grandparent)
      }
    }
  }

  private splitNode(node: RTreeNode<T>): { left: RTreeNode<T>; right: RTreeNode<T> } {
    const items = node.isLeaf ? [...node.entries] : []
    const childItems = node.isLeaf ? [] : [...node.children]
    if (node.isLeaf) {
      return this.splitEntries(items)
    }
    return this.splitChildren(childItems)
  }

  private splitEntries(entries: Entry<T>[]): { left: RTreeNode<T>; right: RTreeNode<T> } {
    const sortedX = [...entries].sort((a, b) => a.rect.x - b.rect.x || a.rect.y - b.rect.y)
    const sortedY = [...entries].sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x)
    let bestOverlap = Infinity
    let bestArea = Infinity
    let bestAxis = 'x' as 'x' | 'y'
    let bestIndex = this.minEntries
    for (const [axis, sorted] of [['x', sortedX] as const, ['y', sortedY] as const]) {
      for (let k = this.minEntries; k <= sorted.length - this.minEntries; k++) {
        const leftEntries = sorted.slice(0, k)
        const rightEntries = sorted.slice(k)
        const leftBBox = this.entriesBBox(leftEntries)
        const rightBBox = this.entriesBBox(rightEntries)
        const overlap = this.overlapArea(leftBBox, rightBBox)
        const totalArea = this.bboxArea(leftBBox) + this.bboxArea(rightBBox)
        if (overlap < bestOverlap || (overlap === bestOverlap && totalArea < bestArea)) {
          bestOverlap = overlap
          bestArea = totalArea
          bestAxis = axis
          bestIndex = k
        }
      }
    }
    const sorted = bestAxis === 'x' ? sortedX : sortedY
    const left = this.createLeafNode()
    const right = this.createLeafNode()
    left.entries = sorted.slice(0, bestIndex)
    right.entries = sorted.slice(bestIndex)
    this.updateBBox(left)
    this.updateBBox(right)
    return { left, right }
  }

  private splitChildren(children: RTreeNode<T>[]): { left: RTreeNode<T>; right: RTreeNode<T> } {
    const sortedX = [...children].sort((a, b) => (a.bbox.minX + a.bbox.maxX) / 2 - (b.bbox.minX + b.bbox.maxX) / 2)
    const sortedY = [...children].sort((a, b) => (a.bbox.minY + a.bbox.maxY) / 2 - (b.bbox.minY + b.bbox.maxY) / 2)
    let bestOverlap = Infinity
    let bestArea = Infinity
    let bestAxis = 'x' as 'x' | 'y'
    let bestIndex = this.minEntries
    for (const [axis, sorted] of [['x', sortedX] as const, ['y', sortedY] as const]) {
      for (let k = this.minEntries; k <= sorted.length - this.minEntries; k++) {
        const leftChildren = sorted.slice(0, k)
        const rightChildren = sorted.slice(k)
        const leftBBox = this.childrenBBox(leftChildren)
        const rightBBox = this.childrenBBox(rightChildren)
        const overlap = this.overlapArea(leftBBox, rightBBox)
        const totalArea = this.bboxArea(leftBBox) + this.bboxArea(rightBBox)
        if (overlap < bestOverlap || (overlap === bestOverlap && totalArea < bestArea)) {
          bestOverlap = overlap
          bestArea = totalArea
          bestAxis = axis
          bestIndex = k
        }
      }
    }
    const sorted = bestAxis === 'x' ? sortedX : sortedY
    const left = this.createInternalNode()
    const right = this.createInternalNode()
    left.children = sorted.slice(0, bestIndex)
    right.children = sorted.slice(bestIndex)
    this.updateBBox(left)
    this.updateBBox(right)
    return { left, right }
  }

  private entriesBBox(entries: Entry<T>[]): BBox {
    const bbox = this.emptyBBox()
    for (let i = 0; i < entries.length; i++) {
      const entryBBox = this.rectToBBox(entries[i]!.rect)
      bbox.minX = Math.min(bbox.minX, entryBBox.minX)
      bbox.minY = Math.min(bbox.minY, entryBBox.minY)
      bbox.maxX = Math.max(bbox.maxX, entryBBox.maxX)
      bbox.maxY = Math.max(bbox.maxY, entryBBox.maxY)
    }
    return bbox
  }

  private childrenBBox(children: RTreeNode<T>[]): BBox {
    const bbox = this.emptyBBox()
    for (let i = 0; i < children.length; i++) {
      bbox.minX = Math.min(bbox.minX, children[i]!.bbox.minX)
      bbox.minY = Math.min(bbox.minY, children[i]!.bbox.minY)
      bbox.maxX = Math.max(bbox.maxX, children[i]!.bbox.maxX)
      bbox.maxY = Math.max(bbox.maxY, children[i]!.bbox.maxY)
    }
    return bbox
  }

  private overlapArea(a: BBox, b: BBox): number {
    const overlapMinX = Math.max(a.minX, b.minX)
    const overlapMinY = Math.max(a.minY, b.minY)
    const overlapMaxX = Math.min(a.maxX, b.maxX)
    const overlapMaxY = Math.min(a.maxY, b.maxY)
    if (overlapMinX >= overlapMaxX || overlapMinY >= overlapMaxY) {
      return 0
    }
    return (overlapMaxX - overlapMinX) * (overlapMaxY - overlapMinY)
  }

  remove(rect: Rectangle): boolean {
    if (this.root === null) return false
    const targetBBox = this.rectToBBox(rect)
    const found = this.findEntryToRemove(this.root, targetBBox, rect)
    if (found === null) return false
    const { node, entryIndex } = found
    node.entries.splice(entryIndex, 1)
    this._size--
    this.condenseTree(node)
    if (this.root !== null && !this.root.isLeaf && this.root.children.length === 0) {
      this.root = null
    }
    if (this.root !== null && !this.root.isLeaf && this.root.children.length === 1) {
      this.root = this.root.children[0]!
    }
    return true
  }

  private findEntryToRemove(
    node: RTreeNode<T>,
    targetBBox: BBox,
    rect: Rectangle,
  ): { node: RTreeNode<T>; entryIndex: number } | null {
    if (node.isLeaf) {
      for (let i = 0; i < node.entries.length; i++) {
        const entry = node.entries[i]!
        if (this.rectEquals(rect, entry.rect)) {
          return { node, entryIndex: i }
        }
      }
      return null
    }
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]!
      const result = this.findEntryToRemove(child, targetBBox, rect)
      if (result !== null) return result
    }
    return null
  }

  private rectEquals(a: Rectangle, b: Rectangle): boolean {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  }

  private condenseTree(node: RTreeNode<T>): void {
    const orphaned: Entry<T>[] = []
    const path: RTreeNode<T>[] = []
    let temp: RTreeNode<T> | null = node
    while (temp !== null && temp !== this.root) {
      path.push(temp)
      temp = this.findParent(this.root!, temp)
    }
    while (path.length > 0) {
      const currentPath = path.pop()!
      if (currentPath.isLeaf && currentPath.entries.length < this.minEntries && currentPath !== this.root) {
        const parent = this.findParent(this.root!, currentPath)
        if (parent !== null) {
          const idx = parent.children.indexOf(currentPath)
          if (idx !== -1) {
            parent.children.splice(idx, 1)
            orphaned.push(...currentPath.entries)
          }
        }
      } else if (!currentPath.isLeaf && currentPath.children.length < this.minEntries && currentPath !== this.root) {
        const parent = this.findParent(this.root!, currentPath)
        if (parent !== null) {
          const idx = parent.children.indexOf(currentPath)
          if (idx !== -1) {
            parent.children.splice(idx, 1)
            this.collectEntries(currentPath, orphaned)
          }
        }
      }
      this.updateBBox(currentPath)
    }
    if (this.root !== null) {
      this.updateBBox(this.root)
    }
    for (const entry of orphaned) {
      this.reInsertEntry(entry)
    }
  }

  private findParent(root: RTreeNode<T>, target: RTreeNode<T>): RTreeNode<T> | null {
    if (root.isLeaf) return null
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i]!
      if (child === target) return root
      const result = this.findParent(child, target)
      if (result !== null) return result
    }
    return null
  }

  private collectEntries(node: RTreeNode<T>, result: Entry<T>[]): void {
    if (node.isLeaf) {
      result.push(...node.entries)
    } else {
      for (let i = 0; i < node.children.length; i++) {
        this.collectEntries(node.children[i]!, result)
      }
    }
  }

  private reInsertEntry(entry: Entry<T>): void {
    const insertPath = this.chooseLeaf(entry)
    insertPath.node.entries.push(entry)
    this.updateBBox(insertPath.node)
    if (insertPath.node.entries.length > this.maxEntries) {
      const parentMap = insertPath.parent
      this.overflowStrategy(insertPath.node, parentMap)
    }
  }

  search(point: { x: number; y: number }): Array<{ rect: Rectangle; value: T }> {
    if (this.root === null) return []
    const results: Array<{ rect: Rectangle; value: T }> = []
    this.searchPoint(this.root, point, results)
    return results
  }

  private searchPoint(node: RTreeNode<T>, point: { x: number; y: number }, results: Array<{ rect: Rectangle; value: T }>): void {
    if (node.isLeaf) {
      for (let i = 0; i < node.entries.length; i++) {
        const entry = node.entries[i]!
        const entryBBox = this.rectToBBox(entry.rect)
        if (this.bboxContainsPoint(entryBBox, point)) {
          results.push({ rect: entry.rect, value: entry.value })
        }
      }
    } else {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]!
        if (this.bboxContainsPoint(child.bbox, point)) {
          this.searchPoint(child, point, results)
        }
      }
    }
  }

  searchRange(rect: Rectangle): Array<{ rect: Rectangle; value: T }> {
    if (this.root === null) return []
    const results: Array<{ rect: Rectangle; value: T }> = []
    const searchBBox = this.rectToBBox(rect)
    this.searchRangeNode(this.root, searchBBox, results)
    return results
  }

  private searchRangeNode(node: RTreeNode<T>, searchBBox: BBox, results: Array<{ rect: Rectangle; value: T }>): void {
    if (node.isLeaf) {
      for (let i = 0; i < node.entries.length; i++) {
        const entry = node.entries[i]!
        const entryBBox = this.rectToBBox(entry.rect)
        if (this.bboxIntersects(entryBBox, searchBBox)) {
          results.push({ rect: entry.rect, value: entry.value })
        }
      }
    } else {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]!
        if (this.bboxIntersects(child.bbox, searchBBox)) {
          this.searchRangeNode(child, searchBBox, results)
        }
      }
    }
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  forEach(callback: (rect: Rectangle, value: T) => void): void {
    if (this.root === null) return
    this.forEachNode(this.root, callback)
  }

  private forEachNode(node: RTreeNode<T>, callback: (rect: Rectangle, value: T) => void): void {
    if (node.isLeaf) {
      for (let i = 0; i < node.entries.length; i++) {
        const entry = node.entries[i]!
        callback(entry.rect, entry.value)
      }
    } else {
      for (let i = 0; i < node.children.length; i++) {
        this.forEachNode(node.children[i]!, callback)
      }
    }
  }

  toArray(): Array<{ rect: Rectangle; value: T }> {
    const results: Array<{ rect: Rectangle; value: T }> = []
    this.forEach((rect, value) => {
      results.push({ rect, value })
    })
    return results
  }
}

export { DEFAULT_RTREE_OPTIONS } from './types.js'
export type { Rectangle, RTreeOptions } from './types.js'
