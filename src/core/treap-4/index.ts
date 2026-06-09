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

export class Treap4<T> {
  private root: TreapNode<T> | null
  private comparator: (a: T, b: T) => number
  private seed: number
  private _size: number

  constructor(comparator?: (a: T, b: T) => number, seed?: number) {
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
    this.seed = seed || Date.now()
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

  insert(value: T): this {
    const newNode = new TreapNode(value, this.nextPriority())
    this.root = this.insertNode(this.root, newNode)
    return this
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

  min(): T | null {
    if (!this.root) {
      return null
    }

    let node = this.root
    while (node.left) {
      node = node.left
    }

    return node.value
  }

  max(): T | null {
    if (!this.root) {
      return null
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

  get isEmpty(): boolean {
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

  forEach(callback: (value: T, index: number) => void): void {
    const values = this.toArray()
    values.forEach((value, index) => callback(value, index))
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

  split(value: T): [Treap4<T>, Treap4<T>] {
    const [leftRoot, rightRoot] = this.splitNode(this.root, value)

    const leftTreap = new Treap4<T>(this.comparator, this.seed)
    leftTreap.root = leftRoot
    leftTreap._size = this.countNodes(leftRoot)

    const rightTreap = new Treap4<T>(this.comparator, this.seed)
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

  merge(other: Treap4<T>): this {
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

  toJSON() {
    return { type: 'Treap4', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `Treap4({ size: ${this.size} })`
  }
}
