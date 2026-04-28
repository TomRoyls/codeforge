import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noFuncAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'AssignmentExpression') return
        const right = toASTNode(n.right)
        if (right && (right.type === 'FunctionExpression' || right.type === 'ArrowFunctionExpression')) {
          context.report({
            loc: extractLocation(node),
            message: 'Reassigning function declaration is not allowed.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow reassigning function declarations.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noFuncAssignRule
