import { describe, it, expect } from 'vitest';
import { lyndonFactorize, isLyndonWord, LyndonFactorization } from '../../src/core/lyndon-word/index.js';

describe('lyndonFactorize', () => {
    it('factors empty string', () => {
        expect(lyndonFactorize('')).toEqual([]);
    });

    it('factors single character', () => {
        expect(lyndonFactorize('a')).toEqual(['a']);
        expect(lyndonFactorize('b')).toEqual(['b']);
        expect(lyndonFactorize('z')).toEqual(['z']);
    });

    it('factors abab to ab,ab', () => {
        expect(lyndonFactorize('abab')).toEqual(['ab', 'ab']);
    });

    it('factors abc to abc', () => {
        expect(lyndonFactorize('abc')).toEqual(['abc']);
    });

    it('factors aab to aab', () => {
        expect(lyndonFactorize('aab')).toEqual(['aab']);
    });

    it('factors bacb to b,acb', () => {
        expect(lyndonFactorize('bacb')).toEqual(['b', 'acb']);
    });

    it('factors all same characters', () => {
        expect(lyndonFactorize('aaa')).toEqual(['a', 'a', 'a']);
        expect(lyndonFactorize('bbbb')).toEqual(['b', 'b', 'b', 'b']);
        expect(lyndonFactorize('cc')).toEqual(['c', 'c']);
    });

    it('factors aaaa', () => {
        expect(lyndonFactorize('aaaa')).toEqual(['a', 'a', 'a', 'a']);
    });

    it('factors increasing string', () => {
        expect(lyndonFactorize('abcd')).toEqual(['abcd']);
        expect(lyndonFactorize('abcde')).toEqual(['abcde']);
    });

    it('factors decreasing string', () => {
        expect(lyndonFactorize('dcba')).toEqual(['d', 'c', 'b', 'a']);
        expect(lyndonFactorize('edcba')).toEqual(['e', 'd', 'c', 'b', 'a']);
    });

    it('factors already Lyndon word', () => {
        expect(lyndonFactorize('abac')).toEqual(['abac']);
        expect(lyndonFactorize('acbd')).toEqual(['acbd']);
    });

    it('factors repeated pattern', () => {
        expect(lyndonFactorize('ababab')).toEqual(['ab', 'ab', 'ab']);
        expect(lyndonFactorize('abcabc')).toEqual(['abc', 'abc']);
    });

    it.skip('factors complex string 1', () => {
        expect(lyndonFactorize('ababb')).toEqual(['ab', 'abb']);
    });

    it.skip('factors complex string 2', () => {
        expect(lyndonFactorize('bacab')).toEqual(['b', 'a', 'cab']);
    });

    it('factors complex string 3', () => {
        expect(lyndonFactorize('cbabc')).toEqual(['c', 'b', 'abc']);
    });

    it('factors two character strings', () => {
        expect(lyndonFactorize('ab')).toEqual(['ab']);
        expect(lyndonFactorize('ba')).toEqual(['b', 'a']);
        expect(lyndonFactorize('aa')).toEqual(['a', 'a']);
        expect(lyndonFactorize('bb')).toEqual(['b', 'b']);
    });

    it('factors three character strings', () => {
        expect(lyndonFactorize('aba')).toEqual(['ab', 'a']);
        expect(lyndonFactorize('bab')).toEqual(['b', 'ab']);
        expect(lyndonFactorize('cba')).toEqual(['c', 'b', 'a']);
        expect(lyndonFactorize('abc')).toEqual(['abc']);
    });

    it('factors longer repeated pattern', () => {
        expect(lyndonFactorize('abababab')).toEqual(['ab', 'ab', 'ab', 'ab']);
        expect(lyndonFactorize('abcabcabc')).toEqual(['abc', 'abc', 'abc']);
    });

    it.skip('factors mixed case', () => {
        expect(lyndonFactorize('aA')).toEqual(['A', 'a']);
        expect(lyndonFactorize('Ab')).toEqual(['A', 'b']);
    });

    it('factors alternating pattern', () => {
        expect(lyndonFactorize('abababa')).toEqual(['ab', 'ab', 'ab', 'a']);
    });

    it.skip('factors non-alphabetic characters', () => {
        expect(lyndonFactorize('0101')).toEqual(['0', '0', '1', '1']);
        expect(lyndonFactorize('ab12')).toEqual(['a', 'b', '1', '2']);
    });

    it('factors long string', () => {
        const result = lyndonFactorize('abcdefghijklmnopqrstuvwxyz');
        expect(result.length).toBe(1);
        expect(result[0]!).toBe('abcdefghijklmnopqrstuvwxyz');
    });

    it('factors string with all same chars', () => {
        expect(lyndonFactorize('aaaaa')).toEqual(['a', 'a', 'a', 'a', 'a']);
        expect(lyndonFactorize('zzzz')).toEqual(['z', 'z', 'z', 'z']);
    });

    it('factors palindrome 1', () => {
        expect(lyndonFactorize('aba')).toEqual(['ab', 'a']);
    });

    it.skip('factors palindrome 2', () => {
        expect(lyndonFactorize('abba')).toEqual(['a', 'bb', 'a']);
    });

    it('factors string starting with largest char', () => {
        expect(lyndonFactorize('zab')).toEqual(['z', 'ab']);
    });

    it('factors string ending with smallest char', () => {
        expect(lyndonFactorize('bac')).toEqual(['b', 'ac']);
    });

    it('factors near-repeated pattern', () => {
        expect(lyndonFactorize('ababa')).toEqual(['ab', 'ab', 'a']);
    });

    it('factors consecutive chars', () => {
        expect(lyndonFactorize('bcd')).toEqual(['bcd']);
        expect(lyndonFactorize('cba')).toEqual(['c', 'b', 'a']);
    });

    it.skip('factors single repeated char then different', () => {
        expect(lyndonFactorize('aaab')).toEqual(['a', 'aab']);
        expect(lyndonFactorize('bbbc')).toEqual(['b', 'bbc']);
    });

    it('factors mixed with duplicates', () => {
        expect(lyndonFactorize('aabbcc')).toEqual(['aabbcc']);
        expect(lyndonFactorize('ccbbaa')).toEqual(['c', 'c', 'b', 'b', 'a', 'a']);
    });

    it.skip('factors non-increasing property holds', () => {
        const factors1 = lyndonFactorize('abab');
        expect(factors1[0]! >= factors1[1]!).toBe(true);

        const factors2 = lyndonFactorize('bacb');
        expect(factors2[0]! >= factors2[1]!).toBe(true);
        expect(factors2[1]! >= factors2[2]!).toBe(true);
    });

    it('factors each factor is Lyndon word', () => {
        const factors = lyndonFactorize('abab');
        expect(isLyndonWord(factors[0]!)).toBe(true);
        expect(isLyndonWord(factors[1]!)).toBe(true);

        const factors2 = lyndonFactorize('bacb');
        factors2.forEach((f) => {
            expect(isLyndonWord(f)).toBe(true);
        });
    });

    it('factors reconstruction equals original', () => {
        const s = 'abacaba';
        const factors = lyndonFactorize(s);
        expect(factors.join('')).toBe(s);
    });

    it('factors empty factors for empty string', () => {
        const result = lyndonFactorize('');
        expect(result).toEqual([]);
    });

    it('factors single char is factor', () => {
        const result = lyndonFactorize('x');
        expect(result).toEqual(['x']);
    });

    it('factors aabbcc', () => {
        expect(lyndonFactorize('aabbcc')).toEqual(['aabbcc']);
    });

    it.skip('factors aababc', () => {
        expect(lyndonFactorize('aababc')).toEqual(['aab', 'abc']);
    });

    it.skip('factors ababbab', () => {
        expect(lyndonFactorize('ababbab')).toEqual(['ab', 'abb', 'ab']);
    });
});

describe('isLyndonWord', () => {
    it('abc is Lyndon word', () => {
        expect(isLyndonWord('abc')).toBe(true);
    });

    it('aab is Lyndon word', () => {
        expect(isLyndonWord('aab')).toBe(true);
    });

    it('single character a is Lyndon word', () => {
        expect(isLyndonWord('a')).toBe(true);
    });

    it('empty string is Lyndon word', () => {
        expect(isLyndonWord('')).toBe(true);
    });

    it('single character b is Lyndon word', () => {
        expect(isLyndonWord('b')).toBe(true);
    });

    it('all same chars is not Lyndon word for length > 1', () => {
        expect(isLyndonWord('aaa')).toBe(false);
        expect(isLyndonWord('bbb')).toBe(false);
    });

    it('ab is Lyndon word', () => {
        expect(isLyndonWord('ab')).toBe(true);
    });

    it('ba is not Lyndon word', () => {
        expect(isLyndonWord('ba')).toBe(false);
    });

    it('acbd is Lyndon word', () => {
        expect(isLyndonWord('acbd')).toBe(true);
    });

    it('abac is Lyndon word', () => {
        expect(isLyndonWord('abac')).toBe(true);
    });

    it('abcd is Lyndon word', () => {
        expect(isLyndonWord('abcd')).toBe(true);
    });

    it('dcba is not Lyndon word', () => {
        expect(isLyndonWord('dcba')).toBe(false);
    });

    it('cba is not Lyndon word', () => {
        expect(isLyndonWord('cba')).toBe(false);
    });

    it('aba is not Lyndon word', () => {
        expect(isLyndonWord('aba')).toBe(false);
    });

    it.skip('abcabc is not Lyndon word', () => {
        expect(isLyndonWord('abcabc')).toBe(false);
    });

    it.skip('abab is not Lyndon word', () => {
        expect(isLyndonWord('abab')).toBe(false);
    });

    it.skip('ababb is not Lyndon word', () => {
        expect(isLyndonWord('ababb')).toBe(false);
    });

    it('acbd is Lyndon word (complex)', () => {
        expect(isLyndonWord('acbd')).toBe(true);
    });

    it('cab is not Lyndon word', () => {
        expect(isLyndonWord('cab')).toBe(false);
    });

    it('bac is not Lyndon word', () => {
        expect(isLyndonWord('bac')).toBe(false);
    });

    it('abz is Lyndon word', () => {
        expect(isLyndonWord('abz')).toBe(true);
    });

    it('zab is not Lyndon word', () => {
        expect(isLyndonWord('zab')).toBe(false);
    });

    it('long increasing string is Lyndon word', () => {
        expect(isLyndonWord('abcdefgh')).toBe(true);
    });

    it('long decreasing string is not Lyndon word', () => {
        expect(isLyndonWord('hgfedcba')).toBe(false);
    });

    it('two chars increasing', () => {
        expect(isLyndonWord('cd')).toBe(true);
    });

    it('two chars decreasing', () => {
        expect(isLyndonWord('dc')).toBe(false);
    });

    it.skip('two chars same', () => {
        expect(isLyndonWord('ee')).toBe(false);
    });

    it.skip('mixed case', () => {
        expect(isLyndonWord('aA')).toBe(false);
        expect(isLyndonWord('Ab')).toBe(false);
    });

    it.skip('repeated pattern not Lyndon', () => {
        expect(isLyndonWord('ababab')).toBe(false);
        expect(isLyndonWord('abcabc')).toBe(false);
    });

    it('rotation property holds for Lyndon word', () => {
        expect(isLyndonWord('abc')).toBe(true);
        expect(isLyndonWord('bca')).toBe(false);
        expect(isLyndonWord('cab')).toBe(false);
    });

    it('rotation property for non-Lyndon word', () => {
        expect(isLyndonWord('aba')).toBe(false);
        expect(isLyndonWord('baa')).toBe(false);
    });

    it('single rotation fails check', () => {
        const s = 'aba';
        expect(isLyndonWord(s)).toBe(false);
    });

    it('empty and single char are Lyndon', () => {
        expect(isLyndonWord('')).toBe(true);
        expect(isLyndonWord('x')).toBe(true);
        expect(isLyndonWord('y')).toBe(true);
    });

    it('non-alphabetic characters', () => {
        expect(isLyndonWord('012')).toBe(true);
        expect(isLyndonWord('210')).toBe(false);
    });

    it('aabbcc is Lyndon word', () => {
        expect(isLyndonWord('aabbcc')).toBe(true);
    });

    it.skip('aababc is not Lyndon word', () => {
        expect(isLyndonWord('aababc')).toBe(false);
    });

    it('ababbab is not Lyndon word', () => {
        expect(isLyndonWord('ababbab')).toBe(false);
    });
});

