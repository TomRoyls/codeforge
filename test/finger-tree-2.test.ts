import { describe, it, expect, beforeEach } from 'vitest';
import { FingerTree2 } from '../src/core/finger-tree-2/index.js';

describe('FingerTree2', () => {
  let tree: FingerTree2<number>;

  beforeEach(() => {
    tree = new FingerTree2<number>();
  });

  describe('constructor', () => {
    it('should create empty tree', () => {
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.toArray()).toEqual([]);
    });

    it('should create tree from iterable', () => {
      const populated = new FingerTree2<number>([1, 2, 3]);
      expect(populated.size).toBe(3);
      expect(populated.toArray()).toEqual([1, 2, 3]);
    });

    it('should create tree from Set', () => {
      const populated = new FingerTree2<number>(new Set([1, 2, 3]));
      expect(populated.size).toBe(3);
      expect(populated.toArray()).toEqual([1, 2, 3]);
    });

    it('should create tree from generator', () => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      const populated = new FingerTree2<number>(gen());
      expect(populated.size).toBe(3);
      expect(populated.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('pushBack', () => {
    it('should add elements to back', () => {
      const t1 = tree.pushBack(1);
      const t2 = t1.pushBack(2);
      const t3 = t2.pushBack(3);
      expect(t3.toArray()).toEqual([1, 2, 3]);
      expect(t3.size).toBe(3);
    });

    it('should handle single element', () => {
      const t1 = tree.pushBack(42);
      expect(t1.toArray()).toEqual([42]);
      expect(t1.front()).toBe(42);
      expect(t1.back()).toBe(42);
    });

    it('should not modify original', () => {
      const t1 = tree.pushBack(1);
      const t2 = t1.pushBack(2);
      expect(t1.toArray()).toEqual([1]);
      expect(t2.toArray()).toEqual([1, 2]);
    });

    it('should handle strings', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushBack('a');
      const t2 = t1.pushBack('b');
      const t3 = t2.pushBack('c');
      expect(t3.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should handle objects', () => {
      const objTree = new FingerTree2<{ id: number }>();
      const t1 = objTree.pushBack({ id: 1 });
      const t2 = t1.pushBack({ id: 2 });
      expect(t2.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('pushFront', () => {
    it('should add elements to front', () => {
      const t1 = tree.pushFront(1);
      const t2 = t1.pushFront(2);
      const t3 = t2.pushFront(3);
      expect(t3.toArray()).toEqual([3, 2, 1]);
      expect(t3.size).toBe(3);
    });

    it('should handle single element', () => {
      const t1 = tree.pushFront(42);
      expect(t1.toArray()).toEqual([42]);
      expect(t1.front()).toBe(42);
      expect(t1.back()).toBe(42);
    });

    it('should not modify original', () => {
      const t1 = tree.pushFront(1);
      const t2 = t1.pushFront(2);
      expect(t1.toArray()).toEqual([1]);
      expect(t2.toArray()).toEqual([2, 1]);
    });

    it('should handle strings', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushFront('a');
      const t2 = t1.pushFront('b');
      const t3 = t2.pushFront('c');
      expect(t3.toArray()).toEqual(['c', 'b', 'a']);
    });

    it('should handle objects', () => {
      const objTree = new FingerTree2<{ id: number }>();
      const t1 = objTree.pushFront({ id: 1 });
      const t2 = t1.pushFront({ id: 2 });
      expect(t2.toArray()).toEqual([{ id: 2 }, { id: 1 }]);
    });
  });

  describe('popFront', () => {
    it('should remove from front', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.popFront();
      expect(t2.toArray()).toEqual([2, 3]);
      expect(t2.size).toBe(2);
    });

    it('should return same instance when empty', () => {
      const t1 = tree.popFront();
      expect(t1.isEmpty).toBe(true);
      expect(t1 === tree).toBe(true);
    });

    it('should handle single element', () => {
      const t1 = tree.pushBack(42);
      const t2 = t1.popFront();
      expect(t2.isEmpty).toBe(true);
      expect(t2.front()).toBe(undefined);
      expect(t2.back()).toBe(undefined);
    });

    it('should not modify original', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.popFront();
      const t3 = t2.popFront();
      expect(t1.toArray()).toEqual([1, 2, 3]);
      expect(t2.toArray()).toEqual([2, 3]);
      expect(t3.toArray()).toEqual([3]);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(1).pushFront(2).pushFront(3);
      const t2 = t1.popFront();
      expect(t2.toArray()).toEqual([2, 1]);
    });
  });

  describe('popBack', () => {
    it('should remove from back', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.popBack();
      expect(t2.toArray()).toEqual([1, 2]);
      expect(t2.size).toBe(2);
    });

    it('should return same instance when empty', () => {
      const t1 = tree.popBack();
      expect(t1.isEmpty).toBe(true);
      expect(t1 === tree).toBe(true);
    });

    it('should handle single element', () => {
      const t1 = tree.pushBack(42);
      const t2 = t1.popBack();
      expect(t2.isEmpty).toBe(true);
      expect(t2.front()).toBe(undefined);
      expect(t2.back()).toBe(undefined);
    });

    it('should not modify original', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.popBack();
      const t3 = t2.popBack();
      expect(t1.toArray()).toEqual([1, 2, 3]);
      expect(t2.toArray()).toEqual([1, 2]);
      expect(t3.toArray()).toEqual([1]);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(1).pushFront(2).pushFront(3);
      const t2 = t1.popBack();
      expect(t2.toArray()).toEqual([3, 2]);
    });
  });

  describe('front', () => {
    it('should return first element', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.front()).toBe(1);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.front()).toBe(undefined);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(1).pushFront(2).pushFront(3);
      expect(t1.front()).toBe(3);
    });

    it('should not modify tree', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      t1.front();
      expect(t1.size).toBe(2);
      expect(t1.toArray()).toEqual([1, 2]);
    });

    it('should update after popFront', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.front()).toBe(1);
      const t2 = t1.popFront();
      expect(t2.front()).toBe(2);
    });
  });

  describe('back', () => {
    it('should return last element', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.back()).toBe(3);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.back()).toBe(undefined);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(1).pushFront(2).pushFront(3);
      expect(t1.back()).toBe(1);
    });

    it('should not modify tree', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      t1.back();
      expect(t1.size).toBe(2);
      expect(t1.toArray()).toEqual([1, 2]);
    });

    it('should update after popBack', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.back()).toBe(3);
      const t2 = t1.popBack();
      expect(t2.back()).toBe(2);
    });
  });

  describe('peekFront', () => {
    it('should alias front', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.peekFront()).toBe(1);
      expect(t1.front()).toBe(1);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.peekFront()).toBe(undefined);
    });

    it('should not modify tree', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      t1.peekFront();
      expect(t1.size).toBe(2);
      expect(t1.toArray()).toEqual([1, 2]);
    });
  });

  describe('peekBack', () => {
    it('should alias back', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.peekBack()).toBe(3);
      expect(t1.back()).toBe(3);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.peekBack()).toBe(undefined);
    });

    it('should not modify tree', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      t1.peekBack();
      expect(t1.size).toBe(2);
      expect(t1.toArray()).toEqual([1, 2]);
    });
  });

  describe('get', () => {
    it('should get element by index', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.get(0)).toBe(1);
      expect(t1.get(1)).toBe(2);
      expect(t1.get(2)).toBe(3);
    });

    it('should return undefined for out of bounds', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.get(-1)).toBe(undefined);
      expect(t1.get(3)).toBe(undefined);
      expect(t1.get(100)).toBe(undefined);
    });

    it('should return undefined for empty tree', () => {
      expect(tree.get(0)).toBe(undefined);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(1).pushFront(2).pushFront(3);
      expect(t1.get(0)).toBe(3);
      expect(t1.get(1)).toBe(2);
      expect(t1.get(2)).toBe(1);
    });

    it('should handle strings', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushBack('a').pushBack('b').pushBack('c');
      expect(t1.get(0)).toBe('a');
      expect(t1.get(1)).toBe('b');
      expect(t1.get(2)).toBe('c');
    });

    it('should handle objects', () => {
      const objTree = new FingerTree2<{ id: number }>();
      const t1 = objTree.pushBack({ id: 1 }).pushBack({ id: 2 });
      expect(t1.get(0)).toEqual({ id: 1 });
      expect(t1.get(1)).toEqual({ id: 2 });
    });

    it('should work with many elements', () => {
      const t1 = new FingerTree2<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(t1.get(5)).toBe(6);
      expect(t1.get(9)).toBe(10);
    });
  });

  describe('set', () => {
    it('should set element by index', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.set(1, 20);
      expect(t2.toArray()).toEqual([1, 20, 3]);
      expect(t2.get(1)).toBe(20);
    });

    it('should return same tree for out of bounds', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.set(-1, 10);
      const t3 = t1.set(3, 10);
      expect(t2.toArray()).toEqual([1, 2, 3]);
      expect(t3.toArray()).toEqual([1, 2, 3]);
      expect(t2 === t1).toBe(true);
      expect(t3 === t1).toBe(true);
    });

    it('should not modify original', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.set(1, 20);
      expect(t1.toArray()).toEqual([1, 2, 3]);
      expect(t2.toArray()).toEqual([1, 20, 3]);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(1).pushFront(2).pushFront(3);
      const t2 = t1.set(1, 20);
      expect(t2.toArray()).toEqual([3, 20, 1]);
    });

    it('should handle strings', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushBack('a').pushBack('b').pushBack('c');
      const t2 = t1.set(1, 'x');
      expect(t2.toArray()).toEqual(['a', 'x', 'c']);
    });

    it('should handle objects', () => {
      const objTree = new FingerTree2<{ id: number }>();
      const t1 = objTree.pushBack({ id: 1 }).pushBack({ id: 2 });
      const t2 = t1.set(0, { id: 10 });
      expect(t2.toArray()).toEqual([{ id: 10 }, { id: 2 }]);
    });
  });

  describe('concat', () => {
    it('should concatenate two trees', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      const t2 = new FingerTree2<number>().pushBack(3).pushBack(4);
      const t3 = t1.concat(t2);
      expect(t3.toArray()).toEqual([1, 2, 3, 4]);
      expect(t3.size).toBe(4);
    });

    it('should concatenate with empty tree', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      const t2 = new FingerTree2<number>();
      const t3 = t1.concat(t2);
      expect(t3.toArray()).toEqual([1, 2]);
      expect(t3.size).toBe(2);
    });

    it('should handle empty left tree', () => {
      const t1 = new FingerTree2<number>();
      const t2 = new FingerTree2<number>().pushBack(1).pushBack(2);
      const t3 = t1.concat(t2);
      expect(t3.toArray()).toEqual([1, 2]);
      expect(t3.size).toBe(2);
    });

    it('should handle both empty', () => {
      const t1 = new FingerTree2<number>();
      const t2 = new FingerTree2<number>();
      const t3 = t1.concat(t2);
      expect(t3.toArray()).toEqual([]);
      expect(t3.isEmpty).toBe(true);
    });

    it('should not modify originals', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      const t2 = new FingerTree2<number>().pushBack(3).pushBack(4);
      const t3 = t1.concat(t2);
      expect(t1.toArray()).toEqual([1, 2]);
      expect(t2.toArray()).toEqual([3, 4]);
      expect(t3.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should handle strings', () => {
      const t1 = new FingerTree2<string>().pushBack('a').pushBack('b');
      const t2 = new FingerTree2<string>().pushBack('c').pushBack('d');
      const t3 = t1.concat(t2);
      expect(t3.toArray()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle large trees', () => {
      const t1 = new FingerTree2<number>([1, 2, 3, 4, 5]);
      const t2 = new FingerTree2<number>([6, 7, 8, 9, 10]);
      const t3 = t1.concat(t2);
      expect(t3.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(t3.size).toBe(10);
    });
  });

  describe('split', () => {
    it('should split at index', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const [left, right] = t1.split(2);
      expect(left.toArray()).toEqual([1, 2]);
      expect(right.toArray()).toEqual([3, 4, 5]);
      expect(left.size).toBe(2);
      expect(right.size).toBe(3);
    });

    it('should return empty left for index 0', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const [left, right] = t1.split(0);
      expect(left.toArray()).toEqual([]);
      expect(right.toArray()).toEqual([1, 2, 3]);
      expect(left.isEmpty).toBe(true);
    });

    it('should return empty right for index at size', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const [left, right] = t1.split(3);
      expect(left.toArray()).toEqual([1, 2, 3]);
      expect(right.toArray()).toEqual([]);
      expect(right.isEmpty).toBe(true);
    });

    it('should return empty right for index beyond size', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const [left, right] = t1.split(10);
      expect(left.toArray()).toEqual([1, 2, 3]);
      expect(right.toArray()).toEqual([]);
    });

    it('should not modify original', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const [left, right] = t1.split(2);
      expect(t1.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(left.toArray()).toEqual([1, 2]);
      expect(right.toArray()).toEqual([3, 4, 5]);
    });

    it('should handle empty tree', () => {
      const [left, right] = tree.split(5);
      expect(left.toArray()).toEqual([]);
      expect(right.toArray()).toEqual([]);
      expect(left.isEmpty).toBe(true);
      expect(right.isEmpty).toBe(true);
    });

    it('should work with strings', () => {
      const t1 = new FingerTree2<string>().pushBack('a').pushBack('b').pushBack('c').pushBack('d');
      const [left, right] = t1.split(2);
      expect(left.toArray()).toEqual(['a', 'b']);
      expect(right.toArray()).toEqual(['c', 'd']);
    });

    it('should handle single element', () => {
      const t1 = tree.pushBack(1);
      const [left, right] = t1.split(0);
      expect(left.toArray()).toEqual([]);
      expect(right.toArray()).toEqual([1]);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      expect(tree.size).toBe(0);
      const t1 = tree.pushBack(1);
      expect(t1.size).toBe(1);
      const t2 = t1.pushBack(2);
      expect(t2.size).toBe(2);
      const t3 = t2.popFront();
      expect(t3.size).toBe(1);
    });

    it('should track size with pushFront', () => {
      expect(tree.size).toBe(0);
      const t1 = tree.pushFront(1);
      expect(t1.size).toBe(1);
      const t2 = t1.pushFront(2);
      expect(t2.size).toBe(2);
      const t3 = t2.popBack();
      expect(t3.size).toBe(1);
    });

    it('should track size with concat', () => {
      const t1 = new FingerTree2<number>([1, 2, 3]);
      const t2 = new FingerTree2<number>([4, 5]);
      const t3 = t1.concat(t2);
      expect(t1.size).toBe(3);
      expect(t2.size).toBe(2);
      expect(t3.size).toBe(5);
    });

    it('should track size with split', () => {
      const t1 = new FingerTree2<number>([1, 2, 3, 4, 5]);
      const [left, right] = t1.split(2);
      expect(t1.size).toBe(5);
      expect(left.size).toBe(2);
      expect(right.size).toBe(3);
    });

    it('should work with large tree', () => {
      const t1 = new FingerTree2<number>(Array.from({ length: 100 }, (_, i) => i));
      expect(t1.size).toBe(100);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      expect(tree.isEmpty).toBe(true);
    });

    it('should return false for non-empty tree', () => {
      const t1 = tree.pushBack(1);
      expect(t1.isEmpty).toBe(false);
    });

    it('should return true after popping all elements', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.popFront().popFront().popFront();
      expect(t2.isEmpty).toBe(true);
    });

    it('should return false after operations', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      const t2 = t1.popFront();
      expect(t2.isEmpty).toBe(false);
    });
  });

  describe('toArray', () => {
    it('should convert to array', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      expect(t1.toArray()).toEqual([1, 2, 3]);
      expect(t1.toArray()).toBeInstanceOf(Array);
    });

    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([]);
      expect(tree.toArray()).toBeInstanceOf(Array);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(1).pushFront(2).pushFront(3);
      expect(t1.toArray()).toEqual([3, 2, 1]);
    });

    it('should work with mixed operations', () => {
      const t1 = tree.pushBack(1).pushFront(0).pushBack(2).pushFront(-1);
      expect(t1.toArray()).toEqual([-1, 0, 1, 2]);
    });

    it('should handle strings', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushBack('a').pushBack('b').pushBack('c');
      expect(t1.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should handle objects', () => {
      const objTree = new FingerTree2<{ id: number }>();
      const t1 = objTree.pushBack({ id: 1 }).pushBack({ id: 2 });
      expect(t1.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const result: number[] = [];
      const indices: number[] = [];
      t1.forEach((value, index) => {
        result.push(value);
        indices.push(index);
      });
      expect(result).toEqual([1, 2, 3]);
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not iterate over empty tree', () => {
      let count = 0;
      tree.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(3).pushFront(2).pushFront(1);
      const result: number[] = [];
      t1.forEach((value) => result.push(value));
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle strings', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushBack('a').pushBack('b').pushBack('c');
      const result: string[] = [];
      t1.forEach((value) => result.push(value));
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle large tree', () => {
      const t1 = new FingerTree2<number>(Array.from({ length: 100 }, (_, i) => i));
      const result: number[] = [];
      t1.forEach((value) => result.push(value));
      expect(result.length).toBe(100);
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i));
    });
  });

  describe('map', () => {
    it('should map elements', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.map((value) => value * 2);
      expect(t2.toArray()).toEqual([2, 4, 6]);
      expect(t2.size).toBe(3);
    });

    it('should map with index', () => {
      const t1 = tree.pushBack(10).pushBack(20).pushBack(30);
      const t2 = t1.map((value, index) => value + index);
      expect(t2.toArray()).toEqual([10, 21, 32]);
    });

    it('should map to different type', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.map((value) => String(value));
      expect(t2.toArray()).toEqual(['1', '2', '3']);
    });

    it('should not modify original', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.map((value) => value);
      const t3 = t2.pushBack(10);
      expect(t1.toArray()).toEqual([1, 2, 3]);
      expect(t2.toArray()).toEqual([1, 2, 3]);
      expect(t3.toArray()).toEqual([1, 2, 3, 10]);
    });

    it('should handle strings', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushBack('a').pushBack('b').pushBack('c');
      const t2 = t1.map((value) => value.toUpperCase());
      expect(t2.toArray()).toEqual(['A', 'B', 'C']);
    });

    it('should handle large tree', () => {
      const t1 = new FingerTree2<number>(Array.from({ length: 100 }, (_, i) => i));
      const t2 = t1.map((value) => value * 2);
      expect(t2.size).toBe(100);
      expect(t2.get(50)).toBe(100);
    });
  });

  describe('iterator', () => {
    it('should support for...of iteration', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const result: number[] = [];
      for (const value of t1) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should support spread operator', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const result = [...t1];
      expect(result).toEqual([1, 2, 3]);
    });

    it('should iterate over empty tree', () => {
      const result = [...tree];
      expect(result).toEqual([]);
    });

    it('should work with pushFront', () => {
      const t1 = tree.pushFront(3).pushFront(2).pushFront(1);
      const result = [...t1];
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle strings', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushBack('a').pushBack('b').pushBack('c');
      const result = [...t1];
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle large tree', () => {
      const t1 = new FingerTree2<number>(Array.from({ length: 100 }, (_, i) => i));
      const result = [...t1];
      expect(result.length).toBe(100);
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i));
    });
  });

  describe('fromArray static', () => {
    it('should create tree from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const t1 = FingerTree2.fromArray(arr);
      expect(t1.toArray()).toEqual(arr);
      expect(t1.size).toBe(5);
    });

    it('should handle empty array', () => {
      const t1 = FingerTree2.fromArray([]);
      expect(t1.size).toBe(0);
      expect(t1.isEmpty).toBe(true);
      expect(t1.toArray()).toEqual([]);
    });

    it('should handle single element', () => {
      const t1 = FingerTree2.fromArray([42]);
      expect(t1.toArray()).toEqual([42]);
      expect(t1.size).toBe(1);
    });

    it('should handle strings', () => {
      const arr = ['a', 'b', 'c'];
      const t1 = FingerTree2.fromArray(arr);
      expect(t1.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should handle objects', () => {
      const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const t1 = FingerTree2.fromArray(arr);
      expect(t1.toArray()).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('should handle large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const t1 = FingerTree2.fromArray(arr);
      expect(t1.size).toBe(100);
      expect(t1.toArray()).toEqual(arr);
    });
  });

  describe('empty static', () => {
    it('should create empty tree', () => {
      const t1 = FingerTree2.empty<number>();
      expect(t1.isEmpty).toBe(true);
      expect(t1.size).toBe(0);
      expect(t1.toArray()).toEqual([]);
    });

    it('should be independent instances', () => {
      const t1 = FingerTree2.empty<number>();
      const t2 = FingerTree2.empty<number>();
      expect(t1 === t2).toBe(false);
    });
  });

  describe('mixed operations', () => {
    it('should handle alternating pushFront and pushBack', () => {
      const t1 = tree.pushBack(1).pushFront(0).pushBack(2).pushFront(-1);
      expect(t1.toArray()).toEqual([-1, 0, 1, 2]);
      expect(t1.front()).toBe(-1);
      expect(t1.back()).toBe(2);
    });

    it('should handle alternating popFront and popBack', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3).pushBack(4);
      const t2 = t1.popFront();
      expect(t2.toArray()).toEqual([2, 3, 4]);
      const t3 = t2.popBack();
      expect(t3.toArray()).toEqual([2, 3]);
    });

    it('should handle pushFront, popBack, pushBack, popFront', () => {
      const t1 = tree.pushBack(1).pushBack(2).pushBack(3);
      const t2 = t1.pushFront(0);
      expect(t2.toArray()).toEqual([0, 1, 2, 3]);
      const t3 = t2.popBack();
      expect(t3.toArray()).toEqual([0, 1, 2]);
      const t4 = t3.pushBack(4);
      expect(t4.toArray()).toEqual([0, 1, 2, 4]);
      const t5 = t4.popFront();
      expect(t5.toArray()).toEqual([1, 2, 4]);
    });
  });

  describe('edge cases', () => {
    it('should handle single element', () => {
      const t1 = tree.pushBack(42);
      expect(t1.size).toBe(1);
      expect(t1.front()).toBe(42);
      expect(t1.back()).toBe(42);
      expect(t1.get(0)).toBe(42);
      const t2 = t1.popFront();
      expect(t2.isEmpty).toBe(true);
    });

    it('should handle two elements', () => {
      const t1 = tree.pushBack(1).pushBack(2);
      expect(t1.size).toBe(2);
      expect(t1.front()).toBe(1);
      expect(t1.back()).toBe(2);
      expect(t1.get(0)).toBe(1);
      expect(t1.get(1)).toBe(2);
    });

    it('should handle large number of pushBack', () => {
      let t1 = new FingerTree2<number>();
      for (let i = 0; i < 100; i++) {
        t1 = t1.pushBack(i);
      }
      expect(t1.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(t1.get(i)).toBe(i);
      }
    });

    it('should handle large number of pushFront', () => {
      let t1 = new FingerTree2<number>();
      for (let i = 0; i < 100; i++) {
        t1 = t1.pushFront(i);
      }
      expect(t1.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(t1.get(i)).toBe(99 - i);
      }
    });

    it('should handle large number of popFront', () => {
      let t1 = new FingerTree2<number>();
      for (let i = 0; i < 100; i++) {
        t1 = t1.pushBack(i);
      }
      expect(t1.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        t1 = t1.popFront();
        expect(t1.size).toBe(99 - i);
      }
      expect(t1.isEmpty).toBe(true);
    });

    it('should handle large number of popBack', () => {
      let t1 = new FingerTree2<number>();
      for (let i = 0; i < 100; i++) {
        t1 = t1.pushBack(i);
      }
      expect(t1.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        t1 = t1.popBack();
        expect(t1.size).toBe(99 - i);
      }
      expect(t1.isEmpty).toBe(true);
    });

    it('should handle strings with special characters', () => {
      const strTree = new FingerTree2<string>();
      const t1 = strTree.pushBack('hello').pushBack('world').pushBack('!');
      expect(t1.toArray()).toEqual(['hello', 'world', '!']);
      expect(t1.front()).toBe('hello');
      expect(t1.back()).toBe('!');
    });

    it('should handle null values', () => {
      const t1 = new FingerTree2<number | null>();
      const populated = FingerTree2.fromArray<number | null>([1, null, 2, null, 3]);
      expect(populated.toArray()).toEqual([1, null, 2, null, 3]);
      expect(populated.size).toBe(5);
      expect(populated.get(1)).toBe(null);
      expect(populated.get(3)).toBe(null);
    });

    it('should handle undefined values', () => {
      const t1 = new FingerTree2<number | undefined>();
      const populated = FingerTree2.fromArray<number | undefined>([1, undefined, 2, undefined, 3]);
      expect(populated.toArray()).toEqual([1, undefined, 2, undefined, 3]);
      expect(populated.size).toBe(5);
      expect(populated.get(1)).toBe(undefined);
      expect(populated.get(3)).toBe(undefined);
    });

    it('should handle mixed types', () => {
      const t1 = new FingerTree2<number | string | boolean>();
      const populated = FingerTree2.fromArray<number | string | boolean>([1, 'a', true, 2, 'b', false]);
      expect(populated.toArray()).toEqual([1, 'a', true, 2, 'b', false]);
      expect(populated.size).toBe(6);
    });
  });

  describe('concat performance', () => {
    it('should concatenate many small trees', () => {
      let t1 = new FingerTree2<number>();
      for (let i = 0; i < 10; i++) {
        const t2 = new FingerTree2<number>([i, i + 1]);
        t1 = t1.concat(t2);
      }
      expect(t1.size).toBe(20);
      expect(t1.toArray().length).toBe(20);
    });

    it('should concatenate large trees', () => {
      const t1 = new FingerTree2<number>(Array.from({ length: 50 }, (_, i) => i));
      const t2 = new FingerTree2<number>(Array.from({ length: 50 }, (_, i) => i + 50));
      const t3 = t1.concat(t2);
      expect(t3.size).toBe(100);
      expect(t3.get(0)).toBe(0);
      expect(t3.get(99)).toBe(99);
    });
  });

  describe('split performance', () => {
    it('should split large tree multiple times', () => {
      const t1 = new FingerTree2<number>(Array.from({ length: 100 }, (_, i) => i));
      const [left, right] = t1.split(50);
      expect(left.size).toBe(50);
      expect(right.size).toBe(50);
      expect(left.get(49)).toBe(49);
      expect(right.get(0)).toBe(50);
    });

    it('should split at various positions', () => {
      const t1 = new FingerTree2<number>(Array.from({ length: 100 }, (_, i) => i));
      for (let splitPoint = 0; splitPoint <= 100; splitPoint += 10) {
        const [left, right] = t1.split(splitPoint);
        expect(left.size).toBe(splitPoint);
        expect(right.size).toBe(100 - splitPoint);
      }
    });
  });

  describe('chained operations', () => {
    it('should handle many pushBack operations', () => {
      let t1 = new FingerTree2<number>();
      for (let i = 0; i < 1000; i++) {
        t1 = t1.pushBack(i);
      }
      expect(t1.size).toBe(1000);
      expect(t1.get(0)).toBe(0);
      expect(t1.get(999)).toBe(999);
    });

    it('should handle many pushFront operations', () => {
      let t1 = new FingerTree2<number>();
      for (let i = 0; i < 1000; i++) {
        t1 = t1.pushFront(i);
      }
      expect(t1.size).toBe(1000);
      expect(t1.get(0)).toBe(999);
      expect(t1.get(999)).toBe(0);
    });

    it('should handle mixed operations', () => {
      let t1 = new FingerTree2<number>();
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          t1 = t1.pushBack(i);
        } else {
          t1 = t1.pushFront(i);
        }
      }
      expect(t1.size).toBe(100);
      const arr = t1.toArray();
      expect(arr.length).toBe(100);
    });
  });

  describe('map and filter chain', () => {
    it('should map then filter', () => {
      const t1 = FingerTree2.fromArray([1, 2, 3, 4, 5, 6]);
      const t2 = t1.map((value) => value * 2);
      const t3 = FingerTree2.fromArray(t2.toArray().filter((value) => value % 4 === 0));
      expect(t3.toArray()).toEqual([4, 8, 12]);
    });

    it('should map to string then filter', () => {
      const t1 = FingerTree2.fromArray([1, 2, 3, 4, 5]);
      const t2 = t1.map((value) => String(value));
      const t3 = FingerTree2.fromArray(t2.toArray().filter((value) => parseInt(value) % 2 === 0));
      expect(t3.toArray()).toEqual(['2', '4']);
    });
  });
});
