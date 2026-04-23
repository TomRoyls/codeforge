import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

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
      loc: extractLocation(test),
      message: 'Expected a conditional expression and instead saw an assignment.',
    })
  }
}

export const noCondAssignRule: RuleDefinition = {
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
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow assignment operators in conditional expressions.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}
export default noCondAssignRule
