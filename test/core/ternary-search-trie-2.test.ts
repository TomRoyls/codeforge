import { describe, it, expect } from "vitest";
import { TernarySearchTrie2 } from "../../src/core/ternary-search-trie-2/index.js";

describe("TernarySearchTrie2", () => {
  // ─── Constructor ───
  describe("constructor", () => {
    it("creates empty trie", () => {
      const t = new TernarySearchTrie2<string>();
      expect(t.size).toBe(0);
    });

    it("works with number values", () => {
      const t = new TernarySearchTrie2<number>();
      expect(t.size).toBe(0);
    });
  });

  // ─── set / get ───
  describe("set / get", () => {
    it("stores and retrieves a value", () => {
      const t = new TernarySearchTrie2<string>();
      t.set("hello", "world");
      expect(t.get("hello")).toBe("world");
    });

    it("overwrites existing value without increasing size", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("key", 1);
      t.set("key", 2);
      expect(t.get("key")).toBe(2);
      expect(t.size).toBe(1);
    });

    it("returns undefined for missing key", () => {
      const t = new TernarySearchTrie2<string>();
      expect(t.get("missing")).toBeUndefined();
    });

    it("ignores empty key", () => {
      const t = new TernarySearchTrie2<string>();
      t.set("", "value");
      expect(t.size).toBe(0);
    });

    it("stores multiple keys", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("one", 1);
      t.set("two", 2);
      t.set("three", 3);
      expect(t.size).toBe(3);
      expect(t.get("one")).toBe(1);
      expect(t.get("two")).toBe(2);
      expect(t.get("three")).toBe(3);
    });

    it("handles keys sharing prefixes", () => {
      const t = new TernarySearchTrie2<string>();
      t.set("abc", "value1");
      t.set("abd", "value2");
      t.set("ab", "value3");
      expect(t.get("abc")).toBe("value1");
      expect(t.get("abd")).toBe("value2");
      expect(t.get("ab")).toBe("value3");
    });
  });

  // ─── has ───
  describe("has", () => {
    it("returns true for existing key", () => {
      const t = new TernarySearchTrie2<string>();
      t.set("key", "val");
      expect(t.has("key")).toBe(true);
    });

    it("returns false for missing key", () => {
      const t = new TernarySearchTrie2<string>();
      expect(t.has("key")).toBe(false);
    });

    it("returns false for empty key", () => {
      const t = new TernarySearchTrie2<string>();
      expect(t.has("")).toBe(false);
    });
  });

  // ─── delete ───
  describe("delete", () => {
    it("deletes an existing key", () => {
      const t = new TernarySearchTrie2<string>();
      t.set("hello", "world");
      expect(t.delete("hello")).toBe(true);
      expect(t.get("hello")).toBeUndefined();
      expect(t.size).toBe(0);
    });

    it("returns false for non-existent key", () => {
      const t = new TernarySearchTrie2<string>();
      expect(t.delete("missing")).toBe(false);
    });

    it("returns false for empty key", () => {
      const t = new TernarySearchTrie2<string>();
      expect(t.delete("")).toBe(false);
    });

    it("preserves other keys after deletion", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("abc", 1);
      t.set("abd", 2);
      t.delete("abc");
      expect(t.has("abc")).toBe(false);
      expect(t.get("abd")).toBe(2);
      expect(t.size).toBe(1);
    });

    it("handles delete and re-insert", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("key", 1);
      t.delete("key");
      t.set("key", 2);
      expect(t.get("key")).toBe(2);
      expect(t.size).toBe(1);
    });
  });

  // ─── keys ───
  describe("keys", () => {
    it("returns all keys", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("apple", 1);
      t.set("banana", 2);
      t.set("cherry", 3);
      const keys = t.keys();
      expect(keys).toContain("apple");
      expect(keys).toContain("banana");
      expect(keys).toContain("cherry");
      expect(keys.length).toBe(3);
    });

    it("returns empty array for empty trie", () => {
      const t = new TernarySearchTrie2<number>();
      expect(t.keys()).toEqual([]);
    });
  });

  // ─── keysWithPrefix ───
  describe("keysWithPrefix", () => {
    it("returns keys matching prefix", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("apple", 1);
      t.set("apply", 2);
      t.set("banana", 3);
      const keys = t.keysWithPrefix("app");
      expect(keys).toContain("apple");
      expect(keys).toContain("apply");
      expect(keys).not.toContain("banana");
    });

    it("returns all keys for empty prefix", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("a", 1);
      t.set("b", 2);
      expect(t.keysWithPrefix("").length).toBe(2);
    });

    it("returns empty for non-matching prefix", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("apple", 1);
      expect(t.keysWithPrefix("ban")).toEqual([]);
    });

    it("includes the prefix itself if it is a key", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("app", 1);
      t.set("apple", 2);
      const keys = t.keysWithPrefix("app");
      expect(keys).toContain("app");
      expect(keys).toContain("apple");
    });
  });

  // ─── clear ───
  describe("clear", () => {
    it("clears all entries", () => {
      const t = new TernarySearchTrie2<string>();
      t.set("a", "1");
      t.set("b", "2");
      t.clear();
      expect(t.size).toBe(0);
      expect(t.get("a")).toBeUndefined();
    });
  });

  // ─── Edge cases ───
  describe("edge cases", () => {
    it("handles numeric values", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("x", 42);
      expect(t.get("x")).toBe(42);
    });

    it("handles object values", () => {
      const t = new TernarySearchTrie2<object>();
      const obj = { foo: "bar" };
      t.set("key", obj);
      expect(t.get("key")).toBe(obj);
    });

    it("handles null values (via undefined check)", () => {
      const t = new TernarySearchTrie2<string | null>();
      t.set("a", null as unknown as string);
      expect(t.get("a")).toBeNull();
      expect(t.has("a")).toBe(true);
    });

    it("handles single character keys", () => {
      const t = new TernarySearchTrie2<number>();
      t.set("a", 1);
      t.set("b", 2);
      t.set("c", 3);
      expect(t.size).toBe(3);
      expect(t.get("b")).toBe(2);
    });
  });
});
