export class BinarySearchTree2<T> {
  private root: BSTNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a, b) => a < b ? -1 : a > b ? 1 : 0)
  }

  insert(value: T): void {
    const node = new BSTNode(value)
    this._size++
    if (!this.root) { this.root = node; return }
    let current = this.root
    while (true) {
      const cmp = this.compare(value, current.value)
      if (cmp <= 0) {
        if (!current.left) { current.left = node; return }
        current = current.left
      } else {
        if (!current.right) { current.right = node; return }
        current = current.right
      }
    }
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

  minimum(): T | undefined {
    if (!this.root) return undefined
    let node = this.root
    while (node.left) node = node.left
    return node.value
  }

  maximum(): T | undefined {
    if (!this.root) return undefined
    let node = this.root
    while (node.right) node = node.right
    return node.value
  }

  inOrder(): T[] {
    const result: T[] = []
    const stack: BSTNode<T>[] = []
    let node = this.root
    while (node || stack.length > 0) {
      while (node) { stack.push(node); node = node.left }
      node = stack.pop()!
      result.push(node.value)
      node = node.right
    }
    return result
  }

  height(): number {
    const h = (node: BSTNode<T> | null): number => {
      if (!node) return 0
      return 1 + Math.max(h(node.left), h(node.right))
    }
    return h(this.root)
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void { this.root = null; this._size = 0 }

  toArray(): T[] { return this.inOrder() }
  toString(): string { return JSON.stringify({ size: this._size, height: this.height() }) }
  toJSON(): Record<string, number> { return { size: this._size, height: this.height() } }

  clone(): BinarySearchTree2<T> {
    const c = new BinarySearchTree2<T>(this.compare)
    for (const v of this.inOrder()) c.insert(v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BinarySearchTree2)) return false
    return this._size === other._size
  }
}

class BSTNode<T> {
  value: T
  left: BSTNode<T> | null = null
  right: BSTNode<T> | null = null

  constructor(value: T) { this.value = value }
}
