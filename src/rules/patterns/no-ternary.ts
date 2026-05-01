/**
 * @module rules/patterns/no-ternary
 * Disallows ternary operators.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noTernaryRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ConditionalExpression') return

        context.report({
          loc: extractLocation(n),
          message: 'Ternary operator is not allowed. Use if-else statements instead.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow ternary operators',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-ternary',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noTernaryRule
