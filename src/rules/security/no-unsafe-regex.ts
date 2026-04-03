/**
 * @fileoverview Detect potentially unsafe regular expression patterns
 * @module rules/security/no-unsafe-regex
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

interface UnsafeRegexInfo {
  readonly pattern: string
  readonly reason: string
  readonly location: SourceLocation
}

interface NoUnsafeRegexOptions {
  readonly checkReDoS?: boolean
  readonly checkInjection?: boolean
}

/**
 * Patterns that indicate potential ReDoS vulnerabilities
 */
const REDOS_PATTERNS = [
  // Nested quantifiers: (a+)+, (a*)*, (a+)?, etc.
  /\([^)]+[+*?][^)]*\)[+*?]/,
  // Alternation with overlapping patterns: (a|a)
  /\(([^|)]+)\|\1\)/,
  // Quantified groups with overlapping character classes
  /\[[^\]]+\][+*?]\[[^\]]+\]/,
]

/**
 * Checks if a regex pattern contains nested quantifiers
 */
function hasNestedQuantifiers(pattern: string): boolean {
  // Match patterns like (a+)+, (a*)*, (a+)?, (a?)+
  const nestedQuantifierPattern = /\([^)]*[+*?][^)]*\)[+*?]/
  return nestedQuantifierPattern.test(pattern)
}

/**
 * Checks if a regex pattern has overlapping character classes
 */
function hasOverlappingCharacterClasses(pattern: string): boolean {
  // Look for character classes that might overlap
  const charClassPattern = /\[([^\]]+)\]/g
  const classes: string[] = []
  let match: RegExpExecArray | null

  while ((match = charClassPattern.exec(pattern)) !== null) {
    classes.push(match[1])
  }

  // Check for potential overlaps
  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      if (hasOverlap(classes[i], classes[j])) {
        return true
      }
    }
  }

  return false
}

/**
 * Checks if two character class contents overlap
 */
function hasOverlap(class1: string, class2: string): boolean {
  // Simple check for common characters
  const chars1 = new Set(class1.split(''))
  const chars2 = new Set(class2.split(''))

  for (const char of chars1) {
    if (chars2.has(char) && char !== '-' && char !== '^') {
      return true
    }
  }

  return false
}

/**
 * Checks if a pattern has unbounded repetitions that could cause issues
 */
function hasUnboundedRepetitions(pattern: string): boolean {
  // Match patterns with large or infinite quantifiers
  const unboundedPattern = /[+*]|\{\d+,\}/
  return unboundedPattern.test(pattern)
}

/**
 * Checks if a pattern has complex alternation groups
 */
function hasComplexAlternation(pattern: string): boolean {
  // Count alternation operators within groups
  const groupPattern = /\(([^)]+)\)/g
  let match: RegExpExecArray | null

  while ((match = groupPattern.exec(pattern)) !== null) {
    const groupContent = match[1]
    const alternationCount = (groupContent.match(/\|/g) || []).length
    if (alternationCount > 2) {
      return true
    }
  }

  return false
}

/**
 * Analyzes a regex pattern for potential security issues
 */
function analyzePattern(pattern: string): string[] {
  const issues: string[] = []

  if (hasNestedQuantifiers(pattern)) {
    issues.push('Contains nested quantifiers which can cause catastrophic backtracking (ReDoS)')
  }

  if (hasOverlappingCharacterClasses(pattern)) {
    issues.push('Contains overlapping character classes which can cause ambiguous matching')
  }

  if (hasUnboundedRepetitions(pattern)) {
    issues.push('Contains unbounded repetitions which can cause performance issues')
  }

  if (hasComplexAlternation(pattern)) {
    issues.push('Contains complex alternation groups which are hard to debug and maintain')
  }

  return issues
}

/**
 * Extracts the location from an AST node
 */
function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }
}

/**
 * Extracts the pattern string from a regex literal or RegExp constructor
 */
function extractPattern(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  // Handle regex literal: /pattern/flags
  if (n.regex) {
    const regex = n.regex as Record<string, unknown>
    return typeof regex.pattern === 'string' ? regex.pattern : null
  }

  // Handle new RegExp(pattern) or RegExp(pattern)
  if (n.type === 'NewExpression' || n.type === 'CallExpression') {
    const args = n.arguments as unknown[] | undefined
    if (args && args.length > 0) {
      const firstArg = args[0] as Record<string, unknown>
      if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
        return firstArg.value
      }
      // If the argument is not a literal, it might be user input (injection risk)
      if (firstArg.type === 'Identifier' || firstArg.type === 'MemberExpression') {
        return '__DYNAMIC__'
      }
    }
  }

  return null
}

