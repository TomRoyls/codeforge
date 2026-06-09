export class GraphDijkstra {
  private adjacencyList: Map<number, Map<number, number>>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(id: number): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Map());
    }
  }

  addEdge(from: number, to: number, weight: number): void {
    if (weight < 0) {
      throw new Error("Weight must be non-negative");
    }
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.set(to, weight);
  }

  removeVertex(id: number): void {
    this.adjacencyList.delete(id);
    for (const edges of this.adjacencyList.values()) {
      edges.delete(id);
    }
  }

  removeEdge(from: number, to: number): void {
    if (this.adjacencyList.has(from)) {
      this.adjacencyList.get(from)!.delete(to);
    }
  }

  hasVertex(id: number): boolean {
    return this.adjacencyList.has(id);
  }

  hasEdge(from: number, to: number): boolean {
    if (!this.adjacencyList.has(from)) {
      return false;
    }
    return this.adjacencyList.get(from)!.has(to);
  }

  vertices(): number[] {
    return Array.from(this.adjacencyList.keys());
  }

  edges(): [number, number, number][] {
    const edges: [number, number, number][] = [];
    for (const [from, toMap] of this.adjacencyList.entries()) {
      for (const [to, weight] of toMap.entries()) {
        edges.push([from, to, weight]);
      }
    }
    return edges;
  }

  dijkstra(start: number): Map<number, { dist: number; path: number[] }> {
    if (!this.hasVertex(start)) {
      return new Map();
    }

    const distances = new Map<number, number>();
    const previous = new Map<number, number>();
    const unvisited = new Set<number>();

    for (const vertex of this.vertices()) {
      distances.set(vertex, Infinity);
      unvisited.add(vertex);
    }
    distances.set(start, 0);

    while (unvisited.size > 0) {
      let current: number | null = null;
      let minDistance = Infinity;

      for (const vertex of unvisited) {
        const dist = distances.get(vertex)!;
        if (dist < minDistance) {
          minDistance = dist;
          current = vertex;
        }
      }

      if (current === null || minDistance === Infinity) {
        break;
      }

      unvisited.delete(current);

      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const [neighbor, weight] of neighbors.entries()) {
          if (unvisited.has(neighbor)) {
            const newDist = distances.get(current)! + weight;
            if (newDist < distances.get(neighbor)!) {
              distances.set(neighbor, newDist);
              previous.set(neighbor, current);
            }
          }
        }
      }
    }

    const result = new Map<number, { dist: number; path: number[] }>();
    for (const [vertex, dist] of distances) {
      if (dist !== Infinity) {
        const path: number[] = [];
        let current: number | undefined = vertex;
        while (current !== undefined) {
          path.unshift(current);
          current = previous.get(current);
        }
        result.set(vertex, { dist, path });
      }
    }

    return result;
  }

  shortestPath(from: number, to: number): { dist: number; path: number[] } | null {
    if (!this.hasVertex(from) || !this.hasVertex(to)) {
      return null;
    }
    const result = this.dijkstra(from);
    return result.get(to) ?? null;
  }

  shortestDistance(from: number, to: number): number {
    const path = this.shortestPath(from, to);
    if (path === null) {
      return Infinity;
    }
    return path.dist;
  }

  isConnected(from: number, to: number): boolean {
    return this.shortestPath(from, to) !== null;
  }

  get vertexCount(): number {
    return this.adjacencyList.size;
  }

  get edgeCount(): number {
    let count = 0;
    for (const edges of this.adjacencyList.values()) {
      count += edges.size;
    }
    return count;
  }
  *[Symbol.iterator]() {
    yield* this.edges()
  }

  toArray() {
    return this.edges()
  }

  toString(): string {
    return `GraphDijkstra()`
  }
}
