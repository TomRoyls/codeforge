import { describe, it, expect } from "vitest";
import { SparseGraph } from "../../src/core/sparse-graph/sparse-graph.js";

describe("SparseGraph", () => {
  describe("constructor", () => {
    it("creates an undirected unweighted graph by default", () => {
      const g = new SparseGraph();
      expect(g.isDirected).toBe(false);
      expect(g.isWeighted).toBe(false);
    });

    it("creates a directed graph when directed option is true", () => {
      const g = new SparseGraph({ directed: true });
      expect(g.isDirected).toBe(true);
      expect(g.isWeighted).toBe(false);
    });

    it("creates a weighted graph when weighted option is true", () => {
      const g = new SparseGraph({ weighted: true });
      expect(g.isDirected).toBe(false);
      expect(g.isWeighted).toBe(true);
    });

    it("creates a directed weighted graph with both options", () => {
      const g = new SparseGraph({ directed: true, weighted: true });
      expect(g.isDirected).toBe(true);
      expect(g.isWeighted).toBe(true);
    });
  });

  describe("addVertex", () => {
    it("adds a vertex to the graph", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.hasVertex("a")).toBe(true);
    });

    it("does not duplicate vertices", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("a");
      expect(g.size).toBe(1);
    });

    it("adds numeric vertices", () => {
      const g = new SparseGraph();
      g.addVertex(1);
      g.addVertex(2);
      expect(g.size).toBe(2);
    });

    it("adds mixed type vertices", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex(1);
      expect(g.size).toBe(2);
    });
  });

  describe("removeVertex", () => {
    it("removes a vertex from the graph", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.removeVertex("a");
      expect(g.hasVertex("a")).toBe(false);
    });

    it("removes all edges connected to the vertex (undirected)", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      g.removeVertex("a");
      expect(g.hasEdge("a", "b")).toBe(false);
      expect(g.hasEdge("b", "a")).toBe(false);
      expect(g.hasEdge("a", "c")).toBe(false);
      expect(g.hasEdge("c", "a")).toBe(false);
      expect(g.edgeCount).toBe(0);
    });

    it("removes incoming edges in directed graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("c", "b");
      g.removeVertex("b");
      expect(g.hasEdge("a", "b")).toBe(false);
      expect(g.hasEdge("c", "b")).toBe(false);
      expect(g.edgeCount).toBe(0);
    });

    it("does nothing when removing a non-existent vertex", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.removeVertex("z");
      expect(g.size).toBe(1);
    });
  });

  describe("addEdge", () => {
    it("adds an edge between two existing vertices", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("b");
      g.addEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(true);
      expect(g.hasEdge("b", "a")).toBe(true);
    });

    it("auto-creates vertices when adding an edge", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      expect(g.hasVertex("a")).toBe(true);
      expect(g.hasVertex("b")).toBe(true);
    });

    it("increments edge count", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      expect(g.edgeCount).toBe(1);
    });

    it("does not double count undirected edges", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "b");
      expect(g.edgeCount).toBe(1);
    });

    it("adds directed edge only one way", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(true);
      expect(g.hasEdge("b", "a")).toBe(false);
    });

    it("stores weight for weighted graphs", () => {
      const g = new SparseGraph({ weighted: true });
      g.addEdge("a", "b", 5);
      expect(g.getEdge("a", "b")).toBe(5);
    });

    it("allows parallel edges in directed graphs to be overwritten", () => {
      const g = new SparseGraph({ directed: true, weighted: true });
      g.addEdge("a", "b", 3);
      g.addEdge("a", "b", 7);
      expect(g.getEdge("a", "b")).toBe(7);
      expect(g.edgeCount).toBe(1);
    });

    it("stores undefined weight for unweighted graphs", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      expect(g.getEdge("a", "b")).toBeUndefined();
    });

    it("handles self-loops", () => {
      const g = new SparseGraph();
      g.addEdge("a", "a");
      expect(g.hasEdge("a", "a")).toBe(true);
      expect(g.edgeCount).toBe(1);
    });

    it("handles directed self-loops", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "a");
      expect(g.hasEdge("a", "a")).toBe(true);
      expect(g.degree("a")).toBe(1);
    });
  });

  describe("removeEdge", () => {
    it("removes an edge between two vertices", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.removeEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(false);
      expect(g.hasEdge("b", "a")).toBe(false);
    });

    it("decrements edge count", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.removeEdge("a", "b");
      expect(g.edgeCount).toBe(0);
    });

    it("does nothing when removing non-existent edge", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("b");
      g.removeEdge("a", "b");
      expect(g.edgeCount).toBe(0);
    });

    it("removes directed edge only one way", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "a");
      g.removeEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(false);
      expect(g.hasEdge("b", "a")).toBe(true);
    });
  });

  describe("hasVertex", () => {
    it("returns true for existing vertices", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.hasVertex("a")).toBe(true);
    });

    it("returns false for non-existent vertices", () => {
      const g = new SparseGraph();
      expect(g.hasVertex("a")).toBe(false);
    });
  });

  describe("hasEdge", () => {
    it("returns true for existing edge", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(true);
    });

    it("returns false for non-existent edge", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("b");
      expect(g.hasEdge("a", "b")).toBe(false);
    });

    it("returns false when vertices do not exist", () => {
      const g = new SparseGraph();
      expect(g.hasEdge("a", "b")).toBe(false);
    });
  });

  describe("getEdge", () => {
    it("returns weight for weighted edges", () => {
      const g = new SparseGraph({ weighted: true });
      g.addEdge("a", "b", 10);
      expect(g.getEdge("a", "b")).toBe(10);
    });

    it("returns undefined for unweighted edges", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      expect(g.getEdge("a", "b")).toBeUndefined();
    });

    it("returns undefined for non-existent edges", () => {
      const g = new SparseGraph();
      expect(g.getEdge("a", "b")).toBeUndefined();
    });

    it("returns weight from reverse direction in undirected graph", () => {
      const g = new SparseGraph({ weighted: true });
      g.addEdge("a", "b", 7);
      expect(g.getEdge("b", "a")).toBe(7);
    });
  });

  describe("vertices", () => {
    it("returns all vertices", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("b");
      g.addVertex("c");
      expect(g.vertices.sort()).toEqual(["a", "b", "c"]);
    });

    it("returns empty array for empty graph", () => {
      const g = new SparseGraph();
      expect(g.vertices).toEqual([]);
    });
  });

  describe("edges", () => {
    it("returns all edges in undirected graph without duplication", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      expect(g.edges.length).toBe(2);
    });

    it("returns all directed edges", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "a");
      expect(g.edges.length).toBe(2);
    });

    it("includes weights in edges", () => {
      const g = new SparseGraph({ weighted: true });
      g.addEdge("a", "b", 5);
      const edges = g.edges;
      expect(edges.length).toBe(1);
      expect(edges[0][2]).toBe(5);
    });

    it("returns empty array for empty graph", () => {
      const g = new SparseGraph();
      expect(g.edges).toEqual([]);
    });

    it("returns edges for graph with only vertices", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("b");
      expect(g.edges).toEqual([]);
    });
  });

  describe("neighbors", () => {
    it("returns neighbors of a vertex", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      const n = g.neighbors("a").sort();
      expect(n).toEqual(["b", "c"]);
    });

    it("returns empty array for isolated vertex", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.neighbors("a")).toEqual([]);
    });

    it("returns empty array for non-existent vertex", () => {
      const g = new SparseGraph();
      expect(g.neighbors("a")).toEqual([]);
    });

    it("returns neighbors in directed graph (outgoing only)", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("c", "a");
      expect(g.neighbors("a")).toEqual(["b"]);
    });
  });

  describe("degree", () => {
    it("returns the degree of a vertex in undirected graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      g.addEdge("a", "d");
      expect(g.degree("a")).toBe(3);
    });

    it("returns 0 for isolated vertex", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.degree("a")).toBe(0);
    });

    it("returns 0 for non-existent vertex", () => {
      const g = new SparseGraph();
      expect(g.degree("a")).toBe(0);
    });

    it("counts self-loop once in undirected graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "a");
      expect(g.degree("a")).toBe(1);
    });
  });

  describe("inDegree", () => {
    it("returns in-degree for directed graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "c");
      g.addEdge("b", "c");
      g.addEdge("c", "d");
      expect(g.inDegree("c")).toBe(2);
    });

    it("returns degree for undirected graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      expect(g.inDegree("a")).toBe(2);
    });

    it("returns 0 for vertex with no incoming edges", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      expect(g.inDegree("a")).toBe(0);
    });
  });

  describe("outDegree", () => {
    it("returns out-degree for directed graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      expect(g.outDegree("a")).toBe(2);
    });

    it("returns degree for undirected graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      expect(g.outDegree("a")).toBe(2);
    });

    it("returns 0 for vertex with no outgoing edges", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      expect(g.outDegree("b")).toBe(0);
    });
  });

  describe("size", () => {
    it("returns vertex count", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("b");
      g.addVertex("c");
      expect(g.size).toBe(3);
    });

    it("returns 0 for empty graph", () => {
      const g = new SparseGraph();
      expect(g.size).toBe(0);
    });
  });

  describe("edgeCount", () => {
    it("returns edge count", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      expect(g.edgeCount).toBe(2);
    });

    it("returns 0 for empty graph", () => {
      const g = new SparseGraph();
      expect(g.edgeCount).toBe(0);
    });
  });

  describe("isEmpty", () => {
    it("returns true for empty graph", () => {
      const g = new SparseGraph();
      expect(g.isEmpty).toBe(true);
    });

    it("returns false for non-empty graph", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.isEmpty).toBe(false);
    });
  });

  describe("clear", () => {
    it("removes all vertices and edges", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.clear();
      expect(g.size).toBe(0);
      expect(g.edgeCount).toBe(0);
      expect(g.isEmpty).toBe(true);
    });

    it("preserves graph options", () => {
      const g = new SparseGraph({ directed: true, weighted: true });
      g.clear();
      expect(g.isDirected).toBe(true);
      expect(g.isWeighted).toBe(true);
    });
  });

  describe("bfs", () => {
    it("traverses all reachable vertices", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      g.addEdge("b", "d");
      const visited: string[] = [];
      g.bfs("a", (v) => visited.push(v));
      expect(visited.sort()).toEqual(["a", "b", "c", "d"]);
    });

    it("visits in BFS order", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      g.addEdge("b", "d");
      const visited: string[] = [];
      g.bfs("a", (v) => visited.push(v));
      expect(visited[0]).toBe("a");
    });

    it("does not visit unreachable vertices", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addVertex("c");
      const visited: string[] = [];
      g.bfs("a", (v) => visited.push(v));
      expect(visited).not.toContain("c");
    });

    it("does nothing for non-existent start", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      const visited: string[] = [];
      g.bfs("z", (v) => visited.push(v));
      expect(visited).toEqual([]);
    });

    it("handles single vertex graph", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      const visited: string[] = [];
      g.bfs("a", (v) => visited.push(v));
      expect(visited).toEqual(["a"]);
    });
  });

  describe("dfs", () => {
    it("traverses all reachable vertices", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      g.addEdge("b", "d");
      const visited: string[] = [];
      g.dfs("a", (v) => visited.push(v));
      expect(visited.sort()).toEqual(["a", "b", "c", "d"]);
    });

    it("visits each vertex exactly once", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "a");
      const visited: string[] = [];
      g.dfs("a", (v) => visited.push(v));
      expect(visited.length).toBe(3);
    });

    it("does nothing for non-existent start", () => {
      const g = new SparseGraph();
      const visited: string[] = [];
      g.dfs("z", (v) => visited.push(v));
      expect(visited).toEqual([]);
    });

    it("handles single vertex graph", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      const visited: string[] = [];
      g.dfs("a", (v) => visited.push(v));
      expect(visited).toEqual(["a"]);
    });
  });

  describe("shortestPath", () => {
    it("finds shortest path in unweighted graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("a", "c");
      const path = g.shortestPath("a", "c");
      expect(path).toEqual(["a", "c"]);
    });

    it("returns single vertex when from equals to", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.shortestPath("a", "a")).toEqual(["a"]);
    });

    it("returns empty when no path exists", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("b");
      expect(g.shortestPath("a", "b")).toEqual([]);
    });

    it("returns empty when from vertex does not exist", () => {
      const g = new SparseGraph();
      g.addVertex("b");
      expect(g.shortestPath("a", "b")).toEqual([]);
    });

    it("returns empty when to vertex does not exist", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.shortestPath("a", "b")).toEqual([]);
    });

    it("finds path in longer chain", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "d");
      expect(g.shortestPath("a", "d")).toEqual(["a", "b", "c", "d"]);
    });

    it("uses Dijkstra for weighted graphs", () => {
      const g = new SparseGraph({ weighted: true });
      g.addEdge("a", "b", 1);
      g.addEdge("b", "c", 1);
      g.addEdge("a", "c", 10);
      const path = g.shortestPath("a", "c");
      expect(path).toEqual(["a", "b", "c"]);
    });

    it("finds shortest path in directed weighted graph", () => {
      const g = new SparseGraph({ directed: true, weighted: true });
      g.addEdge("a", "b", 2);
      g.addEdge("b", "c", 3);
      g.addEdge("a", "c", 10);
      expect(g.shortestPath("a", "c")).toEqual(["a", "b", "c"]);
    });

    it("returns empty path when no directed path exists", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("c", "d");
      expect(g.shortestPath("a", "d")).toEqual([]);
    });
  });

  describe("isConnected", () => {
    it("returns true for connected undirected graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      expect(g.isConnected).toBe(true);
    });

    it("returns false for disconnected undirected graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addVertex("c");
      expect(g.isConnected).toBe(false);
    });

    it("returns true for empty graph", () => {
      const g = new SparseGraph();
      expect(g.isConnected).toBe(true);
    });

    it("returns true for single vertex graph", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.isConnected).toBe(true);
    });

    it("returns true for strongly connected directed graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "a");
      expect(g.isConnected).toBe(true);
    });

    it("returns false for weakly connected directed graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      expect(g.isConnected).toBe(false);
    });
  });

  describe("hasCycle", () => {
    it("returns true for undirected graph with cycle", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "a");
      expect(g.hasCycle).toBe(true);
    });

    it("returns false for acyclic undirected graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      expect(g.hasCycle).toBe(false);
    });

    it("returns false for empty graph", () => {
      const g = new SparseGraph();
      expect(g.hasCycle).toBe(false);
    });

    it("returns false for single vertex graph", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      expect(g.hasCycle).toBe(false);
    });

    it("detects self-loops as cycles in undirected graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "a");
      expect(g.hasCycle).toBe(true);
    });

    it("returns true for directed graph with cycle", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "a");
      expect(g.hasCycle).toBe(true);
    });

    it("returns false for DAG", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      expect(g.hasCycle).toBe(false);
    });

    it("detects self-loop as cycle in directed graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "a");
      expect(g.hasCycle).toBe(true);
    });

    it("detects cycle in disconnected directed graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("c", "d");
      g.addEdge("d", "c");
      expect(g.hasCycle).toBe(true);
    });
  });

  describe("transpose", () => {
    it("reverses all directed edges", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      const t = g.transpose();
      expect(t.hasEdge("b", "a")).toBe(true);
      expect(t.hasEdge("c", "b")).toBe(true);
      expect(t.hasEdge("a", "b")).toBe(false);
    });

    it("preserves vertex set", () => {
      const g = new SparseGraph({ directed: true });
      g.addVertex("a");
      g.addVertex("b");
      g.addEdge("a", "b");
      const t = g.transpose();
      expect(t.size).toBe(2);
    });

    it("preserves weights", () => {
      const g = new SparseGraph({ directed: true, weighted: true });
      g.addEdge("a", "b", 5);
      const t = g.transpose();
      expect(t.getEdge("b", "a")).toBe(5);
    });

    it("preserves directed flag", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      const t = g.transpose();
      expect(t.isDirected).toBe(true);
    });

    it("double transpose returns original directed graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "a");
      const tt = g.transpose().transpose();
      expect(tt.hasEdge("a", "b")).toBe(true);
      expect(tt.hasEdge("b", "c")).toBe(true);
      expect(tt.hasEdge("c", "a")).toBe(true);
    });

    it("handles undirected graph transpose", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      const t = g.transpose();
      expect(t.hasEdge("a", "b")).toBe(true);
      expect(t.hasEdge("b", "a")).toBe(true);
    });
  });

  describe("clone", () => {
    it("creates an independent copy", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      const c = g.clone();
      c.removeEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(true);
      expect(c.hasEdge("a", "b")).toBe(false);
    });

    it("preserves all vertices", () => {
      const g = new SparseGraph();
      g.addVertex("a");
      g.addVertex("b");
      g.addVertex("c");
      const c = g.clone();
      expect(c.size).toBe(3);
    });

    it("preserves all edges", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      const c = g.clone();
      expect(c.edgeCount).toBe(2);
    });

    it("preserves weights", () => {
      const g = new SparseGraph({ weighted: true });
      g.addEdge("a", "b", 5);
      const c = g.clone();
      expect(c.getEdge("a", "b")).toBe(5);
    });

    it("preserves directed flag", () => {
      const g = new SparseGraph({ directed: true });
      const c = g.clone();
      expect(c.isDirected).toBe(true);
    });

    it("preserves weighted flag", () => {
      const g = new SparseGraph({ weighted: true });
      const c = g.clone();
      expect(c.isWeighted).toBe(true);
    });
  });

  describe("subgraph", () => {
    it("creates a subgraph with specified vertices", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "d");
      const sg = g.subgraph(["a", "b", "c"]);
      expect(sg.hasVertex("a")).toBe(true);
      expect(sg.hasVertex("b")).toBe(true);
      expect(sg.hasVertex("c")).toBe(true);
      expect(sg.hasVertex("d")).toBe(false);
    });

    it("only includes edges between subgraph vertices", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "d");
      const sg = g.subgraph(["a", "b"]);
      expect(sg.hasEdge("a", "b")).toBe(true);
      expect(sg.hasEdge("b", "c")).toBe(false);
    });

    it("ignores vertices not in original graph", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      const sg = g.subgraph(["a", "b", "z"]);
      expect(sg.hasVertex("z")).toBe(false);
    });

    it("preserves directed flag", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      const sg = g.subgraph(["a", "b"]);
      expect(sg.isDirected).toBe(true);
    });

    it("preserves weights", () => {
      const g = new SparseGraph({ weighted: true });
      g.addEdge("a", "b", 5);
      g.addEdge("b", "c", 3);
      const sg = g.subgraph(["a", "b"]);
      expect(sg.getEdge("a", "b")).toBe(5);
    });

    it("creates empty subgraph with empty vertex list", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      const sg = g.subgraph([]);
      expect(sg.isEmpty).toBe(true);
    });
  });

  describe("numeric vertices", () => {
    it("works with numeric vertices", () => {
      const g = new SparseGraph<number>();
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.hasEdge(2, 3)).toBe(true);
      expect(g.size).toBe(3);
    });

    it("finds shortest path with numeric vertices", () => {
      const g = new SparseGraph<number>();
      g.addEdge(1, 2);
      g.addEdge(2, 3);
      g.addEdge(3, 4);
      expect(g.shortestPath(1, 4)).toEqual([1, 2, 3, 4]);
    });
  });

  describe("complex scenarios", () => {
    it("handles a tree structure (no cycles)", () => {
      const g = new SparseGraph();
      g.addEdge("root", "a");
      g.addEdge("root", "b");
      g.addEdge("a", "a1");
      g.addEdge("a", "a2");
      g.addEdge("b", "b1");
      expect(g.hasCycle).toBe(false);
      expect(g.isConnected).toBe(true);
      expect(g.size).toBe(6);
      expect(g.edgeCount).toBe(5);
    });

    it("handles a complete graph K4", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      g.addEdge("a", "d");
      g.addEdge("b", "c");
      g.addEdge("b", "d");
      g.addEdge("c", "d");
      expect(g.size).toBe(4);
      expect(g.edgeCount).toBe(6);
      expect(g.hasCycle).toBe(true);
      expect(g.isConnected).toBe(true);
    });

    it("handles directed acyclic graph", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("a", "c");
      g.addEdge("b", "d");
      g.addEdge("c", "d");
      expect(g.hasCycle).toBe(false);
      expect(g.size).toBe(4);
      expect(g.outDegree("a")).toBe(2);
      expect(g.inDegree("d")).toBe(2);
    });

    it("handles weighted directed graph with Dijkstra", () => {
      const g = new SparseGraph({ directed: true, weighted: true });
      g.addEdge("s", "a", 1);
      g.addEdge("s", "b", 5);
      g.addEdge("a", "b", 2);
      g.addEdge("a", "c", 7);
      g.addEdge("b", "c", 1);
      const path = g.shortestPath("s", "c");
      expect(path).toEqual(["s", "a", "b", "c"]);
    });

    it("handles BFS and DFS visit the same set of vertices", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "d");
      g.addEdge("d", "e");
      const bfsVisited: string[] = [];
      const dfsVisited: string[] = [];
      g.bfs("a", (v) => bfsVisited.push(v));
      g.dfs("a", (v) => dfsVisited.push(v));
      expect(bfsVisited.sort()).toEqual(dfsVisited.sort());
    });

    it("handles large graph operations", () => {
      const g = new SparseGraph<number>();
      for (let i = 0; i < 100; i++) {
        g.addEdge(i, i + 1);
      }
      expect(g.size).toBe(101);
      expect(g.edgeCount).toBe(100);
      expect(g.hasCycle).toBe(false);
      expect(g.isConnected).toBe(true);
      const path = g.shortestPath(0, 100);
      expect(path.length).toBe(101);
      expect(path[0]).toBe(0);
      expect(path[100]).toBe(100);
    });

    it("handles remove vertex mid-graph and reconnect", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "d");
      g.removeVertex("b");
      expect(g.hasVertex("b")).toBe(false);
      expect(g.isConnected).toBe(false);
      g.addEdge("a", "c");
      expect(g.isConnected).toBe(true);
    });

    it("transpose of undirected graph preserves edges", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      const t = g.transpose();
      expect(t.hasEdge("a", "b")).toBe(true);
      expect(t.hasEdge("b", "c")).toBe(true);
      expect(t.edgeCount).toBe(2);
    });

    it("clone of directed weighted graph is independent", () => {
      const g = new SparseGraph({ directed: true, weighted: true });
      g.addEdge("a", "b", 3);
      g.addEdge("b", "c", 7);
      const c = g.clone();
      c.removeEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(true);
      expect(c.hasEdge("a", "b")).toBe(false);
      expect(c.getEdge("b", "c")).toBe(7);
    });

    it("subgraph of directed graph only includes directed edges", () => {
      const g = new SparseGraph({ directed: true });
      g.addEdge("a", "b");
      g.addEdge("b", "c");
      g.addEdge("c", "a");
      const sg = g.subgraph(["a", "b"]);
      expect(sg.hasEdge("a", "b")).toBe(true);
      expect(sg.hasEdge("b", "a")).toBe(false);
      expect(sg.hasEdge("b", "c")).toBe(false);
    });

    it("handles clearing and rebuilding", () => {
      const g = new SparseGraph();
      g.addEdge("a", "b");
      g.clear();
      expect(g.isEmpty).toBe(true);
      g.addEdge("x", "y");
      expect(g.size).toBe(2);
      expect(g.edgeCount).toBe(1);
    });
  });
});
