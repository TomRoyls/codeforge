export class VirtualTree {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
    this.adj[v]!.push(u)
  }

  build(verts: number[]): { vtree: Map<number, number[]>, lca: (a: number, b: number) => number } {
    const depth = new Array(this.n).fill(0)
    const parent = new Array(this.n).fill(-1)
    const visited = new Array(this.n).fill(false)
    const tin = new Array(this.n).fill(0)
    let timer = 0

    // DFS to compute depth, parent, and DFS entry time (tin)
    // tin is required for correct virtual tree construction — sorting by depth
    // can miss LCAs when vertices in different subtrees share the same depth.
    const dfs = (root: number): void => {
      const stack = [root]
      visited[root] = true
      depth[root] = 0
      parent[root] = root
      tin[root] = timer++
      while (stack.length > 0) {
        const u = stack.pop()!
        for (const v of this.adj[u]!) {
          if (!visited[v]) {
            visited[v] = true
            depth[v] = depth[u]! + 1
            parent[v] = u
            tin[v] = timer++
            stack.push(v)
          }
        }
      }
    }
    dfs(0)

    const lca = (a: number, b: number): number => {
      while (a !== b) {
        if (depth[a]! > depth[b]!) a = parent[a]!
        else b = parent[b]!
      }
      return a
    }

    const vtree = new Map<number, number[]>()
    if (verts.length === 0) return { vtree, lca }

    // Sort by DFS entry time to ensure the stack-based virtual tree
    // construction correctly adds all necessary LCAs.
    const sorted = [...verts].sort((a, b) => tin[a]! - tin[b]!)
    const allVerts = new Set(sorted)

    const stack: number[] = []
    for (const v of sorted) {
      if (stack.length === 0) {
        stack.push(v)
        continue
      }
      let l = lca(v, stack[stack.length - 1]!)
      while (stack.length > 1 && depth[stack[stack.length - 2]!]! >= depth[l]!) {
        const c = stack.pop()!
        const p = stack[stack.length - 1]!
        if (!vtree.has(p)) vtree.set(p, [])
        vtree.get(p)!.push(c)
      }
      if (depth[stack[stack.length - 1]!]! > depth[l]!) {
        const c = stack.pop()!
        if (!vtree.has(l)) vtree.set(l, [])
        vtree.get(l)!.push(c)
      }
      if (stack.length === 0 || stack[stack.length - 1] !== l) {
        stack.push(l)
        allVerts.add(l)
      }
      stack.push(v)
    }

    while (stack.length > 1) {
      const c = stack.pop()!
      const p = stack[stack.length - 1]!
      if (!vtree.has(p)) vtree.set(p, [])
      vtree.get(p)!.push(c)
    }

    return { vtree, lca }
  }
}
