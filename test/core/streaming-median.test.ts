import type { Equal, Expect } from "tsd";
import { StreamingMedian } from "../../src/core/streaming-median";

describe("StreamingMedian", () => {
	describe("constructor", () => {
		it("should create empty instance", () => {
			const sm = new StreamingMedian();
			expect(sm.isEmpty).toBe(true);
			expect(sm.size).toBe(0);
		});
	});

	describe("add", () => {
		it("should add single value", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			expect(sm.size).toBe(1);
			expect(sm.isEmpty).toBe(false);
		});

		it("should add multiple values", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.add(3);
			expect(sm.size).toBe(3);
		});

		it("should handle negative numbers", () => {
			const sm = new StreamingMedian();
			sm.add(-5);
			sm.add(-10);
			sm.add(-1);
			expect(sm.size).toBe(3);
		});

		it("should handle zero", () => {
			const sm = new StreamingMedian();
			sm.add(0);
			expect(sm.size).toBe(1);
		});

		it("should handle floating point numbers", () => {
			const sm = new StreamingMedian();
			sm.add(1.5);
			sm.add(2.7);
			sm.add(3.9);
			expect(sm.size).toBe(3);
		});

		it("should handle duplicate values", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			sm.add(5);
			sm.add(5);
			expect(sm.size).toBe(3);
		});

		it("should handle very large numbers", () => {
			const sm = new StreamingMedian();
			sm.add(Number.MAX_SAFE_INTEGER);
			expect(sm.size).toBe(1);
		});

		it("should handle very small numbers", () => {
			const sm = new StreamingMedian();
			sm.add(Number.MIN_SAFE_INTEGER);
			expect(sm.size).toBe(1);
		});

		it("should maintain heap balance", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.add(3);
			sm.add(4);
			sm.add(5);
			expect(sm.size).toBe(5);
		});
	});

	describe("getMedian", () => {
		it("should throw error for empty structure", () => {
			const sm = new StreamingMedian();
			expect(() => sm.getMedian()).toThrow("Cannot get median of empty streaming median");
		});

		it("should handle alternating values", () => {
			const sm = new StreamingMedian();
			sm.add(10);
			expect(sm.getMedian()).toBe(10);
			sm.add(1);
			expect(sm.getMedian()).toBe(5.5);
			sm.add(9);
			expect(sm.getMedian()).toBe(9);
			sm.add(2);
			expect(sm.getMedian()).toBe(5.5);
		});

		it("should return single element for one value", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			expect(sm.getMedian()).toBe(5);
		});

		it("should return average for two values", () => {
			const sm = new StreamingMedian();
			sm.add(3);
			sm.add(7);
			expect(sm.getMedian()).toBe(5);
		});

		it("should return middle for three values", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.add(3);
			expect(sm.getMedian()).toBe(2);
		});

		it("should return average for four values", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.add(3);
			sm.add(4);
			expect(sm.getMedian()).toBe(2.5);
		});

		it("should return middle for five values", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.add(3);
			sm.add(4);
			sm.add(5);
			expect(sm.getMedian()).toBe(3);
		});

		it("should handle unsorted input", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			sm.add(1);
			sm.add(3);
			sm.add(2);
			sm.add(4);
			expect(sm.getMedian()).toBe(3);
		});

		it("should handle reverse sorted input", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			sm.add(4);
			sm.add(3);
			sm.add(2);
			sm.add(1);
			expect(sm.getMedian()).toBe(3);
		});

		it("should handle negative numbers", () => {
			const sm = new StreamingMedian();
			sm.add(-5);
			sm.add(-1);
			sm.add(-3);
			expect(sm.getMedian()).toBe(-3);
		});

		it("should handle mixed positive and negative", () => {
			const sm = new StreamingMedian();
			sm.add(-2);
			sm.add(0);
			sm.add(2);
			expect(sm.getMedian()).toBe(0);
		});

		it("should handle floating point median", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			expect(sm.getMedian()).toBe(1.5);
		});

		it("should return integer when average is integer", () => {
			const sm = new StreamingMedian();
			sm.add(2);
			sm.add(4);
			expect(sm.getMedian()).toBe(3);
		});

		it("should handle large dataset", () => {
			const sm = new StreamingMedian();
			for (let i = 1; i <= 100; i++) {
				sm.add(i);
			}
			expect(sm.getMedian()).toBe(50.5);
		});

		it("should handle all same values", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			sm.add(5);
			sm.add(5);
			expect(sm.getMedian()).toBe(5);
		});

		it("should return correct median for odd count after many additions", () => {
			const sm = new StreamingMedian();
			for (let i = 1; i <= 99; i++) {
				sm.add(i);
			}
			expect(sm.getMedian()).toBe(50);
		});
	});

	describe("size getter", () => {
		it("should return 0 for new instance", () => {
			const sm = new StreamingMedian();
			expect(sm.size).toBe(0);
		});

		it("should increment with each add", () => {
			const sm = new StreamingMedian();
			expect(sm.size).toBe(0);
			sm.add(1);
			expect(sm.size).toBe(1);
			sm.add(2);
			expect(sm.size).toBe(2);
		});

		it("should not be affected by median calculation", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			expect(sm.size).toBe(2);
			sm.getMedian();
			expect(sm.size).toBe(2);
		});
	});

	describe("isEmpty getter", () => {
		it("should return true for new instance", () => {
			const sm = new StreamingMedian();
			expect(sm.isEmpty).toBe(true);
		});

		it("should return false after adding values", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			expect(sm.isEmpty).toBe(false);
		});

		it("should return true after clear", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.clear();
			expect(sm.isEmpty).toBe(true);
		});
	});

	describe("clear", () => {
		it("should reset empty instance", () => {
			const sm = new StreamingMedian();
			sm.clear();
			expect(sm.isEmpty).toBe(true);
			expect(sm.size).toBe(0);
		});

		it("should clear single value", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			sm.clear();
			expect(sm.isEmpty).toBe(true);
			expect(sm.size).toBe(0);
		});

		it("should clear multiple values", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.add(3);
			sm.add(4);
			sm.add(5);
			sm.clear();
			expect(sm.isEmpty).toBe(true);
			expect(sm.size).toBe(0);
		});

		it("should allow getMedian after clear to throw", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.clear();
			expect(() => sm.getMedian()).toThrow("Cannot get median of empty streaming median");
		});

		it("should allow adding after clear", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.clear();
			sm.add(3);
			expect(sm.size).toBe(1);
			expect(sm.getMedian()).toBe(3);
		});
	});

	describe("toArray", () => {
		it("should return empty array for empty instance", () => {
			const sm = new StreamingMedian();
			expect(sm.toArray()).toEqual([]);
		});

		it("should return single element", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			expect(sm.toArray()).toEqual([5]);
		});

		it("should return sorted array for multiple values", () => {
			const sm = new StreamingMedian();
			sm.add(3);
			sm.add(1);
			sm.add(4);
			sm.add(2);
			expect(sm.toArray()).toEqual([1, 2, 3, 4]);
		});

		it("should not affect original structure", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.add(3);
			const array = sm.toArray();
			array[0] = 100;
			expect(sm.getMedian()).toBe(2);
			expect(sm.toArray()).toEqual([1, 2, 3]);
		});

		it("should return sorted array for unsorted input", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			sm.add(2);
			sm.add(8);
			sm.add(1);
			sm.add(9);
			expect(sm.toArray()).toEqual([1, 2, 5, 8, 9]);
		});

		it("should handle negative numbers", () => {
			const sm = new StreamingMedian();
			sm.add(-3);
			sm.add(-1);
			sm.add(-2);
			expect(sm.toArray()).toEqual([-3, -2, -1]);
		});

		it("should handle duplicate values", () => {
			const sm = new StreamingMedian();
			sm.add(3);
			sm.add(1);
			sm.add(3);
			sm.add(2);
			sm.add(1);
			expect(sm.toArray()).toEqual([1, 1, 2, 3, 3]);
		});

		it("should handle floating point numbers", () => {
			const sm = new StreamingMedian();
			sm.add(1.5);
			sm.add(2.7);
			sm.add(1.2);
			expect(sm.toArray()).toEqual([1.2, 1.5, 2.7]);
		});

		it("should return empty array after clear", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.clear();
			expect(sm.toArray()).toEqual([]);
		});

		it("should work with large dataset", () => {
			const sm = new StreamingMedian();
			const values = Array.from({ length: 100 }, (_, i) => i + 1);
			values.reverse().forEach((v) => sm.add(v));
			expect(sm.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
		});
	});

	describe("integration", () => {
		it("should maintain median across operations", () => {
			const sm = new StreamingMedian();
			sm.add(5);
			expect(sm.getMedian()).toBe(5);
			sm.add(3);
			expect(sm.getMedian()).toBe(4);
			sm.add(7);
			expect(sm.getMedian()).toBe(5);
			sm.add(1);
			expect(sm.getMedian()).toBe(4);
		});

		it("should support multiple clear cycles", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			sm.clear();
			sm.add(3);
			sm.add(4);
			expect(sm.getMedian()).toBe(3.5);
		});

		it("should handle interleaved operations", () => {
			const sm = new StreamingMedian();
			sm.add(1);
			sm.add(2);
			const arr1 = sm.toArray();
			expect(arr1).toEqual([1, 2]);
			sm.add(3);
			expect(sm.getMedian()).toBe(2);
			sm.clear();
			expect(sm.isEmpty).toBe(true);
			sm.add(5);
			expect(sm.getMedian()).toBe(5);
		});
	});
});
