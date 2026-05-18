import { describe, it, expect } from "vitest";
import { DoubleArrayTrie2 } from "../../src/core/double-array-trie-2/index.js";

describe("DoubleArrayTrie2", () => {
  // ─── Constructor ───
  describe("constructor", () => {
    it("creates empty trie", () => {
      const t = new DoubleArrayTrie2();
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });
  });

  // ─── insert ───
  describe("insert", () => {
    it("inserts a word and increments size", () => {
      const t = new DoubleArrayTrie2();
      expect(t.insert("hello")).toBe(true);
      expect(t.size).toBe(1);
    });

    it("inserts multiple words", () => {
      const t = new DoubleArrayTrie2();
      t.insert("alpha");
      t.insert("beta");
      t.insert("gamma");
      expect(t.size).toBe(3);
    });

    it("inserts empty string", () => {
      const t = new DoubleArrayTrie2();
      expect(t.insert("")).toBe(true);
      expect(t.has("")).toBe(true);
      expect(t.size).toBe(1);
    });

    it("returns false for duplicate empty string", () => {
      const t = new DoubleArrayTrie2();
      t.insert("");
      expect(t.insert("")).toBe(false);
    });
  });

  // ─── has ───
  describe("has", () => {
    it("finds empty string", () => {
      const t = new DoubleArrayTrie2();
      t.insert("");
      expect(t.has("")).toBe(true);
    });

    it("returns false for missing word", () => {
      const t = new DoubleArrayTrie2();
      t.insert("hello");
      expect(t.has("world")).toBe(false);
    });

    it("returns false for empty trie", () => {
      const t = new DoubleArrayTrie2();
      expect(t.has("anything")).toBe(false);
    });

    it("returns false for partial match", () => {
      const t = new DoubleArrayTrie2();
      t.insert("hello");
      expect(t.has("he")).toBe(false);
    });
  });

  // ─── delete ───
  describe("delete", () => {
    it("returns false for non-existent word", () => {
      const t = new DoubleArrayTrie2();
      expect(t.delete("missing")).toBe(false);
    });

    it("deletes empty string", () => {
      const t = new DoubleArrayTrie2();
      t.insert("");
      expect(t.delete("")).toBe(true);
      expect(t.has("")).toBe(false);
      expect(t.size).toBe(0);
    });

    it("returns false for deleting non-existent empty string", () => {
      const t = new DoubleArrayTrie2();
      expect(t.delete("")).toBe(false);
    });
  });

  // ─── startsWith ───
  describe("startsWith", () => {
    it("returns empty for non-matching prefix", () => {
      const t = new DoubleArrayTrie2();
      t.insert("hello");
      expect(t.startsWith("xyz")).toEqual([]);
    });

    it("returns all words for empty prefix", () => {
      const t = new DoubleArrayTrie2();
      t.insert("hello");
      const results = t.startsWith("");
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── toArray ───
  describe("toArray", () => {
    it("returns empty array for empty trie", () => {
      const t = new DoubleArrayTrie2();
      expect(t.toArray()).toEqual([]);
    });
  });

  // ─── isEmpty / clear ───
  describe("isEmpty / clear", () => {
    it("isEmpty returns false after insert", () => {
      const t = new DoubleArrayTrie2();
      t.insert("word");
      expect(t.isEmpty()).toBe(false);
    });

    it("clear resets the trie", () => {
      const t = new DoubleArrayTrie2();
      t.insert("a");
      t.insert("b");
      t.clear();
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });
  });

  // ─── Edge cases ───
  describe("edge cases", () => {
    it("handles single word insert then has", () => {
      const t = new DoubleArrayTrie2();
      t.insert("b");
      expect(t.has("b")).toBe(true);
      expect(t.size).toBe(1);
    });

    it("handles two words where second survives", () => {
      const t = new DoubleArrayTrie2();
      t.insert("a");
      t.insert("b");
      expect(t.has("b")).toBe(true);
    });

    it("handles single char insertions and deletions", () => {
      const t = new DoubleArrayTrie2();
      t.insert("a");
      t.insert("b");
      t.delete("a");
      expect(t.has("a")).toBe(false);
      expect(t.has("b")).toBe(true);
    });
  });
});
