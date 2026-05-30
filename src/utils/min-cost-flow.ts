interface Edge {
  to: number
  capacity: number
  cost: number
  rev: number
}

export class MinCostFlow {
  private readonly graph: Edge[][]
  private readonly edgeToIndex: Map<string, number>
  private readonly edgeFlows: number[]

  public readonly nodeCount: number
  public edgeCount: number = 0

  constructor(nodeCount: number) {
    this.nodeCount = nodeCount
    this.graph = Array.from({ length: nodeCount }, () => [])
    this.edgeToIndex = new Map()
    this.edgeFlows = []
  }

  public addEdge(from: number, to: number, capacity: number, cost: number): void {
    if (from < 0 || from >= this.nodeCount) {
      throw new Error(`Node ${from} out of bounds`)
    }
    if (to < 0 || to >= this.nodeCount) {
      throw new Error(`Node ${to} out of bounds`)
    }
    if (capacity <= 0) {
      throw new Error(`Capacity must be positive, got ${capacity}`)
    }

    const _edgeKey = `${from}-${to}-${this.edgeCount}`
    const forwardIndex = this.graph[from]!.length
    const reverseIndex = this.graph[to]!.length

    this.graph[from]!.push({
      to,
      capacity,
      cost,
      rev: reverseIndex,
    })

    this.graph[to]!.push({
      to: from,
      capacity: 0,
      cost: -cost,
      rev: forwardIndex,
    })

    this.edgeToIndex.set(`${from}-${forwardIndex}`, this.edgeCount)
    this.edgeFlows.push(0)
    this.edgeCount++
  }

  public solve(source: number, sink: number, maxFlow?: number): { flow: number; cost: number } {
    if (source < 0 || source >= this.nodeCount) {
      throw new Error(`Source ${source} out of bounds`)
    }
    if (sink < 0 || sink >= this.nodeCount) {
      throw new Error(`Sink ${sink} out of bounds`)
    }
    if (source === sink) {
      return { flow: 0, cost: 0 }
    }

    let totalFlow = 0
    let totalCost = 0
    const targetFlow = maxFlow ?? Infinity

    while (totalFlow < targetFlow) {
      const { dist, prevNode, prevEdge, augFlow } = this.spfa(source, sink)

      if (augFlow === 0) {
        break
      }

      const flowToSend = Math.min(augFlow, targetFlow - totalFlow)
      if (flowToSend <= 0) {
        break
      }

      let current = sink
      while (current !== source) {
        const prev = prevNode[current]!
        const edgeIndex = prevEdge[current]!
        const edge = this.graph[prev]![edgeIndex]!
        edge.capacity -= flowToSend

        const reverseEdge = this.graph[edge.to]![edge.rev]!
        reverseEdge.capacity += flowToSend

        const edgeKey = `${prev}-${edgeIndex}`
        const edgeIndexFlow = this.edgeToIndex.get(edgeKey)
        if (edgeIndexFlow !== undefined) {
          this.edgeFlows[edgeIndexFlow] += flowToSend
        }

        current = prev
      }

      totalFlow += flowToSend
      totalCost += flowToSend * dist[sink]!
    }

    return { flow: totalFlow, cost: totalCost }
  }

  private spfa(source: number, sink: number): {
    dist: number[]
    prevNode: number[]
    prevEdge: number[]
    augFlow: number
  } {
    const dist = Array.from({ length: this.nodeCount }, () => Infinity)
    const prevNode = Array.from({ length: this.nodeCount }, () => -1)
    const prevEdge = Array.from({ length: this.nodeCount }, () => -1)
    const inQueue = Array.from({ length: this.nodeCount }, () => false)
    const count = Array.from({ length: this.nodeCount }, () => 0)

    dist[source] = 0
    const queue: number[] = [source]
    inQueue[source]! = true
    count[source]!++

    let hasNegativeCycle = false

    let _qi = 0
    while (_qi < queue.length) {
      const u = queue[_qi++]!
      inQueue[u]! = false

      if (count[u]! > this.nodeCount) {
        hasNegativeCycle = true
        break
      }

      const edges = this.graph[u]!
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i]
        if (edge === undefined) continue

        if (edge.capacity > 0 && dist[edge.to]! > dist[u]! + edge.cost) {
          dist[edge.to]! = dist[u]! + edge.cost
          prevNode[edge.to]! = u
          prevEdge[edge.to]! = i

          if (!inQueue[edge.to]!) {
            queue.push(edge.to)
            inQueue[edge.to]! = true
            count[edge.to]!++

            if (count[edge.to]! > this.nodeCount) {
              hasNegativeCycle = true
              break
            }
          }
        }
      }

      if (hasNegativeCycle) {
        break
      }
    }

    if (dist[sink] === Infinity || hasNegativeCycle) {
      return { dist, prevNode, prevEdge, augFlow: 0 }
    }

    let current = sink
    let minFlow = Infinity
    while (current !== source && minFlow > 0) {
      const prev = prevNode[current]!
      if (prev === -1) {
        minFlow = 0
        break
      }

      const edgeIndex = prevEdge[current]!
      const edge = this.graph[prev]![edgeIndex]
      if (edge === undefined) {
        minFlow = 0
        break
      }

      minFlow = Math.min(minFlow, edge.capacity)
      current = prev!
    }

    return { dist, prevNode, prevEdge, augFlow: minFlow }
  }

  public getFlow(edgeIndex: number): number {
    if (edgeIndex < 0 || edgeIndex >= this.edgeFlows.length) {
      throw new Error(`Edge index ${edgeIndex} out of bounds`)
    }
    return this.edgeFlows[edgeIndex]
  }
}