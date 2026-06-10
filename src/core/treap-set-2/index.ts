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

export class TreapSet2<T> {
  private root: TreapNode<T> | null
  private compare: (a: T, b: T) => number
  private _size: number
  private seed: number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
    this.root = null
    this._size = 0
    this.seed = Date.now()
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

    const cmp = this.compare(newNode.value, node.value)

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

  add(value: T): void {
    const existing = this.findNode(this.root, value)
    if (existing) {
      return
    }
    const newNode = new TreapNode(value, this.nextPriority())
    this.root = this.insertNode(this.root, newNode)
  }

  private findNode(node: TreapNode<T> | null, value: T): TreapNode<T> | null {
    while (node) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        node = node.right
      } else {
        return node
      }
    }
    return null
  }

  has(value: T): boolean {
    return this.findNode(this.root, value) !== null
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

  private deleteNode(node: TreapNode<T> | null, value: T): { node: TreapNode<T> | null, deleted: boolean } {
    if (!node) {
      return { node: null, deleted: false }
    }

    const cmp = this.compare(value, node.value)

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

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  private toArrayNode(node: TreapNode<T> | null, result: T[]): void {
    if (!node) {
      return
    }
    this.toArrayNode(node.left, result)
    result.push(node.value)
    this.toArrayNode(node.right, result)
  }

  toArray(): T[] {
    const result: T[] = []
    this.toArrayNode(this.root, result)
    return result
  }

  private insertAll(values: T[]): void {
    for (const value of values) {
      this.add(value)
    }
  }

  union(other: TreapSet2<T>): TreapSet2<T> {
    const result = new TreapSet2<T>(this.compare)
    result.insertAll(this.toArray())
    result.insertAll(other.toArray())
    return result
  }

  intersection(other: TreapSet2<T>): TreapSet2<T> {
    const result = new TreapSet2<T>(this.compare)
    const values = this.toArray()
    const otherValues = other.toArray()

    let i = 0
    let j = 0

    while (i < values.length && j < otherValues.length) {
      const cmp = this.compare(values[i]!, otherValues[j]!)
      if (cmp < 0) {
        i++
      } else if (cmp > 0) {
        j++
      } else {
        result.add(values[i]!)
        i++
        j++
      }
    }

    return result
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

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'TreapSet2', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `TreapSet2({ size: ${this.size} })`
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
}
