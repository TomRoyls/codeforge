import type { CountedBNode, CountedBTreeOptions } from './types.js'
import { DEFAULT_COUNTEDBTREE_OPTIONS } from './types.js'

export class CountedBTree<T> {
  private root: CountedBNode<T> | null = null
  private _size: number = 0
  private order: number

  constructor(options?: Partial<CountedBTreeOptions>) {
    const opts: CountedBTreeOptions = { ...DEFAULT_COUNTEDBTREE_OPTIONS, ...options }
    if (opts.order < 2) {
      throw new Error('B-Tree order must be at least 2')
    }
    this.order = opts.order
  }

  private createNode(): CountedBNode<T> {
    return { keys: [], values: [], children: [], counts: [] }
  }

  private isLeaf(node: CountedBNode<T>): boolean {
    return node.children.length === 0
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

  private computeSubtreeSize(node: CountedBNode<T>): number {
    if (node.children.length === 0) return node.keys.length
    let total = node.keys.length
    for (const c of node.counts) {
      total += c
    }
    return total
  }

  private updateCounts(node: CountedBNode<T>): void {
    node.counts = []
    for (let i = 0; i < node.children.length; i++) {
      node.counts[i] = this.computeSubtreeSize(node.children[i]!)
    }
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
      newRoot.children.push(this.root)
      this.splitChild(newRoot, 0)
      this.insertNonFull(newRoot, key, value)
      this.root = newRoot
    } else {
      this.insertNonFull(this.root, key, value)
    }
  }

