import type { ThreadedBinaryTreeOptions, ThreadedBinaryTreeStatistics, ThreadedNode } from './types.js'
import { DEFAULT_THREADED_BINARY_TREE_OPTIONS } from './types.js'

export class ThreadedBinaryTree<K, V = undefined> {
  private root: ThreadedNode<K, V> | null = null
  private _size: number = 0
  private compare: (a: K, b: K) => number
  private stats: ThreadedBinaryTreeStatistics

  constructor(options?: ThreadedBinaryTreeOptions<K>) {
    const opts = { ...DEFAULT_THREADED_BINARY_TREE_OPTIONS, ...options }
    this.compare = opts.comparator ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
    this.stats = { inserts: 0, deletes: 0, lookups: 0, rotations: 0, threadsUsed: 0 }
  }

  private leftmost(node: ThreadedNode<K, V> | null): ThreadedNode<K, V> | null {
    if (node === null) return null
    while (!node.leftThread) {
      node = node.left!
    }
    return node
  }

  private rightmost(node: ThreadedNode<K, V> | null): ThreadedNode<K, V> | null {
    if (node === null) return null
    while (!node.rightThread) {
      node = node.right!
    }
    return node
  }

  private inOrderSuccessorNode(node: ThreadedNode<K, V>): ThreadedNode<K, V> | null {
    if (node.rightThread) {
      this.stats.threadsUsed++
      return node.right
    }
    return this.leftmost(node.right)
  }

  private inOrderPredecessorNode(node: ThreadedNode<K, V>): ThreadedNode<K, V> | null {
    if (node.leftThread) {
      this.stats.threadsUsed++
      return node.left
    }
    return this.rightmost(node.left)
  }

