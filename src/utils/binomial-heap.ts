export class BinomialHeap<T> {
  private head: BinNode<T> | null = null
  private _size: number = 0

  insert(value: T, priority: number): void {
    const node: BinNode<T> = { value, priority, degree: 0, child: null, sibling: null, parent: null }
    const heap = new BinomialHeap<T>()
    heap.head = node
    heap._size = 1
    this.merge(heap)
  }

  extractMin(): { value: T; priority: number } | undefined {
    if (!this.head) return undefined
    let prev: BinNode<T> | null = null
    let minPrev: BinNode<T> | null = null
    let minNode = this.head
    let current: BinNode<T> | null = this.head
    while (current) {
      if (current.priority < minNode.priority) {
        minNode = current
        minPrev = prev
      }
      prev = current
      current = current.sibling
    }
    if (minPrev) {
      minPrev.sibling = minNode.sibling
    } else {
      this.head = minNode.sibling
    }
    const childHeap = new BinomialHeap<T>()
    let child = minNode.child
    const children: BinNode<T>[] = []
    while (child) {
      children.push(child)
      child = child.sibling
    }
    children.reverse()
    let childPrev: BinNode<T> | null = null
    for (const c of children) {
      c.parent = null
      c.sibling = null
      if (childPrev) {
        childPrev.sibling = c
      } else {
        childHeap.head = c
      }
      childPrev = c
    }
    childHeap._size = (1 << children.length) - 1
    this.merge(childHeap)
    this._size--
    return { value: minNode.value, priority: minNode.priority }
  }

  peek(): { value: T; priority: number } | undefined {
    if (!this.head) return undefined
    let minNode = this.head
    let current = this.head.sibling
    while (current) {
      if (current.priority < minNode.priority) minNode = current
      current = current.sibling
    }
    return { value: minNode.value, priority: minNode.priority }
  }

  merge(other: BinomialHeap<T>): void {
    this.head = this.mergeRoots(this.head, other.head)
    this._size += other._size
    other.head = null
    other._size = 0
    if (!this.head) return
    let prev: BinNode<T> | null = null
    let current = this.head
    let next = current.sibling
    while (next) {
      const mergeCases = current.degree !== next.degree
        || (next.sibling && next.sibling.degree === current.degree)
      if (mergeCases) {
        prev = current
        current = next
      } else if (current.priority <= next.priority) {
        current.sibling = next.sibling
        this.linkTrees(next, current)
      } else {
        if (!prev) {
          this.head = next
        } else {
          prev.sibling = next
        }
        this.linkTrees(current, next)
        current = next
      }
      next = current.sibling
    }
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  private linkTrees(child: BinNode<T>, parent: BinNode<T>): void {
    child.parent = parent
    child.sibling = parent.child
    parent.child = child
    parent.degree++
  }

  private mergeRoots(a: BinNode<T> | null, b: BinNode<T> | null): BinNode<T> | null {
    if (!a) return b
    if (!b) return a
    let result: BinNode<T>
    let tail: BinNode<T>
    if (a.degree <= b.degree) {
      result = a
      a = a.sibling
    } else {
      result = b
      b = b.sibling
    }
    tail = result
    tail.sibling = null
    while (a && b) {
      if (a.degree <= b.degree) {
        tail.sibling = a
        a = a.sibling
      } else {
        tail.sibling = b
        b = b.sibling
      }
      tail = tail.sibling
      tail.sibling = null
    }
    tail.sibling = a ?? b
    return result
  }

  toString(): string {
    return `BinomialHeap(size=${this._size})`
  }

  toJSON(): Array<{ value: T; priority: number }> {
    const result: Array<{ value: T; priority: number }> = []
    const collect = (node: BinNode<T> | null): void => {
      while (node) {
        result.push({ value: node.value, priority: node.priority })
        collect(node.child)
        node = node.sibling
      }
    }
    collect(this.head)
    return result
  }

  clone(): this {
    const c = new BinomialHeap<T>()
    for (const { value, priority } of this.toJSON()) {
      c.insert(value, priority)
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BinomialHeap)) return false
    if (this._size !== other._size) return false
    const a = this.toJSON().sort((x, y) => x.priority - y.priority)
    const b = other.toJSON().sort((x, y) => x.priority - y.priority)
    for (let i = 0; i < a.length; i++) {
      if (a[i]!.priority !== b[i]!.priority) return false
      if (!Object.is(a[i]!.value, b[i]!.value)) return false
    }
    return true
  }
}

interface BinNode<T> {
  value: T
  priority: number
  degree: number
  child: BinNode<T> | null
  sibling: BinNode<T> | null
  parent: BinNode<T> | null
}
