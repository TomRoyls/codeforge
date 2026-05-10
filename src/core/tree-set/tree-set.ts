import type { TreeSetNode, TreeSetCompareFunction, TreeSetOptions, TreeSetStats } from './types.js'

export class TreeSet<T> {
  private root: TreeSetNode<T> | null = null
  private _size: number = 0
  private compare: TreeSetCompareFunction<T>

  constructor(options?: TreeSetOptions<T>) {
    this.compare = options?.compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private leftRotate(x: TreeSetNode<T>): void {
    const y = x.right!
    x.right = y.left
    if (y.left !== null) {
      y.left.parent = x
    }
    y.parent = x.parent
    if (x.parent === null) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }
    y.left = x
    x.parent = y
  }

  private rightRotate(y: TreeSetNode<T>): void {
    const x = y.left!
    y.left = x.right
    if (x.right !== null) {
      x.right.parent = y
    }
    x.parent = y.parent
    if (y.parent === null) {
      this.root = x
    } else if (y === y.parent.right) {
      y.parent.right = x
    } else {
      y.parent.left = x
    }
    x.right = y
    y.parent = x
  }

  private insertFixup(z: TreeSetNode<T>): void {
    while (z.parent !== null && z.parent.color === 'red') {
      if (z.parent === z.parent.parent!.left) {
        const y = z.parent.parent!.right
        if (y !== null && y.color === 'red') {
          z.parent.color = 'black'
          y.color = 'black'
          z.parent.parent!.color = 'red'
          z = z.parent.parent!
        } else {
          if (z === z.parent.right) {
            z = z.parent
            this.leftRotate(z)
          }
          z.parent!.color = 'black'
          z.parent!.parent!.color = 'red'
          this.rightRotate(z.parent!.parent!)
        }
      } else {
        const y = z.parent.parent!.left
        if (y !== null && y.color === 'red') {
          z.parent.color = 'black'
          y.color = 'black'
          z.parent.parent!.color = 'red'
          z = z.parent.parent!
        } else {
          if (z === z.parent.left) {
            z = z.parent
            this.rightRotate(z)
          }
          z.parent!.color = 'black'
          z.parent!.parent!.color = 'red'
          this.leftRotate(z.parent!.parent!)
        }
      }
    }
    this.root!.color = 'black'
  }

