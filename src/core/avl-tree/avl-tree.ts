import type { AVLNode, AVLTreeOptions, AVLTreeStats } from './types.js'
import { DEFAULT_AVL_TREE_OPTIONS } from './types.js'

export class AVLTree<T> {
  private root: AVLNode<T> | null = null
  private _size: number = 0
  private allowDuplicates: boolean

  constructor(options?: Partial<AVLTreeOptions>) {
    const opts: AVLTreeOptions = { ...DEFAULT_AVL_TREE_OPTIONS, ...options }
    this.allowDuplicates = opts.allowDuplicates
  }

  private height(node: AVLNode<T> | null): number {
    return node === null ? 0 : node.height
  }

  private updateHeight(node: AVLNode<T>): void {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right))
  }

  private getBalance(node: AVLNode<T>): number {
    return this.height(node.left) - this.height(node.right)
  }

  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateHeight(y)
    this.updateHeight(x)
    return x
  }

  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateHeight(x)
    this.updateHeight(y)
    return y
  }

  private balance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node)
    const balanceFactor = this.getBalance(node)
    if (balanceFactor > 1) {
      if (this.getBalance(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }
    if (balanceFactor < -1) {
      if (this.getBalance(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }
    return node
  }

  private insertNode(node: AVLNode<T> | null, key: number, value: T): AVLNode<T> {
    if (node === null) {
      this._size++
      return { key, value, left: null, right: null, height: 1 }
    }
    if (key < node.key) {
      node.left = this.insertNode(node.left, key, value)
    } else if (key > node.key) {
      node.right = this.insertNode(node.right, key, value)
    } else {
      if (this.allowDuplicates) {
        node.right = this.insertNode(node.right, key, value)
      } else {
        node.value = value
      }
      return node
    }
    return this.balance(node)
  }

  insert(key: number, value: T): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private searchNode(node: AVLNode<T> | null, key: number): T | undefined {
    if (node === null) return undefined
    if (key < node.key) return this.searchNode(node.left, key)
    if (key > node.key) return this.searchNode(node.right, key)
    return node.value
  }

  search(key: number): T | undefined {
    return this.searchNode(this.root, key)
  }

  has(key: number): boolean {
    return this.search(key) !== undefined
  }

  private findMinNode(node: AVLNode<T>): AVLNode<T> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private findMaxNode(node: AVLNode<T>): AVLNode<T> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  private deleteNode(node: AVLNode<T> | null, key: number): AVLNode<T> | null {
    if (node === null) return null
    if (key < node.key) {
      node.left = this.deleteNode(node.left, key)
    } else if (key > node.key) {
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

  delete(key: number): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
    return true
  }

  getMin(): T | undefined {
    if (this.root === null) return undefined
    return this.findMinNode(this.root).value
  }

  getMax(): T | undefined {
    if (this.root === null) return undefined
    return this.findMaxNode(this.root).value
  }

  private inOrderTraversal(node: AVLNode<T> | null, result: [number, T][]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inOrderTraversal(node.right, result)
  }

  inOrder(): [number, T][] {
    const result: [number, T][] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  private preOrderTraversal(node: AVLNode<T> | null, result: [number, T][]): void {
    if (node === null) return
    result.push([node.key, node.value])
    this.preOrderTraversal(node.left, result)
    this.preOrderTraversal(node.right, result)
  }

  preOrder(): [number, T][] {
    const result: [number, T][] = []
    this.preOrderTraversal(this.root, result)
    return result
  }

  private postOrderTraversal(node: AVLNode<T> | null, result: [number, T][]): void {
    if (node === null) return
    this.postOrderTraversal(node.left, result)
    this.postOrderTraversal(node.right, result)
    result.push([node.key, node.value])
  }

  postOrder(): [number, T][] {
    const result: [number, T][] = []
    this.postOrderTraversal(this.root, result)
    return result
  }

  private rangeTraversal(node: AVLNode<T> | null, min: number, max: number, result: [number, T][]): void {
    if (node === null) return
    if (min < node.key) this.rangeTraversal(node.left, min, max, result)
    if (node.key >= min && node.key <= max) result.push([node.key, node.value])
    if (max > node.key) this.rangeTraversal(node.right, min, max, result)
  }

  range(min: number, max: number): [number, T][] {
    const result: [number, T][] = []
    this.rangeTraversal(this.root, min, max, result)
    return result
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this.root === null
  }

  getHeight(): number {
    return this.height(this.root)
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  private isBalancedNode(node: AVLNode<T> | null): boolean {
    if (node === null) return true
    const bf = this.getBalance(node)
    if (bf < -1 || bf > 1) return false
    return this.isBalancedNode(node.left) && this.isBalancedNode(node.right)
  }

  getStats(): AVLTreeStats {
    const inOrder = this.inOrder()
    const minKey = inOrder.length > 0 ? inOrder[0]![0] : null
    const maxKey = inOrder.length > 0 ? inOrder[inOrder.length - 1]![0] : null
    return {
      nodeCount: this._size,
      height: this.getHeight(),
      isBalanced: this.isBalancedNode(this.root),
      minKey,
      maxKey,
    }
  }
}

export { DEFAULT_AVL_TREE_OPTIONS } from './types.js'
export type { AVLNode, AVLTreeOptions, AVLTreeStats } from './types.js'
