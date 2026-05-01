/**
 * @module rules/patterns/strict-bool-expressions
 * Disallows non-boolean values in boolean contexts.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const strictBoolExpressionsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      IfStatement(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'IfStatement') return

        const test = (n as { test?: unknown }).test
        const testNode = toASTNode(test)
        if (!testNode) return

        const testType = testNode.type as string
        if (
          testType === 'Literal' ||
          testType === 'BinaryExpression' ||
          testType === 'LogicalExpression' ||
          testType === 'UnaryExpression' ||
          testType === 'CallExpression' ||
          testType === 'BooleanLiteral'
        ) return

        context.report({
          loc: extractLocation(testNode),
          message: 'Use explicit boolean comparison in condition.',
          node: testNode,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow non-boolean values in boolean contexts',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/strict-bool-expressions',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default strictBoolExpressionsRule
