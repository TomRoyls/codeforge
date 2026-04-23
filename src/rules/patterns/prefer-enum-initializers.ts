import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

function getEnumMemberName(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return 'unknown'
  }

  const n = node as Record<string, unknown>
  const id = n.id as Record<string, unknown> | undefined

  if (!id) {
    return 'unknown'
  }

  if (id.type === 'Identifier' && typeof id.name === 'string') {
    return id.name
  }

  if (id.type === 'Literal' && typeof id.value === 'string') {
    return id.value
  }

  return 'unknown'
}

export const preferEnumInitializersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSEnumMember(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const {initializer} = n

        // If there's no initializer, report the issue
        if (!initializer) {
          const memberName = getEnumMemberName(node)
          const location = extractLocation(node)

          context.report({
            loc: location,
            message: `Enum member '${memberName}' should have an explicit value.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Require all enum members to have explicit values. Explicit values make the code more predictable and prevent accidental value changes when members are added or reordered.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-enum-initializers',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferEnumInitializersRule
