import { describe, it, expect } from "vitest";
import { GrowOnlySet } from "../../src/core/grow-only-set/grow-only-set.js";

describe("GrowOnlySet", () => {
  describe("construction", () => {
    it("constructs with default options", () => {
      const set = new GrowOnlySet<number>();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it("constructs with custom id", () => {
      const set = new GrowOnlySet<number>({ id: "node-1" });
      expect(set.getId()).toBe("node-1");
    });

    it("constructs with undefined options", () => {
      const set = new GrowOnlySet<number>(undefined);
      expect(set.size).toBe(0);
      expect(set.getId()).toBeUndefined();
    });

    it("constructs without options", () => {
      const set = new GrowOnlySet<string>();
      expect(set.getId()).toBeUndefined();
    });

    it("constructs with empty id", () => {
      const set = new GrowOnlySet<string>({ id: "" });
      expect(set.getId()).toBe("");
    });

    it("starts with zero statistics", () => {
      const set = new GrowOnlySet<number>();
      const stats = set.getStatistics();
      expect(stats.adds).toBe(0);
      expect(stats.merges).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe("add and has", () => {
    it("adds a single element", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      expect(set.has(1)).toBe(true);
    });

    it("adds multiple elements", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(3)).toBe(true);
    });

    it("returns false for non-existent element", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      expect(set.has(99)).toBe(false);
    });

    it("adding duplicate is a no-op for membership", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(1);
      expect(set.size).toBe(1);
    });

    it("duplicate add still increments add counter", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(1);
      expect(set.getStatistics().adds).toBe(2);
    });

    it("works with string elements", () => {
      const set = new GrowOnlySet<string>();
      set.add("hello");
      set.add("world");
      expect(set.has("hello")).toBe(true);
      expect(set.has("world")).toBe(true);
      expect(set.has("foo")).toBe(false);
    });

    it("works with object elements", () => {
      const set = new GrowOnlySet<{ x: number }>();
      const obj = { x: 1 };
      set.add(obj);
      expect(set.has(obj)).toBe(true);
    });

    it("distinguishes different object references", () => {
      const set = new GrowOnlySet<{ x: number }>();
      const obj1 = { x: 1 };
      const obj2 = { x: 1 };
      set.add(obj1);
      expect(set.has(obj1)).toBe(true);
      expect(set.has(obj2)).toBe(false);
    });

    it("works with null", () => {
      const set = new GrowOnlySet<null>();
      set.add(null);
      expect(set.has(null)).toBe(true);
    });

    it("works with undefined", () => {
      const set = new GrowOnlySet<undefined>();
      set.add(undefined);
      expect(set.has(undefined)).toBe(true);
    });

    it("works with boolean values", () => {
      const set = new GrowOnlySet<boolean>();
      set.add(true);
      set.add(false);
      expect(set.has(true)).toBe(true);
      expect(set.has(false)).toBe(true);
      expect(set.size).toBe(2);
    });

    it("works with zero", () => {
      const set = new GrowOnlySet<number>();
      set.add(0);
      expect(set.has(0)).toBe(true);
      expect(set.size).toBe(1);
    });

    it("works with empty string", () => {
      const set = new GrowOnlySet<string>();
      set.add("");
      expect(set.has("")).toBe(true);
      expect(set.size).toBe(1);
    });

    it("tracks adds in statistics", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.getStatistics().adds).toBe(3);
    });
  });

  describe("size and isEmpty", () => {
    it("returns 0 for empty set", () => {
      const set = new GrowOnlySet<number>();
      expect(set.size).toBe(0);
    });

    it("returns correct size after adds", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.size).toBe(3);
    });

    it("size does not increase for duplicates", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(1);
      set.add(1);
      expect(set.size).toBe(1);
    });

    it("isEmpty returns true for new set", () => {
      const set = new GrowOnlySet<number>();
      expect(set.isEmpty()).toBe(true);
    });

    it("isEmpty returns false after add", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      expect(set.isEmpty()).toBe(false);
    });
  });

  describe("clear", () => {
    it("clears all elements", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.clear();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it("clear on empty set is a no-op", () => {
      const set = new GrowOnlySet<number>();
      set.clear();
      expect(set.size).toBe(0);
    });

    it("can add after clear", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.clear();
      set.add(2);
      expect(set.has(2)).toBe(true);
      expect(set.has(1)).toBe(false);
    });

    it("statistics adds persist after clear", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.clear();
      expect(set.getStatistics().adds).toBe(2);
      expect(set.getStatistics().size).toBe(0);
    });
  });

  describe("values, toArray, forEach, iterator", () => {
    it("values() returns all elements", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      const vals = Array.from(set.values());
      expect(vals.sort()).toEqual([1, 2, 3]);
    });

    it("values() on empty set returns empty iterator", () => {
      const set = new GrowOnlySet<number>();
      const vals = Array.from(set.values());
      expect(vals).toEqual([]);
    });

    it("toArray() returns array of elements", () => {
      const set = new GrowOnlySet<number>();
      set.add(10);
      set.add(20);
      const arr = set.toArray();
      expect(arr.sort()).toEqual([10, 20]);
    });

    it("toArray() returns empty array for empty set", () => {
      const set = new GrowOnlySet<number>();
      expect(set.toArray()).toEqual([]);
    });

    it("toArray() returns independent copy", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      const arr = set.toArray();
      arr.push(2);
      expect(set.size).toBe(1);
    });

    it("forEach iterates all elements", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      const collected: number[] = [];
      set.forEach((v) => collected.push(v));
      expect(collected.sort()).toEqual([1, 2, 3]);
    });

    it("forEach provides value twice and set as third arg", () => {
      const set = new GrowOnlySet<string>();
      set.add("a");
      set.forEach((v, v2, s) => {
        expect(v).toBe("a");
        expect(v2).toBe("a");
        expect(s).toBeInstanceOf(Set);
      });
    });

    it("Symbol.iterator works", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      const collected: number[] = [];
      for (const v of set) {
        collected.push(v);
      }
      expect(collected.sort()).toEqual([1, 2]);
    });

    it("Symbol.iterator on empty set yields nothing", () => {
      const set = new GrowOnlySet<number>();
      const collected: number[] = [];
      for (const v of set) {
        collected.push(v);
      }
      expect(collected).toEqual([]);
    });

    it("spread operator works via iterator", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      const arr = [...set];
      expect(arr.sort()).toEqual([1, 2]);
    });
  });

  describe("merge", () => {
    it("merges two non-overlapping sets", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(3);
      b.add(4);
      const merged = a.merge(b);
      expect(merged.has(1)).toBe(true);
      expect(merged.has(2)).toBe(true);
      expect(merged.has(3)).toBe(true);
      expect(merged.has(4)).toBe(true);
      expect(merged.size).toBe(4);
    });

    it("merges overlapping sets (deduplicates)", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(3);
      const merged = a.merge(b);
      expect(merged.size).toBe(3);
      expect(merged.has(1)).toBe(true);
      expect(merged.has(2)).toBe(true);
      expect(merged.has(3)).toBe(true);
    });

    it("merge does not modify original sets", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(2);
      const merged = a.merge(b);
      expect(a.size).toBe(1);
      expect(b.size).toBe(1);
      expect(merged.size).toBe(2);
    });

    it("merge with empty set returns copy", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      const merged = a.merge(b);
      expect(merged.size).toBe(2);
      expect(merged.has(1)).toBe(true);
      expect(merged.has(2)).toBe(true);
    });

    it("empty set merged with non-empty returns copy", () => {
      const a = new GrowOnlySet<number>();
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      const merged = a.merge(b);
      expect(merged.size).toBe(2);
    });

    it("merge of two empty sets is empty", () => {
      const a = new GrowOnlySet<number>();
      const b = new GrowOnlySet<number>();
      const merged = a.merge(b);
      expect(merged.isEmpty()).toBe(true);
    });

    it("merge is commutative: merge(A,B) === merge(B,A)", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(3);
      const ab = a.merge(b);
      const ba = b.merge(a);
      expect(ab.equals(ba)).toBe(true);
    });

    it("merge is associative: merge(merge(A,B),C) === merge(A,merge(B,C))", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(2);
      const c = new GrowOnlySet<number>();
      c.add(3);
      const ab_c = a.merge(b).merge(c);
      const a_bc = a.merge(b.merge(c));
      expect(ab_c.equals(a_bc)).toBe(true);
    });

    it("merge is idempotent: merge(A,A) equals A", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const merged = a.merge(a);
      expect(merged.equals(a)).toBe(true);
      expect(merged.size).toBe(a.size);
    });

    it("merge tracks merge count", () => {
      const a = new GrowOnlySet<number>();
      const b = new GrowOnlySet<number>();
      const merged = a.merge(b);
      expect(merged.getStatistics().merges).toBe(1);
    });

    it("merge accumulates adds from both sets", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(3);
      const merged = a.merge(b);
      expect(merged.getStatistics().adds).toBe(3);
    });

    it("merge with identical sets produces same set", () => {
      const a = new GrowOnlySet<string>();
      a.add("x");
      a.add("y");
      const b = new GrowOnlySet<string>();
      b.add("x");
      b.add("y");
      const merged = a.merge(b);
      expect(merged.size).toBe(2);
      expect(merged.has("x")).toBe(true);
      expect(merged.has("y")).toBe(true);
    });

    it("merge preserves id from caller", () => {
      const a = new GrowOnlySet<number>({ id: "a" });
      a.add(1);
      const b = new GrowOnlySet<number>({ id: "b" });
      b.add(2);
      const merged = a.merge(b);
      expect(merged.getId()).toBe("a");
    });
  });

  describe("equals", () => {
    it("empty sets are equal", () => {
      const a = new GrowOnlySet<number>();
      const b = new GrowOnlySet<number>();
      expect(a.equals(b)).toBe(true);
    });

    it("identical sets are equal", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      expect(a.equals(b)).toBe(true);
    });

    it("different sized sets are not equal", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      expect(a.equals(b)).toBe(false);
    });

    it("same size different elements are not equal", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(3);
      b.add(4);
      expect(a.equals(b)).toBe(false);
    });

    it("partially overlapping sets are not equal", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(3);
      expect(a.equals(b)).toBe(false);
    });

    it("set equals itself", () => {
      const a = new GrowOnlySet<number>();
      a.add(42);
      expect(a.equals(a)).toBe(true);
    });
  });

  describe("isSubsetOf", () => {
    it("empty set is subset of any set", () => {
      const a = new GrowOnlySet<number>();
      const b = new GrowOnlySet<number>();
      b.add(1);
      expect(a.isSubsetOf(b)).toBe(true);
    });

    it("empty set is subset of empty set", () => {
      const a = new GrowOnlySet<number>();
      const b = new GrowOnlySet<number>();
      expect(a.isSubsetOf(b)).toBe(true);
    });

    it("set is subset of itself", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      expect(a.isSubsetOf(a)).toBe(true);
    });

    it("proper subset", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      expect(a.isSubsetOf(b)).toBe(true);
    });

    it("not a subset when extra elements", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      a.add(3);
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      expect(a.isSubsetOf(b)).toBe(false);
    });

    it("disjoint sets are not subsets", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(2);
      expect(a.isSubsetOf(b)).toBe(false);
    });
  });

  describe("isSupersetOf", () => {
    it("any set is superset of empty set", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      expect(a.isSupersetOf(b)).toBe(true);
    });

    it("empty set is superset of empty set", () => {
      const a = new GrowOnlySet<number>();
      const b = new GrowOnlySet<number>();
      expect(a.isSupersetOf(b)).toBe(true);
    });

    it("set is superset of itself", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      expect(a.isSupersetOf(a)).toBe(true);
    });

    it("proper superset", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(1);
      expect(a.isSupersetOf(b)).toBe(true);
    });

    it("not a superset when missing elements", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      expect(a.isSupersetOf(b)).toBe(false);
    });
  });

  describe("union", () => {
    it("union is same as merge", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(2);
      const u = a.union(b);
      expect(u.size).toBe(2);
      expect(u.has(1)).toBe(true);
      expect(u.has(2)).toBe(true);
    });

    it("union with empty set returns same elements", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      const u = a.union(b);
      expect(u.size).toBe(2);
    });

    it("union is commutative", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(2);
      expect(a.union(b).equals(b.union(a))).toBe(true);
    });
  });

  describe("intersection", () => {
    it("intersection of overlapping sets", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      a.add(3);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(3);
      b.add(4);
      const inter = a.intersection(b);
      expect(inter.size).toBe(2);
      expect(inter.has(2)).toBe(true);
      expect(inter.has(3)).toBe(true);
    });

    it("intersection of disjoint sets is empty", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(2);
      const inter = a.intersection(b);
      expect(inter.isEmpty()).toBe(true);
    });

    it("intersection with empty set is empty", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      const inter = a.intersection(b);
      expect(inter.isEmpty()).toBe(true);
    });

    it("intersection of identical sets equals both", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      const inter = a.intersection(b);
      expect(inter.equals(a)).toBe(true);
    });

    it("intersection is commutative", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(3);
      expect(a.intersection(b).equals(b.intersection(a))).toBe(true);
    });
  });

  describe("difference", () => {
    it("difference of overlapping sets", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      a.add(3);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(3);
      b.add(4);
      const diff = a.difference(b);
      expect(diff.size).toBe(1);
      expect(diff.has(1)).toBe(true);
    });

    it("difference of disjoint sets equals first set", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(3);
      b.add(4);
      const diff = a.difference(b);
      expect(diff.size).toBe(2);
      expect(diff.has(1)).toBe(true);
      expect(diff.has(2)).toBe(true);
    });

    it("difference with empty set equals first set", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      const diff = a.difference(b);
      expect(diff.equals(a)).toBe(true);
    });

    it("difference of set with itself is empty", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const diff = a.difference(a);
      expect(diff.isEmpty()).toBe(true);
    });

    it("difference is not commutative", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(3);
      expect(a.difference(b).equals(b.difference(a))).toBe(false);
    });
  });

  describe("clone", () => {
    it("clones all elements", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      const cloned = set.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.has(1)).toBe(true);
      expect(cloned.has(2)).toBe(true);
      expect(cloned.has(3)).toBe(true);
    });

    it("clone is independent", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      const cloned = set.clone();
      cloned.add(2);
      expect(set.has(2)).toBe(false);
      expect(cloned.has(2)).toBe(true);
    });

    it("clone preserves id", () => {
      const set = new GrowOnlySet<number>({ id: "original" });
      const cloned = set.clone();
      expect(cloned.getId()).toBe("original");
    });

    it("clone of empty set is empty", () => {
      const set = new GrowOnlySet<number>();
      const cloned = set.clone();
      expect(cloned.isEmpty()).toBe(true);
    });

    it("clone preserves statistics", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      const cloned = set.clone();
      expect(cloned.getStatistics().adds).toBe(2);
      expect(cloned.getStatistics().size).toBe(2);
    });

    it("modifying clone does not affect original", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      const cloned = set.clone();
      cloned.clear();
      expect(set.size).toBe(1);
      expect(cloned.size).toBe(0);
    });
  });

  describe("getStatistics and getId", () => {
    it("tracks adds correctly", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      const stats = set.getStatistics();
      expect(stats.adds).toBe(3);
      expect(stats.size).toBe(3);
    });

    it("tracks merges via merge result", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(2);
      const merged = a.merge(b);
      expect(merged.getStatistics().merges).toBe(1);
    });

    it("statistics size reflects actual size", () => {
      const set = new GrowOnlySet<number>();
      set.add(1);
      set.add(1);
      set.add(2);
      expect(set.getStatistics().size).toBe(2);
      expect(set.getStatistics().adds).toBe(3);
    });

    it("getId returns undefined by default", () => {
      const set = new GrowOnlySet<number>();
      expect(set.getId()).toBeUndefined();
    });

    it("getId returns configured id", () => {
      const set = new GrowOnlySet<number>({ id: "test-id" });
      expect(set.getId()).toBe("test-id");
    });
  });

  describe("edge cases", () => {
    it("single element set operations", () => {
      const set = new GrowOnlySet<number>();
      set.add(42);
      expect(set.size).toBe(1);
      expect(set.isEmpty()).toBe(false);
      expect(set.has(42)).toBe(true);
      expect(set.has(43)).toBe(false);
    });

    it("many elements", () => {
      const set = new GrowOnlySet<number>();
      for (let i = 0; i < 100; i++) {
        set.add(i);
      }
      expect(set.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(set.has(i)).toBe(true);
      }
      expect(set.has(100)).toBe(false);
    });

    it("NaN handling", () => {
      const set = new GrowOnlySet<number>();
      set.add(NaN);
      expect(set.has(NaN)).toBe(true);
      expect(set.size).toBe(1);
    });

    it("mixed type set via union type", () => {
      const set = new GrowOnlySet<string | number>();
      set.add("hello");
      set.add(42);
      expect(set.has("hello")).toBe(true);
      expect(set.has(42)).toBe(true);
      expect(set.size).toBe(2);
    });
  });

  describe("CRDT properties", () => {
    it("commutativity: merge(A,B) === merge(B,A)", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(3);
      a.add(5);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(4);
      b.add(6);
      expect(a.merge(b).equals(b.merge(a))).toBe(true);
    });

    it("associativity: merge(merge(A,B),C) === merge(A,merge(B,C))", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(3);
      b.add(4);
      const c = new GrowOnlySet<number>();
      c.add(5);
      c.add(6);
      const left = a.merge(b).merge(c);
      const right = a.merge(b.merge(c));
      expect(left.equals(right)).toBe(true);
    });

    it("idempotence: merge(A,A) === A", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      a.add(3);
      const merged = a.merge(a);
      expect(merged.equals(a)).toBe(true);
    });

    it("commutativity with overlapping elements", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      a.add(3);
      const b = new GrowOnlySet<number>();
      b.add(2);
      b.add(3);
      b.add(4);
      expect(a.merge(b).equals(b.merge(a))).toBe(true);
    });

    it("merge grows monotonically", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      const b = new GrowOnlySet<number>();
      b.add(2);
      const merged = a.merge(b);
      expect(merged.isSubsetOf(a)).toBe(false);
      expect(a.isSubsetOf(merged)).toBe(true);
    });

    it("merge with empty set is idempotent-like", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const empty = new GrowOnlySet<number>();
      expect(a.merge(empty).equals(a)).toBe(true);
      expect(empty.merge(a).equals(a)).toBe(true);
    });
  });

  describe("large scale", () => {
    it("handles 500+ elements", () => {
      const set = new GrowOnlySet<number>();
      for (let i = 0; i < 500; i++) {
        set.add(i);
      }
      expect(set.size).toBe(500);
      expect(set.has(0)).toBe(true);
      expect(set.has(499)).toBe(true);
      expect(set.has(500)).toBe(false);
    });

    it("merge two large sets with overlap", () => {
      const a = new GrowOnlySet<number>();
      for (let i = 0; i < 300; i++) {
        a.add(i);
      }
      const b = new GrowOnlySet<number>();
      for (let i = 200; i < 500; i++) {
        b.add(i);
      }
      const merged = a.merge(b);
      expect(merged.size).toBe(500);
      expect(merged.has(0)).toBe(true);
      expect(merged.has(499)).toBe(true);
    });

    it("merge two disjoint large sets", () => {
      const a = new GrowOnlySet<number>();
      for (let i = 0; i < 500; i++) {
        a.add(i);
      }
      const b = new GrowOnlySet<number>();
      for (let i = 500; i < 1000; i++) {
        b.add(i);
      }
      const merged = a.merge(b);
      expect(merged.size).toBe(1000);
    });

    it("clone large set", () => {
      const set = new GrowOnlySet<number>();
      for (let i = 0; i < 500; i++) {
        set.add(i);
      }
      const cloned = set.clone();
      expect(cloned.size).toBe(500);
      expect(cloned.equals(set)).toBe(true);
    });

    it("iterate large set", () => {
      const set = new GrowOnlySet<number>();
      for (let i = 0; i < 500; i++) {
        set.add(i);
      }
      const arr = set.toArray();
      expect(arr.length).toBe(500);
    });
  });

  describe("merge with disjoint and overlapping sets", () => {
    it("disjoint merge preserves all elements", () => {
      const a = new GrowOnlySet<string>();
      a.add("a");
      a.add("b");
      const b = new GrowOnlySet<string>();
      b.add("c");
      b.add("d");
      const merged = a.merge(b);
      expect(merged.size).toBe(4);
    });

    it("fully overlapping merge produces same set", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      const merged = a.merge(b);
      expect(merged.size).toBe(2);
    });

    it("partial overlap", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      a.add(3);
      const b = new GrowOnlySet<number>();
      b.add(3);
      b.add(4);
      b.add(5);
      const merged = a.merge(b);
      expect(merged.size).toBe(5);
    });

    it("one set is subset of other", () => {
      const a = new GrowOnlySet<number>();
      a.add(1);
      a.add(2);
      const b = new GrowOnlySet<number>();
      b.add(1);
      b.add(2);
      b.add(3);
      const merged = a.merge(b);
      expect(merged.size).toBe(3);
      expect(merged.equals(b)).toBe(true);
    });
  });
});
