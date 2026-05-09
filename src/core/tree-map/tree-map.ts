import type { AVLNode } from './types.js'

export class TreeMap<K, V> {
  private root: AVLNode<K, V> | null = null
  private _size: number = 0
  private compare: (a: K, b: K) => number

  constructor(compare?: (a: K, b: K) => number) {
    this.compare = compare ?? ((a: K, b: K) => (a as number) - (b as number))
  }

  private height(node: AVLNode<K, V> | null): number {
    return node === null ? 0 : node.height
  }

  private updateHeight(node: AVLNode<K, V>): void {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right))
  }

  private balanceFactor(node: AVLNode<K, V>): number {
    return this.height(node.left) - this.height(node.right)
  }

  private rotateRight(y: AVLNode<K, V>): AVLNode<K, V> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateHeight(y)
    this.updateHeight(x)
    return x
  }

  private rotateLeft(x: AVLNode<K, V>): AVLNode<K, V> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateHeight(x)
    this.updateHeight(y)
    return y
  }

  private balance(node: AVLNode<K, V>): AVLNode<K, V> {
    this.updateHeight(node)
    const bf = this.balanceFactor(node)
    if (bf > 1) {
      if (this.balanceFactor(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }
    if (bf < -1) {
      if (this.balanceFactor(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }
    return node
  }

  private insertNode(node: AVLNode<K, V> | null, key: K, value: V): AVLNode<K, V> {
    if (node === null) {
      return { key, value, left: null, right: null, height: 1 }
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
    return this.balance(node)
  }

  set(key: K, value: V): void {
    const existing = this.get(key)
    this.root = this.insertNode(this.root, key, value)
    if (existing === undefined) {
      this._size++
    }
  }

  private findNode(node: AVLNode<K, V> | null, key: K): V | undefined {
    if (node === null) return undefined
    const cmp = this.compare(key, node.key)
    if (cmp === 0) return node.value
    if (cmp < 0) return this.findNode(node.left, key)
    return this.findNode(node.right, key)
  }

  get(key: K): V | undefined {
    return this.findNode(this.root, key)
  }

  private hasNode(node: AVLNode<K, V> | null, key: K): boolean {
    if (node === null) return false
    const cmp = this.compare(key, node.key)
    if (cmp === 0) return true
    if (cmp < 0) return this.hasNode(node.left, key)
    return this.hasNode(node.right, key)
  }

  has(key: K): boolean {
    return this.hasNode(this.root, key)
  }

  private findMin(node: AVLNode<K, V>): AVLNode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private deleteNode(node: AVLNode<K, V> | null, key: K): AVLNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      const successor = this.findMin(node.right)
      node.key = successor.key
      node.value = successor.value
      node.right = this.deleteNode(node.right, successor.key)
    }
    return this.balance(node)
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
    this._size--
    return true
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.findMin(this.root)
    return [node.key, node.value]
  }

  private findMax(node: AVLNode<K, V>): AVLNode<K, V> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.findMax(this.root)
    return [node.key, node.value]
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

  private inOrderTraversal(node: AVLNode<K, V> | null, result: [K, V][]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inOrderTraversal(node.right, result)
  }

  keys(): K[] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result.map(([k]) => k)
  }

  values(): V[] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result.map(([, v]) => v)
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  private rangeTraversal(node: AVLNode<K, V> | null, low: K, high: K, result: [K, V][]): void {
    if (node === null) return
    const cmpLow = this.compare(node.key, low)
    const cmpHigh = this.compare(node.key, high)
    if (cmpLow > 0) {
      this.rangeTraversal(node.left, low, high, result)
    }
    if (cmpLow >= 0 && cmpHigh <= 0) {
      result.push([node.key, node.value])
    }
    if (cmpHigh < 0) {
      this.rangeTraversal(node.right, low, high, result)
    }
  }

  rangeSearch(low: K, high: K): [K, V][] {
    if (this.compare(low, high) > 0) return []
    const result: [K, V][] = []
    this.rangeTraversal(this.root, low, high, result)
    return result
  }

  lowerBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp >= 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp > 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    const entries = this.entries()
    for (const [key, value] of entries) {
      callback(value, key)
    }
  }

  map<U>(callback: (value: V, key: K) => U): TreeMap<K, U> {
    const result = new TreeMap<K, U>(this.compare)
    const entries = this.entries()
    for (const [key, value] of entries) {
      result.set(key, callback(value, key))
    }
    return result
  }

  filter(predicate: (value: V, key: K) => boolean): TreeMap<K, V> {
    const result = new TreeMap<K, V>(this.compare)
    const entries = this.entries()
    for (const [key, value] of entries) {
      if (predicate(value, key)) {
        result.set(key, value)
      }
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: V, key: K) => U, initial: U): U {
    let acc = initial
    const entries = this.entries()
    for (const [key, value] of entries) {
      acc = callback(acc, value, key)
    }
    return acc
  }

  clone(): TreeMap<K, V> {
    const result = new TreeMap<K, V>(this.compare)
    const entries = this.entries()
    for (const [key, value] of entries) {
      result.set(key, value)
    }
    return result
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  static fromEntries<K, V>(entries: [K, V][], compare?: (a: K, b: K) => number): TreeMap<K, V> {
    const map = new TreeMap<K, V>(compare)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  update(key: K, updater: (value: V | undefined) => V): void {
    const current = this.get(key)
    this.set(key, updater(current))
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const entries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < entries.length) {
          const value = entries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }
}

export type { AVLNode } from './types.js'
