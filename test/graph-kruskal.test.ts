import { describe, it, expect } from 'vitest';
import { GraphKruskal } from '../src/core/graph-kruskal/index.js';

describe('GraphKruskal - Basic Operations', () => {
  it('should create empty graph', () => {
    const graph = new GraphKruskal();
    expect(graph.vertexCount).toBe(0);
    expect(graph.edgeCount).toBe(0);
    expect(graph.vertices()).toEqual([]);
    expect(graph.edges()).toEqual([]);
  });

  it('should add single vertex', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    expect(graph.vertexCount).toBe(1);
    expect(graph.vertices()).toEqual([1]);
  });

  it('should add multiple vertices', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addVertex(3);
    expect(graph.vertexCount).toBe(3);
    expect(new Set(graph.vertices())).toEqual(new Set([1, 2, 3]));
  });

  it('should not duplicate vertex', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    graph.addVertex(1);
    expect(graph.vertexCount).toBe(1);
  });

  it('should add edge between two vertices', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    expect(graph.vertexCount).toBe(2);
    expect(graph.edgeCount).toBe(1);
    expect(graph.edges()).toEqual([[1, 2, 5]]);
  });

  it('should add edge with auto vertex creation', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 10);
    expect(graph.vertexCount).toBe(2);
    expect(graph.vertices()).toContain(1);
    expect(graph.vertices()).toContain(2);
  });

  it('should remove edge', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.removeEdge(1, 2);
    expect(graph.edgeCount).toBe(0);
  });

  it('should remove edge from vertices with multiple edges', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(1, 3, 10);
    graph.removeEdge(1, 2);
    expect(graph.edgeCount).toBe(1);
    expect(graph.edges()).toEqual([[1, 3, 10]]);
  });

  it('should handle removing non-existent edge', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.removeEdge(1, 3);
    expect(graph.edgeCount).toBe(1);
  });

  it('should ignore self-loops', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 1, 10);
    expect(graph.edgeCount).toBe(0);
  });

  it('should return all vertices', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(3, 4, 15);
    const vertices = graph.vertices();
    expect(vertices).toHaveLength(4);
    expect(new Set(vertices)).toEqual(new Set([1, 2, 3, 4]));
  });

  it('should return all edges', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(3, 4, 15);
    const edges = graph.edges();
    expect(edges).toHaveLength(3);
    expect(edges).toContainEqual([1, 2, 5]);
    expect(edges).toContainEqual([2, 3, 10]);
    expect(edges).toContainEqual([3, 4, 15]);
  });
});

describe('GraphKruskal - Kruskal MST', () => {
  it('should find MST for simple graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 4);
    graph.addEdge(2, 3, 2);
    graph.addEdge(1, 3, 5);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(2);
    expect(mst.totalWeight).toBe(6);
    expect(mst.edges).toContainEqual([2, 3, 2]);
    expect(mst.edges).toContainEqual([1, 2, 4]);
  });

  it('should find MST for triangle', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 10);
    graph.addEdge(2, 3, 15);
    graph.addEdge(1, 3, 20);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(2);
    expect(mst.totalWeight).toBe(25);
  });

  it('should find MST for linear chain', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 1);
    graph.addEdge(2, 3, 2);
    graph.addEdge(3, 4, 3);
    graph.addEdge(4, 5, 4);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(4);
    expect(mst.totalWeight).toBe(10);
  });

  it('should find MST for complete graph K4', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 1);
    graph.addEdge(2, 3, 2);
    graph.addEdge(3, 4, 3);
    graph.addEdge(4, 1, 4);
    graph.addEdge(1, 3, 5);
    graph.addEdge(2, 4, 6);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(3);
    expect(mst.totalWeight).toBe(6);
  });

  it('should handle graph with multiple MSTs', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 2);
    graph.addEdge(2, 3, 2);
    graph.addEdge(3, 1, 2);
    graph.addEdge(1, 4, 1);
    graph.addEdge(2, 4, 1);
    graph.addEdge(3, 4, 1);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(3);
    expect(mst.totalWeight).toBe(3);
  });

  it('should handle negative weights', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, -5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(1, 3, 15);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(2);
    expect(mst.totalWeight).toBe(5);
    expect(mst.edges).toContainEqual([1, 2, -5]);
  });

  it('should handle empty graph', () => {
    const graph = new GraphKruskal();
    const mst = graph.kruskalMST();
    expect(mst.edges).toEqual([]);
    expect(mst.totalWeight).toBe(0);
  });

  it('should handle single vertex', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    const mst = graph.kruskalMST();
    expect(mst.edges).toEqual([]);
    expect(mst.totalWeight).toBe(0);
  });

  it('should handle disconnected graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(3, 4, 10);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(2);
  });

  it('should find MST for complex graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(0, 1, 4);
    graph.addEdge(0, 7, 8);
    graph.addEdge(1, 2, 8);
    graph.addEdge(1, 7, 11);
    graph.addEdge(2, 3, 7);
    graph.addEdge(2, 5, 4);
    graph.addEdge(2, 8, 2);
    graph.addEdge(3, 4, 9);
    graph.addEdge(3, 5, 14);
    graph.addEdge(4, 5, 10);
    graph.addEdge(5, 6, 2);
    graph.addEdge(6, 7, 1);
    graph.addEdge(6, 8, 6);
    graph.addEdge(7, 8, 7);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(8);
    expect(mst.totalWeight).toBe(37);
  });
});

