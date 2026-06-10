import type { PairingHeap3Node, PairingHeap3Options } from './types.js'

export class PairingHeap3<T = number> {
  private root: PairingHeap3Node<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: PairingHeap3Options<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(value: T): PairingHeap3Node<T> {
    const node = this.createNode(value)
    this.root = this.mergeNodes(this.root, node)
    this._size++
    return node
  }

  extractMin(): T {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    const value = this.root.value
    this.root = this.twoPassPair(this.root.child)
    this._size--
    return value
  }

  peek(): T {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    return this.root.value
  }

  merge(other: PairingHeap3<T>): void {
    if (other === this) return
    if (other.root === null) return
    this.root = this.mergeNodes(this.root, other.root)
    this._size += other._size
    other.root = null
    other._size = 0
  }

  decreaseKey(node: PairingHeap3Node<T>, newValue: T): PairingHeap3Node<T> {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    if (this.compare(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
    if (node === this.root) return node
    this.cutNode(node)
    this.root = this.mergeNodes(this.root, node)
    return node
  }

  delete(node: PairingHeap3Node<T>): void {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    if (node === this.root) {
      this.extractMin()
      return
    }
    this.cutNode(node)
    this.root = this.mergeNodes(this.root, node.child)
    this._size--
  }

  update(node: PairingHeap3Node<T>, newValue: T): PairingHeap3Node<T> {
    if (this.root === null) {
      throw new Error('Heap is empty')
    }
    const cmp = this.compare(newValue, node.value)
    if (cmp < 0) {
      return this.decreaseKey(node, newValue)
    }
    if (cmp > 0) {
      this.delete(node)
      return this.insert(newValue)
    }
    return node
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    if (this.root === null) return result
    this.collectValues(this.root, result)
    return result
  }

  toSortedArray(): T[] {
    const cloned = this.clone()
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.extractMin())
    }
    return result
  }

  contains(value: T): boolean {
    if (this.root === null) return false
    return this.findNode(this.root, value) !== null
  }

  clone(): PairingHeap3<T> {
    const cloned = new PairingHeap3<T>({ comparator: this.compare })
    if (this.root === null) return cloned
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      cloned.insert(items[i]!)
    }
    return cloned
  }

  static fromArray<U>(items: U[], options?: PairingHeap3Options<U>): PairingHeap3<U> {
    const heap = new PairingHeap3<U>(options)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  static merge<U>(a: PairingHeap3<U>, b: PairingHeap3<U>): PairingHeap3<U> {
    const result = a.clone()
    result.merge(b.clone())
    return result
  }

  forEach(callback: (item: T) => void): void {
    if (this.root === null) return
    this.forEachNode(this.root, callback)
  }

  *[Symbol.iterator](): Iterator<T> {
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      yield items[i]!
    }
  }

  private createNode(value: T): PairingHeap3Node<T> {
    return {
      value,
      child: null,
      sibling: null,
    }
  }

  private mergeNodes(
    a: PairingHeap3Node<T> | null,
    b: PairingHeap3Node<T> | null
  ): PairingHeap3Node<T> | null {
    if (a === null) return b
    if (b === null) return a
    if (this.compare(a.value, b.value) <= 0) {
      b.sibling = a.child
      a.child = b
      return a
    }
    a.sibling = b.child
    b.child = a
    return b
  }

  private twoPassPair(node: PairingHeap3Node<T> | null): PairingHeap3Node<T> | null {
    if (node === null) return null
    if (node.sibling === null) {
      node.sibling = null
      return node
    }
    const pairs: PairingHeap3Node<T>[] = []
    let current: PairingHeap3Node<T> | null = node
    while (current !== null) {
      const first = current
      const second: PairingHeap3Node<T> | null = current.sibling as PairingHeap3Node<T> | null
      if (second === null) {
        first.sibling = null
        pairs.push(first)
        break
      }
      const next: PairingHeap3Node<T> | null = second.sibling as PairingHeap3Node<T> | null
      first.sibling = null
      second.sibling = null
      const merged = this.mergeNodes(first, second)
      pairs.push(merged!)
      current = next
    }
    let result = pairs[pairs.length - 1]!
    for (let i = pairs.length - 2; i >= 0; i--) {
      result = this.mergeNodes(pairs[i]!, result)!
    }
    return result
  }

  private cutNode(node: PairingHeap3Node<T>): void {
    if (node === this.root) return
    if (this.root === null) return
    this.root = this.cutNodeFromTree(this.root, node)
  }

  private cutNodeFromTree(
    parent: PairingHeap3Node<T>,
    target: PairingHeap3Node<T>
  ): PairingHeap3Node<T> {
    if (parent.child === target) {
      parent.child = target.sibling
      target.sibling = null
      return parent
    }
    let prev: PairingHeap3Node<T> | null = parent.child
    while (prev !== null) {
      if (prev.sibling === target) {
        prev.sibling = target.sibling
        target.sibling = null
        return parent
      }
      prev = prev.sibling
    }
    if (parent.child !== null) {
      let child: PairingHeap3Node<T> | null = parent.child
      while (child !== null) {
        if (child.child !== null) {
          this.cutNodeFromTree(child, target)
        }
        child = child.sibling
      }
    }
    return parent
  }

  private collectValues(node: PairingHeap3Node<T>, result: T[]): void {
    result.push(node.value)
    if (node.child !== null) {
      let child: PairingHeap3Node<T> | null = node.child
      while (child !== null) {
        this.collectValues(child, result)
        child = child.sibling
      }
    }
  }

  private findNode(node: PairingHeap3Node<T>, value: T): PairingHeap3Node<T> | null {
    if (this.compare(node.value, value) === 0) return node
    if (node.child !== null) {
      let child: PairingHeap3Node<T> | null = node.child
      while (child !== null) {
        const found = this.findNode(child, value)
        if (found !== null) return found
        child = child.sibling
      }
    }
    return null
  }

  private forEachNode(node: PairingHeap3Node<T>, callback: (item: T) => void): void {
    callback(node.value)
    if (node.child !== null) {
      let child: PairingHeap3Node<T> | null = node.child
      while (child !== null) {
        this.forEachNode(child, callback)
        child = child.sibling
      }
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `PairingHeap3({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PairingHeap3', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }
}

export type { PairingHeap3Options, PairingHeap3Node } from './types.js'
