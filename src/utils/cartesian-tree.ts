export class CartesianNode<T> {
  constructor(
    public value: T,
    public priority: number,
    public left: CartesianNode<T> | null = null,
    public right: CartesianNode<T> | null = null,
    public parent: CartesianNode<T> | null = null,
  ) {}
}

export class CartesianTree<T> {
  private root: CartesianNode<T> | null = null
  private _size: number = 0

  static fromArray<T>(items: T[], priorityFn: (item: T, index: number) => number = (_, i) => i): CartesianTree<T> {
    const tree = new CartesianTree<T>()
    if (items.length === 0) return tree

    const nodes = items.map((item, i) => new CartesianNode(item, priorityFn(item, i)))

    let last: CartesianNode<T> | null = null
    for (const node of nodes) {
      let current = last
      while (current !== null && current.priority > node.priority) {
        current = current.parent
      }

      if (current === null) {
        node.left = tree.root
        if (tree.root) tree.root.parent = node
        tree.root = node
      } else {
        node.left = current.right
        if (current.right) current.right.parent = node
        current.right = node
        node.parent = current
      }

      if (node.left) node.left.parent = node
      last = node
    }

    tree._size = items.length
    return tree
  }

  insert(value: T, priority: number): void {
    const node = new CartesianNode(value, priority)
    this._size++

    if (this.root === null) {
      this.root = node
      return
    }

    let current = this.root
    while (current.right !== null && current.priority <= priority) {
      current = current.right
    }

    if (current.priority > priority) {
      node.left = current.left
      node.right = current
      node.parent = current.parent
      if (current.left) current.left.parent = node
      current.left = null
      current.parent = node
      if (node.parent) {
        if (node.parent.right === current) node.parent.right = node
        else node.parent.left = node
      } else {
        this.root = node
      }
    } else {
      current.right = node
      node.parent = current
    }
  }

  *inorder(): Generator<T> {
    yield* this.inorderHelper(this.root)
  }

  *preorder(): Generator<T> {
    yield* this.preorderHelper(this.root)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get min(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) node = node.left
    return node.value
  }

  get max(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) node = node.right
    return node.value
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  private *inorderHelper(node: CartesianNode<T> | null): Generator<T> {
    if (node === null) return
    yield* this.inorderHelper(node.left)
    yield node.value
    yield* this.inorderHelper(node.right)
  }

  private *preorderHelper(node: CartesianNode<T> | null): Generator<T> {
    if (node === null) return
    yield node.value
    yield* this.preorderHelper(node.left)
    yield* this.preorderHelper(node.right)
  }
}
