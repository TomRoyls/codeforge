import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noUnsafeOptionalChainingRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      NewExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'NewExpression') return
        if (toASTNode(n.callee)?.type === 'ChainExpression') {
          context.report({
            loc: extractLocation(node),
            message: 'Optional chaining cannot appear in a new expression.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow use of optional chaining where undefined is not allowed.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUnsafeOptionalChainingRule
