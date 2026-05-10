import type { CountedBTreeMapNode } from './types.js'
import { DEFAULT_COUNTED_BTREEMAP_ORDER } from './types.js'

export class CountedBTreeMap<K, V> {
  private root: CountedBTreeMapNode<K, V> | null = null
  private _size: number = 0
  private order: number
  private compare: (a: K, b: K) => number

  constructor(order?: number, compare?: (a: K, b: K) => number) {
    this.order = order ?? DEFAULT_COUNTED_BTREEMAP_ORDER
    if (this.order < 2) {
      throw new Error('B-Tree order must be at least 2')
    }
    this.compare = compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private createNode(): CountedBTreeMapNode<K, V> {
    return { keys: [], values: [], children: [], counts: [], isLeaf: true }
  }

  private nodeSize(node: CountedBTreeMapNode<K, V>): number {
    if (node.isLeaf) return node.keys.length
    let total = node.keys.length
    for (let i = 0; i < node.counts.length; i++) {
      total += node.counts[i]!
    }
    return total
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
      newRoot.counts.push(this.nodeSize(this.root))
      this.splitChild(newRoot, 0)
      this.insertNonFull(newRoot, key, value)
      this.root = newRoot
    } else {
      this.insertNonFull(this.root, key, value)
    }
  }

