import { describe, it, expect } from 'vitest';
import { Pagoda2 } from '../src/core/pagoda-2/index.js';

describe('Pagoda2', () => {
  describe('constructor', () => {
    it('should create empty pagoda', () => {
      const pagoda = new Pagoda2<number>();
      expect(pagoda.size).toBe(0);
      expect(pagoda.isEmpty()).toBe(true);
    });

    it('should create pagoda with custom comparator', () => {
      const pagoda = new Pagoda2<number>((a, b) => b - a);
      pagoda.insert(5);
      pagoda.insert(3);
      expect(pagoda.peek()).toBe(5);
    });
  });

  describe('insert and extractMin', () => {
    it('should insert and extract single element', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      expect(pagoda.size).toBe(1);
      expect(pagoda.extractMin()).toBe(5);
      expect(pagoda.size).toBe(0);
    });

    it('should maintain min-heap order with numbers', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      pagoda.insert(1);
      expect(pagoda.extractMin()).toBe(1);
      expect(pagoda.extractMin()).toBe(3);
      expect(pagoda.extractMin()).toBe(5);
      expect(pagoda.extractMin()).toBe(7);
    });

    it('should handle duplicate values', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(5);
      pagoda.insert(3);
      const result = [];
      while (!pagoda.isEmpty()) {
        result.push(pagoda.extractMin()!);
      }
      expect(result).toEqual([3, 3, 5, 5]);
    });

    it('should handle negative numbers', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(-5);
      pagoda.insert(3);
      pagoda.insert(-1);
      expect(pagoda.extractMin()).toBe(-5);
      expect(pagoda.extractMin()).toBe(-1);
      expect(pagoda.extractMin()).toBe(3);
    });

    it('should handle many elements', () => {
      const pagoda = new Pagoda2<number>();
      const values = [5, 3, 8, 1, 9, 2, 7, 4, 6];
      for (const v of values) {
        pagoda.insert(v);
      }
      const sorted = values.slice().sort((a, b) => a - b);
      const result = [];
      while (!pagoda.isEmpty()) {
        result.push(pagoda.extractMin()!);
      }
      expect(result).toEqual(sorted);
    });

    it('should extractMin return null when empty', () => {
      const pagoda = new Pagoda2<number>();
      expect(pagoda.extractMin()).toBe(null);
    });
  });

  describe('peek', () => {
    it('should peek at minimum element', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      expect(pagoda.peek()).toBe(3);
      expect(pagoda.size).toBe(3);
    });

    it('should peek after multiple inserts', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(10);
      expect(pagoda.peek()).toBe(10);
      pagoda.insert(5);
      expect(pagoda.peek()).toBe(5);
      pagoda.insert(1);
      expect(pagoda.peek()).toBe(1);
    });

    it('should return null when empty', () => {
      const pagoda = new Pagoda2<number>();
      expect(pagoda.peek()).toBe(null);
    });

    it('should not modify pagoda', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.peek();
      expect(pagoda.size).toBe(2);
      expect(pagoda.extractMin()).toBe(3);
    });
  });

  describe('merge', () => {
    it('should merge two non-empty pagodas', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      pagoda1.insert(5);
      pagoda1.insert(3);
      pagoda2.insert(4);
      pagoda2.insert(6);
      pagoda1.merge(pagoda2);
      expect(pagoda1.size).toBe(4);
      expect(pagoda2.isEmpty()).toBe(true);
      expect(pagoda2.size).toBe(0);
      expect(pagoda1.extractMin()).toBe(3);
      expect(pagoda1.extractMin()).toBe(4);
      expect(pagoda1.extractMin()).toBe(5);
      expect(pagoda1.extractMin()).toBe(6);
    });

    it('should merge with empty pagoda', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      pagoda1.insert(5);
      pagoda1.insert(3);
      pagoda1.merge(pagoda2);
      expect(pagoda1.size).toBe(2);
      expect(pagoda1.extractMin()).toBe(3);
      expect(pagoda1.extractMin()).toBe(5);
    });

    it('should merge empty with non-empty', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      pagoda2.insert(5);
      pagoda2.insert(3);
      pagoda1.merge(pagoda2);
      expect(pagoda1.size).toBe(2);
      expect(pagoda2.isEmpty()).toBe(true);
    });

    it('should merge two empty pagodas', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      pagoda1.merge(pagoda2);
      expect(pagoda1.isEmpty()).toBe(true);
      expect(pagoda2.isEmpty()).toBe(true);
    });

    it('should merge pagodas with same values', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      pagoda1.insert(5);
      pagoda1.insert(3);
      pagoda2.insert(5);
      pagoda2.insert(3);
      pagoda1.merge(pagoda2);
      const result = [];
      while (!pagoda1.isEmpty()) {
        result.push(pagoda1.extractMin()!);
      }
      expect(result).toEqual([3, 3, 5, 5]);
    });

    it('should merge large pagodas', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      for (let i = 0; i < 50; i++) {
        pagoda1.insert(i);
      }
      for (let i = 50; i < 100; i++) {
        pagoda2.insert(i);
      }
      pagoda1.merge(pagoda2);
      expect(pagoda1.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(pagoda1.extractMin()).toBe(i);
      }
    });
  });

  describe('size', () => {
    it('should return 0 for empty pagoda', () => {
      const pagoda = new Pagoda2<number>();
      expect(pagoda.size).toBe(0);
    });

    it('should increment on insert', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      expect(pagoda.size).toBe(1);
      pagoda.insert(3);
      expect(pagoda.size).toBe(2);
    });

    it('should decrement on extractMin', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      expect(pagoda.size).toBe(3);
      pagoda.extractMin();
      expect(pagoda.size).toBe(2);
      pagoda.extractMin();
      expect(pagoda.size).toBe(1);
      pagoda.extractMin();
      expect(pagoda.size).toBe(0);
    });

    it('should update correctly after merge', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      pagoda1.insert(5);
      pagoda1.insert(3);
      pagoda2.insert(4);
      pagoda2.insert(6);
      expect(pagoda1.size).toBe(2);
      expect(pagoda2.size).toBe(2);
      pagoda1.merge(pagoda2);
      expect(pagoda1.size).toBe(4);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty pagoda', () => {
      const pagoda = new Pagoda2<number>();
      expect(pagoda.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      expect(pagoda.isEmpty()).toBe(false);
    });

    it('should return true after extracting all', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.extractMin();
      pagoda.extractMin();
      expect(pagoda.isEmpty()).toBe(true);
    });

    it('should return false for single element', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(1);
      expect(pagoda.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear empty pagoda', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.clear();
      expect(pagoda.isEmpty()).toBe(true);
      expect(pagoda.size).toBe(0);
    });

    it('should clear non-empty pagoda', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      pagoda.clear();
      expect(pagoda.isEmpty()).toBe(true);
      expect(pagoda.size).toBe(0);
      expect(pagoda.peek()).toBe(null);
    });

    it('should allow operations after clear', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.clear();
      pagoda.insert(1);
      expect(pagoda.size).toBe(1);
      expect(pagoda.extractMin()).toBe(1);
    });

    it('should clear large pagoda', () => {
      const pagoda = new Pagoda2<number>();
      for (let i = 0; i < 100; i++) {
        pagoda.insert(i);
      }
      pagoda.clear();
      expect(pagoda.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty pagoda', () => {
      const pagoda = new Pagoda2<number>();
      expect(pagoda.toArray()).toEqual([]);
    });

    it('should return sorted array', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      pagoda.insert(1);
      expect(pagoda.toArray()).toEqual([1, 3, 5, 7]);
    });

    it('should not modify original pagoda', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      const arr = pagoda.toArray();
      expect(pagoda.size).toBe(2);
      expect(arr).toEqual([3, 5]);
      expect(pagoda.extractMin()).toBe(3);
    });

    it('should handle single element', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      expect(pagoda.toArray()).toEqual([5]);
    });

    it('should handle duplicates', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(5);
      pagoda.insert(3);
      expect(pagoda.toArray()).toEqual([3, 3, 5, 5]);
    });
  });

  describe('contains', () => {
    it('should return false for empty pagoda', () => {
      const pagoda = new Pagoda2<number>();
      expect(pagoda.contains(5)).toBe(false);
    });

    it('should return true for existing value', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      expect(pagoda.contains(5)).toBe(true);
    });

    it('should return false for non-existing value', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      expect(pagoda.contains(3)).toBe(false);
    });

    it('should handle multiple elements', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      expect(pagoda.contains(3)).toBe(true);
      expect(pagoda.contains(5)).toBe(true);
      expect(pagoda.contains(7)).toBe(true);
      expect(pagoda.contains(1)).toBe(false);
    });

    it('should work after extractMin', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      pagoda.extractMin();
      expect(pagoda.contains(3)).toBe(false);
      expect(pagoda.contains(5)).toBe(true);
    });

    it('should handle strings', () => {
      const pagoda = new Pagoda2<string>();
      pagoda.insert('apple');
      pagoda.insert('banana');
      expect(pagoda.contains('apple')).toBe(true);
      expect(pagoda.contains('orange')).toBe(false);
    });

    it('should handle duplicates', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(5);
      expect(pagoda.contains(5)).toBe(true);
    });
  });

  describe('decreaseKey', () => {
    it('should decrease existing key', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(10);
      pagoda.insert(20);
      const result = pagoda.decreaseKey(20, 5);
      expect(result).toBe(true);
      expect(pagoda.extractMin()).toBe(5);
      expect(pagoda.extractMin()).toBe(10);
    });

    it('should return false for non-existing key', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(10);
      const result = pagoda.decreaseKey(20, 5);
      expect(result).toBe(false);
      expect(pagoda.extractMin()).toBe(10);
    });

    it('should return false when new value is larger', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(10);
      const result = pagoda.decreaseKey(10, 15);
      expect(result).toBe(false);
      expect(pagoda.extractMin()).toBe(10);
    });

    it('should work with same value', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(10);
      const result = pagoda.decreaseKey(10, 10);
      expect(result).toBe(false);
    });

    it('should handle multiple decreases', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(30);
      pagoda.insert(20);
      pagoda.insert(10);
      pagoda.decreaseKey(30, 5);
      expect(pagoda.extractMin()).toBe(5);
    });

    it('should maintain heap property', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(50);
      pagoda.insert(40);
      pagoda.insert(30);
      pagoda.insert(20);
      pagoda.insert(10);
      pagoda.decreaseKey(50, 1);
      expect(pagoda.extractMin()).toBe(1);
      expect(pagoda.extractMin()).toBe(10);
    });
  });

  describe('delete', () => {
    it('should delete existing value', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      const result = pagoda.delete(3);
      expect(result).toBe(true);
      expect(pagoda.size).toBe(2);
      expect(pagoda.toArray()).toEqual([5, 7]);
    });

    it('should return false for non-existing value', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      const result = pagoda.delete(3);
      expect(result).toBe(false);
      expect(pagoda.size).toBe(1);
    });

    it('should delete from empty pagoda', () => {
      const pagoda = new Pagoda2<number>();
      const result = pagoda.delete(5);
      expect(result).toBe(false);
    });

    it('should delete minimum element', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      pagoda.delete(3);
      expect(pagoda.extractMin()).toBe(5);
    });

    it('should delete maximum element', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      pagoda.delete(7);
      expect(pagoda.extractMin()).toBe(3);
      expect(pagoda.extractMin()).toBe(5);
    });

    it('should delete duplicate values', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(5);
      pagoda.delete(5);
      expect(pagoda.size).toBe(2);
      expect(pagoda.contains(5)).toBe(true);
    });

    it('should delete only one instance', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(5);
      pagoda.delete(5);
      pagoda.delete(5);
      expect(pagoda.size).toBe(1);
      expect(pagoda.contains(5)).toBe(false);
    });

    it('should work after merge', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      pagoda1.insert(5);
      pagoda1.insert(3);
      pagoda2.insert(7);
      pagoda2.insert(1);
      pagoda1.merge(pagoda2);
      pagoda1.delete(3);
      expect(pagoda1.size).toBe(3);
      expect(pagoda1.contains(3)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle single element pagoda', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(1);
      expect(pagoda.size).toBe(1);
      expect(pagoda.isEmpty()).toBe(false);
      expect(pagoda.peek()).toBe(1);
      expect(pagoda.extractMin()).toBe(1);
      expect(pagoda.isEmpty()).toBe(true);
    });

    it('should handle two elements', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(2);
      pagoda.insert(1);
      expect(pagoda.size).toBe(2);
      expect(pagoda.extractMin()).toBe(1);
      expect(pagoda.extractMin()).toBe(2);
    });

    it('should handle zero', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(0);
      pagoda.insert(-1);
      pagoda.insert(1);
      expect(pagoda.extractMin()).toBe(-1);
      expect(pagoda.extractMin()).toBe(0);
      expect(pagoda.extractMin()).toBe(1);
    });

    it('should handle large numbers', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(1000000);
      pagoda.insert(2000000);
      pagoda.insert(500000);
      expect(pagoda.extractMin()).toBe(500000);
      expect(pagoda.extractMin()).toBe(1000000);
    });

    it('should maintain order after many operations', () => {
      const pagoda = new Pagoda2<number>();
      for (let i = 100; i >= 0; i--) {
        pagoda.insert(i);
      }
      for (let i = 0; i <= 100; i++) {
        expect(pagoda.extractMin()).toBe(i);
      }
    });

    it('should handle interleaved operations', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(10);
      pagoda.insert(5);
      pagoda.extractMin();
      pagoda.insert(15);
      pagoda.insert(1);
      expect(pagoda.extractMin()).toBe(1);
      expect(pagoda.extractMin()).toBe(10);
      expect(pagoda.extractMin()).toBe(15);
    });
  });

  describe('strings', () => {
    it('should handle strings with default comparator', () => {
      const pagoda = new Pagoda2<string>();
      pagoda.insert('banana');
      pagoda.insert('apple');
      pagoda.insert('cherry');
      expect(pagoda.extractMin()).toBe('apple');
      expect(pagoda.extractMin()).toBe('banana');
      expect(pagoda.extractMin()).toBe('cherry');
    });

    it('should peek with strings', () => {
      const pagoda = new Pagoda2<string>();
      pagoda.insert('banana');
      pagoda.insert('apple');
      expect(pagoda.peek()).toBe('apple');
    });

    it('should contain string values', () => {
      const pagoda = new Pagoda2<string>();
      pagoda.insert('apple');
      pagoda.insert('banana');
      expect(pagoda.contains('apple')).toBe(true);
      expect(pagoda.contains('cherry')).toBe(false);
    });

    it('should delete string values', () => {
      const pagoda = new Pagoda2<string>();
      pagoda.insert('apple');
      pagoda.insert('banana');
      pagoda.delete('apple');
      expect(pagoda.contains('apple')).toBe(false);
      expect(pagoda.extractMin()).toBe('banana');
    });
  });

  describe('custom comparator', () => {
    it('should work with max-heap comparator', () => {
      const pagoda = new Pagoda2<number>((a, b) => b - a);
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      expect(pagoda.extractMin()).toBe(7);
      expect(pagoda.extractMin()).toBe(5);
      expect(pagoda.extractMin()).toBe(3);
    });

    it('should work with object comparator', () => {
      interface Item {
        value: number;
        name: string;
      }
      const pagoda = new Pagoda2<Item>((a, b) => a.value - b.value);
      pagoda.insert({ value: 5, name: 'five' });
      pagoda.insert({ value: 3, name: 'three' });
      pagoda.insert({ value: 7, name: 'seven' });
      expect(pagoda.extractMin()!.name).toBe('three');
      expect(pagoda.extractMin()!.name).toBe('five');
      expect(pagoda.extractMin()!.name).toBe('seven');
    });
  });

  describe('merge with custom comparator', () => {
    it('should merge max-heaps', () => {
      const pagoda1 = new Pagoda2<number>((a, b) => b - a);
      const pagoda2 = new Pagoda2<number>((a, b) => b - a);
      pagoda1.insert(5);
      pagoda1.insert(3);
      pagoda2.insert(4);
      pagoda2.insert(6);
      pagoda1.merge(pagoda2);
      expect(pagoda1.extractMin()).toBe(6);
      expect(pagoda1.extractMin()).toBe(5);
      expect(pagoda1.extractMin()).toBe(4);
      expect(pagoda1.extractMin()).toBe(3);
    });
  });

  describe('toArray after merge', () => {
    it('should return sorted array after merge', () => {
      const pagoda1 = new Pagoda2<number>();
      const pagoda2 = new Pagoda2<number>();
      pagoda1.insert(5);
      pagoda1.insert(3);
      pagoda2.insert(4);
      pagoda2.insert(6);
      pagoda1.merge(pagoda2);
      expect(pagoda1.toArray()).toEqual([3, 4, 5, 6]);
    });
  });

  describe('size after delete', () => {
    it('should correctly track size after delete', () => {
      const pagoda = new Pagoda2<number>();
      pagoda.insert(5);
      pagoda.insert(3);
      pagoda.insert(7);
      expect(pagoda.size).toBe(3);
      pagoda.delete(3);
      expect(pagoda.size).toBe(2);
      pagoda.delete(7);
      expect(pagoda.size).toBe(1);
    });
  });

  describe('isEmpty after operations', () => {
    it('should track emptiness correctly', () => {
      const pagoda = new Pagoda2<number>();
      expect(pagoda.isEmpty()).toBe(true);
      pagoda.insert(5);
      expect(pagoda.isEmpty()).toBe(false);
      pagoda.delete(5);
      expect(pagoda.isEmpty()).toBe(true);
      pagoda.insert(3);
      pagoda.insert(7);
      expect(pagoda.isEmpty()).toBe(false);
      pagoda.clear();
      expect(pagoda.isEmpty()).toBe(true);
    });
  });
});
