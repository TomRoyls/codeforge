import type { ShuffleTreeOptions } from './types.js'

export type { ShuffleTreeOptions } from './types.js'

class TreeNode<T> {
  value: T
  left: TreeNode<T> | null = null
  right: TreeNode<T> | null = null

  constructor(value: T) {
    this.value = value
  }
}

export class ShuffleTree<T> {
  private root: TreeNode<T> | null = null
  private _size: number = 0
  private compare: (a: T, b: T) => number

  constructor(options?: ShuffleTreeOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(item: T): void {
    if (this.root === null) {
      this.root = new TreeNode(item)
      this._size++
      return
    }
    this.root = this.insertRec(this.root, item)
  }

  private insertRec(node: TreeNode<T>, item: T): TreeNode<T> {
    const cmp = this.compare(item, node.value)
    if (cmp === 0) {
      return node
    }
    if (cmp < 0) {
      if (node.left === null) {
        const newNode = new TreeNode(item)
        node.left = newNode
        this._size++
        return this.maybeRotate(node, newNode)
      }
      node.left = this.insertRec(node.left, item)
      return this.maybeRotateRight(node)
    }
    if (node.right === null) {
      const newNode = new TreeNode(item)
      node.right = newNode
      this._size++
      return this.maybeRotate(node, newNode)
    }
    node.right = this.insertRec(node.right, item)
    return this.maybeRotateLeft(node)
  }

  private maybeRotate(parent: TreeNode<T>, _child: TreeNode<T>): TreeNode<T> {
    if (Math.random() < 0.5) {
      return parent
    }
    if (parent.left === _child) {
      return this.rotateRight(parent)
    }
    return this.rotateLeft(parent)
  }

  private maybeRotateLeft(node: TreeNode<T>): TreeNode<T> {
    if (Math.random() < 0.5) {
      return node
    }
    return this.rotateLeft(node)
  }

  private maybeRotateRight(node: TreeNode<T>): TreeNode<T> {
    if (Math.random() < 0.5) {
      return node
    }
    return this.rotateRight(node)
  }

  private rotateLeft(node: TreeNode<T>): TreeNode<T> {
    const right = node.right
    if (right === null) return node
    node.right = right.left
    right.left = node
    return right
  }

  private rotateRight(node: TreeNode<T>): TreeNode<T> {
    const left = node.left
    if (left === null) return node
    node.left = left.right
    left.right = node
    return left
  }

  has(item: T): boolean {
    return this.findNode(this.root, item) !== null
  }

  private findNode(node: TreeNode<T> | null, item: T): TreeNode<T> | null {
    if (node === null) return null
    const cmp = this.compare(item, node.value)
    if (cmp === 0) return node
    if (cmp < 0) return this.findNode(node.left, item)
    return this.findNode(node.right, item)
  }

  delete(item: T): boolean {
    if (!this.has(item)) return false
    this.root = this.deleteRec(this.root, item)
    this._size--
    return true
  }

  private deleteRec(node: TreeNode<T> | null, item: T): TreeNode<T> | null {
    if (node === null) return null
    const cmp = this.compare(item, node.value)
    if (cmp < 0) {
      node.left = this.deleteRec(node.left, item)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteRec(node.right, item)
      return node
    }
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    const successor = this.findMinNode(node.right)
    node.value = successor.value
    node.right = this.deleteRec(node.right, successor.value)
    return node
  }

  private findMinNode(node: TreeNode<T>): TreeNode<T> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  search(item: T): T | undefined {
    const node = this.findNode(this.root, item)
    return node?.value
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    return this.findMinNode(this.root).value
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

  private inOrder(node: TreeNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inOrder(node.left, result)
    result.push(node.value)
    this.inOrder(node.right, result)
  }

  forEach(callback: (item: T) => void): void {
    this.inOrderForEach(this.root, callback)
  }

  private inOrderForEach(node: TreeNode<T> | null, callback: (item: T) => void): void {
    if (node === null) return
    this.inOrderForEach(node.left, callback)
    callback(node.value)
    this.inOrderForEach(node.right, callback)
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.inOrderGenerator(this.root)
  }

  private *inOrderGenerator(node: TreeNode<T> | null): Generator<T> {
    if (node === null) return
    yield* this.inOrderGenerator(node.left)
    yield node.value
    yield* this.inOrderGenerator(node.right)
  }

  height(): number {
    return this.computeHeight(this.root)
  }

  private computeHeight(node: TreeNode<T> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  clone(): ShuffleTree<T> {
    const cloned = new ShuffleTree<T>({ comparator: this.compare })
    cloned.root = this.cloneNode(this.root)
    cloned._size = this._size
    return cloned
  }

  private cloneNode(node: TreeNode<T> | null): TreeNode<T> | null {
    if (node === null) return null
    const copy = new TreeNode(node.value)
    copy.left = this.cloneNode(node.left)
    copy.right = this.cloneNode(node.right)
    return copy
  }

  toString(): string {
    return `ShuffleTree({ size: ${this._size} })`
  }

  toJSON() {
    return { type: 'ShuffleTree', items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }
}
