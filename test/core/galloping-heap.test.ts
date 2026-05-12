import { describe, it, expect } from "vitest";
import { GallopingHeap, type GallopingHeapNode } from "../../src/core/galloping-heap/index.js";

describe("GallopingHeap - basic operations", () => {
  it("should create an empty heap", () => {
    const heap = new GallopingHeap<number>();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it("should insert a single element", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(5);
    expect(heap.size).toBe(1);
    expect(heap.isEmpty()).toBe(false);
    expect(node.value).toBe(5);
  });

  it("should peek at minimum element", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    expect(heap.peek()).toBe(5);
  });

  it("should return undefined when peeking empty heap", () => {
    const heap = new GallopingHeap<number>();
    expect(heap.peek()).toBe(undefined);
  });

  it("should extract minimum element", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    const extracted = heap.extractMin();
    expect(extracted).toBe(5);
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it("should return undefined when extracting from empty heap", () => {
    const heap = new GallopingHeap<number>();
    expect(heap.extractMin()).toBe(undefined);
  });

  it("should maintain min-heap property after multiple inserts", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    expect(heap.peek()).toBe(1);
  });

  it("should extract elements in ascending order", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);
    heap.insert(4);

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual([1, 3, 4, 5, 7]);
  });

  it("should handle duplicate values", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(5);
    heap.insert(3);
    heap.insert(1);

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual([1, 3, 3, 5, 5]);
  });
});

describe("GallopingHeap - size and isEmpty", () => {
  it("should report correct size after inserts", () => {
    const heap = new GallopingHeap<number>();
    expect(heap.size).toBe(0);

    heap.insert(1);
    expect(heap.size).toBe(1);

    heap.insert(2);
    expect(heap.size).toBe(2);

    heap.insert(3);
    expect(heap.size).toBe(3);
  });

  it("should report correct size after extracts", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);

    heap.extractMin();
    expect(heap.size).toBe(2);

    heap.extractMin();
    expect(heap.size).toBe(1);

    heap.extractMin();
    expect(heap.size).toBe(0);
  });

  it("should report isEmpty correctly", () => {
    const heap = new GallopingHeap<number>();
    expect(heap.isEmpty()).toBe(true);

    heap.insert(1);
    expect(heap.isEmpty()).toBe(false);

    heap.extractMin();
    expect(heap.isEmpty()).toBe(true);
  });
});

describe("GallopingHeap - merge", () => {
  it("should merge two non-empty heaps", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    heap1.insert(3);
    heap1.insert(5);

    heap2.insert(1);
    heap2.insert(7);

    heap1.merge(heap2);

    expect(heap1.size).toBe(4);
    expect(heap1.peek()).toBe(1);
    expect(heap2.size).toBe(0);
    expect(heap2.isEmpty()).toBe(true);
  });

  it("should merge with empty heap", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    heap1.insert(1);
    heap1.insert(3);

    heap1.merge(heap2);

    expect(heap1.size).toBe(2);
    expect(heap1.peek()).toBe(1);
  });

  it("should merge empty heap with non-empty heap", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    heap2.insert(1);
    heap2.insert(3);

    heap1.merge(heap2);

    expect(heap1.size).toBe(2);
    expect(heap1.peek()).toBe(1);
    expect(heap2.size).toBe(0);
  });

  it("should merge two empty heaps", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    heap1.merge(heap2);

    expect(heap1.size).toBe(0);
    expect(heap2.size).toBe(0);
  });

  it("should maintain heap order after merge", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    for (let i = 0; i < 10; i++) {
      heap1.insert(i * 2);
    }

    for (let i = 0; i < 10; i++) {
      heap2.insert(i * 2 + 1);
    }

    heap1.merge(heap2);

    const result: number[] = [];
    while (!heap1.isEmpty()) {
      const val = heap1.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });

  it("should merge heaps with overlapping values", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    heap1.insert(1);
    heap1.insert(3);
    heap1.insert(5);

    heap2.insert(2);
    heap2.insert(4);
    heap2.insert(6);

    heap1.merge(heap2);

    const result: number[] = [];
    while (!heap1.isEmpty()) {
      const val = heap1.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("GallopingHeap - decreaseKey", () => {
  it("should decrease key of root node", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    heap.decreaseKey(node, 1);

    expect(heap.peek()).toBe(1);
  });

  it("should decrease key of non-root node", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    const node = heap.insert(10);
    heap.insert(3);

    heap.decreaseKey(node, 1);

    expect(heap.peek()).toBe(1);
  });

  it("should maintain heap property after decreaseKey", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(10);
    const node1 = heap.insert(15);
    heap.insert(5);
    const node2 = heap.insert(20);
    heap.insert(8);

    heap.decreaseKey(node1, 3);
    heap.decreaseKey(node2, 2);

    expect(heap.peek()).toBe(2);
  });

  it("should handle multiple decreaseKey operations", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(100);
    heap.insert(50);
    heap.insert(75);

    heap.decreaseKey(node, 25);
    expect(heap.peek()).toBe(25);

    heap.decreaseKey(node, 10);
    expect(heap.peek()).toBe(10);
  });
});

