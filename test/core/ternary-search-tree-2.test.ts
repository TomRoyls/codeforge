import { describe, it, expect } from "vitest";
import { TernarySearchTree2 } from "../../src/core/ternary-search-tree-2/index.js";

describe("TernarySearchTree2", () => {
  // ─── Constructor ───
  describe("constructor", () => {
    it("creates empty tree", () => {
      const t = new TernarySearchTree2();
      expect(t.size).toBe(0);
      expect(t.isEmpty).toBe(true);
    });
  });

  // ─── insert ───
  describe("insert", () => {
    it("inserts a single word", () => {
      const t = new TernarySearchTree2();
      t.insert("hello");
      expect(t.size).toBe(1);
      expect(t.search("hello")).toBe(true);
    });

    it("inserts multiple words", () => {
      const t = new TernarySearchTree2();
      t.insert("apple");
      t.insert("app");
      t.insert("apply");
      expect(t.size).toBe(3);
    });

    it("does not duplicate existing word", () => {
      const t = new TernarySearchTree2();
      t.insert("hello");
      t.insert("hello");
      expect(t.size).toBe(1);
    });

    it("ignores empty string", () => {
      const t = new TernarySearchTree2();
      t.insert("");
      expect(t.size).toBe(0);
    });

    it("inserts single character word", () => {
      const t = new TernarySearchTree2();
      t.insert("a");
      expect(t.search("a")).toBe(true);
      expect(t.size).toBe(1);
    });
  });

  // ─── search ───
  describe("search", () => {
    it("finds inserted word", () => {
      const t = new TernarySearchTree2();
      t.insert("cat");
      expect(t.search("cat")).toBe(true);
    });

    it("returns false for missing word", () => {
      const t = new TernarySearchTree2();
      t.insert("cat");
      expect(t.search("car")).toBe(false);
    });

    it("returns false for empty string", () => {
      const t = new TernarySearchTree2();
      expect(t.search("")).toBe(false);
    });

    it("returns false for prefix that is not a full word", () => {
      const t = new TernarySearchTree2();
      t.insert("apple");
      expect(t.search("app")).toBe(false);
    });
  });

  // ─── delete ───
  describe("delete", () => {
    it("deletes an existing word", () => {
      const t = new TernarySearchTree2();
      t.insert("hello");
      expect(t.delete("hello")).toBe(true);
      expect(t.search("hello")).toBe(false);
      expect(t.size).toBe(0);
    });

    it("returns false for non-existent word", () => {
      const t = new TernarySearchTree2();
      expect(t.delete("hello")).toBe(false);
    });

    it("returns false for empty string", () => {
      const t = new TernarySearchTree2();
      expect(t.delete("")).toBe(false);
    });

    it("preserves other words after deletion", () => {
      const t = new TernarySearchTree2();
      t.insert("apple");
      t.insert("apply");
      t.delete("apple");
      expect(t.search("apple")).toBe(false);
      expect(t.search("apply")).toBe(true);
      expect(t.size).toBe(1);
    });

    it("can delete all words", () => {
      const t = new TernarySearchTree2();
      t.insert("a");
      t.insert("b");
      t.delete("a");
      t.delete("b");
      expect(t.size).toBe(0);
      expect(t.isEmpty).toBe(true);
    });
  });

  // ─── startsWith ───
  describe("startsWith", () => {
    it("finds prefix match", () => {
      const t = new TernarySearchTree2();
      t.insert("apple");
      expect(t.startsWith("app")).toBe(true);
    });

    it("returns false for non-matching prefix", () => {
      const t = new TernarySearchTree2();
      t.insert("apple");
      expect(t.startsWith("ban")).toBe(false);
    });

    it("returns true for empty prefix", () => {
      const t = new TernarySearchTree2();
      t.insert("hello");
      expect(t.startsWith("")).toBe(true);
    });

    it("returns true for exact word as prefix", () => {
      const t = new TernarySearchTree2();
      t.insert("apple");
      expect(t.startsWith("apple")).toBe(true);
    });
  });

  // ─── getAllWords ───
  describe("getAllWords", () => {
    it("returns all inserted words", () => {
      const t = new TernarySearchTree2();
      t.insert("cat");
      t.insert("car");
      t.insert("care");
      const words = t.getAllWords();
      expect(words).toContain("cat");
      expect(words).toContain("car");
      expect(words).toContain("care");
      expect(words.length).toBe(3);
    });

    it("returns empty array for empty tree", () => {
      const t = new TernarySearchTree2();
      expect(t.getAllWords()).toEqual([]);
    });
  });

  // ─── autoComplete ───
  describe("autoComplete", () => {
    it("returns completions for prefix", () => {
      const t = new TernarySearchTree2();
      t.insert("apple");
      t.insert("apply");
      t.insert("application");
      t.insert("banana");
      const completions = t.autoComplete("app");
      expect(completions).toContain("apple");
      expect(completions).toContain("apply");
      expect(completions).toContain("application");
      expect(completions).not.toContain("banana");
    });

    it("returns empty for non-matching prefix", () => {
      const t = new TernarySearchTree2();
      t.insert("apple");
      expect(t.autoComplete("ban")).toEqual([]);
    });

    it("returns all words for empty prefix", () => {
      const t = new TernarySearchTree2();
      t.insert("cat");
      t.insert("dog");
      const completions = t.autoComplete("");
      expect(completions.length).toBe(2);
    });

    it("includes the prefix itself if it is a word", () => {
      const t = new TernarySearchTree2();
      t.insert("app");
      t.insert("apple");
      const completions = t.autoComplete("app");
      expect(completions).toContain("app");
      expect(completions).toContain("apple");
    });
  });

  // ─── clear ───
  describe("clear", () => {
    it("clears all words", () => {
      const t = new TernarySearchTree2();
      t.insert("hello");
      t.insert("world");
      t.clear();
      expect(t.size).toBe(0);
      expect(t.isEmpty).toBe(true);
      expect(t.search("hello")).toBe(false);
    });
  });

  // ─── getTimeComplexity ───
  describe("getTimeComplexity", () => {
    it("returns complexity record", () => {
      const t = new TernarySearchTree2();
      const c = t.getTimeComplexity();
      expect(c.insert).toBe("O(m)");
      expect(c.search).toBe("O(m)");
      expect(c.delete).toBe("O(m)");
    });
  });

  // ─── Edge cases ───
  describe("edge cases", () => {
    it("handles words sharing prefixes", () => {
      const t = new TernarySearchTree2();
      t.insert("a");
      t.insert("ab");
      t.insert("abc");
      t.insert("abcd");
      expect(t.search("a")).toBe(true);
      expect(t.search("ab")).toBe(true);
      expect(t.search("abc")).toBe(true);
      expect(t.search("abcd")).toBe(true);
      expect(t.search("abcde")).toBe(false);
      expect(t.size).toBe(4);
    });

    it("handles reverse insertion order", () => {
      const t = new TernarySearchTree2();
      t.insert("abcd");
      t.insert("abc");
      t.insert("ab");
      t.insert("a");
      expect(t.search("a")).toBe(true);
      expect(t.search("abcd")).toBe(true);
      expect(t.size).toBe(4);
    });

    it("handles single character operations", () => {
      const t = new TernarySearchTree2();
      t.insert("a");
      t.insert("b");
      t.insert("c");
      expect(t.size).toBe(3);
      expect(t.delete("b")).toBe(true);
      expect(t.search("b")).toBe(false);
      expect(t.search("a")).toBe(true);
    });
  });
});
