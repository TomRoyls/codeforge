import { describe, it, expect, beforeEach } from "vitest";
import { AABTree } from "../src/core/aab-tree/index";

describe("AABTree", () => {
  let tree: AABTree<number>;

  beforeEach(() => {
    tree = new AABTree<number>();
  });

  describe("empty tree", () => {
    it("should have size 0 when empty", () => {
      expect(tree.size()).toBe(0);
    });

    it("should be empty when created", () => {
      expect(tree.isEmpty()).toBe(true);
    });

    it("should return undefined for min when empty", () => {
      expect(tree.min()).toBeUndefined();
    });

    it("should return undefined for max when empty", () => {
      expect(tree.max()).toBeUndefined();
    });

    it("should return empty array for inOrderTraversal", () => {
      expect(tree.inOrderTraversal()).toEqual([]);
    });

    it("should return empty array for toArray", () => {
      expect(tree.toArray()).toEqual([]);
    });

    it("should return height 0 when empty", () => {
      expect(tree.getHeight()).toBe(0);
    });

    it("should return false for contains when empty", () => {
      expect(tree.contains(5)).toBe(false);
    });

    it("should return false for search when empty", () => {
      expect(tree.search(5)).toBe(false);
    });

    it("should return correct time complexity", () => {
      expect(tree.getTimeComplexity()).toBe("O(log n)");
    });
  });

  describe("insert and search", () => {
    it("should insert a single value", () => {
      tree.insert(5);
      expect(tree.size()).toBe(1);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.contains(5)).toBe(true);
    });

    it("should insert multiple values", () => {
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.size()).toBe(4);
      expect(tree.contains(7)).toBe(true);
      expect(tree.contains(1)).toBe(true);
      expect(tree.contains(9)).toBe(true);
    });

    it("should search for existing values", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(3)).toBe(true);
      expect(tree.search(7)).toBe(true);
    });

    it("should search for non-existing values", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(1)).toBe(false);
      expect(tree.search(9)).toBe(false);
      expect(tree.search(0)).toBe(false);
    });

    it("should handle insertion of same value", () => {
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size()).toBe(3);
      expect(tree.contains(5)).toBe(true);
    });
  });

  describe("delete", () => {
    it("should delete a leaf node", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      const deleted = tree.delete(3);
      expect(deleted).toBe(true);
      expect(tree.size()).toBe(2);
      expect(tree.contains(3)).toBe(false);
    });

    it("should delete a node with one child", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(6);
      const deleted = tree.delete(7);
      expect(deleted).toBe(true);
      expect(tree.size()).toBe(3);
      expect(tree.contains(7)).toBe(false);
      expect(tree.contains(6)).toBe(true);
    });

    it("should delete a node with two children", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(6);
      tree.insert(8);
      const deleted = tree.delete(7);
      expect(deleted).toBe(true);
      expect(tree.size()).toBe(4);
      expect(tree.contains(7)).toBe(false);
      expect(tree.contains(6)).toBe(true);
      expect(tree.contains(8)).toBe(true);
    });

    it("should delete the root when it has no children", () => {
      tree.insert(5);
      const deleted = tree.delete(5);
      expect(deleted).toBe(true);
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("should return false when deleting non-existent value", () => {
      tree.insert(5);
      const deleted = tree.delete(10);
      expect(deleted).toBe(false);
      expect(tree.size()).toBe(1);
    });

    it("should handle deleting all values", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(5);
      tree.delete(3);
      tree.delete(7);
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("should delete duplicate values", () => {
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size()).toBe(3);

      tree.delete(5);
      expect(tree.size()).toBe(2);
      tree.delete(5);
      expect(tree.size()).toBe(1);
      tree.delete(5);
      expect(tree.size()).toBe(0);
    });
  });

  describe("min and max", () => {
    it("should return minimum value", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.min()).toBe(1);
    });

    it("should return maximum value", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.max()).toBe(9);
    });

    it("should update min after deletion", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      tree.delete(1);
      expect(tree.min()).toBe(3);
    });

    it("should update max after deletion", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      tree.delete(9);
      expect(tree.max()).toBe(7);
    });
  });

  describe("traversals", () => {
    it("should return empty array for empty tree inOrderTraversal", () => {
      expect(tree.inOrderTraversal()).toEqual([]);
    });

    it("should return sorted values for inOrderTraversal", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.inOrderTraversal()).toEqual([1, 3, 5, 7, 9]);
    });

    it("should handle single node traversal", () => {
      tree.insert(5);
      expect(tree.inOrderTraversal()).toEqual([5]);
    });

    it("should handle duplicate values in traversal", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(5);
      tree.insert(7);
      tree.insert(5);
      const result = tree.inOrderTraversal();
      expect(result.length).toBe(5);
      expect(result.filter((v) => v === 5).length).toBe(3);
    });
  });

  describe("balance", () => {
    it("should maintain balance with sequential insertions", () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      const height = tree.getHeight();
      expect(height).toBeLessThan(20);
    });

    it("should maintain balance with reverse insertions", () => {
      for (let i = 100; i >= 0; i--) {
        tree.insert(i);
      }
      const height = tree.getHeight();
      expect(height).toBeLessThan(20);
    });

    it("should maintain balance with random insertions", () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(Math.floor(Math.random() * 1000));
      }
      const height = tree.getHeight();
      expect(height).toBeLessThan(30);
    });

    it("should maintain balance after deletions", () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 50; i++) {
        tree.delete(i);
      }
      const height = tree.getHeight();
      expect(height).toBeLessThan(20);
    });
  });

  describe("custom comparator", () => {
    it("should work with custom string comparator", () => {
      const stringTree = new AABTree<string>((a, b) => {
        return a.localeCompare(b);
      });
      stringTree.insert("banana");
      stringTree.insert("apple");
      stringTree.insert("cherry");
      expect(stringTree.contains("apple")).toBe(true);
      expect(stringTree.contains("banana")).toBe(true);
      expect(stringTree.contains("cherry")).toBe(true);
    });

    it("should work with reverse comparator", () => {
      const reverseTree = new AABTree<number>((a, b) => b - a);
      reverseTree.insert(5);
      reverseTree.insert(3);
      reverseTree.insert(7);
      expect(reverseTree.inOrderTraversal()).toEqual([7, 5, 3]);
    });

    it("should work with object comparator", () => {
      interface Person {
        id: number;
        name: string;
      }
      const personTree = new AABTree<Person>((a, b) => a.id - b.id);
      personTree.insert({ id: 3, name: "Alice" });
      personTree.insert({ id: 1, name: "Bob" });
      personTree.insert({ id: 2, name: "Charlie" });
      expect(personTree.contains({ id: 1, name: "Bob" })).toBe(true);
      expect(personTree.contains({ id: 3, name: "Alice" })).toBe(true);
    });
  });

  describe("duplicates", () => {
    it("should handle multiple duplicate values", () => {
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size()).toBe(5);
      expect(tree.inOrderTraversal()).toEqual([5, 5, 5, 5, 5]);
    });

    it("should delete duplicates correctly", () => {
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      tree.delete(5);
      expect(tree.size()).toBe(2);
      tree.delete(5);
      expect(tree.size()).toBe(1);
      tree.delete(5);
      expect(tree.size()).toBe(0);
    });
  });

  describe("large datasets", () => {
    it("should handle 1000 insertions", () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.size()).toBe(1000);
      expect(tree.getHeight()).toBeLessThan(20);
    });

    it("should handle 1000 insertions and deletions", () => {
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 500; i++) {
        tree.delete(i);
      }
      expect(tree.size()).toBe(500);
      expect(tree.getHeight()).toBeLessThan(15);
    });

    it("should maintain sorted order with large dataset", () => {
      const values: number[] = [];
      for (let i = 0; i < 500; i++) {
        const value = Math.floor(Math.random() * 1000);
        values.push(value);
        tree.insert(value);
      }
      const sortedValues = [...values].sort((a, b) => a - b);
      expect(tree.inOrderTraversal()).toEqual(sortedValues);
    });
  });

  describe("clear", () => {
    it("should clear tree with values", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.clear();
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.inOrderTraversal()).toEqual([]);
      expect(tree.min()).toBeUndefined();
      expect(tree.max()).toBeUndefined();
    });

    it("should clear empty tree", () => {
      tree.clear();
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("should allow insertions after clear", () => {
      tree.insert(5);
      tree.insert(3);
      tree.clear();
      tree.insert(7);
      tree.insert(9);
      expect(tree.size()).toBe(2);
      expect(tree.contains(7)).toBe(true);
      expect(tree.contains(9)).toBe(true);
    });
  });

  describe("toArray", () => {
    it("should return empty array for empty tree", () => {
      expect(tree.toArray()).toEqual([]);
    });

    it("should return all values in sorted order", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it("should match inOrderTraversal output", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.toArray()).toEqual(tree.inOrderTraversal());
    });
  });

  describe("getHeight", () => {
    it("should return 0 for empty tree", () => {
      expect(tree.getHeight()).toBe(0);
    });

    it("should return 1 for single node", () => {
      tree.insert(5);
      expect(tree.getHeight()).toBe(1);
    });

    it("should return correct height for balanced tree", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.getHeight()).toBe(2);
    });

    it("should update height after insertion", () => {
      tree.insert(5);
      expect(tree.getHeight()).toBe(1);
      tree.insert(3);
      expect(tree.getHeight()).toBe(2);
      tree.insert(7);
      expect(tree.getHeight()).toBe(2);
      tree.insert(1);
      expect(tree.getHeight()).toBe(3);
    });

    it("should update height after deletion", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      const initialHeight = tree.getHeight();
      tree.delete(9);
      const afterDeletionHeight = tree.getHeight();
      expect(afterDeletionHeight).toBeLessThanOrEqual(initialHeight);
    });
  });

  describe("size", () => {
    it("should return correct size after insertions", () => {
      expect(tree.size()).toBe(0);
      tree.insert(5);
      expect(tree.size()).toBe(1);
      tree.insert(3);
      expect(tree.size()).toBe(2);
      tree.insert(7);
      expect(tree.size()).toBe(3);
    });

    it("should return correct size after deletions", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      expect(tree.size()).toBe(4);
      tree.delete(7);
      expect(tree.size()).toBe(3);
      tree.delete(1);
      expect(tree.size()).toBe(2);
    });

    it("should return 0 after clear", () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.size()).toBe(3);
      tree.clear();
      expect(tree.size()).toBe(0);
    });
  });
});
