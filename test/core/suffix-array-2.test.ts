import type { Equal, Expect } from '@testing-library/test';
import { test, expect } from 'vitest';
import { SuffixArray2 } from '../../src/core/suffix-array-2';

test('constructor with empty string', () => {
  const sa = new SuffixArray2('');
  expect(sa.size).toBe(0);
  expect(sa.isEmpty()).toBe(true);
  expect(sa.toArray()).toEqual([]);
});

test('constructor with single character', () => {
  const sa = new SuffixArray2('a');
  expect(sa.size).toBe(1);
  expect(sa.isEmpty()).toBe(false);
  expect(sa.toArray()).toEqual([0]);
});

test('constructor with two characters', () => {
  const sa = new SuffixArray2('ab');
  expect(sa.size).toBe(2);
  expect(sa.toArray()).toEqual([0, 1]);
});

test('constructor with repeated character', () => {
  const sa = new SuffixArray2('aa');
  expect(sa.size).toBe(2);
  expect(sa.toArray()).toEqual([1, 0]);
});

test('constructor with simple word', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.size).toBe(6);
  expect(sa.toArray()).toEqual([5, 3, 1, 0, 4, 2]);
});

test('constructor with word containing same letters', () => {
  const sa = new SuffixArray2('mississippi');
  expect(sa.size).toBe(11);
});

test('constructor with longer text', () => {
  const sa = new SuffixArray2('helloworld');
  expect(sa.size).toBe(10);
});

test('constructor with numbers as string', () => {
  const sa = new SuffixArray2('123');
  expect(sa.size).toBe(3);
});

test('constructor with special characters', () => {
  const sa = new SuffixArray2('a!b@c');
  expect(sa.size).toBe(5);
});

test('constructor with spaces', () => {
  const sa = new SuffixArray2('hello world');
  expect(sa.size).toBe(11);
});

test('size getter returns correct length for empty string', () => {
  const sa = new SuffixArray2('');
  expect(sa.size).toBe(0);
});

test('size getter returns correct length for non-empty string', () => {
  const sa = new SuffixArray2('test');
  expect(sa.size).toBe(4);
});

test('size getter returns correct length for long string', () => {
  const sa = new SuffixArray2('abcdefghijklmnopqrstuvwxyz');
  expect(sa.size).toBe(26);
});

test('isEmpty returns true for empty string', () => {
  const sa = new SuffixArray2('');
  expect(sa.isEmpty()).toBe(true);
});

test('isEmpty returns false for non-empty string', () => {
  const sa = new SuffixArray2('a');
  expect(sa.isEmpty()).toBe(false);
});

test('isEmpty returns false for longer string', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.isEmpty()).toBe(false);
});

test('toArray returns copy of suffix array', () => {
  const sa = new SuffixArray2('ab');
  const arr1 = sa.toArray();
  const arr2 = sa.toArray();
  arr1[0] = 999;
  expect(arr2[0]).toBe(0);
});

test('toArray returns correct suffix array for banana', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.toArray()).toEqual([5, 3, 1, 0, 4, 2]);
});

test('toArray returns correct suffix array for a', () => {
  const sa = new SuffixArray2('a');
  expect(sa.toArray()).toEqual([0]);
});

test('substring returns correct suffix at index 0', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.substring(0)).toBe('a');
});

test('substring returns correct suffix at index 1', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.substring(1)).toBe('ana');
});

test('substring returns correct suffix at index 2', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.substring(2)).toBe('anana');
});

test('substring returns correct suffix at index 3', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.substring(3)).toBe('banana');
});

test('substring returns correct suffix at index 4', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.substring(4)).toBe('na');
});

test('substring returns correct suffix at index 5', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.substring(5)).toBe('nana');
});

test('substring returns empty string for out of bounds', () => {
  const sa = new SuffixArray2('test');
  expect(sa.substring(-1)).toBe('');
  expect(sa.substring(10)).toBe('');
});

test('substring returns empty string for empty string', () => {
  const sa = new SuffixArray2('');
  expect(sa.substring(0)).toBe('');
});

test('search returns empty array for empty pattern', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.search('')).toEqual([]);
});

test('search returns empty array for empty text', () => {
  const sa = new SuffixArray2('');
  expect(sa.search('a')).toEqual([]);
});

test('search finds single character in middle', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.search('e')).toEqual([1]);
});

test('search finds single character at start', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.search('h')).toEqual([0]);
});

test('search finds single character at end', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.search('o')).toEqual([4]);
});

test('search finds pattern that appears once', () => {
  const sa = new SuffixArray2('hello world');
  expect(sa.search('world')).toEqual([6]);
});

