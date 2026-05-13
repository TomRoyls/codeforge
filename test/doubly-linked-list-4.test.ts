import { describe, it, expect } from 'vitest';
import { DoublyLinkedList4 } from './src/core/doubly-linked-list-4/index.js';

describe('DoublyLinkedList4 - Basic Operations', () => {
  it('should create empty list', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.size).toBe(0);
    expect(list.isEmpty()).toBe(true);
  });

  it('should push single element', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    expect(list.size).toBe(1);
    expect(list.isEmpty()).toBe(false);
    expect(list.toArray()).toEqual([1]);
  });

  it('should push multiple elements', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    expect(list.size).toBe(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should pop from list with one element', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    const result = list.pop();
    expect(result).toBe(1);
    expect(list.size).toBe(0);
    expect(list.isEmpty()).toBe(true);
  });

  it('should pop from list with multiple elements', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.pop();
    expect(result).toBe(3);
    expect(list.size).toBe(2);
    expect(list.toArray()).toEqual([1, 2]);
  });

  it('should return undefined when popping from empty list', () => {
    const list = new DoublyLinkedList4<number>();
    const result = list.pop();
    expect(result).toBe(undefined);
    expect(list.size).toBe(0);
  });

  it('should shift from list with one element', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    const result = list.shift();
    expect(result).toBe(1);
    expect(list.size).toBe(0);
    expect(list.isEmpty()).toBe(true);
  });

  it('should shift from list with multiple elements', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.shift();
    expect(result).toBe(1);
    expect(list.size).toBe(2);
    expect(list.toArray()).toEqual([2, 3]);
  });

  it('should return undefined when shifting from empty list', () => {
    const list = new DoublyLinkedList4<number>();
    const result = list.shift();
    expect(result).toBe(undefined);
    expect(list.size).toBe(0);
  });

  it('should unshift single element', () => {
    const list = new DoublyLinkedList4<number>();
    list.unshift(1);
    expect(list.size).toBe(1);
    expect(list.toArray()).toEqual([1]);
  });

  it('should unshift multiple elements', () => {
    const list = new DoublyLinkedList4<number>();
    list.unshift(3);
    list.unshift(2);
    list.unshift(1);
    expect(list.size).toBe(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should peek at head', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    const result = list.peek();
    expect(result).toBe(1);
    expect(list.size).toBe(2);
  });

  it('should return undefined when peeking empty list', () => {
    const list = new DoublyLinkedList4<number>();
    const result = list.peek();
    expect(result).toBe(undefined);
  });

  it('should mix push and unshift', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(2);
    list.unshift(1);
    list.push(3);
    list.unshift(0);
    expect(list.toArray()).toEqual([0, 1, 2, 3]);
  });

  it('should clear list', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.clear();
    expect(list.size).toBe(0);
    expect(list.isEmpty()).toBe(true);
    expect(list.toArray()).toEqual([]);
  });

  it('should convert to array', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should return empty array for empty list toArray', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.toArray()).toEqual([]);
  });
});

describe('DoublyLinkedList4 - forEach', () => {
  it('should forEach forward', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result: number[] = [];
    list.forEach((value, index) => {
      result.push(value);
      expect(index).toBe(value - 1);
    });
    expect(result).toEqual([1, 2, 3]);
  });

  it('should forEach on empty list', () => {
    const list = new DoublyLinkedList4<number>();
    let called = false;
    list.forEach(() => {
      called = true;
    });
    expect(called).toBe(false);
  });
});

describe('DoublyLinkedList4 - filter', () => {
  it('should filter elements', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(4);
    list.push(5);
    const result = list.filter(x => x % 2 === 0);
    expect(result.toArray()).toEqual([2, 4]);
    expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should filter all elements', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(3);
    list.push(5);
    const result = list.filter(x => x % 2 === 0);
    expect(result.toArray()).toEqual([]);
  });

  it('should filter no elements', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(2);
    list.push(4);
    list.push(6);
    const result = list.filter(x => x % 2 === 0);
    expect(result.toArray()).toEqual([2, 4, 6]);
  });

  it('should filter on empty list', () => {
    const list = new DoublyLinkedList4<number>();
    const result = list.filter(() => true);
    expect(result.toArray()).toEqual([]);
  });
});

describe('DoublyLinkedList4 - map', () => {
  it('should map to new type', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.map(x => x * 2);
    expect(result.toArray()).toEqual([2, 4, 6]);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should map to strings', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.map(x => x.toString());
    expect(result.toArray()).toEqual(['1', '2', '3']);
  });

  it('should map on empty list', () => {
    const list = new DoublyLinkedList4<number>();
    const result = list.map(x => x * 2);
    expect(result.toArray()).toEqual([]);
  });
});

