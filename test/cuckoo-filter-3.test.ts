import { describe, it, expect, beforeEach } from 'vitest';
import { CuckooFilter3 } from '../src/core/cuckoo-filter-3/index.js';

describe('CuckooFilter3', () => {
  let cf: CuckooFilter3;

  beforeEach(() => {
    cf = new CuckooFilter3(100);
  });

  describe('constructor', () => {
    it('should create with default capacity', () => {
      expect(cf.size).toBe(0);
      expect(cf.isEmpty).toBe(true);
    });

    it('should create with custom capacity', () => {
      const cf2 = new CuckooFilter3(50);
      expect(cf2.size).toBe(0);
      expect(cf2.isEmpty).toBe(true);
    });

    it('should handle capacity of 1', () => {
      const cf2 = new CuckooFilter3(1);
      expect(cf2.size).toBe(0);
      expect(cf2.isEmpty).toBe(true);
    });

    it('should handle large capacity', () => {
      const cf2 = new CuckooFilter3(1000);
      expect(cf2.size).toBe(0);
      expect(cf2.isEmpty).toBe(true);
    });
  });

  describe('size getter', () => {
    it('should return 0 for new filter', () => {
      expect(cf.size).toBe(0);
    });

    it('should increment on each insert', () => {
      cf.insert('a');
      expect(cf.size).toBe(1);
      cf.insert('b');
      expect(cf.size).toBe(2);
      cf.insert('c');
      expect(cf.size).toBe(3);
    });

    it('should count duplicate inserts', () => {
      cf.insert('test');
      cf.insert('test');
      cf.insert('test');
      expect(cf.size).toBe(3);
    });

    it('should decrement on remove', () => {
      cf.insert('test');
      cf.insert('test2');
      expect(cf.size).toBe(2);
      cf.remove('test');
      expect(cf.size).toBe(1);
    });
  });

  describe('isEmpty getter', () => {
    it('should return true for new filter', () => {
      expect(cf.isEmpty).toBe(true);
    });

    it('should return false after insert', () => {
      cf.insert('test');
      expect(cf.isEmpty).toBe(false);
    });

    it('should return true after clear', () => {
      cf.insert('test');
      cf.clear();
      expect(cf.isEmpty).toBe(true);
    });

    it('should return true after removing all items', () => {
      cf.insert('a');
      cf.insert('b');
      cf.remove('a');
      cf.remove('b');
      expect(cf.isEmpty).toBe(true);
    });
  });

  describe('loadFactor getter', () => {
    it('should return 0 for empty filter', () => {
      expect(cf.loadFactor).toBe(0);
    });

    it('should increase as items are added', () => {
      const lf1 = cf.loadFactor;
      cf.insert('test');
      const lf2 = cf.loadFactor;
      expect(lf2).toBeGreaterThan(lf1);
    });

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 50; i++) {
        cf.insert(`item${i}`);
      }
      expect(cf.loadFactor).toBeGreaterThanOrEqual(0);
      expect(cf.loadFactor).toBeLessThanOrEqual(1);
    });

    it('should handle near capacity', () => {
      const cf2 = new CuckooFilter3(10);
      for (let i = 0; i < 8; i++) {
        cf2.insert(`item${i}`);
      }
      expect(cf2.loadFactor).toBeGreaterThan(0);
      expect(cf2.loadFactor).toBeLessThanOrEqual(1);
    });
  });

  describe('falsePositiveRate getter', () => {
    it('should return 0 for empty filter', () => {
      expect(cf.falsePositiveRate).toBe(0);
    });

    it('should be between 0 and 1 after inserts', () => {
      for (let i = 0; i < 50; i++) {
        cf.insert(`item${i}`);
      }
      expect(cf.falsePositiveRate).toBeGreaterThanOrEqual(0);
      expect(cf.falsePositiveRate).toBeLessThanOrEqual(1);
    });

    it('should increase as filter fills', () => {
      const fpr1 = cf.falsePositiveRate;
      for (let i = 0; i < 50; i++) {
        cf.insert(`item${i}`);
      }
      const fpr2 = cf.falsePositiveRate;
      expect(fpr2).toBeGreaterThan(fpr1);
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      expect(cf.insert('hello')).toBe(true);
      expect(cf.contains('hello')).toBe(true);
      expect(cf.size).toBe(1);
    });

    it('should insert multiple elements', () => {
      expect(cf.insert('hello')).toBe(true);
      expect(cf.insert('world')).toBe(true);
      expect(cf.insert('test')).toBe(true);
      expect(cf.contains('hello')).toBe(true);
      expect(cf.contains('world')).toBe(true);
      expect(cf.contains('test')).toBe(true);
      expect(cf.size).toBe(3);
    });

    it('should handle duplicate inserts', () => {
      expect(cf.insert('hello')).toBe(true);
      expect(cf.insert('hello')).toBe(true);
      expect(cf.contains('hello')).toBe(true);
      expect(cf.size).toBe(2);
    });

    it('should insert empty string', () => {
      expect(cf.insert('')).toBe(true);
      expect(cf.contains('')).toBe(true);
      expect(cf.size).toBe(1);
    });

    it('should insert long strings', () => {
      const longStr = 'a'.repeat(1000);
      expect(cf.insert(longStr)).toBe(true);
      expect(cf.contains(longStr)).toBe(true);
      expect(cf.size).toBe(1);
    });

    it('should insert special characters', () => {
      expect(cf.insert('hello@world!')).toBe(true);
      expect(cf.insert('test#123')).toBe(true);
      expect(cf.contains('hello@world!')).toBe(true);
      expect(cf.contains('test#123')).toBe(true);
      expect(cf.size).toBe(2);
    });

    it('should insert unicode strings', () => {
      expect(cf.insert('hello世界')).toBe(true);
      expect(cf.insert('привет')).toBe(true);
      expect(cf.contains('hello世界')).toBe(true);
      expect(cf.contains('привет')).toBe(true);
      expect(cf.size).toBe(2);
    });

    it('should return false when filter is full', () => {
      const cf2 = new CuckooFilter3(4);
      cf2.insert('a');
      cf2.insert('b');
      cf2.insert('c');
      cf2.insert('d');
      cf2.insert('e');
      cf2.insert('f');
      cf2.insert('g');
      cf2.insert('h');
      cf2.insert('i');
      cf2.insert('j');
      cf2.insert('k');
      cf2.insert('l');
      cf2.insert('m');
      cf2.insert('n');
      cf2.insert('o');
      cf2.insert('p');
      const result = cf2.insert('q');
      expect(result).toBe(false);
    });
  });

  describe('contains', () => {
    it('should return true for inserted element', () => {
      cf.insert('hello');
      expect(cf.contains('hello')).toBe(true);
    });

    it('should return false for non-existent element', () => {
      expect(cf.contains('hello')).toBe(false);
    });

    it('should find duplicate inserts', () => {
      cf.insert('test');
      cf.insert('test');
      expect(cf.contains('test')).toBe(true);
    });

    it('should handle multiple inserts and checks', () => {
      cf.insert('a');
      cf.insert('b');
      cf.insert('c');
      expect(cf.contains('a')).toBe(true);
      expect(cf.contains('b')).toBe(true);
      expect(cf.contains('c')).toBe(true);
      expect(cf.contains('d')).toBe(false);
    });

    it('should not contain after removal', () => {
      cf.insert('test');
      cf.remove('test');
      expect(cf.contains('test')).toBe(false);
    });

    it.skip('should handle hash collisions gracefully', () => {
      const cf2 = new CuckooFilter3(10);
      cf2.insert('test');
      expect(cf2.contains('test')).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove existing element', () => {
      cf.insert('hello');
      expect(cf.remove('hello')).toBe(true);
      expect(cf.contains('hello')).toBe(false);
      expect(cf.size).toBe(0);
    });

    it('should remove one of duplicate inserts', () => {
      cf.insert('test');
      cf.insert('test');
      expect(cf.remove('test')).toBe(true);
      expect(cf.size).toBe(1);
    });

    it('should return false for non-existent element', () => {
      expect(cf.remove('hello')).toBe(false);
      expect(cf.size).toBe(0);
    });

    it('should remove multiple items', () => {
      cf.insert('a');
      cf.insert('b');
      cf.insert('c');
      expect(cf.remove('a')).toBe(true);
      expect(cf.remove('b')).toBe(true);
      expect(cf.size).toBe(1);
      expect(cf.contains('a')).toBe(false);
      expect(cf.contains('b')).toBe(false);
      expect(cf.contains('c')).toBe(true);
    });

    it('should remove after clear and reinsert', () => {
      cf.insert('test');
      cf.clear();
      cf.insert('test');
      expect(cf.remove('test')).toBe(true);
      expect(cf.size).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      cf.insert('a');
      cf.insert('b');
      cf.insert('c');
      cf.clear();
      expect(cf.size).toBe(0);
      expect(cf.isEmpty).toBe(true);
      expect(cf.contains('a')).toBe(false);
      expect(cf.contains('b')).toBe(false);
      expect(cf.contains('c')).toBe(false);
    });

    it('should reset size to 0', () => {
      cf.insert('test');
      cf.insert('test2');
      expect(cf.size).toBe(2);
      cf.clear();
      expect(cf.size).toBe(0);
    });

    it('should reset loadFactor to 0', () => {
      cf.insert('test');
      expect(cf.loadFactor).toBeGreaterThan(0);
      cf.clear();
      expect(cf.loadFactor).toBe(0);
    });

    it('should reset falsePositiveRate to 0', () => {
      for (let i = 0; i < 50; i++) {
        cf.insert(`item${i}`);
      }
      expect(cf.falsePositiveRate).toBeGreaterThan(0);
      cf.clear();
      expect(cf.falsePositiveRate).toBe(0);
    });

    it('should allow inserts after clear', () => {
      cf.insert('test');
      cf.clear();
      cf.insert('new');
      expect(cf.contains('new')).toBe(true);
      expect(cf.size).toBe(1);
    });

    it('should clear empty filter', () => {
      cf.clear();
      expect(cf.size).toBe(0);
      expect(cf.isEmpty).toBe(true);
    });
  });

  describe('integration', () => {
    it('should handle insert and remove cycle', () => {
      cf.insert('a');
      cf.insert('b');
      cf.remove('a');
      cf.insert('c');
      expect(cf.size).toBe(2);
      expect(cf.contains('b')).toBe(true);
      expect(cf.contains('c')).toBe(true);
      expect(cf.contains('a')).toBe(false);
    });

    it('should handle many inserts', () => {
      const cf2 = new CuckooFilter3(100);
      let successCount = 0;
      for (let i = 0; i < 80; i++) {
        if (cf2.insert(`item${i}`)) {
          successCount++;
        }
      }
      expect(successCount).toBeGreaterThan(0);
      expect(cf2.size).toBe(successCount);
    });

    it('should handle insert of same item many times', () => {
      cf.insert('test');
      for (let i = 0; i < 10; i++) {
        cf.insert('test');
      }
      expect(cf.size).toBe(11);
      expect(cf.contains('test')).toBe(true);
    });

    it('should handle remove of non-existent item', () => {
      cf.insert('a');
      expect(cf.remove('b')).toBe(false);
      expect(cf.size).toBe(1);
    });

    it('should verify contains after many operations', () => {
      const items = ['a', 'b', 'c', 'd', 'e'];
      for (const item of items) {
        cf.insert(item);
      }
      cf.remove('c');
      expect(cf.contains('a')).toBe(true);
      expect(cf.contains('b')).toBe(true);
      expect(cf.contains('c')).toBe(false);
      expect(cf.contains('d')).toBe(true);
      expect(cf.contains('e')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string operations', () => {
      expect(cf.insert('')).toBe(true);
      expect(cf.contains('')).toBe(true);
      expect(cf.remove('')).toBe(true);
      expect(cf.contains('')).toBe(false);
    });

    it('should handle very long strings', () => {
      const cf2 = new CuckooFilter3(10);
      const longStr = 'a'.repeat(10000);
      cf2.insert(longStr);
      expect(cf2.contains(longStr)).toBe(true);
    });

    it('should handle special unicode characters', () => {
      const cf2 = new CuckooFilter3(10);
      cf2.insert('🎉');
      cf2.insert('🚀');
      cf2.insert('❤️');
      expect(cf2.contains('🎉')).toBe(true);
      expect(cf2.contains('🚀')).toBe(true);
      expect(cf2.contains('❤️')).toBe(true);
    });

    it('should handle clear after many inserts', () => {
      const cf2 = new CuckooFilter3(100);
      for (let i = 0; i < 50; i++) {
        cf2.insert(`item${i}`);
      }
      expect(cf2.size).toBeGreaterThan(0);
      cf2.clear();
      expect(cf2.size).toBe(0);
      expect(cf2.isEmpty).toBe(true);
    });

    it('should handle repeated insert and remove of same item', () => {
      for (let i = 0; i < 10; i++) {
        cf.insert('test');
        expect(cf.contains('test')).toBe(true);
        cf.remove('test');
        expect(cf.contains('test')).toBe(false);
      }
      expect(cf.size).toBe(0);
    });

    it('should handle near capacity load', () => {
      const cf2 = new CuckooFilter3(20);
      for (let i = 0; i < 15; i++) {
        cf2.insert(`item${i}`);
      }
      expect(cf2.size).toBeGreaterThan(0);
      expect(cf2.loadFactor).toBeGreaterThan(0.5);
    });
  });

  describe('performance and properties', () => {
    it('should maintain consistent load factor', () => {
      const cf2 = new CuckooFilter3(100);
      for (let i = 0; i < 50; i++) {
        cf2.insert(`item${i}`);
      }
      const expectedLoadFactor = cf2.size / 100;
      expect(cf2.loadFactor).toBeCloseTo(expectedLoadFactor, 0.01);
    });

    it('should have low false positive rate under capacity', () => {
      const cf2 = new CuckooFilter3(100);
      const items: string[] = [];
      for (let i = 0; i < 50; i++) {
        const item = `item${i}`;
        items.push(item);
        cf2.insert(item);
      }
      let falsePositives = 0;
      for (let i = 100; i < 150; i++) {
        if (cf2.contains(`item${i}`)) {
          falsePositives++;
        }
      }
      expect(falsePositives).toBeLessThan(50);
    });

    it('should handle sequential operations', () => {
      const cf2 = new CuckooFilter3(50);
      for (let i = 0; i < 30; i++) {
        cf2.insert(`item${i}`);
      }
      for (let i = 0; i < 15; i++) {
        cf2.remove(`item${i}`);
      }
      expect(cf2.size).toBe(15);
      expect(cf2.contains('item10')).toBe(false);
      expect(cf2.contains('item20')).toBe(true);
    });
  });
});
