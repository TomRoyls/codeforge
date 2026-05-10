import type { PersistentMapOptions, PersistentMapStats } from './types.js'

const DEFAULT_COMPARATOR = <K>(a: K, b: K): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

interface AVLNode<K, V> {
  key: K
  value: V
  left: AVLNode<K, V> | undefined
  right: AVLNode<K, V> | undefined
  height: number
}

function getHeight<K, V>(node: AVLNode<K, V> | undefined): number {
  return node ? node.height : 0
}

function makeNode<K, V>(
  key: K,
  value: V,
  left: AVLNode<K, V> | undefined,
  right: AVLNode<K, V> | undefined,
): AVLNode<K, V> {
  return { key, value, left, right, height: 1 + Math.max(getHeight(left), getHeight(right)) }
}

function rotateLeft<K, V>(node: AVLNode<K, V>): AVLNode<K, V> {
  const newRoot = node.right!
  return makeNode(
    newRoot.key,
    newRoot.value,
    makeNode(node.key, node.value, node.left, newRoot.left),
    newRoot.right,
  )
}

function rotateRight<K, V>(node: AVLNode<K, V>): AVLNode<K, V> {
  const newRoot = node.left!
  return makeNode(
    newRoot.key,
    newRoot.value,
    newRoot.left,
    makeNode(node.key, node.value, newRoot.right, node.right),
  )
}

function getBalance<K, V>(node: AVLNode<K, V>): number {
  return getHeight(node.left) - getHeight(node.right)
}

function balanceNode<K, V>(node: AVLNode<K, V>): AVLNode<K, V> {
  const bal = getBalance(node)
  if (bal > 1) {
    if (node.left && getBalance(node.left) < 0) {
      return rotateRight(makeNode(node.key, node.value, rotateLeft(node.left), node.right))
    }
    return rotateRight(node)
  }
  if (bal < -1) {
    if (node.right && getBalance(node.right) > 0) {
      return rotateLeft(makeNode(node.key, node.value, node.left, rotateRight(node.right)))
    }
    return rotateLeft(node)
  }
  return node
}

function insertNode<K, V>(
  node: AVLNode<K, V> | undefined,
  key: K,
  value: V,
  cmp: (a: K, b: K) => number,
): AVLNode<K, V> {
  if (!node) return { key, value, left: undefined, right: undefined, height: 1 }
  const c = cmp(key, node.key)
  if (c < 0) {
    return balanceNode(makeNode(node.key, node.value, insertNode(node.left, key, value, cmp), node.right))
  }
  if (c > 0) {
    return balanceNode(makeNode(node.key, node.value, node.left, insertNode(node.right, key, value, cmp)))
  }
  return makeNode(key, value, node.left, node.right)
}

function findMin<K, V>(node: AVLNode<K, V>): AVLNode<K, V> {
  let current = node
  while (current.left) current = current.left
  return current
}

function findMax<K, V>(node: AVLNode<K, V>): AVLNode<K, V> {
  let current = node
  while (current.right) current = current.right
  return current
}

function deleteNode<K, V>(
  node: AVLNode<K, V> | undefined,
  key: K,
  cmp: (a: K, b: K) => number,
): AVLNode<K, V> | undefined {
  if (!node) return undefined
  const c = cmp(key, node.key)
  if (c < 0) {
    return balanceNode(makeNode(node.key, node.value, deleteNode(node.left, key, cmp), node.right))
  }
  if (c > 0) {
    return balanceNode(makeNode(node.key, node.value, node.left, deleteNode(node.right, key, cmp)))
  }
  if (!node.left) return node.right
  if (!node.right) return node.left
  const successor = findMin(node.right)
  return balanceNode(
    makeNode(successor.key, successor.value, node.left, deleteNode(node.right, successor.key, cmp)),
  )
}

function getNode<K, V>(
  node: AVLNode<K, V> | undefined,
  key: K,
  cmp: (a: K, b: K) => number,
): V | undefined {
  if (!node) return undefined
  const c = cmp(key, node.key)
  if (c < 0) return getNode(node.left, key, cmp)
  if (c > 0) return getNode(node.right, key, cmp)
  return node.value
}

function hasNode<K, V>(
  node: AVLNode<K, V> | undefined,
  key: K,
  cmp: (a: K, b: K) => number,
): boolean {
  if (!node) return false
  const c = cmp(key, node.key)
  if (c < 0) return hasNode(node.left, key, cmp)
  if (c > 0) return hasNode(node.right, key, cmp)
  return true
}

