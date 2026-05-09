import type { BTreeMapNode } from './types.js'
import { DEFAULT_BTREEMAP_ORDER } from './types.js'

export class BTreeMap<K, V> {
  private root: BTreeMapNode<K, V> | null = null
  private _size: number = 0
  private order: number
  private compare: (a: K, b: K) => number

  constructor(order?: number, compare?: (a: K, b: K) => number) {
    this.order = order ?? DEFAULT_BTREEMAP_ORDER
    if (this.order < 2) {
      throw new Error('B-Tree order must be at least 2')
    }
    this.compare = compare ?? ((a: K, b: K) => (a as number) - (b as number))
  }

  private createNode(): BTreeMapNode<K, V> {
    return { keys: [], values: [], children: [], isLeaf: true }
  }

  private findKeyIndex(keys: K[], key: K): number {
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

  set(key: K, value: V): void {
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

  private updateValue(node: BTreeMapNode<K, V>, key: K, value: V): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      node.values[idx] = value
      return
    }
    if (!node.isLeaf && node.children[idx] !== undefined) {
      this.updateValue(node.children[idx]!, key, value)
    }
  }

  private splitChild(parent: BTreeMapNode<K, V>, index: number): void {
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

  private insertNonFull(node: BTreeMapNode<K, V>, key: K, value: V): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (node.isLeaf) {
      node.keys.splice(idx, 0, key)
      node.values.splice(idx, 0, value)
    } else {
      const child = node.children[idx]
      if (child !== undefined && child.keys.length === 2 * this.order - 1) {
        this.splitChild(node, idx)
        if (this.compare(key, node.keys[idx]!) > 0) {
          this.insertNonFull(node.children[idx + 1]!, key, value)
        } else {
          this.insertNonFull(node.children[idx]!, key, value)
        }
      } else if (child !== undefined) {
        this.insertNonFull(child, key, value)
      }
    }
  }

  private searchNode(node: BTreeMapNode<K, V>, key: K): V | undefined {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      return node.values[idx]
    }
    if (node.isLeaf) return undefined
    const child = node.children[idx]
    if (child !== undefined) {
      return this.searchNode(child, key)
    }
    return undefined
  }

  get(key: K): V | undefined {
    if (this.root === null) return undefined
    return this.searchNode(this.root, key)
  }

  private hasKey(node: BTreeMapNode<K, V>, key: K): boolean {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      return true
    }
    if (node.isLeaf) return false
    const child = node.children[idx]
    if (child !== undefined) {
      return this.hasKey(child, key)
    }
    return false
  }

  has(key: K): boolean {
    if (this.root === null) return false
    return this.hasKey(this.root, key)
  }

  delete(key: K): boolean {
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

  private deleteFromNode(node: BTreeMapNode<K, V>, key: K): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
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

  private deleteFromInternalNode(node: BTreeMapNode<K, V>, idx: number): void {
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

  private getPredecessor(node: BTreeMapNode<K, V>): [K, V] | undefined {
    if (node.isLeaf) {
      const lastIdx = node.keys.length - 1
      if (lastIdx >= 0) {
        return [node.keys[lastIdx]!, node.values[lastIdx]!]
      }
      return undefined
    }
    return this.getPredecessor(node.children[node.children.length - 1]!)
  }

  private getSuccessor(node: BTreeMapNode<K, V>): [K, V] | undefined {
    if (node.isLeaf) {
      if (node.keys.length > 0) {
        return [node.keys[0]!, node.values[0]!]
      }
      return undefined
    }
    return this.getSuccessor(node.children[0]!)
  }

  private fillChild(node: BTreeMapNode<K, V>, idx: number): void {
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

  private borrowFromPrev(node: BTreeMapNode<K, V>, idx: number): void {
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

  private borrowFromNext(node: BTreeMapNode<K, V>, idx: number): void {
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

  private mergeChildren(node: BTreeMapNode<K, V>, idx: number): void {
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

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[0]!
    }
    return [node.keys[0]!, node.values[0]!]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[node.children.length - 1]!
    }
    return [node.keys[node.keys.length - 1]!, node.values[node.values.length - 1]!]
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

  private inOrderTraversal(node: BTreeMapNode<K, V> | null, result: [K, V][]): void {
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

  private rangeTraversal(node: BTreeMapNode<K, V> | null, low: K, high: K, result: [K, V][]): void {
    if (node === null) return
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.isLeaf && node.children[i] !== undefined) {
        this.rangeTraversal(node.children[i]!, low, high, result)
      }
      const cmpLow = this.compare(node.keys[i]!, low)
      const cmpHigh = this.compare(node.keys[i]!, high)
      if (cmpLow >= 0 && cmpHigh <= 0) {
        result.push([node.keys[i]!, node.values[i]!])
      }
    }
    if (!node.isLeaf && node.children[node.keys.length] !== undefined) {
      this.rangeTraversal(node.children[node.keys.length]!, low, high, result)
    }
  }

  rangeSearch(low: K, high: K): [K, V][] {
    if (this.compare(low, high) > 0) return []
    const result: [K, V][] = []
    this.rangeTraversal(this.root, low, high, result)
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    const entries = this.entries()
    for (const [key, value] of entries) {
      callback(value, key)
    }
  }

  clone(): BTreeMap<K, V> {
    const map = new BTreeMap<K, V>(this.order, this.compare)
    const entries = this.entries()
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  static fromEntries<K, V>(entries: [K, V][], order?: number, compare?: (a: K, b: K) => number): BTreeMap<K, V> {
    const map = new BTreeMap<K, V>(order, compare)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  update(key: K, updater: (value: V | undefined) => V): void {
    const current = this.get(key)
    this.set(key, updater(current))
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const entries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < entries.length) {
          const value = entries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }
}

export { DEFAULT_BTREEMAP_ORDER } from './types.js'
export type { BTreeMapNode } from './types.js'
