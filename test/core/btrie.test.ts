import { describe, it, expect } from "vitest";
import { BTrie } from "../../src/core/btrie/index.js";
import { BUCKET_THRESHOLD } from "../../src/core/btrie/types.js";

describe("BTrie", () => {
  describe("constructor", () => {
    it("creates empty BTrie", () => {
      const trie = new BTrie();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it("accepts custom threshold", () => {
      const trie = new BTrie(8);
      expect(trie.size).toBe(0);
    });

    it("throws on threshold < 1", () => {
      expect(() => new BTrie(0)).toThrow(RangeError);
    });

    it("throws on negative threshold", () => {
      expect(() => new BTrie(-1)).toThrow(RangeError);
    });

    it("uses default threshold", () => {
      const trie = new BTrie();
      expect(trie.size).toBe(0);
    });
  });

  describe("insert and has", () => {
    it("inserts a single key", () => {
      const trie = new BTrie();
      trie.insert("hello");
      expect(trie.has("hello")).toBe(true);
      expect(trie.size).toBe(1);
    });

    it("inserts key with value", () => {
      const trie = new BTrie<string>();
      trie.insert("key", "value");
      expect(trie.get("key")).toBe("value");
    });

    it("inserts empty string key", () => {
      const trie = new BTrie();
      trie.insert("");
      expect(trie.has("")).toBe(true);
      expect(trie.size).toBe(1);
    });

    it("inserts multiple keys", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      expect(trie.size).toBe(3);
      expect(trie.has("a")).toBe(true);
      expect(trie.has("b")).toBe(true);
      expect(trie.has("c")).toBe(true);
    });

    it("overwrites existing key value", () => {
      const trie = new BTrie<number>();
      trie.insert("key", 1);
      trie.insert("key", 2);
      expect(trie.size).toBe(1);
      expect(trie.get("key")).toBe(2);
    });

    it("returns false for missing key", () => {
      const trie = new BTrie();
      expect(trie.has("missing")).toBe(false);
    });

    it("handles single character keys", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("b");
      expect(trie.has("a")).toBe(true);
      expect(trie.has("b")).toBe(true);
      expect(trie.has("c")).toBe(false);
    });

    it("handles keys with common prefixes", () => {
      const trie = new BTrie();
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
      const trie = new BTrie();
      trie.insert("café");
      trie.insert("日本語");
      trie.insert("🎉");
      expect(trie.has("café")).toBe(true);
      expect(trie.has("日本語")).toBe(true);
      expect(trie.has("🎉")).toBe(true);
    });

    it("handles numeric string keys", () => {
      const trie = new BTrie();
      trie.insert("123");
      trie.insert("456");
      expect(trie.has("123")).toBe(true);
      expect(trie.has("456")).toBe(true);
      expect(trie.has("789")).toBe(false);
    });
  });

  describe("burst behavior", () => {
    it("bursts bucket when threshold exceeded", () => {
      const trie = new BTrie(4);
      for (let i = 0; i < 10; i++) {
        trie.insert(`key${i}`);
      }
      expect(trie.size).toBe(10);
      for (let i = 0; i < 10; i++) {
        expect(trie.has(`key${i}`)).toBe(true);
      }
    });

    it("maintains correctness after burst with prefix keys", () => {
      const trie = new BTrie(4);
      trie.insert("ab");
      trie.insert("abc");
      trie.insert("abcd");
      trie.insert("abcde");
      trie.insert("abcdef");
      trie.insert("abcdefg");
      expect(trie.size).toBe(6);
      expect(trie.has("ab")).toBe(true);
      expect(trie.has("abc")).toBe(true);
      expect(trie.has("abcd")).toBe(true);
      expect(trie.has("abcde")).toBe(true);
      expect(trie.has("abcdef")).toBe(true);
      expect(trie.has("abcdefg")).toBe(true);
    });

    it("handles burst with varied key lengths", () => {
      const trie = new BTrie(3);
      const keys = ["a", "ab", "abc", "abcd", "b", "bc", "bcd"];
      for (const k of keys) {
        trie.insert(k);
      }
      for (const k of keys) {
        expect(trie.has(k)).toBe(true);
      }
      expect(trie.size).toBe(keys.length);
    });

    it("handles multiple bursts", () => {
      const trie = new BTrie(2);
      for (let i = 0; i < 50; i++) {
        trie.insert(`item${i.toString().padStart(3, "0")}`);
      }
      expect(trie.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(trie.has(`item${i.toString().padStart(3, "0")}`)).toBe(true);
      }
    });

    it("default threshold allows many keys", () => {
      const trie = new BTrie();
      for (let i = 0; i < 100; i++) {
        trie.insert(`key_${i}`);
      }
      expect(trie.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(trie.has(`key_${i}`)).toBe(true);
      }
    });
  });

  describe("get", () => {
    it("returns value for existing key", () => {
      const trie = new BTrie<number>();
      trie.insert("key", 42);
      expect(trie.get("key")).toBe(42);
    });

    it("returns undefined for missing key", () => {
      const trie = new BTrie<number>();
      expect(trie.get("missing")).toBeUndefined();
    });

    it("returns updated value after overwrite", () => {
      const trie = new BTrie<string>();
      trie.insert("k", "old");
      trie.insert("k", "new");
      expect(trie.get("k")).toBe("new");
    });

    it("returns undefined for empty trie", () => {
      const trie = new BTrie();
      expect(trie.get("anything")).toBeUndefined();
    });

    it("handles various value types", () => {
      const trie = new BTrie();
      trie.insert("obj", { a: 1 });
      trie.insert("arr", [1, 2, 3]);
      trie.insert("bool", true);
      trie.insert("null", null);
      expect(trie.get("obj")).toEqual({ a: 1 });
      expect(trie.get("arr")).toEqual([1, 2, 3]);
      expect(trie.get("bool")).toBe(true);
      expect(trie.get("null")).toBe(null);
    });
  });

  describe("delete", () => {
    it("deletes existing key", () => {
      const trie = new BTrie();
      trie.insert("hello");
      expect(trie.delete("hello")).toBe(true);
      expect(trie.has("hello")).toBe(false);
      expect(trie.size).toBe(0);
    });

    it("returns false for missing key", () => {
      const trie = new BTrie();
      expect(trie.delete("missing")).toBe(false);
    });

    it("deletes from empty trie", () => {
      const trie = new BTrie();
      expect(trie.delete("x")).toBe(false);
    });

    it("deletes one key without affecting others", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      trie.delete("b");
      expect(trie.has("a")).toBe(true);
      expect(trie.has("b")).toBe(false);
      expect(trie.has("c")).toBe(true);
      expect(trie.size).toBe(2);
    });

    it("deletes prefix key without affecting longer keys", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("ab");
      trie.insert("abc");
      trie.delete("a");
      expect(trie.has("a")).toBe(false);
      expect(trie.has("ab")).toBe(true);
      expect(trie.has("abc")).toBe(true);
    });

    it("deletes longer key without affecting prefix", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("ab");
      trie.insert("abc");
      trie.delete("abc");
      expect(trie.has("a")).toBe(true);
      expect(trie.has("ab")).toBe(true);
      expect(trie.has("abc")).toBe(false);
    });

    it("handles delete after burst", () => {
      const trie = new BTrie(3);
      for (let i = 0; i < 10; i++) {
        trie.insert(`key${i}`);
      }
      trie.delete("key5");
      expect(trie.has("key5")).toBe(false);
      expect(trie.size).toBe(9);
      for (let i = 0; i < 10; i++) {
        if (i !== 5) {
          expect(trie.has(`key${i}`)).toBe(true);
        }
      }
    });

    it("deletes all keys", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      trie.delete("a");
      trie.delete("b");
      trie.delete("c");
      expect(trie.isEmpty()).toBe(true);
      expect(trie.size).toBe(0);
    });

    it("deletes empty string key", () => {
      const trie = new BTrie();
      trie.insert("");
      expect(trie.delete("")).toBe(true);
      expect(trie.has("")).toBe(false);
    });
  });

  describe("clear", () => {
    it("clears all entries", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
      expect(trie.has("a")).toBe(false);
      expect(trie.has("b")).toBe(false);
      expect(trie.has("c")).toBe(false);
    });

    it("clears empty trie", () => {
      const trie = new BTrie();
      trie.clear();
      expect(trie.size).toBe(0);
    });

    it("allows insert after clear", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.clear();
      trie.insert("b");
      expect(trie.size).toBe(1);
      expect(trie.has("b")).toBe(true);
    });
  });

  describe("keysWithPrefix", () => {
    it("finds keys with common prefix", () => {
      const trie = new BTrie();
      trie.insert("apple");
      trie.insert("application");
      trie.insert("apply");
      trie.insert("banana");
      const result = trie.keysWithPrefix("app");
      expect(result.sort()).toEqual(["apple", "application", "apply"].sort());
    });

    it("returns empty array for no matches", () => {
      const trie = new BTrie();
      trie.insert("hello");
      expect(trie.keysWithPrefix("xyz")).toEqual([]);
    });

    it("returns all keys with empty prefix", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("ab");
      trie.insert("b");
      const result = trie.keysWithPrefix("");
      expect(result.sort()).toEqual(["a", "ab", "b"].sort());
    });

    it("returns exact match as prefix", () => {
      const trie = new BTrie();
      trie.insert("abc");
      trie.insert("abcd");
      const result = trie.keysWithPrefix("abc");
      expect(result.sort()).toEqual(["abc", "abcd"].sort());
    });

    it("handles empty trie", () => {
      const trie = new BTrie();
      expect(trie.keysWithPrefix("a")).toEqual([]);
    });

    it("finds keys after burst", () => {
      const trie = new BTrie(3);
      for (let i = 0; i < 10; i++) {
        trie.insert(`prefix_${i}`);
      }
      trie.insert("other");
      const result = trie.keysWithPrefix("prefix_");
      expect(result.length).toBe(10);
    });

    it("handles single character prefix", () => {
      const trie = new BTrie();
      trie.insert("a1");
      trie.insert("a2");
      trie.insert("b1");
      const result = trie.keysWithPrefix("a");
      expect(result.sort()).toEqual(["a1", "a2"].sort());
    });
  });

  describe("startsWith", () => {
    it("returns true when prefix exists", () => {
      const trie = new BTrie();
      trie.insert("hello");
      trie.insert("help");
      expect(trie.startsWith("hel")).toBe(true);
    });

    it("returns false when no prefix match", () => {
      const trie = new BTrie();
      trie.insert("hello");
      expect(trie.startsWith("xyz")).toBe(false);
    });

    it("returns true for empty prefix on non-empty trie", () => {
      const trie = new BTrie();
      trie.insert("a");
      expect(trie.startsWith("")).toBe(true);
    });

    it("returns false for empty prefix on empty trie", () => {
      const trie = new BTrie();
      expect(trie.startsWith("")).toBe(false);
    });

    it("returns true for exact key as prefix", () => {
      const trie = new BTrie();
      trie.insert("hello");
      expect(trie.startsWith("hello")).toBe(true);
    });

    it("works after burst", () => {
      const trie = new BTrie(3);
      for (let i = 0; i < 10; i++) {
        trie.insert(`test${i}`);
      }
      expect(trie.startsWith("test")).toBe(true);
      expect(trie.startsWith("xyz")).toBe(false);
    });
  });

  describe("search", () => {
    it("returns value for existing key", () => {
      const trie = new BTrie<number>();
      trie.insert("key", 42);
      expect(trie.search("key")).toBe(42);
    });

    it("returns undefined for missing key", () => {
      const trie = new BTrie();
      expect(trie.search("missing")).toBeUndefined();
    });

    it("is alias for get", () => {
      const trie = new BTrie<string>();
      trie.insert("k", "v");
      expect(trie.search("k")).toBe(trie.get("k"));
    });
  });

  describe("toArray", () => {
    it("returns empty array for empty trie", () => {
      const trie = new BTrie();
      expect(trie.toArray()).toEqual([]);
    });

    it("returns all entries", () => {
      const trie = new BTrie<number>();
      trie.insert("a", 1);
      trie.insert("b", 2);
      trie.insert("c", 3);
      const arr = trie.toArray();
      expect(arr.length).toBe(3);
      const keys = arr.map((e) => e.key).sort();
      expect(keys).toEqual(["a", "b", "c"]);
    });

    it("returns correct key-value pairs", () => {
      const trie = new BTrie<string>();
      trie.insert("x", "val_x");
      trie.insert("y", "val_y");
      const arr = trie.toArray();
      const byKey = Object.fromEntries(arr.map((e) => [e.key, e.value]));
      expect(byKey["x"]).toBe("val_x");
      expect(byKey["y"]).toBe("val_y");
    });

    it("returns entries after burst", () => {
      const trie = new BTrie(3);
      for (let i = 0; i < 10; i++) {
        trie.insert(`k${i}`, i);
      }
      const arr = trie.toArray();
      expect(arr.length).toBe(10);
    });
  });

  describe("forEach", () => {
    it("iterates over all entries", () => {
      const trie = new BTrie<number>();
      trie.insert("a", 1);
      trie.insert("b", 2);
      trie.insert("c", 3);
      const result: Array<[string, number]> = [];
      trie.forEach((value, key) => {
        result.push([key, value]);
      });
      expect(result.length).toBe(3);
    });

    it("passes trie as third argument", () => {
      const trie = new BTrie();
      trie.insert("k");
      let received: BTrie | undefined;
      trie.forEach((_v, _k, t) => {
        received = t;
      });
      expect(received).toBe(trie);
    });

    it("does not call callback on empty trie", () => {
      const trie = new BTrie();
      let called = false;
      trie.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe("Symbol.iterator", () => {
    it("is iterable", () => {
      const trie = new BTrie<number>();
      trie.insert("a", 1);
      trie.insert("b", 2);
      const entries = [...trie];
      expect(entries.length).toBe(2);
    });

    it("works with for...of", () => {
      const trie = new BTrie<number>();
      trie.insert("x", 10);
      trie.insert("y", 20);
      const keys: string[] = [];
      for (const entry of trie) {
        keys.push(entry.key);
      }
      expect(keys.sort()).toEqual(["x", "y"]);
    });

    it("returns empty iterator for empty trie", () => {
      const trie = new BTrie();
      expect([...trie]).toEqual([]);
    });
  });

  describe("longestPrefixOf", () => {
    it("finds exact match", () => {
      const trie = new BTrie();
      trie.insert("hello");
      expect(trie.longestPrefixOf("hello")).toBe("hello");
    });

    it("finds prefix of longer string", () => {
      const trie = new BTrie();
      trie.insert("he");
      trie.insert("hel");
      trie.insert("hell");
      expect(trie.longestPrefixOf("hello")).toBe("hell");
    });

    it("returns empty string for no prefix", () => {
      const trie = new BTrie();
      trie.insert("xyz");
      expect(trie.longestPrefixOf("abc")).toBe("");
    });

    it("returns empty string for empty trie", () => {
      const trie = new BTrie();
      expect(trie.longestPrefixOf("anything")).toBe("");
    });

    it("handles single character prefix", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("ab");
      expect(trie.longestPrefixOf("abc")).toBe("ab");
    });

    it("returns full key when query equals key", () => {
      const trie = new BTrie();
      trie.insert("test");
      expect(trie.longestPrefixOf("test")).toBe("test");
    });

    it("finds longest among multiple prefixes", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("ab");
      trie.insert("abc");
      trie.insert("abcd");
      expect(trie.longestPrefixOf("abcdef")).toBe("abcd");
    });

    it("handles prefix after burst", () => {
      const trie = new BTrie(3);
      trie.insert("alpha");
      trie.insert("alphabet");
      trie.insert("alphabetic");
      for (let i = 0; i < 10; i++) {
        trie.insert(`other${i}`);
      }
      expect(trie.longestPrefixOf("alphabetical")).toBe("alphabetic");
    });
  });

  describe("countForPrefix", () => {
    it("counts keys with prefix", () => {
      const trie = new BTrie();
      trie.insert("apple");
      trie.insert("application");
      trie.insert("apply");
      trie.insert("banana");
      expect(trie.countForPrefix("app")).toBe(3);
    });

    it("returns 0 for no matches", () => {
      const trie = new BTrie();
      trie.insert("hello");
      expect(trie.countForPrefix("xyz")).toBe(0);
    });

    it("returns total for empty prefix", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("b");
      trie.insert("c");
      expect(trie.countForPrefix("")).toBe(3);
    });

    it("returns 0 for empty trie", () => {
      const trie = new BTrie();
      expect(trie.countForPrefix("a")).toBe(0);
    });
  });

  describe("size and isEmpty", () => {
    it("tracks size correctly", () => {
      const trie = new BTrie();
      expect(trie.size).toBe(0);
      trie.insert("a");
      expect(trie.size).toBe(1);
      trie.insert("b");
      expect(trie.size).toBe(2);
      trie.delete("a");
      expect(trie.size).toBe(1);
    });

    it("isEmpty returns true when empty", () => {
      const trie = new BTrie();
      expect(trie.isEmpty()).toBe(true);
    });

    it("isEmpty returns false when not empty", () => {
      const trie = new BTrie();
      trie.insert("a");
      expect(trie.isEmpty()).toBe(false);
    });

    it("isEmpty returns true after clear", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.clear();
      expect(trie.isEmpty()).toBe(true);
    });

    it("isEmpty returns true after deleting all", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.delete("a");
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe("generics", () => {
    it("works with number values", () => {
      const trie = new BTrie<number>();
      trie.insert("one", 1);
      trie.insert("two", 2);
      expect(trie.get("one")).toBe(1);
      expect(trie.get("two")).toBe(2);
    });

    it("works with object values", () => {
      const trie = new BTrie<{ id: number }>();
      trie.insert("user1", { id: 1 });
      trie.insert("user2", { id: 2 });
      expect(trie.get("user1")).toEqual({ id: 1 });
      expect(trie.get("user2")).toEqual({ id: 2 });
    });

    it("works with array values", () => {
      const trie = new BTrie<number[]>();
      trie.insert("list", [1, 2, 3]);
      expect(trie.get("list")).toEqual([1, 2, 3]);
    });

    it("works with boolean values", () => {
      const trie = new BTrie<boolean>();
      trie.insert("flag", true);
      expect(trie.get("flag")).toBe(true);
    });

    it("works with null values", () => {
      const trie = new BTrie<null>();
      trie.insert("null", null);
      expect(trie.get("null")).toBe(null);
    });
  });

  describe("stress tests", () => {
    it("handles many insertions", () => {
      const trie = new BTrie(8);
      const count = 500;
      for (let i = 0; i < count; i++) {
        trie.insert(`key_${i.toString().padStart(5, "0")}`, i);
      }
      expect(trie.size).toBe(count);
      for (let i = 0; i < count; i++) {
        expect(trie.has(`key_${i.toString().padStart(5, "0")}`)).toBe(true);
      }
    });

    it("handles many deletions", () => {
      const trie = new BTrie(8);
      const count = 200;
      for (let i = 0; i < count; i++) {
        trie.insert(`k${i}`);
      }
      for (let i = 0; i < count; i++) {
        expect(trie.delete(`k${i}`)).toBe(true);
      }
      expect(trie.isEmpty()).toBe(true);
    });

    it("handles sequential keys", () => {
      const trie = new BTrie(4);
      const keys = ["aa", "ab", "ac", "ad", "ba", "bb", "bc", "bd"];
      for (const k of keys) {
        trie.insert(k);
      }
      for (const k of keys) {
        expect(trie.has(k)).toBe(true);
      }
      expect(trie.size).toBe(keys.length);
    });

    it("handles mixed operations", () => {
      const trie = new BTrie(4);
      trie.insert("keep");
      trie.insert("delete");
      trie.insert("update", 1);
      trie.delete("delete");
      trie.insert("update", 2);
      expect(trie.has("keep")).toBe(true);
      expect(trie.has("delete")).toBe(false);
      expect(trie.get("update")).toBe(2);
      expect(trie.size).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("handles very long keys", () => {
      const trie = new BTrie();
      const longKey = "a".repeat(1000);
      trie.insert(longKey);
      expect(trie.has(longKey)).toBe(true);
      expect(trie.get(longKey)).toBe(undefined);
    });

    it("handles keys differing at last character", () => {
      const trie = new BTrie();
      trie.insert("abc1");
      trie.insert("abc2");
      trie.insert("abc3");
      expect(trie.has("abc1")).toBe(true);
      expect(trie.has("abc2")).toBe(true);
      expect(trie.has("abc3")).toBe(true);
      expect(trie.has("abc4")).toBe(false);
    });

    it("handles keys that are prefixes of each other", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("ab");
      trie.insert("abc");
      trie.insert("abcd");
      expect(trie.has("a")).toBe(true);
      expect(trie.has("ab")).toBe(true);
      expect(trie.has("abc")).toBe(true);
      expect(trie.has("abcd")).toBe(true);
      expect(trie.size).toBe(4);
    });

    it("handles keys with same first character", () => {
      const trie = new BTrie(3);
      const keys = ["apple", "ant", "arrow", "ace", "art"];
      for (const k of keys) {
        trie.insert(k);
      }
      for (const k of keys) {
        expect(trie.has(k)).toBe(true);
      }
    });

    it("handles single key operations", () => {
      const trie = new BTrie();
      trie.insert("only");
      expect(trie.has("only")).toBe(true);
      expect(trie.get("only")).toBe(undefined);
      expect(trie.delete("only")).toBe(true);
      expect(trie.has("only")).toBe(false);
      expect(trie.isEmpty()).toBe(true);
    });

    it("handles overwrite maintaining size", () => {
      const trie = new BTrie();
      trie.insert("key", 1);
      trie.insert("key", 2);
      trie.insert("key", 3);
      expect(trie.size).toBe(1);
      expect(trie.get("key")).toBe(3);
    });
  });

  describe("BUCKET_THRESHOLD export", () => {
    it("exports default threshold value", () => {
      expect(BUCKET_THRESHOLD).toBe(32);
    });
  });

  describe("additional coverage", () => {
    it("insert with explicit undefined value", () => {
      const trie = new BTrie();
      trie.insert("k", undefined);
      expect(trie.has("k")).toBe(true);
      expect(trie.get("k")).toBe(undefined);
    });

    it("delete returns false for key never inserted", () => {
      const trie = new BTrie();
      trie.insert("a");
      expect(trie.delete("b")).toBe(false);
      expect(trie.size).toBe(1);
    });

    it("keysWithPrefix after delete", () => {
      const trie = new BTrie();
      trie.insert("apple");
      trie.insert("application");
      trie.insert("apply");
      trie.delete("apple");
      const result = trie.keysWithPrefix("app");
      expect(result.sort()).toEqual(["application", "apply"].sort());
    });

    it("toArray after burst and delete", () => {
      const trie = new BTrie(3);
      for (let i = 0; i < 8; i++) {
        trie.insert(`k${i}`, i);
      }
      trie.delete("k3");
      const arr = trie.toArray();
      expect(arr.length).toBe(7);
      const keys = arr.map((e) => e.key).sort();
      expect(keys).not.toContain("k3");
    });

    it("forEach accumulates correct sum", () => {
      const trie = new BTrie<number>();
      trie.insert("a", 10);
      trie.insert("b", 20);
      trie.insert("c", 30);
      let sum = 0;
      trie.forEach((v) => {
        sum += v;
      });
      expect(sum).toBe(60);
    });

    it("iterator yields entries with correct values", () => {
      const trie = new BTrie<number>();
      trie.insert("x", 100);
      trie.insert("y", 200);
      const map = new Map<string, number>();
      for (const entry of trie) {
        map.set(entry.key, entry.value);
      }
      expect(map.get("x")).toBe(100);
      expect(map.get("y")).toBe(200);
    });

    it("longestPrefixOf with empty string query", () => {
      const trie = new BTrie();
      trie.insert("a");
      expect(trie.longestPrefixOf("")).toBe("");
    });

    it("longestPrefixOf with single char", () => {
      const trie = new BTrie();
      trie.insert("a");
      trie.insert("ab");
      expect(trie.longestPrefixOf("ab")).toBe("ab");
    });

    it("countForPrefix after deletions", () => {
      const trie = new BTrie();
      trie.insert("alpha");
      trie.insert("alphabet");
      trie.insert("alpha2");
      trie.delete("alpha2");
      expect(trie.countForPrefix("alpha")).toBe(2);
    });

    it("startsWith after clear and reinsert", () => {
      const trie = new BTrie();
      trie.insert("test");
      trie.clear();
      expect(trie.startsWith("test")).toBe(false);
      trie.insert("testing");
      expect(trie.startsWith("test")).toBe(true);
    });

    it("handles space character in keys", () => {
      const trie = new BTrie();
      trie.insert("hello world");
      trie.insert("hello there");
      expect(trie.has("hello world")).toBe(true);
      expect(trie.has("hello there")).toBe(true);
      expect(trie.keysWithPrefix("hello ").length).toBe(2);
    });

    it("handles special characters", () => {
      const trie = new BTrie();
      trie.insert("a\nb");
      trie.insert("a\tb");
      expect(trie.has("a\nb")).toBe(true);
      expect(trie.has("a\tb")).toBe(true);
    });

    it("large burst chain", () => {
      const trie = new BTrie(2);
      const keys = ["a", "ab", "abc", "abcd", "abcde", "abcdef"];
      for (const k of keys) {
        trie.insert(k);
      }
      for (const k of keys) {
        expect(trie.has(k)).toBe(true);
      }
      expect(trie.size).toBe(6);
    });

    it("get after burst returns correct values", () => {
      const trie = new BTrie<number>(3);
      for (let i = 0; i < 10; i++) {
        trie.insert(`val_${i}`, i * 10);
      }
      for (let i = 0; i < 10; i++) {
        expect(trie.get(`val_${i}`)).toBe(i * 10);
      }
    });

    it("search returns same as get after burst", () => {
      const trie = new BTrie<string>(3);
      for (let i = 0; i < 10; i++) {
        trie.insert(`k${i}`, `v${i}`);
      }
      for (let i = 0; i < 10; i++) {
        expect(trie.search(`k${i}`)).toBe(trie.get(`k${i}`));
      }
    });
  });
});
