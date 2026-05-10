import type { PersistentSetOptions, PersistentSetStats } from './types.js'

const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

interface AVLNode<T> {
  key: T
  left: AVLNode<T> | undefined
  right: AVLNode<T> | undefined
  height: number
}

function getHeight<T>(node: AVLNode<T> | undefined): number {
  return node ? node.height : 0
}

function makeNode<T>(
  key: T,
  left: AVLNode<T> | undefined,
  right: AVLNode<T> | undefined,
): AVLNode<T> {
  return { key, left, right, height: 1 + Math.max(getHeight(left), getHeight(right)) }
}

function rotateLeft<T>(node: AVLNode<T>): AVLNode<T> {
  const newRoot = node.right!
  return makeNode(
    newRoot.key,
    makeNode(node.key, node.left, newRoot.left),
    newRoot.right,
  )
}

function rotateRight<T>(node: AVLNode<T>): AVLNode<T> {
  const newRoot = node.left!
  return makeNode(
    newRoot.key,
    newRoot.left,
    makeNode(node.key, newRoot.right, node.right),
  )
}

function getBalance<T>(node: AVLNode<T>): number {
  return getHeight(node.left) - getHeight(node.right)
}

function balanceNode<T>(node: AVLNode<T>): AVLNode<T> {
  const bal = getBalance(node)
  if (bal > 1) {
    if (node.left && getBalance(node.left) < 0) {
      return rotateRight(makeNode(node.key, rotateLeft(node.left), node.right))
    }
    return rotateRight(node)
  }
  if (bal < -1) {
    if (node.right && getBalance(node.right) > 0) {
      return rotateLeft(makeNode(node.key, node.left, rotateRight(node.right)))
    }
    return rotateLeft(node)
  }
  return node
}

function insertNode<T>(
  node: AVLNode<T> | undefined,
  key: T,
  cmp: (a: T, b: T) => number,
): AVLNode<T> {
  if (!node) return { key, left: undefined, right: undefined, height: 1 }
  const c = cmp(key, node.key)
  if (c < 0) {
    return balanceNode(makeNode(node.key, insertNode(node.left, key, cmp), node.right))
  }
  if (c > 0) {
    return balanceNode(makeNode(node.key, node.left, insertNode(node.right, key, cmp)))
  }
  return node
}

function findMinNode<T>(node: AVLNode<T>): AVLNode<T> {
  let current = node
  while (current.left) current = current.left
  return current
}

function findMaxNode<T>(node: AVLNode<T>): AVLNode<T> {
  let current = node
  while (current.right) current = current.right
  return current
}

function deleteNode<T>(
  node: AVLNode<T> | undefined,
  key: T,
  cmp: (a: T, b: T) => number,
): AVLNode<T> | undefined {
  if (!node) return undefined
  const c = cmp(key, node.key)
  if (c < 0) {
    return balanceNode(makeNode(node.key, deleteNode(node.left, key, cmp), node.right))
  }
  if (c > 0) {
    return balanceNode(makeNode(node.key, node.left, deleteNode(node.right, key, cmp)))
  }
  if (!node.left) return node.right
  if (!node.right) return node.left
  const successor = findMinNode(node.right)
  return balanceNode(
    makeNode(successor.key, node.left, deleteNode(node.right, successor.key, cmp)),
  )
}

function hasNode<T>(
  node: AVLNode<T> | undefined,
  key: T,
  cmp: (a: T, b: T) => number,
): boolean {
  if (!node) return false
  const c = cmp(key, node.key)
  if (c < 0) return hasNode(node.left, key, cmp)
  if (c > 0) return hasNode(node.right, key, cmp)
  return true
}

function inorderTraversal<T>(node: AVLNode<T> | undefined, result: T[]): void {
  if (!node) return
  inorderTraversal(node.left, result)
  result.push(node.key)
  inorderTraversal(node.right, result)
}

function inorderForEach<T>(node: AVLNode<T> | undefined, callback: (value: T, index: number, set: PersistentSet<T>) => void, set: PersistentSet<T>): void {
  if (!node) return
  inorderForEach(node.left, callback, set)
  callback(node.key, 0, set)
  inorderForEach(node.right, callback, set)
}

export class PersistentSet<T> {
  private readonly _root: AVLNode<T> | undefined
  private readonly _size: number
  private readonly _comparator: (a: T, b: T) => number

  constructor(options?: PersistentSetOptions<T>)
  constructor(
    root: AVLNode<T> | undefined,
    size: number,
    comparator: (a: T, b: T) => number,
  )
  constructor(
    rootOrOptions?: AVLNode<T> | PersistentSetOptions<T>,
    size?: number,
    comparator?: (a: T, b: T) => number,
  ) {
    if (typeof size === 'number' && comparator) {
      this._root = rootOrOptions as AVLNode<T> | undefined
      this._size = size
      this._comparator = comparator
    } else {
      const opts = rootOrOptions as PersistentSetOptions<T> | undefined
      this._root = undefined
      this._size = 0
      this._comparator = opts?.comparator ?? DEFAULT_COMPARATOR
    }
  }

  add(value: T): PersistentSet<T> {
    if (hasNode(this._root, value, this._comparator)) return this
    const newRoot = insertNode(this._root, value, this._comparator)
    return new PersistentSet(newRoot, this._size + 1, this._comparator)
  }

  delete(value: T): PersistentSet<T> {
    if (!hasNode(this._root, value, this._comparator)) return this
    const newRoot = deleteNode(this._root, value, this._comparator)
    return new PersistentSet(newRoot, this._size - 1, this._comparator)
  }

  has(value: T): boolean {
    return hasNode(this._root, value, this._comparator)
  }

  get min(): T | undefined {
    if (!this._root) return undefined
    return findMinNode(this._root).key
  }

  get max(): T | undefined {
    if (!this._root) return undefined
    return findMaxNode(this._root).key
  }

  forEach(callback: (value: T, index: number, set: PersistentSet<T>) => void): void {
    let idx = 0
    const wrapped = (value: T, _index: number, set: PersistentSet<T>) => {
      callback(value, idx++, set)
    }
    inorderForEach(this._root, wrapped, this)
  }

  toArray(): T[] {
    const result: T[] = []
    inorderTraversal(this._root, result)
    return result
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  static from<T>(values: Iterable<T> | ArrayLike<T>, options?: PersistentSetOptions<T>): PersistentSet<T> {
    const set = new PersistentSet<T>(options)
    const arr = Array.isArray(values) ? values : Array.from(values)
    return arr.reduce<PersistentSet<T>>(
      (s, value) => s.add(value),
      set,
    )
  }

  union(other: PersistentSet<T>): PersistentSet<T> {
    let result: PersistentSet<T> = this
    other.forEach((value) => {
      result = result.add(value)
    })
    return result
  }

  intersection(other: PersistentSet<T>): PersistentSet<T> {
    const result: T[] = []
    this.forEach((value) => {
      if (other.has(value)) {
        result.push(value)
      }
    })
    return PersistentSet.from(result, { comparator: this._comparator })
  }

  difference(other: PersistentSet<T>): PersistentSet<T> {
    const result: T[] = []
    this.forEach((value) => {
      if (!other.has(value)) {
        result.push(value)
      }
    })
    return PersistentSet.from(result, { comparator: this._comparator })
  }

  stats(): PersistentSetStats {
    return {
      size: this._size,
      height: getHeight(this._root),
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const arr = this.toArray()
    for (const value of arr) {
      yield value
    }
  }
}

export type { PersistentSetOptions, PersistentSetStats } from './types.js'
