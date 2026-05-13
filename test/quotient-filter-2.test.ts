import { describe, it, expect } from 'vitest';
import { QuotientFilter2 } from '../src/core/quotient-filter-2/index.js';

describe('QuotientFilter2', () => {
  describe('insert and query', () => {
    it('should contain inserted items', () => {
      const qf = new QuotientFilter2();
      qf.insert('hello');
      expect(qf.query('hello')).toBe(true);
    });

    it('should not contain non-inserted items', () => {
      const qf = new QuotientFilter2();
      qf.insert('hello');
      expect(qf.query('world')).toBe(false);
    });

    it('should handle multiple items', () => {
      const qf = new QuotientFilter2();
      qf.insert('item1');
      qf.insert('item2');
      qf.insert('item3');
      expect(qf.query('item1')).toBe(true);
      expect(qf.query('item2')).toBe(true);
      expect(qf.query('item3')).toBe(true);
      expect(qf.query('item4')).toBe(false);
    });

    it('should have no false negatives for inserted items', () => {
      const qf = new QuotientFilter2();
      const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
      for (const item of items) {
        qf.insert(item);
      }
      for (const item of items) {
        expect(qf.query(item)).toBe(true);
      }
    });
  });

  describe('empty filter', () => {
    it('should return false for all queries on empty filter', () => {
      const qf = new QuotientFilter2();
      expect(qf.query('anything')).toBe(false);
      expect(qf.query('hello')).toBe(false);
      expect(qf.query('')).toBe(false);
    });

    it('should have size 0 when empty', () => {
      const qf = new QuotientFilter2();
      expect(qf.size()).toBe(0);
    });

    it('should have load factor 0 when empty', () => {
      const qf = new QuotientFilter2();
      expect(qf.loadFactor()).toBe(0);
    });
  });

  describe('single item', () => {
    it('should correctly handle single item insertion', () => {
      const qf = new QuotientFilter2();
      qf.insert('single');
      expect(qf.query('single')).toBe(true);
      expect(qf.size()).toBe(1);
      expect(qf.loadFactor()).toBeGreaterThan(0);
    });

    it('should return false for different single item', () => {
      const qf = new QuotientFilter2();
      qf.insert('item');
      expect(qf.query('different')).toBe(false);
    });
  });

  describe('many items', () => {
    it('should handle inserting many items', () => {
      const qf = new QuotientFilter2(12, 8);
      const itemCount = 500;
      for (let i = 0; i < itemCount; i++) {
        qf.insert(`item-${i}`);
      }
      expect(qf.size()).toBe(itemCount);
      for (let i = 0; i < itemCount; i++) {
        expect(qf.query(`item-${i}`)).toBe(true);
      }
    });

    it('should have reasonable load factor after many insertions', () => {
      const qf = new QuotientFilter2(10, 8);
      const itemCount = 200;
      for (let i = 0; i < itemCount; i++) {
        qf.insert(`item-${i}`);
      }
      expect(qf.loadFactor()).toBeGreaterThan(0);
      expect(qf.loadFactor()).toBeLessThan(1);
    });
  });

  describe('remove', () => {
    it('should remove existing item', () => {
      const qf = new QuotientFilter2();
      qf.insert('hello');
      qf.insert('world');
      expect(qf.query('hello')).toBe(true);
      expect(qf.remove('hello')).toBe(true);
      expect(qf.query('hello')).toBe(false);
      expect(qf.size()).toBe(1);
    });

    it('should return false when removing non-existent item', () => {
      const qf = new QuotientFilter2();
      qf.insert('hello');
      expect(qf.remove('world')).toBe(false);
      expect(qf.size()).toBe(1);
    });

    it('should return false when removing from empty filter', () => {
      const qf = new QuotientFilter2();
      expect(qf.remove('anything')).toBe(false);
    });

    it('should handle removing multiple items', () => {
      const qf = new QuotientFilter2();
      qf.insert('item1');
      qf.insert('item2');
      qf.insert('item3');
      expect(qf.remove('item2')).toBe(true);
      expect(qf.query('item1')).toBe(true);
      expect(qf.query('item2')).toBe(false);
      expect(qf.query('item3')).toBe(true);
      expect(qf.size()).toBe(2);
    });

    it('should handle removing all items', () => {
      const qf = new QuotientFilter2();
      qf.insert('item1');
      qf.insert('item2');
      qf.remove('item1');
      qf.remove('item2');
      expect(qf.query('item1')).toBe(false);
      expect(qf.query('item2')).toBe(false);
      expect(qf.size()).toBe(0);
    });
  });

  describe('loadFactor', () => {
    it('should calculate load factor correctly', () => {
      const qf = new QuotientFilter2(10, 8);
      const totalSlots = 1 << 10;
      qf.insert('item1');
      qf.insert('item2');
      qf.insert('item3');
      expect(qf.loadFactor()).toBe(3 / totalSlots);
    });

    it('should increase with more items', () => {
      const qf = new QuotientFilter2(10, 8);
      const initialLoad = qf.loadFactor();
      qf.insert('item1');
      qf.insert('item2');
      qf.insert('item3');
      expect(qf.loadFactor()).toBeGreaterThan(initialLoad);
    });

    it('should decrease when items are removed', () => {
      const qf = new QuotientFilter2(10, 8);
      qf.insert('item1');
      qf.insert('item2');
      qf.insert('item3');
      const loadWithItems = qf.loadFactor();
      qf.remove('item1');
      qf.remove('item2');
      const loadAfterRemoval = qf.loadFactor();
      expect(loadAfterRemoval).toBeLessThan(loadWithItems);
    });
  });

  describe('custom parameters', () => {
    it('should create filter with custom qBits', () => {
      const qf = new QuotientFilter2(8, 8);
      expect(qf.loadFactor()).toBe(0);
      qf.insert('item1');
      expect(qf.loadFactor()).toBeGreaterThan(0);
    });

    it('should create filter with custom rBits', () => {
      const qf = new QuotientFilter2(10, 4);
      qf.insert('item1');
      expect(qf.query('item1')).toBe(true);
    });

    it('should handle different parameter combinations', () => {
      const qf1 = new QuotientFilter2(5, 4);
      const qf2 = new QuotientFilter2(15, 12);
      qf1.insert('test');
      qf2.insert('test');
      expect(qf1.query('test')).toBe(true);
      expect(qf2.query('test')).toBe(true);
    });
  });
});
