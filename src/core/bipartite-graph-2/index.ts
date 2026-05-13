export class BipartiteGraph2 {
  private leftVertices: Set<string>;
  private rightVertices: Set<string>;
  private edges: Map<string, Map<string, number>>;

  constructor() {
    this.leftVertices = new Set();
    this.rightVertices = new Set();
    this.edges = new Map();
  }

  addLeftVertex(id: string): void {
    this.leftVertices.add(id);
  }

  addRightVertex(id: string): void {
    this.rightVertices.add(id);
  }

  addEdge(leftId: string, rightId: string, weight: number = 1): void {
    if (!this.leftVertices.has(leftId)) {
      throw new Error(`Left vertex ${leftId} does not exist`);
    }
    if (!this.rightVertices.has(rightId)) {
      throw new Error(`Right vertex ${rightId} does not exist`);
    }

    if (!this.edges.has(leftId)) {
      this.edges.set(leftId, new Map());
    }

    this.edges.get(leftId)!.set(rightId, weight);
  }

  removeEdge(leftId: string, rightId: string): boolean {
    const leftEdges = this.edges.get(leftId);
    if (!leftEdges) {
      return false;
    }

    const removed = leftEdges.delete(rightId);
    if (leftEdges.size === 0) {
      this.edges.delete(leftId);
    }

    return removed;
  }

  hasEdge(leftId: string, rightId: string): boolean {
    const leftEdges = this.edges.get(leftId);
    if (!leftEdges) {
      return false;
    }

    return leftEdges.has(rightId);
  }

  getNeighbors(vertexId: string): string[] {
    if (this.leftVertices.has(vertexId)) {
      const neighbors = this.edges.get(vertexId);
      return neighbors ? Array.from(neighbors.keys()) : [];
    }

    if (this.rightVertices.has(vertexId)) {
      const neighbors: string[] = [];
      const leftIds = Array.from(this.edges.keys());
      for (let i = 0; i < leftIds.length; i++) {
        const leftId = leftIds[i];
        const rightEdges = this.edges.get(leftId);
        if (rightEdges && rightEdges.has(vertexId)) {
          neighbors.push(leftId);
        }
      }
      return neighbors;
    }

    return [];
  }

  getLeftVertices(): string[] {
    return Array.from(this.leftVertices);
  }

  getRightVertices(): string[] {
    return Array.from(this.rightVertices);
  }

  getEdgeWeight(leftId: string, rightId: string): number | undefined {
    const leftEdges = this.edges.get(leftId);
    if (!leftEdges) {
      return undefined;
    }

    return leftEdges.get(rightId);
  }

  vertexCount(): number {
    return this.leftVertices.size + this.rightVertices.size;
  }

  edgeCount(): number {
    let count = 0;
    const edgeMaps = Array.from(this.edges.values());
    for (let i = 0; i < edgeMaps.length; i++) {
      count += edgeMaps[i]!.size;
    }
    return count;
  }
}