describe('DoublyLinkedList4 - reduce', () => {
  it('should reduce to sum', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.reduce((acc, val) => acc + val, 0);
    expect(result).toBe(6);
  });

  it('should reduce to product', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(2);
    list.push(3);
    list.push(4);
    const result = list.reduce((acc, val) => acc * val, 1);
    expect(result).toBe(24);
  });

  it('should reduce to array', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.reduce((acc: number[], val) => [...acc, val], []);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should reduce on empty list', () => {
    const list = new DoublyLinkedList4<number>();
    const result = list.reduce((acc, val) => acc + val, 10);
    expect(result).toBe(10);
  });

  it('should reduce with string accumulator', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.reduce((acc, val) => acc + val.toString(), '');
    expect(result).toBe('123');
  });
});

describe('DoublyLinkedList4 - findLast', () => {
  it('should find last matching element', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(2);
    const result = list.findLast(x => x === 2);
    expect(result).toBe(2);
  });

  it('should return undefined when no match', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.findLast(x => x > 10);
    expect(result).toBe(undefined);
  });

  it('should find last greater than value', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.findLast(x => x > 1);
    expect(result).toBe(3);
  });

  it('should return undefined on empty list', () => {
    const list = new DoublyLinkedList4<number>();
    const result = list.findLast(() => true);
    expect(result).toBe(undefined);
  });
});

describe('DoublyLinkedList4 - findLastIndex', () => {
  it('should find index of last matching element', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(2);
    const result = list.findLastIndex(x => x === 2);
    expect(result).toBe(3);
  });

  it('should return -1 when no match', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.findLastIndex(x => x > 10);
    expect(result).toBe(-1);
  });

  it('should find last index of element', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.findLastIndex(x => x > 1);
    expect(result).toBe(2);
  });

  it('should return -1 on empty list', () => {
    const list = new DoublyLinkedList4<number>();
    const result = list.findLastIndex(() => true);
    expect(result).toBe(-1);
  });
});

describe('DoublyLinkedList4 - reverse', () => {
  it('should reverse list', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.reverse();
    expect(list.toArray()).toEqual([3, 2, 1]);
  });

  it('should reverse single element list', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.reverse();
    expect(list.toArray()).toEqual([1]);
  });

  it('should reverse empty list', () => {
    const list = new DoublyLinkedList4<number>();
    list.reverse();
    expect(list.toArray()).toEqual([]);
  });

  it('should reverse twice returns original', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const original = list.toArray();
    list.reverse();
    list.reverse();
    expect(list.toArray()).toEqual(original);
  });
});

describe('DoublyLinkedList4 - insertAt', () => {
  it('should insertAt valid index', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(3);
    list.insertAt(1, 2);
    expect(list.size).toBe(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should insertAt first index', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(2);
    list.push(3);
    list.insertAt(0, 1);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should insertAt last index', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.insertAt(2, 3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should not insertAt invalid negative index', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.insertAt(-1, 99);
    expect(list.size).toBe(1);
  });

  it('should not insertAt index beyond size', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.insertAt(5, 99);
    expect(list.size).toBe(1);
  });

  it('should insertAt middle of list', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(4);
    list.push(5);
    list.insertAt(2, 3);
    expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should insertAt empty list at index 0', () => {
    const list = new DoublyLinkedList4<number>();
    list.insertAt(0, 1);
    expect(list.toArray()).toEqual([1]);
  });
});

describe('DoublyLinkedList4 - removeAt', () => {
  it('should removeAt valid index', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.removeAt(1);
    expect(result).toBe(2);
    expect(list.size).toBe(2);
    expect(list.toArray()).toEqual([1, 3]);
  });

  it('should removeAt first index', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.removeAt(0);
    expect(result).toBe(1);
    expect(list.toArray()).toEqual([2, 3]);
  });

  it('should removeAt last index', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    const result = list.removeAt(2);
    expect(result).toBe(3);
    expect(list.toArray()).toEqual([1, 2]);
  });

  it('should return undefined for removeAt invalid index', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    expect(list.removeAt(-1)).toBe(undefined);
    expect(list.removeAt(1)).toBe(undefined);
    expect(list.removeAt(10)).toBe(undefined);
  });

  it('should removeAt middle of list', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(4);
    list.push(5);
    list.removeAt(2);
    expect(list.toArray()).toEqual([1, 2, 4, 5]);
  });

  it('should removeAt single element list', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    const result = list.removeAt(0);
    expect(result).toBe(1);
    expect(list.isEmpty()).toBe(true);
  });

  it('should return undefined for removeAt on empty list', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.removeAt(0)).toBe(undefined);
  });
});

