import type { ScapegoatMapOptions } from './types.js'
import { DEFAULT_SCAPEGOAT_MAP_OPTIONS } from './types.js'

interface ScapegoatNode<K, V> {
  key: K
  value: V
  left: ScapegoatNode<K, V> | null
  right: ScapegoatNode<K, V> | null
  size: number
}

export class ScapegoatMap<K = unknown, V = unknown> {
  private root: ScapegoatNode<K, V> | null = null
  private _size: number = 0
  private _maxSize: number = 0
  private _alpha: number
  private _comparator: (a: K, b: K) => number

  constructor(options?: ScapegoatMapOptions<K>) {
    const opts = { ...DEFAULT_SCAPEGOAT_MAP_OPTIONS, ...options }
    this._alpha = opts.alpha
    this._comparator = opts.comparator
  }

  get alpha(): number {
    return this._alpha
  }

  private nodeSize(node: ScapegoatNode<K, V> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: ScapegoatNode<K, V>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private isUnbalanced(node: ScapegoatNode<K, V>): boolean {
    const leftSize = this.nodeSize(node.left)
    const rightSize = this.nodeSize(node.right)
    const total = node.size
    return leftSize > this._alpha * total || rightSize > this._alpha * total
  }

  private flatten(node: ScapegoatNode<K, V> | null): Array<ScapegoatNode<K, V>> {
    const result: Array<ScapegoatNode<K, V>> = []
    const stack: Array<ScapegoatNode<K, V>> = []
    let current = node
    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      result.push(current)
      current = current.right
    }
    return result
  }

  private buildBalanced(nodes: Array<ScapegoatNode<K, V>>, start: number, end: number): ScapegoatNode<K, V> | null {
    if (start > end) return null
    const mid = (start + end) >> 1
    const node = nodes[mid]!
    node.left = this.buildBalanced(nodes, start, mid - 1)
    node.right = this.buildBalanced(nodes, mid + 1, end)
    this.updateSize(node)
    return node
  }

  private rebuildSubtree(node: ScapegoatNode<K, V>): ScapegoatNode<K, V> {
    const nodes = this.flatten(node)
    if (nodes.length === 0) return node
    return this.buildBalanced(nodes, 0, nodes.length - 1)!
  }

  private insertNode(
    node: ScapegoatNode<K, V> | null,
    key: K,
    value: V,
    path: Array<ScapegoatNode<K, V>>,
  ): { node: ScapegoatNode<K, V>; found: boolean } {
    if (node === null) {
      return { node: { key, value, left: null, right: null, size: 1 }, found: false }
    }

    path.push(node)
    const cmp = this._comparator(key, node.key)

    if (cmp < 0) {
      const result = this.insertNode(node.left, key, value, path)
      node.left = result.node
      this.updateSize(node)
      return { node, found: result.found }
    } else if (cmp > 0) {
      const result = this.insertNode(node.right, key, value, path)
      node.right = result.node
      this.updateSize(node)
      return { node, found: result.found }
    } else {
      node.value = value
      return { node, found: true }
    }
  }

