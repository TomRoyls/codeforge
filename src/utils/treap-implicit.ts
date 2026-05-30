class TreapNode<T> {
  value: T
  priority: number
  left: TreapNode<T> | null
  right: TreapNode<T> | null
  size: number
  rev: boolean

  constructor(value: T) {
    this.value = value
    this.priority = Math.random()
    this.left = null
    this.right = null
    this.size = 1
    this.rev = false
  }
}

export class TreapImplicit<T> {
  private root: TreapNode<T> | null = null
  private _size = 0

  constructor() {}

  private getSize(node: TreapNode<T> | null): number {
    return node ? node.size : 0
  }

  private updateSize(node: TreapNode<T>): void {
    node.size = 1 + this.getSize(node.left) + this.getSize(node.right)
  }

  private pushDown(node: TreapNode<T>): void {
    if (node.rev) {
      const temp = node.left
      node.left = node.right
      node.right = temp
      if (node.left) {
        node.left.rev = !node.left.rev
      }
      if (node.right) {
        node.right.rev = !node.right.rev
      }
      node.rev = false
    }
  }

  private split(node: TreapNode<T> | null, k: number): [TreapNode<T> | null, TreapNode<T> | null] {
    if (node === null) {
      return [null, null]
    }
    this.pushDown(node)
    const leftSize = this.getSize(node.left)
    if (leftSize < k) {
      const [left, right] = this.split(node.right, k - leftSize - 1)
      node.right = left
      this.updateSize(node)
      return [node, right]
    } else {
      const [left, right] = this.split(node.left, k)
      node.left = right
      this.updateSize(node)
      return [left, node]
    }
  }

  private merge(left: TreapNode<T> | null, right: TreapNode<T> | null): TreapNode<T> | null {
    if (left === null) {
      return right
    }
    if (right === null) {
      return left
    }
    this.pushDown(left)
    this.pushDown(right)
    if (left.priority > right.priority) {
      left.right = this.merge(left.right, right)
      this.updateSize(left)
      return left
    } else {
      right.left = this.merge(left, right.left)
      this.updateSize(right)
      return right
    }
  }

  private buildRoot(root: TreapNode<T> | null): void {
    this.root = root
    this._size = this.getSize(root)
  }

  push(val: T): void {
    const newNode = new TreapNode(val)
    this.buildRoot(this.merge(this.root, newNode))
  }

  insert(index: number, val: T): void {
    if (index < 0 || index > this._size) {
      return
    }
    const newNode = new TreapNode(val)
    const [left, right] = this.split(this.root, index)
    this.buildRoot(this.merge(this.merge(left, newNode), right))
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    let current = this.root
    while (current !== null) {
      this.pushDown(current)
      const leftSize = this.getSize(current.left)
      if (index < leftSize) {
        current = current.left
      } else if (index === leftSize) {
        return current.value
      } else {
        index -= leftSize + 1
        current = current.right
      }
    }
    return undefined
  }

  set(index: number, val: T): void {
    if (index < 0 || index >= this._size) {
      return
    }
    const [left, middleRight] = this.split(this.root, index)
    const [middle, right] = this.split(middleRight, 1)
    if (middle) {
      middle.value = val
    }
    this.buildRoot(this.merge(this.merge(left, middle), right))
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined
    }
    const [left, middleRight] = this.split(this.root, index)
    const [middle, right] = this.split(middleRight, 1)
    const result = middle ? middle.value : undefined
    this.buildRoot(this.merge(left, right))
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    const stack: Array<{ node: TreapNode<T> | null; visited: boolean }> = [{ node: this.root, visited: false }]
    while (stack.length > 0) {
      const { node, visited } = stack.pop()!
      if (node === null) {
        continue
      }
      if (visited) {
        result.push(node.value)
      } else {
        this.pushDown(node)
        stack.push({ node: node.right, visited: false })
        stack.push({ node, visited: true })
        stack.push({ node: node.left, visited: false })
      }
    }
    return result
  }

  get size(): number {
    return this._size
  }

  reverse(l: number, r: number): void {
    if (l < 0 || r > this._size || l >= r) {
      return
    }
    const [left, middleRight] = this.split(this.root, l)
    const [middle, right] = this.split(middleRight, r - l)
    if (middle) {
      middle.rev = !middle.rev
    }
    this.buildRoot(this.merge(this.merge(left, middle), right))
  }

  splitAt(index: number): [TreapImplicit<T>, TreapImplicit<T>] {
    if (index < 0 || index > this._size) {
      const empty = new TreapImplicit<T>()
      return [empty, empty]
    }
    const [leftRoot, rightRoot] = this.split(this.root, index)
    const leftTreap = new TreapImplicit<T>()
    leftTreap.buildRoot(leftRoot)
    const rightTreap = new TreapImplicit<T>()
    rightTreap.buildRoot(rightRoot)
    this.root = null
    this._size = 0
    return [leftTreap, rightTreap]
  }
}