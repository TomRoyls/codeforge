// ─── Interfaces ──────────────────────────────────────────

export type SuggestionCategory = 'maintenance' | 'performance' | 'quality' | 'security' | 'style'
export type SuggestionSeverity = 'high' | 'low' | 'medium'

export interface Suggestion {
  rule: string
  category: SuggestionCategory
  severity: SuggestionSeverity
  title: string
  description: string
  filePath: string
  line: number
  suggestion: string
}

export interface SuggestionsResult {
  suggestions: Suggestion[]
  totalFound: number
  byCategory: { category: string; count: number }[]
  bySeverity: { severity: string; count: number }[]
  topRules: { rule: string; count: number }[]
}

export interface BuildSuggestionsOptions {
  category?: string
  severity?: string
}

// ─── Rule: console.log detection ─────────────────────────

/**
 * Detect console.log/warn/error/debug statements in code.
 *
 * @example
 * ruleConsoleLog('console.log("hi")', 'test.ts')
 * // => [{ rule: 'console-log', category: 'quality', severity: 'medium', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for detected console statements
 */
export function ruleConsoleLog(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')
  const pattern = /console\.(log|warn|error|debug)\s*\(/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const match = pattern.exec(line)
    if (match) {
      const kind = match[1] ?? 'log'
      suggestions.push({
        rule: 'console-log',
        category: 'quality',
        severity: 'medium',
        title: `Console statement (${kind}) detected`,
        description: `Use of console.${kind} found in production code. Consider replacing with a proper logging library.`,
        filePath,
        line: i + 1,
        suggestion: 'Remove or replace with proper logging library',
      })
    }
  }

  return suggestions
}

// ─── Rule: `any` type usage ──────────────────────────────

/**
 * Detect usage of TypeScript `any` type.
 *
 * @example
 * ruleAnyType('const x: any = 1', 'test.ts')
 * // => [{ rule: 'missing-types', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for `any` type usage
 */
export function ruleAnyType(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')
  const patterns = [/\b:\s*any\b/, /\bas\s+any\b/, /<any>/]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    // Skip comments
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue
    }
    // Skip string content — simple heuristic: check if pattern appears in code portion
    for (const pattern of patterns) {
      if (pattern.exec(line)) {
        suggestions.push({
          rule: 'missing-types',
          category: 'quality',
          severity: 'high',
          title: 'Usage of `any` type',
          description:
            'Using `any` bypasses TypeScript type checking and can hide bugs. Replace with a specific type.',
          filePath,
          line: i + 1,
          suggestion: 'Replace with specific type',
        })
        break // Only one suggestion per line
      }
    }
  }

  return suggestions
}

// ─── Rule: @ts-ignore / @ts-expect-error ─────────────────

/**
 * Detect @ts-ignore and @ts-expect-error suppressions.
 *
 * @example
 * ruleTsIgnore('// @ts-ignore', 'test.ts')
 * // => [{ rule: 'ts-ignore', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for TypeScript suppression comments
 */
export function ruleTsIgnore(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    if (/@ts-ignore/.exec(line) || /@ts-expect-error/.exec(line)) {
      const kind = /@ts-ignore/.exec(line) ? '@ts-ignore' : '@ts-expect-error'
      suggestions.push({
        rule: 'ts-ignore',
        category: 'quality',
        severity: 'high',
        title: `TypeScript suppression (${kind})`,
        description: `Using ${kind} suppresses type errors. Consider fixing the underlying type issue.`,
        filePath,
        line: i + 1,
        suggestion: 'Fix the underlying type error instead',
      })
    }
  }

  return suggestions
}

// ─── Rule: Large files ───────────────────────────────────

/**
 * Detect files exceeding 300 lines.
 *
 * @example
 * ruleLargeFile('a\n'.repeat(400), 'big.ts')
 * // => [{ rule: 'large-file', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions if file exceeds threshold
 */
export function ruleLargeFile(content: string, filePath: string): Suggestion[] {
  const lines = content.split('\n')
  const threshold = 300

  if (lines.length > threshold) {
    return [
      {
        rule: 'large-file',
        category: 'maintenance',
        severity: 'medium',
        title: `Large file (${lines.length} lines)`,
        description: `This file has ${lines.length} lines, exceeding the ${threshold}-line threshold. Large files are harder to maintain and understand.`,
        filePath,
        line: 1,
        suggestion: 'Consider splitting into smaller modules',
      },
    ]
  }

  return []
}

// ─── Rule: Long functions ────────────────────────────────

/**
 * Detect functions exceeding 50 lines.
 *
 * @example
 * ruleLongFunction('function foo() {\n' + '  // ...\n'.repeat(60) + '}', 'test.ts')
 * // => [{ rule: 'long-function', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for long functions
 */
