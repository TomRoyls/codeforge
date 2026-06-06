export interface AVLNode<K, V> {
  key: K
  value: V
  left: AVLNode<K, V> | null
  right: AVLNode<K, V> | null
  height: number
}

export class AVLTree<K, V> {
  private root: AVLNode<K, V> | null = null
  private _size = 0
  private compare: (a: K, b: K) => number

  constructor(comparator?: (a: K, b: K) => number) {
    this.compare = comparator ?? ((a: K, b: K) => (a as number) - (b as number))
  }

  insert(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private insertNode(node: AVLNode<K, V> | null, key: K, value: V): AVLNode<K, V> {
    if (node === null) {
      this._size++
      return { key, value, left: null, right: null, height: 1 }
    }

    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
    } else {
      node.value = value
      return node
    }

    this.updateHeight(node)
    return this.rebalance(node)
  }

  delete(key: K): boolean {
    const prevSize = this._size
    this.root = this.deleteNode(this.root, key)
    return this._size < prevSize
  }

  private deleteNode(node: AVLNode<K, V> | null, key: K): AVLNode<K, V> | null {
    if (node === null) return null

    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      this._size--

      if (node.left === null) return node.right
      if (node.right === null) return node.left

      const successor = this.findMinNode(node.right)
      node.key = successor.key
      node.value = successor.value
      node.right = this.deleteMinNode(node.right)
    }

    this.updateHeight(node)
    return this.rebalance(node)
  }

  private deleteMinNode(node: AVLNode<K, V>): AVLNode<K, V> | null {
    if (node.left === null) return node.right
    node.left = this.deleteMinNode(node.left)
    this.updateHeight(node)
    return this.rebalance(node)
  }

  find(key: K): V | undefined {
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) node = node.left
      else if (cmp > 0) node = node.right
      else return node.value
    }
    return undefined
  }

  contains(key: K): boolean {
    return this.find(key) !== undefined
  }

  get min(): K | undefined {
    if (this.root === null) return undefined
    return this.findMinNode(this.root).key
  }

  get max(): K | undefined {
    let node = this.root
    if (node === null) return undefined
    while (node.right !== null) node = node.right
    return node.key
  }

  get size(): number {
    return this._size
  }

  get height(): number {
    return this.root === null ? 0 : this.root.height
  }

  inOrder(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  preOrder(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    this.preOrderTraversal(this.root, result)
    return result
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  private rotateLeft(z: AVLNode<K, V>): AVLNode<K, V> {
    const y = z.right!
    const t2 = y.left
    y.left = z
    z.right = t2
    this.updateHeight(z)
    this.updateHeight(y)
    return y
  }

  private rotateRight(z: AVLNode<K, V>): AVLNode<K, V> {
    const y = z.left!
    const t3 = y.right
    y.right = z
    z.left = t3
    this.updateHeight(z)
    this.updateHeight(y)
    return y
  }

  private getBalance(node: AVLNode<K, V>): number {
    const leftH = node.left === null ? 0 : node.left.height
    const rightH = node.right === null ? 0 : node.right.height
    return leftH - rightH
  }

  private updateHeight(node: AVLNode<K, V>): void {
    const leftH = node.left === null ? 0 : node.left.height
    const rightH = node.right === null ? 0 : node.right.height
    node.height = 1 + Math.max(leftH, rightH)
  }

  private findMinNode(node: AVLNode<K, V>): AVLNode<K, V> {
    while (node.left !== null) node = node.left
    return node
  }

  private rebalance(node: AVLNode<K, V>): AVLNode<K, V> {
    const balance = this.getBalance(node)

    if (balance > 1) {
      if (this.getBalance(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }

    if (balance < -1) {
      if (this.getBalance(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }

    return node
  }

  private inOrderTraversal(
    node: AVLNode<K, V> | null,
    result: Array<{ key: K; value: V }>,
  ): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push({ key: node.key, value: node.value })
    this.inOrderTraversal(node.right, result)
  }

  private preOrderTraversal(
    node: AVLNode<K, V> | null,
    result: Array<{ key: K; value: V }>,
  ): void {
    if (node === null) return
    result.push({ key: node.key, value: node.value })
    this.preOrderTraversal(node.left, result)
    this.preOrderTraversal(node.right, result)
  }

  toString(): string {
    const entries = this.inOrder()
    return '[' + entries.map((e) => `${String(e.key)}=${String(e.value)}`).join(', ') + ']'
  }

  toJSON(): unknown {
    const result: Record<string, V> = {}
    for (const e of this.inOrder()) {
      result[String(e.key)] = e.value
    }
    return result
  }

  private cloneNode(node: AVLNode<K, V> | null): AVLNode<K, V> | null {
    if (node === null) return null
    return {
      key: node.key,
      value: node.value,
      height: node.height,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
    }
  }

  clone(): this {
    const tree = new AVLTree<K, V>(this.compare)
    tree.root = this.cloneNode(this.root)
    tree._size = this._size
    return tree as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AVLTree)) return false
    const a = this.inOrder()
    const b = other.inOrder()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      const ae = a[i]!
      const be = b[i]!
      if (ae.key !== be.key) return false
      if (ae.value !== be.value) return false
    }
    return true
  }
}
