import { describe, it, expect } from 'vitest';
import { BloomLink2 } from '../src/core/bloom-link-2/index.js';

describe('BloomLink2', () => {
  describe('constructor', () => {
    it('should create filter with default parameters', () => {
      const filter = new BloomLink2();
      expect(filter).toBeDefined();
      expect(filter.count()).toBe(0);
      expect(filter.isEmpty()).toBe(true);
    });

    it('should create filter with custom expected items', () => {
      const filter = new BloomLink2(500);
      expect(filter).toBeDefined();
      expect(filter.count()).toBe(0);
    });

    it('should create filter with custom false positive rate', () => {
      const filter = new BloomLink2(1000, 0.05);
      expect(filter).toBeDefined();
      expect(filter.count()).toBe(0);
    });
  });

  describe('add', () => {
    it('should add single item', () => {
      const filter = new BloomLink2();
      filter.add('hello');
      expect(filter.count()).toBe(1);
      expect(filter.isEmpty()).toBe(false);
    });

    it('should add multiple items', () => {
      const filter = new BloomLink2();
      filter.add('apple');
      filter.add('banana');
      filter.add('cherry');
      expect(filter.count()).toBe(3);
    });

    it('should not count duplicate items', () => {
      const filter = new BloomLink2();
      filter.add('hello');
      filter.add('hello');
      filter.add('hello');
      expect(filter.count()).toBe(1);
    });

    it('should handle empty string', () => {
      const filter = new BloomLink2();
      filter.add('');
      expect(filter.count()).toBe(1);
    });

    it('should handle special characters', () => {
      const filter = new BloomLink2();
      filter.add('hello@world.com');
      filter.add('test!#$%');
      expect(filter.count()).toBe(2);
    });
  });

  describe('mightContain', () => {
    it('should return false for empty filter', () => {
      const filter = new BloomLink2();
      expect(filter.mightContain('anything')).toBe(false);
    });

    it('should return true for added item', () => {
      const filter = new BloomLink2();
      filter.add('hello');
      expect(filter.mightContain('hello')).toBe(true);
    });

    it('should return true for all added items', () => {
      const filter = new BloomLink2();
      filter.add('apple');
      filter.add('banana');
      filter.add('cherry');
      expect(filter.mightContain('apple')).toBe(true);
      expect(filter.mightContain('banana')).toBe(true);
      expect(filter.mightContain('cherry')).toBe(true);
    });

    it('should return false for non-added items', () => {
      const filter = new BloomLink2();
      filter.add('apple');
      filter.add('banana');
      expect(filter.mightContain('orange')).toBe(false);
      expect(filter.mightContain('grape')).toBe(false);
    });

    it('may have false positives', () => {
      const filter = new BloomLink2(100, 0.1);
      for (let i = 0; i < 100; i++) {
        filter.add(`item${i}`);
      }

      let falsePositives = 0;
      for (let i = 100; i < 200; i++) {
        if (filter.mightContain(`item${i}`)) {
          falsePositives++;
        }
      }

      expect(falsePositives).toBeLessThan(20);
    });

    it('should have no false negatives for added items', () => {
      const filter = new BloomLink2(100, 0.01);
      const items: string[] = [];
      for (let i = 0; i < 100; i++) {
        const item = `item${i}`;
        items.push(item);
        filter.add(item);
      }

      for (const item of items) {
        expect(filter.mightContain(item)).toBe(true);
      }
    });

    it('should handle case sensitivity', () => {
      const filter = new BloomLink2();
      filter.add('Hello');
      expect(filter.mightContain('Hello')).toBe(true);
      expect(filter.mightContain('hello')).toBe(false);
      expect(filter.mightContain('HELLO')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should reset empty filter', () => {
      const filter = new BloomLink2();
      filter.clear();
      expect(filter.count()).toBe(0);
      expect(filter.isEmpty()).toBe(true);
    });

    it('should reset filter with items', () => {
      const filter = new BloomLink2();
      filter.add('apple');
      filter.add('banana');
      filter.add('cherry');
      expect(filter.count()).toBe(3);

      filter.clear();
      expect(filter.count()).toBe(0);
      expect(filter.isEmpty()).toBe(true);
      expect(filter.mightContain('apple')).toBe(false);
      expect(filter.mightContain('banana')).toBe(false);
      expect(filter.mightContain('cherry')).toBe(false);
    });

    it('should reset fill ratio', () => {
      const filter = new BloomLink2(10, 0.5);
      filter.add('item1');
      filter.add('item2');
      filter.add('item3');
      expect(filter.fillRatio()).toBeGreaterThan(0);

      filter.clear();
      expect(filter.fillRatio()).toBe(0);
    });
  });

  describe('count', () => {
    it('should return 0 for new filter', () => {
      const filter = new BloomLink2();
      expect(filter.count()).toBe(0);
    });

    it('should return correct count after additions', () => {
      const filter = new BloomLink2();
      for (let i = 0; i < 10; i++) {
        filter.add(`item${i}`);
        expect(filter.count()).toBe(i + 1);
      }
    });

    it('should not count duplicates', () => {
      const filter = new BloomLink2();
      filter.add('item');
      filter.add('item');
      filter.add('item');
      expect(filter.count()).toBe(1);
    });
  });

  describe('falsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      const filter = new BloomLink2();
      expect(filter.falsePositiveRate()).toBe(0);
    });

    it('should return theoretical false positive rate', () => {
      const filter = new BloomLink2(100, 0.01);
      const fpr = filter.falsePositiveRate();
      expect(fpr).toBeGreaterThanOrEqual(0);
      expect(fpr).toBeLessThanOrEqual(1);
    });

    it('should increase as filter fills up', () => {
      const filter = new BloomLink2(100, 0.01);
      const fpr1 = filter.falsePositiveRate();

      for (let i = 0; i < 50; i++) {
        filter.add(`item${i}`);
      }
      const fpr2 = filter.falsePositiveRate();

      expect(fpr2).toBeGreaterThanOrEqual(fpr1);
    });
  });

  describe('fillRatio', () => {
    it('should return 0 for empty filter', () => {
      const filter = new BloomLink2();
      expect(filter.fillRatio()).toBe(0);
    });

    it('should return ratio of bits set', () => {
      const filter = new BloomLink2();
      filter.add('item');
      const ratio = filter.fillRatio();
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThanOrEqual(1);
    });

    it('should increase as items are added', () => {
      const filter = new BloomLink2(10, 0.5);
      const ratio1 = filter.fillRatio();

      filter.add('item1');
      const ratio2 = filter.fillRatio();

      filter.add('item2');
      const ratio3 = filter.fillRatio();

      expect(ratio3).toBeGreaterThan(ratio2);
      expect(ratio2).toBeGreaterThan(ratio1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for new filter', () => {
      const filter = new BloomLink2();
      expect(filter.isEmpty()).toBe(true);
    });

    it('should return false after adding item', () => {
      const filter = new BloomLink2();
      filter.add('item');
      expect(filter.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      const filter = new BloomLink2();
      filter.add('item');
      expect(filter.isEmpty()).toBe(false);

      filter.clear();
      expect(filter.isEmpty()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle many items', () => {
      const filter = new BloomLink2(1000, 0.01);
      const itemCount = 500;

      for (let i = 0; i < itemCount; i++) {
        filter.add(`item${i}`);
      }

      expect(filter.count()).toBe(itemCount);

      let foundCount = 0;
      for (let i = 0; i < itemCount; i++) {
        if (filter.mightContain(`item${i}`)) {
          foundCount++;
        }
      }
      expect(foundCount).toBe(itemCount);
    });

    it('should handle very long strings', () => {
      const filter = new BloomLink2();
      const longString = 'a'.repeat(10000);
      filter.add(longString);
      expect(filter.mightContain(longString)).toBe(true);
    });

    it('should handle unicode characters', () => {
      const filter = new BloomLink2();
      filter.add('hello世界');
      filter.add('café');
      filter.add('日本語');
      expect(filter.mightContain('hello世界')).toBe(true);
      expect(filter.mightContain('café')).toBe(true);
      expect(filter.mightContain('日本語')).toBe(true);
    });

    it('should handle same hash values', () => {
      const filter = new BloomLink2(10, 0.5);
      filter.add('item1');
      filter.add('item2');
      filter.add('item3');
      expect(filter.count()).toBe(3);
    });

    it('should handle adding same item multiple times', () => {
      const filter = new BloomLink2();
      const item = 'test-item';
      for (let i = 0; i < 100; i++) {
        filter.add(item);
      }
      expect(filter.count()).toBe(1);
      expect(filter.mightContain(item)).toBe(true);
    });

    it('should handle clear', () => {
      const filter = new BloomLink2();
      filter.add('item1');
      filter.add('item2');
      filter.clear();
      expect(filter.isEmpty()).toBe(true);
      expect(filter.count()).toBe(0);
    });
  });
});
