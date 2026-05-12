import type { Equal, Expect } from '@alwatr/type-helper';
import { describe, expect, it } from 'vitest';

import { CuckooFilter3 } from '../../src/core/cuckoo-filter-3';

describe('CuckooFilter3', () => {
  describe('constructor', () => {
    it('should create filter with specified capacity', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.size).toBe(0);
      expect(filter.isEmpty).toBe(true);
    });

    it('should handle small capacity', () => {
      const filter = new CuckooFilter3(1);
      expect(filter.size).toBe(0);
    });

    it('should handle large capacity', () => {
      const filter = new CuckooFilter3(10000);
      expect(filter.size).toBe(0);
    });

    it('should have initial zero load factor', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.loadFactor).toBe(0);
    });

    it('should have zero false positive rate initially', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.falsePositiveRate).toBe(0);
    });
  });

  describe('insert', () => {
    it('should insert single item successfully', () => {
      const filter = new CuckooFilter3(100);
      const result = filter.insert('apple');
      expect(result).toBe(true);
      expect(filter.size).toBe(1);
    });

    it('should insert multiple items', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      expect(filter.size).toBe(3);
    });

    it('should return true for successful insert', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.insert('item')).toBe(true);
    });

    it('should return false when filter is full', () => {
      const filter = new CuckooFilter3(4);
      filter.insert('item1');
      filter.insert('item2');
      filter.insert('item3');
      filter.insert('item4');
      filter.insert('item5');
      filter.insert('item6');
      filter.insert('item7');
      filter.insert('item8');
      filter.insert('item9');
      filter.insert('item10');
      filter.insert('item11');
      filter.insert('item12');
      filter.insert('item13');
      filter.insert('item14');
      filter.insert('item15');
      filter.insert('item16');
      filter.insert('item17');
      filter.insert('item18');
      filter.insert('item19');
      filter.insert('item20');
      const result = filter.insert('overflow');
      expect(result).toBe(false);
    });

    it('should handle empty string', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.insert('')).toBe(true);
    });

    it('should handle long strings', () => {
      const filter = new CuckooFilter3(100);
      const longString = 'a'.repeat(1000);
      expect(filter.insert(longString)).toBe(true);
    });

    it('should handle special characters', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.insert('hello@world.com')).toBe(true);
    });

    it('should handle unicode characters', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.insert('你好世界')).toBe(true);
    });

    it('should handle numbers as strings', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.insert('12345')).toBe(true);
    });

    it('should update load factor after insert', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      expect(filter.loadFactor).toBeGreaterThan(0);
    });

    it('should not be empty after insert', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      expect(filter.isEmpty).toBe(false);
    });

    it('should return true for items inserted in sequence', () => {
      const filter = new CuckooFilter3(20);
      const results: boolean[] = [];
      for (let i = 0; i < 20; i++) {
        results.push(filter.insert(`item${i}`));
      }
      expect(results.filter(r => r).length).toBeGreaterThan(0);
    });
  });

  describe('contains', () => {
    it('should return false for empty filter', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.contains('apple')).toBe(false);
    });

    it('should return true for inserted item', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      expect(filter.contains('apple')).toBe(true);
    });

    it('should return false for non-existent item', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      expect(filter.contains('banana')).toBe(false);
    });

    it('should find multiple inserted items', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      expect(filter.contains('apple')).toBe(true);
      expect(filter.contains('banana')).toBe(true);
      expect(filter.contains('cherry')).toBe(true);
    });

    it('should handle case sensitivity', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('Apple');
      expect(filter.contains('Apple')).toBe(true);
      expect(filter.contains('apple')).toBe(false);
    });

    it('should return true for empty string if inserted', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('');
      expect(filter.contains('')).toBe(true);
    });

    it('should return false for empty string if not inserted', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.contains('')).toBe(false);
    });

    it('should return true for special characters if inserted', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('hello@world.com');
      expect(filter.contains('hello@world.com')).toBe(true);
    });

    it('should return true for unicode if inserted', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('你好');
      expect(filter.contains('你好')).toBe(true);
    });

    it('should return false for different unicode', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('你好');
      expect(filter.contains('世界')).toBe(false);
    });

    it('should have correct type', () => {
      const filter = new CuckooFilter3(100);
      const result = filter.contains('test');
      type Test = Expect<Equal<typeof result, boolean>>;
    });
  });

  describe('remove', () => {
    it('should return false for non-existent item', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.remove('apple')).toBe(false);
    });

    it('should remove existing item', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      const result = filter.remove('apple');
      expect(result).toBe(true);
      expect(filter.contains('apple')).toBe(false);
    });

    it('should decrement size after removal', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.insert('banana');
      filter.remove('apple');
      expect(filter.size).toBe(1);
    });

    it('should remove correct item from multiple', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      filter.remove('banana');
      expect(filter.contains('apple')).toBe(true);
      expect(filter.contains('banana')).toBe(false);
      expect(filter.contains('cherry')).toBe(true);
    });

    it('should remove empty string if present', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('');
      expect(filter.remove('')).toBe(true);
    });

    it('should remove special characters if present', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('hello@world.com');
      expect(filter.remove('hello@world.com')).toBe(true);
    });

    it('should remove unicode if present', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('你好');
      expect(filter.remove('你好')).toBe(true);
    });

    it('should return false for same item after removal', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.remove('apple');
      expect(filter.remove('apple')).toBe(false);
    });

    it('should update load factor after removal', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      filter.remove('item');
      expect(filter.loadFactor).toBe(0);
    });

    it('should be empty after removing all items', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.insert('banana');
      filter.remove('apple');
      filter.remove('banana');
      expect(filter.isEmpty).toBe(true);
    });
  });

  describe('size', () => {
    it('should be zero initially', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.size).toBe(0);
    });

    it('should increment with each insert', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('a');
      expect(filter.size).toBe(1);
      filter.insert('b');
      expect(filter.size).toBe(2);
      filter.insert('c');
      expect(filter.size).toBe(3);
    });

    it('should decrement with each remove', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('a');
      filter.insert('b');
      filter.remove('a');
      expect(filter.size).toBe(1);
    });

    it('should not change for failed insert', () => {
      const filter = new CuckooFilter3(4);
      filter.insert('item1');
      filter.insert('item2');
      filter.insert('item3');
      filter.insert('item4');
      filter.insert('item5');
      filter.insert('item6');
      filter.insert('item7');
      filter.insert('item8');
      filter.insert('item9');
      filter.insert('item10');
      filter.insert('item11');
      filter.insert('item12');
      filter.insert('item13');
      filter.insert('item14');
      filter.insert('item15');
      filter.insert('item16');
      filter.insert('item17');
      filter.insert('item18');
      filter.insert('item19');
      filter.insert('item20');
      const sizeBefore = filter.size;
      filter.insert('overflow');
      expect(filter.size).toBe(sizeBefore);
    });

    it('should be a number', () => {
      const filter = new CuckooFilter3(100);
      const size = filter.size;
      type Test = Expect<Equal<typeof size, number>>;
    });
  });

  describe('isEmpty', () => {
    it('should be true initially', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.isEmpty).toBe(true);
    });

    it('should be false after insert', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      expect(filter.isEmpty).toBe(false);
    });

    it('should be true after removing all items', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      filter.remove('item');
      expect(filter.isEmpty).toBe(true);
    });

    it('should be a boolean', () => {
      const filter = new CuckooFilter3(100);
      const empty = filter.isEmpty;
      type Test = Expect<Equal<typeof empty, boolean>>;
    });
  });

  describe('falsePositiveRate', () => {
    it('should be zero when empty', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.falsePositiveRate).toBe(0);
    });

    it('should increase with load factor', () => {
      const filter = new CuckooFilter3(100);
      const rate1 = filter.falsePositiveRate;
      filter.insert('item');
      const rate2 = filter.falsePositiveRate;
      expect(rate2).toBeGreaterThan(rate1);
    });

    it('should be less than 1', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      expect(filter.falsePositiveRate).toBeLessThan(1);
    });

    it('should be a number', () => {
      const filter = new CuckooFilter3(100);
      const rate = filter.falsePositiveRate;
      type Test = Expect<Equal<typeof rate, number>>;
    });
  });

  describe('loadFactor', () => {
    it('should be zero when empty', () => {
      const filter = new CuckooFilter3(100);
      expect(filter.loadFactor).toBe(0);
    });

    it('should increase with inserts', () => {
      const filter = new CuckooFilter3(100);
      const factor1 = filter.loadFactor;
      filter.insert('item');
      const factor2 = filter.loadFactor;
      expect(factor2).toBeGreaterThan(factor1);
    });

    it('should decrease with removes', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      const factor1 = filter.loadFactor;
      filter.remove('item');
      const factor2 = filter.loadFactor;
      expect(factor2).toBeLessThan(factor1);
    });

    it('should be at most 1', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      expect(filter.loadFactor).toBeLessThanOrEqual(1);
    });

    it('should be a number', () => {
      const filter = new CuckooFilter3(100);
      const factor = filter.loadFactor;
      type Test = Expect<Equal<typeof factor, number>>;
    });
  });

  describe('clear', () => {
    it('should reset size to zero', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.insert('banana');
      filter.clear();
      expect(filter.size).toBe(0);
    });

    it('should reset isEmpty to true', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      filter.clear();
      expect(filter.isEmpty).toBe(true);
    });

    it('should make all contains return false', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.insert('banana');
      filter.clear();
      expect(filter.contains('apple')).toBe(false);
      expect(filter.contains('banana')).toBe(false);
    });

    it('should reset load factor', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      filter.clear();
      expect(filter.loadFactor).toBe(0);
    });

    it('should reset false positive rate', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item');
      filter.clear();
      expect(filter.falsePositiveRate).toBe(0);
    });

    it('should allow inserts after clear', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('item1');
      filter.clear();
      expect(filter.insert('item2')).toBe(true);
    });

    it('should work when filter is empty', () => {
      const filter = new CuckooFilter3(100);
      filter.clear();
      expect(filter.size).toBe(0);
    });

    it('should work when filter is full', () => {
      const filter = new CuckooFilter3(4);
      filter.insert('item1');
      filter.insert('item2');
      filter.insert('item3');
      filter.insert('item4');
      filter.insert('item5');
      filter.insert('item6');
      filter.insert('item7');
      filter.insert('item8');
      filter.insert('item9');
      filter.insert('item10');
      filter.insert('item11');
      filter.insert('item12');
      filter.insert('item13');
      filter.insert('item14');
      filter.insert('item15');
      filter.insert('item16');
      filter.insert('item17');
      filter.insert('item18');
      filter.insert('item19');
      filter.insert('item20');
      filter.clear();
      expect(filter.size).toBe(0);
    });
  });

  describe('integration', () => {
    it('should handle complex workflow', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      expect(filter.contains('apple')).toBe(true);
      expect(filter.contains('banana')).toBe(true);
      expect(filter.contains('cherry')).toBe(true);
      filter.remove('banana');
      expect(filter.contains('banana')).toBe(false);
      filter.clear();
      expect(filter.size).toBe(0);
    });

    it('should maintain consistency with many operations', () => {
      const filter = new CuckooFilter3(50);
      const items = ['a', 'b', 'c', 'd', 'e'];
      items.forEach(item => filter.insert(item));
      items.forEach(item => expect(filter.contains(item)).toBe(true));
      items.forEach(item => filter.remove(item));
      items.forEach(item => expect(filter.contains(item)).toBe(false));
    });

    it('should handle insert-remove cycles', () => {
      const filter = new CuckooFilter3(100);
      for (let i = 0; i < 10; i++) {
        filter.insert('item');
        expect(filter.contains('item')).toBe(true);
        filter.remove('item');
        expect(filter.contains('item')).toBe(false);
      }
    });

    it('should handle same item multiple times', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('duplicate');
      filter.insert('duplicate');
      filter.remove('duplicate');
      expect(filter.contains('duplicate')).toBe(true);
    });

    it('should handle mixed data types as strings', () => {
      const filter = new CuckooFilter3(100);
      const items = ['123', 'true', 'null', 'undefined', '{}'];
      items.forEach(item => filter.insert(item));
      items.forEach(item => expect(filter.contains(item)).toBe(true));
    });

    it('should work with numbers as strings', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('1');
      filter.insert('2');
      filter.insert('3');
      expect(filter.contains('1')).toBe(true);
      expect(filter.contains('2')).toBe(true);
      expect(filter.contains('3')).toBe(true);
    });

    it('should handle edge case strings', () => {
      const filter = new CuckooFilter3(100);
      filter.insert('a');
      filter.insert('aa');
      filter.insert('aaa');
      expect(filter.contains('a')).toBe(true);
      expect(filter.contains('aa')).toBe(true);
      expect(filter.contains('aaa')).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should have correct return type for insert', () => {
      const filter = new CuckooFilter3(100);
      const result = filter.insert('test');
      type Test = Expect<Equal<typeof result, boolean>>;
    });

    it('should have correct return type for remove', () => {
      const filter = new CuckooFilter3(100);
      const result = filter.remove('test');
      type Test = Expect<Equal<typeof result, boolean>>;
    });

    it('should have correct type for size getter', () => {
      const filter = new CuckooFilter3(100);
      const size = filter.size;
      type Test = Expect<Equal<typeof size, number>>;
    });

    it('should have correct type for isEmpty getter', () => {
      const filter = new CuckooFilter3(100);
      const empty = filter.isEmpty;
      type Test = Expect<Equal<typeof empty, boolean>>;
    });

    it('should have correct type for loadFactor getter', () => {
      const filter = new CuckooFilter3(100);
      const factor = filter.loadFactor;
      type Test = Expect<Equal<typeof factor, number>>;
    });

    it('should have correct type for falsePositiveRate getter', () => {
      const filter = new CuckooFilter3(100);
      const rate = filter.falsePositiveRate;
      type Test = Expect<Equal<typeof rate, number>>;
    });
  });
});