describe("GallopingHeap - delete", () => {
  it("should delete root node", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    const node = heap.insert(1);
    heap.insert(7);

    heap.delete(node);

    expect(heap.peek()).toBe(3);
    expect(heap.size).toBe(3);
  });

  it("should delete non-root node", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    const node = heap.insert(3);
    heap.insert(1);
    heap.insert(7);

    heap.delete(node);

    expect(heap.peek()).toBe(1);
    expect(heap.size).toBe(3);
  });

  it("should delete from single element heap", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(5);

    heap.delete(node);

    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it("should maintain heap order after delete", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(10);
    const node = heap.insert(20);
    heap.insert(15);
    heap.insert(5);

    heap.delete(node);

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual([5, 10, 15]);
  });

  it("should handle delete after decreaseKey", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(10);
    const node = heap.insert(20);
    heap.insert(15);

    heap.decreaseKey(node, 5);
    heap.delete(node);

    expect(heap.peek()).toBe(10);
  });
});

describe("GallopingHeap - toArray", () => {
  it("should return empty array for empty heap", () => {
    const heap = new GallopingHeap<number>();
    expect(heap.toArray()).toEqual([]);
  });

  it("should return single element for one-item heap", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    expect(heap.toArray()).toEqual([5]);
  });

  it("should return all elements without modifying heap", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);

    const arr = heap.toArray();
    expect(heap.size).toBe(4);
    expect(arr.length).toBe(4);
    expect(arr).toContain(1);
    expect(arr).toContain(3);
    expect(arr).toContain(5);
    expect(arr).toContain(7);
  });

  it("should return elements with duplicates", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(5);
    heap.insert(3);

    const arr = heap.toArray();
    expect(arr.length).toBe(4);
    expect(arr.filter((x) => x === 3).length).toBe(2);
    expect(arr.filter((x) => x === 5).length).toBe(2);
  });
});

describe("GallopingHeap - forEach", () => {
  it("should not call callback for empty heap", () => {
    const heap = new GallopingHeap<number>();
    let called = false;
    heap.forEach(() => {
      called = true;
    });
    expect(called).toBe(false);
  });

  it("should call callback for each element", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    const result: number[] = [];
    heap.forEach((val) => result.push(val));

    expect(result.length).toBe(3);
    expect(result).toContain(3);
    expect(result).toContain(5);
    expect(result).toContain(7);
  });

  it("should not modify heap during forEach", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    heap.forEach(() => {});

    expect(heap.size).toBe(3);
    expect(heap.peek()).toBe(3);
  });
});

describe("GallopingHeap - clear", () => {
  it("should clear empty heap", () => {
    const heap = new GallopingHeap<number>();
    heap.clear();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it("should clear non-empty heap", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);

    heap.clear();

    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
    expect(heap.peek()).toBe(undefined);
  });

  it("should allow operations after clear", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(1);
    heap.insert(2);
    heap.clear();

    heap.insert(5);
    heap.insert(3);

    expect(heap.size).toBe(2);
    expect(heap.peek()).toBe(3);
  });
});

describe("GallopingHeap - capacity", () => {
  it("should enforce capacity when specified", () => {
    const heap = new GallopingHeap<number>({ capacity: 3 });
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    expect(() => heap.insert(1)).toThrow("Heap is at capacity");
  });

  it("should allow inserts up to capacity", () => {
    const heap = new GallopingHeap<number>({ capacity: 3 });
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    expect(heap.size).toBe(3);
  });

  it("should allow inserts after extraction under capacity", () => {
    const heap = new GallopingHeap<number>({ capacity: 3 });
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    heap.extractMin();
    heap.insert(1);

    expect(heap.size).toBe(3);
  });

  it("should respect capacity after merge", () => {
    const heap1 = new GallopingHeap<number>({ capacity: 3 });
    const heap2 = new GallopingHeap<number>();

    heap1.insert(1);
    heap1.insert(3);
    heap2.insert(2);
    heap2.insert(4);

    heap1.merge(heap2);

    expect(heap1.size).toBe(3);
  });
});

