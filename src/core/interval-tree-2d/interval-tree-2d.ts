import type { RectEntry, TreeNode } from './types.js'

export class IntervalTree2D<V> {
  private xRoot: TreeNode<V> | null = null
  private yRoot: TreeNode<V> | null = null
  private count: number = 0
  private found: boolean = false

  insert(x1: number, y1: number, x2: number, y2: number, value: V): void {
    if (x1 > x2) {
      throw new Error(`Invalid rectangle: x1 (${x1}) > x2 (${x2})`)
    }
    if (y1 > y2) {
      throw new Error(`Invalid rectangle: y1 (${y1}) > y2 (${y2})`)
    }
    const entry: RectEntry<V> = { x1, y1, x2, y2, value }
    this.xRoot = this.treeInsert(this.xRoot, entry.x1, entry, (e) => e.x2)
    this.yRoot = this.treeInsert(this.yRoot, entry.y1, entry, (e) => e.y2)
    this.count++
  }

  private treeInsert(
    root: TreeNode<V> | null,
    key: number,
    entry: RectEntry<V>,
    getEnd: (e: RectEntry<V>) => number,
  ): TreeNode<V> {
    if (root === null) {
      return { key, entries: [entry], max: getEnd(entry), left: null, right: null }
    }
    if (key < root.key) {
      root.left = this.treeInsert(root.left, key, entry, getEnd)
    } else if (key > root.key) {
      root.right = this.treeInsert(root.right, key, entry, getEnd)
    } else {
      root.entries.push(entry)
    }
    const end = getEnd(entry)
    if (end > root.max) {
      root.max = end
    }
    return root
  }

  remove(x1: number, y1: number, x2: number, y2: number, value: V): boolean {
    if (x1 > x2) {
      throw new Error(`Invalid rectangle: x1 (${x1}) > x2 (${x2})`)
    }
    if (y1 > y2) {
      throw new Error(`Invalid rectangle: y1 (${y1}) > y2 (${y2})`)
    }
    const entry: RectEntry<V> = { x1, y1, x2, y2, value }
    this.found = false
    this.xRoot = this.treeRemove(this.xRoot, entry.x1, entry, (e) => e.x2)
    if (!this.found) return false
    this.found = false
    this.yRoot = this.treeRemove(this.yRoot, entry.y1, entry, (e) => e.y2)
    this.count--
    return true
  }

  private treeRemove(
    root: TreeNode<V> | null,
    key: number,
    entry: RectEntry<V>,
    getEnd: (e: RectEntry<V>) => number,
  ): TreeNode<V> | null {
    if (root === null) return null
    if (key < root.key) {
      root.left = this.treeRemove(root.left, key, entry, getEnd)
    } else if (key > root.key) {
      root.right = this.treeRemove(root.right, key, entry, getEnd)
    } else {
      const idx = root.entries.findIndex(
        (e) =>
          e.x1 === entry.x1 &&
          e.y1 === entry.y1 &&
          e.x2 === entry.x2 &&
          e.y2 === entry.y2 &&
          e.value === entry.value,
      )
      if (idx !== -1) {
        root.entries.splice(idx, 1)
        this.found = true
      }
      if (root.entries.length === 0) {
        if (root.left === null) return root.right
        if (root.right === null) return root.left
        const minNode = this.treeFindMin(root.right)
        root.key = minNode.key
        root.entries = minNode.entries.slice()
        root.right = this.treeRemoveMin(root.right, getEnd)
      }
    }
    this.treeUpdateMax(root, getEnd)
    return root
  }

  private treeRemoveMin(root: TreeNode<V>, getEnd: (e: RectEntry<V>) => number): TreeNode<V> | null {
    if (root.left === null) return root.right
    root.left = this.treeRemoveMin(root.left, getEnd)
    this.treeUpdateMax(root, getEnd)
    return root
  }

