/** Leftist Heap - a mergeable heap using null-path-length ranking */

interface LeftistNode<T> {
  value: T
  left: LeftistNode<T> | null
  right: LeftistNode<T> | null
  npl: number
}

export interface LeftistHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export class LeftistHeap<T> {
  private root: LeftistNode<T> | null = null
  private _size = 0
  private readonly compare: (a: T, b: T) => number

  constructor(options?: LeftistHeapOptions<T>) {
    this.compare =
      options?.comparator ?? ((a: T, b: T) => (a as number) - (b as number))
  }

  private static npl(node: LeftistNode<unknown> | null): number {
    return node?.npl ?? 0
  }

  private static updateNpl(node: LeftistNode<unknown>): void {
    node.npl = 1 + Math.min(LeftistHeap.npl(node.left), LeftistHeap.npl(node.right))
  }

  private mergeNodes(
    a: LeftistNode<T> | null,
    b: LeftistNode<T> | null,
  ): LeftistNode<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this.compare(b.value, a.value) < 0) {
      const temp = a
      a = b
      b = temp
    }

    a.right = this.mergeNodes(a.right, b)

    if (LeftistHeap.npl(a.left) < LeftistHeap.npl(a.right)) {
      const temp = a.left
      a.left = a.right
      a.right = temp
    }

    LeftistHeap.updateNpl(a)
    return a
  }

  merge(other: LeftistHeap<T>): void {
    this.root = this.mergeNodes(this.root, other.root)
    this._size += other._size
    other.root = null
    other._size = 0
  }

  insert(value: T): void {
    const node: LeftistNode<T> = {
      value,
      left: null,
      right: null,
      npl: 1,
    }
    this.root = this.mergeNodes(this.root, node)
    this._size++
  }

  extractMin(): T | undefined {
    if (this.root === null) return undefined
    const value = this.root.value
    this.root = this.mergeNodes(this.root.left, this.root.right)
    this._size--
    return value
  }

  peek(): T | undefined {
    return this.root?.value
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

  toArray(): T[] {
    const result: T[] = []
    while (!this.isEmpty()) {
      const val = this.extractMin()
      if (val !== undefined) result.push(val)
    }
    return result
  }

  toString(): string {
    const values: T[] = []
    const walk = (node: LeftistNode<T> | null): void => {
      if (node === null) return
      values.push(node.value)
      walk(node.left)
      walk(node.right)
    }
    walk(this.root)
    return JSON.stringify(values)
  }

  toJSON(): T[] {
    const values: T[] = []
    const walk = (node: LeftistNode<T> | null): void => {
      if (node === null) return
      values.push(node.value)
      walk(node.left)
      walk(node.right)
    }
    walk(this.root)
    return values
  }

  clone(): LeftistHeap<T> {
    const copy = new LeftistHeap<T>({ comparator: this.compare })
    const walk = (node: LeftistNode<T> | null): void => {
      if (node === null) return
      copy.insert(node.value)
      walk(node.left)
      walk(node.right)
    }
    walk(this.root)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LeftistHeap)) return false
    if (this._size !== other._size) return false
    const a = this.clone()
    const b = other.clone()
    while (!a.isEmpty()) {
      if (a.extractMin() !== b.extractMin()) return false
    }
    return true
  }

  static fromArray<U>(items: U[], options?: LeftistHeapOptions<U>): LeftistHeap<U> {
    const heap = new LeftistHeap<U>(options)
    for (const item of items) {
      heap.insert(item)
    }
    return heap
  }
}
