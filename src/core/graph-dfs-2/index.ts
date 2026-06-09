export class GraphDFS2 {
  private adjacencyList: Map<number, Map<number, number>>;
  private directed: boolean;

  constructor(directed = false) {
    this.adjacencyList = new Map();
    this.directed = directed;
  }

  get vertexCount(): number {
    return this.adjacencyList.size;
  }

  get edgeCount(): number {
    let count = 0;
    for (const neighbors of Array.from(this.adjacencyList.values())) {
      count += neighbors.size;
    }
    return this.directed ? count : count / 2;
  }

  addVertex(id: number): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Map());
    }
  }

  addEdge(from: number, to: number, weight = 1): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.set(to, weight);
    if (!this.directed) {
      this.adjacencyList.get(to)!.set(from, weight);
    }
  }

  hasVertex(id: number): boolean {
    return this.adjacencyList.has(id);
  }

  hasEdge(from: number, to: number): boolean {
    return this.adjacencyList.has(from) && this.adjacencyList.get(from)!.has(to);
  }

  dfs(startVertex: number): number[] {
    if (!this.hasVertex(startVertex)) {
      return [];
    }
    const visited = new Set<number>();
    const result: number[] = [];

    const traverse = (node: number): void => {
      if (visited.has(node)) {
        return;
      }
      visited.add(node);
      result.push(node);
      const neighbors = this.adjacencyList.get(node);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          traverse(neighbor);
        }
      }
    };

    traverse(startVertex);
    return result;
  }

  topologicalSort(): number[] | null {
    if (!this.directed) {
      return null;
    }
    if (this.detectCycle()) {
      return null;
    }
    const visited = new Set<number>();
    const result: number[] = [];

    const visit = (node: number): void => {
      visited.add(node);
      const neighbors = this.adjacencyList.get(node);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visit(neighbor);
          }
        }
      }
      result.push(node);
    };

    for (const vertex of Array.from(this.adjacencyList.keys())) {
      if (!visited.has(vertex)) {
        visit(vertex);
      }
    }
    return result.reverse();
  }

  detectCycle(): boolean {
    if (this.vertexCount === 0) {
      return false;
    }
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    const hasCycle = (node: number): boolean => {
      visited.add(node);
      recursionStack.add(node);
      const neighbors = this.adjacencyList.get(node);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            if (hasCycle(neighbor)) {
              return true;
            }
          } else if (recursionStack.has(neighbor)) {
            return true;
          }
        }
      }
      recursionStack.delete(node);
      return false;
    };

    for (const vertex of Array.from(this.adjacencyList.keys())) {
      if (!visited.has(vertex)) {
        if (hasCycle(vertex)) {
          return true;
        }
      }
    }
    return false;
  }

  findPath(start: number, end: number): number[] | null {
    if (!this.hasVertex(start) || !this.hasVertex(end)) {
      return null;
    }
    if (start === end) {
      return [start];
    }
    const visited = new Set<number>();
    const parent = new Map<number, number>();

    const dfsSearch = (node: number): boolean => {
      if (node === end) {
        return true;
      }
      visited.add(node);
      const neighbors = this.adjacencyList.get(node);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            parent.set(neighbor, node);
            if (dfsSearch(neighbor)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    if (dfsSearch(start)) {
      const path: number[] = [];
      let current: number | undefined = end;
      while (current !== undefined) {
        path.unshift(current);
        current = parent.get(current);
      }
      return path;
    }
    return null;
  }

  findConnectedComponents(): number[][] {
    const components: number[][] = [];
    const visited = new Set<number>();

    for (const vertex of Array.from(this.adjacencyList.keys())) {
      if (!visited.has(vertex)) {
        const component: number[] = [];
        const stack: number[] = [vertex];

        while (stack.length > 0) {
          const node = stack.pop()!;
          if (visited.has(node)) {
            continue;
          }
          visited.add(node);
          component.push(node);
          const neighbors = this.adjacencyList.get(node);
          if (neighbors) {
            for (const neighbor of neighbors.keys()) {
              if (!visited.has(neighbor)) {
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

  isBipartite(): boolean {
    const color = new Map<number, number>();

    const checkBipartite = (start: number): boolean => {
      const stack: number[] = [start];
      color.set(start, 0);

      while (stack.length > 0) {
        const node = stack.pop()!;
        const currentColor = color.get(node)!;
        const neighbors = this.adjacencyList.get(node);
        if (neighbors) {
          for (const neighbor of neighbors.keys()) {
            if (!color.has(neighbor)) {
              color.set(neighbor, 1 - currentColor);
              stack.push(neighbor);
            } else if (color.get(neighbor) === currentColor) {
              return false;
            }
          }
        }
      }
      return true;
    };

    for (const vertex of Array.from(this.adjacencyList.keys())) {
      if (!color.has(vertex)) {
        if (!checkBipartite(vertex)) {
          return false;
        }
      }
    }
    return true;
  }

  getTimeComplexity(): { operation: string; time: string; space: string }[] {
    return [
      { operation: 'addVertex', time: 'O(1)', space: 'O(1)' },
      { operation: 'addEdge', time: 'O(1)', space: 'O(1)' },
      { operation: 'hasVertex', time: 'O(1)', space: 'O(1)' },
      { operation: 'hasEdge', time: 'O(1)', space: 'O(1)' },
      { operation: 'dfs', time: 'O(V + E)', space: 'O(V)' },
      { operation: 'topologicalSort', time: 'O(V + E)', space: 'O(V)' },
      { operation: 'detectCycle', time: 'O(V + E)', space: 'O(V)' },
      { operation: 'findPath', time: 'O(V + E)', space: 'O(V)' },
      { operation: 'findConnectedComponents', time: 'O(V + E)', space: 'O(V)' },
      { operation: 'isBipartite', time: 'O(V + E)', space: 'O(V)' },
      { operation: 'vertexCount (getter)', time: 'O(1)', space: 'O(1)' },
      { operation: 'edgeCount (getter)', time: 'O(V)', space: 'O(1)' },
      { operation: 'Graph Storage', time: '-', space: 'O(V + E)' }
    ];
  }

  toString(): string {
    return `GraphDFS2()`
  }

  clear(): void {
    this.adjacencyList = new Map()
  }
}
