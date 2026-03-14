import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

interface MaxUnionSizeOptions {
  readonly max?: number
}

function countUnionTypes(node: unknown): number {
  if (!node || typeof node !== 'object') {
    return 0
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'TSUnionType') {
    return 0
  }

  const types = n.types as unknown[] | undefined

  if (!Array.isArray(types)) {
    return 0
  }

  return types.length
}

export const maxUnionSizeRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Enforce a maximum number of types in a union type. Large unions can indicate poor type design and make code harder to understand.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/max-union-size',
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'number',
            minimum: 1,
            default: 5,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options
    const options: MaxUnionSizeOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions[0] : {}
    ) as MaxUnionSizeOptions

    const maxUnionSize = options.max ?? 5

    return {
      TSUnionType(node: unknown): void {
        const unionCount = countUnionTypes(node)

        if (unionCount > maxUnionSize) {
          const location = extractLocation(node)
          context.report({
            message: `Union type has ${unionCount} members, which exceeds the maximum of ${maxUnionSize}. Consider refactoring into a more structured type or using a discriminated union.`,
            loc: location,
          })
        }
      },
    }
  },
}

export default maxUnionSizeRule
