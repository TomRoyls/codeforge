import { describe, it, expect } from 'vitest';
import { GrailSort, isSorted } from '../src/core/grail-sort/index.js';

describe('GrailSort - Empty Array', () => {
  it('should return empty array', () => {
    const arr: number[] = [];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([]);
  });

  it('should return same array reference', () => {
    const arr: number[] = [];
    const result = GrailSort.sort(arr);
    expect(result).toBe(arr);
  });
});

describe('GrailSort - Single Element', () => {
  it('should return single element array', () => {
    const arr = [5];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([5]);
  });

  it('should return same array reference for single element', () => {
    const arr = [5];
    const result = GrailSort.sort(arr);
    expect(result).toBe(arr);
  });
});

describe('GrailSort - Numbers Below Threshold', () => {
  it('should sort 10 numbers', () => {
    const arr = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should sort 31 numbers (below threshold)', () => {
    const arr = Array.from({ length: 31 }, () => Math.floor(Math.random() * 100));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });

  it('should sort already sorted array', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should sort reverse sorted array', () => {
    const arr = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should sort array with duplicates', () => {
    const arr = [5, 2, 8, 2, 5, 8, 1, 2];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([1, 2, 2, 2, 5, 5, 8, 8]);
  });

  it('should sort array with all same values', () => {
    const arr = [5, 5, 5, 5, 5];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([5, 5, 5, 5, 5]);
  });

  it('should sort negative numbers', () => {
    const arr = [5, -2, 8, -1, -9, 3, -7, 4, 6, 0];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([-9, -7, -2, -1, 0, 3, 4, 5, 6, 8]);
  });

  it('should sort with zero', () => {
    const arr = [5, 0, -5, 10, -10];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([-10, -5, 0, 5, 10]);
  });
});

describe('GrailSort - Numbers Above Threshold', () => {
  it('should sort 32 numbers (at threshold)', () => {
    const arr = Array.from({ length: 32 }, () => Math.floor(Math.random() * 100));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });

  it('should sort 50 numbers', () => {
    const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });

  it('should sort 100 numbers', () => {
    const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });

  it('should sort 1000 numbers', () => {
    const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });

  it('should sort already sorted array above threshold', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const result = GrailSort.sort(arr);
    expect(result).toEqual(arr);
  });

  it('should sort reverse sorted array above threshold', () => {
    const arr = Array.from({ length: 100 }, (_, i) => 99 - i);
    const result = GrailSort.sort(arr);
    const sorted = Array.from({ length: 100 }, (_, i) => i);
    expect(result).toEqual(sorted);
  });

  it('should sort large array with duplicates', () => {
    const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 10));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });
});