export function ruleLongFunction(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')
  const threshold = 50

  // Pattern matches function declarations, method declarations, arrow functions with block bodies
  const functionStartPattern =
    /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(?:(?:public|private|protected|static|async)\s+)*\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{)/

  for (let i = 0; i < lines.length; i++) {
    const lineI = lines[i]
    if (!lineI) continue
    if (functionStartPattern.exec(lineI)) {
      const startLine = i
      let depth = 0
      let endLine = i
      let foundBrace = false

      for (let j = i; j < lines.length; j++) {
        const line = lines[j]
        if (!line) continue
        for (const ch of line) {
          if (ch === '{') {
            depth++
            foundBrace = true
          } else if (ch === '}') {
            depth--
            if (foundBrace && depth === 0) {
              endLine = j
              break
            }
          }
        }
        if (foundBrace && depth === 0) break
      }

      const functionLength = endLine - startLine + 1
      if (functionLength > threshold) {
        suggestions.push({
          rule: 'long-function',
          category: 'maintenance',
          severity: 'medium',
          title: `Long function (${functionLength} lines)`,
          description: `Function starting at line ${startLine + 1} spans ${functionLength} lines, exceeding the ${threshold}-line threshold. Long functions are harder to test and understand.`,
          filePath,
          line: startLine + 1,
          suggestion: 'Extract helper functions for readability',
        })
      }

      // Skip past this function to avoid nested detection
      i = endLine
    }
  }

  return suggestions
}

// ─── Rule: Deep nesting ──────────────────────────────────

/**
 * Detect code with nesting depth greater than 4 levels.
 *
 * @example
 * ruleDeepNesting('    if (a) {\n      if (b) {\n        if (c) {\n          if (d) {\n            if (e) {\n', 'test.ts')
 * // => [{ rule: 'deep-nesting', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for deeply nested code
 */
export function ruleDeepNesting(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')
  const maxDepth = 4
  let depth = 0
  const reported: Set<number> = new Set()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const trimmed = line.trim()

    // Skip blank lines and comments
    if (trimmed.length === 0 || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      continue
    }

    for (const ch of line) {
      if (ch === '{' || ch === '(') {
        depth++
      } else if (ch === '}' || ch === ')') {
        depth--
      }
    }

    if (depth > maxDepth && !reported.has(i)) {
      reported.add(i)
      suggestions.push({
        rule: 'deep-nesting',
        category: 'quality',
        severity: 'medium',
        title: `Deep nesting (depth ${depth})`,
        description: `Line ${i + 1} has nesting depth of ${depth}, exceeding the maximum of ${maxDepth}. Deep nesting makes code hard to follow.`,
        filePath,
        line: i + 1,
        suggestion: 'Reduce nesting with early returns or guard clauses',
      })
    }
  }

  // Keep only one suggestion per nesting block (first occurrence per depth escalation)
  // Deduplicate by keeping only first per consecutive group
  const deduped: Suggestion[] = []
  for (const s of suggestions) {
    const last = deduped[deduped.length - 1]
    if (deduped.length === 0 || (last && s.line - last.line > 5)) {
      deduped.push(s)
    }
  }

  return deduped
}

// ─── Rule: Magic numbers ─────────────────────────────────

/**
 * Detect hardcoded magic numbers in code.
 *
 * @example
 * ruleMagicNumbers('const x = 42;', 'test.ts')
 * // => [{ rule: 'magic-number', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for magic numbers
 */
export function ruleMagicNumbers(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')
  // Common numbers to skip: 0, 1, -1, 2, 10, 100, 1000, port-like numbers
  const skipNumbers = new Set(['0', '1', '-1', '2', '10', '100', '1000', '0x0', '0x1', '0o0', '0b0', '0b1'])
  // Pattern: standalone numbers (not in array index brackets, not in import/export, not in comments)
  const numberPattern = /(?<!\[)(?<!\w)(?<!\.)(-?\d+(?:\.\d+)?)(?!\w)(?!\])(?!\.[\d])/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const trimmed = line.trim()

    // Skip comments, imports, exports, strings
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('import ') ||
      trimmed.startsWith('export ')
    ) {
      continue
    }

    const matches = line.matchAll(numberPattern)
    for (const match of matches) {
      const num = match[1] ?? ''
      if (!num || skipNumbers.has(num)) continue
      // Skip numbers that look like port numbers (4-5 digits starting with common ranges)
      const numVal = Number.parseFloat(num)
      if (Number.isInteger(numVal) && numVal >= 1024 && numVal <= 65535) continue

      suggestions.push({
        rule: 'magic-number',
        category: 'style',
        severity: 'low',
        title: `Magic number (${num})`,
        description: `The number ${num} is used directly without a named constant. This makes code harder to understand and maintain.`,
        filePath,
        line: i + 1,
        suggestion: 'Extract to named constant',
      })
      break // Only report once per line
    }
  }

  return suggestions
}

