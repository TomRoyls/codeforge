import type { BootstrappedHeapOptions, BootstrappedHeapNode } from './types.js'

interface Tree<T> {
  root: BootstrappedHeapNode<T>
  children: InnerHeap<T>
  rank: number
}

interface InnerHeap<T> {
  trees: Tree<T>[]
  size: number
}

export class BootstrappedHeap<T = number> {
  private trees: Tree<T>[] = []
  private _size = 0
  private compare: (a: T, b: T) => number
  private nextId = 0

  constructor(options?: BootstrappedHeapOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(value: T): BootstrappedHeapNode<T> {
    const node = this.createNode(value)
    const singleton: Tree<T> = {
      root: node,
      children: { trees: [], size: 0 },
      rank: 0,
    }
    node.tree = singleton
    this.trees = this.linkTree(this.trees, singleton)
    this._size++
    return node
  }

  extractMin(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    const minTree = this.findMinTree()
    const minValue = minTree.root.value
    const childTrees = minTree.children.trees
    this.trees = this.trees.filter((t) => t !== minTree)
    for (const child of childTrees) {
      child.root.tree = child
      this.trees = this.linkTree(this.trees, child)
    }
    this._size--
    return minValue
  }

  peek(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    return this.findMinTree().root.value
  }

  merge(other: BootstrappedHeap<T>): void {
    if (other === this) return
    if (other._size === 0) return
    for (const tree of other.trees) {
      this.trees = this.linkTree(this.trees, tree)
    }
    this._size += other._size
    other.trees = []
    other._size = 0
  }

  decreaseKey(node: BootstrappedHeapNode<T>, newValue: T): void {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    if (this.compare(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
  }

  delete(node: BootstrappedHeapNode<T>): void {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    const tree = node.tree
    if (!tree) return
    const found = this.removeTreeFromForest(this.trees, tree)
    if (!found) {
      this.removeFromParent(this.trees, tree)
    }
    for (const child of tree.children.trees) {
      child.root.tree = child
      this.trees = this.linkTree(this.trees, child)
    }
    this._size--
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.trees = []
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectValues(this.trees, result)
    return result
  }

  contains(value: T): boolean {
    return this.findValue(this.trees, value)
  }

  clone(): BootstrappedHeap<T> {
    const cloned = new BootstrappedHeap<T>({ comparator: this.compare })
    const items = this.toSortedArray()
    for (const item of items) {
      cloned.insert(item)
    }
    return cloned
  }

  static fromArray<U>(items: U[], options?: BootstrappedHeapOptions<U>): BootstrappedHeap<U> {
    const heap = new BootstrappedHeap<U>(options)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  static merge<U>(a: BootstrappedHeap<U>, b: BootstrappedHeap<U>): BootstrappedHeap<U> {
    const result = a.clone()
    result.merge(b.clone())
    return result
  }

  forEach(callback: (item: T) => void): void {
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      yield items[i]!
    }
  }

  toSortedArray(): T[] {
    const cloned = new BootstrappedHeap<T>({ comparator: this.compare })
    cloned.trees = this.deepCloneTrees(this.trees)
    cloned._size = this._size
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.extractMin())
    }
    return result
  }

  private createNode(value: T): BootstrappedHeapNode<T> {
    return {
      value,
      id: this.nextId++,
      tree: null,
    }
  }

  private linkTree(existing: Tree<T>[], newTree: Tree<T>): Tree<T>[] {
    const result = [...existing]
    let current = newTree
    let idx = result.findIndex((t) => t.rank === current.rank)
    while (idx !== -1) {
      const matched = result[idx]!
      result.splice(idx, 1)
      current = this.linkPair(matched, current)
      idx = result.findIndex((t) => t.rank === current.rank)
    }
    result.push(current)
    return result
  }

  private linkPair(a: Tree<T>, b: Tree<T>): Tree<T> {
    if (this.compare(a.root.value, b.root.value) <= 0) {
      a.children.trees.push(b)
      a.children.size += b.children.size + 1
      a.rank = a.rank + 1
      return a
    }
    b.children.trees.push(a)
    b.children.size += a.children.size + 1
    b.rank = b.rank + 1
    return b
  }

  private findMinTree(): Tree<T> {
    let minTree = this.trees[0]!
    for (let i = 1; i < this.trees.length; i++) {
      if (this.compare(this.trees[i]!.root.value, minTree.root.value) < 0) {
        minTree = this.trees[i]!
      }
    }
    return minTree
  }

  private collectValues(trees: Tree<T>[], result: T[]): void {
    for (const tree of trees) {
      result.push(tree.root.value)
      this.collectValues(tree.children.trees, result)
    }
  }

  private findValue(trees: Tree<T>[], value: T): boolean {
    for (const tree of trees) {
      if (this.compare(tree.root.value, value) === 0) return true
      if (this.findValue(tree.children.trees, value)) return true
    }
    return false
  }

  private removeTreeFromForest(trees: Tree<T>[], target: Tree<T>): boolean {
    const idx = trees.indexOf(target)
    if (idx !== -1) {
      trees.splice(idx, 1)
      return true
    }
    for (const tree of trees) {
      if (this.removeTreeFromForest(tree.children.trees, target)) {
        this.recalculateRank(tree)
        return true
      }
    }
    return false
  }

  private removeFromParent(trees: Tree<T>[], target: Tree<T>): void {
    for (const tree of trees) {
      const idx = tree.children.trees.indexOf(target)
      if (idx !== -1) {
        tree.children.trees.splice(idx, 1)
        tree.children.size--
        this.recalculateRank(tree)
        return
      }
      this.removeFromParent(tree.children.trees, target)
    }
  }

  private recalculateRank(tree: Tree<T>): void {
    let maxChildRank = -1
    for (const child of tree.children.trees) {
      if (child.rank > maxChildRank) {
        maxChildRank = child.rank
      }
    }
    tree.rank = maxChildRank + 1
  }

  private deepCloneTrees(trees: Tree<T>[]): Tree<T>[] {
    return trees.map((tree) => {
      const node: BootstrappedHeapNode<T> = {
        value: tree.root.value,
        id: tree.root.id,
        tree: null,
      }
      const cloned: Tree<T> = {
        root: node,
        children: {
          trees: this.deepCloneTrees(tree.children.trees),
          size: tree.children.size,
        },
        rank: tree.rank,
      }
      node.tree = cloned
      return cloned
    })
  }

  toString(): string {
    return `${BootstrappedHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'BootstrappedHeap', size: this.size, items: this.toArray() }
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

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}

export type { BootstrappedHeapOptions, BootstrappedHeapNode } from './types.js'
