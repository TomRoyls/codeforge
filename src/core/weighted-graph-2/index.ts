export class WeightedGraph2 {
  private adjacencyList: Map<string, Array<{to: string; weight: number}>>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(id: string): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
  }

  addEdge(from: string, to: string, weight: number): void {
    if (!this.adjacencyList.has(from)) {
      this.addVertex(from);
    }
    if (!this.adjacencyList.has(to)) {
      this.addVertex(to);
    }
    const edges = this.adjacencyList.get(from)!;
    const existingIndex = edges.findIndex((e) => e.to === to);
    if (existingIndex >= 0) {
      edges[existingIndex]!.weight = weight;
    } else {
      edges.push({to, weight});
    }
  }

  removeVertex(id: string): boolean {
    if (!this.adjacencyList.has(id)) {
      return false;
    }
    this.adjacencyList.delete(id);
    for (const edges of this.adjacencyList.values()) {
      const index = edges.findIndex((e) => e.to === id);
      if (index >= 0) {
        edges.splice(index, 1);
      }
    }
    return true;
  }

  removeEdge(from: string, to: string): boolean {
    const edges = this.adjacencyList.get(from);
    if (!edges) {
      return false;
    }
    const index = edges.findIndex((e) => e.to === to);
    if (index < 0) {
      return false;
    }
    edges.splice(index, 1);
    return true;
  }

  hasVertex(id: string): boolean {
    return this.adjacencyList.has(id);
  }

  hasEdge(from: string, to: string): boolean {
    const edges = this.adjacencyList.get(from);
    if (!edges) {
      return false;
    }
    return edges.some((e) => e.to === to);
  }

  getEdgeWeight(from: string, to: string): number | undefined {
    const edges = this.adjacencyList.get(from);
    if (!edges) {
      return undefined;
    }
    const edge = edges.find((e) => e.to === to);
    return edge?.weight;
  }

  getNeighbors(id: string): Array<{to: string; weight: number}> {
    const edges = this.adjacencyList.get(id);
    if (!edges) {
      return [];
    }
    return [...edges];
  }

  vertexCount(): number {
    return this.adjacencyList.size;
  }

  edgeCount(): number {
    let count = 0;
    for (const edges of this.adjacencyList.values()) {
      count += edges.length;
    }
    return count;
  }

  vertices(): string[] {
    return Array.from(this.adjacencyList.keys());
  }

  clear(): void {
    this.adjacencyList = new Map()
  }
}
