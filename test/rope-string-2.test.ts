import { describe, it, expect } from 'vitest';
import { RopeString2 } from '../src/core/rope-string-2/index.js';

describe('RopeString2', () => {
  describe('constructor', () => {
    it.skip('should create empty rope', () => {
      const rope = new RopeString2();
      expect(rope.length).toBe(0);
      expect(rope.toString()).toBe('');
    });

    it('should create rope from string', () => {
      const rope = new RopeString2('hello');
      expect(rope.length).toBe(5);
      expect(rope.toString()).toBe('hello');
    });

    it('should create rope from empty string', () => {
      const rope = new RopeString2('');
      expect(rope.length).toBe(0);
      expect(rope.toString()).toBe('');
    });

    it('should create rope from long string', () => {
      const str = 'a'.repeat(1000);
      const rope = new RopeString2(str);
      expect(rope.length).toBe(1000);
      expect(rope.toString()).toBe(str);
    });
  });

  describe('insert', () => {
    it('should insert at beginning', () => {
      const rope = new RopeString2('world');
      rope.insert(0, 'hello ');
      expect(rope.toString()).toBe('hello world');
      expect(rope.length).toBe(11);
    });

    it('should insert at end', () => {
      const rope = new RopeString2('hello');
      rope.insert(5, ' world');
      expect(rope.toString()).toBe('hello world');
      expect(rope.length).toBe(11);
    });

    it('should insert in middle', () => {
      const rope = new RopeString2('helloworld');
      rope.insert(5, ' ');
      expect(rope.toString()).toBe('hello world');
      expect(rope.length).toBe(11);
    });

    it('should handle empty string insert', () => {
      const rope = new RopeString2('hello');
      rope.insert(2, '');
      expect(rope.toString()).toBe('hello');
      expect(rope.length).toBe(5);
    });

    it('should insert into empty rope', () => {
      const rope = new RopeString2();
      rope.insert(0, 'hello');
      expect(rope.toString()).toBe('hello');
      expect(rope.length).toBe(5);
    });
  });

  describe('delete', () => {
    it('should delete from beginning', () => {
      const rope = new RopeString2('hello world');
      rope.delete(0, 6);
      expect(rope.toString()).toBe('world');
      expect(rope.length).toBe(5);
    });

    it('should delete from end', () => {
      const rope = new RopeString2('hello world');
      rope.delete(6, 11);
      expect(rope.toString()).toBe('hello ');
      expect(rope.length).toBe(6);
    });

    it('should delete from middle', () => {
      const rope = new RopeString2('hello world');
      rope.delete(5, 6);
      expect(rope.toString()).toBe('helloworld');
      expect(rope.length).toBe(10);
    });

    it('should delete entire string', () => {
      const rope = new RopeString2('hello');
      rope.delete(0, 5);
      expect(rope.toString()).toBe('');
      expect(rope.length).toBe(0);
    });

    it('should handle invalid range', () => {
      const rope = new RopeString2('hello');
      rope.delete(10, 15);
      expect(rope.toString()).toBe('hello');
      expect(rope.length).toBe(5);
    });

    it('should handle empty range', () => {
      const rope = new RopeString2('hello');
      rope.delete(2, 2);
      expect(rope.toString()).toBe('hello');
      expect(rope.length).toBe(5);
    });
  });

  describe('charAt', () => {
    it('should return character at index', () => {
      const rope = new RopeString2('hello');
      expect(rope.charAt(0)).toBe('h');
      expect(rope.charAt(4)).toBe('o');
    });

    it('should handle long string', () => {
      const str = 'a'.repeat(500) + 'b' + 'c'.repeat(500);
      const rope = new RopeString2(str);
      expect(rope.charAt(500)).toBe('b');
      expect(rope.charAt(0)).toBe('a');
      expect(rope.charAt(1000)).toBe('c');
    });

    it('should throw on out of bounds', () => {
      const rope = new RopeString2('hello');
      expect(() => rope.charAt(5)).toThrow('Index out of bounds');
      expect(() => rope.charAt(-1)).toThrow('Index out of bounds');
    });

    it('should throw on empty rope', () => {
      const rope = new RopeString2();
      expect(() => rope.charAt(0)).toThrow('Index out of bounds');
    });
  });

  describe('substring', () => {
    it('should return substring from start', () => {
      const rope = new RopeString2('hello world');
      expect(rope.substring(0, 5)).toBe('hello');
    });

    it('should return substring from middle', () => {
      const rope = new RopeString2('hello world');
      expect(rope.substring(6, 11)).toBe('world');
    });

    it('should handle entire string', () => {
      const rope = new RopeString2('hello');
      expect(rope.substring(0, 5)).toBe('hello');
    });

    it('should handle empty result', () => {
      const rope = new RopeString2('hello');
      expect(rope.substring(2, 2)).toBe('');
    });

    it('should handle negative from', () => {
      const rope = new RopeString2('hello');
      expect(rope.substring(-5, 3)).toBe('hel');
    });

    it('should handle to beyond length', () => {
      const rope = new RopeString2('hello');
      expect(rope.substring(3, 100)).toBe('lo');
    });

    it('should handle empty rope', () => {
      const rope = new RopeString2();
      expect(rope.substring(0, 5)).toBe('');
    });
  });

  describe('toString', () => {
    it('should return empty string for empty rope', () => {
      const rope = new RopeString2();
      expect(rope.toString()).toBe('');
    });

    it('should return original string', () => {
      const rope = new RopeString2('hello world');
      expect(rope.toString()).toBe('hello world');
    });

    it('should return string after operations', () => {
      const rope = new RopeString2('hello');
      rope.insert(5, ' world');
      rope.delete(0, 6);
      expect(rope.toString()).toBe('world');
    });
  });

  describe('concat', () => {
    it('should concat two ropes', () => {
      const rope1 = new RopeString2('hello ');
      const rope2 = new RopeString2('world');
      const result = rope1.concat(rope2);
      expect(result.toString()).toBe('hello world');
      expect(result.length).toBe(11);
    });

    it('should not modify original ropes', () => {
      const rope1 = new RopeString2('hello');
      const rope2 = new RopeString2('world');
      rope1.concat(rope2);
      expect(rope1.toString()).toBe('hello');
      expect(rope2.toString()).toBe('world');
    });

    it('should handle empty rope', () => {
      const rope1 = new RopeString2('hello');
      const rope2 = new RopeString2();
      const result = rope1.concat(rope2);
      expect(result.toString()).toBe('hello');
    });

    it('should handle both empty ropes', () => {
      const rope1 = new RopeString2();
      const rope2 = new RopeString2();
      const result = rope1.concat(rope2);
      expect(result.toString()).toBe('');
    });
  });

  describe('split', () => {
    it('should split rope at index', () => {
      const rope = new RopeString2('hello world');
      const [left, right] = rope.split(5);
      expect(left.toString()).toBe('hello');
      expect(right.toString()).toBe(' world');
      expect(left.length).toBe(5);
      expect(right.length).toBe(6);
    });

    it('should split at beginning', () => {
      const rope = new RopeString2('hello');
      const [left, right] = rope.split(0);
      expect(left.toString()).toBe('');
      expect(right.toString()).toBe('hello');
    });

    it('should split at end', () => {
      const rope = new RopeString2('hello');
      const [left, right] = rope.split(5);
      expect(left.toString()).toBe('hello');
      expect(right.toString()).toBe('');
    });

    it('should split empty rope', () => {
      const rope = new RopeString2();
      const [left, right] = rope.split(0);
      expect(left.toString()).toBe('');
      expect(right.toString()).toBe('');
    });

    it('should not modify original rope', () => {
      const rope = new RopeString2('hello');
      rope.split(2);
      expect(rope.toString()).toBe('hello');
    });
  });

  describe('indexOf', () => {
    it('should find substring at start', () => {
      const rope = new RopeString2('hello world');
      expect(rope.indexOf('hello')).toBe(0);
    });

    it('should find substring in middle', () => {
      const rope = new RopeString2('hello world');
      expect(rope.indexOf('world')).toBe(6);
    });

    it('should return -1 for not found', () => {
      const rope = new RopeString2('hello');
      expect(rope.indexOf('xyz')).toBe(-1);
    });

    it('should return -1 for empty string', () => {
      const rope = new RopeString2('hello');
      expect(rope.indexOf('')).toBe(-1);
    });

    it('should return -1 for empty rope', () => {
      const rope = new RopeString2();
      expect(rope.indexOf('hello')).toBe(-1);
    });

    it('should find single character', () => {
      const rope = new RopeString2('hello');
      expect(rope.indexOf('e')).toBe(1);
    });

    it('should handle long string search', () => {
      const str = 'a'.repeat(500) + 'target' + 'b'.repeat(500);
      const rope = new RopeString2(str);
      expect(rope.indexOf('target')).toBe(500);
    });
  });

  describe('length getter', () => {
    it('should return 0 for empty rope', () => {
      const rope = new RopeString2();
      expect(rope.length).toBe(0);
    });

    it('should return correct length after construction', () => {
      const rope = new RopeString2('hello');
      expect(rope.length).toBe(5);
    });

    it('should update after insert', () => {
      const rope = new RopeString2('hello');
      rope.insert(5, ' world');
      expect(rope.length).toBe(11);
    });

    it('should update after delete', () => {
      const rope = new RopeString2('hello world');
      rope.delete(0, 6);
      expect(rope.length).toBe(5);
    });
  });

  describe('complex operations', () => {
    it('should handle multiple inserts and deletes', () => {
      const rope = new RopeString2();
      rope.insert(0, 'hello');
      rope.insert(5, ' ');
      rope.insert(6, 'world');
      rope.delete(0, 6);
      expect(rope.toString()).toBe('world');
      expect(rope.length).toBe(5);
    });

    it('should handle split and concat', () => {
      const rope = new RopeString2('hello world');
      const [left, right] = rope.split(5);
      const result = left.concat(right);
      expect(result.toString()).toBe('hello world');
    });

    it('should handle long string with multiple operations', () => {
      const rope = new RopeString2('a'.repeat(1000));
      rope.insert(500, 'b'.repeat(100));
      rope.delete(200, 300);
      expect(rope.length).toBe(1100);
      expect(rope.charAt(500)).toBe('b');
    });
  });
});
