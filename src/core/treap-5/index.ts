class TreapNode<T> {
  value: T
  priority: number
  left: TreapNode<T> | null
  right: TreapNode<T> | null

  constructor(value: T, priority: number) {
    this.value = value
    this.priority = priority
    this.left = null
    this.right = null
  }
}

export class Treap<T> {
  private root: TreapNode<T> | null
  private comparator: (a: T, b: T) => number
  private seed: number
  private _size: number

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
    this.seed = Date.now()
    this.root = null
    this._size = 0
  }

  private nextPriority(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed
  }

  private rotateRight(node: TreapNode<T>): TreapNode<T> {
    const left = node.left!
    node.left = left.right
    left.right = node
    return left
  }

  private rotateLeft(node: TreapNode<T>): TreapNode<T> {
    const right = node.right!
    node.right = right.left
    right.left = node
    return right
  }

  private insertNode(node: TreapNode<T> | null, newNode: TreapNode<T>): TreapNode<T> {
    if (!node) {
      this._size++
      return newNode
    }

    const cmp = this.comparator(newNode.value, node.value)

    if (cmp < 0) {
      node.left = this.insertNode(node.left, newNode)
      if (node.left!.priority > node.priority) {
        node = this.rotateRight(node)
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, newNode)
      if (node.right!.priority > node.priority) {
        node = this.rotateLeft(node)
      }
    }

    return node
  }

  insert(value: T): void {
    const newNode = new TreapNode(value, this.nextPriority())
    this.root = this.insertNode(this.root, newNode)
  }

  search(value: T): boolean {
    let node = this.root

    while (node) {
      const cmp = this.comparator(value, node.value)

      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        node = node.right
      } else {
        return true
      }
    }

    return false
  }

  contains(value: T): boolean {
    return this.search(value)
  }

  min(): T | undefined {
    if (!this.root) {
      return undefined
    }

    let node = this.root
    while (node.left) {
      node = node.left
    }

    return node.value
  }

  max(): T | undefined {
    if (!this.root) {
      return undefined
    }

    let node = this.root
    while (node.right) {
      node = node.right
    }

    return node.value
  }

  private inOrderNode(node: TreapNode<T> | null, result: T[]): void {
    if (!node) {
      return
    }

    this.inOrderNode(node.left, result)
    result.push(node.value)
    this.inOrderNode(node.right, result)
  }

  inOrderTraversal(): T[] {
    const result: T[] = []
    this.inOrderNode(this.root, result)
    return result
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

  toArray(): T[] {
    return this.inOrderTraversal()
  }

  private splitNode(node: TreapNode<T> | null, value: T): [TreapNode<T> | null, TreapNode<T> | null] {
    if (!node) {
      return [null, null]
    }

    const cmp = this.comparator(value, node.value)

    if (cmp < 0) {
      const [left, right] = this.splitNode(node.left, value)
      node.left = right
      return [left, node]
    } else {
      const [left, right] = this.splitNode(node.right, value)
      node.right = left
      return [node, right]
    }
  }

  split(value: T): [Treap<T>, Treap<T>] {
    const [leftRoot, rightRoot] = this.splitNode(this.root, value)

    const leftTreap = new Treap<T>(this.comparator)
    leftTreap.root = leftRoot
    leftTreap._size = this.countNodes(leftRoot)

    const rightTreap = new Treap<T>(this.comparator)
    rightTreap.root = rightRoot
    rightTreap._size = this.countNodes(rightRoot)

    return [leftTreap, rightTreap]
  }

  private countNodes(node: TreapNode<T> | null): number {
    if (!node) {
      return 0
    }

    return 1 + this.countNodes(node.left) + this.countNodes(node.right)
  }

  private mergeNodes(left: TreapNode<T> | null, right: TreapNode<T> | null): TreapNode<T> | null {
    if (!left) {
      return right
    }

    if (!right) {
      return left
    }

    if (left.priority > right.priority) {
      left.right = this.mergeNodes(left.right, right)
      return left
    } else {
      right.left = this.mergeNodes(left, right.left)
      return right
    }
  }

  merge(other: Treap<T>): this {
    this.root = this.mergeNodes(this.root, other.root)
    this._size = this.countNodes(this.root)
    return this
  }

  private deleteNode(node: TreapNode<T> | null, value: T): { node: TreapNode<T> | null, deleted: boolean } {
    if (!node) {
      return { node: null, deleted: false }
    }

    const cmp = this.comparator(value, node.value)

    if (cmp < 0) {
      const result = this.deleteNode(node.left, value)
      node.left = result.node
      return { node, deleted: result.deleted }
    } else if (cmp > 0) {
      const result = this.deleteNode(node.right, value)
      node.right = result.node
      return { node, deleted: result.deleted }
    } else {
      this._size--
      const merged = this.mergeNodes(node.left, node.right)
      return { node: merged, deleted: true }
    }
  }

  delete(value: T): boolean {
    const result = this.deleteNode(this.root, value)
    this.root = result.node
    return result.deleted
  }

  getTimeComplexity(): string {
    return 'Average: O(log n), Worst: O(n)'
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    type N = TreapNode<T>;
    const stack: Array<N> = [];
    let current: N | null = this.root;
    return {
      next: () => {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value = current.value as ReturnType<this['toArray']>[number];
          current = current.right;
          return { value, done: false };
        }
        return { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true };
      }
    };
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'Treap', items: this.toArray() }
  }

  toString(): string {
    return `Treap({ size: ${this._size} })`
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
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

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }
}
