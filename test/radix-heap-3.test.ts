import { describe, it, expect } from 'vitest';
import { RadixHeap3 } from '../src/core/radix-heap-3/index.js';

describe('RadixHeap3', () => {
    it('should create heap with default 32 bits', () => {
        const heap = new RadixHeap3();
        heap.insert(10, 'value');
        expect(heap.isEmpty()).toBe(false);
    });

    it('should create heap with custom key bits', () => {
        const heap = new RadixHeap3(16);
        heap.insert(10, 'value');
        expect(heap.isEmpty()).toBe(false);
    });

    it('should insert and extract minimum element', () => {
        const heap = new RadixHeap3();
        heap.insert(5, 'value1');
        heap.insert(3, 'value2');
        heap.insert(7, 'value3');

        const result = heap.extractMin();
        expect(result).toEqual({key: 3, value: 'value2'});
    });

    it('should return undefined when extracting from empty heap', () => {
        const heap = new RadixHeap3();
        const result = heap.extractMin();
        expect(result).toBeUndefined();
    });

    it('should peek minimum without extracting', () => {
        const heap = new RadixHeap3();
        heap.insert(5, 'value1');
        heap.insert(3, 'value2');
        heap.insert(7, 'value3');

        const result = heap.peek();
        expect(result).toEqual({key: 3, value: 'value2'});
        expect(heap.size).toBe(3);
    });

    it('should return undefined when peeking empty heap', () => {
        const heap = new RadixHeap3();
        const result = heap.peek();
        expect(result).toBeUndefined();
    });

    it('should return correct size', () => {
        const heap = new RadixHeap3();
        expect(heap.size).toBe(0);
        
        heap.insert(1, 'value1');
        expect(heap.size).toBe(1);
        
        heap.insert(2, 'value2');
        expect(heap.size).toBe(2);
        
        heap.insert(3, 'value3');
        expect(heap.size).toBe(3);
    });

    it('should correctly report isEmpty', () => {
        const heap = new RadixHeap3();
        expect(heap.isEmpty()).toBe(true);
        
        heap.insert(1, 'value');
        expect(heap.isEmpty()).toBe(false);
        
        heap.extractMin();
        expect(heap.isEmpty()).toBe(true);
    });

    it('should clear the heap', () => {
        const heap = new RadixHeap3();
        heap.insert(1, 'value1');
        heap.insert(2, 'value2');
        heap.insert(3, 'value3');
        
        heap.clear();
        
        expect(heap.isEmpty()).toBe(true);
        expect(heap.size).toBe(0);
        expect(heap.peek()).toBeUndefined();
        expect(heap.extractMin()).toBeUndefined();
    });

    it('should maintain sorted extraction order', () => {
        const heap = new RadixHeap3();
        heap.insert(5, 'value5');
        heap.insert(2, 'value2');
        heap.insert(8, 'value8');
        heap.insert(1, 'value1');
        heap.insert(9, 'value9');
        heap.insert(3, 'value3');

        const extracted: Array<{key: number, value: string}> = [];
        let item;
        while ((item = heap.extractMin())) {
            extracted.push(item);
        }

        expect(extracted.map(e => e.key)).toEqual([1, 2, 3, 5, 8, 9]);
    });

    it('should handle duplicate keys', () => {
        const heap = new RadixHeap3();
        heap.insert(5, 'value1');
        heap.insert(5, 'value2');
        heap.insert(5, 'value3');

        const item1 = heap.extractMin();
        expect(item1!.key).toBe(5);

        const item2 = heap.extractMin();
        expect(item2!.key).toBe(5);

        const item3 = heap.extractMin();
        expect(item3!.key).toBe(5);
    });

    it('should decrease key successfully', () => {
        const heap = new RadixHeap3();
        heap.insert(10, 'value1');
        heap.insert(20, 'value2');
        heap.insert(15, 'value3');

        const result = heap.decreaseKey(20, 5, 'value2');
        expect(result).toBe(true);

        const min = heap.extractMin();
        expect(min).toEqual({key: 5, value: 'value2'});
    });

    it('should fail to decrease key to larger value', () => {
        const heap = new RadixHeap3();
        heap.insert(10, 'value1');

        const result = heap.decreaseKey(10, 15, 'value1');
        expect(result).toBe(false);
    });

    it('should fail to decrease key for non-existent item', () => {
        const heap = new RadixHeap3();
        heap.insert(10, 'value1');

        const result = heap.decreaseKey(20, 15, 'value2');
        expect(result).toBe(false);
    });

    it('should handle single element', () => {
        const heap = new RadixHeap3();
        heap.insert(42, 'single');

        expect(heap.peek()).toEqual({key: 42, value: 'single'});
        expect(heap.extractMin()).toEqual({key: 42, value: 'single'});
        expect(heap.isEmpty()).toBe(true);
    });

    it('should handle large number of inserts', () => {
        const heap = new RadixHeap3();
        const count = 1000;

        for (let i = 0; i < count; i++) {
            heap.insert(Math.floor(Math.random() * 10000), `value${i}`);
        }

        expect(heap.size).toBe(count);
        expect(heap.isEmpty()).toBe(false);
    });

    it('should extract in sorted order from large heap', () => {
        const heap = new RadixHeap3();
        const keys = [100, 50, 75, 25, 90, 10, 60, 80, 40, 30];

        keys.forEach((key, i) => heap.insert(key, `value${i}`));

        let prevKey = -1;
        let item;
        while ((item = heap.extractMin())) {
            expect(item.key).toBeGreaterThanOrEqual(prevKey);
            prevKey = item.key;
        }
    });

    it('should handle zero key', () => {
        const heap = new RadixHeap3();
        heap.insert(0, 'zero');
        heap.insert(5, 'five');

        const min = heap.extractMin();
        expect(min).toEqual({key: 0, value: 'zero'});
    });

    it('should handle negative keys', () => {
        const heap = new RadixHeap3();
        heap.insert(-5, 'negative');
        heap.insert(5, 'positive');
        heap.insert(-10, 'moreNegative');

        const min = heap.extractMin();
        expect(min).toEqual({key: -10, value: 'moreNegative'});
    });

    it('should work with generic types', () => {
        const heap = new RadixHeap3<number>();
        heap.insert(1, 100);
        heap.insert(2, 200);

        const result = heap.extractMin();
        expect(result).toEqual({key: 1, value: 100});
    });

    it('should handle object values', () => {
        const heap = new RadixHeap3<{id: number, name: string}>();
        const obj1 = {id: 1, name: 'test1'};
        const obj2 = {id: 2, name: 'test2'};

        heap.insert(10, obj1);
        heap.insert(5, obj2);

        const result = heap.extractMin();
        expect(result).toEqual({key: 5, value: obj2});
    });

    it('should maintain heap after multiple extracts and inserts', () => {
        const heap = new RadixHeap3();

        heap.insert(5, 'a');
        heap.insert(3, 'b');
        heap.insert(8, 'c');

        heap.extractMin();
        heap.extractMin();

        heap.insert(1, 'd');
        heap.insert(6, 'e');

        const result = heap.extractMin();
        expect(result).toEqual({key: 1, value: 'd'});
    });

    it('should return correct size', () => {
        const heap = new RadixHeap3();
        expect(heap.size).toBe(0);
        heap.insert(1, 'a');
        expect(heap.size).toBe(1);
        heap.insert(2, 'b');
        expect(heap.size).toBe(2);
        heap.extractMin();
        expect(heap.size).toBe(1);
    });

    it('should report isEmpty correctly', () => {
        const heap = new RadixHeap3();
        expect(heap.isEmpty()).toBe(true);
        heap.insert(1, 'a');
        expect(heap.isEmpty()).toBe(false);
        heap.extractMin();
        expect(heap.isEmpty()).toBe(true);
    });

    it('should peek at minimum without removing', () => {
        const heap = new RadixHeap3();
        heap.insert(5, 'a');
        heap.insert(3, 'b');
        heap.insert(7, 'c');
        expect(heap.peek()).toEqual({key: 3, value: 'b'});
        expect(heap.size).toBe(3);
    });

    it('should return undefined peek on empty heap', () => {
        const heap = new RadixHeap3();
        expect(heap.peek()).toBeUndefined();
    });

    it('should clear the heap', () => {
        const heap = new RadixHeap3();
        heap.insert(1, 'a');
        heap.insert(2, 'b');
        heap.clear();
        expect(heap.size).toBe(0);
        expect(heap.isEmpty()).toBe(true);
    });

    it('should return default keyBits', () => {
        const heap = new RadixHeap3();
        expect(heap.keyBits).toBe(32);
    });

    it('should extract all in sorted order', () => {
        const heap = new RadixHeap3();
        const keys = [5, 3, 8, 1, 9, 2, 7, 4, 6];
        for (const k of keys) {
            heap.insert(k, `val-${k}`);
        }
        const results: number[] = [];
        while (!heap.isEmpty()) {
            const item = heap.extractMin()!;
            results.push(item.key);
        }
        expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should handle single element', () => {
        const heap = new RadixHeap3();
        heap.insert(42, 'only');
        expect(heap.extractMin()).toEqual({ key: 42, value: 'only' });
        expect(heap.isEmpty()).toBe(true);
    });

    it('should handle decreasing keys', () => {
        const heap = new RadixHeap3();
        heap.insert(1, 'a');
        heap.insert(2, 'b');
        heap.insert(3, 'c');
        expect(heap.extractMin()!.key).toBe(1);
        expect(heap.extractMin()!.key).toBe(2);
        expect(heap.extractMin()!.key).toBe(3);
    });

    it('should handle keyBits getter', () => {
        const heap = new RadixHeap3(16);
        expect(heap.keyBits).toBe(16);
    });

    it('should handle isEmpty', () => {
        const heap = new RadixHeap3();
        expect(heap.isEmpty()).toBe(true);
        heap.insert(5, 'a');
        expect(heap.isEmpty()).toBe(false);
    });
});
