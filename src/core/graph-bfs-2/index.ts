export class GraphBFS2 {
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

  bfs(startVertex: number, callback: (node: number) => void): void {
    if (!this.hasVertex(startVertex)) {
      return;
    }

    const visited = new Set<number>();
    const queue: number[] = [startVertex];
    visited.add(startVertex);
    let _qi = 0;

    while (_qi < queue.length) {
      const current = queue[_qi++]!;
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

  hasVertex(id: number): boolean {
    return this.adjacencyList.has(id);
  }

  hasEdge(from: number, to: number): boolean {
    const neighbors = this.adjacencyList.get(from);
    return neighbors ? neighbors.has(to) : false;
  }

  getVertexCount(): number {
    return this.adjacencyList.size;
  }

  getEdgeCount(): number {
    const seenEdges = new Set<string>();
    let count = 0;

    for (const [from, neighbors] of Array.from(this.adjacencyList.entries())) {
      for (const [to] of neighbors) {
        if (this.directed) {
          count++;
        } else {
          const edgeKey = `${Math.min(from, to)}-${Math.max(from, to)}`;
          if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            count++;
          }
        }
      }
    }

    return count;
  }

  getTimeComplexity(operation: string): string {
    const complexities: Record<string, string> = {
      'addVertex': 'O(1)',
      'addEdge': 'O(1)',
      'hasVertex': 'O(1)',
      'hasEdge': 'O(1)',
      'getVertexCount': 'O(1)',
      'getEdgeCount': 'O(V + E)',
      'bfs': 'O(V + E)',
      'shortestPath': 'O(V + E)',
      'bfsLevels': 'O(V + E)',
      'findConnectedComponents': 'O(V + E)',
      'isBipartite': 'O(V + E)',
      'hasCycle': 'O(V + E)',
    };

    return complexities[operation] || 'Unknown';
  }

  shortestPath(start: number, end: number): number[] | null {
    if (!this.hasVertex(start) || !this.hasVertex(end)) {
      return null;
    }

    if (start === end) {
      return [start];
    }

    const queue: number[] = [start];
    const visited = new Set<number>([start]);
    const parent: Map<number, number> = new Map();
    let _qi = 0;

    while (_qi < queue.length) {
      const current = queue[_qi++]!;

      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            parent.set(neighbor, current);
            queue.push(neighbor);

            if (neighbor === end) {
              return this.reconstructPath(parent, start, end);
            }
          }
        }
      }
    }

    return null;
  }

  bfsLevels(start: number): number[][] {
    const levels: number[][] = [];
    const visited = new Set<number>();

    if (!this.hasVertex(start)) {
      return levels;
    }

    const queue: number[] = [start];
    visited.add(start);
    let _qi = 0;

    while (_qi < queue.length) {
      const levelSize = queue.length - _qi;
      const currentLevel: number[] = [];

      for (let i = 0; i < levelSize; i++) {
        const current = queue[_qi++]!;
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

  findConnectedComponents(): number[][] {
    const visited = new Set<number>();
    const components: number[][] = [];

    for (const vertex of Array.from(this.adjacencyList.keys())) {
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

  isBipartite(): boolean {
    const colors: Map<number, number> = new Map();

    for (const vertex of Array.from(this.adjacencyList.keys())) {
      if (!colors.has(vertex)) {
        if (!this.checkBipartiteBFS(vertex, 0, colors)) {
          return false;
        }
      }
    }

    return true;
  }

  hasCycle(): boolean {
    const visited = new Set<number>();
    const parentMap = new Map<number, number>();

    for (const vertex of Array.from(this.adjacencyList.keys())) {
      if (!visited.has(vertex)) {
        if (this.detectCycleBFS(vertex, visited, parentMap)) {
          return true;
        }
      }
    }

    return false;
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

  private checkBipartiteBFS(startVertex: number, startColor: number, colors: Map<number, number>): boolean {
    const queue: number[] = [startVertex];
    colors.set(startVertex, startColor);
    let _qi = 0;

    while (_qi < queue.length) {
      const current = queue[_qi++]!;
      const currentColor = colors.get(current) ?? 0;

      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!colors.has(neighbor)) {
            colors.set(neighbor, 1 - currentColor);
            queue.push(neighbor);
          } else if (colors.get(neighbor) === currentColor) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private detectCycleBFS(start: number, visited: Set<number>, parentMap: Map<number, number>): boolean {
    const queue: number[] = [start];
    visited.add(start);
    parentMap.set(start, -1);
    let _qi = 0;

    while (_qi < queue.length) {
      const current = queue[_qi++]!;

      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            parentMap.set(neighbor, current);
            queue.push(neighbor);
          } else if (neighbor !== parentMap.get(current)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  toString(): string {
    return `GraphBFS2()`
  }
}
