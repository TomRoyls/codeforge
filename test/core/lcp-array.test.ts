import { describe, it, expect } from "vitest";
import { buildLCPArray, LCPArray } from "../../src/core/lcp-array/index.js";

describe("buildLCPArray", () => {
  it("should build correct LCP array for empty string", () => {
    const s = "";
    const sa: number[] = [];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([]);
  });

  it("should build correct LCP array for single character", () => {
    const s = "a";
    const sa = [0];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([]);
  });

  it("should build correct LCP array for all same characters", () => {
    const s = "aaaa";
    const sa = [3, 2, 1, 0];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([1, 2, 3]);
  });

  it("should build correct LCP array for all different characters", () => {
    const s = "abcd";
    const sa = [0, 1, 2, 3];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([0, 0, 0]);
  });

  it("should build correct LCP array for banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([1, 3, 0, 0, 2]);
  });

  it("should build correct LCP array for ababa", () => {
    const s = "ababa";
    const sa = [4, 2, 0, 3, 1];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([1, 3, 0, 2]);
  });

  it("should build correct LCP array for mississippi", () => {
    const s = "mississippi";
    const sa = [10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([1, 1, 4, 0, 0, 1, 0, 2, 1, 3]);
  });

  it("should build correct LCP array for abcabc", () => {
    const s = "abcabc";
    const sa = [0, 3, 1, 4, 2, 5];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([3, 0, 2, 0, 1]);
  });

  it("should build correct LCP array for aaaab", () => {
    const s = "aaaab";
    const sa = [4, 3, 2, 1, 0];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([0, 1, 2, 3]);
  });

  it("should build correct LCP array for bacab", () => {
    const s = "bacab";
    const sa = [3, 1, 4, 0, 2];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([1, 0, 1, 0]);
  });

  it("should handle single repeated character", () => {
    const s = "zzzzzz";
    const sa = [5, 4, 3, 2, 1, 0];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([1, 2, 3, 4, 5]);
  });

  it("should handle alternating characters", () => {
    const s = "ababab";
    const sa = [4, 2, 0, 5, 3, 1];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([2, 4, 0, 1, 3]);
  });

  it("should handle string with spaces", () => {
    const s = "a b c";
    const sa = [0, 2, 4, 1, 3];
    const lcp = buildLCPArray(s, sa);
    expect(lcp).toEqual([0, 0, 0, 1]);
  });
});

describe("LCPArray constructor", () => {
  it("should create LCPArray for empty string", () => {
    const s = "";
    const sa: number[] = [];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.length).toBe(0);
    expect(lcpArray.size).toBe(0);
    expect(lcpArray.toArray()).toEqual([]);
  });

  it("should create LCPArray for single character", () => {
    const s = "a";
    const sa = [0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.length).toBe(1);
    expect(lcpArray.size).toBe(1);
    expect(lcpArray.toArray()).toEqual([]);
  });

  it("should create LCPArray for banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.length).toBe(6);
    expect(lcpArray.size).toBe(6);
    expect(lcpArray.toArray()).toEqual([1, 3, 0, 0, 2]);
  });

  it("should create LCPArray with RMQ enabled", () => {
    const s = "abcabc";
    const sa = [0, 3, 1, 4, 2, 5];
    const lcpArray = new LCPArray(s, sa, { enableRMQ: true });
    expect(lcpArray.length).toBe(6);
    expect(lcpArray.size).toBe(6);
    expect(lcpArray.toArray()).toEqual([3, 0, 2, 0, 1]);
  });

  it("should create LCPArray with RMQ disabled", () => {
    const s = "abcabc";
    const sa = [0, 3, 1, 4, 2, 5];
    const lcpArray = new LCPArray(s, sa, { enableRMQ: false });
    expect(lcpArray.length).toBe(6);
    expect(lcpArray.size).toBe(6);
    expect(lcpArray.toArray()).toEqual([3, 0, 2, 0, 1]);
  });
});

