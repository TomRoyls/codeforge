import { describe, it, expect } from 'vitest';
import { PairingHeap5, PairingHeapNode5 } from '../src/core/pairing-heap-5/index';

describe('PairingHeap5', () => {
  it('should create an empty heap', async () => {
    const heap = new PairingHeap5<number>();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should insert elements', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    expect(heap.size).toBe(1);
    expect(heap.isEmpty()).toBe(false);
  });

  it('should extract minimum element', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);

    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(7);
    expect(heap.extractMin()).toBe(undefined);
  });

  it('should peek at minimum element without removing', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    expect(heap.peek()).toBe(3);
    expect(heap.size).toBe(3);
    expect(heap.peek()).toBe(3);
  });

  it('should peek on empty heap', async () => {
    const heap = new PairingHeap5<number>();
    expect(heap.peek()).toBe(undefined);
  });

  it('should merge two heaps', async () => {
    const heap1 = new PairingHeap5<number>();
    heap1.insert(5);
    heap1.insert(3);

    const heap2 = new PairingHeap5<number>();
    heap2.insert(7);
    heap2.insert(1);

    heap1.merge(heap2);

    expect(heap1.size).toBe(4);
    expect(heap1.extractMin()).toBe(1);
    expect(heap1.extractMin()).toBe(3);
    expect(heap1.extractMin()).toBe(5);
    expect(heap1.extractMin()).toBe(7);
    expect(heap2.isEmpty()).toBe(true);
  });

  it('should merge heap with empty heap', async () => {
    const heap1 = new PairingHeap5<number>();
    heap1.insert(5);

    const heap2 = new PairingHeap5<number>();

    heap1.merge(heap2);

    expect(heap1.size).toBe(1);
    expect(heap1.extractMin()).toBe(5);
  });

  it('should handle self-merge', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    const originalSize = heap.size;

    heap.merge(heap);

    expect(heap.size).toBe(originalSize);
  });

  it('should clear heap', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    heap.clear();

    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
    expect(heap.peek()).toBe(undefined);
  });

  it('should convert to array sorted', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);

    const arr = heap.toArray();

    expect(arr).toEqual([1, 3, 5, 7]);
  });

  it('should create heap from array', async () => {
    const heap = PairingHeap5.fromArray([5, 3, 7, 1]);

    expect(heap.size).toBe(4);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(7);
  });

  it('should create heap from array with custom comparator', async () => {
    const heap = PairingHeap5.fromArray([5, 3, 7, 1], (a, b) => b - a);

    expect(heap.extractMin()).toBe(7);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(1);
  });

  it('should handle strings with default comparator', async () => {
    const heap = new PairingHeap5<string>();
    heap.insert('banana');
    heap.insert('apple');
    heap.insert('cherry');

    expect(heap.extractMin()).toBe('apple');
    expect(heap.extractMin()).toBe('banana');
    expect(heap.extractMin()).toBe('cherry');
  });

  it('should handle large dataset', async () => {
    const heap = new PairingHeap5<number>();
    const count = 1000;
    const values: number[] = [];

    for (let i = 0; i < count; i++) {
      values.push(i);
    }

    for (let i = 0; i < values.length; i++) {
      const value = values[Math.floor(Math.random() * values.length)];
      heap.insert(value);
    }

    const arr = heap.toArray();
    expect(arr.length).toBe(values.length);

    for (let i = 1; i < arr.length; i++) {
      expect(arr[i - 1]! <= arr[i]!).toBe(true);
    }
  });

  it('should extract all elements from large heap', async () => {
    const heap = new PairingHeap5<number>();
    const count = 1000;

    for (let i = count - 1; i >= 0; i--) {
      heap.insert(i);
    }

    for (let i = 0; i < count; i++) {
      expect(heap.extractMin()).toBe(i);
    }

    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle duplicate values', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);

    const arr = heap.toArray();

    expect(arr).toEqual([3, 3, 5, 5, 7]);
  });

  it('should use custom comparator correctly', async () => {
    interface Item {
      value: number;
      priority: number;
    }

    const heap = new PairingHeap5<Item>((a, b) => a.priority - b.priority);

    heap.insert({ value: 1, priority: 10 });
    heap.insert({ value: 2, priority: 5 });
    heap.insert({ value: 3, priority: 15 });

    expect(heap.extractMin()?.value).toBe(2);
    expect(heap.extractMin()?.value).toBe(1);
    expect(heap.extractMin()?.value).toBe(3);
  });

  it('should decrease key of root node', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(10);
    heap.insert(15);

    heap.decreaseKey(heap._root!, 2);

    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(10);
    expect(heap.extractMin()).toBe(15);
  });

  it('should decrease key of non-root node', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(10);
    heap.insert(15);

    heap.decreaseKey(heap._root!.children[1]!, 2);

    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(10);
  });

  it('should maintain heap property after multiple decreases', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(10);
    heap.insert(20);
    heap.insert(30);
    heap.insert(40);
    heap.insert(50);

    heap.decreaseKey(heap._root!.children[2]!, 5);
    heap.decreaseKey(heap._root!.children[0]!, 1);

    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(20);
  });

  it('should handle decreaseKey with same value', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(10);
    heap.insert(15);

    heap.decreaseKey(heap._root!.children[0]!, 10);

    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(10);
    expect(heap.extractMin()).toBe(15);
  });

  it('should handle extracting from empty heap', async () => {
    const heap = new PairingHeap5<number>();

    expect(heap.extractMin()).toBe(undefined);
    expect(heap.extractMin()).toBe(undefined);
  });

  it('should handle inserting and extracting single element', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(42);

    expect(heap.peek()).toBe(42);
    expect(heap.extractMin()).toBe(42);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle fromArray with empty array', async () => {
    const heap = PairingHeap5.fromArray([]);

    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle fromArray with single element', async () => {
    const heap = PairingHeap5.fromArray([42]);

    expect(heap.size).toBe(1);
    expect(heap.extractMin()).toBe(42);
  });

  it('should merge multiple heaps', async () => {
    const heap1 = new PairingHeap5<number>();
    heap1.insert(5);

    const heap2 = new PairingHeap5<number>();
    heap2.insert(3);

    const heap3 = new PairingHeap5<number>();
    heap3.insert(7);

    heap1.merge(heap2);
    heap1.merge(heap3);

    expect(heap1.size).toBe(3);
    expect(heap1.toArray()).toEqual([3, 5, 7]);
  });

  it('should handle toArray after merge', async () => {
    const heap1 = new PairingHeap5<number>();
    heap1.insert(5);
    heap1.insert(3);

    const heap2 = new PairingHeap5<number>();
    heap2.insert(7);
    heap2.insert(1);

    heap1.merge(heap2);

    expect(heap1.toArray()).toEqual([1, 3, 5, 7]);
  });

  it('should clear heap multiple times', async () => {
    const heap = new PairingHeap5<number>();

    heap.insert(5);
    heap.insert(3);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);

    heap.insert(7);
    heap.insert(1);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle size after operations', async () => {
    const heap = new PairingHeap5<number>();

    expect(heap.size).toBe(0);

    heap.insert(1);
    heap.insert(2);
    expect(heap.size).toBe(2);

    heap.extractMin();
    expect(heap.size).toBe(1);

    heap.clear();
    expect(heap.size).toBe(0);
  });

  it('should work with negative numbers', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(-5);
    heap.insert(3);
    heap.insert(-10);
    heap.insert(7);

    expect(heap.extractMin()).toBe(-10);
    expect(heap.extractMin()).toBe(-5);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(7);
  });

  it('should work with floating point numbers', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(3.14);
    heap.insert(1.5);
    heap.insert(2.71);
    heap.insert(0.5);

    const arr = heap.toArray();

    expect(arr[0]!).toBe(0.5);
    expect(arr[1]!).toBe(1.5);
    expect(arr[2]!).toBe(2.71);
    expect(arr[3]!).toBe(3.14);
  });

  it('should handle decreaseKey with larger value', async () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(10);
    heap.insert(15);

    const root = heap._root!;
    heap.decreaseKey(root, 8);

    expect(heap.extractMin()).toBe(8);
    expect(heap.extractMin()).toBe(10);
    expect(heap.extractMin()).toBe(15);
  });
});

