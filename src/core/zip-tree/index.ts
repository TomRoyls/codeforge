import type { ZipTreeOptions } from './types.js'

export type { ZipTreeOptions } from './types.js'

class ZipNode<T> {
  value: T
  rank: number
  left: ZipNode<T> | null = null
  right: ZipNode<T> | null = null

  constructor(value: T, rank: number) {
    this.value = value
    this.rank = rank
  }
}

export class ZipTree<T> {
  private root: ZipNode<T> | null = null
  private _size: number = 0
  private compare: (a: T, b: T) => number

  constructor(options?: ZipTreeOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  private generateRank(): number {
    return Math.floor(Math.random() * 2147483647)
  }

  private split(
    node: ZipNode<T> | null,
    key: T,
  ): [ZipNode<T> | null, ZipNode<T> | null] {
    if (node === null) return [null, null]
    if (this.compare(node.value, key) < 0) {
      const [left, right] = this.split(node.right, key)
      node.right = left
      return [node, right]
    }
    const [left, right] = this.split(node.left, key)
    node.left = right
    return [left, node]
  }

  private merge(a: ZipNode<T> | null, b: ZipNode<T> | null): ZipNode<T> | null {
    if (a === null) return b
    if (b === null) return a
    if (a.rank >= b.rank) {
      a.right = this.merge(a.right, b)
      return a
    }
    b.left = this.merge(a, b.left)
    return b
  }

  private findMinNode(node: ZipNode<T>): ZipNode<T> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private deleteMin(node: ZipNode<T>): ZipNode<T> | null {
    if (node.left === null) return node.right
    node.left = this.deleteMin(node.left)
    return node
  }

  insert(item: T): void {
    const [left, right] = this.split(this.root, item)
    if (right !== null && this.compare(item, this.findMinNode(right).value) === 0) {
      this.root = this.merge(left, right)
      return
    }
    const newNode = new ZipNode(item, this.generateRank())
    newNode.left = left
    newNode.right = right
    this.root = newNode
    this._size++
  }

  delete(item: T): boolean {
    const [left, right] = this.split(this.root, item)
    if (right === null || this.compare(item, this.findMinNode(right).value) !== 0) {
      this.root = this.merge(left, right)
      return false
    }
    const newRight = this.deleteMin(right)
    this.root = this.merge(left, newRight)
    this._size--
    return true
  }

  has(item: T): boolean {
    return this.findNode(this.root, item) !== null
  }

  private findNode(node: ZipNode<T> | null, item: T): ZipNode<T> | null {
    let current = node
    while (current !== null) {
      const cmp = this.compare(item, current.value)
      if (cmp === 0) return current
      current = cmp < 0 ? current.left : current.right
    }
    return null
  }

  search(item: T): T | undefined {
    const node = this.findNode(this.root, item)
    return node?.value
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.left !== null) {
      current = current.left
    }
    return current.value
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    return current.value
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
  }

  toArray(): T[] {
    const result: T[] = []
    this.inOrder(this.root, result)
    return result
  }

  private inOrder(node: ZipNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inOrder(node.left, result)
    result.push(node.value)
    this.inOrder(node.right, result)
  }

  forEach(callback: (item: T) => void): void {
    this.inOrderForEach(this.root, callback)
  }

  private inOrderForEach(node: ZipNode<T> | null, callback: (item: T) => void): void {
    if (node === null) return
    this.inOrderForEach(node.left, callback)
    callback(node.value)
    this.inOrderForEach(node.right, callback)
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.inOrderGenerator(this.root)
  }

  private *inOrderGenerator(node: ZipNode<T> | null): Generator<T> {
    if (node === null) return
    yield* this.inOrderGenerator(node.left)
    yield node.value
    yield* this.inOrderGenerator(node.right)
  }

  height(): number {
    return this.computeHeight(this.root)
  }

  private computeHeight(node: ZipNode<T> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  clone(): ZipTree<T> {
    const cloned = new ZipTree<T>({ comparator: this.compare })
    cloned.root = this.cloneNode(this.root)
    cloned._size = this._size
    return cloned
  }

  private cloneNode(node: ZipNode<T> | null): ZipNode<T> | null {
    if (node === null) return null
    const copy = new ZipNode(node.value, node.rank)
    copy.left = this.cloneNode(node.left)
    copy.right = this.cloneNode(node.right)
    return copy
  }
}
