import type { RingGraphOptions } from "./types.js";

class RingGraph {
  private _adjacency: Map<number, Set<number>>;
  private _edgeCount: number;

  constructor(size: number, chords?: RingGraphOptions["chords"]) {
    this._adjacency = new Map();
    this._edgeCount = 0;

    for (let i = 0; i < size; i++) {
      this._adjacency.set(i, new Set());
    }

    for (let i = 0; i < size; i++) {
      const next = (i + 1) % size;
      if (size > 1) {
        this._adjacency.get(i)!.add(next);
        this._adjacency.get(next)!.add(i);
      }
    }

    if (size > 1) {
      this._edgeCount = size;
    }

    if (chords) {
      for (const [from, to] of chords) {
        this.addEdge(from, to);
      }
    }
  }

  addVertex(): number {
    const newId = this._adjacency.size;
    const allVertices = [...this._adjacency.keys()];

    this._adjacency.set(newId, new Set());

    if (allVertices.length > 0) {
      const sorted = [...allVertices].sort((a, b) => a - b);
      const maxVertex = sorted[sorted.length - 1]!;

      const maxNeighbors = this._adjacency.get(maxVertex)!;
      const maxNeighborArr = [...maxNeighbors].sort((a, b) => a - b);
      let connectTarget: number | undefined;

      for (const n of maxNeighborArr) {
        const nNeighbors = this._adjacency.get(n)!;
        if (nNeighbors.has(maxVertex) && n > maxVertex) {
          connectTarget = n;
          break;
        }
      }

      if (connectTarget === undefined) {
        connectTarget = maxNeighborArr.length > 0 ? maxNeighborArr[0]! : maxVertex;
      }

      if (this._adjacency.get(maxVertex)!.has(connectTarget)) {
        this._adjacency.get(maxVertex)!.delete(connectTarget);
        this._adjacency.get(connectTarget)!.delete(maxVertex);
        this._edgeCount--;
      }

      this._adjacency.get(maxVertex)!.add(newId);
      this._adjacency.get(newId)!.add(maxVertex);
      this._adjacency.get(newId)!.add(connectTarget);
      this._adjacency.get(connectTarget)!.add(newId);
      this._edgeCount += 2;
    }

    return newId;
  }

  removeVertex(v: number): boolean {
    if (!this._adjacency.has(v)) return false;

    const neighbors = this._adjacency.get(v)!;

    for (const neighbor of neighbors) {
      const neighborSet = this._adjacency.get(neighbor);
      if (neighborSet) {
        neighborSet.delete(v);
      }
    }

    this._edgeCount -= neighbors.size;
    this._adjacency.delete(v);
    return true;
  }

  addEdge(from: number, to: number): void {
    this._ensureVertex(from);
    this._ensureVertex(to);

    const fromSet = this._adjacency.get(from)!;
    const toSet = this._adjacency.get(to)!;

    if (!fromSet.has(to)) {
      fromSet.add(to);
      toSet.add(from);
      this._edgeCount++;
    }
  }

  removeEdge(from: number, to: number): void {
    const fromSet = this._adjacency.get(from);
    const toSet = this._adjacency.get(to);
    if (!fromSet || !toSet) return;

    if (fromSet.has(to)) {
      fromSet.delete(to);
      toSet.delete(from);
      this._edgeCount--;
    }
  }

  hasVertex(v: number): boolean {
    return this._adjacency.has(v);
  }

  hasEdge(from: number, to: number): boolean {
    const fromSet = this._adjacency.get(from);
    if (!fromSet) return false;
    return fromSet.has(to);
  }

  get vertices(): number[] {
    return [...this._adjacency.keys()];
  }

