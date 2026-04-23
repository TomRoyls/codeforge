/**
 * @file Detect potentially unsafe regular expression patterns
 * @module rules/security/no-unsafe-regex
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

interface UnsafeRegexInfo {
  readonly location: SourceLocation
  readonly pattern: string
  readonly reason: string
}

interface NoUnsafeRegexOptions {
  readonly checkInjection?: boolean
  readonly checkReDoS?: boolean
}

/**
 * Checks if a regex pattern contains nested quantifiers
 */
function hasNestedQuantifiers(pattern: string): boolean {
  // Match patterns like (a+)+, (a*)*, (a+)?, (a?)+
  const nestedQuantifierPattern = /\([^)]*[+*?][^)]*\)[+*?]/
  return nestedQuantifierPattern.test(pattern)
}

/**
 * Checks if a pattern has complex alternation groups
 */
function hasComplexAlternation(pattern: string): boolean {
  // Count alternation operators within groups
  const groupPattern = /\(([^)]+)\)/g
  let match: null | RegExpExecArray

  while ((match = groupPattern.exec(pattern)) !== null) {
    const groupContent = match[1] ?? ''
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

  if (hasComplexAlternation(pattern)) {
    issues.push('Contains complex alternation groups which can cause performance issues')
  }

  return issues
}

/**
 * Extracts the location from an AST node
 */
function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    end: { column: 1, line: 1 },
    start: { column: 0, line: 1 },
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
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
    },
  }
}

/**
 * Extracts the pattern string from a regex literal or RegExp constructor
 */
function extractPattern(node: unknown): null | string {
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
    const args = n.arguments as undefined | unknown[]
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
  create(context: RuleContext): RuleVisitor {
    const options = context.config.options?.[0] as NoUnsafeRegexOptions | undefined
    const checkReDoS = options?.checkReDoS ?? true
    const checkInjection = options?.checkInjection ?? true

    const unsafePatterns: UnsafeRegexInfo[] = []

    return {
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
              loc: location,
              message:
                'RegExp constructor with dynamic input detected. This can lead to regex injection vulnerabilities. Consider using a safe regex library or escaping user input.',
              node,
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
            location,
            pattern,
            reason: issues.join('; '),
          })

          context.report({
            loc: location,
            message,
            node,
          })
        }
      },

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
              loc: location,
              message:
                'RegExp constructor with dynamic input detected. This can lead to regex injection vulnerabilities. Consider using a safe regex library or escaping user input.',
              node,
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
            location,
            pattern,
            reason: issues.join('; '),
          })

          context.report({
            loc: location,
            message,
            node,
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
              loc: location,
              message:
                'RegExp constructor with dynamic input detected. This can lead to regex injection vulnerabilities. Consider using a safe regex library or escaping user input.',
              node,
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
            location,
            pattern,
            reason: issues.join('; '),
          })

          context.report({
            loc: location,
            message,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Detect potentially unsafe regular expression patterns that can cause ReDoS (catastrophic backtracking), injection vulnerabilities, or security issues.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-regex',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          checkInjection: {
            default: true,
            type: 'boolean',
          },
          checkReDoS: {
            default: true,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUnsafeRegexRule
