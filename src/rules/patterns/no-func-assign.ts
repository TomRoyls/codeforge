import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isAssignmentExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'AssignmentExpression'
}

function isFunctionExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression'
}

export const noFuncAssignRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description: 'Disallow reassigning function declarations.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      AssignmentExpression(node: unknown): void {
        if (!isAssignmentExpression(node)) return
        const n = node as Record<string, unknown>
        if (n.right && isFunctionExpression(n.right)) {
          context.report({
            message: 'Reassigning function declaration is not allowed.',
            loc: extractLocation(node),
          })
        }
      },
    }
  },
}
export default noFuncAssignRule