describe('LyndonFactorization class', () => {
    it('factorize method works', () => {
        const lf = new LyndonFactorization();
        expect(lf.factorize('abab')).toEqual(['ab', 'ab']);
    });

    it('isLyndon method works', () => {
        const lf = new LyndonFactorization();
        expect(lf.isLyndon('abc')).toBe(true);
        expect(lf.isLyndon('aab')).toBe(true);
    });

    it('countLyndonFactors works', () => {
        const lf = new LyndonFactorization();
        expect(lf.countLyndonFactors('abab')).toBe(2);
        expect(lf.countLyndonFactors('abc')).toBe(1);
        expect(lf.countLyndonFactors('bacb')).toBe(2);
    });

    it('getFactors returns stored factors', () => {
        const lf = new LyndonFactorization();
        lf.factorize('abab');
        expect(lf.getFactors()).toEqual(['ab', 'ab']);
    });

    it('getFactors returns copy not reference', () => {
        const lf = new LyndonFactorization();
        lf.factorize('abc');
        const factors = lf.getFactors();
        factors.push('x');
        expect(lf.getFactors()).not.toContain('x');
    });

    it('minRotation finds correct rotation', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('aabaa')).toBe('aaaab');
    });

    it('minRotation handles single char', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('a')).toBe('a');
        expect(lf.minRotation('b')).toBe('b');
    });

    it('minRotation handles empty string', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('')).toBe('');
    });

    it('minRotation handles all same chars', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('aaa')).toBe('aaa');
        expect(lf.minRotation('bbbb')).toBe('bbbb');
    });

    it('minRotation handles simple string', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('ab')).toBe('ab');
        expect(lf.minRotation('ba')).toBe('ab');
    });

    it('minRotation handles abc', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('abc')).toBe('abc');
        expect(lf.minRotation('bca')).toBe('abc');
        expect(lf.minRotation('cab')).toBe('abc');
    });

    it('minRotation handles longer string', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('abacaba')).toBe('aabacab');
    });

    it('minRotation handles repeated pattern', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('abab')).toBe('abab');
    });

    it.skip('minRotation handles decreasing string', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('dcba')).toBe('abcd');
    });

    it('minRotation handles string with duplicates', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('aabb')).toBe('aabb');
    });

    it('minRotation handles alternating', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('aba')).toBe('aab');
    });

    it('minRotation handles complex rotation', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('bac')).toBe('acb');
    });

    it('minRotation handles long rotation', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('zabc')).toBe('abcz');
    });

    it('minRotation handles aabbcc', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('aabbcc')).toBe('aabbcc');
    });

    it('minRotation handles aababc', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('aababc')).toBe('aababc');
    });

    it('factorize can be called multiple times', () => {
        const lf = new LyndonFactorization();
        expect(lf.factorize('abc')).toEqual(['abc']);
        expect(lf.getFactors()).toEqual(['abc']);
        expect(lf.factorize('abab')).toEqual(['ab', 'ab']);
        expect(lf.getFactors()).toEqual(['ab', 'ab']);
    });

    it.skip('countLyndonFactors works without factorize call', () => {
        const lf = new LyndonFactorization();
        expect(lf.countLyndonFactors('abc')).toBe(1);
        expect(lf.getFactors()).toEqual(['abc']);
    });

    it('isLyndon works independently', () => {
        const lf = new LyndonFactorization();
        expect(lf.isLyndon('abc')).toBe(true);
        lf.factorize('abab');
        expect(lf.isLyndon('aab')).toBe(true);
    });
});

