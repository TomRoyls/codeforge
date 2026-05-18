import type {
  Token,
  TokenCategory,
  TokenFrequency,
  TokenDistribution,
  NamingPatternResult,
  TokenStatistics,
  TokenAnalysisResult,
  TokenAnalyzerConfig,
} from './types.js'
import { DEFAULT_TOKEN_ANALYZER_CONFIG } from './types.js'
import { increment } from '../../utils/map-helpers.js'

export {
  type Token,
  type TokenCategory,
  type TokenFrequency,
  type TokenDistribution,
  type NamingPatternResult,
  type TokenStatistics,
  type TokenAnalysisResult,
  type TokenAnalyzerConfig,
  DEFAULT_TOKEN_ANALYZER_CONFIG,
} from './types.js'

const KEYWORDS = new Set([
  'abstract', 'any', 'as', 'asserts', 'async', 'await', 'bigint', 'boolean',
  'break', 'case', 'catch', 'class', 'const', 'constructor', 'continue',
  'debugger', 'declare', 'default', 'delete', 'do', 'else', 'enum', 'export',
  'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if',
  'implements', 'import', 'in', 'infer', 'instanceof', 'interface', 'is',
  'keyof', 'let', 'module', 'namespace', 'never', 'new', 'null', 'number',
  'object', 'of', 'package', 'private', 'protected', 'public', 'readonly',
  'require', 'return', 'set', 'string', 'super', 'switch', 'symbol',
  'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'unique',
  'unknown', 'var', 'void', 'while', 'with', 'yield',
])

const SINGLE_CHAR_OPERATORS = new Set([
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':',
])

const MULTI_CHAR_OPERATORS = [
  '===', '!==', '>>>', '<<=', '>>=',
  '==', '!=', '<=', '>=', '&&', '||', '??', '++', '--', '**',
  '+=', '-=', '*=', '/=', '%=', '=>', '...', '?.',
  '&=', '|=', '^=',
]

const PUNCTUATION = new Set([
  '(', ')', '{', '}', '[', ']', ';', ',', '.', '@',
])

export class TokenAnalyzer {
  private config: TokenAnalyzerConfig
  private tokens: Token[]

