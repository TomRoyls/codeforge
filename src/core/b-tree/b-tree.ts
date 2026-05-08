import type { BTreeNode, BTreeOptions, BTreeStats } from './types.js'
import { DEFAULT_BTREE_OPTIONS } from './types.js'

export class BTree<T> {
  private root: BTreeNode<T> | null = null
  private _size: number = 0
  private order: number

  constructor(options?: Partial<BTreeOptions>) {
    const opts: BTreeOptions = { ...DEFAULT_BTREE_OPTIONS, ...options }
    if (opts.order < 2) {
      throw new Error('B-Tree order must be at least 2')
    }
    this.order = opts.order
  }

  private createNode(): BTreeNode<T> {
    return { keys: [], values: [], children: [], isLeaf: true }
  }

  private findKeyIndex(keys: number[], key: number): number {
    let low = 0
    let high = keys.length
    while (low < high) {
      const mid = (low + high) >>> 1
      if (keys[mid]! < key) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }

  insert(key: number, value: T): void {
    if (this.root === null) {
      this.root = this.createNode()
      this.root.keys.push(key)
      this.root.values.push(value)
      this._size++
      return
    }
    const existing = this.searchNode(this.root, key)
    if (existing !== undefined) {
      this.updateValue(this.root, key, value)
      return
    }
    this._size++
    if (this.root.keys.length === 2 * this.order - 1) {
      const newRoot = this.createNode()
      newRoot.isLeaf = false
      newRoot.children.push(this.root)
      this.splitChild(newRoot, 0)
      this.insertNonFull(newRoot, key, value)
      this.root = newRoot
    } else {
      this.insertNonFull(this.root, key, value)
    }
  }

  private updateValue(node: BTreeNode<T>, key: number, value: T): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && node.keys[idx] === key) {
      node.values[idx] = value
      return
    }
    if (!node.isLeaf && node.children[idx] !== undefined) {
      this.updateValue(node.children[idx]!, key, value)
    }
  }

  private splitChild(parent: BTreeNode<T>, index: number): void {
    const order = this.order
    const child = parent.children[index]!
    const newNode = this.createNode()
    newNode.isLeaf = child.isLeaf
    const midIndex = order - 1
    const midKey = child.keys[midIndex]!
    const midValue = child.values[midIndex]!
    newNode.keys = child.keys.splice(midIndex + 1)
    newNode.values = child.values.splice(midIndex + 1)
    if (!child.isLeaf) {
      newNode.children = child.children.splice(midIndex + 1)
    }
    child.keys.splice(midIndex)
    child.values.splice(midIndex)
    parent.keys.splice(index, 0, midKey)
    parent.values.splice(index, 0, midValue)
    parent.children.splice(index + 1, 0, newNode)
  }

  private insertNonFull(node: BTreeNode<T>, key: number, value: T): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (node.isLeaf) {
      node.keys.splice(idx, 0, key)
      node.values.splice(idx, 0, value)
    } else {
      const child = node.children[idx]
      if (child !== undefined && child.keys.length === 2 * this.order - 1) {
        this.splitChild(node, idx)
        if (key > node.keys[idx]!) {
          this.insertNonFull(node.children[idx + 1]!, key, value)
        } else {
          this.insertNonFull(node.children[idx]!, key, value)
        }
      } else if (child !== undefined) {
        this.insertNonFull(child, key, value)
      }
    }
  }

  private searchNode(node: BTreeNode<T>, key: number): T | undefined {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && node.keys[idx] === key) {
      return node.values[idx]
    }
    if (node.isLeaf) return undefined
    const child = node.children[idx]
    if (child !== undefined) {
      return this.searchNode(child, key)
    }
    return undefined
  }

  search(key: number): T | undefined {
    if (this.root === null) return undefined
    return this.searchNode(this.root, key)
  }

  has(key: number): boolean {
    return this.search(key) !== undefined
  }

  delete(key: number): boolean {
    if (this.root === null) return false
    if (!this.has(key)) return false
    this._size--
    this.deleteFromNode(this.root, key)
    if (this.root.keys.length === 0) {
      if (this.root.isLeaf) {
        this.root = null
      } else {
        this.root = this.root.children[0]!
      }
    }
    return true
  }

  private deleteFromNode(node: BTreeNode<T>, key: number): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && node.keys[idx] === key) {
      if (node.isLeaf) {
        node.keys.splice(idx, 1)
        node.values.splice(idx, 1)
      } else {
        this.deleteFromInternalNode(node, idx)
      }
    } else {
      if (node.isLeaf) return
      const child = node.children[idx]!
      if (child.keys.length < this.order) {
        this.fillChild(node, idx)
      }
      const adjustedIdx = this.findKeyIndex(node.keys, key)
      this.deleteFromNode(node.children[adjustedIdx]!, key)
    }
  }

  private deleteFromInternalNode(node: BTreeNode<T>, idx: number): void {
    const targetKey = node.keys[idx]!
    const leftChild = node.children[idx]!
    const rightChild = node.children[idx + 1]!
    if (leftChild.keys.length >= this.order) {
      const [predKey, predValue] = this.getPredecessor(leftChild)!
      node.keys[idx] = predKey
      node.values[idx] = predValue
      this.deleteFromNode(leftChild, predKey)
    } else if (rightChild.keys.length >= this.order) {
      const [succKey, succValue] = this.getSuccessor(rightChild)!
      node.keys[idx] = succKey
      node.values[idx] = succValue
      this.deleteFromNode(rightChild, succKey)
    } else {
      this.mergeChildren(node, idx)
      this.deleteFromNode(node.children[idx]!, targetKey)
    }
  }

  private getPredecessor(node: BTreeNode<T>): [number, T] | undefined {
    if (node.isLeaf) {
      const lastIdx = node.keys.length - 1
      if (lastIdx >= 0) {
        return [node.keys[lastIdx]!, node.values[lastIdx]!]
      }
      return undefined
    }
    return this.getPredecessor(node.children[node.children.length - 1]!)
  }

  private getSuccessor(node: BTreeNode<T>): [number, T] | undefined {
    if (node.isLeaf) {
      if (node.keys.length > 0) {
        return [node.keys[0]!, node.values[0]!]
      }
      return undefined
    }
    return this.getSuccessor(node.children[0]!)
  }

  private fillChild(node: BTreeNode<T>, idx: number): void {
    if (idx > 0 && node.children[idx - 1] !== undefined && node.children[idx - 1]!.keys.length >= this.order) {
      this.borrowFromPrev(node, idx)
    } else if (idx < node.keys.length && node.children[idx + 1] !== undefined && node.children[idx + 1]!.keys.length >= this.order) {
      this.borrowFromNext(node, idx)
    } else {
      if (idx < node.keys.length) {
        this.mergeChildren(node, idx)
      } else {
        this.mergeChildren(node, idx - 1)
      }
    }
  }

  private borrowFromPrev(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!
    const sibling = node.children[idx - 1]!
    child.keys.unshift(node.keys[idx - 1]!)
    child.values.unshift(node.values[idx - 1]!)
    node.keys[idx - 1] = sibling.keys.pop()!
    node.values[idx - 1] = sibling.values.pop()!
    if (!child.isLeaf && sibling.children.length > 0) {
      child.children.unshift(sibling.children.pop()!)
    }
  }

  private borrowFromNext(node: BTreeNode<T>, idx: number): void {
    const child = node.children[idx]!
    const sibling = node.children[idx + 1]!
    child.keys.push(node.keys[idx]!)
    child.values.push(node.values[idx]!)
    node.keys[idx] = sibling.keys.shift()!
    node.values[idx] = sibling.values.shift()!
    if (!child.isLeaf && sibling.children.length > 0) {
      child.children.push(sibling.children.shift()!)
    }
  }

  private mergeChildren(node: BTreeNode<T>, idx: number): void {
    const left = node.children[idx]!
    const right = node.children[idx + 1]!
    left.keys.push(node.keys[idx]!)
    left.values.push(node.values[idx]!)
    left.keys.push(...right.keys)
    left.values.push(...right.values)
    if (!left.isLeaf) {
      left.children.push(...right.children)
    }
    node.keys.splice(idx, 1)
    node.values.splice(idx, 1)
    node.children.splice(idx + 1, 1)
  }

  getMin(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[0]!
    }
    return node.values[0]
  }

  getMax(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[node.children.length - 1]!
    }
    return node.values[node.values.length - 1]
  }

  private inOrderTraversal(node: BTreeNode<T> | null, result: [number, T][]): void {
    if (node === null) return
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.isLeaf && node.children[i] !== undefined) {
        this.inOrderTraversal(node.children[i]!, result)
      }
      result.push([node.keys[i]!, node.values[i]!])
    }
    if (!node.isLeaf && node.children[node.keys.length] !== undefined) {
      this.inOrderTraversal(node.children[node.keys.length]!, result)
    }
  }

  inOrder(): [number, T][] {
    const result: [number, T][] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  private rangeTraversal(node: BTreeNode<T> | null, min: number, max: number, result: [number, T][]): void {
    if (node === null) return
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.isLeaf && node.children[i] !== undefined) {
        this.rangeTraversal(node.children[i]!, min, max, result)
      }
      if (node.keys[i]! >= min && node.keys[i]! <= max) {
        result.push([node.keys[i]!, node.values[i]!])
      }
    }
    if (!node.isLeaf && node.children[node.keys.length] !== undefined) {
      this.rangeTraversal(node.children[node.keys.length]!, min, max, result)
    }
  }

  range(min: number, max: number): [number, T][] {
    if (min > max) return []
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

  private getHeightNode(node: BTreeNode<T> | null): number {
    if (node === null) return 0
    if (node.isLeaf) return 1
    return 1 + this.getHeightNode(node.children[0]!)
  }

  getHeight(): number {
    return this.getHeightNode(this.root)
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  private countNodes(node: BTreeNode<T> | null): number {
    if (node === null) return 0
    let count = 1
    for (let i = 0; i < node.children.length; i++) {
      count += this.countNodes(node.children[i]!)
    }
    return count
  }

  getStats(): BTreeStats {
    return {
      nodeCount: this.countNodes(this.root),
      height: this.getHeight(),
      keyCount: this._size,
      order: this.order,
    }
  }
}

export { DEFAULT_BTREE_OPTIONS } from './types.js'
export type { BTreeNode, BTreeOptions, BTreeStats } from './types.js'