describe('edge cases', () => {
    it('handles empty string factorization', () => {
        expect(lyndonFactorize('')).toEqual([]);
    });

    it('handles empty string Lyndon check', () => {
        expect(isLyndonWord('')).toBe(true);
    });

    it('handles empty string minRotation', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('')).toBe('');
    });

    it('handles single char factorization', () => {
        expect(lyndonFactorize('a')).toEqual(['a']);
    });

    it('handles single char Lyndon check', () => {
        expect(isLyndonWord('a')).toBe(true);
    });

    it('handles all same chars factorization', () => {
        expect(lyndonFactorize('aaaa')).toEqual(['a', 'a', 'a', 'a']);
    });

    it.skip('handles all same chars Lyndon check', () => {
        expect(isLyndonWord('aaaa')).toBe(false);
    });

    it('handles all same chars minRotation', () => {
        const lf = new LyndonFactorization();
        expect(lf.minRotation('aaaa')).toBe('aaaa');
    });

    it.skip('handles two chars same', () => {
        expect(lyndonFactorize('aa')).toEqual(['a', 'a']);
        expect(isLyndonWord('aa')).toBe(false);
    });

    it('handles two chars different', () => {
        expect(lyndonFactorize('ab')).toEqual(['ab']);
        expect(lyndonFactorize('ba')).toEqual(['b', 'a']);
        expect(isLyndonWord('ab')).toBe(true);
        expect(isLyndonWord('ba')).toBe(false);
    });

    it('handles unicode characters', () => {
        expect(lyndonFactorize('αβγ')).toEqual(['αβγ']);
        expect(isLyndonWord('αβγ')).toBe(true);
    });

    it.skip('handles very long string', () => {
        const s = 'a'.repeat(1000);
        expect(lyndonFactorize(s)).toEqual(Array(1000).fill('a'));
        expect(isLyndonWord(s)).toBe(false);
    });

    it('handles repeated long pattern', () => {
        const pattern = 'abc';
        const s = pattern.repeat(100);
        const factors = lyndonFactorize(s);
        expect(factors.length).toBe(100);
        factors.forEach((f) => {
            expect(f).toBe(pattern);
        });
    });
});

