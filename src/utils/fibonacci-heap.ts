export class FibonacciHeap<T> {
  private min: FibNode<T> | null = null
  private _size: number = 0
  private nextHandle: number = 1
  private nodeMap: Map<number, FibNode<T>> = new Map()

  constructor(private comparator: (a: T, b: T) => number = (a: T, b: T) => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }) {}

  insert(value: T): number {
    const handle = this.nextHandle++
    const node: FibNode<T> = {
      value,
      handle,
      degree: 0,
      mark: false,
      parent: null,
      child: null,
      left: null as FibNode<T> | null,
      right: null as FibNode<T> | null
    }
    node.left = node
    node.right = node
    this.nodeMap.set(handle, node)
    if (!this.min) {
      this.min = node
    } else {
      this.addToRootList(node)
      if (this.comparator(value, this.min.value) < 0) {
        this.min = node
      }
    }
    this._size++
    return handle
  }

  extractMin(): T | undefined {
    const z = this.min
    if (!z) return undefined
    if (z.child) {
      let child = z.child
      do {
        const nextChild = child.right!
        child.parent = null
        this.addToRootList(child)
        child = nextChild
      } while (child !== z.child)
    }
    this.removeFromRootList(z)
    this.nodeMap.delete(z.handle)
    if (z === z.right) {
      this.min = null
    } else {
      this.min = z.right!
      this.consolidate()
    }
    this._size--
    return z.value
  }

  peek(): T | undefined {
    return this.min?.value
  }

  decreaseKey(handle: number, newValue: T): void {
    const node = this.nodeMap.get(handle)
    if (!node) {
      throw new Error(`Invalid handle: ${handle}`)
    }
    if (this.comparator(newValue, node.value) > 0) {
      throw new Error('New value must be less than or equal to current value')
    }
    node.value = newValue
    const parent = node.parent
    if (parent && this.comparator(node.value, parent.value) < 0) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    if (this.min && this.comparator(node.value, this.min.value) < 0) {
      this.min = node
    }
  }

  delete(handle: number): void {
    const node = this.nodeMap.get(handle)
    if (!node) {
      throw new Error(`Invalid handle: ${handle}`)
    }
    const parent = node.parent
    if (parent) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    this.min = node
    this.extractMin()
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.min = null
    this._size = 0
    this.nextHandle = 1
    this.nodeMap.clear()
  }

  merge(other: FibonacciHeap<T>): void {
    if (!other.min) return
    if (!this.min) {
      this.min = other.min
    } else {
      this.mergeLists(this.min, other.min)
      if (this.comparator(other.min.value, this.min.value) < 0) {
        this.min = other.min
      }
    }
    this._size += other._size
    other.nodeMap.forEach((node, handle) => {
      this.nodeMap.set(handle, node)
    })
    other.min = null
    other._size = 0
    other.nextHandle = 1
    other.nodeMap.clear()
  }

  toArray(): T[] {
    const result: T[] = []
    const visited = new Set<FibNode<T>>()
    if (this.min) {
      let current = this.min
      do {
        if (!visited.has(current)) {
          this.collectAllNodes(current, result, visited)
        }
        current = current.right!
      } while (current !== this.min)
    }
    return result
  }

  private collectAllNodes(node: FibNode<T>, result: T[], visited: Set<FibNode<T>>): void {
    if (visited.has(node)) return
    visited.add(node)
    result.push(node.value)
    if (node.child) {
      let child = node.child
      do {
        this.collectAllNodes(child, result, visited)
        child = child.right!
      } while (child !== node.child)
    }
  }

  private addToRootList(node: FibNode<T>): void {
    if (!this.min) {
      this.min = node
      node.left = node
      node.right = node
      return
    }
    node.left = this.min
    const minRight = this.min.right!
    node.right = minRight
    minRight.left = node
    this.min.right = node
  }

  private removeFromRootList(node: FibNode<T>): void {
    const leftNode = node.left!
    const rightNode = node.right!
    leftNode.right = rightNode
    rightNode.left = leftNode
    if (node === this.min) {
      this.min = node.right !== node ? node.right : null
    }
  }

  private link(y: FibNode<T>, x: FibNode<T>): void {
    this.removeFromRootList(y)
    y.parent = x
    if (!x.child) {
      x.child = y
      y.left = y
      y.right = y
    } else {
      y.left = x.child
      const xChildRight = x.child.right!
      y.right = xChildRight
      xChildRight.left = y
      x.child.right = y
    }
    x.degree++
    y.mark = false
  }

  private consolidate(): void {
    const maxDegree = Math.floor(Math.log2(this._size)) + 1
    const degreeArray: (FibNode<T> | null)[] = new Array(maxDegree + 1).fill(null)
    let current = this.min
    const roots: FibNode<T>[] = []
    if (current) {
      do {
        roots.push(current)
        current = current.right!
      } while (current !== this.min)
    }
    for (const w of roots) {
      let x = w
      let d = x.degree
      while (degreeArray[d]) {
        let y = degreeArray[d]!
        if (this.comparator(x.value, y.value) > 0) {
          const temp = x
          x = y
          y = temp
        }
        this.link(y, x)
        degreeArray[d] = null
        d++
      }
      degreeArray[d] = x
    }
    this.min = null
    for (const node of degreeArray) {
      if (node) {
        if (!this.min) {
          this.min = node
          node.left = node
          node.right = node
        } else {
          this.addToRootList(node)
          if (this.comparator(node.value, this.min.value) < 0) {
            this.min = node
          }
        }
      }
    }
  }

  private cut(x: FibNode<T>, y: FibNode<T>): void {
    if (y.child === x) {
      if (x.right === x) {
        y.child = null
      } else {
        y.child = x.right
      }
    }
    const leftNode = x.left!
    const rightNode = x.right!
    leftNode.right = rightNode
    rightNode.left = leftNode
    y.degree--
    this.addToRootList(x)
    x.parent = null
    x.mark = false
  }

  private cascadingCut(y: FibNode<T>): void {
    const z = y.parent
    if (z) {
      if (!y.mark) {
        y.mark = true
      } else {
        this.cut(y, z)
        this.cascadingCut(z)
      }
    }
  }

  private mergeLists(a: FibNode<T>, b: FibNode<T>): void {
    const aLeft = a.left!
    const bLeft = b.left!
    aLeft.right = b
    b.left = aLeft
    a.left = bLeft
    bLeft.right = a
  }
}

interface FibNode<T> {
  value: T
  handle: number
  degree: number
  mark: boolean
  parent: FibNode<T> | null
  child: FibNode<T> | null
  left: FibNode<T> | null
  right: FibNode<T> | null
}