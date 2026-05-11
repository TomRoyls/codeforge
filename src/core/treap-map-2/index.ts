import type { TreapMap2Options } from './types.js'

export type { TreapMap2Options } from './types.js'

class TreapMapNode<K, V> {
  key: K
  value: V
  priority: number
  left: TreapMapNode<K, V> | null = null
  right: TreapMapNode<K, V> | null = null
  size: number = 1

  constructor(key: K, value: V, priority: number) {
    this.key = key
    this.value = value
    this.priority = priority
  }
}

function updateSize<K, V>(node: TreapMapNode<K, V>): void {
  node.size = 1 + (node.left?.size ?? 0) + (node.right?.size ?? 0)
}

export class TreapMap2<K, V> {
  private root: TreapMapNode<K, V> | null = null
  private _size: number = 0
  private compare: (a: K, b: K) => number

  constructor(options?: TreapMap2Options<K>) {
    this.compare =
      options?.comparator ??
      ((a: K, b: K) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  private randomPriority(): number {
    return Math.floor(Math.random() * 2147483647)
  }

  private rotateRight(node: TreapMapNode<K, V>): TreapMapNode<K, V> {
    const left = node.left!
    node.left = left.right
    left.right = node
    updateSize(node)
    updateSize(left)
    return left
  }

  private rotateLeft(node: TreapMapNode<K, V>): TreapMapNode<K, V> {
    const right = node.right!
    node.right = right.left
    right.left = node
    updateSize(node)
    updateSize(right)
    return right
  }

  private insertNode(
    node: TreapMapNode<K, V> | null,
    key: K,
    value: V,
    priority: number,
  ): TreapMapNode<K, V> {
    if (node === null) {
      return new TreapMapNode(key, value, priority)
    }
    const cmp = this.compare(key, node.key)
    if (cmp === 0) {
      node.value = value
      return node
    }
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value, priority)
      if (node.left!.priority > node.priority) {
        node = this.rotateRight(node)
      }
    } else {
      node.right = this.insertNode(node.right, key, value, priority)
      if (node.right!.priority > node.priority) {
        node = this.rotateLeft(node)
      }
    }
    updateSize(node)
    return node
  }

  set(key: K, value: V): void {
    const before = this._size
    this.root = this.insertNode(this.root, key, value, this.randomPriority())
    if (this.root) {
      this._size = this.root.size
    }
    void before
  }

  insert(key: K, value: V): void {
    this.set(key, value)
  }

