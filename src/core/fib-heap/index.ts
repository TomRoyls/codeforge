import type { FibHeapNode, FibHeapOptions } from './types.js'

export class FibHeap<T = number> {
  private min: FibHeapNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: FibHeapOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(value: T): FibHeapNode<T> {
    const node = this.createNode(value)
    if (this.min === null) {
      this.min = node
    } else {
      this.insertIntoRootList(node)
      if (this.compare(node.value, this.min.value) < 0) {
        this.min = node
      }
    }
    this._size++
    return node
  }

  extractMin(): T {
    if (this.min === null) {
      throw new Error('Heap is empty')
    }
    const z = this.min
    if (z.child !== null) {
      let child = z.child
      const children: FibHeapNode<T>[] = []
      let start = child
      do {
        children.push(child)
        child = child.right
      } while (child !== start)
      for (const c of children) {
        this.insertIntoRootList(c)
        c.parent = null
      }
    }
    this.removeFromRootList(z)
    if (z === z.right) {
      this.min = null
    } else {
      this.min = z.right
      this.consolidate()
    }
    this._size--
    return z.value
  }

  peek(): T {
    if (this.min === null) {
      throw new Error('Heap is empty')
    }
    return this.min.value
  }

  decreaseKey(node: FibHeapNode<T>, newValue: T): FibHeapNode<T> {
    if (this.min === null) {
      throw new Error('Heap is empty')
    }
    if (this.compare(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
    const parent = node.parent
    if (parent !== null && this.compare(node.value, parent.value) < 0) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    if (this.compare(node.value, this.min.value) <= 0) {
      this.min = node
    }
    return node
  }

  delete(node: FibHeapNode<T>): void {
    const parent = node.parent
    this.cutNodeFromParent(node)
    if (parent !== null) {
      this.cascadingCut(parent)
    }
    this.min = node
    this.extractMin()
  }

  merge(other: FibHeap<T>): void {
    if (other === this) return
    if (other.min === null) return
    if (this.min === null) {
      this.min = other.min
    } else {
      this.concatenateRootLists(this.min, other.min)
      if (this.compare(other.min.value, this.min.value) < 0) {
        this.min = other.min
      }
    }
    this._size += other._size
    other.min = null
    other._size = 0
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.min = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    if (this.min === null) return result
    const visited = new Set<FibHeapNode<T>>()
    const stack: FibHeapNode<T>[] = [this.min]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (visited.has(node)) continue
      visited.add(node)
      result.push(node.value)
      if (node.child !== null) {
        stack.push(node.child)
      }
      let right = node.right
      while (right !== node) {
        if (visited.has(right)) break
        visited.add(right)
        result.push(right.value)
        if (right.child !== null) {
          stack.push(right.child)
        }
        right = right.right
      }
    }
    return result
  }

  contains(value: T): boolean {
    if (this.min === null) return false
    return this.findNode(this.min, value, new Set()) !== null
  }

  clone(): FibHeap<T> {
    const cloned = new FibHeap<T>({ comparator: this.compare })
    if (this.min === null) return cloned
    const items = this.toArray()
    for (const item of items) {
      cloned.insert(item)
    }
    return cloned
  }

  static fromArray<U>(items: U[], options?: FibHeapOptions<U>): FibHeap<U> {
    const heap = new FibHeap<U>(options)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  static merge<U>(a: FibHeap<U>, b: FibHeap<U>): FibHeap<U> {
    const result = a.clone()
    result.merge(b.clone())
    return result
  }

  forEach(callback: (item: T) => void): void {
    if (this.min === null) return
    const visited = new Set<FibHeapNode<T>>()
    let current: FibHeapNode<T> = this.min
    do {
      if (visited.has(current)) break
      visited.add(current)
      this.forEachInTree(current, callback, visited)
      current = current.right
    } while (current !== this.min)
  }

  *[Symbol.iterator](): Iterator<T> {
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      yield items[i]!
    }
  }

  toSortedArray(): T[] {
    const cloned = this.clone()
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.extractMin())
    }
    return result
  }

  private createNode(value: T): FibHeapNode<T> {
    const node: FibHeapNode<T> = {
      value,
      degree: 0,
      parent: null,
      child: null,
      left: null!,
      right: null!,
      mark: false,
    }
    node.left = node
    node.right = node
    return node
  }

  private insertIntoRootList(node: FibHeapNode<T>): void {
    if (this.min === null) {
      this.min = node
      return
    }
    node.left = this.min
    node.right = this.min.right
    this.min.right.left = node
    this.min.right = node
  }

  private removeFromRootList(node: FibHeapNode<T>): void {
    node.left.right = node.right
    node.right.left = node.left
  }

  private concatenateRootLists(a: FibHeapNode<T>, b: FibHeapNode<T>): void {
    const aRight = a.right
    const bLeft = b.left
    a.right = b
    b.left = a
    aRight.left = bLeft
    bLeft.right = aRight
  }

  private consolidate(): void {
    if (this.min === null) return
    const maxDegree = Math.floor(Math.log2(this._size)) + 2
    const A: (FibHeapNode<T> | null)[] = new Array(maxDegree + 1).fill(null)

    const rootList = this.getRootList()
    for (const w of rootList) {
      let x = w
      let d = x.degree
      while (d < A.length && A[d] !== null) {
        let y = A[d]!
        if (this.compare(x.value, y.value) > 0) {
          const temp = x
          x = y
          y = temp
        }
        this.heapLink(y, x)
        A[d] = null
        d++
      }
      if (d >= A.length) {
        const newSize = d + 2
        while (A.length < newSize) A.push(null)
      }
      A[d] = x
    }
    this.min = null
    for (let i = 0; i < A.length; i++) {
      if (A[i] !== null) {
        const node = A[i]!
        if (this.min === null) {
          node.left = node
          node.right = node
          this.min = node
        } else {
          this.insertIntoRootList(node)
          if (this.compare(node.value, this.min.value) < 0) {
            this.min = node
          }
        }
      }
    }
  }

  private heapLink(y: FibHeapNode<T>, x: FibHeapNode<T>): void {
    this.removeFromRootList(y)
    y.left = y
    y.right = y
    if (x.child === null) {
      x.child = y
    } else {
      const child = x.child
      y.left = child
      y.right = child.right
      child.right.left = y
      child.right = y
    }
    y.parent = x
    x.degree++
    y.mark = false
  }

  private cut(x: FibHeapNode<T>, y: FibHeapNode<T>): void {
    if (x.right === x) {
      y.child = null
    } else {
      if (y.child === x) {
        y.child = x.right
      }
      x.left.right = x.right
      x.right.left = x.left
    }
    y.degree--
    x.left = x
    x.right = x
    this.insertIntoRootList(x)
    x.parent = null
    x.mark = false
  }

  private cascadingCut(y: FibHeapNode<T>): void {
    let current = y
    while (current.parent !== null) {
      if (!current.mark) {
        current.mark = true
        break
      }
      const parent = current.parent
      this.cut(current, parent)
      current = parent
    }
  }

  private getRootList(): FibHeapNode<T>[] {
    const result: FibHeapNode<T>[] = []
    if (this.min === null) return result
    let current = this.min
    do {
      result.push(current)
      current = current.right
    } while (current !== this.min)
    return result
  }

  private findNode(
    start: FibHeapNode<T>,
    value: T,
    visited: Set<FibHeapNode<T>>
  ): FibHeapNode<T> | null {
    let current = start
    do {
      if (visited.has(current)) break
      visited.add(current)
      if (this.compare(current.value, value) === 0) return current
      if (current.child !== null) {
        const found = this.findNode(current.child, value, visited)
        if (found !== null) return found
      }
      current = current.right
    } while (current !== start)
    return null
  }

  private forEachInTree(
    node: FibHeapNode<T>,
    callback: (item: T) => void,
    visited: Set<FibHeapNode<T>>
  ): void {
    callback(node.value)
    if (node.child !== null && !visited.has(node.child)) {
      let child = node.child
      do {
        if (visited.has(child)) break
        visited.add(child)
        this.forEachInTree(child, callback, visited)
        child = child.right
      } while (child !== node.child)
    }
  }

  private cutNodeFromParent(node: FibHeapNode<T>): void {
    const parent = node.parent
    if (parent === null) return
    if (node.right === node) {
      parent.child = null
    } else {
      if (parent.child === node) {
        parent.child = node.right
      }
      node.left.right = node.right
      node.right.left = node.left
    }
    parent.degree--
    node.left = node
    node.right = node
    this.insertIntoRootList(node)
    node.parent = null
    node.mark = false
  }


  toString(): string {
    return `${FibHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'FibHeap', size: this.size, items: this.toArray() }
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
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }


}

export type { FibHeapOptions, FibHeapNode } from './types.js'
