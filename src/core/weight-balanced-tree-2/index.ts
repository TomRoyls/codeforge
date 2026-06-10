import type { WBTNode, CompareFunction, WeightBalancedTreeOptions } from './types.js'

const DELTA = 3

export class WeightBalancedTree<K, V = unknown> {
  private root: WBTNode<K, V> | null = null
  private compare: CompareFunction<K>

  constructor(options?: WeightBalancedTreeOptions<K>) {
    this.compare =
      options?.compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private sz(node: WBTNode<K, V> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: WBTNode<K, V>): void {
    node.size = 1 + this.sz(node.left) + this.sz(node.right)
  }

  private rotateLeft(x: WBTNode<K, V>): WBTNode<K, V> {
    const y = x.right!
    x.right = y.left
    y.left = x
    this.updateSize(x)
    this.updateSize(y)
    return y
  }

  private rotateRight(y: WBTNode<K, V>): WBTNode<K, V> {
    const x = y.left!
    y.left = x.right
    x.right = y
    this.updateSize(y)
    this.updateSize(x)
    return x
  }

  private singleLeft(x: WBTNode<K, V>): WBTNode<K, V> {
    return this.rotateLeft(x)
  }

  private doubleLeft(x: WBTNode<K, V>): WBTNode<K, V> {
    x.right = this.rotateRight(x.right!)
    return this.rotateLeft(x)
  }

  private singleRight(y: WBTNode<K, V>): WBTNode<K, V> {
    return this.rotateRight(y)
  }

  private doubleRight(y: WBTNode<K, V>): WBTNode<K, V> {
    y.left = this.rotateLeft(y.left!)
    return this.rotateRight(y)
  }

  private balance(node: WBTNode<K, V>): WBTNode<K, V> {
    const ls = this.sz(node.left)
    const rs = this.sz(node.right)
    if (ls + rs < 2) {
      return node
    }
    if (rs > DELTA * ls) {
      if (this.sz(node.right!.left) >= this.sz(node.right!.right)) {
        return this.doubleLeft(node)
      }
      return this.singleLeft(node)
    }
    if (ls > DELTA * rs) {
      if (this.sz(node.left!.right) >= this.sz(node.left!.left)) {
        return this.doubleRight(node)
      }
      return this.singleRight(node)
    }
    return node
  }

  private insertNode(
    node: WBTNode<K, V> | null,
    key: K,
    value: V | undefined,
  ): WBTNode<K, V> {
    if (node === null) {
      return { key, value, left: null, right: null, size: 1 }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
    } else {
      node.value = value
      return node
    }
    this.updateSize(node)
    return this.balance(node)
  }

  insert(key: K, value?: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private minNode(node: WBTNode<K, V>): WBTNode<K, V> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private deleteNode(
    node: WBTNode<K, V> | null,
    key: K,
  ): WBTNode<K, V> | null {
    if (node === null) {
      return null
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      if (node.left === null) {
        return node.right
      }
      if (node.right === null) {
        return node.left
      }
      const succ = this.minNode(node.right)
      node.key = succ.key
      node.value = succ.value
      node.right = this.deleteNode(node.right, succ.key)
    }
    this.updateSize(node)
    return this.balance(node)
  }

  delete(key: K): boolean {
    if (!this.has(key)) {
      return false
    }
    this.root = this.deleteNode(this.root, key)
    return true
  }

  has(key: K): boolean {
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
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

  get(key: K): V | undefined {
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
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

  get size(): number {
    return this.sz(this.root)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
  }

  min(): K | undefined {
    if (this.root === null) {
      return undefined
    }
    return this.minNode(this.root).key
  }

  private maxNode(node: WBTNode<K, V>): WBTNode<K, V> {
    while (node.right !== null) {
      node = node.right
    }
    return node
  }

  max(): K | undefined {
    if (this.root === null) {
      return undefined
    }
    return this.maxNode(this.root).key
  }

  floor(key: K): K | undefined {
    let node = this.root
    let result: K | undefined
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp === 0) {
        return node.key
      }
      if (cmp > 0) {
        result = node.key
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  ceiling(key: K): K | undefined {
    let node = this.root
    let result: K | undefined
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp === 0) {
        return node.key
      }
      if (cmp < 0) {
        result = node.key
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  lower(key: K): K | undefined {
    let node = this.root
    let result: K | undefined
    while (node !== null) {
      if (this.compare(node.key, key) < 0) {
        result = node.key
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  higher(key: K): K | undefined {
    let node = this.root
    let result: K | undefined
    while (node !== null) {
      if (this.compare(node.key, key) > 0) {
        result = node.key
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  range(lo: K, hi: K): K[] {
    const result: K[] = []
    this.rangeCollect(this.root, lo, hi, result)
    return result
  }

  private rangeCollect(
    node: WBTNode<K, V> | null,
    lo: K,
    hi: K,
    result: K[],
  ): void {
    if (node === null) {
      return
    }
    const cmpLo = this.compare(node.key, lo)
    const cmpHi = this.compare(node.key, hi)
    if (cmpLo > 0) {
      this.rangeCollect(node.left, lo, hi, result)
    }
    if (cmpLo >= 0 && cmpHi <= 0) {
      result.push(node.key)
    }
    if (cmpHi < 0) {
      this.rangeCollect(node.right, lo, hi, result)
    }
  }

  toArray(): K[] {
    const result: K[] = []
    this.inorderKeys(this.root, result)
    return result
  }

  private inorderKeys(node: WBTNode<K, V> | null, result: K[]): void {
    if (node === null) {
      return
    }
    this.inorderKeys(node.left, result)
    result.push(node.key)
    this.inorderKeys(node.right, result)
  }

  forEach(callback: (key: K, value: V | undefined, index: number) => void): void {
    let idx = 0
    const traverse = (node: WBTNode<K, V> | null) => {
      if (node === null) {
        return
      }
      traverse(node.left)
      callback(node.key, node.value, idx++)
      traverse(node.right)
    }
    traverse(this.root)
  }

  [Symbol.iterator](): Iterator<[K, V | undefined]> {
    const stack: WBTNode<K, V>[] = []
    let current: WBTNode<K, V> | null = this.root
    return {
      next: (): IteratorResult<[K, V | undefined]> => {
        while (current !== null) {
          stack.push(current)
          current = current.left
        }
        if (stack.length === 0) {
          return { done: true, value: undefined }
        }
        const node = stack.pop()!
        current = node.right
        return { done: false, value: [node.key, node.value] }
      },
    }
  }

  rank(key: K): number {
    let rank = 0
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        rank += 1 + this.sz(node.left)
        node = node.right
      } else {
        return rank + this.sz(node.left)
      }
    }
    return -1
  }

  select(i: number): K | undefined {
    if (i < 0 || i >= this.size) {
      return undefined
    }
    let node = this.root
    while (node !== null) {
      const ls = this.sz(node.left)
      if (i < ls) {
        node = node.left
      } else if (i === ls) {
        return node.key
      } else {
        i -= ls + 1
        node = node.right
      }
    }
    return undefined
  }

  count(lo: K, hi: K): number {
    const rankLo = this.rank(lo)
    const rankHi = this.rank(hi)
    if (rankLo === -1 || rankHi === -1) {
      let cnt = 0
      this.forEachNode(this.root, (key) => {
        if (
          this.compare(key, lo) >= 0 &&
          this.compare(key, hi) <= 0
        ) {
          cnt++
        }
      })
      return cnt
    }
    return rankHi - rankLo + (this.has(hi) ? 1 : 0)
  }

  private forEachNode(
    node: WBTNode<K, V> | null,
    cb: (key: K) => void,
  ): void {
    if (node === null) {
      return
    }
    this.forEachNode(node.left, cb)
    cb(node.key)
    this.forEachNode(node.right, cb)
  }

  toJSON() {
    return { type: 'WeightBalancedTree', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `WeightBalancedTree({ size: ${this.size} })`
  }

  drain(): K[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  get [Symbol.toStringTag](): string {
    return 'WeightBalancedTree'
  }
}