describe('DoublyLinkedList4 - concat', () => {
  it('should concat two lists', () => {
    const list1 = new DoublyLinkedList4<number>();
    list1.push(1);
    list1.push(2);
    const list2 = new DoublyLinkedList4<number>();
    list2.push(3);
    list2.push(4);
    const result = list1.concat(list2);
    expect(result.toArray()).toEqual([1, 2, 3, 4]);
    expect(list1.toArray()).toEqual([1, 2]);
    expect(list2.toArray()).toEqual([3, 4]);
  });

  it('should concat with empty list', () => {
    const list1 = new DoublyLinkedList4<number>();
    list1.push(1);
    list1.push(2);
    const list2 = new DoublyLinkedList4<number>();
    const result = list1.concat(list2);
    expect(result.toArray()).toEqual([1, 2]);
  });

  it('should concat empty list with non-empty', () => {
    const list1 = new DoublyLinkedList4<number>();
    const list2 = new DoublyLinkedList4<number>();
    list2.push(3);
    list2.push(4);
    const result = list1.concat(list2);
    expect(result.toArray()).toEqual([3, 4]);
  });

  it('should concat two empty lists', () => {
    const list1 = new DoublyLinkedList4<number>();
    const list2 = new DoublyLinkedList4<number>();
    const result = list1.concat(list2);
    expect(result.toArray()).toEqual([]);
  });

  it('should concat multiple times', () => {
    const list1 = new DoublyLinkedList4<number>();
    list1.push(1);
    const list2 = new DoublyLinkedList4<number>();
    list2.push(2);
    const list3 = new DoublyLinkedList4<number>();
    list3.push(3);
    const result = list1.concat(list2).concat(list3);
    expect(result.toArray()).toEqual([1, 2, 3]);
  });
});

describe('DoublyLinkedList4 - getTimeComplexity', () => {
  it('should return correct complexity for push', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('push')).toBe('O(1)');
  });

  it('should return correct complexity for pop', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('pop')).toBe('O(1)');
  });

  it('should return correct complexity for shift', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('shift')).toBe('O(1)');
  });

  it('should return correct complexity for unshift', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('unshift')).toBe('O(1)');
  });

  it('should return correct complexity for forEach', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('forEach')).toBe('O(n)');
  });

  it('should return correct complexity for filter', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('filter')).toBe('O(n)');
  });

  it('should return correct complexity for map', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('map')).toBe('O(n)');
  });

  it('should return correct complexity for reduce', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('reduce')).toBe('O(n)');
  });

  it('should return correct complexity for toArray', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('toArray')).toBe('O(n)');
  });

  it('should return correct complexity for findLast', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('findLast')).toBe('O(n)');
  });

  it('should return correct complexity for findLastIndex', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('findLastIndex')).toBe('O(n)');
  });

  it('should return correct complexity for reverse', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('reverse')).toBe('O(n)');
  });

  it('should return correct complexity for insertAt', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('insertAt')).toBe('O(n)');
  });

  it('should return correct complexity for removeAt', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('removeAt')).toBe('O(n)');
  });

  it('should return correct complexity for concat', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('concat')).toBe('O(n + m)');
  });

  it('should return Unknown for unknown method', () => {
    const list = new DoublyLinkedList4<number>();
    expect(list.getTimeComplexity('unknownMethod')).toBe('Unknown');
  });
});

describe('DoublyLinkedList4 - Edge Cases', () => {
  it('should work with strings', () => {
    const list = new DoublyLinkedList4<string>();
    list.push('a');
    list.push('b');
    list.push('c');
    expect(list.size).toBe(3);
    expect(list.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('should handle large list', () => {
    const list = new DoublyLinkedList4<number>();
    for (let i = 0; i < 1000; i++) {
      list.push(i);
    }
    expect(list.size).toBe(1000);
    expect(list.toArray()[500]).toBe(500);
  });

  it('should handle duplicate values', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(2);
    list.push(3);
    expect(list.size).toBe(4);
    expect(list.toArray()).toEqual([1, 2, 2, 3]);
  });

  it('should chain operations', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(4);
    const result = list.map(x => x * 2).filter(x => x > 4);
    expect(result.toArray()).toEqual([6, 8]);
  });

  it('should handle pop and push alternating', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.pop();
    list.push(4);
    expect(list.toArray()).toEqual([1, 2, 4]);
  });

  it('should handle shift and unshift alternating', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.shift();
    list.unshift(0);
    expect(list.toArray()).toEqual([0, 2, 3]);
  });

  it('should handle insertAt after reverse', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.reverse();
    list.insertAt(1, 99);
    expect(list.toArray()).toEqual([3, 99, 2, 1]);
  });

  it('should handle removeAt after reverse', () => {
    const list = new DoublyLinkedList4<number>();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(4);
    list.reverse();
    list.removeAt(1);
    expect(list.toArray()).toEqual([4, 2, 1]);
  });
});