// ─── Rule: Empty catch blocks ────────────────────────────

/**
 * Detect empty catch blocks.
 *
 * @example
 * ruleEmptyCatch('try { } catch (e) { }', 'test.ts')
 * // => [{ rule: 'empty-catch', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for empty catch blocks
 */
export function ruleEmptyCatch(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    // Match catch blocks that are empty or contain only whitespace
    const inlinePattern = /catch\s*(?:\([^)]*\))?\s*\{\s*\}/
    if (inlinePattern.exec(line)) {
      suggestions.push({
        rule: 'empty-catch',
        category: 'quality',
        severity: 'high',
        title: 'Empty catch block',
        description:
          'An empty catch block silently swallows errors, making debugging difficult. At minimum, log the error.',
        filePath,
        line: i + 1,
        suggestion: 'Handle the error or at least log it',
      })
      continue
    }

    // Multi-line empty catch: catch (e) { \n }
    const catchStart = /catch\s*(?:\([^)]*\))?\s*\{\s*$/
    if (catchStart.exec(line)) {
      // Check if the next non-empty line is just }
      for (let j = i + 1; j < lines.length && j <= i + 3; j++) {
        const nextLine = lines[j]
        if (!nextLine) continue
        const nextTrimmed = nextLine.trim()
        if (nextTrimmed.length === 0) continue
        if (nextTrimmed === '}') {
          suggestions.push({
            rule: 'empty-catch',
            category: 'quality',
            severity: 'high',
            title: 'Empty catch block',
            description:
              'An empty catch block silently swallows errors, making debugging difficult. At minimum, log the error.',
            filePath,
            line: i + 1,
            suggestion: 'Handle the error or at least log it',
          })
        }
        break
      }
    }
  }

  return suggestions
}

// ─── Rule: TODO/FIXME without issue reference ─────────────

/**
 * Detect TODO/FIXME comments without issue tracker references.
 *
 * @example
 * ruleTodoComments('// TODO: fix this', 'test.ts')
 * // => [{ rule: 'todo-no-issue', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for TODOs without issue references
 */
export function ruleTodoComments(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')
  const todoPattern = /(?:\/\/|\/\*|\*)\s*(TODO|FIXME)\b/i
  const issuePattern = /#\d+/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const todoMatch = todoPattern.exec(line)
    if (todoMatch && !issuePattern.exec(line)) {
      const kind = (todoMatch[1] ?? 'TODO').toUpperCase()
      suggestions.push({
        rule: 'todo-no-issue',
        category: 'maintenance',
        severity: 'low',
        title: `${kind} without issue reference`,
        description: `A ${kind} comment was found without a linked issue number. This makes it hard to track.`,
        filePath,
        line: i + 1,
        suggestion: 'Link to an issue tracker',
      })
    }
  }

  return suggestions
}

// ─── Rule: eval / new Function usage ─────────────────────

/**
 * Detect use of eval() or new Function().
 *
 * @example
 * ruleEvalUsage('eval("x = 2")', 'test.ts')
 * // => [{ rule: 'eval-usage', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for eval usage
 */