describe('PairingHeapNode5', () => {
  it('should create node with value', async () => {
    const node = new PairingHeapNode5(42);

    expect(node.value).toBe(42);
    expect(node.children).toEqual([]);
  });

  it('should initialize with empty children array', async () => {
    const node = new PairingHeapNode5('test');

    expect(node.children.length).toBe(0);
    expect(Array.isArray(node.children)).toBe(true);
  });

  it('should work with generic types', async () => {
    interface CustomType {
      id: number;
      name: string;
    }

    const node = new PairingHeapNode5<CustomType>({ id: 1, name: 'test' });

    expect(node.value.id).toBe(1);
    expect(node.value.name).toBe('test');
  });

  it('should handle isEmpty on new heap', async () => {
    const heap = new PairingHeap5<number>();
    expect(heap.isEmpty()).toBe(true);
    heap.insert(1);
    expect(heap.isEmpty()).toBe(false);
  });

  it('should handle size', async () => {
    const heap = new PairingHeap5<number>();
    expect(heap.size).toBe(0);
    heap.insert(1);
    heap.insert(2);
    expect(heap.size).toBe(2);
  });

  it('should handle peek', () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    expect(heap.peek()).toBe(3);
    expect(heap.size).toBe(3);
  });

  it('should handle isEmpty', () => {
    const heap = new PairingHeap5<number>();
    expect(heap.isEmpty()).toBe(true);
    heap.insert(5);
    expect(heap.isEmpty()).toBe(false);
  });

  it('should handle merge', () => {
    const h1 = new PairingHeap5<number>();
    h1.insert(5);
    h1.insert(3);
    const h2 = new PairingHeap5<number>();
    h2.insert(1);
    h2.insert(7);
    h1.merge(h2);
    expect(h1.peek()).toBe(1);
    expect(h1.size).toBe(4);
  });

  it('should handle clear', () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });

  it('should handle toArray', () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    const arr = heap.toArray();
    expect(arr.length).toBe(3);
    expect(arr).toContain(3);
  });
  it('should handle extractMin', () => {
    const heap = new PairingHeap5<number>();
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(5);
  });
});
