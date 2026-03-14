import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

interface NoFloatingPromisesOptions {
  readonly ignoreVoid?: boolean
  readonly ignoreIIFE?: boolean
}

function isExpressionStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'ExpressionStatement'
}

function isVoidOperator(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression' && n.operator === 'void'
}

function isAsyncFunctionCall(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return false
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  if (callee.type === 'MemberExpression') {
    const property = callee.property as Record<string, unknown> | undefined
    if (property && property.type === 'Identifier') {
      const name = property.name as string
      return name.startsWith('async') || name.startsWith('fetch') || name.includes('Async')
    }
  }

  if (callee.type === 'Identifier') {
    const name = callee.name as string
    return name.startsWith('async') || name.startsWith('fetch') || name.includes('Async')
  }

  return false
}

function isPromiseReturningCall(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return false
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  if (callee.type === 'MemberExpression') {
    const property = callee.property as Record<string, unknown> | undefined
    if (property && property.type === 'Identifier') {
      const name = property.name as string
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
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Require Promise-like statements to be handled appropriately. Floating Promises can cause unhandled rejections and race conditions.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-floating-promises',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreVoid: {
            type: 'boolean',
            default: false,
          },
          ignoreIIFE: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: NoFloatingPromisesOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as NoFloatingPromisesOptions

    return {
      ExpressionStatement(node: unknown): void {
        if (!isExpressionStatement(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const expression = n.expression

        if (isVoidOperator(expression)) {
          if (options.ignoreVoid === false) {
            return
          }
          return
        }

        if (isLikelyPromise(expression)) {
          const location = extractLocation(node)
          context.report({
            message:
              'Promises must be awaited, returned, or handled with .catch(). Floating Promises can cause unhandled rejections.',
            loc: location,
          })
        }
      },
    }
  },
}

export default noFloatingPromisesRule
