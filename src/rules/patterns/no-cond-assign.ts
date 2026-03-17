import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

function isIfStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'IfStatement'
}
function isWhileStatement(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'WhileStatement'
}
function isAssignmentExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return n.type === 'AssignmentExpression'
}
function checkTest(test: unknown, context: RuleContext): void {
  if (test && isAssignmentExpression(test)) {
    context.report({
      message: 'Expected a conditional expression and instead saw an assignment.',
      loc: extractLocation(test),
    })
  }
}
export const noCondAssignRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description: 'Disallow assignment operators in conditional expressions.',
      category: 'patterns',
      recommended: true,
    },
    schema: [],
    fixable: undefined,
  },
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        if (!isIfStatement(node)) return
        const n = node as Record<string, unknown>
        checkTest(n.test, context)
      },
      WhileStatement(node: unknown): void {
        if (!isWhileStatement(node)) return
        const n = node as Record<string, unknown>
        checkTest(n.test, context)
      },
    }
  },
}
export default noCondAssignRule
