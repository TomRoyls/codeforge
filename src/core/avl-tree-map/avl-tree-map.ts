import type { AVLNode, CompareFunction } from './types.js'

export class AVLTreeMap<K, V> {
  private root: AVLNode<K, V> | null = null
  private _size: number = 0
  private compare: CompareFunction<K>

  constructor(compare?: CompareFunction<K>) {
    this.compare = compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private nodeHeight(node: AVLNode<K, V> | null): number {
    return node === null ? 0 : node.height
  }

  private updateHeight(node: AVLNode<K, V>): void {
    node.height = 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
  }

  private getBalanceFactor(node: AVLNode<K, V>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right)
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
    const bf = this.getBalanceFactor(node)
    if (bf > 1) {
      if (this.getBalanceFactor(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }
    if (bf < -1) {
      if (this.getBalanceFactor(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }
    return node
  }

  get(key: K): V | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current.value
      }
    }
    return undefined
  }

  private insertNode(node: AVLNode<K, V> | null, key: K, value: V): AVLNode<K, V> {
    if (node === null) {
      this._size++
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
    this.root = this.insertNode(this.root, key, value)
  }

  has(key: K): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return true
      }
    }
    return false
  }

  private findMinNode(node: AVLNode<K, V>): AVLNode<K, V> {
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
      this._size--
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      const successor = this.findMinNode(node.right)
      node.key = successor.key
      node.value = successor.value
      this._size++
      node.right = this.deleteNode(node.right, successor.key)
    }
    return this.balance(node)
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
    return true
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    return [node.key, node.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    return [current.key, current.value]
  }

  private inOrderTraversal(node: AVLNode<K, V> | null, result: [K, V][]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inOrderTraversal(node.right, result)
  }

  forEach(callback: (value: V, key: K) => void): void {
    const entries = this.entries()
    for (const [key, value] of entries) {
      callback(value, key)
    }
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

  clone(): AVLTreeMap<K, V> {
    const result = new AVLTreeMap<K, V>(this.compare)
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      result.set(key, value)
    }
    return result
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const allEntries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < allEntries.length) {
          const value = allEntries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<[K, V]>
      },
    }
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

  private rangeTraversal(node: AVLNode<K, V> | null, start: K, end: K, result: [K, V][]): void {
    if (node === null) return
    const cmpStart = this.compare(node.key, start)
    const cmpEnd = this.compare(node.key, end)
    if (cmpStart > 0) {
      this.rangeTraversal(node.left, start, end, result)
    }
    if (cmpStart >= 0 && cmpEnd <= 0) {
      result.push([node.key, node.value])
    }
    if (cmpEnd < 0) {
      this.rangeTraversal(node.right, start, end, result)
    }
  }

  range(start: K, end: K): [K, V][] {
    if (this.compare(start, end) > 0) return []
    const result: [K, V][] = []
    this.rangeTraversal(this.root, start, end, result)
    return result
  }

  getHeight(): number {
    return this.nodeHeight(this.root)
  }

  static fromEntries<K, V>(entries: [K, V][], compare?: CompareFunction<K>): AVLTreeMap<K, V> {
    const map = new AVLTreeMap<K, V>(compare)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }
}

export type { AVLNode, CompareFunction } from './types.js'
