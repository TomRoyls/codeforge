import type {
  DiffFile,
  DiffChange,
  ReviewComment,
  ReviewResult,
  ReviewSummary,
  ReviewConfig,
  ReviewContext,
  ReviewRule,
} from './types.js'
import { SEVERITY_LEVELS, DEFAULT_CONFIG } from './types.js'

const noConsoleLogRule: ReviewRule = {
  id: 'no-console-log',
  name: 'No Console Log',
  category: 'best-practices',
  severity: 'minor',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    if (/console\.(log|debug|info|warn|error)\s*\(/.test(change.content)) {
      if (/\.test\./.test(context.filePath) || /\.spec\./.test(context.filePath)) return null
      return {
        filePath: context.filePath,
        line: change.lineNumber,
        side: 'RIGHT',
        message: 'Avoid using console.log in production code',
        severity: 'minor',
        category: 'best-practices',
        suggestion: 'Use a proper logging library instead',
        ruleId: 'no-console-log',
      }
    }
    return null
  },
}

const noTodoCommentsRule: ReviewRule = {
  id: 'no-todo-comments',
  name: 'No TODO Comments',
  category: 'best-practices',
  severity: 'info',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    if (/\/\/\s*(TODO|FIXME|HACK|XXX)\b/i.test(change.content)) {
      return {
        filePath: context.filePath,
        line: change.lineNumber,
        side: 'RIGHT',
        message: 'TODO/FIXME/HACK comment found',
        severity: 'info',
        category: 'best-practices',
        suggestion: 'Resolve the TODO or create an issue to track it',
        ruleId: 'no-todo-comments',
      }
    }
    return null
  },
}

const noDebuggerRule: ReviewRule = {
  id: 'no-debugger',
  name: 'No Debugger',
  category: 'best-practices',
  severity: 'critical',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    if (/(?:^|\s|;|\{)debugger\s*(?:;|\}|$)/.test(change.content)) {
      return {
        filePath: context.filePath,
        line: change.lineNumber,
        side: 'RIGHT',
        message: 'Debugger statement found',
        severity: 'critical',
        category: 'best-practices',
        suggestion: 'Remove the debugger statement before committing',
        ruleId: 'no-debugger',
      }
    }
    return null
  },
}

const maxLineLengthRule: ReviewRule = {
  id: 'max-line-length',
  name: 'Max Line Length',
  category: 'style',
  severity: 'minor',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    if (change.content.length > 120) {
      return {
        filePath: context.filePath,
        line: change.lineNumber,
        side: 'RIGHT',
        message: `Line exceeds 120 characters (${change.content.length} chars)`,
        severity: 'minor',
        category: 'style',
        suggestion: 'Break the line into multiple lines',
        ruleId: 'max-line-length',
      }
    }
    return null
  },
}

const noAnyTypeRule: ReviewRule = {
  id: 'no-any-type',
  name: 'No Any Type',
  category: 'type-safety',
  severity: 'major',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    if (/\bany\b/.test(change.content) && (/:\s*any\b/.test(change.content) || /:\s*any[\[\]\|\&]/.test(change.content) || /<any>/.test(change.content) || /\bas\s+any\b/.test(change.content))) {
      return {
        filePath: context.filePath,
        line: change.lineNumber,
        side: 'RIGHT',
        message: 'Avoid using `any` type annotation',
        severity: 'major',
        category: 'type-safety',
        suggestion: 'Use a more specific type or `unknown`',
        ruleId: 'no-any-type',
      }
    }
    return null
  },
}

const preferConstRule: ReviewRule = {
  id: 'prefer-const',
  name: 'Prefer Const',
  category: 'best-practices',
  severity: 'minor',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    if (/^\s*let\s+\w+\s*=/.test(change.content)) {
      const varMatch = change.content.match(/^\s*let\s+(\w+)\s*=/)
      if (varMatch?.[1]) {
        const varName = varMatch[1]
        let reassigned = false
        for (const c of context.allChanges) {
          if (c === change) continue
          if (c.type === 'add') {
            const reassignPattern = new RegExp(`\\b${varName}\\s*[^=!<>]=[^=]`)
            if (reassignPattern.test(c.content)) {
              reassigned = true
              break
            }
          }
        }
        if (!reassigned) {
          return {
            filePath: context.filePath,
            line: change.lineNumber,
            side: 'RIGHT',
            message: `\`${varName}\` is never reassigned. Use \`const\` instead`,
            severity: 'minor',
            category: 'best-practices',
            suggestion: `Change \`let ${varName}\` to \`const ${varName}\``,
            ruleId: 'prefer-const',
          }
        }
      }
    }
    return null
  },
}

