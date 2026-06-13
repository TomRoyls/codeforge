export class PairingHeap2 {
  private root: PHNode | null = null
  private _size = 0

  insert(value: number): void {
    const node: PHNode = { value, child: null, sibling: null }
    this.root = this.root ? this.merge(this.root, node) : node
    this._size++
  }

  findMin(): number | undefined { return this.root?.value }

  extractMin(): number | undefined {
    if (!this.root) return undefined
    const val = this.root.value
    this.root = this.mergePairs(this.root.child)
    this._size--
    return val
  }

  private mergePairs(first: PHNode | null): PHNode | null {
    if (!first) return null
    if (!first.sibling) return first
    const pairs: PHNode[] = []
    let curr: PHNode | null = first
    while (curr) {
      const next = curr.sibling
      curr.sibling = null
      if (next) {
        const nextNext = next.sibling
        next.sibling = null
        pairs.push(this.merge(curr, next))
        curr = nextNext
      } else {
        pairs.push(curr)
        break
      }
    }
    let result = pairs.pop()!
    while (pairs.length > 0) result = this.merge(pairs.pop()!, result)
    return result
  }

  private merge(a: PHNode, b: PHNode): PHNode {
    if (a.value <= b.value) {
      b.sibling = a.child
      a.child = b
      return a
    } else {
      a.sibling = b.child
      b.child = a
      return b
    }
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void { this.root = null; this._size = 0 }

  toArray(): number[] {
    const result: number[] = []
    const clone = this.clone()
    while (!clone.isEmpty) result.push(clone.extractMin()!)
    return result
  }

  toString(): string { return JSON.stringify({ size: this._size }) }
  toJSON(): Record<string, number> { return { size: this._size } }

  clone(): PairingHeap2 {
    const c = new PairingHeap2()
    for (const v of this.allValues()) c.insert(v)
    return c
  }

  private allValues(): number[] {
    const result: number[] = []
    const collect = (n: PHNode | null) => {
      if (!n) return
      result.push(n.value)
      let child = n.child
      while (child) { collect(child); child = child.sibling }
    }
    collect(this.root)
    return result
  }

  equals(other: unknown): boolean {
    if (!(other instanceof PairingHeap2)) return false
    return this._size === other._size
  }
}

interface PHNode { value: number; child: PHNode | null; sibling: PHNode | null }
