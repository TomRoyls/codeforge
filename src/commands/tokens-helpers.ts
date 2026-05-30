import { extname } from 'node:path'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Token type classification.
 *
 * @example
 * type: 'identifier'  // variable/function/class names
 * type: 'keyword'     // reserved language keywords
 * type: 'string-literal' // words inside string quotes
 * type: 'comment-word'   // words in comments
 */
export type TokenType = 'identifier' | 'keyword' | 'string-literal' | 'comment-word'

/**
 * Naming convention style.
 *
 * @example
 * detectNamingStyle('myVariable') // 'camelCase'
 * detectNamingStyle('MyClass') // 'PascalCase'
 */
export type NamingStyle = 'camelCase' | 'PascalCase' | 'snake_case' | 'UPPER_SNAKE' | 'kebab-case'

/**
 * A single token entry with frequency data.
 *
 * @example
 * const entry: TokenEntry = {
 *   token: 'config',
 *   type: 'identifier',
 *   frequency: 23,
 *   files: 8,
 *   contexts: ['variable', 'parameter'],
 *   averageLength: 6,
 * }
 */
export interface TokenEntry {
  token: string
  type: TokenType
  frequency: number
  files: number
  contexts: string[]
  averageLength: number
}

/**
 * Breakdown of token counts by type.
 *
 * @example
 * const bd: TokenTypeBreakdown = { identifiers: 500, keywords: 200, stringLiterals: 150, commentWords: 80, total: 930 }
 */
export interface TokenTypeBreakdown {
  identifiers: number
  keywords: number
  stringLiterals: number
  commentWords: number
  total: number
}

/**
 * Naming convention pattern with statistics.
 *
 * @example
 * const pat: NamingPattern = {
 *   style: 'camelCase',
 *   count: 120,
 *   percentage: 60,
 *   examples: ['getConfig', 'parseInput'],
 * }
 */
export interface NamingPattern {
  style: NamingStyle
  count: number
  percentage: number
  examples: string[]
}

/**
 * Complete token analysis result.
 *
 * @example
 * const result: TokenAnalysisResult = {
 *   topTokens: [...],
 *   breakdown: { identifiers: 100, keywords: 50, stringLiterals: 30, commentWords: 20, total: 200 },
 *   namingPatterns: [...],
 *   vocabularySize: 85,
 *   avgTokenLength: 6.2,
 *   hapaxLegomena: 12,
 *   totalTokens: 200,
 *   files: 5,
 *   recommendations: ['Consider simplifying vocabulary...'],
 * }
 */
export interface TokenAnalysisResult {
  topTokens: TokenEntry[]
  breakdown: TokenTypeBreakdown
  namingPatterns: NamingPattern[]
  vocabularySize: number
  avgTokenLength: number
  hapaxLegomena: number
  totalTokens: number
  files: number
  recommendations: string[]
}

/**
 * Options for token analysis.
 *
 * @example
 * const opts: TokenAnalysisOptions = { top: 20, minLength: 3, type: 'identifier' }
 */
export interface TokenAnalysisOptions {
  top?: number
  minLength?: number
  type?: TokenType | 'all'
  verbose?: boolean
}

/**
 * Raw extracted token before aggregation.
 */
export interface RawToken {
  token: string
  type: TokenType
  context: string
  file: string
}

// ─── Keyword List ─────────────────────────────────────────────────────────────

const JS_TS_KEYWORDS = new Set([
  'abstract', 'any', 'as', 'async', 'await', 'bigint', 'boolean', 'break', 'case',
  'catch', 'class', 'const', 'constructor', 'continue', 'debugger', 'declare',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
  'finally', 'for', 'from', 'function', 'get', 'if', 'implements', 'import',
  'in', 'instanceof', 'interface', 'keyof', 'let', 'module', 'new', 'null',
  'number', 'object', 'of', 'override', 'package', 'private', 'protected',
  'public', 'readonly', 'require', 'return', 'set', 'static', 'string',
  'super', 'switch', 'symbol', 'this', 'throw', 'true', 'try', 'type',
  'typeof', 'undefined', 'unique', 'unknown', 'var', 'void', 'while', 'with',
  'yield',
])

