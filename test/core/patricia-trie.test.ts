import { describe, it, expect } from "vitest";
import { PatriciaTrie } from "../../src/core/patricia-trie/index.js";

describe("PatriciaTrie", () => {
  describe("constructor", () => {
    it("creates empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it("creates trie with alphabet option", () => {
      const trie = new PatriciaTrie({ alphabet: "abc" });
      expect(trie.size).toBe(0);
      expect(trie.radix).toBe(3);
    });

    it("creates trie without options", () => {
      const trie = new PatriciaTrie();
      expect(trie.radix).toBe(256);
    });

    it("defaults radix to 256 when no alphabet", () => {
      const trie = new PatriciaTrie({});
      expect(trie.radix).toBe(256);
    });
  });

  describe("insert and has", () => {
    it("inserts a single key", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello");
      expect(trie.has("hello")).toBe(true);
      expect(trie.size).toBe(1);
    });

    it("inserts key with value", () => {
      const trie = new PatriciaTrie<string>();
      trie.insert("key", "value");
      expect(trie.get("key")).toBe("value");
    });

    it("inserts empty string key", () => {
      const trie = new PatriciaTrie();
      trie.insert("");
      expect(trie.has("")).toBe(true);
      expect(trie.size).toBe(1);
    });

    it("inserts multiple distinct keys", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      expect(trie.size).toBe(3);
      expect(trie.has("a")).toBe(true);
      expect(trie.has("b")).toBe(true);
      expect(trie.has("c")).toBe(true);
    });

    it("overwrites existing key value", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("key", 1);
      trie.insert("key", 2);
      expect(trie.size).toBe(1);
      expect(trie.get("key")).toBe(2);
    });

    it("returns false for missing key", () => {
      const trie = new PatriciaTrie();
      expect(trie.has("missing")).toBe(false);
    });

    it("handles single character keys", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      expect(trie.has("a")).toBe(true);
      expect(trie.has("b")).toBe(true);
      expect(trie.has("c")).toBe(false);
    });

    it("handles keys with common prefixes", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      trie.insert("abd");
      trie.insert("ab");
      trie.insert("a");
      expect(trie.has("abc")).toBe(true);
      expect(trie.has("abd")).toBe(true);
      expect(trie.has("ab")).toBe(true);
      expect(trie.has("a")).toBe(true);
      expect(trie.has("abe")).toBe(false);
    });

    it("handles unicode keys", () => {
      const trie = new PatriciaTrie();
      trie.insert("café");
      trie.insert("naïve");
      trie.insert("日本語");
      expect(trie.has("café")).toBe(true);
      expect(trie.has("naïve")).toBe(true);
      expect(trie.has("日本語")).toBe(true);
      expect(trie.has("cafe")).toBe(false);
    });

    it("inserts key that is prefix of existing key", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcd");
      trie.insert("ab");
      expect(trie.has("abcd")).toBe(true);
      expect(trie.has("ab")).toBe(true);
      expect(trie.size).toBe(2);
    });

    it("inserts key that extends existing key", () => {
      const trie = new PatriciaTrie();
      trie.insert("ab");
      trie.insert("abcd");
      expect(trie.has("ab")).toBe(true);
      expect(trie.has("abcd")).toBe(true);
      expect(trie.size).toBe(2);
    });

    it("inserts key that branches from existing key", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      trie.insert("abd");
      expect(trie.has("abc")).toBe(true);
      expect(trie.has("abd")).toBe(true);
      expect(trie.has("abe")).toBe(false);
    });

    it("inserts key with partial overlap", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcdef");
      trie.insert("abcxyz");
      expect(trie.has("abcdef")).toBe(true);
      expect(trie.has("abcxyz")).toBe(true);
      expect(trie.has("abc")).toBe(false);
    });

    it("handles identical reinsert", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("key", 1);
      trie.insert("key", 1);
      expect(trie.size).toBe(1);
      expect(trie.get("key")).toBe(1);
    });

    it("inserts many keys with shared prefix", () => {
      const trie = new PatriciaTrie();
      const words = ["car", "card", "care", "careful", "carefully", "cased"];
      for (const w of words) trie.insert(w);
      expect(trie.size).toBe(words.length);
      for (const w of words) expect(trie.has(w)).toBe(true);
    });

    it("handles keys differing only at last character", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc1");
      trie.insert("abc2");
      trie.insert("abc3");
      expect(trie.has("abc1")).toBe(true);
      expect(trie.has("abc2")).toBe(true);
      expect(trie.has("abc3")).toBe(true);
      expect(trie.has("abc4")).toBe(false);
    });
  });

  describe("contains", () => {
    it("returns true for existing key", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello");
      expect(trie.contains("hello")).toBe(true);
    });

    it("returns false for missing key", () => {
      const trie = new PatriciaTrie();
      expect(trie.contains("hello")).toBe(false);
    });
  });

  describe("get", () => {
    it("returns value for existing key", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("key", 42);
      expect(trie.get("key")).toBe(42);
    });

    it("returns undefined for missing key", () => {
      const trie = new PatriciaTrie<number>();
      expect(trie.get("key")).toBe(undefined);
    });

    it("returns updated value after overwrite", () => {
      const trie = new PatriciaTrie<string>();
      trie.insert("key", "old");
      trie.insert("key", "new");
      expect(trie.get("key")).toBe("new");
    });

    it("returns value for empty string key", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("", 99);
      expect(trie.get("")).toBe(99);
    });

    it("returns undefined for key that is prefix of existing", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcd");
      expect(trie.get("ab")).toBe(undefined);
    });

    it("returns undefined for key that extends existing", () => {
      const trie = new PatriciaTrie();
      trie.insert("ab");
      expect(trie.get("abcd")).toBe(undefined);
    });

    it("handles object values", () => {
      const trie = new PatriciaTrie<object>();
      const obj = { name: "test" };
      trie.insert("key", obj);
      expect(trie.get("key")).toBe(obj);
    });
  });

  describe("delete", () => {
    it("deletes existing key", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello");
      expect(trie.delete("hello")).toBe(true);
      expect(trie.has("hello")).toBe(false);
      expect(trie.size).toBe(0);
    });

    it("returns false for missing key", () => {
      const trie = new PatriciaTrie();
      expect(trie.delete("hello")).toBe(false);
    });

    it("deletes empty string key", () => {
      const trie = new PatriciaTrie();
      trie.insert("");
      expect(trie.delete("")).toBe(true);
      expect(trie.has("")).toBe(false);
    });

    it("deletes one of multiple keys", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      expect(trie.delete("b")).toBe(true);
      expect(trie.has("a")).toBe(true);
      expect(trie.has("b")).toBe(false);
      expect(trie.has("c")).toBe(true);
      expect(trie.size).toBe(2);
    });

    it("deletes prefix key leaving extension", () => {
      const trie = new PatriciaTrie();
      trie.insert("ab");
      trie.insert("abcd");
      expect(trie.delete("ab")).toBe(true);
      expect(trie.has("ab")).toBe(false);
      expect(trie.has("abcd")).toBe(true);
    });

    it("deletes extension key leaving prefix", () => {
      const trie = new PatriciaTrie();
      trie.insert("ab");
      trie.insert("abcd");
      expect(trie.delete("abcd")).toBe(true);
      expect(trie.has("ab")).toBe(true);
      expect(trie.has("abcd")).toBe(false);
    });

    it("deletes and compresses node back", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      trie.insert("abd");
      trie.insert("ab");
      expect(trie.delete("abc")).toBe(true);
      expect(trie.has("abd")).toBe(true);
      expect(trie.has("ab")).toBe(true);
    });

    it("deletes all keys results in empty trie", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      trie.delete("a");
      trie.delete("b");
      expect(trie.isEmpty()).toBe(true);
      expect(trie.size).toBe(0);
    });

    it("handles deleting key that branched", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcdef");
      trie.insert("abcxyz");
      expect(trie.delete("abcxyz")).toBe(true);
      expect(trie.has("abcdef")).toBe(true);
      expect(trie.has("abcxyz")).toBe(false);
    });

    it("compresses after delete to single path", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      trie.insert("abd");
      trie.delete("abd");
      expect(trie.has("abc")).toBe(true);
      expect(trie.keysWithPrefix("a")).toEqual(["abc"]);
    });

    it("does not delete key not in trie even if similar", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcd");
      expect(trie.delete("abc")).toBe(false);
      expect(trie.has("abcd")).toBe(true);
    });

    it("deletes after multiple insertions and deletions", () => {
      const trie = new PatriciaTrie();
      trie.insert("a", 1);
      trie.insert("ab", 2);
      trie.insert("abc", 3);
      trie.delete("ab");
      expect(trie.has("a")).toBe(true);
      expect(trie.has("ab")).toBe(false);
      expect(trie.has("abc")).toBe(true);
    });
  });

  describe("size and isEmpty", () => {
    it("reports correct size after inserts", () => {
      const trie = new PatriciaTrie();
      expect(trie.size).toBe(0);
      trie.insert("a");
      expect(trie.size).toBe(1);
      trie.insert("b");
      expect(trie.size).toBe(2);
    });

    it("reports correct size after deletions", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      trie.delete("a");
      expect(trie.size).toBe(1);
    });

    it("isEmpty returns true for new trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.isEmpty()).toBe(true);
    });

    it("isEmpty returns false after insert", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      expect(trie.isEmpty()).toBe(false);
    });

    it("isEmpty returns true after deleting all", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.delete("a");
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("clears all entries", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
      expect(trie.has("a")).toBe(false);
    });

    it("allows insertions after clear", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.clear();
      trie.insert("b");
      expect(trie.size).toBe(1);
      expect(trie.has("b")).toBe(true);
    });
  });

  describe("keysWithPrefix", () => {
    it("returns all keys with given prefix", () => {
      const trie = new PatriciaTrie();
      trie.insert("car");
      trie.insert("card");
      trie.insert("care");
      trie.insert("dog");
      expect(trie.keysWithPrefix("car")).toEqual(["car", "card", "care"]);
    });

    it("returns empty array for non-existent prefix", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      expect(trie.keysWithPrefix("xyz")).toEqual([]);
    });

    it("returns all keys with empty prefix", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      const keys = trie.keysWithPrefix("");
      expect(keys).toContain("a");
      expect(keys).toContain("b");
      expect(keys.length).toBe(2);
    });

    it("returns exact key match", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello");
      expect(trie.keysWithPrefix("hello")).toEqual(["hello"]);
    });

    it("handles prefix matching in middle of edge", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcd");
      expect(trie.keysWithPrefix("ab")).toEqual(["abcd"]);
    });

    it("handles prefix matching exactly at node", () => {
      const trie = new PatriciaTrie();
      trie.insert("ab");
      trie.insert("abcd");
      const keys = trie.keysWithPrefix("ab");
      expect(keys).toContain("ab");
      expect(keys).toContain("abcd");
      expect(keys.length).toBe(2);
    });

    it("returns empty for empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.keysWithPrefix("a")).toEqual([]);
    });

    it("handles prefix longer than any key", () => {
      const trie = new PatriciaTrie();
      trie.insert("ab");
      expect(trie.keysWithPrefix("abcdef")).toEqual([]);
    });

    it("handles single character prefix", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      trie.insert("abd");
      trie.insert("xyz");
      const keys = trie.keysWithPrefix("a");
      expect(keys).toContain("abc");
      expect(keys).toContain("abd");
      expect(keys.length).toBe(2);
    });

    it("handles unicode prefix", () => {
      const trie = new PatriciaTrie();
      trie.insert("日本語");
      trie.insert("日本人");
      const keys = trie.keysWithPrefix("日本");
      expect(keys).toContain("日本語");
      expect(keys).toContain("日本人");
      expect(keys.length).toBe(2);
    });
  });

  describe("startsWith", () => {
    it("returns true when prefix matches", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello");
      expect(trie.startsWith("he")).toBe(true);
    });

    it("returns false when no prefix match", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello");
      expect(trie.startsWith("ha")).toBe(false);
    });

    it("returns true for exact match as prefix", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello");
      expect(trie.startsWith("hello")).toBe(true);
    });

    it("returns false for prefix longer than key", () => {
      const trie = new PatriciaTrie();
      trie.insert("ab");
      expect(trie.startsWith("abc")).toBe(false);
    });

    it("returns true for empty prefix if trie non-empty", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      expect(trie.startsWith("")).toBe(true);
    });

    it("returns false for empty prefix if trie empty", () => {
      const trie = new PatriciaTrie();
      expect(trie.startsWith("")).toBe(false);
    });

    it("handles prefix in middle of edge", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcdef");
      expect(trie.startsWith("abc")).toBe(true);
      expect(trie.startsWith("abd")).toBe(false);
    });

    it("returns true with multiple matching keys", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      trie.insert("abd");
      expect(trie.startsWith("ab")).toBe(true);
    });

    it("returns false when prefix diverges from edge", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcde");
      expect(trie.startsWith("abd")).toBe(false);
    });
  });

  describe("longestPrefixOf", () => {
    it("finds exact match", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello");
      expect(trie.longestPrefixOf("hello")).toBe("hello");
    });

    it("finds prefix shorter than query", () => {
      const trie = new PatriciaTrie();
      trie.insert("he");
      trie.insert("hello");
      expect(trie.longestPrefixOf("hello")).toBe("hello");
    });

    it("returns empty string when no prefix matches", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      expect(trie.longestPrefixOf("xyz")).toBe("");
    });

    it("finds longest among multiple prefixes", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("ab");
      trie.insert("abc");
      expect(trie.longestPrefixOf("abcdef")).toBe("abc");
    });

    it("handles empty string key", () => {
      const trie = new PatriciaTrie();
      trie.insert("");
      trie.insert("a");
      expect(trie.longestPrefixOf("abc")).toBe("a");
    });

    it("returns empty for empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.longestPrefixOf("abc")).toBe("");
    });

    it("handles query shorter than stored key", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcdef");
      expect(trie.longestPrefixOf("abc")).toBe("");
    });

    it("finds longest prefix with empty string key only", () => {
      const trie = new PatriciaTrie();
      trie.insert("");
      expect(trie.longestPrefixOf("abc")).toBe("");
    });

    it("handles multiple prefix depths", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("ab");
      trie.insert("abc");
      trie.insert("abcd");
      expect(trie.longestPrefixOf("abcde")).toBe("abcd");
    });

    it("returns empty when key matches edge partially", () => {
      const trie = new PatriciaTrie();
      trie.insert("abcdef");
      expect(trie.longestPrefixOf("abc")).toBe("");
    });
  });

  describe("keys", () => {
    it("returns all keys", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      const keys = trie.keys();
      expect(keys).toContain("a");
      expect(keys).toContain("b");
      expect(keys).toContain("c");
      expect(keys.length).toBe(3);
    });

    it("returns empty array for empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.keys()).toEqual([]);
    });

    it("includes empty string key", () => {
      const trie = new PatriciaTrie();
      trie.insert("");
      trie.insert("a");
      const keys = trie.keys();
      expect(keys).toContain("");
      expect(keys).toContain("a");
    });
  });

  describe("values", () => {
    it("returns all values", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("a", 1);
      trie.insert("b", 2);
      trie.insert("c", 3);
      const vals = trie.values();
      expect(vals).toContain(1);
      expect(vals).toContain(2);
      expect(vals).toContain(3);
      expect(vals.length).toBe(3);
    });

    it("returns empty array for empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.values()).toEqual([]);
    });

    it("returns updated values", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("a", 1);
      trie.insert("a", 2);
      expect(trie.values()).toEqual([2]);
    });
  });

  describe("entries and toArray", () => {
    it("returns all entries", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("a", 1);
      trie.insert("b", 2);
      const entries = trie.entries();
      expect(entries.length).toBe(2);
      const map = new Map(entries.map((e) => [e.key, e.value]));
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
    });

    it("toArray returns same as entries", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("x", 10);
      trie.insert("y", 20);
      expect(trie.toArray()).toEqual(trie.entries());
    });

    it("returns empty array for empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.entries()).toEqual([]);
      expect(trie.toArray()).toEqual([]);
    });
  });

  describe("forEach", () => {
    it("iterates over all entries", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("a", 1);
      trie.insert("b", 2);
      trie.insert("c", 3);
      const result: Array<[string, number]> = [];
      trie.forEach((v, k) => result.push([k, v]));
      expect(result.length).toBe(3);
      const map = new Map(result);
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
    });

    it("passes trie as third argument", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      let received: PatriciaTrie | undefined;
      trie.forEach((_v, _k, t) => { received = t; });
      expect(received).toBe(trie);
    });

    it("does not call callback for empty trie", () => {
      const trie = new PatriciaTrie();
      let count = 0;
      trie.forEach(() => { count++; });
      expect(count).toBe(0);
    });
  });

  describe("Symbol.iterator", () => {
    it("iterates over entries", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("a", 1);
      trie.insert("b", 2);
      const result: Array<[string, number]> = [];
      for (const entry of trie) {
        result.push([entry.key, entry.value]);
      }
      expect(result.length).toBe(2);
    });

    it("returns Entry objects with key and value", () => {
      const trie = new PatriciaTrie<string>();
      trie.insert("x", "hello");
      const entries = [...trie];
      expect(entries[0]!.key).toBe("x");
      expect(entries[0]!.value).toBe("hello");
    });

    it("handles empty trie", () => {
      const trie = new PatriciaTrie();
      const entries = [...trie];
      expect(entries).toEqual([]);
    });
  });

  describe("alphabet validation", () => {
    it("allows keys within alphabet", () => {
      const trie = new PatriciaTrie({ alphabet: "abc" });
      trie.insert("abc");
      trie.insert("a");
      trie.insert("cab");
      expect(trie.has("abc")).toBe(true);
      expect(trie.has("cab")).toBe(true);
    });

    it("throws for character outside alphabet", () => {
      const trie = new PatriciaTrie({ alphabet: "abc" });
      expect(() => trie.insert("abcd")).toThrow(RangeError);
    });

    it("throws for invalid first character", () => {
      const trie = new PatriciaTrie({ alphabet: "abc" });
      expect(() => trie.insert("xyz")).toThrow(RangeError);
    });

    it("reports correct radix", () => {
      const trie = new PatriciaTrie({ alphabet: "0123456789" });
      expect(trie.radix).toBe(10);
    });

    it("allows empty string in restricted alphabet", () => {
      const trie = new PatriciaTrie({ alphabet: "abc" });
      trie.insert("");
      expect(trie.has("")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles long keys", () => {
      const trie = new PatriciaTrie();
      const longKey = "a".repeat(1000);
      trie.insert(longKey);
      expect(trie.has(longKey)).toBe(true);
    });

    it("handles many keys", () => {
      const trie = new PatriciaTrie();
      const n = 500;
      for (let i = 0; i < n; i++) {
        trie.insert(`key${i}`);
      }
      expect(trie.size).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(trie.has(`key${i}`)).toBe(true);
      }
    });

    it("handles inserting same key twice", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("key", 1);
      trie.insert("key", 2);
      expect(trie.size).toBe(1);
      expect(trie.get("key")).toBe(2);
    });

    it("handles delete then reinsert", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("key", 1);
      trie.delete("key");
      trie.insert("key", 2);
      expect(trie.size).toBe(1);
      expect(trie.get("key")).toBe(2);
    });

    it("handles keys with special characters", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello world");
      trie.insert("hello\tworld");
      trie.insert("hello\nworld");
      expect(trie.has("hello world")).toBe(true);
      expect(trie.has("hello\tworld")).toBe(true);
      expect(trie.has("hello\nworld")).toBe(true);
    });

    it("handles single character keys exclusively", () => {
      const trie = new PatriciaTrie();
      for (let i = 0; i < 26; i++) {
        trie.insert(String.fromCharCode(97 + i));
      }
      expect(trie.size).toBe(26);
      for (let i = 0; i < 26; i++) {
        expect(trie.has(String.fromCharCode(97 + i))).toBe(true);
      }
    });

    it("handles deeply nested prefix structure", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("ab");
      trie.insert("abc");
      trie.insert("abcd");
      trie.insert("abcde");
      expect(trie.size).toBe(5);
      expect(trie.longestPrefixOf("abcdef")).toBe("abcde");
    });

    it("handles alternating insert and delete", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      trie.delete("a");
      trie.insert("c");
      trie.delete("b");
      expect(trie.has("a")).toBe(false);
      expect(trie.has("b")).toBe(false);
      expect(trie.has("c")).toBe(true);
      expect(trie.size).toBe(1);
    });

    it("handles clearing then using trie", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      trie.insert("b");
      trie.clear();
      expect(trie.size).toBe(0);
      trie.insert("c");
      expect(trie.has("c")).toBe(true);
      expect(trie.has("a")).toBe(false);
    });

    it("handles keys that are reverse of each other", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      trie.insert("cba");
      expect(trie.has("abc")).toBe(true);
      expect(trie.has("cba")).toBe(true);
      expect(trie.has("bac")).toBe(false);
    });

    it("handles very similar keys", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("aaaaa", 1);
      trie.insert("aaaab", 2);
      trie.insert("aaaba", 3);
      trie.insert("aabaa", 4);
      trie.insert("abaaa", 5);
      trie.insert("baaaa", 6);
      expect(trie.size).toBe(6);
      expect(trie.get("aaaaa")).toBe(1);
      expect(trie.get("baaaa")).toBe(6);
    });

    it("handles insert with undefined value", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("key");
      expect(trie.has("key")).toBe(true);
      expect(trie.get("key")).toBe(undefined);
    });

    it("handles null-like string keys", () => {
      const trie = new PatriciaTrie();
      trie.insert("null");
      trie.insert("undefined");
      expect(trie.has("null")).toBe(true);
      expect(trie.has("undefined")).toBe(true);
      expect(trie.has("nil")).toBe(false);
    });

    it("handles numeric string keys", () => {
      const trie = new PatriciaTrie();
      trie.insert("0");
      trie.insert("1");
      trie.insert("10");
      trie.insert("100");
      expect(trie.has("0")).toBe(true);
      expect(trie.has("10")).toBe(true);
      expect(trie.has("100")).toBe(true);
      expect(trie.has("2")).toBe(false);
    });

    it("handles delete of only key", () => {
      const trie = new PatriciaTrie();
      trie.insert("only");
      expect(trie.delete("only")).toBe(true);
      expect(trie.isEmpty()).toBe(true);
      expect(trie.keys()).toEqual([]);
    });

    it("handles delete then insert of same key", () => {
      const trie = new PatriciaTrie<number>();
      trie.insert("key", 1);
      trie.delete("key");
      trie.insert("key", 2);
      expect(trie.get("key")).toBe(2);
      expect(trie.size).toBe(1);
    });

    it("handles keys with emoji", () => {
      const trie = new PatriciaTrie();
      trie.insert("hello🌍");
      trie.insert("hello🌎");
      expect(trie.has("hello🌍")).toBe(true);
      expect(trie.has("hello🌎")).toBe(true);
      expect(trie.has("hello")).toBe(false);
    });

    it("handles mixed insert orders", () => {
      const trie = new PatriciaTrie();
      const words = ["zebra", "apple", "mango", "banana", "cherry"];
      for (const w of words) trie.insert(w);
      for (const w of words) expect(trie.has(w)).toBe(true);
      expect(trie.size).toBe(words.length);
    });

    it("handles prefix search on empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.keysWithPrefix("a")).toEqual([]);
      expect(trie.startsWith("a")).toBe(false);
    });

    it("handles longestPrefixOf on empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.longestPrefixOf("abc")).toBe("");
    });

    it("handles empty string queries", () => {
      const trie = new PatriciaTrie();
      trie.insert("a");
      expect(trie.has("")).toBe(false);
      expect(trie.get("")).toBe(undefined);
      expect(trie.longestPrefixOf("")).toBe("");
    });

    it("handles delete of empty string from empty trie", () => {
      const trie = new PatriciaTrie();
      expect(trie.delete("")).toBe(false);
    });

    it("handles multiple splits and merges", () => {
      const trie = new PatriciaTrie();
      trie.insert("abc");
      trie.insert("abd");
      trie.insert("abe");
      trie.insert("abf");
      trie.delete("abd");
      trie.delete("abe");
      trie.delete("abf");
      expect(trie.has("abc")).toBe(true);
      expect(trie.size).toBe(1);
    });

    it("handles large dataset with prefix operations", () => {
      const trie = new PatriciaTrie();
      for (let i = 0; i < 100; i++) {
        trie.insert(`prefix_${i.toString().padStart(3, "0")}`);
      }
      const keys = trie.keysWithPrefix("prefix_");
      expect(keys.length).toBe(100);
      expect(trie.startsWith("prefix_")).toBe(true);
      expect(trie.longestPrefixOf("prefix_999")).toBe("");
    });
  });
});
