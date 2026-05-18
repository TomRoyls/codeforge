import { describe, it, expect } from "vitest";
import { GraphKruskal } from "../../src/core/graph-kruskal/index.js";

describe("GraphKruskal", () => {
  // ─── addVertex ───
  describe("addVertex", () => {
    it("adds a vertex", () => {
      const g = new GraphKruskal();
      g.addVertex(1);
      expect(g.vertexCount).toBe(1);
      expect(g.vertices()).toContain(1);
    });

    it("does not duplicate vertices", () => {
      const g = new GraphKruskal();
      g.addVertex(1);
      g.addVertex(1);
      expect(g.vertexCount).toBe(1);
    });
  });

  // ─── addEdge ───
  describe("addEdge", () => {
    it("adds an undirected edge", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 5);
      expect(g.edgeCount).toBe(1);
    });

    it("auto-creates vertices on addEdge", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 5);
      const verts = g.vertices();
      expect(verts).toContain(1);
      expect(verts).toContain(2);
    });

    it("ignores self-loop edges", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 1, 5);
      expect(g.edgeCount).toBe(0);
    });
  });

  // ─── removeEdge ───
  describe("removeEdge", () => {
    it("removes an undirected edge", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 5);
      g.removeEdge(1, 2);
      expect(g.edgeCount).toBe(0);
    });

    it("handles removing non-existent edge", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 5);
      g.removeEdge(3, 4);
      expect(g.edgeCount).toBe(1);
    });
  });

  // ─── vertices / edges ───
  describe("vertices / edges", () => {
    it("returns all vertices", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      const verts = g.vertices();
      expect(verts.length).toBe(3);
      expect(verts).toContain(1);
      expect(verts).toContain(2);
      expect(verts).toContain(3);
    });

    it("returns undirected edges without duplication", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 5);
      const e = g.edges();
      expect(e.length).toBe(1);
    });

    it("returns multiple edges", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      g.addEdge(3, 1, 5);
      expect(g.edges().length).toBe(3);
    });
  });

  // ─── kruskalMST ───
  describe("kruskalMST", () => {
    it("computes MST for simple graph", () => {
      const g = new GraphKruskal();
      g.addEdge(0, 1, 4);
      g.addEdge(0, 2, 3);
      g.addEdge(1, 2, 1);
      const mst = g.kruskalMST();
      expect(mst.totalWeight).toBe(4);
      expect(mst.edges.length).toBe(2);
    });

    it("computes MST for triangle", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 1);
      g.addEdge(2, 3, 2);
      g.addEdge(1, 3, 3);
      const mst = g.kruskalMST();
      expect(mst.totalWeight).toBe(3);
      expect(mst.edges.length).toBe(2);
    });

    it("handles disconnected graph", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 3);
      g.addVertex(99);
      const mst = g.kruskalMST();
      expect(mst.edges.length).toBe(1);
    });

    it("handles empty graph", () => {
      const g = new GraphKruskal();
      const mst = g.kruskalMST();
      expect(mst.edges.length).toBe(0);
      expect(mst.totalWeight).toBe(0);
    });

    it("handles single edge", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 10);
      const mst = g.kruskalMST();
      expect(mst.edges.length).toBe(1);
      expect(mst.totalWeight).toBe(10);
    });

    it("selects minimum weight edges", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 10);
      g.addEdge(2, 3, 1);
      g.addEdge(1, 3, 5);
      const mst = g.kruskalMST();
      expect(mst.totalWeight).toBe(6);
    });
  });

  // ─── isConnected ───
  describe("isConnected", () => {
    it("returns true for connected graph", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      expect(g.isConnected()).toBe(true);
    });

    it("returns false for disconnected graph", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 3);
      g.addVertex(99);
      expect(g.isConnected()).toBe(false);
    });

    it("returns true for empty graph", () => {
      const g = new GraphKruskal();
      expect(g.isConnected()).toBe(true);
    });

    it("returns true for single vertex", () => {
      const g = new GraphKruskal();
      g.addVertex(1);
      expect(g.isConnected()).toBe(true);
    });
  });

  // ─── getMSTWeight ───
  describe("getMSTWeight", () => {
    it("returns total MST weight", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      g.addEdge(1, 3, 10);
      expect(g.getMSTWeight()).toBe(7);
    });
  });

  // ─── getConnectedComponents ───
  describe("getConnectedComponents", () => {
    it("returns single component for connected graph", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 3);
      g.addEdge(2, 3, 4);
      const comps = g.getConnectedComponents();
      expect(comps.length).toBe(1);
      expect(comps[0]!.length).toBe(3);
    });

    it("returns multiple components for disconnected graph", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 3);
      g.addVertex(99);
      const comps = g.getConnectedComponents();
      expect(comps.length).toBe(2);
    });

    it("returns empty for empty graph", () => {
      const g = new GraphKruskal();
      expect(g.getConnectedComponents().length).toBe(0);
    });

    it("each vertex appears in exactly one component", () => {
      const g = new GraphKruskal();
      g.addEdge(1, 2, 1);
      g.addEdge(3, 4, 1);
      g.addVertex(5);
      const comps = g.getConnectedComponents();
      const allVerts = comps.flat();
      expect(allVerts.length).toBe(5);
      expect(new Set(allVerts).size).toBe(5);
    });
  });

  // ─── vertexCount / edgeCount ───
  describe("vertexCount / edgeCount", () => {
    it("tracks vertex and edge counts", () => {
      const g = new GraphKruskal();
      expect(g.vertexCount).toBe(0);
      expect(g.edgeCount).toBe(0);
      g.addEdge(1, 2, 5);
      expect(g.vertexCount).toBe(2);
      expect(g.edgeCount).toBe(1);
    });
  });
});
