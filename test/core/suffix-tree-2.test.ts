import { describe, it, expect } from "vitest";
import { SuffixTree } from "../../src/core/suffix-tree-2/index.js";

describe("SuffixTree", () => {
  describe("constructor", () => {
    it("creates tree from simple string", () => {
      const st = new SuffixTree("abc");
      expect(st.size).toBe(4);
    });

    it("creates tree from empty string", () => {
      const st = new SuffixTree("");
      expect(st.size).toBe(1);
    });

    it("creates tree from single character", () => {
      const st = new SuffixTree("a");
      expect(st.size).toBe(2);
    });

    it("creates tree with custom terminator", () => {
      const st = new SuffixTree("abc", { terminator: "#" });
      expect(st.size).toBe(4);
      expect(st.has("abc")).toBe(true);
    });

    it("throws when text contains terminator", () => {
      expect(() => new SuffixTree("ab$c")).toThrow();
    });

    it("throws when text contains custom terminator", () => {
      expect(() => new SuffixTree("a#bc", { terminator: "#" })).toThrow();
    });

    it("handles repeated characters", () => {
      const st = new SuffixTree("aaaa");
      expect(st.has("a")).toBe(true);
      expect(st.has("aa")).toBe(true);
      expect(st.has("aaa")).toBe(true);
      expect(st.has("aaaa")).toBe(true);
    });

    it("handles long string", () => {
      const text = "abcdefghij".repeat(10);
      const st = new SuffixTree(text);
      expect(st.has("abcdefghij")).toBe(true);
    });
  });

  describe("has", () => {
    it("returns true for existing substring", () => {
      const st = new SuffixTree("banana");
      expect(st.has("banana")).toBe(true);
      expect(st.has("banan")).toBe(true);
      expect(st.has("bana")).toBe(true);
      expect(st.has("ban")).toBe(true);
      expect(st.has("ba")).toBe(true);
      expect(st.has("b")).toBe(true);
    });

    it("returns true for middle substrings", () => {
      const st = new SuffixTree("banana");
      expect(st.has("ana")).toBe(true);
      expect(st.has("nan")).toBe(true);
      expect(st.has("an")).toBe(true);
      expect(st.has("na")).toBe(true);
      expect(st.has("n")).toBe(true);
      expect(st.has("a")).toBe(true);
    });

    it("returns false for missing substrings", () => {
      const st = new SuffixTree("banana");
      expect(st.has("xyz")).toBe(false);
      expect(st.has("bananas")).toBe(false);
      expect(st.has("ab")).toBe(false);
      expect(st.has("bb")).toBe(false);
    });

    it("returns true for empty string", () => {
      const st = new SuffixTree("abc");
      expect(st.has("")).toBe(true);
    });

    it("returns true for single char substrings", () => {
      const st = new SuffixTree("abc");
      expect(st.has("a")).toBe(true);
      expect(st.has("b")).toBe(true);
      expect(st.has("c")).toBe(true);
    });

    it("returns false for single char not in text", () => {
      const st = new SuffixTree("abc");
      expect(st.has("d")).toBe(false);
      expect(st.has("z")).toBe(false);
    });

    it("handles repeated pattern", () => {
      const st = new SuffixTree("abcabc");
      expect(st.has("abc")).toBe(true);
      expect(st.has("bca")).toBe(true);
      expect(st.has("cab")).toBe(true);
      expect(st.has("abcabc")).toBe(true);
    });

    it("handles palindrome", () => {
      const st = new SuffixTree("racecar");
      expect(st.has("race")).toBe(true);
      expect(st.has("car")).toBe(true);
      expect(st.has("cec")).toBe(true);
    });
  });

  describe("isSubstring", () => {
    it("returns true for existing substring", () => {
      const st = new SuffixTree("hello");
      expect(st.isSubstring("ell")).toBe(true);
    });

    it("returns false for missing substring", () => {
      const st = new SuffixTree("hello");
      expect(st.isSubstring("xyz")).toBe(false);
    });

    it("returns true for empty string", () => {
      const st = new SuffixTree("hello");
      expect(st.isSubstring("")).toBe(true);
    });

    it("is alias for has", () => {
      const st = new SuffixTree("banana");
      expect(st.isSubstring("ana")).toBe(st.has("ana"));
      expect(st.isSubstring("xyz")).toBe(st.has("xyz"));
    });
  });

  describe("search", () => {
    it("finds all occurrences of pattern", () => {
      const st = new SuffixTree("banana");
      const result = st.search("ana");
      expect(result.sort()).toEqual([1, 3]);
    });

    it("finds single occurrence", () => {
      const st = new SuffixTree("banana");
      const result = st.search("ban");
      expect(result).toEqual([0]);
    });

    it("returns empty for missing pattern", () => {
      const st = new SuffixTree("banana");
      expect(st.search("xyz")).toEqual([]);
    });

    it("returns empty for empty pattern", () => {
      const st = new SuffixTree("banana");
      expect(st.search("")).toEqual([]);
    });

    it("finds overlapping occurrences", () => {
      const st = new SuffixTree("aaaa");
      const result = st.search("aa");
      expect(result.sort()).toEqual([0, 1, 2]);
    });

    it("finds single character occurrences", () => {
      const st = new SuffixTree("banana");
      const result = st.search("a");
      expect(result.sort()).toEqual([1, 3, 5]);
    });

    it("finds the entire string", () => {
      const st = new SuffixTree("banana");
      expect(st.search("banana")).toEqual([0]);
    });

    it("finds all occurrences in repeated string", () => {
      const st = new SuffixTree("abcabc");
      const result = st.search("abc");
      expect(result.sort()).toEqual([0, 3]);
    });

    it("finds at end of string", () => {
      const st = new SuffixTree("abcdef");
      expect(st.search("def")).toEqual([3]);
    });

    it("finds at beginning of string", () => {
      const st = new SuffixTree("abcdef");
      expect(st.search("abc")).toEqual([0]);
    });

    it("returns empty for pattern longer than text", () => {
      const st = new SuffixTree("abc");
      expect(st.search("abcdef")).toEqual([]);
    });

    it("handles pattern matching partial edge", () => {
      const st = new SuffixTree("abcdef");
      expect(st.search("bcd")).toEqual([1]);
      expect(st.search("cde")).toEqual([2]);
    });
  });

  describe("findAll", () => {
    it("returns same as search", () => {
      const st = new SuffixTree("banana");
      expect(st.findAll("ana").sort()).toEqual(st.search("ana").sort());
    });

    it("returns all positions for repeated pattern", () => {
      const st = new SuffixTree("abababab");
      const result = st.findAll("ab");
      expect(result.sort()).toEqual([0, 2, 4, 6]);
    });

    it("returns empty for missing pattern", () => {
      const st = new SuffixTree("abc");
      expect(st.findAll("z")).toEqual([]);
    });
  });

  describe("count", () => {
    it("counts single occurrence", () => {
      const st = new SuffixTree("banana");
      expect(st.count("ban")).toBe(1);
    });

    it("counts multiple occurrences", () => {
      const st = new SuffixTree("banana");
      expect(st.count("ana")).toBe(2);
    });

    it("counts overlapping occurrences", () => {
      const st = new SuffixTree("aaaa");
      expect(st.count("aa")).toBe(3);
    });

    it("counts single characters", () => {
      const st = new SuffixTree("banana");
      expect(st.count("a")).toBe(3);
      expect(st.count("b")).toBe(1);
      expect(st.count("n")).toBe(2);
    });

    it("returns 0 for missing pattern", () => {
      const st = new SuffixTree("banana");
      expect(st.count("xyz")).toBe(0);
    });

    it("returns 0 for empty pattern", () => {
      const st = new SuffixTree("banana");
      expect(st.count("")).toBe(0);
    });

    it("counts entire string", () => {
      const st = new SuffixTree("abcabc");
      expect(st.count("abcabc")).toBe(1);
    });

    it("counts in string of all same chars", () => {
      const st = new SuffixTree("aaaa");
      expect(st.count("a")).toBe(4);
      expect(st.count("aa")).toBe(3);
      expect(st.count("aaa")).toBe(2);
      expect(st.count("aaaa")).toBe(1);
    });

    it("counts in repeated string", () => {
      const st = new SuffixTree("abcabc");
      expect(st.count("abc")).toBe(2);
      expect(st.count("bc")).toBe(2);
      expect(st.count("ca")).toBe(1);
    });
  });

  describe("longestRepeatedSubstring", () => {
    it("finds longest repeated substring", () => {
      const st = new SuffixTree("banana");
      const lrs = st.longestRepeatedSubstring();
      expect(lrs.length).toBeGreaterThan(0);
      expect(st.has(lrs)).toBe(true);
      expect(st.count(lrs)).toBeGreaterThanOrEqual(2);
    });

    it("returns empty for unique string", () => {
      const st = new SuffixTree("abcdef");
      expect(st.longestRepeatedSubstring()).toBe("");
    });

    it("finds repeated single char", () => {
      const st = new SuffixTree("abcdefa");
      expect(st.longestRepeatedSubstring()).toBe("a");
    });

    it("finds all same chars", () => {
      const st = new SuffixTree("aaaa");
      expect(st.longestRepeatedSubstring()).toBe("aaa");
    });

    it("returns empty for single char string", () => {
      const st = new SuffixTree("a");
      expect(st.longestRepeatedSubstring()).toBe("");
    });

    it("returns empty for empty string", () => {
      const st = new SuffixTree("");
      expect(st.longestRepeatedSubstring()).toBe("");
    });

    it("finds repeated pattern at end", () => {
      const st = new SuffixTree("xyzabcxyz");
      const lrs = st.longestRepeatedSubstring();
      expect(lrs).toBe("xyz");
    });

    it("finds longer of two repeated substrings", () => {
      const st = new SuffixTree("abcabcabab");
      const lrs = st.longestRepeatedSubstring();
      expect(lrs.length).toBeGreaterThanOrEqual(3);
    });

    it("result appears at least twice in text", () => {
      const text = "mississippi";
      const st = new SuffixTree(text);
      const lrs = st.longestRepeatedSubstring();
      expect(lrs.length).toBeGreaterThan(0);
      const first = text.indexOf(lrs);
      const second = text.indexOf(lrs, first + 1);
      expect(second).toBeGreaterThan(-1);
    });
  });

  describe("longestCommonSubstring", () => {
    it("finds common substring", () => {
      const st = new SuffixTree("abcdef");
      const lcs = st.longestCommonSubstring("xyzabc");
      expect(lcs).toBe("abc");
    });

    it("returns empty for no common substring", () => {
      const st = new SuffixTree("abc");
      expect(st.longestCommonSubstring("xyz")).toBe("");
    });

    it("returns empty for empty other string", () => {
      const st = new SuffixTree("abc");
      expect(st.longestCommonSubstring("")).toBe("");
    });

    it("finds entire other string when contained", () => {
      const st = new SuffixTree("abcdef");
      expect(st.longestCommonSubstring("cde")).toBe("cde");
    });

    it("finds single char common substring", () => {
      const st = new SuffixTree("abc");
      expect(st.longestCommonSubstring("xcx")).toBe("c");
    });

    it("finds longest among multiple common substrings", () => {
      const st = new SuffixTree("abcdefxyz");
      const lcs = st.longestCommonSubstring("xyzabc");
      expect(lcs.length).toBeGreaterThanOrEqual(3);
    });

    it("handles identical strings", () => {
      const st = new SuffixTree("abcdef");
      expect(st.longestCommonSubstring("abcdef")).toBe("abcdef");
    });

    it("handles common substring at end", () => {
      const st = new SuffixTree("helloworld");
      expect(st.longestCommonSubstring("world")).toBe("world");
    });

    it("handles common substring at start", () => {
      const st = new SuffixTree("helloworld");
      expect(st.longestCommonSubstring("hello")).toBe("hello");
    });

    it("handles single character strings", () => {
      const st = new SuffixTree("a");
      expect(st.longestCommonSubstring("a")).toBe("a");
      expect(st.longestCommonSubstring("b")).toBe("");
    });
  });

  describe("leaves", () => {
    it("returns all suffix indices", () => {
      const st = new SuffixTree("abc");
      const lvs = st.leaves;
      expect(lvs.sort()).toEqual([0, 1, 2, 3]);
    });

    it("returns correct count for empty string", () => {
      const st = new SuffixTree("");
      expect(st.leaves).toEqual([0]);
    });

    it("returns correct count for single char", () => {
      const st = new SuffixTree("a");
      expect(st.leaves.sort()).toEqual([0, 1]);
    });

    it("returns indices for banana", () => {
      const st = new SuffixTree("banana");
      const lvs = st.leaves;
      expect(lvs.sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it("has length equal to size", () => {
      const st = new SuffixTree("abcdef");
      expect(st.leaves.length).toBe(st.size);
    });
  });

  describe("size", () => {
    it("returns text length plus one for terminator", () => {
      const st = new SuffixTree("abc");
      expect(st.size).toBe(4);
    });

    it("returns 1 for empty string", () => {
      const st = new SuffixTree("");
      expect(st.size).toBe(1);
    });

    it("returns 2 for single char", () => {
      const st = new SuffixTree("a");
      expect(st.size).toBe(2);
    });

    it("returns correct size for long string", () => {
      const st = new SuffixTree("abcdefghij");
      expect(st.size).toBe(11);
    });
  });

  describe("nodeCount", () => {
    it("returns at least 1 for empty string", () => {
      const st = new SuffixTree("");
      expect(st.nodeCount).toBeGreaterThanOrEqual(1);
    });

    it("returns more nodes for longer strings", () => {
      const st1 = new SuffixTree("a");
      const st2 = new SuffixTree("abc");
      expect(st2.nodeCount).toBeGreaterThan(st1.nodeCount);
    });

    it("includes root node in count", () => {
      const st = new SuffixTree("");
      expect(st.nodeCount).toBeGreaterThanOrEqual(1);
    });

    it("returns correct count for unique chars", () => {
      const st = new SuffixTree("abc");
      const nc = st.nodeCount;
      expect(nc).toBeGreaterThan(0);
    });
  });

  describe("toObject", () => {
    it("serializes tree to plain object", () => {
      const st = new SuffixTree("abc");
      const obj = st.toObject();
      expect(obj.text).toBe("abc$");
      expect(obj.root).toBeDefined();
      expect(obj.root.children).toBeDefined();
    });

    it("includes root node with children", () => {
      const st = new SuffixTree("abc");
      const obj = st.toObject();
      expect(Object.keys(obj.root.children).length).toBeGreaterThan(0);
    });

    it("includes start and end for each node", () => {
      const st = new SuffixTree("abc");
      const obj = st.toObject();
      expect(obj.root.start).toBeDefined();
      expect(obj.root.end).toBeDefined();
    });

    it("includes suffixIndex for each node", () => {
      const st = new SuffixTree("abc");
      const obj = st.toObject();
      expect(obj.root.suffixIndex).toBeDefined();
    });

    it("serializes empty tree", () => {
      const st = new SuffixTree("");
      const obj = st.toObject();
      expect(obj.text).toBe("$");
      expect(obj.root).toBeDefined();
    });

    it("preserves terminator in text", () => {
      const st = new SuffixTree("abc", { terminator: "#" });
      const obj = st.toObject();
      expect(obj.text).toBe("abc#");
    });
  });

  describe("fromObject", () => {
    it("reconstructs tree from serialized object", () => {
      const st1 = new SuffixTree("banana");
      const obj = st1.toObject();
      const st2 = SuffixTree.fromObject(obj);
      expect(st2.has("banana")).toBe(true);
      expect(st2.has("ana")).toBe(true);
      expect(st2.has("xyz")).toBe(false);
    });

    it("preserves search results after reconstruction", () => {
      const st1 = new SuffixTree("abcabc");
      const obj = st1.toObject();
      const st2 = SuffixTree.fromObject(obj);
      const r1 = st1.search("abc").sort();
      const r2 = st2.search("abc").sort();
      expect(r1).toEqual(r2);
    });

    it("preserves count results after reconstruction", () => {
      const st1 = new SuffixTree("aaaa");
      const obj = st1.toObject();
      const st2 = SuffixTree.fromObject(obj);
      expect(st2.count("aa")).toBe(3);
      expect(st2.count("a")).toBe(4);
    });

    it("preserves custom terminator", () => {
      const st1 = new SuffixTree("abc", { terminator: "#" });
      const obj = st1.toObject();
      const st2 = SuffixTree.fromObject(obj);
      expect(st2.has("abc")).toBe(true);
    });

    it("handles empty string reconstruction", () => {
      const st1 = new SuffixTree("");
      const obj = st1.toObject();
      const st2 = SuffixTree.fromObject(obj);
      expect(st2.size).toBe(1);
    });

    it("roundtrip preserves longestRepeatedSubstring", () => {
      const st1 = new SuffixTree("banana");
      const obj = st1.toObject();
      const st2 = SuffixTree.fromObject(obj);
      expect(st2.longestRepeatedSubstring()).toBe(
        st1.longestRepeatedSubstring(),
      );
    });
  });

  describe("edge cases", () => {
    it("handles string with spaces", () => {
      const st = new SuffixTree("hello world");
      expect(st.has("hello")).toBe(true);
      expect(st.has("world")).toBe(true);
      expect(st.has(" ")).toBe(true);
      expect(st.has("lo wo")).toBe(true);
    });

    it("handles string with digits", () => {
      const st = new SuffixTree("abc123abc");
      expect(st.has("abc")).toBe(true);
      expect(st.has("123")).toBe(true);
      expect(st.count("abc")).toBe(2);
    });

    it("handles unicode characters", () => {
      const st = new SuffixTree("café");
      expect(st.has("caf")).toBe(true);
      expect(st.has("é")).toBe(true);
    });

    it("handles emoji", () => {
      const st = new SuffixTree("hello🌍world");
      expect(st.has("🌍")).toBe(true);
      expect(st.has("hello")).toBe(true);
      expect(st.has("world")).toBe(true);
    });

    it("handles special characters", () => {
      const st = new SuffixTree("a\nb\tc");
      expect(st.has("\n")).toBe(true);
      expect(st.has("\t")).toBe(true);
      expect(st.has("a\n")).toBe(true);
    });

    it("handles all same characters", () => {
      const st = new SuffixTree("aaaaa");
      expect(st.count("a")).toBe(5);
      expect(st.count("aa")).toBe(4);
      expect(st.count("aaa")).toBe(3);
      expect(st.count("aaaa")).toBe(2);
      expect(st.count("aaaaa")).toBe(1);
      expect(st.longestRepeatedSubstring()).toBe("aaaa");
    });

    it("handles two character alphabet", () => {
      const st = new SuffixTree("abababab");
      expect(st.count("ab")).toBe(4);
      expect(st.count("ba")).toBe(3);
      expect(st.count("aba")).toBe(3);
      expect(st.count("bab")).toBe(3);
    });

    it("handles string where every char is unique", () => {
      const st = new SuffixTree("abcdef");
      expect(st.longestRepeatedSubstring()).toBe("");
      expect(st.count("a")).toBe(1);
      expect(st.count("b")).toBe(1);
    });

    it("handles string that is palindrome", () => {
      const st = new SuffixTree("abba");
      expect(st.has("ab")).toBe(true);
      expect(st.has("ba")).toBe(true);
      expect(st.has("bb")).toBe(true);
      expect(st.has("abba")).toBe(true);
      expect(st.count("a")).toBe(2);
      expect(st.count("b")).toBe(2);
    });

    it("handles very short strings", () => {
      const st1 = new SuffixTree("a");
      expect(st1.has("a")).toBe(true);
      expect(st1.has("b")).toBe(false);

      const st2 = new SuffixTree("ab");
      expect(st2.has("a")).toBe(true);
      expect(st2.has("b")).toBe(true);
      expect(st2.has("ab")).toBe(true);
      expect(st2.has("ba")).toBe(false);
    });

    it("handles pattern exactly at end of text", () => {
      const st = new SuffixTree("abcdef");
      expect(st.search("ef")).toEqual([4]);
      expect(st.search("f")).toEqual([5]);
    });

    it("handles repeated pattern search", () => {
      const st = new SuffixTree("abcabcabc");
      expect(st.search("abc").sort()).toEqual([0, 3, 6]);
      expect(st.search("cab").sort()).toEqual([2, 5]);
    });

    it("handles search with partial match", () => {
      const st = new SuffixTree("abcdef");
      expect(st.search("bcd")).toEqual([1]);
      expect(st.search("cde")).toEqual([2]);
      expect(st.search("abd")).toEqual([]);
    });

    it("handles alternating characters", () => {
      const st = new SuffixTree("ababab");
      expect(st.count("ab")).toBe(3);
      expect(st.count("ba")).toBe(2);
      expect(st.count("aba")).toBe(2);
      expect(st.count("bab")).toBe(2);
      expect(st.count("abab")).toBe(2);
      expect(st.count("ababab")).toBe(1);
    });

    it("handles deeply nested repeated patterns", () => {
      const st = new SuffixTree("aaaabaaaab");
      expect(st.count("aaaab")).toBe(2);
      expect(st.count("aaaa")).toBe(2);
      expect(st.count("aa")).toBe(6);
    });

    it("handles pattern longer than text", () => {
      const st = new SuffixTree("ab");
      expect(st.has("abc")).toBe(false);
      expect(st.search("abc")).toEqual([]);
      expect(st.count("abc")).toBe(0);
    });

    it("correct leaf indices for banana", () => {
      const st = new SuffixTree("banana");
      expect(st.search("banana")).toEqual([0]);
      expect(st.search("anana")).toEqual([1]);
      expect(st.search("nana")).toEqual([2]);
      expect(st.search("ana")).toEqual([3, 1]);
      expect(st.search("na")).toEqual([4, 2]);
      expect(st.search("a")).toEqual([5, 3, 1]);
    });

    it("nodeCount is greater for more complex strings", () => {
      const st1 = new SuffixTree("abc");
      const st2 = new SuffixTree("banana");
      const st3 = new SuffixTree("mississippi");
      expect(st2.nodeCount).toBeGreaterThan(st1.nodeCount);
      expect(st3.nodeCount).toBeGreaterThan(st2.nodeCount);
    });

    it("handles substring spanning multiple edges", () => {
      const st = new SuffixTree("abcdefghij");
      expect(st.has("abcdefghij")).toBe(true);
      expect(st.has("abcdef")).toBe(true);
      expect(st.has("fghij")).toBe(true);
      expect(st.has("cdefg")).toBe(true);
    });

    it("longestCommonSubstring with reversed string", () => {
      const st = new SuffixTree("abcdef");
      const lcs = st.longestCommonSubstring("fedcba");
      expect(lcs.length).toBeGreaterThan(0);
    });

    it("count for each position in banana", () => {
      const st = new SuffixTree("banana");
      expect(st.count("b")).toBe(1);
      expect(st.count("a")).toBe(3);
      expect(st.count("n")).toBe(2);
    });

    it("handles mississippi", () => {
      const st = new SuffixTree("mississippi");
      expect(st.has("miss")).toBe(true);
      expect(st.has("iss")).toBe(true);
      expect(st.has("ssi")).toBe(true);
      expect(st.has("ppi")).toBe(true);
      expect(st.count("i")).toBe(4);
      expect(st.count("s")).toBe(4);
      expect(st.count("p")).toBe(2);
      expect(st.count("ss")).toBe(2);
      expect(st.count("iss")).toBe(2);
      expect(st.count("si")).toBe(2);
      expect(st.count("ppi")).toBe(1);
    });

    it("handles abababab search results", () => {
      const st = new SuffixTree("abababab");
      const ab = st.search("ab").sort();
      const ba = st.search("ba").sort();
      const abab = st.search("abab").sort();
      expect(ab).toEqual([0, 2, 4, 6]);
      expect(ba).toEqual([1, 3, 5]);
      expect(abab).toEqual([0, 2, 4]);
    });

    it("handles abcdeabcde", () => {
      const st = new SuffixTree("abcdeabcde");
      expect(st.search("abcde").sort()).toEqual([0, 5]);
      expect(st.search("bcde").sort()).toEqual([1, 6]);
      expect(st.search("eabc").sort()).toEqual([4]);
      expect(st.longestRepeatedSubstring()).toBe("abcde");
    });
  });
});
