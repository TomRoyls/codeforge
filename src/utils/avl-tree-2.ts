export class AVLTree2<T> {
  private root: AVLNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare ?? ((a, b) => a < b ? -1 : a > b ? 1 : 0)
  }

  private height(node: AVLNode<T> | null): number {
    return node ? node.height : 0
  }

  private balanceFactor(node: AVLNode<T>): number {
    return this.height(node.left) - this.height(node.right)
  }

  private updateHeight(node: AVLNode<T>): void {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right))
  }

  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!
    y.left = x.right
    x.right = y
    this.updateHeight(y)
    this.updateHeight(x)
    return x
  }

  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!
    x.right = y.left
    y.left = x
    this.updateHeight(x)
    this.updateHeight(y)
    return y
  }

  private balance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node)
    const bf = this.balanceFactor(node)
    if (bf > 1) {
      if (this.balanceFactor(node.left!) < 0) node.left = this.rotateLeft(node.left!)
      return this.rotateRight(node)
    }
    if (bf < -1) {
      if (this.balanceFactor(node.right!) > 0) node.right = this.rotateRight(node.right!)
      return this.rotateLeft(node)
    }
    return node
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value)
  }

  private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
    if (!node) { this._size++; return new AVLNode(value) }
    const cmp = this.compare(value, node.value)
    if (cmp < 0) node.left = this.insertNode(node.left, value)
    else if (cmp > 0) node.right = this.insertNode(node.right, value)
    else return node
    return this.balance(node)
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
    const visit = (node: AVLNode<T> | null) => {
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

  clone(): AVLTree2<T> {
    const c = new AVLTree2<T>(this.compare)
    for (const v of this.inOrder()) c.insert(v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AVLTree2)) return false
    return this._size === other._size
  }
}

class AVLNode<T> {
  value: T
  left: AVLNode<T> | null = null
  right: AVLNode<T> | null = null
  height = 1

  constructor(value: T) { this.value = value }
}
