import type { MergeablePairingHeapNode, MergeablePairingHeapOptions } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class MergeablePairingHeap<T = number> {
  private root: MergeablePairingHeapNode<T> | null = null
  private _size = 0
  private nextId = 0
  private readonly compare: (a: T, b: T) => number
  private readonly nodeMap = new Map<number, MergeablePairingHeapNode<T>>()

  constructor(options?: MergeablePairingHeapOptions<T>) {
    this.compare = options?.comparator ?? DEFAULT_COMPARATOR<T>
  }

  insert(value: T): MergeablePairingHeapNode<T> {
    const id = this.nextId++
    const node: MergeablePairingHeapNode<T> = {
      value,
      child: null,
      sibling: null,
      parent: null,
      id,
    }
    this.nodeMap.set(id, node)
    this.root = this.mergeNodes(this.root, node)
    this._size++
    return node
  }

  findMin(): T | undefined {
    return this.root?.value
  }

  deleteMin(): T | undefined {
    if (this.root === null) {
      return undefined
    }
    const value = this.root.value
    this.nodeMap.delete(this.root.id)
    const children = this.collectChildren(this.root)
    this.root = this.mergePairs(children)
    if (this.root !== null) {
      this.root.parent = null
      this.root.sibling = null
    }
    this._size--
    return value
  }

  merge(other: MergeablePairingHeap<T>): MergeablePairingHeap<T> {
    if (other.root === null) {
      return this
    }
    if (this.root === null) {
      this.root = other.root
      this._size = other._size
      for (const [k, v] of other.nodeMap) {
        this.nodeMap.set(k, v)
      }
      this.nextId = Math.max(this.nextId, other.nextId)
      other.clear()
      return this
    }
    for (const [k, v] of other.nodeMap) {
      this.nodeMap.set(k, v)
    }
    this.nextId = Math.max(this.nextId, other.nextId)
    this.root = this.mergeNodes(this.root, other.root)
    this._size += other._size
    other.clear()
    return this
  }

  decreaseKey(node: MergeablePairingHeapNode<T>, newValue: T): void {
    if (this.compare(newValue, node.value) > 0) {
      return
    }
    node.value = newValue
    if (node === this.root) {
      return
    }
    this.removeChildFromParent(node)
    node.parent = null
    node.sibling = null
    this.root = this.mergeNodes(this.root, node)
  }

  delete(node: MergeablePairingHeapNode<T>): void {
    if (node === this.root) {
      this.deleteMin()
      return
    }
    this.removeChildFromParent(node)
    this.nodeMap.delete(node.id)
    const children = this.collectChildren(node)
    if (children.length > 0) {
      const merged = this.mergePairs(children)
      if (merged !== null) {
        this.root = this.mergeNodes(this.root, merged)
      }
    }
    this._size--
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
    this.nodeMap.clear()
  }

  toArray(): T[] {
    const result: T[] = []
    const temp = this.clone()
    while (!temp.isEmpty()) {
      const val = temp.deleteMin()
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  contains(value: T): boolean {
    return this.findNodeByValue(this.root, value) !== null
  }

  isValid(): boolean {
    if (this.root === null) {
      return this._size === 0
    }
    if (this._size === 0) {
      return false
    }
    if (this.root.parent !== null) {
      return false
    }
    if (this.root.sibling !== null) {
      return false
    }
    return this.validateSubtree(this.root)
  }

  clone(): MergeablePairingHeap<T> {
    const cloned = new MergeablePairingHeap<T>({ comparator: this.compare })
    if (this.root !== null) {
      const clonedRoot = this.cloneNode(this.root, null)
      cloned.root = clonedRoot
      cloned._size = this._size
      cloned.nextId = this.nextId
      this.cloneFillMap(cloned, clonedRoot)
    }
    return cloned
  }

  static from<T>(items: Iterable<T>, options?: MergeablePairingHeapOptions<T>): MergeablePairingHeap<T> {
    const heap = new MergeablePairingHeap<T>(options)
    for (const item of items) {
      heap.insert(item)
    }
    return heap
  }

  private mergeNodes(
    a: MergeablePairingHeapNode<T> | null,
    b: MergeablePairingHeapNode<T> | null,
  ): MergeablePairingHeapNode<T> {
    if (a === null) return b!
    if (b === null) return a
    if (this.compare(a.value, b.value) <= 0) {
      b.sibling = a.child
      a.child = b
      b.parent = a
      return a
    }
    a.sibling = b.child
    b.child = a
    a.parent = b
    return b
  }

  private collectChildren(node: MergeablePairingHeapNode<T>): MergeablePairingHeapNode<T>[] {
    const children: MergeablePairingHeapNode<T>[] = []
    let child = node.child
    while (child !== null) {
      const next = child.sibling
      child.parent = null
      child.sibling = null
      children.push(child)
      child = next
    }
    return children
  }

  private mergePairs(nodes: MergeablePairingHeapNode<T>[]): MergeablePairingHeapNode<T> | null {
    if (nodes.length === 0) return null
    if (nodes.length === 1) {
      nodes[0]!.parent = null
      nodes[0]!.sibling = null
      return nodes[0]!
    }
    const pairs: MergeablePairingHeapNode<T>[] = []
    let i = 0
    while (i + 1 < nodes.length) {
      const merged = this.mergeNodes(nodes[i]!, nodes[i + 1]!)
      pairs.push(merged)
      i += 2
    }
    if (i < nodes.length) {
      nodes[i]!.parent = null
      nodes[i]!.sibling = null
      pairs.push(nodes[i]!)
    }
    let result: MergeablePairingHeapNode<T> | null = pairs[pairs.length - 1] ?? null
    if (result !== null) {
      result.parent = null
      result.sibling = null
    }
    for (let j = pairs.length - 2; j >= 0; j--) {
      result = this.mergeNodes(result, pairs[j]!)
    }
    return result
  }

  private removeChildFromParent(node: MergeablePairingHeapNode<T>): void {
    const parent = node.parent
    if (parent === null) return
    if (parent.child === node) {
      parent.child = node.sibling
    } else {
      let prev = parent.child
      while (prev !== null && prev.sibling !== node) {
        prev = prev.sibling
      }
      if (prev !== null) {
        prev.sibling = node.sibling
      }
    }
    node.sibling = null
    node.parent = null
  }

  private findNodeByValue(
    node: MergeablePairingHeapNode<T> | null,
    value: T,
  ): MergeablePairingHeapNode<T> | null {
    if (node === null) return null
    if (this.compare(node.value, value) === 0 && node.value === value) {
      return node
    }
    const childResult = this.findNodeByValue(node.child, value)
    if (childResult !== null) return childResult
    return this.findNodeByValue(node.sibling, value)
  }

  private cloneNode(
    node: MergeablePairingHeapNode<T>,
    parent: MergeablePairingHeapNode<T> | null,
  ): MergeablePairingHeapNode<T> {
    const copy: MergeablePairingHeapNode<T> = {
      value: node.value,
      child: null,
      sibling: null,
      parent,
      id: node.id,
    }
    if (node.child !== null) {
      copy.child = this.cloneNode(node.child, copy)
    }
    if (node.sibling !== null) {
      copy.sibling = this.cloneNode(node.sibling, parent)
    }
    return copy
  }

  private cloneFillMap(heap: MergeablePairingHeap<T>, node: MergeablePairingHeapNode<T>): void {
    heap.nodeMap.set(node.id, node)
    if (node.child !== null) {
      this.cloneFillMap(heap, node.child)
    }
    if (node.sibling !== null) {
      this.cloneFillMap(heap, node.sibling)
    }
  }

  private validateSubtree(node: MergeablePairingHeapNode<T>): boolean {
    let child = node.child
    while (child !== null) {
      if (child.parent !== node) {
        return false
      }
      if (this.compare(child.value, node.value) < 0) {
        return false
      }
      if (!this.validateSubtree(child)) {
        return false
      }
      child = child.sibling
    }
    return true
  }
}

export { DEFAULT_COMPARATOR } from './types.js'
export type { MergeablePairingHeapOptions, MergeablePairingHeapNode } from './types.js'
