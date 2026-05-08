import type { TreapNode, TreapOptions, TreapStats } from './types.js'
import { DEFAULT_TREAP_OPTIONS } from './types.js'

export class Treap<T> {
  private root: TreapNode<T> | null = null
  private _size: number = 0
  private allowDuplicates: boolean

  constructor(options?: Partial<TreapOptions>) {
    const opts: TreapOptions = { ...DEFAULT_TREAP_OPTIONS, ...options }
    this.allowDuplicates = opts.allowDuplicates
  }

  insert(key: number, value: T): void {
    if (!this.allowDuplicates && this.has(key)) {
      this.root = this.insertNodeUpdate(this.root, key, value)
      return
    }
    this.root = this.insertNode(this.root, key, value)
    this._size++
  }

  private insertNode(node: TreapNode<T> | null, key: number, value: T): TreapNode<T> {
    if (node === null) {
      return { key, value, priority: Math.random(), left: null, right: null }
    }
    if (key < node.key) {
      node.left = this.insertNode(node.left, key, value)
      if (node.left !== null && node.left.priority > node.priority) {
        node = this.rotateRight(node)
      }
    } else if (key > node.key) {
      node.right = this.insertNode(node.right, key, value)
      if (node.right !== null && node.right.priority > node.priority) {
        node = this.rotateLeft(node)
      }
    } else {
      node.value = value
    }
    return node
  }

  private insertNodeUpdate(node: TreapNode<T> | null, key: number, value: T): TreapNode<T> {
    if (node === null) {
      return { key, value, priority: Math.random(), left: null, right: null }
    }
    if (key < node.key) {
      node.left = this.insertNodeUpdate(node.left, key, value)
      if (node.left !== null && node.left.priority > node.priority) {
        node = this.rotateRight(node)
      }
    } else if (key > node.key) {
      node.right = this.insertNodeUpdate(node.right, key, value)
      if (node.right !== null && node.right.priority > node.priority) {
        node = this.rotateLeft(node)
      }
    } else {
      node.value = value
    }
    return node
  }

  private rotateRight(y: TreapNode<T>): TreapNode<T> {
    const x = y.left!
    y.left = x.right
    x.right = y
    return x
  }

  private rotateLeft(x: TreapNode<T>): TreapNode<T> {
    const y = x.right!
    x.right = y.left
    y.left = x
    return y
  }

  search(key: number): T | undefined {
    let node = this.root
    while (node !== null) {
      if (key < node.key) {
        node = node.left
      } else if (key > node.key) {
        node = node.right
      } else {
        return node.value
      }
    }
    return undefined
  }

  delete(key: number): boolean {
    const found = { value: false }
    this.root = this.deleteNode(this.root, key, found)
    if (found.value) {
      this._size--
      return true
    }
    return false
  }

  private deleteNode(node: TreapNode<T> | null, key: number, found: { value: boolean }): TreapNode<T> | null {
    if (node === null) return null
    if (key < node.key) {
      node.left = this.deleteNode(node.left, key, found)
    } else if (key > node.key) {
      node.right = this.deleteNode(node.right, key, found)
    } else {
      found.value = true
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      if (node.left.priority > node.right.priority) {
        node = this.rotateRight(node)
        node.right = this.deleteNode(node.right, key, found)
        found.value = true
      } else {
        node = this.rotateLeft(node)
        node.left = this.deleteNode(node.left, key, found)
        found.value = true
      }
    }
    return node
  }

  has(key: number): boolean {
    let node = this.root
    while (node !== null) {
      if (key < node.key) {
        node = node.left
      } else if (key > node.key) {
        node = node.right
      } else {
        return true
      }
    }
    return false
  }

  getMin(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return node.value
  }

  getMax(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.value
  }

  inOrder(): [number, T][] {
    const result: [number, T][] = []
    this.inOrderHelper(this.root, result)
    return result
  }

  private inOrderHelper(node: TreapNode<T> | null, result: [number, T][]): void {
    if (node === null) return
    this.inOrderHelper(node.left, result)
    result.push([node.key, node.value])
    this.inOrderHelper(node.right, result)
  }

  preOrder(): [number, T][] {
    const result: [number, T][] = []
    this.preOrderHelper(this.root, result)
    return result
  }

  private preOrderHelper(node: TreapNode<T> | null, result: [number, T][]): void {
    if (node === null) return
    result.push([node.key, node.value])
    this.preOrderHelper(node.left, result)
    this.preOrderHelper(node.right, result)
  }

  split(key: number): [Treap<T>, Treap<T>] {
    const [leftRoot, rightRoot] = this.splitNode(this.root, key)
    const left = new Treap<T>({ allowDuplicates: this.allowDuplicates })
    const right = new Treap<T>({ allowDuplicates: this.allowDuplicates })
    left.root = leftRoot
    right.root = rightRoot
    left._size = this.countNodes(leftRoot)
    right._size = this.countNodes(rightRoot)
    return [left, right]
  }

  private splitNode(node: TreapNode<T> | null, key: number): [TreapNode<T> | null, TreapNode<T> | null] {
    if (node === null) return [null, null]
    if (key <= node.key) {
      const [left, right] = this.splitNode(node.left, key)
      node.left = right
      return [left, node]
    }
    const [left, right] = this.splitNode(node.right, key)
    node.right = left
    return [node, right]
  }

  merge(other: Treap<T>): void {
    this.root = this.mergeNodes(this.root, other.root)
    this._size = this._size + other._size
    other.root = null
    other._size = 0
  }

  private mergeNodes(a: TreapNode<T> | null, b: TreapNode<T> | null): TreapNode<T> | null {
    if (a === null) return b
    if (b === null) return a
    if (a.priority > b.priority) {
      a.right = this.mergeNodes(a.right, b)
      return a
    }
    b.left = this.mergeNodes(a, b.left)
    return b
  }

  private countNodes(node: TreapNode<T> | null): number {
    if (node === null) return 0
    return 1 + this.countNodes(node.left) + this.countNodes(node.right)
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

  getStats(): TreapStats {
    const nodeCount = this._size
    const height = this.computeHeight(this.root)
    const isBalanced = this.checkBalanced(this.root) !== -1
    return { nodeCount, height, isBalanced }
  }

  private computeHeight(node: TreapNode<T> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  private checkBalanced(node: TreapNode<T> | null): number {
    if (node === null) return 0
    const leftH = this.checkBalanced(node.left)
    if (leftH === -1) return -1
    const rightH = this.checkBalanced(node.right)
    if (rightH === -1) return -1
    if (Math.abs(leftH - rightH) > 1) return -1
    return 1 + Math.max(leftH, rightH)
  }
}

export { DEFAULT_TREAP_OPTIONS } from './types.js'
export type { TreapNode, TreapOptions, TreapStats } from './types.js'