function inorderEntries<K, V>(node: AVLNode<K, V> | undefined, result: [K, V][]): void {
  if (!node) return
  inorderEntries(node.left, result)
  result.push([node.key, node.value])
  inorderEntries(node.right, result)
}

function inorderKeys<K, V>(node: AVLNode<K, V> | undefined, result: K[]): void {
  if (!node) return
  inorderKeys(node.left, result)
  result.push(node.key)
  inorderKeys(node.right, result)
}

function inorderValues<K, V>(node: AVLNode<K, V> | undefined, result: V[]): void {
  if (!node) return
  inorderValues(node.left, result)
  result.push(node.value)
  inorderValues(node.right, result)
}

function inorderForEach<K, V>(node: AVLNode<K, V> | undefined, callback: (value: V, key: K, index: number, map: PersistentMap<K, V>) => void, cmp: (a: K, b: K) => number, map: PersistentMap<K, V>): void {
  if (!node) return
  inorderForEach(node.left, callback, cmp, map)
  callback(node.value, node.key, 0, map)
  inorderForEach(node.right, callback, cmp, map)
}

export class PersistentMap<K, V> {
  private readonly _root: AVLNode<K, V> | undefined
  private readonly _size: number
  private readonly _comparator: (a: K, b: K) => number

  constructor(options?: PersistentMapOptions<K>)
  constructor(
    root: AVLNode<K, V> | undefined,
    size: number,
    comparator: (a: K, b: K) => number,
  )
  constructor(
    rootOrOptions?: AVLNode<K, V> | PersistentMapOptions<K>,
    size?: number,
    comparator?: (a: K, b: K) => number,
  ) {
    if (typeof size === 'number' && comparator) {
      this._root = rootOrOptions as AVLNode<K, V> | undefined
      this._size = size
      this._comparator = comparator
    } else {
      const opts = rootOrOptions as PersistentMapOptions<K> | undefined
      this._root = undefined
      this._size = 0
      this._comparator = opts?.comparator ?? DEFAULT_COMPARATOR
    }
  }

  set(key: K, value: V): PersistentMap<K, V> {
    const alreadyHas = hasNode(this._root, key, this._comparator)
    const newRoot = insertNode(this._root, key, value, this._comparator)
    return new PersistentMap(newRoot, alreadyHas ? this._size : this._size + 1, this._comparator)
  }

  delete(key: K): PersistentMap<K, V> {
    if (!hasNode(this._root, key, this._comparator)) return this
    const newRoot = deleteNode(this._root, key, this._comparator)
    return new PersistentMap(newRoot, this._size - 1, this._comparator)
  }

  get(key: K): V | undefined {
    return getNode(this._root, key, this._comparator)
  }

  has(key: K): boolean {
    return hasNode(this._root, key, this._comparator)
  }

  first(): [K, V] | undefined {
    if (!this._root) return undefined
    const min = findMin(this._root)
    return [min.key, min.value]
  }

  last(): [K, V] | undefined {
    if (!this._root) return undefined
    const max = findMax(this._root)
    return [max.key, max.value]
  }

  forEach(callback: (value: V, key: K, index: number, map: PersistentMap<K, V>) => void): void {
    let idx = 0
    const wrapped = (value: V, key: K, _index: number, map: PersistentMap<K, V>) => {
      callback(value, key, idx++, map)
    }
    inorderForEach(this._root, wrapped, this._comparator, this)
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    inorderEntries(this._root, result)
    return result
  }

  keys(): K[] {
    const result: K[] = []
    inorderKeys(this._root, result)
    return result
  }

  values(): V[] {
    const result: V[] = []
    inorderValues(this._root, result)
    return result
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  static from<K, V>(entries: Iterable<[K, V]> | ArrayLike<[K, V]>, options?: PersistentMapOptions<K>): PersistentMap<K, V> {
    const map = new PersistentMap<K, V>(options)
    const arr = Array.isArray(entries) ? entries : Array.from(entries)
    return arr.reduce<PersistentMap<K, V>>(
      (m, entry) => m.set(entry[0], entry[1]),
      map,
    )
  }

  stats(): PersistentMapStats {
    return {
      size: this._size,
      height: getHeight(this._root),
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    const arr = this.entries()
    for (const entry of arr) {
      yield entry
    }
  }
}

export type { PersistentMapOptions, PersistentMapStats } from './types.js'
