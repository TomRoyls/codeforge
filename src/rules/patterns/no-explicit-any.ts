import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange } from '../../utils/ast-helpers.js'

interface NoExplicitAnyOptions {
  readonly allowInGenericArrays?: boolean
  readonly allowAsTypeAssertion?: boolean
}

function isAnyKeyword(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'TSAnyKeyword'
}

function isArrayOfAny(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return (n.type === 'TSArrayType' || n.type === 'ArrayType') && isAnyKeyword(n.elementType)
}

function isTypeAssertionToAny(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type === 'TSAsExpression' || n.type === 'TSTypeAssertion') {
    return isAnyKeyword(n.typeAnnotation)
  }
  return false
}

export const noExplicitAnyRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow usage of the any type in TypeScript. Use more specific types for better type safety.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-explicit-any',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowInGenericArrays: {
            type: 'boolean',
            default: false,
          },
          allowAsTypeAssertion: {
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
    const rawOptions = context.config.options
    const options: NoExplicitAnyOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as NoExplicitAnyOptions

    return {
      TSAnyKeyword(node: unknown): void {
        if (!isAnyKeyword(node)) {
          return
        }
        const location = extractLocation(node)
        const range = getRange(node)
        context.report({
          message:
            "Unexpected use of the 'any' type. Use a more specific type for better type safety.",
          loc: location,
          fix: range
            ? {
                range,
                text: 'unknown',
              }
            : undefined,
        })
      },

      TSArrayType(node: unknown): void {
        if (options.allowInGenericArrays) {
          return
        }

        if (isArrayOfAny(node)) {
          const location = extractLocation(node)
          context.report({
            message:
              "Unexpected array with 'any' element type. Use a more specific type like string[], number[], or a custom interface.",
            loc: location,
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
            message:
              "Unexpected type assertion to 'any'. This bypasses type safety. Use a more specific type or type guards.",
            loc: location,
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
            message:
              "Unexpected type assertion to 'any'. This bypasses type safety. Use a more specific type or type guards.",
            loc: location,
          })
        }
      },
    }
  },
}

export default noExplicitAnyRule
