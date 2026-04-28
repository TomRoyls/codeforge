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

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { DANGEROUS_FUNCTIONS } from '../../utils/constants.js'
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

function isEvalLike(node: unknown): { callee: string; isEval: boolean; } {
  const n = toASTNode(node)
  if (!n) {
    return { callee: '', isEval: false }
  }

  if (n.type !== 'CallExpression') {
    return { callee: '', isEval: false }
  }

  const callee = toASTNode(n.callee)

  if (!callee) {
    return { callee: '', isEval: false }
  }

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    const {name} = callee
    if (name === 'eval') {
      return { callee: 'eval', isEval: true }
    }

    if (name === 'Function') {
      return { callee: 'Function', isEval: true }
    }
  }

  if (callee.type === 'MemberExpression') {
    const property = toASTNode(callee.property)
    if (property && property.type === 'Identifier' && typeof property.name === 'string') {
      const {name} = property
      if (DANGEROUS_FUNCTIONS.has(name)) {
        return { callee: name, isEval: true }
      }
    }
  }

  return { callee: '', isEval: false }
}

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
          if (options.allowIndirect && result.callee === 'eval') {
            const n = toASTNode(node)
            const callee = toASTNode(n?.callee)
            if (callee?.type === 'MemberExpression') {
              return
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
        const n = toASTNode(node)
        if (!n) {
          return
        }

        const callee = toASTNode(n.callee)

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