  constructor(config: Partial<TokenAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_TOKEN_ANALYZER_CONFIG, ...config }
    this.tokens = []
  }

  tokenize(source: string): Token[] {
    this.tokens = []
    const len = source.length
    let pos = 0
    let line = 1
    let col = 1

    const at = (p: number): string => source.charAt(p)

    while (pos < len) {
      const char = at(pos)

      if (char === '\n') {
        if (this.config.includeWhitespace) {
          this.tokens.push({ value: '\n', category: 'whitespace', position: pos, line, column: col })
        }
        line++
        col = 1
        pos++
        continue
      }

      if (char === '\r') {
        pos++
        continue
      }

      if (/\s/.test(char)) {
        const start = pos
        const startCol = col
        while (pos < len && /\s/.test(at(pos)) && at(pos) !== '\n' && at(pos) !== '\r') {
          pos++
          col++
        }
        if (this.config.includeWhitespace) {
          this.tokens.push({ value: source.slice(start, pos), category: 'whitespace', position: start, line, column: startCol })
        }
        continue
      }

      if (char === '/' && pos + 1 < len && at(pos + 1) === '/') {
        const start = pos
        const startCol = col
        while (pos < len && at(pos) !== '\n') {
          pos++
          col++
        }
        if (this.config.includeComments) {
          this.tokens.push({ value: source.slice(start, pos), category: 'comment', position: start, line, column: startCol })
        }
        continue
      }

      if (char === '/' && pos + 1 < len && at(pos + 1) === '*') {
        const start = pos
        const startCol = col
        pos += 2
        col += 2
        while (pos + 1 < len && !(at(pos) === '*' && at(pos + 1) === '/')) {
          if (at(pos) === '\n') {
            line++
            col = 1
          } else {
            col++
          }
          pos++
        }
        if (pos + 1 < len) {
          pos += 2
          col += 2
        }
        if (this.config.includeComments) {
          this.tokens.push({ value: source.slice(start, pos), category: 'comment', position: start, line, column: startCol })
        }
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        const start = pos
        const startCol = col
        const quote = char
        pos++
        col++
        while (pos < len && at(pos) !== quote) {
          if (at(pos) === '\\' && pos + 1 < len) {
            pos += 2
            col += 2
          } else {
            if (at(pos) === '\n') {
              line++
              col = 1
            } else {
              col++
            }
            pos++
          }
        }
        if (pos < len) {
          pos++
          col++
        }
        this.tokens.push({ value: source.slice(start, pos), category: 'literal', position: start, line, column: startCol })
        continue
      }

      if (/[0-9]/.test(char) || (char === '.' && pos + 1 < len && /[0-9]/.test(at(pos + 1)))) {
        const start = pos
        const startCol = col
        if (char === '0' && pos + 1 < len && (at(pos + 1) === 'x' || at(pos + 1) === 'X')) {
          pos += 2
          col += 2
          while (pos < len && /[0-9a-fA-F]/.test(at(pos))) {
            pos++
            col++
          }
        } else {
          while (pos < len && /[0-9]/.test(at(pos))) {
            pos++
            col++
          }
          if (pos < len && at(pos) === '.') {
            pos++
            col++
            while (pos < len && /[0-9]/.test(at(pos))) {
              pos++
              col++
            }
          }
          if (pos < len && (at(pos) === 'e' || at(pos) === 'E')) {
            pos++
            col++
            if (pos < len && (at(pos) === '+' || at(pos) === '-')) {
              pos++
              col++
            }
            while (pos < len && /[0-9]/.test(at(pos))) {
              pos++
              col++
            }
          }
        }
        if (pos < len && (at(pos) === 'n' || at(pos) === 'N')) {
          pos++
          col++
        }
        this.tokens.push({ value: source.slice(start, pos), category: 'literal', position: start, line, column: startCol })
        continue
      }

      if (/[a-zA-Z_$\u0080-\uffff]/.test(char)) {
        const start = pos
        const startCol = col
        while (pos < len && /[a-zA-Z0-9_$\u0080-\uffff]/.test(at(pos))) {
          pos++
          col++
        }
        const word = source.slice(start, pos)
        const category: TokenCategory = this.isKeyword(word) ? 'keyword' : 'identifier'
        this.tokens.push({ value: word, category, position: start, line, column: startCol })
        continue
      }

      if (char === '.' && pos + 2 < len && at(pos + 1) === '.' && at(pos + 2) === '.') {
        this.tokens.push({ value: '...', category: 'operator', position: pos, line, column: col })
        pos += 3
        col += 3
        continue
      }

      if (PUNCTUATION.has(char)) {
        this.tokens.push({ value: char, category: 'punctuation', position: pos, line, column: col })
        pos++
        col++
        continue
      }

      if (SINGLE_CHAR_OPERATORS.has(char)) {
        const start = pos
        const startCol = col
        let matched = false
        for (const op of MULTI_CHAR_OPERATORS) {
          if (source.slice(pos, pos + op.length) === op) {
            this.tokens.push({ value: op, category: 'operator', position: start, line, column: startCol })
            pos += op.length
            col += op.length
            matched = true
            break
          }
        }
        if (!matched) {
          this.tokens.push({ value: char, category: 'operator', position: start, line, column: startCol })
          pos++
          col++
        }
        continue
      }

      this.tokens.push({ value: char, category: 'punctuation', position: pos, line, column: col })
      pos++
      col++
    }

    return [...this.tokens]
  }

  private isKeyword(word: string): boolean {
    if (KEYWORDS.has(word)) return true
    if (this.config.customKeywords.length > 0) {
      return this.config.customKeywords.includes(word)
    }
    return false
  }

  categorize(token: string): TokenCategory {
    if (KEYWORDS.has(token) || this.config.customKeywords.includes(token)) return 'keyword'
    if (/^\/\/|^\/\*/.test(token)) return 'comment'
    if (/^\s+$/.test(token)) return 'whitespace'
    if (/^["'`]/.test(token) || /^[0-9]/.test(token)) return 'literal'
    if (PUNCTUATION.has(token)) return 'punctuation'
    if (SINGLE_CHAR_OPERATORS.has(token.charAt(0)) || MULTI_CHAR_OPERATORS.includes(token)) return 'operator'
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token)) return 'identifier'
    return 'punctuation'
  }

  getFrequency(tokens: Token[]): TokenFrequency[] {
    const freq = new Map<string, { count: number; category: TokenCategory }>()
    for (const token of tokens) {
      const existing = freq.get(token.value)
      if (existing) {
        existing.count++
      } else {
        freq.set(token.value, { count: 1, category: token.category })
      }
    }
    const result: TokenFrequency[] = []
    for (const [token, data] of freq) {
      result.push({ token, count: data.count, category: data.category })
    }
    return result.sort((a, b) => b.count - a.count)
  }

  getTopTokens(tokens: Token[], count?: number): TokenFrequency[] {
    const n = count ?? this.config.maxTopTokens
    return this.getFrequency(tokens).slice(0, n)
  }

  getTokenDistribution(tokens: Token[]): TokenDistribution {
    const dist: TokenDistribution = {
      keyword: 0,
      identifier: 0,
      operator: 0,
      literal: 0,
      punctuation: 0,
      whitespace: 0,
      comment: 0,
    }
    for (const token of tokens) {
      dist[token.category]++
    }
    return dist
  }

  getNamingPatterns(tokens: Token[]): NamingPatternResult {
    const camelCase: Set<string> = new Set()
    const snake_case: Set<string> = new Set()
    const pascalCase: Set<string> = new Set()
    const upperCase: Set<string> = new Set()

    for (const token of tokens) {
      if (token.category !== 'identifier') continue
      const val = token.value
      if (/^[a-z][a-zA-Z0-9]*$/.test(val) && /[a-z]/.test(val) && /[A-Z]/.test(val)) {
        camelCase.add(val)
      }
      if (/^[a-z][a-z0-9_]*$/.test(val) && val.includes('_')) {
        snake_case.add(val)
      }
      if (/^[A-Z][a-zA-Z0-9]*$/.test(val)) {
        pascalCase.add(val)
      }
      if (/^[A-Z][A-Z0-9_]*$/.test(val) && val.length > 1) {
        upperCase.add(val)
      }
    }

    return {
      camelCase: [...camelCase],
      snake_case: [...snake_case],
      PascalCase: [...pascalCase],
      UPPER_CASE: [...upperCase],
    }
  }

  getStatistics(tokens: Token[]): TokenStatistics {
    if (tokens.length === 0) {
      return {
        totalTokens: 0,
        uniqueTokens: 0,
        entropy: 0,
        diversity: 0,
        averageTokenLength: 0,
        maxLength: 0,
        minLength: 0,
      }
    }

    const freq = new Map<string, number>()
    let totalLength = 0
    let maxLen = 0
    let minLen = Infinity

    for (const token of tokens) {
      const val = token.value
      increment(freq, val)
      totalLength += val.length
      if (val.length > maxLen) maxLen = val.length
      if (val.length < minLen) minLen = val.length
    }

    const totalTokens = tokens.length
    const uniqueTokens = freq.size
    let entropy = 0
    for (const count of freq.values()) {
      const p = count / totalTokens
      if (p > 0) {
        entropy -= p * Math.log2(p)
      }
    }

    const diversity = totalTokens > 0 ? uniqueTokens / totalTokens : 0

    return {
      totalTokens,
      uniqueTokens,
      entropy,
      diversity,
      averageTokenLength: totalLength / totalTokens,
      maxLength: maxLen,
      minLength: minLen,
    }
  }

  analyze(source: string): TokenAnalysisResult {
    const tokens = this.tokenize(source)
    const frequency = this.getFrequency(tokens)
    const distribution = this.getTokenDistribution(tokens)
    const namingPatterns = this.getNamingPatterns(tokens)
    const statistics = this.getStatistics(tokens)

    return {
      tokens,
      frequency,
      distribution,
      namingPatterns,
      statistics,
    }
  }

  clear(): void {
    this.tokens = []
  }
}
