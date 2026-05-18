import { describe, it, expect } from "vitest";
import { GraphDijkstra } from "../../src/core/graph-dijkstra/index.js";

describe("GraphDijkstra", () => {
  // ─── Constructor ───
  describe("constructor", () => {
    it("creates empty graph", () => {
      const g = new GraphDijkstra();
      expect(g.vertexCount).toBe(0);
      expect(g.edgeCount).toBe(0);
    });
  });

  // ─── addVertex ───
  describe("addVertex", () => {
    it("adds a vertex", () => {
      const g = new GraphDijkstra();
      g.addVertex(1);
      expect(g.hasVertex(1)).toBe(true);
      expect(g.vertexCount).toBe(1);
    });

    it("does not duplicate vertices", () => {
      const g = new GraphDijkstra();
      g.addVertex(1);
      g.addVertex(1);
      expect(g.vertexCount).toBe(1);
    });

    it("adds multiple vertices", () => {
      const g = new GraphDijkstra();
      g.addVertex(1);
      g.addVertex(2);
      g.addVertex(3);
      expect(g.vertexCount).toBe(3);
    });
  });

  // ─── addEdge ───
  describe("addEdge", () => {
    it("adds a directed edge with weight", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 5);
      expect(g.hasEdge(1, 2)).toBe(true);
      expect(g.hasEdge(2, 1)).toBe(false);
      expect(g.edgeCount).toBe(1);
    });

    it("auto-creates vertices", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      expect(g.hasVertex(1)).toBe(true);
      expect(g.hasVertex(2)).toBe(true);
    });

    it("throws on negative weight", () => {
      const g = new GraphDijkstra();
      expect(() => g.addEdge(1, 2, -1)).toThrow("Weight must be non-negative");
    });

    it("allows zero weight", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 0);
      expect(g.hasEdge(1, 2)).toBe(true);
    });
  });

  // ─── removeVertex ───
  describe("removeVertex", () => {
    it("removes a vertex and its edges", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      g.removeVertex(2);
      expect(g.hasVertex(2)).toBe(false);
      expect(g.hasEdge(1, 2)).toBe(false);
      expect(g.hasEdge(2, 3)).toBe(false);
    });

    it("removes incoming edges to deleted vertex", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addEdge(3, 2, 4);
      g.removeVertex(2);
      expect(g.hasEdge(1, 2)).toBe(false);
      expect(g.hasEdge(3, 2)).toBe(false);
    });

    it("handles removing non-existent vertex", () => {
      const g = new GraphDijkstra();
      g.addVertex(1);
      g.removeVertex(99);
      expect(g.vertexCount).toBe(1);
    });
  });

  // ─── removeEdge ───
  describe("removeEdge", () => {
    it("removes an existing edge", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 5);
      g.removeEdge(1, 2);
      expect(g.hasEdge(1, 2)).toBe(false);
      expect(g.edgeCount).toBe(0);
    });

    it("handles removing non-existent edge gracefully", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 5);
      g.removeEdge(2, 3);
      expect(g.hasEdge(1, 2)).toBe(true);
    });
  });

  // ─── hasVertex / hasEdge ───
  describe("hasVertex / hasEdge", () => {
    it("returns false for missing vertex", () => {
      const g = new GraphDijkstra();
      expect(g.hasVertex(1)).toBe(false);
    });

    it("returns false for missing edge", () => {
      const g = new GraphDijkstra();
      expect(g.hasEdge(1, 2)).toBe(false);
    });

    it("returns false for edge from non-existent vertex", () => {
      const g = new GraphDijkstra();
      expect(g.hasEdge(99, 1)).toBe(false);
    });
  });

  // ─── vertices / edges ───
  describe("vertices / edges", () => {
    it("lists all vertices", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      const verts = g.vertices();
      expect(verts).toContain(1);
      expect(verts).toContain(2);
      expect(verts).toContain(3);
      expect(verts.length).toBe(3);
    });

    it("lists all edges with weights", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 5);
      g.addEdge(2, 3, 10);
      const e = g.edges();
      expect(e.length).toBe(2);
      expect(e).toContainEqual([1, 2, 5]);
      expect(e).toContainEqual([2, 3, 10]);
    });
  });

  // ─── dijkstra ───
  describe("dijkstra", () => {
    it("computes shortest paths from start vertex", () => {
      const g = new GraphDijkstra();
      g.addEdge(0, 1, 4);
      g.addEdge(0, 2, 1);
      g.addEdge(2, 1, 2);
      g.addEdge(1, 3, 1);
      g.addEdge(2, 3, 5);
      const result = g.dijkstra(0);
      expect(result.get(1)?.dist).toBe(3);
      expect(result.get(2)?.dist).toBe(1);
      expect(result.get(3)?.dist).toBe(4);
    });

    it("returns paths", () => {
      const g = new GraphDijkstra();
      g.addEdge(0, 1, 1);
      g.addEdge(1, 2, 1);
      g.addEdge(0, 2, 5);
      const result = g.dijkstra(0);
      expect(result.get(2)?.path).toEqual([0, 1, 2]);
    });

    it("returns empty map for non-existent start", () => {
      const g = new GraphDijkstra();
      g.addVertex(1);
      const result = g.dijkstra(99);
      expect(result.size).toBe(0);
    });

    it("handles disconnected graph", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addVertex(99);
      const result = g.dijkstra(1);
      expect(result.has(99)).toBe(false);
    });

    it("handles single vertex graph", () => {
      const g = new GraphDijkstra();
      g.addVertex(1);
      const result = g.dijkstra(1);
      expect(result.get(1)?.dist).toBe(0);
      expect(result.get(1)?.path).toEqual([1]);
    });
  });

  // ─── shortestPath ───
  describe("shortestPath", () => {
    it("returns shortest path between two vertices", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      const sp = g.shortestPath(1, 3);
      expect(sp).not.toBeNull();
      expect(sp!.dist).toBe(7);
      expect(sp!.path).toEqual([1, 2, 3]);
    });

    it("returns null for unreachable vertex", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addVertex(99);
      expect(g.shortestPath(1, 99)).toBeNull();
    });

    it("returns null for non-existent source", () => {
      const g = new GraphDijkstra();
      g.addVertex(1);
      expect(g.shortestPath(99, 1)).toBeNull();
    });

    it("returns null for non-existent target", () => {
      const g = new GraphDijkstra();
      g.addVertex(1);
      expect(g.shortestPath(1, 99)).toBeNull();
    });
  });

  // ─── shortestDistance ───
  describe("shortestDistance", () => {
    it("returns shortest distance", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      expect(g.shortestDistance(1, 3)).toBe(7);
    });

    it("returns Infinity for unreachable", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addVertex(99);
      expect(g.shortestDistance(1, 99)).toBe(Infinity);
    });

    it("returns Infinity for non-existent source", () => {
      const g = new GraphDijkstra();
      expect(g.shortestDistance(99, 1)).toBe(Infinity);
    });
  });

  // ─── isConnected ───
  describe("isConnected", () => {
    it("returns true for connected vertices", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      expect(g.isConnected(1, 2)).toBe(true);
    });

    it("returns false for disconnected vertices", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addVertex(99);
      expect(g.isConnected(1, 99)).toBe(false);
    });
  });

  // ─── vertexCount / edgeCount ───
  describe("vertexCount / edgeCount", () => {
    it("tracks counts correctly", () => {
      const g = new GraphDijkstra();
      expect(g.vertexCount).toBe(0);
      expect(g.edgeCount).toBe(0);
      g.addEdge(1, 2, 3);
      expect(g.vertexCount).toBe(2);
      expect(g.edgeCount).toBe(1);
      g.addEdge(2, 3, 4);
      expect(g.vertexCount).toBe(3);
      expect(g.edgeCount).toBe(2);
    });
  });

  // ─── Edge cases ───
  describe("edge cases", () => {
    it("handles self-loop", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 1, 5);
      expect(g.hasEdge(1, 1)).toBe(true);
    });

    it("handles multiple edges from same source", () => {
      const g = new GraphDijkstra();
      g.addEdge(1, 2, 3);
      g.addEdge(1, 3, 4);
      expect(g.edgeCount).toBe(2);
    });

    it("handles complex graph", () => {
      const g = new GraphDijkstra();
      // Classic graph: 5 vertices, 7 edges
      g.addEdge(0, 1, 2);
      g.addEdge(0, 3, 6);
      g.addEdge(1, 2, 3);
      g.addEdge(1, 3, 8);
      g.addEdge(1, 4, 5);
      g.addEdge(2, 4, 7);
      g.addEdge(3, 4, 9);
      expect(g.shortestDistance(0, 4)).toBe(7); // 0->1->4
    });
  });
});
