import { increment } from '../../utils/map-helpers.js'

export class TopologicalQueue2 {
  private adjacency: Map<string, Set<string>>;
  private inDegreeMap: Map<string, number>;

  constructor() {
    this.adjacency = new Map();
    this.inDegreeMap = new Map();
  }

  addNode(id: string): void {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, new Set());
      this.inDegreeMap.set(id, 0);
    }
  }

  addEdge(from: string, to: string): void {
    this.addNode(from);
    this.addNode(to);

    const neighbors = this.adjacency.get(from)!;
    if (!neighbors.has(to)) {
      neighbors.add(to);
      increment(this.inDegreeMap, to);
    }
  }

  sort(): string[] {
    const result: string[] = [];
    const queue: string[] = [];
    let queueHead = 0
    const tempInDegree = new Map(this.inDegreeMap);

    for (const [node, degree] of tempInDegree) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    while (queue.length > queueHead) {
      const node = queue[queueHead]!;
      queueHead++
      result.push(node);

      const neighbors = this.adjacency.get(node)!;
      for (const neighbor of neighbors) {
        const newDegree = (tempInDegree.get(neighbor) ?? 0) - 1;
        tempInDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (result.length !== this.adjacency.size) {
      throw new Error('Graph contains a cycle');
    }

    return result;
  }

  hasCycle(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = this.adjacency.get(node)!;
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of Array.from(this.adjacency.keys())) {
      if (!visited.has(node)) {
        if (dfs(node)) {
          return true;
        }
      }
    }

    return false;
  }

  getNodes(): string[] {
    return Array.from(this.adjacency.keys());
  }

  getEdges(): {from: string, to: string}[] {
    const edges: {from: string, to: string}[] = [];
    for (const [from, neighbors] of Array.from(this.adjacency)) {
      for (const to of Array.from(neighbors)) {
        edges.push({from, to});
      }
    }
    return edges;
  }

  inDegree(id: string): number {
    return this.inDegreeMap.get(id) ?? 0;
  }

  outDegree(id: string): number {
    return this.adjacency.get(id)?.size ?? 0;
  }

  clear(): void {
    this.adjacency.clear();
    this.inDegreeMap.clear();
  }

  *[Symbol.iterator]() {
    yield* this.getEdges()
  }

  toArray() {
    return this.getEdges()
  }

  toJSON() {
    return { type: 'TopologicalQueue2', items: this.toArray() }
  }

  toString(): string {
    return `TopologicalQueue2()`
  }

  get [Symbol.toStringTag](): string {
    return 'TopologicalQueue2'
  }
}