describe('GraphKruskal - isConnected', () => {
  it('should return true for empty graph', () => {
    const graph = new GraphKruskal();
    expect(graph.isConnected()).toBe(true);
  });

  it('should return true for single vertex', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    expect(graph.isConnected()).toBe(true);
  });

  it('should return true for connected graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(3, 4, 15);
    expect(graph.isConnected()).toBe(true);
  });

  it('should return false for disconnected graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(3, 4, 10);
    expect(graph.isConnected()).toBe(false);
  });

  it('should return false for graph with isolated vertex', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addVertex(3);
    expect(graph.isConnected()).toBe(false);
  });

  it('should return true for fully connected graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(1, 3, 15);
    expect(graph.isConnected()).toBe(true);
  });
});

describe('GraphKruskal - getMSTWeight', () => {
  it('should return 0 for empty graph', () => {
    const graph = new GraphKruskal();
    expect(graph.getMSTWeight()).toBe(0);
  });

  it('should return 0 for single vertex', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    expect(graph.getMSTWeight()).toBe(0);
  });

  it('should return correct MST weight for simple graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 4);
    graph.addEdge(2, 3, 2);
    graph.addEdge(1, 3, 5);
    expect(graph.getMSTWeight()).toBe(6);
  });

  it('should return correct MST weight for linear chain', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 1);
    graph.addEdge(2, 3, 2);
    graph.addEdge(3, 4, 3);
    expect(graph.getMSTWeight()).toBe(6);
  });

  it('should return correct MST weight for complete graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 1);
    graph.addEdge(2, 3, 2);
    graph.addEdge(3, 4, 3);
    graph.addEdge(4, 1, 4);
    graph.addEdge(1, 3, 5);
    graph.addEdge(2, 4, 6);
    expect(graph.getMSTWeight()).toBe(6);
  });

  it('should handle negative weights in MST', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, -5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(1, 3, 15);
    expect(graph.getMSTWeight()).toBe(5);
  });
});

describe('GraphKruskal - vertexCount', () => {
  it('should be 0 for empty graph', () => {
    const graph = new GraphKruskal();
    expect(graph.vertexCount).toBe(0);
  });

  it('should count added vertices', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addVertex(3);
    expect(graph.vertexCount).toBe(3);
  });

  it('should count vertices from edges', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    expect(graph.vertexCount).toBe(3);
  });
});

