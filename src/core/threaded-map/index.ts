import type { ThreadedNode, Comparator, ThreadedMapOptions } from './types.js'

export class ThreadedMap<K, V> {
  private root: ThreadedNode<K, V> | null = null
  private _size: number = 0
  private compare: Comparator<K>

  constructor(entries?: Iterable<[K, V]>, options?: ThreadedMapOptions<K>) {
    this.compare =
      options?.comparator ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  private findNode(key: K): ThreadedNode<K, V> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        if (current.leftThread) break
        current = current.left
      } else if (cmp > 0) {
        if (current.rightThread) break
        current = current.right
      } else {
        return current
      }
    }
    return null
  }

  private leftmost(node: ThreadedNode<K, V>): ThreadedNode<K, V> {
    while (!node.leftThread && node.left !== null) {
      node = node.left
    }
    return node
  }

  private rightmost(node: ThreadedNode<K, V>): ThreadedNode<K, V> {
    while (!node.rightThread && node.right !== null) {
      node = node.right
    }
    return node
  }

  private inOrderSuccessor(node: ThreadedNode<K, V>): ThreadedNode<K, V> | null {
    if (node.rightThread) {
      return node.right
    }
    if (node.right !== null) {
      return this.leftmost(node.right)
    }
    return null
  }

  private inOrderPredecessor(node: ThreadedNode<K, V>): ThreadedNode<K, V> | null {
    if (node.leftThread) {
      return node.left
    }
    if (node.left !== null) {
      return this.rightmost(node.left)
    }
    return null
  }

  set(key: K, value: V): void {
    if (this.root === null) {
      this.root = {
        key,
        value,
        left: null,
        right: null,
        leftThread: false,
        rightThread: false,
      }
      this._size++
      return
    }

    let current: ThreadedNode<K, V> = this.root
    while (true) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        if (current.leftThread || current.left === null) {
          const predecessor = current.leftThread ? current.left : null
          const newNode: ThreadedNode<K, V> = {
            key,
            value,
            left: predecessor,
            right: current,
            leftThread: true,
            rightThread: true,
          }
          current.left = newNode
          current.leftThread = false
          this._size++
          return
        }
        current = current.left
      } else if (cmp > 0) {
        if (current.rightThread || current.right === null) {
          const successor = current.rightThread ? current.right : null
          const newNode: ThreadedNode<K, V> = {
            key,
            value,
            left: current,
            right: successor,
            leftThread: true,
            rightThread: true,
          }
          current.right = newNode
          current.rightThread = false
          this._size++
          return
        }
        current = current.right
      } else {
        current.value = value
        return
      }
    }
  }

  insert(key: K, value: V): void {
    this.set(key, value)
  }

  get(key: K): V | undefined {
    const node = this.findNode(key)
    return node !== null ? node.value : undefined
  }

  has(key: K): boolean {
    return this.findNode(key) !== null
  }

  delete(key: K): boolean {
    const node = this.findNode(key)
    if (node === null) return false

    this.deleteNode(node)
    this._size--
    return true
  }

  private deleteNode(node: ThreadedNode<K, V>): void {
    const hasLeftChild = !node.leftThread && node.left !== null
    const hasRightChild = !node.rightThread && node.right !== null

    if (!hasLeftChild && !hasRightChild) {
      this.deleteLeaf(node)
    } else if (hasLeftChild && hasRightChild) {
      this.deleteTwoChildren(node)
    } else {
      this.deleteOneChild(node)
    }
  }

  private deleteLeaf(node: ThreadedNode<K, V>): void {
    if (node === this.root) {
      this.root = null
      return
    }

    const parent = this.findParent(node)
    if (parent === null) return

    if (parent.left === node) {
      parent.left = node.leftThread ? node.left : null
      parent.leftThread = true
    } else {
      parent.right = node.rightThread ? node.right : null
      parent.rightThread = true
    }
  }

  private deleteOneChild(node: ThreadedNode<K, V>): void {
    const hasLeftChild = !node.leftThread && node.left !== null
    let child: ThreadedNode<K, V>

    if (hasLeftChild) {
      child = this.rightmost(node.left!)
    } else {
      child = this.leftmost(node.right!)
    }

    node.key = child.key
    node.value = child.value
    this.deleteNode(child)
  }

  private deleteTwoChildren(node: ThreadedNode<K, V>): void {
    const successor = this.leftmost(node.right!)
    node.key = successor.key
    node.value = successor.value
    this.deleteNode(successor)
  }

  private findParent(node: ThreadedNode<K, V>): ThreadedNode<K, V> | null {
    if (node === this.root) return null

    let current = this.root
    while (current !== null) {
      if ((!current.leftThread && current.left === node) || (!current.rightThread && current.right === node)) {
        return current
      }
      const cmp = this.compare(node.key, current.key)
      if (cmp < 0) {
        if (current.leftThread) break
        current = current.left
      } else if (cmp > 0) {
        if (current.rightThread) break
        current = current.right
      } else {
        break
      }
    }
    return null
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

  clone(): ThreadedMap<K, V> {
    const result = new ThreadedMap<K, V>(undefined, { comparator: this.compare })
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      result.set(key, value)
    }
    return result
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.leftmost(this.root)
    return [node.key, node.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.rightmost(this.root)
    return [node.key, node.value]
  }

  first(): [K, V] | undefined {
    return this.min()
  }

  last(): [K, V] | undefined {
    return this.max()
  }

  update(key: K, value: V): boolean {
    const node = this.findNode(key)
    if (node === null) return false
    node.value = value
    return true
  }

  forEach(callback: (value: V, key: K, map: ThreadedMap<K, V>) => void): void {
    if (this.root === null) return
    let current: ThreadedNode<K, V> | null = this.leftmost(this.root)
    while (current !== null) {
      callback(current.value, current.key, this)
      current = this.inOrderSuccessor(current)
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    if (this.root === null) return
    let current: ThreadedNode<K, V> | null = this.leftmost(this.root)
    while (current !== null) {
      yield [current.key, current.value]
      current = this.inOrderSuccessor(current)
    }
  }

  keys(): K[] {
    const result: K[] = []
    if (this.root === null) return result
    let current: ThreadedNode<K, V> | null = this.leftmost(this.root)
    while (current !== null) {
      result.push(current.key)
      current = this.inOrderSuccessor(current)
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    if (this.root === null) return result
    let current: ThreadedNode<K, V> | null = this.leftmost(this.root)
    while (current !== null) {
      result.push(current.value)
      current = this.inOrderSuccessor(current)
    }
    return result
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    if (this.root === null) return result
    let current: ThreadedNode<K, V> | null = this.leftmost(this.root)
    while (current !== null) {
      result.push([current.key, current.value])
      current = this.inOrderSuccessor(current)
    }
    return result
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  toArraySorted(): [K, V][] {
    return this.entries()
  }

  lowerBound(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp >= 0) {
        result = [node.key, node.value]
        if (node.leftThread || node.left === null) break
        node = node.left
      } else {
        if (node.rightThread || node.right === null) break
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
        if (node.leftThread || node.left === null) break
        node = node.left
      } else {
        if (node.rightThread || node.right === null) break
        node = node.right
      }
    }
    return result
  }

  predecessor(key: K): [K, V] | undefined {
    const node = this.findNode(key)
    if (node === null) return undefined
    const pred = this.inOrderPredecessor(node)
    return pred !== null ? [pred.key, pred.value] : undefined
  }

  successor(key: K): [K, V] | undefined {
    const node = this.findNode(key)
    if (node === null) return undefined
    const succ = this.inOrderSuccessor(node)
    return succ !== null ? [succ.key, succ.value] : undefined
  }

  rank(key: K): number {
    if (!this.has(key)) return -1
    let r = 0
    if (this.root === null) return -1
    let current: ThreadedNode<K, V> | null = this.leftmost(this.root)
    while (current !== null) {
      if (this.compare(current.key, key) === 0) return r
      r++
      current = this.inOrderSuccessor(current)
    }
    return -1
  }

  select(k: number): [K, V] | undefined {
    if (k < 0 || k >= this._size) return undefined
    let i = 0
    if (this.root === null) return undefined
    let current: ThreadedNode<K, V> | null = this.leftmost(this.root)
    while (current !== null) {
      if (i === k) return [current.key, current.value]
      i++
      current = this.inOrderSuccessor(current)
    }
    return undefined
  }

  static fromArray<K, V>(
    entries: Iterable<[K, V]>,
    options?: ThreadedMapOptions<K>,
  ): ThreadedMap<K, V> {
    return new ThreadedMap<K, V>(entries, options)
  }
}

export type { ThreadedNode, Comparator, ThreadedMapOptions } from './types.js'
