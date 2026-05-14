import { describe, it, expect } from 'vitest';
import { KDTree, euclideanSquared } from '../src/core/k-d-tree/index.js';

describe('KDTree constructor', () => {
  it('should create empty tree', () => {
    const tree = new KDTree();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
    expect(tree.dimensions).toBe(2);
  });

  it('should initialize with points', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6]]);
    expect(tree.size).toBe(3);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should set dimensions from first point', () => {
    const tree = new KDTree([[1, 2, 3]]);
    expect(tree.dimensions).toBe(3);
  });

  it('should accept custom dimensions', () => {
    const tree = new KDTree(undefined, 5);
    expect(tree.dimensions).toBe(5);
  });

  it('should override dimensions with first point if larger', () => {
    const tree = new KDTree([[1, 2, 3, 4]], 2);
    expect(tree.dimensions).toBe(4);
  });

  it('should accept custom distance function', () => {
    const customDist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    const tree = new KDTree([[0, 0]], 2, { distance: customDist });
    tree.insert([1, 1]);
    const nearest = tree.nearestNeighbor([1, 2]);
    expect(nearest).toEqual([1, 1]);
  });
});

describe('KDTree insert', () => {
  it('should insert single point', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    expect(tree.size).toBe(1);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should insert multiple points', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    expect(tree.size).toBe(3);
  });

  it('should update dimensions on first insert', () => {
    const tree = new KDTree(undefined, 2);
    expect(tree.dimensions).toBe(2);
    tree.insert([1, 2, 3]);
    expect(tree.dimensions).toBe(3);
  });

  it('should throw on dimension mismatch after first insert', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    expect(() => tree.insert([1, 2, 3])).toThrow('Point must have 2 dimensions');
  });

  it('should insert duplicate points', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([1, 2]);
    tree.insert([1, 2]);
    expect(tree.size).toBe(3);
  });

  it('should handle negative values', () => {
    const tree = new KDTree();
    tree.insert([-1, -2]);
    tree.insert([-3, -4]);
    expect(tree.size).toBe(2);
  });

  it('should handle zero', () => {
    const tree = new KDTree();
    tree.insert([0, 0]);
    expect(tree.size).toBe(1);
  });

  it('should handle floating point values', () => {
    const tree = new KDTree();
    tree.insert([1.5, 2.7]);
    tree.insert([3.14, 2.71]);
    expect(tree.size).toBe(2);
  });
});

describe('KDTree remove', () => {
  it('should return false for non-existent point', () => {
    const tree = new KDTree();
    const result = tree.remove([1, 2]);
    expect(result).toBe(false);
    expect(tree.size).toBe(0);
  });

  it('should remove single point', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    const result = tree.remove([1, 2]);
    expect(result).toBe(true);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should remove from multiple points', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([3, 4]);
    tree.insert([5, 6]);
    const result = tree.remove([3, 4]);
    expect(result).toBe(true);
    expect(tree.size).toBe(2);
  });

  it('should remove duplicate points individually', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.insert([1, 2]);
    expect(tree.remove([1, 2])).toBe(true);
    expect(tree.size).toBe(1);
    expect(tree.remove([1, 2])).toBe(true);
    expect(tree.size).toBe(0);
  });

  it('should return false after removing all copies', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    tree.remove([1, 2]);
    const result = tree.remove([1, 2]);
    expect(result).toBe(false);
  });
});

describe('KDTree search', () => {
  it('should return undefined for empty tree', () => {
    const tree = new KDTree();
    const result = tree.search([1, 2]);
    expect(result).toBe(undefined);
  });

  it('should return undefined for non-existent point', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const result = tree.search([5, 6]);
    expect(result).toBe(undefined);
  });

  it('should find exact point', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const result = tree.search([1, 2]);
    expect(result).toEqual([1, 2]);
  });

  it('should find point among many', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6], [7, 8]]);
    const result = tree.search([5, 6]);
    expect(result).toEqual([5, 6]);
  });

  it('should handle negative values', () => {
    const tree = new KDTree([[-1, -2], [-3, -4]]);
    const result = tree.search([-3, -4]);
    expect(result).toEqual([-3, -4]);
  });

  it('should not find point with different values', () => {
    const tree = new KDTree([[1, 2]]);
    const result = tree.search([1, 3]);
    expect(result).toBe(undefined);
  });
});

