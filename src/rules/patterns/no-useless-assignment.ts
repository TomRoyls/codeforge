import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { type ASTNode, toASTNode } from '../../utils/ast-helpers.js'

function isAssignmentExpression(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  return n.type === 'AssignmentExpression'
}

export const noUselessAssignmentRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const lastValues = new Map<string, unknown>()

    return {
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) return
        const n = toASTNode(node) as ASTNode
        const leftNode = toASTNode(n.left)
        if (leftNode?.type !== 'Identifier' || !leftNode.name) return
        const leftName = leftNode.name

        const rightNode = toASTNode(n.right)
        const rightValue = rightNode?.type === 'Literal' ? rightNode.value : null

        if (lastValues.has(leftName)) {
          const lastValue = lastValues.get(leftName)
          if (rightValue !== null && lastValue === rightValue) {
            context.report({
              loc: extractLocation(node),
              message: `Redundant assignment to '${leftName}' with same value.`,
            })
          }
        }

        lastValues.set(leftName, rightValue)
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow redundant assignments.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-useless-assignment.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}
export default noUselessAssignmentRule
