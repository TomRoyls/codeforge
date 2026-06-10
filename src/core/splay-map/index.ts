import type { SplayNode, CompareFunction, SplayMapOptions } from './types.js'

export class SplayMap<K, V> {
  private root: SplayNode<K, V> | null = null
  private _size: number = 0
  private compare: CompareFunction<K>

  constructor(options?: SplayMapOptions<K>) {
    this.compare =
      options?.comparator ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private splay(key: K): void {
    if (this.root === null) return

    const header: SplayNode<K, V> = {
      key,
      value: undefined as V,
      left: null,
      right: null,
    }
    let leftMax = header
    let rightMin = header
    let node: SplayNode<K, V> = this.root!

    while (true) {
      const cmp = this.compare(key, node!.key)
      if (cmp < 0) {
        if (node!.left === null) break
        if (this.compare(key, node!.left!.key) < 0) {
          const temp = node!.left!
          node!.left = temp.right
          temp.right = node
          node = temp
          if (node!.left === null) break
        }
        rightMin.left = node
        rightMin = node
        node = node!.left!
      } else if (cmp > 0) {
        if (node!.right === null) break
        if (this.compare(key, node!.right!.key) > 0) {
          const temp = node!.right!
          node!.right = temp.left
          temp.left = node
          node = temp
          if (node!.right === null) break
        }
        leftMax.right = node
        leftMax = node
        node = node!.right!
      } else {
        break
      }
    }

    leftMax.right = node!.left
    rightMin.left = node!.right
    node!.left = header.right
    node!.right = header.left
    this.root = node
  }

  set(key: K, value: V): void {
    if (this.root === null) {
      this.root = { key, value, left: null, right: null }
      this._size++
      return
    }

    this.splay(key)

    const cmp = this.compare(key, this.root!.key)
    if (cmp === 0) {
      this.root!.value = value
      return
    }

    const newNode: SplayNode<K, V> = { key, value, left: null, right: null }
    if (cmp < 0) {
      newNode.right = this.root
      newNode.left = this.root!.left
      this.root!.left = null
    } else {
      newNode.left = this.root
      newNode.right = this.root!.right
      this.root!.right = null
    }
    this.root = newNode
    this._size++
  }

  insert(key: K, value: V): void {
    this.set(key, value)
  }

  get(key: K): V | undefined {
    if (this.root === null) return undefined
    this.splay(key)
    if (this.compare(key, this.root!.key) === 0) {
      return this.root!.value
    }
    return undefined
  }

  delete(key: K): boolean {
    if (this.root === null) return false

    this.splay(key)
    if (this.compare(key, this.root!.key) !== 0) return false

    if (this.root!.left === null) {
      this.root = this.root!.right
    } else {
      const rightSubtree = this.root!.right
      this.root = this.root!.left
      this.splay(key)
      this.root!.right = rightSubtree
    }

    this._size--
    return true
  }

  has(key: K): boolean {
    if (this.root === null) return false
    this.splay(key)
    return this.compare(key, this.root!.key) === 0
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

  clone(): SplayMap<K, V> {
    const result = new SplayMap<K, V>({ comparator: this.compare })
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      result.set(key, value)
    }
    return result
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return [node.key, node.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return [node.key, node.value]
  }

  first(): [K, V] | undefined {
    return this.min()
  }

  last(): [K, V] | undefined {
    return this.max()
  }

  private inOrderTraversal(node: SplayNode<K, V> | null, result: [K, V][]): void {
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

  toArray(): [K, V][] {
    return this.entries()
  }

  toArraySorted(): [K, V][] {
    return this.entries()
  }

  forEach(callback: (value: V, key: K, map: SplayMap<K, V>) => void): void {
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      callback(value, key, this)
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    const stack: SplayNode<K, V>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield [current.key, current.value]
      current = current.right
    }
  }

  lowerBound(key: K): [K, V] | undefined {
    let result: SplayNode<K, V> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp <= 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? [result.key, result.value] : undefined
  }

  upperBound(key: K): [K, V] | undefined {
    let result: SplayNode<K, V> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? [result.key, result.value] : undefined
  }

  predecessor(key: K): [K, V] | undefined {
    let result: SplayNode<K, V> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp > 0) {
        result = node
        node = node.right
      } else {
        node = node.left
      }
    }
    return result ? [result.key, result.value] : undefined
  }

  successor(key: K): [K, V] | undefined {
    let result: SplayNode<K, V> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? [result.key, result.value] : undefined
  }

  rank(key: K): number {
    const allEntries = this.entries()
    let count = 0
    for (const [k] of allEntries) {
      if (this.compare(k, key) < 0) {
        count++
      } else {
        break
      }
    }
    return count
  }

  select(k: number): [K, V] | undefined {
    if (k < 0 || k >= this._size) return undefined
    const allEntries = this.entries()
    return allEntries[k]
  }

  split(key: K): [SplayMap<K, V>, SplayMap<K, V>] {
    const left = new SplayMap<K, V>({ comparator: this.compare })
    const right = new SplayMap<K, V>({ comparator: this.compare })
    for (const [k, v] of this) {
      if (this.compare(k, key) <= 0) {
        left.set(k, v)
      } else {
        right.set(k, v)
      }
    }
    return [left, right]
  }

  merge(other: SplayMap<K, V>): void {
    for (const [k, v] of other) {
      this.set(k, v)
    }
  }

  rangeQuery(lo: K, hi: K): [K, V][] {
    const result: [K, V][] = []
    for (const [k, v] of this) {
      const cmpLo = this.compare(k, lo)
      if (cmpLo >= 0) {
        const cmpHi = this.compare(k, hi)
        if (cmpHi <= 0) {
          result.push([k, v])
        } else {
          break
        }
      }
    }
    return result
  }

  update(key: K, value: V): boolean {
    if (this.root === null) return false
    this.splay(key)
    if (this.compare(key, this.root!.key) !== 0) return false
    this.root!.value = value
    return true
  }

  static fromArray<K, V>(entries: [K, V][], options?: SplayMapOptions<K>): SplayMap<K, V> {
    const map = new SplayMap<K, V>(options)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  toString(): string {
    return `SplayMap({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SplayMap', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'SplayMap'
  }
}

export type { SplayNode, CompareFunction, SplayMapOptions } from './types.js'