  private findNode(key: K): ThreadedNode<K, V> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        if (current.leftThread) return null
        current = current.left
      } else if (cmp > 0) {
        if (current.rightThread) return null
        current = current.right
      } else {
        return current
      }
    }
    return null
  }

  insert(key: K, value?: V): void {
    const newNode: ThreadedNode<K, V> = {
      key,
      value,
      left: null,
      right: null,
      leftThread: true,
      rightThread: true,
    }

    if (this.root === null) {
      this.root = newNode
      this._size++
      this.stats.inserts++
      return
    }

    let current: ThreadedNode<K, V> = this.root
    while (true) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        if (current.leftThread) {
          newNode.left = current.left
          newNode.leftThread = true
          newNode.right = current
          newNode.rightThread = true
          current.left = newNode
          current.leftThread = false
          this._size++
          this.stats.inserts++
          return
        }
        current = current.left!
      } else if (cmp > 0) {
        if (current.rightThread) {
          newNode.right = current.right
          newNode.rightThread = true
          newNode.left = current
          newNode.leftThread = true
          current.right = newNode
          current.rightThread = false
          this._size++
          this.stats.inserts++
          return
        }
        current = current.right!
      } else {
        current.value = value
        return
      }
    }
  }

  delete(key: K): boolean {
    let parent: ThreadedNode<K, V> | null = null
    let current: ThreadedNode<K, V> | null = this.root
    let isLeftChild = false

    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        if (current.leftThread) return false
        parent = current
        isLeftChild = true
        current = current.left
      } else if (cmp > 0) {
        if (current.rightThread) return false
        parent = current
        isLeftChild = false
        current = current.right
      } else {
        break
      }
    }

    if (current === null) return false

    if (!current.leftThread && !current.rightThread) {
      let successorParent = current
      let successor = current.right!
      while (!successor.leftThread) {
        successorParent = successor
        successor = successor.left!
      }
      current.key = successor.key
      current.value = successor.value
      parent = successorParent
      current = successor
      isLeftChild = successorParent.left === successor
    }

    if (current.leftThread && current.rightThread) {
      if (parent === null) {
        this.root = null
      } else if (isLeftChild) {
        parent.left = current.left
        parent.leftThread = true
      } else {
        parent.right = current.right
        parent.rightThread = true
      }
    } else if (!current.leftThread) {
      const pred = this.rightmost(current.left!)!
      pred.right = current.right
      pred.rightThread = current.rightThread
      if (parent === null) {
        this.root = current.left
      } else if (isLeftChild) {
        parent.left = current.left
      } else {
        parent.right = current.left
      }
    } else {
      const succ = this.leftmost(current.right!)!
      succ.left = current.left
      succ.leftThread = current.leftThread
      if (parent === null) {
        this.root = current.right
      } else if (isLeftChild) {
        parent.left = current.right
      } else {
        parent.right = current.right
      }
    }

    this._size--
    this.stats.deletes++
    return true
  }

  has(key: K): boolean {
    this.stats.lookups++
    return this.findNode(key) !== null
  }

  contains(key: K): boolean {
    return this.has(key)
  }

  get(key: K): V | undefined {
    this.stats.lookups++
    const node = this.findNode(key)
    return node?.value
  }

  findMin(): [K, V | undefined] | undefined {
    if (this.root === null) return undefined
    const node = this.leftmost(this.root)!
    return [node.key, node.value]
  }

  findMax(): [K, V | undefined] | undefined {
    if (this.root === null) return undefined
    const node = this.rightmost(this.root)!
    return [node.key, node.value]
  }

  findPredecessor(key: K): [K, V | undefined] | undefined {
    this.stats.lookups++
    const node = this.findNode(key)
    if (node === null) return undefined
    const pred = this.inOrderPredecessorNode(node)
    if (pred === null) return undefined
    return [pred.key, pred.value]
  }

  findSuccessor(key: K): [K, V | undefined] | undefined {
    this.stats.lookups++
    const node = this.findNode(key)
    if (node === null) return undefined
    const succ = this.inOrderSuccessorNode(node)
    if (succ === null) return undefined
    return [succ.key, succ.value]
  }

  inOrderTraversal(): [K, V | undefined][] {
    const result: [K, V | undefined][] = []
    let current = this.leftmost(this.root)
    while (current !== null) {
      result.push([current.key, current.value])
      current = this.inOrderSuccessorNode(current)
    }
    return result
  }

  private preOrderHelper(node: ThreadedNode<K, V> | null, result: [K, V | undefined][]): void {
    if (node === null) return
    result.push([node.key, node.value])
    if (!node.leftThread) this.preOrderHelper(node.left, result)
    if (!node.rightThread) this.preOrderHelper(node.right, result)
  }

  preOrderTraversal(): [K, V | undefined][] {
    const result: [K, V | undefined][] = []
    this.preOrderHelper(this.root, result)
    return result
  }

  private postOrderHelper(node: ThreadedNode<K, V> | null, result: [K, V | undefined][]): void {
    if (node === null) return
    if (!node.leftThread) this.postOrderHelper(node.left, result)
    if (!node.rightThread) this.postOrderHelper(node.right, result)
    result.push([node.key, node.value])
  }

  postOrderTraversal(): [K, V | undefined][] {
    const result: [K, V | undefined][] = []
    this.postOrderHelper(this.root, result)
    return result
  }

  reverseOrderTraversal(): [K, V | undefined][] {
    const result: [K, V | undefined][] = []
    let current = this.rightmost(this.root)
    while (current !== null) {
      result.push([current.key, current.value])
      current = this.inOrderPredecessorNode(current)
    }
    return result
  }

  forEach(callback: (value: V | undefined, key: K) => void): void {
    let current = this.leftmost(this.root)
    while (current !== null) {
      callback(current.value, current.key)
      current = this.inOrderSuccessorNode(current)
    }
  }

  toArray(): [K, V | undefined][] {
    return this.inOrderTraversal()
  }

  clear(): void {
    this.root = null
    this._size = 0
    this.stats = { inserts: 0, deletes: 0, lookups: 0, rotations: 0, threadsUsed: 0 }
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  private computeHeight(node: ThreadedNode<K, V> | null): number {
    if (node === null) return -1
    const leftH = node.leftThread ? -1 : this.computeHeight(node.left)
    const rightH = node.rightThread ? -1 : this.computeHeight(node.right)
    return 1 + Math.max(leftH, rightH)
  }

  height(): number {
    return this.computeHeight(this.root)
  }

  rangeQuery(min: K, max: K): [K, V | undefined][] {
    if (this.compare(min, max) > 0) return []
    const result: [K, V | undefined][] = []
    let current = this.leftmost(this.root)
    while (current !== null) {
      const cmpMin = this.compare(current.key, min)
      if (cmpMin >= 0) {
        const cmpMax = this.compare(current.key, max)
        if (cmpMax > 0) break
        result.push([current.key, current.value])
      }
      current = this.inOrderSuccessorNode(current)
    }
    return result
  }

  getNodeCount(): number {
    return this._size
  }

  getStatistics(): ThreadedBinaryTreeStatistics {
    return { ...this.stats }
  }

  [Symbol.iterator](): Iterator<[K, V | undefined]> {
    const allEntries = this.inOrderTraversal()
    let index = 0
    return {
      next: () => {
        if (index < allEntries.length) {
          const value = allEntries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<[K, V | undefined]>
      },
    }
  }
}

export type { ThreadedBinaryTreeOptions, ThreadedBinaryTreeStatistics, ThreadedNode } from './types.js'
export { DEFAULT_THREADED_BINARY_TREE_OPTIONS } from './types.js'
