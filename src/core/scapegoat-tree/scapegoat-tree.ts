import type { ScapegoatNode, ScapegoatTreeOptions } from './types.js'
import { DEFAULT_SCAPEGOAT_OPTIONS } from './types.js'

export class ScapegoatTree<T> {
  private root: ScapegoatNode<T> | null = null
  private _size: number = 0
  private maxTreeSize: number = 0
  private alpha: number

  constructor(options?: Partial<ScapegoatTreeOptions>) {
    const opts: ScapegoatTreeOptions = { ...DEFAULT_SCAPEGOAT_OPTIONS, ...options }
    this.alpha = opts.alpha
  }

  private subtreeSize(node: ScapegoatNode<T> | null): number {
    if (node === null) return 0
    return 1 + this.subtreeSize(node.left) + this.subtreeSize(node.right)
  }

  private isAlphaWeightBalanced(node: ScapegoatNode<T>): boolean {
    const leftSize = this.subtreeSize(node.left)
    const rightSize = this.subtreeSize(node.right)
    const totalSize = leftSize + rightSize + 1
    return leftSize <= this.alpha * totalSize && rightSize <= this.alpha * totalSize
  }

  private flatten(node: ScapegoatNode<T> | null, arr: ScapegoatNode<T>[]): void {
    if (node === null) return
    this.flatten(node.left, arr)
    arr.push(node)
    this.flatten(node.right, arr)
  }

  private buildBalanced(arr: ScapegoatNode<T>[], start: number, end: number): ScapegoatNode<T> | null {
    if (start > end) return null
    const mid = Math.floor((start + end) / 2)
    const node = arr[mid]!
    node.left = this.buildBalanced(arr, start, mid - 1)
    node.right = this.buildBalanced(arr, mid + 1, end)
    return node
  }

  private rebuildSubtree(node: ScapegoatNode<T>): ScapegoatNode<T> {
    const arr: ScapegoatNode<T>[] = []
    this.flatten(node, arr)
    return this.buildBalanced(arr, 0, arr.length - 1)!
  }

  private findScapegoatOnPath(
    path: ScapegoatNode<T>[],
  ): number {
    for (let i = 0; i < path.length; i++) {
      if (!this.isAlphaWeightBalanced(path[i]!)) {
        return i
      }
    }
    return -1
  }

  private insertWithPath(
    node: ScapegoatNode<T> | null,
    key: number,
    value: T,
    path: ScapegoatNode<T>[],
  ): ScapegoatNode<T> {
    if (node === null) {
      this._size++
      return { key, value, left: null, right: null }
    }
    path.push(node)
    if (key < node.key) {
      node.left = this.insertWithPath(node.left, key, value, path)
    } else if (key > node.key) {
      node.right = this.insertWithPath(node.right, key, value, path)
    } else {
      node.value = value
    }
    return node
  }

  insert(key: number, value: T): void {
    const sizeBefore = this._size
    const path: ScapegoatNode<T>[] = []
    this.root = this.insertWithPath(this.root, key, value, path)
    if (this._size > sizeBefore) {
      this.maxTreeSize = Math.max(this.maxTreeSize, this._size)
      const scapegoatIndex = this.findScapegoatOnPath(path)
      if (scapegoatIndex >= 0) {
        const scapegoat = path[scapegoatIndex]!
        const rebuilt = this.rebuildSubtree(scapegoat)
        if (scapegoatIndex === 0) {
          this.root = rebuilt
        } else {
          const parent = path[scapegoatIndex - 1]!
          if (parent.left === scapegoat) {
            parent.left = rebuilt
          } else {
            parent.right = rebuilt
          }
        }
      }
    }
  }

  private searchNode(node: ScapegoatNode<T> | null, key: number): T | undefined {
    if (node === null) return undefined
    if (key < node.key) return this.searchNode(node.left, key)
    if (key > node.key) return this.searchNode(node.right, key)
    return node.value
  }

  search(key: number): T | undefined {
    return this.searchNode(this.root, key)
  }

  private hasNode(node: ScapegoatNode<T> | null, key: number): boolean {
    if (node === null) return false
    if (key < node.key) return this.hasNode(node.left, key)
    if (key > node.key) return this.hasNode(node.right, key)
    return true
  }

  has(key: number): boolean {
    return this.hasNode(this.root, key)
  }

  private findMinNode(node: ScapegoatNode<T>): ScapegoatNode<T> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private findMaxNode(node: ScapegoatNode<T>): ScapegoatNode<T> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  private deleteNode(node: ScapegoatNode<T> | null, key: number): ScapegoatNode<T> | null {
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
    return node
  }

  delete(key: number): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
    if (this.root !== null && (this._size <= this.alpha * this.maxTreeSize || !this.isBalanced())) {
      this.root = this.rebuildSubtree(this.root)
      this.maxTreeSize = this._size
    }
    return true
  }

  min(): { key: number; value: T } | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    return { key: node.key, value: node.value }
  }

  max(): { key: number; value: T } | undefined {
    if (this.root === null) return undefined
    const node = this.findMaxNode(this.root)
    return { key: node.key, value: node.value }
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
    this._size = 0
    this.maxTreeSize = 0
  }

  forEach(callback: (key: number, value: T) => void): void {
    const traverse = (node: ScapegoatNode<T> | null): void => {
      if (node === null) return
      traverse(node.left)
      callback(node.key, node.value)
      traverse(node.right)
    }
    traverse(this.root)
  }

  toArray(): Array<{ key: number; value: T }> {
    const result: Array<{ key: number; value: T }> = []
    this.forEach((key, value) => {
      result.push({ key, value })
    })
    return result
  }

  private computeHeight(node: ScapegoatNode<T> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  height(): number {
    return this.computeHeight(this.root)
  }

  private isBalancedNode(node: ScapegoatNode<T> | null): boolean {
    if (node === null) return true
    if (!this.isAlphaWeightBalanced(node)) return false
    return this.isBalancedNode(node.left) && this.isBalancedNode(node.right)
  }

  isBalanced(): boolean {
    return this.isBalancedNode(this.root)
  }
}

export { DEFAULT_SCAPEGOAT_OPTIONS } from './types.js'
export type { ScapegoatNode, ScapegoatTreeOptions } from './types.js'
