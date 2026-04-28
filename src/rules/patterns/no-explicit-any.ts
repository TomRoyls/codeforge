import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface NoExplicitAnyOptions {
  readonly allowAsTypeAssertion?: boolean
  readonly allowInGenericArrays?: boolean
}

function isAnyKeyword(node: unknown): boolean {
  return toASTNode(node)?.type === 'TSAnyKeyword'
}

function isArrayOfAny(node: unknown): boolean {
  const n = toASTNode(node)
  return (n?.type === 'TSArrayType' || n?.type === 'ArrayType') && isAnyKeyword(n.elementType)
}

function isTypeAssertionToAny(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type === 'TSAsExpression' || n.type === 'TSTypeAssertion') {
    return isAnyKeyword(n.typeAnnotation)
  }

  return false
}

export const noExplicitAnyRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<NoExplicitAnyOptions>(context.config.options, {
      allowAsTypeAssertion: false,
      allowInGenericArrays: false,
    })

    return {
      TSAnyKeyword(node: unknown): void {
        if (!isAnyKeyword(node)) {
          return
        }

        const location = extractLocation(node)
        const range = getRange(node)
        context.report({
          fix: range
            ? {
                range,
                text: 'unknown',
              }
            : undefined,
          loc: location,
          message:
            "Unexpected use of the 'any' type. Use a more specific type for better type safety.",
        })
      },

      TSArrayType(node: unknown): void {
        if (options.allowInGenericArrays) {
          return
        }

        if (isArrayOfAny(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              "Unexpected array with 'any' element type. Use a more specific type like string[], number[], or a custom interface.",
          })
        }
      },

      TSAsExpression(node: unknown): void {
        if (options.allowAsTypeAssertion) {
          return
        }

        if (isTypeAssertionToAny(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              "Unexpected type assertion to 'any'. This bypasses type safety. Use a more specific type or type guards.",
          })
        }
      },

      TSTypeAssertion(node: unknown): void {
        if (options.allowAsTypeAssertion) {
          return
        }

        if (isTypeAssertionToAny(node)) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message:
              "Unexpected type assertion to 'any'. This bypasses type safety. Use a more specific type or type guards.",
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow usage of the any type in TypeScript. Use more specific types for better type safety.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-explicit-any',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowAsTypeAssertion: {
            default: false,
            type: 'boolean',
          },
          allowInGenericArrays: {
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

export default noExplicitAnyRule
