export interface PairingForestNode<T> {
  value: T
  children: PairingForestNode<T>[]
}

interface PairingForestOptions<T> {
  comparator?: (a: T, b: T) => number
}

function defaultComparator<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class PairingForest2<T = number> {
  private trees: PairingForestNode<T>[] = []
  private _size = 0
  private readonly compare: (a: T, b: T) => number

  constructor(options?: PairingForestOptions<T>) {
    this.compare = options?.comparator ?? defaultComparator
  }

  insert(value: T): void {
    const node: PairingForestNode<T> = {
      value,
      children: [],
    }
    this.trees.push(node)
    this._size++
  }

  extractMin(): T | undefined {
    if (this.trees.length === 0) {
      return undefined
    }

    let minIndex = 0
    for (let i = 1; i < this.trees.length; i++) {
      if (this.compare(this.trees[i]!.value, this.trees[minIndex]!.value) < 0) {
        minIndex = i
      }
    }

    const minNode = this.trees[minIndex]!
    this.trees.splice(minIndex, 1)

    const merged = this.mergePairs(minNode.children)
    if (merged !== null) {
      this.trees.push(merged)
    }

    this._size--
    return minNode.value
  }

  peek(): T | undefined {
    if (this.trees.length === 0) {
      return undefined
    }

    let minNode = this.trees[0]!
    for (let i = 1; i < this.trees.length; i++) {
      if (this.compare(this.trees[i]!.value, minNode.value) < 0) {
        minNode = this.trees[i]!
      }
    }
    return minNode.value
  }

  decreaseKey(node: PairingForestNode<T>, newValue: T): void {
    if (this.compare(newValue, node.value) > 0) {
      return
    }
    node.value = newValue
  }

  merge(other: PairingForest2<T>): void {
    this.trees.push(...other.trees)
    this._size += other._size
    other.trees = []
    other._size = 0
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  private mergeNodes(
    a: PairingForestNode<T>,
    b: PairingForestNode<T>,
  ): PairingForestNode<T> {
    if (this.compare(a.value, b.value) <= 0) {
      a.children.push(b)
      return a
    }
    b.children.push(a)
    return b
  }

  private mergePairs(children: PairingForestNode<T>[]): PairingForestNode<T> | null {
    if (children.length === 0) return null
    if (children.length === 1) return children[0]!

    const pairs: PairingForestNode<T>[] = []
    let i = 0
    while (i + 1 < children.length) {
      const merged = this.mergeNodes(children[i]!, children[i + 1]!)
      pairs.push(merged)
      i += 2
    }
    if (i < children.length) {
      pairs.push(children[i]!)
    }

    let result = pairs[pairs.length - 1] ?? null
    for (let j = pairs.length - 2; j >= 0; j--) {
      if (result === null) {
        result = pairs[j]!
      } else {
        result = this.mergeNodes(result, pairs[j]!)
      }
    }
    return result
  }
}
