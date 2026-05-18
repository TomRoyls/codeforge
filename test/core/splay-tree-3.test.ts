import { describe, it, expect } from "vitest";
import { SplayTree3 } from "../../src/core/splay-tree-3/index.js";

// ─── Constructor ───

describe("SplayTree3 constructor", () => {
  it("creates an empty tree with default comparator", () => {
    const tree = new SplayTree3<number>();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it("creates a tree with a custom comparator", () => {
    const tree = new SplayTree3<string>((a, b) => a.localeCompare(b));
    tree.insert("banana");
    tree.insert("apple");
    tree.insert("cherry");
    expect(tree.toArray()).toEqual(["apple", "banana", "cherry"]);
  });
});

// ─── insert ───

describe("SplayTree3 insert", () => {
  it("inserts a single element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    expect(tree.size).toBe(1);
    expect(tree.isEmpty()).toBe(false);
  });

  it("inserts multiple elements in order", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);
    tree.insert(5);
    expect(tree.size).toBe(5);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it("inserts elements in reverse order", () => {
    const tree = new SplayTree3<number>();
    tree.insert(5);
    tree.insert(4);
    tree.insert(3);
    tree.insert(2);
    tree.insert(1);
    expect(tree.size).toBe(5);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it("ignores duplicate insertions", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(1);
    tree.insert(1);
    expect(tree.size).toBe(1);
  });

  it("inserts negative numbers", () => {
    const tree = new SplayTree3<number>();
    tree.insert(-5);
    tree.insert(-1);
    tree.insert(0);
    tree.insert(3);
    expect(tree.toArray()).toEqual([-5, -1, 0, 3]);
  });

  it("handles out-of-order insertions", () => {
    const tree = new SplayTree3<number>();
    tree.insert(5);
    tree.insert(2);
    tree.insert(8);
    tree.insert(1);
    tree.insert(3);
    expect(tree.toArray()).toEqual([1, 2, 3, 5, 8]);
  });
});

// ─── search / contains ───

describe("SplayTree3 search and contains", () => {
  it("finds an inserted element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(42);
    expect(tree.search(42)).toBe(true);
  });

  it("returns false for missing element on empty tree", () => {
    const tree = new SplayTree3<number>();
    expect(tree.search(1)).toBe(false);
  });

  it("returns false for missing element on non-empty tree", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.search(4)).toBe(false);
  });

  it("contains is alias for search", () => {
    const tree = new SplayTree3<number>();
    tree.insert(10);
    expect(tree.contains(10)).toBe(true);
    expect(tree.contains(20)).toBe(false);
  });

  it("finds elements after multiple operations", () => {
    const tree = new SplayTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.search(5);
    expect(tree.search(3)).toBe(true);
    expect(tree.search(7)).toBe(true);
    expect(tree.search(5)).toBe(true);
  });
});

// ─── remove ───

describe("SplayTree3 remove", () => {
  it("removes the only element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    expect(tree.remove(1)).toBe(true);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it("returns false for missing element", () => {
    const tree = new SplayTree3<number>();
    expect(tree.remove(1)).toBe(false);
  });

  it("returns false for element not in tree", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    expect(tree.remove(3)).toBe(false);
    expect(tree.size).toBe(2);
  });

  it("removes from middle of tree", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.remove(2)).toBe(true);
    expect(tree.toArray()).toEqual([1, 3]);
    expect(tree.size).toBe(2);
  });

  it("removes root element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.remove(1)).toBe(true);
    expect(tree.toArray()).toEqual([2, 3]);
  });

  it("removes last element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.remove(3)).toBe(true);
    expect(tree.toArray()).toEqual([1, 2]);
  });

  it("removes all elements one by one", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.remove(2);
    tree.remove(1);
    tree.remove(3);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });
});

// ─── min / max ───

