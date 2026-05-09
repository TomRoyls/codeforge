import type { TwoThreeNode, SplitResult } from './types.js'
import { DEFAULT_COMPARE } from './types.js'

export class TwoThreeTree<T> {
  private root: TwoThreeNode<T> | null = null
  private _size: number = 0
  private compare: (a: T, b: T) => number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = (compare ?? DEFAULT_COMPARE) as (a: T, b: T) => number
  }

  private createNode(key: T): TwoThreeNode<T> {
    return { keys: [key], children: [] }
  }

  private findKeyIndex(keys: T[], key: T): number {
    let low = 0
    let high = keys.length
    while (low < high) {
      const mid = (low + high) >>> 1
      if (this.compare(keys[mid]!, key) < 0) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }

  private isLeaf(node: TwoThreeNode<T>): boolean {
    return node.children.length === 0
  }

  insert(key: T): void {
    if (this.root === null) {
      this.root = this.createNode(key)
      this._size++
      return
    }
    if (this.searchNode(this.root, key)) {
      return
    }
    this._size++
    const result = this.insertRec(this.root, key)
    if (result !== null) {
      const newRoot: TwoThreeNode<T> = {
        keys: [result.key],
        children: [this.root!, result.rightNode],
      }
      this.root = newRoot
    }
  }

  private insertRec(node: TwoThreeNode<T>, key: T): SplitResult<T> | null {
    const idx = this.findKeyIndex(node.keys, key)

    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      return null
    }

    if (this.isLeaf(node)) {
      node.keys.splice(idx, 0, key)
      return this.splitIfNeeded(node)
    }

    const child = node.children[idx]!
    const result = this.insertRec(child, key)
    if (result === null) return null

    const insertIdx = this.findKeyIndex(node.keys, result.key)
    node.keys.splice(insertIdx, 0, result.key)
    node.children.splice(insertIdx + 1, 0, result.rightNode)

    return this.splitIfNeeded(node)
  }

  private splitIfNeeded(node: TwoThreeNode<T>): SplitResult<T> | null {
    if (node.keys.length <= 2) return null

    const promotedKey = node.keys[1]!
    const rightNode: TwoThreeNode<T> = {
      keys: [node.keys[2]!],
      children: [],
    }
    if (node.children.length > 0) {
      rightNode.children = node.children.splice(2)
    }
    node.keys.length = 1
    node.children.length = node.children.length > 0 ? 2 : 0

    return { key: promotedKey, rightNode }
  }

  private searchNode(node: TwoThreeNode<T>, key: T): boolean {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      return true
    }
    if (this.isLeaf(node)) return false
    return this.searchNode(node.children[idx]!, key)
  }

  search(key: T): boolean {
    if (this.root === null) return false
    return this.searchNode(this.root, key)
  }

  contains(key: T): boolean {
    return this.search(key)
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.children.length > 0) {
      node = node.children[0]!
    }
    return node.keys[0]
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.children.length > 0) {
      node = node.children[node.children.length - 1]!
    }
    return node.keys[node.keys.length - 1]
  }

  private inorderRec(node: TwoThreeNode<T> | null, result: T[]): void {
    if (node === null) return
    if (this.isLeaf(node)) {
      for (let i = 0; i < node.keys.length; i++) {
        result.push(node.keys[i]!)
      }
      return
    }
    for (let i = 0; i < node.keys.length; i++) {
      this.inorderRec(node.children[i]!, result)
      result.push(node.keys[i]!)
    }
    this.inorderRec(node.children[node.keys.length]!, result)
  }

  inorder(): T[] {
    const result: T[] = []
    this.inorderRec(this.root, result)
    return result
  }

  private preorderRec(node: TwoThreeNode<T> | null, result: T[]): void {
    if (node === null) return
    for (let i = 0; i < node.keys.length; i++) {
      result.push(node.keys[i]!)
    }
    for (let i = 0; i < node.children.length; i++) {
      this.preorderRec(node.children[i]!, result)
    }
  }

  preorder(): T[] {
    const result: T[] = []
    this.preorderRec(this.root, result)
    return result
  }

  private rangeSearchRec(node: TwoThreeNode<T> | null, low: T, high: T, result: T[]): void {
    if (node === null) return
    for (let i = 0; i < node.keys.length; i++) {
      if (!this.isLeaf(node)) {
        this.rangeSearchRec(node.children[i]!, low, high, result)
      }
      const cmpLow = this.compare(node.keys[i]!, low)
      const cmpHigh = this.compare(node.keys[i]!, high)
      if (cmpLow >= 0 && cmpHigh <= 0) {
        result.push(node.keys[i]!)
      }
    }
    if (!this.isLeaf(node)) {
      this.rangeSearchRec(node.children[node.keys.length]!, low, high, result)
    }
  }

  rangeSearch(low: T, high: T): T[] {
    const result: T[] = []
    this.rangeSearchRec(this.root, low, high, result)
    return result
  }

  successor(key: T): T | undefined {
    let result: T | undefined
    let found = false
    this.successorRec(this.root, key, (k) => {
      result = k
      found = true
    })
    return found ? result : undefined
  }

  private successorRec(
    node: TwoThreeNode<T> | null,
    key: T,
    callback: (k: T) => void,
  ): T | undefined {
    if (node === null) return undefined
    for (let i = 0; i < node.keys.length; i++) {
      if (!this.isLeaf(node)) {
        const childResult = this.successorRec(node.children[i]!, key, callback)
        if (childResult !== undefined) return childResult
      }
      if (this.compare(node.keys[i]!, key) > 0) {
        callback(node.keys[i]!)
        return node.keys[i]!
      }
    }
    if (!this.isLeaf(node)) {
      return this.successorRec(node.children[node.keys.length]!, key, callback)
    }
    return undefined
  }

  predecessor(key: T): T | undefined {
    let result: T | undefined
    this.predecessorRec(this.root, key, (k) => {
      result = k
    })
    return result
  }

  private predecessorRec(
    node: TwoThreeNode<T> | null,
    key: T,
    callback: (k: T) => void,
  ): T | undefined {
    if (node === null) return undefined
    for (let i = 0; i < node.keys.length; i++) {
      if (this.compare(node.keys[i]!, key) >= 0) {
        if (!this.isLeaf(node)) {
          this.predecessorRec(node.children[i]!, key, callback)
        }
        return undefined
      }
      if (!this.isLeaf(node)) {
        this.predecessorRec(node.children[i]!, key, callback)
      }
      callback(node.keys[i]!)
    }
    if (!this.isLeaf(node)) {
      this.predecessorRec(node.children[node.keys.length]!, key, callback)
    }
    return undefined
  }

  delete(key: T): boolean {
    if (this.root === null) return false
    if (!this.search(key)) return false
    this._size--
    this.deleteRec(this.root, key)
    if (this.root.keys.length === 0) {
      if (this.isLeaf(this.root)) {
        this.root = null
      } else {
        this.root = this.root.children[0]!
      }
    }
    return true
  }

  private deleteRec(node: TwoThreeNode<T>, key: T): void {
    const idx = this.findKeyIndex(node.keys, key)

    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      if (this.isLeaf(node)) {
        node.keys.splice(idx, 1)
      } else {
        this.deleteFromInternal(node, idx)
      }
      return
    }

    if (this.isLeaf(node)) return

    this.deleteRec(node.children[idx]!, key)
    this.fixChildUnderflow(node)
  }

  private deleteFromInternal(node: TwoThreeNode<T>, idx: number): void {
    const leftChild = node.children[idx]!
    const rightChild = node.children[idx + 1]!

    if (leftChild.keys.length >= 2) {
      const predKey = this.extractPredecessor(leftChild)
      node.keys[idx] = predKey
    } else if (rightChild.keys.length >= 2) {
      const succKey = this.extractSuccessor(rightChild)
      node.keys[idx] = succKey
    } else {
      const keyToDelete = node.keys[idx]!
      this.mergeChildren(node, idx)
      this.deleteRec(node.children[idx]!, keyToDelete)
      this.fixChildUnderflow(node)
    }
  }

  private extractPredecessor(node: TwoThreeNode<T>): T {
    if (this.isLeaf(node)) {
      return node.keys.pop()!
    }
    const result = this.extractPredecessor(node.children[node.children.length - 1]!)
    this.fixChildUnderflow(node)
    return result
  }

  private extractSuccessor(node: TwoThreeNode<T>): T {
    if (this.isLeaf(node)) {
      return node.keys.shift()!
    }
    const result = this.extractSuccessor(node.children[0]!)
    this.fixChildUnderflow(node)
    return result
  }

  private fixChildUnderflow(node: TwoThreeNode<T>): void {
    let i = 0
    while (i < node.children.length) {
      if (node.children[i]!.keys.length === 0) {
        if (i > 0 && node.children[i - 1]!.keys.length >= 2) {
          this.borrowFromLeft(node, i)
        } else if (i < node.children.length - 1 && node.children[i + 1]!.keys.length >= 2) {
          this.borrowFromRight(node, i)
        } else if (i > 0) {
          this.mergeChildren(node, i - 1)
          continue
        } else if (i < node.children.length - 1) {
          this.mergeChildren(node, i)
          continue
        }
      }
      i++
    }
  }

  private borrowFromLeft(node: TwoThreeNode<T>, childIdx: number): void {
    const child = node.children[childIdx]!
    const leftSibling = node.children[childIdx - 1]!

    child.keys.unshift(node.keys[childIdx - 1]!)
    node.keys[childIdx - 1] = leftSibling.keys.pop()!

    if (leftSibling.children.length > 0) {
      child.children.unshift(leftSibling.children.pop()!)
    }
  }

  private borrowFromRight(node: TwoThreeNode<T>, childIdx: number): void {
    const child = node.children[childIdx]!
    const rightSibling = node.children[childIdx + 1]!

    child.keys.push(node.keys[childIdx]!)
    node.keys[childIdx] = rightSibling.keys.shift()!

    if (rightSibling.children.length > 0) {
      child.children.push(rightSibling.children.shift()!)
    }
  }

  private mergeChildren(node: TwoThreeNode<T>, idx: number): void {
    const left = node.children[idx]!
    const right = node.children[idx + 1]!

    left.keys.push(node.keys[idx]!)
    left.keys.push(...right.keys)
    left.children.push(...right.children)

    node.keys.splice(idx, 1)
    node.children.splice(idx + 1, 1)
  }

  size(): number {
    return this._size
  }

  height(): number {
    return this.computeHeight(this.root)
  }

  private computeHeight(node: TwoThreeNode<T> | null): number {
    if (node === null) return 0
    if (this.isLeaf(node)) return 1
    return 1 + this.computeHeight(node.children[0]!)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  clone(): TwoThreeTree<T> {
    const cloned = new TwoThreeTree<T>(this.compare)
    cloned._size = this._size
    cloned.root = this.cloneNode(this.root)
    return cloned
  }

  private cloneNode(node: TwoThreeNode<T> | null): TwoThreeNode<T> | null {
    if (node === null) return null
    return {
      keys: [...node.keys],
      children: node.children.map((c) => this.cloneNode(c)!),
    }
  }

  toArray(): T[] {
    return this.inorder()
  }

  static fromArray<T>(arr: T[], compare?: (a: T, b: T) => number): TwoThreeTree<T> {
    const tree = new TwoThreeTree<T>(compare)
    for (const item of arr) {
      tree.insert(item)
    }
    return tree
  }
}

export { DEFAULT_COMPARE } from './types.js'
export type { TwoThreeNode, SplitResult } from './types.js'
