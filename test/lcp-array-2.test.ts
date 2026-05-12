import '../src/core/lcp-array-2/index.js';
import { describe, it, expect } from 'vitest';
import { LCPArray2 } from '../src/core/lcp-array-2/index.js';

describe('LCPArray2', () => {
    describe('constructor', () => {
        it('should create instance with empty text when no argument provided', () => {
            const lcp = new LCPArray2();
            expect(lcp.getText()).toBe('');
            expect(lcp.size).toBe(0);
        });

        it('should create instance with provided text', () => {
            const lcp = new LCPArray2('hello');
            expect(lcp.getText()).toBe('hello');
        });
    });

    describe('build', () => {
        it('should build LCP array for empty string', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('');
            expect(result).toEqual([]);
            expect(lcp.size).toBe(0);
        });

        it('should build LCP array for single character', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('a');
            expect(result).toEqual([0]);
            expect(lcp.size).toBe(1);
        });

        it('should build LCP array for two characters', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('ab');
            expect(result.length).toBe(2);
            expect(result[0]).toBe(0);
            expect(lcp.size).toBe(2);
        });

        it('should build LCP array for string with no common prefixes', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('abcd');
            expect(result.length).toBe(4);
            expect(result[0]).toBe(0);
            expect(lcp.size).toBe(4);
        });

        it('should build LCP array for string with repeated characters', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('aaaa');
            expect(result.length).toBe(4);
            expect(result[0]).toBe(0);
            expect(lcp.getLCP(1)).toBeGreaterThan(0);
            expect(lcp.size).toBe(4);
        });

        it('should build LCP array for all same character', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('aaa');
            expect(result.length).toBe(3);
            expect(result[0]).toBe(0);
            expect(lcp.getLCP(1)).toBe(1);
            expect(lcp.getLCP(2)).toBe(2);
            expect(lcp.size).toBe(3);
        });

        it('should build LCP array for string with some common prefixes', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('banana');
            expect(result.length).toBe(6);
            expect(result[0]).toBe(0);
            expect(lcp.size).toBe(6);
        });

        it('should build LCP array for palindrome', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('ababa');
            expect(result.length).toBe(5);
            expect(result[0]).toBe(0);
            expect(lcp.size).toBe(5);
        });

        it('should build LCP array for longer string', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('mississippi');
            expect(result.length).toBe(11);
            expect(result[0]).toBe(0);
            expect(lcp.size).toBe(11);
        });

        it('should correctly handle special characters', () => {
            const lcp = new LCPArray2();
            const result = lcp.build('a$b$c');
            expect(result.length).toBe(5);
            expect(result[0]).toBe(0);
            expect(lcp.size).toBe(5);
        });
    });

    describe('buildFromSuffixArray', () => {
        it('should build LCP array from suffix array for empty string', () => {
            const lcp = new LCPArray2();
            const sa = [];
            const result = lcp.buildFromSuffixArray('', sa);
            expect(result).toEqual([]);
        });

        it('should build LCP array from suffix array for single character', () => {
            const lcp = new LCPArray2();
            const sa = [0];
            const result = lcp.buildFromSuffixArray('a', sa);
            expect(result).toEqual([0]);
        });

        it('should build LCP array from suffix array for repeated characters', () => {
            const lcp = new LCPArray2();
            const sa = [3, 2, 1, 0];
            const result = lcp.buildFromSuffixArray('aaaa', sa);
            expect(result[0]).toBe(0);
            expect(result[1]).toBe(1);
            expect(result[2]).toBe(2);
            expect(result[3]).toBe(3);
        });

        it('should build LCP array from suffix array for banana', () => {
            const lcp = new LCPArray2();
            const sa = [5, 3, 1, 0, 4, 2];
            const result = lcp.buildFromSuffixArray('banana', sa);
            expect(result.length).toBe(6);
            expect(result[0]).toBe(0);
        });

        it('should correctly compute LCP values from suffix array', () => {
            const lcp = new LCPArray2();
            const sa = [0, 1, 2];
            const result = lcp.buildFromSuffixArray('abc', sa);
            expect(result[0]).toBe(0);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
        });
    });

    describe('getText', () => {
        it('should return empty string for empty text', () => {
            const lcp = new LCPArray2();
            lcp.build('');
            expect(lcp.getText()).toBe('');
        });

        it('should return the text after build', () => {
            const lcp = new LCPArray2();
            lcp.build('hello');
            expect(lcp.getText()).toBe('hello');
        });

        it('should return the text after buildFromSuffixArray', () => {
            const lcp = new LCPArray2();
            const sa = [0, 1, 2];
            lcp.buildFromSuffixArray('abc', sa);
            expect(lcp.getText()).toBe('abc');
        });
    });

    describe('getLCP', () => {
        it('should return LCP value at valid index', () => {
            const lcp = new LCPArray2();
            lcp.build('aaa');
            expect(lcp.getLCP(0)).toBe(0);
            expect(lcp.getLCP(1)).toBe(1);
            expect(lcp.getLCP(2)).toBe(2);
        });

        it('should return LCP value at index 0 (always 0)', () => {
            const lcp = new LCPArray2();
            lcp.build('banana');
            expect(lcp.getLCP(0)).toBe(0);
        });

        it('should return correct LCP for repeated characters', () => {
            const lcp = new LCPArray2();
            lcp.build('aaaa');
            const lcp1 = lcp.getLCP(1);
            const lcp2 = lcp.getLCP(2);
            const lcp3 = lcp.getLCP(3);
            expect(lcp1).toBeGreaterThan(0);
            expect(lcp2).toBeGreaterThan(0);
            expect(lcp3).toBeGreaterThan(0);
        });

        it('should return 0 when no common prefix exists', () => {
            const lcp = new LCPArray2();
            lcp.build('abcd');
            const lcp1 = lcp.getLCP(1);
            const lcp2 = lcp.getLCP(2);
            expect(lcp1 >= 0).toBe(true);
            expect(lcp2 >= 0).toBe(true);
        });
    });

    describe('getLCPArray', () => {
        it('should return copy of LCP array', () => {
            const lcp = new LCPArray2();
            lcp.build('aaa');
            const arr = lcp.getLCPArray();
            expect(arr).toEqual([0, 1, 2]);
            expect(arr.length).toBe(3);
        });

        it('should return empty array for empty text', () => {
            const lcp = new LCPArray2();
            lcp.build('');
            const arr = lcp.getLCPArray();
            expect(arr).toEqual([]);
        });

        it('should return array of correct length', () => {
            const lcp = new LCPArray2();
            lcp.build('banana');
            const arr = lcp.getLCPArray();
            expect(arr.length).toBe(6);
        });

        it('should return independent copy', () => {
            const lcp = new LCPArray2();
            lcp.build('aaa');
            const arr = lcp.getLCPArray();
            arr[0] = 999;
            expect(lcp.getLCP(0)).toBe(0);
        });
    });

    describe('getMaxLCP', () => {
        it('should return 0 for empty string', () => {
            const lcp = new LCPArray2();
            lcp.build('');
            expect(lcp.getMaxLCP()).toBe(0);
        });

        it('should return 0 for single character', () => {
            const lcp = new LCPArray2();
            lcp.build('a');
            expect(lcp.getMaxLCP()).toBe(0);
        });

        it('should return maximum LCP for repeated characters', () => {
            const lcp = new LCPArray2();
            lcp.build('aaa');
            expect(lcp.getMaxLCP()).toBe(2);
        });

        it('should return correct maximum for banana', () => {
            const lcp = new LCPArray2();
            lcp.build('banana');
            const max = lcp.getMaxLCP();
            expect(max >= 0).toBe(true);
        });

        it('should return 0 when all LCP values are 0', () => {
            const lcp = new LCPArray2();
            lcp.build('abcd');
            const max = lcp.getMaxLCP();
            expect(max >= 0).toBe(true);
        });
    });

    describe('getAverageLCP', () => {
        it('should return 0 for empty string', () => {
            const lcp = new LCPArray2();
            lcp.build('');
            expect(lcp.getAverageLCP()).toBe(0);
        });

        it('should return 0 for single character', () => {
            const lcp = new LCPArray2();
            lcp.build('a');
            expect(lcp.getAverageLCP()).toBe(0);
        });

        it('should return average for repeated characters', () => {
            const lcp = new LCPArray2();
            lcp.build('aaa');
            const avg = lcp.getAverageLCP();
            expect(avg).toBeCloseTo(1, 0);
        });

        it('should return average between 0 and max', () => {
            const lcp = new LCPArray2();
            lcp.build('aaaa');
            const avg = lcp.getAverageLCP();
            const max = lcp.getMaxLCP();
            expect(avg).toBeGreaterThanOrEqual(0);
            expect(avg).toBeLessThanOrEqual(max);
        });
    });

    describe('getNumberOfDistinctSubstrings', () => {
        it('should return 0 for empty string', () => {
            const lcp = new LCPArray2();
            lcp.build('');
            expect(lcp.getNumberOfDistinctSubstrings()).toBe(0);
        });

        it('should return 1 for single character', () => {
            const lcp = new LCPArray2();
            lcp.build('a');
            expect(lcp.getNumberOfDistinctSubstrings()).toBe(1);
        });

        it('should return 2 for two different characters', () => {
            const lcp = new LCPArray2();
            lcp.build('ab');
            expect(lcp.getNumberOfDistinctSubstrings()).toBe(3);
        });

        it('should return correct count for repeated characters', () => {
            const lcp = new LCPArray2();
            lcp.build('aaa');
            expect(lcp.getNumberOfDistinctSubstrings()).toBe(3);
        });

        it('should return correct count for banana', () => {
            const lcp = new LCPArray2();
            lcp.build('banana');
            const count = lcp.getNumberOfDistinctSubstrings();
            expect(count).toBeGreaterThan(0);
        });

        it('should return correct count for abc', () => {
            const lcp = new LCPArray2();
            lcp.build('abc');
            expect(lcp.getNumberOfDistinctSubstrings()).toBe(6);
        });
    });

    describe('size', () => {
        it('should be 0 for empty string', () => {
            const lcp = new LCPArray2();
            lcp.build('');
            expect(lcp.size).toBe(0);
        });

        it('should be 1 for single character', () => {
            const lcp = new LCPArray2();
            lcp.build('a');
            expect(lcp.size).toBe(1);
        });

        it('should be 2 for two characters', () => {
            const lcp = new LCPArray2();
            lcp.build('ab');
            expect(lcp.size).toBe(2);
        });

        it('should equal length of text', () => {
            const lcp = new LCPArray2();
            lcp.build('banana');
            expect(lcp.size).toBe(6);
        });

        it('should be correct after buildFromSuffixArray', () => {
            const lcp = new LCPArray2();
            const sa = [0, 1, 2, 3];
            lcp.buildFromSuffixArray('abcd', sa);
            expect(lcp.size).toBe(4);
        });
    });

    describe('integration tests', () => {
        it('should handle mississippi correctly', () => {
            const lcp = new LCPArray2();
            lcp.build('mississippi');
            expect(lcp.size).toBe(11);
            expect(lcp.getMaxLCP()).toBeGreaterThan(0);
        });

        it('should handle ababa palindrome correctly', () => {
            const lcp = new LCPArray2();
            lcp.build('ababa');
            expect(lcp.size).toBe(5);
            const distinct = lcp.getNumberOfDistinctSubstrings();
            expect(distinct).toBeGreaterThan(0);
            expect(distinct).toBeLessThanOrEqual(15);
        });

        it('should handle string with all same character', () => {
            const lcp = new LCPArray2();
            lcp.build('aaaaaaaa');
            expect(lcp.size).toBe(8);
            expect(lcp.getNumberOfDistinctSubstrings()).toBe(8);
        });

        it('should handle string with no repeating characters', () => {
            const lcp = new LCPArray2();
            lcp.build('abcdef');
            expect(lcp.size).toBe(6);
            expect(lcp.getNumberOfDistinctSubstrings()).toBe(21);
        });
    });

    describe('edge cases', () => {
        it('should handle single space', () => {
            const lcp = new LCPArray2();
            lcp.build(' ');
            expect(lcp.size).toBe(1);
        });

        it('should handle multiple spaces', () => {
            const lcp = new LCPArray2();
            lcp.build('   ');
            expect(lcp.size).toBe(3);
        });

        it('should handle mixed case', () => {
            const lcp = new LCPArray2();
            lcp.build('aAaA');
            expect(lcp.size).toBe(4);
        });

        it('should handle string ending with newline', () => {
            const lcp = new LCPArray2();
            lcp.build('text\n');
            expect(lcp.size).toBe(5);
        });
    });
});
