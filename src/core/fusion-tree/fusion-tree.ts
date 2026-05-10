import type { FusionTreeOptions, FusionTreeStatistics, FusionNode } from './types.js'
import { DEFAULT_FUSION_TREE_OPTIONS } from './types.js'

export class FusionTree {
  private root: FusionNode
  private _size: number
  private degree: number
  private compare: (a: number, b: number) => number
  private stats: { inserts: number; deletes: number; searches: number; rebalances: number }
  private maxKeys: number

  constructor(options?: FusionTreeOptions) {
    const merged = { ...DEFAULT_FUSION_TREE_OPTIONS, ...options }
    this.degree = merged.degree
    this.compare = merged.comparator
    this.maxKeys = 2 * this.degree - 1
    this.root = this.createNode(true)
    this._size = 0
    this.stats = { inserts: 0, deletes: 0, searches: 0, rebalances: 0 }
  }

  private createNode(leaf: boolean): FusionNode {
    return { keys: [], children: [], leaf }
  }

  insert(key: number): void {
    this.stats.inserts++
    const root = this.root
    if (root.keys.length === this.maxKeys) {
      const newRoot = this.createNode(false)
      newRoot.children.push(this.root)
      this.splitChild(newRoot, 0)
      this.root = newRoot
      this.stats.rebalances++
    }
    this.insertNonFull(this.root, key)
  }

  private insertNonFull(node: FusionNode, key: number): void {
    let i = node.keys.length - 1
    if (node.leaf) {
      while (i >= 0 && this.compare(key, node.keys[i]!) < 0) {
        i--
      }
      if (i >= 0 && this.compare(key, node.keys[i]!) === 0) {
        return
      }
      node.keys.splice(i + 1, 0, key)
      this._size++
    } else {
      while (i >= 0 && this.compare(key, node.keys[i]!) < 0) {
        i--
      }
      if (i >= 0 && this.compare(key, node.keys[i]!) === 0) {
        return
      }
      const childIdx = i + 1
      const child = node.children[childIdx]!
      if (child.keys.length === this.maxKeys) {
        this.splitChild(node, childIdx)
        this.stats.rebalances++
        if (this.compare(key, node.keys[childIdx]!) > 0) {
          i = childIdx
        } else if (this.compare(key, node.keys[childIdx]!) === 0) {
          return
        } else {
          i = childIdx - 1
        }
      }
      this.insertNonFull(node.children[i + 1]!, key)
    }
  }

  private splitChild(parent: FusionNode, index: number): void {
    const fullChild = parent.children[index]!
    const newChild = this.createNode(fullChild.leaf)
    const midKey = fullChild.keys[this.degree - 1]!
    newChild.keys = fullChild.keys.splice(this.degree)
    fullChild.keys.splice(this.degree - 1, 1)
    if (!fullChild.leaf) {
      newChild.children = fullChild.children.splice(this.degree)
    }
    parent.keys.splice(index, 0, midKey)
    parent.children.splice(index + 1, 0, newChild)
  }

  delete(key: number): boolean {
    this.stats.deletes++
    const result = this.deleteFromNode(this.root, key)
    if (result) {
      this._size--
      if (!this.root.leaf && this.root.keys.length === 0) {
        this.root = this.root.children[0]!
        this.stats.rebalances++
      }
    }
    return result
  }

  private deleteFromNode(node: FusionNode, key: number): boolean {
    const idx = this.findKeyIndex(node, key)
    if (idx < node.keys.length && this.compare(key, node.keys[idx]!) === 0) {
      if (node.leaf) {
        node.keys.splice(idx, 1)
        return true
      }
      return this.deleteFromInternalNode(node, idx, key)
    }
    if (node.leaf) {
      return false
    }
    const isLast = idx === node.keys.length
    const child = node.children[idx]!
    if (child.keys.length < this.degree) {
      this.fill(node, idx)
      this.stats.rebalances++
    }
    const adjustedIdx = isLast && idx > node.keys.length ? idx - 1 : idx
    return this.deleteFromNode(node.children[adjustedIdx]!, key)
  }

  private deleteFromInternalNode(node: FusionNode, idx: number, _key: number): boolean {
    const child = node.children[idx]!
    if (child.keys.length >= this.degree) {
      const pred = this.getPredecessor(node, idx)
      node.keys[idx] = pred
      return this.deleteFromNode(child, pred)
    }
    const nextChild = node.children[idx + 1]!
    if (nextChild.keys.length >= this.degree) {
      const succ = this.getSuccessor(node, idx)
      node.keys[idx] = succ
      return this.deleteFromNode(nextChild, succ)
    }
    const mergedKey = node.keys[idx]!
    this.merge(node, idx)
    return this.deleteFromNode(node.children[idx]!, mergedKey)
  }

  private getPredecessor(node: FusionNode, idx: number): number {
    let current = node.children[idx]!
    while (!current.leaf) {
      current = current.children[current.children.length - 1]!
    }
    return current.keys[current.keys.length - 1]!
  }

  private getSuccessor(node: FusionNode, idx: number): number {
    let current = node.children[idx + 1]!
    while (!current.leaf) {
      current = current.children[0]!
    }
    return current.keys[0]!
  }

  private fill(node: FusionNode, idx: number): void {
    if (idx > 0 && node.children[idx - 1]!.keys.length >= this.degree) {
      this.borrowFromPrev(node, idx)
    } else if (idx < node.keys.length && node.children[idx + 1]!.keys.length >= this.degree) {
      this.borrowFromNext(node, idx)
    } else {
      if (idx < node.keys.length) {
        this.merge(node, idx)
      } else {
        this.merge(node, idx - 1)
      }
    }
  }