describe("GallopingHeap - edge cases", () => {
  it("should handle negative numbers", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(-5);
    heap.insert(-3);
    heap.insert(-7);
    heap.insert(-1);

    expect(heap.peek()).toBe(-7);

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual([-7, -5, -3, -1]);
  });

  it("should handle zero", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(0);
    heap.insert(-3);
    heap.insert(0);

    expect(heap.peek()).toBe(-3);
  });

  it("should handle large numbers", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(Number.MAX_SAFE_INTEGER);
    heap.insert(0);
    heap.insert(Number.MIN_SAFE_INTEGER);

    expect(heap.peek()).toBe(Number.MIN_SAFE_INTEGER);
  });

  it("should handle strings", () => {
    const heap = new GallopingHeap<string>();
    heap.insert("zebra");
    heap.insert("apple");
    heap.insert("banana");

    expect(heap.peek()).toBe("apple");
  });

  it("should extract strings in alphabetical order", () => {
    const heap = new GallopingHeap<string>();
    heap.insert("zebra");
    heap.insert("apple");
    heap.insert("banana");
    heap.insert("cherry");

    const result: string[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual(["apple", "banana", "cherry", "zebra"]);
  });

  it("should handle comparable tuples", () => {
    const heap = new GallopingHeap<[number, string]>();
    heap.insert([5, "five"]);
    heap.insert([3, "three"]);
    heap.insert([7, "seven"]);

    expect(heap.peek()?.[0]).toBe(3);
  });
});

describe("GallopingHeap - large batches", () => {
  it("should handle inserting 100 elements", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }

    expect(heap.size).toBe(100);
    expect(heap.peek()).toBe(0);
  });

  it("should extract all 100 elements in order", () => {
    const heap = new GallopingHeap<number>();
    const elements: number[] = [];
    for (let i = 0; i < 100; i++) {
      elements.push(i);
    }

    for (const el of elements) {
      heap.insert(el);
    }

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual(elements);
  });

  it("should handle inserting 100 elements in reverse order", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 99; i >= 0; i--) {
      heap.insert(i);
    }

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i));
  });

  it("should handle inserting 100 random elements", () => {
    const heap = new GallopingHeap<number>();
    const elements = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));

    for (const el of elements) {
      heap.insert(el);
    }

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    const sorted = [...elements].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });
});

describe("GallopingHeap - mixed operations", () => {
  it("should handle alternating inserts and extracts", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.extractMin();
    heap.insert(7);
    heap.extractMin();
    heap.insert(1);

    expect(heap.peek()).toBe(1);
  });

  it("should handle inserts, extracts, and merges", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    heap1.insert(5);
    heap1.insert(3);
    heap2.insert(7);
    heap2.insert(1);

    heap1.extractMin();
    heap1.merge(heap2);

    expect(heap1.peek()).toBe(1);
    expect(heap1.size).toBe(3);
  });

  it("should handle complex sequence of operations", () => {
    const heap = new GallopingHeap<number>();

    heap.insert(10);
    heap.insert(20);
    heap.insert(5);

    const node1 = heap.insert(15);
    heap.decreaseKey(node1, 3);

    heap.extractMin();
    heap.insert(25);

    const node2 = heap.insert(30);
    heap.delete(node2);

    expect(heap.size).toBe(4);
    expect(heap.peek()).toBe(5);
  });

  it("should maintain correctness after many mixed operations", () => {
    const heap = new GallopingHeap<number>();
    const nodes: GallopingHeapNode<number>[] = [];

    for (let i = 0; i < 50; i++) {
      nodes.push(heap.insert(i * 10));
    }

    for (let i = 0; i < 25; i++) {
      heap.decreaseKey(nodes[i], i * 5);
    }

    for (let i = 0; i < 10; i++) {
      heap.extractMin();
    }

    for (let i = 25; i < 35; i++) {
      heap.delete(nodes[i]);
    }

    expect(heap.size).toBe(30);
    expect(heap.peek()).toBe(50);
  });
});

