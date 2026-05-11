import { describe, it, expect } from "vitest";
import { TernarySearchTree } from "../../src/core/ternary-search-tree/index.js";

describe("TernarySearchTree", () => {
  describe("constructor", () => {
    it("creates empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.size).toBe(0);
      expect(tst.isEmpty()).toBe(true);
    });

    it("creates tree without options", () => {
      const tst = new TernarySearchTree();
      expect(tst.size).toBe(0);
    });

    it("creates tree with options", () => {
      const tst = new TernarySearchTree({ comparator: (a, b) => a.localeCompare(b) });
      expect(tst.size).toBe(0);
    });
  });

  describe("insert and has", () => {
    it("inserts a single word", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.has("hello")).toBe(true);
      expect(tst.size).toBe(1);
    });

    it("inserts word with value", () => {
      const tst = new TernarySearchTree<string>();
      tst.insert("key", "value");
      expect(tst.get("key")).toBe("value");
    });

    it("inserts empty string key", () => {
      const tst = new TernarySearchTree();
      tst.insert("");
      expect(tst.has("")).toBe(true);
      expect(tst.size).toBe(1);
    });

    it("inserts multiple distinct words", () => {
      const tst = new TernarySearchTree();
      tst.insert("apple");
      tst.insert("banana");
      tst.insert("cherry");
      expect(tst.size).toBe(3);
      expect(tst.has("apple")).toBe(true);
      expect(tst.has("banana")).toBe(true);
      expect(tst.has("cherry")).toBe(true);
    });

    it("overwrites existing word value", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("key", 1);
      tst.insert("key", 2);
      expect(tst.size).toBe(1);
      expect(tst.get("key")).toBe(2);
    });

    it("returns false for missing word", () => {
      const tst = new TernarySearchTree();
      expect(tst.has("missing")).toBe(false);
    });

    it("handles single character words", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.insert("c");
      expect(tst.has("a")).toBe(true);
      expect(tst.has("b")).toBe(true);
      expect(tst.has("c")).toBe(true);
      expect(tst.has("d")).toBe(false);
    });

    it("handles words with common prefixes", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      tst.insert("abd");
      tst.insert("ab");
      tst.insert("a");
      expect(tst.has("abc")).toBe(true);
      expect(tst.has("abd")).toBe(true);
      expect(tst.has("ab")).toBe(true);
      expect(tst.has("a")).toBe(true);
      expect(tst.has("abe")).toBe(false);
    });

    it("handles unicode words", () => {
      const tst = new TernarySearchTree();
      tst.insert("café");
      tst.insert("naïve");
      tst.insert("日本語");
      expect(tst.has("café")).toBe(true);
      expect(tst.has("naïve")).toBe(true);
      expect(tst.has("日本語")).toBe(true);
      expect(tst.has("cafe")).toBe(false);
    });

    it("inserts word that is prefix of existing word", () => {
      const tst = new TernarySearchTree();
      tst.insert("abcd");
      tst.insert("ab");
      expect(tst.has("abcd")).toBe(true);
      expect(tst.has("ab")).toBe(true);
      expect(tst.size).toBe(2);
    });

    it("inserts word that extends existing word", () => {
      const tst = new TernarySearchTree();
      tst.insert("ab");
      tst.insert("abcd");
      expect(tst.has("ab")).toBe(true);
      expect(tst.has("abcd")).toBe(true);
      expect(tst.size).toBe(2);
    });

    it("inserts word that branches from existing word", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      tst.insert("abd");
      expect(tst.has("abc")).toBe(true);
      expect(tst.has("abd")).toBe(true);
      expect(tst.has("abe")).toBe(false);
    });

    it("handles identical reinsert", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("key", 1);
      tst.insert("key", 1);
      expect(tst.size).toBe(1);
      expect(tst.get("key")).toBe(1);
    });

    it("inserts many words with shared prefix", () => {
      const tst = new TernarySearchTree();
      const words = ["car", "card", "care", "careful", "carefully", "cased"];
      for (const w of words) tst.insert(w);
      expect(tst.size).toBe(words.length);
      for (const w of words) expect(tst.has(w)).toBe(true);
    });

    it("handles words differing only at last character", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc1");
      tst.insert("abc2");
      tst.insert("abc3");
      expect(tst.has("abc1")).toBe(true);
      expect(tst.has("abc2")).toBe(true);
      expect(tst.has("abc3")).toBe(true);
      expect(tst.has("abc4")).toBe(false);
    });

    it("handles words in reverse alphabetical order", () => {
      const tst = new TernarySearchTree();
      tst.insert("zebra");
      tst.insert("mango");
      tst.insert("apple");
      expect(tst.has("zebra")).toBe(true);
      expect(tst.has("mango")).toBe(true);
      expect(tst.has("apple")).toBe(true);
    });
  });

  describe("get", () => {
    it("returns value for existing word", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("key", 42);
      expect(tst.get("key")).toBe(42);
    });

    it("returns undefined for missing word", () => {
      const tst = new TernarySearchTree<number>();
      expect(tst.get("key")).toBe(undefined);
    });

    it("returns updated value after overwrite", () => {
      const tst = new TernarySearchTree<string>();
      tst.insert("key", "old");
      tst.insert("key", "new");
      expect(tst.get("key")).toBe("new");
    });

    it("returns value for empty string word", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("", 99);
      expect(tst.get("")).toBe(99);
    });

    it("returns undefined for word that is prefix of existing", () => {
      const tst = new TernarySearchTree();
      tst.insert("abcd");
      expect(tst.get("ab")).toBe(undefined);
    });

    it("returns undefined for word that extends existing", () => {
      const tst = new TernarySearchTree();
      tst.insert("ab");
      expect(tst.get("abcd")).toBe(undefined);
    });

    it("handles object values", () => {
      const tst = new TernarySearchTree<object>();
      const obj = { name: "test" };
      tst.insert("key", obj);
      expect(tst.get("key")).toBe(obj);
    });
  });

  describe("delete", () => {
    it("deletes existing word", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.delete("hello")).toBe(true);
      expect(tst.has("hello")).toBe(false);
      expect(tst.size).toBe(0);
    });

    it("returns false for missing word", () => {
      const tst = new TernarySearchTree();
      expect(tst.delete("hello")).toBe(false);
    });

    it("deletes empty string word", () => {
      const tst = new TernarySearchTree();
      tst.insert("");
      expect(tst.delete("")).toBe(true);
      expect(tst.has("")).toBe(false);
    });

    it("deletes one of multiple words", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.insert("c");
      expect(tst.delete("b")).toBe(true);
      expect(tst.has("a")).toBe(true);
      expect(tst.has("b")).toBe(false);
      expect(tst.has("c")).toBe(true);
      expect(tst.size).toBe(2);
    });

    it("deletes prefix word leaving extension", () => {
      const tst = new TernarySearchTree();
      tst.insert("ab");
      tst.insert("abcd");
      expect(tst.delete("ab")).toBe(true);
      expect(tst.has("ab")).toBe(false);
      expect(tst.has("abcd")).toBe(true);
    });

    it("deletes extension word leaving prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("ab");
      tst.insert("abcd");
      expect(tst.delete("abcd")).toBe(true);
      expect(tst.has("ab")).toBe(true);
      expect(tst.has("abcd")).toBe(false);
    });

    it("deletes all words results in empty tree", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.delete("a");
      tst.delete("b");
      expect(tst.isEmpty()).toBe(true);
      expect(tst.size).toBe(0);
    });

    it("handles deleting word that branched", () => {
      const tst = new TernarySearchTree();
      tst.insert("abcdef");
      tst.insert("abcxyz");
      expect(tst.delete("abcxyz")).toBe(true);
      expect(tst.has("abcdef")).toBe(true);
      expect(tst.has("abcxyz")).toBe(false);
    });

    it("does not delete word not in tree even if similar", () => {
      const tst = new TernarySearchTree();
      tst.insert("abcd");
      expect(tst.delete("abc")).toBe(false);
      expect(tst.has("abcd")).toBe(true);
    });

    it("deletes after multiple insertions and deletions", () => {
      const tst = new TernarySearchTree();
      tst.insert("a", 1);
      tst.insert("ab", 2);
      tst.insert("abc", 3);
      tst.delete("ab");
      expect(tst.has("a")).toBe(true);
      expect(tst.has("ab")).toBe(false);
      expect(tst.has("abc")).toBe(true);
    });

    it("handles delete of only word", () => {
      const tst = new TernarySearchTree();
      tst.insert("only");
      expect(tst.delete("only")).toBe(true);
      expect(tst.isEmpty()).toBe(true);
      expect(tst.keys()).toEqual([]);
    });

    it("handles delete then insert of same word", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("key", 1);
      tst.delete("key");
      tst.insert("key", 2);
      expect(tst.get("key")).toBe(2);
      expect(tst.size).toBe(1);
    });

    it("returns false for deleting from empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.delete("anything")).toBe(false);
    });
  });

  describe("size and isEmpty", () => {
    it("reports correct size after inserts", () => {
      const tst = new TernarySearchTree();
      expect(tst.size).toBe(0);
      tst.insert("a");
      expect(tst.size).toBe(1);
      tst.insert("b");
      expect(tst.size).toBe(2);
    });

    it("reports correct size after deletions", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.delete("a");
      expect(tst.size).toBe(1);
    });

    it("isEmpty returns true for new tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.isEmpty()).toBe(true);
    });

    it("isEmpty returns false after insert", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      expect(tst.isEmpty()).toBe(false);
    });

    it("isEmpty returns true after deleting all", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.delete("a");
      expect(tst.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("clears all entries", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.insert("c");
      tst.clear();
      expect(tst.size).toBe(0);
      expect(tst.isEmpty()).toBe(true);
      expect(tst.has("a")).toBe(false);
    });

    it("allows insertions after clear", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.clear();
      tst.insert("b");
      expect(tst.size).toBe(1);
      expect(tst.has("b")).toBe(true);
    });
  });

  describe("startsWith", () => {
    it("returns true when prefix matches", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.startsWith("he")).toBe(true);
    });

    it("returns false when no prefix match", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.startsWith("ha")).toBe(false);
    });

    it("returns true for exact match as prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.startsWith("hello")).toBe(true);
    });

    it("returns false for prefix longer than word", () => {
      const tst = new TernarySearchTree();
      tst.insert("ab");
      expect(tst.startsWith("abc")).toBe(false);
    });

    it("returns true for empty prefix if tree non-empty", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      expect(tst.startsWith("")).toBe(true);
    });

    it("returns false for empty prefix if tree empty", () => {
      const tst = new TernarySearchTree();
      expect(tst.startsWith("")).toBe(false);
    });

    it("returns true with multiple matching words", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      tst.insert("abd");
      expect(tst.startsWith("ab")).toBe(true);
    });
  });

  describe("containsPrefix", () => {
    it("returns true for existing prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.containsPrefix("he")).toBe(true);
    });

    it("returns false for non-existing prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.containsPrefix("ha")).toBe(false);
    });
  });

  describe("search", () => {
    it("returns all words with given prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("car");
      tst.insert("card");
      tst.insert("care");
      tst.insert("dog");
      expect(tst.search("car")).toEqual(["car", "card", "care"]);
    });

    it("returns empty array for non-existent prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      expect(tst.search("xyz")).toEqual([]);
    });
  });

  describe("longestPrefixOf", () => {
    it("finds exact match", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.longestPrefixOf("hello")).toBe("hello");
    });

    it("finds prefix shorter than query", () => {
      const tst = new TernarySearchTree();
      tst.insert("he");
      tst.insert("hello");
      expect(tst.longestPrefixOf("hello")).toBe("hello");
    });

    it("returns empty string when no prefix matches", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      expect(tst.longestPrefixOf("xyz")).toBe("");
    });

    it("finds longest among multiple prefixes", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("ab");
      tst.insert("abc");
      expect(tst.longestPrefixOf("abcdef")).toBe("abc");
    });

    it("handles empty string word", () => {
      const tst = new TernarySearchTree();
      tst.insert("");
      tst.insert("a");
      expect(tst.longestPrefixOf("abc")).toBe("a");
    });

    it("returns empty for empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.longestPrefixOf("abc")).toBe("");
    });

    it("handles query shorter than stored word", () => {
      const tst = new TernarySearchTree();
      tst.insert("abcdef");
      expect(tst.longestPrefixOf("abc")).toBe("");
    });

    it("finds longest prefix with empty string word only", () => {
      const tst = new TernarySearchTree();
      tst.insert("");
      expect(tst.longestPrefixOf("abc")).toBe("");
    });

    it("handles multiple prefix depths", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("ab");
      tst.insert("abc");
      tst.insert("abcd");
      expect(tst.longestPrefixOf("abcde")).toBe("abcd");
    });
  });

  describe("keysWithPrefix", () => {
    it("returns all words with given prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("car");
      tst.insert("card");
      tst.insert("care");
      tst.insert("dog");
      expect(tst.keysWithPrefix("car")).toEqual(["car", "card", "care"]);
    });

    it("returns empty array for non-existent prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      expect(tst.keysWithPrefix("xyz")).toEqual([]);
    });

    it("returns all words with empty prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      const keys = tst.keysWithPrefix("");
      expect(keys).toContain("a");
      expect(keys).toContain("b");
      expect(keys.length).toBe(2);
    });

    it("returns exact word match", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.keysWithPrefix("hello")).toEqual(["hello"]);
    });

    it("returns empty for empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.keysWithPrefix("a")).toEqual([]);
    });

    it("handles prefix longer than any word", () => {
      const tst = new TernarySearchTree();
      tst.insert("ab");
      expect(tst.keysWithPrefix("abcdef")).toEqual([]);
    });

    it("handles single character prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      tst.insert("abd");
      tst.insert("xyz");
      const keys = tst.keysWithPrefix("a");
      expect(keys).toContain("abc");
      expect(keys).toContain("abd");
      expect(keys.length).toBe(2);
    });

    it("handles unicode prefix", () => {
      const tst = new TernarySearchTree();
      tst.insert("日本語");
      tst.insert("日本人");
      const keys = tst.keysWithPrefix("日本");
      expect(keys).toContain("日本語");
      expect(keys).toContain("日本人");
      expect(keys.length).toBe(2);
    });
  });

  describe("valuesWithPrefix", () => {
    it("returns all values with given prefix", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("car", 1);
      tst.insert("card", 2);
      tst.insert("care", 3);
      tst.insert("dog", 4);
      const vals = tst.valuesWithPrefix("car");
      expect(vals).toContain(1);
      expect(vals).toContain(2);
      expect(vals).toContain(3);
      expect(vals.length).toBe(3);
    });

    it("returns empty array for non-existent prefix", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("abc", 1);
      expect(tst.valuesWithPrefix("xyz")).toEqual([]);
    });

    it("returns all values with empty prefix", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("a", 1);
      tst.insert("b", 2);
      const vals = tst.valuesWithPrefix("");
      expect(vals).toContain(1);
      expect(vals).toContain(2);
      expect(vals.length).toBe(2);
    });
  });

  describe("entriesWithPrefix", () => {
    it("returns all entries with given prefix", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("car", 1);
      tst.insert("card", 2);
      tst.insert("dog", 3);
      const entries = tst.entriesWithPrefix("car");
      expect(entries.length).toBe(2);
      const map = new Map(entries.map(e => [e.key, e.value]));
      expect(map.get("car")).toBe(1);
      expect(map.get("card")).toBe(2);
    });

    it("returns empty array for non-existent prefix", () => {
      const tst = new TernarySearchTree<number>();
      expect(tst.entriesWithPrefix("xyz")).toEqual([]);
    });

    it("returns all entries with empty prefix", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("a", 1);
      tst.insert("b", 2);
      const entries = tst.entriesWithPrefix("");
      expect(entries.length).toBe(2);
    });
  });

  describe("keys", () => {
    it("returns all words", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.insert("c");
      const keys = tst.keys();
      expect(keys).toContain("a");
      expect(keys).toContain("b");
      expect(keys).toContain("c");
      expect(keys.length).toBe(3);
    });

    it("returns empty array for empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.keys()).toEqual([]);
    });
  });

  describe("values", () => {
    it("returns all values", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("a", 1);
      tst.insert("b", 2);
      tst.insert("c", 3);
      const vals = tst.values();
      expect(vals).toContain(1);
      expect(vals).toContain(2);
      expect(vals).toContain(3);
      expect(vals.length).toBe(3);
    });

    it("returns empty array for empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.values()).toEqual([]);
    });

    it("returns updated values", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("a", 1);
      tst.insert("a", 2);
      expect(tst.values()).toEqual([2]);
    });
  });

  describe("entries and toArray", () => {
    it("returns all entries", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("a", 1);
      tst.insert("b", 2);
      const entries = tst.entries();
      expect(entries.length).toBe(2);
      const map = new Map(entries.map(e => [e.key, e.value]));
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
    });

    it("toArray returns same as entries", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("x", 10);
      tst.insert("y", 20);
      expect(tst.toArray()).toEqual(tst.entries());
    });

    it("returns empty array for empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.entries()).toEqual([]);
      expect(tst.toArray()).toEqual([]);
    });
  });

  describe("forEach", () => {
    it("iterates over all entries", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("a", 1);
      tst.insert("b", 2);
      tst.insert("c", 3);
      const result: Array<[string, number]> = [];
      tst.forEach((v, k) => result.push([k, v]));
      expect(result.length).toBe(3);
      const map = new Map(result);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
    });

    it("passes tree as third argument", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      let received: TernarySearchTree | undefined;
      tst.forEach((_v, _k, t) => { received = t; });
      expect(received).toBe(tst);
    });

    it("does not call callback for empty tree", () => {
      const tst = new TernarySearchTree();
      let count = 0;
      tst.forEach(() => { count++; });
      expect(count).toBe(0);
    });
  });

  describe("Symbol.iterator", () => {
    it("iterates over entries", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("a", 1);
      tst.insert("b", 2);
      const result: Array<[string, number]> = [];
      for (const entry of tst) {
        result.push([entry.key, entry.value]);
      }
      expect(result.length).toBe(2);
    });

    it("returns Entry objects with key and value", () => {
      const tst = new TernarySearchTree<string>();
      tst.insert("x", "hello");
      const entries = [...tst];
      expect(entries[0]!.key).toBe("x");
      expect(entries[0]!.value).toBe("hello");
    });

    it("handles empty tree", () => {
      const tst = new TernarySearchTree();
      const entries = [...tst];
      expect(entries).toEqual([]);
    });
  });

  describe("wildcardMatch", () => {
    it("matches exact pattern without wildcards", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.wildcardMatch("hello")).toEqual(["hello"]);
    });

    it.skip("matches pattern with wildcard at end", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      tst.insert("help");
      tst.insert("helium");
      const results = tst.wildcardMatch("hel*");
      expect(results).toContain("hello");
      expect(results).toContain("help");
      expect(results).toContain("helium");
    });

    it.skip("matches pattern with wildcard at start", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      tst.insert("jello");
      tst.insert("yellow");
      const results = tst.wildcardMatch("*ello");
      expect(results).toContain("hello");
      expect(results).toContain("jello");
      expect(results).toContain("yellow");
    });

    it.skip("matches pattern with wildcard in middle", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      tst.insert("hallo");
      const results = tst.wildcardMatch("h*llo");
      expect(results).toContain("hello");
      expect(results).toContain("hallo");
    });

    it("returns empty for no matches", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.wildcardMatch("xyz")).toEqual([]);
    });

    it("returns empty for empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.wildcardMatch("*")).toEqual([]);
    });

    it.skip("matches only wildcard returns all words", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.insert("c");
      const results = tst.wildcardMatch("*");
      expect(results).toContain("a");
      expect(results).toContain("b");
      expect(results).toContain("c");
      expect(results.length).toBe(3);
    });
  });

  describe("custom comparator", () => {
    it("uses custom comparator for ordering", () => {
      const reverseCmp = (a: string, b: string): number => a < b ? 1 : a > b ? -1 : 0;
      const tst = new TernarySearchTree<number>({ comparator: reverseCmp });
      tst.insert("abc", 1);
      tst.insert("abd", 2);
      expect(tst.has("abc")).toBe(true);
      expect(tst.has("abd")).toBe(true);
      expect(tst.get("abc")).toBe(1);
      expect(tst.get("abd")).toBe(2);
    });

    it("uses localeCompare comparator", () => {
      const tst = new TernarySearchTree<number>({
        comparator: (a, b) => a.localeCompare(b)
      });
      tst.insert("café", 1);
      tst.insert("cafe", 2);
      expect(tst.has("café")).toBe(true);
      expect(tst.has("cafe")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles long words", () => {
      const tst = new TernarySearchTree();
      const longWord = "a".repeat(1000);
      tst.insert(longWord);
      expect(tst.has(longWord)).toBe(true);
    });

    it("handles many words", () => {
      const tst = new TernarySearchTree();
      const n = 500;
      for (let i = 0; i < n; i++) {
        tst.insert(`key${i}`);
      }
      expect(tst.size).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(tst.has(`key${i}`)).toBe(true);
      }
    });

    it("handles words with special characters", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello world");
      tst.insert("hello\tworld");
      tst.insert("hello\nworld");
      expect(tst.has("hello world")).toBe(true);
      expect(tst.has("hello\tworld")).toBe(true);
      expect(tst.has("hello\nworld")).toBe(true);
    });

    it("handles single character words exclusively", () => {
      const tst = new TernarySearchTree();
      for (let i = 0; i < 26; i++) {
        tst.insert(String.fromCharCode(97 + i));
      }
      expect(tst.size).toBe(26);
      for (let i = 0; i < 26; i++) {
        expect(tst.has(String.fromCharCode(97 + i))).toBe(true);
      }
    });

    it("handles deeply nested prefix structure", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("ab");
      tst.insert("abc");
      tst.insert("abcd");
      tst.insert("abcde");
      expect(tst.size).toBe(5);
      expect(tst.longestPrefixOf("abcdef")).toBe("abcde");
    });

    it("handles alternating insert and delete", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.delete("a");
      tst.insert("c");
      tst.delete("b");
      expect(tst.has("a")).toBe(false);
      expect(tst.has("b")).toBe(false);
      expect(tst.has("c")).toBe(true);
      expect(tst.size).toBe(1);
    });

    it("handles clearing then using tree", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.clear();
      expect(tst.size).toBe(0);
      tst.insert("c");
      expect(tst.has("c")).toBe(true);
      expect(tst.has("a")).toBe(false);
    });

    it("handles words that are reverse of each other", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      tst.insert("cba");
      expect(tst.has("abc")).toBe(true);
      expect(tst.has("cba")).toBe(true);
      expect(tst.has("bac")).toBe(false);
    });

    it("handles very similar words", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("aaaaa", 1);
      tst.insert("aaaab", 2);
      tst.insert("aaaba", 3);
      tst.insert("aabaa", 4);
      tst.insert("abaaa", 5);
      tst.insert("baaaa", 6);
      expect(tst.size).toBe(6);
      expect(tst.get("aaaaa")).toBe(1);
      expect(tst.get("baaaa")).toBe(6);
    });

    it("handles insert with undefined value", () => {
      const tst = new TernarySearchTree<number>();
      tst.insert("key");
      expect(tst.has("key")).toBe(true);
      expect(tst.get("key")).toBe(undefined);
    });

    it("handles null-like string words", () => {
      const tst = new TernarySearchTree();
      tst.insert("null");
      tst.insert("undefined");
      expect(tst.has("null")).toBe(true);
      expect(tst.has("undefined")).toBe(true);
      expect(tst.has("nil")).toBe(false);
    });

    it("handles numeric string words", () => {
      const tst = new TernarySearchTree();
      tst.insert("0");
      tst.insert("1");
      tst.insert("10");
      tst.insert("100");
      expect(tst.has("0")).toBe(true);
      expect(tst.has("10")).toBe(true);
      expect(tst.has("100")).toBe(true);
      expect(tst.has("2")).toBe(false);
    });

    it("handles words with emoji", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello🌍");
      tst.insert("hello🌎");
      expect(tst.has("hello🌍")).toBe(true);
      expect(tst.has("hello🌎")).toBe(true);
      expect(tst.has("hello")).toBe(false);
    });

    it("handles mixed insert orders", () => {
      const tst = new TernarySearchTree();
      const words = ["zebra", "apple", "mango", "banana", "cherry"];
      for (const w of words) tst.insert(w);
      for (const w of words) expect(tst.has(w)).toBe(true);
      expect(tst.size).toBe(words.length);
    });

    it("handles prefix search on empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.keysWithPrefix("a")).toEqual([]);
      expect(tst.startsWith("a")).toBe(false);
    });

    it("handles longestPrefixOf on empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.longestPrefixOf("abc")).toBe("");
    });

    it("handles empty string queries", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      expect(tst.has("")).toBe(false);
      expect(tst.get("")).toBe(undefined);
      expect(tst.longestPrefixOf("")).toBe("");
    });

    it("handles delete of empty string from empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.delete("")).toBe(false);
    });

    it("handles large dataset with prefix operations", () => {
      const tst = new TernarySearchTree();
      for (let i = 0; i < 100; i++) {
        tst.insert(`prefix_${i.toString().padStart(3, "0")}`);
      }
      const keys = tst.keysWithPrefix("prefix_");
      expect(keys.length).toBe(100);
      expect(tst.startsWith("prefix_")).toBe(true);
      expect(tst.longestPrefixOf("prefix_999")).toBe("");
    });

    it("handles empty string insert then non-empty", () => {
      const tst = new TernarySearchTree();
      tst.insert("");
      tst.insert("a");
      expect(tst.has("")).toBe(true);
      expect(tst.has("a")).toBe(true);
      expect(tst.size).toBe(2);
    });

    it.skip("handles non-empty insert then empty string", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("");
      expect(tst.has("a")).toBe(true);
      expect(tst.has("")).toBe(true);
      expect(tst.size).toBe(2);
    });

    it("handles multiple splits and merges", () => {
      const tst = new TernarySearchTree();
      tst.insert("abc");
      tst.insert("abd");
      tst.insert("abe");
      tst.insert("abf");
      tst.delete("abd");
      tst.delete("abe");
      tst.delete("abf");
      expect(tst.has("abc")).toBe(true);
      expect(tst.size).toBe(1);
    });

    it.skip("handles wildcard match on single character words", () => {
      const tst = new TernarySearchTree();
      tst.insert("a");
      tst.insert("b");
      tst.insert("c");
      const results = tst.wildcardMatch("*");
      expect(results.length).toBe(3);
    });

    it("handles wildcard match returning nothing for non-matching pattern", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      expect(tst.wildcardMatch("h*world")).toEqual([]);
    });

    it("handles entriesWithPrefix on empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.entriesWithPrefix("a")).toEqual([]);
    });

    it("handles valuesWithPrefix on empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.valuesWithPrefix("a")).toEqual([]);
    });

    it("handles search on empty tree", () => {
      const tst = new TernarySearchTree();
      expect(tst.search("a")).toEqual([]);
    });

    it.skip("handles wildcardMatch with custom wildcard character", () => {
      const tst = new TernarySearchTree();
      tst.insert("hello");
      tst.insert("help");
      const results = tst.wildcardMatch("hel?", "?");
      expect(results).toContain("hello");
      expect(results).toContain("help");
    });
  });
});
