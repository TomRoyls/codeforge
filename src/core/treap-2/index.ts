import type { TreapNode, CompareFunction, TreapOptions } from './types.js'

export class Treap<K, V = undefined> {
  private root: TreapNode<K, V> | null = null
  private compare: CompareFunction<K>

  constructor(options?: TreapOptions<K>) {
    this.compare =
      options?.compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private nodeSize(node: TreapNode<K, V> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: TreapNode<K, V>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private rotateRight(y: TreapNode<K, V>): TreapNode<K, V> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateSize(y)
    this.updateSize(x)
    return x
  }

  private rotateLeft(x: TreapNode<K, V>): TreapNode<K, V> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateSize(x)
    this.updateSize(y)
    return y
  }

  private insertNode(
    node: TreapNode<K, V> | null,
    key: K,
    value: V | undefined,
  ): TreapNode<K, V> {
    if (node === null) {
      return { key, value, priority: Math.random(), left: null, right: null, size: 1 }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
      if (node.left!.priority > node.priority) {
        node = this.rotateRight(node)
      } else {
        this.updateSize(node)
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
      if (node.right!.priority > node.priority) {
        node = this.rotateLeft(node)
      } else {
        this.updateSize(node)
      }
    } else {
      node.value = value
    }
    return node
  }

  insert(key: K, value?: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private deleteNode(
    node: TreapNode<K, V> | null,
    key: K,
  ): TreapNode<K, V> | null {
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
    if (node.left === null && node.right === null) return null
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    if (node.left.priority > node.right.priority) {
      node = this.rotateRight(node)
      node.right = this.deleteNode(node.right, key)
    } else {
      node = this.rotateLeft(node)
      node.left = this.deleteNode(node.left, key)
    }
    this.updateSize(node)
    return node
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
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

  get(key: K): V | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) current = current.left
      else if (cmp > 0) current = current.right
      else return current.value
    }
    return undefined
  }

  get size(): number {
    return this.nodeSize(this.root)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
  }

  min(): K | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.left !== null) current = current.left
    return current.key
  }

  max(): K | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) current = current.right
    return current.key
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
    this.rangeTraversal(this.root, lo, hi, result)
    return result
  }

  private rangeTraversal(
    node: TreapNode<K, V> | null,
    lo: K,
    hi: K,
    result: K[],
  ): void {
    if (node === null) return
    const cmpLo = this.compare(node.key, lo)
    const cmpHi = this.compare(node.key, hi)
    if (cmpLo > 0) this.rangeTraversal(node.left, lo, hi, result)
    if (cmpLo >= 0 && cmpHi <= 0) result.push(node.key)
    if (cmpHi < 0) this.rangeTraversal(node.right, lo, hi, result)
  }

  toArray(): K[] {
    const result: K[] = []
    this.inOrder(this.root, result)
    return result
  }

  private inOrder(node: TreapNode<K, V> | null, result: K[]): void {
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
    const stack: Array<TreapNode<K, V>> = []
    let current: TreapNode<K, V> | null = this.root
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

  private splitNode(
    node: TreapNode<K, V> | null,
    key: K,
  ): [TreapNode<K, V> | null, TreapNode<K, V> | null] {
    if (node === null) return [null, null]
    const cmp = this.compare(key, node.key)
    if (cmp <= 0) {
      const [left, right] = this.splitNode(node.left, key)
      node.left = right
      this.updateSize(node)
      return [left, node]
    }
    const [left, right] = this.splitNode(node.right, key)
    node.right = left
    this.updateSize(node)
    return [node, right]
  }

  splitByKey(key: K): [Treap<K, V>, Treap<K, V>] {
    const [left, right] = this.splitNode(this.root, key)
    const leftTreap = new Treap<K, V>({ compare: this.compare })
    leftTreap.root = left
    const rightTreap = new Treap<K, V>({ compare: this.compare })
    rightTreap.root = right
    this.root = null
    return [leftTreap, rightTreap]
  }

  mergeOther(other: Treap<K, V>): void {
    const arr1 = this.toArray()
    const arr2 = other.toArray()
    const merged = [...arr1, ...arr2].sort((a, b) => this.compare(a, b))
    this.root = this.buildBalanced(merged, 0, merged.length - 1)
    other.root = null
  }

  private buildBalanced(keys: K[], lo: number, hi: number): TreapNode<K, V> | null {
    if (lo > hi) return null
    const mid = (lo + hi) >> 1
    const node: TreapNode<K, V> = {
      key: keys[mid]!,
      value: undefined,
      priority: Math.random(),
      left: null,
      right: null,
      size: 1,
    }
    node.left = this.buildBalanced(keys, lo, mid - 1)
    node.right = this.buildBalanced(keys, mid + 1, hi)
    this.updateSize(node)
    return node
  }

  static from<K, V = undefined>(
    keys: K[],
    options?: TreapOptions<K> & { values?: V[] },
  ): Treap<K, V> {
    const t = new Treap<K, V>(options)
    const values = options && 'values' in options ? options.values : undefined
    for (let i = 0; i < keys.length; i++) {
      t.insert(keys[i]!, values?.[i])
    }
    return t
  }

  clone(): Treap<K, V> {
    return Treap.from(this.toArray())
  }

  toJSON() {
    return { type: 'Treap', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `Treap({ size: ${this.size} })`
  }

  drain(): K[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  get [Symbol.toStringTag](): string {
    return 'Treap'
  }
}