  private borrowFromPrev(node: FusionNode, idx: number): void {
    const child = node.children[idx]!
    const sibling = node.children[idx - 1]!
    child.keys.unshift(node.keys[idx - 1]!)
    node.keys[idx - 1] = sibling.keys.pop()!
    if (!child.leaf) {
      child.children.unshift(sibling.children.pop()!)
    }
  }

  private borrowFromNext(node: FusionNode, idx: number): void {
    const child = node.children[idx]!
    const sibling = node.children[idx + 1]!
    child.keys.push(node.keys[idx]!)
    node.keys[idx] = sibling.keys.shift()!
    if (!child.leaf) {
      child.children.push(sibling.children.shift()!)
    }
  }

  private merge(node: FusionNode, idx: number): void {
    const left = node.children[idx]!
    const right = node.children[idx + 1]!
    left.keys.push(node.keys[idx]!)
    left.keys.push(...right.keys)
    if (!left.leaf) {
      left.children.push(...right.children)
    }
    node.keys.splice(idx, 1)
    node.children.splice(idx + 1, 1)
  }

  has(key: number): boolean {
    return this.search(key)
  }

  search(key: number): boolean {
    this.stats.searches++
    return this.searchInNode(this.root, key)
  }

  private searchInNode(node: FusionNode, key: number): boolean {
    const idx = this.findKeyIndex(node, key)
    if (idx < node.keys.length && this.compare(key, node.keys[idx]!) === 0) {
      return true
    }
    if (node.leaf) {
      return false
    }
    return this.searchInNode(node.children[idx]!, key)
  }

  private findKeyIndex(node: FusionNode, key: number): number {
    let idx = 0
    while (idx < node.keys.length && this.compare(key, node.keys[idx]!) > 0) {
      idx++
    }
    return idx
  }

  findMin(): number | undefined {
    if (this._size === 0) return undefined
    let node = this.root
    while (!node.leaf) {
      node = node.children[0]!
    }
    return node.keys[0]
  }

  findMax(): number | undefined {
    if (this._size === 0) return undefined
    let node = this.root
    while (!node.leaf) {
      node = node.children[node.children.length - 1]!
    }
    return node.keys[node.keys.length - 1]
  }

  rangeQuery(min: number, max: number): number[] {
    const result: number[] = []
    this.rangeQueryInNode(this.root, min, max, result)
    return result
  }

  private rangeQueryInNode(node: FusionNode, min: number, max: number, result: number[]): void {
    let i = 0
    while (i < node.keys.length && this.compare(node.keys[i]!, min) < 0) {
      i++
    }
    if (node.leaf) {
      while (i < node.keys.length && this.compare(node.keys[i]!, max) <= 0) {
        result.push(node.keys[i]!)
        i++
      }
      return
    }
    if (i < node.keys.length && this.compare(node.keys[i]!, min) >= 0 && this.compare(node.keys[i]!, max) <= 0) {
      this.rangeQueryInNode(node.children[i]!, min, max, result)
    } else if (i < node.children.length) {
      this.rangeQueryInNode(node.children[i]!, min, max, result)
    }
    while (i < node.keys.length && this.compare(node.keys[i]!, max) <= 0) {
      result.push(node.keys[i]!)
      i++
      if (i < node.children.length) {
        this.rangeQueryInNode(node.children[i]!, min, max, result)
      }
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = this.createNode(true)
    this._size = 0
    this.stats = { inserts: 0, deletes: 0, searches: 0, rebalances: 0 }
  }

  toArray(): number[] {
    const result: number[] = []
    this.inorderTraversal(this.root, result)
    return result
  }

  private inorderTraversal(node: FusionNode, result: number[]): void {
    if (node.leaf) {
      result.push(...node.keys)
      return
    }
    for (let i = 0; i < node.keys.length; i++) {
      this.inorderTraversal(node.children[i]!, result)
      result.push(node.keys[i]!)
    }
    this.inorderTraversal(node.children[node.keys.length]!, result)
  }

  forEach(callback: (key: number, index: number) => void): void {
    let index = 0
    this.forEachInNode(this.root, callback, index)
  }

  private forEachInNode(node: FusionNode, callback: (key: number, index: number) => void, startIndex: number): number {
    if (node.leaf) {
      for (let i = 0; i < node.keys.length; i++) {
        callback(node.keys[i]!, startIndex + i)
      }
      return startIndex + node.keys.length
    }
    let idx = startIndex
    for (let i = 0; i < node.keys.length; i++) {
      idx = this.forEachInNode(node.children[i]!, callback, idx)
      callback(node.keys[i]!, idx)
      idx++
    }
    return this.forEachInNode(node.children[node.keys.length]!, callback, idx)
  }

  [Symbol.iterator](): Iterator<number> {
    const elements = this.toArray()
    let index = 0
    return {
      next: (): IteratorResult<number> => {
        if (index < elements.length) {
          return { value: elements[index++]!, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }

  getHeight(): number {
    let height = 1
    let node = this.root
    while (!node.leaf) {
      height++
      node = node.children[0]!
    }
    return height
  }

  getStatistics(): FusionTreeStatistics {
    return {
      inserts: this.stats.inserts,
      deletes: this.stats.deletes,
      searches: this.stats.searches,
      rebalances: this.stats.rebalances,
      height: this.getHeight(),
    }
  }
}
