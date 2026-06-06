import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function checkTest(test: unknown, context: RuleContext): void {
  if (test && toASTNode(test)?.type === 'AssignmentExpression') {
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
        const n = toASTNode(node)
        if (n?.type !== 'IfStatement') return
        checkTest(n.test, context)
      },
      WhileStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'WhileStatement') return
        checkTest(n.test, context)
      },
      DoWhileStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'DoWhileStatement') return
        checkTest(n.test, context)
      },
      ForStatement(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ForStatement') return
        checkTest(n.test, context)
      },
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ConditionalExpression') return
        checkTest(n.test, context)
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow assignment operators in conditional expressions.',
      recommended: true,
      url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/patterns/no-cond-assign.ts',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}
export default noCondAssignRule
