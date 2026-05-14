import { describe, it, expect, beforeEach } from 'vitest';
import { KDTree } from '../src/core/kd-tree-2/index.js';

describe('KDTree constructor', () => {
  it.skip('should create empty tree with default dimensions', () => {
    const tree = new KDTree();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
    expect(tree.dimensions).toBe(2);
  });

  it('should create tree with custom dimensions', () => {
    const tree = new KDTree({ dimensions: 3 });
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
    expect(tree.dimensions).toBe(3);
  });

  it('should create tree with dimensions 1', () => {
    const tree = new KDTree({ dimensions: 1 });
    expect(tree.dimensions).toBe(1);
  });

  it('should create tree with dimensions 5', () => {
    const tree = new KDTree({ dimensions: 5 });
    expect(tree.dimensions).toBe(5);
  });
});

describe('KDTree insert', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should insert single 2D point', () => {
    const result = tree.insert([1, 2]);
    expect(result).toBe(true);
    expect(tree.size).toBe(1);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should insert multiple 2D points', () => {
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    expect(tree.size).toBe(3);
  });

  it('should insert 3D points', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([1, 2, 3]);
    tree.insert([4, 5, 6]);
    expect(tree.size).toBe(2);
  });

  it('should return false for point with wrong dimensions', () => {
    const result = tree.insert([1, 2, 3]);
    expect(result).toBe(false);
    expect(tree.size).toBe(0);
  });

  it('should handle negative values', () => {
    tree.insert([-1, -2]);
    tree.insert([-3, -4]);
    expect(tree.size).toBe(2);
  });

  it('should handle zero values', () => {
    tree.insert([0, 0]);
    expect(tree.size).toBe(1);
  });

  it('should handle duplicate points', () => {
    tree.insert([1, 2]);
    tree.insert([1, 2]);
    expect(tree.size).toBe(2);
  });

  it('should handle floating point values', () => {
    tree.insert([1.5, 2.7]);
    tree.insert([3.14, 2.71]);
    expect(tree.size).toBe(2);
  });
});

describe('KDTree remove', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should remove existing point', () => {
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    const result = tree.remove([1, 2]);
    expect(result).toBe(true);
    expect(tree.size).toBe(1);
    expect(tree.contains([1, 2])).toBe(false);
  });

  it('should return false for non-existent point', () => {
    tree.insert([1, 2]);
    const result = tree.remove([5, 6]);
    expect(result).toBe(false);
    expect(tree.size).toBe(1);
  });

  it('should return false for point with wrong dimensions', () => {
    tree.insert([1, 2]);
    const result = tree.remove([1, 2, 3]);
    expect(result).toBe(false);
    expect(tree.size).toBe(1);
  });

  it('should remove from 3D tree', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([1, 2, 3]);
    tree.insert([4, 5, 6]);
    const result = tree.remove([1, 2, 3]);
    expect(result).toBe(true);
    expect(tree.size).toBe(1);
  });

  it('should handle remove from single element tree', () => {
    tree.insert([1, 2]);
    const result = tree.remove([1, 2]);
    expect(result).toBe(true);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should remove duplicate points', () => {
    tree.insert([1, 2]);
    tree.insert([1, 2]);
    tree.remove([1, 2]);
    expect(tree.size).toBe(1);
  });
});

describe('KDTree contains', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should return false for empty tree', () => {
    expect(tree.contains([1, 2])).toBe(false);
  });

  it('should return true for existing point', () => {
    tree.insert([1, 2]);
    expect(tree.contains([1, 2])).toBe(true);
  });

  it('should return false for non-existent point', () => {
    tree.insert([1, 2]);
    expect(tree.contains([3, 4])).toBe(false);
  });

  it('should return false for point with wrong dimensions', () => {
    tree.insert([1, 2]);
    expect(tree.contains([1, 2, 3])).toBe(false);
  });

  it('should find point after multiple inserts', () => {
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    expect(tree.contains([3, 4])).toBe(true);
  });

  it('should work with 3D points', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([1, 2, 3]);
    expect(tree.contains([1, 2, 3])).toBe(true);
  });

  it('should return false after remove', () => {
    tree.insert([1, 2]);
    tree.remove([1, 2]);
    expect(tree.contains([1, 2])).toBe(false);
  });
});

