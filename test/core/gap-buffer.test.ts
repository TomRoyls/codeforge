import { describe, it, expect } from "vitest";
import { GapBuffer } from "../../src/core/gap-buffer/gap-buffer.js";

describe("GapBuffer", () => {
  describe("constructor", () => {
    it("creates buffer with default capacity", () => {
      const gb = new GapBuffer<number>();
      expect(gb.capacity).toBe(8);
    });

    it("creates buffer with custom capacity", () => {
      const gb = new GapBuffer<number>(16);
      expect(gb.capacity).toBe(16);
    });

    it("clamps capacity to minimum of 1", () => {
      const gb = new GapBuffer<number>(0);
      expect(gb.capacity).toBe(1);
    });

    it("clamps negative capacity to 1", () => {
      const gb = new GapBuffer<number>(-5);
      expect(gb.capacity).toBe(1);
    });

    it("starts empty", () => {
      const gb = new GapBuffer<string>();
      expect(gb.size).toBe(0);
      expect(gb.isEmpty()).toBe(true);
    });

    it("initial gap spans full buffer", () => {
      const gb = new GapBuffer<number>(4);
      expect(gb.gapSize).toBe(4);
    });

    it("cursor starts at 0", () => {
      const gb = new GapBuffer<number>();
      expect(gb.getCursor()).toBe(0);
    });
  });

  describe("insert", () => {
    it("inserts at cursor position", () => {
      const gb = new GapBuffer<number>(4);
      gb.insert(1);
      expect(gb.size).toBe(1);
      expect(gb.get(0)).toBe(1);
    });

    it("inserts multiple items sequentially", () => {
      const gb = new GapBuffer<number>(8);
      gb.insert(10);
      gb.insert(20);
      gb.insert(30);
      expect(gb.toArray()).toEqual([10, 20, 30]);
    });

    it("advances cursor after insert", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      expect(gb.getCursor()).toBe(1);
      gb.insert(2);
      expect(gb.getCursor()).toBe(2);
    });

    it("reduces gap size on insert", () => {
      const gb = new GapBuffer<number>(8);
      gb.insert(1);
      expect(gb.gapSize).toBe(7);
    });

    it("inserts strings", () => {
      const gb = new GapBuffer<string>();
      gb.insert("a");
      gb.insert("b");
      gb.insert("c");
      expect(gb.toArray()).toEqual(["a", "b", "c"]);
    });

    it("inserts objects", () => {
      const gb = new GapBuffer<{ x: number }>();
      gb.insert({ x: 1 });
      gb.insert({ x: 2 });
      expect(gb.size).toBe(2);
    });

    it("inserts null values", () => {
      const gb = new GapBuffer<number | null>();
      gb.insert(null);
      expect(gb.get(0)).toBe(null);
    });

    it("inserts undefined values through objects", () => {
      const gb = new GapBuffer<{ v: number | undefined }>();
      gb.insert({ v: undefined });
      expect(gb.get(0)!.v).toBe(undefined);
    });
  });

  describe("grow", () => {
    it("doubles capacity when gap is full", () => {
      const gb = new GapBuffer<number>(2);
      expect(gb.capacity).toBe(2);
      gb.insert(1);
      gb.insert(2);
      expect(gb.capacity).toBe(2);
      gb.insert(3);
      expect(gb.capacity).toBe(4);
    });

    it("preserves items after growth", () => {
      const gb = new GapBuffer<number>(2);
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.insert(4);
      expect(gb.toArray()).toEqual([1, 2, 3, 4]);
    });

    it("handles multiple growths", () => {
      const gb = new GapBuffer<number>(1);
      for (let i = 0; i < 20; i++) {
        gb.insert(i);
      }
      expect(gb.size).toBe(20);
      expect(gb.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i));
    });

    it("growth at cursor in middle preserves right side", () => {
      const gb = new GapBuffer<number>(2);
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(1);
      gb.insert(99);
      expect(gb.toArray()).toEqual([1, 99, 2]);
    });
  });

  describe("delete", () => {
    it("deletes item at cursor", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(1);
      const deleted = gb.delete();
      expect(deleted).toBe(1);
    });

    it("returns undefined when deleting at start", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.setCursor(0);
      const deleted = gb.delete();
      expect(deleted).toBe(undefined);
    });

    it("returns undefined on empty buffer", () => {
      const gb = new GapBuffer<number>();
      expect(gb.delete()).toBe(undefined);
    });

    it("decrements size on delete", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.moveLeft();
      gb.delete();
      expect(gb.size).toBe(1);
    });

    it("increases gap size on delete", () => {
      const gb = new GapBuffer<number>(4);
      gb.insert(1);
      gb.insert(2);
      const gapBefore = gb.gapSize;
      gb.moveLeft();
      gb.delete();
      expect(gb.gapSize).toBe(gapBefore + 1);
    });

    it("delete at end removes last item", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      const deleted = gb.delete();
      expect(deleted).toBe(3);
      expect(gb.toArray()).toEqual([1, 2]);
    });

    it("sequential deletes clear buffer", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.delete();
      gb.delete();
      expect(gb.isEmpty()).toBe(true);
    });

    it("delete moves cursor left", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(2);
      gb.delete();
      expect(gb.getCursor()).toBe(1);
    });
  });

  describe("getCursor / setCursor", () => {
    it("getCursor returns 0 initially", () => {
      const gb = new GapBuffer<number>();
      expect(gb.getCursor()).toBe(0);
    });

    it("setCursor to 0", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(0);
      expect(gb.getCursor()).toBe(0);
    });

    it("setCursor to end", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(0);
      gb.setCursor(2);
      expect(gb.getCursor()).toBe(2);
    });

    it("setCursor to middle", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.setCursor(1);
      expect(gb.getCursor()).toBe(1);
    });

    it("setCursor preserves data", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.setCursor(1);
      expect(gb.toArray()).toEqual([1, 2, 3]);
    });

    it("setCursor clamps to size", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.setCursor(100);
      expect(gb.getCursor()).toBe(1);
    });

    it("setCursor clamps negative to 0", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.setCursor(-5);
      expect(gb.getCursor()).toBe(0);
    });

    it("setCursor to same position is no-op", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(1);
      gb.setCursor(1);
      expect(gb.getCursor()).toBe(1);
      expect(gb.toArray()).toEqual([1, 2]);
    });
  });

  describe("moveLeft / moveRight", () => {
    it("moveLeft at start does nothing", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.moveLeft();
      gb.moveLeft();
      expect(gb.getCursor()).toBe(0);
    });

    it("moveRight at end does nothing", () => {
      const gb = new GapBuffer<number>(4);
      gb.insert(1);
      gb.moveRight();
      expect(gb.getCursor()).toBe(1);
    });

    it("moveLeft moves cursor left", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.moveLeft();
      expect(gb.getCursor()).toBe(1);
    });

    it("moveRight moves cursor right", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(0);
      gb.moveRight();
      expect(gb.getCursor()).toBe(1);
    });

    it("moveLeft then moveRight returns to same position", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.moveLeft();
      gb.moveRight();
      expect(gb.getCursor()).toBe(2);
    });

    it("moveLeft preserves items", () => {
      const gb = new GapBuffer<number>();
      gb.insert(10);
      gb.insert(20);
      gb.insert(30);
      gb.moveLeft();
      expect(gb.toArray()).toEqual([10, 20, 30]);
    });

    it("moveRight preserves items", () => {
      const gb = new GapBuffer<number>();
      gb.insert(10);
      gb.insert(20);
      gb.moveStart();
      gb.moveRight();
      expect(gb.toArray()).toEqual([10, 20]);
    });

    it("moveRight at capacity boundary", () => {
      const gb = new GapBuffer<number>(2);
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(0);
      gb.moveRight();
      expect(gb.getCursor()).toBe(1);
    });
  });

  describe("moveStart / moveEnd", () => {
    it("moveStart goes to position 0", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.moveStart();
      expect(gb.getCursor()).toBe(0);
    });

    it("moveEnd goes to last position", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.moveStart();
      gb.moveEnd();
      expect(gb.getCursor()).toBe(3);
    });

    it("moveStart preserves items", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.moveStart();
      expect(gb.toArray()).toEqual([1, 2, 3]);
    });

    it("moveEnd preserves items", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.moveStart();
      gb.moveEnd();
      expect(gb.toArray()).toEqual([1, 2]);
    });

    it("moveStart on empty buffer", () => {
      const gb = new GapBuffer<number>();
      gb.moveStart();
      expect(gb.getCursor()).toBe(0);
    });

    it("moveEnd on empty buffer", () => {
      const gb = new GapBuffer<number>();
      gb.moveEnd();
      expect(gb.getCursor()).toBe(0);
    });
  });

  describe("get / set", () => {
    it("get returns item at index", () => {
      const gb = new GapBuffer<number>();
      gb.insert(10);
      gb.insert(20);
      gb.insert(30);
      expect(gb.get(0)).toBe(10);
      expect(gb.get(1)).toBe(20);
      expect(gb.get(2)).toBe(30);
    });

    it("get returns undefined for out of bounds", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      expect(gb.get(-1)).toBe(undefined);
      expect(gb.get(5)).toBe(undefined);
    });

    it("set updates item at index", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.set(0, 99);
      expect(gb.get(0)).toBe(99);
    });

    it("set returns true on success", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      expect(gb.set(0, 99)).toBe(true);
    });

    it("set returns false for out of bounds", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      expect(gb.set(-1, 99)).toBe(false);
      expect(gb.set(5, 99)).toBe(false);
    });

    it("get after cursor move", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.setCursor(1);
      expect(gb.get(0)).toBe(1);
      expect(gb.get(1)).toBe(2);
      expect(gb.get(2)).toBe(3);
    });

    it("set after cursor move", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.setCursor(1);
      gb.set(2, 99);
      expect(gb.toArray()).toEqual([1, 2, 99]);
    });
  });

  describe("size / capacity / isEmpty", () => {
    it("size tracks inserts", () => {
      const gb = new GapBuffer<number>();
      expect(gb.size).toBe(0);
      gb.insert(1);
      expect(gb.size).toBe(1);
      gb.insert(2);
      expect(gb.size).toBe(2);
    });

    it("size tracks deletes", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.delete();
      expect(gb.size).toBe(1);
    });

    it("capacity does not change on insert within capacity", () => {
      const gb = new GapBuffer<number>(8);
      for (let i = 0; i < 8; i++) {
        gb.insert(i);
      }
      expect(gb.capacity).toBe(8);
    });

    it("isEmpty returns true when empty", () => {
      const gb = new GapBuffer<number>();
      expect(gb.isEmpty()).toBe(true);
    });

    it("isEmpty returns false when has items", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      expect(gb.isEmpty()).toBe(false);
    });
  });

  describe("clear", () => {
    it("clears all items", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.clear();
      expect(gb.size).toBe(0);
      expect(gb.isEmpty()).toBe(true);
    });

    it("resets cursor to 0", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.setCursor(1);
      gb.clear();
      expect(gb.getCursor()).toBe(0);
    });

    it("preserves capacity", () => {
      const gb = new GapBuffer<number>(16);
      gb.insert(1);
      gb.clear();
      expect(gb.capacity).toBe(16);
    });

    it("allows inserts after clear", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.clear();
      gb.insert(2);
      expect(gb.size).toBe(1);
      expect(gb.get(0)).toBe(2);
    });
  });

  describe("toArray", () => {
    it("returns empty array for empty buffer", () => {
      const gb = new GapBuffer<number>();
      expect(gb.toArray()).toEqual([]);
    });

    it("returns all items in order", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      expect(gb.toArray()).toEqual([1, 2, 3]);
    });

    it("reflects items correctly after cursor move", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.setCursor(1);
      expect(gb.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe("fromArray", () => {
    it("creates buffer from array", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      expect(gb.toArray()).toEqual([1, 2, 3]);
    });

    it("creates buffer from empty array", () => {
      const gb = GapBuffer.fromArray([]);
      expect(gb.isEmpty()).toBe(true);
    });

    it("respects initialCapacity option", () => {
      const gb = GapBuffer.fromArray([1], { initialCapacity: 32 });
      expect(gb.capacity).toBe(32);
    });

    it("uses array length if larger than initialCapacity", () => {
      const gb = GapBuffer.fromArray([1, 2, 3, 4, 5], { initialCapacity: 2 });
      expect(gb.capacity).toBeGreaterThanOrEqual(5);
    });

    it("cursor is at end after fromArray", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      expect(gb.getCursor()).toBe(3);
    });

    it("works with strings", () => {
      const gb = GapBuffer.fromArray(["a", "b", "c"]);
      expect(gb.toArray()).toEqual(["a", "b", "c"]);
    });
  });

  describe("toString", () => {
    it("returns empty string for empty buffer", () => {
      const gb = new GapBuffer<number>();
      expect(gb.toString()).toBe("");
    });

    it("returns comma-separated string", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      expect(gb.toString()).toBe("1,2,3");
    });

    it("works with strings", () => {
      const gb = new GapBuffer<string>();
      gb.insert("hello");
      gb.insert("world");
      expect(gb.toString()).toBe("hello,world");
    });
  });

  describe("Symbol.iterator", () => {
    it("iterates over empty buffer", () => {
      const gb = new GapBuffer<number>();
      const result = [...gb];
      expect(result).toEqual([]);
    });

    it("iterates over items in order", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      const result = [...gb];
      expect(result).toEqual([1, 2, 3]);
    });

    it("works with for...of", () => {
      const gb = new GapBuffer<number>();
      gb.insert(10);
      gb.insert(20);
      const sum = (() => {
        let total = 0;
        for (const item of gb) {
          total += item;
        }
        return total;
      })();
      expect(sum).toBe(30);
    });
  });

  describe("slice", () => {
    it("returns full array with no args", () => {
      const gb = GapBuffer.fromArray([1, 2, 3, 4, 5]);
      expect(gb.slice()).toEqual([1, 2, 3, 4, 5]);
    });

    it("returns from start index", () => {
      const gb = GapBuffer.fromArray([1, 2, 3, 4, 5]);
      expect(gb.slice(2)).toEqual([3, 4, 5]);
    });

    it("returns with start and end", () => {
      const gb = GapBuffer.fromArray([1, 2, 3, 4, 5]);
      expect(gb.slice(1, 4)).toEqual([2, 3, 4]);
    });

    it("clamps negative start to 0", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      expect(gb.slice(-1, 2)).toEqual([1, 2]);
    });

    it("clamps end to size", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      expect(gb.slice(0, 100)).toEqual([1, 2, 3]);
    });

    it("returns empty for start >= end", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      expect(gb.slice(3, 3)).toEqual([]);
    });

    it("returns empty for empty buffer", () => {
      const gb = new GapBuffer<number>();
      expect(gb.slice()).toEqual([]);
    });

    it("works after cursor move", () => {
      const gb = GapBuffer.fromArray([1, 2, 3, 4]);
      gb.setCursor(2);
      expect(gb.slice(1, 3)).toEqual([2, 3]);
    });
  });

  describe("indexOf", () => {
    it("finds item at beginning", () => {
      const gb = GapBuffer.fromArray([10, 20, 30]);
      expect(gb.indexOf(10)).toBe(0);
    });

    it("finds item in middle", () => {
      const gb = GapBuffer.fromArray([10, 20, 30]);
      expect(gb.indexOf(20)).toBe(1);
    });

    it("finds item at end", () => {
      const gb = GapBuffer.fromArray([10, 20, 30]);
      expect(gb.indexOf(30)).toBe(2);
    });

    it("returns -1 for missing item", () => {
      const gb = GapBuffer.fromArray([10, 20, 30]);
      expect(gb.indexOf(99)).toBe(-1);
    });

    it("returns -1 for empty buffer", () => {
      const gb = new GapBuffer<number>();
      expect(gb.indexOf(1)).toBe(-1);
    });

    it("finds strings", () => {
      const gb = GapBuffer.fromArray(["a", "b", "c"]);
      expect(gb.indexOf("b")).toBe(1);
    });

    it("finds items after cursor move", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      gb.setCursor(1);
      expect(gb.indexOf(3)).toBe(2);
    });
  });

  describe("contains", () => {
    it("returns true for existing item", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      expect(gb.contains(2)).toBe(true);
    });

    it("returns false for missing item", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      expect(gb.contains(99)).toBe(false);
    });

    it("returns false for empty buffer", () => {
      const gb = new GapBuffer<number>();
      expect(gb.contains(1)).toBe(false);
    });
  });

  describe("forEach", () => {
    it("iterates over all items", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      const items: number[] = [];
      gb.forEach((item) => items.push(item));
      expect(items).toEqual([1, 2, 3]);
    });

    it("provides correct index", () => {
      const gb = GapBuffer.fromArray([10, 20, 30]);
      const indices: number[] = [];
      gb.forEach((_item, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it("does nothing for empty buffer", () => {
      const gb = new GapBuffer<number>();
      let count = 0;
      gb.forEach(() => count++);
      expect(count).toBe(0);
    });

    it("works after cursor move", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      gb.setCursor(1);
      const items: number[] = [];
      gb.forEach((item) => items.push(item));
      expect(items).toEqual([1, 2, 3]);
    });
  });

  describe("gapSize", () => {
    it("starts at full capacity", () => {
      const gb = new GapBuffer<number>(8);
      expect(gb.gapSize).toBe(8);
    });

    it("decreases with inserts", () => {
      const gb = new GapBuffer<number>(8);
      gb.insert(1);
      expect(gb.gapSize).toBe(7);
    });

    it("increases with deletes", () => {
      const gb = new GapBuffer<number>(8);
      gb.insert(1);
      gb.insert(2);
      gb.delete();
      expect(gb.gapSize).toBe(7);
    });

    it("is 0 when buffer is full", () => {
      const gb = new GapBuffer<number>(2);
      gb.insert(1);
      gb.insert(2);
      expect(gb.gapSize).toBe(0);
    });
  });

  describe("insert in middle", () => {
    it("insert at beginning after moveStart", () => {
      const gb = GapBuffer.fromArray([2, 3]);
      gb.moveStart();
      gb.insert(1);
      expect(gb.toArray()).toEqual([1, 2, 3]);
    });

    it("insert in middle", () => {
      const gb = GapBuffer.fromArray([1, 3]);
      gb.setCursor(1);
      gb.insert(2);
      expect(gb.toArray()).toEqual([1, 2, 3]);
    });

    it("multiple inserts in middle", () => {
      const gb = GapBuffer.fromArray([1, 5]);
      gb.setCursor(1);
      gb.insert(2);
      gb.insert(3);
      gb.insert(4);
      expect(gb.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it("insert at various positions", () => {
      const gb = new GapBuffer<string>(8);
      gb.insert("c");
      gb.insert("e");
      gb.setCursor(1);
      gb.insert("d");
      gb.setCursor(0);
      gb.insert("b");
      gb.setCursor(0);
      gb.insert("a");
      expect(gb.toArray()).toEqual(["a", "b", "c", "d", "e"]);
    });
  });

  describe("complex operations", () => {
    it("alternating insert and delete", () => {
      const gb = new GapBuffer<number>();
      gb.insert(1);
      gb.delete();
      expect(gb.isEmpty()).toBe(true);
      gb.insert(2);
      gb.insert(3);
      expect(gb.toArray()).toEqual([2, 3]);
    });

    it("insert after clearing", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      gb.clear();
      gb.insert(4);
      gb.insert(5);
      expect(gb.toArray()).toEqual([4, 5]);
    });

    it("large number of operations", () => {
      const gb = new GapBuffer<number>(4);
      for (let i = 0; i < 100; i++) {
        gb.insert(i);
      }
      expect(gb.size).toBe(100);
      expect(gb.get(0)).toBe(0);
      expect(gb.get(99)).toBe(99);
    });

    it("move cursor back and forth preserves data", () => {
      const gb = GapBuffer.fromArray([1, 2, 3, 4, 5]);
      gb.setCursor(2);
      gb.moveStart();
      gb.moveEnd();
      gb.setCursor(3);
      gb.moveStart();
      gb.moveEnd();
      expect(gb.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it("gap position after multiple setCursor calls", () => {
      const gb = GapBuffer.fromArray([1, 2, 3, 4, 5]);
      gb.setCursor(0);
      expect(gb.getCursor()).toBe(0);
      gb.setCursor(5);
      expect(gb.getCursor()).toBe(5);
      gb.setCursor(2);
      expect(gb.getCursor()).toBe(2);
      gb.insert(99);
      expect(gb.toArray()).toEqual([1, 2, 99, 3, 4, 5]);
    });

    it("delete then insert at same position", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      gb.setCursor(1);
      gb.delete();
      gb.insert(99);
      expect(gb.toArray()).toEqual([99, 2, 3]);
    });

    it("slice with various gap positions", () => {
      const gb = GapBuffer.fromArray([1, 2, 3, 4, 5]);
      gb.setCursor(2);
      expect(gb.slice(0, 3)).toEqual([1, 2, 3]);
      expect(gb.slice(2, 5)).toEqual([3, 4, 5]);
    });

    it("set after growth", () => {
      const gb = new GapBuffer<number>(2);
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      gb.set(1, 99);
      expect(gb.get(1)).toBe(99);
    });

    it("indexOf with growth", () => {
      const gb = new GapBuffer<number>(2);
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      expect(gb.indexOf(3)).toBe(2);
    });

    it("forEach with growth", () => {
      const gb = new GapBuffer<number>(2);
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      const items: number[] = [];
      gb.forEach((item) => items.push(item));
      expect(items).toEqual([1, 2, 3]);
    });

    it("iterator with growth", () => {
      const gb = new GapBuffer<number>(2);
      gb.insert(1);
      gb.insert(2);
      gb.insert(3);
      expect([...gb]).toEqual([1, 2, 3]);
    });

    it("toString with cursor in middle", () => {
      const gb = GapBuffer.fromArray([1, 2, 3]);
      gb.setCursor(1);
      expect(gb.toString()).toBe("1,2,3");
    });
  });
});