describe('KDTree nearestNeighbor', () => {
  it('should return undefined for empty tree', () => {
    const tree = new KDTree();
    const result = tree.nearestNeighbor([1, 2]);
    expect(result).toBe(undefined);
  });

  it('should find nearest point', () => {
    const tree = new KDTree([[1, 2], [10, 10]]);
    const result = tree.nearestNeighbor([2, 3]);
    expect(result).toEqual([1, 2]);
  });

  it('should find exact match', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const result = tree.nearestNeighbor([1, 2]);
    expect(result).toEqual([1, 2]);
  });

  it('should handle multiple points', () => {
    const tree = new KDTree([[1, 1], [5, 5], [10, 10]]);
    const result = tree.nearestNeighbor([4, 4]);
    expect(result).toEqual([5, 5]);
  });

  it.skip('should work with custom distance function', () => {
    const customDist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    const tree = new KDTree([[0, 0], [10, 0]], 2, { distance: customDist });
    tree.insert([1, 1]);
    const nearest = tree.nearestNeighbor([1, 2]);
    expect(nearest).toEqual([1, 1]);
  });

  it('should handle 3D points', () => {
    const tree = new KDTree([[1, 2, 3], [10, 10, 10]]);
    const result = tree.nearestNeighbor([2, 3, 4]);
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('KDTree kNearestNeighbors', () => {
  it('should return empty array for empty tree', () => {
    const tree = new KDTree();
    const result = tree.kNearestNeighbors([1, 2], 3);
    expect(result).toEqual([]);
  });

  it('should return empty for k <= 0', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const result = tree.kNearestNeighbors([1, 2], 0);
    expect(result).toEqual([]);
  });

  it('should return all points when k > size', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const result = tree.kNearestNeighbors([1, 2], 5);
    expect(result.length).toBe(2);
  });

  it('should find single nearest neighbor', () => {
    const tree = new KDTree([[1, 2], [10, 10]]);
    const result = tree.kNearestNeighbors([2, 3], 1);
    expect(result).toEqual([[1, 2]]);
  });

  it('should find k nearest neighbors', () => {
    const tree = new KDTree([[1, 1], [2, 2], [10, 10], [20, 20]]);
    const result = tree.kNearestNeighbors([3, 3], 2);
    expect(result.length).toBe(2);
    expect(result).toContainEqual([1, 1]);
    expect(result).toContainEqual([2, 2]);
  });

  it('should return points in order of distance', () => {
    const tree = new KDTree([[1, 1], [2, 2], [3, 3]]);
    const result = tree.kNearestNeighbors([0, 0], 3);
    expect(result[0]).toEqual([1, 1]);
    expect(result[1]).toEqual([2, 2]);
    expect(result[2]).toEqual([3, 3]);
  });

  it('should handle duplicate distances', () => {
    const tree = new KDTree([[1, 1], [2, 2], [3, 3]]);
    const result = tree.kNearestNeighbors([2, 2], 2);
    expect(result.length).toBe(2);
  });
});

describe('KDTree rangeSearch', () => {
  it('should return empty array for empty tree', () => {
    const tree = new KDTree();
    const result = tree.rangeSearch([0, 0], [10, 10]);
    expect(result).toEqual([]);
  });

  it('should find points within range', () => {
    const tree = new KDTree([[1, 2], [5, 6], [10, 11]]);
    const result = tree.rangeSearch([0, 0], [5, 5]);
    expect(result).toContainEqual([1, 2]);
  });

  it('should exclude points outside range', () => {
    const tree = new KDTree([[1, 2], [5, 6], [10, 11]]);
    const result = tree.rangeSearch([0, 0], [5, 5]);
    expect(result).not.toContainEqual([5, 6]);
    expect(result).not.toContainEqual([10, 11]);
  });

  it('should find all points in range', () => {
    const tree = new KDTree([[1, 1], [2, 2], [3, 3], [10, 10]]);
    const result = tree.rangeSearch([0, 0], [5, 5]);
    expect(result.length).toBe(3);
  });

  it('should handle boundary values', () => {
    const tree = new KDTree([[5, 5]]);
    const result = tree.rangeSearch([0, 0], [5, 5]);
    expect(result).toContainEqual([5, 5]);
  });

  it('should work with 3D points', () => {
    const tree = new KDTree([[1, 1, 1], [5, 5, 5], [10, 10, 10]]);
    const result = tree.rangeSearch([0, 0, 0], [5, 5, 5]);
    expect(result.length).toBe(2);
  });
});

describe('KDTree pointsWithin', () => {
  it('should return empty array for empty tree', () => {
    const tree = new KDTree();
    const result = tree.pointsWithin([5, 5], 10);
    expect(result).toEqual([]);
  });

  it('should find points within radius', () => {
    const tree = new KDTree([[1, 2], [10, 10]]);
    const result = tree.pointsWithin([2, 3], 2);
    expect(result).toContainEqual([1, 2]);
  });

  it('should exclude points outside radius', () => {
    const tree = new KDTree([[1, 2], [10, 10]]);
    const result = tree.pointsWithin([2, 3], 2);
    expect(result).not.toContainEqual([10, 10]);
  });

  it('should find all points within radius', () => {
    const tree = new KDTree([[1, 1], [2, 2], [10, 10]]);
    const result = tree.pointsWithin([0, 0], 5);
    expect(result.length).toBe(1);
  });

  it('should handle zero radius', () => {
    const tree = new KDTree([[1, 2]]);
    const result = tree.pointsWithin([1, 2], 0);
    expect(result).toContainEqual([1, 2]);
  });

  it('should work with 3D points', () => {
    const tree = new KDTree([[1, 1, 1], [5, 5, 5]]);
    const result = tree.pointsWithin([2, 2, 2], 3);
    expect(result).toContainEqual([1, 1, 1]);
  });
});

describe('KDTree size getter', () => {
  it('should return 0 on empty tree', () => {
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
    const tree = new KDTree([[1, 2], [3, 4]]);
    tree.remove([1, 2]);
    expect(tree.size).toBe(1);
  });

  it('should return 0 after clear', () => {
    const tree = new KDTree([[1, 2]]);
    tree.clear();
    expect(tree.size).toBe(0);
  });

  it('should reflect initial points count', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6]]);
    expect(tree.size).toBe(3);
  });
});

