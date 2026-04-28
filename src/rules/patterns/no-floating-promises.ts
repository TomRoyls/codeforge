import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoFloatingPromisesOptions {
  readonly ignoreIIFE?: boolean
  readonly ignoreVoid?: boolean
}

function isExpressionStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'ExpressionStatement'
}

function isVoidOperator(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'UnaryExpression' && n.operator === 'void'
}

function isAsyncFunctionCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'MemberExpression') {
    const property = toASTNode(callee.property)
    if (property?.type === 'Identifier') {
      const name = property.name!
      return name.startsWith('async') || name.startsWith('fetch') || name.includes('Async')
    }
  }

  if (callee.type === 'Identifier') {
    const name = callee.name!
    return name.startsWith('async') || name.startsWith('fetch') || name.includes('Async')
  }

  return false
}

function isPromiseReturningCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'MemberExpression') {
    const property = toASTNode(callee.property)
    if (property?.type === 'Identifier') {
      const {name} = property
      return (
        name === 'then' ||
        name === 'catch' ||
        name === 'finally' ||
        name === 'all' ||
        name === 'race' ||
        name === 'allSettled' ||
        name === 'any'
      )
    }
  }

  return false
}

function isLikelyPromise(node: unknown): boolean {
  return isAsyncFunctionCall(node) || isPromiseReturningCall(node)
}

export const noFloatingPromisesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoFloatingPromisesOptions>(context.config.options, {
      ignoreIIFE: false,
      ignoreVoid: false,
    })

    return {
      ExpressionStatement(node: unknown): void {
        if (!isExpressionStatement(node)) {
          return
        }

        const n = toASTNode(node)
        if (!n) return
        const {expression} = n

        if (isVoidOperator(expression)) {
          if (options.ignoreVoid === false) {
            return
          }

          return
        }

        if (isLikelyPromise(expression)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              'Promises must be awaited, returned, or handled with .catch(). Floating Promises can cause unhandled rejections.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Require Promise-like statements to be handled appropriately. Floating Promises can cause unhandled rejections and race conditions.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-floating-promises',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          ignoreIIFE: {
            default: false,
            type: 'boolean',
          },
          ignoreVoid: {
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

export default noFloatingPromisesRule
