import { describe, it, expect } from 'vitest';
import { ElasticQueue2 } from '../src/core/elastic-queue-2/index.js';

describe('ElasticQueue2', () => {
  it('should enqueue and dequeue in FIFO order', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
  });

  it('should return undefined when dequeuing empty queue', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should report correct size', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.size).toBe(0);
    queue.enqueue(1);
    expect(queue.size).toBe(1);
    queue.enqueue(2);
    expect(queue.size).toBe(2);
    queue.dequeue();
    expect(queue.size).toBe(1);
  });

  it('should peek at front item without removing', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.peek()).toBe(1);
    expect(queue.size).toBe(2);
    expect(queue.peek()).toBe(1);
  });

  it('should return undefined when peeking empty queue', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.peek()).toBeUndefined();
  });

  it('should return true for isEmpty on empty queue', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
  });

  it('should return true for isFull when at maxSize', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 2 });
    expect(queue.isFull()).toBe(false);
    queue.enqueue(1);
    expect(queue.isFull()).toBe(false);
    queue.enqueue(2);
    expect(queue.isFull()).toBe(true);
  });

  it('should return false for isFull when no maxSize set', () => {
    const queue = new ElasticQueue2<number>();
    for (let i = 0; i < 100; i++) {
      queue.enqueue(i);
    }
    expect(queue.isFull()).toBe(false);
  });

  it('should clear all items', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size).toBe(3);
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.peek()).toBeUndefined();
  });

  it('should return capacity when maxSize set', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 5 });
    expect(queue.capacity()).toBe(5);
  });

  it('should return undefined for capacity when no maxSize set', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.capacity()).toBeUndefined();
  });

  it('should throw when enqueueing beyond maxSize', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 2 });
    queue.enqueue(1);
    queue.enqueue(2);
    expect(() => queue.enqueue(3)).toThrow();
  });

  it('should allow unbounded growth when no maxSize', () => {
    const queue = new ElasticQueue2<number>();
    for (let i = 0; i < 1000; i++) {
      queue.enqueue(i);
    }
    expect(queue.size).toBe(1000);
  });

  it('should work with strings', () => {
    const queue = new ElasticQueue2<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    expect(queue.dequeue()).toBe('a');
    expect(queue.dequeue()).toBe('b');
    expect(queue.dequeue()).toBe('c');
  });

  it('should handle mixed operations', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 5 });
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.dequeue()).toBe(1);
    queue.enqueue(3);
    queue.enqueue(4);
    expect(queue.peek()).toBe(2);
    expect(queue.size).toBe(3);
    expect(queue.capacity()).toBe(5);
  });

  it('should enqueue after dequeue frees space', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 2 });
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.isFull()).toBe(true);
    queue.dequeue();
    expect(queue.isFull()).toBe(false);
    queue.enqueue(3);
    expect(queue.size).toBe(2);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
  });

  it('should handle clear then reuse', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 3 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();
    expect(queue.isFull()).toBe(false);
    queue.enqueue(10);
    expect(queue.peek()).toBe(10);
  });

  it('should handle objects', () => {
    const queue = new ElasticQueue2<{ id: number }>();
    const obj = { id: 42 };
    queue.enqueue(obj);
    expect(queue.dequeue()).toBe(obj);
  });

  it('should handle alternating enqueue dequeue', () => {
    const queue = new ElasticQueue2<number>();
    for (let i = 0; i < 50; i++) {
      queue.enqueue(i);
      expect(queue.dequeue()).toBe(i);
    }
    expect(queue.isEmpty()).toBe(true);
  });

  it('should report correct size after enqueue', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size).toBe(3);
  });

  it('should handle dequeue on empty returning undefined', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should handle peek on empty returning undefined', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.peek()).toBeUndefined();
  });

  it('should return undefined capacity when no maxSize', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.capacity()).toBeUndefined();
  });

  it('should return capacity when maxSize set', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 10 });
    expect(queue.capacity()).toBe(10);
  });

  it('should handle many enqueue dequeue cycles', () => {
    const queue = new ElasticQueue2<number>();
    for (let cycle = 0; cycle < 10; cycle++) {
      queue.enqueue(cycle * 2);
      queue.enqueue(cycle * 2 + 1);
      expect(queue.dequeue()).toBe(cycle * 2);
      expect(queue.dequeue()).toBe(cycle * 2 + 1);
    }
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle maxSize with dequeues', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 3 });
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.isFull()).toBe(true);
    queue.dequeue();
    queue.enqueue(4);
    expect(queue.size).toBe(3);
    expect(queue.dequeue()).toBe(2);
  });

  it('should handle multiple clears', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.clear();
    queue.enqueue(2);
    queue.clear();
    queue.enqueue(3);
    expect(queue.size).toBe(1);
    expect(queue.peek()).toBe(3);
  });

  it('should handle enqueue after full dequeue', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    expect(queue.dequeue()).toBe(1);
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(2);
    expect(queue.peek()).toBe(2);
    expect(queue.size).toBe(1);
  });

  it('should handle isFull with no maxSize', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    expect(queue.isFull()).toBe(false);
  });

  it('should handle capacity with maxSize', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 5 });
    expect(queue.capacity()).toBe(5);
  });

  it('should handle capacity without maxSize', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.capacity()).toBeUndefined();
  });

  it('should handle peek on empty queue', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.peek()).toBeUndefined();
  });

  it('should handle clear', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle isFull with maxSize', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 2 });
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.isFull()).toBe(true);
  });

  it('should handle enqueue then dequeue order', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
  });

  it('should handle isEmpty after draining', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.dequeue();
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle size tracking', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.size).toBe(0);
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.size).toBe(2);
  });

  it('should handle clear', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle dequeue', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.dequeue()).toBe(1);
    expect(queue.size).toBe(1);
  });

  it('should handle peek', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.peek()).toBe(1);
    expect(queue.size).toBe(2);
  });

  it('should handle isEmpty', () => {
    const queue = new ElasticQueue2<number>();
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
  });

  it('should handle capacity', () => {
    const queue = new ElasticQueue2<number>({ maxSize: 5 });
    expect(queue.capacity()).toBe(5);
  });
  it('should handle clear', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
  });
  it('should handle peek', () => {
    const queue = new ElasticQueue2<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.peek()).toBe(1);
  });
});
