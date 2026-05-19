import type { EntropyOptions } from './entropy-helpers.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewFinding {
  id: string
  rule: string
  file: string
  line: number
  column: number
  severity: 'info' | 'warning' | 'error'
  category: 'correctness' | 'style' | 'complexity' | 'documentation' | 'security' | 'performance' | 'testing' | 'maintainability'
  message: string
  suggestion: string
  effort: 'trivial' | 'easy' | 'medium' | 'hard'
}

export interface FileReview {
  file: string
  findings: ReviewFinding[]
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  lines: number
  findingDensity: number
}

export interface ReviewStats {
  totalFiles: number
  totalFindings: number
  infoCount: number
  warningCount: number
  errorCount: number
  averageScore: number
  overallGrade: string
  filesWithErrors: number
  mostCommonFinding: string
  estimatedFixTime: string
}

export interface ReviewResult {
  files: FileReview[]
  findings: ReviewFinding[]
  stats: ReviewStats
  topIssues: ReviewFinding[]
  categoryBreakdown: Record<string, number>
  recommendations: string[]
}

export interface ReviewOptions {
  severity?: 'all' | 'warning' | 'error'
}

// ─── Severity Helpers ─────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<string, number> = { info: 0, warning: 1, error: 2 }
const EFFORT_MINUTES: Record<string, number> = { trivial: 2, easy: 5, medium: 15, hard: 30 }

function meetsSeverity(findingSeverity: string, filter: string): boolean {
  if (filter === 'all') return true
  return SEVERITY_ORDER[findingSeverity] >= SEVERITY_ORDER[filter]
}

let findingCounter = 0

function makeId(): string {
  findingCounter++
  return `RV${String(findingCounter).padStart(4, '0')}`
}

export function resetCounter(): void {
  findingCounter = 0
}

// ─── Rule: no-type-assertion ──────────────────────────────────────────────────

/**
 * Find `as any` type assertions.
 *
 * @example
 * checkNoTypeAssertion('x as any') // [finding]
 */
export function checkNoTypeAssertion(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]!.match(/\bas\s+any\b/)
    if (match) {
      findings.push({
        id: makeId(),
        rule: 'no-type-assertion',
        file: filePath,
        line: i + 1,
        column: (match.index ?? 0) + 1,
        severity: 'error',
        category: 'correctness',
        message: 'Usage of `as any` type assertion',
        suggestion: 'Use a proper type annotation or generic instead',
        effort: 'medium',
      })
    }
  }
  return findings
}

// ─── Rule: no-ts-ignore ───────────────────────────────────────────────────────

/**
 * Find @ts-ignore or @ts-expect-error directives.
 *
 * @example
 * checkNoTsIgnore('// @ts-ignore') // [finding]
 */
export function checkNoTsIgnore(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]!.match(/\/\/\s*@ts-(ignore|expect-error)/)
    if (match) {
      findings.push({
        id: makeId(),
        rule: 'no-ts-ignore',
        file: filePath,
        line: i + 1,
        column: (match.index ?? 0) + 1,
        severity: 'error',
        category: 'correctness',
        message: `Usage of @ts-${match[1]}`,
        suggestion: 'Fix the underlying type error instead of suppressing it',
        effort: 'hard',
      })
    }
  }
  return findings
}

// ─── Rule: no-empty-catch ─────────────────────────────────────────────────────

/**
 * Find empty catch blocks.
 *
 * @example
 * checkNoEmptyCatch('try {} catch (e) {}') // [finding]
 */
export function checkNoEmptyCatch(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const match = line.match(/\bcatch\s*\([^)]*\)\s*\{(\s*)\}/)
    if (match) {
      findings.push({
        id: makeId(),
        rule: 'no-empty-catch',
        file: filePath,
        line: i + 1,
        column: (match.index ?? 0) + 1,
        severity: 'warning',
        category: 'correctness',
        message: 'Empty catch block silently swallows errors',
        suggestion: 'Add error handling, logging, or a comment explaining why it is intentionally empty',
        effort: 'easy',
      })
    }
  }
  return findings
}

// ─── Rule: no-console-log ─────────────────────────────────────────────────────

/**
 * Find console.log calls in non-test files.
 *
 * @example
 * checkNoConsoleLog('console.log("x")', 'app.ts') // [finding]
 */
export function checkNoConsoleLog(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__')) {
    return findings
  }
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]!.match(/\bconsole\.log\s*\(/)
    if (match) {
      findings.push({
        id: makeId(),
        rule: 'no-console-log',
        file: filePath,
        line: i + 1,
        column: (match.index ?? 0) + 1,
        severity: 'warning',
        category: 'style',
        message: 'console.log found in production code',
        suggestion: 'Use a proper logging library or remove the console.log',
        effort: 'trivial',
      })
    }
  }
  return findings
}