  private treeFindMin(root: TreeNode<V>): TreeNode<V> {
    let current = root
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private treeUpdateMax(root: TreeNode<V>, getEnd: (e: RectEntry<V>) => number): void {
    let max = 0
    for (const entry of root.entries) {
      const end = getEnd(entry)
      if (end > max) max = end
    }
    if (root.left !== null && root.left.max > max) {
      max = root.left.max
    }
    if (root.right !== null && root.right.max > max) {
      max = root.right.max
    }
    root.max = max
  }

  queryPoint(x: number, y: number): V[] {
    const results: V[] = []
    this.treeQueryPoint(this.xRoot, x, y, results)
    return results
  }

  private treeQueryPoint(root: TreeNode<V> | null, x: number, y: number, results: V[]): void {
    if (root === null) return
    for (const entry of root.entries) {
      if (x >= entry.x1 && x <= entry.x2 && y >= entry.y1 && y <= entry.y2) {
        results.push(entry.value)
      }
    }
    if (root.left !== null && x <= root.left.max) {
      this.treeQueryPoint(root.left, x, y, results)
    }
    if (root.right !== null && x <= root.right.max) {
      this.treeQueryPoint(root.right, x, y, results)
    }
  }

  queryRange(qx1: number, qy1: number, qx2: number, qy2: number): V[] {
    if (qx1 > qx2) {
      throw new Error(`Invalid range: x1 (${qx1}) > x2 (${qx2})`)
    }
    if (qy1 > qy2) {
      throw new Error(`Invalid range: y1 (${qy1}) > y2 (${qy2})`)
    }
    const results: V[] = []
    this.treeQueryRange(this.xRoot, qx1, qy1, qx2, qy2, results)
    return results
  }

  private treeQueryRange(
    root: TreeNode<V> | null,
    qx1: number,
    qy1: number,
    qx2: number,
    qy2: number,
    results: V[],
  ): void {
    if (root === null) return
    for (const entry of root.entries) {
      if (qx1 <= entry.x2 && qx2 >= entry.x1 && qy1 <= entry.y2 && qy2 >= entry.y1) {
        results.push(entry.value)
      }
    }
    if (root.left !== null && qx1 <= root.left.max) {
      this.treeQueryRange(root.left, qx1, qy1, qx2, qy2, results)
    }
    if (root.right !== null && qx1 <= root.right.max) {
      this.treeQueryRange(root.right, qx1, qy1, qx2, qy2, results)
    }
  }

  queryX(x: number): V[] {
    const results: V[] = []
    this.treeQueryX(this.xRoot, x, results)
    return results
  }

  private treeQueryX(root: TreeNode<V> | null, x: number, results: V[]): void {
    if (root === null) return
    for (const entry of root.entries) {
      if (x >= entry.x1 && x <= entry.x2) {
        results.push(entry.value)
      }
    }
    if (root.left !== null && x <= root.left.max) {
      this.treeQueryX(root.left, x, results)
    }
    if (root.right !== null && x <= root.right.max) {
      this.treeQueryX(root.right, x, results)
    }
  }

  queryY(y: number): V[] {
    const results: V[] = []
    this.treeQueryY(this.yRoot, y, results)
    return results
  }

  private treeQueryY(root: TreeNode<V> | null, y: number, results: V[]): void {
    if (root === null) return
    for (const entry of root.entries) {
      if (y >= entry.y1 && y <= entry.y2) {
        results.push(entry.value)
      }
    }
    if (root.left !== null && y <= root.left.max) {
      this.treeQueryY(root.left, y, results)
    }
    if (root.right !== null && y <= root.right.max) {
      this.treeQueryY(root.right, y, results)
    }
  }

  contains(x1: number, y1: number, x2: number, y2: number, value: V): boolean {
    if (x1 > x2 || y1 > y2) return false
    return this.treeContains(this.xRoot, x1, y1, x2, y2, value)
  }

  private treeContains(
    root: TreeNode<V> | null,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    value: V,
  ): boolean {
    if (root === null) return false
    if (root.key === x1) {
      return root.entries.some(
        (e) => e.y1 === y1 && e.x2 === x2 && e.y2 === y2 && e.value === value,
      )
    }
    if (x1 < root.key) return this.treeContains(root.left, x1, y1, x2, y2, value)
    return this.treeContains(root.right, x1, y1, x2, y2, value)
  }

  size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.xRoot = null
    this.yRoot = null
    this.count = 0
  }

  getAll(): { x1: number; y1: number; x2: number; y2: number; value: V }[] {
    const results: { x1: number; y1: number; x2: number; y2: number; value: V }[] = []
    this.treeInOrder(this.xRoot, results)
    return results
  }

  private treeInOrder(
    root: TreeNode<V> | null,
    results: { x1: number; y1: number; x2: number; y2: number; value: V }[],
  ): void {
    if (root === null) return
    this.treeInOrder(root.left, results)
    for (const entry of root.entries) {
      results.push({ x1: entry.x1, y1: entry.y1, x2: entry.x2, y2: entry.y2, value: entry.value })
    }
    this.treeInOrder(root.right, results)
  }

  forEach(
    callback: (rect: { x1: number; y1: number; x2: number; y2: number; value: V }) => void,
  ): void {
    this.treeForEach(this.xRoot, callback)
  }

  private treeForEach(
    root: TreeNode<V> | null,
    callback: (rect: { x1: number; y1: number; x2: number; y2: number; value: V }) => void,
  ): void {
    if (root === null) return
    this.treeForEach(root.left, callback)
    for (const entry of root.entries) {
      callback({ x1: entry.x1, y1: entry.y1, x2: entry.x2, y2: entry.y2, value: entry.value })
    }
    this.treeForEach(root.right, callback)
  }

  clone(): IntervalTree2D<V> {
    const cloned = new IntervalTree2D<V>()
    const entries = this.getAll()
    for (const entry of entries) {
      cloned.insert(entry.x1, entry.y1, entry.x2, entry.y2, entry.value)
    }
    return cloned
  }
}

export type { RectEntry, TreeNode } from './types.js'