describe("GallopingHeap - stress tests", () => {
  it("should handle 1000 sequential inserts", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 1000; i++) {
      heap.insert(i);
    }
    expect(heap.size).toBe(1000);
  });

  it("should handle 1000 sequential extracts", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 1000; i++) {
      heap.insert(i);
    }

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual(Array.from({ length: 1000 }, (_, i) => i));
  });

  it("should handle 500 merges", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 500; i++) {
      const temp = new GallopingHeap<number>();
      temp.insert(i);
      heap.merge(temp);
    }

    expect(heap.size).toBe(500);
    expect(heap.peek()).toBe(0);
  });
});

describe("GallopingHeap - node references", () => {
  it("should return valid node from insert", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(5);

    expect(node).toBeDefined();
    expect(node.value).toBe(5);
    expect(Array.isArray(node.children)).toBe(true);
  });

  it("should modify node value through decreaseKey", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(10);

    heap.decreaseKey(node, 5);

    expect(node.value).toBe(5);
  });

  it("should maintain node reference after merge", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    const node = heap2.insert(5);
    heap1.insert(3);

    heap1.merge(heap2);

    heap1.decreaseKey(node, 1);
    expect(heap1.peek()).toBe(1);
  });
});

describe("GallopingHeap - consecutive operations", () => {
  it("should handle 100 consecutive inserts", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }
    expect(heap.size).toBe(100);
  });

  it("should handle 100 consecutive extracts", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }

    let prev = -1;
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        expect(val).toBeGreaterThan(prev);
        prev = val;
      }
    }
  });

  it("should handle 100 consecutive peeks", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);

    for (let i = 0; i < 100; i++) {
      expect(heap.peek()).toBe(5);
    }
  });

  it("should handle 100 consecutive size checks", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);

    for (let i = 0; i < 100; i++) {
      expect(heap.size).toBe(3);
    }
  });
});

describe("GallopingHeap - boundary conditions", () => {
  it("should work with capacity 1", () => {
    const heap = new GallopingHeap<number>({ capacity: 1 });
    heap.insert(5);
    expect(() => heap.insert(3)).toThrow("Heap is at capacity");
  });

  it("should work with very large capacity", () => {
    const heap = new GallopingHeap<number>({ capacity: 10000 });
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }
    expect(heap.size).toBe(100);
  });

  it("should handle inserting same value many times", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 50; i++) {
      heap.insert(42);
    }

    expect(heap.size).toBe(50);
    expect(heap.peek()).toBe(42);

    for (let i = 0; i < 50; i++) {
      expect(heap.extractMin()).toBe(42);
    }

    expect(heap.isEmpty()).toBe(true);
  });
});

describe("GallopingHeap - additional decreaseKey tests", () => {
  it("should handle decreaseKey to same value", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(5);
    heap.insert(3);

    heap.decreaseKey(node, 5);

    expect(heap.peek()).toBe(3);
  });

  it("should handle decreaseKey on leaf node", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(1);
    const node = heap.insert(5);
    heap.insert(2);
    heap.insert(6);

    heap.decreaseKey(node, 3);

    expect(heap.peek()).toBe(1);
  });

  it("should handle decreaseKey to negative value", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    const node = heap.insert(10);
    heap.insert(7);

    heap.decreaseKey(node, -5);

    expect(heap.peek()).toBe(-5);
  });

  it("should handle multiple decreaseKey on same node", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(100);
    heap.insert(50);
    heap.insert(75);

    heap.decreaseKey(node, 50);
    expect(heap.peek()).toBe(50);

    heap.decreaseKey(node, 25);
    expect(heap.peek()).toBe(25);

    heap.decreaseKey(node, 10);
    expect(heap.peek()).toBe(10);
  });

  it("should handle decreaseKey after many extracts", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(100);
    for (let i = 0; i < 20; i++) {
      heap.insert(i + 1);
    }

    for (let i = 0; i < 10; i++) {
      heap.extractMin();
    }

    heap.decreaseKey(node, 5);
    expect(heap.peek()).toBe(5);
  });
});