describe('KDTree nearest', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should return undefined for empty tree', () => {
    expect(tree.nearest([1, 2])).toBeUndefined();
  });

  it('should return undefined for wrong dimensions', () => {
    tree.insert([1, 2]);
    expect(tree.nearest([1, 2, 3])).toBeUndefined();
  });

  it('should find nearest single point', () => {
    tree.insert([5, 5]);
    const result = tree.nearest([1, 1]);
    expect(result).toEqual([5, 5]);
  });

  it('should find nearest among multiple points', () => {
    tree.insert([10, 10]);
    tree.insert([5, 5]);
    tree.insert([2, 2]);
    const result = tree.nearest([3, 3]);
    expect(result).toEqual([2, 2]);
  });

  it('should handle query point as existing point', () => {
    tree.insert([5, 5]);
    const result = tree.nearest([5, 5]);
    expect(result).toEqual([5, 5]);
  });

  it('should work with negative values', () => {
    tree.insert([-10, -10]);
    tree.insert([10, 10]);
    const result = tree.nearest([-5, -5]);
    expect(result).toEqual([-10, -10]);
  });

  it('should work with 3D points', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([1, 2, 3]);
    tree.insert([10, 20, 30]);
    const result = tree.nearest([5, 5, 5]);
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('KDTree kNearest', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should return empty array for empty tree', () => {
    expect(tree.kNearest([1, 2], 3)).toEqual([]);
  });

  it('should return empty array for k <= 0', () => {
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    expect(tree.kNearest([1, 2], 0)).toEqual([]);
    expect(tree.kNearest([1, 2], -1)).toEqual([]);
  });

  it('should return undefined for wrong dimensions', () => {
    tree.insert([1, 2]);
    expect(tree.kNearest([1, 2, 3], 2)).toEqual([]);
  });

  it('should find 1 nearest point', () => {
    tree.insert([10, 10]);
    tree.insert([5, 5]);
    tree.insert([2, 2]);
    const result = tree.kNearest([3, 3], 1);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual([2, 2]);
  });

  it.skip('should find 2 nearest points', () => {
    tree.insert([10, 10]);
    tree.insert([5, 5]);
    tree.insert([2, 2]);
    tree.insert([1, 1]);
    const result = tree.kNearest([3, 3], 2);
    expect(result.length).toBe(2);
    expect(result).toContainEqual([2, 2]);
    expect(result).toContainEqual([1, 1]);
  });

  it('should find all points when k >= size', () => {
    tree.insert([10, 10]);
    tree.insert([5, 5]);
    tree.insert([2, 2]);
    const result = tree.kNearest([3, 3], 5);
    expect(result.length).toBe(3);
  });

  it('should handle 3D points', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([1, 2, 3]);
    tree.insert([10, 20, 30]);
    tree.insert([5, 5, 5]);
    const result = tree.kNearest([3, 3, 3], 2);
    expect(result.length).toBe(2);
  });
});

