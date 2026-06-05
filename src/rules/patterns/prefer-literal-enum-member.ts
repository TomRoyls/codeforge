import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const ALLOWED_UNARY_OPERATORS = ['-', '+', '~', '!'] as const

function isLiteralLike(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  const {type} = n

  if (type === 'Literal' || type === 'BigIntLiteral') return true

  if (type === 'TemplateLiteral') {
    const {expressions} = n
    return !expressions || expressions.length === 0
  }

  if (type === 'UnaryExpression') {
    const {operator} = n
    if (
      operator &&
      ALLOWED_UNARY_OPERATORS.includes(operator as (typeof ALLOWED_UNARY_OPERATORS)[number])
    ) {
      return isLiteralLike(n.argument)
    }
  }

  if (type === 'ParenthesizedExpression' || type === 'SequenceExpression') {
    return isLiteralLike(n.expression)
  }

  return false
}

function getEnumMemberName(node: unknown): string {
  const n = toASTNode(node)
  const id = toASTNode(n?.id)
  if (!id) return 'unknown'

  if (id.type === 'Identifier' && typeof id.name === 'string') return id.name
  if (id.type === 'Literal' && typeof id.value === 'string') return id.value

  return 'unknown'
}

export const preferLiteralEnumMemberRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSEnumMember(node: unknown): void {
        const n = toASTNode(node)
        const init = n?.init ?? n?.initializer
        if (!init) return

        if (isLiteralLike(init)) return

        const memberName = getEnumMemberName(node)
        const location = extractLocation(node)

        context.report({
          loc: location,
          message: `Enum member '${memberName}' should have a literal value instead of a computed expression.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Require enum members to be literal values. Computed values in enums can lead to unpredictable behavior and reduce type safety.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-literal-enum-member',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferLiteralEnumMemberRule
