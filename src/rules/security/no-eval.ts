/**
 * @fileoverview Disallow use of eval() and related functions
 * @module rules/security/no-eval
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface EvalCallInfo {
  readonly callee: string
  readonly location: SourceLocation
}

interface NoEvalOptions {
  readonly allowIndirect?: boolean
  readonly allowWith?: boolean
}

const DANGEROUS_FUNCTIONS = new Set([
  'eval',
  'Function',
  'setTimeout',
  'setInterval',
  'setImmediate',
  'execScript',
])

function isEvalLike(node: unknown): { isEval: boolean; callee: string } {
  if (!node || typeof node !== 'object') {
    return { isEval: false, callee: '' }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isEval: false, callee: '' }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return { isEval: false, callee: '' }
  }

  // Direct eval call: eval(...)
  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    const name = callee.name
    if (name === 'eval') {
      return { isEval: true, callee: 'eval' }
    }
    if (name === 'Function') {
      return { isEval: true, callee: 'Function' }
    }
  }

  // Member expression: global.eval, window.eval, etc.
  if (callee.type === 'MemberExpression') {
    const property = callee.property as Record<string, unknown> | undefined
    if (property && property.type === 'Identifier' && typeof property.name === 'string') {
      const name = property.name
      if (DANGEROUS_FUNCTIONS.has(name)) {
        return { isEval: true, callee: name }
      }
    }
  }

  return { isEval: false, callee: '' }
}

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
 * Rule: no-eval
 * Disallows use of eval() and similar dangerous functions
 */
export const noEvalRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow the use of eval() and similar methods which can execute arbitrary code strings. These functions pose security risks and can lead to code injection vulnerabilities.',
      category: 'security',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-eval',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowIndirect: {
            type: 'boolean',
            default: false,
          },
          allowWith: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoEvalOptions>(context.config.options, {
      allowIndirect: false,
      allowWith: false,
    })

    const evalCalls: EvalCallInfo[] = []

    return {
      CallExpression(node: unknown): void {
        const result = isEvalLike(node)

        if (result.isEval) {
          // Check for indirect eval (allowIndirect option)
          if (options.allowIndirect && result.callee === 'eval') {
            const n = node as Record<string, unknown>
            const callee = (n as Record<string, unknown>).callee as Record<string, unknown>
            if (callee?.type === 'MemberExpression') {
              return // Skip indirect eval if allowed
            }
          }

          evalCalls.push({
            callee: result.callee,
            location: extractLocation(node),
          })

          context.report({
            node,
            message: `Unexpected use of '${result.callee}'. This can lead to security vulnerabilities.`,
            loc: extractLocation(node),
          })
        }
      },

      WithStatement(node: unknown): void {
        if (!options.allowWith) {
          context.report({
            node,
            message:
              'Unexpected use of with statement. It is deprecated and can lead to security issues.',
            loc: extractLocation(node),
          })
        }
      },

      NewExpression(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const callee = n.callee as Record<string, unknown> | undefined

        if (callee?.type === 'Identifier' && callee.name === 'Function') {
          context.report({
            node,
            message:
              "Unexpected use of 'new Function()'. This is equivalent to eval() and can lead to security vulnerabilities.",
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}

export default noEvalRule
