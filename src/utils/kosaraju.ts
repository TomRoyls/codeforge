export class KosarajuSCC {
  static findSCCs(adj: Map<number, number[]>): number[][] {
    const allNodes = new Set<number>()
    for (const [v] of adj) allNodes.add(v)
    for (const neighbors of adj.values()) for (const w of neighbors) allNodes.add(w)
    const visited = new Set<number>()
    const finishOrder: number[] = []
    function dfs1(v: number) {
      visited.add(v)
      for (const w of (adj.get(v) ?? [])) {
        if (!visited.has(w)) dfs1(w)
      }
      finishOrder.push(v)
    }
    for (const v of allNodes) {
      if (!visited.has(v)) dfs1(v)
    }
    const reverseAdj = new Map<number, number[]>()
    for (const v of allNodes) reverseAdj.set(v, [])
    for (const [v, neighbors] of adj) {
      for (const w of neighbors) {
        reverseAdj.get(w)!.push(v)
      }
    }
    const sccs: number[][] = []
    const visited2 = new Set<number>()
    function dfs2(v: number, component: number[]) {
      visited2.add(v)
      component.push(v)
      for (const w of (reverseAdj.get(v) ?? [])) {
        if (!visited2.has(w)) dfs2(w, component)
      }
    }
    for (let i = finishOrder.length - 1; i >= 0; i--) {
      const v = finishOrder[i]!
      if (!visited2.has(v)) {
        const component: number[] = []
        dfs2(v, component)
        sccs.push(component)
      }
    }
    return sccs
  }

  static isStronglyConnected(adj: Map<number, number[]>): boolean {
    return KosarajuSCC.findSCCs(adj).length <= 1
  }

  static countSCCs(adj: Map<number, number[]>): number {
    return KosarajuSCC.findSCCs(adj).length
  }

  static condensation(adj: Map<number, number[]>): Map<number, number[]> {
    const sccs = KosarajuSCC.findSCCs(adj)
    const nodeToComponent = new Map<number, number>()
    sccs.forEach((component, idx) => {
      for (const v of component) nodeToComponent.set(v, idx)
    })
    const dag = new Map<number, number[]>()
    for (let i = 0; i < sccs.length; i++) dag.set(i, [])
    const edgeSet = new Set<string>()
    for (const [v, neighbors] of adj) {
      const cv = nodeToComponent.get(v)!
      for (const w of neighbors) {
        const cw = nodeToComponent.get(w)!
        if (cv !== cw) {
          const key = `${cv}-${cw}`
          if (!edgeSet.has(key)) {
            edgeSet.add(key)
            dag.get(cv)!.push(cw)
          }
        }
      }
    }
    return dag
  }
}