  set(key: K, value: V): void {
    const path: Array<ScapegoatNode<K, V>> = []
    const result = this.insertNode(this.root, key, value, path)

    if (!result.found) {
      this._size++
    }
    if (this._size > this._maxSize) {
      this._maxSize = this._size
    }

    this.root = result.node

    let scapegoat: ScapegoatNode<K, V> | null = null
    let scapegoatParent: ScapegoatNode<K, V> | null = null
    let scapegoatDirection: 'left' | 'right' | null = null

    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i]!
      if (this.isUnbalanced(node)) {
        scapegoat = node
        if (i > 0) {
          scapegoatParent = path[i - 1]!
          scapegoatDirection = scapegoatParent.left === node ? 'left' : 'right'
        }
        break
      }
    }

    if (scapegoat !== null) {
      const rebuilt = this.rebuildSubtree(scapegoat)
      if (scapegoatParent === null) {
        this.root = rebuilt
      } else if (scapegoatDirection === 'left') {
        scapegoatParent.left = rebuilt
      } else {
        scapegoatParent.right = rebuilt
      }
    }
  }

  get(key: K): V | undefined {
    let node = this.root
    while (node !== null) {
      const cmp = this._comparator(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        node = node.right
      } else {
        return node.value
      }
    }
    return undefined
  }

  has(key: K): boolean {
    let node = this.root
    while (node !== null) {
      const cmp = this._comparator(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        node = node.right
      } else {
        return true
      }
    }
    return false
  }

  private deleteNode(
    node: ScapegoatNode<K, V> | null,
    key: K,
  ): { node: ScapegoatNode<K, V> | null; found: boolean } {
    if (node === null) {
      return { node: null, found: false }
    }

    const cmp = this._comparator(key, node.key)

    if (cmp < 0) {
      const result = this.deleteNode(node.left, key)
      node.left = result.node
      if (node.left !== null || result.found) {
        this.updateSize(node)
      }
      return { node, found: result.found }
    } else if (cmp > 0) {
      const result = this.deleteNode(node.right, key)
      node.right = result.node
      if (node.right !== null || result.found) {
        this.updateSize(node)
      }
      return { node, found: result.found }
    } else {
      if (node.left === null) {
        return { node: node.right, found: true }
      }
      if (node.right === null) {
        return { node: node.left, found: true }
      }

      let successor = node.right
      while (successor.left !== null) {
        successor = successor.left
      }
      node.key = successor.key
      node.value = successor.value
      const result = this.deleteNode(node.right, successor.key)
      node.right = result.node
      this.updateSize(node)
      return { node, found: true }
    }
  }

  delete(key: K): boolean {
    const result = this.deleteNode(this.root, key)
    this.root = result.node
    if (result.found) {
      this._size--
      if (
        this.root !== null &&
        this._maxSize > 0 &&
        this._size < this._maxSize * this._alpha
      ) {
        this.root = this.rebuildSubtree(this.root)
        this._maxSize = this._size
      }
    }
    return result.found
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
    this._maxSize = 0
  }

  min(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return node.key
  }

  max(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.key
  }

  private inorderTraversal(node: ScapegoatNode<K, V> | null, result: Array<[K, V]>): void {
    if (node === null) return
    this.inorderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inorderTraversal(node.right, result)
  }

  toArray(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    this.inorderTraversal(this.root, result)
    return result
  }

  keys(): K[] {
    const result: K[] = []
    const stack: Array<ScapegoatNode<K, V>> = []
    let current = this.root
    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      result.push(current.key)
      current = current.right
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    const stack: Array<ScapegoatNode<K, V>> = []
    let current = this.root
    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      result.push(current.value)
      current = current.right
    }
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    const stack: Array<ScapegoatNode<K, V>> = []
    let current = this.root
    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      callback(current.value, current.key)
      current = current.right
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    const stack: Array<ScapegoatNode<K, V>> = []
    let current = this.root
    while (stack.length > 0 || current !== null) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield [current.key, current.value]
      current = current.right
    }
  }

  private computeHeight(node: ScapegoatNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  height(): number {
    return this.computeHeight(this.root)
  }

  clone(): ScapegoatMap<K, V> {
    const cloned = new ScapegoatMap<K, V>({
      alpha: this._alpha,
      comparator: this._comparator,
    })

    const cloneNode = (node: ScapegoatNode<K, V> | null): ScapegoatNode<K, V> | null => {
      if (node === null) return null
      const newNode: ScapegoatNode<K, V> = {
        key: node.key,
        value: node.value,
        left: cloneNode(node.left),
        right: cloneNode(node.right),
        size: node.size,
      }
      return newNode
    }

    cloned.root = cloneNode(this.root)
    cloned._size = this._size
    cloned._maxSize = this._maxSize
    return cloned
  }


  toString(): string {
    return `ScapegoatMap({ size: ${this._size} })`
  }
}

export type { ScapegoatMapOptions }
