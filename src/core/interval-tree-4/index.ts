interface Node {
  low: number
  high: number
  max: number
  left: Node | null
  right: Node | null
}

export class IntervalTree4 {
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

  delete(low: number, high: number): boolean {
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

  contains(low: number, high: number): boolean {
    return this.searchExact(this.root, low, high)
  }

  min(): number | undefined {
    if (this.root === null) {
      return undefined
    }
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return node.low
  }

  max(): number | undefined {
    if (this.root === null) {
      return undefined
    }
    return this.root.max
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

  getTimeComplexity(): { [operation: string]: string } {
    return {
      insert: 'O(h), where h is tree height (O(log n) average, O(n) worst)',
      delete: 'O(h), where h is tree height (O(log n) average, O(n) worst)',
      search: 'O(h), where h is tree height (O(log n) average, O(n) worst)',
      min: 'O(h), where h is tree height (O(log n) average, O(n) worst)',
      max: 'O(1)',
      toArray: 'O(n)',
      forEach: 'O(n)',
      bulkInsert: 'O(m * h), where m is intervals to insert',
      mergeOverlapping: 'O(n log n)',
      splitAt: 'O(n)'
    }
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

  mergeOverlapping(): IntervalTree4 {
    const intervals = this.toArray()
    if (intervals.length === 0) {
      return new IntervalTree4()
    }

    const sorted = intervals.sort((a, b) => a[0] - b[0])
    const merged: [number, number][] = []

    for (const interval of sorted) {
      if (merged.length === 0) {
        merged.push(interval)
      } else {
        const last = merged[merged.length - 1]!
        if (interval[0] <= last[1]) {
          last[1] = Math.max(last[1], interval[1])
        } else {
          merged.push(interval)
        }
      }
    }

    const result = new IntervalTree4()
    result.bulkInsert(merged)
    return result
  }

  splitAt(point: number): { left: IntervalTree4, right: IntervalTree4 } {
    const leftTree = new IntervalTree4()
    const rightTree = new IntervalTree4()

    for (const [low, high] of this.toArray()) {
      if (high <= point) {
        leftTree.insert(low, high)
      } else if (low > point) {
        rightTree.insert(low, high)
      } else {
        leftTree.insert(low, point)
        rightTree.insert(point, high)
      }
    }

    return { left: leftTree, right: rightTree }
  }

  bulkInsert(intervals: [number, number][]): void {
    for (const [low, high] of intervals) {
      this.insert(low, high)
    }
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
    return `${IntervalTree4}({ size: ${this.size} })`
  }

  has(low: number, high: number): boolean {
    return this.contains(low, high)
  }

  toJSON() {
    return { type: 'IntervalTree4', size: this.size, items: this.toArray() }
  }
}
