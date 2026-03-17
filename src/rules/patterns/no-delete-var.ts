import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isUnaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'UnaryExpression'
}

function isIdentifier(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'Identifier'
}

export const noDeleteVarRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow deleting variables.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      UnaryExpression(node: unknown): void {
        if (!isUnaryExpression(node)) return
        const n = node as Record<string, unknown>
        if (n.operator === 'delete' && isIdentifier(n.argument)) {
          context.report({
            message: 'Variables should not be deleted.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noDeleteVarRule
