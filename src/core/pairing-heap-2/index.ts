import type { Comparator, ForEachCallback, PairingHeap2Node, PairingHeap2Options } from './types.js'

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class PairingHeap2<T> {
  private _root: PairingHeap2Node<T> | null
  private _size: number
  private readonly _comparator: Comparator<T>

  constructor(options?: PairingHeap2Options<T>) {
    this._comparator = options?.comparator ?? defaultComparator
    this._root = null
    this._size = 0
  }

  private _mergeNodes(
    a: PairingHeap2Node<T> | null,
    b: PairingHeap2Node<T> | null
  ): PairingHeap2Node<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this._comparator(a.value, b.value) <= 0) {
      b.sibling = a.child
      if (a.child !== null) {
        a.child.prev = b
      }
      b.prev = a
      a.child = b
      return a
    } else {
      a.sibling = b.child
      if (b.child !== null) {
        b.child.prev = a
      }
      a.prev = b
      b.child = a
      return b
    }
  }

  push(value: T): PairingHeap2Node<T> {
    return this.insert(value)
  }

  insert(value: T): PairingHeap2Node<T> {
    const node: PairingHeap2Node<T> = {
      value,
      child: null,
      sibling: null,
      prev: null,
    }
    this._root = this._mergeNodes(this._root, node)
    if (this._root !== null) {
      this._root.prev = null
    }
    this._size++
    return node
  }

  pop(): T {
    if (this._root === null) {
      throw new Error('pop called on empty heap')
    }
    const result = this._root.value
    this._root = this._twoPassPair(this._root.child)
    if (this._root !== null) {
      this._root.prev = null
    }
    this._size--
    return result
  }

  private _twoPassPair(node: PairingHeap2Node<T> | null): PairingHeap2Node<T> | null {
    if (node === null || node.sibling === null) {
      return node
    }

    const pairs: PairingHeap2Node<T>[] = []
    let current: PairingHeap2Node<T> | null = node
    while (current !== null) {
      const next: PairingHeap2Node<T> | null = current.sibling
      current.sibling = null
      current.prev = null
      if (next !== null) {
        const nextNext: PairingHeap2Node<T> | null = next.sibling
        next.sibling = null
        next.prev = null
        pairs.push(this._mergeNodes(current, next)!)
        current = nextNext
      } else {
        pairs.push(current)
        current = null
      }
    }

    let result: PairingHeap2Node<T> | null = null
    for (let i = pairs.length - 1; i >= 0; i--) {
      result = this._mergeNodes(result, pairs[i]!)
    }
    if (result !== null) {
      result.prev = null
    }
    return result
  }

  peek(): T {
    if (this._root === null) {
      throw new Error('peek called on empty heap')
    }
    return this._root.value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = null
    this._size = 0
  }

  toArray(): T[] {
    const cloned = this.clone()
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.pop())
    }
    return result
  }

  clone(): PairingHeap2<T> {
    const result = new PairingHeap2<T>({ comparator: this._comparator })
    if (this._root === null) return result
    result._root = this._cloneTree(this._root)
    result._size = this._size
    return result
  }

  private _cloneTree(node: PairingHeap2Node<T>): PairingHeap2Node<T> {
    const cloned: PairingHeap2Node<T> = {
      value: node.value,
      child: null,
      sibling: null,
      prev: null,
    }
    if (node.child !== null) {
      cloned.child = this._cloneSiblingList(node.child, cloned)
    }
    return cloned
  }

  private _cloneSiblingList(
    node: PairingHeap2Node<T>,
    parent: PairingHeap2Node<T>
  ): PairingHeap2Node<T> {
    const head: PairingHeap2Node<T> = {
      value: node.value,
      child: null,
      sibling: null,
      prev: parent,
    }
    if (node.child !== null) {
      head.child = this._cloneSiblingList(node.child, head)
    }
    let dest: PairingHeap2Node<T> = head
    let current: PairingHeap2Node<T> | null = node.sibling
    while (current !== null) {
      const cloned: PairingHeap2Node<T> = {
        value: current.value,
        child: null,
        sibling: null,
        prev: dest,
      }
      if (current.child !== null) {
        cloned.child = this._cloneSiblingList(current.child, cloned)
      }
      dest.sibling = cloned
      dest = cloned
      current = current.sibling
    }
    return head
  }

  static fromArray<U>(items: U[], options?: PairingHeap2Options<U>): PairingHeap2<U> {
    const heap = new PairingHeap2<U>(options)
    for (const item of items) {
      heap.insert(item)
    }
    return heap
  }

  merge(other: PairingHeap2<T>): void {
    if (other === this) return
    if (other._root === null) return
    if (this._root === null) {
      this._root = other._root
    } else {
      this._root = this._mergeNodes(this._root, other._root)
      this._root!.prev = null
    }
    this._size += other._size
    other._root = null
    other._size = 0
  }

  decreaseKey(node: PairingHeap2Node<T>, newValue: T): void {
    if (this._root === null) {
      throw new Error('Heap is empty')
    }
    if (this._comparator(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
    if (node === this._root) return
    this._cutNode(node)
    this._root = this._mergeNodes(this._root, node)
    this._root!.prev = null
  }

  decreaseKeyOrDefault(node: PairingHeap2Node<T>, newValue: T): boolean {
    if (this._root === null) return false
    if (this._comparator(newValue, node.value) > 0) return false
    if (!this.contains(node)) return false
    this.decreaseKey(node, newValue)
    return true
  }

  private _cutNode(node: PairingHeap2Node<T>): void {
    if (node.prev !== null) {
      if (node.prev.child === node) {
        node.prev.child = node.sibling
      } else {
        node.prev.sibling = node.sibling
      }
      if (node.sibling !== null) {
        node.sibling.prev = node.prev
      }
    }
    node.prev = null
    node.sibling = null
  }

  delete(node: PairingHeap2Node<T>): void {
    if (this._root === null) return
    if (node === this._root) {
      this.pop()
      return
    }
    const childForest = node.child
    this._cutNode(node)
    this._size--
    if (childForest !== null) {
      this._reinsertChildrenNoCount(childForest)
    }
  }

  private _reinsertChildrenNoCount(node: PairingHeap2Node<T>): void {
    const children: PairingHeap2Node<T>[] = []
    let current: PairingHeap2Node<T> | null = node
    while (current !== null) {
      const next: PairingHeap2Node<T> | null = current.sibling
      if (current.child !== null) {
        this._reinsertChildrenNoCount(current.child)
      }
      children.push(current)
      current = next
    }
    for (const child of children) {
      child.child = null
      child.sibling = null
      child.prev = null
      this._root = this._mergeNodes(this._root, child)
      if (this._root !== null) {
        this._root.prev = null
      }
    }
  }

  contains(node: PairingHeap2Node<T>): boolean {
    if (this._root === null) return false
    return this._findNode(this._root, node)
  }

  private _findNode(root: PairingHeap2Node<T>, target: PairingHeap2Node<T>): boolean {
    let current: PairingHeap2Node<T> | null = root
    while (current !== null) {
      if (current === target) return true
      if (current.child !== null) {
        if (this._findNode(current.child, target)) return true
      }
      current = current.sibling
    }
    return false
  }

  update(node: PairingHeap2Node<T>, newValue: T): void {
    if (this._root === null) return
    const cmp = this._comparator(newValue, node.value)
    if (cmp === 0) return
    if (cmp < 0) {
      this.decreaseKey(node, newValue)
    } else {
      if (node === this._root) {
        this.pop()
        this.insert(newValue)
      } else {
        this._cutNode(node)
        this._size--
        const childForest = node.child
        node.child = null
        node.value = newValue
        if (childForest !== null) {
          this._reinsertChildren(childForest)
        }
        this._root = this._mergeNodes(this._root, node)
        this._root!.prev = null
        this._size++
      }
    }
  }

  private _reinsertChildren(node: PairingHeap2Node<T>): void {
    const children: PairingHeap2Node<T>[] = []
    let current: PairingHeap2Node<T> | null = node
    while (current !== null) {
      const next: PairingHeap2Node<T> | null = current.sibling
      if (current.child !== null) {
        this._reinsertChildren(current.child)
      }
      children.push(current)
      current = next
    }
    for (const child of children) {
      child!.child = null
      child!.sibling = null
      child!.prev = null
      this._root = this._mergeNodes(this._root, child)
      if (this._root !== null) {
        this._root.prev = null
      }
      this._size++
    }
  }

  isValid(): boolean {
    if (this._root === null) return true
    return this._isValidSubtree(this._root.value, this._root)
  }

  private _isValidSubtree(parentValue: T, node: PairingHeap2Node<T>): boolean {
    let current: PairingHeap2Node<T> | null = node
    while (current !== null) {
      if (this._comparator(current.value, parentValue) < 0) {
        return false
      }
      if (current.child !== null) {
        if (!this._isValidSubtree(current.value, current.child)) return false
      }
      current = current.sibling
    }
    return true
  }

  forEach(callback: ForEachCallback<T>): void {
    let idx = 0
    const cloned = this.clone()
    while (!cloned.isEmpty) {
      callback(cloned.pop(), idx++)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const cloned = this.clone()
    while (!cloned.isEmpty) {
      yield cloned.pop()
    }
  }

  pushPop(value: T): T {
    if (this._root === null) {
      return value
    }
    const node: PairingHeap2Node<T> = {
      value,
      child: null,
      sibling: null,
      prev: null,
    }
    this._root = this._mergeNodes(this._root, node)
    const root = this._root!
    const result = root.value
    this._root = this._twoPassPair(root.child)
    if (this._root !== null) {
      this._root.prev = null
    }
    return result
  }

  replacePeek(value: T): T {
    if (this._root === null) {
      throw new Error('replacePeek called on empty heap')
    }
    const result = this._root.value
    this._root.value = value
    if (this._comparator(value, result) > 0) {
      const oldRoot = this._root
      this._root = this._twoPassPair(oldRoot.child)
      if (this._root !== null) {
        this._root.prev = null
      }
      oldRoot.child = null
      oldRoot.sibling = null
      oldRoot.prev = null
      this._root = this._mergeNodes(this._root, oldRoot)
      if (this._root !== null) {
        this._root.prev = null
      }
    }
    return result
  }

  has(node: PairingHeap2Node<T>): boolean {
    return this.contains(node)
  }

  toString(): string {
    return `PairingHeap2({ size: ${this.size} })`
  }
}

export type { PairingHeap2Options, PairingHeap2Node, Comparator, ForEachCallback } from './types.js'
