export class EdgeGraph2 {
  private vertices: Set<string> = new Set();
  private edges: {from: string, to: string, weight: number}[] = [];
  private directed: boolean;

  constructor(directed = false) {
    this.directed = directed;
  }

  addVertex(id: string): void {
    if (!this.vertices.has(id)) {
      this.vertices.add(id);
    }
  }

  addEdge(from: string, to: string, weight = 0): void {
    if (!this.vertices.has(from)) {
      this.vertices.add(from);
    }
    if (!this.vertices.has(to)) {
      this.vertices.add(to);
    }

    const existingIndex = this.edges.findIndex(e => e.from === from && e.to === to);
    if (existingIndex === -1) {
      this.edges.push({from, to, weight});
      if (!this.directed && from !== to) {
        this.edges.push({from: to, to: from, weight});
      }
    } else {
      this.edges[existingIndex]!.weight = weight;
      if (!this.directed && from !== to) {
        const reverseIndex = this.edges.findIndex(e => e.from === to && e.to === from);
        if (reverseIndex !== -1) {
          this.edges[reverseIndex]!.weight = weight;
        }
      }
    }
  }

  removeVertex(id: string): boolean {
    if (!this.vertices.has(id)) {
      return false;
    }

    this.vertices.delete(id);
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    return true;
  }

  removeEdge(from: string, to: string): boolean {
    const initialLength = this.edges.length;

    if (this.directed) {
      this.edges = this.edges.filter(e => !(e.from === from && e.to === to));
    } else {
      this.edges = this.edges.filter(e => !(e.from === from && e.to === to) && !(e.from === to && e.to === from));
    }

    return this.edges.length < initialLength;
  }

  hasVertex(id: string): boolean {
    return this.vertices.has(id);
  }

  hasEdge(from: string, to: string): boolean {
    return this.edges.some(e => e.from === from && e.to === to);
  }

  getVertices(): string[] {
    return Array.from(this.vertices);
  }

  getEdges(): {from: string, to: string, weight: number}[] {
    return [...this.edges];
  }

  getNeighbors(id: string): string[] {
    const neighbors = new Set<string>();
    for (const edge of this.edges) {
      if (edge.from === id) {
        neighbors.add(edge.to);
      }
    }
    return Array.from(neighbors);
  }

  get vertexCount(): number {
    return this.vertices.size;
  }

  get edgeCount(): number {
    return this.edges.length;
  }

  isDirected(): boolean {
    return this.directed;
  }

  clear(): void {
    this.vertices.clear();
    this.edges = [];
  }

  *[Symbol.iterator]() {
    yield* this.getEdges()
  }

  toArray() {
    return this.getEdges()
  }

  toString(): string {
    return `EdgeGraph2()`
  }
}