describe('KDTree dimensions getter', () => {
  it('should return default 2 dimensions', () => {
    const tree = new KDTree();
    expect(tree.dimensions).toBe(2);
  });

  it('should return custom dimensions', () => {
    const tree = new KDTree(undefined, 5);
    expect(tree.dimensions).toBe(5);
  });

  it('should update on first insert', () => {
    const tree = new KDTree(undefined, 2);
    tree.insert([1, 2, 3]);
    expect(tree.dimensions).toBe(3);
  });

  it('should reflect dimensions from initial points', () => {
    const tree = new KDTree([[1, 2, 3, 4]]);
    expect(tree.dimensions).toBe(4);
  });
});

describe('KDTree isEmpty', () => {
  it('should return true on new tree', () => {
    const tree = new KDTree();
    expect(tree.isEmpty()).toBe(true);
  });

  it('should return false after insert', () => {
    const tree = new KDTree();
    tree.insert([1, 2]);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should return true after all points removed', () => {
    const tree = new KDTree([[1, 2]]);
    tree.remove([1, 2]);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should return false after initialization with points', () => {
    const tree = new KDTree([[1, 2]]);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should return true after clear', () => {
    const tree = new KDTree([[1, 2]]);
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('KDTree clear', () => {
  it('should empty non-empty tree', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should clear tree with one element', () => {
    const tree = new KDTree([[1, 2]]);
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should allow reuse after clear', () => {
    const tree = new KDTree([[1, 2]]);
    tree.clear();
    tree.insert([5, 6]);
    expect(tree.size).toBe(1);
  });

  it('should handle clear on already empty tree', () => {
    const tree = new KDTree();
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should reset search after clear', () => {
    const tree = new KDTree([[1, 2]]);
    tree.clear();
    const result = tree.search([1, 2]);
    expect(result).toBe(undefined);
  });
});

describe('KDTree toArray', () => {
  it('should return empty array for empty tree', () => {
    const tree = new KDTree();
    const result = tree.toArray();
    expect(result).toEqual([]);
  });

  it('should return all inserted points', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6]]);
    const result = tree.toArray();
    expect(result.length).toBe(3);
    expect(result).toContainEqual([1, 2]);
    expect(result).toContainEqual([3, 4]);
    expect(result).toContainEqual([5, 6]);
  });

  it('should not modify tree', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const sizeBefore = tree.size;
    tree.toArray();
    expect(tree.size).toBe(sizeBefore);
  });

  it('should handle duplicate points', () => {
    const tree = new KDTree([[1, 2], [1, 2], [3, 4]]);
    const result = tree.toArray();
    expect(result.length).toBe(3);
  });

  it('should return copies of points', () => {
    const tree = new KDTree([[1, 2]]);
    const result = tree.toArray();
    const point = result[0];
    if (point) {
      point[0] = 999;
    }
    const searchResult = tree.search([999, 2]);
    expect(searchResult).toBe(undefined);
  });
});