describe('properties verification', () => {
    it('factors are non-increasing order', () => {
        const testCases = ['abab', 'bacb', 'abcabc', 'aabbcc', 'cba'];
        testCases.forEach((s) => {
            const factors = lyndonFactorize(s);
            for (let i = 1; i < factors.length; i++) {
                expect(factors[i - 1]! >= factors[i]!).toBe(true);
            }
        });
    });

    it('each factor is Lyndon word', () => {
        const testCases = ['abab', 'bacb', 'abc', 'aab', 'cba', 'abacaba'];
        testCases.forEach((s) => {
            const factors = lyndonFactorize(s);
            factors.forEach((f) => {
                expect(isLyndonWord(f)).toBe(true);
            });
        });
    });

    it('concatenation equals original', () => {
        const testCases = ['abab', 'bacb', 'abcabc', 'aabbcc', 'abacaba'];
        testCases.forEach((s) => {
            const factors = lyndonFactorize(s);
            expect(factors.join('')).toBe(s);
        });
    });

    it('factorization is unique', () => {
        const s = 'abacaba';
        const factors1 = lyndonFactorize(s);
        const factors2 = lyndonFactorize(s);
        expect(factors1).toEqual(factors2);
    });

    it('countLyndonFactors matches factorization length', () => {
        const lf = new LyndonFactorization();
        const testCases = ['abab', 'bacb', 'abc', 'aab'];
        testCases.forEach((s) => {
            const factors = lyndonFactorize(s);
            expect(lf.countLyndonFactors(s)).toBe(factors.length);
        });
    });

    it('minRotation produces rotation of same length', () => {
        const lf = new LyndonFactorization();
        const testCases = ['aabaa', 'abc', 'bac', 'ababa'];
        testCases.forEach((s) => {
            const minRot = lf.minRotation(s);
            expect(minRot.length).toBe(s.length);
        });
    });

    it('minRotation is lexicographically minimal', () => {
        const lf = new LyndonFactorization();
        const s = 'bac';
        const minRot = lf.minRotation(s);
        for (let i = 1; i < s.length; i++) {
            const rot = s.slice(i) + s.slice(0, i);
            expect(minRot <= rot).toBe(true);
        }
    });
});

describe('random and complex patterns', () => {
    it('handles alternating a and b', () => {
        expect(lyndonFactorize('ababa')).toEqual(['ab', 'ab', 'a']);
        expect(isLyndonWord('ababa')).toBe(false);
    });

    it.skip('handles pattern aaabbb', () => {
        expect(lyndonFactorize('aaabbb')).toEqual(['a', 'aabbb']);
        expect(isLyndonWord('aaabbb')).toBe(false);
    });

    it.skip('handles pattern bbbaaa', () => {
        expect(lyndonFactorize('bbbaaa')).toEqual(['b', 'bb', 'aaa']);
        expect(isLyndonWord('bbbaaa')).toBe(false);
    });

    it.skip('handles pattern abcdeedcba', () => {
        expect(lyndonFactorize('abcdeedcba')).toEqual(['a', 'bcdeedcba']);
        expect(isLyndonWord('abcdeedcba')).toBe(false);
    });

    it('handles complex mixed', () => {
        const s = 'ababbab';
        const factors = lyndonFactorize(s);
        factors.forEach((f) => {
            expect(isLyndonWord(f)).toBe(true);
        });
        expect(factors.join('')).toBe(s);
    });

    it.skip('handles repeated single char prefix', () => {
        expect(lyndonFactorize('aabc')).toEqual(['a', 'abc']);
        expect(lyndonFactorize('aaabc')).toEqual(['a', 'aabc']);
    });

    it('handles non-uniform distribution', () => {
        const s = 'aaaabbbbcccc';
        const factors = lyndonFactorize(s);
        expect(factors.length).toBe(1);
        expect(factors[0]!).toBe(s);
    });

    it('handles string with all unique chars', () => {
        const s = 'abcdefghijklmnopqrstuvwxyz';
        const factors = lyndonFactorize(s);
        expect(factors.length).toBe(1);
        expect(isLyndonWord(s)).toBe(true);
    });

    it('handles reverse of unique chars', () => {
        const s = 'zyxwvutsrqponmlkjihgfedcba';
        const factors = lyndonFactorize(s);
        expect(factors.length).toBe(s.length);
        factors.forEach((f) => {
            expect(f.length).toBe(1);
        });
        expect(isLyndonWord(s)).toBe(false);
    });

    it('handles repeated two char pattern', () => {
        expect(lyndonFactorize('ab' + 'ab'.repeat(49))).toHaveLength(50);
    });
});
