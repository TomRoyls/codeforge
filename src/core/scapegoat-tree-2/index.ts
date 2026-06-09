import type { ScapegoatNode, Comparator, ScapegoatTreeOptions } from './types.js'

export class ScapegoatTree<K, V = undefined> {
  private root: ScapegoatNode<K, V> | null = null
  private _size = 0
  private _maxSize = 0
  private alpha: number
  private compare: Comparator<K>

  constructor(options?: ScapegoatTreeOptions<K>) {
    this.alpha = options?.alpha ?? 0.667
    this.compare =
      options?.compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private nodeSize(node: ScapegoatNode<K, V> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: ScapegoatNode<K, V>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private flattenInto(node: ScapegoatNode<K, V> | null, result: ScapegoatNode<K, V>[]): void {
    if (node === null) return
    this.flattenInto(node.left, result)
    result.push(node)
    this.flattenInto(node.right, result)
  }

  private flatten(node: ScapegoatNode<K, V>): ScapegoatNode<K, V>[] {
    const result: ScapegoatNode<K, V>[] = []
    this.flattenInto(node, result)
    return result
  }

  private buildFrom(nodes: ScapegoatNode<K, V>[], lo: number, hi: number): ScapegoatNode<K, V> | null {
    if (lo > hi) return null
    const mid = (lo + hi) >> 1
    const node = nodes[mid]!
    node.left = this.buildFrom(nodes, lo, mid - 1)
    node.right = this.buildFrom(nodes, mid + 1, hi)
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
    return node
  }

  private rebuildSubtree(node: ScapegoatNode<K, V>): ScapegoatNode<K, V> | null {
    const nodes = this.flatten(node)
    return this.buildFrom(nodes, 0, nodes.length - 1)
  }

  private logAlpha(n: number): number {
    if (n <= 1) return 0
    return Math.floor(Math.log(n) / Math.log(1 / this.alpha))
  }

  insert(key: K, value?: V): void {
    const path: Array<{ node: ScapegoatNode<K, V>; dir: 0 | 1 }> = []
    let current = this.root

    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp === 0) {
        current.value = value
        return
      }
      if (cmp < 0) {
        path.push({ node: current, dir: 0 })
        current = current.left
      } else {
        path.push({ node: current, dir: 1 })
        current = current.right
      }
    }

    const newNode: ScapegoatNode<K, V> = { key, value, left: null, right: null, size: 1 }
    this._size++
    this._maxSize = Math.max(this._maxSize, this._size)

    if (path.length === 0) {
      this.root = newNode
      return
    }

    const last = path[path.length - 1]!
    if (last.dir === 0) {
      last.node.left = newNode
    } else {
      last.node.right = newNode
    }

    for (const entry of path) {
      entry.node.size++
    }

    if (path.length > this.logAlpha(this._size)) {
      let childSize = 1
      for (let i = path.length - 1; i >= 0; i--) {
        const { node, dir } = path[i]!
        const siblingSize = dir === 0
          ? this.nodeSize(node.right)
          : this.nodeSize(node.left)
        const totalSize = childSize + siblingSize + 1

        if (childSize > this.alpha * totalSize) {
          const rebuilt = this.rebuildSubtree(node)
          if (i === 0) {
            this.root = rebuilt
          } else {
            const parent = path[i - 1]!
            if (parent.dir === 0) {
              parent.node.left = rebuilt
            } else {
              parent.node.right = rebuilt
            }
            for (let j = i - 1; j >= 0; j--) {
              this.updateSize(path[j]!.node)
            }
          }
          return
        }
        childSize = totalSize
      }
    }
  }

  private findMinNode(node: ScapegoatNode<K, V>): ScapegoatNode<K, V> {
    while (node.left !== null) node = node.left
    return node
  }

