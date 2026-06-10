type DistanceFunction<T> = (a: T, b: T) => number

class VPNode<T> {
  constructor(
    public item: T,
    public threshold: number,
    public inside: VPNode<T> | null = null,
    public outside: VPNode<T> | null = null
  ) {}
}

export class VantagePointTree2<T> {
  private root: VPNode<T> | null
  private distance: DistanceFunction<T>
  private items: Set<T>
  private _size: number

  constructor(items: T[], distance: DistanceFunction<T>) {
    this.distance = distance
    this.items = new Set(items)
    this._size = items.length
    this.root = this.build(items)
  }

  private build(items: T[]): VPNode<T> | null {
    if (items.length === 0) return null
    if (items.length === 1) return new VPNode(items[0]!, 0)

    const vantageIdx = Math.floor(Math.random() * items.length)
    const vantagePoint = items[vantageIdx]!

    const remaining = items.filter((_, i) => i !== vantageIdx)
    const distances = remaining.map((item) => this.distance(vantagePoint, item))
    const sortedDistances = [...distances].sort((a, b) => a - b)

    const threshold = sortedDistances[Math.floor(sortedDistances.length / 2)]!

    const insideItems: T[] = []
    const outsideItems: T[] = []

    for (let i = 0; i < remaining.length; i++) {
      const dist = distances[i]!
      if (dist <= threshold) {
        insideItems.push(remaining[i]!)
      } else {
        outsideItems.push(remaining[i]!)
      }
    }

    return new VPNode(
      vantagePoint,
      threshold,
      this.build(insideItems),
      this.build(outsideItems)
    )
  }

  nearest(query: T): T | undefined {
    let best: T | undefined
    let bestDistance = Infinity

    const search = (node: VPNode<T> | null) => {
      if (!node) return

      const dist = this.distance(query, node.item)
      if (dist < bestDistance) {
        bestDistance = dist
        best = node.item
      }

      if (node.inside) {
        if (dist <= node.threshold + bestDistance) {
          search(node.inside)
        }
      }

      if (node.outside) {
        if (dist + bestDistance >= node.threshold) {
          search(node.outside)
        }
      }
    }

    search(this.root)
    return best
  }

  kNearest(query: T, k: number): T[] {
    const neighbors: Array<{ item: T; distance: number }> = []

    const search = (node: VPNode<T> | null) => {
      if (!node) return

      const dist = this.distance(query, node.item)
      neighbors.push({ item: node.item, distance: dist })

      const tau = neighbors.length >= k ? neighbors[k - 1]!.distance : Infinity

      const checkInside = node.inside && Math.abs(dist - node.threshold) <= tau
      const checkOutside = node.outside && Math.abs(node.threshold - dist) <= tau

      if (checkInside) {
        search(node.inside)
      }

      if (checkOutside) {
        search(node.outside)
      }
    }

    search(this.root)
    neighbors.sort((a, b) => a.distance - b.distance)
    return neighbors.slice(0, k).map(n => n.item)
  }

  searchRadius(query: T, radius: number): T[] {
    const results: T[] = []

    const search = (node: VPNode<T> | null) => {
      if (!node) return

      const dist = this.distance(query, node.item)
      if (dist <= radius) {
        results.push(node.item)
      }

      if (dist - radius <= node.threshold && node.inside) {
        search(node.inside)
      }

      if (node.threshold - radius <= dist && node.outside) {
        search(node.outside)
      }
    }

    search(this.root)
    return results
  }

  contains(item: T): boolean {
    return this.items.has(item)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []

    const collect = (node: VPNode<T> | null) => {
      if (!node) return
      result.push(node.item)
      collect(node.inside)
      collect(node.outside)
    }

    collect(this.root)
    return result
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'VantagePointTree2', items: this.toArray() }
  }

  toString(): string {
    return `VantagePointTree2({ size: ${this._size} })`
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }
}
