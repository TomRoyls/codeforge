import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface PreferAsyncAwaitOptions {
  readonly allowPromiseMethods?: boolean
}

function isPromiseMethod(name: string): boolean {
  return name === 'then' || name === 'catch' || name === 'finally'
}

function isPromiseMethodCall(node: unknown): { isCall: boolean; method: string } {
  if (!node || typeof node !== 'object') {
    return { isCall: false, method: '' }
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return { isCall: false, method: '' }
  }

  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || callee.type !== 'MemberExpression') {
    return { isCall: false, method: '' }
  }

  const property = callee.property as Record<string, unknown> | undefined

  if (!property || property.type !== 'Identifier') {
    return { isCall: false, method: '' }
  }

  const methodName = property.name as string

  if (isPromiseMethod(methodName)) {
    return { isCall: true, method: methodName }
  }

  return { isCall: false, method: '' }
}

export const preferAsyncAwaitRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<PreferAsyncAwaitOptions>(context.config.options, {
      allowPromiseMethods: false,
    })

    return {
      CallExpression(node: unknown): void {
        if (options.allowPromiseMethods) {
          return
        }

        const { isCall, method } = isPromiseMethodCall(node)

        if (isCall) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: `Prefer async/await over .${method}() for better readability. Convert this Promise chain to use async/await syntax.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer async/await syntax over Promise .then()/.catch() chains for better readability and error handling.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-async-await',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowPromiseMethods: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferAsyncAwaitRule
