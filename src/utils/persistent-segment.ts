export class PersistentSegmentTree {
  private readonly size: number
  private readonly roots: PersistentNode[]
  private readonly defaultValue: number
  private readonly combine: (a: number, b: number) => number

  constructor(
    size: number,
    combine: (a: number, b: number) => number = (a, b) => a + b,
    defaultValue: number = 0,
  ) {
    this.size = size
    this.combine = combine
    this.defaultValue = defaultValue
    this.roots = [this.build(0, size - 1)]
  }

  private build(l: number, r: number): PersistentNode {
    if (l === r) return { value: this.defaultValue, left: null, right: null }
    const mid = (l + r) >> 1
    return {
      value: this.defaultValue,
      left: this.build(l, mid),
      right: this.build(mid + 1, r),
    }
  }

  private updateNode(node: PersistentNode, l: number, r: number, idx: number, value: number): PersistentNode {
    if (l === r) return { value, left: null, right: null }
    const mid = (l + r) >> 1
    if (idx <= mid) {
      const newLeft = this.updateNode(node.left!, l, mid, idx, value)
      return {
        value: this.combine(newLeft.value, node.right!.value),
        left: newLeft,
        right: node.right!,
      }
    }
    const newRight = this.updateNode(node.right!, mid + 1, r, idx, value)
    return {
      value: this.combine(node.left!.value, newRight.value),
      left: node.left!,
      right: newRight,
    }
  }

  update(version: number, idx: number, value: number): number {
    const newRoot = this.updateNode(this.roots[version]!, 0, this.size - 1, idx, value)
    this.roots.push(newRoot)
    return this.roots.length - 1
  }

  private queryNode(node: PersistentNode, l: number, r: number, ql: number, qr: number): number {
    if (ql > r || qr < l) return this.defaultValue
    if (ql <= l && r <= qr) return node.value
    const mid = (l + r) >> 1
    return this.combine(
      this.queryNode(node.left!, l, mid, ql, qr),
      this.queryNode(node.right!, mid + 1, r, ql, qr),
    )
  }

  query(version: number, left: number, right: number): number {
    return this.queryNode(this.roots[version]!, 0, this.size - 1, left, right)
  }

  get versionCount(): number {
    return this.roots.length
  }

  getPoint(version: number, idx: number): number {
    return this.query(version, idx, idx)
  }
}

interface PersistentNode {
  value: number
  left: PersistentNode | null
  right: PersistentNode | null
}
