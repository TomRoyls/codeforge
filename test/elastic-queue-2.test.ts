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
});
