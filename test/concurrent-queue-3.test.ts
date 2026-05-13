import { describe, it, expect } from 'vitest';
import { ConcurrentQueue3 } from '../src/core/concurrent-queue-3/index.js';

describe('ConcurrentQueue3', () => {
  it('should enqueue and dequeue items', async () => {
    const queue = new ConcurrentQueue3<number>();
    await queue.enqueue(1);
    await queue.enqueue(2);
    const item = await queue.dequeue();
    expect(item).toBe(1);
  });

  it('should maintain FIFO order', async () => {
    const queue = new ConcurrentQueue3<number>();
    await queue.enqueue(1);
    await queue.enqueue(2);
    await queue.enqueue(3);
    expect(await queue.dequeue()).toBe(1);
    expect(await queue.dequeue()).toBe(2);
    expect(await queue.dequeue()).toBe(3);
  });

  it('should track size correctly', async () => {
    const queue = new ConcurrentQueue3<number>();
    expect(queue.size).toBe(0);
    await queue.enqueue(1);
    expect(queue.size).toBe(1);
    await queue.enqueue(2);
    expect(queue.size).toBe(2);
    await queue.dequeue();
    expect(queue.size).toBe(1);
  });

  it('should return true when empty', async () => {
    const queue = new ConcurrentQueue3<number>();
    expect(queue.isEmpty()).toBe(true);
    await queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
    await queue.dequeue();
    expect(queue.isEmpty()).toBe(true);
  });

  it('should clear all items', async () => {
    const queue = new ConcurrentQueue3<number>();
    await queue.enqueue(1);
    await queue.enqueue(2);
    await queue.enqueue(3);
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should peek without removing', async () => {
    const queue = new ConcurrentQueue3<number>();
    await queue.enqueue(1);
    await queue.enqueue(2);
    expect(queue.peek()).toBe(1);
    expect(queue.size).toBe(2);
    expect(await queue.dequeue()).toBe(1);
  });

  it('should wait for item on empty dequeue', async () => {
    const queue = new ConcurrentQueue3<number>();
    let dequeuedValue: number | null = null;

    const dequeuePromise = queue.dequeue().then(value => {
      dequeuedValue = value;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(dequeuedValue).toBe(null);

    await queue.enqueue(42);
    await dequeuePromise;
    expect(dequeuedValue).toBe(42);
  });

  it('should handle concurrent operations', async () => {
    const queue = new ConcurrentQueue3<number>();
    const items: number[] = [];

    const enqueuePromises = [1, 2, 3, 4, 5].map(item => queue.enqueue(item));
    await Promise.all(enqueuePromises);

    const dequeuePromises = Array(5).fill(0).map(() => queue.dequeue().then(item => items.push(item)));
    await Promise.all(dequeuePromises);

    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it('should respect maxSize limit', async () => {
    const queue = new ConcurrentQueue3<number>(3);
    await queue.enqueue(1);
    await queue.enqueue(2);
    await queue.enqueue(3);
    expect(queue.size).toBe(3);
  });

  it('should block enqueue when at maxSize', async () => {
    const queue = new ConcurrentQueue3<number>(2);
    await queue.enqueue(1);
    await queue.enqueue(2);

    let enqueued = false;
    const enqueuePromise = queue.enqueue(3).then(() => {
      enqueued = true;
    });

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(enqueued).toBe(false);
    expect(queue.size).toBe(2);

    await queue.dequeue();
    await enqueuePromise;
    expect(enqueued).toBe(true);
    expect(queue.size).toBe(2);
  });

  it('should return undefined on empty peek', () => {
    const queue = new ConcurrentQueue3<number>();
    expect(queue.peek()).toBe(undefined);
  });
});