/**
 * Checks if a node is a RegExp literal or constructor
 */
function isRegexNode(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  // Regex literal
  if (n.regex) {
    return true
  }

  // new RegExp() or RegExp()
  if (n.type === 'NewExpression' || n.type === 'CallExpression') {
    const callee = n.callee as Record<string, unknown> | undefined
    if (callee?.type === 'Identifier' && callee.name === 'RegExp') {
      return true
    }
  }

  return false
}

/**
 * Rule: no-unsafe-regex
 * Detects potentially unsafe regular expression patterns
 */
export const noUnsafeRegexRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warning',
    docs: {
      description:
        'Detect potentially unsafe regular expression patterns that can cause ReDoS (catastrophic backtracking), injection vulnerabilities, or performance issues.',
      category: 'security',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-regex',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checkReDoS: {
            type: 'boolean',
            default: true,
          },
          checkInjection: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const options = context.config.options?.[0] as NoUnsafeRegexOptions | undefined
    const checkReDoS = options?.checkReDoS ?? true
    const checkInjection = options?.checkInjection ?? true

    const unsafePatterns: UnsafeRegexInfo[] = []

    return {
      Literal(node: unknown): void {
        if (!isRegexNode(node)) {
          return
        }

        const pattern = extractPattern(node)
        if (!pattern) {
          return
        }

        // Check for dynamic patterns (injection risk)
        if (pattern === '__DYNAMIC__') {
          if (checkInjection) {
            const location = extractLocation(node)
            context.report({
              node,
              message:
                'RegExp constructor with dynamic input detected. This can lead to regex injection vulnerabilities. Consider using a safe regex library or escaping user input.',
              loc: location,
            })
          }
          return
        }

        // Analyze the pattern for issues
        const issues = analyzePattern(pattern)

        if (issues.length > 0 && checkReDoS) {
          const location = extractLocation(node)
          const message = `Unsafe regex pattern detected: "${pattern}". Issues: ${issues.join('; ')}. Consider refactoring to avoid ReDoS vulnerabilities.`

          unsafePatterns.push({
            pattern,
            reason: issues.join('; '),
            location,
          })

          context.report({
            node,
            message,
            loc: location,
          })
        }
      },

      NewExpression(node: unknown): void {
        if (!isRegexNode(node)) {
          return
        }

        const pattern = extractPattern(node)
        if (!pattern) {
          return
        }

        // Check for dynamic patterns (injection risk)
        if (pattern === '__DYNAMIC__') {
          if (checkInjection) {
            const location = extractLocation(node)
            context.report({
              node,
              message:
                'RegExp constructor with dynamic input detected. This can lead to regex injection vulnerabilities. Consider using a safe regex library or escaping user input.',
              loc: location,
            })
          }
          return
        }

        // Analyze the pattern for issues
        const issues = analyzePattern(pattern)

        if (issues.length > 0 && checkReDoS) {
          const location = extractLocation(node)
          const message = `Unsafe regex pattern detected: "${pattern}". Issues: ${issues.join('; ')}. Consider refactoring to avoid ReDoS vulnerabilities.`

          unsafePatterns.push({
            pattern,
            reason: issues.join('; '),
            location,
          })

          context.report({
            node,
            message,
            loc: location,
          })
        }
      },

      CallExpression(node: unknown): void {
        if (!isRegexNode(node)) {
          return
        }

        const pattern = extractPattern(node)
        if (!pattern) {
          return
        }

        // Check for dynamic patterns (injection risk)
        if (pattern === '__DYNAMIC__') {
          if (checkInjection) {
            const location = extractLocation(node)
            context.report({
              node,
              message:
                'RegExp constructor with dynamic input detected. This can lead to regex injection vulnerabilities. Consider using a safe regex library or escaping user input.',
              loc: location,
            })
          }
          return
        }

        // Analyze the pattern for issues
        const issues = analyzePattern(pattern)

        if (issues.length > 0 && checkReDoS) {
          const location = extractLocation(node)
          const message = `Unsafe regex pattern detected: "${pattern}". Issues: ${issues.join('; ')}. Consider refactoring to avoid ReDoS vulnerabilities.`

          unsafePatterns.push({
            pattern,
            reason: issues.join('; '),
            location,
          })

          context.report({
            node,
            message,
            loc: location,
          })
        }
      },
    }
  },
}

export default noUnsafeRegexRule
