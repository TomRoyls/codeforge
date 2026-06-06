export interface TreapNode<K, V> {
  key: K
  value: V
  priority: number
  left: TreapNode<K, V> | null
  right: TreapNode<K, V> | null
}

export class Treap<K, V> {
  private root: TreapNode<K, V> | null = null
  private _size = 0
  private compare: (a: K, b: K) => number

  constructor(comparator?: (a: K, b: K) => number) {
    this.compare = comparator ?? ((a: K, b: K) => (a as number) - (b as number))
  }

  insert(key: K, value: V): void {
    const [newRoot, inserted] = this._insert(this.root, key, value)
    this.root = newRoot
    if (inserted) this._size++
  }

  private _insert(
    node: TreapNode<K, V> | null,
    key: K,
    value: V,
  ): [TreapNode<K, V> | null, boolean] {
    if (node === null) {
      return [
        { key, value, priority: Math.random(), left: null, right: null },
        true,
      ]
    }

    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      const [newLeft, inserted] = this._insert(node.left, key, value)
      node.left = newLeft
      if (inserted && node.left !== null && node.left.priority > node.priority) {
        node = this._rotateRight(node)
      }
      return [node, inserted]
    }
    if (cmp > 0) {
      const [newRight, inserted] = this._insert(node.right, key, value)
      node.right = newRight
      if (inserted && node.right !== null && node.right.priority > node.priority) {
        node = this._rotateLeft(node)
      }
      return [node, inserted]
    }

    node.value = value
    return [node, false]
  }

  delete(key: K): boolean {
    const [newRoot, deleted] = this._delete(this.root, key)
    this.root = newRoot
    if (deleted) this._size--
    return deleted
  }

  private _delete(
    node: TreapNode<K, V> | null,
    key: K,
  ): [TreapNode<K, V> | null, boolean] {
    if (node === null) return [null, false]

    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      const [newLeft, deleted] = this._delete(node.left, key)
      node.left = newLeft
      return [node, deleted]
    }
    if (cmp > 0) {
      const [newRight, deleted] = this._delete(node.right, key)
      node.right = newRight
      return [node, deleted]
    }

    return [this._deleteNode(node), true]
  }

  private _deleteNode(node: TreapNode<K, V>): TreapNode<K, V> | null {
    if (node.left === null) return node.right
    if (node.right === null) return node.left

    if (node.left.priority > node.right.priority) {
      const rotated = this._rotateRight(node)
      rotated.right = this._deleteNode(rotated.right!)
      return rotated
    }
    const rotated = this._rotateLeft(node)
    rotated.left = this._deleteNode(rotated.left!)
    return rotated
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
    let node = this.root
    while (node.left !== null) node = node.left
    return node.key
  }

  get max(): K | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) node = node.right
    return node.key
  }

  get size(): number {
    return this._size
  }

  get height(): number {
    return this._height(this.root)
  }

  private _height(node: TreapNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this._height(node.left), this._height(node.right))
  }

  inOrder(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = []
    this._inOrder(this.root, result)
    return result
  }

  private _inOrder(
    node: TreapNode<K, V> | null,
    result: Array<{ key: K; value: V }>,
  ): void {
    if (node === null) return
    this._inOrder(node.left, result)
    result.push({ key: node.key, value: node.value })
    this._inOrder(node.right, result)
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  getRoot(): TreapNode<K, V> | null {
    return this.root
  }

  private _rotateLeft(node: TreapNode<K, V>): TreapNode<K, V> {
    const newRoot = node.right!
    node.right = newRoot.left
    newRoot.left = node
    return newRoot
  }

  private _rotateRight(node: TreapNode<K, V>): TreapNode<K, V> {
    const newRoot = node.left!
    node.left = newRoot.right
    newRoot.right = node
    return newRoot
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

  private cloneNode(node: TreapNode<K, V> | null): TreapNode<K, V> | null {
    if (node === null) return null
    return {
      key: node.key,
      value: node.value,
      priority: node.priority,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
    }
  }

  clone(): this {
    const tree = new Treap<K, V>(this.compare)
    tree.root = this.cloneNode(this.root)
    tree._size = this._size
    return tree as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Treap)) return false
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
