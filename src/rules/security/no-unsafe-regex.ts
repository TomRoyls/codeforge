/**
 * @file Detect potentially unsafe regular expression patterns
 * @module rules/security/no-unsafe-regex
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

interface NoUnsafeRegexOptions {
  readonly checkInjection?: boolean
  readonly checkReDoS?: boolean
}

function hasNestedQuantifiers(pattern: string): boolean {
  const nestedQuantifierPattern = /\([^)]*[+*?][^)]*\)[+*?]/
  return nestedQuantifierPattern.test(pattern)
}

function hasComplexAlternation(pattern: string): boolean {
  const groupPattern = /\(([^)]+)\)/g
  let match: null | RegExpExecArray

  while ((match = groupPattern.exec(pattern)) !== null) {
    const groupContent = match[1] ?? ''
    const alternationCount = (groupContent.match(/\|/g) ?? []).length
    if (alternationCount > 2) {
      return true
    }
  }

  return false
}

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

function extractPattern(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) {
    return null
  }

  if (n.regex) {
    const {regex} = n
    return typeof regex.pattern === 'string' ? regex.pattern : null
  }

  if (n.type === 'NewExpression' || n.type === 'CallExpression') {
    const args = n.arguments
    if (args && args.length > 0) {
      const firstArg = toASTNode(args[0])
      if (firstArg?.type === 'Literal' && typeof firstArg.value === 'string') {
        return firstArg.value
      }

      if (firstArg?.type === 'Identifier' || firstArg?.type === 'MemberExpression') {
        return '__DYNAMIC__'
      }
    }
  }

  return null
}

function isRegexNode(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) {
    return false
  }

  if (n.regex) {
    return true
  }

  if (n.type === 'NewExpression' || n.type === 'CallExpression') {
    const callee = toASTNode(n.callee)
    if (callee?.type === 'Identifier' && callee.name === 'RegExp') {
      return true
    }
  }

  return false
}

export const noUnsafeRegexRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = context.config.options?.[0] as NoUnsafeRegexOptions | undefined
    const checkReDoS = options?.checkReDoS ?? true
    const checkInjection = options?.checkInjection ?? true

    return {
      CallExpression(node: unknown): void {
        if (!isRegexNode(node)) {
          return
        }

        const pattern = extractPattern(node)
        if (!pattern) {
          return
        }

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

        const issues = analyzePattern(pattern)

        if (issues.length > 0 && checkReDoS) {
          const location = extractLocation(node)
          const message = `Unsafe regex pattern detected: "${pattern}". Issues: ${issues.join('; ')}. Consider refactoring to avoid ReDoS vulnerabilities.`

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

        const issues = analyzePattern(pattern)

        if (issues.length > 0 && checkReDoS) {
          const location = extractLocation(node)
          const message = `Unsafe regex pattern detected: "${pattern}". Issues: ${issues.join('; ')}. Consider refactoring to avoid ReDoS vulnerabilities.`

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

        const issues = analyzePattern(pattern)

        if (issues.length > 0 && checkReDoS) {
          const location = extractLocation(node)
          const message = `Unsafe regex pattern detected: "${pattern}". Issues: ${issues.join('; ')}. Consider refactoring to avoid ReDoS vulnerabilities.`

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
