import type { PairingHeapNode, PairingHeapOptions } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class PairingHeap<T = number> {
  private root: PairingHeapNode<T> | null = null
  private _size = 0
  private readonly compare: (a: T, b: T) => number

  constructor(options?: PairingHeapOptions<T>) {
    this.compare = options?.comparator ?? DEFAULT_COMPARATOR<T>
  }

  insert(value: T): PairingHeapNode<T> {
    const node: PairingHeapNode<T> = {
      value,
      children: [],
      parent: null,
    }
    this.root = this.mergeNodes(this.root, node)
    this._size++
    return node
  }

  extractMin(): T | undefined {
    if (this.root === null) {
      return undefined
    }
    const value = this.root.value
    this.root = this.mergePairs(this.root.children)
    if (this.root !== null) {
      this.root.parent = null
    }
    this._size--
    return value
  }

  peek(): T | undefined {
    return this.root?.value
  }

  merge(other: PairingHeap<T>): PairingHeap<T> {
    if (other.root === null) {
      return this
    }
    if (this.root === null) {
      this.root = other.root
      this._size = other._size
      other.clear()
      return this
    }
    this.root = this.mergeNodes(this.root, other.root)
    this._size += other._size
    other.clear()
    return this
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

  decreaseKey(node: PairingHeapNode<T>, newValue: T): void {
    if (this.compare(newValue, node.value) > 0) {
      return
    }
    node.value = newValue
    if (node === this.root) {
      return
    }
    if (node.parent !== null) {
      const parent = node.parent
      const idx = parent.children.indexOf(node)
      if (idx !== -1) {
        parent.children.splice(idx, 1)
      }
      node.parent = null
      this.root = this.mergeNodes(this.root, node)
    }
  }

  toArray(): T[] {
    const result: T[] = []
    const temp = this.clone()
    while (!temp.isEmpty()) {
      const val = temp.extractMin()
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  contains(value: T): boolean {
    return this.findNode(this.root, value) !== null
  }

  clone(): PairingHeap<T> {
    const cloned = new PairingHeap<T>({ comparator: this.compare })
    if (this.root !== null) {
      cloned.root = this.cloneNode(this.root, null)
      cloned._size = this._size
    }
    return cloned
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
    return this.validateSubtree(this.root)
  }

  private mergeNodes(
    a: PairingHeapNode<T> | null,
    b: PairingHeapNode<T> | null,
  ): PairingHeapNode<T> | null {
    if (a === null) return b
    if (b === null) return a
    if (this.compare(a.value, b.value) <= 0) {
      a.children.push(b)
      b.parent = a
      return a
    }
    b.children.push(a)
    a.parent = b
    return b
  }

  private mergePairs(children: PairingHeapNode<T>[]): PairingHeapNode<T> | null {
    if (children.length === 0) return null
    if (children.length === 1) {
      children[0]!.parent = null
      return children[0]!
    }
    const pairs: PairingHeapNode<T>[] = []
    let i = 0
    while (i + 1 < children.length) {
      const merged = this.mergeNodes(children[i]!, children[i + 1]!)
      if (merged !== null) {
        pairs.push(merged)
      }
      i += 2
    }
    if (i < children.length) {
      children[i]!.parent = null
      pairs.push(children[i]!)
    }
    let result: PairingHeapNode<T> | null = pairs[pairs.length - 1] ?? null
    if (result !== null) {
      result.parent = null
    }
    for (let j = pairs.length - 2; j >= 0; j--) {
      result = this.mergeNodes(result, pairs[j]!)
    }
    return result
  }

  private findNode(
    node: PairingHeapNode<T> | null,
    value: T,
  ): PairingHeapNode<T> | null {
    if (node === null) return null
    if (this.compare(node.value, value) === 0 && node.value === value) {
      return node
    }
    for (const child of node.children) {
      const found = this.findNode(child, value)
      if (found !== null) return found
    }
    return null
  }

  private cloneNode(
    node: PairingHeapNode<T>,
    parent: PairingHeapNode<T> | null,
  ): PairingHeapNode<T> {
    const copy: PairingHeapNode<T> = {
      value: node.value,
      children: [],
      parent,
    }
    for (const child of node.children) {
      copy.children.push(this.cloneNode(child, copy))
    }
    return copy
  }

  private validateSubtree(node: PairingHeapNode<T>): boolean {
    for (const child of node.children) {
      if (child.parent !== node) {
        return false
      }
      if (this.compare(child.value, node.value) < 0) {
        return false
      }
      if (!this.validateSubtree(child)) {
        return false
      }
    }
    return true
  }
}

export { DEFAULT_COMPARATOR } from './types.js'
export type { PairingHeapOptions, PairingHeapNode } from './types.js'
