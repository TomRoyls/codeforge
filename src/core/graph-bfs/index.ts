export class GraphBFS {
  private adjacencyList: Map<number, Map<number, number>>;
  private directed: boolean;

  constructor(directed: boolean = false) {
    this.adjacencyList = new Map();
    this.directed = directed;
  }

  addVertex(id: number): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Map());
    }
  }

  addEdge(from: number, to: number, weight: number = 1): void {
    this.addVertex(from);
    this.addVertex(to);

    const neighbors = this.adjacencyList.get(from);
    if (neighbors) {
      neighbors.set(to, weight);
    }

    if (!this.directed) {
      const reverseNeighbors = this.adjacencyList.get(to);
      if (reverseNeighbors) {
        reverseNeighbors.set(from, weight);
      }
    }
  }

  removeVertex(id: number): void {
    this.adjacencyList.delete(id);
    for (const [vertex, neighbors] of this.adjacencyList) {
      neighbors.delete(id);
    }
  }

  removeEdge(from: number, to: number): void {
    const neighbors = this.adjacencyList.get(from);
    if (neighbors) {
      neighbors.delete(to);
    }

    if (!this.directed) {
      const reverseNeighbors = this.adjacencyList.get(to);
      if (reverseNeighbors) {
        reverseNeighbors.delete(from);
      }
    }
  }

  hasVertex(id: number): boolean {
    return this.adjacencyList.has(id);
  }

  hasEdge(from: number, to: number): boolean {
    const neighbors = this.adjacencyList.get(from);
    return neighbors ? neighbors.has(to) : false;
  }

  vertices(): number[] {
    return Array.from(this.adjacencyList.keys());
  }

  edges(): [number, number, number][] {
    const result: [number, number, number][] = [];
    const seenEdges = new Set<string>();

    for (const [from, neighbors] of this.adjacencyList) {
      for (const [to, weight] of neighbors) {
        if (this.directed) {
          result.push([from, to, weight]);
        } else {
          const edgeKey = `${Math.min(from, to)}-${Math.max(from, to)}`;
          if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            result.push([from, to, weight]);
          }
        }
      }
    }

    return result;
  }

  bfs(start: number, callback: (node: number) => void): void {
    if (!this.hasVertex(start)) {
      return;
    }

    const visited = new Set<number>();
    const queue: number[] = [start];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift() as number;
      callback(current);

      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
  }

  shortestPath(from: number, to: number): number[] | null {
    if (!this.hasVertex(from) || !this.hasVertex(to)) {
      return null;
    }

    if (from === to) {
      return [from];
    }

    const queue: number[] = [from];
    const visited = new Set<number>([from]);
    const parent: Map<number, number> = new Map();

    while (queue.length > 0) {
      const current = queue.shift() as number;

      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            parent.set(neighbor, current);
            queue.push(neighbor);

            if (neighbor === to) {
              return this.reconstructPath(parent, from, to);
            }
          }
        }
      }
    }

    return null;
  }

  distances(from: number): Map<number, number> {
    const distances = new Map<number, number>();
    const visited = new Set<number>();

    for (const vertex of this.vertices()) {
      distances.set(vertex, -1);
    }

    if (!this.hasVertex(from)) {
      return distances;
    }

    const queue: number[] = [from];
    visited.add(from);
    distances.set(from, 0);

    while (queue.length > 0) {
      const current = queue.shift() as number;
      const currentDistance = distances.get(current) ?? 0;

      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            distances.set(neighbor, currentDistance + 1);
            queue.push(neighbor);
          }
        }
      }
    }

    return distances;
  }

  bfsLevelOrder(start: number): number[][] {
    const levels: number[][] = [];
    const visited = new Set<number>();

    if (!this.hasVertex(start)) {
      return levels;
    }

    const queue: number[] = [start];
    visited.add(start);

    while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevel: number[] = [];

      for (let i = 0; i < levelSize; i++) {
        const current = queue.shift() as number;
        currentLevel.push(current);

        const neighbors = this.adjacencyList.get(current);
        if (neighbors) {
          for (const neighbor of neighbors.keys()) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
      }

      levels.push(currentLevel);
    }

    return levels;
  }

  isBipartite(): boolean {
    const colors: Map<number, number> = new Map();

    for (const vertex of this.vertices()) {
      if (!colors.has(vertex)) {
        if (!this.checkBipartiteDFS(vertex, 0, colors)) {
          return false;
        }
      }
    }

    return true;
  }

  getConnectedComponents(): number[][] {
    const visited = new Set<number>();
    const components: number[][] = [];

    for (const vertex of this.vertices()) {
      if (!visited.has(vertex)) {
        const component: number[] = [];
        this.bfs(vertex, (node) => {
          visited.add(node);
          component.push(node);
        });
        components.push(component);
      }
    }

    return components;
  }

  get vertexCount(): number {
    return this.adjacencyList.size;
  }

  get edgeCount(): number {
    return this.edges().length;
  }

  private reconstructPath(parent: Map<number, number>, from: number, to: number): number[] {
    const path: number[] = [to];
    let current = to;

    while (parent.has(current) && current !== from) {
      current = parent.get(current) ?? current;
      path.unshift(current);
    }

    if (current !== from) {
      return [];
    }

    return path;
  }

  private checkBipartiteDFS(vertex: number, color: number, colors: Map<number, number>): boolean {
    colors.set(vertex, color);

    const neighbors = this.adjacencyList.get(vertex);
    if (neighbors) {
      for (const neighbor of neighbors.keys()) {
        if (!colors.has(neighbor)) {
          if (!this.checkBipartiteDFS(neighbor, 1 - color, colors)) {
            return false;
          }
        } else if (colors.get(neighbor) === color) {
          return false;
        }
      }
    }

    return true;
  }
}
