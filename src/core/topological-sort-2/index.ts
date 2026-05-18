import { increment } from '../../utils/map-helpers.js'

export class TopologicalSort2 {
  private adjacency: Map<string, Set<string>>;
  private inDegree: Map<string, number>;

  constructor() {
    this.adjacency = new Map();
    this.inDegree = new Map();
  }

  addNode(id: string): void {
    if (!this.adjacency.has(id)) {
      this.adjacency.set(id, new Set());
      this.inDegree.set(id, 0);
    }
  }

  addEdge(from: string, to: string): void {
    this.addNode(from);
    this.addNode(to);

    const neighbors = this.adjacency.get(from)!;
    if (!neighbors.has(to)) {
      neighbors.add(to);
      increment(this.inDegree, to);
    }
  }

  sort(): string[] {
    const result: string[] = [];
    const queue: string[] = [];
    const tempInDegree = new Map(this.inDegree);

    for (const [node, degree] of Array.from(tempInDegree)) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      const neighbors = this.adjacency.get(node)!;
      for (const neighbor of Array.from(neighbors)) {
        const newDegree = (tempInDegree.get(neighbor) ?? 0) - 1;
        tempInDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (result.length !== this.adjacency.size) {
      return [];
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
      for (const neighbor of Array.from(neighbors)) {
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

  nodeCount(): number {
    return this.adjacency.size;
  }

  edgeCount(): number {
    let count = 0;
    for (const neighbors of Array.from(this.adjacency.values())) {
      count += neighbors.size;
    }
    return count;
  }
}
