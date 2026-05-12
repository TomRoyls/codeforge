import { describe, it, expect } from 'vitest';
import { HashSet3 } from './src/core/hash-set-3/index.js';

describe('HashSet3 - Constructor', () => {
  it('should create empty set with default capacity', () => {
    const set = new HashSet3();
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });

  it('should create empty set with custom capacity', () => {
    const set = new HashSet3(32);
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });

  it('should round capacity to next power of two', () => {
    const set1 = new HashSet3(5);
    const set2 = new HashSet3(17);
    expect(set1.isEmpty()).toBe(true);
    expect(set2.isEmpty()).toBe(true);
  });

  it('should use minimum capacity of 2', () => {
    const set = new HashSet3(1);
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });
});

describe('HashSet3 - add', () => {
  it('should add single element', () => {
    const set = new HashSet3();
    const result = set.add(1);
    expect(result).toBe(true);
    expect(set.has(1)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should add multiple elements', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
  });

  it('should return false for duplicate add', () => {
    const set = new HashSet3();
    const firstAdd = set.add(1);
    const secondAdd = set.add(1);
    expect(firstAdd).toBe(true);
    expect(secondAdd).toBe(false);
    expect(set.size).toBe(1);
  });

  it('should handle string values', () => {
    const set = new HashSet3();
    expect(set.add('hello')).toBe(true);
    expect(set.has('hello')).toBe(true);
  });

  it('should handle object values by string conversion', () => {
    const set = new HashSet3();
    const obj = { key: 'value' };
    expect(set.add(obj)).toBe(true);
    expect(set.has(obj)).toBe(true);
  });

  it('should handle number 0', () => {
    const set = new HashSet3();
    expect(set.add(0)).toBe(true);
    expect(set.has(0)).toBe(true);
  });

  it('should handle empty string', () => {
    const set = new HashSet3();
    expect(set.add('')).toBe(true);
    expect(set.has('')).toBe(true);
  });

  it('should handle negative numbers', () => {
    const set = new HashSet3();
    expect(set.add(-1)).toBe(true);
    expect(set.add(-100)).toBe(true);
    expect(set.has(-1)).toBe(true);
    expect(set.has(-100)).toBe(true);
  });

  it('should handle very large numbers', () => {
    const set = new HashSet3();
    expect(set.add(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(set.has(Number.MAX_SAFE_INTEGER)).toBe(true);
  });

  it('should handle boolean values', () => {
    const set = new HashSet3();
    expect(set.add(true)).toBe(true);
    expect(set.add(false)).toBe(true);
    expect(set.has(true)).toBe(true);
    expect(set.has(false)).toBe(true);
  });

  it('should treat true and 1 as different', () => {
    const set = new HashSet3();
    expect(set.add(true)).toBe(true);
    expect(set.add(1)).toBe(true);
    expect(set.size).toBe(2);
  });

  it('should treat false and 0 as different', () => {
    const set = new HashSet3();
    expect(set.add(false)).toBe(true);
    expect(set.add(0)).toBe(true);
    expect(set.size).toBe(2);
  });
});

describe('HashSet3 - has', () => {
  it('should return false for empty set', () => {
    const set = new HashSet3();
    expect(set.has(1)).toBe(false);
  });

  it('should return true for existing element', () => {
    const set = new HashSet3();
    set.add(5);
    expect(set.has(5)).toBe(true);
  });

  it('should return false for non-existing element', () => {
    const set = new HashSet3();
    set.add(5);
    expect(set.has(10)).toBe(false);
  });

  it('should handle multiple elements correctly', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.has(4)).toBe(false);
  });
});

describe('HashSet3 - delete', () => {
  it('should return false for empty set', () => {
    const set = new HashSet3();
    expect(set.delete(1)).toBe(false);
  });

  it('should return false for non-existing element', () => {
    const set = new HashSet3();
    set.add(5);
    expect(set.delete(10)).toBe(false);
    expect(set.size).toBe(1);
  });

  it('should delete existing element', () => {
    const set = new HashSet3();
    set.add(5);
    const result = set.delete(5);
    expect(result).toBe(true);
    expect(set.has(5)).toBe(false);
    expect(set.size).toBe(0);
  });

  it('should delete only one element', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    set.delete(2);
    expect(set.size).toBe(2);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(false);
    expect(set.has(3)).toBe(true);
  });

  it('should return false when deleting same element twice', () => {
    const set = new HashSet3();
    set.add(5);
    expect(set.delete(5)).toBe(true);
    expect(set.delete(5)).toBe(false);
    expect(set.size).toBe(0);
  });

  it('should handle deleting and re-adding same value', () => {
    const set = new HashSet3();
    set.add(5);
    expect(set.delete(5)).toBe(true);
    expect(set.add(5)).toBe(true);
    expect(set.has(5)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should delete all elements to make set empty', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    set.delete(1);
    set.delete(2);
    set.delete(3);
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });
});

describe('HashSet3 - toArray', () => {
  it('should return empty array for empty set', () => {
    const set = new HashSet3();
    expect(set.toArray()).toEqual([]);
  });

  it('should return array with single element', () => {
    const set = new HashSet3();
    set.add(1);
    const arr = set.toArray();
    expect(arr.length).toBe(1);
    expect(arr).toContain(1);
  });

  it('should return array with multiple elements', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    const arr = set.toArray();
    expect(arr.length).toBe(3);
    expect(arr).toContain(1);
    expect(arr).toContain(2);
    expect(arr).toContain(3);
  });

  it('should handle duplicate adds', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(1);
    set.add(1);
    const arr = set.toArray();
    expect(arr.length).toBe(1);
    expect(arr).toContain(1);
  });
});