const noEmptyCatchRule: ReviewRule = {
  id: 'no-empty-catch',
  name: 'No Empty Catch',
  category: 'error-handling',
  severity: 'major',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    if (/\bcatch\s*\(/.test(change.content)) {
      const braceIndex = context.allChanges.findIndex((c) => c === change)
      if (braceIndex !== -1) {
        const remaining = context.allChanges.slice(braceIndex)
        let depth = 0
        let catchContent = ''
        let catchStartLine = -1
        for (const c of remaining) {
          if (catchStartLine === -1 && c.content.includes('{')) {
            catchStartLine = c.lineNumber
          }
          for (const ch of c.content) {
            if (ch === '{') depth++
            if (ch === '}') depth--
          }
          catchContent += c.content + ' '
          if (catchStartLine !== -1 && depth === 0) break
        }
        const stripped = catchContent.replace(/\{|\}/g, '').replace(/\s+/g, '').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
        if (stripped.length === 0) {
          return {
            filePath: context.filePath,
            line: change.lineNumber,
            side: 'RIGHT',
            message: 'Empty catch block detected',
            severity: 'major',
            category: 'error-handling',
            suggestion: 'Add error handling or logging inside the catch block',
            ruleId: 'no-empty-catch',
          }
        }
      }
    }
    return null
  },
}

const largeFunctionRule: ReviewRule = {
  id: 'large-function',
  name: 'Large Function',
  category: 'complexity',
  severity: 'major',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    const fnMatch = change.content.match(/(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:function|\(|\w+\s*=>))/)
    if (!fnMatch) return null

    const startIndex = context.allChanges.findIndex((c) => c === change)
    if (startIndex === -1) return null

    let depth = 0
    let lineCount = 0
    let started = false

    for (let i = startIndex; i < context.allChanges.length; i++) {
      const c = context.allChanges[i]!
      if (c.type === 'add') {
        lineCount++
      }
      for (const ch of c.content) {
        if (ch === '{') {
          depth++
          started = true
        }
        if (ch === '}') {
          depth--
        }
      }
      if (started && depth === 0 && lineCount > 1) break
    }

    if (lineCount > 50) {
      return {
        filePath: context.filePath,
        line: change.lineNumber,
        side: 'RIGHT',
        message: `Function is too long (${lineCount} lines). Maximum is 50 lines`,
        severity: 'major',
        category: 'complexity',
        suggestion: 'Break the function into smaller, focused functions',
        ruleId: 'large-function',
      }
    }
    return null
  },
}

const noHardcodedSecretsRule: ReviewRule = {
  id: 'no-hardcoded-secrets',
  name: 'No Hardcoded Secrets',
  category: 'security',
  severity: 'blocker',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    const secretPatterns = [
      /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]+['"]/i,
      /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/i,
      /(?:secret|token|auth)\s*[:=]\s*['"][^'"]{8,}['"]/i,
      /(?:AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY)\s*[:=]/i,
      /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
      /ghp_[0-9a-zA-Z]{36}/,
      /sk-[a-zA-Z0-9]{32,}/,
    ]
    for (const pattern of secretPatterns) {
      if (pattern.test(change.content)) {
        return {
          filePath: context.filePath,
          line: change.lineNumber,
          side: 'RIGHT',
          message: 'Potential hardcoded secret or API key detected',
          severity: 'blocker',
          category: 'security',
          suggestion: 'Use environment variables or a secrets manager',
          ruleId: 'no-hardcoded-secrets',
        }
      }
    }
    return null
  },
}