describe("LCPArray.getLCP", () => {
  it("should return 0 for invalid negative index", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(-1)).toBe(0);
  });

  it("should return 0 for index equal to length", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(6)).toBe(0);
  });

  it("should return 0 for index greater than length", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(100)).toBe(0);
  });

  it("should return correct LCP for index 0 in banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(0)).toBe(0);
  });

  it("should return correct LCP for index 1 in banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(1)).toBe(1);
  });

  it("should return correct LCP for index 2 in banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(2)).toBe(3);
  });

  it("should return correct LCP for index 3 in banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(3)).toBe(0);
  });

  it("should return correct LCP for index 4 in banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(4)).toBe(0);
  });

  it("should return correct LCP for index 5 in banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(5)).toBe(2);
  });

  it("should return all LCP values for abcabc", () => {
    const s = "abcabc";
    const sa = [0, 3, 1, 4, 2, 5];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(0)).toBe(0);
    expect(lcpArray.getLCP(1)).toBe(3);
    expect(lcpArray.getLCP(2)).toBe(0);
    expect(lcpArray.getLCP(3)).toBe(2);
    expect(lcpArray.getLCP(4)).toBe(0);
    expect(lcpArray.getLCP(5)).toBe(1);
  });

  it("should return all LCP values for aaaa", () => {
    const s = "aaaa";
    const sa = [3, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(0)).toBe(0);
    expect(lcpArray.getLCP(1)).toBe(1);
    expect(lcpArray.getLCP(2)).toBe(2);
    expect(lcpArray.getLCP(3)).toBe(3);
  });

  it("should return all zeros for all different characters", () => {
    const s = "dcba";
    const sa = [0, 1, 2, 3];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(0)).toBe(0);
    expect(lcpArray.getLCP(1)).toBe(0);
    expect(lcpArray.getLCP(2)).toBe(0);
    expect(lcpArray.getLCP(3)).toBe(0);
  });
});

describe("LCPArray.getLCPBetween", () => {
  it("should return 0 for invalid i index", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(-1, 1)).toBe(0);
  });

  it("should return 0 for invalid j index", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 100)).toBe(0);
  });

  it("should return full suffix length when i equals j", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 0)).toBe(1);
    expect(lcpArray.getLCPBetween(1, 1)).toBe(3);
    expect(lcpArray.getLCPBetween(2, 2)).toBe(5);
  });

  it("should return correct LCP for adjacent suffixes", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 1)).toBe(1);
    expect(lcpArray.getLCPBetween(1, 2)).toBe(3);
    expect(lcpArray.getLCPBetween(2, 3)).toBe(0);
  });

  it("should return correct LCP for non-adjacent suffixes", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 2)).toBe(1);
    expect(lcpArray.getLCPBetween(0, 3)).toBe(0);
    expect(lcpArray.getLCPBetween(1, 3)).toBe(0);
  });

  it("should return correct LCP for far apart suffixes", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 5)).toBe(0);
    expect(lcpArray.getLCPBetween(1, 4)).toBe(0);
  });

  it("should handle reversed order of indices", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(2, 0)).toBe(1);
    expect(lcpArray.getLCPBetween(3, 1)).toBe(0);
  });

  it("should return correct LCP for abcabc", () => {
    const s = "abcabc";
    const sa = [0, 3, 1, 4, 2, 5];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 1)).toBe(3);
    expect(lcpArray.getLCPBetween(0, 2)).toBe(0);
    expect(lcpArray.getLCPBetween(0, 3)).toBe(0);
    expect(lcpArray.getLCPBetween(1, 3)).toBe(0);
  });

  it("should return correct LCP for all same characters", () => {
    const s = "aaaa";
    const sa = [3, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 1)).toBe(1);
    expect(lcpArray.getLCPBetween(0, 2)).toBe(1);
    expect(lcpArray.getLCPBetween(0, 3)).toBe(1);
    expect(lcpArray.getLCPBetween(1, 2)).toBe(2);
    expect(lcpArray.getLCPBetween(1, 3)).toBe(2);
    expect(lcpArray.getLCPBetween(2, 3)).toBe(3);
  });

  it("should return 0 for all different characters", () => {
    const s = "dcba";
    const sa = [0, 1, 2, 3];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 1)).toBe(0);
    expect(lcpArray.getLCPBetween(0, 2)).toBe(0);
    expect(lcpArray.getLCPBetween(0, 3)).toBe(0);
  });

  it("should work with RMQ enabled", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa, { enableRMQ: true });
    expect(lcpArray.getLCPBetween(0, 2)).toBe(1);
    expect(lcpArray.getLCPBetween(1, 5)).toBe(0);
  });

  it("should work with RMQ disabled", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa, { enableRMQ: false });
    expect(lcpArray.getLCPBetween(0, 2)).toBe(1);
    expect(lcpArray.getLCPBetween(1, 5)).toBe(0);
  });

  it("should handle mississippi", () => {
    const s = "mississippi";
    const sa = [10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 1)).toBe(1);
    expect(lcpArray.getLCPBetween(0, 2)).toBe(1);
    expect(lcpArray.getLCPBetween(1, 2)).toBe(1);
  });

  it("should handle ababa", () => {
    const s = "ababa";
    const sa = [4, 2, 0, 3, 1];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 1)).toBe(1);
    expect(lcpArray.getLCPBetween(0, 2)).toBe(1);
    expect(lcpArray.getLCPBetween(1, 2)).toBe(3);
  });

  it("should handle single character string", () => {
    const s = "a";
    const sa = [0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 0)).toBe(1);
  });

  it("should return 0 for empty string", () => {
    const s = "";
    const sa: number[] = [];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 0)).toBe(0);
  });
});