describe('GraphKruskal - edgeCount', () => {
  it('should be 0 for empty graph', () => {
    const graph = new GraphKruskal();
    expect(graph.edgeCount).toBe(0);
  });

  it('should count added edges', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(3, 4, 15);
    expect(graph.edgeCount).toBe(3);
  });

  it('should update after edge removal', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.removeEdge(1, 2);
    expect(graph.edgeCount).toBe(1);
  });

  it('should not count self-loops', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 1, 10);
    expect(graph.edgeCount).toBe(0);
  });
});

describe('GraphKruskal - getConnectedComponents', () => {
  it('should return empty array for empty graph', () => {
    const graph = new GraphKruskal();
    expect(graph.getConnectedComponents()).toEqual([]);
  });

  it('should return single component for connected graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(3, 4, 15);
    const components = graph.getConnectedComponents();
    expect(components).toHaveLength(1);
    expect(components[0]).toHaveLength(4);
  });

  it('should return two components for disconnected graph', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(3, 4, 10);
    const components = graph.getConnectedComponents();
    expect(components).toHaveLength(2);
  });

  it('should return components with isolated vertices', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addVertex(3);
    graph.addVertex(4);
    const components = graph.getConnectedComponents();
    expect(components).toHaveLength(3);
  });

  it('should handle single vertex', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    const components = graph.getConnectedComponents();
    expect(components).toHaveLength(1);
    expect(components[0]).toEqual([1]);
  });

  it('should handle multiple small components', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(3, 4, 10);
    graph.addEdge(5, 6, 15);
    const components = graph.getConnectedComponents();
    expect(components).toHaveLength(3);
  });

  it('should return all vertices in components', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(3, 4, 10);
    const components = graph.getConnectedComponents();
    const allVertices = components.flat();
    expect(new Set(allVertices)).toEqual(new Set([1, 2, 3, 4]));
  });
});

describe('GraphKruskal - Edge Cases', () => {
  it('should handle duplicate edges', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(1, 2, 10);
    expect(graph.edgeCount).toBe(1);
  });

  it('should handle large vertex IDs', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1000, 2000, 5);
    graph.addEdge(2000, 3000, 10);
    expect(graph.vertexCount).toBe(3);
    expect(graph.edgeCount).toBe(2);
  });

  it('should handle negative vertex IDs', () => {
    const graph = new GraphKruskal();
    graph.addEdge(-1, -2, 5);
    graph.addEdge(-2, -3, 10);
    expect(graph.vertexCount).toBe(3);
    expect(graph.edgeCount).toBe(2);
  });

  it('should handle zero weight edges', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 0);
    graph.addEdge(2, 3, 5);
    graph.addEdge(1, 3, 10);
    const mst = graph.kruskalMST();
    expect(mst.edges).toContainEqual([1, 2, 0]);
    expect(mst.totalWeight).toBe(5);
  });
});

describe('GraphKruskal - Integration Tests', () => {
  it('should build graph and find MST incrementally', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(3, 4, 15);
    expect(graph.vertexCount).toBe(4);
    expect(graph.edgeCount).toBe(3);
    const mst = graph.kruskalMST();
    expect(mst.edges).toHaveLength(3);
    expect(mst.totalWeight).toBe(30);
  });

  it('should handle removing edges and recalculating MST', () => {
    const graph = new GraphKruskal();
    graph.addEdge(1, 2, 5);
    graph.addEdge(2, 3, 10);
    graph.addEdge(3, 4, 15);
    graph.addEdge(1, 4, 20);
    let mst = graph.kruskalMST();
    expect(mst.totalWeight).toBe(30);
    graph.removeEdge(1, 4);
    mst = graph.kruskalMST();
    expect(mst.totalWeight).toBe(30);
  });

  it('should handle dynamic graph modifications', () => {
    const graph = new GraphKruskal();
    graph.addVertex(1);
    graph.addVertex(2);
    graph.addEdge(1, 2, 5);
    expect(graph.vertexCount).toBe(2);
    expect(graph.edgeCount).toBe(1);
    graph.addVertex(3);
    graph.addEdge(2, 3, 10);
    expect(graph.vertexCount).toBe(3);
    expect(graph.edgeCount).toBe(2);
    expect(graph.isConnected()).toBe(true);
  });
});