// ─── Rule: max-complexity ─────────────────────────────────────────────────────

/**
 * Find functions with cyclomatic complexity > 15.
 *
 * @example
 * checkMaxComplexity('function f() { if(a){if(b){if(c){if(d){if(e){if(f){}}}}} }') // [finding]
 */
export function checkMaxComplexity(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  let funcStart = -1
  let braceDepth = 0
  let complexity = 1
  let funcName = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const funcMatch = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/)
    if (funcMatch && funcStart === -1) {
      funcStart = i
      funcName = funcMatch[1] ?? funcMatch[2] ?? 'anonymous'
      complexity = 1
      braceDepth = 0
    }

    for (const ch of line) {
      if (ch === '{') braceDepth++
      if (ch === '}') braceDepth--
    }

    if (funcStart !== -1) {
      const decisionPoints = (line.match(/\b(if|else\s+if|else|for|while|case|catch|&&|\|\||[?])/g) ?? []).length
      complexity += decisionPoints
    }

    if (funcStart !== -1 && braceDepth <= 0 && i > funcStart) {
      if (complexity > 15) {
        findings.push({
          id: makeId(),
          rule: 'max-complexity',
          file: filePath,
          line: funcStart + 1,
          column: 1,
          severity: 'warning',
          category: 'complexity',
          message: `Function "${funcName}" has cyclomatic complexity of ${complexity} (max 15)`,
          suggestion: 'Break the function into smaller, focused functions',
          effort: 'medium',
        })
      }
      funcStart = -1
      complexity = 1
    }
  }
  return findings
}

// ─── Rule: max-file-length ────────────────────────────────────────────────────

/**
 * Flag files over 400 lines.
 *
 * @example
 * checkMaxFileLength(content, 'big.ts') // [finding] if >400 lines
 */
export function checkMaxFileLength(content: string, filePath: string): ReviewFinding[] {
  const lineCount = content.split('\n').length
  if (lineCount > 400) {
    return [{
      id: makeId(),
      rule: 'max-file-length',
      file: filePath,
      line: 1,
      column: 1,
      severity: 'warning',
      category: 'maintainability',
      message: `File has ${lineCount} lines (max 400)`,
      suggestion: 'Split the file into smaller, focused modules',
      effort: 'hard',
    }]
  }
  return []
}

// ─── Rule: max-function-length ────────────────────────────────────────────────

/**
 * Find functions longer than 60 lines.
 *
 * @example
 * checkMaxFunctionLength(content, 'app.ts') // [finding] if any func >60 lines
 */
export function checkMaxFunctionLength(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  let funcStart = -1
  let braceDepth = 0
  let funcName = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const funcMatch = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/)
    if (funcMatch && funcStart === -1) {
      funcStart = i
      funcName = funcMatch[1] ?? funcMatch[2] ?? 'anonymous'
      braceDepth = 0
    }

    for (const ch of line) {
      if (ch === '{') braceDepth++
      if (ch === '}') braceDepth--
    }

    if (funcStart !== -1 && braceDepth <= 0 && i > funcStart) {
      const length = i - funcStart + 1
      if (length > 60) {
        findings.push({
          id: makeId(),
          rule: 'max-function-length',
          file: filePath,
          line: funcStart + 1,
          column: 1,
          severity: 'warning',
          category: 'maintainability',
          message: `Function "${funcName}" is ${length} lines long (max 60)`,
          suggestion: 'Extract parts of the function into smaller helper functions',
          effort: 'medium',
        })
      }
      funcStart = -1
    }
  }
  return findings
}

// ─── Rule: max-nesting ────────────────────────────────────────────────────────

/**
 * Find code with nesting depth > 4.
 *
 * @example
 * checkMaxNesting('if(a){if(b){if(c){if(d){if(e){}}}}}') // [finding]
 */
export function checkMaxNesting(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  let depth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    for (const ch of line) {
      if (ch === '{') depth++
      if (ch === '}') depth--
    }
    if (depth > 4) {
      findings.push({
        id: makeId(),
        rule: 'max-nesting',
        file: filePath,
        line: i + 1,
        column: 1,
        severity: 'warning',
        category: 'complexity',
        message: `Nesting depth of ${depth} (max 4)`,
        suggestion: 'Flatten the code using early returns, guard clauses, or extracted functions',
        effort: 'medium',
      })
      break
    }
  }
  return findings
}

// ─── Rule: no-magic-numbers ───────────────────────────────────────────────────

