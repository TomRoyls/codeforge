export class SCCGraph {
  private adjacency: Map<number, number[]> = new Map()
  private _nodeCount: number = 0

  addNode(node: number): void {
    if (!this.adjacency.has(node)) {
      this.adjacency.set(node, [])
      this._nodeCount++
    }
  }

  addEdge(from: number, to: number): void {
    this.addNode(from)
    this.addNode(to)
    this.adjacency.get(from)!.push(to)
  }

  get nodeCount(): number {
    return this._nodeCount
  }

  findSCCs(): number[][] {
    let index = 0
    const stack: number[] = []
    const onStack = new Set<number>()
    const indices = new Map<number, number>()
    const lowlinks = new Map<number, number>()
    const result: number[][] = []

    const strongConnect = (v: number): void => {
      indices.set(v, index)
      lowlinks.set(v, index)
      index++
      stack.push(v)
      onStack.add(v)

      const neighbors = this.adjacency.get(v) ?? []
      for (const w of neighbors) {
        if (!indices.has(w)) {
          strongConnect(w)
          lowlinks.set(v, Math.min(lowlinks.get(v)!, lowlinks.get(w)!))
        } else if (onStack.has(w)) {
          lowlinks.set(v, Math.min(lowlinks.get(v)!, indices.get(w)!))
        }
      }

      if (lowlinks.get(v) === indices.get(v)) {
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

    for (const v of this.adjacency.keys()) {
      if (!indices.has(v)) {
        strongConnect(v)
      }
    }

    return result
  }

  condensation(): { dag: Map<number, number[]>; componentMap: Map<number, number> } {
    const sccs = this.findSCCs()
    const componentMap = new Map<number, number>()

    for (let i = 0; i < sccs.length; i++) {
      for (const node of sccs[i]!) {
        componentMap.set(node, i)
      }
    }

    const dag = new Map<number, number[]>()
    for (let i = 0; i < sccs.length; i++) {
      dag.set(i, [])
    }

    for (const [from, neighbors] of this.adjacency) {
      const fromComp = componentMap.get(from)!
      for (const to of neighbors) {
        const toComp = componentMap.get(to)!
        if (fromComp !== toComp) {
          const edges = dag.get(fromComp)!
          if (!edges.includes(toComp)) {
            edges.push(toComp)
          }
        }
      }
    }

    return { dag, componentMap }
  }
}
