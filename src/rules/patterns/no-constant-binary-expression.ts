import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'BinaryExpression'
}

function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Literal'
}

function isUselessOperator(left: unknown, operator: string): boolean {
  if (operator === '||' || operator === '??') {
    if (isLiteral(left)) {
      const l = left as Record<string, unknown>
      if (operator === '||' && l.value) return true
      if (operator === '??' && l.value !== null && l.value !== undefined) return true
    }
  }
  if (operator === '&&') {
    if (isLiteral(left)) {
      const l = left as Record<string, unknown>
      if (!l.value && l.value !== 0 && l.value !== '') return true
    }
  }
  return false
}

export const noConstantBinaryExpressionRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow expressions where the operation does not affect the value.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      BinaryExpression(node: unknown): void {
        if (!isBinaryExpression(node)) return
        const n = node as Record<string, unknown>
        const operator = n.operator as string

        if (isUselessOperator(n.left, operator)) {
          context.report({
            message: 'Expression reduces to the left operand and has no effect.',
            loc: extractLocation(node),
          })
        }
      },
      LogicalExpression(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.type !== 'LogicalExpression') return
        const operator = n.operator as string

        if (isUselessOperator(n.left, operator)) {
          context.report({
            message: 'Expression reduces to the left operand and has no effect.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noConstantBinaryExpressionRule
