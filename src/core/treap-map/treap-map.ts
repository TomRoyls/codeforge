import type { TreapNode, CompareFunction } from './types.js'

export class TreapMap<K, V> {
  private root: TreapNode<K, V> | null = null
  private _size: number = 0
  private compare: CompareFunction<K>

  constructor(compare?: CompareFunction<K>) {
    this.compare = compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private rotateRight(y: TreapNode<K, V>): TreapNode<K, V> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    return x
  }

  private rotateLeft(x: TreapNode<K, V>): TreapNode<K, V> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    return y
  }

  private insertNode(node: TreapNode<K, V> | null, key: K, value: V): TreapNode<K, V> {
    if (node === null) {
      this._size++
      return { key, value, priority: Math.random(), left: null, right: null }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
      if (node.left!.priority > node.priority) {
        node = this.rotateRight(node)
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
      if (node.right!.priority > node.priority) {
        node = this.rotateLeft(node)
      }
    } else {
      node.value = value
    }
    return node
  }

  set(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
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

  private deleteNode(node: TreapNode<K, V> | null, key: K): TreapNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
      return node
    }
    if (node.left === null && node.right === null) {
      this._size--
      return null
    }
    if (node.left === null) {
      this._size--
      return node.right
    }
    if (node.right === null) {
      this._size--
      return node.left
    }
    if (node.left.priority > node.right.priority) {
      node = this.rotateRight(node)
      node.right = this.deleteNode(node.right, key)
    } else {
      node = this.rotateLeft(node)
      node.left = this.deleteNode(node.left, key)
    }
    return node
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

  private findMinNode(node: TreapNode<K, V>): TreapNode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
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

  private inOrderTraversal(node: TreapNode<K, V> | null, result: [K, V][]): void {
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

  clone(): TreapMap<K, V> {
    const result = new TreapMap<K, V>(this.compare)
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

  private rangeTraversal(node: TreapNode<K, V> | null, start: K, end: K, result: [K, V][]): void {
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

  private computeHeight(node: TreapNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  getHeight(): number {
    return this.computeHeight(this.root)
  }

  static fromEntries<K, V>(entries: [K, V][], compare?: CompareFunction<K>): TreapMap<K, V> {
    const map = new TreapMap<K, V>(compare)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }
}

export type { TreapNode, CompareFunction } from './types.js'