  get(key: K): V | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp === 0) return current.value
      current = cmp < 0 ? current.left : current.right
    }
    return undefined
  }

  has(key: K): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp === 0) return true
      current = cmp < 0 ? current.left : current.right
    }
    return false
  }

  private deleteNode(
    node: TreapMapNode<K, V> | null,
    key: K,
  ): TreapMapNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
      if (node) updateSize(node)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
      if (node) updateSize(node)
      return node
    }
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    if (node.left.priority > node.right.priority) {
      node = this.rotateRight(node)
      node.right = this.deleteNode(node.right, key)
    } else {
      node = this.rotateLeft(node)
      node.left = this.deleteNode(node.left, key)
    }
    updateSize(node)
    return node
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
    this._size = this.root?.size ?? 0
    return true
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  clone(): TreapMap2<K, V> {
    const cloned = new TreapMap2<K, V>({ comparator: this.compare })
    cloned.root = this.cloneNode(this.root)
    cloned._size = this._size
    return cloned
  }

  private cloneNode(
    node: TreapMapNode<K, V> | null,
  ): TreapMapNode<K, V> | null {
    if (node === null) return null
    const copy = new TreapMapNode(node.key, node.value, node.priority)
    copy.size = node.size
    copy.left = this.cloneNode(node.left)
    copy.right = this.cloneNode(node.right)
    return copy
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.left !== null) {
      current = current.left
    }
    return [current.key, current.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    return [current.key, current.value]
  }

  private inOrder(
    node: TreapMapNode<K, V> | null,
    result: [K, V][],
  ): void {
    if (node === null) return
    this.inOrder(node.left, result)
    result.push([node.key, node.value])
    this.inOrder(node.right, result)
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.inOrderForEach(this.root, callback)
  }

  private inOrderForEach(
    node: TreapMapNode<K, V> | null,
    callback: (value: V, key: K) => void,
  ): void {
    if (node === null) return
    this.inOrderForEach(node.left, callback)
    callback(node.value, node.key)
    this.inOrderForEach(node.right, callback)
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    yield* this.inOrderGenerator(this.root)
  }

  private *inOrderGenerator(
    node: TreapMapNode<K, V> | null,
  ): Generator<[K, V]> {
    if (node === null) return
    yield* this.inOrderGenerator(node.left)
    yield [node.key, node.value]
    yield* this.inOrderGenerator(node.right)
  }

  keys(): K[] {
    const result: [K, V][] = []
    this.inOrder(this.root, result)
    return result.map(([k]) => k)
  }

  values(): V[] {
    const result: [K, V][] = []
    this.inOrder(this.root, result)
    return result.map(([, v]) => v)
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    this.inOrder(this.root, result)
    return result
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  toArraySorted(): [K, V][] {
    return this.entries()
  }

  lowerBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.key, key)
      if (cmp >= 0) {
        result = [current.key, current.value]
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  upperBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.key, key)
      if (cmp > 0) {
        result = [current.key, current.value]
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  predecessor(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.key, key)
      if (cmp < 0) {
        result = [current.key, current.value]
        current = current.right
      } else {
        current = current.left
      }
    }
    return result
  }

  successor(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.key, key)
      if (cmp > 0) {
        result = [current.key, current.value]
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  rank(key: K): number {
    return this.rankNode(this.root, key)
  }

  private rankNode(node: TreapMapNode<K, V> | null, key: K): number {
    if (node === null) return 0
    const cmp = this.compare(key, node.key)
    if (cmp === 0) {
      return node.left?.size ?? 0
    }
    if (cmp < 0) {
      return this.rankNode(node.left, key)
    }
    return (node.left?.size ?? 0) + 1 + this.rankNode(node.right, key)
  }

  select(k: number): [K, V] | undefined {
    if (k < 0 || k >= this._size) return undefined
    return this.selectNode(this.root!, k)
  }

  private selectNode(node: TreapMapNode<K, V>, k: number): [K, V] {
    const leftSize = node.left?.size ?? 0
    if (k < leftSize) {
      return this.selectNode(node.left!, k)
    }
    if (k === leftSize) {
      return [node.key, node.value]
    }
    return this.selectNode(node.right!, k - leftSize - 1)
  }

  split(key: K): [TreapMap2<K, V>, TreapMap2<K, V>] {
    const leftMap = new TreapMap2<K, V>({ comparator: this.compare })
    const rightMap = new TreapMap2<K, V>({ comparator: this.compare })
    const cloned = this.cloneNode(this.root)
    const [leftRoot, rightRoot] = this.splitNode(cloned, key)
    leftMap.root = leftRoot
    rightMap.root = rightRoot
    leftMap._size = leftRoot?.size ?? 0
    rightMap._size = rightRoot?.size ?? 0
    return [leftMap, rightMap]
  }

  private splitNode(
    node: TreapMapNode<K, V> | null,
    key: K,
  ): [TreapMapNode<K, V> | null, TreapMapNode<K, V> | null] {
    if (node === null) return [null, null]
    const cmp = this.compare(key, node.key)
    if (cmp <= 0) {
      const [left, right] = this.splitNode(node.left, key)
      node.left = right
      if (node) updateSize(node)
      return [left, node]
    }
    const [left, right] = this.splitNode(node.right, key)
    node.right = left
    if (node) updateSize(node)
    return [node, right]
  }

  merge(other: TreapMap2<K, V>): TreapMap2<K, V> {
    const result = new TreapMap2<K, V>({ comparator: this.compare })
    const aClone = this.cloneNode(this.root)
    const bClone = this.cloneNode(other.root)
    result.root = this.mergeNodes(aClone, bClone)
    result._size = result.root?.size ?? 0
    return result
  }

  private mergeNodes(
    a: TreapMapNode<K, V> | null,
    b: TreapMapNode<K, V> | null,
  ): TreapMapNode<K, V> | null {
    if (a === null) return b
    if (b === null) return a
    if (a.priority > b.priority) {
      a.right = this.mergeNodes(a.right, b)
      updateSize(a)
      return a
    }
    b.left = this.mergeNodes(a, b.left)
    updateSize(b)
    return b
  }

  rangeQuery(lo: K, hi: K): [K, V][] {
    if (this.compare(lo, hi) > 0) return []
    const result: [K, V][] = []
    this.rangeTraversal(this.root, lo, hi, result)
    return result
  }

  private rangeTraversal(
    node: TreapMapNode<K, V> | null,
    lo: K,
    hi: K,
    result: [K, V][],
  ): void {
    if (node === null) return
    const cmpLo = this.compare(node.key, lo)
    const cmpHi = this.compare(node.key, hi)
    if (cmpLo > 0) {
      this.rangeTraversal(node.left, lo, hi, result)
    }
    if (cmpLo >= 0 && cmpHi <= 0) {
      result.push([node.key, node.value])
    }
    if (cmpHi < 0) {
      this.rangeTraversal(node.right, lo, hi, result)
    }
  }

  static fromArray<K, V>(
    entries: [K, V][],
    options?: TreapMap2Options<K>,
  ): TreapMap2<K, V> {
    const map = new TreapMap2<K, V>(options)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  first(): [K, V] | undefined {
    return this.min()
  }

  last(): [K, V] | undefined {
    return this.max()
  }

  update(key: K, value: V): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp === 0) {
        current.value = value
        return true
      }
      current = cmp < 0 ? current.left : current.right
    }
    return false
  }
}