/**
 * Find unexplained numeric literals (excluding 0, 1, -1, 2).
 *
 * @example
 * checkNoMagicNumbers('const x = 42') // [finding]
 */
export function checkNoMagicNumbers(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  const excluded = new Set([0, 1, -1, 2])
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    const matches = line.matchAll(/(?<![.\w])((-?\d+)(?:\.\d+)?)(?!\w|[.])/g)
    for (const match of matches) {
      const num = Number(match[1])
      if (!excluded.has(num) && !Number.isNaN(num)) {
        findings.push({
          id: makeId(),
          rule: 'no-magic-numbers',
          file: filePath,
          line: i + 1,
          column: (match.index ?? 0) + 1,
          severity: 'info',
          category: 'maintainability',
          message: `Magic number ${match[1]}`,
          suggestion: 'Extract to a named constant with a descriptive name',
          effort: 'trivial',
        })
      }
    }
  }
  return findings
}

// ─── Rule: require-jsdoc ──────────────────────────────────────────────────────

/**
 * Find exported functions without JSDoc.
 *
 * @example
 * checkRequireJsdoc('export function foo() {}') // [finding]
 */
export function checkRequireJsdoc(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.match(/\bexport\s+function\s+(\w+)/)) {
      const prevLine = i > 0 ? lines[i - 1]!.trim() : ''
      if (!prevLine.startsWith('*') && !prevLine.startsWith('*/') && !prevLine.startsWith('/**')) {
        const match = line.match(/\bexport\s+function\s+(\w+)/)
        if (match) {
          findings.push({
            id: makeId(),
            rule: 'require-jsdoc',
            file: filePath,
            line: i + 1,
            column: 1,
            severity: 'info',
            category: 'documentation',
            message: `Exported function "${match[1]}" lacks JSDoc documentation`,
            suggestion: 'Add a JSDoc comment block above the function',
            effort: 'easy',
          })
        }
      }
    }
  }
  return findings
}

// ─── Rule: no-any-type ────────────────────────────────────────────────────────

/**
 * Find explicit `any` type annotations.
 *
 * @example
 * checkNoAnyType('const x: any = 1') // [finding]
 */
export function checkNoAnyType(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const matches = line.matchAll(/:\s*any\b/g)
    for (const match of matches) {
      findings.push({
        id: makeId(),
        rule: 'no-any-type',
        file: filePath,
        line: i + 1,
        column: (match.index ?? 0) + 1,
        severity: 'error',
        category: 'correctness',
        message: 'Explicit `any` type annotation',
        suggestion: 'Replace with a specific type',
        effort: 'medium',
      })
    }
  }
  return findings
}

// ─── Rule: no-var ─────────────────────────────────────────────────────────────

/**
 * Find `var` keyword usage.
 *
 * @example
 * checkNoVar('var x = 1') // [finding]
 */
export function checkNoVar(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]!.match(/\bvar\s+\w/)
    if (match) {
      findings.push({
        id: makeId(),
        rule: 'no-var',
        file: filePath,
        line: i + 1,
        column: (match.index ?? 0) + 1,
        severity: 'warning',
        category: 'style',
        message: 'Use of `var` keyword',
        suggestion: 'Replace with `const` or `let`',
        effort: 'trivial',
      })
    }
  }
  return findings
}

// ─── Rule: prefer-const ───────────────────────────────────────────────────────

/**
 * Find `let` declarations that are never reassigned (simplified heuristic).
 *
 * @example
 * checkPreferConst('let x = 1; console.log(x)') // [finding]
 */
export function checkPreferConst(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  const letBindings = new Map<string, number>()
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]!.match(/\blet\s+(\w+)\s*=/)
    if (match) {
      letBindings.set(match[1]!, i)
    }
  }
  for (const [name, lineIdx] of letBindings) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const reassignPattern = new RegExp(`\\b${escaped}\\s*(\\+\\+|--|\\*=|\\/=|\\+=|-=|=[^=])`, 'g')
    let reassigned = false
    for (let i = 0; i < lines.length; i++) {
      if (i === lineIdx) continue
      const line = lines[i]!
      if (line.match(/\blet\s+/)) continue
      if (reassignPattern.test(line)) {
        reassigned = true
        break
      }
      reassignPattern.lastIndex = 0
    }
    if (!reassigned) {
      findings.push({
        id: makeId(),
        rule: 'prefer-const',
        file: filePath,
        line: lineIdx + 1,
        column: 1,
        severity: 'info',
        category: 'style',
        message: `\`let\` declaration for "${name}" is never reassigned`,
        suggestion: 'Use `const` instead of `let`',
        effort: 'trivial',
      })
    }
  }
  return findings
}

