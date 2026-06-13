export class RedBlackTree2<T> {
  private root: RBNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a, b) => a < b ? -1 : a > b ? 1 : 0)
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value)
    if (this.root) this.root.red = false
  }

  private insertNode(node: RBNode<T> | null, value: T): RBNode<T> {
    if (!node) { this._size++; return new RBNode(value) }
    const cmp = this.compare(value, node.value)
    if (cmp < 0) node.left = this.insertNode(node.left, value)
    else if (cmp > 0) node.right = this.insertNode(node.right, value)
    else return node

    if (this.isRed(node.right) && !this.isRed(node.left)) node = this.rotateLeft(node)
    if (this.isRed(node.left) && node.left && this.isRed(node.left.left)) node = this.rotateRight(node)
    if (this.isRed(node.left) && this.isRed(node.right)) this.flipColors(node)

    return node
  }

  private isRed(node: RBNode<T> | null): boolean { return node?.red ?? false }

  private rotateLeft(node: RBNode<T>): RBNode<T> {
    const x = node.right!
    node.right = x.left
    x.left = node
    x.red = node.red
    node.red = true
    return x
  }

  private rotateRight(node: RBNode<T>): RBNode<T> {
    const x = node.left!
    node.left = x.right
    x.right = node
    x.red = node.red
    node.red = true
    return x
  }

  private flipColors(node: RBNode<T>): void {
    node.red = !node.red
    if (node.left) node.left.red = !node.left.red
    if (node.right) node.right.red = !node.right.red
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
    const visit = (node: RBNode<T> | null) => {
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

  clone(): RedBlackTree2<T> {
    const c = new RedBlackTree2<T>(this.compare)
    for (const v of this.inOrder()) c.insert(v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RedBlackTree2)) return false
    return this._size === other._size
  }
}

class RBNode<T> {
  value: T
  left: RBNode<T> | null = null
  right: RBNode<T> | null = null
  red = true

  constructor(value: T) { this.value = value }
}