const requireErrorHandlingRule: ReviewRule = {
  id: 'require-error-handling',
  name: 'Require Error Handling',
  category: 'error-handling',
  severity: 'major',
  evaluate: (change: DiffChange, context: ReviewContext): ReviewComment | null => {
    if (change.type === 'delete' || change.type === 'normal') return null
    if (/(?:await\s+|\.then\()/.test(change.content)) {
      const allContent = context.allChanges
        .filter((c) => c.type === 'add')
        .map((c) => c.content)
        .join(' ')

      const hasTryCatch = /try\s*\{/.test(allContent)
      const hasCatch = /\.catch\s*\(/.test(allContent)

      if (!hasTryCatch && !hasCatch) {
        return {
          filePath: context.filePath,
          line: change.lineNumber,
          side: 'RIGHT',
          message: 'Async operation without error handling detected',
          severity: 'major',
          category: 'error-handling',
          suggestion: 'Wrap async operations in try/catch or add .catch() handler',
          ruleId: 'require-error-handling',
        }
      }
    }
    return null
  },
}

const BUILTIN_RULES: ReviewRule[] = [
  noConsoleLogRule,
  noTodoCommentsRule,
  noDebuggerRule,
  maxLineLengthRule,
  noAnyTypeRule,
  preferConstRule,
  noEmptyCatchRule,
  largeFunctionRule,
  noHardcodedSecretsRule,
  requireErrorHandlingRule,
]

export class ReviewEngine {
  private config: ReviewConfig
  private rules: ReviewRule[]

  constructor(config: Partial<ReviewConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.rules = [...BUILTIN_RULES]
  }

  addRule(rule: ReviewRule): void {
    this.rules.push(rule)
  }

  getRules(): ReviewRule[] {
    return [...this.rules]
  }

  review(diffFiles: DiffFile[]): ReviewResult {
    const allComments: ReviewComment[] = []

    for (const file of diffFiles) {
      if (this.shouldIgnoreFile(file.path)) continue
      const comments = this.reviewFile(file)
      allComments.push(...comments)
    }

    const filtered = this.filterBySeverity(allComments, this.config.minSeverity)
    const deduplicated = this.deduplicateComments(filtered)
    const limited = deduplicated.slice(0, this.config.maxComments)

    const summary = this.buildSummary(limited, diffFiles.length)
    const result: ReviewResult = {
      comments: limited,
      summary,
      score: 0,
      approved: false,
    }
    result.score = this.calculateScore(result)
    result.approved = this.isApproved(result.score)

    return result
  }

  reviewFile(file: DiffFile): ReviewComment[] {
    const comments: ReviewComment[] = []

    for (const hunk of file.hunks) {
      const context: ReviewContext = {
        filePath: file.path,
        hunk,
        allChanges: hunk.changes,
      }

      for (const change of hunk.changes) {
        const changeComments = this.reviewChange(change, context)
        comments.push(...changeComments)
      }
    }

    return comments
  }

  reviewChange(change: DiffChange, context: ReviewContext): ReviewComment[] {
    const comments: ReviewComment[] = []

    for (const rule of this.rules) {
      if (this.config.enabledCategories.length > 0 && !this.config.enabledCategories.includes(rule.category)) {
        continue
      }

      const comment = rule.evaluate(change, context)
      if (comment) {
        comments.push(comment)
      }
    }

    return comments
  }

  calculateScore(result: ReviewResult): number {
    const { summary } = result
    if (summary.totalComments === 0) return 100

    const weights: Record<string, number> = {
      blocker: 25,
      critical: 15,
      major: 10,
      minor: 5,
      info: 1,
    }

    let penalty = 0
    penalty += summary.blockerCount * weights['blocker']!
    penalty += summary.criticalCount * weights['critical']!
    penalty += summary.majorCount * weights['major']!
    penalty += summary.minorCount * weights['minor']!
    penalty += summary.infoCount * weights['info']!

    const score = Math.max(0, 100 - penalty)
    return Math.round(score * 100) / 100
  }

  isApproved(score: number): boolean {
    const normalized = score / 100
    return normalized >= this.config.approvalThreshold
  }

  deduplicateComments(comments: ReviewComment[]): ReviewComment[] {
    const seen = new Set<string>()
    const result: ReviewComment[] = []

    for (const comment of comments) {
      const key = `${comment.filePath}:${comment.line}:${comment.ruleId ?? comment.message}`
      if (!seen.has(key)) {
        seen.add(key)
        result.push(comment)
      }
    }

    return result
  }

  filterBySeverity(comments: ReviewComment[], min: string): ReviewComment[] {
    const minLevel = SEVERITY_LEVELS[min as keyof typeof SEVERITY_LEVELS]
    if (minLevel === undefined) return comments

    return comments.filter((c) => {
      const level = SEVERITY_LEVELS[c.severity]
      return level !== undefined && level <= minLevel
    })
  }

  private shouldIgnoreFile(filePath: string): boolean {
    for (const pattern of this.config.ignorePatterns) {
      const regex = new RegExp(pattern)
      if (regex.test(filePath)) return true
    }
    return false
  }

  private buildSummary(comments: ReviewComment[], filesReviewed: number): ReviewSummary {
    const summary: ReviewSummary = {
      totalComments: comments.length,
      blockerCount: 0,
      criticalCount: 0,
      majorCount: 0,
      minorCount: 0,
      infoCount: 0,
      filesReviewed,
      filesWithIssues: 0,
      categories: {},
    }

    const filesWithIssues = new Set<string>()

    for (const comment of comments) {
      switch (comment.severity) {
        case 'blocker':
          summary.blockerCount++
          break
        case 'critical':
          summary.criticalCount++
          break
        case 'major':
          summary.majorCount++
          break
        case 'minor':
          summary.minorCount++
          break
        case 'info':
          summary.infoCount++
          break
      }

      filesWithIssues.add(comment.filePath)
      const count = summary.categories[comment.category] ?? 0
      summary.categories[comment.category] = count + 1
    }

    summary.filesWithIssues = filesWithIssues.size

    return summary
  }
}

export { BUILTIN_RULES }
