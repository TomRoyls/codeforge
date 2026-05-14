export class RTree3<T> {
  maxEntries: number
  minEntries: number
  root: Node<T> | null
  count: number

  constructor(maxEntries: number = 9) {
    this.maxEntries = maxEntries
    this.minEntries = Math.ceil(this.maxEntries / 2)
    this.root = null
    this.count = 0
  }

  insert(rect: {minX: number, minY: number, maxX: number, maxY: number}, data: T): void {
    const entry: Entry<T> = {rect, data}

    if (this.root === null) {
      this.root = new LeafNode<T>()
      const leaf = this.root as LeafNode<T>
      leaf.entries!.push(entry)
      this.count++
      this.updateBounds(this.root)
      return
    }

    const result = this.chooseLeaf(this.root, entry.rect)
    const leaf = result.leaf as LeafNode<T>
    const path = result.path

    if (leaf.entries!.length < this.maxEntries) {
      leaf.entries!.push(entry)
      this.count++
      this.updateBounds(leaf)
      for (let i = 0; i < path.length; i++) {
        this.updateBounds(path[i]!)
      }
      return
    }

    const newNode = this.leafSplit(leaf, entry)
    this.count++

    if (path.length === 0) {
      this.root = new InternalNode<T>(leaf, newNode)
      this.updateBounds(this.root)
    } else {
      const parent = path[path.length - 1]!
      const internal = parent as InternalNode<T>
      internal.children!.push(newNode)
      this.updateBounds(leaf)
      this.updateBounds(newNode)
      for (let i = 0; i < path.length; i++) {
        this.updateBounds(path[i]!)
      }
    }
  }

  chooseLeaf(node: Node<T>, rect: Rect): {leaf: Node<T>, path: Node<T>[]} {
    const path: Node<T>[] = []

    let current = node
    while (current.type === 'internal') {
      path.push(current)
      const internal = current as InternalNode<T>
      let bestChild: Node<T> | null = null
      let bestAreaIncrease = Infinity

      for (let i = 0; i < internal.children!.length; i++) {
        const child = internal.children![i]!
        const oldArea = this.rectsArea([child.bounds])
        const newArea = this.rectsArea([child.bounds, rect])
        const areaIncrease = newArea - oldArea
        if (areaIncrease < bestAreaIncrease) {
          bestAreaIncrease = areaIncrease
          bestChild = child
        }
      }

      current = bestChild!
    }

    return {leaf: current, path}
  }

  leafSplit(node: LeafNode<T>, newEntry: Entry<T>): LeafNode<T> {
    const allEntries = [...node.entries!, newEntry]
    node.entries = []

    let seed1 = 0
    let seed2 = 1
    let maxWaste = -Infinity

    for (let i = 0; i < allEntries.length; i++) {
      for (let j = i + 1; j < allEntries.length; j++) {
        const waste = this.rectWaste(allEntries[i]!.rect, allEntries[j]!.rect)
        if (waste > maxWaste) {
          maxWaste = waste
          seed1 = i
          seed2 = j
        }
      }
    }

    const group1 = [allEntries[seed1]!]
    const group2 = [allEntries[seed2]!]

    const indices = allEntries.map((_, i) => i).filter(i => i !== seed1 && i !== seed2)

    for (const idx of indices) {
      const entry = allEntries[idx]!
      const areaIncrease1 = this.areaIncrease(group1.map(e => e.rect), entry.rect)
      const areaIncrease2 = this.areaIncrease(group2.map(e => e.rect), entry.rect)

      if (areaIncrease1 < areaIncrease2) {
        group1.push(entry)
      } else if (areaIncrease2 < areaIncrease1) {
        group2.push(entry)
      } else if (group1.length < group2.length) {
        group1.push(entry)
      } else {
        group2.push(entry)
      }
    }

    node.entries = group1
    const newNode = new LeafNode<T>()
    newNode.entries = group2

    return newNode
  }

  rectWaste(r1: Rect, r2: Rect): number {
    const minX = Math.min(r1.minX, r2.minX)
    const minY = Math.min(r1.minY, r2.minY)
    const maxX = Math.max(r1.maxX, r2.maxX)
    const maxY = Math.max(r1.maxY, r2.maxY)

    const combinedArea = (maxX - minX) * (maxY - minY)
    const area1 = (r1.maxX - r1.minX) * (r1.maxY - r1.minY)
    const area2 = (r2.maxX - r2.minX) * (r2.maxY - r2.minY)

    return combinedArea - area1 - area2
  }

  rectsArea(rects: Rect[]): number {
    if (rects.length === 0) return 0
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const r of rects) {
      minX = Math.min(minX, r.minX)
      minY = Math.min(minY, r.minY)
      maxX = Math.max(maxX, r.maxX)
      maxY = Math.max(maxY, r.maxY)
    }

    return (maxX - minX) * (maxY - minY)
  }

  areaIncrease(rects: Rect[], newRect: Rect): number {
    const newArea = this.rectsArea([...rects, newRect])
    const oldArea = this.rectsArea(rects)
    return newArea - oldArea
  }

  search(rect: {minX: number, minY: number, maxX: number, maxY: number}): T[] {
    const results: T[] = []

    if (this.root === null) {
      return results
    }

    this.searchNode(this.root, rect, results)
    return results
  }

  searchNode(node: Node<T>, rect: Rect, results: T[]): void {
    if (!this.overlaps(node.bounds, rect)) {
      return
    }

    if (node.type === 'leaf') {
      const leaf = node as LeafNode<T>
      for (let i = 0; i < leaf.entries!.length; i++) {
        const entry = leaf.entries![i]!
        if (this.overlaps(entry.rect, rect)) {
          results.push(entry.data)
        }
      }
    } else {
      const internal = node as InternalNode<T>
      for (let i = 0; i < internal.children!.length; i++) {
        this.searchNode(internal.children![i]!, rect, results)
      }
    }
  }

  overlaps(r1: Rect, r2: Rect): boolean {
    return !(r1.maxX < r2.minX || r1.minX > r2.maxX || r1.maxY < r2.minY || r1.minY > r2.maxY)
  }

  remove(rect: {minX: number, minY: number, maxX: number, maxY: number}, data: T): boolean {
    if (this.root === null) {
      return false
    }

    const result = this.findEntryWithParent(this.root, rect, data)
    if (result === null) {
      return false
    }

    const {entry, parent, leaf, index} = result
    const leafNode = leaf as LeafNode<T>
    const idx = leafNode.entries!.indexOf(entry)
    if (idx !== -1) {
      leafNode.entries!.splice(idx, 1)
      this.count--

      if (parent === null) {
        this.updateBounds(leafNode)
        if (leafNode.entries!.length === 0) {
          this.root = null
        }
      } else {
        const internal = parent as InternalNode<T>
        if (leafNode.entries!.length === 0) {
          internal.children!.splice(index!, 1)
          if (internal.children!.length === 0) {
            this.root = null
          } else if (internal.children!.length === 1 && parent === this.root) {
            this.root = internal.children![0]!
          } else {
            this.updateBounds(internal)
          }
        } else {
          this.updateBounds(leafNode)
          this.updateBounds(internal)
        }
      }
      return true
    }

    return false
  }

  findEntryWithParent(node: Node<T>, rect: Rect, data: T): {entry: Entry<T>, parent: Node<T> | null, leaf: Node<T>, index: number | null} | null {
    if (!this.overlaps(node.bounds, rect)) {
      return null
    }

    if (node.type === 'leaf') {
      const leaf = node as LeafNode<T>
      for (let i = 0; i < leaf.entries!.length; i++) {
        const entry = leaf.entries![i]!
        if (this.rectEquals(entry.rect, rect) && entry.data === data) {
          return {entry, parent: null, leaf: node, index: null}
        }
      }
      return null
    }

    const internal = node as InternalNode<T>
    for (let i = 0; i < internal.children!.length; i++) {
      const child = internal.children![i]!
      const found = this.findEntryWithParent(child, rect, data)
      if (found !== null) {
        if (found.parent === null) {
          found.parent = node
          found.index = i
        }
        return found
      }
    }

    return null
  }

  rectEquals(r1: Rect, r2: Rect): boolean {
    return r1.minX === r2.minX && r1.minY === r2.minY && r1.maxX === r2.maxX && r1.maxY === r2.maxY
  }

  findEntry(node: Node<T>, rect: Rect, data: T): Entry<T> | null {
    const result = this.findEntryWithParent(node, rect, data)
    return result ? result.entry : null
  }

  updateBounds(node: Node<T>): void {
    if (node.type === 'leaf') {
      const leaf = node as LeafNode<T>
      if (leaf.entries!.length === 0) {
        node.bounds = {minX: 0, minY: 0, maxX: 0, maxY: 0}
        return
      }

      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (let i = 0; i < leaf.entries!.length; i++) {
        const entry = leaf.entries![i]!
        if (entry.rect === undefined || entry.rect === null) {
          continue
        }
        minX = Math.min(minX, entry.rect.minX)
        minY = Math.min(minY, entry.rect.minY)
        maxX = Math.max(maxX, entry.rect.maxX)
        maxY = Math.max(maxY, entry.rect.maxY)
      }

      node.bounds = {minX, minY, maxX, maxY}
    } else {
      const internal = node as InternalNode<T>
      if (internal.children!.length === 0) {
        node.bounds = {minX: 0, minY: 0, maxX: 0, maxY: 0}
        return
      }

      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (let i = 0; i < internal.children!.length; i++) {
        const child = internal.children![i]!
        if (child.bounds === undefined || child.bounds === null) {
          continue
        }
        minX = Math.min(minX, child.bounds.minX)
        minY = Math.min(minY, child.bounds.minY)
        maxX = Math.max(maxX, child.bounds.maxX)
        maxY = Math.max(maxY, child.bounds.maxY)
      }

      node.bounds = {minX, minY, maxX, maxY}
    }
  }

  get size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.root = null
    this.count = 0
  }

  toArray(): {rect: {minX: number, minY: number, maxX: number, maxY: number}, data: T}[] {
    const results: {rect: {minX: number, minY: number, maxX: number, maxY: number}, data: T}[] = []

    if (this.root === null) {
      return results
    }

    this.collectEntries(this.root, results)
    return results
  }

  collectEntries(node: Node<T>, results: {rect: Rect, data: T}[]): void {
    if (node.type === 'leaf') {
      const leaf = node as LeafNode<T>
      for (let i = 0; i < leaf.entries!.length; i++) {
        const entry = leaf.entries![i]!
        results.push({rect: entry.rect, data: entry.data})
      }
    } else {
      const internal = node as InternalNode<T>
      for (let i = 0; i < internal.children!.length; i++) {
        this.collectEntries(internal.children![i]!, results)
      }
    }
  }
}

