import { describe, it, expect } from 'vitest';
import { ThrottleQueue2 } from '../src/core/throttle-queue-2/index.js';

describe('ThrottleQueue2', () => {
  it('should enqueue and dequeue items', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size).toBe(3);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should maintain FIFO order', async () => {
    const queue = new ThrottleQueue2<string>({ maxConcurrent: 1 });
    queue.enqueue('first');
    queue.enqueue('second');
    queue.enqueue('third');
    expect(queue.dequeue()).toBe('first');
    expect(queue.dequeue()).toBe('second');
    expect(queue.dequeue()).toBe('third');
  });

  it('should return correct size', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    expect(queue.size).toBe(0);
    queue.enqueue(1);
    expect(queue.size).toBe(1);
    queue.enqueue(2);
    expect(queue.size).toBe(2);
    queue.dequeue();
    expect(queue.size).toBe(1);
  });

  it('should check if empty', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
    queue.dequeue();
    expect(queue.isEmpty()).toBe(true);
  });

  it('should clear the queue', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size).toBe(3);
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should enforce maxConcurrent limit', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 2, delayMs: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);

    const result1 = queue.processNext();
    const result2 = queue.processNext();
    const result3 = queue.processNext();

    expect(await result1).toBe(1);
    expect(await result2).toBe(2);
    expect(await result3).toBeUndefined();
  });

  it('should process with delay', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1, delayMs: 50 });
    queue.enqueue(1);
    queue.enqueue(2);

    const start = Date.now();
    const result1 = await queue.processNext();
    const result2 = await queue.processNext();
    const end = Date.now();

    expect(result1).toBe(1);
    expect(result2).toBe(2);
    expect(end - start).toBeGreaterThanOrEqual(100);
  });

  it('should handle enqueue after clear', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();
    expect(queue.size).toBe(0);
    queue.enqueue(3);
    expect(queue.size).toBe(1);
    expect(queue.dequeue()).toBe(3);
  });

  it('should handle dequeue from empty queue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    expect(queue.dequeue()).toBeUndefined();
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should handle mixed enqueue and dequeue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    queue.enqueue(1);
    expect(queue.dequeue()).toBe(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.dequeue()).toBe(2);
    expect(queue.size).toBe(1);
    expect(queue.dequeue()).toBe(3);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle many items', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    for (let i = 0; i < 100; i++) {
      queue.enqueue(i);
    }
    expect(queue.size).toBe(100);
    for (let i = 0; i < 100; i++) {
      expect(queue.dequeue()).toBe(i);
    }
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle string items', () => {
    const queue = new ThrottleQueue2<string>({ maxConcurrent: 1 });
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    expect(queue.dequeue()).toBe('a');
    expect(queue.dequeue()).toBe('b');
    expect(queue.dequeue()).toBe('c');
  });

  it('should handle object items', () => {
    const queue = new ThrottleQueue2<{ id: number }>({ maxConcurrent: 1 });
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    queue.enqueue(obj1);
    queue.enqueue(obj2);
    expect(queue.dequeue()).toBe(obj1);
    expect(queue.dequeue()).toBe(obj2);
  });

  it('should handle peek at front item', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    expect(queue.dequeue()).toBeUndefined();
    queue.enqueue(10);
    queue.enqueue(20);
    expect(queue.dequeue()).toBe(10);
    expect(queue.dequeue()).toBe(20);
  });

  it('should handle multiple clear cycles', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    queue.enqueue(1);
    queue.clear();
    queue.enqueue(2);
    queue.clear();
    queue.enqueue(3);
    expect(queue.size).toBe(1);
    expect(queue.dequeue()).toBe(3);
  });

  it('should process items sequentially with delay', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1, delayMs: 20 });
    queue.enqueue(1);
    queue.enqueue(2);

    const r1 = await queue.processNext();
    const r2 = await queue.processNext();
    expect(r1).toBe(1);
    expect(r2).toBe(2);
  });

  it('should respect maxConcurrent of 3', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 3 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);

    expect(await queue.processNext()).toBe(1);
    expect(await queue.processNext()).toBe(2);
    expect(await queue.processNext()).toBe(3);
    expect(await queue.processNext()).toBe(4);
    expect(await queue.processNext()).toBeUndefined();
  });

  it('should handle enqueue-dequeue-interleave pattern', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 5 });
    queue.enqueue(1);
    expect(queue.dequeue()).toBe(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.dequeue()).toBe(2);
    queue.enqueue(4);
    expect(queue.size).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBe(4);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should return undefined dequeue on empty', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 2 });
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should handle clear on already-empty queue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 2 });
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size).toBe(0);
  });

  it('should handle many items sequentially', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    for (let i = 0; i < 100; i++) {
      queue.enqueue(i);
    }
    for (let i = 0; i < 100; i++) {
      expect(queue.dequeue()).toBe(i);
    }
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle string items', () => {
    const queue = new ThrottleQueue2<string>({ maxConcurrent: 3 });
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    expect(queue.dequeue()).toBe('a');
    expect(queue.dequeue()).toBe('b');
  });

  it('should processNext returns undefined on empty', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    expect(await queue.processNext()).toBeUndefined();
  });

  it('should clear then processNext returns undefined', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();
    expect(await queue.processNext()).toBeUndefined();
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle interleaved processNext and enqueue', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 1 });
    queue.enqueue(1);
    expect(await queue.processNext()).toBe(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(await queue.processNext()).toBe(2);
    expect(queue.size).toBe(1);
    expect(await queue.processNext()).toBe(3);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle maxConcurrent limits processing', async () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 2, delayMs: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    const r1 = queue.processNext();
    const r2 = queue.processNext();
    const r3 = queue.processNext();
    expect(await r1).toBe(1);
    expect(await r2).toBe(2);
    expect(await r3).toBeUndefined();
  });

  it('should handle large maxConcurrent value', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 100 });
    for (let i = 0; i < 200; i++) {
      queue.enqueue(i);
    }
    expect(queue.size).toBe(200);
    for (let i = 0; i < 200; i++) {
      expect(queue.dequeue()).toBe(i);
    }
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle clear', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle enqueue then dequeue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(42);
    expect(queue.dequeue()).toBe(42);
    expect(queue.size).toBe(0);
  });

  it('should handle dequeue on empty queue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should maintain FIFO order', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(10);
    queue.enqueue(20);
    queue.enqueue(30);
    expect(queue.dequeue()).toBe(10);
    expect(queue.dequeue()).toBe(20);
    expect(queue.dequeue()).toBe(30);
  });

  it('should handle clear', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle isEmpty check', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
  });

  it('should handle enqueue and size', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    expect(queue.size).toBe(0);
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size).toBe(3);
  });

  it('should handle multiple enqueue and dequeue cycles', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.dequeue()).toBe(1);
    queue.enqueue(3);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle dequeue after clear', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(1);
    queue.clear();
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should handle large enqueue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 100 });
    for (let i = 0; i < 50; i++) queue.enqueue(i);
    expect(queue.size).toBe(50);
  });

  it('should handle clear', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    for (let i = 0; i < 5; i++) queue.enqueue(i);
    queue.clear();
    expect(queue.size).toBe(0);
  });

  it('should handle isEmpty', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
  });

  it('should handle size after enqueue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size).toBe(3);
  });

  it('should handle dequeue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.dequeue()).toBe(1);
    expect(queue.size).toBe(1);
  });

  it('should handle clear', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
  });
  it('should handle size after dequeue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 3, delayMs: 10 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.dequeue();
    expect(queue.isEmpty()).toBe(false);
  });
  it('should handle enqueue after clear', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 3 });
    queue.enqueue(1);
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(2);
    expect(queue.size).toBe(1);
  });
  it('should handle dequeue on empty queue', () => {
    const queue = new ThrottleQueue2<number>({ maxConcurrent: 3 });
    expect(queue.dequeue()).toBeUndefined();
  });
});
