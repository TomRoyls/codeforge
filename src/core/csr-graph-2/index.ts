export class CSRGraph2 {
  private _vertexCount: number;
  private edges: Array<{ from: number; to: number; weight: number | undefined }>;
  private offsets: number[] | null;
  private csrEdges: Array<{ to: number; weight: number | undefined }> | null;
  private _edgeCount: number;

  constructor(vertexCount: number) {
    this._vertexCount = vertexCount;
    this.edges = [];
    this.offsets = null;
    this.csrEdges = null;
    this._edgeCount = 0;
  }

  addEdge(from: number, to: number, weight?: number): void {
    if (this.offsets !== null) {
      throw new Error('Cannot add edges after build() is called');
    }
    this.edges.push({ from, to, weight });
    this._edgeCount++;
  }

  build(): void {
    if (this.offsets !== null) {
      return;
    }

    const sortedEdges = [...this.edges].sort((a, b) => a.from - b.from);

    this.offsets = new Array(this._vertexCount + 1).fill(0);
    this.csrEdges = [];

    let currentVertex = 0;
    let edgeIndex = 0;

    for (const edge of sortedEdges) {
      while (currentVertex < edge.from) {
        this.offsets![currentVertex + 1] = edgeIndex;
        currentVertex++;
      }
      this.csrEdges.push({ to: edge.to, weight: edge.weight });
      edgeIndex++;
    }

    while (currentVertex < this._vertexCount) {
      this.offsets![currentVertex + 1] = edgeIndex;
      currentVertex++;
    }

    this.edges = [];
  }

  getNeighbors(vertex: number): Array<{ to: number; weight?: number }> {
    if (this.offsets === null || this.csrEdges === null) {
      throw new Error('Must call build() before querying');
    }

    const start = this.offsets![vertex];
    const end = this.offsets![vertex + 1];
    const neighbors: Array<{ to: number; weight?: number }> = [];

    for (let i = start!; i < end!; i++) {
      neighbors.push({ ...this.csrEdges![i]! });
    }

    return neighbors;
  }

  edgeCount(): number {
    return this._edgeCount;
  }

  vertexCount(): number {
    return this._vertexCount;
  }

  hasEdge(from: number, to: number): boolean {
    if (this.offsets === null || this.csrEdges === null) {
      throw new Error('Must call build() before querying');
    }

    const start = this.offsets![from];
    const end = this.offsets![from + 1];

    for (let i = start!; i < end!; i++) {
      if (this.csrEdges![i]!.to === to) {
        return true;
      }
    }

    return false;
  }

  clear(): void {
    this.edges = []
    this.offsets = null
    this.csrEdges = null
    this._edgeCount = 0
  }

  toString(): string {
    return `CSRGraph2()`
  }
}