export function ruleEvalUsage(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')
  const evalPattern = /\beval\s*\(/
  const functionPattern = /new\s+Function\s*\(/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

    if (evalPattern.exec(line)) {
      suggestions.push({
        rule: 'eval-usage',
        category: 'security',
        severity: 'high',
        title: 'Use of eval()',
        description: 'eval() executes arbitrary code and is a security risk. Use safer alternatives.',
        filePath,
        line: i + 1,
        suggestion: 'Avoid eval — use safer alternatives',
      })
    }

    if (functionPattern.exec(line)) {
      suggestions.push({
        rule: 'eval-usage',
        category: 'security',
        severity: 'high',
        title: 'Use of new Function()',
        description: 'new Function() creates functions from strings, similar to eval(). This is a security risk.',
        filePath,
        line: i + 1,
        suggestion: 'Avoid eval — use safer alternatives',
      })
    }
  }

  return suggestions
}

// ─── Rule: Hardcoded secrets/strings ─────────────────────

/**
 * Detect potentially hardcoded secrets, API keys, tokens, or passwords.
 *
 * @example
 * ruleHardcodedStrings('const API_KEY = "abc123xyz789def456ghi"', 'test.ts')
 * // => [{ rule: 'hardcoded-secret', ... }]
 *
 * @param content - File content to scan
 * @param filePath - Relative file path
 * @returns Array of suggestions for potential hardcoded secrets
 */
export function ruleHardcodedStrings(content: string, filePath: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const lines = content.split('\n')

  // Variable names that suggest secrets
  const secretVarPattern =
    /(?:api_?key|secret|token|password|passwd|auth_?key|private_?key|access_?key)\s*[=:]\s*['"`]/
  // Long base64-ish strings
  const base64Pattern = /['"`][A-Za-z0-9+/]{40,}={0,2}['"`]/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import ')) continue

    if (secretVarPattern.exec(line.toLowerCase())) {
      suggestions.push({
        rule: 'hardcoded-secret',
        category: 'security',
        severity: 'high',
        title: 'Potential hardcoded secret',
        description:
          'A variable name suggests a secret (API key, token, password, etc.) may be hardcoded in the source code.',
        filePath,
        line: i + 1,
        suggestion: 'Move to environment variables',
      })
      continue
    }

    if (base64Pattern.exec(line)) {
      // Only flag if it looks like an assignment, not just any long string
      if (/=\s*['"`]/.exec(line)) {
        suggestions.push({
          rule: 'hardcoded-secret',
          category: 'security',
          severity: 'high',
          title: 'Potential hardcoded secret',
          description:
            'A long base64-encoded string was found assigned to a variable. This may be a leaked secret or token.',
          filePath,
          line: i + 1,
          suggestion: 'Move to environment variables',
        })
      }
    }
  }

  return suggestions
}

// ─── Analyze file (all rules) ────────────────────────────

/**
 * Run all suggestion rules on a single file's content.
 *
 * @example
 * analyzeFile('const x: any = eval("1")', 'test.ts')
 * // => [...suggestions from all applicable rules...]
 *
 * @param content - File content to analyze
 * @param filePath - Relative file path
 * @returns Combined array of all suggestions from all rules
 */
export function analyzeFile(content: string, filePath: string): Suggestion[] {
  const rules: Array<(content: string, filePath: string) => Suggestion[]> = [
    ruleConsoleLog,
    ruleAnyType,
    ruleTsIgnore,
    ruleLargeFile,
    ruleLongFunction,
    ruleDeepNesting,
    ruleMagicNumbers,
    ruleEmptyCatch,
    ruleTodoComments,
    ruleEvalUsage,
    ruleHardcodedStrings,
  ]

  const allSuggestions: Suggestion[] = []
  for (const rule of rules) {
    const results = rule(content, filePath)
    allSuggestions.push(...results)
  }

  return allSuggestions
}

// ─── Build aggregated result ─────────────────────────────

const SEVERITY_ORDER: Record<SuggestionSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

/**
 * Build aggregated SuggestionsResult from raw suggestions with optional filtering.
 *
 * @example
 * buildSuggestionsResult(suggestions, { category: 'security', severity: 'high' })
 * // => { suggestions: [...filtered...], totalFound: 5, byCategory: [...], ... }
 *
 * @param suggestions - Raw array of suggestions
 * @param options - Filter options for category and severity
 * @returns Aggregated result with breakdowns
 */
export function buildSuggestionsResult(
  suggestions: Suggestion[],
  options: BuildSuggestionsOptions = {},
): SuggestionsResult {
  let filtered = suggestions

  // Filter by category
  if (options.category && options.category !== 'all') {
    filtered = filtered.filter((s) => s.category === options.category)
  }

  // Filter by severity
  if (options.severity && options.severity !== 'all') {
    filtered = filtered.filter((s) => s.severity === options.severity)
  }

  // Sort: severity (high first), then line number
  filtered.sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (sevDiff !== 0) return sevDiff
    return a.line - b.line
  })

  // Build byCategory breakdown
  const categoryMap = new Map<string, number>()
  for (const s of filtered) {
    categoryMap.set(s.category, (categoryMap.get(s.category) ?? 0) + 1)
  }
  const byCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  // Build bySeverity breakdown
  const severityMap = new Map<string, number>()
  for (const s of filtered) {
    severityMap.set(s.severity, (severityMap.get(s.severity) ?? 0) + 1)
  }
  const bySeverity = Array.from(severityMap.entries())
    .map(([severity, count]) => ({ severity, count }))
    .sort((a, b) => {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
    })

  // Build topRules breakdown
  const ruleMap = new Map<string, number>()
  for (const s of filtered) {
    ruleMap.set(s.rule, (ruleMap.get(s.rule) ?? 0) + 1)
  }
  const topRules = Array.from(ruleMap.entries())
    .map(([rule, count]) => ({ rule, count }))
    .sort((a, b) => b.count - a.count)

  return {
    suggestions: filtered,
    totalFound: filtered.length,
    byCategory,
    bySeverity,
    topRules,
  }
}
