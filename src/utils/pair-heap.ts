export class PairHeap<T> {
  private root: PairNode<T> | null = null
  private _size = 0
  private comparator: (a: T, b: T) => number

  constructor(comparator: (a: T, b: T) => number = (a, b) => (a as number) - (b as number)) {
    this.comparator = comparator
  }

  push(value: T): void {
    const node = new PairNode(value)
    this.root = this.root ? this.mergeNodes(this.root, node) : node
    this._size++
  }

  peek(): T | undefined {
    return this.root?.value
  }

  pop(): T | undefined {
    if (!this.root) return undefined
    const val = this.root.value
    this.root = this.mergePairs(this.root.children)
    this._size--
    return val
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  private mergeNodes(a: PairNode<T>, b: PairNode<T>): PairNode<T> {
    if (this.comparator(a.value, b.value) <= 0) {
      a.children.push(b)
      return a
    }
    b.children.push(a)
    return b
  }

  private mergePairs(nodes: PairNode<T>[]): PairNode<T> | null {
    if (nodes.length === 0) return null
    if (nodes.length === 1) return nodes[0]!
    const result: PairNode<T>[] = []
    for (let i = 0; i < nodes.length - 1; i += 2) {
      result.push(this.mergeNodes(nodes[i]!, nodes[i + 1]!))
    }
    if (nodes.length % 2 === 1) result.push(nodes[nodes.length - 1]!)
    let head = result.pop()!
    while (result.length > 0) {
      head = this.mergeNodes(result.pop()!, head)
    }
    return head
  }
}

class PairNode<T> {
  value: T
  children: PairNode<T>[] = []

  constructor(value: T) {
    this.value = value
  }
}
