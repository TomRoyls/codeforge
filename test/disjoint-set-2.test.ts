import { describe, it, expect, beforeEach } from 'vitest';
import { DisjointSet } from '../src/core/disjoint-set-2/index.js';

describe('DisjointSet', () => {
  let ds: DisjointSet<number>;

  beforeEach(() => {
    ds = new DisjointSet<number>();
  });

  describe('constructor', () => {
    it('should create empty disjoint set', () => {
      expect(ds.size).toBe(0);
      expect(ds.isEmpty()).toBe(true);
    });

    it('should accept options parameter', () => {
      const dsWithOptions = new DisjointSet<number>({});
      expect(dsWithOptions.size).toBe(0);
      expect(dsWithOptions.isEmpty()).toBe(true);
    });
  });

  describe('makeSet', () => {
    it('should create single element set', () => {
      ds.makeSet(1);
      expect(ds.size).toBe(1);
      expect(ds.has(1)).toBe(true);
      expect(ds.find(1)).toBe(1);
    });

    it('should create multiple separate sets', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      expect(ds.size).toBe(3);
      expect(ds.has(1)).toBe(true);
      expect(ds.has(2)).toBe(true);
      expect(ds.has(3)).toBe(true);
      expect(ds.connected(1, 2)).toBe(false);
      expect(ds.connected(2, 3)).toBe(false);
    });

    it('should ignore duplicate makeSet calls', () => {
      ds.makeSet(1);
      const sizeBefore = ds.size;
      ds.makeSet(1);
      ds.makeSet(1);
      expect(ds.size).toBe(sizeBefore);
    });

    it('should handle strings', () => {
      const strDs = new DisjointSet<string>();
      strDs.makeSet('a');
      strDs.makeSet('b');
      expect(strDs.size).toBe(2);
      expect(strDs.has('a')).toBe(true);
      expect(strDs.has('b')).toBe(true);
    });

    it.skip('should handle objects', () => {
      const objDs = new DisjointSet<{ id: number }>();
      objDs.makeSet({ id: 1 });
      objDs.makeSet({ id: 2 });
      expect(objDs.size).toBe(2);
      expect(objDs.has({ id: 1 })).toBe(true);
      expect(objDs.has({ id: 2 })).toBe(true);
    });
  });

  describe('find', () => {
    it('should return root of element', () => {
      ds.makeSet(1);
      expect(ds.find(1)).toBe(1);
    });

    it('should return undefined for non-existent element', () => {
      expect(ds.find(1)).toBe(undefined);
    });

    it('should return root after union', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      expect(ds.find(1)).toBe(ds.find(2));
    });

    it('should perform path compression', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.union(1, 2);
      ds.union(3, 4);
      ds.union(1, 3);
      ds.union(1, 4);
      const root = ds.find(4);
      expect(ds.find(1)).toBe(root);
      expect(ds.find(2)).toBe(root);
      expect(ds.find(3)).toBe(root);
      expect(ds.find(4)).toBe(root);
    });

    it('should handle repeated find calls', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      ds.union(2, 3);
      const find1 = ds.find(1);
      const find2 = ds.find(2);
      const find3 = ds.find(3);
      expect(find1).toBe(find2);
      expect(find2).toBe(find3);
    });
  });

  describe('union', () => {
    it('should return true for successful union', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      const result = ds.union(1, 2);
      expect(result).toBe(true);
      expect(ds.connected(1, 2)).toBe(true);
    });

    it('should return false for non-existent elements', () => {
      expect(ds.union(1, 2)).toBe(false);
      expect(ds.size).toBe(0);
    });

    it('should return false when one element does not exist', () => {
      ds.makeSet(1);
      const result = ds.union(1, 2);
      expect(result).toBe(false);
      expect(ds.size).toBe(1);
    });

    it('should return false when elements already connected', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      const result = ds.union(1, 2);
      expect(result).toBe(false);
      expect(ds.componentCount()).toBe(1);
    });

    it('should use union by rank', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.union(1, 2);
      ds.union(3, 4);
      const root1 = ds.find(1);
      const root2 = ds.find(3);
      ds.union(1, 3);
      expect(ds.find(1)).toBe(ds.find(3));
    });

    it('should handle chaining multiple unions', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.makeSet(5);
      ds.union(1, 2);
      ds.union(2, 3);
      ds.union(3, 4);
      ds.union(4, 5);
      const root = ds.find(1);
      expect(ds.find(2)).toBe(root);
      expect(ds.find(3)).toBe(root);
      expect(ds.find(4)).toBe(root);
      expect(ds.find(5)).toBe(root);
      expect(ds.componentCount()).toBe(1);
    });

    it('should work with strings', () => {
      const strDs = new DisjointSet<string>();
      strDs.makeSet('a');
      strDs.makeSet('b');
      expect(strDs.union('a', 'b')).toBe(true);
      expect(strDs.connected('a', 'b')).toBe(true);
    });

    it('should union same element', () => {
      ds.makeSet(1);
      const result = ds.union(1, 1);
      expect(result).toBe(false);
      expect(ds.componentCount()).toBe(1);
    });
  });

  describe('connected', () => {
    it('should return false for non-existent elements', () => {
      expect(ds.connected(1, 2)).toBe(false);
    });

    it('should return false for elements in different sets', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      expect(ds.connected(1, 2)).toBe(false);
    });

    it('should return true for elements in same set', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      expect(ds.connected(1, 2)).toBe(true);
    });

    it('should return true for single element set', () => {
      ds.makeSet(1);
      expect(ds.connected(1, 1)).toBe(true);
    });

    it('should return false when one element does not exist', () => {
      ds.makeSet(1);
      expect(ds.connected(1, 2)).toBe(false);
    });

    it('should work with transitive connections', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      ds.union(2, 3);
      expect(ds.connected(1, 3)).toBe(true);
      expect(ds.connected(3, 1)).toBe(true);
    });
  });

  describe('has', () => {
    it('should return false for empty set', () => {
      expect(ds.has(1)).toBe(false);
    });

    it('should return true for existing element', () => {
      ds.makeSet(1);
      expect(ds.has(1)).toBe(true);
    });

    it('should return false for non-existent element', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      expect(ds.has(3)).toBe(false);
    });

    it('should return true after union', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      expect(ds.has(1)).toBe(true);
      expect(ds.has(2)).toBe(true);
    });

    it('should work with strings', () => {
      const strDs = new DisjointSet<string>();
      strDs.makeSet('a');
      expect(strDs.has('a')).toBe(true);
      expect(strDs.has('b')).toBe(false);
    });
  });

  describe('componentCount', () => {
    it('should return 0 for empty set', () => {
      expect(ds.componentCount()).toBe(0);
    });

    it('should return 1 for single element', () => {
      ds.makeSet(1);
      expect(ds.componentCount()).toBe(1);
    });

    it('should return correct count for multiple separate sets', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      expect(ds.componentCount()).toBe(3);
    });

    it('should decrease after unions', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      expect(ds.componentCount()).toBe(3);
      ds.union(1, 2);
      expect(ds.componentCount()).toBe(2);
      ds.union(1, 3);
      expect(ds.componentCount()).toBe(1);
    });

    it('should not decrease when union fails', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      const countBefore = ds.componentCount();
      ds.union(1, 2);
      ds.union(1, 2);
      expect(ds.componentCount()).toBe(countBefore - 1);
    });

    it('should return 1 after clearing', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      ds.clear();
      expect(ds.componentCount()).toBe(0);
    });
  });

  describe('getComponent', () => {
    it('should return empty array for non-existent element', () => {
      expect(ds.getComponent(1)).toEqual([]);
    });

    it('should return single element component', () => {
      ds.makeSet(1);
      expect(ds.getComponent(1)).toEqual([1]);
    });

    it('should return component after union', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      const component = ds.getComponent(1);
      expect(component).toContain(1);
      expect(component).toContain(2);
      expect(component).not.toContain(3);
    });

    it('should return all elements in component', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.union(1, 2);
      ds.union(3, 4);
      ds.union(1, 3);
      const component = ds.getComponent(1);
      expect(component.length).toBe(4);
      expect(component).toContain(1);
      expect(component).toContain(2);
      expect(component).toContain(3);
      expect(component).toContain(4);
    });

    it('should return same component for all members', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      ds.union(2, 3);
      const comp1 = ds.getComponent(1);
      const comp2 = ds.getComponent(2);
      const comp3 = ds.getComponent(3);
      expect(comp1).toEqual(comp2);
      expect(comp2).toEqual(comp3);
    });

    it('should work with strings', () => {
      const strDs = new DisjointSet<string>();
      strDs.makeSet('a');
      strDs.makeSet('b');
      strDs.union('a', 'b');
      expect(strDs.getComponent('a')).toEqual(['a', 'b']);
    });
  });

  describe('getAllComponents', () => {
    it('should return empty array for empty set', () => {
      expect(ds.getAllComponents()).toEqual([]);
    });

    it('should return single component array', () => {
      ds.makeSet(1);
      const components = ds.getAllComponents();
      expect(components.length).toBe(1);
      expect(components[0]).toEqual([1]);
    });

    it('should return multiple separate components', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      const components = ds.getAllComponents();
      expect(components.length).toBe(3);
      expect(components.some(comp => comp.includes(1))).toBe(true);
      expect(components.some(comp => comp.includes(2))).toBe(true);
      expect(components.some(comp => comp.includes(3))).toBe(true);
    });

    it('should return merged components after unions', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.union(1, 2);
      ds.union(3, 4);
      const components = ds.getAllComponents();
      expect(components.length).toBe(2);
      const compSizes = components.map(c => c.length).sort((a, b) => a - b);
      expect(compSizes).toEqual([2, 2]);
    });

    it('should return one component after full merge', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      ds.union(2, 3);
      const components = ds.getAllComponents();
      expect(components.length).toBe(1);
      expect(components[0].length).toBe(3);
    });

    it('should handle large number of components', () => {
      for (let i = 0; i < 10; i++) {
        ds.makeSet(i);
      }
      const components = ds.getAllComponents();
      expect(components.length).toBe(10);
    });
  });

  describe('getComponentSize', () => {
    it('should return 0 for non-existent element', () => {
      expect(ds.getComponentSize(1)).toBe(0);
    });

    it('should return 1 for single element', () => {
      ds.makeSet(1);
      expect(ds.getComponentSize(1)).toBe(1);
    });

    it('should return size after union', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      expect(ds.getComponentSize(1)).toBe(2);
      expect(ds.getComponentSize(2)).toBe(2);
      expect(ds.getComponentSize(3)).toBe(1);
    });

    it('should return same size for all component members', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.union(1, 2);
      ds.union(2, 3);
      ds.union(3, 4);
      const size1 = ds.getComponentSize(1);
      const size2 = ds.getComponentSize(2);
      const size3 = ds.getComponentSize(3);
      const size4 = ds.getComponentSize(4);
      expect(size1).toBe(size2);
      expect(size2).toBe(size3);
      expect(size3).toBe(size4);
      expect(size1).toBe(4);
    });

    it('should handle large component', () => {
      for (let i = 0; i < 10; i++) {
        ds.makeSet(i);
      }
      for (let i = 0; i < 9; i++) {
        ds.union(i, i + 1);
      }
      expect(ds.getComponentSize(0)).toBe(10);
      expect(ds.getComponentSize(9)).toBe(10);
    });
  });

  describe('getStats', () => {
    it('should return stats for empty set', () => {
      const stats = ds.getStats();
      expect(stats.elementCount).toBe(0);
      expect(stats.componentCount).toBe(0);
      expect(stats.maxComponentSize).toBe(0);
      expect(stats.minComponentSize).toBe(0);
      expect(stats.avgComponentSize).toBe(0);
    });

    it('should return stats for single element', () => {
      ds.makeSet(1);
      const stats = ds.getStats();
      expect(stats.elementCount).toBe(1);
      expect(stats.componentCount).toBe(1);
      expect(stats.maxComponentSize).toBe(1);
      expect(stats.minComponentSize).toBe(1);
      expect(stats.avgComponentSize).toBe(1);
    });

    it('should return stats for multiple separate sets', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      const stats = ds.getStats();
      expect(stats.elementCount).toBe(3);
      expect(stats.componentCount).toBe(3);
      expect(stats.maxComponentSize).toBe(1);
      expect(stats.minComponentSize).toBe(1);
      expect(stats.avgComponentSize).toBe(1);
    });

    it('should return stats for merged sets', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.union(1, 2);
      ds.union(3, 4);
      const stats = ds.getStats();
      expect(stats.elementCount).toBe(4);
      expect(stats.componentCount).toBe(2);
      expect(stats.maxComponentSize).toBe(2);
      expect(stats.minComponentSize).toBe(2);
      expect(stats.avgComponentSize).toBe(2);
    });

    it('should calculate correct averages', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.makeSet(5);
      ds.union(1, 2);
      ds.union(1, 3);
      const stats = ds.getStats();
      expect(stats.elementCount).toBe(5);
      expect(stats.componentCount).toBe(3);
      expect(stats.maxComponentSize).toBe(3);
      expect(stats.minComponentSize).toBe(1);
      expect(stats.avgComponentSize).toBe(5 / 3);
    });

    it('should handle mixed component sizes', () => {
      for (let i = 0; i < 10; i++) {
        ds.makeSet(i);
      }
      ds.union(0, 1);
      ds.union(2, 3);
      ds.union(4, 5);
      ds.union(6, 7);
      ds.union(8, 9);
      const stats = ds.getStats();
      expect(stats.elementCount).toBe(10);
      expect(stats.componentCount).toBe(5);
      expect(stats.maxComponentSize).toBe(2);
      expect(stats.minComponentSize).toBe(2);
      expect(stats.avgComponentSize).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear empty set', () => {
      ds.clear();
      expect(ds.size).toBe(0);
      expect(ds.isEmpty()).toBe(true);
      expect(ds.componentCount()).toBe(0);
    });

    it('should clear elements', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.clear();
      expect(ds.size).toBe(0);
      expect(ds.isEmpty()).toBe(true);
      expect(ds.has(1)).toBe(false);
      expect(ds.has(2)).toBe(false);
      expect(ds.has(3)).toBe(false);
    });

    it('should clear unions', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      ds.clear();
      expect(ds.connected(1, 2)).toBe(false);
      expect(ds.componentCount()).toBe(0);
    });

    it('should allow reuse after clear', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      ds.clear();
      ds.makeSet(10);
      ds.makeSet(20);
      ds.union(10, 20);
      expect(ds.size).toBe(2);
      expect(ds.connected(10, 20)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      expect(ds.toArray()).toEqual([]);
    });

    it('should return all elements', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      const result = ds.toArray();
      expect(result.length).toBe(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should not be affected by unions', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      const result = ds.toArray();
      expect(result.length).toBe(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should return new array', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      const arr1 = ds.toArray();
      const arr2 = ds.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should work with strings', () => {
      const strDs = new DisjointSet<string>();
      strDs.makeSet('a');
      strDs.makeSet('b');
      expect(strDs.toArray()).toEqual(['a', 'b']);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty set', () => {
      expect(ds.isEmpty()).toBe(true);
    });

    it('should return false after adding element', () => {
      ds.makeSet(1);
      expect(ds.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.clear();
      expect(ds.isEmpty()).toBe(true);
    });

    it('should return false for unioned elements', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      expect(ds.isEmpty()).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty set', () => {
      expect(ds.size).toBe(0);
    });

    it('should increment with makeSet', () => {
      expect(ds.size).toBe(0);
      ds.makeSet(1);
      expect(ds.size).toBe(1);
      ds.makeSet(2);
      expect(ds.size).toBe(2);
      ds.makeSet(3);
      expect(ds.size).toBe(3);
    });

    it('should not increment on duplicate makeSet', () => {
      ds.makeSet(1);
      const sizeBefore = ds.size;
      ds.makeSet(1);
      expect(ds.size).toBe(sizeBefore);
    });

    it('should stay same after union', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      const sizeBefore = ds.size;
      ds.union(1, 2);
      expect(ds.size).toBe(sizeBefore);
    });

    it('should be 0 after clear', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.clear();
      expect(ds.size).toBe(0);
    });
  });

  describe('clone', () => {
    it('should clone empty set', () => {
      const cloned = ds.clone();
      expect(cloned.size).toBe(0);
      expect(cloned.isEmpty()).toBe(true);
      expect(cloned === ds).toBe(false);
    });

    it('should clone with elements', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      const cloned = ds.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.has(1)).toBe(true);
      expect(cloned.has(2)).toBe(true);
      expect(cloned.has(3)).toBe(true);
    });

    it('should clone unions', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.union(1, 2);
      const cloned = ds.clone();
      expect(cloned.connected(1, 2)).toBe(true);
      expect(cloned.connected(2, 3)).toBe(false);
    });

    it('should create independent copy', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      const cloned = ds.clone();
      cloned.makeSet(3);
      cloned.union(1, 3);
      expect(ds.size).toBe(2);
      expect(cloned.size).toBe(3);
      expect(ds.connected(1, 3)).toBe(false);
      expect(cloned.connected(1, 3)).toBe(true);
    });

    it('should not affect original', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      const cloned = ds.clone();
      cloned.clear();
      expect(ds.size).toBe(2);
      expect(ds.has(1)).toBe(true);
      expect(ds.has(2)).toBe(true);
      expect(cloned.size).toBe(0);
    });

    it('should clone strings', () => {
      const strDs = new DisjointSet<string>();
      strDs.makeSet('a');
      strDs.makeSet('b');
      const cloned = strDs.clone();
      expect(cloned.has('a')).toBe(true);
      expect(cloned.has('b')).toBe(true);
    });
  });

  describe('from', () => {
    it('should create empty set from empty iterable', () => {
      const fromDs = DisjointSet.from<number>([]);
      expect(fromDs.size).toBe(0);
      expect(fromDs.isEmpty()).toBe(true);
    });

    it('should create set from array', () => {
      const fromDs = DisjointSet.from([1, 2, 3]);
      expect(fromDs.size).toBe(3);
      expect(fromDs.has(1)).toBe(true);
      expect(fromDs.has(2)).toBe(true);
      expect(fromDs.has(3)).toBe(true);
    });

    it('should handle duplicates in input', () => {
      const fromDs = DisjointSet.from([1, 2, 2, 3, 1]);
      expect(fromDs.size).toBe(3);
      expect(fromDs.has(1)).toBe(true);
      expect(fromDs.has(2)).toBe(true);
      expect(fromDs.has(3)).toBe(true);
    });

    it('should create separate components', () => {
      const fromDs = DisjointSet.from([1, 2, 3]);
      expect(fromDs.componentCount()).toBe(3);
      expect(fromDs.connected(1, 2)).toBe(false);
      expect(fromDs.connected(2, 3)).toBe(false);
    });

    it('should work with strings', () => {
      const fromDs = DisjointSet.from(['a', 'b', 'c']);
      expect(fromDs.size).toBe(3);
      expect(fromDs.has('a')).toBe(true);
      expect(fromDs.has('b')).toBe(true);
      expect(fromDs.has('c')).toBe(true);
    });

    it('should work with Set', () => {
      const inputSet = new Set([1, 2, 3]);
      const fromDs = DisjointSet.from(inputSet);
      expect(fromDs.size).toBe(3);
      expect(fromDs.has(1)).toBe(true);
      expect(fromDs.has(2)).toBe(true);
      expect(fromDs.has(3)).toBe(true);
    });

    it('should work with generator', () => {
      function* generate() {
        yield 1;
        yield 2;
        yield 3;
      }
      const fromDs = DisjointSet.from(generate());
      expect(fromDs.size).toBe(3);
      expect(fromDs.has(1)).toBe(true);
      expect(fromDs.has(2)).toBe(true);
      expect(fromDs.has(3)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      ds.makeSet(1);
      expect(ds.find(1)).toBe(1);
      expect(ds.connected(1, 1)).toBe(true);
      expect(ds.getComponent(1)).toEqual([1]);
      expect(ds.getComponentSize(1)).toBe(1);
    });

    it('should handle large number of elements', () => {
      const count = 1000;
      for (let i = 0; i < count; i++) {
        ds.makeSet(i);
      }
      expect(ds.size).toBe(count);
      expect(ds.componentCount()).toBe(count);
    });

    it('should handle large unions', () => {
      const count = 100;
      for (let i = 0; i < count; i++) {
        ds.makeSet(i);
      }
      for (let i = 0; i < count - 1; i++) {
        ds.union(i, i + 1);
      }
      expect(ds.componentCount()).toBe(1);
      expect(ds.getComponentSize(0)).toBe(count);
    });

    it('should handle self-union', () => {
      ds.makeSet(1);
      const result = ds.union(1, 1);
      expect(result).toBe(false);
      expect(ds.componentCount()).toBe(1);
    });

    it('should handle find on non-existent after operations', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.union(1, 2);
      expect(ds.find(3)).toBe(undefined);
    });

    it('should handle complex union chains', () => {
      ds.makeSet(1);
      ds.makeSet(2);
      ds.makeSet(3);
      ds.makeSet(4);
      ds.makeSet(5);
      ds.makeSet(6);
      ds.union(1, 3);
      ds.union(2, 4);
      ds.union(5, 6);
      ds.union(1, 2);
      ds.union(5, 1);
      const root = ds.find(1);
      expect(ds.find(6)).toBe(root);
      expect(ds.componentCount()).toBe(1);
    });
  });
});