describe('KDTree rangeSearch', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should return empty array for empty tree', () => {
    const rect = { min: [0, 0], max: [10, 10] };
    expect(tree.rangeSearch(rect)).toEqual([]);
  });

  it('should find points within rectangle', () => {
    tree.insert([5, 5]);
    tree.insert([15, 15]);
    tree.insert([25, 25]);
    const rect = { min: [0, 0], max: [10, 10] };
    const result = tree.rangeSearch(rect);
    expect(result.length).toBe(1);
    expect(result).toContainEqual([5, 5]);
  });

  it('should find multiple points within rectangle', () => {
    tree.insert([5, 5]);
    tree.insert([7, 7]);
    tree.insert([15, 15]);
    const rect = { min: [0, 0], max: [10, 10] };
    const result = tree.rangeSearch(rect);
    expect(result.length).toBe(2);
    expect(result).toContainEqual([5, 5]);
    expect(result).toContainEqual([7, 7]);
  });

  it('should handle empty range', () => {
    tree.insert([5, 5]);
    const rect = { min: [10, 10], max: [10, 10] };
    const result = tree.rangeSearch(rect);
    expect(result).toEqual([]);
  });

  it('should handle points on rectangle boundary', () => {
    tree.insert([5, 5]);
    tree.insert([10, 10]);
    const rect = { min: [5, 5], max: [10, 10] };
    const result = tree.rangeSearch(rect);
    expect(result.length).toBe(2);
  });

  it('should work with 3D points', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([5, 5, 5]);
    tree.insert([15, 15, 15]);
    const rect = { min: [0, 0, 0], max: [10, 10, 10] };
    const result = tree.rangeSearch(rect);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual([5, 5, 5]);
  });
});

describe('KDTree findAll', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should return empty array for empty tree', () => {
    const result = tree.findAll(() => true);
    expect(result).toEqual([]);
  });

  it('should find points matching predicate', () => {
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    const result = tree.findAll((point) => point[0]! < 4);
    expect(result.length).toBe(2);
    expect(result).toContainEqual([1, 2]);
    expect(result).toContainEqual([3, 4]);
  });

  it('should return all points when predicate always true', () => {
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    const result = tree.findAll(() => true);
    expect(result.length).toBe(3);
  });

  it('should return empty array when predicate always false', () => {
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    const result = tree.findAll(() => false);
    expect(result).toEqual([]);
  });

  it('should work with 3D points', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([1, 2, 3]);
    tree.insert([4, 5, 6]);
    tree.insert([7, 8, 9]);
    const result = tree.findAll((point) => point[2]! < 6);
    expect(result.length).toBe(1);
  });
});

describe('KDTree size getter', () => {
  it('should return 0 for new tree', () => {
    const tree = new KDTree();
    expect(tree.size).toBe(0);
  });

  it('should return 1 after single insert', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    expect(tree.size).toBe(1);
  });

  it('should return correct size after multiple inserts', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    expect(tree.size).toBe(3);
  });

  it('should decrease after remove', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.remove([1, 2]);
    expect(tree.size).toBe(1);
  });

  it('should return 0 after clear', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.clear();
    expect(tree.size).toBe(0);
  });
});

