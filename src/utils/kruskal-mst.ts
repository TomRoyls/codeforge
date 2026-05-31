export class KruskalMST {
  static findMST(
    edges: { from: number; to: number; weight: number }[],
    nodeCount: number
  ): { edges: { from: number; to: number; weight: number }[]; totalWeight: number } {
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight)
    const parent = Array.from({ length: nodeCount }, (_, i) => i)
    const rank = new Array<number>(nodeCount).fill(0)
    function find(x: number): number {
      if (parent[x] !== x) parent[x] = find(parent[x])
      return parent[x]
    }
    function union(x: number, y: number): boolean {
      const px = find(x)
      const py = find(y)
      if (px === py) return false
      if (rank[px]! < rank[py]!) parent[px] = py
      else if (rank[px]! > rank[py]!) parent[py] = px
      else { parent[py] = px; rank[px]!++ }
      return true
    }
    const mstEdges: { from: number; to: number; weight: number }[] = []
    let totalWeight = 0
    for (const edge of sortedEdges) {
      if (union(edge.from, edge.to)) {
        mstEdges.push(edge)
        totalWeight += edge.weight
        if (mstEdges.length === nodeCount - 1) break
      }
    }
    return { edges: mstEdges, totalWeight }
  }

  static isConnected(edges: { from: number; to: number; weight: number }[], nodeCount: number): boolean {
    const result = KruskalMST.findMST(edges, nodeCount)
    return result.edges.length === nodeCount - 1 || nodeCount <= 1
  }
}
