import { describe, it, expect } from 'vitest';
import { PrioritySearchTree } from '../src/core/priority-search-tree/index.js';

describe('PrioritySearchTree', () => {
  describe('constructor', () => {
    it('should create empty tree', () => {
      const tree = new PrioritySearchTree<number>();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should use default comparator correctly', () => {
      const tree = new PrioritySearchTree<number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      expect(tree.peek().priority).toBe(3);
    });

    it('should use custom priority comparator', () => {
      const tree = new PrioritySearchTree<string, number>({ priorityComparator: (a, b) => b - a });
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      expect(tree.peek().priority).toBe(7);
    });

    it('should handle string priorities with default comparator', () => {
      const tree = new PrioritySearchTree<string, string>();
      tree.insert('a', 'zebra');
      tree.insert('b', 'apple');
      tree.insert('c', 'banana');
      expect(tree.peek().priority).toBe('apple');
    });

    it.skip('should use custom key comparator', () => {
      type Item = { id: number; value: string };
      const tree = new PrioritySearchTree<Item, number>({ keyComparator: (a, b) => a.id - b.id });
      tree.insert({ id: 3, value: 'three' }, 5);
      tree.insert({ id: 1, value: 'one' }, 3);
      tree.insert({ id: 2, value: 'two' }, 7);
      expect(tree.has({ id: 1, value: 'one' })).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert single entry', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty).toBe(false);
      expect(tree.has('a')).toBe(true);
    });

    it('should maintain min-heap after multiple inserts', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      expect(tree.peek().priority).toBe(1);
      expect(tree.size).toBe(5);
    });

    it('should throw for duplicate key', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      expect(() => tree.insert('a', 3)).toThrow('Duplicate key: a');
    });

    it('should handle negative priorities', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', -5);
      tree.insert('b', -3);
      tree.insert('c', -1);
      expect(tree.peek().priority).toBe(-5);
    });

    it('should handle zero priority', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 0);
      tree.insert('b', 1);
      tree.insert('c', -1);
      expect(tree.peek().priority).toBe(-1);
    });

    it('should handle same priorities', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 5);
      tree.insert('c', 5);
      expect(tree.size).toBe(3);
      expect(tree.peek().priority).toBe(5);
    });

    it('should handle string keys', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('alpha', 5);
      tree.insert('beta', 3);
      tree.insert('gamma', 7);
      expect(tree.has('beta')).toBe(true);
    });

    it('should handle number keys', () => {
      const tree = new PrioritySearchTree<number, number>();
      tree.insert(1, 5);
      tree.insert(2, 3);
      tree.insert(3, 7);
      expect(tree.has(2)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should throw for non-existent key', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(() => tree.delete('a')).toThrow('Key not found: a');
    });

    it('should delete single element', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      const entry = tree.delete('a');
      expect(entry.key).toBe('a');
      expect(entry.priority).toBe(5);
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should delete element and maintain heap property', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const entry = tree.delete('c');
      expect(entry.key).toBe('c');
      expect(entry.priority).toBe(7);
      expect(tree.size).toBe(4);
      expect(tree.peek().priority).toBe(1);
    });

    it('should delete root element', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.delete('d');
      expect(tree.peek().priority).toBe(3);
      expect(tree.size).toBe(3);
    });

    it('should handle delete on empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(() => tree.delete('a')).toThrow('Key not found: a');
    });
  });

  describe('extractMin', () => {
    it('should throw for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(() => tree.extractMin()).toThrow('PrioritySearchTree is empty');
    });

    it('should extract single element', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      const entry = tree.extractMin();
      expect(entry.key).toBe('a');
      expect(entry.priority).toBe(5);
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should extract elements in ascending order', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const result: number[] = [];
      while (!tree.isEmpty) {
        result.push(tree.extractMin().priority);
      }
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    it('should remove extracted element', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.extractMin();
      expect(tree.has('b')).toBe(false);
      expect(tree.has('a')).toBe(true);
    });
  });

  describe('extractMax', () => {
    it('should throw for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(() => tree.extractMax()).toThrow('PrioritySearchTree is empty');
    });

    it('should extract single element', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      const entry = tree.extractMax();
      expect(entry.key).toBe('a');
      expect(entry.priority).toBe(5);
      expect(tree.isEmpty).toBe(true);
    });

    it('should extract max priority element', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const entry = tree.extractMax();
      expect(entry.key).toBe('e');
      expect(entry.priority).toBe(9);
      expect(tree.size).toBe(4);
      expect(tree.has('e')).toBe(false);
    });

    it('should handle multiple extractions', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const result: number[] = [];
      while (!tree.isEmpty) {
        result.push(tree.extractMax().priority);
      }
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });
  });

  describe('peek', () => {
    it('should throw for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(() => tree.peek()).toThrow('PrioritySearchTree is empty');
    });

    it('should return minimum without removing', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const entry = tree.peek();
      expect(entry.key).toBe('b');
      expect(entry.priority).toBe(3);
      expect(tree.size).toBe(3);
      expect(tree.peek()).toBe(entry);
    });

    it('should update peek after insert', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      expect(tree.peek().priority).toBe(5);
      tree.insert('b', 3);
      expect(tree.peek().priority).toBe(3);
      tree.insert('c', 7);
      expect(tree.peek().priority).toBe(3);
      tree.insert('d', 1);
      expect(tree.peek().priority).toBe(1);
    });

    it('should return same value on multiple peeks', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      expect(tree.peek()).toBe(tree.peek());
      expect(tree.peek()).toBe(tree.peek());
    });
  });

  describe('peekMax', () => {
    it('should throw for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(() => tree.peekMax()).toThrow('PrioritySearchTree is empty');
    });

    it('should return maximum without removing', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const entry = tree.peekMax();
      expect(entry.key).toBe('c');
      expect(entry.priority).toBe(7);
      expect(tree.size).toBe(3);
      expect(tree.peekMax()).toBe(entry);
    });

    it('should handle multiple elements', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const entry = tree.peekMax();
      expect(entry.key).toBe('e');
      expect(entry.priority).toBe(9);
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent key', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.get('a')).toBe(undefined);
    });

    it('should return priority for existing key', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      expect(tree.get('a')).toBe(5);
      expect(tree.get('b')).toBe(3);
    });

    it('should return updated priority', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.updatePriority('a', 10);
      expect(tree.get('a')).toBe(10);
    });
  });

  describe('has', () => {
    it('should return false for non-existent key', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.has('a')).toBe(false);
    });

    it('should return true for existing key', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      expect(tree.has('a')).toBe(true);
      expect(tree.has('b')).toBe(true);
      expect(tree.has('c')).toBe(true);
      expect(tree.has('d')).toBe(false);
    });

    it('should return false after delete', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.delete('a');
      expect(tree.has('a')).toBe(false);
    });
  });

  describe('updatePriority', () => {
    it('should throw for non-existent key', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(() => tree.updatePriority('a', 10)).toThrow('Key not found: a');
    });

    it('should increase priority', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.updatePriority('a', 10);
      expect(tree.get('a')).toBe(10);
      expect(tree.peek().priority).toBe(3);
    });

    it('should decrease priority', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.updatePriority('a', 1);
      expect(tree.get('a')).toBe(1);
      expect(tree.peek().priority).toBe(1);
    });

    it('should handle same priority', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.updatePriority('a', 5);
      expect(tree.get('a')).toBe(5);
      expect(tree.peek().priority).toBe(5);
    });

    it('should maintain heap property', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.updatePriority('c', 2);
      expect(tree.peek().priority).toBe(1);
      expect(tree.get('c')).toBe(2);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.size).toBe(0);
    });

    it('should return correct size after inserts', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      expect(tree.size).toBe(1);
      tree.insert('b', 3);
      tree.insert('c', 7);
      expect(tree.size).toBe(3);
    });

    it('should update size after delete', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.delete('a');
      expect(tree.size).toBe(1);
    });

    it('should update size after extract', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.extractMin();
      expect(tree.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.isEmpty).toBe(true);
    });

    it('should return false after insert', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      expect(tree.isEmpty).toBe(false);
    });

    it('should return true after extracting all', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.extractMin();
      tree.extractMin();
      expect(tree.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.clear();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should work on empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.clear();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should allow insert after clear', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.clear();
      tree.insert('c', 7);
      tree.insert('d', 1);
      expect(tree.size).toBe(2);
      expect(tree.peek().priority).toBe(1);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return all entries', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const arr = tree.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContainEqual({ key: 'a', priority: 5 });
      expect(arr).toContainEqual({ key: 'b', priority: 3 });
      expect(arr).toContainEqual({ key: 'c', priority: 7 });
    });

    it('should not modify tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      const sizeBefore = tree.size;
      tree.toArray();
      expect(tree.size).toBe(sizeBefore);
    });
  });

  describe('forEach', () => {
    it('should not call callback on empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('should call callback for each entry', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const entries: { key: string; priority: number }[] = [];
      tree.forEach((entry, index) => {
        entries.push({ ...entry });
      });
      expect(entries.length).toBe(3);
    });

    it('should pass correct indices', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const indices: number[] = [];
      tree.forEach((_, index) => {
        indices.push(index);
      });
      expect(indices.length).toBe(3);
    });

    it('should not modify tree during iteration', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      const sizeBefore = tree.size;
      const peekBefore = tree.peek();
      tree.forEach(() => {});
      expect(tree.size).toBe(sizeBefore);
      expect(tree.peek()).toBe(peekBefore);
    });
  });

  describe('keys', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.keys()).toEqual([]);
    });

    it('should return all keys', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const keys = tree.keys();
      expect(keys.length).toBe(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });
  });

  describe('sortByPriority', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.sortByPriority()).toEqual([]);
    });

    it('should return entries sorted by priority', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const sorted = tree.sortByPriority();
      expect(sorted.length).toBe(5);
      expect(sorted[0].priority).toBe(1);
      expect(sorted[1].priority).toBe(3);
      expect(sorted[2].priority).toBe(5);
      expect(sorted[3].priority).toBe(7);
      expect(sorted[4].priority).toBe(9);
    });
  });

  describe('findByPriority', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.findByPriority(5)).toEqual([]);
    });

    it('should return entries with matching priority', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 5);
      tree.insert('c', 3);
      tree.insert('d', 7);
      const results = tree.findByPriority(5);
      expect(results.length).toBe(2);
      expect(results).toContainEqual({ key: 'a', priority: 5 });
      expect(results).toContainEqual({ key: 'b', priority: 5 });
    });

    it('should return empty array for non-existent priority', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      expect(tree.findByPriority(10)).toEqual([]);
    });
  });

  describe('findByPriorityRange', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.findByPriorityRange(3, 7)).toEqual([]);
    });

    it('should return entries in range', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const results = tree.findByPriorityRange(3, 7);
      expect(results.length).toBe(3);
      expect(results).toContainEqual({ key: 'a', priority: 5 });
      expect(results).toContainEqual({ key: 'b', priority: 3 });
      expect(results).toContainEqual({ key: 'c', priority: 7 });
    });

    it('should handle empty range', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      expect(tree.findByPriorityRange(10, 15)).toEqual([]);
    });
  });

  describe('drain', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.drain()).toEqual([]);
      expect(tree.isEmpty).toBe(true);
    });

    it('should extract all elements', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const drained = tree.drain();
      expect(drained.length).toBe(5);
      expect(tree.isEmpty).toBe(true);
    });

    it('should return elements in ascending order', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.insert('d', 1);
      tree.insert('e', 9);
      const drained = tree.drain();
      const priorities = drained.map(e => e.priority);
      expect(priorities).toEqual([1, 3, 5, 7, 9]);
    });
  });

  describe('merge', () => {
    it('should merge empty tree with non-empty tree', () => {
      const tree1 = new PrioritySearchTree<string, number>();
      const tree2 = new PrioritySearchTree<string, number>();
      tree2.insert('a', 5);
      tree2.insert('b', 3);
      tree1.merge(tree2);
      expect(tree1.size).toBe(2);
      expect(tree1.has('a')).toBe(true);
      expect(tree1.has('b')).toBe(true);
      expect(tree2.size).toBe(2);
    });

    it('should merge two non-empty trees', () => {
      const tree1 = new PrioritySearchTree<string, number>();
      const tree2 = new PrioritySearchTree<string, number>();
      tree1.insert('a', 5);
      tree1.insert('b', 3);
      tree2.insert('c', 7);
      tree2.insert('d', 1);
      tree1.merge(tree2);
      expect(tree1.size).toBe(4);
      expect(tree1.has('a')).toBe(true);
      expect(tree1.has('c')).toBe(true);
      expect(tree1.has('d')).toBe(true);
      expect(tree2.size).toBe(2);
    });

    it('should not merge duplicate keys', () => {
      const tree1 = new PrioritySearchTree<string, number>();
      const tree2 = new PrioritySearchTree<string, number>();
      tree1.insert('a', 5);
      tree2.insert('a', 3);
      tree1.merge(tree2);
      expect(tree1.size).toBe(1);
      expect(tree1.get('a')).toBe(5);
      expect(tree2.size).toBe(1);
    });
  });

  describe('clone', () => {
    it('should clone empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      const cloned = tree.clone();
      expect(cloned.isEmpty).toBe(true);
      expect(cloned.size).toBe(0);
    });

    it('should clone tree with elements', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const cloned = tree.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.has('a')).toBe(true);
      expect(cloned.get('a')).toBe(5);
    });

    it('should create independent clone', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      const cloned = tree.clone();
      cloned.insert('c', 7);
      cloned.delete('a');
      expect(tree.size).toBe(2);
      expect(tree.has('a')).toBe(true);
      expect(tree.has('b')).toBe(true);
      expect(cloned.size).toBe(2);
      expect(cloned.has('a')).toBe(false);
      expect(cloned.has('c')).toBe(true);
    });

    it('should clone with custom comparator', () => {
      const tree = new PrioritySearchTree<string, number>({ priorityComparator: (a, b) => b - a });
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const cloned = tree.clone();
      cloned.insert('d', 1);
      expect(cloned.peek().priority).toBe(7);
    });
  });

  describe('containsAll', () => {
    it('should return true for empty array', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.containsAll([])).toBe(true);
    });

    it('should return true when all keys exist', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      expect(tree.containsAll(['a', 'b', 'c'])).toBe(true);
    });

    it('should return false when some keys do not exist', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      expect(tree.containsAll(['a', 'b', 'c'])).toBe(false);
    });

    it('should return false for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.containsAll(['a', 'b'])).toBe(false);
    });
  });

  describe('containsAny', () => {
    it('should return false for empty array', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.containsAny([])).toBe(false);
    });

    it('should return true when at least one key exists', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      expect(tree.containsAny(['a', 'b', 'c'])).toBe(true);
    });

    it('should return false when no keys exist', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      expect(tree.containsAny(['b', 'c'])).toBe(false);
    });
  });

  describe('values', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.values()).toEqual([]);
    });

    it('should return all priorities', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const values = tree.values();
      expect(values.length).toBe(3);
      expect(values).toContain(5);
      expect(values).toContain(3);
      expect(values).toContain(7);
    });
  });

  describe('entries', () => {
    it('should return empty array for empty tree', () => {
      const tree = new PrioritySearchTree<string, number>();
      expect(tree.entries()).toEqual([]);
    });

    it('should return all entries as tuples', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      const entries = tree.entries();
      expect(entries.length).toBe(3);
      expect(entries).toContainEqual(['a', 5]);
      expect(entries).toContainEqual(['b', 3]);
      expect(entries).toContainEqual(['c', 7]);
    });
  });

  describe('large datasets', () => {
    it('should handle 10000 insertions', () => {
      const tree = new PrioritySearchTree<string, number>();
      const count = 10000;
      for (let i = 0; i < count; i++) {
        tree.insert(`key-${i}`, Math.floor(Math.random() * 10000));
      }
      expect(tree.size).toBe(count);
    });

    it('should extract all elements in order', () => {
      const tree = new PrioritySearchTree<string, number>();
      const values: number[] = [];
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 1000);
        values.push(value);
        tree.insert(`key-${i}`, value);
      }
      const result: number[] = [];
      while (!tree.isEmpty) {
        result.push(tree.extractMin().priority);
      }
      const sorted = [...values].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });
  });

  describe('custom types', () => {
    it('should handle string keys', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('zebra', 5);
      tree.insert('apple', 3);
      tree.insert('banana', 7);
      const result: number[] = [];
      while (!tree.isEmpty) {
        result.push(tree.extractMin().priority);
      }
      expect(result).toEqual([3, 5, 7]);
    });

    it('should handle number keys', () => {
      const tree = new PrioritySearchTree<number, number>();
      tree.insert(1, 5);
      tree.insert(2, 3);
      tree.insert(3, 7);
      expect(tree.get(1)).toBe(5);
      expect(tree.get(2)).toBe(3);
    });

    it('should handle string priorities', () => {
      const tree = new PrioritySearchTree<string, string>();
      tree.insert('a', 'zebra');
      tree.insert('b', 'apple');
      tree.insert('c', 'banana');
      expect(tree.peek().priority).toBe('apple');
    });

    it.skip('should handle object keys', () => {
      type Item = { id: number; value: string };
      const tree = new PrioritySearchTree<Item, number>({ keyComparator: (a, b) => a.id - b.id });
      tree.insert({ id: 1, value: 'one' }, 5);
      tree.insert({ id: 2, value: 'two' }, 3);
      expect(tree.has({ id: 1, value: 'one' })).toBe(true);
      expect(tree.get({ id: 2, value: 'two' })).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle insert after complete extraction', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.extractMin();
      tree.extractMin();
      expect(tree.isEmpty).toBe(true);
      tree.insert('c', 7);
      expect(tree.peek().priority).toBe(7);
    });

    it('should handle complex sequence', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.extractMin();
      tree.insert('c', 1);
      tree.extractMin();
      tree.insert('d', 7);
      tree.insert('e', 2);
      tree.extractMin();
      expect(tree.peek().priority).toBe(5);
    });

    it('should handle negative and positive mix', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', -5);
      tree.insert('b', 3);
      tree.insert('c', -1);
      tree.insert('d', 0);
      tree.insert('e', -3);
      expect(tree.peek().priority).toBe(-5);
    });

    it('should handle multiple updates', () => {
      const tree = new PrioritySearchTree<string, number>();
      tree.insert('a', 5);
      tree.insert('b', 3);
      tree.insert('c', 7);
      tree.updatePriority('a', 1);
      tree.updatePriority('b', 2);
      tree.updatePriority('c', 10);
      expect(tree.peek().priority).toBe(1);
      expect(tree.get('b')).toBe(2);
      expect(tree.get('c')).toBe(10);
    });
  });
});