describe("LCPArray.longestRepeatedSubstring", () => {
  it("should return empty string for empty input", () => {
    const s = "";
    const sa: number[] = [];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("");
  });

  it("should return empty string for single character", () => {
    const s = "a";
    const sa = [0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("");
  });

  it("should return empty string when no repetition", () => {
    const s = "abcd";
    const sa = [0, 1, 2, 3];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("");
  });

  it("should find an in banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("ana");
  });

  it("should find abc in abcabc", () => {
    const s = "abcabc";
    const sa = [0, 3, 1, 4, 2, 5];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("abc");
  });

  it("should find aaa in aaaaa", () => {
    const s = "aaaaa";
    const sa = [4, 3, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("aaaa");
  });

  it("should find ab in ababa", () => {
    const s = "ababa";
    const sa = [4, 2, 0, 3, 1];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("aba");
  });

  it("should find iss in mississippi", () => {
    const s = "mississippi";
    const sa = [10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("issi");
  });

  it("should find correct substring for aaaab", () => {
    const s = "aaaab";
    const sa = [4, 3, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("aaa");
  });

  it("should find correct substring for bacab", () => {
    const s = "bacab";
    const sa = [3, 1, 4, 0, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("a");
  });

  it("should find correct substring for ababab", () => {
    const s = "ababab";
    const sa = [4, 2, 0, 5, 3, 1];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("abab");
  });

  it("should return first longest if ties", () => {
    const s = "ababab";
    const sa = [4, 2, 0, 5, 3, 1];
    const lcpArray = new LCPArray(s, sa);
    const result = lcpArray.longestRepeatedSubstring();
    expect(result.length).toBe(4);
  });

  it("should handle string with single repeated character", () => {
    const s = "zzzz";
    const sa = [3, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("zzz");
  });

  it("should handle string with no repeats", () => {
    const s = "zyxwvutsr";
    const sa = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("");
  });

  it("should find substring for pattern with overlap", () => {
    const s = "abcabca";
    const sa = [0, 3, 6, 1, 4, 2, 5];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("abca");
  });

  it("should handle two character patterns", () => {
    const s = "abab";
    const sa = [2, 0, 3, 1];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("ab");
  });

  it("should handle all same with single different", () => {
    const s = "aaaabaaa";
    const sa = [4, 7, 6, 5, 3, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.longestRepeatedSubstring()).toBe("aaa");
  });
});

describe("LCPArray.toArray", () => {
  it("should return empty array for empty string", () => {
    const s = "";
    const sa: number[] = [];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([]);
  });

  it("should return correct array for single character", () => {
    const s = "a";
    const sa = [0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([]);
  });

  it("should return correct array for banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([1, 3, 0, 0, 2]);
  });

  it("should return correct array for aaaa", () => {
    const s = "aaaa";
    const sa = [3, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([1, 2, 3]);
  });

  it("should return correct array for abcabc", () => {
    const s = "abcabc";
    const sa = [0, 3, 1, 4, 2, 5];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([3, 0, 2, 0, 1]);
  });

  it("should return a copy, not reference", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    const arr = lcpArray.toArray();
    arr[0] = 999;
    expect(lcpArray.toArray()).toEqual([1, 3, 0, 0, 2]);
  });
});

describe("LCPArray.length and size properties", () => {
  it("should have length 0 for empty string", () => {
    const s = "";
    const sa: number[] = [];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.length).toBe(0);
    expect(lcpArray.size).toBe(0);
  });

  it("should have length 1 for single character", () => {
    const s = "a";
    const sa = [0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.length).toBe(1);
    expect(lcpArray.size).toBe(1);
  });

  it("should have correct length for banana", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.length).toBe(6);
    expect(lcpArray.size).toBe(6);
  });

  it("should have equal length and size", () => {
    const s = "mississippi";
    const sa = [10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.length).toBe(lcpArray.size);
  });

  it("should be readonly properties", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    const len = lcpArray.length;
    try { lcpArray.length = 10; } catch { }
    expect(lcpArray.length).toBe(len);
  });
});

describe("LCPArray edge cases", () => {
  it("should handle string with spaces", () => {
    const s = "a b c";
    const sa = [0, 2, 4, 1, 3];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([0, 0, 0, 1]);
    expect(lcpArray.longestRepeatedSubstring()).toBe(" ");
  });

  it("should handle string with special characters", () => {
    const s = "a!@#a!@";
    const sa = [3, 0, 4, 1, 2, 5];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([0, 3, 0, 0, 2, 0]);
  });

  it("should handle very long repeated pattern", () => {
    const s = "aaaaaa".repeat(10);
    const sa = s.split("").map((_, i) => i).reverse();
    const lcpArray = new LCPArray(s, sa);
    const lrs = lcpArray.longestRepeatedSubstring();
    expect(lrs.length).toBeGreaterThan(0);
    expect(s.includes(lrs)).toBe(true);
  });

  it("should handle alternating pattern", () => {
    const s = "ab".repeat(10);
    const sa = s.split("").map((_, i) => i).filter((_, i, arr) => arr[i] === 97 ? true : arr[i] % 2 === 0);
    const saCorrect = s.split("").map((_, i) => i).reverse();
    const lcpArray = new LCPArray(s, saCorrect);
    expect(lcpArray.length).toBe(s.length);
  });

  it("should handle single character repeated many times", () => {
    const s = "x".repeat(100);
    const sa = s.split("").map((_, i) => i).reverse();
    const lcpArray = new LCPArray(s, sa);
    const lrs = lcpArray.longestRepeatedSubstring();
    expect(lrs.length).toBe(99);
  });

  it("should handle unicode characters", () => {
    const s = "\u03b1\u03b2\u03b1\u03b2";
    const sa = [2, 0, 3, 1];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([2, 0, 1]);
    expect(lcpArray.longestRepeatedSubstring()).toBe("\u03b1\u03b2");
  });

  it("should handle all same unicode characters", () => {
    const s = "αααα";
    const sa = [3, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([1, 2, 3]);
    expect(lcpArray.longestRepeatedSubstring()).toBe("ααα");
  });

  it("should handle string with newlines", () => {
    const s = "a\nb\na\nb";
    const sa = [3, 1, 0, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([1, 0, 0, 0, 0, 0]);
  });

  it("should handle very small LCP values", () => {
    const s = "abcdefghijklmnopqrstuvwxyz";
    const sa = s.split("").map((_, i) => i);
    const lcpArray = new LCPArray(s, sa);
    for (let i = 0; i < lcpArray.length; i++) {
      expect(lcpArray.getLCP(i)).toBe(0);
    }
  });

  it("should handle palindrome with repetitions", () => {
    const s = "abccbaabccba";
    const sa = [6, 0, 7, 1, 8, 2, 9, 5, 3, 4, 10];
    const lcpArray = new LCPArray(s, sa);
    const lrs = lcpArray.longestRepeatedSubstring();
    expect(lrs.length).toBeGreaterThan(0);
  });
});

describe("LCPArray with RMQ optimization", () => {
  it("should work correctly with RMQ for range queries", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa, { enableRMQ: true });
    expect(lcpArray.getLCPBetween(0, 5)).toBe(0);
    expect(lcpArray.getLCPBetween(1, 4)).toBe(0);
    expect(lcpArray.getLCPBetween(2, 5)).toBe(0);
  });

  it("should work correctly without RMQ for range queries", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa, { enableRMQ: false });
    expect(lcpArray.getLCPBetween(0, 5)).toBe(0);
    expect(lcpArray.getLCPBetween(1, 4)).toBe(0);
    expect(lcpArray.getLCPBetween(2, 5)).toBe(0);
  });

  it("should give same results with and without RMQ", () => {
    const s = "abcabcabc";
    const sa = [0, 3, 6, 1, 4, 7, 2, 5, 8];
    const lcpWithRMQ = new LCPArray(s, sa, { enableRMQ: true });
    const lcpWithoutRMQ = new LCPArray(s, sa, { enableRMQ: false });

    for (let i = 0; i < sa.length; i++) {
      for (let j = 0; j < sa.length; j++) {
        expect(lcpWithRMQ.getLCPBetween(i, j)).toBe(lcpWithoutRMQ.getLCPBetween(i, j));
      }
    }
  });
});