  get edges(): [number, number][] {
    const result: [number, number][] = [];
    const seen = new Set<string>();

    for (const [from, neighbors] of this._adjacency) {
      for (const to of neighbors) {
        const key = from < to ? `${from}:${to}` : `${to}:${from}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push([from, to]);
        }
      }
    }

    return result;
  }

  neighbors(v: number): number[] {
    const set = this._adjacency.get(v);
    if (!set) return [];
    return [...set];
  }

  degree(v: number): number {
    const set = this._adjacency.get(v);
    if (!set) return 0;
    return set.size;
  }

  get size(): number {
    return this._adjacency.size;
  }

  get edgeCount(): number {
    return this._edgeCount;
  }

  bfs(start: number, callback: (v: number) => void): void {
    if (!this._adjacency.has(start)) return;

    const visited = new Set<number>();
    const queue: number[] = [start];
    let _qi = 0;
    visited.add(start);

    while (_qi < queue.length) {
      const current = queue[_qi++]!;
      callback(current);

      const nbrs = this._adjacency.get(current);
      if (nbrs) {
        for (const neighbor of nbrs) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
  }

  dfs(start: number, callback: (v: number) => void): void {
    if (!this._adjacency.has(start)) return;

    const visited = new Set<number>();
    const stack: number[] = [start];

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (visited.has(current)) continue;
      visited.add(current);
      callback(current);

      const nbrs = this._adjacency.get(current);
      if (nbrs) {
        const keys = [...nbrs];
        for (let i = keys.length - 1; i >= 0; i--) {
          const key = keys[i]!;
          if (!visited.has(key)) {
            stack.push(key);
          }
        }
      }
    }
  }

  shortestPath(from: number, to: number): number[] {
    if (!this._adjacency.has(from) || !this._adjacency.has(to)) return [];
    if (from === to) return [from];

    const visited = new Set<number>();
    const parent = new Map<number, number>();
    const queue: number[] = [from];
    let _qi = 0;
    visited.add(from);

    while (_qi < queue.length) {
      const current = queue[_qi++]!;

      if (current === to) {
        const path: number[] = [];
        let node: number = to;
        while (node !== from) {
          path.unshift(node);
          node = parent.get(node)!;
        }
        path.unshift(from);
        return path;
      }

      const nbrs = this._adjacency.get(current);
      if (nbrs) {
        for (const neighbor of nbrs) {
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

  get diameter(): number {
    const verts = this.vertices;
    if (verts.length <= 1) return 0;

    let maxDist = 0;
    for (const v of verts) {
      const ecc = this.eccentricity(v);
      if (ecc > maxDist) maxDist = ecc;
    }
    return maxDist;
  }

  eccentricity(v: number): number {
    if (!this._adjacency.has(v)) return -1;
    if (this._adjacency.size <= 1) return 0;

    const dist = new Map<number, number>();
    const queue: number[] = [v];
    let _qi = 0;
    dist.set(v, 0);

    while (_qi < queue.length) {
      const current = queue[_qi++]!;
      const currentDist = dist.get(current)!;

      const nbrs = this._adjacency.get(current);
      if (nbrs) {
        for (const neighbor of nbrs) {
          if (!dist.has(neighbor)) {
            dist.set(neighbor, currentDist + 1);
            queue.push(neighbor);
          }
        }
      }
    }

    let maxDist = 0;
    for (const d of dist.values()) {
      if (d > maxDist) maxDist = d;
    }
    return maxDist;
  }

  get isConnected(): boolean {
    if (this._adjacency.size <= 1) return true;

    const start = this._adjacency.keys().next().value;
    if (start === undefined) return true;

    const visited = new Set<number>();
    this.bfs(start, (v) => visited.add(v));
    return visited.size === this._adjacency.size;
  }

  get hasCycle(): boolean {
    return this._adjacency.size >= 2 && this._edgeCount >= this._adjacency.size;
  }

  get isRegular(): boolean {
    if (this._adjacency.size === 0) return true;

    const first = this._adjacency.values().next().value!;
    const targetDegree = first.size;

    for (const neighbors of this._adjacency.values()) {
      if (neighbors.size !== targetDegree) return false;
    }
    return true;
  }

  clone(): RingGraph {
    const result = new RingGraph(0);

    for (const [v, neighbors] of this._adjacency) {
      result._adjacency.set(v, new Set(neighbors));
    }

    result._edgeCount = this._edgeCount;
    return result;
  }

  toAdjacencyMatrix(): number[][] {
    const verts = this.vertices;
    const n = verts.length;
    const indexMap = new Map<number, number>();
    for (let i = 0; i < n; i++) {
      indexMap.set(verts[i]!, i);
    }

    const matrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = new Array(n).fill(0);
      matrix.push(row);
    }

    for (const [from, neighbors] of this._adjacency) {
      const fromIdx = indexMap.get(from)!;
      for (const to of neighbors) {
        const toIdx = indexMap.get(to)!;
        matrix[fromIdx]![toIdx] = 1;
      }
    }

    return matrix;
  }

  addChord(from: number, to: number): void {
    this.addEdge(from, to);
  }

  private _ensureVertex(v: number): void {
    if (!this._adjacency.has(v)) {
      this._adjacency.set(v, new Set());
    }
  }
}

export { RingGraph };