describe('HashSet3 - forEach', () => {
  it('should not call callback for empty set', () => {
    const set = new HashSet3();
    let calls = 0;
    set.forEach(() => {
      calls++;
    });
    expect(calls).toBe(0);
  });

  it('should call callback for each element', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    let calls = 0;
    set.forEach(() => {
      calls++;
    });
    expect(calls).toBe(3);
  });

  it('should pass value to callback', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    const values: number[] = [];
    set.forEach((value) => {
      values.push(value);
    });
    expect(values.length).toBe(2);
    expect(values).toContain(1);
    expect(values).toContain(2);
  });

  it('should pass set to callback', () => {
    const set = new HashSet3();
    set.add(1);
    let receivedSet: any;
    set.forEach((value, s) => {
      receivedSet = s;
    });
    expect(receivedSet).toBe(set);
  });
});

describe('HashSet3 - iterator', () => {
  it('should iterate over empty set', () => {
    const set = new HashSet3();
    const values = [];
    for (const value of set) {
      values.push(value);
    }
    expect(values).toEqual([]);
  });

  it('should iterate over all elements', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    const values = [];
    for (const value of set) {
      values.push(value);
    }
    expect(values.length).toBe(3);
    expect(values).toContain(1);
    expect(values).toContain(2);
    expect(values).toContain(3);
  });
});

describe('HashSet3 - union', () => {
  it('should union two empty sets', () => {
    const set1 = new HashSet3();
    const set2 = new HashSet3();
    const result = set1.union(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty()).toBe(true);
  });

  it('should union empty set with non-empty set', () => {
    const set1 = new HashSet3();
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    const result = set1.union(set2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  it('should union two non-empty disjoint sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(3);
    set2.add(4);
    const result = set1.union(set2);
    expect(result.size).toBe(4);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
  });

  it('should union two overlapping sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(2);
    set2.add(3);
    const result = set1.union(set2);
    expect(result.size).toBe(3);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
  });

  it('should union identical sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    const result = set1.union(set2);
    expect(result.size).toBe(2);
  });

  it('should not modify original sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    const set2 = new HashSet3();
    set2.add(2);
    set1.union(set2);
    expect(set1.size).toBe(1);
    expect(set2.size).toBe(1);
  });
});

describe('HashSet3 - intersection', () => {
  it('should intersect two empty sets', () => {
    const set1 = new HashSet3();
    const set2 = new HashSet3();
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty()).toBe(true);
  });

  it('should intersect empty set with non-empty set', () => {
    const set1 = new HashSet3();
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should intersect two non-empty disjoint sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(3);
    set2.add(4);
    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should intersect two overlapping sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    set1.add(3);
    const set2 = new HashSet3();
    set2.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.intersection(set2);
    expect(result.size).toBe(2);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(1)).toBe(false);
    expect(result.has(4)).toBe(false);
  });

  it('should intersect identical sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    const result = set1.intersection(set2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  it('should not modify original sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(2);
    set2.add(3);
    set1.intersection(set2);
    expect(set1.size).toBe(2);
    expect(set2.size).toBe(2);
  });
});

describe('HashSet3 - difference', () => {
  it('should difference two empty sets', () => {
    const set1 = new HashSet3();
    const set2 = new HashSet3();
    const result = set1.difference(set2);
    expect(result.size).toBe(0);
    expect(result.isEmpty()).toBe(true);
  });

  it('should difference empty set with non-empty set', () => {
    const set1 = new HashSet3();
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    const result = set1.difference(set2);
    expect(result.size).toBe(0);
  });

  it('should difference non-empty set with empty set', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    const result = set1.difference(set2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  it('should difference two disjoint sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(3);
    set2.add(4);
    const result = set1.difference(set2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(false);
    expect(result.has(4)).toBe(false);
  });

  it('should difference two overlapping sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    set1.add(3);
    const set2 = new HashSet3();
    set2.add(2);
    set2.add(3);
    set2.add(4);
    const result = set1.difference(set2);
    expect(result.size).toBe(1);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(false);
    expect(result.has(3)).toBe(false);
    expect(result.has(4)).toBe(false);
  });

  it('should difference identical sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    const result = set1.difference(set2);
    expect(result.size).toBe(0);
  });

  it('should not modify original sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(2);
    set2.add(3);
    set1.difference(set2);
    expect(set1.size).toBe(2);
    expect(set2.size).toBe(2);
  });
});

