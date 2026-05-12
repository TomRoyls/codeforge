import { describe, it, expect } from 'vitest';
import { RTree2 } from '../src/core/r-tree-2/index.js';

describe('RTree2', () => {
  describe('Basic Insert and Search', () => {
    it('should insert and retrieve a single item', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      const results = tree.search({ x: 5, y: 5 });
      expect(results).toEqual(['item1']);
    });

    it('should insert multiple items and retrieve them', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 0, maxX: 20, maxY: 10 }, 'item2');
      tree.insert({ minX: 0, minY: 10, maxX: 10, maxY: 20 }, 'item3');

      expect(tree.search({ x: 5, y: 5 })).toEqual(['item1']);
      expect(tree.search({ x: 15, y: 5 })).toEqual(['item2']);
      expect(tree.search({ x: 5, y: 15 })).toEqual(['item3']);
    });

    it('should return empty array for non-existent point', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      const results = tree.search({ x: 100, y: 100 });
      expect(results).toEqual([]);
    });

    it('should handle multiple items at same location', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item2');
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item3');

      const results = tree.search({ x: 5, y: 5 });
      expect(results).toHaveLength(3);
      expect(results).toContain('item1');
      expect(results).toContain('item2');
      expect(results).toContain('item3');
    });
  });

  describe('Point Search', () => {
    it('should find point inside rectangle', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'inside');
      expect(tree.search({ x: 5, y: 5 })).toEqual(['inside']);
    });

    it('should find point on rectangle edge', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'edge');
      expect(tree.search({ x: 0, y: 5 })).toEqual(['edge']);
      expect(tree.search({ x: 10, y: 5 })).toEqual(['edge']);
      expect(tree.search({ x: 5, y: 0 })).toEqual(['edge']);
      expect(tree.search({ x: 5, y: 10 })).toEqual(['edge']);
    });

    it('should find point on rectangle corner', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'corner');
      expect(tree.search({ x: 0, y: 0 })).toEqual(['corner']);
      expect(tree.search({ x: 10, y: 0 })).toEqual(['corner']);
      expect(tree.search({ x: 0, y: 10 })).toEqual(['corner']);
      expect(tree.search({ x: 10, y: 10 })).toEqual(['corner']);
    });

    it('should not find point outside rectangle', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'inside');
      expect(tree.search({ x: 11, y: 5 })).toEqual([]);
      expect(tree.search({ x: -1, y: 5 })).toEqual([]);
      expect(tree.search({ x: 5, y: 11 })).toEqual([]);
      expect(tree.search({ x: 5, y: -1 })).toEqual([]);
    });

    it('should find point in overlapping rectangles', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'rect1');
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'rect2');

      const results = tree.search({ x: 7, y: 7 });
      expect(results).toHaveLength(2);
      expect(results).toContain('rect1');
      expect(results).toContain('rect2');
    });
  });

  describe('Area Search', () => {
    it('should find all items in search area', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'item2');
      tree.insert({ minX: 20, minY: 20, maxX: 30, maxY: 30 }, 'item3');

      const results = tree.searchArea({ minX: 0, minY: 0, maxX: 15, maxY: 15 });
      expect(results).toHaveLength(2);
      expect(results).toContain('item1');
      expect(results).toContain('item2');
    });

    it('should find items partially overlapping search area', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'partial');

      const results = tree.searchArea({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
      expect(results).toEqual(['partial']);
    });

    it('should return empty array for non-overlapping area', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      const results = tree.searchArea({ minX: 20, minY: 20, maxX: 30, maxY: 30 });
      expect(results).toEqual([]);
    });

    it('should handle search area that contains multiple items', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, 'item1');
      tree.insert({ minX: 5, minY: 0, maxX: 10, maxY: 5 }, 'item2');
      tree.insert({ minX: 0, minY: 5, maxX: 5, maxY: 10 }, 'item3');
      tree.insert({ minX: 5, minY: 5, maxX: 10, maxY: 10 }, 'item4');

      const results = tree.searchArea({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
      expect(results).toHaveLength(4);
    });

    it('should find items that touch search area boundary', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'touching');

      const results = tree.searchArea({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
      expect(results).toEqual(['touching']);
    });
  });

  describe('Remove', () => {
    it('should remove existing item', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      expect(tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1')).toBe(
        true
      );
      expect(tree.search({ x: 5, y: 5 })).toEqual([]);
    });

    it('should return false for non-existent item', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      expect(
        tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item2')
      ).toBe(false);
      expect(tree.search({ x: 5, y: 5 })).toEqual(['item1']);
    });

    it('should remove one of multiple items', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item2');

      tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      const results = tree.search({ x: 5, y: 5 });
      expect(results).toEqual(['item2']);
    });

    it('should remove item from specific rectangle only', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'item2');

      tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      expect(tree.search({ x: 7, y: 7 })).toEqual(['item2']);
      expect(tree.search({ x: 2, y: 2 })).toEqual([]);
    });

    it('should handle removing all items', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');

      tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.remove({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');

      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('Contains', () => {
    it('should return true for existing item', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      expect(tree.contains('item1')).toBe(true);
    });

    it('should return false for non-existent item', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      expect(tree.contains('item2')).toBe(false);
    });

    it('should return false for empty tree', () => {
      const tree = new RTree2<string>();

      expect(tree.contains('item1')).toBe(false);
    });

    it('should handle multiple items with same value', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item1');

      expect(tree.contains('item1')).toBe(true);
    });

    it('should return false after removal', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      expect(tree.contains('item1')).toBe(false);
    });
  });

  describe('Clear', () => {
    it('should clear all items from tree', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');
      tree.insert({ minX: 20, minY: 20, maxX: 30, maxY: 30 }, 'item3');

      tree.clear();

      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.search({ x: 5, y: 5 })).toEqual([]);
    });

    it('should work on empty tree', () => {
      const tree = new RTree2<string>();

      tree.clear();

      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });

    it('should allow inserts after clear', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      tree.clear();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item2');

      expect(tree.size).toBe(1);
      expect(tree.contains('item2')).toBe(true);
    });
  });

  describe('Size and isEmpty', () => {
    it('should report size correctly after inserts', () => {
      const tree = new RTree2<string>();
      expect(tree.size).toBe(0);

      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      expect(tree.size).toBe(1);

      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');
      expect(tree.size).toBe(2);

      tree.insert({ minX: 20, minY: 20, maxX: 30, maxY: 30 }, 'item3');
      expect(tree.size).toBe(3);
    });

    it('should report size correctly after removals', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');

      tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      expect(tree.size).toBe(1);

      tree.remove({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');
      expect(tree.size).toBe(0);
    });

    it('should report isEmpty correctly', () => {
      const tree = new RTree2<string>();

      expect(tree.isEmpty()).toBe(true);

      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      expect(tree.isEmpty()).toBe(false);

      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should report size correctly after clear', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');

      tree.clear();

      expect(tree.size).toBe(0);
    });
  });

  describe('toArray', () => {
    it('should return all items as array', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');
      tree.insert({ minX: 20, minY: 20, maxX: 30, maxY: 30 }, 'item3');

      const results = tree.toArray();
      expect(results).toHaveLength(3);
      expect(results).toContain('item1');
      expect(results).toContain('item2');
      expect(results).toContain('item3');
    });

    it('should return empty array for empty tree', () => {
      const tree = new RTree2<string>();

      const results = tree.toArray();
      expect(results).toEqual([]);
    });

    it('should include duplicates', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      const results = tree.toArray();
      expect(results).toHaveLength(3);
      expect(results).toEqual(['item1', 'item1', 'item1']);
    });

    it('should reflect changes after insert and remove', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');

      expect(tree.toArray()).toHaveLength(2);

      tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      expect(tree.toArray()).toEqual(['item2']);
    });
  });

  describe('Bulk Insert', () => {
    it('should handle large number of inserts', () => {
      const tree = new RTree2<number>();
      const numItems = 100;

      for (let i = 0; i < numItems; i++) {
        tree.insert(
          { minX: i * 10, minY: i * 10, maxX: i * 10 + 5, maxY: i * 10 + 5 },
          i
        );
      }

      expect(tree.size).toBe(numItems);

      for (let i = 0; i < numItems; i++) {
        const results = tree.search({ x: i * 10 + 2, y: i * 10 + 2 });
        expect(results).toEqual([i]);
      }
    });

    it('should handle overlapping bulk inserts', () => {
      const tree = new RTree2<number>();
      const numItems = 50;

      for (let i = 0; i < numItems; i++) {
        tree.insert(
          { minX: i, minY: i, maxX: i + 10, maxY: i + 10 },
          i
        );
      }

      const results = tree.search({ x: 5, y: 5 });
      expect(results.length).toBeGreaterThan(5);
    });
  });

  describe('Split Behavior', () => {
    it('should trigger node split when exceeding max entries', () => {
      const tree = new RTree2<string>(2, 4);

      tree.insert({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 11, maxY: 11 }, 'item2');
      tree.insert({ minX: 20, minY: 20, maxX: 21, maxY: 21 }, 'item3');
      tree.insert({ minX: 30, minY: 30, maxX: 31, maxY: 31 }, 'item4');
      tree.insert({ minX: 40, minY: 40, maxX: 41, maxY: 41 }, 'item5');

      expect(tree.size).toBe(5);
      expect(tree.toArray()).toHaveLength(5);
    });

    it('should handle multiple splits', () => {
      const tree = new RTree2<string>(2, 3);

      for (let i = 0; i < 20; i++) {
        tree.insert(
          { minX: i * 10, minY: i * 10, maxX: i * 10 + 5, maxY: i * 10 + 5 },
          `item${i}`
        );
      }

      expect(tree.size).toBe(20);
      expect(tree.toArray()).toHaveLength(20);
    });

    it('should maintain correct searches after split', () => {
      const tree = new RTree2<string>(2, 4);

      const items = [
        { rect: { minX: 0, minY: 0, maxX: 5, maxY: 5 }, value: 'item1' },
        { rect: { minX: 10, minY: 10, maxX: 15, maxY: 15 }, value: 'item2' },
        { rect: { minX: 20, minY: 20, maxX: 25, maxY: 25 }, value: 'item3' },
        { rect: { minX: 30, minY: 30, maxX: 35, maxY: 35 }, value: 'item4' },
        { rect: { minX: 40, minY: 40, maxX: 45, maxY: 45 }, value: 'item5' },
      ];

      for (const item of items) {
        tree.insert(item.rect, item.value);
      }

      for (const item of items) {
        const point = {
          x: item.rect.minX + 2,
          y: item.rect.minY + 2,
        };
        const results = tree.search(point);
        expect(results).toContain(item.value);
      }
    });
  });

  describe('Overlapping Rectangles', () => {
    it('should handle heavily overlapping rectangles', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 20, maxY: 20 }, 'large1');
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'medium1');
      tree.insert({ minX: 8, minY: 8, maxX: 12, maxY: 12 }, 'small1');
      tree.insert({ minX: 0, minY: 10, maxX: 20, maxY: 30 }, 'large2');
      tree.insert({ minX: 10, minY: 0, maxX: 30, maxY: 20 }, 'large3');

      const centerResults = tree.search({ x: 10, y: 10 });
      expect(centerResults.length).toBeGreaterThan(1);
      expect(centerResults).toContain('large1');
      expect(centerResults).toContain('medium1');
      expect(centerResults).toContain('small1');
      expect(centerResults).toContain('large2');
      expect(centerResults).toContain('large3');
    });

    it('should handle nested rectangles', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, 'outer');
      tree.insert({ minX: 20, minY: 20, maxX: 80, maxY: 80 }, 'middle');
      tree.insert({ minX: 40, minY: 40, maxX: 60, maxY: 60 }, 'inner');

      const results = tree.search({ x: 50, y: 50 });
      expect(results).toEqual(['outer', 'middle', 'inner']);
    });

    it('should handle rectangles sharing edges', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'rect1');
      tree.insert({ minX: 10, minY: 0, maxX: 20, maxY: 10 }, 'rect2');
      tree.insert({ minX: 0, minY: 10, maxX: 10, maxY: 20 }, 'rect3');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'rect4');

      expect(tree.search({ x: 10, y: 5 })).toContain('rect1');
      expect(tree.search({ x: 10, y: 5 })).toContain('rect2');
      expect(tree.search({ x: 5, y: 10 })).toContain('rect1');
      expect(tree.search({ x: 5, y: 10 })).toContain('rect3');
      expect(tree.search({ x: 10, y: 10 })).toContain('rect1');
      expect(tree.search({ x: 10, y: 10 })).toContain('rect2');
      expect(tree.search({ x: 10, y: 10 })).toContain('rect3');
      expect(tree.search({ x: 10, y: 10 })).toContain('rect4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-area rectangles', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 5, minY: 5, maxX: 5, maxY: 5 }, 'point');

      expect(tree.search({ x: 5, y: 5 })).toEqual(['point']);
      expect(tree.search({ x: 6, y: 5 })).toEqual([]);
    });

    it('should handle negative coordinates', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: -10, minY: -10, maxX: -5, maxY: -5 }, 'negative');

      expect(tree.search({ x: -7, y: -7 })).toEqual(['negative']);
    });

    it('should handle large coordinates', () => {
      const tree = new RTree2<string>();
      tree.insert(
        { minX: 1000000, minY: 1000000, maxX: 1000005, maxY: 1000005 },
        'large'
      );

      expect(tree.search({ x: 1000002, y: 1000002 })).toEqual(['large']);
    });

    it('should handle custom min/max entries', () => {
      const tree = new RTree2<string>(3, 6);

      tree.insert({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, 'item1');
      tree.insert({ minX: 2, minY: 2, maxX: 3, maxY: 3 }, 'item2');
      tree.insert({ minX: 4, minY: 4, maxX: 5, maxY: 5 }, 'item3');

      expect(tree.size).toBe(3);
    });

    it('should throw error for invalid min/max entries', () => {
      expect(() => new RTree2<string>(1, 2)).toThrow('Invalid min/max entries');
      expect(() => new RTree2<string>(5, 4)).toThrow('Invalid min/max entries');
    });
  });

  describe('Empty Tree Behavior', () => {
    it('should search empty tree', () => {
      const tree = new RTree2<string>();

      expect(tree.search({ x: 5, y: 5 })).toEqual([]);
    });

    it('should search area on empty tree', () => {
      const tree = new RTree2<string>();

      expect(
        tree.searchArea({ minX: 0, minY: 0, maxX: 10, maxY: 10 })
      ).toEqual([]);
    });

    it('should remove from empty tree', () => {
      const tree = new RTree2<string>();

      expect(
        tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1')
      ).toBe(false);
    });

    it('should return empty array from toArray on empty tree', () => {
      const tree = new RTree2<string>();

      expect(tree.toArray()).toEqual([]);
    });
  });

  describe('Number Type Values', () => {
    it('should work with number values', () => {
      const tree = new RTree2<number>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 42);
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 99);

      expect(tree.search({ x: 5, y: 5 })).toEqual([42]);
      expect(tree.search({ x: 15, y: 15 })).toEqual([99]);
    });

    it('should remove number values', () => {
      const tree = new RTree2<number>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 42);

      expect(tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 42)).toBe(true);
      expect(tree.contains(42)).toBe(false);
    });
  });

  describe('Object Type Values', () => {
    it('should work with object values', () => {
      const tree = new RTree2<{ id: number; name: string }>();
      const obj1 = { id: 1, name: 'test1' };
      const obj2 = { id: 2, name: 'test2' };

      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, obj1);
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, obj2);

      expect(tree.search({ x: 5, y: 5 })).toEqual([obj1]);
      expect(tree.search({ x: 15, y: 15 })).toEqual([obj2]);
    });

    it('should contain object references', () => {
      const tree = new RTree2<{ id: number }>();
      const obj = { id: 1 };

      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, obj);

      expect(tree.contains(obj)).toBe(true);
      expect(tree.contains({ id: 1 })).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle insert, search, remove, insert sequence', () => {
      const tree = new RTree2<string>();
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'item2');

      expect(tree.search({ x: 5, y: 5 })).toEqual(['item1']);

      tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item1');

      expect(tree.search({ x: 5, y: 5 })).toEqual([]);

      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'item3');

      expect(tree.search({ x: 5, y: 5 })).toEqual(['item3']);
    });

    it('should maintain consistency after multiple operations', () => {
      const tree = new RTree2<number>(2, 4);

      for (let i = 0; i < 20; i++) {
        tree.insert(
          { minX: i, minY: i, maxX: i + 1, maxY: i + 1 },
          i
        );
      }

      expect(tree.size).toBe(20);

      for (let i = 0; i < 10; i++) {
        tree.remove({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, i);
      }

      expect(tree.size).toBe(10);

      const remaining = tree.toArray();
      expect(remaining).toHaveLength(10);
      expect(remaining.every((val) => val >= 10 && val < 20)).toBe(true);
    });
  });
});