describe("GallopingHeap - additional delete tests", () => {
  it("should handle delete on empty heap", () => {
    const heap = new GallopingHeap<number>();
    const node = { value: 1, children: [] };

    expect(() => heap.delete(node)).not.toThrow();
    expect(heap.isEmpty()).toBe(true);
  });

  it("should handle delete on leaf node", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(1);
    const node = heap.insert(5);
    heap.insert(2);

    heap.delete(node);

    expect(heap.size).toBe(2);
    expect(heap.peek()).toBe(1);
  });

  it("should handle delete on internal node", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(3);
    heap.insert(1);
    heap.insert(5);
    heap.insert(2);

    heap.delete(node);

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual([1, 2, 5]);
  });

  it("should handle multiple deletes", () => {
    const heap = new GallopingHeap<number>();
    const nodes: GallopingHeapNode<number>[] = [];
    for (let i = 0; i < 20; i++) {
      nodes.push(heap.insert(i));
    }

    for (let i = 0; i < 10; i++) {
      heap.delete(nodes[i]);
    }

    expect(heap.size).toBe(10);
  });

  it("should handle delete after decreaseKey", () => {
    const heap = new GallopingHeap<number>();
    const node = heap.insert(10);
    heap.insert(5);
    heap.insert(15);

    heap.decreaseKey(node, 3);
    heap.delete(node);

    expect(heap.peek()).toBe(5);
  });
});

describe("GallopingHeap - error handling", () => {
  it("should throw error when exceeding capacity", () => {
    const heap = new GallopingHeap<number>({ capacity: 5 });
    for (let i = 0; i < 5; i++) {
      heap.insert(i);
    }

    expect(() => heap.insert(5)).toThrow("Heap is at capacity");
  });

  it("should throw error on decreaseKey with empty heap", () => {
    const heap = new GallopingHeap<number>();
    const node = { value: 1, children: [] };

    expect(() => heap.decreaseKey(node, 0)).toThrow("Heap is empty");
  });

  it("should handle inserting NaN", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(NaN);

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result.length).toBe(2);
  });

  it("should handle inserting Infinity", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(Infinity);
    heap.insert(-Infinity);

    expect(heap.peek()).toBe(-Infinity);
  });
});

describe("GallopingHeap - additional merge tests", () => {
  it("should merge multiple heaps sequentially", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();
    const heap3 = new GallopingHeap<number>();

    heap1.insert(5);
    heap2.insert(3);
    heap3.insert(1);

    heap1.merge(heap2);
    heap1.merge(heap3);

    expect(heap1.size).toBe(3);
    expect(heap1.peek()).toBe(1);
  });

  it("should merge heaps with same values", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    for (let i = 0; i < 10; i++) {
      heap1.insert(i);
      heap2.insert(i);
    }

    heap1.merge(heap2);

    expect(heap1.size).toBe(20);
    expect(heap1.peek()).toBe(0);
  });

  it("should maintain heap property after multiple merges", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();
    const heap3 = new GallopingHeap<number>();

    for (let i = 0; i < 5; i++) {
      heap1.insert(i * 10);
      heap2.insert(i * 10 + 5);
      heap3.insert(i * 10 + 3);
    }

    heap1.merge(heap2);
    heap1.merge(heap3);

    const result: number[] = [];
    while (!heap1.isEmpty()) {
      const val = heap1.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual([0, 3, 5, 10, 13, 15, 20, 23, 25, 30, 33, 35, 40, 43, 45]);
  });

  it("should merge heap into itself", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);

    const heap2 = new GallopingHeap<number>();
    heap.insert(1);

    heap2.merge(heap);
    heap2.merge(heap);

    expect(heap2.size).toBe(3);
    expect(heap2.peek()).toBe(1);
  });
});

describe("GallopingHeap - additional toArray and forEach tests", () => {
  it("should toArray with large heap", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }

    const arr = heap.toArray();
    expect(arr.length).toBe(100);
    expect(heap.size).toBe(100);
  });

  it("should forEach with large heap", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }

    let count = 0;
    heap.forEach(() => {
      count++;
    });

    expect(count).toBe(100);
    expect(heap.size).toBe(100);
  });

  it("should toArray after multiple operations", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 20; i++) {
      heap.insert(i);
    }

    heap.extractMin();
    heap.extractMin();

    heap.insert(20);
    heap.insert(21);

    const arr = heap.toArray();
    expect(arr.length).toBe(20);
  });
});

describe("GallopingHeap - performance characteristics", () => {
  it("should handle rapid inserts", () => {
    const heap = new GallopingHeap<number>();
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      heap.insert(i);
    }
    const end = Date.now();

    expect(heap.size).toBe(1000);
    expect(end - start).toBeLessThan(1000);
  });

  it("should handle rapid extracts", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }

    const start = Date.now();
    while (!heap.isEmpty()) {
      heap.extractMin();
    }
    const end = Date.now();

    expect(heap.isEmpty()).toBe(true);
    expect(end - start).toBeLessThan(1000);
  });

  it("should handle alternating insert/extract", () => {
    const heap = new GallopingHeap<number>();
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
      heap.insert(i + 100);
      heap.extractMin();
    }
    const end = Date.now();

    expect(heap.size).toBe(100);
    expect(end - start).toBeLessThan(1000);
  });
});