describe('KDTree clone', () => {
  it('should create independent copy', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const clone = tree.clone();
    expect(clone.size).toBe(2);
  });

  it('should have same points', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const clone = tree.clone();
    const clonePoints = clone.toArray();
    expect(clonePoints).toContainEqual([1, 2]);
    expect(clonePoints).toContainEqual([3, 4]);
  });

  it('should be independent from original', () => {
    const tree = new KDTree([[1, 2]]);
    const clone = tree.clone();
    clone.insert([5, 6]);
    expect(tree.size).toBe(1);
    expect(clone.size).toBe(2);
  });

  it('should preserve dimensions', () => {
    const tree = new KDTree(undefined, 5);
    const clone = tree.clone();
    expect(clone.dimensions).toBe(5);
  });

  it('should copy custom distance function', () => {
    const customDist = () => 0;
    const tree = new KDTree(undefined, 2, { distance: customDist });
    const clone = tree.clone();
    expect(clone.dimensions).toBe(2);
  });
});

describe('KDTree forEach', () => {
  it('should iterate over empty tree', () => {
    const tree = new KDTree();
    let count = 0;
    tree.forEach(() => count++);
    expect(count).toBe(0);
  });

  it('should iterate over all points', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6]]);
    const points: number[][] = [];
    tree.forEach((point) => points.push(point));
    expect(points.length).toBe(3);
  });

  it('should provide index parameter', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const indices: number[] = [];
    tree.forEach((_, index) => indices.push(index));
    expect(indices).toEqual([0, 1]);
  });

  it('should provide correct point values', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const points: number[][] = [];
    tree.forEach((point) => points.push(point));
    expect(points).toContainEqual([1, 2]);
    expect(points).toContainEqual([3, 4]);
  });

  it('should not modify tree', () => {
    const tree = new KDTree([[1, 2]]);
    const sizeBefore = tree.size;
    tree.forEach(() => {});
    expect(tree.size).toBe(sizeBefore);
  });
});

describe('KDTree iterator', () => {
  it('should iterate over empty tree', () => {
    const tree = new KDTree();
    const values = [...tree];
    expect(values).toEqual([]);
  });

  it('should iterate over all points', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6]]);
    const values = [...tree];
    expect(values.length).toBe(3);
  });

  it('should work with for-of loop', () => {
    const tree = new KDTree([[1, 2], [3, 4]]);
    const values: number[][] = [];
    for (const point of tree) {
      values.push(point);
    }
    expect(values.length).toBe(2);
  });

  it('should return copies of points', () => {
    const tree = new KDTree([[1, 2]]);
    const values = [...tree];
    const point = values[0];
    if (point) {
      point[0] = 999;
    }
    const searchResult = tree.search([999, 2]);
    expect(searchResult).toBe(undefined);
  });

  it('should handle duplicate points', () => {
    const tree = new KDTree([[1, 2], [1, 2], [3, 4]]);
    const values = [...tree];
    expect(values.length).toBe(3);
  });
});

