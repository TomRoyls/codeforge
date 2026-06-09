import type { LeftistHeap3Node, LeftistHeap3Options } from './types.js'

export class LeftistHeap3<T = number> {
  private root: LeftistHeap3Node<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: LeftistHeap3Options<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  private static npl<T>(node: LeftistHeap3Node<T> | null): number {
    return node === null ? 0 : node.npl
  }

  private mergeNodes(
    a: LeftistHeap3Node<T> | null,
    b: LeftistHeap3Node<T> | null
  ): LeftistHeap3Node<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this.compare(a.value, b.value) > 0) {
      const tmp = a
      a = b
      b = tmp
    }

    a.right = this.mergeNodes(a.right, b)

    if (LeftistHeap3.npl(a.left) < LeftistHeap3.npl(a.right)) {
      const tmp = a.left
      a.left = a.right
      a.right = tmp
    }

    a.npl = LeftistHeap3.npl(a.right) + 1
    return a
  }

  insert(value: T): LeftistHeap3Node<T> {
    const node: LeftistHeap3Node<T> = {
      value,
      left: null,
      right: null,
      npl: 1,
    }
    this.root = this.mergeNodes(this.root, node)
    this._size++
    return node
  }

  extractMin(): T {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    const value = this.root.value
    this.root = this.mergeNodes(this.root.left, this.root.right)
    this._size--
    return value
  }

  peek(): T {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    return this.root.value
  }

  merge(other: LeftistHeap3<T>): void {
    if (other === this) return
    this.root = this.mergeNodes(this.root, other.root)
    this._size += other._size
    other.root = null
    other._size = 0
  }

  meld(other: LeftistHeap3<T>): void {
    this.merge(other)
  }

  decreaseKey(node: LeftistHeap3Node<T>, newValue: T): LeftistHeap3Node<T> {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    if (this.compare(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
    this.root = this.rebuild(this.root)
    return node
  }

  update(node: LeftistHeap3Node<T>, newValue: T): LeftistHeap3Node<T> {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    const cmp = this.compare(newValue, node.value)
    if (cmp < 0) {
      return this.decreaseKey(node, newValue)
    }
    if (cmp > 0) {
      this.delete(node)
      return this.insert(newValue)
    }
    return node
  }

  delete(node: LeftistHeap3Node<T>): void {
    const remaining: LeftistHeap3Node<T>[] = []
    this.collectExcept(this.root, node, remaining)
    this._size = remaining.length
    this.root = this.mergeAllNodes(remaining)
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

  toArray(): T[] {
    const result: T[] = []
    this.inOrder(this.root, result)
    return result
  }

  toSortedArray(): T[] {
    const cloned = this.clone()
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.extractMin())
    }
    return result
  }

  contains(value: T): boolean {
    return this.findNode(this.root, value)
  }

  clone(): LeftistHeap3<T> {
    const cloned = new LeftistHeap3<T>({ comparator: this.compare })
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      cloned.insert(items[i]!)
    }
    return cloned
  }

  static fromArray<U>(items: U[], options?: LeftistHeap3Options<U>): LeftistHeap3<U> {
    const heap = new LeftistHeap3<U>(options)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  static merge<U>(a: LeftistHeap3<U>, b: LeftistHeap3<U>): LeftistHeap3<U> {
    const result = a.clone()
    result.merge(b.clone())
    return result
  }

  forEach(callback: (item: T) => void): void {
    this.forEachNode(this.root, callback)
  }

  *[Symbol.iterator](): Iterator<T> {
    const items = this.toSortedArray()
    for (let i = 0; i < items.length; i++) {
      yield items[i]!
    }
  }

  isValid(): boolean {
    if (this.root === null) return true
    return this.isValidNode(this.root)
  }

  private isValidNode(node: LeftistHeap3Node<T>): boolean {
    const leftNpl = LeftistHeap3.npl(node.left)
    const rightNpl = LeftistHeap3.npl(node.right)

    if (leftNpl < rightNpl) return false

    const expectedNpl = Math.min(leftNpl, rightNpl) + 1
    if (node.npl !== expectedNpl) return false

    if (node.left !== null) {
      if (this.compare(node.value, node.left.value) > 0) return false
      if (!this.isValidNode(node.left)) return false
    }

    if (node.right !== null) {
      if (this.compare(node.value, node.right.value) > 0) return false
      if (!this.isValidNode(node.right)) return false
    }

    return true
  }

  private inOrder(node: LeftistHeap3Node<T> | null, result: T[]): void {
    if (node === null) return
    this.inOrder(node.left, result)
    result.push(node.value)
    this.inOrder(node.right, result)
  }

  private findNode(node: LeftistHeap3Node<T> | null, value: T): boolean {
    if (node === null) return false
    if (this.compare(node.value, value) === 0) return true
    if (this.compare(node.value, value) > 0) return false
    return this.findNode(node.left, value) || this.findNode(node.right, value)
  }

  private forEachNode(node: LeftistHeap3Node<T> | null, callback: (item: T) => void): void {
    if (node === null) return
    this.forEachNode(node.left, callback)
    callback(node.value)
    this.forEachNode(node.right, callback)
  }

  private collectExcept(
    node: LeftistHeap3Node<T> | null,
    exclude: LeftistHeap3Node<T>,
    out: LeftistHeap3Node<T>[]
  ): void {
    if (node === null) return
    if (node !== exclude) {
      out.push(node)
    }
    this.collectExcept(node.left, exclude, out)
    this.collectExcept(node.right, exclude, out)
  }

  private rebuild(node: LeftistHeap3Node<T> | null): LeftistHeap3Node<T> | null {
    if (node === null) return null
    const nodes: LeftistHeap3Node<T>[] = []
    this.collectAll(node, nodes)
    return this.mergeAllNodes(nodes)
  }

  private collectAll(node: LeftistHeap3Node<T> | null, out: LeftistHeap3Node<T>[]): void {
    if (node === null) return
    out.push(node)
    this.collectAll(node.left, out)
    this.collectAll(node.right, out)
  }

  private mergeAllNodes(nodes: LeftistHeap3Node<T>[]): LeftistHeap3Node<T> | null {
    for (const n of nodes) {
      n.left = null
      n.right = null
      n.npl = 1
    }
    let root: LeftistHeap3Node<T> | null = null
    for (const n of nodes) {
      root = this.mergeNodes(root, n)
    }
    return root
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `LeftistHeap3({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LeftistHeap3', size: this.size, items: this.toArray() }
  }
}

export type { LeftistHeap3Options, LeftistHeap3Node } from './types.js'
