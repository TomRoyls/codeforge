import { describe, it, expect } from "vitest";
import { DoubleBufferQueue } from "../../src/core/double-buffer-queue/index.js";

describe("DoubleBufferQueue", () => {
  describe("constructor", () => {
    it("should create empty queue without options", () => {
      const queue = new DoubleBufferQueue<number>();
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should create empty queue with empty options", () => {
      const queue = new DoubleBufferQueue<number>({});
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should create queue with capacity option", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 5 });
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should treat undefined capacity as unlimited", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: undefined });
      expect(queue.isFull()).toBe(false);
    });

    it("should treat Infinity capacity as unlimited", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: Infinity });
      expect(queue.isFull()).toBe(false);
    });
  });

  describe("enqueue", () => {
    it("should add single element", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      expect(queue.size()).toBe(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it("should add multiple elements", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
    });

    it("should add string elements", () => {
      const queue = new DoubleBufferQueue<string>();
      queue.enqueue("a");
      queue.enqueue("b");
      expect(queue.size()).toBe(2);
    });

    it("should add object elements", () => {
      const queue = new DoubleBufferQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.size()).toBe(2);
    });

    it("should add null elements", () => {
      const queue = new DoubleBufferQueue<number | null>();
      queue.enqueue(null);
      expect(queue.size()).toBe(1);
    });

    it("should add undefined elements", () => {
      const queue = new DoubleBufferQueue<number | undefined>();
      queue.enqueue(undefined);
      expect(queue.size()).toBe(1);
    });

    it("should throw when queue is full", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      expect(() => queue.enqueue(3)).toThrow("Queue is full");
    });

    it("should throw when queue is full with single element", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 1 });
      queue.enqueue(1);
      expect(() => queue.enqueue(2)).toThrow("Queue is full");
    });

    it("should allow enqueue after dequeue", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.enqueue(3);
      expect(queue.size()).toBe(2);
    });

    it("should allow enqueue after clear", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      queue.enqueue(1);
      expect(queue.size()).toBe(1);
    });
  });

  describe("dequeue", () => {
    it("should return undefined from empty queue", () => {
      const queue = new DoubleBufferQueue<number>();
      expect(queue.dequeue()).toBe(undefined);
    });

    it("should dequeue single element", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      expect(queue.dequeue()).toBe(1);
      expect(queue.size()).toBe(0);
    });

    it("should dequeue multiple elements in FIFO order", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.size()).toBe(0);
    });

    it("should dequeue after partial buffer swap", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(5);
      queue.enqueue(6);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(4);
      expect(queue.dequeue()).toBe(5);
      expect(queue.dequeue()).toBe(6);
    });

    it("should dequeue string elements", () => {
      const queue = new DoubleBufferQueue<string>();
      queue.enqueue("a");
      queue.enqueue("b");
      expect(queue.dequeue()).toBe("a");
      expect(queue.dequeue()).toBe("b");
    });

    it("should dequeue object elements", () => {
      const queue = new DoubleBufferQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      const item = queue.dequeue();
      expect(item).toEqual({ id: 1 });
    });

    it("should dequeue null elements", () => {
      const queue = new DoubleBufferQueue<number | null>();
      queue.enqueue(null);
      queue.enqueue(1);
      expect(queue.dequeue()).toBe(null);
    });

    it("should dequeue undefined elements", () => {
      const queue = new DoubleBufferQueue<number | undefined>();
      queue.enqueue(undefined);
      queue.enqueue(1);
      expect(queue.dequeue()).toBe(undefined);
    });

    it("should return undefined when dequeueing empty queue after enqueues", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.dequeue()).toBe(undefined);
    });
  });

  describe("peek", () => {
    it("should return undefined from empty queue", () => {
      const queue = new DoubleBufferQueue<number>();
      expect(queue.peek()).toBe(undefined);
    });

    it("should peek first element without removing it", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.peek()).toBe(1);
      expect(queue.size()).toBe(2);
    });

    it("should peek same element multiple times", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.peek()).toBe(1);
      expect(queue.peek()).toBe(1);
      expect(queue.peek()).toBe(1);
    });

    it("should peek after dequeue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      expect(queue.peek()).toBe(2);
    });

    it("should peek after buffer swap", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(4);
      expect(queue.peek()).toBe(3);
    });

    it("should peek string element", () => {
      const queue = new DoubleBufferQueue<string>();
      queue.enqueue("first");
      expect(queue.peek()).toBe("first");
    });

    it("should peek object element", () => {
      const queue = new DoubleBufferQueue<{ value: number }>();
      queue.enqueue({ value: 42 });
      expect(queue.peek()).toEqual({ value: 42 });
    });
  });

  describe("size", () => {
    it("should return 0 for new queue", () => {
      const queue = new DoubleBufferQueue<number>();
      expect(queue.size()).toBe(0);
    });

    it("should return 1 after enqueue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      expect(queue.size()).toBe(1);
    });

    it("should return correct size after multiple enqueues", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
    });

    it("should decrease after dequeue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      expect(queue.size()).toBe(1);
    });

    it("should return 0 after dequeuing all elements", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.size()).toBe(0);
    });

    it("should return correct size after enqueue/dequeue mix", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.enqueue(4);
      expect(queue.size()).toBe(3);
    });

    it("should return correct size after buffer swap", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(5);
      queue.enqueue(6);
      expect(queue.size()).toBe(4);
    });

    it("should return 0 after clear", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      expect(queue.size()).toBe(0);
    });
  });

  describe("isEmpty", () => {
    it("should return true for new queue", () => {
      const queue = new DoubleBufferQueue<number>();
      expect(queue.isEmpty()).toBe(true);
    });

    it("should return false after enqueue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it("should return true after dequeuing all elements", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });

    it("should return false after partial dequeue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      expect(queue.isEmpty()).toBe(false);
    });

    it("should return true after clear", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
    });

    it("should return true after dequeue of last element", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe("isFull", () => {
    it("should return false for unlimited capacity queue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.isFull()).toBe(false);
    });

    it("should return false for queue with Infinity capacity", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: Infinity });
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.isFull()).toBe(false);
    });

    it("should return false when not at capacity", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 5 });
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.isFull()).toBe(false);
    });

    it("should return true when at capacity", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.isFull()).toBe(true);
    });

    it("should return false after dequeue", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      expect(queue.isFull()).toBe(false);
    });

    it("should return true when capacity is 1 and element added", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 1 });
      queue.enqueue(1);
      expect(queue.isFull()).toBe(true);
    });

    it("should return false for new queue with finite capacity", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 5 });
      expect(queue.isFull()).toBe(false);
    });

    it("should return true after enqueue to full capacity", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      expect(queue.isFull()).toBe(false);
      queue.enqueue(2);
      expect(queue.isFull()).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear empty queue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.clear();
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should clear queue with elements", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.clear();
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should allow enqueue after clear", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.clear();
      queue.enqueue(2);
      expect(queue.size()).toBe(1);
    });

    it("should allow multiple clears", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.clear();
      queue.clear();
      queue.clear();
      expect(queue.size()).toBe(0);
    });

    it("should reset capacity limit", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 2 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      expect(queue.isFull()).toBe(false);
      queue.enqueue(1);
      expect(queue.isFull()).toBe(false);
    });
  });

  describe("toArray", () => {
    it("should return empty array for empty queue", () => {
      const queue = new DoubleBufferQueue<number>();
      expect(queue.toArray()).toEqual([]);
    });

    it("should return array with single element", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      expect(queue.toArray()).toEqual([1]);
    });

    it("should return array with multiple elements", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it("should not modify queue when calling toArray", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.toArray();
      expect(queue.size()).toBe(2);
    });

    it("should return correct array after dequeue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      expect(queue.toArray()).toEqual([2, 3]);
    });

    it("should return correct array after buffer swap", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(5);
      expect(queue.toArray()).toEqual([3, 4, 5]);
    });

    it("should return array of strings", () => {
      const queue = new DoubleBufferQueue<string>();
      queue.enqueue("a");
      queue.enqueue("b");
      expect(queue.toArray()).toEqual(["a", "b"]);
    });

    it("should return array of objects", () => {
      const queue = new DoubleBufferQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should return empty array after clear", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.clear();
      expect(queue.toArray()).toEqual([]);
    });

    it("should return array after multiple enqueue/dequeue operations", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.dequeue();
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeue();
      expect(queue.toArray()).toEqual([3, 4]);
    });
  });

  describe("forEach", () => {
    it("should not call callback for empty queue", () => {
      const queue = new DoubleBufferQueue<number>();
      let called = false;
      queue.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });

    it("should call callback once for single element", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      const values: number[] = [];
      queue.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([1]);
    });

    it("should call callback for each element", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const values: number[] = [];
      queue.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([1, 2, 3]);
    });

    it("should pass correct index to callback", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const indices: number[] = [];
      queue.forEach((_, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it("should not modify queue during forEach", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.forEach(() => {});
      expect(queue.size()).toBe(2);
    });

    it("should work after dequeue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      const values: number[] = [];
      queue.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([2, 3]);
    });

    it("should work after buffer swap", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(5);
      const values: number[] = [];
      queue.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([3, 4, 5]);
    });

    it("should work with strings", () => {
      const queue = new DoubleBufferQueue<string>();
      queue.enqueue("a");
      queue.enqueue("b");
      const values: string[] = [];
      queue.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual(["a", "b"]);
    });

    it("should work with objects", () => {
      const queue = new DoubleBufferQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      const values: { id: number }[] = [];
      queue.forEach((value) => {
        values.push(value);
      });
      expect(values).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe("front", () => {
    it("should return undefined for empty queue", () => {
      const queue = new DoubleBufferQueue<number>();
      expect(queue.front()).toBe(undefined);
    });

    it("should return first element", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.front()).toBe(1);
    });

    it("should return first element without removing it", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.front()).toBe(1);
      expect(queue.size()).toBe(2);
    });

    it("should return first element after dequeue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      expect(queue.front()).toBe(2);
    });

    it("should work after buffer swap", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(5);
      expect(queue.front()).toBe(3);
    });

    it("should work with strings", () => {
      const queue = new DoubleBufferQueue<string>();
      queue.enqueue("first");
      expect(queue.front()).toBe("first");
    });
  });

  describe("back", () => {
    it("should return undefined for empty queue", () => {
      const queue = new DoubleBufferQueue<number>();
      expect(queue.back()).toBe(undefined);
    });

    it("should return last element", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.back()).toBe(3);
    });

    it("should return last element without removing it", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      expect(queue.back()).toBe(2);
      expect(queue.size()).toBe(2);
    });

    it("should return last element after enqueue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.back()).toBe(3);
    });

    it("should update after enqueue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      expect(queue.back()).toBe(1);
      queue.enqueue(2);
      expect(queue.back()).toBe(2);
    });

    it("should return correct element after dequeue", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      expect(queue.back()).toBe(3);
    });

    it("should work after buffer swap", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(5);
      expect(queue.back()).toBe(5);
    });

    it("should return single element when only one exists", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      expect(queue.back()).toBe(1);
      expect(queue.front()).toBe(1);
    });

    it("should work with strings", () => {
      const queue = new DoubleBufferQueue<string>();
      queue.enqueue("a");
      queue.enqueue("b");
      expect(queue.back()).toBe("b");
    });

    it("should work with objects", () => {
      const queue = new DoubleBufferQueue<{ id: number }>();
      queue.enqueue({ id: 1 });
      queue.enqueue({ id: 2 });
      expect(queue.back()).toEqual({ id: 2 });
    });
  });

  describe("buffer swapping behavior", () => {
    it("should swap buffers when front buffer is empty", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(5);
      queue.enqueue(6);
      expect(queue.toArray()).toEqual([3, 4, 5, 6]);
    });

    it("should maintain FIFO order after buffer swap", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.enqueue(4);
      queue.enqueue(5);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(4);
      expect(queue.dequeue()).toBe(5);
    });

    it("should handle multiple buffer swaps", () => {
      const queue = new DoubleBufferQueue<number>();
      for (let i = 0; i < 10; i++) {
        queue.enqueue(i);
      }
      for (let i = 0; i < 5; i++) {
        expect(queue.dequeue()).toBe(i);
      }
      for (let i = 10; i < 15; i++) {
        queue.enqueue(i);
      }
      for (let i = 5; i < 15; i++) {
        expect(queue.dequeue()).toBe(i);
      }
    });

    it("should swap only when front buffer is exhausted", () => {
      const queue = new DoubleBufferQueue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);
      queue.enqueue(5);
      queue.dequeue();
      queue.enqueue(6);
      expect(queue.peek()).toBe(2);
    });

    it("should maintain capacity after buffer swap", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 3 });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.dequeue();
      queue.enqueue(4);
      expect(queue.isFull()).toBe(true);
      expect(() => queue.enqueue(5)).toThrow("Queue is full");
    });
  });

  describe("edge cases", () => {
    it("should handle large number of enqueues", () => {
      const queue = new DoubleBufferQueue<number>();
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i);
      }
      expect(queue.size()).toBe(1000);
    });

    it("should handle alternating enqueue/dequeue", () => {
      const queue = new DoubleBufferQueue<number>();
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
        if (i % 2 === 1) {
          queue.dequeue();
        }
      }
      expect(queue.size()).toBe(50);
    });

    it("should handle capacity of 0", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 0 });
      expect(queue.isFull()).toBe(true);
      expect(() => queue.enqueue(1)).toThrow("Queue is full");
    });

    it("should handle very large capacity", () => {
      const queue = new DoubleBufferQueue<number>({ capacity: 1000000 });
      queue.enqueue(1);
      expect(queue.isFull()).toBe(false);
    });

    it("should maintain order after many operations", () => {
      const queue = new DoubleBufferQueue<number>();
      const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      elements.forEach((e) => queue.enqueue(e));
      queue.dequeue();
      queue.dequeue();
      queue.enqueue(11);
      queue.enqueue(12);
      expect(queue.toArray()).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it("should handle peek after many enqueues and dequeues", () => {
      const queue = new DoubleBufferQueue<number>();
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
      }
      for (let i = 0; i < 50; i++) {
        queue.dequeue();
      }
      expect(queue.peek()).toBe(50);
    });

    it("should handle back after many enqueues and dequeues", () => {
      const queue = new DoubleBufferQueue<number>();
      for (let i = 0; i < 100; i++) {
        queue.enqueue(i);
      }
      for (let i = 0; i < 50; i++) {
        queue.dequeue();
      }
      expect(queue.back()).toBe(99);
    });
  });
});
