export interface PatternMatch {
  column: number
  line: number
  match: string
  pattern: string
}

export interface PatternRule {
  id: string
  pattern: RegExp
  message: string
  severity: 'error' | 'info' | 'warning'
}

const BUILTIN_PATTERNS: PatternRule[] = [
  {
    id: 'todo-comment',
    pattern: /\bTODO\b|FIXME\b|HACK\b|XXX\b/g,
    message: 'Found TODO/FIXME/HACK/XXX comment',
    severity: 'info',
  },
  {
    id: 'console-log',
    pattern: /\bconsole\.(log|debug|info|warn|error)\s*\(/g,
    message: 'Console statement found',
    severity: 'warning',
  },
  {
    id: 'debugger-statement',
    pattern: /\bdebugger\b/g,
    message: 'Debugger statement found',
    severity: 'error',
  },
  {
    id: 'hardcoded-port',
    pattern: /(?:localhost|127\.0\.0\.1):\d{4,5}/g,
    message: 'Hardcoded port number',
    severity: 'warning',
  },
  {
    id: 'hardcoded-secret',
    pattern: /(?:password|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"]{8,}/gi,
    message: 'Possible hardcoded secret',
    severity: 'error',
  },
]

export function findPatterns(
  content: string,
  rules: PatternRule[] = BUILTIN_PATTERNS,
): PatternMatch[] {
  const matches: PatternMatch[] = []
  const lines = content.split('\n')

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]!
    for (const rule of rules) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
      let match: RegExpExecArray | null
      while ((match = regex.exec(line)) !== null) {
        matches.push({
          line: lineIdx + 1,
          column: match.index + 1,
          match: match[0],
          pattern: rule.id,
        })
      }
    }
  }

  return matches
}

export function getBuiltinRules(): PatternRule[] {
  return [...BUILTIN_PATTERNS]
}

export function createCustomRule(
  id: string,
  pattern: RegExp,
  message: string,
  severity: PatternRule['severity'] = 'warning',
): PatternRule {
  return { id, pattern, message, severity }
}