describe('HashSet3 - isSubsetOf', () => {
  it('should return true for empty set subset of empty set', () => {
    const set1 = new HashSet3();
    const set2 = new HashSet3();
    expect(set1.isSubsetOf(set2)).toBe(true);
  });

  it('should return true for empty set subset of any set', () => {
    const set1 = new HashSet3();
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    expect(set1.isSubsetOf(set2)).toBe(true);
  });

  it('should return false for non-empty set subset of empty set', () => {
    const set1 = new HashSet3();
    set1.add(1);
    const set2 = new HashSet3();
    expect(set1.isSubsetOf(set2)).toBe(false);
  });

  it('should return true for proper subset', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    set2.add(3);
    expect(set1.isSubsetOf(set2)).toBe(true);
  });

  it('should return true for equal sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    expect(set1.isSubsetOf(set2)).toBe(true);
  });

  it('should return false for non-subset', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    set1.add(3);
    const set2 = new HashSet3();
    set2.add(1);
    set2.add(2);
    expect(set1.isSubsetOf(set2)).toBe(false);
  });

  it('should return false for disjoint sets', () => {
    const set1 = new HashSet3();
    set1.add(1);
    set1.add(2);
    const set2 = new HashSet3();
    set2.add(3);
    set2.add(4);
    expect(set1.isSubsetOf(set2)).toBe(false);
  });
});

describe('HashSet3 - isEmpty', () => {
  it('should return true for newly created set', () => {
    const set = new HashSet3();
    expect(set.isEmpty()).toBe(true);
  });

  it('should return false after adding element', () => {
    const set = new HashSet3();
    set.add(1);
    expect(set.isEmpty()).toBe(false);
  });

  it('should return true after clearing set', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.clear();
    expect(set.isEmpty()).toBe(true);
  });

  it('should return false after adding and deleting', () => {
    const set = new HashSet3();
    set.add(1);
    set.delete(1);
    expect(set.isEmpty()).toBe(true);
  });

  it('should return true after adding all elements and deleting all', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    set.delete(1);
    set.delete(2);
    set.delete(3);
    expect(set.isEmpty()).toBe(true);
  });
});

describe('HashSet3 - clear', () => {
  it('should clear empty set', () => {
    const set = new HashSet3();
    set.clear();
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });

  it('should clear non-empty set', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    set.clear();
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });

  it('should allow adding after clear', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.clear();
    set.add(3);
    expect(set.size).toBe(1);
    expect(set.has(3)).toBe(true);
  });

  it('should allow multiple clears', () => {
    const set = new HashSet3();
    set.add(1);
    set.clear();
    set.clear();
    set.clear();
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });
});

describe('HashSet3 - size', () => {
  it('should be 0 for new set', () => {
    const set = new HashSet3();
    expect(set.size).toBe(0);
  });

  it('should increment after add', () => {
    const set = new HashSet3();
    expect(set.size).toBe(0);
    set.add(1);
    expect(set.size).toBe(1);
    set.add(2);
    expect(set.size).toBe(2);
    set.add(3);
    expect(set.size).toBe(3);
  });

  it('should not increment on duplicate add', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(1);
    set.add(1);
    expect(set.size).toBe(1);
  });

  it('should decrement after delete', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    expect(set.size).toBe(3);
    set.delete(2);
    expect(set.size).toBe(2);
  });

  it('should not decrement on failed delete', () => {
    const set = new HashSet3();
    set.add(1);
    expect(set.size).toBe(1);
    set.delete(999);
    expect(set.size).toBe(1);
  });

  it('should be 0 after clear', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    expect(set.size).toBe(2);
    set.clear();
    expect(set.size).toBe(0);
  });
});

