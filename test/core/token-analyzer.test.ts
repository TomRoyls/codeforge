import { describe, it, expect } from 'vitest'
import { TokenAnalyzer } from '../../src/core/token-analyzer/token-analyzer.js'
import { DEFAULT_TOKEN_ANALYZER_CONFIG } from '../../src/core/token-analyzer/types.js'
import type { Token, TokenCategory } from '../../src/core/token-analyzer/types.js'

describe('TokenAnalyzer', () => {
  const analyzer = new TokenAnalyzer()

  describe('tokenize', () => {
    it('should tokenize a simple declaration', () => {
      const tokens = analyzer.tokenize('const x = 1')
      expect(tokens.length).toBeGreaterThan(0)
      const values = tokens.map(t => t.value)
      expect(values).toContain('const')
      expect(values).toContain('x')
      expect(values).toContain('=')
      expect(values).toContain('1')
    })

    it('should categorize keywords correctly', () => {
      const tokens = analyzer.tokenize('const let var function return if else')
      const keywords = tokens.filter(t => t.category === 'keyword')
      expect(keywords.length).toBe(7)
    })

    it('should categorize identifiers correctly', () => {
      const tokens = analyzer.tokenize('myVar fooBar baz123')
      const identifiers = tokens.filter(t => t.category === 'identifier')
      expect(identifiers.length).toBe(3)
    })

    it('should categorize operators correctly', () => {
      const tokens = analyzer.tokenize('x + y - z')
      const operators = tokens.filter(t => t.category === 'operator')
      expect(operators.length).toBe(2)
    })

    it('should categorize string literals', () => {
      const tokens = analyzer.tokenize('"hello"')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(1)
      expect(literals[0]!.value).toBe('"hello"')
    })

    it('should categorize single-quoted string literals', () => {
      const tokens = analyzer.tokenize("'world'")
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(1)
      expect(literals[0]!.value).toBe("'world'")
    })

    it('should categorize template literals', () => {
      const tokens = analyzer.tokenize('`template`')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(1)
      expect(literals[0]!.value).toBe('`template`')
    })

    it('should categorize number literals', () => {
      const tokens = analyzer.tokenize('42 3.14 0xFF')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(3)
    })

    it('should categorize punctuation', () => {
      const tokens = analyzer.tokenize('();')
      const punctuation = tokens.filter(t => t.category === 'punctuation')
      expect(punctuation.length).toBe(3)
    })

    it('should track line numbers correctly', () => {
      const tokens = analyzer.tokenize('a\nb\nc')
      const nonWs = tokens.filter(t => t.category !== 'whitespace')
      expect(nonWs[0]!.line).toBe(1)
      expect(nonWs[1]!.line).toBe(2)
      expect(nonWs[2]!.line).toBe(3)
    })

    it('should track column numbers correctly', () => {
      const tokens = analyzer.tokenize('ab cd')
      expect(tokens[0]!.column).toBe(1)
      expect(tokens[1]!.column).toBe(4)
    })

    it('should track position correctly', () => {
      const tokens = analyzer.tokenize('ab cd')
      expect(tokens[0]!.position).toBe(0)
      expect(tokens[1]!.position).toBe(3)
    })

    it('should handle triple-equals operator', () => {
      const tokens = analyzer.tokenize('x === y')
      const ops = tokens.filter(t => t.category === 'operator')
      expect(ops.some(t => t.value === '===')).toBe(true)
    })

    it('should handle arrow operator', () => {
      const tokens = analyzer.tokenize('x => x + 1')
      const ops = tokens.filter(t => t.category === 'operator')
      expect(ops.some(t => t.value === '=>')).toBe(true)
    })

    it('should handle spread operator', () => {
      const tokens = analyzer.tokenize('...args')
      const ops = tokens.filter(t => t.category === 'operator')
      expect(ops.some(t => t.value === '...')).toBe(true)
    })

    it('should handle optional chaining', () => {
      const tokens = analyzer.tokenize('x?.y')
      const ops = tokens.filter(t => t.category === 'operator')
      expect(ops.some(t => t.value === '?.')).toBe(true)
    })

    it('should handle nullish coalescing', () => {
      const tokens = analyzer.tokenize('x ?? y')
      const ops = tokens.filter(t => t.category === 'operator')
      expect(ops.some(t => t.value === '??')).toBe(true)
    })

    it('should handle single-line comments', () => {
      const a = new TokenAnalyzer({ includeComments: true })
      const tokens = a.tokenize('// comment\nconst x = 1')
      const comments = tokens.filter(t => t.category === 'comment')
      expect(comments.length).toBe(1)
      expect(comments[0]!.value).toBe('// comment')
    })

    it('should handle block comments', () => {
      const a = new TokenAnalyzer({ includeComments: true })
      const tokens = a.tokenize('/* block */ const x = 1')
      const comments = tokens.filter(t => t.category === 'comment')
      expect(comments.length).toBe(1)
      expect(comments[0]!.value).toBe('/* block */')
    })

    it('should handle multi-line block comments', () => {
      const a = new TokenAnalyzer({ includeComments: true })
      const tokens = a.tokenize('/* line1\nline2 */ x')
      const comments = tokens.filter(t => t.category === 'comment')
      expect(comments.length).toBe(1)
      expect(comments[0]!.value).toContain('line1')
      expect(comments[0]!.value).toContain('line2')
    })

    it('should handle escaped characters in strings', () => {
      const tokens = analyzer.tokenize('"he\\"llo"')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(1)
    })

    it('should handle hex numbers', () => {
      const tokens = analyzer.tokenize('0xFF 0xABC')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(2)
    })

    it('should handle scientific notation numbers', () => {
      const tokens = analyzer.tokenize('1e10 2.5e-3')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(2)
    })

    it('should handle bigint literals', () => {
      const tokens = analyzer.tokenize('123n')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(1)
      expect(literals[0]!.value).toBe('123n')
    })
  })

  describe('categorize', () => {
    it('should categorize keywords', () => {
      expect(analyzer.categorize('const')).toBe('keyword')
      expect(analyzer.categorize('function')).toBe('keyword')
      expect(analyzer.categorize('return')).toBe('keyword')
    })

    it('should categorize identifiers', () => {
      expect(analyzer.categorize('myVar')).toBe('identifier')
      expect(analyzer.categorize('_private')).toBe('identifier')
      expect(analyzer.categorize('$jquery')).toBe('identifier')
    })

    it('should categorize operators', () => {
      expect(analyzer.categorize('+')).toBe('operator')
      expect(analyzer.categorize('===')).toBe('operator')
      expect(analyzer.categorize('=>')).toBe('operator')
    })

    it('should categorize punctuation', () => {
      expect(analyzer.categorize('(')).toBe('punctuation')
      expect(analyzer.categorize('{')).toBe('punctuation')
      expect(analyzer.categorize(';')).toBe('punctuation')
    })

    it('should categorize string literals', () => {
      expect(analyzer.categorize('"hello"')).toBe('literal')
      expect(analyzer.categorize("'world'")).toBe('literal')
    })

    it('should categorize number literals', () => {
      expect(analyzer.categorize('42')).toBe('literal')
      expect(analyzer.categorize('3.14')).toBe('literal')
    })

    it('should categorize comments', () => {
      expect(analyzer.categorize('// comment')).toBe('comment')
      expect(analyzer.categorize('/* block */')).toBe('comment')
    })

    it('should categorize whitespace', () => {
      expect(analyzer.categorize('  ')).toBe('whitespace')
      expect(analyzer.categorize('\t')).toBe('whitespace')
    })
  })

  describe('getFrequency', () => {
    it('should count token frequencies', () => {
      const tokens = analyzer.tokenize('const x = 1; const y = 2')
      const freq = analyzer.getFrequency(tokens)
      const constEntry = freq.find(f => f.token === 'const')
      expect(constEntry?.count).toBe(2)
    })

    it('should sort by frequency descending', () => {
      const tokens = analyzer.tokenize('a b a c a b')
      const freq = analyzer.getFrequency(tokens)
      expect(freq[0]!.token).toBe('a')
      expect(freq[0]!.count).toBe(3)
      expect(freq[1]!.token).toBe('b')
      expect(freq[1]!.count).toBe(2)
    })

    it('should include category for each token', () => {
      const tokens = analyzer.tokenize('const x = 1')
      const freq = analyzer.getFrequency(tokens)
      const constEntry = freq.find(f => f.token === 'const')
      expect(constEntry?.category).toBe('keyword')
    })

    it('should handle empty tokens array', () => {
      const freq = analyzer.getFrequency([])
      expect(freq).toEqual([])
    })

    it('should handle single token', () => {
      const tokens = analyzer.tokenize('x')
      const freq = analyzer.getFrequency(tokens)
      expect(freq.length).toBe(1)
      expect(freq[0]!.count).toBe(1)
    })
  })

  describe('getTopTokens', () => {
    it('should return top N tokens by default', () => {
      const tokens = analyzer.tokenize('a a a b b c d e f g h i j k l')
      const top = analyzer.getTopTokens(tokens)
      expect(top.length).toBeLessThanOrEqual(DEFAULT_TOKEN_ANALYZER_CONFIG.maxTopTokens)
    })

    it('should return custom number of top tokens', () => {
      const tokens = analyzer.tokenize('a a a b b c d e')
      const top = analyzer.getTopTokens(tokens, 3)
      expect(top.length).toBe(3)
    })

    it('should return fewer if not enough unique tokens', () => {
      const tokens = analyzer.tokenize('a b')
      const top = analyzer.getTopTokens(tokens, 10)
      expect(top.length).toBeLessThanOrEqual(2)
    })
  })

  describe('getTokenDistribution', () => {
    it('should compute distribution of token categories', () => {
      const tokens = analyzer.tokenize('const x = 1 + 2')
      const dist = analyzer.getTokenDistribution(tokens)
      expect(dist.keyword).toBeGreaterThan(0)
      expect(dist.operator).toBeGreaterThan(0)
      expect(dist.literal).toBeGreaterThan(0)
    })

    it('should return all zeros for empty input', () => {
      const dist = analyzer.getTokenDistribution([])
      expect(dist).toEqual({
        keyword: 0,
        identifier: 0,
        operator: 0,
        literal: 0,
        punctuation: 0,
        whitespace: 0,
        comment: 0,
      })
    })

    it('should count keywords correctly', () => {
      const tokens = analyzer.tokenize('const let var')
      const dist = analyzer.getTokenDistribution(tokens)
      expect(dist.keyword).toBe(3)
    })

    it('should count identifiers correctly', () => {
      const tokens = analyzer.tokenize('foo bar baz')
      const dist = analyzer.getTokenDistribution(tokens)
      expect(dist.identifier).toBe(3)
    })

    it('should include whitespace when configured', () => {
      const a = new TokenAnalyzer({ includeWhitespace: true })
      const tokens = a.tokenize('a b')
      const dist = a.getTokenDistribution(tokens)
      expect(dist.whitespace).toBeGreaterThan(0)
    })
  })

  describe('getNamingPatterns', () => {
    it('should detect camelCase identifiers', () => {
      const tokens = analyzer.tokenize('myVariable fooBar getUserName')
      const patterns = analyzer.getNamingPatterns(tokens)
      expect(patterns.camelCase).toContain('myVariable')
      expect(patterns.camelCase).toContain('fooBar')
      expect(patterns.camelCase).toContain('getUserName')
    })

    it('should detect snake_case identifiers', () => {
      const tokens = analyzer.tokenize('my_var foo_bar get_user')
      const patterns = analyzer.getNamingPatterns(tokens)
      expect(patterns.snake_case).toContain('my_var')
      expect(patterns.snake_case).toContain('foo_bar')
    })

    it('should detect PascalCase identifiers', () => {
      const tokens = analyzer.tokenize('MyClass FooBar ComponentName')
      const patterns = analyzer.getNamingPatterns(tokens)
      expect(patterns.PascalCase).toContain('MyClass')
      expect(patterns.PascalCase).toContain('FooBar')
      expect(patterns.PascalCase).toContain('ComponentName')
    })

    it('should detect UPPER_CASE identifiers', () => {
      const tokens = analyzer.tokenize('MAX_VALUE API_KEY DEBUG_MODE')
      const patterns = analyzer.getNamingPatterns(tokens)
      expect(patterns.UPPER_CASE).toContain('MAX_VALUE')
      expect(patterns.UPPER_CASE).toContain('API_KEY')
      expect(patterns.UPPER_CASE).toContain('DEBUG_MODE')
    })

    it('should not detect single letter as UPPER_CASE', () => {
      const tokens = analyzer.tokenize('A B C')
      const patterns = analyzer.getNamingPatterns(tokens)
      expect(patterns.UPPER_CASE).not.toContain('A')
      expect(patterns.UPPER_CASE).not.toContain('B')
    })

    it('should not include keywords in naming patterns', () => {
      const tokens = analyzer.tokenize('const let var')
      const patterns = analyzer.getNamingPatterns(tokens)
      expect(patterns.camelCase).not.toContain('const')
      expect(patterns.PascalCase).not.toContain('Const')
    })

    it('should not include identifiers from non-identifier tokens', () => {
      const tokens = analyzer.tokenize('123 "hello"')
      const patterns = analyzer.getNamingPatterns(tokens)
      expect(patterns.camelCase.length).toBe(0)
      expect(patterns.snake_case.length).toBe(0)
      expect(patterns.PascalCase.length).toBe(0)
      expect(patterns.UPPER_CASE.length).toBe(0)
    })

    it('should return empty arrays for empty input', () => {
      const patterns = analyzer.getNamingPatterns([])
      expect(patterns.camelCase).toEqual([])
      expect(patterns.snake_case).toEqual([])
      expect(patterns.PascalCase).toEqual([])
      expect(patterns.UPPER_CASE).toEqual([])
    })

    it('should deduplicate naming patterns', () => {
      const tokens = analyzer.tokenize('myVar myVar myVar')
      const patterns = analyzer.getNamingPatterns(tokens)
      const count = patterns.camelCase.filter(p => p === 'myVar').length
      expect(count).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('should compute total token count', () => {
      const tokens = analyzer.tokenize('const x = 1')
      const stats = analyzer.getStatistics(tokens)
      expect(stats.totalTokens).toBe(tokens.length)
    })

    it('should compute unique token count', () => {
      const tokens = analyzer.tokenize('a a a b b c')
      const stats = analyzer.getStatistics(tokens)
      expect(stats.uniqueTokens).toBe(3)
    })

    it('should compute entropy', () => {
      const tokens = analyzer.tokenize('a b c d')
      const stats = analyzer.getStatistics(tokens)
      expect(stats.entropy).toBeGreaterThan(0)
    })

    it('should compute diversity', () => {
      const tokens = analyzer.tokenize('a b c')
      const stats = analyzer.getStatistics(tokens)
      expect(stats.diversity).toBeGreaterThan(0)
      expect(stats.diversity).toBeLessThanOrEqual(1)
    })

    it('should compute average token length', () => {
      const tokens = analyzer.tokenize('ab cde')
      const stats = analyzer.getStatistics(tokens)
      expect(stats.averageTokenLength).toBeGreaterThan(0)
    })

    it('should compute max token length', () => {
      const tokens = analyzer.tokenize('a abcdef')
      const stats = analyzer.getStatistics(tokens)
      expect(stats.maxLength).toBeGreaterThanOrEqual(6)
    })

    it('should compute min token length', () => {
      const tokens = analyzer.tokenize('a abcdef')
      const stats = analyzer.getStatistics(tokens)
      expect(stats.minLength).toBeLessThanOrEqual(1)
    })

    it('should handle empty tokens', () => {
      const stats = analyzer.getStatistics([])
      expect(stats.totalTokens).toBe(0)
      expect(stats.uniqueTokens).toBe(0)
      expect(stats.entropy).toBe(0)
      expect(stats.diversity).toBe(0)
      expect(stats.averageTokenLength).toBe(0)
      expect(stats.maxLength).toBe(0)
      expect(stats.minLength).toBe(0)
    })

    it('should have diversity of 1 for all unique tokens', () => {
      const tokens = analyzer.tokenize('a b c d e')
      const stats = analyzer.getStatistics(tokens)
      expect(stats.diversity).toBe(1)
    })
  })

  describe('analyze', () => {
    it('should return complete analysis result', () => {
      const result = analyzer.analyze('const x = 1 + 2')
      expect(result.tokens).toBeDefined()
      expect(result.frequency).toBeDefined()
      expect(result.distribution).toBeDefined()
      expect(result.namingPatterns).toBeDefined()
      expect(result.statistics).toBeDefined()
    })

    it('should provide consistent results with individual methods', () => {
      const source = 'function myFunc(x) { return x + 1 }'
      const result = analyzer.analyze(source)
      const tokens = analyzer.tokenize(source)
      expect(result.tokens.length).toBe(tokens.length)
      expect(result.frequency.length).toBe(analyzer.getFrequency(tokens).length)
    })

    it('should handle complex code', () => {
      const source = `
        import { useState } from 'react'
        export function Counter() {
          const [count, setCount] = useState(0)
          return count + 1
        }
      `
      const result = analyzer.analyze(source)
      expect(result.tokens.length).toBeGreaterThan(10)
      expect(result.statistics.totalTokens).toBeGreaterThan(10)
    })

    it('should handle empty string', () => {
      const result = analyzer.analyze('')
      expect(result.tokens).toEqual([])
      expect(result.frequency).toEqual([])
      expect(result.statistics.totalTokens).toBe(0)
    })
  })

  describe('configuration', () => {
    it('should use default config', () => {
      expect(DEFAULT_TOKEN_ANALYZER_CONFIG.includeWhitespace).toBe(false)
      expect(DEFAULT_TOKEN_ANALYZER_CONFIG.includeComments).toBe(true)
      expect(DEFAULT_TOKEN_ANALYZER_CONFIG.maxTopTokens).toBe(10)
      expect(DEFAULT_TOKEN_ANALYZER_CONFIG.customKeywords).toEqual([])
    })

    it('should exclude whitespace by default', () => {
      const tokens = analyzer.tokenize('a b')
      const ws = tokens.filter(t => t.category === 'whitespace')
      expect(ws.length).toBe(0)
    })

    it('should include whitespace when configured', () => {
      const a = new TokenAnalyzer({ includeWhitespace: true })
      const tokens = a.tokenize('a b')
      const ws = tokens.filter(t => t.category === 'whitespace')
      expect(ws.length).toBeGreaterThan(0)
    })

    it('should include comments by default', () => {
      const tokens = analyzer.tokenize('// hello\nx')
      const comments = tokens.filter(t => t.category === 'comment')
      expect(comments.length).toBe(1)
    })

    it('should exclude comments when configured', () => {
      const a = new TokenAnalyzer({ includeComments: false })
      const tokens = a.tokenize('// hello\nx')
      const comments = tokens.filter(t => t.category === 'comment')
      expect(comments.length).toBe(0)
    })

    it('should support custom keywords', () => {
      const a = new TokenAnalyzer({ customKeywords: ['custom1', 'custom2'] })
      const tokens = a.tokenize('custom1 custom2 regular')
      const keywords = tokens.filter(t => t.category === 'keyword')
      expect(keywords.length).toBe(2)
    })

    it('should override default config partially', () => {
      const a = new TokenAnalyzer({ maxTopTokens: 5 })
      const tokens = a.tokenize('a a b c d e f g')
      const top = a.getTopTokens(tokens)
      expect(top.length).toBeLessThanOrEqual(5)
    })
  })

  describe('clear', () => {
    it('should reset internal state', () => {
      const a = new TokenAnalyzer()
      a.tokenize('const x = 1')
      a.clear()
      expect(a).toBeDefined()
    })

    it('should allow reuse after clear', () => {
      const a = new TokenAnalyzer()
      a.tokenize('const x = 1')
      a.clear()
      const tokens = a.tokenize('let y = 2')
      expect(tokens.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const tokens = analyzer.tokenize('')
      expect(tokens).toEqual([])
    })

    it('should handle only whitespace', () => {
      const tokens = analyzer.tokenize('   \t\n  ')
      const nonWs = tokens.filter(t => t.category !== 'whitespace')
      expect(nonWs.length).toBe(0)
    })

    it('should handle only comments', () => {
      const tokens = analyzer.tokenize('// just a comment')
      const comments = tokens.filter(t => t.category === 'comment')
      expect(comments.length).toBe(1)
    })

    it('should handle unicode identifiers', () => {
      const tokens = analyzer.tokenize('café résumé naïve')
      const ids = tokens.filter(t => t.category === 'identifier')
      expect(ids.length).toBe(3)
    })

    it('should handle unicode in strings', () => {
      const tokens = analyzer.tokenize('"héllo wörld"')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(1)
    })

    it('should handle special characters in code', () => {
      const tokens = analyzer.tokenize('x @decorator #tag')
      expect(tokens.length).toBeGreaterThan(0)
    })

    it('should handle deeply nested code', () => {
      const source = 'if (a) { if (b) { if (c) { return d } } }'
      const tokens = analyzer.tokenize(source)
      expect(tokens.length).toBeGreaterThan(10)
    })

    it('should handle regex-like patterns', () => {
      const tokens = analyzer.tokenize('a / b / c')
      expect(tokens.length).toBeGreaterThan(0)
    })

    it('should handle Windows line endings', () => {
      const tokens = analyzer.tokenize('a\r\nb')
      const ids = tokens.filter(t => t.category === 'identifier')
      expect(ids.length).toBe(2)
    })

    it('should handle consecutive operators', () => {
      const tokens = analyzer.tokenize('x++ + ++y')
      expect(tokens.length).toBeGreaterThan(0)
      const ops = tokens.filter(t => t.category === 'operator')
      expect(ops.length).toBeGreaterThan(0)
    })

    it('should handle single token', () => {
      const tokens = analyzer.tokenize('x')
      expect(tokens.length).toBe(1)
      expect(tokens[0]!.value).toBe('x')
      expect(tokens[0]!.category).toBe('identifier')
    })

    it('should handle only punctuation', () => {
      const tokens = analyzer.tokenize(';;;')
      expect(tokens.length).toBe(3)
      for (const t of tokens) {
        expect(t.category).toBe('punctuation')
      }
    })

    it('should handle only numbers', () => {
      const tokens = analyzer.tokenize('42 3.14 0')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(3)
    })

    it('should handle string with newlines', () => {
      const tokens = analyzer.tokenize('"line1\nline2"')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(1)
      expect(literals[0]!.value).toBe('"line1\nline2"')
    })

    it('should handle unterminated string gracefully', () => {
      const tokens = analyzer.tokenize('"unterminated')
      const literals = tokens.filter(t => t.category === 'literal')
      expect(literals.length).toBe(1)
    })

    it('should handle compound assignment operators', () => {
      const tokens = analyzer.tokenize('x += 1; y -= 2; z *= 3')
      const ops = tokens.filter(t => t.category === 'operator')
      expect(ops.some(t => t.value === '+=')).toBe(true)
      expect(ops.some(t => t.value === '-=')).toBe(true)
      expect(ops.some(t => t.value === '*=')).toBe(true)
    })

    it('should handle dot access punctuation', () => {
      const tokens = analyzer.tokenize('obj.prop')
      const punctuation = tokens.filter(t => t.category === 'punctuation')
      expect(punctuation.some(t => t.value === '.')).toBe(true)
    })

    it('should handle decorator syntax', () => {
      const tokens = analyzer.tokenize('@decorator')
      const punctuation = tokens.filter(t => t.category === 'punctuation')
      expect(punctuation.some(t => t.value === '@')).toBe(true)
    })

    it('should correctly track position after comments', () => {
      const a = new TokenAnalyzer({ includeComments: true })
      const tokens = a.tokenize('/* comment */ x')
      const id = tokens.find(t => t.value === 'x')
      expect(id).toBeDefined()
      expect(id!.position).toBeGreaterThan(0)
    })
  })
})