type Rect = {minX: number, minY: number, maxX: number, maxY: number}

type Entry<T> = {rect: Rect, data: T}

abstract class Node<T> {
  type: 'internal' | 'leaf'
  bounds: Rect

  constructor(type: 'internal' | 'leaf') {
    this.type = type
    this.bounds = {minX: 0, minY: 0, maxX: 0, maxY: 0}
  }
}

class LeafNode<T> extends Node<T> {
  entries: Entry<T>[] | null

  constructor() {
    super('leaf')
    this.entries = []
  }
}

class InternalNode<T> extends Node<T> {
  children: Node<T>[] | null

  constructor(left: Node<T>, right: Node<T>) {
    super('internal')
    this.children = [left, right]
    this.updateBounds()
  }

  updateBounds(): void {
    if (this.children!.length === 0) {
      this.bounds = {minX: 0, minY: 0, maxX: 0, maxY: 0}
      return
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (let i = 0; i < this.children!.length; i++) {
      const child = this.children![i]!
      minX = Math.min(minX, child.bounds.minX)
      minY = Math.min(minY, child.bounds.minY)
      maxX = Math.max(maxX, child.bounds.maxX)
      maxY = Math.max(maxY, child.bounds.maxY)
    }

    this.bounds = {minX, minY, maxX, maxY}
  }
}
