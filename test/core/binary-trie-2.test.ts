import { describe, it, expect } from "vitest";
import { BinaryTrie2 } from "../../src/core/binary-trie-2/index.js";

describe("BinaryTrie2", () => {
  // ─── Constructor ───
  describe("constructor", () => {
    it("creates empty trie with default bitLength", () => {
      const t = new BinaryTrie2();
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
    });

    it("creates trie with custom bitLength", () => {
      const t = new BinaryTrie2(8);
      expect(t.size).toBe(0);
    });
  });

  // ─── insert ───
  describe("insert", () => {
    it("inserts a value", () => {
      const t = new BinaryTrie2();
      t.insert(5);
      expect(t.size).toBe(1);
      expect(t.has(5)).toBe(true);
    });

    it("inserts zero", () => {
      const t = new BinaryTrie2();
      t.insert(0);
      expect(t.has(0)).toBe(true);
      expect(t.size).toBe(1);
    });

    it("inserts multiple values", () => {
      const t = new BinaryTrie2();
      t.insert(1);
      t.insert(2);
      t.insert(3);
      expect(t.size).toBe(3);
    });

    it("inserts duplicate value without error", () => {
      const t = new BinaryTrie2();
      t.insert(5);
      t.insert(5);
      expect(t.size).toBe(2);
      expect(t.has(5)).toBe(true);
    });
  });

  // ─── has ───
  describe("has", () => {
    it("returns true for existing value", () => {
      const t = new BinaryTrie2();
      t.insert(42);
      expect(t.has(42)).toBe(true);
    });

    it("returns false for missing value", () => {
      const t = new BinaryTrie2();
      t.insert(1);
      expect(t.has(2)).toBe(false);
    });

    it("returns false for empty trie", () => {
      const t = new BinaryTrie2();
      expect(t.has(0)).toBe(false);
    });
  });

  // ─── delete ───
  describe("delete", () => {
    it("deletes an existing value", () => {
      const t = new BinaryTrie2();
      t.insert(5);
      expect(t.delete(5)).toBe(true);
      expect(t.has(5)).toBe(false);
      expect(t.size).toBe(0);
    });

    it("returns false for non-existent value", () => {
      const t = new BinaryTrie2();
      expect(t.delete(5)).toBe(false);
    });

    it("preserves other values after deletion", () => {
      const t = new BinaryTrie2();
      t.insert(10);
      t.insert(20);
      t.insert(30);
      t.delete(20);
      expect(t.has(10)).toBe(true);
      expect(t.has(20)).toBe(false);
      expect(t.has(30)).toBe(true);
      expect(t.size).toBe(2);
    });

    it("handles delete and re-insert", () => {
      const t = new BinaryTrie2();
      t.insert(10);
      t.delete(10);
      t.insert(10);
      expect(t.has(10)).toBe(true);
      expect(t.size).toBe(1);
    });
  });

  // ─── min ───
  describe("min", () => {
    it("returns minimum value", () => {
      const t = new BinaryTrie2();
      t.insert(5);
      t.insert(3);
      t.insert(7);
      expect(t.min()).toBe(3);
    });

    it("returns undefined for empty trie", () => {
      const t = new BinaryTrie2();
      expect(t.min()).toBeUndefined();
    });

    it("returns the only value", () => {
      const t = new BinaryTrie2();
      t.insert(42);
      expect(t.min()).toBe(42);
    });

    it("returns zero when zero is minimum", () => {
      const t = new BinaryTrie2();
      t.insert(0);
      t.insert(5);
      expect(t.min()).toBe(0);
    });
  });

  // ─── max ───
  describe("max", () => {
    it("returns maximum value", () => {
      const t = new BinaryTrie2();
      t.insert(5);
      t.insert(3);
      t.insert(7);
      expect(t.max()).toBe(7);
    });

    it("returns undefined for empty trie", () => {
      const t = new BinaryTrie2();
      expect(t.max()).toBeUndefined();
    });

    it("returns the only value", () => {
      const t = new BinaryTrie2();
      t.insert(42);
      expect(t.max()).toBe(42);
    });
  });

  // ─── xorMin ───
  describe("xorMin", () => {
    it("finds value with minimum XOR", () => {
      const t = new BinaryTrie2(8);
      t.insert(0b0100); // 4
      t.insert(0b1000); // 8
      t.insert(0b1100); // 12
      const result = t.xorMin(0b0000);
      expect(result).toBe(0b0100); // 4 has smallest XOR with 0
    });

    it("returns exact match for existing value", () => {
      const t = new BinaryTrie2(8);
      t.insert(5);
      const result = t.xorMin(5);
      expect(result).toBe(5);
    });

    it("handles single value", () => {
      const t = new BinaryTrie2(8);
      t.insert(10);
      expect(t.xorMin(3)).toBe(10);
    });
  });

  // ─── xorMax ───
  describe("xorMax", () => {
    it("finds value with maximum XOR", () => {
      const t = new BinaryTrie2(8);
      t.insert(0b0100); // 4
      t.insert(0b1000); // 8
      const result = t.xorMax(0b0000);
      expect(result).toBe(0b1000); // 8 has largest XOR with 0
    });

    it("handles single value", () => {
      const t = new BinaryTrie2(8);
      t.insert(7);
      expect(t.xorMax(3)).toBe(7);
    });

    it("returns complement when available", () => {
      const t = new BinaryTrie2(4);
      t.insert(0b0000);
      t.insert(0b1111);
      const result = t.xorMax(0b0000);
      expect(result).toBe(0b1111);
    });
  });

  // ─── isEmpty / clear ───
  describe("isEmpty / clear", () => {
    it("isEmpty returns false after insert", () => {
      const t = new BinaryTrie2();
      t.insert(1);
      expect(t.isEmpty()).toBe(false);
    });

    it("clear resets the trie", () => {
      const t = new BinaryTrie2();
      t.insert(1);
      t.insert(2);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.isEmpty()).toBe(true);
      expect(t.has(1)).toBe(false);
    });
  });

  // ─── Edge cases ───
  describe("edge cases", () => {
    it("handles 8-bit trie correctly", () => {
      const t = new BinaryTrie2(8);
      t.insert(0);
      t.insert(255);
      expect(t.min()).toBe(0);
      expect(t.max()).toBe(255);
    });

    it("handles sequential insertions", () => {
      const t = new BinaryTrie2(8);
      for (let i = 0; i < 10; i++) {
        t.insert(i);
      }
      expect(t.size).toBe(10);
      expect(t.min()).toBe(0);
      expect(t.max()).toBe(9);
    });

    it("handles delete of min then re-query min", () => {
      const t = new BinaryTrie2(8);
      t.insert(3);
      t.insert(5);
      t.insert(7);
      t.delete(3);
      expect(t.min()).toBe(5);
    });

    it("handles delete of max then re-query max", () => {
      const t = new BinaryTrie2(8);
      t.insert(3);
      t.insert(5);
      t.insert(7);
      t.delete(7);
      expect(t.max()).toBe(5);
    });
  });
});
