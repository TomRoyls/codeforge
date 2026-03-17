import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isChainExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'ChainExpression'
}

function isNewExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'NewExpression'
}

export const noUnsafeOptionalChainingRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow use of optional chaining where undefined is not allowed.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        if (!isNewExpression(node)) return
        const n = node as Record<string, unknown>
        if (isChainExpression(n.callee)) {
          context.report({
            message: 'Optional chaining cannot appear in a new expression.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noUnsafeOptionalChainingRule