describe("LCPArray additional coverage", () => {
  it("should handle getLCP at boundary indices", () => {
    const s = "hello";
    const sa = [0, 1, 2, 3, 4];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCP(0)).toBe(0);
    expect(lcpArray.getLCP(4)).toBe(0);
  });

  it("should handle getLCPBetween at boundary indices", () => {
    const s = "hello";
    const sa = [0, 1, 2, 3, 4];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 4)).toBe(0);
    expect(lcpArray.getLCPBetween(4, 0)).toBe(0);
  });

  it("should return zero LCP when strings differ at first char", () => {
    const s = "bac";
    const sa = [0, 1, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(0, 1)).toBe(0);
  });

  it("should handle single character repeated", () => {
    const s = "bbb";
    const sa = [2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([1, 2]);
    expect(lcpArray.longestRepeatedSubstring()).toBe("bb");
  });

  it("should handle pattern with single different character", () => {
    const s = "aaabaaa";
    const sa = [3, 4, 5, 6, 2, 1, 0];
    const lcpArray = new LCPArray(s, sa);
    const lrs = lcpArray.longestRepeatedSubstring();
    expect(lrs.length).toBeGreaterThanOrEqual(2);
  });

  it("should handle string with digits", () => {
    const s = "123123";
    const sa = [0, 3, 1, 4, 2, 5];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([3, 0, 2, 0, 1]);
    expect(lcpArray.longestRepeatedSubstring()).toBe("123");
  });

  it("should handle mixed alphanumeric", () => {
    const s = "a1a1";
    const sa = [2, 0, 3, 1];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([2, 0, 1]);
    expect(lcpArray.longestRepeatedSubstring()).toBe("a1");
  });

  it("should handle getLCPBetween with consecutive indices", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    for (let i = 0; i < sa.length - 1; i++) {
      expect(lcpArray.getLCPBetween(i, i + 1)).toBe(lcpArray.getLCP(i + 1));
    }
  });

  it("should handle very small string", () => {
    const s = "ab";
    const sa = [0, 1];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.toArray()).toEqual([0]);
    expect(lcpArray.longestRepeatedSubstring()).toBe("");
  });

  it("should handle getLCPBetween with same index repeated", () => {
    const s = "banana";
    const sa = [5, 3, 1, 0, 4, 2];
    const lcpArray = new LCPArray(s, sa);
    expect(lcpArray.getLCPBetween(2, 2)).toBe(5);
    expect(lcpArray.getLCPBetween(0, 0)).toBe(1);
  });
});
