interface Node {
  low: number
  high: number
  max: number
  left: Node | null
  right: Node | null
}

export class IntervalTree3 {
  private root: Node | null = null
  private count: number = 0

  insert(low: number, high: number): void {
    if (low > high) {
      throw new RangeError(`low (${low}) must be <= high (${high})`)
    }
    this.root = this.insertNode(this.root, low, high)
    this.count++
  }

  private insertNode(node: Node | null, low: number, high: number): Node {
    if (node === null) {
      return { low, high, max: high, left: null, right: null }
    }

    if (low < node.low) {
      node.left = this.insertNode(node.left, low, high)
    } else {
      node.right = this.insertNode(node.right, low, high)
    }

    this.updateMax(node)
    return node
  }

  remove(low: number, high: number): boolean {
    if (low > high) {
      throw new RangeError(`low (${low}) must be <= high (${high})`)
    }
    const initialCount = this.count
    this.root = this.removeNode(this.root, low, high)
    return this.count < initialCount
  }

  private removeNode(node: Node | null, low: number, high: number): Node | null {
    if (node === null) {
      return null
    }

    if (low < node.low) {
      node.left = this.removeNode(node.left, low, high)
    } else if (low > node.low) {
      node.right = this.removeNode(node.right, low, high)
    } else {
      if (node.high === high) {
        this.count--
        if (node.left === null) {
          return node.right
        }
        if (node.right === null) {
          return node.left
        }
        const minNode = this.findMin(node.right)
        node.low = minNode.low
        node.high = minNode.high
        this.count++
        node.right = this.removeNode(node.right, minNode.low, minNode.high)
      } else {
        node.right = this.removeNode(node.right, low, high)
      }
    }

    this.updateMax(node)
    return node
  }

  private findMin(node: Node): Node {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private updateMax(node: Node): void {
    node.max = node.high
    if (node.left !== null && node.left.max > node.max) {
      node.max = node.left.max
    }
    if (node.right !== null && node.right.max > node.max) {
      node.max = node.right.max
    }
  }

  search(low: number, high: number): boolean {
    return this.searchExact(this.root, low, high)
  }

  private searchExact(node: Node | null, low: number, high: number): boolean {
    if (node === null) {
      return false
    }
    if (node.low === low && node.high === high) {
      return true
    }
    if (low < node.low) {
      return this.searchExact(node.left, low, high)
    }
    return this.searchExact(node.right, low, high)
  }

  searchPoint(point: number): [number, number][] {
    const results: [number, number][] = []
    this.searchPointNode(this.root, point, results)
    return results
  }

  private searchPointNode(node: Node | null, point: number, results: [number, number][]): void {
    if (node === null) {
      return
    }
    if (point >= node.low && point <= node.high) {
      results.push([node.low, node.high])
    }
    if (node.left !== null && point <= node.left.max) {
      this.searchPointNode(node.left, point, results)
    }
    if (node.right !== null && point <= node.right.max) {
      this.searchPointNode(node.right, point, results)
    }
  }

  searchAll(low: number, high: number): [number, number][] {
    const results: [number, number][] = []
    this.searchOverlap(this.root, low, high, results)
    return results
  }

  private searchOverlap(node: Node | null, low: number, high: number, results: [number, number][]): void {
    if (node === null) {
      return
    }
    if (low <= node.high && high >= node.low) {
      results.push([node.low, node.high])
    }
    if (node.left !== null && low <= node.left.max) {
      this.searchOverlap(node.left, low, high, results)
    }
    if (node.right !== null && low <= node.right.max) {
      this.searchOverlap(node.right, low, high, results)
    }
  }

  overlaps(low: number, high: number): boolean {
    return this.hasOverlap(this.root, low, high)
  }

  private hasOverlap(node: Node | null, low: number, high: number): boolean {
    if (node === null) {
      return false
    }
    if (low <= node.high && high >= node.low) {
      return true
    }
    if (node.left !== null && low <= node.left.max) {
      return this.hasOverlap(node.left, low, high)
    }
    if (node.right !== null && low <= node.right.max) {
      return this.hasOverlap(node.right, low, high)
    }
    return false
  }

  contains(low: number, high: number): boolean {
    return this.hasExact(this.root, low, high)
  }

  private hasExact(node: Node | null, low: number, high: number): boolean {
    if (node === null) {
      return false
    }
    if (node.low === low && node.high === high) {
      return true
    }
    if (low < node.low) {
      return this.hasExact(node.left, low, high)
    }
    return this.hasExact(node.right, low, high)
  }

  get size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.root = null
    this.count = 0
  }

  toArray(): [number, number][] {
    const results: [number, number][] = []
    this.inOrder(this.root, results)
    return results
  }

  private inOrder(node: Node | null, results: [number, number][]): void {
    if (node === null) {
      return
    }
    this.inOrder(node.left, results)
    results.push([node.low, node.high])
    this.inOrder(node.right, results)
  }

  forEach(callback: (interval: [number, number], index: number) => void): void {
    let index = 0
    const traverse = (node: Node | null): void => {
      if (node === null) {
        return
      }
      traverse(node.left)
      callback([node.low, node.high], index++)
      traverse(node.right)
    }
    traverse(this.root)
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    type N = Node;
    const stack: Array<N> = [];
    let current: N | null = this.root;
    return {
      next: () => {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value = [current.low, current.high] as ReturnType<this['toArray']>[number];
          current = current.right;
          return { value, done: false };
        }
        return { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true };
      }
    };
  }

  toString(): string {
    return `${IntervalTree3}({ size: ${this.size} })`
  }

  has(low: number, high: number): boolean {
    return this.contains(low, high)
  }

  toJSON() {
    return { type: 'IntervalTree3', size: this.size, items: this.toArray() }
  }
}
