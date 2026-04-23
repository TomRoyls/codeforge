/**
 * @file Disallow use of eval() and related functions
 * @module rules/security/no-eval
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractRuleOptions } from '../../utils/options-helpers.js'
import { RULE_SUGGESTIONS } from '../../utils/suggestions.js'

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
  'execScript',
  'Function',
  'setImmediate',
  'setInterval',
  'setTimeout',
])

function isEvalLike(node: unknown): { callee: string; isEval: boolean; } {
  if (!node || typeof node !== 'object') {
    return { callee: '', isEval: false }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { callee: '', isEval: false }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return { callee: '', isEval: false }
  }

  // Direct eval call: eval(...)
  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    const {name} = callee
    if (name === 'eval') {
      return { callee: 'eval', isEval: true }
    }

    if (name === 'Function') {
      return { callee: 'Function', isEval: true }
    }
  }

  // Member expression: global.eval, window.eval, etc.
  if (callee.type === 'MemberExpression') {
    const property = callee.property as Record<string, unknown> | undefined
    if (property && property.type === 'Identifier' && typeof property.name === 'string') {
      const {name} = property
      if (DANGEROUS_FUNCTIONS.has(name)) {
        return { callee: name, isEval: true }
      }
    }
  }

  return { callee: '', isEval: false }
}

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
 * Rule: no-eval
 * Disallows use of eval() and similar dangerous functions
 */
export const noEvalRule: RuleDefinition = {
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
            loc: extractLocation(node),
            message: `Unexpected use of '${result.callee}'. This can lead to security vulnerabilities. ${RULE_SUGGESTIONS.noEval}`,
            node,
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
            loc: extractLocation(node),
            message:
              "Unexpected use of 'new Function()'. This is equivalent to eval() and can lead to security vulnerabilities. ${RULE_SUGGESTIONS.noEval}",
            node,
          })
        }
      },

      WithStatement(node: unknown): void {
        if (!options.allowWith) {
          context.report({
            loc: extractLocation(node),
            message:
              'Unexpected use of with statement. It is deprecated and can lead to security issues. ${RULE_SUGGESTIONS.noEval}',
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
        'Disallow the use of eval() and similar methods which can execute arbitrary code strings. These functions pose security risks and can lead to code injection vulnerabilities.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-eval',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowIndirect: {
            default: false,
            type: 'boolean',
          },
          allowWith: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default noEvalRule
