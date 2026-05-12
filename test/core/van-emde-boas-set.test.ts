import { describe, it, expect } from "vitest";
import { VanEmdeBoasSet } from "../../src/core/van-emde-boas-set/index.js";

describe("VanEmdeBoasSet", () => {
	describe("constructor", () => {
		it("should create set with default universe size", () => {
			const set = new VanEmdeBoasSet();
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
		});

		it("should create set with custom universe size", () => {
			const set = new VanEmdeBoasSet({ universeSize: 256 });
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
		});

		it("should create set with universe size 2", () => {
			const set = new VanEmdeBoasSet({ universeSize: 2 });
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
		});

		it("should create set with universe size 4", () => {
			const set = new VanEmdeBoasSet({ universeSize: 4 });
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
		});

		it("should create set with universe size 16", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
		});

		it("should create set with universe size 1024", () => {
			const set = new VanEmdeBoasSet({ universeSize: 1024 });
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
		});
	});

	describe("insert", () => {
		it("should insert single element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			expect(set.size()).toBe(1);
			expect(set.has(5)).toBe(true);
		});

		it("should insert multiple elements", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.insert(15);
			expect(set.size()).toBe(3);
			expect(set.has(5)).toBe(true);
			expect(set.has(10)).toBe(true);
			expect(set.has(15)).toBe(true);
		});

		it("should insert zero", () => {
			const set = new VanEmdeBoasSet();
			set.insert(0);
			expect(set.size()).toBe(1);
			expect(set.has(0)).toBe(true);
		});

		it("should insert max value", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			set.insert(15);
			expect(set.size()).toBe(1);
			expect(set.has(15)).toBe(true);
		});

		it("should not increase size when inserting duplicate", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(5);
			expect(set.size()).toBe(1);
			expect(set.has(5)).toBe(true);
		});

		it("should handle sequential insert", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			expect(set.size()).toBe(16);
		});

		it("should handle reverse sequential insert", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 15; i >= 0; i--) {
				set.insert(i);
			}
			expect(set.size()).toBe(16);
		});

		it("should throw error when inserting negative value", () => {
			const set = new VanEmdeBoasSet();
			expect(() => set.insert(-1)).toThrow();
		});

		it("should throw error when inserting out of bounds", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			expect(() => set.insert(100)).toThrow();
		});
	});

	describe("delete", () => {
		it("should delete existing element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.delete(5);
			expect(set.size()).toBe(0);
			expect(set.has(5)).toBe(false);
		});

		it("should delete from middle", () => {
			const set = new VanEmdeBoasSet();
			set.insert(3);
			set.insert(5);
			set.insert(7);
			set.delete(5);
			expect(set.size()).toBe(2);
			expect(set.has(5)).toBe(false);
			expect(set.has(3)).toBe(true);
			expect(set.has(7)).toBe(true);
		});

		it("should delete min element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.insert(15);
			set.delete(5);
			expect(set.size()).toBe(2);
			expect(set.has(5)).toBe(false);
			expect(set.min()).toBe(10);
		});

		it("should delete max element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.insert(15);
			set.delete(15);
			expect(set.size()).toBe(2);
			expect(set.has(15)).toBe(false);
			expect(set.max()).toBe(10);
		});

		it("should not decrease size when deleting non-existent element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.delete(10);
			expect(set.size()).toBe(1);
		});

		it("should delete all elements sequentially", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			for (let i = 0; i < 16; i++) {
				set.delete(i);
			}
			expect(set.isEmpty()).toBe(true);
		});

		it("should delete zero", () => {
			const set = new VanEmdeBoasSet();
			set.insert(0);
			set.insert(5);
			set.delete(0);
			expect(set.has(0)).toBe(false);
			expect(set.size()).toBe(1);
		});

		it("should delete max value", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			set.insert(0);
			set.insert(15);
			set.delete(15);
			expect(set.has(15)).toBe(false);
			expect(set.size()).toBe(1);
		});

		it("should handle deleting from empty set", () => {
			const set = new VanEmdeBoasSet();
			set.delete(5);
			expect(set.isEmpty()).toBe(true);
		});

		it("should throw error when deleting negative value", () => {
			const set = new VanEmdeBoasSet();
			expect(() => set.delete(-1)).toThrow();
		});

		it("should throw error when deleting out of bounds", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			expect(() => set.delete(100)).toThrow();
		});
	});

	describe("has", () => {
		it("should return true for inserted element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			expect(set.has(5)).toBe(true);
		});

		it("should return false for non-existent element", () => {
			const set = new VanEmdeBoasSet();
			expect(set.has(5)).toBe(false);
		});

		it("should return false after deletion", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.delete(5);
			expect(set.has(5)).toBe(false);
		});

		it("should return false for negative value", () => {
			const set = new VanEmdeBoasSet();
			expect(set.has(-1)).toBe(false);
		});

		it("should return false for value at universe size", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			expect(set.has(100)).toBe(false);
		});

		it("should return true for zero", () => {
			const set = new VanEmdeBoasSet();
			set.insert(0);
			expect(set.has(0)).toBe(true);
		});

		it("should return true for max value", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			set.insert(15);
			expect(set.has(15)).toBe(true);
		});

		it("should check multiple elements", () => {
			const set = new VanEmdeBoasSet({ universeSize: 32 });
			for (let i = 0; i < 16; i++) {
				set.insert(i * 2);
			}
			for (let i = 0; i < 16; i++) {
				expect(set.has(i * 2)).toBe(true);
				expect(set.has(i * 2 + 1)).toBe(false);
			}
		});
	});

	describe("successor", () => {
		it("should return null for empty set", () => {
			const set = new VanEmdeBoasSet();
			expect(set.successor(5)).toBe(null);
		});

		it("should return null when no successor exists", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			set.insert(15);
			expect(set.successor(15)).toBe(null);
		});

		it("should find successor of element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.insert(15);
			expect(set.successor(5)).toBe(10);
			expect(set.successor(10)).toBe(15);
			expect(set.successor(15)).toBe(null);
		});

		it("should find successor before min element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			expect(set.successor(0)).toBe(5);
		});

		it("should return min for negative query", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			expect(set.successor(-5)).toBe(5);
		});

		it("should find successor in gap", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(15);
			expect(set.successor(10)).toBe(15);
		});

		it("should handle sequential elements", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			for (let i = 0; i < 15; i++) {
				expect(set.successor(i)).toBe(i + 1);
			}
			expect(set.successor(15)).toBe(null);
		});

		it("should handle sparse elements", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			for (let i = 0; i < 100; i += 10) {
				set.insert(i);
			}
			for (let i = 0; i < 90; i += 10) {
				expect(set.successor(i)).toBe(i + 10);
			}
		});

		it("should return null for out of bounds query", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			set.insert(50);
			expect(set.successor(99)).toBe(null);
		});
	});

	describe("predecessor", () => {
		it("should return null for empty set", () => {
			const set = new VanEmdeBoasSet();
			expect(set.predecessor(5)).toBe(null);
		});

		it("should return null when no predecessor exists", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			set.insert(0);
			expect(set.predecessor(0)).toBe(null);
		});

		it("should find predecessor of element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.insert(15);
			expect(set.predecessor(10)).toBe(5);
			expect(set.predecessor(15)).toBe(10);
			expect(set.predecessor(5)).toBe(null);
		});

		it("should find predecessor after max element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			expect(set.predecessor(20)).toBe(10);
		});

		it("should return max for out of bounds query", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			set.insert(5);
			set.insert(10);
			expect(set.predecessor(20)).toBe(10);
		});

		it("should find predecessor in gap", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(15);
			expect(set.predecessor(10)).toBe(5);
		});

		it("should handle sequential elements", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			for (let i = 1; i < 16; i++) {
				expect(set.predecessor(i)).toBe(i - 1);
			}
			expect(set.predecessor(0)).toBe(null);
		});

		it("should handle sparse elements", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			for (let i = 0; i < 100; i += 10) {
				set.insert(i);
			}
			for (let i = 10; i < 100; i += 10) {
				expect(set.predecessor(i)).toBe(i - 10);
			}
		});

		it("should return null for negative query", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			set.insert(50);
			expect(set.predecessor(-5)).toBe(null);
		});
	});

	describe("min", () => {
		it("should return null for empty set", () => {
			const set = new VanEmdeBoasSet();
			expect(set.min()).toBe(null);
		});

		it("should return minimum element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(3);
			set.insert(10);
			expect(set.min()).toBe(3);
		});

		it("should return zero when inserted", () => {
			const set = new VanEmdeBoasSet();
			set.insert(0);
			set.insert(5);
			expect(set.min()).toBe(0);
		});

		it("should update min after deletion", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.insert(15);
			set.delete(5);
			expect(set.min()).toBe(10);
		});

		it("should handle single element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(42);
			expect(set.min()).toBe(42);
		});

		it("should handle sequential insert", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			expect(set.min()).toBe(0);
		});

		it("should handle reverse insert", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 15; i >= 0; i--) {
				set.insert(i);
			}
			expect(set.min()).toBe(0);
		});
	});

	describe("max", () => {
		it("should return null for empty set", () => {
			const set = new VanEmdeBoasSet();
			expect(set.max()).toBe(null);
		});

		it("should return maximum element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(3);
			set.insert(10);
			expect(set.max()).toBe(10);
		});

		it("should return max value when inserted", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			set.insert(0);
			set.insert(15);
			expect(set.max()).toBe(15);
		});

		it("should update max after deletion", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.insert(15);
			set.delete(15);
			expect(set.max()).toBe(10);
		});

		it("should handle single element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(42);
			expect(set.max()).toBe(42);
		});

		it("should handle sequential insert", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			expect(set.max()).toBe(15);
		});

		it("should handle reverse insert", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 15; i >= 0; i--) {
				set.insert(i);
			}
			expect(set.max()).toBe(15);
		});
	});

	describe("size", () => {
		it("should return 0 for empty set", () => {
			const set = new VanEmdeBoasSet();
			expect(set.size()).toBe(0);
		});

		it("should return 1 after single insert", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			expect(set.size()).toBe(1);
		});

		it("should return correct size after multiple inserts", () => {
			const set = new VanEmdeBoasSet();
			for (let i = 0; i < 10; i++) {
				set.insert(i);
			}
			expect(set.size()).toBe(10);
		});

		it("should not change on duplicate insert", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(5);
			expect(set.size()).toBe(1);
		});

		it("should decrease after delete", () => {
			const set = new VanEmdeBoasSet();
			for (let i = 0; i < 10; i++) {
				set.insert(i);
			}
			set.delete(5);
			expect(set.size()).toBe(9);
		});

		it("should not change on non-existent delete", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.delete(10);
			expect(set.size()).toBe(1);
		});

		it("should return 0 after clear", () => {
			const set = new VanEmdeBoasSet();
			for (let i = 0; i < 10; i++) {
				set.insert(i);
			}
			set.clear();
			expect(set.size()).toBe(0);
		});
	});

	describe("isEmpty", () => {
		it("should return true for empty set", () => {
			const set = new VanEmdeBoasSet();
			expect(set.isEmpty()).toBe(true);
		});

		it("should return false after insert", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			expect(set.isEmpty()).toBe(false);
		});

		it("should return true after deleting all", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.delete(5);
			expect(set.isEmpty()).toBe(true);
		});

		it("should return true after clear", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.clear();
			expect(set.isEmpty()).toBe(true);
		});
	});

	describe("clear", () => {
		it("should clear empty set", () => {
			const set = new VanEmdeBoasSet();
			set.clear();
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
		});

		it("should clear single element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.clear();
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
			expect(set.has(5)).toBe(false);
		});

		it("should clear multiple elements", () => {
			const set = new VanEmdeBoasSet();
			for (let i = 0; i < 10; i++) {
				set.insert(i);
			}
			set.clear();
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
			for (let i = 0; i < 10; i++) {
				expect(set.has(i)).toBe(false);
			}
		});

		it("should allow insert after clear", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.clear();
			set.insert(10);
			expect(set.size()).toBe(1);
			expect(set.has(10)).toBe(true);
		});
	});

	describe("toArray", () => {
		it("should return empty array for empty set", () => {
			const set = new VanEmdeBoasSet();
			expect(set.toArray()).toEqual([]);
		});

		it("should return array with single element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			expect(set.toArray()).toEqual([5]);
		});

		it("should return sorted array", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(3);
			set.insert(10);
			set.insert(1);
			expect(set.toArray()).toEqual([1, 3, 5, 10]);
		});

		it("should handle sequential elements", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			expect(set.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
		});

		it("should handle sparse elements", () => {
			const set = new VanEmdeBoasSet();
			set.insert(0);
			set.insert(100);
			set.insert(50);
			expect(set.toArray()).toEqual([0, 50, 100]);
		});

		it("should return empty array after clear", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.clear();
			expect(set.toArray()).toEqual([]);
		});
	});

	describe("forEach", () => {
		it("should not call callback for empty set", () => {
			const set = new VanEmdeBoasSet();
			let calls = 0;
			set.forEach(() => {
				calls++;
			});
			expect(calls).toBe(0);
		});

		it("should call callback once for single element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			let calls = 0;
			set.forEach((value) => {
				calls++;
				expect(value).toBe(5);
			});
			expect(calls).toBe(1);
		});

		it("should call callback in sorted order", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(3);
			set.insert(10);
			set.insert(1);
			const values: number[] = [];
			set.forEach((value) => {
				values.push(value);
			});
			expect(values).toEqual([1, 3, 5, 10]);
		});

		it("should handle sequential elements", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			const values: number[] = [];
			set.forEach((value) => {
				values.push(value);
			});
			expect(values).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
		});

		it("should handle large number of elements", () => {
			const set = new VanEmdeBoasSet({ universeSize: 1000 });
			for (let i = 0; i < 100; i++) {
				set.insert(i);
			}
			let sum = 0;
			set.forEach((value) => {
				sum += value;
			});
			expect(sum).toBe((99 * 100) / 2);
		});
	});

	describe("edge cases - empty set", () => {
		it("should handle all operations on empty set", () => {
			const set = new VanEmdeBoasSet();
			expect(set.isEmpty()).toBe(true);
			expect(set.size()).toBe(0);
			expect(set.min()).toBe(null);
			expect(set.max()).toBe(null);
			expect(set.has(5)).toBe(false);
			expect(set.successor(5)).toBe(null);
			expect(set.predecessor(5)).toBe(null);
			expect(set.toArray()).toEqual([]);
			set.delete(5);
			expect(set.isEmpty()).toBe(true);
		});
	});

	describe("edge cases - single element", () => {
		it("should handle single element operations", () => {
			const set = new VanEmdeBoasSet();
			set.insert(42);
			expect(set.isEmpty()).toBe(false);
			expect(set.size()).toBe(1);
			expect(set.min()).toBe(42);
			expect(set.max()).toBe(42);
			expect(set.has(42)).toBe(true);
			expect(set.has(5)).toBe(false);
			expect(set.successor(10)).toBe(42);
			expect(set.predecessor(100)).toBe(42);
			expect(set.toArray()).toEqual([42]);
			set.delete(42);
			expect(set.isEmpty()).toBe(true);
		});
	});

	describe("edge cases - sequential operations", () => {
		it("should handle insert then delete same element", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.delete(5);
			expect(set.isEmpty()).toBe(true);
		});

		it("should handle alternating insert delete", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.delete(5);
			set.insert(5);
			expect(set.size()).toBe(2);
			expect(set.has(5)).toBe(true);
			expect(set.has(10)).toBe(true);
		});

		it("should handle find after delete", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.insert(15);
			set.delete(10);
			expect(set.successor(5)).toBe(15);
			expect(set.predecessor(15)).toBe(5);
		});
	});

	describe("edge cases - random operations", () => {
		it("should handle random insertions", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			const values = new Set<number>();
			for (let i = 0; i < 50; i++) {
				const value = Math.floor(Math.random() * 100);
				values.add(value);
				set.insert(value);
			}
			expect(set.size()).toBe(values.size);
			for (const value of values) {
				expect(set.has(value)).toBe(true);
			}
		});

		it("should handle random deletions", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			const values = new Set<number>();
			for (let i = 0; i < 50; i++) {
				const value = Math.floor(Math.random() * 100);
				values.add(value);
				set.insert(value);
			}
			const toDelete = Array.from(values).slice(0, 25);
			for (const value of toDelete) {
				set.delete(value);
				values.delete(value);
			}
			expect(set.size()).toBe(values.size);
		});
	});

	describe("edge cases - boundary values", () => {
		it("should handle min boundary (0)", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			set.insert(0);
			expect(set.min()).toBe(0);
			expect(set.successor(-5)).toBe(0);
			expect(set.predecessor(5)).toBe(0);
		});

		it("should handle max boundary", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			set.insert(99);
			expect(set.max()).toBe(99);
			expect(set.successor(90)).toBe(99);
			expect(set.predecessor(200)).toBe(99);
		});

		it("should handle all values in small universe", () => {
			const set = new VanEmdeBoasSet({ universeSize: 16 });
			for (let i = 0; i < 16; i++) {
				set.insert(i);
			}
			expect(set.size()).toBe(16);
			expect(set.min()).toBe(0);
			expect(set.max()).toBe(15);
		});
	});

	describe("combined operations", () => {
		it("should handle insert delete insert cycle", () => {
			const set = new VanEmdeBoasSet();
			set.insert(5);
			set.insert(10);
			set.delete(5);
			set.insert(15);
			expect(set.size()).toBe(2);
			expect(set.has(10)).toBe(true);
			expect(set.has(15)).toBe(true);
			expect(set.has(5)).toBe(false);
		});

		it("should maintain consistency through multiple operations", () => {
			const set = new VanEmdeBoasSet({ universeSize: 100 });
			for (let i = 0; i < 100; i += 2) {
				set.insert(i);
			}
			expect(set.size()).toBe(50);
			for (let i = 0; i < 100; i++) {
				expect(set.has(i)).toBe(i % 2 === 0);
			}
		});
	});
});
