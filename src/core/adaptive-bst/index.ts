import type { Comparator, ForEachCallback, AdaptiveBSTNode, AdaptiveBSTOptions } from './types.js'

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

const randomPriority = (): number => Math.random()

export class AdaptiveBST<T> {
  private _root: AdaptiveBSTNode<T> | null
  private _size: number
  private readonly _comparator: Comparator<T>

  constructor(options?: AdaptiveBSTOptions<T>) {
    this._comparator = options?.comparator ?? defaultComparator
    this._root = null
    this._size = 0
  }

  insert(value: T): AdaptiveBSTNode<T> {
    const node: AdaptiveBSTNode<T> = {
      value,
      left: null,
      right: null,
      parent: null,
      priority: randomPriority(),
    }
    if (this._root === null) {
      this._root = node
      this._size++
      return node
    }
    this._insertNode(this._root, node)
    this._size++
    this._bubbleUp(node)
    return node
  }

  private _insertNode(root: AdaptiveBSTNode<T>, node: AdaptiveBSTNode<T>): void {
    let current = root
    while (true) {
      const cmp = this._comparator(node.value, current.value)
      if (cmp < 0) {
        if (current.left === null) {
          current.left = node
          node.parent = current
          return
        }
        current = current.left
      } else {
        if (current.right === null) {
          current.right = node
          node.parent = current
          return
        }
        current = current.right
      }
    }
  }

  private _bubbleUp(node: AdaptiveBSTNode<T>): void {
    while (node.parent !== null && node.priority < node.parent.priority) {
      if (node.parent.left === node) {
        this._rotateRight(node.parent)
      } else {
        this._rotateLeft(node.parent)
      }
    }
  }

  private _rotateLeft(node: AdaptiveBSTNode<T>): void {
    const rightChild = node.right
    if (rightChild === null) return
    node.right = rightChild.left
    if (rightChild.left !== null) {
      rightChild.left.parent = node
    }
    rightChild.parent = node.parent
    if (node.parent === null) {
      this._root = rightChild
    } else if (node.parent.left === node) {
      node.parent.left = rightChild
    } else {
      node.parent.right = rightChild
    }
    rightChild.left = node
    node.parent = rightChild
  }

  private _rotateRight(node: AdaptiveBSTNode<T>): void {
    const leftChild = node.left
    if (leftChild === null) return
    node.left = leftChild.right
    if (leftChild.right !== null) {
      leftChild.right.parent = node
    }
    leftChild.parent = node.parent
    if (node.parent === null) {
      this._root = leftChild
    } else if (node.parent.left === node) {
      node.parent.left = leftChild
    } else {
      node.parent.right = leftChild
    }
    leftChild.right = node
    node.parent = leftChild
  }

  search(value: T): T | null {
    const node = this._findNode(value)
    if (node === null) return null
    this._splay(node)
    return node.value
  }

  contains(value: T): boolean {
    const node = this._findNode(value)
    if (node !== null) {
      this._splay(node)
    }
    return node !== null
  }

  private _findNode(value: T): AdaptiveBSTNode<T> | null {
    let current = this._root
    while (current !== null) {
      const cmp = this._comparator(value, current.value)
      if (cmp === 0) return current
      if (cmp < 0) {
        current = current.left
      } else {
        current = current.right
      }
    }
    return null
  }

  private _splay(node: AdaptiveBSTNode<T>): void {
    node.priority = -Infinity
    this._bubbleUp(node)
    node.priority = randomPriority()
    this._restoreHeap(node)
  }

  private _restoreHeap(node: AdaptiveBSTNode<T>): void {
    while (true) {
      let smallest = node
      if (node.left !== null && node.left.priority < smallest.priority) {
        smallest = node.left
      }
      if (node.right !== null && node.right.priority < smallest.priority) {
        smallest = node.right
      }
      if (smallest === node) break
      if (smallest === node.left) {
        this._rotateRight(node)
      } else {
        this._rotateLeft(node)
      }
    }
  }

  delete(value: T): boolean {
    const node = this._findNode(value)
    if (node === null) return false
    this._treapDelete(node)
    this._size--
    return true
  }