test('search finds pattern that appears multiple times', () => {
  const sa = new SuffixArray2('banana');
  const result = sa.search('a');
  expect(result.length).toBe(3);
  expect(result).toContain(1);
  expect(result).toContain(3);
  expect(result).toContain(5);
});

test('search finds whole string', () => {
  const sa = new SuffixArray2('test');
  expect(sa.search('test')).toEqual([0]);
});

test('search returns empty array for non-existent pattern', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.search('xyz')).toEqual([]);
});

test('search finds pattern in longer text', () => {
  const sa = new SuffixArray2('mississippi');
  const result = sa.search('iss');
  expect(result.length).toBe(2);
});

test('search results are sorted', () => {
  const sa = new SuffixArray2('banana');
  const result = sa.search('a');
  expect(result).toEqual([1, 3, 5]);
});

test('search with pattern longer than text', () => {
  const sa = new SuffixArray2('test');
  expect(sa.search('testing')).toEqual([]);
});

test('search finds overlapping patterns', () => {
  const sa = new SuffixArray2('aaaa');
  const result = sa.search('aa');
  expect(result.length).toBe(3);
});

test('search is case sensitive', () => {
  const sa = new SuffixArray2('Hello');
  expect(sa.search('h')).toEqual([]);
  expect(sa.search('H')).toEqual([0]);
});

test('contains returns true for existing single character', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.contains('e')).toBe(true);
});

test('contains returns true for existing substring', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.contains('ell')).toBe(true);
});

test('contains returns true for whole string', () => {
  const sa = new SuffixArray2('test');
  expect(sa.contains('test')).toBe(true);
});

test('contains returns false for non-existent substring', () => {
  const sa = new SuffixArray2('hello');
  expect(sa.contains('xyz')).toBe(false);
});

test('contains returns true for empty pattern', () => {
  const sa = new SuffixArray2('test');
  expect(sa.contains('')).toBe(true);
});

test('contains returns false for empty text', () => {
  const sa = new SuffixArray2('');
  expect(sa.contains('a')).toBe(false);
});

test('contains is case sensitive', () => {
  const sa = new SuffixArray2('Hello');
  expect(sa.contains('h')).toBe(false);
  expect(sa.contains('H')).toBe(true);
});

test('contains for repeated character pattern', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.contains('ana')).toBe(true);
});

test('contains for non-repeated pattern', () => {
  const sa = new SuffixArray2('abcdef');
  expect(sa.contains('cde')).toBe(true);
});

test('longestCommonPrefix returns 0 for empty string', () => {
  const sa = new SuffixArray2('');
  expect(sa.longestCommonPrefix(0)).toBe(0);
});

test('longestCommonPrefix returns 0 for single character', () => {
  const sa = new SuffixArray2('a');
  expect(sa.longestCommonPrefix(0)).toBe(0);
});

test('longestCommonPrefix for consecutive suffixes', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.longestCommonPrefix(0)).toBe(1);
});

test('longestCommonPrefix for non-consecutive suffixes', () => {
  const sa = new SuffixArray2('banana');
  expect(sa.longestCommonPrefix(1)).toBe(3);
});

test('longestCommonPrefix for suffixes with no common prefix', () => {
  const sa = new SuffixArray2('ab');
  expect(sa.longestCommonPrefix(0)).toBe(0);
});

test('longestCommonPrefix for out of bounds negative', () => {
  const sa = new SuffixArray2('test');
  expect(sa.longestCommonPrefix(-1)).toBe(0);
});

test('longestCommonPrefix for out of bounds too large', () => {
  const sa = new SuffixArray2('test');
  expect(sa.longestCommonPrefix(10)).toBe(0);
});

test('longestCommonPrefix for last valid index', () => {
  const sa = new SuffixArray2('test');
  expect(sa.longestCommonPrefix(2)).toBe(1);
});

test('longestCommonPrefix for string with repeated characters', () => {
  const sa = new SuffixArray2('aaaa');
  expect(sa.longestCommonPrefix(0)).toBe(1);
  expect(sa.longestCommonPrefix(1)).toBe(2);
  expect(sa.longestCommonPrefix(2)).toBe(3);
});

test('longestCommonPrefix for string with unique characters', () => {
  const sa = new SuffixArray2('abcd');
  expect(sa.longestCommonPrefix(0)).toBe(0);
  expect(sa.longestCommonPrefix(1)).toBe(0);
  expect(sa.longestCommonPrefix(2)).toBe(0);
});

test('longestCommonPrefix for mississippi', () => {
  const sa = new SuffixArray2('mississippi');
  const lcp = sa.longestCommonPrefix(0);
  expect(lcp).toBeGreaterThanOrEqual(0);
  expect(lcp).toBeLessThanOrEqual(sa.size);
});