describe("GallopingHeap - complex scenarios", () => {
  it("should handle Fibonacci-like insertion pattern", () => {
    const heap = new GallopingHeap<number>();
    const fib = [0, 1];
    for (let i = 2; i < 15; i++) {
      fib.push(fib[i - 1] + fib[i - 2]);
    }

    for (const num of fib) {
      heap.insert(num);
    }

    expect(heap.size).toBe(15);
    expect(heap.peek()).toBe(0);
  });

  it("should handle powers of 2", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 15; i++) {
      heap.insert(Math.pow(2, i));
    }

    expect(heap.size).toBe(15);
    expect(heap.peek()).toBe(1);
  });

  it("should handle alternating insert and merge", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    for (let i = 0; i < 10; i++) {
      heap1.insert(i * 2);
      heap2.insert(i * 2 + 1);
      if (i % 3 === 0) {
        heap1.merge(heap2);
      }
    }

    heap1.merge(heap2);
    expect(heap1.size).toBe(20);
  });

  it("should handle insert-decreaseKey-extract cycle", () => {
    const heap = new GallopingHeap<number>();
    const nodes: GallopingHeapNode<number>[] = [];

    for (let i = 0; i < 20; i++) {
      nodes.push(heap.insert(i * 10));
    }

    for (let i = 0; i < 10; i++) {
      heap.decreaseKey(nodes[i], i * 5);
      heap.extractMin();
    }

    expect(heap.size).toBe(10);
  });

  it("should handle multiple toArray calls", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    const arr1 = heap.toArray();
    const arr2 = heap.toArray();
    const arr3 = heap.toArray();

    expect(arr1).toEqual(arr2);
    expect(arr2).toEqual(arr3);
    expect(heap.size).toBe(3);
  });

  it("should handle multiple forEach calls", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    let count1 = 0;
    let count2 = 0;
    let count3 = 0;

    heap.forEach(() => count1++);
    heap.forEach(() => count2++);
    heap.forEach(() => count3++);

    expect(count1).toBe(3);
    expect(count2).toBe(3);
    expect(count3).toBe(3);
    expect(heap.size).toBe(3);
  });

  it("should handle clear then reuse", () => {
    const heap = new GallopingHeap<number>();
    for (let i = 0; i < 10; i++) {
      heap.insert(i);
    }

    heap.clear();

    for (let i = 10; i < 20; i++) {
      heap.insert(i);
    }

    expect(heap.size).toBe(10);
    expect(heap.peek()).toBe(10);
  });

  it("should handle merge after clear", () => {
    const heap1 = new GallopingHeap<number>();
    const heap2 = new GallopingHeap<number>();

    heap1.insert(1);
    heap1.insert(2);
    heap1.clear();

    heap2.insert(3);
    heap2.insert(4);

    heap1.merge(heap2);

    expect(heap1.size).toBe(2);
    expect(heap1.peek()).toBe(3);
  });

  it("should handle mixed numeric types", () => {
    const heap = new GallopingHeap<number>();
    heap.insert(5.5);
    heap.insert(3);
    heap.insert(7.2);
    heap.insert(-1.8);

    expect(heap.peek()).toBe(-1.8);

    const result: number[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result).toEqual([-1.8, 3, 5.5, 7.2]);
  });

  it("should handle empty string", () => {
    const heap = new GallopingHeap<string>();
    heap.insert("a");
    heap.insert("");
    heap.insert("b");

    expect(heap.peek()).toBe("");
  });

  it("should handle unicode strings", () => {
    const heap = new GallopingHeap<string>();
    heap.insert("apple");
    heap.insert("banana");
    heap.insert("cherry");
    heap.insert("äpfel");
    heap.insert("öranje");

    const result: string[] = [];
    while (!heap.isEmpty()) {
      const val = heap.extractMin();
      if (val !== undefined) {
        result.push(val);
      }
    }

    expect(result.length).toBe(5);
  });

  it("should handle very long strings", () => {
    const heap = new GallopingHeap<string>();
    heap.insert("a".repeat(1000));
    heap.insert("b".repeat(1000));
    heap.insert("c".repeat(1000));

    expect(heap.peek()).toBe("a".repeat(1000));
  });
});