describe('GrailSort - Strings', () => {
  it('should sort strings alphabetically', () => {
    const arr = ['zebra', 'apple', 'banana', 'cherry', 'date'];
    const result = GrailSort.sort(arr);
    expect(result).toEqual(['apple', 'banana', 'cherry', 'date', 'zebra']);
  });

  it('should sort strings below threshold', () => {
    const arr = ['e', 'a', 'c', 'b', 'd'];
    const result = GrailSort.sort(arr);
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('should sort strings above threshold', () => {
    const arr = Array.from({ length: 50 }, (_, i) => String.fromCharCode(90 - (i % 26)));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort();
    expect(result).toEqual(sorted);
  });

  it('should sort strings with duplicates', () => {
    const arr = ['apple', 'banana', 'apple', 'cherry', 'banana'];
    const result = GrailSort.sort(arr);
    expect(result).toEqual(['apple', 'apple', 'banana', 'banana', 'cherry']);
  });

  it('should sort empty strings', () => {
    const arr = ['', 'a', '', 'b', ''];
    const result = GrailSort.sort(arr);
    expect(result).toEqual(['', '', '', 'a', 'b']);
  });
});

describe('GrailSort - Custom Comparator', () => {
  it('should sort with reverse number comparator', () => {
    const arr = [5, 2, 8, 1, 9];
    const result = GrailSort.sort(arr, (a, b) => b - a);
    expect(result).toEqual([9, 8, 5, 2, 1]);
  });

  it('should sort with custom string comparator (case insensitive)', () => {
    const arr = ['Zebra', 'apple', 'Banana', 'cherry', 'Date'];
    const result = GrailSort.sort(arr, (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    expect(result).toEqual(['apple', 'Banana', 'cherry', 'Date', 'Zebra']);
  });

  it('should sort objects by property', () => {
    interface Item {
      id: number;
      name: string;
    }
    const arr: Item[] = [
      { id: 3, name: 'three' },
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
    ];
    const result = GrailSort.sort(arr, (a, b) => a.id - b.id);
    expect(result).toEqual([
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
      { id: 3, name: 'three' },
    ]);
  });

  it('should sort objects by string property', () => {
    interface Item {
      name: string;
    }
    const arr: Item[] = [
      { name: 'zebra' },
      { name: 'apple' },
      { name: 'banana' },
    ];
    const result = GrailSort.sort(arr, (a, b) => a.name.localeCompare(b.name));
    expect(result).toEqual([
      { name: 'apple' },
      { name: 'banana' },
      { name: 'zebra' },
    ]);
  });

  it('should sort with custom comparator below threshold', () => {
    const arr = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0];
    const result = GrailSort.sort(arr, (a, b) => b - a);
    expect(result).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
  });

  it('should sort with custom comparator above threshold', () => {
    const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100));
    const result = GrailSort.sort(arr, (a, b) => b - a);
    const sorted = [...arr].sort((a, b) => b - a);
    expect(result).toEqual(sorted);
  });
});

describe('GrailSort - Edge Cases', () => {
  it('should handle very large numbers', () => {
    const arr = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0, 1, -1];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([Number.MIN_SAFE_INTEGER, -1, 0, 1, Number.MAX_SAFE_INTEGER]);
  });

  it('should handle floating point numbers', () => {
    const arr = [3.14, 1.41, 2.71, 0.5, 1.0];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([0.5, 1.0, 1.41, 2.71, 3.14]);
  });

  it('should handle NaN values', () => {
    const arr = [5, NaN, 3, NaN, 1];
    const result = GrailSort.sort(arr);
    expect(result.length).toBe(5);
    expect(result.includes(NaN)).toBe(true);
  });

  it('should handle Infinity', () => {
    const arr = [5, Infinity, 3, -Infinity, 1];
    const result = GrailSort.sort(arr);
    expect(result[0]).toBe(-Infinity);
    expect(result[result.length - 1]).toBe(Infinity);
  });

  it('should handle single negative number', () => {
    const arr = [-5];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([-5]);
  });

  it('should handle consecutive numbers', () => {
    const arr = [5, 6, 7, 8, 9, 10];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it('should handle alternating positive and negative', () => {
    const arr = [1, -1, 2, -2, 3, -3, 4, -4];
    const result = GrailSort.sort(arr);
    expect(result).toEqual([-4, -3, -2, -1, 1, 2, 3, 4]);
  });
});

describe('GrailSort - In-Place Sorting', () => {
  it('should modify original array', () => {
    const arr = [5, 2, 8, 1, 9];
    const originalArr = [...arr];
    GrailSort.sort(arr);
    expect(arr).not.toEqual(originalArr);
  });

  it('should return same reference', () => {
    const arr = [5, 2, 8, 1, 9];
    const result = GrailSort.sort(arr);
    expect(result).toBe(arr);
  });
});

describe('isSorted - Empty Array', () => {
  it('should return true for empty array', () => {
    expect(isSorted([])).toBe(true);
  });
});

describe('isSorted - Single Element', () => {
  it('should return true for single element', () => {
    expect(isSorted([5])).toBe(true);
  });
});

describe('isSorted - Numbers', () => {
  it('should return true for sorted numbers', () => {
    expect(isSorted([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should return false for unsorted numbers', () => {
    expect(isSorted([1, 3, 2, 4, 5])).toBe(false);
  });

  it('should return true for equal numbers', () => {
    expect(isSorted([5, 5, 5, 5])).toBe(true);
  });

  it('should return true for sorted with duplicates', () => {
    expect(isSorted([1, 2, 2, 3, 4])).toBe(true);
  });

  it('should return false for reverse sorted', () => {
    expect(isSorted([5, 4, 3, 2, 1])).toBe(false);
  });

  it('should work with negative numbers', () => {
    expect(isSorted([-5, -3, 0, 2, 5])).toBe(true);
    expect(isSorted([2, 0, -3, -5])).toBe(false);
  });

  it('should work with large arrays', () => {
    const sorted = Array.from({ length: 1000 }, (_, i) => i);
    expect(isSorted(sorted)).toBe(true);
  });

  it('should detect unsorted in large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    arr[500] = 400;
    expect(isSorted(arr)).toBe(false);
  });
});

describe('isSorted - Strings', () => {
  it('should return true for sorted strings', () => {
    expect(isSorted(['apple', 'banana', 'cherry'])).toBe(true);
  });

  it('should return false for unsorted strings', () => {
    expect(isSorted(['apple', 'cherry', 'banana'])).toBe(false);
  });

  it('should return true for sorted with duplicates', () => {
    expect(isSorted(['apple', 'banana', 'banana', 'cherry'])).toBe(true);
  });

  it('should work with empty strings', () => {
    expect(isSorted(['', 'a', 'b'])).toBe(true);
    expect(isSorted(['a', '', 'b'])).toBe(false);
  });
});

describe('isSorted - Custom Comparator', () => {
  it('should work with reverse comparator', () => {
    expect(isSorted([5, 4, 3, 2, 1], (a, b) => b - a)).toBe(true);
    expect(isSorted([1, 2, 3, 4, 5], (a, b) => b - a)).toBe(false);
  });

  it('should work with string comparator (case insensitive)', () => {
    expect(isSorted(['Apple', 'banana', 'Cherry'], (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))).toBe(true);
  });

  it('should work with object comparator', () => {
    interface Item {
      id: number;
    }
    const sorted: Item[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const unsorted: Item[] = [{ id: 1 }, { id: 3 }, { id: 2 }];
    expect(isSorted(sorted, (a, b) => a.id - b.id)).toBe(true);
    expect(isSorted(unsorted, (a, b) => a.id - b.id)).toBe(false);
  });
});

describe('GrailSort - Performance', () => {
  it('should handle 10000 numbers', () => {
    const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100000));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });

  it('should handle 100000 numbers', () => {
    const arr = Array.from({ length: 100000 }, () => Math.floor(Math.random() * 1000000));
    const result = GrailSort.sort(arr);
    const sorted = [...arr].sort((a, b) => a - b);
    expect(result).toEqual(sorted);
  });
});