  private deleteNode(node: ScapegoatNode<K, V> | null, key: K): ScapegoatNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
      this.updateSize(node)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
      this.updateSize(node)
      return node
    }
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    const successor = this.findMinNode(node.right)
    node.key = successor.key
    node.value = successor.value
    node.right = this.deleteNode(node.right, successor.key)
    this.updateSize(node)
    return node
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
    this._size--
    if (this._size === 0) {
      this._maxSize = 0
    } else if (this._size < this.alpha * this._maxSize) {
      this.root = this.rebuildSubtree(this.root!)
      this._maxSize = this._size
    }
    return true
  }

  has(key: K): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) current = current.left
      else if (cmp > 0) current = current.right
      else return true
    }
    return false
  }

  find(key: K): V | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) current = current.left
      else if (cmp > 0) current = current.right
      else return current.value
    }
    return undefined
  }

  get(key: K): V | undefined {
    return this.find(key)
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

  min(): K | undefined {
    if (this.root === null) return undefined
    return this.findMinNode(this.root).key
  }

  private findMaxNode(node: ScapegoatNode<K, V>): ScapegoatNode<K, V> {
    while (node.right !== null) node = node.right
    return node
  }

  max(): K | undefined {
    if (this.root === null) return undefined
    return this.findMaxNode(this.root).key
  }

  floor(key: K): K | undefined {
    let result: K | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.key, key)
      if (cmp <= 0) {
        result = current.key
        current = current.right
      } else {
        current = current.left
      }
    }
    return result
  }

  ceiling(key: K): K | undefined {
    let result: K | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.key, key)
      if (cmp >= 0) {
        result = current.key
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  lower(key: K): K | undefined {
    let result: K | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.key, key)
      if (cmp < 0) {
        result = current.key
        current = current.right
      } else {
        current = current.left
      }
    }
    return result
  }

  higher(key: K): K | undefined {
    let result: K | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.key, key)
      if (cmp > 0) {
        result = current.key
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  range(lo: K, hi: K): K[] {
    if (this.compare(lo, hi) > 0) return []
    const result: K[] = []
    this.rangeCollect(this.root, lo, hi, result)
    return result
  }

  private rangeCollect(
    node: ScapegoatNode<K, V> | null,
    lo: K,
    hi: K,
    result: K[],
  ): void {
    if (node === null) return
    const cmpLo = this.compare(node.key, lo)
    const cmpHi = this.compare(node.key, hi)
    if (cmpLo > 0) this.rangeCollect(node.left, lo, hi, result)
    if (cmpLo >= 0 && cmpHi <= 0) result.push(node.key)
    if (cmpHi < 0) this.rangeCollect(node.right, lo, hi, result)
  }

  rank(key: K): number {
    let r = 0
    let current = this.root
    while (current !== null) {
      const leftSize = this.nodeSize(current.left)
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        r += leftSize + 1
        current = current.right
      } else {
        return r + leftSize
      }
    }
    return -1
  }

  select(index: number): K | undefined {
    if (index < 0 || index >= this._size) return undefined
    let current = this.root
    let remaining = index
    while (current !== null) {
      const leftSize = this.nodeSize(current.left)
      if (remaining < leftSize) {
        current = current.left
      } else if (remaining === leftSize) {
        return current.key
      } else {
        remaining -= leftSize + 1
        current = current.right
      }
    }
    return undefined
  }

  keys(): K[] {
    return this.toArray()
  }

  values(): (V | undefined)[] {
    const result: (V | undefined)[] = []
    this.collectValues(this.root, result)
    return result
  }

  private collectValues(node: ScapegoatNode<K, V> | null, result: (V | undefined)[]): void {
    if (node === null) return
    this.collectValues(node.left, result)
    result.push(node.value)
    this.collectValues(node.right, result)
  }

  entries(): [K, V | undefined][] {
    const result: [K, V | undefined][] = []
    this.collectEntries(this.root, result)
    return result
  }

  private collectEntries(node: ScapegoatNode<K, V> | null, result: [K, V | undefined][]): void {
    if (node === null) return
    this.collectEntries(node.left, result)
    result.push([node.key, node.value])
    this.collectEntries(node.right, result)
  }

  toArray(): K[] {
    const result: K[] = []
    this.inOrder(this.root, result)
    return result
  }

  private inOrder(node: ScapegoatNode<K, V> | null, result: K[]): void {
    if (node === null) return
    this.inOrder(node.left, result)
    result.push(node.key)
    this.inOrder(node.right, result)
  }

  forEach(callback: (key: K, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<K> {
    const stack: Array<ScapegoatNode<K, V>> = []
    let current: ScapegoatNode<K, V> | null = this.root
    return {
      next: () => {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current)
            current = current.left
          }
          current = stack.pop()!
          const value = current.key
          current = current.right
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<K>
      },
    }
  }

  static from<K, V = undefined>(
    keys: K[],
    options?: ScapegoatTreeOptions<K> & { values?: V[] },
  ): ScapegoatTree<K, V> {
    const t = new ScapegoatTree<K, V>(options)
    const values = options && 'values' in options ? options.values : undefined
    for (let i = 0; i < keys.length; i++) {
      t.insert(keys[i]!, values?.[i])
    }
    return t
  }
}
