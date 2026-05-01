/**
 * @module rules/patterns/no-extra-parens
 * Disallows unnecessary parentheses around expressions.
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

export const noExtraParensRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ParenthesizedExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ParenthesizedExpression') return

        const inner = (n as { expression?: unknown }).expression
        if (!inner || typeof inner !== 'object') return

        const innerNode = inner as Record<string, unknown>

        if (
          innerNode.type === 'Identifier' ||
          innerNode.type === 'Literal' ||
          innerNode.type === 'MemberExpression' ||
          innerNode.type === 'CallExpression' ||
          innerNode.type === 'ParenthesizedExpression'
        ) {
          return
        }

        context.report({
          loc: extractLocation(n),
          message: 'Unnecessary parentheses around expression.',
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow unnecessary parentheses',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-extra-parens',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noExtraParensRule