  private _treapDelete(node: AdaptiveBSTNode<T>): void {
    while (node.left !== null || node.right !== null) {
      if (node.left === null) {
        this._rotateLeft(node)
      } else if (node.right === null) {
        this._rotateRight(node)
      } else if (node.left.priority < node.right.priority) {
        this._rotateRight(node)
      } else {
        this._rotateLeft(node)
      }
    }
    if (node.parent !== null) {
      if (node.parent.left === node) {
        node.parent.left = null
      } else {
        node.parent.right = null
      }
    } else {
      this._root = null
    }
  }

  private _minNode(node: AdaptiveBSTNode<T>): AdaptiveBSTNode<T> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private _maxNode(node: AdaptiveBSTNode<T>): AdaptiveBSTNode<T> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  findMin(): T {
    if (this._root === null) {
      throw new Error('findMin called on empty tree')
    }
    const node = this._minNode(this._root)
    this._splay(node)
    return node.value
  }

  findMax(): T {
    if (this._root === null) {
      throw new Error('findMax called on empty tree')
    }
    const node = this._maxNode(this._root)
    this._splay(node)
    return node.value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    this._inOrderCollect(this._root, result)
    return result
  }

  private _inOrderCollect(node: AdaptiveBSTNode<T> | null, result: T[]): void {
    if (node === null) return
    this._inOrderCollect(node.left, result)
    result.push(node.value)
    this._inOrderCollect(node.right, result)
  }

  *inOrderTraversal(): Generator<T> {
    yield* this._inOrderGen(this._root)
  }

  private *_inOrderGen(node: AdaptiveBSTNode<T> | null): Generator<T> {
    if (node === null) return
    yield* this._inOrderGen(node.left)
    yield node.value
    yield* this._inOrderGen(node.right)
  }

  *preOrderTraversal(): Generator<T> {
    yield* this._preOrderGen(this._root)
  }

  private *_preOrderGen(node: AdaptiveBSTNode<T> | null): Generator<T> {
    if (node === null) return
    yield node.value
    yield* this._preOrderGen(node.left)
    yield* this._preOrderGen(node.right)
  }

  *postOrderTraversal(): Generator<T> {
    yield* this._postOrderGen(this._root)
  }

  private *_postOrderGen(node: AdaptiveBSTNode<T> | null): Generator<T> {
    if (node === null) return
    yield* this._postOrderGen(node.left)
    yield* this._postOrderGen(node.right)
    yield node.value
  }

