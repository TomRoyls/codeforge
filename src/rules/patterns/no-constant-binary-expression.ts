import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isUselessOperator(left: unknown, operator: string): boolean {
  const l = toASTNode(left)
  if (l?.type === 'RegExpLiteral' && (operator === '||' || operator === '??')) return true

  if (l?.type === 'Literal' || l?.type === 'BooleanLiteral') {
    if (operator === '||' && l.value) return true
    if (operator === '??' && l.value !== null && l.value !== undefined) return true
  }

  if (operator === '&&' && (l?.type === 'Literal' || l?.type === 'BooleanLiteral') && !l.value && l.value !== 0 && l.value !== '') return true

  return false
}

export const noConstantBinaryExpressionRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'BinaryExpression') return
        const {operator} = n

        if (operator && isUselessOperator(n.left, operator)) {
          context.report({
            loc: extractLocation(node),
            message: 'Expression reduces to the left operand and has no effect.',
          })
        }
      },
      LogicalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'LogicalExpression') return
        const {operator} = n

        if (operator && isUselessOperator(n.left, operator)) {
          context.report({
            loc: extractLocation(node),
            message: 'Expression reduces to the left operand and has no effect.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow expressions where the operation does not affect the value.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noConstantBinaryExpressionRule
