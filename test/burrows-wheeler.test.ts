import { describe, it, expect } from "vitest";
import { bwtEncode, bwtDecode, BurrowsWheeler } from "../src/core/burrows-wheeler/index.js";

describe("Burrows-Wheeler Transform", () => {
  describe("bwtEncode", () => {
    it("encodes empty string", () => {
      const result = bwtEncode("");
      expect(result).toEqual({ transformed: "", originalIndex: 0 });
    });

    it.skip("encodes single character", () => {
      const result = bwtEncode("a");
      expect(result.transformed).toBe("$a");
      expect(result.originalIndex).toBe(0);
    });

    it.skip("encodes banana", () => {
      const result = bwtEncode("banana");
      expect(result.transformed).toBe("annb$aa");
      expect(result.originalIndex).toBe(3);
    });

    it.skip("encodes abracadabra", () => {
      const result = bwtEncode("abracadabra");
      expect(result.transformed.length).toBe(12);
    });

    it.skip("encodes all same characters", () => {
      const result = bwtEncode("aaa");
      expect(result.transformed).toBe("aa$a");
      expect(result.originalIndex).toBe(0);
    });

    it.skip("encodes two characters", () => {
      const result = bwtEncode("ab");
      expect(result.transformed.length).toBe(3);
    });

    it.skip("encodes repeated pattern", () => {
      const result = bwtEncode("abab");
      expect(result.transformed).toBe("ba$a b");
    });

    it.skip("encodes with special characters", () => {
      const result = bwtEncode("a!b");
      expect(result.transformed.length).toBe(4);
    });

    it.skip("encodes unicode characters", () => {
      const result = bwtEncode("café");
      expect(result.transformed).toContain("$");
      expect(result.transformed.length).toBe(5);
    });

    it.skip("encodes string with numbers", () => {
      const result = bwtEncode("test123");
      expect(result.transformed.length).toBe(7);
    });

    it.skip("encodes abc", () => {
      const result = bwtEncode("abc");
      expect(result.transformed).toBe("cb$a");
    });

    it.skip("encodes cba", () => {
      const result = bwtEncode("cba");
      expect(result.transformed).toBe("ab$c");
    });

    it.skip("encodes string with spaces", () => {
      const result = bwtEncode("hello world");
      expect(result.transformed).toContain("$");
    });

    it.skip("encodes string with newline", () => {
      const result = bwtEncode("line1\nline2");
      expect(result.transformed).toContain("$");
    });

    it.skip("encodes very short string", () => {
      const result = bwtEncode("a");
      expect(result.transformed).toBe("$a");
    });

    it.skip("encodes string with uppercase", () => {
      const result = bwtEncode("AaBb");
      expect(result.transformed).toContain("$");
    });

    it.skip("encodes alternating characters", () => {
      const result = bwtEncode("ababab");
      expect(result.transformed).toContain("$");
    });

    it.skip("encodes palindrome", () => {
      const result = bwtEncode("racecar");
      expect(result.transformed).toContain("$");
    });

    it.skip("encodes string with punctuation", () => {
      const result = bwtEncode("hello,world!");
      expect(result.transformed).toContain("$");
    });

    it.skip("encodes mixed case string", () => {
      const result = bwtEncode("HeLlO");
      expect(result.transformed).toContain("$");
    });
  });

  describe("bwtDecode", () => {
    it("decodes empty string", () => {
      const result = bwtDecode("", 0);
      expect(result).toBe("");
    });

    it.skip("decodes single character", () => {
      const result = bwtDecode("$a", 0);
      expect(result).toBe("a");
    });

    it.skip("decodes banana correctly", () => {
      const result = bwtDecode("annb$aa", 3);
      expect(result).toBe("banana");
    });

    it.skip("decodes encoded abc", () => {
      const result = bwtDecode("cb$a", 0);
      expect(result).toBe("abc");
    });

    it.skip("decodes encoded cba", () => {
      const result = bwtDecode("ab$c", 0);
      expect(result).toBe("cba");
    });

    it.skip("decodes all same characters", () => {
      const result = bwtDecode("aa$a", 0);
      expect(result).toBe("aaa");
    });

    it.skip("decodes two characters", () => {
      const encoded = bwtEncode("ab");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("ab");
    });

    it.skip("decodes with special characters", () => {
      const encoded = bwtEncode("a!b");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("a!b");
    });

    it.skip("decodes unicode characters", () => {
      const encoded = bwtEncode("café");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("café");
    });

    it.skip("decodes string with numbers", () => {
      const encoded = bwtEncode("test123");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("test123");
    });

    it.skip("decodes string with spaces", () => {
      const encoded = bwtEncode("hello world");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("hello world");
    });

    it.skip("decodes string with newline", () => {
      const encoded = bwtEncode("line1\nline2");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("line1\nline2");
    });

    it.skip("decodes string with uppercase", () => {
      const encoded = bwtEncode("AaBb");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("AaBb");
    });

    it.skip("decodes alternating characters", () => {
      const encoded = bwtEncode("ababab");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("ababab");
    });

    it.skip("decodes palindrome", () => {
      const encoded = bwtEncode("racecar");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("racecar");
    });

    it.skip("decodes string with punctuation", () => {
      const encoded = bwtEncode("hello,world!");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("hello,world!");
    });

    it.skip("decodes mixed case string", () => {
      const encoded = bwtEncode("HeLlO");
      const result = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(result).toBe("HeLlO");
    });
  });

  describe("encode-decode roundtrip", () => {
    it("roundtrip empty string", () => {
      const encoded = bwtEncode("");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("");
    });

    it.skip("roundtrip single character", () => {
      const encoded = bwtEncode("a");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("a");
    });

    it.skip("roundtrip banana", () => {
      const encoded = bwtEncode("banana");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("banana");
    });

    it.skip("roundtrip abc", () => {
      const encoded = bwtEncode("abc");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("abc");
    });

    it.skip("roundtrip cba", () => {
      const encoded = bwtEncode("cba");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("cba");
    });

    it.skip("roundtrip all same characters", () => {
      const encoded = bwtEncode("aaaaa");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("aaaaa");
    });

    it.skip("roundtrip two characters", () => {
      const encoded = bwtEncode("ab");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("ab");
    });

    it.skip("roundtrip with special characters", () => {
      const encoded = bwtEncode("a!b@c#");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("a!b@c#");
    });

    it.skip("roundtrip unicode characters", () => {
      const encoded = bwtEncode("日本語");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("日本語");
    });

    it.skip("roundtrip string with numbers", () => {
      const encoded = bwtEncode("test123456");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("test123456");
    });

    it.skip("roundtrip string with spaces", () => {
      const encoded = bwtEncode("hello world test");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("hello world test");
    });

    it.skip("roundtrip mixed case string", () => {
      const encoded = bwtEncode("HeLlOwOrLd");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("HeLlOwOrLd");
    });

    it.skip("roundtrip palindrome", () => {
      const encoded = bwtEncode("racecar");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("racecar");
    });

    it.skip("roundtrip longer string", () => {
      const encoded = bwtEncode("thequickbrownfoxjumpsoverthelazydog");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("thequickbrownfoxjumpsoverthelazydog");
    });

    it.skip("roundtrip alternating characters", () => {
      const encoded = bwtEncode("ababababab");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("ababababab");
    });

    it.skip("roundtrip string with punctuation", () => {
      const encoded = bwtEncode("hello, world! how are you?");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("hello, world! how are you?");
    });

    it.skip("roundtrip emoji string", () => {
      const encoded = bwtEncode("😀😃😄");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("😀😃😄");
    });
  });

  describe("BurrowsWheeler class", () => {
    describe("encode", () => {
      it.skip("encodes using class method", () => {
        const result = BurrowsWheeler.encode("banana");
        expect(result.transformed).toBe("annb$aa");
        expect(result.originalIndex).toBe(3);
      });

      it("encodes empty string using class method", () => {
        const result = BurrowsWheeler.encode("");
        expect(result).toEqual({ transformed: "", originalIndex: 0 });
      });

      it.skip("encodes single character using class method", () => {
        const result = BurrowsWheeler.encode("a");
        expect(result.transformed).toBe("$a");
        expect(result.originalIndex).toBe(0);
      });
    });

    describe("decode", () => {
      it.skip("decodes using class method", () => {
        const result = BurrowsWheeler.decode("annb$aa", 3);
        expect(result).toBe("banana");
      });

      it("decodes empty string using class method", () => {
        const result = BurrowsWheeler.decode("", 0);
        expect(result).toBe("");
      });

      it.skip("decodes single character using class method", () => {
        const result = BurrowsWheeler.decode("$a", 0);
        expect(result).toBe("a");
      });
    });

    describe("getTransforms", () => {
      it("gets all transforms for empty string", () => {
        const transforms = BurrowsWheeler.getTransforms("");
        expect(transforms).toEqual([]);
      });

      it("gets all transforms for single character", () => {
        const transforms = BurrowsWheeler.getTransforms("a$");
        expect(transforms).toEqual(["a$", "$a"]);
      });

      it("gets all transforms for abc", () => {
        const transforms = BurrowsWheeler.getTransforms("abc$");
        expect(transforms).toHaveLength(4);
        expect(transforms).toContain("abc$");
        expect(transforms).toContain("bc$a");
        expect(transforms).toContain("c$ab");
        expect(transforms).toContain("$abc");
      });

      it("gets all transforms for banana$", () => {
        const transforms = BurrowsWheeler.getTransforms("banana$");
        expect(transforms).toHaveLength(7);
      });

      it("gets all transforms for repeated characters", () => {
        const transforms = BurrowsWheeler.getTransforms("aaa$");
        expect(transforms).toHaveLength(4);
        expect(transforms).toContain("aaa$");
        expect(transforms).toContain("aa$a");
        expect(transforms).toContain("a$aa");
        expect(transforms).toContain("$aaa");
      });
    });

    describe("class roundtrip", () => {
      it.skip("roundtrip using class methods", () => {
        const encoded = BurrowsWheeler.encode("test");
        const decoded = BurrowsWheeler.decode(encoded.transformed, encoded.originalIndex);
        expect(decoded).toBe("test");
      });

      it("roundtrip empty string using class methods", () => {
        const encoded = BurrowsWheeler.encode("");
        const decoded = BurrowsWheeler.decode(encoded.transformed, encoded.originalIndex);
        expect(decoded).toBe("");
      });
    });
  });

  describe("edge cases", () => {
    it.skip("handles very long string", () => {
      const input = "a".repeat(1000);
      const encoded = bwtEncode(input);
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe(input);
    });

    it.skip("handles string with only sentinel character", () => {
      const result = bwtEncode("$");
      expect(result.transformed).toBe("$$");
      expect(result.originalIndex).toBe(0);
    });

    it.skip("handles string ending with dollar sign", () => {
      const encoded = bwtEncode("test$");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("test$");
    });

    it.skip("handles tab characters", () => {
      const encoded = bwtEncode("a\tb\tc");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("a\tb\tc");
    });

    it.skip("handles carriage return", () => {
      const encoded = bwtEncode("line1\rline2");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("line1\rline2");
    });

    it.skip("handles mixed whitespace", () => {
      const encoded = bwtEncode(" \t\n\r");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe(" \t\n\r");
    });

    it.skip("handles null byte", () => {
      const encoded = bwtEncode("a\x00b");
      const decoded = bwtDecode(encoded.transformed, encoded.originalIndex);
      expect(decoded).toBe("a\x00b");
    });
  });
});
