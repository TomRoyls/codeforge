export class GraphDFS {
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
    for (const neighbors of this.adjacencyList.values()) {
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

  removeVertex(id: number): boolean {
    if (!this.adjacencyList.has(id)) {
      return false;
    }
    for (const neighbors of this.adjacencyList.values()) {
      neighbors.delete(id);
    }
    this.adjacencyList.delete(id);
    return true;
  }

  removeEdge(from: number, to: number): boolean {
    if (!this.hasEdge(from, to)) {
      return false;
    }
    this.adjacencyList.get(from)!.delete(to);
    if (!this.directed) {
      this.adjacencyList.get(to)!.delete(from);
    }
    return true;
  }

  hasVertex(id: number): boolean {
    return this.adjacencyList.has(id);
  }

  hasEdge(from: number, to: number): boolean {
    return this.adjacencyList.has(from) && this.adjacencyList.get(from)!.has(to);
  }

  vertices(): number[] {
    return Array.from(this.adjacencyList.keys());
  }

  edges(): [number, number, number][] {
    const edges: [number, number, number][] = [];
    const seen = new Set<string>();
    for (const [from, neighbors] of this.adjacencyList) {
      for (const [to, weight] of neighbors) {
        const key1 = `${from}-${to}`;
        const key2 = `${to}-${from}`;
        if (this.directed || !seen.has(key1) && !seen.has(key2)) {
          edges.push([from, to, weight]);
          seen.add(key1);
          if (!this.directed) {
            seen.add(key2);
          }
        }
      }
    }
    return edges;
  }

  dfs(start: number, callback: (node: number) => void): void {
    if (!this.hasVertex(start)) {
      return;
    }
    const visited = new Set<number>();
    const visitOrder: number[] = [];

    const traverse = (node: number): void => {
      if (visited.has(node)) {
        return;
      }
      visited.add(node);
      visitOrder.push(node);
      callback(node);
      const neighbors = this.adjacencyList.get(node);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          traverse(neighbor);
        }
      }
    };

    traverse(start);
  }

  dfsIterative(start: number, callback: (node: number) => void): void {
    if (!this.hasVertex(start)) {
      return;
    }
    const visited = new Set<number>();
    const visitOrder: number[] = [];
    const stack: number[] = [start];

    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) {
        continue;
      }
      visited.add(node);
      visitOrder.push(node);
      callback(node);
      const neighbors = this.adjacencyList.get(node);
      if (neighbors) {
        const neighborList = [...neighbors.keys()].reverse();
        for (const neighbor of neighborList) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }
  }

  hasPath(from: number, to: number): boolean {
    if (!this.hasVertex(from) || !this.hasVertex(to)) {
      return false;
    }
    if (from === to) {
      return true;
    }
    const visited = new Set<number>();
    const stack: number[] = [from];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node === to) {
        return true;
      }
      if (visited.has(node)) {
        continue;
      }
      visited.add(node);
      const neighbors = this.adjacencyList.get(node);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }
    return false;
  }

  getPaths(from: number, to: number): number[][] {
    const paths: number[][] = [];
    if (!this.hasVertex(from) || !this.hasVertex(to)) {
      return paths;
    }
    const visited = new Set<number>();

    const findPaths = (current: number, path: number[]): void => {
      if (current === to) {
        paths.push([...path, to]);
        return;
      }
      visited.add(current);
      const neighbors = this.adjacencyList.get(current);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            findPaths(neighbor, [...path, current]);
          }
        }
      }
      visited.delete(current);
    };

    findPaths(from, []);
    return paths;
  }

  getConnectedComponents(): number[][] {
    const components: number[][] = [];
    const visited = new Set<number>();

    for (const vertex of this.vertices()) {
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

  isCyclic(): boolean {
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

    for (const vertex of this.vertices()) {
      if (!visited.has(vertex)) {
        if (hasCycle(vertex)) {
          return true;
        }
      }
    }
    return false;
  }

  topologicalSort(): number[] | null {
    if (!this.directed) {
      return null;
    }
    if (this.isCyclic()) {
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

    for (const vertex of this.vertices()) {
      if (!visited.has(vertex)) {
        visit(vertex);
      }
    }
    return result.reverse();
  }
  *[Symbol.iterator]() {
    yield* this.edges()
  }

  toArray() {
    return this.edges()
  }
}
