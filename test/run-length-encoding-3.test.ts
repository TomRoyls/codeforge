import { describe, it, expect } from "vitest";
import { RunLengthEncoding3 } from "../src/core/run-length-encoding-3/index";

describe("RunLengthEncoding3", () => {
  describe("encode", () => {
    it("should encode empty string", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.encode("")).toBe("");
    });

    it("should encode single character", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.encode("A")).toBe("1A");
    });

    it("should encode multiple same characters", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.encode("AAAA")).toBe("4A");
    });

    it("should encode mixed characters", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.encode("AAABBC")).toBe("3A2B1C");
    });

    it("should encode special characters", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.encode("!!!@@@")).toBe("3!3@");
    });

    it("should encode spaces", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.encode("   ")).toBe("3 ");
    });

    it("should encode numbers as characters", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.encode("111222")).toBe("3132");
    });
  });

  describe("decode", () => {
    it("should decode empty string", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.decode("")).toBe("");
    });

    it("should decode single run", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.decode("3A")).toBe("AAA");
    });

    it("should decode multiple runs", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.decode("3A2B1C")).toBe("AAABBC");
    });

    it("should decode special characters", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.decode("3!2@")).toBe("!!!@@");
    });

    it("should decode spaces", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.decode("3 ")).toBe("   ");
    });

    it("should decode numbers as characters", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.decode("2131")).toBe("11");
    });
  });

  describe("append", () => {
    it("should add new run when different character", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("A", 3);
      rle.append("B", 2);
      expect(rle.getRuns()).toEqual([
        { char: "A", count: 3 },
        { char: "B", count: 2 },
      ]);
    });

    it("should merge when same character", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("A", 3);
      rle.append("A", 2);
      expect(rle.getRuns()).toEqual([{ char: "A", count: 5 }]);
    });

    it("should handle append on empty RLE", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("X", 5);
      expect(rle.getRuns()).toEqual([{ char: "X", count: 5 }]);
    });
  });

  describe("getRuns", () => {
    it("should return copy of runs", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("A", 3);
      rle.append("B", 2);
      const runs = rle.getRuns();
      runs[0]!.count = 10;
      expect(rle.getRuns()[0]!.count).toBe(3);
    });

    it("should return empty array for empty RLE", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.getRuns()).toEqual([]);
    });
  });

  describe("length getter", () => {
    it("should return total decoded length", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("A", 3);
      rle.append("B", 2);
      expect(rle.length).toBe(5);
    });

    it("should return 0 for empty RLE", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.length).toBe(0);
    });
  });

  describe("runCount getter", () => {
    it("should return number of runs", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("A", 3);
      rle.append("B", 2);
      rle.append("C", 1);
      expect(rle.runCount).toBe(3);
    });

    it("should return 0 for empty RLE", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.runCount).toBe(0);
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty RLE", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.isEmpty()).toBe(true);
    });

    it("should return false after adding data", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("A", 3);
      expect(rle.isEmpty()).toBe(false);
    });
  });

  describe("clear", () => {
    it("should remove all data", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("A", 3);
      rle.append("B", 2);
      rle.clear();
      expect(rle.isEmpty()).toBe(true);
      expect(rle.length).toBe(0);
      expect(rle.runCount).toBe(0);
    });
  });

  describe("toString", () => {
    it("should return encoded representation", async () => {
      const rle = new RunLengthEncoding3();
      rle.append("A", 3);
      rle.append("B", 2);
      expect(rle.toString()).toBe("3A2B");
    });

    it("should return empty string for empty RLE", async () => {
      const rle = new RunLengthEncoding3();
      expect(rle.toString()).toBe("");
    });
  });

  describe("round-trip encoding/decoding", () => {
    it("should preserve original after encode then decode", async () => {
      const rle = new RunLengthEncoding3();
      const original = "AAABBCDDDEEE";
      const encoded = rle.encode(original);
      const decoded = rle.decode(encoded);
      expect(decoded).toBe(original);
    });

    it("should handle complex round-trip", async () => {
      const rle = new RunLengthEncoding3();
      const original = "AABBBCCCCDDDDEEEEE";
      const encoded = rle.encode(original);
      const decoded = rle.decode(encoded);
      expect(decoded).toBe(original);
    });

    it("should handle special characters in round-trip", async () => {
      const rle = new RunLengthEncoding3();
      const original = "!!!@@@###$$$";
      const encoded = rle.encode(original);
      const decoded = rle.decode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe("edge cases", () => {
    it("should handle single character with large count", async () => {
      const rle = new RunLengthEncoding3();
      const result = rle.encode("A".repeat(100));
      expect(result).toBe("100A");
      expect(rle.decode(result)).toBe("A".repeat(100));
    });

    it("should handle alternating characters", async () => {
      const rle = new RunLengthEncoding3();
      const result = rle.encode("ABABAB");
      expect(result).toBe("1A1B1A1B1A1B");
      expect(rle.decode(result)).toBe("ABABAB");
    });

    it("should handle unicode characters", async () => {
      const rle = new RunLengthEncoding3();
      const original = "日本語日本語";
      const encoded = rle.encode(original);
      const decoded = rle.decode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe("large inputs", () => {
    it("should handle large input efficiently", async () => {
      const rle = new RunLengthEncoding3();
      const input = "A".repeat(1000) + "B".repeat(500) + "C".repeat(250);
      const encoded = rle.encode(input);
      expect(encoded).toBe("1000A500B250C");
      expect(rle.decode(encoded)).toBe(input);
      expect(rle.length).toBe(1750);
      expect(rle.runCount).toBe(3);
    });
  });

  it('should handle clear', async () => {
    const rle = new RunLengthEncoding3();
    rle.encode('AAABBB');
    expect(rle.length).toBe(6);
    rle.clear();
    expect(rle.isEmpty()).toBe(true);
    expect(rle.length).toBe(0);
    expect(rle.runCount).toBe(0);
  });

  it('should handle getRuns', async () => {
    const rle = new RunLengthEncoding3();
    rle.encode('AABBB');
    const runs = rle.getRuns();
    expect(runs).toHaveLength(2);
    expect(runs[0]).toEqual({ char: 'A', count: 2 });
    expect(runs[1]).toEqual({ char: 'B', count: 3 });
  });

  it('should handle toString', async () => {
    const rle = new RunLengthEncoding3();
    rle.encode('AABBB');
    expect(typeof rle.toString()).toBe('string');
  });

  it('should handle decode', async () => {
    const rle = new RunLengthEncoding3();
    const encoded = rle.encode('AABBB');
    const decoded = rle.decode(encoded);
    expect(decoded).toBe('AABBB');
  });

  it('should handle empty string', () => {
    const rle = new RunLengthEncoding3();
    const encoded = rle.encode('');
    expect(encoded).toBe('');
  });

  it('should handle append', () => {
    const rle = new RunLengthEncoding3();
    rle.append('A', 3);
    rle.append('B', 2);
    const runs = rle.getRuns();
    expect(runs.length).toBe(2);
    expect(runs[0]).toEqual({ char: 'A', count: 3 });
  });

  it('should handle isEmpty', () => {
    const rle = new RunLengthEncoding3();
    expect(rle.isEmpty()).toBe(true);
    rle.encode('AA');
    expect(rle.isEmpty()).toBe(false);
  });

  it('should handle toString', () => {
    const rle = new RunLengthEncoding3();
    rle.append('A', 3);
    rle.append('B', 2);
    expect(typeof rle.toString()).toBe('string');
  });
});