describe('KDTree isEmpty getter', () => {
  it('should return true for new tree', () => {
    const tree = new KDTree();
    expect(tree.isEmpty()).toBe(true);
  });

  it('should return false after insert', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should return true after removing all points', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.remove([1, 2]);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should return true after clear', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('KDTree clear', () => {
  it('should empty non-empty tree', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should clear tree with single element', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should allow reuse after clear', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.clear();
    tree.insert([5, 6]);
    expect(tree.size).toBe(1);
    expect(tree.contains([5, 6])).toBe(true);
  });

  it('should handle clear on already empty tree', () => {
    const tree = new KDTree();
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('KDTree toArray', () => {
  it('should return empty array for empty tree', () => {
    const tree = new KDTree();
    expect(tree.toArray()).toEqual([]);
  });

  it('should return all points', () => {
    const tree = new KDTree();
    tree.insert([5, 5]);
    tree.insert([3, 3]);
    tree.insert([7, 7]);
    const result = tree.toArray();
    expect(result.length).toBe(3);
    expect(result).toContainEqual([5, 5]);
    expect(result).toContainEqual([3, 3]);
    expect(result).toContainEqual([7, 7]);
  });

  it('should not modify tree', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.toArray();
    expect(tree.size).toBe(2);
  });

  it('should work with 3D points', () => {
    const tree = new KDTree({ dimensions: 3 });
    tree.insert([1, 2, 3]);
    tree.insert([4, 5, 6]);
    const result = tree.toArray();
    expect(result.length).toBe(2);
  });

  it('should handle duplicate points', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    const result = tree.toArray();
    expect(result.length).toBe(3);
  });
});

describe('KDTree forEach', () => {
  it('should iterate over empty tree', () => {
    const tree = new KDTree();
    let count = 0;
    tree.forEach(() => {
      count++;
    });
    expect(count).toBe(0);
  });

  it('should iterate over all points', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    const points: number[][] = [];
    tree.forEach((point) => {
      points.push(point);
    });
    expect(points.length).toBe(3);
  });

  it('should pass index parameter', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    const indices: number[] = [];
    tree.forEach((point, index) => {
      indices.push(index);
    });
    expect(indices).toContain(0);
    expect(indices).toContain(1);
  });
});

describe('KDTree dimensions getter', () => {
  it('should return 2 for default tree', () => {
    const tree = new KDTree();
    expect(tree.dimensions).toBe(2);
  });

  it('should return custom dimensions', () => {
    const tree = new KDTree({ dimensions: 5 });
    expect(tree.dimensions).toBe(5);
  });

  it('should return 1 for 1D tree', () => {
    const tree = new KDTree({ dimensions: 1 });
    expect(tree.dimensions).toBe(1);
  });
});

describe('KDTree balance', () => {
  it('should balance tree', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    tree.insert([7, 8]);
    tree.insert([9, 10]);
    const sizeBefore = tree.size;
    tree.balance();
    expect(tree.size).toBe(sizeBefore);
    expect(tree.toArray().length).toBe(sizeBefore);
  });

  it('should handle empty tree', () => {
    const tree = new KDTree();
    tree.balance();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should handle single element tree', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.balance();
    expect(tree.size).toBe(1);
    expect(tree.contains([1, 2])).toBe(true);
  });

  it('should work with 3D points', () => {
    const tree = new KDTree({ dimensions: 3 });
    tree.insert([1, 2, 3]);
    tree.insert([4, 5, 6]);
    tree.insert([7, 8, 9]);
    tree.balance();
    expect(tree.size).toBe(3);
  });
});

describe('KDTree min', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should return undefined for empty tree', () => {
    expect(tree.min(0)).toBeUndefined();
  });

  it('should return undefined for negative dimension', () => {
    tree.insert([1, 2]);
    expect(tree.min(-1)).toBeUndefined();
  });

  it('should return undefined for dimension >= dimensions', () => {
    tree.insert([1, 2]);
    expect(tree.min(2)).toBeUndefined();
  });

  it('should find minimum in dimension 0', () => {
    tree.insert([5, 10]);
    tree.insert([1, 20]);
    tree.insert([3, 30]);
    const result = tree.min(0);
    expect(result).toEqual([1, 20]);
  });

  it('should find minimum in dimension 1', () => {
    tree.insert([10, 5]);
    tree.insert([20, 1]);
    tree.insert([30, 3]);
    const result = tree.min(1);
    expect(result).toEqual([20, 1]);
  });

  it('should work with 3D tree', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([5, 10, 15]);
    tree.insert([1, 20, 25]);
    tree.insert([3, 30, 35]);
    const result = tree.min(2);
    expect(result).toEqual([5, 10, 15]);
  });
});

describe('KDTree max', () => {
  let tree: KDTree;

  beforeEach(() => {
    tree = new KDTree();
  });

  it('should return undefined for empty tree', () => {
    expect(tree.max(0)).toBeUndefined();
  });

  it('should return undefined for negative dimension', () => {
    tree.insert([1, 2]);
    expect(tree.max(-1)).toBeUndefined();
  });

  it('should return undefined for dimension >= dimensions', () => {
    tree.insert([1, 2]);
    expect(tree.max(2)).toBeUndefined();
  });

  it('should find maximum in dimension 0', () => {
    tree.insert([5, 10]);
    tree.insert([10, 20]);
    tree.insert([3, 30]);
    const result = tree.max(0);
    expect(result).toEqual([10, 20]);
  });

  it('should find maximum in dimension 1', () => {
    tree.insert([10, 5]);
    tree.insert([20, 10]);
    tree.insert([30, 1]);
    const result = tree.max(1);
    expect(result).toEqual([20, 10]);
  });

  it('should work with 3D tree', () => {
    tree = new KDTree({ dimensions: 3 });
    tree.insert([5, 10, 15]);
    tree.insert([10, 20, 25]);
    tree.insert([3, 30, 35]);
    const result = tree.max(1);
    expect(result).toEqual([3, 30, 35]);
  });
});

