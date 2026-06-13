export class BinomialHeap {
  private roots: BHNode[] = []
  private _size = 0

  insert(value: number): void {
    const node: BHNode = { value, degree: 0, child: null, sibling: null }
    this.roots = this.mergeRoots(this.roots, [node])
    this._size++
  }

  findMin(): number | undefined {
    if (this.roots.length === 0) return undefined
    return Math.min(...this.roots.map((r) => r.value))
  }

  extractMin(): number | undefined {
    if (this.roots.length === 0) return undefined
    let minIdx = 0
    for (let i = 1; i < this.roots.length; i++) {
      if (this.roots[i]!.value < this.roots[minIdx]!.value) minIdx = i
    }
    const minNode = this.roots[minIdx]!
    this.roots.splice(minIdx, 1)
    const children = this.getChildren(minNode)
    this.roots = this.mergeRoots(this.roots, children.reverse())
    this._size--
    return minNode.value
  }

  private getChildren(node: BHNode): BHNode[] {
    const result: BHNode[] = []
    let child = node.child
    while (child) { result.push(child); child = child.sibling }
    return result
  }

  private mergeRoots(a: BHNode[], b: BHNode[]): BHNode[] {
    const result: BHNode[] = []
    let i = 0, j = 0
    while (i < a.length && j < b.length) {
      if (a[i]!.degree <= b[j]!.degree) result.push(a[i++]!)
      else result.push(b[j++]!)
    }
    while (i < a.length) result.push(a[i++]!)
    while (j < b.length) result.push(b[j++]!)
    return this.consolidate(result)
  }

  private consolidate(roots: BHNode[]): BHNode[] {
    if (roots.length <= 1) return roots
    const result: BHNode[] = []
    let i = 0
    while (i < roots.length) {
      if (i + 1 >= roots.length) { result.push(roots[i++]!); continue }
      const curr = roots[i]!, next = roots[i + 1]!
      if (curr.degree === next.degree) {
        const smaller = curr.value <= next.value ? curr : next
        const larger = curr.value <= next.value ? next : curr
        larger.sibling = smaller.child
        smaller.child = larger
        smaller.degree++
        roots[i + 1] = smaller
        i++
      } else {
        result.push(roots[i++]!)
      }
    }
    return result
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void { this.roots = []; this._size = 0 }

  toArray(): number[] {
    const result: number[] = []
    const heap = this.clone()
    while (!heap.isEmpty) result.push(heap.extractMin()!)
    return result
  }

  toString(): string { return JSON.stringify({ size: this._size }) }
  toJSON(): Record<string, number> { return { size: this._size } }

  clone(): BinomialHeap {
    const c = new BinomialHeap()
    for (const v of this.originalValues()) c.insert(v)
    return c
  }

  private originalValues(): number[] {
    const result: number[] = []
    const collect = (nodes: BHNode[]) => {
      for (const n of nodes) {
        result.push(n.value)
        if (n.child) {
          const children: BHNode[] = []
          let ch = n.child
          while (ch) { children.push(ch); ch = ch.sibling }
          collect(children)
        }
      }
    }
    collect(this.roots)
    return result
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BinomialHeap)) return false
    return this._size === other._size
  }
}

interface BHNode { value: number; degree: number; child: BHNode | null; sibling: BHNode | null }
