import type {
  ScapegoatNode,
  CompareFunction,
  ScapegoatTreeMapOptions,
  ScapegoatTreeMapStats,
} from './types.js'

export class ScapegoatTreeMap<K, V> {
  private root: ScapegoatNode<K, V> | null = null
  private _size: number = 0
  private _maxSize: number = 0
  private _alpha: number
  private _rebalanceCount: number = 0
  private _rebuildCount: number = 0
  private compare: CompareFunction<K>

  constructor(options?: ScapegoatTreeMapOptions<K>) {
    this.compare =
      options?.compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
    this._alpha = options?.alpha ?? 0.667
    if (this._alpha < 0.5) this._alpha = 0.5
    if (this._alpha > 1.0) this._alpha = 1.0
  }

  private nodeSize(node: ScapegoatNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private flatten(
    node: ScapegoatNode<K, V> | null,
    result: ScapegoatNode<K, V>[],
  ): void {
    if (node === null) return
    this.flatten(node.left, result)
    result.push(node)
    this.flatten(node.right, result)
  }

  private buildBalanced(
    nodes: ScapegoatNode<K, V>[],
    start: number,
    end: number,
  ): ScapegoatNode<K, V> | null {
    if (start > end) return null
    const mid = (start + end) >> 1
    const node = nodes[mid]!
    node.left = this.buildBalanced(nodes, start, mid - 1)
    node.right = this.buildBalanced(nodes, mid + 1, end)
    return node
  }

  private rebuildSubtree(
    node: ScapegoatNode<K, V>,
  ): ScapegoatNode<K, V> {
    const nodes: ScapegoatNode<K, V>[] = []
    this.flatten(node, nodes)
    return this.buildBalanced(nodes, 0, nodes.length - 1)!
  }

  private insertWithPath(
    node: ScapegoatNode<K, V> | null,
    key: K,
    value: V,
    path: ScapegoatNode<K, V>[],
    dirs: number[],
  ): ScapegoatNode<K, V> {
    if (node === null) {
      this._size++
      this._maxSize = Math.max(this._maxSize, this._size)
      return { key, value, left: null, right: null }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      path.push(node)
      dirs.push(-1)
      node.left = this.insertWithPath(node.left, key, value, path, dirs)
    } else if (cmp > 0) {
      path.push(node)
      dirs.push(1)
      node.right = this.insertWithPath(node.right, key, value, path, dirs)
    } else {
      node.value = value
      return node
    }
    return node
  }

  set(key: K, value: V): void {
    const path: ScapegoatNode<K, V>[] = []
    const dirs: number[] = []
    this.root = this.insertWithPath(this.root, key, value, path, dirs)
    if (path.length === 0) return

    const depth = path.length + 1
    const hAlpha =
      depth > 0 ? Math.floor(Math.log(depth) / Math.log(1 / this._alpha)) : 0

    if (depth > 1 && depth > hAlpha) {
      let scapegoatIdx = -1
      for (let i = path.length - 1; i >= 0; i--) {
        const parent = path[i]!
        const leftSz = this.nodeSize(parent.left)
        const rightSz = this.nodeSize(parent.right)
        const totalSz = leftSz + rightSz + 1
        if (
          leftSz > this._alpha * totalSz ||
          rightSz > this._alpha * totalSz
        ) {
          scapegoatIdx = i
          break
        }
      }

      if (scapegoatIdx >= 0) {
        this._rebalanceCount++
        const scapegoat = path[scapegoatIdx]!
        const rebuilt = this.rebuildSubtree(scapegoat)

        if (scapegoatIdx === 0) {
          this.root = rebuilt
        } else {
          const parent = path[scapegoatIdx - 1]!
          const dir = dirs[scapegoatIdx - 1]!
          if (dir < 0) {
            parent.left = rebuilt
          } else {
            parent.right = rebuilt
          }
        }
      }
    }
  }

  get(key: K): V | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current.value
      }
    }
    return undefined
  }

  has(key: K): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return true
      }
    }
    return false
  }

  private deleteNode(
    node: ScapegoatNode<K, V> | null,
    key: K,
  ): ScapegoatNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
      return node
    }
    this._size--
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    const successor = this.findMinNode(node.right)
    node.key = successor.key
    node.value = successor.value
    this._size++
    node.right = this.deleteNode(node.right, successor.key)
    return node
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)

    if (
      this._size < this._alpha * this._maxSize &&
      this._size > 0
    ) {
      this._rebuildCount++
      const nodes: ScapegoatNode<K, V>[] = []
      this.flatten(this.root, nodes)
      this.root = this.buildBalanced(nodes, 0, nodes.length - 1)
      this._maxSize = this._size
    }

    return true
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
    this._maxSize = 0
  }

  private findMinNode(node: ScapegoatNode<K, V>): ScapegoatNode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    return [node.key, node.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    return [current.key, current.value]
  }

  private inOrderTraversal(
    node: ScapegoatNode<K, V> | null,
    result: [K, V][],
  ): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inOrderTraversal(node.right, result)
  }

  forEach(callback: (value: V, key: K) => void): void {
    const entries = this.entries()
    for (const [key, value] of entries) {
      callback(value, key)
    }
  }

  keys(): K[] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result.map(([k]) => k)
  }

  values(): V[] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result.map(([, v]) => v)
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  clone(): ScapegoatTreeMap<K, V> {
    const result = new ScapegoatTreeMap<K, V>({
      compare: this.compare,
      alpha: this._alpha,
    })
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      result.set(key, value)
    }
    return result
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const allEntries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < allEntries.length) {
          const value = allEntries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<[K, V]>
      },
    }
  }

  lowerBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp >= 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp > 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  private rangeTraversal(
    node: ScapegoatNode<K, V> | null,
    start: K,
    end: K,
    result: [K, V][],
  ): void {
    if (node === null) return
    const cmpStart = this.compare(node.key, start)
    const cmpEnd = this.compare(node.key, end)
    if (cmpStart > 0) {
      this.rangeTraversal(node.left, start, end, result)
    }
    if (cmpStart >= 0 && cmpEnd <= 0) {
      result.push([node.key, node.value])
    }
    if (cmpEnd < 0) {
      this.rangeTraversal(node.right, start, end, result)
    }
  }

  range(start: K, end: K): [K, V][] {
    if (this.compare(start, end) > 0) return []
    const result: [K, V][] = []
    this.rangeTraversal(this.root, start, end, result)
    return result
  }

  private computeHeight(node: ScapegoatNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  getHeight(): number {
    return this.computeHeight(this.root)
  }

  stats(): ScapegoatTreeMapStats {
    return {
      size: this._size,
      height: this.getHeight(),
      alpha: this._alpha,
      maxSize: this._maxSize,
      rebalanceCount: this._rebalanceCount,
      rebuildCount: this._rebuildCount,
    }
  }

  static from<K, V>(
    entries: [K, V][],
    options?: ScapegoatTreeMapOptions<K>,
  ): ScapegoatTreeMap<K, V> {
    const map = new ScapegoatTreeMap<K, V>(options)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }
}

export type {
  ScapegoatNode,
  CompareFunction,
  ScapegoatTreeMapOptions,
  ScapegoatTreeMapStats,
} from './types.js'
