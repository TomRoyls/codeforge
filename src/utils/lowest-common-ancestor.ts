export class LowestCommonAncestor {
  private adj: Map<number, number[]>
  private depth: Map<number, number>
  private parent: Map<number, number>
  private up: Map<string, number>
  private log: number
  private root: number
  private nodeCount: number

  constructor(adjacency: Map<number, number[]>, root: number = 0) {
    this.adj = adjacency
    this.root = root
    this.nodeCount = adjacency.size
    this.log = Math.ceil(Math.log2(Math.max(this.nodeCount, 1))) + 1
    this.depth = new Map()
    this.parent = new Map()
    this.up = new Map()
    this.build()
  }

  private build(): void {
    const queue: number[] = [this.root]
    this.depth.set(this.root, 0)
    this.parent.set(this.root, this.root)
    let qi = 0
    while (qi < queue.length) {
      const node = queue[qi++]!
      for (let k = 0; k < this.log; k++) {
        const prev = k === 0 ? this.parent.get(node)! : this.up.get(`${node},${k - 1}`)!
        this.up.set(`${node},${k}`, k === 0 ? prev : (this.up.get(`${prev},${k - 1}`) ?? this.root))
      }
      for (const child of (this.adj.get(node) ?? [])) {
        if (!this.depth.has(child)) {
          this.depth.set(child, this.depth.get(node)! + 1)
          this.parent.set(child, node)
          queue.push(child)
        }
      }
    }
  }

  query(u: number, v: number): number {
    if ((this.depth.get(u) ?? 0) < (this.depth.get(v) ?? 0)) { const tmp = u; u = v; v = tmp }
    const diff = (this.depth.get(u) ?? 0) - (this.depth.get(v) ?? 0)
    for (let k = 0; k < this.log; k++) {
      if ((diff >> k) & 1) {
        u = this.up.get(`${u},${k}`) ?? this.root
      }
    }
    if (u === v) return u
    for (let k = this.log - 1; k >= 0; k--) {
      const uUp = this.up.get(`${u},${k}`) ?? u
      const vUp = this.up.get(`${v},${k}`) ?? v
      if (uUp !== vUp) {
        u = uUp
        v = vUp
      }
    }
    return this.parent.get(u) ?? u
  }

  getDepth(node: number): number {
    return this.depth.get(node) ?? 0
  }

  distance(u: number, v: number): number {
    const lca = this.query(u, v)
    return (this.depth.get(u) ?? 0) + (this.depth.get(v) ?? 0) - 2 * (this.depth.get(lca) ?? 0)
  }
}
