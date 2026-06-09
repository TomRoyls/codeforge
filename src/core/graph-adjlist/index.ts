export class GraphAdjList<T> {
  private adjacencyList: Map<T, Map<T, number>>;
  private directed: boolean;

  constructor(options: { directed?: boolean } = {}) {
    this.adjacencyList = new Map();
    this.directed = options.directed ?? false;
  }

  addVertex(v: T): void {
    if (!this.adjacencyList.has(v)) {
      this.adjacencyList.set(v, new Map());
    }
  }

  removeVertex(v: T): boolean {
    if (!this.adjacencyList.has(v)) {
      return false;
    }

    this.adjacencyList.delete(v);

    const neighborsList = Array.from(this.adjacencyList.values());
    for (const neighbors of neighborsList) {
      neighbors.delete(v);
    }

    return true;
  }

  addEdge(from: T, to: T, weight?: number): void {
    this.addVertex(from);
    this.addVertex(to);

    const edgeWeight = weight ?? 1;
    this.adjacencyList.get(from)!.set(to, edgeWeight);

    if (!this.directed) {
      this.adjacencyList.get(to)!.set(from, edgeWeight);
    }
  }

  removeEdge(from: T, to: T): boolean {
    const neighborsFrom = this.adjacencyList.get(from);
    if (!neighborsFrom || !neighborsFrom.has(to)) {
      return false;
    }

    neighborsFrom.delete(to);

    if (!this.directed) {
      const neighborsTo = this.adjacencyList.get(to);
      neighborsTo?.delete(from);
    }

    return true;
  }

  hasVertex(v: T): boolean {
    return this.adjacencyList.has(v);
  }

  hasEdge(from: T, to: T): boolean {
    const neighbors = this.adjacencyList.get(from);
    return neighbors !== undefined && neighbors.has(to);
  }

  getNeighbors(v: T): T[] {
    const neighbors = this.adjacencyList.get(v);
    return neighbors ? [...neighbors.keys()] : [];
  }

  getEdgeWeight(from: T, to: T): number | undefined {
    const neighbors = this.adjacencyList.get(from);
    return neighbors?.get(to);
  }

  getVertices(): T[] {
    return Array.from(this.adjacencyList.keys());
  }

  getEdges(): Array<[from: T, to: T, weight: number]> {
    const edges: Array<[T, T, number]> = [];

    for (const [from, neighbors] of this.adjacencyList) {
      for (const [to, weight] of neighbors) {
        if (this.directed || String(from) <= String(to)) {
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
    let count = 0;

    for (const [from, neighbors] of this.adjacencyList) {
      const neighborKeys = [...neighbors.keys()];
      for (const to of neighborKeys) {
        if (this.directed || String(from) <= String(to)) {
          count++;
        }
      }
    }

    return count;
  }

  isEmpty(): boolean {
    return this.adjacencyList.size === 0;
  }

  clear(): void {
    this.adjacencyList.clear();
  }

  bfs(start: T, callback: (vertex: T) => void): void {
    if (!this.adjacencyList.has(start)) {
      return;
    }

    const visited = new Set<T>();
    const queue: T[] = [start];
    let _qi = 0;
    visited.add(start);

    while (_qi < queue.length) {
      const vertex = queue[_qi++]!;
      callback(vertex);

      for (const neighbor of this.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }

  dfs(start: T, callback: (vertex: T) => void): void {
    if (!this.adjacencyList.has(start)) {
      return;
    }

    const visited = new Set<T>();

    const traverse = (vertex: T): void => {
      visited.add(vertex);
      callback(vertex);

      for (const neighbor of this.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          traverse(neighbor);
        }
      }
    };

    traverse(start);
  }

  hasPath(from: T, to: T): boolean {
    if (!this.adjacencyList.has(from) || !this.adjacencyList.has(to)) {
      return false;
    }

    if (from === to) {
      return true;
    }

    const visited = new Set<T>();
    const queue: T[] = [from];
    let _qi = 0;
    visited.add(from);

    while (_qi < queue.length) {
      const vertex = queue[_qi++]!;

      for (const neighbor of this.getNeighbors(vertex)) {
        if (neighbor === to) {
          return true;
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return false;
  }

  shortestPath(from: T, to: T): T[] | null {
    if (!this.adjacencyList.has(from) || !this.adjacencyList.has(to)) {
      return null;
    }

    if (from === to) {
      return [from];
    }

    const isWeighted = this.isWeighted();

    if (isWeighted) {
      return this.dijkstra(from, to);
    } else {
      return this.bfsShortestPath(from, to);
    }
  }

  private isWeighted(): boolean {
    const neighborsList = Array.from(this.adjacencyList.values());
    for (const neighbors of neighborsList) {
      const weightList = [...neighbors.values()];
      for (const weight of weightList) {
        if (weight !== 1) {
          return true;
        }
      }
    }
    return false;
  }

  private bfsShortestPath(from: T, to: T): T[] | null {
    const visited = new Set<T>();
    const queue: Array<{ vertex: T; path: T[] }> = [{ vertex: from, path: [from] }];
    let _qi = 0;
    visited.add(from);

    while (_qi < queue.length) {
      const { vertex, path } = queue[_qi++]!;

      for (const neighbor of this.getNeighbors(vertex)) {
        if (neighbor === to) {
          return [...path, to];
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ vertex: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null;
  }

  private dijkstra(from: T, to: T): T[] | null {
    const distances = new Map<T, number>();
    const previous = new Map<T, T>();
    const unvisited = new Set<T>(this.getVertices());

    const unvisitedList = Array.from(unvisited);
    for (const vertex of unvisitedList) {
      distances.set(vertex, Infinity);
    }
    distances.set(from, 0);

    while (unvisited.size > 0) {
      let current: T | null = null;
      let minDistance = Infinity;

      const unvisitedVertices = Array.from(unvisited);
      for (const vertex of unvisitedVertices) {
        const dist = distances.get(vertex)!;
        if (dist < minDistance) {
          minDistance = dist;
          current = vertex;
        }
      }

      if (current === null || distances.get(current)! === Infinity) {
        break;
      }

      if (current === to) {
        break;
      }

      unvisited.delete(current);

      for (const neighbor of this.getNeighbors(current)) {
        if (!unvisited.has(neighbor)) {
          continue;
        }

        const weight = this.getEdgeWeight(current, neighbor)!;
        const newDist = distances.get(current)! + weight;

        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
          previous.set(neighbor, current);
        }
      }
    }

    if (previous.get(to) === undefined && from !== to) {
      return null;
    }

    const path: T[] = [];
    let current: T | undefined = to;

    while (current !== undefined) {
      path.unshift(current);
      current = previous.get(current);
    }

    return path[0] === from ? path : null;
  }

  degree(v: T): number {
    if (!this.adjacencyList.has(v)) {
      return 0;
    }

    if (this.directed) {
      return this.getNeighbors(v).length;
    } else {
      return this.getNeighbors(v).length;
    }
  }
  *[Symbol.iterator]() {
    yield* this.getEdges()
  }

  toArray() {
    return this.getEdges()
  }

  toString(): string {
    return `GraphAdjList()`
  }

  toJSON() {
    return { type: 'GraphAdjList', items: this.toArray() }
  }
}
