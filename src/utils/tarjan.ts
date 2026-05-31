export class TarjanSCC {
  static findSCCs(adjacency: Map<number, number[]>): number[][] {
    const index = new Map<number, number>()
    const lowlink = new Map<number, number>()
    const onStack = new Set<number>()
    const stack: number[] = []
    const result: number[][] = []
    let currentIndex = 0

    function strongconnect(v: number) {
      index.set(v, currentIndex)
      lowlink.set(v, currentIndex)
      currentIndex++
      stack.push(v)
      onStack.add(v)
      for (const w of (adjacency.get(v) ?? [])) {
        if (!index.has(w)) {
          strongconnect(w)
          lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!))
        } else if (onStack.has(w)) {
          lowlink.set(v, Math.min(lowlink.get(v)!, index.get(w)!))
        }
      }
      if (lowlink.get(v) === index.get(v)) {
        const component: number[] = []
        let w: number
        do {
          w = stack.pop()!
          onStack.delete(w)
          component.push(w)
        } while (w !== v)
        result.push(component)
      }
    }

    for (const v of adjacency.keys()) {
      if (!index.has(v)) strongconnect(v)
    }
    return result
  }

  static countSCCs(adjacency: Map<number, number[]>): number {
    return TarjanSCC.findSCCs(adjacency).length
  }

  static condensation(adjacency: Map<number, number[]>): Map<number, number[]> {
    const sccs = TarjanSCC.findSCCs(adjacency)
    const nodeToComponent = new Map<number, number>()
    sccs.forEach((component, idx) => {
      for (const node of component) nodeToComponent.set(node, idx)
    })
    const dag = new Map<number, number[]>()
    for (let i = 0; i < sccs.length; i++) dag.set(i, [])
    for (const [from, neighbors] of adjacency) {
      for (const to of neighbors) {
        const cf = nodeToComponent.get(from)!
        const ct = nodeToComponent.get(to)!
        if (cf !== ct && !dag.get(cf)!.includes(ct)) {
          dag.get(cf)!.push(ct)
        }
      }
    }
    return dag
  }
}