  private updateValue(node: CountedBTreeMapNode<K, V>, key: K, value: V): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      node.values[idx] = value
      return
    }
    if (!node.isLeaf && node.children[idx] !== undefined) {
      this.updateValue(node.children[idx]!, key, value)
    }
  }

  private splitChild(parent: CountedBTreeMapNode<K, V>, index: number): void {
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
      newNode.counts = child.counts.splice(midIndex + 1)
      child.counts = child.counts.slice(0, midIndex + 1)
    }
    child.keys.splice(midIndex)
    child.values.splice(midIndex)
    parent.keys.splice(index, 0, midKey)
    parent.values.splice(index, 0, midValue)
    parent.children.splice(index + 1, 0, newNode)
    parent.counts.splice(index, 1, this.nodeSize(child), this.nodeSize(newNode))
  }

  private insertNonFull(node: CountedBTreeMapNode<K, V>, key: K, value: V): void {
    const idx = this.findKeyIndex(node.keys, key)
    if (node.isLeaf) {
      node.keys.splice(idx, 0, key)
      node.values.splice(idx, 0, value)
    } else {
      const child = node.children[idx]
      if (child !== undefined && child.keys.length === 2 * this.order - 1) {
        this.splitChild(node, idx)
        if (this.compare(key, node.keys[idx]!) > 0) {
          this.insertNonFullAndCount(node, idx + 1, key, value)
        } else {
          this.insertNonFullAndCount(node, idx, key, value)
        }
      } else if (child !== undefined) {
        this.insertNonFullAndCount(node, idx, key, value)
      }
    }
  }

  private insertNonFullAndCount(node: CountedBTreeMapNode<K, V>, childIdx: number, key: K, value: V): void {
    this.insertNonFull(node.children[childIdx]!, key, value)
    this.recountChild(node, childIdx)
  }

  private recountChild(node: CountedBTreeMapNode<K, V>, childIdx: number): void {
    node.counts[childIdx] = this.nodeSize(node.children[childIdx]!)
  }

  private searchNode(node: CountedBTreeMapNode<K, V>, key: K): V | undefined {
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

  private hasKey(node: CountedBTreeMapNode<K, V>, key: K): boolean {
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

  private deleteFromNode(node: CountedBTreeMapNode<K, V>, key: K): void {
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
      this.recountChild(node, adjustedIdx)
    }
  }

  private deleteFromInternalNode(node: CountedBTreeMapNode<K, V>, idx: number): void {
    const targetKey = node.keys[idx]!
    const leftChild = node.children[idx]!
    const rightChild = node.children[idx + 1]!
    if (leftChild.keys.length >= this.order) {
      const [predKey, predValue] = this.getPredecessor(leftChild)!
      node.keys[idx] = predKey
      node.values[idx] = predValue
      this.deleteFromNode(leftChild, predKey)
      this.recountChild(node, idx)
    } else if (rightChild.keys.length >= this.order) {
      const [succKey, succValue] = this.getSuccessor(rightChild)!
      node.keys[idx] = succKey
      node.values[idx] = succValue
      this.deleteFromNode(rightChild, succKey)
      this.recountChild(node, idx + 1)
    } else {
      this.mergeChildren(node, idx)
      this.deleteFromNode(node.children[idx]!, targetKey)
      this.recountChild(node, idx)
    }
  }

  private getPredecessor(node: CountedBTreeMapNode<K, V>): [K, V] | undefined {
    if (node.isLeaf) {
      const lastIdx = node.keys.length - 1
      if (lastIdx >= 0) {
        return [node.keys[lastIdx]!, node.values[lastIdx]!]
      }
      return undefined
    }
    return this.getPredecessor(node.children[node.children.length - 1]!)
  }

  private getSuccessor(node: CountedBTreeMapNode<K, V>): [K, V] | undefined {
    if (node.isLeaf) {
      if (node.keys.length > 0) {
        return [node.keys[0]!, node.values[0]!]
      }
      return undefined
    }
    return this.getSuccessor(node.children[0]!)
  }

  private fillChild(node: CountedBTreeMapNode<K, V>, idx: number): void {
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

  private borrowFromPrev(node: CountedBTreeMapNode<K, V>, idx: number): void {
    const child = node.children[idx]!
    const sibling = node.children[idx - 1]!
    child.keys.unshift(node.keys[idx - 1]!)
    child.values.unshift(node.values[idx - 1]!)
    node.keys[idx - 1] = sibling.keys.pop()!
    node.values[idx - 1] = sibling.values.pop()!
    if (!child.isLeaf && sibling.children.length > 0) {
      child.children.unshift(sibling.children.pop()!)
      child.counts.unshift(sibling.counts.pop()!)
    }
    this.recountChild(node, idx - 1)
    this.recountChild(node, idx)
  }

  private borrowFromNext(node: CountedBTreeMapNode<K, V>, idx: number): void {
    const child = node.children[idx]!
    const sibling = node.children[idx + 1]!
    child.keys.push(node.keys[idx]!)
    child.values.push(node.values[idx]!)
    node.keys[idx] = sibling.keys.shift()!
    node.values[idx] = sibling.values.shift()!
    if (!child.isLeaf && sibling.children.length > 0) {
      child.children.push(sibling.children.shift()!)
      child.counts.push(sibling.counts.shift()!)
    }
    this.recountChild(node, idx)
    this.recountChild(node, idx + 1)
  }

  private mergeChildren(node: CountedBTreeMapNode<K, V>, idx: number): void {
    const left = node.children[idx]!
    const right = node.children[idx + 1]!
    left.keys.push(node.keys[idx]!)
    left.values.push(node.values[idx]!)
    left.keys.push(...right.keys)
    left.values.push(...right.values)
    if (!left.isLeaf) {
      left.children.push(...right.children)
      left.counts.push(...right.counts)
    }
    node.keys.splice(idx, 1)
    node.values.splice(idx, 1)
    node.children.splice(idx + 1, 1)
    node.counts.splice(idx + 1, 1)
    this.recountChild(node, idx)
  }

  atIndex(index: number): { key: K; value: V } | undefined {
    if (this.root === null || index < 0 || index >= this._size) return undefined
    return this.atIndexRecursive(this.root, index)
  }

  private atIndexRecursive(node: CountedBTreeMapNode<K, V>, index: number): { key: K; value: V } | undefined {
    if (node.isLeaf) {
      if (index < node.keys.length) {
        return { key: node.keys[index]!, value: node.values[index]! }
      }
      return undefined
    }
    let offset = 0
    for (let i = 0; i < node.keys.length; i++) {
      const childCount = node.counts[i]!
      if (index < offset + childCount) {
        return this.atIndexRecursive(node.children[i]!, index - offset)
      }
      offset += childCount
      if (index === offset) {
        return { key: node.keys[i]!, value: node.values[i]! }
      }
      offset++
    }
    const lastChildIdx = node.keys.length
    const lastCount = node.counts[lastChildIdx]!
    if (index < offset + lastCount) {
      return this.atIndexRecursive(node.children[lastChildIdx]!, index - offset)
    }
    return undefined
  }

  indexOf(key: K): number {
    if (this.root === null) return -1
    if (!this.has(key)) return -1
    return this.indexOfRecursive(this.root, key, 0)
  }

  private indexOfRecursive(node: CountedBTreeMapNode<K, V>, key: K, offset: number): number {
    const idx = this.findKeyIndex(node.keys, key)
    if (node.isLeaf) {
      if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
        return offset + idx
      }
      return -1
    }
    let pos = offset
    for (let i = 0; i < idx; i++) {
      pos += node.counts[i]! + 1
    }
    if (idx < node.keys.length && this.compare(node.keys[idx]!, key) === 0) {
      pos += node.counts[idx]!
      return pos
    }
    return this.indexOfRecursive(node.children[idx]!, key, pos)
  }

  get first(): { key: K; value: V } | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[0]!
    }
    return { key: node.keys[0]!, value: node.values[0]! }
  }

  get last(): { key: K; value: V } | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (!node.isLeaf) {
      node = node.children[node.children.length - 1]!
    }
    return { key: node.keys[node.keys.length - 1]!, value: node.values[node.values.length - 1]! }
  }

  get size(): number {
    return this._size
  }

  forEach(callback: (value: V, key: K, index: number) => void): void {
    const entries = this.toArray()
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!
      callback(entry.value, entry.key, i)
    }
  }

  toArray(): { key: K; value: V }[] {
    const result: { key: K; value: V }[] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  private inOrderTraversal(node: CountedBTreeMapNode<K, V> | null, result: { key: K; value: V }[]): void {
    if (node === null) return
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.isLeaf && node.children[i] !== undefined) {
        this.inOrderTraversal(node.children[i]!, result)
      }
      result.push({ key: node.keys[i]!, value: node.values[i]! })
    }
    if (!node.isLeaf && node.children[node.keys.length] !== undefined) {
      this.inOrderTraversal(node.children[node.keys.length]!, result)
    }
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  clone(): CountedBTreeMap<K, V> {
    const map = new CountedBTreeMap<K, V>(this.order, this.compare)
    const entries = this.toArray()
    for (const entry of entries) {
      map.set(entry.key, entry.value)
    }
    return map
  }

  static from<K, V>(entries: [K, V][], order?: number, compare?: (a: K, b: K) => number): CountedBTreeMap<K, V> {
    const map = new CountedBTreeMap<K, V>(order, compare)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  rangeQuery(start: K, end: K): { key: K; value: V }[] {
    if (this.compare(start, end) > 0) return []
    const result: { key: K; value: V }[] = []
    this.rangeTraversal(this.root, start, end, result)
    return result
  }

  private rangeTraversal(node: CountedBTreeMapNode<K, V> | null, low: K, high: K, result: { key: K; value: V }[]): void {
    if (node === null) return
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.isLeaf && node.children[i] !== undefined) {
        this.rangeTraversal(node.children[i]!, low, high, result)
      }
      const cmpLow = this.compare(node.keys[i]!, low)
      const cmpHigh = this.compare(node.keys[i]!, high)
      if (cmpLow >= 0 && cmpHigh <= 0) {
        result.push({ key: node.keys[i]!, value: node.values[i]! })
      }
    }
    if (!node.isLeaf && node.children[node.keys.length] !== undefined) {
      this.rangeTraversal(node.children[node.keys.length]!, low, high, result)
    }
  }

  stats(): { size: number; height: number; order: number; nodeCount: number } {
    return {
      size: this._size,
      height: this.getHeight(this.root),
      order: this.order,
      nodeCount: this.countNodes(this.root),
    }
  }

  private getHeight(node: CountedBTreeMapNode<K, V> | null): number {
    if (node === null) return 0
    if (node.isLeaf) return 1
    return 1 + this.getHeight(node.children[0]!)
  }

  private countNodes(node: CountedBTreeMapNode<K, V> | null): number {
    if (node === null) return 0
    let count = 1
    for (let i = 0; i < node.children.length; i++) {
      count += this.countNodes(node.children[i]!)
    }
    return count
  }

  [Symbol.iterator](): Iterator<{ key: K; value: V }> {
    const entries = this.toArray()
    let index = 0
    return {
      next: () => {
        if (index < entries.length) {
          const value = entries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<{ key: K; value: V }>
      },
    }
  }
}

export type { CountedBTreeMapNode } from './types.js'
export { DEFAULT_COUNTED_BTREEMAP_ORDER } from './types.js'