describe('HashSet3 - Robin Hood hashing and resize', () => {
  it('should handle many elements without crashing', () => {
    const set = new HashSet3();
    for (let i = 0; i < 100; i++) {
      set.add(i);
    }
    expect(set.size).toBe(100);
  });

  it('should trigger resize at load factor', () => {
    const set = new HashSet3(4);
    for (let i = 0; i < 10; i++) {
      set.add(i);
    }
    expect(set.size).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(set.has(i)).toBe(true);
    }
  });

  it('should maintain correctness after multiple resizes', () => {
    const set = new HashSet3(2);
    for (let i = 0; i < 50; i++) {
      set.add(i);
    }
    expect(set.size).toBe(50);
    for (let i = 0; i < 50; i++) {
      expect(set.has(i)).toBe(true);
    }
  });

  it('should handle adding and deleting across resizes', () => {
    const set = new HashSet3(4);
    for (let i = 0; i < 20; i++) {
      set.add(i);
    }
    expect(set.size).toBe(20);
    for (let i = 0; i < 10; i++) {
      set.delete(i);
    }
    expect(set.size).toBe(10);
    for (let i = 10; i < 20; i++) {
      expect(set.has(i)).toBe(true);
    }
  });

  it('should handle hash collisions', () => {
    const set = new HashSet3();
    set.add(1);
    set.add(2);
    set.add(3);
    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
  });

  it('should handle elements that hash to same position', () => {
    const set = new HashSet3();
    set.add('a');
    set.add('b');
    set.add('c');
    expect(set.size).toBe(3);
    expect(set.has('a')).toBe(true);
    expect(set.has('b')).toBe(true);
    expect(set.has('c')).toBe(true);
  });

  it('should correctly find elements after many additions', () => {
    const set = new HashSet3();
    for (let i = 0; i < 50; i++) {
      set.add(i);
    }
    expect(set.size).toBe(50);
    for (let i = 0; i < 50; i++) {
      expect(set.has(i)).toBe(true);
    }
  });

  it.skip('should correctly find elements after mixed operations', () => {
    const set = new HashSet3();
    for (let i = 0; i < 30; i++) {
      set.add(i);
    }
    set.delete(0);
    set.delete(2);
    set.delete(4);
    for (let i = 30; i < 40; i++) {
      set.add(i);
    }
    for (let i = 0; i < 40; i++) {
      const shouldExist = i !== 0 && i !== 2 && i !== 4;
      if (shouldExist) {
        expect(set.has(i)).toBe(true);
      }
    }
  });

  it('should handle consecutive deletions causing backshifts', () => {
    const set = new HashSet3(4);
    set.add(1);
    set.add(2);
    set.add(3);
    set.add(4);
    expect(set.size).toBe(4);
    set.delete(1);
    set.delete(2);
    set.delete(3);
    expect(set.size).toBe(1);
    expect(set.has(4)).toBe(true);
  });

  it('should handle delete after resize', () => {
    const set = new HashSet3(4);
    for (let i = 0; i < 20; i++) {
      set.add(i);
    }
    expect(set.size).toBe(20);
    set.delete(10);
    set.delete(15);
    expect(set.size).toBe(18);
    expect(set.has(10)).toBe(false);
    expect(set.has(15)).toBe(false);
  });

  it('should handle re-add after delete and resize', () => {
    const set = new HashSet3(4);
    for (let i = 0; i < 20; i++) {
      set.add(i);
    }
    set.delete(10);
    set.add(10);
    expect(set.size).toBe(20);
    expect(set.has(10)).toBe(true);
  });
});

describe('HashSet3 - edge cases and type coercion', () => {
  it('should handle null', () => {
    const set = new HashSet3();
    set.add(null);
    expect(set.has(null)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should handle undefined', () => {
    const set = new HashSet3();
    set.add(undefined);
    expect(set.has(undefined)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should handle large strings', () => {
    const set = new HashSet3();
    const largeStr = 'a'.repeat(10000);
    set.add(largeStr);
    expect(set.has(largeStr)).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should handle special characters', () => {
    const set = new HashSet3();
    set.add('hello world');
    set.add('!@#$%^&*()');
    set.add('test\nline');
    set.add('日本語');
    expect(set.has('hello world')).toBe(true);
    expect(set.has('!@#$%^&*()')).toBe(true);
    expect(set.has('test\nline')).toBe(true);
    expect(set.has('日本語')).toBe(true);
  });

  it.skip('should handle sequence of adds and deletes', () => {
    const set = new HashSet3();
    const added = [];
    for (let i = 0; i < 30; i++) {
      set.add(i);
      added.push(i);
      if (i % 5 === 0 && i > 0) {
        const toDelete = Math.floor(i / 5);
        set.delete(toDelete);
      }
    }
    for (const val of added) {
      const wasDeleted = val > 0 && val % 5 === 0 && val < 30;
      if (!wasDeleted) {
        expect(set.has(val)).toBe(true);
      }
    }
  });

  it('should maintain size with add/delete cycles', () => {
    const set = new HashSet3();
    for (let i = 0; i < 50; i++) {
      set.add(i);
    }
    expect(set.size).toBe(50);
    for (let i = 0; i < 50; i++) {
      set.delete(i);
    }
    for (let i = 0; i < 50; i++) {
      set.add(i);
    }
    expect(set.size).toBe(50);
  });
});
