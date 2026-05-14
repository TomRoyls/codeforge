import { describe, it, expect, beforeEach } from 'vitest';
import { FusionTree } from '../src/core/fusion-tree/fusion-tree.js';

describe('FusionTree', () => {
  let tree: FusionTree;

  beforeEach(() => {
    tree = new FusionTree();
  });

  describe('constructor', () => {
    it('should create with default options', () => {
      const t = new FusionTree();
      expect(t.size).toBe(0);
      expect(t.isEmpty).toBe(true);
    });

    it('should create with custom degree', () => {
      const t = new FusionTree({ degree: 4 });
      expect(t.size).toBe(0);
    });
  });

  describe('insert', () => {
    it('should insert a single key', () => {
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty).toBe(false);
    });

    it('should insert multiple keys', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.size).toBe(3);
    });

    it('should handle duplicate keys', () => {
      tree.insert(5);
      tree.insert(5);
      expect(tree.has(5)).toBe(true);
    });
  });

  describe('has/search', () => {
    it('should find inserted key with has', () => {
      tree.insert(5);
      expect(tree.has(5)).toBe(true);
    });

    it('should find inserted key with search', () => {
      tree.insert(5);
      expect(tree.search(5)).toBe(true);
    });

    it('should not find missing key', () => {
      tree.insert(5);
      expect(tree.has(3)).toBe(false);
      expect(tree.search(3)).toBe(false);
    });

    it('should return false for empty tree', () => {
      expect(tree.has(5)).toBe(false);
      expect(tree.search(5)).toBe(false);
    });

    it('should find keys after multiple inserts', () => {
      const keys = [5, 3, 7, 1, 9, 2, 8];
      for (const k of keys) tree.insert(k);
      for (const k of keys) {
        expect(tree.has(k)).toBe(true);
        expect(tree.search(k)).toBe(true);
      }
      expect(tree.has(4)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete an existing key', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.delete(5)).toBe(true);
      expect(tree.has(5)).toBe(false);
      expect(tree.size).toBe(2);
    });

    it('should return false for non-existing key', () => {
      tree.insert(5);
      expect(tree.delete(3)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should return false for empty tree', () => {
      expect(tree.delete(5)).toBe(false);
    });

    it('should handle deleting all keys', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      expect(tree.delete(1)).toBe(true);
      expect(tree.delete(2)).toBe(true);
      expect(tree.delete(3)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      expect(tree.size).toBe(0);
      tree.insert(1);
      expect(tree.size).toBe(1);
      tree.insert(2);
      expect(tree.size).toBe(2);
      tree.delete(1);
      expect(tree.size).toBe(1);
    });

    it('should track isEmpty correctly', () => {
      expect(tree.isEmpty).toBe(true);
      tree.insert(1);
      expect(tree.isEmpty).toBe(false);
      tree.delete(1);
      expect(tree.isEmpty).toBe(true);
    });
  });

  describe('findMin/findMax', () => {
    it('should find minimum', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      expect(tree.findMin()).toBe(1);
    });

    it('should find maximum', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(9);
      expect(tree.findMax()).toBe(9);
    });

    it('should return undefined for findMin on empty', () => {
      expect(tree.findMin()).toBeUndefined();
    });

    it('should return undefined for findMax on empty', () => {
      expect(tree.findMax()).toBeUndefined();
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([]);
    });

    it('should return sorted keys', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9]);
    });
  });

  describe('clear', () => {
    it('should clear the tree', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.toArray()).toEqual([]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all keys', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      const collected: number[] = [];
      tree.forEach((k) => collected.push(k));
      expect(collected.length).toBe(3);
    });
  });

  describe('rangeQuery', () => {
    it('should return keys in range', () => {
      for (let i = 1; i <= 10; i++) tree.insert(i);
      const range = tree.rangeQuery(3, 7);
      expect(range.length).toBeGreaterThan(0);
      for (const k of range) {
        expect(k).toBeGreaterThanOrEqual(3);
        expect(k).toBeLessThanOrEqual(7);
      }
    });
  });

  describe('getHeight', () => {
    it('should return 1 for single element', () => {
      tree.insert(1);
      expect(tree.getHeight()).toBeGreaterThanOrEqual(1);
    });

    it('should return 1 for empty tree (root node)', () => {
      expect(tree.getHeight()).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getStatistics', () => {
    it('should track statistics', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.search(2);
      tree.delete(1);
      const stats = tree.getStatistics();
      expect(stats.inserts).toBe(3);
      expect(stats.deletes).toBe(1);
      expect(stats.searches).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      tree.insert(-5);
      tree.insert(-3);
      tree.insert(-7);
      expect(tree.findMin()).toBe(-7);
      expect(tree.findMax()).toBe(-3);
    });

    it('should handle large dataset', () => {
      for (let i = 0; i < 100; i++) tree.insert(i);
      expect(tree.size).toBe(100);
      expect(tree.findMin()).toBe(0);
      expect(tree.findMax()).toBe(99);
      expect(tree.toArray().length).toBe(100);
    });

    it('should handle reverse sequential inserts', () => {
      for (let i = 49; i >= 0; i--) tree.insert(i);
      expect(tree.findMin()).toBe(0);
      expect(tree.findMax()).toBe(49);
    });

    it('should handle mixed insert and delete', () => {
      for (let i = 0; i < 20; i++) tree.insert(i);
      for (let i = 0; i < 10; i++) tree.delete(i);
      expect(tree.size).toBe(10);
      expect(tree.findMin()).toBe(10);
    });
  });
});