const PYTHON_KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from',
  'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not',
  'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield',
])

const RUST_KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn',
  'else', 'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let',
  'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self',
  'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe',
  'use', 'where', 'while',
])

const GO_KEYWORDS = new Set([
  'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else',
  'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface',
  'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type',
  'var',
])

// ─── Token Extraction ─────────────────────────────────────────────────────────

/**
 * Determine which keyword set to use based on file extension.
 *
 * @example
 * getKeywordSet('.ts') // JS/TS keywords
 * getKeywordSet('.py') // Python keywords
 * getKeywordSet('.rs') // Rust keywords
 */
export function getKeywordSet(filePath: string): Set<string> {
  const ext = extname(filePath).toLowerCase()
  if (['.py'].includes(ext)) return PYTHON_KEYWORDS
  if (['.rs'].includes(ext)) return RUST_KEYWORDS
  if (['.go'].includes(ext)) return GO_KEYWORDS
  return JS_TS_KEYWORDS
}

/**
 * Check if a word is a keyword for the given file type.
 *
 * @example
 * isKeyword('function', '.ts') // true
 * isKeyword('def', '.py') // true
 * isKeyword('hello', '.ts') // false
 */
export function isKeyword(word: string, filePath: string): boolean {
  return getKeywordSet(filePath).has(word)
}

/**
 * Extract comment text from source code.
 *
 * @example
 * extractCommentText('// hello world') // ['hello world']
 */
export function extractCommentText(content: string): string[] {
  const comments: string[] = []

  // Single-line comments
  const singleLineRegex = /\/\/\s*(.*)/g
  let match: RegExpExecArray | null
  while ((match = singleLineRegex.exec(content)) !== null) {
if (match[1] !== undefined) comments.push(match[1])
  }

  // Multi-line comments
  const multiLineRegex = /\/\*\s*([\s\S]*?)\s*\*\//g
  while ((match = multiLineRegex.exec(content)) !== null) {
if (match[1] !== undefined) comments.push(match[1])
  }

  // Hash comments (Python, Shell, Ruby)
  const hashRegex = /#\s*(.*)/g
  while ((match = hashRegex.exec(content)) !== null) {
if (match[1] !== undefined) comments.push(match[1])
  }

  return comments
}

// ─── String Extraction ───────────────────────────────────────────────────────

/**
 * Extract string literal text from source code.
 *
 * @example
 * extractStringText('const x = "hello world"') // ['hello world']
 */