  clone(): AdaptiveBST<T> {
    const result = new AdaptiveBST<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root, null)
    result._size = this._size
    return result
  }

  private _cloneNode(node: AdaptiveBSTNode<T> | null, parent: AdaptiveBSTNode<T> | null): AdaptiveBSTNode<T> | null {
    if (node === null) return null
    const cloned: AdaptiveBSTNode<T> = {
      value: node.value,
      left: null,
      right: null,
      parent,
      priority: node.priority,
    }
    cloned.left = this._cloneNode(node.left, cloned)
    cloned.right = this._cloneNode(node.right, cloned)
    return cloned
  }

  static fromArray<U>(items: U[], options?: AdaptiveBSTOptions<U>): AdaptiveBST<U> {
    const tree = new AdaptiveBST<U>(options)
    for (const item of items) {
      tree.insert(item)
    }
    return tree
  }

  forEach(callback: ForEachCallback<T>): void {
    let idx = 0
    for (const value of this.inOrderTraversal()) {
      callback(value, idx++)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.inOrderTraversal()
  }

  isValid(): boolean {
    return this._isValidBST(this._root) && this._isValidHeap(this._root)
  }

  private _isValidBST(node: AdaptiveBSTNode<T> | null): boolean {
    if (node === null) return true
    if (node.left !== null) {
      if (this._comparator(node.left.value, node.value) >= 0) return false
      if (node.left.parent !== node) return false
    }
    if (node.right !== null) {
      if (this._comparator(node.right.value, node.value) < 0) return false
      if (node.right.parent !== node) return false
    }
    return this._isValidBST(node.left) && this._isValidBST(node.right)
  }

  private _isValidHeap(node: AdaptiveBSTNode<T> | null): boolean {
    if (node === null) return true
    if (node.left !== null && node.left.priority < node.priority) return false
    if (node.right !== null && node.right.priority < node.priority) return false
    return this._isValidHeap(node.left) && this._isValidHeap(node.right)
  }

  height(): number {
    return this._height(this._root)
  }

  private _height(node: AdaptiveBSTNode<T> | null): number {
    if (node === null) return -1
    return 1 + Math.max(this._height(node.left), this._height(node.right))
  }

  lowerBound(value: T): T | null {
    let result: T | null = null
    let current = this._root
    while (current !== null) {
      const cmp = this._comparator(current.value, value)
      if (cmp >= 0) {
        result = current.value
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  upperBound(value: T): T | null {
    let result: T | null = null
    let current = this._root
    while (current !== null) {
      const cmp = this._comparator(current.value, value)
      if (cmp > 0) {
        result = current.value
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  count(value: T): number {
    return this._count(this._root, value)
  }

  private _count(node: AdaptiveBSTNode<T> | null, value: T): number {
    if (node === null) return 0
    const cmp = this._comparator(value, node.value)
    let c = 0
    if (cmp === 0) c = 1
    if (cmp <= 0) {
      c += this._count(node.left, value)
    }
    if (cmp >= 0) {
      c += this._count(node.right, value)
    }
    return c
  }

  rangeQuery(low: T, high: T): T[] {
    const result: T[] = []
    this._rangeQueryCollect(this._root, low, high, result)
    return result
  }

  private _rangeQueryCollect(node: AdaptiveBSTNode<T> | null, low: T, high: T, result: T[]): void {
    if (node === null) return
    const cmpLow = this._comparator(node.value, low)
    const cmpHigh = this._comparator(node.value, high)
    if (cmpLow > 0) {
      this._rangeQueryCollect(node.left, low, high, result)
    }
    if (cmpLow >= 0 && cmpHigh <= 0) {
      result.push(node.value)
    }
    if (cmpHigh < 0) {
      this._rangeQueryCollect(node.right, low, high, result)
    }
  }

  predecessor(value: T): T | null {
    const node = this._findNode(value)
    if (node === null) return null
    if (node.left !== null) {
      return this._maxNode(node.left).value
    }
    let current = node.parent
    let child = node
    while (current !== null && current.left === child) {
      child = current
      current = current.parent
    }
    return current !== null ? current.value : null
  }

  successor(value: T): T | null {
    const node = this._findNode(value)
    if (node === null) return null
    if (node.right !== null) {
      return this._minNode(node.right).value
    }
    let current = node.parent
    let child = node
    while (current !== null && current.right === child) {
      child = current
      current = current.parent
    }
    return current !== null ? current.value : null
  }

  rank(value: T): number {
    return this._rank(this._root, value)
  }

  private _rank(node: AdaptiveBSTNode<T> | null, value: T): number {
    if (node === null) return 0
    const cmp = this._comparator(value, node.value)
    if (cmp < 0) {
      return this._rank(node.left, value)
    }
    if (cmp > 0) {
      return 1 + this._subtreeSize(node.left) + this._rank(node.right, value)
    }
    return this._subtreeSize(node.left)
  }

  private _subtreeSize(node: AdaptiveBSTNode<T> | null): number {
    if (node === null) return 0
    return 1 + this._subtreeSize(node.left) + this._subtreeSize(node.right)
  }

  select(k: number): T {
    if (k < 0 || k >= this._size) {
      throw new RangeError(`Index ${k} out of bounds [0, ${this._size})`)
    }
    const result = this._select(this._root, k)
    if (result === null) {
      throw new Error('select failed')
    }
    return result.value
  }

  private _select(node: AdaptiveBSTNode<T> | null, k: number): AdaptiveBSTNode<T> | null {
    if (node === null) return null
    const leftSize = this._subtreeSize(node.left)
    if (k < leftSize) {
      return this._select(node.left, k)
    }
    if (k > leftSize) {
      return this._select(node.right, k - leftSize - 1)
    }
    return node
  }
}

export type { AdaptiveBSTOptions, AdaptiveBSTNode, Comparator, ForEachCallback } from './types.js'