  private updateValue(node: CountedBNode<T>, key: number, value: T): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && node.keys[idx] === key) {
      node.values[idx] = value
      return
    }
    if (!this.isLeaf(node) && node.children[idx] !== undefined) {
      this.updateValue(node.children[idx]!, key, value)
    }
  }

  private splitChild(parent: CountedBNode<T>, index: number): void {
    const order = this.order
    const child = parent.children[index]!
    const newNode = this.createNode()
    const midIndex = order - 1
    const midKey = child.keys[midIndex]!
    const midValue = child.values[midIndex]!
    newNode.keys = child.keys.splice(midIndex + 1)
    newNode.values = child.values.splice(midIndex + 1)
    if (child.children.length > 0) {
      newNode.children = child.children.splice(midIndex + 1)
      newNode.counts = child.counts.splice(midIndex + 1)
    }
    child.keys.splice(midIndex)
    child.values.splice(midIndex)
    parent.keys.splice(index, 0, midKey)
    parent.values.splice(index, 0, midValue)
    parent.children.splice(index + 1, 0, newNode)
    parent.counts[index] = this.computeSubtreeSize(child)
    parent.counts.splice(index + 1, 0, this.computeSubtreeSize(newNode))
  }

  private insertNonFull(node: CountedBNode<T>, key: number, value: T): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (this.isLeaf(node)) {
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
      this.updateCounts(node)
    }
  }

  private searchNode(node: CountedBNode<T>, key: number): T | undefined {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && node.keys[idx] === key) {
      return node.values[idx]
    }
    if (this.isLeaf(node)) return undefined
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
      if (this.isLeaf(this.root)) {
        this.root = null
      } else {
        this.root = this.root.children[0]!
      }
    }
    return true
  }

  private deleteFromNode(node: CountedBNode<T>, key: number): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && node.keys[idx] === key) {
      if (this.isLeaf(node)) {
        node.keys.splice(idx, 1)
        node.values.splice(idx, 1)
      } else {
        this.deleteFromInternalNode(node, idx)
        this.updateCounts(node)
      }
    } else {
      if (this.isLeaf(node)) return
      const child = node.children[idx]!
      if (child.keys.length < this.order) {
        this.fillChild(node, idx)
      }
      const adjustedIdx = this.findKeyIndex(node.keys, key)
      this.deleteFromNode(node.children[adjustedIdx]!, key)
      this.updateCounts(node)
    }
  }

  private deleteFromInternalNode(node: CountedBNode<T>, idx: number): void {
    const targetKey = node.keys[idx]!
    const leftChild = node.children[idx]!
    const rightChild = node.children[idx + 1]!
    if (leftChild.keys.length >= this.order) {
      const [predKey, predValue] = this.getPredecessor(leftChild)!
      node.keys[idx] = predKey
      node.values[idx] = predValue
      this.deleteFromNode(leftChild, predKey)
      this.updateCounts(node)
    } else if (rightChild.keys.length >= this.order) {
      const [succKey, succValue] = this.getSuccessor(rightChild)!
      node.keys[idx] = succKey
      node.values[idx] = succValue
      this.deleteFromNode(rightChild, succKey)
      this.updateCounts(node)
    } else {
      this.mergeChildren(node, idx)
      this.deleteFromNode(node.children[idx]!, targetKey)
      this.updateCounts(node)
    }
  }

  private getPredecessor(node: CountedBNode<T>): [number, T] | undefined {
    if (this.isLeaf(node)) {
      const lastIdx = node.keys.length - 1
      if (lastIdx >= 0) {
        return [node.keys[lastIdx]!, node.values[lastIdx]!]
      }
      return undefined
    }
    return this.getPredecessor(node.children[node.children.length - 1]!)
  }

  private getSuccessor(node: CountedBNode<T>): [number, T] | undefined {
    if (this.isLeaf(node)) {
      if (node.keys.length > 0) {
        return [node.keys[0]!, node.values[0]!]
      }
      return undefined
    }
    return this.getSuccessor(node.children[0]!)
  }

  private fillChild(node: CountedBNode<T>, idx: number): void {
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

  private borrowFromPrev(node: CountedBNode<T>, idx: number): void {
    const child = node.children[idx]!
    const sibling = node.children[idx - 1]!
    child.keys.unshift(node.keys[idx - 1]!)
    child.values.unshift(node.values[idx - 1]!)
    node.keys[idx - 1] = sibling.keys.pop()!
    node.values[idx - 1] = sibling.values.pop()!
    if (!this.isLeaf(child) && sibling.children.length > 0) {
      child.children.unshift(sibling.children.pop()!)
      child.counts.unshift(sibling.counts.pop()!)
    }
    this.updateCounts(node)
  }

  private borrowFromNext(node: CountedBNode<T>, idx: number): void {
    const child = node.children[idx]!
    const sibling = node.children[idx + 1]!
    child.keys.push(node.keys[idx]!)
    child.values.push(node.values[idx]!)
    node.keys[idx] = sibling.keys.shift()!
    node.values[idx] = sibling.values.shift()!
    if (!this.isLeaf(child) && sibling.children.length > 0) {
      child.children.push(sibling.children.shift()!)
      child.counts.push(sibling.counts.shift()!)
    }
    this.updateCounts(node)
  }

  private mergeChildren(node: CountedBNode<T>, idx: number): void {
    const left = node.children[idx]!
    const right = node.children[idx + 1]!
    left.keys.push(node.keys[idx]!)
    left.values.push(node.values[idx]!)
    left.keys.push(...right.keys)
    left.values.push(...right.values)
    if (!this.isLeaf(left)) {
      left.children.push(...right.children)
      left.counts.push(...right.counts)
    }
    node.keys.splice(idx, 1)
    node.values.splice(idx, 1)
    node.children.splice(idx + 1, 1)
    node.counts.splice(idx + 1, 1)
    this.updateCounts(node)
  }

  at(index: number): T | undefined {
    if (this.root === null || index < 0 || index >= this._size) return undefined
    return this.atNode(this.root, index)
  }

  private atNode(node: CountedBNode<T>, index: number): T | undefined {
    for (let i = 0; i < node.keys.length; i++) {
      const leftSize = i < node.counts.length ? node.counts[i]! : 0
      if (index < leftSize) {
        return this.atNode(node.children[i]!, index)
      }
      if (index === leftSize) {
        return node.values[i]
      }
      index -= (leftSize + 1)
    }
    if (node.children.length > node.keys.length) {
      return this.atNode(node.children[node.keys.length]!, index)
    }
    return undefined
  }

  indexOf(key: number): number {
    if (this.root === null) return -1
    return this.indexOfNode(this.root, key)
  }

  private indexOfNode(node: CountedBNode<T>, key: number): number {
    let offset = 0
    for (let i = 0; i < node.keys.length; i++) {
      const leftSize = i < node.counts.length ? node.counts[i]! : 0
      if (key < node.keys[i]!) {
        if (i < node.children.length) {
          const childResult = this.indexOfNode(node.children[i]!, key)
          return childResult === -1 ? -1 : offset + childResult
        }
        return -1
      }
      if (key === node.keys[i]!) {
        return offset + leftSize
      }
      offset += (leftSize + 1)
    }
    if (node.children.length > node.keys.length) {
      const childResult = this.indexOfNode(node.children[node.keys.length]!, key)
      return childResult === -1 ? -1 : offset + childResult
    }
    return -1
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
  }

  min(): { key: number, value: T } | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.children.length > 0) {
      node = node.children[0]!
    }
    if (node.keys.length === 0) return undefined
    return { key: node.keys[0]!, value: node.values[0]! }
  }

  max(): { key: number, value: T } | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.children.length > 0) {
      node = node.children[node.children.length - 1]!
    }
    const lastIdx = node.keys.length - 1
    if (lastIdx < 0) return undefined
    return { key: node.keys[lastIdx]!, value: node.values[lastIdx]! }
  }

  forEach(callback: (key: number, value: T, index: number) => void): void {
    if (this.root === null) return
    this.forEachNode(this.root, callback, 0)
  }

  private forEachNode(node: CountedBNode<T>, callback: (key: number, value: T, index: number) => void, offset: number): number {
    let currentOffset = offset
    for (let i = 0; i < node.keys.length; i++) {
      if (i < node.children.length) {
        currentOffset = this.forEachNode(node.children[i]!, callback, currentOffset)
      }
      callback(node.keys[i]!, node.values[i]!, currentOffset)
      currentOffset++
    }
    if (node.children.length > node.keys.length) {
      currentOffset = this.forEachNode(node.children[node.keys.length]!, callback, currentOffset)
    }
    return currentOffset
  }

  range(min: number, max: number): Array<{ key: number, value: T }> {
    if (min > max) return []
    const result: Array<{ key: number, value: T }> = []
    if (this.root !== null) {
      this.rangeNode(this.root, min, max, result)
    }
    return result
  }

  private rangeNode(node: CountedBNode<T>, min: number, max: number, result: Array<{ key: number, value: T }>): void {
    for (let i = 0; i < node.keys.length; i++) {
      if (i < node.children.length) {
        this.rangeNode(node.children[i]!, min, max, result)
      }
      if (node.keys[i]! >= min && node.keys[i]! <= max) {
        result.push({ key: node.keys[i]!, value: node.values[i]! })
      }
    }
    if (node.children.length > node.keys.length) {
      this.rangeNode(node.children[node.keys.length]!, min, max, result)
    }
  }
}

export { DEFAULT_COUNTEDBTREE_OPTIONS } from './types.js'
export type { CountedBNode, CountedBTreeOptions } from './types.js'
