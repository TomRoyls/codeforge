import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface MaxUnionSizeOptions {
  readonly max?: number
}

function countUnionTypes(node: unknown): number {
  const n = toASTNode(node)
  if (!n || n.type !== 'TSUnionType') return 0

  const types = n.types as undefined | unknown[]
  if (!Array.isArray(types)) return 0

  return types.length
}

export const maxUnionSizeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<MaxUnionSizeOptions>(context.config.options, { max: 5 })

    const maxUnionSize = options.max ?? 5

    return {
      TSUnionType(node: unknown): void {
        const unionCount = countUnionTypes(node)

        if (unionCount > maxUnionSize) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: `Union type has ${unionCount} members, which exceeds the maximum of ${maxUnionSize}. Consider refactoring into a more structured type or using a discriminated union.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Enforce a maximum number of types in a union type. Large unions can indicate poor type design and make code harder to understand.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/max-union-size',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          max: {
            default: 5,
            minimum: 1,
            type: 'number',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default maxUnionSizeRule