  add(value: T): boolean {
    let parent: TreeSetNode<T> | null = null
    let current = this.root
    while (current !== null) {
      parent = current
      const cmp = this.compare(value, current.value)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return false
      }
    }
    const newNode: TreeSetNode<T> = {
      value,
      color: 'red',
      left: null,
      right: null,
      parent,
    }
    if (parent === null) {
      this.root = newNode
    } else if (this.compare(value, parent.value) < 0) {
      parent.left = newNode
    } else {
      parent.right = newNode
    }
    this._size++
    this.insertFixup(newNode)
    return true
  }

  has(value: T): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return true
      }
    }
    return false
  }

  private findNode(value: T): TreeSetNode<T> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current
      }
    }
    return null
  }

  private transplant(u: TreeSetNode<T>, v: TreeSetNode<T> | null): void {
    if (u.parent === null) {
      this.root = v
    } else if (u === u.parent.left) {
      u.parent.left = v
    } else {
      u.parent.right = v
    }
    if (v !== null) {
      v.parent = u.parent
    }
  }

  private minimumNode(node: TreeSetNode<T>): TreeSetNode<T> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private maximumNode(node: TreeSetNode<T>): TreeSetNode<T> {
    while (node.right !== null) {
      node = node.right
    }
    return node
  }

  private deleteFixup(x: TreeSetNode<T> | null, parent: TreeSetNode<T> | null): void {
    while (x !== this.root && (x === null || x.color === 'black')) {
      if (x !== null) {
        parent = x.parent
      }
      if (parent === null) break
      if (x === parent.left) {
        let w = parent.right
        if (w !== null && w.color === 'red') {
          w.color = 'black'
          parent.color = 'red'
          this.leftRotate(parent)
          w = parent.right
        }
        if (
          (w === null || w.left === null || w.left.color === 'black') &&
          (w === null || w.right === null || w.right.color === 'black')
        ) {
          if (w !== null) w.color = 'red'
          x = parent
        } else {
          if (w === null || w.right === null || w.right.color === 'black') {
            if (w !== null && w.left !== null) w.left.color = 'black'
            if (w !== null) w.color = 'red'
            if (w !== null) this.rightRotate(w)
            w = parent.right
          }
          if (w !== null) w.color = parent.color
          parent.color = 'black'
          if (w !== null && w.right !== null) w.right.color = 'black'
          this.leftRotate(parent)
          x = this.root
        }
      } else {
        let w = parent.left
        if (w !== null && w.color === 'red') {
          w.color = 'black'
          parent.color = 'red'
          this.rightRotate(parent)
          w = parent.left
        }
        if (
          (w === null || w.right === null || w.right.color === 'black') &&
          (w === null || w.left === null || w.left.color === 'black')
        ) {
          if (w !== null) w.color = 'red'
          x = parent
        } else {
          if (w === null || w.left === null || w.left.color === 'black') {
            if (w !== null && w.right !== null) w.right.color = 'black'
            if (w !== null) w.color = 'red'
            if (w !== null) this.leftRotate(w)
            w = parent.left
          }
          if (w !== null) w.color = parent.color
          parent.color = 'black'
          if (w !== null && w.left !== null) w.left.color = 'black'
          this.rightRotate(parent)
          x = this.root
        }
      }
    }
    if (x !== null) {
      x.color = 'black'
    }
  }

  delete(value: T): boolean {
    const z = this.findNode(value)
    if (z === null) return false

    let y: TreeSetNode<T> = z
    let yOriginalColor = y.color
    let x: TreeSetNode<T> | null = null
    let xParent: TreeSetNode<T> | null = null

    if (z.left === null) {
      x = z.right
      xParent = z.parent
      this.transplant(z, z.right)
    } else if (z.right === null) {
      x = z.left
      xParent = z.parent
      this.transplant(z, z.left)
    } else {
      y = this.minimumNode(z.right)
      yOriginalColor = y.color
      x = y.right
      if (y.parent === z) {
        xParent = y
      } else {
        xParent = y.parent
        this.transplant(y, y.right)
        y.right = z.right
        y.right!.parent = y
      }
      this.transplant(z, y)
      y.left = z.left
      y.left!.parent = y
      y.color = z.color
    }

    this._size--

    if (yOriginalColor === 'black') {
      this.deleteFixup(x, xParent)
    }

    return true
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

  get min(): T | undefined {
    if (this.root === null) return undefined
    return this.minimumNode(this.root).value
  }

  get max(): T | undefined {
    if (this.root === null) return undefined
    return this.maximumNode(this.root).value
  }

  lowerBound(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.value, value)
      if (cmp >= 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.value, value)
      if (cmp > 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  private rangeTraversal(node: TreeSetNode<T> | null, lower: T, upper: T, result: T[]): void {
    if (node === null) return
    const cmpLower = this.compare(node.value, lower)
    const cmpUpper = this.compare(node.value, upper)
    if (cmpLower > 0) {
      this.rangeTraversal(node.left, lower, upper, result)
    }
    if (cmpLower >= 0 && cmpUpper <= 0) {
      result.push(node.value)
    }
    if (cmpUpper < 0) {
      this.rangeTraversal(node.right, lower, upper, result)
    }
  }

  range(lower: T, upper: T): T[] {
    if (this.compare(lower, upper) > 0) return []
    const result: T[] = []
    this.rangeTraversal(this.root, lower, upper, result)
    return result
  }

  private inOrderTraversal(node: TreeSetNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push(node.value)
    this.inOrderTraversal(node.right, result)
  }

  forEach(callback: (value: T) => void): void {
    const all = this.toArray()
    for (const value of all) {
      callback(value)
    }
  }

  toArray(): T[] {
    const result: T[] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  clone(): TreeSet<T> {
    const result = new TreeSet<T>({ compare: this.compare })
    const all = this.toArray()
    for (const value of all) {
      result.add(value)
    }
    return result
  }

  static from<T>(values: Iterable<T>, options?: TreeSetOptions<T>): TreeSet<T> {
    const set = new TreeSet<T>(options)
    for (const value of values) {
      set.add(value)
    }
    return set
  }

  union(other: TreeSet<T>): TreeSet<T> {
    const result = new TreeSet<T>({ compare: this.compare })
    for (const value of this.toArray()) {
      result.add(value)
    }
    for (const value of other.toArray()) {
      result.add(value)
    }
    return result
  }

  intersection(other: TreeSet<T>): TreeSet<T> {
    const result = new TreeSet<T>({ compare: this.compare })
    for (const value of this.toArray()) {
      if (other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  difference(other: TreeSet<T>): TreeSet<T> {
    const result = new TreeSet<T>({ compare: this.compare })
    for (const value of this.toArray()) {
      if (!other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  symmetricDifference(other: TreeSet<T>): TreeSet<T> {
    const result = new TreeSet<T>({ compare: this.compare })
    for (const value of this.toArray()) {
      if (!other.has(value)) {
        result.add(value)
      }
    }
    for (const value of other.toArray()) {
      if (!this.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  isSubsetOf(other: TreeSet<T>): boolean {
    for (const value of this.toArray()) {
      if (!other.has(value)) return false
    }
    return true
  }

  isSupersetOf(other: TreeSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  predecessor(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.value, value)
      if (cmp < 0) {
        result = node.value
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  successor(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.value, value)
      if (cmp > 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  rank(value: T): number {
    let count = 0
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        count += 1 + this.subtreeSize(node.left)
        node = node.right
      } else {
        count += this.subtreeSize(node.left)
        return count
      }
    }
    return -1
  }

  private subtreeSize(node: TreeSetNode<T> | null): number {
    if (node === null) return 0
    return 1 + this.subtreeSize(node.left) + this.subtreeSize(node.right)
  }

  atIndex(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.atIndexNode(this.root, index)
  }

  private atIndexNode(node: TreeSetNode<T> | null, index: number): T {
    if (node === null) {
      throw new RangeError(`Index out of bounds`)
    }
    const leftSize = this.subtreeSize(node.left)
    if (index < leftSize) {
      return this.atIndexNode(node.left, index)
    } else if (index === leftSize) {
      return node.value
    } else {
      return this.atIndexNode(node.right, index - leftSize - 1)
    }
  }

  private computeHeight(node: TreeSetNode<T> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  private checkBalance(): boolean {
    if (this.root === null) return true
    const height = this.computeHeight(this.root)
    const maxAllowed = 2 * Math.ceil(Math.log2(this._size + 1))
    return height <= maxAllowed
  }

  get stats(): TreeSetStats {
    return {
      nodeCount: this._size,
      height: this.computeHeight(this.root),
      isBalanced: this.checkBalance(),
      minValue: this.min ?? null,
      maxValue: this.max ?? null,
    }
  }

  [Symbol.iterator](): Iterator<T> {
    const all = this.toArray()
    let index = 0
    return {
      next: () => {
        if (index < all.length) {
          const value = all[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<T>
      },
    }
  }
}

export type { TreeSetNode, TreeSetCompareFunction, TreeSetOptions, TreeSetStats } from './types.js'
