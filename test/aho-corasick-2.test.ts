import { describe, it, expect } from 'vitest';
import { AhoCorasick2 } from '../src/core/aho-corasick-2/index.js';

describe('AhoCorasick2', () => {
  it('should handle empty patterns', () => {
    const ac = new AhoCorasick2([]);
    const result = ac.search('test');
    expect(result).toEqual([]);
    expect(ac.hasMatch('test')).toBe(false);
  });

  it('should match single pattern', () => {
    const ac = new AhoCorasick2(['test']);
    const result = ac.search('this is a test');
    expect(result).toEqual([{ pattern: 'test', startIndex: 10, endIndex: 13 }]);
  });

  it('should not match when pattern not present', () => {
    const ac = new AhoCorasick2(['hello']);
    const result = ac.search('world');
    expect(result).toEqual([]);
    expect(ac.hasMatch('world')).toBe(false);
  });

  it('should match multiple patterns', () => {
    const ac = new AhoCorasick2(['he', 'she', 'his', 'hers']);
    const result = ac.search('ushers');
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((r) => r.pattern === 'she')).toBe(true);
    expect(result.some((r) => r.pattern === 'he')).toBe(true);
    expect(result.some((r) => r.pattern === 'hers')).toBe(true);
  });

  it('should handle overlapping matches', () => {
    const ac = new AhoCorasick2(['ab', 'bc', 'abc']);
    const result = ac.search('abc');
    expect(result).toContainEqual({ pattern: 'ab', startIndex: 0, endIndex: 1 });
    expect(result).toContainEqual({ pattern: 'bc', startIndex: 1, endIndex: 2 });
    expect(result).toContainEqual({ pattern: 'abc', startIndex: 0, endIndex: 2 });
  });

  it('should find pattern at start of text', () => {
    const ac = new AhoCorasick2(['start']);
    const result = ac.search('start of text');
    expect(result).toEqual([{ pattern: 'start', startIndex: 0, endIndex: 4 }]);
  });

  it('should find pattern at end of text', () => {
    const ac = new AhoCorasick2(['end']);
    const result = ac.search('text at the end');
    expect(result).toEqual([{ pattern: 'end', startIndex: 12, endIndex: 14 }]);
  });

  it('should handle single character patterns', () => {
    const ac = new AhoCorasick2(['a', 'b', 'c']);
    const result = ac.search('abc');
    expect(result).toContainEqual({ pattern: 'a', startIndex: 0, endIndex: 0 });
    expect(result).toContainEqual({ pattern: 'b', startIndex: 1, endIndex: 1 });
    expect(result).toContainEqual({ pattern: 'c', startIndex: 2, endIndex: 2 });
  });

  it('should handle repeated patterns', () => {
    const ac = new AhoCorasick2(['ab', 'ab']);
    const result = ac.search('ab ab');
    expect(result.filter((r) => r.pattern === 'ab').length).toBe(4);
  });

  it('should return all patterns from patterns method', () => {
    const patterns = ['he', 'she', 'his', 'hers'];
    const ac = new AhoCorasick2(patterns);
    expect(ac.patterns()).toEqual(patterns);
  });

  it('should add pattern with addPattern', () => {
    const ac = new AhoCorasick2(['he']);
    ac.addPattern('she');
    const result = ac.search('she');
    expect(result).toContainEqual({ pattern: 'she', startIndex: 0, endIndex: 2 });
  });

  it('should maintain existing patterns after addPattern', () => {
    const ac = new AhoCorasick2(['he']);
    ac.addPattern('she');
    const result = ac.search('he she');
    expect(result).toContainEqual({ pattern: 'he', startIndex: 0, endIndex: 1 });
    expect(result).toContainEqual({ pattern: 'she', startIndex: 3, endIndex: 5 });
  });

  it('should return correct start and end indices', () => {
    const ac = new AhoCorasick2(['test']);
    const result = ac.search('test');
    expect(result[0]!.startIndex).toBe(0);
    expect(result[0]!.endIndex).toBe(3);
  });

  it('should handle case sensitivity', () => {
    const ac = new AhoCorasick2(['test']);
    const resultLower = ac.search('test');
    const resultUpper = ac.search('TEST');
    expect(resultLower.length).toBe(1);
    expect(resultUpper.length).toBe(0);
  });

  it('should find multiple occurrences of same pattern', () => {
    const ac = new AhoCorasick2(['ab']);
    const result = ac.search('ab ab ab');
    expect(result.filter((r) => r.pattern === 'ab').length).toBe(3);
  });

  it('should handle patterns that are prefixes of each other', () => {
    const ac = new AhoCorasick2(['a', 'ab', 'abc']);
    const result = ac.search('abc');
    expect(result).toContainEqual({ pattern: 'a', startIndex: 0, endIndex: 0 });
    expect(result).toContainEqual({ pattern: 'ab', startIndex: 0, endIndex: 1 });
    expect(result).toContainEqual({ pattern: 'abc', startIndex: 0, endIndex: 2 });
  });

  it('should handle patterns that share common prefix', () => {
    const ac = new AhoCorasick2(['abc', 'abd']);
    const result1 = ac.search('abc');
    const result2 = ac.search('abd');
    expect(result1).toContainEqual({ pattern: 'abc', startIndex: 0, endIndex: 2 });
    expect(result2).toContainEqual({ pattern: 'abd', startIndex: 0, endIndex: 2 });
  });

  it('should search empty text', () => {
    const ac = new AhoCorasick2(['test']);
    const result = ac.search('');
    expect(result).toEqual([]);
  });

  it('should handle hasMatch with matching text', () => {
    const ac = new AhoCorasick2(['test']);
    expect(ac.hasMatch('this is a test')).toBe(true);
  });

  it('should handle hasMatch with non-matching text', () => {
    const ac = new AhoCorasick2(['test']);
    expect(ac.hasMatch('no match here')).toBe(false);
  });

  it('should handle hasMatch with empty text', () => {
    const ac = new AhoCorasick2(['test']);
    expect(ac.hasMatch('')).toBe(false);
  });

  it('should handle hasMatch with empty patterns', () => {
    const ac = new AhoCorasick2([]);
    expect(ac.hasMatch('test')).toBe(false);
  });

  it('should find all matches in long text', () => {
    const ac = new AhoCorasick2(['ab', 'bc']);
    const result = ac.search('abcabcabc');
    expect(result.filter((r) => r.pattern === 'ab').length).toBe(3);
    expect(result.filter((r) => r.pattern === 'bc').length).toBe(3);
  });

  it('should handle pattern longer than text', () => {
    const ac = new AhoCorasick2(['longpattern']);
    const result = ac.search('short');
    expect(result).toEqual([]);
  });

  it('should handle special characters in patterns', () => {
    const ac = new AhoCorasick2(['test!', 'test?']);
    const result = ac.search('test! test?');
    expect(result).toContainEqual({ pattern: 'test!', startIndex: 0, endIndex: 4 });
    expect(result).toContainEqual({ pattern: 'test?', startIndex: 6, endIndex: 10 });
  });

  it('should handle duplicate patterns in constructor', () => {
    const ac = new AhoCorasick2(['test', 'test']);
    const result = ac.search('test');
    expect(result.filter((r) => r.pattern === 'test').length).toBeGreaterThanOrEqual(1);
  });

  it('should return empty array for empty patterns search', () => {
    const ac = new AhoCorasick2([]);
    expect(ac.patterns()).toEqual([]);
  });

  it('should add pattern to empty automaton', () => {
    const ac = new AhoCorasick2([]);
    ac.addPattern('test');
    const result = ac.search('test');
    expect(result).toContainEqual({ pattern: 'test', startIndex: 0, endIndex: 3 });
  });

  it('should handle single char patterns', () => {
    const ac = new AhoCorasick2(['a', 'b']);
    const result = ac.search('abba');
    expect(result.filter(r => r.pattern === 'a').length).toBe(2);
    expect(result.filter(r => r.pattern === 'b').length).toBe(2);
  });

  it('should handle overlapping patterns', () => {
    const ac = new AhoCorasick2(['he', 'she', 'her', 'here']);
    const result = ac.search('here');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty text search', () => {
    const ac = new AhoCorasick2(['test']);
    expect(ac.search('')).toEqual([]);
  });

  it('should handle patterns method', () => {
    const ac = new AhoCorasick2(['a', 'b', 'c']);
    expect(ac.patterns()).toEqual(['a', 'b', 'c']);
  });

  it('should handle hasMatch', () => {
    const ac = new AhoCorasick2(['cat', 'dog']);
    expect(ac.hasMatch('I have a cat')).toBe(true);
    expect(ac.hasMatch('I have a bird')).toBe(false);
  });

  it('should handle addPattern', () => {
    const ac = new AhoCorasick2(['cat']);
    ac.addPattern('dog');
    expect(ac.patterns()).toContain('dog');
    const result = ac.search('I have a dog');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
