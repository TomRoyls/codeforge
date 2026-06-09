export class GraphKruskal {
  private adjacencyList: Map<number, Map<number, number>> = new Map();

  addVertex(id: number): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Map());
    }
  }

  addEdge(from: number, to: number, weight: number): void {
    if (from === to) return;
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.set(to, weight);
    this.adjacencyList.get(to)!.set(from, weight);
  }

  removeEdge(from: number, to: number): void {
    const fromMap = this.adjacencyList.get(from);
    const toMap = this.adjacencyList.get(to);
    if (fromMap && toMap) {
      fromMap.delete(to);
      toMap.delete(from);
    }
  }

  vertices(): number[] {
    return Array.from(this.adjacencyList.keys());
  }

  edges(): [number, number, number][] {
    const edgeSet = new Set<string>();
    const edges: [number, number, number][] = [];
    for (const [from, neighbors] of this.adjacencyList) {
      for (const [to, weight] of neighbors) {
        const key = `${Math.min(from, to)}-${Math.max(from, to)}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push([from, to, weight]);
        }
      }
    }
    return edges;
  }

  get vertexCount(): number {
    return this.adjacencyList.size;
  }

  get edgeCount(): number {
    return this.edges().length;
  }

  private unionFind(parent: Map<number, number>, rank: Map<number, number>, x: number): number {
    if (parent.get(x) !== x) {
      parent.set(x, this.unionFind(parent, rank, parent.get(x)!));
    }
    return parent.get(x)!;
  }

  private union(parent: Map<number, number>, rank: Map<number, number>, x: number, y: number): void {
    const xRoot = this.unionFind(parent, rank, x);
    const yRoot = this.unionFind(parent, rank, y);
    if (xRoot === yRoot) return;
    if (rank.get(xRoot)! < rank.get(yRoot)!) {
      parent.set(xRoot, yRoot);
    } else if (rank.get(xRoot)! > rank.get(yRoot)!) {
      parent.set(yRoot, xRoot);
    } else {
      parent.set(yRoot, xRoot);
      rank.set(xRoot, rank.get(xRoot)! + 1);
    }
  }

  kruskalMST(): { edges: [number, number, number][]; totalWeight: number } {
    const allEdges = [...this.edges()].sort((a, b) => a[2] - b[2]);
    const mstEdges: [number, number, number][] = [];
    const parent = new Map<number, number>();
    const rank = new Map<number, number>();
    const vertices = this.vertices();

    for (const v of vertices) {
      parent.set(v, v);
      rank.set(v, 0);
    }

    for (const [from, to, weight] of allEdges) {
      const fromRoot = this.unionFind(parent, rank, from);
      const toRoot = this.unionFind(parent, rank, to);
      if (fromRoot !== toRoot) {
        this.union(parent, rank, from, to);
        mstEdges.push([from, to, weight]);
      }
    }

    const totalWeight = mstEdges.reduce((sum, edge) => sum + edge[2], 0);
    return { edges: mstEdges, totalWeight };
  }

  isConnected(): boolean {
    if (this.vertexCount === 0) return true;
    const vertices = this.vertices();
    const visited = new Set<number>();
    const stack = [vertices[0]!];
    visited.add(vertices[0]!);

    while (stack.length > 0) {
      const current = stack.pop()!;
      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        const neighborKeys = [...neighbors.keys()];
        for (const neighbor of neighborKeys) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            stack.push(neighbor);
          }
        }
      }
    }

    return visited.size === this.vertexCount;
  }

  getMSTWeight(): number {
    const mst = this.kruskalMST();
    return mst.totalWeight;
  }

  getConnectedComponents(): number[][] {
    const vertices = this.vertices();
    const visited = new Set<number>();
    const components: number[][] = [];

    for (const v of vertices) {
      if (!visited.has(v)) {
        const component: number[] = [];
        const stack = [v];
        visited.add(v);

        while (stack.length > 0) {
          const current = stack.pop()!;
          component.push(current);
          const neighbors = this.adjacencyList.get(current);
          if (neighbors) {
            const neighborKeys = [...neighbors.keys()];
            for (const neighbor of neighborKeys) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                stack.push(neighbor);
              }
            }
          }
        }
        components.push(component);
      }
    }

    return components;
  }
  *[Symbol.iterator]() {
    yield* this.edges()
  }

  toArray() {
    return [...this]
  }
}