// ─── Rule: no-hardcoded-strings ───────────────────────────────────────────────

/**
 * Find long string literals in source code.
 *
 * @example
 * checkNoHardcodedStrings("const msg = 'this is a very long hardcoded string in code'") // [finding]
 */
export function checkNoHardcodedStrings(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  if (filePath.includes('.test.') || filePath.includes('.spec.')) return findings
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const strings = line.matchAll(/['"`]([^'"`]{20,})['"`]/g)
    for (const match of strings) {
      if (match[1]!.match(/^[\w./\\:-]+$/)) continue
      findings.push({
        id: makeId(),
        rule: 'no-hardcoded-strings',
        file: filePath,
        line: i + 1,
        column: (match.index ?? 0) + 1,
        severity: 'info',
        category: 'maintainability',
        message: 'Long hardcoded string literal',
        suggestion: 'Extract to a constant or configuration',
        effort: 'easy',
      })
    }
  }
  return findings
}

// ─── Rule: consistent-return ──────────────────────────────────────────────────

/**
 * Find functions with mixed return patterns.
 *
 * @example
 * checkConsistentReturn('function f(x) { if(x) return 1; }') // [finding]
 */
export function checkConsistentReturn(content: string, filePath: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  const lines = content.split('\n')
  let funcStart = -1
  let braceDepth = 0
  let hasReturn = false
  let hasVoidReturn = false
  let funcName = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const funcMatch = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/)
    if (funcMatch && funcStart === -1) {
      funcStart = i
      funcName = funcMatch[1] ?? funcMatch[2] ?? 'anonymous'
      braceDepth = 0
      hasReturn = false
      hasVoidReturn = false
    }

    for (const ch of line) {
      if (ch === '{') braceDepth++
      if (ch === '}') braceDepth--
    }

    if (funcStart !== -1 && i >= funcStart) {
      if (line.match(/\breturn\b\s*;/)) hasVoidReturn = true
      else if (line.match(/\breturn\b\s+[^\s;]/)) hasReturn = true
      else if (line.match(/\breturn\s*$/)) hasVoidReturn = true
    }

    if (funcStart !== -1 && braceDepth <= 0 && i > funcStart) {
      if (hasReturn && hasVoidReturn) {
        findings.push({
          id: makeId(),
          rule: 'consistent-return',
          file: filePath,
          line: funcStart + 1,
          column: 1,
          severity: 'warning',
          category: 'correctness',
          message: `Function "${funcName}" has inconsistent return patterns`,
          suggestion: 'Ensure all code paths return a value or all return void',
          effort: 'easy',
        })
      }
      funcStart = -1
    }
  }
  return findings
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Compute a file score from 0-100 based on findings and line count.
 *
 * @example
 * computeFileScore([], 100) // 100
 */
export function computeFileScore(findings: ReviewFinding[], lines: number): number {
  let penalty = 0
  for (const f of findings) {
    if (f.severity === 'error') penalty += 10
    else if (f.severity === 'warning') penalty += 5
    else penalty += 1
  }
  const score = 100 - penalty
  return Math.max(0, score)
}

/**
 * Convert a numeric score to a letter grade.
 *
 * @example
 * computeGrade(95) // 'A'
 */
export function computeGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// ─── Estimate Fix Time ────────────────────────────────────────────────────────

/**
 * Estimate total fix time from findings.
 *
 * @example
 * estimateFixTime(findings) // '~15 minutes'
 */
export function estimateFixTime(findings: ReviewFinding[]): string {
  if (findings.length === 0) return '0 minutes'
  const minutes = findings.reduce((sum, f) => sum + (EFFORT_MINUTES[f.effort] ?? 5), 0)
  if (minutes < 60) return `~${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`
}

// ─── Review File ──────────────────────────────────────────────────────────────

/**
 * Run all review rules on a single file.
 *
 * @example
 * reviewFile('var x: any = 1;', 'app.ts') // FileReview
 */
export function reviewFile(content: string, filePath: string): FileReview {
  resetCounter()
  const allFindings: ReviewFinding[] = [
    ...checkNoTypeAssertion(content, filePath),
    ...checkNoTsIgnore(content, filePath),
    ...checkNoEmptyCatch(content, filePath),
    ...checkNoConsoleLog(content, filePath),
    ...checkMaxComplexity(content, filePath),
    ...checkMaxFileLength(content, filePath),
    ...checkMaxFunctionLength(content, filePath),
    ...checkMaxNesting(content, filePath),
    ...checkNoMagicNumbers(content, filePath),
    ...checkRequireJsdoc(content, filePath),
    ...checkNoAnyType(content, filePath),
    ...checkNoVar(content, filePath),
    ...checkPreferConst(content, filePath),
    ...checkNoHardcodedStrings(content, filePath),
    ...checkConsistentReturn(content, filePath),
  ]

  const lines = content.split('\n').length
  const score = computeFileScore(allFindings, lines)
  const grade = computeGrade(score)
  const findingDensity = lines > 0 ? Math.round((allFindings.length / lines) * 100 * 10) / 10 : 0

  return { file: filePath, findings: allFindings, score, grade, lines, findingDensity }
}

// ─── Generate Recommendations ─────────────────────────────────────────────────

/**
 * Generate actionable recommendations from findings.
 *
 * @example
 * generateRecommendations(findings, stats) // ['Fix 3 errors...']
 */
export function generateRecommendations(findings: ReviewFinding[], stats: ReviewStats): string[] {
  const recs: string[] = []

  if (stats.errorCount > 0) {
    recs.push(`Fix ${stats.errorCount} error-level issue${stats.errorCount > 1 ? 's' : ''} immediately — these indicate correctness problems`)
  }

  const categoryMap = new Map<string, number>()
  for (const f of findings) {
    categoryMap.set(f.category, (categoryMap.get(f.category) ?? 0) + 1)
  }
  const topCategory = [...categoryMap.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topCategory && topCategory[1] > 2) {
    recs.push(`Focus on ${topCategory[0]}: ${topCategory[1]} findings in this category`)
  }

  const ruleMap = new Map<string, number>()
  for (const f of findings) {
    ruleMap.set(f.rule, (ruleMap.get(f.rule) ?? 0) + 1)
  }
  const topRule = [...ruleMap.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topRule && topRule[1] > 1) {
    recs.push(`Most common issue: "${topRule[0]}" (${topRule[1]} occurrences) — batch-fix for efficiency`)
  }

  if (stats.warningCount > 5) {
    recs.push(`${stats.warningCount} warnings detected — consider addressing them to improve code quality`)
  }

  if (recs.length === 0) {
    recs.push('Code looks good! No significant issues found.')
  }

  return recs
}

// ─── Build Review Result ──────────────────────────────────────────────────────

/**
 * Orchestrate full review across multiple files.
 *
 * @example
 * buildReviewResult(['a.ts'], ['var x = 1;']) // ReviewResult
 */
export function buildReviewResult(files: string[], contents: string[], options?: ReviewOptions): ReviewResult {
  resetCounter()
  const severity = options?.severity ?? 'all'
  const fileReviews: FileReview[] = []
  const allFindings: ReviewFinding[] = []

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const content = contents[i] ?? ''
    const review = reviewFile(content, filePath)
    const filtered = review.findings.filter((f) => meetsSeverity(f.severity, severity))
    review.findings = filtered
    fileReviews.push(review)
    allFindings.push(...filtered)
  }

  const totalFiles = fileReviews.length
  const totalFindings = allFindings.length
  const errorCount = allFindings.filter((f) => f.severity === 'error').length
  const warningCount = allFindings.filter((f) => f.severity === 'warning').length
  const infoCount = allFindings.filter((f) => f.severity === 'info').length
  const filesWithErrors = fileReviews.filter((fr) => fr.findings.some((f) => f.severity === 'error')).length
  const averageScore = totalFiles > 0 ? Math.round(fileReviews.reduce((s, fr) => s + fr.score, 0) / totalFiles) : 100
  const overallGrade = computeGrade(averageScore)

  const ruleMap = new Map<string, number>()
  for (const f of allFindings) {
    ruleMap.set(f.rule, (ruleMap.get(f.rule) ?? 0) + 1)
  }
  const mostCommon = [...ruleMap.entries()].sort((a, b) => b[1] - a[1])[0]

  const categoryBreakdown: Record<string, number> = {}
  for (const f of allFindings) {
    categoryBreakdown[f.category] = (categoryBreakdown[f.category] ?? 0) + 1
  }

  const topIssues = [...allFindings].sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]).slice(0, 10)

  const stats: ReviewStats = {
    totalFiles,
    totalFindings,
    infoCount,
    warningCount,
    errorCount,
    averageScore,
    overallGrade,
    filesWithErrors,
    mostCommonFinding: mostCommon?.[0] ?? 'none',
    estimatedFixTime: estimateFixTime(allFindings),
  }

  const recommendations = generateRecommendations(allFindings, stats)

  return { files: fileReviews, findings: allFindings, stats, topIssues, categoryBreakdown, recommendations }
}
