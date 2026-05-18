export interface FibHeapNode<T> {
  key: number
  value: T
  degree: number
  marked: boolean
}

interface InternalNode<T> {
  key: number
  value: T
  degree: number
  marked: boolean
  parent: InternalNode<T> | null
  child: InternalNode<T> | null
  left: InternalNode<T>
  right: InternalNode<T>
}

function createNode<T>(key: number, value: T): InternalNode<T> {
  const node: InternalNode<T> = {
    key,
    value,
    degree: 0,
    marked: false,
    parent: null,
    child: null,
    left: null as unknown as InternalNode<T>,
    right: null as unknown as InternalNode<T>,
  }
  node.left = node
  node.right = node
  return node
}

function linkIntoList<T>(node: InternalNode<T>, list: InternalNode<T>): void {
  node.right = list.right
  node.left = list
  list.right.left = node
  list.right = node
}

function unlinkFromList<T>(node: InternalNode<T>): void {
  node.left.right = node.right
  node.right.left = node.left
  node.left = node
  node.right = node
}

export class FibonacciHeap<T> {
  private minNode: InternalNode<T> | null = null
  private _size = 0

  insert(key: number, value: T): FibHeapNode<T> {
    const node = createNode(key, value)
    if (this.minNode === null) {
      this.minNode = node
    } else {
      linkIntoList(node, this.minNode)
      if (node.key < this.minNode.key) {
        this.minNode = node
      }
    }
    this._size++
    return node
  }

  extractMin(): { key: number; value: T } | undefined {
    if (this.minNode === null) return undefined

    const z = this.minNode

    if (z.child !== null) {
      let child = z.child
      const children: InternalNode<T>[] = []
      let start = child
      do {
        children.push(child)
        child = child.right
      } while (child !== start)

      for (const c of children) {
        c.parent = null
        linkIntoList(c, z)
      }
    }

    const next = z.right
    unlinkFromList(z)

    if (z === next) {
      this.minNode = null
    } else {
      this.minNode = next
      this.consolidate()
    }

    this._size--
    return { key: z.key, value: z.value }
  }

  get min(): { key: number; value: T } | undefined {
    if (this.minNode === null) return undefined
    return { key: this.minNode.key, value: this.minNode.value }
  }

  decreaseKey(node: FibHeapNode<T>, newKey: number): void {
    const internal = node as InternalNode<T>
    if (newKey >= internal.key) {
      throw new Error('New key is greater than current key')
    }

    internal.key = newKey
    const parent = internal.parent

    if (parent !== null && internal.key < parent.key) {
      this.cut(internal, parent)
      this.cascadingCut(parent)
    }

    if (this.minNode === null || internal.key < this.minNode.key) {
      this.minNode = internal
    }
  }

  delete(node: FibHeapNode<T>): void {
    const internal = node as InternalNode<T>
    this.decreaseKey(internal, -Infinity)
    this.extractMin()
  }

  merge(other: FibonacciHeap<T>): void {
    if (other.minNode === null) return

    if (this.minNode === null) {
      this.minNode = other.minNode
    } else {
      const aRight = this.minNode.right
      const bRight = other.minNode.right

      this.minNode.right = bRight
      bRight.left = this.minNode
      other.minNode.right = aRight
      aRight.left = other.minNode

      if (other.minNode.key < this.minNode.key) {
        this.minNode = other.minNode
      }
    }

    this._size += other._size
    other.minNode = null
    other._size = 0
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.minNode = null
    this._size = 0
  }

  private consolidate(): void {
    const maxDegree = Math.floor(Math.log2(this._size)) + 1
    const A: (InternalNode<T> | null)[] = new Array(maxDegree + 2).fill(null)

    const roots = this.getRootList()
    for (const w of roots) {
      let x = w
      let d = x.degree

      while (d < A.length && A[d] !== null) {
        let y = A[d]!
        if (x.key > y.key) {
          const temp = x
          x = y
          y = temp
        }
        this.heapLink(y, x)
        A[d] = null
        d++
      }
      if (d >= A.length) {
        A.length = d + 1
      }
      A[d] = x
    }

    this.minNode = null
    for (const node of A) {
      if (node !== null) {
        if (this.minNode === null) {
          node.left = node
          node.right = node
          this.minNode = node
        } else {
          linkIntoList(node, this.minNode)
          if (node.key < this.minNode.key) {
            this.minNode = node
          }
        }
      }
    }
  }

  private heapLink(y: InternalNode<T>, x: InternalNode<T>): void {
    unlinkFromList(y)
    y.parent = x

    if (x.child === null) {
      x.child = y
      y.left = y
      y.right = y
    } else {
      linkIntoList(y, x.child)
    }

    x.degree++
    y.marked = false
  }

  private cut(x: InternalNode<T>, y: InternalNode<T>): void {
    if (x.right === x) {
      y.child = null
    } else {
      if (y.child === x) {
        y.child = x.right
      }
      unlinkFromList(x)
    }

    y.degree--
    x.parent = null
    x.marked = false
    linkIntoList(x, this.minNode!)
  }

  private cascadingCut(y: InternalNode<T>): void {
    const z = y.parent
    if (z !== null) {
      if (!y.marked) {
        y.marked = true
      } else {
        this.cut(y, z)
        this.cascadingCut(z)
      }
    }
  }

  private getRootList(): InternalNode<T>[] {
    if (this.minNode === null) return []
    const result: InternalNode<T>[] = []
    let current = this.minNode
    const start = current
    do {
      result.push(current)
      current = current.right
    } while (current !== start)
    return result
  }
}
