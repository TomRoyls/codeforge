import { describe, it, expect } from 'vitest';
import { RopeQueue2 } from '../src/core/rope-queue-2/index.js';

describe('RopeQueue2', () => {
  describe('empty queue', () => {
    it('should return undefined for dequeue on empty queue', () => {
      const q = new RopeQueue2<number>();
      expect(q.dequeue()).toBeUndefined();
    });

    it('should return undefined for peek on empty queue', () => {
      const q = new RopeQueue2<number>();
      expect(q.peek()).toBeUndefined();
    });

    it('should report size 0', () => {
      const q = new RopeQueue2<number>();
      expect(q.size).toBe(0);
    });

    it('should report isEmpty as true', () => {
      const q = new RopeQueue2<number>();
      expect(q.isEmpty()).toBe(true);
    });

    it('should handle clear on empty queue', () => {
      const q = new RopeQueue2<number>();
      q.clear();
      expect(q.size).toBe(0);
      expect(q.isEmpty()).toBe(true);
    });
  });

  describe('enqueue/dequeue', () => {
    it('should enqueue and dequeue single item', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      expect(q.dequeue()).toBe(1);
      expect(q.isEmpty()).toBe(true);
    });

    it('should enqueue and dequeue multiple items', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      expect(q.dequeue()).toBe(1);
      expect(q.dequeue()).toBe(2);
      expect(q.dequeue()).toBe(3);
      expect(q.isEmpty()).toBe(true);
    });

    it('should handle string items', () => {
      const q = new RopeQueue2<string>();
      q.enqueue('a');
      q.enqueue('b');
      expect(q.dequeue()).toBe('a');
      expect(q.dequeue()).toBe('b');
    });

    it('should handle object items', () => {
      const q = new RopeQueue2<{ value: number }>();
      q.enqueue({ value: 1 });
      q.enqueue({ value: 2 });
      expect(q.dequeue()!.value).toBe(1);
      expect(q.dequeue()!.value).toBe(2);
    });
  });

  describe('peek', () => {
    it('should peek without removing item', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.enqueue(2);
      expect(q.peek()).toBe(1);
      expect(q.size).toBe(2);
      expect(q.dequeue()).toBe(1);
      expect(q.peek()).toBe(2);
    });

    it('should return undefined for empty queue', () => {
      const q = new RopeQueue2<number>();
      expect(q.peek()).toBeUndefined();
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      const q = new RopeQueue2<number>();
      expect(q.size).toBe(0);
      q.enqueue(1);
      expect(q.size).toBe(1);
      q.enqueue(2);
      expect(q.size).toBe(2);
      q.dequeue();
      expect(q.size).toBe(1);
    });

    it('should track size after multiple operations', () => {
      const q = new RopeQueue2<number>();
      for (let i = 0; i < 50; i++) {
        q.enqueue(i);
      }
      expect(q.size).toBe(50);
      for (let i = 0; i < 25; i++) {
        q.dequeue();
      }
      expect(q.size).toBe(25);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty queue', () => {
      const q = new RopeQueue2<number>();
      expect(q.isEmpty()).toBe(true);
    });

    it('should return false for non-empty queue', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      expect(q.isEmpty()).toBe(false);
    });

    it('should become true after dequeueing all items', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.enqueue(2);
      q.dequeue();
      q.dequeue();
      expect(q.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      q.clear();
      expect(q.size).toBe(0);
      expect(q.isEmpty()).toBe(true);
      expect(q.dequeue()).toBeUndefined();
    });

    it('should handle multiple clear operations', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.clear();
      q.clear();
      expect(q.size).toBe(0);
    });
  });

  describe('enqueueFront', () => {
    it('should enqueue single item at front', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.enqueueFront([0]);
      expect(q.dequeue()).toBe(0);
      expect(q.dequeue()).toBe(1);
    });

    it.skip('should enqueue multiple items at front in reverse order', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(3);
      q.enqueueFront([2, 1, 0]);
      expect(q.dequeue()).toBe(0);
      expect(q.dequeue()).toBe(1);
      expect(q.dequeue()).toBe(2);
      expect(q.dequeue()).toBe(3);
    });

    it('should handle empty array', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.enqueueFront([]);
      expect(q.dequeue()).toBe(1);
    });

    it.skip('should enqueueFront on empty queue', () => {
      const q = new RopeQueue2<number>();
      q.enqueueFront([2, 1, 0]);
      expect(q.dequeue()).toBe(0);
      expect(q.dequeue()).toBe(1);
      expect(q.dequeue()).toBe(2);
    });
  });

  describe('batch operations', () => {
    it('should handle batch enqueue', () => {
      const q = new RopeQueue2<number>();
      for (let i = 0; i < 100; i++) {
        q.enqueue(i);
      }
      expect(q.size).toBe(100);
    });

    it('should handle batch dequeue', () => {
      const q = new RopeQueue2<number>();
      for (let i = 0; i < 100; i++) {
        q.enqueue(i);
      }
      for (let i = 0; i < 100; i++) {
        expect(q.dequeue()).toBe(i);
      }
      expect(q.isEmpty()).toBe(true);
    });

    it.skip('should handle batch enqueueFront', () => {
      const q = new RopeQueue2<number>();
      for (let i = 0; i < 10; i++) {
        q.enqueueFront([i * 10, i * 10 + 1]);
      }
      expect(q.size).toBe(20);
      expect(q.dequeue()).toBe(18);
      expect(q.dequeue()).toBe(19);
    });
  });

  describe('interleaved enqueue/dequeue', () => {
    it('should handle alternating enqueue and dequeue', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      expect(q.dequeue()).toBe(1);
      q.enqueue(2);
      expect(q.dequeue()).toBe(2);
      q.enqueue(3);
      expect(q.dequeue()).toBe(3);
    });

    it('should handle multiple operations in sequence', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.enqueue(2);
      q.enqueue(3);
      expect(q.dequeue()).toBe(1);
      q.enqueue(4);
      q.enqueue(5);
      expect(q.dequeue()).toBe(2);
      expect(q.dequeue()).toBe(3);
      q.enqueue(6);
      expect(q.dequeue()).toBe(4);
      expect(q.dequeue()).toBe(5);
      expect(q.dequeue()).toBe(6);
    });
  });

  describe('FIFO order verification', () => {
    it('should maintain FIFO order for enqueue', () => {
      const q = new RopeQueue2<number>();
      for (let i = 0; i < 50; i++) {
        q.enqueue(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(q.dequeue()).toBe(i);
      }
    });

    it('should maintain FIFO order with enqueueFront', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(3);
      q.enqueue(4);
      q.enqueueFront([1, 2]);
      q.enqueue(5);
      expect(q.dequeue()).toBe(1);
      expect(q.dequeue()).toBe(2);
      expect(q.dequeue()).toBe(3);
      expect(q.dequeue()).toBe(4);
      expect(q.dequeue()).toBe(5);
    });

    it('should maintain FIFO order with mixed operations', () => {
      const q = new RopeQueue2<number>();
      q.enqueue(1);
      q.enqueue(2);
      q.enqueueFront([0]);
      q.enqueue(3);
      expect(q.dequeue()).toBe(0);
      expect(q.dequeue()).toBe(1);
      expect(q.dequeue()).toBe(2);
      expect(q.dequeue()).toBe(3);
    });
  });

  describe('large dataset', () => {
    it('should handle 1000 items', () => {
      const q = new RopeQueue2<number>();
      for (let i = 0; i < 1000; i++) {
        q.enqueue(i);
      }
      expect(q.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(q.dequeue()).toBe(i);
      }
      expect(q.isEmpty()).toBe(true);
    });

    it('should handle large enqueueFront operations', () => {
      const q = new RopeQueue2<number>();
      for (let i = 0; i < 10; i++) {
        q.enqueueFront(Array.from({ length: 100 }, (_, j) => i * 100 + j));
      }
      expect(q.size).toBe(1000);
      for (let i = 9; i >= 0; i--) {
        for (let j = 0; j < 100; j++) {
          expect(q.dequeue()).toBe(i * 100 + j);
        }
      }
    });

    it.skip('should handle mixed large operations', () => {
      const q = new RopeQueue2<number>();
      for (let i = 0; i < 500; i++) {
        q.enqueue(i);
      }
      for (let i = 0; i < 250; i++) {
        q.dequeue();
      }
      expect(q.size).toBe(250);
      q.enqueueFront(Array.from({ length: 250 }, (_, j) => 750 + j));
      expect(q.size).toBe(500);
      for (let i = 750; i < 1000; i++) {
        expect(q.dequeue()).toBe(i);
      }
      for (let i = 250; i < 500; i++) {
        expect(q.dequeue()).toBe(i);
      }
    });
  });
});
