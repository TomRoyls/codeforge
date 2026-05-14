import { describe, it, expect, beforeEach } from 'vitest';
import { BipartiteMatcher } from '../src/core/bipartite-matcher/index.js';

describe('BipartiteMatcher', () => {
  let matcher: BipartiteMatcher<number, string>;

  beforeEach(() => {
    matcher = new BipartiteMatcher<number, string>();
  });

  describe('constructor', () => {
    it('should create empty matcher', () => {
      expect(matcher.leftSize).toBe(0);
      expect(matcher.rightSize).toBe(0);
      expect(matcher.edgeCount).toBe(0);
      expect(matcher.maxMatching()).toEqual(new Map());
      expect(matcher.maxMatchingSize()).toBe(0);
    });
  });

  describe('addLeftNode', () => {
    it('should add left node', () => {
      matcher.addLeftNode(1);
      expect(matcher.leftSize).toBe(1);
    });

    it('should add multiple left nodes', () => {
      matcher.addLeftNode(1);
      matcher.addLeftNode(2);
      matcher.addLeftNode(3);
      expect(matcher.leftSize).toBe(3);
    });

    it('should not add duplicate left node', () => {
      matcher.addLeftNode(1);
      matcher.addLeftNode(1);
      expect(matcher.leftSize).toBe(1);
    });

    it('should initialize empty adjacency for new left node', () => {
      matcher.addLeftNode(1);
      expect(matcher.getNeighbors(1)).toEqual([]);
    });
  });

  describe('addRightNode', () => {
    it('should add right node', () => {
      matcher.addRightNode('a');
      expect(matcher.rightSize).toBe(1);
    });

    it('should add multiple right nodes', () => {
      matcher.addRightNode('a');
      matcher.addRightNode('b');
      matcher.addRightNode('c');
      expect(matcher.rightSize).toBe(3);
    });

    it('should not add duplicate right node', () => {
      matcher.addRightNode('a');
      matcher.addRightNode('a');
      expect(matcher.rightSize).toBe(1);
    });

    it('should initialize empty adjacency for new right node', () => {
      matcher.addRightNode('a');
      expect(matcher.getNeighbors('a')).toEqual([]);
    });
  });

  describe('addEdge', () => {
    it('should add edge and create nodes if needed', () => {
      matcher.addEdge(1, 'a');
      expect(matcher.leftSize).toBe(1);
      expect(matcher.rightSize).toBe(1);
      expect(matcher.edgeCount).toBe(1);
    });

    it('should add edge between existing nodes', () => {
      matcher.addLeftNode(1);
      matcher.addRightNode('a');
      matcher.addEdge(1, 'a');
      expect(matcher.edgeCount).toBe(1);
    });

    it('should add multiple edges', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(2, 'a');
      expect(matcher.edgeCount).toBe(3);
    });

    it('should not add duplicate edge', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'a');
      expect(matcher.edgeCount).toBe(1);
    });

    it('should make edge available from both sides', () => {
      matcher.addEdge(1, 'a');
      expect(matcher.getNeighbors(1)).toEqual(['a']);
      expect(matcher.getNeighbors('a')).toEqual([1]);
    });
  });

  describe('removeEdge', () => {
    it('should return false for non-existent edge', () => {
      expect(matcher.removeEdge(1, 'a')).toBe(false);
    });

    it('should return false when left node does not exist', () => {
      matcher.addRightNode('a');
      expect(matcher.removeEdge(1, 'a')).toBe(false);
    });

    it('should return false when right node does not exist', () => {
      matcher.addLeftNode(1);
      expect(matcher.removeEdge(1, 'a')).toBe(false);
    });

    it('should remove existing edge', () => {
      matcher.addEdge(1, 'a');
      expect(matcher.removeEdge(1, 'a')).toBe(true);
      expect(matcher.edgeCount).toBe(0);
    });

    it('should not affect other edges', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(2, 'a');
      matcher.removeEdge(1, 'a');
      expect(matcher.edgeCount).toBe(2);
      expect(matcher.hasEdge(1, 'b')).toBe(true);
      expect(matcher.hasEdge(2, 'a')).toBe(true);
    });

    it('should remove edge from both sides', () => {
      matcher.addEdge(1, 'a');
      matcher.removeEdge(1, 'a');
      expect(matcher.getNeighbors(1)).toEqual([]);
      expect(matcher.getNeighbors('a')).toEqual([]);
    });
  });

  describe('hasEdge', () => {
    it('should return false for non-existent edge', () => {
      expect(matcher.hasEdge(1, 'a')).toBe(false);
    });

    it('should return true for existing edge', () => {
      matcher.addEdge(1, 'a');
      expect(matcher.hasEdge(1, 'a')).toBe(true);
    });

    it('should return false for removed edge', () => {
      matcher.addEdge(1, 'a');
      matcher.removeEdge(1, 'a');
      expect(matcher.hasEdge(1, 'a')).toBe(false);
    });

    it('should handle multiple edges correctly', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(2, 'a');
      expect(matcher.hasEdge(1, 'a')).toBe(true);
      expect(matcher.hasEdge(1, 'b')).toBe(true);
      expect(matcher.hasEdge(2, 'a')).toBe(true);
      expect(matcher.hasEdge(2, 'b')).toBe(false);
    });
  });

  describe('maxMatching', () => {
    it('should return empty map for empty graph', () => {
      expect(matcher.maxMatching()).toEqual(new Map());
    });

    it('should find matching for single edge', () => {
      matcher.addEdge(1, 'a');
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(1);
      expect(matching.get(1)).toBe('a');
    });

    it('should find maximum matching for simple graph', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(2);
    });

    it('should find maximum matching for complex graph', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(2, 'a');
      matcher.addEdge(2, 'b');
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(2);
    });

    it('should return new map on each call', () => {
      matcher.addEdge(1, 'a');
      const map1 = matcher.maxMatching();
      const map2 = matcher.maxMatching();
      expect(map1).not.toBe(map2);
      expect(map1).toEqual(map2);
    });

    it('should use cached matching when available', () => {
      matcher.addEdge(1, 'a');
      const map1 = matcher.maxMatching();
      const map2 = matcher.maxMatching();
      expect(map1).toEqual(map2);
    });
  });

  describe('maxMatchingSize', () => {
    it('should return 0 for empty graph', () => {
      expect(matcher.maxMatchingSize()).toBe(0);
    });

    it('should return correct size for single edge', () => {
      matcher.addEdge(1, 'a');
      expect(matcher.maxMatchingSize()).toBe(1);
    });

    it('should return maximum matching size', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      matcher.addEdge(3, 'c');
      expect(matcher.maxMatchingSize()).toBe(3);
    });

    it('should handle asymmetric partitions', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(2, 'a');
      expect(matcher.maxMatchingSize()).toBe(2);
    });
  });

  describe('isPerfectMatching', () => {
    it('should return true for empty graph', () => {
      expect(matcher.isPerfectMatching()).toBe(true);
    });

    it('should return true when all nodes matched', () => {
      matcher.addEdge(1, 'a');
      expect(matcher.isPerfectMatching()).toBe(true);
    });

    it('should return true for smaller partition fully matched', () => {
      matcher.addEdge(1, 'a');
      matcher.addLeftNode(2);
      expect(matcher.isPerfectMatching()).toBe(true);
    });

    it('should return true for smaller partition fully matched', () => {
      matcher.addEdge(1, 'a');
      matcher.addRightNode('b');
      expect(matcher.isPerfectMatching()).toBe(true);
    });

    it('should return false when smaller partition not fully matched', () => {
      matcher.addLeftNode(1);
      matcher.addLeftNode(2);
      matcher.addRightNode('a');
      expect(matcher.isPerfectMatching()).toBe(false);
    });

    it('should return true for minimum partition size', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      expect(matcher.isPerfectMatching()).toBe(true);
    });
  });

  describe('getUnmatchedLeft', () => {
    it('should return empty array for empty graph', () => {
      expect(matcher.getUnmatchedLeft()).toEqual([]);
    });

    it('should return all left nodes when no edges', () => {
      matcher.addLeftNode(1);
      matcher.addLeftNode(2);
      expect(matcher.getUnmatchedLeft()).toEqual([1, 2]);
    });

    it('should return unmatched left nodes', () => {
      matcher.addEdge(1, 'a');
      matcher.addLeftNode(2);
      const unmatched = matcher.getUnmatchedLeft();
      expect(unmatched).toContain(2);
      expect(unmatched).not.toContain(1);
    });

    it('should return empty when all left nodes matched', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      expect(matcher.getUnmatchedLeft()).toEqual([]);
    });
  });

  describe('getUnmatchedRight', () => {
    it('should return empty array for empty graph', () => {
      expect(matcher.getUnmatchedRight()).toEqual([]);
    });

    it('should return all right nodes when no edges', () => {
      matcher.addRightNode('a');
      matcher.addRightNode('b');
      expect(matcher.getUnmatchedRight()).toEqual(['a', 'b']);
    });

    it('should return unmatched right nodes', () => {
      matcher.addEdge(1, 'a');
      matcher.addRightNode('b');
      const unmatched = matcher.getUnmatchedRight();
      expect(unmatched).toContain('b');
      expect(unmatched).not.toContain('a');
    });

    it('should return empty when all right nodes matched', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      expect(matcher.getUnmatchedRight()).toEqual([]);
    });
  });

  describe('getNeighbors', () => {
    it('should return empty array for non-existent node', () => {
      expect(matcher.getNeighbors(1)).toEqual([]);
      expect(matcher.getNeighbors('a')).toEqual([]);
    });

    it('should return neighbors of left node', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      expect(matcher.getNeighbors(1)).toEqual(['a', 'b']);
    });

    it('should return neighbors of right node', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'a');
      expect(matcher.getNeighbors('a')).toEqual([1, 2]);
    });

    it('should return copy of neighbors', () => {
      matcher.addEdge(1, 'a');
      const neighbors = matcher.getNeighbors(1);
      neighbors.push('b');
      expect(matcher.getNeighbors(1)).toEqual(['a']);
    });
  });

  describe('getEdges', () => {
    it('should return empty array for empty graph', () => {
      expect(matcher.getEdges()).toEqual([]);
    });

    it('should return all edges', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(2, 'a');
      const edges = matcher.getEdges();
      expect(edges.length).toBe(3);
      expect(edges).toContainEqual([1, 'a']);
      expect(edges).toContainEqual([1, 'b']);
      expect(edges).toContainEqual([2, 'a']);
    });

    it('should return copy of edges', () => {
      matcher.addEdge(1, 'a');
      const edges = matcher.getEdges();
      edges.push([3, 'c']);
      expect(matcher.getEdges().length).toBe(1);
    });
  });

  describe('leftSize', () => {
    it('should return 0 for empty graph', () => {
      expect(matcher.leftSize).toBe(0);
    });

    it('should increment with addLeftNode', () => {
      matcher.addLeftNode(1);
      expect(matcher.leftSize).toBe(1);
      matcher.addLeftNode(2);
      expect(matcher.leftSize).toBe(2);
    });

    it('should not increment with addEdge if node exists', () => {
      matcher.addLeftNode(1);
      matcher.addEdge(1, 'a');
      expect(matcher.leftSize).toBe(1);
    });

    it('should be unaffected by right operations', () => {
      matcher.addRightNode('a');
      matcher.addRightNode('b');
      expect(matcher.leftSize).toBe(0);
    });
  });

  describe('rightSize', () => {
    it('should return 0 for empty graph', () => {
      expect(matcher.rightSize).toBe(0);
    });

    it('should increment with addRightNode', () => {
      matcher.addRightNode('a');
      expect(matcher.rightSize).toBe(1);
      matcher.addRightNode('b');
      expect(matcher.rightSize).toBe(2);
    });

    it('should not increment with addEdge if node exists', () => {
      matcher.addRightNode('a');
      matcher.addEdge(1, 'a');
      expect(matcher.rightSize).toBe(1);
    });

    it('should be unaffected by left operations', () => {
      matcher.addLeftNode(1);
      matcher.addLeftNode(2);
      expect(matcher.rightSize).toBe(0);
    });
  });

  describe('edgeCount', () => {
    it('should return 0 for empty graph', () => {
      expect(matcher.edgeCount).toBe(0);
    });

    it('should increment with addEdge', () => {
      matcher.addEdge(1, 'a');
      expect(matcher.edgeCount).toBe(1);
      matcher.addEdge(2, 'b');
      expect(matcher.edgeCount).toBe(2);
    });

    it('should not count duplicate edges', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'a');
      expect(matcher.edgeCount).toBe(1);
    });

    it('should decrement with removeEdge', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      matcher.removeEdge(1, 'a');
      expect(matcher.edgeCount).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear empty graph', () => {
      matcher.clear();
      expect(matcher.leftSize).toBe(0);
      expect(matcher.rightSize).toBe(0);
      expect(matcher.edgeCount).toBe(0);
    });

    it('should clear all nodes and edges', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      matcher.clear();
      expect(matcher.leftSize).toBe(0);
      expect(matcher.rightSize).toBe(0);
      expect(matcher.edgeCount).toBe(0);
      expect(matcher.getEdges()).toEqual([]);
    });

    it('should allow operations after clear', () => {
      matcher.addEdge(1, 'a');
      matcher.clear();
      matcher.addEdge(2, 'b');
      expect(matcher.leftSize).toBe(1);
      expect(matcher.rightSize).toBe(1);
      expect(matcher.edgeCount).toBe(1);
    });

    it('should invalidate cache on clear', () => {
      matcher.addEdge(1, 'a');
      matcher.maxMatching();
      matcher.clear();
      expect(matcher.maxMatchingSize()).toBe(0);
    });
  });

  describe('clone', () => {
    it('should create empty clone of empty graph', () => {
      const cloned = matcher.clone();
      expect(cloned.leftSize).toBe(0);
      expect(cloned.rightSize).toBe(0);
      expect(cloned.edgeCount).toBe(0);
    });

    it('should clone with nodes', () => {
      matcher.addLeftNode(1);
      matcher.addRightNode('a');
      const cloned = matcher.clone();
      expect(cloned.leftSize).toBe(1);
      expect(cloned.rightSize).toBe(1);
    });

    it('should clone with edges', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      const cloned = matcher.clone();
      expect(cloned.edgeCount).toBe(2);
      expect(cloned.hasEdge(1, 'a')).toBe(true);
      expect(cloned.hasEdge(2, 'b')).toBe(true);
    });

    it('should create independent copy', () => {
      matcher.addEdge(1, 'a');
      const cloned = matcher.clone();
      cloned.addEdge(2, 'b');
      expect(matcher.edgeCount).toBe(1);
      expect(cloned.edgeCount).toBe(2);
    });

    it('should clone matching result', () => {
      matcher.addEdge(1, 'a');
      matcher.maxMatching();
      const cloned = matcher.clone();
      expect(cloned.maxMatchingSize()).toBe(1);
    });

    it('should maintain structure after modifications', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      const cloned = matcher.clone();
      matcher.addEdge(2, 'a');
      expect(cloned.edgeCount).toBe(2);
      expect(cloned.getNeighbors(1)).toEqual(['a', 'b']);
    });
  });

  describe('complex scenarios', () => {
    it('should handle simple bipartite matching', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(2);
    });

    it('should handle case where left has more nodes', () => {
      matcher.addEdge(1, 'a');
      matcher.addLeftNode(2);
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(1);
    });

    it('should handle case where right has more nodes', () => {
      matcher.addEdge(1, 'a');
      matcher.addRightNode('b');
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(1);
    });

    it('should handle multiple possible matchings', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(2, 'a');
      matcher.addEdge(2, 'b');
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(2);
    });

    it('should find maximum in star graph', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(1, 'c');
      matcher.addEdge(2, 'a');
      matcher.addEdge(3, 'b');
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(3);
    });

    it('should handle alternating paths', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(1, 'b');
      matcher.addEdge(2, 'b');
      matcher.addEdge(2, 'c');
      matcher.addEdge(3, 'c');
      const matching = matcher.maxMatching();
      expect(matching.size).toBe(3);
    });
  });

  describe('cache invalidation', () => {
    it('should invalidate cache on addEdge', () => {
      matcher.addEdge(1, 'a');
      matcher.maxMatching();
      matcher.addEdge(2, 'b');
      const size1 = matcher.maxMatchingSize();
      expect(size1).toBe(2);
    });

    it('should invalidate cache on removeEdge', () => {
      matcher.addEdge(1, 'a');
      matcher.addEdge(2, 'b');
      matcher.maxMatching();
      matcher.removeEdge(1, 'a');
      const size = matcher.maxMatchingSize();
      expect(size).toBe(1);
    });

    it('should invalidate cache on addLeftNode', () => {
      matcher.addEdge(1, 'a');
      matcher.maxMatching();
      matcher.addLeftNode(2);
      matcher.addEdge(2, 'b');
      const size = matcher.maxMatchingSize();
      expect(size).toBe(2);
    });

    it('should invalidate cache on addRightNode', () => {
      matcher.addEdge(1, 'a');
      matcher.maxMatching();
      matcher.addRightNode('b');
      matcher.addEdge(2, 'b');
      const size = matcher.maxMatchingSize();
      expect(size).toBe(2);
    });
  });
});
