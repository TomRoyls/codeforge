export interface Interval {
  start: number
  end: number
}

export interface IntervalNode<V> {
  interval: Interval
  value: V
  max: number
  left: IntervalNode<V> | null
  right: IntervalNode<V> | null
}

export class IntervalTree<V> {
  private root: IntervalNode<V> | null = null
  private _size = 0

  insert(interval: Interval, value: V): void {
    if (interval.start > interval.end) {
      throw new RangeError('start must be <= end')
    }
    this.root = this.insertNode(this.root, interval, value)
    this._size++
  }

  private insertNode(
    node: IntervalNode<V> | null,
    interval: Interval,
    value: V,
  ): IntervalNode<V> {
    if (node === null) {
      return { interval, value, max: interval.end, left: null, right: null }
    }
    if (interval.start < node.interval.start) {
      node.left = this.insertNode(node.left, interval, value)
    } else {
      node.right = this.insertNode(node.right, interval, value)
    }
    if (node.max < interval.end) {
      node.max = interval.end
    }
    return node
  }

  delete(interval: Interval): boolean {
    const found = { value: false }
    this.root = this.deleteNode(this.root, interval, found)
    if (found.value) {
      this._size--
    }
    return found.value
  }

  private deleteNode(
    node: IntervalNode<V> | null,
    interval: Interval,
    found: { value: boolean },
  ): IntervalNode<V> | null {
    if (node === null) {
      return null
    }
    if (
      interval.start === node.interval.start &&
      interval.end === node.interval.end
    ) {
      found.value = true
      if (node.left === null) {
        return node.right
      }
      if (node.right === null) {
        return node.left
      }
      const successor = this.findMin(node.right)
      node.interval = successor.interval
      node.value = successor.value
      node.right = this.deleteNode(
        node.right,
        successor.interval,
        { value: false },
      )
    } else if (interval.start < node.interval.start) {
      node.left = this.deleteNode(node.left, interval, found)
    } else {
      node.right = this.deleteNode(node.right, interval, found)
    }
    node.max = node.interval.end
    if (node.left !== null && node.left.max > node.max) {
      node.max = node.left.max
    }
    if (node.right !== null && node.right.max > node.max) {
      node.max = node.right.max
    }
    return node
  }

  private findMin(node: IntervalNode<V>): IntervalNode<V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  query(point: number): Array<{ interval: Interval; value: V }> {
    const results: Array<{ interval: Interval; value: V }> = []
    this.queryPointNode(this.root, point, results)
    return results
  }

  private queryPointNode(
    node: IntervalNode<V> | null,
    point: number,
    results: Array<{ interval: Interval; value: V }>,
  ): void {
    if (node === null) {
      return
    }
    if (node.max < point) {
      return
    }
    this.queryPointNode(node.left, point, results)
    if (
      point >= node.interval.start &&
      point <= node.interval.end
    ) {
      results.push({ interval: node.interval, value: node.value })
    }
    this.queryPointNode(node.right, point, results)
  }

  queryRange(start: number, end: number): Array<{ interval: Interval; value: V }> {
    const results: Array<{ interval: Interval; value: V }> = []
    this.queryRangeNode(this.root, start, end, results)
    return results
  }

  private queryRangeNode(
    node: IntervalNode<V> | null,
    start: number,
    end: number,
    results: Array<{ interval: Interval; value: V }>,
  ): void {
    if (node === null) {
      return
    }
    if (node.max < start) {
      return
    }
    this.queryRangeNode(node.left, start, end, results)
    if (
      node.interval.start <= end &&
      start <= node.interval.end
    ) {
      results.push({ interval: node.interval, value: node.value })
    }
    this.queryRangeNode(node.right, start, end, results)
  }

  get size(): number {
    return this._size
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  forEach(callback: (interval: Interval, value: V) => void): void {
    this.forEachNode(this.root, callback)
  }

  private forEachNode(
    node: IntervalNode<V> | null,
    callback: (interval: Interval, value: V) => void,
  ): void {
    if (node === null) {
      return
    }
    this.forEachNode(node.left, callback)
    callback(node.interval, node.value)
    this.forEachNode(node.right, callback)
  }

  toString(): string {
    const intervals: Interval[] = []
    this.forEach((interval) => intervals.push(interval))
    return '[' + intervals.map((i) => `(${i.start}, ${i.end})`).join(', ') + ']'
  }

  toJSON(): unknown {
    const result: Array<[number, number]> = []
    this.forEach((interval) => result.push([interval.start, interval.end]))
    return result
  }

  private cloneNode(node: IntervalNode<V> | null): IntervalNode<V> | null {
    if (node === null) return null
    return {
      interval: { start: node.interval.start, end: node.interval.end },
      value: node.value,
      max: node.max,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
    }
  }

  clone(): this {
    const tree = new IntervalTree<V>()
    tree.root = this.cloneNode(this.root)
    tree._size = this._size
    return tree as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IntervalTree)) return false
    const a: Array<{ interval: Interval; value: V }> = []
    const b: Array<{ interval: Interval; value: V }> = []
    this.forEach((interval, value) => a.push({ interval, value }))
    other.forEach((interval, value) => b.push({ interval, value }))
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      const ae = a[i]!
      const be = b[i]!
      if (ae.interval.start !== be.interval.start) return false
      if (ae.interval.end !== be.interval.end) return false
      if (ae.value !== be.value) return false
    }
    return true
  }
}
