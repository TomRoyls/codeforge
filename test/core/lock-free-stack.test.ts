import { describe, it, expect } from "vitest";
import { LockFreeStack } from "../../src/core/lock-free-stack/lock-free-stack.js";
import {
  DEFAULT_LOCK_FREE_STACK_OPTIONS,
} from "../../src/core/lock-free-stack/types.js";
import type {
  LockFreeStackOptions,
  LockFreeStackStatistics,
  StackNode,
} from "../../src/core/lock-free-stack/types.js";

describe("LockFreeStack", () => {
  describe("construction", () => {
    it("should create an empty stack with default options", () => {
      const stack = new LockFreeStack<number>();
      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });

    it("should create a stack with custom maxRetries", () => {
      const stack = new LockFreeStack<number>({ maxRetries: 50 });
      expect(stack.size).toBe(0);
    });

    it("should create a stack with empty options", () => {
      const stack = new LockFreeStack<number>({});
      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });

    it("should use DEFAULT_LOCK_FREE_STACK_OPTIONS", () => {
      expect(DEFAULT_LOCK_FREE_STACK_OPTIONS.maxRetries).toBe(100);
    });

    it("should have correct default maxRetries value", () => {
      expect(DEFAULT_LOCK_FREE_STACK_OPTIONS.maxRetries).toBeTypeOf("number");
    });
  });

  describe("push", () => {
    it("should push a single value", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      expect(stack.size).toBe(1);
      expect(stack.isEmpty()).toBe(false);
    });

    it("should push multiple values", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.size).toBe(3);
    });

    it("should update top on each push", () => {
      const stack = new LockFreeStack<number>();
      stack.push(10);
      expect(stack.peek()).toBe(10);
      stack.push(20);
      expect(stack.peek()).toBe(20);
      stack.push(30);
      expect(stack.peek()).toBe(30);
    });

    it("should push strings", () => {
      const stack = new LockFreeStack<string>();
      stack.push("hello");
      stack.push("world");
      expect(stack.size).toBe(2);
      expect(stack.peek()).toBe("world");
    });

    it("should push objects", () => {
      const stack = new LockFreeStack<{ id: number }>();
      stack.push({ id: 1 });
      stack.push({ id: 2 });
      expect(stack.size).toBe(2);
      expect(stack.peek()?.id).toBe(2);
    });

    it("should push null values", () => {
      const stack = new LockFreeStack<null>();
      stack.push(null);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBeNull();
    });

    it("should push undefined values", () => {
      const stack = new LockFreeStack<undefined>();
      stack.push(undefined);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBeUndefined();
    });

    it("should push zero", () => {
      const stack = new LockFreeStack<number>();
      stack.push(0);
      expect(stack.peek()).toBe(0);
    });

    it("should push false", () => {
      const stack = new LockFreeStack<boolean>();
      stack.push(false);
      expect(stack.peek()).toBe(false);
    });

    it("should push empty string", () => {
      const stack = new LockFreeStack<string>();
      stack.push("");
      expect(stack.peek()).toBe("");
    });
  });

  describe("pop", () => {
    it("should return undefined when popping an empty stack", () => {
      const stack = new LockFreeStack<number>();
      expect(stack.pop()).toBeUndefined();
    });

    it("should pop the last pushed value (LIFO)", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
    });

    it("should decrement size on pop", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      expect(stack.size).toBe(2);
      stack.pop();
      expect(stack.size).toBe(1);
      stack.pop();
      expect(stack.size).toBe(0);
    });

    it("should set isEmpty to true after popping all elements", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      expect(stack.isEmpty()).toBe(false);
      stack.pop();
      expect(stack.isEmpty()).toBe(true);
    });

    it("should return undefined when popping an already empty stack", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.pop();
      expect(stack.pop()).toBeUndefined();
    });

    it("should maintain LIFO order for mixed types", () => {
      const stack = new LockFreeStack<string>();
      stack.push("a");
      stack.push("b");
      stack.push("c");
      expect(stack.pop()).toBe("c");
      expect(stack.pop()).toBe("b");
      expect(stack.pop()).toBe("a");
      expect(stack.pop()).toBeUndefined();
    });

    it("should pop objects correctly", () => {
      const stack = new LockFreeStack<{ x: number }>();
      const obj1 = { x: 1 };
      const obj2 = { x: 2 };
      stack.push(obj1);
      stack.push(obj2);
      expect(stack.pop()).toBe(obj2);
      expect(stack.pop()).toBe(obj1);
    });
  });

  describe("peek", () => {
    it("should return undefined for empty stack", () => {
      const stack = new LockFreeStack<number>();
      expect(stack.peek()).toBeUndefined();
    });

    it("should return the top element without removing it", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      expect(stack.peek()).toBe(2);
      expect(stack.size).toBe(2);
    });

    it("should not modify the stack", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.peek();
      expect(stack.size).toBe(2);
      expect(stack.pop()).toBe(2);
    });

    it("should return the same element on consecutive peeks", () => {
      const stack = new LockFreeStack<number>();
      stack.push(42);
      expect(stack.peek()).toBe(42);
      expect(stack.peek()).toBe(42);
      expect(stack.peek()).toBe(42);
    });

    it("should reflect changes after pop", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      stack.pop();
      expect(stack.peek()).toBe(2);
    });
  });

  describe("size and isEmpty", () => {
    it("should track size correctly through pushes and pops", () => {
      const stack = new LockFreeStack<number>();
      expect(stack.size).toBe(0);
      stack.push(1);
      expect(stack.size).toBe(1);
      stack.push(2);
      expect(stack.size).toBe(2);
      stack.pop();
      expect(stack.size).toBe(1);
      stack.push(3);
      expect(stack.size).toBe(2);
    });

    it("should report isEmpty correctly", () => {
      const stack = new LockFreeStack<number>();
      expect(stack.isEmpty()).toBe(true);
      stack.push(1);
      expect(stack.isEmpty()).toBe(false);
      stack.pop();
      expect(stack.isEmpty()).toBe(true);
    });

    it("should not go below zero size", () => {
      const stack = new LockFreeStack<number>();
      stack.pop();
      expect(stack.size).toBe(0);
    });
  });

  describe("clear", () => {
    it("should clear an empty stack without error", () => {
      const stack = new LockFreeStack<number>();
      stack.clear();
      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });

    it("should clear a stack with elements", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      stack.clear();
      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);
      expect(stack.peek()).toBeUndefined();
    });

    it("should allow push after clear", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.clear();
      stack.push(2);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBe(2);
    });

    it("should allow pop after clear returning undefined", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.clear();
      expect(stack.pop()).toBeUndefined();
    });
  });

  describe("toArray", () => {
    it("should return empty array for empty stack", () => {
      const stack = new LockFreeStack<number>();
      expect(stack.toArray()).toEqual([]);
    });

    it("should return values from top to bottom", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.toArray()).toEqual([3, 2, 1]);
    });

    it("should return a copy that does not affect the stack", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      const arr = stack.toArray();
      arr.push(99);
      expect(stack.size).toBe(2);
      expect(stack.toArray()).toEqual([2, 1]);
    });

    it("should reflect current state after modifications", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      stack.pop();
      expect(stack.toArray()).toEqual([2, 1]);
    });

    it("should return array in correct order for strings", () => {
      const stack = new LockFreeStack<string>();
      stack.push("a");
      stack.push("b");
      stack.push("c");
      expect(stack.toArray()).toEqual(["c", "b", "a"]);
    });
  });

  describe("forEach", () => {
    it("should not call callback for empty stack", () => {
      const stack = new LockFreeStack<number>();
      let callCount = 0;
      stack.forEach(() => { callCount++; });
      expect(callCount).toBe(0);
    });

    it("should iterate from top to bottom", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      const values: number[] = [];
      stack.forEach((v) => values.push(v));
      expect(values).toEqual([3, 2, 1]);
    });

    it("should provide correct indices", () => {
      const stack = new LockFreeStack<number>();
      stack.push(10);
      stack.push(20);
      stack.push(30);
      const indices: number[] = [];
      stack.forEach((_, i) => indices.push(i));
      expect(indices).toEqual([0, 1, 2]);
    });

    it("should provide both value and index", () => {
      const stack = new LockFreeStack<string>();
      stack.push("a");
      stack.push("b");
      const results: [string, number][] = [];
      stack.forEach((v, i) => results.push([v, i]));
      expect(results).toEqual([["b", 0], ["a", 1]]);
    });

    it("should iterate over all elements", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      stack.push(4);
      stack.push(5);
      let count = 0;
      stack.forEach(() => count++);
      expect(count).toBe(5);
    });
  });

  describe("Symbol.iterator", () => {
    it("should return empty iterator for empty stack", () => {
      const stack = new LockFreeStack<number>();
      const result = [...stack];
      expect(result).toEqual([]);
    });

    it("should iterate from top to bottom", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect([...stack]).toEqual([3, 2, 1]);
    });

    it("should work with for...of", () => {
      const stack = new LockFreeStack<number>();
      stack.push(10);
      stack.push(20);
      const values: number[] = [];
      for (const v of stack) {
        values.push(v);
      }
      expect(values).toEqual([20, 10]);
    });

    it("should work with Array.from", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      expect(Array.from(stack)).toEqual([2, 1]);
    });

    it("should work with spread in destructuring", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      const [first, second, third] = stack;
      expect(first).toBe(3);
      expect(second).toBe(2);
      expect(third).toBe(1);
    });
  });

  describe("contains", () => {
    it("should return false for empty stack", () => {
      const stack = new LockFreeStack<number>();
      expect(stack.contains(1)).toBe(false);
    });

    it("should return true if value is in stack", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.contains(2)).toBe(true);
    });

    it("should return false if value is not in stack", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      expect(stack.contains(99)).toBe(false);
    });

    it("should find the top element", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      expect(stack.contains(2)).toBe(true);
    });

    it("should find the bottom element", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      expect(stack.contains(1)).toBe(true);
    });

    it("should find strings by value equality", () => {
      const stack = new LockFreeStack<string>();
      stack.push("hello");
      stack.push("world");
      expect(stack.contains("hello")).toBe(true);
      expect(stack.contains("world")).toBe(true);
      expect(stack.contains("missing")).toBe(false);
    });

    it("should not find values after they are popped", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.pop();
      expect(stack.contains(2)).toBe(false);
      expect(stack.contains(1)).toBe(true);
    });

    it("should find null", () => {
      const stack = new LockFreeStack<null>();
      stack.push(null);
      expect(stack.contains(null)).toBe(true);
    });

    it("should find undefined", () => {
      const stack = new LockFreeStack<undefined>();
      stack.push(undefined);
      expect(stack.contains(undefined)).toBe(true);
    });

    it("should find zero", () => {
      const stack = new LockFreeStack<number>();
      stack.push(0);
      expect(stack.contains(0)).toBe(true);
    });

    it("should find false", () => {
      const stack = new LockFreeStack<boolean>();
      stack.push(false);
      expect(stack.contains(false)).toBe(true);
    });
  });

  describe("clone", () => {
    it("should clone an empty stack", () => {
      const stack = new LockFreeStack<number>();
      const cloned = stack.clone();
      expect(cloned.size).toBe(0);
      expect(cloned.isEmpty()).toBe(true);
    });

    it("should clone a stack with elements", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      const cloned = stack.clone();
      expect(cloned.toArray()).toEqual([3, 2, 1]);
    });

    it("should produce an independent copy", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      const cloned = stack.clone();
      cloned.pop();
      expect(stack.size).toBe(2);
      expect(cloned.size).toBe(1);
    });

    it("should not affect original when pushing to clone", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      const cloned = stack.clone();
      cloned.push(2);
      expect(stack.size).toBe(1);
      expect(cloned.size).toBe(2);
    });

    it("should preserve element order in clone", () => {
      const stack = new LockFreeStack<string>();
      stack.push("a");
      stack.push("b");
      stack.push("c");
      const cloned = stack.clone();
      expect([...cloned]).toEqual([...stack]);
    });

    it("should reset statistics in clone", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      const cloned = stack.clone();
      expect(cloned.getStatistics().pushes).toBe(0);
      expect(cloned.getStatistics().totalOperations).toBe(0);
    });

    it("should preserve maxRetries option in clone", () => {
      const stack = new LockFreeStack<number>({ maxRetries: 42 });
      stack.push(1);
      const cloned = stack.clone();
      cloned.push(2);
      expect(cloned.size).toBe(2);
    });
  });

  describe("statistics", () => {
    it("should start with zero statistics", () => {
      const stack = new LockFreeStack<number>();
      const stats = stack.getStatistics();
      expect(stats.pushes).toBe(0);
      expect(stats.pops).toBe(0);
      expect(stats.contentionRetries).toBe(0);
      expect(stats.totalOperations).toBe(0);
    });

    it("should track push count", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.getStatistics().pushes).toBe(3);
    });

    it("should track pop count", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.pop();
      stack.pop();
      expect(stack.getStatistics().pops).toBe(2);
    });

    it("should track totalOperations", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.pop();
      expect(stack.getStatistics().totalOperations).toBe(3);
    });

    it("should track totalOperations with empty pop", () => {
      const stack = new LockFreeStack<number>();
      stack.pop();
      expect(stack.getStatistics().totalOperations).toBe(0);
      expect(stack.getStatistics().pops).toBe(0);
    });

    it("should reset statistics", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.pop();
      stack.resetStatistics();
      const stats = stack.getStatistics();
      expect(stats.pushes).toBe(0);
      expect(stats.pops).toBe(0);
      expect(stats.contentionRetries).toBe(0);
      expect(stats.totalOperations).toBe(0);
    });

    it("should preserve stack state after resetStatistics", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.resetStatistics();
      expect(stack.size).toBe(2);
      expect(stack.peek()).toBe(2);
    });

    it("should track contentionRetries from simulateContention", () => {
      const stack = new LockFreeStack<number>();
      stack.simulateContention(5);
      expect(stack.getStatistics().contentionRetries).toBe(5);
    });

    it("should accumulate simulateContention calls", () => {
      const stack = new LockFreeStack<number>();
      stack.simulateContention(3);
      stack.simulateContention(7);
      expect(stack.getStatistics().contentionRetries).toBe(10);
    });

    it("should return a snapshot from getStatistics", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      const stats1 = stack.getStatistics();
      stack.push(2);
      expect(stats1.pushes).toBe(1);
      expect(stack.getStatistics().pushes).toBe(2);
    });

    it("should reset contentionRetries on resetStatistics", () => {
      const stack = new LockFreeStack<number>();
      stack.simulateContention(10);
      stack.resetStatistics();
      expect(stack.getStatistics().contentionRetries).toBe(0);
    });
  });

  describe("simulateContention", () => {
    it("should increment contentionRetries by 1 by default", () => {
      const stack = new LockFreeStack<number>();
      stack.simulateContention();
      expect(stack.getStatistics().contentionRetries).toBe(1);
    });

    it("should increment by specified amount", () => {
      const stack = new LockFreeStack<number>();
      stack.simulateContention(42);
      expect(stack.getStatistics().contentionRetries).toBe(42);
    });

    it("should not affect push count", () => {
      const stack = new LockFreeStack<number>();
      stack.simulateContention(5);
      expect(stack.getStatistics().pushes).toBe(0);
    });

    it("should not affect pop count", () => {
      const stack = new LockFreeStack<number>();
      stack.simulateContention(5);
      expect(stack.getStatistics().pops).toBe(0);
    });

    it("should not affect totalOperations", () => {
      const stack = new LockFreeStack<number>();
      stack.simulateContention(5);
      expect(stack.getStatistics().totalOperations).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle single element push and pop", () => {
      const stack = new LockFreeStack<number>();
      stack.push(42);
      expect(stack.pop()).toBe(42);
      expect(stack.isEmpty()).toBe(true);
    });

    it("should handle single element peek", () => {
      const stack = new LockFreeStack<number>();
      stack.push(42);
      expect(stack.peek()).toBe(42);
      expect(stack.size).toBe(1);
    });

    it("should handle large stacks (200+ elements)", () => {
      const stack = new LockFreeStack<number>();
      for (let i = 0; i < 250; i++) {
        stack.push(i);
      }
      expect(stack.size).toBe(250);
      expect(stack.peek()).toBe(249);
      expect(stack.pop()).toBe(249);
      expect(stack.toArray()[0]).toBe(248);
    });

    it("should handle large stack pop all elements", () => {
      const stack = new LockFreeStack<number>();
      for (let i = 0; i < 200; i++) {
        stack.push(i);
      }
      for (let i = 199; i >= 0; i--) {
        expect(stack.pop()).toBe(i);
      }
      expect(stack.isEmpty()).toBe(true);
    });

    it("should handle push after pop to empty", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.pop();
      stack.push(2);
      expect(stack.peek()).toBe(2);
      expect(stack.size).toBe(1);
    });

    it("should handle multiple clears", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.clear();
      stack.clear();
      stack.clear();
      expect(stack.size).toBe(0);
    });

    it("should handle popping empty stack multiple times", () => {
      const stack = new LockFreeStack<number>();
      expect(stack.pop()).toBeUndefined();
      expect(stack.pop()).toBeUndefined();
      expect(stack.pop()).toBeUndefined();
      expect(stack.size).toBe(0);
    });
  });

  describe("interleaved push/pop", () => {
    it("should handle push-pop-push pattern", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.pop();
      stack.push(2);
      expect(stack.peek()).toBe(2);
      expect(stack.size).toBe(1);
    });

    it("should handle alternating push and pop", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      expect(stack.pop()).toBe(1);
      stack.push(2);
      expect(stack.pop()).toBe(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.isEmpty()).toBe(true);
    });

    it("should handle push-push-pop-push-pop", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.pop();
      stack.push(3);
      stack.pop();
      expect(stack.peek()).toBe(1);
      expect(stack.size).toBe(1);
    });

    it("should handle complex interleaved operations", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);
      stack.push(4);
      expect(stack.pop()).toBe(4);
      expect(stack.pop()).toBe(2);
      stack.push(5);
      stack.push(6);
      expect(stack.toArray()).toEqual([6, 5, 1]);
    });

    it("should maintain correct size through interleaved operations", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      expect(stack.size).toBe(1);
      stack.push(2);
      expect(stack.size).toBe(2);
      stack.pop();
      expect(stack.size).toBe(1);
      stack.push(3);
      expect(stack.size).toBe(2);
      stack.pop();
      stack.pop();
      expect(stack.size).toBe(0);
    });
  });

  describe("stress tests", () => {
    it("should handle rapid push/pop cycles", () => {
      const stack = new LockFreeStack<number>();
      for (let cycle = 0; cycle < 100; cycle++) {
        stack.push(cycle);
        expect(stack.pop()).toBe(cycle);
      }
      expect(stack.isEmpty()).toBe(true);
    });

    it("should handle rapid push-pop with accumulation", () => {
      const stack = new LockFreeStack<number>();
      for (let i = 0; i < 50; i++) {
        stack.push(i);
      }
      for (let i = 0; i < 25; i++) {
        stack.pop();
      }
      expect(stack.size).toBe(25);
      expect(stack.peek()).toBe(24);
    });

    it("should handle 500 pushes", () => {
      const stack = new LockFreeStack<number>();
      for (let i = 0; i < 500; i++) {
        stack.push(i);
      }
      expect(stack.size).toBe(500);
    });

    it("should handle 500 push-pop cycles", () => {
      const stack = new LockFreeStack<number>();
      for (let i = 0; i < 500; i++) {
        stack.push(i);
      }
      for (let i = 499; i >= 0; i--) {
        expect(stack.pop()).toBe(i);
      }
      expect(stack.isEmpty()).toBe(true);
    });

    it("should handle repeated push-pop-clear cycles", () => {
      const stack = new LockFreeStack<number>();
      for (let cycle = 0; cycle < 50; cycle++) {
        for (let i = 0; i < 10; i++) {
          stack.push(i);
        }
        for (let i = 9; i >= 0; i--) {
          expect(stack.pop()).toBe(i);
        }
      }
      expect(stack.isEmpty()).toBe(true);
    });

    it("should track statistics correctly through stress", () => {
      const stack = new LockFreeStack<number>();
      for (let i = 0; i < 100; i++) {
        stack.push(i);
      }
      for (let i = 0; i < 50; i++) {
        stack.pop();
      }
      const stats = stack.getStatistics();
      expect(stats.pushes).toBe(100);
      expect(stats.pops).toBe(50);
      expect(stats.totalOperations).toBe(150);
    });
  });

  describe("LIFO order verification", () => {
    it("should strictly follow LIFO for sequential operations", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      stack.push(4);
      stack.push(5);
      expect(stack.pop()).toBe(5);
      expect(stack.pop()).toBe(4);
      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
    });

    it("should follow LIFO after partial drain and refill", () => {
      const stack = new LockFreeStack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      stack.pop();
      stack.pop();
      stack.push(4);
      stack.push(5);
      expect(stack.pop()).toBe(5);
      expect(stack.pop()).toBe(4);
      expect(stack.pop()).toBe(1);
    });

    it("should follow LIFO with string values", () => {
      const stack = new LockFreeStack<string>();
      stack.push("first");
      stack.push("second");
      stack.push("third");
      expect(stack.pop()).toBe("third");
      expect(stack.pop()).toBe("second");
      expect(stack.pop()).toBe("first");
    });
  });

  describe("type exports", () => {
    it("should export LockFreeStackOptions type", () => {
      const options: LockFreeStackOptions = { maxRetries: 10 };
      expect(options.maxRetries).toBe(10);
    });

    it("should export LockFreeStackStatistics type", () => {
      const stats: LockFreeStackStatistics = {
        pushes: 1,
        pops: 0,
        contentionRetries: 0,
        totalOperations: 1,
      };
      expect(stats.pushes).toBe(1);
    });

    it("should export StackNode type", () => {
      const node: StackNode<number> = { value: 42, next: null };
      expect(node.value).toBe(42);
    });
  });
});
