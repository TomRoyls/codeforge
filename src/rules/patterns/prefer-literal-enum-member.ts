import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

const ALLOWED_UNARY_OPERATORS = ['-', '+', '~', '!'] as const

function isLiteralLike(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const type = n.type as string

  if (type === 'Literal' || type === 'BigIntLiteral') {
    return true
  }

  if (type === 'TemplateLiteral') {
    const expressions = n.expressions as unknown[] | undefined
    return !expressions || expressions.length === 0
  }

  if (type === 'UnaryExpression') {
    const operator = n.operator as string | undefined
    if (
      operator &&
      ALLOWED_UNARY_OPERATORS.includes(operator as (typeof ALLOWED_UNARY_OPERATORS)[number])
    ) {
      return isLiteralLike(n.argument)
    }
  }

  if (type === 'ParenthesizedExpression') {
    return isLiteralLike(n.expression)
  }

  return false
}

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

export const preferLiteralEnumMemberRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Require enum members to be literal values. Computed values in enums can lead to unpredictable behavior and reduce type safety.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-literal-enum-member',
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

        if (!initializer) {
          return
        }

        if (isLiteralLike(initializer)) {
          return
        }

        const memberName = getEnumMemberName(node)
        const location = extractLocation(node)

        context.report({
          message: `Enum member '${memberName}' should have a literal value instead of a computed expression.`,
          loc: location,
        })
      },
    }
  },
}

export default preferLiteralEnumMemberRule
