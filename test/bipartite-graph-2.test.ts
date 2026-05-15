import { describe, it, expect } from 'vitest';
import { BipartiteGraph2 } from '../src/core/bipartite-graph-2/index.js';

describe('BipartiteGraph2', () => {
  it('should create empty graph', () => {
    const graph = new BipartiteGraph2();
    expect(graph.vertexCount()).toBe(0);
    expect(graph.edgeCount()).toBe(0);
  });

  it('should add left vertices', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L2');

    expect(graph.getLeftVertices()).toEqual(['L1', 'L2']);
    expect(graph.vertexCount()).toBe(2);
  });

  it('should add right vertices', () => {
    const graph = new BipartiteGraph2();
    graph.addRightVertex('R1');
    graph.addRightVertex('R2');

    expect(graph.getRightVertices()).toEqual(['R1', 'R2']);
    expect(graph.vertexCount()).toBe(2);
  });

  it('should add edges between left and right vertices', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');

    graph.addEdge('L1', 'R1', 5);

    expect(graph.hasEdge('L1', 'R1')).toBe(true);
    expect(graph.getEdgeWeight('L1', 'R1')).toBe(5);
    expect(graph.edgeCount()).toBe(1);
  });

  it('should add edges with default weight of 1', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');

    graph.addEdge('L1', 'R1');

    expect(graph.getEdgeWeight('L1', 'R1')).toBe(1);
  });

  it('should remove existing edges', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');

    graph.addEdge('L1', 'R1');
    expect(graph.hasEdge('L1', 'R1')).toBe(true);

    const removed = graph.removeEdge('L1', 'R1');
    expect(removed).toBe(true);
    expect(graph.hasEdge('L1', 'R1')).toBe(false);
    expect(graph.edgeCount()).toBe(0);
  });

  it('should return false when removing non-existent edge', () => {
    const graph = new BipartiteGraph2();
    const removed = graph.removeEdge('L1', 'R1');
    expect(removed).toBe(false);
  });

  it('should get neighbors for left vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    graph.addRightVertex('R2');

    graph.addEdge('L1', 'R1');
    graph.addEdge('L1', 'R2');

    const neighbors = graph.getNeighbors('L1');
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContain('R1');
    expect(neighbors).toContain('R2');
  });

  it('should get neighbors for right vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L2');
    graph.addRightVertex('R1');

    graph.addEdge('L1', 'R1');
    graph.addEdge('L2', 'R1');

    const neighbors = graph.getNeighbors('R1');
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContain('L1');
    expect(neighbors).toContain('L2');
  });

  it('should return empty array for vertex with no neighbors', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');

    const neighbors = graph.getNeighbors('L1');
    expect(neighbors).toEqual([]);
  });

  it('should return empty array for non-existent vertex', () => {
    const graph = new BipartiteGraph2();
    const neighbors = graph.getNeighbors('X1');
    expect(neighbors).toEqual([]);
  });

  it('should throw error when adding edge from non-existent left vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addRightVertex('R1');

    expect(() => {
      graph.addEdge('L1', 'R1');
    }).toThrow('Left vertex L1 does not exist');
  });

  it('should throw error when adding edge to non-existent right vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');

    expect(() => {
      graph.addEdge('L1', 'R1');
    }).toThrow('Right vertex R1 does not exist');
  });

  it('should return undefined for non-existent edge weight', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');

    const weight = graph.getEdgeWeight('L1', 'R1');
    expect(weight).toBeUndefined();
  });

  it('should handle multiple edges from same left vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    graph.addRightVertex('R2');
    graph.addRightVertex('R3');

    graph.addEdge('L1', 'R1', 1);
    graph.addEdge('L1', 'R2', 2);
    graph.addEdge('L1', 'R3', 3);

    expect(graph.edgeCount()).toBe(3);
    expect(graph.getNeighbors('L1')).toHaveLength(3);
    expect(graph.getEdgeWeight('L1', 'R1')).toBe(1);
    expect(graph.getEdgeWeight('L1', 'R2')).toBe(2);
    expect(graph.getEdgeWeight('L1', 'R3')).toBe(3);
  });

  it('should handle multiple edges to same right vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L2');
    graph.addLeftVertex('L3');
    graph.addRightVertex('R1');

    graph.addEdge('L1', 'R1', 1);
    graph.addEdge('L2', 'R1', 2);
    graph.addEdge('L3', 'R1', 3);

    expect(graph.edgeCount()).toBe(3);
    expect(graph.getNeighbors('R1')).toHaveLength(3);
    expect(graph.getEdgeWeight('L1', 'R1')).toBe(1);
    expect(graph.getEdgeWeight('L2', 'R1')).toBe(2);
    expect(graph.getEdgeWeight('L3', 'R1')).toBe(3);
  });

  it('should update edge weight when adding duplicate edge', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');

    graph.addEdge('L1', 'R1', 1);
    expect(graph.getEdgeWeight('L1', 'R1')).toBe(1);

    graph.addEdge('L1', 'R1', 5);
    expect(graph.getEdgeWeight('L1', 'R1')).toBe(5);
    expect(graph.edgeCount()).toBe(1);
  });

  it('should correctly count vertices', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L2');
    graph.addRightVertex('R1');
    graph.addRightVertex('R2');

    expect(graph.vertexCount()).toBe(4);
  });

  it('should correctly count edges', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L2');
    graph.addRightVertex('R1');
    graph.addRightVertex('R2');

    graph.addEdge('L1', 'R1');
    graph.addEdge('L1', 'R2');
    graph.addEdge('L2', 'R1');

    expect(graph.edgeCount()).toBe(3);
  });

  it('should return false for hasEdge on non-existent edge', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');

    expect(graph.hasEdge('L1', 'R1')).toBe(false);
  });

  it('should handle removing edge and adding it back', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');

    graph.addEdge('L1', 'R1', 10);
    expect(graph.hasEdge('L1', 'R1')).toBe(true);

    graph.removeEdge('L1', 'R1');
    expect(graph.hasEdge('L1', 'R1')).toBe(false);

    graph.addEdge('L1', 'R1', 20);
    expect(graph.hasEdge('L1', 'R1')).toBe(true);
    expect(graph.getEdgeWeight('L1', 'R1')).toBe(20);
  });

  it('should prevent adding duplicate vertices in same set', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L1');

    expect(graph.getLeftVertices()).toHaveLength(1);
  });

  it('should get neighbors of left vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    graph.addRightVertex('R2');
    graph.addEdge('L1', 'R1');
    graph.addEdge('L1', 'R2');

    expect(graph.getNeighbors('L1')).toEqual(['R1', 'R2']);
  });

  it('should get neighbors of right vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L2');
    graph.addRightVertex('R1');
    graph.addEdge('L1', 'R1');
    graph.addEdge('L2', 'R1');

    const neighbors = graph.getNeighbors('R1');
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContain('L1');
    expect(neighbors).toContain('L2');
  });

  it('should return empty neighbors for unknown vertex', () => {
    const graph = new BipartiteGraph2();
    expect(graph.getNeighbors('unknown')).toEqual([]);
  });

  it('should return undefined weight for non-existent edge', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    expect(graph.getEdgeWeight('L1', 'R1')).toBeUndefined();
  });

  it('should throw when adding edge with non-existent left vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addRightVertex('R1');
    expect(() => graph.addEdge('L_MISSING', 'R1')).toThrow();
  });

  it('should throw when adding edge with non-existent right vertex', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    expect(() => graph.addEdge('L1', 'R_MISSING')).toThrow();
  });

  it('should handle default edge weight', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    graph.addEdge('L1', 'R1');
    expect(graph.getEdgeWeight('L1', 'R1')).toBe(1);
  });

  it('should handle removeEdge on non-existent edge', () => {
    const graph = new BipartiteGraph2();
    expect(graph.removeEdge('L1', 'R1')).toBe(false);
  });

  it('should handle leftVertexCount and rightVertexCount', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L2');
    graph.addRightVertex('R1');
    expect(graph.getNeighbors('L1')).toEqual([]);
    expect(graph.getNeighbors('R1')).toEqual([]);
  });

  it('should handle edgeCount', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    graph.addEdge('L1', 'R1');
    expect(graph.edgeCount()).toBe(1);
  });

  it('should handle vertexCount', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addLeftVertex('L2');
    graph.addRightVertex('R1');
    expect(graph.vertexCount()).toBe(3);
  });

  it('should handle removeEdge', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    graph.addEdge('L1', 'R1');
    expect(graph.removeEdge('L1', 'R1')).toBe(true);
    expect(graph.edgeCount()).toBe(0);
  });

  it('should handle hasEdge', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    graph.addEdge('L1', 'R1');
    expect(graph.hasEdge('L1', 'R1')).toBe(true);
    expect(graph.hasEdge('R1', 'L1')).toBe(false);
  });

  it('should handle getEdgeWeight', () => {
    const graph = new BipartiteGraph2();
    graph.addLeftVertex('L1');
    graph.addRightVertex('R1');
    graph.addEdge('L1', 'R1', 7);
    expect(graph.getEdgeWeight('L1', 'R1')).toBe(7);
    expect(graph.getEdgeWeight('R1', 'L1')).toBeUndefined();
  });
});
