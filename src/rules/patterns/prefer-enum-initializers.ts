import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

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
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require all enum members to have explicit values. Explicit values make the code more predictable and prevent accidental value changes when members are added or reordered.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-enum-initializers',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      TSEnumMember(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }

        const n = node as Record<string, unknown>
        const initializer = n.initializer

        // If there's no initializer, report the issue
        if (!initializer) {
          const memberName = getEnumMemberName(node)
          const location = extractLocation(node)

          context.report({
            message: `Enum member '${memberName}' should have an explicit value.`,
            loc: location,
          })
        }
      },
    }
  },
}

export default preferEnumInitializersRule
