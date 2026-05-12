type Comparator<T> = (a: T, b: T) => number

interface BinomialTreeNode<T> {
  value: T
  order: number
  children: BinomialTreeNode<T>[]
}

class BinomialQueue2<T> {
  private trees: BinomialTreeNode<T>[] = []
  private comparator: Comparator<T>

  constructor(comparator?: Comparator<T>) {
    this.comparator = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  insert(value: T): void {
    const node: BinomialTreeNode<T> = { value, order: 0, children: [] }
    this.trees.push(node)
    this.consolidate()
  }

  extractMin(): T {
    if (this.isEmpty()) {
      throw new Error('Queue is empty')
    }

    let minIndex = 0
    for (let i = 1; i < this.trees.length; i++) {
      if (this.comparator(this.trees[i]!.value, this.trees[minIndex]!.value) < 0) {
        minIndex = i
      }
    }

    const minNode = this.trees.splice(minIndex, 1)[0]!
    const children = minNode.children

    for (const child of children) {
      this.trees.push(child)
    }

    this.consolidate()
    return minNode.value
  }

  peek(): T {
    if (this.isEmpty()) {
      throw new Error('Queue is empty')
    }

    let min = this.trees[0]!.value
    for (let i = 1; i < this.trees.length; i++) {
      if (this.comparator(this.trees[i]!.value, min) < 0) {
        min = this.trees[i]!.value
      }
    }
    return min
  }

  merge(other: BinomialQueue2<T>): void {
    this.trees.push(...other.trees)
    other.trees = []
    this.consolidate()
  }

  get size(): number {
    let total = 0
    for (const tree of this.trees) {
      total += Math.pow(2, tree.order)
    }
    return total
  }

  isEmpty(): boolean {
    return this.trees.length === 0
  }

  clear(): void {
    this.trees = []
  }

  toArray(): T[] {
    const result: T[] = []
    const temp = new BinomialQueue2<T>(this.comparator)
    temp.trees = this.trees.map(t => this.cloneNode(t))

    while (!temp.isEmpty()) {
      result.push(temp.extractMin())
    }
    return result
  }

  private cloneNode(node: BinomialTreeNode<T>): BinomialTreeNode<T> {
    return {
      value: node.value,
      order: node.order,
      children: node.children.map(c => this.cloneNode(c))
    }
  }

  private consolidate(): void {
    if (this.trees.length === 0) return

    const maxOrder = Math.max(...this.trees.map(t => t.order))
    const newTrees: (BinomialTreeNode<T> | undefined)[] = new Array(maxOrder + 2).fill(undefined)

    for (const tree of this.trees) {
      let order = tree.order
      let current = tree

      while (newTrees[order] !== undefined) {
        const other = newTrees[order]!
        current = this.linkTrees(current, other)
        newTrees[order] = undefined
        order++
      }
      newTrees[order] = current
    }

    this.trees = newTrees.filter((t): t is BinomialTreeNode<T> => t !== undefined)
  }

  private linkTrees(a: BinomialTreeNode<T>, b: BinomialTreeNode<T>): BinomialTreeNode<T> {
    if (this.comparator(a.value, b.value) <= 0) {
      a.children.push(b)
      a.order++
      return a
    } else {
      b.children.push(a)
      b.order++
      return b
    }
  }
}

export { BinomialQueue2 }
