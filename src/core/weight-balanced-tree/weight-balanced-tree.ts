import type { WBNode, CompareFunction, WeightBalancedTreeOptions, WeightBalancedTreeStats } from './types.js'
import { DEFAULT_WBT_OPTIONS } from './types.js'

export class WeightBalancedTree<K = number> {
  private root: WBNode<K> | null = null
  private _size: number = 0
  private compare: CompareFunction<K>
  private delta: number
  private gamma: number

  constructor(options?: Partial<WeightBalancedTreeOptions<K>>)
  constructor(compare?: CompareFunction<K>)
  constructor(arg?: Partial<WeightBalancedTreeOptions<K>> | CompareFunction<K>) {
    if (typeof arg === 'function') {
      this.compare = arg
      this.delta = DEFAULT_WBT_OPTIONS.delta as number
      this.gamma = DEFAULT_WBT_OPTIONS.gamma as number
    } else if (arg !== undefined) {
      const opts = { ...DEFAULT_WBT_OPTIONS, ...arg }
      this.compare = opts.compare as CompareFunction<K>
      this.delta = opts.delta
      this.gamma = opts.gamma
    } else {
      this.compare = DEFAULT_WBT_OPTIONS.compare as CompareFunction<K>
      this.delta = DEFAULT_WBT_OPTIONS.delta as number
      this.gamma = DEFAULT_WBT_OPTIONS.gamma as number
    }
  }

  private nodeSize(node: WBNode<K> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: WBNode<K>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private rotateLeft(x: WBNode<K>): WBNode<K> {
    const y = x.right!
    x.right = y.left
    y.left = x
    this.updateSize(x)
    this.updateSize(y)
    return y
  }

  private rotateRight(y: WBNode<K>): WBNode<K> {
    const x = y.left!
    y.left = x.right
    x.right = y
    this.updateSize(y)
    this.updateSize(x)
    return x
  }

  private singleLeft(x: WBNode<K>): WBNode<K> {
    return this.rotateLeft(x)
  }

  private doubleLeft(x: WBNode<K>): WBNode<K> {
    x.right = this.rotateRight(x.right!)
    return this.rotateLeft(x)
  }

  private singleRight(x: WBNode<K>): WBNode<K> {
    return this.rotateRight(x)
  }

  private doubleRight(x: WBNode<K>): WBNode<K> {
    x.left = this.rotateLeft(x.left!)
    return this.rotateRight(x)
  }

  private balance(node: WBNode<K>): WBNode<K> {
    this.updateSize(node)
    const lSize = this.nodeSize(node.left)
    const rSize = this.nodeSize(node.right)

    if (lSize + rSize <= 1) {
      return node
    }

    if (rSize > this.delta * lSize) {
      const rlSize = this.nodeSize(node.right!.left)
      const rrSize = this.nodeSize(node.right!.right)
      if (rlSize < this.gamma * rrSize) {
        return this.singleLeft(node)
      }
      return this.doubleLeft(node)
    }

    if (lSize > this.delta * rSize) {
      const llSize = this.nodeSize(node.left!.left)
      const lrSize = this.nodeSize(node.left!.right)
      if (lrSize < this.gamma * llSize) {
        return this.singleRight(node)
      }
      return this.doubleRight(node)
    }

    return node
  }

  insert(key: K): boolean {
    const sizeBefore = this._size
    this.root = this.insertRec(this.root, key)
    this._size = this.nodeSize(this.root)
    return this._size > sizeBefore
  }

  private insertRec(node: WBNode<K> | null, key: K): WBNode<K> {
    if (node === null) {
      return { key, left: null, right: null, size: 1 }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertRec(node.left, key)
    } else if (cmp > 0) {
      node.right = this.insertRec(node.right, key)
    } else {
      return node
    }
    return this.balance(node)
  }

  delete(key: K): boolean {
    const sizeBefore = this._size
    this.root = this.deleteRec(this.root, key)
    this._size = this.nodeSize(this.root)
    return this._size < sizeBefore
  }

  private deleteRec(node: WBNode<K> | null, key: K): WBNode<K> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteRec(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteRec(node.right, key)
    } else {
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      const successor = this.findMinNode(node.right)
      node.key = successor.key
      node.right = this.deleteMin(node.right)
    }
    return this.balance(node)
  }

