import type { SparseGraphOptions } from "./types.js";

type Vertex = string | number;

class SparseGraph<V extends Vertex = Vertex> {
  private _adjacency: Map<V, Map<V, number | undefined>>;
  private _directed: boolean;
  private _weighted: boolean;
  private _edgeCount: number;

  constructor(options: SparseGraphOptions = {}) {
    this._adjacency = new Map();
    this._directed = options.directed ?? false;
    this._weighted = options.weighted ?? false;
    this._edgeCount = 0;
  }

  addVertex(v: V): void {
    if (!this._adjacency.has(v)) {
      this._adjacency.set(v, new Map());
    }
  }

  removeVertex(v: V): void {
    const neighbors = this._adjacency.get(v);
    if (!neighbors) return;

    if (this._directed) {
      this._edgeCount -= neighbors.size;
      for (const [src, map] of this._adjacency) {
        if (src === v) continue;
        if (map.delete(v)) {
          this._edgeCount--;
        }
      }
    } else {
      for (const neighbor of neighbors.keys()) {
        const neighborMap = this._adjacency.get(neighbor);
        if (neighborMap) {
          neighborMap.delete(v);
        }
      }
      this._edgeCount -= neighbors.size;
    }

    this._adjacency.delete(v);
  }

  addEdge(from: V, to: V, weight?: number): void {
    this.addVertex(from);
    this.addVertex(to);

    const fromMap = this._adjacency.get(from)!;
    const isNew = !fromMap.has(to);

    const w = this._weighted || weight !== undefined ? weight : undefined;
    fromMap.set(to, w);

    if (!this._directed) {
      const toMap = this._adjacency.get(to)!;
      toMap.set(from, w);
    }

    if (isNew) {
      this._edgeCount++;
    }
  }

  removeEdge(from: V, to: V): void {
    const fromMap = this._adjacency.get(from);
    if (!fromMap) return;

    const existed = fromMap.delete(to);

    if (!this._directed) {
      const toMap = this._adjacency.get(to);
      if (toMap) {
        toMap.delete(from);
      }
    }

    if (existed) {
      this._edgeCount--;
    }
  }

  hasVertex(v: V): boolean {
    return this._adjacency.has(v);
  }

  hasEdge(from: V, to: V): boolean {
    const fromMap = this._adjacency.get(from);
    if (!fromMap) return false;
    return fromMap.has(to);
  }

  getEdge(from: V, to: V): number | undefined {
    const fromMap = this._adjacency.get(from);
    if (!fromMap) return undefined;
    return fromMap.get(to);
  }

  get vertices(): V[] {
    return [...this._adjacency.keys()];
  }

  get edges(): [V, V, number | undefined][] {
    const result: [V, V, number | undefined][] = [];
    const seen = this._directed ? null : new Set<string>();

    for (const [from, neighbors] of this._adjacency) {
      for (const [to, weight] of neighbors) {
        if (this._directed) {
          result.push([from, to, weight]);
        } else {
          const key = from < to ? `${from}:${to}` : `${to}:${from}`;
          if (!seen!.has(key)) {
            seen!.add(key);
            result.push([from, to, weight]);
          }
        }
      }
    }

    return result;
  }

  neighbors(v: V): V[] {
    const map = this._adjacency.get(v);
    if (!map) return [];
    return [...map.keys()];
  }

  degree(v: V): number {
    const map = this._adjacency.get(v);
    if (!map) return 0;
    return map.size;
  }

  inDegree(v: V): number {
    if (!this._directed) return this.degree(v);

    let count = 0;
    for (const [, neighbors] of this._adjacency) {
      if (neighbors.has(v)) count++;
    }
    return count;
  }

  outDegree(v: V): number {
    if (!this._directed) return this.degree(v);
    return this.degree(v);
  }

  get size(): number {
    return this._adjacency.size;
  }

  get edgeCount(): number {
    return this._edgeCount;
  }

  get isEmpty(): boolean {
    return this._adjacency.size === 0;
  }

  get isDirected(): boolean {
    return this._directed;
  }

  get isWeighted(): boolean {
    return this._weighted;
  }

  clear(): void {
    this._adjacency.clear();
    this._edgeCount = 0;
  }

