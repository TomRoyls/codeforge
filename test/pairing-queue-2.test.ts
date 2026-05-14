import { describe, it, expect } from 'vitest';
import { PairingQueue2 } from '../src/core/pairing-queue-2/index';

describe('PairingQueue2', () => {
  describe('constructor', () => {
    it('should create empty queue with default comparator', async () => {
      const queue = new PairingQueue2<number>();
      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should create empty queue with custom comparator', async () => {
      const queue = new PairingQueue2<number>((a, b) => b - a);
      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('enqueue', () => {
    it('should add single element', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      expect(queue.size).toBe(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it('should add multiple elements', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      queue.enqueue(3);
      queue.enqueue(7);
      expect(queue.size).toBe(3);
    });

    it('should add elements in any order', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(10);
      queue.enqueue(1);
      queue.enqueue(5);
      queue.enqueue(8);
      expect(queue.size).toBe(4);
    });
  });

  describe('dequeue', () => {
    it('should return undefined from empty queue', async () => {
      const queue = new PairingQueue2<number>();
      const result = queue.dequeue();
      expect(result).toBeUndefined();
    });

    it('should remove and return single element', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      const result = queue.dequeue();
      expect(result).toBe(5);
      expect(queue.size).toBe(0);
    });

    it('should return elements in priority order (min)', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      queue.enqueue(3);
      queue.enqueue(7);
      queue.enqueue(1);

      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(5);
      expect(queue.dequeue()).toBe(7);
    });

    it('should handle sequential dequeue', async () => {
      const queue = new PairingQueue2<number>();
      const values = [5, 3, 7, 1, 9, 2];
      values.forEach(v => queue.enqueue(v));

      const sorted = [...values].sort((a, b) => a - b);
      for (const expected of sorted) {
        expect(queue.dequeue()).toBe(expected);
      }
      expect(queue.size).toBe(0);
    });

    it('should work with duplicate values', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(3);
      queue.enqueue(5);
      queue.enqueue(3);
      queue.enqueue(1);

      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(5);
    });
  });

  describe('peek', () => {
    it('should return undefined from empty queue', async () => {
      const queue = new PairingQueue2<number>();
      expect(queue.peek()).toBeUndefined();
    });

    it('should return highest priority without removing', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      queue.enqueue(3);
      queue.enqueue(7);

      expect(queue.peek()).toBe(3);
      expect(queue.peek()).toBe(3);
      expect(queue.size).toBe(3);
    });

    it('should update after dequeue', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      queue.enqueue(3);
      queue.enqueue(7);
      queue.enqueue(1);

      expect(queue.peek()).toBe(1);
      queue.dequeue();
      expect(queue.peek()).toBe(3);
      queue.dequeue();
      expect(queue.peek()).toBe(5);
    });
  });

  describe('merge', () => {
    it('should merge empty queue into non-empty', async () => {
      const queue1 = new PairingQueue2<number>();
      const queue2 = new PairingQueue2<number>();
      queue1.enqueue(5);
      queue1.enqueue(3);

      queue1.merge(queue2);

      expect(queue1.size).toBe(2);
      expect(queue2.size).toBe(0);
    });

    it('should merge non-empty queue into empty', async () => {
      const queue1 = new PairingQueue2<number>();
      const queue2 = new PairingQueue2<number>();
      queue2.enqueue(5);
      queue2.enqueue(3);

      queue1.merge(queue2);

      expect(queue1.size).toBe(2);
      expect(queue2.size).toBe(0);
    });

    it('should merge two non-empty queues', async () => {
      const queue1 = new PairingQueue2<number>();
      const queue2 = new PairingQueue2<number>();
      queue1.enqueue(5);
      queue1.enqueue(3);
      queue2.enqueue(7);
      queue2.enqueue(1);

      queue1.merge(queue2);

      expect(queue1.size).toBe(4);
      expect(queue2.size).toBe(0);
      expect(queue1.dequeue()).toBe(1);
      expect(queue1.dequeue()).toBe(3);
      expect(queue1.dequeue()).toBe(5);
      expect(queue1.dequeue()).toBe(7);
    });

    it('should handle merge with itself', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      queue.enqueue(3);

      queue.merge(queue);

      expect(queue.size).toBe(2);
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly', async () => {
      const queue = new PairingQueue2<number>();
      expect(queue.size).toBe(0);

      queue.enqueue(1);
      expect(queue.size).toBe(1);

      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);

      queue.dequeue();
      expect(queue.size).toBe(2);

      queue.dequeue();
      queue.dequeue();
      expect(queue.size).toBe(0);
    });

    it('should check isEmpty correctly', async () => {
      const queue = new PairingQueue2<number>();
      expect(queue.isEmpty()).toBe(true);

      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);

      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      queue.clear();

      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.dequeue()).toBeUndefined();
    });

    it('should handle clear on empty queue', async () => {
      const queue = new PairingQueue2<number>();
      queue.clear();

      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty queue', async () => {
      const queue = new PairingQueue2<number>();
      expect(queue.toArray()).toEqual([]);
    });

    it('should return elements in priority order', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      queue.enqueue(3);
      queue.enqueue(7);
      queue.enqueue(1);

      const result = queue.toArray();
      expect(result).toEqual([1, 3, 5, 7]);
      expect(queue.size).toBe(4);
    });

    it('should not modify original queue', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      queue.enqueue(3);

      const result = queue.toArray();
      expect(result).toEqual([3, 5]);
      expect(queue.size).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(5);
    });
  });

  describe('fromArray', () => {
    it('should create queue from empty array', async () => {
      const queue = PairingQueue2.fromArray<number>([]);
      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it('should create queue from single element', async () => {
      const queue = PairingQueue2.fromArray<number>([5]);
      expect(queue.size).toBe(1);
      expect(queue.dequeue()).toBe(5);
    });

    it('should create queue from multiple elements', async () => {
      const queue = PairingQueue2.fromArray<number>([5, 3, 7, 1]);
      expect(queue.size).toBe(4);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(5);
      expect(queue.dequeue()).toBe(7);
    });

    it('should use provided comparator', async () => {
      const queue = PairingQueue2.fromArray<number>([5, 3, 7, 1], (a, b) => b - a);
      expect(queue.dequeue()).toBe(7);
      expect(queue.dequeue()).toBe(5);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(-5);
      queue.enqueue(-3);
      queue.enqueue(-7);
      queue.enqueue(-1);

      expect(queue.dequeue()).toBe(-7);
      expect(queue.dequeue()).toBe(-5);
      expect(queue.dequeue()).toBe(-3);
      expect(queue.dequeue()).toBe(-1);
    });

    it('should handle mixed positive and negative', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(5);
      queue.enqueue(-3);
      queue.enqueue(7);
      queue.enqueue(-1);

      expect(queue.dequeue()).toBe(-3);
      expect(queue.dequeue()).toBe(-1);
      expect(queue.dequeue()).toBe(5);
      expect(queue.dequeue()).toBe(7);
    });

    it('should handle zero', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(0);
      queue.enqueue(5);
      queue.enqueue(-5);
      queue.enqueue(0);

      expect(queue.dequeue()).toBe(-5);
      expect(queue.dequeue()).toBe(0);
      expect(queue.dequeue()).toBe(0);
      expect(queue.dequeue()).toBe(5);
    });

    it('should handle single element queue after operations', async () => {
      const queue = new PairingQueue2<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      queue.dequeue();
      queue.dequeue();

      expect(queue.size).toBe(1);
      expect(queue.dequeue()).toBe(3);
    });
  });

  describe('large datasets', () => {
    it('should handle large number of elements', async () => {
      const queue = new PairingQueue2<number>();
      const size = 1000;

      for (let i = 0; i < size; i++) {
        queue.enqueue(Math.floor(Math.random() * 1000));
      }

      expect(queue.size).toBe(size);

      let prev = -Infinity;
      let count = 0;
      while (!queue.isEmpty()) {
        const current = queue.dequeue()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
        count++;
      }

      expect(count).toBe(size);
    });

    it('should handle sorted input', async () => {
      const queue = new PairingQueue2<number>();
      const size = 100;

      for (let i = 0; i < size; i++) {
        queue.enqueue(i);
      }

      for (let i = 0; i < size; i++) {
        expect(queue.dequeue()).toBe(i);
      }
    });

    it('should handle reverse sorted input', async () => {
      const queue = new PairingQueue2<number>();
      const size = 100;

      for (let i = size - 1; i >= 0; i--) {
        queue.enqueue(i);
      }

      for (let i = 0; i < size; i++) {
        expect(queue.dequeue()).toBe(i);
      }
    });

    it('should handle large merges', async () => {
      const queue1 = new PairingQueue2<number>();
      const queue2 = new PairingQueue2<number>();

      for (let i = 0; i < 500; i++) {
        queue1.enqueue(Math.floor(Math.random() * 1000));
      }

      for (let i = 0; i < 500; i++) {
        queue2.enqueue(Math.floor(Math.random() * 1000));
      }

      queue1.merge(queue2);

      expect(queue1.size).toBe(1000);

      let prev = -Infinity;
      while (!queue1.isEmpty()) {
        const current = queue1.dequeue()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });
  });

  describe('custom comparator', () => {
    it('should work with max-heap comparator', async () => {
      const queue = new PairingQueue2<number>((a, b) => b - a);
      queue.enqueue(5);
      queue.enqueue(3);
      queue.enqueue(7);
      queue.enqueue(1);

      expect(queue.dequeue()).toBe(7);
      expect(queue.dequeue()).toBe(5);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBe(1);
    });

    it('should work with string comparator', async () => {
      const queue = new PairingQueue2<string>();
      queue.enqueue('banana');
      queue.enqueue('apple');
      queue.enqueue('cherry');
      queue.enqueue('date');

      expect(queue.dequeue()).toBe('apple');
      expect(queue.dequeue()).toBe('banana');
      expect(queue.dequeue()).toBe('cherry');
      expect(queue.dequeue()).toBe('date');
    });

    it('should work with object comparator', async () => {
      interface Item {
        id: number;
        value: string;
      }

      const queue = new PairingQueue2<Item>((a, b) => a.id - b.id);
      queue.enqueue({ id: 3, value: 'three' });
      queue.enqueue({ id: 1, value: 'one' });
      queue.enqueue({ id: 2, value: 'two' });

      expect(queue.dequeue()!.value).toBe('one');
      expect(queue.dequeue()!.value).toBe('two');
      expect(queue.dequeue()!.value).toBe('three');
    });
  });
});