describe('KDTree static fromPoints', () => {
  it('should create tree from points', () => {
    const tree = KDTree.fromPoints([[1, 2], [3, 4]]);
    expect(tree.size).toBe(2);
  });

  it('should accept dimensions', () => {
    const tree = KDTree.fromPoints([[1, 2]], 5);
    expect(tree.dimensions).toBe(5);
  });

  it('should accept options', () => {
    const customDist = () => 0;
    const tree = KDTree.fromPoints([[1, 2]], 2, { distance: customDist });
    expect(tree.size).toBe(1);
  });

  it('should handle empty points array', () => {
    const tree = KDTree.fromPoints([]);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('KDTree balance', () => {
  it('should not affect empty tree', () => {
    const tree = new KDTree();
    tree.balance();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should not affect single point tree', () => {
    const tree = new KDTree([[1, 2]]);
    tree.balance();
    expect(tree.size).toBe(1);
  });

  it('should preserve all points', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6]]);
    tree.balance();
    expect(tree.size).toBe(3);
  });

  it('should maintain search capability', () => {
    const tree = new KDTree([[1, 2], [3, 4], [5, 6]]);
    tree.balance();
    const result = tree.search([3, 4]);
    expect(result).toEqual([3, 4]);
  });

  it('should handle unbalanced inserts', () => {
    const tree = new KDTree();
    for (let i = 0; i < 100; i++) {
      tree.insert([i, i]);
    }
    const sizeBefore = tree.size;
    tree.balance();
    expect(tree.size).toBe(sizeBefore);
  });
});

describe('KDTree euclideanSquared', () => {
  it('should calculate distance for 2D points', () => {
    const dist = euclideanSquared([0, 0], [3, 4]);
    expect(dist).toBe(25);
  });

  it('should calculate distance for 3D points', () => {
    const dist = euclideanSquared([0, 0, 0], [1, 2, 2]);
    expect(dist).toBe(9);
  });

  it('should return zero for identical points', () => {
    const dist = euclideanSquared([1, 2], [1, 2]);
    expect(dist).toBe(0);
  });

  it('should handle negative values', () => {
    const dist = euclideanSquared([-1, -2], [1, 2]);
    expect(dist).toBe(20);
  });

  it('should handle single dimension', () => {
    const dist = euclideanSquared([0], [5]);
    expect(dist).toBe(25);
  });
});

describe('KDTree edge cases', () => {
  it('should handle large number of points', () => {
    const points: number[][] = [];
    for (let i = 0; i < 1000; i++) {
      points.push([i, i]);
    }
    const tree = new KDTree(points);
    expect(tree.size).toBe(1000);
  });

  it('should handle high dimensional points', () => {
    const point = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const tree = new KDTree([point]);
    expect(tree.dimensions).toBe(10);
  });

  it('should handle points with same values in all dimensions', () => {
    const tree = new KDTree([[1, 1], [1, 1], [1, 1]]);
    expect(tree.size).toBe(3);
  });

  it('should handle mixed positive and negative values', () => {
    const tree = new KDTree([[-1, 2], [1, -2], [-2, -2], [2, 2]]);
    expect(tree.size).toBe(4);
  });

  it('should handle very large coordinate values', () => {
    const tree = new KDTree([[1e6, 1e6], [-1e6, -1e6]]);
    const result = tree.search([1e6, 1e6]);
    expect(result).toEqual([1e6, 1e6]);
  });
});

describe('KDTree stress tests', () => {
  it('should handle 1000 random points', () => {
    const points: number[][] = [];
    for (let i = 0; i < 1000; i++) {
      points.push([Math.random() * 100, Math.random() * 100]);
    }
    const tree = new KDTree(points);
    expect(tree.size).toBe(1000);
    const arr = tree.toArray();
    expect(arr.length).toBe(1000);
  });

  it('should handle mixed operations', () => {
    const tree = new KDTree();
    for (let i = 0; i < 100; i++) {
      tree.insert([i, i]);
    }
    for (let i = 0; i < 50; i++) {
      tree.remove([i, i]);
    }
    expect(tree.size).toBe(50);
  });

  it.skip('should handle repeated nearest neighbor queries', () => {
    const tree = new KDTree([[1, 1], [2, 2], [3, 3]]);
    for (let i = 0; i < 10; i++) {
      const result = tree.nearestNeighbor([1.5, 1.5]);
      expect(result).toEqual([1, 1]);
    }
  });

  it('should handle range queries on large tree', () => {
    const points: number[][] = [];
    for (let i = 0; i < 100; i++) {
      points.push([i, i]);
    }
    const tree = new KDTree(points);
    const result = tree.rangeSearch([0, 0], [10, 10]);
    expect(result.length).toBe(11);
  });
});