  bfs(start: V, callback: (v: V) => void): void {
    if (!this._adjacency.has(start)) return;

    const visited = new Set<V>();
    const queue: V[] = [start];
    let _qi = 0;
    visited.add(start);

    while (_qi < queue.length) {
      const current = queue[_qi++]!;
      callback(current);

      const neighbors = this._adjacency.get(current);
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

  dfs(start: V, callback: (v: V) => void): void {
    if (!this._adjacency.has(start)) return;

    const visited = new Set<V>();
    const stack: V[] = [start];

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (visited.has(current)) continue;
      visited.add(current);
      callback(current);

      const neighbors = this._adjacency.get(current);
      if (neighbors) {
        const keys = [...neighbors.keys()];
        for (let i = keys.length - 1; i >= 0; i--) {
          const key = keys[i]!;
          if (!visited.has(key)) {
            stack.push(key);
          }
        }
      }
    }
  }

  shortestPath(from: V, to: V): V[] {
    if (!this._adjacency.has(from) || !this._adjacency.has(to)) return [];
    if (from === to) return [from];

    if (this._weighted) {
      return this._dijkstra(from, to);
    }
    return this._bfsPath(from, to);
  }

  private _bfsPath(from: V, to: V): V[] {
    const visited = new Set<V>();
    const parent = new Map<V, V>();
    const queue: V[] = [from];
    let _qi = 0;
    visited.add(from);

    while (_qi < queue.length) {
      const current = queue[_qi++]!;

      if (current === to) {
        const path: V[] = [];
        let node: V = to;
        while (node !== from) {
          path.unshift(node);
          node = parent.get(node)!;
        }
        path.unshift(from);
        return path;
      }

      const neighbors = this._adjacency.get(current);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            parent.set(neighbor, current);
            queue.push(neighbor);
          }
        }
      }
    }

    return [];
  }

  private _dijkstra(from: V, to: V): V[] {
    const dist = new Map<V, number>();
    const parent = new Map<V, V>();
    const visited = new Set<V>();

    for (const v of this._adjacency.keys()) {
      dist.set(v, Infinity);
    }
    dist.set(from, 0);

    while (true) {
      let minDist = Infinity;
      let current: V | undefined;

      for (const [v, d] of dist) {
        if (!visited.has(v) && d < minDist) {
          minDist = d;
          current = v;
        }
      }

      if (current === undefined || current === to) break;
      visited.add(current);

      const neighbors = this._adjacency.get(current);
      if (neighbors) {
        for (const [neighbor, w] of neighbors) {
          if (visited.has(neighbor)) continue;
          const weight = w ?? 1;
          const alt = dist.get(current)! + weight;
          if (alt < dist.get(neighbor)!) {
            dist.set(neighbor, alt);
            parent.set(neighbor, current);
          }
        }
      }
    }

    if (!parent.has(to) && from !== to) return [];

    const path: V[] = [];
    let node: V = to;
    while (node !== from) {
      path.unshift(node);
      const p = parent.get(node);
      if (p === undefined) return [];
      node = p;
    }
    path.unshift(from);
    return path;
  }

  get isConnected(): boolean {
    if (this._adjacency.size === 0) return true;
    if (this._directed) return this._isStronglyConnected();

    const start = this._adjacency.keys().next().value!;
    const visited = new Set<V>();
    this.bfs(start, (v) => visited.add(v));
    return visited.size === this._adjacency.size;
  }

  private _isStronglyConnected(): boolean {
    const vertices = this.vertices;
    if (vertices.length === 0) return true;

    const start = vertices[0]!;
    const visited = new Set<V>();
    this.bfs(start, (v) => visited.add(v));
    if (visited.size !== vertices.length) return false;

    const transposed = this.transpose();
    const visited2 = new Set<V>();
    transposed.bfs(start, (v) => visited2.add(v));
    return visited2.size === vertices.length;
  }

  get hasCycle(): boolean {
    if (this._directed) return this._hasDirectedCycle();

    const visited = new Set<V>();

    const hasCycleDFS = (v: V, parent: V | undefined): boolean => {
      visited.add(v);
      const neighbors = this._adjacency.get(v);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            if (hasCycleDFS(neighbor, v)) return true;
          } else if (neighbor !== parent) {
            return true;
          }
        }
      }
      return false;
    };

    for (const v of this._adjacency.keys()) {
      if (!visited.has(v)) {
        if (hasCycleDFS(v, undefined)) return true;
      }
    }

    return false;
  }

  private _hasDirectedCycle(): boolean {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map<V, number>();
    for (const v of this._adjacency.keys()) {
      color.set(v, WHITE);
    }

    const dfs = (v: V): boolean => {
      color.set(v, GRAY);
      const neighbors = this._adjacency.get(v);
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          const c = color.get(neighbor)!;
          if (c === GRAY) return true;
          if (c === WHITE && dfs(neighbor)) return true;
        }
      }
      color.set(v, BLACK);
      return false;
    };

    for (const v of this._adjacency.keys()) {
      if (color.get(v) === WHITE) {
        if (dfs(v)) return true;
      }
    }

    return false;
  }

  transpose(): SparseGraph<V> {
    const result = new SparseGraph<V>({ directed: this._directed, weighted: this._weighted });

    for (const v of this._adjacency.keys()) {
      result.addVertex(v);
    }

    for (const [from, neighbors] of this._adjacency) {
      for (const [to, weight] of neighbors) {
        result.addEdge(to, from, weight);
      }
    }

    return result;
  }

  clone(): SparseGraph<V> {
    const result = new SparseGraph<V>({ directed: this._directed, weighted: this._weighted });

    for (const v of this._adjacency.keys()) {
      result.addVertex(v);
    }

    for (const [from, neighbors] of this._adjacency) {
      for (const [to, weight] of neighbors) {
        const fromMap = result._adjacency.get(from)!;
        fromMap.set(to, weight);
      }
    }

    result._edgeCount = this._edgeCount;
    return result;
  }

  subgraph(vertices: V[]): SparseGraph<V> {
    const vertexSet = new Set(vertices);
    const result = new SparseGraph<V>({ directed: this._directed, weighted: this._weighted });

    for (const v of vertexSet) {
      if (this._adjacency.has(v)) {
        result.addVertex(v);
      }
    }

    for (const [from, neighbors] of this._adjacency) {
      if (!vertexSet.has(from)) continue;
      for (const [to, weight] of neighbors) {
        if (vertexSet.has(to)) {
          result.addEdge(from, to, weight);
        }
      }
    }

    return result;
  }
}

export { SparseGraph };
