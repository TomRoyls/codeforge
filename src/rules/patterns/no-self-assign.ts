import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { isIdentifier, isMemberExpression, toASTNode } from '../../utils/ast-helpers.js'

function areNodesEqual(left: unknown, right: unknown): boolean {
  const l = toASTNode(left)
  const r = toASTNode(right)
  if (!l || !r || l.type !== r.type) return false
  if (isIdentifier(left)) return l.name === r.name
  if (isMemberExpression(left) && isMemberExpression(right)) {
    return areNodesEqual(l.object, r.object) && areNodesEqual(l.property, r.property)
  }

  return false
}

export const noSelfAssignRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'AssignmentExpression') return
        if (areNodesEqual(n.left, n.right)) {
          context.report({
            loc: extractLocation(node),
            message: 'Self assignment has no effect.',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow assignments where both sides are exactly the same.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noSelfAssignRule
