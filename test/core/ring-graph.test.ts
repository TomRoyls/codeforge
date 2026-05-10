import { describe, it, expect } from "vitest";
import { RingGraph } from "../../src/core/ring-graph/ring-graph.js";

describe("RingGraph", () => {
  describe("constructor", () => {
    it("creates an empty ring with size 0", () => {
      const g = new RingGraph(0);
      expect(g.size).toBe(0);
      expect(g.edgeCount).toBe(0);
    });

    it("creates a ring with a single vertex", () => {
      const g = new RingGraph(1);
      expect(g.size).toBe(1);
      expect(g.edgeCount).toBe(0);
    });

    it("creates a ring with 2 vertices", () => {
      const g = new RingGraph(2);
      expect(g.size).toBe(2);
      expect(g.edgeCount).toBe(2);
      expect(g.hasEdge(0, 1)).toBe(true);
    });

    it("creates a ring with 3 vertices", () => {
      const g = new RingGraph(3);
      expect(g.size).toBe(3);
      expect(g.hasEdge(0, 1)).toBe(true);
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.hasEdge(2, 0)).toBe(true);
    });

    it("creates a ring with 5 vertices", () => {
      const g = new RingGraph(5);
      expect(g.size).toBe(5);
      expect(g.edgeCount).toBe(5);
    });

    it("creates a ring with 10 vertices", () => {
      const g = new RingGraph(10);
      expect(g.size).toBe(10);
      expect(g.edgeCount).toBe(10);
    });

    it("connects last vertex back to first", () => {
      const g = new RingGraph(4);
      expect(g.hasEdge(3, 0)).toBe(true);
    });

    it("accepts chords in constructor", () => {
      const g = new RingGraph(5, [[0, 2]]);
      expect(g.hasEdge(0, 2)).toBe(true);
      expect(g.hasEdge(0, 1)).toBe(true);
    });

    it("accepts multiple chords", () => {
      const g = new RingGraph(6, [
        [0, 3],
        [1, 4],
      ]);
      expect(g.hasEdge(0, 3)).toBe(true);
      expect(g.hasEdge(1, 4)).toBe(true);
    });
  });

  describe("hasVertex", () => {
    it("returns true for existing vertex", () => {
      const g = new RingGraph(3);
      expect(g.hasVertex(0)).toBe(true);
      expect(g.hasVertex(1)).toBe(true);
      expect(g.hasVertex(2)).toBe(true);
    });

    it("returns false for non-existing vertex", () => {
      const g = new RingGraph(3);
      expect(g.hasVertex(5)).toBe(false);
      expect(g.hasVertex(-1)).toBe(false);
    });
  });

  describe("hasEdge", () => {
    it("returns true for ring edges", () => {
      const g = new RingGraph(4);
      expect(g.hasEdge(0, 1)).toBe(true);
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.hasEdge(2, 3)).toBe(true);
      expect(g.hasEdge(3, 0)).toBe(true);
    });

    it("returns false for non-edges", () => {
      const g = new RingGraph(5);
      expect(g.hasEdge(0, 2)).toBe(false);
      expect(g.hasEdge(1, 3)).toBe(false);
    });

    it("returns false for non-existent vertices", () => {
      const g = new RingGraph(3);
      expect(g.hasEdge(0, 10)).toBe(false);
      expect(g.hasEdge(10, 0)).toBe(false);
    });

    it("edges are bidirectional", () => {
      const g = new RingGraph(4);
      expect(g.hasEdge(0, 1)).toBe(true);
      expect(g.hasEdge(1, 0)).toBe(true);
    });
  });

  describe("vertices", () => {
    it("returns all vertices", () => {
      const g = new RingGraph(4);
      expect(g.vertices).toEqual([0, 1, 2, 3]);
    });

    it("returns empty array for empty graph", () => {
      const g = new RingGraph(0);
      expect(g.vertices).toEqual([]);
    });
  });

  describe("edges", () => {
    it("returns ring edges for size 4", () => {
      const g = new RingGraph(4);
      const edges = g.edges;
      expect(edges.length).toBe(4);
    });

    it("returns empty edges for empty graph", () => {
      const g = new RingGraph(0);
      expect(g.edges).toEqual([]);
    });

    it("returns empty edges for single vertex", () => {
      const g = new RingGraph(1);
      expect(g.edges).toEqual([]);
    });

    it("includes chord edges", () => {
      const g = new RingGraph(5, [[0, 2]]);
      const edges = g.edges;
      expect(edges.length).toBe(6);
    });

    it("does not duplicate bidirectional edges", () => {
      const g = new RingGraph(3);
      expect(g.edges.length).toBe(3);
    });
  });

  describe("neighbors", () => {
    it("returns neighbors of a ring vertex", () => {
      const g = new RingGraph(5);
      const nbrs = g.neighbors(0);
      expect(nbrs).toContain(1);
      expect(nbrs).toContain(4);
      expect(nbrs.length).toBe(2);
    });

    it("returns empty array for non-existent vertex", () => {
      const g = new RingGraph(3);
      expect(g.neighbors(10)).toEqual([]);
    });

    it("includes chord neighbors", () => {
      const g = new RingGraph(5, [[0, 2]]);
      const nbrs = g.neighbors(0);
      expect(nbrs).toContain(1);
      expect(nbrs).toContain(4);
      expect(nbrs).toContain(2);
      expect(nbrs.length).toBe(3);
    });

    it("returns neighbors for middle vertex", () => {
      const g = new RingGraph(5);
      const nbrs = g.neighbors(2);
      expect(nbrs).toContain(1);
      expect(nbrs).toContain(3);
    });
  });

  describe("degree", () => {
    it("returns 2 for ring vertices", () => {
      const g = new RingGraph(5);
      expect(g.degree(0)).toBe(2);
      expect(g.degree(1)).toBe(2);
      expect(g.degree(2)).toBe(2);
    });

    it("returns 0 for non-existent vertex", () => {
      const g = new RingGraph(3);
      expect(g.degree(10)).toBe(0);
    });

    it("returns higher degree with chords", () => {
      const g = new RingGraph(5, [[0, 2]]);
      expect(g.degree(0)).toBe(3);
    });

    it("returns 0 for single vertex ring", () => {
      const g = new RingGraph(1);
      expect(g.degree(0)).toBe(0);
    });
  });

  describe("size", () => {
    it("returns correct size", () => {
      const g = new RingGraph(7);
      expect(g.size).toBe(7);
    });
  });

  describe("edgeCount", () => {
    it("returns correct edge count for pure ring", () => {
      const g = new RingGraph(6);
      expect(g.edgeCount).toBe(6);
    });

    it("returns correct edge count with chords", () => {
      const g = new RingGraph(5, [
        [0, 2],
        [1, 3],
      ]);
      expect(g.edgeCount).toBe(7);
    });
  });

  describe("addVertex", () => {
    it("adds a vertex to empty graph", () => {
      const g = new RingGraph(0);
      const id = g.addVertex();
      expect(id).toBe(0);
      expect(g.size).toBe(1);
    });

    it("adds a vertex and returns its id", () => {
      const g = new RingGraph(3);
      const id = g.addVertex();
      expect(id).toBe(3);
      expect(g.size).toBe(4);
    });

    it("grows the ring maintaining connectivity", () => {
      const g = new RingGraph(3);
      g.addVertex();
      expect(g.size).toBe(4);
      expect(g.isConnected).toBe(true);
    });

    it("increases edge count", () => {
      const g = new RingGraph(3);
      const before = g.edgeCount;
      g.addVertex();
      expect(g.edgeCount).toBe(before + 1);
    });

    it("new vertex has degree 2", () => {
      const g = new RingGraph(3);
      const id = g.addVertex();
      expect(g.degree(id)).toBe(2);
    });
  });

  describe("removeVertex", () => {
    it("removes an existing vertex", () => {
      const g = new RingGraph(4);
      const result = g.removeVertex(2);
      expect(result).toBe(true);
      expect(g.hasVertex(2)).toBe(false);
    });

    it("returns false for non-existent vertex", () => {
      const g = new RingGraph(3);
      const result = g.removeVertex(10);
      expect(result).toBe(false);
    });

    it("decreases size", () => {
      const g = new RingGraph(5);
      g.removeVertex(0);
      expect(g.size).toBe(4);
    });

    it("decreases edge count", () => {
      const g = new RingGraph(4);
      g.removeVertex(0);
      expect(g.edgeCount).toBe(2);
    });

    it("removes all edges to the vertex", () => {
      const g = new RingGraph(4);
      g.removeVertex(1);
      expect(g.hasEdge(0, 1)).toBe(false);
      expect(g.hasEdge(1, 2)).toBe(false);
    });
  });

  describe("addEdge", () => {
    it("adds a chord edge", () => {
      const g = new RingGraph(5);
      g.addEdge(0, 3);
      expect(g.hasEdge(0, 3)).toBe(true);
    });

    it("increases edge count for new edge", () => {
      const g = new RingGraph(5);
      const before = g.edgeCount;
      g.addEdge(0, 2);
      expect(g.edgeCount).toBe(before + 1);
    });

    it("does not increase count for existing edge", () => {
      const g = new RingGraph(5);
      const before = g.edgeCount;
      g.addEdge(0, 1);
      expect(g.edgeCount).toBe(before);
    });

    it("creates vertices if they do not exist", () => {
      const g = new RingGraph(3);
      g.addEdge(0, 10);
      expect(g.hasVertex(10)).toBe(true);
    });

    it("edge is bidirectional", () => {
      const g = new RingGraph(5);
      g.addEdge(1, 3);
      expect(g.hasEdge(1, 3)).toBe(true);
      expect(g.hasEdge(3, 1)).toBe(true);
    });
  });

  describe("removeEdge", () => {
    it("removes an existing edge", () => {
      const g = new RingGraph(5);
      g.removeEdge(0, 1);
      expect(g.hasEdge(0, 1)).toBe(false);
    });

    it("decreases edge count", () => {
      const g = new RingGraph(5);
      g.removeEdge(0, 1);
      expect(g.edgeCount).toBe(4);
    });

    it("removes bidirectional edge", () => {
      const g = new RingGraph(5);
      g.removeEdge(0, 1);
      expect(g.hasEdge(1, 0)).toBe(false);
    });

    it("no-op for non-existent edge", () => {
      const g = new RingGraph(5);
      const before = g.edgeCount;
      g.removeEdge(0, 3);
      expect(g.edgeCount).toBe(before);
    });

    it("no-op for non-existent vertices", () => {
      const g = new RingGraph(3);
      const before = g.edgeCount;
      g.removeEdge(10, 20);
      expect(g.edgeCount).toBe(before);
    });
  });

  describe("bfs", () => {
    it("visits all vertices in a connected ring", () => {
      const g = new RingGraph(5);
      const visited: number[] = [];
      g.bfs(0, (v) => visited.push(v));
      expect(visited.length).toBe(5);
    });

    it("starts from the specified vertex", () => {
      const g = new RingGraph(5);
      const visited: number[] = [];
      g.bfs(2, (v) => visited.push(v));
      expect(visited[0]).toBe(2);
    });

    it("does not visit disconnected vertices", () => {
      const g = new RingGraph(4);
      g.removeEdge(1, 2);
      g.removeEdge(0, 3);
      const visited: number[] = [];
      g.bfs(0, (v) => visited.push(v));
      expect(visited).toContain(0);
      expect(visited).toContain(1);
      expect(visited).not.toContain(2);
    });

    it("does nothing for non-existent start", () => {
      const g = new RingGraph(3);
      const visited: number[] = [];
      g.bfs(10, (v) => visited.push(v));
      expect(visited.length).toBe(0);
    });

    it("visits vertices level by level", () => {
      const g = new RingGraph(5);
      const visited: number[] = [];
      g.bfs(0, (v) => visited.push(v));
      expect(visited[0]).toBe(0);
    });
  });

  describe("dfs", () => {
    it("visits all vertices in a connected ring", () => {
      const g = new RingGraph(5);
      const visited: number[] = [];
      g.dfs(0, (v) => visited.push(v));
      expect(visited.length).toBe(5);
    });

    it("starts from the specified vertex", () => {
      const g = new RingGraph(5);
      const visited: number[] = [];
      g.dfs(3, (v) => visited.push(v));
      expect(visited[0]).toBe(3);
    });

    it("does nothing for non-existent start", () => {
      const g = new RingGraph(3);
      const visited: number[] = [];
      g.dfs(10, (v) => visited.push(v));
      expect(visited.length).toBe(0);
    });

    it("does not visit disconnected vertices", () => {
      const g = new RingGraph(4);
      g.removeEdge(0, 1);
      g.removeEdge(0, 3);
      const visited: number[] = [];
      g.dfs(0, (v) => visited.push(v));
      expect(visited).toEqual([0]);
    });
  });

  describe("shortestPath", () => {
    it("returns path to itself", () => {
      const g = new RingGraph(5);
      expect(g.shortestPath(0, 0)).toEqual([0]);
    });

    it("finds adjacent path", () => {
      const g = new RingGraph(5);
      const path = g.shortestPath(0, 1);
      expect(path).toEqual([0, 1]);
    });

    it("finds path around ring", () => {
      const g = new RingGraph(6);
      const path = g.shortestPath(0, 3);
      expect(path.length).toBe(4);
      expect(path[0]).toBe(0);
      expect(path[path.length - 1]).toBe(3);
    });

    it("returns empty for disconnected vertices", () => {
      const g = new RingGraph(4);
      g.removeEdge(1, 2);
      g.removeEdge(0, 3);
      expect(g.shortestPath(0, 2)).toEqual([]);
    });

    it("returns empty for non-existent vertices", () => {
      const g = new RingGraph(3);
      expect(g.shortestPath(0, 10)).toEqual([]);
      expect(g.shortestPath(10, 0)).toEqual([]);
    });

    it("uses chord for shorter path", () => {
      const g = new RingGraph(6, [[0, 3]]);
      const path = g.shortestPath(0, 3);
      expect(path).toEqual([0, 3]);
    });

    it("finds shortest of two ring directions", () => {
      const g = new RingGraph(5);
      const path = g.shortestPath(0, 2);
      expect(path.length).toBe(3);
    });
  });

  describe("diameter", () => {
    it("returns 0 for empty graph", () => {
      const g = new RingGraph(0);
      expect(g.diameter).toBe(0);
    });

    it("returns 0 for single vertex", () => {
      const g = new RingGraph(1);
      expect(g.diameter).toBe(0);
    });

    it("returns 1 for two vertices", () => {
      const g = new RingGraph(2);
      expect(g.diameter).toBe(1);
    });

    it("returns correct diameter for ring of 5", () => {
      const g = new RingGraph(5);
      expect(g.diameter).toBe(2);
    });

    it("returns correct diameter for ring of 6", () => {
      const g = new RingGraph(6);
      expect(g.diameter).toBe(3);
    });

    it("reduces diameter with chords", () => {
      const g = new RingGraph(6);
      const d1 = g.diameter;
      const g2 = new RingGraph(6, [[0, 3]]);
      const d2 = g2.diameter;
      expect(d2).toBeLessThanOrEqual(d1);
    });
  });

  describe("eccentricity", () => {
    it("returns -1 for non-existent vertex", () => {
      const g = new RingGraph(3);
      expect(g.eccentricity(10)).toBe(-1);
    });

    it("returns 0 for single vertex", () => {
      const g = new RingGraph(1);
      expect(g.eccentricity(0)).toBe(0);
    });

    it("returns correct eccentricity for ring vertex", () => {
      const g = new RingGraph(5);
      expect(g.eccentricity(0)).toBe(2);
    });

    it("returns same eccentricity for all vertices in regular ring", () => {
      const g = new RingGraph(6);
      const e0 = g.eccentricity(0);
      const e1 = g.eccentricity(1);
      const e2 = g.eccentricity(2);
      expect(e0).toBe(e1);
      expect(e1).toBe(e2);
    });
  });

  describe("isConnected", () => {
    it("returns true for complete ring", () => {
      const g = new RingGraph(5);
      expect(g.isConnected).toBe(true);
    });

    it("returns true for empty graph", () => {
      const g = new RingGraph(0);
      expect(g.isConnected).toBe(true);
    });

    it("returns true for single vertex", () => {
      const g = new RingGraph(1);
      expect(g.isConnected).toBe(true);
    });

    it("returns true for two vertices", () => {
      const g = new RingGraph(2);
      expect(g.isConnected).toBe(true);
    });

    it("returns false after disconnecting ring", () => {
      const g = new RingGraph(4);
      g.removeEdge(1, 2);
      g.removeEdge(0, 3);
      expect(g.isConnected).toBe(false);
    });

    it("remains connected after removing vertex from triangle", () => {
      const g = new RingGraph(3);
      g.removeVertex(1);
      expect(g.isConnected).toBe(true);
    });

    it("returns true with chords that maintain connectivity", () => {
      const g = new RingGraph(4, [[0, 2]]);
      expect(g.isConnected).toBe(true);
    });
  });

  describe("hasCycle", () => {
    it("returns true for ring of 3", () => {
      const g = new RingGraph(3);
      expect(g.hasCycle).toBe(true);
    });

    it("returns true for ring of 5", () => {
      const g = new RingGraph(5);
      expect(g.hasCycle).toBe(true);
    });

    it("returns false for empty graph", () => {
      const g = new RingGraph(0);
      expect(g.hasCycle).toBe(false);
    });

    it("returns false for single vertex", () => {
      const g = new RingGraph(1);
      expect(g.hasCycle).toBe(false);
    });

    it("returns true after adding chords", () => {
      const g = new RingGraph(5, [[0, 2]]);
      expect(g.hasCycle).toBe(true);
    });
  });

  describe("isRegular", () => {
    it("returns true for pure ring (all degree 2)", () => {
      const g = new RingGraph(5);
      expect(g.isRegular).toBe(true);
    });

    it("returns true for empty graph", () => {
      const g = new RingGraph(0);
      expect(g.isRegular).toBe(true);
    });

    it("returns true for single vertex", () => {
      const g = new RingGraph(1);
      expect(g.isRegular).toBe(true);
    });

    it("returns false after adding chord", () => {
      const g = new RingGraph(5, [[0, 2]]);
      expect(g.isRegular).toBe(false);
    });

    it("returns false after removing vertex", () => {
      const g = new RingGraph(4);
      g.removeVertex(1);
      expect(g.isRegular).toBe(false);
    });

    it("returns true for ring of 2", () => {
      const g = new RingGraph(2);
      expect(g.isRegular).toBe(true);
    });
  });

  describe("clone", () => {
    it("creates an independent copy", () => {
      const g = new RingGraph(4);
      const c = g.clone();
      expect(c.size).toBe(g.size);
      expect(c.edgeCount).toBe(g.edgeCount);
    });

    it("modifications to clone do not affect original", () => {
      const g = new RingGraph(4);
      const c = g.clone();
      c.addEdge(0, 2);
      expect(g.hasEdge(0, 2)).toBe(false);
      expect(c.hasEdge(0, 2)).toBe(true);
    });

    it("modifications to original do not affect clone", () => {
      const g = new RingGraph(4);
      const c = g.clone();
      g.removeVertex(0);
      expect(c.hasVertex(0)).toBe(true);
    });

    it("preserves chords", () => {
      const g = new RingGraph(5, [[0, 2]]);
      const c = g.clone();
      expect(c.hasEdge(0, 2)).toBe(true);
    });

    it("clone has same edges", () => {
      const g = new RingGraph(4);
      const c = g.clone();
      expect(c.edges.length).toBe(g.edges.length);
    });
  });

  describe("toAdjacencyMatrix", () => {
    it("returns empty matrix for empty graph", () => {
      const g = new RingGraph(0);
      expect(g.toAdjacencyMatrix()).toEqual([]);
    });

    it("returns matrix for single vertex", () => {
      const g = new RingGraph(1);
      expect(g.toAdjacencyMatrix()).toEqual([[0]]);
    });

    it("returns correct matrix for ring of 3", () => {
      const g = new RingGraph(3);
      const m = g.toAdjacencyMatrix();
      expect(m.length).toBe(3);
      expect(m[0]![1]).toBe(1);
      expect(m[0]![2]).toBe(1);
      expect(m[1]![0]).toBe(1);
      expect(m[1]![2]).toBe(1);
    });

    it("diagonal is 0", () => {
      const g = new RingGraph(4);
      const m = g.toAdjacencyMatrix();
      expect(m[0]![0]).toBe(0);
      expect(m[1]![1]).toBe(0);
      expect(m[2]![2]).toBe(0);
      expect(m[3]![3]).toBe(0);
    });

    it("matrix is symmetric", () => {
      const g = new RingGraph(4);
      const m = g.toAdjacencyMatrix();
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          expect(m[i]![j]).toBe(m[j]![i]);
        }
      }
    });

    it("includes chords in matrix", () => {
      const g = new RingGraph(4, [[0, 2]]);
      const m = g.toAdjacencyMatrix();
      expect(m[0]![2]).toBe(1);
      expect(m[2]![0]).toBe(1);
    });
  });

  describe("addChord", () => {
    it("adds a chord to the ring", () => {
      const g = new RingGraph(6);
      g.addChord(0, 3);
      expect(g.hasEdge(0, 3)).toBe(true);
    });

    it("increases edge count", () => {
      const g = new RingGraph(6);
      const before = g.edgeCount;
      g.addChord(1, 4);
      expect(g.edgeCount).toBe(before + 1);
    });

    it("chord is bidirectional", () => {
      const g = new RingGraph(6);
      g.addChord(0, 3);
      expect(g.hasEdge(3, 0)).toBe(true);
    });

    it("updates degree of endpoints", () => {
      const g = new RingGraph(6);
      g.addChord(0, 3);
      expect(g.degree(0)).toBe(3);
      expect(g.degree(3)).toBe(3);
    });

    it("idempotent for existing edge", () => {
      const g = new RingGraph(5);
      g.addChord(0, 1);
      const before = g.edgeCount;
      g.addChord(0, 1);
      expect(g.edgeCount).toBe(before);
    });
  });

  describe("integration scenarios", () => {
    it("supports adding and removing vertices sequentially", () => {
      const g = new RingGraph(3);
      g.addVertex();
      expect(g.size).toBe(4);
      g.removeVertex(2);
      expect(g.size).toBe(3);
    });

    it("supports complex chord network", () => {
      const g = new RingGraph(8, [
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ]);
      expect(g.edgeCount).toBe(12);
      expect(g.isConnected).toBe(true);
    });

    it("bfs and dfs visit same vertices", () => {
      const g = new RingGraph(5, [[0, 3]]);
      const bfsVisited: number[] = [];
      const dfsVisited: number[] = [];
      g.bfs(0, (v) => bfsVisited.push(v));
      g.dfs(0, (v) => dfsVisited.push(v));
      expect(bfsVisited.sort()).toEqual(dfsVisited.sort());
    });

    it("clone preserves full structure", () => {
      const g = new RingGraph(5, [[0, 2], [1, 4]]);
      const c = g.clone();
      expect(c.size).toBe(g.size);
      expect(c.edgeCount).toBe(g.edgeCount);
      expect(c.hasEdge(0, 2)).toBe(true);
      expect(c.hasEdge(1, 4)).toBe(true);
    });

    it("shortest path with many chords", () => {
      const g = new RingGraph(10, [
        [0, 5],
        [1, 6],
        [2, 7],
      ]);
      const path = g.shortestPath(0, 7);
      expect(path.length).toBeLessThanOrEqual(4);
    });

    it("handles remove vertex then add vertex", () => {
      const g = new RingGraph(4);
      g.removeVertex(1);
      expect(g.size).toBe(3);
      const id = g.addVertex();
      expect(g.hasVertex(id)).toBe(true);
    });

    it("matrix matches edges for chorded ring", () => {
      const g = new RingGraph(4, [[0, 2]]);
      const m = g.toAdjacencyMatrix();
      let edgeSum = 0;
      for (const row of m) {
        for (const val of row) {
          edgeSum += val;
        }
      }
      expect(edgeSum).toBe(g.edgeCount * 2);
    });

    it("diameter equals max eccentricity", () => {
      const g = new RingGraph(7);
      let maxEcc = 0;
      for (const v of g.vertices) {
        maxEcc = Math.max(maxEcc, g.eccentricity(v));
      }
      expect(g.diameter).toBe(maxEcc);
    });

    it("can create small world network", () => {
      const g = new RingGraph(10, [
        [0, 4],
        [1, 7],
        [3, 8],
        [2, 6],
      ]);
      expect(g.size).toBe(10);
      expect(g.isConnected).toBe(true);
      expect(g.diameter).toBeLessThan(new RingGraph(10).diameter);
    });
  });
});
