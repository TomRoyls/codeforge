import { describe, it, expect } from 'vitest';
import { Rope } from '../src/core/rope';

describe('Rope', () => {
  describe('empty rope', () => {
    it('should create empty rope', () => {
      const rope = new Rope();
      expect(rope.length).toBe(0);
      expect(rope.toString()).toBe('');
    });

    it('should create rope with empty string', () => {
      const rope = new Rope('');
      expect(rope.length).toBe(0);
      expect(rope.toString()).toBe('');
    });

    it('should return empty string for charAt on empty rope', () => {
      const rope = new Rope();
      expect(rope.charAt(0)).toBe('');
    });

    it('should return -1 for indexOf on empty rope', () => {
      const rope = new Rope();
      expect(rope.indexOf('a')).toBe(-1);
    });

    it('should return empty string for substring on empty rope', () => {
      const rope = new Rope();
      expect(rope.substring(0, 10)).toBe('');
    });

    it('should return empty string for delete on empty rope', () => {
      const rope = new Rope();
      expect(rope.delete(0, 10)).toBe('');
      expect(rope.length).toBe(0);
    });
  });

  describe('constructor with value', () => {
    it('should create rope with string value', () => {
      const rope = new Rope('hello');
      expect(rope.length).toBe(5);
      expect(rope.toString()).toBe('hello');
    });

    it('should create rope with long string', () => {
      const rope = new Rope('This is a longer test string');
      expect(rope.length).toBe(28);
      expect(rope.toString()).toBe('This is a longer test string');
    });
  });

  describe('insert', () => {
    it('should insert at beginning', () => {
      const rope = new Rope('world');
      rope.insert(0, 'hello ');
      expect(rope.toString()).toBe('hello world');
      expect(rope.length).toBe(11);
    });

    it('should insert at end', () => {
      const rope = new Rope('hello');
      rope.insert(5, ' world');
      expect(rope.toString()).toBe('hello world');
      expect(rope.length).toBe(11);
    });

    it('should insert in middle', () => {
      const rope = new Rope('helloworld');
      rope.insert(5, ' ');
      expect(rope.toString()).toBe('hello world');
      expect(rope.length).toBe(11);
    });

    it('should insert multiple times', () => {
      const rope = new Rope('');
      rope.insert(0, 'hello');
      rope.insert(5, ' ');
      rope.insert(6, 'world');
      expect(rope.toString()).toBe('hello world');
      expect(rope.length).toBe(11);
    });

    it('should insert empty string', () => {
      const rope = new Rope('hello');
      rope.insert(2, '');
      expect(rope.toString()).toBe('hello');
      expect(rope.length).toBe(5);
    });

    it('should handle negative index', () => {
      const rope = new Rope('world');
      rope.insert(-1, 'hello ');
      expect(rope.toString()).toBe('hello world');
    });

    it('should handle index beyond length', () => {
      const rope = new Rope('hello');
      rope.insert(100, ' world');
      expect(rope.toString()).toBe('hello world');
    });
  });

  describe('delete', () => {
    it('should delete from beginning', () => {
      const rope = new Rope('hello world');
      const deleted = rope.delete(0, 6);
      expect(deleted).toBe('hello ');
      expect(rope.toString()).toBe('world');
      expect(rope.length).toBe(5);
    });

    it('should delete from end', () => {
      const rope = new Rope('hello world');
      const deleted = rope.delete(6, 11);
      expect(deleted).toBe('world');
      expect(rope.toString()).toBe('hello ');
      expect(rope.length).toBe(6);
    });

    it('should delete from middle', () => {
      const rope = new Rope('hello world');
      const deleted = rope.delete(5, 6);
      expect(deleted).toBe(' ');
      expect(rope.toString()).toBe('helloworld');
      expect(rope.length).toBe(10);
    });

    it('should delete entire string', () => {
      const rope = new Rope('hello');
      const deleted = rope.delete(0, 5);
      expect(deleted).toBe('hello');
      expect(rope.toString()).toBe('');
      expect(rope.length).toBe(0);
    });

    it('should handle negative start', () => {
      const rope = new Rope('hello');
      const deleted = rope.delete(-1, 2);
      expect(deleted).toBe('he');
      expect(rope.toString()).toBe('llo');
    });

    it('should handle end beyond length', () => {
      const rope = new Rope('hello');
      const deleted = rope.delete(3, 100);
      expect(deleted).toBe('lo');
      expect(rope.toString()).toBe('hel');
    });

    it('should return empty string when start >= end', () => {
      const rope = new Rope('hello');
      const deleted = rope.delete(3, 3);
      expect(deleted).toBe('');
      expect(rope.toString()).toBe('hello');
    });
  });

  describe('substring', () => {
    it('should get substring from beginning', () => {
      const rope = new Rope('hello world');
      expect(rope.substring(0, 5)).toBe('hello');
    });

    it('should get substring from end', () => {
      const rope = new Rope('hello world');
      expect(rope.substring(6, 11)).toBe('world');
    });

    it('should get substring from middle', () => {
      const rope = new Rope('hello world');
      expect(rope.substring(4, 9)).toBe('o wor');
    });

    it('should get entire string', () => {
      const rope = new Rope('hello world');
      expect(rope.substring(0, 11)).toBe('hello world');
    });

    it('should handle empty substring', () => {
      const rope = new Rope('hello');
      expect(rope.substring(2, 2)).toBe('');
    });

    it('should handle negative start', () => {
      const rope = new Rope('hello');
      expect(rope.substring(-1, 3)).toBe('hel');
    });

    it('should handle end beyond length', () => {
      const rope = new Rope('hello');
      expect(rope.substring(3, 100)).toBe('lo');
    });
  });

  describe('charAt', () => {
    it('should get character at index', () => {
      const rope = new Rope('hello');
      expect(rope.charAt(0)).toBe('h');
      expect(rope.charAt(4)).toBe('o');
    });

    it('should get all characters', () => {
      const rope = new Rope('hello world');
      for (let i = 0; i < rope.length; i++) {
        expect(rope.charAt(i)).toBe('hello world'[i]!);
      }
    });

    it('should return empty string for negative index', () => {
      const rope = new Rope('hello');
      expect(rope.charAt(-1)).toBe('');
    });

    it('should return empty string for index beyond length', () => {
      const rope = new Rope('hello');
      expect(rope.charAt(100)).toBe('');
    });

    it('should return empty string for empty rope', () => {
      const rope = new Rope();
      expect(rope.charAt(0)).toBe('');
    });
  });

  describe('indexOf', () => {
    it('should find substring', () => {
      const rope = new Rope('hello world');
      expect(rope.indexOf('hello')).toBe(0);
      expect(rope.indexOf('world')).toBe(6);
      expect(rope.indexOf('o')).toBe(4);
    });

    it('should return -1 for not found', () => {
      const rope = new Rope('hello');
      expect(rope.indexOf('x')).toBe(-1);
      expect(rope.indexOf('xyz')).toBe(-1);
    });

    it('should search from index', () => {
      const rope = new Rope('hello hello');
      expect(rope.indexOf('hello', 0)).toBe(0);
      expect(rope.indexOf('hello', 1)).toBe(6);
      expect(rope.indexOf('hello', 6)).toBe(6);
    });

    it('should handle negative fromIndex', () => {
      const rope = new Rope('hello world');
      expect(rope.indexOf('world', -10)).toBe(6);
    });

    it('should handle fromIndex beyond length', () => {
      const rope = new Rope('hello');
      expect(rope.indexOf('h', 100)).toBe(-1);
    });

    it('should find empty string', () => {
      const rope = new Rope('hello');
      expect(rope.indexOf('')).toBe(0);
    });
  });

  describe('concat', () => {
    it('should concatenate two ropes', () => {
      const rope1 = new Rope('hello ');
      const rope2 = new Rope('world');
      const result = rope1.concat(rope2);
      expect(result.toString()).toBe('hello world');
      expect(result.length).toBe(11);
    });

    it('should concatenate with empty rope', () => {
      const rope1 = new Rope('hello');
      const rope2 = new Rope();
      const result = rope1.concat(rope2);
      expect(result.toString()).toBe('hello');
      expect(result.length).toBe(5);
    });

    it('should concatenate empty with rope', () => {
      const rope1 = new Rope();
      const rope2 = new Rope('world');
      const result = rope1.concat(rope2);
      expect(result.toString()).toBe('world');
      expect(result.length).toBe(5);
    });

    it('should not modify original ropes', () => {
      const rope1 = new Rope('hello');
      const rope2 = new Rope('world');
      const result = rope1.concat(rope2);
      expect(rope1.toString()).toBe('hello');
      expect(rope2.toString()).toBe('world');
      expect(result.toString()).toBe('helloworld');
    });

    it('should concatenate multiple times', () => {
      const rope1 = new Rope('a');
      const rope2 = new Rope('b');
      const rope3 = new Rope('c');
      const result = rope1.concat(rope2).concat(rope3);
      expect(result.toString()).toBe('abc');
      expect(result.length).toBe(3);
    });
  });

  describe('split', () => {
    it('should split at index', () => {
      const rope = new Rope('hello world');
      const [left, right] = rope.split(5);
      expect(left.toString()).toBe('hello');
      expect(right.toString()).toBe(' world');
      expect(left.length).toBe(5);
      expect(right.length).toBe(6);
    });

    it('should split at beginning', () => {
      const rope = new Rope('hello');
      const [left, right] = rope.split(0);
      expect(left.toString()).toBe('');
      expect(right.toString()).toBe('hello');
      expect(left.length).toBe(0);
      expect(right.length).toBe(5);
    });

    it('should split at end', () => {
      const rope = new Rope('hello');
      const [left, right] = rope.split(5);
      expect(left.toString()).toBe('hello');
      expect(right.toString()).toBe('');
      expect(left.length).toBe(5);
      expect(right.length).toBe(0);
    });

    it('should handle negative index', () => {
      const rope = new Rope('hello');
      const [left, right] = rope.split(-1);
      expect(left.toString()).toBe('');
      expect(right.toString()).toBe('hello');
    });

    it('should handle index beyond length', () => {
      const rope = new Rope('hello');
      const [left, right] = rope.split(100);
      expect(left.toString()).toBe('hello');
      expect(right.toString()).toBe('');
    });

    it('should split empty rope', () => {
      const rope = new Rope();
      const [left, right] = rope.split(0);
      expect(left.toString()).toBe('');
      expect(right.toString()).toBe('');
      expect(left.length).toBe(0);
      expect(right.length).toBe(0);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty rope', () => {
      const rope = new Rope();
      expect(rope.toString()).toBe('');
    });

    it('should return full string', () => {
      const rope = new Rope('hello world');
      expect(rope.toString()).toBe('hello world');
    });

    it('should return string after operations', () => {
      const rope = new Rope('hello');
      rope.insert(5, ' world');
      rope.delete(5, 6);
      expect(rope.toString()).toBe('helloworld');
    });
  });

  describe('length', () => {
    it('should return 0 for empty rope', () => {
      const rope = new Rope();
      expect(rope.length).toBe(0);
    });

    it('should return correct length', () => {
      const rope = new Rope('hello');
      expect(rope.length).toBe(5);
    });

    it('should update after insert', () => {
      const rope = new Rope('hello');
      rope.insert(5, ' world');
      expect(rope.length).toBe(11);
    });

    it('should update after delete', () => {
      const rope = new Rope('hello world');
      rope.delete(6, 11);
      expect(rope.length).toBe(6);
    });

    it('should return length of concatenated rope', () => {
      const rope1 = new Rope('hello');
      const rope2 = new Rope(' world');
      const result = rope1.concat(rope2);
      expect(result.length).toBe(11);
    });
  });

  describe('rebalance', () => {
    it('should rebalance rope', () => {
      const rope = new Rope('a');
      for (let i = 1; i < 100; i++) {
        rope.insert(rope.length, 'b');
      }
      const beforeDepth = rope.getDepth();
      rope.rebalance();
      const afterDepth = rope.getDepth();
      expect(afterDepth).toBeLessThanOrEqual(beforeDepth);
      expect(rope.toString()).toBe('a' + 'b'.repeat(99));
    });

    it('should not change content after rebalance', () => {
      const rope = new Rope('hello world');
      rope.rebalance();
      expect(rope.toString()).toBe('hello world');
      expect(rope.length).toBe(11);
    });

    it('should handle empty rope', () => {
      const rope = new Rope();
      rope.rebalance();
      expect(rope.toString()).toBe('');
      expect(rope.length).toBe(0);
    });

    it('should rebalance after many operations', () => {
      const rope = new Rope('');
      for (let i = 0; i < 50; i++) {
        rope.insert(0, 'x');
        rope.insert(0, 'y');
      }
      rope.rebalance();
      expect(rope.toString()).toBe('yx'.repeat(50));
      expect(rope.length).toBe(100);
    });
  });

  describe('getDepth', () => {
    it('should return 0 for empty rope', () => {
      const rope = new Rope();
      expect(rope.getDepth()).toBe(0);
    });

    it('should return 1 for single leaf', () => {
      const rope = new Rope('hello');
      expect(rope.getDepth()).toBe(1);
    });

    it('should increase with more insertions', () => {
      const rope = new Rope('a');
      let lastDepth = rope.getDepth();
      for (let i = 0; i < 50; i++) {
        rope.insert(rope.length, 'b');
        const depth = rope.getDepth();
        expect(depth).toBeGreaterThanOrEqual(lastDepth);
        lastDepth = depth;
      }
    });

    it('should decrease after rebalance', () => {
      const rope = new Rope('a');
      for (let i = 0; i < 100; i++) {
        rope.insert(rope.length, 'b');
      }
      const beforeDepth = rope.getDepth();
      rope.rebalance();
      const afterDepth = rope.getDepth();
      expect(afterDepth).toBeLessThanOrEqual(beforeDepth);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return time complexity string', () => {
      const rope = new Rope();
      expect(rope.getTimeComplexity()).toBe('O(log n) for insert/delete/concat, O(n) for toString/indexOf');
    });
  });

  describe('complex operations', () => {
    it('should handle insert and delete sequence', () => {
      const rope = new Rope('');
      rope.insert(0, 'hello');
      rope.insert(5, ' ');
      rope.insert(6, 'world');
      expect(rope.toString()).toBe('hello world');
      rope.delete(5, 6);
      expect(rope.toString()).toBe('helloworld');
      rope.insert(5, ' ');
      expect(rope.toString()).toBe('hello world');
    });

    it('should handle multiple splits and concats', () => {
      const rope = new Rope('hello world test');
      const [left, right] = rope.split(11);
      const [left1, left2] = left.split(5);
      const result = left1.concat(left2).concat(right);
      expect(result.toString()).toBe('hello world test');
    });

    it('should handle substring and indexOf together', () => {
      const rope = new Rope('hello world hello world');
      const sub = rope.substring(6, 11);
      expect(sub).toBe('world');
      expect(rope.indexOf('world', 0)).toBe(6);
      expect(rope.indexOf('world', 7)).toBe(18);
    });
  });

  describe('large strings', () => {
    it('should handle 1000 character string', () => {
      const str = 'a'.repeat(1000);
      const rope = new Rope(str);
      expect(rope.length).toBe(1000);
      expect(rope.toString()).toBe(str);
      expect(rope.charAt(500)).toBe('a');
      expect(rope.substring(100, 200)).toBe('a'.repeat(100));
    });

    it('should handle operations on large string', () => {
      const rope = new Rope('a'.repeat(500));
      rope.insert(250, 'b'.repeat(250));
      rope.delete(125, 375);
      expect(rope.length).toBe(500);
      expect(rope.charAt(124)).toBe('a');
      expect(rope.charAt(125)).toBe('b');
      expect(rope.charAt(249)).toBe('b');
      expect(rope.charAt(250)).toBe('a');
    });

    it('should rebalance large rope efficiently', () => {
      const rope = new Rope('');
      for (let i = 0; i < 1000; i++) {
        rope.insert(0, 'x');
      }
      const beforeDepth = rope.getDepth();
      rope.rebalance();
      const afterDepth = rope.getDepth();
      expect(afterDepth).toBeLessThanOrEqual(beforeDepth);
      expect(rope.length).toBe(1000);
    });
  });

  describe('edge cases', () => {
    it('should handle single character', () => {
      const rope = new Rope('a');
      expect(rope.length).toBe(1);
      expect(rope.charAt(0)).toBe('a');
      expect(rope.toString()).toBe('a');
    });

    it('should handle unicode characters', () => {
      const rope = new Rope('hello 世界 🌍');
      expect(rope.length).toBe(11);
      expect(rope.toString()).toBe('hello 世界 🌍');
      expect(rope.indexOf('世')).toBe(6);
    });

    it('should handle special characters', () => {
      const rope = new Rope('hello\nworld\ttest');
      expect(rope.length).toBe(16);
      expect(rope.toString()).toBe('hello\nworld\ttest');
    });

    it('should handle rapid insertions at same position', () => {
      const rope = new Rope('');
      for (let i = 0; i < 10; i++) {
        rope.insert(0, 'x');
      }
      expect(rope.toString()).toBe('x'.repeat(10));
      expect(rope.length).toBe(10);
    });

    it('should handle insert delete insert sequence', () => {
      const rope = new Rope('abc');
      rope.insert(3, 'def');
      rope.delete(1, 4);
      rope.insert(2, 'xyz');
      expect(rope.toString()).toBe('aexyzf');
    });

    it('should handle multiple indexOf on same rope', () => {
      const rope = new Rope('hello world hello world');
      expect(rope.indexOf('hello')).toBe(0);
      expect(rope.indexOf('hello', 1)).toBe(12);
      expect(rope.indexOf('world')).toBe(6);
      expect(rope.indexOf('world', 7)).toBe(18);
    });

    it('should handle split concat of same rope', () => {
      const rope = new Rope('hello');
      const [left, right] = rope.split(3);
      const result = left.concat(right);
      expect(result.toString()).toBe('hello');
      expect(result.length).toBe(5);
    });
  });

  describe('performance and correctness', () => {
    it('should maintain correct state through many operations', () => {
      const rope = new Rope('');
      for (let i = 0; i < 100; i++) {
        rope.insert(rope.length, 'a');
      }
      expect(rope.length).toBe(100);
      expect(rope.toString()).toBe('a'.repeat(100));

      for (let i = 0; i < 50; i++) {
        rope.delete(0, 1);
      }
      expect(rope.length).toBe(50);
      expect(rope.toString()).toBe('a'.repeat(50));
    });

    it('should handle interleaved operations', () => {
      const rope = new Rope('');
      rope.insert(0, 'ab'.repeat(20));
      expect(rope.length).toBe(40);
      expect(rope.toString()).toBe('ab'.repeat(20));

      for (let i = 0; i < 10; i++) {
        rope.delete(0, 2);
      }
      expect(rope.length).toBe(20);
      expect(rope.toString()).toBe('ab'.repeat(10));
    });
  });
});