export function extractStringText(content: string): string[] {
  const strings: string[] = []

  // Double-quoted strings (non-greedy)
  const doubleRegex = /"(?:[^"\\]|\\.)*"/g
  let match: RegExpExecArray | null
  while ((match = doubleRegex.exec(content)) !== null) {
    strings.push(match[0].slice(1, -1))
  }

  // Single-quoted strings (non-greedy)
  const singleRegex = /'(?:[^'\\]|\\.)*'/g
  while ((match = singleRegex.exec(content)) !== null) {
    strings.push(match[0].slice(1, -1))
  }

  // Template literals
  const templateRegex = /`(?:[^`\\]|\\.)*`/g
  while ((match = templateRegex.exec(content)) !== null) {
    strings.push(match[0].slice(1, -1))
  }

  return strings
}

/**
 * Extract identifiers from source code.
 *
 * @example
 * extractIdentifiers('const foo = bar + baz') // ['foo', 'bar', 'baz']
 */
export function extractIdentifiers(content: string, filePath: string): { token: string; context: string }[] {
  const keywordSet = getKeywordSet(filePath)
  const identifiers: { token: string; context: string }[] = []

  // Match word-like tokens that could be identifiers
  const identifierRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g
  let match: RegExpExecArray | null

  while ((match = identifierRegex.exec(content)) !== null) {
    const word = match[1]
    if (!word) continue
    if (keywordSet.has(word)) continue
    if (word.length < 2) continue

    // Infer context from surrounding code
    const pos = match.index
    const lineStart = content.lastIndexOf('\n', pos) + 1
    const lineEnd = content.indexOf('\n', pos)
    const line = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd)
    const context = inferTokenContext(line, word)

    identifiers.push({ token: word, context })
  }

  return identifiers
}

/**
 * Infer the context role of a token from its surrounding line.
 *
 * @example
 * inferTokenContext('function foo() {}', 'foo') // 'function-name'
 * inferTokenContext('const x = 1', 'x') // 'variable'
 */
export function inferTokenContext(line: string, token: string): string {
  const trimmed = line.trim()

  if (trimmed.match(new RegExp(`import.*${escapeRegex(token)}.*from`))) return 'import'
  if (trimmed.match(new RegExp(`export\\s+function\\s+${escapeRegex(token)}\\b`))) return 'export'
  if (trimmed.match(new RegExp(`export\\s+class\\s+${escapeRegex(token)}\\b`))) return 'export'
  if (trimmed.match(new RegExp(`export\\s+${escapeRegex(token)}\\b`))) return 'export'
  if (trimmed.match(new RegExp(`function\\s+${escapeRegex(token)}\\b`))) return 'function-name'
  if (trimmed.match(new RegExp(`class\\s+${escapeRegex(token)}\\b`))) return 'class-name'
  if (trimmed.match(new RegExp(`interface\\s+${escapeRegex(token)}\\b`))) return 'interface-name'
  if (trimmed.match(new RegExp(`type\\s+${escapeRegex(token)}\\b`))) return 'type-alias'
  if (trimmed.match(new RegExp(`(?:const|let|var)\\s+${escapeRegex(token)}\\b`))) return 'variable'
  if (trimmed.match(new RegExp(`(?:async\\s+)?(?:get|set)\\s+${escapeRegex(token)}\\b`))) return 'accessor'
  if (trimmed.includes(`=>`) && trimmed.includes(token)) return 'arrow-function'
  if (trimmed.includes(`.${token}(`)) return 'method-call'
  if (trimmed.includes(`${token}(`)) return 'function-call'
  if (trimmed.match(new RegExp(`:\\s*${escapeRegex(token)}`))) return 'type-reference'
  if (trimmed.match(new RegExp(`<${escapeRegex(token)}>`))) return 'type-parameter'

  return 'reference'
}

/**
 * Extract all tokens from source content.
 *
 * @example
 * const tokens = extractTokens('const x = "hello"', 'test.ts')
 * // Returns raw tokens for identifiers, keywords, strings, and comments
 */
export function extractTokens(content: string, filePath: string): RawToken[] {
  const tokens: RawToken[] = []
  const keywordSet = getKeywordSet(filePath)

  // Extract identifiers
  const identifiers = extractIdentifiers(content, filePath)
  for (const id of identifiers) {
    tokens.push({
      token: id.token,
      type: 'identifier',
      context: id.context,
      file: filePath,
    })
  }

  // Extract keywords
  const keywordRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g
  let match: RegExpExecArray | null
  while ((match = keywordRegex.exec(content)) !== null) {
    const word = match[1]
    if (word && keywordSet.has(word)) {
      tokens.push({
        token: word,
        type: 'keyword',
        context: 'keyword',
        file: filePath,
      })
    }
  }

  // Extract string literals
  const stringTexts = extractStringText(content)
  for (const text of stringTexts) {
    const words = text.split(/\s+/).filter((w) => w.length > 0)
    for (const word of words) {
      tokens.push({
        token: word,
        type: 'string-literal',
        context: 'string',
        file: filePath,
      })
    }
  }

  // Extract comment words
  const comments = extractCommentText(content)
  for (const comment of comments) {
    const words = comment.split(/\s+/).filter((w) => w.length > 0)
    for (const word of words) {
      // Strip leading punctuation like @param, /**, etc.
      const cleaned = word.replace(/^[/*#@:]+/, '').replace(/[/*]+$/, '')
      if (cleaned.length > 0) {
        tokens.push({
          token: cleaned,
          type: 'comment-word',
          context: 'comment',
          file: filePath,
        })
      }
    }
  }

  return tokens
}

// ─── Frequency Counting ──────────────────────────────────────────────────────

/**
 * Count token frequencies, aggregating across files.
 *
 * @example
 * countTokenFrequencies(rawTokens)
 * // Returns TokenEntry[] sorted by frequency descending
 */
export function countTokenFrequencies(tokens: RawToken[]): TokenEntry[] {
  const freqMap = new Map<string, { frequency: number; files: Set<string>; contexts: Set<string>; type: TokenType }>()

  for (const t of tokens) {
    const key = `${t.type}::${t.token}`
    const existing = freqMap.get(key)
    if (existing) {
      existing.frequency++
      existing.files.add(t.file)
      existing.contexts.add(t.context)
    } else {
      freqMap.set(key, {
        frequency: 1,
        files: new Set([t.file]),
        contexts: new Set([t.context]),
        type: t.type,
      })
    }
  }

  const entries: TokenEntry[] = []
  for (const [key, data] of freqMap) {
    const token = key.split('::').slice(1).join('::')
    entries.push({
      token,
      type: data.type,
      frequency: data.frequency,
      files: data.files.size,
      contexts: [...data.contexts],
      averageLength: token.length,
    })
  }

  entries.sort((a, b) => b.frequency - a.frequency)
  return entries
}

// ─── Naming Style Detection ──────────────────────────────────────────────────

/**
 * Detect the naming style of a token.
 *
 * @example
 * detectNamingStyle('myVariable') // 'camelCase'
 * detectNamingStyle('MyClass') // 'PascalCase'
 * detectNamingStyle('SOME_CONST') // 'UPPER_SNAKE'
 * detectNamingStyle('my_var') // 'snake_case'
 * detectNamingStyle('my-component') // 'kebab-case'
 */
export function detectNamingStyle(token: string): NamingStyle | null {
  if (token.includes('-')) return 'kebab-case'
  if (token.includes('_')) {
    if (token === token.toUpperCase()) return 'UPPER_SNAKE'
    return 'snake_case'
  }
  if (/^[A-Z]/.test(token) && /[a-z]/.test(token)) return 'PascalCase'
  if (/^[a-z]/.test(token) && /[A-Z]/.test(token)) return 'camelCase'
  return null
}

/**
 * Analyze naming patterns across identifiers.
 *
 * @example
 * analyzeNamingPatterns(['getConfig', 'MyClass', 'some_var', 'MAX_SIZE'])
 * // Returns naming pattern statistics
 */
export function analyzeNamingPatterns(identifiers: string[]): NamingPattern[] {
  const styleMap = new Map<NamingStyle, { count: number; examples: string[] }>()

  for (const id of identifiers) {
    const style = detectNamingStyle(id)
    if (!style) continue

    const existing = styleMap.get(style)
    if (existing) {
      existing.count++
      if (existing.examples.length < 5 && !existing.examples.includes(id)) {
        existing.examples.push(id)
      }
    } else {
      styleMap.set(style, { count: 1, examples: [id] })
    }
  }

  const total = [...styleMap.values()].reduce((sum, v) => sum + v.count, 0)
  const patterns: NamingPattern[] = []

  for (const [style, data] of styleMap) {
    patterns.push({
      style,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      examples: data.examples,
    })
  }

  patterns.sort((a, b) => b.count - a.count)
  return patterns
}

// ─── Hapax Legomena ──────────────────────────────────────────────────────────

/**
 * Count tokens that appear exactly once (hapax legomena).
 *
 * @example
 * findHapaxLegomena(entries) // 42
 */
export function findHapaxLegomena(entries: TokenEntry[]): number {
  return entries.filter((e) => e.frequency === 1).length
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations based on token analysis.
 *
 * @example
 * generateRecommendations(result) // ['Consider simplifying vocabulary...', ...]
 */
export function generateRecommendations(result: TokenAnalysisResult): string[] {
  const recs: string[] = []

  // Check for mixed naming styles
  if (result.namingPatterns.length > 2) {
    const styles = result.namingPatterns.map((p) => `${p.style} (${p.percentage}%)`).join(', ')
    recs.push(`Mixed naming conventions detected: ${styles}. Consider standardizing.`)
  }

  // Check for very long tokens
  const longTokens = result.topTokens.filter((t) => t.token.length > 30 && t.type === 'identifier')
  if (longTokens.length > 0) {
    recs.push(`${longTokens.length} identifiers exceed 30 characters. Consider shorter names.`)
  }

  // High hapax ratio suggests poor reuse
  if (result.totalTokens > 0 && result.hapaxLegomena / result.vocabularySize > 0.7) {
    recs.push('High ratio of single-use tokens (hapax legomena). Consider better abstraction or reuse.')
  }

  // Low vocabulary diversity
  if (result.totalTokens > 100 && result.vocabularySize < 20) {
    recs.push('Low vocabulary diversity. The codebase uses very few unique tokens, which may indicate repetitive code.')
  }

  // Many string literals
  if (result.breakdown.stringLiterals > result.breakdown.identifiers * 0.5) {
    recs.push('High proportion of string literals. Consider extracting constants for repeated strings.')
  }

  // Many comment words
  if (result.breakdown.commentWords > result.breakdown.identifiers) {
    recs.push('More comment words than identifiers. Ensure comments add value over code clarity.')
  }

  if (recs.length === 0) {
    recs.push('Token usage looks healthy. Naming conventions are consistent.')
  }

  return recs
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

/**
 * Build a complete token analysis result from files and contents.
 *
 * @example
 * const result = buildTokenResult(
 *   ['foo.ts', 'bar.ts'],
 *   [content1, content2],
 *   { top: 20, minLength: 3, type: 'identifier' },
 * )
 */
export function buildTokenResult(
  files: string[],
  contents: string[],
  options: TokenAnalysisOptions,
): TokenAnalysisResult {
  const top = options.top ?? 20
  const minLength = options.minLength ?? 1
  const typeFilter = options.type ?? 'all'

  // Extract all tokens
  const allTokens: RawToken[] = []
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    const content = contents[i]
    if (filePath === undefined || content === undefined) continue
    allTokens.push(...extractTokens(content, filePath))
  }

  // Filter by type
  let filtered = allTokens
  if (typeFilter !== 'all') {
    filtered = filtered.filter((t) => t.type === typeFilter)
  }

  // Filter by minimum length
  filtered = filtered.filter((t) => t.token.length >= minLength)

  // Count frequencies
  const entries = countTokenFrequencies(filtered)

  // Compute breakdown
  const breakdown: TokenTypeBreakdown = {
    identifiers: 0,
    keywords: 0,
    stringLiterals: 0,
    commentWords: 0,
    total: 0,
  }
  for (const t of filtered) {
    switch (t.type) {
      case 'identifier': breakdown.identifiers++; break
      case 'keyword': breakdown.keywords++; break
      case 'string-literal': breakdown.stringLiterals++; break
      case 'comment-word': breakdown.commentWords++; break
    }
    breakdown.total++
  }

  // Analyze naming patterns from identifiers
  const identifierTokens = filtered.filter((t) => t.type === 'identifier')
  const uniqueIdentifiers = [...new Set(identifierTokens.map((t) => t.token))]
  const namingPatterns = analyzeNamingPatterns(uniqueIdentifiers)

  // Compute stats
  const topTokens = entries.slice(0, top)
  const vocabularySize = entries.length
  const totalTokens = filtered.length
  const avgTokenLength = filtered.length > 0
    ? Math.round((filtered.reduce((sum, t) => sum + t.token.length, 0) / filtered.length) * 10) / 10
    : 0
  const hapaxLegomena = findHapaxLegomena(entries)

  const result: TokenAnalysisResult = {
    topTokens,
    breakdown,
    namingPatterns,
    vocabularySize,
    avgTokenLength,
    hapaxLegomena,
    totalTokens,
    files: files.length,
    recommendations: [],
  }

  result.recommendations = generateRecommendations(result)
  return result
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Escape special regex characters in a string.
 *
 * @example
 * escapeRegex('foo.bar') // 'foo\\.bar'
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
