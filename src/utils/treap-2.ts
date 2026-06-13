export class Treap2<T> {
  private root: TreapNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a, b) => a < b ? -1 : a > b ? 1 : 0)
  }

  insert(value: T, priority?: number): void {
    this.root = this.insertNode(this.root, value, priority ?? Math.random())
  }

  private insertNode(node: TreapNode<T> | null, value: T, priority: number): TreapNode<T> {
    if (!node) { this._size++; return new TreapNode(value, priority) }
    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value, priority)
      if (node.left.priority > node.priority) node = this.rotateRight(node)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value, priority)
      if (node.right.priority > node.priority) node = this.rotateLeft(node)
    }
    return node
  }

  private rotateRight(node: TreapNode<T>): TreapNode<T> {
    const x = node.left!
    node.left = x.right
    x.right = node
    return x
  }

  private rotateLeft(node: TreapNode<T>): TreapNode<T> {
    const x = node.right!
    node.right = x.left
    x.left = node
    return x
  }

  contains(value: T): boolean {
    let node = this.root
    while (node) {
      const cmp = this.compare(value, node.value)
      if (cmp === 0) return true
      node = cmp < 0 ? node.left : node.right
    }
    return false
  }

  inOrder(): T[] {
    const result: T[] = []
    const visit = (node: TreapNode<T> | null) => {
      if (!node) return
      visit(node.left)
      result.push(node.value)
      visit(node.right)
    }
    visit(this.root)
    return result
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void { this.root = null; this._size = 0 }

  toArray(): T[] { return this.inOrder() }
  toString(): string { return JSON.stringify({ size: this._size }) }
  toJSON(): Record<string, number> { return { size: this._size } }

  clone(): Treap2<T> {
    const c = new Treap2<T>(this.compare)
    for (const v of this.inOrder()) c.insert(v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Treap2)) return false
    return this._size === other._size
  }
}

class TreapNode<T> {
  value: T
  priority: number
  left: TreapNode<T> | null = null
  right: TreapNode<T> | null = null

  constructor(value: T, priority: number) { this.value = value; this.priority = priority }
}
