export class SkewHeap<T> {
  private root: SkewNode<T> | null = null
  private readonly compare: (a: T, b: T) => number
  private _size: number = 0

  constructor(compare: (a: T, b: T) => number = (a, b) => (a as number) - (b as number)) {
    this.compare = compare
  }

  push(value: T): void {
    this.root = this.mergeNodes(this.root, { value, left: null, right: null })
    this._size++
  }

  pop(): T | undefined {
    if (!this.root) return undefined
    const value = this.root.value
    this.root = this.mergeNodes(this.root.left, this.root.right)
    this._size--
    return value
  }

  peek(): T | undefined {
    return this.root?.value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  merge(other: SkewHeap<T>): SkewHeap<T> {
    const result = new SkewHeap<T>(this.compare)
    result.root = this.mergeNodes(this.root, other.root)
    result._size = this._size + other._size
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    const temp = new SkewHeap<T>(this.compare)
    temp.root = this.cloneNodes(this.root)
    temp._size = this._size
    while (!temp.isEmpty) result.push(temp.pop()!)
    return result
  }

  private mergeNodes(a: SkewNode<T> | null, b: SkewNode<T> | null): SkewNode<T> | null {
    if (!a) return b
    if (!b) return a
    if (this.compare(a.value, b.value) > 0) {
      const temp = a
      a = b
      b = temp
    }
    const right = a.right
    a.right = a.left
    a.left = this.mergeNodes(right, b)
    return a
  }

  private cloneNodes(node: SkewNode<T> | null): SkewNode<T> | null {
    if (!node) return null
    return { value: node.value, left: this.cloneNodes(node.left), right: this.cloneNodes(node.right) }
  }
}

interface SkewNode<T> {
  value: T
  left: SkewNode<T> | null
  right: SkewNode<T> | null
}
