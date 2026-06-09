class CartesianNode<T> {
  value: T
  index: number
  left: CartesianNode<T> | null
  right: CartesianNode<T> | null

  constructor(value: T, index: number) {
    this.value = value
    this.index = index
    this.left = null
    this.right = null
  }
}

export class CartesianTree3<T> {
  private root: CartesianNode<T> | null
  private _size: number

  constructor() {
    this.root = null
    this._size = 0
  }

  buildFromArray(arr: T[]): void {
    if (arr.length === 0) {
      this.clear()
      return
    }

    this._size = arr.length
    const nodes = arr.map((value, index) => new CartesianNode(value, index))
    const stack: CartesianNode<T>[] = []

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!
      let lastPopped: CartesianNode<T> | null = null

      while (stack.length > 0) {
        const top = stack[stack.length - 1]!
        if (this.compare(node, top) >= 0) {
          break
        }
        lastPopped = stack.pop()!
      }

      if (stack.length > 0) {
        const top = stack[stack.length - 1]!
        node.left = top.right
        top.right = node
      } else {
        node.left = lastPopped
      }

      stack.push(node)
    }

    this.root = stack[0]!
  }

  private compare(a: CartesianNode<T>, b: CartesianNode<T>): number {
    if (a.value < b.value) return -1
    if (a.value > b.value) return 1
    return 0
  }

  inorderTraversal(): T[] {
    const result: T[] = []
    this.inorder(this.root, result)
    return result
  }

  private inorder(node: CartesianNode<T> | null, result: T[]): void {
    if (!node) {
      return
    }
    this.inorder(node.left, result)
    result.push(node.value)
    this.inorder(node.right, result)
  }

  preorderTraversal(): T[] {
    const result: T[] = []
    this.preorder(this.root, result)
    return result
  }

  private preorder(node: CartesianNode<T> | null, result: T[]): void {
    if (!node) {
      return
    }
    result.push(node.value)
    this.preorder(node.left, result)
    this.preorder(node.right, result)
  }

  rangeQuery(low: T, high: T): T[] {
    const result: T[] = []
    this.range(this.root, low, high, result)
    return result
  }

  private range(node: CartesianNode<T> | null, low: T, high: T, result: T[]): void {
    if (!node) {
      return
    }

    this.range(node.left, low, high, result)

    if (node.value >= low && node.value <= high) {
      result.push(node.value)
    }

    this.range(node.right, low, high, result)
  }

  findMin(): T | undefined {
    let node = this.root
    if (!node) {
      return undefined
    }

    while (node.left) {
      node = node.left
    }
    return node.value
  }

  findMax(): T | undefined {
    let node = this.root
    if (!node) {
      return undefined
    }

    while (node.right) {
      node = node.right
    }
    return node.value
  }

  kthSmallest(k: number): T | undefined {
    if (k < 0 || k >= this._size) {
      return undefined
    }
    return this.kth(this.root, k)
  }

  private kth(node: CartesianNode<T> | null, k: number): T | undefined {
    if (!node) {
      return undefined
    }

    const leftSize = this.countNodes(node.left)

    if (k < leftSize) {
      return this.kth(node.left, k)
    } else if (k === leftSize) {
      return node.value
    } else {
      return this.kth(node.right, k - leftSize - 1)
    }
  }

  private countNodes(node: CartesianNode<T> | null): number {
    if (!node) {
      return 0
    }
    return 1 + this.countNodes(node.left) + this.countNodes(node.right)
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

  getTimeComplexity(): string {
    return 'Build: O(n), Query: O(log n), Worst: O(n)'
  }


  *[Symbol.iterator](): IterableIterator<T> {
    for (const val of this.inorderTraversal()) {
      yield val;
    }
  }

  toArray() {
    return [...this]
  }

  toString(): string {
    return `${CartesianTree3}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'CartesianTree3', size: this.size, items: this.toArray() }
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
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }
}