describe("SplayTree3 min and max", () => {
  it("returns undefined on empty tree", () => {
    const tree = new SplayTree3<number>();
    expect(tree.min()).toBeUndefined();
    expect(tree.max()).toBeUndefined();
  });

  it("returns the only element for single-element tree", () => {
    const tree = new SplayTree3<number>();
    tree.insert(42);
    expect(tree.min()).toBe(42);
    expect(tree.max()).toBe(42);
  });

  it("returns correct min and max", () => {
    const tree = new SplayTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    tree.insert(9);
    expect(tree.min()).toBe(1);
    expect(tree.max()).toBe(9);
  });

  it("works with negative numbers", () => {
    const tree = new SplayTree3<number>();
    tree.insert(-10);
    tree.insert(-5);
    tree.insert(5);
    tree.insert(10);
    expect(tree.min()).toBe(-10);
    expect(tree.max()).toBe(10);
  });
});

// ─── size / isEmpty / clear ───

describe("SplayTree3 size, isEmpty, and clear", () => {
  it("tracks size correctly", () => {
    const tree = new SplayTree3<number>();
    expect(tree.size).toBe(0);
    tree.insert(1);
    expect(tree.size).toBe(1);
    tree.insert(2);
    expect(tree.size).toBe(2);
  });

  it("isEmpty reflects tree state", () => {
    const tree = new SplayTree3<number>();
    expect(tree.isEmpty()).toBe(true);
    tree.insert(1);
    expect(tree.isEmpty()).toBe(false);
  });

  it("clear empties the tree", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
    expect(tree.toArray()).toEqual([]);
  });

  it("allows insertions after clear", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.clear();
    tree.insert(2);
    expect(tree.size).toBe(1);
    expect(tree.search(2)).toBe(true);
  });
});

// ─── toArray / forEach ───

describe("SplayTree3 toArray and forEach", () => {
  it("toArray returns empty array for empty tree", () => {
    const tree = new SplayTree3<number>();
    expect(tree.toArray()).toEqual([]);
  });

  it("toArray returns sorted elements", () => {
    const tree = new SplayTree3<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(2);
    expect(tree.toArray()).toEqual([1, 2, 3]);
  });

  it("forEach visits elements in order", () => {
    const tree = new SplayTree3<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(2);
    const collected: number[] = [];
    tree.forEach((v) => collected.push(v));
    expect(collected).toEqual([1, 2, 3]);
  });

  it("forEach on empty tree does nothing", () => {
    const tree = new SplayTree3<number>();
    const collected: number[] = [];
    tree.forEach((v) => collected.push(v));
    expect(collected).toEqual([]);
  });
});

// ─── predecessor / successor ───

describe("SplayTree3 predecessor and successor", () => {
  it("predecessor returns undefined for missing value", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.predecessor(4)).toBeUndefined();
  });

  it("predecessor returns undefined for min element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.predecessor(1)).toBeUndefined();
  });

  it("predecessor returns previous element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.predecessor(2)).toBe(1);
    expect(tree.predecessor(3)).toBe(2);
  });

  it("successor returns undefined for missing value", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.successor(4)).toBeUndefined();
  });

  it("successor returns undefined for max element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.successor(3)).toBeUndefined();
  });

  it("successor returns next element", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.successor(1)).toBe(2);
    expect(tree.successor(2)).toBe(3);
  });
});

// ─── rangeSearch ───

describe("SplayTree3 rangeSearch", () => {
  it("returns empty array for empty tree", () => {
    const tree = new SplayTree3<number>();
    expect(tree.rangeSearch(1, 5)).toEqual([]);
  });

  it("returns elements within range", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);
    tree.insert(5);
    expect(tree.rangeSearch(2, 4)).toEqual([2, 3, 4]);
  });

  it("returns single element range", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.rangeSearch(2, 2)).toEqual([2]);
  });

  it("returns empty for range outside tree", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.rangeSearch(10, 20)).toEqual([]);
  });

  it("includes boundary elements", () => {
    const tree = new SplayTree3<number>();
    tree.insert(1);
    tree.insert(5);
    tree.insert(10);
    expect(tree.rangeSearch(1, 10)).toEqual([1, 5, 10]);
  });
});
