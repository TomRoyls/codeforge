import { increment } from '../../utils/map-helpers.js'

export class GraphTopoSort {
  private adjacencyList: Map<number, Set<number>>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(id: number): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Set());
    }
  }

  addEdge(from: number, to: number): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacencyList.get(from)!.add(to);
  }

  removeVertex(id: number): void {
    this.adjacencyList.delete(id);
    const edgesArray = Array.from(this.adjacencyList.values());
    for (const edges of edgesArray) {
      edges.delete(id);
    }
  }

  removeEdge(from: number, to: number): void {
    const edges = this.adjacencyList.get(from);
    if (edges) {
      edges.delete(to);
    }
  }

  hasVertex(id: number): boolean {
    return this.adjacencyList.has(id);
  }

  hasEdge(from: number, to: number): boolean {
    const edges = this.adjacencyList.get(from);
    return edges ? edges.has(to) : false;
  }

  vertices(): number[] {
    return Array.from(this.adjacencyList.keys());
  }

  edges(): [number, number][] {
    const result: [number, number][] = [];
    const entriesArray = Array.from(this.adjacencyList.entries());
    for (const [from, edges] of entriesArray) {
      const edgesList = Array.from(edges);
      for (const to of edgesList) {
        result.push([from, to]);
      }
    }
    return result;
  }

  get vertexCount(): number {
    return this.adjacencyList.size;
  }

  get edgeCount(): number {
    let count = 0;
    const valuesArray = Array.from(this.adjacencyList.values());
    for (const edges of valuesArray) {
      count += edges.size;
    }
    return count;
  }

  getInDegree(id: number): number {
    let count = 0;
    const valuesArray = Array.from(this.adjacencyList.values());
    for (const edges of valuesArray) {
      if (edges.has(id)) {
        count++;
      }
    }
    return count;
  }

  getOutDegree(id: number): number {
    return this.adjacencyList.get(id)?.size ?? 0;
  }

  getSourceVertices(): number[] {
    return this.vertices().filter(v => this.getInDegree(v) === 0);
  }

  getSinkVertices(): number[] {
    return this.vertices().filter(v => this.getOutDegree(v) === 0);
  }

  topologicalSort(): number[] | null {
    const visited = new Set<number>();
    const recursionStack = new Set<number>();
    const result: number[] = [];

    const dfs = (vertex: number): boolean => {
      visited.add(vertex);
      recursionStack.add(vertex);

      const neighbors = this.adjacencyList.get(vertex) ?? new Set();
      const neighborsArray = Array.from(neighbors);
      for (const neighbor of neighborsArray) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(vertex);
      result.unshift(vertex);
      return false;
    };

    const verticesArray = this.vertices();
    for (const vertex of verticesArray) {
      if (!visited.has(vertex)) {
        if (dfs(vertex)) {
          return null;
        }
      }
    }

    return result;
  }

  topologicalSortKahn(): number[] | null {
    const inDegree = new Map<number, number>();
    for (const vertex of this.vertices()) {
      inDegree.set(vertex, 0);
    }
    const valuesArray = Array.from(this.adjacencyList.values());
    for (const edges of valuesArray) {
      const edgesList = Array.from(edges);
      for (const to of edgesList) {
        increment(inDegree, to);
      }
    }

    const queue: number[] = [];
    for (const [vertex, degree] of inDegree) {
      if (degree === 0) {
        queue.push(vertex);
      }
    }

    const result: number[] = [];
    let _qi = 0;
    while (_qi < queue.length) {
      queue.sort((a, b) => a - b);
      const vertex = queue[_qi++]!;
      result.push(vertex);

      const neighbors = this.adjacencyList.get(vertex) ?? new Set();
      const neighborsArray = Array.from(neighbors);
      for (const neighbor of neighborsArray) {
        const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (result.length !== this.vertexCount) {
      return null;
    }

    return result;
  }

  isDAG(): boolean {
    return this.topologicalSort() !== null;
  }

  hasCycle(): boolean {
    return !this.isDAG();
  }
  *[Symbol.iterator]() {
    yield* this.edges()
  }

  toArray() {
    return this.edges()
  }
}