  private findMinNode(node: WBNode<K>): WBNode<K> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private deleteMin(node: WBNode<K>): WBNode<K> | null {
    if (node.left === null) {
      return node.right
    }
    node.left = this.deleteMin(node.left)
    return this.balance(node)
  }

  search(key: K): K | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current.key
      }
    }
    return undefined
  }

  contains(key: K): boolean {
    return this.search(key) !== undefined
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

  successor(key: K): K | undefined {
    let result: K | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        result = current.key
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  predecessor(key: K): K | undefined {
    let result: K | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp > 0) {
        result = current.key
        current = current.right
      } else {
        current = current.left
      }
    }
    return result
  }

  range(lo: K, hi: K): K[] {
    if (this.compare(lo, hi) > 0) return []
    const result: K[] = []
    this.rangeRec(this.root, lo, hi, result)
    return result
  }

  private rangeRec(node: WBNode<K> | null, lo: K, hi: K, result: K[]): void {
    if (node === null) return
    const cmpLo = this.compare(node.key, lo)
    const cmpHi = this.compare(node.key, hi)
    if (cmpLo > 0) {
      this.rangeRec(node.left, lo, hi, result)
    }
    if (cmpLo >= 0 && cmpHi <= 0) {
      result.push(node.key)
    }
    if (cmpHi < 0) {
      this.rangeRec(node.right, lo, hi, result)
    }
  }

  forEach(callback: (key: K, index: number) => void): void {
    let index = 0
    this.forEachRec(this.root, callback, () => index++)
  }

  private forEachRec(node: WBNode<K> | null, callback: (key: K, index: number) => void, nextIndex: () => number): void {
    if (node === null) return
    this.forEachRec(node.left, callback, nextIndex)
    callback(node.key, nextIndex())
    this.forEachRec(node.right, callback, nextIndex)
  }

  toArray(): K[] {
    const result: K[] = []
    this.inOrderRec(this.root, result)
    return result
  }

  private inOrderRec(node: WBNode<K> | null, result: K[]): void {
    if (node === null) return
    this.inOrderRec(node.left, result)
    result.push(node.key)
    this.inOrderRec(node.right, result)
  }

  size(): number {
    return this._size
  }

  height(): number {
    return this.heightRec(this.root)
  }

  private heightRec(node: WBNode<K> | null): number {
    if (node === null) return -1
    return 1 + Math.max(this.heightRec(node.left), this.heightRec(node.right))
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  clone(): WeightBalancedTree<K> {
    const tree = new WeightBalancedTree<K>({
      compare: this.compare,
      delta: this.delta,
      gamma: this.gamma,
    })
    tree.root = this.cloneRec(this.root)
    tree._size = this._size
    return tree
  }

  private cloneRec(node: WBNode<K> | null): WBNode<K> | null {
    if (node === null) return null
    return {
      key: node.key,
      left: this.cloneRec(node.left),
      right: this.cloneRec(node.right),
      size: node.size,
    }
  }

  static from<K>(keys: K[], options?: Partial<WeightBalancedTreeOptions<K>>): WeightBalancedTree<K> {
    const tree = new WeightBalancedTree<K>(options)
    for (const key of keys) {
      tree.insert(key)
    }
    return tree
  }

  stats(): WeightBalancedTreeStats {
    const h = this.height()
    const s = this._size
    const minHeight = s === 0 ? -1 : Math.floor(Math.log2(s))
    const idealHeight = s === 0 ? -1 : Math.ceil(Math.log2(s + 1)) - 1
    return {
      size: s,
      height: h,
      minHeight,
      isBalanced: h <= 0 || h <= 1.5 * idealHeight,
      idealHeight,
    }
  }
}

export { DEFAULT_WBT_OPTIONS } from './types.js'
export type { WBNode, CompareFunction, WeightBalancedTreeOptions, WeightBalancedTreeStats } from './types.js'