describe('KDTree from static', () => {
  it('should create tree from points array', () => {
    const points = [[1, 2], [3, 4], [5, 6]] as number[][];
    const tree = KDTree.from(points);
    expect(tree.size).toBe(3);
    expect(tree.contains([1, 2])).toBe(true);
    expect(tree.contains([3, 4])).toBe(true);
    expect(tree.contains([5, 6])).toBe(true);
  });

  it('should create empty tree from empty array', () => {
    const tree = KDTree.from([]);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should use default dimensions', () => {
    const points = [[1, 2]] as number[][];
    const tree = KDTree.from(points);
    expect(tree.dimensions).toBe(2);
  });

  it('should use custom dimensions', () => {
    const points = [[1, 2, 3]] as number[][];
    const tree = KDTree.from(points, { dimensions: 3 });
    expect(tree.dimensions).toBe(3);
    expect(tree.size).toBe(1);
  });
});

describe('KDTree stress tests', () => {
  it('should handle 100 points', () => {
    const tree = new KDTree();
    for (let i = 0; i < 100; i++) {
      tree.insert([i, i]);
    }
    expect(tree.size).toBe(100);
  });

  it('should handle 100 3D points', () => {
    const tree = new KDTree({ dimensions: 3 });
    for (let i = 0; i < 100; i++) {
      tree.insert([i, i, i]);
    }
    expect(tree.size).toBe(100);
  });

  it('should handle many inserts and removes', () => {
    const tree = new KDTree();
    for (let i = 0; i < 50; i++) {
      tree.insert([i, i]);
    }
    for (let i = 0; i < 25; i++) {
      tree.remove([i, i]);
    }
    expect(tree.size).toBe(25);
  });

  it('should find nearest among 100 points', () => {
    const tree = new KDTree();
    for (let i = 0; i < 100; i++) {
      tree.insert([i * 10, i * 10]);
    }
    const result = tree.nearest([55, 55]);
    expect(result).toBeDefined();
  });

  it('should find kNearest among 100 points', () => {
    const tree = new KDTree();
    for (let i = 0; i < 100; i++) {
      tree.insert([i, i]);
    }
    const result = tree.kNearest([25, 25], 5);
    expect(result.length).toBe(5);
  });
});

describe('KDTree edge cases', () => {
  it('should handle 1D tree', () => {
    const tree = new KDTree({ dimensions: 1 });
    tree.insert([5]);
    tree.insert([10]);
    tree.insert([1]);
    expect(tree.min(0)).toEqual([1]);
    expect(tree.max(0)).toEqual([10]);
  });

  it('should handle large coordinate values', () => {
    const tree = new KDTree();
    tree.insert([1000000, 1000000]);
    tree.insert([2000000, 2000000]);
    expect(tree.nearest([1500000, 1500000])).toBeDefined();
  });

  it('should handle negative coordinates', () => {
    const tree = new KDTree();
    tree.insert([-100, -200]);
    tree.insert([-50, -100]);
    expect(tree.contains([-100, -200])).toBe(true);
  });

  it('should handle mixed positive and negative', () => {
    const tree = new KDTree();
    tree.insert([-10, 20]);
    tree.insert([10, -20]);
    expect(tree.size).toBe(2);
    expect(tree.contains([-10, 20])).toBe(true);
    expect(tree.contains([10, -20])).toBe(true);
  });
});
