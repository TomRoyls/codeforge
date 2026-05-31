export class SegmentTree2D {
  private n: number
  private m: number
  private tree: number[][]
  private combine: (a: number, b: number) => number

  constructor(
    n: number,
    m: number,
    combine: (a: number, b: number) => number = (a, b) => a + b,
  ) {
    this.n = n
    this.m = m
    this.combine = combine
    this.tree = new Array(4 * n)
    for (let i = 0; i < 4 * n; i++) this.tree[i] = new Array(4 * m).fill(0)
  }

  update(x: number, y: number, value: number): void {
    this.updateX(1, 0, this.n - 1, x, y, value)
  }

  private updateX(node: number, nl: number, nr: number, x: number, y: number, value: number): void {
    if (nl !== nr) {
      const mid = (nl + nr) >> 1
      if (x <= mid) this.updateX(node * 2, nl, mid, x, y, value)
      else this.updateX(node * 2 + 1, mid + 1, nr, x, y, value)
    }
    this.updateY(node, 1, 0, this.m - 1, y, value, nl === nr)
  }

  private updateY(nodeX: number, nodeY: number, nl: number, nr: number, y: number, value: number, isLeaf: boolean): void {
    if (nl === nr) {
      if (isLeaf) {
        this.tree[nodeX]![nodeY]! = value
      } else {
        this.tree[nodeX]![nodeY] = this.combine(
          this.tree[nodeX * 2]![nodeY]!,
          this.tree[nodeX * 2 + 1]![nodeY]!,
        )
      }
      return
    }
    const mid = (nl + nr) >> 1
    if (y <= mid) this.updateY(nodeX, nodeY * 2, nl, mid, y, value, isLeaf)
    else this.updateY(nodeX, nodeY * 2 + 1, mid + 1, nr, y, value, isLeaf)
    this.tree[nodeX]![nodeY] = this.combine(
      this.tree[nodeX]![nodeY * 2]!,
      this.tree[nodeX]![nodeY * 2 + 1]!,
    )
  }

  query(x1: number, y1: number, x2: number, y2: number): number {
    return this.queryX(1, 0, this.n - 1, x1, x2, y1, y2)
  }

  private queryX(node: number, nl: number, nr: number, x1: number, x2: number, y1: number, y2: number): number {
    if (x1 > nr || x2 < nl) return 0
    if (x1 <= nl && nr <= x2) return this.queryY(node, 1, 0, this.m - 1, y1, y2)
    const mid = (nl + nr) >> 1
    return this.combine(
      this.queryX(node * 2, nl, mid, x1, x2, y1, y2),
      this.queryX(node * 2 + 1, mid + 1, nr, x1, x2, y1, y2),
    )
  }

  private queryY(nodeX: number, node: number, nl: number, nr: number, y1: number, y2: number): number {
    if (y1 > nr || y2 < nl) return 0
    if (y1 <= nl && nr <= y2) return this.tree[nodeX]![node]!
    const mid = (nl + nr) >> 1
    return this.combine(
      this.queryY(nodeX, node * 2, nl, mid, y1, y2),
      this.queryY(nodeX, node * 2 + 1, mid + 1, nr, y1, y2),
    )
  }
}
